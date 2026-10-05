"""Inspect saved native assets and snapshot real editor/PIE joint transforms."""
from pathlib import Path
import json
import unreal as u

ROOT=Path(__file__).resolve().parents[1]
BASE='/Game/MechalordReforged'
report=json.loads((ROOT/'builds/reforged-native-build.json').read_text())
ea=u.get_editor_subsystem(u.EditorAssetSubsystem)
registry=u.AssetRegistryHelpers.get_asset_registry()
options=u.AssetRegistryDependencyOptions()
options.set_editor_property('include_hard_package_references',True)
options.set_editor_property('include_soft_package_references',True)
dependencies=set()
failures=[]
for path in ea.list_assets(BASE,recursive=True):
    package=str(path).split('.')[0]
    for dependency in registry.get_dependencies(package,options):
        name=str(dependency)
        dependencies.add(name)
        if name.startswith('/Game/') and not name.startswith(BASE+'/'):
            failures.append('External game dependency: '+name)
for asset in report['assets']:
    for entry in asset['parts']:
        mesh=u.load_asset(entry['path'])
        if mesh is None or not isinstance(mesh,u.StaticMesh):
            failures.append('Missing native mesh: '+entry['path'])
            continue
        if mesh.get_num_triangles(0)!=entry['triangles']:
            failures.append('Triangle count changed: '+entry['path'])
        for slot in mesh.static_materials:
            if not slot.material_interface or not slot.material_interface.get_path_name().startswith(BASE+'/'):
                failures.append('Missing/external material: '+entry['path'])
world=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_game_world()
if world:
    actors=u.GameplayStatics.get_all_actors_of_class(world,u.Actor)
else:
    actors=u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors()
poses={}
for actor in actors:
    if u.Name('MechalordReforgedAuthored') not in actor.tags or not isinstance(actor,u.StaticMeshActor):
        continue
    root=actor.root_component
    location=actor.get_actor_location()
    rotation=actor.get_actor_rotation()
    relative=root.get_editor_property('relative_location')
    relative_rotation=root.get_editor_property('relative_rotation')
    poses[actor.get_actor_label()]={'worldPosition':[location.x,location.y,location.z],
        'worldRotation':[rotation.roll,rotation.pitch,rotation.yaw],
        'relativePosition':[relative.x,relative.y,relative.z],
        'relativeRotation':[relative_rotation.roll,relative_rotation.pitch,relative_rotation.yaw],
        'parent':actor.get_attach_parent_actor().get_actor_label() if actor.get_attach_parent_actor() else None,
        'collision':str(actor.static_mesh_component.get_collision_enabled())}
result={'status':'passed' if not failures else 'failed','failures':failures,
        'assetCount':len(report['assets']),'nativeMeshCount':sum(len(a['parts']) for a in report['assets']),
        'dependencies':sorted(dependencies),'runtimeWorld':bool(world),
        'runtimeTime':u.GameplayStatics.get_time_seconds(world) if world else None,'poses':poses}
(ROOT/'builds/reforged-native-validation.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
if failures:
    raise RuntimeError(str(failures))
