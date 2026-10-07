# Backlog: Contra-style side-scrolling level (NOT approved to start)

Requested by the user on 7 October 2026. Do not start design or implementation until the user explicitly approves, and only after the current top-down Iron March level is finished. When approved, show initial renders of both the environments and the characters before building gameplay.

## The idea
- A new level viewed from the side (classic Contra), alongside the current top-down level.
- Reuse the existing characters (commander, hero troopers, CC0 mech villains, Tyrant); new characters are allowed.
- Free movement: run forward/back, jump, duck, duck under water, melee slash, aim and shoot, power-ups, projectiles to dodge.
- Hired/assigned troops follow the player and fight; swap single or multiple troops; take troops and weapons from the store; troops and power-ups help when overwhelmed.
- Full environmental effects, destructibles, villains, forward progression, using the current playable mechanics and physics where possible.

## Feasibility notes (first look)
- The renderer, crowd baking, effects, destruction, thunder and villain cast are view-independent and can be reused with a side camera.
- The C++ core is built around a forward lane run; a side-scroller needs a new 2D platforming simulation (gravity, jump, ground/platform/water collision, aim directions) beside the existing one, not a reskin.
- Character animations needed: jump, duck, crouch-walk, swim/duck-in-water, slash, aim up/diagonal. The CC0 mech clips include Jump, Punch, SwordSlash and Shoot; hero troopers would need new baked clips.
