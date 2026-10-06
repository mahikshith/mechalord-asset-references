import * as T from 'three';
import {clone as cloneSkeleton} from 'three/addons/utils/SkeletonUtils.js';
import type {FormationUnit} from './contract';

export interface TroopCrowdMotion {dt:number;time:number;marching:boolean;strafe:number;visible?:boolean;held?:boolean;}
type Pose={phase:number;idle:number;walk:number;x:number;z:number;strafe:number;};
type Tree={index:number;axis:number;left?:Tree;right?:Tree;};
const RUN_FRAMES=24,IDLE_FRAMES=12,SIDE_FRAMES=24,TOTAL_FRAMES=RUN_FRAMES+IDLE_FRAMES+SIDE_FRAMES*2,TEXTURE_WIDTH=512;
/** Retained troop surface with real retained Run/Idle skin poses. One crowd draw, no per-unit actors. */
export class AnimatedTroopCrowd {
 readonly mesh:T.InstancedMesh;readonly bounds=new T.Box3();readonly capacity:number;
 readonly positionTexture:T.DataTexture;readonly normalTexture:T.DataTexture;
 private poses=new Map<number,Pose>();private seen=new Set<number>();private stamp=new T.Object3D();private attributes:T.InstancedBufferAttribute;
 private disposed=false;private rows:number;private vertexCount:number;private positionData:Uint16Array;private normalData:Uint16Array;
 readonly transfer:{maxDistance:number;meanDistance:number;vertices:number;sourceVertices:number};
 private material:T.Material;private depth:T.MeshDepthMaterial;private distance:T.MeshDistanceMaterial;
 constructor(scene:T.Scene,troopGeometry:T.BufferGeometry,troopMaterial:T.Material,commander:T.Object3D,clips:ReadonlyArray<T.AnimationClip>,capacity=64){
  this.capacity=Math.max(1,Math.min(64,Math.floor(capacity)));
  const run=clips.find(c=>c.name==='Run'),idle=clips.find(c=>c.name==='Idle');if(!run||!idle)throw new Error('Animated troops require the retained commander Run and Idle clips');
  const rig=cloneSkeleton(commander);rig.position.set(0,0,0);rig.quaternion.identity();rig.scale.setScalar(1);rig.updateMatrixWorld(true);
  let source:T.SkinnedMesh|undefined;rig.traverse(o=>{if(!source&&(o as T.SkinnedMesh).isSkinnedMesh)source=o as T.SkinnedMesh;});if(!source)throw new Error('Animated troops require a retained skinned commander source');
  const geometry=troopGeometry.clone(),vertices=geometry.getAttribute('position'),sourceVertices=source.geometry.getAttribute('position'),sourceJoints=source.geometry.getAttribute('skinIndex'),sourceWeights=source.geometry.getAttribute('skinWeight');
  this.vertexCount=vertices.count;this.rows=Math.ceil(this.vertexCount/TEXTURE_WIDTH);
  const sourcePoints=Array.from({length:sourceVertices.count},(_,i)=>new T.Vector3().fromBufferAttribute(sourceVertices,i));
  const tree=(indices:number[],depth=0):Tree|undefined=>{if(!indices.length)return undefined;const axis=depth%3;indices.sort((a,b)=>sourcePoints[a].getComponent(axis)-sourcePoints[b].getComponent(axis));const mid=indices.length>>1;return {index:indices[mid],axis,left:tree(indices.slice(0,mid),depth+1),right:tree(indices.slice(mid+1),depth+1)};};
  const root=tree(sourcePoints.map((_,i)=>i))!;
  const nearest=(point:T.Vector3)=>{let index=0,distance=Infinity;const visit=(node?:Tree)=>{if(!node)return;const candidate=point.distanceToSquared(sourcePoints[node.index]);if(candidate<distance){index=node.index;distance=candidate;}const delta=point.getComponent(node.axis)-sourcePoints[node.index].getComponent(node.axis);visit(delta<0?node.left:node.right);if(delta*delta<=distance)visit(delta<0?node.right:node.left);};visit(root);return {index,distance:Math.sqrt(distance)};};
  const joints=new Uint16Array(this.vertexCount*4),weights=new Float32Array(this.vertexCount*4),vertexID=new Float32Array(this.vertexCount);let maxDistance=0,totalDistance=0;const point=new T.Vector3();
  for(let i=0;i<this.vertexCount;i++){point.fromBufferAttribute(vertices,i);const found=nearest(point);maxDistance=Math.max(maxDistance,found.distance);totalDistance+=found.distance;vertexID[i]=i;let sum=0;for(let k=0;k<4;k++){joints[i*4+k]=sourceJoints.getComponent(found.index,k);const weight=sourceWeights.getComponent(found.index,k);weights[i*4+k]=weight;sum+=weight;}for(let k=0;k<4;k++)weights[i*4+k]/=sum||1;}
  // Different characters must not silently borrow this rig. The two retained meshes share one source.
  if(maxDistance>.13){geometry.dispose();throw new Error(`Troop/commander rig transfer exceeds the retained-surface limit (${maxDistance.toFixed(3)}m)`);}
  this.transfer={maxDistance,meanDistance:totalDistance/this.vertexCount,vertices:this.vertexCount,sourceVertices:sourceVertices.count};
  geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(joints,4));geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
  const skin=new T.SkinnedMesh(geometry,troopMaterial);skin.bind(source.skeleton,source.bindMatrix);skin.bindMatrixInverse.copy(source.bindMatrixInverse);
  const height=this.rows*TOTAL_FRAMES,length=TEXTURE_WIDTH*height*4;this.positionData=new Uint16Array(length);this.normalData=new Uint16Array(length);
  const mixer=new T.AnimationMixer(rig),normal=new T.Vector3(),matrix=new T.Matrix4(),skinMatrix=new T.Matrix4(),bindNormal=new T.Matrix4(),temporary=new Float32Array(this.vertexCount*6),attributeNormal=geometry.getAttribute('normal');
  const sideJoints:{bone:T.Bone;side:number;axis:T.Vector3;rest:T.Quaternion}[]=[];rig.traverse(o=>{if(!(o as T.Bone).isBone||!o.parent||!/^(thigh|shin|foot|chest)/.test(o.name))return;const inverse=o.parent.getWorldQuaternion(new T.Quaternion()).invert();sideJoints.push({bone:o as T.Bone,side:o.name.endsWith('L')?1:-1,axis:new T.Vector3(0,0,1).applyQuaternion(inverse),rest:o.quaternion.clone()});});const lateralRotation=new T.Quaternion(),relativeRotation=new T.Quaternion();
  const bake=(clip:T.AnimationClip,frames:number,offset:number,direction=0)=>{mixer.stopAllAction();mixer.clipAction(clip).reset().play();for(let frame=0;frame<frames;frame++){
   mixer.setTime(clip.duration*frame/frames);
   if(direction)for(const joint of sideJoints){const wave=Math.sin(frame/frames*Math.PI*2+(joint.side>0?0:Math.PI));let angle=0;if(joint.bone.name.startsWith('thigh')){relativeRotation.copy(joint.rest).invert().multiply(joint.bone.quaternion);joint.bone.quaternion.copy(joint.rest).multiply(new T.Quaternion().slerp(relativeRotation,.35));angle=direction*(.04+wave*.25);}else if(joint.bone.name.startsWith('shin'))angle=-direction*Math.max(0,wave)*.11;else if(joint.bone.name.startsWith('foot'))angle=-direction*.065;else if(joint.bone.name==='chest')angle=-direction*.02;if(angle)joint.bone.quaternion.premultiply(lateralRotation.setFromAxisAngle(joint.axis,angle));}
   rig.updateMatrixWorld(true);source!.skeleton.update();let minY=Infinity;
   for(let i=0;i<this.vertexCount;i++){point.fromBufferAttribute(vertices,i);skin.applyBoneTransform(i,point);skinMatrix.elements.fill(0);for(let k=0;k<4;k++){matrix.fromArray(source!.skeleton.boneMatrices,joints[i*4+k]*16);const weight=weights[i*4+k];for(let n=0;n<16;n++)skinMatrix.elements[n]+=matrix.elements[n]*weight;}bindNormal.multiplyMatrices(skin.bindMatrixInverse,skinMatrix).multiply(skin.bindMatrix);normal.fromBufferAttribute(attributeNormal,i).transformDirection(bindNormal);temporary.set([point.x,point.y,point.z,normal.x,normal.y,normal.z],i*6);minY=Math.min(minY,point.y);}
   const lift=Math.max(0,-minY);for(let i=0;i<this.vertexCount;i++){const destination=((offset+frame)*this.rows*TEXTURE_WIDTH+i)*4,j=i*6;point.set(temporary[j],temporary[j+1]+lift,temporary[j+2]);this.bounds.expandByPoint(point);for(let k=0;k<3;k++){this.positionData[destination+k]=T.DataUtils.toHalfFloat(point.getComponent(k));this.normalData[destination+k]=T.DataUtils.toHalfFloat(temporary[j+3+k]);}this.positionData[destination+3]=this.normalData[destination+3]=T.DataUtils.toHalfFloat(1);}
  }};bake(run,RUN_FRAMES,0);bake(idle,IDLE_FRAMES,RUN_FRAMES);bake(run,SIDE_FRAMES,RUN_FRAMES+IDLE_FRAMES,-1);bake(run,SIDE_FRAMES,RUN_FRAMES+IDLE_FRAMES+SIDE_FRAMES,1);mixer.stopAllAction();mixer.uncacheRoot(rig);
  geometry.deleteAttribute('skinIndex');geometry.deleteAttribute('skinWeight');geometry.setAttribute('crowdVertex',new T.Float32BufferAttribute(vertexID,1));this.attributes=new T.InstancedBufferAttribute(new Float32Array(this.capacity*4),4).setUsage(T.DynamicDrawUsage);geometry.setAttribute('crowdPose',this.attributes);
  const texture=(data:Uint16Array)=>{const t=new T.DataTexture(data,TEXTURE_WIDTH,height,T.RGBAFormat,T.HalfFloatType);t.minFilter=t.magFilter=T.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t;};this.positionTexture=texture(this.positionData);this.normalTexture=texture(this.normalData);
  this.material=troopMaterial.clone();this.patch(this.material,true);this.depth=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking});this.patch(this.depth,false);this.distance=new T.MeshDistanceMaterial();this.patch(this.distance,false);
  this.mesh=new T.InstancedMesh(geometry,this.material,this.capacity);this.mesh.name='Legion_ActualAnimatedTroops';this.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);this.mesh.customDepthMaterial=this.depth;this.mesh.customDistanceMaterial=this.distance;this.mesh.frustumCulled=false;this.mesh.castShadow=this.mesh.receiveShadow=true;this.mesh.count=0;scene.add(this.mesh);this.bounds.expandByScalar(.015);
 }
 private patch(material:T.Material,normals:boolean){
  material.onBeforeCompile=shader=>{shader.uniforms.crowdPositions={value:this.positionTexture};shader.uniforms.crowdNormals={value:this.normalTexture};shader.uniforms.crowdSize={value:new T.Vector2(TEXTURE_WIDTH,this.positionTexture.image.height)};shader.uniforms.crowdRows={value:this.rows};
   shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
attribute float crowdVertex;attribute vec4 crowdPose;uniform sampler2D crowdPositions;uniform sampler2D crowdNormals;uniform vec2 crowdSize;uniform float crowdRows;
vec3 crowdSample(sampler2D atlas,float frame){vec2 uv=vec2(mod(crowdVertex,crowdSize.x)+.5,frame*crowdRows+floor(crowdVertex/crowdSize.x)+.5)/crowdSize;return texture2D(atlas,uv).xyz;}
vec3 crowdDeform(sampler2D atlas){float run=floor(crowdPose.x),idle=floor(crowdPose.y);vec3 running=mix(crowdSample(atlas,run),crowdSample(atlas,mod(run+1.,24.)),fract(crowdPose.x));float sideways=crowdPose.w<0.?36.:60.;vec3 sidestep=mix(crowdSample(atlas,sideways+run),crowdSample(atlas,sideways+mod(run+1.,24.)),fract(crowdPose.x));running=mix(running,sidestep,abs(crowdPose.w));vec3 resting=mix(crowdSample(atlas,24.+idle),crowdSample(atlas,24.+mod(idle+1.,12.)),fract(crowdPose.y));return mix(resting,running,crowdPose.z);}`)
    .replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed=crowdDeform(crowdPositions);');
   if(normals)shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nobjectNormal=normalize(crowdDeform(crowdNormals));');
  };material.customProgramCacheKey=()=>`retained-troop-pose-atlas-v1-${normals?'normal':'depth'}`;
 }
 update(formation:ReadonlyArray<FormationUnit>,motion:TroopCrowdMotion){
  if(this.disposed)return;const dt=Math.max(0,Math.min(.1,motion.dt));this.seen.clear();let count=0;this.mesh.visible=motion.visible!==false;
  if(this.mesh.visible)for(const unit of formation){if(count>=this.capacity)break;this.seen.add(unit.index);let pose=this.poses.get(unit.index);if(!pose){pose={phase:((unit.index*.6180339)%1),idle:((unit.index*.381966)%1),walk:motion.marching&&!motion.held?1:0,x:unit.x,z:unit.z,strafe:T.MathUtils.clamp(motion.strafe,-1,1)};this.poses.set(unit.index,pose);}const speed=dt>0?Math.abs(unit.x-pose.x)/dt:0,moving=motion.held?pose.walk:motion.marching?1:T.MathUtils.clamp(speed/.85,0,1);if(dt>0&&!motion.held){pose.walk+=(moving-pose.walk)*(1-Math.exp(-dt*15));pose.phase=(pose.phase+dt*(motion.marching?1.28:.7+Math.min(speed,5)*.14))%1;pose.idle=(pose.idle+dt*.5)%1;}pose.x=unit.x;pose.z=unit.z;
   if(!motion.held)pose.strafe=T.MathUtils.clamp(motion.strafe,-1,1);const strafe=pose.strafe;this.stamp.position.set(unit.x,.01,-unit.z);this.stamp.rotation.set(0,Math.PI+strafe*.23,-strafe*.12);this.stamp.scale.set(.432,.72,.72);this.stamp.updateMatrix();this.mesh.setMatrixAt(count,this.stamp.matrix);this.attributes.setXYZW(count,pose.phase*RUN_FRAMES,pose.idle*IDLE_FRAMES,pose.walk,strafe);count++;
  }for(const id of this.poses.keys())if(!this.seen.has(id))this.poses.delete(id);this.mesh.count=count;this.mesh.instanceMatrix.needsUpdate=true;this.attributes.needsUpdate=true;
 }
 /** CPU inspection of the same decoded atlas used by the shader, for integration verification. */
 vertexAt(vertex:number,runFrame:number,idleFrame:number,walk:number,target=new T.Vector3(),strafe=0){
  if(vertex<0||vertex>=this.vertexCount)throw new RangeError('Troop vertex outside atlas');const sample=(frame:number)=>{const at=(frame*this.rows*TEXTURE_WIDTH+vertex)*4;return new T.Vector3(...[0,1,2].map(k=>T.DataUtils.fromHalfFloat(this.positionData[at+k])));},r=((runFrame%RUN_FRAMES)+RUN_FRAMES)%RUN_FRAMES,i=((idleFrame%IDLE_FRAMES)+IDLE_FRAMES)%IDLE_FRAMES;const run=sample(Math.floor(r)).lerp(sample((Math.floor(r)+1)%RUN_FRAMES),r%1),side=RUN_FRAMES+IDLE_FRAMES+(strafe>=0?SIDE_FRAMES:0),lateral=sample(side+Math.floor(r)).lerp(sample(side+(Math.floor(r)+1)%SIDE_FRAMES),r%1);return target.copy(sample(RUN_FRAMES+Math.floor(i))).lerp(sample(RUN_FRAMES+(Math.floor(i)+1)%IDLE_FRAMES),i%1).lerp(run.lerp(lateral,Math.abs(T.MathUtils.clamp(strafe,-1,1))),walk);
 }
 get stats(){return {visible:this.mesh.count,poses:this.poses.size,capacity:this.capacity,drawBatches:1,vertices:this.vertexCount,triangles:(this.mesh.geometry.index?.count??this.vertexCount)/3,frames:TOTAL_FRAMES,atlasBytes:this.positionData.byteLength+this.normalData.byteLength,transfer:this.transfer};}
 reset(){this.poses.clear();this.seen.clear();this.mesh.count=0;this.attributes.array.fill(0);this.attributes.needsUpdate=true;}
 dispose(){if(this.disposed)return;this.disposed=true;this.reset();this.mesh.removeFromParent();this.mesh.geometry.dispose();this.material.dispose();this.depth.dispose();this.distance.dispose();this.positionTexture.dispose();this.normalTexture.dispose();this.mesh.dispose();}
}
