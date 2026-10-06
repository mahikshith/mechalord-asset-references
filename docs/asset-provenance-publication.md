# Asset provenance for publication

Reviewed 7 October 2026. This records the local evidence for the current Iron Front browser build and retained experiments. It is not a declaration that every asset is commercially cleared. The current build mapping is `tools/playable-preview/build.mjs`; exact delivered file hashes are in `builds/playable-build-manifest.json`. Earlier asset registers describe earlier experiments and are not a reliable list of today's shipped files.

## Current build

| Delivered asset / system | Recorded origin and source | Publication status |
|---|---|---|
| `commander.glb` | `assets/exports/relic-marshal-hf-rigged-source.glb`; local Blender cleanup, 14-bone rig and Idle/Run clips derived from `assets/originals/sample-huggingface.glb`. | **Upstream provenance unresolved.** User supplied the file as `sample.glb` and reported TRELLIS on Hugging Face. Exact Space, model/version and applicable output terms were not supplied. Local rigging does not resolve that gap. |
| `troop.glb` | `assets/exports/relic-marshal-hf-mobile.glb`, a reduced derivative of the same user-supplied reconstruction. Runtime now articulates the retained model separately. | **Same unresolved upstream provenance as commander.** It is not the locally authored Gearling experiment. |
| `cinder-reaver.glb`, `forge-tyrant.glb` | `assets/exports/cinder-reaver-v3.glb`, `forge-tyrant-v3.glb`; locally authored Blender geometry and atlases from `tools/build_enemy_assets_v3.py`. Editable sources and receipts are under `assets/source/villains-v3/` and `assets/manifests/villains-v3/`. | Local construction is documented. Concept images were generated with the built-in image tool; prompt records are in `art/concepts/villains-v3-prompts.md`. This establishes their recorded production route, not a blanket commercial-rights certificate. |
| Four additional enemy types | Bulwark, Volt Hound, Mortar Wasp and Arc Engineer are constructed by `tools/playable-preview/enemy-archetypes.ts`, including a locally generated surface texture. | No downloaded model or texture package is referenced by this implementation. Preserve the source and authorship record. |
| Fourteen route GLBs | `assets/exports/reforged/` → `delivery/playable/environment/`. Local surface specifications in `tools/reforged_world.py` and `tools/reforged_geometry.py`; export records in `assets/exports/reforged/manifest.json`, `source-specs.json` and `world-layouts.json`. | Recorded as locally constructed native environment geometry, with generated material/vertex modulation. The continuous route reuses these exact environment exports, not the parked Reforged characters. |
| Effects, weapons, UI and sound | Local procedural Three.js geometry/materials and inline SVGs; synthesized music/SFX in `audio.ts`. Optional speech uses the device's available local voice. | No external music recording or sound sample is imported by the inspected audio module. Device speech is not a bundled voice asset. |
| `crawler.glb` | `assets/exports/rust-crawler-source-v2.glb`; local Blender experiment documented in `assets/manifests/rust-crawler-v2.json`. | Copied by the current build script, but not loaded by the current `world.ts` character loader. Do not confuse packaged historical files with active characters. |

The fourteen environment names are: SuspendedIsland, SpineConnector, SunkenRoute, CitadelBowl, TaperedButtress, PressureVessel, CoolingStack, ArticulatedServiceArm, ReactorBank, CitadelSpire, CableDrum, DistantFoundryWorks, DistantTransferGallery and ReactorBulkhead. `builds/continuous-environment-review.json` records their individual hashes. All five copied character GLBs were compared with their source exports and matched byte-for-byte during this review.

The original supplied reconstruction hash is `e8e0761aacccc2559466b480773ac297c5b080cc8394f3f56cec3ddf478478a3`. Its inspection/preparation trail is `sample-inspection.json`, `relic-marshal-hf.json` and `relic-marshal-hf-rigged.json` under `assets/manifests/`. Those records explicitly leave production acceptance and Android validation false. Approval to use a design in this prototype is not evidence of an external provider's redistribution terms.

## Retained historical material

- **Original concept references:** three pilot PNGs under `art/concepts/` are recorded as built-in image generation in `art/prompts/pilot-prompts.json`; `approved-references.json` records the user-selected files and hashes. Keep their generation trail. A generated concept is a reference image, not a verified source for every later mesh.
- **User-shared Meshy “Aegis Vanguard”:** `conversion-trail.json` records a viewer inspection and a reported CC BY 4.0 label, but no local model download and no accepted agent submission. This is an inspection record, not a verified licence grant for an admitted binary. The similarly named local Reforged asset should not be mistaken for evidence that the Meshy model was downloaded.
- **to3D attempts:** recorded as failed HTTP 400 attempts, with no accepted task ID. No successful to3D model is identified in the current build.
- **Local Blender v1/v2 models, FBX clips and previews:** retained experiments have their own manifests and provisional acceptance status. Their presence does not mean the game uses them.
- **Parked Reforged characters, atelier and separate playable:** retained under their own source/export/delivery paths. The current route imports environment assets only. These historical outputs must not be described as the accepted current character set.
- **Aborted local TRELLIS installation/repair work:** cleanup history and deleted paths do not constitute a licence record. The surviving user-supplied Hugging Face GLB and its derivatives remain a separate provenance question.
- **External free-asset shortlist:** `docs/free-asset-research-2026-10-05.md` records candidates rather than admitted packages. It explicitly says none were imported during that research and records unresolved animation-licence discrepancies. Do not present those candidates as assets used by this build.

No Top Lords or Mob Control asset files appear in the checked runtime import/build mapping. Their links, screenshots and gameplay observations are research references, not an asset supply chain. This finding does not independently establish the origin of every byte in the user-supplied GLB. Reference-game promotional material should not be presented as Mechalord artwork.

## Publication boundaries

Resolve the supplied reconstruction's exact generation service/version, source-image record and applicable output/redistribution terms before describing that model or the full asset collection as cleared for public source redistribution or commercial release. Until resolved, separate those files from any proposed public raw-asset package. Preserve original sources and historical receipts; changing a filename or reducing polygons does not change provenance.

Project art records and dependency licences are separate. The browser source depends on Three.js and uses esbuild for bundling; their installed packages contain their own licence files. This audit did not find a project-level `LICENSE`, `LICENSE.md` or `THIRD_PARTY_NOTICES.md`. A future public package needs an explicit project licence choice and the applicable dependency notices. No licence was added or selected by this audit.

## Credential scan scope

Two read-only pattern passes examined 251 project text files across source, configuration, manifests, prompts and documentation. Checks covered common provider-token forms, private-key headers, quoted/unquoted secret assignments and credential-bearing URLs. No suspect filenames were found. Secret values were not printed or stored.

Excluded: `tools/vendor`, dependency directories, `.git`, build/delivery outputs, Unreal build/cache folders, virtual environments and binary assets. Files above 8 MB were excluded. This is a bounded working-tree scan, not a guarantee that Git history, excluded files or the entire machine are free of credentials. No files other than this report were changed for this audit.
