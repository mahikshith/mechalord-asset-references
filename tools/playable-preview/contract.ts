export type Phase='ready'|'run'|'boss'|'destroying'|'won'|'lost';
export type Relic=0|1|2;
export interface Target {id:number;kind:'enemy'|'crate'|'gate'|'hazard';x:number;z:number;hp:number;maxHp:number;value:number;op:number;size:number;hit:number;variant:number;}
export interface Shot {x:number;z:number;dx:number;dz:number;heavy:boolean;kind:'pulse'|'arc'|'rail';}
export interface EnemyShot {id:number;x:number;z:number;dx:number;dz:number;radius:number;kind:'shell'|'rocket'|'orb';}
export interface Effect {id:number;kind:'hit'|'kill'|'recruit'|'gate'|'damage'|'relic'|'bossShot'|'win'|'contact'|'block'|'bossDeath'|'missed';x:number;z:number;value:number;entityId:number;variant:number;size:number;}
export type BossAction='strafe'|'advance'|'retreat'|'windup'|'fire'|'dying';
export interface Snapshot {phase:Phase;time:number;duration:number;level:number;levelName:string;x:number;army:number;energy:number;ability:number;relic:Relic;weapon:number;weaponXP:number;weaponNeed:number;kills:number;bossHp:number;bossMax:number;bossAttack:number;bossLane:number;bossX:number;bossZ:number;bossAction:BossAction;deathProgress:number;travelDistance:number;travelGoal:number;engagement:boolean;frontline:number;score:number;targets:Target[];shots:Shot[];enemyShots:EnemyShot[];effects:Effect[];}
export interface GameCore {load():Promise<void>;start(relic:Relic,level?:number):void;step(dt:number,x:number):void;activate():boolean;pause(value:boolean):void;snapshot():Snapshot;}
