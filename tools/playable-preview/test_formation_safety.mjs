// Standalone native check; no edits/rebuild of the playable WASM or simulation.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const build=path.join(root,'builds');fs.mkdirSync(build,{recursive:true});
const compiler=path.join(root,'tools/vendor/zig-x86_64-windows-0.17.0/zig.exe');
const binary=path.join(build,'formation-safety-tests.exe');
const compile=spawnSync(compiler,['c++','-std=c++17','-O2','-fno-exceptions','-fno-rtti',`-I${path.join(root,'game/Mechalord/Source/Mechalord')}`,path.join(root,'tools/playable-preview/test_formation_safety.cpp'),'-o',binary],{encoding:'utf8',timeout:180000});
if(compile.status!==0){process.stderr.write(compile.stderr||String(compile.error));process.exit(1);}
const run=spawnSync(binary,[],{encoding:'utf8',timeout:30000});
process.stdout.write(run.stdout||'');if(run.stderr)process.stderr.write(run.stderr);
const tests=(run.stdout||'').split('\n').filter(x=>x.startsWith('PASS ')||x.startsWith('FAIL '));
fs.writeFileSync(path.join(build,'formation-safety-results.json'),JSON.stringify({timestamp:new Date().toISOString(),scope:'Standalone C++ admission helper; not yet integrated into Battle',exitCode:run.status,tests,metrics:(run.stdout||'').split('\n').filter(x=>x.startsWith('METRIC ')),summary:(run.stdout||'').match(/RESULT .*$/m)?.[0]},null,2)+'\n');
process.exit(run.status??1);
