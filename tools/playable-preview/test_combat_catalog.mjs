// Independent public-control audit. Never injects targets, HP, pickups or shots.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),binary=path.resolve(process.argv[2]??path.join(root,'delivery/playable/assault.wasm')),bytes=fs.readFileSync(binary);
globalThis.fetch=async()=>new Response(bytes);const{AssaultCore}=await import('./assault-core.ts');const core=new AssaultCore();await core.load();
const tests=[],runs=[],powers={tempest:{activations:0,frames:0,beams:0},arcstorm:{activations:0,frames:0,pulses:0,hits:0},salvo:{activations:0,frames:0,shots:0}},clamp=x=>Math.max(-3,Math.min(3,x));
function test(name,fn){try{fn();tests.push({name,status:'pass'});console.log('PASS '+name);}catch(e){tests.push({name,status:'fail',error:e.message});console.error('FAIL '+name+' — '+e.message);}}
function route(s,wanted){
 const reward=s.pickups.filter(p=>p.z<10&&(p.kind===wanted||!wanted&&['tempest','arcstorm','salvo'].includes(p.kind))).sort((a,b)=>a.z-b.z)[0];
 let desired=reward?.x??0;
 if(s.phase==='boss'){
  if(s.lasers.length||s.bossPattern==='laser'&&s.bossAttack>.3)return s.bossLane>0?-3:3;
  const regions=s.bossRegions.filter(r=>r.vulnerable&&r.active&&r.hp>0&&r.z<26).sort((a,b)=>a.hp-b.hp||Math.abs(a.x-s.x)-Math.abs(b.x-s.x));desired=reward?.x??regions[0]?.x??s.bossX;
  const shots=s.enemyShots.filter(p=>p.dz<-.01&&p.z<5.5).map(p=>({x:p.x-p.dx*p.z/p.dz,r:p.radius+.5}));
  return[clamp(desired),-2.8,2.8,-1.5,1.5,0].filter(x=>!shots.some(p=>Math.abs(x-p.x)<p.r)).sort((a,b)=>Math.abs(a-desired)-Math.abs(b-desired))[0]??clamp(desired);
 }
 const goals=s.targets.filter(t=>t.z>1&&t.z<29&&(t.kind==='crate'||t.kind==='gate'||t.kind==='orb'||t.kind==='enemy'&&t.variant>0&&t.z<25)).sort((a,b)=>a.z-b.z);
 desired=reward?.x??s.pickups.filter(p=>p.z<6).sort((a,b)=>a.z-b.z)[0]?.x??goals[0]?.x??0;
 const gate=s.targets.filter(t=>t.kind==='gate'&&t.z>0&&t.z<3.5).sort((a,b)=>a.z-b.z)[0]??(goals[0]?.kind==='gate'?goals[0]:null);
 if(gate&&!reward){const pair=s.targets.filter(t=>t.kind==='gate'&&Math.abs(t.z-gate.z)<.02);pair.sort((a,b)=>(b.op?s.army*(b.value-1):b.value)-(a.op?s.army*(a.value-1):a.value));desired=pair[0].x;}
 const hazard=s.targets.find(t=>t.kind==='hazard'&&t.z<3&&Math.abs(t.x-desired)<t.size+.5);return hazard?(hazard.x>0?-3:3):desired;
}
function run(level,relic,rank,wanted,observe){core.start(relic,level,rank);let s=core.snapshot();for(let f=0;f<300*60&&['run','boss','destroying'].includes(s.phase);f++){
 if(s.energy>=100&&s.ability===0&&s.phase!=='destroying'&&(relic===2||s.phase==='boss'||s.targets.some(t=>t.kind==='enemy'&&t.z<12)))core.activate();const before=s;core.step(1/60,route(s,wanted));s=core.snapshot();if(observe?.(s,before))break;
 }return s;}
test('ABI4 exposes all five distinct chapter identities and clean finite powers',()=>{assert.equal(core.api.abi_version(),4);const names=[];for(let level=0;level<5;level++){core.start(0,level,0);const s=core.snapshot();assert.equal(s.level,level);names.push(s.levelName);assert.equal(s.combatPower,'none');assert.equal(s.combatPowerTime,0);assert.equal(s.friendlyBeams.length,0);assert.equal(s.bossEvadeTime,0);}assert.equal(new Set(names).size,5);assert.equal(names[3],'Storm Pass');assert.equal(names[4],'Forge Core');});
const earned=[];
for(const wanted of['tempest','arcstorm','salvo'])test('earned '+wanted+' is finite, physical and survives pause/reset correctly',()=>{
 let active=null,elapsed=0,births=0,pulseFrames=0,chainHits=0,beamFrames=0,pauseChecked=false;const seen=new Set();
 const end=run(wanted==='arcstorm'?3:4,0,2,wanted,(s,b)=>{
  const events=s.effects.filter(e=>e.kind==='combatPower');for(const e of events)if(!active&&e.value===['tempest','arcstorm','salvo'].indexOf(wanted)+8){active={id:e.id,start:s.time,life:wanted==='tempest'?1:wanted==='arcstorm'?1.2:1.8};powers[wanted].activations++;}
  if(!active)return;const within=s.time-active.start<=active.life+.05;
  if(within){
   elapsed=Math.max(elapsed,s.time-active.start);powers[wanted].frames++;assert(s.combatPowerTime>=0&&s.combatPowerTime<=active.life+.001);
   if(wanted==='tempest'&&s.friendlyBeams.length){for(const beam of s.friendlyBeams){assert(Math.abs(beam.x-s.x)<.0001&&Math.abs(beam.endX-s.x)<.0001,'Forward lance cannot secretly sweep sideways');assert(Math.abs(beam.y-1.42)<.0001&&beam.endZ>beam.z&&Math.abs(beam.width-1)<.00001);assert(beam.time>0&&beam.time<=1.001);beamFrames++;}}
   if(wanted==='arcstorm'){const chain=s.effects.filter(e=>e.kind==='chainHit');assert(chain.length<=3,'One pulse may affect at most three recipients');if(chain.length)pulseFrames++;chainHits+=chain.length;const recipients=new Set();for(const e of chain){assert(Number.isFinite(e.y)&&Number.isFinite(e.endX)&&Number.isFinite(e.endY)&&Number.isFinite(e.endZ));assert(e.value>=0,'Deflection is valid but cannot pretend to remove HP');if(e.entityId>0){assert(!recipients.has(e.entityId));recipients.add(e.entityId);assert(Math.hypot(e.endX-e.x,e.endZ-e.z)<(recipients.size===1?18.01:6.01));assert(b.targets.some(t=>t.id===e.entityId)||s.targets.some(t=>t.id===e.entityId),'Chain endpoint requires an actual target');}}}
   if(wanted==='salvo')for(const p of s.shots.filter(p=>p.kind==='salvo'&&!seen.has(p.id))){seen.add(p.id);births++;assert.equal(p.owner,'commander');assert(Number.isFinite(p.y)&&Number.isFinite(p.dy));assert(p.dz>0);}
   if(!pauseChecked&&s.combatPower===wanted){const frozen=core.snapshot();delete frozen.effects;core.pause(true);for(let i=0;i<10;i++)core.step(.25,3);const after=core.snapshot();delete after.effects;assert.deepEqual(after,frozen);core.pause(false);pauseChecked=true;}
  }
  return s.time-active.start>=active.life+.025;
 });
 assert(active,'No real earned activation reached through public controls');assert(pauseChecked);if(wanted==='tempest'){assert(beamFrames>20);powers.tempest.beams+=beamFrames;}if(wanted==='arcstorm'){assert(pulseFrames>0&&pulseFrames<=4);assert(chainHits>0&&chainHits<=12);powers.arcstorm.pulses+=pulseFrames;powers.arcstorm.hits+=chainHits;}if(wanted==='salvo'){assert.equal(births,6);powers.salvo.shots+=births;}
 assert(elapsed>active.life-.08);earned.push({power:wanted,phase:end.phase,time:end.time,elapsed,births,pulseFrames,chainHits,beamFrames});core.start(0,0,0);const reset=core.snapshot();assert.equal(reset.combatPower,'none');assert.equal(reset.friendlyBeams.length,0);
});
for(const level of[3,4])test('authored chapter'+level+' has real independent pressure and an intact spatial boss',()=>{
 let firstBoss=null,shots=0,breaks=0,rollers=0,carriers=0,gates=0;const ids=new Set(),seenTargets=new Set(),offers=new Set();
 const end=run(level,0,0,null,(s,b)=>{if(!firstBoss&&s.phase==='boss'){firstBoss=s.time;assert.equal(s.bossRegions.length,7);assert.equal(s.bossComponents.length,11);}for(const t of s.targets)if(!seenTargets.has(t.id)){seenTargets.add(t.id);rollers+=t.kind==='hazard';carriers+=t.role==='carrier';}for(const p of s.enemyShots)if(!ids.has(p.id)){ids.add(p.id);shots++;}breaks+=s.effects.filter(e=>e.kind==='bossPartBreak').length;gates+=s.effects.filter(e=>e.kind==='gate').length;for(const p of s.pickups)offers.add(p.kind);assert.equal(s.sweepUnresolved,0);assert(s.targets.length<=256&&s.shots.length<=256&&s.enemyShots.length<=96);assert(s.bossCoreHp<=b.bossCoreHp+.001);});
 assert.equal(end.phase,'won');assert(firstBoss>90&&firstBoss<105);assert(shots>5&&breaks===6&&rollers>=2&&carriers>=3&&gates>=2);assert(offers.has(level===3?'arcstorm':'tempest'));runs.push({level,time:end.time,bossSeconds:end.time-firstBoss,hostileLaunches:shots,breaks,rollers,carriers,gates,offers:[...offers]});
});
const report={scope:'Current WASM and adapter through public controls, independent finite-power/chapter audit; no render, human or phone claim',binary,sha256:createHash('sha256').update(bytes).digest('hex'),timestamp:new Date().toISOString(),tests:tests.length,passed:tests.filter(t=>t.status==='pass').length,failed:tests.filter(t=>t.status==='fail').length,powers,earned,runs,results:tests};fs.writeFileSync(path.join(root,'builds/combat-catalog-audit.json'),JSON.stringify(report,null,2)+'\n');if(report.failed)process.exitCode=1;
