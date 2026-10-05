#include "BossPose.h"
#include <chrono>
#include <cstdio>
#include <vector>
using namespace mech::boss_pose;
struct ShotCase {Frame previous,current;Vec3 start,end;double radius=.035;};
static unsigned randomState=293;
static double Random(){randomState=randomState*1664525u+1013904223u;return double(randomState%1000000)/1000000.;}
static volatile double keepResult=0;
static ShotCase Make(int i,bool abrupt,bool allNear)
{
 Pose a,b;a.position={-.05,.8,-12};b.position={.05,.805,-12.015};a.clock=2;b.clock=2+1./60.;
 a.rootEuler={.05,.11,-.03};b.rootEuler={.051,.115,-.038};
 a.armPitch={-.18,.22};b.armPitch={-.182,.205};a.legPitch={.12,-.12};b.legPitch={.11,-.11};a.kneePitch={.06,0};b.kneePitch={.065,0};a.barrelSpin={1.1,-.7};b.barrelSpin={1.6,-1.2};
 if(abrupt){a.rootEuler={-.18,-.32,-.22};b.rootEuler={.18,.32,.22};a.armPitch={-.30,.35};b.armPitch={.35,-.30};a.legPitch={-.16,.16};b.legPitch={.16,-.16};a.kneePitch={0,.12};b.kneePitch={.12,0};}
 const Frame previous=BuildFrame(a),current=BuildFrame(b);const int component=i%11;const auto& v=current.volumes[component];
 const double travel=allNear?.20+Random()*.65:Random()*8;
 Vec3 front=v.center+Rotate(v.rotation,{0,0,-v.half.z});
 // Incoming toward world-Z negative. Typical speed32 m/s and selected elevation.
 Vec3 start{v.center.x+(Random()-.5)*.10,v.center.y+(Random()-.5)*.06,front.z+travel};
 Vec3 end=start+Vec3{0,(v.center.y-start.y)*.05,-32./60.};return {previous,current,start,end,.035};
}
static void Batch(const char* name,int count,bool abrupt,bool allNear)
{
 std::vector<ShotCase> cases;for(int i=0;i<count;++i)cases.push_back(Make(i,abrupt,allNear));
 int hits=0,misses=0,unresolved=0,invalid=0;double maxSurfaceError=0;
 for(const auto& c:cases){const auto h=NearestContact(c.start,c.end,c.radius,c.previous,c.current);if(h.status==SweepStatus::Hit){++hits;const auto at=BuildFrame(Interpolate(c.previous.pose,c.current.pose,h.fraction));maxSurfaceError=std::max(maxSurfaceError,std::abs(Distance(at.volumes[h.component],h.point)));}else if(h.status==SweepStatus::Miss)++misses;else if(h.status==SweepStatus::Unresolved)++unresolved;else ++invalid;}
 for(int j=0;j<12;++j)for(const auto& c:cases){const auto h=NearestContact(c.start,c.end,c.radius,c.previous,c.current);keepResult+=h.fraction;}
 std::vector<double> times;for(int j=0;j<100;++j){const auto t=std::chrono::steady_clock::now();for(const auto& c:cases){const auto h=NearestContact(c.start,c.end,c.radius,c.previous,c.current);keepResult+=h.fraction;}times.push_back(std::chrono::duration<double,std::milli>(std::chrono::steady_clock::now()-t).count());}
 std::sort(times.begin(),times.end());
 std::printf("BATCH %s count=%d native_ms_median=%.6f native_ms_p95=%.6f native_ms_max=%.6f hits=%d misses=%d unresolved=%d invalid=%d max_surface_error_m=%.9g\n",name,count,times[50],times[95],times.back(),hits,misses,unresolved,invalid,maxSurfaceError);
}
static void PrintPose(const Pose& p){std::printf("[%.17g,%.17g,%.17g,%.17g,%.17g,%.17g",p.position.x,p.position.y,p.position.z,p.rootEuler.x,p.rootEuler.y,p.rootEuler.z);for(const auto* a:{&p.armPitch,&p.armRoll,&p.legPitch,&p.kneePitch,&p.barrelSpin})for(double v:*a)std::printf(",%.17g",v);std::printf(",%.17g]",p.clock);}
static void PrintVec(Vec3 v){std::printf("[%.17g,%.17g,%.17g]",v.x,v.y,v.z);}
static void Dump()
{
 std::printf("[");for(int i=0;i<28;++i){const auto c=Make(i,i>=14,true);auto h=NearestContact(c.start,c.end,c.radius,c.previous,c.current);if(i)std::printf(",");std::printf("{\"previous\":");PrintPose(c.previous.pose);std::printf(",\"current\":");PrintPose(c.current.pose);std::printf(",\"start\":");PrintVec(c.start);std::printf(",\"end\":");PrintVec(c.end);std::printf(",\"radius\":%.17g,\"status\":%d,\"component\":%d,\"fraction\":%.17g,\"point\":",c.radius,int(h.status),h.component,h.fraction);PrintVec(h.point);std::printf("}");}std::printf("]\n");
}
static int SocketsCheck()
{
 const auto f=BuildFrame({});const auto s=PosedSockets(f);
 if(Length(s.armL.position-Vec3{1.724803,3.74926,2.099602})>.000002)return 1;
 if(Length(s.shoulderL.position-Vec3{1.432465,5.367957,.641911})>.000002)return 1;
 if(Length(s.core.position-Vec3{0,4.275472354888915,1.0154446363449096})>.000002)return 1;
 const auto broken=PosedSockets(BuildFrame({},5));if(broken.armL.active||broken.shoulderL.active||!broken.armR.active||!broken.core.active)return 1;
 std::printf("PASS actual neutral GLB exit sockets and broken-source flags\n");return 0;
}
int main(int argc,char** argv)
{
 if(argc>1&&std::string(argv[1])=="--dump"){Dump();return 0;}
 if(SocketsCheck())return 1;
 Batch("normal24",24,false,false);Batch("dense96",96,false,true);Batch("maximum256",256,false,true);Batch("abrupt256",256,true,true);
 std::printf("SCOPE native C++ local CPU timings; synthetic defined shot batches; no WASM/phone/frame-rate claim\n");return 0;
}
