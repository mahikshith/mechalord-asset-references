#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "BattleSimulation.h"
#include "MechalordStageDefinition.h"
#include "MechalordArena.generated.h"

class UInstancedStaticMeshComponent;
class UStaticMeshComponent;
class UTextRenderComponent;
class UMaterialInstanceDynamic;
class UMechalordStageDefinition;
class UStaticMesh;

// One arena actor; no crowd physics actors. Instance buffers have a fixed capacity.
UCLASS()
class MECHALORD_API AMechalordArena : public AActor
{
    GENERATED_BODY()
public:
    AMechalordArena();
    void Assemble(const mech::Stage& Stage, UMechalordStageDefinition* Art);
    void Present(const mech::Battle& Battle);
    int32 GetVisibleUnitCount() const { return VisibleCount; }
    float GetLaneLimit(float ElapsedSeconds) const;
    UPROPERTY(EditAnywhere, Category="Art") TSoftObjectPtr<UStaticMesh> FriendlyMesh;
    UPROPERTY(EditAnywhere, Category="Art") TSoftObjectPtr<UStaticMesh> EnemyMesh;
    UPROPERTY(EditAnywhere, Category="Performance", meta=(ClampMin="1",ClampMax="80")) int32 VisualCeiling = 80;
protected:
    virtual void BeginPlay() override;
private:
    UPROPERTY() USceneComponent* SceneRoot;
    UPROPERTY() UInstancedStaticMeshComponent* Floor;
    UPROPERTY() UInstancedStaticMeshComponent* NarrowFloor;
    UPROPERTY() UInstancedStaticMeshComponent* Rails;
    UPROPERTY() UInstancedStaticMeshComponent* Allies;
    UPROPERTY() UInstancedStaticMeshComponent* Enemies;
    UPROPERTY() UInstancedStaticMeshComponent* Recruitment;
    UPROPERTY() UInstancedStaticMeshComponent* Multipliers;
    UPROPERTY() UInstancedStaticMeshComponent* EnergyGates;
    UPROPERTY() UInstancedStaticMeshComponent* Barricades;
    UPROPERTY() UStaticMeshComponent* Core;
    UPROPERTY() UStaticMeshComponent* Launcher;
    UPROPERTY() TArray<UTextRenderComponent*> Labels;
    UPROPERTY() TArray<UInstancedStaticMeshComponent*> DressingComponents;
    UPROPERTY() TArray<FMechalordDressingDefinition> StageDressing;
    TArray<FString> DressingIds;
    TArray<TArray<FTransform>> DressingTransforms;
    UPROPERTY() UMaterialInstanceDynamic* CoreMaterial;
    TArray<FTransform> AllyTransforms, EnemyTransforms, RecruitTransforms, MultiplyTransforms, EnergyTransforms, BarrierTransforms, FloorTransforms, RailTransforms;
    int32 VisibleCount = 0;
    FVector FriendlyScale = FVector(.34f,.42f,.38f);
    FVector EnemyScale = FVector(.47f,.55f,.32f);
    bool bAuthoredTrack=false,bAuthoredRecruit=false,bAuthoredMultiply=false,bAuthoredEnergy=false,bAuthoredBarrier=false;
    bool bAuthoredFriendly=false,bAuthoredEnemy=false;
    TArray<FTransform> NarrowTransforms;
    void SetTint(UInstancedStaticMeshComponent* Component, const FLinearColor& Tint);
    void ApplyInstances(UInstancedStaticMeshComponent* Component, const TArray<FTransform>& Transforms);
    void AddGate(TArray<FTransform>& Out, float X, float Y, float HalfWidth) const;
};
