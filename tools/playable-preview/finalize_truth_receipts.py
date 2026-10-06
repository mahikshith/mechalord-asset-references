"""Seal local runtime captures with their actual scope and final build identity."""
from pathlib import Path
from hashlib import sha256
import json
from urllib.request import urlopen

root = Path(__file__).resolve().parents[2]
folder = root / "delivery/gameplay-truth-proof"
build = json.loads((root / "builds/playable-build-manifest.json").read_text())
hash_file = lambda p: sha256(p.read_bytes()).hexdigest()
for name in ("index.html", "game.js", build["coreAsset"]):
    with urlopen("http://127.0.0.1:8077/playable/" + name, timeout=10) as response:
        actual = sha256(response.read()).hexdigest()
    assert actual == build["files"][name]["sha256"], f"Server mismatch for {name}"

captions = {
    "normal-live-walking.gif": "24 unmodified normal-game frames over 850ms; final build. Actual marching, not a performance benchmark.",
    "final-shield-live.jpg": "Final build. Normal Shield button activation with army 34. Does not establish a live beam-versus-shield collision.",
    "normal-shield.jpg": "Earlier follow-up build. Normal Shield activation, army 38.",
    "normal-emp.jpg": "Earlier follow-up build. Normal EMP activation, army 56.",
    "normal-revive-choice.jpg": "Earlier follow-up build. Explicit revival offer at zero commander HP, army 54.",
    "normal-revival.jpg": "Earlier follow-up build. Normal UI-triggered reboot, army reduced to 42.",
    "normal-walking-01.jpg": "Earlier follow-up build. Normal marching, 14 troops.",
    "normal-walking-02.jpg": "Earlier follow-up build. Normal marching and casualties/recruitment, 21 troops.",
    "normal-act2-after-transfer.jpg": "Earlier follow-up build. Act two after actual manual life transfer; not a boss core or reward-choice screenshot.",
    "normal-act3-live.jpg": "Earlier follow-up build. Act three, commander HP 102/135. Does not capture reward choice or absorption.",
}
proof = {
    "sourceCheckpoint": "89d971a",
    "url": "http://127.0.0.1:8077/playable/index.html",
    "finalBuild": build,
    "earlierFollowupCoreSha256": "25372dd2fce936a11272e2aacea1d88d1ce60510e2e2ecc755b559278f84b6da",
    "scope": "CUA screenshots from normal index.html using ordinary input. No review-controller or hidden-state injection. Captures are sampled observations, not a complete manually controlled campaign.",
    "serverMatchesFinalManifest": True,
    "remainingLiveChecks": ["Controlled reward choice and 1.2-second transfer", "Player-triggered clash victory", "Full normal campaign, final imprint and reload", "Real audible mix", "Nothing Phone (3)"],
    "captures": {name: {"caption": caption, "bytes": (folder/name).stat().st_size, "sha256": hash_file(folder/name)} for name, caption in captions.items()},
}
(folder / "manifest.json").write_text(json.dumps(proof, indent=2), encoding="utf-8")
native_path = root / "builds/shield-interception-audit.json"
native = json.loads(native_path.read_text())
source = root / "game/Mechalord/Source/Mechalord/AssaultSimulation.cpp"
header = source.with_suffix(".h")
assert native["sourceSha256"] == hash_file(source)
assert native["headerSha256"] == hash_file(header)
native["verification"] = "Native production-source fixtures; final canonical WASM rebuilt from unchanged checked source and passed 71 combat checks plus two first-target public routes. Browser beam-contact capture remains open."
native["canonicalCoreSha256"] = build["coreSha256"]
native_path.write_text(json.dumps(native, indent=2), encoding="utf-8")
print("Final server files match the build manifest; scoped capture and source receipts sealed.")
