#pragma once
#include "CoreMinimal.h"
#include "MechalordTypes.generated.h"

UENUM(BlueprintType)
enum class EMechalordRelic : uint8 { Shield, EMP, Overdrive };
UENUM(BlueprintType)
enum class EMechalordPhase : uint8 { Menu, Run, Siege, Won, Lost };
UENUM(BlueprintType)
enum class EMechalordEncounterKind : uint8 { Gate, Wave, Obstacle };
UENUM(BlueprintType)
enum class EMechalordGateOperation : uint8 { Recruit, Multiply, Energy };

USTRUCT(BlueprintType)
struct FMechalordBattleSnapshot
{
    GENERATED_BODY()
    UPROPERTY(BlueprintReadOnly) EMechalordPhase Phase = EMechalordPhase::Menu;
    UPROPERTY(BlueprintReadOnly) EMechalordRelic Relic = EMechalordRelic::Shield;
    UPROPERTY(BlueprintReadOnly) int32 StageIndex = 0;
    UPROPERTY(BlueprintReadOnly) FString StageName;
    UPROPERTY(BlueprintReadOnly) int32 Army = 0;
    UPROPERTY(BlueprintReadOnly) int32 Reserve = 0;
    UPROPERTY(BlueprintReadOnly) int32 Kills = 0;
    UPROPERTY(BlueprintReadOnly) int32 VisibleUnits = 0;
    UPROPERTY(BlueprintReadOnly) float Energy = 0;
    UPROPERTY(BlueprintReadOnly) float Champion = 0;
    UPROPERTY(BlueprintReadOnly) float Progress = 0;
    UPROPERTY(BlueprintReadOnly) float CoreHealth = 0;
    UPROPERTY(BlueprintReadOnly) float CoreMaxHealth = 0;
    UPROPERTY(BlueprintReadOnly) float BaseHealth = 100;
    UPROPERTY(BlueprintReadOnly) float AbilitySeconds = 0;
    UPROPERTY(BlueprintReadOnly) float ElapsedSeconds = 0;
    UPROPERTY(BlueprintReadOnly) bool bPaused = false;
    UPROPERTY(BlueprintReadOnly) bool bBossWarning = false;
};

USTRUCT(BlueprintType)
struct FMechalordEncounterDefinition
{
    GENERATED_BODY()
    UPROPERTY(EditAnywhere, BlueprintReadWrite) EMechalordEncounterKind Kind = EMechalordEncounterKind::Gate;
    UPROPERTY(EditAnywhere, BlueprintReadWrite, meta=(ClampMin="0")) float AtSeconds = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite, meta=(ClampMin="-1", ClampMax="1")) float Lane = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite, meta=(ClampMin="0.01", ClampMax="1")) float Width = 0.32f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) EMechalordGateOperation Operation = EMechalordGateOperation::Recruit;
    UPROPERTY(EditAnywhere, BlueprintReadWrite, meta=(ClampMin="0", ClampMax="500")) int32 Value = 10;
    UPROPERTY(EditAnywhere, BlueprintReadWrite, meta=(ClampMin="1")) float Health = 10;
    UPROPERTY(EditAnywhere, BlueprintReadWrite, meta=(ClampMin="0")) float Threat = 0.5f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite, meta=(ClampMin="0", ClampMax="1")) float Motion = 0;
};
