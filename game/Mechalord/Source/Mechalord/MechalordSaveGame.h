#pragma once
#include "CoreMinimal.h"
#include "GameFramework/SaveGame.h"
#include "MechalordSaveGame.generated.h"

UCLASS()
class MECHALORD_API UMechalordSaveGame : public USaveGame
{
    GENERATED_BODY()
public:
    UPROPERTY(SaveGame) int32 SchemaVersion = 1;
    UPROPERTY(SaveGame) int32 Coins = 0;
    UPROPERTY(SaveGame) int32 TroopUpgrade = 0;
    UPROPERTY(SaveGame) int32 AttackUpgrade = 0;
    UPROPERTY(SaveGame) int32 EquippedRelic = 0;
    UPROPERTY(SaveGame) TArray<int32> CompletedStages;
};
