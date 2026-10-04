import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import type {Snapshot,Target,Effect} from './contract';
const mat=(color:number)=>new T.MeshStandardMaterial({color,roughness:.82,metalness:.06});
function box(p:T.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
function cyl(p:T.Object3D,r:number,rb:number,h:number,x:number,y:number,z:number,m:T.Material,n=12){const o=new T.Mesh(new T.CylinderGeometry(r,rb,h,n),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
class Badge{
 canvas=document.createElement('canvas');ctx:CanvasRenderingContext2D;texture:T.CanvasTexture;sprite:T.Sprite;last='';
 constructor(width=1.9){this.canvas.width=384;this.canvas.height=160;this.ctx=this.canvas.getContext('2d')!;this.texture=new T.CanvasTexture(this.canvas);this.texture.colorSpace=T.SRGBColorSpace;this.sprite=new T.Sprite(new T.SpriteMaterial({map:this.texture,transparent:true,depthTest:false,depthWrite:false}));this.sprite.scale.set(width,width*160/384,1);this.sprite.renderOrder=12;}
 set(text:string,color:string,sub=''){const key=text+color+sub;if(key===this.last)return;this.last=key;const c=this.ctx;c.clearRect(0,0,384,160);c.fillStyle='#152c36ef';c.beginPath();c.roundRect(4,4,376,152,25);c.fill();c.strokeStyle=color;c.lineWidth=7;c.stroke();c.textAlign='center';c.fillStyle='white';c.font=`900 ${sub?81:100}px Segoe UI`;c.fillText(text,192,sub?100:117,355);if(sub){c.fillStyle=color;c.font='800 25px Segoe UI';c.fillText(sub,192,138,355);}this.texture.needsUpdate=true;}
 dispose(){this.texture.dispose();this.sprite.material.dispose();}
}
 type View={group:T.Group;badge:Badge;bar:T.Mesh;kind:string;rotor?:T.Object3D};
type Particle={p:T.Vector3;v:T.Vector3;life:number;max:number;color:T.Color;size:number};
export class Battlefield{
 renderer:T.WebGLRenderer;scene=new T.Scene();camera=new T.OrthographicCamera(-7,7,12,-12,.1,150);
 hero=new T.Group();model?:T.Object3D;mixer?:T.AnimationMixer;run?:T.AnimationAction;idle?:T.AnimationAction;running=false;
 allies?:T.InstancedMesh;enemyInstances?:T.InstancedMesh;groundTiles:T.Group[]=[];views=new Map<number,View>();dummy=new T.Object3D();
 eliteTemplate?:T.Object3D;elitePool:T.Object3D[]=[];bossModel?:T.Object3D;bossJoints:T.Object3D[]=[];hostileShots:T.InstancedMesh;hostileTrails:T.InstancedMesh;
 terrainMaterials:T.MeshStandardMaterial[]=[];terrainLevel=-1;levelProps:T.Group[]=[];
 weaponRigs:T.Group[]=[];boss=new T.Group();bossArms:T.Group[]=[];bossCore:T.Mesh;bossRing:T.Mesh;bossBadge=new Badge(2.5);
 warning:T.Mesh;shield:T.Mesh;heroRing:T.Mesh;shadowInstances:T.InstancedMesh;
 fanWarnings:T.Mesh[]=[];
 bullets:T.InstancedMesh;bulletGlow:T.InstancedMesh;particles:Particle[]=[];particleMesh:T.InstancedMesh;
 floating:{badge:Badge,life:number,x:number,y:number,z:number}[]=[];age=0;shake=0;wasBoss=false;depthScale=1;cameraWidth=5.9;cameraBossBlend=0;seed=78;resizeObserver:ResizeObserver;
 constructor(public canvas:HTMLCanvasElement){
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  this.renderer.setClearColor(0xadc5c7);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
  this.scene.fog=new T.Fog(0xadc5c7,65,120);this.scene.add(new T.HemisphereLight(0xecf9ff,0x8c7354,2.65));
  const sun=new T.DirectionalLight(0xffedcb,3.2);sun.position.set(-14,30,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-20,right:20,top:35,bottom:-20,near:1,far:80});sun.shadow.normalBias=.06;sun.shadow.bias=-.0003;this.scene.add(sun);this.scene.add(new T.AmbientLight(0xffffff,.3));
  this.makeTerrain();this.scene.add(this.hero);
  for(const side of [-1,1]){const rig=new T.Group();rig.position.set(side*.9,1.15,-.1);box(rig,.28,.32,.55,0,0,0,mat(0x304f5d));cyl(rig,.095,.13,.7,0,.04,-.48,mat(0xc49949),8).rotation.x=Math.PI/2;const ring=cyl(rig,.12,.12,.09,0,.04,-.79,new T.MeshBasicMaterial({color:0x67e6ff}),8);ring.rotation.x=Math.PI/2;this.hero.add(rig);this.weaponRigs.push(rig);}
  const siegeRig=new T.Group();siegeRig.position.set(0,2.0,.15);box(siegeRig,.65,.42,.75,0,0,0,mat(0x304f5d));for(const side of [-1,1]){const barrel=cyl(siegeRig,.14,.18,1.05,side*.23,0,-.72,mat(0xc49949),10);barrel.rotation.x=Math.PI/2;const muzzle=cyl(siegeRig,.12,.12,.08,side*.23,0,-1.24,new T.MeshBasicMaterial({color:0xffb83f}),10);muzzle.rotation.x=Math.PI/2;}this.hero.add(siegeRig);this.weaponRigs.push(siegeRig);
  this.heroRing=new T.Mesh(new T.RingGeometry(.75,.83,48),new T.MeshBasicMaterial({color:0x52e8ff,transparent:true,opacity:.8,side:T.DoubleSide}));this.heroRing.rotation.x=-Math.PI/2;this.heroRing.position.y=.035;this.hero.add(this.heroRing);
  this.shield=new T.Mesh(new T.SphereGeometry(1.3,20,16),new T.MeshBasicMaterial({color:0x54deff,transparent:true,opacity:.2,depthWrite:false}));this.shield.position.y=.9;this.hero.add(this.shield);
  this.bullets=new T.InstancedMesh(new T.CapsuleGeometry(.045,.55,2,5).rotateX(Math.PI/2),new T.MeshBasicMaterial({color:0xfffac4}),600);this.bullets.count=0;this.bullets.frustumCulled=false;this.scene.add(this.bullets);
  this.bulletGlow=new T.InstancedMesh(new T.SphereGeometry(.10,6,4),new T.MeshBasicMaterial({color:0xffb542,transparent:true,opacity:.65,blending:T.AdditiveBlending,depthWrite:false}),100);this.bulletGlow.count=0;this.bulletGlow.frustumCulled=false;this.scene.add(this.bulletGlow);
  this.hostileShots=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),new T.MeshBasicMaterial({color:0xffffff}),96);this.hostileShots.count=0;this.hostileShots.frustumCulled=false;this.scene.add(this.hostileShots);
  this.hostileTrails=new T.InstancedMesh(new T.ConeGeometry(.17,1.9,6).rotateX(Math.PI/2),new T.MeshBasicMaterial({color:0xff7a25,transparent:true,opacity:.65,depthWrite:false,blending:T.AdditiveBlending}),96);this.hostileTrails.count=0;this.hostileTrails.frustumCulled=false;this.scene.add(this.hostileTrails);
  this.shadowInstances=new T.InstancedMesh(new T.CircleGeometry(.36,12).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0x21332d,transparent:true,opacity:.22,depthWrite:false}),220);this.shadowInstances.frustumCulled=false;this.scene.add(this.shadowInstances);
  this.particleMesh=new T.InstancedMesh(new T.IcosahedronGeometry(.12,0),new T.MeshBasicMaterial({color:0xffffff}),350);this.particleMesh.frustumCulled=false;this.scene.add(this.particleMesh);
  const steel=mat(0x33434c),armor=mat(0xbd5b38),edge=mat(0xf1ba6b),black=mat(0x1c252b);
  for(const side of [-1,1]){
   box(this.boss,1.3,.7,1.8,side*1.1,.35,.2,black);box(this.boss,.8,1.5,1,side*1.1,1.3,0,steel);box(this.boss,1,.9,1.1,side*1.1,1.6,.3,armor);
   const arm=new T.Group();arm.position.set(side*1.9,3.1,0);this.boss.add(arm);this.bossArms.push(arm);box(arm,1.2,1.2,1.25,0,0,0,armor);cyl(arm,.45,.45,.25,side*.65,0,0,edge,10).rotation.z=Math.PI/2;
   cyl(arm,.38,.48,1.9,0,-.3,1.05,black,10).rotation.x=Math.PI/2;cyl(arm,.48,.48,.2,0,-.3,1.8,edge,10).rotation.x=Math.PI/2;
   for(const x of [-.17,.17])for(const y of [-.17,.17])cyl(arm,.09,.09,.1,x,y-.3,2.05,edge,8).rotation.x=Math.PI/2;
  }
  box(this.boss,2.65,1.85,1.5,0,2.9,0,steel);box(this.boss,2.9,.3,1.8,0,3.8,0,armor);box(this.boss,1.5,.9,1.3,0,4.3,.1,armor);box(this.boss,1.4,.18,.1,0,4.35,.8,black);box(this.boss,1,.10,.13,0,4.35,.87,new T.MeshBasicMaterial({color:0xffdb60}));
  this.bossCore=new T.Mesh(new T.OctahedronGeometry(.55,1),new T.MeshStandardMaterial({color:0xffb037,emissive:0xe65012,emissiveIntensity:1.8,roughness:.3}));this.bossCore.position.set(0,3,1);this.boss.add(this.bossCore);
  this.bossRing=new T.Mesh(new T.TorusGeometry(.67,.12,5,12),edge);this.bossRing.position.set(0,3,.95);this.boss.add(this.bossRing);this.bossBadge.sprite.position.set(0,5.25,0);this.boss.add(this.bossBadge.sprite);this.scene.add(this.boss);
  this.warning=new T.Mesh(new T.PlaneGeometry(2.7,28),new T.MeshBasicMaterial({color:0xff4529,transparent:true,opacity:.35,side:T.DoubleSide,depthWrite:false}));this.warning.rotation.x=-Math.PI/2;this.warning.position.y=.08;this.scene.add(this.warning);
  for(let i=-2;i<=2;i++){const lane=new T.Mesh(new T.PlaneGeometry(1.10,13.7),new T.MeshBasicMaterial({color:0xe953f2,transparent:true,opacity:.25,side:T.DoubleSide,depthWrite:false}));lane.rotation.x=-Math.PI/2;lane.position.set(i*1.025,.07,-6.75);lane.rotation.z=Math.atan2(i*.75,13.5);lane.visible=false;this.scene.add(lane);this.fanWarnings.push(lane);}
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.resize();
 }
 random(){this.seed=(this.seed*16807)%2147483647;return this.seed/2147483647;}
 makeTerrain(){
  const road=mat(0x788a94),dark=mat(0x4e6269),edge=mat(0xe8d1a2),earth=mat(0xb99c76),grass=mat(0x4b7565),sand=mat(0xe0c597),steel=mat(0x4b686a),teal=mat(0x329fb0),stone=mat(0xa6a18a);
  this.terrainMaterials=[road,dark,edge,earth,grass,sand,steel,teal,stone];
  const cv=document.createElement('canvas');cv.width=cv.height=512;const c=cv.getContext('2d')!;c.fillStyle='#91a2a8';c.fillRect(0,0,512,512);
  for(let i=0;i<15000;i++){const v=100+this.random()*80;c.fillStyle=`rgba(${v},${v+8},${v+9},.12)`;c.fillRect(this.random()*512,this.random()*512,1+this.random()*3,1+this.random()*3);}
  for(let i=0;i<18;i++){const x=this.random()*512,y=this.random()*512;c.strokeStyle='#526a7425';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x+25,y+8);c.lineTo(x+40,y-2);c.stroke();}
  const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(2,2);road.map=tex;
  for(let i=0;i<12;i++){
   const g=new T.Group();box(g,10,.4,8,0,-.25,0,dark);box(g,9.4,.08,7.96,0,-.01,0,road);
   for(const side of [-1,1]){
    box(g,.30,.26,8,side*4.85,.07,0,edge);box(g,.055,.06,7.9,side*4.55,.055,0,teal);box(g,14,.55,8,side*12,-.38,0,earth);box(g,1.3,.10,8,side*5.65,-.03,0,sand);
    for(let j=0;j<3;j++){const r=new T.Mesh(new T.DodecahedronGeometry(.6,0),stone);r.position.set(side*(6.2+this.random()*3),.2,-3+this.random()*6);r.scale.set(1+this.random(),.5+this.random(),1+this.random());r.rotation.set(0,this.random()*6,.2);r.castShadow=true;g.add(r);}
    for(let j=0;j<7;j++){const p=new T.Mesh(new T.DodecahedronGeometry(.28,0),grass);p.position.set(side*(5.5+this.random()*5),.12,-4+this.random()*8);p.scale.set(1,.5,1);g.add(p);}
    if(i%2===0){const p=new T.Group();p.position.set(side*5.6,0,-2);box(p,.8,.35,.8,0,.1,0,stone);cyl(p,.14,.20,1.9,0,1.1,0,steel,8);box(p,.9,.10,.12,side*.30,2.05,0,edge);const flag=new T.Mesh(new T.PlaneGeometry(.72,1.04),new T.MeshStandardMaterial({color:0x277b88,side:T.DoubleSide,roughness:1}));flag.position.set(side*.38,1.53,.04);p.add(flag);g.add(p);}
    if(i%3===1)for(let j=0;j<3;j++)box(g,.75,.45,.55,side*(7.4+j*.35),.25+j*.16,2.4-j*.4,edge);
   }
   for(const x of [-3.6,3.6])for(let j=0;j<2;j++)box(g,.13,.013,.35,x,.04,-3+j*.20,edge).rotation.y=.4;
   box(g,9.4,.014,.035,0,.045,3.95,dark);this.groundTiles.push(g);this.scene.add(g);
   for(let j=0;j<4;j++)box(g,.075,.016,.8,0,.052,-3+j*2,edge);
   const foundry=new T.Group(),citadel=new T.Group();foundry.visible=false;citadel.visible=false;g.add(foundry,citadel);this.levelProps.push(foundry,citadel);
   for(const side of [-1,1]){
    const pipe=cyl(foundry,.34,.34,7.8,side*5.9,.35,0,mat(0x8b5c37),12);pipe.rotation.x=Math.PI/2;
    for(const z of [-2,2]){const hoop=new T.Mesh(new T.TorusGeometry(.39,.065,5,12),steel);hoop.position.set(side*5.9,.35,z);foundry.add(hoop);box(foundry,1.25,.13,1.2,side*6,.05,z,steel);}
    box(foundry,.48,.03,7.7,side*5.23,.08,0,new T.MeshBasicMaterial({color:0xef9b35}));
    const pedestal=box(citadel,1.1,.42,1.1,side*5.8,.20,0,dark);const crystal=new T.Mesh(new T.OctahedronGeometry(.65),new T.MeshStandardMaterial({color:0x70c7df,emissive:0x147394,emissiveIntensity:.5,roughness:.25}));crystal.position.set(side*5.8,1.15,0);crystal.scale.y=1.8;citadel.add(crystal);
   }
  }
 }
 resize(){const w=Math.max(1,this.canvas.clientWidth),h=Math.max(1,this.canvas.clientHeight);this.renderer.setSize(w,h,false);const halfW=5.9,halfH=halfW*h/w;this.camera.left=-halfW;this.camera.right=halfW;this.camera.top=halfH;this.camera.bottom=-halfH;this.camera.updateProjectionMatrix();}
 async load(){
  const loader=new GLTFLoader();const [hero,troop,enemy,elite,tyrant]=await Promise.all([loader.loadAsync('commander.glb'),loader.loadAsync('troop.glb'),loader.loadAsync('crawler.glb'),loader.loadAsync('cinder-reaver.glb'),loader.loadAsync('forge-tyrant.glb')]);this.model=hero.scene;this.model.scale.setScalar(.95);this.model.rotation.y=Math.PI;this.hero.add(this.model);this.model.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.material.roughness=.76;o.material.metalness=.05;}});
  const styled=new Set<T.Material>();for(const asset of [elite,tyrant])asset.scene.traverse((o:any)=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(!styled.has(m)){styled.add(m);m.color.multiplyScalar(2.5);m.metalness=.16;m.roughness=.78;}});
  this.eliteTemplate=elite.scene;this.eliteTemplate.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  for(let i=0;i<16;i++){const e=this.eliteTemplate.clone(true);e.visible=false;this.elitePool.push(e);this.scene.add(e);}
  this.boss.clear();this.bossModel=tyrant.scene;this.bossModel.rotation.y=Math.PI;this.boss.add(this.bossModel);this.bossModel.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}if(/^(Arm_|Barrel_|Pod_)/.test(o.name))this.bossJoints.push(o);});
  this.mixer=new T.AnimationMixer(hero.scene);for(const clip of hero.animations){if(clip.name==='Run')this.run=this.mixer.clipAction(clip);if(clip.name==='Idle')this.idle=this.mixer.clipAction(clip);}this.idle?.play();
  const parts=(gltf:any)=>{gltf.scene.updateMatrixWorld(true);let mesh:any;gltf.scene.traverse((o:any)=>{if(o.isMesh&&!mesh)mesh=o;});const geo=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld),m=mesh.material.clone();m.roughness=.85;m.metalness=.05;return [geo,m] as [T.BufferGeometry,T.MeshStandardMaterial];};
  const [ag,am]=parts(troop),[eg,em]=parts(enemy);em.color.set(0xff7755);this.allies=new T.InstancedMesh(ag,am,80);this.allies.castShadow=true;this.allies.frustumCulled=false;this.scene.add(this.allies);this.enemyInstances=new T.InstancedMesh(eg,em,200);this.enemyInstances.castShadow=true;this.enemyInstances.frustumCulled=false;this.scene.add(this.enemyInstances);
 }
 reset(){for(const v of this.views.values())this.disposeView(v);this.views.clear();this.particles=[];for(const f of this.floating){this.scene.remove(f.badge.sprite);f.badge.dispose();}this.floating=[];this.shake=0;this.wasBoss=false;this.cameraBossBlend=0;this.cameraWidth=5.9;this.depthScale=1;}
 set(mesh:T.InstancedMesh,i:number,x:number,y:number,z:number,scale=1,rot=0){this.dummy.position.set(x,y,z);this.dummy.rotation.set(0,rot,0);this.dummy.scale.setScalar(scale);this.dummy.updateMatrix();mesh.setMatrixAt(i,this.dummy.matrix);}
 createView(t:Target):View{
  const group=new T.Group(),badge=new Badge(t.kind==='gate'?2.8:t.kind==='crate'?1.65:1.25),red=mat(0xe94f38),gold=mat(0xfbb94e),dark=mat(0x233942),white=mat(0xffefd0);let rotor:T.Object3D|undefined;
  if(t.kind==='gate'){
   const positive=t.value>=0,blue=mat(positive?0x1dabc2:0xe94f38);for(const side of [-1,1]){box(group,.18,2.1,.18,side*1.55,1.05,0,dark);cyl(group,.16,.24,.28,side*1.55,.14,0,gold,8);box(group,.08,1.95,.05,side*1.55,1.1,.12,blue);}
   const panel=new T.Mesh(new T.PlaneGeometry(3,1.65),new T.MeshBasicMaterial({color:positive?0x25c5ec:0xf56542,transparent:true,opacity:.24,side:T.DoubleSide,depthWrite:false}));panel.position.y=1.1;group.add(panel);box(group,3.3,.12,.20,0,2.12,0,blue);badge.sprite.position.y=1.35;
   const floor=new T.Mesh(new T.PlaneGeometry(3,.32),new T.MeshBasicMaterial({color:positive?0x45dfff:0xff7556,transparent:true,opacity:.65,side:T.DoubleSide}));floor.rotation.x=-Math.PI/2;floor.position.y=.045;group.add(floor);group.userData.gateTint=[blue,panel.material,floor.material];
  }else if(t.kind==='crate'){
   box(group,1.35,1.12,1.15,0,.6,0,gold);for(const x of [-.55,.55])box(group,.12,1.2,1.25,x,.6,0,dark);for(const z of [-.52,.52])box(group,1.4,.1,.13,0,1.05,z,white);rotor=new T.Group();rotor.position.y=1.75;group.add(rotor);box(rotor,.70,.25,.35,0,0,0,dark);for(const x of [-.18,.18])cyl(rotor,.08,.08,.90,x,.06,-.44,dark,8).rotation.x=Math.PI/2;box(rotor,.18,.28,.22,.05,-.22,0,white);badge.sprite.position.set(0,2.65,0);
  }else if(t.kind==='hazard'){
   rotor=new T.Group();rotor.position.y=.70;group.add(rotor);const log=cyl(rotor,.56,.56,2.3,0,0,0,red,16);log.rotation.z=Math.PI/2;for(const x of [-1.12,1.12]){const cap=cyl(rotor,.63,.63,.17,x,0,0,white,16);cap.rotation.z=Math.PI/2;}for(let j=0;j<4;j++)for(let i=0;i<7;i++){const a=i/7*Math.PI*2,o=new T.Mesh(new T.ConeGeometry(.16,.37,4),white);o.position.set(-.86+j*.57,Math.cos(a)*.61,Math.sin(a)*.61);o.rotation.x=a;rotor.add(o);}badge.sprite.position.y=1.9;
  }else badge.sprite.position.y=1.65;
  const bar=box(group,t.kind==='gate'?2.4:1.2,.07,.05,0,t.kind==='crate'?1.31:.13,.6,new T.MeshBasicMaterial({color:t.kind==='crate'?0xffdd56:0xff5b49}));group.add(badge.sprite);this.scene.add(group);const v={group,badge,bar,kind:t.kind,rotor};this.views.set(t.id,v);return v;
 }
 disposeView(v:View){this.scene.remove(v.group);v.badge.dispose();v.group.traverse((o:any)=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});}
 trigger(e:Effect){
  const z=-e.z*this.depthScale;if(e.kind==='hit')this.burst(e.x,.6,z,4,0xffd47a,.7);
  if(e.kind==='kill'){this.burst(e.x,.55,z,26,0xff823e,1.8);this.shake=Math.max(this.shake,.09);}
  if(e.kind==='gate'||e.kind==='recruit'){this.burst(e.x,.3,z,32,0x69e4ff,2);if(e.value!==0)this.float(e.value>0?'+'+e.value:String(e.value),e.x,z,'#73eaff');}
  if(e.kind==='damage'){this.burst(e.x,.6,z,20,0xf9573c,1.4);this.shake=.19;this.float('−'+Math.abs(e.value),e.x,0,'#ff8469');}
  if(e.kind==='relic'){this.burst(e.x,.8,0,45,0x68e9ff,3.5);this.shake=.05;}
  if(e.kind==='bossShot'){this.burst(e.x,e.z>16?3.2:1.2,z,22,0xff9940,2);this.shake=.08;}
  if(e.kind==='win'){this.burst(0,2,-17,100,0xffcd58,4);this.shake=.3;}
 }
 burst(x:number,y:number,z:number,count:number,color:number,speed:number){for(let i=0;i<count&&this.particles.length<350;i++){const life=.25+Math.random()*.45;this.particles.push({p:new T.Vector3(x,y,z),v:new T.Vector3((Math.random()-.5)*speed,Math.random()*speed+1,(Math.random()-.5)*speed),life,max:life,color:new T.Color(color),size:.5+Math.random()});}}
 float(text:string,x:number,z:number,color:string){const badge=new Badge(1.5);badge.set(text,color);this.scene.add(badge.sprite);this.floating.push({badge,life:.8,x,y:2,z});}
 update(s:Snapshot,dt:number,mode:'intro'|'play'|'paused'|'result'){
  const active=mode==='play',intro=mode==='intro';const renderDt=mode==='paused'?0:dt;this.age+=renderDt;
  if(s.level!==this.terrainLevel){this.terrainLevel=s.level;const colors=[[0x788a94,0x4e6269,0xe8d1a2,0xb99c76,0x4b7565,0xe0c597,0x4b686a,0x329fb0,0xa6a18a],[0x73777a,0x40484c,0xcdb381,0x665c52,0x4c5751,0x9c7755,0x4d5559,0xd89142,0x897e6b],[0x7d99a8,0x394f61,0xc2d5db,0x536f7a,0x405b67,0x7798a5,0x465e73,0x60c8f0,0x7992a1]][s.level]??[];this.terrainMaterials.forEach((m,i)=>m.color.set(colors[i]));this.levelProps.forEach((p,i)=>p.visible=s.level===(i%2===0?1:2));}
  if(active!==this.running){this.run?.stop();this.idle?.stop();(active?this.run:this.idle)?.reset().play();this.running=active;}this.mixer?.update(renderDt*(active?1.5:1));
  if(s.phase==='boss')this.wasBoss=true;const bossPhase=this.wasBoss&&(s.phase==='boss'||s.phase==='won'||s.phase==='lost');this.depthScale=bossPhase?.75:1;this.cameraBossBlend+=((bossPhase?1:0)-this.cameraBossBlend)*(1-Math.exp(-renderDt*3));this.cameraWidth=5.9+.9*this.cameraBossBlend;const halfH=this.cameraWidth*this.canvas.clientHeight/this.canvas.clientWidth,lookZ=-(halfH*(.55+.23*this.cameraBossBlend));this.camera.left=-this.cameraWidth;this.camera.right=this.cameraWidth;this.camera.top=halfH;this.camera.bottom=-halfH;this.camera.updateProjectionMatrix();this.camera.position.set(0,28-6*this.cameraBossBlend,lookZ+24+4*this.cameraBossBlend);this.camera.lookAt(0,0,lookZ);
  if(this.shake>0&&active){this.camera.position.x+=(Math.random()-.5)*this.shake;this.camera.position.y+=(Math.random()-.5)*this.shake;this.shake=Math.max(0,this.shake-dt*.6);}
  const scroll=intro?this.age*.8:s.time*3.4;for(let i=0;i<this.groundTiles.length;i++)this.groundTiles[i].position.z=12-i*8+(scroll%8);
  this.hero.position.set(intro?0:s.x,0,intro?-5:0);if(this.model){this.model.rotation.y=intro?Math.PI*.85:Math.PI;this.model.scale.setScalar(intro?1.5:1.25);this.model.rotation.z=active?Math.sin(this.age*13)*.012:0;}
  this.weaponRigs.forEach((r,i)=>r.visible=!intro&&s.weapon>=i+2);this.shield.visible=s.ability>0&&!intro&&s.relic===0;this.shield.scale.setScalar(1+.015*Math.sin(this.age*12));this.heroRing.visible=!intro;this.heroRing.scale.setScalar(s.ability>0&&s.relic===1?1+(this.age*2%1)*3:1);(this.heroRing.material as T.MeshBasicMaterial).color.set(s.ability>0?(s.relic===1?0xc294ff:s.relic===2?0xffb63d:0x52e8ff):0x52e8ff);
  let allyCount=0,enemyCount=0,shadowCount=0,eliteCount=0;const visibleAllies=intro?0:Math.min(80,Math.max(0,s.army-1));
  if(this.allies){for(let i=0;i<visibleAllies;i++){const radius=.30*Math.sqrt(i+.5),angle=i*2.39996323,outer=.30*Math.sqrt(visibleAllies),squeeze=Math.max(.5,Math.min(1,(4.4-Math.abs(s.x))/Math.max(.5,outer))),x=s.x+Math.sin(angle)*radius*squeeze,z=.45+outer+Math.cos(angle)*radius;this.set(this.allies,allyCount++,x,active?Math.abs(Math.sin(this.age*13+i))*.055:0,z,.55,Math.PI);this.set(this.shadowInstances,shadowCount++,x,.04,z,.85);}this.allies.count=allyCount;this.allies.instanceMatrix.needsUpdate=true;}
  const live=new Set<number>(),visibleTargets=s.targets.filter(t=>t.z<=36&&t.z>=-4).sort((a,b)=>a.z-b.z);const smallCopies=visibleTargets.filter(t=>t.kind==='enemy'&&t.variant===0).length>100?1:2;for(const t of visibleTargets){if(t.kind==='enemy'&&t.variant===0){for(let j=0;j<smallCopies&&enemyCount<200;j++){const ex=t.x+(j-(smallCopies-1)/2)*.36,ez=-t.z*this.depthScale;if(this.enemyInstances)this.set(this.enemyInstances,enemyCount++,ex,.025*Math.sin(this.age*18+j),ez,t.hit>0?.69:.66,0);if(shadowCount<220)this.set(this.shadowInstances,shadowCount++,ex,.04,ez,.85);}continue;}live.add(t.id);const v=this.views.get(t.id)??this.createView(t);v.group.visible=!intro;v.group.position.set(t.x,0,-t.z*this.depthScale);v.group.scale.setScalar(t.hit>0?1.04:1);if(t.kind==='gate')v.group.scale.x*=(t.size+.1)/1.55;
   if(t.kind==='gate'){v.badge.set(t.op===1?'×'+t.value:(t.value>=0?'+':'')+t.value,t.value>=0?'#54ddff':'#ff7755',t.op===1?'MULTIPLY':t.value<0?'SHOOT TO FLIP':'RECRUIT');v.bar.visible=false;for(const m of v.group.userData.gateTint??[])m.color.set(t.value>=0?0x1dabc2:0xe94f38);}
   else if(t.kind==='crate'){v.badge.set(String(Math.ceil(t.hp)),'#ffc851','WEAPON');if(v.rotor)v.rotor.rotation.y=this.age*1.1;v.bar.scale.x=Math.max(.02,t.hp/t.maxHp);}
   else if(t.kind==='hazard'){v.badge.set('−'+Math.abs(t.value),'#ff795b');v.bar.visible=false;if(v.rotor){v.rotor.rotation.x=this.age*4;v.rotor.scale.x=t.size*2/2.3;}}
   else{v.badge.set(String(Math.ceil(t.hp)),'#ff8064',t.variant===2?'GUNNER':t.variant===1?'REAVER':'');v.bar.scale.x=Math.max(.02,t.hp/t.maxHp);v.badge.sprite.visible=t.variant>0;v.badge.sprite.position.y=t.variant>0?2.7:1.65;v.bar.visible=t.variant>0;
    if(t.variant>0&&eliteCount<this.elitePool.length){const e=this.elitePool[eliteCount++];e.visible=!intro;e.position.set(t.x,.03,-t.z*this.depthScale);e.rotation.set(0,Math.PI,Math.sin(this.age*5+t.id)*.025);e.scale.setScalar(t.variant===1?1.02:.90);e.traverse(o=>{if(o.name==='Arm_L'||o.name==='Arm_R')o.rotation.x=Math.sin(this.age*5+t.id)*.09;if(o.name==='Leg_L'||o.name==='Leg_R')o.rotation.x=Math.sin(this.age*7+t.id+(o.name==='Leg_R'?Math.PI:0))*.1;});}
    else{const wanted=2,cols=2;for(let j=0;j<wanted&&enemyCount<200;j++){const ex=t.x+(j%cols-(cols-1)/2)*.36,ez=-t.z*this.depthScale-Math.floor(j/cols)*.40;if(this.enemyInstances)this.set(this.enemyInstances,enemyCount++,ex,.025*Math.sin(this.age*18+j),ez,.66,0);if(shadowCount<220)this.set(this.shadowInstances,shadowCount++,ex,.04,ez,.85);}}
   }
  }
  for(const [id,v] of this.views)if(!live.has(id)){this.disposeView(v);this.views.delete(id);}
  for(let i=eliteCount;i<this.elitePool.length;i++)this.elitePool[i].visible=false;
  if(this.enemyInstances){this.enemyInstances.count=intro?0:enemyCount;this.enemyInstances.instanceMatrix.needsUpdate=true;}this.shadowInstances.count=shadowCount;this.shadowInstances.instanceMatrix.needsUpdate=true;
  this.boss.visible=bossPhase||intro;this.boss.position.set(0,0,intro?-12:-18*this.depthScale);this.boss.rotation.z=s.phase==='won'?.16:Math.sin(this.age*2)*.009;this.boss.scale.setScalar(intro?1.1:1.3);this.bossBadge.set(Math.ceil(s.bossHp).toString(),'#ff8263','FORGE COLOSSUS');this.bossBadge.sprite.visible=false;this.bossCore.rotation.y=this.age;
  for(let i=0;i<this.bossArms.length;i++)this.bossArms[i].rotation.x=s.bossAttack>0?-.2*Math.sin(s.bossAttack*Math.PI):Math.sin(this.age*2+i)*.035;
  for(const joint of this.bossJoints){if(joint.name.startsWith('Barrel'))joint.rotation.z=-this.age*(s.bossAttack>0?10:2);else joint.rotation.x=s.bossAttack>0?-.12*Math.sin(s.bossAttack*Math.PI):Math.sin(this.age*2)*.02;}
  this.warning.visible=s.phase==='boss'&&s.bossAttack>0&&s.level!==1;this.warning.position.set(s.bossLane,.065,-11);(this.warning.material as T.MeshBasicMaterial).opacity=.13+s.bossAttack*.25+Math.sin(this.age*25)*.05;
  for(const lane of this.fanWarnings){lane.visible=s.phase==='boss'&&s.bossAttack>0&&s.level===1;(lane.material as T.MeshBasicMaterial).opacity=.12+s.bossAttack*.22+Math.sin(this.age*18)*.04;}
  let bi=0;for(const p of s.shots){if(bi>=600)break;this.set(this.bullets,bi++,p.x,.75,-p.z*this.depthScale,p.heavy?1.6:1);}this.bullets.count=intro||s.phase==='won'||s.phase==='lost'?0:bi;this.bullets.instanceMatrix.needsUpdate=true;
  (this.bullets.material as T.MeshBasicMaterial).color.set(s.weapon>=4?0xffbd50:s.weapon===3?0x7ff5ff:0xfffac4);
  let hi=0;for(const p of s.enemyShots){if(hi>=96)break;const height=.85+(bossPhase?2.35*Math.max(0,Math.min(1,p.z/18)):0);this.set(this.hostileShots,hi,p.x,height,-p.z*this.depthScale,p.radius);this.hostileShots.setColorAt(hi,new T.Color(p.kind==='orb'?0xef65ff:p.kind==='rocket'?0xff6633:0xffd046));const yaw=Math.atan2(p.dx,-p.dz);this.set(this.hostileTrails,hi,p.x-p.dx*.04,height,-(p.z-p.dz*.04)*this.depthScale,p.kind==='orb'?.65:1,yaw);hi++;}this.hostileShots.count=this.hostileTrails.count=intro?0:hi;this.hostileShots.instanceMatrix.needsUpdate=true;this.hostileTrails.instanceMatrix.needsUpdate=true;if(this.hostileShots.instanceColor)this.hostileShots.instanceColor.needsUpdate=true;
  let flashes=0;if(active&&Math.sin(this.age*30)>.15){const count=Math.min(12,Math.ceil(s.army/3));for(let i=0;i<count;i++){const n=Math.min(count,6),x=s.x+(i%n-(n-1)/2)*.40;this.set(this.bulletGlow,flashes++,x,.75,-.65,1+Math.random()*.3);}}this.bulletGlow.count=flashes;this.bulletGlow.instanceMatrix.needsUpdate=true;
  let pi=0;this.particles=this.particles.filter(p=>p.life>0);for(const p of this.particles){p.life-=renderDt;p.v.y-=renderDt*5;p.p.addScaledVector(p.v,renderDt);this.set(this.particleMesh,pi,p.p.x,Math.max(.07,p.p.y),p.p.z,p.size*Math.max(.01,p.life/p.max));this.particleMesh.setColorAt(pi++,p.color);}this.particleMesh.count=pi;this.particleMesh.instanceMatrix.needsUpdate=true;if(this.particleMesh.instanceColor)this.particleMesh.instanceColor.needsUpdate=true;
  for(let i=this.floating.length-1;i>=0;i--){const f=this.floating[i];f.life-=renderDt;f.y+=renderDt*2.3;f.badge.sprite.position.set(f.x,f.y,f.z);f.badge.sprite.material.opacity=Math.min(1,f.life*3);if(f.life<=0){this.scene.remove(f.badge.sprite);f.badge.dispose();this.floating.splice(i,1);}}
  this.renderer.render(this.scene,this.camera);
 }
}
