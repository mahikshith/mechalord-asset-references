# Commander repair and color review

Review artifact, 4 October 2026. This is a repair of the local 12-step TRELLIS commander, with several manually rebuilt armor pieces. It has not been accepted as final character art or installed into the playable game.

## Delivered

- Editable Blender scene: `assets/source/relic-marshal-repaired-v4/relic-marshal-repaired-v4.blend`.
- Colored GLB: `assets/exports/relic-marshal-repaired-v4.glb`.
- Actual Blender renders: `assets/previews/relic-marshal-repaired-v4/front.png` and `back.png`.
- Geometry and export checks: `assets/manifests/relic-marshal-repaired-v4.json` and `relic-marshal-repaired-v4-export-check.json`.
- Portable review archive: `delivery/relic-marshal-repaired-v4.zip`.

The original concept and raw TRELLIS GLB remain unchanged. The companion game-dev CLI was unavailable; the authorized work ran directly in the installed Blender 5.2.2 LTS, with local Python/SciPy used to close fragmented geometry before Blender processing. No external generation or paid services were used.

## What changed

The raw model contained thin, overlapping and fragmented surfaces. Direct Blender remeshing and projection paint produced ragged results, so that first pass was rejected. A separate surface occupancy reconstruction closed small splits and filled enclosed volumes before Blender remeshing, smoothing and reduction. This is an actual change to the 3D surface, not a retouched render.

Smoothing softened hard armor details. The final review pass therefore rebuilt the helmet, inset visor, crest, ear fittings, breastplate, chest relic and shoulder medallions as separate editable geometry. The reconstructed body and weapon silhouette remain from TRELLIS. The final color treatment is authored ivory enamel, bronze, teal and dark gunmetal, matching the reference palette. It replaces the rejected, poorly aligned image projection. Rear-side colors are an interpretation; the reference does not show the back.

## Measured checks

| Check | Result |
| --- | --- |
| GLB size | 4,571,592 bytes |
| Triangles | 156,678 |
| Height after actual GLB reimport | 2.01597 m |
| Mesh objects / material definitions | 23 / 6 |
| Boundary / non-manifold edges in source objects | 0 / 0 |
| GLB header, finite coordinates and Blender reimport | Passed |
| Geometry changes required by reimport validation | None |
| Vertex-painted primitives / total primitives | 1 / 23 |
| Emissive materials | 1 |
| Rig / animation | None |

Zero boundary edges does not certify animation deformation, absence of overlap between armor pieces, or production topology. The detailed review mesh exceeds the 4,000-triangle commander target and would incur many draws before mesh consolidation. No Android performance claim is made.

## Visual assessment and remaining work

Front and back renders were inspected. The mesh is closed and the palette is coherent, but it is not an exact reproduction of the approved concept. The rebuilt helmet and breastplate are simplified; hands, weapon and lower-body forms remain soft, and some paint boundaries need refinement. This is useful as an editable repair study, not an accepted game asset. Further hard-surface modeling, mobile retopology, final texture work and rigging remain necessary. The existing in-game character is preserved.

## Reproduce locally

The raw GLB and verified local dependencies must already be present.

1. `python tools/solidify_marshal_surface.py`
2. `python tools/run_marshal_repair.py`
3. `python tools/run_marshal_repair.py --polish`
4. `python tools/run_marshal_repair.py --finish`
5. Run `tools/validate_marshal_repair.py` through Blender in background mode.

The guarded runner limits each stage to ten minutes, a 4 GiB working set and a 700 MiB minimum free-RAM threshold. Earlier repair versions and logs are retained separately as experiments. The final Blender scene packs the original reference image and retains separate armor pieces for further editing.
