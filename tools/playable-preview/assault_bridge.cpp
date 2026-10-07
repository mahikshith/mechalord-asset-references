#include "AssaultSimulation.h"
#define API(Name) extern "C" __attribute__((export_name(Name)))
static mech::assault::Battle Battle;
static float Formation[24*3];
static float LaserData[2*9];
static float State[116],Targets[256*24],Shots[256*13],EnemyShots[96*13],Pickups[24*7],Effects[192*15];
API("abi_version") int Version(){return 5;}
API("start_run") void Start(int Relic,int Level,int Rank) { Battle.Start(static_cast<mech::assault::Relic>(std::clamp(Relic,0,2)),Level,Rank); }
API("level_name") const char* LevelName() { return Battle.LevelName(); }
API("step") void Step(double Dt,double X) { Battle.Advance(Dt,X); }
API("use_relic") int Activate() { return Battle.Activate(); }
API("use_relic_slot") int ActivateSlot(int Slot) { return Slot>=0&&Slot<=2&&Battle.ActivateRelic(static_cast<mech::assault::Relic>(Slot)); }
API("fire_laser") int FireLaser() { return Battle.FireLaser(); }
API("clash_tap") int ClashTap() { return Battle.ClashTap(); }
API("apply_legacy_reward") int ApplyLegacyReward(int Choice) { return Battle.ApplyLegacyReward(Choice); }
API("apply_loadout") int ApplyLoadout(int S,int H,int W,int Weapon) { return Battle.ApplyLoadout(S,H,W,Weapon); }
API("buy_now") int BuyNow(int Item) { return Battle.BuyNow(Item); }
API("choose_reward") int ChooseReward(int Choice) { return Battle.ChooseReward(Choice); }
API("heal") int Heal() { return Battle.Heal(); }
API("revive") int Revive() { return Battle.Revive(); }
API("decline_revive") int Decline() { return Battle.DeclineRevive(); }
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
    State[34]=Battle.bossY; State[35]=Battle.bossPhase; State[36]=int(Battle.bossPattern); State[37]=Battle.PickupCount(); State[38]=Battle.commanderHp; State[39]=Battle.commanderMaxHp;
    State[40]=int(Battle.timePower); State[41]=Battle.timePowerTime;
    State[42]=Battle.bossArmor; State[43]=Battle.bossArmorMax; State[44]=Battle.bossCoreHp; State[45]=Battle.bossCoreMax;
    State[46]=Battle.bossCoreTime; State[47]=int(Battle.bossState); State[48]=Battle.bossRevives;
    State[49]=int(Battle.starterWeapon); State[50]=Battle.powerTime<=0 && Battle.starterWeapon!=mech::assault::WeaponPower::None && Battle.weaponPower==Battle.starterWeapon;
    State[51]=Battle.CanHeal(); State[52]=Battle.healUsesRemaining; State[53]=Battle.reviveUsed; State[54]=Battle.CanRevive();
    State[55]=Battle.bossPartsMask; State[56]=Battle.BossPart(); State[57]=Battle.BossPartHp(); State[58]=Battle.BossPartMax();
    State[59]=20; State[60]=std::min(25.,std::max(0.,Battle.commanderMaxHp-Battle.commanderHp)); State[61]=12; State[62]=50; State[63]=Battle.reviveProtection; State[64]=Battle.empPulseTime; State[65]=Battle.empStunTime; State[66]=Battle.escortShield; State[67]=30; State[68]=Battle.safetyAdmitted; State[69]=Battle.safetyDeferred; State[70]=Battle.safetyUnsupported; State[71]=Battle.safetyExistingUnsafe; State[72]=Battle.safetyCapacity; State[73]=Battle.safetyAuthoredRockets; State[74]=Battle.safetyHorizon;State[75]=Battle.guardHp;State[76]=Battle.guardMax;State[77]=Battle.bossEpoch;State[78]=Battle.sweepUnresolved;State[79]=int(Battle.combatPower);State[80]=Battle.combatPowerTime;State[81]=Battle.bossEvadeTime;State[82]=Battle.bossEvadeTell;State[83]=Battle.bossFiringWindow;
    State[84]=Battle.campaign;State[85]=Battle.actIndex;State[86]=Battle.StageLevel();State[87]=Battle.StageProgress();
    for(int I=0;I<3;++I){State[88+I*2]=Battle.campaign?Battle.relicEnergy[I]:(I==int(Battle.relic)?Battle.energy:0);State[89+I*2]=Battle.campaign?Battle.relicTime[I]:(I==int(Battle.relic)?Battle.ability:0);}
    State[94]=Battle.laserCharges;State[95]=Battle.reviveCinematicTime;State[96]=Battle.phase==mech::assault::Phase::Reward;
    State[97]=Battle.rewardLaser;State[98]=Battle.rewardVitality;State[99]=Battle.rewardEndurance;
    const auto& C=Battle.clash;State[100]=C.active;State[101]=C.progress;State[102]=C.time;State[103]=C.x;State[104]=C.y;State[105]=C.z;State[106]=C.heroX;State[107]=C.heroY;State[108]=C.heroZ;State[109]=C.enemyX;State[110]=C.enemyY;State[111]=C.enemyZ;State[112]=C.result;
    return State;
}
API("target_count") int TargetCount() { return Battle.TargetCount(); }
API("targets") float* GetTargets()
{
    int N=0; for(const auto& T:Battle.targets) if(T.active)
    {
        float* O=Targets+N++*24;
        O[0]=T.id; O[1]=int(T.kind); O[2]=T.x; O[3]=T.z; O[4]=T.hp; O[5]=T.maxHp;
        O[6]=T.value; O[7]=T.op; O[8]=T.size; O[9]=T.hit; O[10]=T.variant; O[11]=T.depth;
        O[12]=int(T.fireState); O[13]=T.aimX; O[14]=T.charge; O[15]=T.role; O[16]=T.stunTime; O[17]=T.ventOpen; O[18]=T.ventTime;O[19]=T.archetype;O[20]=T.shieldHp;O[21]=T.shieldMax;O[22]=T.blockFlash;O[23]=T.skillState;
    } return Targets;
}
API("shot_count") int ShotCount() { return Battle.ShotCount(); }
API("shots") float* GetShots()
{
    int N=0; for(const auto& S:Battle.shots) if(S.active)
    {
        float* O=Shots+N++*13; O[0]=S.x; O[1]=S.z; O[2]=S.dx; O[3]=S.dz; O[4]=S.heavy; O[5]=int(S.kind); O[6]=S.troop;O[7]=S.id;O[8]=S.y;O[9]=S.dy;O[10]=S.aimRegion;O[11]=S.epoch;O[12]=S.spatial;
    } return Shots;
}
API("effect_count") int EffectCount() { return Battle.effectCount; }
API("pickup_count") int PickupCount() { return Battle.PickupCount(); }
API("pickups") float* GetPickups()
{
    int N=0; for(const auto& P:Battle.pickups) if(P.active)
    { float* O=Pickups+N++*7; O[0]=P.id; O[1]=int(P.kind); O[2]=P.x; O[3]=P.z; O[4]=P.radius; O[5]=P.choiceGroup;O[6]=P.bonusTroops; }
    return Pickups;
}
API("enemy_shot_count") int EnemyShotCount() { return Battle.EnemyShotCount(); }
API("enemy_shots") float* GetEnemyShots()
{
    const double Slow=Battle.HostileSpeed();
    int N=0; for(const auto& S:Battle.enemyShots) if(S.active)
    {
        float* O=EnemyShots+N++*13;
        O[0]=S.id; O[1]=S.x; O[2]=S.z; O[3]=S.dx*Slow; O[4]=S.dz*Slow;
        O[5]=S.radius; O[6]=int(S.kind); O[7]=S.homing; O[8]=S.sourceId; O[9]=int(S.emitter); O[10]=S.launchX; O[11]=S.launchZ; O[12]=S.launchY;
    } return EnemyShots;
}
API("drain_effects") float* EffectsOnce()
{
    for(int I=0;I<Battle.effectCount;++I)
    {
        const auto& E=Battle.effects[I]; float* O=Effects+I*15;
        O[0]=E.id; O[1]=int(E.kind); O[2]=E.x; O[3]=E.z; O[4]=E.value;
        O[5]=E.entityId; O[6]=E.variant; O[7]=E.size;O[8]=E.y;O[9]=E.hitRegion;O[10]=E.spatial;O[11]=E.endX;O[12]=E.endY;O[13]=E.endZ;O[14]=E.endpoint;
    }
    Battle.ConsumeEffects(); return Effects;
}

API("formation_count") int FormationCount()
{ int N=0; for(int I=0;I<24;++I) if(Battle.formationAlive[I]) ++N; return N; }
API("formation") float* GetFormation()
{ int N=0; for(int I=0;I<24;++I) if(Battle.formationAlive[I])
    { double X,Z; Battle.TroopPosition(I,X,Z); float* O=Formation+N++*3; O[0]=I; O[1]=X; O[2]=Z; } return Formation; }

API("laser_count") int LaserCount() { int N=0; for(const auto& L:Battle.lasers) if(L.active) ++N; return N; }
API("lasers") float* GetLasers() { int N=0; for(const auto& L:Battle.lasers) if(L.active)
    { float* O=LaserData+N++*9; O[0]=L.id; O[1]=L.x; O[2]=L.z; O[3]=L.endX; O[4]=L.endZ; O[5]=L.width; O[6]=L.time;O[7]=L.y;O[8]=L.endY; } return LaserData; }

static float PoseData[17],RegionData[7*15],ComponentData[11*14];
API("boss_pose") float* GetPose(){const auto& P=Battle.bossFrame.pose;PoseData[0]=P.position.x;PoseData[1]=P.position.y;PoseData[2]=P.position.z;PoseData[3]=P.rootEuler.x;PoseData[4]=P.rootEuler.y;PoseData[5]=P.rootEuler.z;PoseData[6]=P.clock;for(int I=0;I<2;++I){PoseData[7+I*2]=P.armPitch[I];PoseData[8+I*2]=P.armRoll[I];PoseData[11+I]=P.legPitch[I];PoseData[13+I]=P.kneePitch[I];PoseData[15+I]=P.barrelSpin[I];}return PoseData;}
API("boss_regions") float* GetRegions(){for(int I=0;I<7;++I){const auto& R=Battle.bossFrame.regions[I];const auto& V=Battle.bossFrame.volumes[R.first];float* O=RegionData+I*15;O[0]=I;O[1]=R.aimCenter.x;O[2]=R.aimCenter.y;O[3]=-R.aimCenter.z;O[4]=V.half.x;O[5]=V.half.y;O[6]=V.half.z;O[7]=V.rotation.x;O[8]=V.rotation.y;O[9]=V.rotation.z;O[10]=V.rotation.w;O[11]=Battle.RegionHp(I);O[12]=Battle.RegionMax(I);O[13]=Battle.RegionVulnerable(I);O[14]=R.active;}return RegionData;}
API("boss_components") float* GetComponents(){for(int I=0;I<11;++I){const auto& V=Battle.bossFrame.volumes[I];float* O=ComponentData+I*14;O[0]=I;O[1]=int(V.region);O[2]=V.center.x;O[3]=V.center.y;O[4]=-V.center.z;O[5]=V.half.x;O[6]=V.half.y;O[7]=V.half.z;O[8]=V.rotation.x;O[9]=V.rotation.y;O[10]=V.rotation.z;O[11]=V.rotation.w;O[12]=V.shape==mech::boss_pose::Shape::Ellipsoid;O[13]=V.active;}return ComponentData;}

static float BeamData[9];
API("friendly_beam_count") int FriendlyBeamCount(){return Battle.friendlyBeam.time>0?1:0;}
API("friendly_beams") float* FriendlyBeams(){const auto& B=Battle.friendlyBeam;BeamData[0]=B.id;BeamData[1]=B.x;BeamData[2]=B.y;BeamData[3]=B.z;BeamData[4]=B.endX;BeamData[5]=B.endY;BeamData[6]=B.endZ;BeamData[7]=B.width;BeamData[8]=B.time;return BeamData;}
