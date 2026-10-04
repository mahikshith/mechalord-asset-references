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
    'export class Battlefield{async load(){}reset(){}trigger(){}update(){}}':`
    export class AssaultCore {
      constructor(){globalThis.testCore=this;this.steps=0;this.calls=[];}async load(){}
      start(relic,level=0,rank=0){
        this.calls.push({relic,level,rank});this.s={phase:'run',time:0,duration:40,level,levelName:['Relic Causeway','Roller Foundry','Citadel Breach'][level],rank,rankReward:1,
        weaponPower:rank===3?'railburst':rank===2?'guided':rank===1?'cannons':'none',powerTime:rank?6:0,x:0,army:8+rank*2,commanderHp:100+rank*5,commanderMaxHp:100+rank*5,energy:30,ability:0,relic,weapon:1,weaponXP:0,weaponNeed:40,kills:0,
        bossHp:100,bossMax:100,bossAttack:0,bossLane:0,bossX:0,bossZ:20,bossY:0,bossPhase:1,bossPattern:'heavy',bossAction:'strafe',deathProgress:0,travelDistance:0,travelGoal:100,
        engagement:false,frontline:2.6,score:100,targets:[],shots:[],enemyShots:[],pickups:[],effects:[]};
      }
      pause(v){this.paused=v;}activate(){return false;}step(){this.steps++;}snapshot(){return {...this.s};}
    }`}));
}}]});

class Classes {
  values=new Set();add(...v){for(const x of v)this.values.add(x);}remove(...v){for(const x of v)this.values.delete(x);}
  toggle(v,b){if(b===undefined)b=!this.values.has(v);b?this.values.add(v):this.values.delete(v);}
}
class Element {
  hidden=false;textContent='';style={};classList=new Classes();dataset={};listeners={};attributes={};offsetWidth=100;parentElement={classList:new Classes(),offsetWidth:100};
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
  const levels=[0,1,2].map(level=>Object.assign(new Element(),{dataset:{level:String(level)}}));
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
assert.equal(e.get('power-name').textContent,'HAND CANNONS');assert.equal(e.get('power-time').textContent,'6.0s');assert.equal(e.get('ability-name').textContent,'SHIELD');
win();assert.equal(saved().commanderXP,200);e.get('retry').click();win();assert.equal(saved().commanderXP,235);
e.get('next-level').click();win();assert.equal(saved().commanderXP,335);assert.match(e.get('result-unlock').textContent,/GUIDED MISSILES/);
e.get('retry').click();assert.equal(testCore.calls.at(-1).rank,2);frame();assert.equal(e.get('power-name').textContent,'GUIDED MISSILES');win();
for(let i=0;i<3;i++){e.get('retry').click();win();}assert.equal(saved().commanderXP,475);
e.get('retry').click();assert.equal(testCore.calls.at(-1).rank,3);assert.equal(testCore.s.army,14);frame();assert.equal(e.get('power-name').textContent,'RAIL BURST');
const steps=testCore.steps;e.get('pause').click();frame();assert.equal(testCore.steps,steps);assert.equal(e.get('paused').hidden,false);
e.get('resume').click();frame();assert.equal(testCore.steps,steps+1);
testCore.s.phase='destroying';frame();assert.equal(e.get('phase-label').textContent,'TYRANT DESTROYED');assert.equal(e.get('abilities').hidden,true);assert.equal(e.get('result').hidden,true);assert.equal(testCore.steps,steps+2);
testCore.s.phase='won';frame();assert.equal(e.get('result').hidden,false);assert.equal(saved().commanderXP,510);e.get('back').click();assert.equal(e.get('starter-troops').textContent,'14');assert.equal(saved().schema,2);
console.log('PASS: earned XP, exactly-once rewards, ranks 1–4, next-stage/retry carry, distinct power/relic HUD, pause and destruction transition.');

const healthCase=await harness();healthCase.elements.get('start').click();testCore.s.army=1;testCore.s.commanderHp=57;healthCase.frame();
assert.equal(healthCase.elements.get('commander-health-value').textContent,'57/100');assert(Math.abs(parseFloat(healthCase.elements.get('commander-health-fill').style.width)-57)<.000001);assert.equal(healthCase.elements.get('abilities').hidden,false);
testCore.s.army=0;testCore.s.commanderHp=23;healthCase.frame();assert.equal(healthCase.elements.get('commander-health').attributes['aria-valuenow'],'23');assert(healthCase.elements.get('commander-health').classList.values.has('critical'));
testCore.s.phase='boss';testCore.s.bossHp=40;testCore.s.kills=19;healthCase.frame();assert.equal(healthCase.elements.get('route-fill').style.width,'40%');assert.equal(healthCase.elements.get('kills').textContent,'19');assert.equal(healthCase.elements.get('kill-label').textContent,'ELIMINATED');assert(!ids.includes('boss-hud'),'Only the top mission health bar remains');
testCore.s.phase='lost';testCore.s.commanderHp=0;healthCase.frame();assert.equal(healthCase.elements.get('abilities').hidden,true);assert.equal(healthCase.elements.get('result').hidden,true);
const deadSteps=testCore.steps;for(let i=0;i<20;i++)healthCase.frame();assert.equal(testCore.steps,deadSteps,'No new core combat during cosmetic death');assert.equal(healthCase.elements.get('result').hidden,true);
for(let i=0;i<80;i++)healthCase.frame();assert.equal(healthCase.elements.get('result').hidden,false);assert.equal(healthCase.saved().commanderXP,0);healthCase.elements.get('back').click();
console.log('PASS: commander HP with no troops, critical health, one top boss health bar, delayed defeat and no combat/XP during death.');

for(const value of ['{broken',JSON.stringify({schema:2,cleared:['true',false,0],best:['bad',null,-20],lastLevel:'2',commanderXP:'450'}),JSON.stringify({schema:2,commanderXP:-100,lastLevel:99})]){
  const x=await harness(value);x.elements.get('start').click();assert.equal(testCore.calls.at(-1).rank,0);assert.equal(testCore.s.army,8);x.elements.get('back').click();
}
const free=await harness();for(let i=0;i<3;i++){free.levels[i].click();free.elements.get('start').click();assert.equal(testCore.calls.at(-1).level,i,'All preview stages remain free without wins');free.elements.get('pause-levels').click();}
const missing=await harness(null,true);missing.elements.get('start').click();missing.win();missing.elements.get('next-level').click();assert.equal(testCore.calls.at(-1).rank,1,'Session progression survives unavailable storage');missing.elements.get('pause-levels').click();
const reload=await harness(JSON.stringify({schema:2,commanderXP:475,lastLevel:2,cleared:[true,true,true],best:[1,2,3]}));reload.elements.get('start').click();assert.deepEqual(testCore.calls.at(-1),{relic:0,level:2,rank:3});reload.elements.get('pause-levels').click();
for(const cleared of [[false,false,false],[true,false,false],[true,true,true]]){
  const legacy=await harness(JSON.stringify({schema:1,cleared,best:[90,110,130],lastLevel:1,gateHint:true}));
  assert.equal(legacy.saved().schema,2);assert.equal(legacy.saved().commanderXP,cleared.filter(Boolean).length*100);
  assert.deepEqual(legacy.saved().best,[90,110,130]);assert.equal(legacy.saved().gateHint,true);
  legacy.elements.get('start').click();assert.equal(testCore.calls.at(-1).rank,cleared[2]?2:cleared[0]?1:0);
  legacy.elements.get('pause-levels').click();
}
const intermediate=await harness(JSON.stringify({schema:2,commanderXP:0,cleared:[true,true,true],best:[90,110,130],lastLevel:2}));
assert.equal(intermediate.saved().commanderXP,300);assert.deepEqual(intermediate.saved().best,[90,110,130]);
intermediate.elements.get('start').click();assert.equal(testCore.calls.at(-1).rank,2);intermediate.elements.get('pause-levels').click();
const genuine=await harness(JSON.stringify({schema:2,commanderXP:35,cleared:[true,true,true],best:[90,110,130]}));
assert.equal(genuine.saved().commanderXP,35,'Existing nonzero schema-2 XP must not be replaced');
genuine.elements.get('start').click();assert.equal(testCore.calls.at(-1).rank,0);genuine.elements.get('pause-levels').click();
console.log('PASS: malformed storage, free stage selection, blocked-storage fallback, reload, schema-1 migration and intermediate zero-XP repair.');

await build({entryPoints:[path.join(here,'audio.ts')],bundle:true,format:'esm',platform:'node',outfile:path.join(root,'builds/audio-check.mjs')});
const {BattleAudio}=await import(pathToFileURL(path.join(root,'builds/audio-check.mjs')).href),audio=new BattleAudio();await audio.unlock();
assert.equal(audio.buffers.size,17);
for(const [,buffer]of audio.buffers){const values=buffer.getChannelData(0);assert(values.every(Number.isFinite));assert(values.some(value=>Math.abs(value)>.01));assert(values.every(value=>Math.abs(value)<=.96));}
assert(audio.speak('intro','The front is mine.',true));assert(!audio.speak('intro','The front is mine.',true));
for(let i=0;i<50;i++)audio.play('hit');assert.equal(audio.active.size,24);audio.silence();assert.equal(audio.active.size,0);
audio.setEnabled(false);audio.play('win');assert.equal(audio.active.size,0);audio.setEnabled(true);audio.reset();assert(audio.speak('intro','Again.',true));audio.dispose();assert.equal(audio.active.size,0);
console.log('PASS: 17 cached finite audible waveforms, bounded sources, local-voice deduplication, mute/reset/disposal.');
