import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

/** Mechanical cover driven only by the real shield timer and shield-hit events. */
export class PlatedShield {
 readonly root=new T.Group();readonly panels:T.InstancedMesh;readonly lights:T.InstancedMesh;
 readonly capacity=9;private stamp=new T.Object3D();private deployment=0;private hits=new Float32Array(9);private scars=new Float32Array(9);private wasActive=false;private clock=0;private disposed=false;
 private width=4.4;private centerX=0;private frontZ=-2;
 constructor(parent:T.Object3D){
  this.root.name='Legion_PlatedBulwark';parent.add(this.root);
  const parts:T.BufferGeometry[]=[];
  const part=(g:T.BufferGeometry,c:number,x=0,y=0,z=0,rx=0)=>{const p=g.index?g.toNonIndexed():g;if(g!==p)g.dispose();p.rotateX(rx).translate(x,y,z);const color=new T.Color(c),a=new Float32Array(p.attributes.position.count*3);for(let i=0;i<a.length;i+=3){a[i]=color.r;a[i+1]=color.g;a[i+2]=color.b;}p.setAttribute('color',new T.BufferAttribute(a,3));parts.push(p);};
  const plate=(w:number,h:number,d:number,y:number,z:number,color:number)=>{const s=new T.Shape();s.moveTo(-w/2+.06,-h/2);s.lineTo(w/2-.06,-h/2);s.lineTo(w/2,-h/2+.06);s.lineTo(w/2,h/2-.06);s.lineTo(w/2-.06,h/2);s.lineTo(-w/2+.06,h/2);s.lineTo(-w/2,h/2-.06);s.lineTo(-w/2,-h/2+.06);s.closePath();part(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.025,bevelThickness:.025}),color,0,y,z-d/2);};
  plate(.88,1.20,.12,.83,0,0x3d5157);plate(.77,.98,.07,.83,-.105,0x86908b);plate(.88,.27,.13,1.63,0,0xc8bda3);
  // A second telescoping armor tier covers the marshal and descending shoulder rockets.
  // Narrow seams keep the friendly barrels readable while the hostile contact is physical.
  plate(.88,.78,.12,2.27,.025,0x3d5157);plate(.77,.66,.07,2.27,-.080,0x86908b);plate(.88,.27,.13,2.765,.025,0xc8bda3);
  // Open vision/fire slot beneath the reinforced upper brow; feet and piston struts show weight.
  for(const side of [-1,1]){part(new T.BoxGeometry(.09,2.72,.19),0x283e48,side*.42,1.45,.045);part(new T.CylinderGeometry(.035,.035,.64,8),0xb49360,side*.33,.37,.18);part(new T.BoxGeometry(.23,.13,.43),0x24323a,side*.30,.12,.09);for(const y of [.43,1.24,1.65,2.05,2.70])part(new T.CylinderGeometry(.03,.03,.018,6),0x42392d,side*.32,y,-.16,Math.PI/2);}
  // Recessed face seam, central ridge and inset copper hazard bars remain dark against explosions.
  part(new T.BoxGeometry(.034,.79,.028),0x334247,0,.83,-.159);for(const side of [-1,1])part(new T.BoxGeometry(.26,.07,.025),0xb78547,side*.2,.46,-.16);
  const g=mergeGeometries(parts,false)!;parts.forEach(p=>p.dispose());
  this.panels=new T.InstancedMesh(g,new T.MeshStandardMaterial({vertexColors:true,color:0xffffff,roughness:.43,metalness:.72}),9);this.panels.name='Shield_ActualBeveledMetalPanels';this.panels.castShadow=true;this.panels.receiveShadow=true;this.panels.frustumCulled=false;this.panels.instanceMatrix.setUsage(T.DynamicDrawUsage);this.root.add(this.panels);
  this.lights=new T.InstancedMesh(new T.BoxGeometry(.53,.048,.035).translate(0,1.46,-.10),new T.MeshBasicMaterial({color:0x91e8e5,toneMapped:false}),9);this.lights.name='Shield_PanelChargeSlots';this.lights.frustumCulled=false;this.root.add(this.lights);this.reset();
 }
 hit(x:number){const index=Math.round(T.MathUtils.clamp((x-this.centerX)/this.width+.5,0,1)*8);this.hits[index]=.24;this.scars[index]=Math.min(.24,this.scars[index]+.055);}
 update(active:boolean,centerX:number,centerZ:number,radius:number,dt:number){
  if(this.disposed)return;dt=Math.max(0,Math.min(.1,dt));this.clock+=dt;if(active&&!this.wasActive)this.scars.fill(0);this.wasActive=active;this.centerX=centerX;this.width=Math.max(3.8,Math.min(8.1,radius*2+.55));this.frontZ=centerZ-3.45;
  // Immediate first-frame cover; telescoping motion settles the armor over the next 0.18s.
  this.deployment=active?Math.min(1,this.deployment+dt*5.6):0;this.root.visible=active;
  for(let i=0;i<9;i++){this.hits[i]=Math.max(0,this.hits[i]-dt);const side=(i-4)/4,wing=Math.abs(side)>.73,spread=this.width/8,hit=this.hits[i]/.24;
   this.stamp.position.set(centerX+(i-4)*spread,.05+(1-this.deployment)*.22,this.frontZ+(wing?.34*Math.abs(side):0)+hit*.12);
   this.stamp.rotation.set(hit*.025,-side*(wing?.40:.035),0);this.stamp.scale.set(spread/.88,1,1);this.stamp.updateMatrix();this.panels.setMatrixAt(i,this.stamp.matrix);this.lights.setMatrixAt(i,this.stamp.matrix);this.panels.setColorAt(i,new T.Color().setRGB(1-this.scars[i]+hit*.3,1-this.scars[i]+hit*.2,1-this.scars[i]+hit*.1));
  }this.panels.instanceMatrix.needsUpdate=true;this.panels.instanceColor!.needsUpdate=true;this.lights.instanceMatrix.needsUpdate=true;
 }
 get stats(){return {panels:this.root.visible?9:0,width:this.width,frontZ:this.frontZ,clock:this.clock};}
 reset(){this.deployment=this.clock=0;this.hits.fill(0);this.scars.fill(0);this.wasActive=false;this.root.visible=false;}
 dispose(){if(this.disposed)return;this.disposed=true;for(const m of [this.panels,this.lights]){m.geometry.dispose();(m.material as T.Material).dispose();m.dispose();}this.root.removeFromParent();}
}
