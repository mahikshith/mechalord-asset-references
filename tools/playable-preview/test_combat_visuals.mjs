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
const {CombatVisuals,CombatMissiles,RobotFormation,ArmyAbilityVisuals,EnemyWeaponCues,friendlyProjectilePose,combatImpactPoint}=module.exports;
const arsenalBundle=await esbuild.build({entryPoints:[path.join(here,'arsenal-visuals.ts')],bundle:true,
  platform:'node',format:'cjs',nodePaths:[path.join(dependencyRoot,'node_modules')],write:false});
const arsenalModule=new Module('arsenal-visuals-cpu-check');
arsenalModule._compile(arsenalBundle.outputFiles[0].text,path.join(dependencyRoot,'arsenal-check-inline.cjs'));
const {ArsenalVisuals,createPickup,updatePickup,disposePickup,syncBossParts}=arsenalModule.exports;
const worldBundle=await esbuild.build({entryPoints:[path.join(here,'world.ts')],bundle:true,
  platform:'node',format:'cjs',nodePaths:[path.join(dependencyRoot,'node_modules')],write:false});
const worldModule=new Module('world-visual-integration-check');
worldModule._compile(worldBundle.outputFiles[0].text,path.join(dependencyRoot,'world-check-inline.cjs'));
const {Battlefield,enemyArmorLabel}=worldModule.exports;
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
test('named boss parts break progressively, preserve source pose, and restore on retry',()=>{
  fx.reset();const root=new T.Group();root.position.set(2,.8,-9);root.rotation.y=.2;root.scale.setScalar(1.4);scene.add(root);
  for(const name of ['Barrel_L','Barrel_R','Pod_L','Pod_R','Leg_L','Leg_R','Torso']){const node=new T.Group();node.name=name;node.position.set(name.endsWith('L')?-1:1,2,0);node.add(new T.Mesh(bossGeometry,bossMaterial));root.add(node);}
  root.updateWorldMatrix(true,true);const before=new T.Box3().setFromObject(root.getObjectByName('Barrel_L'));assert(fx.bossPartBreak(root,'cannonL'));assert(!root.getObjectByName('Barrel_L').visible);assert(root.getObjectByName('Torso').visible);assert.equal(fx.bossPartBreak(root,'cannonL'),false);
  const copied=new T.Box3().setFromObject(fx.fragments[0].group);assert(before.min.distanceTo(copied.min)<1e-6);assert(before.max.distanceTo(copied.max)<1e-6);
  syncBossParts(root,1|4|16);assert(!root.getObjectByName('Pod_L').visible);assert(!root.getObjectByName('Leg_L').visible);assert(root.getObjectByName('Barrel_R').visible);
  syncBossParts(root,1);assert(fx.bossPartBreak(root,'boosterL'));assert(fx.bossPartBreak(root,'legL'));assert(fx.bossDeath(root));assert(fx.stats().bossFragments<=24);assert.equal(fx.bossDeath(root),false);
  fx.reset();assert(root.getObjectByName('Barrel_L').visible);assert(root.getObjectByName('Pod_L').visible);assert(root.getObjectByName('Leg_L').visible);syncBossParts(root,2);assert(!root.getObjectByName('Barrel_R').visible);syncBossParts(root,0);assert(root.getObjectByName('Barrel_R').visible);scene.remove(root);
});
test('all six part breaks reserve final torso/head blast inside the 24 fragment cap',()=>{
  fx.reset();const root=new T.Group();scene.add(root);const parts=['Barrel_L','Barrel_R','Pod_L','Pod_R','Leg_L','Leg_R'];
  for(const name of parts){const node=new T.Group();node.name=name;for(let i=0;i<4;i++){const mesh=new T.Mesh(bossGeometry,bossMaterial);mesh.name=name+'_Mesh_'+i;node.add(mesh);}root.add(node);}
  for(const name of ['Torso','Head']){const node=new T.Group();node.name=name;const mesh=new T.Mesh(bossGeometry,bossMaterial);mesh.name=name+'_MobileMesh';node.add(mesh);root.add(node);}
  for(const part of ['cannonL','cannonR','boosterL','boosterR','legL','legR'])assert(fx.bossPartBreak(root,part));assert.equal(fx.fragments.length,24);let disposed=0;for(const f of fx.fragments)f.materials.forEach(m=>m.addEventListener('dispose',()=>disposed++));
  assert(fx.bossDeath(root));assert(fx.fragments.length<=24);assert(disposed>=8);const names=fx.fragments.flatMap(f=>f.group.children.map(m=>m.name));assert(names.includes('Wreck_Torso_MobileMesh'));assert(names.includes('Wreck_Head_MobileMesh'));fx.reset();scene.remove(root);
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
  const perUnit=[robots.body,robots.eyes,robots.arms,robots.legs,robots.treadMark].reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.getAttribute('position').count)/3*([robots.arms,robots.legs,robots.treadMark].includes(m)?2:1),0);assert(perUnit>444&&perUnit<5000);assert.equal(robots.arms.count,400);assert.equal(robots.legs.count,400);
  const matrix=new T.Matrix4();robots.body.getMatrixAt(0,matrix);const scale=new T.Vector3().setFromMatrixScale(matrix);assert(Math.abs(scale.x-.82)<1e-6);assert(Math.abs(scale.y-1.1)<1e-6);
});
test('marching robot phase moves suspension and treads without adding objects',()=>{
  const count=scene.children.length,bodyBefore=new T.Matrix4(),markBefore=new T.Matrix4(),armBefore=new T.Matrix4();robots.body.getMatrixAt(0,bodyBefore);robots.treadMark.getMatrixAt(0,markBefore);robots.arms.getMatrixAt(0,armBefore);
  robots.begin();robots.add(0,-5,1,0,false,.17);robots.end();const bodyAfter=new T.Matrix4(),markAfter=new T.Matrix4();robots.body.getMatrixAt(0,bodyAfter);robots.treadMark.getMatrixAt(0,markAfter);
  const armAfter=new T.Matrix4();robots.arms.getMatrixAt(0,armAfter);assert(bodyBefore.equals(bodyAfter));assert(!armBefore.equals(armAfter));assert(!markBefore.equals(markAfter));assert.equal(scene.children.length,count);assert.equal(robots.treadMark.count,2);
});
const missileOptions={depthScale:1,bossPhase:true,bossZ:9,overdrive:true,weapon:3};
test('1,000 missiles stay inside the 768 slot pool',()=>{
  missiles.update(Array.from({length:1000},()=>({x:0,z:2,heavy:true,dx:1,dz:2,kind:'arc'})),[],missileOptions);assert.equal(missiles.bullets.count,768);assert.equal(missiles.bodies.count,0);assert.equal(missiles.exhaust.count,0);
});
test('missile orientation follows real dx/dz and boss launch height follows bossZ',()=>{
  missiles.update([{x:1,z:2,heavy:true,dx:2,dz:3,kind:'rail'}],[{id:3,x:2,z:9,dx:0,dz:-4,radius:.2,kind:'rocket'}],missileOptions);
  const matrix=new T.Matrix4();missiles.bullets.getMatrixAt(0,matrix);const forward=new T.Vector3(0,0,1).transformDirection(matrix),expected=new T.Vector3(2,(4.31-1.8)/(9-.85-.4)*3,-3).normalize();assert(forward.distanceTo(expected)<1e-6);
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
    shot.z=9-.85;missiles.update([shot],[],{...missileOptions,overdrive:false});mesh.getMatrixAt(0,matrix);assert(Math.abs(new T.Vector3().setFromMatrixPosition(matrix).y-4.31)<1e-6);
  }
});
test('every friendly weapon and Overdrive reaches the actual moving reactor without horizontal aim assist',()=>{
  for(const kind of ['pulse','arc','cannon','rail','missile'])for(const overdrive of [false,true])for(const bossY of [-2.55,.7,2.3]){
    missiles.reset();const shot={x:-2.4,z:11.15,dx:kind==='missile'?3:0,dz:32,heavy:kind!=='pulse',kind,owner:'troop'};
    const options={...missileOptions,bossZ:12,bossX:1.8,bossY,bossImpactHeight:4.31,overdrive};
    const pose=friendlyProjectilePose(shot,options);assert.equal(pose.position.x,shot.x);assert.equal(pose.position.z,-shot.z);assert(Math.abs(pose.position.y-bossY-4.31)<1e-8);
    missiles.update([shot],[],options);const matrix=new T.Matrix4();(kind==='missile'?missiles.bodies:missiles.bullets).getMatrixAt(0,matrix);assert(Math.abs(new T.Vector3().setFromMatrixPosition(matrix).y-pose.position.y)<1e-6);
    if(overdrive&&kind!=='missile'){missiles.wakes.getMatrixAt(0,matrix);assert(Math.abs(new T.Vector3().setFromMatrixPosition(matrix).y-pose.position.y)<1e-6);}
  }
});
test('nearby troop fire starts at the real follower muzzle and rises to the boss rather than sinking',()=>{
  const options={...missileOptions,bossZ:12,bossY:1,dt:0,formation:[{index:12,x:-.365,z:-2.19}]};
  const shot={x:-.365,z:-2.19,dx:0,dz:32,kind:'pulse',owner:'troop',heavy:false};
  const launch=friendlyProjectilePose(shot,options);assert.equal(launch.position.x,shot.x);assert.equal(launch.position.z,2.19);assert.equal(launch.position.y,.9);
  shot.z=4;const rising=friendlyProjectilePose(shot,options);assert(rising.position.y>1.5);assert.equal(rising.direction.x,0);assert(rising.direction.y>0);assert(rising.direction.z<0);
});
test('ordinary bullets select only targets on their actual lane and effects share the same surface anchor',()=>{
  const target={id:12,kind:'enemy',x:0,z:8,hp:50,variant:1,size:1.1,depth:1,op:0};
  const shot={x:0,z:7.2,dx:0,dz:32,kind:'pulse',owner:'commander',heavy:false},options={...missileOptions,bossPhase:false,targets:[{...target,id:2,x:3,z:3},target]};
  const pose=friendlyProjectilePose(shot,options),hit=combatImpactPoint({x:0,z:8,variant:1,entityId:12},options);
  assert(Math.abs(pose.position.y-1.65)<1e-8);assert(pose.position.distanceTo(hit)<1e-8);assert.equal(pose.position.x,0);
  const bossHit=combatImpactPoint({x:.4,z:12,variant:4,entityId:0},{...options,bossPhase:true,bossY:.7});assert.equal(bossHit.x,.4);assert(Math.abs(bossHit.y-5.01)<1e-8);assert.equal(bossHit.z,-11.15);
});
test('surviving rail shots retain their height path when the struck target disappears',()=>{
  missiles.reset();const options={...missileOptions,bossPhase:false,dt:1/32,targets:[{id:5,kind:'enemy',x:0,z:8,hp:10,size:1.1,depth:1,variant:1,op:0}]};
  const shot={x:0,z:2,dx:0,dz:32,kind:'rail',owner:'commander',heavy:true};missiles.update([shot],[],options);
  shot.z=3;missiles.update([shot],[],{...options,targets:[]});const matrix=new T.Matrix4();missiles.bullets.getMatrixAt(0,matrix);
  const expected=1.8+(1.65-1.8)*(3-.4)/(7.2-.4);assert(Math.abs(new T.Vector3().setFromMatrixPosition(matrix).y-expected)<1e-6);assert.equal(missiles.friendlyPaths.length,1);
  missiles.reset();assert.equal(missiles.friendlyPaths.length,0);
});
test('projectile presentation freezes at zero simulation time and retries release every cached path',()=>{
  missiles.reset();const options={...missileOptions,bossY:1.2,simulationTime:30,formation:[{index:1,x:0,z:-1.23}]};
  const shot={x:0,z:3,dx:0,dz:32,kind:'pulse',owner:'troop',heavy:false};missiles.update([shot],[],options);
  const before=new T.Matrix4();missiles.bullets.getMatrixAt(0,before);for(let i=0;i<10;i++)missiles.update([shot],[],options);const after=new T.Matrix4();missiles.bullets.getMatrixAt(0,after);assert.deepEqual(after.elements,before.elements);
  for(let i=0;i<150;i++){missiles.reset();missiles.update([shot],[],options);assert.equal(missiles.friendlyPaths.length,1);}missiles.update([],[],options);assert.equal(missiles.friendlyPaths.length,0);missiles.reset();assert.equal(missiles.previousTime,undefined);
});
test('world hit effects use the current hovering or grounded reactor and retained dead-target metadata',()=>{
  const impacts=[],actor=Object.create(Battlefield.prototype);Object.assign(actor,{age:1,boss:new T.Group(),hitNumbers:new Map(),fx:{impact:(...v)=>impacts.push(v)},bossHitKick:0});
  const hit={id:1,kind:'hit',x:.2,z:12,value:8,entityId:0,variant:4,size:.9};
  for(const bossY of [1.7,-2.55]){actor.trigger(hit,{bossY,targets:[]});const p=impacts.at(-1);assert(Math.abs(p[1]-bossY-4.31)<1e-8);assert.equal(p[2],-11.15);assert(actor.bossHitKick>0);}
  actor.presentation={targets:[{id:7,kind:'orb',depth:.2,z:8}]};actor.trigger({...hit,value:0,entityId:7,variant:-3,z:7.9},{bossY:0,targets:[]});assert.equal(impacts.at(-1)[1],1.1);assert(Math.abs(impacts.at(-1)[2]+7.74)<1e-8);
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
test('authoritative lasers draw thick 3D beams only while active',()=>{
  missiles.update([],[],{...missileOptions,bossY:.5,bossLaunchHeight:3.4,lasers:[{id:1,x:1,z:9,endX:-2,endZ:0,width:.65,time:.4}]});assert.equal(missiles.beamShells.count,1);assert.equal(missiles.beamCores.count,1);
  const matrix=new T.Matrix4();missiles.beamShells.getMatrixAt(0,matrix);const center=new T.Vector3().setFromMatrixPosition(matrix),scale=new T.Vector3().setFromMatrixScale(matrix);assert(Math.abs(center.x+.5)<1e-6);assert(Math.abs(center.z+4.5)<1e-6);assert(Math.abs(scale.x-.65)<1e-6);assert(scale.z>9);
  missiles.update([],[],{...missileOptions,lasers:[{id:1,x:1,z:9,endX:-2,endZ:0,width:.65,time:0}]});assert.equal(missiles.beamShells.count,0);missiles.reset();assert.equal(missiles.beamCores.count,0);
});
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
test('troop sacrifice streams travel inward without casualty chunks and cleanly expire',()=>{
  fx.reset();const root=new T.Group();root.position.set(1,0,0);scene.add(root);const count=scene.children.length;
  for(let i=0;i<10;i++)fx.sacrifice(root,[{x:-2,z:4},{x:2,z:5}]);fx.update(.1);assert.equal(fx.stats().debris,0);assert(fx.stats().sacrificeStreams<=48);assert.equal(scene.children.length,count);
  const stream=fx.sacrificeStreams[0],matrix=new T.Matrix4();fx.streamHeads.getMatrixAt(0,matrix);const first=new T.Vector3().setFromMatrixPosition(matrix);assert(first.distanceTo(stream.from)>0);const age=stream.age;fx.update(0);assert.equal(stream.age,age);fx.streamHeads.getMatrixAt(0,matrix);assert(first.distanceTo(new T.Vector3().setFromMatrixPosition(matrix))<1e-6);
  fx.update(.15);fx.update(.15);fx.streamHeads.getMatrixAt(0,matrix);assert(new T.Vector3().setFromMatrixPosition(matrix).distanceTo(new T.Vector3(1,1.6,0))<first.distanceTo(new T.Vector3(1,1.6,0)));
  for(let i=0;i<10;i++)fx.update(.1);assert.equal(fx.stats().sacrificeStreams,0);assert.equal(fx.streamBodies.count,0);assert.equal(fx.streamHeads.count,0);fx.reset();scene.remove(root);
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
function socketFixture(){const root=new T.Group();for(const name of ['Torso','Barrel_L','Barrel_R','Pod_L','Pod_R']){const part=new T.Group();part.name=name;part.position.set(name.endsWith('L')?-1:name.endsWith('R')?1:0,name==='Torso'?2.35438:3,0);const mesh=new T.Mesh(bossGeometry,bossMaterial);mesh.name=name+'_MobileMesh';part.add(mesh);root.add(part);}return root;}
const arsenalHero=new T.Group(),arsenalBoss=socketFixture(),retainedBossNodes=arsenalBoss.children.length,arsenal=new ArsenalVisuals(arsenalHero,arsenalBoss);
const arsenalState={phase:'run',weaponPower:'none',powerTime:0,shots:[],enemyShots:[],bossAction:'strafe',bossPhase:1,bossPattern:'heavy',bossY:0,bossAttack:0};
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
test('cannon recoil is caused by a fresh commander volley rather than retriggering an old flying bullet',()=>{
  arsenal.reset();const s={...arsenalState,phase:'boss',bossZ:12,bossY:.7,weaponPower:'cannons',powerTime:3,shots:[{owner:'commander',kind:'cannon',z:.5,dx:0,dz:32}]};
  arsenal.update(s,.01);assert.equal(arsenal.recoil,1);assert(arsenal.hands[0].group.rotation.x<0);assert(arsenal.hands[0].flash.visible);
  arsenal.update({...s,shots:[{...s.shots[0],z:1.3}]},.05);assert(Math.abs(arsenal.recoil-.5)<1e-8);
  arsenal.update({...s,shots:[{...s.shots[0],z:1.7}]},.04);assert(arsenal.recoil<.2);
  arsenal.update(s,.01);assert.equal(arsenal.recoil,1);const before=arsenal.hands[0].group.rotation.clone();arsenal.update(s,0);assert.deepEqual(arsenal.hands[0].group.rotation.toArray(),before.toArray());
});
test('rail and guided rigs pitch toward a hovering reactor and restore level poses on reset',()=>{
  const base={...arsenalState,phase:'boss',bossZ:12,bossY:1,weaponPermanent:true,powerTime:0,shots:[{owner:'commander',kind:'rail',z:.5,dx:0,dz:32}]};
  arsenal.reset();arsenal.update({...base,weaponPower:'railburst'},.01);assert(arsenal.rail.rotation.x<-.2);assert(arsenal.rail.position.z>-.4);assert(arsenal.railFlash.visible);
  arsenal.update({...base,weaponPower:'guided'},.01);assert(arsenal.guided.children.every(r=>r.rotation.x<-.2));
  arsenal.reset();assert.equal(arsenal.rail.rotation.x,0);assert.equal(arsenal.rail.position.z,-.4);assert(arsenal.guided.children.every(r=>r.rotation.x===0));assert.equal(arsenal.lastNearShotZ,undefined);
});
test('boss phase unfolds cannons and authoritative hover enables jets',()=>{
  const s={...arsenalState,phase:'boss',bossPhase:2,bossPattern:'heavy',bossAction:'windup',bossY:.6,bossAttack:.5};for(let i=0;i<10;i++)arsenal.update(s,.1);
  assert(arsenal.wings[1].hinge.position.x>.9);assert.equal(arsenal.boosters.length,2);assert(arsenal.boosters.every(b=>b.plumes.every(p=>p.visible)));assert(arsenal.socketCharges.get('armL').visible);assert(!arsenal.bossCharge.visible);assert.equal(arsenalBoss.position.y,0);
  arsenal.update({...s,bossY:0,bossAction:'fire'},.1);assert(arsenal.boosters.every(b=>b.plumes.every(p=>!p.visible)));assert(arsenal.wings.every(w=>!w.jet.visible&&!w.flash.visible));
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
test('added chest wheel and shutters are absent',()=>{
  assert(!arsenalBoss.getObjectByName('BossCoreShutters'));assert(!arsenalBoss.getObjectByName('ExposedBossFurnace'));assert.equal(arsenalBoss.getObjectByName('BossCoreDoor_0'),undefined);
});
test('permanent acquired weapon remains visible with zero temporary timer',()=>{
  arsenal.update({...arsenalState,weaponPower:'cannons',weaponPermanent:true,powerTime:0},.1);assert(arsenal.cannons.visible);
});
test('time powers scale only hostile weapon and jet animation',()=>{
  const base={...arsenalState,phase:'boss',bossPhase:2,bossY:.6,bossAction:'windup',weaponPower:'cannons',powerTime:5,shots:[{owner:'commander',z:.5,dx:0,dz:32}]};
  for(const [power,rate] of [['freeze',0],['slow',.5],['haste',1.35]]){arsenal.reset();arsenal.update({...base,timePower:power,timePowerTime:3},.1);assert(Math.abs(arsenal.bossClock-.1*rate)<1e-8);assert(Math.abs(arsenal.clock-.1)<1e-8);assert(arsenal.hands[0].rotor.rotation.z>0);
    const clock=arsenal.bossClock,rotor=arsenal.wings[0].rotor.rotation.z,jet=arsenal.wings[0].jet.scale.clone();arsenal.update({...base,timePower:power,timePowerTime:3},0);assert.equal(arsenal.bossClock,clock);assert.equal(arsenal.wings[0].rotor.rotation.z,rotor);assert(jet.equals(arsenal.wings[0].jet.scale));}
  arsenal.reset();arsenal.update({...base,timePower:'freeze',timePowerTime:0},.1);assert.equal(arsenal.bossClock,.1);
});
test('face refinement follows the real Head and disposes only its own small overlay',()=>{
  const hero=new T.Group(),actor=new T.Group(),head=new T.Group();head.name='Head';head.position.set(0,3.55,0);head.rotation.y=.15;actor.rotation.y=Math.PI;actor.scale.setScalar(1.4);actor.add(head);const source=new T.Mesh(bossGeometry,bossMaterial);head.add(source);
  const local=new ArsenalVisuals(hero,actor);local.update({...arsenalState,phase:'boss'},.1);assert.equal(local.faceRig.parent,head);assert(local.faceRig.visible);assert.equal(local.faceRig.children.length,2);
  const eyes=local.faceRig.children[1].geometry;eyes.computeBoundingBox();assert(eyes.boundingBox.max.x<.23);assert(eyes.boundingBox.min.x>-.23);assert(eyes.boundingBox.max.z<-.44);assert(eyes.boundingBox.max.y-eyes.boundingBox.min.y<.05);
  let disposed=0;const resources=new Set();local.faceRig.traverse(m=>{if(m.isMesh){resources.add(m.geometry);resources.add(m.material);}});resources.forEach(r=>r.addEventListener('dispose',()=>disposed++));
  local.dispose();assert.equal(disposed,resources.size);assert.equal(head.children.length,1);assert.equal(head.children[0],source);assert.equal(sourceGeometryDisposed,false);assert.equal(local.faceRig.parent,null);
});
test('laser reactor charge survives detached cannons and freezes at zero dt',()=>{
  const hero=new T.Group(),actor=socketFixture(),local=new ArsenalVisuals(hero,actor),state={...arsenalState,phase:'boss',bossPattern:'laser',bossAction:'windup',bossPartsMask:3,bossAttack:.8};
  local.update(state,.1);assert(!actor.getObjectByName('Barrel_L').visible);const charge=local.socketCharges.get('core');assert(charge.visible);assert.equal(charge.parent.name,'WeaponSocket_core');const scale=charge.scale.clone();local.update(state,0);assert(scale.equals(charge.scale));local.update({...state,bossAction:'fire'},.1);assert(!charge.visible);local.dispose();
});
test('guarded and exposed states preserve original reactor geometry and change its opening light',()=>{
  arsenal.update({...arsenalState,phase:'boss',bossState:'exposed',bossAction:'strafe'},.1);assert(arsenal.socketCharges.get('core').visible);const hierarchy=arsenalBoss.children.length;
  arsenal.update({...arsenalState,phase:'boss',bossState:'guarded',bossAction:'strafe'},.1);assert([...arsenal.socketCharges.values()].every(c=>!c.visible));assert(!arsenal.bossCharge.visible);assert.equal(arsenalBoss.children.length,hierarchy);assert.equal(arsenalBoss.getObjectByName('BossCoreShutters'),undefined);
});

test('arsenal retries keep a fixed hierarchy and disposal owns no actor meshes',()=>{
  const h=arsenalHero.children.length,b=arsenalBoss.children.length;for(let i=0;i<300;i++){arsenal.update({...arsenalState,phase:'boss',weaponPower:'guided',powerTime:3,bossPhase:2,bossY:.4},.05);arsenal.reset();assert.equal(arsenalHero.children.length,h);assert.equal(arsenalBoss.children.length,b);}
  arsenal.dispose();assert.equal(arsenalHero.children.length,0);assert.equal(arsenalBoss.children.length,retainedBossNodes);
});

test('ordinary hits emit sparks without concealing enemies in smoke',()=>{
  fx.reset();fx.impact(1,1.65,-4,.5);fx.update(0);assert.equal(fx.smoke.count,0);assert.equal(fx.sparkMesh.count,3);assert.equal(fx.fire.count,1);
  for(const spark of fx.sparks)if(spark.life>0){assert.equal(spark.p.x,1);assert.equal(spark.p.y,1.65);assert.equal(spark.p.z,-4);}fx.reset();
});
test('mechanical deaths contain plates, wheel hubs and struts with bounded delayed elite bursts',()=>{
  fx.reset();fx.enemyDeath(0,-5,0,1,.78);fx.update(0);assert.equal(fx.stats().debris,7);assert.equal(fx.rotors.count,2);assert.equal(fx.struts.count,2);assert.equal(fx.debris.count,3);
  fx.reset();fx.enemyDeath(1,-8,1,1.6,1.65);assert.equal(fx.bursts.length,2);assert.equal(fx.bursts[0].p.y,1.65-.24);const delays=fx.bursts.map(b=>b.delay),sparks=fx.sparks.map(b=>b.life);fx.update(0);assert.deepEqual(fx.bursts.map(b=>b.delay),delays);assert.deepEqual(fx.sparks.map(b=>b.life),sparks);
  for(let i=0;i<100;i++)fx.enemyDeath(i%3,-8,1,1.6,1.65);assert(fx.bursts.length<=32);fx.update(.15);assert(fx.stats().sparks<=128);assert(fx.stats().debris<=384);assert(fx.stats().fire+fx.stats().smoke<=256);allEffectsExpire(fx);assert.equal(fx.stats().queuedBursts,0);assert.equal(fx.stats().sparks,0);fx.reset();
});
test('world death effects share the accepted chest and front-surface anchor',()=>{
  const calls=[],actor=Object.create(Battlefield.prototype);Object.assign(actor,{age:1,boss:new T.Group(),hitNumbers:new Map(),fx:{enemyDeath:(...v)=>calls.push(v)},shake:0,presentation:{targets:[{id:8,kind:'enemy',depth:1,variant:2}]}});
  actor.trigger({kind:'kill',x:1,z:8,entityId:8,variant:2},{targets:[]});assert.deepEqual(calls[0],[1,-7.2,2,1.6,1.65]);
});
test('gunner warnings follow authoritative charge and only mark locked aim',()=>{
  const cues=new EnemyWeaponCues(scene,16),target={id:9,kind:'enemy',hp:30,variant:2,x:2,z:12,aimX:-1,charge:.5,fireState:'tracking'};
  const base=scene.children.length;cues.update([target]);assert.equal(cues.charges.count,1);assert.equal(cues.locks.count,0);const before=new T.Matrix4();cues.charges.getMatrixAt(0,before);cues.update([target]);const after=new T.Matrix4();cues.charges.getMatrixAt(0,after);assert.deepEqual(after.elements,before.elements);
  cues.update([{...target,fireState:'locked',charge:1}]);assert.equal(cues.locks.count,1);const m=new T.Matrix4();cues.locks.getMatrixAt(0,m);assert.equal(new T.Vector3().setFromMatrixPosition(m).x,-1);
  cues.update(Array.from({length:100},(_,id)=>({...target,id,fireState:'locked'})));assert.equal(cues.charges.count,16);assert.equal(cues.locks.count,16);assert.equal(scene.children.length,base);cues.update([{...target,fireState:'reload',charge:0}]);assert.equal(cues.charges.count,0);assert.equal(cues.locks.count,0);
  for(let i=0;i<300;i++){cues.update([target]);cues.reset();assert.equal(cues.charges.count,0);assert.equal(scene.children.length,base);}let disposed=0;for(const mesh of [cues.charges,cues.locks])for(const r of [mesh.geometry,mesh.material])r.addEventListener('dispose',()=>disposed++);cues.dispose();assert.equal(disposed,4);
});
test('enemy firing cues use source identity and never fake commander recoil',()=>{
  const muzzles=[],actor=Object.create(Battlefield.prototype);Object.assign(actor,{enemyRecoil:new Map(),fx:{muzzle:(...v)=>muzzles.push(v)},presentation:undefined});
  actor.trigger({kind:'enemyFire',entityId:12,variant:2,x:1,z:8,value:1},{targets:[{id:12,aimX:0}]});assert.equal(actor.enemyRecoil.get(12),.24);assert.equal(muzzles.length,0,'Muzzle birth waits for current-frame animated source, never guesses a height in the event handler');assert.equal(actor.recoil,undefined);
});
test('hostile shells are separate physical geometry and launch from their actual gunner',()=>{
  missiles.reset();const hostile={id:123,x:1,z:10,dx:0,dz:-12,radius:.2,kind:'shell',sourceId:8};
  const options={...missileOptions,bossPhase:true,bossY:2,bossZ:15,targets:[{id:8,kind:'enemy',variant:2,x:1,z:10}]};missiles.update([], [hostile],options);assert.equal(missiles.hostileShells.count,1);assert.equal(missiles.bullets.count,0);const matrix=new T.Matrix4();missiles.hostileShells.getMatrixAt(0,matrix);assert(Math.abs(new T.Vector3().setFromMatrixPosition(matrix).y-1.65)<1e-6);assert.notEqual(missiles.hostileShells.geometry,missiles.bullets.geometry);
  missiles.update([], [{...hostile,z:5}],{...options,targets:[],bossY:0});missiles.hostileShells.getMatrixAt(0,matrix);assert(Math.abs(new T.Vector3().setFromMatrixPosition(matrix).y-1.25)<1e-6);
  missiles.update([],Array.from({length:1000},(_,id)=>({...hostile,id})),options);assert.equal(missiles.hostileShells.count,96);missiles.reset();assert.equal(missiles.hostileShells.count,0);assert.equal(missiles.hostileTips.count,0);assert.equal(missiles.hostileLaunchZ.size,0);
});


test('braced gunner cue names only the authoritative guided resistance',()=>{
  assert.equal(enemyArmorLabel({role:'gunner',variant:2,guidedArmor:true}),'GUIDED RESIST');assert.equal(enemyArmorLabel({role:'battery',variant:2,guidedArmor:true}),'GUIDED RESIST');assert.equal(enemyArmorLabel({role:'battery',variant:2,guidedArmor:false}),'BATTERY');assert.equal(enemyArmorLabel({role:'gunner',variant:2,guidedArmor:false}),'GUNNER');
});
test('zero-damage reactor rounds deflect neutrally without boss damage recoil',()=>{
  const impacts=[],deflections=[],actor=Object.create(Battlefield.prototype);Object.assign(actor,{age:1,boss:new T.Group(),hitNumbers:new Map(),fx:{impact:(...v)=>impacts.push(v),deflect:(...v)=>deflections.push(v)},bossHitKick:0});
  actor.trigger({kind:'hit',x:.1,z:12,value:0,entityId:0,variant:3},{bossY:.7,targets:[]});assert.equal(impacts.length,0);assert.equal(deflections.length,1);assert.equal(actor.bossHitKick,0);assert(Math.abs(deflections[0][1]-5.01)<1e-8);assert.equal(deflections[0][2],-11.15);
  fx.reset();fx.deflect(.1,5.01,-11.15);fx.update(0);assert.equal(fx.smoke.count,0);assert.equal(fx.sparkMesh.count,3);for(const spark of fx.sparks)if(spark.life>0)assert(spark.color.equals(new T.Color(0xaac2cc)));fx.reset();
});

test('all owned resources dispose without deleting source boss geometry',()=>{
  fx.dispose();missiles.dispose();robots.dispose();abilities.dispose();assert.equal(scene.children.length,1);assert.equal(sourceGeometryDisposed,false);
});
console.log(`${passed}/${passed+failures} combat visual CPU checks passed; WebGL screenshots and device FPS remain unverified.`);
if(failures)process.exitCode=1;
