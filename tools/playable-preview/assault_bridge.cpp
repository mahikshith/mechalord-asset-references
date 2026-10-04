#include "AssaultSimulation.h"
#define API(Name) extern "C" __attribute__((export_name(Name)))
static mech::assault::Battle Battle;
static float Formation[24*3];
static float State[40],Targets[256*11],Shots[256*7],EnemyShots[96*8],Pickups[24*5],Effects[192*8];
API("start_run") void Start(int Relic,int Level,int Rank) { Battle.Start(static_cast<mech::assault::Relic>(std::clamp(Relic,0,2)),Level,Rank); }
API("level_name") const char* LevelName() { return Battle.LevelName(); }
API("step") void Step(double Dt,double X) { Battle.Advance(Dt,X); }
API("use_relic") int Activate() { return Battle.Activate(); }
API("set_paused") void Pause(int Value) { Battle.paused=Value!=0; }
API("state") float* GetState()
{
    State[0]=int(Battle.phase); State[1]=Battle.time; State[2]=Battle.duration; State[3]=Battle.x;
    State[4]=Battle.army; State[5]=Battle.energy; State[6]=Battle.ability; State[7]=int(Battle.relic);
    State[8]=Battle.weapon; State[9]=Battle.kills; State[10]=Battle.bossHp; State[11]=Battle.bossMax;
    State[12]=Battle.bossAttack; State[13]=Battle.bossLane; State[14]=Battle.score;
    State[15]=Battle.TargetCount(); State[16]=Battle.ShotCount(); State[17]=Battle.paused;
    State[18]=Battle.level; State[19]=Battle.weaponXP; State[20]=Battle.weaponNeed; State[21]=Battle.EnemyShotCount();
    State[22]=Battle.bossX; State[23]=Battle.bossZ; State[24]=int(Battle.bossAction);
    State[25]=Battle.deathProgress; State[26]=Battle.travelDistance; State[27]=Battle.travelGoal;
    State[28]=Battle.engagement; State[29]=Battle.Frontline;
    State[30]=Battle.rank; State[31]=Battle.rankReward; State[32]=int(Battle.weaponPower); State[33]=Battle.powerTime;
    State[34]=Battle.bossY; State[35]=Battle.bossPhase; State[36]=int(Battle.bossPattern); State[37]=Battle.PickupCount(); State[38]=Battle.commanderHp; State[39]=Battle.commanderMaxHp; return State;
}
API("target_count") int TargetCount() { return Battle.TargetCount(); }
API("targets") float* GetTargets()
{
    int N=0; for(const auto& T:Battle.targets) if(T.active)
    {
        float* O=Targets+N++*11;
        O[0]=T.id; O[1]=int(T.kind); O[2]=T.x; O[3]=T.z; O[4]=T.hp; O[5]=T.maxHp;
        O[6]=T.value; O[7]=T.op; O[8]=T.size; O[9]=T.hit; O[10]=T.variant;
    } return Targets;
}
API("shot_count") int ShotCount() { return Battle.ShotCount(); }
API("shots") float* GetShots()
{
    int N=0; for(const auto& S:Battle.shots) if(S.active)
    {
        float* O=Shots+N++*7; O[0]=S.x; O[1]=S.z; O[2]=S.dx; O[3]=S.dz; O[4]=S.heavy; O[5]=int(S.kind); O[6]=S.troop;
    } return Shots;
}
API("effect_count") int EffectCount() { return Battle.effectCount; }
API("pickup_count") int PickupCount() { return Battle.PickupCount(); }
API("pickups") float* GetPickups()
{
    int N=0; for(const auto& P:Battle.pickups) if(P.active)
    { float* O=Pickups+N++*5; O[0]=P.id; O[1]=int(P.kind); O[2]=P.x; O[3]=P.z; O[4]=P.radius; }
    return Pickups;
}
API("enemy_shot_count") int EnemyShotCount() { return Battle.EnemyShotCount(); }
API("enemy_shots") float* GetEnemyShots()
{
    const double Slow=Battle.ability>0 && Battle.relic==mech::assault::Relic::EMP ? .38 : 1;
    int N=0; for(const auto& S:Battle.enemyShots) if(S.active)
    {
        float* O=EnemyShots+N++*8;
        O[0]=S.id; O[1]=S.x; O[2]=S.z; O[3]=S.dx*Slow; O[4]=S.dz*Slow;
        O[5]=S.radius; O[6]=int(S.kind); O[7]=0;
    } return EnemyShots;
}
API("drain_effects") float* EffectsOnce()
{
    for(int I=0;I<Battle.effectCount;++I)
    {
        const auto& E=Battle.effects[I]; float* O=Effects+I*8;
        O[0]=E.id; O[1]=int(E.kind); O[2]=E.x; O[3]=E.z; O[4]=E.value;
        O[5]=E.entityId; O[6]=E.variant; O[7]=E.size;
    }
    Battle.ConsumeEffects(); return Effects;
}

API("formation_count") int FormationCount()
{ int N=0; for(int I=0;I<std::min(24,Battle.army-1);++I) if(Battle.casualtyCooldown[I]<=0) ++N; return N; }
API("formation") float* GetFormation()
{ int N=0; for(int I=0;I<std::min(24,Battle.army-1);++I) if(Battle.casualtyCooldown[I]<=0)
    { double X,Z; Battle.TroopPosition(I,X,Z); float* O=Formation+N++*3; O[0]=I; O[1]=X; O[2]=Z; } return Formation; }
