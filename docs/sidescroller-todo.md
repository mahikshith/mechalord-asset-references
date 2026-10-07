# Side-scroller to-do (from the user's review, 8 October 2026)

Work through these in order and show a capture after each group. Read `docs/sidescroller-unreal.md` first.

## A. User's review of the first fight clip

1. **Remove the "tank" on the bunker completely.** It is the static turret (`Turret_Barrel`, `Turret_Muzzle`, `Turret_Mantlet`, `Turret_Sight`) in `tools/blender/sidescroller_slice1.py`. Delete it from the Blender scene, re-export (`tools/blender/export_slice_to_unreal.py`) and rebuild the level (`tools/unreal/build_docks_level.py`, then `place_enemies.py`). Leave no idle props that look like enemies.
2. **Enemies get stuck walking into walls.** Mike (Bulwark) walked into the catwalk leg/bunker wall and kept marching. Add obstacle checks to `AIronEnemy`: forward trace, then turn, stop or jump; keep each enemy inside a patrol range around its spawn; don't push into the hero or each other.
3. **The hero bounces and jumps while firing.** Part of this is the test bot (`-IronFight` "stuck" jump logic in `AIronTrooper::RunAutopilot` fires when enemies block the way). Fix the bot, then verify with real input that firing never lifts or launches the hero: no knockback in god mode, no recoil launch, and check that `LaunchCharacter` from enemy contact isn't stacking.
4. **Sentry laser quality and logic (Leela).**
   - She must turn around to face the hero (she currently only faces once and sweeps on one side).
   - Never aim through solid floors or walls: require line of sight, clamp the sweep, and pick a firing position instead of pointing straight down through the catwalk deck.
   - Better beam look: a layered core plus glow, a scrolling noise texture, a heat-distortion feel, an impact glow and sparks at the hit point, a muzzle glow, and a sound fade in and out.
5. **Foreground textures and lighting.** The lane props, the deck and the hero read dark and flat, especially under the catwalk. Add a normal map to the scan material (world-aligned normal), a rim or back light for characters, local lights (lamps and the bunker beacon) that actually light the lane, a reflection capture, better exposure, and contact shadows or AO.
6. **Destructible environment.** There is heavy firepower, so the surroundings should break: crates and barrels take damage and burst (barrels explode with radial damage), sandbags and railings chip, lamp posts topple, and the glass and windows in the background flicker when explosions go off. Start with swap-to-debris actors (intact mesh, then physics chunks plus FX), then consider Chaos geometry collections for the bigger pieces. Keep the cost phone-friendly by pooling chunks and capping their lifetime.

## B. Known issues already noted

- Hero armour reads brassy: lower metallic or adjust the BaseColor bake in `tools/blender/export_soldier.py`.
- Leela's idle reads as a crouch: pick a different idle clip or add an offset.
- The Tyrant paint on the mechs comes out pinkish: tune `FactionColor` and `FactionAmount` in `M_IronEnemy`.
- No swim animation; the hero uses idle in water. Find a free swim clip or blend fall plus a paddle offset.
- Stan (Raider) hasn't been seen on camera yet; verify him.
- Difficulty and balance with real damage (not god mode): aim for "a bit difficult but winnable" (user preference).
- Touch controls for phones (the template has a touch interface: `UI_TouchInterface_SideScrolling`).
- Auto-aim exists (`bAutoAim`, `bAutoFire`); expose it as a menu toggle later.
- Jetpack: short burst, upgradable duration (user request), later.
- Android packaging (NDK/JDK setup); iOS is parked.
- The GIF capture can't carry audio. For audio, record with UE's audio mixer or install ffmpeg (ask the user first).
