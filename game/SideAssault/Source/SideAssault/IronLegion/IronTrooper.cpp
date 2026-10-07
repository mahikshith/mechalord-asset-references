#include "IronTrooper.h"
#include "IronProjectile.h"
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
}

void AIronTrooper::BeginPlay()
{
	Super::BeginPlay();
	Health = MaxHealth;
	Checkpoint = GetActorLocation();
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

	const float Now = GetWorld()->GetTimeSeconds();
	if (bFiring && !bSubmerged && Now - LastShotTime >= FireInterval)
	{
		LastShotTime = Now;
		FireShot();
	}
}

void AIronTrooper::UpdateAim()
{
	const bool bGrounded = GetCharacterMovement()->IsMovingOnGround();
	const bool bMoving = FMath::Abs(ActionValueY) >= 0.2f;
	float Target = 0.0f;
	if (bAimUpHeld)
	{
		Target = bMoving ? 45.0f : 90.0f;
	}
	else if (bDownHeld && !bIsCrouched && !GetCharacterMovement()->IsSwimming())
	{
		// on the ground down+move angles low; in the air down fires straight down
		Target = bGrounded ? (bMoving ? -45.0f : 0.0f) : (bMoving ? -45.0f : -90.0f);
	}
	AimPitch = Target;
}

void AIronTrooper::UpdateSwim(float DeltaSeconds)
{
	UCharacterMovementComponent* Move = GetCharacterMovement();
	if (!Move->IsSwimming())
	{
		bSubmerged = false;
		DiveHeldTime = 0.0f;
		return;
	}
	if (bDownHeld)
	{
		// dive: push under and stay down, out of the line of fire
		AddMovementInput(FVector(0.0f, 0.0f, -1.0f), 1.0f);
		DiveHeldTime += DeltaSeconds;
	}
	else
	{
		DiveHeldTime = 0.0f;
	}
	bSubmerged = DiveHeldTime > 0.2f;
}

FVector AIronTrooper::MuzzleLocation(const FVector& AimDir) const
{
	const float Height = bIsCrouched ? 18.0f : (GetCharacterMovement()->IsSwimming() ? 40.0f : 52.0f);
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
}

// ------------------------------------------------------------------------------------- health

float AIronTrooper::TakeDamage(float Damage, FDamageEvent const& DamageEvent, AController* EventInstigator, AActor* DamageCauser)
{
	if (IsInvulnerable() || Damage <= 0.0f)
	{
		return 0.0f;
	}
	Health = FMath::Max(0.0f, Health - Damage);
	LastHurtTime = GetWorld()->GetTimeSeconds();
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
