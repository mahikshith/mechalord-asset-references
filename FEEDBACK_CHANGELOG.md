# Changes made after the latest gameplay feedback

Prepared 7 October 2026, Asia/Kolkata. Branch: `codex/iron-front-single-siege`.

## Comparison scope and commits

This document explains the gameplay changes made after the feedback requesting: a replacement for Overdrive; a stronger, clearer laser clash; faster walking after the boss loses boosters; verification of hit-part highlighting; and one changing environment with one final boss instead of three stacked levels.

The comparison starts at the last saved version **before that feedback**, `2cb2e38`, and ends at the published implementation, `73430b6`. This documentation update itself does not change gameplay or rebuild its binaries.

| Commit | Role |
|---|---|
| [`2cb2e38`](https://github.com/mahikshith/mechalord-asset-references/commit/2cb2e38) | Baseline: verified live-animation fixes and the earlier campaign interpretation. |
| [`215f6e4`](https://github.com/mahikshith/mechalord-asset-references/commit/215f6e4) | Implemented the single campaign timeline, real Barrage mechanics, grounded boss movement and continuous environment integration; preserved source assets and documented provenance/cleanup. |
| [`73430b6`](https://github.com/mahikshith/mechalord-asset-references/commit/73430b6) | Completed live-render corrections, final clash readability and texture-independent hit flash; published rebuilt playable files, evidence and handoff. |

[Full GitHub comparison](https://github.com/mahikshith/mechalord-asset-references/compare/2cb2e38...73430b6). The combat/browser source portion of this range changes 31 files, with 692 insertions and 188 deletions. The full range also includes editable assets, archived attempts, documentation and generated delivery/evidence files.

## Feedback-to-change overview

| Your feedback | Before | After |
|---|---|---|
| Remove the Overdrive circles and introduce a better power | Slot 2 boosted ordinary firing and used body/floor circuits, rings, arcs and ember effects. | Barrage deploys paired shoulder launchers and fires a finite sequence of real rockets; ordinary fire is not boosted by that relic. |
| Laser clash looked cheap/congested | Large overlapping halo/filament treatments and a dense contact sphere obscured the junction. Clash pressure did not drive the contact treatment. | Coherent opposing plasma volumes, separated electricity and an open shock front with depth; actual pressure controls contact feedback. |
| Boss should walk faster after losing boosters | Boosterless movement retained the older slow grounded behavior. | Faster displacement on surviving legs, with actual stride/knee pose tied to movement; one-leg damage reduces mobility. |
| Confirm that hitting the right part highlights it | Confirmed hit events were already connected, but the painted atlas muted the material flash, and pause hid the cues. | Whole damaged component gets a brief texture-independent white wash. Target guidance remains a separate quieter signal. |
| One nonrepetitive level, changing worlds and one major boss | Three act scripts, each with its own boss/reward transition. | One global encounter timeline, seamless environment zones, one final Tyrant and one reward. |

## 1. Overdrive replaced by Barrage

### Actual combat change

The C++ relic at numeric slot 2 is now `StormBattery`, presented to players as **Barrage**. `Overdrive=StormBattery` remains an enum alias only to preserve existing numeric compatibility; it does not retain the former behavior. The ABI version remains 5.

Activating Barrage immediately launches two rockets, then another pair every 0.56 seconds. The base five-second activation permits nine pairs / 18 rockets. An Endurance imprint extends duration to 5.75 seconds and permits 11 pairs / 22 rockets. Output is limited by the pair budget and the existing projectile pool. Pause holds the timer/projectiles, and retry clears the battery state.

Each rocket begins at an actual shoulder socket: commander X ±0.68, height 2.11, forward Z 0.92. It uses the existing `salvo` projectile kind, including authoritative height/vertical velocity. Speed is 26 units/second; gentle guidance is bounded to the first 0.6 seconds. Target region and boss epoch stay fixed rather than switching to whichever component later becomes convenient.

Direct damage is `12 + weaponLevel × 0.8`, subject to the target's armor rules. On a running-lane impact, the existing Salvo splash deals 12 to other enemies within 1.6 units. The separately earned six-rocket Salvo pickup remains available and is not replaced by Barrage.

The previous ordinary-bullet damage multiplier and firing-cadence multiplier were removed. Barrage also does not overwrite the player's current normal weapon or independent combat power.

### Animation, UI and sound change

New [`storm-battery.ts`](tools/playable-preview/storm-battery.ts) builds dark-metal/copper paired racks with armor hinges, machined nozzle recesses, cyan inserts and rear-housing recoil. The nozzle remains at the measured launch origin while the housing recoils. Actual new rocket IDs trigger local combustion flashes; the animation is not a cosmetic timer pretending to fire.

[`relic-effects.ts`](tools/playable-preview/relic-effects.ts) reads `relics[2].activeTime` to deploy these racks. The old body/floor Overdrive circuits, embers, arcs and rings are no longer allocated. Ordinary shot presentation is not switched into the old Overdrive style.

Normal/practice controls, accessible labels, icon and active hint were changed to Barrage / Storm Battery. The rocket icon depicts paired projectiles. Audio now has a dedicated mechanical Barrage cue, and the old relic-dependent faster ordinary-gun sound cadence was removed.

**Files:** `AssaultSimulation.{cpp,h}`, `storm-battery.ts`, `relic-effects.ts`, `world.ts`, `main.ts`, `index.html`, `review.html`, `audio.ts`.

## 2. Laser and clash presentation rebuilt

### Opposing beam geometry

New [`plasma-beam-style.ts`](tools/playable-preview/plasma-beam-style.ts) supplies a consistent tapered beam treatment shared by the hero and enemy presentations. The hero is blue/cyan; the hostile beam stays warm orange. Core, corridor and decoration have distinct widths so the silhouette remains readable.

Published source/end positions take precedence over an animated socket that may have moved since emission. This corrects visual misalignment while keeping damage geometry authoritative. Elevated endpoints, such as a shield-clipped beam, no longer create a second road-spark burst at that contact.

Hostile decorative halo scale was reduced from 3× to 1.75× the beam width. The hostile electrical treatment was reduced from 96 to 36 segments, with two separated warm paths. Internal flow segments dropped from 72 to 12. The intent is a clear axial beam and readable electricity rather than more overlapping geometry.

### Contact front and actual pressure

The old opaque contact sphere and dense treatment—60 arc segments, 48 sparks and 5 rings—were replaced with an open annular front, 12 arc segments, 16 sparks and 2 partial downstream rings. The front leaves the beam junction visible.

The first real portrait capture showed the initial replacement was too thin/small. A second bounded polish enlarged the front to roughly 0.94–1.04 units in radius, added a shallow rippled depth of 0.36 units, thickened the six separated two-segment discharges to 0.052/0.036 units, and widened spark streaks. Counts did not increase. This adjustment came from rendered evidence rather than only a CPU geometry pass.

The simulation's real clash pressure drives color, downstream ring movement and spark direction. Its published contact position stays authoritative. In the captured replay, pressure moved from 48% to 68% and the contact advanced from forward Z 5.71 to 7.27 toward the boss.

Laser/clash audio gained deeper pressure/rumble and electrical noise accents. Audible quality on speakers/headphones remains unverified; waveform/source-limit checks do not establish a good mix.

**Files:** `plasma-beam-style.ts`, `combat-visuals.ts`, `laser-clash-visuals.ts`, `audio.ts`.

## 3. Faster grounded Tyrant movement

After both boosters break, the boss can move laterally at up to 2.7 units/second and in depth at up to 2.16. With only one remaining leg, the limits fall to 1.45/1.16. Grounded stride and knee articulation follow actual distance traveled and feed the same authoritative pose used for hit volumes.

It plants during committed windup, recoil and an active beam. Losing boosters does not grant another booster evade, and losing both legs still leads to the existing collapse/core behavior. This preserves the gameplay consequence of breaking parts rather than making the boss equally mobile at every damage stage.

A short booster-loss landing occurs before it settles onto the floor. The final replay capture at 226.1 seconds showed root height 0.02, part mask 15 (both cannons and boosters broken), both legs still alive and a changed stride pose. This is actual campaign-core presentation, not the home-screen idle loop substituted for combat.

**Files:** `AssaultSimulation.cpp` and its authoritative boss-pose path. The legacy test that expected the former slow grounded speed was updated to assert the new envelope, real stride and planted attacks; production core was not changed merely to make that test pass.

## 4. Confirmed part-hit highlight made visible

The baseline already routed confirmed `hit`/`chainHit` events with `hitRegion` to the boss adapter. That connection was verified rather than described as an entirely new feature. This pass improves its actual readability.

[`boss-rig-adapter.ts`](tools/playable-preview/boss-rig-adapter.ts) now briefly washes the entire damaged component white, while the first living vulnerable part has a quieter cyan targeting cue. These signals are different: guidance suggests a target; a hit flash confirms damage to the exact component struck. Other vulnerable parts can still take damage.

The first live capture exposed a remaining issue: the GLB's dark painted emissive atlas multiplied away much of the brighter material setting. The final correction adds a confirmed-hit shader wash independent of that painted texture. It preserves the maps and uses a uniform instead of recompiling the shader for every hit. Zero/blocked damage does not start the wash. Reset/disposal restores original materials, and pause holds the existing flash.

The exposed core retains its previous oval reactor and face-fitting flash. No new chest wheel/housing was added. In the final campaign replay, 14 confirmed damage reduced cannonL from 560 to 546 HP and the whole rendered cannon flashed white.

**Files:** `boss-rig-adapter.ts`, `world.ts`, `test_unbroken_render.mjs`.

## 5. Three stacked acts replaced with one changing battlefield

### One encounter schedule

The previous campaign restarted act scripts lasting 90/96/102 seconds, with separate bosses and inter-act reward transitions. That was the interpretation corrected by the feedback.

The replacement is one 51-event schedule in [`CampaignEncounters.h`](game/Mechalord/Source/Mechalord/CampaignEncounters.h). Its authored approach lasts 198 seconds, with one global distance goal of 732.6. Effects that alter forward speed can change wall-clock duration. There is one spawn ledger and one final boss.

| Zone | Authored interval | Encounter character |
|---|---|---|
| Skyforge Viaduct | 0–62 s | Recruitment, early weapon supplies, alternating lateral rollers, Bulwark and Hound introductions. |
| Storm Reactor Trench | 62–128 s | Staggered crossfire, Engineer escorts, Wasp mortars and control-power choices. |
| Forge Citadel | 128–198 s | Fortified batteries/support combinations, siege weapons and recovery supplies before the boss. |

These use distinct authored rhythms rather than replaying the same standalone script. Enemy difficulty/fairness still needs human observation.

### Seamless state and one final reward

Zone markers at distances 229.4/473.6 update presentation but do not clear enemies, projectiles, pickups, formation, commander health, relic charge/timers or weapons. `actStart` no longer calls `world.reset()`. The remaining legacy field names `actIndex` and `stageLevel` identify zones, not independent victories.

The bridge exposes an explicit within-zone `StageProgress()`, while the main HUD shows global `travelDistance / travelGoal`. This prevents the advance bar from returning to zero at a boundary.

The final Tyrant has base armor 3,200 and core HP 900, with a mixed cannon/rocket/laser/sweep schedule while the necessary weapons exist. Destroying its core offers one Laser/Vitality/Endurance absorption choice. That replacement imprint is saved for the next assault and ends the run. There is no second/third boss, inter-zone reward menu or state refill used to force success. Five standalone practice fronts remain available.

### Environment reuse and color transitions

New [`continuous-route-environment.ts`](tools/playable-preview/continuous-route-environment.ts) reuses 14 retained original Reforged environment exports while keeping accepted Iron Front characters. It does not restore the rejected Reforged gameplay/actors.

The route uses suspended islands/spine structures, trench walls/reactor/cooling banks, cranes/industrial props and one final citadel bowl. Recycled sections are anchored to absolute distance, so the next zone appears ahead and the boundary does not replace the whole visible world at once. Native crane joints articulate. A 9.7-unit dark deck keeps the road distinct from bullets. Lighting blends over 48-unit windows centered on zone boundaries, with cooler trench and warmer citadel palettes. The final rear seal is fixed to the one arena.

The measured CPU environment peak is 24 active batches, 150 instances and 251,536 triangles. That excludes actors/effects and does not prove acceptable mobile performance.

**Files:** `AssaultSimulation.{cpp,h}`, `CampaignEncounters.h`, `assault_bridge.cpp`, `continuous-route-environment.ts`, `world.ts`, `main.ts`, `chapter-catalog.ts`, `build.mjs`, `index.html`.

## Additional corrections found during verification

- **Pause erased part of the combat picture.** Hero beams, the clash front and part cues previously used a play-only visibility condition. They now remain visible during pause with zero elapsed effect time. Pausing is a frozen picture rather than an incomplete rendering of combat.
- **Zone entry could clear effects.** The old renderer reset attached to `actStart` was removed, matching the new core state-continuity contract.
- **UI copy and compatibility.** Menu/zone labels now say continuous assault and one final boss; slot 2 labels/icon/audio mean Barrage. The internal review's encoding issue was fixed, and UTF-8 source was checked.
- **Review diagnostics.** Internal QA gained a grounded-stride seek and visible clash-front geometry diagnostics. These use the shipping core and are not extra gameplay powers or a second combat implementation.

## Asset preservation and publication changes

The two implementation commits also add previously untracked reference images, original models, edited Blender sources, exports, manifests and historical proof to make the project recoverable. Inclusion does not mean a rejected visual attempt became accepted production art.

Already-removed local TRELLIS/failed repair files were recorded as Git deletions. That does not mean this pass performed a new system uninstall. The user-provided reconstruction underlying the retained commander/troop remains; its upstream Space/version/output terms still need clarification before commercial distribution.

Original-reference remote `main` was preserved. The new playable branch and earlier Iron Front/Reforged comparison branches were pushed without force replacement. Installed packages/vendor binaries, engine caches, credentials and the temporary nested reference-hosting checkout remain excluded.

Built HTML/JS/WASM, 14 environment GLBs, selected checks, eight browser captures, [HANDOFF.md](HANDOFF.md) and [MEMORY.md](MEMORY.md) were published. See [asset provenance](docs/asset-provenance-publication.md) for current/historical asset distinctions.

## Verification and limits

| Evidence | Recorded result | What it establishes |
|---|---|---|
| Focused native mechanics | 130 assertions; [receipt](builds/single-siege-native.json) | Timeline/state continuity, one reward, real rocket budgets, grounded movement, targeting and frame-rate checks. |
| Shipping WASM legacy checks | 71/71; [receipt](builds/rebuild-test-results.json) | Regression behavior through the actual adapter/core. |
| Continuous public-control routes | 4 wins; [receipt](builds/unbroken-campaign-audit.json) | Feasible authored campaign completion with automated aiming. |
| First-HUD-target routes | 2 wins; [receipt](builds/player-target-route-audit.json) | Feasible completion following the displayed vulnerable-part guidance. |
| Final beam/clash geometry | 7/7; [receipt](builds/laser-pressure-checks.json) | Exact endpoints, physical geometry, pressure-driven decoration and bounded lifecycle. |
| Part/renderer fixtures | 11 unbroken-render groups, 9 adapter groups; [renderer receipt](builds/unbroken-models-review.json) | Confirmed part wash, dark-map handling, paused uniforms and resource ownership. |
| Relic effects | 16 groups; [receipt](builds/relic-effects-checks.json) | Physical shield/Barrage transforms and effect lifecycle. |
| Environment geometry | 14 GLBs, 6.1 million transformed vertices, 3,000 updates; [receipt](builds/continuous-environment-review.json) | Lane clearance, source geometry, recycling, articulation, pause and disposal. |
| Mocked UI/audio | 16 groups; [receipt](builds/iron-march-ui-audit.json) | Controls, global progress, save/reward/retry logic and bounded audio sources, not human gameplay or audible mix. |
| Browser captures | [Captioned proof](delivery/single-siege-proof/README.md) | Actual rendered appearance, with ordinary input distinguished from replay controls. |

The core remains pinned to SHA-256 `281386d8b075f499a10aee8c3e3f2282c9e9fd39c024ed50126b5e3a330ccf46`. Exact bundled file hashes are in [the build manifest](builds/playable-build-manifest.json). This documentation-only follow-up does not alter that build.

Normal play was partially observed using an existing rank-4 save, including steering, real Barrage activation, damage/casualties, pause and the first continuous zone crossing. Final hit/clash/stride captures use internal replay controls around the same shipping core and renderer. They do not prove a full ordinary-input victory or user aesthetic acceptance. Early environment captures precede the last clash/part-flash polish; their environment/core sources are unchanged.

Fresh automated final-boss routes lasted roughly 71–88 seconds; upgraded routes shortened that to 29–35 seconds and could miss later attack patterns. Engineer repair was unobserved in the continuous campaign routes. Those balance/reachability issues remain open rather than being hidden behind passing tests.

Unchanged/deferred work includes native Unreal assault integration, Android/iOS packages, Nothing Phone (3) performance/install-size/thermal tests, audible mixing, first-time-player observations, commercial asset license clearance, optional content-download acceptance and monetization/store features. No claim of production or mobile readiness is added by this document.

## Reproducing the comparison

```powershell
git log --oneline 2cb2e38..73430b6
git diff --stat 2cb2e38..73430b6
git diff 2cb2e38..73430b6 -- game/Mechalord/Source/Mechalord tools/playable-preview
```

Use [HANDOFF.md](HANDOFF.md) for build/test launchers and [README.md](README.md#project-architecture) for the current architecture. The commits themselves are the definitive record when an older report or preview differs.
