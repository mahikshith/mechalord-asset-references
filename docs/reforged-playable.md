# Mechalord Reforged — playable branch

**Status: parked after user comparison.** Environment and color ideas are retained for later; Iron Front is the accepted gameplay/character base. See `art-direction-decisions.md`. Do not treat this prototype as approved or resume its polish automatically.

Branch: `codex/reforged-playable`, based on native art review commit `9033ed5`.

Open `http://127.0.0.1:8077/reforged-playable/index.html` while the local preview server is running. `tools/start_reforged_playtest.ps1` starts that server when needed. The earlier version remains at `/playable/index.html`; its delivered files and saved progression are preserved.

## What this branch connects

The new Relic Marshal, Gearling Sentinel, Rust Crawler, Arc Warden and Forge Colossus use geometry exported directly from the native Reforged asset definitions. This is a playable browser adaptation of that art, with the existing C++ combat simulation compiled to WebAssembly. It is not a native Unreal build or an Android package.

The three route presentations are Skyforge Viaduct, Reactor Trench and Core Citadel. Original sculpted islands, pressure vessels, reactor banks, articulated machinery, foundations and distant foundries replace the earlier environment. A continuous surface under the route covers the full allowed formation width. Scenery recycling and encounters follow the simulation's forward distance; fighting does not stop movement.

Characters retain their authored surfaces and named mechanical parts. Runtime motion responds to movement, firing, hits, jet flight and destruction. Crowd parts share instanced draw batches. New muzzle and reactor coordinates drive projectile height while preserving the simulation's horizontal aim and collisions. A different visual presentation does not grant hidden aim assistance or health changes.

## Preservation and reproduction

- Prior playable branch: `feature/iron-front-lanes-and-arsenal`.
- Prior native art branch: `feature/native-reforged-world`.
- Native asset definitions: `tools/reforged_characters.py`, `tools/reforged_enemies.py`, `tools/reforged_world.py`.
- Export: `python tools/export_reforged_playable.py`.
- Build: `node tools/playable-preview/build_reforged.mjs`. The default browser build entry now directs to this separate output too.
- Delivery: `delivery/reforged-playable/`; original exports: `assets/exports/reforged/`.
- Progress is imported from the earlier edition if present, then saved separately under `mechalord-reforged-progress-v1`.

The export manifest records source dimensions, triangle counts, named pivots and material parameters. The delivery manifest records file sizes and SHA-256 hashes. Geometry is not simplified during export; material batching changes its draw representation, not its silhouette. The native material noise is approximated by subtle vertex colors in WebGL.

## Validation scope

The real combat WASM passes 56 automated checks, including gate arithmetic, straight default shots, permanent casualties, side collisions, boss attacks, staged destruction, revival, pause, frame-rate independence and 250 retries. UI checks cover progression, health, powers, failure, unavailable storage and isolated save migration.

Additional asset, environment, rig and browser review evidence is recorded alongside this report when completed. Automated checks and desktop screenshots do not establish Android performance or first-time-player usability.

## Remaining platform work

The native Unreal art project remains available separately. Its game build still requires the missing Windows C++ build toolchain/SDK. Android cooking, device profiling on Nothing Phone (3), touch validation on the physical device and package-size acceptance have not been completed by this browser branch. The full-detail character meshes need measured device budgets before making mobile performance claims.
