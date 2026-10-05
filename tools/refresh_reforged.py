"""Re-author changed character meshes and maps while retaining the new kit."""
import sys
import importlib
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
if str(ROOT/'tools') not in sys.path:
    sys.path.insert(0,str(ROOT/'tools'))
import build_reforged_unreal as b
importlib.reload(b)
b.REPORT=json.loads(b.REPORT_PATH.read_text())
b.REPORT['maps']=[]
b.REPORT['status']='refreshing'
b.require(b.u.get_editor_subsystem(b.u.UnrealEditorSubsystem).get_game_world() is None,
          'Stop Play-in-Editor before refreshing assets')
selection=ROOT/'builds/reforged-refresh-options.json'
options=json.loads(selection.read_text()) if selection.exists() else {}
maps_only=options.get('maps_only',False)
mesh_assets=set(options.get('mesh_assets',['RelicMarshal','GearlingSentinel','ForgeColossus']))
paints={name:b.u.load_asset(b.BASE+'/Materials/MI_'+name) for name in
        ('ivory','teal','bronze','dark','steel','red','rust','cyan','amber','redglow','rubber')}
specs=b.characters.get_assets()+b.enemies.get_assets()+b.world.get_assets()
for spec in specs:
    b.SPECS[spec['name']]=spec
# A scene refresh may introduce an original background master. Create and
# record it before spawning, even when unchanged existing meshes are retained.
recorded_names={entry['name'] for entry in b.REPORT['assets']}
for spec in specs:
    if spec['name'] not in recorded_names:
        parts=[b.build_part(spec,p,paints) for p in spec['parts']]
        b.REPORT['assets'].append({'name':spec['name'],'label':spec['label'],'parts':parts,
            'triangles':sum(p['triangles'] for p in parts),'source':'new procedural surface specification'})
for recorded in b.REPORT['assets']:
    name=recorded['name']
    if name=='AtelierPlinth':
        b.SPECS[name]={'name':name,'height_cm':24,'category':'studio','parts':[{'id':'Base','parent':None,'pivot':[0,0,0]}]}
    if not maps_only and name in mesh_assets:
        recorded['parts']=[b.build_part(b.SPECS[name],p,paints) for p in b.SPECS[name]['parts']]
        recorded['triangles']=sum(p['triangles'] for p in recorded['parts'])
    for entry in recorded['parts']:
        b.MESHES[(name,entry['part'])]=b.u.load_asset(entry['path'])
b.build_level(b.gallery())
for spec in b.world.get_levels():
    b.build_level(spec)
b.REPORT['status']='authored'
b.REPORT_PATH.write_text(json.dumps(b.REPORT,indent=2),encoding='utf-8')
