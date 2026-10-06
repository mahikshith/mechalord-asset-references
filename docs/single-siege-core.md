# Single-siege combat implementation

Branch: `codex/iron-front-single-siege`. This supersedes the earlier three-boss Iron March design; practice stages 0–4 remain standalone. Scope is authoritative simulation and its browser bridge, not a visual-quality or phone-performance claim.

## One march, one boss

Campaign index 5 has one 198-second authored approach, one global travel target of 732.6 world units, and one Forge Tyrant at the end. The 51-event route uses one spawn ledger rather than restarting existing stage scripts.

| Travel interval | Zone marker / environment | Encounter character |
|---|---|---|
| 0–62 seconds | `actIndex=0`, `stageLevel=0` | Recruitment, early weapon supplies, alternating lateral rollers, Bulwark and Hound introductions |
| 62–128 seconds | `actIndex=1`, `stageLevel=3` | Staggered crossfire, Engineer repair escorts, Wasp mortars, control-power choices |
| 128–198 seconds | `actIndex=2`, `stageLevel=4` | Fortified battery/support combinations, siege weapons, then recruitment and health recovery before the boss |

Zone crossings change only the marker and emit `actStart`. They do not clear enemies, projectiles, pickups, troops, commander health, weapon progression, timers or charges. The renderer must therefore treat `actStart` as a zone cue, not as a world reset. `travelDistance/travelGoal` is whole-route progress; snapshot `actProgress` is the explicit within-zone fraction.

Only destruction of the final boss opens the absorption/reward choice. Choosing the one imprint ends the campaign; no second or third boss is spawned. Final boss base armor is 3,200 with 900 core HP. Its mixed schedule includes arm cannon, shoulder rockets, laser and sweep while the necessary parts exist.

## Barrage: actual Storm Battery

Relic slot 2 now deploys a Storm Battery. The old `Overdrive` name remains only as a C++ enum alias for numeric compatibility. There is no ordinary-bullet damage multiplier and no ordinary-fire cadence multiplier.

The power immediately launches a pair and then launches another pair every 0.56 seconds, for nine pairs/eighteen real rockets over five seconds. An Endurance imprint extends the duration to 5.75 seconds and permits eleven pairs. Pair budgets and the existing shot pool bound output; retries clear the battery and pause holds its timer and shots.

- Shoulder origins: `(commanderX ± 0.68, y=2.11, forwardZ=0.92)`; renderer depth has the opposite sign.
- Existing `salvo` projectile kind carries authoritative height and vertical velocity, using the accepted missile/fire/smoke renderer.
- Each rocket deals `12 + weaponLevel × 0.8` direct damage before target-specific armor rules. The existing Salvo effect adds 12 damage to other enemies within 1.6 units on a running-lane enemy impact.
- Speed is 26 units/second. Guidance corrects gently for the first 0.6 seconds with an 18-units/second² steering bound. It does not jump between targets. Boss-region identity and boss epoch are fixed at launch.
- The independently earned six-rocket Salvo pickup still exists. Barrage does not overwrite the current normal weapon or other combat power.

Presentation uses `relics[2].activeTime`, not `combatPower`, to deploy the paired shoulder racks. The initial relic event is still value 2; actual projectile IDs drive launch feedback. No ABI change was required.

## Grounded Tyrant movement

After both boosters break, surviving legs move the boss laterally up to 2.7 units/second and in depth up to 2.16. One remaining leg reduces those limits to 1.45/1.16. The root stays at the grounded height; stride and knee articulation are driven by actual distance traveled and are part of the authoritative pose used for hit volumes.

The boss plants during a committed windup, recoil and active beam. The change does not re-enable booster evasion after boosters are gone. Once both legs are destroyed, the existing grounded collapse/core behavior remains.

## Verification scope

The focused native test checks zone-state continuity, global versus local progress, distinct authored encounter composition, finite rocket budgets and real origins, absence of old Overdrive multipliers, 30/60/120 Hz agreement, pause/retry behavior, immutable boss targeting, grounded translation/leg pose and a single final reward. Shield and finite-beam regression checks remain intact.

Initial native public-control feasibility routes completed fresh in 241.5 seconds (43.5-second boss, 47 surviving army) and at rank 3 in 227.4 seconds (29.4-second boss, 64 army). These routes automate aim and ability timing. They do not establish first-time-player difficulty or whether the boss feels sufficiently threatening. The shipping-WASM results below supersede those native route timings; browser validation is recorded separately by the integration owner.

Relevant tests: `test_single_siege.cpp`, `test_unbroken_campaign.cpp`, `test_unbroken_campaign.mjs`, `test_assault.mjs`, and `audit_player_target_route.mjs` in `tools/playable-preview`.


## Shipping core verification

Verified binary: `281386d8b075f499a10aee8c3e3f2282c9e9fd39c024ed50126b5e3a330ccf46` (ABI 5). The following routes instantiate the production TypeScript adapter and use public controls without injecting HP, damage, inventory or boss state.

| Route | Rank | Total | Final boss | Ending army | Result |
|---|---:|---:|---:|---:|---|
| Barrage when ready; pickup recovery | 0 | 285.65s | 87.65s | 14 | Won; one boss, one reward, one clash |
| Reserve Barrage for elites; late sacrifice | 0 | 283.47s | 85.47s | 11 | Won; one boss, one reward, one clash |
| Barrage when ready; pickup recovery | 3 | 227.42s | 29.42s | 64 | Won; one boss, one reward, no clash |
| Reserve Barrage for elites; late sacrifice | 3 | 233.30s | 35.30s | 110 | Won; one boss, one reward, one clash |
| Follow first vulnerable HUD part | 0 | 268.72s | 70.72s | 34 | Won; one boss, one reward, one clash |
| Follow first vulnerable HUD part | 3 | 229.60s | 31.60s | 58 | Won; one boss, one reward, one clash |

All four campaign-route audits crossed zones at global travel times 62 and 128 seconds with no inter-zone boss/reward/reset. All recorded zero unresolved physical sweeps. Each new archetype entered the playable encounter; Wasp mortar and Engineer firing events occurred. These controls automate accurate aiming, threat prediction, pickup choices and ability timing. They establish feasible routes, not player-study results or device performance.

Observed limitations: the rank-3 ready-use route destroys the final boss before most attack patterns fire (only arm-cannon pattern observed), whereas fresh routes see all four patterns. Engineer repair events were zero in these four authored-route runs, even though its support mechanic has isolated coverage; the healer role is therefore not demonstrated by these public-route receipts. Fresh final armies of 11 and 14 also show that troop-sacrifice revival may be unavailable or costly after attrition. No state protection or hidden resource refill was added to force these wins.

Receipts: `builds/unbroken-campaign-audit.json`, `builds/player-target-route-audit.json`, `builds/rebuild-test-results.json`, and `builds/single-siege-native.json`. The legacy mobility assertion was updated from the removed 1.25-unit slow shuffle to the requested grounded walk envelope and actual leg stride; production code and binary were unchanged during this verification.


### Reproducing the production-adapter checks

The verified launcher was `C:\Program Files\nodejs\node.exe`, Node **v24.19.0**, from the repository root `C:\Users\mahik\Desktop\mechalord`. These are the exact successful commands; no import hook, esbuild wrapper or experimental resolution flag was used:

```powershell
node tools/playable-preview/test_unbroken_campaign.mjs
node tools/playable-preview/audit_player_target_route.mjs
node tools/playable-preview/test_assault.mjs
```

The `.mjs` entry points import `./assault-core.ts` explicitly. Node's built-in TypeScript stripping handles that adapter; its `./contract.ts` import is type-only and is erased. These commands load the existing `delivery/playable/assault.wasm`; they do not rebuild it. For a fresh checkout, first use the project's established root-owned canonical build step, verify the binary hash, and run these commands with Node 24.19.0. Results from another binary require new receipts. The latest legacy suite returned **71/71 passed**; the other two commands completed all four campaign routes and both HUD-target routes listed above.
