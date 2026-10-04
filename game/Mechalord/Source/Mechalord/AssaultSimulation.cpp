#include "AssaultSimulation.h"

namespace mech::assault
{
const char* Battle::LevelName() const
{
    static constexpr const char* Names[]={"Relic Causeway","Roller Foundry","Citadel Breach"};
    return Names[std::clamp(level,0,2)];
}
void Battle::Start(Relic Equipped,int Level)
{
    *this=Battle{};
    level=std::clamp(Level,0,2); duration=55+level*5;
    bossMax=1400+level*350; relic=Equipped; phase=Phase::Run;
    GatePair(0,15);
    for(double Lane:{-1.8,0.,1.8}) Spawn(Kind::Enemy,Lane,12,4+level,1,0,.3);
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
    Emit(EffectKind::Relic,x,0,int(relic));
    // A short disruption pulse opens a firing lane while the slow lasts.
    // It only affects approaching machines, never gates or weapon crates.
    if(relic==Relic::EMP) for(auto& T:targets)
        if(T.active && T.kind==Kind::Enemy && T.z<12 && std::abs(T.x-x)<2.2)
            HitTarget(T,3.5+weapon*2.0);
    return true;
}
int Battle::TargetCount() const { int N=0; for(const auto& T:targets) if(T.active) ++N; return N; }
int Battle::ShotCount() const { int N=0; for(const auto& S:shots) if(S.active) ++N; return N; }
int Battle::EnemyShotCount() const { int N=0; for(const auto& S:enemyShots) if(S.active) ++N; return N; }
void Battle::Emit(EffectKind Type,double X,double Z,int Value)
{
    if(effectCount==MaxEffects) { for(int I=1;I<MaxEffects;++I) effects[I-1]=effects[I]; --effectCount; }
    effects[effectCount++]={nextEffectId++,Type,X,Z,Value};
}
void Battle::Spawn(Kind Type,double X,double Z,double Hp,int Value,int Op,double Size,int Variant,double Motion)
{
    for(auto& T:targets) if(!T.active)
    {
        T={nextTargetId++,Type,X,Z,Hp,Hp,Size,0,Value,Op,Variant,true,X,Motion,.8+level*.18,0}; return;
    }
}
void Battle::GatePair(int Index,double Forward)
{
    const bool Flip=(Index+level)%2!=0;
    const double RecruitX=Flip ? 1.8 : -1.8;
    const double MultiplyX=-RecruitX;
    if(Index==0)
    {
        Spawn(Kind::Gate,-1.8,Forward,28,7,0,1.2);
        Spawn(Kind::Gate,1.8,Forward,28,5,0,1.2);
    }
    else if(Index==2)
    {
        Spawn(Kind::Gate,RecruitX,Forward,32,8,0,1.2);
        Spawn(Kind::Gate,MultiplyX,Forward,56,-7-level,0,1.2);
    }
    else
    {
        Spawn(Kind::Gate,RecruitX,Forward,36+Index*2,8+Index,0,1.2);
        Spawn(Kind::Gate,MultiplyX,Forward,42+Index*4,2,1,1.2);
    }
}
void Battle::Wave(int Rows,double Hp,int Threat,int Formation,double Forward)
{
    for(int Row=0;Row<Rows;++Row) for(int Col=0;Col<8;++Col)
    {
        double Lane=-2.65+Col*.75+(Row%2 ? .12 : 0);
        if(Formation==1) Lane=-2.9+Col*.49;
        if(Formation==2) Lane=-.5+Col*.49;
        if(Formation==3) Lane=-1.9+Col*.54;
        const int Variant=level>0 && Row==0 && Col==3 ? 1 : level==2 && Row==0 && (Col==0 || Col==7) ? 2 : 0;
        const double Health=Hp*(Variant==1 ? 2.3 : Variant==2 ? 1.6 : 1);
        Spawn(Kind::Enemy,Lane,Forward+Row*.65,Health,Variant==1 ? Threat+4 : Threat,0,Variant==1 ? .42 : .27,Variant);
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
    for(int I=1;I<=11;++I)
        if(I*5<duration-4 && At(I-1,I*5)) GatePair(I);
    for(int I=0;I<9;++I)
    {
        const double AtTime=1+I*6.5;
        if(AtTime<duration-5 && At(11+I,AtTime))
        {
            const double Side=(I+level)%2 ? 1.8 : -1.8;
            Spawn(Kind::Crate,Side,16,16+I*3+level*3,30,0,.55);
        }
    }
    for(int I=0;I<18;++I)
    {
        const double AtTime=2+I*(level==0 ? 3.5 : level==1 ? 3.2 : 3.0);
        if(AtTime<duration-7 && At(20+I,AtTime))
        {
            Wave(I%3==0 ? 6 : 5,4+I*.58+level*.9,1+I/8,(I+level)%4,I==0 ? 16 : 19);
        }
    }
    const int RollerCount=level==0 ? 5 : level==1 ? 8 : 7;
    for(int I=0;I<RollerCount;++I)
    {
        const double AtTime=9+I*(level==0 ? 8 : level==1 ? 6 : 7);
        if(AtTime<duration-6 && At(38+I,AtTime))
        {
            const double Base=level==0 ? (I%2 ? 1.3 : 0) : (I%2 ? 1.3 : -1.3);
            const double Motion=level==0 ? .65 : level==1 ? 1.35 : 1.6;
            Spawn(Kind::Hazard,Base,18,0,18+level*3+I*2,0,level==0 ? .85 : .95,0,Motion);
        }
    }
    if(level==0) for(int I=0;I<8;++I) if(At(46+I,23+I*.8))
    {
        Spawn(Kind::Gate,-1.8,18,12,1,0,1.2);
        Spawn(Kind::Gate,1.8,18,12,2,0,1.2);
    }
    if(At(54,16)) Spawn(Kind::Crate,level==1 ? 1.8 : -1.8,9,50,45,0,.65);
    if(level==1 && At(55,32)) Spawn(Kind::Hazard,0,20,0,25,0,.8,0,2.15);
    if(level==2 && At(55,34)) Wave(6,20,5,3,21);
    if(level==0 && At(55,30)) Spawn(Kind::Enemy,0,20,45,8,0,.42,1);
}
void Battle::DamageArmy(int Loss,double AtX,double AtZ)
{
    if(ability>0 && relic==Relic::Shield) { Emit(EffectKind::Hit,AtX,AtZ,0); return; }
    const int Actual=std::min(army,std::max(0,Loss)); army-=Actual;
    if(Actual>0) Emit(EffectKind::Damage,AtX,AtZ,Actual);
    if(army<=0) phase=Phase::Lost;
}
void Battle::AwardWeaponXP(int Amount)
{
    if(weapon>=4) { if(ability<=0) energy=std::min(100.,energy+8); return; }
    weaponXP+=Amount;
    while(weapon<4 && weaponXP>=weaponNeed)
    {
        weaponXP-=weaponNeed; ++weapon;
        weaponNeed=weapon==2 ? 70 : weapon==3 ? 100 : 0;
    }
    if(weapon==4) weaponXP=0;
}
void Battle::Fire()
{
    const int Count=std::clamp(4+army/12,4,12);
    static constexpr double Damage[]={0,1.1,1.6,2.2,3.0};
    const double Boost=ability>0 && relic==Relic::Overdrive ? 1.7 : 1;
    for(int I=0;I<Count;++I) for(auto& S:shots) if(!S.active)
    {
        S={std::clamp(x+(I-(Count-1)*.5)*.17,-3.4,3.4),.4,Damage[weapon]*Boost,weapon>=3,true}; break;
    }
}
void Battle::HitTarget(Target& T,double Damage)
{
    const double Before=T.hp; T.hp=std::max(0.,T.hp-Damage); T.hit=.12;
    Emit(EffectKind::Hit,T.x,T.z,std::max(1,int(std::ceil(Damage))));
    if(ability<=0) energy=std::min(100.,energy+Damage*.12);
    if(T.kind==Kind::Gate)
    {
        if(T.op==0) T.value=std::min(32,T.value+int((T.maxHp-T.hp)/4)-int((T.maxHp-Before)/4));
        else if(T.hp<=0) T.value=3;
        return;
    }
    if(T.hp>0) return;
    T.active=false; ++kills; score+=T.kind==Kind::Crate ? 30 : 10+T.variant*10;
    if(ability<=0) energy=std::min(100.,energy+(T.kind==Kind::Crate ? 8 : 3));
    Emit(EffectKind::Kill,T.x,T.z,T.kind==Kind::Crate ? 30 : 10+T.variant*10);
    if(T.kind==Kind::Crate) AwardWeaponXP(T.value);
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
            if(std::abs(S.x)<2.9)
            {
                bossHp=std::max(0.,bossHp-S.damage);
                if(ability<=0) energy=std::min(100.,energy+S.damage*.08);
                Emit(EffectKind::Hit,S.x,18,int(std::ceil(S.damage)));
            }
            S.active=false;
        }
        else if(S.z>27) S.active=false;
    }
}
void Battle::SpawnEnemyShot(double OriginX,double OriginZ,double AimX,double Speed,double Radius,int Damage,ProjectileKind Type,bool Boss)
{
    const double Offset=AimX-OriginX,Length=std::sqrt(Offset*Offset+OriginZ*OriginZ);
    for(auto& S:enemyShots) if(!S.active)
    {
        S={nextEnemyShotId++,OriginX,OriginZ,Offset/Length*Speed,-OriginZ/Length*Speed,Radius,Damage,Type,true,Boss}; return;
    }
}
void Battle::MoveEnemyShots(double Dt)
{
    const double Slow=ability>0 && relic==Relic::EMP ? .42 : 1;
    for(auto& S:enemyShots)
    {
        if(!S.active) continue;
        const double BeforeZ=S.z,BeforeX=S.x;
        S.x+=S.dx*Dt*Slow; S.z+=S.dz*Dt*Slow;
        if(S.z>0) continue;
        const double Fraction=BeforeZ/(BeforeZ-S.z);
        const double ImpactX=BeforeX+(S.x-BeforeX)*Fraction;
        S.active=false;
        if(std::abs(ImpactX-x)<S.radius+.32) DamageArmy(S.damage,ImpactX,0);
        if(phase==Phase::Lost) return;
    }
}
void Battle::MoveTargets(double Dt)
{
    const bool Emp=ability>0 && relic==Relic::EMP;
    for(auto& T:targets)
    {
        if(!T.active) continue;
        T.hit=std::max(0.,T.hit-Dt);
        if(T.kind==Kind::Hazard && T.motion>0) T.x=std::clamp(T.originX+T.motion*std::sin(time*T.motionRate+T.id*.37),-2.9,2.9);
        T.z-=3.7*Dt*(T.kind==Kind::Enemy && Emp ? .42 : 1);
        if(T.kind==Kind::Enemy && T.variant==2 && !Emp && T.z>5 && T.z<20)
        {
            T.fireClock+=Dt;
            if(T.fireClock>=2.6)
            {
                T.fireClock=0; SpawnEnemyShot(T.x,T.z,x,8,.2,5,ProjectileKind::Orb,false);
            }
        }
        if(T.z>0) continue;
        T.active=false;
        if(std::abs(T.x-x)>T.size+(T.kind==Kind::Enemy ? .32+std::min(.55,army*.004) : .08)) continue;
        if(T.kind==Kind::Gate)
        {
            const int Before=army;
            army=std::clamp(T.op==1 ? army*T.value : army+T.value,0,160);
            score+=army-Before;
            if(ability<=0) energy=std::min(100.,energy+6);
            Emit(EffectKind::Gate,T.x,0,T.value);
            if(army!=Before) Emit(army<Before ? EffectKind::Damage : EffectKind::Recruit,T.x,0,std::abs(army-Before));
            if(army==0) { phase=Phase::Lost; return; }
        }
        else if(T.kind==Kind::Enemy || T.kind==Kind::Hazard) DamageArmy(T.value,T.x,0);
        if(phase==Phase::Lost) return;
    }
}
void Battle::BossVolley()
{
    ++bossVolleys;
    if(level==0) SpawnEnemyShot(0,18,bossLane,12,.38,24,ProjectileKind::Shell,true);
    else if(level==1) for(int I=-2;I<=2;++I) SpawnEnemyShot(I*.65,18,I*1.4,8.5,.22,11,ProjectileKind::Orb,true);
    else for(int I=-1;I<=1;++I) SpawnEnemyShot(I*.75,18,std::clamp(bossLane+I*.7,-3.2,3.2),10,.3,18,ProjectileKind::Rocket,true);
    Emit(EffectKind::BossShot,0,18,level);
}
void Battle::BossStep(double Dt)
{
    if(bossHp<=0) { phase=Phase::Won; score+=200+level*100; Emit(EffectKind::Win,x,18,score); return; }
    if(!(ability>0 && relic==Relic::EMP)) bossClock+=Dt;
    if(bossClock>=2.2 && !bossLaneLocked) { bossLane=level==1 ? 0 : std::clamp(x,-2.8,2.8); bossLaneLocked=true; }
    bossAttack=bossLaneLocked ? std::clamp((bossClock-2.2)/1.2,0.,1.) : 0;
    if(bossClock>=3.4 && !bossFired) { BossVolley(); bossFired=true; bossAttack=1; }
    if(bossFired)
    {
        bool InFlight=false; for(const auto& S:enemyShots) if(S.active && S.boss) { InFlight=true; break; }
        if(!InFlight) { bossClock=0; bossFired=bossLaneLocked=false; bossAttack=0; }
        else bossAttack=1;
    }
}
void Battle::Step(double Dt)
{
    time+=Dt; ability=std::max(0.,ability-Dt); x+=std::clamp(desiredX-x,-9*Dt,9*Dt);
    if(phase==Phase::Run) SpawnTimeline();
    fireClock+=Dt;
    const double Cadence=(.29-(weapon-1)*.025)/(ability>0 && relic==Relic::Overdrive ? 1.55 : 1);
    while(fireClock>=Cadence) { fireClock-=Cadence; Fire(); }
    MoveShots(Dt);
    if(phase==Phase::Run)
    {
        MoveTargets(Dt);
        if(time>=duration && phase==Phase::Run)
        {
            phase=Phase::Boss; bossHp=bossMax; bossClock=0; bossFired=bossLaneLocked=false;
            for(auto& T:targets) T.active=false; for(auto& S:shots) S.active=false; for(auto& S:enemyShots) S.active=false;
        }
    }
    else if(phase==Phase::Boss) BossStep(Dt);
    if(phase==Phase::Run || phase==Phase::Boss) MoveEnemyShots(Dt);
}
}
