"""Run the task's Blender repair with time and memory guards."""
import json,subprocess,time,sys
from pathlib import Path
from trellis_local_probe import memory
root=Path(__file__).resolve().parents[1]
polish='--polish' in sys.argv
finish='--finish' in sys.argv
out=root/('assets/source/relic-marshal-repaired-v4' if finish else 'assets/source/relic-marshal-repaired-v3' if polish else 'assets/source/relic-marshal-repaired-v2');out.mkdir(parents=True,exist_ok=True)
command=[r'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe','--background','--threads','4','--python-exit-code','1','--python',str(root/('tools/finish_marshal_armor.py' if finish else 'tools/polish_marshal_blender.py' if polish else 'tools/repair_marshal_blender.py'))]
start=time.monotonic();reason=None;peak=0
with (out/'repair.stdout.log').open('w') as stdout,(out/'repair.stderr.log').open('w') as stderr,(out/'repair.monitor.jsonl').open('w') as monitor:
 p=subprocess.Popen(command,stdout=stdout,stderr=stderr,creationflags=subprocess.CREATE_NO_WINDOW|subprocess.BELOW_NORMAL_PRIORITY_CLASS)
 while p.poll() is None:
  s=memory(p.pid);s['elapsedSeconds']=round(time.monotonic()-start,1);peak=max(peak,s['peakWorkingSet']);monitor.write(json.dumps(s)+'\n');monitor.flush()
  if s['freeRAM']<700*1024**2:reason='Low system memory guard'
  if s['workingSet']>4*1024**3:reason='4 GiB working-set guard'
  if time.monotonic()-start>600:reason='10 minute time guard'
  if reason:p.terminate();p.wait(timeout=30);break
  time.sleep(3)
receipt={'command':command,'exitCode':p.returncode,'stopReason':reason,'elapsedSeconds':round(time.monotonic()-start,1),'peakWorkingSetBytes':peak}
(out/'run-receipt.json').write_text(json.dumps(receipt,indent=2));print(json.dumps(receipt))
