# Reference review and v5 direction — 4 October 2026

The supplied Shorts were viewed in the browser. These are visual observations from edited promotional/gameplay videos, not hands-on testing of the reference applications or proof of their economy and difficulty.

## Inspected evidence

- [Top Lords gameplay](https://www.youtube.com/shorts/Ae5l4XBF9nw): the player occupies roughly the lower quarter of the portrait frame, while approaching formations occupy the long space ahead. Ordinary fire reads as a straight stream. Large opponents have a prominent health readout above their bodies. A frame near 38.9 seconds shows the difference between a large elite and the small marching crowd, with a visible health value of 178. Capture: `builds/reference-review-v5/top-lords-approach.png`.
- [Top War advertising review](https://www.youtube.com/shorts/PrVaQhZvJbk): viewed raised bridge rails, deep side platforms, a large spiked roller, paired multiplication gates and a numbered shootable barrier. The page identifies this clip as Top War advertising; it must not be represented as verified Top Lords gameplay. Extreme multipliers such as ×999 are advertising imagery, not sensible prototype balance targets.
- Other previously supplied clips remain references in the earlier research: [TSW6ULkR-J0](https://www.youtube.com/shorts/TSW6ULkR-J0), [9tyfoGxjpx0](https://www.youtube.com/shorts/9tyfoGxjpx0).

## Changes grounded in the current feedback

1. Keep forward travel continuous during running encounters. A kill requires actual depleted health; enemies that survive contact or are bypassed must have an explicit pass/withdrawal lifecycle, without kill rewards.
2. Spawn waves beyond the upper edge and let them approach through the view. Keep the camera close and constant, with the commander around 75% down a tall portrait screen and a shallow formation behind.
3. Default shots travel straight. Guided missiles, spinning hand cannons and railburst are temporary earned powers, physically dropped by elites and shootable flying orbs.
4. Make elite health and hit feedback readable over their bodies. Use modeled moving parts, compact 3D ammunition, recognizable power icons and corresponding audio cues.
5. Give the main boss an arrival from the horizon, jet-assisted movement, multiple attack patterns, a second battleizer phase and a visible death sequence. Challenge should come from readable attacks and steering choices, not mandatory waiting.
6. Preserve a commander progression reward after victory. Earned rank carries into later/repeated stages through bounded starting benefits; baseline rank remains playable.

These choices are design hypotheses. Automated runs can prove outcomes and lifecycle rules; they cannot establish that play feels fair or compelling. Actual phone performance and first-time-player observation remain separate milestones. No new asset service, subscription, generation charge or local TRELLIS installation is part of this iteration.

## Follow-up contact review — 5 October 2026

Reopened three supplied Shorts in separate background tabs and explicitly verified muted playback. Saved additional frames in `builds/reference-review-v5/`.

- Ae5l4XBF9nw: a compact blue player formation occupies the left lane alongside a much larger red mass. This supports a footprint narrow enough to make lane choice meaningful. Saved `top-lords-side-lane-footprint.png`.
- TSW6ULkR-J0: at about 11.5 seconds, the launched blue crowd meets the spiked roller at a visible front boundary with impact particles. At the saved paused frame around 23 seconds, the surviving crowd remains visibly bounded by the obstacle, with reinforcements feeding it. Saved `roller-contact-reference.png`.
- PrVaQhZvJbk: the cannon launches a stream through paired gates onto a curved raised bridge. The stream joins a crowd meeting a roller near the bend. Saved `bridge-roller-contact.png`. The second and third clips identify themselves as Top War advertising reviews and depict launcher-style troop streams; they are not evidence that Mechalord should silently mix launcher and marching-army collision rules.

Concrete local defects found: projectiles checked only a narrow commander-centered area at z=0; side enemies could become pass-only before reaching the soldiers behind him; roller damage used only commander lateral distance. Separately, a troop model measured 1.637 m wide in source, then rendered at .83 scale into .70 m spacing, creating overlapping shoulders. The broad eight-column formation could not genuinely avoid a central roller. The correction is shared formation geometry and swept contacts, a narrower four-column formation, troop model normalization, and visible impact/death or deflection outcomes. Continuous forward travel remains a requirement; stopping for every survivor would reintroduce the previous pacing problem.
