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

/** Camera-facing combustion particles in world space, with soft turbulent edges. */
function combustionMaterial(time:{value:number},smoke:boolean){
  return new T.ShaderMaterial({uniforms:{uTime:time,uSmoke:{value:smoke?1:0}},transparent:true,depthWrite:false,
    blending:smoke?T.NormalBlending:T.AdditiveBlending,toneMapped:false,vertexColors:true,
    vertexShader:`attribute float instanceOpacity;
      varying vec2 vUv; varying vec3 vTint; varying float vFade; varying float vSeed;
      void main(){vUv=uv;vFade=instanceOpacity;
        #ifdef USE_INSTANCING_COLOR
        vTint=instanceColor;
        #else
        vTint=vec3(1.);
        #endif
        vec4 centre=instanceMatrix*vec4(0.,0.,0.,1.);vSeed=dot(centre.xyz,vec3(2.7,4.3,1.9));
        vec2 size=vec2(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz));
        vec4 eye=modelViewMatrix*centre;eye.xy+=position.xy*size;gl_Position=projectionMatrix*eye;}`,
    fragmentShader:`uniform float uTime;uniform float uSmoke;varying vec2 vUv;varying vec3 vTint;varying float vFade;varying float vSeed;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){vec2 p=vUv*2.-1.;vec2 flow=p*3.6+vec2(vSeed,uTime*-1.6);
        float n=.57*noise(flow)+.28*noise(flow*2.1+uTime*.4)+.15*noise(flow*4.3);
        float d=length(p),edge=1.-smoothstep(.50+n*.24,.98,d);
        if(edge<.005)discard;
        float hot=pow(max(0.,1.-d*1.55),1.4)*(1.1-n*.35);
        vec3 fire=mix(vTint*1.55,vec3(1.,.96,.76)*2.2,hot);
        vec3 soot=vTint*(.72+n*.65);
        gl_FragColor=vec4(mix(fire,soot,uSmoke),edge*vFade*mix(.82,.33,uSmoke));}`});
}

type Chunk={p:T.Vector3;v:T.Vector3;r:T.Vector3;spin:T.Vector3;size:T.Vector3;color:T.Color;life:number;max:number;bounce:number;kind?:'plate'|'rotor'|'strut'};
type Spark={p:T.Vector3;v:T.Vector3;life:number;max:number;color:T.Color};
type Burst={p:T.Vector3;delay:number;strength:number};
type Puff={p:T.Vector3;v:T.Vector3;life:number;max:number;size:number;kind:'smoke'|'fire'|'flash';color:T.Color};
type SacrificeStream={root:T.Object3D;from:T.Vector3;age:number;delay:number};
type Acquisition={root:T.Object3D;age:number;radius:number;height:number;color:T.Color};
type Fragment={group:T.Group;v:T.Vector3;spin:T.Vector3;delay:number;age:number;floor:number;settled:boolean;materials:T.Material[];ownedGeometry?:T.BufferGeometry};
function visibleInTree(object:T.Object3D,root:T.Object3D){for(let p:T.Object3D|null=object;p;p=p.parent){if(!p.visible)return false;if(p===root)break;}return true;}

export class CombatVisuals {
  private combustionTime={value:0};
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
    this.smoke=pool(scene,new T.PlaneGeometry(2.7,2.7),combustionMaterial(this.combustionTime,true),this.particleCapacity);
    this.fire=pool(scene,new T.PlaneGeometry(3.2,3.2),combustionMaterial(this.combustionTime,false),this.particleCapacity);
    const light=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.75,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
    this.acquireRing=pool(scene,new T.TorusGeometry(1,.025,3,32).rotateX(Math.PI/2),light,4);
    const trace=joined([painted(new T.BoxGeometry(.025,.28,.025),0xffffff,-.035,.26,0,0,0,-.25),painted(new T.BoxGeometry(.025,.23,.025),0xffffff,.01,.04,0,0,0,.55),painted(new T.BoxGeometry(.025,.28,.025),0xffffff,-.02,-.19,0,0,0,-.25)]);
    this.acquireTrace=pool(scene,trace,light.clone(),32);instanceFade(this.acquireRing,4);instanceFade(this.acquireTrace,32);
    const streamMaterial=new T.MeshBasicMaterial({color:0x6ee8ff,transparent:true,opacity:.75,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
    this.streamBodies=pool(scene,new T.CylinderGeometry(.035,.035,1,6).rotateX(Math.PI/2),streamMaterial,48);this.streamHeads=pool(scene,new T.OctahedronGeometry(.11),streamMaterial.clone(),48);instanceFade(this.streamBodies,48);instanceFade(this.streamHeads,48);
    instanceFade(this.debris,this.debrisCapacity);
    for(const mesh of [this.smoke,this.fire])mesh.geometry.setAttribute('instanceOpacity',new T.InstancedBufferAttribute(new Float32Array(this.particleCapacity),1));
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
  bossDeath(root:T.Object3D,reactorPosition?:T.Vector3){
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
    const pos=root.getWorldPosition(new T.Vector3()),torso=root.getObjectByName('Torso')??sources.find(o=>/torso/i.test(o.name));
    // Collapse can put the root below the deck. The actual posed reactor remains above it.
    const anchor=reactorPosition?.clone()??(torso?new T.Box3().setFromObject(torso).getCenter(new T.Vector3()):new T.Vector3(pos.x,pos.y+2,pos.z));
    if(!anchor.toArray().every(Number.isFinite))anchor.set(pos.x,pos.y+2,pos.z);
    anchor.y=Math.max(.45,anchor.y);
    this.bossBurn=new T.Vector3(anchor.x,.4,anchor.z);this.bossBurnTime=2.8;this.bossEmission=0;
    // One bounded rupture, using the existing shared fire/smoke/spark/debris pools.
    this.puff(anchor.x,anchor.y,anchor.z,'flash',1.02,.13,0xffead0);
    for(let i=0;i<12;i++){const a=i*Math.PI*2/12,r=.12+(i%3)*.16;
      this.puff(anchor.x+Math.cos(a)*r,anchor.y+(i%3)*.20,anchor.z+Math.sin(a)*r,'fire',.48+this.random()*.30,.40+this.random()*.34,i%3?0xff8a25:0xff4520);}
    for(let i=0;i<24;i++)this.spark(anchor.x,anchor.y,anchor.z,2.2, i%4?0xffbd61:0xd7f4ff);
    for(let i=0;i<5;i++)this.puff(anchor.x+(this.random()-.5)*.65,anchor.y+.20,anchor.z+(this.random()-.5)*.65,'smoke',.40+this.random()*.16,.85+this.random()*.35,0x505964);
    for(let i=0;i<10;i++)this.chunk(anchor.x,anchor.y,anchor.z,.16+this.random()*.10,i%3?0x69777e:0xd5a858,3.2,i%4===0?'rotor':i%4===1?'strut':'plate');
    this.later(anchor.x-.38,anchor.y+.22,anchor.z,.12,1.8);this.later(anchor.x+.38,anchor.y+.40,anchor.z,.27,1.6);
    for(const [i,p] of centers.slice(0,6).entries())this.later(p.x,Math.max(.25,p.y),p.z,.08+i*.095,i===0?2:1.2);
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
  powerAcquire(root:T.Object3D,kind:'guided'|'cannons'|'railburst'|'freeze'|'slow'|'haste'|'escort'){
    root.updateWorldMatrix(true,true);const bounds=new T.Box3().setFromObject(root),size=bounds.getSize(new T.Vector3());
    const colors={guided:0x49cfff,cannons:0xffb24a,railburst:0xba83ff,freeze:0xa7f0ff,slow:0x61d694,haste:0xff6639,escort:0x7de5e9};
    if(this.acquisitions.length>=4)this.acquisitions.shift();
    this.acquisitions.push({root,age:0,radius:T.MathUtils.clamp(Math.max(size.x,size.z)*.45,.5,1.4),height:T.MathUtils.clamp(size.y,1.5,3.5),color:new T.Color(colors[kind])});
    const position=root.getWorldPosition(new T.Vector3());for(let i=0;i<3;i++)this.puff(position.x,1.3+i*.3,position.z,'flash',.13,.22,colors[kind]);
  }
  update(dt:number){
    // Substeps keep bounce stable after a slow frame; freeze exactly when dt=0.
    const elapsed=Math.max(0,Math.min(dt,.15));this.age+=elapsed;this.combustionTime.value=this.age;
    if(elapsed>0){for(const burst of this.bursts){burst.delay-=elapsed;if(burst.delay<=0)this.impact(burst.p.x,burst.p.y,burst.p.z,burst.strength);}this.bursts=this.bursts.filter(b=>b.delay>0);}
    const steps=elapsed>0?Math.ceil(elapsed/(1/60)):0,step=steps?elapsed/steps:0;
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

export type RobotMotion={id:number;dt:number;velocityX?:number;velocityZ?:number;aimYaw?:number};
/** Original tracked silhouette, with independent shoulder and leg/tread suspensions. */
export class RobotFormation {
  private body:T.InstancedMesh;private eyes:T.InstancedMesh;private treadMark:T.InstancedMesh;
  private arms:T.InstancedMesh;private legs:T.InstancedMesh;private count=0;private dummy=new T.Object3D();private local=new T.Object3D();private matrix=new T.Matrix4();
  private poses=new Map<number,{yaw:number;phase:number;speed:number}>();private seen=new Set<number>();
  constructor(private scene:T.Scene,readonly capacity=200){
    const dark=0x25323c,red=0x963729,bronze=0x96754a,parts:T.BufferGeometry[]=[];
    for(const side of [-1,1])parts.push(painted(new T.SphereGeometry(.20,10,6),red,side*.31,.73,0));
    parts.push(painted(new T.CylinderGeometry(.29,.35,.35,10),dark,0,.46,0),painted(new T.SphereGeometry(.34,12,8),red,0,.66,0),painted(new T.CylinderGeometry(.16,.20,.25,8),dark,0,.95,0),painted(new T.BoxGeometry(.35,.11,.04),dark,0,.98,.16),painted(new T.CylinderGeometry(.065,.085,.55,8),dark,.16,.70,.39,Math.PI/2),painted(new T.TorusGeometry(.075,.025,4,8),bronze,.16,.70,.68));
    const material=standard(0xffffff);material.vertexColors=true;this.body=pool(scene,joined(parts),material,capacity);this.body.castShadow=true;
    const glow=joined([painted(new T.BoxGeometry(.24,.035,.045),0xffae37,0,.99,.19),painted(new T.OctahedronGeometry(.09),0xff5a22,0,.67,.30)]);
    const eyes=basic(0xffffff);eyes.vertexColors=true;eyes.toneMapped=false;this.eyes=pool(scene,glow,eyes,capacity);
    const limbMaterial=standard(0xffffff);limbMaterial.vertexColors=true;
    this.arms=pool(scene,joined([painted(new T.CylinderGeometry(.075,.075,.28,8),bronze,0,-.10,0),painted(new T.CapsuleGeometry(.10,.19,3,8),dark,0,-.29,.035),painted(new T.SphereGeometry(.115,8,6),red,0,-.23,.015),painted(new T.BoxGeometry(.14,.12,.18),dark,0,-.43,.07)]),limbMaterial,capacity*2);
    this.legs=pool(scene,joined([painted(new T.CapsuleGeometry(.14,.36,3,8),dark,0,-.25,0,Math.PI/2),painted(new T.CylinderGeometry(.105,.105,.31,8),bronze,0,-.25,.19,0,0,Math.PI/2),painted(new T.CylinderGeometry(.055,.055,.24,8),bronze,0,-.075,0),painted(new T.SphereGeometry(.10,8,6),red,0,-.13,0)]),limbMaterial.clone(),capacity*2);
    this.treadMark=pool(scene,new T.BoxGeometry(.27,.055,.065),standard(0xa48c63),capacity*2);
  }
  begin(){this.count=0;this.seen.clear();}
  add(x:number,worldZ:number,scale=1,yaw=0,hit=false,phase=0,motion?:RobotMotion){if(this.count>=this.capacity)return;
    let cycle=phase*7.5,speed=1,turn=yaw;
    if(motion){this.seen.add(motion.id);let pose=this.poses.get(motion.id);if(!pose){if(this.poses.size>=this.capacity)this.poses.delete(this.poses.keys().next().value!);pose={yaw,phase:phase*7.5,speed:0};this.poses.set(motion.id,pose);}
      const dt=T.MathUtils.clamp(motion.dt,0,.15),velocity=Math.hypot(motion.velocityX??0,motion.velocityZ??0),desired=motion.aimYaw??(velocity>.08?Math.atan2(motion.velocityX??0,motion.velocityZ??0):yaw),difference=Math.atan2(Math.sin(desired-pose.yaw),Math.cos(desired-pose.yaw));
      pose.yaw+=difference*(1-Math.exp(-dt*9));pose.speed+=(T.MathUtils.clamp(velocity/1.5,0,1.25)-pose.speed)*(1-Math.exp(-dt*12));pose.phase+=dt*7.5*pose.speed;turn=pose.yaw;cycle=pose.phase;speed=pose.speed;
    }
    this.dummy.position.set(x,.025,worldZ);this.dummy.rotation.set(hit?-.10:0,turn,0);this.dummy.scale.set(scale*.82,scale*1.1,scale);this.dummy.updateMatrix();this.body.setMatrixAt(this.count,this.dummy.matrix);this.eyes.setMatrixAt(this.count,this.dummy.matrix);
    const part=(mesh:T.InstancedMesh,index:number,px:number,py:number,pz:number,rx:number)=>{this.local.position.set(px,py,pz);this.local.rotation.set(rx,0,0);this.local.scale.setScalar(1);this.local.updateMatrix();this.matrix.multiplyMatrices(this.dummy.matrix,this.local.matrix);mesh.setMatrixAt(index,this.matrix);};
    for(const [j,side] of [-1,1].entries()){const swing=Math.sin(cycle+(side>0?Math.PI:0))*speed,index=this.count*2+j;
      part(this.arms,index,side*.34,.73,0,-swing*.24-(hit?.13:0));part(this.legs,index,side*.32,.45,0,swing*.10);
      const travel=((cycle/(Math.PI*2)+(side>0?.5:0))%1+1)%1;part(this.treadMark,index,side*.32,.28,-.25+travel*.50,0);
    }this.count++;
  }
  end(){changed(this.body,this.count);changed(this.eyes,this.count);for(const mesh of [this.arms,this.legs,this.treadMark])changed(mesh,this.count*2);for(const id of this.poses.keys())if(!this.seen.has(id))this.poses.delete(id);}
  reset(){this.poses.clear();this.begin();this.end();}
  dispose(){for(const mesh of [this.body,this.eyes,this.arms,this.legs,this.treadMark]){this.scene.remove(mesh);mesh.geometry.dispose();(mesh.material as T.Material).dispose();mesh.dispose();}this.poses.clear();}
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
  update(targets:ReadonlyArray<Target>,visible=true,emitters?:Partial<Record<string,T.Vector3>>){
    let charges=0,locks=0;for(const target of targets){const t=target as Target&{fireState?:string;aimX?:number;charge?:number};if(!visible||t.kind!=='enemy'||t.variant!==2||t.hp<=0||t.z<0||t.z>28)continue;
      const charge=T.MathUtils.clamp(t.charge??0,0,1),active=t.fireState==='tracking'||t.fireState==='locked'||t.fireState==='fire';
      if(active&&charges<this.capacity){const yaw=Math.atan2((t.aimX??t.x)-t.x,t.z),scale=.7+charge*.65;
        const socket=emitters?.['gunner:'+t.id];if(socket)this.dummy.position.copy(socket);else this.dummy.position.set(t.x+Math.sin(yaw)*.62,1.65,-t.z+Math.cos(yaw)*.62);this.dummy.rotation.set(0,yaw,0);this.dummy.scale.setScalar(scale);this.dummy.updateMatrix();this.charges.setMatrixAt(charges,this.dummy.matrix);this.charges.geometry.getAttribute('instanceOpacity').setX(charges++,.3+.7*charge);}
      if((t.fireState==='locked'||t.fireState==='fire')&&locks<this.capacity){this.dummy.position.set(t.aimX??t.x,.065,0);this.dummy.rotation.set(0,0,0);this.dummy.scale.setScalar(1);this.dummy.updateMatrix();this.locks.setMatrixAt(locks,this.dummy.matrix);this.locks.geometry.getAttribute('instanceOpacity').setX(locks++,.82);}
    }changed(this.charges,charges);changed(this.locks,locks);
  }
  reset(){changed(this.charges,0);changed(this.locks,0);}
  dispose(){for(const mesh of [this.charges,this.locks]){this.scene.remove(mesh);mesh.geometry.dispose();(mesh.material as T.Material).dispose();mesh.dispose();}}
}

export type MissileOptions={depthScale:number;bossPhase:boolean;bossZ?:number;bossX?:number;bossY?:number;bossLaunchHeight?:number;bossImpactHeight?:number;bossSurfaceOffset?:number;targets?:ReadonlyArray<Target>;formation?:ReadonlyArray<FormationUnit>;dt?:number;simulationTime?:number;overdrive:boolean;weapon:number;visible?:boolean;emitters?:Partial<Record<string,T.Vector3>>;bossCharging?:boolean;bossCharge?:number;hostileRate?:number;lasers?:ReadonlyArray<{id:number;x:number;z:number;endX:number;endZ:number;width:number;time:number}>};
type FriendlyPath={shot:Shot;originZ:number;launch:number;targetZ:number;targetHeight:number;targetId?:number;boss:boolean};
/** Legacy 2.5D layouts use surface anchors; spatial shots bypass them entirely. */
function targetHeight(kind:Target['kind'],variant=0){return kind==='enemy'?(variant>0?1.65:.78):kind==='crate'?.68:kind==='orb'?1.1:kind==='hazard'?.7:1.1;}
function targetSurface(target:Target){return target.z-Math.min(.85,Math.max(0,target.depth??0)*.8);}
export function combatImpactPoint(effect:Pick<Effect,'x'|'z'|'variant'|'entityId'>&{y?:number},options:MissileOptions){
  if(Number.isFinite(effect.y))return new T.Vector3(effect.x,effect.y!,-effect.z*options.depthScale);
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
  const spatial=shot as Shot&{y?:number;dy?:number};
  if(Number.isFinite(spatial.y)&&Number.isFinite(spatial.dy))return {position:new T.Vector3(shot.x,spatial.y!,-shot.z*options.depthScale),direction:new T.Vector3(shot.dx,spatial.dy!,-shot.dz*options.depthScale).normalize()};
  const range=Math.max(.1,path.targetZ-path.originZ),fraction=T.MathUtils.clamp((shot.z-path.originZ)/range,0,1);
  const height=T.MathUtils.lerp(path.launch,path.targetHeight,fraction);
  const dy=fraction>0&&fraction<1?(path.targetHeight-path.launch)/range*shot.dz:0;
  return {position:new T.Vector3(shot.x,height,-shot.z*options.depthScale),direction:new T.Vector3(shot.dx,dy,-shot.dz*options.depthScale).normalize()};
}
/** Pure projection for tests and other render adapters; preserves every simulated X/Z. */
export function friendlyProjectilePose(shot:Shot,options:MissileOptions){return presentPath(shot,acquirePath(shot,options,options.dt??1/60),options);}
type HostileLaunch={z:number;height:number;x:number;offset:T.Vector3;trailClock:number;lastTrail:T.Vector3};
type MissileTrail={p:T.Vector3;life:number;color:T.Color;size:number;max:number;hot:boolean;enemy:boolean};
export class CombatMissiles {
  private bodies:T.InstancedMesh;private exhaust:T.InstancedMesh;private orbs:T.InstancedMesh;private orbCores:T.InstancedMesh;
  private bullets:T.InstancedMesh;private tips:T.InstancedMesh;private wakes:T.InstancedMesh;private dummy=new T.Object3D();
  private color=new T.Color();readonly capacity=768;
  private beamShells:T.InstancedMesh;private beamCores:T.InstancedMesh;private hostileLaunchZ=new Map<number,HostileLaunch>();
  private hostileShells:T.InstancedMesh;private hostileTips:T.InstancedMesh;
  private trails:T.InstancedMesh;private hotTrails:T.InstancedMesh;private shellStreaks:T.InstancedMesh;private trailParticles:MissileTrail[]=Array.from({length:192},()=>({p:new T.Vector3(),life:0,color:new T.Color(),size:0,max:.18,hot:false,enemy:true}));private trailIndex=0;
  private beamFlow:T.InstancedMesh;private beamContact:T.InstancedMesh;private beamEmitter:T.InstancedMesh;private beamSheath:T.InstancedMesh;private beamCorona:T.InstancedMesh;private beamGround:T.InstancedMesh;private beamLight:T.PointLight;
  private clock=0;private hostileClock=0;private plasmaTime={value:0};private beamLightning:T.InstancedMesh;
  private friendlyPaths:FriendlyPath[]=[];private previousTime?:number;
  constructor(private scene:T.Scene){
    const nose=new T.LatheGeometry([new T.Vector2(.115,0),new T.Vector2(.11,.09),new T.Vector2(.083,.19),new T.Vector2(.042,.29),new T.Vector2(0,.34)],12);
    const parts=[painted(new T.CylinderGeometry(.115,.115,.74,12),0xe1d8c4,0,0,0,Math.PI/2),painted(nose,0xb08a52,0,0,.37,Math.PI/2),painted(new T.CylinderGeometry(.10,.13,.14,10),0x283c48,0,0,-.43,Math.PI/2)];
    for(const z of [-.25,.20])parts.push(painted(new T.TorusGeometry(.118,.025,4,12),0x596c75,0,0,z));
    for(const a of [0,Math.PI/2])parts.push(painted(new T.BoxGeometry(.43,.042,.30),0x384d5a,0,0,-.23,0,0,a));
    const material=standard(0xffffff);material.vertexColors=true;this.bodies=pool(scene,joined(parts),material,this.capacity+96);
    const flame=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.48,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
    this.exhaust=pool(scene,new T.SphereGeometry(.095,10,8).scale(1,1,2.5).translate(0,0,-.63),flame,this.capacity+96);
    const orb=standard(0xbf3820);orb.emissive.set(0x74170b);orb.emissiveIntensity=.65;this.orbs=pool(scene,new T.IcosahedronGeometry(.22,1),orb,96);
    const orbCore=basic(0xffa53e);orbCore.toneMapped=false;this.orbCores=pool(scene,new T.OctahedronGeometry(.17,1),orbCore,96);
    this.bullets=pool(scene,joined([painted(new T.CylinderGeometry(.070,.074,.42,8),0xffffff,0,0,0,Math.PI/2),painted(new T.SphereGeometry(.07,8,5).scale(1,1,1.35),0xffffff,0,0,.21),painted(new T.TorusGeometry(.076,.017,4,8),0xffffff,0,0,-.12)]),standard(0xffffff),this.capacity);
    const tip=basic(0xffffff);tip.toneMapped=false;this.tips=pool(scene,new T.SphereGeometry(.063,8,5).translate(0,0,.27),tip,this.capacity);
    const shell=joined([painted(new T.CylinderGeometry(.075,.09,.38,10),0x60717a,0,0,0,Math.PI/2),painted(new T.ConeGeometry(.075,.14,10),0xd79650,0,0,.25,Math.PI/2),painted(new T.TorusGeometry(.095,.025,4,10),0x303c43,0,0,-.13)]);
    const jacket=standard(0xffffff);jacket.vertexColors=true;this.hostileShells=pool(scene,shell,jacket,96);this.hostileTips=pool(scene,new T.OctahedronGeometry(.065).translate(0,0,.29),basic(0xffa746),96);
    const plasma=new T.MeshBasicMaterial({color:0xff782c,transparent:true,opacity:.48,depthWrite:false,toneMapped:false,side:T.DoubleSide});
    plasma.onBeforeCompile=shader=>{shader.uniforms.uCombatTime=this.plasmaTime;
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vEnergyUv;').replace('#include <begin_vertex>','#include <begin_vertex>\nvEnergyUv = uv;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vEnergyUv; uniform float uCombatTime;').replace('#include <color_fragment>','#include <color_fragment>\nfloat axial = 0.5 + 0.5 * sin(vEnergyUv.y * 95.0 - uCombatTime * 32.0 + vEnergyUv.x * 6.28);\nfloat helix = pow(0.5 + 0.5 * sin(vEnergyUv.x * 18.85 + vEnergyUv.y * 42.0 - uCombatTime * 16.0), 4.0);\ndiffuseColor.rgb = mix(vec3(1.0, 0.20, 0.035), vec3(1.0, 0.78, 0.32), helix * 0.75 + axial * 0.15);\ndiffuseColor.a *= 0.25 + axial * 0.25 + helix * 0.5;');};
    plasma.customProgramCacheKey=()=> 'iron-front-flowing-plasma-v1';
    this.beamShells=pool(scene,new T.CylinderGeometry(.5,.5,1,16,24,true).rotateX(Math.PI/2),plasma,4);
    this.beamCores=pool(scene,new T.CylinderGeometry(.23,.23,1,12).rotateX(Math.PI/2),new T.MeshBasicMaterial({color:0xffefd2,transparent:true,opacity:.86,depthWrite:false,toneMapped:false}),4);
    this.wakes=pool(scene,new T.CapsuleGeometry(.035,.22,2,6).rotateX(Math.PI/2).translate(0,0,-.30),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.45,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}),this.capacity);
    const trailMaterial=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.38,depthWrite:false,toneMapped:false});
    this.trails=pool(scene,new T.IcosahedronGeometry(1,1),trailMaterial,192);instanceFade(this.trails,192);
    this.hotTrails=pool(scene,new T.SphereGeometry(1,8,6),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.72,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}),192);instanceFade(this.hotTrails,192);
    this.shellStreaks=pool(scene,new T.CapsuleGeometry(.035,.40,2,6).rotateX(Math.PI/2).translate(0,0,-.42),new T.MeshBasicMaterial({color:0xffa651,transparent:true,opacity:.48,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}),96);
    this.beamFlow=pool(scene,new T.CylinderGeometry(.5,.5,1,5).rotateX(Math.PI/2),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.88,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}),288);instanceFade(this.beamFlow,288);
    // The beam terminates on the road at its existing simulated far endpoint. Sparks spray above this contact.
    this.beamContact=pool(scene,new T.CylinderGeometry(.018,.006,1,4).rotateX(Math.PI/2),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}),48);instanceFade(this.beamContact,48);
    this.beamEmitter=pool(scene,new T.SphereGeometry(1,12,8),new T.MeshBasicMaterial({color:0xffde9c,transparent:true,opacity:.68,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}),4);
    this.beamCorona=pool(scene,new T.TorusGeometry(1,.045,4,24,Math.PI*1.55),new T.MeshBasicMaterial({color:0xffc875,transparent:true,opacity:.55,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}),8);
    const sheath=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.FrontSide,uniforms:{uCombatTime:this.plasmaTime},
      vertexShader:'varying vec3 vEnergyNormal; varying vec3 vEnergyEye; varying vec2 vSheathUv; void main(){ mat4 world = modelMatrix * instanceMatrix; vec4 view = viewMatrix * world * vec4(position,1.0); vEnergyNormal = normalize(mat3(viewMatrix * world) * normal); vEnergyEye = -view.xyz; vSheathUv = uv; gl_Position = projectionMatrix * view; }',
      fragmentShader:'uniform float uCombatTime; varying vec3 vEnergyNormal; varying vec3 vEnergyEye; varying vec2 vSheathUv; void main(){float facing = abs(dot(normalize(vEnergyNormal),normalize(vEnergyEye))); float radialFade = pow(facing,1.6); float noise = 0.65 + 0.2*sin(vSheathUv.y*35.0-uCombatTime*18.0)+0.15*sin(vSheathUv.y*83.0+uCombatTime*13.0); float ends = smoothstep(0.0,0.08,vSheathUv.y)*smoothstep(0.0,0.08,1.0-vSheathUv.y); gl_FragColor = vec4(1.0,0.30,0.045,radialFade*noise*ends*0.34); }'});
    this.beamSheath=pool(scene,new T.CylinderGeometry(.5,.5,1,20,32,true).rotateX(Math.PI/2),sheath,4);
    const contact=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,
      vertexShader:'varying vec2 vContactUv; void main(){vContactUv=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}',
      fragmentShader:'varying vec2 vContactUv; void main(){float r=length(vContactUv-.5)*2.0;float a=pow(max(0.0,1.0-r),2.0);vec3 heat=mix(vec3(1.0,.19,.015),vec3(1.0,.87,.51),a);gl_FragColor=vec4(heat,a*.85);}' });
    this.beamGround=pool(scene,new T.PlaneGeometry(2,2).rotateX(-Math.PI/2),contact,4);
    this.beamLightning=pool(scene,new T.CylinderGeometry(.5,.5,1,5).rotateX(Math.PI/2),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.92,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}),384);instanceFade(this.beamLightning,384);
    this.beamLight=new T.PointLight(0xff8b36,0,3.5,2);this.beamLight.visible=false;scene.add(this.beamLight);

  }
  update(friendly:Shot[],hostile:EnemyShot[],options:MissileOptions){
    let count=0,bulletCount=0,wakeCount=0,orbCount=0,shellCount=0;if(options.visible===false){this.reset();return;}
    const delta=Math.max(0,Math.min(.25,options.simulationTime!==undefined&&this.previousTime!==undefined?options.simulationTime-this.previousTime:options.dt??0));
    this.clock+=delta;const hostileDelta=delta*(options.hostileRate??1);this.hostileClock+=hostileDelta;this.plasmaTime.value=this.hostileClock;
    for(const particle of this.trailParticles)particle.life=Math.max(0,particle.life-(particle.enemy?hostileDelta:delta));
    const write=(position:T.Vector3,direction:T.Vector3,scale:number,enemy=false,kind:string='pulse',owner:'commander'|'troop'='commander',dangerRadius=.2)=>{
      if(!enemy&&count+bulletCount>=this.capacity)return;if(enemy&&kind==='rocket'&&count>=this.capacity+96)return;this.dummy.position.copy(position);this.dummy.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),direction);this.dummy.scale.setScalar(scale);
      const rocket=kind==='missile'||kind==='rocket';
      if(enemy&&!rocket){if(shellCount>=96)return;const width=Math.max(.7,dangerRadius/.12);this.dummy.scale.set(width,width,1.4+dangerRadius*2.4);this.dummy.updateMatrix();this.hostileShells.setMatrixAt(shellCount,this.dummy.matrix);this.hostileTips.setMatrixAt(shellCount,this.dummy.matrix);this.dummy.scale.set(width*.75,width*.75,.75+dangerRadius*.7);this.dummy.updateMatrix();this.shellStreaks.setMatrixAt(shellCount++,this.dummy.matrix);return;}
      if(!rocket){this.dummy.scale.multiplyScalar(kind==='cannon'?1.25:kind==='rail'?1.05:1);this.dummy.scale.z*=kind==='rail'?1.65:kind==='cannon'?1.2:1;this.dummy.updateMatrix();this.bullets.setMatrixAt(bulletCount,this.dummy.matrix);this.tips.setMatrixAt(bulletCount,this.dummy.matrix);
        this.bullets.setColorAt(bulletCount,this.color.set(enemy?0xd86d39:owner==='troop'?0x2c93cd:0xd3a54e));
        this.tips.setColorAt(bulletCount,this.color.set(enemy?0xffa12b:owner==='troop'?0x53c9ff:0xffca54));bulletCount++;
        if(!enemy){this.dummy.scale.z*=options.overdrive?1.6:.72;this.dummy.updateMatrix();this.wakes.setMatrixAt(wakeCount,this.dummy.matrix);this.wakes.setColorAt(wakeCount++,this.color.set(owner==='troop'?0x64dfff:options.overdrive?0xffe297:0xffbd55));}return;
      }
      this.dummy.updateMatrix();this.bodies.setMatrixAt(count,this.dummy.matrix);this.bodies.setColorAt(count,this.color.set(enemy?0xff9262:owner==='troop'?0x69baff:0xffd18a));
      const flutter=enemy?this.hostileClock:this.clock;this.dummy.scale.set(scale,scale,scale*(.85+.12*Math.sin(flutter*55+position.x*2)));this.dummy.updateMatrix();this.exhaust.setMatrixAt(count,this.dummy.matrix);this.exhaust.setColorAt(count,this.color.set(enemy?0xff6024:owner==='troop'?0x59bcff:0xffc064));count++;
    };
    this.previousTime=options.simulationTime;const used=new Set<FriendlyPath>(),paths:FriendlyPath[]=[];
    for(const p of friendly.slice(0,this.capacity)){
      let path:FriendlyPath|undefined,best=.3;
      for(const old of this.friendlyPaths){if(used.has(old)||old.shot.kind!==p.kind||old.shot.owner!==p.owner)continue;
        const id=(p as Shot&{id?:number}).id,previousId=(old.shot as Shot&{id?:number}).id;
        if(id!==undefined){if(id===previousId){path=old;break;}continue;}
        const error=Math.hypot(old.shot.x+p.dx*delta-p.x,old.shot.z+p.dz*delta-p.z);if(error<best){best=error;path=old;}}
      if(path){used.add(path);if(path.boss&&options.bossPhase){path.targetZ=(options.bossZ??12)-(options.bossSurfaceOffset??.85);path.targetHeight=(options.bossY??0)+(options.bossImpactHeight??4.31);}
        else if(path.targetId!==undefined){const target=options.targets?.find(t=>t.id===path!.targetId);if(target){path.targetZ=targetSurface(target);path.targetHeight=targetHeight(target.kind,target.variant);}}
      }else path=acquirePath(p,options,delta||1/60);
      // Retain the prior aim plane if a target dies; surviving rail rounds never jump to another height.
      path.shot={...p};paths.push(path);const pose=presentPath(p,path,options);
      write(pose.position,pose.direction,p.kind==='missile'?1.45:p.heavy?1.20:1.0,false,p.kind??'pulse',p.owner??'commander');
      const trail=path as FriendlyPath&{trailP?:T.Vector3;trailClock?:number};if(p.kind==='missile'){trail.trailClock=Math.min(.06,(trail.trailClock??0)+delta);if(!trail.trailP)trail.trailP=pose.position.clone();else if(delta>0&&trail.trailClock>=.025&&pose.position.distanceToSquared(trail.trailP)>.0064){trail.trailClock=0;trail.trailP.copy(pose.position);this.leaveTrail(pose.position,pose.direction,false,0xffce68);}}
    }this.friendlyPaths=paths;
    const live=new Set<number>();
    for(const p of hostile){if(live.size>=96)break;live.add(p.id);
      const sourceId=p.sourceId??0,source=sourceId>0?options.targets?.find(t=>t.id===sourceId):undefined,metadata=p as EnemyShot&{launchX?:number;launchZ?:number;launchY?:number;emitter?:string};
      if(!this.hostileLaunchZ.has(p.id)){
        const launchZ=metadata.launchZ??(sourceId>0?(source?.z??p.z):(options.bossZ??p.z)),launchY=metadata.launchY??(sourceId>0?1.65:options.bossPhase?(options.bossY??0)+(options.bossLaunchHeight??3):.85),launchX=metadata.launchX??p.x;
        const key=metadata.emitter==='gunner'?'gunner:'+sourceId:metadata.emitter??(sourceId>0?'gunner:'+sourceId:'core'),socket=options.emitters?.[key];
        // Cache posed muzzle height once; an airborne shot never follows later rig motion.
        // Only X/Z blends during the first metre, then matches the core collision position.
        const presentationHeight=socket?.y??launchY,base=new T.Vector3(launchX,presentationHeight,-launchZ*options.depthScale),offset=socket?socket.clone().sub(base).setY(0):new T.Vector3();
        this.hostileLaunchZ.set(p.id,{z:Math.max(.1,launchZ),height:presentationHeight,x:launchX,offset,trailClock:0,lastTrail:base.clone()});
      }
      const launch=this.hostileLaunchZ.get(p.id)!,distance=Math.hypot(p.x-launch.x,p.z-launch.z),blend=Math.max(0,1-distance),height=.85+(launch.height-.85)*T.MathUtils.clamp(p.z/launch.z,0,1);
      const position=new T.Vector3(p.x,height,-p.z*options.depthScale).addScaledVector(launch.offset,blend),direction=new T.Vector3(p.dx,(launch.height-.85)/launch.z*p.dz,-p.dz*options.depthScale).normalize();
      if(p.kind==='orb'){if(orbCount>=96)continue;this.dummy.position.copy(position);this.dummy.rotation.set(0,0,0);this.dummy.scale.setScalar(Math.max(.8,p.radius/.18));this.dummy.updateMatrix();this.orbs.setMatrixAt(orbCount,this.dummy.matrix);this.dummy.position.z+=.13*this.dummy.scale.z;this.dummy.updateMatrix();this.orbCores.setMatrixAt(orbCount++,this.dummy.matrix);}
      else write(position,direction,p.kind==='rocket'?Math.max(1.1,p.radius/.17):1.8,true,p.kind,'commander',p.radius);
      launch.trailClock=Math.min(.07,launch.trailClock+hostileDelta);if(p.kind==='rocket'&&hostileDelta>0&&launch.trailClock>=.035&&position.distanceToSquared(launch.lastTrail)>.0064){launch.trailClock%=.035;launch.lastTrail.copy(position);this.leaveTrail(position,direction,true,0xff8136);}
    }
    for(const id of this.hostileLaunchZ.keys())if(!live.has(id))this.hostileLaunchZ.delete(id);
    changed(this.bodies,count);changed(this.exhaust,count);changed(this.orbs,orbCount);changed(this.orbCores,orbCount);changed(this.bullets,bulletCount);changed(this.tips,bulletCount);changed(this.wakes,wakeCount);changed(this.hostileShells,shellCount);changed(this.hostileTips,shellCount);changed(this.shellStreaks,shellCount);
    let trailCount=0,hotCount=0;for(const particle of this.trailParticles){if(particle.life<=0)continue;const progress=1-particle.life/particle.max,mesh=particle.hot?this.hotTrails:this.trails,index=particle.hot?hotCount++:trailCount++;this.dummy.position.copy(particle.p);this.dummy.rotation.set(0,0,0);this.dummy.scale.setScalar(particle.size*(particle.hot?1-progress*.55:1+progress*.7));this.dummy.updateMatrix();mesh.setMatrixAt(index,this.dummy.matrix);mesh.setColorAt(index,particle.color);mesh.geometry.getAttribute('instanceOpacity').setX(index,particle.life/particle.max);}changed(this.trails,trailCount);changed(this.hotTrails,hotCount);
    this.updateBeams(options);
  }
  private leaveTrail(position:T.Vector3,direction:T.Vector3,enemy:boolean,color:number){
    for(const hot of [true,false]){const particle=this.trailParticles[this.trailIndex++%192];particle.p.copy(position).addScaledVector(direction,hot?-.60:-.80);particle.life=particle.max=hot?.16:.22;particle.size=hot?.095:.08;particle.hot=hot;particle.enemy=enemy;particle.color.set(hot?color:0x84979a);}
  }
  private updateBeams(options:MissileOptions){
    let count=0,flow=0,emitters=0,sparks=0,corona=0,lightning=0;this.beamLight.visible=false;
    const coronaAt=(position:T.Vector3,axis:T.Vector3,charge:number)=>{
      for(let i=0;i<2;i++){this.dummy.position.copy(position).addScaledVector(axis,.012+i*.035);this.dummy.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),axis);this.dummy.rotateZ((i?-.7:1)*this.hostileClock*2+i*1.4);this.dummy.scale.setScalar((.20+i*.11)*(1+charge*.32+.025*Math.sin(this.hostileClock*21)));this.dummy.updateMatrix();this.beamCorona.setMatrixAt(corona++,this.dummy.matrix);}
    };
    for(const beam of options.lasers??[]){if(count>=4||beam.time<=0)continue;
      const from=options.emitters?.core?.clone()??new T.Vector3(beam.x,(options.bossY??0)+(options.bossLaunchHeight??3.4),-beam.z*options.depthScale),to=new T.Vector3(beam.endX,.07,-beam.endZ*options.depthScale),direction=to.clone().sub(from),length=direction.length();if(length<.01)continue;
      this.dummy.position.copy(to);this.dummy.position.y=.026;this.dummy.rotation.set(0,0,0);this.dummy.scale.set(.64,.64,.64);this.dummy.updateMatrix();this.beamGround.setMatrixAt(count,this.dummy.matrix);
      this.beamLight.visible=true;this.beamLight.position.copy(to).add(new T.Vector3(0,.32,0));this.beamLight.intensity=3.5+.4*Math.sin(this.hostileClock*33);
      const axis=direction.clone().normalize(),width=Math.max(.05,beam.width),across=new T.Vector3().crossVectors(axis,Math.abs(axis.y)<.9?new T.Vector3(0,1,0):new T.Vector3(1,0,0)).normalize(),up=new T.Vector3().crossVectors(across,axis).normalize();
      this.dummy.position.copy(from).add(to).multiplyScalar(.5);this.dummy.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),axis);this.dummy.scale.set(width,width,length);this.dummy.updateMatrix();this.beamShells.setMatrixAt(count,this.dummy.matrix);this.beamCores.setMatrixAt(count,this.dummy.matrix);
      // This faint soft-edged light is decorative; the damaging beam remains beam.width.
      this.dummy.scale.set(width*3,width*3,length);this.dummy.updateMatrix();this.beamSheath.setMatrixAt(count,this.dummy.matrix);
      const at=(t:number,f:number)=>{const clock=this.hostileClock,window=Math.sin(t*Math.PI),a=(Math.sin(t*27+f*2.7-clock*9)+.35*Math.sin(t*61-f+clock*17))*width*.20*window,b=(Math.cos(t*33+f*3.1-clock*11)+.30*Math.sin(t*73+f-clock*7))*width*.20*window;return from.clone().lerp(to,t).addScaledVector(across,a).addScaledVector(up,b);};
      // Short-lived jagged electrical ribbons decorate the full beam; they never widen collision.
      const epoch=Math.floor(this.hostileClock*16),hash=(n:number)=>{const v=Math.sin(n*12.9898+epoch*31.13)*43758.5453;return v-Math.floor(v);};
      const electricity=(a:T.Vector3,b:T.Vector3,diameter:number,color:number,alpha:number)=>{const line=b.clone().sub(a),len=line.length();if(lightning>=384||len<.001)return;this.dummy.position.copy(a).add(b).multiplyScalar(.5);this.dummy.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),line.normalize());this.dummy.scale.set(diameter,diameter,len+.015);this.dummy.updateMatrix();this.beamLightning.setMatrixAt(lightning,this.dummy.matrix);this.beamLightning.setColorAt(lightning,this.color.set(color));this.beamLightning.geometry.getAttribute('instanceOpacity').setX(lightning++,alpha);};
      const jagged=(t:number,seed:number)=>{const radius=Math.max(.18,width*1.3)*Math.sin(t*Math.PI),point=from.clone().lerp(to,t).addScaledVector(across,(hash(seed)-.5)*radius*1.7).addScaledVector(up,(hash(seed+47)-.5)*radius*1.5);point.y=Math.max(.075,point.y);return point;};
      for(let trunk=0;trunk<2;trunk++)for(let i=0;i<24;i++){const a=jagged(i/24,trunk*97+i*3),b=jagged((i+1)/24,trunk*97+(i+1)*3);electricity(a,b,Math.max(.028,width*(trunk?.10:.14)),trunk?0x81ceff:0xe7f7ff,.66+.30*hash(i+trunk*71));}
      for(let fork=0;fork<12;fork++){const t=.07+fork*.075,a=jagged(t,fork*3+97),angle=hash(fork+613)*Math.PI*2,out=Math.max(.30,width*1.2),bend=a.clone().addScaledVector(axis,.11+.1*hash(fork+19)).addScaledVector(across,Math.cos(angle)*out*.60).addScaledVector(up,Math.sin(angle)*out*.60),end=bend.clone().addScaledVector(axis,.08).addScaledVector(across,Math.cos(angle+.45)*out*.55).addScaledVector(up,Math.sin(angle+.45)*out*.55);bend.y=Math.max(.10,bend.y);end.y=Math.max(.10,end.y);electricity(a,bend,.034,0xc7edff,.85);electricity(bend,end,.022,0x72c5ff,.58+.3*hash(fork+102));}
      // Broken partial wraps, never complete hoops: each pulse dies before circling the core.
      for(let wrap=0;wrap<8;wrap++){const t=.10+wrap*.11,angle=hash(wrap+790)*Math.PI*2,radius=Math.max(.17,width*.7),center=from.clone().lerp(to,t);for(let segment=0;segment<3;segment++){const turn=angle+segment*.53,turnNext=turn+.53,a=center.clone().addScaledVector(across,Math.cos(turn)*radius).addScaledVector(up,Math.sin(turn)*radius),b=center.clone().addScaledVector(across,Math.cos(turnNext)*radius).addScaledVector(up,Math.sin(turnNext)*radius).addScaledVector(axis,.045);a.y=Math.max(.10,a.y);b.y=Math.max(.10,b.y);electricity(a,b,.030,0xb6eaff,.38+.35*hash(wrap+900));}}
      // Three irregular filaments bend inside the true damaging radius, not a spiral lattice.
      for(let f=0;f<3;f++)for(let segment=0;segment<24;segment++){const t=segment/24,next=(segment+1)/24,a=at(t,f),b=at(next,f),line=b.clone().sub(a),lineLength=line.length(),pulse=.6+.4*Math.sin(t*31+f*1.7-this.hostileClock*22);
        this.dummy.position.copy(a).add(b).multiplyScalar(.5);this.dummy.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),line.normalize());const thickness=width*(.06+.025*pulse);this.dummy.scale.set(thickness,thickness,lineLength+.008);this.dummy.updateMatrix();this.beamFlow.setMatrixAt(flow,this.dummy.matrix);this.beamFlow.setColorAt(flow,this.color.set(f===0?0xffefbf:f===1?0xffb857:0xff7130));this.beamFlow.geometry.getAttribute('instanceOpacity').setX(flow++,.55+.4*pulse);}
      for(let i=0;i<12;i++){const t=((this.hostileClock*5.5+i*.08331)%1+1)%1,angle=i*2.399+Math.sin(i*8)*.3,spread=.06+t*.40,radius=Math.sqrt(t)*spread;
        const point=to.clone().add(new T.Vector3(Math.cos(angle)*radius,.03+Math.sin(t*Math.PI)*.30,Math.sin(angle)*radius)),ray=point.clone().sub(to).normalize();this.dummy.position.copy(point);this.dummy.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),ray);this.dummy.scale.set(1-t*.65,1-t*.65,.06+.13*(1-t));this.dummy.updateMatrix();this.beamContact.setMatrixAt(sparks,this.dummy.matrix);this.beamContact.setColorAt(sparks,this.color.set(i%3?0xffbe64:0xffedc5));this.beamContact.geometry.getAttribute('instanceOpacity').setX(sparks++,1-t);}
      this.dummy.position.copy(from);this.dummy.scale.setScalar(Math.max(.34,width*.6));this.dummy.updateMatrix();this.beamEmitter.setMatrixAt(emitters++,this.dummy.matrix);coronaAt(from,axis,1);count++;
    }
    if(!count&&options.bossCharging&&options.emitters?.core){const charge=T.MathUtils.clamp(options.bossCharge??0,0,1),axis=new T.Vector3(0,-.15,1).normalize();this.dummy.position.copy(options.emitters.core);this.dummy.rotation.set(0,0,0);this.dummy.scale.setScalar(.13+charge*.21);this.dummy.updateMatrix();this.beamEmitter.setMatrixAt(emitters++,this.dummy.matrix);coronaAt(options.emitters.core,axis,charge);}
    changed(this.beamShells,count);changed(this.beamCores,count);changed(this.beamSheath,count);changed(this.beamFlow,flow);changed(this.beamContact,sparks);changed(this.beamEmitter,emitters);changed(this.beamCorona,corona);changed(this.beamLightning,lightning);changed(this.beamGround,count);
  }
  reset(){this.beamLight.visible=false;for(const mesh of this.meshes())changed(mesh,0);for(const particle of this.trailParticles)particle.life=0;this.hostileLaunchZ.clear();this.friendlyPaths=[];this.previousTime=undefined;this.clock=0;this.hostileClock=0;this.plasmaTime.value=0;this.trailIndex=0;}
  private meshes(){return [this.bodies,this.exhaust,this.orbs,this.orbCores,this.bullets,this.tips,this.wakes,this.beamShells,this.beamCores,this.hostileShells,this.hostileTips,this.trails,this.beamFlow,this.beamContact,this.beamEmitter,this.beamSheath,this.beamCorona,this.beamGround,this.hotTrails,this.shellStreaks,this.beamLightning];}
  dispose(){this.reset();this.scene.remove(this.beamLight);this.beamLight.dispose();for(const mesh of this.meshes()){this.scene.remove(mesh);mesh.geometry.dispose();(mesh.material as T.Material).dispose();mesh.dispose();}}

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
