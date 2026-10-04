import {build} from '../asset-viewer/node_modules/esbuild/lib/main.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..'),out=path.join(root,'delivery/playable');
await fs.mkdir(out,{recursive:true});
await build({absWorkingDir:here,entryPoints:['main.ts'],bundle:true,platform:'browser',format:'iife',target:'es2022',minify:true,sourcemap:true,
 nodePaths:[path.join(root,'tools/asset-viewer/node_modules')],outfile:path.join(out,'game.js')});
for(const name of ['index.html','style.css'])await fs.copyFile(path.join(here,name),path.join(out,name));
for(const [source,dest] of [['relic-marshal-hf-rigged-source.glb','commander.glb'],['relic-marshal-hf-mobile.glb','troop.glb'],['rust-crawler-source-v2.glb','crawler.glb'],['cinder-reaver-v3.glb','cinder-reaver.glb'],['forge-tyrant-v3.glb','forge-tyrant.glb']])
 await fs.copyFile(path.join(root,'assets/exports',source),path.join(out,dest));
const files=await fs.readdir(out);console.log('Playable preview built:',files.join(', '));
