# Iron Front — rebuilt combat preview

Open http://127.0.0.1:8077/playable/index.html on this PC while the local server runs. Restart the server with tools/start_playtest.ps1. Refresh an already-open tab to load the replacement build.

Drag horizontally or use Left/Right (A/D). Shooting is automatic. Space or the relic button activates Shield, EMP or Overdrive. Escape pauses. R retries; the pause/result panels also offer restart.

Shoot yellow weapon crates to upgrade the cannon. Fire into a gate to improve its value, then cross it to recruit or multiply troops. Negative gates can become positive under sustained fire. Choose supply lanes while avoiding red machines and rolling hazards. A chain of rapid side-lane recruitment gates changes the rhythm midway through. The boss marks a red lane before attacking; move out of it or time your relic.

## What changed

The rejected first preview was replaced: centered portrait framing, brighter ground, larger units, visible projectile hits, individually simulated enemies, weapon progression, changing gates, rapid recruitment, denser authored waves and an attacking boss. The existing TRELLIS commander is retained. The terrain and remaining characters are still provisional.

This preview now has three selectable authored stages: Relic Causeway (55-second approach), Roller Foundry (60 seconds), and Citadel Breach (65 seconds), each followed by a boss. All stages and relics are available without purchases. Best scores and stage completion are saved locally. The old passive siege-reserve phase has been replaced for this combat study. This is not the five-stage Android delivery.

On `feature/iron-front-lanes-and-arsenal`, paired left/right gates have explicit apertures; rollers move across the road; larger troop representatives and denser waves occupy more of the battlefield. Shooting crates earns XP toward Pulse, Twin, Arc and Siege cannons. Relic charge is earned in combat. The boss uses traveling shells, energy fans or rockets according to the stage, with warnings and actual collision. Reaver elites and the Forge Tyrant use original editable Blender assets based on the new concept references; they are modeled interpretations, not TRELLIS conversions.

Terrain changes from a warm causeway to a foundry with pipes, then a cool citadel with energy crystals. The formation compresses near the roadside. Normal enemy rendering uses pooled instances and prioritizes nearer threats when its representative limit is reached. The desktop visual limits exceed the original mobile budget and need device profiling before Android acceptance.

## Source and verification

- game/Mechalord/Source/Mechalord/AssaultSimulation.h and .cpp: new portable fixed-step battle rules with bounded pools.
- tools/playable-preview/assault_bridge.cpp and assault-core.ts: compiled browser adapter.
- tools/playable-preview/world.ts: rebuilt Three.js renderer.
- tools/playable-preview/main.ts, index.html, style.css: replaced input, HUD, sound and menus.
- Run tools/playable-preview/build_assault.ps1, then node tools/playable-preview/build.mjs to rebuild.
- Run node tools/playable-preview/test_assault.mjs for the actual new binary/adapter tests.

The existing Unreal runtime still connects to the previous BattleSimulation and needs the new combat adapter. No native engine build or Android measurement is claimed. Review rebuild-validation.md for actual results and top-lords-rebuild-study.md for reference evidence.

The previous build is preserved at Git commit `7975736` on `main`. Reference observations for this iteration are in `iron-front-v3-reference-study.md`.
