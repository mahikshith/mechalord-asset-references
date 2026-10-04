# Combat rebuild study — 4 October 2026

## Evidence inspected

These notes come from watching browser video frames and reading the corresponding titles. They are not hands-on playtesting of the reference games. The videos are third-party uploads; ad-review labels and game names are retained instead of treating every clip as an authenticated Top Lords level. No reference assets were imported into Mechalord.

| Source | Observed evidence | Implication for our rebuild |
| --- | --- | --- |
| https://www.youtube.com/watch?v=bmcMlrlYkhw — Top Lords Gameplay, Toomeys Games | Straight portrait camera, compact blue army, continuous upward volleys, numbered weapon objects, red/blue gates, successive enemy formations, bright readable background | Stable forward view, visible bullets and target health, weapon progression, threats in the same view as choices |
| https://www.youtube.com/shorts/9tyfoGxjpx0 — title says Top War Part 118 | Repeated side-lane +3 then +10 gates, army visibly growing, dense red mass filling the next segment, numbered blocking objects | Rapid reward cadence and visible future pressure, rather than occasional isolated arithmetic gates |
| https://www.youtube.com/shorts/Ae5l4XBF9nw — title says Top Lords | Very large red crowd between columns, repeated +1 side gates, reward flashes and growth close to the player | Strong enemy/friendly separation and nearby feedback; crowd size should communicate the challenge ahead |
| https://www.youtube.com/shorts/PrVaQhZvJbk — title says Top War Ads Review New Level 601 | Spiral platforms packed with enemies, a rolling spiked obstacle, x5/x999 choice, a numbered barrier being shot down before a stronger option | Spatially different encounter ideas and gated rewards; not evidence that those exact counts are balanced or belong in the POC |
| https://www.youtube.com/shorts/TSW6ULkR-J0 — title says Top War Ads Review | Two-lane bridge, rolling spiked log, red negative gates changing under fire, blue recruitment gates and troop volleys | Shooting and steering must affect the same approaching decision; show a gate improving before crossing |

The publisher description corroborates swipe movement and army growth: https://play.google.com/store/apps/details?id=com.gamespark.topking.gp. Exact timings, balance, monetization and whether ad-review footage matches the shipping game are not established by these observations.

## Why the first preview failed

The dark corridor and large side rocks overwhelmed the small units. The oblique camera wasted screen width. Sparse encounters left long periods without a useful decision. Combat health changed with weak visible causality; the final defensive structure felt passive. Gate labels and distant geometry mattered more than opponents. Passing simulation tests did not establish enjoyable gameplay or acceptable art.

## Rebuilt direction

Iron Front uses a dedicated portrait viewport, a stable centered camera, larger readable units, lighter ground, and teal/orange faction separation. The original TRELLIS commander remains. Individual projectile collisions now damage enemies and crates; troop growth, weapon upgrades, and improving gates happen visibly. The route combines dense formations, alternative weapon/growth lanes, negative gates improved by shooting, rapid small recruitment gates and rolling hazards. The boss telegraphs a lane before striking it; the camera pulls back for that encounter.

This is an original adaptation of the observed interaction patterns. The enemy crawler, mechanical boss and terrain still need art production and user evaluation. The measured trial is one authored 55-second approach plus a boss fight, not a claim of dozens of finished levels. The existing five-stage Unreal content plan needs to be rebuilt around the proven encounter patterns after the interaction is evaluated.

## Acceptance to evaluate next

- Does firing visibly explain why a target breaks or a gate improves?
- Can a first-time player recognize supply, danger and recruitment while moving?
- Is there a meaningful choice every few seconds without unreadable clutter?
- Does a growing army feel stronger before the next escalation?
- Can the player see and dodge a boss strike?
- Does another attempt feel worth playing?

Binary regression tests establish the rules, not these experience judgments. See rebuild-validation.md for actual checks and remaining limits.
