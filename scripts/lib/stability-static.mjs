// Static (rest pose) stability checks. Each returns findings {check, id, name, measure, detail}; a smaller measure is better, 0 would be clean.
//   fragments    a piece of a mesh that is a small part of it and lies away from the rest of the same mesh; a whole structure with nothing near it
//   penetration  vessel, nerve or tendon wall inside a bone (depth by the nearest bone face; the bone meshes are coarse, so a tolerance applies)
//   zfight       two different meshes with coincident, parallel faces (the pair draws as noise)
//   cuts         an open boundary of a mesh with a long straight run (a plane or a box cut it open)
import fs from 'node:fs';
import {TriGrid, pieces, boundaryChains, longestStraightRun} from './stability-geom.mjs';
import {SOFT_TUBES, isCentral} from './stability-world.mjs';

const mm = v => +(v * 1000).toFixed(1);
export const THRESHOLDS = {
  fragmentGap: .008,       // a piece this far (m) from the rest of its mesh is a fragment
  fragmentSize: .5,        // ... and not larger than this share of the main piece's diagonal
  floating: .03,           // a whole structure with no other mesh within this distance
  tubeDepth: .002, tendonDepth: .003,    // wall deeper than this (m) into a bone (the bone meshes are coarse: a millimetre or two is not counted)
  zfightGap: .00015, zfightRadius: .006, zfightMin: 40, zfightShare: 25,   // faces within 0.15 mm, at least 40 of them and 25 % of the smaller mesh
  cutRun: .015,            // straight boundary run (m)
};

/** Fragments: pieces of one mesh that float away from it, and whole structures that touch nothing. */
export function fragments(parts, log) {
  const out = [], vertexGrid = new Map(), cell = .02, key = (x, y, z) => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
  const loaded = [];
  for (const p of parts) {
    const g = p.load(); loaded.push(g);
    if (p.system === 'integumentary') continue;
    for (let i = 0; i < g.positions.length; i += 3) { const k = key(g.positions[i], g.positions[i + 1], g.positions[i + 2]); let l = vertexGrid.get(k); if (!l) vertexGrid.set(k, l = []); if (l[l.length - 1] !== p.id) l.push(p.id); }
  }
  parts.forEach((p, n) => {
    const g = loaded[n]; if (!g.indices.length) return;
    const pc = pieces(g.positions, g.indices);
    if (pc.pieces.length > 1) {
      const main = pc.pieces[0];
      if (pc.pieces.filter(q => q.tris.length >= main.tris.length * .25).length >= 4) return;   // made of several similar parts by design (intercostal spaces, ciliary processes)
      const grid = new TriGrid(.01);
      pc.pieces.forEach((q, rank) => { const idx = new Uint32Array(q.tris.length * 3); q.tris.forEach((t, i) => { idx[i * 3] = g.indices[t * 3]; idx[i * 3 + 1] = g.indices[t * 3 + 1]; idx[i * 3 + 2] = g.indices[t * 3 + 2]; }); grid.add(rank, g.positions, idx); });
      let far = 0, worst = 0, tris = 0;
      pc.pieces.forEach((q, rank) => {
        if (rank === 0 || q.diag > main.diag * THRESHOLDS.fragmentSize) return;
        let d = Infinity;   // distance to the nearest other piece of the same mesh (a chain of pieces that touch each other is one structure)
        const step = Math.max(1, Math.floor(q.tris.length / 12));
        for (let i = 0; i < q.tris.length; i += step) { const v = g.indices[q.tris[i] * 3] * 3, h = grid.nearest(g.positions[v], g.positions[v + 1], g.positions[v + 2], THRESHOLDS.fragmentGap * 2.5, o => o === rank); d = Math.min(d, h ? h.d : THRESHOLDS.fragmentGap * 2.5); if (d < THRESHOLDS.fragmentGap) break; }
        if (d >= THRESHOLDS.fragmentGap) { far++; worst = Math.max(worst, d); tris += q.tris.length; }
      });
      if (far) out.push({check: 'fragments', id: p.id, name: p.name, measure: far, detail: `${far} detached piece(s), ${tris} triangles, up to ${mm(worst)}+ mm from the rest`});
    }
  });
  // whole structures with nothing else around them
  parts.forEach((p, n) => {
    if (p.system === 'integumentary' || isCentral(p)) return;
    const g = loaded[n]; if (!g.positions.length) return;
    let near = false;
    const step = Math.max(3, Math.floor(g.positions.length / 3 / 40) * 3);
    for (let i = 0; i < g.positions.length && !near; i += step) {
      const x = g.positions[i], y = g.positions[i + 1], z = g.positions[i + 2], cx = Math.floor(x / cell), cy = Math.floor(y / cell), cz = Math.floor(z / cell);
      for (let a = -1; a <= 1 && !near; a++) for (let b = -1; b <= 1 && !near; b++) for (let c = -1; c <= 1 && !near; c++) { const l = vertexGrid.get(`${cx + a},${cy + b},${cz + c}`); if (l && l.some(id => id !== p.id)) near = true; }
    }
    if (!near) out.push({check: 'fragments', id: p.id, name: p.name, measure: 1, detail: 'no other structure within 2-4 cm (floating)'});
  });
  log?.(`fragments: ${out.length}`);
  return out;
}

/** Vessel, nerve and tendon walls inside a bone. */
export function penetration(parts, log) {
  const bones = parts.filter(p => p.system === 'skeletal'), grid = new TriGrid(.008), names = new Map(bones.map(b => [b.id, b.name]));
  for (const b of bones) { const g = b.load(); grid.add(b.id, g.positions, g.indices); }
  const out = [];
  for (const p of parts) {
    if (!SOFT_TUBES(p)) continue;
    const g = p.load(), tol = p.system === 'tendon' ? THRESHOLDS.tendonDepth : THRESHOLDS.tubeDepth, per = new Map();
    for (let i = 0; i < g.positions.length; i += 3) {
      const x = g.positions[i], y = g.positions[i + 1], z = g.positions[i + 2], h = grid.nearest(x, y, z, tol * 4);
      if (!h || h.d <= tol) continue;
      if ((x - h.qx) * h.nx + (y - h.qy) * h.ny + (z - h.qz) * h.nz >= 0) continue;   // outside the bone face
      const e = per.get(h.owner) || {n: 0, depth: 0}; e.n++; e.depth = Math.max(e.depth, h.d); per.set(h.owner, e);
    }
    for (const [bone, e] of per) if (e.n >= 3) out.push({check: 'penetration', id: p.id, name: p.name, sub: bone, measure: mm(e.depth), detail: `wall ${mm(e.depth)} mm deep into ${names.get(bone)} (${e.n} vertices)`});
  }
  log?.(`penetration: ${out.length}`);
  return out;
}

/** Coincident parallel faces of two different meshes. Triangle centroids are compared: same plane within zfightGap, normals parallel, centroids close in the plane. */
export function zfight(parts, log) {
  const {zfightGap: gap, zfightRadius: radius, zfightMin: minCount} = THRESHOLDS, cell = radius;
  // centroid grid
  let total = 0; const loaded = parts.map(p => { const g = p.load(); total += g.indices.length / 3; return g; });
  const cx = new Float32Array(total * 3), nx = new Float32Array(total * 3), own = new Int32Array(total), cells = new Map();
  let t = 0;
  loaded.forEach((g, pi) => {
    for (let i = 0; i < g.indices.length; i += 3) {
      const a = g.indices[i] * 3, b = g.indices[i + 1] * 3, c = g.indices[i + 2] * 3, P = g.positions;
      const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
      let x = uy * vz - uz * vy, y = uz * vx - ux * vz, z = ux * vy - uy * vx; const l = Math.hypot(x, y, z); if (l < 1e-12) { own[t] = -1; t++; continue; }
      cx[t * 3] = (P[a] + P[b] + P[c]) / 3; cx[t * 3 + 1] = (P[a + 1] + P[b + 1] + P[c + 1]) / 3; cx[t * 3 + 2] = (P[a + 2] + P[b + 2] + P[c + 2]) / 3;
      nx[t * 3] = x / l; nx[t * 3 + 1] = y / l; nx[t * 3 + 2] = z / l; own[t] = pi;
      const k = `${Math.floor(cx[t * 3] / cell)},${Math.floor(cx[t * 3 + 1] / cell)},${Math.floor(cx[t * 3 + 2] / cell)}`; let l2 = cells.get(k); if (!l2) cells.set(k, l2 = []); l2.push(t); t++;
    }
  });
  const pair = new Map();
  for (let i = 0; i < total; i++) {
    const a = own[i]; if (a < 0) continue;
    const x = cx[i * 3], y = cx[i * 3 + 1], z = cx[i * 3 + 2], gx = Math.floor(x / cell), gy = Math.floor(y / cell), gz = Math.floor(z / cell), seen = new Set();
    for (let u = -1; u <= 1; u++) for (let v = -1; v <= 1; v++) for (let w = -1; w <= 1; w++) {
      const l = cells.get(`${gx + u},${gy + v},${gz + w}`); if (!l) continue;
      for (const j of l) {
        const b = own[j]; if (b <= a || seen.has(b)) continue;   // each unordered pair once, from the lower index
        const dx = cx[j * 3] - x, dy = cx[j * 3 + 1] - y, dz = cx[j * 3 + 2] - z;
        if (dx * dx + dy * dy + dz * dz > radius * radius) continue;
        const d = nx[i * 3] * nx[j * 3] + nx[i * 3 + 1] * nx[j * 3 + 1] + nx[i * 3 + 2] * nx[j * 3 + 2]; if (d < .995) continue;   // same facing only: faces that look at each other are a contact, not a pair that draws on top of each other
        const off = Math.abs(dx * nx[i * 3] + dy * nx[i * 3 + 1] + dz * nx[i * 3 + 2]); if (off > gap) continue;
        seen.add(b); const k = a * 100000 + b; pair.set(k, (pair.get(k) || 0) + 1);
      }
    }
  }
  const out = [];
  for (const [k, n] of pair) {
    if (n < minCount) continue;
    const a = Math.floor(k / 100000), b = k % 100000;
    const ta = loaded[a].indices.length / 3, tb = loaded[b].indices.length / 3, share = Math.round(100 * n / Math.min(ta, tb));
    if (share < THRESHOLDS.zfightShare) continue;
    out.push({check: 'zfight', id: parts[a].id, name: parts[a].name, sub: parts[b].id, other: parts[b].name, measure: n, share, detail: `${n} faces (${share}% of the smaller mesh) coincide with ${parts[b].name}`});
  }
  log?.(`zfight: ${out.length}`);
  return out;
}

/** Open boundaries with long straight runs: a mesh opened by a plane or a box. */
export function cuts(parts, log) {
  const out = [];
  for (const p of parts) {
    if (p.system === 'integumentary') continue;
    const g = p.load(); if (!g.indices.length) continue;
    const {chains, boundary} = boundaryChains(g.positions, g.indices); if (!boundary) continue;
    let best = null, runs = 0;
    for (const c of chains) {
      if (c.length < 4) continue;
      // scan the chain for straight runs; continue after each run
      let from = 0;
      while (from < c.length - 3) {
        const r = longestStraightRun(c.slice(from));
        if (r.len < THRESHOLDS.cutRun) break;
        runs++; if (!best || r.len > best.len) best = r; from += r.to;
      }
    }
    if (best) out.push({check: 'cuts', id: p.id, name: p.name, measure: mm(best.len), detail: `${runs} straight boundary run(s), longest ${mm(best.len)} mm, direction ${best.dir.map(v => v.toFixed(2)).join(',')}`});
  }
  // runtime cuts: a renderer clipping plane slices every mesh at a plane, so the count of them in the app code may not grow (region filters show or hide whole structures)
  const appDir = new URL('../../app/', import.meta.url);
  const scan = d => fs.readdirSync(d, {withFileTypes: true}).flatMap(e => e.isDirectory() ? scan(new URL(e.name + '/', d)) : /\.(ts|tsx)$/.test(e.name) ? [new URL(e.name, d)] : []);
  for (const f of scan(appDir)) { const n = (fs.readFileSync(f, 'utf8').match(/clippingPlanes\s*=/g) || []).length; if (n) out.push({check: 'cuts', id: 'runtime:' + f.pathname.split('/app/')[1], name: 'renderer clipping plane in ' + f.pathname.split('/app/')[1], measure: n, detail: `${n} place(s) assign renderer.clippingPlanes (cuts every mesh along a plane)`}); }
  log?.(`cuts: ${out.length}`);
  return out;
}
