"""Prepare and verify real Unreal cooked chapter paks. Never invents cooked content."""
from __future__ import annotations
import argparse
import hashlib
import json
import re
import shutil
from pathlib import Path

MAX_CHAPTER_BYTES = 100_000_000
PAK_MAGIC = bytes.fromhex("e1126f5a")
TOKEN = re.compile(r"^[A-Za-z0-9_.-]+$")

def digest(path: Path) -> str:
    result = hashlib.sha1()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            result.update(block)
    return result.hexdigest()

def validate_descriptor(value: dict, build_id: str | None = None, platform: str | None = None) -> dict:
    if not isinstance(value, dict) or value.get("schema") != 1:
        raise ValueError("Unsupported chapter descriptor schema")
    for key in ("buildId", "platform"):
        if not isinstance(value.get(key), str) or not TOKEN.fullmatch(value[key]):
            raise ValueError(f"Invalid {key}")
    if build_id is not None and value["buildId"] != build_id:
        raise ValueError("Chapter belongs to a different game build")
    if platform is not None and value["platform"] != platform:
        raise ValueError("Chapter was cooked for a different platform")
    if type(value.get("chunkId")) is not int or value["chunkId"] != 1001:
        raise ValueError("Only optional chapter chunk 1001 is allowed")
    total = value.get("downloadBytes")
    if type(total) is not int or not 0 < total < MAX_CHAPTER_BYTES:
        raise ValueError("Chapter must be smaller than 100 MB")
    entries = value.get("files")
    if not isinstance(entries, list) or not 1 <= len(entries) <= 16:
        raise ValueError("Chapter must list between one and sixteen paks")
    seen = set()
    for entry in entries:
        if not isinstance(entry, dict):
            raise ValueError("Invalid file record")
        name = entry.get("name")
        if not isinstance(name, str) or not TOKEN.fullmatch(name) or not name.endswith(".pak") or not name.startswith("pakchunk1001-") or ".." in name or name in seen:
            raise ValueError("Unsafe or duplicate pak filename")
        seen.add(name)
        if not re.fullmatch(r"[a-fA-F0-9]{40}", str(entry.get("sha1", ""))):
            raise ValueError("Pak hash must be a SHA1 digest")
        if type(entry.get("bytes")) is not int or not 0 < entry["bytes"] < MAX_CHAPTER_BYTES:
            raise ValueError("Invalid pak byte count")
    if sum(entry["bytes"] for entry in entries) != total:
        raise ValueError("Descriptor byte totals do not match its paks")
    return value

def check_pak(path: Path) -> None:
    if not path.is_file() or path.suffix != ".pak":
        raise ValueError(f"Expected a real cooked .pak file: {path}")
    with path.open("rb") as source:
        source.seek(max(0, path.stat().st_size - 65536))
        if PAK_MAGIC not in source.read():
            raise ValueError(f"Unreal pak trailer not found in {path.name}; not using placeholder content")

def build(paks: list[Path], output: Path, build_id: str, platform: str) -> Path:
    if not TOKEN.fullmatch(build_id) or not TOKEN.fullmatch(platform):
        raise ValueError("Build and platform names must be simple path tokens")
    files = []
    for path in paks:
        check_pak(path)
        if not path.name.startswith("pakchunk1001-"):
            raise ValueError("Only chunk 1001 is downloadable; shared/base chunks stay bundled")
        files.append({"name": path.name, "bytes": path.stat().st_size, "sha1": digest(path)})
    descriptor = validate_descriptor({"schema": 1, "buildId": build_id, "platform": platform, "chunkId": 1001,
                                      "downloadBytes": sum(f["bytes"] for f in files), "files": files})
    destination = output.resolve() / build_id
    pak_directory = destination / platform
    pak_directory.mkdir(parents=True, exist_ok=True)
    for source in paks:
        target = pak_directory / source.name
        if source.resolve() != target.resolve():
            shutil.copy2(source, target)
    manifest = [f"$NUM_ENTRIES = {len(files)}", f"$BUILD_ID = {build_id}"]
    for record in files:
        manifest.append("\t".join((record["name"], str(record["bytes"]), "SHA1:" + record["sha1"], "1001", f"/{platform}/{record['name']}")))
    (destination / f"BuildManifest-{platform}.txt").write_text("\n".join(manifest) + "\n", encoding="utf-8")
    descriptor_path = destination / f"Chapter-{platform}.json"
    descriptor_path.write_text(json.dumps(descriptor, indent=2) + "\n", encoding="utf-8")
    verify(descriptor_path, build_id, platform)
    return descriptor_path

def verify(path: Path, build_id: str | None = None, platform: str | None = None) -> dict:
    data = validate_descriptor(json.loads(path.read_text(encoding="utf-8")), build_id, platform)
    for record in data["files"]:
        pak = path.parent / data["platform"] / record["name"]
        check_pak(pak)
        if pak.stat().st_size != record["bytes"] or digest(pak) != record["sha1"]:
            raise ValueError(f"Pak integrity failed: {record['name']}")
    manifest = (path.parent / f"BuildManifest-{data['platform']}.txt").read_text(encoding="utf-8").splitlines()
    expected = [f"$NUM_ENTRIES = {len(data['files'])}", f"$BUILD_ID = {data['buildId']}"]
    expected += ["\t".join((r["name"],str(r["bytes"]),"SHA1:"+r["sha1"],"1001",f"/{data['platform']}/{r['name']}")) for r in data["files"]]
    if manifest != expected:
        raise ValueError("Downloader manifest differs from the verified descriptor")
    return data

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    actions = parser.add_subparsers(dest="action", required=True)
    make = actions.add_parser("build")
    make.add_argument("--pak", action="append", type=Path, required=True)
    make.add_argument("--output", type=Path, default=Path("builds/chapter-server/content"))
    make.add_argument("--build-id", default="mechalord-0.1.0")
    make.add_argument("--platform", choices=("Android", "Windows", "IOS"), default="Android")
    check = actions.add_parser("verify")
    check.add_argument("descriptor", type=Path)
    check.add_argument("--build-id")
    check.add_argument("--platform")
    args = parser.parse_args()
    try:
        if args.action == "build":
            print(build(args.pak, args.output, args.build_id, args.platform))
        else:
            data = verify(args.descriptor, args.build_id, args.platform)
            print(f"Verified {len(data['files'])} paks, {data['downloadBytes']} bytes, {data['platform']}, {data['buildId']}")
    except (ValueError, OSError, json.JSONDecodeError) as error:
        parser.exit(1, f"Chapter preparation failed: {error}\n")

if __name__ == "__main__":
    main()
