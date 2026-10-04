#pragma once
#include <array>
#include <algorithm>
#include <cmath>
#include <cstdint>

// Portable replacement playtest. The existing Unreal adapter still uses
// BattleSimulation; integration of this new combat model is a separate step.
namespace mech::assault
{
enum class Phase { Ready, Run, Boss, Won, Lost };
enum class Kind { Enemy, Crate, Gate, Hazard };
enum class Relic { Shield, EMP, Overdrive };
enum class EffectKind { Hit, Kill, Recruit, Gate, Damage, Relic, BossShot, Win };
struct Target
{
    int id=0; Kind kind=Kind::Enemy;
    double x=0,z=0,hp=0,maxHp=0,size=.3,hit=0;
    int value=0,op=0; bool active=false;
};
struct Shot { double x=0,z=0,damage=1; bool heavy=false,active=false; };
struct Effect { int id=0; EffectKind kind=EffectKind::Hit; double x=0,z=0; int value=0; };
class Battle
{
public:
    static constexpr int MaxTargets=160,MaxShots=256,MaxEffects=128;
    static constexpr double Duration=55;
    Phase phase=Phase::Ready; Relic relic=Relic::Shield;
    double time=0,x=0,energy=100,ability=0,bossHp=0,bossMax=1800,bossAttack=0,bossLane=0;
    int army=8,weapon=1,kills=0,score=0,effectCount=0;
    bool paused=false;
    std::array<Target,MaxTargets> targets{};
    std::array<Shot,MaxShots> shots{};
    std::array<Effect,MaxEffects> effects{};
    void Start(Relic Equipped);
    void Advance(double Seconds,double DesiredX);
    bool Activate();
    int TargetCount() const;
    int ShotCount() const;
    void ConsumeEffects() { effectCount=0; }
private:
    double accumulator=0,fireClock=0,desiredX=0,bossClock=0;
    int nextTargetId=1,nextEffectId=1;
    uint64_t spawned=0;
    bool bossLaneLocked=false;
    void Step(double Dt);
    void SpawnTimeline();
    void Spawn(Kind Type,double X,double Z,double Hp,int Value,int Op=0,double Size=.3);
    void Wave(int RowCount,double Hp,int Threat,int Formation,double Forward=21);
    void Emit(EffectKind Type,double X,double Z,int Value=0);
    void DamageArmy(int Loss,double AtX,double AtZ);
    void Fire();
    void MoveShots(double Dt);
    void MoveTargets(double Dt);
    void BossStep(double Dt);
    void HitTarget(Target& Enemy,double Damage);
};
}
