# Mechalord approved visual standard

The three original concept images are the authoritative asset designs. On 2026-10-04 the user rejected the simplified Blender models because they lost the distinctive appearance of these images. Those models remain as experiments only and must not be imported or presented as approved production assets.

| Asset | Required reference | Features to preserve |
| --- | --- | --- |
| Relic Marshal | [Original commander](../art/concepts/relic-marshal-v1.png) | Broad layered shoulder plates; ivory armor with teal inlays and bronze borders; angular helmet and cyan slit eyes; circular chest relic; segmented hands; mounted crossbow; shaped thigh, shin and boot armor |
| Gearling Sentinel | [Original allied troop](../art/concepts/gearling-sentinel-v1.png) | Rounded armored body; recessed cyan eyes; shield-shaped chest plate; large teal and bronze wheels with visible hubs and rivets; articulated crossbow turret; ceramic and worn metal surface treatment |
| Rust Crawler | [Original enemy](../art/concepts/rust-crawler-v1.png) | Wide continuous tracks with individual tread plates; angular red and charcoal armor; bronze rims; recessed amber eyes; large hollow cannon muzzle; separate turret; chipped, painted metal treatment |

Convert these actual image files to 3D. Do not replace them with new character designs or primitive approximations. Keep the original images unchanged; their hashes are recorded in `assets/manifests/approved-references.json`.

Preserve a detailed source mesh and source textures first. Produce mobile exports from that source by retopology, texture baking and lower-detail versions. A triangle budget is an optimization target, not permission to remove the identifying shapes. Extra credit charges or reruns still require the spending approval specified in the project plan.

Compare the model against its original image with matching camera angle and lighting before accepting it. Review silhouette, body proportions, major armor boundaries, weapon shape, palette and painted surface detail. Inspect the back, underside and moving joints separately. A single image does not describe hidden surfaces; any inferred geometry must remain consistent with the visible design.

Only after the model passes that visual review should Blender cleanup and animation proceed: commander idle/run/fire/hit/deploy; sentinel turret aim, firing recoil and rotating wheels; crawler turret aim, recoil and tread movement. Verify separation at joints and animation deformation before engine import.

Meshy is discontinued at the user's instruction. A faithful textured commander supplied as a TRELLIS GLB is now available locally, with preserved original, editable Blender source, and measured mobile candidates. The local manually modeled v2 assets remain experiments; the supplied reconstruction is preferred for commander fidelity. Low-polygon candidates still require silhouette, joint and texture checks before acceptance.

The exact reference files are available publicly at [the reference repository](https://github.com/mahikshith/mechalord-asset-references). Use its raw PNG URLs for services that need an image URL. The hosted bytes were checked against the local originals; `assets/manifests/public-image-urls.json` records the results.
