#pragma once
#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "MechalordTypes.h"
#include "MechalordProgressionSubsystem.generated.h"
class UMechalordSaveGame;
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FMechalordProgressChanged);

UCLASS()
class MECHALORD_API UMechalordProgressionSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()
public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    UPROPERTY(BlueprintAssignable) FMechalordProgressChanged OnProgressChanged;
    UPROPERTY(BlueprintReadOnly) FString SaveError;
    UFUNCTION(BlueprintPure) int32 GetCoins() const;
    UFUNCTION(BlueprintPure) int32 GetTroopUpgrade() const;
    UFUNCTION(BlueprintPure) int32 GetAttackUpgrade() const;
    UFUNCTION(BlueprintPure) EMechalordRelic GetEquippedRelic() const;
    UFUNCTION(BlueprintPure) bool IsStageUnlocked(int32 StageIndex) const;
    UFUNCTION(BlueprintPure) bool IsStageCompleted(int32 StageIndex) const;
    UFUNCTION(BlueprintPure) bool IsRelicUnlocked(EMechalordRelic Relic) const;
    UFUNCTION(BlueprintCallable) bool EquipRelic(EMechalordRelic Relic);
    UFUNCTION(BlueprintPure) int32 GetUpgradeCost(bool bAttack) const;
    UFUNCTION(BlueprintCallable) bool BuyUpgrade(bool bAttack);
    // Caller guards this once per run; replay wins still earn coins.
    UFUNCTION(BlueprintCallable) bool RecordStageResult(int32 StageIndex, bool bWon, int32 Reward);
private:
    UPROPERTY() TObjectPtr<UMechalordSaveGame> Data;
    bool Persist();
    static const FString Slot;
};
