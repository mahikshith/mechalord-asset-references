# Detailed free asset candidates — 5 October 2026

This is a primary-source shortlist, not an asset admission or engine compatibility certificate. No external package was downloaded, executed, imported, or added to the game during this review. Free access, commercial use, and source redistribution are separate questions. Visual suitability below is our proposed art direction, pending inspection of the actual package.

## Robots and combat characters

| Candidate | Verified offering | Proposed use and limits |
|---|---|---|
| [Epic Paragon: Crunch](https://www.fab.com/listings/c23ee3a7-4a73-4a83-9061-30b682d269f8) | Official Epic listing currently free; character model, animations, skins, effects, Animation Blueprints; Unreal formats. | Strong detailed mechanical hero benchmark or temporary native prototype character. It is recognizable licensed artwork, so it does not establish Mechalord's original character identity. |
| [Epic Paragon: GRIM.exe](https://www.fab.com/listings/75578197-6f11-4839-8b9f-88009839e1eb) | Official free Epic character package with animations, skins, effects and Animation Blueprints. | Heavy ranged robot benchmark; useful for testing animation, weapons and material quality in Unreal. |
| [Epic Paragon: Minions](https://www.fab.com/listings/039ea035-9360-4e76-ad06-5d3a92da6f65?lang=en) | Official free pack includes character models, animations and effects. | Crowd quality/reference candidate. Measure actual LODs, materials, skeletons and memory before adopting. The listing does not establish our Android performance budget. |
| [Ramon Linares ATLAS/09 collection](https://github.com/RamonLinares/atlas-09) | Seven listed mecha designs with Blender/GLB sources, mechanical rigs and baked motions. | Most relevant independent robot candidate; evaluate ATLAS, AETHER and SERAPH as separate character roles. Imported animation provenance needs the additional check below. |

Paragon is **not CC0**. Official localized [Crunch](https://www.fab.com/listings/c23ee3a7-4a73-4a83-9061-30b682d269f8?lang=ja) and [GRIM.exe](https://www.fab.com/listings/75578197-6f11-4839-8b9f-88009839e1eb?lang=ko) listings describe Unreal-only use. Their descriptions restrict Paragon trademark use. Capture the exact licence selected when acquiring each package: the English listing's licence field was not sufficiently explicit to infer a different agreement. The [Epic Content License Agreement](https://www.unrealengine.com/eula/content) permits qualifying projects to include content as inseparable compiled content, restricts standalone source sharing, and defines UE-only content. Keep such packs out of a public raw-asset repository and the browser build. Do not use NoAI-designated assets as generative-model inputs.

### ATLAS/09 provenance and readiness

The owner [dedicates the seven named mecha assets to CC0](https://github.com/RamonLinares/atlas-09/blob/main/ASSET-LICENSE.md), including their meshes, textures, rigs and source projects; repository code has a separate MIT licence. Third-party components retain their own terms. The [provenance record](https://github.com/RamonLinares/atlas-09/blob/main/ASSET-PROVENANCE.md) describes generated original concepts, Tripo reconstruction and local Blender preparation. This is AI-assisted provenance, not a claim of wholly hand-sculpted production art.

The author's [ATLAS readiness assessment](https://github.com/RamonLinares/atlas-09/blob/main/PRODUCTION-READINESS.md) reports 26,519 triangles, four materials, an 18-bone rigid mechanical rig and an approximately 6.8 MB self-contained GLB. It also documents open joint boundaries, approximate pivots and missing shipping LOD/collision work. These are upstream measurements, not measurements of files admitted to Mechalord. Its reported desktop performance is not Android evidence. The public [inspection viewer](https://ramonlinares.github.io/atlas-09/) provides a useful preview before any import.

### Animation licence discrepancy — unresolved

The ATLAS repository retains [UAL1's CC0 text](https://raw.githubusercontent.com/RamonLinares/atlas-09/main/assets/animations/quaternius/UAL1-License.txt), [UAL2's CC0 text](https://raw.githubusercontent.com/RamonLinares/atlas-09/main/assets/animations/quaternius/UAL2-License.txt) and [hashes/download dates](https://raw.githubusercontent.com/RamonLinares/atlas-09/main/assets/animations/quaternius/provenance.json). Those dates are 6 September 2026. However, [Quaternius's current QAL](https://quaternius.com/license.html), dated 28 August 2026, allows commercial products but prohibits standalone asset redistribution. It preserves earlier licences for previously obtained assets. The [official UAL2 itch listing](https://quaternius.itch.io/universal-animation-library-2) still labels the pack CC0. These primary sources conflict; retained CC0 files alone do not resolve which version covered acquisition. Do not label the entire animated collection unconditionally cleared for public source redistribution. Verify the specific archive's terms, or obtain clarification; geometry with independently authored motion offers a separate route.

## Humanoid motion candidates

[Universal Animation Library 2](https://quaternius.itch.io/universal-animation-library-2) advertises retargetable humanoid motions and Unreal-compatible exports. Its free Standard archive is listed at 17 MB; the Blender Source archive is paid. Do not promise that the full advertised 130+ library is included free. It is a candidate for commander movement, attack and hit responses rather than replacing the hero mesh with a simple low-poly character. Apply the licence discrepancy above to procurement. Mechanical wheels, tracks, articulated cannons and nonhumanoid bosses still need appropriate local animation.

## Environment surfaces and lighting

The official free [Scifi Hallway sample](https://www.fab.com/listings/e3cadcef-7709-4e6d-9f56-d6fb2156cb67), published by Epic Games, is a concrete environment candidate with a complete textured Unreal scene. Its old UE4 origin means UE5.8 conversion, material cost and mobile suitability need local measurement. Reuse its engineering and surface treatment selectively; its enclosed corridor composition would obstruct our portrait battlefield if dropped in wholesale. Capture the acquisition licence before importing; the current listing exposes no clear licence text in its public field. We did not find and verify a free full-game template that matches our exact runner/siege design in this review.

| Candidate | Verified availability | Proposed use |
|---|---|---|
| [Poly Haven Metal Plate](https://polyhaven.com/a/metal_plate) | CC0, 1K–8K options, colour/normal/roughness/metal and other maps. | Occasional service platforms; its worn diamond tread should not cover the whole play lane. |
| [Poly Haven Hangar Concrete Floor](https://polyhaven.com/a/hangar_concrete_floor) | CC0, 1K–8K options and surface maps. | Restrained worn deck material; keep contrast low enough for troops and projectiles. |
| [ambientCG Metal 030](https://ambientcg.com/view?id=Metal030) | Smooth grey PBR metal; 1K JPG archive listed at 3 MB and 2K at 11 MB. | Machinery housings and pipe surfaces, tinted through an original material palette. |
| [Poly Haven HDRI catalogue](https://polyhaven.com/hdris) | Asset licence supports commercial use. | Choose a bright daylight environment after previewing exposure and directional-light agreement. No particular HDRI is selected here. |

[Poly Haven's licence](https://polyhaven.com/license) covers downloadable assets under CC0, not all website/promotional imagery. [ambientCG's licence](https://docs.ambientcg.com/license/) explicitly covers downloadable files and material previews under CC0. The new Poly Haven Metal Plate 03 was excluded: its page currently shows a Patreon-gated upcoming vault, despite its eventual CC0 licence.

Use modest material resolutions initially, correctly map Unreal's normal convention, and keep raw higher-resolution sources separately. Geometry, texture memory and draw calls require measurement after actual engine import.

## Recommended next review

Prepare one concrete preview batch: a detailed robot, one verified humanoid motion set, and two unobtrusive surface materials. Record archive version, source URL, licence snapshot, SHA256, file roster and validation receipt before package admission. No provider scripts are necessary. The vendoring workflow's confirmation applies when admitting a specific prepared package; this research does not authorize an unspecified bulk import.

The original native world detail pass is independent of these candidates. It adds service hatches, broken rail modules, hydraulic supports, conduits, bolts, vents and rounded machinery while preserving the current route, placements and cameras. Geometry validation measured 47,956 triangles across unique world masters and 84/73/85 part actors in the three authored scenes. Actual rebuilt render quality and engine draw calls remain to be reviewed.

For the parent's lighting pass: use a visible coloured daylight sky, a readable warm key and cooler ambient fill, restrained fog and stable exposure. Keep the slate lane darker than ivory/teal characters, rather than increasing floor albedo until it loses contrast. Brighter lighting should reveal bevels, pipes and rail shadows without flattening depth. These are art-direction recommendations, not changes made to engine lighting by this task.
