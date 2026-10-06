// Internal visual QA harness. Every encounter and outcome comes from the shipping WASM.
import {AssaultCore} from './assault-core';
import {Battlefield} from './world';
import type {Snapshot,PickupPower} from './contract';
import {powerKind} from './power-catalog';
import type {BufferGeometry,Mesh} from 'three';
import type {AuthoritativeBossRegion} from './boss-rig-adapter';
const canvas=document.querySelector('canvas')!;
const core=new AssaultCore(),world=new Battlefield(canvas);
let state:Snapshot,paused=false,previous=performance.now(),speed=1;
let seekPower:PickupPower|undefined,missCore=false,watchEnemy=0;
let autoRelic=true;
let campaignSoak=false,autoRewards=true;
let seekMiss='';
const soakCases=[...[0,3,4].flatMap(level=>[0,1,2].map(relic=>({level,relic,rank:0}))),...([0,3,4].map((level,relic)=>({level,relic,rank:3})))];
let chosenBossRegion:string|undefined;
let soak:{remaining:number;results:unknown[];frames:number;longFrames:number;peakCalls:number;peakTriangles:number;peakGeometries:number;peakTextures:number;started:number}|undefined;
const status=document.querySelector('output')!;
const soakReport=document.querySelector('#soak-report')!;
document.querySelector('#toggle-tools')!.addEventListener('click',event=>{const hidden=document.body.classList.toggle('clean-capture');(event.currentTarget as HTMLButtonElement).textContent=hidden?'Show controls':'Hide controls';});
const geometryHistory=new Map<BufferGeometry,{owner:string;type:string;release:()=>void}>();
function observeGeometry(){
 const live=new Set<BufferGeometry>();world.scene.traverse(object=>{const mesh=object as Mesh;if(!mesh.geometry)return;const geometry=mesh.geometry;live.add(geometry);
  if(!geometryHistory.has(geometry)){const release=()=>{geometryHistory.delete(geometry);geometry.removeEventListener('dispose',release);};geometry.addEventListener('dispose',release);geometryHistory.set(geometry,{owner:object.name||object.parent?.name||object.type,type:geometry.type,release});}
 });
 return [...geometryHistory].filter(([g])=>!live.has(g)).map(([g,record])=>({id:g.id,owner:record.owner,type:record.type}));
}
function clearGeometryHistory(){for(const [geometry,record]of geometryHistory)geometry.removeEventListener('dispose',record.release);geometryHistory.clear();}
function aim(s:Snapshot){
 const observed=watchEnemy?s.targets.find(t=>t.archetype===watchEnemy&&t.z>0&&t.z<32):undefined;
 if(observed&&s.phase==='run')return observed.x>=0?-3:3;
 if(s.phase==='boss'){
  if(s.campaign&&s.clash?.active)return s.x;
  if(s.campaign&&s.clash?.result==='none'&&s.bossPattern==='laser'&&s.bossAttack>.4&&(s.laserCharges??0)>0)return s.bossLane;
  if(missCore&&s.bossState==='exposed')return s.bossX>=0?-3:3;
  const regions=s.bossZ<28?(s as Snapshot&{bossRegions?:AuthoritativeBossRegion[]}).bossRegions?.filter(r=>r.vulnerable&&r.hp>0):undefined;
  let region=regions?.find(r=>r.id===chosenBossRegion);
  if(!region&&regions?.length){region=[...regions].sort((a,b)=>Math.abs(a.x-s.x)-Math.abs(b.x-s.x))[0];chosenBossRegion=region.id;}
  const reward=s.pickups.filter(p=>p.z<5.5&&p.z>0).sort((a,b)=>((b.kind==='health'&&s.commanderHp<s.commanderMaxHp-18?100:0)+(b.bonusTroops&&s.army<45?50:0)-b.z)-((a.kind==='health'&&s.commanderHp<s.commanderMaxHp-18?100:0)+(a.bonusTroops&&s.army<45?50:0)-a.z))[0];
  const desired=Math.max(-3,Math.min(3,reward?.x??region?.x??s.bossX));
  const shots=s.enemyShots.filter(p=>p.z<5.5&&p.dz<-.01).map(p=>({x:p.x-p.dx*p.z/p.dz,size:p.radius+.5}));
  if(s.bossPattern==='laser'&&s.bossAction==='windup'&&s.bossAttack>.6)return s.bossLane>0?-2.8:2.8;
  if(s.lasers.length)return s.lasers[0].endX>0?-2.8:2.8;
  return[desired,-2.8,2.8,-1.5,1.5,0].filter(x=>!shots.some(p=>Math.abs(x-p.x)<p.size)).sort((a,b)=>Math.abs(a-desired)-Math.abs(b-desired))[0]??desired;
 }
 if(seekPower){const selected=s.pickups.filter(p=>p.kind===seekPower&&p.z<24).sort((a,b)=>a.z-b.z)[0];if(selected)return selected.x;const orb=s.targets.find(t=>t.kind==='orb'&&powerKind(t.value)===seekPower&&t.z<29);if(orb)return orb.x;}
 const pickup=s.pickups.filter(p=>p.z<6).sort((a,b)=>a.z-b.z)[0];
 const goals=s.targets.filter(t=>t.z>1&&t.z<29&&(t.kind==='crate'||t.kind==='gate'||t.kind==='orb'||t.kind==='enemy'&&t.variant>0&&(t.z<14||(s.level===0||s.level>=3)&&['gunner','battery','carrier'].includes(t.role)&&t.z<25))).sort((a,b)=>a.z-b.z);
 let desired=pickup?.x??goals[0]?.x??0;
 function choice(first:Snapshot['targets'][number]){const pair=s.targets.filter(t=>t.kind==='gate'&&Math.abs(t.z-first.z)<.02);pair.sort((a,b)=>(b.op?s.army*(b.value-1):b.value)-(a.op?s.army*(a.value-1):a.value));return pair[0]?.x??desired;}
 if(goals[0]?.kind==='gate')desired=choice(goals[0]);
 const close=s.targets.filter(t=>t.kind==='gate'&&t.z>0&&t.z<3.5).sort((a,b)=>a.z-b.z)[0];if(close)desired=choice(close);
 const hazard=s.targets.find(t=>t.kind==='hazard'&&t.z<3&&Math.abs(t.x-desired)<t.size+.5);if(hazard)desired=hazard.x>0?-3:3;
 if(s.level===1||s.level===2)return desired;
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
 const previousWeapon=state.weapon;
 if(state.campaign){
  if(state.phase==='reward'&&autoRewards)core.chooseReward(state.commanderHp<state.commanderMaxHp-20?'vitality':'laser');
  if(state.clash?.active)core.clashTap();
  const firstLaser=state.clash?.result==='none'&&state.phase==='boss'&&state.bossPattern==='laser'&&state.bossAttack>.4;
  if(firstLaser&&state.bossAttack>.97)core.fireLaser();
  if(autoRelic&&!firstLaser&&!state.clash?.active){if((state.relics?.[0].energy??0)>=100&&(state.phase==='boss'||state.commanderHp<55))core.activateRelic(0);if((state.relics?.[1].energy??0)>=100&&(state.phase==='run'||state.bossAttack>.7))core.activateRelic(1);if((state.relics?.[2].energy??0)>=100)core.activateRelic(2);}
 }else if(autoRelic&&state.energy>=100&&state.ability<=0)core.activate();
 core.step(dt,aim(state));state=core.snapshot();
 if(render){for(const event of state.effects)world.trigger(event,state);if(state.weapon>previousWeapon)world.weaponUpgrade(previousWeapon,state.weapon);world.update(state,dt,'play',draw);if(soak)observeGeometry();}
}
function start(){seekMiss='';autoRelic=true;autoRewards=true;seekPower=undefined;missCore=false;watchEnemy=0;chosenBossRegion=undefined;core.start(Number((document.querySelector('#relic') as HTMLSelectElement).value) as 0|1|2,Number((document.querySelector('#level') as HTMLSelectElement).value),Number((document.querySelector('#rank') as HTMLSelectElement).value));state=core.snapshot();world.reset();paused=false;}
document.querySelector('#start')!.addEventListener('click',()=>{soak=undefined;clearGeometryHistory();autoRelic=true;start();});
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
 for(let i=0;i<60000&&['run','boss','destroying','reward','reviving'].includes(state.phase)&&!predicate(state);i++){preceding=state;tick(1/60,false);}
 if(!predicate(state))seekMiss=`REPLAY TARGET NOT REACHED (${state.phase})`;
 world.reset();world.update(preceding,0,'play');for(const event of state.effects)world.trigger(event,state);if(state.weapon>preceding.weapon)world.weaponUpgrade(preceding.weapon,state.weapon);world.update(state,.12,'play');paused=true;
}
document.querySelector('#core')!.addEventListener('click',()=>{start();replayUntil(s=>s.bossState==='exposed');});
document.querySelector('#gunner')!.addEventListener('click',()=>{start();replayUntil(s=>s.targets.some(t=>(t.role==='gunner'||t.role==='battery')&&t.fireState==='locked'&&t.z<25));});
document.querySelector('#elite')!.addEventListener('click',()=>{start();replayUntil(s=>s.effects.some(e=>e.kind==='kill'&&(e.variant===1||e.variant===2)));});
document.querySelector('#guard')!.addEventListener('click',()=>{start();missCore=true;replayUntil(s=>s.bossState==='guarded');missCore=false;});
document.querySelector('#revive')!.addEventListener('click',()=>{start();missCore=true;replayUntil(s=>s.bossState==='rebuilding');missCore=false;});
document.querySelector('#collect')!.addEventListener('click',()=>{start();seekPower=(document.querySelector('#pickup') as HTMLSelectElement).value as PickupPower;replayUntil(s=>s.effects.some(e=>e.kind==='pickup'&&powerKind(e.value)===seekPower));seekPower=undefined;});
document.querySelector('#part')!.addEventListener('click',()=>{start();replayUntil(s=>s.effects.some(e=>e.kind==='bossPartBreak'));});
document.querySelector('#evade')!.addEventListener('click',()=>{start();replayUntil(s=>s.bossAction==='evade');});
document.querySelector('#recovery')!.addEventListener('click',()=>{start();replayUntil(s=>(s.bossFiringWindow??0)>0);});
document.querySelector('#grounded')!.addEventListener('click',()=>{start();replayUntil(s=>s.phase==='boss'&&(s.bossPartsMask&12)===12&&(s.bossPartsMask&48)!==48&&!!s.bossPose&&Math.abs(s.bossPose.leg[0])+Math.abs(s.bossPose.leg[1])>.14);});
document.querySelector('#part-hit')!.addEventListener('click',()=>{start();replayUntil(s=>s.phase==='boss'&&s.bossZ<18&&s.effects.some(e=>e.kind==='hit'&&e.value>0&&typeof(e as typeof e&{hitRegion?:string}).hitRegion==='string'));});
document.querySelector('#laser')!.addEventListener('click',()=>{start();replayUntil(s=>s.lasers.length>0);});
document.querySelector('#arrival')!.addEventListener('click',()=>{start();replayUntil(s=>s.phase==='boss'&&s.bossZ<22&&s.bossZ>13);});
document.querySelector('#rockets')!.addEventListener('click',()=>{start();replayUntil(s=>s.phase==='boss'&&s.enemyShots.some(p=>p.kind==='rocket'));});
document.querySelector('#shells')!.addEventListener('click',()=>{start();replayUntil(s=>s.enemyShots.some(p=>p.sourceId>0&&p.z<22));});
document.querySelector('#charge')!.addEventListener('click',()=>{start();replayUntil(s=>s.phase==='boss'&&s.bossPattern==='laser'&&s.bossAction==='windup'&&s.bossAttack>.7);});
document.querySelector('#powered')!.addEventListener('click',()=>{start();replayUntil(s=>s.phase==='boss'&&s.bossZ<22&&s.ability>0&&s.shots.length>0);});
document.querySelector('#upgrade')!.addEventListener('click',()=>{start();replayUntil(s=>s.weapon>1);});
document.querySelector('#relic-start')!.addEventListener('click',()=>{start();replayUntil(s=>s.ability>0);});
document.querySelector('#relic-ready')!.addEventListener('click',()=>{start();autoRelic=false;replayUntil(s=>s.energy>=100);});
document.querySelector('#activate')!.addEventListener('click',()=>act(()=>core.activate()));
document.querySelector('#carrier-open')!.addEventListener('click',()=>{start();replayUntil(s=>s.targets.some(t=>t.role==='carrier'&&t.ventOpen&&t.z<24));});
document.querySelector('#shield-impact')!.addEventListener('click',()=>{(document.querySelector('#relic') as HTMLSelectElement).value='0';start();replayUntil(s=>s.effects.some(e=>e.kind==='shieldHit'));});
document.querySelector('#soak')!.addEventListener('click',()=>{
 campaignSoak=false;
 clearGeometryHistory();autoRelic=true;speed=4;(document.querySelector('#speed') as HTMLSelectElement).value='4';
 selectSoakCase(0);
 soak={remaining:12,results:[],frames:0,longFrames:0,peakCalls:0,peakTriangles:0,peakGeometries:0,peakTextures:0,started:performance.now()};soakReport.textContent='Running 12 real-render repeats…';start();
});
document.querySelector('#campaign-soak')!.addEventListener('click',()=>{campaignSoak=true;clearGeometryHistory();speed=4;(document.querySelector('#speed') as HTMLSelectElement).value='4';selectSoakCase(0);soak={remaining:3,results:[],frames:0,longFrames:0,peakCalls:0,peakTriangles:0,peakGeometries:0,peakTextures:0,started:performance.now()};soakReport.textContent='Running three full campaign renders…';start();});
function selectSoakCase(index:number){const entry=campaignSoak?{level:5,relic:0,rank:index===0?0:3}:soakCases[index];(document.querySelector('#level') as HTMLSelectElement).value=String(entry.level);(document.querySelector('#relic') as HTMLSelectElement).value=String(entry.relic);(document.querySelector('#rank') as HTMLSelectElement).value=String(entry.rank);}
for(let archetype=1;archetype<=4;archetype++)document.querySelector('#enemy-'+archetype)!.addEventListener('click',()=>{(document.querySelector('#level') as HTMLSelectElement).value='5';start();autoRelic=false;watchEnemy=archetype;replayUntil(s=>s.targets.some(t=>t.archetype===archetype&&t.z<14&&t.z>9));watchEnemy=0;});
document.querySelector('#clash')!.addEventListener('click',()=>{(document.querySelector('#level') as HTMLSelectElement).value='5';start();replayUntil(s=>!!s.clash?.active);});
document.querySelector('#clash-tap')!.addEventListener('click',()=>act(()=>core.clashTap()));
document.querySelector('#campaign-reward')!.addEventListener('click',()=>{(document.querySelector('#level') as HTMLSelectElement).value='5';start();replayUntil(s=>s.phase==='reward');});
document.querySelector('#campaign-next')!.addEventListener('click',()=>act(()=>core.chooseReward('vitality')));
document.querySelector('#campaign-health')!.addEventListener('click',()=>{(document.querySelector('#level') as HTMLSelectElement).value='5';start();seekPower='health';replayUntil(s=>s.effects.some(e=>e.kind==='healthPickup'&&e.value>0));});
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
 if(!paused){const steps=Math.max(1,Math.ceil(speed));for(let i=0;i<steps;i++)tick(dt*speed/steps,true,i===steps-1);}else world.update(state,0,'paused');
 status.textContent=`${state.phase} · ${state.time.toFixed(1)}s · army ${state.army} (${state.formation.length} visible) · Marshal ${state.commanderHp.toFixed(0)}HP · kills ${state.kills} · weapon ${state.weapon} · ${state.weaponPower} ${state.weaponPermanent?'full run':state.powerTime.toFixed(1)+'s'} · ${state.timePower} ${state.timePowerTime.toFixed(1)}s · ${state.bossState} ${state.bossCoreTime.toFixed(1)}s · armor ${state.bossArmor.toFixed(0)} · core ${state.bossCoreHp.toFixed(0)} · broken mask ${state.bossPartsMask} · next ${state.bossPart} · beams ${state.lasers.length} · heal ${state.canHeal} · revive ${state.reviveAvailable} · revives ${state.bossRevives} · phase ${state.bossPhase} ${state.bossPattern}`;
 status.textContent+=` · relic active ${state.ability.toFixed(1)}s · energy ${state.energy.toFixed(0)}`;
 status.textContent+=` · combat power ${state.combatPower??'none'} ${(state.combatPowerTime??0).toFixed(2)}s · friendly beams ${state.friendlyBeams?.length??0} · dodge tell ${(state.bossEvadeTell??0).toFixed(2)}s · evade ${(state.bossEvadeTime??0).toFixed(2)}s · recovery ${(state.bossFiringWindow??0).toFixed(2)}s`;
 status.textContent+=` · act ${(state.actIndex??0)+1} · laser charges ${state.laserCharges??0} · clash ${state.clash?.active?'ACTIVE':state.clash?.result??'none'} ${((state.clash?.progress??0)*100).toFixed(0)}% · revive ${state.reviveCinematicTime??0}s`;
 if(seekMiss)status.textContent+=` · ${seekMiss}`;
 status.textContent+=` · EMP stun ${(state.empStunTime??0).toFixed(1)}s · escort ${state.escortShield??0}/${state.escortMax??30} · carrier ${state.targets.filter(t=>t.role==='carrier').map(t=>t.ventOpen?'OPEN':'armored').join(',')||'absent'}`;
 status.textContent+=` · airborne ${state.bossY.toFixed(2)}m · enemy rounds ${state.enemyShots.length} · ${[...new Set(state.enemyShots.map(shot=>shot.emitter??'legacy'))].join(', ')}`;
 status.textContent+=` · attack admission ${state.safetyAdmitted??0} / deferred ${state.safetyDeferred??0} / unsupported ${state.safetyUnsupported??0} / capacity ${state.safetyCapacity??0}`;
 const partRegions=(state as Snapshot&{bossRegions?:AuthoritativeBossRegion[]}).bossRegions;
 if(partRegions?.length)status.textContent+=` · vulnerable ${partRegions.filter(r=>r.vulnerable&&r.hp>0).map(r=>r.id+' '+Math.ceil(r.hp)+'HP').join(', ')||'none'}`;
 if(state.clash?.active){const c=world.clashVisuals.stats;status.textContent+=` · contact front ${c.visible?'visible':'hidden'} / ${c.arcs} arcs / ${c.sparks} sparks at ${c.contact.map(v=>v.toFixed(2)).join(',')}`;}
 const info=world.renderer.info;status.textContent+=` · draw calls ${info.render.calls} · triangles ${info.render.triangles} · geometries ${info.memory.geometries} · textures ${info.memory.textures}`;
 if(soak){soak.frames++;if(dt>.034)soak.longFrames++;soak.peakCalls=Math.max(soak.peakCalls,info.render.calls);soak.peakTriangles=Math.max(soak.peakTriangles,info.render.triangles);soak.peakGeometries=Math.max(soak.peakGeometries,info.memory.geometries);soak.peakTextures=Math.max(soak.peakTextures,info.memory.textures);
  if(['won','lost','lastStand'].includes(state.phase)||state.time>=(campaignSoak?900:240)){
   soak.results.push({result:state.time>=(campaignSoak?900:240)?'timeout':state.phase,level:state.level,seconds:state.time,act:state.actIndex,rank:Number((document.querySelector('#rank') as HTMLSelectElement).value),relic:state.relic,geometries:info.memory.geometries,textures:info.memory.textures,boss:{partsMask:state.bossPartsMask,coreHp:state.bossCoreHp,sweepUnresolved:state.sweepUnresolved??0},attackAdmission:{admitted:state.safetyAdmitted,deferred:state.safetyDeferred,unsupported:state.safetyUnsupported,existingUnsafe:state.safetyExistingUnsafe,capacity:state.safetyCapacity,authoredRockets:state.safetyAuthoredRockets,horizon:state.safetyHorizon},orphanGeometry:observeGeometry()});soak.remaining--;
   soakReport.textContent=JSON.stringify({scope:'Desktop real WebGL replay, 4x simulation speed. Not mobile FPS.',completed:soak.results.length,remaining:soak.remaining,wallSeconds:(performance.now()-soak.started)/1000,frames:soak.frames,framesAbove34ms:soak.longFrames,peakCalls:soak.peakCalls,peakTriangles:soak.peakTriangles,peakGeometries:soak.peakGeometries,peakTextures:soak.peakTextures,runs:soak.results},null,2);
   if(soak.remaining){selectSoakCase(soak.results.length);start();}else{paused=true;soak=undefined;clearGeometryHistory();}
  }
 }
 canvas.dataset.phase=state.phase;requestAnimationFrame(frame);
}requestAnimationFrame(frame);
