import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

/** Dynamic destructibles and battle scars along the route. Purely visual: props
 * sit on the lane edges, never block or absorb combat, and break from confirmed
 * blasts, EMP shocks or the army trampling through them. Everything lives in
 * route-distance space (renderZ = travel - anchor) so it scrolls with the deck. */
type PropKind=0|1|2; // crate stack, fuel barrel, barricade
type Prop={anchor:number;x:number;kind:PropKind;yaw:number;alive:boolean;jolt:number;};
type Chunk={anchor:number;x:number;y:number;vx:number;vy:number;vz:number;rx:number;ry:number;spin:number;life:number;kind:PropKind;size:number;};
type Scar={anchor:number;x:number;size:number;life:number;};
export interface Blast {x:number;z:number;radius:number;force:number;}
const SECTION=10.8,CHUNKS_PER_PROP=9;

export class BattlefieldDestruction {
 readonly root=new T.Group();
 private props:Prop[]=[];private chunks:Chunk[]=[];private scars:Scar[]=[];private planned=-1;private travel=0;
 private propMeshes:T.InstancedMesh[];private chunkMesh:T.InstancedMesh;private scarMesh:T.InstancedMesh;private stamp=new T.Object3D();private color=new T.Color();
 /** Called for fuel-barrel detonations so the existing combat FX draw the fireball. */
 onExplode?:(x:number,y:number,z:number,strength:number)=>void;
 constructor(scene:T.Scene){
  this.root.name='Battlefield_Destructibles';
  const metal=(c:number)=>new T.MeshStandardMaterial({color:c,roughness:.55,metalness:.45});
  const crate=new RoundedBoxGeometry(.9,.9,.9,2,.06).translate(0,.45,0);
  const barrel=new T.CylinderGeometry(.34,.34,1.0,14).translate(0,.5,0);
  const barricade=new RoundedBoxGeometry(1.5,.75,.42,2,.08).translate(0,.375,0);
  this.propMeshes=[[crate,metal(0x8a6a3c)],[barrel,metal(0xc2412b)],[barricade,metal(0x6f7880)]].map(([g,m])=>{const mesh=new T.InstancedMesh(g as T.BufferGeometry,m as T.Material,48);mesh.castShadow=mesh.receiveShadow=true;mesh.count=0;mesh.frustumCulled=false;this.root.add(mesh);return mesh;});
  (this.propMeshes[1].material as T.MeshStandardMaterial).emissive.set(0x3a0800);
  this.chunkMesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({color:0xffffff,roughness:.6,metalness:.35}),48*CHUNKS_PER_PROP);this.chunkMesh.castShadow=true;this.chunkMesh.count=0;this.chunkMesh.frustumCulled=false;this.root.add(this.chunkMesh);
  const scarTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;const r=g.createRadialGradient(64,64,4,64,64,62);r.addColorStop(0,'rgba(10,8,6,.95)');r.addColorStop(.45,'rgba(25,18,12,.7)');r.addColorStop(1,'rgba(30,20,10,0)');g.fillStyle=r;g.fillRect(0,0,128,128);for(let i=0;i<14;i++){g.strokeStyle='rgba(15,10,8,.6)';g.lineWidth=2;g.beginPath();g.moveTo(64,64);const a=i/14*Math.PI*2+Math.random()*.3;g.lineTo(64+Math.cos(a)*60,64+Math.sin(a)*60);g.stroke();}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;})();
  this.scarMesh=new T.InstancedMesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:scarTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),40);this.scarMesh.count=0;this.scarMesh.frustumCulled=false;this.scarMesh.renderOrder=1;this.root.add(this.scarMesh);
  scene.add(this.root);
 }
 /** Deterministic edge props per route section, so retries look the same. */
 private plan(travel:number){
  const first=Math.floor(travel/SECTION)+1,last=first+9;
  for(let k=Math.max(this.planned+1,first);k<=last;k++){let seed=(k*2654435761)>>>0;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
   const n=1+Math.floor(rnd()*3);for(let i=0;i<n;i++){const side=rnd()<.5?-1:1,kind=Math.floor(rnd()*3) as PropKind;this.props.push({anchor:k*SECTION+rnd()*SECTION,x:side*(3.7+rnd()*.7),kind,yaw:kind===2?side*(.2+rnd()*.3):rnd()*Math.PI,alive:true,jolt:0});}}
  this.planned=Math.max(this.planned,last);
  this.props=this.props.filter(p=>travel-p.anchor<12);
 }
 private renderZ(anchor:number){return this.travel-anchor;}
 /** Break props within a blast; fuel barrels detonate and chain. Returns props broken. */
 blast(b:Blast,depth=0):number{
  let broken=0;for(const p of this.props){if(!p.alive)continue;const dz=this.renderZ(p.anchor)-b.z,dx=p.x-b.x,d=Math.hypot(dx,dz);if(d>b.radius+.5)continue;this.shatter(p,dx/(d||1),dz/(d||1),b.force*(1-d/(b.radius+.6)));broken++;
   if(p.kind===1&&depth<4){const z=this.renderZ(p.anchor);this.scar(p.x,z,2.4);this.onExplode?.(p.x,.7,z,1.8);broken+=this.blast({x:p.x,z,radius:2.2,force:7},depth+1);}}
  return broken;
 }
 /** EMP shock: props hop and spark without breaking, unless very close. */
 shock(x:number,z:number,radius:number){for(const p of this.props){if(!p.alive)continue;const d=Math.hypot(p.x-x,this.renderZ(p.anchor)-z);if(d<radius)p.jolt=Math.max(p.jolt,.45*(1-d/radius)+.15);}}
 scar(x:number,z:number,size:number){if(this.scars.length>=40)this.scars.shift();this.scars.push({anchor:this.travel-z,x,size:size*(.85+Math.random()*.3),life:9});}
 private shatter(p:Prop,nx:number,nz:number,force:number){
  p.alive=false;const z=this.renderZ(p.anchor),f=Math.max(2.5,force);
  for(let i=0;i<CHUNKS_PER_PROP;i++){if(this.chunks.length>=this.chunkMesh.instanceMatrix.count)this.chunks.shift();const a=Math.random()*Math.PI*2;
   this.chunks.push({anchor:this.travel-z,x:p.x+(Math.random()-.5)*.6,y:.3+Math.random()*.6,vx:nx*f*.6+Math.cos(a)*1.6,vy:2.5+Math.random()*f*.7,vz:nz*f*.6+Math.sin(a)*1.6,rx:Math.random()*6,ry:Math.random()*6,spin:(Math.random()-.5)*14,life:2.2+Math.random()*1.2,kind:p.kind,size:.12+Math.random()*.22});}
 }
 /** The army (centre/width in world x) plows through props it reaches. */
 trample(centerX:number,halfWidth:number){for(const p of this.props){if(!p.alive)continue;const z=this.renderZ(p.anchor);if(z>-1.2&&z<1.6&&Math.abs(p.x-centerX)<halfWidth+.5)this.shatter(p,Math.sign(p.x-centerX)||1,-1,5);}}
 reset(){this.props=[];this.chunks=[];this.scars=[];this.planned=-1;this.travel=0;}
 update(travel:number,dt:number,visible:boolean){
  this.root.visible=visible;if(travel<this.travel-1)this.reset();this.travel=travel;this.plan(travel);
  const counts=[0,0,0];
  for(const p of this.props){if(!p.alive)continue;const z=this.renderZ(p.anchor);if(z<-110||z>14)continue;p.jolt=Math.max(0,p.jolt-dt*1.8);const hop=Math.sin(p.jolt*20)*p.jolt*.35;
   this.stamp.position.set(p.x+(Math.random()-.5)*p.jolt*.1,Math.abs(hop),z);this.stamp.rotation.set(hop*.3,p.yaw,0);this.stamp.scale.setScalar(1);this.stamp.updateMatrix();const mesh=this.propMeshes[p.kind];if(counts[p.kind]<mesh.instanceMatrix.count)mesh.setMatrixAt(counts[p.kind]++,this.stamp.matrix);}
  this.propMeshes.forEach((m,i)=>{m.count=counts[i];m.instanceMatrix.needsUpdate=true;});
  let c=0;const tint=[0x8a6a3c,0xb33a26,0x7b848c];
  for(let i=this.chunks.length-1;i>=0;i--){const k=this.chunks[i];k.life-=dt;if(k.life<=0){this.chunks.splice(i,1);continue;}
   k.vy-=18*dt;k.x+=k.vx*dt;k.y+=k.vy*dt;k.anchor-=k.vz*dt;k.rx+=k.spin*dt;k.ry+=k.spin*.7*dt;if(k.y<k.size*.5){k.y=k.size*.5;k.vy=Math.abs(k.vy)*.32;k.vx*=.6;k.vz*=.6;k.spin*=.6;}
   this.stamp.position.set(k.x,k.y,this.renderZ(k.anchor));this.stamp.rotation.set(k.rx,k.ry,0);this.stamp.scale.setScalar(k.size*Math.min(1,k.life*2));this.stamp.updateMatrix();this.chunkMesh.setMatrixAt(c,this.stamp.matrix);this.chunkMesh.setColorAt(c++,this.color.setHex(tint[k.kind]));}
  this.chunkMesh.count=c;this.chunkMesh.instanceMatrix.needsUpdate=true;if(this.chunkMesh.instanceColor)this.chunkMesh.instanceColor.needsUpdate=true;
  let s=0;for(let i=this.scars.length-1;i>=0;i--){const r=this.scars[i];r.life-=dt;if(r.life<=0){this.scars.splice(i,1);continue;}this.stamp.position.set(r.x,.015,this.renderZ(r.anchor));this.stamp.rotation.set(0,r.anchor,0);this.stamp.scale.setScalar(r.size);this.stamp.updateMatrix();this.scarMesh.setMatrixAt(s++,this.stamp.matrix);}
  this.scarMesh.count=s;this.scarMesh.instanceMatrix.needsUpdate=true;
 }
 dispose(){this.root.removeFromParent();for(const m of [...this.propMeshes,this.chunkMesh,this.scarMesh]){m.geometry.dispose();(m.material as T.Material).dispose();m.dispose();}}
}
