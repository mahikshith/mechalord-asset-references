import * as T from 'three';

type Motion={dt:number;forward:boolean;lateralVelocity:number;active:boolean;held:boolean;recoil:number};
type Joint={bone:T.Bone;side:number;forwardAxis:T.Vector3;sideAxis:T.Vector3;pose:T.Quaternion};

/** The retained commander's real skin, shared by the ordinary game and review.
 * Blend locomotion continuously; lateral steps deform legs while the torso aims forward. */
export class CommanderLocomotion {
 readonly mixer:T.AnimationMixer;
 private run?:T.AnimationAction;private idle?:T.AnimationAction;
 private joints:Joint[]=[];private blend=0;private side=0;private phase=0;
 private q=new T.Quaternion();
 constructor(private model:T.Object3D,clips:ReadonlyArray<T.AnimationClip>){
  this.mixer=new T.AnimationMixer(model);
  for(const clip of clips){if(clip.name==='Run')this.run=this.mixer.clipAction(clip);if(clip.name==='Idle')this.idle=this.mixer.clipAction(clip);}
  this.run?.play().setEffectiveWeight(0);this.idle?.play().setEffectiveWeight(1);
  model.updateWorldMatrix(true,true);const inverse=model.matrixWorld.clone().invert();
  model.traverse(o=>{if(!(o as T.Bone).isBone||!o.parent)return;
   if(!/^(thigh|shin|foot|upperarm|chest|head)/.test(o.name))return;
   const parent=new T.Matrix4().multiplyMatrices(inverse,o.parent.matrixWorld),rotation=new T.Quaternion().setFromRotationMatrix(parent).invert();
   this.joints.push({bone:o as T.Bone,side:o.name.endsWith('L')?1:-1,forwardAxis:new T.Vector3(0,0,1).applyQuaternion(rotation),sideAxis:new T.Vector3(1,0,0).applyQuaternion(rotation),pose:o.quaternion.clone()});
  });
 }
 update(m:Motion){
  const dt=T.MathUtils.clamp(m.dt,0,.1);if(!dt)return;
  // Undo only our last additive pose before evaluating clips; never accumulate rotations.
  for(const j of this.joints)j.bone.quaternion.copy(j.pose);
  const locomotion=m.active&&!m.held&&(m.forward||Math.abs(m.lateralVelocity)>.12);
  const settle=1-Math.exp(-dt*12);
  this.blend+=((locomotion?1:0)-this.blend)*settle;
  this.side+=((m.active&&!m.held?T.MathUtils.clamp(m.lateralVelocity/5,-1,1):0)-this.side)*settle;
  const cadence=locomotion?m.forward?1.15:Math.max(.55,Math.min(1.25,Math.abs(m.lateralVelocity)*.25)):0;
  this.run?.setEffectiveWeight(this.blend).setEffectiveTimeScale(cadence);
  this.idle?.setEffectiveWeight(1-this.blend);this.mixer.update(dt);
  this.phase+=dt*cadence*Math.PI*2;
  for(const j of this.joints){
   j.pose.copy(j.bone.quaternion);
   let lateral=0,recoil=0;
   if(j.bone.name.startsWith('thigh'))lateral=this.side*(.045+Math.sin(this.phase+j.side*Math.PI/2)*.15)*this.blend;
   else if(j.bone.name.startsWith('shin'))lateral=-this.side*Math.max(0,Math.sin(this.phase+j.side*Math.PI/2))*.07*this.blend;
   else if(j.bone.name.startsWith('foot'))lateral=-this.side*.05*this.blend;
   else if(j.bone.name==='chest')lateral=-this.side*.025;
   else if(j.bone.name.startsWith('upperarm'))recoil=-m.recoil*.11;
   if(lateral)j.bone.quaternion.premultiply(this.q.setFromAxisAngle(j.forwardAxis,lateral));
   if(recoil)j.bone.quaternion.premultiply(this.q.setFromAxisAngle(j.sideAxis,recoil));
  }
 }
 reset(){for(const j of this.joints)j.bone.quaternion.copy(j.pose);this.mixer.stopAllAction();this.run?.reset().play().setEffectiveWeight(0);this.idle?.reset().play().setEffectiveWeight(1);this.blend=this.side=this.phase=0;this.mixer.update(0);for(const j of this.joints)j.pose.copy(j.bone.quaternion);}
 get stats(){return{clips:[this.run?.getClip().name,this.idle?.getClip().name].filter(Boolean),joints:this.joints.length,walkingWeight:this.blend,strafe:this.side};}
}
