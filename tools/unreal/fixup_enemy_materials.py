"""Unreal editor script: assign each enemy's MI_<Name> to every skeletal mesh part
(slot assignment made in the import session does not stick) and set the faction paint."""
import os
import traceback
import unreal

PROJECT = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())
LOG = os.path.join(PROJECT, 'Saved', 'IronEnemyMats.log')
ROOT = '/Game/IronLegion/Characters/Enemies'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
NAMES = ('George', 'Mike', 'Stan', 'Leela', 'EyeDrone', 'QuadShell', 'Trilobite')
# how strongly each machine is pulled into Tyrant red (the silver sci-fi drones need more)
FACTION = {'EyeDrone': 0.8, 'QuadShell': 0.8, 'Trilobite': 0.8}


def log(*a):
    with open(LOG, 'a', encoding='utf-8') as fh:
        fh.write(' '.join(str(x) for x in a) + '\n')


def main():
    if os.path.exists(LOG):
        os.remove(LOG)
    for n in NAMES:
        mi = eal.load_asset(f'{ROOT}/{n}/MI_{n}')
        mel.set_material_instance_scalar_parameter_value(mi, 'FactionAmount', FACTION.get(n, 0.65))
        mel.set_material_instance_scalar_parameter_value(mi, 'Metallic', 0.4)
        eal.save_loaded_asset(mi)
        bp = eal.load_asset(f'/Game/IronLegion/Blueprints/Enemies/BP_Enemy_{n}')
        cdo = unreal.get_default_object(unreal.BlueprintEditorLibrary.generated_class(bp))
        # the sci-fi drones and crawlers keep their own colours; only the mechs wear Tyrant paint
        cdo.set_editor_property('paint_material', None if n in FACTION else mi)
        unreal.BlueprintEditorLibrary.compile_blueprint(bp)
        eal.save_loaded_asset(bp)
        log(n, 'paint', cdo.get_editor_property('paint_material'))
        for p in eal.list_assets(f'{ROOT}/{n}', recursive=True, include_folder=False):
            a = eal.load_asset(p)
            if isinstance(a, unreal.SkeletalMesh):
                slots = a.get_editor_property('materials')
                for s in slots:
                    s.set_editor_property('material_interface', mi)
                a.set_editor_property('materials', slots)
                eal.save_loaded_asset(a)
                log(n, a.get_name(), [str(s.get_editor_property('material_interface').get_name()) for s in a.get_editor_property('materials')])
    log('DONE')


try:
    main()
except Exception:
    log('FAILED', traceback.format_exc())
