// Independent approach audit: public controls, no simulation state injection.
import fs from'node:fs';import path from'node:path';import assert from'node:assert/strict';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),binary=path.resolve(process.argv[2]??path.join(root,'delivery/playable/assault.wasm')),bytes=fs.readFileSync(binary);globalThis.fetch=async()=>new Response(bytes);
const{AssaultCore}=await import('./assault-core.ts');const core=new AssaultCore();await core.load();assert.equal(core.api.abi_version(),5);
const runs=[],checks=[],footprints=new Map();let overlaps=0,samples=0;
function check(name,fn){try{fn();checks.push({name,status:'pass'});}catch(e){checks.push({name,status:'fail',error:e.message});}}
function lane(s){
 const pickup=s.pickups.filter(p=>p.z<7).sort((a,b)=>a.z-b.z)[0],targets=s.targets.filter(t=>t.z>0&&t.z<29&&(t.kind==='gate'||t.kind==='crate'||t.kind==='orb'||t.role==='carrier'||t.role==='battery'||t.role==='gunner')).sort((a,b)=>a.z-b.z);let x=pickup?.x??targets[0]?.x??0;
 const gate=s.targets.filter(t=>t.kind==='gate'&&t.z>0&&t.z<3.5).sort((a,b)=>a.z-b.z)[0]??(targets[0]?.kind==='gate'?targets[0]:null);if(gate&&!pickup){const options=s.targets.filter(t=>t.kind==='gate'&&Math.abs(t.z-gate.z)<.02).sort((a,b)=>(b.op?s.army*(b.value-1):b.value)-(a.op?s.army*(a.value-1):a.value));x=options[0].x;}
 const roller=s.targets.find(t=>t.kind==='hazard'&&t.z<4&&t.z>-4&&Math.abs(t.x-x)<t.size+.7);return roller?(roller.x>0?-3:3):x;
}
for(const level of[3,4])for(const rank of[0,3])for(const relic of[0,1,2]){
 core.start(relic,level,rank);let s=core.snapshot();const seen=new Set(s.targets.map(t=>t.id)),projectiles=new Set(),gates=new Set(),choices=new Set(),powerGroups=new Map(),signature=[];let duplicateGate=0,duplicateChoice=0,siblingNotClosed=0,minBirth=Infinity,shots=0,rollers=0,carriers=0,gateBirths=0,spawnSteps=0,maxPool=0;
 for(let frame=0;frame<120*60&&s.phase==='run';frame++){
  if(s.energy>=100&&s.ability===0&&(relic===2||s.enemyShots.some(p=>p.z<12)||s.targets.some(t=>t.kind==='enemy'&&t.z<12)))core.activate();const b=s;core.step(1/60,lane(s));s=core.snapshot();const born=s.targets.filter(t=>!seen.has(t.id));if(born.length){spawnSteps++;signature.push({traversalSecond:Math.round(s.travelDistance/3.7*10)/10,targets:born.map(t=>({kind:t.kind,role:t.role,x:Math.round(t.x*10)/10,hp:t.maxHp,value:t.value})).sort((a,b)=>a.x-b.x)});}
  for(const t of born){seen.add(t.id);minBirth=Math.min(minBirth,t.z);rollers+=t.kind==='hazard';carriers+=t.role==='carrier';gateBirths+=t.kind==='gate';}
  for(const p of s.enemyShots)if(!projectiles.has(p.id)){projectiles.add(p.id);shots++;}
  for(const p of s.pickups)if(p.choiceGroup){if(!powerGroups.has(p.choiceGroup))powerGroups.set(p.choiceGroup,new Set());powerGroups.get(p.choiceGroup).add(p.kind);}
  for(const e of s.effects){if(e.kind==='gate'){duplicateGate+=gates.has(e.entityId);gates.add(e.entityId);}if(e.kind==='pickup'){const old=b.pickups.find(p=>p.id===e.entityId);if(old?.choiceGroup){duplicateChoice+=choices.has(old.choiceGroup);choices.add(old.choiceGroup);siblingNotClosed+=s.pickups.some(p=>p.choiceGroup===old.choiceGroup);}}}
  // A body may recoil/retire after contact; only still-approaching footprints
  // must be separated from the actual trailing formation at snapshot time.
  // ABI4 publishes target mode in its raw row even though the view adapter does
  // not retain it. Read that existing public export to exclude real retirees.
  const raw=new Float32Array(core.api.memory.buffer,core.api.targets(),core.api.target_count()*24),modes=new Map();for(let i=0;i<raw.length;i+=24)modes.set(raw[i],raw[i+7]);
  const formation=[{x:s.x,z:0,r:.4},...s.formation.map(p=>({...p,r:.36}))];for(const t of s.targets){if(t.kind==='enemy'&&modes.get(t.id)===0||t.kind==='hazard')for(const p of formation){samples++;const rx=t.kind==='hazard'?t.size*1.048:t.size,rz=t.kind==='hazard'?.8:t.depth,dx=(p.x-t.x)/(rx+p.r-.001),dz=(p.z-t.z)/(rz+p.r-.001);if(t.kind==='hazard'?Math.abs(dx)<1&&Math.abs(dz)<1:dx*dx+dz*dz<1)overlaps++;}}
  maxPool=Math.max(maxPool,s.targets.length);if(!Number.isFinite(s.time)||s.targets.some(t=>!Number.isFinite(t.x)||!Number.isFinite(t.z)))throw Error('Nonfinite chapter state');
 }
 const pairs=[...powerGroups.values()].map(set=>[...set].sort()),required=level===3?['arcstorm','freeze']:['salvo','tempest'];
 const run={level,rank,relic,phase:s.phase,duration:s.duration,time:s.time,spawnSteps,minBirthZ:minBirth,hostileLaunches:shots,rollers,carriers,gateBirths,appliedGates:gates.size,duplicateGate,duplicateChoice,siblingNotClosed,maxTargetPool:maxPool,choicePairs:pairs};runs.push(run);
 check(`chapter${level} rank${rank} relic${relic}: authored pressure and conserved choices`,()=>{assert.equal(s.phase,'boss','Public approach controller did not reach the chapter boss');assert.equal(s.duration,level===3?96:102);assert(s.bossRegions.length===7&&s.bossComponents.length===11);assert(minBirth>=39.7,'A new threat appeared inside the horizon');assert(rollers>=2&&carriers>=3&&gateBirths>=6);assert(shots>0,'Authored ranged threats never fired');assert(maxPool<=256);assert.equal(duplicateGate,0);assert.equal(duplicateChoice,0);assert.equal(siblingNotClosed,0);assert(pairs.some(pair=>JSON.stringify(pair)===JSON.stringify(required)),'The chapter-specific fixed choice pair was never earned');});
 if(rank===0&&relic===0)footprints.set(level,signature);
}
check('Storm Pass and Forge Core are distinct encounter fingerprints',()=>{assert.notDeepEqual(footprints.get(3),footprints.get(4));assert(footprints.get(3)?.length>=15&&footprints.get(4)?.length>=15);});
check('approaching bodies and rollers never silently occupy live formation',()=>{assert(samples>1000);assert.equal(overlaps,0);});
const report={scope:'Actual ABI4 WASM approach footprints, fixed choice opportunities, gate conservation and snapshot separation; not full boss balance, rendering, human or phone validation',binary,sha256:createHash('sha256').update(bytes).digest('hex'),timestamp:new Date().toISOString(),sampleCount:samples,overlaps,runs,footprints:Object.fromEntries(footprints),tests:checks.length,passed:checks.filter(c=>c.status==='pass').length,failed:checks.filter(c=>c.status==='fail').length,checks};fs.writeFileSync(path.join(root,'builds/new-chapters-audit.json'),JSON.stringify(report,null,2)+'\n');console.log(`${report.passed}/${report.tests} passed; ${runs.length} public-control approaches, ${samples} separation samples.`);if(report.failed){console.log(checks.filter(c=>c.status==='fail'));process.exitCode=1;}
