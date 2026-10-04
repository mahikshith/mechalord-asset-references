"""Check the shipped binary mesh buffers, weights, textures and original hash."""
import hashlib, struct, json, math, io
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
def inspect(path,expected,rigged=False):
 raw=path.read_bytes();magic,version,length=struct.unpack_from('<III',raw)
 assert magic==0x46546c67 and version==2 and length==len(raw)
 n,kind=struct.unpack_from('<II',raw,12);assert kind==0x4e4f534a
 doc=json.loads(raw[20:20+n]);offset=20+n
 binarySize,binaryKind=struct.unpack_from('<II',raw,offset);assert binaryKind==0x004e4942
 binary=raw[offset+8:offset+8+binarySize]
 def accessor(index):
  a=doc['accessors'][index];view=doc['bufferViews'][a['bufferView']]
  count={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
  fmt={5120:'b',5121:'B',5122:'h',5123:'H',5125:'I',5126:'f'}[a['componentType']]
  unit=struct.calcsize('<'+fmt*count);stride=view.get('byteStride',unit)
  start=view.get('byteOffset',0)+a.get('byteOffset',0)
  assert start+(a['count']-1)*stride+unit<=len(binary)
  values=[struct.unpack_from('<'+fmt*count,binary,start+i*stride) for i in range(a['count'])]
  if a.get('normalized'):
   scale={5121:255,5123:65535}[a['componentType']]
   values=[tuple(v/scale for v in row) for row in values]
  return values
 triangles=0;weightedVertices=0
 for mesh in doc['meshes']:
  for p in mesh['primitives']:
   positions=accessor(p['attributes']['POSITION'])
   assert all(math.isfinite(x) for row in positions for x in row)
   indices=accessor(p['indices']);assert len(indices)%3==0
   assert all(0<=i[0]<len(positions) for i in indices)
   triangles+=len(indices)//3
   if rigged:
    weights=accessor(p['attributes']['WEIGHTS_0']);joints=accessor(p['attributes']['JOINTS_0'])
    assert len(weights)==len(positions)==len(joints)
    assert all(all(math.isfinite(w) and w>=0 for w in row) and abs(sum(row)-1)<.001 for row in weights)
    assert all(all(0<=j<len(doc['skins'][0]['joints']) for j in row) for row in joints)
    weightedVertices+=len(weights)
 assert triangles==expected,(path.name,triangles,expected)
 assert len(doc['materials'])==1
 for im in doc['images']:
  assert 'uri' not in im,'Textures must be embedded for self-contained delivery'
  view=doc['bufferViews'][im['bufferView']];start=view.get('byteOffset',0)
  picture=Image.open(io.BytesIO(binary[start:start+view['byteLength']]))
  assert picture.size==(1024,1024)
 clips=[a.get('name') for a in doc.get('animations',[])]
 if rigged:assert set(clips)=={'Idle','Run'} and len(doc['skins'])==1
 return {'file':str(path.relative_to(ROOT)),'triangles':triangles,'weightedExportVertices':weightedVertices,'clips':clips,'passed':True}
original=ROOT/'assets/originals/sample-huggingface.glb'
assert hashlib.sha256(original.read_bytes()).hexdigest()=='e8e0761aacccc2559466b480773ac297c5b080cc8394f3f56cec3ddf478478a3'
results=[]
for suffix,count,rigged in [('source',19537,False),('mobile',3980,False),('lod1',1980,False),('rigged-source',19537,True),('rigged-mobile',3980,True)]:
 results.append(inspect(ROOT/f'assets/exports/relic-marshal-hf-{suffix}.glb',count,rigged))
report={'originalPreserved':True,'checks':results,'engineImportVerified':False,
 'notes':'Binary geometry/texture/skin checks passed. Visual joint cleanup and actual engine/device validation remain required.'}
(ROOT/'assets/manifests/commander-export-validation.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
