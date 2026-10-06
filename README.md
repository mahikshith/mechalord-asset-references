# Mechalord

Original portrait 3D battle prototype. The current **Iron Front** playable build uses fixed-step C++ combat compiled to WebAssembly and Three.js rendering. Unreal sources/workshop are included; this is not yet a packaged Android or iOS game.

The current branch, `codex/iron-front-single-siege`, has one continuous Iron March: Skyforge viaduct, storm reactor trench, forge citadel, then one final Tyrant. Combat state carries across environments. Barrage replaces Overdrive with physical shoulder launchers and real rocket volleys.

Read [HANDOFF.md](HANDOFF.md) for build instructions, implementation and verification limits, and [MEMORY.md](MEMORY.md) for decisions and continuation rules. Historical reports describe their own checkpoints.

## Play

From the repository root:

```powershell
python -m http.server 8077 --bind 127.0.0.1 --directory delivery
```

Open `http://127.0.0.1:8077/playable/index.html`. Drag horizontally or use arrow keys; firing is automatic. Charge Shield, EMP and Barrage in combat, then tap their icons or use 1 / 2 / 3. The separate `playable/review.html` is an internal automated visual review tool.

## Project layout

- `art/concepts`: original image-generated pilot references; these are images, not 3D models.
- `art/prompts`: reproducible prompt records.
- `assets/originals`, `source`, `exports`, `previews`, `manifests`: asset production stages and provenance.
- `game/Mechalord`: Unreal C++ project.
- `docs`: research, design, monetization roadmap, production and verification records.
- `tools`: asset preparation, standalone core regression and development utilities; editor bootstrap and content hosting remain pending.
- `builds`: selected generated verification receipts; no verified Android package yet.
- `delivery`: verified handoff outputs.

Read [implementation status](docs/status.md) before treating anything as a packaged or tested Android build. Read [setup](docs/setup.md) for prerequisites and validation commands.

The first Android chapter remains free to retry, without advertisements or purchases. Gem revivals, hero unlocks and skins are future research milestones, not active payment features.

The original references are now hosted at [mechalord-asset-references](https://github.com/mahikshith/mechalord-asset-references). See [the required visual standard](docs/visual-standard.md). The simplified Blender blockouts were rejected and are excluded from production.
