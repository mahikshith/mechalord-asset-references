"""Export an Irondust CC0 soldier skin for Unreal: skeletal mesh FBX plus
UE-ready textures (BaseColor, ORM, DirectX normal, Emissive) converted from the
pack's Unity specular-workflow maps.

Run: blender -b --factory-startup -P tools/blender/export_soldier.py -- <skin> <head> <out_dir>
e.g. MilitarySkin Head3 game/SideAssault/Import/Soldier
"""
import bpy, sys, os
import numpy as np

args = sys.argv[sys.argv.index('--') + 1:]
SKIN, HEAD, OUT = args[0], args[1], os.path.abspath(args[2])
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
SRC = os.path.join(REPO, 'assets', 'originals', 'irondust-scifi-soldier', 'unzipped', 'Sci-fi Soldiers 2')
os.makedirs(OUT, exist_ok=True)
NAME = f'SK_Iron_{SKIN.replace("Skin", "")}'


def px(path, size=2048):
    im = bpy.data.images.load(path)
    if im.size[0] != size:
        im.scale(size, size)
    a = np.array(im.pixels[:], dtype=np.float32).reshape(size, size, 4)
    return a


def save(arr, name, colorspace='sRGB'):
    h, w = arr.shape[:2]
    im = bpy.data.images.new(name, w, h, alpha=True)
    im.colorspace_settings.name = colorspace
    im.pixels = arr.astype(np.float32).ravel()
    im.filepath_raw = os.path.join(OUT, name + '.png')
    im.file_format = 'PNG'
    im.save()


# ---- textures (pixels from bpy are linear for sRGB images; save back as sRGB-tagged data)
p = lambda s: os.path.join(SRC, f'{SKIN}_{s}')
alb = px(p('Albedo.tga'))
spec = px(p('Specular.tga'))
occ = px(p('Occlusion.png'))
nrm = px(p('NormalMap.png'))
emi = px(p('Emission.png'))
lum = spec[..., :3] @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
metal = np.clip((lum - 0.08) / (0.45 - 0.08), 0, 1)
ao = occ[..., 0]
base = alb[..., :3] * ao[..., None] * (1 - metal[..., None]) + spec[..., :3] * metal[..., None]
one = np.ones_like(ao)
save(np.dstack([base, one]), f'T_{NAME}_BaseColor')
rough = 1.0 - spec[..., 3]
save(np.dstack([ao, rough, metal, one]), f'T_{NAME}_ORM', 'Non-Color')
nrm[..., 1] = 1.0 - nrm[..., 1]  # OpenGL -> DirectX green channel for Unreal
save(nrm, f'T_{NAME}_Normal', 'Non-Color')
save(emi, f'T_{NAME}_Emissive')

# ---- mesh
bpy.ops.wm.read_factory_settings(use_empty=True)
with bpy.data.libraries.load(os.path.join(SRC, 'Mesh.blend')) as (src, dst):
    dst.objects = [n for n in src.objects if n != 'Camera']
objs = [o for o in dst.objects if o]
for o in objs:
    bpy.context.scene.collection.objects.link(o)
keep = {'Body', HEAD, 'HandSimple'}
for o in [o for o in objs if o.type == 'MESH']:
    if o.name not in keep:
        bpy.data.objects.remove(o)
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
arm.name = NAME + '_Rig'
arm.data.name = NAME + '_Skeleton'
mat = bpy.data.materials.new('M_' + NAME)
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
for o in meshes:
    o.data.materials.clear()
    o.data.materials.append(mat)
# join into one skinned mesh (one draw call on phones)
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:
    o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.join()
body = bpy.context.view_layer.objects.active
body.name = NAME
# Unreal needs a single root: add one above 'hips'
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='EDIT')
eb = arm.data.edit_bones
root = eb.new('root')
root.head = (0, 0, 0)
root.tail = (0, 0.25, 0)
eb['hips'].parent = root
# drop face/heel helper bones that carry no weights
used = set(vg.name for vg in body.vertex_groups)
for b in list(eb):
    if b.name not in used and b.name not in ('root', 'hips') and not b.children:
        eb.remove(b)
bpy.ops.object.mode_set(mode='OBJECT')
tris = sum(len(p.vertices) - 2 for p in body.data.polygons)
# Unreal wants centimetre bones with an unscaled root: work in a 0.01 unit scale and bake x100 into the data
bpy.context.scene.unit_settings.scale_length = 0.01
bpy.ops.object.select_all(action='DESELECT')
arm.select_set(True)
body.select_set(True)
bpy.context.view_layer.objects.active = arm
arm.scale = (100, 100, 100)
body.parent = arm
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
bpy.ops.object.select_all(action='DESELECT')
arm.select_set(True)
body.select_set(True)
bpy.ops.export_scene.fbx(
    filepath=os.path.join(OUT, NAME + '.fbx'), use_selection=True, object_types={'ARMATURE', 'MESH'},
    add_leaf_bones=False, primary_bone_axis='Y', secondary_bone_axis='X', armature_nodetype='NULL',
    bake_anim=False, mesh_smooth_type='FACE', apply_unit_scale=True, global_scale=1.0, apply_scale_options='FBX_SCALE_NONE')
print('EXPORTED', NAME, 'tris', tris, 'bones', len(arm.data.bones))
