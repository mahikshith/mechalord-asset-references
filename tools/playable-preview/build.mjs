import {build} from '../asset-viewer/node_modules/esbuild/lib/main.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..'),out=path.join(root,'delivery/playable');
await fs.mkdir(out,{recursive:true});
await build({absWorkingDir:here,entryPoints:['main.ts'],bundle:true,platform:'browser',format:'iife',target:'es2022',minify:true,sourcemap:true,
 nodePaths:[path.join(root,'tools/asset-viewer/node_modules')],outfile:path.join(out,'game.js')});
for(const name of ['index.html','style.css'])await fs.copyFile(path.join(here,name),path.join(out,name));
await build({absWorkingDir:here,entryPoints:['review.ts'],bundle:true,platform:'browser',format:'esm',target:'es2022',minify:true,nodePaths:[path.join(root,'tools/asset-viewer/node_modules')],outfile:path.join(out,'review.js')});
await fs.copyFile(path.join(here,'review.html'),path.join(out,'review.html'));
// Reloading a local playtest must show the newly built code, not a cached revision.
for(const [html,script] of [['index.html','game.js'],['review.html','review.js']]){
 const hash=createHash('sha256').update(await fs.readFile(path.join(out,script))).digest('hex').slice(0,12);
 let text=await fs.readFile(path.join(out,html),'utf8');
 text=text.replace(`src="${script}"`,`src="${script}?v=${hash}"`).replace('href="style.css"',`href="style.css?v=${hash}"`);
 await fs.writeFile(path.join(out,html),text);
}
for(const [source,dest] of [['relic-marshal-hf-rigged-source.glb','commander.glb'],['relic-marshal-hf-mobile.glb','troop.glb'],['rust-crawler-source-v2.glb','crawler.glb'],['cinder-reaver-v3.glb','cinder-reaver.glb'],['forge-tyrant-v3.glb','forge-tyrant.glb']])
 await fs.copyFile(path.join(root,'assets/exports',source),path.join(out,dest));
const files=await fs.readdir(out);console.log('Playable preview built:',files.join(', '));
