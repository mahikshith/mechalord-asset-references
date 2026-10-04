#include "MechalordProgressionSubsystem.h"
#include "MechalordSaveGame.h"
#include "Kismet/GameplayStatics.h"
const FString UMechalordProgressionSubsystem::Slot = TEXT("MechalordProgress_v1");
void UMechalordProgressionSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    if (UGameplayStatics::DoesSaveGameExist(Slot, 0))
        Data = Cast<UMechalordSaveGame>(UGameplayStatics::LoadGameFromSlot(Slot, 0));
    if (!Data || Data->SchemaVersion != 1)
    {
        if (UGameplayStatics::DoesSaveGameExist(Slot, 0)) SaveError = TEXT("Save could not be read. This session starts with fresh progress.");
        Data = Cast<UMechalordSaveGame>(UGameplayStatics::CreateSaveGameObject(UMechalordSaveGame::StaticClass()));
    }
    Data->Coins = FMath::Clamp(Data->Coins, 0, 1000000);
    Data->TroopUpgrade = FMath::Clamp(Data->TroopUpgrade, 0, 5);
    Data->AttackUpgrade = FMath::Clamp(Data->AttackUpgrade, 0, 5);
    Data->CompletedStages.RemoveAll([](int32 Index) { return Index < 0 || Index > 4; });
    if (Data->EquippedRelic < 0 || Data->EquippedRelic > 2 || !IsRelicUnlocked(GetEquippedRelic())) Data->EquippedRelic = 0;
}
int32 UMechalordProgressionSubsystem::GetCoins() const { return Data ? Data->Coins : 0; }
int32 UMechalordProgressionSubsystem::GetTroopUpgrade() const { return Data ? Data->TroopUpgrade : 0; }
int32 UMechalordProgressionSubsystem::GetAttackUpgrade() const { return Data ? Data->AttackUpgrade : 0; }
EMechalordRelic UMechalordProgressionSubsystem::GetEquippedRelic() const { return static_cast<EMechalordRelic>(Data ? Data->EquippedRelic : 0); }
bool UMechalordProgressionSubsystem::IsStageCompleted(int32 Index) const { return Data && Data->CompletedStages.Contains(Index); }
bool UMechalordProgressionSubsystem::IsStageUnlocked(int32 Index) const { return Index >= 0 && Index < 5 && (Index == 0 || IsStageCompleted(Index - 1)); }
bool UMechalordProgressionSubsystem::IsRelicUnlocked(EMechalordRelic Relic) const
{
    const int32 Value = static_cast<int32>(Relic);
    return Value == 0 || (Value == 1 && IsStageCompleted(1)) || (Value == 2 && IsStageCompleted(2));
}
bool UMechalordProgressionSubsystem::Persist()
{
    if (UGameplayStatics::SaveGameToSlot(Data, Slot, 0)) { SaveError.Reset(); OnProgressChanged.Broadcast(); return true; }
    SaveError = TEXT("Progress could not be saved. Check available device storage.");
    return false;
}
bool UMechalordProgressionSubsystem::EquipRelic(EMechalordRelic Relic)
{
    if (!IsRelicUnlocked(Relic)) return false;
    const int32 Previous = Data->EquippedRelic;
    Data->EquippedRelic = static_cast<int32>(Relic);
    if (Persist()) return true;
    Data->EquippedRelic = Previous; return false;
}
int32 UMechalordProgressionSubsystem::GetUpgradeCost(bool bAttack) const
{
    const int32 Level = bAttack ? GetAttackUpgrade() : GetTroopUpgrade();
    return Level >= 5 ? 0 : 40 + Level * 30;
}
bool UMechalordProgressionSubsystem::BuyUpgrade(bool bAttack)
{
    const int32 Cost = GetUpgradeCost(bAttack);
    if (Cost <= 0 || GetCoins() < Cost) return false;
    int32& Level = bAttack ? Data->AttackUpgrade : Data->TroopUpgrade;
    Data->Coins -= Cost; ++Level;
    if (Persist()) return true;
    Data->Coins += Cost; --Level; return false;
}
bool UMechalordProgressionSubsystem::RecordStageResult(int32 Index, bool bWon, int32 Reward)
{
    if (!bWon || !IsStageUnlocked(Index)) return false;
    const int32 CoinsBefore = Data->Coins;
    const bool bAlreadyCompleted = IsStageCompleted(Index);
    Data->CompletedStages.AddUnique(Index);
    Data->Coins = FMath::Clamp(Data->Coins + FMath::Clamp(Reward, 0, 1000), 0, 1000000);
    if (Persist()) return true;
    Data->Coins = CoinsBefore;
    if (!bAlreadyCompleted) Data->CompletedStages.Remove(Index);
    return false;
}
