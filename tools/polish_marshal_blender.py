"""Final review pass: smooth repaired armor, align reference paint, restore relic/visor."""
import bpy,bmesh,numpy as np,math,json,time,hashlib
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];started=time.time()
BASE=ROOT/'assets/source/relic-marshal-repaired-v2/relic-marshal-repaired-v2.blend'
OUT=ROOT/'assets/source/relic-marshal-repaired-v3';OUT.mkdir(parents=True,exist_ok=True)
PREVIEW=ROOT/'assets/previews/relic-marshal-repaired-v3';PREVIEW.mkdir(parents=True,exist_ok=True)
EXPORT=ROOT/'assets/exports/relic-marshal-repaired-v3.glb'
bpy.ops.wm.open_mainfile(filepath=str(BASE))
obj=bpy.data.objects['Relic_Marshal_Repaired'];bpy.context.view_layer.objects.active=obj
bpy.ops.object.select_all(action='DESELECT');obj.select_set(True)
smooth=obj.modifiers.new('Refine armor surface','SMOOTH');smooth.factor=.8;smooth.iterations=24
bpy.ops.object.modifier_apply(modifier=smooth.name);obj.data.validate(clean_customdata=True);obj.data.update()
mesh=obj.data
coords=np.empty(len(mesh.vertices)*3,dtype=np.float32);mesh.vertices.foreach_get('co',coords);coords=coords.reshape(-1,3)
normals=np.empty_like(coords);mesh.vertices.foreach_get('normal',normals.reshape(-1))
ref=bpy.data.images.get('Approved_Commander_Reference') or bpy.data.images.load(str(ROOT/'assets/experiments/trellis-local/relic-marshal-cpu-smoke_cutout.png'))
ref.name='Approved_Commander_Reference';ref.use_fake_user=True;ref.pack();w,h=ref.size
pixels=np.empty(w*h*4,dtype=np.float32);ref.pixels.foreach_get(pixels);pixels=pixels.reshape(h,w,4)
occ=np.argwhere(pixels[:,:,3]>.5);bottom,left=occ.min(0);top,right=occ.max(0)
# Oblique front matches the view in which the TRELLIS source was inspected.
right_axis=np.array([.470588,.882353,0]);up_axis=np.array([-.216,.115,.9696]);forward=np.array([.855,-.456,.245])
horizontal=coords@right_axis;vertical=coords@up_axis
u=(horizontal-horizontal.min())/(horizontal.max()-horizontal.min());v=(vertical-vertical.min())/(vertical.max()-vertical.min())
ix=np.clip(np.rint(left+u*(right-left)).astype(int),0,w-1);iy=np.clip(np.rint(bottom+v*(top-bottom)).astype(int),0,h-1)
sample=pixels[iy,ix];z=coords[:,2];side=np.abs(coords[:,1])
ivory=np.array([.54,.43,.275]);gold=np.array([.36,.215,.076]);teal=np.array([.012,.105,.12]);dark=np.array([.026,.03,.034])
paint=np.tile(ivory,(len(coords),1))
joints=((z>.22)&(z<.31))|((z>.61)&(z<.68))|((z>1.02)&(z<1.09))|((z>1.64)&(z<1.70));paint[joints]=dark
stripe=(side<.08)&(z>.81)&(z<1.64);paint[stripe]=teal
paint[(side>.08)&(side<.105)&(z>.81)&(z<1.64)]=gold
paint[z<.085]=gold
rgb=sample[:,:3].copy();r,g,b=rgb.T
# Repaint from the sampled palette rather than baking white studio highlights.
teal_mask=(g>r*1.18)&(b>r*1.12)&(g>.055)
dark_mask=rgb.max(1)<.12
gold_mask=(r>g*1.24)&(g>b*1.25)&(~teal_mask)&(~dark_mask)
mapped=np.tile(ivory,(len(coords),1));mapped[teal_mask]=teal;mapped[gold_mask]=gold;mapped[dark_mask]=dark
shade=np.clip(rgb.mean(1)/.32,.70,1.20);mapped*=shade[:,None]
blend=np.clip((normals@forward+.15)/.65,0,1)*sample[:,3]
paint=paint*(1-blend[:,None])+mapped*blend[:,None]
attr=mesh.color_attributes.get('ReferencePaint');rgba=np.ones((len(coords),4),dtype=np.float32);rgba[:,:3]=paint;attr.data.foreach_set('color',rgba.reshape(-1))
for poly in mesh.polygons:
 rgb=paint[list(poly.vertices)].mean(0);r,g,b=rgb
 poly.material_index=3 if g>r*1.5 and b>r*1.4 and g>.05 else 2 if max(rgb)<.1 else 1 if r>g*1.3 and g>b*1.35 else 0
 mesh.materials[3].node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=0
def mat(name,color,metal=.2,rough=.4,emit=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 if emit:p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emit
 return m
bronze=mat('Restored bronze fittings',gold,.72,.3);black=mat('Visor dark inset',dark,.4,.32);cyan=mat('Relic crystal and visor',(.015,.42,.48),.25,.22,1.5)
parts=[obj]
def surface(y,z,radius=.065):
 candidates=coords[(np.abs(coords[:,1]-y)<radius)&(np.abs(coords[:,2]-z)<radius)]
 return float(np.quantile(candidates[:,0],.95)) if len(candidates) else .30
def ellipsoid(name,loc,scale,material):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
 for p in o.data.polygons:p.use_smooth=True
 parts.append(o);return o
# Clean fitted details restore the recognisable energy core and eye slit.
core_y=-.035;core_z=1.38;core_x=surface(core_y,core_z)+.025
bpy.ops.mesh.primitive_torus_add(major_radius=.067,minor_radius=.012,major_segments=48,minor_segments=10,location=(core_x,core_y,core_z),rotation=(0,math.pi/2,0));ring=bpy.context.object;ring.name='Restored chest relic bezel';ring.data.materials.append(bronze);parts.append(ring)
ellipsoid('Restored relic crystal',(core_x+.012,core_y,core_z),(.018,.054,.054),cyan)
eye_z=1.805;eye_x=surface(0,eye_z,.07)+.012
ellipsoid('Visor bezel',(eye_x,0,eye_z),(.018,.122,.035),bronze)
ellipsoid('Visor recess',(eye_x+.013,0,eye_z),(.014,.108,.023),black)
for side in [-1,1]:ellipsoid('Teal eye slit',(eye_x+.025,side*.05,eye_z+.002),(.007,.042,.008),cyan)
for part in parts:
 part.data.validate(clean_customdata=True);part.data.update()
scene=bpy.context.scene
scene.cycles.samples=16;scene.render.threads=4;scene.render.resolution_x=850;scene.render.resolution_y=1000
scene.camera.location=(4.5,-2.4,2.3);target=Vector((0,0,1.02));scene.camera.rotation_euler=(target-scene.camera.location).to_track_quat('-Z','Y').to_euler()
scene.camera.data.ortho_scale=2.44
bpy.ops.object.select_all(action='DESELECT')
for part in parts:part.select_set(True)
bpy.context.view_layer.objects.active=obj
bpy.ops.export_scene.gltf(filepath=str(EXPORT),export_format='GLB',use_selection=True,export_animations=False,export_materials='EXPORT',export_attributes=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'relic-marshal-repaired-v3.blend'))
renders=[]
for name,location in [('front',(4.5,-2.4,2.3)),('back',(-4,2,2.3))]:
 scene.camera.location=location;scene.camera.rotation_euler=(target-scene.camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(PREVIEW/(name+'.png'));bpy.ops.render.render(write_still=True);renders.append(scene.render.filepath)
triangles=0;boundary=0;nonmanifold=0
for part in parts:
 part.data.calc_loop_triangles();triangles+=len(part.data.loop_triangles);bm=bmesh.new();bm.from_mesh(part.data);boundary+=sum(e.is_boundary for e in bm.edges);nonmanifold+=sum(not e.is_manifold for e in bm.edges);bm.free()
report={'sourceRepair':str(BASE),'export':str(EXPORT),'exportBytes':EXPORT.stat().st_size,'sha256':hashlib.sha256(EXPORT.read_bytes()).hexdigest(),'triangles':triangles,'meshObjects':len(parts),'boundaryEdges':boundary,'nonManifoldEdges':nonmanifold,'sourceReferencePreserved':True,'referencePaint':'Oblique reference projection quantized to ivory, bronze, teal and dark metal; authored rear palette','restoredDetails':['chest relic bezel and crystal','visor bezel, recess and two eye slits'],'renders':renders,'durationSeconds':round(time.time()-started,1),'rigged':False,'mobileProductionReady':False,'limitations':['Some fine armor engravings and thin mechanical gaps remain softened.','Color placement is approximate, particularly on hidden surfaces.','Requires mobile retopology and rigging before game integration.']}
(ROOT/'assets/manifests/relic-marshal-repaired-v3.json').write_text(json.dumps(report,indent=2));print(json.dumps(report),flush=True)
