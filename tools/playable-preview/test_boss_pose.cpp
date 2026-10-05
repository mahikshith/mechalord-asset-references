#include "BossPose.h"
#include <cstdio>
#include <fstream>
#include <limits>
using namespace mech::boss_pose;
static int tests=0,failures=0;
#define CHECK(x) do{if(!(x)){std::printf("FAIL line %d: %s\n",__LINE__,#x);++failures;return;}}while(0)
static void Test(const char* name,void(*fn)()){++tests;const int before=failures;fn();if(before==failures)std::printf("PASS %s\n",name);}
static bool Near(Vec3 a,Vec3 b,double e=1e-6){return Length(a-b)<e;}
static void ReadPose(std::istream& in,Pose& p){in>>p.position.x>>p.position.y>>p.position.z>>p.rootEuler.x>>p.rootEuler.y>>p.rootEuler.z;for(auto* a:{&p.armPitch,&p.armRoll,&p.legPitch,&p.kneePitch,&p.barrelSpin})for(double& v:*a)in>>v;in>>p.clock;}
static void SourceOracle()
{
 std::ifstream in("builds/boss-pose-oracle.txt");int count=0;in>>count;CHECK(count==388);double maxError=0;
 for(int n=0;n<count;++n)
 {
  Pose p;ReadPose(in,p);const Frame f=BuildFrame(p);
  for(int i=0;i<ComponentCount;++i){Vec3 center,half;Quat q;in>>center.x>>center.y>>center.z>>q.x>>q.y>>q.z>>q.w>>half.x>>half.y>>half.z;CHECK(in.good());maxError=std::max(maxError,Length(center-f.volumes[i].center));CHECK(Near(center,f.volumes[i].center,1e-9));CHECK(Near(half,f.volumes[i].half,1e-9));const auto& actual=f.volumes[i].rotation;const double dot=q.x*actual.x+q.y*actual.y+q.z*actual.z+q.w*actual.w;CHECK(std::abs(std::abs(dot)-1)<1e-10);const auto single=BuildComponent(p,i);CHECK(Near(single.center,center,1e-9));CHECK(Near(single.half,half,1e-9));CHECK(std::abs(std::abs(q.x*single.rotation.x+q.y*single.rotation.y+q.z*single.rotation.z+q.w*single.rotation.w)-1)<1e-10);}
 }
 std::printf("METRIC actual_glb_component_poses=%d max_center_error_m=%.12g\n",count*ComponentCount,maxError);
}
static void NeutralReceipt()
{
 const Frame f=BuildFrame({});CHECK(Near(f.volumes[0].center,{1.724803,3.74926,1.246385}));CHECK(Near(f.volumes[1].center,{-1.724803,3.74926,1.246385}));CHECK(Near(f.volumes[2].center,{1.432465,5.367957,.062119}));CHECK(Near(f.volumes[10].center,{0,4.275472354888915,.9157565236091613}));CHECK(f.regions[4].count==3&&f.regions[5].count==3);
 // Foot bounds are an independent source mesh component, not an empty leg AABB.
 CHECK(f.volumes[6].half.y<.31);CHECK(f.volumes[5].half.y<.74);
}
static void LeftRight()
{
 auto f=BuildFrame({});for(int side=0;side<2;++side){const Vec3 c=f.volumes[side].center;const auto hit=NearestContact(c+Vec3{0,0,4},c-Vec3{0,0,4},.04,f,f);CHECK(hit.status==SweepStatus::Hit);CHECK(hit.region==(side?RegionId::CannonR:RegionId::CannonL));CHECK(hit.fraction>0&&hit.fraction<.5);CHECK(hit.normal.z>.95);}
}
static void ClosedCoreContact()
{
 auto f=BuildFrame({});const Vec3 c=f.volumes[10].center;const auto hit=NearestContact(c+Vec3{0,0,2},c-Vec3{0,0,2},.02,f,f);CHECK(hit.status==SweepStatus::Hit&&hit.region==RegionId::Core);
 // No damage policy here: gameplay must deflect while this real disk is closed.
 CHECK(std::abs(hit.fraction-(2-f.volumes[10].half.z-.02-CoreTolerance)/4)<.00005);
}
static void MeasuredOval()
{
 const auto f=BuildFrame({});const auto c=f.volumes[10].center;
 const auto across=[&](Vec3 offset){return NearestContact(c+offset+Vec3{0,0,2},c+offset-Vec3{0,0,2},.01,f,f);};
 CHECK(across({.41,0,0}).status==SweepStatus::Miss);
 CHECK(across({0,.43,0}).status==SweepStatus::Hit);
 CHECK(across({.3,.4,0}).status==SweepStatus::Miss);
 CHECK(f.volumes[10].shape==Shape::Ellipsoid&&f.volumes[10].tolerance==.01);
}
static void BrokenPartMiss()
{
 auto f=BuildFrame({},1);const Vec3 c=f.volumes[0].center;auto hit=NearestContact(c+Vec3{0,0,2},c-Vec3{0,0,2},.02,f,f);CHECK(hit.status==SweepStatus::Miss);CHECK(!f.regions[0].active&&f.regions[1].active);
 f=BuildFrame({},63);for(int i=0;i<10;++i)CHECK(!f.volumes[i].active);CHECK(f.volumes[10].active);
}
static void LimbGaps()
{
 auto f=BuildFrame({});const auto hit=NearestContact({0,1.4,2},{0,1.4,-2},.02,f,f);CHECK(hit.status==SweepStatus::Miss);
 // Center at head height does not silently count as central reactor damage.
 CHECK(NearestContact({0,6.1,3},{0,6.1,-3},.02,f,f).status==SweepStatus::Miss);
}
static void AnalyticBoxContact()
{
 auto f=BuildFrame({});const auto& v=f.volumes[0];const double radius=.05;const Vec3 localStart{0,0,-3},localEnd{0,0,3};const Vec3 start=v.center+Rotate(v.rotation,localStart),end=v.center+Rotate(v.rotation,localEnd);const auto hit=NearestContact(start,end,radius,f,f);CHECK(hit.status==SweepStatus::Hit&&hit.region==RegionId::CannonL);
 // Along a central face normal the exact Minkowski contact is analytic.
 const double exact=(3-v.half.z-radius)/6;CHECK(std::abs(hit.fraction-exact)<.00003);CHECK(std::abs(Distance(v,hit.point))<.0002);
}
static void MovingTranslation()
{
 Pose a,b;a.position.x=-2;b.position.x=2;auto first=BuildFrame(a),last=BuildFrame(b);const Vec3 point=BuildFrame({}).volumes[0].center;const auto hit=NearestContact(point,point,.02,first,last);CHECK(hit.status==SweepStatus::Hit&&hit.region==RegionId::CannonL);CHECK(std::abs(hit.fraction-(2-.627582-.02)/4)<.00003);
 const Frame at=BuildFrame(Interpolate(a,b,hit.fraction));CHECK(std::abs(Distance(at.volumes[0],point)-.02)<.0002);
}
static void RotatingJoint()
{
 Pose a,b;a.armPitch[0]=-.9;b.armPitch[0]=.9;const auto mid=BuildFrame(Interpolate(a,b,.5));const Vec3 point=mid.volumes[0].center;const auto hit=NearestContact(point,point,.02,BuildFrame(a),BuildFrame(b));CHECK(hit.status==SweepStatus::Hit&&hit.region==RegionId::CannonL);CHECK(hit.fraction<.5);
 const auto at=BuildFrame(Interpolate(a,b,hit.fraction));CHECK(std::abs(Distance(at.volumes[0],point)-.02)<.0002);
}
static void NearestPhysicalPart()
{
 auto f=BuildFrame({});const auto a=f.volumes[0].center,b=f.volumes[1].center;auto hit=NearestContact(a+Vec3{3,0,0},b-Vec3{3,0,0},.02,f,f);CHECK(hit.status==SweepStatus::Hit&&hit.region==RegionId::CannonL);CHECK(hit.component==0);
 hit=NearestContact(b-Vec3{3,0,0},a+Vec3{3,0,0},.02,f,f);CHECK(hit.status==SweepStatus::Hit&&hit.region==RegionId::CannonR);
}
static void KneeHierarchy()
{
 Pose a,b;b.kneePitch[0]=.4;auto first=BuildFrame(a),last=BuildFrame(b);CHECK(Near(first.volumes[4].center,last.volumes[4].center));CHECK(!Near(first.volumes[5].center,last.volumes[5].center));CHECK(!Near(first.volumes[6].center,last.volumes[6].center));CHECK(Near(first.volumes[7].center,last.volumes[7].center));
}
static void FrozenAndRetry()
{
 PoseDriver driver;MotionInput input;input.position={0,.8,-12};for(int i=0;i<60;++i)CHECK(driver.Step(input,1./60.));const Pose before=driver.Current();input.stunned=true;input.position.x=2;CHECK(!driver.Step(input,1./60.));CHECK(Near(driver.Current().position,before.position));CHECK(driver.Current().clock==before.clock);input.stunned=false;CHECK(!driver.Step(input,0));
 driver.Reset();CHECK(driver.Current().clock==0);input.position={0,.8,-12};for(int i=0;i<60;++i)CHECK(driver.Step(input,1./60.));CHECK(driver.Current().clock==before.clock);CHECK(Near(driver.Current().rootEuler,before.rootEuler));CHECK(driver.Current().armPitch==before.armPitch);
}
static void MotionStates()
{
 PoseDriver d;MotionInput in;in.position={0,.8,-12};in.state=State::Guarded;CHECK(d.Step(in,1./60.));CHECK(d.Current().armPitch[0]==-.2&&d.Current().armRoll[0]==-.18&&d.Current().armRoll[1]==.18);
 in.state=State::Exposed;CHECK(d.Step(in,1./60.));CHECK(d.Current().armPitch[0]==.35);CHECK(d.Current().legPitch[0]==0);
 in.state=State::Armored;in.action=Action::Windup;CHECK(d.Step(in,1./60.));CHECK(d.Current().armPitch[0]<-.16&&d.Current().armPitch[0]>-.20);
 in.action=Action::Fire;CHECK(d.Step(in,1./60.));CHECK(d.Current().armPitch[0]==.22);
}
static void BoundedAndFinite()
{
 auto f=BuildFrame({});auto hit=NearestContact({0,0,0},{0,0,-30},.02,f,f);CHECK(hit.status==SweepStatus::Miss);
 Pose p;p.position.x=std::numeric_limits<double>::quiet_NaN();auto invalid=BuildFrame(p);CHECK(NearestContact({},{},.02,invalid,f).status==SweepStatus::Invalid);
 CHECK(NearestContact({},{},-.1,f,f).status==SweepStatus::Invalid);CHECK(MaxSweepIterations==160&&ComponentCount==11);
}
static void InsideSurface()
{
 const auto f=BuildFrame({});for(int i:{0,4,10}){const auto p=f.volumes[i].center;const auto hit=NearestContact(p,p-Vec3{0,0,.2},.035,f,f);CHECK(hit.status==SweepStatus::Hit);CHECK(hit.fraction==0);const auto& v=f.volumes[hit.component];CHECK(std::abs(Distance(v,hit.point))<1e-7);}
}
int main(int argc,char** argv){
 if(argc>1&&std::string(argv[1])=="--dump"){
  std::ifstream in("builds/boss-pose-oracle.txt");int count;in>>count;std::printf("%d\n",count);
  for(int n=0;n<count;++n){Pose p;ReadPose(in,p);auto f=BuildFrame(p);for(int i=0;i<ComponentCount;++i){double ignored;for(int j=0;j<10;++j)in>>ignored;const auto& v=f.volumes[i];std::printf("%d %d %.17g %.17g %.17g %.17g %.17g %.17g %.17g %.17g %.17g %.17g\n",n,i,v.center.x,v.center.y,v.center.z,v.rotation.x,v.rotation.y,v.rotation.z,v.rotation.w,v.half.x,v.half.y,v.half.z);}}return in?0:1;
 }
 Test("388 independent retained-GLB poses including asymmetric rolls/spins",SourceOracle);Test("neutral measurement receipt and native-facing sides",NeutralReceipt);Test("left-only and right-only physical cannon contacts",LeftRight);Test("central closed oval has its own physical contact",ClosedCoreContact);Test("measured oval rejects generous circular edge hits",MeasuredOval);Test("broken components contribute no collision",BrokenPartMiss);Test("empty space and head misses are not broad boss hits",LimbGaps);Test("analytic rounded-box central-face contact",AnalyticBoxContact);Test("moving region translation cannot tunnel",MovingTranslation);Test("rotating joint curved contact",RotatingJoint);Test("nearest physical part wins in both ray directions",NearestPhysicalPart);Test("separate knee and foot hierarchy follows actual pivots",KneeHierarchy);Test("pause stun and retry restore deterministic pose",FrozenAndRetry);Test("authoritative guarded exposed windup and fire pose",MotionStates);Test("finite validation and fixed solver cap",BoundedAndFinite);Test("starting-inside impacts project onto physical surfaces",InsideSurface);std::printf("RESULT %d/%d passed\n",tests-failures,tests);return failures?1:0;}
