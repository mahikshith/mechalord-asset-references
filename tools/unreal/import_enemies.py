"""Unreal editor script: import the seven chosen CC0 enemies (Quaternius mech pack
FBX + Sci-Fi Essentials glTF) with their animations, give them a shared
Tyrant-red enemy material, and make one BP_Enemy_<Name> per enemy on the
AIronEnemy C++ class with role, size, animation set and capsule filled in.

Run: UnrealEditor-Cmd.exe SideAssault.uproject -run=pythonscript -script=<this> -unattended -nosplash
"""
import os
import traceback
import unreal

PROJECT = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())
REPO = os.path.abspath(os.path.join(PROJECT, '..', '..'))
O = os.path.join(REPO, 'assets', 'originals')
LOG = os.path.join(PROJECT, 'Saved', 'IronEnemies.log')
ROOT = '/Game/IronLegion/Characters/Enemies'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
bel = unreal.BlueprintEditorLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()

# name, file, texture (fbx only), role, height cm, anim keywords (idle, move, run, attack, hit, death)
ENEMIES = [
    ('George', os.path.join(O, 'quaternius-animated-mech-pack', 'George.fbx'), 'George_Texture.png', 'Lancer', 300,
     ('Idle', 'Walk', 'Run', 'Shoot', 'HitRecieve_1', 'Death')),
    ('Mike', os.path.join(O, 'quaternius-animated-mech-pack', 'Mike.fbx'), 'Mike_Texture.png', 'Bulwark', 280,
     ('Idle', 'Walk', 'Run', 'Punch', 'HitRecieve_1', 'Death')),
    ('Stan', os.path.join(O, 'quaternius-animated-mech-pack', 'Stan.fbx'), 'Stan_Texture.png', 'Raider', 270,
     ('Idle', 'Walk', 'Run', 'Shoot', 'HitRecieve_2', 'Death')),
    ('Leela', os.path.join(O, 'quaternius-animated-mech-pack', 'Leela.fbx'), 'Leela_Texture.png', 'Sentry', 240,
     ('Idle', 'Walk', 'Run', 'Shoot', 'HitRecieve_1', 'Death')),
    ('EyeDrone', os.path.join(O, 'quaternius-scifi-essentials', 'Enemy_EyeDrone.gltf'), None, 'Watcher', 80,
     ('Idle', 'Look', 'Charging', 'Attack', 'Hit', 'BackFlip')),
    ('QuadShell', os.path.join(O, 'quaternius-scifi-essentials', 'Enemy_QuadShell.gltf'), None, 'Scuttler', 100,
     ('Idle', 'Walk', 'Run', 'Attack', 'Hit', 'TurnOff')),
    ('Trilobite', os.path.join(O, 'quaternius-scifi-essentials', 'Enemy_Trilobite.gltf'), None, 'Wallrunner', 95,
     ('Idle', 'Walk', 'Run', 'Attack', 'Hit', 'TurnOff')),
]


def log(*a):
    with open(LOG, 'a', encoding='utf-8') as fh:
        fh.write(' '.join(str(x) for x in a) + '\n')


def import_task(path, dest, options=None):
    t = unreal.AssetImportTask()
    t.filename = path
    t.destination_path = dest
    t.automated = True
    t.replace_existing = True
    t.save = True
    if options:
        t.options = options
    tools.import_asset_tasks([t])
    return [str(p) for p in t.imported_object_paths]


def enemy_master():
    """Shared enemy material: source albedo pulled toward Tyrant red, a warm ember on hits."""
    path = ROOT + '/M_IronEnemy'
    if eal.does_asset_exist(path):
        return eal.load_asset(path)
    m = tools.create_asset('M_IronEnemy', ROOT, unreal.Material, unreal.MaterialFactoryNew())

    def n(cls, x, y, **p):
        e = mel.create_material_expression(m, cls, x, y)
        for k, v in p.items():
            e.set_editor_property(k, v)
        return e
    tex = n(unreal.MaterialExpressionTextureSampleParameter2D, -900, 0, parameter_name='Albedo',
            texture=eal.load_asset('/Engine/EngineResources/DefaultTexture.DefaultTexture'))
    desat = n(unreal.MaterialExpressionDesaturation, -650, 100)
    mel.connect_material_expressions(tex, 'RGB', desat, '')
    red = n(unreal.MaterialExpressionVectorParameter, -900, 250, parameter_name='FactionColor', default_value=unreal.LinearColor(0.42, 0.06, 0.035, 1))
    mul = n(unreal.MaterialExpressionMultiply, -450, 150)
    mel.connect_material_expressions(desat, '', mul, 'A')
    mel.connect_material_expressions(red, '', mul, 'B')
    mul2 = n(unreal.MaterialExpressionMultiply, -300, 150, const_b=2.2)
    mel.connect_material_expressions(mul, '', mul2, 'A')
    amt = n(unreal.MaterialExpressionScalarParameter, -450, 300, parameter_name='FactionAmount', default_value=0.6)
    lerp = n(unreal.MaterialExpressionLinearInterpolate, -150, 50)
    mel.connect_material_expressions(tex, 'RGB', lerp, 'A')
    mel.connect_material_expressions(mul2, '', lerp, 'B')
    mel.connect_material_expressions(amt, '', lerp, 'Alpha')
    mel.connect_material_property(lerp, '', unreal.MaterialProperty.MP_BASE_COLOR)
    mel.connect_material_property(n(unreal.MaterialExpressionScalarParameter, -300, 400, parameter_name='Roughness', default_value=0.45), '', unreal.MaterialProperty.MP_ROUGHNESS)
    mel.connect_material_property(n(unreal.MaterialExpressionScalarParameter, -300, 500, parameter_name='Metallic', default_value=0.55), '', unreal.MaterialProperty.MP_METALLIC)
    flash = n(unreal.MaterialExpressionScalarParameter, -450, 650, parameter_name='HitFlash', default_value=0.0)
    ember = n(unreal.MaterialExpressionVectorParameter, -450, 750, parameter_name='EmberColor', default_value=unreal.LinearColor(1.0, 0.32, 0.08, 1))
    em = n(unreal.MaterialExpressionMultiply, -200, 700)
    mel.connect_material_expressions(flash, '', em, 'A')
    mel.connect_material_expressions(ember, '', em, 'B')
    mel.connect_material_property(em, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
    mel.set_material_usage(m, unreal.MaterialUsage.MATUSAGE_SKELETAL_MESH)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    return m


def import_enemy(name, path, texname):
    dest = f'{ROOT}/{name}'
    if path.endswith('.fbx'):
        ui = unreal.FbxImportUI()
        ui.import_mesh = True
        ui.import_as_skeletal = True
        ui.import_animations = True
        ui.import_materials = False
        ui.import_textures = False
        ui.create_physics_asset = True
        ui.mesh_type_to_import = unreal.FBXImportType.FBXIT_SKELETAL_MESH
        ui.skeletal_mesh_import_data.set_editor_property('convert_scene', True)
        paths = import_task(path, dest, ui)
    else:
        paths = import_task(path, dest)
    # glTF imports land in sub-folders; gather everything under dest
    assets = [eal.load_asset(p) for p in eal.list_assets(dest, recursive=True, include_folder=False)]
    meshes = [a for a in assets if isinstance(a, unreal.SkeletalMesh)]
    meshes.sort(key=lambda m: -m.get_bounds().sphere_radius)
    anims = [a for a in assets if isinstance(a, unreal.AnimSequence)]
    return meshes, anims, assets


def pick(anims, key):
    key = key.lower()
    for a in anims:
        n = a.get_name().lower()
        if n.endswith('_' + key) or n == key or n.split('|')[-1] == key or n.endswith(key):
            return a
    for a in anims:
        if key in a.get_name().lower():
            return a
    return None


def main():
    if os.path.exists(LOG):
        os.remove(LOG)
    master = enemy_master()
    parent = unreal.load_class(None, '/Script/SideAssault.IronEnemy')
    role_enum = unreal.IronEnemyRole
    for name, path, texname, role, height, keys in ENEMIES:
        try:
            meshes, anims, assets = import_enemy(name, path, texname)
            log(name, 'meshes', [m.get_name() for m in meshes], 'anims', len(anims))
            if not meshes:
                continue
            mesh, extra = meshes[0], meshes[1:]
            # material: fbx packs bring a texture png; glTF packs import their own textures
            mi_path = f'{ROOT}/{name}/MI_{name}'
            if eal.does_asset_exist(mi_path):
                eal.delete_asset(mi_path)
            mi = tools.create_asset(f'MI_{name}', f'{ROOT}/{name}', unreal.MaterialInstanceConstant, unreal.MaterialInstanceConstantFactoryNew())
            mel.set_material_instance_parent(mi, master)
            tex = None
            if texname:
                tex = eal.load_asset(import_task(os.path.join(os.path.dirname(path), texname), f'{ROOT}/{name}')[0])
            else:
                tex = next((a for a in assets if isinstance(a, unreal.Texture2D) and 'basecolor' in a.get_name().lower()), None)
            if tex:
                mel.set_material_instance_texture_parameter_value(mi, 'Albedo', tex)
            eal.save_loaded_asset(mi)
            for part in meshes:
                slots = part.get_editor_property('materials')
                for s in slots:
                    s.set_editor_property('material_interface', mi)
                part.set_editor_property('materials', slots)
                eal.save_loaded_asset(part)
            # blueprint on the C++ enemy
            bp_path = f'/Game/IronLegion/Blueprints/Enemies/BP_Enemy_{name}'
            if eal.does_asset_exist(bp_path):
                eal.delete_asset(bp_path)
            bp = bel.create_blueprint_asset_with_parent(bp_path, parent)
            cdo = unreal.get_default_object(bel.generated_class(bp))
            cdo.set_editor_property('enemy_role', getattr(role_enum, role.upper()))
            cdo.set_editor_property('extra_parts', extra)
            lo_z = min(m.get_bounds().origin.z - m.get_bounds().box_extent.z for m in meshes)
            hi_z = max(m.get_bounds().origin.z + m.get_bounds().box_extent.z for m in meshes)
            b = mesh.get_bounds()
            mesh_h = max(1.0, hi_z - lo_z)
            scale = height / mesh_h
            comp = cdo.get_editor_property('mesh')
            comp.set_editor_property('skeletal_mesh_asset', mesh)
            comp.set_editor_property('relative_scale3d', unreal.Vector(scale, scale, scale))
            half = height * 0.5
            radius = max(25.0, min(half * 0.8, b.box_extent.x * scale * 0.7))
            cap = cdo.get_editor_property('capsule_component')
            cap.set_editor_property('capsule_half_height', half)
            cap.set_editor_property('capsule_radius', radius)
            # mesh origin at feet: sink it by the half height
            comp.set_editor_property('relative_location', unreal.Vector(0, 0, -half - lo_z * scale))
            comp.set_editor_property('relative_rotation', unreal.Rotator(roll=0.0, pitch=0.0, yaw=-90.0))
            for prop, key in zip(('anim_idle', 'anim_move', 'anim_run', 'anim_attack', 'anim_hit', 'anim_death'), keys):
                a = pick(anims, key)
                cdo.set_editor_property(prop, a)
                log('  ', prop, key, a.get_name() if a else None)
            bel.compile_blueprint(bp)
            eal.save_loaded_asset(bp)
            log('  bp', bp_path, 'scale', round(scale, 3), 'half', half, 'radius', round(radius, 1))
        except Exception:
            log('FAILED', name, traceback.format_exc())
    log('DONE')


try:
    main()
except Exception:
    log('FAILED', traceback.format_exc())
