"""Side-scroller environment slice 1, "Foundry Docks": look-dev render.

Run: blender -b --factory-startup -P tools/blender/sidescroller_slice1.py -- <out.png> [preview]
Side view along +X. Playable surface z=0 (near bank and far bank), flooded
channel between them, a raised catwalk, an enemy bunker; midground plant and a
background refinery skyline under the Tyrant citadel's furnace glow.
"""
import bpy, sys, os, math, random
from mathutils import Vector, Euler
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sidescroller_kit as K

random.seed(7)
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = args[0] if args else os.path.abspath('slice1.png')
PREVIEW = 'preview' in args
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))

K.reset()
sc = bpy.context.scene
PLAY = K.coll('Playable')
MID = K.coll('Midground')
BG = K.coll('Background')
FX = K.coll('Atmosphere')
CAST = K.coll('ScaleCast')

# ---------------------------------------------------------------- materials
olive = K.painted_metal('Steel_Olive', (0.16, 0.17, 0.13), wear=0.9, streak=0.6)
gunmetal = K.painted_metal('Steel_Gunmetal', (0.07, 0.075, 0.08), wear=0.7, rough=0.38)
rustred = K.painted_metal('Steel_OxideRed', (0.30, 0.06, 0.035), wear=1.0, streak=0.8)
bone = K.painted_metal('Steel_Bone', (0.42, 0.39, 0.32), wear=1.0, streak=0.9)
dark = K.painted_metal('Steel_Dark', (0.035, 0.035, 0.04), wear=0.4, rough=0.5)
conc = K.concrete('Concrete', (0.24, 0.235, 0.22))
tank_paint = K.painted_metal('Steel_TankGreen', (0.11, 0.12, 0.1), wear=0.8, streak=1.0)
conc_dark = K.concrete('Concrete_Dark', (0.2, 0.2, 0.19))
haz = K.hazard()
wat = K.water()
lamp_warm = K.emissive('Lamp_Warm', (1.0, 0.55, 0.22), 25)
lamp_red = K.emissive('Lamp_Red', (1.0, 0.08, 0.03), 30)
furnace = K.emissive('Furnace', (1.0, 0.32, 0.06), 1.5)
window = K.emissive('Window_Amber', (1.0, 0.45, 0.15), 6)
sil_near = K.flat('Silhouette_Near', (0.05, 0.05, 0.055), rough=0.7, metal=0.5)
sil_far = K.flat('Silhouette_Far', (0.06, 0.055, 0.055), rough=0.8)
sandbag = K.concrete('Sandbag', (0.28, 0.24, 0.17), grime=1.0)
rubber = K.flat('Rubber', (0.02, 0.02, 0.02), rough=0.8)

# ============================================================ PLAYABLE LANE
# Near bank: pier block x -16..-4, deck top at z=0, faces camera at y=-2.5
def pier(x0, x1, top=0.0, depth=5.0, height=14.0, name='Pier'):
    w = x1 - x0
    cx = (x0 + x1) / 2
    parts = []
    parts.append(K.box(name + '_Mass', (w, depth, height), (cx, depth / 2 - 2.5, top - height / 2 - 0.25), conc, bevel=0.06, collection=PLAY))
    # steel deck cap with lip
    parts.append(K.box(name + '_Cap', (w + 0.1, depth, 0.25), (cx, depth / 2 - 2.5, top - 0.125), gunmetal, bevel=0.03, collection=PLAY))
    parts.append(K.box(name + '_Lip', (w + 0.14, 0.18, 0.42), (cx, -2.55, top - 0.16), haz, bevel=0.025, collection=PLAY))
    # vertical ribs on the concrete face
    n = max(2, int(w / 2.4))
    for i in range(n + 1):
        x = x0 + 0.35 + i * (w - 0.7) / n
        parts.append(K.box(f'{name}_Rib{i}', (0.32, 0.25, height - 0.5), (x, -2.55, top - height / 2 - 0.5), conc_dark, bevel=0.04, collection=PLAY))
    # deck plate seams across the walkable top
    for i in range(int(w / 2.4)):
        x = x0 + 1.2 + i * 2.4
        parts.append(K.box(f'{name}_Seam{i}', (0.035, depth - 0.3, 0.01), (x, depth / 2 - 2.4, top + 0.002), dark, bevel=0.0, collection=PLAY))
    # drain pipe down the face
    parts.append(K.cyl(name + '_Drain', 0.12, height - 0.4, (x0 + w * 0.62, -2.82, top - height / 2 - 0.3), gunmetal, verts=20, collection=PLAY))
    return parts

pier(-17.5, -3.6, name='NearPier')
pier(3.4, 17.5, name='FarPier')

# Channel: walls dropping to water at z=-1.6
K.box('Channel_Floor', (7.4, 5.0, 0.6), (-0.1, 0.0, -4.6), conc_dark, bevel=0.05, collection=PLAY)
K.box('Channel_BackWall', (7.4, 0.8, 4.4), (-0.1, 2.5, -2.4), conc, bevel=0.05, collection=PLAY)
water_obj = K.box('Water', (7.6, 5.4, 3.0), (-0.1, 0.0, -3.1), wat, bevel=0.0, collection=PLAY)
water_obj.modifiers.clear()
# sunken girder sticking out of the water: a diagonal truss
gx = -1.2
A0, A1 = Vector((-2.6, 0.2, -2.2)), Vector((0.6, 0.2, 0.9))
B0, B1 = A0 + Vector((-0.49, 0, 0.5)), A1 + Vector((-0.49, 0, 0.5))
K.tube('Girder_ChordA', [tuple(A0), tuple(A1)], 0.12, rustred, collection=PLAY)
K.tube('Girder_ChordB', [tuple(B0), tuple(B1)], 0.12, rustred, collection=PLAY)
for i in range(6):
    t = i / 5
    pa, pb = A0.lerp(A1, t), B0.lerp(B1, t)
    K.tube(f'Girder_Tie{i}', [tuple(pa), tuple(pb)], 0.06, rustred, collection=PLAY)
    if i < 5:
        K.tube(f'Girder_Diag{i}', [tuple(pa), tuple(B0.lerp(B1, t + 0.2))], 0.045, rustred, collection=PLAY)
# broken deck slab tilted into the channel (a stepping stone)
K.box('Slab_Broken', (2.2, 3.0, 0.35), (2.3, 0.2, -0.95), conc, bevel=0.05, rot=(0, math.radians(-14), 0), collection=PLAY)

# --- near bank dressing: barricade, barrels, crate stack, lamp
def sandbags(x, y, rows=3, count=5):
    for r in range(rows):
        for i in range(count - r):
            o = K.box(f'Bag_{x}_{r}_{i}', (0.62, 0.36, 0.24), (x + i * 0.58 + r * 0.29, y, 0.13 + r * 0.22), sandbag, bevel=0.09, segs=3, collection=PLAY)
            o.rotation_euler.z = random.uniform(-0.08, 0.08)
            o.rotation_euler.x = random.uniform(-0.04, 0.04)

sandbags(-12.6, -0.6)
K.box('Barricade_Plate', (2.6, 0.12, 1.25), (-11.4, -0.2, 0.62), olive, bevel=0.03, rot=(math.radians(-8), 0, 0), collection=PLAY)
K.box('Barricade_Brace', (0.1, 0.9, 1.2), (-12.3, 0.2, 0.55), gunmetal, bevel=0.02, rot=(math.radians(35), 0, 0), collection=PLAY)
K.box('Barricade_Brace2', (0.1, 0.9, 1.2), (-10.5, 0.2, 0.55), gunmetal, bevel=0.02, rot=(math.radians(35), 0, 0), collection=PLAY)

def barrel(name, loc, mat, tilt=0.0):
    b = K.cyl(name, 0.38, 1.1, (loc[0], loc[1], loc[2] + 0.55), mat, verts=40, bevel=0.02, collection=PLAY)
    b.rotation_euler = (tilt, 0, random.uniform(0, 6.28))
    for z in (-0.3, 0.3):
        r = K.cyl(name + f'_Hoop{z}', 0.395, 0.06, (0, 0, z), mat, verts=40, bevel=0.01, collection=PLAY)
        r.parent = b
    return b

barrel('Barrel_A', (-8.9, -0.6, 0), rustred)
barrel('Barrel_B', (-8.15, -0.2, 0), rustred)
barrel('Barrel_C', (-8.55, 0.6, 0), olive)
# tyre fenders hung on the channel walls
for i, x in enumerate((-3.75, 3.55)):
    t = bpy.data.objects.new(f'Fender{i}', None)
    import bmesh
    me = bpy.data.meshes.new(f'Fender{i}')
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=32, radius1=0.42, radius2=0.42, depth=0.32)
    bm.to_mesh(me)
    bm.free()
    f = bpy.data.objects.new(f'Fender{i}', me)
    sc.collection.objects.link(f)
    f.location = (x, -1.6, -0.75)
    f.rotation_euler = (0, math.radians(90), 0)
    K._finish(f, rubber, 0.08, 3, PLAY)
    K.tube(f'FenderChain{i}', [(x, -1.6, -0.35), (x, -1.9, 0.02)], 0.025, gunmetal, collection=PLAY)

def crate(name, loc, s=1.1, mat=None):
    mat = mat or olive
    c = K.box(name, (s, s, s), (loc[0], loc[1], loc[2] + s / 2), mat, bevel=0.035, collection=PLAY)
    # frame ribs
    for sx in (-1, 1):
        for sz in (-1, 1):
            e = K.box(name + f'_E{sx}{sz}', (0.09, s + 0.02, 0.09), (sx * (s / 2 - 0.02), 0, sz * (s / 2 - 0.02)), gunmetal, bevel=0.015, collection=PLAY)
            e.parent = c
    st = K.box(name + '_Band', (s + 0.02, s + 0.02, 0.12), (0, 0, 0), dark, bevel=0.01, collection=PLAY)
    st.parent = c
    return c

crate('Crate_A', (-5.0, -0.3, 0))
crate('Crate_B', (-4.15, 0.25, 0), 0.95)
crate('Crate_C', (-4.85, -0.15, 1.1), 0.9, bone)

def lamp(name, x, y, h=4.6, side=1):
    K.cyl(name + '_Pole', 0.09, h, (x, y, h / 2), gunmetal, verts=16, collection=PLAY)
    K.cyl(name + '_Base', 0.2, 0.3, (x, y, 0.15), gunmetal, verts=16, collection=PLAY)
    K.tube(name + '_Arm', [(x, y, h - 0.1), (x + side * 0.6, y, h + 0.15), (x + side * 1.0, y, h + 0.1)], 0.05, gunmetal, collection=PLAY)
    K.box(name + '_Head', (0.55, 0.32, 0.16), (x + side * 1.0, y, h + 0.02), dark, bevel=0.03, collection=PLAY)
    K.box(name + '_Bulb', (0.42, 0.22, 0.03), (x + side * 1.0, y, h - 0.07), lamp_warm, bevel=0.0, collection=PLAY)
    L = bpy.data.lights.new(name + '_Light', 'SPOT')
    L.energy = 900
    L.color = (1.0, 0.62, 0.32)
    L.spot_size = math.radians(85)
    L.spot_blend = 0.6
    L.shadow_soft_size = 0.25
    o = bpy.data.objects.new(name + '_Light', L)
    o.location = (x + side * 1.0, y, h - 0.15)
    sc.collection.objects.link(o)
    K.link(o, PLAY)

lamp('LampNear', -7.0, 1.6)
lamp('LampFar', 3.9, 1.8, side=1)

# --- far bank: raised catwalk platform z=2.6 from x 5.2..12
CW_Z = 2.6
def catwalk(x0, x1, z, y0=-0.9, y1=0.9):
    w = x1 - x0
    cx = (x0 + x1) / 2
    K.box('Catwalk_FrameFront', (w, 0.14, 0.32), (cx, y0, z - 0.16), gunmetal, bevel=0.02, collection=PLAY)
    K.box('Catwalk_FrameBack', (w, 0.14, 0.32), (cx, y1, z - 0.16), gunmetal, bevel=0.02, collection=PLAY)
    # grating bars
    bar = K.box('Grate_Bar', (0.04, y1 - y0, 0.09), (x0 + 0.1, (y0 + y1) / 2, z - 0.06), dark, bevel=0.0, collection=PLAY)
    bar.modifiers.clear()
    arr = bar.modifiers.new('Arr', 'ARRAY')
    arr.count = int(w / 0.09)
    arr.relative_offset_displace = (0, 0, 0)
    arr.use_relative_offset = False
    arr.use_constant_offset = True
    arr.constant_offset_displace = (0.09, 0, 0)
    for i in range(3):
        K.box(f'Grate_Cross{i}', (w, 0.05, 0.05), (cx, y0 + (i + 0.5) * (y1 - y0) / 3, z - 0.1), dark, bevel=0.0, collection=PLAY)
    # legs (I-beam columns) with cross braces
    xs = [x0 + 0.25, cx, x1 - 0.25]
    for i, x in enumerate(xs):
        for y in (y0 + 0.1, y1 - 0.1):
            K.box(f'Leg_{i}_{y:.1f}', (0.22, 0.22, z), (x, y, z / 2 - 0.3), olive, bevel=0.02, collection=PLAY)
        if i < len(xs) - 1:
            xn = xs[i + 1]
            K.tube(f'Brace_{i}', [(x, y0 + 0.1, 0.1), (xn, y0 + 0.1, z - 0.4)], 0.04, olive, collection=PLAY)
            K.tube(f'BraceB_{i}', [(x, y0 + 0.1, z - 0.4), (xn, y0 + 0.1, 0.1)], 0.04, olive, collection=PLAY)
    # railing on the back side only (front stays open for readability)
    posts = []
    for i in range(int(w / 1.4) + 1):
        x = x0 + 0.1 + i * (w - 0.2) / int(w / 1.4)
        K.cyl(f'RailPost{i}', 0.035, 1.05, (x, y1, z + 0.52), haz, verts=12, collection=PLAY)
    K.tube('RailTop', [(x0 + 0.1, y1, z + 1.05), (x1 - 0.1, y1, z + 1.05)], 0.04, haz, collection=PLAY)
    K.tube('RailMid', [(x0 + 0.1, y1, z + 0.55), (x1 - 0.1, y1, z + 0.55)], 0.03, gunmetal, collection=PLAY)
    # ladder
    lx = x0 - 0.35
    for s in (-0.25, 0.25):
        K.box(f'Ladder_Side{s}', (0.06, 0.06, z + 1.0), (lx, s, (z + 1.0) / 2), haz, bevel=0.01, collection=PLAY)
    for i in range(int(z / 0.3)):
        K.cyl(f'Rung{i}', 0.022, 0.5, (lx, 0, 0.3 + i * 0.3), gunmetal, verts=10, rot=(math.radians(90), 0, 0), collection=PLAY)

catwalk(5.4, 11.6, CW_Z)

# --- enemy bunker on far bank
BX = 14.3
K.box('Bunker_Mass', (4.6, 4.0, 3.1), (BX, 0.6, 1.55), conc, bevel=0.12, segs=3, collection=PLAY)
K.box('Bunker_Roof', (5.0, 4.4, 0.5), (BX, 0.6, 3.25), conc_dark, bevel=0.12, segs=3, collection=PLAY)
K.box('Bunker_Slot', (2.2, 0.6, 0.42), (BX - 0.3, -1.45, 1.75), dark, bevel=0.03, collection=PLAY)
K.box('Bunker_Armour', (2.9, 0.22, 1.35), (BX - 0.3, -1.52, 0.68), rustred, bevel=0.03, collection=PLAY)
for i in range(4):
    K.cyl(f'Bunker_Bolt{i}', 0.06, 0.08, (BX - 1.5 + i, -1.66, 1.25), dark, verts=12, rot=(math.radians(90), 0, 0), collection=PLAY)
# turret gun poking from slot, aimed left
K.cyl('Turret_Barrel', 0.11, 2.2, (BX - 1.9, -1.4, 1.75), gunmetal, verts=24, rot=(0, math.radians(90), 0), collection=PLAY)
K.cyl('Turret_Muzzle', 0.17, 0.35, (BX - 3.0, -1.4, 1.75), dark, verts=24, rot=(0, math.radians(90), 0), collection=PLAY)
K.cyl('Turret_Mantlet', 0.42, 0.5, (BX - 0.7, -1.4, 1.75), olive, verts=32, rot=(0, math.radians(90), 0), collection=PLAY)
K.box('Turret_Sight', (0.18, 0.06, 0.06), (BX - 0.85, -1.7, 2.12), lamp_red, bevel=0.0, collection=PLAY)
# warning light on roof
K.cyl('Bunker_Beacon', 0.13, 0.22, (BX + 1.6, -0.6, 3.62), lamp_red, verts=16, collection=PLAY)

# ================================================================ MIDGROUND
# Yard ground behind the lane, out to the horizon
G = -30.0  # yard level far below the causeway
yard = K.box('Yard', (900, 600, 1.0), (0, 302.5, G - 0.5), conc_dark, bevel=0.0, collection=MID)
yard.modifiers.clear()
for i in range(-6, 8):
    K.box(f'YardJoint{i}', (0.08, 40, 0.02), (i * 6.0, 23, G + 0.01), dark, bevel=0.0, collection=MID)

# Storage tanks
for i, (x, y, r, h) in enumerate([(-13, 34, 4.2, 26.0), (1.5, 40, 5.2, 31.0), (21, 30, 3.6, 24.5)]):
    K.cyl(f'Tank{i}', r, h, (x, y, G + h / 2), tank_paint, verts=64, bevel=0.06, collection=MID)
    K.cyl(f'TankRoof{i}', r + 0.1, 0.9, (x, y, G + h + 0.45), tank_paint, verts=64, r2=r * 0.55, bevel=0.04, collection=MID)
    for k in range(4):
        K.cyl(f'TankRing{i}_{k}', r + 0.04, 0.12, (x, y, G + 1.2 + k * (h - 2) / 3), gunmetal, verts=64, collection=MID)
    # spiral stair hint: a vertical ladder cage
    K.box(f'TankLadder{i}', (0.5, 0.1, h), (x - r * 0.7, y - r * 0.72, G + h / 2), haz, bevel=0.01, collection=MID)

# Gantry crane over the channel
_ = None  # K.box('Gantry_LegL', (0.6, 0.6, 44), (-4.5, 11.5, G + 22), olive, bevel=0.05, collection=MID)
_ = None  # K.box('Gantry_LegR', (0.6, 0.6, 44), (5.5, 11.5, G + 22), olive, bevel=0.05, collection=MID)
_ = None  # K.box('Gantry_Beam', (13.5, 1.0, 1.3), (0.5, 11.5, 14.4), olive, bevel=0.05, collection=MID)
_ = None  # K.box('Gantry_Cab', (2.2, 1.8, 1.6), (2.0, 11.0, 12.9), olive, bevel=0.06, collection=MID)
_ = None  # K.box('Gantry_CabWin', (1.6, 0.05, 0.6), (2.0, 10.08, 13.1), window, bevel=0.0, collection=MID)
K.tube('Gantry_Cable', [(1.2, 11.0, 30.0), (1.2, 11.0, 5.8)], 0.03, dark, collection=MID)
K.box('Gantry_Hook', (0.5, 0.3, 0.7), (1.2, 11.0, 5.5), dark, bevel=0.05, collection=MID)
K.box('Gantry_Load', (3.2, 1.8, 1.4), (1.2, 11.0, 4.4), rustred, bevel=0.05, collection=MID)

# Plant building with lit windows (right)
K.box('Plant_Block', (14, 8, 36), (28, 22, G + 18), conc_dark, bevel=0.1, collection=MID)
for r in range(3):
    for c in range(6):
        if random.random() < 0.55:
            K.box(f'PlantWin{r}_{c}', (1.1, 0.05, 0.7), (22.2 + c * 2.1, 17.95, -1.5 + r * 2.6), window, bevel=0.0, collection=MID)

# ================================================================ BACKGROUND
def stack(name, x, y, r, h, top_glow=False):
    h = h + 30
    K.cyl(name, r, h, (x, y, G + h / 2), sil_near, verts=32, r2=r * 0.82, bevel=0.0, collection=BG)
    for k in range(3):
        K.cyl(name + f'_Band{k}', r * (1.02 - k * 0.06), 0.5, (x, y, G + h * (0.55 + k * 0.15)), sil_far, verts=32, bevel=0.0, collection=BG)
    if top_glow:
        K.cyl(name + '_Ember', r * 0.78, 0.3, (x, y, G + h + 0.1), furnace, verts=32, bevel=0.0, collection=BG)
    for k in range(3):
        K.cyl(name + f'_Beacon{k}', 0.25, 0.25, (x + r * 0.9, y - r * 0.2, G + h * (0.4 + k * 0.25)), lamp_red, verts=8, bevel=0.0, collection=BG)

stack('Stack_A', -22, 70, 2.4, 22, True)
stack('Stack_B', -16, 85, 2.0, 16, True)
stack('Stack_C', 12, 95, 2.6, 28, True)
stack('Stack_D', 30, 80, 1.8, 14)

# refinery skyline: varied industrial silhouettes, backlit by the low sun
def refinery_unit(i, x, y):
    base_h = 28 + random.uniform(1.5, 6)
    w = random.uniform(5, 10)
    K.box(f'Sky{i}_Base', (w, 6, base_h), (x, y, G + base_h / 2), sil_far, bevel=0.0, collection=BG)
    top = G + base_h
    for k in range(random.randint(1, 3)):
        kind = random.random()
        px = x + random.uniform(-w / 2, w / 2)
        if kind < 0.4:  # thin flare stack
            h = random.uniform(6, 16)
            K.cyl(f'Sky{i}_Flue{k}', random.uniform(0.25, 0.6), h, (px, y, top + h / 2), sil_far, verts=10, bevel=0.0, collection=BG)
            if random.random() < 0.5:
                K.cyl(f'Sky{i}_Light{k}', 0.2, 0.2, (px, y - 0.7, top + h - 0.3), lamp_red, verts=6, bevel=0.0, collection=BG)
        elif kind < 0.7:  # squat tank on the roof
            r = random.uniform(1.2, 2.5)
            h = random.uniform(2, 5)
            K.cyl(f'Sky{i}_Tank{k}', r, h, (px, y, top + h / 2), sil_far, verts=24, bevel=0.0, collection=BG)
        else:  # lattice tower
            h = random.uniform(8, 18)
            for s in (-0.6, 0.6):
                K.box(f'Sky{i}_Tw{k}{s}', (0.15, 0.15, h), (px + s, y, top + h / 2), sil_far, bevel=0.0, collection=BG)
            for j in range(int(h / 1.5)):
                K.box(f'Sky{i}_TwX{k}_{j}', (1.3, 0.1, 0.08), (px, y, top + 0.75 + j * 1.5), sil_far, bevel=0.0, rot=(0, (0.6 if j % 2 else -0.6), 0), collection=BG)
    if random.random() < 0.5:
        K.box(f'Sky{i}_Pipe', (random.uniform(6, 14), 0.4, 0.4), (x + w / 2, y - 1, top - random.uniform(2, 6)), sil_far, bevel=0.0, collection=BG)
    for k in range(random.randint(0, 3)):
        K.box(f'Sky{i}_Win{k}', (0.9, 0.1, 0.35), (x + random.uniform(-w / 2.5, w / 2.5), y - 3.05, top - random.uniform(1, 4)), window, bevel=0.0, collection=BG)

for i in range(22):
    refinery_unit(i, -75 + i * 7 + random.uniform(-2, 2), random.uniform(105, 130))
# The Tyrant citadel: a jagged fortress on the right horizon with a furnace maw
CX, CY = 30, 170
K.box('Citadel_Base', (60, 20, 56), (CX, CY, G + 28), sil_far, bevel=0.0, collection=BG)
for i, (dx, w, h) in enumerate([(-22, 7, 22), (-10, 9, 34), (4, 12, 48), (18, 8, 30), (28, 6, 18)]):
    t = K.cyl(f'Citadel_Spire{i}', w / 2, h, (CX + dx, CY, G + 30 + h / 2), sil_far, verts=6, r2=w * 0.08, bevel=0.0, collection=BG)
for k in range(9):
    K.box(f'Citadel_Win{k}', (1.6, 1.0, 0.7), (CX - 20 + k * 5 + random.uniform(-1, 1), CY - 10.5, 6 + random.uniform(0, 14)), furnace, bevel=0.0, collection=BG)
_ = None  # K.box('Citadel_Slit1', (1.2, 1.0, 18), (CX - 10, CY - 10.5, 30), furnace, bevel=0.0, collection=BG)
_ = None  # K.box('Citadel_Slit2', (1.2, 1.0, 22), (CX + 4, CY - 10.5, 38), furnace, bevel=0.0, collection=BG)
fl = bpy.data.lights.new('CitadelGlow', 'POINT')
fl.energy = 2.5e6
fl.color = (1.0, 0.35, 0.08)
fl.shadow_soft_size = 8
fo = bpy.data.objects.new('CitadelGlow', fl)
fo.location = (CX + 4, CY - 18, 18)
sc.collection.objects.link(fo)
K.link(fo, BG)

# ============================================================== ATMOSPHERE
def plume(name, x, y, z, s, density=0.8, color=(0.16, 0.15, 0.14)):
    me = bpy.data.meshes.new(name)
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=2, radius=1.0)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    sc.collection.objects.link(o)
    o.location = (x, y, z)
    o.scale = s
    o.data.materials.append(K.smoke('Smoke_' + name, density, color))
    K.link(o, FX)
    return o

plume('Plume_A', -20, 70, 27, (6, 5, 9), 0.35, (0.06, 0.055, 0.055))
plume('Plume_B', -14, 85, 21, (4, 4, 7), 0.3, (0.06, 0.055, 0.055))
plume('Plume_C', 15, 95, 35, (7, 6, 11), 0.35, (0.06, 0.055, 0.055))
# low steam drifting off the channel
plume('Steam_Channel', 0, 0.8, -0.6, (4.0, 2.0, 1.4), 0.08, (0.6, 0.6, 0.6))

# Haze: a big scattering volume behind the playable lane (keeps the lane crisp)
haze = K.box('Haze', (500, 264, 42), (0, 138, -9), None, bevel=0.0, collection=FX)
haze.modifiers.clear()
hm = bpy.data.materials.new('HazeVol')
nt, nodes, links = K._nodes(hm)
out = K._n(nodes, 'ShaderNodeOutputMaterial', (300, 0))
pv = K._n(nodes, 'ShaderNodeVolumePrincipled', (0, 0))
pv.inputs['Color'].default_value = (0.55, 0.45, 0.42, 1)
pv.inputs['Density'].default_value = 0.0006
pv.inputs['Anisotropy'].default_value = 0.2
links.new(pv.outputs[0], out.inputs['Volume'])
haze.data.materials.append(hm)
low = K.box('LowFog', (500, 300, 26), (0, 152, G + 11), None, bevel=0.0, collection=FX)
low.modifiers.clear()
lm = bpy.data.materials.new('LowFogVol')
nt, nodes, links = K._nodes(lm)
out = K._n(nodes, 'ShaderNodeOutputMaterial', (300, 0))
pv2 = K._n(nodes, 'ShaderNodeVolumePrincipled', (0, 0))
pv2.inputs['Color'].default_value = (0.8, 0.6, 0.48, 1)
pv2.inputs['Density'].default_value = 0.006
pv2.inputs['Anisotropy'].default_value = 0.4
links.new(pv2.outputs[0], out.inputs['Volume'])
low.data.materials.append(lm)

# ================================================================ SCALE CAST
def import_glb(path, height, loc, rot_z=0.0):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    for o in [o for o in new if o.name.startswith('Icosphere')]:
        bpy.data.objects.remove(o)
    new = [o for o in bpy.data.objects if o not in before]
    for o in new:
        K.link(o, CAST)
    roots = [o for o in new if o.parent is None]
    bpy.context.view_layer.update()
    pts = [o.matrix_world @ Vector(c) for o in new if o.type == 'MESH' for c in o.bound_box]
    zmin = min(p.z for p in pts)
    zmax = max(p.z for p in pts)
    s = height / (zmax - zmin)
    e = bpy.data.objects.new('Cast_' + os.path.basename(path), None)
    sc.collection.objects.link(e)
    K.link(e, CAST)
    for r in roots:
        r.parent = e
    e.scale = (s, s, s)
    e.location = (loc[0], loc[1], loc[2] - zmin * s)
    e.rotation_euler.z = rot_z
    return e

cmd = os.path.join(REPO, 'delivery', 'playable', 'commander.glb')
if os.path.exists(cmd):
    import_glb(cmd, 1.9, (-6.4, -1.0, 0.0), math.radians(90))

# ============================================================== LIGHT & CAM
SUN_DIR = Vector((0.42, 1.0, 0.07)).normalized()  # towards the sun: low, behind-right
w = bpy.data.worlds.new('Dusk')
sc.world = w
wnt, wn, wl = K._nodes(w)
tc = K._n(wn, 'ShaderNodeTexCoord', (-1400, 0))
nrm = K._n(wn, 'ShaderNodeVectorMath', (-1200, 0)); nrm.operation = 'NORMALIZE'
wl.new(tc.outputs['Generated'], nrm.inputs[0])
sep = K._n(wn, 'ShaderNodeSeparateXYZ', (-1000, 100))
wl.new(nrm.outputs[0], sep.inputs[0])
# vertical gradient: hot horizon -> bruised violet -> deep night blue
grad = K._n(wn, 'ShaderNodeValToRGB', (-800, 150))
cr = grad.color_ramp
cr.elements[0].position = 0.0; cr.elements[0].color = (0.9, 0.36, 0.13, 1)
cr.elements[1].position = 0.32; cr.elements[1].color = (0.035, 0.04, 0.075, 1)
e = cr.elements.new(0.1); e.color = (0.36, 0.11, 0.09, 1)
mr = K._n(wn, 'ShaderNodeMapRange', (-1000, 300)); mr.inputs['From Min'].default_value = -0.02; mr.inputs['From Max'].default_value = 0.6
wl.new(sep.outputs['Z'], mr.inputs['Value']); wl.new(mr.outputs['Result'], grad.inputs['Fac'])
# sun glow lobes
dp = K._n(wn, 'ShaderNodeVectorMath', (-1000, -150)); dp.operation = 'DOT_PRODUCT'; dp.inputs[1].default_value = SUN_DIR
wl.new(nrm.outputs[0], dp.inputs[0])
cl = K._n(wn, 'ShaderNodeMath', (-850, -150)); cl.operation = 'MAXIMUM'; cl.inputs[1].default_value = 0.0
wl.new(dp.outputs['Value'], cl.inputs[0])
p1 = K._n(wn, 'ShaderNodeMath', (-700, -100)); p1.operation = 'POWER'; p1.inputs[1].default_value = 28.0
p2 = K._n(wn, 'ShaderNodeMath', (-700, -250)); p2.operation = 'POWER'; p2.inputs[1].default_value = 400.0
wl.new(cl.outputs[0], p1.inputs[0]); wl.new(cl.outputs[0], p2.inputs[0])
g1 = K._n(wn, 'ShaderNodeMix', (-500, -100)); g1.data_type = 'RGBA'; g1.blend_type = 'ADD'
g1.inputs['B'].default_value = (1.0, 0.42, 0.14, 1)
k1 = K._n(wn, 'ShaderNodeMath', (-600, -50)); k1.operation = 'MULTIPLY'; k1.inputs[1].default_value = 0.7
wl.new(p1.outputs[0], k1.inputs[0]); wl.new(k1.outputs[0], g1.inputs['Factor'])
wl.new(grad.outputs['Color'], g1.inputs['A'])
g2 = K._n(wn, 'ShaderNodeMix', (-300, -150)); g2.data_type = 'RGBA'; g2.blend_type = 'ADD'
g2.inputs['B'].default_value = (1.0, 0.8, 0.55, 1)
k2 = K._n(wn, 'ShaderNodeMath', (-450, -250)); k2.operation = 'MULTIPLY'; k2.inputs[1].default_value = 6.0
wl.new(p2.outputs[0], k2.inputs[0]); wl.new(k2.outputs[0], g2.inputs['Factor'])
wl.new(g1.outputs['Result'], g2.inputs['A'])
sky_bg = K._n(wn, 'ShaderNodeBackground', (-100, 100)); sky_bg.inputs[1].default_value = 1.0
wl.new(g2.outputs['Result'], sky_bg.inputs[0])
amb = K._n(wn, 'ShaderNodeBackground', (-100, -100)); amb.inputs[0].default_value = (0.16, 0.1, 0.1, 1); amb.inputs[1].default_value = 0.35
lp = K._n(wn, 'ShaderNodeLightPath', (-300, 300))
seen = K._n(wn, 'ShaderNodeMath', (-100, 300)); seen.operation = 'MAXIMUM'
wl.new(lp.outputs['Is Camera Ray'], seen.inputs[0]); wl.new(lp.outputs['Is Glossy Ray'], seen.inputs[1])
ms = K._n(wn, 'ShaderNodeMixShader', (100, 0))
wl.new(seen.outputs[0], ms.inputs[0]); wl.new(amb.outputs[0], ms.inputs[1]); wl.new(sky_bg.outputs[0], ms.inputs[2])
wo = K._n(wn, 'ShaderNodeOutputWorld', (300, 0))
wl.new(ms.outputs[0], wo.inputs[0])

sun = bpy.data.lights.new('Sun', 'SUN')
sun.energy = 3.0
sun.color = (1.0, 0.55, 0.3)
sun.angle = math.radians(2)
so = bpy.data.objects.new('Sun', sun)
so.rotation_euler = (-SUN_DIR).to_track_quat('-Z', 'Y').to_euler()
sc.collection.objects.link(so)
key = bpy.data.lights.new('KeyFill', 'AREA')
key.energy = 6000
key.size = 30
key.color = (0.62, 0.72, 0.9)
ko = bpy.data.objects.new('KeyFill', key)
ko.location = (-6, -26, 16)
ko.rotation_euler = Euler((math.radians(62), 0, math.radians(-12)))
sc.collection.objects.link(ko)
# the cool key only lights the playable lane and cast, so the backdrop stays a backlit silhouette
KEYLIT = K.coll('KeyLit')
for src in (PLAY, CAST):
    for o in src.all_objects:
        if o.name not in KEYLIT.objects:
            KEYLIT.objects.link(o)
ko.light_linking.receiver_collection = KEYLIT
sc.collection.children.unlink(KEYLIT)

cam = bpy.data.objects.new('Camera', bpy.data.cameras.new('Camera'))
sc.collection.objects.link(cam)
sc.camera = cam
cam.data.lens = 50
cam.data.clip_end = 1000
cam.location = (2.5, -30.0, 5.2)
cam.rotation_euler = Euler((math.radians(85), 0, 0))

K.setup_render(OUT, *(1170, 540) if PREVIEW else (2340, 1080), samples=48 if PREVIEW else 256)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(REPO, 'assets', 'source', 'sidescroller', 'slice1-foundry-docks.blend'))
bpy.ops.render.render(write_still=True)
print('RENDERED', OUT)
