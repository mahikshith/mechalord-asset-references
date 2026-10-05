#include "AssaultSimulation.h"
#include <cstdio>
#include <algorithm>
#include <vector>
#include <chrono>
using namespace mech::assault;
namespace bp=mech::boss_pose;
static double Route(const Battle& b){
 if(b.phase==Phase::Boss){int best=-1;for(int i=0;i<7;i++)if(b.RegionVulnerable(i)&&b.RegionHp(i)>0&&(best<0||b.RegionHp(i)<b.RegionHp(best)||
  (b.RegionHp(i)==b.RegionHp(best)&&std::abs(b.bossFrame.regions[i].aimCenter.x-b.x)<std::abs(b.bossFrame.regions[best].aimCenter.x-b.x))))best=i;
  const double desired=best<0?b.bossX:b.bossFrame.regions[best].aimCenter.x;
  bool laser=false;for(const auto& l:b.lasers)laser|=l.active;if(laser||(b.bossPattern==BossPattern::Laser&&b.bossAttack>.3))return b.bossLane>0?-3:3;
  double chosen=desired,distance=1e9;for(double x:{desired,-2.8,2.8,-1.5,1.5,0.}){bool safe=true;for(const auto& p:b.enemyShots)if(p.active&&p.z<5.5&&std::abs(x-(p.x-p.dx*p.z/p.dz))<p.radius+.5)safe=false;if(safe&&std::abs(x-desired)<distance){chosen=x;distance=std::abs(x-desired);}}return chosen;
 }
 const Pickup* pickup=nullptr;for(const auto& p:b.pickups)if(p.active&&p.z<6&&(!pickup||p.z<pickup->z))pickup=&p;
 const Target* goal=nullptr;const Target* close=nullptr;for(const auto& t:b.targets)if(t.active){if(t.z>1&&t.z<29&&(t.kind==Kind::Crate||t.kind==Kind::Gate||t.kind==Kind::Orb||(t.kind==Kind::Enemy&&t.variant>0&&t.z<14))&&(!goal||t.z<goal->z))goal=&t;if(t.kind==Kind::Gate&&t.z>0&&t.z<3.5&&(!close||t.z<close->z))close=&t;}
 double desired=pickup?pickup->x:goal?goal->x:0;const Target* gate=close?close:goal&&goal->kind==Kind::Gate?goal:nullptr;
 if(gate){int gain=-999999;for(const auto& t:b.targets)if(t.active&&t.kind==Kind::Gate&&std::abs(t.z-gate->z)<.02){int g=t.op?b.army*(t.value-1):t.value;if(g>gain){gain=g;desired=t.x;}}}
 for(const auto& t:b.targets)if(t.active&&t.kind==Kind::Hazard&&t.z<3&&std::abs(t.x-desired)<t.size+.5)return t.x>0?-3:3;return desired;
}
static void PoseOut(const bp::Pose& p){std::printf("[");bool first=true;auto out=[&](double v){std::printf("%s%.17g",first?"":",",v);first=false;};for(double v:{p.position.x,p.position.y,p.position.z,p.rootEuler.x,p.rootEuler.y,p.rootEuler.z})out(v);for(const auto* a:{&p.armPitch,&p.armRoll,&p.legPitch,&p.kneePitch,&p.barrelSpin})for(double v:*a)out(v);out(p.clock);std::printf("]");}
static bp::Contact Partition(bp::Vec3 start,bp::Vec3 end,double radius,const bp::Pose& a,const bp::Pose& b,int component,int n){
 bp::Contact out;int work=0;for(int i=0;i<n;i++){double lo=double(i)/n,hi=double(i+1)/n;auto r=bp::SweepComponent(start+(end-start)*lo,start+(end-start)*hi,radius,bp::Interpolate(a,b,lo),bp::Interpolate(a,b,hi),component);work+=r.iterations;if(r.status!=bp::SweepStatus::Miss){r.fraction=(i+r.fraction)/n;r.iterations=work;return r;}}out.iterations=work;return out;
}
static bp::Contact TrueBoundary(bp::Vec3 start,bp::Vec3 end,double radius,const bp::Pose& a,const bp::Pose& b,int component){
 bp::Contact out;out.component=component;out.region=bp::RegionId(bp::model_data::Components[component].region);const auto delta=end-start;const double bound=bp::MotionBound(a,b,component,delta);double t=0;
 for(int k=0;k<bp::MaxSweepIterations;k++){out.iterations++;const auto v=bp::BuildComponent(bp::Interpolate(a,b,t),component);const auto p=start+delta*t;const double d=bp::Distance(v,p)-radius-v.tolerance;
  if(d<=bp::ContactTolerance+1e-9){out.status=bp::SweepStatus::Hit;out.fraction=t;out.point=bp::SurfacePoint(v,p);return out;}
  if(bound<1e-12||d-bp::ContactTolerance>bound*(1-t)){out.status=bp::SweepStatus::Miss;return out;}
  const double step=.9*d/bound;if(step<1e-12){out.status=bp::SweepStatus::Unresolved;out.fraction=t;return out;}t=std::min(1.,t+step);
 }out.status=bp::SweepStatus::Unresolved;out.fraction=t;return out;
}
static bp::Contact PartitionTrue(bp::Vec3 start,bp::Vec3 end,double radius,const bp::Pose& a,const bp::Pose& b,int component,int n){
 bp::Contact out;for(int i=0;i<n;i++){double lo=double(i)/n,hi=double(i+1)/n;auto r=TrueBoundary(start+(end-start)*lo,start+(end-start)*hi,radius,bp::Interpolate(a,b,lo),bp::Interpolate(a,b,hi),component);if(r.status!=bp::SweepStatus::Miss){r.fraction=(i+r.fraction)/n;return r;}}return out;
}
int main(){
 std::puts("{\"scope\":\"Exact native integrated normal-control contacts; no phone or WASM performance claim\",\"cases\":[");bool first=true;int totals[3]{},components[11]{},solved4=0,solved16=0,trueResolved=0,trueHit=0,trueMiss=0,cases=0,maxPark=0;double maxYaw=0,maxY=0;const auto begin=std::chrono::steady_clock::now();
 for(int relic=0;relic<3;relic++){Battle b;b.Start(Relic(relic),0,0);int parked[Battle::MaxShots]{};for(int step=0;step<220*60&&(b.phase==Phase::Run||b.phase==Phase::Boss||b.phase==Phase::Destroying);step++){
  if(b.energy>=100&&b.ability==0&&b.phase!=Phase::Destroying){bool near=false;for(const auto&t:b.targets)near|=t.active&&t.kind==Kind::Enemy&&t.z<12;if(relic==2||b.phase==Phase::Boss||near)b.Activate();}
  const auto before=b.shots;const int count=b.sweepUnresolved;b.Advance(1./60.,Route(b));if(b.sweepUnresolved>count){totals[relic]+=b.sweepUnresolved-count;
   for(int slot=0;slot<Battle::MaxShots;slot++){const auto& s=b.shots[slot];const auto& old=before[slot];if(!s.active||!old.active||s.id!=old.id||!s.spatial||s.x!=old.x||s.y!=old.y||s.z!=old.z)continue;
    maxPark=std::max(maxPark,++parked[slot]);const bp::Vec3 start{s.x,s.y,-s.z},end{s.x+s.dx/60,s.y+s.dy/60,-s.z-s.dz/60};const double radius=s.kind==FriendlyKind::Missile?.09:.055;
    auto h=bp::NearestContact(start,end,radius,b.previousBossFrame,b.bossFrame);if(h.status!=bp::SweepStatus::Unresolved)continue;
    for(int i=0;i<11;i++)if(b.bossFrame.volumes[i].active){auto c=bp::SweepComponent(start,end,radius,b.previousBossFrame.pose,b.bossFrame.pose,i);if(c.status!=bp::SweepStatus::Unresolved)continue;components[i]++;cases++;
     const auto r4=Partition(start,end,radius,b.previousBossFrame.pose,b.bossFrame.pose,i,4),r16=r4.status==bp::SweepStatus::Unresolved?Partition(start,end,radius,b.previousBossFrame.pose,b.bossFrame.pose,i,16):r4;solved4+=r4.status!=bp::SweepStatus::Unresolved;solved16+=r16.status!=bp::SweepStatus::Unresolved;
     const auto rtrue0=TrueBoundary(start,end,radius,b.previousBossFrame.pose,b.bossFrame.pose,i),rtrue=rtrue0.status==bp::SweepStatus::Unresolved?PartitionTrue(start,end,radius,b.previousBossFrame.pose,b.bossFrame.pose,i,4):rtrue0;trueResolved+=rtrue.status!=bp::SweepStatus::Unresolved;trueHit+=rtrue.status==bp::SweepStatus::Hit;trueMiss+=rtrue.status==bp::SweepStatus::Miss;
     maxYaw=std::max(maxYaw,std::abs(bp::AngleDelta(b.previousBossFrame.pose.rootEuler.y,b.bossFrame.pose.rootEuler.y)));maxY=std::max(maxY,std::abs(b.bossFrame.pose.position.y-b.previousBossFrame.pose.position.y));
     if(cases<=200||rtrue0.status==bp::SweepStatus::Unresolved){std::printf("%s{\"relic\":%d,\"time\":%.17g,\"shot\":%d,\"mask\":%d,\"component\":%d,\"start\":[%.17g,%.17g,%.17g],\"end\":[%.17g,%.17g,%.17g],\"radius\":%.17g,\"before\":",first?"":",",relic,b.time,s.id,b.bossPartsMask,i,start.x,start.y,start.z,end.x,end.y,end.z,radius);first=false;PoseOut(b.previousBossFrame.pose);std::printf(",\"after\":");PoseOut(b.bossFrame.pose);std::printf(",\"fraction\":%.17g,\"iterations\":%d,\"partition4\":%d,\"partition16\":%d,\"trueBoundary\":%d,\"trueFour\":%d}",c.fraction,c.iterations,int(r4.status),int(r16.status),int(rtrue0.status),int(rtrue.status));}
    }
   }
  }else for(int i=0;i<Battle::MaxShots;i++)parked[i]=0;
  b.ConsumeEffects();
 }std::fprintf(stderr,"Relic %d: time %.3f phase %d unresolved %d\n",relic,b.time,int(b.phase),b.sweepUnresolved);}
 const double elapsed=std::chrono::duration<double>(std::chrono::steady_clock::now()-begin).count();std::printf("],\"summary\":{\"unresolvedByRelic\":[%d,%d,%d],\"componentCounts\":[",totals[0],totals[1],totals[2]);for(int i=0;i<11;i++)std::printf("%s%d",i?",":"",components[i]);std::printf("],\"componentCases\":%d,\"partition4Resolved\":%d,\"partition16Resolved\":%d,\"trueBoundaryResolved\":%d,\"trueBoundaryHits\":%d,\"trueBoundaryMisses\":%d,\"maxConsecutiveParkTicks\":%d,\"maxYawStep\":%.17g,\"maxRootYStep\":%.17g,\"nativeAuditSeconds\":%.3f}}\n",cases,solved4,solved16,trueResolved,trueHit,trueMiss,maxPark,maxYaw,maxY,elapsed);
 return 0;
}
