// Names of every structure the viewer can draw that is NOT an atlas concept — external nerves, joint ligaments and capsules, brain
// structures and neck vessels — so "Find a structure" can find them too. They used to be reachable only by clicking the right mesh.
import fs from 'node:fs';
import {gzipSync, gunzipSync} from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';
const models = new URL('../public/models/', import.meta.url), read = f => fs.readFileSync(new URL(f, models));
const glb = f => {const b = read(f); return JSON.parse(b.toString('utf8', 20, 20 + b.readUInt32LE(12)));};
const side = s => /\.l(?:\.|$)/i.test(s) ? 'Left ' : /\.r(?:\.|$)/i.test(s) ? 'Right ' : '';
const clean = s => s.replace(/\*/g, '').replace(/\.[lr](?:\.\d+)?$/i, '').replace(/\.00\d$/, '').replace(/^\((.*)\)$/, '$1').trim();
const lc = s => s[0].toLowerCase() + s.slice(1);
/** "Left " + lower-case name, or the name as written when it has no side: a sideless structure keeps its capital (Pubic symphysis, not pubic symphysis). */
const sided = n => { const w = side(n); return w ? w + lc(clean(n)) : clean(n); };
/** A name that already opens with a side word ("left common carotid artery") is written Left/Right like every other side-first name. */
const capSide = s => s.replace(/^(left|right) /, (m, w) => w[0].toUpperCase() + w.slice(1) + ' ');
const entries = [];
const nerves = JSON.parse(read('nerve-stream.json'));
for (const c of nerves.chunks) for (const m of c.meshes) {
  entries.push({n: sided(m.name), s: /vein|venous/i.test(m.name) ? 'venous' : 'nervous', k: 'nerve', raw: m.name});
}
// joints: only the tissues the scene draws (same rule as the viewer: app/biomechanics-v2/joint-filter.ts), named as the scene names their meshes (za_name), so a drawn tissue found by search can be highlighted and framed
const {includeJoint} = await quizModule('app/biomechanics-v2/joint-filter.ts');
for (const n of glb('joints.glb').nodes) if (n.name && includeJoint(String(n.extras?.za_name ?? n.name).replaceAll('_', ' '))) entries.push({n: sided(n.name), s: 'connective', k: 'joint', raw: String(n.extras?.za_name ?? n.name).replaceAll('_', ' ')});
for (const n of glb('brain.glb').nodes) if (n.extras?.bx_label) entries.push({n: (n.extras.bx_side === 'left' ? 'Left ' : n.extras.bx_side === 'right' ? 'Right ' : '') + lc(n.extras.bx_label.replace(/\*/g, '').trim()), s: 'nervous', k: 'brain'});
// neck vessels: named as the scene names their meshes so a search result can be highlighted and framed
for (const v of JSON.parse(gunzipSync(read('neck-vessels.json.gz'))).vessels) entries.push({n: capSide(side(v.name) + lc(clean(v.name))), s: v.system, k: 'vessel', raw: v.name});
// heart detail mode: its structures that the main atlas has no concept for (crista terminalis, fossa ovalis, moderator band, the coronary branches …) open #/organ/heart on that structure.
// Read from the committed source list (scripts/heart-parts.json) and the atlas catalogue, which exist whenever this script runs; the generated stream packages may not yet.
{
  const norm = s => s.toLowerCase().replace(/\s*\([^)]*\)/g, '').replace(/\b(left|right)\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
  const known = new Set(JSON.parse(gunzipSync(read('atlas-stream.json.gz'))).concepts.map(c => norm(c.name)));
  for (const f of ['facial/facial-stream.json.gz', 'supplement/supplement-stream.json.gz', 'female/female-stream.json.gz', 'serous/serous-stream.json.gz', 'vessel-ends/vessel-ends-stream.json.gz', 'paokao/paokao-stream.json.gz']) if (fs.existsSync(new URL(f, models))) for (const part of JSON.parse(gunzipSync(read(f))).parts) known.add(norm(part.name));
  const heart = JSON.parse(fs.readFileSync(new URL('../scripts/heart-parts.json', import.meta.url), 'utf8'));
  const systemOf = p => p.group === 'coronary' ? 'arterial' : p.group === 'veins' || /vein|sinus/i.test(p.name) ? 'venous' : p.group === 'vessels' ? 'arterial' : 'cardiac';
  // the pericardial layers are drawn by the serous-membrane package of the main atlas (whether or not it is built yet), so they never come from here
  for (const p of [...heart.parts, ...(heart.bodyparts3d ?? []), ...(heart.mj ?? [])]) if (!/pericardium$/i.test(norm(p.name)) && !known.has(norm(p.name)) && !known.has(norm(p.name) + 's') && !known.has(norm(p.name).replace(/s$/, ''))) entries.push({n: p.name, s: systemOf(p), k: 'heart', z: p.zh});
}
const unique = [...new Map(entries.map(e => [e.k + ':' + (e.raw ?? e.n), e])).values()];
fs.writeFileSync(new URL('search-extras.json.gz', models), gzipSync(Buffer.from(JSON.stringify(unique)), {level: 9}));
console.log(`Search index extras: ${unique.length} structures outside the atlas concepts (nerves ${unique.filter(e => e.k === 'nerve').length}, joints ${unique.filter(e => e.k === 'joint').length}, brain ${unique.filter(e => e.k === 'brain').length}, neck vessels ${unique.filter(e => e.k === 'vessel').length}, heart ${unique.filter(e => e.k === 'heart').length}).`);
