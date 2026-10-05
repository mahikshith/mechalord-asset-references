# Iron Front: combat upgrade execution

User authorization, 6 October 2026: continue autonomously, use parallel agents, improve the rejected effects, make enemies more capable, work through unfinished systems and verify the actual game. Preserve Iron Front and its earned progress. The prior build is committed at `4c87079`.

## Ordered delivery checklist

- [x] Electrical laser: visible branching arcs along its full length, a hot core, charge and contact effects; no phantom damage outside the real corridor.
- [x] Projectiles: readable missile body, short trail, muzzle flash and impacts; each source stays attached to its weapon.
- [x] Shield: three-dimensional formation barrier, visible absorbed impacts and clear expiry.
- [x] EMP: authoritative battlefield pulse, ordinary enemy destruction, bounded elite/boss damage and interruption, shot clearing and matching VFX.
- [x] Overdrive: distinct energized weapons/volleys, activation response and clear expiry.
- [x] Major rewards: brief whole-scene feedback, preserving input and visibility; reduced-motion support.
- [ ] Stronger encounters: dangerous but committed attacks, explicit recovery, fresh and upgraded route checks.
- [x] Salvage carriers: visible armor vent cycles and actual vulnerability.
- [x] Second fixed reward choice: guided rockets or finite defensive escort.
- [ ] Formation-safe scheduling: account for the whole army rather than a point-sized hero.
- [ ] Boss part targeting: assess and implement only with authoritative hit recipients; do not claim existing scalar break thresholds are independent weak points.
- [ ] Regression harness: power semantics, collisions, gate conservation, pause, retry, saves, delayed controllers, rendering resources and browser errors.
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
