import * as T from 'three';
import type {FormationUnit} from './contract';
/** Translation only: leave FOV, vertical framing and gameplay coordinates intact. */
export class FormationFraming {
 pan=0;readonly maxPan=.65;
 private fit=new T.PerspectiveCamera(29.52,1,.1,180);private transform=new T.Matrix4();private position=new T.Vector3();private scale=new T.Vector3(.432,.72,.72);private rotation=new T.Quaternion();private euler=new T.Euler();private point=new T.Vector3();private corners:T.Vector3[]=[];private yaws=[-.035,.035];
 setBounds(bounds:T.Box3){this.corners=[];for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z])this.corners.push(new T.Vector3(x,y,z));}
 update(camera:T.PerspectiveCamera,formation:ReadonlyArray<FormationUnit>,dt:number,width:number){
  // Paused/dt0 inspection never moves the view or advances smoothing.
  if(!(dt>0))return this.pan;
  camera.updateMatrixWorld(true);this.fit.aspect=camera.aspect;this.fit.updateProjectionMatrix();this.fit.matrixWorldInverse.copy(camera.matrixWorldInverse);
  let desiredLow=-Infinity,desiredHigh=Infinity,safeLow=-Infinity,safeHigh=Infinity;
  for(const p of formation)for(const yaw of this.yaws){
   this.position.set(p.x,.075,-p.z);this.rotation.setFromEuler(this.euler.set(0,Math.PI+yaw,0));this.transform.compose(this.position,this.rotation,this.scale);
   for(const corner of this.corners){this.point.copy(corner).applyMatrix4(this.transform).applyMatrix4(this.fit.matrixWorldInverse);const depth=-this.point.z;if(depth<=.1)continue;const slope=this.fit.projectionMatrix.elements[0]*width/(2*depth);this.point.applyMatrix4(this.fit.projectionMatrix);const px=(1+this.point.x)*width/2;
    desiredLow=Math.max(desiredLow,(px-(width-20))/slope);desiredHigh=Math.min(desiredHigh,(px-20)/slope);safeLow=Math.max(safeLow,(px-(width-10))/slope);safeHigh=Math.min(safeHigh,(px-10)/slope);
   }
  }
  const target=Number.isFinite(desiredLow)?T.MathUtils.clamp(0,desiredLow,desiredHigh):0;
  this.pan+=((T.MathUtils.clamp(target,-this.maxPan,this.maxPan))-this.pan)*(1-Math.exp(-dt*35));
  // Recruitment can add a rear row instantly: never smooth through an offscreen frame.
  if(safeLow<=safeHigh)this.pan=T.MathUtils.clamp(this.pan,safeLow,safeHigh);
  this.pan=T.MathUtils.clamp(this.pan,-this.maxPan,this.maxPan);return this.pan;
 }
 reset(){this.pan=0;}
}
