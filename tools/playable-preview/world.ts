import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import type {Snapshot,Target,Effect} from './contract';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {CombatVisuals,CombatMissiles,RobotFormation,ArmyAbilityVisuals} from './combat-visuals';
import {BattleEnvironment} from './environment';
const mat=(color:number)=>new T.MeshStandardMaterial({color,roughness:.82,metalness:.06});
function box(p:T.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material){const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,1,Math.min(.06,w*.15,h*.15,d*.15)),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
function cyl(p:T.Object3D,r:number,rb:number,h:number,x:number,y:number,z:number,m:T.Material,n=12){const o=new T.Mesh(new T.CylinderGeometry(r,rb,h,n),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
class Badge{
 canvas=document.createElement('canvas');ctx:CanvasRenderingContext2D;texture:T.CanvasTexture;sprite:T.Sprite;last='';
 constructor(width=1.9){this.canvas.width=384;this.canvas.height=160;this.ctx=this.canvas.getContext('2d')!;this.texture=new T.CanvasTexture(this.canvas);this.texture.colorSpace=T.SRGBColorSpace;this.sprite=new T.Sprite(new T.SpriteMaterial({map:this.texture,transparent:true,depthTest:false,depthWrite:false}));this.sprite.scale.set(width,width*160/384,1);this.sprite.renderOrder=12;}
 set(text:string,color:string,sub=''){const key=text+color+sub;if(key===this.last)return;this.last=key;const c=this.ctx;c.clearRect(0,0,384,160);c.fillStyle='#152c36ef';c.beginPath();c.roundRect(4,4,376,152,25);c.fill();c.strokeStyle=color;c.lineWidth=7;c.stroke();c.textAlign='center';c.fillStyle='white';c.font=`900 ${sub?81:100}px Segoe UI`;c.fillText(text,192,sub?100:117,355);if(sub){c.fillStyle=color;c.font='800 25px Segoe UI';c.fillText(sub,192,138,355);}this.texture.needsUpdate=true;}
 dispose(){this.texture.dispose();this.sprite.material.dispose();}
}
 type View={group:T.Group;badge:Badge;bar:T.Mesh;kind:string;rotor?:T.Object3D};
export class Battlefield{
 renderer:T.WebGLRenderer;scene=new T.Scene();camera=new T.PerspectiveCamera(30,.56,.1,180);
 environment:BattleEnvironment;fx:CombatVisuals;missiles:CombatMissiles;robots:RobotFormation;abilities:ArmyAbilityVisuals;
 heroArms:T.Object3D[]=[];bossMuzzles:T.Mesh[]=[];bossExploded=false;recoil=0;lastMuzzle=0;previousX=0;bossPreviousX=0;
 hero=new T.Group();model?:T.Object3D;mixer?:T.AnimationMixer;run?:T.AnimationAction;idle?:T.AnimationAction;running=false;
 allies?:T.InstancedMesh;views=new Map<number,View>();dummy=new T.Object3D();
 eliteTemplate?:T.Object3D;elitePool:T.Object3D[]=[];bossModel?:T.Object3D;bossJoints:T.Object3D[]=[];
 weaponRigs:T.Group[]=[];boss=new T.Group();
 heroRing:T.Mesh;shadowInstances:T.InstancedMesh;
 floating:{badge:Badge,life:number,x:number,y:number,z:number}[]=[];age=0;shake=0;cameraBossBlend=0;resizeObserver:ResizeObserver;
 constructor(public canvas:HTMLCanvasElement){
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  this.renderer.setClearColor(0xadc5c7);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.06;
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
  this.scene.fog=new T.Fog(0xadc5c7,65,120);this.scene.add(new T.HemisphereLight(0xecf9ff,0x806444,2.0));
  const sun=new T.DirectionalLight(0xffedcb,3.2);sun.position.set(-14,30,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-20,right:20,top:35,bottom:-20,near:1,far:80});sun.shadow.normalBias=.06;sun.shadow.bias=-.0003;this.scene.add(sun);this.scene.add(new T.AmbientLight(0xffffff,.3));
  this.environment=new BattleEnvironment(this.scene);this.fx=new CombatVisuals(this.scene);this.missiles=new CombatMissiles(this.scene);this.robots=new RobotFormation(this.scene,200);this.abilities=new ArmyAbilityVisuals(this.scene);this.scene.add(this.hero);
  for(const side of [-1,1]){const rig=new T.Group();rig.position.set(side*.9,1.15,-.1);box(rig,.28,.32,.55,0,0,0,mat(0x304f5d));cyl(rig,.095,.13,.7,0,.04,-.48,mat(0xc49949),8).rotation.x=Math.PI/2;const ring=cyl(rig,.12,.12,.09,0,.04,-.79,new T.MeshBasicMaterial({color:0x67e6ff}),8);ring.rotation.x=Math.PI/2;this.hero.add(rig);this.weaponRigs.push(rig);}
  const siegeRig=new T.Group();siegeRig.position.set(0,2.0,.15);box(siegeRig,.65,.42,.75,0,0,0,mat(0x304f5d));for(const side of [-1,1]){const barrel=cyl(siegeRig,.14,.18,1.05,side*.23,0,-.72,mat(0xc49949),10);barrel.rotation.x=Math.PI/2;const muzzle=cyl(siegeRig,.12,.12,.08,side*.23,0,-1.24,new T.MeshBasicMaterial({color:0xffb83f}),10);muzzle.rotation.x=Math.PI/2;}this.hero.add(siegeRig);this.weaponRigs.push(siegeRig);
  this.heroRing=new T.Mesh(new T.RingGeometry(.75,.83,48),new T.MeshBasicMaterial({color:0x52e8ff,transparent:true,opacity:.8,side:T.DoubleSide}));this.heroRing.rotation.x=-Math.PI/2;this.heroRing.position.y=.035;this.hero.add(this.heroRing);
  this.shadowInstances=new T.InstancedMesh(new T.CircleGeometry(.36,12).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0x21332d,transparent:true,opacity:.22,depthWrite:false}),220);this.shadowInstances.frustumCulled=false;this.scene.add(this.shadowInstances);
  this.scene.add(this.boss);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.resize();
 }
 resize(){const w=Math.max(1,this.canvas.clientWidth),h=Math.max(1,this.canvas.clientHeight);this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 async load(){
  const loader=new GLTFLoader();const [hero,troop,elite,tyrant]=await Promise.all([loader.loadAsync('commander.glb'),loader.loadAsync('troop.glb'),loader.loadAsync('cinder-reaver.glb'),loader.loadAsync('forge-tyrant.glb')]);this.model=hero.scene;this.model.scale.setScalar(.95);this.model.rotation.y=Math.PI;this.hero.add(this.model);this.model.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.material.roughness=.76;o.material.metalness=.12;}if(o.isBone&&o.name.startsWith('upperarm'))this.heroArms.push(o);});
  const styled=new Set<T.Material>();for(const asset of [elite,tyrant])asset.scene.traverse((o:any)=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(!styled.has(m)){styled.add(m);m.color.multiplyScalar(2.2);m.metalness=.20;m.roughness=.64;}});
  this.eliteTemplate=elite.scene;this.eliteTemplate.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  for(let i=0;i<16;i++){const e=this.eliteTemplate.clone(true);e.visible=false;this.elitePool.push(e);this.scene.add(e);}
  this.boss.clear();this.bossModel=tyrant.scene;this.bossModel.rotation.y=Math.PI;this.boss.add(this.bossModel);this.bossModel.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}if(/^(Arm_[LR]|Barrel_[LR]|Pod_[LR]|Leg_[LR]|Knee_[LR]|Head)$/.test(o.name)){o.userData.restQuaternion=o.quaternion.clone();this.bossJoints.push(o);}if(/^Barrel_[LR]$/.test(o.name)){const glow=new T.Mesh(new T.SphereGeometry(.16,10,6),new T.MeshBasicMaterial({color:0xffaa35,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}));glow.position.set(0,0,-.48);o.add(glow);this.bossMuzzles.push(glow);}});
  this.mixer=new T.AnimationMixer(hero.scene);for(const clip of hero.animations){if(clip.name==='Run')this.run=this.mixer.clipAction(clip);if(clip.name==='Idle')this.idle=this.mixer.clipAction(clip);}this.idle?.play();
  const parts=(gltf:any)=>{gltf.scene.updateMatrixWorld(true);let mesh:any;gltf.scene.traverse((o:any)=>{if(o.isMesh&&!mesh)mesh=o;});const geo=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld),m=mesh.material.clone();m.roughness=.85;m.metalness=.05;return [geo,m] as [T.BufferGeometry,T.MeshStandardMaterial];};
  const [ag,am]=parts(troop);this.allies=new T.InstancedMesh(ag,am,64);this.allies.castShadow=true;this.allies.frustumCulled=false;this.scene.add(this.allies);
 }
 reset(){for(const v of this.views.values())this.disposeView(v);this.views.clear();for(const f of this.floating){this.scene.remove(f.badge.sprite);f.badge.dispose();}this.floating=[];this.fx.reset();this.missiles.reset();this.robots.reset();this.abilities.reset();this.bossExploded=false;this.recoil=0;this.previousX=0;this.bossPreviousX=0;this.lastMuzzle=0;this.shake=0;this.cameraBossBlend=0;}
 set(mesh:T.InstancedMesh,i:number,x:number,y:number,z:number,scale=1,rot=0){this.dummy.position.set(x,y,z);this.dummy.rotation.set(0,rot,0);this.dummy.scale.setScalar(scale);this.dummy.updateMatrix();mesh.setMatrixAt(i,this.dummy.matrix);}
 createView(t:Target):View{
  const group=new T.Group(),badge=new Badge(t.kind==='gate'?2.8:t.kind==='crate'?2.0:1.45),red=mat(0xe94f38),gold=mat(0xfbb94e),dark=mat(0x233942),white=mat(0xffefd0);let rotor:T.Object3D|undefined;
  if(t.kind==='gate'){
   const positive=t.value>=0,blue=mat(positive?0x1dabc2:0xe94f38);for(const side of [-1,1]){box(group,.18,2.1,.18,side*1.55,1.05,0,dark);cyl(group,.16,.24,.28,side*1.55,.14,0,gold,8);box(group,.08,1.95,.05,side*1.55,1.1,.12,blue);}
   const panel=new T.Mesh(new T.PlaneGeometry(3,1.65),new T.MeshBasicMaterial({color:positive?0x25c5ec:0xf56542,transparent:true,opacity:.24,side:T.DoubleSide,depthWrite:false}));panel.position.y=1.1;group.add(panel);box(group,3.3,.12,.20,0,2.12,0,blue);badge.sprite.position.y=1.35;
   const floor=new T.Mesh(new T.PlaneGeometry(3,.32),new T.MeshBasicMaterial({color:positive?0x45dfff:0xff7556,transparent:true,opacity:.65,side:T.DoubleSide}));floor.rotation.x=-Math.PI/2;floor.position.y=.045;group.add(floor);group.userData.gateTint=[blue,panel.material,floor.material];
  }else if(t.kind==='crate'){
   box(group,1.65,1.3,1.4,0,.68,0,gold);for(const x of [-.55,.55])box(group,.12,1.2,1.25,x,.6,0,dark);for(const z of [-.52,.52])box(group,1.4,.1,.13,0,1.05,z,white);rotor=new T.Group();rotor.position.y=2.05;rotor.scale.setScalar(1.4);group.add(rotor);box(rotor,.70,.25,.35,0,0,0,dark);for(const x of [-.18,.18])cyl(rotor,.08,.08,.90,x,.06,-.44,dark,8).rotation.x=Math.PI/2;box(rotor,.18,.28,.22,.05,-.22,0,white);badge.sprite.position.set(0,3.0,0);
  }else if(t.kind==='hazard'){
   rotor=new T.Group();rotor.position.y=.70;group.add(rotor);const log=cyl(rotor,.56,.56,2.3,0,0,0,red,16);log.rotation.z=Math.PI/2;for(const x of [-1.12,1.12]){const cap=cyl(rotor,.63,.63,.17,x,0,0,white,16);cap.rotation.z=Math.PI/2;}for(let j=0;j<4;j++)for(let i=0;i<7;i++){const a=i/7*Math.PI*2,o=new T.Mesh(new T.ConeGeometry(.16,.37,4),white);o.position.set(-.86+j*.57,Math.cos(a)*.61,Math.sin(a)*.61);o.rotation.x=a;rotor.add(o);}badge.sprite.position.y=1.9;
  }else badge.sprite.position.y=1.65;
  const bar=box(group,t.kind==='gate'?2.4:1.2,.07,.05,0,t.kind==='crate'?1.31:.13,.6,new T.MeshBasicMaterial({color:t.kind==='crate'?0xffdd56:0xff5b49}));group.add(badge.sprite);this.scene.add(group);const v={group,badge,bar,kind:t.kind,rotor};this.views.set(t.id,v);return v;
 }
 disposeView(v:View){this.scene.remove(v.group);v.badge.dispose();const materials=new Set<T.Material>(),geometries=new Set<T.BufferGeometry>();v.group.traverse((o:any)=>{if(o.isMesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
 trigger(e:Effect){
  const z=-e.z;
  if(e.kind==='hit')this.fx.impact(e.x,.8,z,.5);
  if(e.kind==='kill'){if(e.variant<0)this.fx.impact(e.x,1,z,2);else this.fx.enemyDeath(e.x,z,e.variant,e.variant>0?1.6:1);this.shake=Math.max(this.shake,.07);}
  if(e.kind==='contact'){this.fx.impact(e.x,.6,z,1.2);this.shake=Math.max(this.shake,.045);}
  if(e.kind==='block')this.fx.impact(e.x,1,z,.5);
  if(e.kind==='gate'||e.kind==='recruit'){this.fx.impact(e.x,.6,z,.8);if(e.value!==0)this.float(e.value>0?'+'+e.value:String(e.value),e.x,z,'#73eaff');}
  if(e.kind==='damage'){this.fx.allyLoss(e.x,z,e.value);this.shake=.16;this.float('-'+Math.abs(e.value),e.x,z,'#ff8469');}
  if(e.kind==='bossShot'){this.fx.muzzle(e.x,e.z>10?2.9:1.3,z,true);this.shake=.07;}
  if(e.kind==='bossDeath'&&!this.bossExploded){this.scene.updateMatrixWorld(true);this.fx.bossDeath(this.boss);this.bossExploded=true;this.shake=.45;this.float('CORE DESTROYED',e.x,z,'#ffc86b');}
 }
 float(text:string,x:number,z:number,color:string){if(this.floating.length>=16){const f=this.floating.shift()!;this.scene.remove(f.badge.sprite);f.badge.dispose();}const badge=new Badge(text.length>8?3:1.5);badge.set(text,color);this.scene.add(badge.sprite);this.floating.push({badge,life:1.0,x,y:2,z});}
 update(s:Snapshot,dt:number,mode:'intro'|'play'|'paused'|'result'){
  if(mode==='paused'){this.renderer.render(this.scene,this.camera);return;}
  const active=mode==='play',intro=mode==='intro',renderDt=mode==='paused'?0:dt;
  this.age+=renderDt;const bossPhase=s.phase==='boss'||s.phase==='destroying'||(this.bossExploded&&s.phase==='won');
  const marching=active&&s.phase==='run'&&!s.engagement;
  if(marching!==this.running){this.run?.stop();this.idle?.stop();(marching?this.run:this.idle)?.reset().play();this.running=marching;}
  for(const arm of this.heroArms)arm.rotation.x+=arm.userData.lastRecoil??0;
  this.mixer?.update(renderDt*(marching?1.25:1));this.environment.update(intro?this.age*.55:s.travelDistance,s.level,renderDt);
  this.cameraBossBlend+=((bossPhase?1:0)-this.cameraBossBlend)*(1-Math.exp(-renderDt*2.8));
  // Narrow perspective lens: modelled side depth without distant opponents becoming dots.
  const halfWidth=5.7+.7*this.cameraBossBlend,distance=(halfWidth/this.camera.aspect)/Math.tan(T.MathUtils.degToRad(this.camera.fov*.5)),lookZ=-4.3-1.2*this.cameraBossBlend;
  this.camera.position.set(0,distance*.58,lookZ+distance*.815);this.camera.lookAt(0,.1,lookZ);
  if(this.shake>0&&active){this.camera.position.x+=(Math.random()-.5)*this.shake;this.camera.position.y+=(Math.random()-.5)*this.shake;this.shake=Math.max(0,this.shake-renderDt*.65);}
  const horizontalVelocity=renderDt>0?(s.x-this.previousX)/renderDt:0;this.previousX=s.x;
  this.hero.position.set(intro?0:s.x,marching?Math.abs(Math.sin(this.age*11))*.055:0,intro?-3.7:0);
  this.recoil=Math.max(0,this.recoil-renderDt*5);
  if(this.model){this.model.scale.setScalar(intro?1.65:1.38);this.model.rotation.set(-this.recoil*.035,intro?Math.PI*.87:Math.PI+T.MathUtils.clamp(horizontalVelocity*.025,-.12,.12),-T.MathUtils.clamp(horizontalVelocity*.025,-.10,.10));}
  for(const arm of this.heroArms){arm.userData.lastRecoil=this.recoil*.12;arm.rotation.x-=arm.userData.lastRecoil;}
  this.weaponRigs.forEach((r,i)=>{r.visible=!intro&&s.weapon>=i+2;r.position.z=(i===2?.15:-.1)+this.recoil*.10;});this.heroRing.visible=!intro;
  let allyCount=0,shadowCount=0,eliteCount=0;
  const visibleAllies=intro?0:Math.min(64,Math.max(0,s.army-1)),outer=.34*Math.sqrt(visibleAllies),centerX=T.MathUtils.clamp(s.x,-Math.max(.2,4.25-outer),Math.max(.2,4.25-outer));
  if(this.allies){for(let i=0;i<visibleAllies;i++){
    const radius=.34*Math.sqrt(i+.5),angle=i*2.39996323,x=centerX+Math.sin(angle)*radius,z=.45+outer+Math.cos(angle)*radius;
    this.set(this.allies,allyCount++,x,marching?Math.abs(Math.sin(this.age*11+i*1.3))*.075:Math.sin(this.age*23+i)*.012,z,.79,Math.PI+(marching?Math.sin(this.age*11+i)*.035:0));
    this.set(this.shadowInstances,shadowCount++,x,.035,z,1.15);
   }this.allies.count=allyCount;this.allies.instanceMatrix.needsUpdate=true;
  }
  this.set(this.shadowInstances,shadowCount++,this.hero.position.x,.033,this.hero.position.z,2);
  this.robots.begin();const live=new Set<number>();
  for(const t of s.targets){if(t.z>38||t.z< -5||intro)continue;
   if(t.kind==='enemy'&&t.variant===0){this.robots.add(t.x,-t.z,.93,0,t.hit>0);if(shadowCount<218)this.set(this.shadowInstances,shadowCount++,t.x,.034,-t.z,1.2);continue;}
   live.add(t.id);const v=this.views.get(t.id)??this.createView(t);v.group.visible=true;v.group.position.set(t.x,0,-t.z);v.group.scale.setScalar(t.hit>0?1.035:1);
   if(t.kind==='gate'){
    v.group.scale.x*=(t.size+.1)/1.55;v.badge.set(t.op===1?'×'+t.value:(t.value>=0?'+':'')+t.value,t.value>=0?'#54ddff':'#ff7755',t.op===1?'MULTIPLY':t.value<0?'SHOOT TO FLIP':'RECRUIT');v.bar.visible=false;
    for(const m of v.group.userData.gateTint??[])m.color.set(t.value>=0?0x1dabc2:0xe94f38);
   }else if(t.kind==='crate'){
    v.badge.set(String(Math.ceil(t.hp)),'#ffc851','UPGRADE');v.bar.scale.x=Math.max(.02,t.hp/t.maxHp);if(v.rotor){v.rotor.rotation.y=this.age*.85;v.rotor.position.y=2.05+Math.sin(this.age*3)*.12;}
   }else if(t.kind==='hazard'){
    v.badge.set('-'+Math.abs(t.value),'#ff795b');v.bar.visible=false;if(v.rotor){v.rotor.rotation.x=-s.travelDistance*1.6-this.age*.8;v.rotor.scale.x=t.size*2/2.3;}
   }else{
    v.badge.set(String(Math.ceil(t.hp)),'#ff8064',t.variant===2?'GUNNER':'REAVER');v.bar.scale.x=Math.max(.02,t.hp/t.maxHp);v.badge.sprite.position.y=2.8;
    if(eliteCount<this.elitePool.length){const e=this.elitePool[eliteCount++];e.visible=true;e.position.set(t.x,.02,-t.z);e.rotation.set(0,Math.PI,Math.sin(this.age*4+t.id)*.025);e.scale.setScalar(t.variant===1?1.1:1.0);
     e.traverse(o=>{if(/^Arm_[LR]$/.test(o.name))o.rotation.x=Math.sin(this.age*6+t.id)*.10;if(/^Leg_[LR]$/.test(o.name))o.rotation.x=Math.sin(this.age*7+t.id+(o.name==='Leg_R'?Math.PI:0))*(t.z>3?.16:.045);if(o.name==='Barrel_R')o.rotation.z=-this.age*6;});
    }
   }
  }
  this.robots.end();for(const [id,v] of this.views)if(!live.has(id)){this.disposeView(v);this.views.delete(id);}
  for(let i=eliteCount;i<this.elitePool.length;i++)this.elitePool[i].visible=false;
  this.boss.visible=(bossPhase||intro)&&!this.bossExploded;this.boss.position.set(intro?0:s.bossX,0,intro?-12:-s.bossZ);this.boss.scale.setScalar(intro?1.25:1.15);
  const bossVelocity=renderDt>0?(s.bossX-this.bossPreviousX)/renderDt:0;this.bossPreviousX=s.bossX;
  this.boss.rotation.z=T.MathUtils.clamp(-bossVelocity*.025,-.07,.07);this.boss.rotation.y=bossPhase?T.MathUtils.clamp((s.x-s.bossX)*-.025,-.12,.12):0;
  const windup=s.bossAction==='windup',fire=s.bossAction==='fire',walk=windup?.02:.16;
  for(const joint of this.bossJoints){joint.quaternion.copy(joint.userData.restQuaternion);const side=joint.name.endsWith('R')?Math.PI:0;
   if(joint.name.startsWith('Leg_'))joint.rotation.x+=Math.sin(this.age*5.5+side)*walk;
   else if(joint.name.startsWith('Knee_'))joint.rotation.x+=Math.max(0,Math.sin(this.age*5.5+side))*.12;
   else if(joint.name.startsWith('Arm_'))joint.rotation.x+=windup?-.18-(Math.sin(this.age*26)*.015):fire?.22:Math.sin(this.age*3+side)*.055;
   else if(joint.name.startsWith('Barrel_'))joint.rotation.z-=this.age*(windup?15:fire?22:3);
   else if(joint.name==='Head')joint.rotation.y+=T.MathUtils.clamp((s.x-s.bossX)*-.06,-.18,.18);
  }
  for(const glow of this.bossMuzzles){(glow.material as T.MeshBasicMaterial).opacity=windup?.65+Math.sin(this.age*28)*.25:fire?.95:0;glow.scale.setScalar(windup?1.5+Math.sin(this.age*28)*.25:2.7);}
  if(this.boss.visible)this.set(this.shadowInstances,shadowCount++,this.boss.position.x,.032,this.boss.position.z,5.5);
  this.shadowInstances.count=shadowCount;this.shadowInstances.instanceMatrix.needsUpdate=true;
  this.missiles.update(s.shots,s.enemyShots,{depthScale:1,bossPhase,bossZ:s.bossZ,overdrive:s.ability>0&&s.relic===2,weapon:s.weapon,visible:!intro&&s.phase!=='won'&&s.phase!=='lost'});
  this.abilities.update(s,{depthScale:1,armyRadius:Math.max(1.5,outer+.9),armyCenterZ:.45+outer,armyCenterX:centerX,visible:!intro&&s.phase!=='won'&&s.phase!=='lost'},renderDt);
  if(active&&s.phase!=='destroying'&&this.age-this.lastMuzzle>.14&&s.shots.some(p=>p.z<2.8)){
   this.lastMuzzle=this.age;this.recoil=1;this.fx.muzzle(s.x,s.weapon>=4?2.1:1.35,-.85,false);
  }
  this.fx.update(renderDt);
  for(let i=this.floating.length-1;i>=0;i--){const f=this.floating[i];f.life-=renderDt;f.y+=renderDt*1.6;f.badge.sprite.position.set(f.x,f.y,f.z);f.badge.sprite.material.opacity=Math.min(1,f.life*3);if(f.life<=0){this.scene.remove(f.badge.sprite);f.badge.dispose();this.floating.splice(i,1);}}
  this.renderer.render(this.scene,this.camera);
 }
}
