#include "IronCameraManager.h"
#include "IronTrooper.h"
#include "IronLevelInfo.h"
#include "IronWaterZone.h"
#include "EngineUtils.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"

void AIronCameraManager::AddTrauma(float Amount)
{
	Trauma = FMath::Clamp(Trauma + Amount, 0.0f, 1.0f);
}

void AIronCameraManager::UpdateViewTarget(FTViewTarget& OutVT, float DeltaTime)
{
	const APawn* Pawn = Cast<APawn>(OutVT.Target);
	if (!IsValid(Pawn))
	{
		Super::UpdateViewTarget(OutVT, DeltaTime);
		return;
	}
	const FVector P = Pawn->GetActorLocation();

	if (!bInitialised)
	{
		bInitialised = true;
		for (TActorIterator<AIronLevelInfo> It(GetWorld()); It; ++It)
		{
			Distance = It->CameraDistance;
			Height = It->CameraHeight;
			MinX = It->CameraMinX;
			MaxX = It->CameraMaxX;
		}
		FParse::Value(FCommandLine::Get(), TEXT("IronZoom="), Distance);
		GroundZ = P.Z;
		Smoothed = FVector(FMath::Clamp(P.X, MinX, MaxX), P.Y + Distance, P.Z + Height);
	}

	const AIronTrooper* Trooper = Cast<AIronTrooper>(Pawn);
	const UCharacterMovementComponent* Move = Trooper ? Trooper->GetCharacterMovement() : nullptr;
	const bool bGrounded = Move && Move->IsMovingOnGround();

	// Contra-style vertical framing: hold the floor line through jumps, re-level on landing,
	// follow only when the hero climbs well above or drops below the held line
	if (bGrounded)
	{
		GroundZ = P.Z;
	}
	else if (P.Z > GroundZ + 260.0f)
	{
		GroundZ = P.Z - 260.0f;
	}
	else if (P.Z < GroundZ - 40.0f)
	{
		GroundZ = P.Z + 40.0f;
	}
	float TargetZ = GroundZ + Height;
	if (Trooper && Trooper->bInWater)
	{
		for (TActorIterator<AIronWaterZone> It(GetWorld()); It; ++It)
		{
			if (It->Contains(P))
			{
				TargetZ = FMath::Max(TargetZ, It->GetSurfaceZ() + Height);
			}
		}
	}

	// look ahead where the hero faces
	const float Facing = Trooper ? Trooper->GetFacing() : 1.0f;
	LookX = FMath::FInterpTo(LookX, Facing * LookAhead, DeltaTime, 2.5f);
	const FVector Target(FMath::Clamp(P.X + LookX, MinX, MaxX), P.Y + Distance, TargetZ);
	Smoothed.X = FMath::FInterpTo(Smoothed.X, Target.X, DeltaTime, 7.0f);
	Smoothed.Y = Target.Y;
	Smoothed.Z = FMath::FInterpTo(Smoothed.Z, Target.Z, DeltaTime, bGrounded ? 5.0f : 3.0f);

	// trauma shake: small positional jitter plus a little roll
	FVector Shake = FVector::ZeroVector;
	float Roll = 0.0f;
	if (Trauma > 0.0f)
	{
		ShakeTime += DeltaTime;
		const float S = Trauma * Trauma;
		Shake = FVector(FMath::PerlinNoise1D(ShakeTime * 23.0f) * 22.0f * S, 0.0f, FMath::PerlinNoise1D(ShakeTime * 29.0f + 7.0f) * 18.0f * S);
		Roll = FMath::PerlinNoise1D(ShakeTime * 17.0f + 3.0f) * 2.2f * S;
		Trauma = FMath::Max(0.0f, Trauma - DeltaTime * 1.6f);
	}

	OutVT.POV.Location = Smoothed + Shake;
	OutVT.POV.Rotation = FRotator(0.0f, -90.0f, Roll);
	OutVT.POV.FOV = Fov;
}
