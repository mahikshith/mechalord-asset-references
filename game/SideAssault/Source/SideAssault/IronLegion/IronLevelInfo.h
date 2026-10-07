#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Info.h"
#include "IronLevelInfo.generated.h"

/** Per-level side-scroller settings: camera travel limits and framing distance. */
UCLASS()
class AIronLevelInfo : public AInfo
{
	GENERATED_BODY()

public:

	/** Camera may not travel left of this X (cm) */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="Camera")
	float CameraMinX = -100000.0f;

	/** Camera may not travel right of this X (cm) */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="Camera")
	float CameraMaxX = 100000.0f;

	/** Camera distance from the play plane (cm) */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="Camera")
	float CameraDistance = 650.0f;

	/** Camera height above the hero (cm) */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="Camera")
	float CameraHeight = 120.0f;
};
