#include "FormationSafety.h"
#include <chrono>
#include <cstdio>
#include <cstring>
#include <limits>
using namespace mech::formation_safety;
static Workspace work;
static int tests=0,failures=0;
#define CHECK(x) do { if(!(x)) { std::printf("FAIL line %d: %s\n",__LINE__,#x); ++failures; return; } } while(0)
static Body leader{};
static Query Base() { Query q; q.bodies=&leader;q.bodyCount=1;q.horizon=1;return q; }
static Hazard Beam(double x,double start,double end,double r=.3)
{ Hazard h;h.trajectory=Trajectory::Beam;h.x=x;h.z=10;h.endX=x;h.endZ=-5;h.start=start;h.end=end;h.radiusX=r;return h; }
static void Test(const char* name,void(*fn)())
{ ++tests;const int before=failures;fn();if(before==failures)std::printf("PASS %s\n",name); }
static void Empty()
{ auto q=Base();auto r=AdmitAttack(q,work);CHECK(r.decision==Decision::Admit);CHECK(r.best.lo==-3&&r.best.hi==3); }
static void RearRow()
{
 auto q=Base();q.maxSpeed=0;Hazard h;h.x=0;h.z=-1.23;h.end=1;q.proposed=&h;q.proposedCount=1;
 CHECK(AdmitAttack(q,work).decision==Decision::Admit);
 Body b[]={leader,{0,-1.23,.36,-2.805,2.805}};q.bodies=b;q.bodyCount=2;
 CHECK(AdmitAttack(q,work).decision==Decision::Suppress);
}
static void BroadArmy()
{
 auto q=Base();q.commanderX=1.7;q.maxSpeed=0;Hazard h=Beam(0,0,1);q.proposed=&h;q.proposedCount=1;
 CHECK(AdmitAttack(q,work).decision==Decision::Admit);
 Body b[5]={leader};for(int i=0;i<4;++i)b[i+1]={(i-1.5)*.73,-.75,.36,-2.805,2.805};q.bodies=b;q.bodyCount=5;
 CHECK(AdmitAttack(q,work).decision==Decision::Suppress);
 // Narrow formation with one centered troop remains safe at the same lane.
 q.bodyCount=2;b[1]={0,-.75,.36,-3.9,3.9};CHECK(AdmitAttack(q,work).decision==Decision::Admit);
}
static void ClampEdges()
{
 auto q=Base();q.commanderX=3;q.maxSpeed=0;Body b{1.095,-.75,.36,-2.805,2.805};q.bodies=&b;
 Hazard h;h.x=3.5;h.z=-.75;h.radiusX=.08;h.radiusZ=.08;h.end=1;q.proposed=&h;q.proposedCount=1;
 CHECK(AdmitAttack(q,work).decision==Decision::Suppress);
 // Incorrectly treating troop center as commander center would falsely admit.
 b.centerMax=3;CHECK(AdmitAttack(q,work).decision==Decision::Admit);
}
static void SpeedLimit()
{
 auto q=Base();Hazard h=Beam(0,.05,.7,1);q.proposed=&h;q.proposedCount=1;
 CHECK(AdmitAttack(q,work).decision==Decision::Suppress);
 h.start=.3;CHECK(AdmitAttack(q,work).decision==Decision::Admit);
 q.reactionTime=.3;CHECK(AdmitAttack(q,work).decision==Decision::Suppress);
}
static void RollerWalls()
{
 auto q=Base();q.maxSpeed=4;Hazard candidate=Beam(0,.5,1,.5);q.proposed=&candidate;q.proposedCount=1;
 CHECK(AdmitAttack(q,work).decision==Decision::Admit);
 Hazard r[2];for(int i=0;i<2;++i){r[i].trajectory=Trajectory::Roller;r[i].x=i?1.8:-1.8;r[i].z=0;r[i].amplitude=i?-.2:.2;r[i].frequency=2;r[i].radiusX=.5;r[i].radiusZ=.8;r[i].end=1;}
 q.existing=r;q.existingCount=2;CHECK(AdmitAttack(q,work).decision==Decision::Suppress);
 q.proposedCount=0;CHECK(AdmitAttack(q,work).decision==Decision::Admit);
}
static void ExistingUnsafe()
{ auto q=Base();Hazard h;h.end=1;q.existing=&h;q.existingCount=1;CHECK(AdmitAttack(q,work).decision==Decision::ExistingUnsafe);CHECK(work.reachableCount==0); }
static void LockedShot()
{
 auto q=Base();q.horizon=1.5;Hazard h;h.x=0;h.z=2;h.vz=-4;h.end=1.5;q.proposed=&h;q.proposedCount=1;
 CHECK(AdmitAttack(q,work).decision==Decision::Admit);
 q.maxSpeed=0;CHECK(AdmitAttack(q,work).decision==Decision::Suppress);
}
static void CrossingShot()
{ auto q=Base();q.maxSpeed=0;Hazard h;h.x=-3;h.vx=6;h.z=0;h.end=1;q.proposed=&h;q.proposedCount=1;CHECK(AdmitAttack(q,work).decision==Decision::Suppress); }
static void DiagonalBeam()
{ auto q=Base();q.commanderX=2.5;q.maxSpeed=0;Hazard h=Beam(-3,0,1,.2);h.endX=3;h.z=10;h.endZ=-10;q.proposed=&h;q.proposedCount=1;CHECK(AdmitAttack(q,work).decision==Decision::Admit); }
static void HorizontalBeam()
{ auto q=Base();Hazard h=Beam(-4,.3,.6,.2);h.z=0;h.endZ=0;h.endX=4;q.proposed=&h;q.proposedCount=1;CHECK(AdmitAttack(q,work).decision==Decision::Suppress);h.z=h.endZ=10;CHECK(AdmitAttack(q,work).decision==Decision::Admit); }
static void RollerPeak()
{ auto q=Base();q.commanderX=2.6;q.maxSpeed=0;Hazard h;h.trajectory=Trajectory::Roller;h.amplitude=2;h.frequency=2*Pi;h.radiusX=.3;h.radiusZ=.8;h.end=1;q.existing=&h;q.existingCount=1;CHECK(AdmitAttack(q,work).decision==Decision::ExistingUnsafe); }
static void FullSixSeconds()
{ auto q=Base();q.horizon=6;q.maxSpeed=0;Hazard h=Beam(0,5.3,5.9);q.proposed=&h;q.proposedCount=1;auto r=AdmitAttack(q,work);CHECK(r.decision==Decision::Suppress);CHECK(r.bins<=2*MaxBins);CHECK(r.testedHorizon==6); }
static void CompleteWindow()
{ auto q=Base();Hazard h=Beam(0,1.5,2);q.proposed=&h;q.proposedCount=1;CHECK(AdmitAttack(q,work).decision==Decision::Unsupported);q.requireCompleteProposal=false;auto r=AdmitAttack(q,work);CHECK(r.decision==Decision::Admit&&r.testedHorizon==1); }
static void DelayOnlyCandidate()
{
 auto q=Base();Hazard h=Beam(0,.02,.08);q.proposed=&h;q.proposedCount=1;q.retries=3;
 const Hazard before=h;auto r=AdmitAttack(q,work);CHECK(r.decision==Decision::Delay);CHECK(r.delay==.25);CHECK(std::memcmp(&h,&before,sizeof h)==0);
}
static void DelayCannotHideImpact()
{ auto q=Base();Hazard h=Beam(0,0,1,10);q.proposed=&h;q.proposedCount=1;q.retries=3;CHECK(AdmitAttack(q,work).decision==Decision::Suppress); }
static void HomingUnsupported()
{
 auto q=Base();Hazard h;h.trajectory=Trajectory::Unsupported;q.existing=&h;q.existingCount=1;
 CHECK(AdmitAttack(q,work).decision==Decision::Unsupported);
 h=Beam(0,0,1);h.vx=1;CHECK(AdmitAttack(q,work).decision==Decision::Unsupported);
 h={};h.trajectory=Trajectory::Roller;h.accelerationZ=1;CHECK(AdmitAttack(q,work).decision==Decision::Unsupported);
}
static void AccelerationEnvelope()
{
 auto q=Base();q.maxSpeed=0;Hazard h;h.x=2;h.z=0;h.end=1;q.proposed=&h;q.proposedCount=1;
 CHECK(AdmitAttack(q,work).decision==Decision::Admit);h.accelerationX=4;CHECK(AdmitAttack(q,work).decision==Decision::Suppress);
}
static void InvalidAndCaps()
{
 auto q=Base();q.commanderX=std::numeric_limits<double>::quiet_NaN();CHECK(AdmitAttack(q,work).decision==Decision::InvalidInput);
 q=Base();q.horizon=6.01;CHECK(AdmitAttack(q,work).decision==Decision::InvalidInput);
 q=Base();q.maxStep=.00001;CHECK(AdmitAttack(q,work).decision==Decision::CapacityExceeded);
 q=Base();q.bodyCount=26;CHECK(AdmitAttack(q,work).decision==Decision::InvalidInput);
 q=Base();q.existingCount=129;CHECK(AdmitAttack(q,work).decision==Decision::InvalidInput);
 q=Base();Hazard h;h.radiusX=-1;q.proposed=&h;q.proposedCount=1;CHECK(AdmitAttack(q,work).decision==Decision::InvalidInput);
}
static void MaximumLoad()
{
 auto q=Base();q.horizon=6;Body b[MaxBodies];b[0]=leader;for(int i=1;i<MaxBodies;++i)b[i]={((i-1)%4-1.5)*.73,-.75-((i-1)/4)*.48,.36,-2.805,2.805};
 Hazard e[MaxExisting],p[MaxProposed];for(auto& h:e){h.x=0;h.z=50;h.end=6;}for(auto& h:p){h.x=0;h.z=50;h.end=5;}
 q.bodies=b;q.bodyCount=MaxBodies;q.existing=e;q.existingCount=MaxExisting;q.proposed=p;q.proposedCount=MaxProposed;q.retries=MaxRetries;
 const auto t=std::chrono::steady_clock::now();const auto r=AdmitAttack(q,work);const auto elapsed=std::chrono::duration<double,std::milli>(std::chrono::steady_clock::now()-t).count();
 CHECK(r.decision==Decision::Admit);CHECK(r.bins==720);CHECK(r.evaluations==2);CHECK(r.maxForbidden==0);
 std::printf("METRIC workspace_bytes=%zu maximum_query_ms=%.3f bins=%d\n",sizeof work,elapsed,r.bins);
}
static void WorkBudget()
{
 auto q=Base();q.horizon=6;q.commanderX=2.5;q.maxSpeed=0;
 Body b[MaxBodies];for(auto& body:b)body=leader;q.bodies=b;q.bodyCount=MaxBodies;
 Hazard e[MaxExisting];for(auto& h:e){h.x=-2;h.z=0;h.end=6;}q.existing=e;q.existingCount=MaxExisting;
 const auto t=std::chrono::steady_clock::now();const auto r=AdmitAttack(q,work);const auto elapsed=std::chrono::duration<double,std::milli>(std::chrono::steady_clock::now()-t).count();
 CHECK(r.decision==Decision::CapacityExceeded);CHECK(r.pairChecks==MaxPairChecks);CHECK(work.reachableCount==0);
 std::printf("METRIC saturated_query_ms=%.3f pair_checks=%d\n",elapsed,r.pairChecks);
}
static void Determinism()
{
 auto q=Base();Hazard h=Beam(0,.02,.08);q.proposed=&h;q.proposedCount=1;q.retries=3;
 const Result original=AdmitAttack(q,work);const auto intervals=work.reachable;
 for(int i=0;i<100;++i){auto r=AdmitAttack(q,work);CHECK(r.decision==original.decision&&r.delay==original.delay&&r.bins==original.bins&&r.reachableCount==original.reachableCount);for(int j=0;j<r.reachableCount;++j)CHECK(work.reachable[j].lo==intervals[j].lo&&work.reachable[j].hi==intervals[j].hi);}
}
// Independent dense physical oracle for stationary formations. The test uses
// circles, actual sinusoidal motion and clamps, not helper's rectangular bounds.
static void PhysicalOracle()
{
 unsigned seed=71;auto random=[&](){seed=seed*1664525u+1013904223u;return double(seed%100000)/100000.;};int admitted=0;
 for(int k=0;k<100;++k)
 {
  auto q=Base();q.commanderX=-3+6*random();q.maxSpeed=0;Body b[9];b[0]=leader;for(int i=1;i<9;++i)b[i]={((i-1)%4-1.5)*.73,-.75-((i-1)/4)*.48,.36,-2.805,2.805};q.bodies=b;q.bodyCount=9;
  Hazard h[3];for(auto& p:h){p.x=-3+6*random();p.z=2+2*random();p.vx=-2+4*random();p.vz=-3;p.radiusX=p.radiusZ=.2;p.end=1;}
  h[2].trajectory=Trajectory::Roller;h[2].amplitude=.4;h[2].frequency=4;h[2].phase=4*random();q.proposed=h;q.proposedCount=3;
  auto r=AdmitAttack(q,work);if(r.decision!=Decision::Admit)continue;++admitted;
  for(int t=0;t<=2000;++t)for(const auto& p:h)for(const auto& body:b)
  {
   const double seconds=t/2000.;double x=p.x+p.vx*seconds;if(p.trajectory==Trajectory::Roller)x=std::clamp(p.x+p.amplitude*std::sin(p.phase+p.frequency*seconds),p.xMin,p.xMax);
   const double z=p.z+p.vz*seconds,bx=std::clamp(q.commanderX,body.centerMin,body.centerMax)+body.offsetX;
   CHECK(std::hypot(x-bx,z-body.z)>p.radiusX+body.radius);
  }
 }
 CHECK(admitted>5);std::printf("METRIC independently_checked_stationary_certificates=%d\n",admitted);
}
int main()
{
 Test("empty arena reachable interval",Empty);Test("trailing row is protected, not only commander",RearRow);Test("broad and narrow armies differ",BroadArmy);Test("actual troop clamp at edge",ClampEdges);Test("warning travel budget and reaction delay",SpeedLimit);Test("existing rollers close escape corridors",RollerWalls);Test("existing unsafe is separate from new suppression",ExistingUnsafe);Test("committed linear shot future crossing",LockedShot);Test("lateral committed shot cannot tunnel",CrossingShot);Test("diagonal beam uses actual body-depth slice",DiagonalBeam);Test("horizontal beam covers real finite segment",HorizontalBeam);Test("roller intermediate sine extrema",RollerPeak);Test("late rear-row exposure tested through six seconds",FullSixSeconds);Test("partial horizon is explicit",CompleteWindow);Test("only uncommitted proposal is delayed",DelayOnlyCandidate);Test("delay cannot hide impacts outside horizon",DelayCannotHideImpact);Test("unbounded homing is unsupported",HomingUnsupported);Test("proven acceleration envelope is conservative",AccelerationEnvelope);Test("finite validation and bounded capacities",InvalidAndCaps);Test("maximum fixed-array query",MaximumLoad);Test("saturated work fails closed at finite cap",WorkBudget);Test("repeat results are deterministic",Determinism);Test("independent swept physical oracle",PhysicalOracle);
 std::printf("RESULT %d/%d passed\n",tests-failures,tests);return failures?1:0;
}
