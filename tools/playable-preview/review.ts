// Internal visual QA harness. Every encounter and outcome comes from the shipping WASM.
import {AssaultCore} from './assault-core';
import {Battlefield} from './world';
import type {Snapshot,PickupPower} from './contract';
import {powerKind} from './power-catalog';
const canvas=document.querySelector('canvas')!;
const core=new AssaultCore(),world=new Battlefield(canvas);
let state:Snapshot,paused=false,previous=performance.now(),speed=1;
let seekPower:PickupPower|undefined,missCore=false;
const status=document.querySelector('output')!;
function aim(s:Snapshot){
 if(s.phase==='boss'){
  if(missCore&&s.bossState==='exposed')return s.bossX>=0?-3:3;
  const shots=s.enemyShots.filter(p=>p.z<5.5).map(p=>({x:p.x-p.dx*p.z/p.dz,size:p.radius+.5}));const desired=s.bossX;
  if(s.bossPattern==='laser'&&s.bossAction==='windup'&&s.bossAttack>.6)return s.bossLane>0?-2.8:2.8;
  if(s.lasers.length)return s.lasers[0].endX>0?-2.8:2.8;
  return[desired,-2.8,2.8,-1.5,1.5,0].filter(x=>!shots.some(p=>Math.abs(x-p.x)<p.size)).sort((a,b)=>Math.abs(a-desired)-Math.abs(b-desired))[0]??desired;
 }
 if(seekPower){const selected=s.pickups.filter(p=>p.kind===seekPower&&p.z<24).sort((a,b)=>a.z-b.z)[0];if(selected)return selected.x;const orb=s.targets.find(t=>t.kind==='orb'&&powerKind(t.value)===seekPower&&t.z<29);if(orb)return orb.x;}
 const pickup=s.pickups.filter(p=>p.z<6).sort((a,b)=>a.z-b.z)[0];
 const goals=s.targets.filter(t=>t.z>1&&t.z<29&&(t.kind==='crate'||t.kind==='gate'||t.kind==='orb'||t.kind==='enemy'&&t.variant>0&&t.z<14)).sort((a,b)=>a.z-b.z);
 let desired=pickup?.x??goals[0]?.x??0;
 function choice(first:Snapshot['targets'][number]){const pair=s.targets.filter(t=>t.kind==='gate'&&Math.abs(t.z-first.z)<.02);pair.sort((a,b)=>(b.op?s.army*(b.value-1):b.value)-(a.op?s.army*(a.value-1):a.value));return pair[0]?.x??desired;}
 if(goals[0]?.kind==='gate')desired=choice(goals[0]);
 const close=s.targets.filter(t=>t.kind==='gate'&&t.z>0&&t.z<3.5).sort((a,b)=>a.z-b.z)[0];if(close)desired=choice(close);
 const hazard=s.targets.find(t=>t.kind==='hazard'&&t.z<3&&Math.abs(t.x-desired)<t.size+.5);if(hazard)desired=hazard.x>0?-3:3;
 if(s.level!==0)return desired;
 // This review route sees the same published attack cues as the rendered game.
 // It is an automated visual-QA aid, not evidence of human difficulty or aim.
 const half=Math.max(.4,...s.formation.map(unit=>Math.abs(unit.x-s.x)+.36));
 const nearby=s.enemyShots.filter(shot=>shot.dz<-.01&&shot.z>-4&&shot.z<12);
 const candidates=[Math.max(-3,Math.min(3,desired)),-2.8,-1.4,0,1.4,2.8,s.x];
 function cost(lane:number){let value=Math.abs(lane-desired)*.28+Math.abs(lane-s.x)*.08;
  for(const shot of nearby){const until=Math.max(0,shot.z/-shot.dz),impact=shot.x+shot.dx*until;if(Math.abs(lane-impact)<half+shot.radius+.12)value+=6/(1+until);}
  for(const gunner of s.targets.filter(t=>(t.role==='gunner'||t.role==='battery')&&(t.fireState==='locked'||t.fireState==='fire')&&t.z>3&&t.z<25))if(Math.abs(lane-gunner.aimX)<half+.45)value+=7;
  for(const roller of s.targets.filter(t=>t.kind==='hazard'&&t.z<8&&t.z>-4))if(Math.abs(lane-roller.x)<roller.size*1.048+half)value+=5;
  return value;
 }
 return candidates.sort((a,b)=>cost(a)-cost(b))[0];
}
function tick(dt:number,render=true,draw=true){
 if(state.phase==='lastStand')return;
 if(state.energy>=100&&state.ability<=0)core.activate();
 core.step(dt,aim(state));state=core.snapshot();
 if(render){for(const event of state.effects)world.trigger(event,state);world.update(state,dt,'play',draw);}
}
function start(){seekPower=undefined;missCore=false;core.start(Number((document.querySelector('#relic') as HTMLSelectElement).value) as 0|1|2,Number((document.querySelector('#level') as HTMLSelectElement).value),Number((document.querySelector('#rank') as HTMLSelectElement).value));state=core.snapshot();world.reset();paused=false;}
document.querySelector('#start')!.addEventListener('click',start);
document.querySelector('#pause')!.addEventListener('click',()=>{paused=!paused;});
document.querySelector('#step')!.addEventListener('click',()=>{paused=true;tick(1/30);});
document.querySelector('#advance')!.addEventListener('click',()=>{paused=true;for(let i=0;i<150;i++)tick(1/30,true,i===149);});
document.querySelector('#second')!.addEventListener('click',()=>{paused=true;for(let i=0;i<18;i++)tick(1/30,true,i===17);});
document.querySelector('#speed')!.addEventListener('change',event=>speed=Number((event.target as HTMLSelectElement).value));
document.querySelector('#boss')!.addEventListener('click',()=>{
 start();for(let i=0;i<24000&&state.phase==='run';i++)tick(1/60,false);world.reset();world.update(state,0,'play');paused=true;
});
document.querySelector('#death')!.addEventListener('click',()=>{
 start();let preceding=state;
 for(let i=0;i<30000&&['run','boss'].includes(state.phase);i++){preceding=state;tick(1/60,false);}
 world.reset();world.update(preceding,0,'play');for(const event of state.effects)world.trigger(event,state);world.update(state,0,'play');paused=true;
});
document.querySelector('#defeat')!.addEventListener('click',()=>{
 start();let preceding=state;
 for(let i=0;i<30000&&['run','boss'].includes(state.phase);i++){preceding=state;core.step(1/60,0);state=core.snapshot();}
 world.reset();world.update(preceding,0,'play');for(const event of state.effects)world.trigger(event,state);world.update(state,0,'play');paused=true;
});

function replayUntil(predicate:(s:Snapshot)=>boolean){
 let preceding=state;
 for(let i=0;i<18000&&['run','boss'].includes(state.phase)&&!predicate(state);i++){preceding=state;tick(1/60,false);}
 world.reset();world.update(preceding,0,'play');for(const event of state.effects)world.trigger(event,state);world.update(state,.12,'play');paused=true;
}
document.querySelector('#core')!.addEventListener('click',()=>{start();replayUntil(s=>s.bossState==='exposed');});
document.querySelector('#gunner')!.addEventListener('click',()=>{start();replayUntil(s=>s.targets.some(t=>(t.role==='gunner'||t.role==='battery')&&t.fireState==='locked'&&t.z<25));});
document.querySelector('#elite')!.addEventListener('click',()=>{start();replayUntil(s=>s.effects.some(e=>e.kind==='kill'&&(e.variant===1||e.variant===2)));});
document.querySelector('#guard')!.addEventListener('click',()=>{start();missCore=true;replayUntil(s=>s.bossState==='guarded');missCore=false;});
document.querySelector('#revive')!.addEventListener('click',()=>{start();missCore=true;replayUntil(s=>s.bossState==='rebuilding');missCore=false;});
document.querySelector('#collect')!.addEventListener('click',()=>{start();seekPower=(document.querySelector('#pickup') as HTMLSelectElement).value as PickupPower;replayUntil(s=>s.effects.some(e=>e.kind==='pickup'&&powerKind(e.value)===seekPower));seekPower=undefined;});
document.querySelector('#part')!.addEventListener('click',()=>{start();replayUntil(s=>s.effects.some(e=>e.kind==='bossPartBreak'));});
document.querySelector('#laser')!.addEventListener('click',()=>{start();replayUntil(s=>s.lasers.length>0);});
document.querySelector('#powered')!.addEventListener('click',()=>{start();replayUntil(s=>s.phase==='boss'&&s.bossZ<22&&s.ability>0&&s.shots.length>0);});
document.querySelector('#stand')!.addEventListener('click',()=>{
 start();for(let i=0;i<18000&&state.phase==='run';i++)tick(1/60,false);let preceding=state;
 for(let i=0;i<18000&&state.phase==='boss';i++){preceding=state;core.step(1/60,0);state=core.snapshot();}
 world.reset();world.update(preceding,0,'play');for(const e of state.effects)world.trigger(e,state);world.update(state,0,'play');paused=true;
});
function act(action:()=>unknown){action();state=core.snapshot();const sacrifices=[];for(const e of state.effects){world.trigger(e,state);if(e.kind==='troopSacrifice')sacrifices.push({x:e.x,z:-e.z});}if(sacrifices.length)world.sacrifice(sacrifices);world.update(state,.15,'play');paused=true;}
document.querySelector('#transfer')!.addEventListener('click',()=>act(()=>core.heal()));
document.querySelector('#save')!.addEventListener('click',()=>act(()=>core.revive()));
document.querySelector('#decline')!.addEventListener('click',()=>act(()=>core.declineRevive()));
await Promise.all([core.load(),world.load()]);start();
function frame(now:number){const dt=Math.min(.06,(now-previous)/1000);previous=now;
 if(!paused){for(let i=0;i<speed;i++)tick(dt,true,i===speed-1);}else world.update(state,0,'paused');
 status.textContent=`${state.phase} · ${state.time.toFixed(1)}s · army ${state.army} (${state.formation.length} visible) · Marshal ${state.commanderHp.toFixed(0)}HP · kills ${state.kills} · weapon ${state.weapon} · ${state.weaponPower} ${state.weaponPermanent?'full run':state.powerTime.toFixed(1)+'s'} · ${state.timePower} ${state.timePowerTime.toFixed(1)}s · ${state.bossState} ${state.bossCoreTime.toFixed(1)}s · armor ${state.bossArmor.toFixed(0)} · core ${state.bossCoreHp.toFixed(0)} · broken mask ${state.bossPartsMask} · next ${state.bossPart} · beams ${state.lasers.length} · heal ${state.canHeal} · revive ${state.reviveAvailable} · revives ${state.bossRevives} · phase ${state.bossPhase} ${state.bossPattern}`;
 status.textContent+=` · relic active ${state.ability.toFixed(1)}s · energy ${state.energy.toFixed(0)}`;
 canvas.dataset.phase=state.phase;requestAnimationFrame(frame);
}requestAnimationFrame(frame);
