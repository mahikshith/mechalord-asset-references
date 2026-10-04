"""Apply bounded workshop refinements, open its camera, observe one PIE test.

Executed in the real editor; the callback only measures live engine state.
It never starts play, changes physics outcomes, or changes gameplay state.
"""
from pathlib import Path
import json
import runpy
import traceback
import unreal as u

ROOT = Path(__file__).resolve().parents[1]
if "callback_handle" in globals():
    u.unregister_slate_post_tick_callback(callback_handle)
u.EditorPythonScripting.set_keep_python_script_alive(True)
for script in ("repair_unreal_artlab_placement.py", "refine_unreal_artlab_fx.py"):
    scope = runpy.run_path(str(ROOT / "tools" / script), run_name="__main__")
    if scope.get("REPORT", {}).get("status") == "failed":
        raise RuntimeError(script + ": " + scope["REPORT"].get("error", "See repair report"))

actors = u.get_editor_subsystem(u.EditorActorSubsystem)
level = u.get_editor_subsystem(u.LevelEditorSubsystem)
physics_settings = u.get_default_object(u.PhysicsSettings)
physics_settings.set_editor_property("substepping", True)
physics_settings.set_editor_property("max_substep_delta_time", 1 / 120)
physics_settings.set_editor_property("max_substeps", 8)
physics_settings.set_editor_property("max_physics_delta_time", 1 / 15)
for actor in actors.get_all_level_actors():
    if actor.get_actor_label() == "ArtLab_WorkshopKey":
        actor.light_component.set_intensity(3.0)
    elif actor.get_actor_label().startswith("ArtLab_WorkshopFill_"):
        actor.light_component.set_intensity(500)
    elif actor.get_actor_label().startswith("ArtLab_PhysicsDebris_"):
        actor.static_mesh_component.set_use_ccd(True)
        actor.static_mesh_component.set_linear_damping(2.0)
        actor.static_mesh_component.set_angular_damping(4.0)
ea = u.get_editor_subsystem(u.EditorAssetSubsystem)
surface = u.load_asset("/Game/MechalordArtLab/Materials/M_ArtLabSurface")
for material_name in ("PaintSteel", "PaintGunmetal", "PaintIvory", "PaintBronze"):
    material = u.load_asset("/Game/MechalordArtLab/Materials/MI_" + material_name)
    u.MaterialEditingLibrary.set_material_instance_parent(material, surface)
    ea.save_loaded_asset(material, only_if_is_dirty=False)
for character, strength in (("ForgeTyrant", 3.0), ("CinderReaver", 2.2), ("RustCrawler", 1.5)):
    material = u.load_asset("/Game/MechalordArtLab/Materials/MI_" + character + "_Paint_0")
    u.MaterialEditingLibrary.set_material_instance_vector_parameter_value(material, "Tint", u.LinearColor(strength, strength, strength, 1))
    ea.save_loaded_asset(material, only_if_is_dirty=False)
camera = next(a for a in actors.get_all_level_actors()
              if a.get_actor_label() == "ArtLab_PortraitInspectionCamera")
camera.set_actor_location(u.Vector(0, -950, 2050), False, True)
camera.set_actor_rotation(u.MathLibrary.find_look_at_rotation(camera.get_actor_location(), u.Vector(0, 850, 50)), False)
camera.get_component_by_class(u.CameraComponent).set_editor_property("field_of_view", 33)
level.pilot_level_actor(camera)
level.editor_set_game_view(True)
level.save_current_level()

report_path = ROOT / "builds/unreal-artlab-live-validation.json"
report = {"status": "waiting-for-PIE", "engine": u.SystemLibrary.get_engine_version(),
          "samples": [], "physicsPassed": False, "animationPassed": False,
          "nativeCombatConnected": False}
report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
state = {"elapsed": 0, "last": -1, "done": False}

def vector(v):
    return [float(v.x), float(v.y), float(v.z)]

def observation(actor):
    rotation = actor.get_actor_rotation()
    result = {"label": actor.get_actor_label(), "position": vector(actor.get_actor_location()),
              "rotation": [rotation.pitch, rotation.yaw, rotation.roll],
              "scale": vector(actor.get_actor_scale3d())}
    component = actor.get_component_by_class(u.StaticMeshComponent)
    if component:
        result["simulatingPhysics"] = bool(component.is_simulating_physics())
        result["velocity"] = vector(component.get_physics_linear_velocity())
    return result

def sample_tick(delta):
    if state["done"]:
        return
    try:
        world = u.get_editor_subsystem(u.UnrealEditorSubsystem).get_game_world()
        if not world:
            return
        elapsed = float(u.GameplayStatics.get_time_seconds(world))
        if elapsed - state["last"] < .24:
            return
        state["last"] = elapsed
        wanted = [a for a in u.GameplayStatics.get_all_actors_of_class(world, u.Actor)
                  if a.get_actor_label().startswith(("ArtLab_PhysicsDebris_", "ArtLab_HandCannonRotor_",
                     "ArtLab_TurbineRotor_", "ArtLab_Animation_ArmPivot_",
                     "ArtLab_Animation_BeamOuter_MuzzlePivot", "ArtLab_Animation_MuzzleCharge"))]
        report["samples"].append({"seconds": elapsed, "actors": [observation(a) for a in wanted]})
        if elapsed < 16.3:
            return
        by_label = {}
        for sample in report["samples"]:
            for actor in sample["actors"]:
                by_label.setdefault(actor["label"], []).append(actor)
        physics = []
        motions = []
        for label, frames in by_label.items():
            if label.startswith("ArtLab_PhysicsDebris_"):
                last = frames[-1]
                physics.append({"label": label, "startZ": frames[0]["position"][2],
                    "endZ": last["position"][2], "simulating": last["simulatingPhysics"],
                    "settled": sum(x*x for x in last["velocity"]) < 4,
                    "stayedAboveFloor": -12 < last["position"][2] < 60,
                    "fell": frames[0]["position"][2] - last["position"][2] > 20})
            else:
                spread = max(sum(abs(a-b) for a,b in zip(frame["rotation"]+frame["scale"], frames[0]["rotation"]+frames[0]["scale"])) for frame in frames)
                motions.append({"label": label, "motionObserved": spread > .05, "change": spread})
        report["physics"] = physics
        report["motion"] = motions
        report["physicsPassed"] = len(physics) == 6 and all(p["simulating"] and p["settled"] and p["stayedAboveFloor"] and p["fell"] for p in physics)
        report["animationPassed"] = len(motions) >= 13 and all(p["motionObserved"] for p in motions)
        report["status"] = "passed" if report["physicsPassed"] and report["animationPassed"] else "failed"
        state["done"] = True
        report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
        u.log("Mechalord live Art Lab validation: " + report["status"])
    except Exception:
        state["done"] = True
        report["status"] = "error"
        report["error"] = traceback.format_exc()
        report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
        u.log_error(report["error"])

callback_handle = u.register_slate_post_tick_callback(sample_tick)
u.log("Mechalord Art Lab open. Live observer will measure the next PIE session.")
