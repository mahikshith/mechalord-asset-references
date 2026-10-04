"""Local Unreal MCP client for sessions whose Codex tool catalog is stale.

Uses the installed engine's real discovery/dispatch protocol, restricted to
loopback. Examples: list_toolsets; describe_toolset with a JSON arguments file;
call_tool with the exact schema returned by discovery. No fixed tool catalog.
"""
import argparse
import base64
import json
from pathlib import Path
from urllib.request import Request, urlopen

ENDPOINT = "http://127.0.0.1:8000/mcp"


def request(method, params=None, session=None, notification=False):
    payload = {"jsonrpc": "2.0", "method": method}
    if not notification:
        payload["id"] = 1
    if params is not None:
        payload["params"] = params
    headers = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream"}
    if session:
        headers["Mcp-Session-Id"] = session
    with urlopen(Request(ENDPOINT, json.dumps(payload).encode(), headers), timeout=180) as response:
        current = response.headers.get("Mcp-Session-Id", session)
        raw = response.read().decode("utf-8")
    if not raw.strip():
        return {}, current
    if raw.lstrip().startswith("{"):
        result = json.loads(raw)
    else:
        values = [json.loads(line[5:].strip()) for line in raw.splitlines() if line.startswith("data:")]
        result = next((value for value in values if "result" in value or "error" in value), {})
    if "error" in result:
        raise RuntimeError(json.dumps(result["error"]))
    return result.get("result", result), current


def call(name, arguments):
    _, session = request("initialize", {"protocolVersion": "2025-03-26", "capabilities": {}, "clientInfo": {"name": "Mechalord-local-editor", "version": "0.7"}})
    request("notifications/initialized", session=session, notification=True)
    if name == "tools/list":
        result, _ = request(name, {}, session)
    else:
        result, _ = request("tools/call", {"name": name, "arguments": arguments}, session)
    return result


def save_capture(result, path):
    if result.get("isError"):
        raise RuntimeError(str(result))
    payload = result.get("structuredContent")
    if payload is None:
        payload = next((json.loads(block["text"]) for block in result.get("content", [])
                        if block.get("type") == "text" and block.get("text", "").lstrip().startswith("{")), None)
    if payload is None:
        raise RuntimeError("Editor capture returned no structured image")
    value = payload.get("returnValue", payload)
    capture = value.get("image", value)
    if capture.get("mimeType") != "image/png" or not capture.get("data"):
        raise RuntimeError("Editor returned an empty or non-PNG capture")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(base64.b64decode(capture["data"]))
    return {"imagePath": str(path), **{k: v for k, v in value.items() if k not in ("image", "data", "mimeType")}}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("name")
    parser.add_argument("--args", type=Path)
    parser.add_argument("--out", type=Path)
    parser.add_argument("--image-out", type=Path)
    options = parser.parse_args()
    arguments = json.loads(options.args.read_text(encoding="utf-8-sig")) if options.args else {}
    result = call(options.name, arguments)
    if options.image_out:
        result = save_capture(result, options.image_out)
    text = json.dumps(result, indent=2)
    if options.out:
        options.out.parent.mkdir(parents=True, exist_ok=True)
        options.out.write_text(text, encoding="utf-8")
        print(f"Saved {options.out}")
    else:
        print(text)
