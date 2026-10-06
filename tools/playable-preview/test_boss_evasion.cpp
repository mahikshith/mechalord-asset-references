// Explicit native unit fixture for a rare legal ordering, not gameplay feasibility.
// Sets up one damaged booster during an evade, then exercises production
// DamageRegion/Advance. Public-controls playability is tested separately in WASM.
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
static void Check(bool Good,const char* Name){if(!Good){std::fprintf(stderr,"FAIL %s\n",Name);std::exit(1);}}
int main(){int Cases=0;for(bool Tell:{true,false})for(int Hz:{30,60,120}){
 Battle B;B.Start(Relic::Shield,0,0);B.phase=Phase::Boss;B.bossX=0;B.bossZ=12;B.bossY=2.8;
 B.bossPartsMask=7;for(int I=0;I<3;++I)B.regionHp[I]=0;B.regionHp[3]=10;B.UpdateBossHealth();
 mech::boss_pose::Pose P;P.position={0,2.8,-12};B.poseDriver.Reset(P);B.bossFrame=B.previousBossFrame=mech::boss_pose::BuildFrame(P,7);
 B.bossEvadeTime=Tell?1.:.5;B.bossEvadeTell=Tell?.2:0;B.evadeTarget=1.9;B.evades=1;B.nextEvade=999;B.bossAction=BossAction::Evade;
 Check(B.RegionVulnerable(3),"second booster legally vulnerable");
 B.DamageRegion(3,100,B.bossFrame.regions[3].aimCenter,FriendlyKind::Pulse,B.bossEpoch);
 Check((B.bossPartsMask&12)==12&&B.regionHp[3]==0,"real damage destroys second booster");
 Check(B.bossEvadeTime==0&&B.bossEvadeTell==0&&B.bossFiringWindow==1.4,"cancel both evade clocks and enter recovery");
 const double X=B.bossX,Z=B.bossZ;for(int I=0;I<Hz/2;++I)B.Advance(1./Hz,3);
 Check(B.bossX==X&&B.bossZ==Z,"disabled boosters cannot dash during recovery");
 Check(B.bossEvadeTime==0&&B.bossEvadeTell==0,"hidden evade timer stays canceled");
 const double Time=B.time,Recovery=B.bossFiringWindow;B.paused=true;B.Advance(1,-3);
 Check(B.time==Time&&B.bossFiringWindow==Recovery,"pause freezes recovery");B.paused=false;
 for(int I=0;I<Hz*2;++I){const double Before=B.bossX;B.Advance(1./Hz,3);Check(std::abs(B.bossX-Before)<=1.25/Hz+1e-9,"only honest grounded walking after recovery");}
 Check(B.evades==1&&B.bossEvadeTime==0&&B.bossEvadeTell==0,"broken jets never revive evasion");++Cases;
 }std::printf("%d/%d native evasion ordering fixtures passed (tell/dash x30/60/120Hz).\n",Cases,Cases);return 0;}
