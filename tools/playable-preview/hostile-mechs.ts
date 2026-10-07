import * as T from 'three';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';

/** Quaternius Animated Mech Pack (CC0, assets/originals/quaternius-animated-mech-pack)
 * repainted into the Iron Front hostile livery: teal/green armour becomes crimson,
 * white panels become gunmetal, orange trim turns hot amber, rust stays. */
export const HOSTILE_MECHS=['George','Leela','Mike','Stan'] as const;
export type HostileMechName=typeof HOSTILE_MECHS[number];

export function hostileLivery(image:CanvasImageSource&{width:number;height:number}){
 const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const g=c.getContext('2d',{willReadFrequently:true})!;g.drawImage(image,0,0);
 const d=g.getImageData(0,0,c.width,c.height),p=d.data,col=new T.Color(),hsl={h:0,s:0,l:0};
 for(let i=0;i<p.length;i+=4){col.setRGB(p[i]/255,p[i+1]/255,p[i+2]/255);col.getHSL(hsl);const h=hsl.h*360;
  if(hsl.s>.12&&h>75&&h<250){col.setHSL(.995,Math.min(.85,hsl.s*1.1+.2),Math.min(.34,hsl.l*.68));}            // teal/green armour -> crimson
  else if(hsl.s<.16&&hsl.l>.45){col.setHSL(.6,.08,hsl.l*.42);}                                                     // white/grey panels -> gunmetal
  else if(hsl.s>.35&&h>=18&&h<=45){col.setHSL(.085,Math.min(1,hsl.s*1.1),Math.min(.6,hsl.l*1.05));}               // orange trim -> amber
  p[i]=col.r*255;p[i+1]=col.g*255;p[i+2]=col.b*255;}
 g.putImageData(d,0,0);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.flipY=true;t.anisotropy=8;return t;
}

export async function loadHostileMech(name:HostileMechName,base='mechs/'){
 const [model,img]=await Promise.all([new FBXLoader().loadAsync(base+name+'.fbx'),new T.ImageLoader().loadAsync(base+name+'_Texture.png')]);
 const map=hostileLivery(img);
 model.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;o.material=new T.MeshStandardMaterial({map,metalness:.55,roughness:.48});}});
 // FBX exports from Blender come in centimetres; normalise to ~2.6 units tall.
 const box=new T.Box3().setFromObject(model),h=box.max.y-box.min.y;const k=2.6/Math.max(.001,h);model.scale.multiplyScalar(k);model.position.y-=box.min.y*k;
 return {model,animations:model.animations};
}
