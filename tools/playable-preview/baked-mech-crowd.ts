import * as T from 'three';

/** Instanced, vertex-animated crowd. Each clip is baked once into float textures
 * (positions + normals per frame); every instance picks a clip, phase and flash,
 * so dozens of animated mechs cost one draw call (plus one for shadows).
 * Presentation only: placement comes from the simulation. */
export interface BakeClip {clip:T.AnimationClip;frames:number;}
/** Rest geometry (index/uv/color reused by every frame) plus per-frame positions and normals. */
export interface BakedFrames {base:T.BufferGeometry;frames:{pos:Float32Array;nor:Float32Array}[];clipFrames:number[];}
const WIDTH=1024;

/** Sample a skinned model's clips into frames (model at the origin with its normalising scale). */
export function bakeSkinned(model:T.Object3D,bake:BakeClip[]):BakedFrames{
 let skinned:T.SkinnedMesh|undefined;model.traverse(o=>{if(!skinned&&(o as T.SkinnedMesh).isSkinnedMesh)skinned=o as T.SkinnedMesh;});if(!skinned)throw new Error('bakeSkinned needs a skinned mesh');
 const source=skinned.geometry,count=source.getAttribute('position').count,mixer=new T.AnimationMixer(model),v=new T.Vector3();
 const frameGeo=new T.BufferGeometry();if(source.index)frameGeo.setIndex(source.index);const framePos=new Float32Array(count*3);frameGeo.setAttribute('position',new T.BufferAttribute(framePos,3));
 const frames:BakedFrames['frames']=[];
 for(const b of bake){mixer.stopAllAction();const action=mixer.clipAction(b.clip).reset().play();
  for(let f=0;f<b.frames;f++){mixer.setTime(b.clip.duration*f/b.frames);model.updateMatrixWorld(true);
   for(let i=0;i<count;i++){skinned.getVertexPosition(i,v);v.applyMatrix4(skinned.matrixWorld);framePos[i*3]=v.x;framePos[i*3+1]=v.y;framePos[i*3+2]=v.z;}
   frameGeo.getAttribute('position').needsUpdate=true;frameGeo.computeVertexNormals();frames.push({pos:framePos.slice(),nor:(frameGeo.getAttribute('normal').array as Float32Array).slice()});}
  action.stop();}
 mixer.uncacheRoot(model);frameGeo.dispose();
 const base=new T.BufferGeometry();if(source.index)base.setIndex(source.index.clone());base.setAttribute('position',source.getAttribute('position').clone());base.setAttribute('uv',source.getAttribute('uv').clone());
 return {base,frames,clipFrames:bake.map(b=>b.frames)};
}

/** Bake every mesh in a model (skinned or bone-attached), keeping smooth normals:
 * each normal is skinned by transforming a point offset along it. Meshes must share
 * one material/texture set. Used for multi-part rigs such as the Sci-Fi Essentials robots. */
export function bakeModel(model:T.Object3D,bake:BakeClip[],filter:(m:T.Mesh)=>boolean=()=>true):BakedFrames{
 const meshes:T.Mesh[]=[];model.traverse(o=>{if((o as T.Mesh).isMesh&&o.visible&&filter(o as T.Mesh))meshes.push(o as T.Mesh);});
 const sources=meshes.map(m=>{const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();if(!g.getAttribute('normal'))g.computeVertexNormals();return g;});
 const count=sources.reduce((n,g)=>n+g.getAttribute('position').count,0),mixer=new T.AnimationMixer(model),p=new T.Vector3(),q=new T.Vector3(),nm=new T.Matrix3();
 const frames:BakedFrames['frames']=[];
 for(const b of bake){mixer.stopAllAction();const action=mixer.clipAction(b.clip).reset().play();
  for(let f=0;f<b.frames;f++){mixer.setTime(b.clip.duration*f/b.frames);model.updateMatrixWorld(true);const pos=new Float32Array(count*3),nor=new Float32Array(count*3);let o=0;
   meshes.forEach((m,mi)=>{const g=sources[mi],P=g.getAttribute('position'),N=g.getAttribute('normal'),sk=(m as T.SkinnedMesh).isSkinnedMesh?m as T.SkinnedMesh:undefined;nm.getNormalMatrix(m.matrixWorld);
    // Skinned path needs the source attribute order; toNonIndexed keeps skinIndex/skinWeight per vertex.
    for(let i=0;i<P.count;i++,o++){
     if(sk){p.fromBufferAttribute(P,i);q.fromBufferAttribute(N,i).multiplyScalar(.01).add(p);const tmp=sk.geometry;sk.geometry=g;sk.applyBoneTransform(i,p);sk.applyBoneTransform(i,q);sk.geometry=tmp;p.applyMatrix4(m.matrixWorld);q.applyMatrix4(m.matrixWorld);q.sub(p).normalize();}
     else{p.fromBufferAttribute(P,i).applyMatrix4(m.matrixWorld);q.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();}
     pos[o*3]=p.x;pos[o*3+1]=p.y;pos[o*3+2]=p.z;nor[o*3]=q.x;nor[o*3+1]=q.y;nor[o*3+2]=q.z;}});
   frames.push({pos,nor});}
  action.stop();}
 mixer.uncacheRoot(model);
 const base=new T.BufferGeometry(),uv=new Float32Array(count*2);let o=0;for(const g of sources){const U=g.getAttribute('uv');for(let i=0;i<g.getAttribute('position').count;i++,o++){uv[o*2]=U?U.getX(i):0;uv[o*2+1]=U?U.getY(i):0;}}
 base.setAttribute('position',new T.BufferAttribute(frames[0].pos.slice(),3));base.setAttribute('uv',new T.BufferAttribute(uv,2));sources.forEach(g=>g.dispose());
 return {base,frames,clipFrames:bake.map(b=>b.frames)};
}

export class BakedMechCrowd {
 readonly mesh:T.InstancedMesh;readonly capacity:number;readonly height:number;
 private positions:T.DataTexture;private normals:T.DataTexture;private anim:T.InstancedBufferAttribute;private tint:T.InstancedBufferAttribute;
 private rows:number;private clipStart:number[]=[];private clipFrames:number[]=[];private count=0;private stamp=new T.Object3D();
 constructor(scene:T.Scene,source:T.Object3D|BakedFrames,bakeOrCapacity:BakeClip[]|number,capacityOrMaterial:number|T.MeshStandardMaterial,maybeMaterial?:T.MeshStandardMaterial){
  const data=(source as BakedFrames).frames?source as BakedFrames:bakeSkinned(source as T.Object3D,bakeOrCapacity as BakeClip[]);
  const capacity=typeof bakeOrCapacity==='number'?bakeOrCapacity:capacityOrMaterial as number,material=(maybeMaterial??capacityOrMaterial) as T.MeshStandardMaterial;
  this.capacity=capacity;
  const vertexCount=data.base.getAttribute('position').count;this.rows=Math.ceil(vertexCount/WIDTH);
  const total=data.frames.length,texHeight=this.rows*total,pos=new Float32Array(WIDTH*texHeight*4),nor=new Float32Array(WIDTH*texHeight*4),box=new T.Box3(),v=new T.Vector3();
  data.frames.forEach((fr,frame)=>{for(let i=0;i<vertexCount;i++){const at=((frame*this.rows+Math.floor(i/WIDTH))*WIDTH+i%WIDTH)*4;pos[at]=fr.pos[i*3];pos[at+1]=fr.pos[i*3+1];pos[at+2]=fr.pos[i*3+2];pos[at+3]=1;nor[at]=fr.nor[i*3];nor[at+1]=fr.nor[i*3+1];nor[at+2]=fr.nor[i*3+2];if(frame===0)box.expandByPoint(v.set(fr.pos[i*3],fr.pos[i*3+1],fr.pos[i*3+2]));}});
  let start=0;for(const n of data.clipFrames){this.clipStart.push(start);this.clipFrames.push(n);start+=n;}
  this.height=box.max.y-box.min.y;
  const tex=(d:Float32Array)=>{const t=new T.DataTexture(d,WIDTH,texHeight,T.RGBAFormat,T.FloatType);t.needsUpdate=true;return t;};this.positions=tex(pos);this.normals=tex(nor);
  const geo=data.base;const ids=new Float32Array(vertexCount);for(let i=0;i<vertexCount;i++)ids[i]=i;geo.setAttribute('mechVertex',new T.BufferAttribute(ids,1));
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
  const minRough=(material.userData.minRoughness as number|undefined)??0;
  material.onBeforeCompile=shader=>{patch(shader,true);shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=max(roughnessFactor,'+minRough.toFixed(2)+');').replace('#include <common>','#include <common>\nvarying float vMechFlash;').replace('#include <opaque_fragment>','outgoingLight+=vec3(.18,.05,.015)*vMechFlash;\n#include <opaque_fragment>');};
  material.customProgramCacheKey=()=> 'baked-mech-crowd-v2-'+minRough.toFixed(2);
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
