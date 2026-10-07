import * as T from 'three';

/** Shared villain surface pass, layered on the existing models and materials:
 * a hot rim light that separates hostile silhouettes from the deck, object-space
 * grime and scratch wear (no UVs needed), tighter metal and stronger emissive
 * vents/eyes that reach bloom. Chains any hook already on the material (the
 * Tyrant's confirmed-hit wash) instead of replacing it. Presentation only. */
export interface VillainLook {rim:number;rimStrength:number;wear:number;metal:number;rough:number;glow:number;}
export const VILLAIN_LOOKS={
 grunt:{rim:0xff5a24,rimStrength:.45,wear:.75,metal:.55,rough:.42,glow:2.4},
 elite:{rim:0xff7a2e,rimStrength:.45,wear:.9,metal:.62,rough:.38,glow:2.8},
 tyrant:{rim:0xff4a1c,rimStrength:.5,wear:1,metal:.6,rough:.4,glow:3.2},
} satisfies Record<string,VillainLook>;
export const villainClock={value:0};
/** 0..1: EMP electrocution across every villain surface at once. */
export const villainStun={value:0};
const done=new WeakSet<T.Material>();

export function enhanceVillain(root:T.Object3D|T.Material[],look:VillainLook){
 const list:T.Material[]=[];if(Array.isArray(root))list.push(...root);else root.traverse((o:any)=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])list.push(m);});
 for(const m of list)if((m as T.MeshStandardMaterial).isMeshStandardMaterial&&!done.has(m))enhanceMaterial(m as T.MeshStandardMaterial,look);
}

function enhanceMaterial(m:T.MeshStandardMaterial,look:VillainLook){
 done.add(m);
 m.metalness=Math.max(m.metalness,look.metal);m.roughness=Math.min(m.roughness,look.rough);m.envMapIntensity=1.25;
 // Painted emissive atlases cover whole bodies; only lift pure emissive vents/eyes.
 if(m.emissive&&m.emissive.getHex()!==0&&!m.emissiveMap)m.emissiveIntensity=Math.max(m.emissiveIntensity,1)*look.glow;
 const previous=m.onBeforeCompile.bind(m),previousKey=m.customProgramCacheKey.bind(m),rim=new T.Color(look.rim);
 m.onBeforeCompile=(shader,renderer)=>{
  previous(shader,renderer);
  Object.assign(shader.uniforms,{vlRim:{value:rim},vlRimStrength:{value:look.rimStrength},vlWear:{value:look.wear},vlClock:villainClock,vlStun:villainStun});
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vlObj;').replace('#include <begin_vertex>','#include <begin_vertex>\nvlObj=position;');
  shader.fragmentShader=shader.fragmentShader
   .replace('#include <common>',`#include <common>
uniform vec3 vlRim;uniform float vlRimStrength,vlWear,vlClock,vlStun;varying vec3 vlObj;
float vlHash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vlNoise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(vlHash(i),vlHash(i+vec3(1,0,0)),f.x),mix(vlHash(i+vec3(0,1,0)),vlHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(vlHash(i+vec3(0,0,1)),vlHash(i+vec3(1,0,1)),f.x),mix(vlHash(i+vec3(0,1,1)),vlHash(i+vec3(1,1,1)),f.x),f.y),f.z);}`)
   .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
float vlGrime=vlNoise(vlObj*3.1)*.65+vlNoise(vlObj*9.7)*.35;float vlScratch=smoothstep(.82,.97,vlNoise(vlObj*vec3(38.,4.,38.)));
roughnessFactor=clamp(roughnessFactor+(vlGrime-.5)*.35*vlWear-vlScratch*.12*vlWear,.08,1.);`)
   .replace('#include <color_fragment>',`#include <color_fragment>
{float g=vlNoise(vlObj*3.1)*.65+vlNoise(vlObj*9.7)*.35;float s=smoothstep(.82,.97,vlNoise(vlObj*vec3(38.,4.,38.)));diffuseColor.rgb*=mix(1.,.62+.5*g,vlWear);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.62,.58,.52),s*.18*vlWear);}`)
   .replace('#include <opaque_fragment>',`{float vlF=pow(1.-clamp(dot(normalize(vViewPosition),normal),0.,1.),4.);outgoingLight+=vlRim*vlF*vlRimStrength*(.85+.15*sin(vlClock*3.));}
if(vlStun>0.){float arc=smoothstep(.9,.97,vlNoise(vlObj*vec3(14.,22.,14.)+vec3(0.,vlClock*26.,vlClock*9.)));outgoingLight=mix(outgoingLight,outgoingLight*vec3(.55,.75,1.1),vlStun*.6)+vec3(.45,.85,1.)*arc*vlStun*3.;}
#include <opaque_fragment>`);
 };
 m.customProgramCacheKey=()=>previousKey()+'|villain-look-v2';m.needsUpdate=true;
}
