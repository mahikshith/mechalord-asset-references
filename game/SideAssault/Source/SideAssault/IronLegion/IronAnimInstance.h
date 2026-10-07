#pragma once

#include "CoreMinimal.h"
#include "Animation/AnimInstance.h"
#include "Animation/AnimInstanceProxy.h"
#include "IronAnimInstance.generated.h"

class UAnimSequence;
class UIronAnimInstance;

/** Game-thread snapshot of the trooper that drives one evaluation */
struct FIronAnimInputs
{
	float Speed = 0.0f;
	float VelZ = 0.0f;
	bool bGrounded = true;
	bool bSwimming = false;
	bool bCrouched = false;
	bool bDead = false;
	float AimPitch = 0.0f;
	float ShotAge = 100.0f;
	float MeleeAge = 100.0f;
	float HurtAge = 100.0f;
};

/**
 *  Code-driven pose evaluation for the Iron Legion hero (no anim graph asset):
 *  rifle idle/jog locomotion blended by speed, jump/fall by vertical speed, a crouch
 *  pose, landing squash, mesh-space aim offsets for 8-way aiming, and upper-body layers
 *  for recoil, melee and hit reactions. Death plays full body and holds the last frame.
 */
struct FIronAnimProxy : public FAnimInstanceProxy
{
	FIronAnimProxy() = default;
	explicit FIronAnimProxy(UAnimInstance* Instance) : FAnimInstanceProxy(Instance) {}

	virtual void PreUpdate(UAnimInstance* InAnimInstance, float DeltaSeconds) override;
	virtual void Update(float DeltaSeconds) override;
	virtual bool Evaluate(FPoseContext& Output) override;

	FIronAnimInputs In;
	const UIronAnimInstance* Owner = nullptr;

	// running clocks
	float LocoTime = 0.0f;
	float AirTime = 0.0f;
	float GroundTime = 0.0f;
	float DeathTime = 0.0f;
	float JogBlend = 0.0f;
	float CrouchBlend = 0.0f;
	float AirBlend = 0.0f;
	float AimSmoothed = 0.0f;
	bool bWasGrounded = true;

	// per compact bone weights for the upper-body layer, rebuilt when the bone container changes
	TArray<float> UpperWeights;
	int32 UpperWeightsSerial = -1;

private:
	void Sample(const UAnimSequence* Seq, float Time, bool bLoop, FPoseContext& Out) const;
	void BuildUpperWeights(const FPoseContext& Ctx);
	void LayerUpper(FPoseContext& Base, const FPoseContext& Layer, float Alpha) const;
	void LayerFull(FPoseContext& Base, const FPoseContext& Layer, float Alpha) const;
	void ApplyAdditive(FPoseContext& Base, const UAnimSequence* Seq, float Alpha) const;
};

UCLASS(Transient, NotBlueprintable)
class UIronAnimInstance : public UAnimInstance
{
	GENERATED_BODY()

public:

	UIronAnimInstance();

	UPROPERTY(EditDefaultsOnly, Category="Iron") TObjectPtr<UAnimSequence> Idle;
	UPROPERTY(EditDefaultsOnly, Category="Iron") TObjectPtr<UAnimSequence> Jog;
	UPROPERTY(EditDefaultsOnly, Category="Iron") TObjectPtr<UAnimSequence> JumpUp;
	UPROPERTY(EditDefaultsOnly, Category="Iron") TObjectPtr<UAnimSequence> Fall;
	UPROPERTY(EditDefaultsOnly, Category="Iron") TObjectPtr<UAnimSequence> Land;
	UPROPERTY(EditDefaultsOnly, Category="Iron") TObjectPtr<UAnimSequence> AimUp;
	UPROPERTY(EditDefaultsOnly, Category="Iron") TObjectPtr<UAnimSequence> AimDown;
	UPROPERTY(EditDefaultsOnly, Category="Iron") TObjectPtr<UAnimSequence> Fire;
	UPROPERTY(EditDefaultsOnly, Category="Iron") TObjectPtr<UAnimSequence> Melee;
	UPROPERTY(EditDefaultsOnly, Category="Iron") TObjectPtr<UAnimSequence> HitReact;
	UPROPERTY(EditDefaultsOnly, Category="Iron") TObjectPtr<UAnimSequence> Death;

	/** Jog clip's authored ground speed, used to sync stride to real speed */
	UPROPERTY(EditDefaultsOnly, Category="Iron") float JogAuthoredSpeed = 400.0f;

	/** Time into the landing clip that reads as the deepest crouch */
	UPROPERTY(EditDefaultsOnly, Category="Iron") float CrouchPoseTime = 0.12f;

protected:

	virtual FAnimInstanceProxy* CreateAnimInstanceProxy() override;
	virtual void DestroyAnimInstanceProxy(FAnimInstanceProxy* InProxy) override;
};
