# Mechalord implementation status â€” 4 October 2026

## Current rebuild: Iron Front

The active branch is `feature/iron-front-lanes-and-arsenal`; `main` at `7975736` preserves the preceding build. The browser preview now contains three selectable authored stages: Relic Causeway, Roller Foundry and Citadel Breach, with saved completion/best scores, immediate retries and a Next Level flow.

This iteration adds clear paired gates, moving rollers, larger rounded troop formations, denser enemy waves, Reaver elites/ranged units, four earned weapon tiers, restricted relic recharge, and actual incoming boss shells/orbs/rockets. Environment palettes and roadside props change per stage. New Cinder Reaver and Forge Tyrant assets have editable Blender sources, measured geometry and verified articulated pivots. They are provisional local modeling interpretations of original generated concepts; they are not TRELLIS conversions or accepted final production art.

The current C++/WASM combat passed 30 automated checks, including all nine stage/relic combinations, projectile hits and misses, gate operations, XP, roller collisions, pause/resume, fixed-step equivalence and 250 retries. These are automated feasibility results, not evidence of first-time-player comprehension, native engine integration or mobile performance. See `rebuild-validation.md` and `villain-assets-v3.md`.

The first Relic Causeway preview was rejected by the user. Its visual presentation is superseded, not accepted art. Open http://127.0.0.1:8077/playable/index.html for the rebuilt Iron Front encounter.

The rebuild uses portable C++ AssaultSimulation and actual projectile collision. Approaches last 55, 60 or 65 seconds before the boss, with immediate enemies, dense formations, breakable weapon crates, shootable positive/negative gates, and Shield/EMP/Overdrive. The centered portrait camera and compact HUD keep the battle visible.

The four user-supplied clips and another Top Lords gameplay clip were visually inspected. Some are labeled Top War Ads Review; they are design references, not verified Top Lords shipping-level evidence. See top-lords-rebuild-study.md.

The new AssaultSimulation is portable C++ and is compiled to assault.wasm for this preview. It is NOT yet wired into the existing Unreal runtime adapter, which still uses BattleSimulation. Porting that adapter and native validation remain required. The detailed original TRELLIS commander is retained; scenery/enemy/boss art still requires production work and user evaluation.

## Milestones

| Milestone | Delivered | Still required |
| --- | --- | --- |
| M1 | Research, design brief, original pilot references, asset register, production folders | First-time-player observations |
| M2 | Preserved TRELLIS commander, editable Blender source, 19,537-triangle detailed export, 3,980/1,980-triangle candidates, first-pass 14-bone Idle/Run rig | Joint cleanup, remaining faithful pilot models, native import verification, APK and Nothing Phone (3) measurements |
| M3 | Five native stage definitions, C++ simulation, Unreal runtime/HUD/save/upgrade source, editor bootstrap, three playable browser stages | Unreal compilation, generated maps/data assets, native playtests of three bundled stages |
| M4 | ChunkDownloader wrapper, chapter UI, manifest/server tools and failure checks, optional-chapter labels | Cooked packs, base-package staging exclusion, native download/mount/offline tests |
| Later economy | Gems, revive, bundles, skins, characters, weapons and unlock research in monetization.md | Separate economy design and later billing integration; no payments active |

## Evidence and limits

- Rebuilt-core checks are recorded in builds/rebuild-test-results.json with the actual binary hash. See rebuild-validation.md. Older BattleSimulation results are retained as historical evidence only; they do not validate the new combat.
- Browser checks cover boot, actual drag movement, projectile impacts, troop growth, weapon progression to level 3, pause/resume, retry, Shield and the runner-to-boss transition. Final camera and responsive-layout inspection are recorded in rebuild-validation.md.
- The source commander retains its 19,537 triangles and first-pass local animation. The crowd uses instanced reduced commander meshes. Enemy crawler, boss and scenery remain provisional; the rejected earlier environment is not approved art.
- Desktop preview density exceeds the original 80-representative mobile target. That target requires a native quality profile and device measurements before acceptance; there is no mobile performance claim.
- The original sample GLB remains preserved byte-for-byte. No paid generation or conversion service was submitted. Meshy remains discontinued.
- No Unreal build, asset import, Android packaging or physical-device performance validation has run.

## Current blocker

Epic Launcher is installed. The expected UE_5.8 folder contains only .egstore; UnrealEditor.exe is still absent as of the latest check. Unreal download/toolchain completion is required for native validation. No Android package size, frame rate, memory result, or older-phone support is claimed.

See playable-preview.md for the preview and setup.md / unreal-runtime.md for the native continuation.
