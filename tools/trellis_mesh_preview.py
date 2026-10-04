"""CPU-only, memory-bounded inspection copies of dense geometry-only TRELLIS GLBs.

Vertex clustering is deliberately PREVIEW ONLY: it is not production retopology.
Normal Python: python tools/trellis_mesh_preview.py input.glb [--max-faces 150000]
Blender: blender --background --python-exit-code 1 --python this.py -- --render preview.glb
"""
from pathlib import Path
import argparse, ctypes, hashlib, json, math, os, struct, sys, time
import numpy as np


def memory():
    if os.name != 'nt':
        return {}
    class Counters(ctypes.Structure):
        _fields_ = [('cb', ctypes.c_ulong), ('PageFaultCount', ctypes.c_ulong)] + [
            (key, ctypes.c_size_t) for key in ('PeakWorkingSetSize', 'WorkingSetSize',
            'QuotaPeakPagedPoolUsage', 'QuotaPagedPoolUsage', 'QuotaPeakNonPagedPoolUsage',
            'QuotaNonPagedPoolUsage', 'PagefileUsage', 'PeakPagefileUsage')]
    counters = Counters(); counters.cb = ctypes.sizeof(counters)
    current = ctypes.windll.kernel32.GetCurrentProcess
    current.restype = ctypes.c_void_p
    get_info = ctypes.windll.psapi.GetProcessMemoryInfo
    get_info.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_ulong]
    if not get_info(current(), ctypes.byref(counters), counters.cb):
        raise ctypes.WinError()
    return {'peakWorkingSetBytes': counters.PeakWorkingSetSize,
            'workingSetBytes': counters.WorkingSetSize}


def digest(path):
    sha = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(4 * 1024 * 1024), b''):
            sha.update(block)
    return sha.hexdigest()


def read_geometry(path):
    with path.open('rb') as stream:
        magic, version, length = struct.unpack('<4sII', stream.read(12))
        if magic != b'glTF' or version != 2 or length != path.stat().st_size:
            raise ValueError('Expected a complete GLB2 file')
        count, kind = struct.unpack('<II', stream.read(8))
        if kind != 0x4e4f534a:
            raise ValueError('First GLB chunk must be JSON')
        doc = json.loads(stream.read(count))
        count, kind = struct.unpack('<II', stream.read(8)); binary_offset = stream.tell()
        if kind != 0x004e4942:
            raise ValueError('Expected binary GLB chunk')
    primitives = [p for mesh in doc['meshes'] for p in mesh['primitives']]
    if len(primitives) != 1 or doc.get('skins') or doc.get('animations'):
        raise ValueError('Inspection tool accepts one static geometry-only primitive')
    primitive = primitives[0]
    if primitive.get('mode', 4) != 4:
        raise ValueError('Expected triangular faces')
    def accessor(index):
        acc = doc['accessors'][index]; view = doc['bufferViews'][acc['bufferView']]
        width = {'SCALAR': 1, 'VEC3': 3}[acc['type']]
        dtype = {5126: '<f4', 5125: '<u4', 5123: '<u2'}[acc['componentType']]
        size = np.dtype(dtype).itemsize
        if view.get('byteStride', width * size) != width * size or acc.get('sparse'):
            raise ValueError('Interleaved/sparse buffers require a dedicated importer')
        return np.memmap(path, dtype=dtype, mode='r',
                         offset=binary_offset + view.get('byteOffset', 0) + acc.get('byteOffset', 0),
                         shape=(acc['count'], width))
    positions = accessor(primitive['attributes']['POSITION'])
    indices = accessor(primitive['indices']).reshape(-1, 3)
    for node in doc.get('nodes', []):
        if 'mesh' in node and any(key in node for key in ('matrix', 'rotation', 'scale', 'translation')):
            raise ValueError('Transformed source mesh requires transform-aware conversion')
    return positions, indices


def cluster(positions, faces, resolution):
    minimum = positions.min(axis=0); maximum = positions.max(axis=0)
    spacing = float((maximum - minimum).max()) / resolution
    # Three integer cell coordinates encoded in 64 bits. No full mesh copy.
    codes = np.empty(len(positions), dtype=np.uint64)
    base = resolution + 2
    for start in range(0, len(positions), 200000):
        stop = min(start + 200000, len(positions))
        cells = np.floor((positions[start:stop] - minimum) / spacing).astype(np.uint64)
        codes[start:stop] = cells[:, 0] + base * cells[:, 1] + base * base * cells[:, 2]
    unique_codes, inverse = np.unique(codes, return_inverse=True)
    del codes
    count = len(unique_codes); del unique_codes
    counts = np.bincount(inverse, minlength=count)
    reduced = np.empty((count, 3), dtype=np.float32)
    for axis in range(3):
        reduced[:, axis] = np.bincount(inverse, weights=positions[:, axis], minlength=count) / counts
    del counts
    pieces = []
    for start in range(0, len(faces), 200000):
        section = inverse[faces[start:start + 200000]].astype(np.uint32)
        valid = ((section[:, 0] != section[:, 1]) & (section[:, 0] != section[:, 2]) &
                 (section[:, 1] != section[:, 2]))
        if valid.any(): pieces.append(section[valid])
    del inverse
    reduced_faces = np.concatenate(pieces) if pieces else np.empty((0, 3), dtype=np.uint32)
    del pieces
    # Canonical unordered keys remove triangles duplicated by clustering while
    # retaining the winding of the first original face.
    bits = max(1, (count - 1).bit_length())
    if bits > 21:
        raise ValueError('Preview grid too large for bounded face-key encoding')
    canonical = np.sort(reduced_faces, axis=1).astype(np.uint64)
    keys = canonical[:, 0] | (canonical[:, 1] << bits) | (canonical[:, 2] << (2 * bits))
    del canonical
    _, first = np.unique(keys, return_index=True); del keys
    reduced_faces = reduced_faces[np.sort(first)]; del first
    a = reduced[reduced_faces[:, 1]] - reduced[reduced_faces[:, 0]]
    b = reduced[reduced_faces[:, 2]] - reduced[reduced_faces[:, 0]]
    valid = np.linalg.norm(np.cross(a, b), axis=1) > spacing * spacing * 1e-5
    reduced_faces = reduced_faces[valid]; del a, b, valid
    used, remap = np.unique(reduced_faces.reshape(-1), return_inverse=True)
    return reduced[used], remap.astype(np.uint32).reshape(-1, 3), spacing


def write_glb(path, positions, faces, extras):
    normals = np.zeros_like(positions)
    face_normals = np.cross(positions[faces[:, 1]] - positions[faces[:, 0]],
                            positions[faces[:, 2]] - positions[faces[:, 0]])
    for corner in range(3): np.add.at(normals, faces[:, corner], face_normals)
    norms = np.linalg.norm(normals, axis=1)
    normals /= np.maximum(norms, 1e-12)[:, None]
    chunks = [positions.astype('<f4').tobytes(), normals.astype('<f4').tobytes(),
              faces.astype('<u4').tobytes()]
    offsets = [0, len(chunks[0]), len(chunks[0]) + len(chunks[1])]
    doc = {'asset': {'version': '2.0', 'generator': 'Mechalord NumPy preview clustering'},
        'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'name': 'PreviewOnlyClay', 'mesh': 0}],
        'meshes': [{'name': 'InspectionCopy', 'primitives': [{'attributes': {'POSITION': 0, 'NORMAL': 1},
                      'indices': 2, 'material': 0}]}],
        'materials': [{'name': 'NeutralClay', 'pbrMetallicRoughness': {
            'baseColorFactor': [.31, .35, .39, 1], 'metallicFactor': 0, 'roughnessFactor': .77},
            'doubleSided': True}],
        'buffers': [{'byteLength': sum(map(len, chunks))}],
        'bufferViews': [{'buffer': 0, 'byteOffset': offset, 'byteLength': len(chunk),
                        'target': 34962 if index < 2 else 34963}
                       for index, (offset, chunk) in enumerate(zip(offsets, chunks))],
        'accessors': [{'bufferView': 0, 'componentType': 5126, 'count': len(positions), 'type': 'VEC3',
                       'min': positions.min(axis=0).tolist(), 'max': positions.max(axis=0).tolist()},
                      {'bufferView': 1, 'componentType': 5126, 'count': len(positions), 'type': 'VEC3'},
                      {'bufferView': 2, 'componentType': 5125, 'count': faces.size, 'type': 'SCALAR'}],
        'extras': extras}
    raw_json = json.dumps(doc, separators=(',', ':')).encode(); raw_json += b' ' * (-len(raw_json) % 4)
    binary = b''.join(chunks); binary += b'\0' * (-len(binary) % 4)
    with path.open('wb') as stream:
        stream.write(struct.pack('<4sII', b'glTF', 2, 12 + 8 + len(raw_json) + 8 + len(binary)))
        stream.write(struct.pack('<II', len(raw_json), 0x4e4f534a)); stream.write(raw_json)
        stream.write(struct.pack('<II', len(binary), 0x004e4942)); stream.write(binary)


def reduce(args):
    source = Path(args.source).resolve()
    output = source.with_name(source.stem + '-preview.glb')
    if output == source: raise ValueError('Refusing to overwrite source')
    started = time.time(); positions, faces = read_geometry(source)
    source_min = positions.min(axis=0); source_max = positions.max(axis=0)
    attempts = []; resolution = 64
    for _ in range(5):
        p, f, spacing = cluster(positions, faces, resolution)
        attempt = {'resolution': resolution, 'vertices': len(p), 'triangles': len(f), **memory()}
        attempts.append(attempt); print(json.dumps(attempt), flush=True)
        if memory().get('peakWorkingSetBytes', 0) > 1024 ** 3:
            raise MemoryError('Preview process exceeded its 1 GiB working-set ceiling')
        if len(f) <= args.max_faces: break
        del p, f
        resolution = max(12, int(resolution * math.sqrt(args.max_faces / attempts[-1]['triangles']) * .9))
    else: raise ValueError('Could not meet triangle ceiling')
    if not len(f): raise ValueError('Reduction produced no visible surface')
    # glTF stays Y-up. Ground and normalize only the preview to commander height.
    height = float(source_max[1] - source_min[1]); scale = 2 / height
    origin = np.array([(source_min[0] + source_max[0]) / 2, source_min[1],
                       (source_min[2] + source_max[2]) / 2], dtype=np.float32)
    p = (p - origin) * scale
    report = {'schema': 1, 'source': str(source), 'sourceBytes': source.stat().st_size,
        'sourceSha256': digest(source), 'sourceVertices': len(positions), 'sourceTriangles': len(faces),
        'preview': str(output), 'previewVertices': len(p), 'previewTriangles': len(f),
        'method': 'CPU NumPy vertex clustering; duplicate and degenerate faces removed',
        'purpose': 'Inspection-only clay copy, not production retopology',
        'generationLabel': 'One-step runtime smoke test' if 'smoke' in source.stem else 'Quality inference inspection',
        'sourcePreserved': True, 'textures': 0, 'rigged': False, 'previewHeightTargetMetres': 2,
        'sourceBounds': [source_min.tolist(), source_max.tolist()],
        'clusterSpacingSourceUnits': spacing, 'attempts': attempts,
        'durationSeconds': round(time.time() - started, 2), **memory()}
    write_glb(output, p, f, {'inspectionOnly': True, 'sourceName': source.name,
                            'label': report['generationLabel']})
    report.update(previewBytes=output.stat().st_size, previewSha256=digest(output))
    output.with_suffix('.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report), flush=True)


def render(path, raw=False, quick=False):
    import bpy
    from mathutils import Vector
    path = Path(path).resolve(); bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(path))
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    bounds = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
    low = Vector(tuple(min(v[i] for v in bounds) for i in range(3)))
    high = Vector(tuple(max(v[i] for v in bounds) for i in range(3)))
    center = (low + high) / 2; size = high - low
    for obj in meshes:
        for poly in obj.data.polygons: poly.use_smooth = True
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, low.z - .015))
    floor = bpy.context.object; floor.name = 'InspectionFloor'
    mat = bpy.data.materials.new('StudioFloor'); mat.diffuse_color = (.12, .14, .17, 1)
    floor.data.materials.append(mat)
    def aim(obj, target): obj.rotation_euler = (target - obj.location).to_track_quat('-Z', 'Y').to_euler()
    for name, location, energy, area in [('Key', (3, -4, 5), 500, 4),
                                       ('Fill', (-3, -1, 3), 220, 3),
                                       ('Rim', (1, 3, 4), 450, 3)]:
        light = bpy.data.lights.new(name, 'AREA'); light.energy = energy; light.shape = 'DISK'; light.size = area
        obj = bpy.data.objects.new(name, light); bpy.context.collection.objects.link(obj)
        obj.location = location; aim(obj, center)
    scene = bpy.context.scene; scene.render.engine = 'CYCLES'; scene.cycles.device = 'CPU'
    scene.cycles.samples = 8 if quick else 20; scene.cycles.use_denoising = True
    scene.render.threads_mode = 'FIXED'; scene.render.threads = 2
    scene.render.resolution_x = 576 if quick else 900; scene.render.resolution_y = 640 if quick else 1000; scene.render.resolution_percentage = 100
    scene.world = bpy.data.worlds.new('InspectionWorld'); scene.world.color = (.13, .13, .13)
    scene.view_settings.view_transform = 'AgX'; scene.view_settings.exposure = 0
    camera = bpy.data.cameras.new('InspectionCamera'); obj = bpy.data.objects.new('InspectionCamera', camera)
    bpy.context.collection.objects.link(obj); scene.camera = obj
    camera.type = 'ORTHO'; camera.ortho_scale = max(size.z * 1.25, size.x * 1.5, size.y * 1.5)
    outputs = []
    views = [('front', (4.5, -2.4, 1.3))] if raw else [('front', (2.4, -4.5, 1.3)), ('back', (-2.4, 4.5, 1.3))]
    if quick: views = views[:1]
    for label, location in views:
        obj.location = center + Vector(location) * (size.z / 2); aim(obj, center)
        suffix = '-preview-raw-' if raw else '-'
        output = path.with_name(path.stem + suffix + label + '.png')
        scene.render.filepath = str(output); bpy.ops.render.render(write_still=True); outputs.append(str(output))
    report_path = path.with_name(path.stem + '-preview-raw-inspection.json') if raw else path.with_suffix('.json')
    report = {'source': str(path), 'inspectionOnly': True, 'method': 'Direct raw GLB import, no reduction'} if raw else json.loads(report_path.read_text())
    report['render'] = {'engine': 'Blender Cycles CPU', 'samples': scene.cycles.samples, 'threads': 2,
                         'outputs': outputs, 'actualGeometryRender': True,
                         'blenderVersion': bpy.app.version_string,
                         'importedMeshCount': len(meshes), 'rawSourceUnmodified': raw, **memory()}
    report_path.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report['render']), flush=True)


def decimate(source, max_faces):
    import bpy
    from mathutils import Matrix, Vector
    started = time.time(); source = Path(source).resolve()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(source))
    objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    if len(objects) != 1: raise ValueError('Expected one raw source mesh')
    obj = objects[0]; bpy.context.view_layer.objects.active = obj; obj.select_set(True)
    obj.data.calc_loop_triangles(); before = len(obj.data.loop_triangles)
    modifier = obj.modifiers.new('InspectionOnlyDecimation', 'DECIMATE')
    modifier.ratio = max_faces / before; modifier.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.data.calc_loop_triangles(); after = len(obj.data.loop_triangles)
    bounds = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    low = Vector(tuple(min(v[i] for v in bounds) for i in range(3)))
    high = Vector(tuple(max(v[i] for v in bounds) for i in range(3)))
    origin = Vector(((low.x + high.x) / 2, (low.y + high.y) / 2, low.z))
    # Raw TRELLIS front +X, Blender up +Z. Normalize to Blender +Y/glTF -Z.
    obj.data.transform(Matrix.Rotation(math.pi / 2, 4, 'Z') @
                       Matrix.Scale(2 / (high.z - low.z), 4) @ Matrix.Translation(-origin))
    obj.matrix_world = Matrix.Identity(4)
    material = bpy.data.materials.new('InspectionClay'); material.use_nodes = True
    material.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (.25, .29, .34, 1)
    material.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = .8
    obj.data.materials.clear(); obj.data.materials.append(material)
    obj.name = 'InspectionOnlyDecimatedMarshal'
    output = source.with_name(source.stem + '-preview-decimated.glb')
    bpy.ops.export_scene.gltf(filepath=str(output), export_format='GLB', use_selection=True,
                             export_animations=False, export_yup=True)
    report = {'schema': 1, 'source': str(source), 'sourceSha256': digest(source),
        'sourceTriangles': before, 'preview': str(output), 'previewTriangles': after,
        'previewBytes': output.stat().st_size, 'previewSha256': digest(output),
        'method': 'Blender Decimate collapse; inspection-only copy',
        'orientation': 'Raw +X forward corrected to glTF -Z; Y-up; 2m height',
        'sourcePreserved': True, 'mobileReady': False, 'rigged': False, 'textures': 0,
        'durationSeconds': round(time.time() - started, 2), **memory()}
    output.with_suffix('.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report), flush=True)
    render(output, quick=True)


if __name__ == '__main__':
    if os.name == 'nt':
        ctypes.windll.kernel32.GetCurrentProcess.restype = ctypes.c_void_p
        ctypes.windll.kernel32.SetPriorityClass.argtypes = [ctypes.c_void_p, ctypes.c_ulong]
        ctypes.windll.kernel32.SetPriorityClass(ctypes.windll.kernel32.GetCurrentProcess(), 0x4000)
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    parser = argparse.ArgumentParser(); parser.add_argument('source', nargs='?')
    parser.add_argument('--render'); parser.add_argument('--raw', action='store_true')
    parser.add_argument('--decimate'); parser.add_argument('--max-faces', type=int, default=150000)
    args = parser.parse_args(argv)
    if args.decimate: decimate(args.decimate, args.max_faces)
    elif args.render: render(args.render, args.raw)
    elif args.source: reduce(args)
    else: parser.error('Provide source GLB or --render preview.glb')
