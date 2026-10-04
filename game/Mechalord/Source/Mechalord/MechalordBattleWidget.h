#pragma once
#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "MechalordBattleWidget.generated.h"
class UButton;
class UTextBlock;
class UProgressBar;
class UBorder;
class UVerticalBox;
UCLASS()
class MECHALORD_API UMechalordBattleWidget : public UUserWidget
{
    GENERATED_BODY()
protected:
    virtual TSharedRef<SWidget> RebuildWidget() override;
    virtual void NativeTick(const FGeometry& Geometry, float DeltaSeconds) override;
private:
    UPROPERTY() TObjectPtr<UTextBlock> Header;
    UPROPERTY() TObjectPtr<UTextBlock> BattleStatus;
    UPROPERTY() TObjectPtr<UTextBlock> MenuTitle;
    UPROPERTY() TObjectPtr<UTextBlock> CoinStatus;
    UPROPERTY() TObjectPtr<UTextBlock> Feedback;
    UPROPERTY() TObjectPtr<UTextBlock> ChapterText;
    UPROPERTY() TObjectPtr<UTextBlock> TroopText;
    UPROPERTY() TObjectPtr<UTextBlock> AttackText;
    UPROPERTY() TObjectPtr<UTextBlock> AbilityText;
    UPROPERTY() TObjectPtr<UTextBlock> PauseText;
    UPROPERTY() TObjectPtr<UProgressBar> RunBar;
    UPROPERTY() TObjectPtr<UProgressBar> ChapterBar;
    UPROPERTY() TObjectPtr<UBorder> MenuPanel;
    UPROPERTY() TObjectPtr<UButton> AbilityButton;
    UPROPERTY() TObjectPtr<UButton> ChampionButton;
    UPROPERTY() TObjectPtr<UButton> RetryButton;
    UPROPERTY() TObjectPtr<UButton> CancelButton;
    UPROPERTY() TArray<TObjectPtr<UButton>> StageButtons;
    UPROPERTY() TArray<TObjectPtr<UTextBlock>> StageLabels;
    UPROPERTY() TArray<TObjectPtr<UButton>> RelicButtons;
    UPROPERTY() TArray<TObjectPtr<UTextBlock>> RelicLabels;
    float RefreshClock = 0;
    UTextBlock* Text(const FString& Value, int32 Size = 18);
    UButton* Button(const FString& Label, UTextBlock*& OutLabel);
    UButton* Button(const FString& Label, TObjectPtr<UTextBlock>& OutLabel);
    void ChooseStage(int32 Stage);
    void ChooseRelic(int32 Relic);
    UFUNCTION() void Stage0(); UFUNCTION() void Stage1(); UFUNCTION() void Stage2(); UFUNCTION() void Stage3(); UFUNCTION() void Stage4();
    UFUNCTION() void Shield(); UFUNCTION() void EMP(); UFUNCTION() void Overdrive();
    UFUNCTION() void Troops(); UFUNCTION() void Attack();
    UFUNCTION() void Ability(); UFUNCTION() void Champion(); UFUNCTION() void Pause(); UFUNCTION() void Retry(); UFUNCTION() void Menu();
    UFUNCTION() void Chapter(); UFUNCTION() void Cancel();
};
