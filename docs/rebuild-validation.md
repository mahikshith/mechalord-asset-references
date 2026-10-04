# Rebuilt shooter prototype validation

On 4 October 2026, the rebuilt browser combat core passed **22 of 22 integration checks** against the actual shipped `delivery/playable/assault.wasm`, loaded through the same `AssaultCore` adapter used by the renderer. The retained machine-readable evidence is `builds/rebuild-test-results.json`.

This replaces the older browser trial's validation for the new shooter. It verifies simulation behavior rather than visual quality, touch usability or player enjoyment. The new Assault simulation has not yet been connected to the native Unreal gameplay adapter; that adapter still uses the previous BattleSimulation. No Unreal build, Android APK, Nothing Phone (3) session or iOS result is established here.

## Tested build

| Item | Result |
| --- | --- |
| Binary | `delivery/playable/assault.wasm` |
| Binary bytes | 143,795 |
| SHA-256 | `c0d567ce02bf8a7230c9257d3963ae8e337ba95cd30064af3a6f1fa42cc3c443` |
| Runtime route | Actual C++ simulation compiled to WASM, through the production TypeScript adapter |
| Runner duration | 55 seconds before the attacking boss |
| Fixed simulation step | 60 Hz |
| Retry check | 250 resets, each after a short active run and a pause |
| WASM linear memory | 1,114,112 bytes throughout the retry check |

The current opening includes three immediately visible warmup enemies plus the first gate. The first dense formation arrives earlier than in the initial rebuild. A stronger 50-HP breakable crate appears before a later multiplier; its destruction and loot are covered by the final tests.

## Behavior checked

| Area | Actual observations/assertions |
| --- | --- |
| Attacks | Projectiles move through world coordinates, create collision feedback and reduce target HP. Shots missing a gate laterally leave its HP and value unchanged. |
| Gates | Shooting improves the first recruitment value before crossing. Collection happens once and the gate leaves the active pool. A negative offer improves to a nonnegative value when shot. Eight rapid side gates spawn; multiple separate collections occur at the intended spacing. |
| Weapons and breakables | Crates take ranged damage and unlock weapon tiers 1â†’2â†’3. The stronger front barrier takes damage, is destroyed and grants loot. |
| Progression to boss | The surviving army and tier-3 weapon enter the boss encounter at approximately 55 seconds. Runner targets and shots clear at transition. |
| Boss pressure | The warning locks a target lane. Standing in that lane causes troop loss at impact; moving out prevents that loss. Winning reduces boss HP to zero. |
| Distinct relics | All three consume their energy and expire. Shield blocks a real approaching hazard. EMP freezes hostile machines while gates and shots continue moving. Overdrive increases the projectile stream. |
| Failure and replay | A poor route receives damage and loses. Terminal battles stop advancing and cannot activate abilities. Retrying resets warmup targets, charge, weapons, kills and shots, and clears pause. |
| Timing and bounds | Constant input produces matching outcomes at 30, 60 and 120 input Hz over 15 seconds, including projectile combat and hazard damage. Input is limited to XÂ±3 with a 9-unit-per-second steering limit. Active target, shot and effect arrays remain within their fixed pool bounds. |
| Pause | Clock, position, targets, shots and active ability duration freeze; resume continues the existing run. Feedback effects are intentionally drained by each snapshot, rather than counted as persistent state. |

## Winning routes and difficulty signals

The test's recorded authored route uses encounter-timeline knowledge, collects weapons and arithmetic gates, activates the selected relic when charged and dodges the boss warning. It requires no purchased upgrades.

| Relic | Completion time | Surviving troops | Final weapon tier |
| --- | ---: | ---: | ---: |
| Shield | 72.78 seconds | 120 | 3 |
| EMP | 72.80 seconds | 120 | 3 |
| Overdrive | 66.33 seconds | 120 | 3 |

A separate reactive steering heuristic chooses nearby gates/crates, avoids imminent threats and dodges the boss. On the final binary it wins in **77.17 seconds with 49 troops**. On an earlier binary that heuristic failed around 40.92 seconds; that older failure is not the outcome for this tested build. Remaining in the centre without using abilities loses in **23.85 seconds**, with the starting weapon still equipped. These comparisons demonstrate that control choices affect the result; they do not measure how understandable or fair those choices are to a new player.

The authored route is explicit in `tools/playable-preview/test_assault.mjs`. It must not become invisible assistance in a manual playtest. Five first-time players, with at least four learning steering and gates without spoken instructions, remains an uncompleted acceptance milestone.

## Reproduce

After rebuilding the new binary with `tools/playable-preview/build_assault.ps1`, run:

```text
node tools/playable-preview/test_assault.mjs
```

The test uses Node's native TypeScript support to load the production adapter and redirects only its WASM fetch to the local shipped binary. It drives the normal start, steer, ability and pause controls; it does not patch simulated state or use test-only mutation exports. The report records the tested binary hash so later gameplay changes cannot silently inherit this result.

## Remaining verification

- Inspect the final renderer and HUD against the tested core, including projectile/gate feedback, real drag controls, boss warning visibility and immediate replay.
- Confirm the opening and rapid gates remain readable in portrait orientation on a phone-sized display.
- Observe first-time players and record confusion, fairness and willingness to replay; no human enjoyment claim follows from automated winning routes.
- Profile browser/GPU memory and sustained frame rate separately. Stable WASM memory across resets does not establish total application memory or a 20-minute mobile performance result.
- Connect and compile the rebuilt simulation in Unreal, import the art, package Android and validate the Nothing Phone (3). Keep package-size, optional-content and older-phone claims pending physical checks.

## Parent browser playtest

The rebuilt page was inspected at the default desktop viewport and at 412 x 915. Through actual controls, the player steered, shot enemies, increased recruitment values, grew the army, upgraded weapons through level 3, paused/resumed, retried, entered the boss encounter and activated Shield. A late dodge after earlier boss hits ended in defeat; the human-controlled pass does not establish a manual victory. Automated victories are reported separately above. Browser screenshots are saved in delivery.

Visual defects found and fixed: initial units too small, enemy count labels overlapping formations, boss head hidden by HUD, duplicate world/DOM boss health, terminal-state camera reverting to runner. The boss renderer compresses forward distance consistently for boss body, shots and target impacts to fit the fight below the HUD.

First-time-player comprehension, subjective fun, animation polish, physical-phone frame times and 20-minute browser/GPU memory behavior remain unverified.
