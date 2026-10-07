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
