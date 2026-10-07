import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import type {Snapshot,Target,Effect} from './contract';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {CombatVisuals,CombatMissiles,CommanderPowerVisuals,RobotFormation,EnemyWeaponCues,combatImpactPoint} from './combat-visuals';
import {RelicEffects} from './relic-effects';
import {FormationFraming,commanderAnimationBounds} from './portrait-framing';
import {BossRigAdapter} from './boss-rig-adapter';
import {BattleEnvironment,ENVIRONMENT_PALETTES} from './environment';
import {ArsenalVisuals,createPickup,updatePickup,disposePickup} from './arsenal-visuals';
import {powers,powerKind} from './power-catalog';
import {WeaponSockets,flightAttitude,type EmitterPositions} from './weapon-sockets';
import {EnemyArchetypes,enemyDesigns} from './enemy-archetypes';
import {FoundryDressing} from './foundry-dressing';
import {RevivalScene} from './revival-scene';
import {LaserClashVisuals} from './laser-clash-visuals';
import {AnimatedTroopCrowd} from './animated-troop-crowd';
import {CommanderLocomotion} from './commander-locomotion';
import {CoreAbsorption,type CoreChoice} from './core-absorption';
import {EnemySupportLinks} from './enemy-support-links';
import {ContinuousRouteEnvironment,continuousRoutePalette} from './continuous-route-environment';
import {RenderQuality} from './render-quality';
const mat=(color:number)=>new T.MeshStandardMaterial({color,roughness:.82,metalness:.06});
function box(p:T.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material){const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,1,Math.min(.06,w*.15,h*.15,d*.15)),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
function cyl(p:T.Object3D,r:number,rb:number,h:number,x:number,y:number,z:number,m:T.Material,n=12){const o=new T.Mesh(new T.CylinderGeometry(r,rb,h,n),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
class Badge{
 canvas=document.createElement('canvas');ctx:CanvasRenderingContext2D;texture:T.CanvasTexture;sprite:T.Sprite;last='';
 constructor(width=1.9,public plain=false){this.canvas.width=384;this.canvas.height=160;this.ctx=this.canvas.getContext('2d')!;this.texture=new T.CanvasTexture(this.canvas);this.texture.colorSpace=T.SRGBColorSpace;this.sprite=new T.Sprite(new T.SpriteMaterial({map:this.texture,transparent:true,depthTest:false,depthWrite:false}));this.sprite.scale.set(width,width*160/384,1);this.sprite.renderOrder=12;}
 set(text:string,color:string,sub=''){const key=text+color+sub;if(key===this.last)return;this.last=key;const c=this.ctx;c.clearRect(0,0,384,160);if(!this.plain){c.fillStyle='#152c36ef';c.beginPath();c.roundRect(4,4,376,152,25);c.fill();c.strokeStyle=color;c.lineWidth=7;c.stroke();}c.textAlign='center';c.fillStyle=this.plain?color:'white';c.font=`900 ${sub?81:100}px Segoe UI`;if(this.plain){c.strokeStyle='#30261f';c.lineWidth=10;c.strokeText(text,192,sub?100:117,355);}c.fillText(text,192,sub?100:117,355);if(sub){c.fillStyle=color;c.font='800 25px Segoe UI';c.fillText(sub,192,138,355);}this.texture.needsUpdate=true;}
 dispose(){this.texture.dispose();this.sprite.material.dispose();}
}
export function enemyArmorLabel(t:Pick<Target,'role'|'variant'>&{guidedArmor?:boolean}){return t.guidedArmor?'GUIDED RESIST':t.role==='battery'?'BATTERY':t.variant===2?'GUNNER':t.role==='carrier'?'SALVAGE':'REAVER';}
 type View={group:T.Group;badge:Badge;bar:T.Mesh;kind:string;rotor?:T.Object3D};
export class Battlefield{
 renderer:T.WebGLRenderer;quality!:RenderQuality;scene=new T.Scene();camera=new T.PerspectiveCamera(30,.56,.1,180);
 environment:BattleEnvironment;routeEnvironment:ContinuousRouteEnvironment;powerVisuals:CommanderPowerVisuals;fx:CombatVisuals;missiles:CombatMissiles;robots:RobotFormation;abilities:RelicEffects;
 specialEnemies:EnemyArchetypes;dressing:FoundryDressing;revival:RevivalScene;clashVisuals:LaserClashVisuals;strafe=0;
 formationPositions:{index:number,x:number,z:number}[]=[];commanderExploded=false;hitNumbers=new Map<number,{at:number,value:number}>();heroArms:T.Object3D[]=[];bossMuzzles:T.Mesh[]=[];bossExploded=false;recoil=0;lastMuzzle=0;previousX=0;bossPreviousX=0;
 hero=new T.Group();model?:T.Object3D;mixer?:T.AnimationMixer;run?:T.AnimationAction;idle?:T.AnimationAction;running=false;
 allies?:T.InstancedMesh;crowd?:AnimatedTroopCrowd;commanderMotion?:CommanderLocomotion;absorption:CoreAbsorption;supportLinks:EnemySupportLinks;views=new Map<number,View>();dummy=new T.Object3D();
 eliteTemplate?:T.Object3D;elitePool:T.Object3D[]=[];bossModel?:T.Object3D;bossJoints:T.Object3D[]=[];
 bossAdapter?:BossRigAdapter;arsenal?:ArsenalVisuals;pickups=new Map<number,{group:T.Group,badge:Badge}>();boss=new T.Group();
 presentation?:Snapshot;bossHitKick=0;bossFireKick=0;commanderHitKick=0;
 emitterPositions:EmitterPositions={};enemyMotion=new Map<number,{x:number,z:number,yaw:number,age:number}>();eliteSockets:WeaponSockets[]=[];projectileIDs=new Set<number>();bossPreviousZ=40;bossPreviousVz=0;bossPitch=0;bossBank=0;bossMotionReady=false;
 enemyCues:EnemyWeaponCues;enemyRecoil=new Map<number,number>();
 heroRing:T.Mesh;shadowInstances:T.InstancedMesh;
 floating:{badge:Badge,life:number,x:number,y:number,z:number}[]=[];age=0;hostileAge=0;bossVisualAge=0;shake=0;cameraBossBlend=0;armyZoom=0;resizeObserver:ResizeObserver;
 constructor(public canvas:HTMLCanvasElement){
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  this.renderer.setClearColor(0xadc5c7);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.06;
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
  this.scene.fog=new T.Fog(0xadc5c7,65,120);this.scene.add(new T.HemisphereLight(0xecf9ff,0x806444,2.0));
  const sun=new T.DirectionalLight(0xffedcb,3.2);sun.position.set(-14,30,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-20,right:20,top:35,bottom:-20,near:1,far:80});sun.shadow.normalBias=.06;sun.shadow.bias=-.0003;this.scene.add(sun);this.scene.add(new T.AmbientLight(0xffffff,.3));
  this.environment=new BattleEnvironment(this.scene);this.routeEnvironment=new ContinuousRouteEnvironment(this.scene);this.fx=new CombatVisuals(this.scene);this.powerVisuals=new CommanderPowerVisuals(this.scene);this.missiles=new CombatMissiles(this.scene);this.robots=new RobotFormation(this.scene,200);this.abilities=new RelicEffects(this.scene,this.hero,globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false);this.enemyCues=new EnemyWeaponCues(this.scene,16);this.scene.add(this.hero);
  this.specialEnemies=new EnemyArchetypes(this.scene);this.dressing=new FoundryDressing(this.scene);this.revival=new RevivalScene(this.scene);this.clashVisuals=new LaserClashVisuals(this.scene);this.absorption=new CoreAbsorption(this.scene);this.supportLinks=new EnemySupportLinks(this.scene);
  this.heroRing=new T.Mesh(new T.RingGeometry(.75,.83,48),new T.MeshBasicMaterial({color:0x52e8ff,transparent:true,opacity:.8,side:T.DoubleSide}));this.heroRing.rotation.x=-Math.PI/2;this.heroRing.position.y=.035;this.hero.add(this.heroRing);
  this.shadowInstances=new T.InstancedMesh(new T.CircleGeometry(.36,12).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0x21332d,transparent:true,opacity:.22,depthWrite:false}),220);this.shadowInstances.frustumCulled=false;this.scene.add(this.shadowInstances);
  this.scene.add(this.boss);this.quality=new RenderQuality(this.renderer,this.scene,this.camera);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.resize();
 }
 skyLevel=-1;cameraLookZ=-9.3;formationFraming=new FormationFraming();
 applyStagePalette(level:number){if(this.skyLevel===level)return;const sky=level>=3?ENVIRONMENT_PALETTES[level]?.sky??0xadc5c7:0xadc5c7;this.renderer.setClearColor(sky);if(this.scene.fog)this.scene.fog.color.setHex(sky);this.quality?.setSky(sky);this.skyLevel=level;}
 resize(){
  const w=Math.max(1,this.canvas.clientWidth),h=Math.max(1,this.canvas.clientHeight);this.renderer.setSize(w,h,false);this.quality?.resize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
  // Keep all six rows clear of the health/transfer controls. Use the maximum
  // formation footprint so recruitment and casualties cannot make the camera bob.
  const distance=(5.05/Math.min(.45,this.camera.aspect))/Math.tan(T.MathUtils.degToRad(15));
  const rear=new T.Vector3(0,0,3.39),bottom=h-128;
  const rearY=(look:number)=>{this.camera.position.set(0,distance*.58,look+distance*.815);this.camera.lookAt(0,.1,look);this.camera.updateMatrixWorld(true);return(1-rear.clone().project(this.camera).y)*h*.5;};
  let low=-9.3,high=0;
  if(rearY(low)>bottom){for(let i=0;i<18;i++){const mid=(low+high)*.5;if(rearY(mid)>bottom)low=mid;else high=mid;}this.cameraLookZ=high;}else this.cameraLookZ=low;
 }
 async load(){
  const loader=new GLTFLoader();const [hero,troop,elite,tyrant]=await Promise.all([loader.loadAsync('commander.glb'),loader.loadAsync('troop.glb'),loader.loadAsync('cinder-reaver.glb'),loader.loadAsync('forge-tyrant.glb'),this.dressing.load(),this.routeEnvironment.load()]);this.model=hero.scene;this.model.scale.setScalar(.95);this.model.rotation.y=Math.PI;this.hero.add(this.model);this.model.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.material.roughness=.76;o.material.metalness=.12;}if(o.isBone&&o.name.startsWith('upperarm'))this.heroArms.push(o);});
  const styled=new Set<T.Material>();for(const asset of [elite,tyrant])asset.scene.traverse((o:any)=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(!styled.has(m)){styled.add(m);m.color.multiplyScalar(2.2);m.metalness=.20;m.roughness=.64;}});
  this.eliteTemplate=elite.scene;this.eliteTemplate.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  const ventGeometry=new T.TorusGeometry(.28,.045,6,24),ventMaterial=new T.MeshBasicMaterial({color:0xffbd61,transparent:true,opacity:.9,depthWrite:false,toneMapped:false});
  for(let i=0;i<16;i++){const e=this.eliteTemplate.clone(true);e.visible=false;this.elitePool.push(e);this.scene.add(e);this.eliteSockets.push(new WeaponSockets(e,true));const vent=new T.Mesh(ventGeometry,ventMaterial);vent.name='CarrierVulnerability';vent.position.set(0,1.5,.55);vent.visible=false;e.add(vent);}
  this.boss.clear();this.bossModel=tyrant.scene;this.bossModel.rotation.y=Math.PI;this.boss.add(this.bossModel);this.bossModel.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}if(/^(Arm_[LR]|Barrel_[LR]|Pod_[LR]|Leg_[LR]|Knee_[LR]|Head)$/.test(o.name)){o.userData.restQuaternion=o.quaternion.clone();this.bossJoints.push(o);}});
  this.bossAdapter=new BossRigAdapter(this.boss,this.scene);this.arsenal=new ArsenalVisuals(this.hero,this.boss);
  this.formationFraming.setCommanderBounds(commanderAnimationBounds(this.model,hero.animations));
  const parts=(gltf:any)=>{gltf.scene.updateMatrixWorld(true);let mesh:any;gltf.scene.traverse((o:any)=>{if(o.isMesh&&!mesh)mesh=o;});const geo=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld),m=mesh.material.clone();m.roughness=.85;m.metalness=.05;return [geo,m] as [T.BufferGeometry,T.MeshStandardMaterial];};
  const [ag,am]=parts(troop);this.crowd=new AnimatedTroopCrowd(this.scene,ag,am,this.model,hero.animations,64);this.allies=this.crowd.mesh;this.formationFraming.setBounds(this.crowd.bounds);ag.dispose();am.dispose();
  this.commanderMotion=new CommanderLocomotion(this.model,hero.animations);this.mixer=this.commanderMotion.mixer;
 }
 reset(){this.crowd?.reset();this.commanderMotion?.reset();this.absorption.reset();this.supportLinks.reset();this.specialEnemies.reset();this.revival.reset();this.clashVisuals.reset();this.strafe=0;this.formationFraming.reset();this.bossAdapter?.reset();this.enemyMotion.clear();this.projectileIDs.clear();this.emitterPositions={};this.bossPreviousZ=40;this.bossPreviousVz=0;this.bossPitch=0;this.bossBank=0;this.bossMotionReady=false;this.enemyRecoil.clear();this.enemyCues.reset();this.presentation=undefined;this.bossHitKick=0;this.bossFireKick=0;this.commanderHitKick=0;this.hostileAge=0;this.bossVisualAge=0;this.commanderExploded=false;this.hero.visible=true;this.formationPositions=[];this.hitNumbers.clear();this.arsenal?.reset();for(const p of this.pickups.values()){this.scene.remove(p.group);p.group.remove(p.badge.sprite);p.badge.dispose();disposePickup(p.group);}this.pickups.clear();for(const v of this.views.values())this.disposeView(v);this.views.clear();for(const f of this.floating){this.scene.remove(f.badge.sprite);f.badge.dispose();}this.floating=[];this.fx.reset();this.powerVisuals?.reset();this.missiles.reset();this.robots.reset();this.abilities.reset();this.bossExploded=false;this.renderer.toneMappingExposure=1.06;this.camera.fov=30;this.camera.updateProjectionMatrix();this.recoil=0;this.previousX=0;this.bossPreviousX=0;this.lastMuzzle=0;this.shake=0;this.cameraBossBlend=0;this.armyZoom=0;}
 set(mesh:T.InstancedMesh,i:number,x:number,y:number,z:number,scale=1,rot=0,width=1){this.dummy.position.set(x,y,z);this.dummy.rotation.set(0,rot,0);this.dummy.scale.set(scale*width,scale,scale);this.dummy.updateMatrix();mesh.setMatrixAt(i,this.dummy.matrix);}
 createView(t:Target):View{
  const group=new T.Group(),badge=new Badge(t.kind==='gate'?2.8:t.kind==='crate'?2.0:1.45),red=mat(0xe94f38),gold=mat(0xfbb94e),dark=mat(0x233942),white=mat(0xffefd0);let rotor:T.Object3D|undefined;
  if(t.kind==='gate'){
   const positive=t.value>=0,blue=mat(positive?0x1dabc2:0xe94f38);for(const side of [-1,1]){box(group,.18,2.1,.18,side*1.55,1.05,0,dark);cyl(group,.16,.24,.28,side*1.55,.14,0,gold,8);box(group,.08,1.95,.05,side*1.55,1.1,.12,blue);}
   const panel=new T.Mesh(new T.PlaneGeometry(3,1.65),new T.MeshBasicMaterial({color:positive?0x25c5ec:0xf56542,transparent:true,opacity:.24,side:T.DoubleSide,depthWrite:false}));panel.position.y=1.1;group.add(panel);box(group,3.3,.12,.20,0,2.12,0,blue);badge.sprite.position.y=1.35;
   const floor=new T.Mesh(new T.PlaneGeometry(3,.32),new T.MeshBasicMaterial({color:positive?0x45dfff:0xff7556,transparent:true,opacity:.65,side:T.DoubleSide}));floor.rotation.x=-Math.PI/2;floor.position.y=.045;group.add(floor);group.userData.gateTint=[blue,panel.material,floor.material];
  }else if(t.kind==='orb'){
   rotor=createPickup(powerKind(t.value),true);group.add(rotor);badge.sprite.position.y=2.65;
  }else if(t.kind==='crate'){
   box(group,1.65,1.3,1.4,0,.68,0,gold);for(const x of [-.55,.55])box(group,.12,1.2,1.25,x,.6,0,dark);for(const z of [-.52,.52])box(group,1.4,.1,.13,0,1.05,z,white);rotor=new T.Group();rotor.position.y=2.05;rotor.scale.setScalar(1.4);group.add(rotor);box(rotor,.70,.25,.35,0,0,0,dark);for(const x of [-.18,.18])cyl(rotor,.08,.08,.90,x,.06,-.44,dark,8).rotation.x=Math.PI/2;box(rotor,.18,.28,.22,.05,-.22,0,white);badge.sprite.position.set(0,3.0,0);
  }else if(t.kind==='hazard'){
   rotor=new T.Group();rotor.position.y=.70;group.add(rotor);const log=cyl(rotor,.56,.56,2.3,0,0,0,red,16);log.rotation.z=Math.PI/2;for(const x of [-1.12,1.12]){const cap=cyl(rotor,.63,.63,.17,x,0,0,white,16);cap.rotation.z=Math.PI/2;}for(let j=0;j<4;j++)for(let i=0;i<7;i++){const a=i/7*Math.PI*2,o=new T.Mesh(new T.ConeGeometry(.16,.37,4),white);o.position.set(-.86+j*.57,Math.cos(a)*.61,Math.sin(a)*.61);o.rotation.x=a;rotor.add(o);}badge.sprite.position.y=1.9;
  }else badge.sprite.position.y=1.65;
  const bar=box(group,t.kind==='gate'?2.4:1.6,.10,.06,0,t.kind==='enemy'?2.6:t.kind==='orb'?2.25:1.31,.06,new T.MeshBasicMaterial({color:t.kind==='crate'?0xffdd56:0xff5b49}));
  if(t.kind==='enemy'||t.kind==='orb'){const back=box(group,1.68,.16,.06,0,bar.position.y,0,new T.MeshBasicMaterial({color:0x1d2430}));back.renderOrder=1;}group.add(badge.sprite);this.scene.add(group);const v={group,badge,bar,kind:t.kind,rotor};this.views.set(t.id,v);return v;
 }
 disposeView(v:View){this.scene.remove(v.group);v.badge.dispose();const materials=new Set<T.Material>(),geometries=new Set<T.BufferGeometry>();v.group.traverse((o:any)=>{if(o.isMesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
 trigger(e:Effect,current?:Snapshot){
  if(e.kind==='actStart')return; // A zone marker cannot reset live combat or presentation.
  this.abilities.trigger(e,current);this.powerVisuals?.trigger(e);
  if((e.kind==='hit'||e.kind==='chainHit')&&e.hitRegion)this.bossAdapter?.notifyHit(e.hitRegion,e.value);
  if(e.kind==='healthPickup'&&e.value>0){this.fx.healthPickup(this.hero,e.value);this.float('+'+Math.round(e.value),e.x,-e.z,'#7dffc1',2.3,true);}
  if(e.kind==='heal'&&e.value>0){this.fx.healthPickup(this.hero,e.value);this.float('+'+Math.round(e.value),e.x,-e.z,'#7dffc1',2.3,true);}
  if(e.kind==='shieldBreak'){this.fx.shieldBreak(e.x,1.2,-e.z);this.float('GUARD BROKEN',e.x,-e.z,'#f4d394',2.6,true);}
  if(e.kind==='enemySupport'){this.supportLinks.trigger(e);this.fx.energyImpact(e.x,e.y??1.6,-e.z,0x73edc1);if([e.endX,e.endY,e.endZ].every(Number.isFinite))this.fx.energyImpact(e.endX!,e.endY!,-e.endZ!,0x73edc1);}
  if(e.kind==='revive'){this.commanderExploded=false;this.hero.visible=true;this.commanderHitKick=0;for(const f of this.floating){this.scene.remove(f.badge.sprite);f.badge.dispose();}this.floating=[];}
  const z=-e.z;
  // Events arrive before update: detach parts from this frame's authoritative pose.
  const spatial=current;
  if(spatial?.bossPose&&(e.kind==='bossPartBreak'||e.kind==='bossDeath'))this.bossAdapter?.apply(spatial.bossPose);
  if(e.kind==='hit'){const bossHit=e.variant===3||e.variant===4,point=combatImpactPoint(e,{depthScale:1,bossPhase:bossHit,bossY:current?.bossY??this.boss.position.y,bossImpactHeight:4.31,overdrive:false,weapon:1,targets:[...(current?.targets??[]),...(this.presentation?.targets??[])]});if(bossHit&&e.value<=0)this.fx.deflect(point.x,point.y,point.z);else {const beam=current?.friendlyBeams?.[0];if(current?.combatPower==='tempest'&&beam?.time>0&&Math.abs(point.x-beam.x)<=beam.width*.5+.08){const range=beam.endZ-beam.z,t=T.MathUtils.clamp((-point.z-beam.z)/Math.max(.01,range),0,1),height=T.MathUtils.lerp(beam.y,beam.endY,t);this.fx.energyImpact(point.x,Number.isFinite(e.y)?point.y:Math.max(point.y,height-beam.width*.35),point.z,0x8aeaff);}else this.fx.impact(point.x,point.y,point.z,.5);}if(bossHit&&e.value>0)this.bossHitKick=Math.max(this.bossHitKick,.24);if(e.value>0&&e.variant>0&&!bossHit){const n=this.hitNumbers.get(e.entityId)??{at:-1,value:0};n.value+=e.value;if(this.age-n.at>.22){this.float('-'+Math.ceil(n.value),e.x,z,'#ffe0a0',3.4,true);n.at=this.age;n.value=0;}this.hitNumbers.set(e.entityId,n);}}
  if(e.kind==='chainHit'){const link=e;if([link.endX,link.endY,link.endZ].every(Number.isFinite)){this.fx.energyImpact(link.endX!,link.endY!,-link.endZ!,0xc5adff);if(link.hitRegion&&e.value>0)this.bossHitKick=Math.max(this.bossHitKick,.20);}}
  if(e.kind==='drop')this.fx.impact(e.x,1.2,z,1.2);
  if(e.kind==='pickup'&&powerKind(e.value)!=='health')this.fx.powerAcquire(this.hero,powerKind(e.value));
  if(e.kind==='coreExpose'){const core=spatial?.bossRegions?.find(r=>r.id==='core');this.fx.impact(core?.x??e.x,core?.y??(current?.bossY??this.boss.position.y)+4.31,core?-core.z:z+.85,1.6);this.shake=.17;}
  if(e.kind==='bossRevive'){this.fx.impact(e.x,this.boss.position.y+2.7,z,2);this.shake=.24;}
  if(e.kind==='bossPartBreak'){const part=['cannonL','cannonR','boosterL','boosterR','legL','legR'][e.value-1] as 'cannonL'|'cannonR'|'boosterL'|'boosterR'|'legL'|'legR'|undefined;if(part){this.scene.updateMatrixWorld(true);this.fx.bossPartBreak(this.boss,part);this.shake=.24;}}
  if(e.kind==='bossPhase'){this.shake=.20;this.fx.impact(e.x,2.8,z,2);}
  if(e.kind==='kill'){this.hitNumbers.delete(e.entityId);if(e.variant<0)this.fx.impact(e.x,1,z,2);else{const point=combatImpactPoint(e,{depthScale:1,bossPhase:false,overdrive:false,weapon:1,targets:[...(current?.targets??[]),...(this.presentation?.targets??[])]});this.fx.enemyDeath(point.x,point.z,e.variant,e.variant>0?1.6:1,point.y);}this.shake=Math.max(this.shake,e.variant>0?.10:.04);}
  if(e.kind==='enemyFire'){if(this.enemyRecoil.size>=32&&!this.enemyRecoil.has(e.entityId))this.enemyRecoil.delete(this.enemyRecoil.keys().next().value!);this.enemyRecoil.set(e.entityId,.24);}
  if(e.kind==='contact'){this.fx.impact(e.x,.6,z,1.2);this.shake=Math.max(this.shake,.045);}
  if(e.kind==='block')this.fx.impact(e.x,1,z,.5);
  if(e.kind==='gate'||e.kind==='recruit'){this.fx.impact(e.x,.6,z,.8);if(e.value!==0)this.float(e.value>0?'+'+e.value:String(e.value),e.x,z,'#73eaff');}
  if(e.kind==='troopDeath')this.fx.allyLoss(e.x,z,1);
  if(e.kind==='damage'){this.shake=.12;this.float('-'+Math.abs(e.value),e.x,z,'#ff8469',2,true);}
  if(e.kind==='bossShot'){this.bossFireKick=.3;this.shake=.07;}
  if(e.kind==='commanderHit'){this.commanderHitKick=.35;this.fx.impact(e.x,1.3,z,1.2);this.shake=.2;this.float('-'+Math.abs(e.value)+' HP',e.x,z,'#ff8469',3.1,true);}
  if(e.kind==='hazardBreak'){this.fx.enemyDeath(e.x,z,1,Math.max(1.2,e.size));this.shake=.22;}
  if(e.kind==='commanderDeath'&&!this.commanderExploded){this.scene.updateMatrixWorld(true);this.fx.commanderDeath(this.hero);this.commanderExploded=true;this.hero.visible=false;this.shake=.4;}
  if(e.kind==='retreat')this.hitNumbers.delete(e.entityId);
  if(e.kind==='bossDeath'&&!this.bossExploded){this.scene.updateMatrixWorld(true);const core=spatial?.bossRegions?.find(r=>r.id==='core');this.fx.bossDeath(this.boss,core?new T.Vector3(core.x,core.y,-core.z):undefined);this.bossExploded=true;this.shake=.45;this.float('CORE DESTROYED',e.x,z,'#ffc86b');}
 }
 weaponUpgrade(previous:number,next:number){return this.abilities.weaponUpgrade(previous,next);}
 get absorptionRemaining(){return this.absorption.timeRemaining;}
 beginAbsorption(choice:CoreChoice,s:Snapshot){const core=s.bossRegions?.find(r=>r.id==='core');this.absorption.begin(choice,new T.Vector3(core?.x??s.bossX,core?.y??s.bossY+4.31,core?-core.z:-s.bossZ),new T.Vector3(s.x,1.7,0));}
 sacrifice(positions:{x:number,z:number}[]){this.fx.sacrifice(this.hero,positions);}
 float(text:string,x:number,z:number,color:string,height=2,plain=false){if(this.floating.length>=16){const f=this.floating.shift()!;this.scene.remove(f.badge.sprite);f.badge.dispose();}const badge=new Badge(text.length>8?3:1.5,plain);badge.set(text,color);this.scene.add(badge.sprite);this.floating.push({badge,life:1.0,x,y:height,z});}
 update(s:Snapshot,dt:number,mode:'intro'|'play'|'paused'|'result',draw=true){
  if(mode==='paused'){if(draw)this.quality.render();return;}
  const active=mode==='play',combatPicture=active||mode==='paused',intro=mode==='intro',reviving=s.phase==='reviving',downed=s.phase==='lastStand',renderDt=mode==='paused'?0:dt;
  const stage=s.stageLevel??s.level;
  if(s.campaign){const p=continuousRoutePalette(intro?0:s.travelDistance);this.renderer.setClearColor(p.sky);(this.scene.fog as T.Fog).color.setHex(p.sky);this.quality.setSky(p.sky);this.scene.traverse(o=>{if(o instanceof T.HemisphereLight){o.color.setHex(p.fill);o.groundColor.setHex(p.ground);}if(o instanceof T.DirectionalLight)o.color.setHex(p.key);});}else this.applyStagePalette(stage);
  this.presentation=s;this.bossHitKick=Math.max(0,this.bossHitKick-renderDt);this.bossFireKick=Math.max(0,this.bossFireKick-renderDt);this.commanderHitKick=Math.max(0,this.commanderHitKick-renderDt);
  const combatHeld=reviving||downed||s.rewardPending||!!s.clash?.active;
  this.age+=renderDt;const hostileRate=combatHeld?0:s.timePower==='freeze'?0:s.timePower==='slow'?.5:s.timePower==='haste'?1.35:1;this.hostileAge+=renderDt*hostileRate;if(!(s.empStunTime>0))this.bossVisualAge+=renderDt*hostileRate;const bossAge=this.bossVisualAge;const bossPhase=s.phase==='boss'||s.phase==='destroying'||s.phase==='reward'||(this.bossExploded&&s.phase==='won')||((s.phase==='lost'||downed||reviving)&&s.bossHp>0&&s.travelDistance>=s.travelGoal);
  for(const [id,kick] of this.enemyRecoil){const next=kick-renderDt*hostileRate;if(next<=0)this.enemyRecoil.delete(id);else this.enemyRecoil.set(id,next);}
  const marching=active&&s.phase==='run',lateralSpeed=renderDt>0?Math.abs(s.x-this.previousX)/renderDt:0,locomotion=marching||(active&&!reviving&&!downed&&lateralSpeed>.25);
  this.commanderMotion?.update({dt:renderDt,forward:marching,lateralVelocity:renderDt>0?(s.x-this.previousX)/renderDt:0,active,held:combatHeld,recoil:this.recoil});
  this.environment.root.visible=!s.campaign;this.dressing.root.visible=!s.campaign;this.routeEnvironment.root.visible=!!s.campaign;
  if(s.campaign)this.routeEnvironment.update(intro?this.age*.55:s.travelDistance,stage,renderDt);else{this.environment.update(intro?this.age*.55:s.travelDistance,stage,renderDt);this.dressing.update(intro?this.age*.55:s.travelDistance,stage,renderDt);}
  // Constant close portrait framing: commander below centre, long visible approach.
   const halfWidth=5.05,distance=(halfWidth/Math.min(.45,this.camera.aspect))/Math.tan(T.MathUtils.degToRad(15)),lookZ=this.cameraLookZ;
  this.camera.position.set(0,distance*.58,lookZ+distance*.815);this.camera.lookAt(0,.1,lookZ);
  const pan=this.formationFraming.update(this.camera,intro||this.commanderExploded?[]:s.formation,renderDt,this.canvas.clientWidth,intro||this.commanderExploded?undefined:s.x,reviving);
  // Boss reveal: rise and pull back so the Tyrant towers over the army; ease, never snap.
  this.cameraBossBlend+=((bossPhase&&!intro?1:0)-this.cameraBossBlend)*(1-Math.exp(-renderDt*1.6));const reveal=this.cameraBossBlend*this.cameraBossBlend*(3-2*this.cameraBossBlend);
  this.camera.position.set(pan+this.strafe*.45,this.camera.position.y+reveal*2.4,this.camera.position.z+reveal*3.2);this.camera.lookAt(pan+this.strafe*.25,.1+reveal*1.2,lookZ-reveal*2);this.camera.rotateZ(-this.strafe*.025);
  // Trauma shake: squared falloff with smooth noise reads as weight, not jitter.
  if(this.shake>0&&active&&!(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false)){const t=Math.min(1,this.shake*2.6),k=t*t,a=this.age*31;this.camera.position.x+=(Math.sin(a)+Math.sin(a*1.7+1.3))*.5*k*.55;this.camera.position.y+=(Math.sin(a*1.3+.4)+Math.sin(a*2.1))*.5*k*.45;this.camera.rotateZ((Math.sin(a*.9+2)*.5)*k*.035);this.shake=Math.max(0,this.shake-renderDt*.65);}
  const horizontalVelocity=renderDt>0?(s.x-this.previousX)/renderDt:0;this.previousX=s.x;
  this.strafe+=(T.MathUtils.clamp(horizontalVelocity/5,-1,1)-this.strafe)*(1-Math.exp(-renderDt*13));
  this.hero.position.set(intro?0:s.x,downed?-.24:marching?Math.abs(Math.sin(this.age*11))*.055:0,intro?-3.7:0);
  this.recoil=Math.max(0,this.recoil-renderDt*5);
  if(this.model){this.model.scale.setScalar(intro?1.65:1.43);const revivalKneel=reviving?T.MathUtils.clamp((s.reviveCinematicTime??0)/1.5,0,1)*.75:0;this.model.rotation.set(downed?.75:revivalKneel-this.recoil*.075+this.commanderHitKick*.22,intro?Math.PI*.87:Math.PI+this.strafe*.20,-this.strafe*.12+Math.sin(this.age*38)*this.commanderHitKick*.08);}
  this.heroRing.visible=!intro;
  this.hero.visible=!this.commanderExploded;this.formationPositions=[];
  let allyCount=0,shadowCount=0,eliteCount=0;
  const formation=intro||this.commanderExploded?[]:s.formation;
  const centerX=formation.length?formation.reduce((sum,p)=>sum+p.x,0)/formation.length:s.x;
  const outer=formation.length?Math.max(...formation.map(p=>Math.abs(p.x-centerX))):0;
  if(this.allies){for(const p of formation){
    const i=p.index,x=p.x,z=-p.z;this.formationPositions.push({index:i,x,z});
    allyCount++;
    this.set(this.shadowInstances,shadowCount++,x,.035,z,.95);
   }this.crowd?.update(formation,{dt:renderDt,time:this.age,marching,strafe:this.strafe,held:combatHeld,visible:!intro&&!this.commanderExploded});
  }
  this.set(this.shadowInstances,shadowCount++,this.hero.position.x,.033,this.hero.position.z,2);
  this.robots.begin();this.specialEnemies.begin();const live=new Set<number>(),moving=new Set<number>();for(const key of Object.keys(this.emitterPositions))delete this.emitterPositions[key];
  for(const t of s.targets){if(t.z>90||t.z< -8||intro)continue;
   const previous=this.enemyMotion.get(t.id),velocityX=previous&&renderDt>0?(t.x-previous.x)/renderDt:0,velocityZ=previous&&renderDt>0?(-t.z-previous.z)/renderDt:0;
   const targetRate=combatHeld||t.stunTime>0?0:s.timePower==='freeze'&&t.z>=18?1:hostileRate,enemyAge=(previous?.age??this.hostileAge)+renderDt*targetRate;
   const targetYaw=t.stunTime>0?(previous?.yaw??0):t.op===2?Math.atan2(velocityX,Math.max(.01,velocityZ)):['tracking','locked','fire'].includes(t.fireState)?Math.atan2(t.aimX-t.x,Math.max(1,t.z)):0;
   let smoothYaw=previous?.yaw??targetYaw;const turn=Math.atan2(Math.sin(targetYaw-smoothYaw),Math.cos(targetYaw-smoothYaw));smoothYaw+=T.MathUtils.clamp(turn*(1-Math.exp(-renderDt*12)),-renderDt*4,renderDt*4);
   if(((t.archetype??0)===3||(t.archetype??0)===4)&&['locked','fire'].includes(t.fireState))smoothYaw=targetYaw;
   if(t.kind==='enemy'){moving.add(t.id);this.enemyMotion.set(t.id,{x:t.x,z:-t.z,yaw:smoothYaw,age:enemyAge});}
   if(t.kind==='enemy'&&(t.archetype??0)>0){
    this.specialEnemies.add(t,enemyAge,velocityX,velocityZ,smoothYaw);this.emitterPositions['gunner:'+t.id]=this.specialEnemies.muzzle(t);if(shadowCount<218)this.set(this.shadowInstances,shadowCount++,t.x,.034,-t.z,1.4);
    live.add(t.id);const v=this.views.get(t.id)??this.createView(t),design=enemyDesigns[(t.archetype??1)-1];v.group.position.set(t.x,0,-t.z);v.group.visible=t.z<28;v.badge.sprite.position.y=design.height+.42;v.bar.position.y=design.height+.10;const shield=(t.shieldHp??0)>0;v.badge.set(shield?'▰ '.repeat(t.shieldHp??0).trim():String(Math.ceil(t.hp)),shield?'#85d7e1':'#ff9c79',design.name);v.bar.scale.x=shield?Math.max(.01,(t.shieldHp??0)/(t.shieldMax??3)):Math.max(.01,t.hp/t.maxHp);(v.bar.material as T.MeshBasicMaterial).color.setHex(shield?0x6fd6df:0xf87255);continue;
   }
   if(t.kind==='enemy'&&t.variant===0){this.robots.add(t.x,-t.z,1.02,targetYaw,t.hit>0,enemyAge+t.id,{id:t.id,dt:renderDt*targetRate,velocityX,velocityZ,aimYaw:targetYaw});if(shadowCount<218)this.set(this.shadowInstances,shadowCount++,t.x,.034,-t.z,1.2);continue;}

   live.add(t.id);const v=this.views.get(t.id)??this.createView(t);v.group.visible=true;v.group.position.set(t.x,0,-t.z);v.group.scale.setScalar(t.hit>0?1.035:1);
   if(t.kind==='gate'){
    v.group.scale.x*=(t.size+.1)/1.55;v.badge.set(t.op===1?'×'+t.value:(t.value>=0?'+':'')+t.value,t.value>=0?'#54ddff':'#ff7755',t.op===1?'MULTIPLY':t.value<0?'SHOOT TO FLIP':'RECRUIT');v.bar.visible=false;
    for(const m of v.group.userData.gateTint??[])m.color.set(t.value>=0?0x1dabc2:0xe94f38);
   }else if(t.kind==='orb'){
    const info=powers[powerKind(t.value)];v.badge.set(String(Math.ceil(t.hp)),info.color,info.short);v.bar.scale.x=Math.max(.02,t.hp/t.maxHp);if(v.rotor)updatePickup(v.rotor as T.Group,this.age,t.hit>0);
   }else if(t.kind==='crate'){
    v.badge.set(String(Math.ceil(t.hp)),'#ffc851','UPGRADE');v.bar.scale.x=Math.max(.02,t.hp/t.maxHp);if(v.rotor){v.rotor.rotation.y=this.age*.85;v.rotor.position.y=2.05+Math.sin(this.age*3)*.12;}
   }else if(t.kind==='hazard'){
    v.badge.set('-'+Math.abs(t.value),'#ff795b');v.bar.visible=false;if(v.rotor){v.rotor.rotation.x=-s.travelDistance*1.6-this.age*.8;v.rotor.scale.x=t.size*2/2.3;}
   }else{
    v.badge.set(String(Math.ceil(t.hp)),t.guidedArmor?'#d6b875':'#ff8064',t.role==='carrier'&&t.ventOpen?'VENT OPEN':enemyArmorLabel(t));(v.bar.material as T.MeshBasicMaterial).color.set(t.guidedArmor?0xc19b60:0xff5b49);v.bar.scale.x=Math.max(.02,t.hp/t.maxHp);v.badge.sprite.position.y=3.05;v.group.userData.ventOpen=t.role==='carrier'&&t.ventOpen;
    if(eliteCount<this.elitePool.length){const index=eliteCount++,e=this.elitePool[index],aiming=['gunner','battery'].includes(t.role)&&['tracking','locked','fire'].includes(t.fireState),kick=this.enemyRecoil.get(t.id)??0,suspension=aiming?Math.sin(enemyAge*5+t.id)*.008:Math.sin(enemyAge*7+t.id)*Math.min(.025,Math.hypot(velocityX,velocityZ)*.006);e.visible=true;e.position.set(t.x,.02+suspension,-t.z);e.rotation.set(-kick*.15,Math.PI+smoothYaw,T.MathUtils.clamp(-velocityX*.018,-.07,.07));e.scale.setScalar(t.variant===1?1.1:1.0);
     e.traverse(o=>{if(/^Arm_[LR]$/.test(o.name))o.rotation.x=aiming?-.12-kick*.25:Math.sin(enemyAge*6+t.id)*.10;if(/^Leg_[LR]$/.test(o.name))o.rotation.x=aiming?.015:Math.sin(enemyAge*7+t.id+(o.name==='Leg_R'?Math.PI:0))*(t.z>3?.16:.045);if(o.name==='Barrel_R')o.rotation.z=-enemyAge*(aiming?12:6);});
     const vent=e.getObjectByName('CarrierVulnerability');if(vent){vent.visible=t.role==='carrier'&&t.ventOpen;vent.scale.setScalar(.9+Math.sin(this.age*5)*.06);}
     const muzzle=this.eliteSockets[index].position('gunner');if(muzzle)this.emitterPositions['gunner:'+t.id]=muzzle;
    }
   }
  }
  const livePickups=new Set<number>();for(const p of s.pickups){livePickups.add(p.id);let view=this.pickups.get(p.id);if(!view){const group=createPickup(p.kind),badge=new Badge(1.7),info=powers[p.kind];badge.set(info.short,info.color);badge.sprite.position.y=2.15;group.add(badge.sprite);view={group,badge};this.pickups.set(p.id,view);this.scene.add(group);}view.group.visible=!intro;view.group.position.set(p.x,0,-p.z);view.badge.sprite.visible=p.z<19&&p.z>-2;updatePickup(view.group,this.age);}
  for(const [id,v] of this.pickups)if(!livePickups.has(id)){this.scene.remove(v.group);v.group.remove(v.badge.sprite);v.badge.dispose();disposePickup(v.group);this.pickups.delete(id);}
  for(const id of this.enemyMotion.keys())if(!moving.has(id))this.enemyMotion.delete(id);
  this.robots.end();this.specialEnemies.end();for(const [id,v] of this.views)if(!live.has(id)){this.disposeView(v);this.views.delete(id);}
  for(let i=eliteCount;i<this.elitePool.length;i++)this.elitePool[i].visible=false;
  this.boss.visible=(bossPhase||intro)&&!this.bossExploded;this.boss.position.set(intro?0:s.bossX,intro?0:s.bossY,intro?-12:-s.bossZ);this.boss.scale.setScalar(intro?1.25:1.4);
  const spatial=s;
  const authoritative=!intro&&bossPhase&&this.bossAdapter?.apply(spatial.bossPose)===true;
  if(!authoritative){
  const bossVelocity=this.bossMotionReady&&renderDt>0?(s.bossX-this.bossPreviousX)/renderDt:0,bossForward=this.bossMotionReady&&renderDt>0?(this.bossPreviousZ-s.bossZ)/renderDt:0;this.bossPreviousX=s.bossX;this.bossPreviousZ=s.bossZ;this.bossMotionReady=true;
  const attitude=flightAttitude(bossVelocity,bossForward,this.bossPreviousVz,renderDt,bossPhase&&s.bossY>.12&&(s.bossPartsMask&12)!==12);this.bossPreviousVz=bossForward;
  const settle=1-Math.exp(-renderDt*8);this.bossPitch+=(attitude.pitch-this.bossPitch)*settle;this.bossBank+=(attitude.roll-this.bossBank)*settle;
  if(!(s.empStunTime>0)){this.boss.rotation.x=this.bossPitch-this.bossHitKick*.12+this.bossFireKick*.045;this.boss.rotation.z=this.bossBank;this.boss.rotation.y=bossPhase?T.MathUtils.clamp(Math.atan2(((s.bossAction==='windup'||s.bossAction==='fire')?s.bossLane:s.x)-s.bossX,Math.max(6,s.bossZ)),-.32,.32):0;}
  const recovering=s.bossState==='rebuilding',exposed=s.bossState==='exposed',guarded=s.bossState==='guarded';
  const windup=s.phase==='boss'&&s.bossAction==='windup',fire=s.phase==='boss'&&s.bossAction==='fire',walk=s.phase==='lost'||downed||recovering||exposed?0:windup?.02:.16;
  if(!(s.empStunTime>0))for(const joint of this.bossJoints){joint.quaternion.copy(joint.userData.restQuaternion);const side=joint.name.endsWith('R')?Math.PI:0;
   if(joint.name.startsWith('Leg_'))joint.rotation.x+=Math.sin(bossAge*5.5+side)*walk;
   else if(joint.name.startsWith('Knee_'))joint.rotation.x+=Math.max(0,Math.sin(bossAge*5.5+side))*(exposed||recovering?.02:.12);
   else if(joint.name.startsWith('Arm_')){joint.rotation.x+=(exposed?.35:guarded?-.20:recovering?-.3:windup?-.18-(Math.sin(bossAge*26)*.015):fire?.22:Math.sin(bossAge*3+side)*.055)+this.bossFireKick*.22-this.bossHitKick*.13;if(guarded)joint.rotation.z+=joint.name.endsWith('L')?-.18:.18;}
   else if(joint.name.startsWith('Barrel_'))joint.rotation.z-=bossAge*(windup?15:fire?22:3);
   else if(joint.name==='Head')joint.rotation.y+=T.MathUtils.clamp((s.x-s.bossX)*-.06,-.18,.18);
  }
  }
  this.bossAdapter?.updateRegions(spatial.bossRegions,!!authoritative&&combatPicture&&s.phase==='boss'&&!this.bossExploded,spatial.bossComponents,s.guardHp,renderDt);
  // Socket sampling/effects happens after current-frame body and joint transforms.
  this.arsenal?.update(s,renderDt);this.boss.updateWorldMatrix(true,true);this.arsenal?.emitters(this.emitterPositions);
  this.enemyCues.update(s.targets,active,this.emitterPositions);
  const flashSources=new Set<string>();for(const shot of s.enemyShots){if(this.projectileIDs.has(shot.id))continue;const key=shot.emitter==='gunner'?'gunner:'+shot.sourceId:shot.emitter;if(!key||key==='core'||flashSources.has(key))continue;const socket=this.emitterPositions[key];if(socket&&active){this.fx.muzzle(socket.x,socket.y,socket.z,true);flashSources.add(key);}}
  this.projectileIDs=new Set(s.enemyShots.map(p=>p.id));
  if(this.boss.visible)this.set(this.shadowInstances,shadowCount++,this.boss.position.x,.032,this.boss.position.z,5.5);
  this.shadowInstances.count=shadowCount;this.shadowInstances.instanceMatrix.needsUpdate=true;
  this.missiles.update(s.shots,s.enemyShots,{depthScale:1,bossPhase,bossZ:s.bossZ,bossX:s.bossX,bossY:s.bossY,bossImpactHeight:4.31,bossSurfaceOffset:.85,bossLaunchHeight:s.bossPattern==='laser'?4.31:s.bossPattern==='heavy'?4.5:3.4,targets:s.targets,formation:s.formation,dt:renderDt,simulationTime:s.time,emitters:this.emitterPositions,bossCharging:s.phase==='boss'&&s.bossPattern==='laser'&&s.bossAction==='windup',bossCharge:s.bossAttack,hostileRate,lasers:s.lasers,overdrive:false,weapon:s.weapon,visible:!intro&&!reviving&&s.phase!=='won'&&s.phase!=='lost'});
  // Pause freezes the combat picture; it must not erase the pressure front or hero beam.
  this.clashVisuals.update(s.clash,renderDt,combatPicture);this.revival.update(s.reviveCinematicTime??0,s.x,combatPicture);this.absorption.update(renderDt);this.supportLinks.update(renderDt);
  this.powerVisuals?.update(s.friendlyBeams??[],renderDt,combatPicture&&s.phase!=='destroying'&&!this.commanderExploded);
  this.abilities.update(s,{depthScale:1,armyRadius:Math.max(1.5,outer+.8),armyCenterZ:1.5,armyCenterX:centerX,visible:!intro&&s.phase!=='won'&&s.phase!=='lost'},renderDt);
  if(active&&!combatHeld&&(s.phase==='run'||s.phase==='boss')&&this.age-this.lastMuzzle>.14&&s.shots.some(p=>p.z<2.8)){
   for(const p of this.formationPositions.filter(p=>s.shots.some(shot=>shot.owner==='troop'&&Math.abs(shot.x-p.x)<.15&&shot.z+p.z>=0&&shot.z+p.z<1.2)).slice(0,8))this.fx.muzzle(p.x,.9,p.z-.3,false);
   this.lastMuzzle=this.age;if(s.shots.some(p=>p.owner!=='troop'&&p.z<2.8)){this.recoil=1;this.fx.muzzle(s.x,s.weaponPower==='guided'?2.08:s.weaponPower==='railburst'?1.8:s.weaponPower==='cannons'?1.42:1.35,-.85,false);}
  }
  const impact=this.abilities.sceneImpact;this.renderer.toneMappingExposure=1.06+impact.exposureLift;const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;this.armyZoom+=(T.MathUtils.clamp((s.army-8)/40,0,1)-this.armyZoom)*(1-Math.exp(-renderDt*1.2));const powerFov=(30+this.armyZoom*5)*(1-impact.zoom-(reduced?0:this.revival.cameraStrength));if(Math.abs(this.camera.fov-powerFov)>.0001){this.camera.fov=powerFov;this.camera.updateProjectionMatrix();}
  this.fx.update(renderDt);
  for(let i=this.floating.length-1;i>=0;i--){const f=this.floating[i];f.life-=renderDt;f.y+=renderDt*1.6;f.badge.sprite.position.set(f.x,f.y,f.z);f.badge.sprite.material.opacity=Math.min(1,f.life*3);if(f.life<=0){this.scene.remove(f.badge.sprite);f.badge.dispose();this.floating.splice(i,1);}}
  if(draw)this.quality.render();
 }
}
