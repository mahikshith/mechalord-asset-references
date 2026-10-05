#pragma once
#include <array>
#include <algorithm>
#include <cmath>

// World space: X lateral, Y up, Z toward commander. Simulation flips Z only
// at its boundary. These are measured part volumes, not mesh-triangle hit tests.
// Seven semantic regions have eleven components: each leg follows its actual
// thigh/knee/foot chain. The luminous heart is an actual atlas-measured oval.
// BuildFrame publishes matching transforms; renderer must mirror Pose exactly.
// NearestContact interpolates shortest Euler-angle deltas through the exact
// hierarchy, including rotating joint arcs. Its certificate is for that defined
// inter-pose motion, not for an arbitrary undocumented animation between frames.
// Bounds use rigid-part surface speeds and a fixed conservative-advancement cap.
// Unresolved means no collision certificate; callers must not invent damage.
// HP, vulnerability, epoch checks and closed-core deflection belong to gameplay.
namespace mech::boss_pose
{
constexpr double Scale=1.4,Pi=3.14159265358979323846;
constexpr int RegionCount=7,ComponentCount=11,JointCount=14,MaxSweepIterations=160;
constexpr double ContactTolerance=.0001; // 0.1 mm numerical surface tolerance.
constexpr double CoreTolerance=.01; // 10 mm around measured low-poly luminous heart.
struct Vec3 { double x=0,y=0,z=0; };
inline Vec3 operator+(Vec3 a,Vec3 b){return {a.x+b.x,a.y+b.y,a.z+b.z};}
inline Vec3 operator-(Vec3 a,Vec3 b){return {a.x-b.x,a.y-b.y,a.z-b.z};}
inline Vec3 operator*(Vec3 a,double b){return {a.x*b,a.y*b,a.z*b};}
inline double Dot(Vec3 a,Vec3 b){return a.x*b.x+a.y*b.y+a.z*b.z;}
inline double Length(Vec3 a){return std::sqrt(Dot(a,a));}
inline Vec3 Cross(Vec3 a,Vec3 b){return {a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x};}
inline Vec3 Unit(Vec3 a){const double n=Length(a);return n>1e-12?a*(1/n):Vec3{0,0,1};}
struct Quat { double x=0,y=0,z=0,w=1; };
inline Quat Multiply(Quat a,Quat b)
{return {a.w*b.x+a.x*b.w+a.y*b.z-a.z*b.y,a.w*b.y-a.x*b.z+a.y*b.w+a.z*b.x,a.w*b.z+a.x*b.y-a.y*b.x+a.z*b.w,a.w*b.w-a.x*b.x-a.y*b.y-a.z*b.z};}
inline Quat Inverse(Quat q){return {-q.x,-q.y,-q.z,q.w};}
inline Vec3 Rotate(Quat q,Vec3 p){const Vec3 v{q.x,q.y,q.z};const Vec3 t=Cross(v,p)*2;return p+t*q.w+Cross(v,t);}
inline Quat EulerXYZ(Vec3 e)
{
 if(e.x==0&&e.y==0&&e.z==0)return {};
 const double c1=std::cos(e.x*.5),c2=std::cos(e.y*.5),c3=std::cos(e.z*.5),s1=std::sin(e.x*.5),s2=std::sin(e.y*.5),s3=std::sin(e.z*.5);
 return {s1*c2*c3+c1*s2*s3,c1*s2*c3-s1*c2*s3,c1*c2*s3+s1*s2*c3,c1*c2*c3-s1*s2*s3};
}
struct Transform { Vec3 position{}; Quat rotation{}; };
inline Transform Compose(Transform a,Transform b){return {a.position+Rotate(a.rotation,b.position),Multiply(a.rotation,b.rotation)};}
enum class RegionId { CannonL,CannonR,JetL,JetR,LegL,LegR,Core,None };
enum class Joint { Root,Torso,ArmL,ArmR,BarrelL,BarrelR,PodL,PodR,LegL,LegR,KneeL,KneeR,FootL,FootR };
enum class Shape { RoundedBox,Disk,Ellipsoid };
struct Pose
{
 Vec3 position{},rootEuler{};
 std::array<double,2> armPitch{},armRoll{},legPitch{},kneePitch{},barrelSpin{};
 double clock=0;
};
struct Volume
{
 RegionId region=RegionId::None; int joint=0;
 Vec3 center{},half{}; Quat rotation{};
 Shape shape=Shape::RoundedBox; double rounding=.04,tolerance=0; bool active=true;
};
struct Region
{ RegionId id=RegionId::None; Vec3 aimCenter{}; int first=0,count=0;bool active=true; };
struct Frame
{ Pose pose{};std::array<Transform,JointCount> joints{};std::array<Volume,ComponentCount> volumes{};std::array<Region,RegionCount> regions{};int brokenMask=0; };
inline Vec3 JointEuler(const Pose& p,int j)
{
 switch(Joint(j)){
 case Joint::ArmL:return {p.armPitch[0],0,p.armRoll[0]};case Joint::ArmR:return {p.armPitch[1],0,p.armRoll[1]};
 case Joint::LegL:return {p.legPitch[0],0,0};case Joint::LegR:return {p.legPitch[1],0,0};
 case Joint::KneeL:return {p.kneePitch[0],0,0};case Joint::KneeR:return {p.kneePitch[1],0,0};
 case Joint::BarrelL:return {0,0,p.barrelSpin[0]};case Joint::BarrelR:return {0,0,p.barrelSpin[1]};
 default:return {};
 }
}
inline bool ValidNumber(double x){return std::isfinite(x)&&std::abs(x)<=1e6;}
inline bool ValidPose(const Pose& p)
{
 for(double v:{p.position.x,p.position.y,p.position.z,p.rootEuler.x,p.rootEuler.y,p.rootEuler.z,p.clock})if(!ValidNumber(v))return false;
 for(const auto* a:{&p.armPitch,&p.armRoll,&p.legPitch,&p.kneePitch,&p.barrelSpin})for(double v:*a)if(!ValidNumber(v))return false;
 return true;
}
}
#include "BossPoseModel.h"
namespace mech::boss_pose
{
inline Frame BuildFrame(const Pose& p,int brokenMask=0)
{
 Frame f;f.pose=p;f.brokenMask=brokenMask&63;
 const Transform actor{p.position,EulerXYZ(p.rootEuler)};
 const Transform model=Compose(actor,{{},EulerXYZ({0,Pi,0})});
 for(int j=0;j<JointCount;++j){const auto& b=model_data::Bindings[j];const Transform local{b.position*Scale,EulerXYZ(JointEuler(p,j))};f.joints[j]=Compose(b.parent<0?model:f.joints[b.parent],local);}
 for(int i=0;i<ComponentCount;++i)
 {
  const auto& b=model_data::Components[i];auto& v=f.volumes[i];v.region=RegionId(b.region);v.joint=b.joint;v.rotation=f.joints[b.joint].rotation;v.center=f.joints[b.joint].position+Rotate(v.rotation,b.center*Scale);v.half=b.half*Scale;v.active=b.region==6||!(f.brokenMask&(1<<b.region));v.shape=b.region==6?Shape::Ellipsoid:Shape::RoundedBox;v.tolerance=b.region==6?CoreTolerance:0;
  v.rounding=std::min(.04,std::min({v.half.x,v.half.y,v.half.z})*.25);
 }
 constexpr int first[]={0,1,2,3,4,7,10},count[]={1,1,1,1,3,3,1};
 for(int i=0;i<RegionCount;++i){auto& r=f.regions[i];r.id=RegionId(i);r.first=first[i];r.count=count[i];r.active=f.volumes[r.first].active;r.aimCenter=f.volumes[r.first].center;if(i==4||i==5)r.aimCenter=(f.volumes[r.first].center+f.volumes[r.first+1].center)*.5;}
 return f;
}
struct WeaponSocket { Vec3 position{};bool active=false; };
struct Sockets { WeaponSocket armL{},armR{},shoulderL{},shoulderR{},core{}; };
// Immutable actual posed exits. Mechanical anchors use the measured front face
// plus the same 2 cm local nozzle clearance as the source renderer. Core uses
// the luminous oval's front surface, rather than the old invented glow center.
inline Sockets PosedSockets(const Frame& f)
{
 Sockets out;WeaponSocket* slots[]={&out.armL,&out.armR,&out.shoulderL,&out.shoulderR,&out.core};
 constexpr int component[]={0,1,2,3,10};
 for(int i=0;i<5;++i){const auto& c=model_data::Components[component[i]];Vec3 local=c.center;local.z-=c.half.z+(i==4?0:.02);const auto& joint=f.joints[c.joint];slots[i]->position=joint.position+Rotate(joint.rotation,local*Scale);slots[i]->active=f.volumes[component[i]].active;}
 return out;
}
// Sweep samples need only one measured ancestor chain, not an entire boss frame.
inline Volume BuildComponent(const Pose& p,int component)
{
 const auto& c=model_data::Components[component];int chain[JointCount],count=0;
 for(int j=c.joint;j>=0;j=model_data::Bindings[j].parent)chain[count++]=j;
 Transform t=Compose({p.position,EulerXYZ(p.rootEuler)},{{},EulerXYZ({0,Pi,0})});
 for(int k=count-1;k>=0;--k){const int j=chain[k];t=Compose(t,{model_data::Bindings[j].position*Scale,EulerXYZ(JointEuler(p,j))});}
 Volume v;v.region=RegionId(c.region);v.joint=c.joint;v.center=t.position+Rotate(t.rotation,c.center*Scale);v.rotation=t.rotation;v.half=c.half*Scale;v.shape=c.region==6?Shape::Ellipsoid:Shape::RoundedBox;v.tolerance=c.region==6?CoreTolerance:0;v.rounding=std::min(.04,std::min({v.half.x,v.half.y,v.half.z})*.25);return v;
}
inline double AngleDelta(double a,double b){return std::remainder(b-a,2*Pi);}
inline double AngleLerp(double a,double b,double t){return a+AngleDelta(a,b)*t;}
inline Pose Interpolate(const Pose& a,const Pose& b,double t)
{
 Pose p;p.position=a.position+(b.position-a.position)*t;p.rootEuler={AngleLerp(a.rootEuler.x,b.rootEuler.x,t),AngleLerp(a.rootEuler.y,b.rootEuler.y,t),AngleLerp(a.rootEuler.z,b.rootEuler.z,t)};p.clock=a.clock+(b.clock-a.clock)*t;
 for(int i=0;i<2;++i){p.armPitch[i]=AngleLerp(a.armPitch[i],b.armPitch[i],t);p.armRoll[i]=AngleLerp(a.armRoll[i],b.armRoll[i],t);p.legPitch[i]=AngleLerp(a.legPitch[i],b.legPitch[i],t);p.kneePitch[i]=AngleLerp(a.kneePitch[i],b.kneePitch[i],t);p.barrelSpin[i]=AngleLerp(a.barrelSpin[i],b.barrelSpin[i],t);}return p;
}
enum class Action { Strafe,Advance,Retreat,Windup,Fire,Dying };
enum class State { Armored,Exposed,Guarded,Rebuilding,Destroying };
struct MotionInput
{ Vec3 position{};double aimX=0,hostileRate=1,fireKick=0,hitKick=0;Action action=Action::Strafe;State state=State::Armored;bool airborne=true,stunned=false,down=false; };
class PoseDriver
{
 Pose pose{};Vec3 previous{};double previousVz=0,pitch=0,roll=0;bool initialized=false;
public:
 const Pose& Current()const{return pose;}
 void Reset(const Pose& p={}){pose=p;previous=p.position;previousVz=0;pitch=p.rootEuler.x;roll=p.rootEuler.z;initialized=false;}
 // Called by the fixed simulation step. No hidden render clock.
 bool Step(const MotionInput& in,double dt)
 {
  if(!std::isfinite(dt)||dt<=0||dt>1./30.||!ValidNumber(in.position.x)||!ValidNumber(in.position.y)||!ValidNumber(in.position.z)||!ValidNumber(in.aimX)||!ValidNumber(in.hostileRate)||in.hostileRate<0||in.hostileRate>1.35||!ValidNumber(in.fireKick)||!ValidNumber(in.hitKick))return false;
  if(in.stunned||in.hostileRate==0)return false;
  const double vx=initialized?(in.position.x-previous.x)/dt:0,vz=initialized?(in.position.z-previous.z)/dt:0;
  const double brake=initialized?std::clamp((vz-previousVz)/dt*.0025,-.07,.07):0;
  const double targetPitch=in.airborne?std::clamp(vz*.018+brake,-.18,.18):0,targetRoll=in.airborne?std::clamp(-vx*.045,-.22,.22):std::clamp(-vx*.02,-.05,.05);
  const double delta=dt*in.hostileRate,alpha=1-std::exp(-8*delta);pitch+=(targetPitch-pitch)*alpha;roll+=(targetRoll-roll)*alpha;
  previous=in.position;previousVz=vz;initialized=true;pose.position=in.position;pose.clock+=delta;
  pose.rootEuler={pitch-in.hitKick*.12+in.fireKick*.045,std::clamp(std::atan2(in.aimX-in.position.x,std::max(6.,-in.position.z)),-.32,.32),roll};
  const bool exposed=in.state==State::Exposed,guarded=in.state==State::Guarded,recover=in.state==State::Rebuilding,windup=in.action==Action::Windup,fire=in.action==Action::Fire;
  const double walk=in.down||recover||exposed?0:windup?.02:.16;
  for(int i=0;i<2;++i){const double side=i?Pi:0,s=std::sin(pose.clock*5.5+side);pose.legPitch[i]=s*walk;pose.kneePitch[i]=std::max(0.,s)*(exposed||recover?.02:.12);pose.armPitch[i]=(exposed?.35:guarded?-.20:recover?-.30:windup?-.18-std::sin(pose.clock*26)*.015:fire?.22:std::sin(pose.clock*3+side)*.055)+in.fireKick*.22-in.hitKick*.13;pose.armRoll[i]=guarded?(i?.18:-.18):0;pose.barrelSpin[i]-=delta*(windup?15:fire?22:3);}
  return true;
 }
};
inline Vec3 EllipsoidSurface(Vec3 r,Vec3 p)
{
 const double d[]={r.x*r.x,r.y*r.y,r.z*r.z},a[]={std::abs(p.x),std::abs(p.y),std::abs(p.z)};
 const double scaled=a[0]*a[0]/d[0]+a[1]*a[1]/d[1]+a[2]*a[2]/d[2],minimum=std::min({d[0],d[1],d[2]});
 double lo=0,hi=std::max({r.x,r.y,r.z})*Length(p),q[3]{};
 if(scaled<1)
 {
  // At the shortest-axis singular value, an inside point may have a nearest
  // surface point off its radial direction (including an exact center point).
  double limit=0;int shortest=-1;bool singular=false;
  for(int i=0;i<3;++i){if(d[i]==minimum){if(shortest<0)shortest=i;if(a[i]>1e-15)singular=true;}else {q[i]=d[i]*a[i]/(d[i]-minimum);limit+=q[i]*q[i]/d[i];}}
  if(!singular&&limit<=1){q[shortest]=std::sqrt(minimum*std::max(0.,1-limit));return {p.x<0?-q[0]:q[0],p.y<0?-q[1]:q[1],p.z<0?-q[2]:q[2]};}
  lo=-minimum;hi=0;
 }
 for(int n=0;n<44;++n){const double t=(lo+hi)*.5;double sum=0;for(int i=0;i<3;++i){const double u=std::sqrt(d[i])*a[i]/(t+d[i]);sum+=u*u;}if(sum>1)lo=t;else hi=t;}
 const double t=(lo+hi)*.5;for(int i=0;i<3;++i)q[i]=d[i]*a[i]/(t+d[i]);return {p.x<0?-q[0]:q[0],p.y<0?-q[1]:q[1],p.z<0?-q[2]:q[2]};
}
inline double LocalDistance(const Volume& v,Vec3 p)
{
 if(v.shape==Shape::Ellipsoid){const double scaled=p.x*p.x/(v.half.x*v.half.x)+p.y*p.y/(v.half.y*v.half.y)+p.z*p.z/(v.half.z*v.half.z);const double distance=Length(p-EllipsoidSurface(v.half,p));return scaled<1?-distance:distance;}
 if(v.shape==Shape::Disk){const double radial=std::hypot(p.x,p.y)-v.half.x,axial=std::abs(p.z)-v.half.z;return std::hypot(std::max(0.,radial),std::max(0.,axial))+std::min(0.,std::max(radial,axial));}
 const Vec3 d{std::abs(p.x)-(v.half.x-v.rounding),std::abs(p.y)-(v.half.y-v.rounding),std::abs(p.z)-(v.half.z-v.rounding)};
 return Length({std::max(0.,d.x),std::max(0.,d.y),std::max(0.,d.z)})+std::min(0.,std::max({d.x,d.y,d.z}))-v.rounding;
}
inline double Distance(const Volume& v,Vec3 p){return LocalDistance(v,Rotate(Inverse(v.rotation),p-v.center));}
inline Vec3 Normal(const Volume& v,Vec3 p)
{
 const Vec3 local=Rotate(Inverse(v.rotation),p-v.center);constexpr double e=.000001;
 const Vec3 n{LocalDistance(v,local+Vec3{e,0,0})-LocalDistance(v,local-Vec3{e,0,0}),LocalDistance(v,local+Vec3{0,e,0})-LocalDistance(v,local-Vec3{0,e,0}),LocalDistance(v,local+Vec3{0,0,e})-LocalDistance(v,local-Vec3{0,0,e})};return Rotate(v.rotation,Unit(n));
}
inline Vec3 SurfacePoint(const Volume& v,Vec3 worldPoint)
{
 const Vec3 p=Rotate(Inverse(v.rotation),worldPoint-v.center);Vec3 q;
 if(v.shape==Shape::Ellipsoid)q=EllipsoidSurface(v.half,p);
 else if(v.shape==Shape::RoundedBox)
 {
  const Vec3 inner=v.half-Vec3{v.rounding,v.rounding,v.rounding};q={std::clamp(p.x,-inner.x,inner.x),std::clamp(p.y,-inner.y,inner.y),std::clamp(p.z,-inner.z,inner.z)};
  const Vec3 gap=p-q;
  if(Length(gap)>1e-12)q=q+Unit(gap)*v.rounding;
  else{const double dx=v.half.x-std::abs(p.x),dy=v.half.y-std::abs(p.y),dz=v.half.z-std::abs(p.z);q=p;if(dx<=dy&&dx<=dz)q.x=p.x<0?-v.half.x:v.half.x;else if(dy<=dz)q.y=p.y<0?-v.half.y:v.half.y;else q.z=p.z<0?-v.half.z:v.half.z;}
 }
 else{const double radial=std::hypot(p.x,p.y),side=v.half.x-radial,cap=v.half.z-std::abs(p.z);q=p;if(side<cap){const double s=v.half.x/std::max(1e-12,radial);q.x=p.x*s;q.y=p.y*s;}else q.z=p.z<0?-v.half.z:v.half.z;}
 return v.center+Rotate(v.rotation,q);
}
inline double AngularChange(Vec3 a,Vec3 b){return std::abs(AngleDelta(a.x,b.x))+std::abs(AngleDelta(a.y,b.y))+std::abs(AngleDelta(a.z,b.z));}
// Lipschitz bound on this component's surface motion, from exact ancestor chain.
// Triangle sums bound every point; no sampled/assumed orientation envelope.
inline double MotionBound(const Pose& a,const Pose& b,int component,Vec3 shotDelta)
{
 const auto& c=model_data::Components[component];double radius=Length(c.center)+Length(c.half),angular=0;
 for(int j=c.joint;j>=0;j=model_data::Bindings[j].parent){angular+=AngularChange(JointEuler(a,j),JointEuler(b,j))*radius*Scale;radius+=Length(model_data::Bindings[j].position);}
 angular+=AngularChange(a.rootEuler,b.rootEuler)*radius*Scale;
 return Length(shotDelta-(b.position-a.position))+angular;
}
enum class SweepStatus { Hit,Miss,Unresolved,Invalid };
struct Contact { SweepStatus status=SweepStatus::Miss;RegionId region=RegionId::None;int component=-1;double fraction=1;Vec3 point{},normal{};int iterations=0; };
inline Contact AdvanceComponent(Vec3 start,Vec3 end,double shotRadius,const Pose& a,const Pose& b,int component)
{
 Contact out;out.component=component;out.region=RegionId(model_data::Components[component].region);
 const Vec3 delta=end-start;const double bound=MotionBound(a,b,component,delta);double t=0;
 for(int k=0;k<MaxSweepIterations;++k)
 {
  ++out.iterations;const Volume v=BuildComponent(Interpolate(a,b,t),component);const Vec3 point=start+delta*t;const double radius=shotRadius+v.tolerance,d=Distance(v,point)-radius;
  if(d<=ContactTolerance+1e-9){out.status=SweepStatus::Hit;out.fraction=t;out.point=SurfacePoint(v,point);out.normal=Normal(v,out.point);return out;}
  if(bound<1e-12||d-ContactTolerance>bound*(1-t)){out.status=SweepStatus::Miss;return out;}
  // Advance toward the true inflated surface, strictly before physical contact.
  // Subtracting the acceptance tolerance here instead approaches that tolerance
  // asymptotically and can park an ordinary grazing shot for dozens of ticks.
  // The existing numerical acceptance tolerance is unchanged.
  const double step=.9*d/bound;
  if(step<1e-12){out.status=SweepStatus::Unresolved;out.fraction=t;return out;}
  t=std::min(1.,t+step);
 }
 out.status=SweepStatus::Unresolved;out.fraction=t;return out;
}
inline Contact SweepComponent(Vec3 start,Vec3 end,double shotRadius,const Pose& a,const Pose& b,int component)
{
 auto result=AdvanceComponent(start,end,shotRadius,a,b,component);
 if(result.status!=SweepStatus::Unresolved)return result;
 // Rare grazing motion needs a tighter proven angular bound. Eight chronological
 // intervals are a fixed fallback, not an unbounded retry or wider hurt region.
 // An uncertain earlier interval still prevents certifying a later contact.
 int iterations=result.iterations;const Vec3 delta=end-start;
 for(int i=0;i<8;++i){const double lo=i*.125,hi=(i+1)*.125;auto part=AdvanceComponent(start+delta*lo,start+delta*hi,shotRadius,Interpolate(a,b,lo),Interpolate(a,b,hi),component);iterations+=part.iterations;
  if(part.status!=SweepStatus::Miss){part.fraction=lo+part.fraction*.125;part.iterations=iterations;return part;}}
 result.status=SweepStatus::Miss;result.fraction=1;result.iterations=iterations;return result;
}
inline Contact NearestContact(Vec3 start,Vec3 end,double shotRadius,const Frame& previous,const Frame& current)
{
 Contact best;double unresolved=2;
 if(!ValidPose(previous.pose)||!ValidPose(current.pose)||!ValidNumber(start.x)||!ValidNumber(start.y)||!ValidNumber(start.z)||!ValidNumber(end.x)||!ValidNumber(end.y)||!ValidNumber(end.z)||!ValidNumber(shotRadius)||shotRadius<0||shotRadius>.5){best.status=SweepStatus::Invalid;return best;}
 for(int i=0;i<ComponentCount;++i)
 {
  if(!current.volumes[i].active)continue;
  // Rejection-only broad phase: a sphere encloses the initial component plus
  // the proven maximum angular surface displacement. It never produces a hit.
  const Vec3 relativeDelta=(end-start)-(current.pose.position-previous.pose.position);
  const double bound=MotionBound(previous.pose,current.pose,i,end-start);
  const double angular=std::max(0.,bound-Length(relativeDelta));
  const Vec3 relativeStart=start-previous.volumes[i].center;
  const double lengthSquared=Dot(relativeDelta,relativeDelta);
  const double near=lengthSquared>1e-20?std::clamp(-Dot(relativeStart,relativeDelta)/lengthSquared,0.,1.):0;
  if(Length(relativeStart+relativeDelta*near)>Length(previous.volumes[i].half)+angular+shotRadius+previous.volumes[i].tolerance+ContactTolerance+1e-8)continue;
  const auto hit=SweepComponent(start,end,shotRadius,previous.pose,current.pose,i);
  if(hit.status==SweepStatus::Unresolved)unresolved=std::min(unresolved,hit.fraction);
  else if(hit.status==SweepStatus::Hit && (best.status!=SweepStatus::Hit||hit.fraction<best.fraction))best=hit;
 }
 if(unresolved<=best.fraction){best.status=SweepStatus::Unresolved;best.fraction=unresolved;best.region=RegionId::None;best.component=-1;}
 return best;
}
} // namespace mech::boss_pose
