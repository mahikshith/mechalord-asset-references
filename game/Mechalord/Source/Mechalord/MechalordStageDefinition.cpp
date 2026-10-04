#include "MechalordStageDefinition.h"

mech::Stage UMechalordStageDefinition::ToSimulationStage() const
{
    mech::Stage Result;
    Result.id = TCHAR_TO_UTF8(*StageId.ToString());
    Result.name = TCHAR_TO_UTF8(*DisplayName.ToString());
    Result.runSeconds = FMath::Max(1.f, RunSeconds);
    Result.siegeHealth = FMath::Max(0.f, SiegeHealth);
    Result.optional = bOptionalChapter;
    Result.boss = bBoss;
    Result.reward = FMath::Max(0, Reward);
    for (const auto& Definition : Encounters)
    {
        mech::Encounter Event;
        Event.kind = static_cast<mech::EventKind>(Definition.Kind);
        Event.at = FMath::Clamp(Definition.AtSeconds, 0.f, FMath::Max(1.f, RunSeconds));
        Event.lane = FMath::Clamp(Definition.Lane, -1.f, 1.f);
        Event.width = FMath::Clamp(Definition.Width, 0.01f, 1.f);
        Event.operation = static_cast<mech::GateOperation>(Definition.Operation);
        Event.value = FMath::Clamp(Definition.Value, 0, 500);
        Event.health = FMath::Max(1.f, Definition.Health);
        Event.threat = FMath::Max(0.f, Definition.Threat);
        Event.motion = FMath::Clamp(Definition.Motion, 0.f, 1.f);
        Result.encounters.push_back(Event);
    }
    std::stable_sort(Result.encounters.begin(), Result.encounters.end(),
        [](const mech::Encounter& A, const mech::Encounter& B) { return A.at < B.at; });
    return Result;
}
