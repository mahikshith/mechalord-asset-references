"""Inspect dense TRELLIS geometry with bounded buffers, without opening a renderer."""
import argparse
from array import array
import json
import math
from pathlib import Path
import struct
import sys

def inspect(path):
    size = path.stat().st_size
    with path.open('rb') as source:
        magic, version, declared = struct.unpack('<4sII', source.read(12))
        if magic != b'glTF' or version != 2 or declared != size: raise ValueError('Invalid GLB header/length')
        document = None; binary_start = None; binary_size = None
        while source.tell() < size:
            length, kind = struct.unpack('<II', source.read(8)); start = source.tell()
            if length % 4 or start + length > size: raise ValueError('Invalid GLB chunk bounds')
            if kind == 0x4E4F534A:
                if document is not None or length > 8 * 1024 * 1024: raise ValueError('Unexpected JSON chunk')
                document = json.loads(source.read(length))
            elif kind == 0x004E4942:
                if binary_start is not None: raise ValueError('Multiple BIN chunks')
                binary_start, binary_size = start, length
            source.seek(start + length)
        if document is None or binary_start is None: raise ValueError('Missing JSON/BIN chunk')
        if len(document.get('buffers', [])) != 1 or document['buffers'][0]['byteLength'] > binary_size: raise ValueError('Unexpected embedded buffer')

        def scan(accessor_index, positions=False):
            accessor = document['accessors'][accessor_index]
            view = document['bufferViews'][accessor['bufferView']]
            if not isinstance(accessor.get('count'), int) or accessor['count'] <= 0: raise ValueError('Expected nonempty accessor')
            if positions and (accessor['componentType'] != 5126 or accessor['type'] != 'VEC3'): raise ValueError('Expected float XYZ coordinates')
            if not positions and (accessor['componentType'] not in [5125, 5123, 5121] or accessor['type'] != 'SCALAR'): raise ValueError('Expected unsigned triangle indices')
            code, width = {5126: ('f', 4), 5125: ('I', 4), 5123: ('H', 2), 5121: ('B', 1)}[accessor['componentType']]
            components = 3 if accessor['type'] == 'VEC3' else 1 if accessor['type'] == 'SCALAR' else 0
            if not components or 'sparse' in accessor or view.get('buffer', 0) != 0: raise ValueError('Unsupported dense accessor')
            if view.get('byteStride', width * components) != width * components: raise ValueError('Interleaved data is not expected from this exporter')
            offset = view.get('byteOffset', 0) + accessor.get('byteOffset', 0)
            remaining = accessor['count'] * components * width
            if view.get('byteOffset', 0) < 0 or accessor.get('byteOffset', 0) < 0 or view['byteLength'] < 0: raise ValueError('Negative buffer bounds')
            if accessor.get('byteOffset', 0) + remaining > view['byteLength'] or offset + remaining > binary_size: raise ValueError('Accessor exceeds its view')
            source.seek(binary_start + offset); low = math.inf; high = -math.inf
            while remaining:
                length = min(4 * 1024 * 1024, remaining); data = source.read(length)
                if len(data) != length: raise ValueError('Truncated geometry data')
                numbers = array(code); numbers.frombytes(data)
                if sys.byteorder != 'little': numbers.byteswap()
                if positions and not all(math.isfinite(value) for value in numbers): raise ValueError('Nonfinite vertex coordinates')
                low = min(low, min(numbers)); high = max(high, max(numbers)); remaining -= length
            return accessor, low, high

        primitives = []
        for mesh in document.get('meshes', []):
            for primitive in mesh.get('primitives', []):
                if primitive.get('mode', 4) != 4: raise ValueError('Expected indexed triangles')
                position, low, high = scan(primitive['attributes']['POSITION'], positions=True)
                indices, index_low, index_high = scan(primitive['indices'])
                if indices['count'] % 3 or index_low < 0 or index_high >= position['count']: raise ValueError('Invalid triangle indices')
                primitives.append({'vertices': position['count'], 'triangles': indices['count'] // 3, 'coordinateRange': [low, high],
                                   'boundsMin': position.get('min'), 'boundsMax': position.get('max')})
        if not primitives: raise ValueError('No triangle geometry')
    return {'file': str(path.resolve()), 'bytes': size, 'validGLB2': True, 'finiteCoordinates': True, 'indicesInRange': True,
            'generator': document['asset'].get('generator'), 'generation': document['asset'].get('extras'), 'primitives': primitives,
            'triangles': sum(item['triangles'] for item in primitives), 'vertices': sum(item['vertices'] for item in primitives),
            'materials': len(document.get('materials', [])), 'textures': len(document.get('textures', [])),
            'animations': len(document.get('animations', [])), 'skins': len(document.get('skins', [])),
            'mobileReady': False, 'acceptance': 'Dense untextured source geometry; cleanup, materials, rigging and animation remain required'}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__); parser.add_argument('input', type=Path); args = parser.parse_args()
    metrics = inspect(args.input)
    args.input.with_suffix('.mesh.json').write_text(json.dumps(metrics, indent=2), encoding='utf-8')
    print(json.dumps(metrics, indent=2))
