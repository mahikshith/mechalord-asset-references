# Frontline combat rebuild — 4 October 2026

## Changed behavior

- Enemies queue at a fixed front line and leave only after real HP-zero deaths. Close enemies can attack; Shield blocks their damage for the entire logical army. Damage and deaths emit separate readable effects.
- Road progress and authored encounters follow distance. Close fighting stops the road instead of silently letting enemies pass through. Aimed crates remain reachable; unclaimed crates give no fake reward.
- Original modeled robots replace the red crawler silhouettes. Projectiles have solid bodies, noses and fins, visible exhaust and tier colors. Shot trajectories and impacts use authoritative simulation positions.
- Larger crowd representatives, commander movement/recoil and a lower perspective camera improve portrait readability. Crowd representatives remain capped at 64; logical army counts stay authoritative.
- Boss movement changes its actual hitbox and firing origin. It strafes and approaches/retreats within an 8.5–12 m arena. Weapon windup and actual incoming shells/orbs/rockets replace the red ground lines.
- Zero boss health starts a 2.5-second destruction phase. Actual boss mesh parts detach, fall and settle; fire clears and a bounded wreck remains until retry. Results are deferred until this phase completes.
- Shield encloses the rendered legion and commander; EMP arcs attach to enemies in the pulse area and to the eligible boss; Overdrive changes attack damage/cadence and visual exhaust. All powers show their purpose in the HUD.
- Three stage palettes share a real raised causeway: beveled stones, 0.42 m segmented curbs, ledges, deep piers and arches, pipes, gears and stage-specific props. Two shared 512-pixel stone textures supply restrained surface wear.
- Boss health and charging cues occupy the existing mission panel. Additional boss overlays no longer cover its body.
- Built script/style URLs include their content hash, and the WASM fetch bypasses browser caches, preventing old code from silently appearing after a rebuild.

## Automated evidence

The actual shipping WASM passes **31/31** checks. `builds/rebuild-test-results.json` records its SHA-256, each assertion and nine winning runs. The current report hash matches the delivered binary. Checks cover one-shot gates, enemy survival until real kills, contact damage/blocks, encounter scheduling during stops, crate rewards and misses, relic consequences, boss movement/hitboxes/projectiles, destruction-before-victory, poor-play defeat, pause, equal results at 30/60/120 Hz, bounded pools and 250 retries. WASM linear memory stayed at 1,179,648 bytes.

`node tools/playable-preview/test_combat_visuals.mjs` passes **18/18** CPU scene/resource checks. These cover exact boss fragment transforms, stationary wreck retention, source geometry ownership, 300 resets, bounded debris/missiles/robots, pause, shield coverage, projectile orientation/launch height, EMP target cues and cleanup. CPU resource checks are not GPU frame-rate measurements.

The environment's scoped runtime check exercised 3,600 updates with stable objects and clean disposal: 12 reused segments, 14–16 visible draw batches and roughly 49–54k triangles depending on stage. These figures describe the environment only, not the entire frame.

## Browser observations

- Main game: loaded the rebuilt assets, dragged toward a gate, fought close waves, activated Shield, progressed to Twin and Arc, paused/resumed, reached the moving boss and won Relic Causeway. The final wreck stayed visible above the victory panel. Next Level reset the army to 8 and weapon to Pulse in Roller Foundry.
- Internal review page: uses the same unmodified shipping core and public controls with an automated steering policy. Its replay buttons allow repeatable inspection, not fabricated snapshots. Inspected Causeway frontline explosions, Foundry/EMP, Citadel/Overdrive and incoming rockets, full-army framing, and boss dismantling at 0.6 seconds.
- Browser console inspection reported no warnings/errors in the inspected main run. A narrow portrait viewport was also inspected (352 by 782 CSS pixels as reported by the canvas); text remained inside its controls. Small support labels were enlarged in the final CSS pass. This is responsive layout testing, not physical-phone validation.
- Captures are in `builds/playtest-v4`: main-shield.png, main-victory.png and boss-destruction.png. Some early review captures predate the final debris reduction/stone texture refinements; the main captures use the final gameplay build.

## Limits and remaining work

This is a **browser prototype**, not a packaged Android or iOS game. The Unreal runtime adapter still uses the earlier BattleSimulation and needs integration. No physical Nothing Phone (3) performance, 20-minute thermal run, APK installed-size measurement, low-memory device result or five-player usability study is claimed. The 49 checks and one live run do not establish production art quality, commercial value, retention or purchase readiness.

No new image-to-3D service was used. Local TRELLIS remains removed; user deletions, original references and unrelated tools were preserved. Later monetization ideas remain in the planning documents; no payments or paywalls were introduced.
