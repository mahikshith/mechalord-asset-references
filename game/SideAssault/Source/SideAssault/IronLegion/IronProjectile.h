#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "IronProjectile.generated.h"

class USphereComponent;
class UProjectileMovementComponent;
class UStaticMeshComponent;
class UPointLightComponent;

/**
 *  A fast tracer round that stays on the side-scrolling plane.
 *  Damages the first pawn or destructible it touches and dies on world geometry.
 */
UCLASS()
class AIronProjectile : public AActor
{
	GENERATED_BODY()

	UPROPERTY(VisibleAnywhere, Category="Projectile")
	USphereComponent* Collision;

	UPROPERTY(VisibleAnywhere, Category="Projectile")
	UProjectileMovementComponent* Movement;

	UPROPERTY(VisibleAnywhere, Category="Projectile")
	UStaticMeshComponent* Tracer;

	UPROPERTY(VisibleAnywhere, Category="Projectile")
	UPointLightComponent* Glow;

public:

	AIronProjectile();

	/** Damage dealt on hit */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Projectile")
	float Damage = 1.0f;

	/** Launches the round along a direction on the XZ plane */
	void Fire(const FVector& Direction, float Speed, AActor* Shooter);

	/** Tints the tracer (player rounds warm, enemy rounds red) */
	void SetTracerColor(const FLinearColor& Color);

protected:

	UFUNCTION()
	void OnHit(UPrimitiveComponent* HitComp, AActor* OtherActor, UPrimitiveComponent* OtherComp, FVector NormalImpulse, const FHitResult& Hit);

	UFUNCTION()
	void OnOverlap(UPrimitiveComponent* OverlappedComp, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

	void Impact(AActor* Other, const FHitResult& Hit);
};
