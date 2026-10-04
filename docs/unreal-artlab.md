# Native Unreal asset workshop — 5 October 2026

Unreal **5.8.3**, changelist **58210709**, is installed at `C:\Program Files\Epic Games\UE_5.8`. A real local editor MCP connection was verified through discovery and read-only scene/PIE calls. It binds to `127.0.0.1:8000`; no public editor endpoint is configured.

Open `game/MechalordArtLab/MechalordArtLab.uproject`, or run `tools/launch_artlab.ps1`. This content-only project works without compiling the separate Mechalord C++ game. Its saved map is `/Game/MechalordArtLab/Maps/L_ForgeWorkshop`.

## Delivered native content

The builder successfully saved 92 Unreal assets and a map with 191 generated actors. These are native editable assets, not a browser render embedded inside Unreal. Additional animation and refinement assets are tracked separately below.

| Native kit mesh | Measured LOD0 triangles | Simple collision shapes |
| --- | ---: | ---: |
| Beveled 400 × 800 cm deck | 60 | 1 |
| Armor plate | 60 | 1 |
| Deck support | 72 | 1 |
| Six-barrel hand-cannon rotor | 192 | 1 |
| Hand-cannon housing | 124 | 1 |
| Joint pin | 64 | 1 |
| Machine arm | 124 | 1 |
| Rail beam | 60 | 1 |
| Rail post | 72 | 1 |
| Trace strip | 12 | 1 |
| Turbine housing | 192 | 1 |
| Turbine rotor | 544 | 1 |

GeometryScript created closed chamfered faces and simple collision. No fallback cube route was used in the successful build. Separate barrel, housing, rotor and arm meshes allow mechanical animation. Six movable armor pieces and a solid floor form a small physics inspection bay.

The preserved commander, allied troop, crawler, Cinder Reaver and Forge Tyrant GLBs were imported through Unreal Interchange. Original textures and skeletal/scene animation assets were preserved. These are existing provisional characters, not newly generated or accepted final character art. Crowd texture limits are 512; commander/boss limits are 1,024. Skeletal deformation and final game animation blending need separate review.

The scene includes a saved portrait camera, a continuous industrial deck, rails, supports, turbines, articulated machinery, and side demonstration bays. Axes are X horizontal, Y forward, Z up, in centimetres.

The reviewed portrait camera is at (0, −950, 2050), aimed at (0, 850, 50), with 33° horizontal FOV and 9:16 framing. A second saved camera provides a close-up of the weapon bay. Lighting was reduced after the first actual capture showed an overexposed deck. Geometry and rotations were repaired from actual engine measurements; all five imported characters have the requested geometry height and a 2 cm ground clearance.

## Animation and effects

`/Game/MechalordArtLab/Animation/LS_WorkshopSystems` is a saved eight-second looping native Level Sequence. It animates eight turbines, two arm pivots, a rotating cannon barrel assembly, and a charging mesh laser. Its LevelSequenceActor autoplays during Play/Simulate.

The laser uses an additive cyan cylinder shell, opaque ivory core and a muzzle charge sphere. It is a native 3D visual demonstration. It does not yet apply damage or target enemies in the native game. The existing browser v7 laser does apply simulation-owned damage; do not confuse these two implementations.

## Reproduction and evidence

The original builder and animation scripts have been executed in Unreal, and their saved assets loaded from disk. `builds/unreal-artlab.json` records native mesh measurements, asset paths, imports and map save. `builds/unreal-artlab-animation.json` records the sequence, bindings and recovery map.

Scripts are intended for sequential use with this project closed:

1. `tools/launch_artlab.ps1 -BuildAssets -Headless` authors the original workshop. It rebuilds only its tagged scene actors. Do not rerun over a subsequently animated/customized workshop without preserving that work.
2. `tools/launch_artlab.ps1 -AnimateAssets -Headless` adds the one-time animation pass. It preserves an existing sequence and refuses to overwrite it.
3. `tools/launch_artlab.ps1 -ReviewAssets` applies bounded orientation/effect refinements, pilots the camera and leaves the editor open. It registers a read-only observer for the next PIE test.

Recovery maps are preserved in the project, with additional local recovery copies in `builds`. Reports distinguish asset authoring, visual inspection and actual simulation. A saved physics flag alone does not establish working collision.

## Executed viewport and physics checks

- **Six of six rigid bodies passed:** each fell from its authored height, collided with the bay floor and settled. Final centre Z was approximately −3.60 cm, consistent with the floor at −10 cm and 6.4 cm half-thickness. All retained active physics and stayed above the floor.
- **Thirteen motion checks passed:** one cannon rotor, eight turbines, two arm pivots, a laser pulse pivot and the muzzle charge changed as authored during an uninterrupted 16.3-second PIE test. The inner beam shares the outer beam's pulse curve.
- The first shorter run left four pieces unsettled. Continuous collision detection, bounded physics substeps and stronger debris damping were enabled; the subsequent longer run passed. No device-performance claim follows from this desktop test.
- The viewport caught a separate laser-axis error which a motion-only test could not detect. Named rotation arguments now align the cylinder with the cannon's Y axis; a live axis assertion and the firing-frame viewport confirm the correction.
- Real captures: `builds/unreal-artlab-portrait.png`, `builds/unreal-artlab-cannon.png`, and `builds/unreal-artlab-cannon-firing.png`. The firing capture is the actual saved Level Sequence inspected at frame 54, not native combat footage. No image generation was used for these captures.

Evidence: `builds/unreal-artlab-live-validation.json` (passing PIE measurements), `unreal-artlab-live-validation-first-pass.json` (retained failed first pass), `unreal-artlab-placement.json`, and `unreal-artlab-fx-refinement.json`. `tools/present_unreal_artlab.py` saves the supported weapon bay, corrected beam axes and second camera. Use **Start simulation** in Unreal to view machinery motion and falling debris; stop simulation before editing assets.

## Native game boundary

This is an art, motion and physics workshop. It is not the native port of the current playable combat. The C++ project build was attempted and stopped because its required Windows SDK/toolchain was missing; Unreal reported SDK `10.0.19041.0` unavailable and the standard Visual Studio installation was not found. See `setup.md` and `native-gap-v7.md`.

After the compiler/toolchain is present, port the current `AssaultSimulation` into the native runtime, attach these assets to real gameplay outcomes, then build Android and validate on Nothing Phone (3). No APK, mobile frame rate, package size, final character-art approval, or production-ready physics claim is made by this workshop.

The installed engine's actual Turnkey check also reports Android prerequisites invalid: Android Studio is not configured correctly and no current NDK is detected. Its allowed AutoSDK is r27c. Let this engine's Turnkey workflow establish the matching Android toolchain rather than guessing versions.
