# Iron Front: storm arsenal and new chapters

Authorized 6 October 2026. Continue the accepted playable version, make troops and boss tougher, extend the fight without constant dodging, add a one-second forward lightning cannon and additional powers. The user's clarification selects more distinct chapters in the current playable game; native Android integration is deferred.

## Delivery sequence

- [x] Finite offensive powers: Tempest Lance, Arc Storm and Siege Salvo, with authoritative damage and distinct effects/audio.
- [x] Tougher Reactor Siege and limited boss evasion, followed by readable recovery windows.
- [x] Storm Pass: authored crossfire and crowd-control choices, distinct environment.
- [x] Forge Core: authored fortified battery encounters and siege choices, distinct environment.
- [x] Five-stage selection and backward-compatible saves.
- [ ] Simulation, portrait rendering and repeated-run verification; commit evidence.

## Design decisions

The new offensive bursts coexist with the earned weapon and equipped relic. Tempest Lance fires forward for one second with blue/cyan lightning; it clears ordinary machines intersecting its actual corridor while applying bounded damage to armored targets. Arc Storm jumps through a bounded sequence of real targets. Siege Salvo launches six physical heavy rockets. These are finite rewards, not permanent replacements for the weapon already earned.

The boss's evasion must move its actual collision geometry. A visible booster tell precedes each short dodge, with a firing opportunity afterward. Evasion is finite and sufficiently spaced; no teleporting, hidden invulnerability or perpetual aim tracking is permitted. Destruction of weapons continues to remove their attacks.

New chapters use authored schedules and different tactical combinations. Storm Pass emphasizes staggered crossfire and movement; Forge Core emphasizes armored batteries, carrier vulnerability and siege bursts. All five stages remain available in the prototype. Existing level indices, earned rank, best scores and completed stages are preserved when the save expands from three to five stages.

Storm Pass has 22 authored encounter records across a 96-second nominal approach: alternating flank gunners, moving rollers, Arc Storm versus Freeze carriers, and two intentional regroup intervals. Forge Core has 23 records across a 102-second nominal approach: sequential fortified batteries, centered and side rollers, Tempest versus Salvo carriers, and recruitment between pressure clusters. These durations describe travel at normal speed; time powers change elapsed traversal. Both chapters preserve at least 13 nominal seconds of approach after the final spawn so threats arrive from the distance.

The environment reuses the accepted playable road and characters. Storm coolant cells and arc pylons differ from Forge furnace mouths and molten conduits. Decoration stays beyond the playable lane. Five chapter palettes and 24 bounded ambient motes do not introduce new gameplay collision or unbounded spawned objects.

The player's three stored scores are retained while two new entries are appended under save schema 3. A compact scrollable five-front selector avoids covering the portrait battlefield with additional menu rows. The three finite powers have separate countdowns from the earned weapon and relic, and three locally synthesized audio cues. Ten UI/save/audio check groups currently pass, including migration, all-five selection, next-chapter flow and finite-power expiry.

## Acceptance and evidence

Automated checks must measure fresh and strongest saved loadouts, boss-only duration as well as total run duration, passive failure, dodge count and recovery opportunities. New power checks cover lifetime, real collision recipients, pause/reset, finite allocation, source alignment and effect visibility. Desktop checks do not establish phone performance, player retention or final difficulty.

Verification results and commit receipts will be added after integration. Existing baseline is `d027110`; the accepted visual direction and saved progress are retained.

## Integrated implementation checkpoint

The final 7cf83ed1 binary passed 71 simulation regressions, 6 independently exercised power/catalog checks and 14 chapter checks. Twelve fresh/strong-loadout chapter approaches sampled 4,642,780 formation/body/roller separations without silent overlap. Eighteen public-control full runs across Reactor Siege, Storm Pass and Forge Core won with no unresolved contacts. The measured original Reactor Siege boss segment grew from 43.1–51.0 seconds to 52.6–76.5 for the fresh loadout, and from 22.3–52.2 to 30.4–61.6 for the strongest earned loadout. These are controller measurements, not promised human completion times. Some review-controller routes take longer; actual rendered results are recorded separately.

The final delayed-control audit passes 15 checks: 29 of 30 active routes win, and both passive-center controls lose. The fresh Overdrive controller with a 200 ms decision delay loses at 234.6 seconds; its 350 ms route wins at 151.1 seconds. These different outcomes are retained, not tuned away or described as universal success. All six delayed new-chapter routes win in 176.7–218.9 seconds. All tested routes report zero unresolved contacts. Strongest delayed loadouts complete Reactor Siege in 126.6–131.7 seconds; fresh winning delayed routes span 132.4–209.4 seconds. Human difficulty and pacing still need observation.

Part destruction now grants real weapon experience. Destroying each of the first two major pairs also drops one finite two-way salvage choice, with six actual reinforcements on collection. Every recruited troop has its matching event for HUD and formation animation. New powers do not consume the equipped relic or replace earned weapons. Salvo splash is bounded and does not duplicate damage across boss parts. The Tempest collision and visible sheath agree on a one-metre full corridor width; its nearest boss endpoint updates every frame.

The new boss action has a .35-second tell within a 1.2-second evasion interval, at least nine seconds between attempts, at most three attempts and a 1.4-second recovery. It never adds invulnerability. A final source review found that destroying the second booster during a dash could briefly leave its remaining movement active. The final `7cf83ed15c19ea3abbecffb5de6e4c95035d2697cc95b62ef388adf222a5cf60` binary immediately cancels both timers and enters recovery. Six native production-code fixtures cover second-booster destruction during tell/dash at 30/60/120 Hz, pause, and no later boost restart.

Presentation checks pass: 11 finite-power checks, 10 actual-model weapon/socket checks, the existing 64 combat checks, 15 relic checks and four retained-model integration checks. Geometry limits were exercised over 12,000 environment updates: at most 39 visible batches and 41,748 triangles for the environment, three textures, and no allocation growth. This is CPU geometry evidence; it is not an Android performance result.

The extended approach exposed a grazing-contact case during frozen boss motion. The independent retained-GLB oracle confirms an actual cannon contact, with fraction error below 8.6e-12 and surface error below 4.6e-16 metres. Two masks plus central-hit and nearby-miss controls pass all six checks. The bounded fallback retains the measured surfaces and damage rules rather than enlarging collision geometry. See `builds/boss-static-contact-audit.json` and `builds/boss-static-contact-oracle.json`.
