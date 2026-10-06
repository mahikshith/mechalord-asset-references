import * as T from 'three';
import type {FormationUnit} from './contract';
function boxCorners(bounds:T.Box3){const result:T.Vector3[]=[];if(bounds.isEmpty())return result;for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z])result.push(new T.Vector3(x,y,z));return result;}
/** Sample the two retained locomotion clips once at load, never skin vertices each frame. */
export function commanderAnimationBounds(model:T.Object3D,clips:ReadonlyArray<T.AnimationClip>){
 const position=model.position.clone(),quaternion=model.quaternion.clone(),scale=model.scale.clone(),parent=model.parent,index=parent?.children.indexOf(model)??-1,mixer=new T.AnimationMixer(model),bounds=new T.Box3();
 model.removeFromParent();model.position.set(0,0,0);model.quaternion.identity();model.scale.setScalar(1);
 const measure=()=>{model.updateMatrixWorld(true,true);model.traverse(o=>{if((o as T.SkinnedMesh).isSkinnedMesh)(o as T.SkinnedMesh).skeleton.update();});bounds.union(new T.Box3().setFromObject(model,true));};
 try{measure();for(const clip of clips.filter(c=>c.name==='Run'||c.name==='Idle')){mixer.stopAllAction();const action=mixer.clipAction(clip);action.reset().play();for(let i=0;i<24;i++){mixer.setTime(clip.duration*i/24);measure();}}}
 finally{mixer.stopAllAction();mixer.uncacheRoot(model);model.position.copy(position);model.quaternion.copy(quaternion);model.scale.copy(scale);if(parent){parent.add(model);parent.children.splice(parent.children.indexOf(model),1);parent.children.splice(index,0,model);}model.updateWorldMatrix(true,true);}
 // Inter-sample motion, weapon recoil, and skin interpolation allowance in model metres.
 return bounds.expandByScalar(.04);
}
/** Translation only: leave FOV, vertical framing and gameplay coordinates intact. */
export class FormationFraming {
 pan=0;readonly maxPan=1.1;private initialized=false;
 private fit=new T.PerspectiveCamera(29.52,1,.1,180);private transform=new T.Matrix4();private position=new T.Vector3();private scale=new T.Vector3(.432,.72,.72);private rotation=new T.Quaternion();private euler=new T.Euler();private point=new T.Vector3();private troopEnvelope:T.Vector3[]=[];private commanderEnvelope:T.Vector3[]=[];private kneelingEnvelope:T.Vector3[]=[];
 setBounds(bounds:T.Box3){this.troopEnvelope=[];for(const yaw of[-.265,0,.265])for(const bank of[-.12,.12])for(const bob of[-.012,.105]){this.transform.compose(this.position.set(0,bob,0),this.rotation.setFromEuler(this.euler.set(0,Math.PI+yaw,bank)),this.scale);for(const corner of boxCorners(bounds))this.troopEnvelope.push(corner.applyMatrix4(this.transform));}}
 setCommanderBounds(bounds:T.Box3){this.commanderEnvelope=[];this.kneelingEnvelope=[];for(const pitch of[-.075,0,.085,.75])for(const yaw of[-.20,0,.20])for(const bank of[-.148,.148]){this.transform.compose(this.position.set(0,.055,0),this.rotation.setFromEuler(this.euler.set(pitch,Math.PI+yaw,bank)),new T.Vector3(1.43,1.43,1.43));for(const corner of boxCorners(bounds))(pitch===.75?this.kneelingEnvelope:this.commanderEnvelope).push(corner.applyMatrix4(this.transform));}}
 update(camera:T.PerspectiveCamera,formation:ReadonlyArray<FormationUnit>,dt:number,width:number,commanderX?:number,reviving=false){
  // Existing paused/dt0 views freeze; first frame after reset must fit an edge replay immediately.
  if(!(dt>0)&&this.initialized)return this.pan;
  camera.updateMatrixWorld(true);this.fit.aspect=camera.aspect;this.fit.fov=Math.min(camera.fov,reviving?27.27:29.52);this.fit.updateProjectionMatrix();this.fit.matrixWorldInverse.copy(camera.matrixWorldInverse);
  let desiredLow=-Infinity,desiredHigh=Infinity,safeLow=-Infinity,safeHigh=Infinity;
  const project=(corners:ReadonlyArray<T.Vector3>,x:number,z:number)=>{for(const corner of corners){this.point.copy(corner);this.point.x+=x;this.point.z+=z;this.point.applyMatrix4(this.fit.matrixWorldInverse);const depth=-this.point.z;if(depth<=.1)continue;const slope=this.fit.projectionMatrix.elements[0]*width/(2*depth);this.point.applyMatrix4(this.fit.projectionMatrix);const px=(1+this.point.x)*width/2;
    // Include the largest normal combat shake (.45 / 2 metres), after this pan is applied.
    desiredLow=Math.max(desiredLow,(px-(width-20))/slope+.225);desiredHigh=Math.min(desiredHigh,(px-20)/slope-.225);safeLow=Math.max(safeLow,(px-(width-10))/slope+.225);safeHigh=Math.min(safeHigh,(px-10)/slope-.225);
   }
  };
  for(const p of formation)project(this.troopEnvelope,p.x,-p.z);
  if(Number.isFinite(commanderX)){project(this.commanderEnvelope,commanderX!,0);if(reviving)project(this.kneelingEnvelope,commanderX!,0);}
  const target=Number.isFinite(desiredLow)?T.MathUtils.clamp(0,desiredLow,desiredHigh):0;
  if(!this.initialized)this.pan=T.MathUtils.clamp(target,-this.maxPan,this.maxPan);else this.pan+=((T.MathUtils.clamp(target,-this.maxPan,this.maxPan))-this.pan)*(1-Math.exp(-dt*35));
  this.initialized=Number.isFinite(desiredLow);
  // Recruitment can add a rear row instantly: never smooth through an offscreen frame.
  if(safeLow<=safeHigh)this.pan=T.MathUtils.clamp(this.pan,safeLow,safeHigh);
  this.pan=T.MathUtils.clamp(this.pan,-this.maxPan,this.maxPan);return this.pan;
 }
 reset(){this.pan=0;this.initialized=false;}
}
