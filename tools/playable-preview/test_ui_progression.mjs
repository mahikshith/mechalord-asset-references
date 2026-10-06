import {build,transform} from '../asset-viewer/node_modules/esbuild/lib/main.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';

// Runs the actual UI module. Only GPU, WASM and browser audio boundaries are replaced.
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const output=path.join(root,'builds/ui-progression-check.mjs');
await fs.mkdir(path.dirname(output),{recursive:true});
const html=await fs.readFile(path.join(here,'index.html'),'utf8');
const source=await fs.readFile(path.join(here,'main.ts'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'HUD IDs must be unique');
for(const [,id]of source.matchAll(/\$(?:<[^>]+>)?\(['"]([^'"]+)['"]\)/g))assert(ids.includes(id),'Missing control '+id);
assert.equal((source.match(/core\.snapshot\(/g)||[]).length,1,'Effects must be consumed once per frame');
for(const name of ['main.ts','audio.ts'])await transform(await fs.readFile(path.join(here,name),'utf8'),{loader:'ts',target:'es2022'});
await build({entryPoints:[path.join(here,'main.ts')],bundle:true,platform:'node',format:'esm',outfile:output,plugins:[{name:'test-boundaries',setup(b){
  b.onResolve({filter:/^\.\/(assault-core|world)$/},a=>({path:a.path,namespace:'ui-test'}));
  b.onLoad({filter:/.*/,namespace:'ui-test'},a=>({contents:a.path.endsWith('world')?
    'export class Battlefield{constructor(){globalThis.testWeaponResponses=[];}async load(){}reset(){}trigger(){}weaponUpgrade(previous,next){globalThis.testWeaponResponses.push([previous,next]);}sacrifice(){}update(){}}':`
    export class AssaultCore {
      constructor(){globalThis.testCore=this;this.steps=0;this.calls=[];}async load(){}
      start(relic,level=0,rank=0){
        this.calls.push({relic,level,rank});this.s={phase:'run',time:0,duration:40,level,levelName:['Reactor Siege','Roller Foundry','Citadel Breach','Storm Pass','Forge Core'][level],rank,rankReward:1,
        weaponPower:rank===3?'railburst':rank===2?'guided':rank===1?'cannons':'none',starterWeapon:rank===3?'railburst':rank===2?'guided':rank===1?'cannons':'none',weaponPermanent:rank>0,powerTime:0,timePower:'none',timePowerTime:0,x:0,army:8+rank*2,commanderHp:100+rank*5,commanderMaxHp:100+rank*5,energy:30,ability:0,relic,weapon:1,weaponXP:0,weaponNeed:40,kills:0,
        canHeal:false,healCost:20,healAmount:25,healUsesRemaining:2,reviveAvailable:false,reviveCost:30,reviveHp:50,reviveUsed:false,lasers:[],bossPartsMask:0,bossPart:'cannon',bossPartHp:100,bossPartMax:100,bossHp:100,bossMax:100,bossArmor:100,bossArmorMax:100,bossCoreHp:40,bossCoreMax:40,bossCoreTime:0,bossState:'armored',bossRevives:0,bossAttack:0,bossLane:0,bossX:0,bossZ:20,bossY:0,bossPhase:1,bossPattern:'heavy',bossAction:'strafe',deathProgress:0,travelDistance:0,travelGoal:100,
        engagement:false,frontline:2.6,score:100,targets:[],shots:[],enemyShots:[],pickups:[],effects:[]};
      }
      heal(){this.healCalls=(this.healCalls||0)+1;return this.s.canHeal;}revive(){this.reviveCalls=(this.reviveCalls||0)+1;if(!this.s.reviveAvailable)return false;this.s.phase='boss';this.s.commanderHp=50;this.s.army-=30;this.s.reviveAvailable=false;this.s.reviveUsed=true;return true;}declineRevive(){this.declineCalls=(this.declineCalls||0)+1;this.s.phase='lost';}pause(v){this.paused=v;}activate(){return false;}step(){this.steps++;}snapshot(){return {...this.s};}
    }`}));
}}]});

class Classes {
  values=new Set();add(...v){for(const x of v)this.values.add(x);}remove(...v){for(const x of v)this.values.delete(x);}
  toggle(v,b){if(b===undefined)b=!this.values.has(v);b?this.values.add(v):this.values.delete(v);}
}
class Element {
  hidden=false;textContent='';style={setProperty(k,v){this[k]=v;}};classList=new Classes();dataset={};listeners={};attributes={};offsetWidth=100;parentElement={classList:new Classes(),offsetWidth:100};
  addEventListener(k,f){this.listeners[k]=f;}setAttribute(k,v){this.attributes[k]=v;}click(){this.listeners.click?.({});}
  hasPointerCapture(){return false;}releasePointerCapture(){}setPointerCapture(){}getBoundingClientRect(){return{width:412};}
}
class Param {value=0;setTargetAtTime(v){this.value=v;}}
class AudioNode {gain=new Param();connect(n){return n;}disconnect(){}start(){}stop(){this.onended?.();}}
globalThis.AudioContext=class {
  sampleRate=22050;currentTime=10;state='running';destination=new AudioNode();async resume(){}async close(){}
  createGain(){return new AudioNode();}createBufferSource(){return new AudioNode();}
  createBuffer(c,len){const data=new Float32Array(len);return{getChannelData:()=>data};}
};
let session=0;
async function harness(savedText=null,unavailable=false){
  const elements=new Map(ids.map(id=>[id,new Element()]));
  const levels=[0,1,2,3,4].map(level=>Object.assign(new Element(),{dataset:{level:String(level)}}));
  const relics=[0,1,2].map(relic=>Object.assign(new Element(),{dataset:{relic:String(relic)}}));
  globalThis.document={getElementById:id=>elements.get(id),querySelectorAll:s=>s==='[data-level]'?levels:relics,body:{classList:new Classes()},addEventListener(){},hidden:false};
  globalThis.window={addEventListener(){},speechSynthesis:{getVoices:()=>[{lang:'en-US',localService:true}],addEventListener(){},removeEventListener(){},speak(s){s.onend?.();},cancel(){}}};
  globalThis.SpeechSynthesisUtterance=class{constructor(t){this.text=t;}};
  const store=new Map(savedText===null?[]:[['mechalord-iron-front-progress-v1',savedText]]);
  globalThis.localStorage={getItem:k=>{if(unavailable)throw Error('Storage disabled');return store.get(k)??null;},setItem:(k,v)=>{if(unavailable)throw Error('Quota exceeded');store.set(k,v);}};
  let nextFrame,now=performance.now();globalThis.requestAnimationFrame=f=>nextFrame=f;
  await import(pathToFileURL(output).href+'?test='+session++);await new Promise(setImmediate);
  const frame=()=>{now+=16;nextFrame(now);};
  const win=()=>{testCore.s.phase='won';testCore.s.kills=20;frame();};
  return {elements,levels,frame,win,saved:()=>JSON.parse(store.get('mechalord-iron-front-progress-v1'))};
}

const h=await harness(),{elements:e,frame,win,saved}=h;
assert.equal(e.get('start').disabled,false);
e.get('start').click();assert.equal(testCore.calls.at(-1).rank,0);win();assert.equal(saved().commanderXP,100);
frame();frame();assert.equal(saved().commanderXP,100,'Repeated result frames must not award again');
assert.equal(e.get('result-rank').textContent,'RANK UP! COMMANDER 2 · +100 XP');
e.get('next-level').click();assert.equal(testCore.calls.at(-1).level,1);assert.equal(testCore.calls.at(-1).rank,1);frame();
assert.equal(e.get('power-name').textContent,'HAND CANNONS');assert.equal(e.get('power-time').textContent,'FULL RUN');assert.equal(e.get('ability-name').textContent,'SHIELD');
win();assert.equal(saved().commanderXP,200);e.get('retry').click();win();assert.equal(saved().commanderXP,235);
e.get('next-level').click();win();assert.equal(saved().commanderXP,335);assert.match(e.get('result-unlock').textContent,/GUIDED MISSILES/);
e.get('retry').click();assert.equal(testCore.calls.at(-1).rank,2);frame();assert.equal(e.get('power-name').textContent,'GUIDED MISSILES');win();
for(let i=0;i<3;i++){e.get('retry').click();win();}assert.equal(saved().commanderXP,475);
e.get('retry').click();assert.equal(testCore.calls.at(-1).rank,3);assert.equal(testCore.s.army,14);frame();assert.equal(e.get('power-name').textContent,'RAIL BURST');
const steps=testCore.steps;e.get('pause').click();frame();assert.equal(testCore.steps,steps);assert.equal(e.get('paused').hidden,false);
e.get('resume').click();frame();assert.equal(testCore.steps,steps+1);
testCore.s.phase='destroying';frame();assert.equal(e.get('phase-label').textContent,'TYRANT DESTROYED');assert.equal(e.get('abilities').hidden,true);assert.equal(e.get('result').hidden,true);assert.equal(testCore.steps,steps+2);
testCore.s.phase='won';frame();assert.equal(e.get('result').hidden,false);assert.equal(saved().commanderXP,510);e.get('back').click();assert.equal(e.get('starter-troops').textContent,'14');assert.equal(saved().schema,3);
console.log('PASS: earned XP, exactly-once rewards, ranks 1–4, next-stage/retry carry, distinct power/relic HUD, pause and destruction transition.');

const upgradeUI=await harness();upgradeUI.elements.get('start').click();upgradeUI.frame();assert.equal(testWeaponResponses.length,0,'No scene upgrade confirmation on initial load');testCore.s.weapon=2;upgradeUI.frame();assert.deepEqual(testWeaponResponses,[[1,2]]);upgradeUI.frame();assert.equal(testWeaponResponses.length,1,'Observed tier only confirms once');upgradeUI.elements.get('pause').click();upgradeUI.frame();assert.equal(testWeaponResponses.length,1);upgradeUI.elements.get('resume').click();upgradeUI.frame();assert.equal(testWeaponResponses.length,1);testCore.s.weapon=3;testCore.s.effects=[{id:1001,kind:'pickup',value:2}];upgradeUI.frame();assert.equal(testWeaponResponses.length,1,'Pickup plus upgrade already has one scene response');testCore.s.effects=[];upgradeUI.frame();assert.equal(testWeaponResponses.length,1);upgradeUI.elements.get('back').click();upgradeUI.elements.get('start').click();upgradeUI.frame();assert.equal(testWeaponResponses.length,1,'Retry starts quietly');upgradeUI.elements.get('back').click();
console.log('PASS: real weapon-tier changes confirm once, quiet load/retry/pause, simultaneous pickup deduplicates scene response.');

const healthCase=await harness();healthCase.elements.get('start').click();testCore.s.army=1;testCore.s.commanderHp=57;healthCase.frame();
assert.equal(healthCase.elements.get('commander-health-value').textContent,'57/100');assert(Math.abs(parseFloat(healthCase.elements.get('commander-health-fill').style.width)-57)<.000001);assert.equal(healthCase.elements.get('abilities').hidden,false);
testCore.s.army=0;testCore.s.commanderHp=23;healthCase.frame();assert.equal(healthCase.elements.get('commander-health').attributes['aria-valuenow'],'23');assert(healthCase.elements.get('commander-health').classList.values.has('critical'));
testCore.s.phase='boss';testCore.s.bossHp=40;testCore.s.bossArmor=40;testCore.s.kills=19;healthCase.frame();assert.equal(healthCase.elements.get('route-fill').style.width,'40%');assert.equal(healthCase.elements.get('kills').textContent,'19');assert.equal(healthCase.elements.get('kill-label').textContent,'BREAK THE HAND CANNONS');assert(!ids.includes('boss-hud'),'Only the top mission health bar remains');
testCore.s.phase='lost';testCore.s.commanderHp=0;healthCase.frame();assert.equal(healthCase.elements.get('abilities').hidden,true);assert.equal(healthCase.elements.get('result').hidden,true);
const deadSteps=testCore.steps;for(let i=0;i<20;i++)healthCase.frame();assert.equal(testCore.steps,deadSteps,'No new core combat during cosmetic death');assert.equal(healthCase.elements.get('result').hidden,true);
for(let i=0;i<80;i++)healthCase.frame();assert.equal(healthCase.elements.get('result').hidden,false);assert.equal(healthCase.saved().commanderXP,0);healthCase.elements.get('back').click();
console.log('PASS: commander HP with no troops, critical health, one top boss health bar, delayed defeat and no combat/XP during death.');

const battleUI=await harness();battleUI.elements.get('start').click();
for(const [kind,label,symbol] of [['freeze','HOSTILES FROZEN','❄'],['slow','SLOW FIELD','◷'],['haste','HASTE · RISK','»']]){
  testCore.s.timePower=kind;testCore.s.timePowerTime=2.4;battleUI.frame();
  assert.equal(battleUI.elements.get('time-power').hidden,false);assert.equal(battleUI.elements.get('time-name').textContent,label);assert.equal(battleUI.elements.get('time-symbol').textContent,symbol);assert.equal(battleUI.elements.get('time-left').textContent,'2.4s');
}
testCore.s.timePower='none';testCore.s.timePowerTime=0;battleUI.frame();assert.equal(battleUI.elements.get('time-power').hidden,true);
testCore.s.army=25;testCore.s.commanderHp=92;testCore.s.effects=[{id:1,kind:'damage',value:8},{id:2,kind:'commanderHit',value:1}];battleUI.frame();assert.equal(battleUI.elements.get('army-loss').textContent,'−8');assert.equal(battleUI.elements.get('commander-health-value').textContent,'92/100');assert(battleUI.elements.get('commander-health').classList.values.has('health-hit'));
testCore.s.effects=[{id:3,kind:'pickup',value:6}];battleUI.frame();assert.match(battleUI.elements.get('toast').textContent,/HASTE · RISK/);assert(!battleUI.elements.get('gate-flash').classList.values.has('show-gate'),'Pickup does not cover the battlefield with a large banner');
testCore.s.phase='boss';testCore.s.bossState='exposed';testCore.s.bossCoreHp=20;testCore.s.bossCoreTime=4.2;battleUI.frame();assert.equal(battleUI.elements.get('route-fill').style.width,'50%');assert.equal(battleUI.elements.get('phase-label').textContent,'TYRANT · CORE');assert.equal(battleUI.elements.get('objective').textContent,'50% · 4.2s');
testCore.s.bossState='rebuilding';testCore.s.bossRevives=1;testCore.s.bossArmor=40;battleUI.frame();assert.equal(battleUI.elements.get('objective').textContent,'REBUILDING');assert.equal(battleUI.elements.get('phase-label').textContent,'TYRANT · REFORGED');
testCore.s.bossState='guarded';testCore.s.bossArmor=0;testCore.s.bossCoreHp=20;testCore.s.bossAction='strafe';testCore.s.bossPattern='heavy';battleUI.frame();
assert.equal(battleUI.elements.get('route-fill').style.width,'50%','Closing the reactor must not hide its remaining life or refill the health bar');
assert.equal(battleUI.elements.get('phase-label').textContent,'TYRANT · CORE');assert.equal(battleUI.elements.get('objective').textContent,'CORE GUARDED');
assert.match(battleUI.elements.get('kill-label').textContent,/CORE TO OPEN/);assert.doesNotMatch(battleUI.elements.get('kill-label').textContent,/REFORGED ARMOR/);
testCore.s.bossPart='cannon';testCore.s.bossRegions=[{id:'cannonL',x:1.7,hp:0,vulnerable:false},{id:'cannonR',x:-1.7,hp:100,vulnerable:true}];testCore.s.effects=[{id:101,kind:'bossPartBreak',value:1,hitRegion:'cannonL'}];battleUI.frame();assert.equal(battleUI.elements.get('toast').textContent,'RIGHT CANNON DESTROYED · AIM LEFT CANNON');
testCore.s.bossPart='leg';testCore.s.bossRegions=[{id:'legL',x:.77,hp:0,vulnerable:false},{id:'legR',x:-.77,hp:100,vulnerable:true}];testCore.s.effects=[{id:102,kind:'bossPartBreak',value:5,hitRegion:'legL'}];battleUI.frame();assert.equal(battleUI.elements.get('toast').textContent,'RIGHT LEG ARMOR DESTROYED · AIM LEFT LEG ARMOR');assert.doesNotMatch(battleUI.elements.get('toast').textContent,/VULNERABLE|CORE OPEN/);
testCore.s.bossPartsMask=63;testCore.s.guardHp=30;testCore.s.guardMax=60;testCore.s.bossArmor=30;testCore.s.bossArmorMax=60;testCore.s.bossState='armored';testCore.s.bossPart='reactor';testCore.s.effects=[];battleUI.frame();assert.equal(battleUI.elements.get('phase-label').textContent,'TYRANT · CORE SHIELD');assert.equal(battleUI.elements.get('kill-label').textContent,'BREAK THE REACTOR SHIELD');assert.equal(battleUI.elements.get('objective').textContent,'50% SHIELD');assert.equal(battleUI.elements.get('route-fill').style.width,'50%');testCore.s.guardHp=0;
testCore.s.effects=[{id:103,kind:'coreExpose'}];battleUI.frame();assert.match(battleUI.elements.get('toast').textContent,/CORE OPEN/);testCore.s.effects=[];testCore.s.bossRegions=undefined;
testCore.s.phase='run';testCore.s.targets=[{id:9,kind:'enemy',z:14,fireState:'tracking'}];battleUI.frame();assert.equal(battleUI.elements.get('objective').textContent,'CANNON CHARGING');
testCore.s.targets[0].fireState='locked';battleUI.frame();assert.equal(battleUI.elements.get('objective').textContent,'CANNON LOCKED');assert.match(battleUI.elements.get('combat-hint').textContent,/CHANGE LANE/);
testCore.s.targets[0].z=40;battleUI.frame();assert.notEqual(battleUI.elements.get('objective').textContent,'CANNON LOCKED','An offscreen gunner must not falsely replace visible encounter guidance');
battleUI.elements.get('pause-levels').click();battleUI.elements.get('start').click();battleUI.frame();assert.equal(battleUI.elements.get('army-loss').textContent,'');assert.equal(battleUI.elements.get('time-power').hidden,true);battleUI.elements.get('back').click();
console.log('PASS: independent time-power icons and expiry, permanent casualty feedback, commander damage with surviving troops, compact pickup toast, single armor/core/rebuild bar and retry cleanup.');

const transferUI=await harness();transferUI.elements.get('start').click();testCore.s.canHeal=true;testCore.s.army=70;testCore.s.commanderHp=60;transferUI.frame();
assert.equal(transferUI.elements.get('transfer').hidden,false);assert.equal(transferUI.elements.get('transfer-cost').textContent,'−20 · +25 HP');assert.match(transferUI.elements.get('transfer').attributes['aria-label'],/20 troops.*25 commander health/);transferUI.elements.get('transfer').click();assert.equal(testCore.healCalls,1);
testCore.s.canHeal=false;testCore.s.effects=[{id:10,kind:'heal',value:25}];testCore.s.commanderHp=85;transferUI.frame();assert.equal(transferUI.elements.get('transfer').hidden,true);assert.equal(transferUI.elements.get('commander-health-value').textContent,'85/100');
testCore.s.phase='lastStand';testCore.s.commanderHp=0;testCore.s.reviveAvailable=true;transferUI.frame();assert.equal(transferUI.elements.get('last-stand').hidden,false);assert.equal(transferUI.elements.get('abilities').hidden,true);assert.match(transferUI.elements.get('last-stand-copy').textContent,/30 troops.*50 commander HP/);const frozenSteps=testCore.steps;for(let i=0;i<20;i++)transferUI.frame();assert.equal(testCore.steps,frozenSteps,'No combat while deciding revival');assert.equal(testCore.reviveCalls,undefined,'No automatic troop spending');
transferUI.elements.get('revive').click();transferUI.frame();assert.equal(testCore.reviveCalls,1);assert.equal(transferUI.elements.get('last-stand').hidden,true);assert.equal(transferUI.elements.get('abilities').hidden,false);assert.equal(transferUI.elements.get('commander-health-value').textContent,'50/100');assert.equal(transferUI.saved().commanderXP,0);
testCore.s.phase='lastStand';testCore.s.reviveAvailable=true;transferUI.frame();transferUI.elements.get('accept-defeat').click();transferUI.elements.get('pause').click();transferUI.frame();assert.equal(transferUI.elements.get('paused').hidden,true,'Decline followed by pause must not trap terminal defeat');assert.equal(testCore.declineCalls,1);assert.equal(transferUI.elements.get('last-stand').hidden,true);assert.equal(transferUI.elements.get('result').hidden,true);for(let i=0;i<100;i++)transferUI.frame();assert.equal(transferUI.elements.get('result').hidden,false);transferUI.elements.get('retry').click();transferUI.frame();assert.equal(transferUI.elements.get('last-stand').hidden,true);assert.equal(transferUI.elements.get('transfer').hidden,true);transferUI.elements.get('back').click();
console.log('PASS: optional heal costs, explicit one-use revival choice, frozen decision time, no automatic spending, decline/destruction, retry reset and full-run starter weapon display.');



for(const value of ['{broken',JSON.stringify({schema:2,cleared:['true',false,0],best:['bad',null,-20],lastLevel:'2',commanderXP:'450'}),JSON.stringify({schema:2,commanderXP:-100,lastLevel:99})]){
  const x=await harness(value);x.elements.get('start').click();assert.equal(testCore.calls.at(-1).rank,0);assert.equal(testCore.s.army,8);x.elements.get('back').click();
}
const free=await harness();for(let i=0;i<5;i++){free.levels[i].click();free.elements.get('start').click();assert.equal(testCore.calls.at(-1).level,i,'All preview stages remain free without wins');free.elements.get('pause-levels').click();}
const missing=await harness(null,true);missing.elements.get('start').click();missing.win();missing.elements.get('next-level').click();assert.equal(testCore.calls.at(-1).rank,1,'Session progression survives unavailable storage');missing.elements.get('pause-levels').click();
const reload=await harness(JSON.stringify({schema:2,commanderXP:475,lastLevel:2,cleared:[true,true,true],best:[1,2,3]}));reload.elements.get('start').click();assert.deepEqual(testCore.calls.at(-1),{relic:0,level:2,rank:3});reload.elements.get('pause-levels').click();
for(const cleared of [[false,false,false],[true,false,false],[true,true,true]]){
  const legacy=await harness(JSON.stringify({schema:1,cleared,best:[90,110,130],lastLevel:1,gateHint:true}));
  assert.equal(legacy.saved().schema,3);assert.equal(legacy.saved().commanderXP,cleared.filter(Boolean).length*100);
  assert.deepEqual(legacy.saved().best,[90,110,130,0,0]);assert.equal(legacy.saved().gateHint,true);
  legacy.elements.get('start').click();assert.equal(testCore.calls.at(-1).rank,cleared[2]?2:cleared[0]?1:0);
  legacy.elements.get('pause-levels').click();
}
const intermediate=await harness(JSON.stringify({schema:2,commanderXP:0,cleared:[true,true,true],best:[90,110,130],lastLevel:2}));
assert.equal(intermediate.saved().commanderXP,300);assert.deepEqual(intermediate.saved().best,[90,110,130,0,0]);
intermediate.elements.get('start').click();assert.equal(testCore.calls.at(-1).rank,2);intermediate.elements.get('pause-levels').click();
const genuine=await harness(JSON.stringify({schema:2,commanderXP:35,cleared:[true,true,true],best:[90,110,130]}));
assert.equal(genuine.saved().commanderXP,35,'Existing nonzero schema-2 XP must not be replaced');
genuine.elements.get('start').click();assert.equal(testCore.calls.at(-1).rank,0);genuine.elements.get('pause-levels').click();
console.log('PASS: malformed storage, free stage selection, blocked-storage fallback, reload, schema-1 migration and intermediate zero-XP repair.');

const escortCase=await harness();escortCase.elements.get('start').click();testCore.s.weaponPower='escort';testCore.s.powerTime=10;testCore.s.escortShield=17;testCore.s.escortMax=30;escortCase.frame();assert.equal(escortCase.elements.get('power-name').textContent,'ESCORT GUARD');assert.equal(escortCase.elements.get('power-time').textContent,'17/30 · 10.0s');assert.equal(escortCase.elements.get('power-mode').textContent,'FINITE DEFENSE');escortCase.elements.get('pause-levels').click();console.log('PASS: finite escort budget is distinct from relic activation and weapon rank.');

const newChapters=await harness(JSON.stringify({schema:2,commanderXP:475,lastLevel:2,cleared:[true,true,true],best:[4935,5465,6016]}));
assert.deepEqual(newChapters.saved().best,[4935,5465,6016,0,0]);assert.deepEqual(newChapters.saved().cleared,[true,true,true,false,false]);assert.equal(newChapters.saved().commanderXP,475);
newChapters.levels[3].click();newChapters.elements.get('start').click();assert.equal(testCore.calls.at(-1).level,3);newChapters.win();assert.equal(newChapters.elements.get('next-level').hidden,false);newChapters.elements.get('next-level').click();assert.equal(testCore.calls.at(-1).level,4);newChapters.win();assert.equal(newChapters.elements.get('next-level').hidden,true);assert.equal(newChapters.saved().cleared.length,5);assert.equal(newChapters.saved().schema,3);newChapters.elements.get('back').click();
const reloadFive=await harness(JSON.stringify({schema:3,commanderXP:675,lastLevel:4,cleared:[true,true,true,true,true],best:[4935,5465,6016,7110,8500]}));reloadFive.elements.get('start').click();assert.equal(testCore.calls.at(-1).level,4);assert.equal(testCore.calls.at(-1).rank,3);assert.equal(reloadFive.saved().best[4],8500);reloadFive.elements.get('back').click();
console.log('PASS: five chapters, unchanged legacy scores/XP, additive save migration, chapter transitions and final-chapter completion.');

const specialCase=await harness(JSON.stringify({schema:3,commanderXP:475}));specialCase.elements.get('start').click();
for(const [kind,name]of [['tempest','TEMPEST LANCE'],['arcstorm','ARC STORM'],['salvo','SIEGE SALVO']]){
 testCore.s.combatPower=kind;testCore.s.combatPowerTime=.6;testCore.s.timePower='freeze';testCore.s.timePowerTime=2;specialCase.frame();
 assert.equal(specialCase.elements.get('combat-power').hidden,false);assert.equal(specialCase.elements.get('combat-power-name').textContent,name);assert.equal(specialCase.elements.get('combat-power-time').textContent,'0.6s');assert.equal(specialCase.elements.get('time-power').hidden,false);assert.equal(specialCase.elements.get('power-name').textContent,'RAIL BURST','New burst must not replace earned weapon');
}
testCore.s.combatPowerTime=0;specialCase.frame();assert.equal(specialCase.elements.get('combat-power').hidden,true);testCore.s.phase='boss';testCore.s.bossEvadeTell=.2;specialCase.frame();assert.equal(specialCase.elements.get('objective').textContent,'BOOSTERS CHARGING');testCore.s.bossEvadeTell=0;testCore.s.bossAction='evade';specialCase.frame();assert.equal(specialCase.elements.get('objective').textContent,'BOOSTER DODGE');testCore.s.bossAction='strafe';testCore.s.bossFiringWindow=1;specialCase.frame();assert.equal(specialCase.elements.get('objective').textContent,'BOOSTERS COOLING');specialCase.elements.get('pause-levels').click();assert.equal(specialCase.elements.get('combat-power').hidden,true);
console.log('PASS: separate burst/weapon/time-power readouts, truthful expiry and telegraph/dodge/recovery cues.');

await build({entryPoints:[path.join(here,'audio.ts')],bundle:true,format:'esm',platform:'node',outfile:path.join(root,'builds/audio-check.mjs')});
const {BattleAudio}=await import(pathToFileURL(path.join(root,'builds/audio-check.mjs')).href),audio=new BattleAudio();await audio.unlock();
assert.equal(audio.buffers.size,25);
const relicSamples=['shield','emp','overdrive'].map(k=>audio.buffers.get(k).getChannelData(0));
const specialSamples=['tempest','arcstorm','salvo'].map(k=>audio.buffers.get(k).getChannelData(0));
assert.equal(new Set(specialSamples.map(s=>s.length)).size,3,'Each finite power has its own sound duration');
for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)assert.notDeepEqual(specialSamples[i].slice(0,500),specialSamples[j].slice(0,500),'New power cues are distinct waveforms');
assert.equal(new Set(relicSamples.map(s=>s.length)).size,3,'Relic cues have distinct bounded lengths');
for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)assert.notDeepEqual(relicSamples[i].slice(0,100),relicSamples[j].slice(0,100),'Relic sounds must be audibly distinct waveforms');
for(const [,buffer]of audio.buffers){const values=buffer.getChannelData(0);assert(values.every(Number.isFinite));assert(values.some(value=>Math.abs(value)>.01));assert(values.every(value=>Math.abs(value)<=.96));}
assert(audio.speak('intro','The front is mine.',true));assert(!audio.speak('intro','The front is mine.',true));
for(let i=0;i<50;i++)audio.play('hit');assert.equal(audio.active.size,24);audio.silence();assert.equal(audio.active.size,0);
audio.setEnabled(false);audio.play('win');assert.equal(audio.active.size,0);audio.setEnabled(true);audio.reset();assert(audio.speak('intro','Again.',true));audio.dispose();assert.equal(audio.active.size,0);
console.log('PASS: 25 cached finite audible waveforms including distinct relic cues, bounded sources, local-voice deduplication, mute/reset/disposal.');
