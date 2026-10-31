// Lower-limb tendons cut off the BodyParts3D muscle meshes (scripts/lib/tendon-set.mjs, specs in scripts/tendon/lower-limb-cuts.mjs), and the patellar ligament, the lower part of the
// rectus femoris tendon. Each tendon is one structure of one part per source muscle mesh. A leg muscle is skinned by the collars of its own bounds (app/biomechanics-v2/body-motion.ts); every
// tendon part carries the box of its WHOLE muscle in its binding, so that muscle and tendon get identical weights and the join never opens.
import {planCuts, atlasParts, SIDES, TENDON_SPECS} from '../lib/tendon-set.mjs';

const REF = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.); Moore’s Clinically Oriented Anatomy, 8th ed.';
const MODEL_NOTE = ['Cut from the muscle mesh: the muscle part ends where the tendon begins, and the two share the cut edge. Where the source mesh ran through a bone or stopped short of it, the tendon was lifted out of the bone or extended onto it.', '由肌肉網格分離而成：肌肉模型止於肌腱起始處，兩者共用切口邊緣；原網格穿入骨骼或未接到骨骼處，已把肌腱移出骨面或延伸到骨上。'];

export default function tendonsLowerLimb() {
  const {parts, read} = atlasParts(), {results} = planCuts(parts, read), out = [];
  for (const r of results) {
    const spec = TENDON_SPECS.find(s => s.key === r.spec); if (!spec.lower) continue;
    const S = SIDES.find(x => x.w === r.side), rig = S.mirror ? 'leftLeg' : 'rightLeg';
    const bind = (piece, name) => ({name, rig, frame: null, box: piece.bounds});
    const tendonName = `${S.w} ${spec.title}`, first = r.pieces[0];
    out.push({
      name: tendonName, zh: `${S.zh}${spec.zh}`, system: 'tendon', kind: 'tendon', model: 'cut', cap: 1e9,
      geometry: [first.tendon], binding: bind(first, tendonName), card: {origin: spec.origin, course: spec.course, insertion: spec.insertion, action: spec.action}, note: MODEL_NOTE, refs: [REF],
      siblings: r.pieces.slice(1).map(p => ({geometry: [p.tendon], binding: bind(p, tendonName)})),
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
