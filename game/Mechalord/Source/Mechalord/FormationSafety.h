#pragma once
#include <algorithm>
#include <array>
#include <cmath>

// Portable admission policy, independent of Battle and rendering. A certificate
// covers only supplied bodies, hazards, kinematic envelopes and the time horizon.
// Existing attacks are never edited. Conservative rejection is not proof that a
// real escape is impossible. Workspace must be persistent/caller-owned, not a
// small stack local in the WebAssembly simulation.
namespace mech::formation_safety
{
constexpr int MaxBodies=25, MaxExisting=128, MaxProposed=16;
constexpr int MaxIntervals=4096, MaxReachable=512, MaxBins=360, MaxRetries=3;
constexpr int MaxPairChecks=65536; // Whole admission call, including baseline/retries.
constexpr double Pi=3.14159265358979323846;
struct Interval { double lo=0,hi=0; };
struct Body
{
    // World X = clamp(commander X, centerMin, centerMax) + offsetX.
    double offsetX=0,z=0,radius=.4,centerMin=-3,centerMax=3;
};
enum class Trajectory { Linear, Roller, Beam, Unsupported };
struct Hazard
{
    Trajectory trajectory=Trajectory::Linear;
    double start=0,end=4; // Active interval, relative to admission query time.
    double x=0,z=0,vx=0,vz=0,radiusX=.2,radiusZ=.2;
    // Linear envelopes: each coordinate can deviate at most .5*a*t*t from
    // initial velocity. Caller must prove these bounds over the ENTIRE horizon.
    double accelerationX=0,accelerationZ=0;
    // Roller X = clamp(x + amplitude*sin(phase+frequency*t), xMin, xMax).
    double amplitude=0,phase=0,frequency=0,xMin=-2.9,xMax=2.9;
    // Beam is a locked finite segment. radiusX is its half-width.
    double endX=0,endZ=0;
};
struct Query
{
    double commanderX=0,laneMin=-3,laneMax=3,maxSpeed=9;
    double horizon=4,maxStep=1./60.,reactionTime=0,margin=.001;
    const Body* bodies=nullptr; int bodyCount=0;
    const Hazard* existing=nullptr; int existingCount=0;
    const Hazard* proposed=nullptr; int proposedCount=0;
    // Delay is allowed only for an uncommitted, lower-priority proposed attack.
    // Each retry shifts all proposed start/end times by retrySpacing, nothing else.
    int retries=0; double retrySpacing=.25;
    // Default prevents a retry from hiding candidate rear-row impacts beyond
    // the certificate. Disable only for explicitly partial-horizon diagnostics.
    bool requireCompleteProposal=true;
};
enum class Decision { Admit, Delay, Suppress, ExistingUnsafe, Unsupported, InvalidInput, CapacityExceeded };
struct Result
{
    Decision decision=Decision::InvalidInput;
    double delay=0,testedHorizon=0;
    Interval best{}; int reachableCount=0;
    int evaluations=0,bins=0,maxForbidden=0,pairChecks=0;
};
struct Workspace
{
    std::array<Interval,MaxIntervals> forbidden{};
    std::array<Interval,MaxReachable> reachable{},next{};
    int reachableCount=0;
};
namespace detail
{
inline bool Finite(double v) { return std::isfinite(v) && std::abs(v)<=1e6; }
inline bool Valid(const Hazard& h)
{
    const double v[]={h.start,h.end,h.x,h.z,h.vx,h.vz,h.radiusX,h.radiusZ,
        h.accelerationX,h.accelerationZ,h.amplitude,h.phase,h.frequency,
        h.xMin,h.xMax,h.endX,h.endZ};
    for(double x:v) if(!Finite(x)) return false;
    return h.start>=0 && h.end>=h.start && h.radiusX>=0 && h.radiusZ>=0 &&
        h.accelerationX>=0 && h.accelerationZ>=0 && h.xMin<=h.xMax;
}
inline Decision Validate(const Query& q)
{
    const double v[]={q.commanderX,q.laneMin,q.laneMax,q.maxSpeed,q.horizon,
        q.maxStep,q.reactionTime,q.margin,q.retrySpacing};
    for(double x:v) if(!Finite(x)) return Decision::InvalidInput;
    if(q.laneMin>=q.laneMax || q.commanderX<q.laneMin || q.commanderX>q.laneMax ||
        q.maxSpeed<0 || q.horizon<=0 || q.horizon>6 || q.maxStep<=0 || q.maxStep>1./30. ||
        q.reactionTime<0 || q.margin<.000001 || q.retries<0 || q.retries>MaxRetries || q.retrySpacing<0 ||
        q.bodyCount<1 || q.bodyCount>MaxBodies || !q.bodies || q.existingCount<0 ||
        q.existingCount>MaxExisting || (q.existingCount && !q.existing) || q.proposedCount<0 ||
        q.proposedCount>MaxProposed || (q.proposedCount && !q.proposed)) return Decision::InvalidInput;
    if(std::ceil(q.horizon/q.maxStep)>MaxBins) return Decision::CapacityExceeded;
    for(int i=0;i<q.bodyCount;++i)
    {
        const Body& b=q.bodies[i];
        if(!Finite(b.offsetX)||!Finite(b.z)||!Finite(b.radius)||!Finite(b.centerMin)||!Finite(b.centerMax)||
            b.radius<0||b.centerMin>b.centerMax) return Decision::InvalidInput;
    }
    for(int s=0;s<2;++s)
    {
        const Hazard* h=s?q.proposed:q.existing; const int n=s?q.proposedCount:q.existingCount;
        for(int i=0;i<n;++i)
        {
            if(!Valid(h[i])) return Decision::InvalidInput;
            if(s && q.requireCompleteProposal && h[i].end>q.horizon) return Decision::Unsupported;
            if(h[i].trajectory==Trajectory::Unsupported) return Decision::Unsupported;
            if(h[i].trajectory==Trajectory::Beam && (h[i].vx!=0 || h[i].vz!=0 ||
                h[i].accelerationX!=0 || h[i].accelerationZ!=0)) return Decision::Unsupported;
            if(h[i].trajectory==Trajectory::Roller && (h[i].accelerationX!=0 ||
                h[i].accelerationZ!=0)) return Decision::Unsupported;
            if(h[i].trajectory!=Trajectory::Linear && h[i].trajectory!=Trajectory::Roller &&
               h[i].trajectory!=Trajectory::Beam) return Decision::Unsupported;
        }
    }
    return Decision::Admit;
}
inline Interval SineRange(double a,double b)
{
    if(a>b) std::swap(a,b);
    if(b-a>=2*Pi) return {-1,1};
    Interval r{std::min(std::sin(a),std::sin(b)),std::max(std::sin(a),std::sin(b))};
    if(std::ceil((a-Pi/2)/(2*Pi))<=std::floor((b-Pi/2)/(2*Pi))) r.hi=1;
    if(std::ceil((a+Pi/2)/(2*Pi))<=std::floor((b+Pi/2)/(2*Pi))) r.lo=-1;
    return r;
}
inline void Bounds(const Hazard& h,double a,double b,Interval& x,Interval& z)
{
    z={std::min(h.z+h.vz*a,h.z+h.vz*b),std::max(h.z+h.vz*a,h.z+h.vz*b)};
    if(h.trajectory==Trajectory::Roller)
    {
        Interval s=SineRange(h.phase+h.frequency*a,h.phase+h.frequency*b);
        x={h.x+std::min(h.amplitude*s.lo,h.amplitude*s.hi),h.x+std::max(h.amplitude*s.lo,h.amplitude*s.hi)};
        x.lo=std::clamp(x.lo,h.xMin,h.xMax); x.hi=std::clamp(x.hi,h.xMin,h.xMax);
    }
    else
    {
        const double ex=.5*h.accelerationX*b*b,ez=.5*h.accelerationZ*b*b;
        x={std::min(h.x+h.vx*a,h.x+h.vx*b)-ex,std::max(h.x+h.vx*a,h.x+h.vx*b)+ex};
        z.lo-=ez; z.hi+=ez;
    }
}
struct Prepared { Interval x{},z{}; bool active=false; };
inline Prepared Prepare(const Hazard& h,double binA,double binB,double delay)
{
    const double start=h.start+delay,end=h.end+delay;
    Prepared p;
    if(end<binA || start>binB) return p;
    p.active=true;
    if(h.trajectory==Trajectory::Beam)
    { p.x={std::min(h.x,h.endX),std::max(h.x,h.endX)};p.z={std::min(h.z,h.endZ),std::max(h.z,h.endZ)}; }
    else Bounds(h,std::max(binA,start)-start,std::min(binB,end)-start,p.x,p.z);
    return p;
}
// A rectangle bounds swept circles/ellipses, deliberately conservatively. Beam
// X is restricted to the body's Z band, not the whole diagonal segment's extent.
inline bool Forbidden(const Query& q,const Body& body,const Hazard& h,const Prepared& p,Interval& out)
{
    Interval x=p.x;
    if(h.trajectory==Trajectory::Beam)
    {
        const double dz=h.endZ-h.z, band=body.radius+h.radiusX+q.margin;
        const double lo=body.z-band,hi=body.z+band;
        if(std::abs(dz)<1e-12)
        {
            if(h.z<lo||h.z>hi) return false;
            x={std::min(h.x,h.endX),std::max(h.x,h.endX)};
        }
        else
        {
            double a=(lo-h.z)/dz,b=(hi-h.z)/dz; if(a>b)std::swap(a,b);
            a=std::max(0.,a); b=std::min(1.,b); if(a>b) return false;
            const double xa=h.x+(h.endX-h.x)*a,xb=h.x+(h.endX-h.x)*b;
            x={std::min(xa,xb),std::max(xa,xb)};
        }
    }
    else
    {
        const double rz=h.radiusZ+body.radius+q.margin;
        if(p.z.lo>body.z+rz || p.z.hi<body.z-rz) return false;
    }
    const double rx=h.radiusX+body.radius+q.margin;
    const double lo=x.lo-rx-body.offsetX,hi=x.hi+rx-body.offsetX;
    if(hi<body.centerMin || lo>body.centerMax) return false;
    out.lo=std::max(q.laneMin,lo<=body.centerMin?q.laneMin:lo);
    out.hi=std::min(q.laneMax,hi>=body.centerMax?q.laneMax:hi);
    return out.lo<=out.hi;
}
enum class Check { Safe, Unsafe, Capacity };
inline Check Evaluate(const Query& q,Workspace& w,bool candidate,double delay,Result& report)
{
    ++report.evaluations;
    w.reachableCount=1; w.reachable[0]={q.commanderX,q.commanderX};
    const int bins=int(std::ceil(q.horizon/q.maxStep));
    const double dt=q.horizon/bins;
    double minZ=1e9,maxZ=-1e9;
    for(int i=0;i<q.bodyCount;++i)
    { minZ=std::min(minZ,q.bodies[i].z-q.bodies[i].radius);maxZ=std::max(maxZ,q.bodies[i].z+q.bodies[i].radius); }
    for(int k=0;k<bins;++k)
    {
        ++report.bins;
        const double a=k*dt,b=(k+1)*dt;
        int count=0;
        for(int s=0;s<(candidate?2:1);++s)
        {
            const Hazard* h=s?q.proposed:q.existing; const int n=s?q.proposedCount:q.existingCount;
            for(int i=0;i<n;++i)
            {
                const Prepared p=Prepare(h[i],a,b,s?delay:0);
                if(!p.active)continue;
                const double rz=(h[i].trajectory==Trajectory::Beam?h[i].radiusX:h[i].radiusZ)+q.margin;
                if(p.z.lo-rz>maxZ || p.z.hi+rz<minZ)continue;
                for(int j=0;j<q.bodyCount;++j)
                {
                    if(report.pairChecks==MaxPairChecks)return Check::Capacity;
                    ++report.pairChecks;
                    Interval f;
                    if(!Forbidden(q,q.bodies[j],h[i],p,f))continue;
                    if(count==MaxIntervals)return Check::Capacity;
                    w.forbidden[count++]=f;
                }
            }
        }
        report.maxForbidden=std::max(report.maxForbidden,count);
        std::sort(w.forbidden.begin(),w.forbidden.begin()+count,[](Interval x,Interval y){return x.lo<y.lo;});
        int merged=0;
        for(int i=0;i<count;++i)
        {
            if(merged && w.forbidden[i].lo<=w.forbidden[merged-1].hi)
                w.forbidden[merged-1].hi=std::max(w.forbidden[merged-1].hi,w.forbidden[i].hi);
            else w.forbidden[merged++]=w.forbidden[i];
        }
        const double distance=q.maxSpeed*std::max(0.,b-std::max(a,q.reactionTime));
        int nextCount=0;
        auto Corridor=[&](double lo,double hi)->bool
        {
            if(lo>hi) return true;
            for(int i=0;i<w.reachableCount;++i)
            {
                const double seedLo=std::max(lo,w.reachable[i].lo),seedHi=std::min(hi,w.reachable[i].hi);
                if(seedLo>seedHi) continue;
                Interval r{std::max(lo,seedLo-distance),std::min(hi,seedHi+distance)};
                if(nextCount && r.lo<=w.next[nextCount-1].hi)
                    w.next[nextCount-1].hi=std::max(w.next[nextCount-1].hi,r.hi);
                else { if(nextCount==MaxReachable)return false; w.next[nextCount++]=r; }
            }
            return true;
        };
        double left=q.laneMin;
        for(int i=0;i<merged;++i)
        {
            if(!Corridor(left,w.forbidden[i].lo-q.margin))return Check::Capacity;
            left=w.forbidden[i].hi+q.margin;
        }
        if(!Corridor(left,q.laneMax))return Check::Capacity;
        w.reachableCount=nextCount;
        if(!nextCount) return Check::Unsafe;
        std::copy_n(w.next.begin(),nextCount,w.reachable.begin());
    }
    return Check::Safe;
}
}
inline Result AdmitAttack(const Query& q,Workspace& w)
{
    Result r; w.reachableCount=0; r.decision=detail::Validate(q);
    if(r.decision!=Decision::Admit)return r;
    r.testedHorizon=q.horizon;
    const auto baseline=detail::Evaluate(q,w,false,0,r);
    if(baseline!=detail::Check::Safe)
    {
        w.reachableCount=0;
        r.decision=baseline==detail::Check::Capacity?Decision::CapacityExceeded:Decision::ExistingUnsafe;
        return r;
    }
    for(int retry=0;retry<=q.retries;++retry)
    {
        const double delay=retry*q.retrySpacing;
        bool complete=true;
        if(q.requireCompleteProposal)for(int i=0;i<q.proposedCount;++i)
            if(q.proposed[i].end+delay>q.horizon)complete=false;
        if(!complete)continue;
        const auto check=detail::Evaluate(q,w,true,delay,r);
        if(check==detail::Check::Capacity) { r.decision=Decision::CapacityExceeded; w.reachableCount=0;return r; }
        if(check!=detail::Check::Safe)continue;
        r.decision=retry?Decision::Delay:Decision::Admit; r.delay=delay;
        r.reachableCount=w.reachableCount; r.best=w.reachable[0];
        for(int i=1;i<w.reachableCount;++i)
            if(w.reachable[i].hi-w.reachable[i].lo>r.best.hi-r.best.lo)r.best=w.reachable[i];
        return r;
    }
    r.decision=Decision::Suppress; w.reachableCount=0; return r;
}
} // namespace mech::formation_safety
