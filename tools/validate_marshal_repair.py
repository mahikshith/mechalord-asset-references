"""Re-import the actual delivery GLB and inspect geometry/material evidence."""
import bpy,bmesh,json,struct,hashlib,math
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1];path=root/'assets/exports/relic-marshal-repaired-v4.glb'
with path.open('rb') as f:
 magic,version,length=struct.unpack('<4sII',f.read(12));n,t=struct.unpack('<II',f.read(8));doc=json.loads(f.read(n))
assert magic==b'glTF' and version==2 and length==path.stat().st_size
primitives=[p for m in doc['meshes'] for p in m['primitives']]
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(path))
objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
tris=0;finite=True;bounds=[];material_names=[];changed=[]
for o in objects:
 changed.append(o.data.validate());o.data.calc_loop_triangles();tris+=len(o.data.loop_triangles)
 finite &= all(math.isfinite(c) for v in o.data.vertices for c in v.co)
 bounds.extend(o.matrix_world@Vector(c) for c in o.bound_box)
 material_names.extend(m.name for m in o.data.materials)
assert finite and not any(changed),'Reimported geometry failed validation'
report={'file':str(path),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'validGLB2':True,'blenderReimport':'passed','finiteCoordinates':finite,'meshValidationModifiedData':any(changed),'triangles':tris,'meshObjects':len(objects),'heightMetres':max(v.z for v in bounds)-min(v.z for v in bounds),'materials':sorted(set(material_names)),'coloredPrimitives':sum('COLOR_0' in p['attributes'] for p in primitives),'totalPrimitives':len(primitives),'emissiveMaterials':sum(any(m.get('emissiveFactor',[0,0,0])) for m in doc['materials']),'rigged':bool(doc.get('skins')),'animations':len(doc.get('animations',[])),'mobileProductionReady':False}
(root/'assets/manifests/relic-marshal-repaired-v4-export-check.json').write_text(json.dumps(report,indent=2));print(json.dumps(report),flush=True)
