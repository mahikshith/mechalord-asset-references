#include "MechalordChapterBackend.h"
#include "ChunkDownloader.h"
class FMechalordChunkBackend final : public IMechalordChapterBackend
{
    TSharedPtr<FChunkDownloader> Downloader;
public:
    virtual void Prepare(const FString& Platform, const FString& Deployment, const FString& BuildId, TFunction<void(bool)> Done) override
    {
        Downloader = FChunkDownloader::GetOrCreate();
        Downloader->Initialize(Platform, 2);
        Downloader->LoadCachedBuild(Deployment);
        Downloader->UpdateBuild(Deployment, BuildId, MoveTemp(Done));
    }
    virtual bool RestoreCached(const FString& Platform, const FString& Deployment, const FString& BuildId) override
    {
        Downloader = FChunkDownloader::GetOrCreate();
        Downloader->Initialize(Platform, 2);
        return Downloader->LoadCachedBuild(Deployment) && Downloader->GetContentBuildId() == BuildId;
    }
    virtual void Download(int32 ChunkId, TFunction<void(bool)> Done) override
    {
        Downloader->DownloadChunks({ChunkId}, MoveTemp(Done), 1);
        Downloader->BeginLoadingMode([](bool) {});
    }
    virtual bool CanMountCached(int32 ChunkId) const override
    {
        if (!Downloader) return false;
        const auto Status = Downloader->GetChunkStatus(ChunkId);
        return Status == FChunkDownloader::EChunkStatus::Cached || Status == FChunkDownloader::EChunkStatus::Mounted;
    }
    virtual void Mount(int32 ChunkId, TFunction<void(bool)> Done) override { Downloader->MountChunks({ChunkId}, MoveTemp(Done)); }
    virtual float Progress() const override
    {
        if (!Downloader) return 0;
        const auto& Stats = Downloader->GetLoadingStats();
        return Stats.TotalBytesToDownload > 0 ? FMath::Clamp(float(double(Stats.BytesDownloaded) / double(Stats.TotalBytesToDownload)), 0.f, 1.f) : 0;
    }
    virtual void PurgeUninstalledCache() override { if (Downloader) Downloader->FlushCache(); }
    virtual void Cancel() override
    {
        // Chapter 2 is the only managed optional pack. Finalize cancels in-flight downloads
        // and preserves partial caches; generation guards discard late callbacks.
        if (Downloader) { Downloader->Finalize(); Downloader.Reset(); FChunkDownloader::Shutdown(); }
    }
    virtual ~FMechalordChunkBackend() override { Cancel(); }
};
TUniquePtr<IMechalordChapterBackend> MakeMechalordChunkBackend() { return MakeUnique<FMechalordChunkBackend>(); }
