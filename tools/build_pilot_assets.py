"""Run inside Blender. Original low-poly models built from Mechalord concepts.

These are locally authored interpretations, not Meshy output. Writes versioned
GLB/FBX/blend sources, all animation clips, previews and measured geometry.
"""
import bpy
import json
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets'
COLORS = {
    'ivory': (0.77, 0.71, 0.56, 1), 'teal': (0.035, 0.27, 0.29, 1),
    'bronze': (0.44, 0.26, 0.10, 1), 'dark': (0.045, 0.055, 0.065, 1),
    'rust': (0.42, 0.11, 0.055, 1), 'light': (0.12, 0.8, 0.77, 1),
    'amber': (1.0, 0.42, 0.035, 1), 'stone': (0.31, 0.33, 0.29, 1)
}
MATERIALS = {}
PARTS = []

def reset():
    global MATERIALS, PARTS
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.render.fps = 30
    MATERIALS = {}; PARTS = []
    for key, color in COLORS.items():
        m = bpy.data.materials.new(key)
        m.diffuse_color = color; m.use_nodes = True
        bsdf = m.node_tree.nodes.get('Principled BSDF')
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = 0.85
        m['mobile_color'] = list(color)
        MATERIALS[key] = m

def finish(obj, name, material, bone=None):
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(MATERIALS[material])
    if bone:
        group = obj.vertex_groups.new(name=bone)
        group.add(list(range(len(obj.data.vertices))), 1, 'REPLACE')
    PARTS.append(obj)
    return obj

def box(name, location, scale, material, bevel=0.025, bone=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object; obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new('Broad edge chamfer', 'BEVEL')
        mod.width = bevel; mod.segments = 1
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(obj, name, material, bone)

def sphere(name, location, scale, material, bone=None, segments=10, rings=5):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=1, location=location)
    obj = bpy.context.object; obj.scale = scale
    return finish(obj, name, material, bone)

def cylinder(name, location, radius, depth, material, axis='Z', bone=None, sides=12):
    bpy.ops.mesh.primitive_cylinder_add(vertices=sides, radius=radius, depth=depth, location=location)
    obj = bpy.context.object
    if axis == 'X': obj.rotation_euler.y = math.pi / 2
    elif axis == 'Y': obj.rotation_euler.x = math.pi / 2
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return finish(obj, name, material, bone)

def rig_parts(bones):
    bpy.ops.object.select_all(action='DESELECT')
    arm_data = bpy.data.armatures.new('MechalordSkeleton')
    arm = bpy.data.objects.new('Rig', arm_data)
    bpy.context.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm; arm.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    for name, head, tail, parent in bones:
        b = arm_data.edit_bones.new(name); b.head = head; b.tail = tail
        if parent: b.parent = arm_data.edit_bones[parent]
    bpy.ops.object.mode_set(mode='OBJECT')
    for obj in PARTS:
        mod = obj.modifiers.new('Rigid joint weights', 'ARMATURE'); mod.object = arm
        obj.parent = arm
    return arm

def join_skinned(arm):
    bpy.ops.object.select_all(action='DESELECT')
    for p in PARTS: p.select_set(True)
    bpy.context.view_layer.objects.active = PARTS[0]
    bpy.ops.object.join()
    mesh = bpy.context.object; mesh.name = 'RelicMarshalMesh'
    # Joining retains per-part vertex weights. Keep a single armature modifier.
    found = False
    for mod in list(mesh.modifiers):
        if mod.type == 'ARMATURE':
            if found: mesh.modifiers.remove(mod)
            else: mod.object = arm; found = True
    PARTS[:] = [mesh]

def action(arm, name, frames, pose):
    arm.animation_data_create()
    arm.animation_data.action = bpy.data.actions.new(name)
    bpy.context.scene.frame_start = 1; bpy.context.scene.frame_end = frames
    for frame in range(1, frames + 1, max(1, frames // 8)):
        for pb in arm.pose.bones:
            pb.rotation_mode = 'XYZ'; pb.rotation_euler = (0, 0, 0); pb.location = (0, 0, 0)
        pose(arm, (frame - 1) / max(1, frames - 1))
        for pb in arm.pose.bones:
            pb.keyframe_insert(data_path='rotation_euler', frame=frame)
            pb.keyframe_insert(data_path='location', frame=frame)
    # Add exact final pose to give loop clips matching endpoints.
    for pb in arm.pose.bones:
        pb.rotation_euler = (0, 0, 0); pb.location = (0, 0, 0)
    pose(arm, 1)
    for pb in arm.pose.bones:
        pb.keyframe_insert(data_path='rotation_euler', frame=frames)
        pb.keyframe_insert(data_path='location', frame=frames)
    arm.animation_data.action.use_fake_user = True
    return arm.animation_data.action

def marshal():
    reset()
    bones = [('root',(0,0,0),(0,0,0.25),None),
             ('pelvis',(0,0,0.85),(0,0,1.06),'root'),
             ('chest',(0,0,1.06),(0,0,1.47),'pelvis'),
             ('head',(0,0,1.47),(0,0,1.83),'chest')]
    for sign, side in [(-1,'L'),(1,'R')]:
        x = sign * 0.34
        bones += [(f'upperarm.{side}',(x,0,1.4),(sign*0.46,0,1.13),'chest'),
                  (f'forearm.{side}',(sign*0.46,0,1.13),(sign*0.55,0,0.84),f'upperarm.{side}'),
                  (f'thigh.{side}',(sign*0.17,0,0.87),(sign*0.19,0,0.48),'pelvis'),
                  (f'shin.{side}',(sign*0.19,0,0.48),(sign*0.20,0,0.15),f'thigh.{side}'),
                  (f'foot.{side}',(sign*0.20,0,0.15),(sign*0.20,-0.20,0.10),f'shin.{side}')]
    box('Waist',(0,0,0.93),(0.40,0.30,0.25),'bronze',bone='pelvis')
    sphere('Chest',(0,0,1.25),(0.32,0.20,0.31),'ivory',bone='chest')
    box('Chest stripe',(0,-0.197,1.24),(0.11,0.035,0.35),'teal',bone='chest')
    cylinder('Relic core',(0,-0.225,1.3),0.075,0.04,'light','Y','chest')
    sphere('Helmet',(0,0,1.65),(0.19,0.17,0.22),'ivory',bone='head')
    box('Visor',(0,-0.157,1.68),(0.29,0.045,0.065),'dark',0.015,'head')
    box('Eye',(0,-0.182,1.68),(0.20,0.008,0.018),'light',0,'head')
    box('Crest',(0,0,1.85),(0.06,0.22,0.09),'teal',0.012,'head')
    for sign, side in [(-1,'L'),(1,'R')]:
        sphere(f'Shoulder {side}',(sign*0.34,0,1.40),(0.17,0.19,0.18),'teal',f'upperarm.{side}')
        box(f'Arm {side}',(sign*0.42,0,1.25),(0.16,0.17,0.27),'ivory',bone=f'upperarm.{side}')
        sphere(f'Elbow {side}',(sign*0.46,0,1.13),(0.09,0.09,0.09),'bronze',f'forearm.{side}')
        box(f'Gauntlet {side}',(sign*0.52,0,0.96),(0.20,0.21,0.26),'ivory',bone=f'forearm.{side}')
        box(f'Hand {side}',(sign*0.55,-0.015,0.81),(0.14,0.14,0.10),'dark',bone=f'forearm.{side}')
        box(f'Thigh {side}',(sign*0.17,0,0.71),(0.21,0.24,0.29),'ivory',bone=f'thigh.{side}')
        sphere(f'Knee {side}',(sign*0.19,-0.045,0.48),(0.12,0.13,0.12),'bronze',f'shin.{side}')
        box(f'Shin {side}',(sign*0.20,0,0.30),(0.22,0.24,0.28),'teal',bone=f'shin.{side}')
        box(f'Boot {side}',(sign*0.20,-0.07,0.10),(0.25,0.39,0.18),'ivory',bone=f'foot.{side}')
    box('Forearm relic weapon',(0.52,-0.16,1.00),(0.16,0.16,0.32),'bronze',bone='forearm.R')
    arm = rig_parts(bones); join_skinned(arm)
    def idle(a,t): a.pose.bones['chest'].rotation_euler.x = math.sin(t*2*math.pi)*0.025
    def run(a,t):
        for side, sign in [('L',1),('R',-1)]:
            a.pose.bones[f'thigh.{side}'].rotation_euler.x = math.sin(t*2*math.pi)*0.55*sign
            a.pose.bones[f'shin.{side}'].rotation_euler.x = max(0,math.sin(t*2*math.pi)*sign)*0.55
            a.pose.bones[f'upperarm.{side}'].rotation_euler.x = math.sin(t*2*math.pi)*-0.35*sign
        a.pose.bones['root'].location.z = abs(math.sin(t*2*math.pi))*0.025
    def fire(a,t):
        a.pose.bones['upperarm.R'].rotation_euler.x = -0.9
        a.pose.bones['forearm.R'].rotation_euler.x = -0.15 + math.sin(t*math.pi)*0.12
    def hit(a,t): a.pose.bones['chest'].rotation_euler.x = math.sin(t*math.pi)*0.25
    def deploy(a,t):
        a.pose.bones['upperarm.L'].rotation_euler.y = -math.sin(t*math.pi)*0.9
        a.pose.bones['upperarm.R'].rotation_euler.y = math.sin(t*math.pi)*0.9
        a.pose.bones['root'].location.z = math.sin(t*math.pi)*0.10
    clips = [action(arm,'Idle',60,idle),action(arm,'Run',30,run),action(arm,'Fire',18,fire),
             action(arm,'Hit',18,hit),action(arm,'Deploy',30,deploy)]
    arm.animation_data.action = clips[0]
    export('relic-marshal', arm, clips, 4000)

def machine(enemy=False):
    reset(); slug = 'rust-crawler' if enemy else 'gearling-sentinel'
    body = 'rust' if enemy else 'ivory'; accent = 'dark' if enemy else 'teal'
    box('Chassis',(0,0,0.43),(0.7,0.72,0.45),body,0.07,'body')
    box('Chest plate',(0,-0.38,0.44),(0.47,0.055,0.3),accent,0.04,'body')
    box('Visor',(0,-0.389,0.64),(0.43,0.055,0.12),'dark',0.018,'body')
    for x in [-0.13,0.13]: box('Eye',(x,-0.423,0.65),(0.055,0.012,0.063),'amber' if enemy else 'light',0.005,'body')
    cylinder('Turret bearing',(0,0,0.74),0.17,0.10,'bronze',bone='turret',sides=8)
    box('Turret',(0,0,0.87),(0.40,0.42,0.19),accent,0.04,'turret')
    if enemy:
        cylinder('Cannon',(0,-0.40,0.88),0.11,0.56,'bronze','Y','turret',8)
        cylinder('Muzzle',(0,-0.69,0.88),0.072,0.012,'dark','Y','turret',8)
        for sign, side in [(-1,'L'),(1,'R')]:
            box('Track',(sign*0.46,0,0.22),(0.27,0.97,0.39),'dark',0.10,'body')
            for y in [-0.30,0.30]: cylinder('Track hub',(sign*0.605,y,0.22),0.14,0.018,'bronze','X',f'wheel.{side}',8)
    else:
        box('Crossbow barrel',(0,-0.24,0.87),(0.07,0.74,0.065),'dark',0.008,'turret')
        box('Crossbow bow',(0,-0.36,0.87),(0.62,0.06,0.085),'bronze',0.012,'turret')
        for sign, side in [(-1,'L'),(1,'R')]:
            cylinder('Wheel',(sign*0.46,0,0.25),0.29,0.22,'teal','X',f'wheel.{side}',10)
            cylinder('Hub',(sign*0.58,0,0.25),0.16,0.024,'bronze','X',f'wheel.{side}',10)
    arm = rig_parts([('root',(0,0,0),(0,0,0.1),None), ('body',(0,0,0.30),(0,0,0.7),'root'),
        ('turret',(0,0,0.75),(0,0,0.95),'body'),
        ('wheel.L',(-0.46,0,0.25),(-0.56,0,0.25),'root'),
        ('wheel.R',(0.46,0,0.25),(0.56,0,0.25),'root')])
    def idle(a,t): a.pose.bones['turret'].rotation_euler.z = math.sin(t*math.pi*2)*0.08
    def roll(a,t):
        a.pose.bones['body'].location.z = math.sin(t*math.pi*4)*0.012
        for side, sign in [('L',1),('R',-1)]:
            a.pose.bones[f'wheel.{side}'].rotation_euler.y = sign*t*math.pi*2
    def fire(a,t): a.pose.bones['turret'].location.y = math.sin(t*math.pi)*0.08
    clips=[action(arm,'Idle',60,idle),action(arm,'Roll',30,roll),action(arm,'Fire',18,fire)]
    arm.animation_data.action=clips[0]
    export(slug,arm,clips,700)

def atlas(slug):
    """A padded palette atlas replaces separate color materials with one slot.

    Each polygon samples the center of its original color swatch. The authored
    source uses rigid armor surfaces, so no painted detail is lost in this bake.
    """
    size = 1024 if slug == 'relic-marshal' else 512
    image = bpy.data.images.new(slug+'-palette', width=size, height=size, alpha=False)
    pixels = []
    colors = list(COLORS.values()); names = list(COLORS)
    for y in range(size):
        row = y // (size//2)
        for x in range(size): pixels.extend(colors[row*4+x//(size//4)])
    image.pixels.foreach_set(pixels)
    image.filepath_raw = str(OUT/'exports'/f'{slug}-palette-v1.png')
    image.file_format = 'PNG'; image.save(); image.pack()
    mat = bpy.data.materials.new(slug+'-mobile-atlas'); mat.use_nodes=True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Roughness'].default_value=0.85
    tex = mat.node_tree.nodes.new('ShaderNodeTexImage'); tex.image=image; tex.interpolation='Closest'
    mat.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
    for obj in PARTS:
        old_names=[m.name for m in obj.data.materials]
        uv = obj.data.uv_layers.active or obj.data.uv_layers.new(name='PaletteUV')
        for poly in obj.data.polygons:
            index=names.index(old_names[poly.material_index])
            coord=((index%4+0.5)/4,(index//4+0.5)/2)
            for loop in poly.loop_indices: uv.data[loop].uv=coord
            poly.material_index=0
        obj.data.materials.clear(); obj.data.materials.append(mat)
    return size

def export(slug, arm, clips, target):
    texture_size = atlas(slug)
    for part in PARTS:
        part.data.calc_loop_triangles()
    triangles=sum(len(p.data.loop_triangles) for p in PARTS)
    if triangles > target:
        # Keep armature weights; apply geometry decimation before the rig modifier.
        ratio=(target-20)/triangles
        for p in PARTS:
            bpy.context.view_layer.objects.active=p
            dec=p.modifiers.new('Mobile reduction','DECIMATE'); dec.ratio=ratio
            bpy.ops.object.modifier_move_up(modifier=dec.name)
            bpy.ops.object.modifier_apply(modifier=dec.name)
        triangles=sum(len(p.data.loop_triangles) for p in PARTS)
    bpy.context.scene.frame_set(1)
    for p in PARTS: p.data.calc_loop_triangles()
    triangles=sum(len(p.data.loop_triangles) for p in PARTS)
    selected = [arm]+PARTS
    def select():
        bpy.ops.object.select_all(action='DESELECT')
        for o in selected: o.select_set(True)
        bpy.context.view_layer.objects.active=arm
    select()
    glb=OUT/'exports'/f'{slug}-v1.glb'
    kwargs=dict(filepath=str(glb),export_format='GLB',use_selection=True,export_animations=True,
                export_animation_mode='ACTIONS',export_skins=True)
    props=bpy.ops.export_scene.gltf.get_rna_type().properties.keys()
    bpy.ops.export_scene.gltf(**{k:v for k,v in kwargs.items() if k in props})
    for clip in clips:
        arm.animation_data.action=clip
        bpy.context.scene.frame_start=int(clip.frame_range[0]); bpy.context.scene.frame_end=int(clip.frame_range[1])
        select()
        bpy.ops.export_scene.fbx(filepath=str(OUT/'exports'/f'{slug}-{clip.name.lower()}-v1.fbx'),
            use_selection=True,object_types={'ARMATURE','MESH'},add_leaf_bones=False,
            bake_anim=True,bake_anim_use_all_actions=False,bake_anim_use_nla_strips=False,
            axis_forward='-Y',axis_up='Z',apply_unit_scale=True)
    arm.animation_data.action=clips[0]; bpy.context.scene.frame_start=1; bpy.context.scene.frame_end=60
    bpy.context.scene.frame_set(1)
    # Export a static instancing mesh alongside the animated source.
    select()
    bpy.ops.export_scene.fbx(filepath=str(OUT/'exports'/f'{slug}-static-v1.fbx'),use_selection=True,
        object_types={'MESH'},bake_anim=False,axis_forward='-Y',axis_up='Z')
    preview(slug, 1.9 if slug=='relic-marshal' else 1.0)
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'source'/f'{slug}-v1.blend'))
    bounds=[]
    for p in PARTS: bounds += [p.matrix_world @ Vector(c) for c in p.bound_box]
    size=[max(v[i] for v in bounds)-min(v[i] for v in bounds) for i in range(3)]
    receipt={'id':slug,'route':'locally-authored-Blender-interpretation','blender':bpy.app.version_string,
        'concept':f'art/concepts/{slug}-v1.png','triangles':triangles,'triangleTarget':target,
        'materialCount':len({m.name for p in PARTS for m in p.data.materials}),
        'textureSize':[texture_size,texture_size],
        'dimensionsMeters':size,'animations':[c.name for c in clips],
        'boneCount':len(arm.data.bones),'glb':str(glb.relative_to(ROOT)),
        'source':f'assets/source/{slug}-v1.blend','preview':f'assets/previews/{slug}-v1.png',
        'paidGenerationCredits':0,'engineImportVerified':False}
    (OUT/'manifests'/f'{slug}-blender.json').write_text(json.dumps(receipt,indent=2))
    print(json.dumps(receipt))

def preview(slug, height):
    scene=bpy.context.scene
    scene.render.engine='CYCLES'; scene.cycles.samples=24
    scene.render.resolution_x=720; scene.render.resolution_y=800; scene.render.resolution_percentage=100
    scene.world=bpy.data.worlds.new('Studio'); scene.world.use_nodes=True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value=(0.17,0.20,0.23,1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value=0.6
    bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-0.035))
    floor=bpy.context.object; floor.name='PreviewGround'
    mat=bpy.data.materials.new('Preview ground'); mat.diffuse_color=(0.16,0.18,0.20,1); floor.data.materials.append(mat)
    bpy.ops.object.camera_add(location=(height*2.2,-height*3.6,height*2.1))
    camera=bpy.context.object; scene.camera=camera
    direction=Vector((0,0,height*0.5))-camera.location
    camera.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
    camera.data.type='ORTHO'; camera.data.ortho_scale=height*1.65
    for loc, energy, size in [((3,-4,6),650,5),((-4,-1,3),400,4),((1,3,5),750,3)]:
        bpy.ops.object.light_add(type='AREA',location=loc)
        light=bpy.context.object; light.data.energy=energy; light.data.shape='DISK'; light.data.size=size
        light.rotation_euler=(Vector((0,0,height/2))-light.location).to_track_quat('-Z','Y').to_euler()
    scene.render.image_settings.file_format='PNG'
    scene.render.filepath=str(OUT/'previews'/f'{slug}-v1.png')
    bpy.ops.render.render(write_still=True)

if __name__=='__main__':
    for d in ['exports','source','previews','manifests']: (OUT/d).mkdir(parents=True,exist_ok=True)
    marshal(); machine(False); machine(True)
