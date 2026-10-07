import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {BakedFrames} from './baked-mech-crowd';

/** Iron Legion hero troopers, designed in-house: ivory composite armour over a
 * gunmetal undersuit, gold trim, cyan visors and power cells. Three classes give
 * the squad a varied silhouette: 0 Rifleman, 1 Heavy gunner, 2 Shield trooper.
 * Rigid parts on a joint hierarchy, keyframed procedurally, then baked into
 * BakedMechCrowd frames (Run, Idle, Shoot). Faces +Z; ~1.9 units tall. */
export type TrooperClass=0|1|2;
export const TROOPER_CLASSES=['Vanguard rifleman','Havoc heavy gunner','Aegis shield trooper'] as const;

// Texture atlas regions [u0,v0,u1,v1] (v up).
const R={armor:[0,.5,.5,1],suit:[.5,.5,1,1],gold:[0,.25,.25,.5],glow:[.25,.25,.5,.5],decal:[.5,.25,1,.5],black:[0,0,.25,.25],steel:[.25,0,.5,.25],accent:[.5,0,1,.25]} as const;
type Region=keyof typeof R;

/** Painted atlas: panel lines, rivets, edge wear, squad chevrons and unit numbers. */
export function trooperAtlas(){
 const S=1024,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d')!;let seed=77;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const rect=(r:readonly number[])=>[r[0]*S,(1-r[3])*S,(r[2]-r[0])*S,(r[3]-r[1])*S] as const;
 const fill=(name:Region,base:string,detail:(x:number,y:number,w:number,h:number)=>void)=>{const [x,y,w,h]=rect(R[name]);g.fillStyle=base;g.fillRect(x,y,w,h);g.save();g.beginPath();g.rect(x,y,w,h);g.clip();detail(x,y,w,h);g.restore();};
 const grain=(x:number,y:number,w:number,h:number,a:number)=>{for(let i=0;i<w*h/60;i++){const v=rnd();g.fillStyle=`rgba(${v>.5?255:0},${v>.5?255:0},${v>.5?255:0},${a*rnd()})`;g.fillRect(x+rnd()*w,y+rnd()*h,1+rnd()*2,1+rnd()*2);}};
 fill('armor','#e9e2d2',(x,y,w,h)=>{grain(x,y,w,h,.06);const grad=g.createLinearGradient(x,y,x,y+h);grad.addColorStop(0,'rgba(255,255,255,.18)');grad.addColorStop(1,'rgba(90,80,60,.18)');g.fillStyle=grad;g.fillRect(x,y,w,h);
  // Sparse seams only (a full grid reads as sugar cubes on small parts).
  g.strokeStyle='rgba(60,55,48,.35)';g.lineWidth=2;g.beginPath();g.moveTo(x+w*.5,y+h*.08);g.lineTo(x+w*.5,y+h*.38);g.stroke();g.beginPath();g.moveTo(x+w*.12,y+h*.72);g.lineTo(x+w*.42,y+h*.72);g.stroke();
  const vg=g.createRadialGradient(x+w/2,y+h/2,w*.2,x+w/2,y+h/2,w*.62);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(70,62,50,.28)');g.fillStyle=vg;g.fillRect(x,y,w,h);
  for(let i=0;i<26;i++){const sx=x+rnd()*w,sy=y+rnd()*h,len=20+rnd()*60;const gr=g.createLinearGradient(sx,sy,sx,sy+len);gr.addColorStop(0,'rgba(70,62,50,.28)');gr.addColorStop(1,'rgba(70,62,50,0)');g.fillStyle=gr;g.fillRect(sx,sy,2+rnd()*4,len);}
  g.fillStyle='rgba(40,40,40,.55)';g.font=`700 ${h*.035}px Consolas, monospace`;for(let i=0;i<6;i++)g.fillText(['IL-07','AUX','▲ LIFT','SEC-4','HV','07'][i],x+rnd()*w*.8,y+rnd()*h);
  for(let i=0;i<40;i++){g.strokeStyle=`rgba(120,110,95,${.15+rnd()*.25})`;g.lineWidth=1+rnd()*2;g.beginPath();const sx=x+rnd()*w,sy=y+rnd()*h;g.moveTo(sx,sy);g.lineTo(sx+(rnd()-.5)*40,sy+(rnd()-.5)*12);g.stroke();}});
 fill('suit','#2c333b',(x,y,w,h)=>{grain(x,y,w,h,.08);g.strokeStyle='rgba(10,12,15,.7)';g.lineWidth=4;for(let i=0;i<h;i+=22){g.beginPath();g.moveTo(x,y+i);g.lineTo(x+w,y+i);g.stroke();}g.strokeStyle='rgba(120,130,140,.25)';g.lineWidth=2;for(let i=3;i<h;i+=22){g.beginPath();g.moveTo(x,y+i);g.lineTo(x+w,y+i);g.stroke();}});
 fill('gold','#c79a4b',(x,y,w,h)=>{grain(x,y,w,h,.12);const grad=g.createLinearGradient(x,y,x+w,y+h);grad.addColorStop(0,'rgba(255,240,190,.35)');grad.addColorStop(1,'rgba(90,60,20,.3)');g.fillStyle=grad;g.fillRect(x,y,w,h);});
 fill('glow','#9ff3ff',(x,y,w,h)=>{const r=g.createRadialGradient(x+w/2,y+h/2,0,x+w/2,y+h/2,w*.7);r.addColorStop(0,'#ffffff');r.addColorStop(1,'#3fd8ff');g.fillStyle=r;g.fillRect(x,y,w,h);});
 fill('decal','#e6dfcf',(x,y,w,h)=>{grain(x,y,w,h,.05);g.fillStyle='#2f6f8f';g.fillRect(x,y+h*.08,w,h*.14);g.fillStyle='#c79a4b';for(let i=0;i<3;i++){g.beginPath();g.moveTo(x+w*.12+i*w*.1,y+h*.45);g.lineTo(x+w*.18+i*w*.1,y+h*.32);g.lineTo(x+w*.24+i*w*.1,y+h*.45);g.lineTo(x+w*.18+i*w*.1,y+h*.38);g.closePath();g.fill();}
  g.fillStyle='#39434c';g.font=`900 ${h*.32}px Segoe UI, Arial`;g.fillText('IL-07',x+w*.5,y+h*.72);g.fillStyle='rgba(60,55,48,.6)';g.fillRect(x,y+h*.86,w,h*.03);});
 fill('black','#121418',(x,y,w,h)=>grain(x,y,w,h,.1));
 fill('accent','#26425e',(x,y,w,h)=>{grain(x,y,w,h,.08);g.strokeStyle='rgba(10,20,30,.6)';g.lineWidth=3;g.strokeRect(x+6,y+6,w-12,h-12);g.fillStyle='rgba(233,226,210,.9)';for(let i=0;i<5;i++){g.beginPath();g.moveTo(x+w*.1+i*w*.17,y+h*.75);g.lineTo(x+w*.18+i*w*.17,y+h*.25);g.lineTo(x+w*.26+i*w*.17,y+h*.25);g.lineTo(x+w*.18+i*w*.17,y+h*.75);g.closePath();g.fill();}
  for(let i=0;i<30;i++){g.strokeStyle=`rgba(200,200,190,${.1+rnd()*.25})`;g.lineWidth=1+rnd();g.beginPath();const sx=x+rnd()*w,sy=y+rnd()*h;g.moveTo(sx,sy);g.lineTo(sx+(rnd()-.5)*30,sy+(rnd()-.5)*8);g.stroke();}});
 fill('steel','#7d8790',(x,y,w,h)=>{grain(x,y,w,h,.15);g.strokeStyle='rgba(30,35,40,.5)';for(let i=0;i<w;i+=16){g.beginPath();g.moveTo(x+i,y);g.lineTo(x+i,y+h);g.stroke();}});
 const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;map.flipY=true;
 const e=document.createElement('canvas');e.width=e.height=256;const eg=e.getContext('2d')!;eg.fillStyle='#000';eg.fillRect(0,0,256,256);const [gx,gy,gw,gh]=R.glow.map((v,i)=>i%2?v*256:v*256) as number[];eg.fillStyle='#7fe9ff';eg.fillRect(gx,(1-R.glow[3])*256,(R.glow[2]-R.glow[0])*256,(R.glow[3]-R.glow[1])*256);void gy;void gw;void gh;
 const emissiveMap=new T.CanvasTexture(e);emissiveMap.colorSpace=T.SRGBColorSpace;
 return {map,emissiveMap};
}

type Part={geo:T.BufferGeometry;node:T.Object3D};
// Box-projected UVs at a constant texel density (0.8 units spans a region), so
// panel lines and rivets keep the same size on every part instead of stretching.
function region(geo:T.BufferGeometry,name:Region){const g=geo.index?geo.toNonIndexed():geo;if(g!==geo)geo.dispose();g.computeVertexNormals();const uv=g.getAttribute('uv'),P=g.getAttribute('position'),N=g.getAttribute('normal'),r=R[name],k=1/.8;
 for(let i=0;i<uv.count;i++){const nx=Math.abs(N.getX(i)),ny=Math.abs(N.getY(i)),nz=Math.abs(N.getZ(i)),x=P.getX(i),y=P.getY(i),z=P.getZ(i);let a=x,b=y;if(nx>=ny&&nx>=nz){a=z;b=y;}else if(ny>=nz){a=x;b=z;}
  const u=T.MathUtils.clamp(.5+a*k,.02,.98),v=T.MathUtils.clamp(.5+b*k,.02,.98);uv.setXY(i,r[0]+u*(r[2]-r[0]),r[1]+v*(r[3]-r[1]));}
 const cols=new Float32Array(g.getAttribute('position').count*3).fill(1);g.setAttribute('color',new T.BufferAttribute(cols,3));return g;}
const rb=(w:number,h:number,d:number,r=.03)=>Math.min(w,h,d)<.09?new T.BoxGeometry(w,h,d):new RoundedBoxGeometry(w,h,d,1,Math.min(r,w*.45,h*.45,d*.45));

export function buildTrooper(kind:TrooperClass){
 const root=new T.Group(),parts:Part[]=[];
 const add=(node:T.Object3D,geo:T.BufferGeometry,name:Region,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const gg=region(geo,name);gg.rotateX(rx).rotateY(ry).rotateZ(rz).translate(x,y,z);parts.push({geo:gg,node});};
 const joint=(parent:T.Object3D,x:number,y:number,z:number,name:string)=>{const j=new T.Group();j.name=name;j.position.set(x,y,z);parent.add(j);return j;};
 const heavy=kind===1,aegis=kind===2,bulk=heavy?1.12:aegis?1.08:1;
 const hips=joint(root,0,.98,0,'hips'),torso=joint(hips,0,.1,0,'torso'),head=joint(torso,0,.6,.02,'head');
 // Pelvis, belt, tassets.
 add(hips,rb(.36*bulk,.18,.24),'suit');add(hips,rb(.40*bulk,.07,.27),'black',0,.06,0);for(const s of [-1,1]){add(hips,rb(.08,.08,.06,.02),'steel',s*.12,.05,.14);add(hips,rb(.10,.20,.20,.03),'armor',s*.23*bulk,-.06,0,0,0,s*.12);}
 add(hips,rb(.14,.16,.05,.02),'armor',0,-.04,.13);
 // Torso: abdomen, V chest, collar, power pack.
 add(torso,rb(.30*bulk,.22,.22),'suit',0,.10,0);
 add(torso,rb(.50*bulk,.34,.30,.07),'armor',0,.36,.01);
 add(torso,rb(.24,.26,.06,.03),'armor',-.12,.36,.15,0,.25,0);add(torso,rb(.24,.26,.06,.03),'armor',.12,.36,.15,0,-.25,0);
 add(torso,rb(.06,.18,.03,.01),'glow',0,.38,.18);add(torso,rb(.36,.05,.24,.02),'gold',0,.53,0);
 add(torso,rb(.36*bulk,.36,.18,.04),'suit',0,.36,-.21);add(torso,new T.CylinderGeometry(.05,.05,.24,12),'glow',0,.36,-.31,0,0,Math.PI/2);
 for(const s of [-1,1])add(torso,new T.CylinderGeometry(.04,.05,.16,10),'steel',s*.12,.58,-.24);
 if(heavy){add(torso,new T.CylinderGeometry(.13,.13,.22,18),'steel',.0,.40,-.36,0,0,Math.PI/2);add(torso,new T.TorusGeometry(.13,.02,6,18),'gold',.11,.40,-.36,0,Math.PI/2);}
 // Head variants: 0 rounded helm + T visor, 1 armoured box helm + mono-eye, 2 crested helm + slit visor.
 add(head,rb(.12,.10,.12,.03),'suit',0,-.02,0);
 if(kind===0){add(head,new T.SphereGeometry(.15,14,8,0,Math.PI*2,0,Math.PI*.62),'armor',0,.10,0);add(head,rb(.20,.05,.04,.015),'glow',0,.10,.13);add(head,rb(.05,.10,.04,.015),'glow',0,.05,.13);add(head,rb(.22,.05,.18,.02),'armor',0,.03,.0);}
 else if(kind===1){add(head,rb(.28,.24,.28,.06),'armor',0,.10,0);add(head,new T.CylinderGeometry(.05,.05,.04,16),'glow',0,.11,.145,Math.PI/2);add(head,rb(.30,.05,.30,.02),'gold',0,.22,0);for(const s of [-1,1])add(head,rb(.04,.12,.12,.01),'steel',s*.15,.08,-.02);}
 else{ // Aegis: armoured full-face helm, wide visor band, ear guards and a low crest.
  add(head,rb(.27,.22,.27,.07),'armor',0,.10,0);add(head,rb(.29,.07,.06,.02),'black',0,.09,.125);add(head,rb(.24,.025,.02,.008),'glow',0,.095,.155);
  add(head,rb(.20,.06,.05,.02),'accent',0,.015,.13);for(const s2 of [-1,1]){add(head,rb(.05,.15,.16,.02),'accent',s2*.15,.08,-.01);add(head,new T.CylinderGeometry(.035,.035,.03,10),'glow',s2*.178,.08,-.01,0,0,Math.PI/2);}
  add(head,rb(.06,.07,.24,.02),'gold',0,.235,-.02);}
 // Arms.
 const arms:Record<string,T.Object3D>={};
 for(const s of [-1,1]){const sh=joint(torso,s*.32*bulk,.44,0,s<0?'shoulderL':'shoulderR');add(sh,new T.SphereGeometry(.09,10,6),'suit');
  add(sh,rb(.22,.16,.26,.06),'decal',s*.05,.08,0,0,0,s*-.25);add(sh,rb(.23,.03,.27,.01),'gold',s*.05,.165,0,0,0,s*-.25);
  add(sh,rb(.11,.24,.12,.03),'suit',0,-.15,0);const el=joint(sh,0,-.29,0,s<0?'elbowL':'elbowR');add(el,new T.SphereGeometry(.06,8,5),'steel');
  add(el,rb(.14,.24,.15,.04),'armor',0,-.12,.01);add(el,rb(.15,.07,.16,.02),'accent',0,-.05,.012);add(el,rb(.10,.09,.11,.02),'black',0,-.27,.02);arms[s<0?'L':'R']=sh;arms[s<0?'eL':'eR']=el;}
 // Legs.
 const legs:Record<string,T.Object3D>={};
 for(const s of [-1,1]){const th=joint(hips,s*.12*bulk,-.06,0,s<0?'thighL':'thighR');add(th,rb(.15,.36,.17,.04),'suit',0,-.18,0);add(th,rb(.16,.22,.08,.03),kind===2?'accent':'armor',0,-.16,.08);
  const kn=joint(th,0,-.40,0,s<0?'kneeL':'kneeR');add(kn,rb(.13,.12,.10,.03),'gold',0,0,.08);add(kn,rb(.13,.36,.15,.04),'armor',0,-.18,0);
  const an=joint(kn,0,-.40,0,s<0?'ankleL':'ankleR');add(an,rb(.16,.12,.30,.04),'black',0,-.04,.05);add(an,rb(.15,.05,.14,.02),'steel',0,.04,.09);legs[s<0?'tL':'tR']=th;legs[s<0?'kL':'kR']=kn;legs[s<0?'aL':'aR']=an;}
 // Class weapons.
 const gun=joint(torso,.14,.30,.30,'weapon');
 if(kind===0){add(gun,rb(.08,.12,.62,.02),'black',0,0,.12);add(gun,rb(.06,.07,.32,.02),'armor',0,.06,.02);add(gun,new T.CylinderGeometry(.025,.03,.30,10),'steel',0,.01,.55,Math.PI/2);add(gun,rb(.05,.14,.06,.01),'suit',0,-.11,-.04);add(gun,rb(.035,.03,.18,.01),'glow',0,.075,.14);}
 else if(kind===1){add(gun,rb(.18,.18,.40,.04),'suit',0,0,0);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;add(gun,new T.CylinderGeometry(.025,.025,.55,8),'steel',Math.cos(a)*.06,Math.sin(a)*.06,.42,Math.PI/2);}add(gun,new T.TorusGeometry(.09,.02,6,16),'gold',0,0,.30);add(gun,new T.TorusGeometry(.09,.02,6,16),'gold',0,0,.62);add(gun,new T.CylinderGeometry(.11,.11,.16,16),'armor',-.16,-.02,-.05,0,0,Math.PI/2);}
 else{add(gun,rb(.07,.10,.34,.02),'black',0,0,.08);add(gun,rb(.05,.05,.12,.01),'glow',0,.06,.10);
  // Curved tower shield: five angled slats, gold rim, glowing viewport slit and emitter strips.
  const shield=joint(arms.eL,-.07,-.16,.14,'shield');arms.shield=shield;
  for(let i=-2;i<=2;i++){const a=i*.2,x=Math.sin(a)*.36,z=Math.cos(a)*.36-.36;add(shield,rb(.15,.82,.06,.02),Math.abs(i)===2?'accent':'armor',x,0,z,0,a,0);}
  add(shield,rb(.62,.05,.12,.02),'gold',0,.42,-.03);add(shield,rb(.62,.05,.12,.02),'gold',0,-.42,-.03);
  add(shield,rb(.34,.04,.03,.01),'glow',0,.22,.04);add(shield,rb(.03,.40,.03,.01),'glow',-.18,-.08,.025,0,-.2,0);add(shield,rb(.03,.40,.03,.01),'glow',.18,-.08,.025,0,.2,0);
  add(shield,rb(.16,.16,.05,.02),'decal',0,-.05,.05);add(shield,rb(.10,.30,.08,.02),'suit',0,0,-.08);
  // Back-mounted shield generator.
  add(torso,new T.TorusGeometry(.12,.025,8,20),'glow',0,.42,-.33);add(torso,new T.CylinderGeometry(.09,.11,.12,14),'steel',0,.42,-.30,Math.PI/2);}
 return {root,parts,joints:{hips,torso,head,gun,...arms,...legs} as Record<string,T.Object3D>,kind};
}
export type Trooper=ReturnType<typeof buildTrooper>;

/** Procedural keyframes. phase 0..1 loops. clip 0 Run, 1 Idle, 2 Shoot. */
export function poseTrooper(t:Trooper,clip:number,phase:number){
 const j=t.joints,a=phase*Math.PI*2,shieldT=t.kind===2,heavy=t.kind===1;
 for(const n of Object.values(j))n.rotation.set(0,0,0);j.hips.position.y=.98;
 // Weapon carry: right hand on the grip, left on the handguard (shield trooper braces the shield).
 const carry=(raise:number,kick=0)=>{j.R.rotation.set(-.95-raise+kick*.25,0,-.10);j.eR.rotation.set(-.55+kick*.2,0,0);
  if(shieldT){j.L.rotation.set(-.62,0,.22);j.eL.rotation.set(-1.05,0,0);if(j.shield)j.shield.rotation.set(1.67-j.torso.rotation.x,0,-.22);}else{j.L.rotation.set(-1.10-raise+kick*.2,0,.40);j.eL.rotation.set(-.80,0,.12);}
  j.gun.rotation.set(-raise*.5+kick*.12,0,0);j.gun.position.z=.30-kick*.06;};
 if(clip===0){ // Run
  const bob=Math.cos(a*2);j.hips.position.y=.95+bob*.04;j.hips.rotation.y=Math.sin(a)*.14;
  j.torso.rotation.set(.20+bob*.025,-Math.sin(a)*.12,0);j.head.rotation.set(-.18,Math.sin(a)*.08,0);
  for(const [s,o] of [['L',0],['R',Math.PI]] as const){const sw=Math.sin(a+o),lift=Math.max(0,Math.cos(a+o));
   j['t'+s].rotation.x=-sw*(heavy?.6:.75)-.15;j['k'+s].rotation.x=.25+lift*(heavy?1.0:1.25);j['a'+s].rotation.x=-.2+lift*.3-Math.max(0,sw)*.25;}
  carry(0,Math.sin(a*2)*.05);
 }else if(clip===1){ // Idle: breathing, weight shift, scanning
  const b=Math.sin(a);j.hips.position.y=.97+b*.008;j.torso.rotation.set(.04+b*.02,Math.sin(a*.5)*.05,0);j.head.rotation.set(-.02,Math.sin(a)*.25,0);
  for(const s of ['L','R']){j['t'+s].rotation.x=-.08;j['k'+s].rotation.x=.14;j['a'+s].rotation.x=-.06;}j.tL.rotation.z=.05;j.tR.rotation.z=-.05;
  carry(.05,0);
 }else{ // Shoot: planted stance with a sharp recoil
  const kick=Math.max(0,1-phase*3.5);j.hips.position.y=.93;j.torso.rotation.set(.10-kick*.10,.08,0);j.head.rotation.set(-.06,0,0);
  j.tL.rotation.set(-.35,0,.08);j.kL.rotation.x=.35;j.tR.rotation.set(.18,0,-.08);j.kR.rotation.x=.25;
  carry(.15,kick);
 }
}

/** Bake a trooper class into crowd frames: Run 16, Idle 12, Shoot 8. */
export function bakeTrooper(kind:TrooperClass):BakedFrames{
 const t=buildTrooper(kind),clips=[16,12,8];
 const base=mergeGeometries(t.parts.map(p=>p.geo),false)!;const count=base.getAttribute('position').count;
 const frames:BakedFrames['frames']=[],v=new T.Vector3(),n=new T.Vector3(),nm=new T.Matrix3();
 clips.forEach((frameCount,clip)=>{for(let f=0;f<frameCount;f++){poseTrooper(t,clip,f/frameCount);t.root.updateMatrixWorld(true);const pos=new Float32Array(count*3),nor=new Float32Array(count*3);let o=0;
  for(const p of t.parts){const P=p.geo.getAttribute('position'),N=p.geo.getAttribute('normal');nm.getNormalMatrix(p.node.matrixWorld);
   for(let i=0;i<P.count;i++,o++){v.fromBufferAttribute(P,i).applyMatrix4(p.node.matrixWorld);n.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();pos[o*3]=v.x;pos[o*3+1]=v.y;pos[o*3+2]=v.z;nor[o*3]=n.x;nor[o*3+1]=n.y;nor[o*3+2]=n.z;}}
  frames.push({pos,nor});}});
 t.parts.forEach(p=>p.geo.dispose());
 return {base,frames,clipFrames:clips};
}
