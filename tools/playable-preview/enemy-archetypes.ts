import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {Target} from './contract';

export const enemyDesigns=[
 {name:'BULWARK',role:'Three-hit plated guard',height:2.35,width:1.3,depth:1.0},
 {name:'VOLT HOUND',role:'Lateral rush',height:1.35,width:1.05,depth:1.65},
 {name:'MORTAR WASP',role:'Aerial bombardment',height:2.45,width:1.8,depth:1.25},
 {name:'ARC ENGINEER',role:'Repair pulse',height:2.25,width:1.45,depth:1.10},
] as const;
type Finish='plate'|'steel'|'joint'|'trim'|'energy'|'glass';
type Piece={joint:string;finish:Finish;geometry:T.BufferGeometry};
type Batch={joint:string;finish:Finish;mesh:T.InstancedMesh};
type Design={batches:Batch[];count:number;scale:T.Vector3;};
const up=new T.Vector3(0,1,0);

/** Original articulated industrial enemies, baked into per-joint instance batches.
 * State, collision, shields and attacks are always supplied by the simulation. */
export class EnemyArchetypes {
 readonly root=new T.Group();readonly capacity=24;
 private designs:Design[]=[];private materials=new Map<Finish,T.MeshStandardMaterial>();
 private textures:T.Texture[]=[];private stamp=new T.Object3D();private joint=new T.Object3D();
 private world=new T.Matrix4();private color=new T.Color();private disposed=false;
 private count=0;
 private sockets=new Map<number,T.Vector3>();private pivot=new T.Vector3();private inversePivot=new T.Matrix4();
 constructor(scene:T.Scene){
  this.root.name='IronFront_OriginalEnemyRegiments';scene.add(this.root);
  const surface=this.surfaceTexture();
  const palette:Record<Finish,number>={plate:0x81372b,steel:0x718991,joint:0x1c303d,trim:0xc18b53,energy:0x88e9e1,glass:0x152d36};
  for(const finish of Object.keys(palette) as Finish[]){
   const m=new T.MeshStandardMaterial({color:palette[finish],roughness:finish==='glass'?.25:finish==='joint'?.8:.46,metalness:finish==='energy'?.20:.66,...(finish==='energy'?{}:{map:surface,bumpMap:surface,bumpScale:.013})});
   if(finish==='energy'){m.emissive.set(0x34bfc6);m.emissiveIntensity=1.6;}this.materials.set(finish,m);
  }
  for(let type=1;type<=4;type++){
   const pieces:Piece[]=[];this.build(type,pieces);const groups=new Map<string,Piece[]>();
   for(const p of pieces){const key=p.joint+':'+p.finish;const list=groups.get(key)??[];list.push(p);groups.set(key,list);}
   const batches:Batch[]=[];for(const list of groups.values()){
    const merged=mergeGeometries(list.map(p=>p.geometry),false);if(!merged)throw new Error('Enemy geometry cannot be combined');
    list.forEach(p=>p.geometry.dispose());merged.computeBoundingSphere();
    const mesh=new T.InstancedMesh(merged,this.materials.get(list[0].finish)!,this.capacity);mesh.name=enemyDesigns[type-1].name+'_'+list[0].joint+'_'+list[0].finish;mesh.count=0;mesh.frustumCulled=false;mesh.castShadow=list[0].finish!=='energy';mesh.receiveShadow=true;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);this.root.add(mesh);batches.push({joint:list[0].joint,finish:list[0].finish,mesh});
   }const bounds=new T.Box3();for(const b of batches){b.mesh.geometry.computeBoundingBox();bounds.union(b.mesh.geometry.boundingBox!);}const size=bounds.getSize(new T.Vector3()),declared=enemyDesigns[type-1];this.designs.push({batches,count:0,scale:new T.Vector3(declared.width*.94/size.x,declared.height/bounds.max.y,declared.depth*.96/size.z)});
  }
 }
 private surfaceTexture(){
  const size=256,pixels=new Uint8Array(size*size*4);let seed=2943;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=(seed>>>24)/255;
   const grain=Math.sin(y*1.9)*3,score=(x%59===3&&y%79<45)||(y%97===6&&x%83<27),v=Math.max(90,Math.min(255,Math.round(226+grain+noise*15-(score?53:0))));
   const i=(y*size+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=v;pixels[i+3]=255;
  }
  const texture=new T.DataTexture(pixels,size,size);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.generateMipmaps=true;texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;texture.colorSpace=T.SRGBColorSpace;texture.needsUpdate=true;this.textures.push(texture);return texture;
 }
 private piece(out:Piece[],joint:string,finish:Finish,geometry:T.BufferGeometry,x:number,y:number,z:number,rx=0,ry=0,rz=0){
  this.stamp.position.set(x,y,z);this.stamp.rotation.set(rx,ry,rz);this.stamp.scale.set(1,1,1);this.stamp.updateMatrix();const g=geometry.index?geometry.toNonIndexed():geometry.clone();g.applyMatrix4(this.stamp.matrix);geometry.dispose();out.push({joint,finish,geometry:g});
 }
 private plate(out:Piece[],joint:string,finish:Finish,w:number,h:number,d:number,x:number,y:number,z:number,rx=0,ry=0,rz=0){this.piece(out,joint,finish,new RoundedBoxGeometry(w,h,d,2,Math.min(.045,w*.15,h*.15,d*.18)),x,y,z,rx,ry,rz);}
 private cylinder(out:Piece[],joint:string,finish:Finish,r:number,h:number,x:number,y:number,z:number,rx=0,ry=0,rz=0,rb=r){this.piece(out,joint,finish,new T.CylinderGeometry(r,rb,h,16),x,y,z,rx,ry,rz);}
 private ring(out:Piece[],joint:string,finish:Finish,r:number,tube:number,x:number,y:number,z:number,rx=0,ry=0){this.piece(out,joint,finish,new T.TorusGeometry(r,tube,7,24),x,y,z,rx,ry);}
 private rivets(out:Piece[],joint:string,w:number,h:number,z:number,y:number){for(const side of[-1,1])for(const row of[-1,1])this.cylinder(out,joint,'trim',.035,.045,side*w*.41,y+row*h*.4,z,Math.PI/2);}
 private link(out:Piece[],joint:string,finish:Finish,a:T.Vector3,b:T.Vector3,r=.055){const d=new T.Vector3().subVectors(b,a),m=new T.Matrix4().compose(a.clone().add(b).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(up,d.clone().normalize()),new T.Vector3(1,d.length(),1));const g=new T.CylinderGeometry(r,r,1,12).toNonIndexed().applyMatrix4(m);out.push({joint,finish,geometry:g});}
 private boot(out:Piece[],joint:string,x:number,z:number){this.plate(out,joint,'joint',.29,.42,.29,x,.44,z);this.cylinder(out,joint,'trim',.12,.34,x,.67,z,0,0,Math.PI/2);this.plate(out,joint,'plate',.35,.42,.36,x,.36,z+.06);this.plate(out,joint,'steel',.39,.15,.54,x,.12,z+.12);for(const offset of[-.12,.12])this.plate(out,joint,'joint',.06,.05,.39,x+offset,.035,z+.10);}
 private build(type:number,out:Piece[]){
  if(type===1){
   // Broad chest, recessed visor, exposed suspension and three interlocked shield plates.
   this.plate(out,'body','joint',.71,.66,.54,0,1.30,0);this.plate(out,'body','plate',.91,.69,.62,0,1.5,.015,0,0,.05);this.plate(out,'body','steel',.59,.24,.05,0,1.67,.36);
   for(const side of[-1,1]){this.plate(out,'body','trim',.12,.55,.68,side*.4,1.5,0);this.boot(out,side<0?'legL':'legR',side*.31,0);this.plate(out,'body','plate',.4,.42,.45,side*.58,1.74,0);this.cylinder(out,'body','joint',.16,.38,side*.52,1.40,0,0,0,Math.PI/2);}
   this.plate(out,'head','joint',.49,.39,.40,0,2.02,.05);this.plate(out,'head','plate',.54,.17,.48,0,2.19,.07);this.plate(out,'head','glass',.39,.12,.043,0,2.05,.269);this.plate(out,'head','energy',.32,.035,.048,0,2.08,.294);
   this.cylinder(out,'gun','steel',.13,.57,.61,1.25,.36,Math.PI/2);this.cylinder(out,'gun','joint',.084,.60,.61,1.25,.39,Math.PI/2);this.ring(out,'gun','trim',.14,.027,.61,1.25,.67);
   for(const i of[-1,0,1]){const x=i*.35;this.plate(out,'shield','joint',.40,1.30,.14,x,1.13,.62);this.plate(out,'shield','plate',.34,1.21,.075,x,1.13,.72,0,i*.1);this.plate(out,'shield','steel',.27,.085,.075,x,1.56,.76);this.plate(out,'shield','trim',.30,.12,.085,x,.66,.765);this.plate(out,'shield','energy',.026,.48,.025,x+.135,1.10,.783);}
   this.rivets(out,'shield',1.03,1.15,.82,1.13);this.plate(out,'shield','trim',.14,.25,.10,0,1.13,.80);
  }else if(type===2){
   // Long low spinal casing, independently cycling four piston legs and tooth-like jaw plates.
   this.plate(out,'body','joint',.58,.46,1.13,0,.80,0);for(let i=0;i<4;i++){this.plate(out,'body','plate',.73,.19,.24,0,1.02,-.42+i*.27,0,0,(i%2?1:-1)*.04);this.plate(out,'body','energy',.065,.08,.14,0,1.155,-.42+i*.27);}
   for(const side of[-1,1])for(const end of[-1,1]){const j='leg'+(side<0?'L':'R')+(end<0?'Back':'Front'),x=side*.39,z=end*.50;this.cylinder(out,j,'trim',.14,.16,x,.73,z,0,0,Math.PI/2);this.link(out,j,'steel',new T.Vector3(x,.73,z),new T.Vector3(x*1.15,.39,z-.12),.075);this.link(out,j,'joint',new T.Vector3(x*1.15,.39,z-.12),new T.Vector3(x,.17,z+.09),.055);this.plate(out,j,'plate',.22,.30,.25,x,.48,z);this.plate(out,j,'steel',.25,.12,.40,x,.12,z+.07);}
   this.plate(out,'head','plate',.45,.37,.46,0,.86,.65,-.18);this.plate(out,'head','joint',.39,.12,.46,0,.65,.69);for(const side of[-1,1]){this.plate(out,'head','energy',.10,.04,.13,side*.18,.94,.875);for(let i=0;i<3;i++)this.plate(out,'head','trim',.06,.09,.08,side*.17,.62,.55+i*.12);this.cylinder(out,'body','trim',.055,.55,side*.17,1.21,-.39,0,0,side*.2);this.ring(out,'body','energy',.10,.021,side*.17,1.25,-.39,Math.PI/2);}
   this.cylinder(out,'tail','joint',.075,.49,0,.81,-.70,Math.PI/3);this.ring(out,'tail','trim',.11,.035,0,.65,-.9,Math.PI/3);
  }else if(type===3){
   // Open hover yoke with paired rotating nacelles and elevated twin mortar tubes.
   this.plate(out,'body','joint',.69,.53,.62,0,1.70,0);this.plate(out,'body','plate',.78,.25,.79,0,1.91,0,0,0,.035);this.plate(out,'head','steel',.44,.22,.24,0,1.63,.46);this.plate(out,'head','glass',.36,.14,.033,0,1.63,.59);this.plate(out,'head','energy',.26,.035,.04,0,1.65,.62);
   for(const side of[-1,1]){const j=side<0?'wingL':'wingR';this.plate(out,j,'steel',.62,.10,.44,side*.60,1.76,0,0,0,side*.1);this.cylinder(out,j,'plate',.22,.48,side*.77,1.48,0);this.cylinder(out,j,'joint',.17,.16,side*.77,1.18,0);this.ring(out,j,'trim',.21,.035,side*.77,1.24,0,Math.PI/2);this.cylinder(out,'flame','energy',.08,.46,side*.77,.94,0,0,0,0,.15);
    const g=side<0?'gunL':'gunR';this.cylinder(out,g,'trim',.20,.20,side*.43,2.02,-.07,0,0,Math.PI/2);this.cylinder(out,g,'steel',.14,.69,side*.43,2.08,.25,Math.PI/2-.30);this.cylinder(out,g,'joint',.090,.71,side*.43,2.08,.26,Math.PI/2-.30);this.ring(out,g,'trim',.143,.028,side*.43,2.18,.59,.30);for(let i=0;i<3;i++)this.plate(out,'body','trim',.08,.13,.13,side*.31,1.83,-.25+i*.19);
   }this.cylinder(out,'body','joint',.10,.36,0,1.29,0);this.ring(out,'body','energy',.21,.025,0,1.43,0,Math.PI/2);
  }else{
   // Tall power pack, repair coil cage and asymmetrical manipulator tools.
   this.plate(out,'body','joint',.57,.61,.56,0,1.16,0);this.plate(out,'body','steel',.70,.49,.52,0,1.42,.05);this.plate(out,'body','plate',.24,.43,.07,0,1.42,.34);this.ring(out,'body','trim',.20,.036,0,1.44,.40);this.cylinder(out,'body','energy',.13,.042,0,1.44,.42,Math.PI/2);
   for(const side of[-1,1]){this.boot(out,side<0?'legL':'legR',side*.25,0);this.cylinder(out,'body','trim',.18,.72,side*.28,1.51,-.38);for(let row=0;row<5;row++)this.ring(out,'body','steel',.2,.029,side*.28,1.22+row*.14,-.38,Math.PI/2);this.cylinder(out,'body','energy',.07,.72,side*.28,1.55,-.38);
    const j=side<0?'armL':'armR';this.cylinder(out,j,'joint',.13,.19,side*.40,1.60,0,0,0,Math.PI/2);this.link(out,j,'steel',new T.Vector3(side*.44,1.58,0),new T.Vector3(side*.68,1.2,.14),.065);this.link(out,j,'trim',new T.Vector3(side*.68,1.2,.14),new T.Vector3(side*.55,1.05,.48),.05);this.plate(out,j,'plate',.26,.18,.31,side*.56,1.06,.47);for(const claw of[-1,1])this.plate(out,j,'steel',.045,.17,.23,side*.56+claw*.10,1.05,.64,claw*.1);
   }
   this.plate(out,'head','plate',.37,.39,.33,0,1.99,.04);this.plate(out,'head','trim',.47,.09,.38,0,2.19,.04);this.plate(out,'head','glass',.30,.15,.04,0,2.03,.222);this.plate(out,'head','energy',.20,.036,.035,0,2.05,.249);
   for(const side of[-1,1]){this.link(out,'aerial','joint',new T.Vector3(side*.20,1.8,-.35),new T.Vector3(side*.56,2.38,-.30),.035);this.ring(out,'aerial','energy',.09,.025,side*.56,2.34,-.30,Math.PI/2);}
  }
 }
 private jointPivot(type:number,name:string){const side=name.includes('L')?-1:1;this.pivot.set(0,0,0);
  if(name.startsWith('leg')){if(type===2)this.pivot.set(side*.39,.73,name.includes('Back')?-.50:.50);else this.pivot.set(side*(type===1?.31:.25),.70,0);}
  else if(name==='head')this.pivot.set(0,type===2?.86:type===3?1.70:1.80,type===2?.45:0);
  else if(name==='shield')this.pivot.set(0,1.4,.42);
  else if(name.startsWith('wing'))this.pivot.set(side*.38,1.76,0);
  else if(name.startsWith('gun'))this.pivot.set(type===3?side*.43:.61,type===3?2.02:1.4,0);
  else if(name.startsWith('arm'))this.pivot.set(side*.40,1.60,0);
  else if(name==='flame')this.pivot.set(0,1.18,0);else if(name==='aerial')this.pivot.set(0,1.8,-.35);else if(name==='tail')this.pivot.set(0,.81,-.45);
  return this.pivot;
 }
 begin(){this.count=0;this.sockets.clear();for(const d of this.designs)d.count=0;}
 add(t:Target,age:number,velocityX:number,velocityZ:number,yaw:number){
  const type=t.archetype??0;if(type<1||type>4||this.disposed)return;const d=this.designs[type-1];if(d.count>=this.capacity)return;const index=d.count++,speed=Math.min(1.8,Math.hypot(velocityX,velocityZ)),moving=t.stunTime>0?0:speed;
  const planted=(type===3||type===4)&&(t.fireState==='locked'||t.fireState==='fire');
  const motion=age*(type===2?11:7)+t.id*.71,hover=planted?0:type===3?Math.sin(age*3+t.id)*.10:Math.abs(Math.sin(motion))*.023*moving;
  this.stamp.position.set(t.x,hover,-t.z);this.stamp.rotation.set(type===2&&t.skillState===2?-.13:0,yaw,planted?0:-T.MathUtils.clamp(velocityX*.023,-.10,.10));this.stamp.scale.copy(d.scale);this.stamp.updateMatrix();
  for(const b of d.batches){
   this.joint.position.set(0,0,0);this.joint.rotation.set(0,0,0);this.joint.scale.set(1,1,1);
   if(b.joint.startsWith('leg')){const side=b.joint.includes('L')?0:Math.PI,back=b.joint.includes('Back')?Math.PI:0;this.joint.rotation.x=Math.sin(motion+side+back)*Math.min(.28,moving*.15);this.joint.position.y=Math.max(0,Math.sin(motion+side+back))*.055*moving;}
   if(b.joint==='head')this.joint.rotation.y=T.MathUtils.clamp((t.aimX-t.x)*.035,-.16,.16);
   if(b.joint==='shield'){const intact=(t.shieldHp??0)>0;this.joint.scale.setScalar(intact?1:0);this.joint.position.z=(t.blockFlash??0)>0?-.07:0;}
   if(b.joint.startsWith('gun'))this.joint.position.z=t.fireState==='fire'?-.07:0;
   if(b.joint.startsWith('wing'))this.joint.rotation.z=Math.sin(age*4)*(b.joint==='wingL'?1:-1)*.07;
   if(b.joint==='flame')this.joint.scale.y=.92+Math.sin(age*37)*.12;
   if(b.joint.startsWith('arm')&&!planted){this.joint.rotation.z=(b.joint==='armL'?1:-1)*(t.skillState===2?.25:Math.sin(age*3+t.id)*.06);}
   if(b.joint==='aerial')this.joint.rotation.y=Math.sin(age*2)*.10;
   const pivot=this.jointPivot(type,b.joint);this.joint.position.add(pivot);this.joint.updateMatrix();this.inversePivot.makeTranslation(-pivot.x,-pivot.y,-pivot.z);this.joint.matrix.multiply(this.inversePivot);this.world.multiplyMatrices(this.stamp.matrix,this.joint.matrix);b.mesh.setMatrixAt(index,this.world);
   const socketJoint=type===1?'gun':type===2?'head':type===3?(t.id%2?'gunL':'gunR'):'armR';if(b.joint===socketJoint&&!this.sockets.has(t.id)){const tip=type===1?new T.Vector3(.61,1.25,.69):type===2?new T.Vector3(0,.86,.885):type===3?new T.Vector3(t.id%2?-.43:.43,2.18,.60):new T.Vector3(.56,1.06,.75);this.sockets.set(t.id,tip.applyMatrix4(this.world));}
   const flash=t.hit>0||(b.joint==='shield'&&(t.blockFlash??0)>0),glow=b.finish==='energy';this.color.set(flash?0xffffff:glow&&t.skillState===1?0xffd396:glow&&t.skillState===2?0xc3ffff:0xffffff);if(flash)this.color.multiplyScalar(1.8);b.mesh.setColorAt(index,this.color);
  }this.count++;
 }
 end(){for(const d of this.designs)for(const b of d.batches){b.mesh.count=d.count;b.mesh.visible=d.count>0;b.mesh.instanceMatrix.needsUpdate=true;if(b.mesh.instanceColor)b.mesh.instanceColor.needsUpdate=true;}}
 muzzle(t:Target){return this.sockets.get(t.id)?.clone()??new T.Vector3(t.x,1.2,-t.z+.6);}
 reset(){this.begin();this.end();}
 get stats(){return {visible:this.count,batches:this.designs.reduce((n,d)=>n+d.batches.length,0),textures:this.textures.length,triangles:this.designs.map(d=>d.batches.reduce((n,b)=>n+b.mesh.geometry.attributes.position.count/3,0))};}
 dispose(){if(this.disposed)return;this.disposed=true;this.root.removeFromParent();for(const d of this.designs)for(const b of d.batches){b.mesh.geometry.dispose();b.mesh.dispose();}this.materials.forEach(m=>m.dispose());this.textures.forEach(t=>t.dispose());}
}
