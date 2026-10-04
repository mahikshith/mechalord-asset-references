#include "MechalordGameMode.h"
#include "MechalordArena.h"
#include "MechalordCommanderPawn.h"
#include "MechalordPlayerController.h"
#include "MechalordStageDefinition.h"
#include "MechalordProgressionSubsystem.h"
#include "MechalordChapterSubsystem.h"
#include "Kismet/GameplayStatics.h"
#include "Misc/CoreDelegates.h"
#include "Engine/GameInstance.h"
#include "Engine/World.h"

AMechalordGameMode::AMechalordGameMode()
{
    PrimaryActorTick.bCanEverTick=true;
    DefaultPawnClass=AMechalordCommanderPawn::StaticClass();
    PlayerControllerClass=AMechalordPlayerController::StaticClass();
    ArenaClass=AMechalordArena::StaticClass();
    Stages=mech::DefaultStages();
    for(const TCHAR* Name:{TEXT("RelicCauseway"),TEXT("FoundryApproach"),TEXT("GatehouseSiege")})
        StageAssets.Emplace(FSoftObjectPath(FString::Printf(TEXT("/Game/Mechalord/Stages/DA_%s.DA_%s"),Name,Name)));
    for(const TCHAR* Name:{TEXT("StormPass"),TEXT("ForgeCore")})
        StageAssets.Emplace(FSoftObjectPath(FString::Printf(TEXT("/Game/Mechalord/Chapters/ForgeChapter/Stages/DA_%s.DA_%s"),Name,Name)));
}
void AMechalordGameMode::BeginPlay()
{
    Super::BeginPlay();
    Arena=GetWorld()->SpawnActor<AMechalordArena>(ArenaClass);
    if(Arena) { Arena->Assemble(Stages[0],nullptr); Arena->Present(Battle); }
    BackgroundHandle=FCoreDelegates::ApplicationWillEnterBackgroundDelegate.AddUObject(this,&AMechalordGameMode::PauseForApplicationSuspend);
    DeactivateHandle=FCoreDelegates::ApplicationWillDeactivateDelegate.AddUObject(this,&AMechalordGameMode::PauseForApplicationSuspend);
}
void AMechalordGameMode::EndPlay(const EEndPlayReason::Type Reason)
{
    FCoreDelegates::ApplicationWillEnterBackgroundDelegate.Remove(BackgroundHandle);
    FCoreDelegates::ApplicationWillDeactivateDelegate.Remove(DeactivateHandle);
    Super::EndPlay(Reason);
}
bool AMechalordGameMode::StartStage(int32 Index,EMechalordRelic Relic)
{
    if(Index<0 || Index>=GetStageCount()) return false;
    auto* Progression=GetGameInstance()->GetSubsystem<UMechalordProgressionSubsystem>();
    auto* Chapter=GetGameInstance()->GetSubsystem<UMechalordChapterSubsystem>();
    if(!Progression || !Progression->IsStageUnlocked(Index) || !Progression->IsRelicUnlocked(Relic)) return false;
    if(Stages[Index].optional && (!Chapter || !Chapter->IsChapterInstalled())) return false;
    ActiveStageAsset=StageAssets.IsValidIndex(Index) ? StageAssets[Index].LoadSynchronous() : nullptr;
    if(Stages[Index].optional && !ActiveStageAsset) return false;
    CurrentStageIndex=Index;
    const mech::Stage Stage=ActiveStageAsset ? ActiveStageAsset->ToSimulationStage() : Stages[Index];
    // Chapter classification is anchored in the shipped catalogue so editable
    // data cannot accidentally turn optional content into an unlocked stage.
    Battle.Start(Stage,static_cast<mech::Relic>(Relic),Progression->GetTroopUpgrade(),Progression->GetAttackUpgrade());
    bResultRecorded=false;
    if(Arena) Arena->Assemble(Stage,ActiveStageAsset);
    SetSteering(0);
    return true;
}
bool AMechalordGameMode::RetryStage() { return StartStage(CurrentStageIndex,static_cast<EMechalordRelic>(Battle.relic)); }
void AMechalordGameMode::ShowMenu()
{
    Battle.phase=mech::Phase::Menu; Battle.paused=false; Battle.abilityLeft=0; Battle.enemies.clear(); Battle.packets.clear();
    if(Arena) Arena->Present(Battle);
    LastPresentedPhase=Battle.phase;
}
bool AMechalordGameMode::ActivateRelic() { return Battle.ActivateRelic(); }
bool AMechalordGameMode::DeployChampion() { return Battle.DeployChampion(); }
void AMechalordGameMode::SetGamePaused(bool bPaused)
{
    if(Battle.phase==mech::Phase::Run || Battle.phase==mech::Phase::Siege) Battle.paused=bPaused;
}
void AMechalordGameMode::PauseForApplicationSuspend() { SetGamePaused(true); }
void AMechalordGameMode::SetSteering(float Lane)
{
    if(Battle.paused) return;
    const float Value=FMath::Clamp(Lane,-1.f,1.f);
    if(Battle.phase==mech::Phase::Siege) Battle.aim=Value;
    else Battle.lane=Value;
}
float AMechalordGameMode::GetSteering() const { return float(Battle.phase==mech::Phase::Siege ? Battle.aim : Battle.lane); }
FString AMechalordGameMode::GetStageName(int32 Index) const { return Index>=0 && Index<GetStageCount() ? UTF8_TO_TCHAR(Stages[Index].name.c_str()) : FString(); }
FMechalordBattleSnapshot AMechalordGameMode::GetBattleSnapshot() const
{
    FMechalordBattleSnapshot S;
    S.Phase=static_cast<EMechalordPhase>(Battle.phase); S.Relic=static_cast<EMechalordRelic>(Battle.relic);
    S.StageIndex=CurrentStageIndex; S.StageName=GetStageName(CurrentStageIndex);
    S.Army=Battle.army; S.Reserve=Battle.reserve; S.Kills=Battle.kills;
    S.VisibleUnits=Arena ? Arena->GetVisibleUnitCount() : 0;
    S.Energy=float(Battle.energy); S.Champion=float(Battle.champion); S.Progress=float(Battle.RunProgress());
    S.CoreHealth=float(Battle.coreHealth); S.CoreMaxHealth=float(Battle.stage.siegeHealth); S.BaseHealth=float(Battle.baseHealth);
    S.AbilitySeconds=float(Battle.abilityLeft); S.ElapsedSeconds=float(Battle.elapsed);
    S.bPaused=Battle.paused; S.bBossWarning=Battle.warning>0;
    return S;
}
void AMechalordGameMode::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);
    Battle.Advance(DeltaSeconds);
    if(Arena && Battle.phase==mech::Phase::Run) Battle.lane=FMath::Clamp(float(Battle.lane),-Arena->GetLaneLimit(Battle.elapsed),Arena->GetLaneLimit(Battle.elapsed));
    if(Arena && ((!Battle.paused && (Battle.phase==mech::Phase::Run || Battle.phase==mech::Phase::Siege)) || LastPresentedPhase!=Battle.phase)) Arena->Present(Battle);
    LastPresentedPhase=Battle.phase;
    if(auto* Commander=Cast<AMechalordCommanderPawn>(UGameplayStatics::GetPlayerPawn(this,0)))
    {
        Commander->SetLane(GetSteering()); Commander->SetSiegePose(Battle.phase==mech::Phase::Siege);
        Commander->SetRunning(Battle.phase==mech::Phase::Run && !Battle.paused);
        Commander->SetAbilityActive(Battle.abilityLeft>0);
    }
    if(!bResultRecorded && (Battle.phase==mech::Phase::Won || Battle.phase==mech::Phase::Lost))
    {
        bResultRecorded=true;
        const bool bWon=Battle.phase==mech::Phase::Won;
        const int32 Reward=bWon ? Battle.stage.reward : 0;
        if(auto* Progression=GetGameInstance()->GetSubsystem<UMechalordProgressionSubsystem>())
            Progression->RecordStageResult(CurrentStageIndex,bWon,Reward);
        OnStageFinished.Broadcast(CurrentStageIndex,bWon,Reward);
    }
}
