"""Close the TRELLIS geometry's fragmented shells; never edits source imagery."""
import json,struct,time
from pathlib import Path
import numpy as np
from scipy import ndimage as ndi
from trellis_mesh_preview import read_geometry,digest,memory
root=Path(__file__).resolve().parents[1]
source=root/'assets/experiments/trellis-local/relic-marshal-vulkan-quality12.glb'
out=root/'assets/source/relic-marshal-repaired-v2';out.mkdir(parents=True,exist_ok=True)
start=time.time();p,_=read_geometry(source)
lo=p.min(0);hi=p.max(0);spacing=float((hi-lo).max())/320
origin=lo-5*spacing;shape=np.ceil((hi-origin)/spacing).astype(int)+6
grid=np.zeros(tuple(shape),dtype=bool)
for first in range(0,len(p),100000):
 ijk=np.floor((p[first:first+100000]-origin)/spacing).astype(np.int32)
 grid[ijk[:,0],ijk[:,1],ijk[:,2]]=True
samples=int(grid.sum())
# Fill sub-centimetre splits, then fill enclosed armor volumes. Closing is
# volumetric; it does not merely merge triangle vertices across open sheets.
grid=ndi.binary_dilation(grid,iterations=1)
grid=ndi.binary_closing(grid,structure=ndi.generate_binary_structure(3,2),iterations=2)
grid=ndi.binary_fill_holes(grid)
labels,n=ndi.label(grid);counts=np.bincount(labels.ravel());keep=counts>=40;keep[0]=False;grid=keep[labels];del labels
quads=[]
corners={
 (0,-1):[(0,0,0),(0,0,1),(0,1,1),(0,1,0)],
 (0,1):[(1,0,0),(1,1,0),(1,1,1),(1,0,1)],
 (1,-1):[(0,0,0),(1,0,0),(1,0,1),(0,0,1)],
 (1,1):[(0,1,0),(0,1,1),(1,1,1),(1,1,0)],
 (2,-1):[(0,0,0),(0,1,0),(1,1,0),(1,0,0)],
 (2,1):[(0,0,1),(1,0,1),(1,1,1),(0,1,1)]}
base=int(shape.max())+2
for (axis,direction),offsets in corners.items():
 exposed=grid & ~np.roll(grid,-direction,axis=axis)
 cells=np.argwhere(exposed).astype(np.int64)
 vertices=cells[:,None,:]+np.array(offsets)[None,:,:]
 quads.append(vertices[:,:,0]+base*vertices[:,:,1]+base*base*vertices[:,:,2])
codes=np.concatenate(quads);unique,indices=np.unique(codes,return_inverse=True);faces=indices.reshape(-1,4).astype('<i4')
v=np.stack([unique%base,(unique//base)%base,unique//(base*base)],axis=1).astype(np.float32)*spacing+origin
# GLTF Y-up -> Blender Z-up, retaining raw +X front.
v=np.stack([v[:,0],-v[:,2],v[:,1]],axis=1).astype('<f4')
path=out/'closed-surface.ply'
with path.open('wb') as f:
 f.write(f'ply\nformat binary_little_endian 1.0\nelement vertex {len(v)}\nproperty float x\nproperty float y\nproperty float z\nelement face {len(faces)}\nproperty list uchar int vertex_indices\nend_header\n'.encode());f.write(v.tobytes())
 packed=np.empty(len(faces),dtype=[('n','u1'),('indices','<i4',(4,))]);packed['n']=4;packed['indices']=faces;f.write(packed.tobytes())
report={'sourceSha256':digest(source),'sourceUnchanged':True,'resolution':320,'spacingSourceUnits':spacing,'sampleVoxels':samples,'closedVoxels':int(grid.sum()),'vertices':len(v),'quads':len(faces),'method':'Dense surface occupancy, one-voxel dilation, two-iteration morphological closing, enclosed-volume fill and small-component removal','durationSeconds':round(time.time()-start,2),**memory()}
(out/'surface-rebuild.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
