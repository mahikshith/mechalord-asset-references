import * as T from 'three';

export type BossSocket='armL'|'armR'|'shoulderL'|'shoulderR'|'core'|'boosterL'|'boosterR';
export type EmitterPositions=Partial<Record<string,T.Vector3>>;
/** Read native mesh bounds in the named joint's coordinates, not actor coordinates. */
function partBounds(part:T.Object3D,meshName:string){
 part.updateWorldMatrix(true,true);const inverse=part.matrixWorld.clone().invert(),bounds=new T.Box3();
 const mesh=part.getObjectByName(meshName) as T.Mesh|undefined;
 if(!mesh?.isMesh)return undefined;
 mesh.geometry.computeBoundingBox();if(!mesh.geometry.boundingBox)return undefined;
 bounds.copy(mesh.geometry.boundingBox).applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld));return bounds;
}
export function visibleInHierarchy(node:T.Object3D){for(let n:T.Object3D|null=node;n;n=n.parent)if(!n.visible)return false;return true;}
/** Sockets remain children of the actual animated GLB joints. Never a guessed world point. */
export class WeaponSockets {
 private anchors=new Map<string,T.Object3D>();private values:EmitterPositions={};
 constructor(private root:T.Object3D,gunner=false){
  if(gunner){this.front('gunner','Barrel_R');return;}
  this.front('armL','Barrel_L');this.front('armR','Barrel_R');
  this.front('shoulderL','Pod_L');this.front('shoulderR','Pod_R');
  // Measured reactor centre in the original Torso joint's coordinate system.
  this.attach('core','Torso',new T.Vector3(0,.725620107650757,-.605));
  for(const side of ['L','R']){const part=root.getObjectByName('Pod_'+side);if(!part)continue;const b=partBounds(part,'Pod_'+side+'_MobileMesh');if(!b)continue;const p=b.getCenter(new T.Vector3());p.y=b.min.y-.035;p.z=b.max.z-.04;p.x+=side==='L'?-.72:.72;this.attach('booster'+side,'Pod_'+side,p);}
 }
 private front(key:string,name:string){const part=this.root.getObjectByName(name);if(!part)return;const b=partBounds(part,name+'_MobileMesh');if(!b)return;const p=b.getCenter(new T.Vector3());p.z=b.min.z-.02;this.attach(key,name,p);}
 private attach(key:string,name:string,position:T.Vector3){const part=this.root.getObjectByName(name);if(!part)return;const anchor=new T.Object3D();anchor.name='WeaponSocket_'+key;anchor.position.copy(position);part.add(anchor);this.anchors.set(key,anchor);this.values[key]=new T.Vector3();}
 node(key:string){return this.anchors.get(key);}
 position(key:string,target=new T.Vector3()){const n=this.anchors.get(key);if(!n||!visibleInHierarchy(n))return undefined;n.updateWorldMatrix(true,false);return n.getWorldPosition(target);}
 positions(out:EmitterPositions=this.values){this.root.updateWorldMatrix(true,true);for(const [key,node] of this.anchors){if(!visibleInHierarchy(node)){delete out[key];continue;}const p=out[key]??new T.Vector3();node.getWorldPosition(p);out[key]=p;}return out;}
 dispose(){for(const anchor of this.anchors.values())anchor.removeFromParent();this.anchors.clear();this.values={};}
}

/** Cosmetic attitude follows measured motion. It cannot change the collision trajectory. */
export function flightAttitude(vx:number,vz:number,previousVz:number,dt:number,airborne:boolean){
 const brake=dt>0?T.MathUtils.clamp((vz-previousVz)/dt*.0025,-.07,.07):0;
 return {roll:airborne?T.MathUtils.clamp(-vx*.045,-.22,.22):T.MathUtils.clamp(-vx*.02,-.05,.05),pitch:airborne?T.MathUtils.clamp(vz*.018+brake,-.18,.18):0,thrust:airborne?T.MathUtils.clamp(.45+Math.hypot(vx,vz)*.06+Math.abs(brake)*3,.45,1.5):0};
}
