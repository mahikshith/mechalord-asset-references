# Native milestone readiness — 6 October 2026

The accepted Iron Front game remains a portable C++ simulation presented through the browser. Unreal is installed, but the native project does not yet run that combat. This inspection makes no native build, APK, phone-performance or iOS claim.

## Actual local findings

The installed engine at `C:\Program Files\Epic Games\UE_5.8` reports **5.8.3**, changelist **58210709**, and its editor executable exists. The content-only `game/MechalordArtLab` has saved workshop maps and can support bounded material, import, pivot and Niagara experiments without a new game-module compiler. That workshop is not a current battle adapter; the rejected Reforged replacement is not a proposed runtime dependency.

Standard Windows discovery finds no Visual Studio installer `vswhere.exe`, Visual Studio installation directory, Windows Kits 10 Include/Lib directory, or `cl` command. The installed engine's own `Engine/Config/Windows/Windows_SDK.json` lists Windows SDK **10.0.22621.0** as its preferred version, with **10.0.19041.0** as the minimum. Its supported VS2022 family includes **MSVC 14.44.35211 or later in the 14.44 family**; earlier 14.44 builds are explicitly banned. Use the installed engine's version rules when setting up the compiler, rather than reinstalling Unreal or treating the portable Zig compiler as a supported Unreal Windows toolchain. Nonstandard compiler locations require explicit discovery; a real target build is the definitive check.

Android SDK setup is partially present under `%LOCALAPPDATA%\Android\Sdk`: `android-36`, build tools `36.0.0`, command-line tools `19.0`, and `platform-tools/adb.exe` exist. No NDK directory was found. `JAVA_HOME`, `ANDROID_HOME` and `ANDROID_SDK_ROOT` are unset, and Java is not on the inspected command path. The installed engine's `Android_SDK.json` requests **NDK 27.2.12479018 / r27c**, API 36 and build tools 36.0.0. Installed platform tools alone do not validate Unreal's Android environment.

The runtime project `game/Mechalord/Mechalord.uproject` has neither a built native module DLL nor an Entry map in its Content directory. Its GameMode still owns `mech::Battle` from `BattleSimulation.h`, with the earlier runner/launcher behavior. The accepted `mech::assault::Battle` and measured `BossPose` are portable sources in the module, but compilation alone does not connect them to input, assets, HUD or saves. The bootstrap still creates the legacy five-stage scene and must not be represented as the current assault port.

## Concrete next milestone

1. Establish the supported Windows compiler/SDK components. Then run an actual **MechalordEditor / Win64 / Development** build and address real UnrealHeaderTool/compiler diagnostics. Preserve the legacy mode as a separate mode until the replacement is verified.
2. Author an assault-specific native adapter for **Reactor Siege, rank zero** around the exact accepted portable core. Convert metres to centimetres once; map phases explicitly; use core damage and fixed-step collision rather than duplicate physics damage. Preserve authoritative boss pose, nearest region impacts, weapon sockets, part mask, epoch and one-time consumed effects.
3. Import the retained Iron Front commander, troop, elite and boss, verify their actual named pivots/materials and source scale, and assemble one raised track with a portrait camera. Keep the core's 24 actual formation slots and limited camera edge correction; decorative native physics must not determine authoritative hit outcomes.
4. Prove the bounded native slice in Play-in-Editor: touch/mouse steering, gate arithmetic, enemy/roller contact, real pickup and relic effects, independently damaged parts, guarded/core transitions, heal/Last Stand/revive/decline, pause, retry and saved progression. Then expand to the other two accepted stages.
5. Use the installed engine's Turnkey to verify the Android toolchain, package ARM64, and test the Nothing Phone (3). Measure actual installed size, startup, memory, thermals and a sustained 20-minute session. Optional chapters, purchases and iOS remain separate acceptance milestones unless the user changes scope.

The existing `tools/build_android.ps1 -VerifyToolchainOnly` **still passes `-UpdateIfNeeded` to Turnkey**. It is not a strictly read-only preflight and may install/update prerequisites. This audit did not run it. Before using it in a no-install check, separate verification from repair as a deliberate tooling change.

## Reproducible evidence

`tools/audit_native_readiness.ps1` performs standard local discovery and writes `builds/native-readiness-audit.json`. It does not execute Unreal, install software, compile, or contact a phone. Engine SDK JSON files are the primary version source; prior setup logs supply the earlier failed build evidence. This receipt should be refreshed after toolchain setup rather than treating these findings as permanent.
