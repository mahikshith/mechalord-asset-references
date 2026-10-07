import * as T from 'three';

/** Lightning that coils around a laser along its whole length: several jagged
 * helical arcs per beam, re-struck every few frames, plus sparks shed off the
 * surface. Ribbons lie flat-ish so the top-down camera reads them. One dynamic
 * draw call for every beam on screen. */
const MAX_VERTS=12000;
export class BeamStorm {
 readonly mesh:T.Mesh;private pos=new Float32Array(MAX_VERTS*3);private col=new Float32Array(MAX_VERTS*3);private n=0;
 private seeds=new Map<string,number>();private clock=0;private restrike=0;
 constructor(scene:T.Scene){
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(this.pos,3).setUsage(T.DynamicDrawUsage));g.setAttribute('color',new T.BufferAttribute(this.col,3).setUsage(T.DynamicDrawUsage));
  this.mesh=new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false}));
  this.mesh.frustumCulled=false;this.mesh.renderOrder=7;scene.add(this.mesh);
 }
 begin(dt:number){this.n=0;this.clock+=dt;this.restrike-=dt;if(this.restrike<=0){this.restrike=.055;this.seeds.clear();}}
 private quad(a:T.Vector3,b:T.Vector3,w:number,c:T.Color){
  if(this.n+6>MAX_VERTS)return;const d=b.clone().sub(a),side=new T.Vector3(-d.z,0,d.x).normalize().multiplyScalar(w*.5);if(side.lengthSq()<1e-8)side.set(w*.5,0,0);
  const up=new T.Vector3(0,w*.35,0),p=[a.clone().add(side).add(up),a.clone().sub(side).sub(up),b.clone().add(side).add(up),b.clone().sub(side).sub(up)];
  for(const i of [0,1,2,2,1,3]){const v=p[i];this.pos.set([v.x,v.y,v.z],this.n*3);this.col.set([c.r,c.g,c.b],this.n*3);this.n++;}
 }
 /** a->b in world space; width is the beam's visual width. */
 add(a:T.Vector3,b:T.Vector3,width:number,hostile:boolean,key:string){
  let seed=this.seeds.get(key);if(seed===undefined){seed=Math.random()*1000;this.seeds.set(key,seed);}let s=seed;const rnd=()=>((s=(s*9301+49297)%233280)/233280);
  const axis=b.clone().sub(a),len=axis.length();if(len<.1)return;const dir=axis.clone().divideScalar(len);
  const ref=Math.abs(dir.y)<.9?new T.Vector3(0,1,0):new T.Vector3(1,0,0),u=new T.Vector3().crossVectors(dir,ref).normalize(),v=new T.Vector3().crossVectors(dir,u);
  const hot=hostile?new T.Color(2.2,.7,.3):new T.Color(.7,1.5,2.6),pale=hostile?new T.Color(2.4,1.5,.9):new T.Color(1.3,1.9,2.6);
  const steps=Math.max(12,Math.min(70,Math.round(len*3)));
  for(let arc=0;arc<5;arc++){
   const turns=len*(.45+rnd()*.35),phase=rnd()*Math.PI*2,r0=width*(.75+rnd()*.55),thick=.035+rnd()*.03,c=arc===0?pale:hot;let prev:T.Vector3|undefined;
   for(let i=0;i<=steps;i++){const t=i/steps,ang=phase+t*turns*Math.PI*2+(rnd()-.5)*.9,r=r0*(.8+rnd()*.45)*(.35+.65*Math.sin(Math.PI*Math.min(1,t*1.2)));
    const p=a.clone().addScaledVector(dir,t*len).addScaledVector(u,Math.cos(ang)*r).addScaledVector(v,Math.sin(ang)*r);
    if(prev&&rnd()>.08)this.quad(prev,p,thick,c);prev=p;
    if(rnd()<.05){const fork=p.clone().addScaledVector(u,(rnd()-.5)*width*1.6).addScaledVector(v,(rnd()-.5)*width*1.6).addScaledVector(dir,(rnd()-.3)*.8);this.quad(p,fork,thick*.7,c);}}
  }
  // Sparks shed sideways off the beam surface.
  for(let i=0;i<14;i++){const t=rnd(),ang=rnd()*Math.PI*2,r=width*(.6+rnd()*.4),p=a.clone().addScaledVector(dir,t*len).addScaledVector(u,Math.cos(ang)*r).addScaledVector(v,Math.sin(ang)*r),q=p.clone().addScaledVector(u,Math.cos(ang)*(.25+rnd()*.5)).addScaledVector(v,Math.sin(ang)*(.25+rnd()*.5));this.quad(p,q,.025,pale);}
 }
 end(){const g=this.mesh.geometry;g.setDrawRange(0,this.n);(g.getAttribute('position') as T.BufferAttribute).needsUpdate=true;(g.getAttribute('color') as T.BufferAttribute).needsUpdate=true;this.mesh.visible=this.n>0;}
}
