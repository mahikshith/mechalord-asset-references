#pragma once
#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "MechalordTypes.h"
#include "BattleSimulation.h"
#include "MechalordGameMode.generated.h"

class AMechalordArena;
class UMechalordStageDefinition;
DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FMechalordStageFinished,int32,StageIndex,bool,bWon,int32,Reward);

UCLASS()
class MECHALORD_API AMechalordGameMode : public AGameModeBase
{
    GENERATED_BODY()
public:
    AMechalordGameMode();
    virtual void Tick(float DeltaSeconds) override;
    UFUNCTION(BlueprintCallable) bool StartStage(int32 StageIndex, EMechalordRelic Relic);
    UFUNCTION(BlueprintCallable) bool RetryStage();
    UFUNCTION(BlueprintCallable) void ShowMenu();
    UFUNCTION(BlueprintCallable) bool ActivateRelic();
    UFUNCTION(BlueprintCallable) bool DeployChampion();
    UFUNCTION(BlueprintCallable) void SetGamePaused(bool bPaused);
    UFUNCTION(BlueprintCallable) void SetSteering(float NormalizedLane);
    UFUNCTION(BlueprintPure) float GetSteering() const;
    UFUNCTION(BlueprintPure) FMechalordBattleSnapshot GetBattleSnapshot() const;
    UFUNCTION(BlueprintPure) int32 GetStageCount() const { return int32(Stages.size()); }
    UFUNCTION(BlueprintPure) FString GetStageName(int32 StageIndex) const;
    UFUNCTION(BlueprintPure) int32 GetCurrentStageIndex() const { return CurrentStageIndex; }
    UPROPERTY(BlueprintAssignable) FMechalordStageFinished OnStageFinished;
    UPROPERTY(EditDefaultsOnly, Category="Mechalord|Stages") TArray<TSoftObjectPtr<UMechalordStageDefinition>> StageAssets;
    UPROPERTY(EditDefaultsOnly, Category="Mechalord|Art") TSubclassOf<AMechalordArena> ArenaClass;
protected:
    virtual void BeginPlay() override;
    virtual void EndPlay(const EEndPlayReason::Type Reason) override;
private:
    mech::Battle Battle;
    std::vector<mech::Stage> Stages;
    UPROPERTY() AMechalordArena* Arena;
    UPROPERTY() UMechalordStageDefinition* ActiveStageAsset;
    int32 CurrentStageIndex=0;
    bool bResultRecorded=false;
    mech::Phase LastPresentedPhase=mech::Phase::Menu;
    FDelegateHandle BackgroundHandle,DeactivateHandle;
    void PauseForApplicationSuspend();
};
