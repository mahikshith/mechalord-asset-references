# Top Lords upgrade plan

Branch `claude/top-lords-upgrade`, cut from `codex/iron-front-single-siege` (`db22db3`), 7 October 2026.

Goal: make the single Iron March level feel like the playable version of Top Lords on a phone: a big swarming army, dense urgent enemy waves, heavy impactful hits, polished lighting and a harder fight, while keeping the accepted Iron Front commander, troops and Tyrant (see `MEMORY.md`).

## Gaps observed in the current build (normal play, portrait 430x860)

- Flat, unlit look: grey road, no bloom or tone mapping, little atmosphere; reads as a prototype, not a store game.
- Army of 8 feels small; troops move as a rigid block rather than a swarm.
- Enemy waves are sparse and slow; very little pressure in the first 30 seconds.
- Bullets are small pellets; hits, deaths and explosions lack weight (no hit-stop, shake, debris, damage numbers).
- Camera sits high and static; no shake, zoom-out as the army grows, or boss intro.
- Villains (Rust Crawler, Cinder Reaver, Forge Tyrant) read as dark low-detail shapes with weak materials.

## Tasks, in order

Every new or changed asset is rendered and shown to the user for approval before it goes into the level.

1. **Rendering foundation**: ACES tone mapping, sRGB, bloom on emissives and muzzle fire, softer shadows, distance fog and sky gradient, textured road with seams, decals and wear. Renderer only (`world.ts`, `continuous-route-environment.ts`).
2. **Camera**: lower, more dramatic chase angle, smooth lead, shake on big hits, zoom-out as the army grows, a short boss reveal.
3. **Army swarm**: show many more troops (instanced, up to roughly 60 visible), loose swarm spacing with catch-up, run cycle, gates showing big numbers and splitting the crowd visibly.
4. **Combat feel**: tracer bullets, muzzle flashes, hit sparks, hit-stop, floating damage numbers, enemy knockback and wreck debris on death, bigger explosions.
5. **Villain asset pass** (show renders first): upgrade Rust Crawler, Cinder Reaver and Forge Tyrant materials and detail, glowing weak points, damage states, attack wind-up poses. Built on the existing models, not replaced.
6. **Difficulty and urgency**: denser and faster waves, enemies that charge into the army, negative gates and hazards, boss enrage. Needs the C++ core rebuilt (see below).
7. **Environment dressing**: more set pieces along the viaduct, trench and citadel, side parallax, debris.
8. **Phone check**: frame rate and draw calls at phone resolution, touch steering feel.

## Build prerequisite

Tasks 1 to 5 and 7 are renderer changes and rebuild with Node only. Task 6 changes the C++ simulation, which needs the Zig compiler at `tools/vendor/zig-x86_64-windows-0.17.0/zig.exe`; it is not on this machine yet.

## Phone check (step 8), 7 October 2026

Measured in headless Chrome on this machine's Intel integrated GPU at a 412x915 phone viewport (device pixel ratio 2.6, renderer capped at 1.6), during the first minute of Iron March. This is a desktop proxy, not a phone measurement.

| Build | Avg frame | 95th percentile |
|---|---|---|
| Baseline `db22db3` | 17.7 ms | 38.1 ms |
| Upgrade, bloom forced on (first seconds) | 48 to 55 ms | 65 to 92 ms |
| Upgrade after adaptive fallback | 19.1 ms | 37.6 ms |
| Upgrade with `?quality=low` | 21.0 ms | 45.4 ms |

Bloom and the half-float MSAA target cost about 20 ms on a weak GPU, so `RenderQuality` now watches the first 90 frames and drops to direct rendering when more than half exceed 24 ms. Stronger phones keep bloom. Real-device measurement (Nothing Phone (3) and an older phone) is still required.
