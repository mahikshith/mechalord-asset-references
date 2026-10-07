"""Unreal editor script: build /Game/IronLegion/Maps/Lvl_FoundryDocks from the
Blender export in Import/Docks (see tools/blender/export_slice_to_unreal.py).

- imports the scanned CC0 textures and builds world-projected master materials
  (front/top biplanar, so merged kit meshes need no UV work) plus one instance
  per Blender material;
- imports the three merged visual layers and the water surface (no collision);
- adds simple box blockers for the lane, a water zone, dusk lighting, fog,
  post process, the player start and the level's camera limits.
"""
import json
import math
import os
import traceback
import unreal

PROJECT = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())
REPO = os.path.abspath(os.path.join(PROJECT, '..', '..'))
SRC = os.path.join(PROJECT, 'Import', 'Docks')
TEX = os.path.join(REPO, 'assets', 'originals', 'polyhaven', 'textures')
LOG = os.path.join(PROJECT, 'Saved', 'IronDocks.log')
ROOT = '/Game/IronLegion/Environment/Docks'
MAP = '/Game/IronLegion/Maps/Lvl_FoundryDocks'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)


def log(*a):
    with open(LOG, 'a', encoding='utf-8') as fh:
        fh.write(' '.join(str(x) for x in a) + '\n')


def lc(c, a=1.0):
    return unreal.LinearColor(c[0], c[1], c[2], a)


def import_file(path, dest, options=None):
    t = unreal.AssetImportTask()
    t.filename = path
    t.destination_path = dest
    t.automated = True
    t.replace_existing = True
    t.save = True
    if options:
        t.options = options
    tools.import_asset_tasks([t])
    return [eal.load_asset(p) for p in t.imported_object_paths]


# ------------------------------------------------------------------------- materials

def fresh_material(name):
    path = f'{ROOT}/Materials/{name}'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    return tools.create_asset(name, f'{ROOT}/Materials', unreal.Material, unreal.MaterialFactoryNew())


def node(m, cls, x, y, **props):
    n = mel.create_material_expression(m, cls, x, y)
    for k, v in props.items():
        n.set_editor_property(k, v)
    return n


def scalar(m, name, value, x, y):
    return node(m, unreal.MaterialExpressionScalarParameter, x, y, parameter_name=name, default_value=value)


def build_scan_master():
    """World-projected scan material: XZ projection on walls, XY on tops, blended by the normal."""
    m = fresh_material('M_IronScanWorld')
    wp = node(m, unreal.MaterialExpressionWorldPosition, -1800, 0)
    size = scalar(m, 'TextureSize', 200.0, -1800, 200)
    xz = node(m, unreal.MaterialExpressionComponentMask, -1600, -100, r=True, g=False, b=True, a=False)
    xy = node(m, unreal.MaterialExpressionComponentMask, -1600, 100, r=True, g=True, b=False, a=False)
    mel.connect_material_expressions(wp, '', xz, '')
    mel.connect_material_expressions(wp, '', xy, '')
    uv_f = node(m, unreal.MaterialExpressionDivide, -1400, -100)
    uv_t = node(m, unreal.MaterialExpressionDivide, -1400, 100)
    mel.connect_material_expressions(xz, '', uv_f, 'A')
    mel.connect_material_expressions(size, '', uv_f, 'B')
    mel.connect_material_expressions(xy, '', uv_t, 'A')
    mel.connect_material_expressions(size, '', uv_t, 'B')
    nrm = node(m, unreal.MaterialExpressionVertexNormalWS, -1600, 400)
    nz = node(m, unreal.MaterialExpressionComponentMask, -1400, 400, r=False, g=False, b=True, a=False)
    mel.connect_material_expressions(nrm, '', nz, '')
    nza = node(m, unreal.MaterialExpressionAbs, -1250, 400)
    mel.connect_material_expressions(nz, '', nza, '')
    blend = node(m, unreal.MaterialExpressionPower, -1100, 400, const_exponent=4.0)
    mel.connect_material_expressions(nza, '', blend, 'Base')

    def biplanar(param, sampler, y):
        default = texture('concrete_wall_008', 'diff') if sampler == unreal.MaterialSamplerType.SAMPLERTYPE_COLOR else texture('concrete_wall_008', 'arm')
        a = node(m, unreal.MaterialExpressionTextureSampleParameter2D, -1100, y, parameter_name=param, sampler_type=sampler, texture=default)
        b = node(m, unreal.MaterialExpressionTextureSampleParameter2D, -1100, y + 220, parameter_name=param, sampler_type=sampler, texture=default)
        mel.connect_material_expressions(uv_f, '', a, 'UVs')
        mel.connect_material_expressions(uv_t, '', b, 'UVs')
        l = node(m, unreal.MaterialExpressionLinearInterpolate, -800, y + 100)
        mel.connect_material_expressions(a, 'RGB', l, 'A')
        mel.connect_material_expressions(b, 'RGB', l, 'B')
        mel.connect_material_expressions(blend, '', l, 'Alpha')
        return l

    diff = biplanar('Diffuse', unreal.MaterialSamplerType.SAMPLERTYPE_COLOR, -900)
    arm = biplanar('ARM', unreal.MaterialSamplerType.SAMPLERTYPE_MASKS, -300)
    # colour grade: tint toward a target colour, then scale value
    desat = node(m, unreal.MaterialExpressionDesaturation, -600, -1000)
    mel.connect_material_expressions(diff, '', desat, '')
    tint = node(m, unreal.MaterialExpressionVectorParameter, -800, -1150, parameter_name='Tint', default_value=unreal.LinearColor(1, 1, 1, 1))
    tinted = node(m, unreal.MaterialExpressionMultiply, -450, -1050)
    mel.connect_material_expressions(desat, '', tinted, 'A')
    mel.connect_material_expressions(tint, '', tinted, 'B')
    tamt = scalar(m, 'TintAmount', 0.0, -600, -1200)
    graded = node(m, unreal.MaterialExpressionLinearInterpolate, -300, -950)
    mel.connect_material_expressions(diff, '', graded, 'A')
    mel.connect_material_expressions(tinted, '', graded, 'B')
    mel.connect_material_expressions(tamt, '', graded, 'Alpha')
    val = scalar(m, 'Value', 1.0, -300, -1100)
    base = node(m, unreal.MaterialExpressionMultiply, -100, -950)
    mel.connect_material_expressions(graded, '', base, 'A')
    mel.connect_material_expressions(val, '', base, 'B')
    mel.connect_material_property(base, '', unreal.MaterialProperty.MP_BASE_COLOR)
    ao = node(m, unreal.MaterialExpressionComponentMask, -500, -300, r=True, g=False, b=False, a=False)
    ro = node(m, unreal.MaterialExpressionComponentMask, -500, -200, r=False, g=True, b=False, a=False)
    me = node(m, unreal.MaterialExpressionComponentMask, -500, -100, r=False, g=False, b=True, a=False)
    for x in (ao, ro, me):
        mel.connect_material_expressions(arm, '', x, '')
    radd = scalar(m, 'RoughAdd', 0.0, -500, 0)
    rsum = node(m, unreal.MaterialExpressionAdd, -300, -200)
    mel.connect_material_expressions(ro, '', rsum, 'A')
    mel.connect_material_expressions(radd, '', rsum, 'B')
    mval = scalar(m, 'MetalValue', 0.0, -500, 100)
    mover = scalar(m, 'MetalOverride', 0.0, -500, 200)
    mlerp = node(m, unreal.MaterialExpressionLinearInterpolate, -300, 0)
    mel.connect_material_expressions(me, '', mlerp, 'A')
    mel.connect_material_expressions(mval, '', mlerp, 'B')
    mel.connect_material_expressions(mover, '', mlerp, 'Alpha')
    mel.connect_material_property(ao, '', unreal.MaterialProperty.MP_AMBIENT_OCCLUSION)
    mel.connect_material_property(rsum, '', unreal.MaterialProperty.MP_ROUGHNESS)
    mel.connect_material_property(mlerp, '', unreal.MaterialProperty.MP_METALLIC)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    return m


def build_flat_master():
    m = fresh_material('M_IronFlat')
    c = node(m, unreal.MaterialExpressionVectorParameter, -400, 0, parameter_name='Color', default_value=unreal.LinearColor(0.1, 0.1, 0.1, 1))
    mel.connect_material_property(c, '', unreal.MaterialProperty.MP_BASE_COLOR)
    mel.connect_material_property(scalar(m, 'Roughness', 0.8, -400, 200), '', unreal.MaterialProperty.MP_ROUGHNESS)
    mel.connect_material_property(scalar(m, 'Metallic', 0.0, -400, 300), '', unreal.MaterialProperty.MP_METALLIC)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    return m


def build_emissive_master():
    m = fresh_material('M_IronEmissive')
    c = node(m, unreal.MaterialExpressionVectorParameter, -400, 0, parameter_name='Color', default_value=unreal.LinearColor(1, 0.5, 0.2, 1))
    s = scalar(m, 'Strength', 8.0, -400, 200)
    mul = node(m, unreal.MaterialExpressionMultiply, -200, 100)
    mel.connect_material_expressions(c, '', mul, 'A')
    mel.connect_material_expressions(s, '', mul, 'B')
    mel.connect_material_property(mul, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
    mel.connect_material_property(node(m, unreal.MaterialExpressionConstant3Vector, -400, -200, constant=unreal.LinearColor(0, 0, 0, 1)), '', unreal.MaterialProperty.MP_BASE_COLOR)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    return m


def build_water_material():
    m = fresh_material('M_IronWater')
    mel.connect_material_property(node(m, unreal.MaterialExpressionConstant3Vector, -400, 0, constant=unreal.LinearColor(0.012, 0.03, 0.032, 1)), '', unreal.MaterialProperty.MP_BASE_COLOR)
    mel.connect_material_property(node(m, unreal.MaterialExpressionConstant, -400, 200, r=0.04), '', unreal.MaterialProperty.MP_ROUGHNESS)
    mel.connect_material_property(node(m, unreal.MaterialExpressionConstant, -400, 300, r=0.9), '', unreal.MaterialProperty.MP_SPECULAR)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    return m


def instance(name, parent):
    path = f'{ROOT}/Materials/{name}'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    mi = tools.create_asset(name, f'{ROOT}/Materials', unreal.MaterialInstanceConstant, unreal.MaterialInstanceConstantFactoryNew())
    mel.set_material_instance_parent(mi, parent)
    return mi


_tex = {}


def texture(name, kind):
    key = (name, kind)
    if key in _tex:
        return _tex[key]
    if name == 'hazard':
        f = os.path.join(SRC, 'T_Hazard.png')
    else:
        f = os.path.join(TEX, name, f'{name}_{kind}_2k.jpg')
    t = import_file(f, f'{ROOT}/Textures')[0]
    if kind == 'arm':
        t.set_editor_property('srgb', False)
        t.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_MASKS)
    eal.save_loaded_asset(t)
    _tex[key] = t
    return t


def build_materials(specs):
    scan, flat, emi, water = build_scan_master(), build_flat_master(), build_emissive_master(), build_water_material()
    out = {}
    for name, s in specs.items():
        k = s['kind']
        mi = instance('MI_' + name, {'scan': scan, 'hazard': scan, 'flat': flat, 'emissive': emi}.get(k, flat))
        if k in ('scan', 'hazard'):
            tex = 'hazard' if k == 'hazard' else s['tex']
            mel.set_material_instance_texture_parameter_value(mi, 'Diffuse', texture(tex, 'diff'))
            mel.set_material_instance_texture_parameter_value(mi, 'ARM', texture('concrete_wall_008' if k == 'hazard' else tex, 'arm'))
            size = 60.0 if k == 'hazard' else 100.0 / max(0.05, s.get('scale', 1.0))
            mel.set_material_instance_scalar_parameter_value(mi, 'TextureSize', size)
            if k == 'scan':
                mel.set_material_instance_vector_parameter_value(mi, 'Tint', lc(s.get('tint', (1, 1, 1))))
                mel.set_material_instance_scalar_parameter_value(mi, 'TintAmount', float(s.get('tint_amt', 0.0)))
                mel.set_material_instance_scalar_parameter_value(mi, 'Value', float(s.get('value', 1.0)))
                if s.get('metal') is not None:
                    mel.set_material_instance_scalar_parameter_value(mi, 'MetalOverride', 1.0)
                    mel.set_material_instance_scalar_parameter_value(mi, 'MetalValue', float(s['metal']))
                mel.set_material_instance_scalar_parameter_value(mi, 'RoughAdd', float(s.get('rough_add', 0.0)))
        elif k == 'flat':
            mel.set_material_instance_vector_parameter_value(mi, 'Color', lc(s['color']))
            mel.set_material_instance_scalar_parameter_value(mi, 'Roughness', float(s.get('rough', 0.8)))
            mel.set_material_instance_scalar_parameter_value(mi, 'Metallic', float(s.get('metal', 0.0)))
        elif k == 'emissive':
            mel.set_material_instance_vector_parameter_value(mi, 'Color', lc(s['color']))
            # Cycles strengths are scene-linear watts; Unreal needs far less for the same glow under auto exposure
            mel.set_material_instance_scalar_parameter_value(mi, 'Strength', float(s['strength']) * 0.6)
        eal.save_loaded_asset(mi)
        out[name] = water if k == 'water' else mi
    return out


# ------------------------------------------------------------------------- meshes

def import_layer(fname):
    ui = unreal.FbxImportUI()
    ui.import_mesh = True
    ui.import_as_skeletal = False
    ui.import_materials = False
    ui.import_textures = False
    ui.mesh_type_to_import = unreal.FBXImportType.FBXIT_STATIC_MESH
    sm = ui.static_mesh_import_data
    sm.set_editor_property('combine_meshes', True)
    sm.set_editor_property('auto_generate_collision', False)
    sm.set_editor_property('generate_lightmap_u_vs', True)
    sm.set_editor_property('convert_scene', True)
    objs = import_file(os.path.join(SRC, fname + '.fbx'), f'{ROOT}/Meshes', ui)
    return next(o for o in objs if isinstance(o, unreal.StaticMesh))


def assign(mesh, mats):
    slots = mesh.get_editor_property('static_materials')
    new = []
    for s in slots:
        n = str(s.get_editor_property('material_slot_name'))
        if n in mats:
            setp(s, 'material_interface', mats[n])
        else:
            log('  no material for slot', n)
        new.append(s)
    mesh.set_editor_property('static_materials', new)
    eal.save_loaded_asset(mesh)


# ------------------------------------------------------------------------- level

def setp(obj, key, value):
    try:
        obj.set_editor_property(key, value)
    except Exception as e:
        log('  skip', key, e)


def spawn(cls, loc=(0, 0, 0), rot=None):
    a = actors.spawn_actor_from_class(cls, unreal.Vector(*loc), rot or unreal.Rotator())
    return a


def build_level(spec, mats, meshes):
    les = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
    if eal.does_asset_exist(MAP):
        eal.delete_asset(MAP)
    les.new_level(MAP)
    for name, mesh in meshes.items():
        a = actors.spawn_actor_from_object(mesh, unreal.Vector(0, 0, 0))
        a.set_actor_label(name)
        a.static_mesh_component.set_collision_enabled(unreal.CollisionEnabled.NO_COLLISION)
        a.static_mesh_component.set_editor_property('mobility', unreal.ComponentMobility.STATIC)
        if name in ('SM_Docks_Lane', 'SM_Docks_Water'):
            # the playable lane also takes the camera-side key light (channel 1); the backdrop stays a silhouette
            ch = a.static_mesh_component.get_editor_property('lighting_channels')
            ch.set_editor_property('channel1', True)
            a.static_mesh_component.set_editor_property('lighting_channels', ch)
    cube = eal.load_asset('/Engine/BasicShapes/Cube.Cube')
    for b in spec['boxes']:
        c, e = b['centre'], b['extent']
        a = actors.spawn_actor_from_object(cube, unreal.Vector(*c), unreal.Rotator(roll=0.0, pitch=-b['pitch_deg'], yaw=0.0))
        a.set_actor_label('Block_' + b['name'])
        a.set_actor_scale3d(unreal.Vector(e[0] / 50.0, e[1] / 50.0, e[2] / 50.0))
        a.set_actor_hidden_in_game(True)
        smc = a.static_mesh_component
        smc.set_collision_profile_name('BlockAll')
        smc.set_editor_property('cast_shadow', False)
        smc.set_visibility(False)
    if spec.get('water'):
        w = spec['water']
        wz = spawn(unreal.load_class(None, '/Script/SideAssault.IronWaterZone'), w['centre'])
        wz.set_actor_label('WaterZone')
        wz.get_editor_property('volume').set_box_extent(unreal.Vector(*w['extent']))
    # dusk light: the low sun behind the plant, a warm key and sky fill
    travel = unreal.Vector(*spec['sun_travel'])
    sun = spawn(unreal.DirectionalLight, (0, 0, 2000), unreal.MathLibrary.make_rot_from_x(travel))
    lc_ = sun.get_component_by_class(unreal.DirectionalLightComponent)
    lc_.set_editor_property('intensity', 5.0)
    lc_.set_editor_property('light_color', unreal.Color(255, 150, 90, 255))
    lc_.set_editor_property('atmosphere_sun_light', True)
    lc_.set_editor_property('mobility', unreal.ComponentMobility.MOVABLE)
    key = spawn(unreal.DirectionalLight, (0, 1500, 1500), unreal.MathLibrary.make_rot_from_x(unreal.Vector(0.3, -1.0, -0.6)))
    kc = key.get_component_by_class(unreal.DirectionalLightComponent)
    kc.set_editor_property('intensity', 2.4)
    kc.set_editor_property('light_color', unreal.Color(200, 215, 255, 255))
    kc.set_editor_property('mobility', unreal.ComponentMobility.MOVABLE)
    kc.set_editor_property('atmosphere_sun_light', False)
    kch = kc.get_editor_property('lighting_channels')
    kch.set_editor_property('channel0', False)
    kch.set_editor_property('channel1', True)
    kc.set_editor_property('lighting_channels', kch)
    spawn(unreal.SkyAtmosphere)
    sky = spawn(unreal.SkyLight, (0, 0, 500))
    slc = sky.get_component_by_class(unreal.SkyLightComponent)
    slc.set_editor_property('real_time_capture', True)
    slc.set_editor_property('mobility', unreal.ComponentMobility.MOVABLE)
    slc.set_editor_property('intensity', 0.55)
    fog = spawn(unreal.ExponentialHeightFog, (0, 0, -1500))
    fc = fog.get_component_by_class(unreal.ExponentialHeightFogComponent)
    setp(fc, 'fog_density', 0.0025)
    setp(fc, 'fog_height_falloff', 0.02)
    setp(fc, 'fog_inscattering_luminance', unreal.LinearColor(0.55, 0.32, 0.22, 1))
    pp = spawn(unreal.PostProcessVolume)
    pp.set_editor_property('unbound', True)
    s = pp.get_editor_property('settings')
    setp(s, 'override_motion_blur_amount', True)
    setp(s, 'motion_blur_amount', 0.0)
    setp(s, 'override_bloom_intensity', True)
    setp(s, 'bloom_intensity', 0.8)
    setp(s, 'override_auto_exposure_bias', True)
    setp(s, 'auto_exposure_bias', -0.6)
    setp(s, 'override_vignette_intensity', True)
    setp(s, 'vignette_intensity', 0.45)
    pp.set_editor_property('settings', s)
    ps = spawn(unreal.PlayerStart, spec['player_start'])
    info = spawn(unreal.load_class(None, '/Script/SideAssault.IronLevelInfo'))
    info.set_editor_property('camera_min_x', -1340.0)
    info.set_editor_property('camera_max_x', 1340.0)
    info.set_editor_property('camera_distance', 650.0)
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    ws = world.get_world_settings()
    gm = eal.load_asset('/Game/Variant_SideScrolling/Blueprints/BP_SideScrollingGameMode')
    ws.set_editor_property('default_game_mode', unreal.BlueprintEditorLibrary.generated_class(gm))
    les.save_current_level()
    log('level saved', MAP)


def main():
    if os.path.exists(LOG):
        os.remove(LOG)
    spec = json.load(open(os.path.join(SRC, 'docks_spec.json')))
    mats = build_materials(spec['materials'])
    log('materials', len(mats))
    meshes = {}
    for name in ('SM_Docks_Lane', 'SM_Docks_Mid', 'SM_Docks_Far', 'SM_Docks_Water'):
        m = import_layer(name)
        assign(m, mats)
        meshes[name] = m
        log('mesh', name, m.get_num_triangles(0) if hasattr(m, 'get_num_triangles') else '')
    build_level(spec, mats, meshes)
    log('DONE')


try:
    main()
except Exception:
    log('FAILED', traceback.format_exc())
if os.environ.get('IRON_QUIT_EDITOR'):
    unreal.SystemLibrary.quit_editor()
