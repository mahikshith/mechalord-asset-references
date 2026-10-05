# Iron Front combat presentation pass

User request: improve enemy shells, missiles, the reactor laser, troop movement, and booster-powered boss movement. Preserve the accepted Iron Front characters, environment and camera.

## Acceptance checklist

- Every enemy projectile carries its source identity and immutable launch position. Boss arm guns, shoulder launchers and reactor have separate attachment points on the animated model.
- A shot keeps travelling independently after launch. A later turn, part break or booster movement cannot drag an airborne missile back to its source.
- The reactor charges before releasing its laser. A layered beam and impact effects remain centred on the damaging path; cosmetic glow does not imply a wider collision corridor.
- Shoulder rockets have a physical casing, fins and compact animated exhaust. Ordinary enemy shells remain visually distinct. No opaque cone stands in for a complete projectile.
- Enemy footfall, arm counter-motion, recoil and turning follow movement and attack state. Frozen or paused enemies do not keep marching.
- The boss arrives on active boosters, brakes before committed attacks, and repositions faster while its propulsion is intact. Destroyed boosters or limbs suppress their corresponding motion/effects.
- Effects stay pooled and finite. Retry and pause preserve resource and state behavior. Review actual rendered frames, not only numerical tests.

## Scope boundaries

This is a presentation and boss-movement pass on Reactor Siege. It does not complete the deferred defensive escort, carrier vent cycles, independently aimed boss weak points, or automatic formation-safe encounter scheduling from the larger level-design document. Human difficulty assessment and Android device performance remain separate acceptance work.

The pre-pass source/build is preserved in commit `72baee2`; the older Iron Front comparison remains at `delivery/iron-front-baseline`.

## Delivered, 6 October 2026

- Added attachment points on the retained GLB's animated barrels, shoulder pods and torso. Socket sampling happens after the current pose, and removed parts stop publishing sources. Each projectile records its source and immutable launch position in the C++/WASM contract. Posed muzzle height is cached once, so a later turn or descent cannot pull an airborne shot back to its weapon.
- Replaced hostile cone-like fire with jacketed shells and finned missiles, short fading smoke and compact exhaust. Heavy shells retain a visibly larger silhouette matching their larger hazard radius.
- Added reactor charge, animated plasma filaments, a white-hot beam centre, soft radial glow, upward contact sparks and a road heat/light effect. Beam X/Z endpoints and the damaging corridor still come from the simulation; the outer glow is decorative.
- Added velocity-driven turning, articulated arm/tread movement, suspension and recoil to enemy formations and elite machines. The boss banks during faster booster repositioning, decelerates before committed attacks and holds its firing pose. Visible exhaust follows outboard nozzle collars attached to the original shoulder pods. Breaking propulsion suppresses thrust and reduces movement.
- Added deterministic review controls for shell fire, shoulder missiles, booster arrival and laser charge, including quarter-speed replay. These are confined to the internal review page.

Saved progression, accepted character models, world layout, player camera and power-up choices are preserved. No new paid or generated assets were used. This remains the browser presentation driven by the portable C++ simulation; it is not a new native Unreal/Android build.

## Verification

The delivered WASM SHA-256 is `e21b227b494dece0a668554b335c256113b8ab7717531f6482593a1876b179ba`.

| Check | Result |
|---|---|
| Simulation and adapter regression | 61/61 passed |
| Independent actual-WASM encounter audit | 12/12 passed across 23 sessions |
| Existing combat presentation regression | 61/61 passed |
| New presentation, freeze, bounded pools and disposal checks | 15/15 passed, including 300 retries |
| Actual GLB sockets, missing parts, rig motion and reset | 9/9 passed |
| UI/progression/audio regression | Passed all six groups |
| Browser render inspection | Booster entrance, shoulder launches, enemy shells, reactor charge and active beam inspected; no captured JavaScript/WebGL warnings or errors |

The independent audit still wins all twelve delayed fresh/saved-rank relic routes, all three immediate fresh routes and all six legacy-stage routes. Both passive centre-only routes lose. Fresh delayed wins span approximately 89–178 seconds; saved rank-2 wins span 83–96 seconds. These are bounded controller results, not human fairness or retention evidence. Longer fresh runs remain a pacing concern.

Final rendered evidence: [reactor beam](../delivery/combat-polish-proof/laser-after.jpg), [booster arrival](../delivery/combat-polish-proof/booster-arrival-after.jpg), [shoulder launches](../delivery/combat-polish-proof/shoulder-missiles-after.jpg). Captures show the internal review page rendering the shipping simulation and assets. The laser capture is from a later damaged phase, so the already-destroyed cannons and shoulder pods are correctly absent.

Screenshots establish the rendered attachment and silhouette at sampled moments; they do not establish sustained mobile FPS. Nothing Phone (3) touch testing, 20-minute performance, first-time player feedback and native packaging remain unverified.
