import {build} from '../asset-viewer/node_modules/esbuild/lib/main.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..'),out=path.join(root,'delivery/playable');
await fs.mkdir(out,{recursive:true});
// A cached browser bundle must keep its matching array layout when a later
// checkpoint replaces assault.wasm. Test tools still use the canonical file.
const coreBytes=await fs.readFile(path.join(out,'assault.wasm'));
const coreHash=createHash('sha256').update(coreBytes).digest('hex');
const coreAsset=`assault.${coreHash.slice(0,16)}.wasm`;
await fs.writeFile(path.join(out,coreAsset),coreBytes);
const define={__MECHALORD_CORE_URL__:JSON.stringify(coreAsset)};
await build({absWorkingDir:here,entryPoints:['main.ts'],bundle:true,platform:'browser',format:'iife',target:'es2022',minify:true,sourcemap:true,
 define,nodePaths:[path.join(root,'tools/asset-viewer/node_modules')],outfile:path.join(out,'game.js')});
for(const name of ['index.html','style.css'])await fs.copyFile(path.join(here,name),path.join(out,name));
await build({absWorkingDir:here,entryPoints:['review.ts'],bundle:true,platform:'browser',format:'esm',target:'es2022',minify:true,define,nodePaths:[path.join(root,'tools/asset-viewer/node_modules')],outfile:path.join(out,'review.js')});
await fs.copyFile(path.join(here,'review.html'),path.join(out,'review.html'));
await build({absWorkingDir:here,entryPoints:['villains.ts'],bundle:true,platform:'browser',format:'esm',target:'es2022',minify:true,nodePaths:[path.join(root,'tools/asset-viewer/node_modules')],outfile:path.join(out,'villains.js')});
await fs.copyFile(path.join(here,'villains.html'),path.join(out,'villains.html'));
// Reloading a local playtest must show the newly built code, not a cached revision.
for(const [html,script] of [['index.html','game.js'],['review.html','review.js']]){
 const hash=createHash('sha256').update(await fs.readFile(path.join(out,script))).digest('hex').slice(0,12);
 let text=await fs.readFile(path.join(out,html),'utf8');
 text=text.replace(`src="${script}"`,`src="${script}?v=${hash}"`).replace('href="style.css"',`href="style.css?v=${hash}"`);
 await fs.writeFile(path.join(out,html),text);
}
for(const [source,dest] of [['relic-marshal-hf-rigged-source.glb','commander.glb'],['relic-marshal-hf-mobile.glb','troop.glb'],['rust-crawler-source-v2.glb','crawler.glb'],['cinder-reaver-v3.glb','cinder-reaver.glb'],['forge-tyrant-v3.glb','forge-tyrant.glb']])
 await fs.copyFile(path.join(root,'assets/exports',source),path.join(out,dest));
const environmentAssets=['SuspendedIsland','SpineConnector','SunkenRoute','CitadelBowl','TaperedButtress','PressureVessel','CoolingStack','ArticulatedServiceArm','ReactorBank','CitadelSpire','CableDrum','DistantFoundryWorks','DistantTransferGallery','ReactorBulkhead'];
await fs.mkdir(path.join(out,'environment'),{recursive:true});
// CC0 Quaternius Sci-Fi Essentials robots for the allied machines.
await fs.mkdir(path.join(out,'herobots'),{recursive:true});for(const file of await fs.readdir(path.join(root,'assets/originals/quaternius-scifi-essentials')))if(file!=='SOURCE.md')await fs.copyFile(path.join(root,'assets/originals/quaternius-scifi-essentials',file),path.join(out,'herobots',file));
// CC0 Quaternius mech cast (see assets/originals/quaternius-animated-mech-pack/SOURCE.md).
await fs.mkdir(path.join(out,'mechs'),{recursive:true});for(const name of ['George','Leela','Mike','Stan']){await fs.copyFile(path.join(root,'assets/originals/quaternius-animated-mech-pack',name+'_Texture.png'),path.join(out,'mechs',name+'_Texture.png'));await fs.copyFile(path.join(root,'assets/exports',name.toLowerCase()+'-hostile-mech.glb'),path.join(out,'mechs',name.toLowerCase()+'-hostile-mech.glb'));await fs.rm(path.join(out,'mechs',name+'.fbx'),{force:true});}
for(const name of environmentAssets)await fs.copyFile(path.join(root,'assets/exports/reforged',name+'.glb'),path.join(out,'environment',name+'.glb'));
const manifest={builtAt:new Date().toISOString(),coreAsset,coreSha256:coreHash,files:{}};
for(const file of [coreAsset,'game.js','review.js','index.html','review.html','style.css','commander.glb','troop.glb','crawler.glb','cinder-reaver.glb','forge-tyrant.glb']){const bytes=await fs.readFile(path.join(out,file));manifest.files[file]={bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}
for(const name of environmentAssets){const file='environment/'+name+'.glb',bytes=await fs.readFile(path.join(out,file));manifest.files[file]={bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}
await fs.writeFile(path.join(root,'builds/playable-build-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const files=await fs.readdir(out);console.log('Playable preview built:',files.join(', '));
