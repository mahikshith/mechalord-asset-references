import * as T from 'three';
import type {Effect,Snapshot} from './contract';
import {PlatedShield} from './plated-shield';

export interface RelicViewOptions {depthScale?:number;armyRadius:number;armyCenterX:number;armyCenterZ:number;visible:boolean;paused?:boolean;}
type Spark={mesh:T.Mesh<T.RingGeometry,T.MeshBasicMaterial>;life:number;duration:number;size:number;x:number;y:number;z:number;exact:boolean;shield:boolean};
type Bolt={start:T.Vector3;end:T.Vector3;life:number;seed:number};
const CYAN=0x65efff,AMBER=0xffa54b;
/** Cosmetic, fixed-capacity adapters for actual simulation events. No inferred hits or damage. */
export class RelicEffects {
 readonly root=new T.Group();readonly dome:T.Mesh<T.SphereGeometry,T.ShaderMaterial>;
 readonly rim:T.Mesh<T.TorusGeometry,T.MeshBasicMaterial>;readonly wave:T.Group;
 readonly overdrive=new T.Group();readonly escort=new T.Group();readonly lightning:T.LineSegments;
 readonly light=new T.PointLight(CYAN,0,12,2);readonly shield:PlatedShield;
 private timeMarkers:T.InstancedMesh;private frostCrystals:T.InstancedMesh;private timeHands:T.InstancedMesh;
 private empArcs:T.InstancedMesh;private empArcStamp=new T.Object3D();
 private clock=0;private pulseLife=0;private pulseDuration=.36;private pulseType=0;private empLife=0;
 private sparks:Spark[]=[];private bolts:Bolt[]=[];private sparkCursor=0;private boltCursor=0;
 private boltPositions=new Float32Array(32*12*6);private boltColors=new Float32Array(32*12*6);
 private stun:T.InstancedMesh;private stamp=new T.Object3D();private center=new T.Vector3();
 private radii=new T.Vector3(2.2,3.25,3.0);private normal=new T.Vector3();private point=new T.Vector3();
 private upward=new T.Vector3(0,0,1);private disposed=false;private eventIDs=new Set<number>();
 private reduced=false;private impact={exposureLift:0,zoom:0};private lastShield=false;
 private weaponEnergy:T.Mesh[]=[];
 private odCircuits:T.InstancedMesh;private odEmbers:T.InstancedMesh;private odArcs:T.Mesh[]=[];private odFloor:T.Mesh[]=[];
 constructor(private scene:T.Scene,private hero:T.Object3D,reducedMotion=false){
  this.reduced=reducedMotion;this.root.name='RelicEffects';scene.add(this.root);this.root.add(this.light);this.shield=new PlatedShield(this.root);
  const domeMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{clock:{value:0},strength:{value:1},tint:{value:new T.Color(CYAN)}},vertexShader:`varying vec3 n;varying vec3 v;varying vec3 local;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-mv.xyz);local=position;gl_Position=projectionMatrix*mv;}`,fragmentShader:`varying vec3 n;varying vec3 v;varying vec3 local;uniform float clock;uniform float strength;uniform vec3 tint;void main(){float edge=pow(1.-abs(dot(normalize(n),normalize(v))),2.2);float bands=pow(max(0.,sin(local.y*44.-clock*2.)),24.);float grid=pow(max(0.,sin(local.x*28.+local.z*23.)),32.);float a=(.026+edge*.26+bands*.018+grid*.014)*strength;gl_FragColor=vec4(tint*(.72+edge*.5),a);}`});
  this.dome=new T.Mesh(new T.SphereGeometry(1,48,24,0,Math.PI*2,0,Math.PI/2),domeMaterial);this.dome.name='LegacyShieldDome_Disabled';this.dome.renderOrder=5;this.root.add(this.dome);
  this.rim=new T.Mesh(new T.TorusGeometry(1,.022,6,96),this.energy(CYAN,.85));this.rim.rotation.x=-Math.PI/2;this.rim.name='ShieldGroundRim';this.root.add(this.rim);
  this.wave=new T.Group();this.wave.name='EMP_Shockwave';this.root.add(this.wave);
  for(let i=0;i<3;i++){const ring=new T.Mesh(new T.TorusGeometry(1,.018+i*.008,6,128),this.energy(i===1?0xf2ffff:CYAN,.8));ring.rotation.x=-Math.PI/2;ring.position.y=.08+i*.12;ring.userData.layer=i;this.wave.add(ring);}
  const waveWall=new T.Mesh(new T.CylinderGeometry(1,1,1,96,1,true),this.energy(CYAN,.08));waveWall.name='EMP_VerticalWave';waveWall.position.y=.65;this.wave.add(waveWall);
  this.empArcs=new T.InstancedMesh(new T.CylinderGeometry(.5,.5,1,5).rotateX(Math.PI/2),this.energy(0xb2efff,.9),256);this.empArcs.name='EMP_ThunderShockFront';this.empArcs.frustumCulled=false;this.root.add(this.empArcs);
  this.root.add(this.overdrive,this.escort);this.overdrive.name='OverdriveWeaponEnergy';this.escort.name='FiniteEscortGuard';
  this.odCircuits=new T.InstancedMesh(new T.CapsuleGeometry(.045,.64,2,5),this.energy(0xffd583,.82),18);this.odCircuits.frustumCulled=false;this.odCircuits.name='Overdrive_InstancedFlameStreaks';this.overdrive.add(this.odCircuits);
  this.odEmbers=new T.InstancedMesh(new T.OctahedronGeometry(.045),this.energy(AMBER,.9),24);this.odEmbers.frustumCulled=false;this.odEmbers.name='Overdrive_InstancedUpperBodyEmbers';this.overdrive.add(this.odEmbers);
  for(let i=0;i<3;i++){const arc=new T.Mesh(new T.TorusGeometry(1,.035,5,64,Math.PI*1.55),this.energy(i===1?CYAN:AMBER,.8));arc.name='Overdrive_UpperBodyArc_'+i;this.overdrive.add(arc);this.odArcs.push(arc);}
  for(let i=0;i<2;i++){const ring=new T.Mesh(new T.TorusGeometry(1,.018,6,48),this.energy(i===0?AMBER:CYAN,.48));ring.rotation.x=-Math.PI/2;ring.name='OverdriveFloor_'+i;this.overdrive.add(ring);this.odFloor.push(ring);}
  for(let i=0;i<4;i++){const collar=new T.Mesh(new T.TorusGeometry(.26,.043,5,24),this.energy(i%2?CYAN:AMBER,.95));collar.name='OverdrivePosedWeapon_'+i;collar.visible=false;this.root.add(collar);this.weaponEnergy.push(collar);}
  for(const side of [-1,1]){const satellite=new T.Group();satellite.name='EscortEmitter_'+side;satellite.position.set(side*1.1,1.65,.6);const housing=new T.Mesh(new T.OctahedronGeometry(.18),new T.MeshStandardMaterial({color:0x526678,metalness:.55,roughness:.4}));const halo=new T.Mesh(new T.TorusGeometry(.27,.025,6,20),this.energy(0x9cfcb3,.8));satellite.add(housing,halo);this.escort.add(satellite);}
  const rippleGeometry=new T.RingGeometry(.82,1,40);
  for(let i=0;i<12;i++){const mesh=new T.Mesh(rippleGeometry,this.energy(CYAN,.9));mesh.visible=false;this.root.add(mesh);this.sparks.push({mesh,life:0,duration:.48,size:.65,x:0,y:1.05,z:0,exact:false,shield:true});}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(this.boltPositions,3).setUsage(T.DynamicDrawUsage));geometry.setAttribute('color',new T.BufferAttribute(this.boltColors,3).setUsage(T.DynamicDrawUsage));geometry.setDrawRange(0,0);
  this.lightning=new T.LineSegments(geometry,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.95,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending}));this.lightning.frustumCulled=false;this.lightning.name='EMP_ActualTargetBolts';this.root.add(this.lightning);
  for(let i=0;i<32;i++)this.bolts.push({start:new T.Vector3(),end:new T.Vector3(),life:0,seed:i});
  this.timeMarkers=new T.InstancedMesh(new T.TorusGeometry(.54,.025,5,24).rotateX(-Math.PI/2),this.energy(0xffffff,.5),48);this.timeMarkers.name='TimePowers_ActualAffectedUnits';this.timeMarkers.frustumCulled=false;
  this.frostCrystals=new T.InstancedMesh(new T.OctahedronGeometry(1,0),new T.MeshStandardMaterial({color:0xacdfe7,metalness:.24,roughness:.23,emissive:0x164b60,emissiveIntensity:.7}),192);this.frostCrystals.name='Freeze_ArmorIceShards';this.frostCrystals.frustumCulled=false;
  this.timeHands=new T.InstancedMesh(new T.BoxGeometry(.035,.025,.34).translate(0,0,-.13),this.energy(0xa5eabc,.85),48);this.timeHands.name='Slow_ClockPointers';this.timeHands.frustumCulled=false;this.root.add(this.timeMarkers,this.frostCrystals,this.timeHands);
  this.stun=new T.InstancedMesh(new T.TorusGeometry(.65,.025,5,24),this.energy(CYAN,.7),48);this.stun.count=0;this.stun.frustumCulled=false;this.stun.name='EMP_ActualStunnedActors';this.root.add(this.stun);this.reset();
 }
 private energy(color:number,opacity:number){return new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending,side:T.DoubleSide});}
 setReducedMotion(value:boolean){this.reduced=value;}
 get sceneImpact(){return this.impact;}
 /** Presentation confirmation of a real observed tier transition; never a combat event. */
 weaponUpgrade(previous:number,next:number){
  if(this.disposed||!Number.isInteger(previous)||!Number.isInteger(next)||previous<1||next>4||next<=previous||this.pulseLife>0)return false;
  this.pulseLife=this.pulseDuration;this.pulseType=3;this.refreshImpact();return true;
 }
 get stats(){return {sparks:this.sparks.filter(s=>s.life>0).length,bolts:this.bolts.filter(b=>b.life>0).length,sparkCapacity:12,boltCapacity:32,clock:this.clock,pulseLife:this.pulseLife,empLife:this.empLife,stunned:this.stun.count,shieldPanels:this.shield.stats.panels,empArcSegments:this.empArcs.count,timeMarkers:this.timeMarkers.count,frostCrystals:this.frostCrystals.count};}
 trigger(e:Effect,s?:Snapshot){
  if(this.disposed||this.eventIDs.has(e.id))return;this.eventIDs.add(e.id);if(this.eventIDs.size>512)this.eventIDs.delete(this.eventIDs.values().next().value!);
  if(e.kind==='relic'||e.kind==='pickup'||e.kind==='combatPower'){this.pulseLife=this.pulseDuration;this.pulseType=e.kind==='relic'?e.value:3;this.refreshImpact();}
  if(e.kind==='empPulse'){this.empLife=.65;this.wave.position.set(e.x,0,-e.z);this.wave.visible=true;this.wave.scale.set(1,1,1);this.pulseLife=this.pulseDuration;this.pulseType=1;this.refreshImpact();}
  if(e.kind==='shieldHit'||e.kind==='escortBlock'){if(e.kind==='shieldHit')this.shield.hit(e.x);const p=this.sparks[this.sparkCursor++%12];p.life=p.duration=.48;p.x=e.x;p.y=e.y??1.05;p.z=-e.z;p.exact=e.variant===-6||e.kind==='escortBlock';p.shield=e.kind==='shieldHit';p.mesh.visible=true;p.mesh.material.color.setHex(p.shield?CYAN:0x9cfcb3);}
  if(e.kind==='empStun'||e.kind==='empClear'||(e.kind==='kill'&&s?.effects?.some(a=>a.kind==='empPulse'))){
   const b=this.bolts[this.boltCursor++%32];b.life=.25;b.seed=e.id;b.start.set(s?.x??e.x,1.8,0);b.end.set(e.x,e.kind==='empStun'&&e.entityId===0?(s?.bossY??0)+4.3:e.variant===3?3.8:1.25,-e.z);this.writeBolts();
  }
 }
 update(s:Snapshot,o:RelicViewOptions,dt:number){
  if(this.disposed||o.paused)return;dt=Math.max(0,Math.min(dt,.1));this.clock+=dt;
  this.center.set(o.armyCenterX,.035,o.armyCenterZ);this.radii.set(Math.max(1.8,o.armyRadius),3.4,3.2);
  const timers=(s as Snapshot&{relics?:{activeTime:number}[]}).relics;const shield=o.visible&&(timers?.[0]?.activeTime??(s.relic===0?s.ability:0))>0;this.lastShield=shield;
  this.dome.visible=this.rim.visible=false;this.shield.update(shield,o.armyCenterX,o.armyCenterZ,o.armyRadius,dt);this.dome.position.copy(this.center);this.dome.scale.copy(this.radii);this.dome.material.uniforms.clock.value=this.clock;this.dome.material.uniforms.strength.value=.9+Math.sin(this.clock*4)*.06;
  this.rim.position.copy(this.center);this.rim.scale.set(this.radii.x,this.radii.z,1);
  for(const p of this.sparks){if(p.life<=0){p.mesh.visible=false;continue;}p.life=Math.max(0,p.life-dt);p.mesh.visible=o.visible&&p.life>0;const age=1-p.life/p.duration;
   // The physical armor receives the hit; its panel recoils while a tight surface spark fades.
   if(p.exact)p.mesh.position.set(p.x,p.y,p.z-.015);else p.mesh.position.set(T.MathUtils.clamp(p.x,this.center.x-this.shield.stats.width*.5,this.center.x+this.shield.stats.width*.5),1.05,this.shield.stats.frontZ-.17);p.mesh.rotation.set(0,0,age*1.7);p.mesh.scale.setScalar(.10+age*.48);p.mesh.material.opacity=(1-age)*.9;
  }
  this.empLife=Math.max(0,this.empLife-dt);this.wave.visible=o.visible&&this.empLife>0;
  let ec=0;if(this.wave.visible){const p=1-this.empLife/.65,r=1+25*(1-Math.pow(1-p,2));this.wave.scale.set(r,1,r);for(const child of this.wave.children){const m=(child as T.Mesh).material as T.MeshBasicMaterial;m.opacity=(child.name==='EMP_VerticalWave'?.10:.92)*(1-p);}
   // Jagged, physical-thickness shockfront and upright ion forks span the full platform.
   const segment=(a:T.Vector3,b:T.Vector3,w:number)=>{if(ec>=256)return;const d=b.clone().sub(a),len=d.length();this.empArcStamp.position.copy(a).add(b).multiplyScalar(.5);this.empArcStamp.quaternion.setFromUnitVectors(this.upward,d.normalize());this.empArcStamp.scale.set(w,w,len);this.empArcStamp.updateMatrix();this.empArcs.setMatrixAt(ec++,this.empArcStamp.matrix);};
   for(let i=0;i<96;i++){const a=i/96*Math.PI*2,b=(i+1)/96*Math.PI*2,j=.12*Math.sin(i*7.1+Math.floor(this.clock*24)),r2=r+j;const from=new T.Vector3(Math.cos(a)*r,.17+.12*Math.sin(i*3),Math.sin(a)*r).add(this.wave.position),to=new T.Vector3(Math.cos(b)*r2,.17+.12*Math.sin((i+1)*3),Math.sin(b)*r2).add(this.wave.position);segment(from,to,.06*(1-p)+.018);if(i%4===0){const mid=to.clone().add(new T.Vector3(.16*Math.sin(i),.6+Math.sin(i*4)*.3,.12*Math.cos(i))),tip=mid.clone().add(new T.Vector3(-.2*Math.sin(i),.55,-.1*Math.cos(i)));segment(to,mid,.044);segment(mid,tip,.025);}}
  }this.empArcs.count=ec;this.empArcs.instanceMatrix.needsUpdate=true;this.empArcs.visible=o.visible&&ec>0;(this.empArcs.material as T.MeshBasicMaterial).opacity=Math.min(1,this.empLife/.20);
  for(const b of this.bolts)b.life=Math.max(0,b.life-dt);this.writeBolts();this.lightning.visible=o.visible;
  let count=0;for(const t of s.targets??[]){if(t.stunTime>0&&count<47){this.stamp.position.set(t.x,2.3,-t.z);this.stamp.rotation.set(.25,0,this.clock*1.2);this.stamp.scale.setScalar(t.variant>0?1.3:.8);this.stamp.updateMatrix();this.stun.setMatrixAt(count++,this.stamp.matrix);}}
  if(s.empStunTime>0&&s.phase==='boss'&&count<48){this.stamp.position.set(s.bossX,s.bossY+5,-s.bossZ);this.stamp.rotation.set(.25,0,this.clock*1.2);this.stamp.scale.setScalar(1.8);this.stamp.updateMatrix();this.stun.setMatrixAt(count++,this.stamp.matrix);}this.stun.count=count;this.stun.visible=o.visible;this.stun.instanceMatrix.needsUpdate=true;
  // Mirrors the simulation's exact near-freeze boundary; distant troops still march in.
  let marked=0,crystals=0,hands=0;const timeActive=o.visible&&(s.timePowerTime??0)>0,freeze=timeActive&&s.timePower==='freeze',slow=timeActive&&s.timePower==='slow';
  const markTime=(x:number,z:number,size:number,id:number)=>{if(marked>=48)return;this.stamp.position.set(x,.065,-z);this.stamp.rotation.set(0,0,0);this.stamp.scale.setScalar(size);this.stamp.updateMatrix();this.timeMarkers.setMatrixAt(marked,this.stamp.matrix);this.timeMarkers.setColorAt(marked++,new T.Color(freeze?0x81d6eb:0x69d596));
   if(slow){this.stamp.rotation.y=this.clock*.7+id;this.stamp.updateMatrix();this.timeHands.setMatrixAt(hands++,this.stamp.matrix);}
   if(freeze)for(let i=0;i<4;i++){const a=i*Math.PI/2+id*.37;this.stamp.position.set(x+Math.sin(a)*size*.46,.16+size*.17,-z+Math.cos(a)*size*.46);this.stamp.rotation.set(.15*Math.sin(a),a,Math.sin(a)*.20);this.stamp.scale.set(size*.10,size*(.23+(i%2)*.11),size*.08);this.stamp.updateMatrix();this.frostCrystals.setMatrixAt(crystals++,this.stamp.matrix);}
  };
  if(freeze||slow){for(const target of s.targets??[])if(target.kind==='enemy'&&target.hp>0&&target.z>=-1&&(!freeze||target.z<18))markTime(target.x,target.z,target.variant>0?.9:.62,target.id);if(s.phase==='boss'&&s.bossHp>0)markTime(s.bossX,s.bossZ,1.9,0);}
  this.timeMarkers.count=marked;this.timeMarkers.instanceMatrix.needsUpdate=true;if(this.timeMarkers.instanceColor)this.timeMarkers.instanceColor.needsUpdate=true;this.frostCrystals.count=crystals;this.frostCrystals.instanceMatrix.needsUpdate=true;this.timeHands.count=hands;this.timeHands.instanceMatrix.needsUpdate=true;
  const od=o.visible&&(timers?.[2]?.activeTime??(s.relic===2?s.ability:0))>0;this.overdrive.visible=od;this.overdrive.position.set(s.x,0,0);
  for(let i=0;i<18;i++){const a=this.clock*2+i*Math.PI/9,p=(this.clock*1.3+i*.173)%1;this.stamp.position.set(Math.cos(a)*(.8+p*.22),.45+p*2.5,Math.sin(a)*.65-.1);this.stamp.rotation.set(.2*Math.sin(a),a,Math.sin(a)*.45);this.stamp.scale.set(.65,.45+Math.sin(p*Math.PI)*.7,.65);this.stamp.updateMatrix();this.odCircuits.setMatrixAt(i,this.stamp.matrix);}this.odCircuits.instanceMatrix.needsUpdate=true;
  for(let i=0;i<24;i++){const p=(this.clock*.62+i*.137)%1,a=i*2.39;this.stamp.position.set(Math.sin(a)*(.65+p*.35),.8+p*2.4,Math.cos(a)*.7-.2);this.stamp.rotation.set(a,this.clock,a*.7);this.stamp.scale.setScalar(Math.sin(p*Math.PI)*(.55+(i%3)*.2));this.stamp.updateMatrix();this.odEmbers.setMatrixAt(i,this.stamp.matrix);}this.odEmbers.instanceMatrix.needsUpdate=true;
  for(let i=0;i<3;i++){const arc=this.odArcs[i];arc.position.set(0,1.6+i*.25,-.05);arc.rotation.set(i===1?.7:-.15,this.clock*(i===1?-.9:.7)+i*1.3,i*.55);arc.scale.set(1.03,1.25,1.03);}
  this.odFloor.forEach((ring,i)=>{ring.position.set(o.armyCenterX-s.x,.09+i*.04,o.armyCenterZ);ring.scale.set(o.armyRadius*(i===0?1:1.07),3.2,1);});
  const weaponNames=['HandCannon_L','HandCannon_R','Arsenal_Hero','Arsenal_Hero'];
  for(let i=0;i<4;i++){const collar=this.weaponEnergy[i],node=this.hero.getObjectByName(weaponNames[i]);let visible=!!node;for(let parent=node;parent;parent=parent.parent)visible&&=parent.visible;collar.visible=od&&visible;if(collar.visible&&node){node.updateWorldMatrix(true,false);this.point.set(i<2?0:i===2?-.68:.68,i<2?0:2.08,i<2?.85:-.5);collar.position.copy(node.localToWorld(this.point));node.getWorldQuaternion(collar.quaternion);collar.rotateZ(this.clock*3);collar.scale.setScalar(.85+Math.sin(this.clock*7+i)*.12);}}
  this.escort.visible=o.visible&&s.escortShield>0&&s.powerTime>0;this.escort.position.set(s.x,0,0);this.escort.children.forEach((c,i)=>{c.position.y=1.6+Math.sin(this.clock*2+i)*.08;c.rotation.y=this.clock*.5;});
  this.pulseLife=Math.max(0,this.pulseLife-dt);this.refreshImpact();this.light.position.set(s.x,2,0);this.light.color.setHex(this.pulseType===2?AMBER:CYAN);this.light.intensity=(od?3:shield?1.4:0)+this.impact.exposureLift*36;
 }
 private refreshImpact(){const envelope=this.pulseLife>0?Math.pow(this.pulseLife/this.pulseDuration,2):0;this.impact.exposureLift=envelope*(this.reduced?.045:.16);this.impact.zoom=this.reduced?0:envelope*.016;}
 private writeBolts(){let cursor=0;for(const b of this.bolts){if(b.life<=0)continue;for(let j=0;j<12;j++){for(let end=0;end<2;end++){const t=(j+end)/12,w=Math.sin(t*Math.PI)*.35,seed=b.seed*1.37+(j+end)*4.17;this.boltPositions[cursor]=T.MathUtils.lerp(b.start.x,b.end.x,t)+Math.sin(seed)*w;this.boltPositions[cursor+1]=T.MathUtils.lerp(b.start.y,b.end.y,t)+Math.cos(seed*1.9)*w;this.boltPositions[cursor+2]=T.MathUtils.lerp(b.start.z,b.end.z,t)+Math.sin(seed*.7)*w;this.boltColors[cursor]=.55;this.boltColors[cursor+1]=.8+b.life*.7;this.boltColors[cursor+2]=1;cursor+=3;}}}this.lightning.geometry.setDrawRange(0,cursor/3);this.lightning.geometry.attributes.position.needsUpdate=true;this.lightning.geometry.attributes.color.needsUpdate=true;}
 reset(){this.clock=this.pulseLife=this.empLife=0;this.shield.reset();this.empArcs.count=this.timeMarkers.count=this.frostCrystals.count=this.timeHands.count=0;this.eventIDs.clear();for(const p of this.sparks){p.life=0;p.mesh.visible=false;}for(const b of this.bolts)b.life=0;for(const c of this.weaponEnergy)c.visible=false;this.dome.visible=this.rim.visible=this.wave.visible=this.overdrive.visible=this.escort.visible=false;this.light.intensity=0;this.stun.count=0;this.lightning.geometry.setDrawRange(0,0);this.refreshImpact();}
 dispose(){if(this.disposed)return;this.disposed=true;const gs=new Set<T.BufferGeometry>(),ms=new Set<T.Material>();this.root.traverse((o:any)=>{if(o.geometry)gs.add(o.geometry);if(o.isInstancedMesh)o.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])ms.add(m);});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());this.light.dispose();this.root.removeFromParent();}
}
