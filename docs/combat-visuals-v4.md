# Combat visual module

`tools/playable-preview/combat-visuals.ts` renders simulation results without changing combat outcomes. It uses the existing Three.js dependency; no downloaded models or extra packages are required. These effects need inspection in the integrated game before judging visual quality.

## Integration

Import `CombatVisuals`, `CombatMissiles`, `RobotFormation`, and `ArmyAbilityVisuals` from `./combat-visuals`. Construct each once with the battlefield scene. Every class exposes `reset()` and `dispose()`.

The event methods accept **world coordinates**, where Y is up. The missile adapter consumes **simulation coordinates** and converts positive simulation Z to negative world Z once. Set `depthScale: 1` to preserve actual combat distances.

```ts
const combatFX = new CombatVisuals(scene);
const missiles = new CombatMissiles(scene);
const robots = new RobotFormation(scene, 200);
const abilities = new ArmyAbilityVisuals(scene);

// Effect positions must use the same coordinates as the corresponding models.
combatFX.enemyDeath(effect.x, -effect.z, effect.variant, effect.size);
// Pass visual model scale, not the core's small collision radius, for enemyDeath.
combatFX.allyLoss(effect.x, -effect.z, actualTroopsLost);
combatFX.impact(effect.x, 1.0, -effect.z, 1);
combatFX.muzzle(actualMuzzle.x, actualMuzzle.y, actualMuzzle.z);

// Before hiding the live boss, take a single snapshot of the real model.
if (combatFX.bossDeath(bossModel)) bossModel.visible = false;

robots.begin();
for (const target of normalEnemies)
  robots.add(target.x, -target.z, 1.0, 0, target.hit > 0);
robots.end();

missiles.update(snapshot.shots, snapshot.enemyShots, {
  depthScale: 1, bossPhase: snapshot.phase === 'boss', bossZ: snapshot.bossZ,
  overdrive: snapshot.relic === 2 && snapshot.ability > 0,
  weapon: snapshot.weapon, visible: playingOrDestroying
});

abilities.update(snapshot, {
  depthScale: 1,
  armyRadius: measuredRepresentativeRadius,
  armyCenterX: measuredRepresentativeCenterX,
  armyCenterZ: measuredRepresentativeCenterZ,
  visible: playingOrDestroying
}, paused ? 0 : dt);
combatFX.update(paused ? 0 : dt);
```

Calculate `armyRadius` from the actual visible formation bounds, relative to `armyCenterX` and `armyCenterZ`. The shield adds a 0.65m margin, includes the commander's position separately, and solves dome height to cover his tall model away from the centroid. Rendered shield coverage follows the simulation's whole-army protection. The module does not perform collision checks or extend ability duration. `armyCenterX` is optional and defaults to `snapshot.x`.

EMP electric segments attach to up to eight actual living enemy targets in the core's affected region: simulation Z below 13 and horizontal distance below 3.2. Its expanding ground wave originates at the commander. It does not mark out-of-range enemies or crates as damaged.

On a retry or level reset, reset all four classes. Remove the old line bullets, old enemy brick mesh, small shield, and old death particles when replacing them, so the same attack is not drawn twice. Preserve combat labels and their logical army counts.

## Visible behavior and limits

| System | Bound | Normal draw calls |
|---|---:|---:|
| Enemy robot formation | 200 modeled robots, 444 triangles each | 2 for the entire wave |
| Friendly/hostile solid missiles | 768 combined, plus 96 energy orbs | 3 |
| Falling armor debris | 384 chunks | 1 |
| Fire, flash, and smoke | 256 shared particles | 2 |
| Shield | Dome, fine structural grid, ground boundary | 3 while active |
| EMP | Expanding shockwave and 24 segments on affected enemies | 2 while active |
| Overdrive | Formation ring; longer blue missile exhaust | 1 plus existing missile draws |
| Boss dismantling | At most 24 actual mesh pieces | Depends on original material primitives, capped by piece count |

Robots have a rounded armor shell, armored shoulders, a separate head and glowing visor/core, twin treads, axle caps, and a protruding cannon. Instances are narrowed to 82% width and raised to 110% height for more compact crowd spacing; at scale 1 they are approximately 1.2m tall. Enemy front is positive world Z. Use a single representative per logical target instead of multiplying copies into unreadable stacks.

Missiles have a metal body, pointed nose, collar, two pairs of fins, and 3D exhaust. Friendly direction follows the actual `dx/dz` fields when available, with their render height at 1.25m. The actual pulse/arc/rail kinds select cyan/violet/gold cues; rail bodies are longer. Hostile shells/rockets follow actual velocities and use a red-orange tint; energy orbs stay distinct. Optional `bossZ` makes launch height 3.0m at the boss's actual distance instead of assuming a fixed 18m position. Each hostile shot retains its launch distance/height by ID, so a moving boss does not move existing projectiles vertically. Finished IDs are removed and reset clears the cache. Positions, hits, and damage remain owned by the core.

Normal enemy deaths eject seven larger 0.22–0.28m armor chunks before model-size scaling; elites eject fourteen. Most pieces are steel/bronze, with roughly one fifth painted red. `allyLoss(x, worldZ, count)` adds two to eight ivory/gunmetal fragments per damage event, with a small impact, so troop loss has a visible consequence without exploding the entire formation. Chunks fall under gravity, bounce and lose momentum, then fade over 1.8–2.3 seconds. Smoke rises; brief fireballs and white-orange flashes make the hit origin readable. A per-instance opacity attribute fades particles and debris without allocating individual mesh objects.

Boss death copies the actual mesh geometry, textures, and world transforms before the live model is hidden. Added transparent muzzle flashes are excluded. Arms/weapon pieces detach first, then the head and torso. Pieces settle by 2.5 seconds, stop physics work, and remain as a recognizable static wreck through the result screen until retry. Flame emission stops at 2.8 seconds and flames expire by 3.3 seconds; smoke clears afterward. At most 24 pieces remain. Source geometry/textures are shared and never disposed by the effect; only cloned materials are owned by it. Retry removes fragments and disposes cloned materials immediately.

## Verification boundary

The isolated module bundled successfully. Run `node tools/playable-preview/test_combat_visuals.mjs` for the **18/18 passing CPU scene checks**. They exercise 500 consecutive deaths, 250 robot submissions, 1,000 projectile submissions, bounded ally casualties, boss piece capping, exact world-space fragment bounds, omission of muzzle-glow fragments, zero-time pause, static wreck retention and material cleanup on retry, actual missile direction/launch height, unchanged in-flight height when a boss moves, whole-army/commander dome coverage, affected-target and nearby-boss EMP arcs, all three abilities, 300 retries, opacity shader hooks, and preservation of original geometry. The module removes all owned scene objects on disposal.

GPU rendering, shader compilation, integrated combat screenshots, readability, and physical-phone frame rate require parent integration checks. Capacity limits are implementation bounds, not measured performance guarantees.
