"""Unreal editor script: make sure the hero mesh wears M_IronHero, and turn the
rifle aim-offset key poses into plain (non-additive) poses so the native
animation instance can build its own up/down aim deltas from them."""
import os
import traceback
import unreal

PROJECT = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())
LOG = os.path.join(PROJECT, 'Saved', 'IronFixup.log')
eal = unreal.EditorAssetLibrary
H = '/Game/IronLegion/Characters/Hero'


def log(*a):
    with open(LOG, 'a', encoding='utf-8') as fh:
        fh.write(' '.join(str(x) for x in a) + '\n')


def main():
    if os.path.exists(LOG):
        os.remove(LOG)
    mesh = eal.load_asset(H + '/SK_Iron_Military')
    mat = eal.load_asset(H + '/M_IronHero')
    mats = mesh.get_editor_property('materials')
    log('slots before', [(str(m.get_editor_property('material_slot_name')), m.get_editor_property('material_interface')) for m in mats])
    new = []
    for m in mats:
        m.set_editor_property('material_interface', mat)
        new.append(m)
    mesh.set_editor_property('materials', new)
    eal.save_loaded_asset(mesh)
    log('slots after', [m.get_editor_property('material_interface') for m in mesh.get_editor_property('materials')])
    for n in ('CU', 'CC', 'CD'):
        seq = eal.load_asset(f'{H}/Anims/MM_Rifle_Idle_ADS_AO_{n}_Iron')
        log(n, 'additive was', seq.get_editor_property('additive_anim_type'))
        seq.set_editor_property('additive_anim_type', unreal.AdditiveAnimationType.AAT_NONE)
        eal.save_loaded_asset(seq)
    log('DONE')


try:
    main()
except Exception:
    log('FAILED', traceback.format_exc())
