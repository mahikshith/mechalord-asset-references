import * as T from 'three';

/** A short protected re-energisation scene driven solely by the core's remaining revive time. */
export class RevivalScene {
 readonly root=new T.Group();private rings:T.Mesh[]=[];private pillars:T.InstancedMesh;private shards:T.InstancedMesh;private stamp=new T.Object3D();private alive=false;
 constructor(scene:T.Scene){
  this.root.name='LegionCommanderReconstruction';scene.add(this.root);
  const light=(color:number,opacity:number)=>new T.MeshBasicMaterial({color,transparent:true,opacity,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
  for(let i=0;i<3;i++){const ring=new T.Mesh(new T.TorusGeometry(1,.035,6,64),light(i===1?0xd6ffe5:0x62f6c7,.8));ring.rotation.x=-Math.PI/2;this.root.add(ring);this.rings.push(ring);}
  this.pillars=new T.InstancedMesh(new T.CylinderGeometry(.018,.055,1,7),light(0x68ffd0,.8),12);this.shards=new T.InstancedMesh(new T.BoxGeometry(.08,.15,.035),new T.MeshStandardMaterial({color:0xc1cccb,metalness:.72,roughness:.4,emissive:0x267c68,emissiveIntensity:.3}),20);this.root.add(this.pillars,this.shards);this.reset();
 }
 update(remaining:number,x:number,visible=true){
  const active=visible&&remaining>0;this.root.visible=active;this.alive=active;if(!active)return;this.root.position.set(x,0,0);const p=T.MathUtils.clamp(1-remaining/1.5,0,1),gather=Math.sin(p*Math.PI),radius=2.5*(1-p)+.4;
  for(let i=0;i<3;i++){const ring=this.rings[i];ring.position.y=.08+i*p*1.1;ring.scale.setScalar(.65+gather*(1.3-i*.3));(ring.material as T.MeshBasicMaterial).opacity=(.2+.65*gather)*(1-p*.4);}
  for(let i=0;i<12;i++){const a=i*Math.PI/6+p*2.6;this.stamp.position.set(Math.cos(a)*radius,1.5,Math.sin(a)*radius);this.stamp.rotation.set(0,0,Math.sin(a)*.2);this.stamp.scale.set(1,(.4+gather*3.7),1);this.stamp.updateMatrix();this.pillars.setMatrixAt(i,this.stamp.matrix);}this.pillars.count=12;this.pillars.instanceMatrix.needsUpdate=true;
  for(let i=0;i<20;i++){const a=i*2.399+p*4;this.stamp.position.set(Math.sin(a)*radius,.4+(i%5)*.45,Math.cos(a)*radius);this.stamp.rotation.set(p*3+i,p*5,i);this.stamp.scale.setScalar(.3+gather);this.stamp.updateMatrix();this.shards.setMatrixAt(i,this.stamp.matrix);}this.shards.count=20;this.shards.instanceMatrix.needsUpdate=true;
 }
 get cameraStrength(){return this.alive?.075:0;}
 reset(){this.root.visible=false;this.alive=false;this.pillars.count=0;this.shards.count=0;}
 dispose(){this.root.removeFromParent();for(const m of [...this.rings,this.pillars,this.shards]){m.geometry.dispose();(m.material as T.Material).dispose();}this.pillars.dispose();this.shards.dispose();}
}
