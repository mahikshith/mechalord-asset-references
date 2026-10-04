// Real shipped C++/WASM and its browser adapter, driven only through public controls.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const binaryPath=path.join(root,'delivery/playable/assault.wasm');
const bytes=fs.readFileSync(binaryPath);
const fetchOriginal=globalThis.fetch;
globalThis.fetch=async(r,o)=>/(?:^|\/)assault\.wasm(?:\?.*)?$/.test(String(r))?new Response(bytes):fetchOriginal(r,o);
const {AssaultCore}=await import('./assault-core.ts');
const core=new AssaultCore();await core.load();
const results=[],winningRuns=[];const snap=()=>core.snapshot();
const persistent=s=>{const{effects,...rest}=s;return rest;};
function test(name,fn){try{fn();results.push({name,status:'pass'});console.log('PASS '+name);}catch(e){results.push({name,status:'fail',error:e.message});console.error('FAIL '+name+' — '+e.message);}}
function start(relic=0,level=0){core.start(relic,level);return snap();}
function stepFor(seconds,input=0,hz=60,observe){let state=snap();for(let f=0;f<Math.round(seconds*hz);f++){const before=state;core.step(1/hz,typeof input==='function'?input(state):input);state=snap();observe?.(state,before);}return state;}
// This bounded controller sees the same snapshot as the renderer. It chooses a
// useful offer, avoids nearby rollers/machines and predicts visible shot impact.
// It is automated feasibility, not a first-time-player understanding claim.
function route(s){
 if(s.phase==='boss')return s.level===1?.7:s.bossAttack>0?(s.bossLane>=0?-1.8:1.8):0;
 const goals=s.targets.filter(t=>(t.kind==='crate'||t.kind==='gate')&&t.z>1).sort((a,b)=>a.z-b.z);
 let desired=goals[0]?.x??-1.8;const first=goals[0];
 if(first?.kind==='gate'){
  const pair=goals.filter(t=>t.kind==='gate'&&Math.abs(t.z-first.z)<.02);
  pair.sort((a,b)=>(b.op?s.army*(b.value-1):b.value)-(a.op?s.army*(a.value-1):a.value));desired=pair[0]?.x??desired;
 }
 const danger=s.targets.filter(t=>t.z<3&&(t.kind==='hazard'||t.kind==='enemy'));
 const bullets=s.enemyShots.filter(t=>t.z<7).map(t=>({x:t.x-t.dx*t.z/t.dz,size:t.radius+.35}));
 const safe=[desired,-2.8,2.8,-1.8,1.8,-.7,.7,0].filter(x=>!danger.some(t=>Math.abs(x-t.x)<t.size+.65)&&!bullets.some(t=>Math.abs(x-t.x)<t.size+.05));
 if(safe.length)desired=safe.sort((a,b)=>Math.abs(a-desired)-Math.abs(b-desired))[0];return desired;
}
function shouldActivate(s){return s.energy>=100&&s.ability<=0&&(s.relic===2||s.phase==='boss'||(s.relic===0&&s.targets.some(t=>t.z<4&&t.kind==='hazard'))||(s.relic===1&&s.targets.some(t=>t.kind==='enemy'&&t.z<10&&Math.abs(t.x-s.x)<1.3)));}
function run(relic=0,level=0,{controls=route,ability=true,hz=60,seconds=130,observe,stop}={}){
 start(relic,level);let state=snap();for(let f=0;f<seconds*hz&&['run','boss'].includes(state.phase);f++){
  if(ability&&shouldActivate(state))core.activate();const before=state;core.step(1/hz,controls(state));state=snap();observe?.(state,before);if(stop?.(state))break;
 }return state;
}
function boss(relic=2,level=0,ability=true){const state=run(relic,level,{ability,stop:s=>s.phase==='boss'});assert.equal(state.phase,'boss');return state;}
function charged(relic=0,level=0){return run(relic,level,{ability:false,stop:s=>s.energy>=100});}

test('actual browser adapter loads the rebuilt WASM without unexpected imports',()=>{
 assert.ok(core.api.memory instanceof WebAssembly.Memory);
 for(const i of WebAssembly.Module.imports(new WebAssembly.Module(bytes))){assert.equal(i.kind,'function');assert.equal(i.module,'wasi_snapshot_preview1');assert.ok(['fd_close','fd_seek','fd_write'].includes(i.name));}
});
test('three selectable stages reset with distinct names, duration and boss health',()=>{
 const names=['Relic Causeway','Roller Foundry','Citadel Breach'];for(let level=0;level<3;level++){
  const s=start(level,level);assert.equal(s.phase,'run');assert.equal(s.level,level);assert.equal(s.levelName,names[level]);assert.equal(s.duration,55+level*5);assert.equal(s.bossMax,1400+level*350);
  assert.equal(s.time,0);assert.equal(s.army,8);assert.equal(s.weapon,1);assert.equal(s.weaponXP,0);assert.equal(s.weaponNeed,40);assert.equal(s.energy,30);assert.equal(s.shots.length,0);assert.equal(s.enemyShots.length,0);assert.equal(s.effects.length,0);
 }
 assert.equal(start(0,99).level,2);assert.equal(start(0,-9).level,0);
});
test('portrait steering is bounded and obeys its movement speed',()=>{start();assert.ok(stepFor(1/60,100).x<=.15001);assert.equal(stepFor(2,100).x,3);assert.equal(stepFor(2,-100).x,-3);});
test('all stages introduce paired alternatives at the same distance',()=>{
 for(let l=0;l<3;l++){const gates=start(0,l).targets.filter(t=>t.kind==='gate');assert.equal(gates.length,2);assert.equal(gates[0].z,gates[1].z);assert.deepEqual(gates.map(t=>t.x),[Math.fround(-1.8),Math.fround(1.8)]);assert.equal(gates[0].size,Math.fround(1.2));}
});
test('choosing left or right collects only one of a pair and never repeats it',()=>{
 for(const x of [-1.8,1.8]){start();let applications=0;stepFor(5,x,60,s=>{applications+=s.effects.filter(e=>e.kind==='gate').length;});assert.equal(applications,1);stepFor(.5,x,60,s=>{applications+=s.effects.filter(e=>e.kind==='gate').length;});assert.equal(applications,1);}
});
test('center can miss both paired apertures, and off-lane shots do not alter them',()=>{
 const gates=start().targets.filter(t=>t.kind==='gate');const beforeCross=stepFor(3,0);for(const original of gates){const t=beforeCross.targets.find(t=>t.id===original.id);assert.equal(t.hp,original.hp);assert.equal(t.value,original.value);}
 let collected=0;stepFor(1.4,0,60,s=>{collected+=s.effects.filter(e=>e.kind==='gate').length;});assert.equal(collected,0);
});
test('actual moving allied shots damage and improve the selected gate',()=>{
 const first=start().targets.find(t=>t.kind==='gate');let moved=false,improved=false;
 stepFor(3.6,-1.8,60,(s,b)=>{const t=s.targets.find(t=>t.id===first.id);improved ||= !!t&&t.value>first.value&&t.hp<first.hp;moved ||= b.shots.some(a=>s.shots.some(q=>Math.abs(a.x-q.x)<.01&&q.z>a.z+.02));});assert.ok(moved);assert.ok(improved);
});
test('negative gates can be shot toward positive value before passage',()=>{
 let seen=false,improved=false;run(2,0,{controls:s=>s.phase==='run'&&s.time>=10&&s.time<15?-1.8:route(s),observe:s=>{const t=s.targets.find(t=>t.kind==='gate'&&t.maxHp===56);if(t){seen ||= t.value<0;improved ||= t.value>=0&&t.hp<t.maxHp;}}});assert.ok(seen);assert.ok(improved);
});
test('causeway rapid paired chain contains sixteen gates with separate crossings',()=>{
 const ids=new Set(),times=[];run(2,0,{observe:(s,b)=>{for(const t of s.targets.filter(t=>t.kind==='gate'&&t.maxHp===12))ids.add(t.id);for(const e of s.effects.filter(e=>e.kind==='gate'))if(b.targets.some(t=>t.kind==='gate'&&t.maxHp===12&&t.z<.07&&Math.abs(t.x-e.x)<.01))times.push(s.time);}});assert.equal(ids.size,16);assert.ok(times.length>=5);for(let i=1;i<times.length;i++)assert.ok(times[i]-times[i-1]>.7);
});
test('dense authored hordes persist and later stages have distinct elites',()=>{
 for(let level=0;level<3;level++){let max=0,brute=false,ranged=false;run(2,level,{observe:s=>{const enemies=s.targets.filter(t=>t.kind==='enemy');max=Math.max(max,enemies.length);brute ||= enemies.some(t=>t.variant===1);ranged ||= enemies.some(t=>t.variant===2);}});assert.ok(max>=60);assert.equal(brute,true);assert.equal(ranged,level===2);}
});
test('weapon upgrades require crate damage and accumulated XP, never time alone',()=>{
 let damaged=false,partial=false,upgrades=[],crateKills=0,lastTier=1;
 const end=run(0,0,{observe:(s,b)=>{
  for(const t of b.targets.filter(t=>t.kind==='crate')){const now=s.targets.find(q=>q.id===t.id);damaged ||= !!now&&now.hp<t.hp;}
  crateKills+=s.effects.filter(e=>e.kind==='kill'&&e.value===30).length;
  partial ||= s.weapon===1&&s.weaponXP===30&&s.weaponNeed===40;
  if(s.weapon>lastTier){upgrades.push({tier:s.weapon,time:s.time,crates:crateKills});lastTier=s.weapon;}
 }});assert.ok(damaged&&partial);assert.equal(end.weapon,4);assert.deepEqual(upgrades.map(v=>v.tier),[2,3,4]);assert.ok(upgrades[0].crates>=2);assert.ok(upgrades[2].time>30);assert.equal(end.weaponNeed,0);assert.equal(end.weaponXP,0);
 const withoutCrates=run(0,0,{controls:()=>0,ability:false});assert.equal(withoutCrates.weapon,1);assert.equal(withoutCrates.weaponXP,0);
});
test('strong fifty-health barrier is destroyed by shots and grants extra XP',()=>{
 let seen=false,damaged=false,loot=false;run(2,0,{observe:(s,b)=>{const t=s.targets.find(q=>q.kind==='crate'&&q.maxHp===50);if(t){seen=true;damaged ||= t.hp<50;}const old=b.targets.find(q=>q.kind==='crate'&&q.maxHp===50);if(old&&!s.targets.some(q=>q.id===old.id)&&s.effects.some(e=>e.kind==='kill'&&e.value===30&&Math.abs(e.x-old.x)<.01))loot=true;}});assert.ok(seen&&damaged&&loot);
});
test('rollers actually traverse sideways with different authored patterns',()=>{
 for(let level=0;level<3;level++){const positions=new Map();let maxTravel=0;run(2,level,{observe:s=>{for(const t of s.targets.filter(q=>q.kind==='hazard')){const range=positions.get(t.id)??[t.x,t.x];range[0]=Math.min(range[0],t.x);range[1]=Math.max(range[1],t.x);positions.set(t.id,range);maxTravel=Math.max(maxTravel,range[1]-range[0]);}}});assert.ok(positions.size>=5);assert.ok(maxTravel>(level===0?1:2));}
});
test('steering into a roller loses troops while steering around it avoids that impact',()=>{
 function encounter(hit){start(2,1);let rollerId,roller;let damaged=false;for(let f=0;f<18*60;f++){const s=snap();roller ??= s.targets.find(t=>t.kind==='hazard');const live=s.targets.find(t=>t.id===roller?.id);if(live)roller=live;const input=live?(hit?live.x:live.x>=0?-2.8:2.8):route(s);if(s.energy>=100&&s.ability===0&&!live)core.activate();core.step(1/60,input);const now=snap();if(now.effects.some(e=>e.kind==='damage'&&e.value>=21&&Math.abs(e.x-(roller?.x??100))<.06))damaged=true;if(roller&&!now.targets.some(t=>t.id===roller.id))return damaged;}return damaged;}
 assert.equal(encounter(true),true);assert.equal(encounter(false),false);
});
test('earned charge gates relic activation, prevents duplicates and expires',()=>{
 for(let r=0;r<3;r++){start(r);assert.equal(core.activate(),false);const full=charged(r);assert.equal(full.energy,100);assert.equal(core.activate(),true);assert.equal(core.activate(),false);assert.ok(snap().ability>0);const after=stepFor(7,route);assert.equal(after.ability,0);}
});
test('EMP slows approaching machines but not gates',()=>{
 let before=charged(1);for(let f=0;f<600&&!(before.targets.some(t=>t.kind==='gate'&&t.z>2)&&before.targets.some(t=>t.kind==='enemy'&&t.z>12));f++){core.step(1/60,route(before));before=snap();}const gate=before.targets.find(t=>t.kind==='gate'&&t.z>2);const enemy=before.targets.find(t=>t.kind==='enemy'&&t.z>12);assert.ok(gate&&enemy);assert.ok(core.activate());const after=stepFor(.3,3);const g=after.targets.find(t=>t.id===gate.id),e=after.targets.find(t=>t.id===enemy.id);assert.ok(g&&e);assert.ok(Math.abs((gate.z-g.z)-1.11)<.002);assert.ok(Math.abs((enemy.z-e.z)-1.11*.42)<.002);
});
test('Overdrive increases the actual allied projectile stream',()=>{
 charged(0);core.activate();const ordinary=stepFor(.7,3).shots.length;charged(2);core.activate();const boosted=stepFor(.7,3).shots.length;assert.ok(boosted>ordinary);
});
test('runner transitions preserve troop/weapon/relic state for all three bosses',()=>{
 for(let level=0;level<3;level++){let preceding;const b=run(2,level,{observe:(s,p)=>{if(s.phase==='boss')preceding=p;},stop:s=>s.phase==='boss'});assert.equal(b.phase,'boss');assert.ok(b.time>=b.duration&&b.time<b.duration+.04);assert.equal(b.army,preceding.army);assert.equal(b.weapon,preceding.weapon);assert.equal(b.relic,2);assert.equal(b.targets.length,0);assert.equal(b.shots.length,0);assert.equal(b.bossHp,b.bossMax);}
});
test('each boss visibly fires its own travelling shell, orb fan or rocket volley',()=>{
 for(let level=0;level<3;level++){boss(2,level);let volley;stepFor(4,3,60,s=>{if(!volley&&s.enemyShots.length)volley=s;});assert.ok(volley);assert.equal(volley.enemyShots.length,[1,5,3][level]);assert.ok(volley.enemyShots.every(q=>q.kind===['shell','orb','rocket'][level]&&q.dz<0&&q.z>17));const old=volley.enemyShots[0];const later=stepFor(.1,3).enemyShots.find(q=>q.id===old.id);if(later)assert.ok(later.z<old.z);assert.equal(volley.bossAttack,1);}
});
test('real incoming boss shots hit an occupied lane and miss a dodged lane',()=>{
 for(let level=0;level<3;level++){
  const unsafeStart=boss(2,level);let damage=0;const unsafe=stepFor(6,s=>level===1?(s.bossAttack>=1&&s.enemyShots.some(t=>t.z<7)?0:3):3,60,s=>{damage+=s.effects.filter(e=>e.kind==='damage').reduce((a,e)=>a+e.value,0);});assert.ok(damage>0,`Level${level} never hit`);assert.ok(unsafe.army<unsafeStart.army);
  const safeStart=boss(2,level);let avoided=0;const safe=stepFor(6,route,60,s=>{avoided+=s.effects.filter(e=>e.kind==='damage').reduce((a,e)=>a+e.value,0);});assert.equal(avoided,0);assert.equal(safe.army,safeStart.army);
 }
});
test('Shield blocks a real boss shell and EMP slows real incoming projectiles',()=>{
 boss(0,0);let state=snap();for(let f=0;f<4*60;f++){core.step(1/60,3);state=snap();if(state.bossAttack>.8&&state.energy>=100&&state.ability===0){assert.ok(core.activate());break;}}
 const protectedArmy=snap().army;let lost=0;stepFor(2.5,3,60,s=>{lost+=s.effects.filter(e=>e.kind==='damage').reduce((a,e)=>a+e.value,0);});assert.equal(lost,0);assert.equal(snap().army,protectedArmy);
 boss(1,0,false);state=snap();for(let f=0;f<9*60&&!(state.enemyShots.length&&state.energy>=100&&state.ability===0);f++){core.step(1/60,3);state=snap();}assert.ok(state.enemyShots.length);assert.equal(state.energy,100);const shell=state.enemyShots[0];assert.ok(core.activate());const active=snap().enemyShots[0];assert.ok(Math.abs(active.dz/shell.dz-.42)<.0001);const after=stepFor(.2,3).enemyShots.find(t=>t.id===shell.id);assert.ok(after);assert.ok(Math.abs(after.z-shell.z-active.dz*.2)<.002);
});
test('Citadel ranged elites fire collision-bearing projectiles during the run',()=>{let seen=false;run(2,2,{observe:s=>{seen ||= s.phase==='run'&&s.enemyShots.some(q=>q.kind==='orb'&&q.dz<0);}});assert.ok(seen);});
test('every stage is beatable with every relic and no purchased upgrades',()=>{
 for(let l=0;l<3;l++)for(let r=0;r<3;r++){let activeFrames=0;const s=run(r,l,{observe:s=>{if(s.ability>0)activeFrames++;}});assert.equal(s.phase,'won',`Level ${l}/relic ${r}: ${s.phase} army${s.army} time${s.time}`);assert.equal(s.bossHp,0);assert.ok(s.army>0);winningRuns.push({level:l,relic:r,time:s.time,army:s.army,weapon:s.weapon,kills:s.kills,score:s.score,abilityUptime:activeFrames/(s.time*60)});}
});
test('relic energy cannot regenerate during its active tactical window',()=>{
 for(let r=0;r<3;r++){charged(r);assert.ok(core.activate());stepFor(2,route,60,s=>{assert.ok(s.ability>0);assert.equal(s.energy,0);});}
});
test('missing gate choices and never dodging can lose all stages',()=>{for(let l=0;l<3;l++){const s=run(0,l,{controls:()=>0,ability:false});assert.equal(s.phase,'lost');assert.equal(s.army,0);const stopped=persistent(s);assert.deepEqual(persistent(stepFor(3,-3)),stopped);assert.equal(core.activate(),false);}});
test('pause freezes steering, ability, machines, allied and enemy shots',()=>{boss(1,2);stepFor(4,3);core.activate();snap();core.pause(true);const before=persistent(snap());assert.deepEqual(persistent(stepFor(10,-3)),before);assert.equal(core.activate(),false);core.pause(false);assert.ok(stepFor(.5,3).time>before.time);});
test('fixed-step outcomes agree at 30, 60 and 120 Hz in all stages',()=>{for(let l=0;l<3;l++){const replay=hz=>{start(0,l);return persistent(stepFor(15,1.8,hz));};const ref=replay(60);assert.deepEqual(replay(30),ref);assert.deepEqual(replay(120),ref);}});
test('all state pools and numeric values stay finite and bounded through full runs',()=>{
 for(let l=0;l<3;l++)run(1,l,{observe:s=>{assert.ok(s.targets.length<=256);assert.ok(s.shots.length<=256);assert.ok(s.enemyShots.length<=96);assert.ok(s.effects.length<=192);assert.ok(s.weapon>=1&&s.weapon<=4);assert.ok(s.army>=0&&s.army<=160);for(const key of ['time','x','energy','weaponXP','weaponNeed','bossAttack'])assert.ok(Number.isFinite(s[key]));for(const q of s.enemyShots)assert.ok(q.radius>0&&Number.isFinite(q.dx)&&Number.isFinite(q.dz));}});
});
test('effects drain once per snapshot without changing ongoing state',()=>{start();core.step(.25,-1.8);core.step(.25,-1.8);const one=snap(),two=snap();assert.ok(one.effects.length>0||one.shots.length>0);assert.equal(two.effects.length,0);assert.deepEqual(persistent(one),persistent(two));});
test('250 retries clear transient objects and do not increase WASM allocation',()=>{
 const resets=[start(0,0),start(0,1),start(0,2)].map(persistent);const memory=core.api.memory.buffer.byteLength;for(let i=0;i<250;i++){start(i%3,i%3);stepFor(3,1.8);core.pause(true);assert.deepEqual(persistent(start(0,i%3)),resets[i%3]);assert.equal(core.api.memory.buffer.byteLength,memory);core.step(1/60,0);assert.ok(snap().time>0);}
});
const report={schema:2,scope:'Actual three-level Assault browser adapter and shipped WASM. Automated controls only; no Unreal, physical-device or first-time-player validation.',binary:binaryPath,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),memoryBytes:core.api.memory.buffer.byteLength,testedAt:new Date().toISOString(),winningRuns,tests:results.length,passed:results.filter(r=>r.status==='pass').length,failed:results.filter(r=>r.status==='fail').length,results};
fs.mkdirSync(path.join(root,'builds'),{recursive:true});fs.writeFileSync(path.join(root,'builds/rebuild-test-results.json'),JSON.stringify(report,null,2));console.log(`${report.passed}/${report.tests} checks passed.`);if(report.failed)process.exitCode=1;
