"""Export the exact authored native specs as deterministic, articulated GLB 2.0.

No Unreal calls, imports of old assets, simplification, or external dependencies.
Uses installed Unreal FRotator::Quaternion conventions, preserved shape topology,
42-degree split normals, named rigid joints and one primitive per part/material.
Native shader noise is approximated by restrained deterministic vertex modulation.
"""
import array
import hashlib
import json
import math
from pathlib import Path
import struct
import sys

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"tools"))
import reforged_characters as characters
import reforged_enemies as enemies
import reforged_world as world
import reforged_geometry as geometry
import reforged_motion as motion

OUT=ROOT/"assets/exports/reforged"
ANCHORS={
    'RelicMarshal':{'reactor':[0,186,-40.2],'muzzle':[-64,143,-68.5]},
    'GearlingSentinel':{'muzzle':[0,138,-61.5],'visor':[0,85,-38]},
    'RustCrawler':{'muzzle':[0,110,-100.5]},
    'ArcWarden':{'reactor':[0,201,-43],'muzzle':[-65,149,-80]},
    'ForgeColossus':{'reactor':[0,401,-74],
        'muzzleL':[-133,291,-126],'muzzleR':[133,291,-126],
        'rocketL':[-153,532,-31],'rocketR':[153,532,-31]},
    'AegisVanguard':{'reactor':[0,192,-42],'muzzle':[-76,146,-84.5]},
    'RelicLauncher':{'muzzle':[0,176,-214.5]},
}
PALETTE={
    'ivory':(0xE2DDD0,.34,.18,.045),'teal':(0x237F8C,.31,.3,.045),
    'bronze':(0xB69360,.29,.64,.045),'dark':(0x34444F,.52,.3,.065),
    'steel':(0x8CABB4,.31,.65,.035),'red':(0xAC3C41,.36,.3,.04),
    'rust':(0xAB4D38,.4,.32,.045),'rubber':(0x18242C,.75,.02,.035),
    'cyan':(0x40DDEE,.32,.12,2.3),'amber':(0xFFAD32,.36,.1,2.1),
    'redglow':(0xFF4630,.3,.1,2.1)}


def sub(a,b):return [a[i]-b[i] for i in range(3)]
def add(a,b):return [a[i]+b[i] for i in range(3)]
def cross(a,b):return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
def dot(a,b):return sum(x*y for x,y in zip(a,b))
def unit(a):
    length=math.sqrt(dot(a,a));assert length>1e-20
    return [v/length for v in a]
def mapped(p):return [p[0]/100,p[2]/100,-p[1]/100]


def unreal_quaternion(r):
    # EXACT FRotator3d::Quaternion in installed UE5.8 UnrealMath.cpp.
    sp,sy,sr=[math.sin(math.radians(v)/2) for v in r]
    cp,cy,cr=[math.cos(math.radians(v)/2) for v in r]
    return [cr*sp*sy-sr*cp*cy,-cr*sp*cy-sr*cp*sy,
            cr*cp*sy-sr*sp*cy,cr*cp*cy+sr*sp*sy]


def rotate(v,q):
    xyz=q[:3];t=[2*x for x in cross(xyz,v)];second=cross(xyz,t)
    return [v[i]+q[3]*t[i]+second[i] for i in range(3)]


def gltf_quaternion(r):
    # Basis conversion C=(x,z,-y), a proper rotation (det=+1).
    x,y,z,w=unreal_quaternion(r)
    return [x,z,-y,w]


def rgb(hexcode):
    def linear(x):
        x=x/255;return x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4
    return [linear((hexcode>>s)&255) for s in(16,8,0)]


def material(name):
    color,rough,metal,emission=PALETTE[name];tint=rgb(color)
    m={'name':name,'pbrMetallicRoughness':{'baseColorFactor':tint+[1],
       'metallicFactor':metal,'roughnessFactor':rough},'doubleSided':False,
       'emissiveFactor':[v*min(emission,1) for v in tint]}
    if emission>1:m['extensions']={'KHR_materials_emissive_strength':{'emissiveStrength':emission}}
    return m


def split_normals(vs,faces):
    """42-degree edge-local smoothing groups, retaining hard bevel boundaries."""
    raw=[];norm=[];incident=[[] for _ in vs];edges={}
    for fi,(a,b,c) in enumerate(faces):
        n=cross(sub(vs[b],vs[a]),sub(vs[c],vs[a]));raw.append(n);norm.append(unit(n))
        for v in(a,b,c):incident[v].append(fi)
        for a,b in((a,b),(b,c),(c,a)):edges.setdefault(tuple(sorted((a,b))),[]).append(fi)
    smooth=[[] for _ in vs];threshold=math.cos(math.radians(42))
    for edge,fs in edges.items():
        assert len(fs)==2,'All authored surfaces must remain closed'
        if dot(norm[fs[0]],norm[fs[1]])>=threshold:
            for v in edge:smooth[v].append(fs)
    out_v=[];out_n=[];mapping={}
    for vertex,fs in enumerate(incident):
        parents={f:f for f in fs}
        def find(f):
            while parents[f]!=f:parents[f]=parents[parents[f]];f=parents[f]
            return f
        for fa,fb in smooth[vertex]:parents[find(fb)]=find(fa)
        groups={}
        for f in fs:groups.setdefault(find(f),[]).append(f)
        for members in groups.values():
            index=len(out_v);out_v.append(vs[vertex])
            out_n.append(unit([sum(raw[f][i] for f in members) for i in range(3)]))
            for f in members:mapping[(vertex,f)]=index
    indices=[mapping[(v,fi)] for fi,face in enumerate(faces) for v in face]
    assert len(indices)==len(faces)*3
    return out_v,out_n,indices


class GLB:
    def __init__(self,name):
        self.data={'asset':{'version':'2.0','generator':'Mechalord exact native-spec exporter'},
          'scene':0,'scenes':[{'name':name,'nodes':[0]}],
          'nodes':[{'name':name,'children':[]}],'meshes':[],
          'materials':[material(n) for n in PALETTE],
          'buffers':[{'byteLength':0}],'bufferViews':[],'accessors':[],
          'extensionsUsed':['KHR_materials_emissive_strength']}
        self.binary=bytearray()
    def accessor(self,values,width,component=5126,target=34962,bounds=False):
        while len(self.binary)%4:self.binary.append(0)
        offset=len(self.binary);flat=[x for row in values for x in row] if width>1 else values
        payload=array.array('f' if component==5126 else 'I',flat)
        if sys.byteorder!='little':payload.byteswap()
        self.binary.extend(payload.tobytes())
        view=len(self.data['bufferViews']);self.data['bufferViews'].append({
            'buffer':0,'byteOffset':offset,'byteLength':len(payload)*4,'target':target})
        a={'bufferView':view,'componentType':component,'count':len(values),
           'type':{1:'SCALAR',3:'VEC3'}[width]}
        if bounds:
            a['min']=[min(v[i] for v in values) for i in range(width)]
            a['max']=[max(v[i] for v in values) for i in range(width)]
        result=len(self.data['accessors']);self.data['accessors'].append(a);return result
    def write(self,path):
        while len(self.binary)%4:self.binary.append(0)
        self.data['buffers'][0]['byteLength']=len(self.binary)
        encoded=json.dumps(self.data,separators=(',',':')).encode()
        encoded+=b' '*((-len(encoded))%4)
        total=12+8+len(encoded)+8+len(self.binary)
        path.write_bytes(struct.pack('<III',0x46546C67,2,total)+
            struct.pack('<II',len(encoded),0x4E4F534A)+encoded+
            struct.pack('<II',len(self.binary),0x004E4942)+self.binary)


def export(asset):
    glb=GLB(asset['name']);source_parts={p['id']:p for p in asset['parts']}
    assert len(source_parts)==len(asset['parts'])
    node_indices={p['id']:i+1 for i,p in enumerate(asset['parts'])}
    bounds_min=[math.inf]*3;bounds_max=[-math.inf]*3;parts=[];total_vertices=0;total_triangles=0;total_primitives=0
    for p in asset['parts']:
        groups={}
        for s in p['shapes']:
            geometry.validate_surface(s)
            verts,faces=geometry.mesh_for(s)
            local,normals,indices=split_normals(verts,faces)
            q=unreal_quaternion(s.get('r',[0,0,0]));group=groups.setdefault(s['mat'],{'p':[],'n':[],'c':[],'i':[]})
            offset=len(group['p']);group['i'].extend(i+offset for i in indices)
            for v,n in zip(local,normals):
                absolute=add(rotate(v,q),s['p']);point=mapped(sub(absolute,p['pivot']))
                group['p'].append(point);group['n'].append(unit(mapped(rotate(n,q))))
                # Native noise in .94..1.0, kept quiet to avoid visible speckles.
                noise=.97+.015*math.sin(absolute[0]*.25+math.sin(absolute[1]*.31)+absolute[2]*.27)
                group['c'].append([noise]*3)
                world_p=mapped(absolute)
                for i in range(3):bounds_min[i]=min(bounds_min[i],world_p[i]);bounds_max[i]=max(bounds_max[i],world_p[i])
        primitives=[];triangles=0;vertices=0
        for name,g in groups.items():
            assert all(math.isfinite(v) for key in('p','n','c') for row in g[key] for v in row)
            assert min(g['i'])>=0 and max(g['i'])<len(g['p'])
            pos=glb.accessor(g['p'],3,bounds=True);normal=glb.accessor(g['n'],3);color=glb.accessor(g['c'],3)
            index=glb.accessor(g['i'],1,5125,34963)
            primitives.append({'attributes':{'POSITION':pos,'NORMAL':normal,'COLOR_0':color},
                'indices':index,'material':list(PALETTE).index(name),'mode':4})
            triangles+=len(g['i'])//3;vertices+=len(g['p'])
        mesh_index=len(glb.data['meshes']);glb.data['meshes'].append({'name':p['id']+'Mesh','primitives':primitives})
        parent=source_parts[p['parent']]['pivot'] if p['parent'] else [0,0,0]
        node={'name':p['id'],'mesh':mesh_index,'translation':mapped(sub(p['pivot'],parent))}
        children=[node_indices[q['id']] for q in asset['parts'] if q['parent']==p['id']]
        if children:node['children']=children
        glb.data['nodes'].append(node)
        if not p['parent']:glb.data['nodes'][0]['children'].append(node_indices[p['id']])
        all_points=[v for g in groups.values() for v in g['p']]
        local_bounds={'min':[min(v[i] for v in all_points) for i in range(3)],
                      'max':[max(v[i] for v in all_points) for i in range(3)]}
        parts.append({'id':p['id'],'parent':p['parent'],'pivotM':mapped(p['pivot']),
            'localPivotM':node['translation'],'localBoundsM':local_bounds,
            'triangles':triangles,'vertices':vertices,'materials':list(groups)})
        total_triangles+=triangles;total_vertices+=vertices;total_primitives+=len(primitives)
    offset=[0,-bounds_min[1],0] if asset['category']=='character' else [0,0,0]
    glb.data['nodes'][0]['translation']=offset
    for p in parts:
        p['pivotM']=add(p['pivotM'],offset)
        p['boundsM']={key:add(v,p['pivotM']) for key,v in p['localBoundsM'].items()}
    minimum=add(bounds_min,offset);maximum=add(bounds_max,offset)
    filename=asset['name']+'.glb';path=OUT/filename;glb.write(path)
    validate_glb(path)
    return {'file':filename,'name':asset['name'],'category':asset['category'],
        'boundsM':{'min':minimum,'max':maximum},'heightM':maximum[1]-minimum[1],
        'sourceBoundsM':{'min':bounds_min,'max':bounds_max},'originOffsetM':offset,
        'anchorsM':{name:add(mapped(v),offset) for name,v in ANCHORS.get(asset['name'],{}).items()},
        'triangles':total_triangles,'vertices':total_vertices,'primitives':total_primitives,
        'parts':parts,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}


def validate_glb(path):
    """Read back serialized buffers, rather than only checking in-memory arrays."""
    raw=path.read_bytes();magic,version,length=struct.unpack_from('<III',raw)
    assert (magic,version,length)==(0x46546C67,2,len(raw))
    size,kind=struct.unpack_from('<II',raw,12);assert kind==0x4E4F534A
    d=json.loads(raw[20:20+size]);binary_offset=28+size
    binary_length,binary_kind=struct.unpack_from('<II',raw,20+size)
    assert binary_kind==0x004E4942 and binary_offset+binary_length==len(raw)
    assert d['buffers'][0]['byteLength']==binary_length
    for a in d['accessors']:
        view=d['bufferViews'][a['bufferView']];components=1 if a['type']=='SCALAR' else 3
        assert view['byteOffset']+a['count']*components*4<=binary_length
        if a['componentType']==5126:
            values=struct.unpack_from('<'+'f'*(a['count']*components),raw,binary_offset+view['byteOffset'])
            assert all(math.isfinite(v) for v in values)
    for mesh in d['meshes']:
        for p in mesh['primitives']:
            a=d['accessors'][p['indices']];v=d['bufferViews'][a['bufferView']]
            indices=struct.unpack_from('<'+'I'*a['count'],raw,binary_offset+v['byteOffset'])
            assert a['count']%3==0 and max(indices)<d['accessors'][p['attributes']['POSITION']]['count']
    parents={}
    for i,n in enumerate(d['nodes']):
        for child in n.get('children',[]):
            assert child not in parents and child<len(d['nodes']);parents[child]=i
    assert set(parents)==set(range(1,len(d['nodes'])))
    for i in range(1,len(d['nodes'])):
        seen=set()
        while i:
            assert i not in seen;seen.add(i);i=parents[i]
    return d


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    specs=characters.get_assets()+enemies.get_assets()+world.get_assets()
    manifest={'format':1,'units':'metres','up':'+Y','forward':'+Z',
        'conversion':'source centimetres (x,y,z) -> glTF metres (x,z,-y)/100',
        'rotation':'Exact Unreal FRotator quaternion, basis-conjugated to glTF',
        'geometry':'Exact source masters; no simplification; normals split at42 degrees',
        'materials':'Native palette/PBR parameters; procedural noise approximated with subtle vertex modulation',
        'palette':{name:{'linearRGB':rgb(v[0]),'roughness':v[1],'metalness':v[2],'emission':v[3]} for name,v in PALETTE.items()},
        'runtimePerformanceValidated':False,'assets':{}}
    for a in specs:
        m=export(a);manifest['assets'][a['name']]=m
        print(a['name'],m['triangles'],'triangles',m['primitives'],'primitives',m['bytes'],'bytes',flush=True)
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    levels=[]
    for level in world.get_levels():
        d={k:v for k,v in level.items() if k not in('placements','cameras')}
        d['placements']=[{'asset':p['asset'],'label':p['label'],'p':mapped(p['p']),
            'quaternion':gltf_quaternion(p['r']),'scale':[p['scale'][0],p['scale'][2],p['scale'][1]],
            'source':p} for p in level['placements']]
        d['cameras']=[{**v,'p':mapped(v['p']),'target':mapped(v['target'])} for v in level['cameras']]
        levels.append(d)
    (OUT/'world-layouts.json').write_text(json.dumps({'format':1,'units':'metres','up':'+Y',
        'forward':'+Z','artDirection':world.ART_DIRECTION,'levels':levels},indent=2),encoding='utf-8')
    (OUT/'source-specs.json').write_text(json.dumps(specs,separators=(',',':')),encoding='utf-8')
    motion_data={'format':1,'frames':240,'fps':30,'loopSeconds':8,
        'usage':'Inspection choreography only; do not treat its recoil as authoritative combat events.',
        'sourceChannelConvention':'Location cm; Rotation.X/Y/Z = Unreal roll/pitch/yaw degrees, additive to rest.',
        'gltfChannelConvention':'Sampled metre offsets and quaternion rotations, additive to named part rest translation.',
        'assets':{}}
    def sample(keys,frame):
        for (a,va),(b,vb) in zip(keys,keys[1:]):
            if a<=frame<=b:return va+(vb-va)*(frame-a)/(b-a)
        return keys[-1][1]
    for asset in specs:
        parts={}
        for part in asset['parts']:
            tracks=motion.get_motion(asset['name'],part['id'])
            if not tracks:continue
            translations=[];rotations=[]
            for f in range(241):
                values={channel:sample(keys,f) for channel,keys in tracks.items()}
                translations.append(mapped([values.get('Location.'+axis,0) for axis in('X','Y','Z')]))
                rotations.append(gltf_quaternion([values.get('Rotation.Y',0),values.get('Rotation.Z',0),values.get('Rotation.X',0)]))
            parts[part['id']]={'sourceTracks':tracks,'translationOffsetsM':translations,'rotationQuaternions':rotations}
        if parts:motion_data['assets'][asset['name']]=parts
    (OUT/'motion-data.json').write_text(json.dumps(motion_data,separators=(',',':')),encoding='utf-8')
    print('Export complete:',len(specs),'assets',flush=True)


if __name__=='__main__':main()
