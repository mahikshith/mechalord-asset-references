# Iron Front: storm arsenal and new chapters

Authorized 6 October 2026. Continue the accepted playable version, make troops and boss tougher, extend the fight without constant dodging, add a one-second forward lightning cannon and additional powers. The user's clarification selects more distinct chapters in the current playable game; native Android integration is deferred.

Play at `http://127.0.0.1:8077/playable/index.html`. Swipe the chapter cards to reach Storm Pass and Forge Core. The new offensive pickups activate on collection and display a separate short countdown; the chosen Shield/EMP/Overdrive relic still uses its existing button. No progression reset is required.

## Delivery sequence

- [x] Finite offensive powers: Tempest Lance, Arc Storm and Siege Salvo, with authoritative damage and distinct effects/audio.
- [x] Tougher Reactor Siege and limited boss evasion, followed by readable recovery windows.
- [x] Storm Pass: authored crossfire and crowd-control choices, distinct environment.
- [x] Forge Core: authored fortified battery encounters and siege choices, distinct environment.
- [x] Five-stage selection and backward-compatible saves.
- [x] Simulation, portrait rendering and repeated-run verification; commit evidence.

## Design decisions

The new offensive bursts coexist with the earned weapon and equipped relic. Tempest Lance fires forward for one second with blue/cyan lightning; it clears ordinary machines intersecting its actual corridor while applying bounded damage to armored targets. Arc Storm jumps through a bounded sequence of real targets. Siege Salvo launches six physical heavy rockets. These are finite rewards, not permanent replacements for the weapon already earned.

The boss's evasion must move its actual collision geometry. A visible booster tell precedes each short dodge, with a firing opportunity afterward. Evasion is finite and sufficiently spaced; no teleporting, hidden invulnerability or perpetual aim tracking is permitted. Destruction of weapons continues to remove their attacks.

New chapters use authored schedules and different tactical combinations. Storm Pass emphasizes staggered crossfire and movement; Forge Core emphasizes armored batteries, carrier vulnerability and siege bursts. All five stages remain available in the prototype. Existing level indices, earned rank, best scores and completed stages are preserved when the save expands from three to five stages.

Storm Pass has 22 authored encounter records across a 96-second nominal approach: alternating flank gunners, moving rollers, Arc Storm versus Freeze carriers, and two intentional regroup intervals. Forge Core has 23 records across a 102-second nominal approach: sequential fortified batteries, centered and side rollers, Tempest versus Salvo carriers, and recruitment between pressure clusters. These durations describe travel at normal speed; time powers change elapsed traversal. Both chapters preserve at least 13 nominal seconds of approach after the final spawn so threats arrive from the distance.

The environment reuses the accepted playable road and characters. Storm coolant cells and arc pylons differ from Forge furnace mouths and molten conduits. Decoration stays beyond the playable lane. Five chapter palettes and 24 bounded ambient motes do not introduce new gameplay collision or unbounded spawned objects.

The player's three stored scores are retained while two new entries are appended under save schema 3. A compact scrollable five-front selector avoids covering the portrait battlefield with additional menu rows. The three finite powers have separate countdowns from the earned weapon and relic, and three locally synthesized audio cues. Ten UI/save/audio check groups currently pass, including migration, all-five selection, next-chapter flow and finite-power expiry.

## Acceptance and evidence

Automated checks must measure fresh and strongest saved loadouts, boss-only duration as well as total run duration, passive failure, dodge count and recovery opportunities. New power checks cover lifetime, real collision recipients, pause/reset, finite allocation, source alignment and effect visibility. Desktop checks do not establish phone performance, player retention or final difficulty.

Implementation is committed as `c312e9d`, following baseline `d027110`; the accepted visual direction and saved progress are retained. Final browser evidence is recorded below.

## Integrated implementation checkpoint

The final 7cf83ed1 binary passed 71 simulation regressions, 6 independently exercised power/catalog checks and 14 chapter checks. Twelve fresh/strong-loadout chapter approaches sampled 4,642,780 formation/body/roller separations without silent overlap. Eighteen public-control full runs across Reactor Siege, Storm Pass and Forge Core won with no unresolved contacts. The measured original Reactor Siege boss segment grew from 43.1–51.0 seconds to 52.6–76.5 for the fresh loadout, and from 22.3–52.2 to 30.4–61.6 for the strongest earned loadout. These are controller measurements, not promised human completion times. Some review-controller routes take longer; actual rendered results are recorded separately.

The final delayed-control audit passes 15 checks: 29 of 30 active routes win, and both passive-center controls lose. The fresh Overdrive controller with a 200 ms decision delay loses at 234.6 seconds; its 350 ms route wins at 151.1 seconds. These different outcomes are retained, not tuned away or described as universal success. All six delayed new-chapter routes win in 176.7–218.9 seconds. All tested routes report zero unresolved contacts. Strongest delayed loadouts complete Reactor Siege in 126.6–131.7 seconds; fresh winning delayed routes span 132.4–209.4 seconds. Human difficulty and pacing still need observation.

Part destruction now grants real weapon experience. Destroying each of the first two major pairs also drops one finite two-way salvage choice, with six actual reinforcements on collection. Every recruited troop has its matching event for HUD and formation animation. New powers do not consume the equipped relic or replace earned weapons. Salvo splash is bounded and does not duplicate damage across boss parts. The Tempest collision and visible sheath agree on a one-metre full corridor width; its nearest boss endpoint updates every frame.

The new boss action has a .35-second tell within a 1.2-second evasion interval, at least nine seconds between attempts, at most three attempts and a 1.4-second recovery. It never adds invulnerability. A final source review found that destroying the second booster during a dash could briefly leave its remaining movement active. The final `7cf83ed15c19ea3abbecffb5de6e4c95035d2697cc95b62ef388adf222a5cf60` binary immediately cancels both timers and enters recovery. Six native production-code fixtures cover second-booster destruction during tell/dash at 30/60/120 Hz, pause, and no later boost restart.

Presentation checks pass: 11 finite-power checks, 10 actual-model weapon/socket checks, the existing 64 combat checks, 15 relic checks and four retained-model integration checks. Geometry limits were exercised over 12,000 environment updates: at most 39 visible batches and 41,748 triangles for the environment, three textures, and no allocation growth. This is CPU geometry evidence; it is not an Android performance result.

The extended approach exposed a grazing-contact case during frozen boss motion. The independent retained-GLB oracle confirms an actual cannon contact, with fraction error below 8.6e-12 and surface error below 4.6e-16 metres. Two masks plus central-hit and nearby-miss controls pass all six checks. The bounded fallback retains the measured surfaces and damage rules rather than enlarging collision geometry. See `builds/boss-static-contact-audit.json` and `builds/boss-static-contact-oracle.json`.

## Browser review

The normal player screen was checked with a portrait viewport override. All five chapters are available in the compact horizontal selector. Storm Pass and Forge Core selection change the description and launch the corresponding chapter; pause, resume, restart and return to level selection work. The player's existing rank 4, 14 starting troops, permanent rail burst and three best scores (4935, 5465, 6016) remain intact. Neither new chapter is falsely marked complete. No saved progress was cleared or replaced for testing. See `builds/storm-player-ui-review.json`.

Final-build screenshots in `delivery/storm-arsenal-proof/` capture `five-chapter-menu.jpg`, `tempest-final.jpg`, `arc-storm-final.jpg`, `siege-salvo-final.jpg` and `boss-recovery-final.jpg`. Combat captures use the internal review page's public-control replay, not fabricated simulation state. The cannon image captures its actual one-second corridor; the chain image captures real struck targets; the rocket image captures the finite salvo. These are desktop-rendered portrait checks, not phone captures.

An earlier render audit on the intermediate 76d35109 binary completed five runs before its browser tab became unavailable. That partial evidence is preserved in `builds/storm-render-interrupted.json`; it is not a completed twelve-run result. The final audit uses the committed 7cf83ed1 binary and is recorded separately.

The final audit completed all twelve real WebGL runs successfully in 478 wall-clock seconds at 4x simulation speed. Each run destroyed all six boss parts and the core, with zero unresolved swept contacts. There were no browser warnings or errors. Results are preserved in `builds/storm-render-final.json`; all eleven runtime/asset fingerprints matched `builds/playable-build-manifest.json` after the audit.

| Chapter | Fresh loadout, three relics | Strongest saved loadout, selected relic |
|---|---:|---:|
| Reactor Siege | 156.1–174.8 s | 120.9 s (Shield) |
| Storm Pass | 158.9–183.6 s | 131.1 s (EMP) |
| Forge Core | 154.7–174.0 s | 141.8 s (Overdrive) |

These are total simulated run times from the rendered review controller. They are not human completion times or the separate boss-only measurements above. The review controller uses public gameplay commands, and never writes the player's progress.

The run recorded 28,638 rendered frames, of which 13 exceeded 34 ms on this desktop. Peaks were 173 draw calls, 226,099 triangles, 304 registered geometries and 27 textures. End-of-run textures returned to 13 in every run. After first-use resource creation, geometry counts settled at 232 across fresh new-chapter repeats, then 241 across all three strongest-loadout repeats. The single unchanged module-owned Sprite geometry was the only item reported outside the scene. This bounded replay check does not establish twenty-minute phone memory stability or Android/iOS frame rates.

Human playtesting remains necessary to judge challenge, repetition and enjoyment. In particular, the separate delayed-input loss above is retained as a balance observation; passing the rendered controller routes does not imply that every player or strategy will win.
