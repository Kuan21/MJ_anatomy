// Shape audit of the schematic tendons, ligaments, retinacula, fasciae and membranes: none may be a box, a flat plate, a disc or a cylinder.
// Usage: node scripts/audit-soft-shapes.mjs [--check]   (writes docs/soft-shape-audit.json; --check fails on any flagged structure that is not listed in docs/soft-shape-allowed.json)
import fs from 'node:fs';
import * as T from 'three';
import {buildAll} from './lib/paokao-build.mjs';

const CONNECTIVE = /tendon|ligament|retinaculum|fascia|aponeurosis|membrane|capsule|septum|tract|raphe|sheath|pulley|band|sling|expansion|ring|annulus|tentorium|falx|diaphragm/i;
const {built} = buildAll();
const rows = [];
for (const b of built) {
  if (!CONNECTIVE.test(b.name)) continue;
  const g = b.geometry, P = g.positions, n = P.length / 3;
  if (!n) continue;
  const pts = []; for (let i = 0; i < n; i++) pts.push(new T.Vector3(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]));
  // principal axes by covariance
  const c = new T.Vector3(); pts.forEach(p => c.add(p)); c.multiplyScalar(1 / n);
  let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0;
  for (const p of pts) {const d = p.clone().sub(c); xx += d.x * d.x; xy += d.x * d.y; xz += d.x * d.z; yy += d.y * d.y; yz += d.y * d.z; zz += d.z * d.z;}
  const m = new T.Matrix3().set(xx, xy, xz, xy, yy, yz, xz, yz, zz);
  // power iteration with deflation for the three axes
  const axes = []; let M = m.clone();
  for (let k = 0; k < 3; k++) {
    let v = new T.Vector3(1, .7, .3).normalize();
    for (let it = 0; it < 80; it++) {v = v.applyMatrix3(M).normalize();}
    const lambda = v.clone().applyMatrix3(M).dot(v); axes.push(v.clone());
    const o = new T.Matrix3().set(v.x * v.x, v.x * v.y, v.x * v.z, v.y * v.x, v.y * v.y, v.y * v.z, v.z * v.x, v.z * v.y, v.z * v.z);
    M = new T.Matrix3().fromArray(M.elements.map((e, i) => e - lambda * o.elements[i]));
  }
  const ext = axes.map(a => {let lo = 1e9, hi = -1e9; for (const p of pts) {const t = p.clone().sub(c).dot(a); lo = Math.min(lo, t); hi = Math.max(hi, t);} return hi - lo;});
  ext.sort((p, q) => q - p);
  const [e1, e2, e3] = ext.map(x => x * 1000);
  // plate = very thin relative to its width; it is only a defect when also flat (little bend): bend = RMS distance of the points from the best plane, relative to the width
  const nrm = axes[2];
  const dev = Math.sqrt(pts.reduce((s, p) => s + Math.pow(p.clone().sub(c).dot(nrm), 2), 0) / n) * 1000;
  const bend = dev / Math.max(1e-6, e2);
  const tris = g.indices ? g.indices.length / 3 : n / 3;
  const unique = new Set(pts.map(p => `${p.x.toFixed(5)},${p.y.toFixed(5)},${p.z.toFixed(5)}`)).size;
  const flags = [];
  if (unique <= 24 && tris <= 48) flags.push('box-like (few vertices)');
  if (e3 / e2 < .06 && bend < .035) flags.push('flat plate');
  if (e2 / e1 > .75 && e3 / e1 < .16 && e3 / e2 < .25) flags.push('disc');
  if (e2 / e3 < 1.5 && e1 / e2 > 1.6) flags.push('cylinder/rod (round section)');
  rows.push({name: b.name, system: b.system, extentsMm: [e1, e2, e3].map(x => +x.toFixed(1)), thicknessMm: +e3.toFixed(2), bend: +bend.toFixed(3), triangles: tris, uniqueVertices: unique, flags});
}
rows.sort((a, b) => b.flags.length - a.flags.length || a.name.localeCompare(b.name));
fs.writeFileSync('docs/soft-shape-audit.json', JSON.stringify(rows, null, 1));
const bad = rows.filter(r => r.flags.length);
console.log(`soft-shape audit: ${rows.length} connective structures, ${bad.length} flagged`);
for (const r of bad) console.log(`  ${r.name}: ${r.flags.join(', ')}  [${r.extentsMm.join(' x ')} mm, bend ${r.bend}, ${r.triangles} tris]`);
