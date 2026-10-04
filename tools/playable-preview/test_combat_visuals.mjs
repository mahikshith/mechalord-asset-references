/** CPU scene/resource checks. Does not claim WebGL rendering or device FPS. */
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Module, {createRequire} from 'node:module';

const here=path.dirname(fileURLToPath(import.meta.url));
const dependencyRoot=path.resolve(here,'../asset-viewer');
const require=createRequire(path.join(dependencyRoot,'package.json'));
const T=require('three'),esbuild=require('esbuild');
const bundle=await esbuild.build({entryPoints:[path.join(here,'combat-visuals.ts')],bundle:true,
  platform:'node',format:'cjs',nodePaths:[path.join(dependencyRoot,'node_modules')],write:false});
const module=new Module('combat-visuals-cpu-check');
module._compile(bundle.outputFiles[0].text,path.join(dependencyRoot,'combat-check-inline.cjs'));
const {CombatVisuals,CombatMissiles,RobotFormation,ArmyAbilityVisuals}=module.exports;
const arsenalBundle=await esbuild.build({entryPoints:[path.join(here,'arsenal-visuals.ts')],bundle:true,
  platform:'node',format:'cjs',nodePaths:[path.join(dependencyRoot,'node_modules')],write:false});
const arsenalModule=new Module('arsenal-visuals-cpu-check');
arsenalModule._compile(arsenalBundle.outputFiles[0].text,path.join(dependencyRoot,'arsenal-check-inline.cjs'));
const {ArsenalVisuals,createPickup,updatePickup,disposePickup}=arsenalModule.exports;
let failures=0,passed=0;
function test(name,run){try{run();passed++;console.log('PASS '+name);}catch(error){failures++;console.error('FAIL '+name+'\n'+error.stack);}}
function allEffectsExpire(fx){for(let i=0;i<45;i++)fx.update(.15);}
const scene=new T.Scene(),fx=new CombatVisuals(scene),missiles=new CombatMissiles(scene),robots=new RobotFormation(scene,200),abilities=new ArmyAbilityVisuals(scene);
const emptyCount=scene.children.length;

test('500 explosions keep shared chunks and particles bounded',()=>{
  for(let i=0;i<500;i++)fx.enemyDeath(i%4,-5,1,1.4);fx.update(1/60);
  const stats=fx.stats();assert(stats.debris<=384);assert(stats.fire+stats.smoke<=256);
  assert.equal(scene.children.length,emptyCount);
});
test('zero dt freezes chunks and particles exactly',()=>{
  const chunk=fx.chunks[0],puff=fx.puffs[0],before=[...chunk.p.toArray(),chunk.life,...puff.p.toArray(),puff.life];
  fx.update(0);assert.deepEqual([...chunk.p.toArray(),chunk.life,...puff.p.toArray(),puff.life],before);
});
test('debris falls, bounces, remains finite, and expires',()=>{
  fx.reset();fx.enemyDeath(0,-3);for(let i=0;i<120;i++){fx.update(1/60);for(const c of fx.chunks)if(c.life>0){assert(c.p.y>=0);assert(c.p.toArray().every(Number.isFinite));}}
  assert(fx.chunks.some(c=>c.bounce>0));allEffectsExpire(fx);assert.deepEqual([fx.stats().debris,fx.stats().smoke,fx.stats().fire],[0,0,0]);
});
test('ally casualties make at most eight ivory/dark chunks per event',()=>{
  fx.reset();fx.allyLoss(1,2,80);fx.update(0);assert.equal(fx.stats().debris,8);
  assert(fx.chunks.slice(0,384).filter(c=>c.life>0).some(c=>c.color.equals(new T.Color(0xd5c9a9))));fx.reset();fx.allyLoss(1,2,0);assert.equal(fx.stats().debris,0);
});
test('ally casualty fragments originate at the authoritative hit position',()=>{
  fx.reset();fx.allyLoss(2.4,3.15,3);fx.update(0);
  for(const chunk of fx.chunks)if(chunk.life>0){assert(Math.abs(chunk.p.x-2.4)<.36);assert(Math.abs(chunk.p.z-3.15)<.36);}
});

const boss=new T.Group();boss.position.set(2,0,-12);boss.rotation.y=.4;boss.scale.setScalar(1.3);scene.add(boss);
const bossMaterial=new T.MeshStandardMaterial(),bossGeometry=new T.BoxGeometry(.5,.7,.4);let sourceGeometryDisposed=false;
bossGeometry.addEventListener('dispose',()=>sourceGeometryDisposed=true);
for(let i=0;i<14;i++){const mesh=new T.Mesh(bossGeometry,bossMaterial);mesh.name=i===0?'Torso_MobileMesh':'Arm_R_MobileMesh';mesh.position.set(i*.1,1+i*.05,0);boss.add(mesh);}
const invisibleGlow=new T.Mesh(new T.SphereGeometry(.2),new T.MeshBasicMaterial({opacity:0,transparent:true,blending:T.AdditiveBlending}));boss.add(invisibleGlow);
test('boss fragments match actual source world bounds and omit muzzle glow',()=>{
  boss.updateWorldMatrix(true,true);const original=new T.Box3().setFromObject(boss.children[0]);
  assert(fx.bossDeath(boss));assert.equal(fx.stats().bossFragments,14);assert.equal(fx.bossDeath(boss),false);
  const fragment=new T.Box3().setFromObject(fx.fragments[0].group);
  assert(original.min.distanceTo(fragment.min)<1e-6);assert(original.max.distanceTo(fragment.max)<1e-6);
  assert(fx.fragments[0].delay>.5);assert(fx.fragments[1].delay<.5);
});
test('boss settles by the result overlay and keeps a bounded wreck until retry',()=>{
  let disposed=0;for(const f of fx.fragments)for(const m of f.materials)m.addEventListener('dispose',()=>disposed++);
  for(let i=0;i<17;i++)fx.update(.15);assert.equal(fx.stats().bossFragments,14);assert(fx.fragments.every(f=>f.settled));
  const positions=fx.fragments.map(f=>f.group.position.toArray());
  for(let i=0;i<6;i++)fx.update(.15);assert.deepEqual(fx.fragments.map(f=>f.group.position.toArray()),positions);assert.equal(disposed,0);
  fx.reset();assert.equal(fx.stats().bossFragments,0);assert.equal(disposed,14);assert.equal(sourceGeometryDisposed,false);
});
test('boss dismantling caps at 24 pieces',()=>{
  fx.reset();for(let i=0;i<30;i++)boss.add(new T.Mesh(bossGeometry,bossMaterial));fx.bossDeath(boss);assert.equal(fx.stats().bossFragments,24);fx.reset();
});
test('commander death freezes current skin pose and keeps boss wreck independent',()=>{
  const root=new T.Group(),geometry=new T.BoxGeometry(1.2,2,.5,2,6,1),count=geometry.getAttribute('position').count;
  const indices=new Uint16Array(count*4),weights=new Float32Array(count*4);for(let i=0;i<count;i++){indices[i*4]=geometry.getAttribute('position').getY(i)>0?1:0;weights[i*4]=1;}
  geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
  const mesh=new T.SkinnedMesh(geometry,new T.MeshStandardMaterial());const bone=new T.Bone(),upper=new T.Bone();bone.add(upper);mesh.add(bone);mesh.bind(new T.Skeleton([bone,upper]));root.add(mesh);root.position.set(-1,1.4,2.2);scene.add(root);
  upper.rotation.z=.25;root.updateWorldMatrix(true,true);mesh.skeleton.update();
  let min=new T.Vector3(Infinity,Infinity,Infinity),max=new T.Vector3(-Infinity,-Infinity,-Infinity),point=new T.Vector3();for(let i=0;i<count;i++){mesh.getVertexPosition(i,point).applyMatrix4(mesh.matrixWorld);min.min(point);max.max(point);}
  fx.bossDeath(boss);const bossCount=fx.stats().bossFragments;assert(fx.commanderDeath(root));assert.equal(fx.commanderDeath(root),false);assert(fx.stats().commanderFragments>1);assert(fx.stats().commanderFragments<=12);assert.equal(fx.stats().bossFragments,bossCount);
  const merged=new T.Box3();for(const fragment of fx.commanderFragments)merged.union(new T.Box3().setFromObject(fragment.group));assert(merged.min.distanceTo(min)<1e-6);assert(merged.max.distanceTo(max)<1e-6);
  const owned=fx.commanderFragments.map(f=>f.ownedGeometry).filter(Boolean);let disposed=0;owned.forEach(g=>g.addEventListener('dispose',()=>disposed++));fx.update(.1);const old=fx.commanderFragments.map(f=>f.group.position.toArray());fx.update(0);assert.deepEqual(fx.commanderFragments.map(f=>f.group.position.toArray()),old);
  fx.reset();assert.equal(disposed,owned.length);assert.equal(fx.stats().bossFragments,0);assert.equal(fx.stats().commanderFragments,0);scene.remove(root);geometry.dispose();mesh.material.dispose();
});
test('300 retries do not accumulate scene objects or fragments',()=>{
  const base=scene.children.length;for(let i=0;i<300;i++){fx.enemyDeath(0,-3);fx.bossDeath(boss);fx.update(.02);fx.reset();robots.reset();missiles.reset();abilities.reset();assert.equal(scene.children.length,base);assert.equal(fx.stats().bossFragments,0);}
});
test('enemy wave uses modeled geometry, bounded to 200 robots',()=>{
  robots.begin();for(let i=0;i<250;i++)robots.add(i*.1,-5);robots.end();assert.equal(robots.body.count,200);assert.equal(robots.eyes.count,200);
  assert.equal((robots.body.geometry.getAttribute('position').count+robots.eyes.geometry.getAttribute('position').count)/3,444);
  const matrix=new T.Matrix4();robots.body.getMatrixAt(0,matrix);const scale=new T.Vector3().setFromMatrixScale(matrix);assert(Math.abs(scale.x-.82)<1e-6);assert(Math.abs(scale.y-1.1)<1e-6);
});
test('marching robot phase moves suspension and treads without adding objects',()=>{
  const count=scene.children.length,bodyBefore=new T.Matrix4(),markBefore=new T.Matrix4();robots.body.getMatrixAt(0,bodyBefore);robots.treadMark.getMatrixAt(0,markBefore);
  robots.begin();robots.add(0,-5,1,0,false,.17);robots.end();const bodyAfter=new T.Matrix4(),markAfter=new T.Matrix4();robots.body.getMatrixAt(0,bodyAfter);robots.treadMark.getMatrixAt(0,markAfter);
  assert(!bodyBefore.equals(bodyAfter));assert(!markBefore.equals(markAfter));assert.equal(scene.children.length,count);assert.equal(robots.treadMark.count,2);
});
const missileOptions={depthScale:1,bossPhase:true,bossZ:9,overdrive:true,weapon:3};
test('1,000 missiles stay inside the 768 slot pool',()=>{
  missiles.update(Array.from({length:1000},()=>({x:0,z:2,heavy:true,dx:1,dz:2,kind:'arc'})),[],missileOptions);assert.equal(missiles.bullets.count,768);assert.equal(missiles.bodies.count,0);assert.equal(missiles.exhaust.count,0);
});
test('missile orientation follows real dx/dz and boss launch height follows bossZ',()=>{
  missiles.update([{x:1,z:2,heavy:true,dx:2,dz:3,kind:'rail'}],[{id:3,x:2,z:9,dx:0,dz:-4,radius:.2,kind:'rocket'}],missileOptions);
  const matrix=new T.Matrix4();missiles.bullets.getMatrixAt(0,matrix);const forward=new T.Vector3(0,0,1).transformDirection(matrix),expected=new T.Vector3(2,0,-3).normalize();assert(forward.distanceTo(expected)<1e-6);
  missiles.bodies.getMatrixAt(0,matrix);assert(Math.abs(new T.Vector3().setFromMatrixPosition(matrix).y-3)<1e-6);
});
test('only guided missiles use fins/exhaust, standard fire uses solid bullets',()=>{
  const shots=[{x:0,z:2,heavy:false,dx:0,dz:32,kind:'pulse'},{x:1,z:2,heavy:true,dx:0,dz:32,kind:'cannon'},{x:2,z:2,heavy:true,dx:0,dz:32,kind:'missile'}];
  missiles.update(shots,[],{...missileOptions,overdrive:false});assert.equal(missiles.bullets.count,2);assert.equal(missiles.tips.count,2);assert.equal(missiles.bodies.count,1);assert.equal(missiles.exhaust.count,1);assert.equal(missiles.wakes.count,0);
});
test('troop bullets are cyan-blue and commander bullets warm gold',()=>{
  const base={x:0,z:1,dx:0,dz:32,heavy:false,kind:'pulse'};missiles.update([{...base,owner:'troop'},{...base,x:1,owner:'commander'}],[],{...missileOptions,overdrive:false});
  const troop=new T.Color(),commander=new T.Color();missiles.tips.getColorAt(0,troop);missiles.tips.getColorAt(1,commander);assert(troop.b>troop.r*2);assert(commander.r>commander.b*2);assert(!troop.equals(commander));
  missiles.bullets.getColorAt(0,troop);missiles.bullets.getColorAt(1,commander);assert(troop.b>troop.r);assert(commander.r>commander.b);
});
test('hostile energy orbs have bounded solid red shells and orange cores',()=>{
  missiles.update([],Array.from({length:120},(_,id)=>({id,x:0,z:9,dx:0,dz:-4,radius:.2,kind:'orb'})),missileOptions);assert.equal(missiles.orbs.count,96);assert.equal(missiles.orbCores.count,96);
  assert(missiles.orbs.material.color.r>missiles.orbs.material.color.b);assert(missiles.orbCores.material.color.r>missiles.orbCores.material.color.b);missiles.reset();assert.equal(missiles.orbCores.count,0);
});
test('friendly powers launch from their actual rig heights and approach target height',()=>{
  for(const [kind,height] of [['missile',2.08],['cannon',1.42],['rail',1.8],['pulse',1.35]]){
    const shot={x:0,z:0,heavy:true,dx:0,dz:32,kind};missiles.update([shot],[],{...missileOptions,overdrive:false});const mesh=kind==='missile'?missiles.bodies:missiles.bullets,matrix=new T.Matrix4();mesh.getMatrixAt(0,matrix);assert(Math.abs(new T.Vector3().setFromMatrixPosition(matrix).y-height)<1e-6);
    shot.z=10;missiles.update([shot],[],{...missileOptions,overdrive:false});mesh.getMatrixAt(0,matrix);assert(Math.abs(new T.Vector3().setFromMatrixPosition(matrix).y-1.25)<1e-6);
  }
});
test('already-launched projectile height does not jump when boss moves',()=>{
  missiles.reset();const projectile={id:7,x:0,z:10,dx:0,dz:-4,radius:.2,kind:'rocket'};
  missiles.update([], [projectile], {...missileOptions,bossZ:12});const matrix=new T.Matrix4();missiles.bodies.getMatrixAt(0,matrix);const before=new T.Vector3().setFromMatrixPosition(matrix).y;
  missiles.update([], [projectile], {...missileOptions,bossZ:7});missiles.bodies.getMatrixAt(0,matrix);assert.equal(new T.Vector3().setFromMatrixPosition(matrix).y,before);
  missiles.update([], [], missileOptions);assert.equal(missiles.hostileLaunchZ.size,0);
});
test('boss hover is included in cached projectile launch height',()=>{
  missiles.reset();missiles.update([],[{id:9,x:0,z:12,dx:0,dz:-4,radius:.2,kind:'rocket'}],{...missileOptions,bossZ:12,bossY:.7,bossLaunchHeight:4});
  const matrix=new T.Matrix4();missiles.bodies.getMatrixAt(0,matrix);assert(Math.abs(new T.Vector3().setFromMatrixPosition(matrix).y-4.7)<1e-6);
});
const state={x:3,ability:3,relic:0,targets:[]},abilityOptions={depthScale:1,armyRadius:3,armyCenterX:1.4,armyCenterZ:3.17};
test('shield encloses clamped army centroid and the tall commander',()=>{
  abilities.update(state,abilityOptions,.016);assert(abilities.dome.visible);assert.equal(abilities.group.position.x,1.4);
  const radius=abilities.dome.scale.x,height=abilities.dome.scale.y,heroDistance=Math.hypot(3-1.4,3.17);
  assert(radius>=3.65);assert((heroDistance/radius)**2+(2.8/height)**2<1);
});
test('EMP arcs attach only to authoritative affected enemy positions',()=>{
  state.relic=1;state.targets=[{id:1,kind:'enemy',hp:3,x:3,z:7},{id:2,kind:'enemy',hp:3,x:-3,z:7},{id:3,kind:'enemy',hp:3,x:3,z:14},{id:4,kind:'crate',hp:3,x:3,z:5}];
  abilities.update(state,abilityOptions,.016);assert(abilities.arcs.visible);assert.equal(abilities.arcs.geometry.drawRange.count,6);assert(abilities.wave.visible);assert.equal(abilities.dome.visible,false);
  assert(Math.abs(abilities.arcPositions[2]+7+3.17)<.4);assert.equal(abilities.wave.position.z,-3.17);
});
test('Overdrive has its own visible signal and pause freezes ability clock',()=>{
  state.relic=2;abilities.update(state,abilityOptions,.016);assert(abilities.overdrive.visible);const clock=abilities.clock;abilities.update(state,abilityOptions,0);assert.equal(abilities.clock,clock);
});
test('nearby boss receives its separate EMP visual cue',()=>{
  const bossState={...state,relic:1,phase:'boss',bossHp:100,bossX:3,bossZ:13.5,targets:[]};abilities.update(bossState,abilityOptions,.016);assert(abilities.arcs.visible);assert.equal(abilities.arcs.geometry.drawRange.count,16);
  bossState.bossZ=14;abilities.update(bossState,abilityOptions,.016);assert.equal(abilities.arcs.visible,false);
});
test('time fields mark actual hostiles and expire without scene allocations',()=>{
  const base={...state,ability:0,relic:0,phase:'run',frontline:6,targets:Array.from({length:30},(_,id)=>({id,kind:'enemy',hp:1,x:id%3-1,z:5+id*.2,variant:0}))};const objects=scene.children.length;
  abilities.update({...base,timePower:'freeze',timePowerTime:3},abilityOptions,.1);assert.equal(abilities.timeRings.count,16);assert.equal(abilities.timeHands.count,0);assert(abilities.frostSweep.visible);assert(abilities.group.visible);
  const clock=abilities.clock,matrix=new T.Matrix4();abilities.timeRings.getMatrixAt(0,matrix);const before=matrix.clone();abilities.update({...base,timePower:'freeze',timePowerTime:3},abilityOptions,0);assert.equal(abilities.clock,clock);abilities.timeRings.getMatrixAt(0,matrix);assert(before.equals(matrix));
  const position=new T.Vector3().setFromMatrixPosition(matrix);assert(Math.abs(position.x-(base.targets[0].x-abilityOptions.armyCenterX))<1e-6);assert(Math.abs(position.z-(-base.targets[0].z-abilityOptions.armyCenterZ))<1e-6);
  abilities.update({...base,timePower:'slow',timePowerTime:3},abilityOptions,.1);assert.equal(abilities.timeHands.count,16);assert(!abilities.frostSweep.visible);
  abilities.update({...base,timePower:'haste',timePowerTime:3},abilityOptions,.1);assert(abilities.hasteTrace.visible);assert.equal(abilities.timeRings.count,0);
  abilities.update({...base,timePower:'haste',timePowerTime:0},abilityOptions,.1);assert(!abilities.hasteTrace.visible);assert.equal(abilities.timeHands.count,0);assert.equal(scene.children.length,objects);abilities.reset();assert.equal(abilities.timeRings.count,0);assert(!abilities.group.visible);
});
test('pickup armor transformation is bounded, freezes, follows hero, and expires',()=>{
  fx.reset();const hero=new T.Group();hero.add(new T.Mesh(new T.BoxGeometry(1,3,.8),new T.MeshBasicMaterial()));hero.position.set(2,0,4);scene.add(hero);const childCount=scene.children.length;
  for(let i=0;i<100;i++)fx.powerAcquire(hero,['guided','cannons','railburst','freeze','slow','haste'][i%6]);fx.update(.1);assert.equal(fx.stats().acquirePulses,4);assert.equal(fx.acquireRing.count,4);assert.equal(fx.acquireTrace.count,32);assert.equal(scene.children.length,childCount);
  const old=fx.acquisitions.map(p=>p.age),matrix=new T.Matrix4();fx.acquireRing.getMatrixAt(0,matrix);const before=matrix.clone();fx.update(0);fx.acquireRing.getMatrixAt(0,matrix);assert(before.equals(matrix));assert.deepEqual(fx.acquisitions.map(p=>p.age),old);
  hero.position.x=1;fx.update(.1);fx.acquireRing.getMatrixAt(0,matrix);assert(Math.abs(new T.Vector3().setFromMatrixPosition(matrix).x-1)<1e-6);
  for(let i=0;i<8;i++)fx.update(.1);assert.equal(fx.stats().acquirePulses,0);assert.equal(fx.acquireRing.count,0);assert.equal(fx.acquireTrace.count,0);fx.reset();scene.remove(hero);hero.children[0].geometry.dispose();hero.children[0].material.dispose();
});
test('per-instance fading preserves shader chunk hooks and alpha capacity',()=>{
  for(const mesh of [fx.debris,fx.smoke,fx.fire,fx.acquireRing,fx.acquireTrace]){const shader={vertexShader:'#include <common>\n#include <begin_vertex>',fragmentShader:'#include <common>\n#include <color_fragment>'};mesh.material.onBeforeCompile(shader);assert(shader.vertexShader.includes('vInstanceOpacity = instanceOpacity'));assert(shader.fragmentShader.includes('diffuseColor.a *= vInstanceOpacity'));assert.equal(mesh.geometry.getAttribute('instanceOpacity').count,mesh===fx.debris?384:mesh===fx.acquireRing?4:mesh===fx.acquireTrace?32:256);}
});
const arsenalHero=new T.Group(),arsenalBoss=new T.Group(),arsenal=new ArsenalVisuals(arsenalHero,arsenalBoss);
const arsenalState={phase:'run',weaponPower:'none',powerTime:0,shots:[],bossAction:'strafe',bossPhase:1,bossPattern:'heavy',bossY:0,bossAttack:0};
test('hand cannon power is temporary and never inferred from weapon tier',()=>{
  arsenal.update({...arsenalState,weapon:4},.1);assert.equal(arsenal.cannons.visible,false);
  arsenal.update({...arsenalState,weaponPower:'cannons',powerTime:4,shots:[{z:.8,dx:0,dz:32}]},.1);assert(arsenal.cannons.visible);assert(arsenal.hands.some(h=>h.flash.visible));assert(arsenal.hands[0].rotor.rotation.z>0);
  arsenal.update({...arsenalState,weaponPower:'cannons',powerTime:0},.1);assert.equal(arsenal.cannons.visible,false);
});
test('troop shots cannot falsely trigger commander cannon recoil',()=>{
  arsenal.reset();arsenal.update({...arsenalState,weaponPower:'cannons',powerTime:3,shots:[{owner:'troop',z:-.7,dx:0,dz:32}]},.1);assert(arsenal.hands.every(h=>!h.flash.visible));assert.equal(arsenal.recoil,0);
});
test('arsenal pause freezes transforms and angled aim wraps correctly',()=>{
  const s={...arsenalState,weaponPower:'cannons',powerTime:2,shots:[{z:.8,dx:-.1,dz:32}]};arsenal.update(s,.1);assert(Math.abs(arsenal.hands[0].group.rotation.y-Math.PI)<.02);
  const clock=arsenal.clock,spin=arsenal.hands[0].rotor.rotation.z,position=arsenal.hands[0].group.position.clone();arsenal.update(s,0);assert.equal(arsenal.clock,clock);assert.equal(arsenal.hands[0].rotor.rotation.z,spin);assert(position.equals(arsenal.hands[0].group.position));
});
test('boss phase unfolds cannons and authoritative hover enables jets',()=>{
  const s={...arsenalState,phase:'boss',bossPhase:2,bossPattern:'heavy',bossAction:'windup',bossY:.6,bossAttack:.5};for(let i=0;i<10;i++)arsenal.update(s,.1);
  assert(arsenal.wings[1].hinge.position.x>.9);assert(arsenal.wings.every(w=>w.jet.visible));assert(arsenal.bossCharge.visible);assert.equal(arsenalBoss.position.y,0);
  arsenal.update({...s,bossY:0,bossAction:'fire'},.1);assert(arsenal.wings.every(w=>!w.jet.visible&&w.flash.visible));
});
test('all six pickup symbols hover, stay readable, and dispose resources once',()=>{
  for(const kind of ['guided','cannons','railburst','freeze','slow','haste']){const pickup=createPickup(kind,true);arsenalHero.add(pickup);let disposed=0,unique=new Set();pickup.traverse(o=>{if(o.isMesh){unique.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])unique.add(m);}});unique.forEach(r=>r.addEventListener('dispose',()=>disposed++));
    updatePickup(pickup,1,true);assert.equal(pickup.userData.pickupKind,kind);assert(pickup.userData.pickupVisual.position.y>0.9);assert(pickup.userData.pickupIcon.name==='PickupSymbol_'+kind);assert(Math.abs(pickup.userData.pickupIcon.rotation.y)<.7);assert(pickup.userData.pickupCage.rotation.z!==0);disposePickup(pickup);assert.equal(disposed,unique.size);assert.equal(pickup.parent,null);}
});
test('weapon and time pickup silhouettes have distinct measured geometry',()=>{
  const signatures=[];
  for(const kind of ['guided','cannons','railburst','freeze','slow','haste']){const p=createPickup(kind);p.updateMatrixWorld(true);const box=new T.Box3().setFromObject(p.userData.pickupIcon),size=box.getSize(new T.Vector3());let vertices=0;p.userData.pickupIcon.traverse(m=>{if(m.isMesh)vertices+=m.geometry.getAttribute('position').count;});signatures.push(vertices+':'+size.toArray().map(v=>v.toFixed(2)).join(','));
    if(kind==='freeze')assert(size.y>.9&&size.z<.4);if(kind==='railburst')assert(size.z>size.y*2);if(kind==='haste')assert(size.y>.9&&size.z<.2);disposePickup(p);}
  assert.equal(new Set(signatures).size,6);
});
test('boss chest opens only for core exposure, rebuilds, and respects pause',()=>{
  const state={...arsenalState,phase:'boss',bossState:'exposed',bossCoreTime:5,bossRevives:0,bossY:0};arsenal.reset();for(let i=0;i<10;i++)arsenal.update(state,.1);assert(arsenal.coreOpen>.9);assert(arsenal.furnace.visible);assert(arsenal.coreDoors.some(d=>d.position.length()>.3));
  const clock=arsenal.clock,door=arsenal.coreDoors[0].position.clone();arsenal.update(state,0);assert.equal(arsenal.clock,clock);assert(door.equals(arsenal.coreDoors[0].position));
  for(let i=0;i<20;i++)arsenal.update({...state,bossState:'rebuilding',bossRevives:1},.1);assert(arsenal.coreOpen<.2);assert(arsenal.unfolded>.9);assert(arsenal.wings[1].hinge.position.x>1.25);
  for(let i=0;i<10;i++)arsenal.update({...state,bossState:'armored',bossRevives:1},.1);assert(arsenal.coreOpen<.02);assert(!arsenal.furnace.visible);arsenal.reset();
});
test('time powers scale only hostile weapon and jet animation',()=>{
  const base={...arsenalState,phase:'boss',bossPhase:2,bossY:.6,bossAction:'windup',weaponPower:'cannons',powerTime:5,shots:[{owner:'commander',z:.5,dx:0,dz:32}]};
  for(const [power,rate] of [['freeze',0],['slow',.5],['haste',1.35]]){arsenal.reset();arsenal.update({...base,timePower:power,timePowerTime:3},.1);assert(Math.abs(arsenal.bossClock-.1*rate)<1e-8);assert(Math.abs(arsenal.clock-.1)<1e-8);assert(arsenal.hands[0].rotor.rotation.z>0);
    const clock=arsenal.bossClock,rotor=arsenal.wings[0].rotor.rotation.z,jet=arsenal.wings[0].jet.scale.clone();arsenal.update({...base,timePower:power,timePowerTime:3},0);assert.equal(arsenal.bossClock,clock);assert.equal(arsenal.wings[0].rotor.rotation.z,rotor);assert(jet.equals(arsenal.wings[0].jet.scale));}
  arsenal.reset();arsenal.update({...base,timePower:'freeze',timePowerTime:0},.1);assert.equal(arsenal.bossClock,.1);
});
test('arsenal retries keep a fixed hierarchy and disposal owns no actor meshes',()=>{
  const h=arsenalHero.children.length,b=arsenalBoss.children.length;for(let i=0;i<300;i++){arsenal.update({...arsenalState,phase:'boss',weaponPower:'guided',powerTime:3,bossPhase:2,bossY:.4},.05);arsenal.reset();assert.equal(arsenalHero.children.length,h);assert.equal(arsenalBoss.children.length,b);}
  arsenal.dispose();assert.equal(arsenalHero.children.length,0);assert.equal(arsenalBoss.children.length,0);
});
test('all owned resources dispose without deleting source boss geometry',()=>{
  fx.dispose();missiles.dispose();robots.dispose();abilities.dispose();assert.equal(scene.children.length,1);assert.equal(sourceGeometryDisposed,false);
});
console.log(`${passed}/${passed+failures} combat visual CPU checks passed; WebGL screenshots and device FPS remain unverified.`);
if(failures)process.exitCode=1;
