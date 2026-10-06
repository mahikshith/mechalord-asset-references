import * as T from 'three';

export interface ClashView {active:boolean;progress:number;time:number;x:number;y:number;z:number;heroX:number;heroY:number;heroZ:number;enemyX:number;enemyY:number;enemyZ:number;result:'none'|'won'|'lost';}
/** Only the real crossing of two authoritative beams produces this focal effect. */
export class LaserClashVisuals {
 readonly root=new T.Group();readonly arcs:T.InstancedMesh;readonly sparks:T.InstancedMesh;readonly rings:T.InstancedMesh;
 private clock=0;private stamp=new T.Object3D();private center=new T.Vector3();private axis=new T.Vector3();private across=new T.Vector3();private up=new T.Vector3();private disposed=false;
 private flare:T.Mesh;private light=new T.PointLight(0xb8d8ff,0,7,2);
 constructor(scene:T.Scene){
  scene.add(this.root);this.root.name='LaserClash_ActualContact';
  const energy=(color:number,opacity:number)=>new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
  const make=(g:T.BufferGeometry,m:T.Material,n:number,name:string)=>{const mesh=new T.InstancedMesh(g,m,n);mesh.frustumCulled=false;mesh.count=0;mesh.name=name;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);this.root.add(mesh);return mesh;};
  this.arcs=make(new T.CylinderGeometry(.5,.5,1,5).rotateX(Math.PI/2),energy(0xffffff,.94),160,'Clash_JaggedPressureBranches');
  this.sparks=make(new T.CapsuleGeometry(.018,.22,2,5).rotateX(Math.PI/2),energy(0xffffff,.96),48,'Clash_MoltenIonSparks');
  this.rings=make(new T.TorusGeometry(1,.025,5,48,Math.PI*1.62),energy(0xc9e5ff,.66),5,'Clash_ExpandingPressureRings');
  this.flare=new T.Mesh(new T.SphereGeometry(1,16,12),new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{clock:{value:0}},vertexShader:'varying vec3 n;varying vec3 v;varying vec3 p;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-mv.xyz);p=position;gl_Position=projectionMatrix*mv;}',fragmentShader:'varying vec3 n;varying vec3 v;varying vec3 p;uniform float clock;void main(){float rim=pow(1.-abs(dot(normalize(n),normalize(v))),2.);float storm=.5+.5*sin(p.y*31.+p.x*17.-clock*29.);vec3 c=mix(vec3(.12,.6,1.),vec3(1.,.38,.09),smoothstep(-.18,.18,p.z));c=mix(c,vec3(1.,.97,.9),rim*.72);gl_FragColor=vec4(c*1.4,(.12+rim*.7)*(.65+storm*.35));}'}));this.flare.name='Clash_BlueAmberIonCore';this.root.add(this.flare,this.light);this.reset();
 }
 update(clash:ClashView|undefined,dt:number,visible=true){
  if(this.disposed)return;if(!clash?.active||!visible){this.root.visible=false;this.arcs.count=this.sparks.count=this.rings.count=0;this.light.intensity=0;return;}
  if(![clash.x,clash.y,clash.z,clash.heroX,clash.heroY,clash.heroZ,clash.enemyX,clash.enemyY,clash.enemyZ,clash.progress].every(Number.isFinite)){this.reset();return;}
  this.clock+=Math.max(0,Math.min(.1,dt));this.root.visible=true;this.center.set(clash.x,clash.y,-clash.z);this.axis.set(clash.enemyX-clash.heroX,clash.enemyY-clash.heroY,-clash.enemyZ+clash.heroZ).normalize();if(this.axis.lengthSq()<.5)this.axis.set(0,0,-1);
  this.across.crossVectors(this.axis,new T.Vector3(0,1,0)).normalize();if(this.across.lengthSq()<.5)this.across.set(1,0,0);this.up.crossVectors(this.across,this.axis).normalize();
  const phase=Math.floor(this.clock*28),hash=(n:number)=>{const k=Math.sin(n*127.1+phase*311.7)*43758.5453;return k-Math.floor(k);};let ac=0;
  const segment=(a:T.Vector3,b:T.Vector3,w:number,color:number)=>{if(ac>=160)return;const d=b.clone().sub(a),len=d.length();if(len<.001)return;this.stamp.position.copy(a).add(b).multiplyScalar(.5);this.stamp.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),d.normalize());this.stamp.scale.set(w,w,len);this.stamp.updateMatrix();this.arcs.setMatrixAt(ac,this.stamp.matrix);this.arcs.setColorAt(ac++,new T.Color(color));};
  for(let ray=0;ray<24;ray++){const angle=ray/24*Math.PI*2+hash(ray)*.2,len=.5+hash(ray+7)*.9,dir=this.across.clone().multiplyScalar(Math.cos(angle)).addScaledVector(this.up,Math.sin(angle)),base=this.center.clone().addScaledVector(dir,.14),mid=base.clone().addScaledVector(dir,len*.52).addScaledVector(this.axis,(hash(ray+19)-.5)*.45),tip=this.center.clone().addScaledVector(dir,len).addScaledVector(this.axis,(hash(ray+47)-.5)*.65),color=ray%2?0xffac65:0x7fddff;segment(base,mid,.042,color);segment(mid,tip,.025,ray%3?color:0xffffff);if(ray%2===0)segment(mid,tip.clone().addScaledVector(this.axis,.35),.017,0xbdeaff);}
  for(let i=0;i<48;i++){const age=(this.clock*1.7+i/48)%1,angle=i*2.3999,r=.2+age*1.5;this.stamp.position.copy(this.center).addScaledVector(this.across,Math.cos(angle)*r).addScaledVector(this.up,Math.sin(angle)*r-age*age*.4).addScaledVector(this.axis,Math.sin(i*7)*age*.65);const d=this.stamp.position.clone().sub(this.center).normalize();this.stamp.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),d);this.stamp.scale.setScalar((1-age)*1.5);this.stamp.updateMatrix();this.sparks.setMatrixAt(i,this.stamp.matrix);this.sparks.setColorAt(i,new T.Color(i%2?0xffc17d:0x80e5ff));}
  for(let i=0;i<5;i++){const age=(this.clock*1.15+i/5)%1;this.stamp.position.copy(this.center);this.stamp.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),this.axis);this.stamp.rotateZ(this.clock*(i%2?2:-2)+i);this.stamp.scale.setScalar(.28+age*1.2);this.stamp.updateMatrix();this.rings.setMatrixAt(i,this.stamp.matrix);this.rings.setColorAt(i,new T.Color(i%2?0xf3b48a:0x96deff).multiplyScalar(1-age));}
  this.flare.position.copy(this.center);this.flare.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),this.axis);this.flare.scale.set(.29,.29,.40);(this.flare.material as T.ShaderMaterial).uniforms.clock.value=this.clock;this.light.position.copy(this.center);this.light.intensity=3.2+Math.sin(this.clock*40)*.5;
  this.arcs.count=ac;this.sparks.count=48;this.rings.count=5;for(const m of [this.arcs,this.sparks,this.rings]){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}
 }
 get stats(){return {visible:this.root.visible,clock:this.clock,arcs:this.arcs.count,sparks:this.sparks.count,rings:this.rings.count,contact:this.center.toArray()};}
 reset(){this.clock=0;this.root.visible=false;this.arcs.count=this.sparks.count=this.rings.count=0;this.light.intensity=0;}
 dispose(){if(this.disposed)return;this.disposed=true;for(const m of [this.arcs,this.sparks,this.rings,this.flare]){m.geometry.dispose();(m.material as T.Material).dispose();if((m as T.InstancedMesh).isInstancedMesh)(m as T.InstancedMesh).dispose();}this.light.dispose();this.root.removeFromParent();}
}
