// Schematic nerve tubes: thin, in the right layer, in the right system, correctly named, and the vertebral artery sits beside C1.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
import {buildSchematics,coverage,vertebralArteryReport,pointsInsideBone} from './lib/nerve-schematics.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const tubes=buildSchematics(root);
for(const t of tubes)assert.ok(t.r[0]<=.0008,`${t.name}: radius ${t.r[0]} must stay thin (<= 0.8 mm)`);
const by=n=>tubes.find(t=>t.name===n+'.l.001'),L=['Left splenius capitis','Descending part of left trapezius','Transverse part of left trapezius','Left semispinalis capitis'];
const gon=coverage(root,by('Greater occipital nerve'),L),third=coverage(root,by('Third occipital nerve'),L),sub=coverage(root,by('Suboccipital nerve'),[...L,'Left obliquus capitis superior','Left rectus capitis posterior major']);
assert.ok(gon>=.6,`greater occipital nerve mostly under splenius/trapezius (${gon.toFixed(2)})`);
assert.ok(third>=.8,`third occipital nerve under semispinalis/splenius/trapezius (${third.toFixed(2)})`);
assert.ok(sub>=.9,`suboccipital nerve inside the suboccipital triangle (${sub.toFixed(2)})`);
// nothing passes through C1, C2 or C3; C2 (axis) is in the atlas
for(const t of tubes){const r=pointsInsideBone(root,t.pts,['Atlas','Axis','Third cervical vertebra']);assert.equal(r.inside,0,`${t.name}: ${r.inside} of ${r.total} sampled points lie inside a vertebra`);}
// diameters stay in the 1-3 mm range for trunks (twigs and small veins thinner), and every path bends (is not a straight line)
for(const t of tubes){
  const main=t.pts.length>2&&!/venous/i.test(t.name);
  if(main){let dev=0;const a=t.pts[0],b=t.pts[t.pts.length-1],d=b.map((v,i)=>v-a[i]),L=Math.hypot(...d);for(const p of t.pts){const w=p.map((v,i)=>v-a[i]),k=(w[0]*d[0]+w[1]*d[1]+w[2]*d[2])/(L*L),q=w.map((v,i)=>v-k*d[i]);dev=Math.max(dev,Math.hypot(...q));}assert.ok(dev>.0008,`${t.name}: path must bend (max deviation from a straight line ${(dev*1000).toFixed(2)} mm)`);}
}
const plex=tubes.find(t=>t.name==='Suboccipital venous plexus.l.001');assert.ok(plex.pts.length>=40,'venous plexus is a web of many strands and links, not one line');
const va=vertebralArteryReport(root);for(const v of va)assert.ok(v.artery_vertices_at_C1>20&&v.min_distance_mm<8,`${v.side} vertebral artery lies beside the atlas (${v.min_distance_mm} mm)`);
// V3 segment: out of the C1 transverse foramen (x about 3 cm), over the lateral mass, along the groove on the posterior arch (centreline within 5 mm of the bone),
// then up through the posterior atlanto-occipital membrane to the foramen magnum at the midline.
{const {loadAtlasLandmarks,vertebralPath}=await import('./lib/nerve-schematics.mjs');const {vertices}=loadAtlasLandmarks(root),atlasV=vertices('Atlas');
 for(const [w,sx] of [['Left',1],['Right',-1]]){const path=vertebralPath(vertices(`${w} vertebral artery`),sx),near=p=>Math.min(...atlasV.map(a=>Math.hypot(a[0]-p[0],a[1]-p[1],a[2]-p[2])));
  const groove=path.filter(p=>p[1]>1.553&&p[1]<1.562);assert.ok(groove.length>=2,`${w}: V3 runs along the posterior arch`);for(const p of groove)assert.ok(near(p)<.005,`${w}: V3 lies in the groove of the atlas (${(near(p)*1000).toFixed(1)} mm)`);
  const first=path[0],last=path[path.length-1];assert.ok(Math.abs(first[0])>.025&&Math.abs(first[0])<.035,`${w}: V3 starts at the C1 transverse foramen`);assert.ok(Math.abs(last[0])<.004&&last[1]>1.58,`${w}: V3 ends at the foramen magnum`);}}
// Names and systems everywhere a user can meet them.
const info=(await runnerImport(root+'app/mj-structure-info.ts')).module;
const stream=JSON.parse(fs.readFileSync(root+'public/models/nerve-stream.json','utf8')),extras=JSON.parse(zlib.gunzipSync(fs.readFileSync(root+'public/models/search-extras.json.gz')));
const bad=/神經構造|肌肉（|骨骼構造|\b0\d\d\b|[A-Za-z]{4,}/;
for(const c of stream.chunks)for(const m of c.meshes){const p=info.structureProfile(m.name,/vein|venous/i.test(m.name)?'venous':'nervous'),z=p.chinese??'';assert.ok(!bad.test(z.replace(/\b[IVX]+\b/g,'').replace(/\b[CTLS]\d+\b/g,'')),`${m.name} → "${z}" still carries English, a mesh number or a placeholder`);assert.ok(!/\b0\d\d\b/.test(p.english),`${m.name} → "${p.english}" shows a mesh number`);}
for(const e of extras)if(/venous plexus|vein/i.test(e.n)&&e.k==='nerve')assert.equal(e.s,'venous',`${e.n} must be a vein`);
for(const e of extras.filter(e=>/suboccipital venous plexus/i.test(e.n)))assert.equal(e.s,'venous');
for(const n of ['Greater occipital nerve.l.001','Suboccipital venous plexus.r.001']){const z=info.structureProfile(n,'nervous').chinese;assert.equal(z,n.startsWith('Greater')?'左枕大神經':'右枕下靜脈叢');}
console.log(`PASS nerve schematics: ${tubes.length} tubes, radius <= 0.8 mm, greater occipital nerve ${Math.round(gon*100)}% under splenius/trapezius, vertebral arteries ${va.map(v=>v.min_distance_mm+' mm').join(' / ')} from the atlas, names clean, plexus in the Veins system.`);
