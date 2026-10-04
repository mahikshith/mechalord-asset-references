#pragma once
#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "MechalordPlayerController.generated.h"

class UMechalordBattleWidget;
class AMechalordGameMode;
UCLASS()
class MECHALORD_API AMechalordPlayerController : public APlayerController
{
    GENERATED_BODY()
public:
    AMechalordPlayerController();
    virtual void Tick(float DeltaSeconds) override;
protected:
    virtual void BeginPlay() override;
    virtual void SetupInputComponent() override;
private:
    UPROPERTY() UMechalordBattleWidget* BattleWidget;
    float KeyboardSteer=0,DragStartX=0,DragStartLane=0;
    bool bDragging=false,bTouchDrag=false;
    ETouchIndex::Type ActiveFinger=ETouchIndex::Touch1;
    AMechalordGameMode* Mode() const;
    bool InPlayArea(float ScreenY) const;
    void SteerAxis(float Value);
    void TouchPressed(ETouchIndex::Type Finger,FVector Location);
    void TouchMoved(ETouchIndex::Type Finger,FVector Location);
    void TouchReleased(ETouchIndex::Type Finger,FVector Location);
    void MousePressed();
    void MouseReleased();
    void MoveDrag(float ScreenX);
    void RelicPressed();
    void ChampionPressed();
    void PausePressed();
    void RetryPressed();
};
