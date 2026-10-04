"""Inspect user-supplied GLB without executing asset metadata or altering its original."""
import bpy, json, math, hashlib
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets/originals/sample-huggingface.glb'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(SRC))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
vertices=[o.matrix_world @ v.co for o in meshes for v in o.data.vertices]
lo=Vector([min(v[i] for v in vertices) for i in range(3)])
hi=Vector([max(v[i] for v in vertices) for i in range(3)])
raw=list(hi-lo)
# Keep imported mesh coordinates in the inspection source; camera fits bounds.
center=(hi+lo)/2
size=max(raw)
for o in meshes:o.data.calc_loop_triangles()
report={'source':'assets/originals/sample-huggingface.glb',
 'sha256':hashlib.sha256(SRC.read_bytes()).hexdigest(),
 'triangles':sum(len(o.data.loop_triangles) for o in meshes),
 'vertices':sum(len(o.data.vertices) for o in meshes),
 'meshObjects':len(meshes),'materials':len(bpy.data.materials),
 'textures':[{'name':im.name,'width':im.size[0],'height':im.size[1]} for im in bpy.data.images],
 'dimensionsRaw':raw,'armatures':sum(o.type=='ARMATURE' for o in bpy.context.scene.objects),
 'animations':len(bpy.data.actions),'provenance':'User-supplied GLB; exact Hugging Face Space not yet identified',
 'productionAccepted':False,'androidValidated':False}
(ROOT/'assets/manifests/sample-inspection.json').write_text(json.dumps(report,indent=2))
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=16
scene.render.resolution_x=640;scene.render.resolution_y=720
scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
scene.world=bpy.data.worlds.new('Review studio');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.17,.19,.22,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.65
for xyz,energy in [((2,-3,4),450),((-3,-1,2),300),((1,3,3),500)]:
 bpy.ops.object.light_add(type='AREA',location=center+Vector(xyz)*size)
 light=bpy.context.object;light.data.energy=energy*size*size
 light.data.shape='DISK';light.data.size=2*size
 light.rotation_euler=(center-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add()
camera=bpy.context.object;scene.camera=camera
camera.data.type='ORTHO';camera.data.ortho_scale=size*1.35
for name,xyz in [('front',(0,-4,.3)),('quarter',(2,-4,1.5)),('back',(0,4,.3)),('side',(4,0,.3))]:
 camera.location=center+Vector(xyz)*size
 camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler()
 scene.render.filepath=str(ROOT/f'assets/previews/sample-{name}.png')
 bpy.ops.render.render(write_still=True)
for image in bpy.data.images:
 if image.name not in ('Render Result','Viewer Node'):image.pack()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/source/sample-inspection.blend'))
print(json.dumps(report))
