import fs from 'node:fs';
import {createHash} from 'node:crypto';
const binary=fs.readFileSync('delivery/playable/assault.wasm');
globalThis.fetch=async()=>new Response(binary);
const {AssaultCore}=await import('./assault-core.ts');
const core=new AssaultCore();await core.load();

// This isolates the target-order instruction shown in the normal HUD. The
// controller still dodges and uses abilities automatically; it is NOT a human
// playtest or evidence of discoverability. No private core state is mutated.
function aim(s){
 if(s.phase==='boss'){
  const first=s.bossRegions.find(r=>r.active&&r.vulnerable&&r.hp>0);
  let desired=first?.x??s.bossX;
  const supply=s.pickups.find(p=>p.z<5.5&&(p.kind==='health'&&s.commanderHp<s.commanderMaxHp-18||p.bonusTroops&&s.army<45));
  if(supply)desired=supply.x;
  if(s.clash.result==='none'&&s.bossPattern==='laser'&&s.bossAttack>.4)return s.bossLane;
  if(s.lasers.length||s.bossPattern==='laser'&&s.bossAttack>.3)return s.bossLane>0?-3:3;
  return [desired,-2.8,2.8,-1.5,1.5,0].map(x=>({x,cost:Math.abs(x-desired)+50*s.enemyShots.filter(p=>p.z<5.5&&p.dz<-.01&&Math.abs(x-(p.x-p.dx*p.z/p.dz))<p.radius+.5).length})).sort((a,b)=>a.cost-b.cost)[0].x;
 }
 let desired=0,best=Infinity;
 for(const t of s.targets)if(t.z>1&&t.z<29&&(t.kind==='crate'||t.kind==='gate'||t.kind==='orb'||t.kind==='enemy'&&t.variant>0&&t.z<14)&&t.z<best){best=t.z;desired=t.x;}
 for(const p of s.pickups)if(p.z<6&&p.z<best){best=p.z;desired=p.x;}
 const gate=s.targets.find(t=>t.kind==='gate'&&t.z>0&&t.z<3.5);
 if(gate){const pair=s.targets.filter(t=>t.kind==='gate'&&Math.abs(t.z-gate.z)<.02).sort((a,b)=>(b.op?s.army*(b.value-1):b.value)-(a.op?s.army*(a.value-1):a.value));desired=pair[0].x;}
 for(const t of s.targets)if(t.kind==='hazard'&&t.z<3&&Math.abs(t.x-desired)<t.size+.5)desired=t.x>0?-3:3;
 return desired;
}
const runs=[];
for(const rank of [0,3]){
 core.start(0,5,rank);let s=core.snapshot(),nextTap=0,bossAt=0;const acts=[],partHits={},clashes=[];
 for(let frame=0;frame<900*60&&!['won','lost'].includes(s.phase);frame++){
  if(s.phase==='lastStand'){if(!core.revive())core.declineRevive();s=core.snapshot();}
  if(s.phase==='reward'){
   acts.push({act:s.actIndex,bossSeconds:s.time-bossAt,time:s.time,hp:s.commanderHp,army:s.army});
   core.chooseReward(s.commanderHp<s.commanderMaxHp-20?'vitality':'laser');s=core.snapshot();
  }
  if(s.phase==='boss'&&!bossAt)bossAt=s.time;if(s.phase==='run')bossAt=0;
  if(s.clash.active){if(s.time>=nextTap){core.clashTap();nextTap=s.time+1/3;}}
  else if(s.phase==='boss'&&s.clash.result==='none'&&s.bossPattern==='laser'&&s.bossAttack>.97&&s.laserCharges>0)core.fireLaser();
  if((s.phase==='run'||s.phase==='boss')&&!(s.clash.result==='none'&&s.phase==='boss'&&s.bossPattern==='laser'&&s.bossAttack>.1)){
   if(s.relics[0].energy>=100&&(s.phase==='boss'||s.commanderHp<55))core.activateRelic(0);
   if(s.relics[1].energy>=100&&(s.phase==='run'||s.bossAttack>.7))core.activateRelic(1);
   if(s.relics[2].energy>=100)core.activateRelic(2);
  }
  core.step(1/60,aim(s));s=core.snapshot();
  for(const e of s.effects){if(e.kind==='hit'&&e.value>0&&e.hitRegion)partHits[e.hitRegion]=(partHits[e.hitRegion]??0)+1;if(e.kind==='clashStart'){clashes.push({act:s.actIndex,time:s.time});nextTap=s.time;}}
 }
 const run={rank,phase:s.phase,time:s.time,act:s.actIndex,hp:s.commanderHp,army:s.army,acts,partHits,clashes,unresolved:s.sweepUnresolved};runs.push(run);console.log(JSON.stringify(run));
}
const report={sha256:createHash('sha256').update(binary).digest('hex'),scope:'Public simulation controls, first active vulnerable HUD part order. Automatic ability timing and threat prediction remain; not a normal-input or human-difficulty claim.',runs};
fs.writeFileSync('builds/player-target-route-audit.json',JSON.stringify(report,null,2));
if(!runs.every(r=>r.phase==='won'&&r.acts.length===1&&r.unresolved===0))process.exitCode=1;
