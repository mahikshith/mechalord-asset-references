"""Render numbered option sheets of free (CC0) rigged enemy candidates, each
posed on a frame of one of its own animations.

Run: blender -b --factory-startup -P tools/blender/enemy_options.py -- <out_dir> [preview]
"""
import bpy, sys, os, math, glob
from mathutils import Vector, Euler
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sidescroller_kit as K

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT_DIR = args[0] if args else os.path.abspath('.')
PREVIEW = 'preview' in args
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
O = os.path.join(REPO, 'assets', 'originals')
SPACE = glob.glob(os.path.join(O, 'quaternius-ultimate-space-kit', 'unzipped', '**'), recursive=True)
ESS = os.path.join(O, 'quaternius-scifi-essentials')
MECHS = os.path.join(O, 'quaternius-animated-mech-pack')
SOLDIER = os.path.join(O, 'irondust-scifi-soldier', 'unzipped', 'Sci-fi Soldiers 2')


def space(name):
    return next(p for p in SPACE if os.path.basename(p) == name)

# (label, loader, file, height in metres, action keyword, frame fraction, hover)
SHEETS = {
    'enemy-options-mechs-troopers': (3.4, [
        ('1  Mech: George (siege level)', 'fbx', os.path.join(MECHS, 'George.fbx'), 3.0, 'Shoot', 0.4, 0),
        ('2  Mech: Mike (siege level)', 'fbx', os.path.join(MECHS, 'Mike.fbx'), 2.8, 'Walk', 0.3, 0),
        ('3  Mech: Stan (siege level)', 'fbx', os.path.join(MECHS, 'Stan.fbx'), 2.8, 'Run', 0.3, 0),
        ('4  Mech: Leela (siege level)', 'fbx', os.path.join(MECHS, 'Leela.fbx'), 2.4, 'Walk', 0.3, 0),
        ('5  Evil trooper (soldier pack)', 'soldier', SOLDIER, 1.9, None, 0, 0),
    ]),
    'enemy-options-drones-crawlers': (1.9, [
        ('6  Eye drone (flies)', 'glb', os.path.join(ESS, 'Enemy_EyeDrone.gltf'), 0.8, 'Attack', 0.4, 0.55),
        ('7  Quad shell (crawler)', 'glb', os.path.join(ESS, 'Enemy_QuadShell.gltf'), 1.0, 'Walk', 0.3, 0),
        ('8  Trilobite (wall crawler)', 'glb', os.path.join(ESS, 'Enemy_Trilobite.gltf'), 0.9, 'Run', 0.3, 0),
    ]),
}


def bbox(objs):
    """World bounds of the posed (armature-deformed) meshes."""
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for o in objs:
        if o.type != 'MESH' or not o.visible_get() or o.name.startswith('Icosphere'):
            continue
        ev = o.evaluated_get(dg)
        me = ev.to_mesh()
        pts += [ev.matrix_world @ v.co for v in me.vertices]
        ev.to_mesh_clear()
    mn = Vector([min(p[i] for p in pts) for i in range(3)])
    mx = Vector([max(p[i] for p in pts) for i in range(3)])
    return mn, mx


def pose(new, actions, keyword, frac):
    arm = next((o for o in new if o.type == 'ARMATURE'), None)
    if not arm or not keyword:
        return
    act = next((a for a in actions if a.name.split('|')[-1].split('.')[0].lower() == keyword.lower()), None)
    act = act or next((a for a in actions if keyword.lower() in a.name.lower()), None)
    if not act:
        print('no action', keyword, [a.name for a in actions])
        return
    ad = arm.animation_data or arm.animation_data_create()
    for t in list(ad.nla_tracks):
        ad.nla_tracks.remove(t)
    ad.action = act
    try:
        if act.slots:
            ad.action_slot = act.slots[0]
    except Exception:
        pass
    f0, f1 = act.frame_range
    fr = f0 + (f1 - f0) * frac
    # each rig plays its own action; offset an NLA strip so every rig hits its chosen frame at frame 1000
    ad.action = None
    tr = ad.nla_tracks.new()
    st = tr.strips.new(act.name, int(1000 - (fr - f0)), act)
    try:
        if act.slots:
            st.action_slot = act.slots[0]
    except Exception:
        pass
    return fr


def load(kind, path):
    before = set(bpy.data.objects)
    acts = set(bpy.data.actions)
    if kind == 'glb':
        bpy.ops.import_scene.gltf(filepath=path)
    elif kind == 'fbx':
        bpy.ops.import_scene.fbx(filepath=path)
        tex = path[:-4] + '_Texture.png'
        m = bpy.data.materials.new(os.path.basename(tex))
        nt, nodes, links = K._nodes(m)
        out = K._n(nodes, 'ShaderNodeOutputMaterial', (300, 0))
        b = K._n(nodes, 'ShaderNodeBsdfPrincipled', (0, 0))
        b.inputs['Roughness'].default_value = 0.45
        b.inputs['Metallic'].default_value = 0.35
        im = nodes.new('ShaderNodeTexImage')
        im.image = bpy.data.images.load(tex, check_existing=True)
        links.new(im.outputs['Color'], b.inputs['Base Color'])
        links.new(b.outputs[0], out.inputs[0])
        for o in bpy.data.objects:
            if o not in before and o.type == 'MESH':
                o.data.materials.clear()
                o.data.materials.append(m)
    new = [o for o in bpy.data.objects if o not in before]
    return new, [a for a in bpy.data.actions if a not in acts]


def load_soldier():
    import importlib.util
    spec = importlib.util.spec_from_file_location('sl', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'soldier_parts.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    before = set(bpy.data.objects)
    m.load_soldier('EvilSkin', 'Head2')
    return [o for o in bpy.data.objects if o not in before], []


def studio(sc, ctr, size):
    floor = K.box('Floor', (40, 40, 0.2), (ctr.x, ctr.y + 5, -0.1), K.pbr('Scan_Tread', 'metal_plate', scale=0.5, tint=(0.1, 0.1, 0.1), tint_amt=0.6, value=0.22), bevel=0)
    floor.modifiers.clear()
    floor.is_shadow_catcher = True
    w = bpy.data.worlds.new('Studio')
    sc.world = w
    wn = K._nodes(w)
    bg = K._n(wn[1], 'ShaderNodeBackground', (0, 0))
    bg.inputs[0].default_value = (0.035, 0.033, 0.036, 1)
    wo = K._n(wn[1], 'ShaderNodeOutputWorld', (200, 0))
    wn[2].new(bg.outputs[0], wo.inputs[0])
    tgt = Vector((ctr.x, ctr.y, size * 0.5))

    def area(n, off, e, col, sz):
        L = bpy.data.lights.new(n, 'AREA')
        L.energy, L.color, L.size = e * size * size, col, sz * size
        o = bpy.data.objects.new(n, L)
        sc.collection.objects.link(o)
        o.location = tgt + Vector(off) * size
        o.rotation_euler = (tgt - o.location).to_track_quat('-Z', 'Y').to_euler()
    area('Key', (-1.2, -2.0, 1.4), 160, (0.75, 0.85, 1.0), 1.2)
    area('RimL', (-1.3, 1.6, 1.0), 260, (1.0, 0.5, 0.22), 0.8)
    area('RimR', (1.4, 1.4, 0.8), 220, (1.0, 0.5, 0.22), 0.8)
    area('Fill', (1.6, -1.8, 0.4), 50, (1.0, 0.8, 0.7), 1.5)


def tile(item, path, frame_h):
    label, kind, src, height, kw, frac, hover = item
    K.reset()
    sc = bpy.context.scene
    new, acts = load_soldier() if kind == 'soldier' else load(kind, src)
    pose(new, acts, kw, frac)
    sc.frame_set(1000)
    bpy.context.view_layer.update()
    mn, mx = bbox(new)
    s = height / max(1e-4, (mx.z - mn.z))
    root = bpy.data.objects.new('Root', None)
    sc.collection.objects.link(root)
    for o in new:
        if o.parent is None:
            o.parent = root
    root.scale = (s, s, s)
    root.location = (-(mn.x + mx.x) / 2 * s, -(mn.y + mx.y) / 2 * s, -mn.z * s + hover)
    root.rotation_euler.z = math.radians(-30)
    # frame by a common scale so relative sizes read across tiles: 3.6 m tall window
    studio(sc, Vector((0, 0, 0)), frame_h)
    cam = bpy.data.objects.new('Camera', bpy.data.cameras.new('Camera'))
    sc.collection.objects.link(cam)
    sc.camera = cam
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = frame_h * 1.25
    cam.location = (0, -20, frame_h * 0.47)
    cam.rotation_euler = Euler((math.radians(88), 0, 0))
    K.setup_render(path, *(300, 375) if PREVIEW else (640, 800), samples=24 if PREVIEW else 128, exposure=0.3)
    bpy.ops.render.render(write_still=True)


def sheet(name, spec_items):
    frame_h, items = spec_items
    import subprocess, json
    tiles = []
    for i, it in enumerate(items):
        p = os.path.join(OUT_DIR, f'_tile_{name}_{i}.png')
        tile(it, p, frame_h)
        tiles.append((p, it[0]))
    spec = json.dumps({'tiles': tiles, 'out': os.path.join(OUT_DIR, name + '.png'), 'cols': len(tiles)})
    with open(os.path.join(OUT_DIR, '_sheet.json'), 'w') as fh:
        fh.write(spec)
    print('RENDERED', name)


for n, items in SHEETS.items():
    sheet(n, items)
    os.replace(os.path.join(OUT_DIR, '_sheet.json'), os.path.join(OUT_DIR, f'_sheet_{n}.json'))