#pragma once
#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "MechalordChapterBackend.h"
#include "Interfaces/IHttpRequest.h"
#include "MechalordChapterSubsystem.generated.h"
UENUM(BlueprintType)
enum class EMechalordChapterStatus : uint8 { Unconfigured, Available, Checking, Downloading, Verifying, Mounting, Installed, Cancelled, Failed };
USTRUCT()
struct FMechalordChapterFile
{
    GENERATED_BODY()
    UPROPERTY() FString Name;
    UPROPERTY() FString Sha1;
    UPROPERTY() int64 Bytes = 0;
};
UCLASS(Config=Game)
class MECHALORD_API UMechalordChapterSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()
public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;
    UPROPERTY(Config) FString Deployment = TEXT("Development");
    UPROPERTY(Config) FString BuildId = TEXT("mechalord-0.1.0");
    UPROPERTY(Config) int32 ChapterChunkId = 1001;
    UPROPERTY(Config) FString ChapterDescriptorUrl;
    UPROPERTY(BlueprintReadOnly) EMechalordChapterStatus Status = EMechalordChapterStatus::Unconfigured;
    UPROPERTY(BlueprintReadOnly) FString Message;
    UPROPERTY(BlueprintReadOnly) int64 DownloadBytes = 0;
    UFUNCTION(BlueprintPure) bool IsChapterInstalled() const { return Status == EMechalordChapterStatus::Installed; }
    UFUNCTION(BlueprintPure) float GetDownloadProgress() const;
    UFUNCTION(BlueprintCallable) void CheckAvailability();
    UFUNCTION(BlueprintCallable) bool StartDownload();
    UFUNCTION(BlueprintCallable) void CancelDownload();
private:
    TUniquePtr<IMechalordChapterBackend> Backend;
    TSharedPtr<IHttpRequest, ESPMode::ThreadSafe> Request;
    UPROPERTY() TArray<FMechalordChapterFile> Files;
    int32 Generation = 0;
    void Fail(const FString& Reason);
    bool ParseDescriptor(const FString& Json);
    void VerifyAndMount(int32 Token, bool bRestoreCached);
    void MountVerified(int32 Token);
    FString ReceiptPath() const;
};
