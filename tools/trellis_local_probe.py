"""Bounded, portable TRELLIS CPU smoke test using inspected upstream binaries."""
import argparse
import concurrent.futures
import ctypes
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT / 'tools/vendor/trellis-local'
WEIGHTS = VENDOR / 'models'
NAMES = {'birefnet.gguf', 'dinov3.gguf', 'ss_flow.gguf', 'ss_dec.gguf', 'shape_flow_512.gguf', 'shape_dec.gguf'}
MODEL_REVISION = 'a57397bd3d351599d9729fc144b3f87c3f87d65b'

def fetch_json(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'MechalordLocalProbe/1'}), timeout=30) as response:
        return json.load(response)

def metadata():
    revision = MODEL_REVISION
    entries = fetch_json(f'https://huggingface.co/api/models/ilintar/trellis2-gguf/tree/{revision}/q4')
    files = [entry for entry in entries if Path(entry['path']).name in NAMES]
    if len(files) != 6: raise RuntimeError('Expected six exact geometry/matte models')
    data = {'repository': 'ilintar/trellis2-gguf', 'revision': revision, 'totalBytes': sum(entry['size'] for entry in files), 'files': files}
    VENDOR.mkdir(parents=True, exist_ok=True)
    (VENDOR / 'model-source.json').write_text(json.dumps(data, indent=2), encoding='utf-8')
    print(json.dumps({'stage': 'model-metadata', 'revision': revision, 'bytes': data['totalBytes']}), flush=True)
    return data

def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as source:
        for block in iter(lambda: source.read(4 * 1024 * 1024), b''): digest.update(block)
    return digest.hexdigest()

def download_one(entry, revision, deadline):
    name = Path(entry['path']).name
    target = WEIGHTS / name
    partial = WEIGHTS / (name + '.partial')
    if target.is_file() and target.stat().st_size == entry['size'] and sha256(target) == entry['lfs']['oid']:
        print(json.dumps({'stage': 'already-verified', 'file': name}), flush=True); return
    received = partial.stat().st_size if partial.is_file() else 0
    if received > entry['size']: raise RuntimeError(f'Partial file is larger than the model: {name}')
    failures = 0
    while received < entry['size']:
        if time.monotonic() > deadline: raise RuntimeError('Bounded model download time limit reached; partial files preserved')
        end = min(entry['size'] - 1, received + 32 * 1024 * 1024 - 1)
        start = received
        url = f'https://huggingface.co/ilintar/trellis2-gguf/resolve/{revision}/{entry["path"]}?download=true&probe={time.time_ns()}'
        headers = {'User-Agent': 'MechalordLocalProbe/1', 'Range': f'bytes={start}-{end}', 'Accept-Encoding': 'identity'}
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=max(1, min(90, deadline - time.monotonic()))) as response:
                expected_range = f'bytes {start}-{end}/{entry["size"]}'
                if response.status != 206 or response.headers.get('Content-Range') != expected_range:
                    raise RuntimeError(f'Origin did not honor the exact requested byte range for {name}')
                with partial.open('ab' if start else 'wb') as output:
                    while received <= end:
                        if time.monotonic() > deadline: raise RuntimeError('Bounded download time limit reached during a range; partial bytes preserved')
                        block = response.read(min(2 * 1024 * 1024, end - received + 1))
                        if not block: break
                        output.write(block); received += len(block)
                    output.flush(); os.fsync(output.fileno())
                if received != end + 1: raise RuntimeError(f'Origin ended a range early at byte {received}')
            failures = 0
            print(json.dumps({'stage': 'range-verified', 'file': name, 'bytes': received, 'total': entry['size'], 'httpStatus': 206}), flush=True)
        except Exception as error:
            failures += 1
            print(json.dumps({'stage': 'range-error', 'file': name, 'bytes': received, 'error': str(error), 'retry': failures}), flush=True)
            if failures >= 3: raise
            time.sleep(2)
    if partial.stat().st_size != entry['size'] or sha256(partial) != entry['lfs']['oid']:
        raise RuntimeError(f'Model size/hash failed: {name}')
    partial.replace(target)
    print(json.dumps({'stage': 'download-verified', 'file': name, 'bytes': entry['size']}), flush=True)

class MemoryStatus(ctypes.Structure):
    _fields_ = [('length', ctypes.c_ulong), ('load', ctypes.c_ulong), ('totalPhys', ctypes.c_ulonglong), ('availPhys', ctypes.c_ulonglong),
                ('totalPage', ctypes.c_ulonglong), ('availPage', ctypes.c_ulonglong), ('totalVirtual', ctypes.c_ulonglong), ('availVirtual', ctypes.c_ulonglong), ('availExtended', ctypes.c_ulonglong)]
class ProcessMemory(ctypes.Structure):
    _fields_ = [('cb', ctypes.c_ulong), ('faults', ctypes.c_ulong), ('peakWS', ctypes.c_size_t), ('workingSet', ctypes.c_size_t),
                ('peakPaged', ctypes.c_size_t), ('paged', ctypes.c_size_t), ('peakNonpaged', ctypes.c_size_t), ('nonpaged', ctypes.c_size_t),
                ('pagefile', ctypes.c_size_t), ('peakPagefile', ctypes.c_size_t), ('private', ctypes.c_size_t)]

def memory(pid):
    status = MemoryStatus(); status.length = ctypes.sizeof(status)
    ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(status))
    ctypes.windll.kernel32.OpenProcess.restype = ctypes.c_void_p
    handle = ctypes.windll.kernel32.OpenProcess(0x1000 | 0x10, False, pid)
    counter = ProcessMemory(); counter.cb = ctypes.sizeof(counter)
    if handle:
        ctypes.windll.psapi.GetProcessMemoryInfo(ctypes.c_void_p(handle), ctypes.byref(counter), counter.cb)
        ctypes.windll.kernel32.CloseHandle(ctypes.c_void_p(handle))
    return {'freeRAM': int(status.availPhys), 'workingSet': int(counter.workingSet), 'peakWorkingSet': int(counter.peakWS), 'privateBytes': int(counter.private)}

def inventory():
    runtime = VENDOR / 'runtime'
    with os.add_dll_directory(str(runtime)):
        libraries = [ctypes.CDLL(str(runtime / name)) for name in ['ggml.dll', 'ggml-base.dll']]
        class BackendAPI:
            def __getattr__(self, name):
                for candidate in libraries:
                    try: return getattr(candidate, name)
                    except AttributeError: pass
                raise AttributeError(f'Bundled GGML DLLs do not export {name}')
        library = BackendAPI()
        library.ggml_backend_load_all_from_path.argtypes = [ctypes.c_char_p]
        library.ggml_backend_load_all_from_path.restype = None
        library.ggml_backend_load_all_from_path(str(runtime).encode('utf-8'))
        library.ggml_backend_dev_count.restype = ctypes.c_size_t
        library.ggml_backend_dev_get.argtypes = [ctypes.c_size_t]; library.ggml_backend_dev_get.restype = ctypes.c_void_p
        for name in ['ggml_backend_dev_name', 'ggml_backend_dev_description']:
            function = getattr(library, name); function.argtypes = [ctypes.c_void_p]; function.restype = ctypes.c_char_p
        library.ggml_backend_dev_type.argtypes = [ctypes.c_void_p]; library.ggml_backend_dev_type.restype = ctypes.c_int
        library.ggml_backend_dev_memory.argtypes = [ctypes.c_void_p, ctypes.POINTER(ctypes.c_size_t), ctypes.POINTER(ctypes.c_size_t)]
        library.ggml_backend_dev_memory.restype = None
        devices = []
        for index in range(library.ggml_backend_dev_count()):
            device = library.ggml_backend_dev_get(index); free = ctypes.c_size_t(); total = ctypes.c_size_t()
            library.ggml_backend_dev_memory(device, ctypes.byref(free), ctypes.byref(total))
            devices.append({'index': index, 'name': library.ggml_backend_dev_name(device).decode(),
                            'description': library.ggml_backend_dev_description(device).decode(), 'type': library.ggml_backend_dev_type(device),
                            'freeBytes': free.value, 'totalBytes': total.value})
    output = ROOT / 'assets/experiments/trellis-local'; output.mkdir(parents=True, exist_ok=True)
    (output / 'device-inventory.json').write_text(json.dumps(devices, indent=2), encoding='utf-8')
    print(json.dumps({'stage': 'device-inventory', 'devices': devices}), flush=True)

def run(seconds, backend='CPU', gpu=-1, reuse_cutout=False, steps=1):
    source = ROOT / ('assets/experiments/trellis-local/relic-marshal-cpu-smoke_cutout.png' if reuse_cutout else 'art/concepts/relic-marshal-v1.png')
    output = ROOT / 'assets/experiments/trellis-local'
    output.mkdir(parents=True, exist_ok=True)
    executable = VENDOR / 'runtime/trellis-cli.exe'
    if not executable.is_file() or not source.is_file(): raise RuntimeError('Portable runtime or exact approved input is missing')
    model_source = json.loads((VENDOR / 'model-source.json').read_text(encoding='utf-8'))
    if model_source.get('revision') != MODEL_REVISION or {Path(entry['path']).name for entry in model_source['files']} != NAMES:
        raise RuntimeError('Model receipt does not match the pinned six-file subset')
    for entry in model_source['files']:
        name = Path(entry['path']).name; path = WEIGHTS / name
        if not path.is_file() or path.stat().st_size != entry['size'] or sha256(path) != entry['lfs']['oid']:
            raise RuntimeError(f'Model is missing or fails its size/hash check: {name}')
    label = ('cpu' if backend == 'CPU' else 'vulkan') + ('-smoke' if steps == 1 else '-quality12')
    command = [str(executable), str(source), str(output / f'relic-marshal-{label}.glb'), '--models', str(WEIGHTS), '--backend', backend, '--gpu', str(gpu),
               '--threads', '4', '--sched', 'off', '--res', '512', '--no-texture', '--steps', str(steps), '--seed', '42', '--bg-removal', 'threshold' if reuse_cutout else 'birefnet', '--dump-bg', '--verbose']
    if backend != 'CPU': command.append('--require-gpu')
    started = time.monotonic(); stop = None; peak = 0
    receipt = {'runtimeVersion': 'v0.8.1', 'input': str(source), 'command': command, 'timeLimitSeconds': seconds,
               'quality': 'one-step geometry smoke test; not a production-quality asset' if steps == 1 else 'twelve-step geometry candidate; mesh inspection and mobile cleanup required', 'startedUTC': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
    with (output / f'{label}.stdout.log').open('w', encoding='utf-8') as stdout, (output / f'{label}.stderr.log').open('w', encoding='utf-8') as stderr, (output / f'{label}.monitor.jsonl').open('w', encoding='utf-8') as monitor:
        process = subprocess.Popen(command, stdout=stdout, stderr=stderr, cwd=ROOT,
                                   creationflags=subprocess.CREATE_NO_WINDOW | subprocess.BELOW_NORMAL_PRIORITY_CLASS)
        print(json.dumps({'stage': 'inference-started', 'pid': process.pid, 'secondsLimit': seconds}), flush=True)
        while process.poll() is None:
            stats = memory(process.pid); stats['elapsedSeconds'] = round(time.monotonic() - started, 1); peak = max(peak, stats['peakWorkingSet'])
            if backend != 'CPU':
                try:
                    gpu_memory = subprocess.check_output(['nvidia-smi', '--query-gpu=memory.used,memory.total', '--format=csv,noheader,nounits'], text=True, timeout=3, creationflags=subprocess.CREATE_NO_WINDOW)
                    stats['gpuMemoryMiB'] = [list(map(int, line.split(','))) for line in gpu_memory.strip().splitlines()]
                except (OSError, ValueError, subprocess.SubprocessError): stats['gpuMemoryMiB'] = None
            monitor.write(json.dumps(stats) + '\n'); monitor.flush(); print(json.dumps({'stage': 'inference-monitor', **stats}), flush=True)
            if stats['freeRAM'] < 768 * 1024 * 1024: stop = 'Available RAM fell below 768 MiB'; break
            if stats['elapsedSeconds'] >= seconds: stop = 'Bounded inference time limit reached'; break
            time.sleep(5)
        if stop:
            process.terminate()
            try: process.wait(timeout=10)
            except subprocess.TimeoutExpired: process.kill(); process.wait()
        else: process.wait()
    receipt.update({'exitCode': process.returncode, 'stopReason': stop, 'elapsedSeconds': round(time.monotonic() - started, 1), 'peakWorkingSetBytes': peak,
                    'outputExists': (output / f'relic-marshal-{label}.glb').is_file()})
    (output / f'{label}.receipt.json').write_text(json.dumps(receipt, indent=2), encoding='utf-8')
    print(json.dumps({'stage': 'inference-finished', **receipt}), flush=True)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--download', action='store_true'); parser.add_argument('--run', action='store_true'); parser.add_argument('--seconds', type=int, default=600)
    parser.add_argument('--download-seconds', type=int, default=1800)
    parser.add_argument('--backend', choices=['CPU', 'Vulkan', 'Vulkan1'], default='CPU'); parser.add_argument('--gpu', type=int, default=-1)
    parser.add_argument('--reuse-cutout', action='store_true', help='Reuse the saved BiRefNet cutout; its alpha is preserved, not white-thresholded')
    parser.add_argument('--devices', action='store_true', help='Inventory the same bundled GGML backend DLLs without loading model weights')
    parser.add_argument('--steps', type=int, choices=[1, 12], default=1)
    args = parser.parse_args()
    if args.devices: inventory()
    if args.download:
        data = metadata(); WEIGHTS.mkdir(parents=True, exist_ok=True)
        deadline = time.monotonic() + max(60, min(1800, args.download_seconds))
        errors = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            jobs = [pool.submit(download_one, entry, data['revision'], deadline) for entry in data['files']]
            for job in concurrent.futures.as_completed(jobs):
                try: job.result()
                except Exception as error:
                    errors.append(str(error)); print(json.dumps({'stage': 'file-failed', 'error': str(error)}), flush=True)
        if errors: raise RuntimeError('; '.join(errors))
    if args.run: run(max(30, min(900, args.seconds)), args.backend, args.gpu, args.reuse_cutout, args.steps)

if __name__ == '__main__': main()
