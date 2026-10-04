# Original articulated villains, version 3

Two original enemy models are delivered as editable Blender scenes and textured GLBs. They are local procedural/manual modelling interpretations of the newly generated Cinder Reaver and Forge Tyrant concept images. They are not TRELLIS reconstructions, and no hosted generation job or paid credits were used for these models.

The source images are `art/concepts/cinder-reaver-v3.png` and `art/concepts/forge-tyrant-v3.png`. These models preserve the art direction—oxblood cast armor, gunmetal joints, bronze rims, skull-shaped knight helmets, glowing furnace grilles and visible cannon bores—while simplifying the images' fine surface wear and mechanical complexity. They remain provisional game art awaiting the user's visual acceptance.

## Delivered and measured

| Asset | GLB triangles | Detailed source triangles | Meshes | Export materials | Height after GLB reimport | GLB bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Cinder Reaver | 7,788 | 12,348 | 14 | 1 | 2.00035 metres | 692,172 |
| Forge Tyrant | 17,492 | 20,072 | 14 | 1 | 4.50058 metres | 1,041,540 |

The GLBs contain a single shared material per model, with base color, packed metal/roughness and emission atlases at 768×512 pixels. Individual material regions retain red paint, charcoal steel, bronze, furnace light and helmet accents. The model therefore needs 14 mesh draw calls per instance before any shadows or extra rendering passes; spawning sixteen elites still requires browser/device performance measurement.

- Game exports: `assets/exports/cinder-reaver-v3.glb` and `assets/exports/forge-tyrant-v3.glb`.
- Editable scenes: `assets/source/villains-v3/cinder-reaver-v3.blend` and `assets/source/villains-v3/forge-tyrant-v3.blend`.
- Source paint and packed atlas images: `assets/source/villains-v3/`.
- Actual Blender previews: `assets/previews/villains-v3/cinder-reaver-v3.png` and `assets/previews/villains-v3/forge-tyrant-v3.png`.
- Geometry/pivot records and binary validation: `assets/manifests/villains-v3/`.

The Blender scenes contain the hidden detailed meshes plus the visible reduced export meshes, linked to the same articulated node hierarchy. Objects ending in `_DetailedSourceMesh` preserve the higher-detail geometry; `_MobileMesh` objects are the exported versions. Hide one set before unhiding the other to avoid overlapping copies. The scenes include a studio camera and lighting for inspecting shape and materials; those helpers are excluded from the GLBs.

## Articulation and orientation

Both GLBs have explicit rest translations, so articulation works before an animation mixer starts. Their hierarchy is:

```text
Root
├─ Torso
│  ├─ Head
│  ├─ Arm_L ─ Barrel_L
│  ├─ Arm_R ─ Barrel_R
│  ├─ Pod_L
│  └─ Pod_R
├─ Leg_L ─ Knee_L ─ Foot_L
└─ Leg_R ─ Knee_R ─ Foot_R
```

Blender uses Z up and forward +Y; the GLB uses Y up and forward -Z. Rotate the character root around Y by π in the browser renderer to face +Z. Local X is the arm/leg pitch axis. Cannon spin uses local **Z with a negative angle** in glTF, corresponding to +Y rotation in Blender. Barrel pivots are centred on the cannon axes.

**Cinder Reaver's `Barrel_L` contains its shield, so it must not receive continuous cannon spin.** Rotate only `Barrel_R` for this character. Forge Tyrant has cannons in both barrel groups and can spin both. `Pod_L/R` are rocket pods on the boss and rear exhaust components on the elite.

Idle and Attack clips are included. They use rigid component rotations rather than a deforming skeletal skin. The elite's Attack clip keeps the shield steady while spinning the right cannon; the boss spins both cannons and moves its rocket pods. The renderer can instead drive these named nodes directly. Avoid applying a full animation mixer and a second procedural rotation to the same joint without a defined blending rule.

## Verified evidence

Both binaries were parsed and re-imported into Blender 5.2.2 LTS. Checks passed for triangle counts, fourteen single-primitive meshes, one shared export material, Idle/Attack clip names, explicit animated-joint rest translations, near-zero ground anchors and height within one centimetre of the requested 2-metre and 4.5-metre sizes. Actual height errors are below one millimetre. The final recorded hashes are:

- Cinder Reaver: `f1034ad79d3d9ec13990963d3ecb496a616da1d7b10287eb8e4e183eddc4ee8d`.
- Forge Tyrant: `1d158ca4de14fbec5e2ba2eb53bdf3f8e787be30937fba90d7b70c03b0f7e73b`.

The first export exposed missing rest translations on animated nodes. Constant translation animation was removed, rest pivots were restored and the actual GLB fields were checked again. The initial pale material treatment was also revised to darker armor and a more restrained studio setup before handoff.

This establishes local source/export integrity and visible 3D previews. It does not establish Android frame rate, Unreal import/rigging compatibility, exact reproduction of the reference images, or final production acceptance.

To rebuild locally:

```text
blender --background --python-exit-code 1 --python tools/build_enemy_assets_v3.py
blender --background --python-exit-code 1 --python tools/build_enemy_assets_v3.py -- --validate-only
```

Use `-- --only reaver` or `-- --only tyrant` to regenerate one model. Preserve the concept images and detailed sources when iterating on the exported topology.
