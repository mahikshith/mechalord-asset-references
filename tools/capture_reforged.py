"""Capture saved native cameras serially through the live editor's console.

--console-ref must come from a fresh SlateInspector snapshot, not an assumed ID.
Each screenshot is produced by Unreal's renderer and awaited before the next.
"""
from pathlib import Path
import argparse
import json
import struct
import time
from unreal_mcp_client import call

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--console-ref',required=True)
args=parser.parse_args()
views=[('SkyforgeViaduct','SkyforgePortrait','skyforge.png',720,1280),
       ('ReactorTrench','TrenchPortrait','reactor-trench.png',720,1280),
       ('CoreCitadel','CitadelPortrait','core-citadel.png',720,1280),
       ('ReforgedAtelier','Inspect_RelicMarshal','relic-marshal.png',800,1000),
       ('ReforgedAtelier','Inspect_GearlingSentinel','gearling.png',800,1000),
       ('ReforgedAtelier','Inspect_ForgeColossus','forge-colossus.png',800,1000)]
for map_name,camera,name,width,height in views:
    request={'map':map_name,'camera':camera,'capture':name,'width':width,'height':height}
    (ROOT/'builds/reforged-preview-request.json').write_text(json.dumps(request))
    path=ROOT/'builds/reforged-review'/name
    previous=path.stat().st_mtime_ns if path.exists() else None
    result=call('call_tool',{'toolset_name':'SlateInspectorToolset.SlateInspectorToolset','tool_name':'Type',
        'arguments':{'ref':args.console_ref,'text':'py '+(ROOT/'tools/preview_reforged.py').as_posix(),'submit':True}})
    if result.get('isError'):
        raise RuntimeError(str(result))
    deadline=time.monotonic()+30
    while time.monotonic()<deadline:
        if path.exists() and path.stat().st_mtime_ns!=previous:
            data=path.read_bytes()
            if data[:8]==b'\x89PNG\r\n\x1a\n' and len(data)>1000:
                actual=struct.unpack('>II',data[16:24])
                if actual==(width,height):
                    break
        time.sleep(.25)
    else:
        raise RuntimeError('Native screenshot was not completed: '+name)
    print(json.dumps({'capture':str(path),'size':[width,height]}),flush=True)
