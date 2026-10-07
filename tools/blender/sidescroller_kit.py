"""Side-scroller look-dev kit for Blender 5.2: procedural PBR materials and
bevelled hard-surface primitives. Imported by the scene scripts in this folder.

Materials are Cycles node graphs (edge wear from the Bevel node, crevice grime
from AO, object-space noise) so look-dev renders read as finished surfaces;
game exports bake them to texture atlases later.
"""
import bpy, bmesh, math, random
from mathutils import Vector

# ---------------------------------------------------------------- utilities

def reset():
    _MATS.clear()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)


def coll(name):
    c = bpy.data.collections.get(name)
    if not c:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
    return c


def link(obj, collection):
    for c in obj.users_collection:
        c.objects.unlink(obj)
    collection.objects.link(obj)
    return obj


def _nodes(mat):
    try:
        mat.use_nodes = True
    except Exception:
        pass
    nt = mat.node_tree
    nt.nodes.clear()
    return nt, nt.nodes, nt.links


def _n(nodes, kind, loc=(0, 0), **inputs):
    n = nodes.new(kind)
    n.location = loc
    for k, v in inputs.items():
        n.inputs[k].default_value = v
    return n


_MATS = {}


def _cache(key, build):
    if key not in _MATS:
        _MATS[key] = build()
    return _MATS[key]


def _wear_mask(nodes, links, radius=0.012, threshold=0.985, breakup=6.0, amount=1.0):
    """Edge mask: where the bevel-rounded normal departs from the true normal,
    broken up with noise so wear reads as chips, not an outline."""
    bev = _n(nodes, 'ShaderNodeBevel', (-900, 300))
    bev.samples = 8
    bev.inputs['Radius'].default_value = radius
    geo = _n(nodes, 'ShaderNodeNewGeometry', (-900, 100))
    dot = _n(nodes, 'ShaderNodeVectorMath', (-700, 250))
    dot.operation = 'DOT_PRODUCT'
    links.new(bev.outputs['Normal'], dot.inputs[0])
    links.new(geo.outputs['Normal'], dot.inputs[1])
    ramp = _n(nodes, 'ShaderNodeMapRange', (-520, 250))
    ramp.inputs['From Min'].default_value = threshold
    ramp.inputs['From Max'].default_value = 1.0
    ramp.inputs['To Min'].default_value = 1.0
    ramp.inputs['To Max'].default_value = 0.0
    links.new(dot.outputs['Value'], ramp.inputs['Value'])
    tc = _n(nodes, 'ShaderNodeTexCoord', (-1100, -100))
    nz = _n(nodes, 'ShaderNodeTexNoise', (-900, -100))
    nz.inputs['Scale'].default_value = breakup
    nz.inputs['Detail'].default_value = 8
    nz.inputs['Roughness'].default_value = 0.65
    links.new(tc.outputs['Object'], nz.inputs['Vector'])
    mul = _n(nodes, 'ShaderNodeMath', (-340, 200))
    mul.operation = 'MULTIPLY'
    links.new(ramp.outputs['Result'], mul.inputs[0])
    sub = _n(nodes, 'ShaderNodeMapRange', (-520, 0))
    sub.inputs['From Min'].default_value = 0.42
    sub.inputs['From Max'].default_value = 0.62
    links.new(nz.outputs['Fac'], sub.inputs['Value'])
    links.new(sub.outputs['Result'], mul.inputs[1])
    fin = _n(nodes, 'ShaderNodeMath', (-180, 200))
    fin.operation = 'MULTIPLY'
    fin.use_clamp = True
    fin.inputs[1].default_value = amount * 1.6
    links.new(mul.outputs[0], fin.inputs[0])
    return fin.outputs[0], tc


def _grime(nodes, links, tc, scale=1.4, ao_dist=0.6):
    """0..1 dirt: AO-driven crevice dirt plus large soft object-space blotches."""
    ao = _n(nodes, 'ShaderNodeAmbientOcclusion', (-900, -400))
    ao.samples = 12
    ao.inputs['Distance'].default_value = ao_dist
    inv = _n(nodes, 'ShaderNodeMath', (-700, -400))
    inv.operation = 'SUBTRACT'
    inv.inputs[0].default_value = 1.0
    links.new(ao.outputs['AO'], inv.inputs[1])
    nz = _n(nodes, 'ShaderNodeTexNoise', (-900, -600))
    nz.inputs['Scale'].default_value = scale
    nz.inputs['Detail'].default_value = 6
    links.new(tc.outputs['Object'], nz.inputs['Vector'])
    blot = _n(nodes, 'ShaderNodeMapRange', (-700, -600))
    blot.inputs['From Min'].default_value = 0.45
    blot.inputs['From Max'].default_value = 0.75
    links.new(nz.outputs['Fac'], blot.inputs['Value'])
    add = _n(nodes, 'ShaderNodeMath', (-520, -500))
    add.operation = 'ADD'
    add.use_clamp = True
    links.new(inv.outputs[0], add.inputs[0])
    sc = _n(nodes, 'ShaderNodeMath', (-620, -680))
    sc.operation = 'MULTIPLY'
    sc.inputs[1].default_value = 0.45
    links.new(blot.outputs['Result'], sc.inputs[0])
    links.new(sc.outputs[0], add.inputs[1])
    return add.outputs[0]


def _streaks(nodes, links, tc, scale=3.0):
    """Vertical rain/rust streaks in object space (stretched noise)."""
    mp = _n(nodes, 'ShaderNodeMapping', (-900, -850))
    mp.inputs['Scale'].default_value = (scale, scale, scale * 0.08)
    links.new(tc.outputs['Object'], mp.inputs['Vector'])
    nz = _n(nodes, 'ShaderNodeTexNoise', (-700, -850))
    nz.inputs['Scale'].default_value = 4
    nz.inputs['Detail'].default_value = 4
    links.new(mp.outputs['Vector'], nz.inputs['Vector'])
    mr = _n(nodes, 'ShaderNodeMapRange', (-520, -850))
    mr.inputs['From Min'].default_value = 0.55
    mr.inputs['From Max'].default_value = 0.8
    links.new(nz.outputs['Fac'], mr.inputs['Value'])
    return mr.outputs['Result']


def painted_metal(name, color, wear=1.0, grime=0.6, rough=0.42, bare=(0.55, 0.53, 0.5), streak=0.0, micro=40.0):
    def build():
        m = bpy.data.materials.new(name)
        nt, nodes, links = _nodes(m)
        out = _n(nodes, 'ShaderNodeOutputMaterial', (600, 0))
        bsdf = _n(nodes, 'ShaderNodeBsdfPrincipled', (300, 0))
        links.new(bsdf.outputs[0], out.inputs[0])
        wmask, tc = _wear_mask(nodes, links, amount=wear)
        dirt = _grime(nodes, links, tc)
        # paint colour with subtle tonal variation
        var = _n(nodes, 'ShaderNodeTexNoise', (-700, 600))
        var.inputs['Scale'].default_value = 2.2
        links.new(tc.outputs['Object'], var.inputs['Vector'])
        vmix = _n(nodes, 'ShaderNodeMix', (-500, 600))
        vmix.data_type = 'RGBA'
        vmix.blend_type = 'MULTIPLY'
        vmix.inputs['Factor'].default_value = 0.25
        vmix.inputs['A'].default_value = (*color, 1)
        links.new(var.outputs['Color'], vmix.inputs['B'])
        dmix = _n(nodes, 'ShaderNodeMix', (-200, 500))
        dmix.data_type = 'RGBA'
        dmix.blend_type = 'MULTIPLY'
        dmix.inputs['B'].default_value = (0.32, 0.27, 0.22, 1)
        dg = _n(nodes, 'ShaderNodeMath', (-340, 450))
        dg.operation = 'MULTIPLY'
        dg.inputs[1].default_value = grime
        links.new(dirt, dg.inputs[0])
        links.new(dg.outputs[0], dmix.inputs['Factor'])
        links.new(vmix.outputs['Result'], dmix.inputs['A'])
        col = dmix.outputs['Result']
        if streak > 0:
            st = _streaks(nodes, links, tc)
            sm = _n(nodes, 'ShaderNodeMix', (-60, 650))
            sm.data_type = 'RGBA'
            sm.blend_type = 'MULTIPLY'
            sm.inputs['B'].default_value = (0.45, 0.28, 0.16, 1)
            sf = _n(nodes, 'ShaderNodeMath', (-200, 700))
            sf.operation = 'MULTIPLY'
            sf.inputs[1].default_value = streak
            links.new(st, sf.inputs[0])
            links.new(sf.outputs[0], sm.inputs['Factor'])
            links.new(col, sm.inputs['A'])
            col = sm.outputs['Result']
        emix = _n(nodes, 'ShaderNodeMix', (80, 400))
        emix.data_type = 'RGBA'
        emix.inputs['B'].default_value = (*bare, 1)
        links.new(wmask, emix.inputs['Factor'])
        links.new(col, emix.inputs['A'])
        links.new(emix.outputs['Result'], bsdf.inputs['Base Color'])
        met = _n(nodes, 'ShaderNodeMapRange', (80, 150))
        met.inputs['To Min'].default_value = 0.15
        met.inputs['To Max'].default_value = 1.0
        links.new(wmask, met.inputs['Value'])
        links.new(met.outputs['Result'], bsdf.inputs['Metallic'])
        rr = _n(nodes, 'ShaderNodeMapRange', (80, -50))
        rr.inputs['To Min'].default_value = rough
        rr.inputs['To Max'].default_value = min(1, rough + 0.4)
        links.new(dirt, rr.inputs['Value'])
        rw = _n(nodes, 'ShaderNodeMix', (200, -100))
        rw.data_type = 'FLOAT'
        rw.inputs['B'].default_value = 0.28
        links.new(wmask, rw.inputs['Factor'])
        links.new(rr.outputs['Result'], rw.inputs['A'])
        links.new(rw.outputs['Result'], bsdf.inputs['Roughness'])
        # micro dents
        bn = _n(nodes, 'ShaderNodeTexNoise', (-200, -300))
        bn.inputs['Scale'].default_value = micro
        bn.inputs['Detail'].default_value = 3
        links.new(tc.outputs['Object'], bn.inputs['Vector'])
        bump = _n(nodes, 'ShaderNodeBump', (100, -300))
        bump.inputs['Strength'].default_value = 0.06
        links.new(bn.outputs['Fac'], bump.inputs['Height'])
        links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
        return m
    return _cache(name, build)


def concrete(name='Concrete', color=(0.36, 0.35, 0.33), grime=0.8):
    def build():
        m = bpy.data.materials.new(name)
        nt, nodes, links = _nodes(m)
        out = _n(nodes, 'ShaderNodeOutputMaterial', (600, 0))
        bsdf = _n(nodes, 'ShaderNodeBsdfPrincipled', (300, 0))
        links.new(bsdf.outputs[0], out.inputs[0])
        wmask, tc = _wear_mask(nodes, links, radius=0.03, threshold=0.97, breakup=3, amount=1)
        dirt = _grime(nodes, links, tc, scale=0.8, ao_dist=1.2)
        st = _streaks(nodes, links, tc, scale=1.6)
        vo = _n(nodes, 'ShaderNodeTexVoronoi', (-700, 700))
        vo.inputs['Scale'].default_value = 28
        links.new(tc.outputs['Object'], vo.inputs['Vector'])
        nz = _n(nodes, 'ShaderNodeTexNoise', (-700, 500))
        nz.inputs['Scale'].default_value = 6
        nz.inputs['Detail'].default_value = 12
        links.new(tc.outputs['Object'], nz.inputs['Vector'])
        base = _n(nodes, 'ShaderNodeMix', (-450, 600))
        base.data_type = 'RGBA'
        base.blend_type = 'OVERLAY'
        base.inputs['Factor'].default_value = 0.35
        base.inputs['A'].default_value = (*color, 1)
        links.new(nz.outputs['Color'], base.inputs['B'])
        d = _n(nodes, 'ShaderNodeMix', (-200, 500))
        d.data_type = 'RGBA'
        d.blend_type = 'MULTIPLY'
        d.inputs['B'].default_value = (0.25, 0.22, 0.19, 1)
        tot = _n(nodes, 'ShaderNodeMath', (-340, 420))
        tot.operation = 'ADD'
        tot.use_clamp = True
        links.new(dirt, tot.inputs[0])
        sm = _n(nodes, 'ShaderNodeMath', (-480, 380))
        sm.operation = 'MULTIPLY'
        sm.inputs[1].default_value = 0.6
        links.new(st, sm.inputs[0])
        links.new(sm.outputs[0], tot.inputs[1])
        g = _n(nodes, 'ShaderNodeMath', (-260, 380))
        g.operation = 'MULTIPLY'
        g.inputs[1].default_value = grime
        links.new(tot.outputs[0], g.inputs[0])
        links.new(g.outputs[0], d.inputs['Factor'])
        links.new(base.outputs['Result'], d.inputs['A'])
        chip = _n(nodes, 'ShaderNodeMix', (0, 500))
        chip.data_type = 'RGBA'
        chip.inputs['B'].default_value = (0.52, 0.5, 0.46, 1)
        links.new(wmask, chip.inputs['Factor'])
        links.new(d.outputs['Result'], chip.inputs['A'])
        links.new(chip.outputs['Result'], bsdf.inputs['Base Color'])
        bsdf.inputs['Roughness'].default_value = 0.88
        bump = _n(nodes, 'ShaderNodeBump', (100, -300))
        bump.inputs['Strength'].default_value = 0.25
        bh = _n(nodes, 'ShaderNodeMath', (-100, -300))
        bh.operation = 'ADD'
        links.new(nz.outputs['Fac'], bh.inputs[0])
        vd = _n(nodes, 'ShaderNodeMath', (-250, -350))
        vd.operation = 'MULTIPLY'
        vd.inputs[1].default_value = 0.3
        links.new(vo.outputs['Distance'], vd.inputs[0])
        links.new(vd.outputs[0], bh.inputs[1])
        links.new(bh.outputs[0], bump.inputs['Height'])
        links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
        return m
    return _cache(name, build)


def hazard(name='Hazard', a=(0.75, 0.52, 0.05), b=(0.03, 0.03, 0.03), scale=3.0):
    def build():
        m = bpy.data.materials.new(name)
        nt, nodes, links = _nodes(m)
        out = _n(nodes, 'ShaderNodeOutputMaterial', (600, 0))
        bsdf = _n(nodes, 'ShaderNodeBsdfPrincipled', (300, 0))
        links.new(bsdf.outputs[0], out.inputs[0])
        wmask, tc = _wear_mask(nodes, links, amount=1.2, breakup=9)
        dirt = _grime(nodes, links, tc)
        wv = _n(nodes, 'ShaderNodeTexWave', (-700, 600))
        wv.wave_type = 'BANDS'
        wv.bands_direction = 'DIAGONAL'
        wv.inputs['Scale'].default_value = scale
        links.new(tc.outputs['Object'], wv.inputs['Vector'])
        sq = _n(nodes, 'ShaderNodeMath', (-520, 600))
        sq.operation = 'GREATER_THAN'
        sq.inputs[1].default_value = 0.5
        links.new(wv.outputs['Fac'], sq.inputs[0])
        mix = _n(nodes, 'ShaderNodeMix', (-350, 600))
        mix.data_type = 'RGBA'
        mix.inputs['A'].default_value = (*a, 1)
        mix.inputs['B'].default_value = (*b, 1)
        links.new(sq.outputs[0], mix.inputs['Factor'])
        d = _n(nodes, 'ShaderNodeMix', (-150, 500))
        d.data_type = 'RGBA'
        d.blend_type = 'MULTIPLY'
        d.inputs['B'].default_value = (0.3, 0.26, 0.2, 1)
        links.new(dirt, d.inputs['Factor'])
        links.new(mix.outputs['Result'], d.inputs['A'])
        ch = _n(nodes, 'ShaderNodeMix', (60, 450))
        ch.data_type = 'RGBA'
        ch.inputs['B'].default_value = (0.5, 0.48, 0.45, 1)
        links.new(wmask, ch.inputs['Factor'])
        links.new(d.outputs['Result'], ch.inputs['A'])
        links.new(ch.outputs['Result'], bsdf.inputs['Base Color'])
        links.new(wmask, bsdf.inputs['Metallic'])
        bsdf.inputs['Roughness'].default_value = 0.5
        return m
    return _cache(name, build)


def emissive(name, color, strength=8.0):
    def build():
        m = bpy.data.materials.new(name)
        nt, nodes, links = _nodes(m)
        out = _n(nodes, 'ShaderNodeOutputMaterial', (300, 0))
        bsdf = _n(nodes, 'ShaderNodeBsdfPrincipled', (0, 0))
        bsdf.inputs['Base Color'].default_value = (*color, 1)
        bsdf.inputs['Emission Color'].default_value = (*color, 1)
        bsdf.inputs['Emission Strength'].default_value = strength
        links.new(bsdf.outputs[0], out.inputs[0])
        return m
    return _cache(name, build)


def glass(name='Glass', color=(0.5, 0.7, 0.75)):
    def build():
        m = bpy.data.materials.new(name)
        nt, nodes, links = _nodes(m)
        out = _n(nodes, 'ShaderNodeOutputMaterial', (300, 0))
        bsdf = _n(nodes, 'ShaderNodeBsdfPrincipled', (0, 0))
        bsdf.inputs['Base Color'].default_value = (*color, 1)
        bsdf.inputs['Roughness'].default_value = 0.08
        bsdf.inputs['Transmission Weight'].default_value = 0.6
        links.new(bsdf.outputs[0], out.inputs[0])
        return m
    return _cache(name, build)


def water(name='Water'):
    def build():
        m = bpy.data.materials.new(name)
        nt, nodes, links = _nodes(m)
        out = _n(nodes, 'ShaderNodeOutputMaterial', (600, 0))
        bsdf = _n(nodes, 'ShaderNodeBsdfPrincipled', (300, 100))
        bsdf.inputs['Base Color'].default_value = (0.02, 0.05, 0.05, 1)
        bsdf.inputs['Roughness'].default_value = 0.04
        bsdf.inputs['Specular IOR Level'].default_value = 0.6
        bsdf.inputs['Transmission Weight'].default_value = 0.0
        tc = _n(nodes, 'ShaderNodeTexCoord', (-600, -100))
        mp = _n(nodes, 'ShaderNodeMapping', (-420, -100))
        mp.inputs['Scale'].default_value = (1, 3, 1)
        links.new(tc.outputs['Object'], mp.inputs['Vector'])
        nz = _n(nodes, 'ShaderNodeTexNoise', (-250, -100))
        nz.inputs['Scale'].default_value = 3
        nz.inputs['Detail'].default_value = 6
        links.new(mp.outputs['Vector'], nz.inputs['Vector'])
        bump = _n(nodes, 'ShaderNodeBump', (0, -150))
        bump.inputs['Strength'].default_value = 0.15
        links.new(nz.outputs['Fac'], bump.inputs['Height'])
        links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
        vol = _n(nodes, 'ShaderNodeVolumeAbsorption', (300, -200))
        vol.inputs['Color'].default_value = (0.25, 0.45, 0.4, 1)
        vol.inputs['Density'].default_value = 1.5
        links.new(bsdf.outputs[0], out.inputs['Surface'])
        links.new(vol.outputs[0], out.inputs['Volume'])
        return m
    return _cache(name, build)


def smoke(name='Smoke', density=1.2, color=(0.18, 0.17, 0.16), scale=1.2):
    def build():
        m = bpy.data.materials.new(name)
        nt, nodes, links = _nodes(m)
        out = _n(nodes, 'ShaderNodeOutputMaterial', (600, 0))
        vol = _n(nodes, 'ShaderNodeVolumePrincipled', (300, 0))
        vol.inputs['Color'].default_value = (*color, 1)
        tc = _n(nodes, 'ShaderNodeTexCoord', (-900, 0))
        nz = _n(nodes, 'ShaderNodeTexNoise', (-700, 100))
        nz.inputs['Scale'].default_value = scale
        nz.inputs['Detail'].default_value = 6
        links.new(tc.outputs['Object'], nz.inputs['Vector'])
        # radial falloff in object space (unit sphere)
        ln = _n(nodes, 'ShaderNodeVectorMath', (-700, -150))
        ln.operation = 'LENGTH'
        links.new(tc.outputs['Object'], ln.inputs[0])
        fall = _n(nodes, 'ShaderNodeMapRange', (-500, -150))
        fall.inputs['From Min'].default_value = 0.4
        fall.inputs['From Max'].default_value = 1.0
        fall.inputs['To Min'].default_value = 1
        fall.inputs['To Max'].default_value = 0
        links.new(ln.outputs['Value'], fall.inputs['Value'])
        nm = _n(nodes, 'ShaderNodeMapRange', (-500, 100))
        nm.inputs['From Min'].default_value = 0.45
        nm.inputs['From Max'].default_value = 0.75
        links.new(nz.outputs['Fac'], nm.inputs['Value'])
        mul = _n(nodes, 'ShaderNodeMath', (-300, 0))
        mul.operation = 'MULTIPLY'
        links.new(nm.outputs['Result'], mul.inputs[0])
        links.new(fall.outputs['Result'], mul.inputs[1])
        dn = _n(nodes, 'ShaderNodeMath', (-100, 0))
        dn.operation = 'MULTIPLY'
        dn.inputs[1].default_value = density
        links.new(mul.outputs[0], dn.inputs[0])
        links.new(dn.outputs[0], vol.inputs['Density'])
        links.new(vol.outputs[0], out.inputs['Volume'])
        return m
    return _cache(name, build)


def flat(name, color, rough=0.9, metal=0.0):
    def build():
        m = bpy.data.materials.new(name)
        nt, nodes, links = _nodes(m)
        out = _n(nodes, 'ShaderNodeOutputMaterial', (300, 0))
        bsdf = _n(nodes, 'ShaderNodeBsdfPrincipled', (0, 0))
        bsdf.inputs['Base Color'].default_value = (*color, 1)
        bsdf.inputs['Roughness'].default_value = rough
        bsdf.inputs['Metallic'].default_value = metal
        links.new(bsdf.outputs[0], out.inputs[0])
        return m
    return _cache(name, build)

# --------------------------------------------------------------- primitives

def _finish(obj, mat, bevel=0.0, segs=2, collection=None, smooth=True):
    if mat:
        obj.data.materials.append(mat)
    if bevel > 0:
        b = obj.modifiers.new('Bevel', 'BEVEL')
        b.width = bevel
        b.segments = segs
        b.limit_method = 'ANGLE'
        b.harden_normals = True
    if smooth:
        for p in obj.data.polygons:
            p.use_smooth = True
        w = obj.modifiers.new('WN', 'WEIGHTED_NORMAL')
        w.keep_sharp = True
    if collection:
        link(obj, collection)
    return obj


def box(name, size, loc, mat=None, bevel=0.02, rot=(0, 0, 0), collection=None, segs=2):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = rot
    return _finish(o, mat, bevel, segs, collection)


def cyl(name, r, depth, loc, mat=None, verts=32, bevel=0.01, rot=(0, 0, 0), collection=None, r2=None, segs=2):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r, radius2=r if r2 is None else r2, depth=depth)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = rot
    return _finish(o, mat, bevel, segs, collection)


def tube(name, points, radius, mat=None, collection=None, res=12):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = radius
    cu.bevel_resolution = res // 4
    cu.use_fill_caps = True
    sp = cu.splines.new('POLY')
    sp.points.add(len(points) - 1)
    for p, c in zip(sp.points, points):
        p.co = (*c, 1)
    o = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(o)
    if mat:
        o.data.materials.append(mat)
    if collection:
        link(o, collection)
    return o


def instance_along(src, count, step, start, collection=None, jitter=0.0):
    out = []
    for i in range(count):
        o = src.copy()
        o.location = Vector(start) + Vector(step) * i
        if jitter:
            o.rotation_euler.z += random.uniform(-jitter, jitter)
        bpy.context.scene.collection.objects.link(o)
        if collection:
            link(o, collection)
        out.append(o)
    return out


def parent_all(objs, name, collection=None):
    e = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(e)
    if collection:
        link(e, collection)
    for o in objs:
        o.parent = e
    return e

# ------------------------------------------------------------------ render

def setup_render(path, w=2340, h=1080, samples=160, engine='CYCLES', look='AgX - Medium High Contrast', exposure=0.0):
    sc = bpy.context.scene
    sc.render.engine = engine
    sc.render.resolution_x = w
    sc.render.resolution_y = h
    sc.render.resolution_percentage = 100
    sc.render.filepath = path
    sc.render.image_settings.file_format = 'PNG'
    if engine == 'CYCLES':
        prefs = bpy.context.preferences.addons['cycles'].preferences
        for dev in ('CUDA', 'OPTIX'):
            try:
                prefs.compute_device_type = dev
                prefs.get_devices()
                gpus = [d for d in prefs.devices if d.type == dev]
                if gpus:
                    for d in prefs.devices:
                        d.use = d.type == dev
                    sc.cycles.device = 'GPU'
                    break
            except Exception:
                continue
        sc.cycles.samples = samples
        sc.cycles.use_denoising = True
        sc.cycles.max_bounces = 8
        sc.cycles.volume_bounces = 1
        sc.cycles.volume_step_rate = 4.0
    sc.view_settings.view_transform = 'AgX'
    try:
        sc.view_settings.look = look
    except Exception:
        pass
    sc.view_settings.exposure = exposure


# ------------------------------------------------------- scanned PBR (CC0)
import os as _os
TEX_ROOT = _os.path.abspath(_os.path.join(_os.path.dirname(__file__), '..', '..', 'assets', 'originals', 'polyhaven', 'textures'))


def _img(nodes, path, noncolor, loc):
    n = nodes.new('ShaderNodeTexImage')
    n.location = loc
    n.image = bpy.data.images.load(path, check_existing=True)
    if noncolor:
        n.image.colorspace_settings.name = 'Non-Color'
    n.projection = 'BOX'
    n.projection_blend = 0.25
    return n


def pbr(name, tex, scale=1.0, tint=(1, 1, 1), tint_amt=0.0, value=1.0, wear=0.0, bump=0.35, rough_add=0.0, metal=None, grime=0.4):
    """Box-projected Poly Haven material with optional tint, edge wear and crevice grime."""
    def build():
        mv = metal
        m = bpy.data.materials.new(name)
        nt, nodes, links = _nodes(m)
        d = _os.path.join(TEX_ROOT, tex, tex)
        out = _n(nodes, 'ShaderNodeOutputMaterial', (900, 0))
        bsdf = _n(nodes, 'ShaderNodeBsdfPrincipled', (600, 0))
        links.new(bsdf.outputs[0], out.inputs[0])
        tc = _n(nodes, 'ShaderNodeTexCoord', (-1300, 0))
        mp = _n(nodes, 'ShaderNodeMapping', (-1100, 0))
        mp.inputs['Scale'].default_value = (scale, scale, scale)
        links.new(tc.outputs['Object'], mp.inputs['Vector'])
        diff = _img(nodes, d + '_diff_2k.jpg', False, (-800, 300))
        arm = _img(nodes, d + '_arm_2k.jpg', True, (-800, 0))
        disp = _img(nodes, d + '_disp_2k.jpg', True, (-800, -300))
        for t in (diff, arm, disp):
            links.new(mp.outputs['Vector'], t.inputs['Vector'])
        sep = _n(nodes, 'ShaderNodeSeparateColor', (-500, 0))
        links.new(arm.outputs['Color'], sep.inputs[0])
        col = diff.outputs['Color']
        if tint_amt > 0:
            tm = _n(nodes, 'ShaderNodeMix', (-500, 400))
            tm.data_type = 'RGBA'
            tm.blend_type = 'COLOR'
            tm.inputs['Factor'].default_value = tint_amt
            tm.inputs['B'].default_value = (*tint, 1)
            links.new(col, tm.inputs['A'])
            col = tm.outputs['Result']
        hv = _n(nodes, 'ShaderNodeHueSaturation', (-300, 400))
        hv.inputs['Value'].default_value = value
        links.new(col, hv.inputs['Color'])
        col = hv.outputs['Color']
        # AO from the scan plus scene crevice grime
        ao = _n(nodes, 'ShaderNodeMix', (-100, 400))
        ao.data_type = 'RGBA'
        ao.blend_type = 'MULTIPLY'
        ao.inputs['Factor'].default_value = 1.0
        links.new(col, ao.inputs['A'])
        links.new(sep.outputs['Red'], ao.inputs['B'])
        col = ao.outputs['Result']
        if grime > 0:
            dirt = _grime(nodes, links, tc)
            gm = _n(nodes, 'ShaderNodeMix', (100, 400))
            gm.data_type = 'RGBA'
            gm.blend_type = 'MULTIPLY'
            gm.inputs['B'].default_value = (0.3, 0.26, 0.22, 1)
            gf = _n(nodes, 'ShaderNodeMath', (0, 550))
            gf.operation = 'MULTIPLY'
            gf.inputs[1].default_value = grime
            links.new(dirt, gf.inputs[0])
            links.new(gf.outputs[0], gm.inputs['Factor'])
            links.new(col, gm.inputs['A'])
            col = gm.outputs['Result']
        rough = sep.outputs['Green']
        if rough_add:
            ra = _n(nodes, 'ShaderNodeMath', (100, 0))
            ra.operation = 'ADD'
            ra.use_clamp = True
            ra.inputs[1].default_value = rough_add
            links.new(rough, ra.inputs[0])
            rough = ra.outputs[0]
        met = sep.outputs['Blue']
        if wear > 0:
            wm, _tc = _wear_mask(nodes, links, amount=wear, breakup=7)
            em = _n(nodes, 'ShaderNodeMix', (300, 400))
            em.data_type = 'RGBA'
            em.inputs['B'].default_value = (0.5, 0.48, 0.45, 1)
            links.new(wm, em.inputs['Factor'])
            links.new(col, em.inputs['A'])
            col = em.outputs['Result']
            rm = _n(nodes, 'ShaderNodeMix', (300, 0))
            rm.data_type = 'FLOAT'
            rm.inputs['B'].default_value = 0.3
            links.new(wm, rm.inputs['Factor'])
            links.new(rough, rm.inputs['A'])
            rough = rm.outputs['Result']
            mm = _n(nodes, 'ShaderNodeMix', (300, -150))
            mm.data_type = 'FLOAT'
            mm.inputs['B'].default_value = 1.0
            if mv is not None:
                mm.inputs['A'].default_value = mv
            else:
                links.new(met, mm.inputs['A'])
            links.new(wm, mm.inputs['Factor'])
            met = mm.outputs['Result']
            mv = None
        links.new(col, bsdf.inputs['Base Color'])
        links.new(rough, bsdf.inputs['Roughness'])
        if mv is not None:
            bsdf.inputs['Metallic'].default_value = mv
        else:
            links.new(met, bsdf.inputs['Metallic'])
        bp = _n(nodes, 'ShaderNodeBump', (300, -350))
        bp.inputs['Strength'].default_value = bump
        bp.inputs['Distance'].default_value = 0.02
        links.new(disp.outputs['Color'], bp.inputs['Height'])
        links.new(bp.outputs['Normal'], bsdf.inputs['Normal'])
        return m
    return _cache(name, build)
