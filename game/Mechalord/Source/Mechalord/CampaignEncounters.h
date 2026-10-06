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
// Additional encounters use upper spawn bits so existing routes remain intact.
// Type-specific silhouettes are introduced singly before the final combinations.
inline constexpr std::array<Event,7> MarchFirst{{
 {20,Kind::Archetype,1.8,65,0,1}, {33,Kind::Health,-1.8},
 {44,Kind::Archetype,-1.8,55,0,2}, {53,Kind::Health,1.8},
 {62,Kind::Archetype,2.1,85,0,3}, {72,Kind::Health,0},
 {76,Kind::Archetype,-2.1,85,0,4},
}};
inline constexpr std::array<Event,7> MarchStorm{{
 {7,Kind::Archetype,1.8,75,0,2}, {18,Kind::Health,-1.8},
 {32,Kind::Archetype,-2.1,115,0,4}, {44,Kind::Health,1.8},
 {55,Kind::Archetype,2.1,100,0,3}, {67,Kind::Health,0},
 {80,Kind::Archetype,-1.8,125,0,1},
}};
inline constexpr std::array<Event,8> MarchForge{{
 {8,Kind::Archetype,-1.8,135,0,1}, {18,Kind::Health,1.8},
 {32,Kind::Archetype,2.1,115,0,3}, {43,Kind::Health,-1.8},
 {58,Kind::Archetype,-2.1,150,0,4}, {68,Kind::Health,0},
 {74,Kind::Archetype,1.8,110,0,2}, {87,Kind::Health,1.8},
}};
inline constexpr EventList MarchEvents(int act){return act==0?EventList{MarchFirst.data(),int(MarchFirst.size())}:act==1?EventList{MarchStorm.data(),int(MarchStorm.size())}:EventList{MarchForge.data(),int(MarchForge.size())};}
static_assert(StormPass.size()<32&&ForgeCore.size()<32,"Keep authored chapter spawn bits bounded");
static_assert(StormPass.back().at<=96-13&&ForgeCore.back().at<=102-13,"Preserve full horizon lead-in before the boss");
}
