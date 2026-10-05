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
 private joints=new Map<string,{node:T.Object3D;rest:T.Quaternion}>();
 private dummy=new T.Object3D();private euler=new T.Euler();private rotation=new T.Quaternion();
 private forward=new T.Vector3();
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
  this.cues=new T.InstancedMesh(geometry,new T.MeshBasicMaterial({color:0xfff1c0,transparent:true,opacity:.95,side:T.DoubleSide,depthWrite:false,toneMapped:false}),7);
  this.cues.name='AuthoritativeBossPartCues';this.cues.frustumCulled=false;this.cues.count=0;scene.add(this.cues);
  this.reactorCue=new T.Mesh(new T.RingGeometry(.965,1,64),new T.MeshBasicMaterial({color:0xffce80,transparent:true,opacity:.8,side:T.DoubleSide,depthWrite:false,toneMapped:false}));this.reactorCue.name='MeasuredOvalReactorCue';this.reactorCue.visible=false;scene.add(this.reactorCue);
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
 updateRegions(regions?:ReadonlyArray<AuthoritativeBossRegion>,visible=true,components?:ReadonlyArray<AuthoritativeBossComponent>,guardHp=0){
  if(this.disposed)return;let count=0;this.reactorCue.visible=false;
  if(visible)for(const r of regions??[]){
   if(!r.vulnerable||r.hp<=0||count>=7||!validRegion(r))continue;
   if(r.id==='core'){this.reactorCue.material.color.setHex(guardHp>0?0x86eeff:0xffce80);this.reactorCue.visible=true;this.reactorCue.position.set(r.x,r.y,-r.z);this.reactorCue.quaternion.fromArray(r.quaternion);this.reactorCue.scale.set(r.radiusX,r.radiusY,1);continue;}
   // Compound legs aim between two pieces; bracket a real plate rather than that empty midpoint.
   const marker=(r.id==='legL'||r.id==='legR')?components?.find(c=>c.regionId===r.id&&c.active)??r:r;
   this.dummy.position.set(marker.x,marker.y,-marker.z);this.dummy.quaternion.fromArray(marker.quaternion);this.dummy.scale.set(marker.radiusX*1.05,marker.radiusY*1.05,1);
   // Forward face is native -Z, transformed by the region's exact quaternion.
   this.dummy.position.addScaledVector(this.dummy.getWorldDirection(this.forward),-(marker.radiusZ+.035));this.dummy.updateMatrix();this.cues.setMatrixAt(count++,this.dummy.matrix);
  }
  this.cues.count=count;this.cues.instanceMatrix.needsUpdate=true;
 }
 impact(effect?:Partial<AuthoritativeBossImpact>,target=new T.Vector3()):T.Vector3|undefined{
  if(!effect?.hitRegion||![effect.x,effect.y,effect.z].every(Number.isFinite))return undefined;
  return target.set(effect.x!,effect.y!,-effect.z!);
 }
 reset(){if(this.disposed)return;for(const {node,rest} of this.joints.values())node.quaternion.copy(rest);this.cues.count=0;this.reactorCue.visible=false;this.cues.instanceMatrix.needsUpdate=true;}
 dispose(){if(this.disposed)return;this.disposed=true;this.cues.removeFromParent();this.cues.geometry.dispose();(this.cues.material as T.Material).dispose();this.cues.dispose();this.reactorCue.removeFromParent();this.reactorCue.geometry.dispose();this.reactorCue.material.dispose();this.joints.clear();}
}
export function validPose(p:AuthoritativeBossPose){return Array.isArray(p.arm)&&p.arm.length===2&&Array.isArray(p.leg)&&p.leg.length===2&&Array.isArray(p.knee)&&p.knee.length===2&&(p.barrel===undefined||(Array.isArray(p.barrel)&&p.barrel.length===2))&&[p.rootX,p.rootY,p.worldZ,p.pitch,p.yaw,p.roll,p.poseClock,p.arm[0]?.pitch,p.arm[0]?.roll,p.arm[1]?.pitch,p.arm[1]?.roll,...p.leg,...p.knee,...(p.barrel??[])].every(Number.isFinite);}
export function validRegion(r:AuthoritativeBossRegion){return r.quaternion?.length===4&&[r.x,r.y,r.z,r.radiusX,r.radiusY,r.radiusZ,r.hp,r.maxHp,...r.quaternion].every(Number.isFinite)&&r.radiusX>0&&r.radiusY>0&&r.radiusZ>0&&r.maxHp>0&&Math.abs(r.quaternion.reduce((sum,v)=>sum+v*v,0)-1)<.01;}
