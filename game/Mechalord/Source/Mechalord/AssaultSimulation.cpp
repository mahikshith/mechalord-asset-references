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
    *this=Battle{}; level=std::clamp(Level,0,2); travelGoal=120+level*15;
    duration=travelGoal/3.7; bossMax=2200+level*400; relic=Equipped; phase=Phase::Run;
    GatePair(0,15);
    for(double Lane:{-1.8,0.,1.8}) Spawn(Kind::Enemy,Lane,12,4+level,1,0,.3);
}
void Battle::Advance(double Seconds,double DesiredX)
{
    if(paused || (phase!=Phase::Run && phase!=Phase::Boss && phase!=Phase::Destroying)) return;
    desiredX=std::isfinite(DesiredX)?std::clamp(DesiredX,-3.,3.):x;
    accumulator+=std::clamp(std::isfinite(Seconds)?Seconds:0.,0.,.25);
    constexpr double Dt=1./60.;
    while(accumulator+1e-10>=Dt)
    {
        accumulator-=Dt; Step(Dt);
        if(phase==Phase::Won || phase==Phase::Lost) { accumulator=0; break; }
    }
}
void Battle::Charge(double Amount) { if(ability<=0) energy=std::min(100.,energy+Amount); }
bool Battle::Activate()
{
    if(paused || energy<100 || ability>0 || (phase!=Phase::Run && phase!=Phase::Boss)) return false;
    energy=0; ability=relic==Relic::Overdrive?5:4;
    Emit(EffectKind::Relic,x,0,int(relic),0,-2,relic==Relic::EMP?3.2:1.5);
    if(relic==Relic::EMP)
    {
        // The pulse damages nearby machines and gives time to finish the survivors.
        for(auto& T:targets) if(T.active && T.kind==Kind::Enemy && T.z<13 && std::abs(T.x-x)<3.2)
            HitTarget(T,5+weapon*2.5);
        if(phase==Phase::Boss && bossZ<14 && std::abs(bossX-x)<3.2)
        {
            bossHp=std::max(0.,bossHp-35-weapon*15.);
            Emit(EffectKind::Hit,bossX,bossZ,35+weapon*15,0,3,2.4);
            if(bossHp<=0) BeginBossDeath();
        }
    }
    return true;
}
int Battle::TargetCount() const { int N=0; for(const auto& T:targets) if(T.active) ++N; return N; }
int Battle::ShotCount() const { int N=0; for(const auto& S:shots) if(S.active) ++N; return N; }
int Battle::EnemyShotCount() const { int N=0; for(const auto& S:enemyShots) if(S.active) ++N; return N; }
void Battle::Emit(EffectKind Type,double X,double Z,int Value,int EntityId,int Variant,double Size)
{
    if(effectCount==MaxEffects) { for(int I=1;I<MaxEffects;++I) effects[I-1]=effects[I]; --effectCount; }
    effects[effectCount++]={nextEffectId++,Type,X,Z,Value,EntityId,Variant,Size};
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
    const bool Flip=(Index+level)%2!=0; const double RecruitX=Flip?1.8:-1.8,MultiplyX=-RecruitX;
    if(Index==0)
    {
        Spawn(Kind::Gate,-1.8,Forward,24,8,0,1.2);
        Spawn(Kind::Gate,1.8,Forward,24,6,0,1.2);
    }
    else if(Index==2)
    {
        Spawn(Kind::Gate,RecruitX,Forward,30,10,0,1.2);
        Spawn(Kind::Gate,MultiplyX,Forward,48,-5-level,0,1.2);
    }
    else
    {
        Spawn(Kind::Gate,RecruitX,Forward,30+Index*2,10+Index,0,1.2);
        Spawn(Kind::Gate,MultiplyX,Forward,36+Index*3,2,1,1.2);
    }
}
void Battle::Wave(int Rows,double Hp,int Threat,int Formation,double Forward)
{
    const int Columns=Formation==1 || Formation==2?6:8;
    for(int Row=0;Row<Rows;++Row) for(int Col=0;Col<Columns;++Col)
    {
        double Lane=-2.65+Col*.75;
        if(Formation==1) Lane=-2.9+Col*.66;
        if(Formation==2) Lane=-.4+Col*.66;
        if(Formation==3) Lane=-2.52+Col*.72;
        const int Variant=level>0 && Row==0 && Col==3?1:level==2 && Row==0 && (Col==0 || Col==Columns-1)?2:0;
        Spawn(Kind::Enemy,Lane,Forward+Row*.72,Hp*(Variant==1?2.5:Variant==2?1.6:1),
            Variant==1?Threat+2:Threat,0,Variant==1?.42:.27,Variant);
    }
}
void Battle::SpawnTimeline()
{
    // Scheduling follows traversal. Contact fights cannot generate a timed flood.
    const double Progress=travelDistance/3.7;
    auto At=[&](int Id,double When)
    {
        const uint64_t Bit=uint64_t(1)<<Id;
        if(Progress+1e-9<When || (spawned&Bit)) return false;
        spawned|=Bit; return true;
    };
    for(int I=1;I<=8;++I) if(I*4.2<duration-2 && At(I-1,I*4.2)) GatePair(I);
    for(int I=0;I<8;++I) if(1+I*5.2<duration-3 && At(8+I,1+I*5.2))
        Spawn(Kind::Crate,(I+level)%2?1.8:-1.8,16,18+I*3+level*2,30,0,.55,-1);
    for(int I=0;I<6+level;++I) if(2+I*4.5<duration-3 && At(16+I,2+I*4.5))
        Wave(I%3==0?6:5,4.8+I*.8+level*.6,1+I/4,(I+level)%4,I==0?16:19);
    const int Rollers=level==0?3:level==1?5:4;
    for(int I=0;I<Rollers;++I) if(8+I*6<duration-4 && At(24+I,8+I*6))
        Spawn(Kind::Hazard,level==0?0:(I%2?1.3:-1.3),18,0,14+level*3+I*2,0,
            level==0?.85:.95,0,level==0?.65:level==1?1.35:1.6);
    if(level==0) for(int I=0;I<5;++I) if(At(32+I,18+I*.9))
    {
        Spawn(Kind::Gate,-1.8,16,12,1,0,1.2); Spawn(Kind::Gate,1.8,16,12,2,0,1.2);
    }
    if(At(38,14)) Spawn(Kind::Crate,level==1?1.8:-1.8,12,48,45,0,.65,-1);
    if(level==0 && At(39,20)) Spawn(Kind::Enemy,0,20,35,3,0,.42,1);
    if(level==1 && At(39,21)) Spawn(Kind::Hazard,0,20,0,21,0,.8,0,2.15);
    if(level==2 && At(39,24)) Wave(4,12,2,3,22);
}
void Battle::DamageArmy(int Loss,double AtX,double AtZ,int Attacker)
{
    if(ability>0 && relic==Relic::Shield) { Emit(EffectKind::Block,AtX,AtZ,Loss,Attacker,-2,.45); return; }
    const int Actual=std::min(army,std::max(0,Loss)); army-=Actual;
    if(Actual>0) Emit(EffectKind::Damage,AtX,AtZ,Actual,Attacker,-2,.45);
    if(army<=0) phase=Phase::Lost;
}
void Battle::AwardWeaponXP(int Amount)
{
    if(weapon>=4) { Charge(12); return; }
    weaponXP+=Amount;
    while(weapon<4 && weaponXP>=weaponNeed)
    {
        weaponXP-=weaponNeed; ++weapon; weaponNeed=weapon==2?70:weapon==3?100:0;
    }
    if(weapon==4) weaponXP=0;
}
void Battle::Fire()
{
    const int Count=std::clamp(5+army/16,5,12);
    static constexpr double Damage[]={0,1.5,2.2,3.0,4.4};
    const double Boost=ability>0 && relic==Relic::Overdrive?1.8:1;
    std::array<Target*,MaxTargets> Candidates{}; int CandidateCount=0;
    for(auto& T:targets) if(T.active && T.hp>0 && T.kind!=Kind::Hazard && T.z>.8)
    {
        if(T.kind==Kind::Gate && std::abs(T.x-x)>1.25) continue;
        if(T.kind==Kind::Crate && std::abs(T.x-x)>1.25) continue;
        Candidates[CandidateCount++]=&T;
    }
    std::sort(Candidates.begin(),Candidates.begin()+CandidateCount,[&](const Target* A,const Target* B)
    { return A->z+std::abs(A->x-x)*1.4 < B->z+std::abs(B->x-x)*1.4; });
    const int Spread=CandidateCount && Candidates[0]->kind==Kind::Enemy?std::min(6,CandidateCount):1;
    for(int I=0;I<Count;++I) for(auto& S:shots) if(!S.active)
    {
        const double Origin=std::clamp(x+(I-(Count-1)*.5)*(weapon>=3?.32:.17),-3.4,3.4);
        double AimX=Origin,AimZ=20;
        if(phase==Phase::Boss) { AimX=bossX+(I-(Count-1)*.5)*.27; AimZ=bossZ; }
        else if(CandidateCount) { const Target* T=Candidates[I%Spread]; AimX=T->x; AimZ=T->z; }
        const double Length=std::hypot(AimX-Origin,AimZ-.4);
        const double Speed=weapon>=4?43:32;
        S={Origin,.4,(AimX-Origin)/Length*Speed,(AimZ-.4)/Length*Speed,Damage[weapon]*Boost,
            weapon>=3,true,weapon>=4?FriendlyKind::Rail:weapon==3?FriendlyKind::Arc:FriendlyKind::Pulse,
            weapon>=4?3:1,0}; break;
    }
}
void Battle::HitTarget(Target& T,double Damage)
{
    const double Before=T.hp; T.hp=std::max(0.,T.hp-Damage); T.hit=.12;
    Emit(EffectKind::Hit,T.x,T.z,std::max(1,int(std::ceil(Damage))),T.id,T.variant,T.size);
    Charge(Damage*.18);
    if(T.kind==Kind::Gate)
    {
        if(T.op==0) T.value=std::min(32,T.value+int((T.maxHp-T.hp)/4)-int((T.maxHp-Before)/4));
        else if(T.hp<=0) T.value=3;
        return;
    }
    if(T.hp>0) return;
    T.active=false; ++kills; score+=T.kind==Kind::Crate?30:10+T.variant*10;
    Charge(T.kind==Kind::Crate?15:5);
    Emit(EffectKind::Kill,T.x,T.z,T.kind==Kind::Crate?30:10+T.variant*10,T.id,T.variant,T.size);
    if(T.kind==Kind::Crate) AwardWeaponXP(T.value);
}
void Battle::MoveShots(double Dt)
{
    for(auto& S:shots)
    {
        if(!S.active) continue;
        const double BeforeZ=S.z,BeforeX=S.x; S.z+=S.dz*Dt; S.x+=S.dx*Dt;
        Target* Nearest=nullptr;
        for(auto& T:targets)
        {
            if(!T.active || T.hp<=0 || T.kind==Kind::Hazard || T.id==S.lastHit) continue;
            if(T.z+T.size<BeforeZ || T.z-T.size>S.z) continue;
            const double F=std::clamp((T.z-BeforeZ)/(S.z-BeforeZ),0.,1.);
            if(std::abs(T.x-(BeforeX+(S.x-BeforeX)*F))>T.size+.08) continue;
            if(!Nearest || T.z<Nearest->z) Nearest=&T;
        }
        if(Nearest)
        {
            const double HitX=Nearest->x,HitZ=Nearest->z; const int HitId=Nearest->id;
            HitTarget(*Nearest,S.damage); S.lastHit=HitId;
            if(S.kind==FriendlyKind::Arc && Nearest->kind==Kind::Enemy)
                for(auto& T:targets) if(T.active && T.kind==Kind::Enemy && T.id!=HitId && std::hypot(T.x-HitX,T.z-HitZ)<.8)
                    HitTarget(T,S.damage*.45);
            if(Nearest->kind!=Kind::Enemy || --S.pierce<=0) S.active=false;
        }
        else if(phase==Phase::Boss && BeforeZ<=bossZ+.8 && S.z>=bossZ-.8)
        {
            const double F=std::clamp((bossZ-BeforeZ)/(S.z-BeforeZ),0.,1.);
            const double HitX=BeforeX+(S.x-BeforeX)*F;
            if(std::abs(HitX-bossX)<2.4)
            {
                const double Damage=S.damage*.65; bossHp=std::max(0.,bossHp-Damage); Charge(Damage*.12);
                Emit(EffectKind::Hit,HitX,bossZ,int(std::ceil(Damage)),0,3,2.4); S.active=false;
                if(bossHp<=0) { BeginBossDeath(); return; }
            }
        }
        if(S.z>38 || S.z< -2 || std::abs(S.x)>9) S.active=false;
    }
}
void Battle::SpawnEnemyShot(double OriginX,double OriginZ,double AimX,double Speed,double Radius,int Damage,ProjectileKind Type,bool Boss)
{
    const double Offset=AimX-OriginX,Length=std::hypot(Offset,OriginZ);
    for(auto& S:enemyShots) if(!S.active)
    { S={nextEnemyShotId++,OriginX,OriginZ,Offset/Length*Speed,-OriginZ/Length*Speed,Radius,Damage,Type,true,Boss}; return; }
}
void Battle::MoveEnemyShots(double Dt)
{
    const double Slow=ability>0 && relic==Relic::EMP?.38:1;
    for(auto& S:enemyShots)
    {
        if(!S.active) continue;
        const double BeforeZ=S.z,BeforeX=S.x; S.x+=S.dx*Dt*Slow; S.z+=S.dz*Dt*Slow;
        if(S.z>0) continue;
        const double Fraction=BeforeZ/(BeforeZ-S.z),ImpactX=BeforeX+(S.x-BeforeX)*Fraction;
        S.active=false;
        if(std::abs(ImpactX-x)<S.radius+.45) DamageArmy(S.damage,ImpactX,0,S.id);
        if(phase==Phase::Lost) return;
    }
}
bool Battle::HasBlockingTargets() const
{
    for(const auto& T:targets) if(T.active && T.kind==Kind::Enemy && T.z<=Frontline+.15) return true;
    for(const auto& T:targets) if(T.active && T.kind==Kind::Crate && T.z>.8 && T.z<=4 && std::abs(T.x-x)<1.25) return true;
    return false;
}
void Battle::MoveTargets(double Dt,double TravelDelta)
{
    const bool Emp=ability>0 && relic==Relic::EMP;
    // Process closest machines first so following rows queue rather than overlap.
    std::array<Target*,MaxTargets> Ordered{}; int Count=0;
    for(auto& T:targets) if(T.active) Ordered[Count++]=&T;
    std::sort(Ordered.begin(),Ordered.begin()+Count,[](const Target* A,const Target* B){return A->z<B->z || (A->z==B->z && A->id<B->id);});
    for(int I=0;I<Count;++I)
    {
        Target& T=*Ordered[I]; if(!T.active) continue; T.hit=std::max(0.,T.hit-Dt);
        if(T.kind==Kind::Enemy)
        {
            const double BeforeZ=T.z;
            double Near=Frontline;
            for(int J=0;J<I;++J) if(Ordered[J]->active && Ordered[J]->kind==Kind::Enemy && std::abs(Ordered[J]->x-T.x)<.38)
                Near=std::max(Near,Ordered[J]->z+.70);
            // Independent approach continues during a stopped engagement; the
            // queue's front can never cross through the allied formation.
            T.z=std::max(Near,T.z-TravelDelta-Dt*(Emp?.6:1.6));
            if(BeforeZ>Frontline+.06 && T.z<=Frontline+.06) T.fireClock=std::max(T.fireClock,.95);
            if(T.z<=Frontline+.06 && std::abs(T.x-x)<.6+std::min(1.1,army*.015))
            {
                T.fireClock+=Dt*(Emp?.38:1);
                if(T.fireClock>=1.15)
                {
                    T.fireClock-=1.15; Emit(EffectKind::Contact,T.x,T.z,T.value,T.id,T.variant,T.size);
                    DamageArmy(T.value,x,Frontline,T.id);
                }
            }
            else if(T.variant==2 && !Emp && T.z>Frontline+.06 && T.z<18)
            {
                T.fireClock+=Dt;
                if(T.fireClock>=3.5) { T.fireClock=0; SpawnEnemyShot(T.x,T.z,x,7,.22,4,ProjectileKind::Orb,false); }
            }
            if(phase==Phase::Lost) return;
            continue; // Enemies leave only through a real HP-zero kill.
        }
        if(T.kind==Kind::Hazard && T.motion>0) T.x=std::clamp(T.originX+T.motion*std::sin(time*T.motionRate+T.id*.37),-2.9,2.9);
        const bool AimedCrate=T.kind==Kind::Crate && T.z>.8 && std::abs(T.x-x)<1.25;
        T.z=AimedCrate?std::max(std::min(T.z,3.8),T.z-TravelDelta):T.z-TravelDelta;
        if(T.kind==Kind::Crate)
        {
            if(T.z< -2.5) { T.active=false; Emit(EffectKind::Missed,T.x,T.z,0,T.id,-1,T.size); }
            continue;
        }
        if(T.z>0) continue;
        T.active=false;
        if(T.kind==Kind::Gate)
        {
            if(std::abs(T.x-x)>T.size+.08) { Emit(EffectKind::Missed,T.x,0,0,T.id,0,T.size); continue; }
            const int Before=army; army=std::clamp(T.op==1?army*T.value:army+T.value,0,160);
            score+=army-Before; Charge(15); Emit(EffectKind::Gate,T.x,0,T.value,T.id,0,T.size);
            if(army!=Before) Emit(army<Before?EffectKind::Damage:EffectKind::Recruit,T.x,0,std::abs(army-Before),T.id,-2,.3);
            if(army==0) { phase=Phase::Lost; return; }
        }
        else if(T.kind==Kind::Hazard && std::abs(T.x-x)<T.size+.4) DamageArmy(T.value,T.x,0,T.id);
    }
}
void Battle::BossVolley()
{
    ++bossVolleys;
    if(level==0) SpawnEnemyShot(bossX,bossZ,bossLane,8,.38,22,ProjectileKind::Shell,true);
    else if(level==1) for(int I=-2;I<=2;++I)
        SpawnEnemyShot(bossX+I*.45,bossZ,std::clamp(bossLane+I*1.2,-3.6,3.6),6,.22,9,ProjectileKind::Orb,true);
    else for(int I=-1;I<=1;++I)
        SpawnEnemyShot(bossX+I*.75,bossZ,std::clamp(bossLane+I*.7,-3.4,3.4),7,.3,15,ProjectileKind::Rocket,true);
    Emit(EffectKind::BossShot,bossX,bossZ,level,0,3,2.4);
}
void Battle::BeginBossDeath()
{
    if(phase!=Phase::Boss) return;
    phase=Phase::Destroying; bossHp=0; bossAction=BossAction::Dying; bossAttack=0; deathClock=deathProgress=0;
    for(auto& S:shots) S.active=false; for(auto& S:enemyShots) S.active=false;
    Emit(EffectKind::BossDeath,bossX,bossZ,0,0,3,2.4);
}
void Battle::BossStep(double Dt)
{
    bossAge+=Dt; const double Cycle=std::fmod(bossAge,16.);
    const double DesiredZ=Cycle>5 && Cycle<9?8.5:12.;
    bossZ+=std::clamp(DesiredZ-bossZ,-2.2*Dt,2.2*Dt); bossX=1.8*std::sin(bossAge*.62);
    bossAction=std::abs(DesiredZ-bossZ)>.1?(DesiredZ<bossZ?BossAction::Advance:BossAction::Retreat):BossAction::Strafe;
    firePose=std::max(0.,firePose-Dt); bossClock+=Dt*(ability>0 && relic==Relic::EMP?.5:1);
    if(bossClock>=2.4 && !bossLaneLocked) { bossLane=std::clamp(x,-3.,3.); bossLaneLocked=true; }
    bossAttack=bossLaneLocked?std::clamp((bossClock-2.4)/1.,0.,1.):0;
    if(bossLaneLocked) bossAction=BossAction::Windup;
    if(bossClock>=3.4)
    {
        BossVolley(); firePose=.35; bossClock=-.3; bossLaneLocked=false; bossAttack=1;
    }
    if(firePose>0) { bossAction=BossAction::Fire; bossAttack=1; }
}
void Battle::Step(double Dt)
{
    time+=Dt;
    if(phase==Phase::Destroying)
    {
        deathClock+=Dt; deathProgress=std::min(1.,deathClock/2.5);
        if(deathClock+1e-9>=2.5) { phase=Phase::Won; score+=200+level*100; Emit(EffectKind::Win,bossX,bossZ,score,0,3,2.4); }
        return;
    }
    ability=std::max(0.,ability-Dt); x+=std::clamp(desiredX-x,-9*Dt,9*Dt);
    if(phase==Phase::Boss) BossStep(Dt);
    if(phase==Phase::Run)
    {
        engagement=HasBlockingTargets();
        const double Delta=engagement?0:std::min(3.7*Dt,travelGoal-travelDistance);
        travelDistance+=Delta; SpawnTimeline(); MoveTargets(Dt,Delta);
        if(phase==Phase::Lost) return;
    }
    fireClock+=Dt; const double Cadence=(.30-(weapon-1)*.025)/(ability>0 && relic==Relic::Overdrive?1.6:1);
    while(fireClock>=Cadence) { fireClock-=Cadence; Fire(); }
    MoveShots(Dt);
    if(phase==Phase::Destroying) return;
    if(phase==Phase::Run || phase==Phase::Boss) MoveEnemyShots(Dt);
    if(phase==Phase::Run && travelDistance+1e-8>=travelGoal)
    {
        bool EnemiesRemain=false; for(const auto& T:targets) if(T.active && T.kind==Kind::Enemy) { EnemiesRemain=true; break; }
        if(!EnemiesRemain)
        {
            phase=Phase::Boss; bossHp=bossMax; bossClock=bossAge=0; bossLaneLocked=false; engagement=false;
            // Only optional props can remain; every enemy was actually defeated.
            for(auto& T:targets) if(T.active) { Emit(EffectKind::Missed,T.x,T.z,0,T.id,T.variant,T.size); T.active=false; }
            for(auto& S:shots) S.active=false; for(auto& S:enemyShots) S.active=false;
        }
    }
}
}
