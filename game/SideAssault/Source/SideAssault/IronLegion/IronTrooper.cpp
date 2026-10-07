#include "IronTrooper.h"
#include "IronProjectile.h"
#include "IronWaterZone.h"
#include "IronLevelInfo.h"
#include "IronEnemy.h"
#include "IronFX.h"
#include "IronCameraManager.h"
#include "EngineUtils.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "UObject/ConstructorHelpers.h"
#include "UObject/UnrealType.h"
#include "Components/CapsuleComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/PlayerController.h"
#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "InputAction.h"
#include "InputMappingContext.h"
#include "InputCoreTypes.h"
#include "Engine/LocalPlayer.h"
#include "Engine/World.h"
#include "Engine/OverlapResult.h"
#include "Kismet/GameplayStatics.h"
#include "TimerManager.h"
#include "UnrealClient.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "Animation/AnimationAsset.h"
#include "Camera/PlayerCameraManager.h"
#include "Kismet/KismetSystemLibrary.h"

AIronTrooper::AIronTrooper()
{
	ProjectileClass = AIronProjectile::StaticClass();
	GetCharacterMovement()->GetNavAgentPropertiesRef().bCanCrouch = true;
	GetCharacterMovement()->GetNavAgentPropertiesRef().bCanSwim = true;
	GetCharacterMovement()->SetCrouchedHalfHeight(58.0f);
	GetCharacterMovement()->MaxWalkSpeedCrouched = 0.0f;  // Contra-style: crouching plants you
	GetCharacterMovement()->MaxSwimSpeed = 380.0f;
	GetCharacterMovement()->Buoyancy = 1.05f;
	Tags.Add(TEXT("Player"));
	// the hero also takes the level's camera-side key light
	GetMesh()->LightingChannels.bChannel1 = true;

	Weapon = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Weapon"));
	Weapon->SetupAttachment(GetMesh(), WeaponBone);
	Weapon->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	Weapon->LightingChannels.bChannel1 = true;
	static ConstructorHelpers::FObjectFinder<UStaticMesh> Rifle(TEXT("/Game/IronLegion/Props/Rifle/Gun_Rifle/StaticMeshes/Gun_Rifle.Gun_Rifle"));
	if (Rifle.Succeeded())
	{
		Weapon->SetStaticMesh(Rifle.Object);
	}
	WeaponGrip = FTransform(FRotator(0.0f, 90.0f, 0.0f), FVector(0.0f, 8.0f, 2.0f), FVector(0.7f));
}

void AIronTrooper::BeginPlay()
{
	Super::BeginPlay();
	Health = MaxHealth;
	Checkpoint = GetActorLocation();
	// side-scroller: always start facing right along the level
	SetActorRotation(FRotator(0.0f, 0.0f, 0.0f));

	// grip: allow quick iteration from the command line, e.g. -IronGrip=P,Y,R,X,Y,Z
	FString Grip;
	if (FParse::Value(FCommandLine::Get(), TEXT("IronGrip="), Grip))
	{
		TArray<FString> V;
		Grip.ParseIntoArray(V, TEXT(","));
		if (V.Num() == 6)
		{
			WeaponGrip = FTransform(FRotator(FCString::Atof(*V[0]), FCString::Atof(*V[1]), FCString::Atof(*V[2])), FVector(FCString::Atof(*V[3]), FCString::Atof(*V[4]), FCString::Atof(*V[5])), FVector(0.7f));
		}
	}
	Weapon->AttachToComponent(GetMesh(), FAttachmentTransformRules::SnapToTargetNotIncludingScale, WeaponBone);
	Weapon->SetRelativeTransform(WeaponGrip);
	// hand bones carry a tiny import scale; keep the rifle at true size
	Weapon->SetUsingAbsoluteScale(true);
	Weapon->SetWorldScale3D(WeaponGrip.GetScale3D());

	if (FParse::Param(FCommandLine::Get(), TEXT("IronBones")))
	{
		for (int32 B = 0; B < GetMesh()->GetNumBones(); ++B)
		{
			UE_LOG(LogTemp, Warning, TEXT("IronBone %d %s"), B, *GetMesh()->GetBoneName(B).ToString());
		}
	}
	if (FParse::Param(FCommandLine::Get(), TEXT("IronNoAnim")))
	{
		GetMesh()->SetAnimInstanceClass(nullptr);
	}
	FString TestAnim;
	if (FParse::Value(FCommandLine::Get(), TEXT("IronAnimTest="), TestAnim))
	{
		if (UAnimationAsset* Anim = LoadObject<UAnimationAsset>(nullptr, *TestAnim))
		{
			GetMesh()->PlayAnimation(Anim, true);
		}
	}
}

static UInputAction* MakeAction(UObject* Outer, const TCHAR* Name, EInputActionValueType Type)
{
	UInputAction* Action = NewObject<UInputAction>(Outer, Name);
	Action->ValueType = Type;
	return Action;
}

void AIronTrooper::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);

	FireAction = MakeAction(this, TEXT("IA_IronFire"), EInputActionValueType::Boolean);
	AimUpAction = MakeAction(this, TEXT("IA_IronAimUp"), EInputActionValueType::Boolean);
	DownAction = MakeAction(this, TEXT("IA_IronDown"), EInputActionValueType::Boolean);
	MeleeAction = MakeAction(this, TEXT("IA_IronMelee"), EInputActionValueType::Boolean);

	CombatContext = NewObject<UInputMappingContext>(this, TEXT("IMC_IronCombat"));
	for (const FKey& Key : { EKeys::J, EKeys::LeftMouseButton, EKeys::Gamepad_RightTrigger, EKeys::Gamepad_FaceButton_Left })
	{
		CombatContext->MapKey(FireAction, Key);
	}
	for (const FKey& Key : { EKeys::W, EKeys::Up, EKeys::Gamepad_LeftStick_Up, EKeys::Gamepad_DPad_Up })
	{
		CombatContext->MapKey(AimUpAction, Key);
	}
	for (const FKey& Key : { EKeys::S, EKeys::Down, EKeys::LeftControl, EKeys::Gamepad_LeftStick_Down, EKeys::Gamepad_DPad_Down })
	{
		CombatContext->MapKey(DownAction, Key);
	}
	for (const FKey& Key : { EKeys::K, EKeys::RightMouseButton, EKeys::Gamepad_FaceButton_Top })
	{
		CombatContext->MapKey(MeleeAction, Key);
	}

	if (UEnhancedInputComponent* Input = Cast<UEnhancedInputComponent>(PlayerInputComponent))
	{
		Input->BindActionValueLambda(FireAction, ETriggerEvent::Started, [this](const FInputActionValue&) { DoFire(true); });
		Input->BindActionValueLambda(FireAction, ETriggerEvent::Completed, [this](const FInputActionValue&) { DoFire(false); });
		Input->BindActionValueLambda(AimUpAction, ETriggerEvent::Started, [this](const FInputActionValue&) { DoAimUp(true); });
		Input->BindActionValueLambda(AimUpAction, ETriggerEvent::Completed, [this](const FInputActionValue&) { DoAimUp(false); });
		Input->BindActionValueLambda(DownAction, ETriggerEvent::Started, [this](const FInputActionValue&) { DoDown(true); });
		Input->BindActionValueLambda(DownAction, ETriggerEvent::Completed, [this](const FInputActionValue&) { DoDown(false); });
		Input->BindActionValueLambda(MeleeAction, ETriggerEvent::Started, [this](const FInputActionValue&) { DoMelee(); });
		// the template keeps the last move value after release; clear it so aim and crouch read a neutral stick
		Input->BindActionValueLambda(MoveAction, ETriggerEvent::Completed, [this](const FInputActionValue&) { ActionValueY = 0.0f; });
	}
}

void AIronTrooper::PawnClientRestart()
{
	Super::PawnClientRestart();
	if (APlayerController* PC = Cast<APlayerController>(GetController()))
	{
		if (APlayerCameraManager* Cam = PC->PlayerCameraManager)
		{
			float Zoom = CameraDistance;
			float MinX = -100000.0f, MaxX = 100000.0f, Height = 100.0f;
			for (TActorIterator<AIronLevelInfo> It(GetWorld()); It; ++It)
			{
				Zoom = It->CameraDistance;
				MinX = It->CameraMinX;
				MaxX = It->CameraMaxX;
				Height = It->CameraHeight;
			}
			FParse::Value(FCommandLine::Get(), TEXT("IronZoom="), Zoom);
			auto SetFloat = [Cam](const TCHAR* Name, float Value)
			{
				if (FFloatProperty* Prop = FindFProperty<FFloatProperty>(Cam->GetClass(), Name))
				{
					Prop->SetPropertyValue_InContainer(Cam, Value);
				}
			};
			SetFloat(TEXT("CurrentZoom"), Zoom);
			SetFloat(TEXT("CameraXMinBounds"), MinX);
			SetFloat(TEXT("CameraXMaxBounds"), MaxX);
			SetFloat(TEXT("CameraZOffset"), Height);
		}
	}

	if (APlayerController* PC = Cast<APlayerController>(GetController()))
	{
		if (UEnhancedInputLocalPlayerSubsystem* Sub = ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(PC->GetLocalPlayer()))
		{
			if (CombatContext)
			{
				Sub->AddMappingContext(CombatContext, 1);
			}
		}
	}
}

// ------------------------------------------------------------------------------------- input

void AIronTrooper::DoFire(bool bPressed)
{
	bFiring = bPressed && !bDead;
}

void AIronTrooper::DoAimUp(bool bPressed)
{
	bAimUpHeld = bPressed;
}

void AIronTrooper::DoDown(bool bPressed)
{
	bDownHeld = bPressed;
	// the template's drop-through reads its own drop value on jump; mirror the down key into it
	DoDrop(bPressed ? 1.0f : 0.0f);
}

void AIronTrooper::DoMove(float Forward)
{
	if (bDead)
	{
		return;
	}
	if (bIsCrouched)
	{
		// planted while crouched, but still able to turn around
		ActionValueY = Forward;
		if (!FMath::IsNearlyZero(Forward))
		{
			SetActorRotation(FRotator(0.0f, Forward > 0.0f ? 0.0f : 180.0f, 0.0f));
		}
		return;
	}
	Super::DoMove(Forward);
}

void AIronTrooper::DoMelee()
{
	const float Now = GetWorld()->GetTimeSeconds();
	if (bDead || Now - LastMeleeTime < MeleeCooldown)
	{
		return;
	}
	LastMeleeTime = Now;

	const FVector Center = GetActorLocation() + FVector(GetFacing() * MeleeRange * 0.7f, 0.0f, 10.0f);
	TArray<FOverlapResult> Hits;
	FCollisionQueryParams Params(SCENE_QUERY_STAT(IronMelee), false, this);
	GetWorld()->OverlapMultiByObjectType(Hits, Center, FQuat::Identity, FCollisionObjectQueryParams::AllDynamicObjects, FCollisionShape::MakeSphere(MeleeRange * 0.6f), Params);
	TSet<AActor*> Struck;
	for (const FOverlapResult& Hit : Hits)
	{
		AActor* Other = Hit.GetActor();
		if (!Other || Struck.Contains(Other) || Other->ActorHasTag(TEXT("Player")))
		{
			continue;
		}
		Struck.Add(Other);
		UGameplayStatics::ApplyDamage(Other, MeleeDamage, GetController(), this, nullptr);
		if (UPrimitiveComponent* Prim = Hit.GetComponent())
		{
			if (Prim->IsSimulatingPhysics())
			{
				Prim->AddImpulse(FVector(GetFacing(), 0.0f, 0.35f) * 60000.0f);
			}
		}
	}
}

// ------------------------------------------------------------------------------------- tick

float AIronTrooper::GetFacing() const
{
	return GetActorForwardVector().X >= 0.0f ? 1.0f : -1.0f;
}

bool AIronTrooper::IsInvulnerable() const
{
	return bDead || bSubmerged || GetWorld()->GetTimeSeconds() - LastHurtTime < HitRecoveryTime;
}

void AIronTrooper::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	RunAutopilot(DeltaSeconds);
	if (bDead)
	{
		return;
	}

	UCharacterMovementComponent* Move = GetCharacterMovement();
	const bool bGrounded = Move->IsMovingOnGround();
	const bool bStill = FMath::Abs(ActionValueY) < 0.2f;

	// crouch only when down is held, standing still on the ground
	if (bGrounded && bDownHeld && bStill && !bIsCrouched)
	{
		Crouch();
	}
	else if (bIsCrouched && (!bDownHeld || !bGrounded))
	{
		UnCrouch();
	}

	UpdateSwim(DeltaSeconds);
	UpdateAim();

	// profile stance when planted, square-on stride when running or airborne
	float LabYaw = StanceYaw;
	FParse::Value(FCommandLine::Get(), TEXT("IronStanceYaw="), LabYaw);
	const float StanceTarget = (bGrounded && bStill) ? LabYaw : 0.0f;
	StanceYawCurrent = FMath::FInterpTo(StanceYawCurrent, StanceTarget, DeltaSeconds, 10.0f);
	GetMesh()->SetRelativeRotation(FRotator(0.0f, -90.0f + StanceYawCurrent, 0.0f));

	const float Now = GetWorld()->GetTimeSeconds();
	if (bFiring && !bSubmerged && Now - LastShotTime >= FireInterval)
	{
		LastShotTime = Now;
		FireShot();
	}
}

AActor* AIronTrooper::FindAutoAimTarget() const
{
	AActor* Best = nullptr;
	float BestScore = TNumericLimits<float>::Max();
	const FVector Me = GetActorLocation();
	for (TActorIterator<AIronEnemy> It(GetWorld()); It; ++It)
	{
		if (It->bDead)
		{
			continue;
		}
		const FVector D = It->GetActorLocation() - Me;
		const float Dist = D.Size();
		if (Dist > AutoAimRange)
		{
			continue;
		}
		// prefer what is in front, then what is close
		const float Behind = (FMath::Sign(D.X) != GetFacing() && FMath::Abs(D.X) > 60.0f) ? 600.0f : 0.0f;
		if (Dist + Behind < BestScore)
		{
			BestScore = Dist + Behind;
			Best = *It;
		}
	}
	return Best;
}

void AIronTrooper::UpdateAim()
{
	if (bAutoAim && !bAimUpHeld && !bDownHeld)
	{
		if (AActor* Target = FindAutoAimTarget())
		{
			const FVector D = Target->GetActorLocation() - GetActorLocation();
			if (FMath::Abs(ActionValueY) < 0.2f && FMath::Abs(D.X) > 40.0f)
			{
				SetActorRotation(FRotator(0.0f, D.X > 0.0f ? 0.0f : 180.0f, 0.0f));
			}
			// snap to the nearest of the 8 Contra directions
			const float Raw = FMath::RadiansToDegrees(FMath::Atan2(D.Z, FMath::Abs(D.X) * (FMath::Sign(D.X) == GetFacing() ? 1.0f : -1.0f)));
			float Snapped = FMath::RoundToFloat(Raw / 45.0f) * 45.0f;
			if (Snapped > 90.0f) Snapped = 90.0f;
			if (Snapped < -90.0f) Snapped = -90.0f;
			AimPitch = Snapped;
			if (bAutoFire)
			{
				bFiring = true;
			}
			return;
		}
		if (bAutoFire)
		{
			bFiring = false;
		}
	}
	const bool bGrounded = GetCharacterMovement()->IsMovingOnGround();
	const bool bMoving = FMath::Abs(ActionValueY) >= 0.2f;
	float Target = 0.0f;
	if (bAimUpHeld)
	{
		Target = bMoving ? 45.0f : 90.0f;
	}
	else if (bDownHeld && !bIsCrouched && !bInWater)
	{
		// on the ground down+move angles low; in the air down fires straight down
		Target = bGrounded ? (bMoving ? -45.0f : 0.0f) : (bMoving ? -45.0f : -90.0f);
	}
	AimPitch = Target;
}

void AIronTrooper::UpdateSwim(float DeltaSeconds)
{
	UCharacterMovementComponent* Move = GetCharacterMovement();
	TArray<AActor*> Zones;
	GetOverlappingActors(Zones, AIronWaterZone::StaticClass());
	const AIronWaterZone* Water = nullptr;
	for (AActor* Z : Zones)
	{
		if (static_cast<AIronWaterZone*>(Z)->Contains(GetActorLocation()))
		{
			Water = static_cast<AIronWaterZone*>(Z);
			break;
		}
	}

	if (!Water)
	{
		if (bInWater && Move->MovementMode == MOVE_Flying)
		{
			Move->SetMovementMode(MOVE_Falling);
		}
		bInWater = false;
		bSubmerged = false;
		return;
	}

	if (!bInWater)
	{
		// splash down: kill most of the fall speed and start floating
		bInWater = true;
		UIronFX::Sound(this, TEXT("SFX_Splash"), GetActorLocation(), 0.8f, 1.0f);
		UIronFX::Impact(this, FVector(GetActorLocation().X, GetActorLocation().Y, Water->GetSurfaceZ()), FLinearColor(0.6f, 0.75f, 0.8f), false);
		Move->SetMovementMode(MOVE_Flying);
		Move->Velocity.Z *= 0.25f;
	}
	Move->MaxFlySpeed = 330.0f;
	Move->BrakingDecelerationFlying = 1400.0f;

	// float with the head above the surface; hold down to dive under and out of the line of fire
	const float Surface = Water->GetSurfaceZ();
	const float TargetZ = bDownHeld ? Surface - 190.0f : Surface - 55.0f;
	const float WantVz = FMath::Clamp((TargetZ - GetActorLocation().Z) * 4.0f, -260.0f, 260.0f);
	Move->Velocity.Z = FMath::FInterpTo(Move->Velocity.Z, WantVz, DeltaSeconds, 6.0f);
	bSubmerged = GetActorLocation().Z < Surface - 125.0f;
}

void AIronTrooper::DoJumpStart()
{
	if (bInWater)
	{
		// leap out when near the surface
		TArray<AActor*> Zones;
		GetOverlappingActors(Zones, AIronWaterZone::StaticClass());
		for (AActor* Z : Zones)
		{
			if (GetActorLocation().Z > static_cast<AIronWaterZone*>(Z)->GetSurfaceZ() - 90.0f)
			{
				GetCharacterMovement()->SetMovementMode(MOVE_Falling);
				LaunchCharacter(FVector(0.0f, 0.0f, 760.0f), false, true);
				bInWater = false;
				return;
			}
		}
		return;
	}
	Super::DoJumpStart();
}

FVector AIronTrooper::MuzzleLocation(const FVector& AimDir) const
{
	// rounds leave from the rifle barrel: the gun hand plus the barrel length along the aim
	const FVector Hand = GetMesh()->GetBoneLocation(WeaponBone);
	if (!Hand.IsNearlyZero())
	{
		return FVector(Hand.X, GetActorLocation().Y, Hand.Z + 6.0f) + AimDir * 58.0f;
	}
	const float Height = bIsCrouched ? 18.0f : (bInWater ? 40.0f : 60.0f);
	return GetActorLocation() + FVector(GetFacing() * 28.0f, 0.0f, Height) + AimDir * 62.0f;
}

void AIronTrooper::FireShot()
{
	const float Rad = FMath::DegreesToRadians(AimPitch);
	FVector AimDir(FMath::Cos(Rad) * GetFacing(), 0.0f, FMath::Sin(Rad));
	if (FMath::IsNearlyEqual(FMath::Abs(AimPitch), 90.0f))
	{
		AimDir = FVector(0.0f, 0.0f, FMath::Sign(AimPitch));
	}
	FActorSpawnParameters Params;
	Params.Owner = this;
	Params.Instigator = this;
	Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
	const FVector Start = MuzzleLocation(AimDir);
	if (AIronProjectile* Round = GetWorld()->SpawnActor<AIronProjectile>(ProjectileClass, Start, AimDir.Rotation(), Params))
	{
		Round->Damage = BulletDamage;
		Round->Fire(AimDir, BulletSpeed, this);
	}
	UIronFX::MuzzleFlash(this, Start, AimDir, FLinearColor(1.0f, 0.62f, 0.25f), false);
	UIronFX::Sound(this, TEXT("SFX_RifleShot"), Start, 0.4f, 1.0f);
}

// ------------------------------------------------------------------------------------- health

float AIronTrooper::TakeDamage(float Damage, FDamageEvent const& DamageEvent, AController* EventInstigator, AActor* DamageCauser)
{
	if (DamageCauser && (DamageCauser == this || DamageCauser->GetOwner() == this))
	{
		return 0.0f;
	}
	if (bGodMode)
	{
		LastHurtTime = GetWorld()->GetTimeSeconds();
		return 0.0f;
	}
	if (IsInvulnerable() || Damage <= 0.0f)
	{
		return 0.0f;
	}
	Health = FMath::Max(0.0f, Health - Damage);
	LastHurtTime = GetWorld()->GetTimeSeconds();
	UIronFX::Sound(this, TEXT("SFX_Hurt"), GetActorLocation(), 0.8f, 1.0f);
	if (const APlayerController* PC = Cast<APlayerController>(GetController()))
	{
		if (AIronCameraManager* Cam = Cast<AIronCameraManager>(PC->PlayerCameraManager))
		{
			Cam->AddTrauma(0.35f);
		}
	}
	const float Away = DamageCauser ? FMath::Sign(GetActorLocation().X - DamageCauser->GetActorLocation().X) : -GetFacing();
	LaunchCharacter(FVector((Away == 0.0f ? -GetFacing() : Away) * 380.0f, 0.0f, 320.0f), true, true);
	if (Health <= 0.0f)
	{
		Die();
	}
	return Damage;
}

void AIronTrooper::FellOutOfWorld(const UDamageType& DmgType)
{
	// a fall costs one health and puts you back at the checkpoint instead of destroying the pawn
	Health = FMath::Max(0.0f, Health - 1.0f);
	if (Health <= 0.0f)
	{
		Die();
		return;
	}
	SetActorLocation(Checkpoint, false, nullptr, ETeleportType::ResetPhysics);
	GetCharacterMovement()->StopMovementImmediately();
	LastHurtTime = GetWorld()->GetTimeSeconds();
}

void AIronTrooper::SetCheckpoint(const FVector& Location)
{
	Checkpoint = Location;
}

void AIronTrooper::Die()
{
	bDead = true;
	bFiring = false;
	GetCharacterMovement()->DisableMovement();
	GetWorld()->GetTimerManager().SetTimer(RespawnTimer, this, &AIronTrooper::Respawn, RespawnDelay, false);
}

void AIronTrooper::Respawn()
{
	bDead = false;
	Health = MaxHealth;
	LastHurtTime = GetWorld()->GetTimeSeconds();
	SetActorLocation(Checkpoint, false, nullptr, ETeleportType::ResetPhysics);
	GetCharacterMovement()->SetMovementMode(MOVE_Walking);
}

// ------------------------------------------------------------------------------- autopilot

void AIronTrooper::RunAutopilot(float DeltaSeconds)
{
	static const bool bAuto = FParse::Param(FCommandLine::Get(), TEXT("IronAutopilot"));
	if (!bAuto || !IsPlayerControlled())
	{
		return;
	}
	const float T0 = AutopilotTime;
	AutopilotTime += DeltaSeconds;
	const float T = AutopilotTime;
	auto Crossed = [T0, T](float At) { return T0 < At && T >= At; };

	if (FParse::Param(FCommandLine::Get(), TEXT("IronPoseLab")))
	{
		// stand still and aim, then capture a few close frames for grip and pose checks
		ActionValueY = 0.0f;
		DoFire(T > 0.4f);
		if (Crossed(1.0f))
		{
			UE_LOG(LogTemp, Warning, TEXT("IronDebug weapon mesh=%s bounds=%s scale=%s attach=%s loc=%s hand=%s visible=%d"), *GetNameSafe(Weapon->GetStaticMesh()), *Weapon->Bounds.BoxExtent.ToString(), *Weapon->GetComponentScale().ToString(), *Weapon->GetAttachSocketName().ToString(), *Weapon->GetComponentLocation().ToString(), *GetMesh()->GetBoneLocation(WeaponBone).ToString(), Weapon->IsVisible());
		}
		FString LabDir;
		if (FParse::Value(FCommandLine::Get(), TEXT("IronCapture="), LabDir) && (Crossed(1.2f) || Crossed(1.5f)))
		{
			FScreenshotRequest::RequestScreenshot(FString::Printf(TEXT("%s/lab_%d.png"), *LabDir, CaptureFrame++), false, false);
		}
		if (T > 1.9f)
		{
			UKismetSystemLibrary::QuitGame(this, nullptr, EQuitPreference::Quit, false);
		}
		return;
	}

	if (FParse::Param(FCommandLine::Get(), TEXT("IronFight")))
	{
		bAutoAim = true;
		bAutoFire = true;
		bGodMode = FParse::Param(FCommandLine::Get(), TEXT("IronGod"));
		// advance with short stops to shoot; climb whatever blocks the way (jump, then double jump)
		const float Phase = FMath::Fmod(T, 3.2f);
		const bool bAdvance = Phase < 2.2f;
		if (bAdvance) DoMove(1.0f); else ActionValueY = 0.0f;
		static float Stuck = 0.0f;
		Stuck = (bAdvance && FMath::Abs(GetVelocity().X) < 40.0f) ? Stuck + DeltaSeconds : 0.0f;
		if (bInWater || Stuck > 0.2f)
		{
			DoJumpStart();
			Stuck = -0.35f;
		}
		else if (Stuck < -0.05f && Stuck > -0.1f && GetCharacterMovement()->IsFalling())
		{
			DoJumpStart();  // second press = double jump
		}
		if (GetCharacterMovement()->IsFalling() && GetVelocity().Z < 0.0f)
		{
			DoJumpEnd();
		}
		float Seconds = 20.0f;
		FParse::Value(FCommandLine::Get(), TEXT("IronSeconds="), Seconds);
		FString FightDir;
		if (FParse::Value(FCommandLine::Get(), TEXT("IronCapture="), FightDir))
		{
			CaptureAccum += DeltaSeconds;
			if (CaptureAccum >= 1.0f / 12.0f)
			{
				CaptureAccum = 0.0f;
				FScreenshotRequest::RequestScreenshot(FString::Printf(TEXT("%s/frame_%04d.png"), *FightDir, CaptureFrame++), false, false);
			}
			if (T > Seconds)
			{
				UKismetSystemLibrary::QuitGame(this, nullptr, EQuitPreference::Quit, false);
			}
		}
		return;
	}

	// a short scripted run: sprint and fire, jump, aim up, crouch-fire, air dive-fire, turn and melee
	float Move = 0.0f;
	if (T < 3.0f || (T >= 5.0f && T < 6.6f)) Move = 1.0f;
	if (T >= 7.0f && T < 7.4f) Move = -1.0f;
	if (Move != 0.0f) DoMove(Move); else ActionValueY = 0.0f;
	DoFire((T > 0.6f && T < 6.6f) || (T > 8.2f && T < 9.0f));
	DoAimUp(T >= 3.0f && T < 4.0f);
	if (Crossed(4.0f)) DoDown(true);
	if (Crossed(4.9f)) DoDown(false);
	if (Crossed(1.3f) || Crossed(5.4f)) DoJumpStart();
	if (Crossed(1.7f) || Crossed(5.9f)) DoJumpEnd();
	if (Crossed(5.7f)) DoDown(true);
	if (Crossed(6.4f)) DoDown(false);
	if (Crossed(7.6f) || Crossed(7.95f)) DoMelee();
	if (Crossed(2.0f))
	{
		const APlayerController* PC = Cast<APlayerController>(GetController());
		UE_LOG(LogTemp, Warning, TEXT("IronDebug actor=%s mesh=%s ext=%s visible=%d cam=%s camrot=%s"), *GetActorLocation().ToString(), *GetMesh()->GetComponentLocation().ToString(), *GetMesh()->Bounds.BoxExtent.ToString(), GetMesh()->IsVisible(), PC && PC->PlayerCameraManager ? *PC->PlayerCameraManager->GetCameraLocation().ToString() : TEXT("none"), PC && PC->PlayerCameraManager ? *PC->PlayerCameraManager->GetCameraRotation().ToString() : TEXT("none"));
		if (PC && PC->PlayerCameraManager)
		{
			FHitResult Hit;
			FCollisionQueryParams Q;
			Q.AddIgnoredActor(this);
			if (GetWorld()->LineTraceSingleByChannel(Hit, PC->PlayerCameraManager->GetCameraLocation(), GetActorLocation(), ECC_Visibility, Q))
			{
				UE_LOG(LogTemp, Warning, TEXT("IronDebug occluder=%s at %s"), *GetNameSafe(Hit.GetActor()), *Hit.ImpactPoint.ToString());
			}
			for (const TCHAR* Bone : { TEXT("root"), TEXT("hips"), TEXT("spine"), TEXT("head"), TEXT("hand.L"), TEXT("foot.R") })
			{
				UE_LOG(LogTemp, Warning, TEXT("IronDebug bone %s pos=%s scale=%s"), Bone, *GetMesh()->GetBoneLocation(Bone).ToString(), *GetMesh()->GetBoneTransform(Bone).GetScale3D().ToString());
			}
			UE_LOG(LogTemp, Warning, TEXT("IronDebug bounds=%s"), *GetMesh()->Bounds.BoxExtent.ToString());
			UE_LOG(LogTemp, Warning, TEXT("IronDebug meshasset=%s anim=%s hidden=%d owner_no_see=%d"), *GetNameSafe(GetMesh()->GetSkeletalMeshAsset()), *GetNameSafe(GetMesh()->GetAnimInstance()), GetMesh()->bHiddenInGame, GetMesh()->bOwnerNoSee);
		}
	}

	FString Dir;
	if (FParse::Value(FCommandLine::Get(), TEXT("IronCapture="), Dir))
	{
		CaptureAccum += DeltaSeconds;
		if (CaptureAccum >= 1.0f / 15.0f)
		{
			CaptureAccum = 0.0f;
			FScreenshotRequest::RequestScreenshot(FString::Printf(TEXT("%s/frame_%04d.png"), *Dir, CaptureFrame++), false, false);
		}
		if (T > 9.5f)
		{
			UKismetSystemLibrary::QuitGame(this, nullptr, EQuitPreference::Quit, false);
		}
	}
}