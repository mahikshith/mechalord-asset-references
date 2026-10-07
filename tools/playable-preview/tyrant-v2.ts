import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {enhanceVillain,VILLAIN_LOOKS,villainClock} from './villain-look';

/** Forge Tyrant Mk II: the CC0 Quaternius heavy mech (Mike, assets/originals/
 * quaternius-animated-mech-pack) scaled to boss size in an obsidian + molten livery,
 * with smooth lathe-turned add-ons: twin back boosters, shoulder missile pods,
 * rotary arm cannons, a chest reactor and an angry V-eyed face. Keeps the donor's
 * real skeletal animation (Idle/Walk/Run/Shoot/Punch/Jump/Hit/Death/SwordSlash). */
export type TyrantMood='calm'|'charging'|'rage';

function tyrantLivery(image:CanvasImageSource&{width:number;height:number}){
 const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const g=c.getContext('2d',{willReadFrequently:true})!;g.drawImage(image,0,0);
 const e=document.createElement('canvas');e.width=c.width;e.height=c.height;const eg=e.getContext('2d')!;const em=eg.createImageData(c.width,c.height);
 const d=g.getImageData(0,0,c.width,c.height),p=d.data,col=new T.Color(),hsl={h:0,s:0,l:0};
 for(let i=0;i<p.length;i+=4){col.setRGB(p[i]/255,p[i+1]/255,p[i+2]/255);col.getHSL(hsl);const h=hsl.h*360;let glow=0;
  if(hsl.s>.12&&h>75&&h<250)col.setHSL(.62,.18,Math.min(.2,hsl.l*.4));                 // teal armour -> obsidian
  else if(hsl.s<.16&&hsl.l>.45)col.setHSL(.6,.06,hsl.l*.38);                            // white panels -> dark steel
  else if(hsl.s>.35&&h>=18&&h<=45){col.setHSL(.04,.7,.22);glow=.55;}                     // orange trim -> dim molten seams
  p[i]=col.r*255;p[i+1]=col.g*255;p[i+2]=col.b*255;em.data[i]=255*glow;em.data[i+1]=90*glow;em.data[i+2]=20*glow;em.data[i+3]=255;}
 g.putImageData(d,0,0);eg.putImageData(em,0,0);
 const tex=(cv:HTMLCanvasElement)=>{const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;t.flipY=true;t.anisotropy=8;return t;};
 return {map:tex(c),emissiveMap:tex(e)};
}

export async function buildTyrantV2(base='mechs/'){
 const [gltf,img]=await Promise.all([new GLTFLoader().loadAsync(base+'tyrant-v2-base.glb'),new T.ImageLoader().loadAsync(base+'Mike_Texture.png')]);
 const root=new T.Group(),model=gltf.scene;root.add(model);
 const {map,emissiveMap}=tyrantLivery(img);
 const hull=new T.MeshStandardMaterial({map,emissiveMap,emissive:new T.Color(1,1,1),emissiveIntensity:1.1,metalness:.6,roughness:.42});
 model.traverse((o:any)=>{if(o.isMesh){o.material=hull;o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;}});
 const box=new T.Box3().setFromObject(model),k=6/(box.max.y-box.min.y);model.scale.setScalar(k);model.position.y=-box.min.y*k;model.updateMatrixWorld(true);
 const steel=new T.MeshStandardMaterial({color:0x2a2f37,metalness:.85,roughness:.32}),dark=new T.MeshStandardMaterial({color:0x14171c,metalness:.7,roughness:.5});
 const molten=new T.MeshStandardMaterial({color:0x2a0e04,emissive:new T.Color(1,.38,.08),emissiveIntensity:2.2,metalness:.3,roughness:.4});
 const podShell=new T.MeshStandardMaterial({color:0x5b636d,metalness:.75,roughness:.35});
 const flameMat=new T.MeshBasicMaterial({color:new T.Color(2.6,1.1,.35),transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
 const eyeMat=new T.MeshBasicMaterial({color:new T.Color(3.2,.25,.15),toneMapped:false});
 const lathe=(pts:number[][],seg=40)=>new T.LatheGeometry(pts.map(([r,y])=>new T.Vector2(r,y)),seg);
 const bone=(n:string)=>model.getObjectByName(n)!;
 /** Attach in world units (the donor bones carry the cm->unit scale). */
 // Attach with a world-space offset from the bone and world-aligned orientation at rest (bones carry odd rotations/scales).
 const attach=(b:T.Object3D,obj:T.Object3D,at:[number,number,number],size=1)=>{b.updateWorldMatrix(true,false);const ws=b.getWorldScale(new T.Vector3()).x,wp=b.getWorldPosition(new T.Vector3()),wq=b.getWorldQuaternion(new T.Quaternion());const local=obj.quaternion.clone();obj.quaternion.copy(wq.invert()).multiply(local);obj.scale.multiplyScalar(size/ws);obj.position.copy(b.worldToLocal(wp.add(new T.Vector3(...at))));b.add(obj);return obj;};
 enhanceVillain([hull,steel,dark,podShell],{...VILLAIN_LOOKS.tyrant,wear:1.6,rimStrength:.12,glow:1});
 const parts:{flames:T.Mesh[];eyes:T.Mesh[];barrels:T.Object3D[];pods:T.Object3D[];core?:T.Mesh;light:T.PointLight}={flames:[],eyes:[],barrels:[],pods:[],light:new T.PointLight(0xff6a20,30,9,2)};
 // Back boosters on the chest: smooth turned nozzles, molten throat, live flame.
 for(const s of [-1,1]){const g=new T.Group();g.name=s<0?'Booster_L':'Booster_R';
  const shell=new T.Mesh(lathe([[.0,.9],[.26,.88],[.34,.6],[.36,.1],[.44,-.05],[.5,-.3],[.46,-.34],[.3,-.12],[.0,-.1]]),steel);shell.castShadow=true;g.add(shell);
  g.add(new T.Mesh(new T.TorusGeometry(.36,.05,12,40).rotateX(Math.PI/2),dark).translateY(.4));
  const throat=new T.Mesh(new T.CircleGeometry(.4,32).rotateX(Math.PI/2),molten);throat.position.y=-.3;g.add(throat);
  const flame=new T.Mesh(new T.ConeGeometry(.42,1.8,24,1,true).rotateX(Math.PI).translate(0,-1.2,0),flameMat);parts.flames.push(flame);g.add(flame);
  g.rotation.set(-.45,0,s*.18);attach(bone('Chest'),g,[s*.9,.6,-1.0],1);}
 // Shoulder missile pods: rounded housings, six warheads each, hinge lids.
 for(const s of [-1,1]){const pod=new T.Group();pod.name=s<0?'Pod_L':'Pod_R';
  const body=new T.Mesh(new T.CapsuleGeometry(.3,.6,8,24).rotateX(Math.PI/2),podShell);body.castShadow=true;pod.add(body);
  for(let r=0;r<2;r++)for(let c=0;c<3;c++){const tip=new T.Mesh(lathe([[0,.18],[.07,.1],[.09,0],[.09,-.1]],16).rotateX(Math.PI/2),molten);tip.position.set(-.2+c*.2,-.1+r*.2,.6);pod.add(tip);}
  pod.add(new T.Mesh(new T.TorusGeometry(.43,.04,10,32),dark).translateZ(.42));parts.pods.push(pod);attach(bone('Chest'),pod,[s*1.05,1.35,-.35],1);}
 // Rotary arm cannons on the forearms.
 for(const s of [-1,1]){const gun=new T.Group();gun.name=s<0?'Barrel_L':'Barrel_R';const spin=new T.Group();gun.add(spin);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2,b=new T.Mesh(new T.CylinderGeometry(.07,.07,1.6,16).rotateX(Math.PI/2),steel);b.position.set(Math.cos(a)*.17,Math.sin(a)*.17,.8);spin.add(b);}
  for(const z of [.25,1.0,1.55])spin.add(new T.Mesh(new T.TorusGeometry(.26,.05,10,32),z>1.4?molten:dark).translateZ(z));
  gun.add(new T.Mesh(new T.CylinderGeometry(.34,.38,.6,32).rotateX(Math.PI/2),dark));parts.barrels.push(spin);attach(bone('Chest'),gun,[s*1.6,.2,.45],1);}
 // Chest reactor and the face: V-shaped angry eyes under a heavy brow.
 const core=new T.Mesh(new T.SphereGeometry(.3,32,20),new T.MeshStandardMaterial({color:0x2a0e04,emissive:new T.Color(1,.42,.1),emissiveIntensity:1.3,roughness:.3}));parts.core=core;attach(bone('Chest'),core,[0,.4,.75],1);
 attach(bone('Chest'),new T.Mesh(new T.TorusGeometry(.42,.07,12,40),steel),[0,.4,.72],1);
 const head=bone('Head');
 for(const s of [-1,1]){const eye=new T.Mesh(new T.CapsuleGeometry(.05,.28,6,12).rotateZ(Math.PI/2+s*.42),eyeMat);parts.eyes.push(eye);attach(head,eye,[s*.18,.32,.55],1);
  attach(head,new T.Mesh(new T.CapsuleGeometry(.06,.36,6,12).rotateZ(Math.PI/2+s*.5),dark),[s*.2,.46,.56],1);}
 attach(head,new T.Mesh(lathe([[0,.25],[.08,.2],[.1,0]],12),molten),[0,.75,.1],1).rotation.x=-.4;
  // Strong legs: thick turned greaves and knee guards wrapped around the donor's blade legs, oriented bone to bone.
 const greave=(from:string,to:string,r:number)=>{const a=bone(from),b=bone(to);a.updateWorldMatrix(true,false);b.updateWorldMatrix(true,false);const pa=a.getWorldPosition(new T.Vector3()),pb=b.getWorldPosition(new T.Vector3()),len=pa.distanceTo(pb);
  const g=new T.Group();const shell=new T.Mesh(lathe([[r*.7,len*.5],[r,len*.35],[r*1.05,-len*.2],[r*.85,-len*.5]],32),steel);shell.castShadow=true;g.add(shell);
  g.add(new T.Mesh(new T.TorusGeometry(r*1.02,r*.12,10,32).rotateX(Math.PI/2),molten).translateY(len*.05));
  g.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),pa.clone().sub(pb).normalize());attach(a,g,pb.clone().add(pa).multiplyScalar(.5).sub(pa).toArray() as [number,number,number],1);};
 // Thicken the donor's blade legs along their own bone axis (Blender bones run along +Y): heavy load-bearing legs.
 for(const sd of ['L','R'])for(const b of ['UpperLeg'+sd,'LowerLeg'+sd,'Foot'+sd])bone(b).scale.multiply(new T.Vector3(1.75,1,1.75));
 // Booster smoke: soft sprites that billow out behind the flames and cool to grey.
 const smokeTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d')!;const r=g.createRadialGradient(32,32,2,32,32,30);r.addColorStop(0,'rgba(255,255,255,.9)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new T.CanvasTexture(c);})();
 const smoke:{s:T.Sprite;v:T.Vector3;life:number}[]=[];for(let i=0;i<40;i++){const sp=new T.Sprite(new T.SpriteMaterial({map:smokeTex,color:0x555555,transparent:true,depthWrite:false,opacity:0}));sp.visible=false;root.add(sp);smoke.push({s:sp,v:new T.Vector3(),life:0});}
 let smokeI=0;const nozzle=new T.Vector3();
 // Core laser: the reactor turns red, then a thunder-wrapped beam fires from the chest.
 const beamMat=new T.MeshBasicMaterial({color:new T.Color(2.2,.12,.06),transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
 const beam=new T.Mesh(new T.CylinderGeometry(.22,.38,30,24,1,true).rotateX(Math.PI/2).translate(0,0,15),beamMat);beam.visible=false;attach(bone('Chest'),beam,[0,.4,.8],1);
 const boltMat=new T.LineBasicMaterial({color:new T.Color(2.6,1.2,3.4),toneMapped:false});const bolts:T.Line[]=[];for(let i=0;i<5;i++){const l=new T.Line(new T.BufferGeometry().setFromPoints(Array.from({length:16},()=>new T.Vector3())),boltMat);l.visible=false;l.frustumCulled=false;root.add(l);bolts.push(l);}
 parts.light.position.set(0,2.5,-1.6);root.add(parts.light);
 const mixer=new T.AnimationMixer(model),clips=new Map(gltf.animations.map(a=>[a.name,a]));let current:T.AnimationAction|undefined;
 const play=(name:string,fade=.25)=>{const c=clips.get(name);if(!c)return;const a=mixer.clipAction(c);if(a===current)return;a.reset().fadeIn(fade).play();current?.fadeOut(fade);current=a;};
 play('Idle',0);
 return {root,model,clips:[...clips.keys()],play,
  update(dt:number,t:number,mood:TyrantMood='calm',thrust=1){mixer.update(dt);
   for(const [i,f] of parts.flames.entries()){const k=thrust*(.85+Math.sin(t*37+i)*.1+Math.random()*.08);f.scale.set(1,k,1);}
   parts.light.intensity=24*thrust+Math.random()*6;
   for(const b of parts.barrels)b.rotation.z+=dt*(mood==='calm'?1.5:18);
   const eye=mood==='calm'?new T.Color(2.4,.15,.1):new T.Color(4,.35,.2);eyeMat.color.copy(eye).multiplyScalar(.85+.15*Math.sin(t*(mood==='calm'?2:12)));
   molten.emissiveIntensity=(mood==='rage'?3.2:2.2)+Math.sin(t*3)*.3;hull.emissiveIntensity=mood==='rage'?1.8:1.1;
   if(parts.core){parts.core.scale.setScalar(1+Math.sin(t*(mood==='charging'?14:3))*.06);const cm=parts.core.material as T.MeshStandardMaterial;cm.emissive.setRGB(1,mood==='calm'?.42:.05,mood==='calm'?.1:.03);cm.emissiveIntensity=mood==='calm'?1.3:mood==='charging'?3+Math.sin(t*20):5;}
   villainClock.value=t;
   for(const f of parts.flames){f.getWorldPosition(nozzle);if(Math.random()<.7){const p=smoke[smokeI++%smoke.length];p.s.position.copy(nozzle).add(new T.Vector3(0,-.6,-.3));p.v.set((Math.random()-.5)*.6,-.4+Math.random()*.3,-1.5-Math.random());p.life=1;p.s.visible=true;}}
   for(const p of smoke){if(p.life<=0)continue;p.life-=dt*.7;p.s.position.addScaledVector(p.v,dt);p.v.y+=dt*.9;const k=1-p.life;p.s.scale.setScalar(.6+k*2.6);(p.s.material as T.SpriteMaterial).opacity=Math.max(0,p.life*.55);(p.s.material as T.SpriteMaterial).color.setScalar(.25+k*.25);if(p.life<=0)p.s.visible=false;}
   const firing=mood==='rage';beam.visible=firing;if(firing){beam.scale.set(1+Math.sin(t*50)*.08,1+Math.sin(t*50)*.08,1);root.updateMatrixWorld(true);const o=beam.getWorldPosition(new T.Vector3()),dir=new T.Vector3(0,0,1).applyQuaternion(beam.getWorldQuaternion(new T.Quaternion()));
    for(const l of bolts){l.visible=Math.random()<.8;const P=l.geometry.getAttribute('position') as T.BufferAttribute,ang=Math.random()*Math.PI*2;for(let i=0;i<16;i++){const d=i/15*18,r=.6+Math.random()*.5;const side=new T.Vector3(Math.cos(ang+i*.4),Math.sin(ang+i*.4),0).multiplyScalar(r);P.setXYZ(i,o.x+dir.x*d+side.x,o.y+dir.y*d+side.y,o.z+dir.z*d+side.z);}P.needsUpdate=true;}}else bolts.forEach(l=>l.visible=false);}};
}
