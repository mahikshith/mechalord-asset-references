import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RobotFormation} from './combat-visuals';
import {EnemyArchetypes} from './enemy-archetypes';
import {RenderQuality,createDeckTexture} from './render-quality';
import {enhanceVillain,VILLAIN_LOOKS,villainClock} from './villain-look';
import type {Target} from './contract';
import {createSkyreaver,type SkyreaverMode} from './skyreaver';

/** Internal asset review: current villains (left) vs the upgraded pass (right),
 * under the same lights, deck and post-processing as the game. ?set=troops|bosses */
const set=new URLSearchParams(location.search).get('set')??'troops';
const canvas=document.querySelector('canvas')!,renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene(),camera=new T.PerspectiveCamera(30,1,.1,200);scene.fog=new T.Fog(0xadc5c7,65,120);
scene.add(new T.HemisphereLight(0xecf9ff,0x806444,2.0),new T.AmbientLight(0xffffff,.3));
const sun=new T.DirectionalLight(0xffedcb,3.2);sun.position.set(-14,30,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:80});sun.shadow.normalBias=.06;scene.add(sun);
const deckMap=createDeckTexture();deckMap.repeat.set(2,3);const deck=new T.Mesh(new T.PlaneGeometry(40,40).rotateX(-Math.PI/2),new T.MeshStandardMaterial({color:0x344655,roughness:.86,metalness:.14,map:deckMap}));deck.receiveShadow=true;scene.add(deck);
const quality=new RenderQuality(renderer,scene,camera);quality.setSky(0xb7d2d4);
const label=(text:string,x:number,z:number)=>{const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d')!;g.fillStyle='#152c36e0';g.roundRect(4,4,504,88,20);g.fill();g.fillStyle='#ffe7c2';g.font='900 52px Segoe UI';g.textAlign='center';g.fillText(text,256,66);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map:t,depthTest:false}));s.scale.set(3.2,.6,1);s.position.set(x,.2,z);s.renderOrder=20;scene.add(s);};
const target=(id:number,archetype:number,x:number,z:number):Target=>({id,archetype,kind:'enemy',x,z,hp:1,maxHp:1,value:0,op:0,size:1,depth:1,hit:0,variant:0,fireState:'tracking',aimX:x,charge:0,role:'grunt',guidedArmor:false,stunTime:0,ventOpen:false,ventTime:0,shieldHp:3,shieldMax:3,skillState:0,blockFlash:0});
let tick=(_t:number)=>{};
async function troops(){
 camera.position.set(0,9.5,13);camera.lookAt(0,1,0);
 const before=new RobotFormation(scene,8,'classic'),after=new RobotFormation(scene,8,'v2');enhanceVillain(after.materials(),VILLAIN_LOOKS.grunt);
 const archBefore=new EnemyArchetypes(scene),archAfter=new EnemyArchetypes(scene);enhanceVillain(archAfter.root,VILLAIN_LOOKS.elite);
 label('NOW',-4.5,4.2);label('UPGRADED',4.5,4.2);
 tick=t=>{for(const [f,x0] of [[before,-4.5],[after,4.5]] as const){f.begin();for(let i=0;i<3;i++)f.add(x0-1.3+i*1.3,2.2,1.02,0,false,t*.6+i,{id:i+1,dt:1/60,velocityX:0,velocityZ:1.2,aimYaw:0});f.end();}
  for(const [a,x0] of [[archBefore,-4.5],[archAfter,4.5]] as const){a.begin();[1,2,3,4].forEach((k,i)=>a.add(target(10+k,k,x0-2.4+i*1.6,1.2),t,0,.6,0));a.end();}};
}
async function bosses(){
 camera.position.set(0,8.5,17);camera.lookAt(0,2.6,0);
 const loader=new GLTFLoader(),[reaver,tyrant,reaver2,tyrant2]=await Promise.all(['cinder-reaver.glb','forge-tyrant.glb','cinder-reaver.glb','forge-tyrant.glb'].map(f=>loader.loadAsync(f)));
 const styled=new Set<T.Material>();for(const a of [reaver,tyrant,reaver2,tyrant2])a.scene.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material])if(!styled.has(m)){styled.add(m);m.color.multiplyScalar(2.2);m.metalness=.20;m.roughness=.64;}}});

 const place=(o:T.Object3D,x:number,z:number,s:number)=>{o.position.set(x,0,z);o.rotation.y=Math.PI;o.scale.setScalar(s);scene.add(o);return o;};
 const rb=place(reaver.scene,-6.6,2,1),ra=place(reaver2.scene,2.4,2,1),tb=place(tyrant.scene,-3.2,-2,1.4),ta=place(tyrant2.scene,5.8,-2,1.4);
 if(!location.search.includes('nolook')){enhanceVillain(ra,VILLAIN_LOOKS.elite);enhanceVillain(ta,VILLAIN_LOOKS.tyrant);}
 label('NOW',-4.5,5.5);label('UPGRADED',4.5,5.5);
 tick=t=>{for(const o of [rb,ra,tb,ta])o.rotation.y=Math.PI+Math.sin(t*.4)*.35;};(globalThis as any).probe=()=>[rb,ra,tb,ta].map(o=>{o.updateMatrixWorld(true);const b=new T.Box3().setFromObject(o);let core:any;o.traverse((n:any)=>{if(/core|chest|Head/i.test(n.name)&&!core)core=n;});const p=core?core.getWorldPosition(new T.Vector3()):null;return [o.position.x,core?.name,p?.z.toFixed(2),b.min.z.toFixed(2),b.max.z.toFixed(2)];});
}
async function skyreaver(){
 camera.position.set(0,4.4,13.5);camera.lookAt(0,1.9,0);
 const modes:SkyreaverMode[]=['hover','dash','fire'],units=modes.map((m,i)=>{const u=createSkyreaver();u.root.position.set(-4+i*4,0,0);u.root.rotation.y=i===1?-.5:i===2?.35:.15;scene.add(u.root);enhanceVillain(u.root,VILLAIN_LOOKS.elite);label(m==='hover'?'HOVER':m==='dash'?'BOOST DASH':'FIRING',-4+i*4,3.2);return u;});
 let last=0;tick=t=>{const dt=t-last;last=t;units.forEach((u,i)=>u.update(t+i*.7,modes[i],dt));};
}
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);quality.resize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
await (set==='bosses'?bosses():set==='skyreaver'?skyreaver():troops());
const start=performance.now();renderer.setAnimationLoop(()=>{const t=(performance.now()-start)/1000;villainClock.value=t;tick(t);quality.render();});
(globalThis as any).villainsReady=true;
