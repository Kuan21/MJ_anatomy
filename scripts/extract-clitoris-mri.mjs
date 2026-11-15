// Maintainer tool (not run by the build): imports the Clitoris-MRI-2 model into scripts/data/clitoris-mri2.json.gz.
//   Source: "Clitoris-MRI-2" by Bioscope (Romain Dewaele) on Thingiverse, https://www.thingiverse.com/thing:5027449, licensed Creative Commons - Attribution - Non-Commercial - Share Alike.
//   The model was made from an MRI of a pre-menopausal woman without genital cutting (the method of Abdulcadir et al., J Sex Med 2020, doi 10.1016/j.jsxm.2020.05.025).
//   Modifications by this project (CC BY-NC-SA asks for them to be stated): the single closed surface is cut into six named parts (glans, body, two crura, two bulbs of the vestibule), simplified,
//   and placed on the female pelvis by scripts/paokao-structures/neck-breast-vulva.mjs.
//   usage: node scripts/extract-clitoris-mri.mjs <dir with files/Clitoris-MRI2.stl and LICENSE.txt>
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {readStl} from './lib/stl.mjs';

const dir = process.argv[2]; if (!dir) { console.error('usage: node scripts/extract-clitoris-mri.mjs <unzipped Clitoris-MRI-2 directory>'); process.exit(1); }
const file = `${dir}/files/Clitoris-MRI2.stl`, license = fs.readFileSync(`${dir}/LICENSE.txt`, 'utf8').trim();
if (!/Non-Commercial - Share Alike/i.test(license)) throw new Error('unexpected licence: ' + license);
const bytes = fs.readFileSync(file), mri = readStl(file), n = mri.positions.length / 3;

// The model is one closed surface (glans, body, crura and bulbs fused). It is cut along the anatomy with capsules laid along each part in the model's own top view
// (x across, y toward the glans, mm): every vertex goes to the capsule it is closest to (distance divided by the capsule radius), and the labels are smoothed over the mesh edges.
const CAP = [
  ['glans', [0, 24.5], [0, 15.5], 4.2, 4.2],
  ['body', [0, 15.5], [-0.7, -3], 4.8, 5.5],
  ['crusL', [-5, -2], [-31, -31], 3.6, 3.0],
  ['crusR', [5, -2], [33, -35], 3.6, 3.0],
  ['bulbL', [-4.5, -4], [-12, -25], 6.2, 7.0],
  ['bulbR', [5, -5], [14, -27], 6.2, 7.0],
];
const dseg = (p, a, b) => { const ax = b[0] - a[0], ay = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ax + (p[1] - a[1]) * ay) / (ax * ax + ay * ay))); return {d: Math.hypot(p[0] - (a[0] + t * ax), p[1] - (a[1] + t * ay)), t}; };
const label = new Uint8Array(n);
for (let i = 0; i < n; i++) { const p = [mri.positions[i * 3], mri.positions[i * 3 + 1]]; let best = 0, bs = Infinity; CAP.forEach((c, j) => { const s = dseg(p, c[1], c[2]), sc = s.d / (c[3] + (c[4] - c[3]) * s.t); if (sc < bs) { bs = sc; best = j; } }); label[i] = best; }
const nb = Array.from({length: n}, () => new Set());
for (let t = 0; t < mri.indices.length; t += 3) for (let k = 0; k < 3; k++) { const a = mri.indices[t + k], b = mri.indices[t + (k + 1) % 3]; nb[a].add(b); nb[b].add(a); }
for (let pass = 0; pass < 6; pass++) { const next = Uint8Array.from(label); for (let i = 0; i < n; i++) { const c = new Array(CAP.length).fill(0); for (const j of nb[i]) c[label[j]]++; c[label[i]] += 1.5; let b = 0; for (let k = 1; k < c.length; k++) if (c[k] > c[b]) b = k; next[i] = b; } label.set(next); }

// Clean-up: every label keeps only its largest connected patch; smaller islands (stray vertices on the border between two parts) go to the neighbouring label they share most edges with.
for (let round = 0; round < 4; round++) {
  const comp = new Int32Array(n).fill(-1), comps = [];
  for (let i = 0; i < n; i++) { if (comp[i] >= 0) continue; const id = comps.length, stack = [i], members = []; comp[i] = id; while (stack.length) { const v = stack.pop(); members.push(v); for (const w of nb[v]) if (comp[w] < 0 && label[w] === label[i]) { comp[w] = id; stack.push(w); } } comps.push({label: label[i], members}); }
  const biggest = new Map(); for (const c of comps) if (!biggest.has(c.label) || c.members.length > biggest.get(c.label).members.length) biggest.set(c.label, c);
  let moved = 0;
  for (const c of comps) { if (biggest.get(c.label) === c) continue; const votes = new Array(CAP.length).fill(0); for (const v of c.members) for (const w of nb[v]) if (label[w] !== c.label) votes[label[w]]++; let b = -1; for (let k = 0; k < votes.length; k++) if (votes[k] > 0 && (b < 0 || votes[k] > votes[b])) b = k; if (b >= 0) { for (const v of c.members) label[v] = b; moved += c.members.length; } }
  if (!moved) break;
}
// a few more majority passes so the borders between parts are short smooth curves
for (let pass = 0; pass < 8; pass++) { const next = Uint8Array.from(label); for (let i = 0; i < n; i++) { const c = new Array(CAP.length).fill(0); for (const j of nb[i]) c[label[j]]++; c[label[i]] += 1.2; let b = 0; for (let k = 1; k < c.length; k++) if (c[k] > c[b]) b = k; next[i] = b; } label.set(next); }

// one closed piece per label: triangles whose three vertices share the label, plus the triangles on the cut (assigned to the label of two of their vertices, else of the first)
const parts = {};
CAP.forEach(([name], j) => {
  const map = new Map(), pos = [], idx = [];
  for (let t = 0; t < mri.indices.length; t += 3) {
    const v = [mri.indices[t], mri.indices[t + 1], mri.indices[t + 2]], l = v.map(x => label[x]), own = l.filter(x => x === j).length;
    if (own < 2 && !(own === 1 && new Set(l).size === 3 && l[0] === j)) continue;
    for (const x of v) { if (!map.has(x)) { map.set(x, pos.length / 3); pos.push(mri.positions[x * 3], mri.positions[x * 3 + 1], mri.positions[x * 3 + 2]); } idx.push(map.get(x)); }
  }
  parts[name] = {positions: Buffer.from(Float32Array.from(pos).buffer).toString('base64'), indices: Buffer.from(Uint32Array.from(idx).buffer).toString('base64'), vertexCount: pos.length / 3, triangles: idx.length / 3};
});
const out = {source: 'Clitoris-MRI-2 by Bioscope (Romain Dewaele), Thingiverse thing:5027449', url: 'https://www.thingiverse.com/thing:5027449', license: 'CC BY-NC-SA', licenseText: license,
  method: 'Abdulcadir et al. 2020, J Sex Med, doi 10.1016/j.jsxm.2020.05.025 (MRI of a pre-menopausal woman without genital cutting, edited in Blender)', sourceSha256: createHash('sha256').update(bytes).digest('hex'), unit: 'mm',
  frame: 'x across, y toward the glans, z toward the raised body (the hump above the plane of the crura and bulbs)', modification: 'cut into six parts along the anatomy (capsule labelling); geometry otherwise unchanged', parts};
fs.writeFileSync(new URL('./data/clitoris-mri2.json.gz', import.meta.url), gzipSync(Buffer.from(JSON.stringify(out)), {level: 9}));
console.log(Object.entries(parts).map(([k, v]) => `${k}: ${v.triangles} triangles`).join(', '), '| source sha256', out.sourceSha256.slice(0, 16));
