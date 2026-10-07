#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "IronFX.generated.h"

class UStaticMeshComponent;
class UPointLightComponent;
class UMaterialInstanceDynamic;
class USoundBase;

/**
 *  A camera-facing additive glow (muzzle flash, spark, fireball puff) with an optional light.
 *  Grows, fades and can fly ballistically (sparks). Self-destroys at the end of its life.
 */
UCLASS()
class AIronFlash : public AActor
{
	GENERATED_BODY()

public:

	AIronFlash();

	void Setup(const FLinearColor& Color, float Size, float Life, float LightIntensity, float Grow = 1.4f, float Intensity = 25.0f);

	FVector Velocity = FVector::ZeroVector;
	float Gravity = 0.0f;
	float Delay = 0.0f;

	virtual void Tick(float DeltaSeconds) override;

protected:

	UPROPERTY(VisibleAnywhere) UStaticMeshComponent* Quad;
	UPROPERTY(VisibleAnywhere) UPointLightComponent* Light;
	UPROPERTY(Transient) UMaterialInstanceDynamic* Mid;
	float Age = 0.0f;
	float Lifetime = 0.1f;
	float BaseSize = 50.0f;
	float GrowBy = 1.4f;
	float BaseLight = 0.0f;
	float BaseIntensity = 25.0f;
};

/** Effects and sounds for Iron Legion combat, spawned from code. */
UCLASS()
class UIronFX : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:

	UFUNCTION(BlueprintCallable, Category="Iron FX", meta=(WorldContext="Ctx"))
	static void MuzzleFlash(UObject* Ctx, FVector Location, FVector Direction, FLinearColor Color, bool bHeavy);

	UFUNCTION(BlueprintCallable, Category="Iron FX", meta=(WorldContext="Ctx"))
	static void Impact(UObject* Ctx, FVector Location, FLinearColor Color, bool bArmour);

	UFUNCTION(BlueprintCallable, Category="Iron FX", meta=(WorldContext="Ctx"))
	static void Explosion(UObject* Ctx, FVector Location, float Radius, bool bHeavy);

	UFUNCTION(BlueprintCallable, Category="Iron FX", meta=(WorldContext="Ctx"))
	static void Sound(UObject* Ctx, const FString& Name, FVector Location, float Volume = 1.0f, float Pitch = 1.0f);

	/** Throws physics wreck chunks (dark metal) out from a point */
	UFUNCTION(BlueprintCallable, Category="Iron FX", meta=(WorldContext="Ctx"))
	static void Debris(UObject* Ctx, FVector Location, int32 Count, float Size, FLinearColor Tint);
};
