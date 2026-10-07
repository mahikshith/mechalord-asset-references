"""Download the free (CC0) source assets the side-scroller uses.

Raw downloads are large and git-ignored; this script plus
docs/asset-provenance-sidescroller.md is the record of where they came from.
Run from the repository root: python tools/fetch_free_assets.py
"""
import json, os, sys, urllib.request, zipfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PH = os.path.join(ROOT, 'assets', 'originals', 'polyhaven')
UA = {'User-Agent': 'mechalord-asset-fetch/1.0'}

# Poly Haven (CC0). Textures at 2k: colour, OpenGL normal, roughness, AO/rough/metal, height.
TEXTURES = [
    'concrete_wall_008', 'concrete_floor_worn_001', 'metal_plate', 'metal_plate_02',
    'green_metal_rust', 'rusty_metal_02', 'painted_metal_shutter', 'container_side',
    'metal_grate_rusty', 'corrugated_iron', 'rusty_painted_metal', 'blue_metal_plate',
]
MAPS = {'Diffuse': 'diff', 'nor_gl': 'nor_gl', 'Rough': 'rough', 'arm': 'arm', 'Displacement': 'disp'}
HDRIS = ['industrial_sunset_puresky', 'the_sky_is_on_fire', 'belfast_sunset_puresky']

SOLDIER_URL = 'https://opengameart.org/sites/default/files/Sci-fi%20Soldiers.zip'  # Irondust, CC0


def get(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req) as r, open(dest + '.part', 'wb') as f:
        f.write(r.read())
    os.replace(dest + '.part', dest)
    print('got', os.path.relpath(dest, ROOT))


def files(asset):
    req = urllib.request.Request(f'https://api.polyhaven.com/files/{asset}', headers=UA)
    return json.load(urllib.request.urlopen(req))


def main(res='2k', hdri_res='4k'):
    for t in TEXTURES:
        f = files(t)
        for key, short in MAPS.items():
            if key not in f or res not in f[key]:
                continue
            fmt = 'jpg' if 'jpg' in f[key][res] else 'png'
            get(f[key][res][fmt]['url'], os.path.join(PH, 'textures', t, f'{t}_{short}_{res}.{fmt}'))
    for h in HDRIS:
        f = files(h)
        get(f['hdri'][hdri_res]['hdr']['url'], os.path.join(PH, 'hdri', f'{h}_{hdri_res}.hdr'))
    sd = os.path.join(ROOT, 'assets', 'originals', 'irondust-scifi-soldier')
    z = os.path.join(sd, 'Sci-fi Soldiers.zip')
    get(SOLDIER_URL, z)
    if not os.path.isdir(os.path.join(sd, 'unzipped')):
        zipfile.ZipFile(z).extractall(os.path.join(sd, 'unzipped'))


if __name__ == '__main__':
    main(*sys.argv[1:])
