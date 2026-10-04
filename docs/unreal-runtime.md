# Unreal runtime: existing legacy slice and v7 port

Unreal **5.8.3** is installed and verified, changelist 58210709, with `UnrealEditor.exe` present. An actual `MechalordEditor` build was attempted and failed on the missing Windows SDK 10.0.19041.0 and undetected MSVC toolchain. There is no successful C++ game build, Android cook/package or physical-device test. Complete the supported compiler/SDK prerequisite before claiming native gameplay validation.

## The two combat implementations

The tested browser Iron Front v7 uses `mech::assault::Battle` in `AssaultSimulation.h/.cpp`. Its 56 passing actual-WASM regressions cover three authored stages, continuous travel, straight and earned special fire, real formation contact, permanent representative casualties, commander HP, temporary powers, staged boss parts, lasers, Last Stand and optional troop-funded healing/revival. See [frontline-v7-validation.md](frontline-v7-validation.md).

The existing native GameMode still owns `mech::Battle` from `BattleSimulation.h`: the earlier gate runner and troop-launcher siege. Native phase enums, input units, snapshots, saves and rendering differ. The compiler will compile the assault source as part of the module when ready, but that alone will not wire it into the GameMode. Renaming an include is not a valid port. [native-gap-v7.md](native-gap-v7.md) records the exact boundary and installed-header inspection, including a bounded widget output-pointer repair still awaiting an actual compile.

## Legacy bootstrap and runtime

Once the C++ prerequisite is ready, `tools/launch_unreal.ps1 -Build -Bootstrap -Launch` records the installed engine version, builds the editor target, runs `tools/bootstrap_unreal.py` and opens `game/Mechalord/Mechalord.uproject`. The complete sequence has not succeeded. Bootstrap creates `/Game/Mechalord/Maps/Entry`, unlit materials, commander assets, five legacy stage timelines and chunk labels. It writes `builds/unreal-bootstrap.json` only when executed in the editor. No generated Entry map/current native gameplay import is claimed from browser work.

The legacy first-view pipeline uses the preserved detailed 19,537-triangle commander and 1,024-pixel painted texture, exceeding the planned shipping target. Its mobile skeletal candidate and first-pass Idle/Run clips remain review assets. `AMechalordCommanderPawn.bUseSkeletalCommander` defaults to false; texture, orientation, joints and deformation need actual editor inspection. The canceled local TRELLIS installation/generation pipeline must not be restored.

Earlier environment/troop art is rejected or unapproved; bootstrap excludes it by default. Primitive geometry permits legacy mechanic checks. `MECHALORD_EXPERIMENTAL_ART=1` opts into existing kit imports for internal tests, not art acceptance.

Expected **legacy** controls are middle-area dragging or A/D/Left/Right steering, Space for relic, E for the siege champion, Escape to pause, and R after a result. The old HUD offers upgrades/relics and its mode records each result once. These behaviors still require native execution. Its pooled instance buffers target 80 combined representatives; this is not the v7 authoritative four-column formation.

Legacy stages four/five require an installed compatible chapter and loaded authored assets, with soft optional references and no inline fallback for missing downloaded content. Shared assets have a chunk-0 label; chapter assets use chunk 1001. Real cook/staging and pak-content audits remain pending. Optional chapters are outside the smallest current assault port.

## Native asset work and next playable slice

The separate content-only project `game/MechalordArtLab` is being built/tested while the C++ toolchain is unresolved. It is for original asset/material/part inspection, not a substitute for current gameplay. Do not claim its validation complete yet; [unreal-artlab.md](unreal-artlab.md) provides evolving native receipts and limits. Current browser GLBs need deliberate engine-supported import/export and scale, texture, pivot, hierarchy and animation checks; the legacy FBX route should not be assumed to import them correctly.

After a successful `MechalordEditor` build, add an assault-specific adapter and retain the legacy mode as a clearly identified reference. Start with stage zero/rank zero, map phases explicitly, and pass steering in world metres −3..3. Advance the shared fixed-step core once per tick and render its authoritative formation, targets, projectiles, pickups, lasers and boss state at 100 cm per metre. Consume each effect once; engine physics must not duplicate core damage.

The compact native HUD needs army/commander HP, relic charge, earned starter and temporary powers, one boss armor/core bar, explicit heal costs, and frozen Last Stand revive/decline choices. Preserve Destroying and defeat transitions before results. Prove one gate, enemy/roller contact, physical pickup, boss part loss, laser hit/dodge, heal/revive/decline and retry, then connect all three stages and saved XP/rank.

Acceptance requires actual Play-in-Editor observations and build logs: simulation identity, touch framing, accurate visible hit/count changes, pause/suspend, no automatic spending, stable pooled objects across retries, and correct imported art. Then use Turnkey for Android, audit package/chunk sizes and measure Nothing Phone (3) for 20 minutes. Sustained 30 fps, size ceilings and older-phone support remain unverified.
