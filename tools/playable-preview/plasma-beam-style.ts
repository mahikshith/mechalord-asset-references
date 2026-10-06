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

/** A coherent illuminated volume: broad continuous shell, sparse axial flow, no wire lattice. */
export function plasmaBeamMaterial(clock:{value:number},hostile:boolean){
 const material=new T.MeshBasicMaterial({color:hostile?0xff471d:0x168be9,transparent:true,opacity:.88,depthWrite:false,toneMapped:false,side:T.FrontSide});
 material.onBeforeCompile=shader=>{
  shader.uniforms.uCombatTime=clock;shader.uniforms.uBeamHot={value:hostile?1:0};
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vEnergyUv;').replace('#include <begin_vertex>','#include <begin_vertex>\nvEnergyUv = uv;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vEnergyUv;uniform float uCombatTime;uniform float uBeamHot;').replace('#include <color_fragment>',`#include <color_fragment>
float flow = .5+.5*sin(vEnergyUv.y*23.-uCombatTime*11.+sin(vEnergyUv.x*6.283)*.7);
float heat = .78+.12*flow;
vec3 edge=mix(vec3(.025,.24,.72),vec3(.9,.045,.012),uBeamHot);
vec3 hot=mix(vec3(.34,.84,1.),vec3(1.,.38,.09),uBeamHot);
diffuseColor.rgb=mix(edge,hot,heat);
diffuseColor.a*=.83+.17*flow;`);
 };
 material.customProgramCacheKey=()=> 'coherent-plasma-volume-v2';return material;
}

/** Opposing separated filaments taper onto the exact endpoints; no outboard random forks. */
export function beamFilamentPoint(from:T.Vector3,to:T.Vector3,across:T.Vector3,up:T.Vector3,t:number,side:number,width:number,clock:number){
 const envelope=Math.sin(Math.PI*t),angle=side*Math.PI+.22*Math.sin(t*8-clock*2),radius=width*(.54+.055*Math.sin(t*29+clock*9+side))*envelope;
 return from.clone().lerp(to,t).addScaledVector(across,Math.cos(angle)*radius).addScaledVector(up,Math.sin(angle)*radius+width*.035*Math.sin(t*47-clock*7)*envelope);
}
