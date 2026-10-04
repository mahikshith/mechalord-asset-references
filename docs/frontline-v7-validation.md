# Iron Front v7 — stronger Tyrant, readable contact and legion transfer

Validated 5 October 2026. This report covers the browser build, independently of the native Unreal Art Lab work.

## Delivered behavior

- Restored the original glowing chest reactor; removed the wheel/shutter overlay. Refined the existing face with an angular brow, red eye slits and a small jaw plate.
- Increased boss armor and reactor durability. Added a charged, committed reactor laser with real commander/formation damage; hostile rockets now guide briefly and then commit. Breaking cannons, boosters and legs emits separate real mesh fragments and changes available attacks. The legless torso settles near the deck and remains stationary. Broken parts do not regenerate during the single armor rebuild.
- Earned starter weapons last the entire run. A temporary pickup overrides the starter, then returns to it. Full-run equipment is explicitly labeled.
- Measured enemy footprints and roller end caps now participate in swept contact. Widened enemy columns, separated rows and removed simultaneous encounter stacks. Shield-blocked hits are distinguished from real casualties.
- Healing consumes 20 troops for up to 25 actual missing HP, twice per run, when at least 10 HP is missing. Last Stand freezes combat and offers one explicit 30-troop revival to 50 HP with brief protection. Decline plays final commander destruction. Inward energy streams represent consumed troops; costs are never spent automatically.
- Compact weapon/health controls and stable responsive camera framing protect rear ranks. The camera reserves 128 pixels below the trailing footprint, including narrow-screen text wrapping and the optional transfer control. It stays fixed during troop-count changes. This necessarily limits how far down the commander can move on short screens.

## Verification

| Check | Result |
| --- | --- |
| Actual compiled C++/WASM regression suite | 56/56 pass |
| Combat visuals, fragments, lasers, original reactor and disposal | 44/44 CPU checks pass |
| Main HUD / progression / audio harness | Pass, including explicit heal/revive/decline, no automatic spending, frozen Last Stand, and decline followed by pause |
| Baseline completion | All 9 stage/relic combinations win at rank zero, without commander healing or revival |
| Automated completion times | 84.93–120.33 seconds; stronger staged fights can exceed the initial 60–90 second design target |
| Automated surviving commander HP | 90–98/100; these capable automated routes do not establish first-time-player fairness |
| Measured contact audit | Zero silent overlaps in 12,127 run frames, including 198,328 body samples, 8,891 roller samples and 2,762,563 formation/body comparisons |

Core checks also cover staged parts and missing attacks, grounded movement, laser timing/damage, missile commitment, permanent starter restoration, heal/revive quotas, preserved army state, no spending on failed requests, 30/60/120 Hz equivalence, isolated games and 250 repeated starts. Visual tests use CPU-side geometry/state checks; they are not GPU performance measurements.

WASM: `delivery/playable/assault.wasm`, 1,294,983 bytes. SHA256:

`d7497deba9125c7344d99d7e23f5521752ed870f4548f20a51c1b638b682888d`

Linear WASM memory: 1,179,648 bytes, excluding graphics/JavaScript/assets. Full results: `builds/rebuild-test-results.json`.

## Browser evidence

The real shipping UI was inspected at actual CSS viewports of 352 × 782 and 321 × 571. Controls, persistent equipment, real troop-count losses and commander HP were visible. The browser reported no captured errors/warnings during these checks. Original desktop viewport overrides were reset after testing.

The internal review drives the same WASM with ordinary steering and ability calls. It does not write a fabricated victory/health/part state. Final-binary observations included:

- Charged reactor laser at 75.7 seconds, cannons and boosters already absent, army 77 / 12 visible representatives.
- Exposed grounded reactor at 79.0 seconds, all six part flags set, armor zero and 546 core HP.
- Last Stand at 79.7 seconds with army 65 / 10 representatives and zero commander HP. An explicit revive changed those to army 35 / 6 representatives and 50 HP, at the same frozen simulation time.

Evidence captures are in `builds/playtest-v7`: `portrait-combat.png`, `compact-phone.png`, `tyrant-laser.png`, `grounded-reactor.png`, and `legion-transfer.png`. The compact-phone capture preceded the final additional 10-pixel safety margin; that final camera change moves the same formation further clear of the controls without altering world positions or combat.

Research and tactics: `boss-counterplay-v7.md`. Independent measurements and camera reasoning: `v7-collision-audit.md`.

## Limits

These are current browser mechanics and provisional original art. A maximum of 24 visible followers represents larger logical armies, so small losses above that ceiling need not remove a whole visible model; the legion count remains authoritative. Boss component losses are scripted paired thresholds, not individually targeted limb hitboxes.

Unreal 5.8.3 is now installed. Its live editor tools and Art Lab are a separate native workstream. The C++ game build is blocked by the missing Windows compiler/SDK toolchain, and the current AssaultSimulation still needs its native runtime adapter. No APK, Nothing Phone (3) performance result, older-phone support, or first-time-player acceptance is claimed. No TRELLIS or paid generation service was used.
