#include "IronDestructible.h"
#include "IronFX.h"
#include "Components/SpotLightComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/DamageEvents.h"
#include "Engine/World.h"
#include "Kismet/GameplayStatics.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "TimerManager.h"

AIronDestructible::AIronDestructible()
{
	PrimaryActorTick.bCanEverTick = true;
	Mesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Mesh"));
	RootComponent = Mesh;
	Mesh->SetMobility(EComponentMobility::Movable);
	Mesh->SetCollisionProfileName(TEXT("BlockAll"));
	Mesh->SetNotifyRigidBodyCollision(true);
	Mesh->LightingChannels.bChannel1 = true;
	Tags.Add(TEXT("Destructible"));
}

void AIronDestructible::BeginPlay()
{
	Super::BeginPlay();
	RestLocation = GetActorLocation();
	if (bSimulateWhenUnsupported)
	{
		Mesh->SetCollisionProfileName(TEXT("PhysicsActor"));
		Mesh->SetSimulatePhysics(true);
		Mesh->SetMassOverrideInKg(NAME_None, 350.0f, true);
	}
	if (bHasLamp)
	{
		USpotLightComponent* Spot = NewObject<USpotLightComponent>(this);
		Spot->SetupAttachment(Mesh);
		Spot->SetRelativeLocation(LampOffset);
		Spot->SetRelativeRotation(FRotator(-90.0f, 0.0f, 0.0f));
		Spot->SetOuterConeAngle(55.0f);
		Spot->SetInnerConeAngle(25.0f);
		Spot->SetIntensity(LampIntensity);
		Spot->SetLightColor(LampColor);
		Spot->SetAttenuationRadius(900.0f);
		Spot->SetCastShadows(true);
		Spot->LightingChannels.bChannel1 = true;
		Spot->RegisterComponent();
		Lamp = Spot;
	}
}

float AIronDestructible::TakeDamage(float Damage, FDamageEvent const& DamageEvent, AController* EventInstigator, AActor* DamageCauser)
{
	if (bBroken || Damage <= 0.0f)
	{
		return 0.0f;
	}
	Health -= Damage;
	Shudder = 0.15f;
	if (Health <= 0.0f)
	{
		Break(DamageCauser ? DamageCauser->GetActorLocation() : GetActorLocation() - FVector(100.0f, 0.0f, 0.0f));
	}
	return Damage;
}

void AIronDestructible::Tick(float Dt)
{
	Super::Tick(Dt);
	if (bBroken)
	{
		DeadTime += Dt;
		if (Lamp)
		{
			// a toppled lamp sputters and dies
			Lamp->SetIntensity(DeadTime < 0.6f && FMath::FRand() < 0.5f ? LampIntensity * 0.6f : 0.0f);
		}
		if (DeadTime > 6.0f)
		{
			Destroy();
		}
		return;
	}
	if (Shudder > 0.0f && !Mesh->IsSimulatingPhysics())
	{
		Shudder -= Dt;
		const float A = FMath::Max(Shudder, 0.0f) * 30.0f;
		SetActorLocation(RestLocation + FVector(FMath::FRandRange(-A, A), 0.0f, FMath::FRandRange(0.0f, A * 0.5f)));
		if (Shudder <= 0.0f)
		{
			SetActorLocation(RestLocation);
		}
	}
}

void AIronDestructible::Break(const FVector& From)
{
	bBroken = true;
	DeadTime = 0.0f;
	const FVector Centre = Mesh->Bounds.Origin;
	const float Away = FMath::Sign(Centre.X - From.X) == 0.0f ? 1.0f : FMath::Sign(Centre.X - From.X);
	switch (Style)
	{
	case EIronBreakStyle::Topple:
		// snap at the base and fall away from the shot
		Mesh->SetCollisionProfileName(TEXT("PhysicsActor"));
		Mesh->SetCollisionResponseToChannel(ECC_Pawn, ECR_Ignore);
		Mesh->SetSimulatePhysics(true);
		Mesh->AddImpulseAtLocation(FVector(Away * 380.0f, 0.0f, 0.0f) * Mesh->GetMass(), Centre + FVector(0.0f, 0.0f, Mesh->Bounds.BoxExtent.Z * 0.8f));
		UIronFX::Impact(this, Centre - FVector(0.0f, 0.0f, Mesh->Bounds.BoxExtent.Z * 0.9f), FLinearColor(1.0f, 0.8f, 0.5f), true);
		break;
	case EIronBreakStyle::Explode:
	{
		Mesh->SetVisibility(false);
		Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		UIronFX::Explosion(this, Centre, BlastRadius, true);
		UIronFX::Debris(this, Centre, DebrisCount, DebrisSize, DebrisTint);
		TArray<AActor*> Ignore;
		Ignore.Add(this);
		// slight delay so a row of barrels goes up as a chain, not all in one frame
		FTimerHandle T;
		const FVector At = Centre;
		const float R = BlastRadius, D = BlastDamage;
		TWeakObjectPtr<AIronDestructible> Self(this);
		GetWorldTimerManager().SetTimer(T, FTimerDelegate::CreateLambda([Self, At, R, D, Ignore]()
		{
			if (Self.IsValid())
			{
				UGameplayStatics::ApplyRadialDamage(Self.Get(), D, At, R, nullptr, Ignore, Self.Get(), nullptr, true);
			}
		}), 0.12f, false);
		break;
	}
	case EIronBreakStyle::Shatter:
	default:
		Mesh->SetVisibility(false);
		Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		UIronFX::Impact(this, Centre, FLinearColor(0.9f, 0.7f, 0.45f), true);
		UIronFX::Debris(this, Centre, DebrisCount, DebrisSize, DebrisTint);
		UIronFX::Sound(this, TEXT("SFX_ArmourClang"), Centre, 0.6f, 0.7f);
		break;
	}
}
