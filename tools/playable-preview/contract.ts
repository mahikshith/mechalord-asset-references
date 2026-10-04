export type Phase='ready'|'run'|'boss'|'won'|'lost';
export type Relic=0|1|2;
export interface Target {id:number;kind:'enemy'|'crate'|'gate'|'hazard';x:number;z:number;hp:number;maxHp:number;value:number;op:number;size:number;hit:number;}
export interface Shot {x:number;z:number;heavy:boolean;}
export interface Effect {id:number;kind:'hit'|'kill'|'recruit'|'gate'|'damage'|'relic'|'bossShot'|'win';x:number;z:number;value:number;}
export interface Snapshot {phase:Phase;time:number;duration:number;x:number;army:number;energy:number;ability:number;relic:Relic;weapon:number;kills:number;bossHp:number;bossMax:number;bossAttack:number;bossLane:number;score:number;targets:Target[];shots:Shot[];effects:Effect[];}
export interface GameCore {load():Promise<void>;start(relic:Relic):void;step(dt:number,x:number):void;activate():boolean;pause(value:boolean):void;snapshot():Snapshot;}
