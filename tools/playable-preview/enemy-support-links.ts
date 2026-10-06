import * as T from 'three';
import type {Effect} from './contract';
/** Show the engineer's real, reported repair recipient. No inferred healing. */
export class EnemySupportLinks {
 readonly mesh:T.InstancedMesh;private links:{a:T.Vector3;b:T.Vector3;age:number}[]=[];
 private dummy=new T.Object3D();private up=new T.Vector3(0,1,0);private delta=new T.Vector3();
 constructor(scene:T.Scene){this.mesh=new T.InstancedMesh(new T.CylinderGeometry(.032,.032,1,6),new T.MeshBasicMaterial({color:0x86f9bd,transparent:true,opacity:.8,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending}),64);this.mesh.name='Engineer_ConfirmedRepairLinks';this.mesh.frustumCulled=false;this.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);this.mesh.count=0;scene.add(this.mesh);}
 trigger(e:Effect){if(e.kind!=='enemySupport'||![e.endX,e.endY,e.endZ].every(Number.isFinite))return;this.links.push({a:new T.Vector3(e.x,e.y??1.6,-e.z),b:new T.Vector3(e.endX!,e.endY!,-e.endZ!),age:0});if(this.links.length>8)this.links.shift();}
 update(dt:number){const delta=Math.max(0,Math.min(.1,dt));let count=0;for(const link of this.links){link.age+=delta;if(link.age>=.6)continue;this.delta.subVectors(link.b,link.a);const length=this.delta.length();if(length<.001)continue;const direction=this.delta.clone().normalize();for(let i=0;i<8;i++){const t=(i/8+link.age*1.7)%1;this.dummy.position.copy(link.a).addScaledVector(this.delta,t);this.dummy.quaternion.setFromUnitVectors(this.up,direction);this.dummy.scale.setScalar(1);this.dummy.scale.y=length*.07;this.dummy.updateMatrix();this.mesh.setMatrixAt(count++,this.dummy.matrix);}}
 this.links=this.links.filter(l=>l.age<.6);this.mesh.count=count;this.mesh.instanceMatrix.needsUpdate=true;}
 reset(){this.links=[];this.mesh.count=0;}
}
