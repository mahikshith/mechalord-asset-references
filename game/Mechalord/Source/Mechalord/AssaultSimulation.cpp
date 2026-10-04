#include "AssaultSimulation.h"

namespace mech::assault
{
void Battle::Start(Relic Equipped)
{
    *this=Battle{};
    relic=Equipped; phase=Phase::Run;
    Spawn(Kind::Gate,0,15,36,6,0,.83);
    for(double Lane:{-1.8,0.,1.8}) Spawn(Kind::Enemy,Lane,12,4,1,0,.3);
}
void Battle::Advance(double Seconds,double DesiredX)
{
    if(paused || (phase!=Phase::Run && phase!=Phase::Boss)) return;
    desiredX=std::isfinite(DesiredX) ? std::clamp(DesiredX,-3.,3.) : x;
    accumulator+=std::clamp(std::isfinite(Seconds) ? Seconds : 0.,0.,.25);
    constexpr double Dt=1./60.;
    while(accumulator+1e-10>=Dt)
    {
        accumulator-=Dt; Step(Dt);
        if(phase!=Phase::Run && phase!=Phase::Boss) { accumulator=0; break; }
    }
}
bool Battle::Activate()
{
    if(paused || energy<100 || ability>0 || (phase!=Phase::Run && phase!=Phase::Boss)) return false;
    energy=0; ability=relic==Relic::Overdrive ? 5 : 3;
    Emit(EffectKind::Relic,x,0,int(relic)); return true;
}
int Battle::TargetCount() const { int N=0; for(const auto& T:targets) if(T.active) ++N; return N; }
int Battle::ShotCount() const { int N=0; for(const auto& S:shots) if(S.active) ++N; return N; }
void Battle::Emit(EffectKind Type,double X,double Z,int Value)
{
    if(effectCount==MaxEffects)
    {
        for(int I=1;I<MaxEffects;++I) effects[I-1]=effects[I];
        --effectCount;
    }
    effects[effectCount++]={nextEffectId++,Type,X,Z,Value};
}
void Battle::Spawn(Kind Type,double X,double Z,double Hp,int Value,int Op,double Size)
{
    for(auto& T:targets) if(!T.active)
    {
        T={nextTargetId++,Type,X,Z,Hp,Hp,Size,0,Value,Op,true}; return;
    }
}
void Battle::Wave(int Rows,double Hp,int Threat,int Formation,double Forward)
{
    for(int Row=0;Row<Rows;++Row) for(int Col=0;Col<6;++Col)
    {
        const double Offset=(Row%2 ? .2 : 0);
        double Lane=-2.5+Col+Offset;
        if(Formation==1) Lane=-2.65+Col*.55;
        if(Formation==2) Lane=-.1+Col*.55;
        if(Formation==3) Lane=-1.5+Col*.6;
        Spawn(Kind::Enemy,Lane,Forward+Row*.9,Hp,Threat,0,.28);
    }
}
void Battle::SpawnTimeline()
{
    auto At=[&](int Id,double Seconds)
    {
        const uint64_t Bit=uint64_t(1)<<Id;
        if(time+1e-9<Seconds || (spawned&Bit)) return false;
        spawned|=Bit; return true;
    };
    if(At(0,1)) Spawn(Kind::Crate,-1.8,18,18,1,0,.45);
    if(At(1,2)) Wave(4,5,2,0,16);
    if(At(2,5)) { Spawn(Kind::Gate,-1.7,18,40,6,0,.83); Spawn(Kind::Gate,1.7,18,56,2,1,.83); }
    if(At(3,6.5)) { Wave(2,8,3,1); Spawn(Kind::Enemy,.3,22,42,10,0,.55); }
    if(At(27,8)) Spawn(Kind::Gate,1.7,18,56,-8,0,.83);
    if(At(4,9)) Spawn(Kind::Hazard,0,18,0,18,0,1.05);
    if(At(5,11)) { Spawn(Kind::Gate,1.7,18,48,8,0,.83); Spawn(Kind::Crate,-1.7,18,26,1,0,.45); }
    if(At(6,12)) Wave(2,10,3,2);
    if(At(7,15)) Wave(3,11,4,0);
    if(At(36,16)) Spawn(Kind::Crate,-1.7,9,50,1,0,.55);
    if(At(8,17)) { Spawn(Kind::Gate,-1.7,18,65,2,1,.83); Spawn(Kind::Gate,1.7,18,48,8,0,.83); }
    if(At(9,19)) Spawn(Kind::Hazard,0,18,0,22,0,1.1);
    if(At(10,20)) Wave(6,13,3,3);
    if(At(11,22)) Spawn(Kind::Crate,1.8,18,30,1,0,.45);
    if(At(12,24)) Wave(3,14,4,1);
    if(At(13,25)) { Spawn(Kind::Gate,1.7,18,52,12,0,.83); Spawn(Kind::Gate,-1.7,18,70,2,1,.83); }
    if(At(14,28)) Wave(3,15,5,2);
    if(At(15,29)) Spawn(Kind::Hazard,-1.8,18,0,18,0,.72);
    if(At(16,31)) Wave(3,16,5,0);
    if(At(17,34)) { Spawn(Kind::Gate,-1.7,18,60,12,0,.83); Spawn(Kind::Gate,1.7,18,75,2,1,.83); }
    if(At(18,35)) Wave(3,17,5,3);
    if(At(19,36)) Spawn(Kind::Crate,0,18,36,1,0,.5);
    if(At(20,38)) Spawn(Kind::Hazard,0,18,0,32,0,1.25);
    if(At(21,39)) Wave(3,18,5,0);
    if(At(22,42)) { Spawn(Kind::Gate,1.7,18,60,10,0,.83); Spawn(Kind::Gate,-1.7,18,80,2,1,.83); }
    if(At(23,43)) Wave(3,18,6,2);
    if(At(24,45)) Spawn(Kind::Hazard,1.7,18,0,24,0,.83);
    if(At(25,47)) Wave(3,19,6,0);
    if(At(26,49)) { Spawn(Kind::Gate,-1.7,18,65,16,0,.83); Spawn(Kind::Gate,1.7,18,85,2,1,.83); }
    // A deliberate lane choice opens a chain of small gains, while the central
    // formation keeps firing urgent. This is distinct from occasional big gates.
    for(int I=0;I<8;++I) if(At(28+I,23+I*.8)) Spawn(Kind::Gate,2.3,18,12,2,0,.42);
}
void Battle::DamageArmy(int Loss,double AtX,double AtZ)
{
    if(ability>0 && relic==Relic::Shield) { Emit(EffectKind::Hit,AtX,AtZ,0); return; }
    const int Actual=std::min(army,std::max(0,Loss)); army-=Actual;
    Emit(EffectKind::Damage,AtX,AtZ,Actual);
    if(army<=0) phase=Phase::Lost;
}
void Battle::Fire()
{
    const int Count=std::clamp(4+army/10,4,10);
    const double Boost=ability>0 && relic==Relic::Overdrive ? 1.7 : 1;
    for(int I=0;I<Count;++I) for(auto& S:shots) if(!S.active)
    {
        S={std::clamp(x+(I-(Count-1)*.5)*.18,-3.15,3.15),.4,(weapon==1 ? 1. : weapon==2 ? 1.65 : 2.4)*Boost,weapon==3,true};
        break;
    }
}
void Battle::HitTarget(Target& T,double Damage)
{
    const double Before=T.hp; T.hp=std::max(0.,T.hp-Damage); T.hit=.12;
    Emit(EffectKind::Hit,T.x,T.z,std::max(1,int(std::ceil(Damage))));
    energy=std::min(100.,energy+Damage*.17);
    if(T.kind==Kind::Gate)
    {
        if(T.op==0) T.value=std::min(28,T.value+int((T.maxHp-T.hp)/4)-int((T.maxHp-Before)/4));
        else if(T.hp<=0) T.value=3;
        return;
    }
    if(T.hp>0) return;
    T.active=false; ++kills; score+=T.kind==Kind::Crate ? 30 : 10;
    energy=std::min(100.,energy+4);
    Emit(EffectKind::Kill,T.x,T.z,T.kind==Kind::Crate ? 30 : 10);
    if(T.kind==Kind::Crate)
    {
        if(weapon<3) ++weapon; else energy=std::min(100.,energy+35);
    }
}
void Battle::MoveShots(double Dt)
{
    for(auto& S:shots)
    {
        if(!S.active) continue;
        const double Before=S.z; S.z+=Dt*29;
        Target* Nearest=nullptr;
        for(auto& T:targets)
        {
            if(!T.active || T.hp<=0 || T.kind==Kind::Hazard) continue;
            if(T.z+T.size<Before || T.z-T.size>S.z || std::abs(T.x-S.x)>T.size+.08) continue;
            if(!Nearest || T.z<Nearest->z) Nearest=&T;
        }
        if(Nearest) { HitTarget(*Nearest,S.damage); S.active=false; }
        else if(phase==Phase::Boss && Before<=18 && S.z>=18)
        {
            if(std::abs(S.x)<2.7)
            {
                bossHp=std::max(0.,bossHp-S.damage); energy=std::min(100.,energy+S.damage*.12);
                Emit(EffectKind::Hit,S.x,18,int(std::ceil(S.damage)));
            }
            S.active=false;
        }
        else if(S.z>27) S.active=false;
    }
}
void Battle::MoveTargets(double Dt)
{
    for(auto& T:targets)
    {
        if(!T.active) continue;
        T.hit=std::max(0.,T.hit-Dt);
        if(!(T.kind==Kind::Enemy && ability>0 && relic==Relic::EMP)) T.z-=3.7*Dt;
        if(T.z>0) continue;
        T.active=false;
        if(std::abs(T.x-x)>T.size+(T.kind==Kind::Enemy ? .32+std::min(.6,army*.005) : .08)) continue;
        if(T.kind==Kind::Gate)
        {
            const int Before=army;
            army=std::clamp(T.op==1 ? army*T.value : army+T.value,0,120);
            score+=army-Before; Emit(EffectKind::Gate,T.x,0,T.value);
            if(army!=Before) Emit(army<Before ? EffectKind::Damage : EffectKind::Recruit,T.x,0,std::abs(army-Before));
            if(army==0) { phase=Phase::Lost; return; }
        }
        else if(T.kind==Kind::Enemy || T.kind==Kind::Hazard) DamageArmy(T.value,T.x,0);
        if(phase==Phase::Lost) return;
    }
}
void Battle::BossStep(double Dt)
{
    if(!(ability>0 && relic==Relic::EMP)) bossClock+=Dt;
    if(bossClock>=2.55 && !bossLaneLocked)
    {
        bossLane=std::clamp(x,-2.4,2.4); bossLaneLocked=true;
    }
    bossAttack=bossLaneLocked ? std::clamp((bossClock-2.55)/1.25,0.,1.) : 0;
    if(bossClock>=3.8)
    {
        Emit(EffectKind::BossShot,bossLane,0,0);
        if(std::abs(x-bossLane)<1.05) DamageArmy(std::max(18,int(std::ceil(army*.38))),bossLane,0);
        bossClock=0; bossLaneLocked=false; bossAttack=0;
    }
    if(bossHp<=0 && phase!=Phase::Lost)
    {
        phase=Phase::Won; score+=200; Emit(EffectKind::Win,x,18,score);
    }
}
void Battle::Step(double Dt)
{
    time+=Dt; ability=std::max(0.,ability-Dt);
    x+=std::clamp(desiredX-x,-9*Dt,9*Dt);
    if(phase==Phase::Run) SpawnTimeline();
    fireClock+=Dt;
    const double Cadence=(weapon==1 ? .28 : weapon==2 ? .25 : .23)/(ability>0 && relic==Relic::Overdrive ? 1.55 : 1);
    while(fireClock>=Cadence) { fireClock-=Cadence; Fire(); }
    MoveShots(Dt);
    if(phase==Phase::Run)
    {
        MoveTargets(Dt);
        if(time>=Duration && phase==Phase::Run)
        {
            phase=Phase::Boss; bossHp=bossMax; bossClock=0; bossLaneLocked=false;
            for(auto& T:targets) T.active=false;
            for(auto& S:shots) S.active=false;
            Emit(EffectKind::BossShot,0,18,0);
        }
    }
    else if(phase==Phase::Boss) BossStep(Dt);
}
}
