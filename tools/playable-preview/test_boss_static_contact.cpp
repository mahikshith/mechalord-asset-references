// Exercise the actual production fallback, not a duplicate solver.
#include "AssaultSimulation.cpp"
#include <cstdio>
using namespace mech::boss_pose;
static void PoseOut(const Pose& p){std::printf("[%.17g,%.17g,%.17g,%.17g,%.17g,%.17g",p.position.x,p.position.y,p.position.z,p.rootEuler.x,p.rootEuler.y,p.rootEuler.z);for(const auto* a:{&p.armPitch,&p.armRoll,&p.legPitch,&p.kneePitch,&p.barrelSpin})for(double v:*a)std::printf(",%.17g",v);std::printf(",%.17g]",p.clock);}
int main(){
 Pose p;p.position={-1.93672204,.8500000238,-11.430000305};p.rootEuler={.000335949,-.092758238,.000798998};p.armPitch={.012780556,-.012780556};p.armRoll={0,0};p.legPitch={-.15929888,.15929888};p.kneePitch={0,.119474165};p.barrelSpin={-50.5,-50.5};p.clock=16.8333;
 const Vec3 start{-3.1600000858,4.8418998718,-10},end{-3.1600000858,5.0953915278,-10.8};int failures=0;std::printf("[");
 for(int n=0;n<6;++n){const int mask=n%2;const auto frame=BuildFrame(p,mask);Vec3 a=start,b=end;
  if(n>=4){a=a+Vec3{.1,0,0};b=b+Vec3{.1,0,0};}
  else if(n>=2){const auto center=frame.volumes[1].center;a=center+Vec3{0,0,2};b=center-Vec3{0,0,2};}
  const auto raw=NearestContact(a,b,.055,frame,frame),hit=mech::assault::StaticPhysicalContact(a,b,.055,frame);
  // Retained raw-GLB oracle independently identifies the captured graze as a
  // cannonR contact. A 10cm outward offset is a nearby genuine miss.
  const auto expected=n<4?SweepStatus::Hit:SweepStatus::Miss;
  if(hit.status!=expected||!mech::assault::SamePhysicalPose(frame,frame))++failures;
  if(n<2&&(raw.status!=SweepStatus::Unresolved||hit.component!=1))++failures;
  Pose moved=p;moved.position.x+=.001;if(mech::assault::SamePhysicalPose(frame,BuildFrame(moved,mask)))++failures;
  double clearance=1e30;for(int step=0;step<=4096;++step){const auto point=a+(b-a)*(double(step)/4096);for(const auto& v:frame.volumes)if(v.active)clearance=std::min(clearance,Distance(v,point)-.055-v.tolerance);}
  if(n)std::printf(",");std::printf("{\"previous\":");PoseOut(p);std::printf(",\"current\":");PoseOut(p);std::printf(",\"mask\":%d,\"start\":[%.17g,%.17g,%.17g],\"end\":[%.17g,%.17g,%.17g],\"radius\":0.055,\"numericalTolerance\":0.000100001,\"status\":%d,\"component\":%d,\"fraction\":%.17g,\"point\":[%.17g,%.17g,%.17g],\"rawStatus\":%d,\"sampledClearanceMetres\":%.17g}",mask,a.x,a.y,a.z,b.x,b.y,b.z,int(hit.status),hit.component,hit.fraction,hit.point.x,hit.point.y,hit.point.z,int(raw.status),clearance);
 }
 std::printf("]\n");std::fprintf(stderr,"Frozen capture: two active masks, two central hits, two nearby 10cm miss controls; %d failures\n",failures);return failures?1:0;
}
