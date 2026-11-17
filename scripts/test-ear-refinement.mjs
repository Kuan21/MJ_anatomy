// Measurements of the refined ear parts (public/models/ear/ear-atlas.*): the pharyngotympanic tube is narrow in its bony part, narrowest at the isthmus, widens to the pharyngeal opening
// and is thinner than the cochlea; the facial and cochlear nerves have a believable calibre and stay one smooth piece in contact with their neighbours; the auricle is subdivided and
// stays on the original BodyParts3D surface. Measured on the packaged meshes (not copied from the build). Prints counts only.
import fs from 'node:fs';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
import {principalAxes} from './lib/ear-geometry.mjs';
import {radiusStats, connectivity, surfaceDistance} from './lib/ear-tube.mjs';
const dir = process.env.EAR_DIR ? new URL('file://' + process.env.EAR_DIR) : new URL('../public/models/ear/', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL('ear-atlas.json', dir))), bin = gunzipSync(fs.readFileSync(new URL('ear-atlas.bin.gz', dir)));
const problems = [], fail = m => problems.push(m);
const mesh = id => { // millimetres
  const p = manifest.parts.find(x => x.id === id); if (!p) { fail(`${id}: not packaged`); return null; }
  const positions = Float32Array.from(new Float32Array(bin.buffer.slice(bin.byteOffset + p.positions, bin.byteOffset + p.positions + p.vertexCount * 12)), v => v * 1000);
  return {positions, indices: new Uint32Array(bin.buffer.slice(bin.byteOffset + p.indices, bin.byteOffset + p.indices + p.indexCount * 4)), n: p.vertexCount};
};
const extent = (...ms) => { const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity]; for (const m of ms) for (let i = 0; i < m.positions.length; i++) { lo[i % 3] = Math.min(lo[i % 3], m.positions[i]); hi[i % 3] = Math.max(hi[i % 3], m.positions[i]); } return hi.map((h, i) => h - lo[i]); };

// ---- continuity: every tube and nerve is one closed piece (no loose fragments, no open seams)
for (const id of ['pharyngotympanic-tube', 'external-acoustic-meatus', 'facial-nerve', 'cochlear-nerve', 'chorda-tympani']) {
  const m = mesh(id); if (!m) continue;
  const c = connectivity(m.n, m.indices);
  if (c.pieces !== 1) fail(`${id}: ${c.pieces} separate pieces`);
  if (c.boundaryEdges || c.nonManifoldEdges) fail(`${id}: open or non-manifold edges (${c.boundaryEdges}/${c.nonManifoldEdges})`);
}

// ---- pharyngotympanic tube: radius along its axis
const tube = mesh('pharyngotympanic-tube'), tympani = mesh('scala-tympani'), vestibuli = mesh('scala-vestibuli');
if (tube && tympani && vestibuli) {
  // the cochlea: half of its largest extent is the outer radius of the basal turn
  const cochlea = extent(tympani, vestibuli), basalRadius = Math.max(...cochlea) / 2;
  const ax = principalAxes(tube.positions), dir3 = ax.vecs[2], sign = dir3[2] < 0 ? -1 : 1; // longest axis, pointing forward (towards the pharynx)
  const t = [], r = [];
  for (let i = 0; i < tube.n; i++) { const d = [0, 1, 2].map(k => tube.positions[i * 3 + k] - ax.c[k]); t.push(sign * (d[0] * dir3[0] + d[1] * dir3[1] + d[2] * dir3[2])); }
  const t0 = Math.min(...t), t1 = Math.max(...t), BINS = 24, sum = Array.from({length: BINS}, () => [0, 0, 0, 0]);
  const bin = i => Math.min(BINS - 1, Math.floor((t[i] - t0) / (t1 - t0) * BINS));
  for (let i = 0; i < tube.n; i++) { const b = sum[bin(i)]; b[3]++; for (let k = 0; k < 3; k++) b[k] += tube.positions[i * 3 + k]; }
  const centres = sum.map(b => b.slice(0, 3).map(v => v / b[3]));
  const maxR = Array(BINS).fill(0), meanR = Array(BINS).fill(0), cnt = Array(BINS).fill(0);
  for (let i = 0; i < tube.n; i++) { const b = bin(i), rr = Math.hypot(...[0, 1, 2].map(k => tube.positions[i * 3 + k] - centres[b][k])); maxR[b] = Math.max(maxR[b], rr); meanR[b] += rr; cnt[b]++; }
  for (let b = 0; b < BINS; b++) meanR[b] /= cnt[b];
  const maxRadius = Math.max(...maxR);
  if (!(maxRadius < basalRadius)) fail(`the tube (max radius ${maxRadius.toFixed(2)} mm) is not thinner than the cochlear basal turn (radius ${basalRadius.toFixed(2)} mm)`);
  if (!(maxRadius < basalRadius * .75)) fail(`the tube max radius ${maxRadius.toFixed(2)} mm is over three quarters of the cochlear basal radius ${basalRadius.toFixed(2)} mm`);
  const inner = meanR.slice(1, BINS - 1), isthmusBin = 1 + inner.indexOf(Math.min(...inner)), at = isthmusBin / BINS;
  if (!(at > .2 && at < .5)) fail(`the narrowest part of the tube lies at ${(at * 100).toFixed(0)} % of its length, not in the first half (isthmus)`);
  if (!(meanR[BINS - 1] > meanR[isthmusBin] * 1.6)) fail('the pharyngeal opening is not clearly wider than the isthmus');
  if (!(meanR[2] > meanR[isthmusBin] * 1.2)) fail('the tympanic end is not wider than the isthmus');
  for (let b = isthmusBin + 1; b < BINS; b++) if (meanR[b] < meanR[b - 1] - .06) fail(`the cartilaginous part narrows again at bin ${b}`);
  for (let b = 1; b <= isthmusBin; b++) if (meanR[b] > meanR[b - 1] + .06) fail(`the bony part widens again at bin ${b}`);
  var tubeReport = {maxRadius, basalRadius, isthmusRadius: meanR[isthmusBin], endRadius: meanR[BINS - 1]};
}

// ---- nerves: calibre (local radius of the wall) and contact
const caps = {'facial-nerve': [.55, .75], 'cochlear-nerve': [.85, 1.25]}; // [median, 95th percentile] upper limits, mm
const nerveReport = {};
for (const [id, [med, p95]] of Object.entries(caps)) {
  const m = mesh(id); if (!m) continue;
  const s = radiusStats(m.positions, m.indices, 6); nerveReport[id] = s;
  if (!(s.measured > .9)) fail(`${id}: calibre could not be measured on ${(s.measured * 100).toFixed(0)} % of the wall`);
  if (!(s.median <= med)) fail(`${id}: median radius ${s.median.toFixed(2)} mm over ${med} mm`);
  if (!(s.p95 <= p95)) fail(`${id}: 95th percentile radius ${s.p95.toFixed(2)} mm over ${p95} mm`);
  if (!(s.median > .25)) fail(`${id}: median radius ${s.median.toFixed(2)} mm is implausibly thin`);
}
{ // the cochlear nerve still reaches the cochlea, the facial nerve still lies against the bony labyrinth
  const near = (a, b) => { let best = Infinity; for (let i = 0; i < a.positions.length; i += 3) for (let j = 0; j < b.positions.length; j += 3) { const d = Math.hypot(a.positions[i] - b.positions[j], a.positions[i + 1] - b.positions[j + 1], a.positions[i + 2] - b.positions[j + 2]); if (d < best) best = d; } return best; };
  const cn = mesh('cochlear-nerve'), vb = mesh('vestibule'), fn = mesh('facial-nerve');
  if (cn && tympani && !(Math.min(near(cn, tympani), vb ? near(cn, vb) : 9) < .2)) fail('the cochlear nerve no longer touches the cochlea');
  if (fn && vb && !(near(fn, vb) < .8)) fail('the facial nerve lies away from the bony labyrinth');
}

// ---- auricle: subdivided, the same number of pieces as the source, within a small distance of the original surface
const aur = mesh('auricle');
if (aur) {
  const fit = manifest.refinement?.auricle;
  if (!(aur.n >= 5000)) fail(`the auricle has ${aur.n} vertices (source 415)`);
  const c = connectivity(aur.n, aur.indices); if (c.pieces !== fit?.sourcePieces || c.nonManifoldEdges) fail(`the auricle has ${c.pieces} pieces (source ${fit?.sourcePieces}) and ${c.nonManifoldEdges} non-manifold edges`);
  if (!fit || fit.sourceVertices !== 415) fail('the package does not record the 415-vertex source');
  else for (const key of ['toOriginalMm', 'fromOriginalMm']) { if (!(fit[key].max <= 1) || !(fit[key].mean <= .3)) fail(`auricle ${key}: max ${fit[key].max} / mean ${fit[key].mean} mm over the limits (1 / 0.3)`); }
  // recompute against the packaged body atlas (right half of the source mesh) when it is present
  const atlasFile = new URL('../public/models/atlas.json', import.meta.url);
  if (fs.existsSync(atlasFile)) {
    const atlas = JSON.parse(fs.readFileSync(atlasFile)), p = atlas.parts.find(x => x.id === 'FJ2811'), chunk = path.join(path.dirname(atlasFile.pathname), atlas.chunks[p.chunk].url.split('/').pop());
    if (fs.existsSync(chunk)) {
      const b = fs.readFileSync(chunk), pos = new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12)), idx = new Uint32Array(b.buffer.slice(b.byteOffset + p.indices, b.byteOffset + p.indices + p.indexCount * 4));
      const keep = []; for (let q = 0; q < idx.length; q += 3) if ((pos[idx[q] * 3] + pos[idx[q + 1] * 3] + pos[idx[q + 2] * 3]) / 3 < 0) keep.push(idx[q], idx[q + 1], idx[q + 2]);
      const map = new Map(), sp = [], si = []; for (const v of keep) { let n = map.get(v); if (n === undefined) { n = sp.length / 3; map.set(v, n); sp.push(pos[v * 3] * 1000, pos[v * 3 + 1] * 1000, pos[v * 3 + 2] * 1000); } si.push(n); }
      if (sp.length / 3 !== 415) fail(`the source auricle has ${sp.length / 3} vertices, expected 415`);
      if (connectivity(sp.length / 3, Uint32Array.from(si)).pieces !== c.pieces) fail('the auricle has a different number of pieces than the source');
      const d = surfaceDistance(aur.positions, Float32Array.from(sp), Uint32Array.from(si));
      if (!(d.max <= 1 && d.mean <= .3)) fail(`auricle to the BodyParts3D source: max ${d.max.toFixed(2)} / mean ${d.mean.toFixed(2)} mm over the limits (1 / 0.3)`);
    }
  }
}
if (problems.length) { console.error('Ear refinement test FAILED:\n - ' + problems.join('\n - ')); process.exit(1); }
console.log(`Ear refinement passed: tube max radius ${tubeReport.maxRadius.toFixed(2)} mm < cochlear basal radius ${tubeReport.basalRadius.toFixed(2)} mm, isthmus narrowest (${tubeReport.isthmusRadius.toFixed(2)} mm), facial nerve median radius ${nerveReport['facial-nerve'].median.toFixed(2)} mm, cochlear nerve ${nerveReport['cochlear-nerve'].median.toFixed(2)} mm, auricle ${aur.n} vertices.`);
