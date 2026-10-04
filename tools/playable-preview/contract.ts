export type Phase='ready'|'run'|'boss'|'destroying'|'won'|'lost';
export type Relic=0|1|2;
export type WeaponPower='none'|'guided'|'cannons'|'railburst';
export type TimePower='none'|'freeze'|'slow'|'haste';
export type PickupPower=Exclude<WeaponPower|'freeze'|'slow'|'haste','none'>;
export type BossState='armored'|'exposed'|'rebuilding'|'destroying';
export interface Pickup {id:number;kind:PickupPower;x:number;z:number;radius:number;}
export interface Target {id:number;kind:'enemy'|'crate'|'gate'|'hazard'|'orb';x:number;z:number;hp:number;maxHp:number;value:number;op:number;size:number;hit:number;variant:number;}
export interface Shot {x:number;z:number;dx:number;dz:number;heavy:boolean;kind:'pulse'|'arc'|'rail'|'missile'|'cannon';owner:'commander'|'troop';}
export interface EnemyShot {id:number;x:number;z:number;dx:number;dz:number;radius:number;kind:'shell'|'rocket'|'orb';}
export interface Effect {id:number;kind:'hit'|'kill'|'recruit'|'gate'|'damage'|'relic'|'bossShot'|'win'|'contact'|'block'|'bossDeath'|'missed'|'drop'|'pickup'|'pass'|'retreat'|'bossPhase'|'commanderHit'|'commanderDeath'|'hazardBreak'|'troopDeath'|'coreExpose'|'bossRevive';x:number;z:number;value:number;entityId:number;variant:number;size:number;}
export type BossAction='strafe'|'advance'|'retreat'|'windup'|'fire'|'dying';
export interface FormationUnit {index:number;x:number;z:number;}
export interface Snapshot {phase:Phase;time:number;duration:number;level:number;levelName:string;rank:number;rankReward:number;weaponPower:WeaponPower;powerTime:number;timePower:TimePower;timePowerTime:number;x:number;army:number;commanderHp:number;commanderMaxHp:number;energy:number;ability:number;relic:Relic;weapon:number;weaponXP:number;weaponNeed:number;kills:number;bossHp:number;bossMax:number;bossArmor:number;bossArmorMax:number;bossCoreHp:number;bossCoreMax:number;bossCoreTime:number;bossState:BossState;bossRevives:number;bossAttack:number;bossLane:number;bossX:number;bossZ:number;bossY:number;bossPhase:1|2;bossPattern:'heavy'|'sweep'|'rockets';bossAction:BossAction;deathProgress:number;travelDistance:number;travelGoal:number;engagement:boolean;frontline:number;score:number;formation:FormationUnit[];targets:Target[];shots:Shot[];enemyShots:EnemyShot[];pickups:Pickup[];effects:Effect[];}
export interface GameCore {load():Promise<void>;start(relic:Relic,level?:number,rank?:number):void;step(dt:number,x:number):void;activate():boolean;pause(value:boolean):void;snapshot():Snapshot;}
