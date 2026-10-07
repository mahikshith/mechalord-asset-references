import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {BakedMechCrowd,bakeModel} from './baked-mech-crowd';

/** Iron Legion hero machines, mk II. Kit-bashed from the CC0 Quaternius Sci-Fi
 * Essentials parts (assets/originals/quaternius-scifi-essentials) into complete
 * bodies, in an orange + warm-white livery with cyan optics:
 *  - Havoc: Trilobite strider legs and disc chassis, QuadShell armoured torso,
 *    eye-sensor head and twin shoulder railguns.
 *  - Sentinel: QuadShell walker carrying an eye-sensor head and a dorsal rifle.
 *  - Wisp: hovering eye-drone with a halo ring, side pods and thruster glow.
 * Every part is animated by the donor rig, then baked into instanced crowds
 * (one per texture set). Presentation only. */
export type HeroMech='havoc'|'sentinel'|'wisp';
const loader=new GLTFLoader();
const GUN_YAW=+(globalThis.location?new URLSearchParams(location.search).get('gunyaw')??'0':'0');
const cache=new Map<string,Promise<any>>();
const load=(base:string,f:string)=>{const k=base+f;if(!cache.has(k))cache.set(k,loader.loadAsync(base+f+'.gltf'));return cache.get(k)!;};

/** Orange + warm white: light neutrals -> warm white, mid neutrals -> orange, darks -> charcoal, accents -> cyan. */
export function orangeLivery(image:CanvasImageSource&{width:number;height:number},inverted=false){
 const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const g=c.getContext('2d',{willReadFrequently:true})!;g.drawImage(image,0,0);
 const d=g.getImageData(0,0,c.width,c.height),p=d.data,col=new T.Color(),hsl={h:0,s:0,l:0};
 for(let i=0;i<p.length;i+=4){col.setRGB(p[i]/255,p[i+1]/255,p[i+2]/255);col.getHSL(hsl);const h=hsl.h*360;
  if(hsl.s>.35&&h>=25&&h<=75)col.setHSL(.52,.9,Math.min(.6,hsl.l*1.1));                      // yellow accents -> cyan optics/lights
  else if(hsl.s<.25&&hsl.l>=.58){if(inverted)col.setHSL(.065,.85,Math.min(.5,hsl.l*.6));else col.setHSL(.09,.14,Math.min(.74,hsl.l*.84));} // light panels: matte warm white, or orange shells for top-down readability
  else if(hsl.s<.25&&hsl.l>=.3){if(inverted)col.setHSL(.09,.12,Math.min(.7,hsl.l*1.1));else col.setHSL(.065,.88,Math.min(.56,hsl.l*.95+.06));} // mid panels: signal orange, or warm white
  else if(hsl.s<.25)col.setHSL(.6,.06,hsl.l*.9);                                               // darks -> charcoal
  p[i]=col.r*255;p[i+1]=col.g*255;p[i+2]=col.b*255;}
 g.putImageData(d,0,0);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.flipY=false;t.anisotropy=8;return t;
}
const materials=new Map<string,T.MeshStandardMaterial>();const INVERT=true; // orange shells read best from the top-down camera; warm white frames underneath
function livery(src:T.MeshStandardMaterial){const key=src.map!.uuid+(INVERT?':inv':'');if(!materials.has(key)){const m=new T.MeshStandardMaterial({map:orangeLivery(src.map!.image,INVERT),normalMap:src.normalMap,roughnessMap:src.roughnessMap,metalnessMap:src.metalnessMap,metalness:.25,roughness:1,envMapIntensity:.3,emissive:new T.Color(0x05121a)});m.userData.minRoughness=.62;materials.set(key,m);}return materials.get(key)!;}

/** Freeze a (skinned) donor mesh into a static mesh in its root space at rest pose. */
function freeze(root:T.Object3D,name:string){root.updateMatrixWorld(true);const src=root.getObjectByName(name) as T.Mesh;const g=src.geometry.clone(),P=g.getAttribute('position'),v=new T.Vector3();
 for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i);if((src as T.SkinnedMesh).isSkinnedMesh)(src as T.SkinnedMesh).applyBoneTransform(i,v);v.applyMatrix4(src.matrixWorld);P.setXYZ(i,v.x,v.y,v.z);}
 g.deleteAttribute('skinIndex');g.deleteAttribute('skinWeight');g.computeVertexNormals();g.computeBoundingBox();const m=new T.Mesh(g,livery(src.material as T.MeshStandardMaterial));return m;}
/** Attach a part to a bone at a world-space spot with a world-space size, upright. */
function mount(bone:T.Object3D,part:T.Object3D,at:T.Vector3,scale:number,yaw=0,pitch=0){bone.updateWorldMatrix(true,false);const ws=bone.getWorldScale(new T.Vector3()),wq=bone.getWorldQuaternion(new T.Quaternion());
 part.position.copy(bone.worldToLocal(at.clone()));part.quaternion.copy(wq.invert()).multiply(new T.Quaternion().setFromEuler(new T.Euler(pitch,yaw,0)));part.scale.setScalar(scale/ws.x);bone.add(part);}
const centered=(m:T.Mesh)=>{const b=m.geometry.boundingBox!,c=b.getCenter(new T.Vector3());m.geometry.translate(-c.x,-b.min.y,-c.z);m.geometry.computeBoundingBox();return m;};
const size=(m:T.Mesh)=>m.geometry.boundingBox!.getSize(new T.Vector3());

export async function buildHeroMech(kind:HeroMech,base='herobots/'){
 const [tri,quad,eye,sniper,rifle]=await Promise.all(['Enemy_Trilobite','Enemy_QuadShell','Enemy_EyeDrone','Gun_Sniper','Gun_Rifle'].map(f=>load(base,f)));
 const donor=(g:any)=>{const s=(g.scene as T.Object3D).clone(true);return s;};
 let model:T.Object3D,animations:T.AnimationClip[],height:number;
 const eyeHead=()=>centered(freeze(donor(eye),'Enemies_EyeDrone'));
 if(kind==='havoc'){
  const {clone}=await import('three/addons/utils/SkeletonUtils.js');model=clone(tri.scene);animations=tri.animations;height=2.4;
  model.traverse((o:any)=>{if(o.isMesh){o.material=livery(o.material);o.castShadow=true;}});
  const b0=new T.Box3().setFromObject(model),k=height/(b0.max.y-b0.min.y);model.scale.setScalar(k);model.position.y=-b0.min.y*k;model.updateMatrixWorld(true);
  const box=new T.Box3().setFromObject(model),w=box.max.x-box.min.x,top=box.max.y,body=model.getObjectByName('Body')!;
  const torso=centered(freeze(donor(quad),'QuadShell_Body'));const ts=size(torso);mount(body,torso,new T.Vector3(0,top-.14,-.02),w*.66/ts.x);
  // Clean silhouette: the armoured twin-cannon turret is the head; no stacked parts.
 }else if(kind==='sentinel'){
  const {clone}=await import('three/addons/utils/SkeletonUtils.js');model=clone(quad.scene);animations=quad.animations;height=1.25;
  model.traverse((o:any)=>{if(o.isMesh){o.material=livery(o.material);o.castShadow=true;}});
  const b0=new T.Box3().setFromObject(model),k=height/(b0.max.y-b0.min.y);model.scale.setScalar(k);model.position.y=-b0.min.y*k;model.updateMatrixWorld(true);
  const box=new T.Box3().setFromObject(model),w=box.max.x-box.min.x,top=box.max.y,body=model.getObjectByName('Body')!;
  const head=eyeHead();const hs=size(head);mount(body,head,new T.Vector3(0,top-.08,.12),w*.34/hs.x);
  const gun=centered(freeze(donor(rifle),'Gun_Rifle'));const gs=size(gun);mount(body,gun,new T.Vector3(0,top+.04,-.05),1.0/Math.max(gs.x,gs.z),GUN_YAW+(gs.x>gs.z?Math.PI/2:0));
 }else{
  const {clone}=await import('three/addons/utils/SkeletonUtils.js');model=clone(eye.scene);animations=eye.animations;height=.85;
  model.traverse((o:any)=>{if(o.isMesh){o.material=livery(o.material);o.castShadow=true;}});
  const b0=new T.Box3().setFromObject(model),k=height/(b0.max.y-b0.min.y);model.scale.setScalar(k);model.position.y=-b0.min.y*k;model.updateMatrixWorld(true);
  const box=new T.Box3().setFromObject(model),w=box.max.x-box.min.x,root=model.getObjectByName('Root')??model.children[0];
  // Halo stabiliser ring + two side pods (rifles) make it a proper little gunship.
  const ring=new T.Mesh(new T.TorusGeometry(.5,.035,8,40).rotateX(Math.PI/2),livery((eye.scene.getObjectByName('Enemies_EyeDrone') as T.Mesh).material as T.MeshStandardMaterial));ring.geometry.setAttribute('uv',new T.BufferAttribute(new Float32Array(ring.geometry.getAttribute('position').count*2).fill(.12),2));
  mount(root,ring,new T.Vector3(0,height*.5,0),w*1.35/1);
  if(false)for(const s of [-1,1]){const pod=centered(freeze(donor(rifle),'Gun_Rifle'));const gs=size(pod);mount(root,pod,new T.Vector3(s*w*.66,height*.38,.05),.8/Math.max(gs.x,gs.z),GUN_YAW+(gs.x>gs.z?Math.PI/2:0));}
 }
 return {model,animations,height};
}

/** One baked crowd per texture set, driven together. */
export class HeroMechCrowd {
 private parts:BakedMechCrowd[]=[];
 static async create(scene:T.Scene,kind:HeroMech,capacity:number,base='herobots/'){
  const c=new HeroMechCrowd();const {model,animations}=await buildHeroMech(kind,base);const clip=(n:string)=>animations.find(a=>a.name===n)??animations[0];
  const list=kind==='wisp'?[{clip:clip('Idle'),frames:20},{clip:clip('Look'),frames:20},{clip:clip('Attack'),frames:10}]:[{clip:clip('Run'),frames:16},{clip:clip('Idle'),frames:20},{clip:clip('Attack'),frames:8}];
  const mats=new Set<T.Material>();model.traverse((o:any)=>{if(o.isMesh)mats.add(o.material);});
  for(const m of mats)c.parts.push(new BakedMechCrowd(scene,bakeModel(model,list,x=>x.material===m),capacity,(m as T.MeshStandardMaterial).clone()));
  return c;
 }
 begin(){for(const p of this.parts)p.begin();}
 add(x:number,y:number,z:number,yaw:number,scale:number,clip:number,phase:number,flash=0){for(const p of this.parts)p.add(x,y,z,yaw,scale,clip,phase,flash);}
 end(){for(const p of this.parts)p.end();}
}

/** Allied formation renderer: Sentinels form the swarm, a Havoc anchors every
 * eighth slot and Wisps hover over every eighth slot offset by four. Visual only. */
export class HeroSquad {
 ready=false;private sentinel?:HeroMechCrowd;private havoc?:HeroMechCrowd;private wisp?:HeroMechCrowd;private phases=new Map<number,number>();
 async load(scene:T.Scene,base='herobots/'){[this.sentinel,this.havoc,this.wisp]=await Promise.all([HeroMechCrowd.create(scene,'sentinel',64,base),HeroMechCrowd.create(scene,'havoc',10,base),HeroMechCrowd.create(scene,'wisp',10,base)]);this.ready=true;}
 update(units:ReadonlyArray<{index:number,x:number,z:number}>,m:{dt:number,time:number,marching:boolean,strafe:number,held?:boolean,visible?:boolean}){
  if(!this.ready)return;const crowds=[this.sentinel!,this.havoc!,this.wisp!];crowds.forEach(c=>c.begin());
  if(m.visible!==false)for(const u of units){const slot=u.index%8,kind=slot===3?1:slot===7?2:0,rate=kind===2?.5:m.marching?1.25:.35;const p=((this.phases.get(u.index)??(u.index*.618)%1)+(m.held?0:m.dt*rate))%1;this.phases.set(u.index,p);
   const yaw=Math.PI+m.strafe*.23,clip=kind===2?0:m.marching?0:1;
   if(kind===0)crowds[0].add(u.x,0,-u.z,yaw,1.0,clip,p);
   else if(kind===1)crowds[1].add(u.x,0,-u.z,yaw,.68,clip,p);
   else crowds[2].add(u.x,1.25+Math.sin(m.time*2.2+u.index)*.12,-u.z,yaw,.85,0,p);}
  crowds.forEach(c=>c.end());
 }
}
