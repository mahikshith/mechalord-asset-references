// Read retained source atlas coordinates; no geometry/material edits.
import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),bytes=fs.readFileSync(path.join(root,'delivery/playable/forge-tyrant.glb')),length=bytes.readUInt32LE(12),j=JSON.parse(bytes.subarray(20,20+length)),bin=bytes.subarray(28+length);
const n=j.nodes.find(n=>n.name==='Torso_MobileMesh'),parent=j.nodes.find(n=>n.name==='Torso');
function read(id,dim){const a=j.accessors[id],v=j.bufferViews[a.bufferView],stride=v.byteStride??dim*4,offset=(v.byteOffset??0)+(a.byteOffset??0);return Array.from({length:a.count},(_,i)=>Array.from({length:dim},(_,k)=>bin.readFloatLE(offset+i*stride+k*4)));}
const points=[];
for(const p of j.meshes[n.mesh].primitives){const pos=read(p.attributes.POSITION,3),uv=read(p.attributes.TEXCOORD_0,2);for(let i=0;i<pos.length;i++){
 // Palette3 Amber occupies Blender atlas col0,row1; glTF flips texture V.
 if(uv[i][0]>=0&&uv[i][0]<1/3&&uv[i][1]>=0&&uv[i][1]<.5)points.push(pos[i].map((v,k)=>v+(n.translation?.[k]??0)));
}}
if(points.length<50)throw Error('Luminous heart extraction found too few vertices');
const min=[0,1,2].map(k=>Math.min(...points.map(p=>p[k]))),max=[0,1,2].map(k=>Math.max(...points.map(p=>p[k]))),center=min.map((v,k)=>(v+max[k])*.5),half=min.map((v,k)=>(max[k]-v)*.5);
const worldCenter=[-center[0]*1.4,(center[1]+parent.translation[1])*1.4,-center[2]*1.4],worldHalf=half.map(v=>v*1.4);
const result={source:'delivery/playable/forge-tyrant.glb',selection:'Torso_MobileMesh vertices using actual Amber emissive atlas tile (Blender col0,row1, glTF V flipped)',vertices:points.length,localCenter:center,localHalf:half,neutralWorldCenter:worldCenter,neutralWorldHalf:worldHalf,hitToleranceMetres:.01,note:'Luminous heart is an oval ellipsoid. Parent-facing center/size include actual source mesh offsets and source normalization; bronze grille is not counted as luminous area.'};
fs.writeFileSync(path.join(root,'builds/boss-core-luminous-measurement.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
