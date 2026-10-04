#pragma once
#include <array>
#include <algorithm>
#include <cmath>
#include <cstdint>

// Portable browser playtest. The legacy Unreal adapter still uses BattleSimulation.
namespace mech::assault
{
enum class Phase { Ready, Run, Boss, Destroying, Won, Lost };
enum class Kind { Enemy, Crate, Gate, Hazard };
enum class Relic { Shield, EMP, Overdrive };
enum class EffectKind { Hit, Kill, Recruit, Gate, Damage, Relic, BossShot, Win, Contact, Block, BossDeath, Missed };
enum class ProjectileKind { Shell, Rocket, Orb };
enum class FriendlyKind { Pulse, Arc, Rail };
enum class BossAction { Strafe, Advance, Retreat, Windup, Fire, Dying };
struct Target
{
    int id=0; Kind kind=Kind::Enemy;
    double x=0,z=0,hp=0,maxHp=0,size=.3,hit=0;
    int value=0,op=0,variant=0; bool active=false;
    double originX=0,motion=0,motionRate=1,fireClock=0;
};
struct Shot
{
    double x=0,z=0,dx=0,dz=32,damage=1;
    bool heavy=false,active=false; FriendlyKind kind=FriendlyKind::Pulse;
    int pierce=1,lastHit=0;
};
struct EnemyShot
{
    int id=0; double x=0,z=0,dx=0,dz=0,radius=.3; int damage=0;
    ProjectileKind kind=ProjectileKind::Shell; bool active=false,boss=false;
};
struct Effect
{
    int id=0; EffectKind kind=EffectKind::Hit; double x=0,z=0; int value=0,entityId=0,variant=0; double size=.3;
};
class Battle
{
public:
    static constexpr int MaxTargets=256,MaxShots=256,MaxEnemyShots=96,MaxEffects=192;
    static constexpr double Frontline=2.6;
    Phase phase=Phase::Ready; Relic relic=Relic::Shield; BossAction bossAction=BossAction::Strafe;
    double time=0,duration=0,x=0,energy=55,ability=0,bossHp=0,bossMax=2200,bossAttack=0,bossLane=0;
    double bossX=0,bossZ=12,deathProgress=0,travelDistance=0,travelGoal=120;
    int level=0,army=8,weapon=1,weaponXP=0,weaponNeed=40,kills=0,score=0,effectCount=0;
    bool paused=false,engagement=false;
    std::array<Target,MaxTargets> targets{};
    std::array<Shot,MaxShots> shots{};
    std::array<EnemyShot,MaxEnemyShots> enemyShots{};
    std::array<Effect,MaxEffects> effects{};
    void Start(Relic Equipped,int Level=0);
    void Advance(double Seconds,double DesiredX);
    bool Activate();
    int TargetCount() const;
    int ShotCount() const;
    int EnemyShotCount() const;
    const char* LevelName() const;
    void ConsumeEffects() { effectCount=0; }
private:
    double accumulator=0,fireClock=0,desiredX=0,bossClock=0,bossAge=0,deathClock=0,firePose=0;
    int nextTargetId=1,nextEffectId=1,nextEnemyShotId=1,bossVolleys=0;
    uint64_t spawned=0;
    bool bossLaneLocked=false;
    void Step(double Dt);
    void SpawnTimeline();
    void Spawn(Kind Type,double X,double Z,double Hp,int Value,int Op=0,double Size=.3,int Variant=0,double Motion=0);
    void Wave(int RowCount,double Hp,int Threat,int Formation,double Forward=19);
    void Emit(EffectKind Type,double X,double Z,int Value=0,int EntityId=0,int Variant=0,double Size=.3);
    void DamageArmy(int Loss,double AtX,double AtZ,int Attacker=0);
    void Charge(double Amount);
    void Fire();
    void MoveShots(double Dt);
    void MoveTargets(double Dt,double TravelDelta);
    void MoveEnemyShots(double Dt);
    void SpawnEnemyShot(double OriginX,double OriginZ,double AimX,double Speed,double Radius,int Damage,ProjectileKind Type,bool Boss);
    void BossVolley();
    void GatePair(int Index,double Forward=16);
    void AwardWeaponXP(int Amount);
    void BossStep(double Dt);
    void BeginBossDeath();
    void HitTarget(Target& Enemy,double Damage);
    bool HasBlockingTargets() const;
};
}
