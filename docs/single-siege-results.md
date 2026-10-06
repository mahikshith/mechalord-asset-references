# Single-siege delivery results

7 October 2026. Branch `codex/iron-front-single-siege`. This report supersedes the older three-boss interpretation. `HANDOFF.md` explains the full implementation and continuation steps; `MEMORY.md` records accepted decisions.

## Implemented

- One 51-event, 198-second approach, three spatially continuous environments and one final boss/reward. Two zone markers preserve live combat; global advance does not reset.
- Barrage shoulder launchers with real rocket budgets/sockets replace Overdrive circles and ordinary-bullet boosts.
- Faster grounded authoritative boss gait after boosters break; one remaining leg reduces mobility; committed attacks plant.
- Whole confirmed-hit part flashes, independent of quieter targeting guidance. Final texture-independent wash survives the dark painted emissive atlas without recompile-per-hit.
- Contrasting coherent plasma beams, separated electricity and a larger open clash annulus with shallow depth and thicker discharges. Real pressure moves contact/advection; particle counts remain bounded.
- Pausing retains the beam/contact/part-cue picture with frozen elapsed time. This was corrected after live review exposed disappearing effects.

## Automated evidence

| Scope | Result / receipt |
|---|---|
| Focused native single-siege mechanics | 130 assertions; `builds/single-siege-native.json` |
| Legacy shipping adapter | 71/71; `builds/rebuild-test-results.json` |
| Continuous shipping adapter | Four winning routes, two zone markers, one boss/reward; `builds/unbroken-campaign-audit.json` |
| First-HUD-target feasibility | Two winning routes with real clash; `builds/player-target-route-audit.json` |
| Beam/clash pressure geometry | 7/7 after final depth/width polish; `builds/laser-pressure-checks.json` |
| Effects / part adapter | 16 relic groups, 11 unbroken-render groups, 9 boss-adapter groups; corresponding receipts |
| UI/save/audio | 16 mocked groups; `builds/iron-march-ui-audit.json` |
| Native environment geometry | 14 GLBs, 6.1m transformed vertices, 3,000 bounded updates; `builds/continuous-environment-review.json` |

Core SHA-256: `281386d8b075f499a10aee8c3e3f2282c9e9fd39c024ed50126b5e3a330ccf46`. Final HTML/JS/actor/environment hashes are in `builds/playable-build-manifest.json`. UI and CPU tests are not GPU or human gameplay tests. Winning routes automate precise aiming/threat prediction and do not prove fairness or addictiveness.

Fresh automated campaign bosses lasted roughly 71–88 seconds under the recorded public-control routes. Upgraded routes shortened the boss to 29–35 seconds and could miss later attack patterns. Engineer repair was unobserved in those campaign routes. These are concrete balance/reachability limits to investigate with targeted human/role tests.

## Browser observation

Normal `index.html` was opened and played using ordinary controls, including one horizontal drag, the Barrage button and pause. The actual HUD reported Barrage active at 4.8 seconds. The observed run crossed the first zone at 31% global advance with existing commander health and weapon progression; it did not return to a menu or restart the run. Troop casualties and commander damage were visible. This was a partial run with an existing rank-4 save, not a fresh-player full-campaign pass. An earlier unattended attempt was defeated; it is not a difficulty measurement.

Internal `review.html` controls then inspected the same shipping core/shared renderer: deployed Barrage, trench at 66.9s, citadel at 136.9s, final-boss aimed hit at 199.7s, laser clash at 207.1s and pressure movement at 207.7s. Confirmed 14 damage reduced cannonL from 560 to546HP and visibly washed that whole cannon white. The clash contact front contained12 arcs/16 sparks and moved from z5.71 to7.27 as pressure advanced48% to68%. After the booster-loss landing settled at226.1s, the boss stood at0.02m with mask15 (both cannons and boosters broken), both legs still active, and a changed walking pose. No browser warning/error was reported during the final shader/stride capture.

Replay controls seek/automate encounters, so their images are visual evidence, not ordinary human-control completion. Environment and early normal captures precede the last part-flash/annulus polish; their environment/core sources are unchanged. Final hit/clash captures are refreshed from the final rendering changes. The proof folder captions state the scope.

## Still unverified

User acceptance of the new effects/gait/route; first-time-player understanding; audible music/SFX mix; full normal-input campaign victory; target-phone performance, memory, thermals and install size; commercial reconstruction-license clearance; native Unreal assault adapter; Android/iOS packaging. No payments/store or optional content download release is implemented here.
