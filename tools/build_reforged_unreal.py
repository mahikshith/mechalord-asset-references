"""Author the separate Mechalord Reforged native art branch in Unreal 5.8.

Consumes only new geometric specifications. No legacy meshes, maps or materials
are imported. Re-runs replace our tagged actors, preserving untagged additions.
This constructs art/level scenes, not the yet-unported browser combat runtime.
"""
from pathlib import Path
import importlib
import json
import math
import sys
import traceback
import unreal as u

ROOT=Path(__file__).resolve().parents[1]
if str(ROOT/'tools') not in sys.path:
    sys.path.insert(0,str(ROOT/'tools'))
import reforged_geometry as geometry
import reforged_characters as characters
import reforged_enemies as enemies
import reforged_world as world
for module in (geometry,characters,enemies,world):
    importlib.reload(module)
BASE='/Game/MechalordReforged'
TAG='MechalordReforgedAuthored'
REPORT_PATH=ROOT/'builds/reforged-native-build.json'
A=u.AssetToolsHelpers.get_asset_tools()
EA=u.get_editor_subsystem(u.EditorAssetSubsystem)
ACT=u.get_editor_subsystem(u.EditorActorSubsystem)
LEVEL=u.get_editor_subsystem(u.LevelEditorSubsystem)
SME=u.get_editor_subsystem(u.StaticMeshEditorSubsystem)
REPORT={'status':'building','engine':u.SystemLibrary.get_engine_version(),
        'namespace':BASE,'importedMeshCount':0,'legacyAssetsUsed':[],
        'nativeGameplayConnected':False,'androidValidated':False,
        'assets':[],'maps':[],'warnings':[]}
MESHES={}
SPECS={}


def require(test,message):
    if not test:
        raise RuntimeError(message)


def v(values):
    return u.Vector(*values)


def xyz(value):
    return [float(value.x),float(value.y),float(value.z)]


def rot(values=(0,0,0)):
    return u.Rotator(pitch=values[0],yaw=values[1],roll=values[2])


def tf(p=(0,0,0),r=(0,0,0),scale=(1,1,1)):
    return u.Transform(location=v(p),rotation=rot(r),scale=v(scale))


def save(asset):
    require(EA.save_loaded_asset(asset,only_if_is_dirty=False),'Save failed: '+asset.get_path_name())
    return asset


def create(name,folder,klass,factory):
    path=folder+'/'+name
    if EA.does_asset_exist(path):
        asset=u.load_asset(path)
        require(isinstance(asset,klass),'Wrong type at '+path)
        return asset
    EA.make_directory(folder)
    asset=A.create_asset(name,folder,klass,factory)
    require(asset is not None,'Creation failed: '+path)
    return asset


def linear(hexcode):
    def channel(n):
        n=n/255
        return n/12.92 if n<=.04045 else ((n+.055)/1.055)**2.4
    return u.LinearColor(*[channel((hexcode>>s)&255) for s in (16,8,0)],1)


def materials():
    folder=BASE+'/Materials'
    REPORT['materialSearch']=[str(p) for p in EA.list_assets(folder,recursive=True)] if EA.does_directory_exist(folder) else []
    parent=create('M_ReforgedEnamel',folder,u.Material,u.MaterialFactoryNew())
    # Rebuild only our authored material graph, never any existing game parent.
    u.MaterialEditingLibrary.delete_all_material_expressions(parent)
    def expr(klass,x,y,**props):
        e=u.MaterialEditingLibrary.create_material_expression(parent,klass,x,y)
        for name,value in props.items():
            e.set_editor_property(name,value)
        return e
    color=expr(u.MaterialExpressionVectorParameter,-700,0,parameter_name='Tint',default_value=u.LinearColor(.2,.2,.2,1))
    rough=expr(u.MaterialExpressionScalarParameter,-500,300,parameter_name='Roughness',default_value=.48)
    metal=expr(u.MaterialExpressionScalarParameter,-500,450,parameter_name='Metallic',default_value=.25)
    glow=expr(u.MaterialExpressionScalarParameter,-500,600,parameter_name='Emission',default_value=.16)
    noise=expr(u.MaterialExpressionNoise,-700,180,scale=.11,levels=2,output_min=.84,output_max=1.0)
    paint=expr(u.MaterialExpressionMultiply,-270,0)
    emission=expr(u.MaterialExpressionMultiply,-50,160)
    lib=u.MaterialEditingLibrary
    for source,output,dest,input_name in [(color,'',paint,'A'),(noise,'',paint,'B'),(paint,'',emission,'A'),(glow,'',emission,'B')]:
        require(lib.connect_material_expressions(source,output,dest,input_name),'Material connection failed')
    for node,prop in [(paint,u.MaterialProperty.MP_BASE_COLOR),(rough,u.MaterialProperty.MP_ROUGHNESS),(metal,u.MaterialProperty.MP_METALLIC),(emission,u.MaterialProperty.MP_EMISSIVE_COLOR)]:
        require(lib.connect_material_property(node,'',prop),'Material output failed')
    lib.recompile_material(parent)
    save(parent)
    palette={'ivory':(0xDED9BF,.42,.15,.16),'teal':(0x186E78,.38,.28,.16),
             'bronze':(0xA97E45,.34,.62,.18),'dark':(0x202D38,.56,.3,.2),
             'steel':(0x627D86,.4,.46,.14),'red':(0xA32E34,.4,.3,.18),
             'rust':(0x8A4536,.53,.28,.18),'rubber':(0x131B22,.78,.02,.12),
             'cyan':(0x40DDEE,.32,.12,2.3),'amber':(0xFFAD32,.36,.1,2.1),
             'redglow':(0xFF4630,.3,.1,2.1)}
    result={}
    for name,(color_hex,r,m,e) in palette.items():
        inst=create('MI_'+name,folder,u.MaterialInstanceConstant,u.MaterialInstanceConstantFactoryNew())
        lib.set_material_instance_parent(inst,parent)
        lib.set_material_instance_vector_parameter_value(inst,'Tint',linear(color_hex))
        for parameter,value in [('Roughness',r),('Metallic',m),('Emission',e)]:
            lib.set_material_instance_scalar_parameter_value(inst,parameter,value)
        result[name]=save(inst)
    return result


def build_part(asset,part,paints):
    dynamic=u.DynamicMesh()
    palette=list(dict.fromkeys(s['mat'] for s in part['shapes']))
    triangles=0
    for shape in part['shapes']:
        triangles+=geometry.validate_surface(shape)
        vertices,faces=geometry.mesh_for(shape)
        t=tf(shape['p'],shape.get('r',(0,0,0)))
        coords=[u.MathLibrary.transform_location(t,v(point))-v(part['pivot']) for point in vertices]
        buffers=u.GeometryScriptSimpleMeshBuffers()
        buffers.set_editor_property('vertices',coords)
        buffers.set_editor_property('triangles',[u.IntVector(*f) for f in faces])
        buffers.set_editor_property('uv0',[u.Vector2D(point[0]/100,point[1]/100) for point in vertices])
        u.GeometryScript_MeshEdits.append_buffers_to_mesh(dynamic,buffers,material_id=palette.index(shape['mat']))
    split=u.GeometryScriptSplitNormalsOptions()
    split.set_editor_property('split_by_opening_angle',True)
    split.set_editor_property('opening_angle_deg',42)
    split.set_editor_property('split_by_face_group',False)
    u.GeometryScript_Normals.compute_split_normals(dynamic,split,u.GeometryScriptCalculateNormalsOptions())
    folder=BASE+'/Meshes/'+asset['name']
    EA.make_directory(folder)
    path=folder+'/SM_'+asset['name']+'_'+part['id']
    if EA.does_asset_exist(path):
        mesh=u.load_asset(path)
        result=u.GeometryScript_AssetUtils.copy_mesh_to_static_mesh(dynamic,mesh,u.GeometryScriptCopyMeshToAssetOptions(),u.GeometryScriptMeshWriteLOD())
        require(not isinstance(result,tuple) or result[-1]==u.GeometryScriptOutcomePins.SUCCESS,'Mesh update failed: '+path)
        SME.remove_collisions(mesh)
    else:
        options=u.GeometryScriptCreateNewStaticMeshAssetOptions()
        options.set_editor_property('enable_nanite',False)
        options.set_editor_property('enable_collision',True)
        options.set_editor_property('enable_recompute_normals',False)
        result=u.GeometryScript_NewAssetUtils.create_new_static_mesh_asset_from_mesh(dynamic,path,options)
        mesh=result[0] if isinstance(result,tuple) else result
    require(isinstance(mesh,u.StaticMesh),'Native mesh creation failed: '+path)
    mesh.set_editor_property('static_materials',[u.StaticMaterial(material_interface=paints[name],material_slot_name=name) for name in palette])
    SME.add_simple_collisions(mesh,u.ScriptCollisionShapeType.BOX)
    save(mesh)
    measured=mesh.get_num_triangles(0)
    require(measured==triangles,f'Native topology changed {path}: {measured} vs {triangles}')
    bounds=mesh.get_bounding_box()
    MESHES[(asset['name'],part['id'])]=mesh
    return {'part':part['id'],'parent':part['parent'],'pivotCm':part['pivot'],
            'path':path,'triangles':measured,'materialSlots':palette,
            'localBoundsMin':xyz(bounds.min),'localBoundsMax':xyz(bounds.max),
            'simpleCollisionCount':SME.get_simple_collision_count(mesh)}


def tag(actor,label,folder):
    actor.set_actor_label(label)
    actor.set_folder_path(folder)
    actor.set_editor_property('tags',[u.Name(TAG)])
    return actor


def spawn_assembly(placement):
    name=placement['asset']; spec=SPECS[name]
    transform=tf(placement['p'],placement.get('r',(0,0,0)),placement.get('scale',(1,1,1)))
    actors={}
    for part in spec['parts']:
        position=u.MathLibrary.transform_location(transform,v(part['pivot']))
        actor=tag(ACT.spawn_actor_from_class(u.StaticMeshActor,position,rot(placement.get('r',(0,0,0)))),
                  placement['label']+'__'+part['id'],spec.get('category','Art')+'/'+placement['label'])
        component=actor.static_mesh_component
        component.set_mobility(u.ComponentMobility.MOVABLE)
        require(component.set_static_mesh(MESHES[(name,part['id'])]),'Cannot assign part mesh')
        actor.set_actor_scale3d(v(placement.get('scale',(1,1,1))))
        # Collision remains an explicit blocker; not transparent decorative bodies.
        component.set_collision_profile_name('BlockAllDynamic')
        actors[part['id']]=actor
    for part in spec['parts']:
        if part['parent']:
            require(actors[part['id']].attach_to_actor(actors[part['parent']],u.Name('None'),u.AttachmentRule.KEEP_WORLD,
                     u.AttachmentRule.KEEP_WORLD,u.AttachmentRule.KEEP_WORLD,False),'Joint attachment failed')
    return actors


def exposure(component):
    settings=component.get_editor_property('post_process_settings')
    for name,value in [('override_auto_exposure_min_brightness',True),('override_auto_exposure_max_brightness',True),
                       ('auto_exposure_min_brightness',1.0),('auto_exposure_max_brightness',1.0),
                       ('override_auto_exposure_bias',True),('auto_exposure_bias',0.0),
                       ('override_bloom_intensity',True),('bloom_intensity',.15),
                       ('override_vignette_intensity',True),('vignette_intensity',.18)]:
        settings.set_editor_property(name,value)
    component.set_editor_property('post_process_settings',settings)
    component.set_editor_property('post_process_blend_weight',1.0)


def lighting():
    for label,angles,color,intensity,priority in [('Key',(-55,-55,0),(.8,.9,1,1),3.4,1),('WarmRim',(-24,130,0),(1,.60,.3,1),1.4,0)]:
        light=tag(ACT.spawn_actor_from_class(u.DirectionalLight,v((0,0,1200)),rot(angles)),label,'Lighting')
        light.light_component.set_intensity(intensity)
        light.light_component.set_light_color(u.LinearColor(*color))
        light.light_component.set_editor_property('forward_shading_priority',priority)
        light.light_component.set_mobility(u.ComponentMobility.MOVABLE)
    volume=tag(ACT.spawn_actor_from_class(u.PostProcessVolume,v((0,0,0))),'ReforgedExposure','Lighting')
    volume.set_editor_property('unbound',True)
    settings=volume.get_editor_property('settings')
    for name,value in [('override_auto_exposure_min_brightness',True),('override_auto_exposure_max_brightness',True),('auto_exposure_min_brightness',1.0),('auto_exposure_max_brightness',1.0),('override_auto_exposure_bias',True),('auto_exposure_bias',0.0)]:
        settings.set_editor_property(name,value)
    volume.set_editor_property('settings',settings)


def make_camera(spec):
    actor=tag(ACT.spawn_actor_from_class(u.CameraActor,v(spec['p'])),spec['name'],'Cameras')
    actor.set_actor_rotation(u.MathLibrary.find_look_at_rotation(v(spec['p']),v(spec['target'])),False)
    c=actor.get_component_by_class(u.CameraComponent)
    c.set_editor_property('aspect_ratio',spec.get('aspect',9/16))
    c.set_editor_property('constrain_aspect_ratio',True)
    c.set_editor_property('field_of_view',spec['fov'])
    exposure(c)
    return actor


def animate(level_spec,assemblies):
    import reforged_motion
    importlib.reload(reforged_motion)
    folder=BASE+'/Animation'
    sequence=create('LS_'+level_spec['name'],folder,u.LevelSequence,u.LevelSequenceFactoryNew())
    for binding in list(sequence.get_bindings()):
        binding.remove()
    sequence.set_display_rate(u.FrameRate(30,1))
    sequence.set_playback_start(0); sequence.set_playback_end(240)
    count=0
    for placement,actors in assemblies:
        for part_id,actor in actors.items():
            motion=reforged_motion.get_motion(placement['asset'],part_id)
            if not motion:
                continue
            binding=sequence.add_possessable(actor)
            binding.set_display_name(u.Text(actor.get_actor_label()))
            section=binding.add_track(u.MovieScene3DTransformTrack).add_section()
            section.set_range(0,241)
            section.set_completion_mode(u.MovieSceneCompletionMode.RESTORE_STATE)
            channels={str(c.get_editor_property('channel_name')):c for c in section.get_all_channels()}
            root=actor.root_component
            l=root.get_editor_property('relative_location')
            r=root.get_editor_property('relative_rotation')
            s=root.get_editor_property('relative_scale3d')
            values=[l.x,l.y,l.z,r.roll,r.pitch,r.yaw,s.x,s.y,s.z]
            names=['Location.X','Location.Y','Location.Z','Rotation.X','Rotation.Y','Rotation.Z','Scale.X','Scale.Y','Scale.Z']
            defaults=dict(zip(names,values))
            for name,value in defaults.items():
                channels[name].set_default(float(value))
            for name,keys in motion.items():
                for frame,offset in keys:
                    channels[name].add_key(u.FrameNumber(frame),float(defaults[name]+offset),interpolation=u.MovieSceneKeyInterpolation.LINEAR)
            count+=1
    save(sequence)
    actor=tag(ACT.spawn_actor_from_class(u.LevelSequenceActor,v((0,0,0))),'MechanicalPreview','Animation')
    actor.set_sequence(sequence)
    settings=actor.get_editor_property('playback_settings')
    settings.set_editor_property('auto_play',True)
    settings.set_editor_property('loop_count',u.MovieSceneSequenceLoopCount(value=-1))
    actor.set_editor_property('playback_settings',settings)
    return {'path':sequence.get_path_name(),'bindings':count,'previewOnly':True,'frames':240}


def build_level(spec):
    path=BASE+'/Maps/L_'+spec['name']
    LEVEL.eject_pilot_level_actor()
    if EA.does_asset_exist(path):
        require(LEVEL.load_level(path),'Load failed: '+path)
        require(LEVEL.save_current_level(),'Save before rebuild failed')
        for actor in list(ACT.get_all_level_actors()):
            if u.Name(TAG) in actor.tags:
                ACT.destroy_actor(actor)
    else:
        EA.make_directory(BASE+'/Maps')
        require(LEVEL.new_level(path),'New level failed: '+path)
    assemblies=[]
    for placement in spec['placements']:
        assemblies.append((placement,spawn_assembly(placement)))
    lighting()
    cameras=[make_camera(camera) for camera in spec['cameras']]
    animation=animate(spec,assemblies)
    require(LEVEL.save_current_level(),'Map save failed: '+path)
    if cameras:
        LEVEL.pilot_level_actor(cameras[0])
    report={'path':path,'label':spec['label'],'description':spec['description'],
            'placementCount':len(spec['placements']),'actorCount':len(ACT.get_all_level_actors()),
            'cameras':spec['cameras'],'animation':animation}
    REPORT['maps'].append(report)
    REPORT_PATH.write_text(json.dumps(REPORT,indent=2),encoding='utf-8')


def gallery():
    assets=['RelicMarshal','GearlingSentinel','RustCrawler','ArcWarden','ForgeColossus','RelicLauncher']
    positions=[(-750,0,0),(-350,0,0),(0,0,0),(400,0,0),(950,200,0),(0,600,0)]
    placements=[{'asset':name,'label':name,'p':p,'r':[0,0,0]} for name,p in zip(assets,positions) if name in SPECS]
    cameras=[{'name':'NewRoster','p':[1300,-2400,1100],'target':[160,30,200],'fov':48,'aspect':16/9}]
    for entry in placements:
        name=entry['asset']; x,y,z=entry['p']; h=SPECS[name]['height_cm']
        cameras.append({'name':'Inspect_'+name,'p':[x+h*.85,y-h*2.55,z+h*.90],
                        'target':[x,y,z+h*.5],'fov':35,'aspect':.8})
    for index,(name,p) in enumerate(zip(assets,positions)):
        radius=1.6 if name=='ForgeColossus' else .8
        placements.append({'asset':'AtelierPlinth','label':'Plinth_'+str(index),'p':p,'scale':[radius,radius,1]})
    return {'name':'ReforgedAtelier','label':'Reforged — original asset atelier',
            'description':'New meshes, pivoted rigid assemblies and motion previews. No legacy models.',
            'placements':placements,'cameras':cameras}


def run():
    current=LEVEL.get_current_level()
    if current and str(current.get_outer().get_path_name()).startswith('/Game/'):
        require(LEVEL.save_current_level(),'Existing work could not be saved')
    plinth={'name':'AtelierPlinth','label':'Octagonal inspection plinth','category':'studio','height_cm':24,
            'parts':[{'id':'Base','parent':None,'pivot':[0,0,0],'shapes':[
                {'type':'loft','mat':'dark','p':[0,0,0],'segments':8,'rings':[[-24,160,160,0,0],[-18,180,180,0,0],[-3,180,180,0,0],[0,175,175,0,0]]},
                {'type':'tube','mat':'bronze','p':[0,0,-7],'outer':182,'inner':177,'length':4,'segments':8}]}]}
    assets=characters.get_assets()+enemies.get_assets()+world.get_assets()+[plinth]
    require(len({a['name'] for a in assets})==len(assets),'Duplicate asset names')
    paints=materials()
    for asset in assets:
        SPECS[asset['name']]=asset
        parts=[build_part(asset,part,paints) for part in asset['parts']]
        entry={'name':asset['name'],'label':asset['label'],'parts':parts,
               'triangles':sum(part['triangles'] for part in parts),'source':'new procedural surface specification'}
        REPORT['assets'].append(entry)
        REPORT_PATH.write_text(json.dumps(REPORT,indent=2),encoding='utf-8')
        u.log('Reforged built '+asset['name']+' '+str(entry['triangles'])+' triangles')
    build_level(gallery())
    for spec in world.get_levels():
        build_level(spec)
    require(LEVEL.load_level(BASE+'/Maps/L_SkyforgeViaduct'),'Cannot open first new level')
    actors={a.get_actor_label():a for a in ACT.get_all_level_actors()}
    camera=actors[world.get_levels()[0]['cameras'][0]['name']]
    LEVEL.pilot_level_actor(camera)
    REPORT['status']='authored'
    REPORT['visualApproval']='pending rendered review'
    REPORT_PATH.write_text(json.dumps(REPORT,indent=2),encoding='utf-8')


try:
    run()
except Exception:
    REPORT['status']='failed'
    REPORT['error']=traceback.format_exc()
    REPORT_PATH.write_text(json.dumps(REPORT,indent=2),encoding='utf-8')
    u.log_error(REPORT['error'])
    raise
