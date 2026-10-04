# Forge Tyrant: power, part destruction and counterplay

Design and implementation notes, 5 October 2026. These changes belong to the existing Iron Front browser prototype. No paid items or generated replacement art are involved.

## Reference evidence

- The official [Monster Hunter Now combat guide](https://scopelyexplore.helpshift.com/hc/en/15-monster-hunter-now/faq/2331-tips-slay-monster/) describes attack warnings, learning movement patterns, dodging, positioning and damaging body parts. It also distinguishes a weak point from a breakable part. The full help page was inspected; this is documentation evidence, not hands-on testing.
- The [GDC 2018 Boss Up session overview](https://www.gdcvault.com/play/1025398/Boss-Up-Boss-Battle-Design) frames a boss as a culmination that tests acquired skills, strength and understanding. Only the session description was inspected, not the full talk.
- Earlier Top Lords video observations remain in `reference-review-v5.md`. This iteration did not claim a new full viewing of those videos or copy their assets.

Our design hypothesis is that visible progress against a strong opponent is more satisfying when losing a part changes the opponent's capabilities. More hit points alone do not create that feedback. This hypothesis still needs first-time-player testing.

## Implemented encounter

The original glowing reactor is visible throughout. The added wheel and shutters were removed. A restrained brow, red eye slits and jaw detail sharpen the existing face without covering the original skull or crown.

The Tyrant starts with armored resistance, two hand cannons, two boosters, a missile attack, a sweeping barrage and a charged reactor laser. Damage absorption is bounded so a high-rank weapon cannot instantly erase all attack phases. A single top bar displays armor, then reactor health.

| Damage milestone | Visible result | Combat consequence |
| --- | --- | --- |
| Armor reaches 65% | Both cannons break off, tumble and smoke | Heavy cannon barrage is removed; sweep pressure decreases |
| Armor reaches 30% | Booster pods and added weapon wings detach | Guided rocket pattern stops; lateral movement slows |
| Armor reaches zero | Legs break away and the torso settles close to the deck | A narrower reactor target opens |
| Reactor reaches zero | Remaining torso/head disassemble in the final blast | Victory follows the destruction animation |

These are paired scripted part milestones in this POC, not independent limb hitboxes or manual target selection. Shots still need to intersect the boss, and the exposed reactor has its own narrower hit region. Broken parts remain absent if the reactor survives the first opening and rebuilds armor once. There is no infinite rebuild loop.

## Ways to beat the Tyrant

1. **Build firepower on the approach.** Shoot crates and useful gates; collect an arsenal pickup when its route is safe. Earned starter weapons now persist for the full run. A temporary pickup can replace the starter, then returns to it on expiry.
2. **Bait, then move.** The reactor charge announces its laser before firing along a committed line. Guided missiles track briefly, then commit, giving a lane change a purpose. The laser is an actual visible damaging volume, not a decorative warning line.
3. **Break its arsenal.** Sustained aimed fire progressively removes the cannon and booster attacks. A dangerous opening becomes more manageable as visible components fall away.
4. **Save a relic for a specific problem.** Shield protects against a dangerous volley. EMP damages nearby threats and buys breathing room. Overdrive is most useful when the exposed reactor can actually be hit.
5. **Trade legion strength for survival deliberately.** When injured by at least 10 HP, the commander may consume 20 troops for up to 25 HP, twice per run. The button displays the actual benefit. At zero HP, enough surviving troops enable one explicit 30-troop revival to 50 HP. The battle freezes while deciding; declining plays commander destruction. Consumed troops are permanently removed and send inward energy trails. No troops are spent automatically.

## Fairness and legibility

- Incoming patterns are spaced and signaled. Enemy rows, elites, gates and rollers no longer spawn in the former simultaneous stacks.
- Visual troop positions also drive body contact. Enemy widths/depths match their modeled silhouettes more closely, and swept tests catch movement through a formation between frames.
- An unshielded hit reduces army/HP and emits casualty feedback. A protected hit visibly says it was blocked. Recruiting troops does not silently heal the commander.
- The four-column formation is retained for dodge room. The portrait camera gives the commander the lowest position that still keeps the rear formation above the controls on the tested viewport.
- Free baseline equipment must be able to finish every prototype stage. Automated successful routes demonstrate feasibility, not that a first-time player will find the difficulty fair.

Next human checks: recognition of each attack, perceived time to dodge, understanding of part loss, whether transfer costs are clear, and whether failures feel recoverable. Store and payment design remain deferred.
