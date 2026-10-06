import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const binary=fs.readFileSync('delivery/playable/assault.wasm');
globalThis.fetch=async()=>new Response(binary);
const {AssaultCore}=await import('./assault-core.ts');
const core=new AssaultCore();await core.load();
const checks=[],runs=[];
function check(name,fn){fn();checks.push({name,status:'pass'});console.log('PASS '+name);}
check('ABI5 adapter initializes six stages and exposes finite campaign fields',()=>{assert.equal(core.api.abi_version(),5);for(let i=0;i<6;i++){core.start(0,i,0);const s=core.snapshot();assert.equal(s.level,i);assert.equal(s.campaign,i===5);assert.equal(s.relics.length,3);assert.equal(s.actIndex,0);assert.equal(s.clash.active,false);assert.equal(s.laserCharges,0);assert.equal(s.reviveCinematicTime,0);assert.equal(s.stageLevel,i===5?0:i);}});
check('legacy imprint is actual once-only campaign benefit at run start',()=>{for(const[kind,key]of[['laser','laser'],['vitality','vitality'],['endurance','endurance']]){core.start(0,5,0,kind);let s=core.snapshot();assert.equal(s.rewardBonuses[key],1);if(kind==='vitality'){assert.equal(s.commanderHp,120);assert.equal(s.commanderMaxHp,120);}assert.equal(core.api.apply_legacy_reward(1),0);assert.deepEqual(core.snapshot().rewardBonuses,s.rewardBonuses);}core.start(0,0,0,'vitality');assert.equal(core.snapshot().commanderMaxHp,100);core.start(0,5,0);core.step(.1,0);assert.equal(core.api.apply_legacy_reward(0),0);});
check('inactive and paused actions cannot mutate unavailable rewards or charges',()=>{core.start(0,5,0);assert.equal(core.chooseReward('laser'),false);assert.equal(core.fireLaser(),false);assert.equal(core.clashTap(),false);for(let i=0;i<3;i++)assert.equal(core.activateRelic(i),false);core.pause(true);const before=core.snapshot();core.step(.25,3);const after=core.snapshot();assert.equal(after.time,before.time);assert.deepEqual(after.relics,before.relics);core.pause(false);});
function route(s){
 if(s.phase==='boss'){
  let desired=s.bossX;const regions=s.bossRegions.filter(r=>r.vulnerable&&r.hp>0).sort((a,b)=>(a.hp+Math.abs(a.x-s.x))-(b.hp+Math.abs(b.x-s.x)));if(regions.length)desired=regions[0].x;
  for(const p of s.pickups)if(p.z<5.5&&(p.kind==='health'&&s.commanderHp<s.commanderMaxHp-18||p.bonusTroops>0&&s.army<45))desired=p.x;
  if(s.clash.result==='none'&&s.bossPattern==='laser'&&s.bossAttack>.4)return s.bossLane;
  if(s.lasers.length||s.bossPattern==='laser'&&s.bossAttack>.3)return s.bossLane>0?-3:3;
  return[desired,-2.8,2.8,-1.5,1.5,0].map(x=>({x,v:Math.abs(x-desired)+s.enemyShots.filter(p=>p.z<5.5&&Math.abs(x-(p.x-p.dx*p.z/p.dz))<p.radius+.5).length*50})).sort((a,b)=>a.v-b.v)[0].x;
 }
 let desired=0,best=Infinity;for(const t of s.targets)if(t.z>1&&t.z<29&&(t.kind==='crate'||t.kind==='gate'||t.kind==='orb'||t.kind==='enemy'&&t.variant>0&&t.z<14)){if(t.z<best){best=t.z;desired=t.x;}}
 for(const p of s.pickups)if(p.z<6&&p.z<best){best=p.z;desired=p.x;}
 const gate=s.targets.find(t=>t.kind==='gate'&&t.z>0&&t.z<3.5);if(gate){const pair=s.targets.filter(t=>t.kind==='gate'&&Math.abs(t.z-gate.z)<.02).sort((a,b)=>(b.op?s.army*(b.value-1):b.value)-(a.op?s.army*(a.value-1):a.value));desired=pair[0].x;}
 for(const t of s.targets)if(t.kind==='hazard'&&t.z<3&&Math.abs(t.x-desired)<t.size+.5)desired=t.x>0?-3:3;return desired;
}
for(const rank of[0,3])for(const alternate of[false,true]){
 core.start(0,5,rank);let s=core.snapshot(),nextTap=0,clashes=0,wins=0,heals=0,shieldBreaks=0,revives=0,maxTargets=0,frames=0,bossAt=0;const acts=[],archetypes=new Set(),knownTypes=new Map(),roles=Object.fromEntries([1,2,3,4].map(k=>[k,{births:0,minZ:42,tells:0,skillFrames:0,fires:0,contacts:0,supports:0,shieldBreaks:0}]));
 for(let i=0;i<900*60&&!['won','lost'].includes(s.phase);i++){
  if(s.phase==='lastStand'){assert.equal(core.revive(),true);s=core.snapshot();revives++;}
  if(s.phase==='reward'){const before=s;acts.push({act:s.actIndex,time:s.time,bossSeconds:s.time-bossAt,hp:s.commanderHp,army:s.army});const choice=alternate&&s.actIndex===1?'endurance':s.commanderHp<s.commanderMaxHp-20?'vitality':'laser';assert.ok(core.chooseReward(choice));s=core.snapshot();assert.equal(s.army,before.army);assert.equal(s.weapon,before.weapon);assert.equal(s.travelDistance,before.travelDistance);if(before.actIndex<2){assert.equal(s.actIndex,before.actIndex+1);assert.equal(s.phase,'run');}else assert.equal(s.phase,'won');}
  if(s.phase==='boss'&&bossAt===0)bossAt=s.time;if(s.phase==='run')bossAt=0;
  if(s.clash.active){if(s.time>=nextTap){core.clashTap();nextTap=s.time+1/3;}}
  else if(s.phase==='boss'&&s.clash.result==='none'&&s.bossPattern==='laser'&&s.bossAttack>.97&&s.laserCharges>0)core.fireLaser();
  if(s.phase==='run'||s.phase==='boss'){
   if(!(s.clash.result==='none'&&s.phase==='boss'&&s.bossPattern==='laser'&&s.bossAttack>.1)){
    if(s.relics[0].energy>=100&&(s.phase==='boss'||s.commanderHp<55))core.activateRelic(0);
    if(s.relics[1].energy>=100&&(s.phase==='run'||s.bossAttack>.7))core.activateRelic(1);
    if(s.relics[2].energy>=100)core.activateRelic(2);
   }
  }
  if(alternate&&s.commanderHp<25&&s.army>=60)core.heal();
  const old=s;core.step(1/60,route(s));s=core.snapshot();frames++;
  assert.ok(s.army>=0&&s.army<=160&&s.commanderHp>=0&&s.commanderHp<=s.commanderMaxHp);assert.ok(s.targets.length<=256&&s.enemyShots.length<=96&&s.shots.length<=256&&s.pickups.length<=24);maxTargets=Math.max(maxTargets,s.targets.length);
  for(const t of s.targets){assert.ok(Number.isFinite(t.x)&&Number.isFinite(t.z));if(t.archetype){archetypes.add(t.archetype);const r=roles[t.archetype];if(!knownTypes.has(t.id)){knownTypes.set(t.id,t.archetype);r.births++;}r.minZ=Math.min(r.minZ,t.z);if(t.skillState===1)r.tells++;if(t.skillState===2)r.skillFrames++;}assert.ok(t.shieldHp>=0&&t.shieldHp<=t.shieldMax);}
  for(const e of s.effects){const type=knownTypes.get(e.entityId);if(type){if(e.kind==='enemyFire')roles[type].fires++;if(e.kind==='contact')roles[type].contacts++;if(e.kind==='shieldBreak')roles[type].shieldBreaks++;}if(e.kind==='enemySupport')roles[4].supports++;if(e.kind==='clashStart'){clashes++;nextTap=s.time;assert.ok(s.clash.active&&s.clash.z>1.3&&s.clash.z<s.clash.enemyZ);assert.ok(s.friendlyBeams.length&&s.lasers.length);}if(e.kind==='clashWin')wins++;if(e.kind==='healthPickup'){heals++;assert.ok(e.value>=0&&e.value<=28);}if(e.kind==='shieldBreak')shieldBreaks++;}
  if(old.phase==='reviving'&&s.phase==='reviving'){assert.equal(s.time,old.time);assert.equal(s.travelDistance,old.travelDistance);assert.equal(s.commanderHp,old.commanderHp);}
  if(s.relics[0].activeTime>0&&old.relics[0].activeTime>0)assert.ok(!s.effects.some(e=>e.kind==='commanderHit'||e.kind==='damage'));
 }
 const result={rank,strategy:alternate?'endurance and late sacrifice':'vitality and pickup recovery',phase:s.phase,seconds:s.time,act:s.actIndex,hp:s.commanderHp,army:s.army,acts,clashes,wins,heals,shieldBreaks,revives,archetypes:[...archetypes].sort(),maxTargets,frames,roles,unresolved:s.sweepUnresolved};runs.push(result);console.log(JSON.stringify(result));
}
const report={sha256:createHash('sha256').update(binary).digest('hex'),abi:5,checks,runs,notes:['Driven through production TypeScript adapter and public actions only.','Laser clash uses at most three input pulses per second; no damage or resource state is injected.','These are deterministic feasibility routes, not human difficulty or physical-device performance validation.']};
fs.writeFileSync('builds/unbroken-campaign-audit.json',JSON.stringify(report,null,2));
assert.ok(runs.every(r=>r.phase==='won'),'Every required route must complete');assert.ok(runs.filter(r=>r.rank===0).every(r=>r.clashes===3&&r.wins===3),'Fresh routes must earn and win all three actual beam clashes');assert.ok(runs.every(r=>r.unresolved===0&&r.archetypes.length===4),'All archetypes exercised and exact collisions resolved');
console.log('PASS all four public campaign routes and three-per-second clash input.');
