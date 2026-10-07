import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

/** Sky-to-ground thunder bolts with forked branches, a hot core, a ground flash
 * light and a scene-wide flash. Presentation only; strikes are requested by
 * confirmed combat events (EMP, chain lightning, boss part breaks). */
type Bolt={mesh:T.Mesh;glow:T.Mesh;life:number;max:number;};
export class LightningStrikes {
 readonly root=new T.Group();flash=0;
 private bolts:Bolt[]=[];private light=new T.PointLight(0x9fe8ff,0,14,1.6);
 private core=new T.MeshBasicMaterial({color:new T.Color(3.2,3.6,4),transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
 private halo=new T.MeshBasicMaterial({color:new T.Color(.5,1.1,2.2),transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
 constructor(scene:T.Scene){this.root.name='Thunder_Strikes';this.root.add(this.light);scene.add(this.root);}
 private path(from:T.Vector3,to:T.Vector3,steps:number,jitter:number){const pts=[from.clone()];for(let i=1;i<steps;i++){const p=from.clone().lerp(to,i/steps);p.x+=(Math.random()-.5)*jitter;p.z+=(Math.random()-.5)*jitter*.6;pts.push(p);}pts.push(to.clone());return pts;}
 private ribbon(points:T.Vector3[],radius:number){const parts:T.BufferGeometry[]=[];const up=new T.Vector3(0,1,0),q=new T.Quaternion();
  for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],len=a.distanceTo(b);const g=new T.CylinderGeometry(radius*.7,radius,len,5,1,true);q.setFromUnitVectors(up,b.clone().sub(a).normalize());g.applyQuaternion(q);g.translate((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);parts.push(g);}
  const m=mergeGeometries(parts,false)!;parts.forEach(p=>p.dispose());return m;}
 /** Strike a ground point from the storm ceiling. */
 strike(x:number,z:number,y=0,power=1){
  if(this.bolts.length>=10)this.retire(this.bolts.shift()!);
  const top=new T.Vector3(x+(Math.random()-.5)*3,16+Math.random()*4,z-2),hit=new T.Vector3(x,y,z),main=this.path(top,hit,14,1.6*power);
  const all=[...main];const geos=[this.ribbon(main,.045*power)];
  for(let k=0;k<3;k++){const from=main[3+Math.floor(Math.random()*8)],to=from.clone().add(new T.Vector3((Math.random()-.5)*4,-2-Math.random()*3,(Math.random()-.5)*2));const fork=this.path(from,to,5,.8);all.push(...fork);geos.push(this.ribbon(fork,.03*power));}
  const geo=mergeGeometries(geos,false)!;geos.forEach(g=>g.dispose());
  const mesh=new T.Mesh(geo,this.core),glow=new T.Mesh(geo,this.halo);glow.scale.set(1,1,1);mesh.renderOrder=glow.renderOrder=6;
  this.root.add(mesh,glow);this.bolts.push({mesh,glow,life:.32,max:.32});
  this.light.position.set(x,y+1.5,z);this.light.intensity=40*power;this.flash=Math.max(this.flash,.6*power);
 }
 private retire(b:Bolt){this.root.remove(b.mesh,b.glow);b.mesh.geometry.dispose();}
 update(dt:number){
  for(let i=this.bolts.length-1;i>=0;i--){const b=this.bolts[i];b.life-=dt;if(b.life<=0){this.retire(b);this.bolts.splice(i,1);continue;}
   const on=b.life/b.max>.55||Math.random()<.5;b.mesh.visible=b.glow.visible=on;}
  this.light.intensity=Math.max(0,this.light.intensity-dt*220);this.flash=Math.max(0,this.flash-dt*3);
 }
 reset(){for(const b of this.bolts)this.retire(b);this.bolts=[];this.flash=0;this.light.intensity=0;}
}
