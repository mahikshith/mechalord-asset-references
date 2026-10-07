import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

/** SKYREAVER: original jetpack assault mech. Obsidian armour, crimson plates,
 * twin vectoring thrusters, shoulder micro-missile pods, a rotary arm cannon and
 * a plasma lance. Built from named pivots so it can be posed (hover, boost dash,
 * firing) and later driven by combat state. About 3.4 units tall. */
export type SkyreaverMode='hover'|'dash'|'fire';
export interface Skyreaver {root:T.Group;update(time:number,mode:SkyreaverMode,dt:number):void;dispose():void;}

export function createSkyreaver():Skyreaver{
 const owned:T.Material[]=[],geos:T.BufferGeometry[]=[];
 const std=(color:number,metal=.7,rough=.32,extra:Partial<T.MeshStandardMaterialParameters>={})=>{const m=new T.MeshStandardMaterial({color,metalness:metal,roughness:rough,...extra});owned.push(m);return m;};
 const glowMat=(color:number,k=3)=>{const m=new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(k),toneMapped:false});owned.push(m);return m;};
 const obsidian=std(0x1a1d24,.85,.28),gun=std(0x3a4049,.9,.24),crimson=std(0x8e1b1f,.55,.35),brass=std(0xb3823f,.95,.3),rubber=std(0x0d0f12,.2,.8);
 const hot=glowMat(0xff6a1f,3.2),magenta=glowMat(0xff2d6a,3),eye=glowMat(0xff3418,4);
 const mesh=(g:T.BufferGeometry,m:T.Material,p:T.Object3D,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{geos.push(g);const o=new T.Mesh(g,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.castShadow=true;p.add(o);return o;};
 const box=(w:number,h:number,d:number,r=.05)=>new RoundedBoxGeometry(w,h,d,3,Math.min(r,w*.3,h*.3,d*.3));
 const pivot=(p:T.Object3D,x=0,y=0,z=0,name='')=>{const o=new T.Group();o.name=name;o.position.set(x,y,z);p.add(o);return o;};
 const fin=(len:number,h:number,thick=.05)=>{const s=new T.Shape();s.moveTo(0,0);s.lineTo(len,h*.25);s.lineTo(len*.92,h*.55);s.lineTo(len*.15,h);s.closePath();return new T.ExtrudeGeometry(s,{depth:thick,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:1}).translate(0,0,-thick/2);};

 const root=new T.Group();root.name='Skyreaver';
 const body=pivot(root,0,1.85,0,'body');
 // Torso: armoured V-chest over an exposed spine and glowing reactor.
 mesh(box(.86,.62,.56,.09),obsidian,body,0,.12,0);
 mesh(box(.98,.30,.62,.08),crimson,body,0,.40,.02);
 mesh(box(.36,.30,.10,.04),gun,body,-.22,.14,.29,0,.25,0);mesh(box(.36,.30,.10,.04),gun,body,.22,.14,.29,0,-.25,0);
 mesh(new T.CylinderGeometry(.13,.13,.06,20),brass,body,0,.12,.31,Math.PI/2);mesh(new T.CircleGeometry(.10,20),magenta,body,0,.12,.345);
 mesh(box(.52,.34,.36,.06),obsidian,body,0,-.32,0);mesh(box(.30,.18,.30,.04),gun,body,0,-.55,0);
 for(let i=0;i<4;i++)mesh(box(.5-i*.06,.05,.05,.02),brass,body,0,-.20-i*.09,.19);
 // Head: low predator helm with a split visor and back-swept crest blades.
 const head=pivot(body,0,.62,.06,'head');
 mesh(box(.34,.26,.38,.07),obsidian,head,0,.08,0);mesh(box(.40,.08,.30,.03),crimson,head,0,.22,-.02);
 mesh(box(.12,.035,.02,.01),eye,head,-.08,.09,.195,0,0,.18);mesh(box(.12,.035,.02,.01),eye,head,.08,.09,.195,0,0,-.18);
 mesh(fin(.42,.16),crimson,head,-.12,.18,-.12,0,Math.PI*.62,.25);mesh(fin(.42,.16),crimson,head,.12,.18,-.12,0,Math.PI*.38,-.25);
 mesh(box(.10,.10,.10,.02),gun,head,0,-.05,.18);
 // Jetpack: twin vectoring thrusters on a yoke, with stabiliser wings.
 const pack=pivot(body,0,.18,-.36,'jetpack');
 mesh(box(.70,.62,.30,.08),gun,pack,0,0,-.05);mesh(box(.56,.20,.22,.05),crimson,pack,0,.28,-.04);
 const nozzleGeo=()=>new T.LatheGeometry([new T.Vector2(.15,.0),new T.Vector2(.17,.10),new T.Vector2(.19,.30),new T.Vector2(.22,.42),new T.Vector2(.20,.46)],20);
 const thrusters:T.Object3D[]=[],flames:T.Mesh[]=[],cores:T.Mesh[]=[];
 const flameMat=new T.MeshBasicMaterial({color:new T.Color(0xff7a2a).multiplyScalar(2.6),transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});owned.push(flameMat);
 const coreMat=new T.MeshBasicMaterial({color:new T.Color(0xfff0d0).multiplyScalar(3.5),transparent:true,opacity:.95,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});owned.push(coreMat);
 for(const s of [-1,1]){
  const t=pivot(pack,s*.36,-.06,-.10,s<0?'thrusterL':'thrusterR');thrusters.push(t);
  mesh(new T.CylinderGeometry(.16,.15,.42,20),obsidian,t,0,.12,0);mesh(new T.TorusGeometry(.17,.025,8,24),brass,t,0,-.06,0,Math.PI/2);
  mesh(nozzleGeo(),gun,t,0,-.08,0,Math.PI);mesh(new T.CircleGeometry(.15,20),hot,t,0,-.08,0,Math.PI/2);
  const flame=mesh(new T.ConeGeometry(.17,1.1,18,1,true).rotateX(Math.PI).translate(0,-.55,0),flameMat,t,0,-.5,0);flame.castShadow=false;flames.push(flame);
  const core=mesh(new T.ConeGeometry(.08,.55,12,1,true).rotateX(Math.PI).translate(0,-.27,0),coreMat,t,0,-.5,0);core.castShadow=false;cores.push(core);
  const wing=pivot(pack,s*.32,.22,-.12,s<0?'wingL':'wingR');mesh(fin(1.45,.5,.05),crimson,wing,0,0,0,0,s<0?Math.PI:0,s*.28);mesh(fin(.8,.14,.05),obsidian,wing,s*.05,-.06,.03,0,s<0?Math.PI:0,s*.1);
  for(let i=0;i<3;i++)mesh(box(.10,.025,.03,.01),hot,wing,s*(.35+i*.2),.08+i*.03,.05);
 }
 // Shoulders: armoured pods carrying 2x3 micro-missiles.
 const pods:T.Object3D[]=[];
 for(const s of [-1,1]){const sh=pivot(body,s*.58,.40,0,s<0?'shoulderL':'shoulderR');
  mesh(new T.SphereGeometry(.22,20,14),gun,sh);mesh(box(.42,.22,.48,.08),crimson,sh,s*.06,.16,0,0,0,s*-.2);
  const pod=pivot(sh,s*.06,.40,-.02,s<0?'podL':'podR');pods.push(pod);mesh(box(.30,.22,.38,.05),obsidian,pod);
  for(let r=0;r<2;r++)for(let c=0;c<3;c++){mesh(new T.CylinderGeometry(.04,.04,.06,10),rubber,pod,-.1+c*.1,-.05+r*.11,.215,Math.PI/2);mesh(new T.CircleGeometry(.025,10),hot,pod,-.1+c*.1,-.05+r*.11,.25);}
 }
 // Arms: rotary cannon (right) and plasma lance (left).
 const armR=pivot(body,.66,.18,0,'armR'),armL=pivot(body,-.66,.18,0,'armL');
 for(const [arm,s] of [[armR,1],[armL,-1]] as const){mesh(box(.22,.40,.24,.06),obsidian,arm,0,-.22,0);mesh(new T.SphereGeometry(.12,14,10),brass,arm,0,-.44,0);}
 const foreR=pivot(armR,0,-.46,0,'forearmR'),foreL=pivot(armL,0,-.46,0,'forearmL');
 mesh(box(.28,.30,.34,.06),crimson,foreR,0,-.14,.02);const barrels=pivot(foreR,0,-.30,.02,'barrels');
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2;mesh(new T.CylinderGeometry(.035,.035,.62,10),gun,barrels,Math.cos(a)*.08,-.30,Math.sin(a)*.08);}
 mesh(new T.TorusGeometry(.13,.025,8,20),brass,barrels,0,-.08,0,Math.PI/2);mesh(new T.TorusGeometry(.13,.025,8,20),brass,barrels,0,-.52,0,Math.PI/2);
 const muzzleFlash=mesh(new T.SphereGeometry(.16,12,8),glowMat(0xffc070,4),barrels,0,-.68,0);muzzleFlash.castShadow=false;
 mesh(box(.26,.28,.32,.06),obsidian,foreL,0,-.12,.02);mesh(box(.08,.70,.08,.02),gun,foreL,0,-.55,.0);
 const lance=mesh(new T.CylinderGeometry(.045,.012,1.1,10),magenta,foreL,0,-1.4,0);lance.castShadow=false;
 // Legs: digitigrade with armoured thighs; mostly tucked while flying.
 const legs:T.Object3D[]=[];
 for(const s of [-1,1]){const hip=pivot(body,s*.24,-.62,0,s<0?'legL':'legR');legs.push(hip);
  mesh(box(.24,.46,.28,.07),crimson,hip,0,-.24,.03);const knee=pivot(hip,0,-.5,.06,'knee');mesh(new T.SphereGeometry(.1,12,8),brass,knee);
  mesh(box(.22,.46,.24,.06),obsidian,knee,0,-.21,0);mesh(box(.16,.12,.14,.03),crimson,knee,0,-.05,.12);const ankle=pivot(knee,0,-.44,0,'ankle');mesh(box(.28,.12,.42,.04),gun,ankle,0,-.04,.08);mesh(new T.CylinderGeometry(.07,.09,.08,12),obsidian,ankle,0,-.12,-.02);mesh(new T.CircleGeometry(.07,12),hot,ankle,0,-.165,-.02,Math.PI/2);
 }
 const light=new T.PointLight(0xff7a2a,6,5,2);light.position.set(0,.9,-.5);root.add(light);

 return {root,
  update(time,mode,dt){
   const dash=mode==='dash'?1:0,fire=mode==='fire'?1:0;
   body.position.y=1.85+Math.sin(time*2.2)*.12;body.rotation.x=dash*.55+fire*-.08+Math.sin(time*1.7)*.03;body.rotation.z=Math.sin(time*1.3)*.05+dash*-.18;
   head.rotation.y=Math.sin(time*.9)*.25*(1-fire);head.rotation.x=-dash*.35;
   for(const [i,t] of thrusters.entries()){t.rotation.x=dash*.75+Math.sin(time*3+i)*.05;t.rotation.z=(i?-1:1)*(.08+Math.sin(time*2.6+i)*.04);}
   const surge=1+dash*.8+fire*.15;for(const [i,f] of flames.entries()){const k=surge*(.9+Math.sin(time*41+i*2)*.08+Math.random()*.06);f.scale.set(1+dash*.2,k,1+dash*.2);cores[i].scale.set(1,k*.95,1);}
   light.intensity=(5+Math.random()*1.5)*surge;
   for(const [i,p] of pods.entries())p.rotation.x=-fire*.5-(dash*.2)+Math.sin(time*4+i)*.02;
   armR.rotation.x=fire?-1.35:-.35-dash*.5;armR.rotation.z=fire?-.05:.12;foreR.rotation.x=fire?-.15:-.55;barrels.rotation.y+=dt*(fire?28:2);muzzleFlash.visible=fire>0&&Math.sin(time*60)>0;muzzleFlash.scale.setScalar(.8+Math.random()*.5);
   armL.rotation.x=fire?-.8:-.25-dash*.6;armL.rotation.z=-.15;foreL.rotation.x=fire?-.6:-.8;(lance.material as T.MeshBasicMaterial).color.setScalar(2.4+Math.sin(time*9)*.6).multiply(new T.Color(1,.18,.42));
   for(const [i,l] of legs.entries()){l.rotation.x=-.45-dash*.35+Math.sin(time*2.2+i)*.06;(l.getObjectByName('knee') as T.Object3D).rotation.x=1.0+dash*.3;}
  },
  dispose(){root.removeFromParent();owned.forEach(m=>m.dispose());geos.forEach(g=>g.dispose());light.dispose();},
 };
}
