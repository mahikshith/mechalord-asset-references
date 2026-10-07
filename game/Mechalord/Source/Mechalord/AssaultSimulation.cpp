#include "AssaultSimulation.h"
#include "CampaignEncounters.h"

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
// A paused/stunned rigid volume has a convex exterior distance along a ray.
// Rare near-tangent refusal can be certified using its actual signed distance:
// bounded minimization then earliest-root bisection, with unchanged tolerance.
static boss_pose::Contact StaticPhysicalContact(const boss_pose::Vec3& Start,const boss_pose::Vec3& End,double Radius,const boss_pose::Frame& Frame)
{
    boss_pose::Contact Best;const auto Delta=End-Start;const double Length=boss_pose::Length(Delta);bool Uncertain=false;
    for(int I=0;I<11;++I){const auto& V=Frame.volumes[I];if(!V.active)continue;
        auto D=[&](double T){return boss_pose::Distance(V,Start+Delta*T)-Radius-V.tolerance;};
        double Lo=0,Hi=1;for(int J=0;J<80;++J){const double A=Lo+(Hi-Lo)/3,B=Hi-(Hi-Lo)/3;if(D(A)<D(B))Hi=B;else Lo=A;}
        const double T=(Lo+Hi)*.5,Min=D(T),Tol=boss_pose::ContactTolerance+1e-9;
        if(Min-(Hi-Lo)*Length>Tol)continue;
        if(Min>Tol){Uncertain=true;continue;}
        double A=0,B=T;if(D(0)<=Tol)B=0;else for(int J=0;J<70;++J){const double M=(A+B)*.5;if(D(M)<=Tol)B=M;else A=M;}
        if(B<Best.fraction){Best.status=boss_pose::SweepStatus::Hit;Best.fraction=B;Best.region=V.region;Best.component=I;Best.point=boss_pose::SurfacePoint(V,Start+Delta*B);Best.normal=boss_pose::Normal(V,Best.point);}
    }
    if(Uncertain){Best.status=boss_pose::SweepStatus::Unresolved;}return Best;
}
static bool SamePhysicalPose(const boss_pose::Frame& A,const boss_pose::Frame& B)
{
    for(int I=0;I<11;++I){const auto& X=A.volumes[I];const auto& Y=B.volumes[I];if(X.active!=Y.active)return false;if(!X.active)continue;
        if(boss_pose::Length(X.center-Y.center)>1e-12||std::abs(X.rotation.x-Y.rotation.x)+std::abs(X.rotation.y-Y.rotation.y)+std::abs(X.rotation.z-Y.rotation.z)+std::abs(X.rotation.w-Y.rotation.w)>1e-12)return false;}
    return true;
}
static boss_pose::Contact PhysicalSweep(const boss_pose::Vec3& Start,const boss_pose::Vec3& End,double Radius,const boss_pose::Frame& Previous,const boss_pose::Frame& Current,int Mask)
{
    auto H=boss_pose::NearestContact(Start,End,Radius,Previous,Current);if(H.status!=boss_pose::SweepStatus::Unresolved)return H;
    if(SamePhysicalPose(Previous,Current))return StaticPhysicalContact(Start,End,Radius,Current);
    for(int I=0;I<16;++I){const double A=double(I)/16,B=double(I+1)/16;
        const auto P=boss_pose::BuildFrame(boss_pose::Interpolate(Previous.pose,Current.pose,A),Mask),Q=boss_pose::BuildFrame(boss_pose::Interpolate(Previous.pose,Current.pose,B),Mask);
        H=boss_pose::NearestContact(Start+(End-Start)*A,Start+(End-Start)*B,Radius,P,Q);
        if(H.status!=boss_pose::SweepStatus::Miss){H.fraction=A+(B-A)*H.fraction;return H;}
    }return {};
}
// Instant beams have no time interval or moving-volume sweep. Test the same
// physical ray in chronological half-metre pieces, preserving earliest contact
// and refusing uncertain pieces instead of jumping to a later damage recipient.
static boss_pose::Contact InstantRay(const boss_pose::Vec3& Start,const boss_pose::Vec3& End,double Radius,const boss_pose::Frame& Frame)
{
    const int Count=std::clamp(int(std::ceil(boss_pose::Length(End-Start)/.5)),1,128);
    for(int I=0;I<Count;++I){const double A=double(I)/Count,B=double(I+1)/Count;
        auto H=boss_pose::NearestContact(Start+(End-Start)*A,Start+(End-Start)*B,Radius,Frame,Frame);
        if(H.status==boss_pose::SweepStatus::Unresolved)H=StaticPhysicalContact(Start+(End-Start)*A,Start+(End-Start)*B,Radius,Frame);
        if(H.status!=boss_pose::SweepStatus::Miss){H.fraction=A+(B-A)*H.fraction;return H;}
    }return {};
}
const char* Battle::LevelName() const
{
    static constexpr const char* Names[]={"Reactor Siege","Roller Foundry","Citadel Breach","Storm Pass","Forge Core","Iron March"};
    return Names[std::clamp(level,0,5)];
}
void Battle::Start(Relic Equipped,int Level,int Rank)
{
    *this=Battle{}; level=std::clamp(Level,0,5); campaign=level==5; rank=std::clamp(Rank,0,5);
    duration=level==0?90:level>=3?campaign::Duration(level):55+level*5; travelGoal=duration*3.7; bossArmorMax=UsesSpatialBoss()?(level==0?2600:2150):1850+level*450; bossCoreMax=UsesSpatialBoss()?800:600+level*130; bossCoreHp=bossCoreMax; bossMax=bossArmorMax+bossCoreMax;
    if(UsesSpatialBoss()) for(int I=0;I<6;++I) regionHp[I]=regionMax[I]=bossArmorMax*(I<4?.35:.30)*.5;
    army=8+rank*2; visualStrength=army-1; formationSpan=std::min(24,army-1);
    for(int I=0;I<formationSpan;++I) formationAlive[I]=true;
    commanderHp=commanderMaxHp=100+rank*5; relic=Equipped; phase=Phase::Run;
    if(rank>0) { starterWeapon=weaponPower=rank==1?WeaponPower::Cannons:rank==2?WeaponPower::Guided:WeaponPower::Railburst; powerTime=0; }
    bossArmor=bossArmorMax;UpdateBossHealth();
    if(campaign) { ConfigureCampaign(); return; }
    if(level<3)GatePair(0,40);
    for(double Lane:{-1.8,0.,1.8}) Spawn(Kind::Enemy,Lane,42,UsesSpatialBoss()?8:5+level,UsesSpatialBoss()?2:1,0,.3);
}
void Battle::Advance(double Seconds,double DesiredX)
{
    if(paused || (phase!=Phase::Run && phase!=Phase::Boss && phase!=Phase::Destroying && phase!=Phase::Reviving)) return;
    desiredX=std::isfinite(DesiredX)?std::clamp(DesiredX,-3.,3.):x;
    accumulator+=std::clamp(std::isfinite(Seconds)?Seconds:0.,0.,.25);
    constexpr double Dt=1./60.;
    while(accumulator+1e-10>=Dt)
    {
        accumulator-=Dt; Step(Dt);
        if(phase==Phase::Won || phase==Phase::Lost || phase==Phase::LastStand || phase==Phase::Reward) { accumulator=0; break; }
    }
}
double Battle::StageProgress() const
{
    if(!campaign)return std::clamp(travelDistance/std::max(.01,travelGoal),0.,1.);
    const double Begin=campaign::ZoneBounds[actIndex],End=campaign::ZoneBounds[actIndex+1];
    return std::clamp((travelDistance/3.7-Begin)/(End-Begin),0.,1.);
}
void Battle::UpdateZone()
{
    if(!campaign||phase!=Phase::Run)return;
    const double P=travelDistance/3.7;
    const int Zone=P>=campaign::ZoneBounds[2]?2:P>=campaign::ZoneBounds[1]?1:0;
    if(Zone==actIndex)return;
    actIndex=Zone;actStartDistance=campaign::ZoneBounds[Zone]*3.7;
    // This event changes presentation only. Nothing in the live battle is reset.
    Emit(EffectKind::ActStart,x,0,actIndex,0,StageLevel(),1);
}
void Battle::ConfigureCampaign()
{
    actStartDistance=0;actIndex=0;duration=campaign::MarchDuration;travelGoal=duration*3.7;
    bossArmorMax=3200;bossCoreMax=900;bossCoreHp=bossCoreMax;bossMax=bossArmorMax+bossCoreMax;
    for(int I=0;I<6;++I)regionHp[I]=regionMax[I]=bossArmorMax*(I<4?.35:.30)*.5;
    guardHp=guardMax=0;bossArmor=bossArmorMax;UpdateBossHealth();
    spawned=0;bossPartsMask=bossRevives=bossVolleys=0;bossPhase=1;++bossEpoch;
    bossState=BossState::Armored;bossAction=BossAction::Strafe;bossZ=40;bossX=0;bossY=.8;
    bossClock=bossAge=firePose=deathClock=deathProgress=collapseTime=0;
    bossEvadeTime=bossEvadeTell=bossFiringWindow=0;evades=0;nextEvade=7;
    sweepIndex=-1;bossLaneLocked=bossArrived=bossClashed=false;laserCharges=0;clash={};
    combatPower=CombatPower::None;combatPowerTime=0;friendlyBeam={};
    for(auto& T:targets)T.active=false;for(auto& S:shots)S.active=false;
    for(auto& S:enemyShots)S.active=false;for(auto& L:lasers)L.active=false;for(auto& P:pickups)P.active=false;
    phase=Phase::Run;accumulator=0;engagement=false;
    SpawnTimeline();
    Emit(EffectKind::ActStart,x,0,actIndex,0,StageLevel(),1);
}
bool Battle::ApplyLegacyReward(int Choice)
{
    if(!campaign||phase!=Phase::Run||time>0||legacyApplied||Choice<0||Choice>2)return false;
    legacyApplied=true;if(Choice==0)++rewardLaser;else if(Choice==1){++rewardVitality;commanderMaxHp+=20;commanderHp+=20;}else ++rewardEndurance;
    return true;
}
bool Battle::ApplyLoadout(int Sentinels,int Havocs,int Wisps,int Weapon)
{
    if(!campaign||phase!=Phase::Run||time>0||loadoutApplied)return false;
    loadoutApplied=true;
    Recruit(std::max(0,Sentinels)+std::max(0,Havocs)+std::max(0,Wisps));
    // Persona powers: each Havoc pre-charges Barrage, each Wisp pre-charges EMP.
    relicEnergy[int(Relic::StormBattery)]=std::min(100.,relicEnergy[int(Relic::StormBattery)]+15.*std::max(0,Havocs));
    relicEnergy[int(Relic::EMP)]=std::min(100.,relicEnergy[int(Relic::EMP)]+15.*std::max(0,Wisps));
    if(Weapon>=1&&Weapon<=3){weaponPower=static_cast<WeaponPower>(Weapon);powerTime=30;}
    return true;
}
bool Battle::BuyNow(int Item)
{
    if(!campaign||phase!=Phase::Run||Item<0||Item>5)return false;
    if(Item<=2){if(army>=ArmyCap())return false;Recruit(1);if(Item==1)relicEnergy[int(Relic::StormBattery)]=std::min(100.,relicEnergy[int(Relic::StormBattery)]+15.);if(Item==2)relicEnergy[int(Relic::EMP)]=std::min(100.,relicEnergy[int(Relic::EMP)]+15.);}
    else{weaponPower=Item==3?WeaponPower::Cannons:Item==4?WeaponPower::Guided:WeaponPower::Railburst;powerTime=30;}
    return true;
}
bool Battle::ChooseReward(int Choice)
{
    if(paused||phase!=Phase::Reward||!campaign||actIndex!=2||Choice<0||Choice>2)return false;
    if(Choice==0)++rewardLaser;
    else if(Choice==1){++rewardVitality;commanderMaxHp+=20;commanderHp=std::min(commanderMaxHp,commanderHp+35);}
    else ++rewardEndurance;
    Emit(EffectKind::RewardChosen,x,0,Choice,0,Choice,1.5);
    phase=Phase::Won;rankReward=rank<5?1:0;score+=700;Emit(EffectKind::Win,bossX,bossZ,score,0,3,2.7);return true;
}
bool Battle::FireLaser()
{
    if(paused||clash.active||laserCharges<=0||combatPowerTime>0||(phase!=Phase::Run&&phase!=Phase::Boss))return false;
    --laserCharges;if(campaign)laserMeter=0;BeginCombatPower(PickupKind::Tempest);return true;
}
bool Battle::BeginClash()
{
    if(phase!=Phase::Boss||combatPower!=CombatPower::Tempest||combatPowerTime<=0||clash.active)return false;
    for(auto& L:lasers)if(L.active){
        ClipLaserToShield(L);
        // Intersect the actual finite-width beams in 3D, not just their
        // centerlines. Angled hostile rays aimed at the commander can overlap
        // the forward cannon volume even when their centerlines meet below it.
        const double DZ=L.endZ-L.z;
        if(std::abs(DZ)<.001)continue;
        const double AX=(L.endX-L.x)/DZ,AY=(L.endY-L.y)/DZ;
        const double BX=L.x-AX*L.z-x,BY=L.y-AY*L.z-1.42+beamSlope*1.32;
        const double DY=AY-beamSlope,Radius=(L.width+friendlyBeam.width)*.5;
        const double A=AX*AX+DY*DY,B=2*(AX*BX+DY*BY),C=BX*BX+BY*BY-Radius*Radius;
        // A shield-clipped beam has no invisible continuation behind the armor.
        // Its clash interval must be the same finite beam the player sees.
        double Lo=std::max(1.32,std::min(L.z,L.endZ)),Hi=std::min({40.,L.z-.35,friendlyBeam.endZ});
        if(A<1e-12){if(C>0)continue;}
        else{const double Disc=B*B-4*A*C;if(Disc<0)continue;const double Root=std::sqrt(Disc);Lo=std::max(Lo,(-B-Root)/(2*A));Hi=std::min(Hi,(-B+Root)/(2*A));}
        if(Lo>Hi)continue;
        const double Z=(Lo+Hi)*.5,LX=L.x+AX*(Z-L.z),LY=L.y+AY*(Z-L.z),HY=1.42+beamSlope*(Z-1.32);
        const double Weight=friendlyBeam.width/(friendlyBeam.width+L.width),X=x+(LX-x)*Weight,Y=HY+(LY-HY)*Weight;
        clash={true,.48,3,X,Y,Z,x,1.42,1.32,L.x,L.y,L.z,0,L.id};bossClashed=true;clashTapCooldown=0;
        friendlyBeam.endX=X;friendlyBeam.endY=Y;friendlyBeam.endZ=Z;friendlyBeam.time=3;
        L.endX=X;L.endZ=Z;L.endY=Y;L.time=3;
        Emit(EffectKind::ClashStart,X,Z,0,0,0,1.2);return true;
    }return false;
}
bool Battle::ClashTap()
{
    if(paused||!clash.active||clashTapCooldown>1e-9)return false;
    clashTapCooldown=.20;clash.progress=std::min(1.,clash.progress+.085);return true;
}
void Battle::ClashStep(double Dt)
{
    clash.time=std::max(0.,clash.time-Dt);clash.progress=std::max(0.,clash.progress-.095*Dt);
    // The contact travels along the authoritative joined beam, advancing toward
    // the boss when the player gains ground. Threats/normal shots are held.
    const double F=.18+clash.progress*.65;
    const double Blend=std::min(1.,Dt*8);
    clash.x+=(clash.heroX+(clash.enemyX-clash.heroX)*F-clash.x)*Blend;
    clash.y+=(clash.heroY+(clash.enemyY-clash.heroY)*F-clash.y)*Blend;
    clash.z+=(clash.heroZ+(clash.enemyZ-clash.heroZ)*F-clash.z)*Blend;
    friendlyBeam.endX=clash.x;friendlyBeam.endY=clash.y;friendlyBeam.endZ=clash.z;friendlyBeam.time=clash.time;
    for(auto& L:lasers)if(L.id==clash.laserId&&L.active){L.endX=clash.x;L.endZ=clash.z;L.endY=clash.y;L.time=clash.time;}
    if(clash.progress<.9&&clash.time>0)return;
    const bool Won=clash.progress>=.60;
    clash.active=false;clash.result=Won?1:2;clash.time=0;friendlyBeam.time=0;combatPowerTime=0;combatPower=CombatPower::None;
    for(auto& L:lasers)if(L.id==clash.laserId)L.active=false;
    bossClock=-1.0;firePose=0;bossLaneLocked=false;bossAttack=0;bossFiringWindow=1.4;
    Emit(Won?EffectKind::ClashWin:EffectKind::ClashLose,clash.x,clash.z,Won?1:0,0,0,1.8);
    if(Won){DamageBoss(155*(1+rewardLaser*.25),bossX,FriendlyKind::Arc);Charge(18);}
    else DamageCommander(18);
}
void Battle::SpawnArchetype(int Type,double X,double Hp,double Delay)
{
    const int Id=nextTargetId;Spawn(Kind::Enemy,X,42,Hp,Type==2?10:8,0,1,Type==1?1:2);
    for(auto& T:targets)if(T.active&&T.id==Id){
        T.archetype=Type;T.fireDelay=Delay;T.role=Type==3?2:Type==4?1:0;
        T.size=Type==1?.65:Type==2?.525:Type==3?.9:.725;
        T.depth=Type==1?.5:Type==2?.825:Type==3?.625:.55;
        T.shieldHp=T.shieldMax=Type==1?3:0;if(Type==4)T.skillClock=4.3;
    }
    if(Type==4)SpawnArchetype(1,X>0?-.3:.3,Hp*.75,0);
}
void Battle::ArchetypeStep(Target& T,double Dt)
{
    if(!T.archetype||T.op||T.stunTime>0||HostileSpeed()<=0)return;
    const double D=Dt*HostileSpeed();
    if(T.archetype==2&&T.z<18){
        T.skillClock+=D;
        if(T.skillState==0){T.skillState=1;T.skillClock=0;T.aimX=x;}
        if(T.skillState==1){T.charge=std::min(1.,T.skillClock/.8);if(T.skillClock>=.8){T.skillState=2;T.skillClock=0;}}
        if(T.skillState==2){T.x+=std::clamp(T.aimX-T.x,-1.8*D,1.8*D);if(T.skillClock>1.0){T.skillState=3;T.charge=0;}}
    } else if(T.archetype==4&&T.z<27){
        T.skillClock+=D;T.skillState=std::fmod(T.skillClock,5.5)>4.6?1:0;
        if(T.skillClock>=5.5){T.skillClock=0;T.skillState=2;
            for(auto& Other:targets)if(Other.active&&Other.id!=T.id&&Other.kind==Kind::Enemy&&Other.hp<Other.maxHp&&std::hypot(Other.x-T.x,Other.z-T.z)<5){
                const double Actual=std::min(Other.maxHp-Other.hp,Other.maxHp*.12);Other.hp+=Actual;
                Emit(EffectKind::EnemySupport,T.x,T.z,int(std::ceil(Actual)),Other.id,4,1);auto& E=effects[effectCount-1];E.y=1.7;E.endX=Other.x;E.endY=1.5;E.endZ=Other.z;E.endpoint=true;
            }
        }
    }else if(T.archetype==3){T.skillState=T.fireState==FireState::Locked?1:T.fireState==FireState::Fire?2:0;}
}
void Battle::Charge(double Amount) {
    if(campaign){for(int I=0;I<3;++I)if(relicTime[I]<=0)relicEnergy[I]=std::min(100.,relicEnergy[I]+Amount);energy=relicEnergy[int(relic)];}
    else if(ability<=0) energy=std::min(100.,energy+Amount);
}
bool Battle::ActivateRelic(Relic Equipped) {
    if(!campaign && Equipped!=relic)return false;
    if(paused || (phase!=Phase::Run&&phase!=Phase::Boss) || clash.active)return false;
    if(campaign){if(relicEnergy[int(Equipped)]<100||relicTime[int(Equipped)]>0)return false;relic=Equipped;energy=relicEnergy[int(relic)];ability=relicTime[int(relic)];}
    return Activate();
}
bool Battle::Activate()
{
    if(paused || energy<100 || ability>0 || clash.active || (phase!=Phase::Run && phase!=Phase::Boss)) return false;
    energy=0; ability=(relic==Relic::StormBattery?5:relic==Relic::EMP?2:4)*(1+rewardEndurance*.15);
    if(campaign){relicEnergy[int(relic)]=0;relicTime[int(relic)]=ability;}
    Emit(EffectKind::Relic,x,0,int(relic),0,-2,relic==Relic::EMP?3.2:1.5);
    if(relic==Relic::StormBattery){barrageClock=0;barragePairs=0;BarrageVolley();}
    if(relic==Relic::EMP)
    {
        empPulseTime=.65; empStunTime=ability; Emit(EffectKind::EmpPulse,x,0,int(std::ceil(empStunTime)),0,-2,26);
        for(auto& T:targets) if(T.active && T.op==0 && T.kind==Kind::Enemy && T.z>=-4 && T.z<=26 && std::abs(T.x)<=5)
        {
            if(T.variant==0) HitTarget(T,T.hp,FriendlyKind::Pulse,true);
            else
            {
                HitTarget(T,std::min(T.maxHp*.45,20.+weapon*6.),FriendlyKind::Pulse,true);
                if(T.active) { T.stunTime=empStunTime; T.fireState=FireState::Reload; T.fireClock=T.charge=0; Emit(EffectKind::EmpStun,T.x,T.z,int(std::ceil(empStunTime)),T.id,T.variant,T.size); }
            }
        }
        for(auto& S:enemyShots) if(S.active)
        { S.active=false; Emit(EffectKind::EmpClear,S.x,S.z,1,S.id,int(S.kind),S.radius); }
        for(auto& L:lasers) if(L.active)
        { L.active=false; Emit(EffectKind::EmpClear,L.x,L.z,1,L.id,3,L.width); }
        if(phase==Phase::Boss && bossZ<=26)
        {
            DamageBoss(60.,bossX); bossLaneLocked=false; bossClock=-.5; firePose=0; sweepIndex=-1; bossAttack=0; bossAction=BossAction::Strafe;
            Emit(EffectKind::EmpStun,bossX,bossZ,int(std::ceil(empStunTime)),0,3,2.4);
        }
    }
    return true;
}
bool Battle::CanHeal() const { return !paused && !clash.active && (phase==Phase::Run || phase==Phase::Boss) && healUsesRemaining>0 && army>=21 && commanderHp<=commanderMaxHp-10; }
bool Battle::CanRevive() const { return phase==Phase::LastStand && !reviveUsed && army>=13; }
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
    Sacrifice(12); reviveUsed=true; commanderHp=std::min(commanderMaxHp,50.); reviveProtection=1.5;
    reviveCinematicTime=1.5; phase=Phase::Reviving; paused=false; accumulator=0; Emit(EffectKind::Revive,x,0,50,0,-5,1.2); return true;
}
void Battle::FinalDefeat()
{
    commanderHp=0; army=0; formationAlive.fill(false); visualStrength=0; phase=Phase::Lost;
    Emit(EffectKind::CommanderDeath,x,0,0,0,-5,1.2);
}
bool Battle::DeclineRevive() { if(phase!=Phase::LastStand) return false; FinalDefeat(); return true; }
bool Battle::RegionVulnerable(int Id) const
{
    if(!UsesSpatialBoss() || phase!=Phase::Boss || Id<0 || Id>6 || bossState==BossState::Rebuilding || bossState==BossState::Guarded)return false;
    if(Id==6)return bossPartsMask==63 && (bossState==BossState::Exposed || guardHp>0);
    return !(bossPartsMask&(1<<Id)) && bossState==BossState::Armored && Id/2==BossPart();
}
double Battle::RegionHp(int Id) const { return Id==6?(guardHp>0?guardHp:bossCoreHp):Id>=0&&Id<6?regionHp[Id]:0; }
double Battle::RegionMax(int Id) const { return Id==6?(guardHp>0?guardMax:bossCoreMax):Id>=0&&Id<6?regionMax[Id]:0; }
double Battle::GroundY() const { const double Target=(bossPartsMask&48)==48?-2.55:.02;if(!UsesSpatialBoss() || collapseTime<=0)return Target;const double T=1-collapseTime/.5;return collapseStartY+(Target-collapseStartY)*T*T*(3-2*T); }
void Battle::SyncPosePosition()
{
    auto P=bossFrame.pose;P.position={bossX,bossY,-bossZ};bossFrame=boss_pose::BuildFrame(P,bossPartsMask);
}
void Battle::UpdatePose(double Dt)
{
    if(!UsesSpatialBoss())return;
    if(empStunTime>0 || timePower==TimePower::Freeze)return;
    if(bossLaneLocked || firePose>0 || sweepIndex>=0)
    {SyncPosePosition();poseDriver.Reset(bossFrame.pose);return;}
    boss_pose::MotionInput M;M.position={bossX,bossY,-bossZ};M.aimX=x;M.hostileRate=HostileSpeed();M.airborne=(bossPartsMask&12)!=12;M.down=(bossPartsMask&48)==48;
    M.action=bossAction==BossAction::Evade?boss_pose::Action::Strafe:static_cast<boss_pose::Action>(bossAction);M.state=bossState==BossState::Armored?boss_pose::State::Armored:bossState==BossState::Exposed?boss_pose::State::Exposed:bossState==BossState::Guarded?boss_pose::State::Guarded:bossState==BossState::Rebuilding?boss_pose::State::Rebuilding:boss_pose::State::Destroying;
    poseDriver.Step(M,Dt);auto P=poseDriver.Current();
    // Releasing a committed aim must not snap all hit volumes toward the new
    // player lane in one tick. Publish the same bounded pose the renderer uses.
    P.rootEuler.y=bossFrame.pose.rootEuler.y+std::clamp(boss_pose::AngleDelta(bossFrame.pose.rootEuler.y,P.rootEuler.y),-2*Dt,2*Dt);
    for(int I=0;I<2;++I){P.armPitch[I]=bossFrame.pose.armPitch[I]+std::clamp(boss_pose::AngleDelta(bossFrame.pose.armPitch[I],P.armPitch[I]),-4*Dt,4*Dt);P.armRoll[I]=bossFrame.pose.armRoll[I]+std::clamp(boss_pose::AngleDelta(bossFrame.pose.armRoll[I],P.armRoll[I]),-4*Dt,4*Dt);}
    if((bossPartsMask&12)==12&&(bossPartsMask&48)!=48){
        const double Distance=std::hypot(bossX-previousBossFrame.pose.position.x,-bossZ-previousBossFrame.pose.position.z);
        groundStride+=Distance*2.5;
        const double Stride=std::clamp(Distance/std::max(.0001,Dt)/2.5,0.,1.);
        P.rootEuler.x=0;
        for(int I=0;I<2;++I){const double Swing=std::sin(groundStride+I*3.141592653589793);P.legPitch[I]=Swing*.34*Stride;P.kneePitch[I]=std::max(0.,Swing)*.25*Stride;}
    }
    bossFrame=boss_pose::BuildFrame(P,bossPartsMask);
}
void Battle::EmitSpatial(EffectKind Type,const boss_pose::Vec3& Point,int Value,int Region,double Size)
{
    Emit(Type,Point.x,-Point.z,Value,0,Region==6?4:3,Size);
    auto& E=effects[effectCount-1];E.y=Point.y;E.hitRegion=Region;E.spatial=true;
}
void Battle::ExposeCore()
{
    bossArmor=0;bossState=BossState::Exposed;bossCoreTime=5.;++bossEpoch;
    sweepIndex=-1;bossLaneLocked=false;firePose=0;bossClock=0;bossAction=BossAction::Strafe;bossAttack=0;
    Emit(EffectKind::CoreExpose,bossX,bossZ,50,0,4,.35);
}
void Battle::DamageRegion(int Id,double Damage,const boss_pose::Vec3& Point,FriendlyKind Kind,int Epoch)
{
    double Actual=0;
    if(Epoch==bossEpoch && RegionVulnerable(Id))
    {
        const bool Core=Id==6 && guardHp<=0;
        const double Scale=Core?(Kind==FriendlyKind::Missile?.80:Kind==FriendlyKind::Cannon?1.4:Kind==FriendlyKind::Rail?1.7:2.):Kind==FriendlyKind::Cannon?.70:Kind==FriendlyKind::Missile?.60:Kind==FriendlyKind::Rail?1.10:1.20;
        double& Hp=Id<6?regionHp[Id]:guardHp>0?guardHp:bossCoreHp;
        Actual=std::min(Hp,Damage*Scale*(campaign&&ventTime>0?2.:1.));Hp-=Actual; // weak-point window after big attacks
        if(Id<6 && Hp<=1e-8)
        {
            Hp=0;bossPartsMask|=1<<Id;Emit(EffectKind::BossPartBreak,bossX,bossZ,Id+1,0,3,2.7);
            AwardWeaponXP(20);
            if((bossPartsMask&(3<<(Id/2*2)))==(3<<(Id/2*2))) {
                const int Pair=Id/2,Group=-100-Pair;
                DropPickup(-1.8,std::max(2.,bossZ-1.),Pair==0?PickupKind::Tempest:Pair==1?PickupKind::ArcStorm:PickupKind::Salvo,0,Group,Pair<2?6:0);
                DropPickup(1.8,std::max(2.,bossZ-1.),Pair==0?PickupKind::Escort:Pair==1?PickupKind::Salvo:PickupKind::Tempest,0,Group,Pair<2?6:0);
            }
            if(campaign && (bossPartsMask&(3<<(Id/2*2)))==(3<<(Id/2*2)) && Id/2<2 && commanderHp<commanderMaxHp-15)
                DropPickup(0,std::max(2.,bossZ-1),PickupKind::Health,0);
            if((bossPartsMask&12)==12 && bossPattern==BossPattern::Rockets)bossPattern=BossPattern::Sweep;
            if((bossPartsMask&3)==3 && bossPattern==BossPattern::Heavy)bossPattern=BossPattern::Laser;
            // Any future shot using this emitter/pose must be re-admitted.
            bossLaneLocked=false;bossClock=-.3;bossAttack=0;firePose=0;sweepIndex=-1;
            if((Id>=4&&(bossPartsMask&48)==48)||(Id>=2&&Id<4&&(bossPartsMask&12)==12)){collapseStartY=bossY;collapseTime=.5;}
            if(Id>=2&&Id<4&&(bossPartsMask&12)==12&&bossEvadeTime>0){bossEvadeTime=bossEvadeTell=0;bossFiringWindow=1.4;bossAction=BossAction::Strafe;}
            SyncPosePosition();
            if((bossPartsMask&(3<<(Id/2*2)))==(3<<(Id/2*2)) && bossPartsMask!=63)++bossEpoch;
            if(bossPartsMask==63)ExposeCore();
        }
        else if(Id==6 && guardHp<=1e-8 && bossState==BossState::Armored){guardHp=0;ExposeCore();}
    }
    if(Actual>0)Charge(Actual*.07);
    EmitSpatial(EffectKind::Hit,Point,int(std::ceil(Actual)),Id,Id==6?.35:.65);
    UpdateBossHealth();if(bossCoreHp<=0)BeginBossDeath();
}
int Battle::AimRegion(double Origin,bool Guided,int Index) const
{
    std::array<int,7> Eligible{};int N=0;
    for(int I=0;I<7;++I)if(RegionVulnerable(I))Eligible[N++]=I;
    if(Guided && N)return Eligible[Index%N];
    double Best=1e9;int Id=6;
    for(int I=0;I<N;++I)
    {
        const auto& R=bossFrame.regions[Eligible[I]];bool Aligned=false;
        for(int J=R.first;J<R.first+R.count;++J){const auto& V=bossFrame.volumes[J];const auto A=boss_pose::Rotate(V.rotation,{1,0,0}),B=boss_pose::Rotate(V.rotation,{0,1,0}),C=boss_pose::Rotate(V.rotation,{0,0,1});const double Half=std::abs(A.x)*V.half.x+std::abs(B.x)*V.half.y+std::abs(C.x)*V.half.z;Aligned|=std::abs(Origin-V.center.x)<=Half+.055;}
        const double D=std::abs(Origin-R.aimCenter.x);if(Aligned&&D<Best){Id=Eligible[I];Best=D;}
    }
    return Id;
}
int Battle::BossPart() const { return (bossPartsMask&3)!=3?0:(bossPartsMask&12)!=12?1:(bossPartsMask&48)!=48?2:3; }
double Battle::BossPartHp() const
{
    if(UsesSpatialBoss())return BossPart()<3?regionHp[BossPart()*2]+regionHp[BossPart()*2+1]:guardHp>0?guardHp:bossCoreHp;
    const double Initial=(UsesSpatialBoss()?1850:1850+level*450);
    return BossPart()==0?std::max(0.,bossArmor-Initial*.65):BossPart()==1?std::max(0.,bossArmor-Initial*.30):BossPart()==2?bossArmor:bossCoreHp;
}
double Battle::BossPartMax() const { if(UsesSpatialBoss() && BossPart()==3 && guardHp>0)return guardMax; return BossPart()==3?bossCoreMax:(UsesSpatialBoss()?regionMax[BossPart()*2]+regionMax[BossPart()*2+1]:(1850+level*450)*(BossPart()==2?.30:.35)); }
void Battle::BreakBossParts()
{
    if(UsesSpatialBoss())return;
    if(bossRevives>0) return;
    const double Initial=(UsesSpatialBoss()?1850:1850+level*450);
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
        if(Type==Kind::Enemy) { if(UsesSpatialBoss()){T.hp=T.maxHp=Hp*(Variant==0?1.25:1.15)*(campaign?1+actIndex*.12:1);} T.size=Variant==1?1.1:Variant==2?1.:.44; T.depth=Variant>0?1.:.73; }
        else T.depth=Type==Kind::Gate?.14:Size; if(Type==Kind::Enemy && Variant==1)T.shieldHp=T.shieldMax=3; return;
    }
}
void Battle::GatePair(int Index,double Forward)
{
    if(UsesSpatialBoss())
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
void Battle::Wave(int Rows,double Hp,int Threat,int Formation,double Forward,int Shape)
{
    // Shape 0 grid, 1 wedge, 2 pincer, 3 staggered checker, 4 diagonal sweep, 5 hollow box.
    const double EliteX=Formation==1?-1.8:Formation==2?1.8:0,GunnerX=EliteX<=0?2.5:-2.5;
    for(int Row=0;Row<Rows;++Row)
    {
        for(int Col=0;Col<8;++Col)
        {
            const bool Keep=Shape==1?std::abs(Col-3.5)<=Row+.5:Shape==2?(Col<=2||Col>=5):Shape==3?((Col+Row)%2==0):Shape==4?(Col>=Row%8-1&&Col<=Row%8+2):Shape==5?(Row==0||Row==Rows-1||Col==0||Col==7):true;
            if(!Keep) continue;
            const double Lane=-3.325+Col*.95+(Shape==3&&Row%2?.475:0);
            if(Row==0 && (std::abs(Lane-EliteX)<1.69 || (level==2 && std::abs(Lane-GunnerX)<1.69))) continue;
            Spawn(Kind::Enemy,std::clamp(Lane,-3.7,3.7),Forward+Row*(Shape==3?1.6:2.05),Hp,Threat,0,.44);
        }
        if(Row==0) { Spawn(Kind::Enemy,EliteX,Forward,Hp*5,Threat+2,0,1.1,1); if(level==2) Spawn(Kind::Enemy,GunnerX,Forward,Hp*3,Threat+1,0,1.,2); }
    }
}
void Battle::SpawnTimeline()
{
    if(campaign) {
        const double P=travelDistance/3.7;
        for(int I=0;I<int(campaign::IronMarch.size());++I){const auto& E=campaign::IronMarch[I];const uint64_t B=uint64_t(1)<<I;if(P+1e-9<E.at||(spawned&B))continue;spawned|=B;
            switch(E.kind){
            case campaign::Kind::Wave:Wave(E.value+(E.dropPower==1||E.dropPower==4?2:E.dropPower==5?1:0),E.hp,actIndex+1,E.variant,42,E.dropPower);break;
            case campaign::Kind::Gunner:SpawnRanged(E.x,E.hp,false,E.delay);break;
            case campaign::Kind::Battery:SpawnRanged(E.x,E.hp,true,E.delay);break;
            case campaign::Kind::Carrier:SpawnCarrier(E.x,E.hp,E.dropPower);for(auto& T:targets)if(T.active&&T.id==nextTargetId-1)T.dropAlternate=E.value;break;
            // Campaign: supply crates became topple pillars at the lane edge (variant 7): shoot them down onto the enemy line.
            case campaign::Kind::Crate:Spawn(Kind::Crate,E.x<0?-3.35:3.35,40,E.hp*2.4,E.value,0,.8,7);break;
            case campaign::Kind::Gate:Spawn(Kind::Gate,E.x<0?-1.8:1.8,40,0,E.value+4,0,1.2);Spawn(Kind::Gate,E.x<0?1.8:-1.8,40,0,E.variant==1?-E.value:E.value,0,1.2);break;
            case campaign::Kind::Roller:Spawn(Kind::Hazard,E.x,40,0,E.value,0,.85,0,E.motion);break;
            case campaign::Kind::Collapse:Spawn(Kind::Hazard,E.x<0?-2.15:2.15,40,0,E.value,0,2.2,8,0);break; // half the deck caves in
            case campaign::Kind::Archetype:SpawnArchetype(E.variant,E.x,E.hp,E.delay);break;
            case campaign::Kind::Health:DropPickup(E.x,40,PickupKind::Health,0);break;
            }
        }return;
    }
    if(StageLevel()>=3) {
        const double P=(travelDistance-actStartDistance)/3.7; const auto List=campaign::Events(StageLevel());
        for(int I=0;I<List.count;++I) { const auto& E=List.data[I]; const uint64_t B=uint64_t(1)<<I;if(P<E.at || (spawned&B))continue;spawned|=B;
            switch(E.kind) {
            case campaign::Kind::Wave:Wave(E.value,E.hp,StageLevel()==3?2:3,E.variant);break;
            case campaign::Kind::Gunner:SpawnRanged(E.x,E.hp,false,E.delay);break;
            case campaign::Kind::Battery:SpawnRanged(E.x,E.hp,true,E.delay);break;
            case campaign::Kind::Carrier:SpawnCarrier(E.x,E.hp,E.dropPower);for(auto& T:targets)if(T.active&&T.id==nextTargetId-1)T.dropAlternate=E.value;break;
            case campaign::Kind::Crate:Spawn(Kind::Crate,E.x,40,E.hp,E.value,0,.55,-1);break;
            case campaign::Kind::Gate:Spawn(Kind::Gate,E.x<0?-1.8:1.8,40,0,E.value+4,0,1.2);Spawn(Kind::Gate,E.x<0?1.8:-1.8,40,0,E.value,0,1.2);break;
            case campaign::Kind::Roller:Spawn(Kind::Hazard,E.x,40,0,E.value,0,.85,0,E.motion);break;
            default:break;
            }
        }return;
    }
    if(UsesSpatialBoss()) { SiegeTimeline(); return; }
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
    for(auto& T:targets) if(T.active && T.id==Id) { T.role=3; T.dropPower=Power;T.shieldHp=T.shieldMax=0; }
}
void Battle::SiegeTimeline()
{
    const double P=(travelDistance-actStartDistance)/3.7;
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
    if(At(17,54.)) SpawnCarrier(-1.8,70,8);
    if(At(18,58.)) SpawnRanged(2.6,85,true);
    if(At(19,61.)) Wave(2,10,2,1);
    if(At(20,63.)) GatePair(3);
    if(At(21,66.)) SpawnCarrier(1.8,75,9);
    if(At(22,69.)) Spawn(Kind::Hazard,-1.8,40,0,16,0,.85,0,.35);
    if(At(23,72.)) SpawnRanged(-2.6,90,true);
    if(At(24,75.)) SpawnCarrier(-1.8,80,10);
    if(At(25,78.)) Wave(1,11,2,2);
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
            // A Hound can begin its one-second lateral rush during this query.
            // Enclose that future displacement as well as ordinary marching;
            // the envelope changes admission only, never actual body hitboxes.
            const bool Rush=T.archetype==2 && T.skillState<3;
            const double RushSeconds=Rush?std::clamp(T.skillState==2?1.05-T.skillClock:1.05,0.,std::min(1.05,Horizon)):0;
            const double Distance=3.95*std::max(0.,Horizon-Hold)+6*RushSeconds;
            if(T.z-Distance-T.depth<=.4)
            {
                Hazard H;H.x=T.x;H.z=T.z-Distance*.5;H.radiusX=T.size+1.8*RushSeconds;H.radiusZ=T.depth+Distance*.5;H.end=Horizon;
                if(!Add(H))return Unsupported();
            }
        }
        if(T.id!=Source && T.active && T.op==0 && (T.role==1 || T.role==2) && (T.fireState==FireState::Locked || T.fireState==FireState::Fire))
        {
            const int Begin=T.fireState==FireState::Fire?T.burst:0;
            const double First=T.fireState==FireState::Locked?std::max(0.,.95-T.fireClock):std::max(0.,.18-T.fireClock);
            double MX,MY,MZ;EnemyMuzzle(T,MX,MY,MZ);
            for(int I=Begin;I<3;++I) if(!Add(PlannedRound(MX,MZ,T.aimX+(I-1)*.22,7.5,.20,First+(I-Begin)*.18)))return Unsupported();
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
void Battle::EnemyMuzzle(const Target& T,double& X,double& Y,double& Z) const
{
    X=T.x;Y=1.65;Z=T.z-.35;
    if(T.archetype!=3&&T.archetype!=4)return;
    // Measured normalized weapon tips in enemy-archetypes.ts. Committed
    // aiming plants hover/manipulator sway, matching this same physical source.
    const double LocalX=T.archetype==3?(T.id%2?-.35840394594:.35840394594):.51881440875;
    const double LocalZ=T.archetype==3?.60379819793:.57758048839;
    const double Yaw=std::atan2(T.aimX-T.x,std::max(1.,T.z));
    X+=std::cos(Yaw)*LocalX+std::sin(Yaw)*LocalZ;
    Z-=std::cos(Yaw)*LocalZ-std::sin(Yaw)*LocalX;
    Y=T.archetype==3?2.27920342708:.99440945384;
}
bool Battle::AdmitRanged(const Target& T)
{
    std::array<formation_safety::Hazard,3> H{};
    double MX,MY,MZ;EnemyMuzzle(T,MX,MY,MZ);
    for(int I=0;I<3;++I)H[I]=PlannedRound(MX,MZ,T.aimX+(I-1)*.22,7.5,.20,.95+I*.18);
    return AdmitAttack(H.data(),3,T.id);
}
int Battle::SweepCount() const { return UsesSpatialBoss()?((bossPartsMask&3)!=0&&(bossPartsMask&3)!=3?3:5):(bossPartsMask&3)==3?4:7; }
int Battle::RocketHalfCount() const { return bossPhase==2 && (!UsesSpatialBoss() || (bossPartsMask&12)==0)?2:1; }
bool Battle::AdmitBoss(double Windup,double Aim)
{
    using namespace formation_safety;
    SyncPosePosition();const auto Sockets=boss_pose::PosedSockets(bossFrame);
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
        H[0].trajectory=Trajectory::Beam;H[0].x=Sockets.core.position.x;H[0].z=-Sockets.core.position.z;H[0].endZ=-5;
        H[0].endX=H[0].x+(Aim-H[0].x)*(H[0].z+5)/H[0].z;H[0].radiusX=.40;H[0].start=Windup;H[0].end=Windup+.67;N=1;
    }
    else
    {
        const double Boost=bossPhase==2?1.20:1;
        const int Count=bossPattern==BossPattern::Heavy?1:SweepCount();
        for(int I=0;I<Count;++I)
        {
            WeaponEmitter E=Count==1?((bossVolleys+1)%2?WeaponEmitter::ArmL:WeaponEmitter::ArmR):(I%2?WeaponEmitter::ArmR:WeaponEmitter::ArmL);
            if(E==WeaponEmitter::ArmL && (bossPartsMask&1)) E=(bossPartsMask&2)?WeaponEmitter::Core:WeaponEmitter::ArmR;
            if(E==WeaponEmitter::ArmR && (bossPartsMask&2)) E=(bossPartsMask&1)?WeaponEmitter::Core:WeaponEmitter::ArmL;
            const auto P=E==WeaponEmitter::Core?Sockets.core.position:E==WeaponEmitter::ArmL?Sockets.armL.position:Sockets.armR.position;
            H[N++]=PlannedRound(P.x,-P.z,Count==1?Aim:std::clamp(Aim-(Count-1)*.225+I*.45,-3.6,3.6),(Count==1?8.:7.)*Boost,Count==1?.58:.20,Windup+I*.14);
        }
    }
    return AdmitAttack(H.data(),N);
}
void Battle::RangedStep(Target& T,double Dt)
{
    if(T.op!=0 || T.z>28 || T.z<3) return;
    if(RelicActive(Relic::EMP)) { T.fireState=FireState::Reload; T.fireClock=0; T.charge=0; return; }
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
            T.fireClock-=.18;double MX,MY,MZ;EnemyMuzzle(T,MX,MY,MZ);SpawnEnemyShot(MX,MZ,T.aimX+(T.burst-1)*.22,7.5,.20,T.role==2?6:5,T.archetype==3?ProjectileKind::Rocket:ProjectileKind::Shell,false,T.id,WeaponEmitter::Gunner,MY);
            Emit(EffectKind::EnemyFire,MX,MZ,T.role,T.id,2,1.);
            if(++T.burst==3) { T.fireState=FireState::Reload; T.fireClock=0; T.charge=0; }
        }
    }
    else if(T.fireClock>=(T.role==2?3.8:1.7)) { T.fireState=FireState::Tracking; T.fireClock=0; }
}
void Battle::TroopPosition(int Slot,double& X,double& Z) const
{
    // Campaign squads are fewer, larger machines with their own powers: wider
    // spacing and a deeper gap behind the commander (old fronts keep the tight block).
    const bool Squad=campaign;const double Gap=Squad?1.05:.73,RowGap=Squad?.92:.48,Lead=Squad?1.4:.75;
    const int Count=formationSpan,Columns=std::min(4,Count),Row=Slot/std::max(1,Columns);
    const int Width=std::min(Columns,Count-Row*Columns);
    const double Limit=std::max(.3,3.9-(Columns-1)*Gap*.5);
    X=std::clamp(x,-Limit,Limit)+(Slot%std::max(1,Columns)-(Width-1)*.5)*Gap;
    Z=-(Lead+Row*RowGap);
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
bool Battle::ShieldPlateHit(double X0,double Y0,double Z0,double X1,double Y1,double Z1,double Radius,double& HitX,double& HitY,double& HitZ) const
{
    if(!RelicActive(Relic::Shield))return false;
    // Match PlatedShield's nine deployed panels, including the two folded wings.
    // World uses armyCenterZ=1.5, frontZ=centerZ-3.45 and a front face at -.105.
    // Simulation Z runs toward the enemy; renderer Z has the opposite sign.
    double Center=0,Outer=0;int Count=0;
    for(int I=0;I<24;++I)if(formationAlive[I]){double X,Z;TroopPosition(I,X,Z);Center+=X;++Count;}
    Center=Count?Center/Count:x;
    for(int I=0;I<24;++I)if(formationAlive[I]){double X,Z;TroopPosition(I,X,Z);Outer=std::max(Outer,std::abs(X-Center));}
    const double Width=std::clamp(std::max(1.5,Outer+.8)*2+.55,3.8,8.1),Spread=Width/8;
    // Clip to actual deployed armor height before testing the footprint. A shot
    // above the 2.95m upper plate is not intercepted by an invisible tall wall.
    double Near=0,Far=1;
    if(std::abs(Y1-Y0)<1e-12){if(Y0<.05-Radius||Y0>2.95+Radius)return false;}
    else {double A=(.05-Radius-Y0)/(Y1-Y0),B=(2.95+Radius-Y0)/(Y1-Y0);if(A>B)std::swap(A,B);Near=std::max(Near,A);Far=std::min(Far,B);if(Near>Far)return false;}
    double Best=2;
    for(int I=0;I<9;++I){
        const double Side=(I-4)/4.,Wing=std::abs(Side)>.73?.34*std::abs(Side):0;
        const double Angle=-Side*(std::abs(Side)>.73?.40:.035),C=std::cos(Angle),S=std::sin(Angle);
        const double CX=Center+(I-4)*Spread-.105*S,CZ=1.95-Wing+.105*C;
        auto LocalX=[&](double X,double Z){return C*(X-CX)+S*(Z-CZ);};
        auto LocalZ=[&](double X,double Z){return -S*(X-CX)+C*(Z-CZ);};
        const double X0L=LocalX(X0,Z0),Z0L=LocalZ(X0,Z0),X1L=LocalX(X1,Z1),Z1L=LocalZ(X1,Z1);
        // Front inset plate plus its bevel; swept radius prevents fast rockets
        // tunnelling through the physical cover between fixed simulation steps.
        const double Fraction=SweepBox(X0L+(X1L-X0L)*Near,Z0L+(Z1L-Z0L)*Near,X0L+(X1L-X0L)*Far,Z0L+(Z1L-Z0L)*Far,0,0,Spread*.5+Radius,.06+Radius);
        if(Fraction>1)continue;
        const double F=Near+Fraction*(Far-Near);
        if(F<Best){Best=F;const double LX=std::clamp(X0L+(X1L-X0L)*F,-Spread*.5,Spread*.5),LZ=std::clamp(Z0L+(Z1L-Z0L)*F,-.06,.06);
            HitX=CX+C*LX-S*LZ;HitY=std::clamp(Y0+(Y1-Y0)*F,.05,2.95);HitZ=CZ+S*LX+C*LZ;
        }
    }
    return Best<=1;
}
void Battle::DamageCommander(int Damage)
{
    if(phase==Phase::Lost || phase==Phase::LastStand || Damage<=0) return;
    if(reviveProtection>0 || (RelicActive(Relic::Shield))) { Emit(EffectKind::Block,x,0,Damage,0,-5,.6); if(reviveProtection<=0) Emit(EffectKind::ShieldHit,x,0,Damage,0,-5,.6); return; }
    if(weaponPower==WeaponPower::Escort && escortShield>0) { const int Block=std::min(Damage,escortShield); escortShield-=Block; Damage-=Block; Emit(EffectKind::EscortBlock,x,0,Block,0,-5,.6); if(Damage<=0)return; }
    const int Actual=std::min(int(std::ceil(commanderHp)),Damage);
    commanderHp=std::max(0.,commanderHp-Actual); Emit(EffectKind::CommanderHit,x,0,Actual,0,-5,.65);
    if(commanderHp<=0)
    {
        if(!reviveUsed && army>=13) { resumePhase=phase; phase=Phase::LastStand; Emit(EffectKind::CommanderDown,x,0,0,0,-5,1.2); }
        else FinalDefeat();
    }
}
void Battle::DamageArmy(int Loss,double AtX,double AtZ,int Attacker,int Slot)
{
    if(reviveProtection>0 || (RelicActive(Relic::Shield))) { Emit(EffectKind::Block,AtX,AtZ,Loss,Attacker,-2,.45); if(reviveProtection<=0) Emit(EffectKind::ShieldHit,AtX,AtZ,Loss,Attacker,-2,.45); return; }
    if(weaponPower==WeaponPower::Escort && escortShield>0) { const int Block=std::min(Loss,escortShield); escortShield-=Block; Loss-=Block; Emit(EffectKind::EscortBlock,AtX,AtZ,Block,Attacker,-2,.45); if(Loss<=0)return; }
    // Hired machines are armoured: in the campaign four hits destroy one machine.
    if(campaign&&army>1){machinePlating+=Loss/4.;Loss=int(machinePlating);machinePlating-=Loss;if(Loss<=0){Emit(EffectKind::Block,AtX,AtZ,0,Attacker,-2,.45);return;}}
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
    const int Before=army; army=std::min(ArmyCap(),army+std::max(0,Gain));
    ResizeFormation(visualStrength+(army-Before)*24./std::max(24,army-1),x,0);
}
double Battle::HostileSpeed() const
{
    double Speed=timePower==TimePower::Freeze?0:timePower==TimePower::Slow?.5:timePower==TimePower::Haste?1.35:1;
    if(empStunTime>0) Speed=0;
    return Speed;
}
void Battle::UpdateBossHealth() { if(UsesSpatialBoss()){bossArmor=guardHp;for(double Hp:regionHp)bossArmor+=Hp;} bossHp=bossArmor+bossCoreHp; }
void Battle::DamageBoss(double Damage,double AtX,FriendlyKind WeaponKind)
{
    if(phase!=Phase::Boss || bossState==BossState::Rebuilding) return;
    if(UsesSpatialBoss())
    {
        const int Epoch=bossEpoch,Part=BossPart();
        if(Part<3){for(int I=Part*2;I<Part*2+2;++I)if(Epoch==bossEpoch && RegionVulnerable(I))DamageRegion(I,Damage*.5,bossFrame.regions[I].aimCenter,WeaponKind,Epoch);}
        else if(RegionVulnerable(6))DamageRegion(6,Damage,bossFrame.regions[6].aimCenter,WeaponKind,Epoch);
        return;
    }
    const bool CoreHit=bossState==BossState::Exposed;
    double Actual=0;
    if(bossState==BossState::Armored)
    {
        if(UsesSpatialBoss())
        {
            const double Efficiency=WeaponKind==FriendlyKind::Cannon?.70:WeaponKind==FriendlyKind::Missile?.60:WeaponKind==FriendlyKind::Rail?1.10:1.20;
            Actual=std::min(bossArmor,Damage*Efficiency);
        }
        else Actual=std::min({bossArmor,Damage*(bossRevives?.50:.65),armorBudget});
        bossArmor-=Actual; if(!UsesSpatialBoss()) armorBudget-=Actual; BreakBossParts();
        if(bossArmor<=1e-8)
        {
            bossArmor=0; bossState=BossState::Exposed; bossCoreTime=UsesSpatialBoss()?5.0:bossRevives?0:6.5;
            if(UsesSpatialBoss()) { sweepIndex=-1; bossLaneLocked=false; firePose=0; bossClock=0; bossAction=BossAction::Strafe; bossAttack=0; }
            Emit(EffectKind::CoreExpose,bossX,bossZ,int(bossCoreTime*10),0,4,.9);
        }
    }
    else if(bossState==BossState::Exposed && std::abs(AtX-bossX)<.9)
    {
        const double Weakness=UsesSpatialBoss()?(WeaponKind==FriendlyKind::Missile?.80:WeaponKind==FriendlyKind::Cannon?1.4:WeaponKind==FriendlyKind::Rail?1.7:2.0):.95;
        Actual=std::min(bossCoreHp,Damage*Weakness); bossCoreHp-=Actual;
    }
    if(Actual>0) { Charge(Actual*(UsesSpatialBoss()?.07:.12)); Emit(EffectKind::Hit,AtX,bossZ,int(std::ceil(Actual)),0,CoreHit?4:3,CoreHit?.9:2.4); }
    if(UsesSpatialBoss() && Actual<=0) Emit(EffectKind::Hit,AtX,bossZ,0,0,3,2.4);
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
    // A capped campaign squad fires like a mob three times its size: each machine carries heavier guns.
    const int Firepower=campaign?army*10/3:army;
    const int Count=UsesSpatialBoss()?std::clamp(4+Firepower/10+(weaponPower==WeaponPower::Cannons?2:0),4,weaponPower==WeaponPower::Cannons?12:10):std::clamp(5+Firepower/16+(weaponPower==WeaponPower::Cannons?4:0),5,weaponPower==WeaponPower::Cannons?16:12);
    static constexpr double Damage[]={0,1.5,2.2,3.0,4.4};
    const double Boost=1+rank*.03;
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
            (Rail?Damage[weapon]*(UsesSpatialBoss()?1.35:1.7):Guided?Damage[weapon]*(UsesSpatialBoss()?1.15:1.4):Damage[weapon])*Boost,
            Guided||Rail,true,Type,Rail?5:1,0,Troop};
        S.id=nextShotId++;
        if(UsesSpatialBoss() && phase==Phase::Boss)
        {
            S.spatial=true;S.y=Troop?.90:Guided?2.11:Type==FriendlyKind::Cannon?1.42:Rail?1.80:1.35;
            S.aimRegion=AimRegion(Origin,Guided,I);S.epoch=bossEpoch;
            const auto P=bossFrame.regions[S.aimRegion].aimCenter;const double Range=std::max(.5,-P.z-OriginZ);
            S.dy=(P.y-S.y)/Range*S.dz;
            if(Guided){const double L=boss_pose::Length(P-boss_pose::Vec3{Origin,S.y,-OriginZ});S.dx=(P.x-Origin)/L*Speed;S.dy=(P.y-S.y)/L*Speed;S.dz=(-P.z-OriginZ)/L*Speed;}
        }
        break;
    }
}
void Battle::HitTarget(Target& T,double Damage,FriendlyKind WeaponKind,bool IgnoreArmor)
{
    if(!T.active || T.hp<=0 || Damage<=0) return;
    if(T.shieldHp>0 && !IgnoreArmor) {
        if(T.blockFlash>0)return;
        --T.shieldHp;T.blockFlash=.18;T.hit=.12;Emit(EffectKind::Block,T.x,T.z,T.shieldHp,T.id,T.variant,T.size);
        if(T.shieldHp==0)Emit(EffectKind::ShieldBreak,T.x,T.z,0,T.id,T.variant,T.size);
        return;
    }
    if(IgnoreArmor && T.shieldHp>0){T.shieldHp=0;Emit(EffectKind::ShieldBreak,T.x,T.z,0,T.id,T.variant,T.size);}
    if(UsesSpatialBoss() && WeaponKind==FriendlyKind::Missile && (T.role==1 || T.role==2) && (T.fireState==FireState::Tracking || T.fireState==FireState::Locked)) Damage*=T.role==2?.35:.45;
    if(UsesSpatialBoss() && T.role==3 && !IgnoreArmor) Damage*=T.ventOpen?2.1:.60;
    const double Before=T.hp; T.hp=std::max(0.,T.hp-Damage); const double Actual=Before-T.hp; T.hit=.12;
    Emit(EffectKind::Hit,T.x,T.z,std::max(1,int(std::ceil(Actual))),T.id,T.variant,T.size);
    Charge(Actual*(UsesSpatialBoss()?.07:.18));
    if(T.kind==Kind::Gate)
    {
        if(T.op==0) T.value=std::min(32,T.value+int((T.maxHp-T.hp)/4)-int((T.maxHp-Before)/4));
        else if(T.hp<=0) T.value=3;
        return;
    }
    if(T.hp>0) return;
    T.active=false; ++kills; const int BaseReward=T.kind==Kind::Crate?30:T.kind==Kind::Orb?35:10+T.variant*10; const int Reward=timePower==TimePower::Haste?int(BaseReward*1.5):BaseReward; score+=Reward;
    Charge(UsesSpatialBoss()?(T.kind==Kind::Crate?8:T.role==3?8:T.variant>0?4:2):(T.kind==Kind::Crate || T.kind==Kind::Orb?15:5));
    Emit(EffectKind::Kill,T.x,T.z,Reward,T.id,T.variant,T.size);
    if(T.kind==Kind::Enemy && T.variant>0 && commanderHp<commanderMaxHp-15 && healthDropClock<=0){DropPickup(T.x,std::max(2.,T.z),PickupKind::Health,T.id);healthDropClock=12;}
    if(T.kind==Kind::Crate) AwardWeaponXP(timePower==TimePower::Haste?int(T.value*1.25):T.value);
    if(campaign&&T.kind==Kind::Enemy) AwardWeaponXP(T.variant>0?5:1); // weapon XP now comes from kills
    if(campaign&&T.kind==Kind::Enemy){laserMeter=std::min(100.,laserMeter+(T.variant>0?6.:1.5));if(laserMeter>=100&&laserCharges<=0)laserCharges=1;} // kills refill the laser cannon
    if(campaign&&T.kind==Kind::Crate&&T.variant==7)
    {   // The pillar falls across the lane: everything in its band is crushed.
        Emit(EffectKind::HazardBreak,T.x,T.z,0,T.id,-7,T.size);
        for(auto& O:targets) if(O.active&&O.kind==Kind::Enemy&&O.hp>0&&std::abs(O.z-T.z)<1.8) HitTarget(O,O.hp,FriendlyKind::Arc,true);
    }
    if(UsesSpatialBoss() && T.role==3)
    {
        if(T.dropPower>=8) { const auto A=static_cast<PickupKind>(T.dropPower); const auto B=static_cast<PickupKind>(T.dropAlternate>0?T.dropAlternate:8+(T.dropPower-7)%3);DropPickup(-2.,std::max(.9,T.z),A,T.id,T.id);DropPickup(2.,std::max(.9,T.z),B,T.id,T.id); }
        else if(T.dropPower==2) { DropPickup(-2.,std::max(.9,T.z),PickupKind::Cannons,T.id,T.id); DropPickup(2.,std::max(.9,T.z),PickupKind::Railburst,T.id,T.id); }
        else { DropPickup(-2.,std::max(.9,T.z),PickupKind::Guided,T.id,T.id); DropPickup(2.,std::max(.9,T.z),PickupKind::Escort,T.id,T.id); }
    }
    else if(!UsesSpatialBoss() && (T.kind==Kind::Orb || (T.kind==Kind::Enemy && T.variant>0)))
        DropPickup(T.x,std::max(.9,T.z),static_cast<PickupKind>(T.kind==Kind::Orb?T.value:1+(T.id+level)%6),T.id);
}
void Battle::MoveShots(double Dt)
{
    for(auto& S:shots)
    {
        if(!S.active) continue;
        S.life+=Dt;
        if(S.battery && S.life<=.60)
        {
            boss_pose::Vec3 Aim;bool Locked=false;
            if(S.spatial&&S.epoch==bossEpoch&&S.aimRegion<7&&bossFrame.regions[S.aimRegion].active){Aim=bossFrame.regions[S.aimRegion].aimCenter;Locked=true;}
            else if(!S.spatial)for(const auto& T:targets)if(T.active&&T.id==S.targetId&&T.z>S.z+.4){Aim={T.x,T.archetype==3?1.9:T.variant?1.7:1.,-T.z};Locked=true;break;}
            if(Locked){const auto Delta=Aim-boss_pose::Vec3{S.x,S.y,-S.z};const double L=std::max(.01,boss_pose::Length(Delta));S.dx+=std::clamp(Delta.x/L*26-S.dx,-18*Dt,18*Dt);S.dy+=std::clamp(Delta.y/L*26-S.dy,-18*Dt,18*Dt);S.dz=std::sqrt(std::max(16.,26*26-S.dx*S.dx-S.dy*S.dy));}
        }
        else if(S.spatial && S.kind==FriendlyKind::Missile && S.epoch==bossEpoch && S.aimRegion<7 && bossFrame.regions[S.aimRegion].active)
        {
            const auto P=bossFrame.regions[S.aimRegion].aimCenter;const double L=boss_pose::Length(P-boss_pose::Vec3{S.x,S.y,-S.z});
            const double Dx=(P.x-S.x)/std::max(.01,L)*28,Dy=(P.y-S.y)/std::max(.01,L)*28;
            S.dx+=std::clamp(Dx-S.dx,-70*Dt,70*Dt);S.dy+=std::clamp(Dy-S.dy,-70*Dt,70*Dt);S.dz=std::sqrt(std::max(16.,28*28-S.dx*S.dx-S.dy*S.dy));
        }
        else if(!S.spatial && S.kind==FriendlyKind::Missile)
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
        const double BeforeZ=S.z,BeforeX=S.x,BeforeY=S.y; S.z+=S.dz*Dt; S.x+=S.dx*Dt;if(S.spatial||S.kind==FriendlyKind::Salvo)S.y+=S.dy*Dt;
        if(S.spatial)
        {
            if(std::min(BeforeZ,S.z)<bossZ+4 && std::max(BeforeZ,S.z)>bossZ-4 && std::abs(S.x-bossX)<6)
            {
                const auto H=PhysicalSweep({BeforeX,BeforeY,-BeforeZ},{S.x,S.y,-S.z},S.kind==FriendlyKind::Missile||S.kind==FriendlyKind::Salvo?.09:.055,previousBossFrame,bossFrame,bossPartsMask);
                if(H.status==boss_pose::SweepStatus::Hit){DamageRegion(int(H.region),S.damage,H.point,S.kind,S.epoch);S.active=false;if(phase==Phase::Destroying)return;}
                else if(H.status==boss_pose::SweepStatus::Unresolved){++sweepUnresolved;S.x=BeforeX;S.y=BeforeY;S.z=BeforeZ;}
            }
            if(S.life>6 || S.z>45 || S.z< -5 || std::abs(S.x)>9)S.active=false;
            continue;
        }
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
            if(S.kind==FriendlyKind::Salvo && Nearest->kind==Kind::Enemy)for(auto& T:targets)if(T.active&&T.kind==Kind::Enemy&&T.id!=HitId&&std::hypot(T.x-HitX,T.z-HitZ)<=1.6)HitTarget(T,12,FriendlyKind::Salvo);
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
        if(S.z>(S.kind==FriendlyKind::Salvo?45:28) || S.z< -5 || std::abs(S.x)>9) S.active=false;
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
        const auto Height=[&](double Z){return .85+(S.launchY-.85)*std::clamp(Z/std::max(.1,S.launchZ),0.,1.);};
        double HitY=0;
        if(ShieldPlateHit(BeforeX,Height(BeforeZ),BeforeZ,S.x,Height(S.z),S.z,S.radius,HitX,HitY,HitZ))
        {
            S.active=false;S.x=HitX;S.z=HitZ;
            Emit(EffectKind::ShieldHit,HitX,HitZ,S.damage,S.id,-6,S.radius);
            auto& E=effects[effectCount-1];E.spatial=true;
            E.y=HitY;
            continue;
        }
        // Earliest physical body receives the shot. Troops do not act as a
        // hidden global health pool for projectiles striking the commander.
        if(FormationHit(BeforeX,BeforeZ,S.x,S.z,S.radius,true,Slot,HitX,HitZ))
        { S.active=false; if(Slot<0)DamageCommander(S.damage);else DamageArmy(S.damage,HitX,HitZ,S.id,Slot); }
        else if(S.z< -5 || std::abs(S.x)>10) S.active=false;
        if(phase==Phase::Lost || phase==Phase::LastStand) return;
    }
}
void Battle::DropPickup(double X,double Z,PickupKind Power,int Source,int ChoiceGroup,int BonusTroops)
{
    for(auto& P:pickups) if(!P.active)
    {
        if(Power==PickupKind::Haste) X=x>=0?-2.7:2.7;
        const double Radius=ChoiceGroup?.72:Power==PickupKind::Haste?.65:1.1;
        P={nextPickupId++,Power,X,Z,Radius,true,ChoiceGroup,BonusTroops}; Emit(EffectKind::Drop,X,Z,int(Power),Source,-4,Radius); return;
    }
}

void Battle::BeginCombatPower(PickupKind Power)
{
    combatPower=static_cast<CombatPower>(int(Power)-7); combatPowerTime=(Power==PickupKind::Tempest?TempestSeconds():Power==PickupKind::ArcStorm?1.2:1.8)*(1+rewardEndurance*.15);
    combatClock=0;combatPulses=0;combatEpoch=bossEpoch;friendlyBeam={};beamSlope=0;
    if(combatPower==CombatPower::Tempest) {
        if(UsesSpatialBoss()&&phase==Phase::Boss){const int Id=AimRegion(x,false,0);const auto P=bossFrame.regions[Id].aimCenter;beamSlope=(P.y-1.42)/std::max(1.,-P.z-1.32);}
        friendlyBeam={nextShotId++,x,1.42,1.32,x,1.42+beamSlope*38.68,40,1.,1.};
    }
    Emit(EffectKind::CombatPower,x,1.32,int(Power),0,int(Power),.28);
}
void Battle::GroundSalvo()
{
    const int I=combatPulses;const double X=std::clamp(x+(I%2?.68:-.68),-3.7,3.7),Z=.92,Y=2.11;
    double AimX=X,AimZ=24,AimY=Y;int Id=7;
    if(phase==Phase::Boss&&UsesSpatialBoss()){Id=AimRegion(X,true,I);const auto P=bossFrame.regions[Id].aimCenter;AimX=P.x;AimZ=-P.z;AimY=P.y;}
    else {double Best=1e9;for(const auto& T:targets)if(T.active&&T.hp>0&&T.kind==Kind::Enemy&&T.z>Z&&T.z<28){const double D=T.z+std::abs(T.x-X)*2;if(D<Best){Best=D;AimX=T.x;AimZ=T.z;AimY=T.variant?1.7:1.;}}}
    const double L=std::sqrt((AimX-X)*(AimX-X)+(AimZ-Z)*(AimZ-Z)+(AimY-Y)*(AimY-Y));
    for(auto& S:shots)if(!S.active){S={X,Z,(AimX-X)/L*24,(AimZ-Z)/L*24,20,true,true,FriendlyKind::Salvo,1,0,false};S.id=nextShotId++;S.y=Y;S.dy=(AimY-Y)/L*24;S.spatial=UsesSpatialBoss()&&phase==Phase::Boss;S.epoch=combatEpoch;S.aimRegion=Id;break;}
}
void Battle::BarrageVolley()
{
    // Paired physical shoulder tips, shared with the accepted Salvo rack. Each
    // rocket chooses one immutable target and only gently corrects its first .6s.
    const int Epoch=bossEpoch,Pair=barragePairs++;
    for(int Side:{-1,1}){
        const double X=std::clamp(x+Side*.68,-3.7,3.7),Y=2.11,Z=.92;
        double AimX=X,AimY=1.3,AimZ=27;int Region=7,TargetId=0;
        if(UsesSpatialBoss()&&phase==Phase::Boss){Region=AimRegion(X,true,Pair*2+(Side>0));const auto P=bossFrame.regions[Region].aimCenter;AimX=P.x;AimY=P.y;AimZ=-P.z;}
        else {double Best=1e9;for(const auto& T:targets)if(T.active&&T.hp>0&&T.kind==Kind::Enemy&&T.op==0&&T.z>Z+.5&&T.z<32){const double Cost=T.z+std::abs(T.x-X)*3;if(Cost<Best){Best=Cost;TargetId=T.id;AimX=T.x;AimY=T.archetype==3?1.9:T.variant?1.7:1.;AimZ=T.z;}}}
        const double L=std::max(.01,std::sqrt((AimX-X)*(AimX-X)+(AimY-Y)*(AimY-Y)+(AimZ-Z)*(AimZ-Z)));
        for(auto& S:shots)if(!S.active){S={X,Z,(AimX-X)/L*26,(AimZ-Z)/L*26,12.+weapon*.8,true,true,FriendlyKind::Salvo,1,0,false};S.id=nextShotId++;S.y=Y;S.dy=(AimY-Y)/L*26;S.spatial=UsesSpatialBoss()&&phase==Phase::Boss;S.epoch=Epoch;S.aimRegion=Region;S.battery=true;S.targetId=TargetId;break;}
    }
}
void Battle::BarrageStep(double Dt)
{
    if(!RelicActive(Relic::StormBattery))return;
    barrageClock+=Dt;
    const int Limit=int(std::ceil(5*(1+rewardEndurance*.15)/.56));
    while(barrageClock+1e-9>=.56&&barragePairs<Limit){barrageClock-=.56;BarrageVolley();}
}
void Battle::CombatStep(double Dt)
{
    if(combatPowerTime<=0)return;
    combatClock+=Dt;
    if(combatPower==CombatPower::Tempest){
        friendlyBeam.x=friendlyBeam.endX=x;friendlyBeam.time=combatPowerTime;friendlyBeam.endY=1.42+beamSlope*38.68;friendlyBeam.endZ=40;
        boss_pose::Contact BeamContact{};
        if(phase==Phase::Boss&&UsesSpatialBoss()){
            const boss_pose::Vec3 Start{x,1.42,-1.32},End{x,1.42+beamSlope*38.68,-40};
            BeamContact=InstantRay(Start,End,.5,bossFrame);
            if(BeamContact.status==boss_pose::SweepStatus::Hit){friendlyBeam.endX=x;friendlyBeam.endY=1.42+beamSlope*38.68*BeamContact.fraction;friendlyBeam.endZ=1.32+38.68*BeamContact.fraction;}
        }
        while(combatClock+1e-9>=(combatPulses+1)*.1&&combatPulses<int(std::ceil(TempestSeconds()*10*(1+rewardEndurance*.15)))){++combatPulses;
            // Campaign laser cannon: everything in its path except the Tyrant is
            // erased - shields, elites and rollers included. Older fronts keep chip damage.
            const bool Erase=campaign;
            if(phase==Phase::Run||(Erase&&phase==Phase::Boss)){for(auto& T:targets){if(!T.active||T.z<1.32||T.z>40||std::abs(T.x-x)>T.size+.5)continue;
                if(Erase&&T.kind==Kind::Hazard){T.active=false;Emit(EffectKind::HazardBreak,T.x,T.z,0,T.id,-6,T.size);continue;}
                if(T.hp<=0)continue;
                if(T.kind==Kind::Enemy)HitTarget(T,Erase||T.variant==0?T.hp:12*(1+rewardLaser*.25),FriendlyKind::Arc,Erase);else if(T.kind==Kind::Crate||T.kind==Kind::Orb)HitTarget(T,Erase?T.hp:8,FriendlyKind::Arc);}}

            if(phase==Phase::Boss&&UsesSpatialBoss()){
                const auto H=BeamContact;
                if(H.status==boss_pose::SweepStatus::Hit){DamageRegion(int(H.region),(campaign?6:15)*(1+rewardLaser*.25),H.point,FriendlyKind::Arc,combatEpoch);friendlyBeam.endX=x;friendlyBeam.endY=1.42+beamSlope*38.68*H.fraction;friendlyBeam.endZ=1.32+38.68*H.fraction;}
                else if(H.status==boss_pose::SweepStatus::Unresolved)++sweepUnresolved;
            }else if(phase==Phase::Boss&&std::abs(x-bossX)<2.4)DamageBoss(15*(1+rewardLaser*.25),x,FriendlyKind::Arc);
        }
    }
    if(combatPower==CombatPower::ArcStorm){
        while(combatClock+1e-9>=combatPulses*.3&&combatPulses<int(std::ceil(4*(1+rewardEndurance*.15)))){++combatPulses;
            double X=x,Y=1.42,Z=1.32;std::array<int,3> Seen{};int Count=0;
            for(int C=0;C<3;++C){Target* Best=nullptr;double Dist=C==0?18.:6.;for(auto& T:targets)if(T.active&&T.kind==Kind::Enemy&&T.z>0&&T.z<24&&std::find(Seen.begin(),Seen.begin()+Count,T.id)==Seen.begin()+Count){const double D=std::hypot(T.x-X,T.z-Z);if(D<Dist){Dist=D;Best=&T;}}if(!Best)break;Seen[Count++]=Best->id;const double EndX=Best->x,EndY=Best->variant?1.7:1.,EndZ=Best->z;const double Before=Best->hp;HitTarget(*Best,32,FriendlyKind::Arc);Emit(EffectKind::ChainHit,X,Z,int(std::ceil(Before-Best->hp)),Best->id,9,.25);auto& E=effects[effectCount-1];E.y=Y;E.endX=EndX;E.endY=EndY;E.endZ=EndZ;E.endpoint=true;X=EndX;Y=EndY;Z=EndZ;}
            if(Count==0&&phase==Phase::Boss&&UsesSpatialBoss()){const int Id=AimRegion(x,true,combatPulses);const auto P=bossFrame.regions[Id].aimCenter;
                const auto H=InstantRay({x,1.42,-1.32},P,.04,bossFrame);if(H.status==boss_pose::SweepStatus::Hit){const double Before=bossHp;DamageRegion(int(H.region),18,H.point,FriendlyKind::Arc,combatEpoch);Emit(EffectKind::ChainHit,x,1.32,int(std::ceil(Before-bossHp)),0,9,.25);auto& E=effects[effectCount-1];E.y=1.42;E.endX=H.point.x;E.endY=H.point.y;E.endZ=-H.point.z;E.endpoint=true;E.hitRegion=int(H.region);}else if(H.status==boss_pose::SweepStatus::Unresolved)++sweepUnresolved;}
        }
    }
    if(combatPower==CombatPower::Salvo)while(combatClock+1e-9>=combatPulses*.28&&combatPulses<int(std::ceil(6*(1+rewardEndurance*.15)))){GroundSalvo();++combatPulses;}
    combatPowerTime=std::max(0.,combatPowerTime-Dt);
    if(combatPowerTime<=0){combatPower=CombatPower::None;friendlyBeam.time=0;}
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
            if(P.kind==PickupKind::Health){const double Before=commanderHp;commanderHp=std::min(commanderMaxHp,commanderHp+28);Emit(EffectKind::HealthPickup,x,.8,int(commanderHp-Before),P.id,11,1);}
            else if(int(P.kind)>=8) BeginCombatPower(P.kind);
            else if(int(P.kind)<=3 || P.kind==PickupKind::Escort) { weaponPower=P.kind==PickupKind::Escort?WeaponPower::Escort:static_cast<WeaponPower>(P.kind); powerTime=UsesSpatialBoss()?12:10+rank*.3; escortShield=P.kind==PickupKind::Escort?30:0; }
            else { timePower=static_cast<TimePower>(int(P.kind)-3); timePowerTime=P.kind==PickupKind::Freeze?3:5; }
            if(P.choiceGroup) for(auto& Other:pickups) if(Other.active && Other.choiceGroup==P.choiceGroup) { Other.active=false; Emit(EffectKind::Missed,Other.x,Other.z,int(Other.kind),Other.id,-4,Other.radius); }
            if(P.bonusTroops>0){const int Before=army;Recruit(P.bonusTroops);if(army>Before)Emit(EffectKind::Recruit,P.x,.8,army-Before,P.id,-2,.3);}
            Charge(UsesSpatialBoss()?10:25); score+=15;
            Emit(EffectKind::Pickup,P.x,.8,int(P.kind),P.id,-4,P.radius);
        }
        else Emit(EffectKind::Missed,P.x,.8,int(P.kind),P.id,-4,P.radius);
    }
}
void Battle::MoveTargets(double Dt,double TravelDelta)
{
    const bool Emp=RelicActive(Relic::EMP); engagement=false;
    // Process closest machines first so following rows queue rather than overlap.
    std::array<Target*,MaxTargets> Ordered{}; int Count=0;
    for(auto& T:targets) if(T.active) Ordered[Count++]=&T;
    std::sort(Ordered.begin(),Ordered.begin()+Count,[](const Target* A,const Target* B){return A->z<B->z || (A->z==B->z && A->id<B->id);});
    for(int I=0;I<Count;++I)
    {
        Target& T=*Ordered[I]; if(!T.active) continue; T.hit=std::max(0.,T.hit-Dt);T.blockFlash=std::max(0.,T.blockFlash-Dt); T.stunTime=std::max(0.,T.stunTime-Dt);
        if(T.role==3 && T.z<26 && T.stunTime<=0) { T.ventClock+=Dt; const double Cycle=std::fmod(T.ventClock,5.2); T.ventOpen=Cycle>=3.6; T.ventTime=T.ventOpen?5.2-Cycle:3.6-Cycle; }
        if(T.kind==Kind::Enemy)
        {
            const double BeforeZ=T.z,BeforeX=T.x;ArchetypeStep(T,Dt);
            double Near=-10;
            for(int J=0;J<I;++J) if(Ordered[J]->active && Ordered[J]->kind==Kind::Enemy && std::abs(Ordered[J]->x-T.x)<Ordered[J]->size+T.size+.05)
                Near=std::max(Near,Ordered[J]->z+Ordered[J]->depth+T.depth+(T.variant>0&&Ordered[J]->variant>0&&(T.archetype>0||Ordered[J]->archetype>0)?2.2:.10));
            const double Approach=(T.stunTime>0 || (timePower==TimePower::Freeze && T.z<18) || (UsesSpatialBoss() && (T.role==1 || T.role==2) && (T.fireState==FireState::Locked || T.fireState==FireState::Fire)))?0:1*(UsesSpatialBoss() && T.role>0 && T.role<3 && T.z<28?.55:1);
            T.z=std::max(Near,T.z-TravelDelta*Approach-Dt*.25*Approach-(T.archetype==2 && T.skillState==2 && T.stunTime<=0?Dt*6*HostileSpeed():0));
            int Slot=-1; double HitX=0,HitZ=0;
            if(T.op==0 && FormationHit(BeforeX,BeforeZ,T.x,T.z,T.size,true,Slot,HitX,HitZ,T.depth))
            {
                Emit(EffectKind::Contact,T.x,T.z,T.value,T.id,T.variant,T.size);
                if(Slot<0)DamageCommander(T.value);else DamageArmy(T.value,HitX,HitZ,T.id,Slot);
                if(phase==Phase::LastStand || phase==Phase::Lost) return;
                HitTarget(T,8+weapon*2.);
                if(!T.active) { if(phase==Phase::Lost || phase==Phase::LastStand) return; continue; }
                // Surviving elites recoil in front, then leave sideways; they
                // cannot slide through the protected army while disengaging.
                T.op=2; T.z=std::max(1.8,T.z+2.2); T.originX=T.x>=x?6:-6; engagement=true;
            }
            else if(T.stunTime>0) { T.fireState=FireState::Reload; T.charge=0; }
            else if(UsesSpatialBoss() && (T.role==1 || T.role==2)) RangedStep(T,Dt);
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
                if(Slot<0)DamageCommander(T.value);else DamageArmy(T.value,HitX,HitZ,T.id,Slot); T.active=false;
                Emit(EffectKind::HazardBreak,T.x,T.z,0,T.id,-6,T.size); if(phase==Phase::LastStand||phase==Phase::Lost)return;continue;
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
            const int Before=army,After=std::clamp(T.op==1?army*T.value:army+(campaign&&T.value<0?int(std::floor(T.value/4.)):T.value),0,ArmyCap());
            if(After>=Before) Recruit(After-Before);
            else { DamageArmy(Before-After,T.x,0,T.id); if(After==0 && phase!=Phase::Lost) { commanderHp=0; army=0; formationAlive.fill(false); visualStrength=0; phase=Phase::Lost; Emit(EffectKind::CommanderDeath,x,0,0,0,-5,1.2); } }
            score+=army-Before; Charge(UsesSpatialBoss()?5:15); Emit(EffectKind::Gate,T.x,0,T.value,T.id,0,T.size);
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
    if(UsesSpatialBoss())
    {
        SyncPosePosition();const auto Sockets=boss_pose::PosedSockets(bossFrame);
        const auto P=Emitter==WeaponEmitter::ArmL?Sockets.armL:Emitter==WeaponEmitter::ArmR?Sockets.armR:Emitter==WeaponEmitter::ShoulderL?Sockets.shoulderL:Emitter==WeaponEmitter::ShoulderR?Sockets.shoulderR:Sockets.core;
        if(!P.active)return;
        SpawnEnemyShot(P.position.x,-P.position.z,AimX,Speed,Radius,Damage,Type,true,0,Emitter,P.position.y);return;
    }
    const double ReleaseY=(bossPartsMask&48)==48?GroundY():(bossPartsMask&12)==12?GroundY():.85;
    SpawnEnemyShot(bossX+X,bossZ+Z,AimX,Speed,Radius,Damage,Type,true,0,Emitter,ReleaseY+Y);
}
void Battle::BossVolley()
{
    ++bossVolleys;
    const double Boost=UsesSpatialBoss()?committedAttackBoost:bossPhase==2?1.12:1;
    if(bossPattern==BossPattern::Heavy)
        BossProjectile(bossVolleys%2?WeaponEmitter::ArmL:WeaponEmitter::ArmR,bossLane,(UsesSpatialBoss()?8.:7.5)*Boost,.58,UsesSpatialBoss()?24:bossPhase==2?34:27,ProjectileKind::Shell);
    else if(bossPattern==BossPattern::Sweep)
    {
        BossProjectile(WeaponEmitter::ArmL,UsesSpatialBoss()?std::clamp(bossLane-(SweepCount()-1)*.225,-3.6,3.6):-3.,(UsesSpatialBoss()?7.:6)*Boost,.2,UsesSpatialBoss()?10:8,ProjectileKind::Orb);
        sweepIndex=1; sweepClock=0;
    }
    else if(bossPattern==BossPattern::Laser)
    {
        for(auto& L:lasers) if(!L.active)
        {
            SyncPosePosition();const auto P=boss_pose::PosedSockets(bossFrame).core.position;
            const double OriginZ=UsesSpatialBoss()?-P.z:bossZ-.85,OriginX=UsesSpatialBoss()?P.x:bossX,Length=OriginZ+5,EndX=OriginX+(bossLane-OriginX)*Length/OriginZ;
            L={nextLaserId++,OriginX,OriginZ,EndX,-5,.80,.65,0,true};L.y=P.y;L.endY=.22; break;
        }
    }
    else
    {
        const int N=RocketHalfCount();
        for(int I=-N;I<=N;++I) BossProjectile((I+N)%2?WeaponEmitter::ShoulderR:WeaponEmitter::ShoulderL,std::clamp(bossLane+I*.7,-3.6,3.6),(UsesSpatialBoss()?7.8:7)*Boost,.3,UsesSpatialBoss()?(bossPhase==2?12:10):14,ProjectileKind::Rocket);
    }
    Emit(EffectKind::BossShot,bossX,bossZ,int(bossPattern),0,3,2.7);
}
void Battle::ClipLaserToShield(Laser& L)
{
    if(!L.active||(clash.active&&clash.laserId==L.id))return;
    if(L.shieldClipped){L.endX=L.unoccludedEndX;L.endY=L.unoccludedEndY;L.endZ=L.unoccludedEndZ;L.shieldClipped=false;}
    double X,Y,Z;
    if(ShieldPlateHit(L.x,L.y,L.z,L.endX,L.endY,L.endZ,L.width*.5,X,Y,Z)){
        L.unoccludedEndX=L.endX;L.unoccludedEndY=L.endY;L.unoccludedEndZ=L.endZ;
        L.endX=X;L.endY=Y;L.endZ=Z;L.shieldClipped=true;
    }
}
void Battle::MoveLasers(double Dt)
{
    for(auto& L:lasers) if(L.active)
    {
        ClipLaserToShield(L);
        const double Step=Dt*(timePower==TimePower::Freeze?0:timePower==TimePower::Slow?.5:timePower==TimePower::Haste?1.35:1);
        L.time=std::max(0.,L.time-Step); L.tick-=Step;
        if(L.tick<=0 && Step>0)
        {
            L.tick+=.17;
            if(L.shieldClipped){Emit(EffectKind::ShieldHit,L.endX,L.endZ,12,L.id,-6,L.width*.5);auto& E=effects[effectCount-1];E.spatial=true;E.y=L.endY;}
            else {int Slot=-1; double X=0,Z=0;
                if(FormationHit(L.x,L.z,L.endX,L.endZ,L.width*.5,true,Slot,X,Z)) { if(Slot<0) DamageCommander(12); else DamageArmy(6,X,Z,L.id,Slot); }
            }
        }
        if(L.time<=0) L.active=false;
        if(phase==Phase::Lost || phase==Phase::LastStand) return;
    }
}
void Battle::BeginBossDeath()
{
    if(phase!=Phase::Boss) return;
    combatPower=CombatPower::None;combatPowerTime=0;friendlyBeam.time=0;bossEvadeTime=bossEvadeTell=bossFiringWindow=0;
    phase=Phase::Destroying; bossState=BossState::Destroying; bossHp=0; bossAction=BossAction::Dying; bossAttack=0; deathClock=deathProgress=0;
    for(auto& S:shots) S.active=false; for(auto& S:enemyShots) S.active=false; for(auto& L:lasers) L.active=false;
    Emit(EffectKind::BossDeath,bossX,bossZ,0,0,3,2.7);
}
void Battle::BossStep(double Dt)
{
    const double BossDt=Dt*(empStunTime>0?0:timePower==TimePower::Freeze?0:timePower==TimePower::Slow?.5:timePower==TimePower::Haste?1.35:1);
    if(BossDt<=0) return;
    armorBudget=std::min(45.,armorBudget+(110+level*20)*(bossRevives?.8:1)*Dt);
    if(bossState==BossState::Exposed && (UsesSpatialBoss() || bossRevives==0))
    {
        bossCoreTime=std::max(0.,bossCoreTime-BossDt);
        if(bossCoreTime<=0)
        {
            if(bossRevives==0)
            {
                bossRevives=1; bossState=BossState::Rebuilding;if(UsesSpatialBoss())++bossEpoch; rebuildClock=UsesSpatialBoss()?1.:1.8;
                bossArmorMax=UsesSpatialBoss()?277.5:(1850+level*450)*.55; bossArmor=bossArmorMax;if(UsesSpatialBoss())guardHp=guardMax=bossArmorMax; UpdateBossHealth();
                Emit(EffectKind::BossRevive,bossX,bossZ,1,0,3,2.7);
            }
            else { bossState=BossState::Guarded;if(UsesSpatialBoss())++bossEpoch; coreGuardClock=3.8; bossClock=0; bossLaneLocked=false; }
        }
    }
    if(UsesSpatialBoss() && bossState==BossState::Guarded)
    {
        coreGuardClock=std::max(0.,coreGuardClock-BossDt);
        if(coreGuardClock<=0 && firePose<=0)
        { bossState=BossState::Exposed; bossCoreTime=5.0;if(UsesSpatialBoss())++bossEpoch; Emit(EffectKind::CoreExpose,bossX,bossZ,50,0,4,.9); }
    }
    if(bossState==BossState::Rebuilding)
    {
        rebuildClock=std::max(0.,rebuildClock-BossDt); bossAction=BossAction::Windup; bossAttack=0;
        if(rebuildClock<=0) { bossState=BossState::Armored; bossClock=0; bossLaneLocked=false; }
        return;
    }
    bossAge+=BossDt;
    if(UsesSpatialBoss() && bossZ<=12.01 && (bossPartsMask&12)!=12 && bossState==BossState::Armored && evades<3 && bossAge>=nextEvade && !bossLaneLocked && firePose<=0 && sweepIndex<0 && bossClock<1.4) {
        bool Clear=true;for(const auto& L:lasers)Clear &= !L.active;
        if(Clear){++evades;bossEvadeTime=1.2;bossEvadeTell=.35;evadeTarget=bossX>=0?-1.9:1.9;nextEvade=bossAge+9;}
    }
    if(bossEvadeTime>0){bossAction=BossAction::Evade;bossAttack=0;bossEvadeTime=std::max(0.,bossEvadeTime-BossDt);bossEvadeTell=std::max(0.,bossEvadeTell-BossDt);if(bossEvadeTell<=0)bossX+=std::clamp(evadeTarget-bossX,-4.5*BossDt,4.5*BossDt);if(bossEvadeTime<=0){bossFiringWindow=1.4;bossClock=0;}return;}
    if(bossFiringWindow>0){bossFiringWindow=std::max(0.,bossFiringWindow-BossDt);bossAction=BossAction::Strafe;bossAttack=0;return;}
    bossY=(bossPartsMask&48)==48?GroundY():(bossPartsMask&12)==12?GroundY():1.2+(bossPhase==2?.85:.55)*(1+std::sin(bossAge*1.5));
    if(bossZ>12.01 && bossAge<3)
    {
        bossZ=std::max(12.,bossZ-14.5*BossDt); bossAction=BossAction::Advance;
        const double Blend=std::clamp((bossZ-12.)/7.25,0.,1.);
        bossY+=(2.8-bossY)*Blend*Blend*(3.-2.*Blend); bossAttack=0;
        if(bossZ<=12.0001 && !bossArrived) { bossArrived=true; bossClock=UsesSpatialBoss()?1.6:0; } return;
    }
    if(bossPhase==1 && bossHp<=bossMax*.5)
    { bossPhase=2; Emit(EffectKind::BossPhase,bossX,bossZ,2,0,3,2.7); }
    const double Cycle=std::fmod(std::max(0.,bossAge-3.),16.);
    const double DesiredZ=Cycle>5 && Cycle<9?8.5:12.;
    // Booster dashes happen between committed attacks; the firing origin and
    // aim stay physically steady during lock, recoil and active beam travel.
    bool BeamActive=false; for(const auto& L:lasers) BeamActive |= L.active;
    const bool Hold=bossLaneLocked || firePose>0 || BeamActive || bossClock+BossDt*(RelicActive(Relic::EMP)?.5:1)>=1.8;
    if((bossPartsMask&48)!=48 && !Hold)
    {
        if((bossPartsMask&12)!=12)
        {
            if(bossClock>=.30 && bossClock<1.20)
            {
                const double DesiredX=bossVolleys%2==0?2.05:-2.05;
                const double Envelope=std::clamp(std::min((bossClock-.30)/.15,(1.20-bossClock)/.15),0.,1.);
                const double Speed=std::min((UsesSpatialBoss()&&(bossPartsMask&12)!=0?4.:6.)*Envelope,std::abs(DesiredX-bossX)*7.);
                bossX+=std::clamp(DesiredX-bossX,-Speed*BossDt,Speed*BossDt);
                bossZ+=std::clamp(DesiredZ-bossZ,-3.8*BossDt,3.8*BossDt);
            }
        }
        else
        {
            const double DesiredX=2.15*std::sin(std::max(0.,bossAge-3.)*.72);
            const double Walk=UsesSpatialBoss()&&(bossPartsMask&48)!=0?1.45:2.7;
            bossX+=std::clamp(DesiredX-bossX,-Walk*BossDt,Walk*BossDt);
            bossZ+=std::clamp(DesiredZ-bossZ,-Walk*.80*BossDt,Walk*.80*BossDt);
        }
    }
    bossAction=std::abs(DesiredZ-bossZ)>.1?(DesiredZ<bossZ?BossAction::Advance:BossAction::Retreat):BossAction::Strafe;
    if(UsesSpatialBoss() && bossState==BossState::Exposed)
    { bossAction=BossAction::Strafe; bossAttack=0; firePose=0; sweepIndex=-1; return; }
    firePose=std::max(0.,firePose-BossDt); // Campaign enrage: every broken part makes the Tyrant attack faster.
    const double Enrage=campaign?1.+.09*__builtin_popcount(unsigned(bossPartsMask)):1.;
    bossClock+=BossDt*Enrage*(RelicActive(Relic::EMP)?.5:1);ventTime=std::max(0.,ventTime-BossDt);
    if(firePose<=0 && !bossLaneLocked) {
        if(campaign){static constexpr BossPattern Patterns[]={BossPattern::Heavy,BossPattern::Rockets,BossPattern::Laser,BossPattern::Sweep,BossPattern::Rockets,BossPattern::Laser};bossPattern=Patterns[bossVolleys%6];}
        else if(StageLevel()==3){static constexpr BossPattern Patterns[]={BossPattern::Rockets,BossPattern::Sweep,BossPattern::Rockets,BossPattern::Heavy};bossPattern=Patterns[bossVolleys%4];}
        else if(StageLevel()==4){static constexpr BossPattern Patterns[]={BossPattern::Heavy,BossPattern::Laser,BossPattern::Sweep,BossPattern::Laser};bossPattern=Patterns[bossVolleys%4];}
        else bossPattern=static_cast<BossPattern>((bossVolleys+level)%4);
        if(campaign && !bossClashed && bossAge>=5 && bossVolleys%3==1)bossPattern=BossPattern::Laser;
        if(bossPattern==BossPattern::Heavy && (bossPartsMask&3)==3) bossPattern=BossPattern::Laser;
        if(bossPattern==BossPattern::Rockets && (bossPartsMask&12)==12) bossPattern=BossPattern::Sweep;
    }
    if(sweepIndex>=0)
    {
        // Every pending birth uses the same actual Fire root height as the rig.
        if(UsesSpatialBoss())bossY=(bossPartsMask&48)==48?GroundY():(bossPartsMask&12)==12?GroundY():.85;
        sweepClock+=BossDt;
        while(sweepClock>=.14 && sweepIndex<SweepCount())
        {
            sweepClock-=.14;
            if(UsesSpatialBoss()) BossProjectile(sweepIndex%2?WeaponEmitter::ArmR:WeaponEmitter::ArmL,std::clamp(bossLane-(SweepCount()-1)*.225+sweepIndex*.45,-3.6,3.6),7*committedAttackBoost,.2,10,ProjectileKind::Orb);
            else BossProjectile(sweepIndex%2?WeaponEmitter::ArmR:WeaponEmitter::ArmL,-3+sweepIndex,6*(bossPhase==2?1.12:1),.2,(bossPartsMask&3)==3?6:8,ProjectileKind::Orb);
            if(++sweepIndex>=SweepCount()) sweepIndex=-1;
        }
    }
    const double Windup=bossPattern==BossPattern::Laser?(StageLevel()==4?1.65:1.4):bossPattern==BossPattern::Heavy?(bossPhase==2?1.15:1.35):.95;
    if(bossClock>=1.8 && !bossLaneLocked) { const double Aim=std::clamp(x,-3.,3.); if(!UsesSpatialBoss() || AdmitBoss(Windup,Aim)) { bossLane=Aim;bossLaneLocked=true;if(campaign && !bossClashed && bossPattern==BossPattern::Laser)laserCharges=1;committedAttackBoost=bossPhase==2?1.20:1; } else bossClock=1.5; }
    bossAttack=bossLaneLocked?std::clamp((bossClock-1.8)/Windup,0.,1.):0;
    if(bossLaneLocked) { bossAction=BossAction::Windup; bossY=(bossPartsMask&48)==48?GroundY():(bossPartsMask&12)==12?GroundY():std::max(.75,bossY-1.0*bossAttack); }
    if(bossClock>=1.8+Windup)
    {
        bossY=(bossPartsMask&48)==48?GroundY():(bossPartsMask&12)==12?GroundY():.85;
        BossVolley(); if(campaign&&(bossPattern==BossPattern::Laser||bossPattern==BossPattern::Heavy))ventTime=2.0; firePose=bossPattern==BossPattern::Sweep?1.1:bossPattern==BossPattern::Laser?.5:.4; bossClock=-.3; bossLaneLocked=false; bossAttack=1;
    }
    if(firePose>0) { bossAction=BossAction::Fire; bossAttack=1; bossY=(bossPartsMask&48)==48?GroundY():(bossPartsMask&12)==12?GroundY():.85; }
}
void Battle::Step(double Dt)
{
    if(phase==Phase::Reviving){reviveCinematicTime=std::max(0.,reviveCinematicTime-Dt);if(reviveCinematicTime<=0){phase=resumePhase;reviveProtection=1.5;}return;}
    time+=Dt;clashTapCooldown=std::max(0.,clashTapCooldown-Dt);healthDropClock=std::max(0.,healthDropClock-Dt);
    if(clash.active){ClashStep(Dt);return;}
    if(phase==Phase::Destroying)
    {
        deathClock+=Dt; deathProgress=std::min(1.,deathClock/2.5);
        if(deathClock+1e-9>=2.5) { if(campaign){phase=Phase::Reward;score+=300+actIndex*100;return;} phase=Phase::Won; rankReward=rank<5?1:0; score+=200+level*100; Emit(EffectKind::Win,bossX,bossZ,score,0,3,2.7); }
        return;
    }
    empPulseTime=std::max(0.,empPulseTime-Dt); empStunTime=std::max(0.,empStunTime-Dt);
    timePowerTime=std::max(0.,timePowerTime-Dt); if(timePowerTime<=0) timePower=TimePower::None;
    reviveProtection=std::max(0.,reviveProtection-Dt);
    if(campaign){for(auto& T:relicTime)T=std::max(0.,T-Dt);ability=relicTime[int(relic)];energy=relicEnergy[int(relic)];}
    else ability=std::max(0.,ability-Dt); x+=std::clamp(desiredX-x,-9*Dt,9*Dt);
    powerTime=std::max(0.,powerTime-Dt); if(powerTime<=0) { weaponPower=starterWeapon; escortShield=0; }
    if(phase==Phase::Boss)
    {
        if(UsesSpatialBoss()){previousBossFrame=bossFrame;collapseTime=std::max(0.,collapseTime-Dt);}
        BossStep(Dt);UpdatePose(Dt);
        for(auto& T:targets) if(T.active && T.kind==Kind::Enemy)
        {
            T.x+=std::clamp(T.originX-T.x,-6*Dt,6*Dt); T.z-=Dt;
            if(std::abs(T.x)>=5.8) { T.active=false; Emit(EffectKind::Retreat,T.x,T.z,0,T.id,T.variant,T.size); }
        }
    }
    if(phase==Phase::Run)
    {
        const double Delta=std::min(3.7*Dt*(timePower==TimePower::Slow?.5:timePower==TimePower::Haste?1.35:1),travelGoal-travelDistance);
        travelDistance+=Delta; UpdateZone(); SpawnTimeline(); MoveTargets(Dt,Delta);
        if(phase==Phase::Lost || phase==Phase::LastStand) return;
    }
    MovePickups(Dt);if(BeginClash())return;CombatStep(Dt);if(phase==Phase::Destroying)return;BarrageStep(Dt);
    fireClock+=Dt; const double Cadence=(UsesSpatialBoss()?.34-(weapon-1)*.02:.30-(weapon-1)*.025)/(weaponPower==WeaponPower::Cannons?(UsesSpatialBoss()?1.35:1.75):1);
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
            bossPattern=static_cast<BossPattern>(StageLevel()%3);if(campaign){laserCharges=1;bossClashed=false;}
            if(UsesSpatialBoss()){boss_pose::Pose P;P.position={bossX,bossY,-bossZ};poseDriver.Reset(P);bossFrame=previousBossFrame=boss_pose::BuildFrame(P,bossPartsMask);}
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
