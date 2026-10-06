import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export const FOUNDARY_SOURCES=['CoolingStack','ReactorBank','ArticulatedServiceArm','CitadelSpire','DistantFoundryWorks','DistantTransferGallery'] as const;
type Batch={mesh:T.InstancedMesh;used:number};
/** Reuses only original Reforged environment geometry, outside the accepted collision lanes. */
export class FoundryDressing {
 readonly root=new T.Group();private banks:Batch[][]=[];private materials:T.Material[]=[];private stamp=new T.Object3D();private ready=false;private age=0;
 constructor(scene:T.Scene){this.root.name='RecoveredReforged_IndustrialLandmarks';scene.add(this.root);}
 async load(library?:Map<string,T.Object3D>){
  const loader=new GLTFLoader();const sources=await Promise.all(FOUNDARY_SOURCES.map(async name=>library?.get(name)??(await loader.loadAsync('environment/'+name+'.glb')).scene));
  const body=new T.MeshStandardMaterial({vertexColors:true,roughness:.73,metalness:.24}),glow=new T.MeshBasicMaterial({vertexColors:true,toneMapped:false});this.materials.push(body,glow);
  for(let k=0;k<sources.length;k++){
   const src=sources[k],buckets:T.BufferGeometry[][]=[[],[]];src.updateMatrixWorld(true);
   const sourceGeometries=new Set<T.BufferGeometry>(),sourceMaterials=new Set<T.Material>();
   src.traverse((o:any)=>{if(!o.isMesh)return;const material=(Array.isArray(o.material)?o.material[0]:o.material) as T.MeshStandardMaterial;
    sourceGeometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach((m:T.Material)=>sourceMaterials.add(m));
    const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);const p=g.attributes.position,old=g.attributes.color,col=new Float32Array(p.count*3),emission=Math.max(material.emissive?.r??0,material.emissive?.g??0,material.emissive?.b??0)*(material.emissiveIntensity??0),c=material.color??new T.Color(0xffffff);
    for(let i=0;i<p.count;i++){const wear=.88+.10*Math.sin(p.getY(i)*15+p.getZ(i)*8);col[i*3]=c.r*(old?.getX(i)??1)*wear;col[i*3+1]=c.g*(old?.getY(i)??1)*wear;col[i*3+2]=c.b*(old?.getZ(i)??1)*wear;}
    g.deleteAttribute('uv');g.deleteAttribute('uv1');g.deleteAttribute('tangent');g.setAttribute('color',new T.BufferAttribute(col,3));buckets[emission>.5?1:0].push(g);
   });
   const bank:Batch[]=[];for(let i=0;i<2;i++)if(buckets[i].length){const geometry=mergeGeometries(buckets[i],false);if(!geometry)throw new Error('Environment material batch mismatch');buckets[i].forEach(g=>g.dispose());geometry.computeBoundingBox();const mesh=new T.InstancedMesh(geometry,i?glow:body,8);mesh.name=FOUNDARY_SOURCES[k]+(i?'_glow':'_steel');mesh.count=0;mesh.frustumCulled=false;mesh.castShadow=!i;mesh.receiveShadow=true;this.root.add(mesh);bank.push({mesh,used:0});}this.banks.push(bank);
   sourceGeometries.forEach(g=>g.dispose());sourceMaterials.forEach(m=>m.dispose());
  }this.ready=true;this.update(0,0,0,true);
 }
 private emit(type:number,x:number,z:number,scale:number,yaw:number,y=0){for(const b of this.banks[type]){if(b.used>=8)continue;this.stamp.position.set(x,y,z);this.stamp.rotation.set(0,yaw,0);this.stamp.scale.setScalar(scale);this.stamp.updateMatrix();b.mesh.setMatrixAt(b.used++,this.stamp.matrix);}}
 update(travel:number,stage:number,dt:number,visible=true){if(!this.ready)return;this.root.visible=visible;if(!visible)return;this.age+=Math.max(0,dt);for(const bank of this.banks)for(const b of bank)b.used=0;
  const anchor=Math.floor(travel/28),offset=travel%28;
  for(let i=0;i<4;i++){
   const section=anchor+i,z=12-i*28+offset,side=section%2?1:-1,type=stage===4?(section%3===0?3:1):stage===3?(section%3===0?1:0):section%3;
   this.emit(type,side*(type===3?10.5:10.2),z,.78,side<0?Math.PI/2:-Math.PI/2,-.10);
   // Sparse high silhouettes and transfer galleries create a world beyond the road.
   this.emit(section%2?4:5,-side*19,z-11,1.1,side<0?Math.PI/2:-Math.PI/2,-3.8);
  }
  for(const bank of this.banks)for(const b of bank){b.mesh.count=b.used;b.mesh.visible=b.used>0;b.mesh.instanceMatrix.needsUpdate=true;}
 }
 get stats(){return {batches:this.banks.reduce((n,b)=>n+b.length,0),visibleInstances:this.banks.reduce((n,b)=>n+b.reduce((s,e)=>s+e.used,0),0)};}
 dispose(){this.root.removeFromParent();for(const bank of this.banks)for(const b of bank){b.mesh.geometry.dispose();b.mesh.dispose();}this.materials.forEach(m=>m.dispose());this.banks=[];this.ready=false;}
}
