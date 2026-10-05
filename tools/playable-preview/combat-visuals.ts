import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {Snapshot, Shot, EnemyShot, Target, Effect, FormationUnit} from './contract';

/** These classes render combat already decided by the simulation. They never deal damage. */
function standard(color:number){return new T.MeshStandardMaterial({color,roughness:.67,metalness:.36});}
function basic(color:number,opacity=1){return new T.MeshBasicMaterial({color,transparent:opacity<1,opacity,depthWrite:opacity===1});}
function pool(scene:T.Scene,geometry:T.BufferGeometry,material:T.Material,capacity:number){
  const mesh=new T.InstancedMesh(geometry,material,capacity);mesh.count=0;
  mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;scene.add(mesh);return mesh;
}
function changed(mesh:T.InstancedMesh,count:number){mesh.count=count;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;const alpha=mesh.geometry.getAttribute('instanceOpacity');if(alpha)alpha.needsUpdate=true;}
function instanceFade(mesh:T.InstancedMesh,capacity:number){
  mesh.geometry.setAttribute('instanceOpacity',new T.InstancedBufferAttribute(new Float32Array(capacity),1));
  const material=mesh.material as T.Material;material.transparent=true;material.depthWrite=false;
  material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float instanceOpacity; varying float vInstanceOpacity;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvInstanceOpacity = instanceOpacity;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vInstanceOpacity;')
      .replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a *= vInstanceOpacity;');
  };
  material.customProgramCacheKey=()=> 'mechalord-instance-opacity-v1';
}
function painted(g:T.BufferGeometry,color:number,x=0,y=0,z=0,rx=0,ry=0,rz=0){
  let geo=g.index?g.toNonIndexed():g; if(geo!==g)g.dispose();
  geo.rotateX(rx).rotateY(ry).rotateZ(rz).translate(x,y,z);
  const c=new T.Color(color),values=new Float32Array(geo.getAttribute('position').count*3);
  for(let i=0;i<values.length;i+=3){values[i]=c.r;values[i+1]=c.g;values[i+2]=c.b;}
  geo.setAttribute('color',new T.BufferAttribute(values,3));return geo;
}
function joined(parts:T.BufferGeometry[]){const geo=mergeGeometries(parts,false)!;parts.forEach(p=>p.dispose());return geo;}

type Chunk={p:T.Vector3;v:T.Vector3;r:T.Vector3;spin:T.Vector3;size:T.Vector3;color:T.Color;life:number;max:number;bounce:number;kind?:'plate'|'rotor'|'strut'};
type Spark={p:T.Vector3;v:T.Vector3;life:number;max:number;color:T.Color};
type Burst={p:T.Vector3;delay:number;strength:number};
type Puff={p:T.Vector3;v:T.Vector3;life:number;max:number;size:number;kind:'smoke'|'fire'|'flash';color:T.Color};
type SacrificeStream={root:T.Object3D;from:T.Vector3;age:number;delay:number};
type Acquisition={root:T.Object3D;age:number;radius:number;height:number;color:T.Color};
type Fragment={group:T.Group;v:T.Vector3;spin:T.Vector3;delay:number;age:number;floor:number;settled:boolean;materials:T.Material[];ownedGeometry?:T.BufferGeometry};
function visibleInTree(object:T.Object3D,root:T.Object3D){for(let p:T.Object3D|null=object;p;p=p.parent){if(!p.visible)return false;if(p===root)break;}return true;}

export class CombatVisuals {
  readonly debrisCapacity=384;readonly particleCapacity=256;readonly fragmentCapacity=24;
  private chunks:Chunk[]=Array.from({length:384},()=>({p:new T.Vector3(),v:new T.Vector3(),r:new T.Vector3(),spin:new T.Vector3(),size:new T.Vector3(),color:new T.Color(),life:0,max:1,bounce:0}));
  private puffs:Puff[]=Array.from({length:256},()=>({p:new T.Vector3(),v:new T.Vector3(),life:0,max:1,size:1,kind:'smoke',color:new T.Color()}));
  private chunkIndex=0;private puffIndex=0;private seed=1921;private age=0;private dummy=new T.Object3D();
  private fragments:Fragment[]=[];private hiddenBossParts=new Map<T.Object3D,boolean>();private bossDestroyed=false;private bossBurn?:T.Vector3;private bossBurnTime=0;private bossEmission=0;
  private commanderFragments:Fragment[]=[];readonly commanderFragmentCapacity=12;
  private debris:T.InstancedMesh;private smoke:T.InstancedMesh;private fire:T.InstancedMesh;
  private rotors:T.InstancedMesh;private struts:T.InstancedMesh;private sparkMesh:T.InstancedMesh;
  private sparks:Spark[]=Array.from({length:128},()=>({p:new T.Vector3(),v:new T.Vector3(),life:0,max:1,color:new T.Color()}));private sparkIndex=0;private bursts:Burst[]=[];
  private sacrificeStreams:SacrificeStream[]=[];private streamBodies:T.InstancedMesh;private streamHeads:T.InstancedMesh;
  private acquisitions:Acquisition[]=[];private acquireRing:T.InstancedMesh;private acquireTrace:T.InstancedMesh;private acquireDummy=new T.Object3D();
  constructor(private scene:T.Scene){
    this.debris=pool(scene,new T.BoxGeometry(1,1,1),standard(0xffffff),this.debrisCapacity);this.debris.castShadow=true;
    this.rotors=pool(scene,joined([painted(new T.TorusGeometry(.4,.1,4,12),0xffffff),painted(new T.CylinderGeometry(.17,.17,.28,8).rotateX(Math.PI/2),0xffffff)]),standard(0xffffff),this.debrisCapacity);
    this.struts=pool(scene,new T.CylinderGeometry(.16,.22,1,6),standard(0xffffff),this.debrisCapacity);
    this.sparkMesh=pool(scene,new T.CylinderGeometry(.018,.012,1,4),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85,depthWrite:false,toneMapped:false}),128);
    instanceFade(this.rotors,this.debrisCapacity);instanceFade(this.struts,this.debrisCapacity);instanceFade(this.sparkMesh,128);
    this.smoke=pool(scene,new T.IcosahedronGeometry(1,1),basic(0xffffff,.31),this.particleCapacity);
    const flame=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
    this.fire=pool(scene,new T.IcosahedronGeometry(1,0),flame,this.particleCapacity);
    const light=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.75,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
    this.acquireRing=pool(scene,new T.TorusGeometry(1,.025,3,32).rotateX(Math.PI/2),light,4);
    const trace=joined([painted(new T.BoxGeometry(.025,.28,.025),0xffffff,-.035,.26,0,0,0,-.25),painted(new T.BoxGeometry(.025,.23,.025),0xffffff,.01,.04,0,0,0,.55),painted(new T.BoxGeometry(.025,.28,.025),0xffffff,-.02,-.19,0,0,0,-.25)]);
    this.acquireTrace=pool(scene,trace,light.clone(),32);instanceFade(this.acquireRing,4);instanceFade(this.acquireTrace,32);
    const streamMaterial=new T.MeshBasicMaterial({color:0x6ee8ff,transparent:true,opacity:.75,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
    this.streamBodies=pool(scene,new T.CylinderGeometry(.035,.035,1,6).rotateX(Math.PI/2),streamMaterial,48);this.streamHeads=pool(scene,new T.OctahedronGeometry(.11),streamMaterial.clone(),48);instanceFade(this.streamBodies,48);instanceFade(this.streamHeads,48);
    instanceFade(this.debris,this.debrisCapacity);instanceFade(this.smoke,this.particleCapacity);instanceFade(this.fire,this.particleCapacity);
  }
  private random(){this.seed=(this.seed*16807)%2147483647;return this.seed/2147483647;}
  private puff(x:number,y:number,z:number,kind:Puff['kind'],size:number,life:number,color:number){
    const p=this.puffs[this.puffIndex++%this.particleCapacity];p.p.set(x,y,z);p.v.set((this.random()-.5)*1.2,.5+this.random()*1.5,(this.random()-.5)*1.2);
    p.kind=kind;p.size=size;p.life=p.max=life;p.color.set(color);
  }
  private chunk(x:number,y:number,z:number,size:number,color:number,power:number,kind:Chunk['kind']='plate'){
    const p=this.chunks[this.chunkIndex++%this.debrisCapacity];p.p.set(x,y,z);const a=this.random()*Math.PI*2;
    p.v.set(Math.cos(a)*power*(.35+this.random()),2+this.random()*power,Math.sin(a)*power*(.35+this.random()));
    p.r.set(this.random()*6,this.random()*6,this.random()*6);p.spin.set((this.random()-.5)*10,(this.random()-.5)*10,(this.random()-.5)*10);
    p.size.set(size*(.6+this.random()),size*(.2+this.random()*.4),size*(.55+this.random()));p.color.set(color);
    p.life=p.max=1.8+this.random()*.5;p.bounce=0;p.kind=kind;
    if(kind==='rotor')p.size.set(size*1.5,size*1.5,size*1.5);else if(kind==='strut')p.size.set(size,size*1.8,size);
  }
  private spark(x:number,y:number,z:number,power=1,color=0xffba55){const s=this.sparks[this.sparkIndex++%128],a=this.random()*Math.PI*2;s.p.set(x,y,z);s.v.set(Math.cos(a)*(1+this.random()*2)*power,(.8+this.random()*2)*power,Math.sin(a)*(1+this.random()*2)*power);s.life=s.max=.18+this.random()*.25;s.color.set(color);}
  /** A deflected round does not cause damage or an explosion. */
  deflect(x:number,y:number,worldZ:number){this.puff(x,y,worldZ,'flash',.13,.055,0xaac2cc);for(let i=0;i<3;i++)this.spark(x,y,worldZ,.55,0xaac2cc);}
  private later(x:number,y:number,z:number,delay:number,strength:number){if(this.bursts.length>=32)this.bursts.shift();this.bursts.push({p:new T.Vector3(x,y,z),delay,strength});}
  enemyDeath(x:number,worldZ:number,variant=0,size=1,impactY=.6*size){
    const elite=variant>0,count=elite?14:7;
    for(let i=0;i<count;i++)this.chunk(x+(this.random()-.5)*size,.4+this.random()*size,worldZ+(this.random()-.5)*size,(.22+this.random()*.06)*size,i%5===0?0x843322:i%5===3?0x98774b:i%2?0x273239:0x3a4850,elite?3.3:2.3,i%7===3||i%7===4?'rotor':i%7>4?'strut':'plate');
    this.impact(x,impactY,worldZ,elite?1.65:1);
    if(elite){this.later(x-.32*size,impactY-.24,worldZ,.10,1.1);this.later(x+.32*size,impactY+.17,worldZ-.10,.24,.85);}
  }
  allyLoss(x:number,worldZ:number,count:number){
    if(count<=0)return;const chunks=Math.min(8,Math.max(2,Math.ceil(count*1.5)));
    for(let i=0;i<chunks;i++)this.chunk(x+(this.random()-.5)*.7,.55+this.random()*.5,worldZ+(this.random()-.5)*.7,.22,i%2?0x34434b:0xd5c9a9,2.1);
    this.impact(x,.75,worldZ,1.0);
  }
  impact(x:number,y:number,worldZ:number,strength=1){
    this.puff(x,y,worldZ,'flash',Math.min(.7,.34*strength),.085,0xffdca1);
    for(let i=0;i<(strength>.65?9:3);i++)this.spark(x,y,worldZ,Math.min(1.5,strength));
    if(strength<=.65)return;
    for(let i=0;i<3;i++)this.puff(x+(this.random()-.5)*.4,y,worldZ+(this.random()-.5)*.4,'fire',(.16+this.random()*.19)*Math.min(strength,2),.22+this.random()*.3,i%2?0xff9c24:0xff4820);
    for(let i=0;i<2;i++)this.puff(x,y,worldZ,'smoke',(.18+this.random()*.16)*Math.min(strength,2),.65+this.random()*.45,0x47515a);
  }
  muzzle(x:number,y:number,worldZ:number,hostile=false){this.puff(x,y,worldZ,'flash',.22,.07,hostile?0xff6b20:0xffd46d);}
  /** Break authoritative named source parts, preserving their world pose and original geometry. */
  bossPartBreak(root:T.Object3D,part:'cannonL'|'cannonR'|'boosterL'|'boosterR'|'legL'|'legR'){
    if(this.bossDestroyed)return false;root.updateWorldMatrix(true,true);
    const selectors={cannonL:['Barrel_L'],cannonR:['Barrel_R'],boosterL:['Pod_L','BattleizerWing_L'],boosterR:['Pod_R','BattleizerWing_R'],legL:['Leg_L'],legR:['Leg_R']};
    let detached=0;
    for(const name of selectors[part]){const node=root.getObjectByName(name);if(!node||!visibleInTree(node,root))continue;
      const sources:T.Mesh[]=[];node.traverse(o=>{const m=o as T.Mesh;if(m.isMesh&&visibleInTree(m,root))sources.push(m);});
      for(const mesh of sources){if(this.fragments.length>=this.fragmentCapacity)break;
        const originals=Array.isArray(mesh.material)?mesh.material:[mesh.material];if(originals.every(m=>m.opacity<=0||m.blending===T.AdditiveBlending))continue;
        mesh.geometry.computeBoundingBox();const center=mesh.geometry.boundingBox!.getCenter(new T.Vector3()).applyMatrix4(mesh.matrixWorld),materials=originals.map(m=>m.clone());
        const copy=new T.Mesh(mesh.geometry,Array.isArray(mesh.material)?materials:materials[0]);copy.matrixAutoUpdate=false;copy.matrix.copy(new T.Matrix4().makeTranslation(-center.x,-center.y,-center.z).multiply(mesh.matrixWorld));copy.castShadow=true;copy.name='Wreck_'+mesh.name;
        const group=new T.Group();group.position.copy(center);group.add(copy);this.scene.add(group);const bounds=new T.Box3().setFromObject(group),side=part.endsWith('L')?-1:1;
        this.fragments.push({group,v:new T.Vector3(side*(1.2+this.random()),1.5+this.random(),.7),spin:new T.Vector3(.5,side*1.2,side*1.7),delay:0,age:0,floor:Math.max(.1,center.y-bounds.min.y),settled:false,materials});if(detached<3)this.later(center.x,center.y,center.z,detached*.09,detached===0?2:1.1);detached++;
      }
      if(sources.length){if(!this.hiddenBossParts.has(node))this.hiddenBossParts.set(node,node.visible);node.visible=false;}
    }
    return detached>0;
  }
  /** Copies mesh transforms before the caller hides the live boss. Does not own its geometry. */
  bossDeath(root:T.Object3D){
    if(this.bossDestroyed)return false;this.bossDestroyed=true;
    root.updateWorldMatrix(true,true);
    // Keep eight slots for the final torso/head blast, even after repeated part loss.
    while(this.fragments.length>this.fragmentCapacity-8){const old=this.fragments.shift()!;this.scene.remove(old.group);old.materials.forEach(m=>m.dispose());old.ownedGeometry?.dispose();}
    let count=this.fragments.length;const centers:T.Vector3[]=[],sources:T.Object3D[]=[];root.traverse(object=>sources.push(object));
    const priority=(o:T.Object3D)=>/torso/i.test(o.name)?0:/head|face/i.test(o.name+' '+o.parent?.name)?1:2;
    sources.sort((a,b)=>priority(a)-priority(b));sources.forEach(object=>{
      const mesh=object as T.Mesh;if(!mesh.isMesh||!visibleInTree(mesh,root)||count>=this.fragmentCapacity)return;
      // Skip HUD/badges and effects; the actual articulated mesh pieces stay intact.
      if(!mesh.geometry.getAttribute('position')||mesh.name.toLowerCase().includes('badge'))return;
      mesh.geometry.computeBoundingBox();const center=mesh.geometry.boundingBox!.getCenter(new T.Vector3()).applyMatrix4(mesh.matrixWorld);
      const sourceMaterials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
      if(sourceMaterials.every(m=>m.opacity<=0||m.blending===T.AdditiveBlending))return;
      const materials=sourceMaterials.map(m=>{const clone=m.clone();clone.transparent=true;return clone;});
      const copy=new T.Mesh(mesh.geometry,Array.isArray(mesh.material)?materials:materials[0]);copy.castShadow=true;copy.name='Wreck_'+mesh.name;
      copy.matrixAutoUpdate=false;copy.matrix.copy(new T.Matrix4().makeTranslation(-center.x,-center.y,-center.z).multiply(mesh.matrixWorld));
      const group=new T.Group();group.position.copy(center);group.add(copy);this.scene.add(group);
      const name=(mesh.name+' '+mesh.parent?.name).toLowerCase();const delay=name.includes('torso')?.72:name.includes('head')?.43:.06*(count%5);
      const spread=center.clone().sub(root.getWorldPosition(new T.Vector3())).setY(0).normalize();
      const velocity=spread.multiplyScalar(1.1+this.random()*1.7);velocity.y=1+this.random()*2;
      const bounds=new T.Box3().setFromObject(group);const floor=Math.max(.12,center.y-bounds.min.y);
      this.fragments.push({group,v:velocity,spin:new T.Vector3((this.random()-.5)*2.5,(this.random()-.5)*2.5,(this.random()-.5)*2.5),delay,age:0,floor,settled:false,materials});centers.push(center);count++;
    });
    const pos=root.getWorldPosition(new T.Vector3());this.bossBurn=new T.Vector3(pos.x,.4,pos.z);this.bossBurnTime=2.8;this.bossEmission=0;
    this.impact(pos.x,pos.y+2,pos.z,2);for(const [i,p] of centers.slice(0,8).entries())this.later(p.x,p.y,p.z,.08+i*.095,i===0?2:1.2);
    return count>0;
  }
  /** Freeze actual skinned pose, then detach anatomical mesh pieces. Independent of boss wreck. */
  commanderDeath(root:T.Object3D){
    if(this.commanderFragments.length)return false;root.updateWorldMatrix(true,true);
    const origin=root.getWorldPosition(new T.Vector3());
    const add=(geometry:T.BufferGeometry,material:T.Material,matrix:T.Matrix4,owned=false)=>{
      if(this.commanderFragments.length>=this.commanderFragmentCapacity){if(owned)geometry.dispose();return;}
      geometry.computeBoundingBox();const center=geometry.boundingBox!.getCenter(new T.Vector3()).applyMatrix4(matrix);
      const clone=material.clone(),copy=new T.Mesh(geometry,clone);copy.castShadow=true;copy.matrixAutoUpdate=false;
      copy.matrix.copy(new T.Matrix4().makeTranslation(-center.x,-center.y,-center.z).multiply(matrix));
      const group=new T.Group();group.position.copy(center);group.add(copy);this.scene.add(group);
      const direction=center.clone().sub(origin).setY(0);if(direction.lengthSq()<.02)direction.set(this.random()-.5,0,this.random()-.5);direction.normalize().multiplyScalar(1.7+this.random()*1.7);
      direction.y=2.4+this.random()*1.6;const bounds=new T.Box3().setFromObject(group);
      this.commanderFragments.push({group,v:direction,spin:new T.Vector3((this.random()-.5)*4,(this.random()-.5)*4,(this.random()-.5)*4),delay:0,age:0,floor:Math.max(.08,center.y-bounds.min.y),settled:false,materials:[clone],ownedGeometry:owned?geometry:undefined});
    };
    root.traverse(object=>{
      const mesh=object as T.Mesh;if(!mesh.isMesh||!visibleInTree(mesh,root)||this.commanderFragments.length>=this.commanderFragmentCapacity)return;
      const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
      if(materials.every(m=>m.opacity<=0||m.blending===T.AdditiveBlending)||['RingGeometry','CircleGeometry','PlaneGeometry'].includes(mesh.geometry.type))return;
      if(!(mesh as T.SkinnedMesh).isSkinnedMesh){add(mesh.geometry,materials[0],mesh.matrixWorld);return;}
      const skinned=mesh as T.SkinnedMesh;skinned.skeleton.update();const source=mesh.geometry,position=source.getAttribute('position'),uv=source.getAttribute('uv'),index=source.index;
      const triangleCount=(index?index.count:position.count)/3;
      if(triangleCount>150000){add(mesh.geometry,materials[0],mesh.matrixWorld);return;}
      const posed=new Float32Array(position.count*3),point=new T.Vector3(),low=new T.Vector3(Infinity,Infinity,Infinity),high=new T.Vector3(-Infinity,-Infinity,-Infinity);
      for(let i=0;i<position.count;i++){skinned.getVertexPosition(i,point).applyMatrix4(mesh.matrixWorld);point.toArray(posed,i*3);low.min(point);high.max(point);}
      const height=Math.max(.01,high.y-low.y),middleX=(low.x+high.x)/2,width=high.x-low.x;
      const buckets=new Map<string,{vertices:number[];uvs:number[];material:number}>();
      for(let t=0;t<triangleCount;t++){
        const ids=[0,1,2].map(c=>index?index.getX(t*3+c):t*3+c);
        const x=ids.reduce((sum,id)=>sum+posed[id*3],0)/3,y=(ids.reduce((sum,id)=>sum+posed[id*3+1],0)/3-low.y)/height;
        const side=x<middleX?'L':'R';const region=y>.79?'Head':y<.16?'Foot_'+side:y<.37?'Leg_'+side:Math.abs(x-middleX)>width*.22&&y<.78?'Arm_'+side:'Torso';
        const group=source.groups.find(g=>t*3>=g.start&&t*3<g.start+g.count);const material=group?.materialIndex??0,key=region+'_'+material;
        let bucket=buckets.get(key);if(!bucket){bucket={vertices:[],uvs:[],material};buckets.set(key,bucket);}
        for(const id of ids){bucket.vertices.push(posed[id*3],posed[id*3+1],posed[id*3+2]);if(uv)bucket.uvs.push(uv.getX(id),uv.getY(id));}
      }
      for(const [name,bucket] of buckets){const geometry=new T.BufferGeometry();geometry.name='FrozenCommander_'+name;geometry.setAttribute('position',new T.Float32BufferAttribute(bucket.vertices,3));if(uv)geometry.setAttribute('uv',new T.Float32BufferAttribute(bucket.uvs,2));geometry.computeVertexNormals();add(geometry,materials[bucket.material]??materials[0],new T.Matrix4(),true);}
    });
    if(this.commanderFragments.length){this.impact(origin.x,1.5,origin.z,2.2);for(let i=0;i<10;i++)this.chunk(origin.x,1+this.random(),origin.z,.27,i%2?0xe4d7b5:0x33444d,3.4);}
    return this.commanderFragments.length>0;
  }
  /** Consumed troop positions are world coordinates, not simulated casualties. */
  sacrifice(root:T.Object3D,positions:ReadonlyArray<{x:number;z:number;y?:number}>){
    for(const [i,position] of positions.slice(0,24).entries()){if(this.sacrificeStreams.length>=48)this.sacrificeStreams.shift();this.sacrificeStreams.push({root,from:new T.Vector3(position.x,position.y??.85,position.z),age:0,delay:i*.012});}
    if(positions.length)this.powerAcquire(root,'guided');
  }
  /** Compact pickup transformation; only four simultaneous pulses, shared geometry/materials. */
  powerAcquire(root:T.Object3D,kind:'guided'|'cannons'|'railburst'|'freeze'|'slow'|'haste'){
    root.updateWorldMatrix(true,true);const bounds=new T.Box3().setFromObject(root),size=bounds.getSize(new T.Vector3());
    const colors={guided:0x49cfff,cannons:0xffb24a,railburst:0xba83ff,freeze:0xa7f0ff,slow:0x61d694,haste:0xff6639};
    if(this.acquisitions.length>=4)this.acquisitions.shift();
    this.acquisitions.push({root,age:0,radius:T.MathUtils.clamp(Math.max(size.x,size.z)*.45,.5,1.4),height:T.MathUtils.clamp(size.y,1.5,3.5),color:new T.Color(colors[kind])});
    const position=root.getWorldPosition(new T.Vector3());for(let i=0;i<3;i++)this.puff(position.x,1.3+i*.3,position.z,'flash',.13,.22,colors[kind]);
  }
  update(dt:number){
    // Substeps keep bounce stable after a slow frame; freeze exactly when dt=0.
    const elapsed=Math.max(0,Math.min(dt,.15));this.age+=elapsed;
    if(elapsed>0){for(const burst of this.bursts){burst.delay-=elapsed;if(burst.delay<=0)this.impact(burst.p.x,burst.p.y,burst.p.z,burst.strength);}this.bursts=this.bursts.filter(b=>b.delay>0);}
    const steps=Math.max(1,Math.ceil(elapsed/(1/60))),step=elapsed/steps;
    for(let n=0;n<steps;n++){
      for(const c of this.chunks){if(c.life<=0)continue;c.life-=step;c.v.y-=step*9.8;c.p.addScaledVector(c.v,step);c.r.addScaledVector(c.spin,step);
        const floor=Math.max(.04,c.size.y*.5);if(c.p.y<floor){c.p.y=floor;c.v.y=Math.abs(c.v.y)*.26;c.v.x*=.67;c.v.z*=.67;c.spin.multiplyScalar(.6);c.bounce++;if(c.bounce>3)c.v.y=0;}}
      for(const p of this.puffs){if(p.life<=0)continue;p.life-=step;p.p.addScaledVector(p.v,step);p.v.multiplyScalar(1-step*.6);}
      for(const s of this.sparks){if(s.life<=0)continue;s.life-=step;s.v.y-=step*5;s.p.addScaledVector(s.v,step);}
      for(const collection of [this.fragments,this.commanderFragments])for(const f of collection){if(f.settled)continue;f.age+=step;if(f.age<f.delay)continue;f.v.y-=step*8;f.group.position.addScaledVector(f.v,step);f.group.rotation.x+=f.spin.x*step;f.group.rotation.y+=f.spin.y*step;f.group.rotation.z+=f.spin.z*step;
        if(f.group.position.y<f.floor){f.group.position.y=f.floor;f.v.y=Math.abs(f.v.y)*.12;f.v.x*=.75;f.v.z*=.75;f.spin.multiplyScalar(.4);}}
    }
    if(this.bossBurn&&this.bossBurnTime>0){this.bossBurnTime-=elapsed;this.bossEmission+=elapsed;
      while(this.bossEmission>=.10){this.bossEmission-=.10;const p=this.bossBurn;this.puff(p.x+(this.random()-.5)*2,p.y,p.z+(this.random()-.5)*1.5,'fire',.38,.45,0xff7328);this.puff(p.x,p.y+.5,p.z,'smoke',.65,1.15,0x36434a);}}
    let dc=0,rc=0,tc=0,sc=0,fc=0;for(const c of this.chunks){if(c.life<=0)continue;const fade=Math.min(1,c.life/.45),mesh=c.kind==='rotor'?this.rotors:c.kind==='strut'?this.struts:this.debris,index=c.kind==='rotor'?rc++:c.kind==='strut'?tc++:dc++;
      this.dummy.position.copy(c.p);this.dummy.rotation.set(c.r.x,c.r.y,c.r.z);this.dummy.scale.copy(c.size).multiplyScalar(fade);this.dummy.updateMatrix();mesh.setMatrixAt(index,this.dummy.matrix);mesh.geometry.getAttribute('instanceOpacity').setX(index,fade);mesh.setColorAt(index,c.color);}
    for(const p of this.puffs){if(p.life<=0)continue;const age=1-p.life/p.max,fade=Math.min(1,p.life/.22),mesh=p.kind==='smoke'?this.smoke:this.fire,index=p.kind==='smoke'?sc++:fc++;
      this.dummy.position.copy(p.p);this.dummy.rotation.set(age*2,age*3,age);this.dummy.scale.setScalar(p.size*(p.kind==='smoke'?1+age*2:1-age*.55)*fade);this.dummy.updateMatrix();mesh.setMatrixAt(index,this.dummy.matrix);mesh.geometry.getAttribute('instanceOpacity').setX(index,fade);mesh.setColorAt(index,p.color);}
    changed(this.debris,dc);changed(this.rotors,rc);changed(this.struts,tc);changed(this.smoke,sc);changed(this.fire,fc);
    let sparks=0;for(const s of this.sparks){if(s.life<=0)continue;this.dummy.position.copy(s.p);this.dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),s.v.clone().normalize());this.dummy.scale.set(1,Math.max(.04,s.v.length()*.055),1);this.dummy.updateMatrix();this.sparkMesh.setMatrixAt(sparks,this.dummy.matrix);this.sparkMesh.setColorAt(sparks,s.color);this.sparkMesh.geometry.getAttribute('instanceOpacity').setX(sparks++,s.life/s.max);}changed(this.sparkMesh,sparks);
    let rings=0,traces=0;
    for(const pulse of this.acquisitions){pulse.age+=elapsed;if(pulse.age>=.85)continue;
      const p=pulse.root.getWorldPosition(new T.Vector3()),progress=pulse.age/.85,fade=Math.sin(Math.PI*progress)*.8;
      this.acquireDummy.position.set(p.x,p.y+pulse.height*(.25+.5*progress),p.z);this.acquireDummy.rotation.set(0,0,0);this.acquireDummy.scale.setScalar(pulse.radius*(.78+progress*.5));this.acquireDummy.updateMatrix();
      this.acquireRing.setMatrixAt(rings,this.acquireDummy.matrix);this.acquireRing.setColorAt(rings,pulse.color);this.acquireRing.geometry.getAttribute('instanceOpacity').setX(rings++,fade);
      for(let i=0;i<8;i++){const angle=i/8*Math.PI*2;
        this.acquireDummy.position.set(p.x+Math.cos(angle)*pulse.radius*.74,p.y+pulse.height*(.25+(i%3)*.22),p.z+Math.sin(angle)*pulse.radius*.74);
        this.acquireDummy.rotation.set(0,-angle,Math.sin(pulse.age*18+i)*.08);this.acquireDummy.scale.set(1,pulse.height*.45,1);this.acquireDummy.updateMatrix();
        this.acquireTrace.setMatrixAt(traces,this.acquireDummy.matrix);this.acquireTrace.setColorAt(traces,pulse.color);this.acquireTrace.geometry.getAttribute('instanceOpacity').setX(traces++,fade);
      }
    }
    this.acquisitions=this.acquisitions.filter(p=>p.age<.85);changed(this.acquireRing,rings);changed(this.acquireTrace,traces);

    let streamCount=0;const up=new T.Vector3(0,0,1);
    for(const stream of this.sacrificeStreams){stream.age+=elapsed;const age=stream.age-stream.delay;if(age<0||age>=.75)continue;
      const end=stream.root.getWorldPosition(new T.Vector3()).add(new T.Vector3(0,1.6,0)),t=age/.75;
      const at=(v:number)=>stream.from.clone().lerp(end,v).add(new T.Vector3(0,Math.sin(v*Math.PI)*.65,0));const point=at(t),tail=at(Math.max(0,t-.16)),direction=point.clone().sub(tail),length=Math.max(.03,direction.length());
      this.acquireDummy.position.copy(point).add(tail).multiplyScalar(.5);this.acquireDummy.quaternion.setFromUnitVectors(up,direction.normalize());this.acquireDummy.scale.set(1,1,length);this.acquireDummy.updateMatrix();this.streamBodies.setMatrixAt(streamCount,this.acquireDummy.matrix);this.streamBodies.geometry.getAttribute('instanceOpacity').setX(streamCount,.9*(1-t*.4));
      this.acquireDummy.position.copy(point);this.acquireDummy.rotation.set(0,0,0);this.acquireDummy.scale.setScalar(.7+.25*Math.sin(t*Math.PI));this.acquireDummy.updateMatrix();this.streamHeads.setMatrixAt(streamCount,this.acquireDummy.matrix);this.streamHeads.geometry.getAttribute('instanceOpacity').setX(streamCount,.9*(1-t*.4));streamCount++;
    }
    this.sacrificeStreams=this.sacrificeStreams.filter(s=>s.age-s.delay<.75);changed(this.streamBodies,streamCount);changed(this.streamHeads,streamCount);
    // A recognizable static wreck remains behind the result overlay until retry.
    // Settling ends physics work; reset owns the final material cleanup.
    for(const collection of [this.fragments,this.commanderFragments])for(const f of collection)if(!f.settled&&f.age>=2.5){
      const bounds=new T.Box3().setFromObject(f.group);f.group.position.y+=.04-bounds.min.y;
      f.v.set(0,0,0);f.spin.set(0,0,0);f.settled=true;
    }
  }
  reset(){this.bursts=[];for(const s of this.sparks)s.life=0;changed(this.sparkMesh,0);changed(this.rotors,0);changed(this.struts,0);this.sacrificeStreams=[];changed(this.streamBodies,0);changed(this.streamHeads,0);for(const [node,visible] of this.hiddenBossParts)node.visible=visible;this.hiddenBossParts.clear();this.bossDestroyed=false;this.acquisitions=[];changed(this.acquireRing,0);changed(this.acquireTrace,0);for(const c of this.chunks)c.life=0;for(const p of this.puffs)p.life=0;for(const collection of [this.fragments,this.commanderFragments])for(const f of collection){this.scene.remove(f.group);f.materials.forEach(m=>m.dispose());f.ownedGeometry?.dispose();}this.fragments=[];this.commanderFragments=[];this.bossBurnTime=0;this.bossBurn=undefined;changed(this.debris,0);changed(this.smoke,0);changed(this.fire,0);}
  stats(){return {debris:this.debris.count+this.rotors.count+this.struts.count,smoke:this.smoke.count,fire:this.fire.count,sparks:this.sparkMesh.count,queuedBursts:this.bursts.length,bossFragments:this.fragments.length,commanderFragments:this.commanderFragments.length,acquirePulses:this.acquisitions.length,sacrificeStreams:this.sacrificeStreams.length,capacity:this.debrisCapacity+this.particleCapacity+this.fragmentCapacity+this.commanderFragmentCapacity+128+32};}
  dispose(){this.reset();for(const m of [this.debris,this.rotors,this.struts,this.sparkMesh,this.smoke,this.fire,this.acquireRing,this.acquireTrace,this.streamBodies,this.streamHeads]){this.scene.remove(m);m.geometry.dispose();(m.material as T.Material).dispose();m.dispose();}}
}

/** One recognizable ~1.1m robot per actual target; two draw calls for a whole wave. */
export class RobotFormation {
  private body:T.InstancedMesh;private eyes:T.InstancedMesh;private treadMark:T.InstancedMesh;private count=0;private dummy=new T.Object3D();
  constructor(private scene:T.Scene,readonly capacity=200){
    const dark=0x25323c,red=0x963729,bronze=0x96754a,parts:T.BufferGeometry[]=[];
    for(const side of [-1,1]){
      parts.push(painted(new T.CapsuleGeometry(.14,.36,2,6),dark,side*.32,.20,0,Math.PI/2));
      parts.push(painted(new T.CylinderGeometry(.105,.105,.31,6),bronze,side*.32,.20,.19,0,0,Math.PI/2));
      parts.push(painted(new T.SphereGeometry(.20,6,4),red,side*.31,.73,0));
    }
    parts.push(painted(new T.CylinderGeometry(.29,.35,.35,6),dark,0,.46,0));
    parts.push(painted(new T.SphereGeometry(.34,8,5),red,0,.66,0));
    parts.push(painted(new T.CylinderGeometry(.16,.20,.25,6),dark,0,.95,0));
    parts.push(painted(new T.BoxGeometry(.35,.11,.04),dark,0,.98,.16));
    parts.push(painted(new T.CylinderGeometry(.065,.085,.55,6),dark,.16,.70,.39,Math.PI/2));
    parts.push(painted(new T.TorusGeometry(.075,.025,3,6),bronze,.16,.70,.68));
    const material=standard(0xffffff);material.vertexColors=true;
    this.body=pool(scene,joined(parts),material,capacity);this.body.castShadow=true;
    const glow=joined([painted(new T.BoxGeometry(.24,.035,.045),0xffae37,0,.99,.19),painted(new T.OctahedronGeometry(.09),0xff5a22,0,.67,.30)]);
    const eyes=basic(0xffffff);eyes.vertexColors=true;eyes.toneMapped=false;this.eyes=pool(scene,glow,eyes,capacity);
    this.treadMark=pool(scene,new T.BoxGeometry(.27,.055,.065),standard(0xa48c63),capacity*2);
  }
  begin(){this.count=0;}
  add(x:number,worldZ:number,scale=1,yaw=0,hit=false,phase=0){if(this.count>=this.capacity)return;
    const sized=scale;
    const bounce=Math.abs(Math.sin(phase*9))*.055,lean=Math.sin(phase*9)*.035;
    this.dummy.position.set(x,.025+bounce,worldZ);this.dummy.rotation.set(lean-(hit?.11:0),yaw,Math.sin(phase*9)*.045);this.dummy.scale.set(sized*.82,sized*1.1,sized);this.dummy.updateMatrix();
    this.body.setMatrixAt(this.count,this.dummy.matrix);this.eyes.setMatrixAt(this.count,this.dummy.matrix);
    for(const side of [-1,1]){const travel=((phase*2.4+(side>0?.5:0))%1+1)%1,z=(travel-.5)*.5;
      this.dummy.position.set(x+Math.cos(yaw)*side*.32*sized*.82+Math.sin(yaw)*z*sized,.32*sized+Math.sin(travel*Math.PI)*.035,worldZ-Math.sin(yaw)*side*.32*sized*.82+Math.cos(yaw)*z*sized);
      this.dummy.rotation.set(0,yaw,0);this.dummy.scale.set(sized*.82,sized,sized);this.dummy.updateMatrix();this.treadMark.setMatrixAt(this.count*2+(side>0?1:0),this.dummy.matrix);}
    this.count++;
  }
  end(){changed(this.body,this.count);changed(this.eyes,this.count);changed(this.treadMark,this.count*2);}
  reset(){this.begin();this.end();}
  dispose(){for(const mesh of [this.body,this.eyes,this.treadMark]){this.scene.remove(mesh);mesh.geometry.dispose();(mesh.material as T.Material).dispose();mesh.dispose();}}
}

/** Rings mark charging weapons; corner brackets mark the committed lane, never an invented ray. */
export class EnemyWeaponCues {
  private charges:T.InstancedMesh;private locks:T.InstancedMesh;private dummy=new T.Object3D();
  constructor(private scene:T.Scene,readonly capacity=16){
    this.charges=pool(scene,new T.TorusGeometry(.23,.045,4,16),new T.MeshBasicMaterial({color:0xffad45,transparent:true,opacity:.75,depthWrite:false,toneMapped:false}),capacity);
    const corners=joined([-1,1].flatMap(x=>[-1,1].flatMap(z=>[painted(new T.BoxGeometry(.25,.018,.035),0xffffff,x*.32,0,z*.42),painted(new T.BoxGeometry(.035,.018,.25),0xffffff,x*.42,0,z*.32)])));
    this.locks=pool(scene,corners,new T.MeshBasicMaterial({color:0xff743e,transparent:true,opacity:.72,depthWrite:false,toneMapped:false}),capacity);
    instanceFade(this.charges,capacity);instanceFade(this.locks,capacity);
  }
  update(targets:ReadonlyArray<Target>,visible=true){
    let charges=0,locks=0;for(const target of targets){const t=target as Target&{fireState?:string;aimX?:number;charge?:number};if(!visible||t.kind!=='enemy'||t.variant!==2||t.hp<=0||t.z<0||t.z>28)continue;
      const charge=T.MathUtils.clamp(t.charge??0,0,1),active=t.fireState==='tracking'||t.fireState==='locked'||t.fireState==='fire';
      if(active&&charges<this.capacity){const yaw=Math.atan2((t.aimX??t.x)-t.x,t.z),scale=.7+charge*.65;
        this.dummy.position.set(t.x+Math.sin(yaw)*.62,1.65,-t.z+Math.cos(yaw)*.62);this.dummy.rotation.set(0,yaw,0);this.dummy.scale.setScalar(scale);this.dummy.updateMatrix();this.charges.setMatrixAt(charges,this.dummy.matrix);this.charges.geometry.getAttribute('instanceOpacity').setX(charges++,.3+.7*charge);}
      if((t.fireState==='locked'||t.fireState==='fire')&&locks<this.capacity){this.dummy.position.set(t.aimX??t.x,.065,0);this.dummy.rotation.set(0,0,0);this.dummy.scale.setScalar(1);this.dummy.updateMatrix();this.locks.setMatrixAt(locks,this.dummy.matrix);this.locks.geometry.getAttribute('instanceOpacity').setX(locks++,.82);}
    }changed(this.charges,charges);changed(this.locks,locks);
  }
  reset(){changed(this.charges,0);changed(this.locks,0);}
  dispose(){for(const mesh of [this.charges,this.locks]){this.scene.remove(mesh);mesh.geometry.dispose();(mesh.material as T.Material).dispose();mesh.dispose();}}
}

export type MissileOptions={depthScale:number;bossPhase:boolean;bossZ?:number;bossX?:number;bossY?:number;bossLaunchHeight?:number;bossImpactHeight?:number;bossSurfaceOffset?:number;targets?:ReadonlyArray<Target>;formation?:ReadonlyArray<FormationUnit>;dt?:number;simulationTime?:number;overdrive:boolean;weapon:number;visible?:boolean;lasers?:ReadonlyArray<{id:number;x:number;z:number;endX:number;endZ:number;width:number;time:number}>};
type FriendlyPath={shot:Shot;originZ:number;launch:number;targetZ:number;targetHeight:number;targetId?:number;boss:boolean};
/** The core owns X/Z collision. These anchors lift that same plane onto visible geometry. */
function targetHeight(kind:Target['kind'],variant=0){return kind==='enemy'?(variant>0?1.65:.78):kind==='crate'?.68:kind==='orb'?1.1:kind==='hazard'?.7:1.1;}
function targetSurface(target:Target){return target.z-Math.min(.85,Math.max(0,target.depth??0)*.8);}
export function combatImpactPoint(effect:Pick<Effect,'x'|'z'|'variant'|'entityId'>,options:MissileOptions){
  const boss=effect.variant===3||effect.variant===4;
  const target=options.targets?.find(t=>t.id===effect.entityId);
  const kind=target?.kind??(effect.variant===-1?'crate':effect.variant===-3?'orb':'enemy');
  return new T.Vector3(effect.x,boss?(options.bossY??0)+(options.bossImpactHeight??4.31):targetHeight(kind,effect.variant),
    -(boss?effect.z-(options.bossSurfaceOffset??.85):effect.z-(target?Math.min(.85,Math.max(0,target.depth??0)*.8):0))*options.depthScale);
}
function acquirePath(shot:Shot,options:MissileOptions,delta:number):FriendlyPath{
  const troop=shot.owner==='troop',launch=troop?.9:shot.kind==='missile'?2.08:shot.kind==='cannon'?1.42:shot.kind==='rail'?1.8:1.35;
  const source=troop?options.formation?.filter(p=>Math.abs(p.x-shot.x)<.18).sort((a,b)=>Math.abs(a.z-(shot.z-shot.dz*delta))-Math.abs(b.z-(shot.z-shot.dz*delta)))[0]:undefined;
  const originZ=source?.z??(troop?Math.min(-.75,shot.z-shot.dz*delta):.4);
  const path:FriendlyPath={shot:{...shot},originZ,launch,targetZ:10,targetHeight:1.25,boss:false};
  // Predict only the already-authoritative horizontal ray; ordinary fire never steers.
  const target=options.targets?.filter(t=>t.hp>0&&t.kind!=='hazard'&&t.op!==2&&t.z>shot.z-.2&&Math.abs(t.x-(shot.x+shot.dx*(t.z-shot.z)/Math.max(1,shot.dz)))<t.size+.08).sort((a,b)=>a.z-b.z)[0];
  if(target){path.targetId=target.id;path.targetZ=targetSurface(target);path.targetHeight=targetHeight(target.kind,target.variant);}
  else if(options.bossPhase){path.boss=true;path.targetZ=(options.bossZ??12)-(options.bossSurfaceOffset??.85);path.targetHeight=(options.bossY??0)+(options.bossImpactHeight??4.31);}
  return path;
}
function presentPath(shot:Shot,path:FriendlyPath,options:MissileOptions){
  const range=Math.max(.1,path.targetZ-path.originZ),fraction=T.MathUtils.clamp((shot.z-path.originZ)/range,0,1);
  const height=T.MathUtils.lerp(path.launch,path.targetHeight,fraction);
  const dy=fraction>0&&fraction<1?(path.targetHeight-path.launch)/range*shot.dz:0;
  return {position:new T.Vector3(shot.x,height,-shot.z*options.depthScale),direction:new T.Vector3(shot.dx,dy,-shot.dz*options.depthScale).normalize()};
}
/** Pure projection for tests and other render adapters; preserves every simulated X/Z. */
export function friendlyProjectilePose(shot:Shot,options:MissileOptions){return presentPath(shot,acquirePath(shot,options,options.dt??1/60),options);}
export class CombatMissiles {
  private bodies:T.InstancedMesh;private exhaust:T.InstancedMesh;private orbs:T.InstancedMesh;private orbCores:T.InstancedMesh;
  private bullets:T.InstancedMesh;private tips:T.InstancedMesh;private wakes:T.InstancedMesh;private dummy=new T.Object3D();
  private color=new T.Color();readonly capacity=768;
  private beamShells:T.InstancedMesh;private beamCores:T.InstancedMesh;private hostileLaunchZ=new Map<number,{z:number;height:number}>();
  private hostileShells:T.InstancedMesh;private hostileTips:T.InstancedMesh;
  private friendlyPaths:FriendlyPath[]=[];private previousTime?:number;
  constructor(private scene:T.Scene){
    const parts=[painted(new T.CylinderGeometry(.09,.09,.47,8),0xbfc6c8,0,0,0,Math.PI/2),
      painted(new T.ConeGeometry(.095,.21,8),0xc17536,0,0,.34,Math.PI/2),
      painted(new T.CylinderGeometry(.115,.115,.07,8),0x303a43,0,0,-.25,Math.PI/2)];
    for(const a of [0,Math.PI/2])parts.push(painted(new T.BoxGeometry(.32,.035,.19),0x3d4c56,0,0,-.18,0,0,a));
    const material=standard(0xffffff);material.vertexColors=true;this.bodies=pool(scene,joined(parts),material,this.capacity);
    const flame=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.48,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
    this.exhaust=pool(scene,new T.ConeGeometry(.105,.85,6).rotateX(Math.PI/2).translate(0,0,-.64),flame,this.capacity);
    const orb=standard(0xbf3820);orb.emissive.set(0x74170b);orb.emissiveIntensity=.65;this.orbs=pool(scene,new T.IcosahedronGeometry(.22,1),orb,96);
    const orbCore=basic(0xffa53e);orbCore.toneMapped=false;this.orbCores=pool(scene,new T.OctahedronGeometry(.17,1),orbCore,96);
    this.bullets=pool(scene,new T.CylinderGeometry(.048,.048,.30,6).rotateX(Math.PI/2),standard(0xffffff),this.capacity);
    const tip=basic(0xffffff);tip.toneMapped=false;this.tips=pool(scene,new T.SphereGeometry(.054,6,4).translate(0,0,.18),tip,this.capacity);
    const shell=joined([painted(new T.CylinderGeometry(.075,.09,.38,8),0xffffff,0,0,0,Math.PI/2),painted(new T.ConeGeometry(.075,.14,8),0xffffff,0,0,.25,Math.PI/2),painted(new T.TorusGeometry(.095,.025,3,8),0xffffff,0,0,-.13)]);
    this.hostileShells=pool(scene,shell,standard(0xb34b2d),96);this.hostileTips=pool(scene,new T.OctahedronGeometry(.065).translate(0,0,.29),basic(0xffa746),96);
    this.beamShells=pool(scene,new T.CylinderGeometry(.5,.5,1,10).rotateX(Math.PI/2),new T.MeshBasicMaterial({color:0xff7428,transparent:true,opacity:.62,depthWrite:false,toneMapped:false}),4);
    this.beamCores=pool(scene,new T.CylinderGeometry(.18,.18,1,8).rotateX(Math.PI/2),new T.MeshBasicMaterial({color:0xffdc92,toneMapped:false}),4);
    this.wakes=pool(scene,new T.ConeGeometry(.045,.55,5).rotateX(Math.PI/2).translate(0,0,-.37),new T.MeshBasicMaterial({color:0x76dcff,transparent:true,opacity:.35,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}),this.capacity);
  }
  update(friendly:Shot[],hostile:EnemyShot[],options:MissileOptions){
    let count=0,bulletCount=0,wakeCount=0,orbCount=0,shellCount=0;if(options.visible===false){this.reset();return;}
    const write=(position:T.Vector3,direction:T.Vector3,scale:number,enemy=false,kind:string='pulse',owner:'commander'|'troop'='commander')=>{
      if(count+bulletCount>=this.capacity)return;this.dummy.position.copy(position);this.dummy.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),direction);this.dummy.scale.setScalar(scale);
      const rocket=kind==='missile'||kind==='rocket';
      if(enemy&&!rocket){if(shellCount>=96)return;this.dummy.updateMatrix();this.hostileShells.setMatrixAt(shellCount,this.dummy.matrix);this.hostileTips.setMatrixAt(shellCount++,this.dummy.matrix);return;}
      if(!rocket){this.dummy.scale.z*=kind==='rail'?1.65:kind==='cannon'?1.2:1;this.dummy.updateMatrix();this.bullets.setMatrixAt(bulletCount,this.dummy.matrix);this.tips.setMatrixAt(bulletCount,this.dummy.matrix);
        this.bullets.setColorAt(bulletCount,this.color.set(enemy?0xd86d39:owner==='troop'?0x2c93cd:0xd3a54e));
        this.tips.setColorAt(bulletCount,this.color.set(enemy?0xffa12b:owner==='troop'?0x53c9ff:0xffca54));bulletCount++;
        if(options.overdrive&&!enemy){this.wakes.setMatrixAt(wakeCount++,this.dummy.matrix);}return;
      }
      this.dummy.updateMatrix();this.bodies.setMatrixAt(count,this.dummy.matrix);this.bodies.setColorAt(count,this.color.set(enemy?0xff9262:owner==='troop'?0x69baff:0xffd18a));
      this.dummy.scale.set(scale,scale,scale*(options.overdrive&&!enemy?2:1));this.dummy.updateMatrix();this.exhaust.setMatrixAt(count,this.dummy.matrix);this.exhaust.setColorAt(count,this.color.set(enemy?0xff6024:owner==='troop'?0x59bcff:0xffc064));count++;
    };
    const delta=Math.max(0,Math.min(.25,options.simulationTime!==undefined&&this.previousTime!==undefined?options.simulationTime-this.previousTime:options.dt??0));
    this.previousTime=options.simulationTime;const used=new Set<FriendlyPath>(),paths:FriendlyPath[]=[];
    for(const p of friendly.slice(0,this.capacity)){
      let path:FriendlyPath|undefined,best=.3;
      for(const old of this.friendlyPaths){if(used.has(old)||old.shot.kind!==p.kind||old.shot.owner!==p.owner)continue;
        const error=Math.hypot(old.shot.x+p.dx*delta-p.x,old.shot.z+p.dz*delta-p.z);if(error<best){best=error;path=old;}}
      if(path){used.add(path);if(path.boss&&options.bossPhase){path.targetZ=(options.bossZ??12)-(options.bossSurfaceOffset??.85);path.targetHeight=(options.bossY??0)+(options.bossImpactHeight??4.31);}
        else if(path.targetId!==undefined){const target=options.targets?.find(t=>t.id===path!.targetId);if(target){path.targetZ=targetSurface(target);path.targetHeight=targetHeight(target.kind,target.variant);}}
      }else path=acquirePath(p,options,delta||1/60);
      // Retain the prior aim plane if a target dies; surviving rail rounds never jump to another height.
      path.shot={...p};paths.push(path);const pose=presentPath(p,path,options);
      write(pose.position,pose.direction,p.kind==='missile'?1.25:p.heavy?1.05:.85,false,p.kind??'pulse',p.owner??'commander');
    }this.friendlyPaths=paths;
    const live=new Set<number>();
    for(const p of hostile){if(live.size>=96)break;live.add(p.id);
      if(!this.hostileLaunchZ.has(p.id)){const sourceId=(p as EnemyShot&{sourceId?:number}).sourceId??0,source=sourceId>0?options.targets?.find(t=>t.id===sourceId):undefined;
        this.hostileLaunchZ.set(p.id,{z:Math.max(1,sourceId>0?(source?.z??p.z):(options.bossZ??p.z)),height:sourceId>0?1.65:options.bossPhase?(options.bossY??0)+(options.bossLaunchHeight??3):.85});}
      const launch=this.hostileLaunchZ.get(p.id)!;
      const height=.85+(launch.height-.85)*Math.max(0,Math.min(1,p.z/launch.z));
      if(p.kind==='orb'){if(orbCount>=96)continue;this.dummy.position.set(p.x,height,-p.z*options.depthScale);this.dummy.rotation.set(0,0,0);this.dummy.scale.setScalar(Math.max(.8,p.radius/.18));this.dummy.updateMatrix();this.orbs.setMatrixAt(orbCount,this.dummy.matrix);this.dummy.position.z+=.13*this.dummy.scale.z;this.dummy.updateMatrix();this.orbCores.setMatrixAt(orbCount++,this.dummy.matrix);}
      else write(new T.Vector3(p.x,height,-p.z*options.depthScale),new T.Vector3(p.dx,(launch.height-.85)/launch.z*p.dz,-p.dz*options.depthScale).normalize(),p.kind==='rocket'?1.45:1.8,true,p.kind);
    }
    for(const id of this.hostileLaunchZ.keys())if(!live.has(id))this.hostileLaunchZ.delete(id);
    changed(this.bodies,count);changed(this.exhaust,count);changed(this.orbs,orbCount);changed(this.orbCores,orbCount);changed(this.bullets,bulletCount);changed(this.tips,bulletCount);changed(this.wakes,wakeCount);changed(this.hostileShells,shellCount);changed(this.hostileTips,shellCount);
    this.updateBeams(options);
  }
  private updateBeams(options:MissileOptions){
    let count=0;for(const beam of options.lasers??[]){if(count>=4||beam.time<=0)continue;
      const from=new T.Vector3(beam.x,(options.bossY??0)+(options.bossLaunchHeight??3.4),-beam.z*options.depthScale),to=new T.Vector3(beam.endX,1.25,-beam.endZ*options.depthScale),direction=to.clone().sub(from),length=direction.length();if(length<.01)continue;
      this.dummy.position.copy(from).add(to).multiplyScalar(.5);this.dummy.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),direction.normalize());this.dummy.scale.set(Math.max(.05,beam.width),Math.max(.05,beam.width),length);this.dummy.updateMatrix();this.beamShells.setMatrixAt(count,this.dummy.matrix);this.beamCores.setMatrixAt(count,this.dummy.matrix);count++;
    }changed(this.beamShells,count);changed(this.beamCores,count);
  }
  reset(){for(const mesh of [this.bodies,this.exhaust,this.orbs,this.orbCores,this.bullets,this.tips,this.wakes,this.beamShells,this.beamCores,this.hostileShells,this.hostileTips])changed(mesh,0);this.hostileLaunchZ.clear();this.friendlyPaths=[];this.previousTime=undefined;}
  dispose(){for(const mesh of [this.bodies,this.exhaust,this.orbs,this.orbCores,this.bullets,this.tips,this.wakes,this.beamShells,this.beamCores,this.hostileShells,this.hostileTips]){this.scene.remove(mesh);mesh.geometry.dispose();(mesh.material as T.Material).dispose();mesh.dispose();}}
}

export type ArmyAbilityOptions={depthScale:number;armyRadius:number;armyCenterX?:number;armyCenterZ:number;visible?:boolean};
export class ArmyAbilityVisuals {
  private group=new T.Group();private dome:T.Mesh;private domeGrid:T.Mesh;private boundary:T.Mesh;private wave:T.Mesh;
  private arcs:T.LineSegments;private arcPositions=new Float32Array(24*6);private overdrive:T.Mesh;private timeRings:T.InstancedMesh;private timeHands:T.InstancedMesh;private frostSweep:T.Mesh;private hasteTrace:T.Mesh;private timeDummy=new T.Object3D();
  private clock=0;private wasEmp=false;private pulseAge=10;
  constructor(private scene:T.Scene){
    this.dome=new T.Mesh(new T.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI/2),new T.MeshBasicMaterial({color:0x54cfff,transparent:true,opacity:.12,side:T.DoubleSide,depthWrite:false}));
    this.domeGrid=new T.Mesh(this.dome.geometry,new T.MeshBasicMaterial({color:0x8deaff,wireframe:true,transparent:true,opacity:.13,depthWrite:false}));
    this.boundary=new T.Mesh(new T.TorusGeometry(1,.024,4,64),basic(0x92eaff,.8));this.boundary.rotation.x=-Math.PI/2;
    this.wave=new T.Mesh(new T.RingGeometry(.92,1,64),new T.MeshBasicMaterial({color:0xb3a0ff,transparent:true,opacity:.65,side:T.DoubleSide,depthWrite:false,toneMapped:false}));this.wave.rotation.x=-Math.PI/2;
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(this.arcPositions,3).setUsage(T.DynamicDrawUsage));
    this.arcs=new T.LineSegments(geometry,new T.LineBasicMaterial({color:0xd2c5ff,transparent:true,opacity:.9,depthWrite:false,toneMapped:false}));this.arcs.frustumCulled=false;
    this.overdrive=new T.Mesh(new T.RingGeometry(.88,1,48),new T.MeshBasicMaterial({color:0xffb342,transparent:true,opacity:.6,side:T.DoubleSide,depthWrite:false,toneMapped:false}));this.overdrive.rotation.x=-Math.PI/2;
    const ringMaterial=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.43,depthWrite:false,side:T.DoubleSide,toneMapped:false});
    this.timeRings=pool(scene,new T.RingGeometry(.76,.84,24).rotateX(-Math.PI/2),ringMaterial,16);this.group.add(this.timeRings);
    const hands=joined([painted(new T.BoxGeometry(.025,.018,.36),0x68d59d,0,0,-.15),painted(new T.BoxGeometry(.23,.018,.025),0x68d59d,.1,0,0)]);const handMaterial=basic(0xffffff,.5);handMaterial.vertexColors=true;handMaterial.toneMapped=false;
    this.timeHands=pool(scene,hands,handMaterial,16);this.group.add(this.timeHands);
    this.frostSweep=new T.Mesh(new T.RingGeometry(.95,1,32,1,0,Math.PI),new T.MeshBasicMaterial({color:0x9cecff,transparent:true,opacity:.24,side:T.DoubleSide,depthWrite:false,toneMapped:false}));this.frostSweep.rotation.x=-Math.PI/2;this.frostSweep.visible=false;this.group.add(this.frostSweep);
    const chevrons=joined([-1,1].flatMap(side=>[painted(new T.BoxGeometry(.045,.018,.34),0xff8739,side*.11,0,-.05,0,side*-.62,0),painted(new T.BoxGeometry(.045,.018,.34),0xff8739,side*.11,0,.30,0,side*-.62,0)]));const hasteMaterial=basic(0xffffff,.65);hasteMaterial.vertexColors=true;hasteMaterial.toneMapped=false;this.hasteTrace=new T.Mesh(chevrons,hasteMaterial);this.hasteTrace.visible=false;this.group.add(this.hasteTrace);
    this.group.add(this.dome,this.domeGrid,this.boundary,this.wave,this.arcs,this.overdrive);scene.add(this.group);this.group.visible=false;
  }
  update(s:Snapshot,options:ArmyAbilityOptions,dt:number){
    this.clock+=Math.max(0,dt);this.pulseAge+=Math.max(0,dt);const timeState=s as Snapshot&{timePower?:string;timePowerTime?:number};const timeActive=(timeState.timePowerTime??0)>0&&options.visible!==false;const active=s.ability>0&&options.visible!==false;
    const emp=active&&s.relic===1;if(emp&&!this.wasEmp)this.pulseAge=0;this.wasEmp=emp;
    const centerX=options.armyCenterX??s.x,heroDistance=Math.hypot(s.x-centerX,options.armyCenterZ);
    this.group.position.set(centerX,.04,options.armyCenterZ);this.group.visible=options.visible!==false&&(active||timeActive||this.pulseAge<.85);
    const radius=Math.max(1.6,options.armyRadius+.65,heroDistance+1.0);const shield=active&&s.relic===0;
    this.dome.visible=this.domeGrid.visible=this.boundary.visible=shield;
    // Commander is almost 2.8m tall in the current renderer and stands away
    // from the army centroid. Solve the ellipsoid height at his position.
    const heroSurface=Math.sqrt(Math.max(.08,1-(heroDistance/radius)**2));
    const domeHeight=Math.max(3.1,3.05/heroSurface,radius*.72);
    this.dome.scale.set(radius,domeHeight,radius);this.domeGrid.scale.copy(this.dome.scale);
    this.boundary.scale.setScalar(radius);(this.dome.material as T.MeshBasicMaterial).opacity=.11+.025*Math.sin(this.clock*5);
    this.wave.position.set(s.x-centerX,0,-options.armyCenterZ);
    this.wave.visible=this.pulseAge<.85;const waveRadius=1+this.pulseAge*16;this.wave.scale.setScalar(waveRadius);(this.wave.material as T.MeshBasicMaterial).opacity=Math.max(0,.7*(1-this.pulseAge/.85));
    const phase=Math.floor(this.clock*18);let segments=0;
    if(emp)for(const target of s.targets){
      if(target.kind!=='enemy'||target.hp<=0||target.z>=13||Math.abs(target.x-s.x)>=3.2||segments>=24)continue;
      const x=target.x-centerX,z=-target.z*options.depthScale-options.armyCenterZ;
      for(let i=0;i<3&&segments<24;i++){
        const j=segments++*6,flip=(i%2?1:-1),jitter=Math.sin(phase*7+target.id+i)*.10;
        this.arcPositions[j]=x+flip*.32;this.arcPositions[j+1]=.35+i*.38;this.arcPositions[j+2]=z+.12+jitter;
        this.arcPositions[j+3]=x-flip*.25;this.arcPositions[j+4]=.70+i*.38;this.arcPositions[j+5]=z+.20-jitter;
      }
    }
    // The core gives the nearby boss a separate EMP hit out to Z<14.
    if(emp&&s.phase==='boss'&&s.bossHp>0&&s.bossZ<14&&Math.abs(s.bossX-s.x)<3.2){
      const x=s.bossX-centerX,z=-s.bossZ*options.depthScale-options.armyCenterZ;
      for(let i=0;i<8&&segments<24;i++){
        const j=segments++*6,a=i/8*Math.PI*2,jitter=Math.sin(phase*5+i)*.12;
        this.arcPositions[j]=x+Math.cos(a)*.7;this.arcPositions[j+1]=2.4+Math.sin(a)*.7;this.arcPositions[j+2]=z+.7+jitter;
        this.arcPositions[j+3]=x+Math.cos(a+.45)*.9;this.arcPositions[j+4]=2.4+Math.sin(a+.45)*.9;this.arcPositions[j+5]=z+.75-jitter;
      }
    }
    this.arcs.visible=emp&&segments>0;this.arcs.geometry.setDrawRange(0,segments*2);
    this.arcs.geometry.getAttribute('position').needsUpdate=true;
    this.overdrive.visible=active&&s.relic===2;this.overdrive.scale.setScalar(radius*(1+.045*Math.sin(this.clock*12)));this.overdrive.rotation.z=this.clock;
    let tc=0,hc=0;const freeze=timeActive&&timeState.timePower==='freeze',slow=timeActive&&timeState.timePower==='slow';
    if(freeze||slow){const color=new T.Color(freeze?0x87dfff:0x62d69c);
      const mark=(x:number,z:number,size:number)=>{if(tc>=16)return;this.timeDummy.position.set(x-centerX,.025,-z*options.depthScale-options.armyCenterZ);this.timeDummy.rotation.set(0,0,0);this.timeDummy.scale.setScalar(size*(freeze?1:1+.05*Math.sin(this.clock*3)));this.timeDummy.updateMatrix();this.timeRings.setMatrixAt(tc,this.timeDummy.matrix);this.timeRings.setColorAt(tc++,color);
        if(slow){this.timeDummy.rotation.y=this.clock*.5;this.timeDummy.updateMatrix();this.timeHands.setMatrixAt(hc++,this.timeDummy.matrix);}};
      for(const target of s.targets)if(target.kind==='enemy'&&target.hp>0&&target.z>=0&&target.z<17)mark(target.x,target.z,target.variant>0?.8:.52);
      if(s.phase==='boss'&&s.bossHp>0)mark(s.bossX,s.bossZ,1.6);
    }
    changed(this.timeRings,tc);changed(this.timeHands,hc);
    this.frostSweep.visible=freeze;this.frostSweep.position.set(s.x-centerX,.02,-Math.max(2,Math.min(7,s.frontline??6))*options.depthScale-options.armyCenterZ);this.frostSweep.scale.setScalar(2.1+.12*Math.sin(this.clock*2));
    this.hasteTrace.visible=timeActive&&timeState.timePower==='haste';this.hasteTrace.position.set(s.x-centerX,.035,-options.armyCenterZ-.35);this.hasteTrace.scale.setScalar(1+.10*Math.sin(this.clock*9));

  }
  reset(){this.group.visible=false;this.wasEmp=false;this.pulseAge=10;changed(this.timeRings,0);changed(this.timeHands,0);this.frostSweep.visible=false;this.hasteTrace.visible=false;}
  dispose(){this.scene.remove(this.group);const geometries=new Set<T.BufferGeometry>();this.group.traverse(obj=>{const mesh=obj as T.Mesh;if(mesh.geometry){geometries.add(mesh.geometry);(mesh.material as T.Material).dispose();if((mesh as T.InstancedMesh).isInstancedMesh)(mesh as T.InstancedMesh).dispose();}});geometries.forEach(g=>g.dispose());}
}
