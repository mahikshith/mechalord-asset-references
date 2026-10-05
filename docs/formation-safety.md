# Formation-aware attack admission

This is a standalone policy in `game/Mechalord/Source/Mechalord/FormationSafety.h`. It does not move projectiles, steer the player, grant protection, or change damage. Gameplay integration is a separate step.

## Certificate and limitations

`AdmitAttack(query, workspace)` certifies that **at least one continuous commander steering path** exists through the supplied hazard envelopes, within the supplied movement budget, for the explicit `testedHorizon`. It protects every supplied body along that path. It does not guarantee that a first-time player will discover or choose the path. A user study and readable warnings remain necessary.

The algorithm bounds hazards over each time bin, projects their forbidden corridors onto commander X through each body's actual center clamp, and propagates reachable continuous intervals inside the remaining corridors. These swept rectangles conservatively contain circular collisions. Diagonal beams are projected at each body's depth, rather than blocking their entire X span. This can reject a genuinely playable attack; rejection means no certificate, not proof of unavoidable damage.

The certificate covers only the supplied bodies, active windows, trajectories and envelopes. New recruitment, formation resizing, new spawns, unmodeled contacts, changes to hostile speed, or homing outside an explicit acceleration envelope invalidate it. Existing homing should be `Trajectory::Unsupported`. A speed boost expiry cannot be silently treated as a constant velocity: split it into known segments or decline certification. An existing attack's assumed end must never precede its actual potential collision window.

## Integration contract

Namespace: `mech::formation_safety`. Store `Workspace` persistently in the battle/controller; it occupies 81,928 bytes in the tested compiler and allocates no heap storage. Do not create it on a small per-frame stack.

Supply `Body` records for the commander if that candidate can hit the commander, and each actually alive troop. Use the live span, including holes in `formationAlive`. The current source uses:

```cpp
Columns = min(4, formationSpan);
Row = slot / Columns;
Width = min(Columns, formationSpan - Row * Columns);
OffsetX = (slot % Columns - (Width - 1) * .5) * .73;
Z = -(.75 + Row * .48);
CenterLimit = max(.3, 3.9 - (Columns - 1) * .365);
// Body{OffsetX, Z, .36, -CenterLimit, CenterLimit}
// Commander Body{0, 0, .4, -3, 3}
```

This differs from subtracting the current commander X from a clamped troop world X; that would give the wrong offset after the commander moves away from an edge. Last-row width must be preserved. Keeping all live bodies for the horizon is conservative if some are removed; adding bodies requires another check.

For hazards:

- `Linear`: position at `start`, initial `vx/vz`, `radiusX/radiusZ`. Optional acceleration bounds conservatively widen its trajectory; caller must prove those bounds. Use equal radii for round shots.
- `Roller`: X is `clamp(x + amplitude*sin(phase + frequency*t), xMin, xMax)` and Z is `z + vz*t`, with `t` measured from `start`. Set roller half extents (`size*1.048`, `.80`) and its actual current phase including the source ID offset. Predicting a fixed hostile rate is valid only while that rate remains fixed.
- `Beam`: locked finite segment `(x,z)` to `(endX,endZ)`, active `start/end`, half-width `radiusX`. This protects the whole line, conservatively, during its active interval.
- `Unsupported`: the helper makes no certificate. Never replace active homing with a locked ray merely to get an admission.

Existing hazards are immutable. Proposed hazards include every shot of the proposed burst and their real relative birth times, predicted birth positions, locked aims and travel windows. At the first gunner burst shot, later shells are born at `.18` and `.36` seconds; their source Z can change as the gunner approaches. Compute each end through **last-row clearance plus combined body/projectile radius**, not just arrival at commander Z=0. Include actual blockers and enemy contacts when their kinematics are known.

Default `requireCompleteProposal=true` requires every proposed `end + acceptedDelay <= horizon`. The cap is six seconds; anything longer needs a different scheduling decision. Turning this flag off is explicitly partial-horizon diagnosis, not full-burst safety.

`Query.maxSpeed` is a certified feasible steering speed, currently 9 m/s. `reactionTime` can reserve a deliberate warning response interval during which the commander cannot move. Its default is zero: an admission with zero reaction time is a mathematical feasibility result, not a usability result.

## Decisions

- `Admit`: proposal has a certified path. `workspace.reachable[0..result.reachableCount)` contains final reachable intervals; `result.best` is the widest. These are final intervals, not a ready-made input replay.
- `Delay`: only the uncommitted proposal may shift by `result.delay`. Caller must actually keep its source/aim timing consistent with the shifted prediction or recheck before committing. Existing attacks are untouched.
- `Suppress`: none of the bounded proposal timings was certified.
- `ExistingUnsafe`: existing hazards already have no certified route. Adding an attack is not admitted.
- `Unsupported`, `InvalidInput`, `CapacityExceeded`: no certificate. Do not interpret them as permission to attack.

Limits: 25 bodies, 128 existing hazards, 16 proposed hazards, 360 time bins, 512 reachable intervals, 4,096 forbidden intervals, three delay retries, and 65,536 body/hazard pair checks **across the entire admission call**, including baseline and retries. Exhausting any applicable limit fails closed. Default bin size is 1/60 s. Early depth rejection keeps distant attacks inexpensive.

Delay retries shift only the proposal's supplied active windows and relative trajectory. They do not mutate the input and cannot hide a collision beyond the tested horizon. Integrators should keep retries short and re-predict moving sources when an attack is actually delayed. Rockets may instead need an authored exclusive encounter while their homing interval is active.

## Isolated validation

Run `node tools/playable-preview/test_formation_safety.mjs`. It compiles and runs only the new portable test program using the already installed Zig compiler; it does not rebuild or edit the playable simulation. Report: `builds/formation-safety-results.json`.

Checks cover commander versus trailing rows, broad/narrow armies, actual edge clamp, warning/reaction movement budgets, rollers sealing escape corridors, committed trajectories, diagonal/horizontal beams, intermediate sine extrema, six-second rear clearance, explicit partial horizons, immutable inputs, bounded retries, acceleration envelopes, homing refusal, deterministic outputs and workload caps. A separate dense physical oracle checks admitted stationary formations against actual circular distances and sinusoidal positions, independent of the helper's rectangular projection.

These tests do not validate browser frame time, Android performance, integrated encounter balance, or first-time-player comprehension. Parent gameplay integration must be tested separately.
## Integrated checkpoint

The helper is integrated into level-0 ranged locks and boss attack commitment in checkpoint two. The caller supplies actual live formation slots, or a conservative maximum-row envelope during an upcoming recruitment crossing. Existing target bodies use conservative approach/queue occupancy envelopes; gunners hold their position through their committed burst. The boss captures its attack speed multiplier at lock, preventing a later phase transition from invalidating predicted timing. The baseline helper tests above remain isolated evidence; actual-WASM and independent encounter receipts separately verify the integrated candidate. Homing attacks retain exclusive authored windows and are never counted as certified linear trajectories.
