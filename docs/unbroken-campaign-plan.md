# Iron Front — Unbroken campaign

Requested 6 October 2026. Preserve the accepted `85c107e` build on `codex/iron-front-reactor-siege`; implement on `codex/iron-front-unbroken-campaign`. No paid generation, TRELLIS, or replacement with Reforged characters.

## Ownership and sequence

1. **Combat rules agent:** authoritative continuous three-act campaign, independent relics, collision-driven laser clash, shields, four enemy behaviors, health drops, location-based damage, protected revival and chosen boss rewards. Own C++ simulation, bridge, typed contract and simulation checks.
2. **Presentation agent:** plated legion shield, shaped metal projectiles with hot exhaust and smoke, broader electrical beams/clash, EMP and chain-lightning effects, resource and pause checks. Own effect and arsenal modules.
3. **Interface/audio agent:** compact circular ability controls, clash input, boss/reward guidance, save compatibility, music and sound design. Own DOM UI and audio modules.
4. **Lead agent:** four original articulated enemy models, environment/colour integration, boss damage-region highlighting, commander/troop strafe and revival camera, integration, browser review and commits.

Shared simulation fields are agreed before dependent integration. Presentation cannot invent damage or choose targets independently. Each completed subsystem is checked before the next integrated checkpoint; final outputs and commits are produced by the lead to avoid build races.

## Requested changes and acceptance

Status below distinguishes technical implementation from acceptance. This plan previously marked every item checked; that overstated completion. See `gameplay-truth-audit.md` for the normal-player versus review-harness distinction and `unbroken-campaign-results.md` for preserved historical evidence.

| Requests | Technical status | Remaining acceptance / integration |
|---|---|---|
| 1–2 | Plated shield and boss target mapping implemented. | Plate appearance and first-time target comprehension unverified; shield remains a timed legion-wide effect. |
| 3–4, 8 | Revised energy rounds, shaped missiles, flame and smoke implemented. | Requested visual finish and readability in dense normal play unverified. |
| 5 | Wider beam and authoritative clash implemented. Normal counter guidance and stricter 3D intersection receive follow-up fixes. | Final normal-player clash entry and full audio/visual interaction need rechecking. |
| 6 | Continuous three-act campaign, three campaign relics, compatible practice and saves implemented. | Complete normal-player run through every modal and save transition remains unrecorded. |
| 7, 10 | EMP and branching power effects implemented. | Effect range is the combat area; requested final visual quality is not yet accepted. |
| 9, 11 | Three-hit guards and actual healing drops implemented. | Inspect retained shield visuals after breakage and health-drop clarity in normal play. |
| 12 | Moving threats, tells, recovery windows and escalation authored. | Felt urgency, fair challenge and replay motivation unverified with humans. |
| 13 | Four enemy archetypes with different behavior and procedural articulated models implemented. | Art/motion acceptance and phone cost unverified; these are enemy types, not selectable heroes. |
| 14 | Selected brighter colors and industrial exterior dressing integrated. | Partial environment transfer; existing route geometry remains reused. |
| 15 | Original synthesized music and combat cues implemented. Pause-clash resume and source-budget corner corrected in follow-up. | Listen to actual normal-game mix; review replay runs do not load audio. |
| 16 | Partial: commander Run/Idle plus root lean; allied crowd at checkpoint only bob/yaw/roll. | Articulated locomotion is follow-up work. Do not check complete based on static camera containment tests. |
| 17–18 | Physical damage recipient and protected revival state implemented. Controlled revival replay recorded. | Complete normal UI → real core → render revival observation remains open. |
| 19 | Reward choice, carried stats and one replaceable legacy imprint implemented. | Actual absorption animation missing at checkpoint; follow-up normal UI now holds award until world animation finishes. Final real-browser check remains open. |


## Review gates

Exercise collision and shield ordering, ability energy, clash win/loss and input cap, health truth, reward double-submit prevention, act transitions, pause/restart, legacy save migration and bounded rendering/audio. Review actual portrait screenshots and full playable routes. Record failures and limitations; desktop automation does not establish phone performance or human enjoyment.
