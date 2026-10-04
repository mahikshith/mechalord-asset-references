"""Compare Blender's local heat weights on preserved detailed geometry."""
import bpy, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'assets/source/relic-marshal-hf-rigged.blend'))
arm=bpy.data.objects['RelicMarshal_HF_Rig'];body=bpy.data.objects['RelicMarshal_HF_Rigged']
for o in bpy.context.scene.objects:
 if o.type=='MESH' and o.name!='PreviewGround':o.hide_render=True;o.hide_set(True)
body.hide_render=False;body.hide_set(False);arm.hide_set(False)
body.vertex_groups.clear()
for mod in list(body.modifiers):
 if mod.type=='ARMATURE':body.modifiers.remove(mod)
arm.data.bones['root'].use_deform=False
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);arm.select_set(True)
bpy.context.view_layer.objects.active=arm
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
zero=sum(not v.groups for v in body.data.vertices)
print(json.dumps({'heatWeightsUnweighted':zero,'groups':len(body.vertex_groups)}))
arm.animation_data.action=bpy.data.actions['Run'];bpy.context.scene.frame_set(7)
bpy.context.scene.render.resolution_x=720;bpy.context.scene.render.resolution_y=840
bpy.context.scene.cycles.samples=24
bpy.context.scene.render.filepath=str(ROOT/'assets/previews/relic-marshal-hf-heat-check.png')
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/source/relic-marshal-hf-heat-check.blend'))
