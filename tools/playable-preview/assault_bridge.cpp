#include "AssaultSimulation.h"
#define API(Name) extern "C" __attribute__((export_name(Name)))
static mech::assault::Battle Battle;
static float State[18],Targets[160*11],Shots[256*3],Effects[128*6];
API("start_run") void Start(int Relic) { Battle.Start(static_cast<mech::assault::Relic>(std::clamp(Relic,0,2))); }
API("step") void Step(double Dt,double X) { Battle.Advance(Dt,X); }
API("use_relic") int Activate() { return Battle.Activate(); }
API("set_paused") void Pause(int Value) { Battle.paused=Value!=0; }
API("state") float* GetState()
{
    State[0]=int(Battle.phase); State[1]=Battle.time; State[2]=Battle.Duration; State[3]=Battle.x;
    State[4]=Battle.army; State[5]=Battle.energy; State[6]=Battle.ability; State[7]=int(Battle.relic);
    State[8]=Battle.weapon; State[9]=Battle.kills; State[10]=Battle.bossHp; State[11]=Battle.bossMax;
    State[12]=Battle.bossAttack; State[13]=Battle.bossLane; State[14]=Battle.score;
    State[15]=Battle.TargetCount(); State[16]=Battle.ShotCount(); State[17]=Battle.paused; return State;
}
API("target_count") int TargetCount() { return Battle.TargetCount(); }
API("targets") float* GetTargets()
{
    int N=0; for(const auto& T:Battle.targets) if(T.active)
    {
        float* O=Targets+N++*11;
        O[0]=T.id; O[1]=int(T.kind); O[2]=T.x; O[3]=T.z; O[4]=T.hp; O[5]=T.maxHp;
        O[6]=T.value; O[7]=T.op; O[8]=T.size; O[9]=T.hit; O[10]=0;
    } return Targets;
}
API("shot_count") int ShotCount() { return Battle.ShotCount(); }
API("shots") float* GetShots()
{
    int N=0; for(const auto& S:Battle.shots) if(S.active)
    {
        float* O=Shots+N++*3; O[0]=S.x; O[1]=S.z; O[2]=S.heavy;
    } return Shots;
}
API("effect_count") int EffectCount() { return Battle.effectCount; }
API("drain_effects") float* EffectsOnce()
{
    for(int I=0;I<Battle.effectCount;++I)
    {
        const auto& E=Battle.effects[I]; float* O=Effects+I*6;
        O[0]=E.id; O[1]=int(E.kind); O[2]=E.x; O[3]=E.z; O[4]=E.value; O[5]=0;
    }
    Battle.ConsumeEffects(); return Effects;
}
