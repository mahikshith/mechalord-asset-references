import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {BattleCore} from './core';

const LANE=2.6, SPEED=1.65, ORIGIN=2;
function material(color:number,metalness=.15,roughness=.65){return new T.MeshStandardMaterial({color,metalness,roughness});}
function glow(color:number,strength=1){return new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:strength,roughness:.35,metalness:.4});}
function box(parent:T.Object3D,size:number[],position:number[],mat:T.Material){const m=new T.Mesh(new T.BoxGeometry(...size as [number,number,number]),mat);m.position.set(...position as [number,number,number]);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cylinder(parent:T.Object3D,r1:number,r2:number,h:number,pos:number[],mat:T.Material,n=12){const m=new T.Mesh(new T.CylinderGeometry(r1,r2,h,n),mat);m.position.set(...pos as [number,number,number]);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function textSprite(text:string,color='#b6ffed',width=1.55){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const c=canvas.getContext('2d')!;
 c.fillStyle='rgba(7,30,36,.94)';c.beginPath();c.roundRect(8,8,496,240,28);c.fill();c.strokeStyle=color;c.lineWidth=5;c.stroke();
 c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.font='bold 140px Bahnschrift,Segoe UI,sans-serif';c.fillText(text,256,139,450);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:true,transparent:true}));sprite.scale.set(width,width/2,1);return sprite;
}
function stoneMap(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d')!;
 c.fillStyle='#687278';c.fillRect(0,0,256,256);let seed=412;
 function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
 for(let i=0;i<18000;i++){const v=70+rand()*70;c.fillStyle=`rgba(${v},${v+5},${v+7},${rand()*.2})`;c.fillRect(rand()*256,rand()*256,rand()*3+.5,rand()*2+.5);}
 c.strokeStyle='#a4adb025';c.lineWidth=.5;for(let i=0;i<90;i++){let x=rand()*256,y=rand()*256;c.beginPath();c.moveTo(x,y);c.lineTo(x+rand()*18,y+rand()*3);c.stroke();}
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(2,3);map.anisotropy=4;return map;
}
type GateView={group:T.Group,plane:T.Mesh,label:T.Sprite};
export class Battlefield {
 renderer:T.WebGLRenderer;scene=new T.Scene();camera=new T.PerspectiveCamera(39,1,.1,140);
 hero=new T.Group();heroModel?:T.Object3D;mixer?:T.AnimationMixer;idle?:T.AnimationAction;run?:T.AnimationAction;
 allies?:T.InstancedMesh;enemies?:T.InstancedMesh;tiles:T.Group[]=[];gates:GateView[]=[];siegeGates:GateView[]=[];
 obstacles:T.Group[]=[];boss=new T.Group();coreCrystal:T.Mesh;halo:T.Group;shield:T.Mesh;
 canvas:HTMLCanvasElement;time=0;intro=true;hasRun=false;lastShot=0;shotIndex=0;shotPositions=new Float32Array(48*6);shotAges=new Float32Array(48).fill(100);
 shotGeometry=new T.BufferGeometry();shots:T.LineSegments;dummy=new T.Object3D();partColors:T.Material[]=[];
 sceneLight:T.DirectionalLight;currentCamera=new T.Vector3(4,3.2,6);cameraTarget=new T.Vector3(.1,1,0);
 sparkPositions=new Float32Array(140*3);sparkVelocity=new Float32Array(140*3);sparkLife=new Float32Array(140);sparkCursor=0;sparkGeometry=new T.BufferGeometry();sparks:T.Points;
 constructor(canvas:HTMLCanvasElement){
  this.canvas=canvas;this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.setClearColor(0x13222c);this.renderer.outputColorSpace=T.SRGBColorSpace;
  this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.12;
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
  this.scene.fog=new T.Fog(0x13222c,25,85);
  this.scene.add(new T.HemisphereLight(0xb7dbe7,0x514735,2.4));
  const sun=new T.DirectionalLight(0xffe2b0,3.7);sun.position.set(-9,17,8);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-12,right:12,top:18,bottom:-18,near:1,far:55});sun.shadow.bias=-.0015;sun.shadow.normalBias=.035;this.scene.add(sun);this.sceneLight=sun;
  const rim=new T.DirectionalLight(0x70cde3,2.2);rim.position.set(5,5,-15);this.scene.add(rim);
  const bronze=material(0x88724c,.72,.42),dark=material(0x152932,.55,.55),slate=material(0x9da6a3,.18,.84);slate.map=stoneMap();
  const edge=glow(0x3dd9c6,.75),rock=material(0x263b45,.05,1),ivory=material(0xb5af94,.3,.6);
  for(let i=0;i<10;i++){
   const tile=new T.Group();box(tile,[6.8,.35,9],[0,-.23,0],dark);box(tile,[6.3,.12,8.9],[0,-.015,0],slate);
   for(const sign of [-1,1]){
    box(tile,[.10,.07,8.88],[sign*2.96,.09,0],bronze);box(tile,[.055,.025,7.8],[sign*3.24,.13,0],edge);
    box(tile,[.38,.31,.65],[sign*3.20,.20,-3.9],bronze);box(tile,[.12,.06,1.1],[sign*2.55,.065,-3.9],dark);
    box(tile,[.08,.02,1.05],[sign*2.55,.10,-3.9],bronze);
   }
   for(const z of [-4.42,4.42])box(tile,[6.30,.015,.025],[0,.058,z],bronze);
   if(i%2===0){for(const sign of [-1,1]){
    const p=new T.Group();p.position.set(sign*3.9,-.15,0);cylinder(p,.35,.55,.6,[0,.05,0],bronze,8);cylinder(p,.21,.29,2.65,[0,1.6,0],ivory,6);cylinder(p,.35,.24,.35,[0,3.06,0],bronze,8);
    const gem=new T.Mesh(new T.OctahedronGeometry(.21),edge);gem.position.y=3.4;p.add(gem);tile.add(p);
   }}
   this.scene.add(tile);this.tiles.push(tile);
  }
  let seed=42;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  for(let i=0;i<34;i++){
   const mesh=new T.Mesh(new T.DodecahedronGeometry(1,0),rock);const side=i%2?1:-1;
   mesh.position.set(side*(10+random()*15),-5-random()*5,-70+random()*88);mesh.scale.set(3+random()*4,5+random()*7,3+random()*4);mesh.rotation.set(random(),random(),random());mesh.receiveShadow=true;this.scene.add(mesh);
  }
  for(const side of [-1,1])for(let i=0;i<5;i++){
   const arch=new T.Group();arch.position.set(side*(9+i%2*2),-1,-12-i*14);cylinder(arch,1,1.4,12,[0,5,0],dark,8);cylinder(arch,1.5,1.2,.5,[0,11.1,0],bronze,8);box(arch,[.16,5,.15],[0,7,side<0?1.05:-1.05],edge);this.scene.add(arch);
  }
  const dustGeom=new T.BufferGeometry(),dust=new Float32Array(80*3);for(let i=0;i<80;i++){dust[i*3]=(random()-.5)*25;dust[i*3+1]=random()*9;dust[i*3+2]=-random()*50;}
  dustGeom.setAttribute('position',new T.BufferAttribute(dust,3));this.scene.add(new T.Points(dustGeom,new T.PointsMaterial({color:0xdbcf9f,size:.035,transparent:true,opacity:.65})));
  this.scene.add(this.hero);this.hero.position.z=ORIGIN;
  this.halo=new T.Group();this.halo.position.y=.07;this.hero.add(this.halo);
  for(const radius of [1.06,1.23]){const ring=new T.Mesh(new T.TorusGeometry(radius,.012,6,64),new T.MeshBasicMaterial({color:0x6de6cc,transparent:true,opacity:.6}));ring.rotation.x=Math.PI/2;this.halo.add(ring);}
  this.shield=new T.Mesh(new T.SphereGeometry(1.4,24,14),new T.MeshBasicMaterial({color:0x63ead9,transparent:true,opacity:.11,wireframe:true}));this.shield.position.y=1;this.shield.visible=false;this.hero.add(this.shield);
  const bossGold=material(0x7e5431,.72,.38),bossDark=material(0x31272b,.5,.6),amber=glow(0xf0964a,2);
  cylinder(this.boss,1.7,2.1,.7,[0,.3,0],bossDark,10);cylinder(this.boss,1.35,1.6,2.4,[0,1.45,0],bossDark,10);
  for(const y of [.85,2.1,2.7]){const ring=new T.Mesh(new T.TorusGeometry(1.47,.10,6,10),bossGold);ring.rotation.x=Math.PI/2;ring.position.y=y;this.boss.add(ring);}
  this.coreCrystal=new T.Mesh(new T.OctahedronGeometry(.9),amber);this.coreCrystal.position.set(0,2.0,1.1);this.boss.add(this.coreCrystal);
  for(const side of [-1,1]){cylinder(this.boss,.6,.8,2.3,[side*2.2,1.1,0],bossDark,8);cylinder(this.boss,.7,.6,.4,[side*2.2,2.4,0],bossGold,8);const barrel=cylinder(this.boss,.18,.26,1.2,[side*2.2,2.35,.65],bossGold,10);barrel.rotation.x=Math.PI/2;}
  this.scene.add(this.boss);
  this.shotGeometry.setAttribute('position',new T.BufferAttribute(this.shotPositions,3));this.shots=new T.LineSegments(this.shotGeometry,new T.LineBasicMaterial({color:0xc5fff0,transparent:true,opacity:.9}));this.shots.frustumCulled=false;this.scene.add(this.shots);
  this.sparkGeometry.setAttribute('position',new T.BufferAttribute(this.sparkPositions,3));this.sparks=new T.Points(this.sparkGeometry,new T.PointsMaterial({color:0xffc582,size:.10,transparent:true,opacity:.85,depthWrite:false,blending:T.AdditiveBlending}));this.sparks.frustumCulled=false;this.scene.add(this.sparks);
  this.resize();window.addEventListener('resize',()=>this.resize());
 }
 resize(){const w=this.canvas.clientWidth,h=this.canvas.clientHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 async load(){
  const loader=new GLTFLoader();const [commander,troop,crawler]=await Promise.all([loader.loadAsync('commander.glb'),loader.loadAsync('troop.glb'),loader.loadAsync('crawler.glb')]);
  this.heroModel=commander.scene;commander.scene.scale.setScalar(.88);this.hero.add(commander.scene);
  commander.scene.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material){o.material.roughness=.72;o.material.metalness=.15;}}});
  this.mixer=new T.AnimationMixer(commander.scene);
  for(const clip of commander.animations){if(clip.name==='Idle')this.idle=this.mixer.clipAction(clip);if(clip.name==='Run')this.run=this.mixer.clipAction(clip);}
  this.idle?.play();
  const instantiate=(gltf:any,capacity:number)=>{
   gltf.scene.updateMatrixWorld(true);let mesh:any;gltf.scene.traverse((o:any)=>{if(o.isMesh&&!mesh)mesh=o;});
   const geom=mesh.geometry.clone();geom.applyMatrix4(mesh.matrixWorld);const mat=mesh.material.clone();mat.roughness=.7;mat.metalness=.17;
   const instances=new T.InstancedMesh(geom,mat,capacity);instances.instanceMatrix.setUsage(T.DynamicDrawUsage);instances.castShadow=true;instances.receiveShadow=true;instances.frustumCulled=false;instances.count=0;this.scene.add(instances);return instances;
  };
  this.allies=instantiate(troop,64);this.enemies=instantiate(crawler,16);
 }
 createGate(text:string,color:number,halfWidth=.832):GateView{
  const g=new T.Group(),metal=material(0x8b7e60,.65,.4),black=material(0x182e33,.4,.55),light=glow(color,1.8);
  for(const side of [-1,1]){
   box(g,[.28,.23,.48],[side*(halfWidth+.13),.12,0],metal);
   box(g,[.18,2.25,.26],[side*(halfWidth+.13),1.3,0],black);
   box(g,[.045,2.12,.04],[side*(halfWidth+.015),1.33,.16],light);
   box(g,[.30,.25,.38],[side*(halfWidth+.13),2.5,0],metal);
  }
  box(g,[halfWidth*2+.5,.18,.30],[0,2.65,0],metal);
  const plane=new T.Mesh(new T.PlaneGeometry(halfWidth*2,2.5),new T.MeshBasicMaterial({color,transparent:true,opacity:.065,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending}));plane.position.y=1.25;g.add(plane);
  const colorString='#'+new T.Color(color).getHexString();const label=textSprite(text,colorString,Math.min(2.0,halfWidth*2+.25));label.position.set(0,3.12,.3);g.add(label);
  this.scene.add(g);return {group:g,plane,label};
 }
 setup(core:BattleCore){
  for(const g of [...this.gates,...this.siegeGates])if(g)this.dispose(g.group);
  for(const g of this.obstacles)if(g)this.dispose(g);this.gates=[];this.siegeGates=[];this.obstacles=[];
  const entries=core.encounters();
  for(let i=0;i<entries.length;i+=9){
   if(entries[i]===0){const op=entries[i+4],value=entries[i+5];this.gates[i/9]=this.createGate(op===1?'×'+value:op===2?'ϟ'+value:'+'+value,op===2?0x79bfff:op===1?0x82efc1:0x9befdf);}
   if(entries[i]===2){const g=new T.Group(),m=material(0x63352c,.6,.6);box(g,[1.66,.75,.75],[0,.38,0],m);for(const x of [-.6,0,.6]){const tooth=new T.Mesh(new T.ConeGeometry(.23,.8,4),material(0xc68a59,.65,.4));tooth.position.set(x,1.0,0);g.add(tooth);}const label=textSprite('−'+entries[i+5],'#ffb080',1.65);label.position.y=1.8;g.add(label);this.scene.add(g);this.obstacles[i/9]=g;}
  }
  for(const value of [2,3]){const g=this.createGate('×'+value,0x85ecc1,1.69);g.group.visible=false;this.siegeGates.push(g);}
  this.shotAges.fill(100);this.sparkLife.fill(0);this.hasRun=false;
 }
 dispose(object:T.Object3D){this.scene.remove(object);object.traverse((m:any)=>{m.geometry?.dispose();if(m.material){const mats=Array.isArray(m.material)?m.material:[m.material];for(const mat of mats){mat.map?.dispose();mat.dispose();}}});}
 burst(x:number,y:number,z:number,count=20){for(let j=0;j<count;j++){const i=this.sparkCursor++%140;this.sparkPositions.set([x,y,z],i*3);this.sparkVelocity.set([(Math.random()-.5)*5,Math.random()*4+1,(Math.random()-.5)*5],i*3);this.sparkLife[i]=.4+Math.random()*.45;}}
 shoot(from:T.Vector3,to:T.Vector3){const i=this.shotIndex++%48;this.shotPositions.set([from.x,from.y,from.z,to.x,to.y,to.z],i*6);this.shotAges[i]=0;}
 setInstance(mesh:T.InstancedMesh,i:number,x:number,y:number,z:number,scale:number,rotation=Math.PI){this.dummy.position.set(x,y,z);this.dummy.rotation.set(0,rotation,0);this.dummy.scale.setScalar(scale);this.dummy.updateMatrix();mesh.setMatrixAt(i,this.dummy.matrix);}
 update(core:BattleCore,dt:number,intro:boolean,paused:boolean){
  this.time+=dt;this.intro=intro;const s=core.state(),phase=s[0],running=phase===1&&!intro, siege=phase>=2;
  const animationRun=running&&!paused;
  if(animationRun!==this.hasRun){this.idle?.stop();this.run?.stop();(animationRun?this.run:this.idle)?.reset().play();this.hasRun=animationRun;}
  if(!paused)this.mixer?.update(dt*(animationRun?1.15:1));
  this.hero.position.x=intro?(this.camera.aspect>1?1.65:0):s[16]*LANE;this.hero.position.z=ORIGIN;
  if(this.heroModel)this.heroModel.rotation.y=intro?-.30:Math.PI;
  this.halo.visible=!intro;this.halo.rotation.y=this.time*.13;
  this.shield.visible=s[8]>0&&!intro;this.shield.rotation.y=this.time*.8;
  this.shield.scale.setScalar(s[18]===0?1:1.03+.05*Math.sin(this.time*12));
  const tall=this.camera.aspect<.9;
  if(this.heroModel)this.heroModel.scale.setScalar(intro&&tall?.75:.88);
  const desired=intro?(tall?new T.Vector3(1.9,2.8,8):new T.Vector3(4.4,3.3,7.0)):(tall?new T.Vector3(1.3,17.6,16.7):new T.Vector3(2.2,13.8,14.7));
  const target=intro?(tall?new T.Vector3(0,-.65,2):new T.Vector3(-.25,1.05,2)):(tall?new T.Vector3(0,0,-4.5):new T.Vector3(0,0,-4));
  this.currentCamera.lerp(desired,1-Math.exp(-dt*3));this.cameraTarget.lerp(target,1-Math.exp(-dt*3));this.camera.position.copy(this.currentCamera);this.camera.lookAt(this.cameraTarget);
  const scroll=running?(s[1]*SPEED)%9:0;for(let i=0;i<this.tiles.length;i++)this.tiles[i].position.z=13-i*9+scroll;
  const entries=core.encounters();for(let i=0;i<entries.length;i+=9){const visible=!intro&&phase===1&&!entries[i+6],z=ORIGIN-(entries[i+1]-s[1])*SPEED;
   const gate=this.gates[i/9];if(gate){gate.group.visible=visible&&z>-35&&z<6;gate.group.position.set(entries[i+2]*LANE,0,z);(gate.plane.material as T.MeshBasicMaterial).opacity=.07+.025*Math.sin(this.time*4);}
   const obstacle=this.obstacles[i/9];if(obstacle){obstacle.visible=visible&&z>-35&&z<6;obstacle.position.set(entries[i+2]*LANE,0,z);}
  }
  const sg=core.gates();this.siegeGates.forEach((g,i)=>{g.group.visible=!intro&&siege;if(i*5<sg.length)g.group.position.set(sg[i*5]*LANE,0,ORIGIN-sg[i*5+1]*1.8);});
  this.boss.visible=!intro;this.boss.position.set(0,0,siege||phase===3||phase===4?-12.4:ORIGIN-(32-s[1])*SPEED-14.4);this.coreCrystal.rotation.y=this.time*.6;this.coreCrystal.rotation.z=Math.sin(this.time)*.12;
  if(this.allies&&this.enemies){
   const enemies=core.enemies();const enemyCount=intro?0:Math.min(12,enemies.length/5*3);let ei=0;
   for(let i=0;i<enemies.length&&ei<enemyCount;i+=5){for(let j=0;j<3&&ei<enemyCount;j++){this.setInstance(this.enemies,ei++,enemies[i]*LANE+(j-1)*.54,0,ORIGIN-enemies[i+1]*SPEED-(j%2)*.4,.64,0);}}
   this.enemies.count=ei;this.enemies.instanceMatrix.needsUpdate=true;
   let ai=0;const capacity=49-ei;
   if(siege){const packets=core.packets(),total=Math.max(1,s[12]),wanted=Math.min(capacity,total);let prefix=0;
    for(let i=0;i<packets.length;i+=4){prefix+=packets[i+2];const until=Math.round(prefix*wanted/total);while(ai<until&&ai<wanted){this.setInstance(this.allies,ai,packets[i]*LANE+(ai%3-1)*.23,0,ORIGIN-packets[i+1]*1.8+(ai%2)*.15,.24);ai++;}}
   }else if(!intro){const count=Math.min(capacity,s[2]);for(let i=0;i<count;i++){const x=Math.max(-2.9,Math.min(2.9,s[16]*LANE+(i%7-3)*.49));this.setInstance(this.allies,ai++,x,Math.abs(Math.sin(this.time*12+i))*.035,ORIGIN+.80+Math.floor(i/7)*.54,.29);}}
   this.allies.count=ai;this.allies.instanceMatrix.needsUpdate=true;
   if(running&&!paused&&this.time-this.lastShot>.12){const enemyIndex=Array.from({length:enemies.length/5},(_,i)=>i*5).find(i=>enemies[i+1]<=3&&Math.abs(s[16]-enemies[i])<.8);
    if(enemyIndex!==undefined){const e=enemyIndex;this.shoot(new T.Vector3(s[16]*LANE+.40,1.10,ORIGIN-.3),new T.Vector3(enemies[e]*LANE+(Math.random()-.5)*.5,.45,ORIGIN-enemies[e+1]*SPEED));this.lastShot=this.time;}
   }
  }
  for(let i=0;i<48;i++){this.shotAges[i]+=dt;if(this.shotAges[i]>.08)this.shotPositions.fill(0,i*6,i*6+6);}this.shotGeometry.attributes.position.needsUpdate=true;
  for(let i=0;i<140;i++){this.sparkLife[i]-=dt;if(this.sparkLife[i]>0){this.sparkVelocity[i*3+1]-=dt*5;for(let k=0;k<3;k++)this.sparkPositions[i*3+k]+=this.sparkVelocity[i*3+k]*dt;}else this.sparkPositions[i*3+1]=-40;}this.sparkGeometry.attributes.position.needsUpdate=true;
  this.renderer.render(this.scene,this.camera);
 }
}
