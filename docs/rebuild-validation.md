# Rebuilt three-stage shooter validation

The current browser Assault simulation passed **30 of 30 integration checks**. The tests load the actual shipped WASM through the production `AssaultCore` adapter. Retained evidence: `delivery/iron-front-v3-validation.json` (also generated under `builds`).

These are automated mechanics results. They do not establish first-time-player comprehension, enjoyment, Unreal compilation, an Android package or physical-device performance. The native Unreal adapter still requires integration with this rebuilt simulation.

## Tested build

- Binary: `delivery/playable/assault.wasm`, 887,894 bytes.
- SHA-256: `c96fec06356f005fe842cc3317bb5c76f2ed0c033dad2ae2badaf4380413f5d1`.
- WASM linear memory: 1,179,648 bytes, stable across 250 retries.
- Stages: Relic Causeway, Roller Foundry and Citadel Breach, with 55-, 60- and 65-second runner sections.
- Snapshot effects drain once; all persistent state remains stable across repeated reads.

## Coverage

The 30 checks cover distinct selectable levels, reset state, bounded portrait steering, repeated paired gate alternatives, single-choice/single-application arithmetic, missed apertures, ranged projectile hits, gate growth and negative offers, destructible crates, earned weapon XP, tier unlocks, moving rollers and collision damage, tactical relic charge and reduced regeneration during active abilities, runner-to-boss state transfer, actual incoming shell/orb-fan/rocket volleys, warning visibility, projectile dodges, Shield protection, EMP projectile slowing, ranged elite attacks, victory and defeat, pause, fixed-step agreement at 30/60/120 input Hz, finite fixed pools and 250 retries.

The new boss attacks are travelling hostile projectiles with collision-bearing paths. The older single-stage trial used a timed impact check; that older 22/22 result and its completion times do not describe this iteration.

## Automated winning routes

| Stage | Relic | Completion | Troops | Weapon tier | Ability uptime |
| --- | --- | ---: | ---: | ---: | ---: |
| Relic Causeway | Shield | 63.98 s | 160 | 4 | 28.1% |
| Relic Causeway | EMP | 63.93 s | 160 | 4 | 38.9% |
| Relic Causeway | Overdrive | 60.93 s | 160 | 4 | 45.2% |
| Roller Foundry | Shield | 71.03 s | 160 | 4 | 29.6% |
| Roller Foundry | EMP | 71.12 s | 160 | 4 | 38.9% |
| Roller Foundry | Overdrive | 67.20 s | 160 | 4 | 41.4% |
| Citadel Breach | Shield | 84.60 s | 147 | 3 | 17.7% |
| Citadel Breach | EMP | 94.68 s | 160 | 2 | 19.0% |
| Citadel Breach | Overdrive | 75.28 s | 160 | 4 | 42.8% |

All nine stage/relic combinations win without purchased upgrades under the authored automated controls. Remaining in the centre without abilities loses in all three stages. The successful routes choose offers, earn weapon upgrades and react to incoming attacks; they are not evidence that an uncoached beginner will discover those routes. Ability uptime is measured from simulated frames and varies with the route.

## Reproduce

After rebuilding the simulation with `tools/playable-preview/build_assault.ps1`:

```text
node tools/playable-preview/test_assault.mjs
```

The script drives normal start, steering, ability and pause APIs against the actual binary and records its hash. It does not patch game state or substitute another simulation.

## Browser inspection

Actual browser controls verified level selection, horizontal dragging, paired-gate troop growth, earned weapon progression, round troop formations, moving rollers, Reaver presence, stage palettes, defeat/retry, saved cleared-level state and the runner-to-boss transition. The boss was inspected in the actual rendered scene. Its warning was moved beneath the top HUD after it obscured the weapon area. Rocket and fan warnings were widened to cover their collision corridors; camera easing now freezes on pause. These observations supplement the automated mechanics checks and do not establish mobile performance or player acceptance.

## Remaining acceptance

- Complete first-time-player evaluation of villain readability, enemy volleys, boss warning clarity and difficulty; obtain acceptance of the provisional art.
- Observe five first-time players; at least four should learn steering and gate choices without verbal coaching. Record confusion, fairness and willingness to replay.
- Measure browser/GPU and total app memory separately. Stable WASM memory is not a 20-minute mobile endurance result.
- Integrate the new simulation into Unreal, compile, package Android and test the Nothing Phone (3). Package size, optional-content delivery and older-phone claims remain pending native checks.
