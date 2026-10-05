#define main NormalAuditMain
#include "audit_stage3_contacts.cpp"
#undef main
#include <fstream>
int main(int argc,char** argv){if(argc<2)return 2;std::ifstream in(argv[1]);int frames;in>>frames;Battle b;b.Start(Relic::EMP,0,0);bool first=true;std::printf("{\"scope\":\"Native exact Battle replay of WASM public control commands, rank0 EMP200ms\",\"cases\":[");
 for(int f=0;f<frames;f++){int activate;double command;in>>activate>>command;if(activate)b.Activate();auto before=b.shots;int count=b.sweepUnresolved;b.Advance(1./60.,command);if(b.sweepUnresolved>count){
  for(int slot=0;slot<Battle::MaxShots;slot++){const auto& s=b.shots[slot];const auto& old=before[slot];if(!s.active||!old.active||s.id!=old.id||!s.spatial||s.x!=old.x||s.y!=old.y||s.z!=old.z)continue;const bp::Vec3 start{s.x,s.y,-s.z},end{s.x+s.dx/60,s.y+s.dy/60,-s.z-s.dz/60};const double radius=s.kind==FriendlyKind::Missile?.09:.055;
   for(int i=0;i<11;i++)if(b.bossFrame.volumes[i].active){auto c=bp::SweepComponent(start,end,radius,b.previousBossFrame.pose,b.bossFrame.pose,i);if(c.status!=bp::SweepStatus::Unresolved)continue;const auto r8=PartitionTrue(start,end,radius,b.previousBossFrame.pose,b.bossFrame.pose,i,8),r16=PartitionTrue(start,end,radius,b.previousBossFrame.pose,b.bossFrame.pose,i,16);
    std::printf("%s{\"relic\":1,\"time\":%.17g,\"shot\":%d,\"mask\":%d,\"component\":%d,\"start\":[%.17g,%.17g,%.17g],\"end\":[%.17g,%.17g,%.17g],\"radius\":%.17g,\"before\":",first?"":",",b.time,s.id,b.bossPartsMask,i,start.x,start.y,start.z,end.x,end.y,end.z,radius);first=false;PoseOut(b.previousBossFrame.pose);std::printf(",\"after\":");PoseOut(b.bossFrame.pose);std::printf(",\"fraction\":%.17g,\"iterations\":%d,\"partition8\":%d,\"partition16\":%d}",c.fraction,c.iterations,int(r8.status),int(r16.status));
   }
  }
 }b.ConsumeEffects();}
 std::printf("],\"summary\":{\"time\":%.17g,\"phase\":%d,\"unresolved\":%d}}\n",b.time,int(b.phase),b.sweepUnresolved);return in?0:1;
}
