# Mechalord future monetization and unlock research

Requested additions, recorded 4 October 2026: live revival using gems, individual gem use and gem bundles, weapon variety, paid/unlockable content, character and power-up skins, and heroes with unique powers. Initial heroes should be free; later heroes may unlock after completing levels or through gems. This document is a future milestone, not permission to implement live payments in the POC.

## Proposed product model

| Feature | Proposed behavior | What needs validation |
| --- | --- | --- |
| Revival | Freeze the defeat state and offer one gem-funded revival per battle; always offer free retry. Show the gem cost and restored state before confirmation. | Whether revival preserves tension; which checkpoint is fair; avoidance of duplicate charges |
| Gem bundles | Sell consumable currency bundles with clear gem quantities and store-localized prices. Spend gems individually on supported items. | Earned-versus-purchased currency economy, affordability, refund reconciliation |
| Characters | First heroes free. Later characters have visible level-completion requirements and optional gem unlocks. Unique powers represent different tactical roles. | Role balance, actual unlock pace, no unavoidable payment requirement to clear the main campaign |
| Weapons | Earn base weapon families through play; optional cosmetic variants and later direct unlocks. Display damage, rate and role plainly. | Whether each weapon changes strategy rather than merely increasing numbers |
| Skins | Character, weapon and power-up appearance changes have distinct catalog entries from ability-bearing heroes. | Small-screen readability and whether cosmetics meaningfully improve appeal |
| Paid chapters | Optional expansion content may have separate purchase entitlement and download states. Show both price and download size. | Fair free-content boundary, replay value and entitlement restoration |

Exact prices, bundle sizes, gem earn rates and revival costs are intentionally uncommitted until retention and battle difficulty are measured. No scarcity countdowns or randomized paid rewards are proposed.

## Store requirements researched

Google Play generally requires its billing system for digital items such as currency, extra lives and characters, subject to specified regional/program exceptions. Currency is restricted to the title in which it was bought and prices must be clearly described. [Google Play Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738).

Apple's in-app purchase rules govern digital unlocks and in-game currencies; purchased currency must not expire and restorable purchase categories require restoration support. Regional purchase/link rules must be rechecked at release. [Apple App Review Guidelines section 3.1.1](https://developer.apple.com/app-store/review/guidelines/#in-app-purchase).

Use native store billing as the default production route. A gem bundle is a consumable; a permanent character, cosmetic or paid chapter is an entitlement. Do not treat downloading a chapter as proof of purchasing it.

## Later implementation milestone

Create a store-independent catalog and economy service. Keep earned currency, store receipts, granted entitlements and spending transactions auditable. A production backend verifies purchases, grants a transaction once, reconciles refunds and handles pending/cancelled payments. Revival spending and state restoration must be idempotent: a lost response must not charge again. Never grant paid gems solely from an editable local save.

Test purchase cancellation, pending payment, offline return, duplicate callbacks, interrupted revival, restore, reinstall and refund. Conduct a separate economy/playtest review before setting prices or launching paywalls. POC gameplay and future payment plumbing remain separate.
