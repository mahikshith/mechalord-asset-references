// Internal visual QA harness. Every encounter and outcome comes from the shipping WASM.
import {AssaultCore} from './assault-core';
import {Battlefield} from './world';
import type {Snapshot} from './contract';
const canvas=document.querySelector('canvas')!;
const core=new AssaultCore(),world=new Battlefield(canvas);
let state:Snapshot,paused=false,previous=performance.now(),speed=1;
const status=document.querySelector('output')!;
function aim(s:Snapshot){
 if(s.phase==='boss'){
  const shots=s.enemyShots.filter(p=>p.z<5.5).map(p=>({x:p.x-p.dx*p.z/p.dz,size:p.radius+.5}));const desired=s.bossX;
  return[desired,-2.8,2.8,-1.5,1.5,0].filter(x=>!shots.some(p=>Math.abs(x-p.x)<p.size)).sort((a,b)=>Math.abs(a-desired)-Math.abs(b-desired))[0]??desired;
 }
 const pickup=s.pickups.filter(p=>p.z<6).sort((a,b)=>a.z-b.z)[0];
 const goals=s.targets.filter(t=>t.z>1&&t.z<29&&(t.kind==='crate'||t.kind==='gate'||t.kind==='orb'||t.kind==='enemy'&&t.variant>0&&t.z<14)).sort((a,b)=>a.z-b.z);
 let desired=pickup?.x??goals[0]?.x??0;
 function choice(first:Snapshot['targets'][number]){const pair=s.targets.filter(t=>t.kind==='gate'&&Math.abs(t.z-first.z)<.02);pair.sort((a,b)=>(b.op?s.army*(b.value-1):b.value)-(a.op?s.army*(a.value-1):a.value));return pair[0]?.x??desired;}
 if(goals[0]?.kind==='gate')desired=choice(goals[0]);
 const close=s.targets.filter(t=>t.kind==='gate'&&t.z>0&&t.z<3.5).sort((a,b)=>a.z-b.z)[0];if(close)desired=choice(close);
 const hazard=s.targets.find(t=>t.kind==='hazard'&&t.z<3&&Math.abs(t.x-desired)<t.size+.5);return hazard?(hazard.x>0?-3:3):desired;
}
function tick(dt:number,render=true,draw=true){
 if(state.energy>=100&&state.ability<=0)core.activate();
 core.step(dt,aim(state));state=core.snapshot();
 if(render){for(const event of state.effects)world.trigger(event);world.update(state,dt,'play',draw);}
}
function start(){core.start(Number((document.querySelector('#relic') as HTMLSelectElement).value) as 0|1|2,Number((document.querySelector('#level') as HTMLSelectElement).value),Number((document.querySelector('#rank') as HTMLSelectElement).value));state=core.snapshot();world.reset();paused=false;}
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
 world.reset();world.update(preceding,0,'play');for(const event of state.effects)world.trigger(event);world.update(state,0,'play');paused=true;
});
document.querySelector('#defeat')!.addEventListener('click',()=>{
 start();let preceding=state;
 for(let i=0;i<30000&&['run','boss'].includes(state.phase);i++){preceding=state;core.step(1/60,0);state=core.snapshot();}
 world.reset();world.update(preceding,0,'play');for(const event of state.effects)world.trigger(event);world.update(state,0,'play');paused=true;
});
await Promise.all([core.load(),world.load()]);start();
function frame(now:number){const dt=Math.min(.06,(now-previous)/1000);previous=now;
 if(!paused){for(let i=0;i<speed;i++)tick(dt,true,i===speed-1);}else world.update(state,0,'paused');
 status.textContent=`${state.phase} · ${state.time.toFixed(1)}s · army ${state.army} · kills ${state.kills} · weapon ${state.weapon} · ${state.weaponPower} ${state.powerTime.toFixed(1)}s · ${state.bossHp.toFixed(0)} boss HP · phase ${state.bossPhase} ${state.bossPattern}`;
 canvas.dataset.phase=state.phase;requestAnimationFrame(frame);
}requestAnimationFrame(frame);
