// Independent, bounded controller audit of the shipping C++ binary and real adapter.
// Run with Node 24+. No writes to simulation, no state injection, no future schedule.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const binary=path.resolve(process.argv[2]??path.join(root,'delivery/playable/assault.wasm'));
const bytes=fs.readFileSync(binary);
globalThis.fetch=async()=>new Response(bytes);
const {AssaultCore}=await import('../tools/playable-preview/assault-core.ts');
const core=new AssaultCore();await core.load();
core.start(0,0,0);const identity=core.snapshot();
assert.equal(identity.levelName,'Reactor Siege','Old WASM: do not report it as the candidate.');
assert.equal(identity.duration,90);
const results=[],runs=[];
function check(name,fn){try{fn();results.push({name,status:'pass'});}catch(error){results.push({name,status:'fail',error:error.message});}}
const clamp=x=>Math.max(-3,Math.min(3,x));
function feasibility(s){
 if(s.phase==='boss'){
  if(s.lasers.length||s.bossPattern==='laser'&&s.bossAttack>.3)return s.bossLane>0?-3:3;
  const regions=(s.bossRegions??[]).filter(r=>r.active&&r.vulnerable&&r.hp>0&&r.z>=4&&r.z<=26);
  const loot=s.pickups.filter(p=>p.z<5&&p.z>-.2).sort((a,b)=>a.z-b.z)[0];const focus=loot?.x??((s.level===0||s.level>=3)?regions.sort((a,b)=>a.hp-b.hp||Math.abs(a.x-s.x)-Math.abs(b.x-s.x))[0]?.x??s.x:s.bossX);
  const shots=s.enemyShots.filter(p=>p.z<5.5&&p.dz<0).map(p=>({x:p.x-p.dx*p.z/p.dz,r:p.radius+.5}));
  return [clamp(focus),-2.8,2.8,-1.5,1.5,0].filter(x=>!shots.some(p=>Math.abs(x-p.x)<p.r)).sort((a,b)=>Math.abs(a-focus)-Math.abs(b-focus))[0]??clamp(focus);
 }
 const pickup=s.pickups.filter(p=>p.z<6).sort((a,b)=>a.z-b.z)[0];
 const goals=s.targets.filter(t=>t.z>1&&t.z<29&&(t.kind==='crate'||t.kind==='gate'||t.kind==='orb'||t.kind==='enemy'&&t.variant>0&&(t.z<14||(s.level===0||s.level>=3)&&['gunner','battery','carrier'].includes(t.role)&&t.z<25))).sort((a,b)=>a.z-b.z);
 let desired=pickup?.x??goals[0]?.x??0;
 const gate=s.targets.filter(t=>t.kind==='gate'&&t.z>0&&t.z<3.5).sort((a,b)=>a.z-b.z)[0]??(goals[0]?.kind==='gate'?goals[0]:null);
 if(gate){const pair=s.targets.filter(t=>t.kind==='gate'&&Math.abs(t.z-gate.z)<.02);pair.sort((a,b)=>(b.op?s.army*(b.value-1):b.value)-(a.op?s.army*(a.value-1):a.value));desired=pair[0].x;}
 const hazard=s.targets.find(t=>t.kind==='hazard'&&t.z<3&&Math.abs(t.x-desired)<t.size+.5);
 return hazard?(hazard.x>0?-3:3):desired;
}
function observedChoice(s){
 // Restrict decisions to the readable approach and pickup-label range.
 s={...s,targets:s.targets.filter(t=>t.z<=25&&t.z>-4),pickups:s.pickups.filter(p=>p.z<=19&&p.z>-2)};
 let desired=feasibility(s);
 // Ordinary aimed fire is visible; project its current committed path, not future AI.
 const half=Math.max(.4,...s.formation.map(p=>Math.abs(p.x-s.x)+.36));
 const nearby=s.enemyShots.filter(p=>p.dz<-.01&&p.z>-4&&p.z<12);
 const eligible=(s.bossRegions??[]).filter(r=>r.active&&r.vulnerable&&r.hp>0&&r.z>=4&&r.z<=26);
 const candidates=[clamp(desired),...eligible.map(r=>clamp(r.x)),-2.8,-1.4,0,1.4,2.8,clamp(s.x)];
 function cost(x){let n=Math.abs(x-desired)*.28+Math.abs(x-s.x)*.08;
  for(const p of nearby){const t=Math.max(0,p.z/-p.dz),impact=p.x+p.dx*t;if(Math.abs(x-impact)<half+p.radius+.12)n+=6/(1+t);}
  for(const l of s.lasers){if(Math.abs(x-l.endX)<half+l.width+.12)n+=20;}
  for(const t of s.targets.filter(t=>['gunner','battery'].includes(t.role)&&['locked','fire'].includes(t.fireState)&&t.z<25))if(Math.abs(x-t.aimX)<half+.45)n+=7;
  if(s.phase==='boss'&&s.bossPattern==='laser'&&s.bossAttack>.2&&Math.abs(x-s.bossLane)<half+.35)n+=15;
  for(const h of s.targets.filter(t=>t.kind==='hazard'&&t.z<8&&t.z>-4))if(Math.abs(x-h.x)<h.size*1.048+half)n+=5;
  return n;
 }
 return candidates.sort((a,b)=>cost(a)-cost(b))[0];
}
function shouldActivate(s,relic){
 if(s.energy<100||s.ability>0||s.phase==='destroying')return false;
 const incoming=s.enemyShots.some(p=>p.z<13&&p.z>-3),committed=s.targets.some(t=>['gunner','battery'].includes(t.role)&&['locked','fire'].includes(t.fireState)&&t.z<25);
 if(relic===0)return incoming||s.lasers.length>0||s.phase==='boss'&&s.bossAction==='windup'&&s.bossAttack>.35;
 if(relic===1)return incoming||s.lasers.length>0||s.targets.some(t=>t.kind==='enemy'&&t.z<13&&Math.abs(t.x-s.x)<3.2);
 return s.phase==='boss'?s.bossState!=='guarded'&&s.bossZ<18:s.targets.some(t=>t.hp>0&&t.z<25&&(Math.abs(t.x-s.x)<1.7||s.weaponPower==='guided'))||committed;
}
function play({level=0,rank=0,relic=0,delay=0,imperfect=false,passive=false,ability=true}){
 core.start(relic,level,rank);const traceCommands=[];let s=core.snapshot(),command=0,wanted=0;const history=[s];
 const m={level,rank,relic,delayMs:delay*1000,controller:passive?'centre-only':imperfect?'delayed, sampled, speed-limited':'snapshot feasibility',phase:s.phase,runnerSeconds:0,bossSeconds:0,runnerRelicSeconds:0,bossRelicSeconds:0,activations:0,firstHostileShot:null,firstGunnerVolley:null,hostileShotLaunches:0,runnerHostileShotLaunches:0,bossAttacks:0,contacts:0,rollerImpacts:0,troopsLost:0,commanderDamage:0,runnerCommanderDamage:0,runnerTroopsLost:0,actualTargetHpRemoved:0,bossHpRemoved:0,peakBossStepDamage:0,maxBreaksPerStep:0,startingArmor:s.bossArmorMax,unresolvedTrace:[],recruited:0,peakArmy:s.army,coreWindows:0,spatialHits:0,spatialDeflections:0,regionHits:{},coreDamage:0,coreWindowSeconds:0,coreDamagePreserved:true,gateEvents:0,pickupEvents:0,pickupTypes:[],gunnerStates:[],runnerArmy:null,runnerHp:null,firstDangerVolleyArmy:null};
 m.powerActivations={};m.salvoShots=0;m.evades=0;m.evadeSeconds=0;m.recoverySeconds=0;const seenFriendly=new Set(); const gates=new Set(),pickups=new Set(),seenShots=new Set(),states=new Set(),powers=new Set(),choiceGroups=new Set();let duplicateGate=0,duplicatePickup=0,silentKills=0,finite=true,monotonic=true,partPersistent=true,previousCore=s.bossCoreHp,duplicateChoice=0,siblingClosed=true,fixedPickupKinds=true;
 for(let f=0;f<270*60&&['run','boss','destroying'].includes(s.phase);f++){
  const activationCount=m.activations;const b=s,lagFrames=Math.round(delay*60),observed=history[Math.max(0,history.length-1-lagFrames)];
  if(!passive&&(!imperfect||f%15===0)){
   // A deterministic missed decision/attention lapse every 11 seconds.
   if(!imperfect||(f/60+rank*.7+relic*.3)%11<10.55)wanted=imperfect?observedChoice(observed):feasibility(observed);
   if(ability&&((level===0||level>=3)?shouldActivate(observed,relic):observed.energy>=100&&observed.ability===0&&observed.phase!=='destroying'&&(relic===2||observed.phase==='boss'||observed.targets.some(t=>t.kind==='enemy'&&t.z<12))))if(core.activate())m.activations++;
  }
  command=passive?0:imperfect?command+Math.max(-5/60,Math.min(5/60,wanted-command)):wanted;
  if(process.env.MECHALORD_AUDIT_TRACE==='1')traceCommands.push([m.activations>activationCount?1:0,clamp(command)]);core.step(1/60,clamp(command));s=core.snapshot();if(s.sweepUnresolved>b.sweepUnresolved&&m.unresolvedTrace.length<8){const stalled=b.shots.filter(p=>p.y!==undefined&&s.shots.some(q=>q.id===p.id&&q.x===p.x&&q.y===p.y&&q.z===p.z));m.unresolvedTrace.push({time:s.time,delta:s.sweepUnresolved-b.sweepUnresolved,command,shots:stalled,previousPose:b.bossPose,currentPose:s.bossPose});}history.push(s);if(history.length>40)history.shift();
  for(const p of s.shots)if(p.kind==='salvo'&&!seenFriendly.has(p.id)){seenFriendly.add(p.id);m.salvoShots++;}for(const e of s.effects)if(e.kind==='combatPower')m.powerActivations[e.value]=(m.powerActivations[e.value]??0)+1;if(b.bossEvadeTime===0&&s.bossEvadeTime>0)m.evades++;if(b.bossEvadeTime>0)m.evadeSeconds+=1/60;if(b.bossFiringWindow>0)m.recoverySeconds+=1/60; const runner=b.phase==='run',boss=b.phase==='boss';if(runner)m.runnerSeconds+=1/60;if(boss)m.bossSeconds+=1/60;
  if(b.ability>0){if(runner)m.runnerRelicSeconds+=1/60;if(boss)m.bossRelicSeconds+=1/60;}
  m.peakArmy=Math.max(m.peakArmy,s.army);m.commanderDamage+=Math.max(0,b.commanderHp-s.commanderHp);if(runner)m.runnerCommanderDamage+=Math.max(0,b.commanderHp-s.commanderHp);
  m.bossHpRemoved+=Math.max(0,b.bossHp-s.bossHp);m.peakBossStepDamage=Math.max(m.peakBossStepDamage,Math.max(0,b.bossHp-s.bossHp));m.maxBreaksPerStep=Math.max(m.maxBreaksPerStep,s.effects.filter(e=>e.kind==='bossPartBreak').length);m.coreDamage+=Math.max(0,b.bossCoreHp-s.bossCoreHp);if(b.bossState==='exposed')m.coreWindowSeconds+=1/60;
  if(s.bossCoreHp>previousCore+.001)m.coreDamagePreserved=false;previousCore=s.bossCoreHp;
  if(s.phase==='boss'&&b.phase==='run'){m.runnerArmy=s.army;m.runnerHp=s.commanderHp;}
  for(const t of s.targets)if(t.kind==='enemy'&&['gunner','battery'].includes(t.role))states.add(t.fireState);
  for(const p of b.pickups){const next=s.pickups.find(q=>q.id===p.id);if(next&&next.kind!==p.kind)fixedPickupKinds=false;}
  for(const e of s.effects.filter(e=>e.kind==='pickup')){const old=b.pickups.find(p=>p.id===e.entityId);if(old?.choiceGroup){if(choiceGroups.has(old.choiceGroup))duplicateChoice++;choiceGroups.add(old.choiceGroup);siblingClosed&&=!s.pickups.some(p=>p.choiceGroup===old.choiceGroup);}}
  for(const p of s.enemyShots)if(!seenShots.has(p.id)){seenShots.add(p.id);m.hostileShotLaunches++;if(runner){m.runnerHostileShotLaunches++;m.firstGunnerVolley??=s.time;m.firstDangerVolleyArmy??=s.army;}m.firstHostileShot??=s.time;}
  for(const t of b.targets){const after=s.targets.find(q=>q.id===t.id),kill=s.effects.some(e=>e.kind==='kill'&&e.entityId===t.id);m.actualTargetHpRemoved+=Math.max(0,t.hp-(after?.hp??(kill?0:t.hp)));if(!after&&t.kind==='enemy'&&!s.effects.some(e=>e.entityId===t.id&&(e.kind==='kill'||e.kind==='retreat')))silentKills++;}
  for(const e of s.effects){if(e.kind==='hit'&&e.hitRegion){if(e.value>0){m.spatialHits++;m.regionHits[e.hitRegion]=(m.regionHits[e.hitRegion]??0)+e.value;}else m.spatialDeflections++;}if(e.kind==='gate'){m.gateEvents++;if(gates.has(e.entityId))duplicateGate++;gates.add(e.entityId);}if(e.kind==='pickup'){m.pickupEvents++;if(pickups.has(e.entityId))duplicatePickup++;pickups.add(e.entityId);powers.add(e.value);}if(e.kind==='recruit')m.recruited+=e.value;if(e.kind==='damage'){m.troopsLost+=e.value;if(runner)m.runnerTroopsLost+=e.value;}if(e.kind==='contact')m.contacts++;if(e.kind==='hazardBreak')m.rollerImpacts++;if(e.kind==='bossShot')m.bossAttacks++;if(e.kind==='coreExpose')m.coreWindows++;}
  finite&&=['time','x','commanderHp','army','bossHp','energy'].every(k=>Number.isFinite(s[k]));monotonic&&=s.travelDistance>=b.travelDistance-.0001;partPersistent&&=(s.bossPartsMask|b.bossPartsMask)===s.bossPartsMask;
 }
 m.sweepUnresolved=s.sweepUnresolved;m.bossEpoch=s.bossEpoch;m.phase=s.phase;m.time=s.time;m.army=s.army;m.commanderHp=s.commanderHp;m.hpMargin=s.commanderHp/s.commanderMaxHp;m.bossHpRemaining=s.bossHp;m.bossRevives=s.bossRevives;m.kills=s.kills;m.runnerRelicUptime=m.runnerSeconds?m.runnerRelicSeconds/m.runnerSeconds:0;m.pickupTypes=[...powers];m.gunnerStates=[...states];m.duplicateGate=duplicateGate;m.duplicatePickup=duplicatePickup;m.silentKills=silentKills;m.finite=finite;m.continuousTravel=monotonic;m.partPersistent=partPersistent;m.choiceGroupsCollected=choiceGroups.size;m.duplicateChoice=duplicateChoice;m.choiceSiblingClosed=siblingClosed;m.fixedPickupKinds=fixedPickupKinds;
 if(process.env.MECHALORD_AUDIT_TRACE==='1')m.commands=traceCommands;return m;
}

for(const level of[0,3,4])for(const rank of[0,3])for(const relic of[0,1,2]){const r=play({level,rank,relic});runs.push(r);console.log(JSON.stringify({level,rank,relic,phase:r.phase,time:r.time,bossSeconds:r.bossSeconds,army:r.army,hp:r.commanderHp,powers:r.powerActivations,salvo:r.salvoShots,evades:r.evades,refusals:r.sweepUnresolved}));}fs.writeFileSync(path.join(root,'builds/combat-candidate-probe.json'),JSON.stringify({sha256:createHash('sha256').update(bytes).digest('hex'),runs},null,2));
