import {build} from '../asset-viewer/node_modules/esbuild/lib/main.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {Scene,Matrix4,Vector3} from '../asset-viewer/node_modules/three/build/three.module.js';
import {GLTFLoader} from '../asset-viewer/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const out=path.join(root,'builds/reforged-environment-regression.mjs');
await build({entryPoints:[path.join(here,'reforged-environment.ts')],bundle:true,platform:'node',format:'esm',target:'es2022',nodePaths:[path.join(root,'tools/asset-viewer/node_modules')],outfile:out});
const {ReforgedEnvironment,REFORGED_ROUTE,planReforgedSection,REFORGED_LEVELS}=await import(pathToFileURL(out).href);
globalThis.self=globalThis;
const library=new Map(),loader=new GLTFLoader();
for(const name of ['SuspendedIsland','SpineConnector','SunkenRoute','CitadelBowl','TaperedButtress','PressureVessel','CoolingStack','ArticulatedServiceArm','ReactorBank','CitadelSpire','CableDrum','DistantFoundryWorks','DistantTransferGallery','ReactorBulkhead']){
 const bytes=await fs.readFile(path.join(root,'assets/exports/reforged',name+'.glb'));
 const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 library.set(name,gltf.scene);
}
assert.deepEqual(REFORGED_LEVELS,['SkyforgeViaduct','ReactorTrench','CoreCitadel']);
assert(REFORGED_ROUTE.width>=10.8,'The full formation at the steering extremes must fit');
const signatures=new Set();
for(let level=0;level<3;level++)for(let section=-2;section<300;section++){
 const plan=planReforgedSection(section,level);assert.deepEqual(plan,planReforgedSection(section,level));
 assert(plan.sides.every(s=>Math.abs(s.x)>8),'Machinery cannot obstruct legal lanes');
 signatures.add(plan.sides.map(s=>s.asset).join('/'));
}
assert(signatures.size>=12);assert.deepEqual(planReforgedSection(NaN,Infinity),planReforgedSection(0,0));
const scene=new Scene(),env=new ReforgedEnvironment(scene);await env.load(library);
const children=env.root.children.length,geometryCount=env.geometry.size;
assert(![...env.batches.keys()].includes('RelicGate'),'Opaque static arches cannot mask targets');
assert([...env.batches.values()].flat().some(b=>b.mesh.castShadow),'Structural native body geometry must cast shadows');
assert([...env.batches.values()].flat().some(b=>!b.mesh.castShadow),'Actual energy accents must have a separate glow batch');
// Compare native material * vertex colours directly, including authored surface
// modulation, with the baked output. Checking RGB sets ignores merge ordering.
const rgbKey=(r,g,b)=>[r,g,b].map(v=>Math.round(Math.fround(v)*1e5)).join(',');
const expectedColors=new Set();
library.get('SuspendedIsland').traverse(node=>{if(!node.isMesh)return;const m=node.material,c=node.geometry.attributes.color;
 for(let i=0;i<node.geometry.attributes.position.count;i++)expectedColors.add(rgbKey(m.color.r*(c?.getX(i)??1),m.color.g*(c?.getY(i)??1),m.color.b*(c?.getZ(i)??1)));
});
const actualColors=new Set();
for(const {mesh}of env.batches.get('SuspendedIsland')){const c=mesh.geometry.attributes.color;for(let i=0;i<c.count;i++)actualColors.add(rgbKey(c.getX(i),c.getY(i),c.getZ(i)));}
assert.deepEqual(actualColors,expectedColors,'Native vertex modulation and palette colours must survive merging');
console.log('PASS: structural body shadows, distinct true-emission batches, and original palette × vertex shading.');
for(const name of ['SuspendedIsland_Surface','SunkenRoute_Surface']){
 const batches=env.batches.get(name);assert(batches?.length,'Native hatches and seams must have a dedicated visible surface batch');
 let vertices=0;for(const {mesh}of batches){mesh.geometry.computeBoundingBox();assert(mesh.geometry.boundingBox.min.y>.0002,'Surface must exclude the coplanar broad deck cap');assert(mesh.geometry.boundingBox.max.y<.065,'Surface extraction cannot include tall rails');vertices+=mesh.geometry.attributes.position.count;}
 assert(vertices>100,'Original maintenance detail must survive the support-floor adaptation');
}
for(let stage=0;stage<3;stage++){
 env.update(0,stage,0);const name=stage===1?'SunkenRoute_Surface':'SuspendedIsland_Surface';
 for(const {mesh}of env.batches.get(name)){assert.equal(mesh.count,REFORGED_ROUTE.sections);const transform=new Matrix4();mesh.getMatrixAt(0,transform);const first=new Vector3().fromBufferAttribute(mesh.geometry.attributes.position,0).applyMatrix4(transform);assert(first.y>.004,'Hatch geometry must actually sit above the walking surface');}
}
console.log('PASS: original hatch/seam surfaces are visible above y=0 in every stage, without a duplicate coplanar floor cap.');

// Test the exported source triangles after their real world transform, rather
// than trusting a logical interval or a second implementation of the builder.
env.root.updateMatrixWorld(true);const cap=[];
for(const mesh of env.floor.children){const p=mesh.geometry.attributes.position;
 for(let i=0;i<p.count;i+=3){const tri=[0,1,2].map(j=>new Vector3().fromBufferAttribute(p,i+j).applyMatrix4(mesh.matrixWorld));
  if(tri.every(v=>Math.abs(v.y)<1e-5))cap.push(tri);
 }
}
assert(cap.length>0,'Native structural floor must have an actual y=0 walking surface');
function insideTriangle(x,z,tri){const [a,b,c]=tri;
 const det=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);if(Math.abs(det)<1e-9)return false;
 const u=((b.z-c.z)*(x-c.x)+(c.x-b.x)*(z-c.z))/det;
 const v=((c.z-a.z)*(x-c.x)+(a.x-c.x)*(z-c.z))/det;
 return u>=-1e-6&&v>=-1e-6&&u+v<=1+1e-6;
}
let samples=0;
for(let z=-105;z<=10;z+=.5)for(let x=-5.4;x<=5.401;x+=.3){assert(cap.some(t=>insideTriangle(x,z,t)),`Visual void below legal army position (${x},${z})`);samples++;}
console.log(`PASS: ${samples} actual native floor samples, continuous y=0, full army width, and no static foreground arches.`);

// Track native sections across a recycling boundary: retained absolute sections
// have stable identity and exact displacement; pooled slot replacement is ignored.
env.update(10.799,0,0);const before=env.plans.slice();
env.update(10.801,0,0);const after=env.plans;
for(const old of before){const kept=after.find(p=>p.section===old.section);if(kept)assert.deepEqual(kept,old);}
const cached=env.plans.slice();for(let i=0;i<60;i++)env.update(10.802+i*.01,0,1/60);
assert(env.plans.every((p,i)=>p===cached[i]),'No per-frame art planning or flicker');
let maxBatches=0,maxTriangles=0;
const matrix=new Matrix4();
for(let level=0;level<3;level++)for(let frame=0;frame<1200;frame++){
 env.update(frame*.25,level,1/60);assert.equal(env.root.children.length,children);assert.equal(env.geometry.size,geometryCount);
 let calls=0,triangles=0;
 for(const entries of env.batches.values())for(const {mesh}of entries){assert(mesh.count<=mesh.instanceMatrix.count);if(mesh.visible&&mesh.count){calls++;triangles+=mesh.geometry.attributes.position.count/3*mesh.count;}
  if(frame%100===0)for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);assert(matrix.elements.every(Number.isFinite));}
 }
 maxBatches=Math.max(maxBatches,calls);maxTriangles=Math.max(maxTriangles,triangles);
}
assert(maxBatches<=26,'One merged native body/glow batch per master, not one draw per fastener');
env.update(203.5,0,0);const final=[...env.batches.values()].flat().map(b=>Array.from(b.mesh.instanceMatrix.array));
env.update(203.5,0,1);assert.deepEqual([...env.batches.values()].flat().map(b=>Array.from(b.mesh.instanceMatrix.array)),final,'Travel stopping must settle the entire scene');
env.update(0,0,0);const reset=[...env.batches.values()].flat().map(b=>Array.from(b.mesh.instanceMatrix.array).slice(0,b.mesh.count*16));
env.update(175,2,1);env.update(0,0,0);assert.deepEqual([...env.batches.values()].flat().map(b=>Array.from(b.mesh.instanceMatrix.array).slice(0,b.mesh.count*16)),reset,'Retry restores the same original scene');
env.update(Infinity,NaN,NaN);for(const entries of env.batches.values())for(const {mesh}of entries)assert(mesh.instanceMatrix.array.every(Number.isFinite));
const bytes=[...env.geometry].reduce((sum,g)=>sum+Object.values(g.attributes).reduce((n,a)=>n+a.array.byteLength,0)+(g.index?.array.byteLength??0),0);
console.log(`PASS: ${signatures.size} authored side pairings, 3600 bounded updates, max ${maxBatches} visible instanced batches / ${maxTriangles} triangles, ${(bytes/1048576).toFixed(2)} MiB merged geometry, settled boss arena and deterministic retries.`);
let disposals=0;for(const g of env.geometry)g.addEventListener('dispose',()=>disposals++);env.dispose();assert.equal(scene.children.length,0);assert.equal(disposals,geometryCount);env.dispose();assert.equal(disposals,geometryCount);
console.log('PASS: idempotent full environment disposal; tests parsed the actual exported GLBs.');
