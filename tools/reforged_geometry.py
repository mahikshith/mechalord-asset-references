"""Original deterministic surface construction; no imported geometry.

Returns closed, outward-wound indexed surfaces. Rotation and material assignment
are performed by the Unreal authoring adapter. All dimensions are centimetres.
"""
import math


def mesh_for(shape):
    vertices, faces = [], []

    def ring(points):
        ids = list(range(len(vertices), len(vertices) + len(points)))
        vertices.extend(points)
        return ids

    def face(ids):
        for i in range(1, len(ids)-1):
            faces.append((ids[0], ids[i], ids[i+1]))

    def bridge(a, b, reverse=False):
        if len(a) == 1:
            polys = [[a[0], b[(j+1)%len(b)], b[j]] for j in range(len(b))]
        elif len(b) == 1:
            polys = [[a[j], a[(j+1)%len(a)], b[0]] for j in range(len(a))]
        else:
            polys = [[a[j],a[(j+1)%len(a)],b[(j+1)%len(a)],b[j]] for j in range(len(a))]
        for poly in polys:
            face(list(reversed(poly)) if reverse else poly)

    def ellipse(z, rx, ry, cx, cy, n):
        if rx < 1e-6 and ry < 1e-6:
            return ring([(cx,cy,z)])
        return ring([(cx+rx*math.cos(j*2*math.pi/n), cy+ry*math.sin(j*2*math.pi/n), z) for j in range(n)])

    kind = shape['type']
    if kind == 'tube':
        n, ro, ri, h = shape['segments'], shape['outer'], shape['inner'], shape['length']/2
        assert ro > ri > 0 and h > 0
        ob, ot = ellipse(-h,ro,ro,0,0,n), ellipse(h,ro,ro,0,0,n)
        ib, it = ellipse(-h,ri,ri,0,0,n), ellipse(h,ri,ri,0,0,n)
        bridge(ob,ot)
        bridge(ib,it,True)
        for j in range(n):
            k=(j+1)%n
            face([ot[j],ot[k],it[k],it[j]])
            face([ob[k],ob[j],ib[j],ib[k]])
    else:
        if kind == 'bevel':
            w,d,h = shape['size']
            b = min(shape['bevel'],w*.24,d*.24,h*.24)
            def octagon(w,d,z):
                c=min(b*2,w*.2,d*.2)
                return ring([(-w/2+c,-d/2,z),(w/2-c,-d/2,z),(w/2,-d/2+c,z),(w/2,d/2-c,z),
                             (w/2-c,d/2,z),(-w/2+c,d/2,z),(-w/2,d/2-c,z),(-w/2,-d/2+c,z)])
            rings=[octagon(w-2*b,d-2*b,-h/2),octagon(w,d,-h/2+b),octagon(w,d,h/2-b),octagon(w-2*b,d-2*b,h/2)]
        elif kind == 'loft':
            rings=[ellipse(*v,shape['segments']) for v in shape['rings']]
        elif kind == 'cone':
            low,high=shape['radii']; h=shape['length']/2
            rings=[ellipse(-h,low,low,0,0,shape['segments']),ellipse(h,high,high,0,0,shape['segments'])]
        elif kind == 'ellipsoid':
            x,y,z=[v/2 for v in shape['size']]
            rings=[]
            for j in range(shape['rings']+1):
                angle=-math.pi/2+math.pi*j/shape['rings']
                r=math.cos(angle) if j not in (0,shape['rings']) else 0
                rings.append(ellipse(z*math.sin(angle),x*r,y*r,0,0,shape['segments']))
        else:
            raise ValueError('Unsupported authored shape: '+kind)
        face(list(reversed(rings[0])))
        for a,b in zip(rings,rings[1:]):
            bridge(a,b)
        face(rings[-1])
    assert len(vertices)>3 and len(faces)>3
    return vertices, faces


def validate_surface(shape):
    """Checks that every surface is closed and has outward volume, not just a count."""
    vs,fs=mesh_for(shape)
    edges={}; volume=0
    for a,b,c in fs:
        va,vb,vc=vs[a],vs[b],vs[c]
        ab=[vb[i]-va[i] for i in range(3)]; ac=[vc[i]-va[i] for i in range(3)]
        cross=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]]
        assert sum(x*x for x in cross)>1e-12, ('degenerate',shape)
        volume+=sum(va[i]*cross[i] for i in range(3))/6
        for x,y in ((a,b),(b,c),(c,a)):
            key=tuple(sorted((x,y))); count,orientation=edges.get(key,(0,0))
            edges[key]=(count+1,orientation+(1 if x<y else -1))
    assert all(c==2 and o==0 for c,o in edges.values()), ('open/nonmanifold',shape)
    assert volume>0, ('inward',shape)
    return len(fs)
