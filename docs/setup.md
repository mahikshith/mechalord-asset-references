# Mechalord setup

## Immediate local playtest

The current server serves delivery on http://127.0.0.1:8077. Open /playable/index.html. To restart it, run tools/start_playtest.ps1 from PowerShell. No generation account is needed. Details and checks are in playable-preview.md.

## Unreal continuation

Epic Launcher is installed; UE_5.8 is downloading but no editor binary was found at the last check. The verified target is 5.8.3; tools/launch_unreal.ps1 reads the actual engine Build.version and records it before use. The project descriptor targets the 5.8 line.

Complete the engine installation with Android support. Use the C++ toolchain supported by the installed patch and let Unreal Turnkey verify its matching SDK/NDK/JDK. Do not substitute guessed toolchain versions.

Then run tools/launch_unreal.ps1 -Build -Bootstrap -Launch. It builds the existing editor target, runs tools/bootstrap_unreal.py, and opens game/Mechalord/Mechalord.uproject. This sequence has not run yet because the editor is absent. Bootstrap creates Entry, imports source assets, builds unlit material/data assets and chapter labels. Experimental rejected art is excluded by default. See unreal-runtime.md.

If live Unreal MCP tools become available, probe them read-only before editing. Installing the skills plugin alone does not establish an editor connection.

Use tools/build_android.ps1 for Turnkey and development ARM64 ASTC packaging. Connect Nothing Phone (3) with USB debugging and authorize the PC on the phone. Record physical device startup, installed size, memory and sustained frame time; desktop/browser observations do not establish Android performance.

Before downloadable-chapter acceptance, verify chunk 1001 is excluded from the initial APK/OBB, shared resources stay in base chunk, and downloaded content mounts with verified compatibility/integrity. See chapter-delivery.md. Production HTTPS hosting remains a later milestone.

Blender is installed and is used locally for source cleanup, rigging and export. Meshy and additional paid conversion routes are discontinued.
