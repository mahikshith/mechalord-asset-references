#pragma once
#include <array>
#include <algorithm>
#include <cmath>
#include <cstdint>

// Portable browser playtest. The legacy Unreal adapter still uses BattleSimulation.
namespace mech::assault
{
enum class Phase { Ready, Run, Boss, Destroying, Won, Lost, LastStand };
enum class Kind { Enemy, Crate, Gate, Hazard, Orb };
enum class Relic { Shield, EMP, Overdrive };
enum class EffectKind { Hit, Kill, Recruit, Gate, Damage, Relic, BossShot, Win, Contact, Block, BossDeath, Missed, Drop, Pickup, Pass, Retreat, BossPhase, CommanderHit, CommanderDeath, HazardBreak, TroopDeath, CoreExpose, BossRevive, BossPartBreak, TroopSacrifice, Heal, Revive, CommanderDown };
enum class ProjectileKind { Shell, Rocket, Orb };
enum class FriendlyKind { Pulse, Arc, Rail, Missile, Cannon };
enum class WeaponPower { None, Guided, Cannons, Railburst };
enum class TimePower { None, Freeze, Slow, Haste };
enum class PickupKind { Guided=1, Cannons, Railburst, Freeze, Slow, Haste };
enum class BossState { Armored, Exposed, Rebuilding, Destroying };
enum class BossPattern { Heavy, Sweep, Rockets, Laser };
enum class BossAction { Strafe, Advance, Retreat, Windup, Fire, Dying };
struct Target
{
    int id=0; Kind kind=Kind::Enemy;
    double x=0,z=0,hp=0,maxHp=0,size=.3,hit=0;
    int value=0,op=0,variant=0; bool active=false;
    double originX=0,motion=0,motionRate=1,fireClock=0,motionPhase=0,depth=.3;
};
struct Shot
{
    double x=0,z=0,dx=0,dz=32,damage=1;
    bool heavy=false,active=false; FriendlyKind kind=FriendlyKind::Pulse;
    int pierce=1,lastHit=0; bool troop=false;
};
struct EnemyShot
{
    int id=0; double x=0,z=0,dx=0,dz=0,radius=.3; int damage=0;
    ProjectileKind kind=ProjectileKind::Shell; bool active=false,boss=false; double homing=0;
};
struct Laser { int id=0; double x=0,z=0,endX=0,endZ=-5,width=.36,time=0,tick=0; bool active=false; };
struct Pickup { int id=0; PickupKind kind=PickupKind::Guided; double x=0,z=0,radius=1.05; bool active=false; };
struct Effect
{
    int id=0; EffectKind kind=EffectKind::Hit; double x=0,z=0; int value=0,entityId=0,variant=0; double size=.3;
};
class Battle
{
public:
    static constexpr int MaxTargets=256,MaxShots=256,MaxEnemyShots=96,MaxEffects=192,MaxPickups=24;
    static constexpr double Frontline=2.6;
    Phase phase=Phase::Ready; Relic relic=Relic::Shield; BossAction bossAction=BossAction::Strafe;
    TimePower timePower=TimePower::None; BossState bossState=BossState::Armored;
    WeaponPower starterWeapon=WeaponPower::None;
    WeaponPower weaponPower=WeaponPower::None; BossPattern bossPattern=BossPattern::Heavy;
    double time=0,duration=0,x=0,energy=55,ability=0,bossHp=0,bossMax=2200,bossAttack=0,bossLane=0;
    double timePowerTime=0,bossArmor=0,bossArmorMax=1250,bossCoreHp=450,bossCoreMax=450,bossCoreTime=0;
    int bossRevives=0,bossPartsMask=0;
    int healUsesRemaining=2; bool reviveUsed=false; double reviveProtection=0;
    double commanderHp=100,commanderMaxHp=100;
    double bossX=0,bossZ=40,bossY=.8,powerTime=0,deathProgress=0,travelDistance=0,travelGoal=203.5;
    int level=0,army=8,weapon=1,weaponXP=0,weaponNeed=40,kills=0,score=0,effectCount=0;
    int rank=0,rankReward=0,bossPhase=1;
    bool paused=false,engagement=false;
    std::array<Target,MaxTargets> targets{};
    std::array<Shot,MaxShots> shots{};
    std::array<EnemyShot,MaxEnemyShots> enemyShots{};
    std::array<Effect,MaxEffects> effects{};
    std::array<Pickup,MaxPickups> pickups{};
    std::array<Laser,2> lasers{};
    std::array<bool,24> formationAlive{};
    int formationSpan=7;
    void Start(Relic Equipped,int Level=0,int Rank=0);
    void Advance(double Seconds,double DesiredX);
    bool Activate();
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
    double visualStrength=7,commanderChip=0,armorBudget=0,rebuildClock=0;
    uint64_t spawned=0;
    bool bossLaneLocked=false;
    void Step(double Dt);
    void SpawnTimeline();
    void Spawn(Kind Type,double X,double Z,double Hp,int Value,int Op=0,double Size=.3,int Variant=0,double Motion=0);
    void Wave(int RowCount,double Hp,int Threat,int Formation,double Forward=42);
    void Emit(EffectKind Type,double X,double Z,int Value=0,int EntityId=0,int Variant=0,double Size=.3);
    void DamageArmy(int Loss,double AtX,double AtZ,int Attacker=0,int Slot=-1);
    void DamageCommander(int Damage);
    void Recruit(int Gain);
    void ResizeFormation(double Strength,double AtX,double AtZ,EffectKind Removed=EffectKind::TroopDeath);
    void Sacrifice(int Cost);
    void FinalDefeat();
    void BreakBossParts();
    void MoveLasers(double Dt);
    void DamageBoss(double Damage,double AtX);
    void UpdateBossHealth();
    bool FormationHit(double X0,double Z0,double X1,double Z1,double Radius,bool Leader,int& Slot,double& HitX,double& HitZ,double Depth=-1) const;
    void Charge(double Amount);
    void Fire();
    void MoveShots(double Dt);
    void MoveTargets(double Dt,double TravelDelta);
    void MoveEnemyShots(double Dt);
    void DropPickup(double X,double Z,PickupKind Power,int Source);
    void MovePickups(double Dt);
    void SpawnEnemyShot(double OriginX,double OriginZ,double AimX,double Speed,double Radius,int Damage,ProjectileKind Type,bool Boss);
    void BossVolley();
    void GatePair(int Index,double Forward=40);
    void AwardWeaponXP(int Amount);
    void BossStep(double Dt);
    void BeginBossDeath();
    void HitTarget(Target& Enemy,double Damage);
};
}
