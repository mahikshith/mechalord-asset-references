import * as T from 'three';

export interface ClashView {active:boolean;progress:number;time:number;x:number;y:number;z:number;heroX:number;heroY:number;heroZ:number;enemyX:number;enemyY:number;enemyZ:number;result:'none'|'won'|'lost';}
/** The simulation owns contact and progress. This is a small pressure front, never a second collision solver. */
export class LaserClashVisuals {
 readonly root=new T.Group();readonly arcs:T.InstancedMesh;readonly sparks:T.InstancedMesh;readonly rings:T.InstancedMesh;
 private clock=0;private stamp=new T.Object3D();private center=new T.Vector3();private axis=new T.Vector3();private across=new T.Vector3();private up=new T.Vector3();private disposed=false;private pressure=0;
 private flare:T.Mesh;private light=new T.PointLight(0xb8d8ff,0,5,2);
 constructor(scene:T.Scene){
  scene.add(this.root);this.root.name='LaserClash_ActualContact';
  const energy=(color:number,opacity:number)=>new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
  const make=(g:T.BufferGeometry,m:T.Material,n:number,name:string)=>{const mesh=new T.InstancedMesh(g,m,n);mesh.frustumCulled=false;mesh.count=0;mesh.name=name;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);this.root.add(mesh);return mesh;};
  this.arcs=make(new T.CylinderGeometry(.5,.5,1,5).rotateX(Math.PI/2),energy(0xffffff,.78),12,'Clash_SeparatedEdgeDischarges');
  this.sparks=make(new T.CapsuleGeometry(.011,.11,2,5).rotateX(Math.PI/2),energy(0xffffff,.9),16,'Clash_DirectionalIonSparks');
  this.rings=make(new T.TorusGeometry(1,.018,5,56,Math.PI*1.85),energy(0xffffff,.48),2,'Clash_DownstreamPressureRings');
  // An open, thin annular shock front leaves the beam junction readable. No opaque energy sphere.
  this.flare=new T.Mesh(new T.RingGeometry(.10,1,64,5),new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,toneMapped:false,
   uniforms:{clock:{value:0},pressure:{value:0}},
   vertexShader:'varying vec2 p;void main(){p=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:`varying vec2 p;uniform float clock;uniform float pressure;void main(){
    float r=length(p);float angle=atan(p.y,p.x);float wave=sin(angle*9.+clock*13.)*.012;
    float front=exp(-pow((r-.70-wave)*14.,2.));float inner=exp(-pow((r-.36)*6.,2.))*.28;
    float alpha=front*.86+inner;vec3 blue=vec3(.10,.62,1.);vec3 red=vec3(1.,.16,.025);
    vec3 dominant=mix(red,blue,.5+pressure*.5);vec3 hot=mix(dominant,vec3(1.,.92,.80),front*.65);
    gl_FragColor=vec4(hot*1.3,alpha);}`
  }));this.flare.name='Clash_ThinPressureFront';this.root.add(this.flare,this.light);this.reset();
 }
 update(clash:ClashView|undefined,dt:number,visible=true){
  if(this.disposed)return;
  if(!clash?.active||!visible){this.root.visible=false;this.arcs.count=this.sparks.count=this.rings.count=0;this.light.intensity=0;return;}
  if(![clash.x,clash.y,clash.z,clash.heroX,clash.heroY,clash.heroZ,clash.enemyX,clash.enemyY,clash.enemyZ,clash.progress].every(Number.isFinite)){this.reset();return;}
  this.clock+=Number.isFinite(dt)?Math.max(0,Math.min(.1,dt)):0;this.pressure=T.MathUtils.clamp(clash.progress,0,1)*2-1;
  this.root.visible=true;this.center.set(clash.x,clash.y,-clash.z);this.axis.set(clash.enemyX-clash.heroX,clash.enemyY-clash.heroY,-clash.enemyZ+clash.heroZ).normalize();if(this.axis.lengthSq()<.5)this.axis.set(0,0,-1);
  this.across.crossVectors(this.axis,new T.Vector3(0,1,0)).normalize();if(this.across.lengthSq()<.5)this.across.set(1,0,0);this.up.crossVectors(this.across,this.axis).normalize();
  const dominant=new T.Color(0xff4c14).lerp(new T.Color(0x35baff),(this.pressure+1)*.5),radius=.62+.08*(1-Math.abs(this.pressure)),drift=this.pressure*.65;let ac=0;
  const segment=(a:T.Vector3,b:T.Vector3,w:number,color:T.Color)=>{const d=b.clone().sub(a),len=d.length();if(len<.001)return;this.stamp.position.copy(a).add(b).multiplyScalar(.5);this.stamp.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),d.normalize());this.stamp.scale.set(w,w,len);this.stamp.updateMatrix();this.arcs.setMatrixAt(ac,this.stamp.matrix);this.arcs.setColorAt(ac++,color);};
  // Six well-separated discharges, each with one elbow. Their roots sit on the pressure ring.
  for(let ray=0;ray<6;ray++){
   const angle=ray/6*Math.PI*2+this.clock*.6,dir=this.across.clone().multiplyScalar(Math.cos(angle)).addScaledVector(this.up,Math.sin(angle)),tangent=this.across.clone().multiplyScalar(-Math.sin(angle)).addScaledVector(this.up,Math.cos(angle));
   const pulse=.5+.5*Math.sin(this.clock*19+ray*4.1),base=this.center.clone().addScaledVector(dir,radius*.68),mid=this.center.clone().addScaledVector(dir,radius*(.84+pulse*.08)).addScaledVector(tangent,.06*Math.sin(this.clock*23+ray)).addScaledVector(this.axis,drift*.12),tip=this.center.clone().addScaledVector(dir,radius*(1.04+pulse*.18)).addScaledVector(this.axis,drift*.28);
   segment(base,mid,.019,dominant);segment(mid,tip,.011,new T.Color(0xffebcc).lerp(dominant,.45));
  }
  for(let i=0;i<16;i++){
   const age=(this.clock*1.25+i/16)%1,angle=i*2.39996,r=radius*.55+age*.53;
   this.stamp.position.copy(this.center).addScaledVector(this.across,Math.cos(angle)*r).addScaledVector(this.up,Math.sin(angle)*r-age*age*.10).addScaledVector(this.axis,drift*age+.055*Math.sin(i*7)*age);
   const direction=this.stamp.position.clone().sub(this.center).normalize();this.stamp.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),direction);this.stamp.scale.setScalar((1-age)*1.1);this.stamp.updateMatrix();this.sparks.setMatrixAt(i,this.stamp.matrix);this.sparks.setColorAt(i,dominant.clone().lerp(new T.Color(0xffeed0),.3).multiplyScalar(1-age*.5));
  }
  for(let i=0;i<2;i++){
   const age=(this.clock*1.05+i*.5)%1;this.stamp.position.copy(this.center).addScaledVector(this.axis,drift*age*.85);this.stamp.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),this.axis);this.stamp.rotateZ(this.clock*.55+i*Math.PI);this.stamp.scale.setScalar(radius*(.72+age*.62));this.stamp.updateMatrix();this.rings.setMatrixAt(i,this.stamp.matrix);this.rings.setColorAt(i,dominant.clone().multiplyScalar((1-age)*.8));
  }
  this.flare.position.copy(this.center);this.flare.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),this.axis);this.flare.scale.setScalar(radius);const material=this.flare.material as T.ShaderMaterial;material.uniforms.clock.value=this.clock;material.uniforms.pressure.value=this.pressure;
  this.light.position.copy(this.center);this.light.color.copy(dominant);this.light.intensity=1.65+Math.sin(this.clock*17)*.15;
  this.arcs.count=ac;this.sparks.count=16;this.rings.count=2;for(const m of [this.arcs,this.sparks,this.rings]){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}
 }
 get stats(){return {visible:this.root.visible,clock:this.clock,arcs:this.arcs.count,sparks:this.sparks.count,rings:this.rings.count,contact:this.center.toArray(),pressure:this.pressure};}
 reset(){this.clock=0;this.pressure=0;this.root.visible=false;this.arcs.count=this.sparks.count=this.rings.count=0;this.light.intensity=0;(this.flare.material as T.ShaderMaterial).uniforms.clock.value=0;(this.flare.material as T.ShaderMaterial).uniforms.pressure.value=0;}
 dispose(){if(this.disposed)return;this.disposed=true;for(const m of [this.arcs,this.sparks,this.rings,this.flare]){m.geometry.dispose();(m.material as T.Material).dispose();if((m as T.InstancedMesh).isInstancedMesh)(m as T.InstancedMesh).dispose();}this.light.dispose();this.root.removeFromParent();}
}
