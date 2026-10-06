# Mechalord / Iron Front — detailed handoff

Prepared 7 October 2026 (Asia/Kolkata). Working branch: `codex/iron-front-single-siege`. This supersedes the earlier three-boss campaign design. Older reports and proof folders describe their own checkpoints, not necessarily this build.

## Delivered changes

The user prefers established Iron Front characters/combat over the Reforged replacement, but liked the latter's environments and colors. This delivery keeps Iron Front actors and reuses only the retained native environment assets to create one changing battlefield.

| Latest request | Implementation | Source under `tools/playable-preview` unless stated |
|---|---|---|
| Replace Overdrive circles | Barrage opens paired shoulder racks and launches real rockets, with armor articulation, recoil and actual launch flashes. No old body/floor rings or ordinary-fire boost. | `storm-battery.ts`, `relic-effects.ts`, portable core |
| Improve congested laser clash | Coherent tapered blue/orange beam volumes, smaller halos, separated lightning and open contact shock front. Actual pressure drives color/advection. | `plasma-beam-style.ts`, `combat-visuals.ts`, `laser-clash-visuals.ts` |
| Faster walking after boosters break | Grounded translation and leg/knee stride follow actual authoritative movement, slower with one surviving leg and planted for committed attacks. | `game/Mechalord/Source/Mechalord/AssaultSimulation.cpp` and pose path |
| Verify target part highlights | Confirmed positive-damage event flashes its exact whole component white, independently of the quieter next-vulnerable-part cue. Core flash fits its oval face. | `boss-rig-adapter.ts`, `world.ts` |
| One nonrepetitive level / one boss | One 51-event, 198-second approach with seamless viaduct/trench/citadel zones, then one Tyrant and one reward. Upcoming scenery appears before boundaries. | `CampaignEncounters.h`, `continuous-route-environment.ts`, `main.ts` |

These are implementation facts. Automated checks do not establish user aesthetic acceptance, addictive play or commercial readiness.

## Exact combat and route contract

Campaign index 5 is the default Iron March; indices 0–4 remain standalone practice fronts. They are not successive bosses within the campaign. Whole travel target is 732.6 units. Zones span 0–62, 62–128 and 128–198 seconds, with distance markers 229.4 and 473.6. Time-altering powers may change wall-clock duration.

Zone markers preserve enemies, shots, pickups, formation, health, weapon progress and relic timers. `actStart` is a cue, never a world reset. HUD progress is global `travelDistance / travelGoal`; `actProgress` is only the local zone fraction. Only final core destruction opens the single absorption choice. Choosing one Laser / Vitality / Endurance imprint saves a replacement benefit for the next assault and ends the run; no further boss is spawned.

The final Tyrant has base armor 3,200 and core HP 900. Parts determine available attacks and mobility. Grounded speed limits with two legs: 2.7 lateral / 2.16 depth units per second; one leg: 1.45 / 1.16. It plants during locked attacks. Broken boosters do not regain booster evasion. Whole-part flashes require a real positive hit; targeting guidance does not make other vulnerable parts invulnerable.

**Barrage**, relic slot 2, immediately fires a pair and then pairs every 0.56 seconds. Base budget is 18 rockets over five seconds; Endurance extends to 5.75 seconds / 22 rockets. Slot/ABI remains stable; C++ `Overdrive` is only an enum alias. Ordinary bullets keep their existing damage and cadence. The independent six-rocket Salvo pickup remains.

Rocket origins are `(commanderX ± 0.68, height 2.11, forwardZ 0.92)`; renderer depth is negated. Real shot IDs trigger rack flashes. Salvo-kind projectiles use the accepted missile/fire/smoke renderer. Direct damage is `12 + weaponLevel * 0.8`, with existing 12-damage / 1.6-unit Salvo splash on other lane enemies. Guidance is gently bounded for the first 0.6 seconds; target part and boss epoch are immutable. Pause/retry holds or clears real budgets and shots.

Existing plated Shield, EMP clear/stun, enemy shield breakage, health drops, part destruction, Last Stand/transfer/revival and clash controls remain in the portable simulation. Retention does not claim a new full visual acceptance of each earlier feature. See `docs/single-siege-core.md` for focused mechanics and test launchers.

## Runtime and file map

The playable game currently runs **portable C++/WASM plus Three.js**, not Unreal physics. The fixed-step `AssaultSimulation.{cpp,h}` owns authoritative movement, damage, troop accounting, spawn ledger, shots, powers, phases and parts. `CampaignEncounters.h` defines authored route events. `assault_bridge.cpp` publishes the ABI, decoded by `assault-core.ts`. Normal play and review share the same core and `Battlefield` renderer.

| Area | Main files |
|---|---|
| Normal menu/input/HUD/rewards/saves | `main.ts`, `index.html`, `style.css`, progression/save modules, `chapter-catalog.ts` |
| Accepted actors/camera/event dispatch | `world.ts`, `boss-rig-adapter.ts`, existing actor adapters |
| Continuous world / palettes | `continuous-route-environment.ts` |
| Physical shoulder power | `storm-battery.ts` through `relic-effects.ts` |
| Beam/clash effects | `plasma-beam-style.ts`, `combat-visuals.ts`, `laser-clash-visuals.ts` |
| Synthesized audio and lifecycle | `audio.ts` |
| Internal automated QA | `review.ts`, `review.html` |
| Canonical build | `build_assault.ps1`, `build.mjs` |

The route uses 14 GLBs from `assets/exports/reforged`, including suspended islands/spine, trench walls/reactors/cooling banks, articulated cranes and the final citadel bowl. Accepted characters are not swapped. A fixed 9.7-unit dark deck and distance-anchored recycled sections keep lane geometry aligned. Palette transitions are gradual. The final rear seal is fixed to the one arena. Practice fronts retain their older environment adapters.

Measured CPU environment peak: 24 active batches, 150 instances and 251,536 triangles, excluding actors/effects. This is a phone performance risk to measure, not a mobile acceptance. High-detail Blender/source exports are retained separately; not all models satisfy the original early triangle targets.

## Run and rebuild

The checked-in browser delivery runs without a compiler. From repository root:

```powershell
python -m http.server 8077 --bind 127.0.0.1 --directory delivery
```

Open `http://127.0.0.1:8077/playable/index.html`. Reuse an existing working server on that port. Do not double-click HTML; the assets/core require HTTP fetching. This is local development hosting, not deployment.

Rebuild with installed Node, lockfile dependencies and the existing compatible Zig distribution:

```powershell
Push-Location tools/asset-viewer
npm ci
Pop-Location
& .\tools\playable-preview\build_assault.ps1
node tools/playable-preview/build.mjs
```

The core script expects `tools/vendor/zig-x86_64-windows-0.17.0/zig.exe`, deliberately untracked. A fresh checkout needs a compatible official compiler distribution at that path. The working local runtime is retained; scripts do not silently install one. Target is `wasm32-wasi`, C++17, optimized, reactor model, no exceptions/RTTI. Compile core first, bundle second. Never pair a new ABI with an old decoder.

The bundler copies accepted actors/14 environment GLBs and writes `builds/playable-build-manifest.json`. WASM has an immutable hashed filename embedded in JS; HTML pins JS/CSS hashes. Old hashed cores remain to serve previously cached bundles. `.gitattributes` preserves delivery bytes across Windows checkouts.

Current core SHA-256: `281386d8b075f499a10aee8c3e3f2282c9e9fd39c024ed50126b5e3a330ccf46`.

Current asset: `assault.281386d8b075f499.wasm`. Consult the manifest for exact HTML/JS/model/environment hashes. Receipt timestamps use UTC.

## Verification scope

Native focused fixture: 130 assertions for timeline ordering/distinctness, seamless zones, one reward, real rockets, no legacy multipliers, immutable targeting, pause/retry, grounded gait and frame-rate agreement. Shield/finite-beam regression: 41 checks. Shipping-adapter routes/checks use the canonical SHA above, recorded in `builds/unbroken-campaign-audit.json`, `player-target-route-audit.json` and assault receipt.

CPU renderer checks include 16 relic groups, 7 beam-pressure groups, 19 combat-presentation groups, 11 commander-power groups, 64 combat-visual groups, 10 unbroken-render groups, 9 boss-adapter groups and 12 unbroken-presentation groups. They inspect real geometry/transforms/lifecycle but do not establish rendered appearance. The 16 UI groups use a mocked core; they check controls, menu, save/reward/retry and global route progress, not actual damage. Environment checks inspect 6.1 million transformed vertices and 3,000 bounded updates, clearance, pause and disposal.

Self-bundling visual/UI tests can run directly, for example:

```powershell
node tools/playable-preview/test_relic_effects.mjs
node tools/playable-preview/test_laser_pressure.mjs
node tools/playable-preview/test_continuous_environment.mjs
node tools/playable-preview/test_ui_progression.mjs
```

The verified Node v24.19.0 can also run `test_unbroken_campaign.mjs`, `audit_player_target_route.mjs` and `test_assault.mjs` directly: explicit TypeScript imports require only built-in type stripping. Exact successful commands are in `docs/single-siege-core.md`; older Node versions may need a compatible runtime. Native fixtures compile separately against the same sources. Winning routes use automated aim/threat prediction and are feasibility evidence, not human fairness or replay appeal.

New browser evidence lives in `delivery/single-siege-proof`, with a report distinguishing ordinary input from internal replay. Historical screenshots/GIFs remain tied to previous builds. Audio buffers/source-limit tests do not verify audible mixing. First-time players and phone measurements remain required.

## Preservation and publication

User authorized committing/pushing project work to `https://github.com/mahikshith/mechalord-asset-references`. Remote main originally contains chosen image references. Publish the new branch without force-overwriting that history. Previous checkpoints: `codex/iron-front-unbroken-campaign` at `2cb2e38`, `codex/iron-front-reactor-siege` at `85c107e`; Reforged comparison branches remain.

Include source assets, Blender sources, exports, historical evidence and selected build receipts. Exclude installed dependencies, compiler/vendor runtimes, engine caches, credentials and temporary build objects. Already removed TRELLIS/failed repair files are deletions, not restoration candidates. No model weights/packages should return.

Asset provenance is documented separately in `docs/asset-provenance-publication.md`. Current commander/troop derive from a user-supplied external reconstruction; missing upstream Space/output-license details remain a commercial release task. No reference-game assets were copied.

## Native and product limitations

Locally inspected Unreal is 5.8.3, changelist 58210709. `game/MechalordArtLab` is an asset workshop. The native runtime still wires the legacy mode, not the accepted assault. Windows compiler/SDK and Android NDK/Java setup were incomplete in the last audit. See `docs/native-readiness-2026-10-06.md`; refresh after setup changes. Installation alone is not a working editor connection/native port.

No APK/IPA, Nothing Phone (3) test, older-phone support claim, measured installed size, native content-download acceptance or iOS signing is delivered. Port one accepted slice using the same authoritative pose/parts, verify it in-editor, then package Android. A separate compatible 2–3 GB device remains required for older-phone claims.

Next priorities: normal-play review of beam pressure/Barrage/part cues/gait; human threat/recovery tuning; combined actor/environment/effect performance and memory; audible mix; provenance/license clearance; native adapter and physical-device testing. Do not tune difficulty by only raising all enemy HP. Engineer repair was not observed in the automated continuous campaign routes and needs a targeted reachability check.

Gems, individual/bundle revival, skins, heroes, weapons and paid unlocks are later user-requested research. No payment/paywall/ad/store is active. Free retries and winnable prototype stages remain.

## Continuation pitfalls

- Never reset the campaign world on `actStart`; do not reintroduce three zone victories/bosses.
- Keep global and local progress separate. Slot 2 means Barrage despite the compatibility enum name.
- Authoritative origins/region identities determine damage and beams. Animated socket guesses must not bend published attacks.
- Pause/clash/revival/reward holds freeze effect and simulation time; retry clears shot IDs and budgets.
- Use UTF-8 explicitly on Windows for source/Markdown. Preserve build/receipt hashes.
- Do not restart TRELLIS/Meshy or silently replace accepted Iron Front actors with rejected Reforged ones.
