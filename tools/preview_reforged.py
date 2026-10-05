"""Select a saved Reforged camera and capture it through Unreal's renderer."""
import unreal as u
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
request=json.loads((ROOT/'builds/reforged-preview-request.json').read_text())
level=u.get_editor_subsystem(u.LevelEditorSubsystem)
actors=u.get_editor_subsystem(u.EditorActorSubsystem)
level.eject_pilot_level_actor()
path='/Game/MechalordReforged/Maps/L_'+request['map']
current=level.get_current_level()
if current and str(current.get_outer().get_path_name()).startswith('/Game/'):
    if not level.save_current_level():
        raise RuntimeError('Current level could not be saved')
if not level.load_level(path):
    raise RuntimeError('Cannot load '+path)
matches=[a for a in actors.get_all_level_actors() if a.get_actor_label()==request['camera']]
if len(matches)!=1:
    raise RuntimeError('Camera missing or ambiguous: '+request['camera'])
camera=matches[0]
level.pilot_level_actor(camera)
level.editor_set_game_view(True)
actors.clear_actor_selection_set()
out={'camera':camera.get_path_name(),'captureAPI':u.AutomationLibrary.take_high_res_screenshot.__doc__}
(ROOT/'builds/reforged-preview-result.json').write_text(json.dumps(out,indent=2))
if request.get('capture'):
    u.AutomationLibrary.take_high_res_screenshot(request.get('width',900),request.get('height',1200),
        str(ROOT/'builds/reforged-review'/request['capture']),camera=camera)
