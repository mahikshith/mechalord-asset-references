# V7 collision, pacing, and screen-framing audit

Reviewed 5 October 2026. This independent workstream reads the real simulation, its browser adapter, and the renderer. It does not change gameplay or rendering files. Measurements below distinguish the pinned pre-fix binary from the subsequent source fixes; they are not Android-device results.

## Findings and evidence

The reported overlap had a measurable cause: some rendered machine footprints were substantially larger than their collision circles. Shield is also an intentional reason for contact without army loss. When Shield is active, damage functions emit a block and preserve troop count. The overlap reproductions below never activate a relic, so Shield does not explain them.

Local shipped GLBs were parsed with their original node transforms, and the procedural enemy and roller geometry was inspected in Three.js. Textures were removed only from the in-memory inspection copy. Bounds are conservative geometric envelopes, not claims that every enclosed mesh triangle touches another model.

| Model | Rendered footprint measurement | Previous simulation proxy | Assessment |
|---|---|---|---|
| Allied troop | Width .707m, forward/rear half-depth approximately .233/.243m at `.72` scale and `.60` lateral factor | Circle radius .36m | Width is consistent. Keep authoritative formation positions and spacing. |
| Common enemy | Half-width .427m, forward barrel depth .716m, rear depth .357m | Radius .27m for authored ordinary enemies; .30m in the initial warm-up | Visibly extends outside its proxy. |
| Elite | Half-width up to 1.067m, forward depth .764m at scale 1.1 | Radius .48m | More than twice the old collision half-width. |
| Gunner | Half-width .970m, forward depth .695m | Radius .38m | More than twice the old collision half-width. |
| Roller | Cap half-width `1.047826 × size`, rotating spike depth up to approximately .795m | Circle radius .85m or .95m | A circle misses some corners of the visible cylinder-and-spike envelope. |
| Commander | Full arm/weapon width 2.332m at scale 1.43 | Torso radius .40m | Decorative arm reach should not become an oversized blocking hull. |

The original swept circle test already considered continuous target motion. With normal 60 Hz movement, the main discrepancy was the footprint, rather than a missing sweep that allowed an entire contact to tunnel between frames.

## Actual binary reproduction

The audited binary was copied before gameplay fixes to ignored `builds/v7-audit/pinned-assault.wasm`. It is 1,269,361 bytes, SHA-256 `6dfe94dbcbe7640b024a2870e540373934c95f014e64987a85ad06dfc96a0002`. Ignored `builds/v7-audit/overlap-report.json` retains measurements and samples.

Eighteen runs cover three levels, held lanes −2.8/0/+2.8, and ranks 0/2. Runs use the public start/step exports at 60 Hz, equip Overdrive without activating it, and perform no state injection. Across 63,219 frames, there were 1,173 distinct common-enemy/troop pairs, 114 elite/troop pairs, and 35 roller/troop pairs whose visual envelopes overlapped while their old collision circles remained separated and troop count and commander HP remained unchanged. These are envelope mismatches, not 1,322 separately verified triangle intersections.

Examples from level zero, rank zero, holding left:

- At 10.583s, initial enemy 3 at (−1.8, .196), with radius .30, visually reaches troop slot 3 at (−1.75, −.75). Their old proxy separation is .287m, army remains 8, HP remains 100, and ability time is zero.
- At 12.567s, elite 9 at (−1.15, .196), with radius .48, reaches the envelope of the same front-row slot. Proxy separation is .280m; army remains 21 and HP remains 100.
- At 46.350s, roller 292 at (−.507, −2.057), size .85, reaches troop slot 11 at (−1.75, −1.71). Proxy separation is .081m, army remains 156, HP remains 98, and ability time is zero.

These target IDs and timing apply to the pinned baseline. The revised timeline and wider footprints deliberately change them.

## Gameplay fixes inspected in source

The gameplay owner implemented the following in `AssaultSimulation.cpp`, confirmed by source inspection after the audit:

- Ordinary enemy half-width .44m/depth .73m, elite 1.1m/depth 1.0m, gunner 1.0m/depth 1.0m.
- Enemy and roller contact uses a swept footprint box expanded by the troop/commander body radius. Projectiles retain their swept round footprint. It would be inaccurate to describe the current enemy test as an ellipse.
- Roller contact half-width is `size × 1.048` and depth .80m.
- Enemy columns are .95m apart, rows 2.05m apart. Commons within 1.69m of an elite/gunner center are omitted from its front row.
- Following enemies queue using both visible half-widths and summed depths plus .10m, replacing the previous .72m same-lane queue gap.
- Allied formation retains four columns for steering room, with .73m lateral and .48m row spacing, beginning .75m behind the commander.

The independent runtime findings establish the old mismatch. The corrected binary and regression scenarios are validated by the gameplay owner; this audit does not substitute a second, unperformed device or browser test for those checks.

## Encounter rhythm

The previous schedule put a gate pair, ordinary crate, extra heavy crate, orb, and roller on the same spawn plane around traversal second 16. Second 20 could contain two gate pairs from independent schedules. Ordinary waves also used .66–.75m columns and .78m rows despite the larger visible machines.

The revised source uses repeatable eight-second sections: gate at section start, crate at +1.8s, wave at +4s, orb at +6.2s, and roller at +6.8s every other section. The dedicated duplicate heavy crate was removed. Starter gates are spawned once separately. This supplies about 6.66m between a gate and crate at the 3.7m/s traversal rate, with separate wave rows and bounded side obstacles. Orb/roller beats remain intentionally close; moving rollers, unlike the old stacked gate/crate planes, can still create a combined decision.

## Last Stand UI review

Healing and revival are manual. Healing is invoked only by its button or a nonrepeating H press, checks cost and quota in the simulation, and cannot spend automatically. Revival is invoked only by its explicit button. The Last Stand state clears steering and freezes gameplay while presenting its troop cost. Declining, stage selection, and retry do not silently spend the revival cost.

A real event-ordering race was found: decline could set the core to Lost, then a window blur before the next animation frame could set the UI paused. The old loop would consume the death effect while paused and enter a defeat timer that could never resume. The parent corrected this by clearing paused/downed state and their overlays when a terminal Lost snapshot is received, before consuming effects. The changed source was inspected; this finding is based on event ordering, not a claimed browser replay.

## Stable four-column camera fit

Full 24-unit formation uses six rows. Its last row is at world z `+.75 + 5 × .48 = 3.15`. Include approximately .24m of trailing foot geometry: project `(0, 0, 3.39)`, not only the last row center. World positions are not compressed for this fit.

For the existing 30° perspective camera, half-width 5.05m, distance `(5.05 / min(.45, aspect)) / tan(15°)`, height `.58 × distance`, and back offset `.815 × distance`, a stable resize-only binary search can prefer lookZ −9.3 and relax toward zero until that point clears `height − 118px`. The 118px exclusion reserves the new compact left HUD plus its healing variation and gap.

| CSS viewport | Fitted lookZ | Commander feet | Rear center feet | Trailing foot edge / reserved UI top |
|---|---:|---:|---:|---:|
| 375 × 667 | −6.5784 | 465.9px | 542.7px | 549.0px |
| 412 × 915 | −7.7501 | 676.5px | 787.8px | 797.0px |
| 352 × 782 | −7.2225 | 563.6px | 656.3px | 664.0px |

The baseline 98.5px exclusion alone would allow −7.3008, −8.2498, and −7.8212 respectively, but would not protect the healing variation. Camera-only movement shifts commander and rear ranks together: retaining a lower commander and fully visible rear ranks on a short screen requires space, a smaller projection, fewer rows, or moved controls. Cropping empty upper space alone cannot remove that constraint. Four columns were retained for dodgeability, so this recommendation prioritizes visible bodies and fixed, jitter-free framing.

The exact projection was executed with the local Three.js camera in ignored `builds/v7-audit/camera-fit.cjs`. Final screenshot checks use actual CSS panel bounds and remain the renderer owner's integration check.
