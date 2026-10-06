import {build} from '../asset-viewer/node_modules/esbuild/lib/main.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {Scene,Vector3,Matrix4,Color} from '../asset-viewer/node_modules/three/build/three.module.js';
import {GLTFLoader} from '../asset-viewer/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..'),out=path.join(root,'builds/continuous-environment-check.mjs');
await build({entryPoints:[path.join(here,'continuous-route-environment.ts')],bundle:true,platform:'node',format:'esm',target:'es2022',nodePaths:[path.join(root,'tools/asset-viewer/node_modules')],outfile:out});
const {ContinuousRouteEnvironment,CONTINUOUS_ROUTE,CONTINUOUS_ENVIRONMENT_ASSETS,planContinuousSection,continuousRoutePalette}=await import(pathToFileURL(out).href);
globalThis.self=globalThis;
const loader=new GLTFLoader(),library=new Map(),sources={};
for(const name of CONTINUOUS_ENVIRONMENT_ASSETS){const bytes=await fs.readFile(path.join(root,'assets/exports/reforged',name+'.glb'));const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');library.set(name,gltf.scene);sources[name]={bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}
const scene=new Scene(),env=new ContinuousRouteEnvironment(scene);await env.load(library);
assert.equal(CONTINUOUS_ROUTE.width,9.7);assert.equal(env.floor.position.y,-.08);env.floor.geometry.computeBoundingBox();assert(Math.abs(env.floor.geometry.boundingBox.max.y+env.floor.position.y)<1e-7,'Single physical walking surface is y0');assert(Math.abs(env.floor.geometry.boundingBox.max.x-env.floor.geometry.boundingBox.min.x-9.7)<1e-6);
assert.equal(CONTINUOUS_ENVIRONMENT_ASSETS.length,14);assert(!CONTINUOUS_ENVIRONMENT_ASSETS.some(n=>/Marshal|Colossus|Sentinel|Crawler|Warden/.test(n)),'Only environment assets are imported');
const plans=Array.from({length:68},(_,i)=>planContinuousSection(i));assert(plans.some(p=>p.zone===0&&p.deck==='SuspendedIsland'));assert(plans.some(p=>p.zone===1&&p.deck==='SunkenRoute'));assert(plans.some(p=>p.zone===2&&p.left==='CitadelSpire'));assert(new Set(plans.map(p=>p.left+'/'+p.right)).size>=12);
for(const boundary of[CONTINUOUS_ROUTE.stormStart,CONTINUOUS_ROUTE.forgeStart]){
 const a=continuousRoutePalette(boundary-.001),b=continuousRoutePalette(boundary+.001);for(const key of Object.keys(a)){const ca=new Color(a[key]),cb=new Color(b[key]);assert(Math.abs(ca.r-cb.r)+Math.abs(ca.g-cb.g)+Math.abs(ca.b-cb.b)<.004,'Palette cannot pop at marker');}
 env.update(boundary-40,0,0);const zs=new Set(env.diagnostics.sections.map(s=>s.zone));assert(zs.size>=2,'The next physical zone is visible ahead before marker');
}
const snapshot=()=>[...env.batches].map(([name,bs])=>[name,...bs.map(b=>[b.mesh.count,...Array.from(b.mesh.instanceMatrix.array.slice(0,b.mesh.count*16)),...Array.from(b.mesh.instanceColor?.array.slice(0,b.mesh.count*3)??[])])]);
env.update(229.39,0,0);const unchanged=snapshot();env.update(229.39,3,0);assert.deepEqual(snapshot(),unchanged,'Stage marker cannot replace nearby geometry');
env.update(107.999,0,0);const before=env.diagnostics.sections;env.update(108.001,0,0);const after=env.diagnostics.sections;for(const prior of before){const kept=after.find(p=>p.section===prior.section);if(kept)assert.deepEqual(kept,prior,'Recycling retains absolute section identity');}
console.log('PASS: actual native library, clear y0/9.7m deck, three spatial profiles, upcoming-zone visibility, smooth palette and continuous recycling.');

const matrix=new Matrix4(),point=new Vector3();let inspectedVertices=0,minDecorX=Infinity;
const distances=[0,100,190,229.39,229.41,300,400,473.59,473.61,560,650,710,732.6];
for(const distance of distances){
 env.update(distance,0,.07);
 for(const [name,bs]of env.batches)for(const {mesh}of bs){const p=mesh.geometry.getAttribute('position');for(let instance=0;instance<mesh.count;instance++){mesh.getMatrixAt(instance,matrix);
  for(let i=0;i<p.count;i++){point.fromBufferAttribute(p,i).applyMatrix4(matrix);assert([point.x,point.y,point.z].every(Number.isFinite));inspectedVertices++;
   if(point.z<-CONTINUOUS_ROUTE.far||point.z>CONTINUOUS_ROUTE.rear||point.y<=.08)continue;
   if(name==='ReactorBulkhead'){assert(point.z<-38,'Only final rear seal may span the far lane');continue;}
   minDecorX=Math.min(minDecorX,Math.abs(point.x));assert(Math.abs(point.x)>=4.85-1e-5,`Native decorative vertex intrudes into collision corridor: ${name} distance${distance} x${point.x} y${point.y} z${point.z}`);
  }
 }}
 const arena=env.batches.get('CitadelBowl');if(distance<600)assert(arena.every(b=>b.mesh.count===0),'No intermediate boss arenas');
 if(distance===732.6){assert(arena.every(b=>b.mesh.count===1),'Exactly one final arena');for(const b of env.batches.get('ReactorBulkhead')){b.mesh.getMatrixAt(0,matrix);assert(matrix.elements[14]<-40,'Rear seal remains behind boss');}}
}
console.log(`PASS: ${inspectedVertices} transformed native vertices checked, full-route decoration remains outside +/-4.85m except distant final rear seal.`);
env.update(80,0,0);const paused=snapshot();env.update(80,0,0);assert.deepEqual(snapshot(),paused,'dt0 holds crane articulation');
const craneBefore=snapshot().filter(row=>String(row[0]).startsWith('ArticulatedServiceArm'));for(let i=0;i<20;i++)env.update(80,0,.05);const craneAfter=snapshot().filter(row=>String(row[0]).startsWith('ArticulatedServiceArm'));assert.notDeepEqual(craneBefore,craneAfter,'Native shoulder/forearm/claw are articulated, not flattened');
const staticBefore=snapshot().filter(row=>!String(row[0]).startsWith('ArticulatedServiceArm'));for(let i=0;i<20;i++)env.update(80,0,.05);assert.deepEqual(snapshot().filter(row=>!String(row[0]).startsWith('ArticulatedServiceArm')),staticBefore,'Travel stopped does not drift architecture');
let maxBatches=0,maxInstances=0,maxTriangles=0;const geometryCount=env.geometries.size,children=env.root.children.length;
for(let i=0;i<3000;i++){env.update((i%1000)*.734,i%5,1/60);const stats=env.diagnostics;assert.equal(stats.geometries,geometryCount);assert.equal(env.root.children.length,children);for(const bs of env.batches.values())for(const b of bs)assert(b.mesh.count<=b.mesh.instanceMatrix.count);maxBatches=Math.max(maxBatches,stats.batches);maxInstances=Math.max(maxInstances,stats.instances);maxTriangles=Math.max(maxTriangles,stats.triangles);}
env.update(732.6,4,0);const settled=snapshot();env.update(900,4,0);assert.deepEqual(snapshot(),settled,'Distance overshoot cannot carry the final rear wall through combat');
assert.throws(()=>env.setRoute({stormStart:229,forgeStart:Infinity,arenaStart:Infinity}));
env.update(NaN,Infinity,NaN);for(const bs of env.batches.values())for(const b of bs)assert(b.mesh.instanceMatrix.array.every(Number.isFinite));
assert(maxBatches<=34);let disposals=0;for(const g of env.geometries)g.addEventListener('dispose',()=>disposals++);env.dispose();assert.equal(disposals,geometryCount);assert.equal(scene.children.length,0);env.dispose();assert.equal(disposals,geometryCount);
console.log(`PASS: real native crane articulation/pause, 3000 bounded updates, ${maxBatches} active batches / ${maxInstances} instances / ${maxTriangles} triangles, idempotent disposal.`);
const receipt={checkedAt:new Date().toISOString(),scope:'CPU geometry/transform tests using all 14 real native environment GLBs. No rendered appearance or mobile performance claim.',checks:['native source/environment-only whitelist','collision-aligned continuous deck','three distinct absolute-distance profiles','upcoming zones visible before boundaries','smooth lighting palette','stable recycling and stage-independent identity','actual transformed native lane safety','one final arena and safe rear seal','native crane articulation and pause','3000 bounded updates and disposal'],sourceSha256:createHash('sha256').update(await fs.readFile(path.join(here,'continuous-route-environment.ts'))).digest('hex'),route:CONTINUOUS_ROUTE,sources,inspectedVertices,minDecorX,geometryCount,maxBatches,maxInstances,maxTriangles};
await fs.writeFile(path.join(root,'builds/continuous-environment-review.json'),JSON.stringify(receipt,null,2)+'\n');
