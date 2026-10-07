import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {BakedMechCrowd,bakeModel} from './baked-mech-crowd';

/** Iron Legion hero machines: Quaternius Sci-Fi Essentials robots (CC0,
 * assets/originals/quaternius-scifi-essentials) in the allied livery — polished
 * ivory-silver shells with cyan accent lights — so they read instantly apart from
 * the crimson hostile mechs. QuadShell = Vanguard walkers (main squad), Trilobite =
 * Havoc heavy striders, EyeDrone = Volt support drones flying above the army. */
export const HERO_BOTS={vanguard:'Enemy_QuadShell',havoc:'Enemy_Trilobite',volt:'Enemy_EyeDrone'} as const;
export type HeroBot=keyof typeof HERO_BOTS;

export function alliedLivery(image:CanvasImageSource&{width:number;height:number}){
 const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const g=c.getContext('2d',{willReadFrequently:true})!;g.drawImage(image,0,0);
 const d=g.getImageData(0,0,c.width,c.height),p=d.data,col=new T.Color(),hsl={h:0,s:0,l:0};
 for(let i=0;i<p.length;i+=4){col.setRGB(p[i]/255,p[i+1]/255,p[i+2]/255);col.getHSL(hsl);const h=hsl.h*360;
  if(hsl.s>.35&&h>=25&&h<=70)col.setHSL(.53,Math.min(1,hsl.s*1.05),Math.min(.62,hsl.l*1.05));      // yellow/orange accents -> cyan
  else if(hsl.s>.25&&(h<25||h>330))col.setHSL(.55,hsl.s*.8,hsl.l);                                  // stray red markings -> blue
  else if(hsl.s<.2&&hsl.l>.35)col.setHSL(.11,.12,Math.min(.93,hsl.l*1.12));                        // silver panels -> warm ivory-silver
  p[i]=col.r*255;p[i+1]=col.g*255;p[i+2]=col.b*255;}
 g.putImageData(d,0,0);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.flipY=false;t.anisotropy=8;return t;
}

export async function loadHeroBot(kind:HeroBot,base='herobots/'){
 const gltf=await new GLTFLoader().loadAsync(base+HERO_BOTS[kind]+'.gltf');const model=gltf.scene;
 let src:T.MeshStandardMaterial|undefined;model.traverse((o:any)=>{if(o.isMesh&&!src)src=o.material;});
 const material=new T.MeshStandardMaterial({map:src?.map?alliedLivery(src.map.image):null,normalMap:src?.normalMap??null,roughnessMap:src?.roughnessMap??null,metalnessMap:src?.metalnessMap??null,aoMap:null,metalness:1,roughness:1,emissive:new T.Color(0x0b2a33)});
 const box=new T.Box3().setFromObject(model),h=box.max.y-box.min.y,k=(kind==='volt'?.7:kind==='havoc'?2.1:1.25)/Math.max(.001,h);model.scale.multiplyScalar(k);model.position.y-=box.min.y*k;
 return {model,animations:gltf.animations,material};
}

export async function heroBotCrowd(scene:T.Scene,kind:HeroBot,capacity:number,base='herobots/'){
 const {model,animations,material}=await loadHeroBot(kind,base);const clip=(n:string)=>animations.find(a=>a.name===n)??animations[0];
 const list=kind==='volt'?[{clip:clip('Idle'),frames:20},{clip:clip('Look'),frames:20},{clip:clip('Attack'),frames:10}]:[{clip:clip('Run'),frames:16},{clip:clip('Idle'),frames:20},{clip:clip('Attack'),frames:8}];
 return new BakedMechCrowd(scene,bakeModel(model,list),capacity,material);
}
