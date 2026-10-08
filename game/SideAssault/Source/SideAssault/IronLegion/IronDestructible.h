#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "IronDestructible.generated.h"

class UStaticMeshComponent;
class ULightComponent;

UENUM(BlueprintType)
enum class EIronBreakStyle : uint8
{
	Shatter,   // bursts into chunks (crates, sandbags, barricades)
	Explode,   // fuel barrels: a blast with splash damage that chains to neighbours
	Topple     // lamp posts and rails: snap at the base and fall over under physics
};

/**
 *  A piece of the level that takes fire from anyone (hero, enemies, blasts) and breaks:
 *  it shudders and scorches as it is hit, then shatters, explodes or topples.
 *  Blocks movement and bullets while intact. Placed by tools/unreal/build_docks_level.py.
 */
UCLASS()
class AIronDestructible : public AActor
{
	GENERATED_BODY()

public:

	AIronDestructible();

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Destructible") UStaticMeshComponent* Mesh;
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Destructible") float Health = 6.0f;
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Destructible") EIronBreakStyle Style = EIronBreakStyle::Shatter;
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Destructible") FLinearColor DebrisTint = FLinearColor(0.2f, 0.2f, 0.18f);
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Destructible") int32 DebrisCount = 6;
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Destructible") float DebrisSize = 22.0f;
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Destructible") float BlastRadius = 260.0f;
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Destructible") float BlastDamage = 3.0f;

	/** Rests on other props (stacked crates): simulate physics so it drops when its support breaks */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Destructible") bool bSimulateWhenUnsupported = false;

	/** Optional light that belongs to this prop (lamp heads); it dies with the prop */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Destructible") bool bHasLamp = false;
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Destructible") FVector LampOffset = FVector(0.0f, 0.0f, 450.0f);
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Destructible") FLinearColor LampColor = FLinearColor(1.0f, 0.62f, 0.32f);
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Destructible") float LampIntensity = 9000.0f;

	virtual float TakeDamage(float Damage, struct FDamageEvent const& DamageEvent, AController* EventInstigator, AActor* DamageCauser) override;
	virtual void Tick(float DeltaSeconds) override;

protected:

	virtual void BeginPlay() override;
	void Break(const FVector& From);

	UPROPERTY(Transient) ULightComponent* Lamp = nullptr;
	FVector RestLocation = FVector::ZeroVector;
	float Shudder = 0.0f;
	float Scorch = 0.0f;
	float DeadTime = -1.0f;
	bool bBroken = false;
};
