// Organ detail packages (public/models/organ/<organ>/, built by scripts/build-organ-atlas.mjs) against their definitions (app/organ/organs/<organ>.ts):
// every mesh of a package is described and the reverse, buffers are in range, surface markings have triangles, names are bilingual and unique, every structure has a card
// (or is declared as having none), card text exists in both languages and mentions no notes. Prints counts only.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {ORGAN_TITLES} = await quizModule('app/organ/organ-ids.ts');
const CJK = /[㐀-鿿]/, BANNED = /共筆|筆記|跑考|課堂|頁碼|考古題/;
const problems = [], fail = m => problems.push(m);
let total = 0;
for (const id of Object.keys(ORGAN_TITLES)) {
  const def = Object.values(await quizModule(`app/organ/organs/${id}.ts`)).find(d => d?.id === id);
  if (!def) { fail(`${id}: no definition exported`); continue; }
  const dir = new URL(`../public/models/organ/${id}/`, import.meta.url), manifest = JSON.parse(fs.readFileSync(new URL(`${id}.json`, dir))), bin = gunzipSync(fs.readFileSync(new URL(`${id}.bin.gz`, dir)));
  if (bin.length !== manifest.bytes) fail(`${id}: binary size differs from the manifest`);
  const meshes = new Map(manifest.parts.map(p => [p.id, p])), groups = new Set(def.groups.map(g => g.id)), keys = new Set(), seen = new Set();
  for (const p of manifest.parts) {
    if (p.positions % 4 || p.indices % 4 || p.normals % 2 || p.indexCount % 3) fail(`${id}/${p.id}: misaligned buffers`);
    if (p.indices + p.indexCount * 4 > bin.length || p.normals + p.vertexCount * 6 > bin.length || p.positions + p.vertexCount * 12 > bin.length) { fail(`${id}/${p.id}: buffers out of range`); continue; }
    const pos = new Float32Array(bin.buffer, bin.byteOffset + p.positions, p.vertexCount * 3), idx = new Uint32Array(bin.buffer, bin.byteOffset + p.indices, p.indexCount);
    if (idx.some(i => i >= p.vertexCount)) fail(`${id}/${p.id}: index beyond vertices`);
    if (pos.some((v, i) => !(v >= p.bounds[0][i % 3] - 1e-5 && v <= p.bounds[1][i % 3] + 1e-5))) fail(`${id}/${p.id}: vertex outside bounds`);
    for (const ch of ['triZone', 'triLine']) if (p[ch] !== undefined && p[ch] + p.indexCount / 3 > bin.length) fail(`${id}/${p.id}: ${ch} out of range`);
  }
  for (const p of def.parts) {
    total++;
    if (keys.has(p.key)) fail(`${id}: duplicate key ${p.key}`); keys.add(p.key);
    if (!groups.has(p.group)) fail(`${id}/${p.key}: unknown group`);
    if (!p.en.trim() || /\b(left|right)\b/i.test(p.en) && !/^(Left|Right) /.test(p.en) || /_|\.\d+$/.test(p.en)) fail(`${id}/${p.key}: English name`);
    if (!CJK.test(p.zh) || /[A-Za-z]/.test(p.zh)) fail(`${id}/${p.key}: Chinese name`);
    for (const n of [p.en.toLowerCase(), p.zh]) { if (seen.has(n)) fail(`${id}/${p.key}: duplicate name ${n}`); seen.add(n); }
    if (p.cardOnly) { if (!p.card) fail(`${id}/${p.key}: card-only without a card`); }
    else if (p.mark) {
      const host = meshes.get(p.mark.host); if (!host) { fail(`${id}/${p.key}: host mesh missing`); continue; }
      const off = host[p.mark.channel === 'zone' ? 'triZone' : 'triLine']; if (off === undefined) { fail(`${id}/${p.key}: host has no ${p.mark.channel} labels`); continue; }
      const lab = new Uint8Array(bin.buffer, bin.byteOffset + off, host.indexCount / 3); if (!p.mark.values.some(v => lab.includes(v))) fail(`${id}/${p.key}: marking covers no triangles`);
    } else if (!meshes.has(p.key)) fail(`${id}/${p.key}: no mesh in the package`);
    const c = p.card; if (!c) { fail(`${id}/${p.key}: no card`); continue; }
    const fields = ['loc', 'rel', 'course', 'contents', 'blood', 'nerve', 'fn', 'note'].filter(f => c[f]);
    if (fields.length < 3) fail(`${id}/${p.key}: card has ${fields.length} fields`);
    for (const f of fields) { const t = c[f]; if (t.en.length < 15 || !CJK.test(t.zh) || t.zh.length < 6) fail(`${id}/${p.key}.${f}: short or one-language text`); if (BANNED.test(t.en + t.zh)) fail(`${id}/${p.key}.${f}: mentions notes`); }
    for (const k of c.links ?? []) if (!def.parts.some(q => q.key === k)) fail(`${id}/${p.key}: link to unknown ${k}`);
  }
  for (const m of meshes.keys()) if (!def.parts.some(p => p.key === m)) fail(`${id}/${m}: packaged but not described`);
  if (BANNED.test(def.scope.join('') + def.peelNote)) fail(`${id}: scope text mentions notes`);
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`organ atlas: ${Object.keys(ORGAN_TITLES).length} organ package(s), ${total} structures checked.`);
