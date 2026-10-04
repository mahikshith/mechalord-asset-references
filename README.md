# Mechalord

Original 3D medieval-mech battle game for Android, built around gate runs and troop-launcher sieges in Unreal Engine 5.8.

## Project layout

- `art/concepts`: original image-generated pilot references; these are images, not 3D models.
- `art/prompts`: reproducible prompt records.
- `assets/originals`, `source`, `exports`, `previews`, `manifests`: asset production stages and provenance.
- `game/Mechalord`: Unreal C++ project.
- `docs`: research, design, monetization roadmap, production and verification records.
- `tools`: asset preparation, standalone core regression and development utilities; editor bootstrap and content hosting remain pending.
- `builds`: generated Android packages and optional content chunks.
- `delivery`: verified handoff outputs.

Read [implementation status](docs/status.md) before treating anything as a packaged or tested Android build. Read [setup](docs/setup.md) for prerequisites and validation commands.

The first Android chapter remains free to retry, without advertisements or purchases. Gem revivals, hero unlocks and skins are future research milestones, not active payment features.

The original references are now hosted at [mechalord-asset-references](https://github.com/mahikshith/mechalord-asset-references). See [the required visual standard](docs/visual-standard.md). The simplified Blender blockouts were rejected and are excluded from production.
