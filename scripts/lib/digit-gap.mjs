// Bone-to-bone clearance of the digits in a pose: the smallest distance between the surfaces of the bones of two neighbouring digits (vertex sampling of the real meshes).
import {Vector3} from 'three';
export const apply = (t, p) => { const [x, y, z, w] = t.quaternion, v = new Vector3(...p), u = new Vector3(x, y, z), c = u.clone().cross(v).multiplyScalar(2); return v.add(c.clone().multiplyScalar(w)).add(u.clone().cross(c)).add(new Vector3(...t.translation)); };
export function digitGaps({m, atlas, geometry, joints, side, pose}) {
  const J = joints.sides[side], t = m.buildUpperLimbMotion(atlas, side, {...m.NEUTRAL_POSE, ...pose}).transforms;
  const cloud = {};
  for (const digit of m.DIGITS) for (const [key, id] of Object.entries(J[digit].ids)) {
    if (key === 'mc' && digit !== 'thumb') continue; // finger metacarpals do not move
    const part = atlas.parts.find(p => p.id === id), g = geometry(part), pts = [], step = Math.max(1, Math.floor(g.positions.length / 3 / 160));
    for (let i = 0; i < g.positions.length / 3; i += step) { const p = [g.positions[i * 3], g.positions[i * 3 + 1], g.positions[i * 3 + 2]]; pts.push(t[id] ? apply(t[id], p) : new Vector3(...p)); }
    (cloud[digit] ??= []).push(...pts);
  }
  const order = ['thumb', 'index', 'middle', 'ring', 'little'], gaps = {};
  for (let k = 0; k + 1 < order.length; k++) {
    let best = Infinity; for (const a of cloud[order[k]]) for (const b of cloud[order[k + 1]]) best = Math.min(best, a.distanceTo(b));
    gaps[`${order[k]}-${order[k + 1]}`] = best;
  }
  // thumb against the other fingers it may be laid over
  for (const f of ['middle', 'ring']) { let best = Infinity; for (const a of cloud.thumb) for (const b of cloud[f]) best = Math.min(best, a.distanceTo(b)); gaps[`thumb-${f}`] = best; }
  return gaps;
}
