#include "MechalordBattleWidget.h"
#include "MechalordGameMode.h"
#include "MechalordProgressionSubsystem.h"
#include "MechalordChapterSubsystem.h"
#include "Blueprint/WidgetTree.h"
#include "Components/CanvasPanel.h"
#include "Components/CanvasPanelSlot.h"
#include "Components/VerticalBox.h"
#include "Components/VerticalBoxSlot.h"
#include "Components/HorizontalBox.h"
#include "Components/HorizontalBoxSlot.h"
#include "Components/Border.h"
#include "Components/Button.h"
#include "Components/TextBlock.h"
#include "Components/ProgressBar.h"
#include "Components/SafeZone.h"
#include "Components/ScrollBox.h"
#include "Engine/GameInstance.h"
#include "Engine/World.h"
namespace {
AMechalordGameMode* Mode(const UUserWidget* W) { return W->GetWorld()?W->GetWorld()->GetAuthGameMode<AMechalordGameMode>():nullptr; }
UMechalordProgressionSubsystem* Progress(const UUserWidget* W) { return W->GetGameInstance()?W->GetGameInstance()->GetSubsystem<UMechalordProgressionSubsystem>():nullptr; }
UMechalordChapterSubsystem* Pack(const UUserWidget* W) { return W->GetGameInstance()?W->GetGameInstance()->GetSubsystem<UMechalordChapterSubsystem>():nullptr; }
}
UTextBlock* UMechalordBattleWidget::Text(const FString& Value,int32 Size) {
    auto* Label=WidgetTree->ConstructWidget<UTextBlock>(); Label->SetText(FText::FromString(Value));
    auto Font=Label->GetFont(); Font.Size=Size; Label->SetFont(Font);
    Label->SetColorAndOpacity(FSlateColor(FLinearColor(.91f,.86f,.72f,1))); Label->SetAutoWrapText(true); return Label;
}
UButton* UMechalordBattleWidget::Button(const FString& Label,UTextBlock*& OutLabel) {
    auto* Control=WidgetTree->ConstructWidget<UButton>(); Control->SetBackgroundColor(FLinearColor(.025f,.17f,.18f,1));
    OutLabel=Text(Label); OutLabel->SetJustification(ETextJustify::Center); Control->AddChild(OutLabel); return Control;
}
UButton* UMechalordBattleWidget::Button(const FString& Label,TObjectPtr<UTextBlock>& OutLabel) {
    UTextBlock* RawLabel=nullptr;
    UButton* Control=Button(Label,RawLabel);
    OutLabel=RawLabel;
    return Control;
}
TSharedRef<SWidget> UMechalordBattleWidget::RebuildWidget() {
    if(!WidgetTree)WidgetTree=NewObject<UWidgetTree>(this);
    StageButtons.Reset(); StageLabels.Reset(); RelicButtons.Reset(); RelicLabels.Reset();
    auto* Safe=WidgetTree->ConstructWidget<USafeZone>(); Safe->SetVisibility(ESlateVisibility::SelfHitTestInvisible);
    auto* Canvas=WidgetTree->ConstructWidget<UCanvasPanel>(); Canvas->SetVisibility(ESlateVisibility::SelfHitTestInvisible);
    Safe->AddChild(Canvas); WidgetTree->RootWidget=Safe;
    auto Place=[Canvas](UWidget* Child,const FAnchors& Anchors,FVector2D Align,const FMargin& Offset) {
        auto* Slot=Canvas->AddChildToCanvas(Child); Slot->SetAnchors(Anchors); Slot->SetAlignment(Align); Slot->SetOffsets(Offset);
    };
    auto* Top=WidgetTree->ConstructWidget<UVerticalBox>(); Top->SetVisibility(ESlateVisibility::SelfHitTestInvisible);
    Header=Text(TEXT("MECHALORD"),24); BattleStatus=Text(TEXT("Drag to steer. Attacks fire automatically."),16);
    Top->AddChildToVerticalBox(Header); Top->AddChildToVerticalBox(BattleStatus);
    RunBar=WidgetTree->ConstructWidget<UProgressBar>(); RunBar->SetFillColorAndOpacity(FLinearColor(.1f,.8f,.72f)); Top->AddChildToVerticalBox(RunBar)->SetPadding(FMargin(0,6,0,0));
    Place(Top,FAnchors(0,0,1,0),FVector2D::ZeroVector,FMargin(20,12,20,105));
    MenuPanel=WidgetTree->ConstructWidget<UBorder>(); MenuPanel->SetBrushColor(FLinearColor(.025f,.045f,.05f,.97f)); MenuPanel->SetPadding(FMargin(16));
    auto* Scroll=WidgetTree->ConstructWidget<UScrollBox>(); MenuPanel->AddChild(Scroll);
    auto* Stack=WidgetTree->ConstructWidget<UVerticalBox>(); Scroll->AddChild(Stack);
    MenuTitle=Text(TEXT("Choose your battle"),24); CoinStatus=Text(TEXT("")); Stack->AddChildToVerticalBox(MenuTitle); Stack->AddChildToVerticalBox(CoinStatus)->SetPadding(FMargin(0,6,0,8));
    const TCHAR* Names[]={TEXT("Relic Causeway"),TEXT("Foundry Approach"),TEXT("Gatehouse Siege"),TEXT("Storm Pass"),TEXT("Forge Core")};
    for(int32 I=0;I<5;++I) { UTextBlock* Label; auto* Control=Button(Names[I],Label); StageButtons.Add(Control); StageLabels.Add(Label); Stack->AddChildToVerticalBox(Control)->SetPadding(FMargin(0,3)); }
    StageButtons[0]->OnClicked.AddDynamic(this,&UMechalordBattleWidget::Stage0); StageButtons[1]->OnClicked.AddDynamic(this,&UMechalordBattleWidget::Stage1); StageButtons[2]->OnClicked.AddDynamic(this,&UMechalordBattleWidget::Stage2); StageButtons[3]->OnClicked.AddDynamic(this,&UMechalordBattleWidget::Stage3); StageButtons[4]->OnClicked.AddDynamic(this,&UMechalordBattleWidget::Stage4);
    Stack->AddChildToVerticalBox(Text(TEXT("EQUIP ONE RELIC"),14))->SetPadding(FMargin(0,10,0,4));
    auto* Relics=WidgetTree->ConstructWidget<UHorizontalBox>(); Stack->AddChildToVerticalBox(Relics);
    const TCHAR* RelicNames[]={TEXT("Shield"),TEXT("EMP"),TEXT("Overdrive")};
    for(int32 I=0;I<3;++I) { UTextBlock* Label; auto* Control=Button(RelicNames[I],Label); RelicButtons.Add(Control); RelicLabels.Add(Label); auto* Slot=Relics->AddChildToHorizontalBox(Control); Slot->SetSize(FSlateChildSize(ESlateSizeRule::Fill)); Slot->SetPadding(FMargin(2,0)); }
    RelicButtons[0]->OnClicked.AddDynamic(this,&UMechalordBattleWidget::Shield); RelicButtons[1]->OnClicked.AddDynamic(this,&UMechalordBattleWidget::EMP); RelicButtons[2]->OnClicked.AddDynamic(this,&UMechalordBattleWidget::Overdrive);
    auto* T=Button(TEXT("Starting troops"),TroopText); T->OnClicked.AddDynamic(this,&UMechalordBattleWidget::Troops); Stack->AddChildToVerticalBox(T)->SetPadding(FMargin(0,8,0,3));
    auto* A=Button(TEXT("Attack strength"),AttackText); A->OnClicked.AddDynamic(this,&UMechalordBattleWidget::Attack); Stack->AddChildToVerticalBox(A)->SetPadding(FMargin(0,3));
    auto* Download=Button(TEXT("Check Chapter 2 download"),ChapterText); Download->OnClicked.AddDynamic(this,&UMechalordBattleWidget::Chapter); Stack->AddChildToVerticalBox(Download)->SetPadding(FMargin(0,8,0,3));
    ChapterBar=WidgetTree->ConstructWidget<UProgressBar>(); Stack->AddChildToVerticalBox(ChapterBar);
    UTextBlock* Ignore; CancelButton=Button(TEXT("Cancel download"),Ignore); CancelButton->OnClicked.AddDynamic(this,&UMechalordBattleWidget::Cancel); Stack->AddChildToVerticalBox(CancelButton)->SetPadding(FMargin(0,3));
    RetryButton=Button(TEXT("Retry immediately"),Ignore); RetryButton->OnClicked.AddDynamic(this,&UMechalordBattleWidget::Retry); Stack->AddChildToVerticalBox(RetryButton)->SetPadding(FMargin(0,6,0,0));
    Feedback=Text(TEXT("All stages can be beaten without upgrades."),14); Stack->AddChildToVerticalBox(Feedback)->SetPadding(FMargin(0,8,0,0));
    Place(MenuPanel,FAnchors(0,.16f,1,.84f),FVector2D::ZeroVector,FMargin(16,0,16,0));
    auto* Bottom=WidgetTree->ConstructWidget<UHorizontalBox>();
    AbilityButton=Button(TEXT("SHIELD"),AbilityText); AbilityButton->OnClicked.AddDynamic(this,&UMechalordBattleWidget::Ability);
    ChampionButton=Button(TEXT("COMMANDER"),Ignore); ChampionButton->OnClicked.AddDynamic(this,&UMechalordBattleWidget::Champion);
    auto* P=Button(TEXT("PAUSE"),PauseText); P->OnClicked.AddDynamic(this,&UMechalordBattleWidget::Pause);
    auto* M=Button(TEXT("MENU"),Ignore); M->OnClicked.AddDynamic(this,&UMechalordBattleWidget::Menu);
    for(UButton* Control:{AbilityButton.Get(),ChampionButton.Get(),P,M}) { auto* Slot=Bottom->AddChildToHorizontalBox(Control); Slot->SetSize(FSlateChildSize(ESlateSizeRule::Fill)); Slot->SetPadding(FMargin(3,0)); }
    Place(Bottom,FAnchors(0,1,1,1),FVector2D(0,1),FMargin(12,-12,12,64));
    return Super::RebuildWidget();
}
void UMechalordBattleWidget::NativeTick(const FGeometry& Geometry,float DeltaSeconds) {
    Super::NativeTick(Geometry,DeltaSeconds); RefreshClock+=DeltaSeconds; if(RefreshClock<.1f)return; RefreshClock=0;
    auto* Game=Mode(this); auto* Save=Progress(this); if(!Game||!Save||!Header)return;
    const auto State=Game->GetBattleSnapshot(); const bool bActive=State.Phase==EMechalordPhase::Run||State.Phase==EMechalordPhase::Siege;
    const bool bResult=State.Phase==EMechalordPhase::Won||State.Phase==EMechalordPhase::Lost;
    MenuPanel->SetVisibility(!bActive||State.bPaused?ESlateVisibility::Visible:ESlateVisibility::Collapsed);
    Header->SetText(FText::FromString(bActive?State.StageName:TEXT("MECHALORD")));
    BattleStatus->SetText(FText::FromString(FString::Printf(TEXT("%s | Troops %d Reserve %d\nRelic %.0f%% Commander %.0f%%%s"),State.Phase==EMechalordPhase::Siege?TEXT("Drag to aim"):TEXT("Drag to steer"),State.Army,State.Reserve,State.Energy,State.Champion,State.bBossWarning?TEXT(" BOSS ATTACK INCOMING"):TEXT(""))));
    RunBar->SetPercent(State.Phase==EMechalordPhase::Siege&&State.CoreMaxHealth>0?1-State.CoreHealth/State.CoreMaxHealth:State.Progress);
    AbilityButton->SetIsEnabled(bActive&&!State.bPaused&&State.Energy>=100); ChampionButton->SetIsEnabled(State.Phase==EMechalordPhase::Siege&&!State.bPaused&&State.Champion>=100);
    const TCHAR* RelicNames[]={TEXT("SHIELD"),TEXT("EMP"),TEXT("OVERDRIVE")}; AbilityText->SetText(FText::FromString(RelicNames[FMath::Clamp(int32(State.Relic),0,2)]));
    PauseText->SetText(FText::FromString(State.bPaused?TEXT("RESUME"):TEXT("PAUSE")));
    MenuTitle->SetText(FText::FromString(State.bPaused?TEXT("Paused"):State.Phase==EMechalordPhase::Won?TEXT("Victory! Replay or continue"):State.Phase==EMechalordPhase::Lost?TEXT("Defeated. Try again"):TEXT("Choose your battle")));
    RetryButton->SetVisibility(bResult?ESlateVisibility::Visible:ESlateVisibility::Collapsed); CoinStatus->SetText(FText::FromString(FString::Printf(TEXT("%d coins | retries are free"),Save->GetCoins())));
    auto* ChapterPack=Pack(this); const bool bInstalled=ChapterPack&&ChapterPack->IsChapterInstalled();
    for(int32 I=0;I<5;++I) { const bool bUnlocked=Save->IsStageUnlocked(I); StageButtons[I]->SetIsEnabled(bUnlocked&&(I<3||bInstalled)); StageLabels[I]->SetText(FText::FromString(Game->GetStageName(I)+(Save->IsStageCompleted(I)?TEXT(" [cleared]"):!bUnlocked?TEXT(" [finish previous stage]"):I>=3&&!bInstalled?TEXT(" [chapter download]"):TEXT("")))); }
    for(int32 I=0;I<3;++I) { const bool bUnlocked=Save->IsRelicUnlocked(static_cast<EMechalordRelic>(I)); RelicButtons[I]->SetIsEnabled(bUnlocked); RelicLabels[I]->SetText(FText::FromString(FString(RelicNames[I])+(int32(Save->GetEquippedRelic())==I?TEXT(" [equipped]"):!bUnlocked?TEXT(" [locked]"):TEXT("")))); }
    TroopText->SetText(FText::FromString(FString::Printf(TEXT("Starting troops Lv %d | %s"),Save->GetTroopUpgrade(),Save->GetUpgradeCost(false)>0?*FString::Printf(TEXT("%d coins"),Save->GetUpgradeCost(false)):TEXT("MAX"))));
    AttackText->SetText(FText::FromString(FString::Printf(TEXT("Attack Lv %d | %s"),Save->GetAttackUpgrade(),Save->GetUpgradeCost(true)>0?*FString::Printf(TEXT("%d coins"),Save->GetUpgradeCost(true)):TEXT("MAX"))));
    if(!Save->SaveError.IsEmpty())Feedback->SetText(FText::FromString(Save->SaveError));
    if(ChapterPack) { const FString StatusText=ChapterPack->Message.IsEmpty()?TEXT("Check Chapter 2 download"):ChapterPack->Message;
        ChapterText->SetText(FText::FromString(ChapterPack->DownloadBytes>0?FString::Printf(TEXT("Chapter 2: %.1f MB | %s"),ChapterPack->DownloadBytes/1000000.0,*StatusText):StatusText));
        ChapterBar->SetPercent(ChapterPack->GetDownloadProgress()); const auto Status=ChapterPack->Status;
        CancelButton->SetVisibility(Status==EMechalordChapterStatus::Checking||Status==EMechalordChapterStatus::Downloading||Status==EMechalordChapterStatus::Verifying?ESlateVisibility::Visible:ESlateVisibility::Collapsed);
    }
}
void UMechalordBattleWidget::ChooseStage(int32 I){if(auto* G=Mode(this))if(auto* S=Progress(this))G->StartStage(I,S->GetEquippedRelic());}
void UMechalordBattleWidget::ChooseRelic(int32 I){if(auto* S=Progress(this))S->EquipRelic(static_cast<EMechalordRelic>(I));}
void UMechalordBattleWidget::Stage0(){ChooseStage(0);} void UMechalordBattleWidget::Stage1(){ChooseStage(1);} void UMechalordBattleWidget::Stage2(){ChooseStage(2);} void UMechalordBattleWidget::Stage3(){ChooseStage(3);} void UMechalordBattleWidget::Stage4(){ChooseStage(4);}
void UMechalordBattleWidget::Shield(){ChooseRelic(0);} void UMechalordBattleWidget::EMP(){ChooseRelic(1);} void UMechalordBattleWidget::Overdrive(){ChooseRelic(2);}
void UMechalordBattleWidget::Troops(){if(auto* S=Progress(this))Feedback->SetText(FText::FromString(S->BuyUpgrade(false)?TEXT("Starting army upgraded."):TEXT("Need more coins, or already at maximum.")));}
void UMechalordBattleWidget::Attack(){if(auto* S=Progress(this))Feedback->SetText(FText::FromString(S->BuyUpgrade(true)?TEXT("Attack strength upgraded."):TEXT("Need more coins, or already at maximum.")));}
void UMechalordBattleWidget::Ability(){if(auto* G=Mode(this))G->ActivateRelic();} void UMechalordBattleWidget::Champion(){if(auto* G=Mode(this))G->DeployChampion();}
void UMechalordBattleWidget::Pause(){if(auto* G=Mode(this))G->SetGamePaused(!G->GetBattleSnapshot().bPaused);}
void UMechalordBattleWidget::Retry(){if(auto* G=Mode(this))G->RetryStage();} void UMechalordBattleWidget::Menu(){if(auto* G=Mode(this))G->ShowMenu();}
void UMechalordBattleWidget::Chapter(){if(auto* P=Pack(this))if(!P->StartDownload())P->CheckAvailability();}
void UMechalordBattleWidget::Cancel(){if(auto* P=Pack(this))P->CancelDownload();}
