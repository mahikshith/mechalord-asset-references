import * as T from 'three';

/** Instanced, vertex-animated crowd for one skinned mech. Each clip is baked once
 * into float textures (positions + normals per frame); every instance picks a
 * clip, phase and flash, so dozens of animated mechs cost one draw call (plus
 * one for shadows). Presentation only: placement comes from the simulation. */
export interface BakeClip {clip:T.AnimationClip;frames:number;}
const WIDTH=1024;

export class BakedMechCrowd {
 readonly mesh:T.InstancedMesh;readonly capacity:number;readonly height:number;
 private positions:T.DataTexture;private normals:T.DataTexture;private anim:T.InstancedBufferAttribute;private tint:T.InstancedBufferAttribute;
 private rows:number;private clipStart:number[]=[];private clipFrames:number[]=[];private count=0;private stamp=new T.Object3D();
 constructor(scene:T.Scene,model:T.Object3D,bake:BakeClip[],capacity:number,material:T.MeshStandardMaterial){
  this.capacity=capacity;
  let skinned:T.SkinnedMesh|undefined;model.traverse(o=>{if(!skinned&&(o as T.SkinnedMesh).isSkinnedMesh)skinned=o as T.SkinnedMesh;});if(!skinned)throw new Error('BakedMechCrowd needs a skinned mesh');
  const source=skinned.geometry,vertexCount=source.getAttribute('position').count;this.rows=Math.ceil(vertexCount/WIDTH);
  const total=bake.reduce((n,b)=>n+b.frames,0),texHeight=this.rows*total;
  const pos=new Float32Array(WIDTH*texHeight*4),nor=new Float32Array(WIDTH*texHeight*4);
  const mixer=new T.AnimationMixer(model),v=new T.Vector3(),toRoot=new T.Matrix4(),box=new T.Box3();
  const frameGeo=new T.BufferGeometry();if(source.index)frameGeo.setIndex(source.index);const framePos=new Float32Array(vertexCount*3);frameGeo.setAttribute('position',new T.BufferAttribute(framePos,3));
  let frame=0;
  for(const b of bake){this.clipStart.push(frame);this.clipFrames.push(b.frames);mixer.stopAllAction();const action=mixer.clipAction(b.clip).reset().play();
   for(let f=0;f<b.frames;f++,frame++){mixer.setTime(b.clip.duration*f/b.frames);model.updateMatrixWorld(true);toRoot.copy(skinned.matrixWorld); // model sits at the origin with its normalising scale
    for(let i=0;i<vertexCount;i++){skinned.getVertexPosition(i,v);v.applyMatrix4(toRoot);framePos[i*3]=v.x;framePos[i*3+1]=v.y;framePos[i*3+2]=v.z;}
    frameGeo.getAttribute('position').needsUpdate=true;frameGeo.computeVertexNormals();const n=frameGeo.getAttribute('normal');
    for(let i=0;i<vertexCount;i++){const at=((frame*this.rows+Math.floor(i/WIDTH))*WIDTH+i%WIDTH)*4;pos[at]=framePos[i*3];pos[at+1]=framePos[i*3+1];pos[at+2]=framePos[i*3+2];pos[at+3]=1;nor[at]=n.getX(i);nor[at+1]=n.getY(i);nor[at+2]=n.getZ(i);}
    if(f===0&&frame===0){box.setFromBufferAttribute(frameGeo.getAttribute('position') as T.BufferAttribute);}
   }action.stop();}
  this.height=box.max.y-box.min.y;frameGeo.dispose();mixer.uncacheRoot(model);
  const tex=(data:Float32Array)=>{const t=new T.DataTexture(data,WIDTH,texHeight,T.RGBAFormat,T.FloatType);t.needsUpdate=true;return t;};this.positions=tex(pos);this.normals=tex(nor);
  const geo=new T.BufferGeometry();if(source.index)geo.setIndex(source.index.clone());geo.setAttribute('position',source.getAttribute('position').clone());geo.setAttribute('uv',source.getAttribute('uv').clone());
  const ids=new Float32Array(vertexCount);for(let i=0;i<vertexCount;i++)ids[i]=i;geo.setAttribute('mechVertex',new T.BufferAttribute(ids,1));
  this.anim=new T.InstancedBufferAttribute(new Float32Array(capacity*4),4).setUsage(T.DynamicDrawUsage);geo.setAttribute('mechAnim',this.anim);
  this.tint=new T.InstancedBufferAttribute(new Float32Array(capacity),1).setUsage(T.DynamicDrawUsage);geo.setAttribute('mechFlash',this.tint);
  geo.boundingSphere=new T.Sphere(new T.Vector3(),1e4);
  const uniforms={mechPos:{value:this.positions},mechNor:{value:this.normals},mechRows:{value:this.rows}};
  const fetch=`uniform sampler2D mechPos;uniform sampler2D mechNor;uniform float mechRows;attribute float mechVertex;attribute vec4 mechAnim;attribute float mechFlash;varying float vMechFlash;
vec3 mechFetch(sampler2D t,float frame){float row=frame*mechRows+floor(mechVertex/${WIDTH}.);vec2 uv=vec2((mod(mechVertex,${WIDTH}.)+.5)/${WIDTH}.,(row+.5)/float(textureSize(t,0).y));return texture2D(t,uv).xyz;}
vec3 mechSample(sampler2D t){float local=mechAnim.z*mechAnim.y;float f0=floor(local),f1=mod(f0+1.,mechAnim.y);return mix(mechFetch(t,mechAnim.x+f0),mechFetch(t,mechAnim.x+f1),local-f0);}`;
  const patch=(shader:any,withNormal:boolean)=>{Object.assign(shader.uniforms,uniforms);shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\n'+fetch)
   .replace('#include <begin_vertex>','vec3 transformed=mechSample(mechPos);vMechFlash=mechFlash;');
   if(withNormal)shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','vec3 objectNormal=normalize(mechSample(mechNor));\n#ifdef USE_TANGENT\nvec3 objectTangent=vec3(1.,0.,0.);\n#endif');};
  material.onBeforeCompile=shader=>{patch(shader,true);shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vMechFlash;').replace('#include <opaque_fragment>','outgoingLight=mix(outgoingLight,vec3(2.2,2.,1.8),vMechFlash*.28);\n#include <opaque_fragment>');};
  material.customProgramCacheKey=()=> 'baked-mech-crowd-v1';
  const depth=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking});depth.onBeforeCompile=shader=>{patch(shader,false);shader.fragmentShader='varying float vMechFlash;\n'+shader.fragmentShader;};depth.customProgramCacheKey=()=> 'baked-mech-depth-v1';
  this.mesh=new T.InstancedMesh(geo,material,capacity);this.mesh.customDepthMaterial=depth;this.mesh.castShadow=true;this.mesh.receiveShadow=true;this.mesh.frustumCulled=false;this.mesh.count=0;this.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(this.mesh);
 }
 begin(){this.count=0;}
 /** clip index into the bake list, phase 0..1 within that clip, flash 0..1 for confirmed hits. */
 add(x:number,y:number,z:number,yaw:number,scale:number,clip:number,phase:number,flash=0,roll=0,pitch=0){
  if(this.count>=this.capacity)return;const i=this.count++;this.stamp.position.set(x,y,z);this.stamp.rotation.set(pitch,yaw,roll);this.stamp.scale.setScalar(scale);this.stamp.updateMatrix();this.mesh.setMatrixAt(i,this.stamp.matrix);
  const c=Math.max(0,Math.min(this.clipStart.length-1,clip));this.anim.setXYZW(i,this.clipStart[c],this.clipFrames[c],((phase%1)+1)%1,0);this.tint.setX(i,flash);
 }
 end(){this.mesh.count=this.count;this.mesh.instanceMatrix.needsUpdate=true;this.anim.needsUpdate=true;this.tint.needsUpdate=true;}
 dispose(){this.mesh.removeFromParent();this.mesh.geometry.dispose();(this.mesh.material as T.Material).dispose();(this.mesh.customDepthMaterial as T.Material).dispose();this.positions.dispose();this.normals.dispose();this.mesh.dispose();}
}
