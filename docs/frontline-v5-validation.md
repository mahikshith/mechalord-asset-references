# Iron Front: continuous combat and contact alignment

Validated 5 October 2026. This is the browser prototype using actual portable C++ compiled to WASM. Unreal integration and physical Android testing remain pending.

## Delivered behavior

- Constant close portrait camera, lower commander position, distant threat entry and continuous running travel.
- Straight default fire; collectible guided missiles, rotating hand cannons and railburst from elites and shootable flying orbs.
- Dark slate stone floor with original albedo/bump/roughness textures. Gold commander shots and cyan troop shots originate from their actual firing positions and share the existing damage budget. Hostile energy rounds have solid red/orange shells.
- Commander health in the lower-left HUD. Soldiers intercept attacks across their actual formation; after they are lost, the commander takes health damage. Defeat snapshots the posed commander into separate fragments, with 1.5 seconds before results. A surviving boss stays visible.
- Jet-assisted boss arrival, lateral/depth/height movement, three attack patterns, a second weapon phase and one top health bar. Repeated floating boss-damage labels were removed.
- Saved commander XP, ranks, bounded starting benefits and earned weapon head starts. All stages remain selectable without purchases.

## Collision correction

Previously, projectile checks used only a narrow commander-centered strip at z=0. Side enemies could become pass-only before reaching soldiers behind that strip; rollers also checked only the commander.

The simulation now owns a formation of at most 24 visual representatives in four columns. Rendering, firing and swept projectile/body/roller contacts consume the same positions. Casualty slots are absent for 0.7 seconds from rendering, firing and collision together. Logical army size remains separate from the visual ceiling.

Troop source geometry measured 1.637 m wide. Its earlier render width was 1.36 m in 0.70 m spacing. New render normalization is approximately 0.707 m wide, 1.372 m tall and 0.477 m deep. Spacing is 0.70 m laterally and 0.48 m longitudinally; troop contact radius is 0.36 m. The narrower formation leaves real dodge space.

Ramming small enemies produces combat damage and destruction. Surviving elites recoil outward ahead of the army. A contacted roller produces damage and a breakup effect. An enemy outside the whole formation may pass without receiving a fake kill reward.

## Verification

- **40/40 actual C++/WASM checks pass:** distant spawning, continuous travel, straight shots, once-only gates, physical pickups, authoritative casualty gaps, side enemy/roller/projectile contacts, commander health/death, boss phases, 30/60/120 Hz consistency and 250 retries.
- All nine baseline-rank stage/relic routes win using public controls, taking approximately 66–117 seconds. Citadel Shield/EMP runs are demanding; automated wins do not establish first-time-player fairness.
- **31/31 combat-visual CPU checks pass:** bounded pools, colors and launch positions, commander skin-pose fragments, independent boss wreck, temporary weapons, pause and disposal. These do not measure GPU performance.
- Actual main/UI harness checks pass for rewards, migration, free stage selection, health, one boss bar, defeat delay, retries and bounded cached audio.
- Live browser review observed gold/cyan fire, slate flooring, physical pickups, hand cannons, boss flight and phase-two volleys, troop losses during boss combat, and commander dismantling with the surviving boss visible. No runtime errors appeared in the inspected final review.
- The requested 412 × 915 portrait viewport produced a 352 × 782 CSS battlefield in the app's scaled preview, filling its available portrait width and height. HP and temporary-power controls were inspected there. This is not a physical Nothing Phone (3) measurement.

Binary report: `builds/rebuild-test-results.json`.
WASM SHA-256: `6c29684443ccb16f1bdca52c33065c76708667ec99ac95190636d958d28b2b40`.
WASM size: 1,257,409 bytes. Fixed allocated WASM memory: 1,179,648 bytes. These exclude the renderer, models, textures and browser memory.

## Evidence and remaining acceptance

- `builds/playtest-v5/portrait-combat.png`: final portrait game view.
- `builds/playtest-v5/commander-destruction.png`: posed-model dismantling.
- `builds/playtest-v5/boss-phase-two.png`: phase two in the internal public-control review.
- `builds/playtest-v5/hand-cannons-review.png`: temporary equipment; captured before the later floor change.
- `docs/reference-review-v5.md`: inspected reference frames, product-label caveats and local defects.

Still required: native Unreal adapter integration/build, Android packaging, sustained physical-device performance/thermal testing, touch/readability checks and first-time-player observation. This iteration is not claimed to be a store-ready commercial game. No new TRELLIS installation or paid generation service was used.
