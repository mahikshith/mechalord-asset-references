#include "IronProjectile.h"
#include "Components/SphereComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Components/PointLightComponent.h"
#include "GameFramework/ProjectileMovementComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "UObject/ConstructorHelpers.h"
#include "Engine/StaticMesh.h"

AIronProjectile::AIronProjectile()
{
	Collision = CreateDefaultSubobject<USphereComponent>(TEXT("Collision"));
	Collision->InitSphereRadius(8.0f);
	Collision->SetCollisionProfileName(TEXT("Projectile"));
	Collision->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	Collision->SetCollisionResponseToAllChannels(ECR_Block);
	Collision->SetCollisionResponseToChannel(ECC_Pawn, ECR_Overlap);
	Collision->SetCollisionResponseToChannel(ECC_Camera, ECR_Ignore);
	Collision->SetGenerateOverlapEvents(true);
	Collision->OnComponentHit.AddDynamic(this, &AIronProjectile::OnHit);
	Collision->OnComponentBeginOverlap.AddDynamic(this, &AIronProjectile::OnOverlap);
	RootComponent = Collision;

	Tracer = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Tracer"));
	Tracer->SetupAttachment(Collision);
	Tracer->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	Tracer->CastShadow = false;
	static ConstructorHelpers::FObjectFinder<UStaticMesh> Capsule(TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
	if (Capsule.Succeeded())
	{
		Tracer->SetStaticMesh(Capsule.Object);
	}
	// a thin elongated streak along local X
	Tracer->SetRelativeRotation(FRotator(-90.0f, 0.0f, 0.0f));
	Tracer->SetRelativeScale3D(FVector(0.05f, 0.05f, 0.55f));

	Glow = CreateDefaultSubobject<UPointLightComponent>(TEXT("Glow"));
	Glow->SetupAttachment(Collision);
	Glow->SetIntensity(1800.0f);
	Glow->SetAttenuationRadius(220.0f);
	Glow->SetCastShadows(false);

	Movement = CreateDefaultSubobject<UProjectileMovementComponent>(TEXT("Movement"));
	Movement->UpdatedComponent = Collision;
	Movement->ProjectileGravityScale = 0.0f;
	Movement->bRotationFollowsVelocity = true;
	Movement->bConstrainToPlane = true;
	Movement->SetPlaneConstraintNormal(FVector(0.0f, 1.0f, 0.0f));
	Movement->bAutoActivate = false;

	InitialLifeSpan = 1.4f;
	SetTracerColor(FLinearColor(1.0f, 0.55f, 0.18f));
}

void AIronProjectile::Fire(const FVector& Direction, float Speed, AActor* Shooter)
{
	SetOwner(Shooter);
	SetInstigator(Cast<APawn>(Shooter));
	Collision->IgnoreActorWhenMoving(Shooter, true);
	const FVector Dir = FVector(Direction.X, 0.0f, Direction.Z).GetSafeNormal();
	SetActorRotation(Dir.Rotation());
	Movement->Velocity = Dir * Speed;
	Movement->Activate(true);
}

void AIronProjectile::SetTracerColor(const FLinearColor& Color)
{
	Glow->SetLightColor(Color);
	if (UMaterialInterface* Base = Tracer->GetMaterial(0))
	{
		UMaterialInstanceDynamic* MID = Tracer->CreateDynamicMaterialInstance(0, Base);
		if (MID)
		{
			MID->SetVectorParameterValue(TEXT("Color"), Color * 20.0f);
		}
	}
}

void AIronProjectile::OnHit(UPrimitiveComponent* HitComp, AActor* OtherActor, UPrimitiveComponent* OtherComp, FVector NormalImpulse, const FHitResult& Hit)
{
	Impact(OtherActor, Hit);
}

void AIronProjectile::OnOverlap(UPrimitiveComponent* OverlappedComp, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	if (!OtherActor || OtherActor == GetOwner())
	{
		return;
	}
	// rounds pass through pawns of the shooter's own side
	if (GetOwner() && OtherActor->Tags.Num() && GetOwner()->Tags.Num() && OtherActor->Tags[0] == GetOwner()->Tags[0])
	{
		return;
	}
	Impact(OtherActor, SweepResult);
}

void AIronProjectile::Impact(AActor* Other, const FHitResult& Hit)
{
	if (IsActorBeingDestroyed())
	{
		return;
	}
	if (Other && Other != GetOwner())
	{
		UGameplayStatics::ApplyPointDamage(Other, Damage, GetVelocity().GetSafeNormal(), Hit, GetInstigatorController(), this, nullptr);
		if (UPrimitiveComponent* Prim = Hit.GetComponent())
		{
			if (Prim->IsSimulatingPhysics())
			{
				Prim->AddImpulseAtLocation(GetVelocity().GetSafeNormal() * 9000.0f, Hit.ImpactPoint);
			}
		}
	}
	Destroy();
}
