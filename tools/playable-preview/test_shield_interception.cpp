// Reproduces the visible-cover bug: a hostile round must stop at armor before
// reaching a body. Fixtures inspect real production collision/effect methods.
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
static int Checks=0;
static void Check(bool Value,const char* Name){if(!Value){std::fprintf(stderr,"FAIL %s\n",Name);std::exit(1);}++Checks;}
static void Ready(Battle& B){B.Start(Relic::Shield,5);B.relicEnergy[0]=100;B.ActivateRelic(Relic::Shield);B.effectCount=0;}
static int Intercepts(const Battle& B){int N=0;for(int I=0;I<B.effectCount;++I)N+=B.effects[I].kind==EffectKind::ShieldHit&&B.effects[I].variant==-6;return N;}
int main(){
 for(double Dt:{1./30,1./60,1./120}){
  Battle B;Ready(B);const double HP=B.commanderHp;const int Army=B.army;
  B.SpawnEnemyShot(0,5,0,32,.12,25,ProjectileKind::Shell,true,88,WeaponEmitter::ArmL,4.3);
  for(int I=0;I<30&&B.EnemyShotCount();++I)B.MoveEnemyShots(Dt);
  Check(B.EnemyShotCount()==0&&Intercepts(B)==1,"front projectile intercepted once at every frame rate");
  const auto& E=*std::find_if(B.effects.begin(),B.effects.begin()+B.effectCount,[](const Effect& E){return E.kind==EffectKind::ShieldHit&&E.variant==-6;});
  Check(E.z>2&&E.z<2.2&&E.spatial&&E.y>.85&&E.y<=2.95,"impact is on deployed front plate, not the body");
  Check(B.commanderHp==HP&&B.army==Army,"plate interception preserves protected army and commander");
  B.MoveEnemyShots(1);Check(Intercepts(B)==1,"deactivated round cannot emit repeated shield impacts");
 }
 {Battle B;Ready(B);B.SpawnEnemyShot(0,5,0,100,.08,25,ProjectileKind::Rocket,true,0,WeaponEmitter::ShoulderL,4);B.MoveEnemyShots(.1);Check(B.EnemyShotCount()==0&&Intercepts(B)==1,"fast rocket crossing entire cover cannot tunnel to body");}
 {Battle B;Ready(B);double X,Y,Z;Check(!B.ShieldPlateHit(6,1,5,6,1,-2,.1,X,Y,Z),"off-width ray does not hit invisible shield");Check(!B.ShieldPlateHit(0,4,5,0,4,-2,.1,X,Y,Z),"ray above armor is not intercepted");Check(!B.ShieldPlateHit(0,-1,5,0,-1,-2,.1,X,Y,Z),"ray below armor is not intercepted");Check(B.ShieldPlateHit(0,4,2.06,0,1,2.06,.1,X,Y,Z)&&std::abs(Y-2.95)<1e-8,"descending shot hits actual top edge");}
 {Battle B;Ready(B);B.x=2.5;double X,Y,Z;Check(B.ShieldPlateHit(2.5,1,5,2.5,1,-2,.1,X,Y,Z)&&X>2.4,"shield follows moving formation");B.formationAlive.fill(false);Check(B.ShieldPlateHit(2.5,1,5,2.5,1,-2,.1,X,Y,Z),"commander alone retains visible minimum cover");Check(!B.ShieldPlateHit(-2,1,5,-2,1,-2,.1,X,Y,Z),"commander-only cover does not span empty old troop positions");}
 {Battle B;Ready(B);B.formationAlive.fill(false);double X,Y,Z;Check(B.ShieldPlateHit(1.85,1,5,1.85,1,0,.06,X,Y,Z)&&Z<1.95&&Z>1.6,"folded wing uses its recessed physical location");}
 {Battle B;B.Start(Relic::Shield,5);B.SpawnEnemyShot(0,.5,0,8,.1,20,ProjectileKind::Shell,false);B.MoveEnemyShots(.1);Check(B.commanderHp==80&&Intercepts(B)==0,"inactive shield does not intercept or protect");}
 {Battle B;Ready(B);B.SpawnEnemyShot(0,.5,0,8,.1,20,ProjectileKind::Shell,false);B.MoveEnemyShots(.1);Check(B.commanderHp==100&&Intercepts(B)==0,"already-behind-cover round retains relic protection without fake front impact");}
 {Battle B;Ready(B);const auto HP=B.commanderHp;const int Army=B.army;B.lasers[0]={1,0,11,0,-5,.8,.65,0,true,5,.22};B.MoveLasers(.1);Check(B.commanderHp==HP&&B.army==Army&&B.lasers[0].active,"shield preserves existing laser blocking and beam lifetime");}
 {Battle B;Ready(B);auto& L=B.lasers[0];L={1,0,11,0,-5,.8,.65,0,true,5,.22};B.MoveLasers(.01);
  Check(L.shieldClipped&&L.endZ>2&&L.endZ<2.2&&L.endY<=2.95,"boss beam stops at the actual plated front");
  const auto& E=B.effects[B.effectCount-1];Check(E.kind==EffectKind::ShieldHit&&E.variant==-6&&E.spatial&&E.x==L.endX&&E.y==L.endY&&E.z==L.endZ,"beam shield event matches published visible endpoint");
  B.MoveLasers(.01);Check(Intercepts(B)==1,"continuous beam shield spark obeys existing hit cadence");
  B.relicTime[0]=0;L.tick=0;B.MoveLasers(.01);Check(!L.shieldClipped&&L.endX==0&&L.endY==.22&&L.endZ==-5,"expiring shield restores the original unoccluded beam");Check(B.commanderHp==88,"restored beam damages a body in its path");
 }
 {Battle B;Ready(B);auto& L=B.lasers[0];L={1,-1.8,11,-1.8,-5,.2,.65,0,true,2,.85};B.ClipLaserToShield(L);Check(L.shieldClipped,"cover initially blocks an off-center beam");B.x=3;B.ClipLaserToShield(L);Check(!L.shieldClipped&&L.endZ==-5,"moving the armor away restores the real ray");}
 {Battle B;Ready(B);auto& L=B.lasers[0];for(double Y:{-1.,4.}){L={1,0,11,0,-5,.1,.65,0,true,Y,Y};B.ClipLaserToShield(L);Check(!L.shieldClipped&&L.endY==Y&&L.endZ==-5,"beam wholly above or below armor is not clipped");}}
 {Battle B;Ready(B);B.phase=Phase::Boss;B.bossX=0;B.bossZ=12;B.bossY=.85;mech::boss_pose::Pose P;P.position={0,.85,-12};B.bossFrame=B.previousBossFrame=mech::boss_pose::BuildFrame(P,0);B.lasers[0]={1,0,11,0,-5,.8,.65,0,true,5,.22};B.BeginCombatPower(PickupKind::Tempest);B.ClipLaserToShield(B.lasers[0]);const double VisibleEnd=B.lasers[0].endZ;
  Check(B.BeginClash()&&B.clash.z>=VisibleEnd,"real beams can clash in front of deployed armor");
  Check(B.lasers[0].endZ==B.friendlyBeam.endZ&&B.lasers[0].endX==B.friendlyBeam.endX&&B.lasers[0].endY==B.friendlyBeam.endY,"clash publishes the same joined endpoint for both visible beams");
  const double Joined=B.lasers[0].endZ;B.ClipLaserToShield(B.lasers[0]);Check(B.lasers[0].endZ==Joined,"shield cannot overwrite an ongoing clash's joined endpoint");
 }
 {Battle B;Ready(B);B.phase=Phase::Boss;B.combatPower=CombatPower::Tempest;B.combatPowerTime=1;B.beamSlope=0;B.friendlyBeam={1,0,1.42,1.32,0,1.42,40,.1,1};B.lasers[0]={1,2.85,11,-1.95,-5,.1,.65,0,true,1.42,1.42};
  Check(!B.BeginClash()&&B.lasers[0].shieldClipped,"hidden beam continuation behind cover cannot create a clash");
  B.relicTime[0]=0;Check(B.BeginClash(),"same intersecting rays regain clash eligibility after cover expires");
 }
 for(int Bonus:{0,1,2}){
  Battle B;B.Start(Relic::EMP,5);B.rewardEndurance=Bonus;B.relicEnergy[1]=100;B.SpawnArchetype(2,0,200);auto& T=*std::find_if(B.targets.begin(),B.targets.end(),[](const Target& T){return T.archetype==2;});T.z=10;B.ActivateRelic(Relic::EMP);const double Duration=2*(1+Bonus*.15);
  Check(std::abs(B.empStunTime-Duration)<1e-8&&std::abs(T.stunTime-Duration)<1e-8&&std::abs(B.relicTime[1]-Duration)<1e-8,"endurance extends actual EMP stun with its displayed timer");
 }
 std::printf("%d focused shield / EMP checks passed.\n",Checks);
}
