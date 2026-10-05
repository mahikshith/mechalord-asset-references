import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export const REFORGED_ROUTE = Object.freeze({width:11.4,rear:10,far:105,sectionLength:10.8,sections:11});
export const REFORGED_LEVELS = ['SkyforgeViaduct','ReactorTrench','CoreCitadel'] as const;
const GOALS = [203.5,222,240.5];
const SKY = [0xa9c7d6,0xb6cbd0,0xb5c8e0];
const SOURCES = ['SuspendedIsland','SpineConnector','SunkenRoute','CitadelBowl','TaperedButtress','PressureVessel','CoolingStack','ArticulatedServiceArm','ReactorBank','CitadelSpire','CableDrum','DistantFoundryWorks','DistantTransferGallery','ReactorBulkhead'] as const;
const SIDE_RHYTHM = ['PressureVessel','CoolingStack','CableDrum','ArticulatedServiceArm','ReactorBank','CoolingStack','PressureVessel','CableDrum'] as const;
type SidePlan={asset:string,x:number,offset:number,scale:number,yaw:number};
export interface ReforgedSectionPlan {section:number;level:number;deck:string;sides:SidePlan[];}
const finite=(n:number,fallback=0)=>Number.isFinite(n)?n:fallback;
const levelIndex=(n:number)=>Math.max(0,Math.min(2,Math.floor(finite(n))));
/** Art decisions happen only when a pooled section changes identity. */
export function planReforgedSection(section:number,level:number):ReforgedSectionPlan {
 const index=Math.floor(finite(section)),stage=levelIndex(level),phase=((index%8)+8)%8;
 const seed=(Math.imul(index+19,0x45d9f3b)^Math.imul(stage+1,0x119de1f3))>>>0;
 const left=stage===2&&phase%3===0?'CitadelSpire':SIDE_RHYTHM[(phase+stage*2)%8],right=stage===2&&phase%3===2?'CitadelSpire':SIDE_RHYTHM[(phase+3+stage)%8];
 return {section:index,level:stage,deck:stage===1?'SunkenRoute':'SuspendedIsland',sides:[
  {asset:left,x:-8.3-(seed%3)*.38,offset:-1.4,scale:.9+(seed%4)*.09,yaw:-Math.PI/2},
  {asset:right,x:8.45+((seed>>>3)%3)*.4,offset:2.1,scale:.95+((seed>>>5)%4)*.08,yaw:Math.PI/2},
 ]};
}

type Template={geometry:T.BufferGeometry;glow:boolean};
type Batch={mesh:T.InstancedMesh;used:number};
type FloorTriangle=(x:number,y:number,z:number)=>boolean;
/** Merge original native GLB surfaces by body/glow, baking their material colours.
 * All native part transforms are retained in vertex positions. No third-party art.
 */
function nativeTemplates(source:T.Object3D,predicate?:FloorTriangle):Template[] {
 source.updateMatrixWorld(true);const buckets:T.BufferGeometry[][]=[[],[]];
 source.traverse((node:any)=>{
  if(!node.isMesh)return;
  const material=(Array.isArray(node.material)?node.material[0]:node.material) as T.MeshStandardMaterial;
  const base=node.geometry.index?node.geometry.toNonIndexed():node.geometry.clone();base.applyMatrix4(node.matrixWorld);
  const p=base.getAttribute('position'),normal=base.getAttribute('normal'),modulation=base.getAttribute('color');
  const positions:number[]=[],normals:number[]=[],colors:number[]=[];
  const color=material.color??new T.Color(0xffffff);
  for(let i=0;i<p.count;i+=3){
   if(predicate&&!([0,1,2].every(j=>predicate(p.getX(i+j),p.getY(i+j),p.getZ(i+j)))))continue;
   for(let j=0;j<3;j++){const n=i+j;positions.push(p.getX(n),p.getY(n),p.getZ(n));normals.push(normal?.getX(n)??0,normal?.getY(n)??1,normal?.getZ(n)??0);colors.push(color.r*(modulation?.getX(n)??1),color.g*(modulation?.getY(n)??1),color.b*(modulation?.getZ(n)??1));}
  }
  base.dispose();if(!positions.length)return;
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  // glTF folds small body emission into the RGB factor and leaves strength=1.
  // Test effective emitted light, not strength alone, to retain body shadows.
  const emission=material.emissive?Math.max(material.emissive.r,material.emissive.g,material.emissive.b)*material.emissiveIntensity:0;
  buckets[emission>.5?1:0].push(geometry);
 });
 const result:Template[]=[];
 for(let glow=0;glow<2;glow++)if(buckets[glow].length){const geometry=mergeGeometries(buckets[glow],false)!;geometry.computeBoundingBox();buckets[glow].forEach(g=>g.dispose());result.push({geometry,glow:glow===1});}
 return result;
}

/** Render-only native environment. Positive course distance moves scenery +Z;
 * combat remains at hero origin, facing -Z. The route surface is always y=0.
 */
export class ReforgedEnvironment {
 readonly root=new T.Group();
 readonly floor=new T.Group();
 private readonly batches=new Map<string,Batch[]>();
 private readonly geometry=new Set<T.BufferGeometry>();
 private readonly sourceGeometry=new Set<T.BufferGeometry>();
 private readonly sourceMaterials=new Set<T.Material>();
 private readonly sourceTextures=new Set<T.Texture>();
 private readonly body=new T.MeshStandardMaterial({vertexColors:true,roughness:.74,metalness:.16});
 private readonly glow=new T.MeshStandardMaterial({vertexColors:true,roughness:.58,metalness:.05,emissive:0xffffff,emissiveIntensity:.24});
 private readonly dummy=new T.Object3D();
 private readonly backdropColor=new T.Color();
 private readonly previousBackground:T.Color|T.Texture|null;
 private plans:ReforgedSectionPlan[]=[];
 private level=-1;private anchor=NaN;private ready=false;private disposed=false;
 private loadPromise?:Promise<void>;
 constructor(private readonly scene:T.Scene){this.root.name='Mechalord_ReforgedNativeWorld';this.floor.name='NativeContinuousRoute';this.root.add(this.floor);scene.add(this.root);this.previousBackground=scene.background;}
 /** Optional map enables tests to parse the real files directly without HTTP. */
 load(library?:ReadonlyMap<string,T.Object3D>):Promise<void>{
  if(this.loadPromise)return this.loadPromise;
  this.loadPromise=this.loadNative(library);return this.loadPromise;
 }
 private async loadNative(library?:ReadonlyMap<string,T.Object3D>):Promise<void>{
  const loader=new GLTFLoader();
  const sources=await Promise.all(SOURCES.map(async name=>{const object=library?.get(name)??(await loader.loadAsync(`assets/${name}.glb`)).scene;return {name,object};}));
  if(this.disposed){sources.forEach(({object})=>this.releaseSource(object));return;}
  for(const {name,object}of sources){
   this.collectSource(object);
   this.addTemplates(name,nativeTemplates(object));
   if(name==='SuspendedIsland'||name==='SunkenRoute'){
    // Preserve the actual native service-panel frames, latches, bolts and seam
    // tops. Exclude the y=0 cap and outboard rails, rather than lifting a second
    // broad floor onto the continuous support surface.
    const surface=nativeTemplates(object,(x,y)=>Math.abs(x)<4.5&&y>.0002&&y<.065);
    if(!surface.length)throw new Error(`Native surface details missing: ${name}`);
    this.addTemplates(`${name}_Surface`,surface);
   }
   if(name==='SpineConnector'){
    // Its native structural box top is -0.01m; raised hatches are above it.
    // Extract that actual source surface, then widen/lengthen it once. The two
    // bevelled ends lie beyond the entire gameplay window, not between modules.
    const templates=nativeTemplates(object,(_x,y)=>y<=-.005);
    if(!templates.length)throw new Error('Native SpineConnector has no structural floor surface');
    for(const template of templates){this.geometry.add(template.geometry);const mesh=new T.Mesh(template.geometry,template.glow?this.glow:this.body);mesh.name='SpineConnector_ContinuousSupport';mesh.scale.set(12/7,1,135/4.8);mesh.position.set(0,.01,-47.5);mesh.rotation.y=Math.PI;mesh.receiveShadow=true;this.floor.add(mesh);}
   }
  }
  this.ready=true;this.update(0,0,0);
 }
 private addTemplates(name:string,templates:Template[]):void{
  const entries:Batch[]=[];
  for(const template of templates){this.geometry.add(template.geometry);const mesh=new T.InstancedMesh(template.geometry,template.glow?this.glow:this.body,48);mesh.name=`Reforged_${name}_${template.glow?'glow':'body'}`;mesh.count=0;mesh.frustumCulled=false;mesh.castShadow=!template.glow;mesh.receiveShadow=true;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);this.root.add(mesh);entries.push({mesh,used:0});}
  this.batches.set(name,entries);
 }
 private collectSource(source:T.Object3D):void{source.traverse((node:any)=>{if(node.isMesh){this.sourceGeometry.add(node.geometry);for(const material of Array.isArray(node.material)?node.material:[node.material]){this.sourceMaterials.add(material);for(const value of Object.values(material))if(value instanceof T.Texture)this.sourceTextures.add(value);}}});}
 private releaseSource(source:T.Object3D):void{source.traverse((node:any)=>{if(node.isMesh){node.geometry.dispose();for(const material of Array.isArray(node.material)?node.material:[node.material])material.dispose();}});}
 private emit(name:string,x:number,y:number,z:number,sx=1,sy=sx,sz=sx,yaw=Math.PI):void{
  const entries=this.batches.get(name);if(!entries)return;
  this.dummy.position.set(x,y,z);this.dummy.scale.set(sx,sy,sz);this.dummy.rotation.set(0,yaw,0);this.dummy.updateMatrix();
  for(const entry of entries){if(entry.used>=entry.mesh.instanceMatrix.count)throw new Error(`Native pool exhausted: ${name}`);entry.mesh.setMatrixAt(entry.used++,this.dummy.matrix);}
 }
 update(travelDistance:number,level:number,_dt:number):void{
  if(!this.ready||this.disposed)return;
  const distance=Math.max(0,finite(travelDistance)),stage=levelIndex(level),anchor=Math.floor(distance/REFORGED_ROUTE.sectionLength)-1;
  if(stage!==this.level||anchor!==this.anchor){this.plans=Array.from({length:REFORGED_ROUTE.sections},(_,i)=>planReforgedSection(anchor+i,stage));this.anchor=anchor;this.level=stage;this.backdropColor.setHex(SKY[stage]);this.scene.background=this.backdropColor;if(this.scene.fog)this.scene.fog.color.copy(this.backdropColor);}
  for(const entries of this.batches.values())for(const entry of entries)entry.used=0;
  for(const plan of this.plans){
   const z=distance-plan.section*REFORGED_ROUTE.sectionLength;
   // Native top caps are below the one authoritative route surface, avoiding
   // coplanar overlap. The sculpted underside, rim and outboard detail remain.
   this.emit(plan.deck,0,-.045,z,stage===1?1.16:1.2,1,stage===1?.981:1.08);
   this.emit(`${plan.deck}_Surface`,0,.004,z,stage===1?1.16:1.2,1,stage===1?.981:1.08);
   if(stage!==1)this.emit('SpineConnector',0,-.05,z-5.4,1.72,1,1);
   for(const side of plan.sides){
    const yaw=side.asset==='ArticulatedServiceArm'?side.yaw:Math.PI+(side.x<0?.18:-.16);
    this.emit(side.asset,side.x,.08,z+side.offset,side.scale,side.scale,side.scale,yaw);
    this.emit('TaperedButtress',side.x,.18,z+side.offset,1.48,3,1.4,Math.PI);
   }
   if(stage===1&&((plan.section%3)+3)%3===1){this.emit('ReactorBank',-6.8,-.12,z-3.8,1.05,1.23,.74,0);this.emit('ReactorBank',6.8,-.12,z+3.7,1.02,1.35,.72,Math.PI);}
  }
  const remaining=Math.max(0,GOALS[stage]-distance);
  if(remaining<90){const arenaZ=-18-remaining;if(stage===2)this.emit('ReactorBulkhead',0,-.04,arenaZ-19,1.1,1.05,1,0);this.emit('CitadelBowl',0,-.075,arenaZ,1.13,1,1.15);this.emit('CitadelSpire',-12.2,0,arenaZ-10,.95,1.2,.95);this.emit('CitadelSpire',12.8,0,arenaZ-14,1.08,1.38,1.08);}
  // Parallax is mild; these are a real distant industrial layer with deep
  // integrated foundations. No solid arch is added over the foreground route.
  const parallax=(GOALS[stage]-Math.min(distance,GOALS[stage]))*.035;
  this.emit('DistantFoundryWorks',-15.2,-5.2,-65-parallax,1.55,stage===1?1.65:1.45,1.4,Math.PI-.12);
  this.emit('DistantFoundryWorks',16.1,-6.4,-79-parallax,1.32,stage===2?1.58:1.2,1.5,Math.PI+.19);
  this.emit('DistantTransferGallery',0,12.5,-89-parallax,1.55,1.1,1.1,Math.PI-.06);
  for(const entries of this.batches.values())for(const entry of entries){entry.mesh.count=entry.used;entry.mesh.visible=entry.used>0;entry.mesh.instanceMatrix.needsUpdate=true;}
 }
 dispose():void{
  if(this.disposed)return;this.disposed=true;this.scene.remove(this.root);if(this.scene.background===this.backdropColor)this.scene.background=this.previousBackground;
  for(const geometry of this.geometry)geometry.dispose();for(const geometry of this.sourceGeometry)geometry.dispose();for(const material of this.sourceMaterials)material.dispose();for(const texture of this.sourceTextures)texture.dispose();this.body.dispose();this.glow.dispose();this.batches.clear();this.geometry.clear();this.root.clear();
 }
}
