// Production-method fixtures isolate state transitions; public-route feasibility
// below uses only Start, Advance, ActivateRelic, FireLaser, ClashTap and rewards.
#include <array>
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#define private public
#include "AssaultSimulation.h"
#undef private
using namespace mech::assault;
static int Cases=0;
static void Check(bool Ok,const char* Label){if(!Ok){std::fprintf(stderr,"FAIL %s\n",Label);std::exit(1);}++Cases;}
static void Boss(Battle& B){B.Start(Relic::Shield,5,0);B.phase=Phase::Boss;B.bossX=0;B.bossZ=12;B.bossY=.85;mech::boss_pose::Pose P;P.position={0,.85,-12};B.poseDriver.Reset(P);B.bossFrame=B.previousBossFrame=mech::boss_pose::BuildFrame(P,0);for(auto& T:B.targets)T.active=false;}
static double Route(const Battle& B){
 if(B.phase==Phase::Boss){
  double Desired=B.bossX,Best=1e9;for(int I=0;I<7;++I)if(B.RegionVulnerable(I)&&B.RegionHp(I)>0){const double D=B.RegionHp(I)+std::abs(B.bossFrame.regions[I].aimCenter.x-B.x);if(D<Best){Best=D;Desired=B.bossFrame.regions[I].aimCenter.x;}}
  for(const auto& P:B.pickups)if(P.active&&P.z<5.5&&(P.kind==PickupKind::Health&&B.commanderHp<B.commanderMaxHp-18||P.bonusTroops>0&&B.army<45))Desired=P.x;
  if(B.clash.result==0 && B.bossPattern==BossPattern::Laser&&B.bossAttack>.4)return B.bossLane;
  for(const auto& L:B.lasers)if(L.active)return B.bossLane>0?-3:3;
  if(B.bossPattern==BossPattern::Laser&&B.bossAttack>.3)return B.bossLane>0?-3:3;
  std::array<double,6> Lanes{{Desired,-2.8,2.8,-1.5,1.5,0}};double Value=1e9,Choice=Desired;
  for(double X:Lanes){double V=std::abs(X-Desired);for(const auto& S:B.enemyShots)if(S.active&&S.z<5.5){const double Hit=S.x-S.dx*S.z/S.dz;if(std::abs(X-Hit)<S.radius+.5)V+=50;}if(V<Value){Value=V;Choice=X;}}
  return Choice;
 }
 double Desired=0,Best=1e9;for(const auto& T:B.targets)if(T.active&&T.z>1&&T.z<29&&(T.kind==Kind::Crate||T.kind==Kind::Gate||T.kind==Kind::Orb||(T.kind==Kind::Enemy&&T.variant>0&&T.z<14))){if(T.z<Best){Best=T.z;Desired=T.x;}}
 for(const auto& P:B.pickups)if(P.active&&P.z<6&&P.z<Best){Best=P.z;Desired=P.x;}
 for(const auto& T:B.targets)if(T.active&&T.kind==Kind::Gate&&T.z>0&&T.z<3.5){const Target* Good=&T;for(const auto& G:B.targets)if(G.active&&G.kind==Kind::Gate&&std::abs(G.z-T.z)<.02&&(G.op?B.army*(G.value-1):G.value)>(Good->op?B.army*(Good->value-1):Good->value))Good=&G;Desired=Good->x;break;}
 for(const auto& T:B.targets)if(T.active&&T.kind==Kind::Hazard&&T.z<3&&std::abs(T.x-Desired)<T.size+.5)Desired=T.x>0?-3:3;
 return Desired;
}
int main(int argc,char** argv){
 const bool Alternate=argc>1;
 {Battle B;B.Start(Relic::Shield,5);Check(B.campaign&&B.StageLevel()==0&&B.duration==90,"campaign starts at reactor");B.relicEnergy={100,100,100};Check(B.ActivateRelic(Relic::Shield),"shield slot works");Check(B.ActivateRelic(Relic::EMP),"EMP overlaps shield");Check(B.ActivateRelic(Relic::Overdrive),"overdrive overlaps EMP");Check(B.RelicActive(Relic::Shield)&&B.RelicActive(Relic::EMP)&&B.RelicActive(Relic::Overdrive),"three timers independent");B.Advance(.1,0);Check(B.relicTime[0]>3.8&&B.relicTime[1]>1.8&&B.relicTime[2]>4.8,"three timers advance once");B.paused=true;const auto R=B.relicTime;B.Advance(.25,0);Check(R==B.relicTime,"pause freezes relics");}
 {Battle B;B.Start(Relic::Shield,5);B.SpawnArchetype(1,0,100);auto& T=*std::find_if(B.targets.begin(),B.targets.end(),[](const Target& T){return T.archetype==1;});const double Hp=T.hp;for(int I=0;I<3;++I){T.blockFlash=0;B.HitTarget(T,20);Check(T.hp==Hp&&T.shieldHp==2-I,"shield really blocks each attack");}B.HitTarget(T,20);Check(T.hp==Hp-20,"broken shield exposes health");}
 {Battle B;B.Start(Relic::Shield,5);B.commanderHp=50;B.DropPickup(0,.5,PickupKind::Health,0);B.MovePickups(1./60);Check(B.commanderHp==78,"health pickup heals actual commander");B.commanderHp=99;B.DropPickup(0,.5,PickupKind::Health,0);B.MovePickups(1./60);Check(B.commanderHp==100,"health pickup capped");}
 {Battle B;B.Start(Relic::Shield,5);const int Army=B.army;B.SpawnEnemyShot(0,.5,0,8,.1,20,ProjectileKind::Shell,false);B.MoveEnemyShots(.1);Check(B.commanderHp==80&&B.army==Army,"direct projectile hits commander with troops alive");double X,Z;B.TroopPosition(0,X,Z);B.SpawnEnemyShot(X,Z+.25,X,8,.1,2,ProjectileKind::Shell,false);B.MoveEnemyShots(.1);Check(B.army==Army-2&&B.commanderHp==80,"rear troop hit does not steal commander health");}
 {Battle B;B.Start(Relic::Shield,5);B.Recruit(30);B.DamageCommander(200);Check(B.phase==Phase::LastStand&&B.CanRevive(),"commander can fall with revival troops alive");const int Army=B.army;Check(B.Revive()&&B.phase==Phase::Reviving&&B.army==Army-12,"revival spends twelve troops and starts cinematic");const double Time=B.time,Distance=B.travelDistance;for(int I=0;I<60;++I)B.Advance(1./60,3);Check(B.time==Time&&B.travelDistance==Distance&&B.phase==Phase::Reviving,"revival holds threats and travel");for(int I=0;I<31;++I)B.Advance(1./60,3);Check(B.phase==Phase::Run&&B.reviveProtection>1.4,"revival resumes with protection");}
 {Battle B;B.Start(Relic::Shield,5);B.weapon=4;B.army=42;B.commanderHp=70;B.travelDistance=B.travelGoal;B.phase=Phase::Reward;Check(!B.ChooseReward(8),"invalid reward rejected");Check(B.ChooseReward(1)&&B.actIndex==1&&B.StageLevel()==3&&B.army==42&&B.weapon==4&&B.commanderHp==105&&B.commanderMaxHp==120,"reward preserves army weapon and heals bounded vitality");Check(B.travelDistance==333&&B.travelGoal>333,"world travel continuous between acts");B.phase=Phase::Reward;Check(B.ChooseReward(0)&&B.actIndex==2&&B.rewardLaser==1&&B.StageLevel()==4,"third act receives chosen laser buff");Check(!B.ChooseReward(2),"reward cannot be applied twice");}
 for(bool Taps:{false,true}){Battle B;Boss(B);B.lasers[0]={1,0,11,0,-5,.8,.65,0,true,5,.22};B.BeginCombatPower(PickupKind::Tempest);Check(B.BeginClash(),"real overlapping beams begin clash");const double HP=B.commanderHp;Check(B.ClashTap()&&!B.ClashTap(),"clash tap capped");if(!Taps)B.clash.progress=.48;for(int I=0;I<200&&B.clash.active;++I){if(Taps)B.ClashTap();B.Advance(1./60,0);}Check(!B.clash.active&&B.clash.result==(Taps?1:2),"clash resolves actual input");Check(Taps?B.commanderHp==HP:B.commanderHp==HP-18,"clash loss fair fixed hit and no leaked beam damage");}
 {Battle B;Boss(B);B.x=-3;B.lasers[0]={1,2,11,2,-5,.8,.65,0,true};B.BeginCombatPower(PickupKind::Tempest);Check(!B.BeginClash(),"nonintersecting beams do not clash");}
 {Battle B;B.Start(Relic::Shield,5);Check(B.ApplyLegacyReward(1)&&B.commanderHp==120&&B.commanderMaxHp==120,"legacy vitality increases real starting health");Check(!B.ApplyLegacyReward(0)&&B.rewardLaser==0,"legacy cannot stack twice");B.Start(Relic::EMP,0);Check(!B.ApplyLegacyReward(1),"legacy cannot alter practice");B.Start(Relic::Shield,5);B.Advance(.1,0);Check(!B.ApplyLegacyReward(0),"legacy cannot be added after play starts");B.Start(Relic::Shield,5);Check(!B.ApplyLegacyReward(8)&&B.ApplyLegacyReward(0)&&B.rewardLaser==1,"invalid legacy does not consume valid imprint");}
 {for(bool EMP:{false,true}){Battle B;B.Start(Relic::Shield,5);for(auto& T:B.targets)T.active=false;B.SpawnArchetype(2,0,100);auto& T=*std::find_if(B.targets.begin(),B.targets.end(),[](const Target& T){return T.archetype==2;});T.z=10;T.skillState=2;T.skillClock=.4;T.aimX=2;if(EMP){T.stunTime=1;B.empStunTime=1;}else{B.timePower=TimePower::Freeze;B.timePowerTime=1;}const double X=T.x,Z=T.z;B.Advance(.25,0);Check(T.x==X&&T.z==Z,"freeze and EMP stop active Hound rush");}}
 {Battle B;B.Start(Relic::Shield,5);B.Recruit(30);B.commanderHp=1;for(auto& T:B.targets)T.active=false;B.Spawn(Kind::Hazard,0,.3,0,10,0,.85);B.Spawn(Kind::Hazard,0,.3,0,100,0,.85);const int Army=B.army;B.MoveTargets(1./60,.06);Check(B.phase==Phase::LastStand&&B.army==Army&&B.CanRevive(),"first fatal hazard freezes subsequent impacts");}
 {for(auto P:{PickupKind::ArcStorm,PickupKind::Salvo}){Battle A,B;A.Start(Relic::Shield,5);B.Start(Relic::Shield,5);B.rewardEndurance=1;A.BeginCombatPower(P);B.BeginCombatPower(P);for(int I=0;I<180;++I){A.CombatStep(1./60);B.CombatStep(1./60);}Check(B.combatPulses>A.combatPulses,"endurance delivers additional actual power pulses");}}
 {Battle B;B.Start(Relic::Shield,5);for(auto& T:B.targets)T.active=false;B.SpawnArchetype(2,3,100);auto& T=*std::find_if(B.targets.begin(),B.targets.end(),[](const Target& T){return T.archetype==2;});T.z=10;mech::formation_safety::Hazard H;H.trajectory=mech::formation_safety::Trajectory::Beam;H.x=H.endX=-2;H.z=10;H.endZ=-5;H.radiusX=.6;H.start=.5;H.end=2;Check(!B.AdmitAttack(&H,1),"attack admission includes future Hound rush corridor");T.archetype=0;Check(B.AdmitAttack(&H,1),"same cannon cue safe when distant enemy cannot rush");}
 {Battle B;Boss(B);B.lasers[0]={1,2,11,-.91,-5,.8,.65,0,true,5,.22};B.BeginCombatPower(PickupKind::Tempest);Check(B.BeginClash(),"angled beam volumes clash in front of actual muzzle");Check(B.clash.z>=1.32&&B.clash.z<11,"angled clash intersection remains on both finite beams");}
 {Battle B;Boss(B);B.lasers[0]={1,0,11,0,-5,.8,.65,0,true,25,20};B.BeginCombatPower(PickupKind::Tempest);Check(!B.BeginClash(),"vertically separated beams cannot produce false clash");}
 std::printf("%d production-method fixtures passed.\n",Cases);
 for(int Rank:{0,3}){Battle B;B.Start(Relic::Shield,5,Rank);int Rewards=0,Clashes=0,Act=0,Supports=0;double BossAt=0;for(int I=0;I<900*60;++I){if(B.phase==Phase::Won||B.phase==Phase::Lost)break;if(B.phase==Phase::LastStand){if(!B.Revive())B.DeclineRevive();}if(B.phase==Phase::Reward){std::printf("rank%d act%d cleared time%.1f hp%.0f army%d boss%.1fs\n",Rank,B.actIndex,B.time,B.commanderHp,B.army,B.time-BossAt);B.ChooseReward(Alternate && B.actIndex==1?2:B.commanderHp<B.commanderMaxHp-20?1:0);++Rewards;Act=B.actIndex;}
 if(B.phase==Phase::Boss&&BossAt==0)BossAt=B.time;
 if(B.phase==Phase::Run)BossAt=0;
 if(B.clash.active){B.ClashTap();++Clashes;}else if(B.phase==Phase::Boss&&B.clash.result==0&&B.bossPattern==BossPattern::Laser&&B.bossAttack>.97&&B.laserCharges>0)B.FireLaser();
 if(B.phase==Phase::Run||B.phase==Phase::Boss){if(B.clash.result==0&&B.phase==Phase::Boss&&B.bossPattern==BossPattern::Laser&&B.bossAttack>.1){}else {if(B.relicEnergy[0]>=100&&(B.phase==Phase::Boss||B.commanderHp<55))B.ActivateRelic(Relic::Shield);if(B.relicEnergy[1]>=100&&(B.phase==Phase::Run||B.bossAttack>.7))B.ActivateRelic(Relic::EMP);if(B.relicEnergy[2]>=100)B.ActivateRelic(Relic::Overdrive);}}
 if(Alternate && B.commanderHp<25&&B.army>=60)B.Heal();
 B.Advance(1./60,Route(B));for(int E=0;E<B.effectCount;++E)if(B.effects[E].kind==EffectKind::EnemySupport)++Supports;B.ConsumeEffects();}
 std::printf("route rank%d phase%d act%d time%.1f hp%.0f army%d score%d clashesTicks%d supports%d unresolved%d\n",Rank,int(B.phase),B.actIndex,B.time,B.commanderHp,B.army,B.score,Clashes,Supports,B.sweepUnresolved);
 }
 return 0;
}
