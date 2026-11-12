// Veins the atlas lacks in the arm and the chest wall: the lateral brachial vein (the second vena comitans of the brachial artery), the anterior and posterior interosseous
// veins (venae comitantes of the interosseous arteries) and the thoracoepigastric vein. Positions follow the atlas meshes they accompany (U.axisAt), so they move with them.
import {sub, add, mul, unit, len, lerp} from '../lib/paokao-util.mjs';

const GRAYS_1918 = 'Gray’s Anatomy (1918), the veins of the thorax and abdomen';
const OPENSTAX = 'OpenStax, Anatomy and Physiology (CC BY 4.0), veins of the thorax and abdomen';
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
        refs: [],
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
          refs: [],
        });
      }
    }
    // Thoracoepigastric veins: a subcutaneous plexus on the side of the trunk, not a single vessel. A main channel runs down the flank along the anterior axillary line, then
    // eases a little medially to end in the superficial epigastric vein; several small tributaries and cross-links run obliquely over the lateral chest and abdominal wall and
    // join the lateral thoracic vein above, the superficial epigastric vein below and the periumbilical veins in the middle. Every point lies 4 mm under the skin.
    {
      const sev = `${S.w} superficial epigastric vein`, top = low(`${S.w} lateral thoracic vein`);
      // A point under the skin on the ray from the trunk axis at height y and azimuth th (0 = straight ahead, 90 = the side).
      const flank = (y, th) => { const t = th * Math.PI / 180, d = P(S.sx * Math.sin(t), 0, Math.cos(t)), h = U.rayHit('Skin', P(0, y, 0), d); return h ? add(h.point, mul(h.normal, -.004)) : P(S.sx * .14 * Math.sin(t), y, .14 * Math.cos(t)); };
      // The same on the front wall, by lateral position x (m from the midline) and height y: a ray straight back from in front of the body.
      const front = (x, y) => { const h = U.rayHit('Skin', P(S.sx * x, y, .4), P(0, 0, -1)); return h ? add(h.point, mul(h.normal, -.004)) : P(S.sx * x, y, .09); };
      const ends = U.tips(sev, .006).filter(t => t[1] > .91 && t[1] < .94), endTip = ends.reduce((a, v) => v[2] > a[2] ? v : a);
      // Main channel: knots (height, azimuth). The last knot is the superficial epigastric vein's own end near the groin.
      const knots = [[1.14, 67], [1.08, 65], [1.02, 61], [.97, 54], [.945, 45], [.928, 37]];
      const trunk = [top, ...knots.map(([y, th]) => flank(y, th)), endTip];
      const knot = i => trunk[i + 1];
      const tube = (pts, r, samples = 40) => ({pts, r: [r, r * .9], samples});
      const tubes = [{pts: trunk, r: [.0013, .0011], samples: 90}];
      // Tributaries to the lateral thoracic vein: from the main channel up and back over the lateral chest wall (free fine ends).
      tubes.push(tube([knot(0), flank(1.17, 74), flank(1.22, 80), flank(1.26, 84)], .0008));
      tubes.push(tube([knot(1), flank(1.11, 72), flank(1.14, 78), flank(1.18, 83)], .0007));
      // Cross-links over the anterior abdominal wall towards the periumbilical veins (their medial ends are joined by those veins, see below).
      tubes.push(tube([knot(1), front(.1, 1.075), front(.078, 1.062), front(.062, 1.05), front(.046, 1.043)], .0008, 32));
      tubes.push(tube([knot(2), front(.098, 1.012), front(.078, 1.016), front(.062, 1.02), front(.048, 1.025)], .0008, 32));
      tubes.push(tube([knot(3), front(.082, .962), front(.062, .968), front(.05, .978), front(.04, .99)], .0007, 32));
      // A short anastomosis between the two lower cross-links closes the mesh.
      tubes.push(tube([front(.078, 1.016), front(.073, .99), front(.082, .962)], .0006, 24));
      // Oblique tributaries below the waist: one runs laterally along the inguinal ligament towards the iliac crest (the line of the superficial circumflex iliac vein).
      tubes.push(tube([knot(5), flank(.94, 48), flank(.952, 57), flank(.964, 66), flank(.974, 75)], .0008));
      out.push({
        name: `${S.w} thoracoepigastric vein`, zh: `${S.zh}胸腹壁靜脈`, system: 'venous', kind: 'vein', parent: `${S.w} lateral thoracic vein`,
        tubes,
        card: {origin: ['Lateral thoracic vein (a tributary of the axillary vein) above; superficial epigastric vein (a tributary of the great saphenous vein) below', '上方為胸外側靜脈（腋靜脈屬支），下方為腹壁淺靜脈（大隱靜脈屬支）'],
          course: ['A plexus of small subcutaneous veins on the side of the chest and abdomen: a main channel descends from the axilla to the groin, with several fine oblique tributaries and cross-links joining it to the periumbilical veins; it links the superior and inferior vena cava systems', '沿胸腹側壁皮下由腋窩下行到鼠蹊部的一叢細小靜脈：一條主幹加上多條斜行的細小屬支與橫向吻合支，並與臍周靜脈相連；連接上、下腔靜脈系統'],
          supply: ['Drains the skin and subcutaneous tissue of the lateral trunk; enlarges as a collateral route when a vena cava is blocked', '回收側軀幹皮膚與皮下組織；腔靜脈阻塞時成為側枝循環']},
        refs: [GRAYS_1918, OPENSTAX],
      });
      // Paraumbilical (periumbilical) veins: small subcutaneous veins radiating from the umbilicus; they drain to the thoracoepigastric and superficial epigastric veins and, through
      // the round ligament of the liver, communicate with the portal system. Drawn as the half of the ring on this side.
      {
        const y0 = 1.035, ring = (a, l) => { const r = .008; return [front(r * Math.sin(a) + .004, y0 + r * Math.cos(a)), ...[.33, .66, 1].map(f => front((r + l * f) * Math.sin(a) + .004, y0 + (r + l * f) * Math.cos(a)))]; };
        const rad = [[20, .045], [65, .05], [105, .045], [155, .04], [-15, .03]].map(([deg, l]) => ring(deg * Math.PI / 180, l));
        rad[0][3] = front(.046, 1.075); rad[1][3] = front(.046, 1.043); rad[2][3] = front(.048, 1.025); rad[3][3] = front(.04, .99);
        out.push({
          name: `${S.w} paraumbilical veins`, zh: `${S.zh}臍旁靜脈`, system: 'venous', kind: 'vein', parent: sev,
          tubes: rad.map(pts => ({pts, r: [.0007, .0006], samples: 30})),
          card: {origin: ['Subcutaneous veins around the umbilicus', '臍周皮下的小靜脈'],
            course: ['Fine veins radiate from the umbilicus over the anterior abdominal wall and join the thoracoepigastric and superficial epigastric veins; along the round ligament of the liver they also communicate with the portal vein', '細小靜脈由臍部向外放射，分布於前腹壁，與胸腹壁靜脈、腹壁淺靜脈相連；並經肝圓韌帶與肝門靜脈相通'],
            supply: ['Drains the skin and subcutaneous tissue around the umbilicus; a portal-to-systemic collateral route that can dilate when the portal vein is obstructed', '回收臍周皮膚與皮下組織的血液；為門靜脈與體循環之間的側枝，門靜脈阻塞時可擴張']},
          refs: [GRAYS_1918, OPENSTAX],
        });
      }
    }
  }
  return out;
}
