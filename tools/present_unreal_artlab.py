"""Finish the separate weapon inspection bay and its saved close-up camera."""
import unreal as u

BASE = "/Game/MechalordArtLab"
actors = u.get_editor_subsystem(u.EditorActorSubsystem)
level = u.get_editor_subsystem(u.LevelEditorSubsystem)
by_label = {a.get_actor_label(): a for a in actors.get_all_level_actors()}
for beam_label in ("ArtLab_Animation_BeamOuter", "ArtLab_Animation_BeamCore"):
    beam = by_label[beam_label]
    beam.set_actor_rotation(u.Rotator(pitch=0, yaw=0, roll=-90), True)
    axis = beam.get_actor_up_vector()
    if abs(axis.y) < .999 or abs(axis.x) > .001 or abs(axis.z) > .001:
        raise RuntimeError("Beam cylinder must align with the cannon's Y axis")

def mesh(label, asset, position, scale, paint):
    actor = by_label.get(label)
    if actor is None:
        actor = actors.spawn_actor_from_class(u.StaticMeshActor, u.Vector(*position))
        actor.set_actor_label(label)
        actor.set_editor_property("tags", [u.Name("MechalordArtLabPresentation")])
        actor.set_folder_path(u.Name("MechalordArtLab/WeaponBay"))
    component = actor.static_mesh_component
    component.set_static_mesh(u.load_asset(BASE + "/Kit/SM_" + asset))
    component.set_material(0, u.load_asset(BASE + "/Materials/MI_" + paint))
    actor.set_actor_scale3d(u.Vector(*scale))
    return actor

mesh("ArtLab_WeaponBayFloor", "Deck_400x800", (-790, 120, -10), (.8, 1.5, 1), "FloorSlate")
mesh("ArtLab_WeaponBayCannonStand", "RailPost", (-700, -450, -10), (1.5, 1.5, .60), "PaintGunmetal")
camera = by_label.get("ArtLab_WeaponInspectionCamera")
if camera is None:
    camera = actors.spawn_actor_from_class(u.CameraActor, u.Vector())
    camera.set_actor_label("ArtLab_WeaponInspectionCamera")
    camera.set_editor_property("tags", [u.Name("MechalordArtLabPresentation")])
    camera.set_folder_path(u.Name("MechalordArtLab/Cameras"))
camera.set_actor_location(u.Vector(-1080, -890, 365), False, True)
camera.set_actor_rotation(u.MathLibrary.find_look_at_rotation(camera.get_actor_location(), u.Vector(-690, -270, 80)), False)
c = camera.get_component_by_class(u.CameraComponent)
c.set_editor_property("aspect_ratio", 16/9)
c.set_editor_property("constrain_aspect_ratio", True)
c.set_editor_property("field_of_view", 49)
# Match the reviewed portrait camera's exposure and restrained postprocessing.
portrait = by_label["ArtLab_PortraitInspectionCamera"].get_component_by_class(u.CameraComponent)
c.set_editor_property("post_process_settings", portrait.get_editor_property("post_process_settings"))
c.set_editor_property("post_process_blend_weight", 1)
fill = by_label.get("ArtLab_WeaponBayFill")
if fill is None:
    fill = actors.spawn_actor_from_class(u.DirectionalLight, u.Vector(0, 0, 800), u.Rotator(pitch=-30,yaw=110,roll=0))
    fill.set_actor_label("ArtLab_WeaponBayFill")
    fill.set_editor_property("tags", [u.Name("MechalordArtLabPresentation")])
fill.light_component.set_intensity(.8)
fill.light_component.set_cast_shadows(False)
fill.light_component.set_editor_property("forward_shading_priority", 0)
by_label["ArtLab_WorkshopKey"].light_component.set_editor_property("forward_shading_priority", 1)
level.pilot_level_actor(camera)
level.editor_set_game_view(True)
if not level.save_current_level():
    raise RuntimeError("Could not save weapon inspection bay")
u.log("Mechalord weapon inspection camera and supported cannon bay saved.")
