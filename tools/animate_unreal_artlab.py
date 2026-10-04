"""UE 5.8 editor Python: native workshop motion and mesh-beam demonstration.

Run after build_unreal_artlab.py. Saves a recovery map before changing actors.
No combat, Niagara, Blueprint, network calls, editor launch, or asset deletion.
"""
from pathlib import Path
from datetime import datetime, timezone
import json
import importlib.util
import traceback
import unreal as u

ROOT = Path(__file__).resolve().parents[1]
BASE = "/Game/MechalordArtLab"
MAP = BASE + "/Maps/L_ForgeWorkshop"
SEQUENCE = BASE + "/Animation/LS_WorkshopSystems"
TAG = "MechalordArtLabAnimationGenerated"
STAMP = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S_%f")
FPS, END = 30, 240
EA = u.get_editor_subsystem(u.EditorAssetSubsystem)
LEVEL = u.get_editor_subsystem(u.LevelEditorSubsystem)
ACT = u.get_editor_subsystem(u.EditorActorSubsystem)
TOOLS = u.AssetToolsHelpers.get_asset_tools()
REPORT_PATH = ROOT / "builds/unreal-artlab-animation.json"
REPORT = {"status": "running", "engine": u.SystemLibrary.get_engine_version(),
          "map": MAP, "sequence": SEQUENCE, "bindings": [], "originalActors": [],
          "warnings": [], "durationSeconds": 8, "autoPlay": False, "loop": False,
          "effectsRoute": "opaque emissive native mesh beam; not Niagara",
          "combatConnected": False, "pieValidated": False, "visualReviewPassed": False}


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def xyz(value):
    return [float(value.x), float(value.y), float(value.z)]


def original(actor):
    loc, rot = actor.get_actor_location(), actor.get_actor_rotation()
    REPORT["originalActors"].append({"path": actor.get_path_name(), "label": actor.get_actor_label(),
        "location": xyz(loc), "rotationPitchYawRoll": [rot.pitch, rot.yaw, rot.roll],
        "scale": xyz(actor.get_actor_scale3d()),
        "parent": actor.get_attach_parent_actor().get_path_name() if actor.get_attach_parent_actor() else None})


def owned_actor(label, location):
    full_label = "ArtLab_Animation_" + label
    found = [a for a in ACT.get_all_level_actors() if a.get_actor_label() == full_label]
    require(not found, "Animation actor already exists; preserved instead of replacing: " + full_label)
    actor = ACT.spawn_actor_from_class(u.StaticMeshActor, u.Vector(*location), u.Rotator())
    require(actor is not None, "Could not spawn " + label)
    actor.set_actor_label(full_label)
    actor.set_editor_property("tags", [u.Name(TAG)])
    actor.set_folder_path(u.Name("MechalordArtLab/Animation"))
    actor.static_mesh_component.set_mobility(u.ComponentMobility.MOVABLE)
    actor.static_mesh_component.set_collision_enabled(u.CollisionEnabled.NO_COLLISION)
    return actor


def beam_material(name, color):
    path = BASE + "/Materials/MI_" + name
    # Reuse the builder's existing unlit parameterised parent, per project skill.
    parent = u.load_asset(BASE + "/Materials/M_ArtLabUnlit")
    require(parent is not None, "Run the workshop builder first: unlit parent is missing")
    found = u.load_asset(path)
    if found:
        return found
    instance = TOOLS.create_asset("MI_" + name, BASE + "/Materials",
                                 u.MaterialInstanceConstant, u.MaterialInstanceConstantFactoryNew())
    require(instance is not None, "Could not create " + path)
    u.MaterialEditingLibrary.set_material_instance_parent(instance, parent)
    u.MaterialEditingLibrary.set_material_instance_vector_parameter_value(instance, "Tint", u.LinearColor(*color))
    require(EA.save_loaded_asset(instance, only_if_is_dirty=False), "Could not save " + path)
    return instance


def transform_section(sequence, actor, keys, explanation):
    actor.static_mesh_component.set_mobility(u.ComponentMobility.MOVABLE)
    binding = sequence.add_possessable(actor)
    binding.set_display_name(u.Text(actor.get_actor_label()))
    track = binding.add_track(u.MovieScene3DTransformTrack)
    section = track.add_section()
    section.set_range(0, END + 1)
    section.set_completion_mode(u.MovieSceneCompletionMode.RESTORE_STATE)
    channels = {str(c.get_editor_property("channel_name")): c for c in section.get_all_channels()}
    needed = ["Location.X", "Location.Y", "Location.Z", "Rotation.X", "Rotation.Y", "Rotation.Z",
              "Scale.X", "Scale.Y", "Scale.Z"]
    require(all(name in channels for name in needed), "Unexpected transform channel layout: " + str(list(channels)))
    require(actor.get_attach_parent_actor() is None, "Bind the unparented pivot, not its attached mesh")
    location, r, scale = actor.get_actor_location(), actor.get_actor_rotation(), actor.get_actor_scale3d()
    defaults = dict(zip(needed, [location.x, location.y, location.z,
        r.roll, r.pitch, r.yaw, scale.x, scale.y, scale.z]))
    for name, value in defaults.items():
        channels[name].set_default(float(value))
    for name, values in keys.items():
        require(name in channels, "Unknown channel " + name)
        for frame, value in values:
            channels[name].add_key(u.FrameNumber(int(frame)), float(value),
                interpolation=u.MovieSceneKeyInterpolation.LINEAR)
    REPORT["bindings"].append({"actor": actor.get_path_name(), "track": "3D transform",
                               "keys": keys, "purpose": explanation})


def mesh_actor(label, mesh, location, scale, material):
    actor = owned_actor(label, location)
    actor.static_mesh_component.set_static_mesh(mesh)
    actor.static_mesh_component.set_material(0, material)
    actor.set_actor_scale3d(u.Vector(*scale))
    return actor


try:
    require(hasattr(u, "MovieSceneScriptingDoubleChannel"),
            "Enable SequencerScripting in the ArtLab project before running this script")
    require(EA.does_asset_exist(MAP), "Workshop map is not built yet")
    require(not EA.does_asset_exist(SEQUENCE),
            "Existing workshop sequence preserved. Inspect it before running this one-time authoring script again.")
    require(LEVEL.load_level(MAP), "Could not load workshop map")
    require(LEVEL.save_current_level(), "Could not save the unchanged map before recovery copy")
    recovery = BASE + "/Recovery/L_ForgeWorkshop_BeforeAnimation_" + STAMP
    EA.make_directory(BASE + "/Recovery")
    backup = EA.duplicate_asset(MAP, recovery)
    require(backup is not None and EA.save_loaded_asset(backup, only_if_is_dirty=False), "Recovery map could not be saved")
    REPORT["recoveryMap"] = recovery
    actors = {a.get_actor_label(): a for a in ACT.get_all_level_actors()}
    rotor = actors.get("ArtLab_HandCannonRotor_Showcase")
    housing = actors.get("ArtLab_HandCannonHousing_Showcase")
    require(rotor is not None and housing is not None, "Cannon showcase is missing")
    for actor in (rotor, housing):
        original(actor)
        actor.static_mesh_component.set_mobility(u.ComponentMobility.MOVABLE)
        # Keep the +Y firing line outside the main road (road half-width 600cm).
        actor.set_actor_location(u.Vector(-700, -450, 80), False, True)
    REPORT["cannonBay"] = {"pivotCm": [-700, -450, 80], "barrelAxis": "local +Y",
                           "muzzleCm": [-700, -360, 80], "targetCm": [-700, 640, 80]}
    EA.make_directory(BASE + "/Animation")
    sequence = TOOLS.create_asset("LS_WorkshopSystems", BASE + "/Animation",
                                 u.LevelSequence, u.LevelSequenceFactoryNew())
    require(sequence is not None, "Could not create level sequence")
    sequence.set_display_rate(u.FrameRate(FPS, 1))
    sequence.set_playback_start(0)
    sequence.set_playback_end(END)
    transform_section(sequence, rotor, {"Rotation.Y": [(0, 0), (END, 2880)]},
                      "Cannon barrels rotate about their documented base pivot and local Y axis")
    turbines = sorted((a for label, a in actors.items() if label.startswith("ArtLab_TurbineRotor_")),
                      key=lambda actor: actor.get_actor_label())
    require(bool(turbines), "No turbine rotors found")
    for i, actor in enumerate(turbines):
        original(actor)
        direction = -1 if "_-1_" in actor.get_actor_label() else 1
        transform_section(sequence, actor, {"Rotation.Y": [(0, 0), (END, direction * (1440 + i % 3 * 360))]},
                          "Local Y-axis turbine rotation; no simulated physics")
    arms = sorted((a for label, a in actors.items() if label.startswith("ArtLab_MachineArmFore_")),
                  key=lambda actor: actor.get_actor_label())
    require(bool(arms), "No factory forearms found")
    for actor in arms:
        original(actor)
        side = actor.get_actor_label().rsplit("_", 1)[-1]
        pin = actors.get("ArtLab_MachineArmPivot_" + side)
        require(pin is not None, "Missing joint pin for " + side)
        pivot = owned_actor("ArmPivot_" + side, xyz(pin.get_actor_location()))
        actor.static_mesh_component.set_mobility(u.ComponentMobility.MOVABLE)
        require(actor.attach_to_actor(pivot, u.Name("None"), u.AttachmentRule.KEEP_WORLD,
                    u.AttachmentRule.KEEP_WORLD, u.AttachmentRule.KEEP_WORLD, False), "Could not attach forearm to joint pivot")
        angle = -1 if side == "-1" else 1
        transform_section(sequence, pivot, {"Rotation.Y": [(0, 0), (60, angle * 28), (120, 0),
                                                           (180, -angle * 22), (END, 0)]},
                          "Forearm swings about the existing joint pin, preserving its original world pose")
    cylinder = u.load_asset("/Engine/BasicShapes/Cylinder.Cylinder")
    sphere = u.load_asset("/Engine/BasicShapes/Sphere.Sphere")
    cube = u.load_asset("/Engine/BasicShapes/Cube.Cube")
    require(all((cylinder, sphere, cube)), "Engine primitive meshes unavailable")
    helper_path = ROOT / "tools/refine_unreal_artlab_fx.py"
    require(helper_path.is_file(), "Missing local beam-material helper")
    helper_spec = importlib.util.spec_from_file_location("mechalord_workshop_beam_materials", helper_path)
    helper = importlib.util.module_from_spec(helper_spec)
    helper_spec.loader.exec_module(helper)
    beam_paints = helper.beam_materials(REPORT)
    cyan = beam_paints["WorkshopBeamCharge"]
    shell = beam_paints["WorkshopBeamShell"]
    ivory = beam_paints["WorkshopBeamCore"]
    dark = u.load_asset(BASE + "/Materials/MI_PaintGunmetal") or cyan
    target = mesh_actor("BeamTargetDummy", cube, (-700, 640, 80), (.55, .3, 1.2), dark)
    REPORT["targetActor"] = target.get_path_name()
    # A StaticMeshActor's mesh is its root: changing the root relative location
    # would move the whole actor. Separate empty pivots anchor scaling at muzzle.
    pulse = [(0, .0001), (44, .0001), (45, .15), (48, 1), (62, 1), (66, .0001),
             (101, .0001), (102, .3), (106, 1), (119, 1), (123, .0001),
             (163, .0001), (164, .2), (168, 1), (182, 1), (187, .0001), (END, .0001)]
    for name, radius, paint in [("BeamOuter", .12, shell), ("BeamCore", .038, ivory)]:
        pivot = owned_actor(name + "_MuzzlePivot", (-700, -360, 80))
        actor = mesh_actor(name, cylinder, (-700, 140, 80), (radius, radius, 10), paint)
        actor.static_mesh_component.set_cast_shadow(False)
        actor.set_actor_rotation(u.Rotator(pitch=0, yaw=0, roll=-90), True)
        require(actor.attach_to_actor(pivot, u.Name("None"), u.AttachmentRule.KEEP_WORLD,
                    u.AttachmentRule.KEEP_WORLD, u.AttachmentRule.KEEP_WORLD, False), "Could not anchor beam to muzzle pivot")
        transform_section(sequence, pivot, {"Scale.X": pulse, "Scale.Y": pulse, "Scale.Z": pulse},
                          "Charge-and-pulse mesh beam, 1000cm reach anchored at the cannon muzzle")
    charge = mesh_actor("MuzzleCharge", sphere, (-700, -360, 80), (.0001, .0001, .0001), cyan)
    charge.static_mesh_component.set_cast_shadow(False)
    charge_keys = [(0, .0001), (16, .0001), (39, .22), (45, .32), (49, .10), (66, .0001),
                   (80, .0001), (102, .28), (108, .1), (123, .0001), (143, .0001),
                   (164, .32), (170, .1), (187, .0001), (END, .0001)]
    transform_section(sequence, charge, {axis: charge_keys for axis in ("Scale.X", "Scale.Y", "Scale.Z")},
                      "Visible cyan muzzle charge preceding each beam pulse")
    require(EA.save_loaded_asset(sequence, only_if_is_dirty=False), "Could not save workshop sequence")
    player = ACT.spawn_actor_from_class(u.LevelSequenceActor, u.Vector(), u.Rotator())
    require(player is not None, "Could not spawn sequence playback actor")
    player.set_actor_label("ArtLab_Animation_WorkshopPlayback")
    player.set_editor_property("tags", [u.Name(TAG)])
    player.set_folder_path(u.Name("MechalordArtLab/Animation"))
    player.set_sequence(sequence)
    settings = player.get_editor_property("playback_settings")
    settings.set_editor_property("auto_play", True)
    loop = u.MovieSceneSequenceLoopCount()
    loop.set_editor_property("value", -1)
    settings.set_editor_property("loop_count", loop)
    player.set_editor_property("playback_settings", settings)
    require(LEVEL.save_current_level(), "Could not save animated workshop map")
    REPORT.update(status="authored-not-playtested", autoPlay=True, loop=True,
                  playbackActor=player.get_path_name(), animatedTurbines=len(turbines), animatedArms=len(arms))
    REPORT["warnings"].append("Native mesh-beam visual demonstration only: no damage, targeting, collision, Niagara, or combat adapter is connected.")
    u.log("Mechalord workshop sequence saved; use PIE to review native motion and mesh beam.")
except Exception as error:
    REPORT["status"] = "failed"
    REPORT["error"] = str(error)
    REPORT["traceback"] = traceback.format_exc()
    u.log_error("Mechalord workshop animation: " + str(error))
    raise
finally:
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(REPORT, indent=2), encoding="utf-8")
