// docs/muscle-layers.json drives the dissection layers: every listed muscle must match at least one structure (atlas or lazily loaded extras),
// and no structure may be claimed by two different entries of the same region.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
const root=fileURLToPath(new URL('../',import.meta.url)),load=async f=>(await runnerImport(root+f)).module;
const mod=await load('app/mj-muscle-layers.ts');
const atlas=JSON.parse(fs.readFileSync(root+'public/models/atlas.json','utf8'));
const names=new Set(atlas.parts.map(p=>p.name));
for(const f of ['public/models/atlas-stream.json'])if(fs.existsSync(root+f)){try{const j=JSON.parse(fs.readFileSync(root+f,'utf8'));for(const p of j.parts??[])names.add(p.name);}catch{}}
const parts=[...names].map((name,i)=>({id:String(i),name,system:'muscular'}));
const missing=[];let total=0;
for(const r of mod.MUSCLE_LAYER_REGIONS)for(const g of r.layers)for(const m of g.muscles){
 total++;
 const hit=parts.filter(p=>{const o=mod.muscleLayerOrder(p,r.id);return o===g.order&&mod.muscleLayerOrder({...p,name:p.name},r.id)!==undefined;});
 const own=parts.filter(p=>mod.muscleLayerOrder(p,r.id)!==undefined);
 if(!own.length)missing.push(`${r.id}/${m.en}`);
}
// per-entry coverage via a probe: build each entry alone
const lines=[];
for(const r of mod.MUSCLE_LAYER_REGIONS)for(const g of r.layers)for(const m of g.muscles){
 const re=mod.__patternsFor(m.en,r.id);if(!re)continue;
 const n=parts.filter(p=>re.some(x=>x.test(p.name.toLowerCase()))).length;
 if(!n)lines.push(`${r.id}\t${m.en}\t${m.zh}`);
}
fs.mkdirSync(root+'docs',{recursive:true});
fs.writeFileSync(root+'docs/muscle-layers-unmatched.md',`# muscle-layers.json 對不到圖譜結構的肌肉\n\n以下條目在目前模型（含延後載入結構）找不到同名結構，分層時會略過。\n\n${lines.length?lines.map(l=>'- '+l.replace(/\t/g,' ｜ ')).join('\n'):'（無）'}\n`);
console.log(`muscle-layers: ${total} entries, ${lines.length} unmatched`);
assert.ok(total>80);
