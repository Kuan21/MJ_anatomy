// Veins the atlas lacks in the arm and the chest wall: the lateral brachial vein (the second vena comitans of the brachial artery), the anterior and posterior interosseous
// veins (venae comitantes of the interosseous arteries) and the thoracoepigastric vein. Positions follow the atlas meshes they accompany (U.axisAt), so they move with them.
import {sub, add, mul, unit, len, lerp} from '../lib/paokao-util.mjs';

const GRAYS = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.), ch. 7 Upper Limb and ch. 4 Abdomen';
const SIDES = [{w: 'Right', l: 'right', sx: -1, zh: '右', s: 'r'}, {w: 'Left', l: 'left', sx: 1, zh: '左', s: 'l'}];

export default function limbVeins(U) {
  const out = [], P = (x, y, z) => [x, y, z];
  const high = name => U.tips(name, .008).reduce((a, v) => v[1] > a[1] ? v : a);
  const low = name => U.tips(name, .008).reduce((a, v) => v[1] < a[1] ? v : a);
  for (const S of SIDES) {
    // Lateral brachial vein: the brachial artery has two venae comitantes. The atlas draws the medial one; the lateral one lies on the opposite side of the artery
    // (mirror of the medial vein across the artery's axis), from the elbow, where the radial and ulnar veins meet, to the axillary vein.
    {
      const art = `${S.w} brachial artery`, medial = `${S.w} medial brachial vein`, axV = `${S.w} axillary vein`, radV = `${S.w} radial vein`;
      const y0 = high(radV)[1] - .004, y1 = low(axV)[1] + .002, level = t => y0 + (y1 - y0) * t;
      const at = y => { const a = U.axisAt(art, y, P(S.sx * .18, y, -.015), .003), m = U.axisAt(medial, Math.min(y, high(medial)[1] - .002), P(S.sx * .18, y, -.012), .003); return add(a, sub(a, m)); };
      const pts = [high(radV), ...[.08, .25, .42, .6, .78].map(t => at(level(t))), U.cen(axV, P(S.sx * .150, y1 + .004, -.006), .004)];
      out.push({
        name: `${S.w} lateral brachial vein`, zh: `${S.zh}外側肱靜脈`, system: 'venous', kind: 'vein', parent: axV,
        tubes: [{pts, r: [.0017, .0019], samples: 40}],
        card: {origin: ['Radial and ulnar veins, at the elbow (with the medial brachial vein)', '橈靜脈與尺靜脈，在肘部（與內側肱靜脈並行）'],
          course: ['Runs with the brachial artery on its lateral side and joins the axillary vein (the basilic vein usually ends in the medial brachial vein or the axillary vein)', '與肱動脈並行於其外側，注入腋靜脈（貴要靜脈通常注入內側肱靜脈或腋靜脈）'],
          supply: ['Drains the muscles and bone of the arm and the elbow joint, together with the medial brachial vein', '與內側肱靜脈共同回收上臂肌肉、骨與肘關節的血液']},
        refs: [GRAYS],
      });
    }
    // Anterior and posterior interosseous veins: venae comitantes of the interosseous arteries, ending in the ulnar vein.
    {
      const ulnar = `${S.w} ulnar vein`, ulna = `${S.w} ulna`, radius = `${S.w} radius`;
      // anterior: beside the atlas's anterior interosseous artery on the membrane; posterior: beside the schematic posterior interosseous artery, whose path is the middle of the
      // interosseous space seen from behind (the same construction as the artery in upper-limb.mjs)
      const aia = `${S.w} anterior interosseous artery`, aTop = high(aia), aBottom = low(aia);
      const back = y => { const r = U.axisAt(radius, y, P(S.sx * .25, y, -.01), .002), u = U.axisAt(ulna, y, P(S.sx * .235, y, -.01), .002); return add(lerp(r, u, .5), P(0, 0, -.0115)); };
      const sets = [
        ['anterior', '前', [0, .2, .4, .6, .8, 1].map(t => { const y = aBottom[1] + (aTop[1] - aBottom[1]) * t; return add(U.axisAt(aia, y, P(aTop[0], y, aTop[2]), .004), P(S.sx * .0035, 0, .0035)); }), aTop],
        ['posterior', '後', [.895, .925, .96, 1.0, 1.04, 1.066].map(y => add(back(y), P(-S.sx * .003, 0, -.003))), P(S.sx * -.218, 1.075, -.026)],
      ];
      for (const [which, zh, ptsRaw, top] of sets) {
        const join = U.cen(ulnar, P(top[0], 1.098, top[2]), .004), pts = [...ptsRaw, join].sort((a, b) => a[1] - b[1]);
        out.push({
          name: `${S.w} ${which} interosseous vein`, zh: `${S.zh}${zh}骨間靜脈`, system: 'venous', kind: 'vein', parent: ulnar,
          tubes: [{pts, r: [.0008, .0012], samples: 32}],
          card: {origin: [`Deep veins of the ${which} forearm`, which === 'anterior' ? '前臂前側深靜脈' : '前臂後側深靜脈'],
            course: [`Runs with the ${which} interosseous artery and ends in the ulnar vein`, `與${zh}骨間動脈並行，注入尺靜脈`],
            supply: ['Drains the deep muscles and bones of the forearm', '回收前臂深層肌肉與骨的血液']},
          refs: [GRAYS],
        });
      }
    }
    // Thoracoepigastric vein: a subcutaneous vein of the side of the trunk that links the lateral thoracic vein (axillary vein) with the superficial epigastric vein
    // (great saphenous vein), a route between the vena cava systems. Drawn 4 mm under the skin along the anterior axillary line.
    {
      const top = low(`${S.w} lateral thoracic vein`), gsv = high(`${S.w} great saphenous vein`), n = 9, pts = [];
      for (let i = 0; i <= n; i++) {
        const y = top[1] + (gsv[1] - top[1]) * i / n, z = top[2] + (gsv[2] - top[2]) * i / n, hit = U.rayHit('Skin', P(0, y, z), P(S.sx, 0, 0));
        pts.push(hit ? add(hit.point, mul(hit.normal, -.004)) : P(S.sx * .16, y, z));
      }
      pts[0] = top; pts[n] = add(gsv, P(0, 0, 0));
      out.push({
        name: `${S.w} thoracoepigastric vein`, zh: `${S.zh}胸腹壁靜脈`, system: 'venous', kind: 'vein', parent: `${S.w} lateral thoracic vein`,
        tubes: [{pts, r: [.0012, .0011], samples: 60}],
        card: {origin: ['Lateral thoracic vein (a tributary of the axillary vein) above; superficial epigastric vein (a tributary of the great saphenous vein) below', '上方為胸外側靜脈（腋靜脈屬支），下方為腹壁淺靜脈（大隱靜脈屬支）'],
          course: ['Runs under the skin along the side of the chest and abdomen from the axilla to the groin, linking the superior and inferior vena cava systems', '沿胸腹側壁皮下由腋窩下行到鼠蹊部，連接上、下腔靜脈系統'],
          supply: ['Drains the skin and subcutaneous tissue of the lateral trunk; enlarges as a collateral route when a vena cava is blocked', '回收側軀幹皮膚與皮下組織；腔靜脈阻塞時成為側枝循環']},
        refs: [GRAYS],
      });
    }
  }
  return out;
}
