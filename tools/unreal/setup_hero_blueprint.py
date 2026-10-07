"""Unreal editor script: BP_IronTrooper = the template's side-scrolling character
blueprint reparented onto AIronTrooper, wearing the Iron hero mesh and the
retargeted side-scroller anim blueprint; the side-scrolling game mode spawns it.

Run: UnrealEditor-Cmd.exe SideAssault.uproject -run=pythonscript -script=<this> -unattended -nosplash
"""
import os
import traceback
import unreal

PROJECT = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())
LOG = os.path.join(PROJECT, 'Saved', 'IronBlueprint.log')
eal = unreal.EditorAssetLibrary
bel = unreal.BlueprintEditorLibrary
SRC_BP = '/Game/Variant_SideScrolling/Blueprints/BP_SideScrollingCharacter'
DST_BP = '/Game/IronLegion/Blueprints/BP_IronTrooper'
MESH = '/Game/IronLegion/Characters/Hero/SK_Iron_Military'
ABP = '/Game/IronLegion/Characters/Hero/Anims/ABP_Manny_SideScroller_Iron'
GM = '/Game/Variant_SideScrolling/Blueprints/BP_SideScrollingGameMode'


def log(*a):
    with open(LOG, 'a', encoding='utf-8') as fh:
        fh.write(' '.join(str(x) for x in a) + '\n')


def main():
    if os.path.exists(LOG):
        os.remove(LOG)
    bp = eal.load_asset(DST_BP) if eal.does_asset_exist(DST_BP) else eal.duplicate_asset(SRC_BP, DST_BP)
    log('bp', bp)
    parent = unreal.load_class(None, '/Script/SideAssault.IronTrooper')
    bel.reparent_blueprint(bp, parent)
    bel.compile_blueprint(bp)
    gen = bel.generated_class(bp)
    cdo = unreal.get_default_object(gen)
    mesh_comp = cdo.get_editor_property('mesh')
    mesh_comp.set_editor_property('skeletal_mesh_asset', eal.load_asset(MESH))
    # native C++ anim instance (IronAnimInstance) replaces the retargeted template graph
    mesh_comp.set_editor_property('anim_class', unreal.load_class(None, '/Script/SideAssault.IronAnimInstance'))
    mesh_comp.set_editor_property('animation_mode', unreal.AnimationMode.ANIMATION_BLUEPRINT)
    log('mesh', mesh_comp.get_editor_property('skeletal_mesh_asset'), 'anim', mesh_comp.get_editor_property('anim_class'))
    mesh_comp.set_editor_property('relative_rotation', unreal.Rotator(roll=0.0, pitch=0.0, yaw=-90.0))
    log('mesh transform', mesh_comp.get_editor_property('relative_location'), mesh_comp.get_editor_property('relative_rotation'))
    bel.compile_blueprint(bp)
    eal.save_loaded_asset(bp)
    gm = eal.load_asset(GM)
    gm_cdo = unreal.get_default_object(bel.generated_class(gm))
    gm_cdo.set_editor_property('default_pawn_class', bel.generated_class(bp))
    bel.compile_blueprint(gm)
    eal.save_loaded_asset(gm)
    log('DONE pawn', gm_cdo.get_editor_property('default_pawn_class'))


try:
    main()
except Exception:
    log('FAILED', traceback.format_exc())
