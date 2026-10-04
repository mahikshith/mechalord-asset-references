"""Development-only chapter HTTP server with byte-range resume support."""
import argparse
import functools
import re
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

class ChapterHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        self.range_end = None
        path = Path(self.translate_path(self.path))
        # Avoid exposing symlink targets outside the hosted content folder.
        root = Path(self.directory).resolve()
        if not path.resolve().is_relative_to(root):
            self.send_error(HTTPStatus.FORBIDDEN)
            return None
        if path.is_dir():
            self.send_error(HTTPStatus.NOT_FOUND, "No directory listing")
            return None
        try:
            source = path.open("rb")
        except OSError:
            self.send_error(HTTPStatus.NOT_FOUND)
            return None
        size = path.stat().st_size
        start, end = 0, size - 1
        header = self.headers.get("Range")
        if header:
            match = re.fullmatch(r"bytes=(\d*)-(\d*)", header)
            if not match or (not match[1] and not match[2]):
                source.close(); self.send_error(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE); return None
            if match[1]:
                start = int(match[1]); end = min(size - 1, int(match[2])) if match[2] else size - 1
            else:
                start = max(0, size - int(match[2]))
            if start >= size or start > end:
                source.close(); self.send_response(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                self.send_header("Content-Range", f"bytes */{size}"); self.send_header("Content-Length", "0"); self.end_headers(); return None
        self.send_response(HTTPStatus.PARTIAL_CONTENT if header else HTTPStatus.OK)
        self.send_header("Content-Type", self.guess_type(str(path)))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(max(0, end - start + 1)))
        self.send_header("Cache-Control", "no-cache")
        if header:
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.end_headers()
        source.seek(start); self.range_end = max(0, end - start + 1)
        return source

    def copyfile(self, source, outputfile):
        remaining = self.range_end
        while remaining and remaining > 0:
            data = source.read(min(1024 * 256, remaining))
            if not data: break
            outputfile.write(data); remaining -= len(data)

    def log_message(self, format, *args):
        print(format % args)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--directory", type=Path, default=Path("builds/chapter-server"))
    parser.add_argument("--bind", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8088)
    args = parser.parse_args()
    if not args.directory.is_dir():
        parser.exit(1, "No cooked chapter server folder exists. Prepare real paks first.\n")
    handler = functools.partial(ChapterHandler, directory=str(args.directory.resolve()))
    with ThreadingHTTPServer((args.bind, args.port), handler) as server:
        print(f"Chapter development server: http://{args.bind}:{args.port}/content/")
        try: server.serve_forever()
        except KeyboardInterrupt: pass

if __name__ == "__main__": main()
