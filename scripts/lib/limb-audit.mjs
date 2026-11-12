// Shared by scripts/audit-limb-pose.mjs (report) and scripts/test-limb-tears.mjs (gate): poses the whole arm with the viewer's own solvers and measures what tears.
//   tear      an edge that ends up longer than 15 mm AND more than 3x its rest length: a gap or spike that can be seen (a 0.1 mm edge becoming 3 mm is not)
//   stretch   a triangle with an edge more than twice its rest length (and longer than 3 mm once posed)
//   detached  a vessel, nerve, tendon or ligament that touched a moving bone at rest and ends up > 15 mm from it
//   seam      a vessel-end piece (-END) that lies on its vessel at rest and ends up further from the vessel's posed shape than SEAM_MAX
import {loadStabilityParts} from './stability-world.mjs';
import {loadMotion, registerNerves, makePoser, stretched, detached} from './stability-motion.mjs';
import {TriGrid} from './stability-geom.mjs';

export const REPORTED = [
  {name: 'shoulder flexion 97', arm: {shoulderFlexion: 97}},
  {name: 'shoulder flexion 73 + abduction 158', arm: {shoulderFlexion: 73, shoulderAbduction: 158}},
  {name: 'internal rotation 48 + elbow flexion 129 + wrist flexion 80', arm: {shoulderRotation: 48, elbowFlexion: 129, wristFlexion: 80}},
];
export const SEAM_MAX = .008;   // metres: mean distance between an end piece and the vessel it continues, over the points where they touched at rest
const e3 = (P, a, b) => Math.hypot(P[a * 3] - P[b * 3], P[a * 3 + 1] - P[b * 3 + 1], P[a * 3 + 2] - P[b * 3 + 2]);
export function visibleTears(rest, posed, indices) {
  let n = 0, worstLen = 0;
  for (let i = 0; i < indices.length; i += 3) for (let k = 0; k < 3; k++) { const a = indices[i + k], b = indices[i + (k + 1) % 3], p = e3(posed, a, b); if (p > .015 && p > 3 * Math.max(e3(rest, a, b), 1e-5)) { n++; worstLen = Math.max(worstLen, p); } }
  return {n, worstLen};
}
export const kindOf = p => p.system === 'muscular' ? 'muscle' : p.system === 'arterial' ? 'artery' : p.system === 'venous' ? 'vein' : p.system === 'nervous' ? 'nerve' : p.system;

export async function createAudit() {
  const m = await loadMotion(), world = loadStabilityParts(), {atlas, geometry, parts} = world;
  registerNerves(m, atlas, parts);
  const byId = new Map(parts.map(p => [p.id, p]));
  const bones = parts.filter(p => p.system === 'skeletal'), boneRest = new Map(bones.map(b => [b.id, b.load()])), boneNames = new Map(bones.map(b => [b.id, b.name]));
  const restBoneGrid = new TriGrid(.008); for (const [id, g] of boneRest) restBoneGrid.add(id, g.positions, g.indices);
  const poser = makePoser(m, atlas, geometry, parts, p => p.load());
  const profileOf = (id, p) => m.tissueBindings[id]?.profile ?? (p?.stream === 'nerve' ? 'nerve' : '-');
  const grid = new Map(), cell = .01;
  function seamGaps(posed) {
    const out = [];
    for (const end of atlas.parts) {
      if (!end.id.endsWith('-END') || !posed.has(end.id)) continue;
      const main = atlas.parts.find(q => q.id === end.id.slice(0, -4)); if (!main || !posed.has(main.id)) continue;
      const ge = geometry(end), gm = geometry(main), pe = posed.get(end.id), pm = posed.get(main.id), hash = new Map(), key = (x, y, z) => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
      for (let j = 0; j < gm.positions.length; j += 3) { const k = key(gm.positions[j], gm.positions[j + 1], gm.positions[j + 2]); (hash.get(k) ?? hash.set(k, []).get(k)).push(j); }
      let n = 0, sum = 0, max = 0;
      for (let i = 0; i < ge.positions.length; i += 3) {
        const x = ge.positions[i], y = ge.positions[i + 1], z = ge.positions[i + 2], kx = Math.floor(x / cell), ky = Math.floor(y / cell), kz = Math.floor(z / cell); let best = -1, bd = .004 * .004;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) for (const j of hash.get(`${kx + dx},${ky + dy},${kz + dz}`) ?? []) { const d = (x - gm.positions[j]) ** 2 + (y - gm.positions[j + 1]) ** 2 + (z - gm.positions[j + 2]) ** 2; if (d < bd) { bd = d; best = j; } }
        if (best < 0) continue; const g = Math.hypot(pe[i] - pm[best], pe[i + 1] - pm[best + 1], pe[i + 2] - pm[best + 2]); n++; sum += g; if (g > max) max = g;
      }
      if (n) out.push({id: end.id, name: end.name, points: n, mean: sum / n, max});
    }
    return out;
  }
  function audit(pz) {
    const {posed, moved} = poser.pose({...pz, kind: 'arm'}), rows = [];
    for (const [id, pos] of posed) {
      const p = byId.get(id); if (!p || p.system === 'skeletal') continue;
      const g = p.load(); if (pos.length !== g.positions.length) continue;
      let d = 0; for (let i = 0; i < pos.length; i += 7) d = Math.max(d, Math.abs(pos[i] - g.positions[i])); if (d < 1e-4) continue;
      const v = visibleTears(g.positions, pos, g.indices), base = {id, name: p.name, profile: profileOf(id, p), kind: kindOf(p)};
      if (v.n) rows.push({...base, check: 'tear', measure: v.n, fraction: v.n / Math.max(1, g.indices.length / 3), severity: Math.round(v.worstLen * 1000)});
      const r = stretched(g.positions, pos, g.indices);
      if (r.n) rows.push({...base, check: 'stretch', measure: r.n, fraction: r.n / Math.max(1, g.indices.length / 3), severity: Number.isFinite(r.worst) ? Math.round(r.worst * 10) / 10 : 1e9});
    }
    const movedBones = new Set([...moved].filter(id => boneRest.has(id)));
    for (const f of detached(parts, posed, restBoneGrid, boneRest, movedBones, boneNames)) rows.push({check: 'detached', id: f.id, name: f.name, profile: profileOf(f.id, byId.get(f.id)), kind: kindOf(byId.get(f.id) ?? {system: ''}), measure: f.measure, fraction: f.fraction, severity: f.severity});
    return {pose: pz.name, rows, seams: seamGaps(posed)};
  }
  return {m, atlas, audit, limits: m.MOTION_LIMITS};
}
