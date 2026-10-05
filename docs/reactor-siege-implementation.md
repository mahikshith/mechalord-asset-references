# Reactor Siege implementation — 6 October 2026

The accepted Iron Front presentation now runs an authored level-0 encounter sequence on `codex/iron-front-reactor-siege`. TwinBee's bell/cycling mechanic is excluded. Reforged remains archived for later environment and palette reference. Existing saved unlocks are preserved.

- [Play Reactor Siege](http://127.0.0.1:8077/playable/index.html?v=reactor-siege-624e9b6d)
- [Play the preserved Iron Front baseline](http://127.0.0.1:8077/iron-front-baseline/index.html)

## Delivered

- A nominal 63-second approach with spaced aimed gunners, battery encounters, recruitment gates, rollers, and fixed cannon/rail choices. Collecting one member of a weapon pair closes the other. Guided missiles arrive later; no shooting-to-reroll rewards.
- Gunners visibly charge, lock their aim, fire, and reload. Braced machines advertise guided-missile resistance. Their shots carry actual collision damage.
- Level-0 firepower is moderated; energy counts actual HP removed, so overkill cannot manufacture extra charge. Permanent starter equipment remains available.
- Boss attacks remain dangerous after components break. Five-second exposed-core windows stop new volleys while committed projectiles continue. Core wounds persist between openings; one partial armor repair is allowed. Guarded hits show neutral deflection, without fake damage numbers.
- Compact normal impact sparks, physical mechanical fragments, staged elite/part explosions, gun recoil and differentiated audio. Accepted models, original reactor, camera and friendly projectile heights are retained.
- The single boss health bar continues to show remaining core health while guarded. Actual cannon charge/lock states drive the HUD guidance.

Boss parts still break through existing scalar armor thresholds. Independently aimed limb hit regions and the proposed second escort encounter are deferred; they are not delivered features.

## Verification

All final simulation receipts identify WASM SHA-256 `624e9b6d3e95c172bbe2bbfa7c93d7cfb5f434a60931afd83e3560c74839a358`.

| Check | Result |
|---|---|
| Main simulation regression | 58/58 pass; [receipt](../builds/rebuild-test-results.json) |
| Combat visual/resource checks | 61/61 pass; impacts, source heights, debris limits, retry cleanup and guarded deflection |
| UI/progression/audio checks | Pass, including guarded core health, visible gunner guidance, saves, pause and bounded audio |
| Independent controller audit | 12/12 pass across 23 sessions; [receipt](../builds/reactor-siege-controller-audit.json) |
| Desktop browser | Actual final build displays cannon guidance and distinct troop/commander fire; reviewed guarded boss state with retained core damage; no captured browser warnings/errors |

The independent audit uses real simulation controls with 200/350 ms observation delays, bounded steering and attention lapses. All twelve delayed rank-0/rank-2 relic routes, three immediate fresh routes and six legacy-stage routes win. Both passive centre-only routes lose. The audit includes 600,089 collision samples, equivalent 30/60/120 Hz results, pause and 40 retries with stable 1,179,648-byte WASM linear memory. This is bounded automated feasibility, not player fairness or retention evidence.

## Remaining tuning and acceptance

Fresh delayed runs take 80.7–176.9 seconds; saved rank-2 routes take 84.4–98.8 seconds. Some fresh Shield wins finish with only 7–15 HP. Strong loadouts can still clear the approach with few casualties. These results leave both long boss tails and uneven difficulty to tune through human playtests; the level is not declared perfectly balanced.

No packaged Android build, native Unreal integration, Nothing Phone (3) performance result, older-phone support or first-time-player acceptance is claimed by this browser delivery.

## Captures and preservation

- [Portrait cannon charge in the normal playable](../delivery/reactor-siege-proof/portrait-cannon-charge.jpg)
- [Guarded core in the actual-WASM review harness](../delivery/reactor-siege-proof/guarded-core-review.jpg)
- Previous playable copied intact to `delivery/iron-front-baseline`; baseline WASM SHA-256 `d7497deba9125c7344d99d7e23f5521752ed870f4548f20a51c1b638b682888d`.
- Research and design history remain at `2d81da3` on the previous branch. Unrelated asset work and local-TRELLIS removals were not changed.
