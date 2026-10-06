import * as T from 'three';

// Optional spatial bridge: legacy stages and intro keep their existing presentation.
export type BossRegionID='cannonL'|'cannonR'|'jetL'|'jetR'|'legL'|'legR'|'core';
export interface AuthoritativeBossPose {
 rootX:number;rootY:number;worldZ:number;pitch:number;yaw:number;roll:number;
 arm:ReadonlyArray<{pitch:number;roll:number}>;
 leg:ReadonlyArray<number>;knee:ReadonlyArray<number>;barrel?:ReadonlyArray<number>;poseClock:number;
}
export interface AuthoritativeBossRegion {
 id:BossRegionID;x:number;y:number;z:number;radiusX:number;radiusY:number;radiusZ:number;
 quaternion:readonly[number,number,number,number];hp:number;maxHp:number;vulnerable:boolean;
}
export interface AuthoritativeBossComponent {regionId:BossRegionID;x:number;y:number;z:number;radiusX:number;radiusY:number;radiusZ:number;quaternion:readonly[number,number,number,number];active:boolean;}
export interface AuthoritativeBossImpact {x:number;y:number;z:number;hitRegion:BossRegionID;}
/** Cues and transforms consume simulation data. This adapter never selects targets or damages parts. */
export class BossRigAdapter {
 readonly cues:T.InstancedMesh;
 readonly reactorCue:T.Mesh<T.RingGeometry,T.MeshBasicMaterial>;
 readonly reactorFlash:T.Mesh<T.CircleGeometry,T.MeshBasicMaterial>;
 private joints=new Map<string,{node:T.Object3D;rest:T.Quaternion}>();
 private dummy=new T.Object3D();private euler=new T.Euler();private rotation=new T.Quaternion();
 private forward=new T.Vector3();
 private highlightClock=0;
 private cueColor=new T.Color();
 private flashes=new Map<BossRegionID,number>();
 private regionMaterials=new Map<BossRegionID,{mesh:T.Mesh;original:T.Material|T.Material[];materials:T.MeshStandardMaterial[];base:T.Color[];colors:T.Color[];intensities:number[];hit:T.IUniform[]}[]>();
 private disposed=false;
 constructor(private root:T.Object3D,private scene:T.Scene){
  for(const name of ['Arm_L','Arm_R','Leg_L','Leg_R','Knee_L','Knee_R','Barrel_L','Barrel_R']){const node=root.getObjectByName(name);if(node)this.joints.set(name,{node,rest:node.quaternion.clone()});}
  // Four corners leave the actual armor/weapon face entirely visible. No duplicated HP bars.
  const vertices:number[]=[];
  for(const x of [-1,1])for(const y of [-1,1]){
   const w=.065,h=.27,cx=x*.89,cy=y*.89;
   for(const [px,py,sx,sy] of [[cx-x*h*.5,cy,h,w],[cx,cy-y*h*.5,w,h]]){
    const a=px-sx*.5,b=px+sx*.5,c=py-sy*.5,d=py+sy*.5;
    vertices.push(a,c,0,b,c,0,b,d,0,a,c,0,b,d,0,a,d,0);
   }
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  this.cues=new T.InstancedMesh(geometry,new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.95,side:T.DoubleSide,depthWrite:false,toneMapped:false}),7);
  this.cues.name='AuthoritativeBossPartCues';this.cues.frustumCulled=false;this.cues.count=0;scene.add(this.cues);
  this.reactorCue=new T.Mesh(new T.RingGeometry(.965,1,64),new T.MeshBasicMaterial({color:0xffce80,transparent:true,opacity:.8,side:T.DoubleSide,depthWrite:false,toneMapped:false}));this.reactorCue.name='MeasuredOvalReactorCue';this.reactorCue.visible=false;scene.add(this.reactorCue);
  // A temporary face wash preserves the retained oval reactor and its underlying detail.
  // It never creates a new reactor housing, ring, wheel, or persistent target surface.
  this.reactorFlash=new T.Mesh(new T.CircleGeometry(1,64),new T.MeshBasicMaterial({color:0xffefc8,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false,depthTest:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,toneMapped:false}));this.reactorFlash.name='MeasuredOvalReactor_ConfirmedDamageFlash';this.reactorFlash.visible=false;this.reactorFlash.renderOrder=8;scene.add(this.reactorFlash);
  for(const [id,name] of [['cannonL','Arm_L'],['cannonR','Arm_R'],['jetL','Pod_L'],['jetR','Pod_R'],['legL','Leg_L'],['legR','Leg_R']] as [BossRegionID,string][]){
   const items:{mesh:T.Mesh;original:T.Material|T.Material[];materials:T.MeshStandardMaterial[];base:T.Color[];colors:T.Color[];intensities:number[];hit:T.IUniform[]}[]=[];
   root.getObjectByName(name)?.traverse(o=>{if(!(o as T.Mesh).isMesh)return;const mesh=o as T.Mesh,original=mesh.material,materials=(Array.isArray(original)?original:[original]).map(m=>m.clone() as T.MeshStandardMaterial);mesh.material=Array.isArray(original)?materials:materials[0];items.push({mesh,original,materials,base:materials.map(m=>m.emissive?.clone()??new T.Color()),colors:materials.map(m=>m.color?.clone()??new T.Color()),intensities:materials.map(m=>m.emissiveIntensity??0),hit:materials.map(m=>{
    // The painted emissive atlas can be dark. A confirmed-hit wash must survive that texture.
    const hit={value:0};m.onBeforeCompile=shader=>{shader.uniforms.mechPartHit=hit;shader.fragmentShader='uniform float mechPartHit;\n'+shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight = mix(outgoingLight, vec3(4.0), mechPartHit * 0.86);\n#include <opaque_fragment>');};m.customProgramCacheKey=()=> 'mech-confirmed-part-hit-v1';return hit;
   })});});
   this.regionMaterials.set(id,items);
  }
 }
 /** Undefined/incomplete data keeps the legacy renderer unchanged. No guessed default animation. */
 apply(pose?:AuthoritativeBossPose):boolean {
  if(this.disposed||!pose||!validPose(pose))return false;
  this.root.position.set(pose.rootX,pose.rootY,pose.worldZ);this.root.rotation.set(pose.pitch,pose.yaw,pose.roll,'XYZ');this.root.scale.setScalar(1.4);
  for(const [i,side] of ['L','R'].entries()){
   this.joint('Arm_'+side,pose.arm[i].pitch,pose.arm[i].roll);
   this.joint('Leg_'+side,pose.leg[i],0);this.joint('Knee_'+side,pose.knee[i],0);
   if(pose.barrel)this.joint('Barrel_'+side,0,pose.barrel[i]);
  }
  // The native model already carries its one facing rotation. Do not rotate it again.
  this.root.updateWorldMatrix(true,true);return true;
 }
 private joint(name:string,pitch:number,roll:number){const joint=this.joints.get(name);if(!joint)return;this.euler.set(pitch,0,roll,'XYZ');this.rotation.setFromEuler(this.euler);joint.node.quaternion.copy(joint.rest).multiply(this.rotation);}
 updateRegions(regions?:ReadonlyArray<AuthoritativeBossRegion>,visible=true,components?:ReadonlyArray<AuthoritativeBossComponent>,guardHp=0,dt=1/60){
  if(this.disposed)return;let count=0;this.reactorCue.visible=this.reactorFlash.visible=false;
  this.highlightClock+=Math.max(0,Math.min(.1,dt));const focus=regions?.find(r=>r.vulnerable&&r.hp>0&&validRegion(r))?.id;
  for(const [id,items] of this.regionMaterials){
   const r=regions?.find(r=>r.id===id),flash=Math.max(0,(this.flashes.get(id)??0)-Math.max(0,dt));this.flashes.set(id,flash);
   const valid=visible&&r&&r.hp>0&&r.vulnerable,amount=visible&&r&&r.hp>0&&flash>0?flash/.24:valid?id===focus?.20+Math.sin(this.highlightClock*5)*.055:.045:0;
   for(const item of items)for(let i=0;i<item.materials.length;i++){const m=item.materials[i];item.hit[i].value=visible&&r&&r.hp>0&&flash>0?Math.min(1,flash/.24):0;m.color?.copy(item.colors[i]);if(!m.emissive)continue;m.emissive.copy(item.base[i]);m.emissiveIntensity=item.intensities[i];if(amount>0){m.emissive.setHex(flash>0?0xffffff:0x68d6e8);m.emissiveIntensity=amount*(flash>0?2.8:1);if(flash>0)m.color?.lerp(new T.Color(0xffffff),Math.min(.82,amount*.82));}}
  }
  this.flashes.set('core',Math.max(0,(this.flashes.get('core')??0)-Math.max(0,dt)));
  if(visible)for(const r of regions??[]){
   if(!r.vulnerable||r.hp<=0||count>=7||!validRegion(r))continue;
   if(r.id==='core'){const remaining=this.flashes.get('core')??0,hit=remaining>0;this.reactorCue.material.color.setHex(hit?0xffffff:guardHp>0?0x86eeff:0xffce80);this.reactorCue.material.opacity=hit?1:.8;this.reactorCue.visible=true;this.reactorCue.position.set(r.x,r.y,-r.z);this.reactorCue.quaternion.fromArray(r.quaternion);this.reactorCue.scale.set(r.radiusX,r.radiusY,1);
    if(hit){this.reactorFlash.visible=true;this.reactorFlash.quaternion.fromArray(r.quaternion);this.reactorFlash.position.set(r.x,r.y,-r.z);this.forward.set(0,0,-1).applyQuaternion(this.reactorFlash.quaternion);this.reactorFlash.position.addScaledVector(this.forward,r.radiusZ+.012);this.reactorFlash.scale.set(r.radiusX,r.radiusY,1);this.reactorFlash.material.opacity=.50*Math.pow(T.MathUtils.clamp(remaining/.24,0,1),.8);}
    continue;}
   // Compound legs aim between two pieces; bracket a real plate rather than that empty midpoint.
   const marker=(r.id==='legL'||r.id==='legR')?components?.find(c=>c.regionId===r.id&&c.active)??r:r;
   this.dummy.position.set(marker.x,marker.y,-marker.z);this.dummy.quaternion.fromArray(marker.quaternion);this.dummy.scale.set(marker.radiusX*1.05,marker.radiusY*1.05,1);
   // Forward face is native -Z, transformed by the region's exact quaternion.
   this.dummy.position.addScaledVector(this.dummy.getWorldDirection(this.forward),-(marker.radiusZ+.035));this.dummy.updateMatrix();this.cues.setMatrixAt(count,this.dummy.matrix);
   this.cueColor.setHex((this.flashes.get(r.id)??0)>0?0xffffff:r.id===focus?0x9cf5ff:0x655e50);this.cues.setColorAt(count++,this.cueColor);
  }
  this.cues.count=count;this.cues.instanceMatrix.needsUpdate=true;if(this.cues.instanceColor)this.cues.instanceColor.needsUpdate=true;
 }
 notifyHit(region:BossRegionID|undefined,damage:number){if(region&&Number.isFinite(damage)&&damage>0)this.flashes.set(region,.24);}
 impact(effect?:Partial<AuthoritativeBossImpact>,target=new T.Vector3()):T.Vector3|undefined{
  if(!effect?.hitRegion||![effect.x,effect.y,effect.z].every(Number.isFinite))return undefined;
  return target.set(effect.x!,effect.y!,-effect.z!);
 }
 reset(){if(this.disposed)return;this.highlightClock=0;this.flashes.clear();for(const {node,rest} of this.joints.values())node.quaternion.copy(rest);this.cues.count=0;this.reactorCue.visible=this.reactorFlash.visible=false;this.reactorFlash.material.opacity=0;this.cues.instanceMatrix.needsUpdate=true;this.updateRegions([],false,[],0,0);}
 dispose(){if(this.disposed)return;this.disposed=true;for(const items of this.regionMaterials.values())for(const item of items){item.mesh.material=item.original;item.materials.forEach(m=>m.dispose());}this.regionMaterials.clear();this.cues.removeFromParent();this.cues.geometry.dispose();(this.cues.material as T.Material).dispose();this.cues.dispose();for(const mesh of [this.reactorCue,this.reactorFlash]){mesh.removeFromParent();mesh.geometry.dispose();mesh.material.dispose();}this.joints.clear();}
}
export function validPose(p:AuthoritativeBossPose){return Array.isArray(p.arm)&&p.arm.length===2&&Array.isArray(p.leg)&&p.leg.length===2&&Array.isArray(p.knee)&&p.knee.length===2&&(p.barrel===undefined||(Array.isArray(p.barrel)&&p.barrel.length===2))&&[p.rootX,p.rootY,p.worldZ,p.pitch,p.yaw,p.roll,p.poseClock,p.arm[0]?.pitch,p.arm[0]?.roll,p.arm[1]?.pitch,p.arm[1]?.roll,...p.leg,...p.knee,...(p.barrel??[])].every(Number.isFinite);}
export function validRegion(r:AuthoritativeBossRegion){return r.quaternion?.length===4&&[r.x,r.y,r.z,r.radiusX,r.radiusY,r.radiusZ,r.hp,r.maxHp,...r.quaternion].every(Number.isFinite)&&r.radiusX>0&&r.radiusY>0&&r.radiusZ>0&&r.maxHp>0&&Math.abs(r.quaternion.reduce((sum,v)=>sum+v*v,0)-1)<.01;}
