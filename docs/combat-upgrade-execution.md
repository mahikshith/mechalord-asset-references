# Iron Front: combat upgrade execution

User authorization, 6 October 2026: continue autonomously, use parallel agents, improve the rejected effects, make enemies more capable, work through unfinished systems and verify the actual game. Preserve Iron Front and its earned progress. The prior build is committed at `4c87079`.

## Ordered delivery checklist

- [x] Electrical laser: visible branching arcs along its full length, a hot core, charge and contact effects; no phantom damage outside the real corridor.
- [x] Projectiles: readable missile body, short trail, muzzle flash and impacts; each source stays attached to its weapon.
- [x] Shield: three-dimensional formation barrier, visible absorbed impacts and clear expiry.
- [x] EMP: authoritative battlefield pulse, ordinary enemy destruction, bounded elite/boss damage and interruption, shot clearing and matching VFX.
- [x] Overdrive: distinct energized weapons/volleys, activation response and clear expiry.
- [x] Major rewards: brief whole-scene feedback, preserving input and visibility; reduced-motion support.
- [x] Stronger encounters: dangerous but committed attacks, explicit recovery, fresh and upgraded route checks.
- [x] Salvage carriers: visible armor vent cycles and actual vulnerability.
- [x] Second fixed reward choice: guided rockets or finite defensive escort.
- [x] Formation-safe scheduling: account for the whole army rather than a point-sized hero, within the documented modeled trajectories and horizon.
- [x] Boss part targeting: authoritative hit recipients, separately damaged weapons and animated measured volumes.
- [x] Regression harness: power semantics, collisions, gate conservation, pause, retry, saves and delayed controllers. Final rendered replay is recorded separately below.
- [ ] Portrait render review: laser, hostile fire, each relic, rewards, carrier, boss and victory/defeat.
- [ ] Record delivered build, evidence, unresolved limitations and next native milestone.

## Native and delivery boundaries

Installed Unreal is 5.8.3. The current accepted game runs the portable C++ combat through WASM with a Three.js view; the native GameMode still uses the earlier simulation. The Windows C++ compiler/SDK and Android prerequisites must be verified before native integration or packaging can be claimed. Existing Blender/Unreal asset tools cannot automatically turn the browser's effects into a native game.

The rejected Reforged character/world replacement is not revived. Monetization, stores and purchases were previously deferred and remain outside the immediate single-level polish. Physical phone testing and observation of first-time players require the corresponding hardware/people; record them honestly rather than marking them complete from automation.

## Research and implementation decisions

Epic's [Niagara beam tutorial](https://dev.epicgames.com/documentation/en-us/unreal-engine/how-to-create-a-beam-effect-in-niagara-for-unreal-engine) demonstrates jittered ribbon beams, explicit endpoints and short particle lifetimes for lightning. Our rendering adaptation uses bounded spatial arc segments and fixed damaging endpoints. This is a design adaptation, not a claim that Niagara runs in the browser.

[Kenney's Particle Pack](https://kenney.nl/assets/particle-pack) offers 80 512-pixel particle textures under CC0. It is an available source for texture-based effects, not evidence that the runtime behavior or effect itself is ready. The [itch.io free VFX catalog](https://itch.io/game-assets/free/tag-vfx) includes creator packs in different formats and licenses; each pack needs its own terms and visual fit checked before importing. No external pack is admitted solely because it appears in a free category.

For this pass the electrical paths, barrier and weapon geometry are generated locally so they can follow the exact live weapons and simulation events. Import a texture pack only if render review identifies a concrete benefit; changing models or collecting unused packs is not a substitute for fixing the active effects.

## Checkpoint 1 — electrical combat and functional relics

Delivered 6 October 2026 on the existing Iron Front branch. Portable simulation SHA-256: `3f6378def7a483a231ace762b07aae73dc6ba00f5cedb357edd5e10ec5439d55`.

The beam has two jagged electrical trunks, twelve forks and eight broken wrapping arcs. Missiles have solid jackets, shaped noses, bands and fins, hot exhaust and short smoke trails; enemy projectile capacity is reserved separately so friendly fire cannot hide hostile rounds. Explosions use turbulent soft fire and smoke over physical fragments. Shield has an upper-hemisphere barrier and impact ripples from actual absorption events. EMP clears ordinary visible machines and hostile shots, interrupts the active laser and stuns elites/boss for two seconds with bounded damage. It cannot refill itself from its own clear. Overdrive energizes upper-body equipment with rising streaks, embers and weapon collars. Major activation feedback is short and respects reduced motion.

Carriers expose their vents for 1.6 seconds in a 5.2-second cycle; closed/open damage multipliers are .6/2.1. The second fixed choice now offers guided rockets or a 12-second escort with 30 points of shared absorption. The HUD shows the real remaining budget. Upgraded guided rounds meet stronger braced batteries/gunners; boss timing now gives intact cannons a real attack opportunity, and destroyed emitters cancel their pending attack.

Verification on this binary: 67/67 simulation regression checks and 12/12 independent controller checks. Presentation checks: 61/61 combat regressions, 19/19 projectile checks, 14/14 relic checks, 9/9 weapon-socket checks and seven UI/save/audio groups. All twelve delayed fresh/rank-2 routes and six legacy-stage routes win; passive controls lose. Fresh delayed wins remain about 80–169 seconds, so this is automated feasibility, not completed pacing or first-time-player acceptance.

Actual portrait WebGL captures are stored in `delivery/electrical-combat-proof/`: laser, EMP, Shield impact and Overdrive. A shader compilation failure found during review was fixed and the fresh review tab has no warning/error logs. The preliminary 12-run rendered soak finished twelve wins with stable texture count but growing geometry registrations on early Shield runs. Source inspection found lazily uploaded, separately allocated ring geometries in a fixed pool; these now share one geometry. An instrumented post-fix soak is running. Do not interpret the preliminary desktop run as proof of mobile frame rate or a completed resource audit.

Next: integrate whole-formation attack admission, verify readable stronger encounters, then implement independently targeted boss systems with authoritative animated hit volumes. Screenshots and CPU checks alone do not establish that the game is addictive or worth paying for.

**Post-checkpoint render audit:** twelve complete real-WebGL runs on checkpoint `5609ac4` finished successfully with a requested 420 × 933 portrait override (the app reported a 359 × 798 CSS canvas). The 20,574 rendered frames took 351 seconds at 4× simulation speed. After all three relics warmed their pools, geometry count stayed at 161 for runs 3–12; textures stayed at 13 for every run. The only unparented geometry was Three.js's intentionally shared module-global Sprite geometry, with no increasing orphan count. No warning/error logs were captured. The full receipt is `builds/render-soak-stage1.json`. This closes the repeated-render resource check for checkpoint one, not physical-phone performance acceptance.

## Checkpoint 2 — formation-aware attacks

Portable simulation SHA-256: `0dc2c034b08289ec35b79183c166d3e541a52dab0bec934dda4d3c969babfabd`.

Linear volleys and locked beams are checked against a reachable path for the commander and full trailing formation before commitment. The fixed-work helper covers up to six seconds, existing shots, rollers and conservative body/recruitment envelopes. It uses a 250 ms reaction allowance and 5 m/s steering budget. Only new attacks are delayed; existing bullets are not moved or erased. Ranged machines plant during their locked burst. Boss attack speed is fixed at aim commitment, so a phase transition cannot accelerate already-promised shot timing. Destroying a sweep emitter cancels the pending sweep instead of silently firing it from another source.

Homing rockets remain exclusive authored attacks, explicitly outside the linear-path certificate. Unmodeled speed changes fail closed. A certificate proves an available path for the supplied envelopes, not that a person will find it; stronger saved equipment and future human testing still matter.

A first overly conservative candidate reduced enemy fire and was rejected. The accepted candidate restores 15–31 approach shots on delayed fresh routes and 4–8 on saved rank-2 routes. Passive fresh/rank-2 controls lose at approximately 33/71 seconds. All twelve delayed routes, three immediate fresh routes and six legacy routes win. Fresh delayed runs span about 84–159 seconds; rank-2 runs 84–96. The long fresh tail still needs human pacing feedback. There is no forced stop waiting for all enemies to die.

Verification: 69/69 actual-WASM regressions, 12/12 independent audit checks and 23/23 isolated admission checks. The measured fresh/rank-2 feasibility routes record 17/18 admitted volleys, 57/7 deferrals, and no workload-cap exhaustion. First dangerous volleys occur at 13.33 seconds. Gaps between ranged shots are not encounter-idle gaps: melee waves, gates, carriers and the roller remain in the approach. The review exposes admission counters for continued inspection. Spatial projectile rendering has an optional, tested authoritative-height path ready for checkpoint three; current shots still use the old contract until the actual 3D collision data is integrated.

## Checkpoint 3 — independently targeted boss systems

Portable simulation SHA-256: `73b4ca12e4df96223ce7af134adb8d52a5fa10a112aa4b911eda773da484c9f1`. Each browser bundle now loads its immutable matching WASM file and rejects an incompatible contract; `builds/playable-build-manifest.json` fingerprints the code and retained models.

Six separate weapon/limb health pools now use the measured, animated boss geometry. Horizontal steering selects a physically aligned part; standard shots do not receive hidden horizontal homing. Actual three-dimensional trajectories and contact positions drive the visible bullets and sparks. Nearest physical contact determines damage, closed/future parts deflect, and old shots cannot spill damage into a new phase. The simulation owns the root and joint pose consumed by the renderer. Breaks detach the actual posed meshes.

One cannon lost reduces its five-shot sweep to three; one booster lost reduces dash speed from 6 to 4 m/s and the later rocket fan from five to three. Destroyed emitters stay destroyed. Booster and final-leg losses ease through a half-second fall. Core wounds survive openings and the one permitted repair. That repair adds a 277.5-HP casing without restoring destroyed weapons; the original 1,850 part HP and 700 reactor HP remain. Timing traces showed the old 647.5-HP casing consumed 32–36 seconds of repeated fire; the reduction shortened two delayed fresh Shield runs from 198/170 to 169/152 seconds.

A real portrait capture exposed rear-troop clipping. The camera now makes a bounded lateral adjustment of at most .65 m only when the formation nears an edge. The close field of view and vertical framing remain. Tests project all 4,582 retained troop vertices across both sides of five viewport sizes, including steering, upgrade zoom and shake; minimum tested phone clearance exceeds seven pixels. Real weapon-tier upgrades also produce one brief scene response, with no flash on load, pause or retry.

Validation on the final binary: **71/71 simulation checks** and **14/14 independent checks** across 26 complete/control runs. All 24 active routes win, both passive routes lose, and every route records zero unresolved contacts. The independent audit checks 642,129 formation/body/roller samples. Fresh immediate wins span 109–117 seconds; delayed fresh wins 101–169; earned rank-2 wins 85–92; strongest rail loadouts 84–87 with real counterattacks. These are automated controller outcomes, not human retention or physical-device results. The longer fresh tail remains a human pacing follow-up.

The first candidate exposed grazing shots parked against armor. Exact captured contacts identified tolerance-boundary convergence; stepping toward the real surface and a bounded eight-interval fallback fixed them without widening geometry or awarding uncertain hits. Fourteen recorded cases pass an independent raw-model oracle, as do 388 poses / 4,268 transformed components. Extreme synthetic instantaneous motion still yields six conservative refusals; this is explicitly outside the tested normal trajectories. A refused shot never gains guessed damage and retains its six-second lifetime.

Presentation checks: 63 combat, 19 focused projectile/beam, 15 relic, nine weapon-socket, nine boss-adapter, three actual-model integration checks and eight UI/audio/save groups pass. Browser captures show physical targeting, a detached cannon, collapse and a wounded guarded core. This review also found the old final explosion was anchored below the floor after collapse; checkpoint four corrects that visual defect before the final repeat-render audit.

## Checkpoint 4 — reactor rupture and final delivery review

The final destruction burst now starts at the actual posed reactor center. The collapsed rig places that center around 1.725 m above the deck; the previous root-relative anchor was below the floor. A brief layered rupture uses the existing fire, smoke, spark and fragment pools, followed by the recognizable 2.5-second breakup and wreck. Paused effects now skip physics entirely, fixing a zero-time floor-clamp movement found by the new regression.

The focused presentation suite now passes **64/64** checks; actual retained-model integration passes **4/4**. No gameplay numbers or simulation binary changed from checkpoint three. Actual browser captures in `delivery/electrical-combat-proof/` show the above-floor burst and its later wreck, physical cannon targeting/breaks, carrier opening, Shield absorption, EMP clear, Overdrive and a real weapon upgrade. Browser warning/error output was empty during this inspection. The twelve-run final rendered audit is recorded separately when it finishes.

### Remaining acceptance outside this desktop prototype

- Test touch aiming, readability, sound and sustained performance on the Nothing Phone (3), including a 20-minute session. The desktop portrait canvas and automated controls do not establish these results.
- Observe first-time players and tune the fresh-player boss tail. Some delayed automated routes still take 169 seconds; no claim of a perfected short-run pace, retention, addiction or willingness to pay is made.
- Port the accepted combat and effects into the native Unreal project, verify the Windows/Android toolchain, package ARM64 and measure installed size. No native Android APK or iOS build was produced in these browser checkpoints. Downloadable chapters, store/gems and later platform work remain separate milestones.
