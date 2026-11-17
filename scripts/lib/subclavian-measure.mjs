// Read-only helpers for the subclavian artery work (HN-23): the viewer's meshes (atlas parts and nerve stream) as arrays of [x, y, z] in millimetres,
// y up, x positive = Left, z positive = anterior.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './full-atlas.mjs';
const root = new URL('../../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
let full = null, nerves = null;
const atlasOnce = () => (full ||= loadFullAtlas());
/** Atlas part by id -> {pos (Float32Array, metres), idx, verts ([x,y,z] mm)}. */
export function part(id) {
  const {atlas, geometry} = atlasOnce(), p = atlas.parts.find(q => q.id === id); if (!p) throw new Error('no part ' + id);
  const g = geometry(p), v = []; for (let i = 0; i < g.positions.length; i += 3) v.push([g.positions[i] * 1e3, g.positions[i + 1] * 1e3, g.positions[i + 2] * 1e3]);
  return {id, name: p.name, pos: g.positions, idx: g.indices, verts: v};
}
/** Nerve mesh by exact name from the nerve stream. */
export function nerve(name) {
  if (!nerves) { nerves = new Map(); for (const c of JSON.parse(fs.readFileSync(file('public/models/nerve-stream.json'))).chunks) { const b = zlib.gunzipSync(fs.readFileSync(file('public' + c.url))); for (const m of c.meshes) nerves.set(m.name, {b, m}); } }
  const e = nerves.get(name); if (!e) throw new Error('no nerve ' + name);
  const pos = new Float32Array(e.b.buffer.slice(e.b.byteOffset + e.m.positions, e.b.byteOffset + e.m.positions + e.m.vertexCount * 12)), idx = new Uint32Array(e.b.buffer.slice(e.b.byteOffset + e.m.indices, e.b.byteOffset + e.m.indices + e.m.indexCount * 4)), v = [];
  for (let i = 0; i < pos.length; i += 3) v.push([pos[i] * 1e3, pos[i + 1] * 1e3, pos[i + 2] * 1e3]);
  return {id: name, name, pos, idx, verts: v};
}
export const SIDES = [
  {side: 'Left', sign: 1, artery: 'FJ3479', vein: 'FJ3486', scaA: 'FJ1570', scaM: 'FJ1571', rib: 'FJ3228', vert: 'FJ1725M', thyro: 'FJ2255', costo: 'FJ2224', axA: 'FJ2216', bct: null, plexus: ['Roots of brachial plexus.l.001', 'Superior trunk of brachial plexus.l.001', 'Middle trunk of brachial plexus.l.001', 'Inferior trunk of brachial plexus.l.001'], cupula: 'SERO-8', lung: 'BP3S-FMA7370'},
  {side: 'Right', sign: -1, artery: 'FJ3579', vein: 'FJ3587', scaA: 'FJ1592', scaM: 'FJ1593', rib: 'FJ3334', vert: 'FJ1725', thyro: 'FJ2307', costo: 'FJ2276', axA: 'FJ2268', bct: 'FJ3417', plexus: ['Roots of brachial plexus.r.001', 'Superior trunk of brachial plexus.r.001', 'Middle trunk of brachial plexus.r.001', 'Inferior trunk of brachial plexus.r.001'], cupula: 'SERO-4', lung: 'BP3S-FMA7333'},
];
export const bbox = vs => { const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (const v of vs) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], v[k]); hi[k] = Math.max(hi[k], v[k]); } return {lo, hi}; };
/** Minimum distance from point p to the vertices of a mesh (vertex cloud; meshes here have 1 to 3 mm vertex spacing, so this overstates a surface distance by at most that). */
export function nearest(p, vs) { let b = 1e9, bi = -1; for (let i = 0; i < vs.length; i++) { const d = Math.hypot(p[0] - vs[i][0], p[1] - vs[i][1], p[2] - vs[i][2]); if (d < b) { b = d; bi = i; } } return {d: b, i: bi}; }

// ---- surface clearance ----
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** Squared distance from p to triangle abc (Ericson, Real-Time Collision Detection). */
function pointTri2(p, a, b, c) {
  const ab = sub3(b, a), ac = sub3(c, a), ap = sub3(p, a), d1 = dot3(ab, ap), d2 = dot3(ac, ap);
  let q;
  if (d1 <= 0 && d2 <= 0) q = a;
  else {
    const bp = sub3(p, b), d3 = dot3(ab, bp), d4 = dot3(ac, bp);
    if (d3 >= 0 && d4 <= d3) q = b;
    else {
      const vc = d1 * d4 - d3 * d2;
      if (vc <= 0 && d1 >= 0 && d3 <= 0) { const v = d1 / (d1 - d3); q = [a[0] + v * ab[0], a[1] + v * ab[1], a[2] + v * ab[2]]; }
      else {
        const cp = sub3(p, c), d5 = dot3(ab, cp), d6 = dot3(ac, cp);
        if (d6 >= 0 && d5 <= d6) q = c;
        else {
          const vb = d5 * d2 - d1 * d6;
          if (vb <= 0 && d2 >= 0 && d6 <= 0) { const w = d2 / (d2 - d6); q = [a[0] + w * ac[0], a[1] + w * ac[1], a[2] + w * ac[2]]; }
          else {
            const va = d3 * d6 - d5 * d4;
            if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { const w = (d4 - d3) / ((d4 - d3) + (d5 - d6)); q = [b[0] + w * (c[0] - b[0]), b[1] + w * (c[1] - b[1]), b[2] + w * (c[2] - b[2])]; }
            else { const den = 1 / (va + vb + vc), v = vb * den, w = vc * den; q = [a[0] + ab[0] * v + ac[0] * w, a[1] + ab[1] * v + ac[1] * w, a[2] + ab[2] * v + ac[2] * w]; }
          }
        }
      }
    }
  }
  const d = sub3(p, q); return dot3(d, d);
}
/** Triangle list of a mesh with per-triangle boxes. */
export function tris(m) {
  const t = [], v = m.verts; for (let i = 0; i < m.idx.length; i += 3) { const a = v[m.idx[i]], b = v[m.idx[i + 1]], c = v[m.idx[i + 2]]; t.push({a, b, c, lo: [Math.min(a[0], b[0], c[0]), Math.min(a[1], b[1], c[1]), Math.min(a[2], b[2], c[2])], hi: [Math.max(a[0], b[0], c[0]), Math.max(a[1], b[1], c[1]), Math.max(a[2], b[2], c[2])]}); }
  return t;
}
/** Distance (mm) from p to a triangle list; `limit` skips triangles whose box is further than that. */
export function distToTris(p, T, limit = 1e9) {
  let best = limit * limit;
  for (const t of T) {
    if (p[0] < t.lo[0] - limit || p[0] > t.hi[0] + limit || p[1] < t.lo[1] - limit || p[1] > t.hi[1] + limit || p[2] < t.lo[2] - limit || p[2] > t.hi[2] + limit) continue;
    const d = pointTri2(p, t.a, t.b, t.c); if (d < best) best = d;
  }
  return Math.sqrt(best);
}
/** Ray / triangle crossing count (Moller-Trumbore, +direction `dir`), for a parity inside test. */
function crossings(p, dir, T) {
  let n = 0;
  for (const t of T) {
    const e1 = sub3(t.b, t.a), e2 = sub3(t.c, t.a), h = [dir[1] * e2[2] - dir[2] * e2[1], dir[2] * e2[0] - dir[0] * e2[2], dir[0] * e2[1] - dir[1] * e2[0]], a = dot3(e1, h);
    if (Math.abs(a) < 1e-12) continue;
    const f = 1 / a, s = sub3(p, t.a), u = f * dot3(s, h); if (u < 0 || u > 1) continue;
    const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]], v = f * dot3(dir, q); if (v < 0 || u + v > 1) continue;
    if (f * dot3(e2, q) > 1e-9) n++;
  }
  return n;
}
const DIRS = [[0.577, 0.5773, 0.5779], [-0.4, 0.7, -0.59], [0.1, -0.8, 0.59]];
/** Inside a closed mesh: majority parity over three directions. */
export function inside(p, T) { let v = 0; for (const d of DIRS) if (crossings(p, d, T) % 2) v++; return v >= 2; }
/**
 * Wall clearance of mesh A against mesh B in mm: the smallest distance between the two surfaces (vertices of each against the triangles of the other), negative when a vertex of A lies inside B
 * (the depth of the deepest vertex) or of B inside A. `tb`/`ta` are cached triangle lists. The vertex-to-triangle distance is exact for a vertex; between two vertices
 * the surfaces can be a little closer (by at most a fraction of the 1 to 3 mm vertex spacing), so a value of 0.5 mm or more is a safe "no contact".
 */
export function clearance(A, B, {ta = tris(A), tb = tris(B), insideTest = true, limit = 30} = {}) {
  let d = 1e9, deepest = 0;
  const run = (X, TY, TX, flip) => {
    for (const p of X.verts) {
      const q = distToTris(p, TY, Math.min(limit, d + 1e-9 > 0 ? Math.max(limit, 1) : limit));
      if (q < d) d = q;
    }
  };
  run(A, tb); run(B, ta);
  if (insideTest) {
    const ins = (X, TY, Yb) => { let m = 0; for (const p of X.verts) { if (p[0] < Yb.lo[0] || p[0] > Yb.hi[0] || p[1] < Yb.lo[1] || p[1] > Yb.hi[1] || p[2] < Yb.lo[2] || p[2] > Yb.hi[2]) continue; if (inside(p, TY)) m = Math.max(m, distToTris(p, TY, 40)); } return m; };
    deepest = Math.max(ins(A, tb, bbox(B.verts)), ins(B, ta, bbox(A.verts)));
  }
  return deepest > 0 ? -deepest : d;
}
