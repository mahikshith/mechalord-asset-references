# Mechalord implementation status - 5 October 2026

## Current rebuild: Iron Front

Local TRELLIS generation and Blender repair work was canceled by the user on 4 October 2026. Do not resume it. The user ran `tools/remove_local_trellis.ps1`, removing all 35 inventoried targets totaling 4,096,286,002 bytes. A subsequent read-only check confirmed zero remaining cleanup targets and zero TRELLIS processes. The playable game, original concept reference and Blender remain present. No system-wide Python packages were installed for this portable pipeline; pre-existing shared libraries were preserved. Git history was not rewritten.

The active branch is `feature/iron-front-lanes-and-arsenal`; `main` at `7975736` preserves the preceding build. The browser preview now contains three selectable authored stages: Relic Causeway, Roller Foundry and Citadel Breach, with saved completion/best scores, immediate retries and a Next Level flow.

The latest browser rebuild keeps forward travel continuous, places the commander low in a close portrait view, and introduces threats from beyond the top. Straight default fire is separate from earned guided missiles, hand cannons and railburst. Elites and shootable orbs drop physical pickups. Commander XP and ranks carry earned benefits across stages.

The checker floor has been replaced by a continuous dark industrial deck. Eighteen seeded side modules add varied rails, robotic welding arms, fans, cranes, tanks and storage bays. Troop cyan shots and commander gold shots have actual distinct origins. Simulation-owned formation positions drive rendering and swept contact with enemies, rollers and projectiles. A narrower four-column formation provides dodge space. Casualties permanently remove proportional representative slots from simulation and rendering; only actual recruitment adds them back. The commander has separate HP, real spillover damage from unshielded troop losses and posed-mesh destruction. Six distinct physical pickups include independent Freeze, Slow and optional risky Haste, with short commander acquisition effects.

The boss uses jet-assisted lateral, depth and height movement, three attack patterns, a second weapon phase and one top health bar. Armor breaks expose a vulnerable core; a surviving core can trigger exactly one hardened rebuild. Core wounds persist and the final exposure remains open until victory. Surviving bosses remain visible after player defeat. These remain provisional original assets, not newly converted TRELLIS models or accepted final production art.

Validation: 48 actual C++/WASM checks and 37 combat-visual CPU checks pass, plus UI/progression/health/audio and 7,200-update environment checks. All nine baseline-rank stage/relic automated routes win in approximately 79-92 seconds. Browser checks show core exposure/rebuild, persistent troop losses and portrait UI. Human balance review is still required. See frontline-v6-validation.md; reference-review-v5.md records the prior video research.

Open http://127.0.0.1:8077/playable/index.html for the current browser build. Physical phone performance, final art acceptance and first-time-player comprehension remain unverified.

AssaultSimulation is portable C++ compiled to WASM. It is NOT yet wired into the existing Unreal runtime adapter, which still uses BattleSimulation. Native adapter integration, compilation, packaging and Nothing Phone (3) validation remain required. No new TRELLIS installation or paid generation service was used.

## Milestones

| Milestone | Delivered | Still required |
| --- | --- | --- |
| M1 | Research, design brief, original pilot references, asset register, production folders | First-time-player observations |
| M2 | Preserved TRELLIS commander, editable Blender source, 19,537-triangle detailed export, 3,980/1,980-triangle candidates, first-pass 14-bone Idle/Run rig | Joint cleanup, remaining faithful pilot models, native import verification, APK and Nothing Phone (3) measurements |
| M3 | Five native stage definitions, C++ simulation, Unreal runtime/HUD/save/upgrade source, editor bootstrap, three playable browser stages | Unreal compilation, generated maps/data assets, native playtests of three bundled stages |
| M4 | ChunkDownloader wrapper, chapter UI, manifest/server tools and failure checks, optional-chapter labels | Cooked packs, base-package staging exclusion, native download/mount/offline tests |
| Later economy | Gems, revive, bundles, skins, characters, weapons and unlock research in monetization.md | Separate economy design and later billing integration; no payments active |

## Evidence and limits

- Rebuilt-core checks are recorded in builds/rebuild-test-results.json with the actual binary hash. See frontline-v6-validation.md. Older BattleSimulation results are retained as historical evidence only; they do not validate the new combat.
- Browser checks cover boot, actual drag movement, projectile impacts, troop growth, weapon progression to level 3, pause/resume, retry, Shield and the runner-to-boss transition. Final camera and responsive-layout inspection are recorded in rebuild-validation.md.
- The source commander retains its 19,537 triangles and first-pass local animation. The crowd uses instanced reduced commander meshes. Regular enemies now use instanced modeled robots; boss and scenery remain provisional; the rejected earlier environment is not approved art.
- Desktop preview density exceeds the original 80-representative mobile target. That target requires a native quality profile and device measurements before acceptance; there is no mobile performance claim.
- The original sample GLB remains preserved byte-for-byte. No paid generation or conversion service was submitted. Meshy remains discontinued.
- No Unreal build, asset import, Android packaging or physical-device performance validation has run.

## Current blocker

Epic Launcher is installed. The expected UE_5.8 folder contains only .egstore; UnrealEditor.exe was absent at the previous installation check (not rechecked during v6 browser work). Unreal download/toolchain completion is required for native validation. No Android package size, frame rate, memory result, or older-phone support is claimed.

See playable-preview.md for the preview and setup.md / unreal-runtime.md for the native continuation.
