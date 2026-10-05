# Mechalord detail and aiming pass — 5 October 2026

Work is on `feature/native-reforged-world`. The prior playable branch remains
`feature/iron-front-lanes-and-arsenal` at `a32ebee`; the first native art build is
recoverable at `9b1eaa2`. No generation service was used, no payment was made,
and local TRELLIS was not restored.

## Native art changes

The commander has fuller cast armor, layered shoulder plates, inset visor parts,
finger segments, joint collars, a back reactor and a rebuilt weapon. Gearling
wheel surfaces no longer coincide. The new Aegis Vanguard carries a tower shield
and a six-barrel rotating cannon. The Colossus has two independent six-cell
rocket pods, breast plates around a recessed arc lens, a more angular helmet,
arm pistons, vents, trim and bolted armor.

Lighting now includes an ambient/reflection cubemap, warm key and cool fill with
a brighter blue atmosphere. The original environment kit has service hatches,
handrails, hydraulic supports, equipment vents, conduits and a distant industrial
skyline. A rendered review caught floating background buildings; their merged
structural supports now extend below the scene.

| Master | Saved Unreal LOD0 triangles |
|---|---:|
| Relic Marshal | 61,232 |
| Gearling Sentinel | 17,720 |
| Aegis Vanguard | 47,560 |
| Rust Crawler | 13,376 |
| Arc Warden | 17,728 |
| Forge Colossus | 67,140 |
| Relic Launcher | 11,052 |

The namespace contains 23 assemblies / 89 independently pivoted mesh parts and
278,472 triangles across unique meshes, including world geometry. These are
authoring masters, not mobile shipping budgets. Counts are read back from saved
Unreal assets; all constituent surfaces pass closed-edge, outward-winding and
nondegenerate-triangle validation.

Marshal motion is staged as settle, aim/fire, recoil recovery, hit brace and
weapon lift. Vanguard braces its shield and spins the cannon. The boss tracks a
target, braces for alternating cannon bursts, lifts on jets with folded legs,
aims its rocket pods, fires a salvo and lands. In live Play-in-Editor, 54 parts
differed from their rest poses; 68 part transforms changed between world times
3.6667 and 42.6865 seconds. This verifies preview animation, not native combat.

## Browser combat correction

Friendly projectile presentation previously descended toward Y=1.25 regardless
of boss height, depth or jet hover. The target resolver now uses actual visible
body/core surfaces, including the boss's moving reactor. Friendly missiles,
bullets, rails, Overdrive trails and hit effects share that target geometry.
Authoritative X/Z movement and ordinary straight firing are preserved. A bounded
presentation cache handles target death and surviving rail rounds.

Weapon rigs now elevate toward the boss. Fresh commander volleys drive cannon
recoil; troop fire cannot trigger it. Common enemies, commander and boss react
to firing and damage. Reset clears presentation paths and transient rail flash.

Validation: 52/52 combat visual CPU checks passed, environment and UI/progression
checks passed, browser bundles rebuilt successfully, and the real WebGL review
showed a powered Overdrive volley striking the upper torso while armor decreased
from 1,013 to 947. There were no browser console errors during that review.
The proof is `delivery/native-reforged/overdrive-aiming-review.png`. Native art
has not been substituted into the browser game.

## Asset research and remaining quality work

See `free-asset-research-2026-10-05.md` for original source links, actual free
offerings and licence restrictions. The ATLAS viewer was inspected visually;
its detailed textured mecha are a useful candidate, but inherited animation
licence evidence conflicts. Epic's Crunch, GRIM.exe and Minions supply detailed
Unreal assets, while Scifi Hallway supplies an environment sample. Poly Haven
and ambientCG provide verified CC0 surface materials. None was imported.

The current native models are smoother and more detailed, but still stylized
geometric interpretations rather than exact reconstructions of the original
concept paintings. Their surface texturing and finish remain below the requested
production quality. A measured imported-asset trial is a reasonable next step;
do not assume any free pack is ready for Android without checking it.

The original native art gallery has been updated with actual 720×1280 level and
800×1000 character renders. Native combat, input, destruction, HUD, mobile LODs,
material consolidation and an Android package are still outstanding. Nothing
Phone (3) performance and installed size have not been measured by this pass.
