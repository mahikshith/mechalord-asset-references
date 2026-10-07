import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RobotFormation} from './combat-visuals';
import {EnemyArchetypes} from './enemy-archetypes';
import {RenderQuality,createDeckTexture} from './render-quality';
import {enhanceVillain,VILLAIN_LOOKS,villainClock} from './villain-look';
import type {Target} from './contract';
import {createSkyreaver,type SkyreaverMode} from './skyreaver';
import {HOSTILE_MECHS,loadHostileMech} from './hostile-mechs';
import {ArsenalVisuals} from './arsenal-visuals';
import {BakedMechCrowd} from './baked-mech-crowd';
import {bakeTrooper,trooperAtlas,TROOPER_CLASSES} from './hero-trooper';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {TGALoader} from 'three/addons/loaders/TGALoader.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';

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
async function mechs(){
 const pose=new URLSearchParams(location.search).get('pose')??'';
 camera.position.set(0,4.4,14.5);camera.lookAt(0,1.3,0);
 const loaded=await Promise.all(HOSTILE_MECHS.map(n=>loadHostileMech(n)));const mixers:T.AnimationMixer[]=[];const names:Record<string,string[]>={};
 loaded.forEach(({model,animations},i)=>{const wrap=new T.Group();wrap.add(model);wrap.position.set(-5.1+i*3.4,0,0);wrap.rotation.y=-.35+i*.18;scene.add(wrap);enhanceVillain(wrap,VILLAIN_LOOKS.elite);
  let meshes=0,skinned=0,verts=0,bones=0;model.traverse((o:any)=>{if(o.isMesh){meshes++;verts+=o.geometry.getAttribute('position').count;if(o.isSkinnedMesh){skinned++;bones=o.skeleton.bones.length;}}});names[HOSTILE_MECHS[i]]=[`meshes ${meshes} skinned ${skinned} verts ${verts} bones ${bones}`,...animations.filter(a=>a.name.startsWith('RobotArmature|')).map(a=>a.name.slice(14)+':'+a.duration.toFixed(2))];const mixer=new T.AnimationMixer(model);const clip=animations.find(a=>pose&&a.name.toLowerCase().includes(pose))??animations.find(a=>/idle/i.test(a.name))??animations[0];if(clip)mixer.clipAction(clip).play();mixers.push(mixer);label(HOSTILE_MECHS[i].toUpperCase(),-5.1+i*3.4,2.6);});
 (globalThis as any).probe=()=>names;let last=0;tick=t=>{const dt=t-last;last=t;mixers.forEach(m=>m.update(dt));};
}
async function weapons(){
 // One weapon per page (?w=0..4): current model left, detailed model right, barrels toward the viewer's right.
 const names=['cannons','guided','rail','lance','storm'],w=Math.min(4,+(new URLSearchParams(location.search).get('w')??0)),n=names[w];
 const lift:Record<string,number>={cannons:1.42,guided:2.08,rail:1.8,lance:1.42,storm:1.9};
 camera.position.set(0,2.4,n==='cannons'?6.4:5.2);camera.lookAt(0,.95,0);
 for(const [k,detail] of [[0,false],[1,true]] as const){const hero=new T.Group(),boss=new T.Group();const a:any=new ArsenalVisuals(hero,boss,detail);const g:T.Group=a[n];
  const holder=new T.Group();holder.position.set(k?1.55:-1.55,1-lift[n]*1.3+(n==='lance'?0:0),0);holder.rotation.y=-Math.PI/2-.45;g.visible=true;if(n==='lance')g.position.set(0,lift[n],-.2);holder.add(g);holder.scale.setScalar(1.3);scene.add(holder);holder.updateMatrixWorld(true);const box=new T.Box3().setFromObject(g),c=box.getCenter(new T.Vector3());holder.position.x+=(k?1.55:-1.55)-c.x;holder.position.z-=c.z;holder.position.y+=1-c.y;for(const glowName of ['powerGlow'])void glowName;
  label(k?'DETAILED':'NOW',k?1.55:-1.55,1.7);}
}
async function crowd(){
 camera.position.set(0,9,15);camera.lookAt(0,0,-4);
 const stan=await loadHostileMech('Stan'),leela=await loadHostileMech('Leela');
 const clip=(m:{animations:T.AnimationClip[]},n:string)=>(m.animations.find(a=>a.name==='RobotArmature|'+n)??m.animations.find(a=>a.name===n))!;
 const mat=(m:T.Object3D)=>{let map:T.Texture|null=null;m.traverse((o:any)=>{if(o.isMesh)map=o.material.map;});return new T.MeshStandardMaterial({map,metalness:.55,roughness:.48});};
 const t0=performance.now(),runners=new BakedMechCrowd(scene,stan.model,[{clip:clip(stan,'Run'),frames:16}],60,mat(stan.model));enhanceVillain([runners.mesh.material as T.Material],VILLAIN_LOOKS.grunt);
 const heavy=new BakedMechCrowd(scene,leela.model,[{clip:clip(leela,'Walk'),frames:16},{clip:clip(leela,'Shoot'),frames:12}],8,mat(leela.model));enhanceVillain([heavy.mesh.material as T.Material],VILLAIN_LOOKS.elite);
 const bakeMs=performance.now()-t0;(globalThis as any).probe=()=>({bakeMs:Math.round(bakeMs),stanH:runners.height.toFixed(2)});
 tick=t=>{runners.begin();for(let r=0;r<5;r++)for(let c=0;c<8;c++)runners.add(-3.3+c*.95,0,-2-r*2.05+((t*1.5)%2.05),0,1,0,t*1.0+((r*8+c)*.37)%1,(r*8+c)%13===0&&Math.sin(t*8)>0?1:0);runners.end();
  heavy.begin();heavy.add(-2.6,0,-14,0,1.6,1,t*1.6);heavy.add(2.6,0,-14,0,1.6,0,t);heavy.end();};
}
async function heroes(){
 camera.position.set(0,3.6,10.5);camera.lookAt(0,1,0);
 const files=['Mech','Mech-4UvIHxnoSR','Mech-D5wW2jDO42','Mech-o3Ps8z8ByP','Astronaut','Astronaut-0D54W8yfrA','Astronaut-OgeSH89Nmx'];const loader=new GLTFLoader();const mixers:T.AnimationMixer[]=[];const info:Record<string,string>={};
 const all=await Promise.all(files.map(f=>loader.loadAsync('../_review/heroes/'+f+'.glb')));
 all.forEach((g,i)=>{const m=g.scene;const box=new T.Box3().setFromObject(m),h=box.max.y-box.min.y,k=(i<4?2.2:1.6)/h;m.scale.setScalar(k);m.position.set(-6.6+i*2.2,-box.min.y*k,i<4?0:-2.5);m.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;}});scene.add(m);
  info[files[i]]=g.animations.map(a=>a.name).join(',');const mx=new T.AnimationMixer(m);const c=g.animations.find(a=>/run/i.test(a.name))??g.animations[0];if(c)mx.clipAction(c).play();mixers.push(mx);});
 (globalThis as any).probe=()=>info;let last=0;tick=t=>{const dt=t-last;last=t;mixers.forEach(m=>m.update(dt));};
}
async function soldier(){
 camera.position.set(0,2.2,6.5);camera.lookAt(0,1,0);
 const base='../_review/soldier/',fbx=await new FBXLoader().loadAsync(base+'Mesh.fbx');const info:any={anims:fbx.animations.map(a=>a.name),meshes:[] as string[],bones:0};
 fbx.traverse((o:any)=>{if(o.isMesh)info.meshes.push(o.name+(o.isSkinnedMesh?'*':'')+':'+o.geometry.getAttribute('position').count);if(o.isBone)info.bones++;});
 const skins=['FederalSoldierSkin','MilitarySkin','EvilSkin'],tga=new TGALoader(),tl=new T.TextureLoader();
 const mats=await Promise.all(skins.map(async k=>{const map=await tga.loadAsync(base+k+'_Albedo.tga');map.colorSpace=T.SRGBColorSpace;const nm=await tl.loadAsync(base+k+'_NormalMap.png');const em=await tl.loadAsync(base+k+'_Emission.png');em.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map,normalMap:nm,emissiveMap:em,emissive:new T.Color(1,1,1),metalness:.6,roughness:.45});}));
 const box=new T.Box3().setFromObject(fbx),k=1.9/(box.max.y-box.min.y);
 for(let i=0;i<3;i++){const c=i===0?fbx:(await new FBXLoader().loadAsync(base+'Mesh.fbx'));c.scale.setScalar(k);c.position.set(-1.6+i*1.6,-box.min.y*k,0);c.traverse((o:any)=>{if(o.isMesh){o.material=mats[i];o.castShadow=true;}});scene.add(c);}
 (globalThis as any).probe=()=>info;
}
/** Tooling: FBX -> compact GLB keeping only the clips the game bakes. ?set=export&name=Stan */
async function exportMech(){
 const name=new URLSearchParams(location.search).get('name')!;const fbx=await new FBXLoader().loadAsync('mechs/'+name+'.fbx');
 const keep=['Walk','Run','Shoot'].map(n=>fbx.animations.find(a=>a.name==='RobotArmature|'+n)).filter(Boolean) as T.AnimationClip[];keep.forEach(c=>c.name=c.name.replace('RobotArmature|',''));
 fbx.traverse((o:any)=>{if(o.isMesh)o.material=new T.MeshStandardMaterial({color:0xffffff});});
 const glb=await new GLTFExporter().parseAsync(fbx,{binary:true,animations:keep,onlyVisible:false}) as ArrayBuffer;
 const bytes=new Uint8Array(glb);let bin='';for(let i=0;i<bytes.length;i+=32768)bin+=String.fromCharCode(...bytes.subarray(i,i+32768));(globalThis as any).probe=()=>btoa(bin);
}
async function troopers(){
 const clipParam=+(new URLSearchParams(location.search).get('clip')??0);
 camera.position.set(0,2.4,-5.6);camera.lookAt(0,.95,0);
 const {map,emissiveMap}=trooperAtlas();const crowds=[0,1,2].map(k=>{const m=new T.MeshStandardMaterial({map,emissiveMap,emissive:new T.Color(1,1,1),emissiveIntensity:1.8,metalness:.42,roughness:.46,vertexColors:true});return new BakedMechCrowd(scene,bakeTrooper(k as 0|1|2),8,m);});
 TROOPER_CLASSES.forEach((n,i)=>label(n.split(' ')[0].toUpperCase(),-2.4+i*2.4,-1.4));
 tick=t=>{crowds.forEach((c,i)=>{c.begin();c.add(-2.4+i*2.4,0,0,Math.PI+.45,1,clipParam,t*(clipParam===0?1.2:clipParam===1?.3:1.5));c.end();});};
 (globalThis as any).probe=()=>crowds.map(c=>c.mesh.geometry.getAttribute('position').count);
}
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);quality.resize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
await (set==='bosses'?bosses():set==='skyreaver'?skyreaver():set==='mechs'?mechs():set==='weapons'?weapons():set==='crowd'?crowd():set==='heroes'?heroes():set==='soldier'?soldier():set==='export'?exportMech():set==='troopers'?troopers():troops());
const start=performance.now();renderer.setAnimationLoop(()=>{const t=(performance.now()-start)/1000;villainClock.value=t;tick(t);quality.render();});
(globalThis as any).villainsReady=true;
