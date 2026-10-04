"""Local first-pass FK rig for the supplied commander; not final production retopology."""
import bpy, math, json, sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
import build_pilot_assets as base
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'assets/source/relic-marshal-hf.blend'))
mesh=bpy.data.objects['RelicMarshal_HF_Source']
# Preserve the inspected static source separately. Work on a fresh mesh copy.
body=mesh.copy();body.data=mesh.data.copy();bpy.context.collection.objects.link(body)
body.name='RelicMarshal_HF_Rigged'
for o in bpy.context.scene.objects:
 if o.type=='MESH' and o.name!='PreviewGround':o.hide_render=True;o.hide_set(True)
body.hide_render=False;body.hide_set(False)
bones=[('root',(0,0,0),(0,0,.25),None),
 ('pelvis',(0,0,.84),(0,0,1.06),'root'),
 ('chest',(0,0,1.06),(0,0,1.51),'pelvis'),
 ('head',(0,0,1.51),(0,0,1.84),'chest')]
for sign,side in [(-1,'R'),(1,'L')]:
 bones += [(f'upperarm.{side}',(sign*.51,0,1.43),(sign*.66,0,1.09),'chest'),
  (f'forearm.{side}',(sign*.66,0,1.09),(sign*.72,0,.72),f'upperarm.{side}'),
  (f'thigh.{side}',(sign*.25,0,.87),(sign*.29,0,.50),'pelvis'),
  (f'shin.{side}',(sign*.29,0,.50),(sign*.31,0,.16),f'thigh.{side}'),
  (f'foot.{side}',(sign*.31,0,.16),(sign*.31,-.25,.09),f'shin.{side}')]
base.PARTS=[body];arm=base.rig_parts(bones);arm.name='RelicMarshal_HF_Rig'
# Anatomical region constraints prevent an arm influencing nearby torso armor.
segments={name:(Vector(h),Vector(t)) for name,h,t,parent in bones}
groups={name:body.vertex_groups.new(name=name) for name,h,t,parent in bones}
def distance(p,a,b):
 delta=b-a;t=max(0,min(1,(p-a).dot(delta)/delta.length_squared))
 return (p-(a+delta*t)).length
for v in body.data.vertices:
 p=v.co;x=abs(p.x);z=p.z;side='L' if p.x>=0 else 'R'
 if z>1.53 and x<.30:candidates=['head']
 elif (x>.40 and z>1.04) or (x>.54 and z>.72) or (x>.62 and z>.60):candidates=[f'upperarm.{side}',f'forearm.{side}']
 elif z<.88 and x>.115:candidates=[f'thigh.{side}',f'shin.{side}',f'foot.{side}']
 else:candidates=['pelvis','chest','head'] if z>1.44 else ['pelvis','chest']
 ranked=sorted((distance(p,*segments[n]),n) for n in candidates)
 # Blend only in a narrow joint region; keep most armor near-rigid.
 if len(ranked)==1 or ranked[1][0]-ranked[0][0]>.09:
  groups[ranked[0][1]].add([v.index],1,'REPLACE')
 else:
  gap=ranked[1][0]-ranked[0][0];w=.5+.5*gap/.09
  groups[ranked[0][1]].add([v.index],w,'REPLACE')
  groups[ranked[1][1]].add([v.index],1-w,'REPLACE')
# Blender heat weights improve the fused reconstruction's joints. Keep the
# constrained assignment above only for disconnected fragments heat cannot reach.
fallback={v.index:[(body.vertex_groups[w.group].name,w.weight) for w in v.groups] for v in body.data.vertices}
body.vertex_groups.clear()
for modifier in list(body.modifiers):
 if modifier.type=='ARMATURE':body.modifiers.remove(modifier)
arm.data.bones['root'].use_deform=False
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);arm.select_set(True)
bpy.context.view_layer.objects.active=arm
try:bpy.ops.object.parent_set(type='ARMATURE_AUTO')
except RuntimeError:pass
unreached=[v for v in body.data.vertices if not v.groups]
for v in unreached:
 for name,weight in fallback[v.index]:
  group=body.vertex_groups.get(name) or body.vertex_groups.new(name=name)
  group.add([v.index],weight,'REPLACE')
if not any(mod.type=='ARMATURE' for mod in body.modifiers):
 mod=body.modifiers.new('Skin deformation','ARMATURE');mod.object=arm
def idle(a,t):a.pose.bones['chest'].rotation_euler.x=math.sin(t*math.tau)*.009
def run(a,t):
 wave=math.sin(t*math.tau)
 for side,sign in [('L',1),('R',-1)]:
  a.pose.bones[f'thigh.{side}'].rotation_euler.x=wave*.32*sign
  a.pose.bones[f'shin.{side}'].rotation_euler.x=max(0,wave*sign)*.30
  a.pose.bones[f'foot.{side}'].rotation_euler.x=-wave*.12*sign
  a.pose.bones[f'upperarm.{side}'].rotation_euler.x=-wave*.20*sign
  a.pose.bones[f'forearm.{side}'].rotation_euler.x=-.12
 a.pose.bones['root'].location.z=abs(wave)*.025
clips=[base.action(arm,'Idle',60,idle),base.action(arm,'Run',30,run)]
bpy.context.scene.render.fps=30
def choose(o):
 bpy.ops.object.select_all(action='DESELECT');arm.hide_set(False);o.hide_set(False)
 arm.select_set(True);o.select_set(True);bpy.context.view_layer.objects.active=arm
def export(o,name):
 choose(o);arm.animation_data.action=clips[0];bpy.context.scene.frame_set(1)
 path=ROOT/f'assets/exports/{name}.glb'
 bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,
  export_animations=True,export_animation_mode='ACTIONS',export_skins=True)
 o.data.calc_loop_triangles();return {'path':str(path.relative_to(ROOT)),'triangles':len(o.data.loop_triangles),'bytes':path.stat().st_size}
receipt={'source':export(body,'relic-marshal-hf-rigged-source')}
mobile=body.copy();mobile.data=body.data.copy();bpy.context.collection.objects.link(mobile)
mobile.name='RelicMarshal_HF_RiggedMobile'
choose(mobile);bpy.context.view_layer.objects.active=mobile
dec=mobile.modifiers.new('Mobile geometry','DECIMATE');dec.ratio=3980/19537;dec.use_collapse_triangulate=True
bpy.ops.object.modifier_move_up(modifier=dec.name);bpy.ops.object.modifier_apply(modifier=dec.name)
mobile.data.validate(clean_customdata=False)
receipt['mobile']=export(mobile,'relic-marshal-hf-rigged-mobile')
choose(mobile)
for clip in clips:
 arm.animation_data.action=clip
 bpy.context.scene.frame_start=int(clip.frame_range[0]);bpy.context.scene.frame_end=int(clip.frame_range[1])
 bpy.ops.export_scene.fbx(filepath=str(ROOT/f'assets/exports/relic-marshal-hf-{clip.name.lower()}.fbx'),
  use_selection=True,object_types={'MESH','ARMATURE'},add_leaf_bones=False,
  bake_anim=True,bake_anim_use_all_actions=False,bake_anim_use_nla_strips=False,
  axis_forward='-Y',axis_up='Z',path_mode='COPY',embed_textures=True)
body.hide_render=True;body.hide_set(True);mobile.hide_render=False
scene=bpy.context.scene;scene.render.resolution_x=480;scene.render.resolution_y=560;scene.cycles.samples=12
arm.animation_data.action=clips[1]
folder=ROOT/'assets/previews/relic-marshal-hf-run';folder.mkdir(exist_ok=True)
for index,frame in enumerate(range(1,30,3)):
 scene.frame_set(frame);scene.render.filepath=str(folder/f'{index:02}.png')
 bpy.ops.render.render(write_still=True)
arm.animation_data.action=clips[0];scene.frame_start=1;scene.frame_end=60;scene.frame_set(1)
choose(mobile)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/source/relic-marshal-hf-rigged.blend'))
receipt.update({'bones':len(bones),'clips':['Idle','Run'],
 'method':'Local Blender heat weights, constrained fallback for disconnected fragments, and FK animation; first pass',
 'heatUnreachedSourceVertices':len(unreached),
 'unweightedVertices':sum(not v.groups for v in mobile.data.vertices),
 'productionAccepted':False,'androidValidated':False,
 'limitations':'Fused reconstruction needs further joint cleanup and animation polish; no finger rig or combat clips yet.'})
(ROOT/'assets/manifests/relic-marshal-hf-rigged.json').write_text(json.dumps(receipt,indent=2))
print(json.dumps(receipt))
