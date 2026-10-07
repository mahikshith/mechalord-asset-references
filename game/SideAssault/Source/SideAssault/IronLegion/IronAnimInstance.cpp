#include "IronAnimInstance.h"
#include "IronTrooper.h"
#include "Animation/AnimSequence.h"
#include "Animation/AnimNodeBase.h"
#include "AnimationRuntime.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "UObject/ConstructorHelpers.h"

#define IRON_ANIM(Name) TEXT("/Game/IronLegion/Characters/Hero/Anims/" Name "_Iron." Name "_Iron")

UIronAnimInstance::UIronAnimInstance()
{
	struct FLoad
	{
		static UAnimSequence* Get(const TCHAR* Path)
		{
			ConstructorHelpers::FObjectFinder<UAnimSequence> F(Path);
			return F.Succeeded() ? F.Object : nullptr;
		}
	};
	Idle = FLoad::Get(IRON_ANIM("MF_Rifle_Idle_ADS"));
	Jog = FLoad::Get(IRON_ANIM("MF_Rifle_Jog_Fwd"));
	JumpUp = FLoad::Get(IRON_ANIM("MM_Rifle_Jump_Start_Loop"));
	Fall = FLoad::Get(IRON_ANIM("MM_Rifle_Jump_Fall_Loop"));
	Land = FLoad::Get(IRON_ANIM("MM_Rifle_Jump_Fall_Land"));
	AimUp = FLoad::Get(IRON_ANIM("MM_Rifle_Idle_ADS_AO_CU"));
	AimDown = FLoad::Get(IRON_ANIM("MM_Rifle_Idle_ADS_AO_CD"));
	Fire = FLoad::Get(IRON_ANIM("MM_Rifle_Fire"));
	Melee = FLoad::Get(IRON_ANIM("MM_Attack_01"));
	HitReact = FLoad::Get(IRON_ANIM("MM_HitReact_Front_Lgt_01"));
	Death = FLoad::Get(IRON_ANIM("MM_Death_Front_01"));
}

FAnimInstanceProxy* UIronAnimInstance::CreateAnimInstanceProxy()
{
	FIronAnimProxy* Proxy = new FIronAnimProxy(this);
	Proxy->Owner = this;
	return Proxy;
}

void UIronAnimInstance::DestroyAnimInstanceProxy(FAnimInstanceProxy* InProxy)
{
	delete InProxy;
}

// --------------------------------------------------------------------------------- update

void FIronAnimProxy::PreUpdate(UAnimInstance* InAnimInstance, float DeltaSeconds)
{
	FAnimInstanceProxy::PreUpdate(InAnimInstance, DeltaSeconds);
	const AIronTrooper* T = Cast<AIronTrooper>(InAnimInstance->TryGetPawnOwner());
	if (!T)
	{
		return;
	}
	const UCharacterMovementComponent* Move = T->GetCharacterMovement();
	const float Now = T->GetWorld()->GetTimeSeconds();
	In.Speed = FVector(T->GetVelocity().X, T->GetVelocity().Y, 0.0f).Size();
	In.VelZ = T->GetVelocity().Z;
	In.bGrounded = Move->IsMovingOnGround();
	In.bSwimming = T->bInWater;
	In.bCrouched = T->bIsCrouched;
	In.bDead = T->bDead;
	In.AimPitch = T->AimPitch;
	In.ShotAge = Now - T->LastShotTime;
	In.MeleeAge = Now - T->LastMeleeTime;
	In.HurtAge = Now - T->LastHurtTime;
}

void FIronAnimProxy::Update(float Dt)
{
	const UIronAnimInstance* A = Owner;
	if (!A)
	{
		return;
	}
	auto Approach = [Dt](float From, float To, float Rate) { return FMath::FInterpTo(From, To, Dt, Rate); };
	JogBlend = Approach(JogBlend, FMath::Clamp(In.Speed / 220.0f, 0.0f, 1.0f), 12.0f);
	CrouchBlend = Approach(CrouchBlend, In.bCrouched ? 1.0f : 0.0f, 18.0f);
	AirBlend = Approach(AirBlend, (In.bGrounded || In.bSwimming) ? 0.0f : 1.0f, 14.0f);
	AimSmoothed = Approach(AimSmoothed, In.AimPitch, 16.0f);
	const float Rate = In.Speed > 10.0f ? FMath::Clamp(In.Speed / A->JogAuthoredSpeed, 0.6f, 1.6f) : 1.0f;
	LocoTime += Dt * Rate;
	if (In.bGrounded)
	{
		GroundTime += Dt;
		AirTime = 0.0f;
	}
	else
	{
		AirTime += Dt;
		GroundTime = 0.0f;
	}
	DeathTime = In.bDead ? DeathTime + Dt : 0.0f;
}

// ------------------------------------------------------------------------------- evaluate

void FIronAnimProxy::Sample(const UAnimSequence* Seq, float Time, bool bLoop, FPoseContext& Out) const
{
	if (!Seq)
	{
		Out.ResetToRefPose();
		return;
	}
	const float Len = Seq->GetPlayLength();
	const float T = bLoop ? FMath::Fmod(Time, FMath::Max(Len, 0.01f)) : FMath::Clamp(Time, 0.0f, Len);
	FAnimationPoseData Data(Out);
	Seq->GetAnimationPose(Data, FAnimExtractContext(static_cast<double>(T), false, {}, bLoop));
	// keep the capsule in charge of translation: pin the root bone to the reference pose
	const FCompactPoseBoneIndex Root(0);
	Out.Pose[Root] = Out.Pose.GetRefPose(Root);
}

void FIronAnimProxy::BuildUpperWeights(const FPoseContext& Ctx)
{
	const FBoneContainer& Bones = Ctx.Pose.GetBoneContainer();
	const int32 Num = Ctx.Pose.GetNumBones();
	UpperWeights.SetNumZeroed(Num);
	const FReferenceSkeleton& Ref = Bones.GetReferenceSkeleton();
	for (int32 Bi = 0; Bi < Num; ++Bi)
	{
		const FCompactPoseBoneIndex I(Bi);
		int32 Mesh = Bones.MakeMeshPoseIndex(I).GetInt();
		float W = 0.0f;
		while (Mesh != INDEX_NONE)
		{
			const FName N = Ref.GetBoneName(Mesh);
			if (N == TEXT("spine"))
			{
				W = W > 0.0f ? 1.0f : 0.5f;  // spine itself half, everything above it full
				break;
			}
			W = 1.0f;
			Mesh = Ref.GetParentIndex(Mesh);
			if (Mesh == INDEX_NONE)
			{
				W = 0.0f;
			}
		}
		UpperWeights[I.GetInt()] = W;
	}
	UpperWeightsSerial = Num;
}

void FIronAnimProxy::LayerUpper(FPoseContext& Base, const FPoseContext& Layer, float Alpha) const
{
	if (Alpha <= 0.0f)
	{
		return;
	}
	for (int32 Bi = 0; Bi < Base.Pose.GetNumBones(); ++Bi)
	{
		const FCompactPoseBoneIndex I(Bi);
		const float W = UpperWeights.IsValidIndex(I.GetInt()) ? UpperWeights[I.GetInt()] * Alpha : 0.0f;
		if (W > 0.0f)
		{
			const FTransform From = Base.Pose[I];
			Base.Pose[I].Blend(From, Layer.Pose[I], W);
		}
	}
}

void FIronAnimProxy::LayerFull(FPoseContext& Base, const FPoseContext& Layer, float Alpha) const
{
	if (Alpha <= 0.0f)
	{
		return;
	}
	for (int32 Bi = 0; Bi < Base.Pose.GetNumBones(); ++Bi)
	{
		const FCompactPoseBoneIndex I(Bi);
		const FTransform From = Base.Pose[I];
		Base.Pose[I].Blend(From, Layer.Pose[I], Alpha);
	}
}

void FIronAnimProxy::ApplyAdditive(FPoseContext& Base, const UAnimSequence* Seq, float Alpha) const
{
	if (!Seq || Alpha <= 0.001f)
	{
		return;
	}
	FCompactPose AddPose;
	FBlendedCurve AddCurve;
	UE::Anim::FStackAttributeContainer AddAttr;
	AddPose.SetBoneContainer(&Base.Pose.GetBoneContainer());
	AddCurve.InitFrom(Base.Curve);
	FAnimationPoseData AddData = { AddPose, AddCurve, AddAttr };
	if (Seq->IsValidAdditive())
	{
		AddPose.ResetToAdditiveIdentity();
		Seq->GetAnimationPose(AddData, FAnimExtractContext(0.0, false));
		FAnimationPoseData BaseData(Base);
		FAnimationRuntime::AccumulateAdditivePose(BaseData, AddData, Alpha, Seq->GetAdditiveAnimType());
		Base.Pose.NormalizeRotations();
	}
}

bool FIronAnimProxy::Evaluate(FPoseContext& Output)
{
	const UIronAnimInstance* A = Owner;
	if (!A)
	{
		Output.ResetToRefPose();
		return true;
	}
	if (UpperWeightsSerial != Output.Pose.GetNumBones())
	{
		BuildUpperWeights(Output);
	}

	if (In.bDead)
	{
		Sample(A->Death, DeathTime, false, Output);
		return true;
	}

	// ground locomotion: rifle idle <-> jog
	Sample(A->Idle, LocoTime, true, Output);
	if (JogBlend > 0.001f)
	{
		FPoseContext JogPose(Output);
		Sample(A->Jog, LocoTime, true, JogPose);
		LayerFull(Output, JogPose, JogBlend);
	}

	// crouch: the deepest frame of the landing clip, plus a short squash after touching down
	const float LandSquash = (GroundTime < 0.22f && GroundTime > 0.0f) ? (1.0f - GroundTime / 0.22f) * 0.6f : 0.0f;
	const float CrouchW = FMath::Max(CrouchBlend, LandSquash);
	if (CrouchW > 0.001f)
	{
		FPoseContext CrouchPose(Output);
		Sample(A->Land, A->CrouchPoseTime, false, CrouchPose);
		LayerFull(Output, CrouchPose, CrouchW);
	}

	// air: rising vs falling
	if (AirBlend > 0.001f)
	{
		FPoseContext AirPose(Output);
		const float FallW = FMath::Clamp((200.0f - In.VelZ) / 400.0f, 0.0f, 1.0f);
		Sample(A->JumpUp, AirTime, true, AirPose);
		if (FallW > 0.0f)
		{
			FPoseContext FallPose(Output);
			Sample(A->Fall, AirTime, true, FallPose);
			LayerFull(AirPose, FallPose, FallW);
		}
		LayerFull(Output, AirPose, AirBlend);
	}

	// recoil, melee and hit reactions on the upper body
	if (In.ShotAge < 0.18f && A->Fire)
	{
		FPoseContext FirePose(Output);
		Sample(A->Fire, In.ShotAge, false, FirePose);
		LayerUpper(Output, FirePose, 0.65f * (1.0f - In.ShotAge / 0.18f));
	}
	if (A->Melee && In.MeleeAge < A->Melee->GetPlayLength())
	{
		const float L = A->Melee->GetPlayLength();
		const float W = FMath::Min(FMath::Min(In.MeleeAge / 0.08f, (L - In.MeleeAge) / 0.15f), 1.0f);
		FPoseContext MeleePose(Output);
		Sample(A->Melee, In.MeleeAge, false, MeleePose);
		LayerUpper(Output, MeleePose, FMath::Clamp(W, 0.0f, 1.0f));
	}
	if (A->HitReact && In.HurtAge < 0.35f)
	{
		FPoseContext HitPose(Output);
		Sample(A->HitReact, In.HurtAge, false, HitPose);
		LayerUpper(Output, HitPose, 1.0f - In.HurtAge / 0.35f);
	}

	// 8-way aim: mesh-space aim offsets from the rifle aim set
	if (AimSmoothed > 1.0f)
	{
		ApplyAdditive(Output, A->AimUp, FMath::Clamp(AimSmoothed / 90.0f, 0.0f, 1.0f));
	}
	else if (AimSmoothed < -1.0f)
	{
		ApplyAdditive(Output, A->AimDown, FMath::Clamp(-AimSmoothed / 90.0f, 0.0f, 1.0f));
	}
	return true;
}
