import * as T from 'three';

/** A cruel, angry face fitted over the existing Forge Tyrant helm: a scowling
 * faceplate, a heavy V brow, narrow red slit eyes that burn hotter in a rage and
 * a furnace mouth of jagged steel fangs. Sized from the helm's own bounds and
 * attached to the Head node so it follows every head turn. Presentation only. */
export function addCruelFace(model:T.Object3D){
 const head=model.getObjectByName('Head'),mesh=model.getObjectByName('Head_MobileMesh') as T.Mesh|undefined;if(!head||!mesh)return undefined;
 model.updateWorldMatrix(true,true);
 const box=new T.Box3().setFromObject(mesh),size=box.getSize(new T.Vector3()),c=box.getCenter(new T.Vector3());
 // The model is authored facing -Z in its own space; find which world Z side the face is on.
 const fwd=new T.Vector3(0,0,-1).applyQuaternion(model.getWorldQuaternion(new T.Quaternion())).normalize();
 const w=size.x,h=size.y,frontZ=(fwd.z>0?box.max.z:box.min.z),s=Math.sign(fwd.z)||1;
 const steel=new T.MeshStandardMaterial({color:0x2a100c,metalness:.8,roughness:.4}),edge=new T.MeshStandardMaterial({color:0x5a2a1c,metalness:.7,roughness:.4});
 const eye=new T.MeshBasicMaterial({color:new T.Color(1.3,0,.01),toneMapped:false}),furnace=new T.MeshBasicMaterial({color:new T.Color(2.2,.35,.06),toneMapped:false});
 const fang=new T.MeshStandardMaterial({color:0xc9c4bb,metalness:.9,roughness:.25});
 const face=new T.Group();face.name='CruelFace';
 const at=(o:T.Object3D,x:number,y:number,dz:number)=>{o.position.set(x*w,y*h,dz*w);face.add(o);return o;};
 // Scowling faceplate: a downward-pointing wedge so the whole face reads as a frown.
 const plate=new T.Shape();plate.moveTo(-.5,.18);plate.lineTo(.5,.18);plate.lineTo(.36,-.32);plate.lineTo(0,-.46);plate.lineTo(-.36,-.32);plate.closePath();
 at(new T.Mesh(new T.ExtrudeGeometry(plate,{depth:.04,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:2}).scale(w,w,w),steel),0,.02,.0);
 // Heavy V brow, angled down to the centre, and narrow red slits beneath it.
 for(const d of [-1,1]){
  at(new T.Mesh(new T.BoxGeometry(w*.42,w*.09,w*.1).rotateZ(d*.42),edge),d*.2,.2,.07);
  const slit=new T.Mesh(new T.CapsuleGeometry(w*.022,w*.18,6,12).rotateZ(Math.PI/2+d*.5),eye);slit.name='CruelEye';at(slit,d*.2,.08,.08);
  at(new T.Mesh(new T.BoxGeometry(w*.04,w*.16,w*.04).rotateZ(d*.25),edge),d*.36,-.05,.06); // cheek scar plates
 }
 // Furnace mouth with upper and lower rows of jagged fangs.
 at(new T.Mesh(new T.PlaneGeometry(w*.42,w*.12),furnace),0,-.16,.075);
 for(let i=0;i<6;i++){const x=-.17+i*.068,len=.06+(i%2)*.035;
  at(new T.Mesh(new T.ConeGeometry(w*.022,w*len,5).rotateX(Math.PI),fang),x,-.115,.09);
  at(new T.Mesh(new T.ConeGeometry(w*.02,w*(len*.8),5),fang),x+.034,-.215,.09);}
 // Place the face group in head space: world anchor at the helm's front, facing the model's forward.
 head.updateWorldMatrix(true,false);const hq=head.getWorldQuaternion(new T.Quaternion()),hs=head.getWorldScale(new T.Vector3());
 const facing=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(0,0,s));
 face.position.copy(head.worldToLocal(new T.Vector3(c.x,c.y,frontZ)));face.quaternion.copy(hq.clone().invert().multiply(facing));face.scale.set(1/hs.x,1/hs.y,1/hs.z);head.add(face);
 const eyes:T.MeshBasicMaterial=eye;
 return {face,setRage(k:number,t:number){eyes.color.setRGB(1.3+k*1.2,0,.01);furnace.color.setRGB(2.2+k*2,.35+k*.3,.06);eyes.color.multiplyScalar(.9+.1*Math.sin(t*(4+k*10)));}};
}
