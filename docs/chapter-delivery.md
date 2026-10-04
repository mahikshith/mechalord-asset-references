# Progression, HUD and chapter delivery

## Implemented source

The native Unreal HUD builds its widget tree before Slate reconstruction, so it does not require a binary widget Blueprint. Its scrollable menu selects stages and relics, displays earned coins, and offers capped troop/attack upgrades. Battle controls expose relic activation, champion deployment, pause/resume, free immediate retries and return to the menu. Menu visibility does not cover the steering surface during a battle.

The progression subsystem saves schema-versioned local progress. It validates loaded levels, coins and relic selection. Upgrade purchases and earned-win rewards roll back their in-memory changes if persistence fails. The game mode records each completed run once; completed levels can be replayed for currency. Shield is initially available, EMP unlocks after Foundry Approach and Overdrive after Gatehouse Siege. No purchase, gem or advertising service is active.

The chapter subsystem uses a platform-independent backend interface and a ChunkDownloader adapter. A descriptor is checked against the configured game build and cook platform, chunk 1001, safe unique pak filenames, integer byte counts and a total below 100,000,000 bytes. The UI shows this size before the player starts the transfer. Download start requires room for twice the compressed payload plus a 50 MiB margin. A worker verifies exact file sizes and SHA1 hashes before mounting. A complete cached chunk and matching cached build ID are required; this prevents mounting from silently initiating a download during offline restoration.

On cancellation the adapter finalizes the chapter downloader to stop active transfers while retaining partial cache. Generation checks discard obsolete callbacks. Integrity failure clears uninstalled optional cache so a retry can fetch clean data. Installed chapters write a local receipt and are verified/remounted on later starts without contacting the server. Missing or incompatible content never gates bundled stages. The adapter owns the downloader singleton for this prototype's one optional chapter; extending to multiple simultaneous packs requires revisiting this lifecycle.

## Prepare a development chapter

This requires actual Unreal-cooked chunk 1001 paks. No pack or download success has been fabricated. The host tool checks a pak trailer, exact byte totals and hashes; the trailer check alone does not prove valid cooked assets. Unreal mounting and authored optional-stage asset loading remain the authoritative runtime checks.

1. Bootstrap the Entry map, stage assets and primary asset labels with the project setup tools. Package using the pinned Unreal version, ARM64 and Pak format (IoStore is disabled).
2. Inspect the Asset Audit/chunk report: shared art and materials belong to base chunk 0; Storm Pass and Forge Core assets belong to chunk 1001.
3. Prepare the real optional payload:

```powershell
python tools/chapter_delivery.py build --pak "<cooked-output>/pakchunk1001-Android.pak" --platform Android
python tools/chapter_delivery.py verify builds/chapter-server/content/mechalord-0.1.0/Chapter-Android.json --build-id mechalord-0.1.0 --platform Android
python tools/chapter_server.py --bind 0.0.0.0 --port 8088
```

The builder preserves cooked source files and copies optional packs into `builds/chapter-server/content/<buildId>/<platform>/`. It emits a descriptor and a five-field, tab-separated Unreal manifest. Versions use `SHA1:<digest>`, enabling native hash validation as documented by [Epic's pak file entry API](https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/ChunkDownloader/FPakFileEntry?lang=en-US). Manifest layout follows [Epic's hosting documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/hosting-a-manifest-and-assets-for-chunkdownloader-in-unreal-engine).

4. In DefaultGame.ini set `ChapterDescriptorUrl` to `http://<PC-LAN-address>:8088/content/mechalord-0.1.0/Chapter-Android.json` and the Development CDN base URL to `http://<PC-LAN-address>:8088/content`. A phone's 127.0.0.1 refers to the phone, so replace the loopback default for physical-device tests. Use the PC and phone on the same network and permit the selected server port when testing.
5. Use a Development APK for this HTTP demonstration. Shipping requires an HTTPS descriptor and production HTTPS CDN configuration. Hosting and certificate setup are later delivery work.

The development server supports full GET, HEAD and byte-range responses for resumed transfers. It disables directory listing and rejects symlink targets outside its serving directory. It is intended for local testing, not production hosting.

## Required engine and device validation

The source has not been compiled with Unreal, and no cooked chapter exists yet. Verify UHT/module compilation, HUD layout and touch handling, SaveGame persistence/low-storage rollback, and the exact pinned engine's ChunkDownloader cache and lifecycle behavior. Validate cancellation during manifest preparation, payload transfer and verification, repeated retries, process termination/restart, corruption and offline remount. Check Android's development HTTP network permission/configuration in the actual packaged APK.

Chunk generation alone does not exclude optional paks from the Android installer. Before claiming the initial-size target or a genuinely downloadable chapter, verify a staging/package process that omits chunk 1001 from the base APK/OBB while retaining it for the development server. Measure base installed size, compressed chapter transfer size and total storage after installation separately.

The host tools passed 21 regression tests, including incompatible build/platform, integer and size limits, duplicate/unsafe filenames, missing/truncated/corrupted paks, manifest mismatch, base-chunk rejection, HTTP resume ranges, HEAD, invalid ranges and missing resources. Synthetic test bytes exist only in temporary test directories and are not game content. These host-tool tests do not validate Unreal packaging, mounting or physical Android behavior.
