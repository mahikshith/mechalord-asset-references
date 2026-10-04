# Iron Front v6 — world variety, lasting casualties and the furnace core

Validated 5 October 2026 (local time). This iteration addresses the latest playtest feedback in the existing browser prototype. Store, gems, billing and paid unlocks remain deferred.

## Changes

- Removed the alternating checker tiles. The road is one continuous dark, textured deck. Eighteen original side modules provide seeded combinations of rail breaks, bollards, welding arms, fans, cranes, storage coils, tanks and themed industrial structures. Layouts remain stable while scrolling; they change when a new world section enters, without flicker or lane obstruction.
- Removed timed troop-slot regeneration. Permanent, proportional casualty slots now drive visible soldiers, firing positions and collision tests together. Only real recruitment can restore visible representatives. Large logical armies retain a maximum of 24 visible representatives; the HUD shows the full accurate legion count. Every casualty event cannot map one-to-one to a representative above this limit.
- Unblocked troop losses accumulate 10% commander chip damage, in addition to direct damage when exposed. Shield prevents this spillover. Recruitment does not heal or increase commander HP. Losses show a short red count delta; health hits highlight the existing commander bar.
- Six physical pickups have distinct silhouettes, colors and short labels: guided missiles, rotating hand cannons, a rail barrel, freeze snowflake, slow clock and risky haste chevrons. Collection triggers a brief armor trace/ring on the commander and a compact notice, rather than a large central pickup banner.
- Freeze lasts 3 seconds: nearby hostile bodies and hostile shots stop while friendly attacks continue. Slow lasts 5 seconds and halves traversal/hostile speed. Haste lasts 5 seconds, increases traversal/hostile speed to 1.35×, and rewards 1.5× kill score / 1.25× crate XP. Haste is labeled as risk and placed on a side lane with a smaller collection radius. Weapon, time and relic powers have independent timers.
- Boss armor has damage resistance and a limited absorption rate so powerful weapons cannot instantly bypass its attacks. Armor break exposes an actual narrower core hitbox for 6.5 seconds. A surviving core triggers one 1.8-second rebuild with hardened armor; core wounds persist. The second core exposure stays open until destroyed. There is no repeating regeneration loop. Chest shutters, core color and weapon pose communicate the state; the existing single top bar switches between armor and core with an exposure countdown.

## Automated evidence

| Check | Result |
| --- | --- |
| Actual C++/WASM combat and adapter suite | 48/48 passed |
| Combat visual CPU checks | 37/37 passed |
| Main UI / save / progression / audio harness | Passed, including independent time icons, commander damage with troops alive, one armor/core bar and retry reset |
| Environment resource/recycling checks | Passed across 7,200 updates; deterministic continuity, lane clearance, no tile batches, animated machinery and idempotent disposal |
| Baseline completion | All nine combinations of three stages and three relics won without rank upgrades, in 78.5–91.9 seconds |
| Baseline surviving commander HP | 76–96 / 100; automated play is a feasibility check, not proof of player fairness |

Combat checks cover permanent casualty slots above the visual cap, recruitment-only restoration, swept enemy/roller/projectile contact, Shield and HP behavior, physical collection and expiry of time powers, simultaneous relic/weapon/time powers, actual weak-core hits, exactly one rebuild, powerful-weapon challenge, 30/60/120 Hz stability, isolated concurrent games and 250 retries.

Visual checks cover pooled fragments and projectiles, source-mesh death fragments, six distinct pickup geometries, acquisition effect bounds, time-controlled hostile animation, core shutters/rebuild, pause and disposal. These CPU checks do not measure GPU rendering speed.

Environment resident geometry attributes: approximately 2.13 MiB. Fixed 92 allocated instanced batches, maximum 38 visible batches and 41,748 visible triangles for scenery alone. Shadow passes and the rest of the game are additional cost. No phone frame-rate claim is made.

WASM binary: `delivery/playable/assault.wasm`, 1,269,361 bytes.

SHA256: `6dfe94dbcbe7640b024a2870e540373934c95f014e64987a85ad06dfc96a0002`.

WASM linear memory: 1,179,648 bytes, excluding renderer, JavaScript, textures and models. Detailed core evidence is in `builds/rebuild-test-results.json`.

## Browser inspection

- The shipping UI was inspected at an actual CSS viewport of 352 × 782. The weapon icon/name, commander HP, army count and relic control fit within the portrait viewport. Startup, pause/resume and an unattended defeat were observed without browser errors.
- The internal review uses the same actual WASM and normal steering/ability controls. It replayed freeze, haste, core exposure, a deliberately missed core/rebuild and true boss destruction followed by victory. It does not inject synthetic outcomes.
- At observed core exposure: 117 logical legion count / 18 visible followers, commander 94 HP. After deliberately missing the core window: 55 legion / 9 visible followers, commander 88 HP. This directly demonstrates persistent formation reduction.
- Captures: `builds/playtest-v6/portrait-combat.png`, `foundry-freeze.png`, `exposed-core.png`, `boss-rebuild.png`.

## Remaining limits

This is still the browser preview. The portable AssaultSimulation changes are not yet wired into the older native Unreal adapter. Unreal compilation, Android packaging, Nothing Phone (3) testing, sustained mobile rendering/memory measurements, final art acceptance and first-time-player balance observations remain outstanding. No local TRELLIS installation or paid generation service was used.
