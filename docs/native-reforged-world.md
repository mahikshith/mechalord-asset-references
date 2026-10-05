# Mechalord Reforged — native art and level branch

Created October 5, 2026 in Unreal 5.8.3 (`5.8.3-58210709+++UE5+Release-5.8`).

The active branch is `feature/native-reforged-world`. The previous playable
version remains on `feature/iron-front-lanes-and-arsenal` at `a32ebee`.
The browser game, native game source, and old ArtLab content are unchanged.
Earlier user-authorized TRELLIS cleanup deletions remain outside these commits.

## Delivered

The new namespace `/Game/MechalordReforged` contains 20 assemblies made from
68 original StaticMesh parts, 12 materials, four maps, and four animation
sequences. Geometry is authored from local surface specifications through
Unreal Geometry Script. No previous GLB, FBX, mesh, level, or material is used.
The earlier original concept images inform the medieval-mechanical direction;
this is manual geometric construction, not image-to-3D conversion.

The native maps are:

| Map | New layout | Camera rigs |
|---|---|---|
| `L_SkyforgeViaduct` | Suspended octagonal islands, narrow connections, offset machinery on support towers | Portrait approach and oblique inspection |
| `L_ReactorTrench` | Continuous sunken route, raised reactor banks and a sealed reactor bulkhead | Portrait approach and lower side survey |
| `L_CoreCitadel` | Narrow arrival into a broad polygonal boss arena, asymmetric towers and machinery | Portrait encounter and boss inspection |
| `L_ReforgedAtelier` | Isolated character and weapon inspection plinths | Roster view and six individual cameras |

The project opens on the new Skyforge map on this branch. The project file is
`game/MechalordArtLab/MechalordArtLab.uproject`; the old workshop remains in its
own content namespace. The two game branches remain independently recoverable.

## Original models

| Assembly | Measured triangles, LOD0 | Articulation |
|---|---:|---|
| Relic Marshal | 7,820 | 15 rigid parts: armor, head, limbs, hands, feet, weapon |
| Gearling Sentinel | 3,590 | Hull, two wheels, crossbow turret |
| Rust Crawler | 4,284 | Chassis, linked track assemblies, turret, cannon |
| Arc Warden | 5,444 | Armored elite, shield, weapon, head and limbs |
| Forge Colossus | 11,124 | 13 parts including independent cannons, boosters and legs |
| Relic Launcher | 3,156 | Chassis, turret, yoke and rotating barrel assembly |

The commander has ivory/teal armor with rear battery panels readable from the
chase camera. The boss has a compact recessed cyan reactor, three retaining tabs,
a broader steel helmet and separate multi-barrel cannons. The environment kit
includes suspended decks, connectors, foundations, retaining banks, pressure
vessels, service arms, cooling stacks, gates, spires, cable drums and a bulkhead.

The assembly-wide total is 42,962 triangles, counting each unique mesh once.
This is not a rendered-frame total or a mobile performance result. These LOD0
models exceed several of the original mobile triangle targets; lower-detail
versions, combined materials and crowd instancing remain necessary.

## Verification

- Native mesh counts were read back from saved Unreal assets and matched the
  construction data. Every constituent source surface passed closed-edge,
  nondegenerate-triangle and consistent-winding checks.
- The adapter explicitly converts right-handed source triangle winding to
  Unreal GeometryCore's left-handed convention. Six-direction UV projection
  avoids collapsed UVs on vertical faces; split normals preserve armor edges.
- Every saved part has assigned materials and simple collision. Asset dependency
  inspection found no references to the old `/Game/MechalordArtLab` content or
  other legacy game assets.
- Walk surfaces have one top cap, shortened islands leave connector gaps, and
  connectors sit 1 cm below the adjoining deck tops to avoid coplanar flicker.
  Enemies and rear bulkheads face the approaching commander.
- Actual Play-in-Editor snapshots in the atelier showed 41 part transforms away
  from rest. Between world times 3.6667 s and 34.3334 s, 26 transforms changed by
  more than 0.05 cm/degrees. These include wheels, turrets, weapon recoil, boss
  cannons, jet pods and the launcher. This proves preview motion, not combat AI.
- The saved preview sequences have 45, 52, 49 and 62 bound animated parts in
  the atelier, Skyforge, Trench and Citadel respectively. Machinery loops include
  service-arm joints and vessel fans.
- Native portrait screenshots were rendered at 720×1280. Individual asset
  captures are 800×1000. Rendering caught and corrected inward surfaces,
  overlapping floor caps, material assignment and enemy orientation issues.

The captures are available in `delivery/native-reforged/index.html`. They are
actual Unreal screenshots, not generated images or browser approximations.
The full measured asset report is `assets/manifests/reforged-native-v1.json`.

## Remaining integration

These are newly authored native assets and level art scenes, not a completed
native combat game. Existing browser combat, gate arithmetic, health, enemy AI,
power-ups, boss destruction, input, HUD, saves and progression are not connected
to these scenes yet. The saved sequences are eight-second mechanical preview
loops; their attacks do not apply damage. Separate limbs prepare the boss for
destruction but do not themselves implement the gameplay state machine.

Android packaging, Nothing Phone (3) testing, sustained frame-rate measurement,
mobile material baking/LOD work and first-time-player tests remain outstanding.
The new procedural materials are an art preview and need mobile profiling.
The visual review checks clear shapes, correct rendering and camera composition;
it does not claim final commercial art quality or user approval.

## Rebuilding and inspection

`tools/build_reforged_unreal.py` builds only the new namespace in the live
editor. It saves the current level first and regenerates actors carrying its
own `MechalordReforgedAuthored` tag, preserving untagged additions. Save or commit
intentional edits before regenerating: authored parts are replaced by the spec.

The geometric sources are `reforged_characters.py`, `reforged_enemies.py`,
`reforged_world.py`, and `reforged_geometry.py` in `tools`. Rigid animation curves
are in `reforged_motion.py`. `preview_reforged.py` selects a saved camera and
captures through Unreal; `validate_reforged_native.py` reads back the assets and
actual editor/PIE transforms. Capture automation requires a freshly discovered
Slate console reference and serializes screenshots through the live editor.
