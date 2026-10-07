"""Unreal editor script: import the synthesised sound effects and build the
additive glow material used by muzzle flashes, sparks and explosions."""
import glob
import os
import traceback
import unreal

PROJECT = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())
LOG = os.path.join(PROJECT, 'Saved', 'IronFX.log')
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()


def log(*a):
    with open(LOG, 'a', encoding='utf-8') as fh:
        fh.write(' '.join(str(x) for x in a) + '\n')


def sounds():
    tasks = []
    for f in sorted(glob.glob(os.path.join(PROJECT, 'Import', 'SFX', '*.wav'))):
        t = unreal.AssetImportTask()
        t.filename = f
        t.destination_path = '/Game/IronLegion/Audio'
        t.automated = True
        t.replace_existing = True
        t.save = True
        tasks.append(t)
    tools.import_asset_tasks(tasks)
    for t in tasks:
        log('sound', [str(p) for p in t.imported_object_paths])
    loop = eal.load_asset('/Game/IronLegion/Audio/SFX_LaserLoop')
    if loop:
        loop.set_editor_property('looping', True)
        eal.save_loaded_asset(loop)


def glow_material():
    """Unlit additive soft disc: Color * Intensity * (1 - r)^Softness, two-sided."""
    path = '/Game/IronLegion/FX/M_IronGlow'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset('M_IronGlow', '/Game/IronLegion/FX', unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_ADDITIVE)
    m.set_editor_property('shading_model', unreal.MaterialShadingModel.MSM_UNLIT)
    m.set_editor_property('two_sided', True)

    def n(cls, x, y, **p):
        e = mel.create_material_expression(m, cls, x, y)
        for k, v in p.items():
            e.set_editor_property(k, v)
        return e
    uv = n(unreal.MaterialExpressionTextureCoordinate, -1200, 0)
    centre = n(unreal.MaterialExpressionConstant2Vector, -1200, 150, r=0.5, g=0.5)
    sub = n(unreal.MaterialExpressionSubtract, -1000, 50)
    mel.connect_material_expressions(uv, '', sub, 'A')
    mel.connect_material_expressions(centre, '', sub, 'B')
    ln = n(unreal.MaterialExpressionLength, -850, 50)
    mel.connect_material_expressions(sub, '', ln, '')
    dbl = n(unreal.MaterialExpressionMultiply, -700, 50, const_b=2.0)
    mel.connect_material_expressions(ln, '', dbl, 'A')
    inv = n(unreal.MaterialExpressionOneMinus, -550, 50)
    mel.connect_material_expressions(dbl, '', inv, '')
    sat = n(unreal.MaterialExpressionSaturate, -420, 50)
    mel.connect_material_expressions(inv, '', sat, '')
    soft = n(unreal.MaterialExpressionScalarParameter, -420, 200, parameter_name='Softness', default_value=2.2)
    pw = n(unreal.MaterialExpressionPower, -280, 50)
    mel.connect_material_expressions(sat, '', pw, 'Base')
    mel.connect_material_expressions(soft, '', pw, 'Exp')
    col = n(unreal.MaterialExpressionVectorParameter, -420, -200, parameter_name='Color', default_value=unreal.LinearColor(1.0, 0.6, 0.25, 1))
    inten = n(unreal.MaterialExpressionScalarParameter, -420, -60, parameter_name='Intensity', default_value=20.0)
    m1 = n(unreal.MaterialExpressionMultiply, -150, -150)
    mel.connect_material_expressions(col, '', m1, 'A')
    mel.connect_material_expressions(inten, '', m1, 'B')
    m2 = n(unreal.MaterialExpressionMultiply, 0, -50)
    mel.connect_material_expressions(m1, '', m2, 'A')
    mel.connect_material_expressions(pw, '', m2, 'B')
    mel.connect_material_property(m2, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    log('glow material', path)


try:
    if os.path.exists(LOG):
        os.remove(LOG)
    sounds()
    glow_material()
    log('DONE')
except Exception:
    log('FAILED', traceback.format_exc())
