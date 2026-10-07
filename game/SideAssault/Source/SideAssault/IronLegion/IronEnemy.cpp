#include "IronEnemy.h"
#include "IronTrooper.h"
#include "IronProjectile.h"
#include "IronCameraManager.h"
#include "IronFX.h"
#include "Components/AudioComponent.h"
#include "Sound/SoundBase.h"
#include "Animation/AnimSequence.h"
#include "Animation/AnimNodeBase.h"
#include "Components/CapsuleComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "Components/StaticMeshComponent.h"
#include "DrawDebugHelpers.h"
#include "Engine/DamageEvents.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/PlayerController.h"
#include "Kismet/GameplayStatics.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "PhysicsEngine/PhysicsAsset.h"
#include "AIController.h"

AIronEnemy::AIronEnemy()
{
	PrimaryActorTick.bCanEverTick = true;
	AutoPossessAI = EAutoPossessAI::PlacedInWorldOrSpawned;
	AIControllerClass = AAIController::StaticClass();
	bUseControllerRotationYaw = false;
	UCharacterMovementComponent* Move = GetCharacterMovement();
	Move->bOrientRotationToMovement = false;
	Move->bConstrainToPlane = true;
	Move->SetPlaneConstraintNormal(FVector(0.0f, 1.0f, 0.0f));
	Move->bSnapToPlaneAtStart = true;
	Move->GravityScale = 1.75f;
	Move->JumpZVelocity = 820.0f;
	Move->AirControl = 0.6f;
	GetMesh()->SetAnimInstanceClass(UIronEnemyAnimInstance::StaticClass());
	GetMesh()->SetAnimationMode(EAnimationMode::AnimationBlueprint);
	GetMesh()->LightingChannels.bChannel1 = true;
	GetCapsuleComponent()->SetCollisionResponseToChannel(ECC_Camera, ECR_Ignore);
	Tags.Add(TEXT("Enemy"));
}

void AIronEnemy::ApplyRoleDefaults()
{
	UCharacterMovementComponent* Move = GetCharacterMovement();
	float Hp = 4.0f;
	switch (EnemyRole)
	{
	case EIronEnemyRole::Lancer:     Hp = 14.0f; Weight = 4.0f; Move->MaxWalkSpeed = 140.0f; break;
	case EIronEnemyRole::Bulwark:    Hp = 18.0f; Weight = 6.0f; FrontArmour = 0.85f; Move->MaxWalkSpeed = 170.0f; break;
	case EIronEnemyRole::Raider:     Hp = 7.0f;  Weight = 1.6f; Move->MaxWalkSpeed = 430.0f; break;
	case EIronEnemyRole::Sentry:     Hp = 10.0f; Weight = 5.0f; Move->MaxWalkSpeed = 0.0f; break;
	case EIronEnemyRole::Watcher:    Hp = 3.0f;  Weight = 0.8f; Move->MaxFlySpeed = 520.0f; Move->SetMovementMode(MOVE_Flying); Move->BrakingDecelerationFlying = 900.0f; break;
	case EIronEnemyRole::Scuttler:   Hp = 3.0f;  Weight = 1.0f; Move->MaxWalkSpeed = 520.0f; break;
	case EIronEnemyRole::Wallrunner: Hp = 5.0f;  Weight = 1.2f; Move->MaxWalkSpeed = 380.0f; break;
	}
	if (MaxHealth <= 0.0f)
	{
		MaxHealth = Hp;
	}
	Health = MaxHealth;
}

void AIronEnemy::BeginPlay()
{
	Super::BeginPlay();
	ApplyRoleDefaults();
	Home = GetActorLocation();
	NextAttack = 1.0f + FMath::FRand() * 1.2f;
	if (PaintMaterial)
	{
		for (int32 I = 0; I < GetMesh()->GetNumMaterials(); ++I) GetMesh()->SetMaterial(I, PaintMaterial);
	}
	for (USkeletalMesh* Part : ExtraParts)
	{
		if (!Part)
		{
			continue;
		}
		USkeletalMeshComponent* C = NewObject<USkeletalMeshComponent>(this);
		C->SetSkeletalMesh(Part);
		if (PaintMaterial)
		{
			for (int32 I = 0; I < C->GetNumMaterials(); ++I) C->SetMaterial(I, PaintMaterial);
		}
		C->SetupAttachment(GetMesh());
		C->SetLeaderPoseComponent(GetMesh());
		C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		C->LightingChannels.bChannel1 = true;
		C->RegisterComponent();
		for (int32 I = 0; I < C->GetNumMaterials(); ++I)
		{
			Flash.Add(C->CreateAndSetMaterialInstanceDynamic(I));
		}
	}
	for (int32 I = 0; I < GetMesh()->GetNumMaterials(); ++I)
	{
		Flash.Add(GetMesh()->CreateAndSetMaterialInstanceDynamic(I));
	}
	FaceTowards(GetActorLocation().X - 1.0f);  // enemies start facing the hero's side (left)
	if (EnemyRole == EIronEnemyRole::Sentry)
	{
		Beam = NewObject<UStaticMeshComponent>(this);
		Beam->SetStaticMesh(LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Plane.Plane")));
		Beam->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		Beam->CastShadow = false;
		Beam->SetUsingAbsoluteRotation(true);
		Beam->SetUsingAbsoluteScale(true);
		Beam->SetupAttachment(RootComponent);
		Beam->RegisterComponent();
		if (UMaterialInterface* Glow = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/IronLegion/FX/M_IronGlow.M_IronGlow")))
		{
			BeamMid = Beam->CreateDynamicMaterialInstance(0, Glow);
			BeamMid->SetScalarParameterValue(TEXT("Softness"), 1.2f);
		}
		Beam->SetVisibility(false);
		if (USoundBase* Hum = LoadObject<USoundBase>(nullptr, TEXT("/Game/IronLegion/Audio/SFX_LaserLoop.SFX_LaserLoop")))
		{
			BeamHum = NewObject<UAudioComponent>(this);
			BeamHum->SetSound(Hum);
			BeamHum->bAutoActivate = false;
			BeamHum->SetupAttachment(RootComponent);
			BeamHum->RegisterComponent();
		}
	}
}

AIronTrooper* AIronEnemy::FindHero() const
{
	return Cast<AIronTrooper>(UGameplayStatics::GetPlayerPawn(this, 0));
}

void AIronEnemy::FaceTowards(float X)
{
	const float Dir = X >= GetActorLocation().X ? 1.0f : -1.0f;
	SetActorRotation(FRotator(0.0f, Dir > 0.0f ? 0.0f : 180.0f, 0.0f));
}

void AIronEnemy::SetAnim(EIronEnemyAnim State)
{
	if (AnimState != State)
	{
		AnimState = State;
		AnimStateTime = 0.0f;
	}
}

// ------------------------------------------------------------------------------------- tick

void AIronEnemy::Tick(float Dt)
{
	Super::Tick(Dt);
	AnimStateTime += Dt;
	FlashLevel = FMath::Max(0.0f, FlashLevel - Dt * 5.0f);
	for (UMaterialInstanceDynamic* M : Flash)
	{
		if (M)
		{
			M->SetScalarParameterValue(TEXT("HitFlash"), FlashLevel * 2.5f);
		}
	}
	if (bDead)
	{
		DeadTime += Dt;
		if (DeadTime > 4.0f)
		{
			Destroy();
		}
		return;
	}
	AIronTrooper* Hero = FindHero();
	if (!Hero)
	{
		return;
	}
	const float Dist = FVector::Dist2D(Hero->GetActorLocation(), GetActorLocation());
	if (!bAwake)
	{
		bAwake = Dist < WakeRange;
		SetAnim(EIronEnemyAnim::Idle);
		if (!bAwake)
		{
			return;
		}
	}
	Clock += Dt;
	switch (EnemyRole)
	{
	case EIronEnemyRole::Lancer:     TickLancer(Hero, Dt); break;
	case EIronEnemyRole::Bulwark:    TickBulwark(Hero, Dt); break;
	case EIronEnemyRole::Raider:     TickRaider(Hero, Dt); break;
	case EIronEnemyRole::Sentry:     TickSentry(Hero, Dt); break;
	case EIronEnemyRole::Watcher:    TickWatcher(Hero, Dt); break;
	case EIronEnemyRole::Scuttler:   TickScuttler(Hero, Dt); break;
	case EIronEnemyRole::Wallrunner: TickWallrunner(Hero, Dt); break;
	}
}

// ------------------------------------------------------------------------------------- roles

void AIronEnemy::TickLancer(AIronTrooper* Hero, float Dt)
{
	// plant at range; a telegraphed lob every few seconds, back-pedal if crowded
	const FVector H = Hero->GetActorLocation();
	FaceTowards(H.X);
	const float Dx = H.X - GetActorLocation().X;
	if (FMath::Abs(Dx) < 500.0f && AttackTimer <= 0.0f)
	{
		AddMovementInput(FVector(-FMath::Sign(Dx), 0.0f, 0.0f), 1.0f);
		SetAnim(EIronEnemyAnim::Move);
	}
	else if (AttackTimer <= 0.0f)
	{
		SetAnim(EIronEnemyAnim::Idle);
	}
	NextAttack -= Dt;
	if (NextAttack <= 0.0f && AttackTimer <= 0.0f)
	{
		AttackTimer = 0.75f;  // wind-up tell
		SetAnim(EIronEnemyAnim::Attack);
		FlashLevel = 0.6f;
	}
	if (AttackTimer > 0.0f)
	{
		AttackTimer -= Dt;
		if (AttackTimer <= 0.0f)
		{
			FireAt(H, 0.0f, 1.0f, 2.0f, 190.0f, FLinearColor(1.0f, 0.35f, 0.05f));
			NextAttack = 2.8f + FMath::FRand();
		}
	}
}

void AIronEnemy::TickBulwark(AIronTrooper* Hero, float Dt)
{
	// march in behind the armoured front; charge when close
	const FVector H = Hero->GetActorLocation();
	const float Dx = H.X - GetActorLocation().X;
	UCharacterMovementComponent* Move = GetCharacterMovement();
	NextAttack -= Dt;
	if (!bCharging && FMath::Abs(Dx) < 650.0f && NextAttack <= 0.0f)
	{
		bCharging = true;
		AttackTimer = 1.1f;
		Move->MaxWalkSpeed = 820.0f;
		FlashLevel = 0.5f;
	}
	if (bCharging)
	{
		AttackTimer -= Dt;
		AddMovementInput(FVector(Facing(), 0.0f, 0.0f), 1.0f);
		SetAnim(EIronEnemyAnim::Run);
		if (AttackTimer <= 0.0f)
		{
			bCharging = false;
			Move->MaxWalkSpeed = 170.0f;
			NextAttack = 3.5f;
		}
	}
	else
	{
		FaceTowards(H.X);
		if (FMath::Abs(Dx) > 120.0f)
		{
			AddMovementInput(FVector(FMath::Sign(Dx), 0.0f, 0.0f), 1.0f);
			SetAnim(EIronEnemyAnim::Move);
		}
		else
		{
			SetAnim(EIronEnemyAnim::Attack);
		}
	}
	ContactDamage(Hero, 130.0f, 1.0f);
}

void AIronEnemy::TickRaider(AIronTrooper* Hero, float Dt)
{
	// keep a mid range, hop between levels, three-round bursts
	const FVector H = Hero->GetActorLocation();
	FaceTowards(H.X);
	const float Dx = H.X - GetActorLocation().X;
	const float Want = 620.0f;
	const float Err = FMath::Abs(Dx) - Want;
	if (FMath::Abs(Err) > 120.0f && BurstLeft == 0)
	{
		AddMovementInput(FVector(FMath::Sign(Dx) * FMath::Sign(Err), 0.0f, 0.0f), 1.0f);
		SetAnim(EIronEnemyAnim::Run);
	}
	else if (BurstLeft == 0)
	{
		SetAnim(EIronEnemyAnim::Idle);
	}
	if (GetCharacterMovement()->IsMovingOnGround() && (H.Z > GetActorLocation().Z + 150.0f || FMath::FRand() < Dt * 0.25f))
	{
		Jump();
	}
	NextAttack -= Dt;
	if (NextAttack <= 0.0f && BurstLeft == 0)
	{
		BurstLeft = 3;
		AttackTimer = 0.25f;
		SetAnim(EIronEnemyAnim::Attack);
	}
	if (BurstLeft > 0)
	{
		AttackTimer -= Dt;
		if (AttackTimer <= 0.0f)
		{
			FireAt(H + FVector(0.0f, 0.0f, 30.0f), 1700.0f, 0.0f, 1.0f, 0.0f, FLinearColor(1.0f, 0.12f, 0.05f));
			--BurstLeft;
			AttackTimer = 0.13f;
			if (BurstLeft == 0)
			{
				NextAttack = 1.8f + FMath::FRand() * 0.8f;
			}
		}
	}
}

void AIronEnemy::TickSentry(AIronTrooper* Hero, float Dt)
{
	// hold position; a red laser line telegraphs, then a sweeping beam burns along it
	const FVector H = Hero->GetActorLocation();
	FaceTowards(H.X);
	NextAttack -= Dt;
	const FVector Eye = GetActorLocation() + FVector(Facing() * 40.0f, 0.0f, GetCapsuleComponent()->GetScaledCapsuleHalfHeight() * 0.6f);
	if (NextAttack <= 0.0f && AttackTimer <= 0.0f)
	{
		AttackTimer = 2.0f;  // 0.8 s tell + 1.2 s sweep
		const FVector To = H - Eye;
		BeamAngle = FMath::RadiansToDegrees(FMath::Atan2(To.Z, FMath::Abs(To.X))) + 18.0f;
		SetAnim(EIronEnemyAnim::Attack);
	}
	if (AttackTimer > 0.0f)
	{
		AttackTimer -= Dt;
		const bool bFiring = AttackTimer < 1.2f;
		if (bFiring)
		{
			BeamAngle -= Dt * 30.0f;  // sweep downward through the hero's line
		}
		const float Rad = FMath::DegreesToRadians(BeamAngle);
		const FVector Dir(FMath::Cos(Rad) * Facing(), 0.0f, FMath::Sin(Rad));
		FHitResult Hit;
		FCollisionQueryParams Q(SCENE_QUERY_STAT(IronBeam), false, this);
		const FVector End = Eye + Dir * 2200.0f;
		const bool bHit = GetWorld()->LineTraceSingleByChannel(Hit, Eye, End, ECC_Visibility, Q);
		const FVector Stop = bHit ? Hit.ImpactPoint : End;
		if (Beam)
		{
			// a soft glowing strip from the eye to the hit point: thin red tell, then a hot beam
			const FVector Mid = (Eye + Stop) * 0.5f + FVector(0.0f, 35.0f, 0.0f);
			const float Len = FVector::Dist(Eye, Stop);
			Beam->SetVisibility(true);
			Beam->SetWorldLocation(Mid);
			Beam->SetWorldRotation(FRotator(BeamAngle, Facing() > 0.0f ? 0.0f : 180.0f, 90.0f));
			Beam->SetWorldScale3D(FVector(Len / 100.0f, bFiring ? 0.32f : 0.06f, 1.0f));
			if (BeamMid)
			{
				BeamMid->SetVectorParameterValue(TEXT("Color"), bFiring ? FLinearColor(1.0f, 0.3f, 0.12f) : FLinearColor(1.0f, 0.05f, 0.03f));
				BeamMid->SetScalarParameterValue(TEXT("Intensity"), bFiring ? 60.0f : 18.0f);
			}
			if (bFiring && BeamHum && !BeamHum->IsPlaying())
			{
				BeamHum->Play();
			}
			if (bFiring && bHit && FMath::FRand() < 0.35f)
			{
				UIronFX::Impact(this, Stop, FLinearColor(1.0f, 0.35f, 0.1f), false);
			}
		}
		if (bFiring && bHit && Hit.GetActor() == Hero)
		{
			UGameplayStatics::ApplyDamage(Hero, 1.0f, GetController(), this, nullptr);
		}
		if (AttackTimer <= 0.0f)
		{
			NextAttack = 2.2f + FMath::FRand();
			SetAnim(EIronEnemyAnim::Idle);
			if (Beam) Beam->SetVisibility(false);
			if (BeamHum) BeamHum->Stop();
		}
	}
}

void AIronEnemy::TickWatcher(AIronTrooper* Hero, float Dt)
{
	// weave above the hero, then commit to a dive and climb back out
	UCharacterMovementComponent* Move = GetCharacterMovement();
	if (Move->MovementMode != MOVE_Flying)
	{
		Move->SetMovementMode(MOVE_Flying);
	}
	const FVector H = Hero->GetActorLocation();
	NextAttack -= Dt;
	FVector Goal;
	if (AttackTimer > 0.0f)
	{
		AttackTimer -= Dt;
		Goal = DiveTarget;
		Move->MaxFlySpeed = 900.0f;
		SetAnim(EIronEnemyAnim::Attack);
		ContactDamage(Hero, 90.0f, 1.0f);
	}
	else
	{
		Move->MaxFlySpeed = 420.0f;
		Goal = H + FVector(-Hero->GetFacing() * 260.0f + FMath::Sin(Clock * 1.7f) * 180.0f, 0.0f, 300.0f + FMath::Sin(Clock * 2.9f) * 50.0f);
		SetAnim(EIronEnemyAnim::Move);
		if (NextAttack <= 0.0f)
		{
			DiveTarget = H + FVector(0.0f, 0.0f, 20.0f);
			AttackTimer = 0.9f;
			NextAttack = 3.6f + FMath::FRand();
			FlashLevel = 0.5f;
		}
	}
	FaceTowards(H.X);
	const FVector To = Goal - GetActorLocation();
	if (To.Size() > 20.0f)
	{
		AddMovementInput(To.GetSafeNormal(), 1.0f);
	}
}

void AIronEnemy::TickScuttler(AIronTrooper* Hero, float Dt)
{
	// run straight at the hero and detonate on contact
	const FVector H = Hero->GetActorLocation();
	FaceTowards(H.X);
	AddMovementInput(FVector(FMath::Sign(H.X - GetActorLocation().X), 0.0f, 0.0f), 1.0f);
	SetAnim(EIronEnemyAnim::Run);
	if (FVector::Dist(H, GetActorLocation()) < 110.0f)
	{
		Explode(220.0f, 2.0f);
		Die(FVector(0.0f, 0.0f, 400.0f));
	}
}

void AIronEnemy::TickWallrunner(AIronTrooper* Hero, float Dt)
{
	// skitter in, then pounce in a long arc
	const FVector H = Hero->GetActorLocation();
	FaceTowards(H.X);
	const float Dx = H.X - GetActorLocation().X;
	NextAttack -= Dt;
	UCharacterMovementComponent* Move = GetCharacterMovement();
	if (Move->IsMovingOnGround())
	{
		if (FMath::Abs(Dx) < 650.0f && NextAttack <= 0.0f)
		{
			const float T = 0.7f;
			const float G = -GetWorld()->GetGravityZ() * Move->GravityScale;
			LaunchCharacter(FVector(Dx / T, 0.0f, (H.Z - GetActorLocation().Z) / T + 0.5f * G * T), true, true);
			NextAttack = 2.2f;
			SetAnim(EIronEnemyAnim::Attack);
		}
		else
		{
			AddMovementInput(FVector(FMath::Sign(Dx), 0.0f, 0.0f), 1.0f);
			SetAnim(EIronEnemyAnim::Run);
		}
	}
	ContactDamage(Hero, 100.0f, 1.0f);
}

// ------------------------------------------------------------------------------- combat

void AIronEnemy::FireAt(const FVector& Target, float Speed, float Gravity, float Damage, float Radius, const FLinearColor& Color)
{
	const FVector Muzzle = GetActorLocation() + FVector(Facing() * 70.0f, 0.0f, GetCapsuleComponent()->GetScaledCapsuleHalfHeight() * 0.45f);
	FActorSpawnParameters P;
	P.Owner = this;
	P.Instigator = this;
	P.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
	AIronProjectile* Round = GetWorld()->SpawnActor<AIronProjectile>(AIronProjectile::StaticClass(), Muzzle, FRotator::ZeroRotator, P);
	if (!Round)
	{
		return;
	}
	Round->Damage = Damage;
	Round->ExplosionRadius = Radius;
	Round->SetTracerColor(Color);
	UIronFX::MuzzleFlash(this, Muzzle, (Target - Muzzle).GetSafeNormal(), Color, Gravity > 0.0f);
	UIronFX::Sound(this, Gravity > 0.0f ? TEXT("SFX_Explosion") : TEXT("SFX_EnemyShot"), Muzzle, Gravity > 0.0f ? 0.35f : 0.45f, Gravity > 0.0f ? 1.6f : 1.0f);
	if (Gravity > 0.0f)
	{
		// ballistic lob that lands on the target after a readable flight time
		const float G = -GetWorld()->GetGravityZ() * Gravity;
		const FVector D = Target - Muzzle;
		const float T = FMath::Clamp(FMath::Abs(D.X) / 650.0f, 0.9f, 1.7f);
		Round->FireWithVelocity(FVector(D.X / T, 0.0f, D.Z / T + 0.5f * G * T), Gravity, this);
	}
	else
	{
		Round->Fire(Target - Muzzle, Speed, this);
	}
}

void AIronEnemy::ContactDamage(AIronTrooper* Hero, float Radius, float Damage)
{
	if (FVector::Dist(Hero->GetActorLocation(), GetActorLocation()) < Radius + Hero->GetCapsuleComponent()->GetScaledCapsuleRadius())
	{
		UGameplayStatics::ApplyDamage(Hero, Damage, GetController(), this, nullptr);
	}
}

void AIronEnemy::Explode(float Radius, float Damage)
{
	TArray<AActor*> Ignore;
	Ignore.Add(this);
	UGameplayStatics::ApplyRadialDamage(this, Damage, GetActorLocation(), Radius, nullptr, Ignore, this, GetController(), true);
	UIronFX::Explosion(this, GetActorLocation(), Radius, false);
}

float AIronEnemy::TakeDamage(float Damage, FDamageEvent const& DamageEvent, AController* EventInstigator, AActor* DamageCauser)
{
	if (bDead || Damage <= 0.0f)
	{
		return 0.0f;
	}
	// enemies don't hurt each other
	if (DamageCauser && (DamageCauser->ActorHasTag(TEXT("Enemy")) || (DamageCauser->GetOwner() && DamageCauser->GetOwner()->ActorHasTag(TEXT("Enemy")))))
	{
		return 0.0f;
	}
	bAwake = true;
	FVector From = DamageCauser ? DamageCauser->GetActorLocation() : GetActorLocation() - GetActorForwardVector();
	const float HitSide = FMath::Sign(From.X - GetActorLocation().X);
	float Taken = Damage;
	if (FrontArmour > 0.0f && HitSide == Facing() && From.Z < GetActorLocation().Z + GetCapsuleComponent()->GetScaledCapsuleHalfHeight())
	{
		// rounds glance off the shield face; hit it from above or behind
		Taken *= (1.0f - FrontArmour);
		FlashLevel = FMath::Max(FlashLevel, 0.25f);
		UIronFX::Impact(this, GetActorLocation() + FVector(Facing() * GetCapsuleComponent()->GetScaledCapsuleRadius(), 0.0f, 20.0f), FLinearColor(1.0f, 0.8f, 0.5f), true);
	}
	else
	{
		FlashLevel = 1.0f;
	}
	Health -= Taken;
	const FVector Push(-HitSide * 260.0f / Weight, 0.0f, 60.0f / Weight);
	if (GetCharacterMovement()->IsMovingOnGround() || GetCharacterMovement()->MovementMode == MOVE_Flying)
	{
		LaunchCharacter(Push, false, false);
	}
	if (Health <= 0.0f)
	{
		Die(FVector(-HitSide * 700.0f, 0.0f, 500.0f));
	}
	else if (Taken >= 1.0f && AnimState != EIronEnemyAnim::Attack)
	{
		SetAnim(EIronEnemyAnim::Hit);
	}
	return Taken;
}

void AIronEnemy::Die(const FVector& Impulse)
{
	if (bDead)
	{
		return;
	}
	bDead = true;
	SetAnim(EIronEnemyAnim::Death);
	GetCharacterMovement()->DisableMovement();
	GetCapsuleComponent()->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	FlashLevel = 1.0f;
	if (Beam) Beam->SetVisibility(false);
	if (BeamHum) BeamHum->Stop();
	const float Size = GetCapsuleComponent()->GetScaledCapsuleHalfHeight();
	UIronFX::Explosion(this, GetActorLocation(), FMath::Clamp(Size * 1.6f, 90.0f, 320.0f), Weight >= 4.0f);
	UIronFX::Debris(this, GetActorLocation(), Weight >= 4.0f ? 9 : 4, FMath::Clamp(Size * 0.35f, 12.0f, 45.0f), FLinearColor(0.12f, 0.05f, 0.04f));
	USkeletalMeshComponent* M = GetMesh();
	if (M->GetPhysicsAsset())
	{
		// the rig goes limp and is thrown by the killing blow
		M->SetCollisionProfileName(TEXT("Ragdoll"));
		M->SetAllBodiesSimulatePhysics(true);
		M->SetSimulatePhysics(true);
		M->AddImpulse(Impulse * 1.0f, NAME_None, true);
	}
}

// ------------------------------------------------------------------------------- animation

void FIronEnemyAnimProxy::PreUpdate(UAnimInstance* InAnimInstance, float DeltaSeconds)
{
	FAnimInstanceProxy::PreUpdate(InAnimInstance, DeltaSeconds);
	const AIronEnemy* E = Cast<AIronEnemy>(InAnimInstance->GetOwningActor());
	if (!E)
	{
		return;
	}
	const UAnimSequence* Want = nullptr;
	bool bLoop = true;
	switch (E->AnimState)
	{
	case EIronEnemyAnim::Idle:   Want = E->AnimIdle; break;
	case EIronEnemyAnim::Move:   Want = E->AnimMove ? E->AnimMove : E->AnimRun; break;
	case EIronEnemyAnim::Run:    Want = E->AnimRun ? E->AnimRun : E->AnimMove; break;
	case EIronEnemyAnim::Attack: Want = E->AnimAttack; break;
	case EIronEnemyAnim::Hit:    Want = E->AnimHit; bLoop = false; break;
	case EIronEnemyAnim::Death:  Want = E->AnimDeath; bLoop = false; break;
	}
	if (!Want)
	{
		Want = E->AnimIdle;
	}
	if (Want != Current)
	{
		Previous = Current;
		PreviousTime = CurrentTime;
		bPreviousLoops = bCurrentLoops;
		Current = Want;
		CurrentTime = 0.0f;
		bCurrentLoops = bLoop;
		Blend = Previous ? 0.0f : 1.0f;
	}
	const float Speed = E->GetVelocity().Size2D();
	PlayRate = (E->AnimState == EIronEnemyAnim::Move || E->AnimState == EIronEnemyAnim::Run) ? FMath::Clamp(Speed / 250.0f, 0.7f, 1.8f) : 1.0f;
	CurrentTime += DeltaSeconds * PlayRate;
	PreviousTime += DeltaSeconds;
	Blend = FMath::Min(1.0f, Blend + DeltaSeconds / 0.15f);
	// a finished hit reaction hands back to idle
	if (E->AnimState == EIronEnemyAnim::Hit && Current && CurrentTime > Current->GetPlayLength())
	{
		const_cast<AIronEnemy*>(E)->AnimState = EIronEnemyAnim::Idle;
	}
}

static void IronSampleSeq(const UAnimSequence* Seq, float Time, bool bLoop, FPoseContext& Out)
{
	if (!Seq)
	{
		Out.ResetToRefPose();
		return;
	}
	const float Len = FMath::Max(Seq->GetPlayLength(), 0.01f);
	const float T = bLoop ? FMath::Fmod(Time, Len) : FMath::Clamp(Time, 0.0f, Len);
	FAnimationPoseData Data(Out);
	Seq->GetAnimationPose(Data, FAnimExtractContext(static_cast<double>(T), false, {}, bLoop));
	const FCompactPoseBoneIndex Root(0);
	Out.Pose[Root] = Out.Pose.GetRefPose(Root);
}

bool FIronEnemyAnimProxy::Evaluate(FPoseContext& Output)
{
	IronSampleSeq(Current, CurrentTime, bCurrentLoops, Output);
	if (Previous && Blend < 1.0f)
	{
		FPoseContext Old(Output);
		IronSampleSeq(Previous, PreviousTime, bPreviousLoops, Old);
		for (int32 I = 0; I < Output.Pose.GetNumBones(); ++I)
		{
			const FCompactPoseBoneIndex B(I);
			const FTransform New = Output.Pose[B];
			Output.Pose[B].Blend(Old.Pose[B], New, Blend);
		}
	}
	return true;
}
