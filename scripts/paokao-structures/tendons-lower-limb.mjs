// Lower-limb tendons cut off the BodyParts3D muscle meshes (scripts/lib/tendon-set.mjs, specs in scripts/tendon/lower-limb-cuts.mjs), and the patellar ligament, the lower part of the
// rectus femoris tendon. Each tendon is one structure of one part per source muscle mesh. A leg muscle is skinned by the collars of its own bounds (app/biomechanics-v2/body-motion.ts); every
// tendon part carries the box of its WHOLE muscle in its binding, so that muscle and tendon get identical weights and the join never opens.
import {planCuts, atlasParts, SIDES, TENDON_SPECS} from '../lib/tendon-set.mjs';

const REF = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.); Moore’s Clinically Oriented Anatomy, 8th ed.';
const MODEL_NOTE = ['Cut from the muscle mesh: the muscle part ends where the tendon begins, and the two share the cut edge. Where the source mesh ran through a bone or stopped short of it, the tendon was lifted out of the bone or extended onto it.', '由肌肉網格分離而成：肌肉模型止於肌腱起始處，兩者共用切口邊緣；原網格穿入骨骼或未接到骨骼處，已把肌腱移出骨面或延伸到骨上。'];

/** Drops the stray fragments of a cut tendon: connected pieces of fewer than `min` vertices (the cut leaves a few triangles of the source mesh behind, which hang as small white flecks beside the bone). */
function dropIslands(g, min = 30) {
  const n = g.positions.length / 3, key = new Map(), canon = new Int32Array(n);
  for (let i = 0; i < n; i++) { const k = [0, 1, 2].map(a => Math.round(g.positions[i * 3 + a] * 20000)).join(','); if (!key.has(k)) key.set(k, i); canon[i] = key.get(k); }
  const par = Int32Array.from({length: n}, (_, i) => i), find = a => { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; };
  for (let t = 0; t < g.indices.length; t += 3) { par[find(canon[g.indices[t]])] = find(canon[g.indices[t + 1]]); par[find(canon[g.indices[t + 1]])] = find(canon[g.indices[t + 2]]); }
  const size = new Map(); for (let i = 0; i < n; i++) if (canon[i] === i) size.set(find(i), (size.get(find(i)) ?? 0) + 1);
  if (![...size.values()].some(v => v < min) || ![...size.values()].some(v => v >= min)) return g;
  const keep = []; for (let t = 0; t < g.indices.length; t += 3) if (size.get(find(canon[g.indices[t]])) >= min) keep.push(g.indices[t], g.indices[t + 1], g.indices[t + 2]);
  const map = new Map(), positions = [], indices = [];
  for (const i of keep) { if (!map.has(i)) { map.set(i, positions.length / 3); positions.push(g.positions[i * 3], g.positions[i * 3 + 1], g.positions[i * 3 + 2]); } indices.push(map.get(i)); }
  return {...g, positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
}

export default function tendonsLowerLimb() {
  const {parts, read} = atlasParts(), {results} = planCuts(parts, read), out = [];
  for (const r of results) {
    const spec = TENDON_SPECS.find(s => s.key === r.spec); if (!spec.lower) continue;
    const S = SIDES.find(x => x.w === r.side), rig = S.mirror ? 'leftLeg' : 'rightLeg';
    const bind = (piece, name) => ({name, rig, frame: null, box: piece.bounds});
    const tendonName = `${S.w} ${spec.title}`, first = r.pieces[0];
    out.push({
      name: tendonName, zh: `${S.zh}${spec.zh}`, system: 'tendon', kind: 'tendon', model: 'cut', cap: 1e9,
      geometry: [dropIslands(first.tendon)], binding: bind(first, tendonName), card: {origin: spec.origin, course: spec.course, insertion: spec.insertion, action: spec.action}, note: MODEL_NOTE, refs: [REF],
      siblings: r.pieces.slice(1).map(p => ({geometry: [dropIslands(p.tendon)], binding: bind(p, tendonName)})),
    });
    const sp = spec.split, piece = sp && r.pieces.find(p => p.apo);
    if (piece) {
      const name = `${S.w} ${sp.title}`;
      out.push({
        name, zh: `${S.zh}${sp.zh}`, system: 'connective', kind: sp.kind, model: 'cut', cap: 1e9, geometry: [piece.apo], binding: bind(piece, name),
        card: {origin: sp.origin, course: sp.course, insertion: sp.insertion, action: sp.action, supply: sp.action}, note: MODEL_NOTE, refs: [REF],
      });
    }
  }
  return out;
}
