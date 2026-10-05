import {build} from '../asset-viewer/node_modules/esbuild/lib/main.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const out=path.join(root,'delivery/reforged-playable');
const exported=path.join(root,'assets/exports/reforged');
// A separate delivery preserves the previous playable build and its saved progress.
await fs.mkdir(path.join(out,'assets'),{recursive:true});
const common={absWorkingDir:here,bundle:true,platform:'browser',target:'es2022',minify:true,
  nodePaths:[path.join(root,'tools/asset-viewer/node_modules')]};
await build({...common,entryPoints:['main.ts'],format:'iife',sourcemap:true,outfile:path.join(out,'game.js')});
await build({...common,entryPoints:['review.ts'],format:'esm',outfile:path.join(out,'review.js')});
const bundled=await fs.readFile(path.join(out,'game.js'),'utf8');
for(const legacy of ['commander.glb','troop.glb','cinder-reaver.glb','forge-tyrant.glb']){
  if(bundled.includes(legacy))throw new Error(`Legacy character still requested by Reforged runtime: ${legacy}`);
}
for(const file of ['index.html','style.css','review.html']) await fs.copyFile(path.join(here,file),path.join(out,file));
await fs.copyFile(path.join(root,'delivery/playable/assault.wasm'),path.join(out,'assault.wasm'));
const assetFiles=(await fs.readdir(exported)).filter(file=>/\.(glb|json)$/.test(file));
for(const required of ['RelicMarshal.glb','GearlingSentinel.glb','RustCrawler.glb','ArcWarden.glb','ForgeColossus.glb','SpineConnector.glb']){
  if(!assetFiles.includes(required)) throw new Error(`Missing new native asset: ${required}`);
}
for(const file of assetFiles) await fs.copyFile(path.join(exported,file),path.join(out,'assets',file));
for(const [html,script] of [['index.html','game.js'],['review.html','review.js']]){
  const hash=createHash('sha256').update(await fs.readFile(path.join(out,script))).update(await fs.readFile(path.join(out,'style.css'))).digest('hex').slice(0,12);
  const content=(await fs.readFile(path.join(out,html),'utf8')).replace(`src="${script}"`,`src="${script}?v=${hash}"`).replace('href="style.css"',`href="style.css?v=${hash}"`);
  await fs.writeFile(path.join(out,html),content);
}
const manifest={edition:'Mechalord Reforged',assetSource:'Native Reforged geometry',runtime:'Browser WebGL + existing C++ WASM combat',files:[]};
for(const file of ['game.js','style.css','assault.wasm',...assetFiles.map(f=>`assets/${f}`)]){
  const bytes=await fs.readFile(path.join(out,file));
  manifest.files.push({file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
await fs.writeFile(path.join(out,'build-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Reforged playable built separately: ${assetFiles.length} native asset files; ${(manifest.files.reduce((sum,f)=>sum+f.bytes,0)/1048576).toFixed(1)} MB.`);
