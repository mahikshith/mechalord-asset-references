import {build} from '../asset-viewer/node_modules/esbuild/lib/main.js';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {Scene,Matrix4,Vector3,SRGBColorSpace} from '../asset-viewer/node_modules/three/build/three.module.js';

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..'),output=path.join(root,'builds/environment-regression.mjs');
await fs.mkdir(path.dirname(output),{recursive:true});
await build({entryPoints:[path.join(here,'environment.ts')],bundle:true,platform:'node',format:'esm',target:'es2022',nodePaths:[path.join(root,'tools/asset-viewer/node_modules')],outfile:output});
const {BattleEnvironment,planEnvironmentSection,ENVIRONMENT_PALETTES}=await import(pathToFileURL(output).href);

const signatures=new Set();
assert.equal(ENVIRONMENT_PALETTES.length,5);assert.equal(new Set(ENVIRONMENT_PALETTES.map(p=>p.sky)).size,5);
for(let stage=0;stage<5;stage++)for(let section=0;section<300;section++){
  const plan=planEnvironmentSection(section,stage);assert.deepEqual(plan,planEnvironmentSection(section,stage));
  assert(plan.left>=0&&plan.left<6&&plan.right>=0&&plan.right<6);signatures.add(`${plan.left},${plan.right}`);
}
assert(signatures.size>=12,'The side modules need meaningful authored variation');
assert.deepEqual(planEnvironmentSection(NaN,Infinity),planEnvironmentSection(0,0));
const scene=new Scene(),environment=new BattleEnvironment(scene),objects=environment.root.children.length;
const geometryCount=environment.geometries.size,textureCount=environment.textures.length;
const floor=environment.common.filter(mesh=>mesh.material===environment.materials.get('deck'));
assert.equal(floor.length,1);assert.equal(floor[0].geometry.attributes.position.count,36,'Road must be one box per section, not a grid of tiles');
floor[0].geometry.computeBoundingBox();assert(Math.abs(floor[0].geometry.boundingBox.max.y)<.00001);assert(Math.abs(floor[0].geometry.boundingBox.max.x*2-9.7)<.00001);
assert(!environment.root.children.some(mesh=>mesh.material===environment.materials.get('tile')),'No alternating tile material can render');
assert.equal(floor[0].material.map.colorSpace,SRGBColorSpace);assert.equal(textureCount,3);
assert.equal(environment.banks.length,5);
for(const stage of environment.banks)for(const variant of stage)for(const mesh of variant){
  mesh.geometry.computeBoundingBox();assert(mesh.geometry.boundingBox.min.x+6.3>=4.75,'Side decoration must remain outside steerable lanes');
}
console.log(`PASS: seeded plans (${signatures.size} left/right combinations), continuous 9.7m deck, no tile batches, original albedo and lane clearance.`);
const bayGeometry=stage=>environment.banks[stage].map(v=>v.map(m=>m.geometry.attributes.position.count).join(',')).join('|');
assert.notEqual(bayGeometry(3),bayGeometry(0),'Storm needs different source architecture, not only recoloring');
assert.notEqual(bayGeometry(4),bayGeometry(1),'Forge needs different source architecture, not only recoloring');
assert.notEqual(bayGeometry(3),bayGeometry(4));

// Follow a specific world section across the recycling boundary, rather than comparing array slots.
function sectionPosition(env,section,side){
  const slot=env.plans.findIndex(plan=>plan.section===section);assert(slot>=0);
  const variant=side===0?env.plans[slot].left:env.plans[slot].right;let instance=0;
  for(let i=0;i<slot;i++){if(env.plans[i].left===variant)instance++;if(env.plans[i].right===variant)instance++;}
  if(side===1&&env.plans[slot].left===variant)instance++;
  const matrix=new Matrix4();env.banks[env.level][variant][0].getMatrixAt(instance,matrix);return {variant,position:new Vector3().setFromMatrixPosition(matrix)};
}
environment.update(7.999,0,0);const before=[];
for(let section=1;section<12;section++)for(let side=0;side<2;side++)before.push([section,side,sectionPosition(environment,section,side)]);
environment.update(8.001,0,0);
for(const [section,side,previous]of before){const next=sectionPosition(environment,section,side);assert.equal(next.variant,previous.variant);assert.equal(next.position.x,previous.position.x);assert(Math.abs(next.position.z-previous.position.z-.002)<.00001);}
const plans=environment.plans.slice();for(let i=0;i<100;i++)environment.update(8.002+i*.02,0,1/60);for(let i=0;i<12;i++)assert.equal(environment.plans[i],plans[i],'No per-frame plan allocation/flicker');
console.log('PASS: all 22 retained side bays preserve identity and move continuously across recycling; plans stay cached within a section.');

let maxBatches=0,maxTriangles=0,armMoved=false,fanMoved=false;
let previousArm,previousFan;
for(let stage=0;stage<5;stage++)for(let frame=0;frame<2400;frame++){
  environment.update(frame*.17,stage,1/60);assert.equal(environment.root.children.length,objects);assert.equal(environment.geometries.size,geometryCount);assert.equal(environment.textures.length,textureCount);
  assert.equal(environment.materials.get('deck').color.getHex(),ENVIRONMENT_PALETTES[stage].deck);
  assert.equal(environment.counts.reduce((sum,n)=>sum+n,0),24,'Exactly two side bays per recycled section');
  for(let other=0;other<5;other++)if(other!==stage)assert(environment.banks[other].flat().every(m=>!m.visible&&m.count===0),'Inactive chapters cannot render');
  assert.equal(environment.chapterMotes.count,stage>=3?24:0);
  if(stage>=3&&frame%120===0){const matrix=new Matrix4();for(let i=0;i<24;i++){environment.chapterMotes.getMatrixAt(i,matrix);assert(Math.abs(new Vector3().setFromMatrixPosition(matrix).x)>5.65,'Chapter ambience cannot enter combat lanes');}}
  let batches=0,triangles=0;
  for(const mesh of environment.root.children){
    assert(mesh.count<=mesh.instanceMatrix.count);if(frame%120===0)assert(mesh.instanceMatrix.array.every(Number.isFinite));
    if(mesh.visible&&mesh.count){batches++;triangles+=(mesh.geometry.index?.count??mesh.geometry.attributes.position.count)/3*mesh.count;}
  }
  maxBatches=Math.max(maxBatches,batches);maxTriangles=Math.max(maxTriangles,triangles);
  const arm=environment.animated[0].instanceMatrix.array[13],fan=environment.animated[4].instanceMatrix.array[5];
  if(frame>0){armMoved ||= arm!==previousArm;fanMoved ||= fan!==previousFan;}previousArm=arm;previousFan=fan;
}
assert(armMoved&&fanMoved,'Articulated arms and cooling blades need real motion');assert(maxBatches<=40);assert(maxTriangles<=65000);
environment.update(Infinity,NaN,NaN);assert(environment.root.children.every(mesh=>mesh.instanceMatrix.array.every(Number.isFinite)));
const bytes=[...environment.geometries].reduce((sum,geometry)=>sum+Object.values(geometry.attributes).reduce((size,attribute)=>size+attribute.array.byteLength,0)+(geometry.index?.array.byteLength??0),0);
environment.update(30,3,1/60);const pausedAge=environment.age,pausedMatrices=environment.root.children.map(m=>Array.from(m.instanceMatrix.array));
for(let i=0;i<20;i++)environment.update(30,3,0);assert.equal(environment.age,pausedAge);environment.root.children.forEach((m,i)=>assert.deepEqual(Array.from(m.instanceMatrix.array),pausedMatrices[i],'Zero-time update must freeze all ambience'));
await fs.writeFile(path.join(root,'builds/environment-chapters-checks.json'),JSON.stringify({scope:'CPU geometry/resource/placement checks, not rendered visual acceptance or device fps',chapters:5,updates:12000,allocatedBatches:objects,maxVisibleBatches:maxBatches,maxVisibleTriangles:maxTriangles,geometryBytes:bytes,textures:textureCount,ambienceCapacity:24,pausedMatricesStable:true,timestamp:new Date().toISOString()},null,2)+'\n');
console.log(`PASS: 12000 updates, fixed ${objects} batches allocated, max ${maxBatches} visible batches / ${maxTriangles} triangles, geometry ${(bytes/1048576).toFixed(2)} MiB, five distinct chapters and frozen zero-time ambience.`);

let disposals=0;for(const geometry of environment.geometries)geometry.addEventListener('dispose',()=>disposals++);
environment.dispose();assert.equal(scene.children.length,0);assert.equal(disposals,geometryCount);environment.dispose();assert.equal(disposals,geometryCount);
console.log('PASS: complete, idempotent environment disposal.');
