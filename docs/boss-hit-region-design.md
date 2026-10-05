# Iron Front: independently aimable boss systems

This report began as the measured recommendation for replacing the stage-two boss. Checkpoint three now implements independently damaged components, authoritative pose and three-dimensional shots in level zero. The final `73b4ca12` binary passes 71 simulation and 14 independent checks, including free winning routes with all relics and zero unresolved contacts across 26 runs. Implementation details and remaining render/human/device acceptance are in [the execution report](combat-upgrade-execution.md). This is not a native Unreal gameplay or Android validation claim.

## Baseline before the stage-three change

`MoveShots` accepts any ray within 2.4 m of `bossX` at one boss Z plane. `DamageBoss` subtracts a common armor pool and `BreakBossParts` removes paired cannons, pods and legs at scalar thresholds. Thus a center shot can damage a distant limb. Exposed-core damage accepts a 0.9 m lateral window. The renderer independently lifts every boss-bound friendly shot toward `bossY + 4.31`; neither that shot height nor its apparent target part exists in the simulation.

The retained original `forge-tyrant.glb` has suitable named joints. Measurements below are actual mesh bounds at the current 1.4 scale, excluding boss root translation. World Z points toward the commander; simulation Z has the opposite sign. Native `L` is therefore screen-right after the model's 180-degree facing rotation.

| Region | Center X / Y / world Z, metres | Mesh half-size X / Y / Z |
|---|---|---|
| cannonL | +1.7248 / 3.7493 / +1.2464 | .6276 / .6180 / .8252 |
| cannonR | −1.7248 / 3.7493 / +1.2464 | .6276 / .6180 / .8252 |
| jetL | +1.4325 / 5.3680 / +.0621 | .4824 / .4715 / .5518 |
| jetR | −1.4325 / 5.3680 / +.0621 | .4824 / .4715 / .5518 |
| legL | +.7747 / 1.5578 / +.2485 | .5554 / 1.5578 / .7016 |
| legR | −.7747 / 1.5578 / +.2485 | .5554 / 1.5578 / .7016 |
| core | 0 / 4.27547 / +.91576 | measured luminous oval half-size .34891 / .50592 / .09969 |

The measurement script samples 324 combinations of current root pitch ±.18, bank ±.22, yaw ±.32, arm pitch −.30…+.35 and leg swing ±.16. Cannon centers move up to 1.98 m, pods 2.07 m, and leg centers .87 m. A permanent union of those positions would be an oversized invisible hurtbox. Neutral centers alone are equally unsuitable.

Evidence: `tools/playable-preview/measure_boss_regions.mjs` and `builds/boss-hit-region-measurements.json`, including the exact neutral bind hierarchy. No editor or asset mutation was performed.

The initial circular core proposal was superseded by a measurement of all 134 luminous Torso vertices. The collision center is the oval heart center above; charge/laser emission sits on its front surface at neutral world Z +1.015445. `builds/boss-core-luminous-measurement.json` records the source geometry, and `builds/boss-rig-alignment-checks.json` verifies 4,268 compiled helper / actual GLB transforms across 388 asymmetric poses. Renderer support is opt-in when the matching spatial bridge provides pose/region data; legacy stages keep their existing presentation. This transform evidence alone does not prove encounter balance or complete independently aimable gameplay.

## Smallest honest architecture

Use seven authoritative regions and six independent part-health values. Preserve the current cannon → pod → leg → core encounter order, but let left and right members of each pair take damage independently. Intact later-stage parts and the closed central reactor block/deflect shots; they cannot silently inherit current-stage damage. The single top HUD bar remains aggregate objective health, with compact targeting cues on the currently vulnerable parts.

1. **Core-owned pose.** Compute the target-bearing root and joint pose at the fixed simulation step. Publish its values and region transforms. Three consumes the same values rather than independently choosing banking, yaw and joint swing. The head, face, glow, barrel axial spin and tiny bounded cosmetic shake may remain presentation effects.
2. **Real three-dimensional friendly shots.** Add shot ID, `y`, `dy`, immutable `aimRegion`, and a damage-stage epoch. The renderer draws the supplied X/Y/Z and direction directly, and impact events include actual Y and hit region. Remove the invented boss-height path and broad `bossX` armor damage branch.
3. **Horizontal steering still selects the target.** Ordinary fire retains `dx = 0`. At launch choose a currently vulnerable region whose current projected X extent contains that ray, then aim vertically toward its current center. No region aligned means a center/body deflection or a miss, not invisible lateral steering. Formation shots use their own origins, so a wide formation can strike both sides. Guided missiles may choose one eligible region at launch and home to that same surviving region; they never jump into the next damage stage.
4. **Swept relative collision.** Intersect the real shot segment with the region's current/previous oriented ellipsoid or rounded box. Include region movement in the relative sweep to cover the 6 m/s dash, and choose the nearest physical intersection. Shot radius is a small measured tolerance, not a broad boss-wide acceptance window. A locked/future region consumes the round with a deflection. A broken region contributes no collision.
5. **Independent consequences.** Only zero HP on a particular cannon/pod/leg sets that bit and removes its actual emitter or movement contribution. Advance the vulnerability stage only after both members reach zero. Cap applied damage to remaining HP. Rail splash/penetration and EMP explicitly respect the current damage-stage epoch: no excess damage transfers into the future pair or newly exposed core in the same shot/burst.

For an initial health profile, split the existing armor budget into the same 35%/35%/30% stage shares, then split each share between left/right. This preserves the total budget for the first comparison; it does **not** establish balance once center shots correctly deflect. Retest fresh and earned ranks before declaring the new version beatable.

## Concrete shared pose equations

Use Y-up **world** coordinates inside the pose calculation and invert Z only at the simulation adapter boundary. Let `M = Translation(bossX,bossY,−bossZ) · RotationXYZ(pitch,yaw,roll) · Scale(1.4) · RotationY(π)`. The bind translations/quaternions come from the measurement receipt; all target-bearing neutral bind quaternions are identity. A region's world transform is `M` multiplied by its exact ancestor bind translations and animated joint rotations. Do not apply the native-facing π twice.

At each fixed step, derive `vx = ΔbossX/dt`, `vz = −ΔbossZ/dt`; airborne pitch target is `clamp(vz*.018 + clamp(Δvz/dt*.0025,−.07,.07),−.18,.18)`, roll target `clamp(−vx*.045,−.22,.22)`. Smooth each with `alpha = 1−exp(−8*dt)`. Yaw is `clamp(atan2(aimX−bossX,max(6,bossZ)),−.32,.32)` using the committed lane while winding up/firing and the commander lane otherwise. Existing walking pose uses leg pitch `sin(poseClock*5.5 + sidePhase)*amplitude`, knee pitch `max(0,sin(...))*.12`, and arm pitch according to the existing exposed/guarded/rebuilding/windup/fire state. Move those state equations and `poseClock` into C++; freeze the target pose during EMP stun. Presentation recoil must either be included there or remain within a declared small hurt-volume tolerance.

For cannon regions, compose Root → Torso → Arm → Barrel; pods Root → Torso → Pod; legs Root → Leg with its child Knee/Foot bounds. Use the measured part-local center/volume in that joint frame. Prefer a central shin/thigh ellipsoid over a large whole-leg AABB if the empty space around the foot makes hits look false. Publish quaternion/axes with center/radii; a center plus axis-aligned radius alone loses the rotated shape.

## Boundaries and acceptance

Core: pose/region calculation, independent HP, real shot Y, nearest sweep, stage epoch and emitter removal. Bridge/contract: seven region records, pose fields, shot ID/Y/dY/aimRegion and actual hit-region/height data. World/arsenal: consume pose, aim weapons at authoritative shot elevation, show only current vulnerable regions. Combat renderer: direct shot positions and actual region impacts. UI: current target names, no second boss-health dashboard.

Tests must demonstrate left-only/right-only damage, central closed-core deflection, broken-part misses, pose/mesh alignment during hover/dash/windup, nearest contact, rail/EMP caps, no future-stage spill, deterministic results across 30/60 Hz, pause/retry restoration, and normal-control fresh/earned-rank wins with useful damage margins. Actual browser screenshots must show rounds entering the selected visible part. A native Unreal gameplay port remains separate work; this proposal must not be described as native gameplay already implemented.
