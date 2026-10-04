"""Original detailed Blender assets. No external generation or paid services.

Run with Blender --background --python-exit-code 1 --python this_file.
The original concept images remain authoritative; this builds a new, editable
interpretation with individually weighted mechanical parts and baked textures.
"""
import bpy, math, json, sys
from pathlib import Path
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).resolve().parent))
import build_pilot_assets as base
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'
base.COLORS.update({'ivory':(.68,.57,.40,1),'teal':(.015,.14,.15,1),
    'bronze':(.36,.19,.062,1),'dark':(.012,.018,.024,1),'light':(.012,.50,.47,1)})

def material_detail():
    for name,m in base.MATERIALS.items():
        nodes=m.node_tree.nodes; links=m.node_tree.links
        shader=nodes.get('Principled BSDF'); color=base.COLORS[name]
        shader.inputs['Metallic'].default_value=0.72 if name=='bronze' else 0.18
        shader.inputs['Roughness'].default_value=0.38 if name=='bronze' else 0.6
        if name in ('light','amber'):
            shader.inputs['Emission Color'].default_value=color
            shader.inputs['Emission Strength'].default_value=1.5
            continue
        coord=nodes.new('ShaderNodeTexCoord')
        noise=nodes.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value=37
        noise.inputs['Detail'].default_value=2.5; noise.inputs['Roughness'].default_value=0.7
        links.new(coord.outputs['Object'],noise.inputs['Vector'])
        ramp=nodes.new('ShaderNodeValToRGB')
        ramp.color_ramp.elements[0].position=0.22
        ramp.color_ramp.elements[0].color=tuple(c*0.62 for c in color[:3])+(1,)
        ramp.color_ramp.elements[1].position=0.77
        ramp.color_ramp.elements[1].color=tuple(min(1,c*1.16+0.025) for c in color[:3])+(1,)
        links.new(noise.outputs['Fac'],ramp.inputs['Fac'])
        links.new(ramp.outputs['Color'],shader.inputs['Base Color'])
        bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=0.11
        bump.inputs['Distance'].default_value=0.003
        links.new(noise.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],shader.inputs['Normal'])

def hull(name,levels,mat,bone,sides=16,center=(0,0)):
    verts=[]
    for z,rx,ry in levels:
        for j in range(sides):
            a=2*math.pi*j/sides
            verts.append((center[0]+rx*math.cos(a),center[1]+ry*math.sin(a),z))
    faces=[tuple(reversed(range(sides)))]
    for k in range(len(levels)-1):
        for j in range(sides):faces.append((k*sides+j,k*sides+(j+1)%sides,(k+1)*sides+(j+1)%sides,(k+1)*sides+j))
    faces.append(tuple((len(levels)-1)*sides+j for j in range(sides)))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    for p in obj.data.polygons:
        if len(p.vertices)==4:p.use_smooth=True
    return base.finish(obj,name,mat,bone)

def plate(name,points,y,thickness,mat,bone,center=(0,0)):
    n=len(points);verts=[(x+center[0],yy,z+center[1]) for yy in (y,y+thickness) for x,z in points]
    faces=[tuple(range(n)),tuple(reversed(range(n,n*2)))]
    for i in range(n):faces.append((i,(i+1)%n,(i+1)%n+n,i+n))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    return base.finish(obj,name,mat,bone)

def torus(name,location,major,minor,mat,bone,axis='Z',scale=(1,1,1),sides=20):
    bpy.ops.mesh.primitive_torus_add(major_segments=sides,minor_segments=6,location=location,major_radius=major,minor_radius=minor)
    o=bpy.context.object
    if axis=='X':o.rotation_euler.y=math.pi/2
    if axis=='Y':o.rotation_euler.x=math.pi/2
    o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
    for p in o.data.polygons:p.use_smooth=True
    return base.finish(o,name,mat,bone)

def wire(name,points,radius,mat,bone):
    curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.resolution_u=1
    curve.bevel_depth=radius;curve.bevel_resolution=1
    line=curve.splines.new('POLY');line.points.add(len(points)-1)
    for p,xyz in zip(line.points,points):p.co=(*xyz,1)
    obj=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(obj)
    bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
    bpy.ops.object.convert(target='MESH')
    return base.finish(bpy.context.object,name,mat,bone)

def inset(name,outline,y,thickness,mat,bone,center=(0,0),ratio=.88):
    plate(name+' bronze border',outline,y+.009,thickness,'bronze',bone,center)
    plate(name+' inset',[(x*ratio,z*ratio) for x,z in outline],y,thickness,mat,bone,center)

def marshal_geometry():
    base.reset();material_detail()
    bones=[('root',(0,0,0),(0,0,.25),None),('pelvis',(0,0,.9),(0,0,1.06),'root'),
        ('chest',(0,0,1.06),(0,0,1.51),'pelvis'),('head',(0,0,1.51),(0,0,1.92),'chest')]
    for sign,side in [(-1,'L'),(1,'R')]:
        bones += [(f'upperarm.{side}',(sign*.44,0,1.43),(sign*.59,0,1.14),'chest'),
            (f'forearm.{side}',(sign*.59,0,1.14),(sign*.64,0,.83),f'upperarm.{side}'),
            (f'thigh.{side}',(sign*.22,0,.94),(sign*.23,0,.53),'pelvis'),
            (f'shin.{side}',(sign*.23,0,.53),(sign*.23,0,.17),f'thigh.{side}'),
            (f'foot.{side}',(sign*.23,0,.17),(sign*.23,-.22,.08),f'shin.{side}')]
    hull('Dark articulated torso',[(.97,.25,.15),(1.18,.35,.20),(1.47,.30,.18)],'dark','chest')
    chest=[(-.37,1.40),(-.29,1.48),(.29,1.48),(.38,1.40),(.35,1.21),(.23,1.05),(0,1.015),(-.23,1.05),(-.35,1.21)]
    plate('Breastplate bronze rim',chest,-.247,.065,'bronze','chest')
    plate('Breastplate ceramic',[(x*.94,1.25+(z-1.25)*.95) for x,z in chest],-.258,.06,'ivory','chest')
    for sign in [-1,1]:
        plate('Chest flanking teal inlay',[(sign*.19,1.47),(sign*.28,1.46),(sign*.32,1.39),(sign*.29,1.27),(sign*.24,1.32)],-.268,.018,'teal','chest')
    plate('Relic vertical bronze channel',[(-.055,1.48),(.055,1.48),(.055,1.07),(0,1.04),(-.055,1.07)],-.276,.012,'bronze','chest')
    plate('Relic vertical teal channel',[(-.032,1.48),(.032,1.48),(.032,1.08),(0,1.06),(-.032,1.08)],-.286,.008,'teal','chest')
    base.box('Relic horizontal filigree',(0,-.293,1.30),(.29,.016,.026),'bronze',.005,'chest')
    base.cylinder('Relic housing',(0,-.29,1.30),.116,.038,'bronze','Y','chest',24)
    base.cylinder('Relic inner socket',(0,-.315,1.30),.087,.02,'dark','Y','chest',20)
    torus('Relic gold ring',(0,-.335,1.30),.087,.008,'bronze','chest','Y')
    base.sphere('Faceted cyan relic',(0,-.34,1.30),(.074,.04,.074),'light','chest',16,8)
    hull('Helmet ceramic shell',[(1.54,.13,.13),(1.65,.205,.175),(1.80,.197,.17),(1.89,.125,.12),(1.94,.035,.07)],'ivory','head',20)
    base.cylinder('Neck spindle',(0,0,1.52),.115,.16,'dark','Z','head',20)
    torus('Bronze articulated collar',(0,0,1.505),.143,.022,'bronze','chest',sides=24)
    face=[(-.18,1.78),(-.13,1.60),(-.07,1.54),(.07,1.54),(.13,1.60),(.18,1.78),(.10,1.85),(-.10,1.85)]
    plate('Faceplate bronze edging',face,-.174,.028,'bronze','head')
    plate('Faceplate ivory',[(x*.92,1.71+(z-1.71)*.92) for x,z in face],-.182,.028,'ivory','head')
    visor=[(-.16,1.765),(-.055,1.745),(0,1.728),(.055,1.745),(.16,1.765),(.15,1.705),(.05,1.686),(0,1.667),(-.05,1.686),(-.15,1.705)]
    plate('Deep angular visor',visor,-.216,.025,'dark','head')
    for sign in [-1,1]:
        plate('Slit cyan eye',[(sign*.145,1.748),(sign*.048,1.717),(sign*.043,1.689),(sign*.142,1.719)],-.220,.004,'light','head')
    plate('Central helmet nose ridge',[(-.027,1.80),(.027,1.80),(.025,1.59),(0,1.55),(-.025,1.59)],-.231,.027,'ivory','head')
    base.box('Bronze helmet crest',(0,-.01,1.944),(.075,.25,.072),'bronze',.01,'head')
    base.box('Teal crest inlay',(0,-.015,1.963),(.041,.255,.055),'teal',.005,'head')
    for sign in [-1,1]:
        base.cylinder('Helmet ear bearing',(sign*.202,0,1.76),.089,.055,'bronze','X','head',20)
        base.cylinder('Helmet ear inset',(sign*.234,0,1.76),.061,.012,'dark','X','head',16)
        torus('Helmet ear rim',(sign*.24,0,1.76),.059,.009,'bronze','head','X')
    hull('Flexible waist',[(.90,.24,.145),(1.07,.27,.16)],'dark','pelvis',16)
    hull('Bronze belt',[(.95,.29,.175),(1.04,.30,.18)],'bronze','pelvis',16)
    inset('Teal tabard',[(-.13,.20),(.13,.20),(.105,-.16),(0,-.21),(-.105,-.16)],-.208,.032,'teal','pelvis',(0,.85))
    for sign,side in [(-1,'L'),(1,'R')]:
        arm=f'upperarm.{side}'; fore=f'forearm.{side}'; thigh=f'thigh.{side}'; shin=f'shin.{side}'; foot=f'foot.{side}'
        hull('Layered shoulder '+side,[(1.32,.24,.20),(1.39,.26,.22),(1.50,.235,.21),(1.59,.16,.14),(1.63,.045,.04)],'ivory',arm,20,(sign*.43,0))
        torus('Shoulder bronze skirt '+side,(sign*.43,0,1.337),.237,.018,'bronze',arm,scale=(1,.86,1))
        shield=[(-.12,.10),(.08,.13),(.145,.055),(.13,-.055),(.025,-.10),(-.12,-.065)]
        inset('Shoulder heraldry '+side,shield,-.215,.016,'teal',arm,(sign*.43,1.48))
        crown=[(-.075,0),(-.06,.06),(-.027,.024),(0,.074),(.027,.024),(.06,.06),(.075,0),(.055,-.012),(-.055,-.012)]
        plate('Crown crest '+side,crown,-.244,.006,'bronze',arm,(sign*.43,1.46))
        base.cylinder('Shoulder exposed bearing '+side,(sign*.43,-.228,1.345),.092,.035,'bronze','Y',arm,20)
        base.cylinder('Shoulder bearing inset '+side,(sign*.43,-.25,1.345),.061,.009,'dark','Y',arm,16)
        hull('Upper arm armor '+side,[(1.16,.085,.095),(1.28,.115,.11),(1.40,.13,.12)],'ivory',arm,12,(sign*.545,0))
        base.cylinder('Elbow mechanical hinge '+side,(sign*.59,0,1.14),.097,.21,'bronze','X',fore,16)
        base.cylinder('Elbow center '+side,(sign*.705,0,1.14),.06,.01,'dark','X',fore,12)
        hull('Braced forearm '+side,[(.85,.085,.08),(.98,.12,.12),(1.11,.13,.12)],'ivory',fore,12,(sign*.63,0))
        torus('Gauntlet cuff '+side,(sign*.63,0,.855),.088,.011,'bronze',fore,scale=(1,.93,1),sides=16)
        inset('Forearm teal stripe '+side,[(-.044,.10),(.044,.10),(.04,-.10),(-.04,-.10)],-.132,.008,'teal',fore,(sign*.63,.99))
        base.box('Segmented palm '+side,(sign*.642,-.003,.79),(.10,.095,.13),'dark',.015,fore)
        for finger in range(4):
            x=sign*.642+(finger-1.5)*.024
            for joint in range(3):
                z=.765-joint*.027;y=-.027-joint*.009
                base.box(f'Finger {side} {finger} segment {joint}',(x,y,z),(.021,.030,.024),'dark',.006,fore)
            base.sphere('Finger knuckle',(x,-.043,.795),(.014,.014,.017),'bronze',fore,8,4)
        for j in range(3):base.box('Thumb '+side,(sign*(.707-j*.009),-.035-j*.009,.80-j*.024),(.027,.025,.027),'dark',.005,fore)
        hull('Shaped thigh shell '+side,[(.58,.105,.11),(.70,.16,.14),(.88,.18,.16),(.97,.125,.12)],'ivory',thigh,16,(sign*.225,0))
        plate('Thigh articulated seam '+side,[(-.075,.12),(.10,.12),(.13,-.07),(.02,-.16),(-.06,-.11)],-.167,.015,'bronze',thigh,(sign*.225,.80))
        plate('Thigh outer armor plate '+side,[(-.06,.1),(.085,.11),(.10,-.075),(-.005,-.105)],-.177,.012,'ivory',thigh,(sign*.225,.80))
        base.cylinder('Knee bearing '+side,(sign*.23,-.07,.53),.12,.17,'bronze','Y',shin,20)
        base.sphere('Ceramic knee cap '+side,(sign*.23,-.176,.53),(.11,.035,.108),'ivory',shin,16,8)
        base.cylinder('Outer knee hinge '+side,(sign*.352,0,.53),.079,.027,'bronze','X',shin,16)
        hull('Shin ceramic shell '+side,[(.17,.14,.105),(.27,.135,.11),(.44,.145,.125),(.49,.125,.115)],'ivory',shin,16,(sign*.23,0))
        inset('Shin teal heraldry '+side,[(-.060,.13),(.070,.13),(.065,-.11),(-.075,-.11)],-.138,.012,'teal',shin,(sign*.23,.32))
        hull('Bronze boot sole '+side,[(.03,.161,.241),(.065,.165,.246)],'bronze',foot,16,(sign*.23,-.075))
        hull('Shaped ceramic boot '+side,[(.065,.155,.23),(.115,.158,.24),(.175,.13,.19),(.23,.106,.115)],'ivory',foot,16,(sign*.23,-.075))
        wire('Boot seam '+side,[(sign*.23-.125,-.23,.151),(sign*.23,-.30,.155),(sign*.23+.125,-.23,.151)],.009,'bronze',foot)
    # Forearm crossbow follows the forearm bone, including firing recoil.
    x=.63;bone='forearm.R'
    base.box('Crossbow armored frame',(x,-.195,1.0),(.115,.055,.36),'bronze',.016,bone)
    base.box('Crossbow black rail',(x,-.232,1.0),(.058,.034,.31),'dark',.007,bone)
    for dx in [-.054,.054]:base.cylinder('Crossbow guide rail',(x+dx,-.25,1.01),.012,.34,'bronze','Z',bone,10)
    base.cylinder('Crossbow cyan energy capsule',(x,-.267,1.055),.024,.16,'light','Z',bone,12)
    for z in [.974,1.138]:torus('Crossbow capsule collar',(x,-.267,z),.026,.008,'bronze',bone,sides=12)
    bow=[(x-.175,-.228,.915),(x-.12,-.258,.882),(x,-.272,.876),(x+.12,-.258,.882),(x+.175,-.228,.915)]
    wire('Cast bronze crossbow bow',bow,.018,'bronze',bone)
    wire('Crossbow string',[bow[0],(x,-.28,1.025),bow[-1]],.004,'dark',bone)
    plate('Crossbow spear tip',[(-.024,.02),(0,-.033),(.024,.02)],-.277,.018,'bronze',bone,(x,.848))
    return base.rig_parts(bones)

def clips_for(arm):
    def idle(a,t):a.pose.bones['chest'].rotation_euler.x=math.sin(t*math.tau)*.012
    def run(a,t):
        for side,sign in [('L',1),('R',-1)]:
            a.pose.bones['thigh.'+side].rotation_euler.x=math.sin(t*math.tau)*.48*sign
            a.pose.bones['shin.'+side].rotation_euler.x=max(0,math.sin(t*math.tau)*sign)*.55
            a.pose.bones['upperarm.'+side].rotation_euler.x=-math.sin(t*math.tau)*.28*sign
        a.pose.bones['root'].location.z=abs(math.sin(t*math.tau))*.02
    def fire(a,t):
        a.pose.bones['upperarm.R'].rotation_euler.x=-.95
        a.pose.bones['forearm.R'].rotation_euler.x=-.12+math.sin(math.pi*t)*.10
    def hit(a,t):a.pose.bones['chest'].rotation_euler.x=math.sin(t*math.pi)*.17
    def deploy(a,t):
        a.pose.bones['root'].location.z=math.sin(t*math.pi)*.06
        for side,sign in [('L',-1),('R',1)]:a.pose.bones['upperarm.'+side].rotation_euler.y=sign*math.sin(t*math.pi)*.42
    return [base.action(arm,'Idle',60,idle),base.action(arm,'Run',30,run),base.action(arm,'Fire',24,fire),base.action(arm,'Hit',20,hit),base.action(arm,'Deploy',30,deploy)]

def export_mesh(arm,slug):
    bpy.ops.object.select_all(action='DESELECT');copies=[]
    for part in base.PARTS:
        copy=part.copy();copy.data=part.data.copy();bpy.context.collection.objects.link(copy);copies.append(copy);copy.select_set(True)
    bpy.context.view_layer.objects.active=copies[0];bpy.ops.object.join();mesh=bpy.context.object;mesh.name=slug+'-textured-source'
    found=False
    for mod in list(mesh.modifiers):
        if mod.type=='ARMATURE':
            if found:mesh.modifiers.remove(mod)
            else:found=True
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.005)
    bpy.ops.object.mode_set(mode='OBJECT')
    size=1024 if slug=='relic-marshal' else 512
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=1
    scene.render.bake.margin=4
    color=bpy.data.images.new(slug+'-base-color-v2',width=size,height=size,alpha=False)
    packed=bpy.data.images.new(slug+'-metal-rough-v2',width=size,height=size,alpha=False)
    packed.colorspace_settings.name='Non-Color'
    for target,mode in [(color,'color'),(packed,'orm')]:
        restore=[]
        for mat in mesh.data.materials:
            nodes=mat.node_tree.nodes;links=mat.node_tree.links
            output=next(n for n in nodes if n.type=='OUTPUT_MATERIAL')
            old=output.inputs['Surface'].links[0].from_socket
            emission=nodes.new('ShaderNodeEmission');shader=nodes.get('Principled BSDF')
            if mode=='color':
                if shader.inputs['Base Color'].is_linked:links.new(shader.inputs['Base Color'].links[0].from_socket,emission.inputs['Color'])
                else:emission.inputs['Color'].default_value=shader.inputs['Base Color'].default_value
            else:emission.inputs['Color'].default_value=(1,shader.inputs['Roughness'].default_value,shader.inputs['Metallic'].default_value,1)
            links.new(emission.outputs[0],output.inputs['Surface'])
            tex=nodes.new('ShaderNodeTexImage');tex.image=target;nodes.active=tex
            restore.append((mat,old,emission,tex,output))
        bpy.ops.object.select_all(action='DESELECT');mesh.select_set(True);bpy.context.view_layer.objects.active=mesh
        bpy.ops.object.bake(type='EMIT')
        for mat,old,emission,tex,output in restore:
            mat.node_tree.links.new(old,output.inputs['Surface']);mat.node_tree.nodes.remove(emission);mat.node_tree.nodes.remove(tex)
        target.filepath_raw=str(OUT/'exports'/f'{slug}-{mode}-v2.png');target.file_format='PNG';target.save();target.pack()
    mat=bpy.data.materials.new(slug+'-baked-mobile');mat.use_nodes=True
    shader=mat.node_tree.nodes.get('Principled BSDF');nodes=mat.node_tree.nodes;links=mat.node_tree.links
    tex=nodes.new('ShaderNodeTexImage');tex.image=color;links.new(tex.outputs['Color'],shader.inputs['Base Color'])
    orm=nodes.new('ShaderNodeTexImage');orm.image=packed;split=nodes.new('ShaderNodeSeparateColor');links.new(orm.outputs['Color'],split.inputs['Color'])
    links.new(split.outputs['Green'],shader.inputs['Roughness']);links.new(split.outputs['Blue'],shader.inputs['Metallic'])
    mesh.data.materials.clear();mesh.data.materials.append(mat)
    for p in mesh.data.polygons:p.material_index=0
    return mesh

def count(obj):obj.data.calc_loop_triangles();return len(obj.data.loop_triangles)

def export_selected(arm,mesh,path):
    bpy.ops.object.select_all(action='DESELECT');arm.select_set(True);mesh.select_set(True);bpy.context.view_layer.objects.active=arm
    kwargs={'filepath':str(path),'export_format':'GLB','use_selection':True,'export_animations':True,'export_animation_mode':'ACTIONS','export_skins':True}
    props=bpy.ops.export_scene.gltf.get_rna_type().properties.keys()
    bpy.ops.export_scene.gltf(**{k:v for k,v in kwargs.items() if k in props})

def studio(slug):
    s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=32
    s.render.resolution_x=960;s.render.resolution_y=1120;s.render.resolution_percentage=100
    s.world=bpy.data.worlds.new('Neutral studio');s.world.use_nodes=True
    s.world.node_tree.nodes['Background'].inputs[0].default_value=(.12,.14,.16,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.35
    bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,.019));floor=bpy.context.object;floor.name='Studio ground'
    m=bpy.data.materials.new('Studio slate');m.diffuse_color=(.10,.12,.14,1);m.use_nodes=True
    m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.10,.12,.14,1);m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.9
    floor.data.materials.append(m)
    hero=slug=='relic-marshal'
    bpy.ops.object.camera_add(location=(3.2,-6.5,3.0) if hero else (2,-4,2));cam=bpy.context.object;cam.name='Concept review camera';s.camera=cam
    cam.rotation_euler=(Vector((0,0,1.02 if hero else .50))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.55 if hero else 1.75
    for xyz,energy,size in [((3,-4,5),600,4),((-3,-2,3),350,3),((1,3,4),800,3)]:
        bpy.ops.object.light_add(type='AREA',location=xyz);light=bpy.context.object;light.data.energy=energy;light.data.size=size
        light.rotation_euler=(Vector((0,0,1))-light.location).to_track_quat('-Z','Y').to_euler()
    s.render.image_settings.file_format='PNG';s.render.filepath=str(OUT/'previews'/f'{slug}-v2.png')

def finish_asset(slug,arm,clips):
    arm.animation_data.action=clips[0];bpy.context.scene.frame_set(1)
    sourceParts=list(base.PARTS);mesh=export_mesh(arm,slug)
    original=count(mesh);export_selected(arm,mesh,OUT/'exports'/f'{slug}-source-v2.glb')
    lods=[]
    targets=[(4000,'mobile'),(2000,'lod1')] if slug=='relic-marshal' else [(700,'mobile'),(350,'lod1')]
    for target,suffix in targets:
        copy=mesh.copy();copy.data=mesh.data.copy();bpy.context.collection.objects.link(copy);copy.name=slug+'-'+suffix
        bpy.context.view_layer.objects.active=copy
        dec=copy.modifiers.new('Measured mobile reduction','DECIMATE');dec.ratio=(target-35)/original
        bpy.ops.object.modifier_move_up(modifier=dec.name);bpy.ops.object.modifier_apply(modifier=dec.name)
        copy.data.validate(clean_customdata=False);copy.data.update()
        export_selected(arm,copy,OUT/'exports'/f'{slug}-{suffix}-v2.glb')
        if suffix=='mobile':
            for clip in clips:
                arm.animation_data.action=clip;bpy.context.scene.frame_start=int(clip.frame_range[0]);bpy.context.scene.frame_end=int(clip.frame_range[1])
                bpy.ops.object.select_all(action='DESELECT');arm.select_set(True);copy.select_set(True)
                bpy.ops.export_scene.fbx(filepath=str(OUT/'exports'/f'{slug}-{clip.name.lower()}-v2.fbx'),use_selection=True,
                    object_types={'ARMATURE','MESH'},add_leaf_bones=False,bake_anim=True,bake_anim_use_all_actions=False,
                    bake_anim_use_nla_strips=False,axis_forward='-Y',axis_up='Z',apply_unit_scale=True)
        lods.append({'name':suffix,'triangles':count(copy),'target':target,'path':f'assets/exports/{slug}-{suffix}-v2.glb'})
        copy.hide_render=True;copy.hide_set(True)
    arm.animation_data.action=clips[0];bpy.context.scene.frame_start=1;bpy.context.scene.frame_end=60;bpy.context.scene.frame_set(1)
    mesh.hide_render=True;mesh.hide_set(True);studio(slug)
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'source'/f'{slug}-v2.blend'))
    bpy.ops.render.render(write_still=True)
    # Inspectable motion frames are retained independently of the GLB animation.
    s=bpy.context.scene;s.render.resolution_x=360;s.render.resolution_y=420;s.cycles.samples=8
    arm.animation_data.action=clips[1];s.frame_start=1;s.frame_end=30
    frames=OUT/'previews'/f'{slug}-{clips[1].name.lower()}-v2';frames.mkdir(exist_ok=True)
    for index,frame in enumerate(range(1,31,3)):
        s.frame_set(frame);s.render.filepath=str(frames/f'{index:02}.png');bpy.ops.render.render(write_still=True)
    arm.animation_data.action=clips[0];s.frame_start=1;s.frame_end=60;s.frame_set(1)
    s.render.resolution_x=960;s.render.resolution_y=1120;s.cycles.samples=32;s.render.filepath=str(OUT/'previews'/f'{slug}-v2.png')
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'source'/f'{slug}-v2.blend'))
    receipt={'id':slug,'version':2,'route':'original local Blender modeling','paidServicesUsed':False,'sourceTriangles':original,
        'editablePartCount':len(sourceParts),'boneCount':len(arm.data.bones),'clips':[a.name for a in clips],
        'bakedTextureSize':[1024,1024] if slug=='relic-marshal' else [512,512],'exportMaterials':1,'lods':lods,'source':f'assets/source/{slug}-v2.blend',
        'preview':f'assets/previews/{slug}-v2.png','productionAccepted':False,'androidValidated':False,
        'notes':'New detailed interpretation of authoritative concept. Awaiting visual review; engine and device validation pending.'}
    (OUT/'manifests'/f'{slug}-v2.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))

def tube(name,center,radius,inner,depth,mat,bone,sides=12):
    x,y,z=center;verts=[]
    for yy,rr in [(y-depth/2,radius),(y+depth/2,radius),(y-depth/2,inner),(y+depth/2,inner)]:
        for j in range(sides):
            a=j*math.tau/sides;verts.append((x+rr*math.cos(a),yy,z+rr*math.sin(a)))
    faces=[]
    for j in range(sides):
        k=(j+1)%sides
        faces += [(j,k,sides+k,sides+j),(2*sides+k,2*sides+j,3*sides+j,3*sides+k),
            (k,j,2*sides+j,2*sides+k),(sides+j,sides+k,3*sides+k,3*sides+j)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);return base.finish(o,name,mat,bone)

def belt_point(t):
    # Capsule in the Y/Z plane, traversed clockwise from the front top.
    r=.18;straight=.54;length=straight*2+math.tau*r;d=(t%1)*length
    if d<straight:return -.27+d,.40,0
    d-=straight
    if d<math.pi*r:
        a=math.pi/2-d/r;return .27+r*math.cos(a),.22+r*math.sin(a),a-math.pi/2
    d-=math.pi*r
    if d<straight:return .27-d,.04,-math.pi
    d-=straight;a=-math.pi/2-d/r
    return -.27+r*math.cos(a),.22+r*math.sin(a),a-math.pi/2

def machine_geometry(enemy=False):
    base.reset();material_detail();body='rust' if enemy else 'ivory'
    bones=[('root',(0,0,0),(0,0,.1),None),('body',(0,0,.24),(0,0,.65),'root'),
        ('turret',(0,0,.72),(0,0,.98),'body'),
        ('wheel.L',(-.46,0,.31),(-.56,0,.31),'root'),('wheel.R',(.46,0,.31),(.56,0,.31),'root')]
    if not enemy:
        hull('Rounded ceramic chassis',[(.15,.20,.19),(.23,.32,.25),(.48,.37,.29),(.62,.31,.25),(.71,.18,.16)],'ivory','body',20)
        visor=[(-.235,.06),(-.185,.09),(.185,.09),(.235,.055),(.218,-.065),(-.218,-.065)]
        inset('Recessed face visor',visor,-.284,.04,'dark','body',(0,.555),ratio=.91)
        for x in [-.095,.095]:
            base.cylinder('Vertical cyan eye',(x,-.305,.56),.017,.054,'light','Z','body',12)
            for z in [.533,.587]:base.sphere('Eye rounded end',(x,-.305,z),(.017,.012,.017),'light','body',10,5)
        inset('Shield chest plate',[(-.18,.14),(.18,.14),(.20,-.005),(0,-.23),(-.20,-.005)],-.292,.025,'teal','body',(0,.38),ratio=.9)
        base.box('Shield raised center ridge',(0,-.33,.37),(.023,.02,.32),'bronze',.004,'body')
        for sign in [-1,1]:
            inset('Side armored shoulder',[(-.11,.06),(.1,.1),(.12,-.055),(-.06,-.105)],-.218,.028,'teal','body',(sign*.27,.65))
            base.cylinder('Shoulder rivet',(sign*.27,-.26,.65),.023,.011,'bronze','Y','body',10)
    else:
        hull('Angular armored hull',[(.22,.29,.28),(.35,.35,.32),(.52,.33,.29),(.58,.25,.22)],'rust','body',8)
        inset('Crawler frontal armor',[(-.23,.11),(.23,.11),(.205,-.09),(0,-.15),(-.205,-.09)],-.339,.045,'rust','body',(0,.41),ratio=.87)
        for x in [-.14,.14]:base.cylinder('Hull bronze fastener',(x,-.386,.43),.024,.012,'bronze','Y','body',10)
        base.box('Dark rear chassis',(0,.22,.42),(.62,.2,.21),'dark',.04,'body')
    for sign,side in [(-1,'L'),(1,'R')]:
        wheel='wheel.'+side
        if not enemy:
            base.cylinder('Wheel bronze outer body '+side,(sign*.46,0,.31),.31,.23,'bronze','X',wheel,24)
            torus('Teal lacquer tire '+side,(sign*.46,0,.31),.266,.048,'teal',wheel,'X',sides=24)
            base.cylinder('Wheel dark inset '+side,(sign*.582,0,.31),.235,.014,'dark','X',wheel,20)
            torus('Outer bronze wheel rim '+side,(sign*.595,0,.31),.244,.013,'bronze',wheel,'X',sides=24)
            base.cylinder('Wheel central bronze hub '+side,(sign*.604,0,.31),.093,.07,'bronze','X',wheel,16)
            base.cylinder('Hub dark inset '+side,(sign*.645,0,.31),.058,.015,'dark','X',wheel,12)
            for j in range(8):
                a=j*math.tau/8
                base.cylinder('Wheel rim rivet '+side,(sign*.614,.263*math.cos(a),.31+.263*math.sin(a)),.018,.014,'bronze','X',wheel,8)
        else:
            base.box('Track undercarriage '+side,(sign*.46,0,.22),(.25,.88,.30),'dark',.09,'body')
            for y in [-.27,.27]:
                base.cylinder('Road wheel '+side,(sign*.582,y,.22),.163,.035,'bronze','X',wheel,16)
                base.cylinder('Road wheel core '+side,(sign*.606,y,.22),.109,.015,'rust','X',wheel,12)
                base.cylinder('Axle hub '+side,(sign*.619,y,.22),.052,.025,'bronze','X',wheel,12)
            for j in range(22):
                y,z,angle=belt_point(j/22);name=f'tread.{side}.{j:02}'
                bones.append((name,(sign*.46,y,z),(sign*.46+.04,y,z),'root'))
                tread=base.box('Articulated tread '+name,(sign*.46,y,z),(.27,.096,.036),'dark',.006,name)
                tread.rotation_euler.x=angle
                bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
    base.cylinder('Bronze slewing ring',(0,0,.714),.17,.057,'bronze','Z','turret',20)
    torus('Turret bearing top',(0,0,.744),.16,.009,'dark','turret',sides=20)
    if not enemy:
        hull('Crossbow turret armor',[(.755,.10,.14),(.86,.16,.18),(.97,.13,.155),(1.02,.055,.07)],'teal','turret',12)
        base.box('Crossbow ivory nose',(0,-.20,.86),(.17,.105,.18),'ivory',.025,'turret')
        base.box('Crossbow dark launch rail',(0,-.20,.94),(.048,.55,.047),'dark',.006,'turret')
        base.cylinder('Crossbow bronze rail',(0,-.275,.91),.017,.38,'bronze','Y','turret',12)
        bow=[(-.29,-.28,.92),(-.20,-.33,.90),(0,-.37,.90),(.20,-.33,.90),(.29,-.28,.92)]
        wire('Turret crossbow bronze bow',bow,.027,'bronze','turret')
        wire('Turret bowstring',[bow[0],(0,-.15,.945),bow[-1]],.005,'dark','turret')
        plate('Loaded bronze arrowhead',[(-.033,.02),(0,-.065),(.033,.02)],-.47,.045,'bronze','turret',(0,.94))
    else:
        hull('Faceted red turret',[(.65,.18,.20),(.72,.25,.27),(.86,.24,.25),(.91,.16,.19)],'rust','turret',8)
        plate('Dark menacing visor',[(-.15,.025),(.15,.025),(.17,-.045),(-.17,-.045)],-.257,.025,'dark','turret',(0,.84))
        for x in [-.095,.095]:base.box('Amber recessed eye',(x,-.285,.834),(.032,.015,.039),'amber',.006,'turret')
        tube('Hollow charcoal cannon',(0,-.43,.755),.111,.077,.42,'dark','turret',10)
        tube('Bronze octagonal muzzle',(0,-.65,.755),.137,.083,.085,'bronze','turret',10)
        base.cylinder('Cannon bore back',(0,-.229,.755),.078,.006,'dark','Y','turret',10)
        torus('Cannon bronze collar',(0,-.23,.755),.115,.017,'bronze','turret','Y',sides=16)
        for sign in [-1,1]:base.box('Turret flanking armor',(sign*.24,.035,.79),(.10,.31,.17),'rust',.025,'turret')
    return base.rig_parts(bones)

def machine_clips(arm,enemy=False):
    def idle(a,t):a.pose.bones['turret'].rotation_euler.y=math.sin(t*math.tau)*.10
    def roll(a,t):
        a.pose.bones['body'].location.y=math.sin(t*math.tau*2)*.008
        for side,sign in [('L',1),('R',-1)]:a.pose.bones['wheel.'+side].rotation_euler.y=sign*t*math.tau
        if enemy:
            for side,sign in [('L',-1),('R',1)]:
                for j in range(22):
                    pb=a.pose.bones[f'tread.{side}.{j:02}'];y0,z0,angle0=belt_point(j/22);y,z,angle=belt_point(j/22+t)
                    pb.location=arm.data.bones[pb.name].matrix_local.to_3x3().inverted() @ Vector((0,y-y0,z-z0))
                    # Keep local X/Y/Z rotation consistent with the world X axle.
                    pb.rotation_euler.y=angle-angle0
    def fire(a,t):a.pose.bones['turret'].location.z=-math.sin(t*math.pi)*.052
    return [base.action(arm,'Idle',60,idle),base.action(arm,'Roll',30,roll),base.action(arm,'Fire',24,fire)]

if __name__=='__main__':
    for d in ['source','exports','previews','manifests']:(OUT/d).mkdir(parents=True,exist_ok=True)
    only=sys.argv[sys.argv.index('--only')+1] if '--only' in sys.argv else 'all'
    if only in ('all','commander'):
        arm=marshal_geometry();finish_asset('relic-marshal',arm,clips_for(arm))
    if only in ('all','machines'):
        for enemy in [False,True]:
            arm=machine_geometry(enemy);finish_asset('rust-crawler' if enemy else 'gearling-sentinel',arm,machine_clips(arm,enemy))
