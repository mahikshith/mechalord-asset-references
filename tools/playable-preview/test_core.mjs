// Runs the actual browser-shipped binary, which links Unreal's BattleSimulation.cpp.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const binary = fs.readFileSync(path.join(root, 'delivery/playable/battle.wasm'));
const module = new WebAssembly.Module(binary);
const imports = WebAssembly.Module.imports(module);
const known = new Set(['fd_close', 'fd_seek', 'fd_write']);
for (const item of imports) {
  assert.equal(item.module, 'wasi_snapshot_preview1');
  assert.equal(item.kind, 'function');
  assert.ok(known.has(item.name), `Unexpected browser import: ${item.name}`);
}

let api;
let writeCalls = 0;
const { exports } = new WebAssembly.Instance(module, {
  wasi_snapshot_preview1: {
    fd_close: () => 8, // EBADF: this sandbox opens no files.
    fd_seek: () => 8,
    fd_write: (fd, iovs, count, written) => {
      if ((fd !== 1 && fd !== 2) || !api) return 8;
      ++writeCalls;
      const view = new DataView(api.memory.buffer);
      let total = 0;
      for (let i = 0; i < count; ++i) total += view.getUint32(iovs + i * 8 + 4, true);
      view.setUint32(written, total, true);
      return 0;
    },
  },
});
api = exports;
api._initialize?.();
const phase = { menu: 0, run: 1, siege: 2, won: 3, lost: 4 };
const state = () => Array.from(new Float32Array(api.memory.buffer, api.state(), 19));
const encounters = () => Array.from(new Float32Array(api.memory.buffer, api.encounters(), api.encounter_count() * 9));
const packets = () => Array.from(new Float32Array(api.memory.buffer, api.packets(), api.packet_count() * 4));
const route = t => t < 7.6 ? 0 : t < 8.5 ? -.5 : t < 17.6 ? 0 : t < 18.5 ? .5 : t < 23.6 ? 0 : t < 24.5 ? -.5 : 0;
let checks = 0;
function test(name, action) {
  action(); ++checks; console.log(`PASS ${name}`);
}
function advance(seconds, lane, hz = 60) {
  const steps = Math.round(seconds * hz);
  for (let i = 0; i < steps; ++i) api.step(1 / hz, typeof lane === 'function' ? lane(i / hz) : lane);
}
function reachSiege(lane = route, hz = 60) {
  let elapsed = 0;
  for (let i = 0; i < hz * 34; ++i) {
    api.step(1 / hz, lane(elapsed)); elapsed += 1 / hz;
    if (state()[0] !== phase.run) return state();
  }
  throw new Error('Runner never finished');
}

test('browser imports are limited to three WASI descriptor functions', () => {
  assert.equal(imports.length, 3);
  assert.ok(api.memory instanceof WebAssembly.Memory);
});
test('new run resets every exposed battle field', () => {
  api.start_run(0);
  const s = state();
  assert.deepEqual(s.slice(0, 10), [phase.run, 0, 5, 0, 100, 0, 100, 100, 0, 0]);
  assert.equal(s[11], 32); assert.equal(s[13], 0); assert.equal(s[18], 0);
  assert.equal(api.encounter_count(), 9);
  assert.equal(api.enemy_count(), 0); assert.equal(api.packet_count(), 0); assert.equal(api.siege_gate_count(), 0);
});
test('first recruitment applies exactly once', () => {
  api.start_run(0); advance(3.5, 0); assert.equal(state()[2], 15);
  assert.equal(encounters()[6], 1);
  advance(1, 0); assert.equal(state()[2], 15);
});
test('left multiplication and right recruitment gates each apply once', () => {
  for (const [lane, expected] of [[-.5, 30], [.5, 29]]) {
    api.start_run(0); advance(7.5, 0); advance(.75, lane);
    assert.equal(state()[2], expected);
    const e = encounters(); assert.equal(e[9 + 6], 1); assert.equal(e[18 + 6], 1);
    advance(.5, -lane); assert.equal(state()[2], expected);
  }
});
test('center misses both arithmetic gates rather than collecting both', () => {
  api.start_run(0); advance(8.5, 0); assert.equal(state()[2], 15);
});
test('all relics activate once, require charge and obey pause', () => {
  for (let relic = 0; relic < 3; ++relic) {
    api.start_run(relic); assert.equal(state()[18], relic);
    api.set_paused(1); assert.equal(api.use_relic(), 0); api.set_paused(0);
    assert.equal(api.use_relic(), 1); assert.equal(api.use_relic(), 0);
    assert.equal(state()[4], 0); assert.equal(state()[8], relic === 2 ? 5 : 3);
    assert.equal(api.use_champion(), 0);
  }
});
test('pause freezes time, army, reserve, charge and active ability', () => {
  api.start_run(0); advance(4, 0); api.use_relic(); api.set_paused(1);
  const before = state(); advance(10, 0);
  assert.deepEqual(state(), before);
  api.set_paused(0); advance(.5, 0); assert.ok(state()[1] > before[1]); assert.ok(state()[8] < before[8]);
});
test('runner transfers surviving army into siege reserve and keeps relic state', () => {
  api.start_run(2); const s = reachSiege();
  assert.equal(s[0], phase.siege); assert.equal(s[2], 90); assert.equal(s[3], s[2]);
  assert.ok(s[1] >= 32 && s[1] < 32.04); assert.equal(s[18], 2);
  assert.equal(s[4], 100); assert.equal(s[5], 40); assert.equal(s[9], 2);
  assert.equal(api.enemy_count(), 0); assert.equal(api.packet_count(), 0); assert.equal(api.siege_gate_count(), 2);
});
test('energy gate can refill a spent relic but cannot refill twice', () => {
  api.start_run(0);
  for (let i = 0; i < 22 * 60; ++i) api.step(1 / 60, route(i / 60));
  assert.equal(api.use_relic(), 1); assert.equal(state()[4], 0);
  advance(2.25, .5); assert.equal(state()[4], 100); assert.equal(state()[2], 45);
  assert.equal(api.use_relic(), 1); advance(.5, .5); assert.equal(state()[4], 0);
});
test('bad route can lose in runner; terminal state stops advancing', () => {
  api.start_run(0); advance(17.5, 1); advance(1, -.5);
  assert.equal(state()[0], phase.lost); assert.equal(state()[2], 0);
  const before = state(); advance(5, -.5); assert.deepEqual(state(), before);
});
test('missed gates produce finite siege reserves and an exhaustion defeat', () => {
  api.start_run(0); const transition = reachSiege(() => 1);
  assert.equal(transition[0], phase.siege); assert.equal(transition[3], 5);
  advance(8, 1); const s = state();
  assert.equal(s[0], phase.lost); assert.equal(s[3], 0); assert.equal(api.packet_count(), 0); assert.ok(s[6] > 0);
});
test('zero-upgrade route wins and packet multipliers never loop', () => {
  api.start_run(0); reachSiege();
  for (let i = 0; i < 60 * 20 && state()[0] === phase.siege; ++i) {
    api.step(1 / 60, 0);
    const rows = packets();
    for (let p = 0; p < rows.length; p += 4) {
      assert.ok(rows[p + 2] >= 1 && rows[p + 2] <= 6);
      assert.ok(rows[p + 3] >= 0 && rows[p + 3] <= 3);
    }
  }
  const s = state(); assert.equal(s[0], phase.won); assert.equal(s[6], 0); assert.ok(s[7] > 0);
  assert.equal(api.use_relic(), 0); assert.equal(api.use_champion(), 0);
});
test('charged commander deploys in siege and consumes its meter', () => {
  api.start_run(0); reachSiege();
  for (let i = 0; i < 600 && state()[5] < 100; ++i) api.step(1 / 60, 0);
  const before = state(); assert.equal(before[0], phase.siege); assert.equal(before[5], 100);
  assert.equal(api.use_champion(), 1); assert.equal(state()[5], 0); assert.equal(state()[6], Math.max(0, before[6] - 30));
  assert.equal(api.use_champion(), 0);
});
test('30 Hz and 60 Hz input produce equivalent fixed-step outcomes', () => {
  const simulate = hz => {
    api.start_run(0); const t = reachSiege(route, hz);
    advance(6, 0, hz); return { transfer: t.slice(2, 10), result: state().slice(2, 10), phase: state()[0] };
  };
  assert.deepEqual(simulate(30), simulate(60));
});
test('250 retries reset transient objects and preserve bounded memory', () => {
  api.start_run(0); reachSiege(); advance(6, 0);
  const bytes = api.memory.buffer.byteLength;
  for (let run = 0; run < 250; ++run) {
    api.start_run(run % 3); advance(4, 0); api.set_paused(1); api.start_run(0);
    const s = state(); assert.equal(s[0], phase.run); assert.equal(s[1], 0); assert.equal(s[2], 5);
    assert.equal(s[3], 0); assert.equal(s[5], 0); assert.equal(s[13], 0); assert.equal(api.packet_count(), 0); assert.equal(api.enemy_count(), 0);
  }
  assert.equal(api.memory.buffer.byteLength, bytes);
});
assert.equal(writeCalls, 0, 'Core unexpectedly required WASI output');
console.log(`${checks} WebAssembly integration checks passed; ${binary.length} bytes; no filesystem/network imports.`);
