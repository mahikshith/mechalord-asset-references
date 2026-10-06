import * as T from 'three';

export type CoreChoice='laser'|'vitality'|'endurance';
/** A chosen fallen core travels from the actual boss position into the marshal.
 * This presentation timer keeps the normal reward phase open until absorption ends. */
export class CoreAbsorption {
 readonly root=new T.Group();private remaining=0;private age=0;private choice:CoreChoice='laser';
 private origin=new T.Vector3();private destination=new T.Vector3();private dummy=new T.Object3D();
 private core:T.Mesh;private motes:T.InstancedMesh;private rings:T.InstancedMesh;
 constructor(scene:T.Scene){
  this.root.name='ChosenCoreAbsorption';this.root.visible=false;scene.add(this.root);
  const glow=new T.MeshBasicMaterial({color:0x9deeff,transparent:true,opacity:.85,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending});
  this.core=new T.Mesh(new T.IcosahedronGeometry(.25,1),glow);this.root.add(this.core);
  this.motes=new T.InstancedMesh(new T.SphereGeometry(.055,6,4),glow.clone(),32);this.motes.frustumCulled=false;this.motes.instanceMatrix.setUsage(T.DynamicDrawUsage);this.root.add(this.motes);
  this.rings=new T.InstancedMesh(new T.TorusGeometry(1,.024,6,48),glow.clone(),3);this.rings.frustumCulled=false;this.rings.instanceMatrix.setUsage(T.DynamicDrawUsage);this.root.add(this.rings);
 }
 begin(choice:CoreChoice,origin:T.Vector3,destination:T.Vector3){
  this.choice=choice;this.origin.copy(origin);this.destination.copy(destination);this.remaining=1.2;this.age=0;this.root.visible=true;
  const color=choice==='vitality'?0x70efac:choice==='endurance'?0xffcc76:0x8bdeff;
  for(const mesh of[this.core,this.motes,this.rings])(mesh.material as T.MeshBasicMaterial).color.setHex(color);
  this.update(0);
 }
 update(dt:number){
  if(this.remaining<=0){this.root.visible=false;return;}
  this.age=Math.min(1.2,this.age+Math.max(0,Math.min(.1,dt)));this.remaining=Math.max(0,1.2-this.age);
  const progress=this.age/1.2,eased=T.MathUtils.smoothstep(progress,0,.83);
  const point=this.origin.clone().lerp(this.destination,eased);point.y+=Math.sin(eased*Math.PI)*1.1;
  this.core.position.copy(point);this.core.rotation.set(this.age*4,this.age*7,this.age*2);this.core.scale.setScalar(1+Math.sin(progress*Math.PI)*.8);
  (this.core.material as T.MeshBasicMaterial).opacity=progress>.83?(1-progress)/.17:.9;
  for(let i=0;i<32;i++){
   const t=T.MathUtils.clamp(eased-(i%8)*.025,0,1),p=this.origin.clone().lerp(this.destination,t),angle=i*2.399+this.age*7,spread=.12+Math.sin(t*Math.PI)*.40;
   p.y+=Math.sin(t*Math.PI)*1.1;p.x+=Math.cos(angle)*spread;p.z+=Math.sin(angle)*spread;
   this.dummy.position.copy(p);this.dummy.rotation.set(0,0,0);this.dummy.scale.setScalar(progress>.85?Math.max(0,(1-progress)/.15):.7+(i%3)*.17);this.dummy.updateMatrix();this.motes.setMatrixAt(i,this.dummy.matrix);
  }
  this.motes.instanceMatrix.needsUpdate=true;
  for(let i=0;i<3;i++){const t=T.MathUtils.clamp((progress-.55-i*.06)/.35,0,1);this.dummy.position.copy(this.destination);this.dummy.position.y-=.55+i*.36;this.dummy.rotation.set(Math.PI/2,0,this.age*(i%2?1:-1));this.dummy.scale.setScalar(t>0?(.65+t*1.1)*(1-t)*2:0);this.dummy.updateMatrix();this.rings.setMatrixAt(i,this.dummy.matrix);}
  this.rings.instanceMatrix.needsUpdate=true;this.root.visible=this.remaining>0;
 }
 get timeRemaining(){return this.remaining;}
 reset(){this.remaining=this.age=0;this.root.visible=false;}
}
