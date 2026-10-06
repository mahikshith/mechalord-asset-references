import * as T from 'three';
import type {Snapshot} from './contract';

/** Measured shoulder sockets match the authoritative StormBattery launch positions.
 * Opening armor, servos and local muzzle combustion replace the old body/floor rings. */
export class StormBattery {
 readonly root=new T.Group();private racks:T.Group[]=[];private covers:T.Group[]=[];private flashes:T.Mesh[]=[];
 private active=false;private deploy=0;private age=0;private kick=[0,0];private ids=new Set<number>();private disposed=false;
 private metal=new T.MeshStandardMaterial({color:0x344b55,metalness:.78,roughness:.38});
 private trim=new T.MeshStandardMaterial({color:0xa18c61,metalness:.82,roughness:.36});
 private dark=new T.MeshStandardMaterial({color:0x172c36,metalness:.62,roughness:.46});
 private glow=new T.MeshBasicMaterial({color:0x94e6ff,toneMapped:false});
 private hot=new T.MeshBasicMaterial({color:0xdffaff,toneMapped:false,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});
 constructor(scene:T.Object3D){
  this.root.name='Barrage_MeasuredShoulderBattery';this.root.visible=false;scene.add(this.root);
  const mesh=(parent:T.Object3D,geometry:T.BufferGeometry,material:T.Material,x:number,y:number,z:number)=>{const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;};
  for(const side of[-1,1]){
   const rack=new T.Group();rack.name=side<0?'Barrage_LeftRack':'Barrage_RightRack';rack.position.set(side*.68,2.11,-.92);this.root.add(rack);this.racks.push(rack);
   mesh(rack,new T.BoxGeometry(.38,.43,.70),this.metal,0,0,.27);
   mesh(rack,new T.BoxGeometry(.42,.055,.66),this.trim,0,-.245,.27);
   mesh(rack,new T.BoxGeometry(.045,.38,.64),this.trim,side*.21,0,.27);
   mesh(rack,new T.CylinderGeometry(.16,.16,.07,12).rotateX(Math.PI/2),this.trim,0,0,-.025);
   mesh(rack,new T.CylinderGeometry(.13,.13,.16,12).rotateX(Math.PI/2),this.dark,0,0,-.022);
   mesh(rack,new T.CylinderGeometry(.093,.093,.025,12).rotateX(Math.PI/2),this.glow,0,0,-.11);
   for(const y of[-.115,.115])for(const z of[.10,.45])mesh(rack,new T.BoxGeometry(.014,.045,.12),this.glow,-side*.202,y,z);
   for(let i=0;i<3;i++)mesh(rack,new T.BoxGeometry(.30,.027,.09),this.dark,0,.22,.05+i*.17);
   const cover=new T.Group();cover.position.set(side*.22,.21,.27);rack.add(cover);this.covers.push(cover);
   mesh(cover,new T.BoxGeometry(.43,.08,.72),this.metal,-side*.20,.06,0);
   mesh(cover,new T.BoxGeometry(.30,.009,.19),this.trim,-side*.20,.105,.14);
   const flash=mesh(rack,new T.SphereGeometry(1,10,6),this.hot.clone(),0,0,-.18);flash.name='Barrage_ActualRocketLaunchFlash';flash.visible=false;this.flashes.push(flash);
   const bracket=mesh(rack,new T.BoxGeometry(.12,.35,.23),this.dark,-side*.13,-.30,.53);bracket.rotation.z=side*.32;
  }
 }
 update(s:Snapshot,dt:number,visible=true,held=false){
  if(this.disposed)return;dt=T.MathUtils.clamp(dt,0,.1);
  const time=s.relics?.[2]?.activeTime??(s.relic===2?s.ability:0),on=visible&&time>0;
  if(on&&!this.active){this.age=0;this.ids.clear();this.kick=[0,0];}
  this.active=on;this.root.visible=on;this.root.position.set(s.x,0,0);
  if(!on){this.deploy=0;this.kick=[0,0];this.ids.clear();return;}
  if(!held){this.age+=dt;this.deploy=1-Math.exp(-this.age*16);for(let i=0;i<2;i++)this.kick[i]=Math.max(0,this.kick[i]-dt*7);}
  for(const shot of s.shots??[]){
   if(held||shot.kind!=='salvo'||shot.owner==='troop'||this.ids.has(shot.id)||shot.z>2.7||!Number.isFinite(shot.y))continue;
   const side=shot.x<s.x?0:1;this.kick[side]=1;this.ids.add(shot.id);
  }
  for(let i=0;i<2;i++){
   const side=i===0?-1:1;this.covers[i].rotation.z=side*(.04+this.deploy*1.15);
   // The nozzle stays at the measured launch socket while rear armor slides under recoil.
   this.racks[i].children[0].position.z=.27+this.kick[i]*.065;
   const f=this.flashes[i];f.visible=this.kick[i]>.05;f.scale.set(.13+.11*this.kick[i],.13+.11*this.kick[i],.24+.31*this.kick[i]);(f.material as T.MeshBasicMaterial).opacity=this.kick[i]*.85;
  }
 }
 get stats(){return{visible:this.root.visible,deployment:this.deploy,launchFlashes:this.flashes.filter(f=>f.visible).length,sockets:this.racks.map(r=>r.position.clone().add(this.root.position).toArray()),trackedShots:this.ids.size};}
 reset(){this.root.visible=false;this.active=false;this.deploy=this.age=0;this.kick=[0,0];this.ids.clear();for(const f of this.flashes)f.visible=false;}
 dispose(){if(this.disposed)return;this.disposed=true;this.reset();const gs=new Set<T.BufferGeometry>(),ms=new Set<T.Material>();this.root.traverse(o=>{const m=o as T.Mesh;if(m.isMesh){gs.add(m.geometry);for(const mat of Array.isArray(m.material)?m.material:[m.material])ms.add(mat);}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());this.root.removeFromParent();}
}
