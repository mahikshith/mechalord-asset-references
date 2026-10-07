import * as T from 'three';
import {createDeckTexture} from './render-quality';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export const CONTINUOUS_ENVIRONMENT_ASSETS=['SuspendedIsland','SpineConnector','SunkenRoute','CitadelBowl','TaperedButtress','PressureVessel','CoolingStack','ArticulatedServiceArm','ReactorBank','CitadelSpire','CableDrum','DistantFoundryWorks','DistantTransferGallery','ReactorBulkhead'] as const;
export const CONTINUOUS_ROUTE=Object.freeze({stormStart:229.4,forgeStart:473.6,arenaStart:732.6,width:9.7,sectionLength:10.8,sections:13,rear:16,far:118});
export type RouteMarkers=Pick<typeof CONTINUOUS_ROUTE,'stormStart'|'forgeStart'|'arenaStart'>;
export type RouteZone=0|1|2;
type Palette={sky:number;ground:number;key:number;fill:number;accent:number;deck:number};
const PALETTES:Palette[]=[
 {sky:0xb7d2d4,ground:0x786f5e,key:0xffe5b8,fill:0x9ed9e6,accent:0x83cdc8,deck:0x344655},
 {sky:0xb8c5d9,ground:0x5c627a,key:0xeee7ff,fill:0x93cede,accent:0xc5afdf,deck:0x354452},
 {sky:0xd6bca4,ground:0x79624e,key:0xffdbab,fill:0xa7d5d2,accent:0xe7b887,deck:0x434b51},
];
const finite=(n:number,fallback=0)=>Number.isFinite(n)?n:fallback;
const smooth=(a:number,b:number,n:number)=>{const t=T.MathUtils.clamp((n-a)/(b-a),0,1);return t*t*(3-2*t);};
export function routeZoneAt(distance:number,markers:RouteMarkers=CONTINUOUS_ROUTE):RouteZone{return distance<markers.stormStart?0:distance<markers.forgeStart?1:2;}
/** Lighting changes gradually as the player crosses a spatial threshold. */
export function continuousRoutePalette(distance:number,markers:RouteMarkers=CONTINUOUS_ROUTE):Palette {
 const d=Math.max(0,finite(distance)),a=smooth(markers.stormStart-24,markers.stormStart+24,d),b=smooth(markers.forgeStart-24,markers.forgeStart+24,d),out={} as Palette;
 for(const key of Object.keys(PALETTES[0]) as (keyof Palette)[])out[key]=new T.Color(PALETTES[0][key]).lerp(new T.Color(PALETTES[1][key]),a).lerp(new T.Color(PALETTES[2][key]),b).getHex();
 return out;
}
export interface ContinuousSection {section:number;distance:number;zone:RouteZone;deck:'SuspendedIsland'|'SunkenRoute';rhythm:number;left:string;right:string;}
const SKY_SIDE=['ArticulatedServiceArm','CableDrum','PressureVessel','CoolingStack','CableDrum','ArticulatedServiceArm'];
const STORM_SIDE=['ReactorBank','CoolingStack','ReactorBank','PressureVessel','ReactorBank','CableDrum'];
const FORGE_SIDE=['CitadelSpire','ArticulatedServiceArm','PressureVessel','CitadelSpire','CoolingStack','ReactorBank'];
export function planContinuousSection(section:number,markers:RouteMarkers=CONTINUOUS_ROUTE):ContinuousSection {
 const index=Math.floor(finite(section)),distance=index*CONTINUOUS_ROUTE.sectionLength,zone=routeZoneAt(distance,markers),rhythm=((index%6)+6)%6,bank=[SKY_SIDE,STORM_SIDE,FORGE_SIDE][zone];
 return {section:index,distance,zone,deck:zone===1?'SunkenRoute':'SuspendedIsland',rhythm,left:bank[rhythm],right:bank[(rhythm+3)%6]};
}
type Template={geometry:T.BufferGeometry;glow:boolean};
type Batch={mesh:T.InstancedMesh;used:number};
type Filter=(x:number,y:number,z:number)=>boolean;
const ARM_PARTS=['base','shoulder','forearm','claw'];
/** Bake exact native surfaces, including their material/vertex colors. Optional
 * clipping only extracts maintenance hatches; original source files stay intact. */
function templates(source:T.Object3D,filter?:Filter,part?:string):Template[]{
 source.updateMatrixWorld(true);const buckets:T.BufferGeometry[][]=[[],[]];
 source.traverse((node:any)=>{
  if(!node.isMesh)return;
  if(part){let owner:T.Object3D|undefined=node;while(owner&&!ARM_PARTS.includes(owner.name))owner=owner.parent??undefined;if(owner?.name!==part)return;}
  const materials:T.MeshStandardMaterial[]=Array.isArray(node.material)?node.material:[node.material];
  const base=node.geometry.index?node.geometry.toNonIndexed():node.geometry.clone();base.applyMatrix4(node.matrixWorld);
  const pos=base.getAttribute('position'),normal=base.getAttribute('normal'),mod=base.getAttribute('color');
  const groups=base.groups.length?base.groups:[{start:0,count:pos.count,materialIndex:0}];
  for(const group of groups){
   const material=materials[group.materialIndex??0]??materials[0],positions:number[]=[],normals:number[]=[],colors:number[]=[],color=material.color??new T.Color(0xffffff);
   for(let i=group.start;i<group.start+group.count;i+=3){
    if(filter&&![0,1,2].every(j=>filter(pos.getX(i+j),pos.getY(i+j),pos.getZ(i+j))))continue;
    for(let j=0;j<3;j++){const n=i+j;positions.push(pos.getX(n),pos.getY(n),pos.getZ(n));normals.push(normal?.getX(n)??0,normal?.getY(n)??1,normal?.getZ(n)??0);colors.push(color.r*(mod?.getX(n)??1),color.g*(mod?.getY(n)??1),color.b*(mod?.getZ(n)??1));}
   }
   if(!positions.length)continue;
   const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
   const emission=Math.max(material.emissive?.r??0,material.emissive?.g??0,material.emissive?.b??0)*(material.emissiveIntensity??0);buckets[emission>.5?1:0].push(geometry);
  }base.dispose();
 });
 return buckets.flatMap((entries,glow)=>{if(!entries.length)return [];const geometry=mergeGeometries(entries,false);if(!geometry)throw new Error('Native environment attributes do not match');entries.forEach(g=>g.dispose());geometry.computeBoundingBox();return [{geometry,glow:glow===1}];});
}

/** One distance-anchored route. Stage is accepted for the shared adapter contract;
 * it never swaps every visible object at a boundary. Geometry belongs to world
 * coordinates, so the next zone approaches through the existing view. */
export class ContinuousRouteEnvironment {
 readonly root=new T.Group();readonly floor:T.Mesh;
 readonly surfaceWidth=CONTINUOUS_ROUTE.width;
 private readonly batches=new Map<string,Batch[]>();
 private readonly bounds=new Map<string,T.Box3>();
 private readonly geometries=new Set<T.BufferGeometry>();
 private readonly body=new T.MeshStandardMaterial({vertexColors:true,roughness:.73,metalness:.24});
 private readonly glow=new T.MeshStandardMaterial({vertexColors:true,roughness:.6,metalness:.12,emissive:0xffffff,emissiveIntensity:.23});
 private readonly deckMaterial=new T.MeshStandardMaterial({color:0x344655,roughness:.86,metalness:.14});
 private readonly floorTexture:T.DataTexture;private readonly deckMap=createDeckTexture();
 private readonly stamp=new T.Object3D();private readonly color=new T.Color();
 private readonly armRoot=new T.Object3D();private readonly shoulder=new T.Object3D();private readonly forearm=new T.Object3D();private readonly claw=new T.Object3D();
 private plans:ContinuousSection[]=[];private markers:RouteMarkers={...CONTINUOUS_ROUTE};private anchor=NaN;private age=0;private ready=false;private disposed=false;private loadPromise?:Promise<void>;
 constructor(private readonly scene:T.Scene){
  this.root.name='IronFront_ContinuousNativeRoute';
  const pixels=new Uint8Array(128*128*4);let seed=1771;for(let i=0;i<pixels.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=215+(seed%22);pixels[i]=pixels[i+1]=pixels[i+2]=v;pixels[i+3]=255;}
  this.floorTexture=new T.DataTexture(pixels,128,128,T.RGBAFormat);this.floorTexture.wrapS=this.floorTexture.wrapT=T.RepeatWrapping;this.floorTexture.repeat.set(2,20);this.floorTexture.needsUpdate=true;this.deckMaterial.roughnessMap=this.floorTexture;this.deckMap.repeat.set(1,(CONTINUOUS_ROUTE.far+CONTINUOUS_ROUTE.rear)/CONTINUOUS_ROUTE.sectionLength);this.deckMaterial.map=this.deckMap;
  const deck=new T.BoxGeometry(this.surfaceWidth,.16,CONTINUOUS_ROUTE.far+CONTINUOUS_ROUTE.rear);this.geometries.add(deck);this.floor=new T.Mesh(deck,this.deckMaterial);this.floor.name='OneCollisionAlignedDeck_y0';this.floor.position.set(0,-.08,(CONTINUOUS_ROUTE.rear-CONTINUOUS_ROUTE.far)*.5);this.floor.receiveShadow=true;this.root.add(this.floor);
  this.armRoot.add(this.shoulder);this.shoulder.position.set(0,2.25,0);this.shoulder.add(this.forearm);this.forearm.position.set(0,0,2.52);this.forearm.add(this.claw);this.claw.position.set(0,1.28,1.3);
  scene.add(this.root);
 }
 setRoute(markers:RouteMarkers):void {if(![markers.stormStart,markers.forgeStart,markers.arenaStart].every(Number.isFinite)||!(markers.stormStart>0&&markers.forgeStart>markers.stormStart&&markers.arenaStart>markers.forgeStart))throw new Error('Route landmarks must be finite and increase');this.markers={...markers};this.anchor=NaN;}
 load(library?:ReadonlyMap<string,T.Object3D>):Promise<void>{return this.loadPromise??=(async()=>{
  const loader=new GLTFLoader();const sources=await Promise.all(CONTINUOUS_ENVIRONMENT_ASSETS.map(async name=>({name,source:library?.get(name)??(await loader.loadAsync(`environment/${name}.glb`)).scene,borrowed:library?.has(name)??false})));
  for(const {name,source,borrowed}of sources){
   if(!this.disposed){
    if(name==='ArticulatedServiceArm'){
     const pivots=[[0,0,0],[0,2.25,0],[0,2.25,2.52],[0,3.53,3.82]];
     ARM_PARTS.forEach((part,i)=>{const batch=templates(source,undefined,part);for(const t of batch)t.geometry.translate(-pivots[i][0],-pivots[i][1],-pivots[i][2]);this.add(name+'_'+part,batch);});
    }else this.add(name,templates(source));
    if(name==='SuspendedIsland'||name==='SunkenRoute')this.add(name+'_Surface',templates(source,(x,y)=>Math.abs(x)<4.5&&y>.0002&&y<.065));
   }
   if(!borrowed){const gs=new Set<T.BufferGeometry>(),ms=new Set<T.Material>(),ts=new Set<T.Texture>();source.traverse((n:any)=>{if(n.isMesh){gs.add(n.geometry);for(const m of Array.isArray(n.material)?n.material:[n.material]){ms.add(m);for(const value of Object.values(m))if((value as T.Texture)?.isTexture)ts.add(value as T.Texture);}}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());ts.forEach(t=>t.dispose());}
  }
  if(!this.disposed){this.ready=true;this.update(0,0,0);}
 })();}
 private add(name:string,items:Template[]):void{
  const entries:Batch[]=[],bounds=new T.Box3();for(const t of items){t.geometry.computeBoundingBox();bounds.union(t.geometry.boundingBox!);this.geometries.add(t.geometry);const mesh=new T.InstancedMesh(t.geometry,t.glow?this.glow:this.body,name==='TaperedButtress'?64:32);mesh.name='Native_'+name+(t.glow?'_energy':'_body');mesh.count=0;mesh.frustumCulled=false;mesh.castShadow=!t.glow;mesh.receiveShadow=true;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);this.root.add(mesh);entries.push({mesh,used:0});}this.batches.set(name,entries);this.bounds.set(name,bounds);
 }
 private emitMatrix(name:string,matrix:T.Matrix4,tint=0xffffff):void {for(const b of this.batches.get(name)??[]){if(b.used>=b.mesh.instanceMatrix.count)throw new Error('Environment pool capacity: '+name);b.mesh.setMatrixAt(b.used,matrix);b.mesh.setColorAt(b.used++,this.color.setHex(tint));}}
 private emit(name:string,x:number,y:number,z:number,sx=1,sy=sx,sz=sx,yaw=0,tint=0xffffff):void {this.stamp.position.set(x,y,z);this.stamp.rotation.set(0,yaw,0);this.stamp.scale.set(sx,sy,sz);this.stamp.updateMatrix();this.emitMatrix(name,this.stamp.matrix,tint);}
 /** Place the full exported bound outside the lanes, including rotated pipes. */
 private outside(name:string,side:number,z:number,scale:number,yaw:number,clearance=5.6,y=0,sy=scale,tint=0xffffff):number {
  this.stamp.position.set(0,0,0);this.stamp.rotation.set(0,yaw,0);this.stamp.scale.set(scale,sy,scale);this.stamp.updateMatrix();const bound=this.bounds.get(name)!.clone().applyMatrix4(this.stamp.matrix),x=side>0?clearance-bound.min.x:-clearance-bound.max.x;this.emit(name,x,y,z,scale,sy,scale,yaw,tint);return x;
 }
 private crane(side:number,z:number,phase:number):void {
  this.armRoot.position.set(side*7.1,0,z);this.armRoot.rotation.y=side*Math.PI/2;this.armRoot.scale.setScalar(.72);
  this.shoulder.rotation.x=.12*Math.sin(this.age*.6+phase);this.forearm.rotation.x=.13*Math.sin(this.age*.6+phase+1.3);this.claw.rotation.z=.16*Math.sin(this.age*.8+phase);this.armRoot.updateMatrixWorld(true);
  for(const [i,node]of [this.armRoot,this.shoulder,this.forearm,this.claw].entries())this.emitMatrix('ArticulatedServiceArm_'+ARM_PARTS[i],node.matrixWorld);
  this.emit('TaperedButtress',side*7.1,.05,z,1.10,1.7,1.15,side<0?Math.PI:0);
 }
 update(travelDistance:number,_stage:number,dt:number):void {
  if(!this.ready||this.disposed)return;
  const distance=T.MathUtils.clamp(finite(travelDistance),0,this.markers.arenaStart),delta=T.MathUtils.clamp(finite(dt),0,.1);this.age+=delta;
  const anchor=Math.floor(distance/CONTINUOUS_ROUTE.sectionLength)-1;if(anchor!==this.anchor){this.anchor=anchor;this.plans=Array.from({length:CONTINUOUS_ROUTE.sections},(_,i)=>planContinuousSection(anchor+i,this.markers));}
  for(const entries of this.batches.values())for(const b of entries)b.used=0;
  this.deckMaterial.color.setHex(continuousRoutePalette(distance,this.markers).deck);this.floorTexture.offset.y=distance/6.7;this.deckMap.offset.y=distance/CONTINUOUS_ROUTE.sectionLength;
  for(const plan of this.plans){
   const z=distance-plan.distance,zone=plan.zone,phase=plan.section*.73,tint=zone===1?0xd0c8e8:zone===2?0xffddbc:0xe2ffff;
   if(plan.distance<this.markers.arenaStart-18){
    // Exactly one broad y=0 surface. Native cap sits below it; only source hatches sit above it.
    this.emit(plan.deck,0,-.055,z,1.08,1,plan.deck==='SunkenRoute'?.981:1.032,0,tint);
    this.emit(plan.deck+'_Surface',0,.002,z,1.04,1,plan.deck==='SunkenRoute'?.981:1.032,0,tint);
    if(zone===0){this.emit('SpineConnector',0,-.08,z-5.4,1.50,1,1.10,0,tint);for(const side of [-1,1])this.emit('TaperedButtress',side*5.9,-.14,z+side*1.8,1.05,2.2,1.12,side<0?Math.PI:0);}
    if(zone===2&&plan.rhythm%2===0){for(const side of [-1,1])this.emit('TaperedButtress',side*6.2,.1,z+side*.7,1.25,1.65,1.5,side<0?Math.PI:0);}
   }
   if(plan.distance>=this.markers.arenaStart-18)continue;
   // Quiet sections separate equipment groups; no symmetric fence of identical props.
   if(plan.rhythm!==2 || zone===1){
    for(const [index,asset]of [plan.left,plan.right].entries()){
     const side=index?1:-1,offset=index?2.0:-1.5;if(zone===0&&index===1&&plan.rhythm===4)continue;
     if(asset==='ArticulatedServiceArm'){this.crane(side,z+offset,phase);continue;}
     const scale=asset==='CitadelSpire'?.56:asset==='ReactorBank'?.64:asset==='CableDrum'?.9:.72;
     const yaw=asset==='ReactorBank'?(side>0?Math.PI:0):side>0?-.18:Math.PI+.12;
     const x=this.outside(asset,side,z+offset,scale,yaw,zone===1?5.35:5.85,0,scale,tint);
     if(zone!==1&&asset!=='CitadelSpire')this.emit('TaperedButtress',x,.08,z+offset,1.12,1.6,1.18,side<0?Math.PI:0);
    }
   }
   // Trench outer banks are architectural retaining walls, absent from the sky route.
   if(zone===1&&plan.rhythm%2===0){this.outside('ReactorBank',plan.rhythm===0?-1:1,z-4,.78,plan.rhythm===0?0:Math.PI,8.3,-.35,.84,0xc3beda);}
   if(zone===2&&plan.distance>650&&plan.rhythm%2===1){for(const side of[-1,1])this.outside('CitadelSpire',side,z-1,.74,side*.15,9.3,0,.88,0xffd8a7);}
   // Landmarks are attached to absolute route coordinates, not reset per chapter.
   if(plan.section%4===0){const side=plan.section%8===0?-1:1;this.outside('DistantFoundryWorks',side,z-8,.92,side*.17,13.4,-7,zone===2?1.10:.83,tint);}
   if(plan.section%9===4){this.outside('DistantTransferGallery',plan.section%2?1:-1,z-5,.80,Math.PI/2,13.2,-1.4,.85,tint);}
  }
  const arenaZ=distance-this.markers.arenaStart-8;
  if(arenaZ>-120){
   this.emit('CitadelBowl',0,-.065,arenaZ,1.02,1,1.08,0,0xffe0bc);
   // Rear wall stays beyond the boss and its projectiles; it never advances through the legion.
   this.emit('ReactorBulkhead',0,-.05,arenaZ-37,1,1,1,Math.PI,0xffddb2);
   for(const side of[-1,1]){this.outside('CitadelSpire',side,arenaZ-17,.90,side*.13,10.4,0,1.06,0xffd3a0);this.outside('PressureVessel',side,arenaZ-1,.9,side*.3,11.1,-.15,.96,0xffe1c4);}
  }
  for(const entries of this.batches.values())for(const b of entries){b.mesh.count=b.used;b.mesh.visible=b.used>0;b.mesh.instanceMatrix.needsUpdate=true;if(b.mesh.instanceColor)b.mesh.instanceColor.needsUpdate=true;}
 }
 get diagnostics(){let batches=0,instances=0,triangles=0;for(const es of this.batches.values())for(const b of es)if(b.used){batches++;instances+=b.used;triangles+=b.mesh.geometry.getAttribute('position').count/3*b.used;}return {ready:this.ready,sections:this.plans.map(p=>({...p})),batches,instances,triangles,geometries:this.geometries.size,maximumCapacity:64};}
 dispose():void {if(this.disposed)return;this.disposed=true;this.root.removeFromParent();for(const es of this.batches.values())for(const b of es)b.mesh.dispose();this.geometries.forEach(g=>g.dispose());this.body.dispose();this.glow.dispose();this.deckMaterial.dispose();this.floorTexture.dispose();this.deckMap.dispose();this.batches.clear();this.bounds.clear();this.geometries.clear();this.root.clear();this.ready=false;}
}
