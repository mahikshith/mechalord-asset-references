# Mechalord reference game research

Research date: 4 October 2026. This is a source-based design analysis, not a hands-on playtest. Store descriptions are developer claims; promotional screenshots demonstrate presentation, not every behavior. Individual reviews are qualitative feedback with selection bias.

## Evidence and implications

| Game | Confirmed from official description | Presentation observed or described | Design implication for Mechalord |
| --- | --- | --- | --- |
| Top Lords | Swipe combat, army growth, hero recruitment, kingdom resources, fiefs and territorial progression | Inspected official store screenshot shows an angled portrait causeway, a single friendly unit, projectile, numbered barrier, recruitment gates and a dense opposing army | A clear forward threat and visibly small starting force establish urgency and growth potential. This is a design inference. |
| Mob Control | Aimed troop multiplication, champions, enemy bases, moving gates and speed boosts | Inspected official store screenshot shows a launcher stream passing through a ×3 gate toward a large enemy with a numeric indicator | The aiming decision and timing moving gates can add a second tactical rhythm to runner combat. This is a design inference. |
| Count Masters | Gate selection, crowd arithmetic, obstacles, coin collection, increasing difficulty and a final king/castle confrontation | Official description emphasizes simple crowd growth and clashes | Use instantly readable operations and crowd-size feedback; avoid relying on arithmetic alone for long-term variety. |
| Last War | Lane survival, zombie waves, base development, hero branches and alliances | Official description separates lane action from broader progression | Distinct roles can deepen battle choices, but management should not displace the POC's battle loop. |

Sources: [Top Lords](https://play.google.com/store/apps/details?id=com.gamespark.topking.gp), [Mob Control](https://play.google.com/store/apps/details?id=com.vincentb.MobControl), [Count Masters](https://play.google.com/store/apps/details?id=freeplay.crowdrun.com), [Last War](https://play.google.com/store/apps/details?id=com.fun.lastwar.gp).

## Controls and urgency

Top Lords explicitly advertises swiping. Mob Control describes aiming through multiplication gates. Our original control design uses horizontal dragging while forward motion and attacks occur automatically; a separate large button controls the equipped relic. In siege mode the same dragging motion aims a launcher. A short transition explicitly announces the new objective.

Urgency should arise from approaching enemies, moving opportunities and telegraphed attacks. A choice should be visible long enough to read before committing. Start with approximately two seconds of useful warning, then test with first-time players. This timing is our proposed tuning, not a measurement from another game.

## Choices and feedback

Recruit gates increase army size; multiplier gates reward route choice; energy gates exchange immediate army growth for a future ability. Proposed placements sometimes make a smaller recruitment gate safer than a larger multiplier. No gate applies twice to the same formation or launch packet.

Show troop count, gate result, reserve and boss health clearly. Use shape and icons as well as faction color. Mechanical motion, muzzle flashes, hit reactions and bounded impact sounds provide urgency without screen-covering effects. The commander, elite and boss need distinct silhouettes at the actual portrait camera scale.

## Progression feedback

Top Lords reviews inspected on Google Play include reports of building upgrades limiting access to battles, while another published review praises the balance of battles and kingdom management. Mob Control and Count Masters reviews include complaints about advertisement interruption; a Mob Control review also describes late-game repetition. These reports do not establish prevalence or prove causality. They motivate testing immediate retries, encounter variety and predictable unlocks in our POC.

## Enemy roles and original additions

Rust Crawlers provide basic pressure. Arc Wardens introduce a protected front and EMP timing. Forge Colossus uses visible wind-up attacks and exposed recovery windows. Shield, EMP and Overdrive create survival, control and damage options. All are Mechalord proposals; we have not established that every equivalent mechanic is absent from the reference games.

## Feasibility and research limits

Large numeric armies do not require one expensive actor per logical troop. Instanced mechanical representatives and fixed-step logic separate combat arithmetic from visual density. This is an engineering approach to validate, not a proven performance result.

Unreal's low-overhead mobile tier disables Mobile HDR and uses unlit materials: [Epic mobile performance guidance](https://dev.epicgames.com/documentation/en-us/unreal-engine/performance-guidelines-for-mobile-devices-in-unreal-engine). Android setup must use the engine-matched SDK/NDK/JDK: [Epic Android setup](https://dev.epicgames.com/documentation/unreal-engine/android-quick-start).

Remaining evidence: real Android performance, repeated-play enjoyment, player comprehension, live-game progression timing and actual 3D topology. Do not cite promotional numbers as measured battle counts or frame rates.
# Asset production verification — 2026-10-04

The user's approved design references are the original three generated images, recorded in `assets/manifests/approved-references.json`. The locally authored Blender blockouts were rejected because they simplified the shapes and painted surface detail. They are experiments and must not be substituted for the required assets.

Meshy authentication succeeded with 100 credits. The first API creation request returned HTTP 402 `NoMorePendingTasks`, stating that task creation on Free is unsupported. No task was created; the balance remained 100. The user's 50-credit batch approval remains recorded; no subscription or credit purchase is authorized.

Meshy's official [Free-plan article](https://help.meshy.ai/en/articles/15696428-what-is-included-on-the-free-plan) confirms that API access requires a paid plan and lists ten monthly downloads for Meshy 6 Lite. Free outputs use CC BY 4.0. The website is signed in; Smart Topology with textures displays 15 credits, but selecting pose generation opens a subscription offer. Export entitlement for this T2 route must be verified before spending. No web generation was submitted.

The [image-to-3D guide](https://docs.meshy.ai/en/webapp/image-to-3d) identifies direct reference-image conversion and segmented Smart Topology as relevant routes. Conversion must preserve the selected art; hidden surfaces and animation joints still require inspection. to3D's current widget reports local upload unavailable in this client, requiring an image URL instead. The unchanged commander reference was uploaded through Meshy's image uploader to obtain a supported link; this did not start a Meshy generation task. The reference images were subsequently hosted on GitHub at the user's request. Both accessible image-link routes returned the same to3D generation error without a job ID, so changing image hosting alone did not resolve conversion.

The user supplied an existing Meshy commander model. The shared viewer shows an untextured 2,366,542-triangle source; the account also contains a textured version that was inspected. Its GLB download action opens a Pro subscription requirement. This is a confirmed export-access blocker, not an absence of geometry. Preserve that source instead of generating it again.

Blender's built-in [Mesh Plane operator](https://docs.blender.org/UATEST/manual/en/dev/modeling/meshes/import_images_as_planes.html) creates a flat image-textured plane, not a reconstructed character. The official [Meshy for Blender integration](https://www.meshy.ai/integrations/blender) transfers generated GLB/ZIP models, preserves materials and supplies cleanup tools; its DCC bridge requires Meshy Pro or above. Local Blender scripting can then edit, rig, animate and export the actual downloaded mesh. A free add-on installation does not remove the service's export entitlement requirement.
