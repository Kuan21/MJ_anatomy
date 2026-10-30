// Upper-limb tendons cut off the BodyParts3D muscle meshes (scripts/lib/tendon-set.mjs), the palmar aponeurosis that the palmaris longus tendon runs on into, and the structures
// built around them (see the other tendon modules). Each tendon is one structure of one part per source muscle mesh; every part carries the motion binding of its muscle part
// (same profile, and the box of the WHOLE muscle), so that the muscle and the tendon move exactly as the single mesh did and the join never opens.
import fs from 'node:fs';
import {planCuts, atlasParts, SIDES, TENDON_SPECS} from '../lib/tendon-set.mjs';

const tissue = JSON.parse(fs.readFileSync(new URL('../../app/biomechanics-v2/tissue-bindings.json', import.meta.url), 'utf8'));
const MODEL_NOTE = {
  cut: ['Cut from the distal end of its muscle: the muscle part ends where the tendon begins, and the two share the cut edge.', '由肌肉遠端的肌腱部分分離而成：肌肉模型止於肌腱起始處，兩者共用切口邊緣。'],
};

export default function tendonsUpperLimb() {
  const {parts, read} = atlasParts(), {results} = planCuts(parts, read), out = [];
  for (const r of results) {
    const spec = TENDON_SPECS.find(s => s.key === r.spec), S = SIDES.find(x => x.w === r.side);
    const bind = piece => { const b = tissue[piece.id]; if (!b) throw new Error(`tendon ${spec.key}: ${piece.id} has no tissue binding`); return {name: b.name, side: b.side, profile: b.profile, box: piece.bounds}; };
    const card = {origin: spec.origin, course: spec.course, insertion: spec.insertion, action: spec.action};
    const first = r.pieces[0];
    out.push({
      name: `${S.w} ${spec.title}`, zh: `${S.zh}${spec.zh}`, system: 'tendon', kind: 'tendon', model: 'cut', cap: 1e9,
      geometry: [first.tendon], binding: bind(first), card, note: MODEL_NOTE.cut,
      siblings: r.pieces.slice(1).map(p => ({geometry: [p.tendon], binding: bind(p)})),
      bellies: r.pieces.map(p => ({id: p.id, ...bind(p)})),
    });
    const apoPiece = r.pieces.find(p => p.apo);
    if (apoPiece) out.push({
      name: `${S.w} palmar aponeurosis`, zh: `${S.zh}掌腱膜`, system: 'connective', kind: 'aponeurosis', model: 'cut', cap: 1e9,
      geometry: [apoPiece.apo], binding: bind(apoPiece),
      card: {origin: ['Tendon of palmaris longus and the flexor retinaculum', '掌長肌腱與屈肌支持帶'],
        course: ['A triangular fibrous sheet in the palm that splits into four bands, one to each finger, and lies over the long flexor tendons, the vessels and the nerves of the palm', '位於手掌的三角形纖維膜，分成四條縱帶各到一根手指，覆蓋在掌內屈指肌腱、血管與神經的前方'],
        insertion: ['Fibrous sheaths of the flexor tendons of the fingers and the skin of the palm', '各指屈肌腱的纖維鞘與手掌皮膚'],
        action: ['Protects the structures of the palm, anchors the skin of the palm and helps to grip', '保護手掌的構造、固定掌面皮膚並增進握持']},
      note: MODEL_NOTE.cut,
    });
  }
  return out;
}
