#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "IronWaterZone.generated.h"

class UBoxComponent;

/**
 *  A box of water for the side-scroller. Troopers inside float at the surface,
 *  can dive (and are then out of the line of fire) and jump back out.
 *  Box-based so it can be placed from scripts without brush geometry.
 */
UCLASS()
class AIronWaterZone : public AActor
{
	GENERATED_BODY()

public:

	AIronWaterZone();

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Water")
	UBoxComponent* Volume;

	/** World Z of the water surface */
	UFUNCTION(BlueprintPure, Category="Water")
	float GetSurfaceZ() const;

	/** True if a world point is inside the water */
	bool Contains(const FVector& Point) const;
};
