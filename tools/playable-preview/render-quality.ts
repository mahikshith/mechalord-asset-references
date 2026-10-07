import * as T from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

/** Store-quality presentation layer: image-based reflections, HDR bloom on
 * emissive fire/energy, a graded vignette and a gradient sky dome. Purely
 * visual; it never reads or alters combat state. `?quality=low` keeps the
 * reflections and sky but skips post-processing for weak phones. */
export class RenderQuality {
 composer?:EffectComposer;private frames=0;private slow=0;private last=0;readonly bloom?:UnrealBloomPass;readonly sky:T.Mesh;
 private readonly skyMaterial:T.ShaderMaterial;private readonly envTarget:T.WebGLRenderTarget;
 constructor(private readonly renderer:T.WebGLRenderer,private readonly scene:T.Scene,private readonly camera:T.PerspectiveCamera,low=new URLSearchParams(globalThis.location?.search??'').get('quality')==='low'){
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment();this.envTarget=pmrem.fromScene(room,.04);scene.environment=this.envTarget.texture;scene.environmentIntensity=.35;room.dispose();pmrem.dispose();
  this.skyMaterial=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{horizon:{value:new T.Color(0xadc5c7)},zenith:{value:new T.Color(0x3d6f8f)},glow:{value:new T.Color(0xffd9a0)}},
   vertexShader:'varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position.z=gl_Position.w;}',
   fragmentShader:'uniform vec3 horizon,zenith,glow;varying vec3 vDir;void main(){float h=clamp(vDir.y,0.,1.);vec3 c=mix(horizon,zenith,pow(h,.55));float sun=pow(max(dot(vDir,normalize(vec3(-.35,.25,-1.))),0.),12.);c+=glow*sun*.55;gl_FragColor=vec4(c,1.);}'});
  this.sky=new T.Mesh(new T.SphereGeometry(170,32,16),this.skyMaterial);this.sky.frustumCulled=false;this.sky.renderOrder=-10;scene.add(this.sky);
  if(low)return;
  const size=renderer.getDrawingBufferSize(new T.Vector2()),target=new T.WebGLRenderTarget(size.x,size.y,{type:T.HalfFloatType,samples:2});
  this.composer=new EffectComposer(renderer,target);this.composer.addPass(new RenderPass(scene,camera));
  this.bloom=new UnrealBloomPass(new T.Vector2(size.x*.35,size.y*.35),.36,.3,1.35);this.composer.addPass(this.bloom);
  this.composer.addPass(new OutputPass());
  this.composer.addPass(new ShaderPass({uniforms:{tDiffuse:{value:null},strength:{value:.32}},
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:'uniform sampler2D tDiffuse;uniform float strength;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);vec2 d=vUv-.5;float v=1.-strength*smoothstep(.25,.85,dot(d,d)*2.2);c.rgb=mix(vec3(dot(c.rgb,vec3(.299,.587,.114))),c.rgb,1.12)*v;gl_FragColor=c;}'}));
 }
 /** Sky follows the route palette so zone colour transitions stay continuous. */
 setSky(horizon:number){const h=this.skyMaterial.uniforms.horizon.value as T.Color;h.setHex(horizon);(this.skyMaterial.uniforms.zenith.value as T.Color).copy(h).multiplyScalar(.42).lerp(new T.Color(0x1f4f76),.45);}
 resize(width:number,height:number){this.composer?.setPixelRatio(this.renderer.getPixelRatio());this.composer?.setSize(width,height);}
 /** Adaptive quality: if post-processing keeps frames over ~24 ms during the
  * first seconds of play, drop to direct rendering for the rest of the session. */
 private adapt(){const now=performance.now(),dt=now-this.last;this.last=now;if(!this.composer||dt>250)return;this.frames++;if(dt>24)this.slow++;if(this.frames>=90){if(this.slow>this.frames*.5){this.composer.dispose();this.composer=undefined;}this.frames=this.slow=0;}}
 render(){this.adapt();this.sky.position.copy(this.camera.position);this.renderer.info.autoReset=false;this.renderer.info.reset();if(this.composer)this.composer.render();else this.renderer.render(this.scene,this.camera);}
 dispose(){this.composer?.dispose();this.envTarget.dispose();this.sky.geometry.dispose();this.skyMaterial.dispose();this.scene.remove(this.sky);}
}

/** Painted steel deck plates: panel seams, bolts, wear, hazard edges and lane
 * chevrons. White-ish base so the route palette tint still drives colour. */
export function createDeckTexture(){
 if(typeof document==='undefined'){const t=new T.DataTexture(new Uint8Array([217,221,224,255]),1,1);t.wrapS=t.wrapT=T.RepeatWrapping;t.needsUpdate=true;return t;} // headless tests
 const c=document.createElement('canvas');c.width=512;c.height=1024;const g=c.getContext('2d')!;let seed=91;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 g.fillStyle='#d9dde0';g.fillRect(0,0,512,1024);
 for(let i=0;i<2600;i++){const v=200+rnd()*50|0;g.fillStyle=`rgba(${v},${v},${v+4},.35)`;g.fillRect(rnd()*512,rnd()*1024,1+rnd()*3,1+rnd()*3);}
 for(let i=0;i<70;i++){g.strokeStyle=`rgba(90,95,100,${.08+rnd()*.12})`;g.lineWidth=1+rnd()*2;g.beginPath();const x=rnd()*512,y=rnd()*1024;g.moveTo(x,y);g.lineTo(x+(rnd()-.5)*90,y+(rnd()-.5)*40);g.stroke();}
 for(let i=0;i<10;i++){const x=rnd()*512,y=rnd()*1024,r=30+rnd()*70,grad=g.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,'rgba(70,64,58,.22)');grad.addColorStop(1,'rgba(70,64,58,0)');g.fillStyle=grad;g.fillRect(x-r,y-r,r*2,r*2);}
 g.strokeStyle='rgba(40,46,52,.85)';g.lineWidth=5;for(const x of [128,256,384]){g.beginPath();g.moveTo(x,0);g.lineTo(x,1024);g.stroke();}for(let y=0;y<=1024;y+=256){g.beginPath();g.moveTo(0,y);g.lineTo(512,y);g.stroke();}
 g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=2;for(const x of [131,259,387]){g.beginPath();g.moveTo(x,0);g.lineTo(x,1024);g.stroke();}
 g.fillStyle='rgba(45,50,55,.9)';for(let y=12;y<1024;y+=256)for(let x=12;x<512;x+=128)for(const [dx,dy] of [[0,0],[104,0],[0,232],[104,232]]){g.beginPath();g.arc(x+dx,y+dy,4,0,Math.PI*2);g.fill();}
 for(const x of [0,488]){for(let y=0;y<1024;y+=48){g.fillStyle='#f2b233';g.fillRect(x,y,24,24);g.fillStyle='#1f2326';g.fillRect(x,y+24,24,24);}}
 g.fillStyle='rgba(255,214,120,.55)';for(const y of [120,632]){g.beginPath();g.moveTo(256,y-60);g.lineTo(316,y);g.lineTo(290,y);g.lineTo(256,y-32);g.lineTo(222,y);g.lineTo(196,y);g.closePath();g.fill();}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t;
}
