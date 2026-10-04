#include "MechalordPlayerController.h"
#include "MechalordGameMode.h"
#include "MechalordBattleWidget.h"
#include "Blueprint/UserWidget.h"
#include "Components/InputComponent.h"
#include "Engine/World.h"
#include "InputCoreTypes.h"

AMechalordPlayerController::AMechalordPlayerController()
{
    PrimaryActorTick.bCanEverTick=true; bShowMouseCursor=true; bEnableTouchEvents=true;
}
AMechalordGameMode* AMechalordPlayerController::Mode() const { return GetWorld()->GetAuthGameMode<AMechalordGameMode>(); }
void AMechalordPlayerController::BeginPlay()
{
    Super::BeginPlay();
    BattleWidget=CreateWidget<UMechalordBattleWidget>(this,UMechalordBattleWidget::StaticClass());
    if(BattleWidget) BattleWidget->AddToViewport();
    FInputModeGameAndUI Input; Input.SetHideCursorDuringCapture(false); Input.SetLockMouseToViewportBehavior(EMouseLockMode::DoNotLock);
    SetInputMode(Input);
}
void AMechalordPlayerController::SetupInputComponent()
{
    Super::SetupInputComponent();
    InputComponent->BindAxis(TEXT("Steer"),this,&AMechalordPlayerController::SteerAxis);
    InputComponent->BindAction(TEXT("Drag"),IE_Pressed,this,&AMechalordPlayerController::MousePressed);
    InputComponent->BindAction(TEXT("Drag"),IE_Released,this,&AMechalordPlayerController::MouseReleased);
    InputComponent->BindAction(TEXT("Relic"),IE_Pressed,this,&AMechalordPlayerController::RelicPressed);
    InputComponent->BindAction(TEXT("Champion"),IE_Pressed,this,&AMechalordPlayerController::ChampionPressed);
    InputComponent->BindAction(TEXT("Pause"),IE_Pressed,this,&AMechalordPlayerController::PausePressed);
    InputComponent->BindAction(TEXT("Retry"),IE_Pressed,this,&AMechalordPlayerController::RetryPressed);
    InputComponent->BindTouch(IE_Pressed,this,&AMechalordPlayerController::TouchPressed);
    InputComponent->BindTouch(IE_Repeat,this,&AMechalordPlayerController::TouchMoved);
    InputComponent->BindTouch(IE_Released,this,&AMechalordPlayerController::TouchReleased);
}
bool AMechalordPlayerController::InPlayArea(float Y) const
{
    auto* Game=Mode();
    if(!Game) return false;
    const auto Snapshot=Game->GetBattleSnapshot();
    if(Snapshot.bPaused || (Snapshot.Phase!=EMechalordPhase::Run && Snapshot.Phase!=EMechalordPhase::Siege)) return false;
    int32 W,H; GetViewportSize(W,H); return H>0 && Y>H*.16f && Y<H*.78f;
}
void AMechalordPlayerController::SteerAxis(float Value) { KeyboardSteer=Value; }
void AMechalordPlayerController::MoveDrag(float X)
{
    int32 W,H; GetViewportSize(W,H);
    if(auto* Game=Mode();Game && W>0) Game->SetSteering(DragStartLane+2*(X-DragStartX)/W);
}
void AMechalordPlayerController::TouchPressed(ETouchIndex::Type Finger,FVector Location)
{
    if(bDragging || !InPlayArea(Location.Y)) return;
    if(auto* Game=Mode()) { bDragging=bTouchDrag=true; ActiveFinger=Finger; DragStartX=Location.X; DragStartLane=Game->GetSteering(); }
}
void AMechalordPlayerController::TouchMoved(ETouchIndex::Type Finger,FVector Location) { if(bDragging && bTouchDrag && ActiveFinger==Finger) MoveDrag(Location.X); }
void AMechalordPlayerController::TouchReleased(ETouchIndex::Type Finger,FVector Location) { if(bTouchDrag && ActiveFinger==Finger) bDragging=bTouchDrag=false; }
void AMechalordPlayerController::MousePressed()
{
    float X,Y; if(bDragging || !GetMousePosition(X,Y) || !InPlayArea(Y)) return;
    if(auto* Game=Mode()) { bDragging=true; bTouchDrag=false; DragStartX=X; DragStartLane=Game->GetSteering(); }
}
void AMechalordPlayerController::MouseReleased() { if(!bTouchDrag) bDragging=false; }
void AMechalordPlayerController::RelicPressed() { if(auto* Game=Mode()) Game->ActivateRelic(); }
void AMechalordPlayerController::ChampionPressed() { if(auto* Game=Mode()) Game->DeployChampion(); }
void AMechalordPlayerController::PausePressed() { if(auto* Game=Mode()) Game->SetGamePaused(!Game->GetBattleSnapshot().bPaused); }
void AMechalordPlayerController::RetryPressed()
{
    if(auto* Game=Mode()) { const auto Phase=Game->GetBattleSnapshot().Phase; if(Phase==EMechalordPhase::Won || Phase==EMechalordPhase::Lost) Game->RetryStage(); }
}
void AMechalordPlayerController::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);
    if(bDragging && !bTouchDrag)
    {
        float X,Y;
        if(!IsInputKeyDown(EKeys::LeftMouseButton)) bDragging=false;
        else if(GetMousePosition(X,Y)) MoveDrag(X);
    }
    if(!bDragging && FMath::Abs(KeyboardSteer)>KINDA_SMALL_NUMBER)
        if(auto* Game=Mode()) Game->SetSteering(Game->GetSteering()+KeyboardSteer*FMath::Min(DeltaSeconds,.1f)*1.5f);
}
