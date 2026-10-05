# Iron Front balance audit — one-level difficulty pass

Audited 5 October 2026. Preserve the Iron Front characters and current collision/combat authority. Reforged is shelved except its world, palette and UI. This document proposes changes; it does not implement them.

## Evidence and limits

Read the current `AssaultSimulation.h/.cpp` and ran **six deterministic Causeway sessions** through the public `AssaultCore` adapter and the actual `delivery/playable/assault.wasm`. No state injection, healing, revival, purchases, runtime edits, rebuilds or full regression rerun were used. Binary: **1,294,983 bytes**, SHA-256 `d7497deba9125c7344d99d7e23f5521752ed870f4548f20a51c1b638b682888d`.

Detailed receipts: [iron-front-balance-audit.json](../builds/iron-front-balance-audit.json). The successful controller is the existing test route: it sees exact target/pickup positions, gate values, boss aim and incoming projectile trajectories every frame. These runs measure a capable automated route, not human win rate or first-time usability. The inactive controller holds the centre and never uses its relic. Only level 0 was measured anew; other stage behavior below is inferred from code or previously recorded tests.

## What the actual binary did

| Rank / controller | Boss arrival: troops / HP | Runner enemy kills | Runner contacts | Result / total time | Surviving troops / HP |
|---|---:|---:|---:|---|---:|
| 0 / route + Shield | 160 / 100 | 95 of 105¹ | 1 | Win / 108.22s | 53 / 90 |
| 0 / route + Overdrive | 160 / 100 | 97 of 105¹ | 1 | Win / 86.62s | 65 / 91 |
| 2 / route + Shield | 160 / 110 | 104 of 105¹ | 0 | Win / 82.85s | 77 / 102 |
| 2 / route + Overdrive | 160 / 110 | 105 of 105¹ | 0 | Win / 82.60s | 65 / 101 |
| 0 / centre, no relic | 1 / 62 | 30 of 105¹ | 3 | Defeat / 68.33s | 0 / 0 |
| 2 / centre, no relic | 1 / 71 | 90 of 105¹ | 0 | Defeat / 68.35s | 0 / 0 |

¹ Counted actual enemy kill events over the session; boss entry retires surviving runner enemies without kill rewards.

All four successful routes reached tier 4 around **43.5–43.8s**, collected seven pickups and six gates, and spent **22.72s at the 160-troop cap** during a 57.5s runner. Rank 2 had a special weapon for the entire runner; rank 0 had one for 35.12s. Overdrive was active for approximately **54% of runner time**. Boss fights lasted 22.60–48.22s before the separate 2.5s destruction sequence. Rank-2 routes cleared the core in 2.05–2.37s; rank-0 Shield missed the first window and needed the single armor rebuild. There is real boss damage and a real losing strategy, but little pressure reaches a capable upgraded player before the boss.

## Why power snowballs — code-inferred

1. **Growth compounds and loss initially has little firing penalty.** Gates upgrade through shooting: recruit gates gain one troop per four damage, capped at +32; a destroyed multiplier becomes ×3. Five more paired gate sections follow the first choice at fixed eight-second traversal intervals. Army is capped at 160, while volley count is `5 + army/16`, capped at 12; cannons add four and cap at 16. At 112–160 troops both variants already fire their maximum volley. Losing almost 30% of a full army need not reduce its shot count.

2. **Several multipliers operate together.** Tier damage rises from 1.5 to 4.4; cadence improves from .30s to .225s. Guided adds ×1.4 damage and tracking; cannons multiply firing rate by 1.75; rail adds ×1.7 damage and up to five enemy penetrations. Overdrive independently adds ×1.8 damage and ×1.6 rate. Nominal generated damage/sec, before misses, armor and pool saturation: initial normal **25**; tier-4/full-army normal **234.7**; cannons **547.6**; rank-2 guided **348.3**, or **1,003** during Overdrive. This is not measured effective DPS: many rounds overkill or miss, and the boss has a separate damage budget.

3. **The reward cycle funds the next reward cycle.** Three destroyed crates totaling 135 XP reach tier 3; five totaling 225 reach tier 4 (thresholds 40 + 70 + 100). Ordinary kills give five energy; crates/orbs give 15, gates 15, collected pickups 25, and damage adds .18 energy per requested point. Overkill therefore contributes charge, rather than only actual HP removed. Charge correctly stops during active relics, but dense kills and independent pickups/gates recharge quickly between activations. After maximum tier, crate XP awards another 12 energy.

4. **Permanent rank bonuses remove the early aim challenge.** Rank 2 starts with 12 troops, 110 HP, +6% damage and permanent guided missiles. Pickups can override that weapon, then restore it. The guided controller acquired the same gate/crate progression as rank 0 while killing nearly the whole stage before contact. Army loss chips the leader by only .10 HP per troop; normal hostile bullets protect the leader until the army reaches one. Direct lasers can hurt the leader earlier, but capable routes sidestep their fixed aim. Healing/revival add further optional reserves; the measured victories did not need them.

5. **Boss durability is partly a timer while its threat decreases.** Armor starts at 1,850, with .65 damage conversion and a budget replenished at **110 damage/sec** (45 stored maximum). Higher firepower mostly saturates this budget rather than shortening armor time proportionally. Guns break at 65% armor remaining; jetpack/rocket capability breaks at 30%; legs break at zero and stop movement. Phase two begins near half total HP, shortly before the jetpack threshold, so much of the tougher aerial phase can disappear quickly. The reactor then has 600 HP, a narrow .9m hit allowance and a 6.5s first exposure. A failed window rebuilds 55% armor once; damage to the reactor persists, and the second exposure has no deadline. Freeze/slow suppress hostile clocks while player fire continues and the armor budget still refills on real simulation time.

## Predictability and test gaps

The runner repeats an eight-second template: gates, crate at +1.8s, wave at +4s, orb at +6.2s, with rollers every 16s. Lanes alternate deterministically; orb powers cycle by index; elite loot derives from ID. Most Causeway enemies have contact attacks; ranged gunners appear in level 2 only. Wave spacing/queuing prevents overlap, but the same approach direction and known lane schedule reward memorization. The boss repeats heavy → sweep → rockets → laser, with substitutions as parts break; its aim locks after 1.8s and supplies .95–1.4s windup. Those readable cues are valuable and should remain.

The existing suite proves mechanics, frame-rate consistency, nine baseline scripted victories and an extreme centre/no-relic defeat. It does **not** show a balanced distribution of difficulty, meaningful rank-2 challenge, imperfect reaction/aim, different reasonable choices, touch occlusion, observed attack readability, or player retention. Its instant-state route predicts impact positions and can exploit more information than a human sees. “Nine routes win” is feasibility, not a difficulty acceptance criterion.

## Proposed focused implementation

Build one authored 70–95s vertical slice, retaining continuous travel and existing swept contacts. Use escalating, readable encounter families: a aimed-shot lane requiring a late dodge; a rotating/alternating formation with a safe gap; an elite escort that protects a valuable pickup; a roller plus one clearly separated gunner. Alternate recovery beats and pressure beats. Introduce each attack alone before combining it; avoid opaque obstruction or simultaneous unavoidable coverage. Use a small deterministic pattern deck with controlled variations for replay, not random difficulty spikes.

Normalize the compounded attack budget first: keep rank weapons permanent but cap their sustained throughput/coverage advantage; make a temporary power provide a clear tradeoff rather than multiplying every advantage. Charge from actual HP removed, then tune kills/pickups so relic use buys a tactical window with a real interval afterward. Reduce repeated ×3 growth opportunities and preserve recovery recruitment after losses. Do not solve pressure by inflating all HP or removing the user's earned firepower.

Replace the boss's broad rate-limit feeling with attack windows and actual part objectives. Preserve readable charge/commit cues, brief rocket homing then committed flight, finite rebuilding and troop sacrifice. Removing a cannon should change the pattern rather than remove most danger; grounded reactor attacks should remain distinct and demanding. Let accurate fire and a well-timed power shorten a window while requiring several meaningful dodge/aim decisions, even at rank 2. Numbers need a small measured iteration after this design is implemented.

## Required acceptance before expanding

- One baseline level is beatable with every relic and without saved rank, paid content or mandatory revival. Rank-2 skilled runs still face multiple meaningful boss patterns; passive centre/fire must fail or suffer substantial resource loss.
- Repeat bounded routes with 200–350ms decision delay, limited target information, occasional missed pickups and both sensible gate alternatives. Report troop/HP margins, armor/core times, attacks faced, relic uptime and effective damage, rather than only pass/fail.
- Preserve straight ordinary fire, actual guided behavior, honest part/core damage, continuous travel, bounded pools, once-only gates, visible deaths and equal contacts at 30/60/120Hz. No new invisible collision shapes or hidden damage scaling.
- Record several touch playtests and at least five new players' first attempts. Check whether they identify why damage happened and whether a dodge was possible. Set difficulty targets from those observations; these six automated sessions cannot establish a human win-rate target.
- Profile Nothing Phone (3) separately before Android performance claims. Keep the other two stages shelved until the single-level challenge and clarity pass succeeds.
