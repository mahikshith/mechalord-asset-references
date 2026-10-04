// Internal visual QA harness. Every encounter and outcome comes from the shipping WASM.
import {AssaultCore} from './assault-core';
import {Battlefield} from './world';
import type {Snapshot} from './contract';
const canvas=document.querySelector('canvas')!;
const core=new AssaultCore(),world=new Battlefield(canvas);
let state:Snapshot,paused=false,previous=performance.now(),speed=1;
const status=document.querySelector('output')!;
function aim(s:Snapshot){
 if(s.phase==='boss')return s.bossX;
 const threat=s.targets.filter(t=>t.kind==='enemy'&&t.z<12).sort((a,b)=>a.z-b.z)[0];
 if(threat)return threat.x;
 const offers=s.targets.filter(t=>(t.kind==='crate'||t.kind==='gate')&&t.z>0).sort((a,b)=>a.z-b.z);
 const first=offers[0];if(!first)return -1.8;
 if(first.kind==='crate')return first.x;
 return offers.filter(t=>t.kind==='gate'&&Math.abs(t.z-first.z)<.1).sort((a,b)=>(b.op?s.army*(b.value-1):b.value)-(a.op?s.army*(a.value-1):a.value))[0]?.x??first.x;
}
function tick(dt:number,render=true){
 if(state.energy>=100&&state.ability<=0)core.activate();
 core.step(dt,aim(state));state=core.snapshot();
 if(render){for(const event of state.effects)world.trigger(event);world.update(state,dt,'play');}
}
function start(){core.start(Number((document.querySelector('#relic') as HTMLSelectElement).value) as 0|1|2,Number((document.querySelector('#level') as HTMLSelectElement).value));state=core.snapshot();world.reset();paused=false;}
document.querySelector('#start')!.addEventListener('click',start);
document.querySelector('#pause')!.addEventListener('click',()=>{paused=!paused;});
document.querySelector('#step')!.addEventListener('click',()=>{paused=true;tick(1/30);});
document.querySelector('#advance')!.addEventListener('click',()=>{paused=true;for(let i=0;i<150;i++)tick(1/30);});
document.querySelector('#second')!.addEventListener('click',()=>{paused=true;for(let i=0;i<18;i++)tick(1/30);});
document.querySelector('#speed')!.addEventListener('change',event=>speed=Number((event.target as HTMLSelectElement).value));
document.querySelector('#boss')!.addEventListener('click',()=>{
 start();for(let i=0;i<24000&&state.phase==='run';i++)tick(1/60,false);world.reset();world.update(state,0,'play');paused=true;
});
document.querySelector('#death')!.addEventListener('click',()=>{
 start();let preceding=state;
 for(let i=0;i<30000&&['run','boss'].includes(state.phase);i++){preceding=state;tick(1/60,false);}
 world.reset();world.update(preceding,0,'play');for(const event of state.effects)world.trigger(event);world.update(state,0,'play');paused=true;
});
await Promise.all([core.load(),world.load()]);start();
function frame(now:number){const dt=Math.min(.06,(now-previous)/1000);previous=now;
 if(!paused){for(let i=0;i<speed;i++)tick(dt);}else world.update(state,0,'paused');
 status.textContent=`${state.phase} · ${state.time.toFixed(1)}s · army ${state.army} · kills ${state.kills} · weapon ${state.weapon} · ${state.engagement?'ENGAGED':'MOVING'} · ${state.bossHp.toFixed(0)} boss HP`;
 canvas.dataset.phase=state.phase;requestAnimationFrame(frame);
}requestAnimationFrame(frame);
