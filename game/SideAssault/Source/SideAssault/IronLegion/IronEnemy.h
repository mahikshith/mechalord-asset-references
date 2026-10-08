#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "Animation/AnimInstance.h"
#include "Animation/AnimInstanceProxy.h"
#include "IronEnemy.generated.h"

class UAnimSequence;
class AIronTrooper;
class UMaterialInstanceDynamic;
class UStaticMeshComponent;
class UAudioComponent;

UENUM(BlueprintType)
enum class EIronEnemyRole : uint8
{
	Lancer,     // long-range artillery mech: plants, telegraphs, lobs explosive shells
	Bulwark,    // armoured front deflects bullets; marches in and charges
	Raider,     // fast and jumpy, fires bursts
	Sentry,     // holds a ledge and sweeps a beam
	Watcher,    // flying drone that weaves and dives
	Scuttler,   // ground rusher that detonates on contact
	Wallrunner  // pounces from heights with long leaps
};

UENUM()
enum class EIronEnemyAnim : uint8 { Idle, Move, Run, Attack, Hit, Death };

/**
 *  One enemy of the Tyrant's army. Each role has its own movement, attack, weight
 *  and tell; all share hit reactions (warm ember flash, knockback by weight) and a
 *  physics death (the rig goes limp and is thrown, then the wreck smoulders and fades).
 */
UCLASS()
class AIronEnemy : public ACharacter
{
	GENERATED_BODY()

public:

	AIronEnemy();

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="Enemy") EIronEnemyRole EnemyRole = EIronEnemyRole::Raider;
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="Enemy") float MaxHealth = 0.0f;  // 0 = role default
	UPROPERTY(BlueprintReadOnly, Category="Enemy") float Health = 1.0f;
	UPROPERTY(BlueprintReadOnly, Category="Enemy") bool bDead = false;

	/** Distance at which the enemy wakes up and engages */
	UPROPERTY(EditAnywhere, Category="Enemy") float WakeRange = 1500.0f;

	UPROPERTY(EditAnywhere, Category="Enemy|Anim") TObjectPtr<UAnimSequence> AnimIdle;
	UPROPERTY(EditAnywhere, Category="Enemy|Anim") TObjectPtr<UAnimSequence> AnimMove;
	UPROPERTY(EditAnywhere, Category="Enemy|Anim") TObjectPtr<UAnimSequence> AnimRun;
	UPROPERTY(EditAnywhere, Category="Enemy|Anim") TObjectPtr<UAnimSequence> AnimAttack;
	UPROPERTY(EditAnywhere, Category="Enemy|Anim") TObjectPtr<UAnimSequence> AnimHit;
	UPROPERTY(EditAnywhere, Category="Enemy|Anim") TObjectPtr<UAnimSequence> AnimDeath;

	/** Faction paint applied to every slot of the body and extra parts at spawn */
	UPROPERTY(EditAnywhere, Category="Enemy") TObjectPtr<UMaterialInterface> PaintMaterial;

	/** Extra skinned parts that share the main skeleton (glTF packs split bodies and legs) */
	UPROPERTY(EditAnywhere, Category="Enemy") TArray<TObjectPtr<USkeletalMesh>> ExtraParts;

	/** Current animation state, read by UIronEnemyAnimInstance */
	EIronEnemyAnim AnimState = EIronEnemyAnim::Idle;
	float AnimStateTime = 0.0f;

	virtual void Tick(float DeltaSeconds) override;
	virtual float TakeDamage(float Damage, struct FDamageEvent const& DamageEvent, AController* EventInstigator, AActor* DamageCauser) override;

protected:

	virtual void BeginPlay() override;

	void ApplyRoleDefaults();
	AIronTrooper* FindHero() const;
	float Facing() const { return GetActorForwardVector().X >= 0.0f ? 1.0f : -1.0f; }
	void FaceTowards(float X);

	/** Walk along X with obstacle sense: climbs low steps, hops (agile roles) or holds at walls,
	 *  never leaves its patrol range, and keeps a little space from the hero. Returns false if held. */
	bool Walk(float Dir, float Scale = 1.0f);
	bool BlockedAhead(float Dir, float& OutTopZ) const;
	bool HasLineOfSight(const FVector& From, const AActor* Target) const;
	void DrawBeam(const FVector& Eye, const FVector& Stop, bool bFiring, bool bHit);
	void HideBeam();
	void SetAnim(EIronEnemyAnim State);
	void FireAt(const FVector& Target, float Speed, float Gravity, float Damage, float Radius, const FLinearColor& Color);
	void ContactDamage(AIronTrooper* Hero, float Radius, float Damage);
	void Die(const FVector& Impulse);
	void Explode(float Radius, float Damage);

	void TickLancer(AIronTrooper* Hero, float Dt);
	void TickBulwark(AIronTrooper* Hero, float Dt);
	void TickRaider(AIronTrooper* Hero, float Dt);
	void TickSentry(AIronTrooper* Hero, float Dt);
	void TickWatcher(AIronTrooper* Hero, float Dt);
	void TickScuttler(AIronTrooper* Hero, float Dt);
	void TickWallrunner(AIronTrooper* Hero, float Dt);

	// shared behaviour clock and scratch state
	float Clock = 0.0f;
	float NextAttack = 1.5f;
	float AttackTimer = 0.0f;
	int32 BurstLeft = 0;
	bool bAwake = false;
	bool bCharging = false;
	FVector Home = FVector::ZeroVector;
	FVector DiveTarget = FVector::ZeroVector;
	float BeamAngle = 0.0f;
	float Weight = 1.0f;          // knockback divisor
	float PatrolRange = 900.0f;   // how far from home the enemy will roam
	bool bAgile = false;          // can hop over obstacles
	float FrontArmour = 0.0f;     // fraction of frontal damage absorbed

	UPROPERTY(Transient) TArray<UMaterialInstanceDynamic*> Flash;
	UPROPERTY(Transient) UStaticMeshComponent* Beam = nullptr;
	UPROPERTY(Transient) UMaterialInstanceDynamic* BeamMid = nullptr;
	UPROPERTY(Transient) UAudioComponent* BeamHum = nullptr;
	UPROPERTY(Transient) UStaticMeshComponent* BeamCore = nullptr;
	UPROPERTY(Transient) UMaterialInstanceDynamic* BeamCoreMid = nullptr;
	UPROPERTY(Transient) UStaticMeshComponent* BeamHit = nullptr;
	UPROPERTY(Transient) UMaterialInstanceDynamic* BeamHitMid = nullptr;
	float SweepFrom = 0.0f;
	float SweepTo = 0.0f;
	float FlashLevel = 0.0f;
	float DeadTime = 0.0f;
};

/** Crossfading single-clip player driven by AIronEnemy::AnimState (no anim graph asset). */
struct FIronEnemyAnimProxy : public FAnimInstanceProxy
{
	FIronEnemyAnimProxy() = default;
	explicit FIronEnemyAnimProxy(UAnimInstance* Instance) : FAnimInstanceProxy(Instance) {}

	virtual void PreUpdate(UAnimInstance* InAnimInstance, float DeltaSeconds) override;
	virtual bool Evaluate(FPoseContext& Output) override;

	const UAnimSequence* Current = nullptr;
	const UAnimSequence* Previous = nullptr;
	float CurrentTime = 0.0f;
	float PreviousTime = 0.0f;
	float Blend = 1.0f;
	bool bCurrentLoops = true;
	bool bPreviousLoops = true;
	float PlayRate = 1.0f;
};

UCLASS(Transient, NotBlueprintable)
class UIronEnemyAnimInstance : public UAnimInstance
{
	GENERATED_BODY()

protected:

	virtual FAnimInstanceProxy* CreateAnimInstanceProxy() override { return new FIronEnemyAnimProxy(this); }
	virtual void DestroyAnimInstanceProxy(FAnimInstanceProxy* InProxy) override { delete InProxy; }
};
