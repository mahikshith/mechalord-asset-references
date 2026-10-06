# Single-siege browser evidence

Core: `assault.281386d8b075f499.wasm` (full hash in the build manifest). These are actual WebGL browser captures, not external concept renders. Final build file hashes are recorded in `builds/playable-build-manifest.json`; see `docs/single-siege-results.md` for controls, states and limitations.

| Image | Context |
|---|---|
| `normal-zone-boundary.jpg` | Ordinary `index.html` run at the first boundary: global31%, Storm Reactor Trench,3 troops,73/115HP. Barrage had expired by capture; this image is not a Barrage-effect proof. |
| `review-barrage.jpg` | Internal shared-renderer replay at26.9s, after real activation and0.6s combat advance. Paired racks and actual Salvo-kind missiles; no Overdrive body/floor circles. |
| `review-trench.jpg` | Same internal campaign route at66.9s; cooler trench scenery, surviving troops and ongoing combat. |
| `review-citadel.jpg` | Same internal campaign route at136.9s; warmer citadel scenery and ongoing combat. |
| `review-part-hit.jpg` | Final renderer, campaign boss at199.7s. Confirmed14 damage to cannonL, whose entire rendered component flashes white over its painted texture. |
| `review-grounded-stride.jpg` | Internal campaign replay at226.1s after booster-loss landing:0.02m height,mask15,both legs active and new authoritative stride. |
| `review-clash-even.jpg` | Final clash geometry around48%pressure, internal replay; blue hero/orange boss beams and open electrical contact front. |
| `review-clash-pressure.jpg` | Same clash advanced0.6s to68%hero pressure; contact moved toward the boss and ring/spark advection changed. |

Review UI may be hidden for a clean capture. Hidden controls do not turn a replay into normal gameplay. Early environment/normal captures precede the final part-flash/annulus polish; those environment/core sources are unchanged. No image proves mobile-device performance, full ordinary-control victory, audio quality or commercial readiness.
