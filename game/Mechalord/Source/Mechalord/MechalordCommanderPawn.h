#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Pawn.h"
#include "MechalordCommanderPawn.generated.h"

class UCameraComponent;
class UStaticMeshComponent;
class USkeletalMeshComponent;
class UMaterialInterface;
class USkeletalMesh;
class UAnimSequence;
class UStaticMesh;

UCLASS()
class MECHALORD_API AMechalordCommanderPawn : public APawn
{
    GENERATED_BODY()
public:
    AMechalordCommanderPawn();
    void SetLane(float NormalizedLane);
    void SetSiegePose(bool bSiege);
    void SetAbilityActive(bool bActive);
    void SetRunning(bool bRunning);
    UPROPERTY(EditDefaultsOnly, Category="Mechalord|Art") TSoftObjectPtr<USkeletalMesh> CommanderMesh;
    UPROPERTY(EditDefaultsOnly, Category="Mechalord|Art") TSoftObjectPtr<UStaticMesh> SourceCommanderMesh;
    // First-pass skeleton is a review option; the faithful source silhouette is
    // the default until joint deformation and mobile reduction are accepted.
    UPROPERTY(EditDefaultsOnly, Category="Mechalord|Art") bool bUseSkeletalCommander=false;
    UPROPERTY(EditDefaultsOnly, Category="Mechalord|Art") TSoftObjectPtr<UAnimSequence> IdleAnimation;
    UPROPERTY(EditDefaultsOnly, Category="Mechalord|Art") TSoftObjectPtr<UAnimSequence> RunAnimation;
protected:
    virtual void BeginPlay() override;
private:
    UPROPERTY() USceneComponent* SceneRoot;
    UPROPERTY() UCameraComponent* Camera;
    UPROPERTY() USkeletalMeshComponent* Commander;
    UPROPERTY() UStaticMeshComponent* SourceCommander;
    UPROPERTY() TArray<UStaticMeshComponent*> FallbackParts;
    UPROPERTY() UStaticMeshComponent* AbilityRing;
    UPROPERTY() UStaticMeshComponent* Weapon;
    UPROPERTY() UAnimSequence* IdleClip;
    UPROPERTY() UAnimSequence* RunClip;
    bool bWasRunning=false;
};
