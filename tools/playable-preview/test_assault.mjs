// Validates the shipped rebuilt C++/WASM core through its actual browser adapter.
// No simulation substitutes, debug state mutations, renderer mocks or paid tools.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const binaryPath=path.join(root,'delivery/playable/assault.wasm');
assert.ok(fs.existsSync(binaryPath),'Rebuild the new Assault binary before running these tests.');
const bytes=fs.readFileSync(binaryPath);
const nativeFetch=globalThis.fetch;
globalThis.fetch=async(resource,options)=>{
  const address=String(resource);
  if(/(?:^|\/)assault\.wasm(?:\?.*)?$/.test(address))return new Response(bytes,{headers:{'Content-Type':'application/wasm'}});
  return nativeFetch(resource,options);
};
const {AssaultCore}=await import('./assault-core.ts');
const core=new AssaultCore();
await core.load();
const results=[];
const winningRuns=[];
let checks=0;
const s=()=>core.snapshot();
const persistent=snapshot=>{const {effects,...rest}=snapshot;return rest;};

function test(name,action){
  try{action();results.push({name,status:'pass'});console.log('PASS '+name);}
  catch(error){results.push({name,status:'fail',error:error.message});console.error('FAIL '+name+' — '+error.message);}
  ++checks;
}
function stepFor(seconds,input=0,hz=60,onFrame){
  for(let i=0;i<Math.round(seconds*hz);++i){
    const previous=s();
    core.step(1/hz,typeof input==='function'?input(previous):input);
    if(onFrame)onFrame(s(),previous);
  }
  return s();
}
function newRun(relic=0){core.start(relic);return s();}
function chooseRoute(state){
  if(state.phase==='boss')return state.bossAttack>0?(state.bossLane>=0?-1.9:1.9):0;
  const hazard=state.targets.find(t=>t.kind==='hazard'&&t.z<4.5&&Math.abs(t.x-state.x)<t.size+.45);
  if(hazard)return hazard.x>=0?-1.7:1.7;
  const danger=state.targets.find(t=>t.kind==='enemy'&&t.z<2.2&&t.hp>0&&Math.abs(t.x-state.x)<t.size+.4);
  if(danger)return danger.x>=0?-1.7:1.7;
  const candidates=state.targets.filter(t=>(t.kind==='crate'||t.kind==='gate')&&t.z>=1.5);
  candidates.sort((a,b)=>a.z-b.z || (b.kind==='crate')-(a.kind==='crate') || b.op-a.op || b.value-a.value);
  const target=candidates[0];
  if(target)return target.x;
  const enemy=state.targets.filter(t=>t.kind==='enemy'&&t.hp>0&&t.z>2.2).sort((a,b)=>a.z-b.z)[0];
  return enemy?enemy.x:0;
}
function authoredRoute(state){
  if(state.phase==='boss')return state.bossAttack>0?(state.bossLane>=0?-1.8:1.8):0;
  // A recorded level-designer route exercises crates, different gate lanes and
  // the right-hand rapid chain. This is automated feasibility, not a new-player
  // comprehension measurement or an assumption of hands-on player skill.
  return state.time<4.08?0:state.time<5.65?-1.8:state.time<11.8?1.7:
    state.time<22?-1.7:state.time<31?2.3:state.time<39.5?1.7:
    state.time<42?0:-1.7;
}
function run(relic=0,{strategy=authoredRoute,hz=60,seconds=95,ability=false,onFrame}={}){
  newRun(relic);
  let state=s();
  for(let frame=0;frame<seconds*hz&&['run','boss'].includes(state.phase);++frame){
    if(ability&&state.energy>=100&&state.ability<=0)core.activate();
    const previous=state;
    core.step(1/hz,strategy(state));
    state=s();
    onFrame?.(state,previous);
  }
  return state;
}
function reachBoss(relic=0,{ability=false}={}){
  newRun(relic);let state=s();
  for(let frame=0;frame<56*60&&state.phase==='run';++frame){
    if(ability&&state.energy>=100&&state.ability<=0)core.activate();
    core.step(1/60,authoredRoute(state));state=s();
  }
  assert.equal(state.phase,'boss',`Runner ended in ${state.phase} at ${state.time}s with ${state.army} troops`);
  return state;
}

test('the browser adapter loads the actual shipped Assault WASM',()=>{
  const module=new WebAssembly.Module(bytes);
  assert.ok(core.api.memory instanceof WebAssembly.Memory);
  for(const item of WebAssembly.Module.imports(module)){
    assert.equal(item.kind,'function');
    assert.equal(item.module,'wasi_snapshot_preview1');
    assert.ok(['fd_close','fd_seek','fd_write'].includes(item.name),`Unexpected browser dependency ${item.name}`);
  }
});
test('a fresh run resets army, weapon, charge, clock and transient objects',()=>{
  const state=newRun(0);
  assert.equal(state.phase,'run');assert.equal(state.time,0);assert.equal(state.duration,55);
  assert.equal(state.x,0);assert.ok(state.army>0);assert.equal(state.energy,100);
  assert.equal(state.weapon,1);assert.equal(state.kills,0);assert.equal(state.ability,0);
  assert.equal(state.shots.length,0);assert.equal(state.effects.length,0);
});
test('army attacks are represented by moving projectiles rather than proximity-only damage',()=>{
  newRun(0);let observedShot=false;let moved=false;let hit=false;
  stepFor(12,chooseRoute,60,(now,before)=>{
    if(now.shots.length)observedShot=true;
    if(before.shots.some(a=>now.shots.some(b=>Math.abs(a.x-b.x)<.025&&b.z>a.z+.02)))moved=true;
    if(now.effects.some(e=>e.kind==='hit'))hit=true;
  });
  assert.ok(observedShot,'No live projectile was exposed');assert.ok(moved,'Projectile positions did not advance');assert.ok(hit,'No projectile collision produced hit feedback');
});
test('horizontal input respects world bounds and movement speed',()=>{
  newRun(0);const first=stepFor(1/60,100);
  assert.ok(first.x<=9/60+.0001);const right=stepFor(2,100);assert.equal(right.x,3);
  const left=stepFor(2,-100);assert.equal(left.x,-3);
});
test('each of the three relics spends charge, prevents duplicate activation and expires',()=>{
  for(let relic=0;relic<3;++relic){
    const fresh=newRun(relic);assert.equal(fresh.relic,relic);
    assert.equal(core.activate(),true);assert.equal(core.activate(),false);
    const active=s();assert.equal(active.energy,0);assert.ok(active.ability>0);
    const expired=stepFor(7,3);assert.equal(expired.ability,0);
  }
});
test('pause freezes input, time, active ability, targets and projectiles',()=>{
  newRun(1);stepFor(5,chooseRoute);core.activate();s();core.pause(true);
  const before=persistent(s());stepFor(10,-3);
  assert.deepEqual(persistent(s()),before);assert.equal(core.activate(),false);
  core.pause(false);const resumed=stepFor(.5,0);assert.ok(resumed.time>before.time);assert.ok(resumed.ability<before.ability);
});
test('constant input has equivalent fixed-step outcomes at 30, 60 and 120 Hz',()=>{
  const replay=hz=>{newRun(0);return persistent(stepFor(15,0,hz));};
  const reference=replay(60);assert.deepEqual(replay(30),reference);assert.deepEqual(replay(120),reference);
});
test('an active run stays inside target, projectile and effect pool bounds',()=>{
  let maximumTargets=0,maximumShots=0,maximumEffects=0;
  run(2,{ability:true,onFrame:now=>{
    maximumTargets=Math.max(maximumTargets,now.targets.length);maximumShots=Math.max(maximumShots,now.shots.length);maximumEffects=Math.max(maximumEffects,now.effects.length);
    assert.ok(now.targets.length<=160);assert.ok(now.shots.length<=256);assert.ok(now.effects.length<=128);
    for(const key of ['time','x','army','energy','weapon','bossHp','score'])assert.ok(Number.isFinite(now[key]),`Non-finite ${key}`);
  }});
  assert.ok(maximumTargets>0);assert.ok(maximumShots>0);
});

test('shooting a gate grows its displayed value before crossing and it applies exactly once',()=>{
  const first=newRun(0).targets.find(t=>t.kind==='gate');
  assert.ok(first);let improved=false;let applications=0;let growth=0;
  const after=stepFor(4.2,0,60,now=>{
    const gate=now.targets.find(t=>t.id===first.id);
    if(gate&&gate.hp<first.hp&&gate.value>first.value&&gate.z>1){improved=true;growth=gate.value;}
    applications+=now.effects.filter(e=>e.kind==='gate'&&Math.abs(e.x)<.01).length;
  });
  assert.ok(improved,'Shots never improved the gate before passage');
  assert.equal(applications,1);assert.equal(after.army,8+growth);
  const later=stepFor(.6,0,60,now=>{applications+=now.effects.filter(e=>e.kind==='gate'&&Math.abs(e.x)<.01).length;});
  assert.equal(applications,1);assert.equal(later.army,after.army);
  assert.ok(!later.targets.some(t=>t.id===first.id),'Collected gate stayed live');
});
test('projectiles that miss a gate laterally do not damage or improve it',()=>{
  const original=newRun(0).targets.find(t=>t.kind==='gate');
  const after=stepFor(3.5,3).targets.find(t=>t.id===original.id);
  assert.ok(after);assert.equal(after.hp,original.hp);assert.equal(after.value,original.value);
});
test('shooting a negative gate can improve its signed value before it is collected',()=>{
  let observedNegative=false,improved=false,application;
  run(0,{ability:true,strategy:state=>state.phase==='run'&&state.time>=5.65&&state.time<13.05?1.7:authoredRoute(state),onFrame:now=>{
    const negative=now.targets.find(t=>t.kind==='gate'&&Math.abs(t.x-1.7)<.01&&t.op===0&&t.maxHp===56);
    if(negative){observedNegative ||= negative.value<0;improved ||= negative.value>=0&&negative.hp<negative.maxHp;}
    if(now.time>12.8&&now.time<13.1)application??=now.effects.find(e=>e.kind==='gate'&&Math.abs(e.x-1.7)<.01);
  }});
  assert.ok(observedNegative,'No signed negative gate appeared');assert.ok(improved,'Gate shots did not improve the negative offer');
  assert.ok(application,'Improved negative gate was not collected');assert.ok(application.value>=0);
});
test('the short-interval side-gate chain yields multiple separate collections without looping',()=>{
  let spawned=new Set(),collections=0;const collectedTimes=[];
  run(0,{ability:true,onFrame:now=>{
    for(const gate of now.targets.filter(t=>t.kind==='gate'&&Math.abs(t.x-2.3)<.01))spawned.add(gate.id);
    for(const event of now.effects.filter(e=>e.kind==='gate'&&Math.abs(e.x-2.3)<.01)){
      ++collections;collectedTimes.push(now.time);assert.ok(event.value>=2&&event.value<=5);
    }
  }});
  assert.equal(spawned.size,8);assert.ok(collections>=4&&collections<=spawned.size);
  for(let i=1;i<collectedTimes.length;++i)assert.ok(collectedTimes[i]-collectedTimes[i-1]>.7,'A chain gate collected repeatedly');
});
test('crates take projectile damage and unlock two stronger weapon tiers',()=>{
  let firstCrateHpLoss=false;const tiers=new Set([1]);
  run(0,{ability:true,onFrame:(now,before)=>{
    tiers.add(now.weapon);
    for(const crate of before.targets.filter(t=>t.kind==='crate')){
      const current=now.targets.find(t=>t.id===crate.id);
      if(current&&current.hp<crate.hp&&current.z>1)firstCrateHpLoss=true;
    }
  }});
  assert.ok(firstCrateHpLoss,'No intact crate took ranged projectile damage');
  assert.ok(tiers.has(2),'First weapon upgrade was unavailable');assert.ok(tiers.has(3),'Second weapon upgrade was unavailable');
});
test('the stronger front barrier is a breakable target that yields combat loot',()=>{
  let barrierId,seen=false,damaged=false,destroyed=false;
  run(0,{ability:true,onFrame:(now,before)=>{
    const barrier=now.targets.find(t=>t.kind==='crate'&&t.maxHp===50);
    if(barrier){barrierId=barrier.id;seen=true;damaged ||= barrier.hp<barrier.maxHp;}
    const previous=before.targets.find(t=>t.id===barrierId&&t.kind==='crate');
    if(previous&&!now.targets.some(t=>t.id===barrierId)&&now.effects.some(e=>e.kind==='kill'&&e.value===30&&Math.abs(e.x-previous.x)<.01)){
      destroyed=true;assert.ok(now.score>=before.score+30);
    }
  }});
  assert.ok(seen,'The stronger front barrier never spawned');assert.ok(damaged,'Projectiles never damaged the barrier');
  assert.ok(destroyed,'The barrier was never destroyed for loot');
});
test('the authored runner lasts 55 seconds and transfers the surviving squad to an attacking boss',()=>{
  const state=reachBoss(0,{ability:true});
  assert.ok(state.time>=55&&state.time<55.04);assert.ok(state.army>0);
  assert.equal(state.bossHp,state.bossMax);assert.equal(state.targets.length,0);assert.equal(state.shots.length,0);
  assert.equal(state.weapon,3);assert.equal(state.relic,0);
});
test('a viable route wins with each relic using normal controls and no purchased upgrades',()=>{
  for(let relic=0;relic<3;++relic){
    const state=run(relic,{ability:true});
    assert.equal(state.phase,'won',`Relic ${relic} ended ${state.phase} at ${state.time}s, army ${state.army}, bossHP ${state.bossHp}`);
    assert.equal(state.bossHp,0);assert.ok(state.army>0);assert.ok(state.time>55&&state.time<=95);
    winningRuns.push({relic,time:state.time,army:state.army,weapon:state.weapon,kills:state.kills,score:state.score});
  }
});
test('missing recruitment and failing to dodge can lose rather than guaranteeing victory',()=>{
  let damage=false;
  const state=run(0,{strategy:()=>3,onFrame:now=>{damage ||= now.effects.some(e=>e.kind==='damage'&&e.value>0);}});
  assert.ok(damage,'Poor route never received damage');assert.equal(state.phase,'lost');assert.equal(state.army,0);
  const stopped=persistent(state);assert.deepEqual(persistent(stepFor(4,0)),stopped);assert.equal(core.activate(),false);
});
test('boss locks a warning lane and dodging prevents its impact damage',()=>{
  const unsafeStart=reachBoss(0,{ability:true});
  // Wait outside the boss hit region so the attack can be measured before a win.
  core.pause(false);let warned=false;let unsafeImpact=false;
  const unsafe=stepFor(4.1,3,60,now=>{
    warned ||= now.bossAttack>0;
    unsafeImpact ||= now.effects.some(e=>e.kind==='damage'&&e.value>0);
  });
  assert.ok(warned);assert.ok(unsafeImpact,'Standing in the warned lane caused no damage');
  assert.ok(unsafe.army<unsafeStart.army);
  const safeStart=reachBoss(0,{ability:true});
  let warnedLane;let safeImpact=false;
  const safe=stepFor(4.1,state=>{
    if(state.bossAttack>0){warnedLane??=state.bossLane;assert.equal(state.bossLane,warnedLane);return state.bossLane>=0?-1.9:1.9;}
    return 3;
  },60,now=>{safeImpact ||= now.effects.some(e=>e.kind==='damage'&&e.value>0);});
  assert.ok(warnedLane!==undefined);assert.equal(safeImpact,false);assert.equal(safe.army,safeStart.army);
});
test('Overdrive increases the live projectile stream during its active window',()=>{
  newRun(0);core.activate();const ordinary=stepFor(.9,3).shots.length;
  newRun(2);core.activate();const boosted=stepFor(.9,3).shots.length;
  assert.ok(boosted>ordinary,`Overdrive ${boosted} shots versus ordinary ${ordinary}`);
});
test('Shield blocks a real approaching hazard that otherwise removes troops',()=>{
  newRun(0);const ordinaryBefore=stepFor(13,0);assert.equal(ordinaryBefore.phase,'run');
  const ordinaryAfter=stepFor(1,0);assert.ok(ordinaryAfter.army<ordinaryBefore.army);
  newRun(0);const shieldBefore=stepFor(13,0);assert.equal(core.activate(),true);
  const shieldAfter=stepFor(1,0);assert.equal(shieldAfter.army,shieldBefore.army);
});
test('EMP freezes hostile machines while gates and projectiles keep moving',()=>{
  newRun(1);const before=stepFor(3,3);
  const enemy=before.targets.find(t=>t.kind==='enemy'&&t.x<-2);
  const gate=before.targets.find(t=>t.kind==='gate');assert.ok(enemy&&gate);
  assert.equal(core.activate(),true);const after=stepFor(.5,3);
  const frozen=after.targets.find(t=>t.id===enemy.id);const moving=after.targets.find(t=>t.id===gate.id);
  assert.ok(frozen&&moving);assert.equal(frozen.z,enemy.z);assert.ok(moving.z<gate.z);
  assert.ok(after.shots.length>0);assert.ok(after.time>before.time);
});
test('250 retries reset transient state and keep the allocated WASM memory bounded',()=>{
  const resetTargets=newRun(0).targets;
  assert.ok(resetTargets.some(t=>t.kind==='gate'));assert.ok(resetTargets.filter(t=>t.kind==='enemy').length>=3,'Warmup enemies were missing');
  run(2,{ability:true});const baseline=core.api.memory.buffer.byteLength;
  for(let retry=0;retry<250;++retry){
    newRun(retry%3);stepFor(3,0);core.pause(true);const fresh=newRun(0);
    assert.equal(fresh.time,0);assert.equal(fresh.army,8);assert.equal(fresh.weapon,1);assert.equal(fresh.energy,100);
    assert.equal(fresh.ability,0);assert.equal(fresh.kills,0);assert.equal(fresh.shots.length,0);
    assert.deepEqual(fresh.targets,resetTargets);assert.equal(fresh.effects.length,0);
    assert.equal(core.api.memory.buffer.byteLength,baseline);
    core.step(1/60,0);assert.ok(s().time>0,'Retry retained paused state');
  }
});

const heuristic=run(0,{strategy:chooseRoute,ability:true});
const centerOnly=run(0,{strategy:()=>0});
const strategyObservations={
  reactiveHeuristic:{phase:heuristic.phase,time:heuristic.time,army:heuristic.army,weapon:heuristic.weapon},
  centerOnly:{phase:centerOnly.phase,time:centerOnly.time,army:centerOnly.army,weapon:centerOnly.weapon},
  interpretation:'Automated strategies, not first-time-player observations. Authored winning route uses knowledge of the encounter timeline.'};
const report={schema:1,scope:'Actual rebuilt Assault browser adapter and shipped WASM; no Unreal or physical-device validation',
  binary:binaryPath,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),memoryBytes:core.api.memory.buffer.byteLength,
  testedAt:new Date().toISOString(),winningRuns,strategyObservations,tests:checks,passed:results.filter(r=>r.status==='pass').length,
  failed:results.filter(r=>r.status==='fail').length,results};
fs.mkdirSync(path.join(root,'builds'),{recursive:true});
fs.writeFileSync(path.join(root,'builds/rebuild-test-results.json'),JSON.stringify(report,null,2));
console.log(`${report.passed}/${checks} rebuilt-core tests passed.`);
if(report.failed)process.exitCode=1;
