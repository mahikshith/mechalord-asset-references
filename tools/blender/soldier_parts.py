"""Irondust CC0 soldier helpers: PBR skin materials from the Unity specular maps and a loader."""
import bpy, os, math, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sidescroller_kit as K

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
SRC = os.path.join(REPO, 'assets', 'originals', 'irondust-scifi-soldier', 'unzipped', 'Sci-fi Soldiers 2')

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


def load_soldier(skin, head, x=0.0, rot=0.0, cannon=True, pose='idle'):
    sc = bpy.context.scene
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


