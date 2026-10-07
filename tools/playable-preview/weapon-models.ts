import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

/** Detailed commander weapons (v2). Same local axes, pivots and muzzle
 * distances as the original Arsenal rigs so sockets, recoil and spin keep
 * working: barrels point down +Z, housings sit behind the origin. */
const GUNMETAL=0x2b333b,STEEL=0x55626c,IVORY=0xd9ccb0,BRONZE=0xb68a46,BLACK=0x12181e,COPPER=0xb8693a;
type Part=T.BufferGeometry;
function paint(source:Part,color:number,x=0,y=0,z=0,rx=0,ry=0,rz=0){
 const g=source.index?source.toNonIndexed():source;if(g!==source)source.dispose();g.rotateX(rx).rotateY(ry).rotateZ(rz).translate(x,y,z);
 const c=new T.Color(color),v=new Float32Array(g.getAttribute('position').count*3);for(let i=0;i<v.length;i+=3){v[i]=c.r;v[i+1]=c.g;v[i+2]=c.b;}g.setAttribute('color',new T.BufferAttribute(v,3));
 if(!g.getAttribute('uv'))g.setAttribute('uv',new T.BufferAttribute(new Float32Array(g.getAttribute('position').count*2),2));return g;
}
const rbox=(w:number,h:number,d:number,r=.025)=>new RoundedBoxGeometry(w,h,d,2,Math.min(r,w*.3,h*.3,d*.3));
export function solid(parts:Part[]){const m=new T.Mesh(mergeGeometries(parts,false)!,new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.34,metalness:.78}));parts.forEach(p=>p.dispose());m.castShadow=true;m.receiveShadow=true;return m;}
export function energy(parts:Part[],k=2.6){const m=new T.Mesh(mergeGeometries(parts,false)!,new T.MeshBasicMaterial({color:new T.Color(k,k,k),vertexColors:true,toneMapped:false}));parts.forEach(p=>p.dispose());return m;}

/** Gatling hand cannon housing: armoured shroud, ammo drum, feed belt, cooling fins, heat vents. */
export function handCannonHousing(side:number){
 const p:Part[]=[
  paint(new T.CylinderGeometry(.30,.33,.50,24),GUNMETAL,0,0,-.13,Math.PI/2),
  paint(new T.TorusGeometry(.32,.045,8,28),BRONZE,0,0,-.37),paint(new T.TorusGeometry(.32,.035,8,28),BRONZE,0,0,.10),
  paint(rbox(.40,.18,.52,.04),STEEL,0,.30,-.14),paint(rbox(.30,.06,.44,.02),IVORY,0,.41,-.14),
  paint(new T.CylinderGeometry(.21,.21,.26,24),GUNMETAL,-side*.36,-.08,-.18,0,0,Math.PI/2),paint(new T.TorusGeometry(.21,.025,6,24),BRONZE,-side*.49,-.08,-.18,0,Math.PI/2),paint(new T.CylinderGeometry(.08,.08,.28,12),STEEL,-side*.36,-.08,-.18,0,0,Math.PI/2),
  paint(rbox(.16,.16,.30,.03),BLACK,0,-.27,-.24),paint(rbox(.22,.07,.10,.02),STEEL,0,-.37,-.10),
 ];
 for(let i=0;i<6;i++)p.push(paint(rbox(.05,.05,.07,.012),BRONZE,-side*(.24-i*.035),-.20+i*.02,-.05+i*.03,.3*i));          // belt links
 for(let i=0;i<5;i++)p.push(paint(rbox(.012,.20,.40,.004),STEEL,side*(.30+i*.025),.02,-.14));                                  // cooling fins
 for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])p.push(paint(rbox(.05,.05,.46,.01),BLACK,Math.cos(a)*.31,Math.sin(a)*.31,-.13));
 const vents=energy([paint(rbox(.24,.025,.02,.006),0xff8a3a,0,.20,.13),paint(rbox(.24,.025,.02,.006),0xff8a3a,0,.24,.13)],2.2);
 const g=new T.Group();g.add(solid(p),vents);g.name='HandCannonHousing';return g;
}
/** Six-barrel rotor with fluted barrels, two clamp rings and a heavy muzzle brake. */
export function handCannonRotor(radius=.19,length=.92){
 const p:Part[]=[];
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2,x=Math.cos(a)*radius,y=Math.sin(a)*radius;
  p.push(paint(new T.CylinderGeometry(.046,.054,length,14),STEEL,x,y,length*.5,Math.PI/2));
  p.push(paint(new T.CylinderGeometry(.058,.058,.12,14),BLACK,x,y,length-.04,Math.PI/2));
  for(const f of [0,1,2])p.push(paint(rbox(.012,.012,length*.55,.004),BLACK,x+Math.cos(a+f*2.1)*.05,y+Math.sin(a+f*2.1)*.05,length*.45));}
 p.push(paint(new T.CylinderGeometry(.07,.07,length,12),GUNMETAL,0,0,length*.5,Math.PI/2));
 for(const z of [.06,length*.45,length*.82])p.push(paint(new T.TorusGeometry(radius+.05,.035,8,28),z>.5?COPPER:BRONZE,0,0,z));
 p.push(paint(new T.CylinderGeometry(radius+.075,radius+.06,.16,24,1,true),GUNMETAL,0,0,length+.02,Math.PI/2));
 const m=solid(p);m.name='HandCannonRotatingBarrels';return m;
}
/** Shoulder missile pod: armoured box, 2x3 loaded tubes with visible warheads, hinged cover, cable. */
export function guidedRack(){
 const p:Part[]=[paint(rbox(.40,.42,.70,.05),GUNMETAL,0,0,0),paint(rbox(.44,.08,.74,.03),IVORY,0,.25,-.02,.12),paint(rbox(.10,.46,.16,.03),BRONZE,0,0,-.38)];
 for(let r=0;r<2;r++)for(let c=0;c<3;c++){const x=-.12+c*.12,y=-.08+r*.15;p.push(paint(new T.CylinderGeometry(.052,.052,.08,14),BLACK,x,y,.36,Math.PI/2),paint(new T.ConeGeometry(.04,.10,12),IVORY,x,y,.40,Math.PI/2));}
 p.push(paint(new T.TorusGeometry(.06,.02,6,14),COPPER,.16,-.18,-.30,0,Math.PI/2),paint(new T.CylinderGeometry(.025,.025,.40,8),BLACK,.16,-.18,-.10,Math.PI/2));
 const g=new T.Group();g.add(solid(p),energy([paint(rbox(.30,.02,.02,.005),0x74e8ff,0,.12,.36)]));return g;
}
/** Rail lance: twin conductor rails, capacitor banks, spine and glowing coil channel. */
export function railLance(){
 const p:Part[]=[paint(rbox(.38,.30,1.10,.05),GUNMETAL,0,0,.35),paint(new T.CylinderGeometry(.10,.14,1.36,20),STEEL,0,0,.46,Math.PI/2)];
 for(const s of [-1,1]){p.push(paint(rbox(.07,.26,1.25,.02),IVORY,s*.20,.06,.48),paint(rbox(.05,.05,1.3,.01),COPPER,s*.20,.21,.48));for(let i=0;i<3;i++)p.push(paint(new T.CylinderGeometry(.06,.06,.16,14),BRONZE,s*.27,-.08,.05+i*.22,0,0,Math.PI/2));}
 p.push(paint(rbox(.30,.10,.40,.03),BLACK,0,-.20,.05),paint(new T.CylinderGeometry(.16,.16,.08,24),BRONZE,0,0,1.12,Math.PI/2));
 const coils:Part[]=[];for(let i=0;i<6;i++)coils.push(paint(new T.TorusGeometry(.15,.022,8,24),0xc293ff,0,0,.2+i*.15));coils.push(paint(rbox(.03,.03,1.1,.01),0xe0c4ff,0,.155,.45));
 const g=new T.Group();g.add(solid(p),energy(coils));return g;
}
/** Tempest lance body: prism emitter, cooling fins, capacitor ring. */
export function tempestLanceBody(){
 const p:Part[]=[paint(new T.CylinderGeometry(.17,.24,.86,20),GUNMETAL,0,0,-.43,Math.PI/2),paint(new T.TorusGeometry(.21,.045,8,28),BRONZE,0,0,-.05),paint(rbox(.48,.12,.46,.03),IVORY,0,.17,-.46)];
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;p.push(paint(rbox(.015,.12,.40,.005),STEEL,Math.cos(a)*.24,Math.sin(a)*.24,-.55,0,0,a));}
 p.push(paint(new T.ConeGeometry(.12,.22,6),STEEL,0,0,.06,Math.PI/2));
 const coils:Part[]=[];for(let i=0;i<5;i++)coils.push(paint(new T.TorusGeometry(.2,.022,8,24),0x48dbff,0,0,-.16-i*.13));
 const g=new T.Group();g.add(solid(p),energy(coils));return g;
}
/** Arc Storm inductors: twin tesla towers with stacked toroids and charge spheres. */
export function arcInductors(){
 const p:Part[]=[],e:Part[]=[];
 for(const s of [-1,1]){p.push(paint(new T.CylinderGeometry(.13,.2,.36,16),GUNMETAL,s*.32,0,0),paint(new T.CylinderGeometry(.05,.05,.30,10),STEEL,s*.32,.30,0));for(let i=0;i<3;i++)p.push(paint(new T.TorusGeometry(.17-i*.03,.03,8,24),COPPER,s*.32,.08+i*.09,0,Math.PI/2));
  e.push(paint(new T.SphereGeometry(.09,16,12),0xe1cbff,s*.32,.48,0),paint(new T.TorusGeometry(.22,.018,6,24),0xba8cff,s*.32,.10,0,Math.PI/2));}
 const g=new T.Group();g.add(solid(p),energy(e));return g;
}
