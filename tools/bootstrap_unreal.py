"""Run inside the compiled Mechalord Unreal editor, never in ordinary Python.

Creates the minimal Entry map, mobile unlit materials, faithful user-supplied
commander, and editable stage timelines. No network calls or generation services.
Set MECHALORD_EXPERIMENTAL_ART=1 to import the unapproved environment/troop kit.
Existing assets/maps are preserved unless they are explicitly generated here.
"""
from pathlib import Path
import json
import os
import unreal

ROOT = Path(__file__).resolve().parents[1]
REPORT_PATH = ROOT / "builds" / "unreal-bootstrap.json"
ASSETS = unreal.AssetToolsHelpers.get_asset_tools()
EDITOR_ASSETS = unreal.get_editor_subsystem(unreal.EditorAssetSubsystem)
LEVELS = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
EXPERIMENTAL_ART = os.environ.get("MECHALORD_EXPERIMENTAL_ART", "0") == "1"
REPORT = {"engine": unreal.SystemLibrary.get_engine_version(), "experimentalArt": EXPERIMENTAL_ART,
          "generated": [], "imports": [], "warnings": [], "status": "running",
          "artAccepted": False, "androidValidated": False}


def required(condition, message):
    if not condition:
        raise RuntimeError(message)


def asset_at(path):
    return unreal.load_asset(path) if EDITOR_ASSETS.does_asset_exist(path) else None


def save(asset):
    required(EDITOR_ASSETS.save_loaded_asset(asset, only_if_is_dirty=False),
             "Could not save " + asset.get_path_name())
    return asset


def create(name, folder, klass, factory):
    asset = asset_at(folder + "/" + name)
    if asset is None:
        EDITOR_ASSETS.make_directory(folder)
        asset = ASSETS.create_asset(name, folder, klass, factory)
        required(asset is not None, "Could not create " + folder + "/" + name)
        REPORT["generated"].append(asset.get_path_name())
    return asset


def import_file(source, folder, name, options=None):
    required(source.is_file(), "Missing local source: " + str(source))
    existing = asset_at(folder + "/" + name)
    if existing is not None:
        return existing, []
    EDITOR_ASSETS.make_directory(folder)
    task = unreal.AssetImportTask()
    task.set_editor_property("filename", str(source))
    task.set_editor_property("destination_path", folder)
    task.set_editor_property("destination_name", name)
    task.set_editor_property("automated", True)
    task.set_editor_property("replace_existing", False)
    task.set_editor_property("save", True)
    if options is not None:
        task.set_editor_property("options", options)
        # Explicit legacy FBX factory matches FbxImportUI and prevents the
        # Interchange default importer from silently ignoring these options.
        task.set_editor_property("factory", unreal.FbxFactory())
    ASSETS.import_asset_tasks([task])
    paths = list(task.get_editor_property("imported_object_paths"))
    imported = [unreal.load_asset(path) for path in paths]
    REPORT["imports"].append({"source": str(source.relative_to(ROOT)), "objects": paths})
    matching = asset_at(folder + "/" + name)
    required(matching is not None, "Import did not produce expected asset " + folder + "/" + name)
    return matching, [obj for obj in imported if obj is not None]


def fbx_options(skeletal=False, animations=False, skeleton=None, animation_only=False, animation_name=None):
    options = unreal.FbxImportUI()
    options.set_editor_property("automated_import_should_detect_type", False)
    options.set_editor_property("import_mesh", not animation_only)
    options.set_editor_property("import_as_skeletal", skeletal)
    options.set_editor_property("import_animations", animations)
    options.set_editor_property("import_materials", False)
    options.set_editor_property("import_textures", False)
    options.set_editor_property("create_physics_asset", False)
    options.set_editor_property("override_full_name", True)
    if animation_name is not None:
        options.set_editor_property("override_animation_name", animation_name)
    options.set_editor_property("mesh_type_to_import", unreal.FBXImportType.FBXIT_ANIMATION if animation_only
                                else unreal.FBXImportType.FBXIT_SKELETAL_MESH if skeletal
                                else unreal.FBXImportType.FBXIT_STATIC_MESH)
    if skeleton is not None:
        options.set_editor_property("skeleton", skeleton)
    mesh_options = options.get_editor_property("skeletal_mesh_import_data" if skeletal else "static_mesh_import_data")
    mesh_options.set_editor_property("convert_scene", True)
    mesh_options.set_editor_property("convert_scene_unit", True)
    mesh_options.set_editor_property("force_front_x_axis", False)
    if not skeletal:
        mesh_options.set_editor_property("combine_meshes", True)
        mesh_options.set_editor_property("auto_generate_collision", False)
    return options


def texture(source, name, maximum):
    tex, _ = import_file(source, "/Game/Mechalord/Base/Textures", name)
    required(isinstance(tex, unreal.Texture2D), "Texture import returned unexpected class")
    tex.set_editor_property("max_texture_size", maximum)
    tex.set_editor_property("srgb", True)
    return save(tex)


def unlit_material(name, texture_asset=None):
    folder = "/Game/Mechalord/Materials"
    existing = asset_at(folder + "/" + name)
    if existing is not None:
        return existing
    material = create(name, folder, unreal.Material, unreal.MaterialFactoryNew())
    material.set_editor_property("shading_model", unreal.MaterialShadingModel.MSM_UNLIT)
    if texture_asset is None:
        node = unreal.MaterialEditingLibrary.create_material_expression(material, unreal.MaterialExpressionVectorParameter, -320, 0)
        node.set_editor_property("parameter_name", "Tint")
        node.set_editor_property("default_value", unreal.LinearColor(0.5, 0.5, 0.5, 1))
    else:
        node = unreal.MaterialEditingLibrary.create_material_expression(material, unreal.MaterialExpressionTextureSample, -320, 0)
        node.set_editor_property("texture", texture_asset)
        node.set_editor_property("sampler_type", unreal.MaterialSamplerType.SAMPLERTYPE_COLOR)
    required(unreal.MaterialEditingLibrary.connect_material_property(node, "RGB" if texture_asset else "",
             unreal.MaterialProperty.MP_EMISSIVE_COLOR), "Could not connect unlit material")
    unreal.MaterialEditingLibrary.recompile_material(material)
    return save(material)


def set_mesh_material(mesh, material):
    # Sources have one baked material; no complex per-part material instances.
    if isinstance(mesh, unreal.SkeletalMesh):
        slots = list(mesh.get_editor_property("materials"))
        required(bool(slots), "Skeletal mesh has no material slots")
        slots[0].set_editor_property("material_interface", material)
        mesh.set_editor_property("materials", slots)
    else:
        mesh.set_material(0, material)
    save(mesh)


def rename_clip(animation, destination):
    existing = asset_at(destination)
    if existing is not None:
        return existing
    required(EDITOR_ASSETS.rename_asset(animation.get_path_name(), destination), "Animation rename failed: " + destination)
    return asset_at(destination)


def commander():
    folder = "/Game/Mechalord/Base/Characters"
    paint = texture(ROOT / "assets/textures/relic-marshal-hf-basecolor.png", "T_RelicMarshal_BaseColor", 1024)
    material = unlit_material("M_RelicMarshal_Painted", paint)
    source, _ = import_file(ROOT / "assets/exports/relic-marshal-hf-source.fbx", folder,
                            "SM_RelicMarshal_Source", fbx_options())
    set_mesh_material(source, material)
    # The faithful source is the default first visual slice; the mobile skeletal
    # candidate and its clips are imported separately for deformation review.
    try:
        mesh, objects = import_file(ROOT / "assets/exports/relic-marshal-hf-idle.fbx", folder,
                                    "SK_RelicMarshal", fbx_options(skeletal=True, animations=True, animation_name="AN_RelicMarshal_Idle"))
        required(isinstance(mesh, unreal.SkeletalMesh), "Expected skeletal commander candidate")
        set_mesh_material(mesh, material)
        idle_path = folder + "/AN_RelicMarshal_Idle"
        if asset_at(idle_path) is None:
            clips = [obj for obj in objects if isinstance(obj, unreal.AnimSequence)]
            # Allows an interrupted import to resume without another source import.
            if not clips:
                clips = [asset_at(path) for path in EDITOR_ASSETS.list_assets(folder, recursive=False)
                         if "SK_RelicMarshal" in path and isinstance(asset_at(path), unreal.AnimSequence)]
            required(bool(clips), "Commander idle import did not produce a clip")
            rename_clip(clips[0], idle_path)
        skeleton = mesh.get_editor_property("skeleton")
        import_file(ROOT / "assets/exports/relic-marshal-hf-run.fbx", folder, "AN_RelicMarshal_Run",
                    fbx_options(skeletal=True, animations=True, skeleton=skeleton, animation_only=True, animation_name="AN_RelicMarshal_Run"))
        REPORT["skeletalCandidateImported"] = True
    except Exception as error:
        # Skeletal review is independent of the first playable slice. Preserve
        # the successfully imported faithful source and make the failure visible.
        REPORT["skeletalCandidateImported"] = False
        REPORT["warnings"].append("Skeletal candidate import requires repair: " + str(error))
        unreal.log_warning(REPORT["warnings"][-1])
    REPORT["warnings"].append("Commander first-pass rig/UV/material orientation and animation deformation still require editor review. Default visual slice uses the higher-detail static source; enable bUseSkeletalCommander after review.")


def environment():
    module_paths = {}
    if not EXPERIMENTAL_ART:
        REPORT["warnings"].append("Rejected/unapproved experimental troop and environment visuals were not imported. Primitive arena meshes remain for mechanic validation.")
        return module_paths
    manifest = json.loads((ROOT / "assets/environment/manifests/environment-kit.json").read_text(encoding="utf-8"))
    palette = texture(ROOT / "assets/environment/textures/environment-palette.png", "T_Environment_Palette", 128)
    material = unlit_material("M_Environment_Painted", palette)
    for module in manifest["modules"]:
        folder = "/Game/Mechalord/Chapters/ForgeChapter/Environment" if module["id"] == "forge-core-plinth" else "/Game/Mechalord/Base/Environment"
        name = "SM_" + module["id"].replace("-", "_")
        mesh, _ = import_file(ROOT / "assets/environment" / module["fbx"], folder, name, fbx_options())
        set_mesh_material(mesh, material)
        module_paths[module["id"]] = mesh.get_path_name()
    for asset_id, name in [("gearling-sentinel", "GearlingSentinel"), ("rust-crawler", "RustCrawler")]:
        paint = texture(ROOT / f"assets/exports/{asset_id}-color-v2.png", f"T_{name}_BaseColor", 512)
        material = unlit_material(f"M_{name}_Painted", paint)
        mesh, _ = import_file(ROOT / f"assets/exports/{asset_id}-idle-v2.fbx", "/Game/Mechalord/Base/Characters",
                              "SM_" + name, fbx_options())
        set_mesh_material(mesh, material)
    return module_paths


def stage_data(module_paths):
    names = {"causeway": "RelicCauseway", "foundry": "FoundryApproach", "gatehouse": "GatehouseSiege",
             "storm": "StormPass", "forge": "ForgeCore"}
    stages = []
    for stage_id, name in names.items():
        source = json.loads((ROOT / f"assets/environment/layouts/{stage_id}.json").read_text(encoding="utf-8"))
        optional = source["chunkId"] != 0
        folder = "/Game/Mechalord/Chapters/ForgeChapter/Stages" if optional else "/Game/Mechalord/Stages"
        factory = unreal.DataAssetFactory()
        factory.set_editor_property("data_asset_class", unreal.MechalordStageDefinition)
        asset = create("DA_" + name, folder, unreal.MechalordStageDefinition, factory)
        asset.set_editor_property("stage_id", stage_id)
        asset.set_editor_property("display_name", unreal.Text(source["name"]))
        asset.set_editor_property("run_seconds", source["runSeconds"])
        asset.set_editor_property("siege_health", source["siegeHealth"])
        asset.set_editor_property("optional_chapter", optional)
        asset.set_editor_property("boss", source["boss"])
        asset.set_editor_property("reward", source["reward"])
        encounters = []
        for event in source["encounters"]:
            entry = unreal.MechalordEncounterDefinition()
            entry.set_editor_property("kind", unreal.MechalordEncounterKind.WAVE if event["kind"] == "wave"
                                      else unreal.MechalordEncounterKind.OBSTACLE if event["kind"] == "obstacle"
                                      else unreal.MechalordEncounterKind.GATE)
            entry.set_editor_property("at_seconds", event["atSeconds"])
            entry.set_editor_property("lane", event["laneNormalized"])
            entry.set_editor_property("width", event["widthNormalized"])
            entry.set_editor_property("value", event["value"])
            entry.set_editor_property("health", event["health"])
            entry.set_editor_property("threat", event["threat"])
            entry.set_editor_property("motion", event["motionAmplitudeNormalized"])
            operation = unreal.MechalordGateOperation.MULTIPLY if event["kind"] == "multiply" else unreal.MechalordGateOperation.ENERGY if event["kind"] == "energy" else unreal.MechalordGateOperation.RECRUIT
            entry.set_editor_property("operation", operation)
            encounters.append(entry)
        asset.set_editor_property("encounters", encounters)
        dressing = []

        def add_piece(module_id, position, siege=False):
            if module_id not in module_paths:
                return
            entry = unreal.MechalordDressingDefinition()
            entry.set_editor_property("mesh", asset_at(module_paths[module_id]))
            entry.set_editor_property("position_centimetres", unreal.Vector(*(float(v) * 100 for v in position)))
            entry.set_editor_property("siege_only", siege)
            entry.set_editor_property("narrow_route", module_id == "track-narrow")
            dressing.append(entry)

        for piece in source["dressing"]:
            add_piece(piece["module"], piece["positionMetres"])
        siege = source.get("siege")
        if siege:
            add_piece(siege["platform"], siege["platformOffsetMetres"], True)
            for piece in siege.get("defenseModules", []):
                add_piece(piece["module"], piece["positionMetres"], True)
            if siege["coreModule"] in module_paths:
                asset.set_editor_property("core_mesh", asset_at(module_paths[siege["coreModule"]]))
        if "track-straight" in module_paths:
            asset.set_editor_property("track_mesh", asset_at(module_paths["track-straight"]))
        asset.set_editor_property("dressing", dressing)
        stages.append(save(asset))
    return stages


def labels(stages):
    folder = "/Game/Mechalord/Labels"
    optional_assets = stages[3:]
    optional_assets.extend([asset_at(path) for path in EDITOR_ASSETS.list_assets("/Game/Mechalord/Chapters/ForgeChapter", recursive=True)
                            if asset_at(path) is not None])
    base_assets = stages[:3]
    for location in ["/Game/Mechalord/Base", "/Game/Mechalord/Materials"]:
        base_assets.extend([asset_at(path) for path in EDITOR_ASSETS.list_assets(location, recursive=True)
                            if asset_at(path) is not None])
    for name, chunk, objects, priority in [("PAL_Base", 0, base_assets, 10), ("PAL_ForgeChapter", 1001, optional_assets, 5)]:
        factory = unreal.DataAssetFactory()
        factory.set_editor_property("data_asset_class", unreal.PrimaryAssetLabel)
        label = create(name, folder, unreal.PrimaryAssetLabel, factory)
        rules = unreal.PrimaryAssetRules()
        rules.set_editor_property("chunk_id", chunk)
        rules.set_editor_property("priority", priority)
        rules.set_editor_property("apply_recursively", True)
        rules.set_editor_property("cook_rule", unreal.PrimaryAssetCookRule.ALWAYS_COOK)
        label.set_editor_property("rules", rules)
        label.set_editor_property("is_runtime_label", False)
        label.set_editor_property("label_assets_in_my_directory", False)
        unique = {obj.get_path_name(): obj for obj in objects}
        label.set_editor_property("explicit_assets", list(unique.values()))
        save(label)


def entry_map():
    path = "/Game/Mechalord/Maps/Entry"
    if EDITOR_ASSETS.does_asset_exist(path):
        required(LEVELS.load_level(path), "Could not open existing Entry map")
    else:
        EDITOR_ASSETS.make_directory("/Game/Mechalord/Maps")
        required(LEVELS.new_level(path), "Could not create Entry map")
        actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
        actors.spawn_actor_from_class(unreal.PlayerStart, unreal.Vector(0, 0, 0), unreal.Rotator(0, 0, 0))
        REPORT["generated"].append(path)
    required(LEVELS.save_current_level(), "Could not save Entry map")


try:
    required(hasattr(unreal, "MechalordStageDefinition"), "Build MechalordEditor before bootstrapping; native reflected classes are not loaded.")
    entry_map()
    unlit_material("M_Unlit")
    commander()
    modules = environment()
    stages = stage_data(modules)
    labels(stages)
    REPORT["status"] = "editor-assets-created"
    REPORT["warnings"].append("Play-in-editor, imported axis/scale/material checks, Android cooking, chunk placement, size and physical-device tests remain required.")
    unreal.log("Mechalord bootstrap saved Entry and five authored stage data assets. Choose Relic Causeway in Play to run the first gate encounter.")
except Exception as error:
    REPORT["status"] = "failed"
    REPORT["error"] = str(error)
    unreal.log_error("Mechalord bootstrap: " + str(error))
    raise
finally:
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(REPORT, indent=2), encoding="utf-8")
