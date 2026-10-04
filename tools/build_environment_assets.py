"""Original modular Mechalord environment kit, built and measured in Blender.

Run: blender --background --python-exit-code 1 --python tools/build_environment_assets.py
All authored lengths are metres: X steering, Y forward, Z up. Local module roots
are ground-level anchors. The shared palette is a real 128px embedded texture.
"""
import bpy
import math
import json
import sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'environment'
PALETTE = {
    'ivory': (.72, .65, .49, 1), 'teal': (.025, .19, .21, 1),
    'bronze': (.43, .25, .095, 1), 'dark': (.038, .053, .067, 1),
    'stone': (.23, .26, .25, 1), 'cyan': (.08, .73, .75, 1),
    'rust': (.42, .12, .06, 1), 'amber': (.95, .46, .075, 1),
    'white': (.88, .86, .70, 1), 'blue': (.055, .29, .58, 1),
    'black': (.01, .018, .025, 1), 'sand': (.38, .34, .25, 1),
    'red': (.60, .15, .065, 1), 'grass': (.13, .18, .14, 1),
    'silver': (.35, .43, .45, 1), 'violet': (.27, .19, .42, 1),
}
KEYS = list(PALETTE)
LIBRARY = {}
CURRENT = None
MATERIAL = None
MODULES = []

def prepare():
    global MATERIAL
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    for directory in ['source', 'exports', 'previews', 'manifests', 'layouts', 'textures']:
        (OUT / directory).mkdir(parents=True, exist_ok=True)
    # Values use scene-linear colour, so material/shaded references stay coherent.
    tex = bpy.data.images.new('Mechalord Shared Palette 128', width=128, height=128, alpha=True)
    pixels = []
    for y in range(128):
        for x in range(128):
            pixels.extend(PALETTE[KEYS[(y // 32) * 4 + x // 32]])
    tex.pixels.foreach_set(pixels)
    tex.filepath_raw = str(OUT / 'textures' / 'environment-palette.png')
    tex.file_format = 'PNG'
    tex.save()
    tex.pack()
    MATERIAL = bpy.data.materials.new('M_EnvironmentPalette')
    MATERIAL.use_nodes = True
    bsdf = MATERIAL.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Roughness'].default_value = .84
    node = MATERIAL.node_tree.nodes.new('ShaderNodeTexImage')
    node.image = tex
    node.interpolation = 'Closest'
    MATERIAL.node_tree.links.new(node.outputs['Color'], bsdf.inputs['Base Color'])
    MATERIAL['runtime_material'] = 'Use the same palette texture in an Unreal Unlit material for mobile.'

def mesh_done(obj, name, color):
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.clear()
    obj.data.materials.append(MATERIAL)
    uv = obj.data.uv_layers.new(name='PaletteUV') if not obj.data.uv_layers else obj.data.uv_layers[0]
    # Primitive generators call their UV layer UVMap. Name every layer equally
    # before joining so polygon-built plates share the same atlas coordinates.
    uv.name = 'PaletteUV'
    index = KEYS.index(color)
    coordinate = ((index % 4 + .5) / 4, (index // 4 + .5) / 4)
    for face in obj.data.polygons:
        for li in face.loop_indices:
            uv.data[li].uv = coordinate
    for collection in list(obj.users_collection):
        collection.objects.unlink(obj)
    CURRENT.objects.link(obj)
    return obj

def box(name, location, size, color='ivory', bevel=.025):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        modifier = obj.modifiers.new('Machined chamfer', 'BEVEL')
        modifier.width = bevel
        modifier.segments = 1
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    return mesh_done(obj, name, color)

def cylinder(name, location, radius, length, color='bronze', sides=12, axis='Z'):
    bpy.ops.mesh.primitive_cylinder_add(vertices=sides, radius=radius, depth=length, location=location)
    obj = bpy.context.object
    if axis == 'Y': obj.rotation_euler.x = math.pi / 2
    if axis == 'X': obj.rotation_euler.y = math.pi / 2
    return mesh_done(obj, name, color)

def beam(name, start, end, radius, color='bronze', sides=8):
    vector = Vector(end) - Vector(start)
    obj = cylinder(name, (Vector(start) + Vector(end)) / 2, radius, vector.length, color, sides)
    obj.rotation_euler = vector.to_track_quat('Z', 'Y').to_euler()
    return obj

def plate(name, points_xz, y, depth, color='ivory'):
    vertices = [(x, y - depth / 2, z) for x, z in points_xz] + [(x, y + depth / 2, z) for x, z in points_xz]
    n = len(points_xz)
    faces = [tuple(reversed(range(n))), tuple(range(n, n * 2))]
    faces.extend((i, (i + 1) % n, (i + 1) % n + n, i + n) for i in range(n))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return mesh_done(obj, name, color)

def text_mesh(text, x, y, z, size=.45, color='white'):
    curve = bpy.data.curves.new('Gate marking ' + text, 'FONT')
    curve.body = text
    curve.size = size
    curve.align_x = 'CENTER'
    curve.align_y = 'CENTER'
    curve.extrude = .004
    curve.resolution_u = 1
    obj = bpy.data.objects.new('Gate marking ' + text, curve)
    bpy.context.collection.objects.link(obj)
    obj.location = (x, y, z)
    obj.rotation_euler.x = math.pi / 2
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    return mesh_done(bpy.context.object, 'Gate marking ' + text, color)

def begin(name):
    global CURRENT
    CURRENT = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(CURRENT)
    bpy.ops.object.select_all(action='DESELECT')

def end(name, footprint, pivot='near-edge centre at walking surface', collision=None, sockets=None):
    objects = list(CURRENT.objects)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects: obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    obj = bpy.context.object
    obj.name = name
    # Object origin is an explicit reusable assembly anchor, not a bounds centre.
    bpy.context.scene.cursor.location = (0, 0, 0)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    obj.data.calc_loop_triangles()
    bounds = [obj.matrix_world @ Vector(v) for v in obj.bound_box]
    entry = {
        'id': name, 'triangles': len(obj.data.loop_triangles), 'vertices': len(obj.data.vertices),
        'materials': len(obj.data.materials), 'textures': 1, 'textureSize': [128, 128],
        'units': 'metres', 'axes': 'X lateral / Y forward / Z up', 'pivot': pivot,
        'footprintMetres': footprint,
        'boundsMin': [round(min(p[i] for p in bounds), 4) for i in range(3)],
        'boundsMax': [round(max(p[i] for p in bounds), 4) for i in range(3)],
        'collision': collision or [], 'sockets': sockets or {},
        'glb': 'exports/' + name + '.glb', 'fbx': 'exports/' + name + '.fbx',
    }
    bpy.ops.export_scene.gltf(filepath=str(OUT / entry['glb']), use_selection=True, export_format='GLB')
    bpy.ops.export_scene.fbx(filepath=str(OUT / entry['fbx']), use_selection=True,
                             axis_forward='-Y', axis_up='Z', apply_unit_scale=True, bake_anim=False,
                             path_mode='COPY', embed_textures=True)
    obj.hide_render = True
    obj.hide_set(True)
    LIBRARY[name] = obj
    MODULES.append(entry)
    print('MODULE_READY', name, entry['triangles'], 'triangles', flush=True)

def track():
    begin('track-straight')
    box('Structural dark deck', (0, 4, -.23), (6, 8, .4), 'dark', .07)
    # Raised borders leave the walking surface at exactly zero.
    for sign in [-1, 1]:
        box('Bronze shoulder runner', (sign * 2.92, 4, -.01), (.16, 8, .12), 'bronze', .015)
        box('Teal shoulder conduit', (sign * 2.80, 4, -.06), (.05, 8, .05), 'cyan', .005)
    for row in range(8):
        for col in range(3):
            x = (col - 1) * 1.79
            box('Deck tile %s %s' % (row, col), (x, row + .5, -.047), (1.74, .95, .094), 'ivory' if (row + col) % 3 else 'stone', .018)
        box('Central teal dash', (0, row + .5, .004), (.065, .30, .008), 'teal', 0)
    for y in [1, 3, 5, 7]:
        for x in [-2.55, 2.55]:
            for i in range(4):
                box('Inset metal vent', (x, y + i * .07, .005), (.22, .026, .01), 'dark', 0)
    end('track-straight', [6, 8], collision=[{'kind': 'box', 'centre': [0, 4, -.2], 'size': [6, 8, .4]}], sockets={'exit': [0, 8, 0]})

def narrow_track():
    begin('track-narrow')
    box('Narrow bridge underframe', (0, 4, -.23), (4.2, 8, .4), 'dark', .045)
    for row in range(8):
        box('Narrow ivory walking plate', (0, row + .5, -.055), (3.9, .94, .11), 'ivory', .025)
    for sign in [-1, 1]:
        box('Bridge bronze rail', (sign * 2.01, 4, .17), (.10, 8, .34), 'bronze', .025)
        box('Bridge teal rail stripe', (sign * 1.95, 4, .18), (.02, 8, .06), 'cyan', 0)
        for y in [.3, 2.3, 4.3, 6.3]:
            box('Exposed cross member', (sign * 2.21, y, -.26), (.35, .28, .28), 'teal', .03)
    end('track-narrow', [4.2, 8], collision=[{'kind': 'box', 'centre': [0, 4, -.2], 'size': [4.2, 8, .4]}], sockets={'exit': [0, 8, 0]}, pivot='near-edge centre; route narrowing is visual until runtime adds boundaries')

def gate(kind):
    begin('gate-' + kind)
    accent = {'recruit': 'cyan', 'multiply': 'blue', 'energy': 'amber'}[kind]
    for sign in [-1, 1]:
        box('Gate octagonal foot', (sign * 1.32, 0, .13), (.46, .66, .26), 'bronze', .09)
        box('Ivory pilaster', (sign * 1.32, 0, 1.45), (.28, .38, 2.65), 'ivory', .05)
        box('Inner teal gate spine', (sign * 1.22, -.20, 1.42), (.105, .05, 2.25), 'teal', .014)
        box('Luminous gate tracer', (sign * 1.215, -.234, 1.45), (.042, .01, 2.0), accent, .007)
        for z in [.45, 2.48]:
            cylinder('Gate bronze collar', (sign * 1.32, 0, z), .22, .15, 'bronze', 8)
        for z in [.45, 1.46, 2.47]:
            cylinder('Gate fastener', (sign * 1.32, -.22, z), .044, .025, 'bronze', 8, 'Y')
    plate('Crowned gothic lintel', [(-1.56, 2.68), (-1.25, 3.05), (-.5, 3.05), (0, 3.23), (.5, 3.05), (1.25, 3.05), (1.56, 2.68)], 0, .36, 'bronze')
    plate('Teal sign plate', [(-1.13, 2.70), (-1.0, 2.96), (1., 2.96), (1.13, 2.70)], -.22, .06, 'teal')
    box('Operation value bronze display frame', (0, -.245, 2.36), (2.10, .10, .60), 'bronze', .035)
    box('Operation value contrast display', (0, -.307, 2.36), (1.98, .030, .50), 'teal', .018)
    # Leave operation number under runtime control; these example values live only
    # in preview instances and are not permanently part of the module.
    if kind == 'recruit':
        cylinder('Recruit head sigil', (0, -.31, 2.84), .065, .025, accent, 10, 'Y')
        plate('Recruit shield sigil', [(-.09, 2.74), (.09, 2.74), (.06, 2.69), (0, 2.67), (-.06, 2.69)], -.315, .02, accent)
    elif kind == 'multiply':
        for angle in [-math.pi / 4, math.pi / 4]:
            obj = box('Multiplication sigil', (0, -.31, 2.82), (.033, .018, .20), accent, .006)
            obj.rotation_euler.y = angle
    else:
        plate('Relic lightning sigil', [(.035, 2.94), (-.078, 2.82), (-.009, 2.82), (-.027, 2.69), (.085, 2.84), (.013, 2.84)], -.31, .025, accent)
    # Match the core's gate half-width .32 * lane scale 2.6m = .832m.
    # Two frames at normalized lanes +/- .5 then have a visible central gap.
    for obj in list(CURRENT.objects):
        obj.location.x *= .7
        obj.scale.x *= .7
    end('gate-' + kind, [2.17, .66], pivot='aperture centre on ground, crossing plane Y=0; usable aperture +/- .832m', collision=[], sockets={'numberLabel': [0, -.32, 2.36]},)

def barricade():
    begin('barricade')
    box('Barricade base', (0, 0, .16), (1.45, .68, .32), 'dark', .06)
    plate('Raised hazard shield', [(-.71, .23), (-.64, .9), (-.42, 1.16), (.42, 1.16), (.64, .9), (.71, .23)], -.08, .18, 'rust')
    plate('Inset barricade face', [(-.53, .36), (-.49, .85), (-.30, 1.02), (.30, 1.02), (.49, .85), (.53, .36)], -.19, .025, 'dark')
    for x in [-.28, 0, .28]:
        obj = box('Amber danger diagonal', (x, -.22, .64), (.12, .018, .57), 'amber', .01)
        obj.rotation_euler.y = -.4
    for x in [-.64, .64]:
        cylinder('Barricade bronze bolt', (x, -.205, .62), .055, .03, 'bronze', 8, 'Y')
    end('barricade', [1.45, .68], pivot='hazard footprint centre at ground', collision=[{'kind': 'box', 'centre': [0, 0, .55], 'size': [1.45, .68, 1.1]}])

def pickup():
    begin('energy-pickup')
    cylinder('Energy pedestal', (0, 0, .08), .27, .16, 'bronze', 8)
    cylinder('Energy teal collar', (0, 0, .18), .21, .10, 'teal', 8)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=.24, location=(0, 0, .47))
    obj = bpy.context.object
    obj.scale = (.7, .7, 1.35)
    mesh_done(obj, 'Suspended cyan relic crystal', 'cyan')
    for angle in [0, math.tau / 3, math.tau * 2 / 3]:
        x, y = .22 * math.cos(angle), .22 * math.sin(angle)
        beam('Crystal bronze cradle', (x, y, .18), (x * .6, y * .6, .42), .022, 'bronze')
    end('energy-pickup', [.54, .54], pivot='pickup ground anchor', collision=[], sockets={'effect': [0, 0, .48]})

def column():
    begin('relic-column')
    cylinder('Column stepped foot', (0, 0, .12), .65, .24, 'stone', 8)
    cylinder('Column bronze base ring', (0, 0, .34), .47, .16, 'bronze', 8)
    cylinder('Column ancient ceramic', (0, 0, 1.55), .35, 2.5, 'ivory', 8)
    for x in [-.35, .35]:
        box('Column teal machinery rib', (x, 0, 1.55), (.06, .26, 2.2), 'teal', .012)
    cylinder('Column upper bronze collar', (0, 0, 2.78), .49, .18, 'bronze', 8)
    plate('Column crown shield', [(-.38, 2.91), (-.32, 3.27), (0, 3.43), (.32, 3.27), (.38, 2.91)], 0, .43, 'teal')
    cylinder('Column lit core', (0, -.26, 3.10), .12, .035, 'cyan', 12, 'Y')
    end('relic-column', [1.3, 1.3], pivot='background column ground anchor')

def pipe_arch():
    begin('pipe-arch')
    for sign in [-1, 1]:
        box('Pipe anchor', (sign * 3.8, 0, .2), (.85, 1.1, .4), 'stone', .07)
        cylinder('Foundry riser', (sign * 3.8, 0, 2.3), .21, 4.2, 'dark', 12)
        for z in [.65, 2.6, 4.0]:
            cylinder('Riser bronze clamp', (sign * 3.8, 0, z), .255, .15, 'bronze', 12)
    points = [(-3.8, 0, 4.4), (-3.8, 0, 5.1), (-3.1, 0, 5.65), (3.1, 0, 5.65), (3.8, 0, 5.1), (3.8, 0, 4.4)]
    for i in range(len(points) - 1): beam('Overhead foundry pipe', points[i], points[i + 1], .21, 'dark', 12)
    box('Overhead amber warning plate', (0, -.22, 5.50), (1.1, .07, .36), 'bronze', .03)
    for x in [-.36, 0, .36]: cylinder('Overhead amber lamp', (x, -.28, 5.5), .08, .03, 'amber', 8, 'Y')
    end('pipe-arch', [8.45, 1.1], pivot='track centre; overhead clearance greater than 4 metres')

def railing():
    begin('rail-section')
    for y in [.25, 3.75]:
        box('Rail ivory post', (0, y, .70), (.22, .22, 1.4), 'ivory', .03)
        cylinder('Rail post finial', (0, y, 1.43), .14, .15, 'bronze', 8)
    for z in [.35, 1.05]:
        box('Bronze guardrail', (0, 2, z), (.09, 4, .12), 'bronze', .015)
    end('rail-section', [.3, 4], pivot='near-edge rail ground anchor')

def cliff():
    begin('cliff-base')
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1, location=(0, 4, -1.9))
    obj = bpy.context.object
    obj.scale = (3.8, 4.4, 2.05)
    mesh_done(obj, 'Faceted ancient rock foundation', 'stone')
    for sign in [-1, 1]:
        box('Embedded ruin support', (sign * 2.2, 4, -.55), (.52, 6.9, 1.0), 'dark', .06)
        for y in [1.5, 4, 6.5]:
            box('Foundation armor clamp', (sign * 2.38, y, -.4), (.60, .35, .65), 'bronze', .05)
    end('cliff-base', [7.6, 8.8], pivot='track-near anchor; cosmetic below walking surface')

def siege_platform():
    begin('siege-platform')
    box('Bastion structural foundation', (0, 3, -.44), (7.2, 6, .72), 'dark', .12)
    box('Bastion deck', (0, 3, -.08), (6.8, 5.8, .16), 'ivory', .06)
    for sign in [-1, 1]:
        box('Bastion bronze rim', (sign * 3.42, 3, .14), (.18, 6, .28), 'bronze', .03)
        for y in [1, 3, 5]:
            box('Bastion defensive merlon', (sign * 3.36, y, .70), (.38, .9, 1.15), 'teal', .06)
            box('Merlon armor face', (sign * 3.14, y, .75), (.045, .7, .72), 'ivory', .014)
    cylinder('Launcher installation bronze ring', (0, 1.5, .028), 1.03, .055, 'bronze', 24)
    cylinder('Launcher installation teal centre', (0, 1.5, .06), .84, .055, 'teal', 24)
    for i in range(8):
        angle = i * math.tau / 8
        cylinder('Launcher mounting bolt', (math.cos(angle) * .92, 1.5 + math.sin(angle) * .92, .067), .044, .015, 'dark', 8)
    for x in [-1.7, 1.7]:
        box('Reserve bay dark marking', (x, 1.5, .009), (.7, 1.6, .018), 'dark', .03)
        box('Reserve bay cyan indicator', (x, 1.5, .023), (.07, .7, .028), 'cyan', .008)
    end('siege-platform', [7.2, 6], collision=[{'kind': 'box', 'centre': [0, 3, -.36], 'size': [7.2, 6, .72]}], sockets={'launcher': [0, 1.5, .085], 'exit': [0, 6, 0]})

def tower():
    begin('defense-tower')
    cylinder('Tower foundation', (0, 0, .16), .89, .32, 'dark', 8)
    cylinder('Tower bronze foot', (0, 0, .37), .75, .18, 'bronze', 8)
    cylinder('Tower armored body', (0, 0, 1.30), .61, 1.7, 'rust', 8)
    for x in [-.51, .51]:
        box('Tower black supporting rib', (x, -.27, 1.3), (.11, .19, 1.60), 'dark', .02)
    cylinder('Tower rotating ring', (0, 0, 2.18), .74, .22, 'bronze', 12)
    cylinder('Tower dark upper armor', (0, 0, 2.48), .63, .48, 'dark', 8)
    for x in [-.18, .18]: cylinder('Tower amber eye', (x, -.63, 2.48), .058, .03, 'amber', 8, 'Y')
    cylinder('Tower frontal barrel', (0, -.76, 2.30), .12, .48, 'dark', 10, 'Y')
    cylinder('Tower muzzle bronze border', (0, -1.01, 2.30), .15, .07, 'bronze', 10, 'Y')
    cylinder('Tower muzzle bore marking', (0, -1.052, 2.30), .09, .013, 'black', 10, 'Y')
    end('defense-tower', [1.8, 2.05], pivot='enemy tower centre on ground; static preview gun', collision=[{'kind': 'cylinder', 'centre': [0, 0, 1.3], 'radius': .8, 'height': 2.6}], sockets={'muzzle': [0, -1.06, 2.30]})

def forge_core():
    begin('forge-core-plinth')
    cylinder('Forge octagonal dais', (0, 0, .18), 1.8, .36, 'dark', 8)
    cylinder('Forge bronze dais top', (0, 0, .41), 1.61, .10, 'bronze', 8)
    cylinder('Forge charcoal mechanism base', (0, 0, .65), 1.09, .40, 'dark', 8)
    cylinder('Forge charcoal upper collar', (0, 0, 1.83), 1.09, .20, 'dark', 8)
    for i in range(8):
        angle = i * math.tau / 8
        x, y = 1.22 * math.cos(angle), 1.22 * math.sin(angle)
        box('Forge armored rib', (x, y, 1.2), (.25, .25, 1.47), 'rust', .03)
    cylinder('Forge amber power chamber', (0, 0, 1.15), .74, 1.60, 'amber', 16)
    cylinder('Forge bronze crown', (0, 0, 2.00), 1.20, .27, 'bronze', 8)
    for i in range(8):
        angle = i * math.tau / 8
        cylinder('Forge crown fastener', (math.cos(angle) * .97, math.sin(angle) * .97, 2.16), .08, .07, 'dark', 8)
    end('forge-core-plinth', [3.6, 3.6], pivot='boss arena centre; plinth is scenery and does not substitute for Forge Colossus', sockets={'boss': [0, 0, 2.20]})

def instance(name, location, yaw=0, scale=1):
    template = LIBRARY[name]
    obj = bpy.data.objects.new(name + ' instance', template.data)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler.z = yaw
    obj.scale = (scale, scale, scale)
    return obj

def preview_label(text, x, y, z):
    # Individual mesh text is saved only in example assembly scenes, never in
    # shipped gate module geometry; game UI provides actual encounter values.
    return text_mesh(text, x, y - .34, z, .57, 'white')

def studio(name, camera_position, target, resolution=(900, 1200)):
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 16
    scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = resolution
    scene.render.resolution_percentage = 100
    scene.world = bpy.data.worlds.new('Environment Studio')
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.14, .18, .21, 1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value = .6
    for light_name, position, energy, size in [('Key', (-8, -8, 15), 2500, 9), ('Fill', (8, 5, 10), 1500, 7), ('Rim', (-4, 21, 9), 2000, 6)]:
        data = bpy.data.lights.new(light_name, 'AREA')
        data.energy = energy
        data.shape = 'DISK'
        data.size = size
        obj = bpy.data.objects.new(light_name, data)
        scene.collection.objects.link(obj)
        obj.location = position
        obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()
    camera = bpy.data.cameras.new('Presentation Camera')
    obj = bpy.data.objects.new('Presentation Camera', camera)
    scene.collection.objects.link(obj)
    obj.location = camera_position
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()
    camera.type = 'ORTHO'
    camera.ortho_scale = 23
    scene.camera = obj
    scene.view_settings.view_transform = 'AgX'
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = str(OUT / 'previews' / (name + '.png'))
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT / 'source' / (name + '.blend')))
    bpy.ops.render.render(write_still=True)

def assembly_preview(siege=False):
    global CURRENT
    CURRENT = bpy.data.collections.new('Example Siege' if siege else 'Example Causeway')
    bpy.context.scene.collection.children.link(CURRENT)
    before = set(bpy.context.scene.objects)
    length = 16 if siege else 24
    for y in range(0, length, 8):
        offset = 4.5 if siege else 0
        instance('track-straight', (0, y + offset, 0))
        instance('cliff-base', (0, y + offset, 0))
    for sign in [-1, 1]:
        for y in [1, 9, 17] if not siege else [5, 13]:
            instance('relic-column', (sign * 3.7, y, -.08))
        for y in [0, 4, 12, 16]:
            instance('rail-section', (sign * 3.18, y, 0))
    if siege:
        instance('siege-platform', (0, -1.5, 0))
        instance('gate-multiply', (-1.0, 5.4, 0))
        instance('gate-multiply', (.9, 9, 0))
        preview_label('x2', -1.0, 5.4, 2.35)
        preview_label('x3', .9, 9, 2.35)
        for x in [-2.15, 2.15]: instance('defense-tower', (x, 14.4, 0))
        instance('forge-core-plinth', (0, 14.4, 0))
        instance('pipe-arch', (0, 13, 0))
        camera, target = (12, -16, 19), (0, 8.2, 0)
    else:
        instance('gate-recruit', (0, 4, 0))
        preview_label('+10', 0, 4, 2.35)
        instance('gate-multiply', (-1.5, 11, 0))
        instance('gate-recruit', (1.5, 11, 0))
        preview_label('x2', -1.5, 11, 2.35)
        preview_label('+8', 1.5, 11, 2.35)
        instance('gate-energy', (0, 19, 0))
        preview_label('+40', 0, 19, 2.35)
        for x in [-1, 0, 1]: instance('energy-pickup', (x, 16.4, 0))
        camera, target = (11, -13, 22), (0, 10.5, 0)
    name = 'gatehouse-siege-assembly' if siege else 'relic-causeway-assembly'
    studio(name, camera, target)
    for obj in list(bpy.context.scene.objects):
        if obj not in before:
            bpy.data.objects.remove(obj, do_unlink=True)

def write_layouts():
    stage_data = [
        ('causeway', 'Relic Causeway', 55, False, False, [('recruit', 4, 0, 10), ('multiply', 12, -.5, 2), ('recruit', 12, .5, 8), ('wave', 21, 0, 10), ('recruit', 29, 0, 12), ('wave', 39, 0, 18), ('energy', 47, 0, 40)]),
        ('foundry', 'Foundry Approach', 65, False, False, [('recruit', 4, 0, 15), ('obstacle', 12, -.6, 6), ('multiply', 15, .5, 2), ('wave', 25, 0, 22), ('recruit', 34, -.4, 18), ('obstacle', 39, .6, 8), ('energy', 43, 0, 60), ('wave', 51, 0, 35)]),
        ('gatehouse', 'Gatehouse Siege', 45, False, True, [('recruit', 3, 0, 20), ('multiply', 10, 0, 2), ('wave', 20, 0, 20), ('recruit', 28, 0, 20), ('energy', 36, 0, 50)]),
        ('storm', 'Storm Pass', 50, True, True, [('recruit', 3, 0, 24), ('multiply', 12, 0, 2), ('wave', 23, 0, 30), ('obstacle', 28, -.6, 10), ('energy', 34, 0, 80), ('recruit', 41, 0, 25)]),
        ('forge', 'Forge Core', 50, True, True, [('recruit', 3, 0, 30), ('multiply', 12, 0, 2), ('wave', 23, 0, 40), ('energy', 30, 0, 100), ('recruit', 37, 0, 30), ('wave', 44, 0, 25)]),
    ]
    for index, (sid, name, seconds, optional, siege, events) in enumerate(stage_data):
        dressing = []
        for y in range(0, math.ceil(seconds * 1.5), 8):
            dressing.append({'module': 'track-straight', 'positionMetres': [0, y, 0]})
            if index in [0, 3]: dressing.append({'module': 'cliff-base', 'positionMetres': [0, y, 0]})
            for side in [-1, 1]:
                dressing.append({'module': 'relic-column' if index in [0, 3] else 'defense-tower', 'positionMetres': [side * 4.0, y + 2, -.08]})
            if index in [1, 2, 4] and y % 16 == 0:
                dressing.append({'module': 'pipe-arch', 'positionMetres': [0, y + 6, 0]})
        event_list = []
        threats = {'causeway': [.5, .7], 'foundry': [1.0, 1.4], 'gatehouse': [1.0], 'storm': [1.2], 'forge': [1.5, 1.0]}
        wave_index = 0
        for kind, at, lane, value in events:
            threat = threats[sid][wave_index] if kind == 'wave' else .5
            if kind == 'wave': wave_index += 1
            event_list.append({'kind': kind, 'atSeconds': at, 'laneNormalized': lane,
                               'positionMetres': [round(lane * 2.6, 3), at * 1.5, 0], 'value': value,
                               'widthNormalized': .3 if kind == 'obstacle' else .32,
                               'health': value if kind == 'wave' else 10,
                               'threat': threat, 'motionAmplitudeNormalized': 0,
                               'module': 'barricade' if kind == 'obstacle' else 'gate-' + kind if kind != 'wave' else None})
        if sid == 'storm':
            event_list[1]['motionAmplitudeNormalized'] = .45
            event_list[-1]['motionAmplitudeNormalized'] = .3
        data = {'schema': 1, 'stageId': sid, 'name': name, 'chunkId': 1001 if optional else 0,
                'runSeconds': seconds, 'siegeHealth': [0, 0, 70, 100, 140][index],
                'reward': [40, 60, 90, 120, 160][index], 'boss': sid == 'forge',
                'units': 'metres', 'axes': {'lateral': 'X', 'forward': 'Y', 'up': 'Z'},
                'unrealUnitMultiplier': 100, 'runSpeedMetresPerSecond': 1.5,
                'usableLaneHalfWidthMetres': 2.6, 'trackModuleLengthMetres': 8,
                'assemblyMode': 'Pool a visible window; these full-course definitions are not all spawned simultaneously.',
                'dressing': dressing, 'encounters': event_list,
                'siege': None if not siege else {'platform': 'siege-platform', 'platformOffsetMetres': [0, -1.5, 0],
                    'corePositionMetres': [0, 14.4, 0], 'coreModule': 'forge-core-plinth' if sid == 'forge' else None,
                    'defenseModules': [{'module': 'defense-tower', 'positionMetres': [x, 14.4, 0]} for x in [-2.15, 2.15]],
                    'gates': [{'module': 'gate-multiply', 'positionMetres': [0, y, 0], 'multiplier': n} for y, n in [(5.4, 2), (9, 3)]]}}
        (OUT / 'layouts' / (sid + '.json')).write_text(json.dumps(data, indent=2), encoding='utf8')

def main():
    prepare()
    track()
    narrow_track()
    for kind in ['recruit', 'multiply', 'energy']: gate(kind)
    for build in [barricade, pickup, column, pipe_arch, railing, cliff, siege_platform, tower, forge_core]: build()
    manifest = {'schema': 1, 'route': 'original locally authored Blender geometry', 'productionAccepted': False,
                'status': 'rendered and measured environment prototype; in-engine/device validation pending',
                'authoringAxes': 'X lateral / Y forward / Z up; Blender metres, Unreal centimetres',
                'alignment': 'Keep these world axes after import; test an 8m segment before assembling a course.',
                'mobileMaterial': 'One shared palette per module; replace with palette-based Unlit engine material.',
                'modules': MODULES, 'totalSourceTriangles': sum(m['triangles'] for m in MODULES)}
    (OUT / 'manifests' / 'environment-kit.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT / 'source' / 'mechalord-environment-kit.blend'))
    write_layouts()
    assembly_preview(False)
    assembly_preview(True)
    print('ENVIRONMENT_KIT_COMPLETE', len(MODULES), manifest['totalSourceTriangles'], flush=True)

def validate_exports():
    """Re-import both interchange formats and verify mesh, UV and world bounds."""
    manifest = json.loads((OUT / 'manifests' / 'environment-kit.json').read_text(encoding='utf8'))
    results = []
    for entry in manifest['modules']:
        for format_name in ['glb', 'fbx']:
            bpy.ops.wm.read_factory_settings(use_empty=True)
            path = OUT / entry[format_name]
            if format_name == 'glb': bpy.ops.import_scene.gltf(filepath=str(path))
            else: bpy.ops.import_scene.fbx(filepath=str(path))
            meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
            assert len(meshes) == 1, (entry['id'], format_name, 'mesh count', len(meshes))
            obj = meshes[0]
            obj.data.calc_loop_triangles()
            actual_triangles = len(obj.data.loop_triangles)
            assert actual_triangles == entry['triangles'], (entry['id'], format_name, 'triangle count', actual_triangles)
            assert len(obj.data.materials) == 1, (entry['id'], format_name, 'material count')
            assert len(obj.data.uv_layers) == 1, (entry['id'], format_name, 'missing UV')
            points = [obj.matrix_world @ Vector(v) for v in obj.bound_box]
            actual_min = [min(p[i] for p in points) for i in range(3)]
            actual_max = [max(p[i] for p in points) for i in range(3)]
            error = max(abs(actual_min[i] - entry['boundsMin'][i]) for i in range(3))
            error = max(error, max(abs(actual_max[i] - entry['boundsMax'][i]) for i in range(3)))
            assert error < .0002, (entry['id'], format_name, 'axis/scale mismatch', error)
            shader_images = [n.image for n in obj.data.materials[0].node_tree.nodes if n.type == 'TEX_IMAGE' and n.image]
            assert shader_images and all(list(image.size) == [128, 128] for image in shader_images), (entry['id'], format_name, 'palette missing')
            results.append({'module': entry['id'], 'format': format_name, 'triangles': actual_triangles,
                            'boundsErrorMetres': round(error, 7), 'paletteVerified': True, 'status': 'pass'})
    report = {'schema': 1, 'blenderVersion': bpy.app.version_string,
              'status': 'pass', 'checks': len(results), 'scope': 'Blender export/reimport, not Unreal/device verification', 'results': results}
    (OUT / 'manifests' / 'export-validation.json').write_text(json.dumps(report, indent=2), encoding='utf8')
    print('ENVIRONMENT_EXPORT_VALIDATION_PASS', len(results), flush=True)

if __name__ == '__main__':
    if '--layouts-only' in sys.argv: write_layouts()
    elif '--validate-only' in sys.argv: validate_exports()
    else: main()
