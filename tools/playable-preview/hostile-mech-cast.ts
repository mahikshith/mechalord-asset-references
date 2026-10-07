import * as T from 'three';
import {BakedMechCrowd} from './baked-mech-crowd';
import {loadHostileMech,type HostileMechName} from './hostile-mechs';
import {enhanceVillain,VILLAIN_LOOKS} from './villain-look';
import type {Target} from './contract';

/** The approved CC0 mech cast (Quaternius Animated Mech Pack, hostile livery):
 * Stan = swarm grunts, George = Volt Hound rushers, Mike = Bulwark / Arc Engineer,
 * Leela = Cinder Reaver elites, batteries and Mortar Wasps. One baked instanced
 * crowd per model. Purely visual; positions, facing and states come from the core. */
type Crowd={crowd:BakedMechCrowd;walk:number;run:number;shoot:number;scale:number;};
export class HostileMechCast {
 ready=false;private crowds=new Map<HostileMechName,Crowd>();private phases=new Map<number,number>();private seen=new Set<number>();
 private shields:T.InstancedMesh;private shieldCount=0;private stamp=new T.Object3D();
 constructor(private scene:T.Scene){
  const hex=new T.CircleGeometry(.95,6);this.shields=new T.InstancedMesh(hex,new T.MeshBasicMaterial({color:new T.Color(.4,1.4,1.8),transparent:true,opacity:.32,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false}),24);this.shields.count=0;this.shields.frustumCulled=false;scene.add(this.shields);
 }
 async load(base='mechs/'){
  const spec:[HostileMechName,number,number][]=[['Stan',90,.74],['George',12,.72],['Mike',16,.9],['Leela',24,.95]];
  await Promise.all(spec.map(async([name,capacity,scale])=>{const {model,animations}=await loadHostileMech(name,base);const clip=(n:string)=>animations.find(a=>a.name==='RobotArmature|'+n)??animations.find(a=>a.name===n)!;
   let map:T.Texture|null=null;model.traverse((o:any)=>{if(o.isMesh)map=o.material.map;});const material=new T.MeshStandardMaterial({map,metalness:.55,roughness:.48});
   const list=[{clip:clip('Walk'),frames:16},{clip:clip('Run'),frames:16},{clip:clip('Shoot'),frames:12}];
   const crowd=new BakedMechCrowd(this.scene,model,list,capacity,material);enhanceVillain([material],name==='Stan'?VILLAIN_LOOKS.grunt:VILLAIN_LOOKS.elite);
   this.crowds.set(name,{crowd,walk:0,run:1,shoot:2,scale});}));
  this.ready=true;
 }
 begin(){if(!this.ready)return;this.seen.clear();this.shieldCount=0;for(const c of this.crowds.values())c.crowd.begin();}
 private phase(id:number,rate:number,dt:number){const p=((this.phases.get(id)??(id*.618)%1)+dt*rate)%1;this.phases.set(id,p);this.seen.add(id);return p;}
 private put(name:HostileMechName,id:number,x:number,y:number,z:number,yaw:number,mode:'walk'|'run'|'shoot',dt:number,speed:number,flash:boolean,scale=1){
  const c=this.crowds.get(name);if(!c)return;const clip=mode==='shoot'?c.shoot:mode==='run'?c.run:c.walk,rate=mode==='shoot'?1.6:mode==='run'?.95+speed*.25:.6+speed*.4;
  c.crowd.add(x,y,z,yaw,c.scale*scale,clip,this.phase(id,rate,dt),flash?1:0);
 }
 /** Swarm grunt: always charging, so it runs. */
 grunt(id:number,x:number,z:number,yaw:number,speed:number,dt:number,hit:boolean){this.put('Stan',id,x,0,z,yaw,'run',dt,speed,hit);}
 /** Cinder Reaver elites, gunners, batteries, carriers. */
 elite(t:Target,yaw:number,aiming:boolean,speed:number,dt:number){this.put('Leela',t.id,t.x,0,-t.z,yaw,aiming?'shoot':'walk',dt,speed,t.hit>0,t.variant===1?1.15:1);}
 /** Original archetypes 1 Bulwark, 2 Volt Hound, 3 Mortar Wasp, 4 Arc Engineer. */
 archetype(t:Target,yaw:number,speed:number,dt:number,age:number){
  const type=t.archetype??0,firing=t.fireState==='locked'||t.fireState==='fire',hit=t.hit>0;
  if(type===1){this.put('Mike',t.id,t.x,0,-t.z,yaw,firing?'shoot':'walk',dt,speed,hit,1.1);if((t.shieldHp??0)>0&&this.shieldCount<24){this.stamp.position.set(t.x,1.2,-t.z+.95);this.stamp.rotation.set(0,yaw,Math.PI/6);this.stamp.scale.setScalar(1+((t.blockFlash??0)>0?.15:0));this.stamp.updateMatrix();this.shields.setMatrixAt(this.shieldCount++,this.stamp.matrix);}}
  else if(type===2)this.put('George',t.id,t.x,0,-t.z,yaw,'run',dt,Math.max(1,speed),hit);
  else if(type===3)this.put('Leela',t.id,t.x,firing?.4:.9+Math.sin(age*3+t.id)*.12,-t.z,yaw,firing?'shoot':'walk',dt,speed,hit,.9);
  else if(type===4)this.put('Mike',t.id,t.x,0,-t.z,yaw,t.skillState===2?'shoot':'walk',dt,speed,hit,.9);
 }
 end(){if(!this.ready)return;for(const c of this.crowds.values())c.crowd.end();this.shields.count=this.shieldCount;this.shields.instanceMatrix.needsUpdate=true;for(const id of this.phases.keys())if(!this.seen.has(id))this.phases.delete(id);}
 reset(){this.phases.clear();this.begin();this.end();}
}
