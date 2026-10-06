# Iron March: normal-play combat audit

Date: 2026-10-07. Scope: production `main.ts`, `world.ts`, the TypeScript/WASM adapter, and authoritative combat code, compared with `review.ts`. This is a code-path and public-control simulation audit. It does not establish visual quality, human difficulty, Android performance, or that all nineteen requests are complete.

## Why the earlier review was insufficient

The review page uses the real simulation and renderer, but its controller supplies perfect repeated input. It aims at the nearest or weakest vulnerable boss part, predicts projectile impact positions, chooses favorable gates, activates relics as soon as their meters permit, aligns with the first boss beam, and fires Tempest at an exact attack threshold. It also automatically chooses rewards. These actions do not occur in normal `main.ts`.

The review's enemy-art buttons deliberately steer away from the selected enemy and disable relics to keep that model visible. Its effect capture replays to a chosen event and advances the renderer by 0.12 seconds before freezing. Those captures demonstrate assets/effects exist, not that a player sees, understands, or triggers them. Review does not exercise normal HUD flow, save behavior, pointer controls, or audio.

## Concrete gaps found and correction status

| Finding | Player consequence | Current correction |
|---|---|---|
| Normal hints said to dodge a boss laser; the instruction to cross beams existed only in the laser button's accessible label. Review timed this automatically. | A player could finish without discovering the clash. | Interface agent added a visible contextual clash instruction and charge/action cue. Normal browser verification remains separate. |
| Campaign used the old "Shoot to improve gates" tutorial despite fixed recruitment gates. | Misleading early instruction. | Campaign hint now says to choose a recruiting gate. |
| `RewardChosen` played a sound but had no absorption scene; immediate `ActStart` reset would erase new effects. | Boss power absorption was only a menu selection. | Root added `CoreAbsorption`; interface delays the authoritative choice until the visual transfer completes. |
| Engineer repair emitted source and recipient coordinates, but the renderer flashed only the engineer. | The new enemy's distinct support ability was unreadable. | Root added `EnemySupportLinks` and impacts at both actual endpoints. |
| Plated Shield protected health at the body while incoming projectiles flew through the visible plates. | Physical cover looked cosmetic. | Core now sweeps hostile shots against the nine deployed plate footprints and stops them at the front surface. Exact spatial impact is emitted before body contact. |
| Boss beams still extended through the plated wall even after projectile interception was fixed. | The main enemy weapon visibly ignored cover. | Beam endpoints are now clipped to the actual armor contact, restored when cover moves/expires, and used by the clash intersection test. |
| Endurance extended the EMP meter but left boss/elite stun hardcoded to two seconds. | Advertised power duration exceeded the actual useful effect. | EMP stun now uses the same extended duration as its active timer. |
| Clash victory announced "ARMOR BROKEN" for a fixed damage award that might not break a part. | Feedback could claim a destruction that never happened. | Interface copy corrected; actual part-break events remain the source of destruction announcements. |

## Shield implementation and limits

`Battle::ShieldPlateHit` follows the live formation center and the same width, folded-wing offsets and rotations as `PlatedShield`. It tests the entire projectile step, including high-speed crossings, and clips interception to deployed armor height 0.05–2.95 m. Shots outside the visible width or above/below that height are not cancelled at an invisible wall. A round is removed once and emits `ShieldHit`, variant `-6`, with its projectile ID and actual surface `x/y/z`. Existing contact, already-behind-cover, revival, and laser protection remain unchanged.

The same surface clips the published boss-beam endpoint. Each beam retains its original endpoint internally so shield expiry or movement restores the unoccluded ray and normal body damage. Its existing duration and impact cadence remain. A clash can only use the finite visible segment in front of the armor; ongoing clashes retain their joined endpoint. This does not turn the relic into a destructible physics object.

`test_shield_interception.cpp` covers front impacts at 30/60/120 Hz, a fast rocket crossing, the folded wing, moving and commander-only formations, off-width/vertical misses, a top-edge contact, inactive cover, repeat-event prevention, beam endpoint clipping/restoration, moving cover, above/below-armor beams, and actual finite-beam clash eligibility. It also checks EMP durations with zero/one/two Endurance rewards. All 41 checks passed. The previous 48 production-method transition fixtures and both native campaign routes also passed after these changes.

## Boss guidance and reachable combat

Normal HUD and boss material guidance select the first active vulnerable part. Real hits flash the struck part; boss bullets use physical sweeps against the posed model. The review controller's different part-selection order had not tested this instruction.

`audit_player_target_route.mjs` now uses that first-part order through the shipping TypeScript adapter. It does not inject health, damage, resources or encounter state. It still predicts projectile danger and automates relic timing, so it proves the instruction is mechanically viable, not that a first-time player can follow it.

Verified WASM SHA-256 for the refreshed first-target public routes below: `3b16f22bf4dcfdabe9d9c9fed078ab4abc0632d891ec76ed933ec437c0d7eb0a`. The final rebuild includes beam clipping. Its route results match the earlier projectile-only build; the separate four-route campaign receipt still identifies its own earlier binary.

| Starting rank | Result | Boss durations, acts 1 / 2 / 3 | Total simulation time | Final HP / army |
|---|---|---|---|---|
| Fresh, rank 0 | Completed all acts | 72.8 / 56.9 / 79.6 s | 497.3 s | 90 / 1 |
| Rank 3 | Completed all acts | 23.4 / 56.6 / 53.4 s | 421.4 s | 115 / 17 |

No unresolved boss collision or blocked target stage occurred. The fresh route produced all three actual clashes. The upgraded route cleared its first boss before a clash; a clash is an earned opportunity, not a forced cutscene.

The separate public-route audit on the earlier `25372dd2…` binary recorded shield breaks for Bulwarks, Hound warning/rush states, 6–14 Wasp launches per campaign, and 1–2 real Engineer repairs. This establishes reachability under those control policies. It does not prove these short actions are legible on a phone or occur in every playthrough.

## Remaining balance concern

Troop attrition remains significant even with automated control. The fresh first-target route ended acts one and three with army count one; some other winning routes also exhausted their troops. Commander health stayed relatively high because direct hits, healing drops and shield use differ from troop loss. Consequently, a player may lose the thirteen-unit revival requirement well before the commander falls. More boss HP alone would worsen this and would not create better urgency.

Before claiming the requested difficulty and revival balance are resolved, observe normal-input play: whether players notice ready relics, keep enough troops to make a revival choice meaningful, identify the active boss part without exact coordinate knowledge, trigger a clash from its visible cue, and understand Engineer repair. Root is handling the normal browser review separately. Human enjoyment and visual polish cannot be inferred from these simulation receipts.

Receipts: `builds/player-target-route-audit.json`, `builds/unbroken-campaign-audit.json`. Reproduction: `node tools/playable-preview/audit_player_target_route.mjs`; compile and run `tools/playable-preview/test_shield_interception.cpp` together with production `AssaultSimulation.cpp` using the project's C++17 compiler.
