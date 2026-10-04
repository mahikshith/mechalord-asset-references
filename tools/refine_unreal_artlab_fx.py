"""UE editor Python: refine only script-owned workshop mesh-beam materials.

Also supplies beam_materials() to the one-time animation authoring script.
No editor launch, base-mesh slot edits, lighting edits, or combat implementation.
"""
from pathlib import Path
from datetime import datetime, timezone
import json
import traceback
import unreal as u

ROOT = Path(__file__).resolve().parents[1]
BASE = "/Game/MechalordArtLab"
MAP = BASE + "/Maps/L_ForgeWorkshop"


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def beam_materials(report):
    ea = u.get_editor_subsystem(u.EditorAssetSubsystem)
    tools = u.AssetToolsHelpers.get_asset_tools()
    folder = BASE + "/Materials"
    report["materialSearch"] = list(ea.list_assets(folder, recursive=True))
    unlit = u.load_asset(folder + "/M_ArtLabUnlit")
    require(unlit is not None, "Builder's existing unlit parent is missing")
    shell_path = folder + "/M_WorkshopBeamShell"
    shell = u.load_asset(shell_path)
    if shell is None:
        # The existing builder parent is opaque and would hide the ivory core.
        # A tiny parameter-only additive parent needs no new MaterialFunction.
        shell = tools.create_asset("M_WorkshopBeamShell", folder, u.Material, u.MaterialFactoryNew())
        require(shell is not None, "Could not create additive beam-shell material")
        shell.set_editor_property("shading_model", u.MaterialShadingModel.MSM_UNLIT)
        shell.set_editor_property("blend_mode", u.BlendMode.BLEND_ADDITIVE)
        shell.set_editor_property("two_sided", True)
        tint = u.MaterialEditingLibrary.create_material_expression(shell, u.MaterialExpressionVectorParameter, -320, 0)
        tint.set_editor_property("parameter_name", "Tint")
        tint.set_editor_property("group", "Beam")
        tint.set_editor_property("default_value", u.LinearColor(.025, .50, .65, 1))
        opacity = u.MaterialEditingLibrary.create_material_expression(shell, u.MaterialExpressionScalarParameter, -320, 180)
        opacity.set_editor_property("parameter_name", "Opacity")
        opacity.set_editor_property("group", "Beam")
        opacity.set_editor_property("default_value", .32)
        require(u.MaterialEditingLibrary.connect_material_property(tint, "", u.MaterialProperty.MP_EMISSIVE_COLOR), "Could not connect beam tint")
        require(u.MaterialEditingLibrary.connect_material_property(opacity, "", u.MaterialProperty.MP_OPACITY), "Could not connect shell opacity")
        u.MaterialEditingLibrary.recompile_material(shell)
        require(ea.save_loaded_asset(shell, only_if_is_dirty=False), "Could not save beam-shell parent")
    require(shell.get_editor_property("blend_mode") == u.BlendMode.BLEND_ADDITIVE,
            "Existing shell parent is not additive; preserved instead of modifying an unrelated material")
    configs = [("WorkshopBeamShell", shell, (.025, .50, .65, 1)),
               ("WorkshopBeamCore", unlit, (1.0, .92, .72, 1)),
               ("WorkshopBeamCharge", unlit, (.015, .70, .88, 1))]
    result = {}
    for name, parent, tint in configs:
        path = folder + "/MI_" + name
        material = u.load_asset(path)
        if material is None:
            material = tools.create_asset("MI_" + name, folder, u.MaterialInstanceConstant,
                                          u.MaterialInstanceConstantFactoryNew())
            require(material is not None, "Could not create " + path)
            u.MaterialEditingLibrary.set_material_instance_parent(material, parent)
            u.MaterialEditingLibrary.set_material_instance_vector_parameter_value(material, "Tint", u.LinearColor(*tint))
            if name == "WorkshopBeamShell":
                u.MaterialEditingLibrary.set_material_instance_scalar_parameter_value(material, "Opacity", .32)
            require(ea.save_loaded_asset(material, only_if_is_dirty=False), "Could not save " + path)
        # Reusing preserves any user adjustment to these dedicated instances.
        result[name] = material
        report.setdefault("materials", []).append({"asset": material.get_path_name(),
            "expectedParent": parent.get_path_name(), "defaultTintRGBA": tint,
            "role": "additive outer shell" if name == "WorkshopBeamShell" else "opaque unlit core/charge"})
    return result


def main():
    report_path = ROOT / "builds/unreal-artlab-fx-refinement.json"
    report = {"status": "running", "engine": u.SystemLibrary.get_engine_version(), "map": MAP,
              "changes": [], "combatConnected": False, "pieValidated": False,
              "visualReviewPassed": False, "baseMeshMaterialSlotsModified": False,
              "route": "native cylinder/sphere meshes; additive shell plus opaque ivory core"}
    try:
        ea = u.get_editor_subsystem(u.EditorAssetSubsystem)
        level = u.get_editor_subsystem(u.LevelEditorSubsystem)
        actors = u.get_editor_subsystem(u.EditorActorSubsystem)
        require(ea.does_asset_exist(MAP) and level.load_level(MAP), "Animated workshop map is missing")
        require(level.save_current_level(), "Could not save original map before recovery")
        stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S_%f")
        recovery = BASE + "/Recovery/L_ForgeWorkshop_BeforeBeamRefine_" + stamp
        ea.make_directory(BASE + "/Recovery")
        backup = ea.duplicate_asset(MAP, recovery)
        require(backup is not None and ea.save_loaded_asset(backup, only_if_is_dirty=False), "Could not preserve recovery map")
        report["recoveryMap"] = recovery
        by_label = {a.get_actor_label(): a for a in actors.get_all_level_actors()}
        roles = {"BeamOuter": "WorkshopBeamShell", "BeamCore": "WorkshopBeamCore", "MuzzleCharge": "WorkshopBeamCharge"}
        for actor_name in roles:
            require("ArtLab_Animation_" + actor_name in by_label, "Missing animation actor " + actor_name)
        materials = beam_materials(report)
        for actor_name, material_name in roles.items():
            actor = by_label["ArtLab_Animation_" + actor_name]
            require(u.Name("MechalordArtLabAnimationGenerated") in actor.get_editor_property("tags"), "Actor ownership mismatch: " + actor_name)
            component = actor.static_mesh_component
            original = component.get_material(0)
            component.set_material(0, materials[material_name])
            component.set_cast_shadow(False)
            report["changes"].append({"actor": actor.get_path_name(), "slot": 0,
                                     "originalMaterial": original.get_path_name() if original else None,
                                     "newMaterial": materials[material_name].get_path_name()})
        require(level.save_current_level(), "Could not save beam refinement")
        report["status"] = "refined-not-playtested"
        report["warnings"] = ["PIE visual review remains required. This beam does not deal damage or implement native combat.",
                              "Only component slot zero overrides change; imported/base mesh slots and original parent materials remain untouched."]
        u.log("Mechalord mesh-beam shell refined; ivory core is no longer behind an opaque outer surface.")
    except Exception as error:
        report.update(status="failed", error=str(error), traceback=traceback.format_exc())
        u.log_error("Mechalord beam refinement: " + str(error))
        raise
    finally:
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
