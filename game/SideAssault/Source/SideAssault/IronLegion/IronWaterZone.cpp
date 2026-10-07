#include "IronWaterZone.h"
#include "Components/BoxComponent.h"

AIronWaterZone::AIronWaterZone()
{
	Volume = CreateDefaultSubobject<UBoxComponent>(TEXT("Volume"));
	Volume->SetBoxExtent(FVector(200.0f, 200.0f, 100.0f));
	Volume->SetCollisionProfileName(TEXT("OverlapAllDynamic"));
	Volume->SetGenerateOverlapEvents(true);
	RootComponent = Volume;
	Tags.Add(TEXT("Water"));
}

float AIronWaterZone::GetSurfaceZ() const
{
	return Volume->GetComponentLocation().Z + Volume->GetScaledBoxExtent().Z;
}

bool AIronWaterZone::Contains(const FVector& Point) const
{
	const FVector Local = Volume->GetComponentTransform().InverseTransformPosition(Point);
	const FVector E = Volume->GetUnscaledBoxExtent();
	return FMath::Abs(Local.X) <= E.X && FMath::Abs(Local.Y) <= E.Y && FMath::Abs(Local.Z) <= E.Z;
}
