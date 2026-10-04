#pragma once
#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "MechalordTypes.h"
#include "BattleSimulation.h"
#include "MechalordStageDefinition.generated.h"

class UStaticMesh;

USTRUCT(BlueprintType)
struct FMechalordDressingDefinition
{
    GENERATED_BODY()
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TSoftObjectPtr<UStaticMesh> Mesh;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FVector PositionCentimetres = FVector::ZeroVector;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bSiegeOnly = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bNarrowRoute = false;
};

// Logical timelines remain small. Optional art is held through soft references
// and loaded only when its installed chapter is entered.
UCLASS(BlueprintType)
class MECHALORD_API UMechalordStageDefinition : public UPrimaryDataAsset
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere, BlueprintReadOnly) FName StageId;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) FText DisplayName;
    UPROPERTY(EditAnywhere, BlueprintReadOnly, meta=(ClampMin="1")) float RunSeconds = 55;
    UPROPERTY(EditAnywhere, BlueprintReadOnly, meta=(ClampMin="0")) float SiegeHealth = 0;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) bool bOptionalChapter = false;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) bool bBoss = false;
    UPROPERTY(EditAnywhere, BlueprintReadOnly, meta=(ClampMin="0")) int32 Reward = 40;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) TArray<FMechalordEncounterDefinition> Encounters;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) TArray<FMechalordDressingDefinition> Dressing;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) TSoftObjectPtr<UStaticMesh> TrackMesh;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) TSoftObjectPtr<UStaticMesh> BarrierMesh;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) TSoftObjectPtr<UStaticMesh> CoreMesh;
    UPROPERTY(EditAnywhere, BlueprintReadOnly) FLinearColor EnvironmentTint = FLinearColor(0.14f, 0.18f, 0.2f);

    mech::Stage ToSimulationStage() const;
};
