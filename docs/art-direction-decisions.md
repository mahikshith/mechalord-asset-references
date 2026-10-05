# Active art and gameplay direction

Decision recorded 2026-10-05 from the user's comparison of both playable editions.

**Iron Front is the chosen gameplay and character baseline.** Keep its commander, enemy and boss appearance, combat presentation and existing camera feel while improving one level's encounters and difficulty.

**Reforged is parked.** Retain its world/environment designs, world color combinations and UI colors as references for a later pass. The user rejected its characters, lasers and broader combat presentation as too childish. Do not use Reforged's characters, animation or attack presentation as the default for continued gameplay work.

Preserved comparison builds:

- Iron Front: `delivery/playable/index.html`, served at `/playable/index.html`.
- Reforged: `delivery/reforged-playable/index.html`, served at `/reforged-playable/index.html`.
- Reforged source/export archive: branch `codex/reforged-playable`, `assets/exports/reforged/`, native scene tools and `game/MechalordArtLab`.

The Reforged archive is an experiment, not an accepted mobile release. Its last camera adjustment was built but the final verification pass was stopped at the user's request. Keep that distinction when resuming work.

Active work, authorized 6 October 2026: one authored Iron Front level, **Reactor Siege**, with stronger enemy roles, committed readable attacks, earned weapon transformations and impactful explosions, on `codex/iron-front-reactor-siege`. Preserve current progress and the accepted presentation.

**Rejected mechanic:** the user explicitly abandoned TwinBee bells and shooting to cycle pickup colours. No bells, colour cycling, reroll shooting, over-shoot punishment or cease-fire control enters the active design. The historical TwinBee research remains documented; its general power-up variety and pacing observations are hypotheses, not an instruction to copy its system. Retain original fixed equipment pickups and the useful Raiden, Gradius and Galaga research.

The bounded implementation retains existing scalar boss part/armor progression while improving pressure and repeated core windows. The first carrier’s fixed cannon/rail choice is implemented and independently checked through the rebuilt WASM; a second carrier/escort pair and independently aimed boss weak points remain extensions. This decision authorizes implementation; it does not certify a rebuilt playable or Android package.
