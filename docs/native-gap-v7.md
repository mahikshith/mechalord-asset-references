# Native Unreal readiness and current-combat adapter gap

Inspected locally on 5 October 2026. Installed `C:\Program Files\Epic Games\UE_5.8\Engine\Build\Build.version` reports Unreal 5.8.3, changelist 58210709, and `UnrealEditor.exe` exists. Earlier setup/runtime documents still describe an absent engine; those statements are now stale. This workstream did not launch the editor, bootstrap assets, cook, or compile the project. The parent build attempt reports a missing Win64 SDK and no detected MSVC toolchain; engine installation alone does not provide the required project compiler.

## One bounded compile repair

`UMechalordBattleWidget::Button` accepts an output `UTextBlock*&`. Five existing calls pass `TObjectPtr<UTextBlock>` members instead. The installed engine's `ObjectPtr.h` supplies an implicit conversion to a raw pointer by value, but its mutable-reference conversion is explicit. Those member arguments therefore cannot bind implicitly to the old output parameter.

An overload accepting `TObjectPtr<UTextBlock>&` now delegates through a local raw pointer, then assigns the reflected member normally. Existing call sites and widget behavior are preserved. Source and the installed pointer header were checked; this correction has not received an actual Unreal compile because the toolchain prerequisite is missing.

The current ChunkDownloader adapter's `Initialize`, `Finalize`, `Shutdown`, `UpdateBuild`, `GetContentBuildId`, `DownloadChunks`, `MountChunks`, `GetChunkStatus`, and loading-stat members were checked against the installed plugin header. Those referenced names and signatures exist. This is an API inspection, not downloader runtime validation.

## The current battle is not wired into Unreal

| Boundary | Existing native implementation | Current portable combat requirement |
|---|---|---|
| Simulation | GameMode owns `mech::Battle` from `BattleSimulation.h`; old runner-to-launcher siege | `mech::assault::Battle` from `AssaultSimulation.h`, already present in the same module source |
| Phases | Menu, Run, Siege, Won, Lost | Ready, Run, Boss, Destroying, Won, Lost, LastStand; map explicitly because enum ordinals differ |
| Levels | Five legacy `mech::Stage` data assets and chapter gating | Three authored assault levels via `Start(relic, level, rank)` |
| Input | Normalized −1..1 lane; old champion action | Convert input to world lane −3..3; Activate, Heal, Revive, DeclineRevive, pause, retry |
| Snapshot/HUD | Army/reserve, champion charge, old core/base HP | Commander HP, travel progress, weapons/XP/permanent starter, temporary powers, one boss HP bar, Last Stand and explicit troop costs |
| Arena | Old wave counts/launcher packets represented by pooled cubes | Authoritative 24-slot formation, target transforms, friendly/enemy projectiles, pickups, lasers, boss parts and destruction effects |
| Commander/camera | Legacy pawn at lane ×260cm, fixed camera and imported HF commander | Current commander and four-column formation; coherent metres-to-centimetres mapping and portrait framing |
| Save | Coin upgrades, sequential five-stage/relic unlocks | Current XP-derived rank and earned starter weapons; browser storage is separate and does not automatically migrate to Unreal SaveGame |

`AssaultSimulation.cpp` is ordinary module source, so the normal Unreal target will compile it once its toolchain is ready. Compiling it does not connect it to the existing GameMode. Renaming includes alone would fail: the two Battle classes have different fields, method contracts, entities, and phase ordinals.

## Bootstrap and assets

The project Content directory has no generated map/assets at this inspection. DefaultEngine.ini points to `/Game/Mechalord/Maps/Entry`; the bootstrap script can create that map after the module builds. Its default pipeline imports the earlier HF commander source and skeletal candidate, creates the five legacy stage data assets, and leaves old experimental troops/environments out. The referenced local HF source, texture, animation FBXs and five layout JSONs exist, so there is no missing-file failure established for that legacy route. It nevertheless does not bootstrap the current approved browser scene.

Current local commander, troop, and Forge Tyrant GLBs exist under `delivery/playable`; the current villain sources also exist as local Blender files. The existing FBX importer should not be assumed to import those GLBs or preserve their named mechanical parts. A native art import should use engine-supported imports or deliberate local FBX exports and inspect scale, textures, pivots, hierarchy, and animation in the actual editor. The parent is creating a separate content-only Art Lab for this bounded asset work while C++ tools are pending.

## Smallest native playable slice

1. Finish the supported Windows SDK/MSVC prerequisite, then build `MechalordEditor` and resolve actual UHT/compiler diagnostics. Keep the existing legacy mode available rather than accidentally presenting it as the current combat port.
2. Add an assault-specific mode/arena adapter around the exact current C++ simulation. Start with level zero, rank zero; call `Advance(seconds, lane)` once per tick, render authoritative formation/target/projectile data at 100cm per metre, and consume effects once after presentation. Preserve fixed-step core behavior; do not add engine-physics damage that duplicates core collisions. Add explicit phase mapping and manual heal/revive actions. Render through Destroying and the commander-death transition before showing results.
3. Import the current commander, troop, and boss, assemble a simple raised dark track, and expose a compact native HUD for army, commander HP, relic charge, weapon progress and boss health. First prove movement, one gate, enemy/roller contact, one power pickup, Last Stand/revive/decline, boss destruction and retry. Then connect the remaining two authored levels and saved XP/rank. Optional chapter downloads and the obsolete launcher UI are outside this first assault slice.

Acceptance requires actual Play-in-Editor observations and build logs: current simulation identity, visible hit/count changes, pause/suspend, no auto-spend, no duplicate consumed effects, stable pooled objects on repeated retry, and working imported materials/orientation. Android Turnkey, package sizes, phone controls and the Nothing Phone (3) sustained-performance session follow the native slice; no browser or header inspection establishes those results.
