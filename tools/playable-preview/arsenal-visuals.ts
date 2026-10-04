import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {Snapshot} from './contract';

export type ArsenalPickupKind='guided'|'cannons'|'railburst';
const STEEL=0x30434e,IVORY=0xd5c7a7,BRONZE=0xb08749,BLACK=0x17232c;
function paint(source:T.BufferGeometry,color:number,x=0,y=0,z=0,rx=0,ry=0,rz=0){
  const g=source.index?source.toNonIndexed():source;if(g!==source)source.dispose();g.rotateX(rx).rotateY(ry).rotateZ(rz).translate(x,y,z);
  const c=new T.Color(color),values=new Float32Array(g.getAttribute('position').count*3);
  for(let i=0;i<values.length;i+=3){values[i]=c.r;values[i+1]=c.g;values[i+2]=c.b;}g.setAttribute('color',new T.BufferAttribute(values,3));return g;
}
function assembly(parts:T.BufferGeometry[],emissive=false){
  const geometry=mergeGeometries(parts,false)!;parts.forEach(p=>p.dispose());
  const material=emissive?new T.MeshBasicMaterial({color:0xffffff,vertexColors:true,toneMapped:false}):new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.56,metalness:.44});
  const mesh=new T.Mesh(geometry,material);mesh.castShadow=!emissive;mesh.receiveShadow=!emissive;return mesh;
}
function glow(radius:number,color:number){return new T.Mesh(new T.IcosahedronGeometry(radius,1),new T.MeshBasicMaterial({color,transparent:true,opacity:.65,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));}
function cannonRotor(radius=.2,length=.85){
  const parts:T.BufferGeometry[]=[];
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2,x=Math.cos(a)*radius,y=Math.sin(a)*radius;
    parts.push(paint(new T.CylinderGeometry(.045,.058,length,6),STEEL,x,y,length*.5,Math.PI/2));
    parts.push(paint(new T.TorusGeometry(.046,.014,3,6),BRONZE,x,y,length));
  }
  for(const z of [.05,length*.67])parts.push(paint(new T.TorusGeometry(radius+.048,.04,4,12),BRONZE,0,0,z));
  return assembly(parts);
}
type HandRig={group:T.Group;rotor:T.Mesh;flash:T.Mesh;side:number};
type BossWing={hinge:T.Group;rotor:T.Mesh;flash:T.Mesh;jet:T.Mesh;side:number};

/** Owns only its added rigs. Never changes the core or the parent actor transform. */
export class ArsenalVisuals {
  readonly heroRig=new T.Group();readonly bossRig=new T.Group();
  private cannons=new T.Group();private guided=new T.Group();private rail=new T.Group();
  private hands:HandRig[]=[];private wings:BossWing[]=[];private powerGlow:T.Mesh[]=[];
  private clock=0;private spin=0;private unfolded=0;private previousFire=0;private recoil=0;
  private railFlash:T.Mesh;
  private bossCharge:T.Mesh;
  constructor(private hero:T.Group,private boss:T.Group){
    this.heroRig.name='Arsenal_Hero';this.bossRig.name='Arsenal_Boss';this.heroRig.add(this.cannons,this.guided,this.rail);hero.add(this.heroRig);boss.add(this.bossRig);
    for(const side of [-1,1]){
      const group=new T.Group();group.name='HandCannon_'+(side<0?'L':'R');group.position.set(side*.90,1.42,-.22);group.rotation.y=Math.PI;this.cannons.add(group);
      const housing=assembly([
        paint(new T.CylinderGeometry(.29,.32,.45,10),STEEL,0,0,-.12,Math.PI/2),
        paint(new T.TorusGeometry(.31,.055,4,12),BRONZE,0,0,-.28),
        paint(new T.SphereGeometry(.24,8,5),IVORY,side*.12,.20,-.15),
        paint(new T.BoxGeometry(.18,.38,.56),IVORY,-side*.24,.08,-.10),
        paint(new T.CylinderGeometry(.12,.12,.19,8),BRONZE,side*.33,.01,-.12,0,0,Math.PI/2),
        paint(new T.BoxGeometry(.16,.16,.26),BLACK,0,-.23,-.2)
      ]);housing.name='HandCannonHousing';group.add(housing);
      const rotor=cannonRotor(.19,.92);rotor.position.z=.12;rotor.name='HandCannonRotatingBarrels';group.add(rotor);
      const flash=glow(.23,0xffcf68);flash.position.z=1.1;flash.scale.z=1.8;group.add(flash);flash.visible=false;this.hands.push({group,rotor,flash,side});

      const rack=new T.Group();rack.position.set(side*.68,2.08,.18);rack.rotation.y=Math.PI;this.guided.add(rack);
      rack.add(assembly([
        paint(new T.BoxGeometry(.35,.38,.65),STEEL,0,0,0),
        paint(new T.CylinderGeometry(.11,.11,.9,8),IVORY,0,.03,.18,Math.PI/2),
        paint(new T.ConeGeometry(.12,.24,8),BRONZE,0,.03,.74,Math.PI/2),
        paint(new T.BoxGeometry(.12,.42,.15),BRONZE,0,0,-.26)
      ]));const light=glow(.12,0x74e8ff);light.position.set(0,.03,.55);rack.add(light);this.powerGlow.push(light);
    }
    this.rail.position.set(0,1.8,-.40);this.rail.rotation.y=Math.PI;
    this.rail.add(assembly([
      paint(new T.BoxGeometry(.36,.32,1.10),STEEL,0,0,.35),
      paint(new T.CylinderGeometry(.11,.15,1.3,8),BRONZE,0,0,.45,Math.PI/2),
      paint(new T.BoxGeometry(.16,.22,.92),IVORY,-.19,.08,.38),
      paint(new T.BoxGeometry(.16,.22,.92),IVORY,.19,.08,.38)
    ]));
    const coils:T.BufferGeometry[]=[];for(let i=0;i<4;i++)coils.push(paint(new T.TorusGeometry(.16,.025,4,10),0xc293ff,0,0,.25+i*.19));this.rail.add(assembly(coils,true));
    this.railFlash=glow(.23,0xe4c1ff);this.railFlash.position.z=1.2;this.rail.add(this.railFlash);

    // Rigs use boss-local units; the parent scales the whole boss consistently.
    const back=assembly([
      paint(new T.BoxGeometry(1.1,1.15,.6),STEEL,0,2.7,-.62),
      paint(new T.CylinderGeometry(.33,.33,.8,10),BRONZE,0,2.9,-.74),
      paint(new T.TorusGeometry(.31,.07,4,12),BLACK,0,3.03,-1.0,Math.PI/2)
    ]);back.name='BattleizerBackReactor';this.bossRig.add(back);
    this.bossCharge=glow(.35,0xff802d);this.bossCharge.position.set(0,2.9,.9);this.bossRig.add(this.bossCharge);
    for(const side of [-1,1]){
      const hinge=new T.Group();hinge.name='BattleizerWing_'+(side<0?'L':'R');hinge.position.set(side*.64,3.15,-.48);this.bossRig.add(hinge);
      const armor=assembly([
        paint(new T.BoxGeometry(.35,.55,.62),BRONZE,side*.25,0,0),
        paint(new T.CapsuleGeometry(.28,.67,2,8),STEEL,side*.61,.04,-.25),
        paint(new T.SphereGeometry(.35,8,5),0x813528,side*.58,.42,-.22),
        paint(new T.CylinderGeometry(.25,.19,.22,8),BRONZE,side*.61,-.68,-.25),
        paint(new T.CylinderGeometry(.29,.31,.55,10),BLACK,side*.56,.24,.24,Math.PI/2)
      ]);armor.name='BattleizerJetpackArmor';hinge.add(armor);
      const rotor=cannonRotor(.18,.95);rotor.position.set(side*.56,.24,.45);rotor.name='BattleizerBackCannon';hinge.add(rotor);
      const flash=glow(.27,0xff8740);flash.position.set(side*.56,.24,1.48);hinge.add(flash);
      const jet=new T.Mesh(new T.ConeGeometry(.18,.9,8),new T.MeshBasicMaterial({color:0x76dfff,transparent:true,opacity:.65,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));
      jet.rotation.z=Math.PI;jet.position.set(side*.61,-1.05,-.25);hinge.add(jet);this.wings.push({hinge,rotor,flash,jet,side});
    }
    this.reset();
  }
  update(s:Snapshot,dt:number){
    if(this.heroRig.parent!==this.hero)this.hero.add(this.heroRig);if(this.bossRig.parent!==this.boss)this.boss.add(this.bossRig);
    const state=s as Snapshot & {weaponPower?:ArsenalPickupKind|'none';powerTime?:number;bossPhase?:number;bossPattern?:string;bossY?:number};
    const delta=Math.max(0,Math.min(dt,.15));this.clock+=delta;
    const live=s.phase==='run'||s.phase==='boss',powered=live&&(state.powerTime??0)>0;
    this.cannons.visible=powered&&state.weaponPower==='cannons';this.guided.visible=powered&&state.weaponPower==='guided';this.rail.visible=powered&&state.weaponPower==='railburst';
    this.heroRig.visible=live;
    const firing=live&&s.shots.some(p=>p.z<1.6);this.spin+=delta*(firing?34:3);
    this.recoil=Math.max(0,this.recoil-delta*10);
    if(firing&&this.clock-this.previousFire>.065){this.previousFire=this.clock;this.recoil=1;}
    const nearShot=s.shots.find(p=>p.z<1.6);
    const aim=nearShot?Math.atan2(nearShot.dx,-nearShot.dz):Math.PI;
    const aimOffset=Math.atan2(Math.sin(aim-Math.PI),Math.cos(aim-Math.PI));
    for(const hand of this.hands){hand.rotor.rotation.z=this.spin;hand.group.position.z=-.22+this.recoil*.12;hand.group.rotation.y=Math.PI+T.MathUtils.clamp(aimOffset,-.3,.3);hand.group.rotation.x=this.recoil*.055;hand.flash.visible=firing&&this.recoil>.3;hand.flash.scale.set(1+this.recoil*.4,1+this.recoil*.4,1.8+this.recoil);}
    this.railFlash.visible=firing&&this.recoil>.4;this.powerGlow.forEach((g,i)=>g.scale.setScalar(1+Math.sin(this.clock*12+i)*.15));
    const inBoss=s.phase==='boss',battleizer=inBoss&&((state.bossPhase??1)>=2||state.bossPattern==='heavy'&&(s.bossAction==='windup'||s.bossAction==='fire'));
    this.bossRig.visible=s.phase==='boss'||s.phase==='destroying'||(s.phase==='lost'&&s.bossHp>0);this.unfolded+=((battleizer?1:0)-this.unfolded)*(1-Math.exp(-delta*5));
    this.bossCharge.visible=inBoss&&s.bossAction==='windup';this.bossCharge.scale.setScalar(.7+Math.max(0,s.bossAttack)*1.2+.08*Math.sin(this.clock*24));
    for(const wing of this.wings){wing.hinge.position.x=wing.side*(.64+this.unfolded*.45);wing.hinge.rotation.z=wing.side*(.12+this.unfolded*.63);wing.hinge.rotation.x=-this.unfolded*.13;wing.rotor.rotation.z=-this.spin*(s.bossAction==='windup'?1.7:1);
      wing.flash.visible=inBoss&&s.bossAction==='fire'&&state.bossPattern==='heavy';wing.flash.scale.setScalar(1.2+.25*Math.sin(this.clock*40));
      wing.jet.visible=(inBoss||s.phase==='lost'&&s.bossHp>0)&&(state.bossY??0)>.08;wing.jet.scale.set(1,1+.25*Math.sin(this.clock*30),1);}
  }
  reset(){this.clock=0;this.spin=0;this.unfolded=0;this.previousFire=0;this.recoil=0;this.heroRig.visible=false;this.bossRig.visible=false;this.bossCharge.visible=false;for(const hand of this.hands){hand.rotor.rotation.z=0;hand.flash.visible=false;}for(const wing of this.wings){wing.hinge.rotation.set(0,0,0);wing.flash.visible=false;wing.jet.visible=false;}}
  dispose(){disposeTree(this.heroRig);disposeTree(this.bossRig);this.hero.remove(this.heroRig);this.boss.remove(this.bossRig);}
}

/** The parent positions the root at the authoritative target/pickup x and world Z. */
export function createPickup(kind:ArsenalPickupKind,shootable=false){
  const group=new T.Group();group.name='PowerPickup_'+kind;group.userData.pickupKind=kind;
  const visual=new T.Group();visual.name='PickupVisual';visual.position.y=shootable?1.1:1.35;group.add(visual);
  const color=kind==='guided'?0x67e5ff:kind==='cannons'?0xffbd58:0xb39aff;
  const core=glow(shootable?.47:.35,color);core.name='PickupCore';visual.add(core);
  const cage=new T.Group();cage.name='RotatingPickupCage';visual.add(cage);
  const bands:T.BufferGeometry[]=[];for(const rx of [-Math.PI/3,Math.PI/3])bands.push(paint(new T.TorusGeometry(.62,.036,4,24),BRONZE,0,0,0,rx));
  for(const y of [-.55,.55])bands.push(paint(new T.OctahedronGeometry(.13),IVORY,0,y,0));cage.add(assembly(bands));
  const icon=new T.Group();icon.name='PickupWeaponIcon';visual.add(icon);
  if(kind==='cannons')for(const side of [-1,1]){const rotor=cannonRotor(.085,.34);rotor.scale.setScalar(.8);rotor.position.set(side*.18,-.12,-.16);icon.add(rotor);}
  else if(kind==='guided'){
    const parts:T.BufferGeometry[]=[];for(const x of [-.16,.16]){parts.push(paint(new T.CylinderGeometry(.067,.067,.45,6),IVORY,x,0,0,Math.PI/2));parts.push(paint(new T.ConeGeometry(.07,.15,6),BRONZE,x,0,.30,Math.PI/2));parts.push(paint(new T.BoxGeometry(.18,.025,.15),STEEL,x,0,-.16));}icon.add(assembly(parts));
  }else{const parts:T.BufferGeometry[]=[];for(const z of [-.21,0,.21])parts.push(paint(new T.TorusGeometry(.23,.04,4,12),IVORY,0,0,z));parts.push(paint(new T.CylinderGeometry(.06,.09,.75,8),BRONZE,0,0,0,Math.PI/2));icon.add(assembly(parts));}
  group.userData.pickupVisual=visual;group.userData.pickupCage=cage;group.userData.pickupIcon=icon;group.userData.pickupCore=core;group.userData.pickupHover=shootable?1.1:1.35;return group;
}
export function updatePickup(group:T.Group,age:number,hit=false){
  const visual=group.userData.pickupVisual as T.Group;if(!visual)return;
  visual.position.y=group.userData.pickupHover+Math.sin(age*3.5)*.13;visual.rotation.z=Math.sin(age*2)*.035;
  (group.userData.pickupCage as T.Group).rotation.set(age*.37,age*1.25,age*.21);
  (group.userData.pickupIcon as T.Group).rotation.y=-age*.8;
  (group.userData.pickupCore as T.Mesh).scale.setScalar((hit?1.22:1)+Math.sin(age*6)*.06);
}
function disposeTree(group:T.Group){
  const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();group.traverse(object=>{const mesh=object as T.Mesh;if(!mesh.isMesh)return;geometries.add(mesh.geometry);for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material])materials.add(material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
}
export function disposePickup(group:T.Group){disposeTree(group);group.removeFromParent();}
