#pragma once

#include "CoreMinimal.h"
#include "Camera/PlayerCameraManager.h"
#include "IronCameraManager.generated.h"

/**
 *  Side-scrolling camera for Iron Legion: frames the hero from the +Y side with a
 *  look-ahead in the facing direction, holds height through jumps (Contra-style,
 *  re-levels on landing), stays above the water while diving, and respects the
 *  level's AIronLevelInfo travel limits and distance. Adds trauma-based shake.
 */
UCLASS()
class AIronCameraManager : public APlayerCameraManager
{
	GENERATED_BODY()

public:

	UPROPERTY(EditAnywhere, Category="Iron Camera") float Distance = 650.0f;
	UPROPERTY(EditAnywhere, Category="Iron Camera") float Height = 120.0f;
	UPROPERTY(EditAnywhere, Category="Iron Camera") float LookAhead = 160.0f;
	UPROPERTY(EditAnywhere, Category="Iron Camera") float MinX = -100000.0f;
	UPROPERTY(EditAnywhere, Category="Iron Camera") float MaxX = 100000.0f;
	UPROPERTY(EditAnywhere, Category="Iron Camera") float Fov = 62.0f;

	/** Adds camera trauma (0..1); shake strength is trauma squared and decays over time */
	UFUNCTION(BlueprintCallable, Category="Iron Camera")
	void AddTrauma(float Amount);

protected:

	virtual void UpdateViewTarget(FTViewTarget& OutVT, float DeltaTime) override;

	bool bInitialised = false;
	float GroundZ = 0.0f;
	float LookX = 0.0f;
	float Trauma = 0.0f;
	float ShakeTime = 0.0f;
	FVector Smoothed = FVector::ZeroVector;
};
