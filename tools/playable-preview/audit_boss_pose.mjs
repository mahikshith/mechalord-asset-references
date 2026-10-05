import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';import{spawnSync}from'node:child_process';
import os from'node:os';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const compiler=path.join(root,'tools/vendor/zig-x86_64-windows-0.17.0/zig.exe'),binary=path.join(root,'builds/boss-pose-audit.exe');
const compile=spawnSync(compiler,['c++','-std=c++17','-O2','-fno-exceptions','-fno-rtti',`-I${path.join(root,'game/Mechalord/Source/Mechalord')}`,path.join(root,'tools/playable-preview/audit_boss_pose.cpp'),'-o',binary],{cwd:root,encoding:'utf8',timeout:180000});if(compile.status!==0){console.error(compile.stderr||compile.error);process.exit(1);}
const run=spawnSync(binary,[],{cwd:root,encoding:'utf8',timeout:60000});process.stdout.write(run.stdout||'');if(run.status!==0){console.error(run.stderr||run.error);process.exit(1);}
const dump=spawnSync(binary,['--dump'],{cwd:root,encoding:'utf8',timeout:30000});if(dump.status!==0)throw Error('Contact dump failed');fs.writeFileSync(path.join(root,'builds/boss-pose-contact-samples.json'),dump.stdout);
const batches=run.stdout.split('\n').filter(s=>s.startsWith('BATCH ')).map(s=>{const[,name,...fields]=s.trim().split(/\s+/);return{name,...Object.fromEntries(fields.map(s=>{const[k,v]=s.split('=');return[k,Number(v)];}))};});
fs.writeFileSync(path.join(root,'builds/boss-pose-audit.json'),JSON.stringify({scope:'Native isolated C++ helper on this PC; synthetic shot batches; no WASM/device/fps claim',timestamp:new Date().toISOString(),compiler:'Existing Zig C++17 -O2',cpu:os.cpus()[0]?.model,platform:process.platform,samplesPerBatch:100,warmupIterations:12,batches},null,2)+'\n');
