#include "AssaultSimulation.h"

namespace mech::assault
{
// Swept footprint, with measured side and forward extents. Weapons and spikes
// participate in enemy contact without inflating their sideways footprint.
static double SweepEllipse(double X0,double Z0,double X1,double Z1,double X,double Z,double Width,double Depth)
{
    const double Rx=(X0-X)/Width,Rz=(Z0-Z)/Depth,Dx=(X1-X0)/Width,Dz=(Z1-Z0)/Depth;
    const double A=Dx*Dx+Dz*Dz,B=2*(Rx*Dx+Rz*Dz),C=Rx*Rx+Rz*Rz-1;
    if(C<=0) return 0;
    const double Disc=B*B-4*A*C;
    if(A<1e-12 || Disc<0) return 2;
    const double F=(-B-std::sqrt(Disc))/(2*A);
    return F>=0&&F<=1?F:2;
}
static double SweepBox(double X0,double Z0,double X1,double Z1,double X,double Z,double Width,double Depth)
{
    double Near=0,Far=1;
    auto Slab=[&](double Start,double Delta,double Min,double Max)
    {
        if(std::abs(Delta)<1e-12) return Start>=Min && Start<=Max;
        double A=(Min-Start)/Delta,B=(Max-Start)/Delta; if(A>B) std::swap(A,B);
        Near=std::max(Near,A); Far=std::min(Far,B); return Near<=Far;
    };
    return Slab(X0,X1-X0,X-Width,X+Width)&&Slab(Z0,Z1-Z0,Z-Depth,Z+Depth)?Near:2;
}
const char* Battle::LevelName() const
{
    static constexpr const char* Names[]={"Reactor Siege","Roller Foundry","Citadel Breach"};
    return Names[std::clamp(level,0,2)];
}
void Battle::Start(Relic Equipped,int Level,int Rank)
{
    *this=Battle{}; level=std::clamp(Level,0,2); rank=std::clamp(Rank,0,5);
    duration=level==0?63:55+level*5; travelGoal=duration*3.7; bossArmorMax=level==0?1850:1850+level*450; bossCoreMax=level==0?700:600+level*130; bossCoreHp=bossCoreMax; bossMax=bossArmorMax+bossCoreMax;
    army=8+rank*2; visualStrength=army-1; formationSpan=std::min(24,army-1);
    for(int I=0;I<formationSpan;++I) formationAlive[I]=true;
    commanderHp=commanderMaxHp=100+rank*5; relic=Equipped; phase=Phase::Run;
    if(rank>0) { starterWeapon=weaponPower=rank==1?WeaponPower::Cannons:rank==2?WeaponPower::Guided:WeaponPower::Railburst; powerTime=0; }
    GatePair(0,40);
    for(double Lane:{-1.8,0.,1.8}) Spawn(Kind::Enemy,Lane,42,level==0?8:5+level,level==0?2:1,0,.3);
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
        if(phase==Phase::Won || phase==Phase::Lost || phase==Phase::LastStand) { accumulator=0; break; }
    }
}
void Battle::Charge(double Amount) { if(ability<=0) energy=std::min(100.,energy+Amount); }
bool Battle::Activate()
{
    if(paused || energy<100 || ability>0 || (phase!=Phase::Run && phase!=Phase::Boss)) return false;
    energy=0; ability=relic==Relic::Overdrive?5:relic==Relic::EMP?2:4;
    Emit(EffectKind::Relic,x,0,int(relic),0,-2,relic==Relic::EMP?3.2:1.5);
    if(relic==Relic::EMP)
    {
        empPulseTime=.65; empStunTime=2.; Emit(EffectKind::EmpPulse,x,0,2,0,-2,26);
        for(auto& T:targets) if(T.active && T.op==0 && T.kind==Kind::Enemy && T.z>=-4 && T.z<=26 && std::abs(T.x)<=5)
        {
            if(T.variant==0) HitTarget(T,T.hp,FriendlyKind::Pulse,true);
            else
            {
                HitTarget(T,std::min(T.maxHp*.45,20.+weapon*6.),FriendlyKind::Pulse,true);
                if(T.active) { T.stunTime=2.; T.fireState=FireState::Reload; T.fireClock=T.charge=0; Emit(EffectKind::EmpStun,T.x,T.z,2,T.id,T.variant,T.size); }
            }
        }
        for(auto& S:enemyShots) if(S.active)
        { S.active=false; Emit(EffectKind::EmpClear,S.x,S.z,1,S.id,int(S.kind),S.radius); }
        for(auto& L:lasers) if(L.active)
        { L.active=false; Emit(EffectKind::EmpClear,L.x,L.z,1,L.id,3,L.width); }
        if(phase==Phase::Boss && bossZ<=26)
        {
            DamageBoss(60.,bossX); bossLaneLocked=false; bossClock=-.5; firePose=0; sweepIndex=-1; bossAttack=0; bossAction=BossAction::Strafe;
            Emit(EffectKind::EmpStun,bossX,bossZ,2,0,3,2.4);
        }
    }
    return true;
}
bool Battle::CanHeal() const { return !paused && (phase==Phase::Run || phase==Phase::Boss) && healUsesRemaining>0 && army>=21 && commanderHp<=commanderMaxHp-10; }
bool Battle::CanRevive() const { return phase==Phase::LastStand && !reviveUsed && army>=31; }
void Battle::Sacrifice(int Cost)
{
    const int Before=army; army-=Cost;
    ResizeFormation(visualStrength*(army-1.)/std::max(1,Before-1),x,0,EffectKind::TroopSacrifice);
}
bool Battle::Heal()
{
    if(!CanHeal()) return false;
    Sacrifice(20); --healUsesRemaining; const double Before=commanderHp;
    commanderHp=std::min(commanderMaxHp,commanderHp+25);
    Emit(EffectKind::Heal,x,0,int(commanderHp-Before),0,-5,1); return true;
}
bool Battle::Revive()
{
    if(!CanRevive()) return false;
    Sacrifice(30); reviveUsed=true; commanderHp=std::min(commanderMaxHp,50.); reviveProtection=1.5;
    phase=resumePhase; paused=false; accumulator=0; Emit(EffectKind::Revive,x,0,50,0,-5,1.2); return true;
}
void Battle::FinalDefeat()
{
    commanderHp=0; army=0; formationAlive.fill(false); visualStrength=0; phase=Phase::Lost;
    Emit(EffectKind::CommanderDeath,x,0,0,0,-5,1.2);
}
bool Battle::DeclineRevive() { if(phase!=Phase::LastStand) return false; FinalDefeat(); return true; }
int Battle::BossPart() const { return (bossPartsMask&3)!=3?0:(bossPartsMask&12)!=12?1:(bossPartsMask&48)!=48?2:3; }
double Battle::BossPartHp() const
{
    const double Initial=(level==0?1850:1850+level*450);
    return BossPart()==0?std::max(0.,bossArmor-Initial*.65):BossPart()==1?std::max(0.,bossArmor-Initial*.30):BossPart()==2?bossArmor:bossCoreHp;
}
double Battle::BossPartMax() const { return BossPart()==3?bossCoreMax:((level==0?1850:1850+level*450))*(BossPart()==2?.30:.35); }
void Battle::BreakBossParts()
{
    if(bossRevives>0) return;
    const double Initial=(level==0?1850:1850+level*450);
    const int Previous=bossPartsMask;
    int Wanted=bossArmor<=1e-8?63:bossArmor<=Initial*.30?15:bossArmor<=Initial*.65?3:0;
    for(int I=0;I<6;++I) if((Wanted&(1<<I)) && !(bossPartsMask&(1<<I)))
    { bossPartsMask|=1<<I; Emit(EffectKind::BossPartBreak,bossX,bossZ,I+1,0,3,2.7); }
    // Losing the emitter interrupts a committed charge rather than preserving
    // a misleading rocket/cannon cue for a replacement source.
    const bool LostCannon=(Previous&3)!=3 && (bossPartsMask&3)==3 && bossPattern==BossPattern::Heavy;
    const bool LostSweep=(Previous&3)!=3 && (bossPartsMask&3)==3 && bossPattern==BossPattern::Sweep;
    const bool LostJets=(Previous&12)!=12 && (bossPartsMask&12)==12 && bossPattern==BossPattern::Rockets;
    if(LostCannon || LostJets || LostSweep) { bossPattern=LostJets?BossPattern::Sweep:BossPattern::Laser; bossLaneLocked=false; bossClock=-.3; bossAttack=0; firePose=0; sweepIndex=-1; }
    if((bossPartsMask&48)==48) bossY=-2.55; else if((bossPartsMask&12)==12) bossY=.02;
}
int Battle::TargetCount() const { int N=0; for(const auto& T:targets) if(T.active) ++N; return N; }
int Battle::ShotCount() const { int N=0; for(const auto& S:shots) if(S.active) ++N; return N; }
int Battle::EnemyShotCount() const { int N=0; for(const auto& S:enemyShots) if(S.active) ++N; return N; }
int Battle::PickupCount() const { int N=0; for(const auto& P:pickups) if(P.active) ++N; return N; }
void Battle::Emit(EffectKind Type,double X,double Z,int Value,int EntityId,int Variant,double Size)
{
    if(effectCount==MaxEffects) { for(int I=1;I<MaxEffects;++I) effects[I-1]=effects[I]; --effectCount; }
    effects[effectCount++]={nextEffectId++,Type,X,Z,Value,EntityId,Variant,Size};
}
void Battle::Spawn(Kind Type,double X,double Z,double Hp,int Value,int Op,double Size,int Variant,double Motion)
{
    for(auto& T:targets) if(!T.active)
    {
        T={nextTargetId++,Type,X,Z,Hp,Hp,Size,0,Value,Op,Variant,true,X,Motion,.8+level*.18,0};
        if(Type==Kind::Enemy) { T.size=Variant==1?1.1:Variant==2?1.:.44; T.depth=Variant>0?1.:.73; }
        else T.depth=Type==Kind::Gate?.14:Size; return;
    }
}
void Battle::GatePair(int Index,double Forward)
{
    if(level==0)
    {
        const int Left=Index==0?12:Index==1?18:18,Right=Index==0?8:Index==1?12:2;
        Spawn(Kind::Gate,-1.8,Forward,0,Left,0,1.2);
        Spawn(Kind::Gate,1.8,Forward,0,Right,Index==2?1:0,1.2);
        return;
    }
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
    const double EliteX=Formation==1?-1.8:Formation==2?1.8:0,GunnerX=EliteX<=0?2.5:-2.5;
    for(int Row=0;Row<Rows;++Row)
    {
        for(int Col=0;Col<8;++Col)
        {
            const double Lane=-3.325+Col*.95;
            if(Row==0 && (std::abs(Lane-EliteX)<1.69 || (level==2 && std::abs(Lane-GunnerX)<1.69))) continue;
            Spawn(Kind::Enemy,Lane,Forward+Row*2.05,Hp,Threat,0,.44);
        }
        if(Row==0) { Spawn(Kind::Enemy,EliteX,Forward,Hp*5,Threat+2,0,1.1,1); if(level==2) Spawn(Kind::Enemy,GunnerX,Forward,Hp*3,Threat+1,0,1.,2); }
    }
}
void Battle::SpawnTimeline()
{
    if(level==0) { SiegeTimeline(); return; }
    // Continuous traversal drives authored spacing; every spawn enters from far ahead.
    const double Progress=travelDistance/3.7;
    auto At=[&](int Id,double When)
    {
        const uint64_t Bit=uint64_t(1)<<Id;
        if(Progress+1e-9<When || (spawned&Bit)) return false;
        spawned|=Bit; return true;
    };
    // Four staggered beats per section give weapons, gates and formations room.
    for(int I=1;I<=7;++I) if(I*8<duration-10 && At(I-1,I*8)) GatePair(I);
    for(int I=0;I<7;++I) if(1.8+I*8<duration-10 && At(12+I,1.8+I*8))
        Spawn(Kind::Crate,(I+level)%2?1.8:-1.8,40,20+I*5+level*2,45,0,.55,-1);
    for(int I=0;I<7;++I) if(4+I*8<duration-10 && At(22+I,4+I*8))
        Wave(I%2==0?3:2,5+I*.9+level*.65,1+I/3,(I+level)%3,42);
    for(int I=0;I<7;++I) if(6.2+I*8<duration-8 && At(36+I,6.2+I*8))
        Spawn(Kind::Orb,I%2?1.8:-1.8,40,12+level*2,1+I%6,0,.55,-3,.35);
    for(int I=0;I<4;++I) if(6.8+I*16<duration-10 && At(44+I,6.8+I*16))
        Spawn(Kind::Hazard,I%2?1.8:-1.8,40,0,16+level*3+I*2,0,.95,0,.65+level*.25);

}
// One authored approach; times are traversal seconds. All new objects enter
// from the horizon. No random loot, bell cycling or hidden spawn catch-up.
void Battle::SpawnRanged(double Lane,double Hp,bool Battery,double Delay)
{
    const int Id=nextTargetId; Spawn(Kind::Enemy,Lane,42,Hp,Battery?8:7,0,1.,2);
    for(auto& T:targets) if(T.active && T.id==Id) { T.role=Battery?2:1; T.fireDelay=Delay; }
}
void Battle::SpawnCarrier(double Lane,double Hp,int Power)
{
    const int Id=nextTargetId; Spawn(Kind::Enemy,Lane,42,Hp,5,0,1.1,1);
    for(auto& T:targets) if(T.active && T.id==Id) { T.role=3; T.dropPower=Power; }
}
void Battle::SiegeTimeline()
{
    const double P=travelDistance/3.7;
    auto At=[&](int Id,double When) { const uint64_t Bit=uint64_t(1)<<Id; if(P+1e-9<When || (spawned&Bit)) return false; spawned|=Bit; return true; };
    if(At(0,1.)) Wave(1,7,1,1);
    if(At(1,8.)) SpawnRanged(2.6,40);
    if(At(2,4.)) Spawn(Kind::Crate,-1.8,40,25,45,0,.55,-1);
    if(At(3,10.)) Wave(2,8,2,0);
    if(At(4,12.)) SpawnRanged(-2.6,55);
    if(At(5,15.)) SpawnCarrier(-1.8,65,2);
    if(At(6,17.5)) { SpawnRanged(-2.6,75,true); SpawnRanged(2.6,75,true,3.8); }
    if(At(7,23.)) Spawn(Kind::Crate,1.8,40,65,75,0,.55,-1);
    if(At(8,26.)) GatePair(1);
    if(At(9,30.5)) Wave(2,8,2,2);
    if(At(10,32.)) SpawnRanged(-2.6,60);
    if(At(11,35.)) Spawn(Kind::Hazard,1.8,40,0,14,0,.85,0,.35);
    if(At(12,39.)) Spawn(Kind::Crate,0,40,80,90,0,.55,-1);
    if(At(13,40.)) GatePair(2);
    if(At(14,43.)) SpawnRanged(2.6,80);
    if(At(15,47.)) SpawnCarrier(1.8,85,1);
    if(At(16,48.5)) Wave(2,9,2,0);
}
namespace
{
formation_safety::Hazard PlannedRound(double X,double Z,double Aim,double Speed,double Radius,double Start)
{
    formation_safety::Hazard H;
    const double L=std::hypot(Aim-X,Z);
    H.x=X; H.z=Z; H.vx=(Aim-X)/L*Speed; H.vz=-Z/L*Speed;
    // Fixed-step birth quantization can shift a nominal burst by <=2 ticks.
    // Inflate only the query envelope, never projectile damage/collision size.
    H.radiusX=Radius+std::abs(H.vx)*.04; H.radiusZ=Radius+std::abs(H.vz)*.04; H.start=Start;
    // Include every possible rear slot and its complete combined-radius exit.
    H.end=Start+(Z+3.15+.36+H.radiusZ+.02)/std::max(.001,-H.vz);
    return H;
}
}
bool Battle::AdmitAttack(const formation_safety::Hazard* Proposed,int Count,int Source)
{
    using namespace formation_safety;
    double Horizon=0; for(int I=0;I<Count;++I) Horizon=std::max(Horizon,Proposed[I].end);
    safetyHorizon=Horizon;
    auto Unsupported=[&](){++safetyDeferred; ++safetyUnsupported; return false;};
    if(Horizon>6 || Horizon<=0 || timePower!=TimePower::None || empStunTime>0) return Unsupported();
    bool Growth=false;
    for(const auto& T:targets) if(T.active && T.kind==Kind::Gate && T.z>0 && T.z/3.7<=Horizon) Growth=true;
    std::array<Body,25> Bodies{}; int NB=0; Bodies[NB++]={0,0,.4,-3,3};
    const int Columns=std::min(4,formationSpan); const double Limit=std::max(.3,3.9-(Columns-1)*.365);
    if(Growth)
    {
        // A crossing can restore slots or change a partial row's centering.
        // Six rectangular row envelopes contain every possible recruited slot.
        // Their inflated Z extent is deliberately conservative, never narrower
        // than the actual live formation. Current stage starts with >=4 slots.
        if(Columns!=4)return Unsupported();
        for(int Row=0;Row<6;++Row) Bodies[NB++]={0,-(.75+Row*.48),1.095+.36,-Limit,Limit};
    }
    else for(int I=0;I<formationSpan;++I) if(formationAlive[I])
    {
        const int Row=I/std::max(1,Columns),Width=std::min(Columns,formationSpan-Row*Columns);
        Bodies[NB++]={(I%std::max(1,Columns)-(Width-1)*.5)*.73,-(.75+Row*.48),.36,-Limit,Limit};
    }
    std::array<Hazard,MaxExisting> Existing{}; int NE=0;
    auto Add=[&](const Hazard& H){if(NE==MaxExisting)return false; Existing[NE++]=H; return true;};
    for(const auto& S:enemyShots) if(S.active)
    {
        if(S.homing>0) return Unsupported();
        Hazard H; H.x=S.x; H.z=S.z; H.vx=S.dx; H.vz=S.dz; H.radiusX=H.radiusZ=S.radius;
        H.end=std::max(0.,(S.z+3.15+.36+S.radius+.02)/std::max(.001,-S.dz));
        if(!Add(H)){++safetyCapacity;++safetyDeferred;return false;}
    }
    for(const auto& L:lasers) if(L.active)
    { Hazard H; H.trajectory=Trajectory::Beam; H.x=L.x;H.z=L.z;H.endX=L.endX;H.endZ=L.endZ;H.radiusX=L.width*.5;H.end=L.time; if(!Add(H))return Unsupported(); }
    for(const auto& T:targets) if(T.active)
    {
        if(T.kind==Kind::Hazard)
        {
            Hazard H; H.trajectory=Trajectory::Roller; H.x=T.originX;H.z=T.z;H.vz=-3.7;H.radiusX=T.size*1.048;H.radiusZ=.80;
            H.amplitude=T.motion;H.phase=T.motionPhase+T.id*.37;H.frequency=T.motionRate;
            H.end=std::max(0.,(T.z+3.15+.36+.80+.02)/3.7);
            if(!Add(H))return Unsupported();
        }
        // Actual approach may queue or freeze, so a single velocity would lie.
        // Bound its entire possible forward occupancy over this horizon instead.
        // This swept rectangle is stationary in the query and conservatively
        // includes all queue delays. Actual death/sideways retirement only removes
        // a front obstacle; retired bodies stay >=1.8, ahead of all troop rows.
        if(T.kind==Kind::Enemy && T.op==0 && T.id!=Source)
        {
            double Hold=0;
            if(T.role==1 || T.role==2)
            {
                if(T.fireState==FireState::Locked)Hold=std::max(0.,.95-T.fireClock)+.36;
                else if(T.fireState==FireState::Fire)Hold=std::max(0.,.18-T.fireClock)+std::max(0,2-T.burst)*.18;
            }
            const double Distance=3.95*std::max(0.,Horizon-Hold);
            if(T.z-Distance-T.depth<=.4)
            {
                Hazard H;H.x=T.x;H.z=T.z-Distance*.5;H.radiusX=T.size;H.radiusZ=T.depth+Distance*.5;H.end=Horizon;
                if(!Add(H))return Unsupported();
            }
        }
        if(T.id!=Source && T.active && T.op==0 && (T.role==1 || T.role==2) && (T.fireState==FireState::Locked || T.fireState==FireState::Fire))
        {
            const int Begin=T.fireState==FireState::Fire?T.burst:0;
            const double First=T.fireState==FireState::Locked?std::max(0.,.95-T.fireClock):std::max(0.,.18-T.fireClock);
            for(int I=Begin;I<3;++I) if(!Add(PlannedRound(T.x,T.z-.35,T.aimX+(I-1)*.22,7.5,.20,First+(I-Begin)*.18)))return Unsupported();
        }
    }
    Query Q;Q.commanderX=x;Q.maxSpeed=5;Q.reactionTime=.25;Q.horizon=Horizon;Q.bodies=Bodies.data();Q.bodyCount=NB;
    Q.existing=Existing.data();Q.existingCount=NE;Q.proposed=Proposed;Q.proposedCount=Count;
    // No shifted-source approximation: a failed proposal is re-predicted later.
    const auto R=formation_safety::AdmitAttack(Q,safetyWorkspace);
    if(R.decision==Decision::Admit){++safetyAdmitted;return true;}
    ++safetyDeferred;
    if(R.decision==Decision::ExistingUnsafe)++safetyExistingUnsafe;
    else if(R.decision==Decision::CapacityExceeded)++safetyCapacity;
    else if(R.decision==Decision::Unsupported || R.decision==Decision::InvalidInput)++safetyUnsupported;
    return false;
}
bool Battle::AdmitRanged(const Target& T)
{
    std::array<formation_safety::Hazard,3> H{};
    for(int I=0;I<3;++I)H[I]=PlannedRound(T.x,T.z-.35,T.aimX+(I-1)*.22,7.5,.20,.95+I*.18);
    return AdmitAttack(H.data(),3,T.id);
}
bool Battle::AdmitBoss(double Windup,double Aim)
{
    using namespace formation_safety;
    // Homing is deliberately not substituted with a locked ray. Rockets retain
    // an exclusive authored window, and never overlap a live ballistic threat.
    if(bossPattern==BossPattern::Rockets)
    {
        bool Busy=false;for(const auto& S:enemyShots)Busy|=S.active;for(const auto& L:lasers)Busy|=L.active;
        if(Busy){++safetyDeferred;++safetyUnsupported;return false;}
        ++safetyAuthoredRockets;return true;
    }
    std::array<Hazard,5> H{};int N=0;
    if(bossPattern==BossPattern::Laser)
    {
        H[0].trajectory=Trajectory::Beam;H[0].x=bossX;H[0].z=bossZ-.85;H[0].endZ=-5;
        H[0].endX=bossX+(Aim-bossX)*(H[0].z+5)/H[0].z;H[0].radiusX=.18;H[0].start=Windup;H[0].end=Windup+.52;N=1;
    }
    else
    {
        const double Boost=bossPhase==2?1.20:1;
        const int Count=bossPattern==BossPattern::Heavy?1:5;
        for(int I=0;I<Count;++I)
        {
            WeaponEmitter E=Count==1?((bossVolleys+1)%2?WeaponEmitter::ArmL:WeaponEmitter::ArmR):(I%2?WeaponEmitter::ArmR:WeaponEmitter::ArmL);
            if(E==WeaponEmitter::ArmL && (bossPartsMask&1)) E=(bossPartsMask&2)?WeaponEmitter::Core:WeaponEmitter::ArmR;
            if(E==WeaponEmitter::ArmR && (bossPartsMask&2)) E=(bossPartsMask&1)?WeaponEmitter::Core:WeaponEmitter::ArmL;
            const double X=E==WeaponEmitter::Core?0:E==WeaponEmitter::ArmL?1.72480:-1.72480,Z=E==WeaponEmitter::Core?-.847:-2.09960;
            H[N++]=PlannedRound(bossX+X,bossZ+Z,Count==1?Aim:std::clamp(Aim-.9+I*.45,-3.6,3.6),(Count==1?8.:7.)*Boost,Count==1?.58:.20,Windup+I*.14);
        }
    }
    return AdmitAttack(H.data(),N);
}
void Battle::RangedStep(Target& T,double Dt)
{
    if(T.op!=0 || T.z>28 || T.z<3) return;
    if(ability>0 && relic==Relic::EMP) { T.fireState=FireState::Reload; T.fireClock=0; T.charge=0; return; }
    const double D=Dt*HostileSpeed(); if(D<=0) return;
    if(T.fireDelay>0) { T.fireDelay=std::max(0.,T.fireDelay-D); T.fireState=FireState::Idle; return; }
    if(T.fireState==FireState::Idle) { T.fireState=FireState::Tracking; T.fireClock=0; }
    T.fireClock+=D;
    if(T.fireState==FireState::Tracking)
    {
        T.aimX=x; T.charge=std::min(.45,T.fireClock/.85*.45);
        if(T.fireClock>=.85) { if(AdmitRanged(T)) { T.fireState=FireState::Locked; T.fireClock=0; } else T.fireClock=.55; }
    }
    else if(T.fireState==FireState::Locked)
    {
        T.charge=.45+std::min(.55,T.fireClock/.95*.55);
        if(T.fireClock>=.95) { T.fireState=FireState::Fire; T.fireClock=.18; T.burst=0; }
    }
    else if(T.fireState==FireState::Fire)
    {
        if(T.fireClock>=.18)
        {
            T.fireClock-=.18; SpawnEnemyShot(T.x,T.z-.35,T.aimX+(T.burst-1)*.22,7.5,.20,T.role==2?6:5,ProjectileKind::Shell,false,T.id);
            Emit(EffectKind::EnemyFire,T.x,T.z-.35,T.role,T.id,2,1.);
            if(++T.burst==3) { T.fireState=FireState::Reload; T.fireClock=0; T.charge=0; }
        }
    }
    else if(T.fireClock>=(T.role==2?3.8:1.7)) { T.fireState=FireState::Tracking; T.fireClock=0; }
}
void Battle::TroopPosition(int Slot,double& X,double& Z) const
{
    const int Count=formationSpan,Columns=std::min(4,Count),Row=Slot/std::max(1,Columns);
    const int Width=std::min(Columns,Count-Row*Columns);
    const double Limit=std::max(.3,3.9-(Columns-1)*.365);
    X=std::clamp(x,-Limit,Limit)+(Slot%std::max(1,Columns)-(Width-1)*.5)*.73;
    Z=-(.75+Row*.48);
}
bool Battle::FormationHit(double X0,double Z0,double X1,double Z1,double Radius,bool Leader,int& Slot,double& HitX,double& HitZ,double Depth) const
{
    double Best=2; bool Found=false; const bool Box=Depth>=0; if(Depth<0) Depth=Radius;
    auto Body=[&](double X,double Z,double R,int Index)
    {
        const double F=Box?SweepBox(X0,Z0,X1,Z1,X,Z,Radius+R,Depth+R):SweepEllipse(X0,Z0,X1,Z1,X,Z,Radius+R,Depth+R);
        if(F<Best) { Best=F; Slot=Index; HitX=X; HitZ=Z; Found=true; }
    };
    if(Leader) Body(x,0,.4,-1);
    for(int I=0;I<24;++I) if(formationAlive[I]) { double X,Z; TroopPosition(I,X,Z); Body(X,Z,.36,I); }
    return Found;
}
void Battle::DamageCommander(int Damage)
{
    if(phase==Phase::Lost || phase==Phase::LastStand || Damage<=0) return;
    if(reviveProtection>0 || (ability>0 && relic==Relic::Shield)) { Emit(EffectKind::Block,x,0,Damage,0,-5,.6); if(reviveProtection<=0) Emit(EffectKind::ShieldHit,x,0,Damage,0,-5,.6); return; }
    if(weaponPower==WeaponPower::Escort && escortShield>0) { const int Block=std::min(Damage,escortShield); escortShield-=Block; Damage-=Block; Emit(EffectKind::EscortBlock,x,0,Block,0,-5,.6); if(Damage<=0)return; }
    const int Actual=std::min(int(std::ceil(commanderHp)),Damage);
    commanderHp=std::max(0.,commanderHp-Actual); Emit(EffectKind::CommanderHit,x,0,Actual,0,-5,.65);
    if(commanderHp<=0)
    {
        if(!reviveUsed && army>=31) { resumePhase=phase; phase=Phase::LastStand; Emit(EffectKind::CommanderDown,x,0,0,0,-5,1.2); }
        else FinalDefeat();
    }
}
void Battle::DamageArmy(int Loss,double AtX,double AtZ,int Attacker,int Slot)
{
    if(reviveProtection>0 || (ability>0 && relic==Relic::Shield)) { Emit(EffectKind::Block,AtX,AtZ,Loss,Attacker,-2,.45); if(reviveProtection<=0) Emit(EffectKind::ShieldHit,AtX,AtZ,Loss,Attacker,-2,.45); return; }
    if(weaponPower==WeaponPower::Escort && escortShield>0) { const int Block=std::min(Loss,escortShield); escortShield-=Block; Loss-=Block; Emit(EffectKind::EscortBlock,AtX,AtZ,Block,Attacker,-2,.45); if(Loss<=0)return; }
    if(army<=1) { DamageCommander(Loss); return; }
    if(Slot<0)
    {
        double Best=1e9;
        for(int I=0;I<24;++I) if(formationAlive[I]) { double X,Z; TroopPosition(I,X,Z); const double D=std::hypot(X-AtX,Z-AtZ);
            if(D<Best) { Best=D; Slot=I; } }
        if(Slot>=0) TroopPosition(Slot,AtX,AtZ);
    }
    const int Before=army,Actual=std::min(army-1,std::max(0,Loss)); army-=Actual;
    ResizeFormation(visualStrength*(army-1.)/std::max(1,Before-1),AtX,AtZ);
    if(Actual>0) Emit(EffectKind::Damage,AtX,AtZ,Actual,Slot+1,-2,.45);
    commanderChip+=Actual*.10;
    const int Chip=int(commanderChip+1e-9); commanderChip-=Chip;
    if(Chip>0) DamageCommander(Chip);
}
void Battle::ResizeFormation(double Strength,double AtX,double AtZ,EffectKind Removed)
{
    visualStrength=std::clamp(Strength,0.,24.);
    const int Wanted=army<=1?0:std::min(army-1,std::max(1,int(std::ceil(visualStrength-1e-9))));
    int Count=0; for(bool Alive:formationAlive) Count+=Alive;
    while(Count>Wanted)
    {
        int Nearest=-1; double Best=1e9;
        for(int I=0;I<24;++I) if(formationAlive[I]) { double X,Z; TroopPosition(I,X,Z); const double D=std::hypot(X-AtX,Z-AtZ); if(D<Best){Best=D;Nearest=I;} }
        if(Nearest<0) break;
        double X,Z; TroopPosition(Nearest,X,Z); formationAlive[Nearest]=false; --Count;
        Emit(Removed,X,Z,1,Nearest+1,-2,.45);
    }
    for(int I=0;I<24 && Count<Wanted;++I) if(!formationAlive[I]) { formationAlive[I]=true; ++Count; formationSpan=std::max(formationSpan,I+1); }
}
void Battle::Recruit(int Gain)
{
    const int Before=army; army=std::min(160,army+std::max(0,Gain));
    ResizeFormation(visualStrength+(army-Before)*24./std::max(24,army-1),x,0);
}
double Battle::HostileSpeed() const
{
    double Speed=timePower==TimePower::Freeze?0:timePower==TimePower::Slow?.5:timePower==TimePower::Haste?1.35:1;
    if(empStunTime>0) Speed=0;
    return Speed;
}
void Battle::UpdateBossHealth() { bossHp=bossArmor+bossCoreHp; }
void Battle::DamageBoss(double Damage,double AtX,FriendlyKind WeaponKind)
{
    if(phase!=Phase::Boss || bossState==BossState::Rebuilding) return;
    const bool CoreHit=bossState==BossState::Exposed;
    double Actual=0;
    if(bossState==BossState::Armored)
    {
        if(level==0)
        {
            const double Efficiency=WeaponKind==FriendlyKind::Cannon?.70:WeaponKind==FriendlyKind::Missile?.60:WeaponKind==FriendlyKind::Rail?1.10:1.20;
            Actual=std::min(bossArmor,Damage*Efficiency);
        }
        else Actual=std::min({bossArmor,Damage*(bossRevives?.50:.65),armorBudget});
        bossArmor-=Actual; if(level!=0) armorBudget-=Actual; BreakBossParts();
        if(bossArmor<=1e-8)
        {
            bossArmor=0; bossState=BossState::Exposed; bossCoreTime=level==0?5.0:bossRevives?0:6.5;
            if(level==0) { sweepIndex=-1; bossLaneLocked=false; firePose=0; bossClock=0; bossAction=BossAction::Strafe; bossAttack=0; }
            Emit(EffectKind::CoreExpose,bossX,bossZ,int(bossCoreTime*10),0,4,.9);
        }
    }
    else if(bossState==BossState::Exposed && std::abs(AtX-bossX)<.9)
    {
        const double Weakness=level==0?(WeaponKind==FriendlyKind::Missile?.80:WeaponKind==FriendlyKind::Cannon?1.4:WeaponKind==FriendlyKind::Rail?1.7:2.0):.95;
        Actual=std::min(bossCoreHp,Damage*Weakness); bossCoreHp-=Actual;
    }
    if(Actual>0) { Charge(Actual*(level==0?.07:.12)); Emit(EffectKind::Hit,AtX,bossZ,int(std::ceil(Actual)),0,CoreHit?4:3,CoreHit?.9:2.4); }
    if(level==0 && Actual<=0) Emit(EffectKind::Hit,AtX,bossZ,0,0,3,2.4);
    UpdateBossHealth();
    if(bossCoreHp<=0) BeginBossDeath();
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
    const int Count=level==0?std::clamp(4+army/10+(weaponPower==WeaponPower::Cannons?2:0),4,weaponPower==WeaponPower::Cannons?12:10):std::clamp(5+army/16+(weaponPower==WeaponPower::Cannons?4:0),5,weaponPower==WeaponPower::Cannons?16:12);
    static constexpr double Damage[]={0,1.5,2.2,3.0,4.4};
    const double Boost=(ability>0 && relic==Relic::Overdrive?(level==0?1.25:1.8):1)*(1+rank*.03);
    std::array<Target*,MaxTargets> Candidates{}; int CandidateCount=0;
    for(auto& T:targets) if(weaponPower==WeaponPower::Guided && T.active && T.hp>0 && (T.kind==Kind::Enemy || T.kind==Kind::Orb) && T.z>.8 && T.z<28)
    {
        Candidates[CandidateCount++]=&T;
    }
    std::sort(Candidates.begin(),Candidates.begin()+CandidateCount,[&](const Target* A,const Target* B)
    { return A->z+std::abs(A->x-x)*1.4 < B->z+std::abs(B->x-x)*1.4; });
    const int Spread=std::max(1,std::min(6,CandidateCount));
    std::array<int,24> AliveSlots{}; int Alive=0;
    for(int I=0;I<24;++I) if(formationAlive[I]) AliveSlots[Alive++]=I;
    for(int I=0;I<Count;++I) for(auto& S:shots) if(!S.active)
    {
        double Origin=std::clamp(x+(I==0?-.16:.16),-3.4,3.4),OriginZ=.4;
        const bool Troop=I>=2 && Alive>0;
        if(Troop) { const int Slot=AliveSlots[(I-2)*Alive/std::max(1,Count-2)]; TroopPosition(Slot,Origin,OriginZ); }
        else if(I>=2) Origin=std::clamp(x+(I-(Count-1)*.5)*.17,-3.4,3.4);
        double AimX=Origin,AimZ=25;
        if(weaponPower==WeaponPower::Guided && phase==Phase::Boss) { AimX=bossX+(I-(Count-1)*.5)*.27; AimZ=bossZ; }
        else if(CandidateCount) { const Target* T=Candidates[I%Spread]; AimX=T->x; AimZ=T->z; }
        const double Length=std::hypot(AimX-Origin,AimZ-OriginZ);
        const bool Guided=weaponPower==WeaponPower::Guided,Rail=weaponPower==WeaponPower::Railburst;
        const double Speed=Rail?48:Guided?28:32;
        const FriendlyKind Type=Guided?FriendlyKind::Missile:Rail?FriendlyKind::Rail:weaponPower==WeaponPower::Cannons?FriendlyKind::Cannon:weapon>=3?FriendlyKind::Arc:FriendlyKind::Pulse;
        S={Origin,OriginZ,Guided?(AimX-Origin)/Length*Speed:0,Guided?(AimZ-OriginZ)/Length*Speed:Speed,
            (Rail?Damage[weapon]*(level==0?1.35:1.7):Guided?Damage[weapon]*(level==0?1.15:1.4):Damage[weapon])*Boost,
            Guided||Rail,true,Type,Rail?5:1,0,Troop}; break;
    }
}
void Battle::HitTarget(Target& T,double Damage,FriendlyKind WeaponKind,bool IgnoreArmor)
{
    if(!T.active || T.hp<=0 || Damage<=0) return;
    if(level==0 && WeaponKind==FriendlyKind::Missile && (T.role==1 || T.role==2) && (T.fireState==FireState::Tracking || T.fireState==FireState::Locked)) Damage*=T.role==2?.35:.45;
    if(level==0 && T.role==3 && !IgnoreArmor) Damage*=T.ventOpen?2.1:.60;
    const double Before=T.hp; T.hp=std::max(0.,T.hp-Damage); const double Actual=Before-T.hp; T.hit=.12;
    Emit(EffectKind::Hit,T.x,T.z,std::max(1,int(std::ceil(Actual))),T.id,T.variant,T.size);
    Charge(Actual*(level==0?.07:.18));
    if(T.kind==Kind::Gate)
    {
        if(T.op==0) T.value=std::min(32,T.value+int((T.maxHp-T.hp)/4)-int((T.maxHp-Before)/4));
        else if(T.hp<=0) T.value=3;
        return;
    }
    if(T.hp>0) return;
    T.active=false; ++kills; const int BaseReward=T.kind==Kind::Crate?30:T.kind==Kind::Orb?35:10+T.variant*10; const int Reward=timePower==TimePower::Haste?int(BaseReward*1.5):BaseReward; score+=Reward;
    Charge(level==0?(T.kind==Kind::Crate?8:T.role==3?8:T.variant>0?4:2):(T.kind==Kind::Crate || T.kind==Kind::Orb?15:5));
    Emit(EffectKind::Kill,T.x,T.z,Reward,T.id,T.variant,T.size);
    if(T.kind==Kind::Crate) AwardWeaponXP(timePower==TimePower::Haste?int(T.value*1.25):T.value);
    if(level==0 && T.role==3)
    {
        if(T.dropPower==2) { DropPickup(-2.,std::max(.9,T.z),PickupKind::Cannons,T.id,T.id); DropPickup(2.,std::max(.9,T.z),PickupKind::Railburst,T.id,T.id); }
        else { DropPickup(-2.,std::max(.9,T.z),PickupKind::Guided,T.id,T.id); DropPickup(2.,std::max(.9,T.z),PickupKind::Escort,T.id,T.id); }
    }
    else if(level!=0 && (T.kind==Kind::Orb || (T.kind==Kind::Enemy && T.variant>0)))
        DropPickup(T.x,std::max(.9,T.z),static_cast<PickupKind>(T.kind==Kind::Orb?T.value:1+(T.id+level)%6),T.id);
}
void Battle::MoveShots(double Dt)
{
    for(auto& S:shots)
    {
        if(!S.active) continue;
        if(S.kind==FriendlyKind::Missile)
        {
            double AimX=S.x,AimZ=S.z+20,Best=1e9;
            if(phase==Phase::Boss && bossZ>S.z+.5) { AimX=bossX; AimZ=bossZ; }
            else for(const auto& T:targets) if(T.active && T.hp>0 && (T.kind==Kind::Enemy || T.kind==Kind::Orb) && T.z>S.z+.4 && T.z<28)
            {
                const double Distance=T.z-S.z+std::abs(T.x-S.x)*1.5;
                if(Distance<Best) { Best=Distance; AimX=T.x; AimZ=T.z; }
            }
            const double Length=std::hypot(AimX-S.x,AimZ-S.z);
            const double DesiredDx=(AimX-S.x)/Length*28;
            S.dx+=std::clamp(DesiredDx-S.dx,-70*Dt,70*Dt); S.dz=std::sqrt(std::max(16.,28*28-S.dx*S.dx));
        }
        const double BeforeZ=S.z,BeforeX=S.x; S.z+=S.dz*Dt; S.x+=S.dx*Dt;
        Target* Nearest=nullptr; double Entry=2;
        for(auto& T:targets)
        {
            if(!T.active || T.hp<=0 || T.kind==Kind::Hazard || T.id==S.lastHit) continue;
            const double F=SweepEllipse(BeforeX,BeforeZ,S.x,S.z,T.x,T.z,T.size+.08,T.depth+.08);
            if(F<Entry) { Entry=F; Nearest=&T; }
        }
        if(Nearest)
        {
            const double HitX=Nearest->x,HitZ=Nearest->z; const int HitId=Nearest->id;
            HitTarget(*Nearest,S.damage,S.kind); S.lastHit=HitId;
            if((S.kind==FriendlyKind::Arc || S.kind==FriendlyKind::Missile) && Nearest->kind==Kind::Enemy)
                for(auto& T:targets) if(T.active && T.kind==Kind::Enemy && T.id!=HitId && std::hypot(T.x-HitX,T.z-HitZ)<.8)
                    HitTarget(T,S.damage*.45,S.kind);
            if(Nearest->kind!=Kind::Enemy || --S.pierce<=0) S.active=false;
        }
        else if(phase==Phase::Boss && BeforeZ<=bossZ+.8 && S.z>=bossZ-.8)
        {
            const double F=std::clamp((bossZ-BeforeZ)/(S.z-BeforeZ),0.,1.);
            const double HitX=BeforeX+(S.x-BeforeX)*F;
            if(std::abs(HitX-bossX)<2.4)
            {
                DamageBoss(S.damage,HitX,S.kind); S.active=false;
                if(phase==Phase::Destroying) return;
            }
        }
        if(S.z>28 || S.z< -5 || std::abs(S.x)>9) S.active=false;
    }
}
void Battle::SpawnEnemyShot(double OriginX,double OriginZ,double AimX,double Speed,double Radius,int Damage,ProjectileKind Type,bool Boss,int Source,WeaponEmitter Emitter,double LaunchHeight)
{
    const double Offset=AimX-OriginX,Length=std::hypot(Offset,OriginZ);
    for(auto& S:enemyShots) if(!S.active)
    { S={nextEnemyShotId++,OriginX,OriginZ,Offset/Length*Speed,-OriginZ/Length*Speed,Radius,Damage,Type,true,Boss,Type==ProjectileKind::Rocket&&Boss?.7:0,Source,Emitter,OriginX,OriginZ,LaunchHeight}; return; }
}
void Battle::MoveEnemyShots(double Dt)
{
    const double Slow=HostileSpeed();
    for(auto& S:enemyShots)
    {
        if(!S.active) continue;
        if(S.homing>0)
        {
            const double Speed=std::hypot(S.dx,S.dz),Length=std::hypot(x-S.x,std::max(.5,S.z));
            const double Desired=(x-S.x)/Length*Speed;
            S.dx+=std::clamp(Desired-S.dx,-Speed*2*Dt*Slow,Speed*2*Dt*Slow);
            S.dz=-std::sqrt(std::max(4.,Speed*Speed-S.dx*S.dx)); S.homing=std::max(0.,S.homing-Dt*Slow);
        }
        const double BeforeZ=S.z,BeforeX=S.x; S.x+=S.dx*Dt*Slow; S.z+=S.dz*Dt*Slow;
        int Slot=-1; double HitX=0,HitZ=0;
        // With troops alive the leader is guarded; shots continue through its
        // plane and hit the actual shallow formation, including side soldiers.
        if(FormationHit(BeforeX,BeforeZ,S.x,S.z,S.radius,army<=1,Slot,HitX,HitZ))
        { S.active=false; DamageArmy(S.damage,HitX,HitZ,S.id,Slot); }
        else if(S.z< -5 || std::abs(S.x)>10) S.active=false;
        if(phase==Phase::Lost || phase==Phase::LastStand) return;
    }
}
void Battle::DropPickup(double X,double Z,PickupKind Power,int Source,int ChoiceGroup)
{
    for(auto& P:pickups) if(!P.active)
    {
        if(Power==PickupKind::Haste) X=x>=0?-2.7:2.7;
        const double Radius=ChoiceGroup?.72:Power==PickupKind::Haste?.65:1.1;
        P={nextPickupId++,Power,X,Z,Radius,true,ChoiceGroup}; Emit(EffectKind::Drop,X,Z,int(Power),Source,-4,Radius); return;
    }
}
void Battle::MovePickups(double Dt)
{
    for(auto& P:pickups) if(P.active)
    {
        P.z-=3.7*Dt*(phase==Phase::Run?(timePower==TimePower::Slow?.5:timePower==TimePower::Haste?1.35:1):1);
        if(P.z>.8) continue;
        P.active=false;
        if(std::abs(P.x-x)<=P.radius+.15)
        {
            if(int(P.kind)<=3 || P.kind==PickupKind::Escort) { weaponPower=P.kind==PickupKind::Escort?WeaponPower::Escort:static_cast<WeaponPower>(P.kind); powerTime=level==0?12:10+rank*.3; escortShield=P.kind==PickupKind::Escort?30:0; }
            else { timePower=static_cast<TimePower>(int(P.kind)-3); timePowerTime=P.kind==PickupKind::Freeze?3:5; }
            if(P.choiceGroup) for(auto& Other:pickups) if(Other.active && Other.choiceGroup==P.choiceGroup) { Other.active=false; Emit(EffectKind::Missed,Other.x,Other.z,int(Other.kind),Other.id,-4,Other.radius); }
            Charge(level==0?10:25); score+=15;
            Emit(EffectKind::Pickup,P.x,.8,int(P.kind),P.id,-4,P.radius);
        }
        else Emit(EffectKind::Missed,P.x,.8,int(P.kind),P.id,-4,P.radius);
    }
}
void Battle::MoveTargets(double Dt,double TravelDelta)
{
    const bool Emp=ability>0 && relic==Relic::EMP; engagement=false;
    // Process closest machines first so following rows queue rather than overlap.
    std::array<Target*,MaxTargets> Ordered{}; int Count=0;
    for(auto& T:targets) if(T.active) Ordered[Count++]=&T;
    std::sort(Ordered.begin(),Ordered.begin()+Count,[](const Target* A,const Target* B){return A->z<B->z || (A->z==B->z && A->id<B->id);});
    for(int I=0;I<Count;++I)
    {
        Target& T=*Ordered[I]; if(!T.active) continue; T.hit=std::max(0.,T.hit-Dt); T.stunTime=std::max(0.,T.stunTime-Dt);
        if(T.role==3 && T.z<26 && T.stunTime<=0) { T.ventClock+=Dt; const double Cycle=std::fmod(T.ventClock,5.2); T.ventOpen=Cycle>=3.6; T.ventTime=T.ventOpen?5.2-Cycle:3.6-Cycle; }
        if(T.kind==Kind::Enemy)
        {
            const double BeforeZ=T.z;
            double Near=-10;
            for(int J=0;J<I;++J) if(Ordered[J]->active && Ordered[J]->kind==Kind::Enemy && std::abs(Ordered[J]->x-T.x)<Ordered[J]->size+T.size+.05)
                Near=std::max(Near,Ordered[J]->z+Ordered[J]->depth+T.depth+.10);
            const double Approach=(T.stunTime>0 || (timePower==TimePower::Freeze && T.z<18) || (level==0 && (T.role==1 || T.role==2) && (T.fireState==FireState::Locked || T.fireState==FireState::Fire)))?0:1*(level==0 && T.role>0 && T.role<3 && T.z<28?.55:1);
            T.z=std::max(Near,T.z-TravelDelta*Approach-Dt*.25*Approach);
            int Slot=-1; double HitX=0,HitZ=0;
            if(T.op==0 && FormationHit(T.x,BeforeZ,T.x,T.z,T.size,true,Slot,HitX,HitZ,T.depth))
            {
                Emit(EffectKind::Contact,T.x,T.z,T.value,T.id,T.variant,T.size);
                DamageArmy(T.value,HitX,HitZ,T.id,Slot);
                if(phase==Phase::LastStand || phase==Phase::Lost) return;
                HitTarget(T,8+weapon*2.);
                if(!T.active) { if(phase==Phase::Lost || phase==Phase::LastStand) return; continue; }
                // Surviving elites recoil in front, then leave sideways; they
                // cannot slide through the protected army while disengaging.
                T.op=2; T.z=std::max(1.8,T.z+2.2); T.originX=T.x>=x?6:-6; engagement=true;
            }
            else if(T.stunTime>0) { T.fireState=FireState::Reload; T.charge=0; }
            else if(level==0 && (T.role==1 || T.role==2)) RangedStep(T,Dt);
            else if(T.variant==2 && !Emp && timePower!=TimePower::Freeze && T.z>Frontline && T.z<20)
            {
                T.fireClock+=Dt*(timePower==TimePower::Slow?.5:timePower==TimePower::Haste?1.35:1);
                if(T.fireClock>=3.5) { T.fireClock=0; SpawnEnemyShot(T.x,T.z,x,7,.22,4,ProjectileKind::Orb,false,T.id); }
            }
            if(T.op==2)
            {
                T.x+=std::clamp(T.originX-T.x,-5*Dt,5*Dt); T.z=std::max(1.8,T.z);
                if(std::abs(T.x)>=5.8) { T.active=false; Emit(EffectKind::Retreat,T.x,T.z,0,T.id,T.variant,T.size); continue; }
            }
            if(T.z< -4.2 && T.op==0) { T.op=3; Emit(EffectKind::Pass,T.x,T.z,0,T.id,T.variant,T.size); }
            if(T.z< -6) { T.active=false; Emit(EffectKind::Retreat,T.x,T.z,0,T.id,T.variant,T.size); }
            if(phase==Phase::Lost || phase==Phase::LastStand) return;
            continue;
        }
        const double BeforeX=T.x,BeforeZ=T.z;
        if(T.motion>0)
        {
            T.motionPhase+=Dt*T.motionRate*(T.kind==Kind::Hazard?HostileSpeed():1);
            T.x=std::clamp(T.originX+T.motion*std::sin(T.motionPhase+T.id*.37),-2.9,2.9);
        }
        T.z-=TravelDelta*(T.kind==Kind::Hazard && timePower==TimePower::Freeze?0:1);
        if(T.kind==Kind::Hazard)
        {
            int Slot=-1; double HitX=0,HitZ=0;
            if(FormationHit(BeforeX,BeforeZ,T.x,T.z,T.size*1.048,true,Slot,HitX,HitZ,.80))
            {
                DamageArmy(T.value,HitX,HitZ,T.id,Slot); T.active=false;
                Emit(EffectKind::HazardBreak,T.x,T.z,0,T.id,-6,T.size); continue;
            }
            if(T.z< -5) { T.active=false; Emit(EffectKind::Missed,T.x,T.z,0,T.id,-6,T.size); }
            continue;
        }
        if(T.kind==Kind::Crate || T.kind==Kind::Orb)
        {
            if(T.z< -2.5) { T.active=false; Emit(EffectKind::Missed,T.x,T.z,0,T.id,T.variant,T.size); }
            continue;
        }
        if(T.z>0) continue;
        T.active=false;
        if(T.kind==Kind::Gate)
        {
            if(std::abs(T.x-x)>T.size+.08) { Emit(EffectKind::Missed,T.x,0,0,T.id,0,T.size); continue; }
            const int Before=army,After=std::clamp(T.op==1?army*T.value:army+T.value,0,160);
            if(After>=Before) Recruit(After-Before);
            else { DamageArmy(Before-After,T.x,0,T.id); if(After==0 && phase!=Phase::Lost) { commanderHp=0; army=0; formationAlive.fill(false); visualStrength=0; phase=Phase::Lost; Emit(EffectKind::CommanderDeath,x,0,0,0,-5,1.2); } }
            score+=army-Before; Charge(level==0?5:15); Emit(EffectKind::Gate,T.x,0,T.value,T.id,0,T.size);
            if(army>Before) Emit(EffectKind::Recruit,T.x,0,army-Before,T.id,-2,.3);
            if(army==0) return;
        }
    }
}
void Battle::BossProjectile(WeaponEmitter Emitter,double AimX,double Speed,double Radius,int Damage,ProjectileKind Type)
{
    // Source identities follow the retained Iron Front GLB nodes, not screen sides.
    // Measured neutral sockets include a 2cm stand-off at model scale 1.4/yaw PI.
    if(Emitter==WeaponEmitter::ArmL && (bossPartsMask&1)) Emitter=(bossPartsMask&2)?WeaponEmitter::Core:WeaponEmitter::ArmR;
    if(Emitter==WeaponEmitter::ArmR && (bossPartsMask&2)) Emitter=(bossPartsMask&1)?WeaponEmitter::Core:WeaponEmitter::ArmL;
    if(Emitter==WeaponEmitter::ShoulderL && (bossPartsMask&4)) Emitter=(bossPartsMask&8)?WeaponEmitter::Core:WeaponEmitter::ShoulderR;
    if(Emitter==WeaponEmitter::ShoulderR && (bossPartsMask&8)) Emitter=(bossPartsMask&4)?WeaponEmitter::Core:WeaponEmitter::ShoulderL;
    double X=0,Z=-.847,Y=4.312;
    if(Emitter==WeaponEmitter::ArmL || Emitter==WeaponEmitter::ArmR)
    { X=Emitter==WeaponEmitter::ArmL?1.72480:-1.72480; Z=-2.09960; Y=3.74926; }
    else if(Emitter==WeaponEmitter::ShoulderL || Emitter==WeaponEmitter::ShoulderR)
    { X=Emitter==WeaponEmitter::ShoulderL?1.432465:-1.432465; Z=-.641911; Y=5.367958; }
    // A destroyed shoulder cannot keep launching guided rockets from nowhere.
    if(Type==ProjectileKind::Rocket && Emitter==WeaponEmitter::Core) Type=ProjectileKind::Orb;
    const double ReleaseY=(bossPartsMask&48)==48?-2.55:(bossPartsMask&12)==12?.02:.85;
    SpawnEnemyShot(bossX+X,bossZ+Z,AimX,Speed,Radius,Damage,Type,true,0,Emitter,ReleaseY+Y);
}
void Battle::BossVolley()
{
    ++bossVolleys;
    const double Boost=level==0?committedAttackBoost:bossPhase==2?1.12:1;
    if(bossPattern==BossPattern::Heavy)
        BossProjectile(bossVolleys%2?WeaponEmitter::ArmL:WeaponEmitter::ArmR,bossLane,(level==0?8.:7.5)*Boost,.58,level==0?24:bossPhase==2?34:27,ProjectileKind::Shell);
    else if(bossPattern==BossPattern::Sweep)
    {
        BossProjectile(WeaponEmitter::ArmL,level==0?std::clamp(bossLane-.9,-3.6,3.6):-3.,(level==0?7.:6)*Boost,.2,level==0?10:8,ProjectileKind::Orb);
        sweepIndex=1; sweepClock=0;
    }
    else if(bossPattern==BossPattern::Laser)
    {
        for(auto& L:lasers) if(!L.active)
        {
            const double OriginZ=bossZ-.85,Length=OriginZ+5,EndX=bossX+(bossLane-bossX)*Length/OriginZ;
            L={nextLaserId++,bossX,OriginZ,EndX,-5,.36,.5,0,true}; break;
        }
    }
    else
    {
        const int N=bossPhase==2?2:1;
        for(int I=-N;I<=N;++I) BossProjectile((I+N)%2?WeaponEmitter::ShoulderR:WeaponEmitter::ShoulderL,std::clamp(bossLane+I*.7,-3.6,3.6),(level==0?7.8:7)*Boost,.3,level==0?(bossPhase==2?12:10):14,ProjectileKind::Rocket);
    }
    Emit(EffectKind::BossShot,bossX,bossZ,int(bossPattern),0,3,2.7);
}
void Battle::MoveLasers(double Dt)
{
    for(auto& L:lasers) if(L.active)
    {
        const double Step=Dt*(timePower==TimePower::Freeze?0:timePower==TimePower::Slow?.5:timePower==TimePower::Haste?1.35:1);
        L.time=std::max(0.,L.time-Step); L.tick-=Step;
        if(L.tick<=0 && Step>0)
        {
            L.tick+=.17; int Slot=-1; double X=0,Z=0;
            if(FormationHit(L.x,L.z,L.endX,L.endZ,L.width*.5,true,Slot,X,Z)) { if(Slot<0) DamageCommander(12); else DamageArmy(6,X,Z,L.id,Slot); }
        }
        if(L.time<=0) L.active=false;
        if(phase==Phase::Lost || phase==Phase::LastStand) return;
    }
}
void Battle::BeginBossDeath()
{
    if(phase!=Phase::Boss) return;
    phase=Phase::Destroying; bossState=BossState::Destroying; bossHp=0; bossAction=BossAction::Dying; bossAttack=0; deathClock=deathProgress=0;
    for(auto& S:shots) S.active=false; for(auto& S:enemyShots) S.active=false; for(auto& L:lasers) L.active=false;
    Emit(EffectKind::BossDeath,bossX,bossZ,0,0,3,2.7);
}
void Battle::BossStep(double Dt)
{
    const double BossDt=Dt*(empStunTime>0?0:timePower==TimePower::Freeze?0:timePower==TimePower::Slow?.5:timePower==TimePower::Haste?1.35:1);
    if(BossDt<=0) return;
    armorBudget=std::min(45.,armorBudget+(110+level*20)*(bossRevives?.8:1)*Dt);
    if(bossState==BossState::Exposed && (level==0 || bossRevives==0))
    {
        bossCoreTime=std::max(0.,bossCoreTime-BossDt);
        if(bossCoreTime<=0)
        {
            if(bossRevives==0)
            {
                bossRevives=1; bossState=BossState::Rebuilding; rebuildClock=level==0?1.:1.8;
                bossArmorMax=(level==0?1850:1850+level*450)*(level==0?.35:.55); bossArmor=bossArmorMax; UpdateBossHealth();
                Emit(EffectKind::BossRevive,bossX,bossZ,1,0,3,2.7);
            }
            else { bossState=BossState::Guarded; coreGuardClock=3.8; bossClock=0; bossLaneLocked=false; }
        }
    }
    if(level==0 && bossState==BossState::Guarded)
    {
        coreGuardClock=std::max(0.,coreGuardClock-BossDt);
        if(coreGuardClock<=0 && firePose<=0)
        { bossState=BossState::Exposed; bossCoreTime=5.0; Emit(EffectKind::CoreExpose,bossX,bossZ,50,0,4,.9); }
    }
    if(bossState==BossState::Rebuilding)
    {
        rebuildClock=std::max(0.,rebuildClock-BossDt); bossAction=BossAction::Windup; bossAttack=0;
        if(rebuildClock<=0) { bossState=BossState::Armored; bossClock=0; bossLaneLocked=false; }
        return;
    }
    bossAge+=BossDt; bossY=(bossPartsMask&48)==48?-2.55:(bossPartsMask&12)==12?.02:1.2+(bossPhase==2?.85:.55)*(1+std::sin(bossAge*1.5));
    if(bossZ>12.01 && bossAge<3)
    {
        bossZ=std::max(12.,bossZ-14.5*BossDt); bossAction=BossAction::Advance;
        const double Blend=std::clamp((bossZ-12.)/7.25,0.,1.);
        bossY+=(2.8-bossY)*Blend*Blend*(3.-2.*Blend); bossAttack=0;
        if(bossZ<=12.0001 && !bossArrived) { bossArrived=true; bossClock=level==0?1.6:0; } return;
    }
    if(bossPhase==1 && bossHp<=bossMax*.5)
    { bossPhase=2; Emit(EffectKind::BossPhase,bossX,bossZ,2,0,3,2.7); }
    const double Cycle=std::fmod(std::max(0.,bossAge-3.),16.);
    const double DesiredZ=Cycle>5 && Cycle<9?8.5:12.;
    // Booster dashes happen between committed attacks; the firing origin and
    // aim stay physically steady during lock, recoil and active beam travel.
    bool BeamActive=false; for(const auto& L:lasers) BeamActive |= L.active;
    const bool Hold=bossLaneLocked || firePose>0 || BeamActive || bossClock+BossDt*(ability>0 && relic==Relic::EMP?.5:1)>=1.8;
    if((bossPartsMask&48)!=48 && !Hold)
    {
        if((bossPartsMask&12)!=12)
        {
            if(bossClock>=.30 && bossClock<1.20)
            {
                const double DesiredX=bossVolleys%2==0?2.05:-2.05;
                const double Envelope=std::clamp(std::min((bossClock-.30)/.15,(1.20-bossClock)/.15),0.,1.);
                const double Speed=std::min(6.*Envelope,std::abs(DesiredX-bossX)*7.);
                bossX+=std::clamp(DesiredX-bossX,-Speed*BossDt,Speed*BossDt);
                bossZ+=std::clamp(DesiredZ-bossZ,-3.8*BossDt,3.8*BossDt);
            }
        }
        else
        {
            const double DesiredX=1.1*std::sin(std::max(0.,bossAge-3.)*.35);
            bossX+=std::clamp(DesiredX-bossX,-1.25*BossDt,1.25*BossDt);
            bossZ+=std::clamp(DesiredZ-bossZ,-1.25*BossDt,1.25*BossDt);
        }
    }
    bossAction=std::abs(DesiredZ-bossZ)>.1?(DesiredZ<bossZ?BossAction::Advance:BossAction::Retreat):BossAction::Strafe;
    if(level==0 && bossState==BossState::Exposed)
    { bossAction=BossAction::Strafe; bossAttack=0; firePose=0; sweepIndex=-1; return; }
    firePose=std::max(0.,firePose-BossDt); bossClock+=BossDt*(ability>0 && relic==Relic::EMP?.5:1);
    if(firePose<=0 && !bossLaneLocked) {
        bossPattern=static_cast<BossPattern>((bossVolleys+level)%4);
        if(bossPattern==BossPattern::Heavy && (bossPartsMask&3)==3) bossPattern=BossPattern::Laser;
        if(bossPattern==BossPattern::Rockets && (bossPartsMask&12)==12) bossPattern=BossPattern::Sweep;
    }
    if(sweepIndex>=0)
    {
        sweepClock+=BossDt;
        while(sweepClock>=.14 && sweepIndex<=(level==0?4:(bossPartsMask&3)==3?3:6))
        {
            sweepClock-=.14;
            if(level==0) BossProjectile(sweepIndex%2?WeaponEmitter::ArmR:WeaponEmitter::ArmL,std::clamp(bossLane-.9+sweepIndex*.45,-3.6,3.6),7*committedAttackBoost,.2,10,ProjectileKind::Orb);
            else BossProjectile(sweepIndex%2?WeaponEmitter::ArmR:WeaponEmitter::ArmL,-3+sweepIndex,6*(bossPhase==2?1.12:1),.2,(bossPartsMask&3)==3?6:8,ProjectileKind::Orb);
            if(++sweepIndex>(level==0?4:(bossPartsMask&3)==3?3:6)) sweepIndex=-1;
        }
    }
    const double Windup=bossPattern==BossPattern::Laser?1.4:bossPattern==BossPattern::Heavy?(bossPhase==2?1.15:1.35):.95;
    if(bossClock>=1.8 && !bossLaneLocked) { const double Aim=std::clamp(x,-3.,3.); if(level!=0 || AdmitBoss(Windup,Aim)) { bossLane=Aim;bossLaneLocked=true;committedAttackBoost=bossPhase==2?1.20:1; } else bossClock=1.5; }
    bossAttack=bossLaneLocked?std::clamp((bossClock-1.8)/Windup,0.,1.):0;
    if(bossLaneLocked) { bossAction=BossAction::Windup; bossY=(bossPartsMask&48)==48?-2.55:(bossPartsMask&12)==12?.02:std::max(.75,bossY-1.0*bossAttack); }
    if(bossClock>=1.8+Windup)
    {
        bossY=(bossPartsMask&48)==48?-2.55:(bossPartsMask&12)==12?.02:.85;
        BossVolley(); firePose=bossPattern==BossPattern::Sweep?1.1:bossPattern==BossPattern::Laser?.5:.4; bossClock=-.3; bossLaneLocked=false; bossAttack=1;
    }
    if(firePose>0) { bossAction=BossAction::Fire; bossAttack=1; bossY=(bossPartsMask&48)==48?-2.55:(bossPartsMask&12)==12?.02:.85; }
}
void Battle::Step(double Dt)
{
    time+=Dt;
    if(phase==Phase::Destroying)
    {
        deathClock+=Dt; deathProgress=std::min(1.,deathClock/2.5);
        if(deathClock+1e-9>=2.5) { phase=Phase::Won; rankReward=rank<5?1:0; score+=200+level*100; Emit(EffectKind::Win,bossX,bossZ,score,0,3,2.7); }
        return;
    }
    empPulseTime=std::max(0.,empPulseTime-Dt); empStunTime=std::max(0.,empStunTime-Dt);
    timePowerTime=std::max(0.,timePowerTime-Dt); if(timePowerTime<=0) timePower=TimePower::None;
    reviveProtection=std::max(0.,reviveProtection-Dt);
    ability=std::max(0.,ability-Dt); x+=std::clamp(desiredX-x,-9*Dt,9*Dt);
    powerTime=std::max(0.,powerTime-Dt); if(powerTime<=0) { weaponPower=starterWeapon; escortShield=0; }
    if(phase==Phase::Boss)
    {
        BossStep(Dt);
        for(auto& T:targets) if(T.active && T.kind==Kind::Enemy)
        {
            T.x+=std::clamp(T.originX-T.x,-6*Dt,6*Dt); T.z-=Dt;
            if(std::abs(T.x)>=5.8) { T.active=false; Emit(EffectKind::Retreat,T.x,T.z,0,T.id,T.variant,T.size); }
        }
    }
    if(phase==Phase::Run)
    {
        const double Delta=std::min(3.7*Dt*(timePower==TimePower::Slow?.5:timePower==TimePower::Haste?1.35:1),travelGoal-travelDistance);
        travelDistance+=Delta; SpawnTimeline(); MoveTargets(Dt,Delta);
        if(phase==Phase::Lost || phase==Phase::LastStand) return;
    }
    MovePickups(Dt);
    fireClock+=Dt; const double Cadence=(level==0?.34-(weapon-1)*.02:.30-(weapon-1)*.025)/((ability>0 && relic==Relic::Overdrive?(level==0?1.30:1.6):1)*(weaponPower==WeaponPower::Cannons?(level==0?1.35:1.75):1));
    while(fireClock>=Cadence) { fireClock-=Cadence; Fire(); }
    MoveShots(Dt);
    if(phase==Phase::Destroying) return;
    if(phase==Phase::Run || phase==Phase::Boss) { MoveEnemyShots(Dt); if(phase==Phase::LastStand || phase==Phase::Lost) return; MoveLasers(Dt); }
    if(phase==Phase::Run && travelDistance+1e-8>=travelGoal)
    {
        // Regroup on arrival regardless of distant surviving foes. Retirement
        // is explicit and earns no kill score, loot or weapon experience.
        {
            phase=Phase::Boss; bossArmor=bossArmorMax; bossCoreHp=bossCoreMax; UpdateBossHealth(); bossZ=40; bossX=0; bossY=2.8; bossClock=bossAge=0; bossLaneLocked=false; engagement=false;
            bossPattern=static_cast<BossPattern>(level%3);
            for(auto& T:targets) if(T.active)
            {
                if(T.kind==Kind::Enemy) { T.op=2; T.originX=T.x>=0?6:-6; Emit(EffectKind::Pass,T.x,T.z,0,T.id,T.variant,T.size); }
                else { Emit(EffectKind::Missed,T.x,T.z,0,T.id,T.variant,T.size); T.active=false; }
            }
            for(auto& S:shots) S.active=false; for(auto& S:enemyShots) S.active=false;
        }
    }
}
}
