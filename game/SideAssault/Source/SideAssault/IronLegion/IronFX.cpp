#include "IronFX.h"
#include "IronCameraManager.h"
#include "Components/PointLightComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/StaticMeshActor.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"
#include "Kismet/GameplayStatics.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Sound/SoundBase.h"
#include "UObject/ConstructorHelpers.h"

namespace
{
	template <typename T>
	T* LoadCached(const TCHAR* Path)
	{
		static TMap<FString, TWeakObjectPtr<UObject>> Cache;
		if (TWeakObjectPtr<UObject>* Hit = Cache.Find(Path))
		{
			if (Hit->IsValid())
			{
				return Cast<T>(Hit->Get());
			}
		}
		T* Obj = LoadObject<T>(nullptr, Path);
		if (Obj)
		{
			Obj->AddToRoot();  // effects assets live for the session
			Cache.Add(Path, Obj);
		}
		return Obj;
	}

	UWorld* WorldOf(UObject* Ctx)
	{
		return GEngine ? GEngine->GetWorldFromContextObject(Ctx, EGetWorldErrorMode::LogAndReturnNull) : nullptr;
	}

	AIronFlash* Spawn(UWorld* W, const FVector& At)
	{
		FActorSpawnParameters P;
		P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
		// glows sit a little toward the camera (+Y) so they draw over the hero and props
		return W->SpawnActor<AIronFlash>(AIronFlash::StaticClass(), At + FVector(0.0f, 40.0f, 0.0f), FRotator::ZeroRotator, P);
	}
}

// ------------------------------------------------------------------------------------ flash

AIronFlash::AIronFlash()
{
	PrimaryActorTick.bCanEverTick = true;
	Quad = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Quad"));
	RootComponent = Quad;
	Quad->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	Quad->CastShadow = false;
	Quad->LightingChannels.bChannel1 = true;
	static ConstructorHelpers::FObjectFinder<UStaticMesh> Plane(TEXT("/Engine/BasicShapes/Plane.Plane"));
	if (Plane.Succeeded())
	{
		Quad->SetStaticMesh(Plane.Object);
	}
	Quad->SetRelativeRotation(FRotator(0.0f, 0.0f, 90.0f));  // face the side camera
	Light = CreateDefaultSubobject<UPointLightComponent>(TEXT("Light"));
	Light->SetupAttachment(Quad);
	Light->SetCastShadows(false);
	Light->SetIntensity(0.0f);
	Light->LightingChannels.bChannel1 = true;
}

void AIronFlash::Setup(const FLinearColor& Color, float Size, float Life, float LightIntensity, float Grow, float Intensity)
{
	BaseSize = Size;
	Lifetime = FMath::Max(Life, 0.01f);
	GrowBy = Grow;
	BaseLight = LightIntensity;
	BaseIntensity = Intensity;
	if (UMaterialInterface* M = LoadCached<UMaterialInterface>(TEXT("/Game/IronLegion/FX/M_IronGlow.M_IronGlow")))
	{
		Mid = Quad->CreateDynamicMaterialInstance(0, M);
		Mid->SetVectorParameterValue(TEXT("Color"), Color);
		Mid->SetScalarParameterValue(TEXT("Intensity"), Intensity);
	}
	Light->SetLightColor(Color);
	Light->SetAttenuationRadius(Size * 6.0f);
	Light->SetIntensity(LightIntensity);
	Quad->SetWorldScale3D(FVector(Size / 100.0f));
	Quad->SetVisibility(Delay <= 0.0f);
}

void AIronFlash::Tick(float Dt)
{
	Super::Tick(Dt);
	if (Delay > 0.0f)
	{
		Delay -= Dt;
		Quad->SetVisibility(Delay <= 0.0f);
		return;
	}
	Age += Dt;
	const float K = FMath::Clamp(Age / Lifetime, 0.0f, 1.0f);
	if (!Velocity.IsNearlyZero() || Gravity != 0.0f)
	{
		Velocity.Z -= Gravity * Dt;
		AddActorWorldOffset(Velocity * Dt);
	}
	const float Fade = FMath::Square(1.0f - K);
	Quad->SetWorldScale3D(FVector(BaseSize / 100.0f * FMath::Lerp(1.0f, GrowBy, K)));
	if (Mid)
	{
		Mid->SetScalarParameterValue(TEXT("Intensity"), BaseIntensity * Fade);
	}
	Light->SetIntensity(BaseLight * Fade);
	if (K >= 1.0f)
	{
		Destroy();
	}
}

// -------------------------------------------------------------------------------- library

void UIronFX::Sound(UObject* Ctx, const FString& Name, FVector Location, float Volume, float Pitch)
{
	const FString Path = FString::Printf(TEXT("/Game/IronLegion/Audio/%s.%s"), *Name, *Name);
	if (USoundBase* S = LoadCached<USoundBase>(*Path))
	{
		UGameplayStatics::PlaySoundAtLocation(Ctx, S, Location, Volume, Pitch * FMath::FRandRange(0.94f, 1.06f));
	}
}

void UIronFX::MuzzleFlash(UObject* Ctx, FVector Location, FVector Direction, FLinearColor Color, bool bHeavy)
{
	UWorld* W = WorldOf(Ctx);
	if (!W)
	{
		return;
	}
	const FVector Dir = Direction.GetSafeNormal();
	if (AIronFlash* Core = Spawn(W, Location))
	{
		Core->Setup(Color, bHeavy ? 70.0f : 34.0f, 0.06f, bHeavy ? 30000.0f : 9000.0f, 1.2f, 40.0f);
	}
	// a forward plume so the flash reads as directional
	if (AIronFlash* Plume = Spawn(W, Location + Dir * (bHeavy ? 40.0f : 22.0f)))
	{
		Plume->Setup(Color * FLinearColor(1.0f, 0.85f, 0.7f), bHeavy ? 50.0f : 24.0f, 0.05f, 0.0f, 1.6f, 25.0f);
		Plume->Velocity = Dir * 600.0f;
	}
}

void UIronFX::Impact(UObject* Ctx, FVector Location, FLinearColor Color, bool bArmour)
{
	UWorld* W = WorldOf(Ctx);
	if (!W)
	{
		return;
	}
	if (AIronFlash* Core = Spawn(W, Location))
	{
		Core->Setup(Color, bArmour ? 30.0f : 20.0f, 0.07f, bArmour ? 6000.0f : 2500.0f, 1.5f, 30.0f);
	}
	const int32 Sparks = bArmour ? 5 : 3;
	for (int32 I = 0; I < Sparks; ++I)
	{
		if (AIronFlash* S = Spawn(W, Location))
		{
			S->Setup(FLinearColor(1.0f, 0.7f, 0.35f), 6.0f, FMath::FRandRange(0.15f, 0.3f), 0.0f, 0.6f, 40.0f);
			const float A = FMath::FRandRange(-PI, PI);
			S->Velocity = FVector(FMath::Cos(A), 0.0f, FMath::Sin(A) * 0.6f + 0.6f) * FMath::FRandRange(250.0f, 600.0f);
			S->Gravity = 1600.0f;
		}
	}
	if (bArmour)
	{
		Sound(Ctx, TEXT("SFX_ArmourClang"), Location, 0.5f, 1.0f);
	}
	else if (FMath::FRand() < 0.5f)
	{
		Sound(Ctx, TEXT("SFX_Impact"), Location, 0.35f, 1.0f);
	}
}

void UIronFX::Explosion(UObject* Ctx, FVector Location, float Radius, bool bHeavy)
{
	UWorld* W = WorldOf(Ctx);
	if (!W)
	{
		return;
	}
	const FLinearColor Hot(1.0f, 0.55f, 0.18f);
	if (AIronFlash* Core = Spawn(W, Location))
	{
		Core->Setup(FLinearColor(1.0f, 0.75f, 0.45f), Radius * 1.4f, 0.22f, bHeavy ? 220000.0f : 90000.0f, 1.8f, 30.0f);
	}
	// rolling fireball puffs, staggered so the blast blooms rather than pops
	for (int32 I = 0; I < (bHeavy ? 7 : 4); ++I)
	{
		const FVector Off(FMath::FRandRange(-0.5f, 0.5f) * Radius, 0.0f, FMath::FRandRange(-0.2f, 0.6f) * Radius);
		if (AIronFlash* P = Spawn(W, Location + Off))
		{
			P->Delay = FMath::FRandRange(0.0f, 0.12f);
			P->Setup(Hot, Radius * FMath::FRandRange(0.6f, 1.0f), FMath::FRandRange(0.3f, 0.55f), 0.0f, 1.7f, 14.0f);
			P->Velocity = FVector(Off.X, 0.0f, FMath::Abs(Off.Z) + 120.0f) * 1.2f;
		}
	}
	for (int32 I = 0; I < (bHeavy ? 14 : 8); ++I)
	{
		if (AIronFlash* S = Spawn(W, Location))
		{
			S->Setup(FLinearColor(1.0f, 0.75f, 0.4f), 8.0f, FMath::FRandRange(0.35f, 0.7f), 0.0f, 0.5f, 45.0f);
			const float A = FMath::FRandRange(0.15f, PI - 0.15f);
			S->Velocity = FVector(FMath::Cos(A), 0.0f, FMath::Sin(A)) * FMath::FRandRange(500.0f, 1100.0f);
			S->Gravity = 1400.0f;
		}
	}
	Sound(Ctx, bHeavy ? TEXT("SFX_ShellBlast") : TEXT("SFX_Explosion"), Location, bHeavy ? 1.0f : 0.8f, 1.0f);
	if (APlayerController* PC = UGameplayStatics::GetPlayerController(Ctx, 0))
	{
		if (AIronCameraManager* Cam = Cast<AIronCameraManager>(PC->PlayerCameraManager))
		{
			const float Dist = FVector::Dist(PC->GetPawn() ? PC->GetPawn()->GetActorLocation() : Location, Location);
			Cam->AddTrauma(FMath::Clamp((bHeavy ? 0.75f : 0.45f) * (1.0f - Dist / 2500.0f), 0.0f, 1.0f));
		}
	}
}

void UIronFX::Debris(UObject* Ctx, FVector Location, int32 Count, float Size, FLinearColor Tint)
{
	UWorld* W = WorldOf(Ctx);
	UStaticMesh* Cube = LoadCached<UStaticMesh>(TEXT("/Engine/BasicShapes/Cube.Cube"));
	UMaterialInterface* Base = LoadCached<UMaterialInterface>(TEXT("/Engine/BasicShapes/BasicShapeMaterial.BasicShapeMaterial"));
	if (!W || !Cube)
	{
		return;
	}
	for (int32 I = 0; I < Count; ++I)
	{
		FActorSpawnParameters P;
		P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
		const FVector At = Location + FVector(FMath::FRandRange(-30.0f, 30.0f), 0.0f, FMath::FRandRange(0.0f, 50.0f));
		AStaticMeshActor* Chunk = W->SpawnActor<AStaticMeshActor>(AStaticMeshActor::StaticClass(), At, FRotator(FMath::FRandRange(0.0f, 360.0f), FMath::FRandRange(0.0f, 360.0f), 0.0f), P);
		if (!Chunk)
		{
			continue;
		}
		UStaticMeshComponent* C = Chunk->GetStaticMeshComponent();
		C->SetMobility(EComponentMobility::Movable);
		C->SetStaticMesh(Cube);
		const float S = Size * FMath::FRandRange(0.5f, 1.2f) / 100.0f;
		C->SetWorldScale3D(FVector(S, S * 0.6f, S * 0.8f));
		if (Base)
		{
			UMaterialInstanceDynamic* M = C->CreateDynamicMaterialInstance(0, Base);
			M->SetVectorParameterValue(TEXT("Color"), Tint * FMath::FRandRange(0.6f, 1.0f));
		}
		C->SetCollisionProfileName(TEXT("PhysicsActor"));
		C->SetCollisionResponseToChannel(ECC_Pawn, ECR_Ignore);
		C->SetSimulatePhysics(true);
		C->LightingChannels.bChannel1 = true;
		C->AddImpulse(FVector(FMath::FRandRange(-1.0f, 1.0f) * 500.0f, 0.0f, FMath::FRandRange(400.0f, 900.0f)), NAME_None, true);
		C->AddAngularImpulseInDegrees(FVector(FMath::FRandRange(-900.0f, 900.0f), FMath::FRandRange(-900.0f, 900.0f), FMath::FRandRange(-900.0f, 900.0f)), NAME_None, true);
		Chunk->SetLifeSpan(FMath::FRandRange(3.0f, 4.5f));
	}
}
