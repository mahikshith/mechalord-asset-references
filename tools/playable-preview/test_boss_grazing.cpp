#include "BossPose.h"
#include <cstdio>
#include <fstream>
using namespace mech::boss_pose;
static void Read(std::istream& in,Pose& p){in>>p.position.x>>p.position.y>>p.position.z>>p.rootEuler.x>>p.rootEuler.y>>p.rootEuler.z;for(auto* a:{&p.armPitch,&p.armRoll,&p.legPitch,&p.kneePitch,&p.barrelSpin})for(double& v:*a)in>>v;in>>p.clock;}
static void PoseOut(const Pose& p){std::printf("[%.17g,%.17g,%.17g,%.17g,%.17g,%.17g",p.position.x,p.position.y,p.position.z,p.rootEuler.x,p.rootEuler.y,p.rootEuler.z);for(const auto* a:{&p.armPitch,&p.armRoll,&p.legPitch,&p.kneePitch,&p.barrelSpin})for(double v:*a)std::printf(",%.17g",v);std::printf(",%.17g]",p.clock);}
int main(int argc,char** argv){if(argc<2)return 2;std::ifstream in(argv[1]);int count;in>>count;int failures=0,fallbacks=0;std::printf("[");
 for(int n=0;n<count;n++){int mask,component;Pose a,b;Vec3 start,end;double radius;in>>mask>>component;Read(in,a);Read(in,b);in>>start.x>>start.y>>start.z>>end.x>>end.y>>end.z>>radius;const auto first=BuildFrame(a,mask),last=BuildFrame(b,mask);const auto hit=NearestContact(start,end,radius,first,last);const auto raw=AdvanceComponent(start,end,radius,a,b,component),refined=SweepComponent(start,end,radius,a,b,component);fallbacks+=raw.status==SweepStatus::Unresolved;bool okay=hit.status==SweepStatus::Hit;
  if(okay){const auto at=BuildComponent(Interpolate(a,b,hit.fraction),hit.component);const auto projectile=start+(end-start)*hit.fraction;okay=Distance(at,projectile)-radius-at.tolerance<=ContactTolerance+2e-9&&std::abs(Distance(at,hit.point))<1e-7;}
  okay=okay&&refined.status!=SweepStatus::Unresolved&&refined.iterations<=9*MaxSweepIterations;
  // Genuine empty-space perturbations must remain misses; no broader hurtbox.
  okay=okay&&NearestContact(start+Vec3{20,0,0},end+Vec3{20,0,0},radius,first,last).status==SweepStatus::Miss;if(!okay)failures++;
  if(n)std::printf(",");std::printf("{\"previous\":");PoseOut(a);std::printf(",\"current\":");PoseOut(b);std::printf(",\"mask\":%d,\"start\":[%.17g,%.17g,%.17g],\"end\":[%.17g,%.17g,%.17g],\"radius\":%.17g,\"numericalTolerance\":0.0001,\"status\":%d,\"component\":%d,\"fraction\":%.17g,\"point\":[%.17g,%.17g,%.17g],\"rawStatus\":%d,\"iterations\":%d}",mask,start.x,start.y,start.z,end.x,end.y,end.z,radius,int(hit.status),hit.component,hit.fraction,hit.point.x,hit.point.y,hit.point.z,int(raw.status),refined.iterations);
 }std::printf("]\n");std::fprintf(stderr,"Exact captured grazes: %d cases, %d failures, %d bounded refinements\n",count,failures,fallbacks);return !in||failures?1:0;
}
