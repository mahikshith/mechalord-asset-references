# Iron Front: Reactor Siege — one-level design

Research started 5 October; design finalized 6 October 2026. **Active implementation specification.** On 6 October the user authorized the one-level implementation and explicitly rejected the TwinBee bell/colour-cycle mechanic. Updated playable results remain pending the rebuilt C++ WASM and browser verification. Iron Front remains the accepted game. Reforged's environment, palette and UI colors are archived for later; its characters and combat presentation are not the direction for this work. See [the recorded decision](art-direction-decisions.md).

## What needs to change

The desired experience is a powerful army overcoming dangerous, understandable enemies. Bigger explosions should celebrate a decision that worked. More enemy health by itself will not fix the current level.

The [six-session balance audit](iron-front-balance-audit.md) found that both capable rank-2 routes reached the boss with 160 troops, full commander health and no runner contacts. They killed 104–105 of the 105 runner enemies. The Overdrive route kept its relic active for approximately 54% of the runner. These controllers had exact, instantaneous game information; this is evidence of the available power and route, not a human success rate. Centre-only play still lost.

Three causes matter most:

1. Army growth, weapon tier, special weapon and Overdrive compound. Damage from overkill also earns charge. Repeated growth gates fill the army cap long before the boss.
2. Most first-level enemies only threaten through contact. They die before their behavior creates a decision. Each eight-second section repeats essentially the same structure.
3. Boss armor limits damage per second, while losing parts removes its most dangerous attacks. A strong army waits out armor, then deletes the exposed reactor very quickly.

Keep the accepted camera, commander, mechanical enemy models, ordinary straight bullets, existing collision authority, visible deaths and continuous advance. Build the challenge around **where to aim, when to move, which reward to pursue and when to spend a power**.

## Reference findings and adaptation

The [full arcade research](arcade-shooter-research.md) separates official descriptions and manuals by release. This research did not include new hands-on sessions or video analysis.

| Reference | Supported lesson | Our adaptation |
|---|---|---|
| [TwinBee, Famicom item guide](https://www.nintendo.co.jp/wii/vc/vc_twb/vc_twb_05.html), historical research | Shots reveal bells and change their reward; excessive shots can turn a bell into a threat. | Bell and colour-cycle mechanics are rejected. Retain the general design hypothesis of exciting, distinct equipment pickups with fixed types. |
| [Raiden IV: OverKill manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/323460/manuals/raiden4overkill_manual_digital.pdf?t=1658841837) | Main weapons, missile subweapons and limited bombs have separate purposes. | Different weapon coverage and a scarce emergency clear. More visual firepower does not need every statistical multiplier simultaneously. |
| [Gradius manual](https://www.nintendo.co.jp/clv/manuals/en/pdf/CLV-P-NABRE_en.pdf) | Collected capsules support upgrade selection; Double and Laser are alternatives. | Pick a tool for the next threat. Only one temporary weapon transformation at a time. |
| [Galaga official history](https://galaga.com/en/history/galaga.php) | Recognizable entrance formations and the dual fighter distinguish waves and power. | Enemies enter visibly from the top. Increased firepower still needs a dodge corridor that accommodates the whole army. |

Housemarque senior level designer Henri Mustonen describes recognizable grouped spawns, enemies with distinct roles, clear phases and manageable sections between pressure peaks. He also describes repeated playtesting rather than relying on one good first impression. Our interpretation: give each encounter a readable purpose and escalate familiar combinations, instead of adding several unrelated threats at once. [First-person Nex Machina design account](https://www.gamedeveloper.com/design/game-design-deep-dive-maintaining-tension-in-i-nex-machina-i-).

## One authored level

Working name: **Reactor Siege**. Target a roughly 60–65-second approach and a 25–40-second boss fight. These are initial tuning targets. A strong run may be faster; do not add invulnerable waiting solely to enforce duration.

The table describes when a beat should be visible at ordinary travel speed, not raw offscreen spawn timestamps. Implementation must account for the existing camera and approach distance. Runner encounters use travelled distance; attack windups use simulation time. Slow/freeze effects must not let the director stack multiple encounters into one screen.

| Visible beat | Encounter and player decision | Reward / pressure |
|---|---|---|
| 0–8s: establish control | A small marching wedge, then one simple recruitment choice. Keep shooting and choose a lane. | Immediate satisfying kills; about 6–8 recruits. No tutorial overlay covering play. |
| 8–18s: first committed attack | A flank gunner enters from the top, raises its cannon, tracks, then commits a short volley. Bait it and move after the lock. | Introduce dodging before adding rollers. A later support group makes ignoring the gunner costly. |
| 18–27s: Fixed equipment reward | An armored salvage carrier crosses the upper lane behind a small escort. Focus it to release twin-cannon or rail cores. | Choose wide crowd clearing or concentrated piercing. Its reward is visible early enough to pursue deliberately. |
| 27–37s: battery encounter | Two separated cannon positions answer each other. One shoots while the other reloads. A fixed recruit gate follows after the projectiles pass. | Destroying a cannon removes its lane attack. Earn recruits after surviving the first substantial test. |
| 37–43s: payoff | One compact, clearly shaped wave of lighter machines. | The chosen weapon shreds a formation with a chain of mechanical explosions. Short recovery, not an empty corridor. |
| 43–56s: combine learned threats | An outer roller and one gunner, separated so their danger does not arrive simultaneously. A single multiplier route is paired with safer fixed recruitment. | Trade positioning risk for growth. No roller may occupy the only safe route during a committed volley. |
| 56–63s: rearm and arrival | One optional salvage carrier offers guided rockets or a defensive escort. The boss lands visibly ahead. | Brief collection window; existing projectiles finish before the first boss charge. No mandatory full heal. |
| About 63–100s: Forge Tyrant | Cannon pressure → mobile missile pressure → grounded reactor attacks. | Break visible systems, exploit recovery windows, survive the final core. Existing troop-sacrifice recovery remains available. |

For the first tuning pass, use three recruitment/growth choices rather than six increasingly powerful gate pairs. A provisional no-loss route is starting army +8 +14, then ×2 or +18. Keep the existing logical cap as protection, but do not design every successful run to reach it. Final values must be tested with both a fresh commander and earned ranks. Gate values remain honest; no hidden difficulty scaling.

Continuous advance is essential. An ignored runner enemy must visibly retreat, leave the route, or make one valid contact attack; it must not silently disappear as though killed. It cannot hold the player in place. Surviving runner threats must be resolved or visibly withdraw before the boss encounter; they do not grant kill rewards.

## Enemies that can fight back

All timings here are starting hypotheses, to be measured on the portrait screen. The threat clock starts after an enemy is visible, not when it spawns above the screen.

**Lockshot gunner.** Enter → raise weapon → track for about 0.8s → lock aim → fire three separated heavy rounds → recover for about 1.2s. Aim cannot follow the player after commitment. A mechanical latch sound and muzzle closure mark the lock; no long red line across the road. Strong accurate fire can kill or interrupt it before a volley. Its escort and staggered arrival supply pressure when the player prioritizes a reward instead.

**Paired battery.** Left cannon charges and fires into a committed outer band, then the right answers only after the first stream has cleared the rear of the formation. Breaking either cannon removes its own future attacks. The remaining cannon may adopt a different rhythm after a visible reconfiguration, but does not secretly gain health or fire instantly. The first appearance teaches this alone; the late encounter adds a separated roller.

**Salvage carrier.** A durable, clearly identified reward target with two short escort lines. It arrives visibly from the top, follows an authored path and leaves if ignored. Its armor opens during a brief vent cycle; shooting that opening is faster than grinding the shell. The first one should be forgiving. A later one may force a choice between a reward and an immediate threat. A missed carrier is a lost opportunity, not a blocked level.

Initial effective kill-time targets are roughly 0.2–0.5s for exposed fodder, 2–4s of aligned fire for a gunner and 5–8s for a carrier at its intended point in the level. Tune using actual damage delivered, not nominal bullet DPS. Every enemy needs enough readable time to show its role; it does not need guaranteed invulnerability or a guaranteed attack.

### Formation-safe patterns

The controller moves horizontally; a broad army cannot use a tiny spaceship's two-dimensional escape routes. Evaluate safe commander positions using the current troop offsets, their collision radii, projectile widths, movement speed and the time until impact. Include trailing rows when streams cross the army. At least one reachable safe interval must survive the complete attack, not merely its first frame.

Reject a scheduled overlap that leaves no safe interval without consuming a relic. Reposition, delay or suppress the lower-priority threat. Start with one major pattern plus one low-pressure support group. Aim for 0.9–1.2s of visibly readable warning before a new lethal pattern; faster familiar repeats need playtest evidence. No offscreen damage, late aim snapping or sudden all-lane coverage.

## Powers with different jobs

Keep permanent rank unlocks and progress. Change the challenge around them rather than silently removing earned equipment. Rebalance sustained damage and coverage across weapons; temporary transformations should be exciting because of what they do.

| Power | Visual identity and use | Meaningful limit |
|---|---|---|
| Twin cannons | Two visible rotating guns; broad, staggered amber salvos. Clears escorts and spread-out machines. | Lower concentrated armor efficiency than the rail weapon; does not also home and pierce. |
| Rail burst | One charged, narrow cyan shot with a short bright impact. Punches a line and exposed armor vents. | Deliberate cadence and alignment; misses matter. |
| Guided rockets | Chunky rockets with short curved exhaust trails, visibly turning toward selected enemies. | Strong against moving/flank targets; bounded salvos and turn rate, not effortless full-screen damage. |
| Defensive escort | Two visible shielding units around the formation, with clear hit flashes. | Finite absorption; no hidden permanent invulnerability or full heal. |

The first carrier now offers a fixed cannon / rail pair with a shared choice group. The rebuilt-WASM audit verifies stable types, exactly one collected sibling and closure of the other. A later guided / escort pair remains a proposal; the defensive escort is not implemented. Initially target roughly 10–12 seconds for a weapon transformation, enough to influence the next authored encounter. Show its icon and remaining time. Replace, rather than stack, temporary weapons; when one expires the saved rank weapon returns with an explicit cue. The escort is a defensive alternative, not an additional automatic weapon upgrade.

Carrier destruction releases two separated cores. This is fixed equipment selection, with no bells, shoot-to-cycle mechanic, colour rerolls or over-shoot punishment. Their type locks immediately and subsequent bullets cannot change it. Steering the commander into one collects it; the sibling closes without granting a second reward. Give several seconds of clearly visible approach time. Contact by a wide trailing troop must not accidentally select both. Icons, silhouettes and short names distinguish powers without relying on color alone. A brief equipment deployment animation and distinct sound confirm collection.

Overdrive remains a short spectacular burst, but damage, cadence and special-weapon bonuses must have one combined tuning budget. Charge should use **actual HP removed**, with no credit for overkill. Reduce redundant gate/pickup energy payouts before changing duration; aim for several deliberate activations, with roughly 20–30% runner uptime as a provisional upper band for a strong collection route. Do not enforce it with concealed cooldowns.

EMP can be the scarce emergency clear: erase eligible incoming ordinary projectiles and interrupt nearby machines with a visible expanding pulse. Cap its boss damage separately. A live beam must end through an explicit stun/interruption rule, not vanish because it resembles a projectile. Shield protects the formation and shows the impacts it absorbs. Defer additional speed, freeze and harmful pickups until these four weapon choices and three existing relics are clearly understood.

## A boss that changes when damaged

Preserve the original arc-reactor chest and accepted face/rig. Retain the single top health bar; use small weapon-part status indicators only if they improve clarity. No second row of competing health bars.

1. **Armed chassis:** alternating cannon streams and a committed central burst. Left/right gun assemblies have visible damage states. Aim at a charging assembly to interrupt it, or dodge then fire during recovery. Removing a gun permanently removes that gun's stream.
2. **Jet assault:** visible boosters lift and shift the boss laterally. Fire staggered rocket fans with brief initial steering, then committed trajectories. A short landing/reload exposes the boosters. Once broken, the boss remains grounded; jet weapons never fire from missing parts.
3. **Grounded reactor:** slower movement, a shoulder emitter and charged core beam replace the lost mobility. Commit an outer beam, then expose the reactor for roughly 2–3 seconds. Repeat the dodge/opening cycle, preserving core damage between openings; baseline players do not need to finish the reactor in one window. The beam and rockets do not overlap into an unavoidable wall. At most one clearly shown partial armor repair is allowed; previously destroyed systems stay destroyed and core damage persists through repair and every later opening.

These are phase-specific capabilities shown on the rig from the beginning, not surprise attacks from invisible replacement guns. Each break buys a brief safe beat and a large physical destruction effect. Residual piercing damage can only reach another region that the shot actually intersects and that is vulnerable on that simulation step; it must not transfer automatically through every future phase. A skilled, well-equipped player can shorten phases and interrupt threats; do not force a minimum number of attacks through invisible health gates.

Independent part targeting, deferred from this bounded implementation, requires authoritative simulation hit regions with explicit identifiers, health, vulnerability and shot recipients, shared with the renderer through the snapshot contract. The current broad boss-X hit check and scalar armor thresholds cannot support honest independent cannon/booster targeting by visual changes alone. Align those regions to the animated rig, including flight height, and test that a hit damages precisely the part shown.

Use explicit part/phase damage rules to replace the current broad armor damage-per-second limiter after effective-DPS measurements establish useful values. Initial tuning should let rank-2 players encounter meaningful movement decisions while fresh players can win through more recovery windows. Keep honest armor hit feedback, chest-level shot endpoints and reactor weak-point collision aligned. Avoid both a two-second final core and a long health sponge.

## Make explosions communicate success

Housemarque describes colorful destruction effects as rewards and animation/VFX as tools for communicating enemy states. Take that principle, without importing its expensive particle technology. [Studio VFX breakdown](https://housemarque.com/news/2021/9/15/returnal-vfx-breakdown).

- **Ordinary machine:** short localized hit flash, an armor fragment and sparks; death gets a compact fireball and falling mechanical pieces. No lingering opaque smoke over incoming bullets.
- **Elite:** three or four timed component blasts, stronger sound and a visible reward release. The blast must not imply damage to neighbors unless the simulation actually applies it.
- **Boss system:** weapon tears free, tumbles away and explodes; the matching attack stops. Let fragments clear the play corridor before the next dangerous cue.
- **Final reactor:** existing death state expands into a staged internal rupture, falling chassis and final shockwave. Victory only follows actual core death; commander/troop deaths retain their own distinct effects.

Keep hostile projectiles and warning animations readable above flashes. Use brief, bounded camera recoil on major impacts, not constant shake. Cosmetic debris uses pooled instances and simple trajectories, not one new physics actor per fragment. Profile effect peaks; reduce cosmetic counts before reducing collision accuracy or hiding enemy shots.

## Implementation order and exact scope

Do these passes on **one Causeway replacement**, leaving the other stages available with their existing authored layouts. Scope new encounter and balance tuning to a level-0 profile. Shared correctness fixes, such as actual-damage charge accounting, can change the other stages' combat outcomes; run their existing regression cases and record those effects. Each pass builds on Iron Front; no replacement character generation or new engine migration.

| Pass | Work | Main implementation surface | Proof before proceeding |
|---|---|---|---|
| 1. Recover accepted source | Preserve the Reforged archive; create a gameplay branch. Restore accepted presentation/build files from `9033ed5` without removing archived deliverables. | `tools/playable-preview` and Git | Both comparison URLs still work; baseline screenshot, progress and WASM checksum recorded. |
| 2. Correct the power budget | Actual-damage energy; bounded combined weapon/Overdrive budget; honest effects of army loss; preserve unlocks. | `game/Mechalord/Source/Mechalord/AssaultSimulation.cpp/.h` | Before/after effective damage and charge traces for ranks 0, 2 and 3; existing collision and conservation checks pass. |
| 3. Author the approach | Replace level-0 repeating schedule with the beats above; add gunner states and safe-overlap scheduling; locked carrier choices. | Same C++ simulation; `assault_bridge.cpp`, `assault-core.ts`, `contract.ts` | Continuous travel, visible entrances, intentional one-choice collection; no impossible pattern in the tested formation range. |
| 4. Improve existing boss progression | Retain the existing scalar armor/part progression; strengthen later attacks, finite repair and repeated core windows that preserve damage. Preserve sacrifice recovery. Independent spatial weak-point regions remain deferred. | Simulation, bridge/snapshot contract and existing Iron Front boss rig adapter | Broken-part state remains persistent; later phases remain dangerous; core damage persists between windows. Do not describe scalar thresholds as independently aimed part hits. |
| 5. Present combat clearly | Gun charge/recoil, rocket trails, distinct pickup equipment, tiered explosions and audio. | `combat-visuals.ts`, `arsenal-visuals.ts`, `world.ts`, `audio.ts`, `main.ts` | Portrait captures show legible projectiles during peak destruction; no Reforged characters or lasers introduced. |
| 6. Tune one complete run | Rebuild the shared C++ WASM and browser preview; compare measured routes, then touch playtests. | Existing `build_assault.ps1`, accepted `build.mjs`, `test_assault.mjs` | Balanced margins and readable choices on device; only then expand to more levels. |

Implementation now proceeds on `codex/iron-front-reactor-siege` using the accepted Iron Front presentation. Preserve the separate Reforged output/archive. Level 0 becomes **Reactor Siege**, with a nominal 63-second approach; levels 1 and 2 retain their existing encounter layouts. Shared actual-HP energy accounting requires feasibility checks on those legacy stages. The portable C++ simulation is the gameplay authority; native Unreal integration remains a separate milestone, and a browser test is not proof of a packaged Android build.

## Acceptance for this level

- Test all three relics at ranks 0 and 2, plus the strongest existing rank loadout. Include conservative/reward-seeking routes, missed pickups and 200–350ms decision latency. Automated controllers must not predict hidden future attacks.
- Measure effective damage, relic uptime, gate growth, first dangerous volley, casualties, commander damage, boss attack opportunities, core exposure time and completion time. Compare to [the saved baseline receipts](../builds/iron-front-balance-audit.json).
- Fresh rank-0 play remains beatable without a shop, payment or mandatory revival. Stronger saved equipment helps, but does not erase every meaningful movement decision. Passive centre-only behavior should suffer substantial loss or fail.
- Verify gate and pickup single-use, swept contacts, exact troop losses, shield/EMP semantics, missing-part attacks, phase transitions and no silent runner kills. Check equivalent outcomes at 30/60/120 render rates and repeated retries without accumulated objects.
- Capture the entire run in portrait, including peak explosions and each boss phase. Check visibility and touch occlusion on Nothing Phone (3); sustained 30 fps and a 20-minute performance test remain physical-device acceptance, not a claim from desktop automation.
- Observe at least five first-time players. Record whether they understand the gunner lock, knowingly choose a power, recognize a broken boss weapon, explain their defeat and want another attempt. Treat their feedback as small-sample evidence, not proof of retention or willingness to pay.

**Recorded and preserved:** arcade research, six-session baseline audit, Reforged archive and the user’s rejection of the bell system. **Active implementation:** level-0 encounter/weapon tuning, visible gunner state, fixed power-ups, actual-HP charge accounting and repeated boss core windows. Rebuilt-binary playtest receipts and visual verification must establish what is delivered; research timings, the second carrier/escort choice and independent boss weak-point targeting remain design proposals until separately implemented and tested.

**Final bounded candidate audit, 6 October:** the independent actual-WASM audit passes **12/12 checks** across 23 sessions. All twelve delayed rank-0/rank-2 relic routes, all three immediate fresh-rank relic routes and all six legacy-stage relic routes win. Both passive centre-only routes lose. Fresh delayed wins span roughly **81–177 seconds**; saved rank-2 wins span **84–99 seconds**. Fresh Shield finishes include only 7 and 15 HP remaining. This establishes bounded automated feasibility, not the desired short-run pacing or a first-time-player success rate.

Fixed pickup choice, collision, conservation, core-wound persistence, pause, equivalent 30/60/120Hz outcomes and repeated-retry memory checks pass. Relic decisions use observable incoming fire/charge cues; controls include 200/350ms delayed snapshots, 250ms decisions, bounded steering and attention lapses. No healing, revival or synthetic state is used. See [the independent receipt](../builds/reactor-siege-controller-audit.json) and [the reproducible controller audit](../tools/playable-preview/test_reactor_siege.mjs). The final binary SHA-256 is `624e9b6d3e95c172bbe2bbfa7c93d7cfb5f434a60931afd83e3560c74839a358`. Earlier candidate receipts are retained; both the binary and controller changed between trials, so improvements cannot be attributed to either alone. No human, rendering or physical-device acceptance is claimed.
