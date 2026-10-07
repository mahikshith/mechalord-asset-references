"""Unreal editor script: import CC0 weapon props (Quaternius Sci-Fi Essentials rifle)."""
import os
import traceback
import unreal

PROJECT = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())
REPO = os.path.abspath(os.path.join(PROJECT, '..', '..'))
LOG = os.path.join(PROJECT, 'Saved', 'IronProps.log')
tools = unreal.AssetToolsHelpers.get_asset_tools()


def log(*a):
    with open(LOG, 'a', encoding='utf-8') as fh:
        fh.write(' '.join(str(x) for x in a) + '\n')


def main():
    if os.path.exists(LOG):
        os.remove(LOG)
    src = os.path.join(REPO, 'assets', 'originals', 'quaternius-scifi-essentials-full', 'unzipped')
    gun = next(os.path.join(r, f) for r, _, fs in os.walk(src) for f in fs if f == 'Gun_Rifle.gltf')
    log('gun source', gun)
    t = unreal.AssetImportTask()
    t.filename = gun
    t.destination_path = '/Game/IronLegion/Props/Rifle'
    t.automated = True
    t.replace_existing = True
    t.save = True
    tools.import_asset_tasks([t])
    log('imported', [str(p) for p in t.imported_object_paths])
    for p in t.imported_object_paths:
        a = unreal.EditorAssetLibrary.load_asset(p)
        if isinstance(a, unreal.StaticMesh):
            log('static mesh', p, 'bounds', a.get_bounds())
    log('DONE')


try:
    main()
except Exception:
    log('FAILED', traceback.format_exc())
