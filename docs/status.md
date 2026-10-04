# Mechalord implementation status — 5 October 2026

## Current browser rebuild: Iron Front v7

The browser preview contains three selectable authored stages: Relic Causeway, Roller Foundry and Citadel Breach, with saved completion, best scores, XP-derived commander rank, immediate retries and a Next Level flow. Open http://127.0.0.1:8077/playable/index.html. Portable C++ `AssaultSimulation`, compiled to WASM, implements the current combat.

Forward travel stays continuous. Threats enter from beyond the top of a close portrait view; default fire is straight. Earned full-run weapons persist, while temporary Guided, Cannons and Railburst pickups override them and then restore the starter. Six physical pickups include independent Freeze, Slow and clearly labeled voluntary Haste. Logical army counts stay authoritative; at most 24 simulation-owned follower representatives handle rendering, firing and swept contact. Proportional casualties permanently remove visible slots; real recruitment adds them back.

The commander has separate HP and real spillover damage from unblocked troop losses. Manual healing costs 20 troops for up to 25 missing HP, at least 10 HP missing, twice per run. Fatal commander damage with enough troops freezes combat in Last Stand: explicitly spend 30 troops to revive at 50 HP once, or accept defeat. Costs are never spent automatically.

The stronger Forge Tyrant uses charged reactor lasers, briefly guided rockets that commit to a dodgeable path, sweeping fire and heavy barrages. Sequential cannon, booster and leg breaks change attacks and movement. The legless torso settles near the deck and stops moving. Armor exposes the original reactor; missing the first core window permits one hardened rebuild, preserving core wounds and broken parts. Real core destruction keeps a 2.5-second destruction sequence before victory. Component breaks use paired damage thresholds, not individually targeted limb hitboxes. Current art remains provisional.

Validation: **56/56 actual C++/WASM checks**, **44/44 combat-visual CPU checks**, and the HUD/progression/audio harness pass. All nine rank-zero stage/relic routes win without commander healing or revival in 84.93–120.33 seconds; stronger fights can exceed the initial 60–90-second target. The measured contact audit found zero silent overlaps in 12,127 run frames and 2,762,563 formation/body comparisons. These are automated feasibility and geometry checks, not first-time-player acceptance or GPU/device measurements. See [frontline-v7-validation.md](frontline-v7-validation.md) for browser evidence and the pinned hash; raw core results are in `builds/rebuild-test-results.json`.

## Native Unreal workstream

**Unreal 5.8.3 is installed and verified**, changelist 58210709; `UnrealEditor.exe` exists. An actual `MechalordEditor` build was attempted and failed on the Windows toolchain prerequisite: SDK 10.0.19041.0 is missing and MSVC was not detected. No successful game compilation or Android package is claimed.

The existing Unreal GameMode still owns the older `BattleSimulation` runner-to-launcher battle. Compiling `AssaultSimulation.cpp` as module source will not connect v7 combat to that mode. A native assault adapter, matching HUD/save behavior, actual map/import validation and Nothing Phone (3) testing remain required. See [native-gap-v7.md](native-gap-v7.md) for the inspected interfaces and minimum port.

A separate content-only project, `game/MechalordArtLab`, is being built and tested for native asset inspection while the compiler prerequisite is unresolved. It is not the playable v7 game. Its validation remains in progress; use [unreal-artlab.md](unreal-artlab.md) for current receipts and limits rather than treating file creation or an editor connection as acceptance.

## Milestones

| Milestone | Delivered | Still required |
| --- | --- | --- |
| M1 | Research, design brief, original pilot references, asset register and folders | First-time-player observations and final art acceptance |
| M2 | Preserved source commander, editable Blender source, detailed/mobile candidates and first-pass animation; native Art Lab work in progress | Accepted pilot assets, verified engine scale/materials/animation, APK and Nothing Phone (3) measurements |
| M3 | Three-stage browser combat; legacy Unreal runtime/HUD/save source and bootstrap | Supported Windows C++ toolchain, successful build, v7 adapter, current native scene and Play-in-Editor validation |
| M4 | Legacy ChunkDownloader source, manifest/server tools and optional-chapter rules | Cooked packs, exclusion audit, native mount/offline tests; current assault integration comes first |
| Later economy | Gems, bundles, skins, characters, weapons and unlock research | Separate later economy/billing design; no payments active. Current troop-funded transfer is free |

## Preserved work and limits

Local TRELLIS generation and repair were canceled by the user. The user ran `tools/remove_local_trellis.ps1`, removing all 35 inventoried targets totaling 4,096,286,002 bytes; the subsequent check found no remaining cleanup targets or TRELLIS processes. Do not resume or restore that pipeline. Preserved game assets, original references and Blender remain. Meshy is discontinued; no paid generation or conversion service was submitted.

No APK, installed-size measurement, sustained phone frame rate, older-phone support or first-time-player result is claimed. Browser graphics/CPU checks do not validate Android. Native continuation is documented in [setup.md](setup.md) and [unreal-runtime.md](unreal-runtime.md).
