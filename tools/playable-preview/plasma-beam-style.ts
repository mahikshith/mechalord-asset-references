import * as T from 'three';

/** Unit length is exactly [-.5,.5]. Taper changes only the radial silhouette. */
export function plasmaBeamGeometry(radius=.5, radialSegments=20){
 const geometry=new T.CylinderGeometry(radius,radius,1,radialSegments,24,true).rotateX(Math.PI/2);
 const positions=geometry.getAttribute('position');
 for(let i=0;i<positions.count;i++){
  const t=positions.getZ(i)+.5, flare=T.MathUtils.smoothstep(t,0,.16), end=T.MathUtils.smoothstep(t,.83,1);
  const profile=.68+.32*flare-.13*end;
  positions.setXY(i,positions.getX(i)*profile,positions.getY(i)*profile);
 }
 geometry.computeVertexNormals();geometry.computeBoundingBox();return geometry;
}

/** Volumetric plasma: the shell fades to nothing at its silhouette (no hard tube edge),
 * a white-hot core runs down the middle, and turbulent noise streams along the axis. */
export function plasmaBeamMaterial(clock:{value:number},hostile:boolean){
 const material=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:1,depthWrite:false,toneMapped:false,side:T.DoubleSide,blending:T.AdditiveBlending});
 material.onBeforeCompile=shader=>{
  shader.uniforms.uCombatTime=clock;shader.uniforms.uBeamHot={value:hostile?1:0};
  shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
varying vec2 vEnergyUv;varying vec3 vBeamN;varying vec3 vBeamV;`)
   .replace('#include <begin_vertex>',`#include <begin_vertex>
vEnergyUv = uv;
#ifdef USE_INSTANCING
vBeamN=normalize(normalMatrix*(mat3(instanceMatrix)*normal));vBeamV=-(modelViewMatrix*instanceMatrix*vec4(transformed,1.)).xyz;
#else
vBeamN=normalize(normalMatrix*normal);vBeamV=-(modelViewMatrix*vec4(transformed,1.)).xyz;
#endif
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec2 vEnergyUv;varying vec3 vBeamN;varying vec3 vBeamV;uniform float uCombatTime;uniform float uBeamHot;
float bh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float bn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(bh(i),bh(i+vec2(1,0)),f.x),mix(bh(i+vec2(0,1)),bh(i+vec2(1,1)),f.x),f.y);}
float bfbm(vec2 p){float v=0.,a=.5;for(int k=0;k<4;k++){v+=a*bn(p);p*=2.03;a*=.5;}return v;}`).replace('#include <color_fragment>',`#include <color_fragment>
float facing=abs(dot(normalize(vBeamN),normalize(vBeamV)));            // 1 at the centre line, 0 at the silhouette
vec2 q=vec2(vEnergyUv.x*6.283,vEnergyUv.y*60.-uCombatTime*38.);
float turb=bfbm(q*vec2(.35,1.))*.8+bfbm(q*vec2(.9,2.3)+3.7)*.45;
float core=pow(facing,7.);float body=pow(facing,1.6)*(.45+.75*turb);
float pulse=.85+.15*sin(vEnergyUv.y*90.-uCombatTime*55.);
vec3 edge=mix(vec3(.05,.35,1.1),vec3(1.2,.12,.03),uBeamHot);
vec3 mid=mix(vec3(.35,1.1,2.4),vec3(2.4,.6,.12),uBeamHot);
diffuseColor.rgb=(edge*body+mid*body*turb+vec3(2.,1.95,1.9)*core)*pulse;
diffuseColor.a=clamp(body+core,0.,1.);`);
 };
 material.customProgramCacheKey=()=> 'volumetric-plasma-v3';return material;
}

/** Opposing separated filaments taper onto the exact endpoints; no outboard random forks. */
export function beamFilamentPoint(from:T.Vector3,to:T.Vector3,across:T.Vector3,up:T.Vector3,t:number,side:number,width:number,clock:number){
 const envelope=Math.sin(Math.PI*t),angle=side*Math.PI+.22*Math.sin(t*8-clock*2),radius=width*(.54+.055*Math.sin(t*29+clock*9+side))*envelope;
 return from.clone().lerp(to,t).addScaledVector(across,Math.cos(angle)*radius).addScaledVector(up,Math.sin(angle)*radius+width*.035*Math.sin(t*47-clock*7)*envelope);
}
