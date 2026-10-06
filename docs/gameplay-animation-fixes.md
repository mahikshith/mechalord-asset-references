# Actual gameplay integration corrections

7 October 2026 · `codex/iron-front-unbroken-campaign` · source checkpoint `89d971a`.

The complaint was valid. The previous completion report combined isolated presentation previews, automated control and source checks. That overstated what had been implemented and verified in the normal game. The accepted Iron Front art and playable branch are preserved.

## Concrete gaps repaired

| Gap in the ordinary game | Correction in the ordinary game |
|---|---|
| Allied troop models were rigid mesh instances with root bobbing. | `World.load()` now creates `AnimatedTroopCrowd`; `World.update()` supplies the actual live formation. The accepted troop surface uses transferred weights from its matching retained commander source and 84 baked Run/Idle/left/right skin poses. Legs and arms deform; deaths remove real instance slots. |
| Commander locomotion switched clips abruptly; sideways movement mainly tilted the whole model. | `CommanderLocomotion` blends the retained Run/Idle clips continuously and adds lateral leg placement and arm recoil in bone coordinates. Rest, retry and pause are handled separately. |
| The new plated shield was a visible wall while shots continued to a body behind it. | Production C++ now sweeps enemy rounds against nine measured panel footprints, including folded wings and deployed height. Shots stop once at the armor surface. Spatial impacts drive the same visible shield hit effect. |
| Boss beams still extended behind that shield. | The published laser endpoint stops at the armor contact. The original ray returns when cover moves or expires. Clash tests use the finite visible segment, so an invisible continuation cannot start a contest. |
| Engineer healing flashed only the source. | The ordinary world now renders repair pulses from the reported source to the actual reported recipient; no healing is inferred by the renderer. |
| Choosing a boss reward awarded stats immediately with no transfer scene. | A 1.2-second core transfer begins at the measured boss reactor and ends at the commander. The normal UI delays the authoritative reward and next act until this timer finishes. Pause, menu, retry and double-submit paths are handled. |
| Review controls knew laser timing that the ordinary UI did not explain. | Normal HUD now exposes line-up, wait and counter timing. Wrong gate and clash-win messages were also corrected. |
| Endurance extended the EMP meter while its stun remained two seconds. | Actual elite/boss stun now follows the extended relic duration. |

The target component has stronger cyan focus corners; other component corners are quieter. The confirmed struck component retains its actual white impact flash. Shield armor includes an upper protective tier that agrees with its measured collision height. Paused clash audio can restart and music respects the shared source limit.

These are implementation fixes. They do not establish final animation quality, enjoyable difficulty, sound quality or mobile readiness.

## Normal runtime observations

All captures in `delivery/gameplay-truth-proof` came from `playable/index.html` through normal buttons and battlefield input. They did not use the review page or state injection.

| Capture | Actual observation / limit |
|---|---|
| `normal-live-walking.gif`, `live-motion-00.jpg` through `live-motion-23.jpg` | 24 unmodified browser frames, 850 ms, from the final build. Actual articulated marching is rendered through the shipping GPU path. This is a short motion sample, not a frame-rate benchmark or a complete campaign. |
| `final-shield-live.jpg` | Final build, Reactor Siege, 34 troops: the real Shield button deployed the plated wall. Beam interception has focused production-code checks; this screenshot is not an observed beam-versus-wall collision. |
| `normal-emp.jpg` | Earlier follow-up build: normal EMP activation showed the electrical platform pulse. |
| `normal-revive-choice.jpg`, `normal-revival.jpg` | Earlier follow-up build: commander at zero HP with 54 troops, explicit revive button, then reboot with 42 troops. Commander damage and revival are not review-only paths. |
| `normal-act2-after-transfer.jpg`, `normal-act3-live.jpg` | Earlier follow-up build: normal gameplay reached later acts. These captures do not show the actual reward choice or its absorption; their originally misleading filenames were corrected. |

The earlier follow-up core was `25372dd2fce936a11272e2aacea1d88d1ce60510e2e2ecc755b559278f84b6da`. The final rebuild uses `3b16f22bf4dcfdabe9d9c9fed078ab4abc0632d891ec76ed933ec437c0d7eb0a`. The browser tab became unavailable during continued testing; a complete controlled normal campaign, reward transfer and normal-input clash victory were not recorded. These remain open, rather than being replaced with preview evidence.

## Verification and practical limits

- 71 production WASM combat checks pass after the shield/beam correction.
- 41 focused native shield, finite beam/clash and EMP checks pass; 48 existing transition fixtures also pass.
- 12 exact-GLB troop checks and 6 commander checks pass, including real vertex articulation, left/right differences, casualties, reset, pause and camera bounds.
- 16 relic-effect checks and 4 actual presentation-timeline checks pass.
- 16 UI/audio groups pass with explicit fake DOM, combat, world and audio boundaries. They are not an end-to-end browser or audible mix certificate.
- Public first-target routes complete all three acts at fresh and upgraded rank using production WASM. Those routes still automate steering and relic timing; they do not prove first-player fairness or urgency.

The crowd stays in one instanced draw, with at most 64 visual slots. Its two pose atlases use about 5.91 MiB. No physical Android test has measured that cost. A fresh automated route finishes with only one troop: revival availability and attrition remain balance concerns, not reasons to blindly increase boss HP.

The nineteen-request acceptance matrix is maintained in [gameplay-truth-audit.md](gameplay-truth-audit.md). Final visual acceptance, real audio listening, first-time-player testing and Nothing Phone (3) performance remain outstanding. No Android/iOS shipping readiness or commercial quality is claimed.
