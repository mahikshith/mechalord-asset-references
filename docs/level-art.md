# Mechalord modular level art

The first environment kit is authored locally in Blender from original geometry. It uses the game's ivory ceramic, teal machinery, bronze trim and cyan relic motifs. Enemy defenses use angular rust armor and amber cores. This environment work does not replace or revise the three approved character images.

## Delivered files

- `assets/environment/source/mechalord-environment-kit.blend`: editable kit library; each module is in its own named collection. Module geometry is hidden initially so the entire library does not overlap at the origin. Unhide the selected collection/object to edit.
- `assets/environment/source/relic-causeway-assembly.blend`: example causeway assembled from the same reusable modules, with sample recruitment, multiplication and energy values.
- `assets/environment/source/gatehouse-siege-assembly.blend`: example launcher platform, moving-gate positions, defensive towers and forge scenery.
- `assets/environment/exports`: individual GLB and FBX modules, with embedded palette texture.
- `assets/environment/textures/environment-palette.png`: shared 128-pixel palette, retained separately for engine import.
- `assets/environment/manifests/environment-kit.json`: measured source geometry, bounds, pivots, collision boxes and sockets.
- `assets/environment/layouts`: five stage assembly definitions aligned with the existing battle simulation encounters.
- `assets/environment/previews`: actual Blender renders of the two example assemblies.

These are prototype environment assets. Android rendering, engine imports and physical-device performance have not been verified. The Forge Colossus is still a separate character-production milestone; the forge-core plinth is scenery rather than a replacement boss.

The completed kit has 9,600 source triangles across 14 modules. All 28 GLB/FBX exports were re-imported into Blender 5.2.2 LTS and passed triangle-count, single-material, UV-layer, embedded-palette and world-bounds checks. The retained report is `assets/environment/manifests/export-validation.json`. Those checks establish interchange-file integrity and source alignment; Unreal import remains a separate validation step.

| Module | Triangles |
| --- | ---: |
| Straight track | 1,756 |
| Narrow track | 860 |
| Recruitment gate | 808 |
| Multiplier gate | 844 |
| Energy gate | 776 |
| Barricade | 272 |
| Energy pickup | 160 |
| Relic column | 260 |
| Pipe arch | 788 |
| Rail section | 232 |
| Rock foundation | 372 |
| Siege platform | 1,288 |
| Defense tower | 408 |
| Forge plinth | 776 |

## Dimensions and assembly

Authoring uses metres: X is horizontal steering, Y is forward travel and Z is up. The runtime uses the same directions in centimetres. Multiply local coordinates by 100 when converting explicit layout data. FBX imports may apply axis conversion; verify a single 8-metre segment and its ground anchor in the editor before assembling a course. Do not rotate the course to a different runtime-forward axis.

Track sections are 6 metres wide and 8 metres long. Their origin is at the near edge, centred horizontally, with the walking surface at Z=0. Therefore section N is positioned at Y=N*8. Character steering uses X=normalizedLane*2.6 metres. The example JSON converts event time to Y=atSeconds*1.5 metres, matching the current 150-centimetre-per-second run speed.

Gate origins sit at the crossing plane Y=0. Each aperture is approximately 1.664 metres wide, matching the current normalized gate half-width of 0.32 at the 2.6-metre lane scale. Labels are separate runtime UI objects; sample numbers occur only in the assembly preview scenes. Gate modules contain a small recruitment, multiplication or energy sigil. Runtime operation values must come from encounter data. Movement is applied to the complete gate actor; the module remains reusable.

The narrow bridge is delivered as an optional art module. Existing courses use the full-width track until runtime steering limits are synchronized to a narrow section, preventing decorative rails from implying an unimplemented collision rule.

Siege gate centre lines are Y=5.4 and Y=9 metres; the defensive objective is Y=14.4 metres. The platform's launcher socket is local (0,1.5,0.085), so placement at Y=-1.5 aligns the launcher to the runtime's Y=0 firing origin. The example presentation deliberately shows a wider assembly to inspect the kit; it is not a gameplay camera validation.

## Mobile integration

Each module contains one mesh and one material, using one shared 128-pixel palette texture. GLB/FBX preserve individual-module UVs and measured geometry. Palette sampling uses swatch centres, so distant low-detail rendering does not rely on small painted texture detail. Replace the source's lit material with a shared Unreal Unlit material that reads the same palette for the approved mobile LDR pipeline. The studio renders use lighting and shadows solely to make shape inspection clear.

Use instanced static meshes for repeated columns, rails, foundations and track tiles. Pool only the visible forward window rather than spawning the complete course JSON at once. The example level scenes duplicate mesh references in Blender; individual exports carry the reusable module once.

Collision metadata describes coarse runtime boxes. Gate frames and cosmetic background meshes have no gameplay collision, which preserves the simulation's explicit gate and obstacle rules. Use the supplied barricade footprint for hit feedback and the simulation's obstacle crossing condition for damage. Background towers are scenery unless attached to a separately configured enemy encounter. They must not silently add attacks.

## Authored-stage differences

| Stage | Shared-kit assembly | Encounter emphasis |
| --- | --- | --- |
| Relic Causeway | Ivory decks, rock foundations, relic columns and open sightlines | First single gate, then clearly separated paired choice |
| Foundry Approach | Same decks, overhead pipes, rust defenses outside the lane | Introduced barricades and energy replenishment |
| Gatehouse Siege | Causeway into a bronze-rimmed launcher bastion | Surviving army transfer, moving multiplier gates, enemy defenses |
| Storm Pass | Rock foundations and exposed relic columns | Moving gates and optional narrowing once steering bounds support it |
| Forge Core | Foundry pipes, rust defenses and forge dais | Combined gates and boss attack warning scenery |

Shared environment meshes remain in the base chunk. Optional stage definitions and separately authored boss assets belong to chunk 1001. The layout file's `chunkId` is planning metadata; actual Unreal cooking rules still require editor/build validation.
