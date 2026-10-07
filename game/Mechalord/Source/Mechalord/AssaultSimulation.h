#pragma once
#include <array>
#include <algorithm>
#include <cmath>
#include <cstdint>
#include "FormationSafety.h"
#include "BossPose.h"

// Portable browser playtest. The legacy Unreal adapter still uses BattleSimulation.
namespace mech::assault
{
enum class Phase { Ready, Run, Boss, Destroying, Won, Lost, LastStand, Reward, Reviving };
enum class Kind { Enemy, Crate, Gate, Hazard, Orb };
enum class Relic { Shield, EMP, StormBattery, Overdrive=StormBattery };
enum class EffectKind { Hit, Kill, Recruit, Gate, Damage, Relic, BossShot, Win, Contact, Block, BossDeath, Missed, Drop, Pickup, Pass, Retreat, BossPhase, CommanderHit, CommanderDeath, HazardBreak, TroopDeath, CoreExpose, BossRevive, BossPartBreak, TroopSacrifice, Heal, Revive, CommanderDown, EnemyFire, EmpPulse, EmpClear, EmpStun, ShieldHit, EscortBlock, CombatPower, ChainHit, ShieldBreak, HealthPickup, RewardChosen, ClashStart, ClashWin, ClashLose, EnemySupport, ActStart };
enum class ProjectileKind { Shell, Rocket, Orb };
enum class WeaponEmitter { Gunner, ArmL, ArmR, ShoulderL, ShoulderR, Core };
enum class FriendlyKind { Pulse, Arc, Rail, Missile, Cannon, Salvo };
enum class WeaponPower { None, Guided, Cannons, Railburst, Escort };
enum class CombatPower { None, Tempest, ArcStorm, Salvo };
enum class TimePower { None, Freeze, Slow, Haste };
enum class PickupKind { Guided=1, Cannons, Railburst, Freeze, Slow, Haste, Escort, Tempest, ArcStorm, Salvo, Health };
enum class BossState { Armored, Exposed, Rebuilding, Destroying, Guarded };
enum class BossPattern { Heavy, Sweep, Rockets, Laser };
enum class BossAction { Strafe, Advance, Retreat, Windup, Fire, Dying, Evade };
enum class FireState { Idle, Tracking, Locked, Fire, Reload };
struct Target
{
    int id=0; Kind kind=Kind::Enemy;
    double x=0,z=0,hp=0,maxHp=0,size=.3,hit=0;
    int value=0,op=0,variant=0; bool active=false;
    double originX=0,motion=0,motionRate=1,fireClock=0,motionPhase=0,depth=.3;
    FireState fireState=FireState::Idle; double aimX=0,charge=0,fireDelay=0; int role=0,burst=0,dropPower=0,dropAlternate=0;
    double stunTime=0,ventClock=0,ventTime=0; bool ventOpen=false;
    int archetype=0,shieldHp=0,shieldMax=0,skillState=0; double blockFlash=0,skillClock=0;
};
struct Shot
{
    double x=0,z=0,dx=0,dz=32,damage=1;
    bool heavy=false,active=false; FriendlyKind kind=FriendlyKind::Pulse;
    int pierce=1,lastHit=0; bool troop=false;
    int id=0; double y=0,dy=0,life=0; int aimRegion=7,epoch=0; bool spatial=false;
    bool battery=false; int targetId=0;
};
struct EnemyShot
{
    int id=0; double x=0,z=0,dx=0,dz=0,radius=.3; int damage=0;
    ProjectileKind kind=ProjectileKind::Shell; bool active=false,boss=false; double homing=0; int sourceId=0;
    WeaponEmitter emitter=WeaponEmitter::Gunner; double launchX=0,launchZ=0,launchY=1.65;
};
struct Laser {
    int id=0; double x=0,z=0,endX=0,endZ=-5,width=.36,time=0,tick=0; bool active=false; double y=4.3,endY=.22;
    // Only the visible endpoint is exported. Preserve the actual unoccluded ray
    // internally so moving/expiring cover restores it without growing the beam.
    double unoccludedEndX=0,unoccludedEndY=0,unoccludedEndZ=0; bool shieldClipped=false;
};
struct FriendlyBeam { int id=0; double x=0,y=1.42,z=1.32,endX=0,endY=1.42,endZ=40,width=.28,time=0; };
struct Clash { bool active=false; double progress=.5,time=0,x=0,y=0,z=0,heroX=0,heroY=1.42,heroZ=1.32,enemyX=0,enemyY=0,enemyZ=0; int result=0,laserId=0; };
struct Pickup { int id=0; PickupKind kind=PickupKind::Guided; double x=0,z=0,radius=1.05; bool active=false; int choiceGroup=0,bonusTroops=0; };
struct Effect
{
    int id=0; EffectKind kind=EffectKind::Hit; double x=0,z=0; int value=0,entityId=0,variant=0; double size=.3;
    double y=0; int hitRegion=-1; bool spatial=false; double endX=0,endY=0,endZ=0; bool endpoint=false;
};
class Battle
{
public:
    static constexpr int MaxTargets=256,MaxShots=256,MaxEnemyShots=96,MaxEffects=192,MaxPickups=24;
    static constexpr double Frontline=2.6;
    Phase phase=Phase::Ready; Relic relic=Relic::Shield; BossAction bossAction=BossAction::Strafe;
    bool campaign=false; int actIndex=0,laserCharges=0; double reviveCinematicTime=0;
    std::array<double,3> relicEnergy{{55,55,55}},relicTime{};
    int rewardLaser=0,rewardVitality=0,rewardEndurance=0; Clash clash{};
    CombatPower combatPower=CombatPower::None; double combatPowerTime=0,bossEvadeTime=0,bossEvadeTell=0,bossFiringWindow=0; FriendlyBeam friendlyBeam{};
    TimePower timePower=TimePower::None; BossState bossState=BossState::Armored;
    WeaponPower starterWeapon=WeaponPower::None;
    WeaponPower weaponPower=WeaponPower::None; BossPattern bossPattern=BossPattern::Heavy;
    double time=0,duration=0,x=0,energy=55,ability=0,bossHp=0,bossMax=2200,bossAttack=0,bossLane=0;
    double timePowerTime=0,bossArmor=0,bossArmorMax=1250,bossCoreHp=450,bossCoreMax=450,bossCoreTime=0;
    int bossRevives=0,bossPartsMask=0;
    int healUsesRemaining=2; bool reviveUsed=false; double reviveProtection=0;
    double commanderHp=100,commanderMaxHp=100;
    double empPulseTime=0,empStunTime=0; int escortShield=0;
    double bossX=0,bossZ=40,bossY=.8,powerTime=0,deathProgress=0,travelDistance=0,travelGoal=203.5;
    int level=0,army=8,weapon=1,weaponXP=0,weaponNeed=40,kills=0,score=0,effectCount=0;
    int rank=0,rankReward=0,bossPhase=1;
    bool paused=false,engagement=false;
    int safetyAdmitted=0,safetyDeferred=0,safetyUnsupported=0,safetyExistingUnsafe=0,safetyCapacity=0,safetyAuthoredRockets=0;
    double safetyHorizon=0;
    std::array<double,6> regionHp{},regionMax{};
    double guardHp=0,guardMax=0; int bossEpoch=0,sweepUnresolved=0;
    boss_pose::Frame bossFrame{},previousBossFrame{};
    bool RegionVulnerable(int Id) const;
    double RegionHp(int Id) const;
    double RegionMax(int Id) const;
    std::array<Target,MaxTargets> targets{};
    std::array<Shot,MaxShots> shots{};
    std::array<EnemyShot,MaxEnemyShots> enemyShots{};
    std::array<Effect,MaxEffects> effects{};
    std::array<Pickup,MaxPickups> pickups{};
    std::array<Laser,2> lasers{};
    std::array<bool,24> formationAlive{};
    int formationSpan=7;
    bool UsesSpatialBoss() const { return level==0 || level>=3; }
    void Start(Relic Equipped,int Level=0,int Rank=0);
    void Advance(double Seconds,double DesiredX);
    bool Activate();
    bool ActivateRelic(Relic Equipped);
    bool FireLaser();
    double TempestSeconds() const { return campaign?3.5:1.; }
    bool ClashTap();
    bool ChooseReward(int Choice);
    bool ApplyLegacyReward(int Choice);
    int StageLevel() const { return campaign?(actIndex==0?0:actIndex==1?3:4):level; }
    double StageProgress() const;
    bool RelicActive(Relic Type) const { return campaign?relicTime[int(Type)]>0:ability>0 && relic==Type; }
    bool Heal();
    bool Revive();
    bool DeclineRevive();
    bool CanHeal() const;
    bool CanRevive() const;
    int BossPart() const;
    double BossPartHp() const;
    double BossPartMax() const;
    int TargetCount() const;
    int ShotCount() const;
    int EnemyShotCount() const;
    int PickupCount() const;
    const char* LevelName() const;
    void TroopPosition(int Slot,double& X,double& Z) const;
    double HostileSpeed() const;
    void ConsumeEffects() { effectCount=0; }
private:
    double accumulator=0,fireClock=0,desiredX=0,bossClock=0,bossAge=0,deathClock=0,firePose=0,sweepClock=0;
    Phase resumePhase=Phase::Run;
    int nextLaserId=1;
    int nextTargetId=1,nextEffectId=1,nextEnemyShotId=1,nextPickupId=1,bossVolleys=0,sweepIndex=-1;
    double visualStrength=7,commanderChip=0,armorBudget=0,rebuildClock=0,coreGuardClock=0;
    uint64_t spawned=0;
    bool bossLaneLocked=false,bossArrived=false;
    double committedAttackBoost=1;
    boss_pose::PoseDriver poseDriver{};
    int nextShotId=1; double collapseTime=0,collapseStartY=0;
    int combatPulses=0,combatEpoch=0,evades=0; double combatClock=0,beamSlope=0,nextEvade=7,evadeTarget=0;
    bool bossClashed=false,legacyApplied=false; double clashTapCooldown=0,healthDropClock=0,actStartDistance=0;
    double barrageClock=0,groundStride=0; int barragePairs=0;
    void ConfigureCampaign();
    void UpdateZone();
    void BarrageVolley();
    void BarrageStep(double Dt);
    void SpawnArchetype(int Type,double X,double Hp,double Delay=0);
    void ArchetypeStep(Target& Enemy,double Dt);
    bool BeginClash();
    void ClashStep(double Dt);
    void BeginCombatPower(PickupKind Power);
    void CombatStep(double Dt);
    void GroundSalvo();
    double GroundY() const;
    void UpdatePose(double Dt);
    void SyncPosePosition();
    void DamageRegion(int Region,double Damage,const boss_pose::Vec3& Point,FriendlyKind WeaponKind,int Epoch);
    void ExposeCore();
    void EmitSpatial(EffectKind Type,const boss_pose::Vec3& Point,int Value,int Region,double Size=.3);
    int AimRegion(double Origin,bool Guided,int Index) const;
    formation_safety::Workspace safetyWorkspace{};
    bool AdmitAttack(const formation_safety::Hazard* Proposed,int Count,int Source=0);
    bool AdmitRanged(const Target& Enemy);
    void EnemyMuzzle(const Target& Enemy,double& X,double& Y,double& Z) const;
    bool AdmitBoss(double Windup,double Aim);
    int SweepCount() const;
    int RocketHalfCount() const;
    void Step(double Dt);
    void SpawnTimeline();
    void SiegeTimeline();
    void RangedStep(Target& Enemy,double Dt);
    void SpawnRanged(double X,double Hp,bool Battery=false,double Delay=0);
    void SpawnCarrier(double X,double Hp,int Power);
    void Spawn(Kind Type,double X,double Z,double Hp,int Value,int Op=0,double Size=.3,int Variant=0,double Motion=0);
    void Wave(int RowCount,double Hp,int Threat,int Formation,double Forward=42,int Shape=0);
    void Emit(EffectKind Type,double X,double Z,int Value=0,int EntityId=0,int Variant=0,double Size=.3);
    void DamageArmy(int Loss,double AtX,double AtZ,int Attacker=0,int Slot=-1);
    void DamageCommander(int Damage);
    void Recruit(int Gain);
    void ResizeFormation(double Strength,double AtX,double AtZ,EffectKind Removed=EffectKind::TroopDeath);
    void Sacrifice(int Cost);
    void FinalDefeat();
    void BreakBossParts();
    void MoveLasers(double Dt);
    void ClipLaserToShield(Laser& Beam);
    void DamageBoss(double Damage,double AtX,FriendlyKind WeaponKind=FriendlyKind::Pulse);
    void UpdateBossHealth();
    bool FormationHit(double X0,double Z0,double X1,double Z1,double Radius,bool Leader,int& Slot,double& HitX,double& HitZ,double Depth=-1) const;
    bool ShieldPlateHit(double X0,double Y0,double Z0,double X1,double Y1,double Z1,double Radius,double& HitX,double& HitY,double& HitZ) const;
    void Charge(double Amount);
    void Fire();
    void MoveShots(double Dt);
    void MoveTargets(double Dt,double TravelDelta);
    void MoveEnemyShots(double Dt);
    void DropPickup(double X,double Z,PickupKind Power,int Source,int ChoiceGroup=0,int BonusTroops=0);
    void MovePickups(double Dt);
    void SpawnEnemyShot(double OriginX,double OriginZ,double AimX,double Speed,double Radius,int Damage,ProjectileKind Type,bool Boss,int Source=0,WeaponEmitter Emitter=WeaponEmitter::Gunner,double LaunchHeight=1.65);
    void BossProjectile(WeaponEmitter Emitter,double AimX,double Speed,double Radius,int Damage,ProjectileKind Type);
    void BossVolley();
    void GatePair(int Index,double Forward=40);
    void AwardWeaponXP(int Amount);
    void BossStep(double Dt);
    void BeginBossDeath();
    void HitTarget(Target& Enemy,double Damage,FriendlyKind WeaponKind=FriendlyKind::Pulse,bool IgnoreArmor=false);
};
}
