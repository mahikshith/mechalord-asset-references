# Mechalord prototype design

Mechalord tests whether readable gate decisions and tactical machine battles remain fun over repeated short sessions. The world combines medieval armor with relic-powered machinery. Friendly designs use ivory, teal and rounded shapes; hostile machines use charcoal, terracotta and angular shapes.

## Battle loop

Choose a stage and one relic, drag horizontally through a forward-moving battle, collect troops or energy, survive waves, then clear the objective. Siege stages transfer the surviving army into a finite launcher reserve. Each shot consumes one reserve troop before multiplying through a gate. Kills charge relic energy and a separate champion meter. Winning grants currency and unlocks the next stage; losing allows an immediate free retry.

Shield protects briefly, EMP disables machine attacks briefly, and Overdrive increases attack rate. The POC starts with Shield; EMP and Overdrive unlock through stage completion. The commander can be deployed in siege mode after the champion meter fills.

## Stage progression

| Stage | Lesson | Delivery |
| --- | --- | --- |
| Relic Causeway | Drag, recruitment and multiplication | Base |
| Foundry Approach | Obstacles, Shield and waves | Base |
| Gatehouse Siege | Run-to-siege transition, launcher and champion | Base |
| Storm Pass | Moving gates, EMP and elites | Chapter 2 |
| Forge Core | Combined tactics and boss warnings | Chapter 2 |

Use data-defined encounters and a reusable environment kit. Validate a winning route for every level at zero purchased upgrades. Difficulty changes pressure, combinations and timing rather than forcing payment.

## Size and device budgets

Initial installed game: preferred ≤400 MB, hard target ≤500 MB. Optional chapter download: <100 MB. Count downloaded chapters separately from the initial install. Nothing Phone (3) is the first test device; an actual compatible ARM64 2–3 GB device is required to substantiate low-end support. Low mode targets sustained 30 fps, up to 80 visual troop representatives, small textures and unlit materials.

## Future features requested by the user

Gem-funded live revival, gem bundles, multiple weapons, cosmetic character/power-up skins and heroes with unique abilities are deferred until the battle POC is validated. Early heroes are free; later unlocks can have level-progress and gem routes. See [monetization research](monetization.md). The current runtime has no real-money checkout or paid gate.
