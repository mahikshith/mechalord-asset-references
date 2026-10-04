"""Rebuild key hard armor on the repaired TRELLIS body; paint original palette."""
import bpy,bmesh,math,json,hashlib,time,numpy as np
from pathlib import Path
from mathutils import Vector
R=Path(__file__).resolve().parents[1];start=time.time();slug='relic-marshal-repaired-v4'
out=R/'assets/source'/slug;out.mkdir(parents=True,exist_ok=True)
preview=R/'assets/previews'/slug;preview.mkdir(parents=True,exist_ok=True)
export=R/'assets/exports'/f'{slug}.glb'
bpy.ops.wm.open_mainfile(filepath=str(R/'assets/source/relic-marshal-repaired-v3/relic-marshal-repaired-v3.blend'))
body=bpy.data.objects['Relic_Marshal_Repaired']
for o in list(bpy.context.scene.objects):
 if o.type=='MESH' and o!=body and o.name!='Plane':bpy.data.objects.remove(o,do_unlink=True)
# Remove the softened head; preserve the repaired body and weapon silhouette.
bm=bmesh.new();bm.from_mesh(body.data)
bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.0001,plane_co=(0,0,1.70),plane_no=(0,0,1),clear_outer=True,clear_inner=False)
edges=[e for e in bm.edges if e.is_boundary]
if edges:bmesh.ops.holes_fill(bm,edges=edges,sides=0)
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(body.data);bm.free();body.data.update()
ivory=(.58,.47,.32);gold=(.38,.235,.09);teal=(.012,.12,.14);dark=(.023,.031,.038)
def material(name,color,metal=.3,rough=.42,emission=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
 if emission:bs.inputs['Emission Color'].default_value=(*color,1);bs.inputs['Emission Strength'].default_value=emission
 return m
cream=material('Ivory enamel',ivory,.22,.4);bronze=material('Brushed bronze',gold,.75,.31);blue=material('Deep teal enamel',teal,.3,.38);black=material('Recessed gunmetal',dark,.7,.42);energy=material('Cyan relic light',(.01,.44,.53),.25,.22,1.2)
# Clean paint regions, avoiding reference-image highlights or ragged color islands.
mesh=body.data;co=np.empty(len(mesh.vertices)*3,dtype=np.float32);mesh.vertices.foreach_get('co',co);co=co.reshape(-1,3)
z=co[:,2];y=co[:,1];x=co[:,0];paint=np.tile(ivory,(len(co),1))
def band(c,half,feather=.008):return np.clip((half-np.abs(c))/feather+.5,0,1)
def region(mask,color):
 global paint
 paint=paint*(1-mask[:,None])+np.array(color)*mask[:,None]
# Joint bands and bronze boot soles remain consistent on front and back.
for height,width in [(.24,.034),(.68,.035),(1.06,.024)]:region(band(z-height,width),dark)
region(np.clip((.065-z)/.015,0,1),gold)
shin=(np.clip((z-.10)/.02,0,1)*np.clip((.58-z)/.02,0,1))
for side in [-1,1]:
 center=side*.29
 region(band(y-center,.074)*shin,gold);region(band(y-center,.054)*shin,teal)
tabard=np.clip((z-.76)/.025,0,1)*np.clip((1.12-z)/.025,0,1)
region(band(y,.115)*tabard,gold);region(band(y,.088)*tabard,teal)
back=np.clip((-x-.01)/.07,0,1)*np.clip((z-1.12)/.03,0,1)
region(band(y,.083)*back,gold);region(band(y,.059)*back,teal)
rgba=np.ones((len(co),4),dtype=np.float32);rgba[:,:3]=paint
attribute=mesh.color_attributes.get('ReferencePaint') or mesh.color_attributes.new(name='ReferencePaint',type='FLOAT_COLOR',domain='POINT');attribute.data.foreach_set('color',rgba.reshape(-1))
paintmat=material('Authored body paint',ivory,.27,.44);vc=paintmat.node_tree.nodes.new('ShaderNodeVertexColor');vc.layer_name='ReferencePaint';paintmat.node_tree.links.new(vc.outputs['Color'],paintmat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
mesh.materials.clear();mesh.materials.append(paintmat)
for p in mesh.polygons:p.material_index=0;p.use_smooth=True
parts=[body]
def rounded(name,loc,dim,bevel,mat):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 m=o.modifiers.new('Machined rounded edges','BEVEL');m.width=bevel;m.segments=5;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=m.name)
 for p in o.data.polygons:p.use_smooth=True
 n=o.modifiers.new('Stable plate normals','WEIGHTED_NORMAL');n.keep_sharp=True;bpy.ops.object.modifier_apply(modifier=n.name)
 o.data.materials.append(mat);parts.append(o);return o
def oval(name,loc,scale,mat):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=20,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for p in o.data.polygons:p.use_smooth=True
 o.data.materials.append(mat);parts.append(o);return o
def ring(name,loc,r,thickness,mat):
 bpy.ops.mesh.primitive_torus_add(major_segments=48,minor_segments=10,major_radius=r,minor_radius=thickness,location=loc,rotation=(0,math.pi/2,0));o=bpy.context.object;o.name=name;o.data.materials.append(mat)
 for p in o.data.polygons:p.use_smooth=True
 parts.append(o);return o
def front_at(y,z,r=.06):
 pts=co[(abs(co[:,1]-y)<r)&(abs(co[:,2]-z)<r)]
 return float(np.quantile(pts[:,0],.94)) if len(pts) else .2
# Structured helmet and inset visor, referenced from the approved design.
oval('Neck coupling',(.01,0,1.71),(.13,.135,.07),black)
rounded('Rebuilt helmet',(.055,0,1.825),(.30,.315,.31),.062,cream)
rounded('Visor bronze surround',(.210,0,1.845),(.018,.270,.058),.012,bronze)
rounded('Visor slot',(.221,0,1.845),(.009,.246,.034),.008,black)
for side in [-1,1]:rounded('Inset cyan eye',(.227,side*.061,1.845),(.005,.098,.009),.003,energy)
rounded('Bronze helmet crest',(.01,0,1.991),(.255,.035,.045),.012,bronze)
rounded('Teal crest inlay',(.01,0,2.017),(.217,.018,.009),.003,blue)
for side in [-1,1]:
 # Ear coupling faces outward; the local disc stays seated against the helmet.
 o=oval('Helmet ear coupling',(.025,side*.161,1.83),(.067,.019,.070),bronze)
 oval('Helmet ear inset',(.025,side*.175,1.83),(.046,.012,.048),black)
# Broad smooth breastplate over the reconstructed chest, with an inset relic.
chest_x=front_at(0,1.40,.12)
oval('Rebuilt breastplate',(chest_x-.015,0,1.395),(.058,.290,.265),cream)
rounded('Breastplate central bronze inlay',(chest_x+.047,0,1.398),(.009,.050,.340),.015,bronze)
rounded('Breastplate teal inlay',(chest_x+.054,0,1.398),(.006,.026,.320),.01,blue)
ring('Chest relic bezel',(chest_x+.055,0,1.425),.057,.009,bronze)
oval('Chest relic socket',(chest_x+.053,0,1.425),(.012,.050,.050),black)
oval('Chest relic gem',(chest_x+.062,0,1.425),(.018,.041,.041),energy)
# Teal and bronze shoulder panels repair the most damaged painted surfaces.
for side in [-1,1]:
 py=side*.53;pz=1.56;px=front_at(py,pz,.09)
 oval('Shoulder bronze medallion',(px+.004,py,pz),(.018,.112,.137),bronze)
 oval('Shoulder teal enamel',(px+.017,py,pz),(.012,.097,.122),blue)
for p in parts:p.data.validate(clean_customdata=True);p.data.update()
scene=bpy.context.scene;target=Vector((0,0,1.035));scene.camera.data.ortho_scale=2.50
scene.cycles.samples=20;scene.render.resolution_x=850;scene.render.resolution_y=1000
bpy.ops.object.select_all(action='DESELECT')
for p in parts:p.select_set(True)
bpy.context.view_layer.objects.active=body
bpy.ops.export_scene.gltf(filepath=str(export),export_format='GLB',use_selection=True,export_animations=False,export_materials='EXPORT',export_attributes=True)
bpy.ops.wm.save_as_mainfile(filepath=str(out/(slug+'.blend')))
renders=[]
for name,loc in [('front',(4.5,-2.4,2.3)),('back',(-4,2,2.3))]:
 scene.camera.location=loc;scene.camera.rotation_euler=(target-scene.camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(preview/(name+'.png'));bpy.ops.render.render(write_still=True);renders.append(scene.render.filepath)
tri=boundary=nonmanifold=0
for p in parts:
 p.data.calc_loop_triangles();tri+=len(p.data.loop_triangles);bm=bmesh.new();bm.from_mesh(p.data);boundary+=sum(e.is_boundary for e in bm.edges);nonmanifold+=sum(not e.is_manifold for e in bm.edges);bm.free()
report={'sourceRepair':'relic-marshal-repaired-v3','export':str(export),'bytes':export.stat().st_size,'sha256':hashlib.sha256(export.read_bytes()).hexdigest(),'triangles':tri,'meshObjects':len(parts),'boundaryEdges':boundary,'nonManifoldEdges':nonmanifold,'paint':'Authored ivory enamel, bronze, teal and gunmetal to match original reference palette; vertex paint plus separate hard armor materials','manualRebuild':['helmet and visor','crest and ear couplings','breastplate and relic','shoulder medallions'],'renders':renders,'durationSeconds':round(time.time()-start,1),'rigged':False,'mobileProductionReady':False,'limitations':['Interpretation of the reference, not an exact reconstruction.','Small weapon, hand and lower-body details remain softer than the concept.','Needs mobile retopology and rigging; original raw and concept are preserved.']}
(R/'assets/manifests'/f'{slug}.json').write_text(json.dumps(report,indent=2));print(json.dumps(report),flush=True)
