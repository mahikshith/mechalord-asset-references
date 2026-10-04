#include "BattleSimulation.h"
#include <iostream>
#include <stdexcept>
using namespace mech;
int checks=0;
void check(bool ok,const char* message){++checks;if(!ok)throw std::runtime_error(message);}
Stage simple(double duration=5){Stage s;s.id="test";s.name="test";s.runSeconds=duration;return s;}
void advance(Battle& b,double seconds,int fps=60){for(int i=0;i<int(seconds*fps);++i)b.Advance(1.0/fps);}
int main(){try{
    Battle b; Stage s=simple(); Encounter e;e.at=1;e.value=10;s.encounters={e};
    b.Start(s,Relic::Shield);advance(b,2);check(b.army==15,"recruit gate");
    advance(b,2);check(b.army==15&&b.EncounterConsumed(0),"gate applies once");
    e.operation=GateOperation::Multiply;e.value=2147483647;s.encounters={e};
    b.Start(s,Relic::Shield);advance(b,2);check(b.army==500,"multiply caps without integer overflow");
    auto paired=simple(); e.operation=GateOperation::Recruit;e.value=10;e.lane=-0.5;
    auto right=e;right.lane=0.5;right.value=20;paired.encounters={e,right};
    b.Start(paired,Relic::Shield);b.lane=-0.5;advance(b,2);check(b.army==15,"two gates require a choice");
    auto wave=simple(10);e=Encounter{};e.kind=EventKind::Wave;e.at=5;e.health=80;e.threat=4;wave.encounters={e};
    Battle slow,fast;slow.Start(wave,Relic::Shield);fast.Start(wave,Relic::Shield);
    advance(slow,9,30);advance(fast,9,120);
    check(slow.army==fast.army&&slow.kills==fast.kills&&slow.phase==fast.phase,"frame-rate independent combat");
    check(std::abs(slow.elapsed-fast.elapsed)<1e-8,"frame-rate independent time");
    b.Start(s,Relic::Shield);b.paused=true;advance(b,2);check(b.elapsed==0,"pause freezes simulation");
    check(!b.ActivateRelic(),"pause blocks abilities");b.paused=false;
    check(b.ActivateRelic()&&!b.ActivateRelic(),"energy charged once");
    b.Start(simple(1),Relic::EMP);b.stage.siegeHealth=100;b.coreHealth=100;b.army=17;
    check(b.ActivateRelic(),"EMP activates");advance(b,1.1);
    check(b.phase==Phase::Siege&&b.reserve==17&&b.energy==0&&b.abilityLeft>0,"run transfers troops and relic state");
    b.siegeGates={{1,0,1,0,2}};b.reserve=0;b.packets={{0,0.98,1,0}};
    advance(b,1.0/60);check(b.packets[0].troops==2,"packet multiplies on crossing");
    b.packets[0].y=0.98;advance(b,1.0/60);check(b.packets[0].troops==2,"packet cannot reuse a gate");
    b.packets.clear();advance(b,1.0/60);check(b.phase==Phase::Lost,"empty reserves defeat");
    b.Start(simple(1),Relic::Shield);b.stage.siegeHealth=100;b.coreHealth=100;advance(b,1.1);
    b.champion=100;check(b.DeployChampion()&&b.champion==0&&b.coreHealth==70,"champion consumes meter");
    check(!b.DeployChampion(),"champion cannot double deploy");
    b.army=500; b.enemies={{0,1,500,1,true}};check(b.VisibleRepresentatives()<=80,"combined visual ceiling");
    for(int retry=0;retry<1000;++retry){b.Start(simple(),Relic::Overdrive);check(b.packets.empty()&&b.enemies.empty()&&b.army==5&&b.energy==100,"retry reset");}
    for(const auto& level:DefaultStages()){
        b.Start(level,Relic::Shield);
        for(int frame=0;frame<90*60&&(b.phase==Phase::Run||b.phase==Phase::Siege);++frame){
            if(b.phase==Phase::Run){
                double next=1e9;size_t selected=level.encounters.size();
                for(size_t i=0;i<level.encounters.size();++i){const auto& event=level.encounters[i];
                    if(event.kind==EventKind::Gate&&!b.EncounterConsumed(i)&&event.at>=b.elapsed&&event.at<next){next=event.at;selected=i;}}
                if(selected<level.encounters.size())b.lane=b.EncounterLane(selected);
            }else{b.aim=0;if(b.champion>=100)b.DeployChampion();}
            if(b.warning>0)b.ActivateRelic();b.Advance(1.0/60);
            check(b.packets.size()<=256&&b.enemies.size()<=32,"bounded authored encounters");
        }
        check(b.phase==Phase::Won,"every stage beatable with zero upgrades");
        std::cout<<"PASS "<<level.id<<" zero-upgrade route\n";
    }
    std::cout<<"PASS "<<checks<<" assertions\n";return 0;
}catch(const std::exception& ex){std::cerr<<"FAIL: "<<ex.what()<<"\n";return 1;}}
