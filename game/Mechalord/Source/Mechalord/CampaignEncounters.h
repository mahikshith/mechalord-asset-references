#pragma once
#include <array>

// Authored traversal-time records. Runtime owns actual spawning, collision,
// attack admission and rewards; these tables introduce no separate authority.
namespace mech::campaign
{
enum class Kind { Wave,Gunner,Battery,Carrier,Crate,Gate,Roller,Archetype,Health };
struct Event
{
 double at=0;Kind kind=Kind::Wave;double x=0,hp=0;
 int value=0,variant=0,dropPower=0;double delay=0,motion=0;
};
struct EventList {const Event* data=nullptr;int count=0;};
// Wave:value=rows,variant=formation. Crate:value=XP. Gate:value=recruit
// (other lane value+4). Roller:value=loss,motion=lateral amplitude.
// Carrier:dropPower=primary pickup;value=explicit alternate pickup, or0 for
// the runtime's default. Power8 Tempest,9 Arc Storm,10 Salvo; power4 Freeze.
inline constexpr std::array<Event,22> StormPass{{
 {1,Kind::Wave,0,10,1,1},
 {4,Kind::Crate,-1.8,30,45},
 {8,Kind::Gate,-1.8,0,8},
 {13,Kind::Gunner,2.6,52},
 {16,Kind::Gunner,-2.6,60,0,0,0,3.2},
 {19,Kind::Carrier,-1.8,90,4,0,9},
 {23,Kind::Wave,0,12,2,2},
 {28,Kind::Roller,-1.3,0,16,0,0,0,1.10},
 // Recovery: no new spawn commitment for eleven traversal seconds.
 {39,Kind::Crate,1.8,60,65},
 {42,Kind::Gate,1.8,0,10},
 {47,Kind::Battery,-2.6,95,0,0,0,1.8},
 {51,Kind::Wave,0,14,2,1},
 {55,Kind::Roller,1.8,0,18,0,0,0,.70},
 {59,Kind::Carrier,1.8,120,4,0,9},
 // Second recovery separates roller/crossfire from the final pressure cluster.
 {66,Kind::Gunner,2.6,78},
 {70,Kind::Wave,0,16,2,0},
 {73,Kind::Gunner,-2.6,88,0,0,0,3.4},
 {75,Kind::Gate,-1.8,0,8},
 {77,Kind::Crate,0,90,90},
 {79,Kind::Roller,-1.8,0,16,0,0,0,.55},
 {81,Kind::Wave,0,14,1,2},
 {83,Kind::Carrier,1.8,110,4,0,9},
}};
inline constexpr std::array<Event,23> ForgeCore{{
 {1,Kind::Crate,1.8,35,45},
 {5,Kind::Wave,0,12,1,2},
 {10,Kind::Gate,1.8,0,10},
 {15,Kind::Battery,-2.6,85},
 {19,Kind::Battery,2.6,90,0,0,0,3.2},
 {23,Kind::Carrier,-1.8,110,10,0,8},
 {27,Kind::Wave,0,14,2,0},
 {31,Kind::Crate,1.8,70,75},
 {34,Kind::Roller,0,0,20,0,0,0,.25},
 // The first breach can finish before the next battery enters the approach.
 {45,Kind::Gate,-1.8,0,12},
 {49,Kind::Battery,2.6,115,0,0,0,1.8},
 {53,Kind::Wave,0,16,2,1},
 {57,Kind::Carrier,1.8,140,10,0,8},
 {61,Kind::Crate,-1.8,95,90},
 {65,Kind::Roller,-1.8,0,22,0,0,0,.45},
 // Seven-second regroup before the final sequential fortification.
 {72,Kind::Battery,-2.6,125},
 {76,Kind::Wave,0,18,2,2},
 {80,Kind::Carrier,1.8,150,10,0,8},
 {83,Kind::Gate,1.8,0,10},
 {85,Kind::Battery,2.6,135,0,0,0,3.8},
 {87,Kind::Crate,0,110,100},
 {88,Kind::Wave,0,16,1,0},
 {89,Kind::Carrier,-1.8,130,10,0,8},
}};
inline constexpr double Duration(int level){return level==3?96:level==4?102:0;}
inline constexpr EventList Events(int level){return level==3?EventList{StormPass.data(),int(StormPass.size())}:level==4?EventList{ForgeCore.data(),int(ForgeCore.size())}:EventList{};}
inline constexpr double MarchDuration=198;
inline constexpr std::array<double,4> ZoneBounds{{0,62,128,MarchDuration}};
// One route and one spawn ledger. These are three different encounter rhythms,
// not standalone chapters joined by boss/reward resets. Times are global travel.
// Top Lords pass: one wave every few seconds so there is never a quiet screen,
// a different wave shape each time (dropPower = shape id),
// trap gates (variant 1: one side costs troops) from the second zone on, and
// recovery only by earning it. Gate:variant1 => other lane loses value troops.
inline constexpr std::array<Event,64> IronMarch{{
 // Foundry: recruit fast, then immediate contact.
 {0,Kind::Gate,-1.8,0,6}, {2,Kind::Wave,0,9,2,1,1},
 {5,Kind::Crate,-1.8,36,45}, {7,Kind::Wave,0,9,2,2,3}, {10,Kind::Roller,1.5,0,10,0,0,0,1.05},
 {13,Kind::Archetype,-1.8,84,0,1}, {15,Kind::Wave,0,10,2,0,2}, {17,Kind::Gate,1.8,0,6},
 {19,Kind::Wave,0,10,2,2,4}, {21,Kind::Gunner,2.6,70,0,0,0,1.4}, {24,Kind::Carrier,-1.8,96,4,0,2},
 {26,Kind::Wave,0,11,2,1,5}, {28,Kind::Roller,-1.3,0,12,0,0,0,1.6}, {32,Kind::Wave,0,11,3,2,0},
 {36,Kind::Crate,1.8,66,55}, {39,Kind::Archetype,1.8,90,0,2}, {42,Kind::Wave,0,12,2,0,3},
 {44,Kind::Health,-1.8}, {47,Kind::Gate,1.8,0,8,1},
 {50,Kind::Roller,0,0,12,0,0,0,2.15}, {52,Kind::Wave,0,12,2,1,1}, {54,Kind::Carrier,-1.8,114,4,0,1},
 {58,Kind::Wave,0,12,3,1,4},
 // Storm: staggered crossfire, repair escorts and airborne mortar pressure.
 {62,Kind::Archetype,-2.1,120,0,4}, {64,Kind::Wave,0,13,2,2,2}, {66,Kind::Gunner,2.6,94,0,0,0,2.4},
 {70,Kind::Crate,0,90,70}, {73,Kind::Gate,-1.8,0,10,1},
 {76,Kind::Archetype,2.1,138,0,3}, {78,Kind::Wave,0,13,2,0,5}, {80,Kind::Carrier,-1.8,144,4,0,9},
 {82,Kind::Wave,0,14,2,1,3}, {84,Kind::Health,1.8}, {87,Kind::Gunner,-2.6,102},
 {90,Kind::Gunner,2.6,114,0,0,0,3.3}, {92,Kind::Wave,0,14,2,2,1}, {94,Kind::Wave,0,15,3,0,2},
 {97,Kind::Archetype,1.8,106,0,2}, {101,Kind::Gate,1.8,0,10,1},
 {105,Kind::Archetype,-2.1,156,0,4}, {109,Kind::Crate,-1.8,108,75},
 {113,Kind::Health,0}, {116,Kind::Archetype,2.1,162,0,3},
 {120,Kind::Carrier,-1.8,174,10,0,8}, {124,Kind::Wave,0,16,3,2,4},
 // Siege: fortified batteries, shield/support pairs, then earned recovery.
 {128,Kind::Battery,2.6,156,0,0,0,1.4}, {132,Kind::Archetype,-1.8,198,0,1}, {134,Kind::Wave,0,16,2,0,0},
 {136,Kind::Crate,1.8,120,85}, {139,Kind::Gate,1.8,0,14,1},
 {143,Kind::Wave,0,17,3,1,5}, {147,Kind::Carrier,-1.8,192,7,0,10}, {149,Kind::Wave,0,17,2,2,1},
 {151,Kind::Roller,1.8,0,16,0,0,0,.8}, {155,Kind::Archetype,2.1,192,0,4},
 {159,Kind::Archetype,-2.1,174,0,3}, {163,Kind::Gate,1.8,0,16,1},
 {166,Kind::Carrier,-1.8,204,10,0,8}, {169,Kind::Health,1.8}, {171,Kind::Wave,0,18,2,0,3},
 {173,Kind::Crate,0,126,100}, {176,Kind::Wave,0,18,3,1,4},
 {180,Kind::Gate,-1.8,0,18}, {184,Kind::Health,0},
}};
static_assert(IronMarch.size()<=64,"Single-route spawn ledger has sixty-four bits");
static_assert(IronMarch.back().at<=MarchDuration-13,"Last supplies reach the commander before the one final boss");
static_assert(StormPass.size()<32&&ForgeCore.size()<32,"Keep authored chapter spawn bits bounded");
static_assert(StormPass.back().at<=96-13&&ForgeCore.back().at<=102-13,"Preserve full horizon lead-in before the boss");
}
