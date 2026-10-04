#include "MechalordArena.h"
#include "MechalordStageDefinition.h"
#include "Components/InstancedStaticMeshComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Components/TextRenderComponent.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "UObject/ConstructorHelpers.h"
#include "Engine/StaticMesh.h"

namespace { constexpr float LaneScale=260, RunSpeed=150, SiegeScale=180; }
AMechalordArena::AMechalordArena()
{
    PrimaryActorTick.bCanEverTick=false;
    SceneRoot=CreateDefaultSubobject<USceneComponent>(TEXT("Root")); RootComponent=SceneRoot;
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cube(TEXT("/Engine/BasicShapes/Cube.Cube"));
    auto MakeInstances=[&](const TCHAR* Name)
    {
        auto* Result=CreateDefaultSubobject<UInstancedStaticMeshComponent>(Name);
        Result->SetupAttachment(RootComponent); Result->SetStaticMesh(Cube.Object);
        Result->SetCollisionEnabled(ECollisionEnabled::NoCollision); Result->SetCastShadow(false);
        Result->SetMobility(EComponentMobility::Movable); Result->NumCustomDataFloats=0;
        return Result;
    };
    Floor=MakeInstances(TEXT("ModularTrack")); NarrowFloor=MakeInstances(TEXT("NarrowTrack")); Rails=MakeInstances(TEXT("Rails"));
    Allies=MakeInstances(TEXT("FriendlyRepresentatives")); Enemies=MakeInstances(TEXT("EnemyRepresentatives"));
    Recruitment=MakeInstances(TEXT("RecruitmentGates")); Multipliers=MakeInstances(TEXT("MultiplicationGates"));
    EnergyGates=MakeInstances(TEXT("EnergyGates")); Barricades=MakeInstances(TEXT("Obstacles"));
    Core=CreateDefaultSubobject<UStaticMeshComponent>(TEXT("EnemyCore"));
    Core->SetupAttachment(RootComponent); Core->SetStaticMesh(Cube.Object);
    Core->SetRelativeLocation(FVector(0,1440,170)); Core->SetRelativeScale3D(FVector(3,1.5f,3.4f));
    Core->SetCollisionEnabled(ECollisionEnabled::NoCollision); Core->SetCastShadow(false);
    Launcher=CreateDefaultSubobject<UStaticMeshComponent>(TEXT("RelicLauncher"));
    Launcher->SetupAttachment(RootComponent); Launcher->SetStaticMesh(Cube.Object);
    Launcher->SetRelativeLocation(FVector(0,20,65)); Launcher->SetRelativeScale3D(FVector(.8f,1.3f,.6f));
    Launcher->SetCollisionEnabled(ECollisionEnabled::NoCollision); Launcher->SetCastShadow(false);
    FriendlyMesh=FSoftObjectPath(TEXT("/Game/Mechalord/Base/Characters/SM_GearlingSentinel.SM_GearlingSentinel"));
    EnemyMesh=FSoftObjectPath(TEXT("/Game/Mechalord/Base/Characters/SM_RustCrawler.SM_RustCrawler"));
}
void AMechalordArena::SetTint(UInstancedStaticMeshComponent* Component,const FLinearColor& Tint)
{
    UMaterialInterface* Material=LoadObject<UMaterialInterface>(nullptr,TEXT("/Game/Mechalord/Materials/M_Unlit.M_Unlit"));
    if(!Material) Material=LoadObject<UMaterialInterface>(nullptr,TEXT("/Engine/BasicShapes/BasicShapeMaterial.BasicShapeMaterial"));
    auto* Instance=UMaterialInstanceDynamic::Create(Material,this);
    Instance->SetVectorParameterValue(TEXT("Tint"),Tint); Instance->SetVectorParameterValue(TEXT("Color"),Tint);
    Component->SetMaterial(0,Instance);
}
void AMechalordArena::BeginPlay()
{
    Super::BeginPlay();
    SetTint(Floor,FLinearColor(.1f,.14f,.16f)); SetTint(Rails,FLinearColor(.25f,.21f,.14f));
    SetTint(Allies,FLinearColor(.04f,.48f,.42f)); SetTint(Enemies,FLinearColor(.55f,.15f,.05f));
    SetTint(Recruitment,FLinearColor(.53f,.44f,.28f)); SetTint(Multipliers,FLinearColor(.02f,.6f,.43f));
    SetTint(EnergyGates,FLinearColor(.15f,.5f,.85f)); SetTint(Barricades,FLinearColor(.7f,.25f,.07f));
    CoreMaterial=UMaterialInstanceDynamic::Create(Floor->GetMaterial(0),this);
    CoreMaterial->SetVectorParameterValue(TEXT("Tint"),FLinearColor(.5f,.16f,.06f)); Core->SetMaterial(0,CoreMaterial);
    Launcher->SetMaterial(0,Allies->GetMaterial(0));
    auto ImportModule=[&](UInstancedStaticMeshComponent* Component,const TCHAR* Name,bool& bAuthored)
    {
        const FString Path=FString::Printf(TEXT("/Game/Mechalord/Base/Environment/SM_%s.SM_%s"),Name,Name);
        if(auto* Mesh=LoadObject<UStaticMesh>(nullptr,*Path))
        {
            Component->SetStaticMesh(Mesh); bAuthored=true;
            for(int32 I=0;I<Mesh->GetStaticMaterials().Num();++I) Component->SetMaterial(I,Mesh->GetMaterial(I));
        }
    };
    ImportModule(Floor,TEXT("track_straight"),bAuthoredTrack);
    bool bNarrowLoaded=false;
    ImportModule(NarrowFloor,TEXT("track_narrow"),bNarrowLoaded);
    if(!bNarrowLoaded) SetTint(NarrowFloor,FLinearColor(.1f,.14f,.16f));
    ImportModule(Recruitment,TEXT("gate_recruit"),bAuthoredRecruit);
    ImportModule(Multipliers,TEXT("gate_multiply"),bAuthoredMultiply);
    ImportModule(EnergyGates,TEXT("gate_energy"),bAuthoredEnergy);
    ImportModule(Barricades,TEXT("barricade"),bAuthoredBarrier);
    if(auto* Mesh=FriendlyMesh.LoadSynchronous())
    {
        Allies->SetStaticMesh(Mesh);
        bAuthoredFriendly=true;
        const float Height=FMath::Max(1.f,Mesh->GetBounds().BoxExtent.Z*2);
        FriendlyScale=FVector(45/Height);
        for(int32 I=0;I<Mesh->GetStaticMaterials().Num();++I) Allies->SetMaterial(I,Mesh->GetMaterial(I));
    }
    if(auto* Mesh=EnemyMesh.LoadSynchronous())
    {
        Enemies->SetStaticMesh(Mesh); EnemyScale=FVector(45/FMath::Max(1.f,Mesh->GetBounds().BoxExtent.Z*2));
        bAuthoredEnemy=true;
        for(int32 I=0;I<Mesh->GetStaticMaterials().Num();++I) Enemies->SetMaterial(I,Mesh->GetMaterial(I));
    }
}
void AMechalordArena::ApplyInstances(UInstancedStaticMeshComponent* Component,const TArray<FTransform>& Transforms)
{
    // Reserve a fixed buffer once; hidden slots have zero scale. No instances
    // are added or removed while presenting frames or after repeated retries.
    const int32 Capacity=Component==Allies || Component==Enemies ? 80 : (Component==Floor || Component==NarrowFloor ? 8 : 96);
    if(Component->GetInstanceCount()!=Capacity)
    {
        Component->ClearInstances();
        for(int32 I=0;I<Capacity;++I) Component->AddInstance(FTransform(FQuat::Identity,FVector::ZeroVector,FVector::ZeroVector));
    }
    for(int32 I=0;I<Capacity;++I)
        Component->UpdateInstanceTransform(I,Transforms.IsValidIndex(I) ? Transforms[I] : FTransform(FQuat::Identity,FVector::ZeroVector,FVector::ZeroVector),false,false,true);
    Component->MarkRenderStateDirty();
}
void AMechalordArena::Assemble(const mech::Stage& Stage,UMechalordStageDefinition* Art)
{
    for(auto* Label:Labels) if(Label) Label->SetVisibility(false);
    const int32 Required=FMath::Min(48,int32(Stage.encounters.size())+2);
    while(Labels.Num()<Required)
    {
        auto* Label=NewObject<UTextRenderComponent>(this);
        Label->SetupAttachment(RootComponent); Label->SetCollisionEnabled(ECollisionEnabled::NoCollision);
        Label->SetHorizontalAlignment(EHTA_Center); Label->SetVerticalAlignment(EVRTA_TextCenter);
        Label->SetWorldSize(52); Label->SetCastShadow(false);
        Label->SetRelativeRotation(FRotator(65,-90,0)); Label->RegisterComponent(); Labels.Add(Label);
    }
    if(Art)
    {
        if(auto* Mesh=Art->TrackMesh.LoadSynchronous()) { Floor->SetStaticMesh(Mesh); bAuthoredTrack=true; }
        if(auto* Mesh=Art->CoreMesh.LoadSynchronous())
        {
            Core->SetStaticMesh(Mesh);
            Core->SetRelativeScale3D(FVector(340/FMath::Max(1.f,Mesh->GetBounds().BoxExtent.Z*2)));
            Core->SetRelativeLocation(FVector(0,1440,0));
            for(int32 I=0;I<Mesh->GetStaticMaterials().Num();++I) Core->SetMaterial(I,Mesh->GetMaterial(I));
        }
        if(!bAuthoredTrack) SetTint(Floor,Art->EnvironmentTint);
    }
    StageDressing=Art ? Art->Dressing : TArray<FMechalordDressingDefinition>();
    for(const auto& Piece:StageDressing)
    {
        const FString Id=Piece.Mesh.ToSoftObjectPath().ToString();
        if(Piece.bNarrowRoute || Id.Contains(TEXT("track_straight")) || DressingIds.Contains(Id)) continue;
        if(auto* Mesh=Piece.Mesh.LoadSynchronous())
        {
            auto* Component=NewObject<UInstancedStaticMeshComponent>(this);
            Component->SetupAttachment(RootComponent); Component->SetStaticMesh(Mesh);
            Component->SetCollisionEnabled(ECollisionEnabled::NoCollision); Component->SetCastShadow(false);
            Component->SetMobility(EComponentMobility::Movable); Component->RegisterComponent();
            DressingComponents.Add(Component); DressingIds.Add(Id); DressingTransforms.Emplace();
        }
    }
    Core->SetVisibility(false); Launcher->SetVisibility(false);
}
float AMechalordArena::GetLaneLimit(float ElapsedSeconds) const
{
    const float Distance=ElapsedSeconds*RunSpeed;
    for(const auto& Piece:StageDressing)
        if(Piece.bNarrowRoute && !Piece.bSiegeOnly && Distance>=Piece.PositionCentimetres.Y && Distance<Piece.PositionCentimetres.Y+800) return 210.f/LaneScale;
    return 1;
}
void AMechalordArena::AddGate(TArray<FTransform>& Out,float X,float Y,float HalfWidth) const
{
    const bool bAuthored=(&Out==&RecruitTransforms && bAuthoredRecruit) || (&Out==&MultiplyTransforms && bAuthoredMultiply) || (&Out==&EnergyTransforms && bAuthoredEnergy);
    if(bAuthored) { Out.Emplace(FQuat::Identity,FVector(X,Y,0),FVector(HalfWidth/83.2f,1,1)); return; }
    Out.Emplace(FQuat::Identity,FVector(X-HalfWidth,Y,95),FVector(.14f,.22f,1.9f));
    Out.Emplace(FQuat::Identity,FVector(X+HalfWidth,Y,95),FVector(.14f,.22f,1.9f));
    Out.Emplace(FQuat::Identity,FVector(X,Y,190),FVector(HalfWidth*.02f+.14f,.22f,.15f));
}
void AMechalordArena::Present(const mech::Battle& Battle)
{
    const bool bRun=Battle.phase==mech::Phase::Run;
    const bool bSiege=Battle.phase==mech::Phase::Siege;
    const float LaneHalfWidth=bRun ? GetLaneLimit(Battle.elapsed)*LaneScale : LaneScale;
    AllyTransforms.Reset(); EnemyTransforms.Reset(); RecruitTransforms.Reset(); MultiplyTransforms.Reset(); EnergyTransforms.Reset(); BarrierTransforms.Reset();
    const int32 Ceiling=FMath::Clamp(VisualCeiling,1,80);
    const int32 WantedEnemies=FMath::Min(Ceiling/3,int32(Battle.enemies.size())*4);
    const int32 FriendlyCount=bSiege ? FMath::Min(Ceiling-WantedEnemies,Battle.LivePacketTroops()) : FMath::Min(Ceiling-WantedEnemies,Battle.army);
    if(bRun || Battle.phase==mech::Phase::Won || Battle.phase==mech::Phase::Lost)
    {
        for(int32 I=0;I<FriendlyCount;++I)
        {
            const float X=FMath::Clamp(float(Battle.lane)*LaneScale+(I%7-3)*38.f,-LaneHalfWidth+15,LaneHalfWidth-15);
            AllyTransforms.Emplace(FQuat::Identity,FVector(X,-70-(I/7)*43,bAuthoredFriendly ? 0 : 25),FriendlyScale);
        }
    }
    else if(bSiege && FriendlyCount>0)
    {
        // Allocate representatives proportionally by troop count, while keeping
        // the logical multiplied packet sizes in the simulation and the HUD.
        const int32 Total=FMath::Max(1,Battle.LivePacketTroops());
        int32 Emitted=0, Prefix=0;
        for(const auto& Packet:Battle.packets)
        {
            Prefix+=Packet.troops;
            const int32 Until=FMath::RoundToInt(double(Prefix)*FriendlyCount/Total);
            while(Emitted<Until && Emitted<FriendlyCount)
            {
                const int32 Offset=Emitted%3-1;
                AllyTransforms.Emplace(FQuat::Identity,FVector(Packet.x*LaneScale+Offset*23,Packet.y*SiegeScale-(Emitted%2)*18,bAuthoredFriendly ? 0 : 25),FriendlyScale); ++Emitted;
            }
        }
    }
    for(const auto& Enemy:Battle.enemies)
    {
        if(!Enemy.alive) continue;
        for(int32 I=0;I<4 && EnemyTransforms.Num()<WantedEnemies;++I)
            EnemyTransforms.Emplace(FQuat::Identity,FVector(Enemy.x*LaneScale+(I%2-.5f)*45,Enemy.y*RunSpeed+(I/2)*45,bAuthoredEnemy ? 0 : 28),EnemyScale);
    }
    VisibleCount=AllyTransforms.Num()+EnemyTransforms.Num();
    ApplyInstances(Allies,AllyTransforms); ApplyInstances(Enemies,EnemyTransforms);
    FloorTransforms.Reset(); NarrowTransforms.Reset(); RailTransforms.Reset();
    const float Scroll=bRun ? FMath::Fmod(float(Battle.elapsed)*RunSpeed,800.f) : 0;
    for(int32 I=0;I<6;++I)
    {
        const float Y=-1200+I*800-Scroll;
        const float WorldStart=Y-400+(bRun ? float(Battle.elapsed)*RunSpeed : 0);
        bool bNarrow=false;
        for(const auto& Piece:StageDressing) if(Piece.bNarrowRoute && !Piece.bSiegeOnly && FMath::Abs(Piece.PositionCentimetres.Y-WorldStart)<2) { bNarrow=true; break; }
        const FVector Extent=Floor->GetStaticMesh()->GetBounds().BoxExtent*2;
        const FVector Scale=bAuthoredTrack ? FVector(1) : FVector(600/FMath::Max(1.f,Extent.X),800/FMath::Max(1.f,Extent.Y),18/FMath::Max(1.f,Extent.Z));
        if(bNarrow) NarrowTransforms.Emplace(FQuat::Identity,FVector(0,Y-400,0),FVector(1));
        else FloorTransforms.Emplace(FQuat::Identity,FVector(0,bAuthoredTrack ? Y-400 : Y,bAuthoredTrack ? 0 : -12),Scale);
        for(float Side:{-1.f,1.f}) RailTransforms.Emplace(FQuat::Identity,FVector(Side*312,Y,28),FVector(.18f,7.98f,.56f));
    }
    ApplyInstances(Floor,FloorTransforms); ApplyInstances(Rails,RailTransforms);
    ApplyInstances(NarrowFloor,NarrowTransforms);
    for(auto& Buffer:DressingTransforms) Buffer.Reset();
    for(const auto& Piece:StageDressing)
    {
        if(Piece.bNarrowRoute || Piece.bSiegeOnly!=bSiege) continue;
        const int32 Group=DressingIds.IndexOfByKey(Piece.Mesh.ToSoftObjectPath().ToString());
        if(Group==INDEX_NONE) continue;
        FVector Position=Piece.PositionCentimetres;
        if(!Piece.bSiegeOnly) Position.Y-=float(Battle.elapsed)*RunSpeed;
        if(Position.Y<-1500 || Position.Y>2700) continue;
        DressingTransforms[Group].Emplace(FQuat::Identity,Position,FVector(1));
    }
    for(int32 I=0;I<DressingComponents.Num();++I) ApplyInstances(DressingComponents[I],DressingTransforms[I]);
    for(auto* Label:Labels) Label->SetVisibility(false);
    if(bRun)
    {
        for(size_t I=0;I<Battle.stage.encounters.size() && I<size_t(Labels.Num());++I)
        {
            const auto& Event=Battle.stage.encounters[I];
            const float Y=(Event.at-Battle.elapsed)*RunSpeed;
            if(Event.kind==mech::EventKind::Wave || Battle.EncounterConsumed(I) || Y<-80 || Y>2400) continue;
            const float X=Battle.EncounterLane(I)*LaneScale;
            FString Text;
            if(Event.kind==mech::EventKind::Obstacle)
            {
                BarrierTransforms.Emplace(FQuat::Identity,FVector(X,Y,bAuthoredBarrier ? 0 : 42),bAuthoredBarrier ? FVector(Event.width*520/145,1,1) : FVector(Event.width*5.2f,.32f,.84f));
                Text=FString::Printf(TEXT("-%d"),Event.value);
                Labels[I]->SetTextRenderColor(FColor(255,154,88));
            }
            else
            {
                auto* Buffer=Event.operation==mech::GateOperation::Recruit ? &RecruitTransforms : Event.operation==mech::GateOperation::Multiply ? &MultiplyTransforms : &EnergyTransforms;
                AddGate(*Buffer,X,Y,Event.width*LaneScale);
                if(Event.operation==mech::GateOperation::Multiply) Text=FString::Printf(TEXT("x%d"),Event.value);
                else if(Event.operation==mech::GateOperation::Recruit) Text=FString::Printf(TEXT("+%d"),Event.value);
                else Text=FString::Printf(TEXT("ENERGY +%d"),Event.value);
                Labels[I]->SetTextRenderColor(Event.operation==mech::GateOperation::Energy ? FColor(108,202,255) : FColor(192,255,222));
            }
            Labels[I]->SetWorldSize(Event.operation==mech::GateOperation::Energy ? 26 : 45);
            Labels[I]->SetText(FText::FromString(Text)); Labels[I]->SetRelativeLocation(FVector(X,Y-32,236)); Labels[I]->SetVisibility(true);
        }
    }
    if(bSiege)
    {
        for(size_t I=0;I<Battle.siegeGates.size() && I<size_t(Labels.Num());++I)
        {
            const auto& Gate=Battle.siegeGates[I]; AddGate(MultiplyTransforms,Gate.x*LaneScale,Gate.y*SiegeScale,Gate.width*LaneScale);
            Labels[I]->SetText(FText::FromString(FString::Printf(TEXT("x%d"),Gate.multiplier)));
            Labels[I]->SetRelativeLocation(FVector(Gate.x*LaneScale,Gate.y*SiegeScale,240));
            Labels[I]->SetTextRenderColor(FColor(192,255,222)); Labels[I]->SetVisibility(true);
        }
        Launcher->SetRelativeLocation(FVector(Battle.aim*LaneScale,20,65));
        if(CoreMaterial) CoreMaterial->SetVectorParameterValue(TEXT("Tint"),Battle.warning>0 ? FLinearColor(1,.32f,.03f) : FLinearColor(.5f,.16f,.06f));
    }
    Core->SetVisibility(bSiege); Launcher->SetVisibility(bSiege);
    ApplyInstances(Recruitment,RecruitTransforms); ApplyInstances(Multipliers,MultiplyTransforms);
    ApplyInstances(EnergyGates,EnergyTransforms); ApplyInstances(Barricades,BarrierTransforms);
}
