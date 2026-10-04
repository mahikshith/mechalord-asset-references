import {build} from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('../..');
const definitions=[
 ['Commander — detailed TRELLIS source','relic-marshal-hf-rigged-source.glb','Preserved detailed geometry with a first-pass local rig. Joint cleanup remains pending.'],
 ['Commander — mobile candidate','relic-marshal-hf-rigged-mobile.glb','4,000-triangle target candidate. Inspect armor, weapon and joints before acceptance.'],
 ['Allied troop — local design study','gearling-sentinel-source-v2.glb','Blender interpretation. Original reference fidelity and Android validation remain pending.'],
 ['Enemy — local design study','rust-crawler-source-v2.glb','Blender interpretation. Original reference fidelity and Android validation remain pending.'],
];
const assets=[];
for(const [name,file,notes] of definitions){
 const glb=await fs.readFile(path.join(root,'assets/exports',file));
 const size=glb.readUInt32LE(12);const model=JSON.parse(glb.subarray(20,20+size).toString());
 let triangles=0;for(const mesh of model.meshes??[])for(const p of mesh.primitives??[])triangles+=(p.indices===undefined?model.accessors[p.attributes.POSITION].count:model.accessors[p.indices].count)/3;
 assets.push({name,glb:glb.toString('base64'),triangles,materials:model.materials?.length??0,notes});
}
const bundle=await build({entryPoints:['viewer.js'],bundle:true,write:false,format:'iife',minify:true});
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mechalord · Asset workshop</title>
<style>*{box-sizing:border-box}body{margin:0;background:#172628;color:#f3e8d8;font:16px system-ui}main{height:100dvh;display:grid;grid-template-columns:300px 1fr}aside{padding:28px 24px;overflow:auto}h1{font-size:27px;margin:8px 0 24px}p{line-height:1.5;color:#c6d0cb}label{display:block;margin-top:24px;font-size:13px;color:#c6d0cb}select,button{width:100%;padding:12px;margin-top:8px;border:1px solid #556769;border-radius:7px;background:#243d40;color:#fff;font:inherit}button{cursor:pointer}#stats{color:#e3bc75}#canvas{min-width:0;height:100%;overflow:hidden}canvas{display:block}small{display:block;line-height:1.5;color:#a6b6b4;margin-top:24px}@media(max-width:700px){main{grid-template-columns:1fr;grid-template-rows:auto 1fr}aside{padding:14px}h1{font-size:20px;margin:0 0 8px}label{margin-top:8px}aside p,small{display:none}#canvas{min-height:320px}}</style>
<main><aside><h1>Mechalord<br>Asset workshop</h1><p>Rotate, zoom and inspect the actual exported 3D files.</p><label for="asset">Model</label><select id="asset"></select><label for="clip">Animation</label><select id="clip"></select><button id="pause">Pause animation</button><button id="reset">Reset view</button><p id="stats"></p><p id="status" role="status"></p><small>These are asset previews. Production acceptance, Unreal import and Android performance are pending. All model data and viewer code are included in this file; no service credits or network connection required.</small></aside><section id="canvas" aria-label="Interactive 3D asset preview"></section></main>
<script>window.ASSETS=${JSON.stringify(assets)};</script><script>${bundle.outputFiles[0].text.replaceAll('</script','<\\/script')}</script></html>`;
await fs.mkdir(path.join(root,'delivery'),{recursive:true});
await fs.writeFile(path.join(root,'delivery/asset-workshop.html'),html);
console.log(JSON.stringify({path:path.join(root,'delivery/asset-workshop.html'),models:assets.map(({name,triangles,materials})=>({name,triangles,materials})),bytes:Buffer.byteLength(html)}));
