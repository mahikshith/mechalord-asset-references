import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {Snapshot} from './contract';

const IDS={RelicMarshal:['Torso','Head','UpperArmL','UpperArmR','ForearmL','ForearmR','HandL','HandR','ThighL','ThighR','ShinL','ShinR','FootL','FootR','Weapon'],GearlingSentinel:['GearlingHull','WheelL','WheelR','Turret'],RustCrawler:['Chassis','Track_L','Track_R','Turret','Cannon'],ArcWarden:['Pelvis','Torso','Head','Leg_L','Leg_R','Arm_L','Arm_R','Shield_R','Cannon_L'],ForgeColossus:['Pelvis','Torso','Head','Leg_L','Leg_R','UpperArm_L','UpperArm_R','Forearm_L','Forearm_R','Cannon_L','Cannon_R','Jet_L','Jet_R','RocketPod_L','RocketPod_R']} as const;
export type ReforgedKind=keyof typeof IDS;
type Rest={node:T.Object3D;p:T.Vector3;q:T.Quaternion};
/** Compatibility wrappers preserve original source IDs inside each detachable group. */
function alias(root:T.Object3D,original:string,name:string){const node=root.getObjectByName(original);if(!node||root.getObjectByName(name))return;const parent=node.parent!,wrapper=new T.Group();wrapper.name=name;wrapper.position.copy(node.position);wrapper.quaternion.copy(node.quaternion);parent.add(wrapper);wrapper.add(node);node.position.set(0,0,0);node.quaternion.identity();}
function ownedMeshes(root:T.Object3D,part:T.Object3D,ids:Set<string>){const out:T.Mesh[]=[];part.traverse(o=>{const mesh=o as T.Mesh;if(!mesh.isMesh)return;let n:T.Object3D|null=mesh.parent;while(n&&n!==part){if(ids.has(n.name))return;n=n.parent;}out.push(mesh);});return out;}
/** Preserve all surfaces and material colours; merge only the draw representation. */
function coloredGeometry(meshes:T.Mesh[],relative:T.Matrix4){const pieces:T.BufferGeometry[]=[];
 for(const mesh of meshes){let g=mesh.geometry.clone();if(g.index){const unindexed=g.toNonIndexed();g.dispose();g=unindexed;}g.applyMatrix4(relative.clone().multiply(mesh.matrixWorld));if(!g.getAttribute('normal'))g.computeVertexNormals();
  const pos=g.getAttribute('position'),existing=g.getAttribute('color'),colors=new Float32Array(pos.count*3),materials=Array.isArray(mesh.material)?mesh.material:[mesh.material],groups=g.groups.length?g.groups:[{start:0,count:pos.count,materialIndex:0}];
  for(const group of groups){const m=materials[group.materialIndex??0] as T.MeshStandardMaterial,c=m.color??new T.Color(0xffffff);for(let i=group.start;i<Math.min(pos.count,group.start+group.count);i++){colors[i*3]=c.r*(existing?existing.getX(i):1);colors[i*3+1]=c.g*(existing?existing.getY(i):1);colors[i*3+2]=c.b*(existing?existing.getZ(i):1);}}
  for(const name of Object.keys(g.attributes))if(!['position','normal'].includes(name))g.deleteAttribute(name);g.setAttribute('color',new T.BufferAttribute(colors,3));g.clearGroups();pieces.push(g);
 }
 if(!pieces.length)return undefined;const result=mergeGeometries(pieces,false)!;pieces.forEach(g=>g.dispose());return result;
}
/** Merge material primitives per rigid source part; retain every authored triangle and pivot. */
export function compactRigidParts(root:T.Object3D,partIds:ReadonlyArray<string>){root.updateMatrixWorld(true);const ids=new Set<string>(partIds);
 for(const id of partIds){const part=root.getObjectByName(id);if(!part)throw new Error('Missing authored part '+id);const meshes=ownedMeshes(root,part,ids),geo=coloredGeometry(meshes,part.matrixWorld.clone().invert());if(!geo)continue;for(const m of meshes){if(m===part)throw new Error('Expected rigid node group: '+id);m.removeFromParent();}const merged=new T.Mesh(geo,new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.42,metalness:.38,emissive:0xffffff,emissiveIntensity:.035}));merged.name=id+'_AuthoredSurface';merged.castShadow=true;merged.receiveShadow=true;part.add(merged);
 }root.updateMatrixWorld(true);return root;
}
export function compactReforgedAsset(root:T.Object3D,kind:ReforgedKind){return compactRigidParts(root,IDS[kind]);}
function marker(root:T.Object3D,part:string,point:T.Vector3,name:string){root.updateMatrixWorld(true);const parent=root.getObjectByName(part)??root,m=new T.Object3D();m.name=name;const world=root.localToWorld(point.clone());m.position.copy(parent.worldToLocal(world));parent.add(m);return m;}
export class ReforgedRig{
 private rests:Rest[]=[];private clock=0;private groundCache=new Map<number,number>();private muzzle:T.Object3D;private reactor?:T.Object3D;private charge?:T.Mesh;private jets:T.Mesh[]=[];private flash:T.Mesh;readonly kind:ReforgedKind;
 constructor(readonly root:T.Object3D,kind:ReforgedKind){this.kind=kind;
  if(kind==='ForgeColossus'){alias(root,'Cannon_L','Barrel_L');alias(root,'Cannon_R','Barrel_R');alias(root,'Jet_L','Pod_L');alias(root,'Jet_R','Pod_R');}
  for(const name of [...IDS[kind],'Barrel_L','Barrel_R','Pod_L','Pod_R']){const node=root.getObjectByName(name);if(node)this.rests.push({node,p:node.position.clone(),q:node.quaternion.clone()});}
  const position=kind==='RelicMarshal'?new T.Vector3(-.64,1.43,.685):kind==='ArcWarden'?new T.Vector3(-.65,1.49,.80):kind==='ForgeColossus'?new T.Vector3(-1.33,2.91,1.26):new T.Vector3(0,kind==='RustCrawler'?1.10:1.38,kind==='RustCrawler'?1.02:.60);
  this.muzzle=marker(root,kind==='RelicMarshal'?'Weapon':kind==='ArcWarden'?'Cannon_L':kind==='ForgeColossus'?'Cannon_L':kind==='RustCrawler'?'Cannon':'Turret',position,'ReforgedMuzzle');
  this.flash=new T.Mesh(new T.IcosahedronGeometry(.07,1),new T.MeshBasicMaterial({color:0xa9efff,toneMapped:false,transparent:true,opacity:.85,depthWrite:false,blending:T.AdditiveBlending}));this.flash.name='ReforgedMuzzleFlash';this.flash.visible=false;this.muzzle.add(this.flash);
  if(kind==='ForgeColossus'){this.reactor=marker(root,'Torso',new T.Vector3(0,4.01,.74),'ReforgedReactor');this.charge=new T.Mesh(new T.IcosahedronGeometry(.16,2),new T.MeshBasicMaterial({color:0x94efff,toneMapped:false,transparent:true,opacity:.85,depthWrite:false,blending:T.AdditiveBlending}));this.charge.name='ReforgedReactorCharge';this.charge.visible=false;this.reactor.add(this.charge);for(const side of [-1,1]){const nozzle=marker(root,'Jet_'+(side<0?'L':'R'),new T.Vector3(side*.73,3.22,-.83),'ReforgedJetNozzle');const jet=new T.Mesh(new T.ConeGeometry(.15,.85,10),new T.MeshBasicMaterial({color:0x7be9ff,toneMapped:false,transparent:true,opacity:.65,depthWrite:false,blending:T.AdditiveBlending}));jet.name='ReforgedJetFlame';jet.rotation.z=Math.PI;jet.position.y=-.4;jet.visible=false;nozzle.add(jet);this.jets.push(jet);}}
 }
 private rotate(name:string,x=0,y=0,z=0){const n=this.root.getObjectByName(name);if(n)n.quaternion.multiply(new T.Quaternion().setFromEuler(new T.Euler(x,y,z)));}
 restore(){for(const r of this.rests){r.node.position.copy(r.p);r.node.quaternion.copy(r.q);}}
 update(s:Snapshot,dt:number,role:'commander'|'boss'|'elite',moving=false,hit=0,recoil=0){this.clock+=Math.max(0,dt);this.restore();const t=this.clock;
  if(role==='commander'){
   const down=s.phase==='lastStand',aim=s.phase==='boss'?Math.atan2(s.bossY+4.02-1.45,Math.max(1,s.bossZ-.8)):0;
   for(const side of ['L','R']){const phase=t*8+(side==='L'?0:Math.PI);this.rotate('Thigh'+side,down?.72:moving?Math.sin(phase)*.28:0);this.rotate('Shin'+side,down?-.95:moving?-Math.max(0,Math.sin(phase))*.36:0);this.rotate('Foot'+side,moving?Math.sin(phase)*-.11:0);this.rotate('UpperArm'+side,down?.45:side==='R'?-.42-aim:Math.sin(phase)*.12*(moving?1:.15),0,side==='R'?.52:0);this.rotate('Forearm'+side,side==='R'?-.16-recoil*.14:0,0,side==='R'?.22:0);}
   this.rotate('Head',down?.36:hit*.1,T.MathUtils.clamp((s.bossX-s.x)*.025,-.12,.12),0);const weapon=this.root.getObjectByName('Weapon');if(weapon)weapon.position.z-=recoil*.035;
  }else if(role==='boss'){
   const grounded=(s.bossPartsMask&48)===48,windup=s.bossAction==='windup',fire=s.bossAction==='fire',aim=T.MathUtils.clamp(Math.atan2(s.bossLane-s.bossX,Math.max(1,s.bossZ)),-.35,.35);
   for(const suffix of ['L','R']){const phase=t*3+(suffix==='L'?0:Math.PI);this.rotate('Leg_'+suffix,grounded?0:Math.sin(phase)*(s.bossY>.08?.14:.05));this.rotate('UpperArm_'+suffix,windup?-.22:fire?.10+recoil*.16:Math.sin(t*2)*.03);this.rotate('Forearm_'+suffix,windup?-.08:recoil*.12);this.rotate('Cannon_'+suffix,0,0,t*(windup?18:fire?25:1));}
   this.rotate('Head',-hit*.08,aim*.5,0);for(const jet of this.jets){jet.visible=!grounded&&s.bossY>.08&&s.phase==='boss';jet.scale.y=1+Math.sin(t*24)*.18;}
  }else{for(const side of ['L','R'])this.rotate('Leg_'+side,moving?Math.sin(t*5+(side==='L'?0:Math.PI))*.12:0);this.rotate('Arm_L',-.10-recoil*.14-hit*.1);this.rotate('Head',0,T.MathUtils.clamp((s.x-this.root.position.x)*.03,-.12,.12),0);}
  const live=s.phase==='run'||s.phase==='boss';this.flash.visible=live&&recoil>(role==='commander'?.35:.12);if(this.charge){this.charge.visible=role==='boss'&&s.phase==='boss'&&(s.bossAction==='windup'||s.bossState==='exposed');this.charge.scale.setScalar(s.bossState==='exposed'?1.6+Math.sin(t*9)*.12:.7+Math.max(0,s.bossAttack)*1.7);(this.charge.material as T.MeshBasicMaterial).color.set(s.bossState==='exposed'?0x9bffff:s.bossPattern==='laser'?0xffb470:0x76dcff);}this.flash.scale.setScalar(1+recoil*.7);(this.flash.material as T.MeshBasicMaterial).color.set(role==='commander'?s.weaponPower==='railburst'?0xc59cff:s.weaponPower==='cannons'?0xffca65:0x93eaff:0xff9d43);
 }
 muzzleWorld(){return this.muzzle.getWorldPosition(new T.Vector3());}
 reactorWorld(){return (this.reactor??this.muzzle).getWorldPosition(new T.Vector3());}
 /** New retained hull geometry determines settling, not the old Tyrant's dimensions. */
 groundedY(scale:number,mask=63){const key=mask*10+scale;if(this.groundCache.has(key))return this.groundCache.get(key)!;this.restore();this.root.updateMatrixWorld(true);const inverse=this.root.matrixWorld.clone().invert();let low=Infinity;this.root.traverse(o=>{const m=o as T.Mesh;if(!m.isMesh||!m.visible||/Reforged/.test(m.name))return;for(let p:T.Object3D|null=m;p&&p!==this.root;p=p.parent)if(!p.visible)return;const g=m.geometry.getAttribute('position'),matrix=inverse.clone().multiply(m.matrixWorld),v=new T.Vector3();for(let i=0;i<g.count;i++){v.fromBufferAttribute(g,i).applyMatrix4(matrix);low=Math.min(low,v.y);}});const result=Number.isFinite(low)?.10-low*scale:0;this.groundCache.set(key,result);return result;}
 syncParts(mask:number){const names=['Barrel_L','Barrel_R','Pod_L','Pod_R','Leg_L','Leg_R'];names.forEach((name,i)=>{const node=this.root.getObjectByName(name);if(node)node.visible=(mask&(1<<i))===0;});for(const side of ['L','R']){const pod=this.root.getObjectByName('RocketPod_'+side);if(pod)pod.visible=(mask&(side==='L'?4:8))===0;}}
 reset(){this.syncParts(0);this.clock=0;this.restore();this.flash.visible=false;this.jets.forEach(j=>j.visible=false);if(this.charge)this.charge.visible=false;}
 dispose(){for(const m of [this.flash,...this.jets,...(this.charge?[this.charge]:[])]){m.geometry.dispose();(m.material as T.Material).dispose();m.removeFromParent();}}
}

type Batch={node:T.Object3D;mesh:T.InstancedMesh;rest:T.Matrix4;pivot:T.Vector3};
/** Full authored silhouettes, separated by rigid parts into bounded draw batches. */
export class ReforgedCrowd{
 private batches:Batch[]=[];private count=0;private placement=new T.Object3D();private partRotation=new T.Matrix4();readonly size:T.Vector3;readonly scale:T.Vector3;
 constructor(private scene:T.Scene,source:T.Object3D,readonly kind:'GearlingSentinel'|'RustCrawler',readonly capacity:number){source.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(source);this.size=bounds.getSize(new T.Vector3());this.scale=kind==='GearlingSentinel'?new T.Vector3(.70/this.size.x,.85/this.size.y,.46/this.size.z):new T.Vector3(.86/this.size.x,.90/this.size.y,Math.min(.86/this.size.x,1.30/this.size.z));const inverse=source.matrixWorld.clone().invert(),ids=new Set<string>(IDS[kind]);
  for(const id of IDS[kind]){const node=source.getObjectByName(id);if(!node)throw new Error('Missing authored part '+kind+'/'+id);const geo=coloredGeometry(ownedMeshes(source,node,ids),node.matrixWorld.clone().invert());if(!geo)continue;const material=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.7,metalness:.3,emissive:0xffffff,emissiveIntensity:.04}),mesh=new T.InstancedMesh(geo,material,capacity);mesh.name=kind+'_'+id+'_Batch';mesh.count=0;mesh.castShadow=true;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(mesh);const rest=inverse.clone().multiply(node.matrixWorld);this.batches.push({node,mesh,rest,pivot:new T.Vector3().setFromMatrixPosition(rest)});}
 }
 begin(){this.count=0;}
 add(x:number,z:number,age:number,yaw:number,hit=false,firing=false){if(this.count>=this.capacity)return;this.placement.position.set(x,.02+Math.abs(Math.sin(age*8))*.018,z);this.placement.rotation.set(hit?-.045:0,yaw,0);this.placement.scale.copy(this.scale);this.placement.updateMatrix();
  const pivotRotation=(b:Batch)=>{const r=new T.Matrix4(),id=b.node.name;if(id.startsWith('Wheel'))r.makeRotationX(age*5);else if(id==='Turret')r.makeRotationY(Math.sin(age*1.5)*.05).multiply(new T.Matrix4().makeRotationX(firing?-.045:0));else if(id==='Cannon'&&(hit||firing))r.makeTranslation(0,0,-.035);return new T.Matrix4().makeTranslation(b.pivot.x,b.pivot.y,b.pivot.z).multiply(r).multiply(new T.Matrix4().makeTranslation(-b.pivot.x,-b.pivot.y,-b.pivot.z));};
  for(const b of this.batches){const chain:Batch[]=[b];let parent=b.node.parent;while(parent){const ancestor=this.batches.find(a=>a.node===parent);if(ancestor)chain.unshift(ancestor);parent=parent.parent;}const local=new T.Matrix4();for(const part of chain)local.multiply(pivotRotation(part));local.multiply(b.rest);b.mesh.setMatrixAt(this.count,this.placement.matrix.clone().multiply(local));}this.count++;
 }
 end(){for(const b of this.batches){b.mesh.count=this.count;b.mesh.instanceMatrix.needsUpdate=true;}}
 reset(){this.begin();this.end();}
 stats(){return {units:this.count,batches:this.batches.length,capacity:this.capacity,scaledBounds:this.size.clone().multiply(this.scale).toArray()};}
 dispose(){for(const b of this.batches){this.scene.remove(b.mesh);b.mesh.geometry.dispose();(b.mesh.material as T.Material).dispose();b.mesh.dispose();}this.batches=[];}
}
