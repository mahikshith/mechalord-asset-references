"""Unreal editor script (run in the full editor): place the seven enemies in Lvl_FoundryDocks."""
import os
import traceback
import unreal

PROJECT = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())
LOG = os.path.join(PROJECT, 'Saved', 'IronPlace.log')
MAP = '/Game/IronLegion/Maps/Lvl_FoundryDocks'
BP = '/Game/IronLegion/Blueprints/Enemies/BP_Enemy_'
# name, x, feet z (cm). Lane top is z=0; catwalk deck 260; bunker roof 350.
PLACES = [
    ('QuadShell', -150, 0), ('Trilobite', 450, 0), ('Stan', 650, 0), ('EyeDrone', 150, 330),
    ('Leela', 950, 262), ('Mike', 1150, 0), ('George', 1450, 352),
]


def log(*a):
    with open(LOG, 'a', encoding='utf-8') as fh:
        fh.write(' '.join(str(x) for x in a) + '\n')


def main():
    if os.path.exists(LOG):
        os.remove(LOG)
    les = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
    les.load_level(MAP)
    actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
    for a in actors.get_all_level_actors():
        if a.get_actor_label().startswith('Enemy_'):
            actors.destroy_actor(a)
    for name, x, z in PLACES:
        cls = unreal.EditorAssetLibrary.load_blueprint_class(BP + name)
        cdo = unreal.get_default_object(cls)
        half = cdo.get_editor_property('capsule_component').get_editor_property('capsule_half_height')
        a = actors.spawn_actor_from_class(cls, unreal.Vector(x, 0, z + half + 2), unreal.Rotator(roll=0.0, pitch=0.0, yaw=180.0))
        a.set_actor_label('Enemy_' + name)
        log('placed', name, x, z, half)
    les.save_current_level()
    log('DONE')


try:
    main()
except Exception:
    log('FAILED', traceback.format_exc())
if os.environ.get('IRON_QUIT_EDITOR'):
    unreal.SystemLibrary.quit_editor()
