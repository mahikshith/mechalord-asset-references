// Armory loadout: hires add machines up to the 16 cap, persona powers pre-charge relics, weapon applies once.
import assert from'node:assert/strict';import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),bytes=fs.readFileSync(path.join(root,'delivery/playable/assault.wasm'));
globalThis.fetch=async()=>new Response(bytes);
const{AssaultCore}=await import('./assault-core.ts');const core=new AssaultCore();await core.load();
core.start(0,5,0);const base=core.snapshot();
assert.ok(core.applyLoadout(2,1,1,2));const s=core.snapshot();
assert.equal(s.army,base.army+4);assert.equal(s.weaponPower,'cannons');
assert.ok(s.relics[2].energy>base.relics[2].energy&&s.relics[1].energy>base.relics[1].energy);
assert.ok(!core.applyLoadout(1,0,0,0),'loadout applies once');
core.start(0,5,0);core.applyLoadout(20,0,0,0);assert.equal(core.snapshot().army,17,'squad caps at commander + 16');
core.start(0,0,0);assert.ok(!core.applyLoadout(1,0,0,0),'practice fronts ignore the armory');
console.log('PASS armory loadout');
