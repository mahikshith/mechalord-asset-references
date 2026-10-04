"""Preserve the supplied textured geometry and derive measured static mobile LODs."""
import bpy, json, math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets/originals/sample-huggingface.glb'))
obj=next(o for o in bpy.context.scene.objects if o.type=='MESH')
obj.name='RelicMarshal_HF_Source'
bpy.context.view_layer.objects.active=obj
bpy.ops.object.select_all(action='DESELECT');obj.select_set(True)
# Reviewed imported asset faces +X. Standard working orientation is -Y, Z up.
obj.rotation_mode='XYZ'
obj.rotation_euler.z=-math.pi/2
bpy.context.view_layer.update()
bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
coords=[obj.matrix_world@v.co for v in obj.data.vertices]
lo=Vector([min(v[i] for v in coords) for i in range(3)])
hi=Vector([max(v[i] for v in coords) for i in range(3)])
scale=1.9/(hi.z-lo.z)
for v in obj.data.vertices:
 v.co=(v.co-Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z)))*scale
obj.location=(0,0,0)
for poly in obj.data.polygons:poly.use_smooth=True
obj.data.update()
image=next(im for im in bpy.data.images if im.size[0])
image.filepath_raw=str(ROOT/'assets/textures/relic-marshal-hf-basecolor.png')
image.file_format='PNG';image.save();image.pack()
def tris(o):
 o.data.calc_loop_triangles();return len(o.data.loop_triangles)
def select(o):
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
def export(o,name):
 select(o)
 glb=ROOT/f'assets/exports/{name}.glb'
 bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',use_selection=True,export_animations=False)
 bpy.ops.export_scene.fbx(filepath=str(ROOT/f'assets/exports/{name}.fbx'),
  use_selection=True,object_types={'MESH'},bake_anim=False,axis_forward='-Y',axis_up='Z',
  path_mode='COPY',embed_textures=True)
 return {'triangles':tris(o),'glb':str(glb.relative_to(ROOT)),
  'glbBytes':glb.stat().st_size,'materials':len(o.data.materials)}
models=[obj]
receipts={'source':export(obj,'relic-marshal-hf-source')}
for name,target in [('mobile',4000),('lod1',2000)]:
 o=obj.copy();o.data=obj.data.copy();bpy.context.collection.objects.link(o)
 o.name='RelicMarshal_HF_'+name
 select(o);d=o.modifiers.new('Measured mobile reduction','DECIMATE')
 d.ratio=(target-20)/tris(obj);d.use_collapse_triangulate=True
 bpy.ops.object.modifier_apply(modifier=d.name)
 o.data.validate(clean_customdata=False);o.data.update()
 receipts[name]=export(o,'relic-marshal-hf-'+name);models.append(o)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24
scene.render.resolution_x=720;scene.render.resolution_y=840
scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Studio');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.19,.21,.24,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.65
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.018))
floor=bpy.context.object;floor.name='PreviewGround'
mat=bpy.data.materials.new('Preview ground');mat.diffuse_color=(.2,.22,.25,1)
floor.data.materials.append(mat)
center=Vector((0,0,.94))
for xyz,energy in [((3,-4,5),650),((-3,-1,3),400),((1,3,4),650)]:
 bpy.ops.object.light_add(type='AREA',location=xyz)
 light=bpy.context.object;light.data.energy=energy;light.data.size=4
 light.rotation_euler=(center-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(3,-6,2.9))
cam=bpy.context.object;scene.camera=cam
cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.type='ORTHO';cam.data.ortho_scale=2.45
for model in models:
 for o in models:o.hide_render=o!=model;o.hide_set(o!=model)
 scene.render.filepath=str(ROOT/f'assets/previews/{model.name.lower()}.png')
 bpy.ops.render.render(write_still=True)
for o in models:o.hide_render=o!=obj;o.hide_set(o!=obj)
select(obj)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/source/relic-marshal-hf.blend'))
receipts.update({'original':'assets/originals/sample-huggingface.glb',
 'heightMeters':1.9,'forwardAxis':'-Y','upAxis':'Z','groundPivot':True,
 'baseColorTexture':[1024,1024],'rigged':False,'animations':[],
 'productionAccepted':False,'androidValidated':False,
 'notes':'Faithful user-supplied reconstruction; static source and decimated candidates. Rigging, deformation and engine/device checks pending.'})
(ROOT/'assets/manifests/relic-marshal-hf.json').write_text(json.dumps(receipts,indent=2))
print(json.dumps(receipts))
