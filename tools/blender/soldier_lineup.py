"""Irondust CC0 sci-fi soldier: build PBR materials for its three skins from the
Unity specular-workflow maps, pose it out of T-pose, and render a lineup.

Run: blender -b --factory-startup -P tools/blender/soldier_lineup.py -- <out.png> [preview]
"""
import bpy, sys, os, math
from mathutils import Vector, Euler
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sidescroller_kit as K

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = args[0] if args else os.path.abspath('soldier_lineup.png')
PREVIEW = 'preview' in args
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
SRC = os.path.join(REPO, 'assets', 'originals', 'irondust-scifi-soldier', 'unzipped', 'Sci-fi Soldiers 2')

K.reset()
sc = bpy.context.scene


def skin_material(skin):
    m = bpy.data.materials.new(skin)
    nt, nodes, links = K._nodes(m)
    p = lambda s: os.path.join(SRC, f'{skin}_{s}')
    out = K._n(nodes, 'ShaderNodeOutputMaterial', (900, 0))
    bsdf = K._n(nodes, 'ShaderNodeBsdfPrincipled', (600, 0))
    links.new(bsdf.outputs[0], out.inputs[0])

    def img(name, noncolor, loc):
        n = nodes.new('ShaderNodeTexImage')
        n.location = loc
        n.image = bpy.data.images.load(p(name), check_existing=True)
        if noncolor:
            n.image.colorspace_settings.name = 'Non-Color'
        return n
    alb = img('Albedo.tga', False, (-600, 300))
    spec = img('Specular.tga', False, (-600, 0))
    nrm = img('NormalMap.png', True, (-600, -300))
    occ = img('Occlusion.png', True, (-600, -600))
    emi = img('Emission.png', False, (-600, 600))
    # albedo x occlusion
    ao = K._n(nodes, 'ShaderNodeMix', (-200, 300))
    ao.data_type = 'RGBA'
    ao.blend_type = 'MULTIPLY'
    ao.inputs['Factor'].default_value = 1.0
    links.new(alb.outputs['Color'], ao.inputs['A'])
    links.new(occ.outputs['Color'], ao.inputs['B'])
    # Unity specular colour -> metalness: bright specular means bare metal
    bw = K._n(nodes, 'ShaderNodeRGBToBW', (-350, 50))
    links.new(spec.outputs['Color'], bw.inputs[0])
    met = K._n(nodes, 'ShaderNodeMapRange', (-150, 50))
    met.inputs['From Min'].default_value = 0.08
    met.inputs['From Max'].default_value = 0.45
    links.new(bw.outputs[0], met.inputs['Value'])
    # metals take their colour from the specular map
    bc = K._n(nodes, 'ShaderNodeMix', (100, 300))
    bc.data_type = 'RGBA'
    links.new(met.outputs['Result'], bc.inputs['Factor'])
    links.new(ao.outputs['Result'], bc.inputs['A'])
    links.new(spec.outputs['Color'], bc.inputs['B'])
    links.new(bc.outputs['Result'], bsdf.inputs['Base Color'])
    links.new(met.outputs['Result'], bsdf.inputs['Metallic'])
    # smoothness lives in specular alpha
    rough = K._n(nodes, 'ShaderNodeMath', (-150, -100))
    rough.operation = 'SUBTRACT'
    rough.inputs[0].default_value = 1.0
    links.new(spec.outputs['Alpha'], rough.inputs[1])
    links.new(rough.outputs[0], bsdf.inputs['Roughness'])
    nm = K._n(nodes, 'ShaderNodeNormalMap', (100, -300))
    links.new(nrm.outputs['Color'], nm.inputs['Color'])
    links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    links.new(emi.outputs['Color'], bsdf.inputs['Emission Color'])
    bsdf.inputs['Emission Strength'].default_value = 4.0
    return m


def load_soldier(skin, head, x, rot=0.0, cannon=True, pose='idle'):
    before = set(bpy.data.objects)
    with bpy.data.libraries.load(os.path.join(SRC, 'Mesh.blend')) as (src, dst):
        dst.objects = [n for n in src.objects if n != 'Camera']
    new = [o for o in dst.objects if o]
    for o in new:
        sc.collection.objects.link(o)
    arm = next(o for o in new if o.type == 'ARMATURE')
    keep = {'Body', head, 'Cannon' if cannon else 'HandSimple'}
    mat = bpy.data.materials.get(skin) or skin_material(skin)
    for o in [o for o in new if o.type == 'MESH']:
        if o.name.split('.')[0] not in keep:
            bpy.data.objects.remove(o)
            continue
        o.data = o.data.copy()
        o.data.materials.clear()
        o.data.materials.append(mat)
        for p in o.data.polygons:
            p.use_smooth = True
    arm.location = (x, 0, 0)
    arm.rotation_euler.z = rot
    pb = arm.pose.bones
    # relaxed combat stance out of the T-pose
    def r(name, x=0, y=0, z=0):
        if name in pb:
            pb[name].rotation_mode = 'XYZ'
            pb[name].rotation_euler = (math.radians(x), math.radians(y), math.radians(z))
    if pose == 'idle':
        r('upper_arm.L', 0, 0, 0)
        r('upper_arm.R', 0, 0, 0)
    return arm


# Figure out arm-down rotation empirically: pose bones in local space, check hand height.
def lower_arms(arm, deg):
    pb = arm.pose.bones
    for side, sgn in (('L', 1), ('R', -1)):
        best = None
        for axis in range(3):
            for s in (1, -1):
                b = pb[f'upper_arm.{side}']
                b.rotation_mode = 'XYZ'
                e = [0, 0, 0]
                e[axis] = math.radians(deg) * s
                b.rotation_euler = e
                bpy.context.view_layer.update()
                h = (arm.matrix_world @ pb[f'hand.{side}'].head).z
                if best is None or h < best[0]:
                    best = (h, axis, s)
        e = [0, 0, 0]
        e[best[1]] = math.radians(deg) * best[2]
        pb[f'upper_arm.{side}'].rotation_euler = e
        # bend the elbow a little the same way
        f = pb[f'forearm.{side}']
        f.rotation_mode = 'XYZ'
        bpy.context.view_layer.update()


skins = [('MilitarySkin', 'Head3'), ('FederalSoldierSkin', 'Head1'), ('EvilSkin', 'Head2')]
arms = []
for i, (skin, head) in enumerate(skins):
    a = load_soldier(skin, head, (i - 1) * 1.45, math.radians(28 - i * 28))
    lower_arms(a, 68)
    arms.append(a)

# studio: dark floor, warm rim from behind, cool key
floor = K.box('Floor', (30, 30, 0.2), (0, 0, -0.1), K.pbr('Scan_Tread', 'metal_plate', scale=0.5, tint=(0.1, 0.1, 0.1), tint_amt=0.6, value=0.22), bevel=0)
floor.modifiers.clear()
w = bpy.data.worlds.new('Studio')
sc.world = w
wn = K._nodes(w)
bg = K._n(wn[1], 'ShaderNodeBackground', (0, 0))
bg.inputs[0].default_value = (0.02, 0.02, 0.025, 1)
bg.inputs[1].default_value = 1.0
wo = K._n(wn[1], 'ShaderNodeOutputWorld', (200, 0))
wn[2].new(bg.outputs[0], wo.inputs[0])


def area(name, loc, energy, color, size, target=(0, 0, 1.0)):
    L = bpy.data.lights.new(name, 'AREA')
    L.energy = energy
    L.color = color
    L.size = size
    o = bpy.data.objects.new(name, L)
    sc.collection.objects.link(o)
    o.location = loc
    d = Vector(target) - Vector(loc)
    o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()

area('Key', (-3.5, -5, 4), 900, (0.75, 0.85, 1.0), 3)
area('RimL', (-3, 4, 3), 1400, (1.0, 0.5, 0.22), 2)
area('RimR', (3.5, 3.5, 2.5), 1200, (1.0, 0.5, 0.22), 2)
area('Fill', (4, -5, 1.5), 200, (1.0, 0.8, 0.7), 4)

cam = bpy.data.objects.new('Camera', bpy.data.cameras.new('Camera'))
sc.collection.objects.link(cam)
sc.camera = cam
cam.data.lens = 62
cam.location = (0, -8.2, 1.35)
cam.rotation_euler = Euler((math.radians(88), 0, 0))
K.setup_render(OUT, *(800, 450) if PREVIEW else (1920, 1080), samples=32 if PREVIEW else 200, exposure=0.2)
bpy.ops.render.render(write_still=True)
print('RENDERED', OUT)
