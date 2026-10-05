# Iron Front: arcade shooter research

Reviewed 5 October; decision updated 6 October 2026. Scope: one polished original level. **The user rejected TwinBee bells and colour cycling; fixed original power-ups and the supporting shooter research remain active.** Sources are official manuals, rights-holder descriptions and publisher pages. This review is textual research, not hands-on playtesting or watched-video analysis. Exact attack timings below are proposals, not measurements of reference games.

## TwinBee: historical research; bell mechanic rejected

**Version boundary.** [Konami's original arcade listing](https://www.konami.com/games/jp/ja/products/dl_ps4_twinbee_arch/) identifies the 1985 game and distinguishes Bubble System and ROM versions. Detailed evidence below comes from named ports; do not treat every port's rules as identical to the arcade game. Stinger/Moero, Detana and Pop'n are separate releases and are not combined into these findings.

**Verified Famicom mechanics.** Nintendo's [original-game overview](https://www.nintendo.co.jp/wii/vc/vc_twb/vc_twb_01.html) identifies the 1986 Famicom release. Its [controls](https://www.nintendo.co.jp/wii/vc/vc_twb/vc_twb_04.html) distinguish air shots from automatically aimed ground bombs; destroyed ground targets produce items. The [item explanation](https://www.nintendo.co.jp/wii/vc/vc_twb/vc_twb_05.html) confirms clouds conceal bells, shooting bells changes their colour, and excessive shooting turns them into an enemy bee. It also documents mutually exclusive pickups.

The [Famicom Wii U manual, section 7](https://www.nintendo.co.jp/data/software/manual/WUP-N-FAUJ-JPN.pdf) lists yellow score, blue speed, white twin cannon, red barrier and flashing red/white single-player doubles; ground candy grants a three-way shot. By contrast, [Konami's 1986 MSX description](https://www.konami.com/games/jp/ja/products/dl_win_twinbee_egg/) names a green doubles bell. Preserve that distinction. The [3D Classics manual, section 10](https://www.nintendo.co.jp/data/software/manual/man_sacj.pdf) documents a missed-bell score-chain reset, but explicitly describes a changed single-player adaptation; this does not verify the original arcade's exact chain values.

**Retained design hypothesis, not the bell system.** Make reward discovery a repeated highlight: destroy original floating salvage carriers and ground machines to reveal visually different powers. Offer twin cannons, guided missiles, a rail burst, and a protective escort as readable alternatives, with distinctive muzzle effects and countdowns. Use our own shapes, sounds and names.

**One-thumb adaptation.** Constant automatic fire removes the deliberate stop-shooting decision required to preserve a desired bell colour. Therefore exposed pickups must **lock their type** and ignore further bullets. Let steering select between two clearly labelled salvage cores, with sufficient collection time. Do not copy shoot-to-cycle plus over-shoot punishment into an uncontrollable auto-fire loop. The user subsequently rejected the bell system entirely; no cease-fire or pickup cycling is in the implementation scope. Standard ground attacks and a stock-limited emergency bomb are different concepts.

## Three supporting references

| Reference and primary evidence | Verified mechanic | Iron Front design hypothesis |
|---|---|---|
| [Raiden IV: OverKill official manual, pp. 4–7](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/323460/manuals/raiden4overkill_manual_digital.pdf?t=1658841837) | Separate main weapons, missile subweapons and bombs; remaining bomb count; pickups upgrade/change weapons. One ship's bomb clears enemy bullets, while another lands later with high damage. | Keep weapon silhouettes distinct and a clearly limited emergency action. A powerful recovery effect should have a visible cost and cannot be required to survive an otherwise unavoidable pattern. |
| [Gradius official manual, section 5](https://www.nintendo.co.jp/clv/manuals/en/pdf/CLV-P-NABRE_en.pdf); [Konami series description](https://www.konami.com/games/eu/fr/topics/4838/) | Capsules advance a selectable upgrade; Double and Laser cannot coexist. Konami describes waves followed by a destroy-the-core confrontation. | Give pickups a meaningful alternative rather than stacking every effect invisibly. Make the boss reactor a visible objective; destroying cannons should remove their attacks. Destructible individual boss systems are our proposal, not established by these sources. |
| [Bandai Namco's Galaga history](https://galaga.com/en/history/galaga.php); [official manual, sections 3–5](https://www.nintendo.co.jp/clv/manuals/en/pdf/CLV-P-NABNE_en.pdf) | Horizontal movement; entrance formations and changing attack patterns; challenging stages; rescued fighter doubles firepower and controlled width. | Telegraph enemy entrances before they shoot. Alternate danger with rewarding collection bursts. Extra army power must remain navigable: safe gaps must account for formation width, not only the commander. |

## Three original attack patterns

These are sparse formation-scale patterns, not a reconstruction of any reference's bullet choreography.

1. **Aim, commit, evade.** One visible gunner tracks during a proposed 0.8-second muzzle charge, then locks a lane marker and fires three separated rounds along that committed path. Projectiles do not keep homing after launch. Leave a recovery beat before a second shooter acts. Reject placements that eliminate a formation-wide escape corridor.
2. **Alternating cannon lanes.** A left cannon fires a short outer-lane stream; after it passes the formation, the right cannon answers. Use distinct charging lights and projectile shapes. Initially never fire both simultaneously. Breaking a cannon permanently removes its corresponding volley, making boss damage change the fight.
3. **Beam, opening, punish.** The reactor assembly visibly winds up for roughly one second, marks an outer lane, commits a short beam, then opens its core for roughly 1.8 seconds. The safe lane is advertised before firing; no late retarget. The exposed core gives rail/cannon pickups a purposeful payoff.

For every pattern, inflate hazards by the actual formation footprint and verify a reachable safe **centre interval**, including travel time and projectile tails. Do not call a visually narrow slit safe. Warning colours also need shapes, sounds and muzzle animation; floor paint alone can be hidden by troops.

## One-level pacing and validation

Proposed sequence: teach one volley → generous salvage choice → entrance formation/ground target → alternate cannon pressure → brief collection reward → boss combines the learned patterns. Avoid placing a pickup choice, moving gate and new attack simultaneously. Escalate combinations after individual threats become familiar, rather than merely raising bullet count.

Test fresh players with auto-fire and the largest formation: can they predict the committed lane, choose a power intentionally, notice a broken cannon's consequence, and explain a defeat? Measure damage, missed rewards and willingness to retry. Source pages establish reference mechanics; they do not establish that these mobile adaptations are fun, fair or already implemented.

**Implementation status, 6 October:** Reactor Siege is being implemented in the existing Iron Front C++/WASM game. Fixed weapon pickups, committed gunners and repeated boss core openings are the bounded scope. The first fixed cannon/rail choice is checked in the rebuilt WASM; the escort and independent part targeting remain proposals. Automated rebuilt-binary tests and actual touch/visual playtests remain distinct verification steps.
