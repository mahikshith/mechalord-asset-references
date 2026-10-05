/** Actual scene geometry, motion and ownership checks; no screenshot/FPS claim. */
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Module,{createRequire} from 'node:module';
const here=path.dirname(fileURLToPath(import.meta.url)),dependencies=path.resolve(here,'../asset-viewer');
const require=createRequire(path.join(dependencies,'package.json')),T=require('three'),esbuild=require('esbuild');
const result=await esbuild.build({entryPoints:[path.join(here,'combat-visuals.ts')],bundle:true,platform:'node',format:'cjs',nodePaths:[path.join(dependencies,'node_modules')],write:false});
const runtime=new Module('combat-presentation-polish');runtime._compile(result.outputFiles[0].text,path.join(dependencies,'combat-polish-check.cjs'));
const {CombatMissiles,RobotFormation,EnemyWeaponCues}=runtime.exports;
let passed=0,failed=0;function test(name,run){try{run();passed++;console.log('PASS '+name);}catch(error){failed++;console.error('FAIL '+name+'\n'+error.stack);}}
const scene=new T.Scene(),missiles=new CombatMissiles(scene),robots=new RobotFormation(scene,200),cues=new EnemyWeaponCues(scene,16),baseline=scene.children.length;
const matrix=(mesh,index=0)=>{const m=new T.Matrix4();mesh.getMatrixAt(index,m);return m;};
const position=(mesh,index=0)=>new T.Vector3().setFromMatrixPosition(matrix(mesh,index));
const options={depthScale:1,bossPhase:true,bossZ:12,bossY:1,bossLaunchHeight:4.31,overdrive:false,weapon:1,dt:.05,simulationTime:1,hostileRate:1};
const rocket={id:1,x:1,z:10,dx:0,dz:-12,radius:.3,kind:'rocket',sourceId:0,emitter:'shoulderL',launchX:1,launchZ:10,launchY:5};

test('jacketed shells reflect normal and heavy hazard radii',()=>{
  missiles.reset();missiles.update([],[{...rocket,kind:'shell',radius:.2,id:1},{...rocket,kind:'shell',radius:.58,id:2}],options);
  assert.equal(missiles.hostileShells.count,2);const a=new T.Vector3().setFromMatrixScale(matrix(missiles.hostileShells,0)),b=new T.Vector3().setFromMatrixScale(matrix(missiles.hostileShells,1));assert(Math.abs(b.x/a.x-2.9)<1e-6);assert(b.z>a.z);assert.equal(missiles.bullets.count,0);
  missiles.hostileShells.geometry.computeBoundingBox();assert(missiles.hostileShells.geometry.getAttribute('color'));assert(missiles.hostileShells.material.vertexColors);
});
test('missiles have shaded finned bodies and compact rounded exhaust, not opaque cones',()=>{
  missiles.reset();missiles.update([],[rocket],options);assert.equal(missiles.bodies.count,1);assert.equal(missiles.exhaust.count,1);assert.equal(missiles.bodies.material.type,'MeshStandardMaterial');assert.equal(missiles.exhaust.geometry.type,'SphereGeometry');assert(missiles.exhaust.material.transparent);assert(!missiles.exhaust.material.depthWrite);
  missiles.exhaust.geometry.computeBoundingBox();assert(missiles.exhaust.geometry.boundingBox.getSize(new T.Vector3()).z<.50);missiles.bodies.geometry.computeBoundingBox();const size=missiles.bodies.geometry.boundingBox.getSize(new T.Vector3());assert(size.x>.40);assert(size.z>1.20);
});
test('all six emitters use immutable launch anchors and converge to exact core X/Z within one metre',()=>{
  for(const emitter of ['gunner','armL','armR','shoulderL','shoulderR','core']){missiles.reset();const shot={...rocket,emitter,sourceId:emitter==='gunner'?8:0,launchY:4},key=emitter==='gunner'?'gunner:8':emitter,socket=new T.Vector3(2.3,4,-9.7),opts={...options,emitters:{[key]:socket}};
    missiles.update([],[shot],opts);assert(position(missiles.bodies).distanceTo(socket)<1e-6);
    missiles.update([],[{...shot,z:9.5}],{...opts,simulationTime:1.05,emitters:{[key]:new T.Vector3(9,9,9)}});const half=position(missiles.bodies);assert(Math.abs(half.x-1.65)<1e-6);assert(Math.abs(half.z+9.35)<1e-6);
    missiles.update([],[{...shot,z:8.9}],{...opts,simulationTime:1.1});const actual=position(missiles.bodies);assert(Math.abs(actual.x-shot.x)<1e-6);assert(Math.abs(actual.z+8.9)<1e-6);assert(Math.abs(actual.y-(.85+(4-.85)*.89))<1e-6);
  }
});

test('posed muzzle height is cached once and descends smoothly instead of fading to neutral rig height',()=>{
  missiles.reset();const shot={...rocket,emitter:'armL',launchY:3},socket=new T.Vector3(1.3,5,-9.7),opts={...options,emitters:{armL:socket}};
  missiles.update([],[shot],opts);assert(Math.abs(position(missiles.bodies).y-5)<1e-6);assert.equal(missiles.hostileLaunchZ.get(shot.id).height,5);assert.equal(missiles.hostileLaunchZ.get(shot.id).offset.y,0);
  let previous=5;for(const [i,z]of [9.75,9.5,9,8,7,5].entries()){missiles.update([],[{...shot,z}],{...opts,simulationTime:1+(i+1)*.05,bossY:-2,emitters:{armL:new T.Vector3(-9,1,0)}});const p=position(missiles.bodies);assert(Math.abs(p.y-(.85+(5-.85)*z/10))<1e-6);assert(p.y<previous);previous=p.y;assert.equal(missiles.hostileLaunchZ.get(shot.id).height,5);if(z<=9){assert(Math.abs(p.x-shot.x)<1e-6);assert(Math.abs(p.z+z)<1e-6);}}
  missiles.reset();missiles.update([],[shot],{...options,emitters:{}});assert.equal(missiles.hostileLaunchZ.get(shot.id).height,3);
});

test('stationary and frozen missiles do not manufacture smoke samples',()=>{
  missiles.reset();missiles.update([],[rocket],options);for(let i=1;i<=30;i++)missiles.update([],[rocket],{...options,simulationTime:1+i*.05});assert.equal(missiles.trails.count,0);
  const moving={...rocket,z:9.5};missiles.update([],[moving],{...options,simulationTime:2.6});assert.equal(missiles.trails.count,1);const ages=missiles.trailParticles.map(p=>p.life),clock=missiles.hostileClock;
  for(let i=1;i<=30;i++)missiles.update([],[moving],{...options,hostileRate:0,simulationTime:2.6+i*.05});assert.deepEqual(missiles.trailParticles.map(p=>p.life),ages);assert.equal(missiles.hostileClock,clock);assert.equal(missiles.trails.count,1);
});
test('moving missile trails fade shortly and remain inside 192 slots',()=>{
  missiles.reset();for(let frame=0;frame<30;frame++)missiles.update([],Array.from({length:120},(_,id)=>({...rocket,id,z:10-frame*.15})),{...options,simulationTime:1+frame*.05});assert(missiles.trails.count>0);assert(missiles.trails.count<=192);assert(missiles.hostileLaunchZ.size<=96);
  for(let i=0;i<10;i++)missiles.update([],[],{...options,simulationTime:3+i*.05});assert.equal(missiles.trails.count,0);assert.equal(missiles.hostileLaunchZ.size,0);
});
test('beam buildup stays at actual core and cannot show a damaging beam early',()=>{
  missiles.reset();const socket=new T.Vector3(.4,5,-11);missiles.update([],[],{...options,emitters:{core:socket},bossCharging:true,bossCharge:.8});assert.equal(missiles.beamEmitter.count,1);assert(position(missiles.beamEmitter).distanceTo(socket)<1e-6);assert.equal(missiles.beamShells.count,0);assert.equal(missiles.beamContact.count,0);
});
test('layered plasma keeps real centreline, width and end contact with bounded axial flow',()=>{
  missiles.reset();const from=new T.Vector3(.4,5,-11),beam={id:1,x:.4,z:11,endX:-1,endZ:0,width:.3,time:.7};missiles.update([],[],{...options,emitters:{core:from},lasers:[beam]});
  assert.equal(missiles.beamShells.count,1);assert.equal(missiles.beamFlow.count,72);assert.equal(missiles.beamContact.count,12);for(let i=0;i<12;i++){const spark=position(missiles.beamContact,i);assert(spark.distanceTo(new T.Vector3(-1,.07,0))<.65);assert(spark.y>.07);}
  assert.equal(missiles.beamGround.count,1);assert(Math.abs(position(missiles.beamGround).y-.026)<1e-6);assert.equal(missiles.beamLight.visible,true);
  const center=position(missiles.beamShells),scale=new T.Vector3().setFromMatrixScale(matrix(missiles.beamShells));assert(center.distanceTo(from.clone().add(new T.Vector3(-1,.07,0)).multiplyScalar(.5))<1e-6);assert(Math.abs(scale.x-.3)<1e-6);assert(Math.abs(scale.y-.3)<1e-6);
  assert(missiles.beamShells.material.transparent);assert(!missiles.beamShells.material.depthWrite);const shader={uniforms:{},vertexShader:'#include <common>\n#include <begin_vertex>',fragmentShader:'#include <common>\n#include <color_fragment>'};missiles.beamShells.material.onBeforeCompile(shader);assert(shader.uniforms.uCombatTime);assert(shader.fragmentShader.includes('float helix'));assert(shader.vertexShader.includes('vEnergyUv = uv;'));assert(!shader.fragmentShader.includes('\\n'));
  missiles.update([],[],{...options,lasers:Array.from({length:12},(_,id)=>({...beam,id}))});assert.equal(missiles.beamShells.count,4);assert.equal(missiles.beamFlow.count,288);assert.equal(missiles.beamContact.count,48);
});
test('zero-time presentation freezes plasma, exhaust and trail resource state',()=>{
  missiles.reset();const opts={...options,lasers:[{id:1,x:0,z:10,endX:0,endZ:0,width:.3,time:.5}]};missiles.update([],[rocket],opts);const before=[matrix(missiles.exhaust).elements,matrix(missiles.beamFlow).elements,missiles.plasmaTime.value,missiles.hostileLaunchZ.get(1).trailClock];
  for(let i=0;i<10;i++)missiles.update([],[rocket],opts);assert.deepEqual([matrix(missiles.exhaust).elements,matrix(missiles.beamFlow).elements,missiles.plasmaTime.value,missiles.hostileLaunchZ.get(1).trailClock],before);
  missiles.update([],[],{...opts,lasers:[],bossCharging:false});assert.equal(missiles.beamContact.count,0);assert.equal(missiles.beamEmitter.count,0);assert.equal(missiles.beamGround.count,0);assert.equal(missiles.beamLight.visible,false);
});
test('robot gait articulates arms and suspension while torso remains planted',()=>{
  robots.reset();robots.begin();robots.add(0,-5,1,0,false,0);robots.end();const torso=matrix(robots.body),arm=matrix(robots.arms),leg=matrix(robots.legs);
  robots.begin();robots.add(0,-5,1,0,false,.2);robots.end();assert.deepEqual(matrix(robots.body).elements,torso.elements);assert(!matrix(robots.arms).equals(arm));assert(!matrix(robots.legs).equals(leg));assert.equal(robots.arms.count,2);assert.equal(robots.legs.count,2);
});
test('stable enemy IDs smoothly turn from real velocity and freeze at dt zero',()=>{
  robots.reset();const add=motion=>{robots.begin();robots.add(0,-5,1,0,false,0,motion);robots.end();};add({id:7,dt:.1,velocityX:2,velocityZ:0});assert(robots.poses.get(7).yaw>0&&robots.poses.get(7).yaw<Math.PI/2);const before=[matrix(robots.body).elements,matrix(robots.arms).elements];add({id:7,dt:0,velocityX:2,velocityZ:0});assert.deepEqual([matrix(robots.body).elements,matrix(robots.arms).elements],before);for(let i=0;i<20;i++)add({id:7,dt:.1,velocityX:2,velocityZ:0});assert(Math.abs(robots.poses.get(7).yaw-Math.PI/2)<.001);
  robots.begin();robots.end();assert.equal(robots.poses.size,0);
});
test('gunner charge rings attach to the actual posed barrel socket',()=>{
  cues.update([{id:6,kind:'enemy',variant:2,hp:2,x:0,z:10,charge:1,fireState:'locked',aimX:1}],true,{'gunner:6':new T.Vector3(.2,1.9,-9.4)});assert(position(cues.charges).distanceTo(new T.Vector3(.2,1.9,-9.4))<1e-6);assert.equal(position(cues.locks).x,1);
});

test('soft light has radial fade, true beam retains width, and filaments stay inside it',()=>{
  missiles.reset();const from=new T.Vector3(.4,5,-11),to=new T.Vector3(-1,.07,0),width=.3,opts={...options,emitters:{core:from},lasers:[{id:1,x:.4,z:11,endX:-1,endZ:0,width,time:.7}]};missiles.update([],[],opts);
  assert.equal(missiles.beamSheath.count,1);assert.equal(missiles.beamCorona.count,2);assert.equal(missiles.beamSheath.material.blending,T.AdditiveBlending);assert(missiles.beamSheath.material.fragmentShader.includes('radialFade'));assert(missiles.beamSheath.material.fragmentShader.includes('noise*ends'));assert(missiles.beamCores.material.opacity>.5);assert.equal(missiles.beamContact.geometry.type,'CylinderGeometry');
  const line=new T.Line3(from,to);for(let i=0;i<72;i++){const p=position(missiles.beamFlow,i),nearest=line.closestPointToPoint(p,true,new T.Vector3()),scale=new T.Vector3().setFromMatrixScale(matrix(missiles.beamFlow,i));assert(p.distanceTo(nearest)+scale.x*.5<width*.5);}
  const radius=new T.Vector3().setFromMatrixScale(matrix(missiles.beamShells));assert(Math.abs(radius.x-width)<1e-6);const light=new T.Vector3().setFromMatrixScale(matrix(missiles.beamSheath));assert(Math.abs(light.x-width*3)<1e-6);
  const before=matrix(missiles.beamFlow).elements,ends=matrix(missiles.beamContact).elements;missiles.update([],[],{...opts,simulationTime:1.1});assert.notDeepEqual(matrix(missiles.beamFlow).elements,before);assert.notDeepEqual(matrix(missiles.beamContact).elements,ends);const frozen=matrix(missiles.beamContact).elements;missiles.update([],[],{...opts,simulationTime:1.2,hostileRate:0});assert.deepEqual(matrix(missiles.beamContact).elements,frozen);
});


test('electrical lightning branches span the full active beam and freeze exactly',()=>{
  missiles.reset();const from=new T.Vector3(.4,5,-11),to=new T.Vector3(-1,.07,0),beam={id:1,x:.4,z:11,endX:-1,endZ:0,width:.3,time:.7},opts={...options,emitters:{core:from},lasers:[beam]};missiles.update([],[],opts);assert.equal(missiles.beamLightning.count,96);const line=new T.Line3(from,to),axis=to.clone().sub(from),range=axis.length();axis.normalize();let min=Infinity,max=-Infinity,offCore=0;
  for(let i=0;i<96;i++){const p=position(missiles.beamLightning,i),nearest=line.closestPointToPoint(p,true,new T.Vector3()),along=p.clone().sub(from).dot(axis);min=Math.min(min,along);max=Math.max(max,along);if(p.distanceTo(nearest)>.15)offCore++;assert(p.toArray().every(Number.isFinite));}
  assert(min<range*.04);assert(max>range*.95);assert(offCore>15);assert.equal(missiles.beamLightning.material.blending,T.AdditiveBlending);
  const before=matrix(missiles.beamLightning,8).elements;missiles.update([],[],{...opts,simulationTime:1.1});assert.notDeepEqual(matrix(missiles.beamLightning,8).elements,before);const freeze=matrix(missiles.beamLightning,8).elements;missiles.update([],[],{...opts,simulationTime:1.2,hostileRate:0});assert.deepEqual(matrix(missiles.beamLightning,8).elements,freeze);
  missiles.update([],[],{...opts,lasers:Array.from({length:9},(_,id)=>({...beam,id})),simulationTime:1.3});assert.equal(missiles.beamLightning.count,384);missiles.reset();assert.equal(missiles.beamLightning.count,0);
});
test('commander rockets and hostile rockets leave distinct hot tails only on displacement',()=>{
  missiles.reset();const shot={x:0,z:1,dx:0,dz:20,kind:'missile',owner:'commander',heavy:true};missiles.update([shot],[],options);missiles.update([{...shot,z:2}],[],{...options,simulationTime:1.05});assert.equal(missiles.hotTrails.count,1);assert.equal(missiles.trails.count,1);const color=new T.Color();missiles.hotTrails.getColorAt(0,color);assert(color.r>color.b);
  const clock=missiles.hostileClock;missiles.update([{...shot,z:3}],[],{...options,simulationTime:1.1,hostileRate:0});assert.equal(missiles.hostileClock,clock);assert(missiles.hotTrails.count>=1);assert(missiles.trailParticles.filter(p=>p.life>0).every(p=>!p.enemy));
  missiles.reset();missiles.update([],[rocket],options);missiles.update([],[{...rocket,z:9.5}],{...options,simulationTime:1.05});assert.equal(missiles.hotTrails.count,1);assert.equal(missiles.trails.count,1);assert(missiles.trailParticles.filter(p=>p.life>0).every(p=>p.enemy));assert(missiles.hotTrails.material.transparent);assert(!missiles.hotTrails.material.depthWrite);
});
test('solid bullets and actual shell streaks remain bounded, separate and readable',()=>{
  missiles.reset();missiles.update(Array.from({length:900},(_,i)=>({x:i%8,z:3,dx:0,dz:32,kind:'pulse',owner:i%2?'commander':'troop',heavy:false})),Array.from({length:120},(_,id)=>({...rocket,id,kind:'shell',radius:.58})),options);assert.equal(missiles.bullets.count,768);assert.equal(missiles.wakes.count,768);assert.equal(missiles.hostileShells.count,96);assert.equal(missiles.shellStreaks.count,96);missiles.bullets.geometry.computeBoundingBox();assert(missiles.bullets.geometry.boundingBox.getSize(new T.Vector3()).z>.49);assert.equal(missiles.shellStreaks.geometry.type,'CapsuleGeometry');missiles.reset();assert.equal(missiles.shellStreaks.count,0);assert.equal(missiles.hotTrails.count,0);
});

test('enemy rockets retain their reserved slots under a saturated friendly rocket volley',()=>{
  missiles.reset();missiles.update(Array.from({length:900},(_,i)=>({x:i%8,z:3,dx:0,dz:32,kind:'missile',owner:'commander',heavy:true})),Array.from({length:120},(_,id)=>({...rocket,id})),options);assert.equal(missiles.bodies.count,864);assert.equal(missiles.exhaust.count,864);assert(position(missiles.bodies,863).toArray().every(Number.isFinite));assert.equal(missiles.hostileLaunchZ.size,96);missiles.reset();assert.equal(missiles.bodies.count,0);
});
test('300 retries retain fixed pools, bounded target memory and zero lingering effects',()=>{
  for(let i=0;i<300;i++){robots.begin();for(let id=0;id<250;id++)robots.add(0,-5,1,0,false,0,{id,dt:.05,velocityX:1,velocityZ:1});robots.end();assert(robots.poses.size<=200);assert.equal(robots.body.count,200);assert.equal(robots.arms.count,400);missiles.update([],[rocket],options);missiles.reset();robots.reset();cues.reset();assert.equal(scene.children.length,baseline);assert.equal(missiles.beamFlow.count,0);assert.equal(missiles.hostileLaunchZ.size,0);assert.equal(robots.poses.size,0);}
});
test('every new geometry and material is disposed once without scene remnants',()=>{
  const resources=new Set();scene.traverse(mesh=>{if(mesh.isMesh){resources.add(mesh.geometry);for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material])resources.add(m);}});let disposed=0;resources.forEach(r=>r.addEventListener('dispose',()=>disposed++));missiles.dispose();robots.dispose();cues.dispose();assert.equal(disposed,resources.size);assert.equal(scene.children.length,0);
});
console.log(`${passed}/${passed+failed} focused combat presentation checks passed. Pools: missiles21 draw calls maximum, robots5, charge cues2; runtime screenshots/device FPS require separate verification.`);if(failed)process.exitCode=1;
