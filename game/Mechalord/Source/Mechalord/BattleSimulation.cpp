#include "BattleSimulation.h"

namespace mech
{
void Battle::Start(const Stage& level, Relic equipped, int troopUpgrade, int attackUpgrade)
{
    stage = level; stage.runSeconds = std::max(1.0, stage.runSeconds);
    relic = equipped; phase = Phase::Run;
    elapsed = accumulator = losses = launchClock = siegeElapsed = bossClock = 0;
    lane = aim = champion = abilityLeft = warning = 0; energy = 100;
    army = 5 + std::clamp(troopUpgrade, 0, 5) * 2;
    attackPower = 1 + std::clamp(attackUpgrade, 0, 5) * 0.15;
    reserve = kills = movingAttack = 0; paused = false;
    coreHealth = stage.siegeHealth; baseHealth = 100;
    enemies.clear(); packets.clear(); siegeGates.clear();
    enemies.reserve(32); packets.reserve(256);
    consumed.assign(stage.encounters.size(), false);
}
void Battle::Advance(double seconds)
{
    if (paused || (phase != Phase::Run && phase != Phase::Siege)) return;
    // Preserve elapsed time at ordinary frame rates, clamp stalls instead of
    // simulating a suspended app's entire absence on return.
    accumulator += std::clamp(seconds, 0.0, 0.25);
    constexpr double tick = 1.0 / 60.0;
    while (accumulator + 1e-10 >= tick)
    {
        accumulator -= tick; Step(tick);
        if (phase != Phase::Run && phase != Phase::Siege) { accumulator = 0; break; }
    }
}
bool Battle::ActivateRelic()
{
    if (paused || energy < 100 || (phase != Phase::Run && phase != Phase::Siege)) return false;
    energy = 0; abilityLeft = relic == Relic::Overdrive ? 5 : 3;
    return true;
}
bool Battle::DeployChampion()
{
    if (paused || phase != Phase::Siege || champion < 100) return false;
    champion = 0; coreHealth = std::max(0.0, coreHealth - 30 * attackPower);
    for (auto& enemy : enemies) if (enemy.alive) { enemy.health -= 12; if (enemy.health <= 0) { enemy.alive = false; AddKill(12); } }
    if (coreHealth <= 0) phase = Phase::Won;
    return true;
}
double Battle::EncounterLane(size_t i) const
{
    const auto& e = stage.encounters[i];
    return std::clamp(e.lane + e.motion * std::sin(elapsed * 1.3 + i), -0.85, 0.85);
}
bool Battle::EncounterConsumed(size_t i) const { return i < consumed.size() && consumed[i]; }
int Battle::VisibleRepresentatives(int ceiling) const
{
    int enemyCount = 0;
    for (const auto& e : enemies) if (e.alive) enemyCount += std::max(1, int(std::ceil(e.health)));
    return std::min(std::max(0, ceiling), std::max(0, phase == Phase::Siege ? LivePacketTroops() : army) + enemyCount);
}
int Battle::LivePacketTroops() const { int n = 0; for (const auto& p : packets) n += p.troops; return n; }
double Battle::RunProgress() const { return std::clamp(elapsed / stage.runSeconds, 0.0, 1.0); }
void Battle::AddKill(double value)
{
    ++kills; energy = std::min(100.0, energy + value * 2);
    champion = std::min(100.0, champion + value * 2);
}
void Battle::Step(double dt)
{
    abilityLeft = std::max(0.0, abilityLeft - dt);
    if (phase == Phase::Run) { elapsed += dt; RunStep(dt); }
    else if (phase == Phase::Siege) SiegeStep(dt);
}
void Battle::RunStep(double dt)
{
    lane = std::clamp(lane, -1.0, 1.0);
    for (size_t i = 0; i < stage.encounters.size(); ++i)
    {
        const auto& e = stage.encounters[i];
        if (consumed[i]) continue;
        if (e.kind == EventKind::Wave && elapsed >= e.at - 5)
        {
            consumed[i] = true;
            enemies.push_back({e.lane, 5, e.health, e.threat, true});
        }
        else if (e.kind != EventKind::Wave && elapsed >= e.at)
        {
            consumed[i] = true;
            if (std::abs(lane - EncounterLane(i)) > e.width) continue;
            if (e.kind == EventKind::Obstacle)
            { if (!(abilityLeft > 0 && relic == Relic::Shield)) army = std::max(0, army - e.value); }
            else if (e.operation == GateOperation::Recruit) army = int(std::clamp(int64_t(army) + e.value, int64_t(0), int64_t(500)));
            else if (e.operation == GateOperation::Multiply) army = int(std::clamp(int64_t(army) * e.value, int64_t(0), int64_t(500)));
            else energy = std::min(100.0, energy + e.value);
        }
    }
    const bool emp = abilityLeft > 0 && relic == Relic::EMP;
    const bool shield = abilityLeft > 0 && relic == Relic::Shield;
    const double boost = abilityLeft > 0 && relic == Relic::Overdrive ? 2 : 1;
    for (auto& e : enemies)
    {
        if (!e.alive) continue;
        if (!emp) e.y -= dt;
        if (e.y <= 3 && std::abs(lane - e.x) < 0.8)
        {
            e.health -= std::max(1, army) * attackPower * boost * dt * 0.7;
            if (e.health <= 0) { e.alive = false; AddKill(10); continue; }
        }
        if (e.y <= 0)
        {
            if (!shield && !emp && std::abs(lane - e.x) < 0.8) losses += e.threat * dt;
            if (e.y <= -2) e.alive = false;
        }
    }
    const int removed = int(losses); army = std::max(0, army - removed); losses -= removed;
    enemies.erase(std::remove_if(enemies.begin(), enemies.end(), [](const Enemy& e) { return !e.alive; }), enemies.end());
    if (army <= 0) { phase = Phase::Lost; return; }
    if (elapsed >= stage.runSeconds)
    {
        if (stage.siegeHealth <= 0) { phase = Phase::Won; return; }
        reserve = army; enemies.clear(); phase = Phase::Siege;
        siegeGates = {{3, -0.5, 0.65, 0.45, 2}, {5, 0.45, 0.65, 0.5, 3}};
    }
}
void Battle::SiegeStep(double dt)
{
    siegeElapsed += dt; launchClock += dt; bossClock += dt;
    const bool emp = abilityLeft > 0 && relic == Relic::EMP;
    const bool shield = abilityLeft > 0 && relic == Relic::Shield;
    const double boost = abilityLeft > 0 && relic == Relic::Overdrive ? 2 : 1;
    for (size_t i = 0; i < siegeGates.size(); ++i)
        siegeGates[i].x = std::sin(siegeElapsed * 1.2 + i * 2.2) * siegeGates[i].motion;
    const double cadence = 0.14 / boost;
    while (launchClock >= cadence && reserve > 0 && packets.size() < 256)
    {
        launchClock -= cadence; --reserve;
        packets.push_back({std::clamp(aim, -1.0, 1.0), 0, 1, 0});
    }
    if (reserve == 0) launchClock = 0;
    for (auto& p : packets)
    {
        const double before = p.y; p.y += dt * 3;
        for (size_t i = 0; i < siegeGates.size(); ++i)
        {
            const uint32_t flag = uint32_t(1) << i; const auto& g = siegeGates[i];
            if (!(p.gates & flag) && before < g.y && p.y >= g.y)
            {
                p.gates |= flag;
                if (std::abs(p.x - g.x) <= g.width) p.troops = std::min(500, p.troops * g.multiplier);
            }
        }
        if (p.y >= 8) { coreHealth = std::max(0.0, coreHealth - p.troops * attackPower); AddKill(p.troops); }
    }
    packets.erase(std::remove_if(packets.begin(), packets.end(), [](const Packet& p) { return p.y >= 8; }), packets.end());
    warning = stage.boss && bossClock >= 4 && bossClock < 5 ? 1 : 0;
    if (bossClock >= 5)
    {
        bossClock = 0;
        if (!shield && !emp) baseHealth -= stage.boss ? 14 : 5;
    }
    if (coreHealth <= 0) phase = Phase::Won;
    else if (baseHealth <= 0 || (reserve == 0 && packets.empty())) phase = Phase::Lost;
}

std::vector<Stage> DefaultStages()
{
    auto gate = [](double at, double x, GateOperation op, int v, double motion = 0.0)
    { Encounter e; e.at = at; e.lane = x; e.operation = op; e.value = v; e.motion = motion; return e; };
    auto wave = [](double at, double x, double hp, double threat)
    { Encounter e; e.kind = EventKind::Wave; e.at = at; e.lane = x; e.health = hp; e.threat = threat; return e; };
    auto obstacle = [](double at, double x, int loss)
    { Encounter e; e.kind = EventKind::Obstacle; e.at = at; e.lane = x; e.value = loss; e.width = 0.3; return e; };
    using G = GateOperation;
    std::vector<Stage> out;
    out.push_back({"causeway", "Relic Causeway", 55, 0, false, false, 40,
        {gate(4, 0, G::Recruit, 10), gate(12, -0.5, G::Multiply, 2), gate(12, 0.5, G::Recruit, 8),
         wave(21, 0, 10, 0.5), gate(29, 0, G::Recruit, 12), wave(39, 0, 18, 0.7), gate(47, 0, G::Energy, 40)}});
    out.push_back({"foundry", "Foundry Approach", 65, 0, false, false, 60,
        {gate(4, 0, G::Recruit, 15), obstacle(12, -0.6, 6), gate(15, 0.5, G::Multiply, 2),
         wave(25, 0, 22, 1), gate(34, -0.4, G::Recruit, 18), obstacle(39, 0.6, 8),
         gate(43, 0, G::Energy, 60), wave(51, 0, 35, 1.4)}});
    out.push_back({"gatehouse", "Gatehouse Siege", 45, 70, false, false, 90,
        {gate(3, 0, G::Recruit, 20), gate(10, 0, G::Multiply, 2), wave(20, 0, 20, 1),
         gate(28, 0, G::Recruit, 20), gate(36, 0, G::Energy, 50)}});
    out.push_back({"storm", "Storm Pass", 50, 100, true, false, 120,
        {gate(3, 0, G::Recruit, 24), gate(12, 0, G::Multiply, 2, 0.45), wave(23, 0, 30, 1.2),
         obstacle(28, -0.6, 10), gate(34, 0, G::Energy, 80), gate(41, 0, G::Recruit, 25, 0.3)}});
    out.push_back({"forge", "Forge Core", 50, 140, true, true, 160,
        {gate(3, 0, G::Recruit, 30), gate(12, 0, G::Multiply, 2), wave(23, 0, 40, 1.5),
         gate(30, 0, G::Energy, 100), gate(37, 0, G::Recruit, 30), wave(44, 0, 25, 1)}});
    return out;
}
}
