# Iron Front — rebuilt combat preview

Open http://127.0.0.1:8077/playable/index.html on this PC while the local server runs. Restart the server with tools/start_playtest.ps1. Refresh an already-open tab to load the replacement build.

Drag horizontally or use Left/Right (A/D). Shooting is automatic. Space or the relic button activates Shield, EMP or Overdrive. Escape pauses. R retries; the pause/result panels also offer restart.

Shoot yellow weapon crates to upgrade the cannon. Fire into a gate to improve its value, then cross it to recruit or multiply troops. Negative gates can become positive under sustained fire. Choose supply lanes while avoiding red machines and rolling hazards. A chain of rapid side-lane recruitment gates changes the rhythm midway through. The boss marks a red lane before attacking; move out of it or time your relic.

## What changed

The rejected first preview was replaced: centered portrait framing, brighter ground, larger units, visible projectile hits, individually simulated enemies, weapon progression, changing gates, rapid recruitment, denser authored waves and an attacking boss. The existing TRELLIS commander is retained. The terrain and remaining characters are still provisional.

This preview is one authored 55-second approach plus a boss battle, with three selectable relics and instant retries. It is not the five-stage Android delivery. The old passive siege-reserve phase has been replaced for this combat study.

## Source and verification

- game/Mechalord/Source/Mechalord/AssaultSimulation.h and .cpp: new portable fixed-step battle rules with bounded pools.
- tools/playable-preview/assault_bridge.cpp and assault-core.ts: compiled browser adapter.
- tools/playable-preview/world.ts: rebuilt Three.js renderer.
- tools/playable-preview/main.ts, index.html, style.css: replaced input, HUD, sound and menus.
- Run tools/playable-preview/build_assault.ps1, then node tools/playable-preview/build.mjs to rebuild.
- Run node tools/playable-preview/test_assault.mjs for the actual new binary/adapter tests.

The existing Unreal runtime still connects to the previous BattleSimulation and needs the new combat adapter. No native engine build or Android measurement is claimed. Review rebuild-validation.md for actual results and top-lords-rebuild-study.md for reference evidence.
