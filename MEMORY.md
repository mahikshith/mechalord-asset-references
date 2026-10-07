# Mechalord project memory

Reconciled 7 October 2026. Read `HANDOFF.md` and the current build manifest before continuing. This stores design decisions, not credentials or a private conversation transcript.

## Accepted direction

The user prefers **Iron Front** combat/characters over Reforged. Keep its commander, troops and mechanical Tyrant. Reforged world geometry, palette and UI colors may be reused where they fit Iron Front. Do not quietly replace actors or start another complete redesign.

Required feel: readable portrait composition, substantial units, urgent forward movement, meaningful enemy threats/counterplay, impactful 3D weapons and deaths, distinct pickups and challenging-but-winnable boss combat. Preview-only animations do not count as normal-play implementation. The user expects precise checks, autonomous stepwise progress, clear file ownership for parallel agents and saved milestone results.

## Latest corrections

1. **Barrage replaces Overdrive:** real shoulder racks/rockets, armor/recoil/flashes, accepted fire/smoke. Base 18 rockets/5 seconds; Endurance22/5.75. No rings or normal-bullet multiplier. Stable slot2/ABI.
2. **Laser clash:** coherent blue/orange plasma, narrower halos, separated lightning, open pressure front driven by actual core progress.
3. **Grounded boss:** faster real walking after boosters break, leg stride from actual displacement, reduced speed with one leg, planted committed attacks. Broken boosters do not evade.
4. **Hit feedback:** confirmed positive damage flashes the exact component white. Next-vulnerable guidance is separate. Core flash follows its face.
5. **One changing level:** campaign5 has a51-event/198-second approach through viaduct/trench/citadel, then one Tyrant/reward. Markers at62/128 seconds preserve all combat state. This replaces three boss-stage stacking.

## Current state

- Branch: `codex/iron-front-single-siege`.
- Core SHA: `281386d8b075f499a10aee8c3e3f2282c9e9fd39c024ed50126b5e3a330ccf46`.
- Authorized destination: `mahikshith/mechalord-asset-references`. Commit/push project work plus descriptive handoff/memory; preserve reference-image main history, no force push.
- Previous accepted comparisons: `codex/iron-front-unbroken-campaign` at`2cb2e38`, `codex/iron-front-reactor-siege` at`85c107e`; Reforged branches retained.
- Actual runtime: portable C++/WASM/Three.js. Unreal asset workshop exists but native assault adapter/package does not.
- Normal URL: `http://127.0.0.1:8077/playable/index.html`, server root`delivery`. Review page is explicitly internal automated QA.
- Core first, bundle second. Match immutable WASM and decoder JS hashes.
- `actIndex`/`stageLevel`/`actStart` are legacy zone names in campaign5. No resets/rewards there. Global HUD usesdistance/goal.
- `continuous-route-environment.ts` uses14 retained original environment GLBs; practice adapters remain separate.
- `storm-battery.ts` reads real relic timers/shotIDs. Compatibility Overdrivealias does not authorize old rings/cadence/colors.
- Selected receipts need deliberate force-add becausebuilds is ignored. Vendor/package/engine caches stay untracked.

## Do not repeat dead ends

Local TRELLIS was explicitly aborted/removed after poor output/time cost. Do not reinstall weights/libraries or restore deleted experiments. Meshy was explicitly rejected; old50-credit approval was superseded. Do not buy/spend on that service. Lux3D/to3D are not required dependencies.

Blender/Unreal installation does not imply automatic faithful image-to-3D conversion, live editor control or a native game. Be truthful about actual evidence. The original selected concept images remain the reference; rejected blockouts/actors stay archived. No Top Lords/Mob Control art is copied; promotional references do not count as hands-on playtesting.

## Evidence standard

Separate native/adapter logic checks, CPU geometry, mocked UI, automated replay renders and normal play with ordinary controls. Automated wins demonstrate feasibility, not human difficulty or addictiveness. New proof belongs to the current hash; do not reuse old screenshots as latest. Never claim an unobserved effect is visually accepted.

Preserve actual damage/accounting, one-time gates/hits, pause/retry cleanup, physical origins and component identities. Existing platedShield/EMP/health/revival mechanics must remain functional. Engineer repair was unobserved in current automatic campaign routes; targeted validation remains.

## Remaining milestones

Human normal-game review and threat/recovery tuning; audible SFX/music mix; full environment/actor/effect performance; commercial asset provenance; supported Unreal compiler/SDK setup; native assault adapter; Android toolchain/package and Nothing Phone (3) validation; download integrity/offline flow; iOScook/signing/Metal; five first-time players. Older-phone claims require a separate2–3GBdevice. None are complete merely because browser tests pass.

Gems, revival bundles, skins, characters with different powers, weapon unlocks and paid shortcuts are later research. No payment, wait timer, store or paywall is active. Keep the current local POC free to retry/winnable.

Continue from this single-siege implementation and user gameplay feedback. Avoid another full visual restart. Preserve accepted results and document actual limitations.

## Claude Code tooling (7 October 2026)

Installed skills and plugins are listed in `SKILLS.md` (ponytail, game-dev team, Jeffallan frontend/mobile skills, three.js best practices). Load `three-best-practices` before renderer work. New work continues on branch `claude/top-lords-upgrade`, cut from `codex/iron-front-single-siege` at `db22db3`; the user wants every new or changed asset shown to them before it is embedded in the level.

## Top Lords upgrade state (branch `claude/top-lords-upgrade`, 7 October 2026)

- Zig 0.17.0 is installed (untracked) at `tools/vendor/zig-x86_64-windows-0.17.0`; downloads here need `curl --ssl-no-revoke` (corporate cert revocation check fails).
- Core changes: 64-event Iron March (ledger is full; adding events needs a wider spawn bitmask), six wave shapes (`Event.dropPower` = shape id on Wave events), trap gates (`Gate` variant 1), boss enrage +9% attack rate per broken part, campaign Tempest laser lasts 3.5 s and erases every non-boss target in its lane (boss takes 6/pulse).
- Renderer additions: `render-quality.ts` (bloom/env/sky, adaptive fallback), `battlefield-destruction.ts` (props, debris, scorch, cracks), `lightning-strikes.ts`, `villain-look.ts`, `baked-mech-crowd.ts` + `hostile-mech-cast.ts` (CC0 Quaternius mechs as instanced vertex-animated crowds).
- User rejected procedural villains (Skyreaver, called "AI slop"); prefers sourced open-licence models or clean from-scratch builds, always shown as renders before embedding. Approved: CC0 mech cast, villain surface pass. Pending: detailed weapon models, hero troop replacement (CC0 "Sci-fi Soldier" by Irondust proposed; needs Blender to convert its FBX 6100 file).
- QA: headless Chrome via playwright-core in the scratchpad drives `review.html` (`select #level`, `#start`, `#toggle-tools`); the in-app browser pane pauses when hidden. Asset review pages: `villains.html?set=troops|bosses|mechs|crowd|weapons&w=N|soldier`.
- Backlog (do NOT start without explicit user approval, and only after the top-down level is finished): Contra-style side-scrolling level with the same characters, following/hired troops, store weapons, jump/duck/swim/slash. Details in `docs/backlog-side-scroller-level.md`. Show environment and character renders before building.
- Store and trooper roster with unique powers is requested next (in-game credits, no real money yet).
- 2026-10-07 playtest fixes: boss-laser "freezes" were shader recompiles. Never toggle `visible` on a PointLight (light count is in every lit program key) and never drop the EffectComposer at runtime (output colour space changes every key). Lights now dim via intensity, quality fallback only disables bloom + pixel ratio, and World.load() ends with renderer.compileAsync. Check with scratchpad cap/hitch7.mjs (program count must stay flat during #charge).
- Same pass: white hit flash removed from Tyrant (BossRigAdapter.notifyHit is a no-op) and walkers (faint ember), commander steer 14 u/s (keys 9 u/s), campaign enemy walls skip columns 1/4/7 (three open lanes), plating Diff(6,4,3), boss damage Diff(1.3,1.05,.9), enemy HP Diff(.8,1.1,1.35), enrage Diff(.85,.95,1.05). Casual-bot probe: Recruit 3/3, Veteran 2/3, Warlord 1/3 wins.
- 2026-10-07 hand-off: work moves to the user's personal laptop (Blender is installed there, not on the office laptop). Next: Blender level kit (deck, walls, pillars, Skyforge/reactor set pieces), hero trooper from the CC0 Irondust soldier, cleaner Tyrant; renders before embedding. Unreal only if the game is ported for mobile, decide later. Re-download Zig 0.17.0 into tools/vendor (untracked) and serve delivery/ on port 8077.

## Side-scroller (started 7 October 2026, branch claude/project-thread-kfgczz)

- User paused the top-down redesign and approved a fresh Contra-style side-scroller in Unreal 5.8 (C++ via VS 2022 Build Tools only; user asked to avoid the full IDE). iOS parked. Personal laptop: Blender 5.2 at C:\Program Files\Blender Foundation\Blender 5.2, UE 5.8 at C:\Program Files\Epic Games\UE_5.8, RTX 3050 (Cycles must use CUDA, OptiX kernel fails).
- Blender is driven headless with Python scripts; no MCP or connector is needed.
- Pending user answers: theme direction for slice 1 and permission to download Poly Haven CC0 textures/HDRI and the Irondust soldier pack.
