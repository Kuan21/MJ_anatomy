// Names of every structure the viewer can draw that is NOT an atlas concept — external nerves, joint ligaments and capsules, brain
// structures and neck vessels — so "Find a structure" can find them too. They used to be reachable only by clicking the right mesh.
import fs from 'node:fs';
import {gzipSync, gunzipSync} from 'node:zlib';
const models = new URL('../public/models/', import.meta.url), read = f => fs.readFileSync(new URL(f, models));
const glb = f => {const b = read(f); return JSON.parse(b.toString('utf8', 20, 20 + b.readUInt32LE(12)));};
const side = s => /\.l(?:\.|$)/i.test(s) ? 'Left ' : /\.r(?:\.|$)/i.test(s) ? 'Right ' : '';
const clean = s => s.replace(/\*/g, '').replace(/\.[lr](?:\.\d+)?$/i, '').replace(/\.00\d$/, '').replace(/^\((.*)\)$/, '$1').trim();
const lc = s => s[0].toLowerCase() + s.slice(1);
/** A name that already opens with a side word ("left common carotid artery") is written Left/Right like every other side-first name. */
const capSide = s => s.replace(/^(left|right) /, (m, w) => w[0].toUpperCase() + w.slice(1) + ' ');
const entries = [];
const nerves = JSON.parse(read('nerve-stream.json'));
for (const c of nerves.chunks) for (const m of c.meshes) {
  entries.push({n: side(m.name) + lc(clean(m.name)), s: /vein|venous/i.test(m.name) ? 'venous' : 'nervous', k: 'nerve', raw: m.name});
}
// joints: named as the scene names their meshes (za_name), so a drawn tissue found by search can be highlighted and framed
for (const n of glb('joints.glb').nodes) if (n.name) entries.push({n: side(n.name) + lc(clean(n.name)), s: 'connective', k: 'joint', raw: String(n.extras?.za_name ?? n.name).replaceAll('_', ' ')});
for (const n of glb('brain.glb').nodes) if (n.extras?.bx_label) entries.push({n: (n.extras.bx_side === 'left' ? 'Left ' : n.extras.bx_side === 'right' ? 'Right ' : '') + lc(n.extras.bx_label.replace(/\*/g, '').trim()), s: 'nervous', k: 'brain'});
// neck vessels: named as the scene names their meshes so a search result can be highlighted and framed
for (const v of JSON.parse(gunzipSync(read('neck-vessels.json.gz'))).vessels) entries.push({n: capSide(side(v.name) + lc(clean(v.name))), s: v.system, k: 'vessel', raw: v.name});
const unique = [...new Map(entries.map(e => [e.k + ':' + (e.raw ?? e.n), e])).values()];
fs.writeFileSync(new URL('search-extras.json.gz', models), gzipSync(Buffer.from(JSON.stringify(unique)), {level: 9}));
console.log(`Search index extras: ${unique.length} structures outside the atlas concepts (nerves ${unique.filter(e => e.k === 'nerve').length}, joints ${unique.filter(e => e.k === 'joint').length}, brain ${unique.filter(e => e.k === 'brain').length}, neck vessels ${unique.filter(e => e.k === 'vessel').length}).`);
