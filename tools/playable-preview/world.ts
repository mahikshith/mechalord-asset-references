import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import type {Snapshot,Target,Effect} from './contract';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {CombatVisuals,CombatMissiles,ArmyAbilityVisuals,combatImpactPoint} from './combat-visuals';
import {ReforgedEnvironment} from './reforged-environment';
import {ReforgedRig,ReforgedCrowd,compactReforgedAsset,compactRigidParts} from './reforged-rigs';
import {createPickup,updatePickup,disposePickup} from './arsenal-visuals';
import {powers,powerKind} from './power-catalog';
const mat=(color:number)=>new T.MeshStandardMaterial({color,roughness:.82,metalness:.06});
function box(p:T.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material){const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,1,Math.min(.06,w*.15,h*.15,d*.15)),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
function cyl(p:T.Object3D,r:number,rb:number,h:number,x:number,y:number,z:number,m:T.Material,n=12){const o=new T.Mesh(new T.CylinderGeometry(r,rb,h,n),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
class Badge{
 canvas=document.createElement('canvas');ctx:CanvasRenderingContext2D;texture:T.CanvasTexture;sprite:T.Sprite;last='';
 constructor(width=1.9,public plain=false){this.canvas.width=384;this.canvas.height=160;this.ctx=this.canvas.getContext('2d')!;this.texture=new T.CanvasTexture(this.canvas);this.texture.colorSpace=T.SRGBColorSpace;this.sprite=new T.Sprite(new T.SpriteMaterial({map:this.texture,transparent:true,depthTest:false,depthWrite:false}));this.sprite.scale.set(width,width*160/384,1);this.sprite.renderOrder=12;}
 set(text:string,color:string,sub=''){const key=text+color+sub;if(key===this.last)return;this.last=key;const c=this.ctx;c.clearRect(0,0,384,160);if(!this.plain){c.fillStyle='#152c36ef';c.beginPath();c.roundRect(4,4,376,152,25);c.fill();c.strokeStyle=color;c.lineWidth=7;c.stroke();}c.textAlign='center';c.fillStyle=this.plain?color:'white';c.font=`900 ${sub?81:100}px Segoe UI`;if(this.plain){c.strokeStyle='#30261f';c.lineWidth=10;c.strokeText(text,192,sub?100:117,355);}c.fillText(text,192,sub?100:117,355);if(sub){c.fillStyle=color;c.font='800 25px Segoe UI';c.fillText(sub,192,138,355);}this.texture.needsUpdate=true;}
 dispose(){this.texture.dispose();this.sprite.material.dispose();}
}
 type View={group:T.Group;badge:Badge;bar:T.Mesh;kind:string;rotor?:T.Object3D};
export class Battlefield{
 renderer:T.WebGLRenderer;scene=new T.Scene();camera=new T.PerspectiveCamera(42,.56,.1,180);
 environment:ReforgedEnvironment;fx:CombatVisuals;missiles:CombatMissiles;allyCrowd?:ReforgedCrowd;enemyCrowd?:ReforgedCrowd;commanderRig?:ReforgedRig;bossRig?:ReforgedRig;eliteRigs:ReforgedRig[]=[];abilities:ArmyAbilityVisuals;
 formationPositions:{index:number,x:number,z:number}[]=[];commanderExploded=false;hitNumbers=new Map<number,{at:number,value:number}>();bossExploded=false;recoil=0;lastMuzzle=0;previousX=0;bossPreviousX=0;
 hero=new T.Group();model?:T.Object3D;running=false;
 views=new Map<number,View>();dummy=new T.Object3D();
 gateTemplate?:T.Object3D;eliteTemplate?:T.Object3D;elitePool:T.Object3D[]=[];bossModel?:T.Object3D;
 bossCoreHeight=4.31;bossCoreOffset=.85;commanderLaunchHeight=1.35;troopLaunchHeight=.9;enemyBodyHeight=.78;eliteBodyHeight=1.65;pickups=new Map<number,{group:T.Group,badge:Badge}>();boss=new T.Group();
 presentation?:Snapshot;bossHitKick=0;bossFireKick=0;commanderHitKick=0;
 heroRing:T.Mesh;shadowInstances:T.InstancedMesh;
 floating:{badge:Badge,life:number,x:number,y:number,z:number}[]=[];age=0;hostileAge=0;shake=0;cameraBossBlend=0;resizeObserver:ResizeObserver;
 constructor(public canvas:HTMLCanvasElement){
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  this.renderer.setClearColor(0xadc5c7);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.06;
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
  // A small, generated reflection map gives the new curved armor real highlights.
  // It is generated once per renderer, never per retry or combat frame.
  const studio=new RoomEnvironment(),reflection=new T.PMREMGenerator(this.renderer);
  this.scene.environment=reflection.fromScene(studio,.025).texture;this.scene.environmentIntensity=.28;
  studio.dispose();reflection.dispose();
  this.scene.fog=new T.Fog(0xadc5c7,65,120);this.scene.add(new T.HemisphereLight(0xecf9ff,0x806444,2.0));
  const sun=new T.DirectionalLight(0xffedcb,3.2);sun.position.set(-14,30,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-20,right:20,top:35,bottom:-20,near:1,far:80});sun.shadow.normalBias=.06;sun.shadow.bias=-.0003;this.scene.add(sun);this.scene.add(new T.AmbientLight(0xffffff,.3));
  this.environment=new ReforgedEnvironment(this.scene);this.fx=new CombatVisuals(this.scene);this.missiles=new CombatMissiles(this.scene);this.abilities=new ArmyAbilityVisuals(this.scene);this.scene.add(this.hero);
  this.heroRing=new T.Mesh(new T.RingGeometry(.75,.83,48),new T.MeshBasicMaterial({color:0x52e8ff,transparent:true,opacity:.8,side:T.DoubleSide}));this.heroRing.rotation.x=-Math.PI/2;this.heroRing.position.y=.035;this.hero.add(this.heroRing);
  this.shadowInstances=new T.InstancedMesh(new T.CircleGeometry(.36,12).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0x21332d,transparent:true,opacity:.22,depthWrite:false}),220);this.shadowInstances.frustumCulled=false;this.scene.add(this.shadowInstances);
  this.scene.add(this.boss);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.resize();
 }
 cameraLookZ=-9.3;
 resize(){
  const w=Math.max(1,this.canvas.clientWidth),h=Math.max(1,this.canvas.clientHeight);this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
  // Keep all six rows clear of the health/transfer controls. Use the maximum
  // formation footprint so recruitment and casualties cannot make the camera bob.
  const distance=(5.05/Math.min(.45,this.camera.aspect))/Math.tan(T.MathUtils.degToRad(this.camera.fov*.5));
  const rear=new T.Vector3(0,0,3.39),bottom=h-128;
  const rearY=(look:number)=>{this.camera.position.set(0,distance*.58,look+distance*.815);this.camera.lookAt(0,.1,look);this.camera.updateMatrixWorld(true);return(1-rear.clone().project(this.camera).y)*h*.5;};
  let low=-9.3,high=0;
  if(rearY(low)>bottom){for(let i=0;i<18;i++){const mid=(low+high)*.5;if(rearY(mid)>bottom)low=mid;else high=mid;}this.cameraLookZ=high;}else this.cameraLookZ=low;
 }
 async load(){
  const loader=new GLTFLoader();const [marshal,gearling,crawler,warden,colossus,gate]=await Promise.all(['RelicMarshal','GearlingSentinel','RustCrawler','ArcWarden','ForgeColossus','RelicGate'].map(name=>loader.loadAsync('assets/'+name+'.glb')));
  this.model=compactReforgedAsset(marshal.scene,'RelicMarshal');this.model.rotation.y=Math.PI;this.hero.add(this.model);this.commanderRig=new ReforgedRig(this.model,'RelicMarshal');
  this.allyCrowd=new ReforgedCrowd(this.scene,gearling.scene,'GearlingSentinel',24);this.enemyCrowd=new ReforgedCrowd(this.scene,crawler.scene,'RustCrawler',200);
  // These fit the unchanged authoritative combat footprints, including shields/barrels.
  this.troopLaunchHeight=1.38*this.allyCrowd.scale.y;this.enemyBodyHeight=.62*this.enemyCrowd.stats().scaledBounds[1];
  this.eliteTemplate=compactReforgedAsset(warden.scene,'ArcWarden');const bounds=new T.Box3().setFromObject(this.eliteTemplate).getSize(new T.Vector3());this.eliteTemplate.scale.set(2.04/bounds.x,2.65/bounds.y,1.64/bounds.z);this.eliteBodyHeight=1.72;
  for(let i=0;i<16;i++){const e=this.eliteTemplate.clone(true);e.visible=false;this.elitePool.push(e);this.scene.add(e);this.eliteRigs.push(new ReforgedRig(e,'ArcWarden'));}
  this.boss.clear();this.bossModel=compactReforgedAsset(colossus.scene,'ForgeColossus');this.boss.add(this.bossModel);this.bossRig=new ReforgedRig(this.bossModel,'ForgeColossus');
  this.gateTemplate=compactRigidParts(gate.scene,['arch']);this.gateTemplate.scale.set(.405,2.24/4.95,.32);
  await this.environment.load();
 }
 reset(){this.presentation=undefined;this.bossHitKick=0;this.bossFireKick=0;this.commanderHitKick=0;this.hostileAge=0;this.commanderExploded=false;this.hero.visible=true;this.formationPositions=[];this.hitNumbers.clear();this.commanderRig?.reset();this.bossRig?.reset();this.eliteRigs.forEach(r=>r.reset());this.allyCrowd?.reset();this.enemyCrowd?.reset();for(const p of this.pickups.values()){this.scene.remove(p.group);p.group.remove(p.badge.sprite);p.badge.dispose();disposePickup(p.group);}this.pickups.clear();for(const v of this.views.values())this.disposeView(v);this.views.clear();for(const f of this.floating){this.scene.remove(f.badge.sprite);f.badge.dispose();}this.floating=[];this.fx.reset();this.missiles.reset();this.abilities.reset();this.bossExploded=false;this.recoil=0;this.previousX=0;this.bossPreviousX=0;this.lastMuzzle=0;this.shake=0;this.cameraBossBlend=0;}
 set(mesh:T.InstancedMesh,i:number,x:number,y:number,z:number,scale=1,rot=0,width=1){this.dummy.position.set(x,y,z);this.dummy.rotation.set(0,rot,0);this.dummy.scale.set(scale*width,scale,scale);this.dummy.updateMatrix();mesh.setMatrixAt(i,this.dummy.matrix);}
 createView(t:Target):View{
  const group=new T.Group(),badge=new Badge(t.kind==='gate'?2.8:t.kind==='crate'?2.0:1.45),red=mat(0xe94f38),gold=mat(0xfbb94e),dark=mat(0x233942),white=mat(0xffefd0);let rotor:T.Object3D|undefined;
  if(t.kind==='gate'){
   const positive=t.value>=0,blue=mat(positive?0x1dabc2:0xe94f38);if(this.gateTemplate){const frame=this.gateTemplate.clone(true);frame.traverse(o=>{const mesh=o as T.Mesh;if(mesh.isMesh){mesh.geometry=mesh.geometry.clone();mesh.material=Array.isArray(mesh.material)?mesh.material.map(m=>m.clone()):mesh.material.clone();}});group.add(frame);}else for(const side of [-1,1]){box(group,.18,2.1,.18,side*1.55,1.05,0,dark);cyl(group,.16,.24,.28,side*1.55,.14,0,gold,8);box(group,.08,1.95,.05,side*1.55,1.1,.12,blue);}
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
  const z=-e.z;
  if(e.kind==='hit'){const bossHit=e.variant===3||e.variant===4,point=combatImpactPoint(e,{depthScale:1,bossPhase:bossHit,bossY:this.bossRig?this.boss.position.y:(current?.bossY??this.boss.position.y),bossImpactHeight:this.bossCoreHeight??4.31,bossSurfaceOffset:this.bossCoreOffset??.85,anchors:{enemyHeight:this.enemyBodyHeight,eliteHeight:this.eliteBodyHeight},overdrive:false,weapon:1,targets:[...(current?.targets??[]),...(this.presentation?.targets??[])]});this.fx.impact(point.x,point.y,point.z,.5);if(bossHit)this.bossHitKick=Math.max(this.bossHitKick,.24);if(e.value>0&&e.variant>0&&!bossHit){const n=this.hitNumbers.get(e.entityId)??{at:-1,value:0};n.value+=e.value;if(this.age-n.at>.22){this.float('-'+Math.ceil(n.value),e.x,z,'#ffe0a0',3.4,true);n.at=this.age;n.value=0;}this.hitNumbers.set(e.entityId,n);}}
  if(e.kind==='drop')this.fx.impact(e.x,1.2,z,1.2);
  if(e.kind==='pickup')this.fx.powerAcquire(this.hero,powerKind(e.value));
  if(e.kind==='coreExpose'){this.fx.impact(e.x,this.boss.position.y+this.bossCoreHeight,z+this.bossCoreOffset,1.6);this.shake=.17;}
  if(e.kind==='bossRevive'){this.fx.impact(e.x,this.boss.position.y+2.7,z,2);this.shake=.24;}
  if(e.kind==='bossPartBreak'){const part=['cannonL','cannonR','boosterL','boosterR','legL','legR'][e.value-1] as 'cannonL'|'cannonR'|'boosterL'|'boosterR'|'legL'|'legR'|undefined;if(part){this.scene.updateMatrixWorld(true);this.fx.bossPartBreak(this.boss,part);this.shake=.24;}}
  if(e.kind==='bossPhase'){this.shake=.20;this.fx.impact(e.x,2.8,z,2);}
  if(e.kind==='kill'){this.hitNumbers.delete(e.entityId);if(e.variant<0)this.fx.impact(e.x,1,z,2);else this.fx.enemyDeath(e.x,z,e.variant,e.variant>0?1.6:1);this.shake=Math.max(this.shake,.07);}
  if(e.kind==='contact'){this.fx.impact(e.x,.6,z,1.2);this.shake=Math.max(this.shake,.045);}
  if(e.kind==='block')this.fx.impact(e.x,1,z,.5);
  if(e.kind==='gate'||e.kind==='recruit'){this.fx.impact(e.x,.6,z,.8);if(e.value!==0)this.float(e.value>0?'+'+e.value:String(e.value),e.x,z,'#73eaff');}
  if(e.kind==='troopDeath')this.fx.allyLoss(e.x,z,1);
  if(e.kind==='damage'){this.shake=.12;this.float('-'+Math.abs(e.value),e.x,z,'#ff8469',2,true);}
  if(e.kind==='bossShot'){this.bossFireKick=.3;this.fx.muzzle(e.x,this.boss.position.y+(e.value===3?this.bossCoreHeight:e.value===0?5.32:2.91),z,true);this.shake=.07;}
  if(e.kind==='commanderHit'){this.commanderHitKick=.35;this.fx.impact(e.x,1.3,z,1.2);this.shake=.2;this.float('-'+Math.abs(e.value)+' HP',e.x,z,'#ff8469',3.1,true);}
  if(e.kind==='hazardBreak'){this.fx.enemyDeath(e.x,z,1,Math.max(1.2,e.size));this.shake=.22;}
  if(e.kind==='commanderDeath'&&!this.commanderExploded){this.scene.updateMatrixWorld(true);this.fx.commanderDeath(this.hero);this.commanderExploded=true;this.hero.visible=false;this.shake=.4;}
  if(e.kind==='retreat')this.hitNumbers.delete(e.entityId);
  if(e.kind==='bossDeath'&&!this.bossExploded){this.scene.updateMatrixWorld(true);this.fx.bossDeath(this.boss);this.bossExploded=true;this.shake=.45;this.float('CORE DESTROYED',e.x,z,'#ffc86b');}
 }
 sacrifice(positions:{x:number,z:number}[]){this.fx.sacrifice(this.hero,positions);}
 float(text:string,x:number,z:number,color:string,height=2,plain=false){if(this.floating.length>=16){const f=this.floating.shift()!;this.scene.remove(f.badge.sprite);f.badge.dispose();}const badge=new Badge(text.length>8?3:1.5,plain);badge.set(text,color);this.scene.add(badge.sprite);this.floating.push({badge,life:1.0,x,y:height,z});}
 update(s:Snapshot,dt:number,mode:'intro'|'play'|'paused'|'result',draw=true){
  if(mode==='paused'){if(draw)this.renderer.render(this.scene,this.camera);return;}
  const active=mode==='play',intro=mode==='intro',downed=s.phase==='lastStand',renderDt=mode==='paused'?0:dt;
  this.presentation=s;this.bossHitKick=Math.max(0,this.bossHitKick-renderDt);this.bossFireKick=Math.max(0,this.bossFireKick-renderDt);this.commanderHitKick=Math.max(0,this.commanderHitKick-renderDt);
  this.age+=renderDt;const hostileRate=s.timePower==='freeze'?0:s.timePower==='slow'?.5:s.timePower==='haste'?1.35:1;this.hostileAge+=renderDt*hostileRate;const bossPhase=s.phase==='boss'||s.phase==='destroying'||(this.bossExploded&&s.phase==='won')||((s.phase==='lost'||downed)&&s.bossHp>0&&s.travelDistance>=s.travelGoal);
  const marching=active&&s.phase==='run';
  this.running=marching;this.environment.update(intro?0:s.travelDistance,s.level,renderDt);
  // Constant close portrait framing: commander below centre, long visible approach.
   const halfWidth=5.05,distance=(halfWidth/Math.min(.45,this.camera.aspect))/Math.tan(T.MathUtils.degToRad(this.camera.fov*.5)),lookZ=this.cameraLookZ;
  // A modest lateral track keeps the outer soldiers in frame during edge dodges,
  // while the far gate pair stays visible and the portrait zoom stays constant.
  const cameraX=intro?0:s.x*.4;
  this.camera.position.set(cameraX,distance*.58,lookZ+distance*.815);this.camera.lookAt(cameraX,.1,lookZ);
  if(this.shake>0&&active){this.camera.position.x+=(Math.random()-.5)*this.shake;this.camera.position.y+=(Math.random()-.5)*this.shake;this.shake=Math.max(0,this.shake-renderDt*.65);}
  const horizontalVelocity=renderDt>0?(s.x-this.previousX)/renderDt:0;this.previousX=s.x;
  this.hero.position.set(intro?0:s.x,downed?-.24:marching?Math.abs(Math.sin(this.age*11))*.055:0,intro?-11.8:0);
  this.recoil=Math.max(0,this.recoil-renderDt*5);
  if(this.model){this.model.scale.setScalar(intro?1.55:1.0);this.model.rotation.set(downed?.75:-this.recoil*.075+this.commanderHitKick*.22,intro?.12:Math.PI+T.MathUtils.clamp(horizontalVelocity*.025,-.12,.12),-T.MathUtils.clamp(horizontalVelocity*.025,-.10,.10)+Math.sin(this.age*38)*this.commanderHitKick*.08);}
  this.commanderRig?.update(s,renderDt,'commander',marching,this.commanderHitKick,this.recoil);this.heroRing.visible=!intro;
  if(this.commanderRig){this.scene.updateMatrixWorld(true);this.commanderLaunchHeight=this.commanderRig.muzzleWorld().y;}
  this.hero.visible=!this.commanderExploded;this.formationPositions=[];
  let shadowCount=0,eliteCount=0;
  const formation=intro||this.commanderExploded?[]:s.formation;
  const centerX=formation.length?formation.reduce((sum,p)=>sum+p.x,0)/formation.length:s.x;
  const outer=formation.length?Math.max(...formation.map(p=>Math.abs(p.x-centerX))):0;
  this.allyCrowd?.begin();for(const p of formation){const x=p.x,z=-p.z;this.formationPositions.push({index:p.index,x,z});this.allyCrowd?.add(x,z,this.age+(p.index*.13),Math.PI,false,s.shots.some(shot=>shot.owner==='troop'&&Math.abs(shot.x-x)<.15&&shot.z+p.z<1.2));this.set(this.shadowInstances,shadowCount++,x,.035,z,.95);}this.allyCrowd?.end();
  this.set(this.shadowInstances,shadowCount++,this.hero.position.x,.033,this.hero.position.z,2);
  this.enemyCrowd?.begin();const live=new Set<number>();
  for(const t of s.targets){if(t.z>90||t.z< -8||intro)continue;
   if(t.kind==='enemy'&&t.variant===0){this.enemyCrowd?.add(t.x,-t.z,this.hostileAge+t.id,t.op===2?(t.x>=0?Math.PI/2:-Math.PI/2):0,t.hit>0);if(shadowCount<218)this.set(this.shadowInstances,shadowCount++,t.x,.034,-t.z,1.2);continue;}
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
    v.badge.set(String(Math.ceil(t.hp)),'#ff8064',t.variant===2?'GUNNER':'REAVER');v.bar.scale.x=Math.max(.02,t.hp/t.maxHp);v.badge.sprite.position.y=3.05;
    if(eliteCount<this.elitePool.length){const index=eliteCount++,e=this.elitePool[index];e.visible=true;e.position.set(t.x,.02,-t.z);e.rotation.set(0,t.op===2?(t.x>=0?Math.PI/2:-Math.PI/2):0,0);this.eliteRigs[index].update(s,renderDt*hostileRate,'elite',t.op!==2,t.hit,t.variant===2&&Math.sin(this.hostileAge*5+t.id)>.9?.8:0);}

   }
  }
  const livePickups=new Set<number>();for(const p of s.pickups){livePickups.add(p.id);let view=this.pickups.get(p.id);if(!view){const group=createPickup(p.kind),badge=new Badge(1.7),info=powers[p.kind];badge.set(info.short,info.color);badge.sprite.position.y=2.15;group.add(badge.sprite);view={group,badge};this.pickups.set(p.id,view);this.scene.add(group);}view.group.visible=!intro;view.group.position.set(p.x,0,-p.z);view.badge.sprite.visible=p.z<19&&p.z>-2;updatePickup(view.group,this.age);}
  for(const [id,v] of this.pickups)if(!livePickups.has(id)){this.scene.remove(v.group);v.group.remove(v.badge.sprite);v.badge.dispose();disposePickup(v.group);this.pickups.delete(id);}
  this.enemyCrowd?.end();for(const [id,v] of this.views)if(!live.has(id)){this.disposeView(v);this.views.delete(id);}
  for(let i=eliteCount;i<this.elitePool.length;i++)this.elitePool[i].visible=false;
  this.bossRig?.syncParts(s.bossPartsMask);const legless=(s.bossPartsMask&48)===48;
  const bossDisplayY=legless&&this.bossRig?this.bossRig.groundedY(1,s.bossPartsMask):s.bossY;
  this.boss.visible=(bossPhase||intro)&&!this.bossExploded;this.boss.position.set(intro?0:s.bossX,intro?0:bossDisplayY,intro?-31:-s.bossZ);this.boss.scale.setScalar(1);
  const bossVelocity=renderDt>0?(s.bossX-this.bossPreviousX)/renderDt:0;this.bossPreviousX=s.bossX;
  this.boss.rotation.x=-this.bossHitKick*.06+this.bossFireKick*.025;this.boss.rotation.z=legless?0:T.MathUtils.clamp(-bossVelocity*.015,-.045,.045);this.boss.rotation.y=bossPhase?T.MathUtils.clamp(Math.atan2(((s.bossAction==='windup'||s.bossAction==='fire')?s.bossLane:s.x)-s.bossX,Math.max(6,s.bossZ)),-.32,.32):0;
  this.bossRig?.update(s,renderDt*hostileRate,'boss',false,this.bossHitKick,this.bossFireKick);
  if(this.bossRig){this.scene.updateMatrixWorld(true);const core=this.bossRig.reactorWorld();this.bossCoreHeight=core.y-this.boss.position.y;this.bossCoreOffset=core.z-this.boss.position.z;}
  if(this.boss.visible)this.set(this.shadowInstances,shadowCount++,this.boss.position.x,.032,this.boss.position.z,5.5);
  this.shadowInstances.count=shadowCount;this.shadowInstances.instanceMatrix.needsUpdate=true;
  this.missiles.update(s.shots,s.enemyShots,{depthScale:1,bossPhase,bossZ:s.bossZ,bossX:s.bossX,bossY:this.boss.position.y,bossImpactHeight:this.bossCoreHeight,bossSurfaceOffset:this.bossCoreOffset,bossLaunchHeight:s.bossPattern==='laser'?this.bossCoreHeight:s.bossPattern==='heavy'?5.32:2.91,anchors:{troopHeight:this.troopLaunchHeight,commanderHeight:this.commanderLaunchHeight,commanderOriginZ:this.commanderRig?-this.commanderRig.muzzleWorld().z:.4,enemyHeight:this.enemyBodyHeight,eliteHeight:this.eliteBodyHeight},targets:s.targets,formation:s.formation,dt:renderDt,simulationTime:s.time,lasers:s.lasers,overdrive:s.ability>0&&s.relic===2,weapon:s.weapon,visible:!intro&&s.phase!=='won'&&s.phase!=='lost'});
  this.abilities.update(s,{depthScale:1,armyRadius:Math.max(1.5,outer+.8),armyCenterZ:1.5,armyCenterX:centerX,visible:!intro&&s.phase!=='won'&&s.phase!=='lost'},renderDt);
  if(active&&s.phase!=='destroying'&&this.age-this.lastMuzzle>.14&&s.shots.some(p=>p.z<2.8)){
   for(const p of this.formationPositions.filter(p=>s.shots.some(shot=>shot.owner==='troop'&&Math.abs(shot.x-p.x)<.15&&shot.z+p.z>=0&&shot.z+p.z<1.2)).slice(0,8))this.fx.muzzle(p.x,this.troopLaunchHeight,p.z-.28,false);
   this.lastMuzzle=this.age;this.recoil=1;this.fx.muzzle(this.commanderRig?.muzzleWorld().x??s.x,this.commanderLaunchHeight,this.commanderRig?.muzzleWorld().z??-.7,false);
  }
  this.fx.update(renderDt);
  for(let i=this.floating.length-1;i>=0;i--){const f=this.floating[i];f.life-=renderDt;f.y+=renderDt*1.6;f.badge.sprite.position.set(f.x,f.y,f.z);f.badge.sprite.material.opacity=Math.min(1,f.life*3);if(f.life<=0){this.scene.remove(f.badge.sprite);f.badge.dispose();this.floating.splice(i,1);}}
  if(draw)this.renderer.render(this.scene,this.camera);
 }
}
