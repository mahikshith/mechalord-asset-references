import type {GameCore,Snapshot,Relic,Target,Shot,EnemyShot,Effect,Phase,BossAction} from './contract.ts';

const phases:Phase[]=['ready','run','boss','destroying','won','lost'];
const targetKinds:Target['kind'][]=['enemy','crate','gate','hazard'];
const effectKinds:Effect['kind'][]=['hit','kill','recruit','gate','damage','relic','bossShot','win','contact','block','bossDeath','missed'];
const projectileKinds:EnemyShot['kind'][]=['shell','rocket','orb'];
const friendlyKinds:Shot['kind'][]=['pulse','arc','rail'];
const bossActions:BossAction[]=['strafe','advance','retreat','windup','fire','dying'];

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
  start(relic:Relic,level=0):void{this.api.start_run(relic,level);}
  step(dt:number,x:number):void{this.api.step(dt,x);}
  activate():boolean{return Boolean(this.api.use_relic());}
  pause(value:boolean):void{this.api.set_paused(value?1:0);}
  private read(name:string,count:number):Float32Array{return new Float32Array(this.api.memory.buffer,this.api[name](),count);}
  snapshot():Snapshot{
    const s=this.read('state',30).slice();
    const targets:Target[]=[],shots:Shot[]=[],enemyShots:EnemyShot[]=[],effects:Effect[]=[];
    const ts=this.read('targets',this.api.target_count()*11);
    for(let i=0;i<ts.length;i+=11)targets.push({id:ts[i],kind:targetKinds[ts[i+1]],x:ts[i+2],z:ts[i+3],hp:ts[i+4],maxHp:ts[i+5],value:ts[i+6],op:ts[i+7],size:ts[i+8],hit:ts[i+9],variant:ts[i+10]});
    const ss=this.read('shots',this.api.shot_count()*6);
    for(let i=0;i<ss.length;i+=6)shots.push({x:ss[i],z:ss[i+1],dx:ss[i+2],dz:ss[i+3],heavy:Boolean(ss[i+4]),kind:friendlyKinds[ss[i+5]]});
    const hostile=this.read('enemy_shots',this.api.enemy_shot_count()*8);
    for(let i=0;i<hostile.length;i+=8)enemyShots.push({id:hostile[i],x:hostile[i+1],z:hostile[i+2],dx:hostile[i+3],dz:hostile[i+4],radius:hostile[i+5],kind:projectileKinds[hostile[i+6]]});
    const count=this.api.effect_count();
    const es=this.read('drain_effects',count*8);
    for(let i=0;i<es.length;i+=8)effects.push({id:es[i],kind:effectKinds[es[i+1]],x:es[i+2],z:es[i+3],value:es[i+4],entityId:es[i+5],variant:es[i+6],size:es[i+7]});
    const bytes=new Uint8Array(this.api.memory.buffer),begin=this.api.level_name();let end=begin;
    while(end<bytes.length&&bytes[end]!==0)++end;
    const levelName=new TextDecoder().decode(bytes.subarray(begin,end));
    return {phase:phases[s[0]],time:s[1],duration:s[2],level:s[18],levelName,x:s[3],army:s[4],energy:s[5],ability:s[6],relic:s[7] as Relic,weapon:s[8],weaponXP:s[19],weaponNeed:s[20],kills:s[9],bossHp:s[10],bossMax:s[11],bossAttack:s[12],bossLane:s[13],bossX:s[22],bossZ:s[23],bossAction:bossActions[s[24]],deathProgress:s[25],travelDistance:s[26],travelGoal:s[27],engagement:Boolean(s[28]),frontline:s[29],score:s[14],targets,shots,enemyShots,effects};
  }
}
