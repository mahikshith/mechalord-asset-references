import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {Snapshot, Shot, EnemyShot} from './contract';

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

type Chunk={p:T.Vector3;v:T.Vector3;r:T.Vector3;spin:T.Vector3;size:T.Vector3;color:T.Color;life:number;max:number;bounce:number};
type Puff={p:T.Vector3;v:T.Vector3;life:number;max:number;size:number;kind:'smoke'|'fire'|'flash';color:T.Color};
type Fragment={group:T.Group;v:T.Vector3;spin:T.Vector3;delay:number;age:number;floor:number;settled:boolean;materials:T.Material[]};

export class CombatVisuals {
  readonly debrisCapacity=384;readonly particleCapacity=256;readonly fragmentCapacity=24;
  private chunks:Chunk[]=Array.from({length:384},()=>({p:new T.Vector3(),v:new T.Vector3(),r:new T.Vector3(),spin:new T.Vector3(),size:new T.Vector3(),color:new T.Color(),life:0,max:1,bounce:0}));
  private puffs:Puff[]=Array.from({length:256},()=>({p:new T.Vector3(),v:new T.Vector3(),life:0,max:1,size:1,kind:'smoke',color:new T.Color()}));
  private chunkIndex=0;private puffIndex=0;private seed=1921;private age=0;private dummy=new T.Object3D();
  private fragments:Fragment[]=[];private bossBurn?:T.Vector3;private bossBurnTime=0;private bossEmission=0;
  private debris:T.InstancedMesh;private smoke:T.InstancedMesh;private fire:T.InstancedMesh;
  constructor(private scene:T.Scene){
    this.debris=pool(scene,new T.BoxGeometry(1,1,1),standard(0xffffff),this.debrisCapacity);this.debris.castShadow=true;
    this.smoke=pool(scene,new T.IcosahedronGeometry(1,1),basic(0xffffff,.31),this.particleCapacity);
    const flame=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
    this.fire=pool(scene,new T.IcosahedronGeometry(1,0),flame,this.particleCapacity);
    instanceFade(this.debris,this.debrisCapacity);instanceFade(this.smoke,this.particleCapacity);instanceFade(this.fire,this.particleCapacity);
  }
  private random(){this.seed=(this.seed*16807)%2147483647;return this.seed/2147483647;}
  private puff(x:number,y:number,z:number,kind:Puff['kind'],size:number,life:number,color:number){
    const p=this.puffs[this.puffIndex++%this.particleCapacity];p.p.set(x,y,z);p.v.set((this.random()-.5)*1.2,.5+this.random()*1.5,(this.random()-.5)*1.2);
    p.kind=kind;p.size=size;p.life=p.max=life;p.color.set(color);
  }
  private chunk(x:number,y:number,z:number,size:number,color:number,power:number){
    const p=this.chunks[this.chunkIndex++%this.debrisCapacity];p.p.set(x,y,z);const a=this.random()*Math.PI*2;
    p.v.set(Math.cos(a)*power*(.35+this.random()),2+this.random()*power,Math.sin(a)*power*(.35+this.random()));
    p.r.set(this.random()*6,this.random()*6,this.random()*6);p.spin.set((this.random()-.5)*10,(this.random()-.5)*10,(this.random()-.5)*10);
    p.size.set(size*(.6+this.random()),size*(.2+this.random()*.4),size*(.55+this.random()));p.color.set(color);
    p.life=p.max=1.8+this.random()*.5;p.bounce=0;
  }
  enemyDeath(x:number,worldZ:number,variant=0,size=1){
    const elite=variant>0,count=elite?14:7;
    for(let i=0;i<count;i++)this.chunk(x+(this.random()-.5)*size,.4+this.random()*size,worldZ+(this.random()-.5)*size,(.22+this.random()*.06)*size,i%5===0?0x843322:i%5===3?0x98774b:i%2?0x273239:0x3a4850,elite?3.3:2.3);
    this.impact(x,.6*size,worldZ,elite?1.8:1);
  }
  allyLoss(x:number,worldZ:number,count:number){
    if(count<=0)return;const chunks=Math.min(8,Math.max(2,Math.ceil(count*1.5)));
    for(let i=0;i<chunks;i++)this.chunk(x+(this.random()-.5)*.7,.55+this.random()*.5,worldZ+(this.random()-.5)*.7,.16,i%2?0x34434b:0xd5c9a9,1.6);
    this.impact(x,.65,worldZ,.7);
  }
  impact(x:number,y:number,worldZ:number,strength=1){
    this.puff(x,y,worldZ,'flash',.55*strength,.13,0xffeec3);
    for(let i=0;i<5;i++)this.puff(x+(this.random()-.5)*.5,y,worldZ+(this.random()-.5)*.5,'fire',(.2+this.random()*.25)*strength,.25+this.random()*.4,i%2?0xff9c24:0xff4820);
    for(let i=0;i<4;i++)this.puff(x,y,worldZ,'smoke',(.22+this.random()*.22)*strength,.7+this.random()*.7,0x47515a);
  }
  muzzle(x:number,y:number,worldZ:number,hostile=false){this.puff(x,y,worldZ,'flash',.22,.07,hostile?0xff6b20:0xffd46d);}
  /** Copies mesh transforms before the caller hides the live boss. Does not own its geometry. */
  bossDeath(root:T.Object3D){
    if(this.fragments.length||this.bossBurnTime>0)return false;
    root.updateWorldMatrix(true,true);let count=0;const centers:T.Vector3[]=[];
    root.traverse(object=>{
      const mesh=object as T.Mesh;if(!mesh.isMesh||!mesh.visible||count>=this.fragmentCapacity)return;
      // Skip HUD/badges and effects; the actual articulated mesh pieces stay intact.
      if(!mesh.geometry.getAttribute('position')||mesh.name.toLowerCase().includes('badge'))return;
      mesh.geometry.computeBoundingBox();const center=mesh.geometry.boundingBox!.getCenter(new T.Vector3()).applyMatrix4(mesh.matrixWorld);
      const sourceMaterials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
      if(sourceMaterials.every(m=>m.opacity<=0||m.blending===T.AdditiveBlending))return;
      const materials=sourceMaterials.map(m=>{const clone=m.clone();clone.transparent=true;return clone;});
      const copy=new T.Mesh(mesh.geometry,Array.isArray(mesh.material)?materials:materials[0]);copy.castShadow=true;
      copy.matrixAutoUpdate=false;copy.matrix.copy(new T.Matrix4().makeTranslation(-center.x,-center.y,-center.z).multiply(mesh.matrixWorld));
      const group=new T.Group();group.position.copy(center);group.add(copy);this.scene.add(group);
      const name=(mesh.name+' '+mesh.parent?.name).toLowerCase();const delay=name.includes('torso')?.72:name.includes('head')?.43:.06*(count%5);
      const spread=center.clone().sub(root.getWorldPosition(new T.Vector3())).setY(0).normalize();
      const velocity=spread.multiplyScalar(1.1+this.random()*1.7);velocity.y=1+this.random()*2;
      const bounds=new T.Box3().setFromObject(group);const floor=Math.max(.12,center.y-bounds.min.y);
      this.fragments.push({group,v:velocity,spin:new T.Vector3((this.random()-.5)*2.5,(this.random()-.5)*2.5,(this.random()-.5)*2.5),delay,age:0,floor,settled:false,materials});centers.push(center);count++;
    });
    const pos=root.getWorldPosition(new T.Vector3());this.bossBurn=new T.Vector3(pos.x,.4,pos.z);this.bossBurnTime=2.8;this.bossEmission=0;
    this.impact(pos.x,2,pos.z,3);for(const p of centers.slice(0,8))this.impact(p.x,p.y,p.z,1.3);
    return count>0;
  }
  update(dt:number){
    // Substeps keep bounce stable after a slow frame; freeze exactly when dt=0.
    const elapsed=Math.max(0,Math.min(dt,.15));this.age+=elapsed;
    const steps=Math.max(1,Math.ceil(elapsed/(1/60))),step=elapsed/steps;
    for(let n=0;n<steps;n++){
      for(const c of this.chunks){if(c.life<=0)continue;c.life-=step;c.v.y-=step*9.8;c.p.addScaledVector(c.v,step);c.r.addScaledVector(c.spin,step);
        const floor=Math.max(.04,c.size.y*.5);if(c.p.y<floor){c.p.y=floor;c.v.y=Math.abs(c.v.y)*.26;c.v.x*=.67;c.v.z*=.67;c.spin.multiplyScalar(.6);c.bounce++;if(c.bounce>3)c.v.y=0;}}
      for(const p of this.puffs){if(p.life<=0)continue;p.life-=step;p.p.addScaledVector(p.v,step);p.v.multiplyScalar(1-step*.6);}
      for(const f of this.fragments){if(f.settled)continue;f.age+=step;if(f.age<f.delay)continue;f.v.y-=step*8;f.group.position.addScaledVector(f.v,step);f.group.rotation.x+=f.spin.x*step;f.group.rotation.y+=f.spin.y*step;f.group.rotation.z+=f.spin.z*step;
        if(f.group.position.y<f.floor){f.group.position.y=f.floor;f.v.y=Math.abs(f.v.y)*.12;f.v.x*=.75;f.v.z*=.75;f.spin.multiplyScalar(.4);}}
    }
    if(this.bossBurn&&this.bossBurnTime>0){this.bossBurnTime-=elapsed;this.bossEmission+=elapsed;
      while(this.bossEmission>=.10){this.bossEmission-=.10;const p=this.bossBurn;this.puff(p.x+(this.random()-.5)*2,p.y,p.z+(this.random()-.5)*1.5,'fire',.38,.45,0xff7328);this.puff(p.x,p.y+.5,p.z,'smoke',.65,1.15,0x36434a);}}
    let dc=0,sc=0,fc=0;for(const c of this.chunks){if(c.life<=0)continue;const fade=Math.min(1,c.life/.45);
      this.dummy.position.copy(c.p);this.dummy.rotation.set(c.r.x,c.r.y,c.r.z);this.dummy.scale.copy(c.size).multiplyScalar(fade);this.dummy.updateMatrix();this.debris.setMatrixAt(dc,this.dummy.matrix);this.debris.geometry.getAttribute('instanceOpacity').setX(dc,fade);this.debris.setColorAt(dc++,c.color);}
    for(const p of this.puffs){if(p.life<=0)continue;const age=1-p.life/p.max,fade=Math.min(1,p.life/.22),mesh=p.kind==='smoke'?this.smoke:this.fire,index=p.kind==='smoke'?sc++:fc++;
      this.dummy.position.copy(p.p);this.dummy.rotation.set(age*2,age*3,age);this.dummy.scale.setScalar(p.size*(p.kind==='smoke'?1+age*2:1-age*.55)*fade);this.dummy.updateMatrix();mesh.setMatrixAt(index,this.dummy.matrix);mesh.geometry.getAttribute('instanceOpacity').setX(index,fade);mesh.setColorAt(index,p.color);}
    changed(this.debris,dc);changed(this.smoke,sc);changed(this.fire,fc);
    // A recognizable static wreck remains behind the result overlay until retry.
    // Settling ends physics work; reset owns the final material cleanup.
    for(const f of this.fragments)if(!f.settled&&f.age>=2.5){
      const bounds=new T.Box3().setFromObject(f.group);f.group.position.y+=.04-bounds.min.y;
      f.v.set(0,0,0);f.spin.set(0,0,0);f.settled=true;
    }
  }
  reset(){for(const c of this.chunks)c.life=0;for(const p of this.puffs)p.life=0;for(const f of this.fragments){this.scene.remove(f.group);f.materials.forEach(m=>m.dispose());}this.fragments=[];this.bossBurnTime=0;this.bossBurn=undefined;changed(this.debris,0);changed(this.smoke,0);changed(this.fire,0);}
  stats(){return {debris:this.debris.count,smoke:this.smoke.count,fire:this.fire.count,bossFragments:this.fragments.length,capacity:this.debrisCapacity+this.particleCapacity+this.fragmentCapacity};}
  dispose(){this.reset();for(const m of [this.debris,this.smoke,this.fire]){this.scene.remove(m);m.geometry.dispose();(m.material as T.Material).dispose();m.dispose();}}
}

/** One recognizable ~1.1m robot per actual target; two draw calls for a whole wave. */
export class RobotFormation {
  private body:T.InstancedMesh;private eyes:T.InstancedMesh;private count=0;private dummy=new T.Object3D();
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
  }
  begin(){this.count=0;}
  add(x:number,worldZ:number,scale=1,yaw=0,hit=false){if(this.count>=this.capacity)return;
    const sized=scale*(hit?1.035:1);
    this.dummy.position.set(x,.025,worldZ);this.dummy.rotation.set(0,yaw,0);this.dummy.scale.set(sized*.82,sized*1.1,sized);this.dummy.updateMatrix();
    this.body.setMatrixAt(this.count,this.dummy.matrix);this.eyes.setMatrixAt(this.count,this.dummy.matrix);this.count++;
  }
  end(){changed(this.body,this.count);changed(this.eyes,this.count);}
  reset(){this.begin();this.end();}
  dispose(){for(const mesh of [this.body,this.eyes]){this.scene.remove(mesh);mesh.geometry.dispose();(mesh.material as T.Material).dispose();mesh.dispose();}}
}

export type MissileOptions={depthScale:number;bossPhase:boolean;bossZ?:number;overdrive:boolean;weapon:number;visible?:boolean};
export class CombatMissiles {
  private bodies:T.InstancedMesh;private exhaust:T.InstancedMesh;private orbs:T.InstancedMesh;private dummy=new T.Object3D();
  private color=new T.Color();readonly capacity=768;
  private hostileLaunchZ=new Map<number,{z:number;height:number}>();
  constructor(private scene:T.Scene){
    const parts=[painted(new T.CylinderGeometry(.09,.09,.47,8),0xbfc6c8,0,0,0,Math.PI/2),
      painted(new T.ConeGeometry(.095,.21,8),0xc17536,0,0,.34,Math.PI/2),
      painted(new T.CylinderGeometry(.115,.115,.07,8),0x303a43,0,0,-.25,Math.PI/2)];
    for(const a of [0,Math.PI/2])parts.push(painted(new T.BoxGeometry(.32,.035,.19),0x3d4c56,0,0,-.18,0,0,a));
    const material=standard(0xffffff);material.vertexColors=true;this.bodies=pool(scene,joined(parts),material,this.capacity);
    const flame=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.48,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
    this.exhaust=pool(scene,new T.ConeGeometry(.105,.85,6).rotateX(Math.PI/2).translate(0,0,-.64),flame,this.capacity);
    const orb=basic(0xe074ff);orb.toneMapped=false;this.orbs=pool(scene,new T.IcosahedronGeometry(.20,1),orb,96);
  }
  update(friendly:Shot[],hostile:EnemyShot[],options:MissileOptions){
    let count=0,orbCount=0;if(options.visible===false){this.reset();return;}
    const write=(x:number,y:number,z:number,yaw:number,scale:number,enemy=false,kind:Shot['kind']='pulse')=>{
      if(count>=this.capacity)return;this.dummy.position.set(x,y,z);this.dummy.rotation.set(0,yaw,0);this.dummy.scale.setScalar(scale);this.dummy.updateMatrix();
      if(!enemy&&kind==='rail'){this.dummy.scale.z*=1.4;this.dummy.updateMatrix();}
      this.bodies.setMatrixAt(count,this.dummy.matrix);this.bodies.setColorAt(count,this.color.set(enemy?0xff9262:kind==='arc'?0xc2a6ff:kind==='rail'?0xffd283:0xc8f2ff));
      this.dummy.scale.set(scale,scale,scale*(options.overdrive&&!enemy?2:1));this.dummy.updateMatrix();this.exhaust.setMatrixAt(count,this.dummy.matrix);this.exhaust.setColorAt(count,this.color.set(enemy?0xff6024:options.overdrive?0x72dcff:kind==='arc'?0xb88cff:kind==='rail'?0xffcc58:0x73d8ff));count++;
    };
    for(const p of friendly){
      const velocity=p as Shot & {dx?:number;dz?:number};
      write(p.x,1.25,-p.z*options.depthScale,Math.atan2(velocity.dx??0,-(velocity.dz??1)*options.depthScale),p.heavy?1.05:.85,false,p.kind??'pulse');
    }
    const live=new Set<number>();
    for(const p of hostile){if(live.size>=96)break;live.add(p.id);
      if(!this.hostileLaunchZ.has(p.id))this.hostileLaunchZ.set(p.id,{z:Math.max(1,options.bossZ??p.z),height:options.bossPhase?3:.85});
      const launch=this.hostileLaunchZ.get(p.id)!;
      const height=.85+(launch.height-.85)*Math.max(0,Math.min(1,p.z/launch.z));
      if(p.kind==='orb'){if(orbCount>=96)continue;this.dummy.position.set(p.x,height,-p.z*options.depthScale);this.dummy.rotation.set(0,0,0);this.dummy.scale.setScalar(Math.max(.8,p.radius/.18));this.dummy.updateMatrix();this.orbs.setMatrixAt(orbCount++,this.dummy.matrix);}
      else write(p.x,height,-p.z*options.depthScale,Math.atan2(p.dx,-p.dz*options.depthScale),p.kind==='rocket'?1.45:1.05,true);
    }
    for(const id of this.hostileLaunchZ.keys())if(!live.has(id))this.hostileLaunchZ.delete(id);
    changed(this.bodies,count);changed(this.exhaust,count);changed(this.orbs,orbCount);
  }
  reset(){changed(this.bodies,0);changed(this.exhaust,0);changed(this.orbs,0);this.hostileLaunchZ.clear();}
  dispose(){for(const mesh of [this.bodies,this.exhaust,this.orbs]){this.scene.remove(mesh);mesh.geometry.dispose();(mesh.material as T.Material).dispose();mesh.dispose();}}
}

export type ArmyAbilityOptions={depthScale:number;armyRadius:number;armyCenterX?:number;armyCenterZ:number;visible?:boolean};
export class ArmyAbilityVisuals {
  private group=new T.Group();private dome:T.Mesh;private domeGrid:T.Mesh;private boundary:T.Mesh;private wave:T.Mesh;
  private arcs:T.LineSegments;private arcPositions=new Float32Array(24*6);private overdrive:T.Mesh;
  private clock=0;private wasEmp=false;private pulseAge=10;
  constructor(private scene:T.Scene){
    this.dome=new T.Mesh(new T.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI/2),new T.MeshBasicMaterial({color:0x54cfff,transparent:true,opacity:.12,side:T.DoubleSide,depthWrite:false}));
    this.domeGrid=new T.Mesh(this.dome.geometry,new T.MeshBasicMaterial({color:0x8deaff,wireframe:true,transparent:true,opacity:.13,depthWrite:false}));
    this.boundary=new T.Mesh(new T.TorusGeometry(1,.024,4,64),basic(0x92eaff,.8));this.boundary.rotation.x=-Math.PI/2;
    this.wave=new T.Mesh(new T.RingGeometry(.92,1,64),new T.MeshBasicMaterial({color:0xb3a0ff,transparent:true,opacity:.65,side:T.DoubleSide,depthWrite:false,toneMapped:false}));this.wave.rotation.x=-Math.PI/2;
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(this.arcPositions,3).setUsage(T.DynamicDrawUsage));
    this.arcs=new T.LineSegments(geometry,new T.LineBasicMaterial({color:0xd2c5ff,transparent:true,opacity:.9,depthWrite:false,toneMapped:false}));this.arcs.frustumCulled=false;
    this.overdrive=new T.Mesh(new T.RingGeometry(.88,1,48),new T.MeshBasicMaterial({color:0xffb342,transparent:true,opacity:.6,side:T.DoubleSide,depthWrite:false,toneMapped:false}));this.overdrive.rotation.x=-Math.PI/2;
    this.group.add(this.dome,this.domeGrid,this.boundary,this.wave,this.arcs,this.overdrive);scene.add(this.group);this.group.visible=false;
  }
  update(s:Snapshot,options:ArmyAbilityOptions,dt:number){
    this.clock+=Math.max(0,dt);this.pulseAge+=Math.max(0,dt);const active=s.ability>0&&options.visible!==false;
    const emp=active&&s.relic===1;if(emp&&!this.wasEmp)this.pulseAge=0;this.wasEmp=emp;
    const centerX=options.armyCenterX??s.x,heroDistance=Math.hypot(s.x-centerX,options.armyCenterZ);
    this.group.position.set(centerX,.04,options.armyCenterZ);this.group.visible=options.visible!==false&&(active||this.pulseAge<.85);
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
  }
  reset(){this.group.visible=false;this.wasEmp=false;this.pulseAge=10;}
  dispose(){this.scene.remove(this.group);const geometries=new Set<T.BufferGeometry>();this.group.traverse(obj=>{const mesh=obj as T.Mesh;if(mesh.geometry){geometries.add(mesh.geometry);(mesh.material as T.Material).dispose();}});geometries.forEach(g=>g.dispose());}
}
