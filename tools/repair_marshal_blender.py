"""Repair the preserved TRELLIS commander and paint from its original reference.

Blender-only, separate editable source and GLB. Reference projection is an
art treatment of the visible side, not an inferred full PBR texture set.
"""
import bpy, bmesh, math, json, time, hashlib
from pathlib import Path
from mathutils import Vector, Matrix
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
RAW=ROOT/'assets/experiments/trellis-local/relic-marshal-vulkan-quality12.glb'
IMAGE=ROOT/'assets/experiments/trellis-local/relic-marshal-cpu-smoke_cutout.png'
OUT=ROOT/'assets/source/relic-marshal-repaired-v2'
EXPORT=ROOT/'assets/exports/relic-marshal-repaired-v2.glb'
PREVIEW=ROOT/'assets/previews/relic-marshal-repaired-v2'
REPORT=ROOT/'assets/manifests/relic-marshal-repaired-v2.json'
for p in (OUT,EXPORT.parent,PREVIEW,REPORT.parent):p.mkdir(parents=True,exist_ok=True)
started=time.time()
def log(msg):print(msg,flush=True)
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for block in iter(lambda:f.read(4*1024*1024),b''):h.update(block)
 return h.hexdigest()
source_hash=sha(RAW)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system='METRIC'
bpy.ops.wm.ply_import(filepath=str(OUT/'closed-surface.ply'))
obj=next(o for o in bpy.context.scene.objects if o.type=='MESH')
bpy.context.view_layer.objects.active=obj
bpy.ops.object.select_all(action='DESELECT');obj.select_set(True)
bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
verts=np.empty(len(obj.data.vertices)*3,dtype=np.float32);obj.data.vertices.foreach_get('co',verts);verts=verts.reshape(-1,3)
lo=verts.min(0);hi=verts.max(0);scale=2/(hi[2]-lo[2]);origin=Vector(((lo[0]+hi[0])/2,(lo[1]+hi[1])/2,lo[2]))
obj.data.transform(Matrix.Scale(float(scale),4)@Matrix.Translation(-origin));del verts
obj.name='Relic_Marshal_Repaired';obj.data.name='Closed_Rebuilt_Surface'
log('Imported and normalized preserved raw model to 2 metres; starting voxel surface reconstruction')
# A volumetric reconstruction replaces invalid overlapping triangles and closes
# open contours. The raw source is untouched. Small mechanical gaps can soften.
obj.data.remesh_voxel_size=.005
obj.data.remesh_voxel_adaptivity=0
obj.data.use_remesh_preserve_volume=True
bpy.ops.object.voxel_remesh()
log('Voxel reconstruction complete: '+str(len(obj.data.polygons))+' faces')
smooth=obj.modifiers.new('Remove small reconstruction ripples','SMOOTH');smooth.factor=.65;smooth.iterations=4
bpy.ops.object.modifier_apply(modifier=smooth.name)
obj.data.calc_loop_triangles();reconstructed_triangles=len(obj.data.loop_triangles)
if reconstructed_triangles>140000:
 dec=obj.modifiers.new('Review mesh budget','DECIMATE');dec.ratio=140000/reconstructed_triangles;dec.use_collapse_triangulate=True
 bpy.ops.object.modifier_apply(modifier=dec.name)
mesh=obj.data
mesh.validate(verbose=True,clean_customdata=True);mesh.update(calc_edges=True)
for poly in mesh.polygons:poly.use_smooth=True
mesh.calc_loop_triangles()
log('Clean review mesh: '+str(len(mesh.loop_triangles))+' triangles; painting reference colors')
coords=np.empty(len(mesh.vertices)*3,dtype=np.float32);mesh.vertices.foreach_get('co',coords);coords=coords.reshape(-1,3)
normals=np.empty_like(coords);mesh.vertices.foreach_get('normal',normals.reshape(-1))
ref=bpy.data.images.load(str(IMAGE),check_existing=True);ref.name='Approved_Commander_Reference';ref.use_fake_user=True;ref.pack()
w,h=ref.size;pixels=np.empty(w*h*4,dtype=np.float32);ref.pixels.foreach_get(pixels);pixels=pixels.reshape(h,w,4)
occupied=np.argwhere(pixels[:,:,3]>.5);bottom,left=occupied.min(0);top,right=occupied.max(0)
# TRELLIS uses +X front in this Blender import. The original camera image is
# projected onto the matching Y/Z silhouette. Hidden sides get a painted palette.
mn=coords.min(0);mx=coords.max(0)
u=(coords[:,1]-mn[1])/(mx[1]-mn[1]);v=(coords[:,2]-mn[2])/(mx[2]-mn[2])
ix=np.clip(np.rint(left+u*(right-left)).astype(int),0,w-1)
iy=np.clip(np.rint(bottom+v*(top-bottom)).astype(int),0,h-1)
sample=pixels[iy,ix].copy()
ivory=np.array([.67,.57,.40]);bronze=np.array([.32,.20,.075]);teal=np.array([.018,.19,.20]);dark=np.array([.032,.04,.043])
base=np.tile(ivory,(len(coords),1))
# Consistent rear-side art, without projecting a second face onto the back.
z=coords[:,2];side=np.abs(coords[:,1]);depth=coords[:,0]
joints=((z>.22)&(z<.32))|((z>.61)&(z<.70))|((z>1.01)&(z<1.10))|((z>1.63)&(z<1.72))
base[joints]=dark
stripe=(side<.095)&(z>.80)&(z<1.65);base[stripe]=teal
base[(side>.095)&(side<.12)&(z>.80)&(z<1.65)]=bronze
edge=(z<.075)|((z>1.78)&(side<.042));base[edge]=bronze
# Blend the reference over front-facing surfaces; avoid its transparent border.
blend=np.clip((normals[:,0]+.25)/.65,0,1)*sample[:,3]
sample[:,:3]=np.clip(sample[:,:3]*1.08,0,1)
paint=base*(1-blend[:,None])+sample[:,:3]*blend[:,None]
rgba=np.ones((len(coords),4),dtype=np.float32);rgba[:,:3]=paint
attr=mesh.color_attributes.new(name='ReferencePaint',type='FLOAT_COLOR',domain='POINT');attr.data.foreach_set('color',rgba.reshape(-1));mesh.color_attributes.active_color=attr
def material(name,metal,rough,glow=False):
 mat=bpy.data.materials.new(name);mat.use_nodes=True
 bs=mat.node_tree.nodes.get('Principled BSDF');vc=mat.node_tree.nodes.new('ShaderNodeVertexColor');vc.layer_name='ReferencePaint'
 mat.node_tree.links.new(vc.outputs['Color'],bs.inputs['Base Color']);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
 if glow:
  bs.inputs['Emission Color'].default_value=(.015,.55,.65,1);bs.inputs['Emission Strength'].default_value=.7
 mat.diffuse_color=(*ivory,1)
 return mat
mesh.materials.clear()
for m in [material('Ivory painted armor',.18,.46),material('Bronze alloy details',.68,.36),material('Dark mechanical joints',.55,.53),material('Teal relic accents',.32,.31,True)]:mesh.materials.append(m)
for poly in mesh.polygons:
 rgb=paint[list(poly.vertices)].mean(0);r,g,b=rgb
 poly.material_index=3 if g>r*1.5 and b>r*1.4 and g>.11 else 2 if max(rgb)<.13 else 1 if r>g*1.3 and g>b*1.35 else 0
bm=bmesh.new();bm.from_mesh(mesh)
metrics={'vertices':len(mesh.vertices),'triangles':len(mesh.loop_triangles),'boundaryEdges':sum(e.is_boundary for e in bm.edges),'nonManifoldEdges':sum(not e.is_manifold for e in bm.edges),'materials':len(mesh.materials)};bm.free()
# Native editable project retains the packed reference and working color layer.
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'relic-marshal-repaired-v2.blend'))
bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
bpy.ops.export_scene.gltf(filepath=str(EXPORT),export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_materials='EXPORT',export_attributes=True)
log('Exported repaired and colored model; rendering actual geometry')
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=20;scene.cycles.use_denoising=True
scene.render.threads_mode='FIXED';scene.render.threads=4;scene.render.resolution_x=850;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Studio');scene.world.color=(.10,.12,.15)
scene.view_settings.view_transform='AgX';scene.view_settings.exposure=0
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.012));floor=bpy.context.object
fm=bpy.data.materials.new('Slate studio');fm.use_nodes=True;fm.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.09,.105,.12,1);fm.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.82;floor.data.materials.append(fm)
target=Vector((0,0,1.02))
def aim(o):o.rotation_euler=(target-o.location).to_track_quat('-Z','Y').to_euler()
for name,loc,power,size in [('Key',(3,-3,4),420,4),('Fill',(2,4,2.8),300,3),('Rim',(-3,1,4),650,3)]:
 light=bpy.data.lights.new(name,'AREA');light.energy=power;light.shape='DISK';light.size=size;o=bpy.data.objects.new(name,light);scene.collection.objects.link(o);o.location=loc;aim(o)
camera=bpy.data.cameras.new('Review Camera');cam=bpy.data.objects.new('Review Camera',camera);scene.collection.objects.link(cam);scene.camera=cam;camera.type='ORTHO';camera.ortho_scale=2.43
outputs=[]
for name,position in [('front',(5,-1.0,2.10)),('back',(-4,2,2.3))]:
 cam.location=position;aim(cam);path=PREVIEW/(name+'.png');scene.render.filepath=str(path);bpy.ops.render.render(write_still=True);outputs.append(str(path))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'relic-marshal-repaired-v2.blend'))
report={'source':str(RAW),'sourceSha256':source_hash,'sourceUnchanged':sha(RAW)==source_hash,'reference':str(IMAGE),'referenceSha256':sha(IMAGE),'workflow':'Blender volumetric surface rebuild, smoothing, decimation, front reference projection to vertex paint and authored hidden-side palette','voxelMetres':.005,'reconstructedTriangles':reconstructed_triangles,**metrics,'export':str(EXPORT),'exportBytes':EXPORT.stat().st_size,'exportSha256':sha(EXPORT),'renders':outputs,'durationSeconds':round(time.time()-started,1),'rigged':False,'mobileProductionReady':False,'limitations':['Some narrow gaps and small fingers may soften during volume reconstruction.','Front paint includes lighting present in the source image; this is not a full physically based texture reconstruction.','Rear colors are authored; one image does not establish hidden details.','Not yet reduced to the 4,000-triangle mobile target or rigged.']}
REPORT.write_text(json.dumps(report,indent=2),encoding='utf-8');log(json.dumps(report))
