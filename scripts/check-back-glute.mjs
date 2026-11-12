// Checks of the back and gluteal repairs, on the meshes the viewer loads:
//  1. the repaired muscles (the three parts of trapezius, gluteus maximus; scripts/lib/muscle-reshape.mjs) are single closed pieces without loose fragments, trapezius does not cross the midline and the
//     transverse part ends on the acromion, gluteus maximus leaves the natal cleft open and does not sink into the hip bone or the sacrum;
//  2. the inferior gluteal veins lie deep to gluteus maximus (scripts/patch-gluteal-veins.mjs --check);
//  3. every thoracic dorsal ramus starts at its spinal ganglion (no loose segment beside the vertebra);
//  4. the thoracolumbar fascia is two halves (lumbar and thoracic pieces each), clear of the midline, the scapula and the bones.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {loadWorld} from './lib/paokao-world.mjs';
import {meshOf, closest} from './lib/heart-geom.mjs';
import {positionsOf, indicesOf} from './lib/stream-geometry.mjs';

const root = new URL('../', import.meta.url), problems = [], MM = 1000;
const stream = JSON.parse(fs.readFileSync(new URL('public/models/atlas-stream.json', root))), raw = new Map();
const chunk = i => { if (!raw.has(i)) raw.set(i, fs.readFileSync(new URL('public' + stream.chunks[i].url, root))); return raw.get(i); };
const shown = id => { const p = stream.parts.find(q => q.id === id), b = chunk(p.chunk); return {part: p, positions: positionsOf(b, p), indices: Uint32Array.from(indicesOf(b, p))}; };
/** Sizes of the connected pieces of a mesh, vertices at the same place counted as one (the creased normals split them). */
function pieces(positions, indices) {
  const key = new Map(), id = new Int32Array(positions.length / 3);
  for (let v = 0; v < id.length; v++) { const k = `${Math.round(positions[v * 3] * 1e6)},${Math.round(positions[v * 3 + 1] * 1e6)},${Math.round(positions[v * 3 + 2] * 1e6)}`; if (!key.has(k)) key.set(k, key.size); id[v] = key.get(k); }
  const par = Int32Array.from({length: key.size}, (_, i) => i), find = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  for (let i = 0; i < indices.length; i += 3) { const a = find(id[indices[i]]), b = find(id[indices[i + 1]]), c = find(id[indices[i + 2]]); par[b] = a; par[c] = a; }
  const size = new Map(); for (let v = 0; v < key.size; v++) { const r = find(v); size.set(r, (size.get(r) ?? 0) + 1); }
  return [...size.values()].sort((a, b) => b - a);
}

// 1. the repaired muscles
const MUSCLES = [['FJ1554', 'transverse trapezius', -1], ['FJ1554M', 'transverse trapezius', 1], ['FJ1520', 'ascending trapezius', -1], ['FJ1520M', 'ascending trapezius', 1], ['FJ1521', 'descending trapezius', -1], ['FJ1521M', 'descending trapezius', 1], ['FJ1418', 'gluteus maximus', -1], ['FJ1418M', 'gluteus maximus', 1]];
const atlas = JSON.parse(fs.readFileSync(new URL('public/models/atlas.json', root))), chunks = new Map();
const rawBone = name => { const p = atlas.parts.find(q => q.name === name && !/^HRAF/.test(q.id)), c = p.chunk; if (!chunks.has(c)) chunks.set(c, fs.readFileSync(new URL('public' + atlas.chunks[c].url, root))); const b = chunks.get(c);
  return meshOf(new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12)), new Uint32Array(b.buffer.slice(b.byteOffset + p.indices, b.byteOffset + p.indices + p.indexCount * 4))); };
for (const [id, label, sx] of MUSCLES) {
  const g = shown(id), tag = `${sx < 0 ? 'right' : 'left'} ${label}`;
  if (!g.part.reshaped) { problems.push(`${tag}: the viewer still loads the source mesh (not repaired)`); continue; }
  const sizes = pieces(g.positions, g.indices);
  if (sizes.length !== 1) problems.push(`${tag}: ${sizes.length} separate pieces (${sizes.slice(0, 4).join(', ')} vertices), loose fragments remain`);
  let lat = [Infinity, -Infinity]; for (let v = 0; v < g.positions.length; v += 3) { const l = g.positions[v] * sx; lat = [Math.min(lat[0], l), Math.max(lat[1], l)]; }
  if (/trapezius/.test(label) && lat[0] < .0004) problems.push(`${tag}: crosses the midline by ${((.0004 - lat[0]) * MM).toFixed(1)} mm`);
  if (label === 'transverse trapezius' && lat[1] > .1465) problems.push(`${tag}: ends ${(lat[1] * MM).toFixed(0)} mm from the midline, past the medial part of the acromion (145 mm)`);
  if (label === 'gluteus maximus') {
    if (lat[0] < .017) problems.push(`${tag}: its medial border is only ${(lat[0] * MM).toFixed(1)} mm from the midline, the natal cleft is closed`);
    for (const bone of [sx < 0 ? 'Right hip bone' : 'Left hip bone', 'Sacrum']) {
      const m = rawBone(bone); let deep = 0;
      for (let v = 0; v < g.positions.length; v += 3) { const p = [g.positions[v], g.positions[v + 1], g.positions[v + 2]]; if (p[1] < m.lo[1] - .01 || p[1] > m.hi[1] + .01 || p[0] < m.lo[0] - .01 || p[0] > m.hi[0] + .01) continue; const c = closest(m, p); if (c.d < .0012 && (p[0] - c.point[0]) * c.normal[0] + (p[1] - c.point[1]) * c.normal[1] + (p[2] - c.point[2]) * c.normal[2] < -.0012) deep++; }
      if (deep) problems.push(`${tag}: ${deep} vertices sink more than 1.2 mm into the ${bone}`);
    }
  }
}

// 2. the inferior gluteal veins deep to gluteus maximus
try { execFileSync(process.execPath, [fileURLToPath(new URL('scripts/patch-gluteal-veins.mjs', root)), '--check'], {stdio: 'pipe'}); }
catch (e) { problems.push(`inferior gluteal veins: vertices remain behind the deep surface of gluteus maximus (${String(e.stdout).trim().split('\n').join('; ')})`); }

// 3. dorsal rami start at their ganglia; 4. the fascia is one sheet
const w = loadWorld({paokao: true});
for (const [S, s] of [['Right', 'r'], ['Left', 'l']]) {
  const ram = w.mesh(`${S} dorsal ramus of thoracic spinal nerve`), gang = w.mesh(`Spinal ganglion.${s}`), gv = []; for (let i = 0; i < gang.positions.length; i += 3) gv.push([gang.positions[i], gang.positions[i + 1], gang.positions[i + 2]]);
  const sizes = pieces(ram.positions, ram.indices); if (sizes.length !== 10) problems.push(`${S} dorsal ramus of thoracic spinal nerve: ${sizes.length} pieces instead of 10 (T2–T11)`);
  // a piece's start is the vertex nearest to the ganglia; each piece must reach one within 1.5 mm
  const key = (v) => `${Math.round(ram.positions[v * 3] * 1e6)},${Math.round(ram.positions[v * 3 + 1] * 1e6)},${Math.round(ram.positions[v * 3 + 2] * 1e6)}`;
  const near = new Map(); // piece root -> min distance to a ganglion
  const idx = new Map(), n = ram.positions.length / 3, par = Int32Array.from({length: n}, (_, i) => i), find = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  for (let v = 0; v < n; v++) { const k = key(v); if (idx.has(k)) par[find(v)] = find(idx.get(k)); else idx.set(k, v); }
  for (let i = 0; i < ram.indices.length; i += 3) { const a = find(ram.indices[i]), b = find(ram.indices[i + 1]), c = find(ram.indices[i + 2]); par[b] = a; par[c] = a; }
  for (let v = 0; v < n; v++) { const p = [ram.positions[v * 3], ram.positions[v * 3 + 1], ram.positions[v * 3 + 2]]; let d = 1; for (const q of gv) d = Math.min(d, Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2])); const r = find(v); near.set(r, Math.min(near.get(r) ?? 1, d)); }
  for (const [, d] of near) if (d > .0015) problems.push(`${S} dorsal ramus of thoracic spinal nerve: a piece starts ${(d * MM).toFixed(1)} mm from the nearest spinal ganglion`);
}
{
  // 4. the thoracolumbar fascia (posterior layer) is two halves, each a closed diamond-shaped sheet in a thick lumbar and a thin thoracic piece: the halves stop short of the
  // midline so the spinous processes show, the upper angle stays medial to the scapula, the lumbar part is the widest, and no vertex lies inside a bone (the rays that place
  // the sheet come from behind, so it can only lie behind the surface it covers).
  const parts = w.entries.filter(e => e.name === 'thoracolumbar fascia');
  if (parts.length !== 4) problems.push(`thoracolumbar fascia: ${parts.length} pieces, expected 4 (right and left, lumbar and thoracic)`);
  const bones = ['Fifth thoracic vertebra', 'Sixth thoracic vertebra', 'Seventh thoracic vertebra', 'Eighth thoracic vertebra', 'Ninth thoracic vertebra', 'Tenth thoracic vertebra', 'Eleventh thoracic vertebra', 'Twelfth thoracic vertebra', 'First lumbar vertebra', 'Second lumbar vertebra', 'Third lumbar vertebra', 'Fourth lumbar vertebra', 'Fifth lumbar vertebra', 'Sacrum', 'Right hip bone', 'Left hip bone', 'Right scapula', 'Left scapula', ...['sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'].flatMap(r => [`Right ${r} rib`, `Left ${r} rib`])].filter(w.has).map(n => w.mesh(n));
  let left = 0, right = 0, lumbar = 0, thoracic = 0;
  for (const e of parts) {
    const g = e.load(), sizes = pieces(g.positions, g.indices), total = sizes.reduce((a, b) => a + b, 0);
    if (sizes.length !== 1 || sizes[0] !== total) problems.push(`thoracolumbar fascia piece: ${sizes.length} separate pieces, each piece must be one closed sheet`);
    let lo = [9, 9, 9], hi = [-9, -9, -9]; for (let i = 0; i < g.positions.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], g.positions[i + k]); hi[k] = Math.max(hi[k], g.positions[i + k]); }
    if (lo[0] < -.003 && hi[0] > .003) problems.push('thoracolumbar fascia piece crosses the midline: the two halves must leave the spinous processes uncovered');
    if (lo[0] >= -.003) left++; else right++;
    const width = hi[0] - lo[0];
    if (hi[1] > 1.2) { thoracic++; if (width > .07) problems.push(`thoracolumbar fascia thoracic piece is ${(width * MM).toFixed(0)} mm wide: the upper angle must stay medial to the scapula and the rib angles`); }
    else { lumbar++; if (width < .075) problems.push(`thoracolumbar fascia lumbar piece is only ${(width * MM).toFixed(0)} mm wide: the lumbar part is the widest part`); }
    // inside a bone: nearest bone surface within 6 mm with the vertex behind its outward normal by more than 0.5 mm
    let inside = 0;
    for (let i = 0; i < g.positions.length; i += 3) { const q = [g.positions[i], g.positions[i + 1], g.positions[i + 2]]; for (const m of bones) { if (q[0] < m.lo[0] - .006 || q[0] > m.hi[0] + .006 || q[1] < m.lo[1] - .006 || q[1] > m.hi[1] + .006 || q[2] < m.lo[2] - .006 || q[2] > m.hi[2] + .006) continue; const c = closest(m, q); if (c.d < .006 && (q[0] - c.point[0]) * c.normal[0] + (q[1] - c.point[1]) * c.normal[1] + (q[2] - c.point[2]) * c.normal[2] < -.0005) { inside++; break; } } }
    if (inside) problems.push(`thoracolumbar fascia piece: ${inside} vertices inside a bone`);
  }
  if (parts.length === 4 && (left !== 2 || right !== 2 || lumbar !== 2 || thoracic !== 2)) problems.push(`thoracolumbar fascia: pieces are ${right} right / ${left} left, ${lumbar} lumbar / ${thoracic} thoracic; expected 2 of each`);
}
if (problems.length) { console.error('Back and gluteal check failed:\n - ' + problems.join('\n - ')); process.exit(1); }
console.log('Back and gluteal OK: trapezius and gluteus maximus are single repaired pieces (midline, acromion and natal cleft respected), the inferior gluteal veins lie deep to gluteus maximus, the thoracic dorsal rami start at their spinal ganglia, the thoracolumbar fascia is two diamond-shaped halves (lumbar and thoracic pieces) clear of the midline, the scapula and every bone.');
