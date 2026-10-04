#pragma once
#include "CoreMinimal.h"
// No UMG or gameplay dependencies; replace this adapter for separately cooked iOS content.
class IMechalordChapterBackend
{
public:
    virtual ~IMechalordChapterBackend() = default;
    virtual void Prepare(const FString& Platform, const FString& Deployment, const FString& BuildId, TFunction<void(bool)> Done) = 0;
    virtual bool RestoreCached(const FString& Platform, const FString& Deployment, const FString& BuildId) = 0;
    virtual void Download(int32 ChunkId, TFunction<void(bool)> Done) = 0;
    virtual bool CanMountCached(int32 ChunkId) const = 0;
    virtual void Mount(int32 ChunkId, TFunction<void(bool)> Done) = 0;
    virtual float Progress() const = 0;
    virtual void PurgeUninstalledCache() = 0;
    virtual void Cancel() = 0;
};
TUniquePtr<IMechalordChapterBackend> MakeMechalordChunkBackend();
