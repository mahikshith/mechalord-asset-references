"""Record completed local work and retire the cancelled paid-service route."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
folder=ROOT/'assets/manifests'
def read(name):return json.loads((folder/name).read_text())
def write(name,data):(folder/name).write_text(json.dumps(data,indent=2)+'\n')
budget=read('pilot-budget.json')
budget['batchStatus']='cancelled-by-user-no-further-Meshy-submissions'
budget['blocker']='Historical API/export restrictions; Meshy discontinued by user. Continue with local Blender and supplied assets.'
for step in budget['estimatedSteps']:
 if step['status']=='approved-not-submitted':step['status']='cancelled-not-submitted'
write('pilot-budget.json',budget)
trail=read('conversion-trail.json')
trail['currentRoute']='User supplied TRELLIS GLB, followed by local Blender cleanup, LODs and animation; no further hosted conversions or credit spending.'
trail['suppliedTrellisAsset']={'original':'assets/originals/sample-huggingface.glb',
 'userReportedGenerator':'TRELLIS on Hugging Face; exact Space/version not supplied',
 'inspection':'assets/manifests/sample-inspection.json','preparation':'assets/manifests/relic-marshal-hf.json'}
write('conversion-trail.json',trail)
register=read('asset-register.json')
for asset in register['assets'][:3]:
 asset['generator']='Local Blender; Meshy discontinued'
 asset['localDetailedExperimentReceipt']=f"assets/manifests/{asset['id']}-v2.json"
 asset['modelStatus']='local-detailed-experiment-awaiting-faithful-conversion'
 if asset['id']=='relic-marshal':
  prep=read('relic-marshal-hf.json')
  asset['generator']='User-supplied TRELLIS reconstruction + local Blender'
  asset['modelStatus']='faithful-textured-source-and-static-mobile-candidate-prepared'
  asset['measuredTriangles']=prep['mobile']['triangles']
  asset['exports']=[prep[k]['glb'] for k in ['source','mobile','lod1']]
  asset['sourceReceipt']='assets/manifests/relic-marshal-hf.json'
  if (folder/'relic-marshal-hf-rigged.json').exists():
   asset['rigReceipt']='assets/manifests/relic-marshal-hf-rigged.json'
   asset['modelStatus']='faithful-source-with-first-pass-local-rig-and-idle-run'
write('asset-register.json',register)
status=ROOT/'docs/status.md'
text=status.read_text().split('\n## Current asset route\n')[0]
text=text.replace('Three Blender blockouts and 11 clips exported but rejected for visual fidelity. Meshy authenticated with 100 credits; API creation rejected because Free has no generation API access. No accepted 3D pilot batch, APK or device measurement yet',
 'Original simplified blockouts rejected. Three more detailed local Blender experiments saved. User supplied a faithful textured TRELLIS commander: 19,537 triangles, one 1024px texture, no incoming rig. Local static 3,980/1,980-triangle candidates and editable source saved. Full pilot acceptance, APK and device measurements pending')
text=text.replace('Preserve the 50-credit approval and do not expand spending automatically.',
 'The user has since discontinued Meshy; that batch is cancelled and no more Meshy jobs or purchases are authorized.')
text+='\n## Current asset route\n\nThe user identified `sample.glb` as a TRELLIS result from Hugging Face. Its exact Space and version are not known from the file. The original is preserved byte-for-byte as `assets/originals/sample-huggingface.glb`. Blender inspection and multi-angle renders confirm a textured commander closely following the original concept. Orientation is standardized to -Y forward/Z up, height to 1.9m, and the pivot to the ground in the derived files. The 4k decimation is an initial candidate: facets and some weapon/armor detail loss remain visible. Retopology and joint cleanup must improve quality before production acceptance. No native image-to-3D capability is claimed; concept generation is 2D and local mesh preparation is performed with Blender.\n'
rig=folder/'relic-marshal-hf-rigged.json'
if rig.exists():text+='\nA first-pass local 14-bone rig and Idle/Run clips are also saved. These are a deformation prototype, not polished production animation; engine validation and additional combat clips remain pending.\n'
status.write_text(text)
visual=ROOT/'docs/visual-standard.md'
text=visual.read_text()
text=text.replace('The project currently has approved 2D references and rejected experimental 3D blockouts. A much closer Meshy commander candidate, supplied by the user, has been inspected remotely, including its textured variant. GLB download is blocked by the account\'s subscription tier. It does not yet have an accepted local 3D pilot batch.',
 'Meshy is discontinued at the user\'s instruction. A faithful textured commander supplied as a TRELLIS GLB is now available locally, with preserved original, editable Blender source, and measured mobile candidates. The local manually modeled v2 assets remain experiments; the supplied reconstruction is preferred for commander fidelity. Low-polygon candidates still require silhouette, joint and texture checks before acceptance.')
visual.write_text(text)
print('Asset records updated.')
