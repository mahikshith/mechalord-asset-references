"""Unreal editor script: import the Iron Legion hero (Irondust soldier), build
its material, IK rigs and a retargeter from the UE5 mannequin, then duplicate
and retarget the side-scroller anim blueprint plus the rifle/hit/death sets.

Run: UnrealEditor-Cmd.exe SideAssault.uproject -run=pythonscript -script=<this> -unattended -nosplash
Writes a log next to this file's output folder (Saved/IronImport.log).
"""
import os
import traceback
import unreal

PROJECT = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())
SRC = os.path.join(PROJECT, 'Import', 'Soldier')
DEST = '/Game/IronLegion/Characters/Hero'
ANIM_DEST = '/Game/IronLegion/Characters/Hero/Anims'
LOG = os.path.join(PROJECT, 'Saved', 'IronImport.log')
NAME = 'SK_Iron_Military'
tools = unreal.AssetToolsHelpers.get_asset_tools()
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary


def log(*a):
    with open(LOG, 'a', encoding='utf-8') as fh:
        fh.write(' '.join(str(x) for x in a) + '\n')


def import_task(filename, dest, options=None, name=None):
    t = unreal.AssetImportTask()
    t.filename = filename
    t.destination_path = dest
    t.automated = True
    t.replace_existing = True
    t.save = True
    if name:
        t.destination_name = name
    if options:
        t.options = options
    tools.import_asset_tasks([t])
    return [eal.load_asset(p) for p in t.imported_object_paths]


def import_mesh():
    ui = unreal.FbxImportUI()
    ui.import_mesh = True
    ui.import_as_skeletal = True
    ui.import_materials = False
    ui.import_textures = False
    ui.import_animations = False
    ui.create_physics_asset = True
    ui.mesh_type_to_import = unreal.FBXImportType.FBXIT_SKELETAL_MESH
    sk = ui.skeletal_mesh_import_data
    sk.set_editor_property('import_morph_targets', False)
    sk.set_editor_property('convert_scene', True)
    sk.set_editor_property('use_t0_as_ref_pose', False)
    objs = import_task(os.path.join(SRC, NAME + '.fbx'), DEST, ui)
    mesh = next(o for o in objs if isinstance(o, unreal.SkeletalMesh))
    log('mesh', mesh.get_path_name())
    return mesh


def import_textures():
    tex = {}
    for kind in ('BaseColor', 'ORM', 'Normal', 'Emissive'):
        f = os.path.join(SRC, f'T_{NAME}_{kind}.png')
        t = import_task(f, DEST + '/Textures')[0]
        if kind in ('ORM',):
            t.set_editor_property('srgb', False)
            t.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_MASKS)
        if kind == 'Normal':
            t.set_editor_property('srgb', False)
            t.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_NORMALMAP)
        eal.save_loaded_asset(t)
        tex[kind] = t
    return tex


def build_material(tex):
    path = DEST + '/M_IronHero'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset('M_IronHero', DEST, unreal.Material, unreal.MaterialFactoryNew())

    def sample(name, t, x, y, sampler):
        n = mel.create_material_expression(m, unreal.MaterialExpressionTextureSampleParameter2D, x, y)
        n.set_editor_property('parameter_name', name)
        n.set_editor_property('texture', t)
        n.set_editor_property('sampler_type', sampler)
        return n
    bc = sample('BaseColor', tex['BaseColor'], -600, -200, unreal.MaterialSamplerType.SAMPLERTYPE_COLOR)
    orm = sample('ORM', tex['ORM'], -600, 100, unreal.MaterialSamplerType.SAMPLERTYPE_MASKS)
    nm = sample('Normal', tex['Normal'], -600, 400, unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL)
    em = sample('Emissive', tex['Emissive'], -600, 700, unreal.MaterialSamplerType.SAMPLERTYPE_COLOR)
    tint = mel.create_material_expression(m, unreal.MaterialExpressionVectorParameter, -900, -200)
    tint.set_editor_property('parameter_name', 'Tint')
    tint.set_editor_property('default_value', unreal.LinearColor(1, 1, 1, 1))
    mul = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -300, -200)
    mel.connect_material_expressions(bc, 'RGB', mul, 'A')
    mel.connect_material_expressions(tint, '', mul, 'B')
    glow = mel.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -900, 700)
    glow.set_editor_property('parameter_name', 'EmissiveBoost')
    glow.set_editor_property('default_value', 6.0)
    emul = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -300, 700)
    mel.connect_material_expressions(em, 'RGB', emul, 'A')
    mel.connect_material_expressions(glow, '', emul, 'B')
    # hit flash: a scalar the trooper drives through a dynamic instance
    flash = mel.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -900, 950)
    flash.set_editor_property('parameter_name', 'HitFlash')
    flash.set_editor_property('default_value', 0.0)
    add = mel.create_material_expression(m, unreal.MaterialExpressionAdd, -100, 750)
    mel.connect_material_expressions(emul, '', add, 'A')
    fl = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -300, 950)
    mel.connect_material_expressions(flash, '', fl, 'A')
    fl.set_editor_property('const_b', 3.0)
    mel.connect_material_expressions(fl, '', add, 'B')
    mel.connect_material_property(mul, '', unreal.MaterialProperty.MP_BASE_COLOR)
    mel.connect_material_property(orm, 'R', unreal.MaterialProperty.MP_AMBIENT_OCCLUSION)
    mel.connect_material_property(orm, 'G', unreal.MaterialProperty.MP_ROUGHNESS)
    mel.connect_material_property(orm, 'B', unreal.MaterialProperty.MP_METALLIC)
    mel.connect_material_property(nm, 'RGB', unreal.MaterialProperty.MP_NORMAL)
    mel.connect_material_property(add, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
    mel.set_material_usage(m, unreal.MaterialUsage.MATUSAGE_SKELETAL_MESH) if hasattr(mel, 'set_material_usage') else None
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    log('material', m.get_path_name())
    return m


def make_ik_rig(name, mesh, folder):
    path = f'{folder}/{name}'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    rig = tools.create_asset(name, folder, unreal.IKRigDefinition, unreal.IKRigDefinitionFactory())
    c = unreal.IKRigController.get_controller(rig)
    c.set_skeletal_mesh(mesh)
    ok = c.apply_auto_generated_retarget_definition()
    names = [str(ch.chain_name) for ch in c.get_retarget_chains()]
    if 'Spine' not in names and mesh.get_name().startswith('SK_Iron'):
        # rigify-style names (spine/chest/neck/head) are not auto-detected; add the torso chains by hand
        c.add_retarget_chain('Spine', 'spine', 'chest', '')
        c.add_retarget_chain('Neck', 'neck', 'neck', '')
        c.add_retarget_chain('Head', 'head', 'head', '')
        c.set_retarget_root('hips')
    log('ik rig', name, 'auto definition', ok, 'chains', [str(ch.chain_name) for ch in c.get_retarget_chains()])
    try:
        c.apply_auto_fbik()
    except Exception as e:
        log('auto fbik failed', e)
    eal.save_loaded_asset(rig)
    return rig


def make_retargeter(src_rig, tgt_rig, src_mesh, tgt_mesh):
    path = DEST + '/RTG_Manny_To_IronHero'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    rtg = tools.create_asset('RTG_Manny_To_IronHero', DEST, unreal.IKRetargeter, unreal.IKRetargetFactory())
    rc = unreal.IKRetargeterController.get_controller(rtg)
    rc.set_ik_rig(unreal.RetargetSourceOrTarget.SOURCE, src_rig)
    rc.set_ik_rig(unreal.RetargetSourceOrTarget.TARGET, tgt_rig)
    try:
        rc.set_preview_mesh(unreal.RetargetSourceOrTarget.SOURCE, src_mesh)
        rc.set_preview_mesh(unreal.RetargetSourceOrTarget.TARGET, tgt_mesh)
    except Exception as e:
        log('preview mesh', e)
    try:
        rc.add_default_ops()
        rc.assign_ik_rig_to_all_ops(unreal.RetargetSourceOrTarget.TARGET, tgt_rig)
    except Exception as e:
        log('default ops', e)
    try:
        rc.auto_map_chains(unreal.AutoMapChainType.FUZZY, True)
    except Exception as e:
        log('auto map', e)
    # the soldier is authored in a T-pose; Manny animates from an A-pose. Align the target pose to the source.
    try:
        rc.create_retarget_pose('IronAligned', unreal.RetargetSourceOrTarget.TARGET)
        rc.auto_align_all_bones(unreal.RetargetSourceOrTarget.TARGET)
        log('aligned target pose')
    except Exception as e:
        log('auto align failed', e)
    eal.save_loaded_asset(rtg)
    return rtg


def retarget(rtg, src_mesh, tgt_mesh):
    roots = [
        '/Game/Variant_SideScrolling/Anims/ABP_Manny_SideScroller',
        '/Game/Characters/Mannequins/Anims/Rifle',
        '/Game/Characters/Mannequins/Anims/Death',
        '/Game/Characters/Mannequins/Anims/Unarmed/Attack',
    ]
    reg = unreal.AssetRegistryHelpers.get_asset_registry()
    datas = []
    for r in roots:
        if eal.does_directory_exist(r):
            datas += [reg.get_asset_by_object_path(p if '.' in p else p + '.' + p.split('/')[-1]) for p in eal.list_assets(r, recursive=True, include_folder=False)]
        else:
            d = reg.get_asset_by_object_path(r + '.' + r.split('/')[-1])
            datas.append(d)
    datas = [d for d in datas if d and d.is_valid()]
    log('retargeting', len(datas), 'assets')
    log(unreal.IKRetargetBatchOperation.duplicate_and_retarget.__doc__)
    out = unreal.IKRetargetBatchOperation.duplicate_and_retarget(datas, src_mesh, tgt_mesh, rtg, search='', replace='', prefix='', suffix='_Iron', target_path=ANIM_DEST, include_referenced_assets=True)
    log('retargeted', len(out))
    # move results into the hero folder
    for d in out:
        p = str(d.package_name)
        log('  ', p)
    return out


def main():
    if os.path.exists(LOG):
        os.remove(LOG)
    try:
        if eal.does_directory_exist(DEST):
            eal.delete_directory(DEST)
        mesh = import_mesh()
        tex = import_textures()
        mat = build_material(tex)
        mats = mesh.get_editor_property('materials')
        for sm in mats:
            sm.set_editor_property('material_interface', mat)
        mesh.set_editor_property('materials', mats)
        eal.save_loaded_asset(mesh)
        manny = eal.load_asset('/Game/Characters/Mannequins/Meshes/SKM_Manny_Simple')
        src_rig = make_ik_rig('IK_Manny', manny, DEST)
        tgt_rig = make_ik_rig('IK_IronHero', mesh, DEST)
        rtg = make_retargeter(src_rig, tgt_rig, manny, mesh)
        retarget(rtg, manny, mesh)
        unreal.EditorAssetLibrary.save_directory('/Game/', only_if_is_dirty=True, recursive=True)
        log('DONE')
    except Exception:
        log('FAILED', traceback.format_exc())


main()
