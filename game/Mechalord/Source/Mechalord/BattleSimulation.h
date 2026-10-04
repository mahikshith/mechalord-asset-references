#pragma once
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <string>
#include <vector>

namespace mech
{
enum class Phase { Menu, Run, Siege, Won, Lost };
enum class Relic { Shield, EMP, Overdrive };
enum class GateOperation { Recruit, Multiply, Energy };
enum class EventKind { Gate, Wave, Obstacle };
struct Encounter
{
    EventKind kind = EventKind::Gate;
    double at = 0, lane = 0, width = 0.32;
    GateOperation operation = GateOperation::Recruit;
    int value = 10;
    double health = 10, threat = 0.5, motion = 0;
};
struct Stage
{
    std::string id, name;
    double runSeconds = 45, siegeHealth = 0;
    bool optional = false, boss = false;
    int reward = 40;
    std::vector<Encounter> encounters;
};
struct Enemy
{
    double x = 0, y = 0, health = 0, threat = 0;
    bool alive = true;
};
struct Packet
{
    double x = 0, y = 0;
    int troops = 1;
    uint32_t gates = 0;
};
struct SiegeGate { double y = 0, x = 0, width = 0.7, motion = 0; int multiplier = 2; };

// No UObject, rendering, billing or filesystem dependency. This is the exact core
// linked by Unreal and the standalone regression executable.
class Battle
{
public:
    Phase phase = Phase::Menu;
    Relic relic = Relic::Shield;
    Stage stage;
    double elapsed = 0, lane = 0, aim = 0, energy = 100, champion = 0;
    double coreHealth = 0, baseHealth = 100, abilityLeft = 0;
    double warning = 0;
    int army = 5, reserve = 0, kills = 0;
    bool paused = false;
    std::vector<Enemy> enemies;
    std::vector<Packet> packets;
    std::vector<SiegeGate> siegeGates;
    void Start(const Stage& level, Relic equipped, int troopUpgrade = 0, int attackUpgrade = 0);
    void Advance(double seconds);
    bool ActivateRelic();
    bool DeployChampion();
    double EncounterLane(size_t index) const;
    bool EncounterConsumed(size_t index) const;
    int VisibleRepresentatives(int ceiling = 80) const;
    int LivePacketTroops() const;
    double RunProgress() const;
private:
    double accumulator = 0, attackPower = 1, losses = 0, launchClock = 0;
    double siegeElapsed = 0, bossClock = 0;
    int movingAttack = 0;
    std::vector<bool> consumed;
    void Step(double dt);
    void RunStep(double dt);
    void SiegeStep(double dt);
    void AddKill(double value);
};
std::vector<Stage> DefaultStages();
}
