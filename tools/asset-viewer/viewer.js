import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const data=window.ASSETS;
const scene=new THREE.Scene();scene.background=new THREE.Color('#d0d3d4');
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
document.querySelector('#canvas').appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(35,1,.01,100);camera.position.set(3,-5,2.6);camera.up.set(0,0,1);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;
scene.add(new THREE.HemisphereLight(0xffffff,0x777777,2));
for(const [pos,intensity] of [[[3,-4,5],3],[[-4,-1,3],1.5],[[1,3,4],2]]){
 const l=new THREE.DirectionalLight(0xffffff,intensity);l.position.set(...pos);scene.add(l);
}
const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:0xbfc4c5,roughness:1}));
floor.position.z=-.02;scene.add(floor);
const loader=new GLTFLoader();let root,mixer,animations=[],currentAction,serial=0;
const assetSelect=document.querySelector('#asset'),clipSelect=document.querySelector('#clip');
data.forEach((item,i)=>assetSelect.add(new Option(item.name,i)));
function play(){
 if(currentAction)currentAction.stop();
 const index=Number(clipSelect.value);
 currentAction=index>=0&&animations[index]&&mixer?mixer.clipAction(animations[index]):null;
 if(currentAction)currentAction.reset().play();
}
clipSelect.addEventListener('change',play);
async function load(index){
 const ticket=++serial;const item=data[index];document.querySelector('#status').textContent='Loading model…';
 try{
 const bytes=Uint8Array.from(atob(item.glb),c=>c.charCodeAt(0));
 const gltf=await loader.parseAsync(bytes.buffer,'');if(ticket!==serial)return;
 if(root){scene.remove(root);root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats)m.dispose();}});}
 // GLB uses Y up. Display in the Blender-style Z-up scene.
 root=new THREE.Group();gltf.scene.rotation.x=Math.PI/2;root.add(gltf.scene);scene.add(root);
 root.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(root);
 const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
 root.position.z-=box.min.z;controls.target.set(center.x,center.y,size.z*.5);
 const h=Math.max(size.x,size.y,size.z,1);camera.position.set(h*1.45,-h*2.8,h*1.65);controls.update();
 mixer=new THREE.AnimationMixer(gltf.scene);animations=gltf.animations;
 clipSelect.replaceChildren(new Option('Rest pose',-1));animations.forEach((a,i)=>clipSelect.add(new Option(a.name,i)));
 const idleIndex=animations.findIndex(a=>a.name==='Idle');
 clipSelect.value=animations.length?(idleIndex>=0?idleIndex:0):-1;play();
 document.querySelector('#status').textContent=item.notes;
 document.querySelector('#stats').textContent=`${item.triangles.toLocaleString()} triangles · ${item.materials} material · ${animations.length} clips`;
 window.assetInspection={name:item.name,triangles:item.triangles,clips:animations.map(a=>a.name),loaded:true};
 }catch(error){document.querySelector('#status').textContent='Model could not load: '+error.message;window.assetInspection={loaded:false,error:error.message};}
}
assetSelect.addEventListener('change',()=>load(Number(assetSelect.value)));
document.querySelector('#pause').addEventListener('click',e=>{if(!mixer)return;mixer.timeScale=mixer.timeScale?0:1;e.target.textContent=mixer.timeScale?'Pause animation':'Resume animation';});
document.querySelector('#reset').addEventListener('click',()=>load(Number(assetSelect.value)));
const clock=new THREE.Clock();
function frame(){requestAnimationFrame(frame);const panel=document.querySelector('#canvas');const w=panel.clientWidth,h=panel.clientHeight;
 if(renderer.domElement.width!==Math.round(w*renderer.getPixelRatio())||renderer.domElement.height!==Math.round(h*renderer.getPixelRatio())){renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
 mixer?.update(Math.min(clock.getDelta(),.1));controls.update();renderer.render(scene,camera);
}
load(0);frame();
