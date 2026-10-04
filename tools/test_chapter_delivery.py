"""Host-tool regression tests. Synthetic bytes below are NOT cooked game content."""
import copy
import functools
import json
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path
from chapter_delivery import build, verify, validate_descriptor, PAK_MAGIC
from chapter_server import ChapterHandler

class DeliveryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.pak = self.root / "pakchunk1001-Android.pak"
        self.pak.write_bytes(b"NOT REAL COOKED CONTENT: UNIT TEST FIXTURE\n" + bytes(range(256)) + PAK_MAGIC)
        self.descriptor = build([self.pak], self.root / "content", "test-build", "Android")
        self.data = json.loads(self.descriptor.read_text())
    def tearDown(self): self.temp.cleanup()
    def test_manifest_roundtrip(self):
        self.assertEqual(verify(self.descriptor,"test-build","Android"),self.data)
        text=(self.descriptor.parent/"BuildManifest-Android.txt").read_text()
        self.assertIn("\t1001\t/Android/",text)
        self.assertIn("\tSHA1:",text)
    def test_wrong_build(self):
        with self.assertRaises(ValueError): verify(self.descriptor,"another-build","Android")
    def test_wrong_platform(self):
        with self.assertRaises(ValueError): verify(self.descriptor,"test-build","IOS")
    def test_missing_pack(self):
        (self.descriptor.parent/"Android"/self.pak.name).unlink()
        with self.assertRaises(ValueError): verify(self.descriptor)
    def test_corruption_same_size(self):
        path=self.descriptor.parent/"Android"/self.pak.name
        data=bytearray(path.read_bytes());data[10]^=1;path.write_bytes(data)
        with self.assertRaisesRegex(ValueError,"integrity"):verify(self.descriptor)
    def test_truncated_pack(self):
        path=self.descriptor.parent/"Android"/self.pak.name;path.write_bytes(path.read_bytes()[:-1])
        with self.assertRaises(ValueError):verify(self.descriptor)
    def test_modified_manifest(self):
        manifest=self.descriptor.parent/"BuildManifest-Android.txt"
        manifest.write_text(manifest.read_text().replace("\t1001\t","\t0\t"))
        with self.assertRaisesRegex(ValueError,"manifest"):verify(self.descriptor)
    def test_invalid_descriptor_fields(self):
        for key,value in (("schema",2),("buildId","../unsafe"),("platform","Android/../Windows"),("chunkId",0),("downloadBytes",100_000_000),("downloadBytes",300.5),("downloadBytes",True),("files",[])):
            with self.subTest(key=key,value=value):
                data=copy.deepcopy(self.data);data[key]=value
                with self.assertRaises(ValueError):validate_descriptor(data)
    def test_invalid_file_fields(self):
        for key,value in (("name","../bad.pak"),("name","x\\bad.pak"),("name","asset.glb"),("sha1","g"*40),("bytes",0),("bytes",1.5),("bytes",True)):
            with self.subTest(key=key,value=value):
                data=copy.deepcopy(self.data);data["files"][0][key]=value
                with self.assertRaises(ValueError):validate_descriptor(data)
    def test_duplicate_pack(self):
        data=copy.deepcopy(self.data);data["files"]*=2;data["downloadBytes"]*=2
        with self.assertRaises(ValueError):validate_descriptor(data)
    def test_size_mismatch(self):
        data=copy.deepcopy(self.data);data["downloadBytes"]+=1
        with self.assertRaises(ValueError):validate_descriptor(data)
    def test_no_fabricated_pack(self):
        self.pak.write_bytes(b"plain-text placeholder")
        with self.assertRaisesRegex(ValueError,"trailer"):build([self.pak],self.root/"other","test-build","Android")
    def test_base_chunk_rejected(self):
        base=self.root/"pakchunk0-Android.pak";base.write_bytes(self.pak.read_bytes())
        with self.assertRaisesRegex(ValueError,"chunk 1001"):build([base],self.root/"other","test-build","Android")

class QuietHandler(ChapterHandler):
    def log_message(self,*args):pass

class ServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp=tempfile.TemporaryDirectory();cls.root=Path(cls.temp.name)
        cls.data=bytes(range(256))*5;(cls.root/"pack.pak").write_bytes(cls.data)
        cls.server=ThreadingHTTPServer(("127.0.0.1",0),functools.partial(QuietHandler,directory=str(cls.root)))
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
        cls.url=f"http://127.0.0.1:{cls.server.server_port}"
    @classmethod
    def tearDownClass(cls):cls.server.shutdown();cls.server.server_close();cls.thread.join();cls.temp.cleanup()
    def fetch(self,path="/pack.pak",byte_range=None,method="GET"):
        return urllib.request.urlopen(urllib.request.Request(self.url+path,headers={"Range":byte_range} if byte_range else {},method=method),timeout=3)
    def test_full_download(self):
        with self.fetch() as response:self.assertEqual(response.read(),self.data);self.assertEqual(response.status,200)
    def test_resume_range(self):
        with self.fetch(byte_range="bytes=100-") as response:
            self.assertEqual(response.status,206);self.assertEqual(response.read(),self.data[100:]);self.assertEqual(response.headers["Content-Range"],"bytes 100-1279/1280")
    def test_closed_range(self):
        with self.fetch(byte_range="bytes=20-49") as response:self.assertEqual(response.read(),self.data[20:50])
    def test_suffix_range(self):
        with self.fetch(byte_range="bytes=-25") as response:self.assertEqual(response.read(),self.data[-25:])
    def test_head(self):
        with self.fetch(method="HEAD") as response:self.assertEqual(response.read(),b"");self.assertEqual(int(response.headers["Content-Length"]),1280)
    def test_bad_ranges(self):
        for value in ("bytes=9999-","bytes=80-20","bytes=-","bytes=0-10,20-30"):
            with self.subTest(value=value):
                with self.assertRaises(urllib.error.HTTPError) as caught:self.fetch(byte_range=value)
                self.assertEqual(caught.exception.code,416)
    def test_missing(self):
        with self.assertRaises(urllib.error.HTTPError) as caught:self.fetch("/missing.pak")
        self.assertEqual(caught.exception.code,404)
    def test_directory_listing_disabled(self):
        with self.assertRaises(urllib.error.HTTPError) as caught:self.fetch("/")
        self.assertEqual(caught.exception.code,404)

if __name__=="__main__":unittest.main(verbosity=2)
