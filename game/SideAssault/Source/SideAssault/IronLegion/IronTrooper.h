#pragma once

#include "CoreMinimal.h"
#include "SideScrollingCharacter.h"
#include "IronTrooper.generated.h"

class UInputAction;
class UStaticMeshComponent;
class UInputMappingContext;
class AIronProjectile;

/**
 *  Iron Legion hero for the side-scrolling assault.
 *  Builds on the template's run / jump / coyote / wall-jump / drop-through movement and adds
 *  Contra-style combat: 8-way aim, held auto-fire, crouch, melee, swimming with a dive that
 *  dodges bullets, health with hit recovery, and a free respawn at the last checkpoint.
 *  Input actions for the combat verbs are created in code so no extra assets are needed.
 */
UCLASS()
class AIronTrooper : public ASideScrollingCharacter
{
	GENERATED_BODY()

public:

	AIronTrooper();

	// ---- tuning -------------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="Iron|Health")
	float MaxHealth = 6.0f;

	/** Seconds of invulnerability after taking a hit */
	UPROPERTY(EditAnywhere, Category="Iron|Health")
	float HitRecoveryTime = 1.1f;

	UPROPERTY(EditAnywhere, Category="Iron|Health")
	float RespawnDelay = 1.6f;

	UPROPERTY(EditAnywhere, Category="Iron|Weapon")
	float FireInterval = 0.11f;

	UPROPERTY(EditAnywhere, Category="Iron|Weapon")
	float BulletSpeed = 3600.0f;

	UPROPERTY(EditAnywhere, Category="Iron|Weapon")
	float BulletDamage = 1.0f;

	UPROPERTY(EditAnywhere, Category="Iron|Weapon")
	TSubclassOf<AIronProjectile> ProjectileClass;

	/** Rifle prop held in the right hand */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Iron|Weapon")
	UStaticMeshComponent* Weapon;

	/** Bone the rifle attaches to and its grip offset relative to that bone */
	UPROPERTY(EditAnywhere, Category="Iron|Weapon")
	FName WeaponBone = TEXT("hand_R");

	UPROPERTY(EditAnywhere, Category="Iron|Weapon")
	FTransform WeaponGrip;

	/** Extra mesh yaw while standing so the rifle stance reads in profile (deg); fades out when running */
	UPROPERTY(EditAnywhere, Category="Iron|Animation")
	float StanceYaw = -40.0f;

	float StanceYawCurrent = 0.0f;

	/** Side-scroll camera distance (cm); closer reads better on a phone */
	UPROPERTY(EditAnywhere, Category="Iron|Camera")
	float CameraDistance = 850.0f;

	UPROPERTY(EditAnywhere, Category="Iron|Melee")
	float MeleeRange = 110.0f;

	UPROPERTY(EditAnywhere, Category="Iron|Melee")
	float MeleeDamage = 4.0f;

	UPROPERTY(EditAnywhere, Category="Iron|Melee")
	float MeleeCooldown = 0.45f;

	// ---- state read by the animation instance and UI ----------------------------------------

	UPROPERTY(BlueprintReadOnly, Category="Iron|State")
	float Health = 6.0f;

	/** Aim pitch in degrees: +90 straight up, -90 straight down */
	UPROPERTY(BlueprintReadOnly, Category="Iron|State")
	float AimPitch = 0.0f;

	UPROPERTY(BlueprintReadOnly, Category="Iron|State")
	bool bFiring = false;

	UPROPERTY(BlueprintReadOnly, Category="Iron|State")
	bool bSubmerged = false;

	UPROPERTY(BlueprintReadOnly, Category="Iron|State")
	bool bDead = false;

	/** World time of the last shot, last melee swing and last hit taken */
	float LastShotTime = -100.0f;
	float LastMeleeTime = -100.0f;
	float LastHurtTime = -100.0f;

	UFUNCTION(BlueprintPure, Category="Iron|State")
	bool IsInvulnerable() const;

	UFUNCTION(BlueprintPure, Category="Iron|State")
	float GetFacing() const;

	/** Sets where the hero respawns after falling or dying */
	UFUNCTION(BlueprintCallable, Category="Iron")
	void SetCheckpoint(const FVector& Location);

	// ---- input entry points (keyboard, gamepad and touch UI all route here) -----------------

	UFUNCTION(BlueprintCallable, Category="Input")
	void DoFire(bool bPressed);

	UFUNCTION(BlueprintCallable, Category="Input")
	void DoAimUp(bool bPressed);

	UFUNCTION(BlueprintCallable, Category="Input")
	void DoDown(bool bPressed);

	UFUNCTION(BlueprintCallable, Category="Input")
	void DoMelee();

	virtual void DoMove(float Forward) override;

protected:

	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;
	virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;
	virtual void PawnClientRestart() override;
	virtual float TakeDamage(float Damage, struct FDamageEvent const& DamageEvent, AController* EventInstigator, AActor* DamageCauser) override;
	virtual void FellOutOfWorld(const class UDamageType& DmgType) override;

	void UpdateAim();
	void UpdateSwim(float DeltaSeconds);
	void FireShot();
	FVector MuzzleLocation(const FVector& AimDir) const;
	void Die();
	void Respawn();

	UPROPERTY(Transient)
	UInputMappingContext* CombatContext;

	UPROPERTY(Transient)
	UInputAction* FireAction;

	UPROPERTY(Transient)
	UInputAction* AimUpAction;

	UPROPERTY(Transient)
	UInputAction* DownAction;

	UPROPERTY(Transient)
	UInputAction* MeleeAction;

	/** Scripted input for automated gameplay captures (-IronAutopilot, -IronCapture=<dir>) */
	void RunAutopilot(float DeltaSeconds);
	float AutopilotTime = 0.0f;
	int32 CaptureFrame = 0;
	float CaptureAccum = 0.0f;

	bool bAimUpHeld = false;
	bool bDownHeld = false;
	float DiveHeldTime = 0.0f;
	FVector Checkpoint = FVector::ZeroVector;
	FTimerHandle RespawnTimer;
};
