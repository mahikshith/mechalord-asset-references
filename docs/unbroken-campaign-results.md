# Iron Front: Unbroken campaign results

Implementation branch: `codex/iron-front-unbroken-campaign`. The accepted Iron Front build remains preserved on `codex/iron-front-reactor-siege`. This work extends the current browser game; it does not replace it with the Reforged character set.

**Review status: implementation, final WASM checks and three full rendered campaign repeats are complete.** Source checkpoint `524e97a` records the feature implementation; subsequent delivery commits preserve final checks and camera corrections. The core is `assault.80b87ff77cc580cd.wasm`, SHA-256 `80b87ff77cc580cd0ee2b483179bd504b30a944530885e9b1c055df70a492209`. The build manifest identifies the packaged files. These results establish the tested prototype behavior; visual acceptance and physical-phone performance remain separate milestones.

## What changed

| Request | Implemented behavior |
|---|---|
| 1. Plated shield | Timed Shield deploys a segmented metal barricade in front of the legion. Hits recoil a plate and leave a bounded impact tint. The curved dome is retired. |
| 2. Boss targets | The HUD names the screen-side vulnerable component. The recommended component is highlighted; an actual damaging hit flashes the whole struck component. Blocked hits do not pretend to cause damage. |
| 3. Orb ammunition | Enemy orb projectiles use a mechanical energy-round presentation instead of plain orange dots. Damage and source ownership remain in the simulation. |
| 4. Enemy missiles | Shaped missile bodies, fins and launch sources match the enemy weapon. Rear exhaust and soft smoke trail the projectile. |
| 5. Beam clash | The boss beam is 0.80 m wide. An overlapping player lightning cannon can initiate a three-second clash. Taps move the real contact toward the boss; victory damages armor, defeat deals a fixed 18 commander damage before applicable protection. Other combat holds during the clash. |
| 6. Continuous campaign | Iron March connects Reactor Siege, Storm Pass and Forge Core into one run. Troops, commander health, earned weapons and chosen bonuses carry between acts. All three relics have independent charge and duration. Five earlier fronts remain available as single-relic practice runs. |
| 7. EMP | A substantial jagged electrical ring and upright ion forks sweep through the combat area. Ordinary nearby enemies are cleared; surviving elites are damaged and stunned. Incoming fire is cleared by the core, not merely hidden. |
| 8. Player ammunition | Player missiles and heavy rounds share the revised bodies, hot exhaust and bounded trails. Friendly and hostile fire retain separate colors. |
| 9. Enemy guards | Shield-bearing units register three blocked attacks before the plate breaks and ordinary hits reach health. A brief block interval keeps one simultaneous volley from silently consuming every block. EMP can break the guard. |
| 10. Power effects | Arc Storm has substantial branching trunks, contact blooms and actual recipient endpoints. Tempest, Salvo and relic effects have distinct geometry, colors and cues. Presentation never invents additional damage targets. |
| 11. Health drops | Authored repair cartridges and conditional elite/boss-part drops restore up to 28 HP, capped at maximum health. Positive healing raises a green plus and the actual restored amount for roughly one second. |
| 12. Urgency | Authored advancing formations, lateral rushes, locked artillery, moving rollers, boss attack tells and recoveries create alternating pressure and breathing room. Forward travel does not require killing every enemy. Enjoyment and difficulty still require human playtesting. |
| 13. Four enemies | Bulwark carries a three-hit plate; Volt Hound telegraphs a lateral rush; Mortar Wasp launches aerial rockets; Arc Engineer repairs wounded nearby allies. Each has a separate articulated silhouette, metal finish and actual emitter attachment. |
| 14. Environment | Teal, copper and brighter industrial accents carry selected Reforged color ideas into Iron Front. Foundry structures and animated dressing remain outside the playable lanes. The accepted commander and boss are retained. |
| 15. Music and sound | Original locally synthesized industrial music uses three synchronized layers, with intensity changing for acts, boss combat and low health. Lasers, clash, plate impacts, repair and revival have distinct cues. Sound starts after a user gesture and stops correctly for mute, pause and reset. |
| 16. Sideways motion | Commander lean, facing and troop motion respond to actual horizontal movement rather than sliding with an unchanged pose. |
| 17. Who takes damage | The earliest physical commander or troop contact receives incoming projectile and beam damage. Troops are no longer a hidden global buffer for direct commander hits. |
| 18. Revival | A one-use revival spends 12 surviving troops, restores 50 HP and enters a 1.5-second protected reboot scene. Threats and travel hold, followed by another 1.5 seconds of protection. Healing remains a separate optional troop transfer. |
| 19. Absorption | After each boss, choose +25% lightning-cannon/clash damage, +20 maximum HP with up to 35 HP restored, or +15% relic/special-power duration. Intermediate choices affect the remaining run. The final choice saves one replaceable imprint for the next campaign, rather than stacking unlimited permanent bonuses. |

The new enemies use original local geometry and one shared surface texture. Measured triangles per design are Bulwark 12,076; Volt Hound 9,940; Mortar Wasp 6,412; Arc Engineer 12,132. These are asset measurements, not a claim of phone performance or final art acceptance.

## Controls and progression

- Drag horizontally, or use the arrow keys / A and D, to steer. Firing is automatic.
- Tap the shield, lightning-ring or chevrons icon to use Shield, EMP or Overdrive. Keyboard shortcuts are **1**, **2** and **3**. Space activates the most recently selected relic outside a clash.
- When a laser charge is available, tap **LASER** or press **L**. Crossing the boss beam starts a clash. Tap the battlefield or pulse control, press Space repeatedly, or hold the pulse control. Holding contributes three pulses per second; the core caps accepted input at five per second.
- Tap the optional legion-transfer control, or press **H**, to exchange the displayed troop cost for the displayed healing. Revival is an explicit choice after a qualifying commander defeat, not an automatic charge.
- Use **Pause / Escape** before leaving the game. **R** restarts outside the reward and revival decisions.
- Open **Practice a single front** to select an earlier front and its equipped relic. The other relic icons are visibly unavailable in that practice run.

Save schema 4 retains earlier clear flags, scores, gate guidance and commander XP, appends the campaign entry and stores a validated optional legacy imprint. No real player storage is edited by the automated UI tests. An imprint applies once at campaign start and does not alter practice runs.

## Evidence and remaining review

| Evidence | What it establishes | Status |
|---|---|---|
| `builds/iron-march-ui-audit.json` | Actual UI/audio modules: save migration, practice selection, independent relic controls, clash tap/hold/keyboard and pause, reward double submission, revival display, final imprint persistence, finite sound buffers and a shared 24-source ceiling. Combat, DOM and audio-device boundaries are simulated. | 15 groups passed; source hashes recorded. |
| `builds/unbroken-presentation-checks.json` | Actual Three.js geometry/materials: plated shield, EMP, authoritative clash endpoints, chain lightning, healing, smoke, freeze and resource disposal. | 12 passed; browser appearance remains a separate check. |
| `builds/unbroken-models-review.json` | Four model bounds and emitters, matching physical projectile origins while moving, joints, shield visibility, whole-component hit flashes, revival timing and bounded allocations. | 10 passed. |
| `builds/boss-rig-adapter-checks.json` | Authoritative pose and component mapping, including whole-core hit highlighting. | 9 passed. |
| `builds/unbroken-native-review.json` | Production-method fixtures for independent relics, blocking, healing, physical damage, revival, reward carry, clash outcomes, legacy imprints and edge cases; source and header hashes recorded. | 48/48 new fixtures and 6/6 evasion ordering fixtures passed. |
| `builds/rebuild-test-results.json` | Existing gameplay regression suite against the final WASM hash. | 71/71 passed. |
| `builds/unbroken-campaign-audit.json` | Public production adapter and deterministic full campaign routes; actual core hash accompanies outcomes. | 4/4 campaign routes won on the final core; zero unresolved contacts. |
| `delivery/unbroken-proof/` portrait captures | Actual assembled browser game: three relic icons, pause, deployed plates, EMP shockwave, beam clash, positive healing and explicit revival. The browser reported 425 × 798 for the final review captures; requested viewport and app panel sizing can differ. | Inspected by lead. |
| `builds/unbroken-browser-review.json` | Three complete live WebGL campaign repeats at accelerated simulation speed, final core hash, resource inventory and captured console. | 3/3 won; no browser warnings or errors. |
| `builds/portrait-framing-checks.json` | Actual retained troop and animated commander vertices at both edges, new strafe poses, upgrade/revival zoom, shake, fast steering and immediate replay reset. | 12/12 size-and-side cases passed; minimum measured margins 15.2 px for troops and 29.9 px for commander. |

The public-adapter campaign runs use steering and ordinary actions, with clash input limited to three taps per second. No damage or resource values are injected.

| Commander | Recovery strategy | Result | Simulation time | Won clashes |
|---|---|---|---:|---:|
| Fresh | Vitality and pickups | Won | 532.2 s | 3 |
| Fresh | Endurance and late transfer | Won | 574.4 s | 3 |
| Rank 4 | Vitality and pickups | Won | 438.9 s | 2 |
| Rank 4 | Endurance and late transfer | Won | 462.5 s | 2 |

All four new archetypes appeared, and actual Arc Engineer repairs occurred in every measured public-adapter route. These are deterministic feasibility results, not a human win-rate or recommended session-length claim. The three real-render repeats won in 398.6, 366.1 and 366.3 simulation seconds, with no unresolved contacts. Their more aggressive aiming policy differs from the public-adapter routes above.

The render check recorded a peak of 217 draw calls and 279,531 triangles. Textures returned to 14 after each run. The only detached geometry was the same shared Sprite quad throughout, confirmed as a module-level singleton in the bundled Three.js source; no additional orphan geometry accumulated. End-of-run wreck geometry varied with damage history. This is bounded evidence from three repeats, not a mobile frame-rate or indefinite-memory-stability claim.

After those repeats, targeted presentation checks extended camera containment to the commander's actual animated bounds and wider strafe poses, and removed stale damage labels during revival. The final bundle was rebuilt and the two edge replays, revival and laser clash were inspected again without console errors. The combat binary did not change. The browser receipt records the repeated-run bundle identity separately from the final build manifest.

Portrait captures saved under `delivery/unbroken-proof/`: player HUD, plated shield, EMP, laser clash, health pickup, revival, Bulwark, Volt Hound, Mortar Wasp and Arc Engineer. Review screenshots include candidate and final-build observations; build identity and final repeat results are recorded separately in the manifest and browser receipt.

In the actual portrait browser, the lead observed commander HP reaching zero with army count 56, followed by an explicit revival reducing the count to 44 and restoring 50 HP during the 1.5-second protected sequence. A collected repair pickup produced a positive green healing marker. These observations supplement, rather than replace, the deterministic fixtures.

Independent review identified a rushing enemy moving during Freeze/EMP, hazard processing continuing after the commander entered the revival decision, and extended special-power timers without extra attack pulses. The combat owner added fixes and regression fixtures. UI review also corrected single-relic practice selection, per-act progress and stale accessible act announcements after returning to the menu, and stopped ordinary gunfire/roller sounds while their simulation is held during a clash or revival.

This remains a desktop-served browser prototype. No Android or iOS package, sustained phone frame rate, 20-minute device session, older-device support, retention result or monetization readiness is claimed. Physical testing on Nothing Phone (3), first-time-player observations, touch comfort and final balance/art acceptance remain open. No paid generation, external music, advertisements, purchases or revived TRELLIS installation were introduced.
