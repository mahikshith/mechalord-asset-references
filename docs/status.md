# Mechalord implementation status â€” 4 October 2026

## Current rebuild: Iron Front

Local TRELLIS generation and Blender repair work was canceled by the user on 4 October 2026. Do not resume it. The user ran `tools/remove_local_trellis.ps1`, removing all 35 inventoried targets totaling 4,096,286,002 bytes. A subsequent read-only check confirmed zero remaining cleanup targets and zero TRELLIS processes. The playable game, original concept reference and Blender remain present. No system-wide Python packages were installed for this portable pipeline; pre-existing shared libraries were preserved. Git history was not rewritten.

The active branch is `feature/iron-front-lanes-and-arsenal`; `main` at `7975736` preserves the preceding build. The browser preview now contains three selectable authored stages: Relic Causeway, Roller Foundry and Citadel Breach, with saved completion/best scores, immediate retries and a Next Level flow.

The current frontline rebuild resolves contact combat instead of scrolling enemies through the army. Progression follows travelled distance and stops for close engagements or aimed upgrade crates. Regular enemies are modeled clockwork robots. Solid missiles, impact flashes, falling armor, whole-legion Shield, targeted EMP arcs and Overdrive trails make combat consequences visible. The boss strafes, advances, winds up its weapons and fires from its actual location. Its 2.5-second destruction sequence leaves a bounded static wreck until retry.

The raised causeway uses segmented beveled masonry, service ledges, arches, supports, gears and three stage palettes, with shared original stone textures. A lower perspective camera, larger troops and compact boss HUD protect the playable area. These remain provisional original game assets, not accepted final production art or new TRELLIS conversions.

Current validation: 31 actual C++/WASM checks and 18 combat-visual resource/behavior checks pass. All nine stage/relic automated routes win. The live browser Causeway run also reached victory; steering, Shield, earned weapon progression, pause/resume and Next Level were exercised. See `frontline-v4-validation.md` for evidence and boundaries.

The first Relic Causeway preview was rejected by the user. Its visual presentation is superseded, not accepted art. Open http://127.0.0.1:8077/playable/index.html for the rebuilt Iron Front encounter.

The rebuild uses portable C++ AssaultSimulation and actual projectile collision. Approach duration varies with encounter resolution; the previous fixed 55/60/65-second progression is superseded. Current automated full runs range from approximately 45 to 94 seconds. Shield/EMP/Overdrive and weapon XP are earned without purchases.

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

- Rebuilt-core checks are recorded in builds/rebuild-test-results.json with the actual binary hash. See frontline-v4-validation.md. Older BattleSimulation results are retained as historical evidence only; they do not validate the new combat.
- Browser checks cover boot, actual drag movement, projectile impacts, troop growth, weapon progression to level 3, pause/resume, retry, Shield and the runner-to-boss transition. Final camera and responsive-layout inspection are recorded in rebuild-validation.md.
- The source commander retains its 19,537 triangles and first-pass local animation. The crowd uses instanced reduced commander meshes. Regular enemies now use instanced modeled robots; boss and scenery remain provisional; the rejected earlier environment is not approved art.
- Desktop preview density exceeds the original 80-representative mobile target. That target requires a native quality profile and device measurements before acceptance; there is no mobile performance claim.
- The original sample GLB remains preserved byte-for-byte. No paid generation or conversion service was submitted. Meshy remains discontinued.
- No Unreal build, asset import, Android packaging or physical-device performance validation has run.

## Current blocker

Epic Launcher is installed. The expected UE_5.8 folder contains only .egstore; UnrealEditor.exe is still absent as of the latest check. Unreal download/toolchain completion is required for native validation. No Android package size, frame rate, memory result, or older-phone support is claimed.

See playable-preview.md for the preview and setup.md / unreal-runtime.md for the native continuation.
