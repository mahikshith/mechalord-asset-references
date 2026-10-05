import type {GameCore,Snapshot,Relic,Target,Shot,EnemyShot,Effect,Phase,BossAction,WeaponPower,Pickup} from './contract.ts';

const phases:Phase[]=['ready','run','boss','destroying','won','lost','lastStand'];
const targetKinds:Target['kind'][]=['enemy','crate','gate','hazard','orb'];
const effectKinds:Effect['kind'][]=['hit','kill','recruit','gate','damage','relic','bossShot','win','contact','block','bossDeath','missed','drop','pickup','pass','retreat','bossPhase','commanderHit','commanderDeath','hazardBreak','troopDeath','coreExpose','bossRevive','bossPartBreak','troopSacrifice','heal','revive','commanderDown','enemyFire','empPulse','empClear','empStun','shieldHit','escortBlock'];
const projectileKinds:EnemyShot['kind'][]=['shell','rocket','orb'];
const emitters:EnemyShot['emitter'][]=['gunner','armL','armR','shoulderL','shoulderR','core'];
const friendlyKinds:Shot['kind'][]=['pulse','arc','rail','missile','cannon'];
const bossActions:BossAction[]=['strafe','advance','retreat','windup','fire','dying'];
const powers:WeaponPower[]=['none','guided','cannons','railburst','escort'];
const pickupPowers:Pickup['kind'][]=['guided','cannons','railburst','freeze','slow','haste','escort'];
const times:Snapshot['timePower'][]=['none','freeze','slow','haste'];
const bossStates:Snapshot['bossState'][]=['armored','exposed','rebuilding','destroying','guarded'];

export class AssaultCore implements GameCore {
  api:any;
  async load():Promise<void>{
    const response=await fetch('assault.wasm', {cache:'no-store'});
    if(!response.ok)throw new Error('Combat core could not be loaded.');
    const module=await WebAssembly.compile(await response.arrayBuffer());
    const imports:any={};
    for(const entry of WebAssembly.Module.imports(module)){
      if(entry.kind!=='function')throw new Error('Unsupported core import: '+entry.name);
      imports[entry.module]??={};
      imports[entry.module][entry.name]=(...args:number[])=>{
        if(entry.name==='proc_exit')throw new Error('Combat core exited: '+args[0]);
        return 0;
      };
    }
    const instance=await WebAssembly.instantiate(module,imports);
    this.api=instance.exports;
    this.api._initialize?.();
  }
  start(relic:Relic,level=0,rank=0):void{this.api.start_run(relic,level,rank);}
  step(dt:number,x:number):void{this.api.step(dt,x);}
  activate():boolean{return Boolean(this.api.use_relic());}
  heal():boolean{return Boolean(this.api.heal());}
  revive():boolean{return Boolean(this.api.revive());}
  declineRevive():boolean{return Boolean(this.api.decline_revive());}
  pause(value:boolean):void{this.api.set_paused(value?1:0);}
  private read(name:string,count:number):Float32Array{return new Float32Array(this.api.memory.buffer,this.api[name](),count);}
  snapshot():Snapshot{
    const s=this.read('state',75).slice();
    const formation:Snapshot['formation']=[],fs=this.read('formation',this.api.formation_count()*3);
    for(let i=0;i<fs.length;i+=3)formation.push({index:fs[i],x:fs[i+1],z:fs[i+2]});
    const targets:Target[]=[],shots:Shot[]=[],enemyShots:EnemyShot[]=[],effects:Effect[]=[];
    const pickups:Pickup[]=[],ps=this.read('pickups',this.api.pickup_count()*6);
    for(let i=0;i<ps.length;i+=6)pickups.push({id:ps[i],kind:pickupPowers[ps[i+1]-1],x:ps[i+2],z:ps[i+3],radius:ps[i+4],choiceGroup:ps[i+5]});
    const ts=this.read('targets',this.api.target_count()*19);
    for(let i=0;i<ts.length;i+=19)targets.push({id:ts[i],kind:targetKinds[ts[i+1]],x:ts[i+2],z:ts[i+3],hp:ts[i+4],maxHp:ts[i+5],value:ts[i+6],op:ts[i+7],size:ts[i+8],hit:ts[i+9],variant:ts[i+10],depth:ts[i+11],fireState:['idle','tracking','locked','fire','reload'][ts[i+12]] as Target['fireState'],aimX:ts[i+13],charge:ts[i+14],role:(ts[i+15]?['grunt','gunner','battery','carrier'][ts[i+15]]:ts[i+10]>0?'elite':'grunt') as Target['role'],guidedArmor:s[18]===0&&(ts[i+15]===1||ts[i+15]===2)&&(ts[i+12]===1||ts[i+12]===2),stunTime:ts[i+16],ventOpen:Boolean(ts[i+17]),ventTime:ts[i+18]});
    const ss=this.read('shots',this.api.shot_count()*7);
    for(let i=0;i<ss.length;i+=7)shots.push({x:ss[i],z:ss[i+1],dx:ss[i+2],dz:ss[i+3],heavy:Boolean(ss[i+4]),kind:friendlyKinds[ss[i+5]],owner:ss[i+6]?'troop':'commander'});
    const hostile=this.read('enemy_shots',this.api.enemy_shot_count()*13);
    for(let i=0;i<hostile.length;i+=13)enemyShots.push({id:hostile[i],x:hostile[i+1],z:hostile[i+2],dx:hostile[i+3],dz:hostile[i+4],radius:hostile[i+5],kind:projectileKinds[hostile[i+6]],guided:hostile[i+7]>0,homingTime:hostile[i+7],sourceId:hostile[i+8],emitter:emitters[hostile[i+9]],launchX:hostile[i+10],launchZ:hostile[i+11],launchY:hostile[i+12]});
    const lasers:Snapshot['lasers']=[],ls=this.read('lasers',this.api.laser_count()*7);
    for(let i=0;i<ls.length;i+=7)lasers.push({id:ls[i],x:ls[i+1],z:ls[i+2],endX:ls[i+3],endZ:ls[i+4],width:ls[i+5],time:ls[i+6]});
    const count=this.api.effect_count();
    const es=this.read('drain_effects',count*8);
    for(let i=0;i<es.length;i+=8)effects.push({id:es[i],kind:effectKinds[es[i+1]],x:es[i+2],z:es[i+3],value:es[i+4],entityId:es[i+5],variant:es[i+6],size:es[i+7]});
    const bytes=new Uint8Array(this.api.memory.buffer),begin=this.api.level_name();let end=begin;
    while(end<bytes.length&&bytes[end]!==0)++end;
    const levelName=new TextDecoder().decode(bytes.subarray(begin,end));
    return {phase:phases[s[0]],time:s[1],duration:s[2],level:s[18],levelName,rank:s[30],rankReward:s[31],weaponPower:powers[s[32]],starterWeapon:powers[s[49]],weaponPermanent:Boolean(s[50]),powerTime:s[33],timePower:times[s[40]],timePowerTime:s[41],x:s[3],army:s[4],commanderHp:s[38],commanderMaxHp:s[39],canHeal:Boolean(s[51]),healCost:s[59],healAmount:s[60],healUsesRemaining:s[52],reviveUsed:Boolean(s[53]),reviveAvailable:Boolean(s[54]),reviveCost:s[61],reviveHp:s[62],reviveProtection:s[63],empPulseTime:s[64],empStunTime:s[65],escortShield:s[66],escortMax:s[67],safetyAdmitted:s[68],safetyDeferred:s[69],safetyUnsupported:s[70],safetyExistingUnsafe:s[71],safetyCapacity:s[72],safetyAuthoredRockets:s[73],safetyHorizon:s[74],energy:s[5],ability:s[6],relic:s[7] as Relic,weapon:s[8],weaponXP:s[19],weaponNeed:s[20],kills:s[9],bossHp:s[10],bossMax:s[11],bossArmor:s[42],bossArmorMax:s[43],bossCoreHp:s[44],bossCoreMax:s[45],bossCoreTime:s[46],bossState:bossStates[s[47]],bossRevives:s[48],bossAttack:s[12],bossLane:s[13],bossX:s[22],bossZ:s[23],bossY:s[34],bossPhase:s[35] as 1|2,bossPattern:['heavy','sweep','rockets','laser'][s[36]] as Snapshot['bossPattern'],bossPartsMask:s[55],bossPart:['cannon','jetpack','leg','reactor'][s[56]] as Snapshot['bossPart'],bossPartHp:s[57],bossPartMax:s[58],bossAction:bossActions[s[24]],deathProgress:s[25],travelDistance:s[26],travelGoal:s[27],engagement:Boolean(s[28]),frontline:s[29],score:s[14],formation,targets,shots,enemyShots,lasers,pickups,effects};
  }
}
