#include "BattleSimulation.h"

// A browser renderer drives the same fixed-step C++ battle code as Unreal.
// This authored encounter is deliberately short for control/feedback playtests.
#define API(name) extern "C" __attribute__((export_name(name)))
static mech::Battle* Battle=nullptr;
static float State[24], Encounters[64*9], Enemies[64*5], Packets[256*4], Gates[16*5];
API("start_run") void StartRun(int relic)
{
    if(!Battle) Battle=new mech::Battle();
    mech::Stage s; s.id="breach-trial";s.name="Relic Causeway";s.runSeconds=32;s.siegeHealth=100;s.reward=60;
    auto gate=[&](double at,double lane,mech::GateOperation op,int value){mech::Encounter e;e.at=at;e.lane=lane;e.operation=op;e.value=value;s.encounters.push_back(e);};
    auto wave=[&](double at,double lane,double hp,double threat){mech::Encounter e;e.kind=mech::EventKind::Wave;e.at=at;e.lane=lane;e.health=hp;e.threat=threat;s.encounters.push_back(e);};
    using G=mech::GateOperation;
    gate(3,0,G::Recruit,10);
    gate(8,-.50,G::Multiply,2);gate(8,.50,G::Recruit,14);
    wave(14,0,24,3);
    mech::Encounter barrier;barrier.kind=mech::EventKind::Obstacle;barrier.at=18;barrier.lane=-.5;barrier.value=12;s.encounters.push_back(barrier);
    gate(18,.5,G::Recruit,15);
    gate(24,-.5,G::Multiply,2);gate(24,.5,G::Energy,100);
    wave(29,0,48,5);
    Battle->Start(s,static_cast<mech::Relic>(std::clamp(relic,0,2)));
}
API("step") void Step(double seconds,double lane)
{
    if(!Battle)return;
    Battle->lane=Battle->aim=std::clamp(lane,-1.0,1.0);Battle->Advance(seconds);
}
API("use_relic") int UseRelic(){return Battle&&Battle->ActivateRelic();}
API("use_champion") int UseChampion(){return Battle&&Battle->DeployChampion();}
API("set_paused") void SetPaused(int pause){if(Battle)Battle->paused=pause!=0;}
API("state") float* ReadState()
{
    if(!Battle)return State;
    State[0]=int(Battle->phase);State[1]=Battle->elapsed;State[2]=Battle->army;State[3]=Battle->reserve;
    State[4]=Battle->energy;State[5]=Battle->champion;State[6]=Battle->coreHealth;State[7]=Battle->baseHealth;
    State[8]=Battle->abilityLeft;State[9]=Battle->kills;State[10]=Battle->RunProgress();State[11]=Battle->stage.runSeconds;
    State[12]=Battle->LivePacketTroops();State[13]=Battle->paused;State[14]=Battle->warning;State[15]=Battle->stage.siegeHealth;
    State[16]=Battle->lane;State[17]=Battle->aim;State[18]=int(Battle->relic);return State;
}
API("encounter_count") int EncounterCount(){return Battle?Battle->stage.encounters.size():0;}
API("encounters") float* ReadEncounters()
{
    if(!Battle)return Encounters;
    for(size_t i=0;i<Battle->stage.encounters.size()&&i<64;i++){
        const auto&e=Battle->stage.encounters[i];float*o=Encounters+i*9;
        o[0]=int(e.kind);o[1]=e.at;o[2]=Battle->EncounterLane(i);o[3]=e.width;o[4]=int(e.operation);
        o[5]=e.value;o[6]=Battle->EncounterConsumed(i);o[7]=e.health;o[8]=e.threat;
    }return Encounters;
}
API("enemy_count") int EnemyCount(){return Battle?Battle->enemies.size():0;}
API("enemies") float* ReadEnemies()
{
    if(Battle)for(size_t i=0;i<Battle->enemies.size()&&i<64;i++){
        const auto&e=Battle->enemies[i];float*o=Enemies+i*5;o[0]=e.x;o[1]=e.y;o[2]=e.health;o[3]=e.threat;o[4]=e.alive;
    }return Enemies;
}
API("packet_count") int PacketCount(){return Battle?Battle->packets.size():0;}
API("packets") float* ReadPackets()
{
    if(Battle)for(size_t i=0;i<Battle->packets.size()&&i<256;i++){
        const auto&p=Battle->packets[i];float*o=Packets+i*4;o[0]=p.x;o[1]=p.y;o[2]=p.troops;o[3]=p.gates;
    }return Packets;
}
API("siege_gate_count") int SiegeGateCount(){return Battle?Battle->siegeGates.size():0;}
API("siege_gates") float* ReadGates()
{
    if(Battle)for(size_t i=0;i<Battle->siegeGates.size()&&i<16;i++){
        const auto&g=Battle->siegeGates[i];float*o=Gates+i*5;o[0]=g.x;o[1]=g.y;o[2]=g.width;o[3]=g.multiplier;o[4]=g.motion;
    }return Gates;
}
