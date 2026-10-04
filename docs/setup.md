# Mechalord setup

## Immediate local playtest

The current server serves `delivery` on http://127.0.0.1:8077. Open `/playable/index.html` for Iron Front v7. To restart it, run `tools/start_playtest.ps1` from PowerShell. No generation account is needed. [frontline-v7-validation.md](frontline-v7-validation.md) records current checks; [playable-preview.md](playable-preview.md) covers the preview workflow.

## Installed Unreal and current blocker

Unreal **5.8.3**, changelist 58210709, is installed at `C:\Program Files\Epic Games\UE_5.8`; the editor executable and installed `Build.version` were verified. `tools/launch_unreal.ps1` reads that version and writes `builds/unreal-installation.json`. The project descriptor targets the 5.8 line.

An actual `MechalordEditor` C++ build was attempted. It failed because Windows SDK **10.0.19041.0** was missing and no MSVC compiler toolchain was detected. Finish the Windows C++ prerequisite supported by the installed patch, then retry the build and address actual UHT/compiler diagnostics. The engine itself does not need downloading again. See [native-gap-v7.md](native-gap-v7.md) for the inspection and adapter gap.

`tools/launch_unreal.ps1 -Build -Bootstrap -Launch` builds the existing editor target, runs `tools/bootstrap_unreal.py`, then opens `game/Mechalord/Mechalord.uproject`. That complete sequence has not succeeded. Bootstrap creates the **legacy** Entry map, unlit materials, five stage data assets and chapter labels; its runtime still uses `BattleSimulation`. It does not port the current three-stage v7 assault combat. Experimental rejected art is excluded by default. See [unreal-runtime.md](unreal-runtime.md) before presenting this route as current gameplay.

A separate content-only `game/MechalordArtLab` is being built/tested for native asset inspection independently of the C++ game. Art Lab validation is not yet complete; [unreal-artlab.md](unreal-artlab.md) is the source for receipts and launch instructions. Its assets/map do not establish a native gameplay port.

When using live Unreal tools, verify the actual editor and loaded project before changes. Plugin installation alone does not establish the correct project connection.

## Android continuation

After successful native v7 integration, let Unreal Turnkey verify the installed engine's SDK/NDK/JDK rather than guessing versions. Use `tools/build_android.ps1` for development ARM64 ASTC packaging. Connect Nothing Phone (3) with USB debugging and authorize the PC on the phone. Record startup, installed size, memory and sustained frame time through a 20-minute session; browser observations do not establish phone performance.

Downloadable chapters remain a later native milestone. Before acceptance, prove chunk 1001 is excluded from the initial APK/OBB, shared resources remain bundled, and compatible integrity-checked content mounts and replays offline. See [chapter-delivery.md](chapter-delivery.md). Production HTTPS hosting remains pending.

Blender is installed for local editing/export. The user canceled local TRELLIS work; do not restore or restart it. Meshy and additional paid conversion routes are discontinued.
