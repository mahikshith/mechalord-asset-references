#include "MechalordCommanderPawn.h"
#include "Camera/CameraComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "UObject/ConstructorHelpers.h"
#include "Animation/AnimSequence.h"
#include "Engine/StaticMesh.h"
#include "Engine/SkeletalMesh.h"

AMechalordCommanderPawn::AMechalordCommanderPawn()
{
    PrimaryActorTick.bCanEverTick = false;
    SceneRoot = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
    RootComponent = SceneRoot;
    Camera = CreateDefaultSubobject<UCameraComponent>(TEXT("PortraitCamera"));
    Camera->SetupAttachment(RootComponent);
    Camera->SetUsingAbsoluteLocation(true);
    Camera->SetUsingAbsoluteRotation(true);
    Camera->SetRelativeLocation(FVector(0, -1100, 1550));
    Camera->SetRelativeRotation((FVector(0, 480, 0) - FVector(0, -1100, 1550)).Rotation());
    Camera->FieldOfView = 45;
    Camera->bConstrainAspectRatio = false;
    Commander = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("RelicMarshal"));
    Commander->SetupAttachment(RootComponent);
    Commander->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Commander->SetCastShadow(false);
    SourceCommander=CreateDefaultSubobject<UStaticMeshComponent>(TEXT("FaithfulSourceCommander"));
    SourceCommander->SetupAttachment(RootComponent);
    SourceCommander->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    SourceCommander->SetCastShadow(false);
    SourceCommanderMesh=FSoftObjectPath(TEXT("/Game/Mechalord/Base/Characters/SM_RelicMarshal_Source.SM_RelicMarshal_Source"));
    CommanderMesh=FSoftObjectPath(TEXT("/Game/Mechalord/Base/Characters/SK_RelicMarshal.SK_RelicMarshal"));
    IdleAnimation=FSoftObjectPath(TEXT("/Game/Mechalord/Base/Characters/AN_RelicMarshal_Idle.AN_RelicMarshal_Idle"));
    RunAnimation=FSoftObjectPath(TEXT("/Game/Mechalord/Base/Characters/AN_RelicMarshal_Run.AN_RelicMarshal_Run"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cube(TEXT("/Engine/BasicShapes/Cube.Cube"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cylinder(TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
    const FVector Locations[] = {{0,0,85}, {0,0,142}, {-43,0,108}, {43,0,108}, {-18,0,28}, {18,0,28}, {43,40,103}};
    const FVector Scales[] = {{.62f,.4f,.65f}, {.4f,.37f,.34f}, {.24f,.38f,.4f}, {.24f,.38f,.4f}, {.24f,.28f,.5f}, {.24f,.28f,.5f}, {.2f,.75f,.2f}};
    for (int32 I=0; I<7; ++I)
    {
        auto* Part = CreateDefaultSubobject<UStaticMeshComponent>(*FString::Printf(TEXT("FallbackPart%d"), I));
        Part->SetupAttachment(RootComponent);
        Part->SetStaticMesh(Cube.Object);
        Part->SetRelativeLocation(Locations[I]);
        Part->SetRelativeScale3D(Scales[I]);
        Part->SetCollisionEnabled(ECollisionEnabled::NoCollision);
        Part->SetCastShadow(false);
        FallbackParts.Add(Part);
        if (I==6) Weapon=Part;
    }
    AbilityRing = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("RelicHalo"));
    AbilityRing->SetupAttachment(RootComponent);
    AbilityRing->SetStaticMesh(Cylinder.Object);
    AbilityRing->SetRelativeLocation(FVector(0,0,4));
    AbilityRing->SetRelativeScale3D(FVector(1.6f,1.6f,.03f));
    AbilityRing->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    AbilityRing->SetCastShadow(false);
    AbilityRing->SetVisibility(false);
}

void AMechalordCommanderPawn::BeginPlay()
{
    Super::BeginPlay();
    UMaterialInterface* Material=LoadObject<UMaterialInterface>(nullptr,TEXT("/Game/Mechalord/Materials/M_Unlit.M_Unlit"));
    if (!Material) Material=LoadObject<UMaterialInterface>(nullptr,TEXT("/Engine/BasicShapes/BasicShapeMaterial.BasicShapeMaterial"));
    for (int32 I=0; I<FallbackParts.Num(); ++I)
    {
        auto* Instance=UMaterialInstanceDynamic::Create(Material,this);
        const FLinearColor Tint=I<2 ? FLinearColor(.65f,.53f,.33f) : FLinearColor(.025f,.2f,.2f);
        Instance->SetVectorParameterValue(TEXT("Tint"),Tint);
        Instance->SetVectorParameterValue(TEXT("Color"),Tint);
        FallbackParts[I]->SetMaterial(0,Instance);
    }
    auto* Halo=UMaterialInstanceDynamic::Create(Material,this);
    Halo->SetVectorParameterValue(TEXT("Tint"),FLinearColor(.02f,.7f,.65f));
    Halo->SetVectorParameterValue(TEXT("Color"),FLinearColor(.02f,.7f,.65f));
    AbilityRing->SetMaterial(0,Halo);
    bool bHasCommander=false;
    if(bUseSkeletalCommander)
    {
        if(auto* Mesh=CommanderMesh.LoadSynchronous())
        {
            Commander->SetSkeletalMesh(Mesh);
            Commander->SetRelativeRotation(FRotator(0,180,0));
            Commander->SetRelativeScale3D(FVector(190/FMath::Max(1.f,Mesh->GetBounds().BoxExtent.Z*2)));
            IdleClip=IdleAnimation.LoadSynchronous(); RunClip=RunAnimation.LoadSynchronous();
            if(IdleClip) Commander->PlayAnimation(IdleClip,true);
            bHasCommander=true;
        }
    }
    if(!bHasCommander) if(auto* Mesh=SourceCommanderMesh.LoadSynchronous())
    {
        SourceCommander->SetStaticMesh(Mesh);
        SourceCommander->SetRelativeRotation(FRotator(0,180,0));
        const float Height=FMath::Max(1.f,Mesh->GetBounds().BoxExtent.Z*2);
        SourceCommander->SetRelativeScale3D(FVector(190/Height));
        bHasCommander=true;
    }
    if(bHasCommander) for(auto* Part:FallbackParts) Part->SetVisibility(false);
}
void AMechalordCommanderPawn::SetLane(float Lane) { SetActorLocation(FVector(FMath::Clamp(Lane,-1.f,1.f)*260,0,0)); }
void AMechalordCommanderPawn::SetSiegePose(bool bSiege) { if (Weapon) Weapon->SetRelativeRotation(FRotator(bSiege ? -15 : 0,0,0)); }
void AMechalordCommanderPawn::SetAbilityActive(bool bActive) { AbilityRing->SetVisibility(bActive); }
void AMechalordCommanderPawn::SetRunning(bool bRunning)
{
    if(bWasRunning==bRunning) return;
    bWasRunning=bRunning;
    if(auto* Clip=bRunning && RunClip ? RunClip : IdleClip) Commander->PlayAnimation(Clip,true);
}
