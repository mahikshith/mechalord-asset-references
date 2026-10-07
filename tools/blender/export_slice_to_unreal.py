"""Export the Foundry Docks slice for Unreal: one merged FBX per layer (playable,
midground, background), a JSON of simple collision boxes for the playable lane,
the material specs used to rebuild materials in Unreal, the sun direction and
the water volume.

Run: blender -b --factory-startup -P tools/blender/export_slice_to_unreal.py -- <out_dir>
Unreal axes: X = Blender X, Y = -Blender Y, Z = Blender Z, centimetres.
"""
import bpy, sys, os, json, math, runpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(sys.argv[sys.argv.index('--') + 1])
os.makedirs(OUT, exist_ok=True)
sys.argv = [sys.argv[0], '--', os.path.join(OUT, 'unused.png'), 'norender']
runpy.run_path(os.path.join(HERE, 'sidescroller_slice1.py'), run_name='__main__')
sys.path.insert(0, HERE)
import sidescroller_kit as K

sc = bpy.context.scene


def ue(v):
    return [v.x * 100.0, -v.y * 100.0, v.z * 100.0]


# ---- collision boxes for the walkable / blocking parts of the lane
COLLIDE = ('NearPier_Mass', 'NearPier_Cap', 'FarPier_Mass', 'FarPier_Cap', 'Channel_Floor', 'Channel_BackWall',
           'Slab_Broken', 'Crate_A', 'Crate_B', 'Crate_C', 'Barrel_A', 'Barrel_B', 'Barrel_C', 'Bunker_Mass',
           'Bunker_Roof', 'Bunker_Armour', 'Barricade_Plate')
boxes = []
dg = bpy.context.evaluated_depsgraph_get()
for o in bpy.data.objects:
    if o.type != 'MESH' or o.name not in COLLIDE:
        continue
    corners = [Vector(c) for c in o.bound_box]
    lo = Vector([min(c[i] for c in corners) for i in range(3)])
    hi = Vector([max(c[i] for c in corners) for i in range(3)])
    centre = o.matrix_world @ ((lo + hi) / 2)
    size = Vector([(hi[i] - lo[i]) * o.matrix_world.to_scale()[i] for i in range(3)])
    rot = o.matrix_world.to_euler()
    boxes.append(dict(name=o.name, centre=ue(centre), extent=[size.x * 50, size.y * 50, size.z * 50],
                      pitch_deg=math.degrees(rot.y), kind='crate' if o.name.startswith(('Crate', 'Barrel')) else 'world'))
# catwalk deck: a jump-through platform spanning the frame
fr = bpy.data.objects.get('Catwalk_FrameFront')
if fr:
    c = fr.matrix_world.translation
    boxes.append(dict(name='Catwalk_Deck', centre=[c.x * 100, 0.0, (c.z + 0.16) * 100 - 6], extent=[fr.dimensions.x * 50, 110, 8],
                      pitch_deg=0.0, kind='soft'))

# ---- water volume (the channel)
w = bpy.data.objects.get('Water')
water = None
if w:
    water = dict(centre=ue(w.matrix_world.translation), extent=[w.dimensions.x * 50, w.dimensions.y * 50, w.dimensions.z * 50])

# ---- merged visual layers (volumes, labels and the scale cast stay out)
for o in list(bpy.data.objects):
    if o.type == 'MESH':
        for m in o.data.materials:
            if m and m.name in K.MAT_SPECS and K.MAT_SPECS[m.name]['kind'] == 'volume':
                bpy.data.objects.remove(o)
                break
for name in ('Haze', 'LowFog'):
    if bpy.data.objects.get(name):
        bpy.data.objects.remove(bpy.data.objects[name])
layers = {'Playable': 'SM_Docks_Lane', 'Midground': 'SM_Docks_Mid', 'Background': 'SM_Docks_Far'}
exported = {}
for coll, fname in layers.items():
    objs = [o for o in bpy.data.collections[coll].all_objects if o.type in ('MESH', 'CURVE') and o.name != 'Water']
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.convert(target='MESH')  # bakes curves, bevels and arrays
    objs = [o for o in bpy.context.selected_objects]
    path = os.path.join(OUT, fname + '.fbx')
    bpy.ops.export_scene.fbx(filepath=path, use_selection=True, object_types={'MESH'}, use_mesh_modifiers=True,
                             mesh_smooth_type='FACE', apply_unit_scale=True, bake_anim=False, axis_forward='-Z', axis_up='Y')
    exported[fname] = len(objs)

# water surface as its own mesh
if w:
    bpy.ops.object.select_all(action='DESELECT')
    w.select_set(True)
    bpy.ops.export_scene.fbx(filepath=os.path.join(OUT, 'SM_Docks_Water.fbx'), use_selection=True, object_types={'MESH'},
                             mesh_smooth_type='FACE', apply_unit_scale=True, bake_anim=False)

sun = bpy.data.objects['Sun']
sun_dir = sun.matrix_world.to_quaternion() @ Vector((0, 0, -1))  # light travel direction
spec = dict(
    materials={k: v for k, v in K.MAT_SPECS.items() if v['kind'] != 'volume'},
    boxes=boxes, water=water, layers=exported,
    sun_travel=[sun_dir.x, -sun_dir.y, sun_dir.z],
    player_start=[-640.0, 0.0, 120.0],
)
with open(os.path.join(OUT, 'docks_spec.json'), 'w') as fh:
    json.dump(spec, fh, indent=1, default=list)
print('EXPORTED', exported, len(boxes), 'boxes')
