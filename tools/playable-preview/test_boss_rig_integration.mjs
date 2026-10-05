/** Actual retained GLB and real scene effects; no GPU/gameplay claim. */
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import Module,{createRequire} from 'node:module';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..'),deps=path.resolve(here,'../asset-viewer'),require=createRequire(path.join(deps,'package.json')),T=require('three'),esbuild=require('esbuild');
async function code(file){const b=await esbuild.build({entryPoints:[path.join(here,file)],bundle:true,external:['three'],platform:'node',format:'cjs',nodePaths:[path.join(deps,'node_modules')],write:false});const m=new Module(file);m.paths=Module._nodeModulePaths(deps);m._compile(b.outputFiles[0].text,path.join(deps,'integration-inline.cjs'));return m.exports;}
const {Battlefield}=await code('world.ts'),{BossRigAdapter}=await code('boss-rig-adapter.ts'),{CombatVisuals}=await code('combat-visuals.ts'),{ArsenalVisuals}=await code('arsenal-visuals.ts');
const bytes=fs.readFileSync(path.join(root,'delivery/playable/forge-tyrant.glb')),len=bytes.readUInt32LE(12),j=JSON.parse(bytes.subarray(20,20+len)),bin=bytes.subarray(28+len);
const nodes=j.nodes.map(n=>{let o=new T.Object3D();if(n.mesh!==undefined){const pr=j.meshes[n.mesh].primitives[0],a=j.accessors[pr.attributes.POSITION],v=j.bufferViews[a.bufferView],p=new Float32Array(a.count*3),stride=v.byteStride??12,off=(v.byteOffset??0)+(a.byteOffset??0);for(let i=0;i<a.count;i++)for(let k=0;k<3;k++)p[i*3+k]=bin.readFloatLE(off+i*stride+k*4);const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));o=new T.Mesh(g,new T.MeshStandardMaterial());}o.name=n.name??'';if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);return o;});for(let i=0;i<nodes.length;i++)for(const c of j.nodes[i].children??[])nodes[i].add(nodes[c]);
const model=new T.Group();model.rotation.y=Math.PI;for(const n of j.scenes[j.scene??0].nodes)model.add(nodes[n]);const scene=new T.Scene(),boss=new T.Group();boss.add(model);scene.add(boss);const adapter=new BossRigAdapter(boss,scene),fx=new CombatVisuals(scene),actor=Object.create(Battlefield.prototype);Object.assign(actor,{scene,boss,bossAdapter:adapter,abilities:{trigger(){}},fx,bossHitKick:0,bossExploded:false});
let passed=0,failed=0;function test(name,fn){try{fn();passed++;console.log('PASS '+name);}catch(e){failed++;console.error('FAIL '+name+' '+e.stack);}}
const pose={rootX:2,rootY:1.2,worldZ:-12,pitch:.14,yaw:.21,roll:-.17,arm:[{pitch:.25,roll:.1},{pitch:-.2,roll:-.1}],leg:[.12,-.12],knee:[.09,0],barrel:[1.2,-1.2],poseClock:3};
test('part-break event detaches real meshes from current authoritative pose before next frame',()=>{
 adapter.apply(pose);const mesh=boss.getObjectByName('Barrel_L_MobileMesh');mesh.geometry.computeBoundingBox();const expected=mesh.geometry.boundingBox.getCenter(new T.Vector3()).applyMatrix4(mesh.matrixWorld);adapter.apply({...pose,rootX:-3,arm:[{pitch:-.3,roll:0},{pitch:0,roll:0}]});
 actor.trigger({kind:'bossPartBreak',value:1,x:2,z:12,hitRegion:'cannonL'}, {bossPose:pose,targets:[]});
 const wreck=scene.children.find(o=>o.children.some(c=>c.name==='Wreck_Barrel_L_MobileMesh'));assert(wreck);assert(wreck.position.distanceTo(expected)<1e-8);assert(!boss.getObjectByName('Barrel_L').visible);assert.equal(boss.position.x,2);fx.reset();
});
test('spatial impacts and exposed-core burst use actual contact/surface data without legacy chest lift',()=>{
 const points=[],original=fx.impact.bind(fx);fx.impact=(...v)=>points.push(v);actor.trigger({kind:'hit',x:1.7,y:3.6,z:11.5,value:8,variant:3,hitRegion:'cannonL'}, {bossY:1.2,targets:[]});assert.deepEqual(points.at(-1).slice(0,3),[1.7,3.6,-11.5]);
 actor.trigger({kind:'coreExpose',x:0,z:12}, {bossY:1.2,bossRegions:[{id:'core',x:2,y:5.48,z:10.99}],targets:[]});assert.deepEqual(points.at(-1).slice(0,3),[2,5.48,-10.99]);fx.impact=original;
});
test('collapsed actual GLB ruptures at the posed above-floor reactor, with bounded particles and exact pause/reset',()=>{
 fx.reset();actor.bossExploded=false;actor.float=()=>{};
 const collapsed={...pose,rootY:-2.55,pitch:0,roll:0,leg:[.65,.65],knee:[.8,.8]};adapter.apply(collapsed);
 const torso=boss.getObjectByName('Torso'),heart=new T.Vector3(-4.470348358e-8,.6995289325714111,-.6541118025779724).applyMatrix4(torso.matrixWorld);
 assert(heart.y>1.5&&heart.y<2);const region={id:'core',x:heart.x,y:heart.y,z:-heart.z};
 actor.trigger({kind:'bossDeath',x:collapsed.rootX,z:-collapsed.worldZ}, {bossPose:collapsed,bossRegions:[region],targets:[]});
 const live=fx.puffs.filter(p=>p.life>0),flash=live.find(p=>p.kind==='flash');assert(flash);assert(flash.p.distanceTo(heart)<1e-8);assert.equal(live.length,18);assert.equal(fx.sparks.filter(p=>p.life>0).length,24);assert.equal(fx.chunks.filter(p=>p.life>0).length,10);assert(fx.bursts.length<=8);assert(fx.bursts.every(b=>b.p.y>=.25));assert(fx.fragments.length<=24);
 assert(live.filter(p=>p.kind==='fire').every(p=>p.size>=.48&&p.size<.78));assert(live.filter(p=>p.kind==='fire').every(p=>p.max<=.74));
 const frozen=JSON.stringify({p:fx.puffs.map(p=>[...p.p.toArray(),p.life]),s:fx.sparks.map(p=>[...p.p.toArray(),p.life]),c:fx.chunks.map(c=>[...c.p.toArray(),c.life]),b:fx.bursts.map(b=>b.delay),f:fx.fragments.map(f=>[...f.group.position.toArray(),f.age])});fx.update(0);
 assert.equal(JSON.stringify({p:fx.puffs.map(p=>[...p.p.toArray(),p.life]),s:fx.sparks.map(p=>[...p.p.toArray(),p.life]),c:fx.chunks.map(c=>[...c.p.toArray(),c.life]),b:fx.bursts.map(b=>b.delay),f:fx.fragments.map(f=>[...f.group.position.toArray(),f.age])}),frozen);
 for(let i=0;i<151;i++)fx.update(1/60);assert(fx.fragments.every(f=>f.settled));assert(fx.puffs.filter(p=>p.life>0&&p.kind==='fire').every(p=>p.size<=.38));
 fx.reset();assert.equal(fx.fragments.length,0);assert.equal(fx.bursts.length,0);assert(fx.puffs.every(p=>p.life===0));assert(fx.sparks.every(p=>p.life===0));assert(fx.chunks.every(c=>c.life===0));actor.bossExploded=false;
});

test('all weapon attachments use actual ballistic slope while legacy shot data remains compatible',()=>{
 const hero=new T.Group(),arsenal=new ArsenalVisuals(hero,boss),base={phase:'boss',timePower:'none',timePowerTime:0,weaponPower:'cannons',weaponPermanent:true,powerTime:0,bossPartsMask:0,bossPhase:1,bossPattern:'heavy',bossY:1.2,bossAction:'strafe',bossAttack:0,bossHp:100,bossState:'armored',bossX:2,bossZ:12,enemyShots:[],shots:[{x:0,y:1.42,z:1,dx:0,dy:9,dz:30,owner:'commander',kind:'cannon'}]};arsenal.update(base,0);const a=-Math.atan2(9,30);assert(Math.abs(hero.getObjectByName('HandCannon_L').rotation.x-(a+.065))<1e-9);assert(Math.abs(arsenal.rail.rotation.x-a)<1e-9);for(const rack of arsenal.guided.children)assert(Math.abs(rack.rotation.x-a)<1e-9);arsenal.update({...base,shots:[{...base.shots[0],dy:undefined,y:undefined}]},0);assert(Number.isFinite(arsenal.rail.rotation.x));arsenal.dispose();
});
adapter.dispose();fx.dispose();fs.writeFileSync(path.join(root,'builds/boss-rig-integration-checks.json'),JSON.stringify({scope:'Actual GLB + event ordering + source renderer ballistic orientation on CPU; spatial gameplay/browser not verified by this test.',passed,failed,generatedAt:new Date().toISOString()},null,2));if(failed)process.exitCode=1;
