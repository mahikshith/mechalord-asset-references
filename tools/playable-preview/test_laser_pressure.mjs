// Real Three geometry checks. Normal-game GPU appearance remains a separate acceptance check.
import assert from 'node:assert/strict';import path from 'node:path';import fs from 'node:fs';import Module,{createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),deps=path.resolve(here,'../asset-viewer'),require=createRequire(path.join(deps,'package.json')),T=require('three'),esbuild=require('esbuild');
async function code(file){const b=await esbuild.build({entryPoints:[path.join(here,file)],bundle:true,external:['three'],platform:'node',format:'cjs',nodePaths:[path.join(deps,'node_modules')],write:false});const m=new Module(file);m.paths=Module._nodeModulePaths(deps);m._compile(b.outputFiles[0].text,path.join(deps,'laser-pressure-inline.cjs'));return m.exports;}
const {CombatMissiles,CommanderPowerVisuals}=await code('combat-visuals.ts'),{LaserClashVisuals}=await code('laser-clash-visuals.ts');
let passed=0,failed=0;const checks=[];function test(name,run){try{run();passed++;checks.push({name,pass:true});console.log('PASS '+name);}catch(e){failed++;checks.push({name,pass:false,error:e.message});console.error('FAIL '+name+' '+e.stack);}}
const scene=new T.Scene(),hostile=new CombatMissiles(scene),hero=new CommanderPowerVisuals(scene),clash=new LaserClashVisuals(scene);
const beam={id:1,x:1.2,y:4.4,z:13,endX:-.2,endY:2.7,endZ:7,width:.8,time:1},options={depthScale:1,bossPhase:true,overdrive:false,weapon:1,dt:.05,simulationTime:1,emitters:{core:new T.Vector3(9,9,9)},lasers:[beam]};
const state={active:true,progress:.5,time:2,x:-.2,y:2.7,z:7,heroX:0,heroY:1.42,heroZ:1.3,enemyX:1.2,enemyY:4.4,enemyZ:13,result:'none'};
const matrix=(mesh,i=0)=>{const m=new T.Matrix4();mesh.getMatrixAt(i,m);return m;},pos=(mesh,i=0)=>new T.Vector3().setFromMatrixPosition(matrix(mesh,i)),ends=(mesh,i=0)=>[-.5,.5].map(z=>new T.Vector3(0,0,z).applyMatrix4(matrix(mesh,i))),near=(a,b)=>assert(a.distanceTo(b)<1e-5,`${a.toArray()} != ${b.toArray()}`);
test('hostile core and shell honor published source and elevated clip despite a different animated socket',()=>{
 hostile.update([],[],options);for(const mesh of [hostile.beamShells,hostile.beamCores,hostile.beamSheath]){const [a,b]=ends(mesh);near(a,new T.Vector3(beam.x,beam.y,-beam.z));near(b,new T.Vector3(beam.endX,beam.endY,-beam.endZ));}assert.equal(hostile.beamContact.count,0);
 const shield={...beam,endX:.8,endY:1.6,endZ:3};hostile.update([],[],{...options,lasers:[shield],simulationTime:1.1});near(ends(hostile.beamShells)[1],new T.Vector3(.8,1.6,-3));
});
test('tapered beam vertices keep physical radius inside the actual corridor and maintain exact axial length',()=>{
 for(const mesh of [hostile.beamShells,hostile.beamCores]){const p=mesh.geometry.attributes.position,radii=[];let min=Infinity,max=-Infinity;for(let i=0;i<p.count;i++){const z=p.getZ(i),r=Math.hypot(p.getX(i),p.getY(i));min=Math.min(min,z);max=Math.max(max,z);assert(r<=.500001);if(z<-.49)radii.push(r);}assert(Math.abs(min+.5)<1e-6&&Math.abs(max-.5)<1e-6);const radius=mesh===hostile.beamShells?.5:.24;assert(Math.max(...radii)<radius*.70);assert(mesh.geometry.boundingBox.max.x>radius*.98);}
});
test('two separated warm electrical paths meet both exact endpoints and remain inside the small decorative halo',()=>{
 hostile.update([],[],options);const from=new T.Vector3(beam.x,beam.y,-beam.z),to=new T.Vector3(beam.endX,beam.endY,-beam.endZ),line=new T.Line3(from,to);assert.equal(hostile.beamLightning.count,36);
 for(let side=0;side<2;side++){near(ends(hostile.beamLightning,side*18)[0],from);near(ends(hostile.beamLightning,side*18+17)[1],to);for(let i=0;i<18;i++){const color=new T.Color();hostile.beamLightning.getColorAt(side*18+i,color);assert(color.r>color.b*4);for(const p of ends(hostile.beamLightning,side*18+i))assert(p.distanceTo(line.closestPointToPoint(p,true,new T.Vector3()))<=beam.width*.63);}}
 const middleA=pos(hostile.beamLightning,8),middleB=pos(hostile.beamLightning,26);assert(middleA.distanceTo(middleB)>beam.width*.90);
});
test('hero has the same spatial thickness and exact shared contact, in contrasting blue',()=>{
 const friendly={id:2,x:state.heroX,y:state.heroY,z:state.heroZ,endX:state.x,endY:state.y,endZ:state.z,width:.8,time:1};hero.update([friendly],0);const shell=hero.root.getObjectByName('Tempest_ActualCorridor'),core=hero.root.getObjectByName('Tempest_StraightCore');near(ends(shell)[1],new T.Vector3(state.x,state.y,-state.z));near(ends(core)[1],ends(shell)[1]);assert(Math.abs(new T.Vector3().setFromMatrixScale(matrix(core)).x-.8)<1e-6);assert.equal(hero.stats.arcs,36);const c=new T.Color();hero.arcs.getColorAt(5,c);assert(c.b>c.r*3);
});
test('real progress reverses pressure-ring drift and changes rendered color without moving contact',()=>{
 const axis=new T.Vector3(state.enemyX-state.heroX,state.enemyY-state.heroY,-state.enemyZ+state.heroZ).normalize(),contact=new T.Vector3(state.x,state.y,-state.z);
 clash.update({...state,progress:.1},.07);const warm=new T.Color();clash.rings.getColorAt(1,warm);const retreat=pos(clash.rings,1).sub(contact).dot(axis),a=clash.root.getObjectByName('Clash_ThinPressureFront');near(a.position,contact);assert(a.geometry.type==='RingGeometry');
 clash.update({...state,progress:.9},0);const blue=new T.Color();clash.rings.getColorAt(1,blue);const advance=pos(clash.rings,1).sub(contact).dot(axis);near(a.position,contact);assert(retreat<-.10&&advance>.10);assert(warm.r>blue.r&&blue.b>warm.b);assert(Math.abs(a.material.uniforms.pressure.value-.8)<1e-6);
 assert.equal(clash.arcs.count,12);assert.equal(clash.sparks.count,16);assert.equal(clash.rings.count,2);for(let i=0;i<clash.sparks.count;i++)assert(pos(clash.sparks,i).distanceTo(contact)<1.6);
 // The actual front remains open but has measurable depth; forks are thick enough for portrait rendering.
 assert(a.scale.x>.94&&a.scale.x<1.05);assert(a.geometry.boundingBox.getSize(new T.Vector3()).z>.35);
 assert(new T.Vector3().setFromMatrixScale(matrix(clash.arcs)).x>.05);
 const forkEnd=ends(clash.arcs,1)[1];assert(Math.abs(forkEnd.clone().sub(contact).dot(axis))>.10);
});
test('live contact tracking and zero-delta freeze preserve all contact geometry and uniforms',()=>{
 const moved={...state,x:1.5,y:3.8,z:8.4,progress:.72};clash.update(moved,.05);const before=[...clash.arcs.instanceMatrix.array,...clash.sparks.instanceMatrix.array,...clash.rings.instanceMatrix.array],clock=clash.stats.clock;for(let i=0;i<50;i++)clash.update(moved,0);assert.deepEqual([...clash.arcs.instanceMatrix.array,...clash.sparks.instanceMatrix.array,...clash.rings.instanceMatrix.array],before);assert.equal(clash.stats.clock,clock);assert.deepEqual(clash.stats.contact,[1.5,3.8,-8.4]);
});
test('clash has fixed geometry across retries, malformed input clears it, and disposal is exact',()=>{
 const resources=new Set();scene.traverse(o=>{if(o.geometry)resources.add(o.geometry);if(o.material)resources.add(o.material);});const objects=scene.children.length;for(let i=0;i<200;i++){clash.update({...state,progress:i%100/100},.016);if(i%7===0)clash.reset();}assert.equal(scene.children.length,objects);clash.update({...state,x:NaN},0);assert(!clash.root.visible&&clash.arcs.count===0);let disposed=0;resources.forEach(r=>r.addEventListener('dispose',()=>disposed++));hostile.dispose();hero.dispose();clash.dispose();assert.equal(disposed,resources.size);assert.equal(scene.children.length,0);clash.dispose();assert.equal(disposed,resources.size);
});
fs.writeFileSync(path.resolve(here,'../../builds/laser-pressure-checks.json'),JSON.stringify({scope:'CPU real geometry and authoritative endpoint/pressure/pooling checks. Normal gameplay GPU captures required separately.',passed,failed,checks,generatedAt:new Date().toISOString()},null,2));if(failed)process.exitCode=1;
