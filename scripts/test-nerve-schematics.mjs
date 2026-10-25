// Schematic nerve tubes: thin, in the right layer, in the right system, correctly named, and the vertebral artery sits beside C1.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
import {buildSchematics,coverage,vertebralArteryReport} from './lib/nerve-schematics.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const tubes=buildSchematics(root);
for(const t of tubes)assert.ok(t.r[0]<=.0008,`${t.name}: radius ${t.r[0]} must stay thin (<= 0.8 mm)`);
const by=n=>tubes.find(t=>t.name===n+'.l.001'),L=['Left splenius capitis','Descending part of left trapezius','Transverse part of left trapezius','Left semispinalis capitis'];
const gon=coverage(root,by('Greater occipital nerve'),L),third=coverage(root,by('Third occipital nerve'),L),sub=coverage(root,by('Suboccipital nerve'),[...L,'Left obliquus capitis superior','Left rectus capitis posterior major']);
assert.ok(gon>=.6,`greater occipital nerve mostly under splenius/trapezius (${gon.toFixed(2)})`);
assert.ok(third>=.8,`third occipital nerve under semispinalis/splenius/trapezius (${third.toFixed(2)})`);
assert.ok(sub>=.9,`suboccipital nerve inside the suboccipital triangle (${sub.toFixed(2)})`);
const va=vertebralArteryReport(root);for(const v of va)assert.ok(v.artery_vertices_at_C1>20&&v.min_distance_mm<8,`${v.side} vertebral artery lies beside the atlas (${v.min_distance_mm} mm)`);
// Names and systems everywhere a user can meet them.
const info=(await runnerImport(root+'app/mj-structure-info.ts')).module;
const stream=JSON.parse(fs.readFileSync(root+'public/models/nerve-stream.json','utf8')),extras=JSON.parse(zlib.gunzipSync(fs.readFileSync(root+'public/models/search-extras.json.gz')));
const bad=/神經構造|肌肉（|骨骼構造|\b0\d\d\b|[A-Za-z]{4,}/;
for(const c of stream.chunks)for(const m of c.meshes){const p=info.structureProfile(m.name,/vein|venous/i.test(m.name)?'venous':'nervous'),z=p.chinese??'';assert.ok(!bad.test(z.replace(/\b[IVX]+\b/g,'').replace(/\b[CTLS]\d+\b/g,'')),`${m.name} → "${z}" still carries English, a mesh number or a placeholder`);assert.ok(!/\b0\d\d\b/.test(p.english),`${m.name} → "${p.english}" shows a mesh number`);}
for(const e of extras)if(/venous plexus|vein/i.test(e.n)&&e.k==='nerve')assert.equal(e.s,'venous',`${e.n} must be a vein`);
for(const e of extras.filter(e=>/suboccipital venous plexus/i.test(e.n)))assert.equal(e.s,'venous');
for(const n of ['Greater occipital nerve.l.001','Suboccipital venous plexus.r.001']){const z=info.structureProfile(n,'nervous').chinese;assert.equal(z,n.startsWith('Greater')?'左枕大神經':'右枕下靜脈叢');}
console.log(`PASS nerve schematics: ${tubes.length} tubes, radius <= 0.8 mm, greater occipital nerve ${Math.round(gon*100)}% under splenius/trapezius, vertebral arteries ${va.map(v=>v.min_distance_mm+' mm').join(' / ')} from the atlas, names clean, plexus in the Veins system.`);
