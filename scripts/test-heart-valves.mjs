// Heart detail: valve apparatus and piece audit, on the real packaged geometry.
//  - cusp counts (tricuspid 3, bicuspid 2, aortic 3, pulmonary 3) and papillary muscle counts (left 2, right 3);
//  - the atrioventricular cusps hang from the whole annulus (every point of the boundary ring shared by atrium and ventricle lies on a cusp);
//  - the semilunar cusps are centred on their valve ring; every papillary muscle is rooted in the wall of its ventricle and ends inside the cavity;
//  - the chordae tendineae form branching trees that join a papillary muscle (or the wall) to a cusp, with cords of different thickness;
//  - piece audit: no structure holds a cut-off sliver (fewer than 12 triangles), and every separate piece of a coronary artery or cardiac vein lies on the heart surface
//    (so no fragment of one structure sits somewhere else, e.g. beside the pulmonary trunk).
// Prints counts only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {boundaryLoops, annulusFrame} from './lib/heart-valves.mjs';
import {meshOf, closest} from './lib/heart-geom.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const heart = JSON.parse(gunzipSync(fs.readFileSync(root + 'public/models/heart/heart-detail.json.gz')));
const raws = heart.chunks.map(c => fs.readFileSync(root + 'public' + c.url));
const part = name => { const p = heart.parts.find(q => q.name === name); assert.ok(p, `${name} is in the heart package`); return p; };
const geom = name => {
  const p = part(name), r = raws[p.chunk];
  return {positions: new Float32Array(r.buffer.slice(r.byteOffset + p.positions, r.byteOffset + p.positions + p.vertexCount * 12)), indices: new Uint32Array(r.buffer.slice(r.byteOffset + p.indices, r.byteOffset + p.indices + p.indexCount * 4))};
};
const points = g => { const out = []; for (let i = 0; i < g.positions.length; i += 3) out.push([g.positions[i], g.positions[i + 1], g.positions[i + 2]]); return out; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const centroid = pts => [0, 1, 2].map(k => pts.reduce((s, p) => s + p[k], 0) / pts.length);
/** Spatial hash for nearest-vertex distance. */
const hashOf = (pts, cell = .004) => { const h = new Map(); for (const p of pts) { const k = `${Math.floor(p[0] / cell)},${Math.floor(p[1] / cell)},${Math.floor(p[2] / cell)}`; (h.get(k) ?? h.set(k, []).get(k)).push(p); } return {h, cell}; };
const nearest = ({h, cell}, p, reach = 3) => {
  let best = Infinity; const cx = Math.floor(p[0] / cell), cy = Math.floor(p[1] / cell), cz = Math.floor(p[2] / cell);
  for (let a = -reach; a <= reach; a++) for (let b = -reach; b <= reach; b++) for (let c = -reach; c <= reach; c++) { const l = h.get(`${cx + a},${cy + b},${cz + c}`); if (l) for (const q of l) { const d = dist(p, q); if (d < best) best = d; } }
  return best;
};
const components = ({positions, indices}) => {
  const n = positions.length / 3, parent = new Int32Array(n).map((_, i) => i), find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  for (let i = 0; i < indices.length; i += 3) { const a = find(indices[i]); parent[find(indices[i + 1])] = a; parent[find(indices[i + 2])] = a; }
  const tris = new Map(), verts = new Map();
  for (let i = 0; i < indices.length; i += 3) { const r = find(indices[i]); tris.set(r, (tris.get(r) ?? 0) + 1); }
  for (const v of new Set(indices)) { const r = find(v); (verts.get(r) ?? verts.set(r, []).get(r)).push([positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]]); }
  return [...tris.entries()].map(([r, t]) => ({triangles: t, verts: verts.get(r)}));
};

// 1. counts
const names = group => heart.parts.filter(p => p.group === group).map(p => p.name);
const cusps = (re) => heart.parts.filter(p => p.group === 'valves' && re.test(p.name) && !/^Chordae/.test(p.name));
assert.equal(cusps(/tricuspid valve/).length, 3, 'tricuspid valve has 3 cusps');
assert.equal(cusps(/bicuspid valve/).length, 2, 'bicuspid valve has 2 cusps');
assert.equal(cusps(/aortic valve/).length, 3, 'aortic valve has 3 cusps');
assert.equal(cusps(/pulmonary valve/).length, 3, 'pulmonary valve has 3 cusps');
assert.equal(names('papillary').filter(n => /left ventricle/.test(n)).length, 2, 'left ventricle has 2 papillary muscles');
assert.equal(names('papillary').filter(n => /right ventricle/.test(n)).length, 3, 'right ventricle has 3 papillary muscles');
assert.ok(!heart.parts.some(p => /mitral/i.test(p.name)), 'no part is named after the mitral valve (Bicuspid valve is the name)');

// 2. atrioventricular annulus: ring = boundary loop shared by the atrial and ventricular shell
const ringOf = (atrium, ventricle) => {
  const aC = boundaryLoops(geom(atrium)).map(l => centroid(l));
  let ring = null, best = Infinity;
  for (const loop of boundaryLoops(geom(ventricle))) { const c = centroid(loop); for (const a of aC) { const d = dist(c, a); if (d < best && loop.length > 30 && loop.length < 120) { best = d; ring = loop; } } }
  assert.ok(ring && best < .004, `annulus between ${atrium} and ${ventricle}`);
  return ring;
};
const report = [];
for (const [atrium, ventricle, re, label] of [['Left atrium', 'Left ventricle', /bicuspid valve/, 'bicuspid'], ['Right atrium', 'Right ventricle', /tricuspid valve/, 'tricuspid']]) {
  const ring = ringOf(atrium, ventricle), valveVerts = hashOf(cusps(re).flatMap(p => points(geom(p.name))), .002);
  let worst = 0; for (const p of ring) worst = Math.max(worst, nearest(valveVerts, p, 2));
  assert.ok(worst < .0006, `${label} valve: every point of the annulus ring lies on a cusp (worst gap ${(worst * 1000).toFixed(2)} mm)`);
  report.push(`${label} annulus ${ring.length} points, worst gap ${(worst * 1000).toFixed(2)} mm`);
}
// 3. semilunar cusps centred on their ring (in the ring plane)
for (const [chamber, hint, re, label, limit] of [['Left ventricle', [.012, 1.316, .024], /aortic valve/, 'aortic', .0015], ['Pulmonary trunk', [.029, 1.328, .048], /pulmonary valve/, 'pulmonary', .002]]) {
  const loops = boundaryLoops(geom(chamber)).filter(l => l.length > 12 && l.length < 120).sort((a, b) => dist(centroid(a), hint) - dist(centroid(b), hint)), ring = loops[0];
  assert.ok(ring && dist(centroid(ring), hint) < .012, `${label} ring found`);
  const pts = cusps(re).flatMap(p => points(geom(p.name))), frame = annulusFrame(ring, centroid(pts)), off = centroid(pts).map((v, k) => v - frame.c[k]);
  const along = off[0] * frame.n[0] + off[1] * frame.n[1] + off[2] * frame.n[2], inPlane = Math.hypot(off[0] - frame.n[0] * along, off[1] - frame.n[1] * along, off[2] - frame.n[2] * along);
  assert.ok(inPlane < limit, `${label} cusps are centred on the valve ring (off by ${(inPlane * 1000).toFixed(1)} mm)`);
  report.push(`${label} cusps ${(inPlane * 1000).toFixed(1)} mm off ring centre`);
}
// 4. papillary muscles: rooted in the wall, tip inside the cavity
const wallOf = {'left ventricle': 'Left ventricle', 'right ventricle': 'Right ventricle'};
for (const p of heart.parts.filter(q => q.group === 'papillary')) {
  const wg = geom(wallOf[/left ventricle/.test(p.name) ? 'left ventricle' : 'right ventricle']), wall = meshOf(wg.positions, wg.indices), pts = points(geom(p.name));
  const d = pts.map(q => closest(wall, q).d), root = Math.min(...d), tip = Math.max(...d);
  assert.ok(root < .0008, `${p.name}: rooted in the ventricular wall (${(root * 1000).toFixed(2)} mm)`);
  assert.ok(tip > .003 && tip < .035, `${p.name}: a column of ${(tip * 1000).toFixed(0)} mm that ends inside the cavity`);
  assert.equal(components(geom(p.name)).length, 1, `${p.name} is one piece`);
}
// 5. chordae tendineae: trees that join a papillary muscle or the wall to a cusp; cords differ in thickness
for (const [chordae, re, ventricle, label] of [['Chordae tendineae of bicuspid valve', /bicuspid valve/, 'Left ventricle', 'bicuspid'], ['Chordae tendineae of tricuspid valve', /tricuspid valve/, 'Right ventricle', 'tricuspid']]) {
  const g = geom(chordae), comps = components(g);
  const cuspHash = hashOf(cusps(re).flatMap(p => points(geom(p.name))), .002), muscles = hashOf(heart.parts.filter(p => p.group === 'papillary' && p.name.includes(ventricle.toLowerCase().replace('ventricle', 'ventricle'))).flatMap(p => points(geom(p.name))), .002), wall = meshOf(geom(ventricle).positions, geom(ventricle).indices);
  // join cords that touch (branch points) into trees
  const parent = comps.map((_, i) => i), find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const hashes = comps.map(c => hashOf(c.verts, .002));
  for (let i = 0; i < comps.length; i++) for (let j = i + 1; j < comps.length; j++) { let touch = false; for (let k = 0; k < comps[i].verts.length && !touch; k += 3) touch = nearest(hashes[j], comps[i].verts[k], 1) < .0016; if (touch) parent[find(i)] = find(j); }
  const trees = new Map(); comps.forEach((c, i) => (trees.get(find(i)) ?? trees.set(find(i), []).get(find(i))).push(c));
  let cuspTouch = 0, rooted = 0;
  for (const t of trees.values()) {
    const verts = t.flatMap(c => c.verts), toCusp = Math.min(...verts.filter((_, k) => k % 2 === 0).map(v => nearest(cuspHash, v, 1))), toRoot = Math.min(...verts.filter((_, k) => k % 2 === 0).map(v => Math.min(nearest(muscles, v, 1), closest(wall, v).d)));
    assert.ok(toCusp < .0009, `${label}: every chordae tree reaches a cusp (${(toCusp * 1000).toFixed(2)} mm)`);
    assert.ok(toRoot < .0016, `${label}: every chordae tree starts on a papillary muscle or the wall (${(toRoot * 1000).toFixed(2)} mm)`);
    cuspTouch++; rooted++;
  }
  // thickness: cord cross-section radius is read from each piece's shortest bounding extent
  const widths = comps.map(c => { const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (const v of c.verts) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], v[k]); hi[k] = Math.max(hi[k], v[k]); } return Math.min(...hi.map((h, k) => h - lo[k])); });
  assert.ok(comps.length >= 14 && new Set(widths.map(w => Math.round(w * 4e4))).size >= 3, `${label}: at least 14 cords`);
  report.push(`${label} chordae ${comps.length} cords in ${trees.size} trees`);
  void cuspTouch; void rooted;
}
// 6. piece audit
const surface = hashOf(['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle', 'Right auricle', 'Left auricle'].flatMap(n => points(geom(n))), .004);
let audited = 0, pieces = 0;
for (const p of heart.parts) {
  const g = geom(p.name), comps = components(g); audited++; pieces += comps.length;
  for (const c of comps) assert.ok(c.triangles >= 12, `${p.name}: no cut-off sliver (a piece of ${c.triangles} triangles)`);
  if (p.group === 'coronary' || p.group === 'veins') for (const c of comps) {
    const d = Math.min(...c.verts.filter((_, k) => k % Math.max(1, Math.floor(c.verts.length / 60)) === 0).map(v => nearest(surface, v, 3)));
    assert.ok(d < .004, `${p.name}: every piece lies on the heart surface (a piece of ${c.triangles} triangles is ${(d * 1000).toFixed(1)} mm away)`);
  }
}
console.log(`PASS heart valves: cusps 3/2/3/3, papillary muscles 2+3, ${report.join('; ')}; piece audit ${audited} structures, ${pieces} pieces, no slivers, vessel pieces all on the heart surface.`);
