"""Unreal editor script: look fixes from the user's review.
- hero armour less brassy: scale metalness down and roughen slightly in M_IronHero
- mech Tyrant paint: deeper crimson, less pink
- Leela idle: use the upright armature idle instead of the crouched one
"""
import os
import traceback
import unreal

PROJECT = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())
LOG = os.path.join(PROJECT, 'Saved', 'IronLookV2.log')
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
bel = unreal.BlueprintEditorLibrary


def log(*a):
    with open(LOG, 'a', encoding='utf-8') as fh:
        fh.write(' '.join(str(x) for x in a) + '\n')


def hero_material():
    m = eal.load_asset('/Game/IronLegion/Characters/Hero/M_IronHero')
    if 'MetalScale' in [str(n) for n in mel.get_scalar_parameter_names(m)]:
        log('hero material already adjusted')
        return
    metal_src = mel.get_material_property_input_node(m, unreal.MaterialProperty.MP_METALLIC)
    rough_src = mel.get_material_property_input_node(m, unreal.MaterialProperty.MP_ROUGHNESS)
    ms = mel.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -300, 300)
    ms.set_editor_property('parameter_name', 'MetalScale')
    ms.set_editor_property('default_value', 0.4)
    mm = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -150, 300)
    mel.connect_material_expressions(metal_src, 'B', mm, 'A')
    mel.connect_material_expressions(ms, '', mm, 'B')
    mel.connect_material_property(mm, '', unreal.MaterialProperty.MP_METALLIC)
    ra = mel.create_material_expression(m, unreal.MaterialExpressionAdd, -150, 450)
    ra.set_editor_property('const_b', 0.12)
    mel.connect_material_expressions(rough_src, 'G', ra, 'A')
    mel.connect_material_property(ra, '', unreal.MaterialProperty.MP_ROUGHNESS)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    log('hero material: metal x0.4, rough +0.12')


def mech_paint():
    for n in ('George', 'Mike', 'Stan', 'Leela'):
        mi = eal.load_asset(f'/Game/IronLegion/Characters/Enemies/{n}/MI_{n}')
        mel.set_material_instance_vector_parameter_value(mi, 'FactionColor', unreal.LinearColor(0.26, 0.035, 0.025, 1))
        mel.set_material_instance_scalar_parameter_value(mi, 'FactionAmount', 0.55)
        mel.set_material_instance_scalar_parameter_value(mi, 'Roughness', 0.55)
        eal.save_loaded_asset(mi)
    log('mech paint: deeper crimson')


def leela_idle():
    bp = eal.load_asset('/Game/IronLegion/Blueprints/Enemies/BP_Enemy_Leela')
    cdo = unreal.get_default_object(bel.generated_class(bp))
    idle = eal.load_asset('/Game/IronLegion/Characters/Enemies/Leela/LeelaRobotArmature_Idle')
    walk = eal.load_asset('/Game/IronLegion/Characters/Enemies/Leela/LeelaRobotArmature_Walk')
    if idle:
        cdo.set_editor_property('anim_idle', idle)
    if walk:
        cdo.set_editor_property('anim_move', walk)
    bel.compile_blueprint(bp)
    eal.save_loaded_asset(bp)
    log('leela idle', cdo.get_editor_property('anim_idle'))


try:
    if os.path.exists(LOG):
        os.remove(LOG)
    for step in (hero_material, mech_paint, leela_idle):
        try:
            step()
        except Exception:
            log('FAILED', step.__name__, traceback.format_exc())
    log('DONE')
except Exception:
    log('FAILED', traceback.format_exc())
