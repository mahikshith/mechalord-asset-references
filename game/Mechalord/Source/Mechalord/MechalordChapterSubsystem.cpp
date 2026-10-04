#include "MechalordChapterSubsystem.h"
#include "HttpModule.h"
#include "Interfaces/IHttpResponse.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "Misc/Paths.h"
#include "Misc/FileHelper.h"
#include "Misc/SecureHash.h"
#include "HAL/PlatformFileManager.h"
#include "HAL/PlatformMisc.h"
#include "GenericPlatform/GenericPlatformProperties.h"
#include "Async/Async.h"

static bool VerifyChapterFiles(const TArray<FMechalordChapterFile>& Files)
{
    if (Files.IsEmpty()) return false;
    auto& PlatformFile = FPlatformFileManager::Get().GetPlatformFile();
    TArray<FString> Candidates;
    PlatformFile.FindFilesRecursively(Candidates, *FPaths::ProjectPersistentDownloadDir(), TEXT(".pak"));
    for (const auto& File : Files)
    {
        bool bMatched = false;
        int32 MatchCount = 0;
        for (const auto& Path : Candidates) if (FPaths::GetCleanFilename(Path) == File.Name) ++MatchCount;
        if (MatchCount != 1) return false;
        for (const auto& Path : Candidates)
        {
            if (FPaths::GetCleanFilename(Path) != File.Name || PlatformFile.FileSize(*Path) != File.Bytes) continue;
            TUniquePtr<IFileHandle> Handle(PlatformFile.OpenRead(*Path)); if (!Handle) continue;
            FSHA1 Hash; TArray<uint8> Buffer; Buffer.SetNumUninitialized(1024 * 1024);
            int64 Left = File.Bytes; bool bRead = true;
            while (Left > 0)
            {
                const int64 Count = FMath::Min<int64>(Buffer.Num(), Left);
                if (!Handle->Read(Buffer.GetData(), Count)) { bRead = false; break; }
                Hash.Update(Buffer.GetData(), static_cast<uint32>(Count)); Left -= Count;
            }
            if (!bRead) continue;
            Hash.Final(); uint8 Digest[20]; Hash.GetHash(Digest);
            if (BytesToHex(Digest, 20).Equals(File.Sha1, ESearchCase::IgnoreCase)) { bMatched = true; break; }
        }
        if (!bMatched) return false;
    }
    return true;
}

FString UMechalordChapterSubsystem::ReceiptPath() const { return FPaths::Combine(FPaths::ProjectPersistentDownloadDir(), TEXT("MechalordChapterReceipt.json")); }
void UMechalordChapterSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    FPlatformFileManager::Get().GetPlatformFile().CreateDirectoryTree(*FPaths::ProjectPersistentDownloadDir());
    FString Cached;
    if (FFileHelper::LoadFileToString(Cached, *ReceiptPath()) && ParseDescriptor(Cached))
    {
        VerifyAndMount(++Generation, true);
    }
    else if (!ChapterDescriptorUrl.IsEmpty()) Status = EMechalordChapterStatus::Available;
}
void UMechalordChapterSubsystem::Deinitialize() { CancelDownload(); Backend.Reset(); Super::Deinitialize(); }
float UMechalordChapterSubsystem::GetDownloadProgress() const { return Backend ? Backend->Progress() : 0; }
void UMechalordChapterSubsystem::Fail(const FString& Reason) { Status = EMechalordChapterStatus::Failed; Message = Reason; }
bool UMechalordChapterSubsystem::ParseDescriptor(const FString& Json)
{
    TSharedPtr<FJsonObject> Object;
    if (!FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Json), Object) || !Object) return false;
    FString Version, Platform; double Schema = 0, Chunk = 0, Total = 0;
    const TArray<TSharedPtr<FJsonValue>>* Entries = nullptr;
    if (!Object->TryGetNumberField(TEXT("schema"), Schema) || Schema != 1 ||
        !Object->TryGetStringField(TEXT("buildId"), Version) || Version != BuildId ||
        !Object->TryGetStringField(TEXT("platform"), Platform) || Platform != FPlatformProperties::IniPlatformName() ||
        !Object->TryGetNumberField(TEXT("chunkId"), Chunk) || Chunk != ChapterChunkId ||
        !Object->TryGetNumberField(TEXT("downloadBytes"), Total) || Total <= 0 || Total >= 100000000 || Total != FMath::FloorToDouble(Total) ||
        !Object->TryGetArrayField(TEXT("files"), Entries) || Entries->Num() < 1 || Entries->Num() > 16) return false;
    TArray<FMechalordChapterFile> Parsed;
    int64 Sum = 0;
    for (const auto& Value : *Entries)
    {
        if (!Value || Value->Type != EJson::Object) return false;
        const auto Entry = Value->AsObject(); FMechalordChapterFile File; double Size = 0;
        if (!Entry || !Entry->TryGetStringField(TEXT("name"), File.Name) ||
            !Entry->TryGetStringField(TEXT("sha1"), File.Sha1) || !Entry->TryGetNumberField(TEXT("bytes"), Size)) return false;
        if (File.Name != FPaths::GetCleanFilename(File.Name) || !File.Name.EndsWith(TEXT(".pak")) ||
            !File.Name.StartsWith(TEXT("pakchunk1001-")) || File.Name.Contains(TEXT("..")) || File.Sha1.Len() != 40 || Size <= 0 || Size >= 100000000 || Size != FMath::FloorToDouble(Size)) return false;
        for (TCHAR C : File.Name) if (C > 127 || (!FChar::IsAlnum(C) && C != TEXT('_') && C != TEXT('.') && C != TEXT('-'))) return false;
        for (TCHAR C : File.Sha1) if (!FChar::IsHexDigit(C)) return false;
        for (const auto& Existing : Parsed) if (Existing.Name == File.Name) return false;
        File.Bytes = static_cast<int64>(Size); Sum += File.Bytes; Parsed.Add(File);
    }
    if (Sum != static_cast<int64>(Total)) return false;
    Files = MoveTemp(Parsed); DownloadBytes = Sum; return true;
}

void UMechalordChapterSubsystem::CheckAvailability()
{
    if (IsChapterInstalled() || Status == EMechalordChapterStatus::Checking || Status == EMechalordChapterStatus::Downloading || Status == EMechalordChapterStatus::Mounting || Status == EMechalordChapterStatus::Verifying) return;
    if (ChapterDescriptorUrl.IsEmpty()) { Message = TEXT("Chapter 2 has not been cooked or hosted yet."); return; }
#if UE_BUILD_SHIPPING
    if (!ChapterDescriptorUrl.StartsWith(TEXT("https://"))) { Fail(TEXT("Chapter delivery requires HTTPS.")); return; }
#endif
    if (Request) Request->CancelRequest();
    Status = EMechalordChapterStatus::Checking; Message = TEXT("Checking chapter size...");
    const int32 Token = ++Generation;
    Request = FHttpModule::Get().CreateRequest(); Request->SetURL(ChapterDescriptorUrl); Request->SetVerb(TEXT("GET")); Request->SetTimeout(15);
    Request->OnProcessRequestComplete().BindWeakLambda(this, [this, Token](FHttpRequestPtr, FHttpResponsePtr Response, bool bSuccess)
    {
        if (Token != Generation) return;
        Request.Reset();
        if (!bSuccess || !Response || Response->GetResponseCode() != 200 || Response->GetContent().Num() > 65536 || !ParseDescriptor(Response->GetContentAsString()))
        { Fail(TEXT("Chapter unavailable or incompatible. Bundled stages remain playable.")); return; }
        Status = EMechalordChapterStatus::Available;
        Message = FString::Printf(TEXT("Chapter 2: %.1f MB. Download to unlock Storm Pass and Forge Core."), DownloadBytes / 1000000.0);
    });
    if (!Request->ProcessRequest()) Fail(TEXT("Could not contact the chapter server."));
}
bool UMechalordChapterSubsystem::StartDownload()
{
    if (Status != EMechalordChapterStatus::Available || Files.IsEmpty()) return false;
    uint64 TotalSpace = 0, FreeSpace = 0;
    if (!FPlatformMisc::GetDiskTotalAndFreeSpace(FPaths::ProjectPersistentDownloadDir(), TotalSpace, FreeSpace) ||
        FreeSpace < static_cast<uint64>(DownloadBytes * 2 + 50 * 1024 * 1024))
    { Fail(TEXT("Not enough free storage to safely install this chapter.")); return false; }
    const int32 Token = ++Generation;
    Backend = MakeMechalordChunkBackend(); Status = EMechalordChapterStatus::Checking; Message = TEXT("Preparing chapter download...");
    const auto Weak = TWeakObjectPtr<UMechalordChapterSubsystem>(this);
    Backend->Prepare(FPlatformProperties::IniPlatformName(), Deployment, BuildId, [Weak, Token](bool bSuccess)
    {
        if (!Weak.IsValid() || Weak->Generation != Token) return;
        if (!bSuccess) { Weak->Fail(TEXT("Content manifest could not load.")); return; }
        Weak->Status = EMechalordChapterStatus::Downloading;
        Weak->Backend->Download(Weak->ChapterChunkId, [Weak, Token](bool bDownloaded)
        {
            if (!Weak.IsValid() || Weak->Generation != Token) return;
            if (!bDownloaded) { Weak->Fail(TEXT("Download interrupted. Retry when the connection returns.")); return; }
            Weak->VerifyAndMount(Token, false);
        });
    });
    return true;
}
void UMechalordChapterSubsystem::VerifyAndMount(int32 Token, bool bRestoreCached)
{
    Status = EMechalordChapterStatus::Verifying; Message = TEXT("Checking chapter integrity...");
    const auto Snapshot = Files;
    const auto Weak = TWeakObjectPtr<UMechalordChapterSubsystem>(this);
    Async(EAsyncExecution::ThreadPool, [Snapshot, Weak, Token, bRestoreCached]
    {
        const bool bValid = VerifyChapterFiles(Snapshot);
        AsyncTask(ENamedThreads::GameThread, [Weak, Token, bValid, bRestoreCached]
        {
            if (!Weak.IsValid() || Weak->Generation != Token) return;
            if (!bValid)
            {
                if (bRestoreCached)
                {
                    Weak->Backend = MakeMechalordChunkBackend();
                    Weak->Backend->RestoreCached(FPlatformProperties::IniPlatformName(), Weak->Deployment, Weak->BuildId);
                }
                if (Weak->Backend) Weak->Backend->PurgeUninstalledCache();
                Weak->Fail(TEXT("Chapter integrity check failed. Retry to download a clean pack; bundled stages remain playable.")); return;
            }
            if (bRestoreCached)
            {
                Weak->Backend = MakeMechalordChunkBackend();
                if (!Weak->Backend->RestoreCached(FPlatformProperties::IniPlatformName(), Weak->Deployment, Weak->BuildId))
                { Weak->Fail(TEXT("Cached chapter manifest belongs to another build or is missing.")); return; }
            }
            Weak->MountVerified(Token);
        });
    });
}
void UMechalordChapterSubsystem::MountVerified(int32 Token)
{
    if (!Backend || !Backend->CanMountCached(ChapterChunkId))
    { Fail(TEXT("Chapter files are incomplete; retry the download.")); return; }
    Status = EMechalordChapterStatus::Mounting;
    const auto Weak = TWeakObjectPtr<UMechalordChapterSubsystem>(this);
    Backend->Mount(ChapterChunkId, [Weak, Token](bool bSuccess)
    {
        if (!Weak.IsValid() || Weak->Generation != Token) return;
        if (!bSuccess) { Weak->Fail(TEXT("Chapter mounting failed. Bundled stages remain available.")); return; }
        Weak->Status = EMechalordChapterStatus::Installed; Weak->Message = TEXT("Chapter 2 installed. Ready for offline replay.");
        auto Root = MakeShared<FJsonObject>(); Root->SetNumberField(TEXT("schema"), 1); Root->SetStringField(TEXT("buildId"), Weak->BuildId);
        Root->SetStringField(TEXT("platform"), FPlatformProperties::IniPlatformName()); Root->SetNumberField(TEXT("chunkId"), Weak->ChapterChunkId); Root->SetNumberField(TEXT("downloadBytes"), Weak->DownloadBytes);
        TArray<TSharedPtr<FJsonValue>> Entries;
        for (const auto& File : Weak->Files) { auto Entry = MakeShared<FJsonObject>(); Entry->SetStringField(TEXT("name"), File.Name); Entry->SetStringField(TEXT("sha1"), File.Sha1); Entry->SetNumberField(TEXT("bytes"), File.Bytes); Entries.Add(MakeShared<FJsonValueObject>(Entry)); }
        Root->SetArrayField(TEXT("files"), Entries); FString Json; FJsonSerializer::Serialize(Root, TJsonWriterFactory<>::Create(&Json));
        if (!FFileHelper::SaveStringToFile(Json, *Weak->ReceiptPath())) Weak->Message = TEXT("Installed for this session; storage prevented saving the offline receipt.");
    });
}
void UMechalordChapterSubsystem::CancelDownload()
{
    ++Generation;
    if (Request) { Request->CancelRequest(); Request.Reset(); }
    if (IsChapterInstalled()) return;
    if (Backend) Backend->Cancel();
    if (Status != EMechalordChapterStatus::Unconfigured) { Status = EMechalordChapterStatus::Cancelled; Message = TEXT("Download cancelled. Bundled levels are still ready to play."); }
}
