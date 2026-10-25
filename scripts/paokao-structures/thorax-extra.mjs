// More thoracic structures the atlas lacks: thoracic duct, posterior intercostal veins, supreme intercostal and superior phrenic arteries, the atrioventricular nodal
// artery, and typical dorsal rami of the thoracic spinal nerves with their posterior cutaneous branches.
import {sub, add, mul, unit, len, lerp} from '../lib/paokao-util.mjs';

const GRAYS = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.), ch. 1 Back and ch. 3 Thorax';
const SIDES = [{w: 'Right', l: 'right', sx: -1, zh: '右', s: 'r'}, {w: 'Left', l: 'left', sx: 1, zh: '左', s: 'l'}];
const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];

export default function thoraxExtra(U) {
  const out = [], P = (x, y, z) => [x, y, z];
  const axis = (name, y, near, half = .002) => U.axisAt(name, y, near, half);
  const body = y => {   // front of the vertebral bodies at height y (thoracic and first lumbar), midline strip
    const name = [...ORD.map(o => `${o[0].toUpperCase()}${o.slice(1)} thoracic vertebra`), 'First lumbar vertebra', 'Second lumbar vertebra'].find(n => U.has(n) && (() => { const m = U.mesh(n); return y >= m.lo[1] - .001 && y <= m.hi[1] + .001; })());
    return U.extreme(name, P(0, 0, 1), {x: [-.02, .02]})[2];
  };
  // ---- Thoracic duct: cisterna chyli (L1–L2) → up on the vertebral bodies between the aorta and the azygos vein → crosses to the left at T5 → left venous angle.
  {
    const aorta = y => (y > 1.207 ? U.axisAt('Descending thoracic aorta', Math.min(y, 1.375), null, .003) : U.axisAt('Abdominal aorta', y, null, .003));
    const ys = [1.085, 1.130, 1.170, 1.210, 1.250, 1.290, 1.320, 1.350];
    const pts = ys.map(y => {
      const z = body(y) - .0035, t = Math.max(0, Math.min(1, (y - 1.28) / .06));  // x runs from right of the aorta (-x) over to the left (+x) between T6 and T4
      return P(-.0065 + t * .0215, y, z);
    });
    const vc = U.tipNear('Left subclavian artery', P(.03, 1.41, -.01), .01), angle = U.axisAt('Left brachiocephalic vein', 1.403, P(.022, 1.403, .02), .003);
    const over = [add(pts[pts.length - 1], P(.0075, .020, .0025)), add(pts[pts.length - 1], P(.0105, .052, .0040)), P(.0285, 1.4465, -.0100), add(angle, P(.0105, .0035, -.008)), angle];
    out.push({
      name: 'Thoracic duct', zh: '胸管', system: 'lymphatic', kind: 'vessel',
      tubes: [{pts: [...pts, ...over], r: [.0021, .0016], samples: 70}],
      card: {origin: ['Cisterna chyli at L1–L2, in front of the vertebral bodies', '乳糜池（L1–L2，位於椎體前方）'],
        course: ['Passes through the aortic hiatus, ascends between the aorta and the azygos vein in the posterior mediastinum, crosses to the left at about T5 behind the oesophagus, arches over the left subclavian artery and ends at the left venous angle', '經主動脈裂孔，在後縱隔位於主動脈與奇靜脈之間上行，約在 T5 處越到左側（食道後方），弓過左鎖骨下動脈，終止於左靜脈角'],
        supply: ['Returns lymph from the whole body below the diaphragm and from the left side of the head, neck, thorax and left upper limb to the venous system', '收集橫膈以下全身及左側頭頸、胸部與左上肢的淋巴，注入靜脈系統']}, refs: [GRAYS],
    });
  }
  for (const S of SIDES) {
    // ---- Posterior intercostal veins: from the azygos (right) or hemiazygos (left) system, back along the costal grooves.
    {
      const trunk = S.s === 'r' ? 'Azygos vein' : 'Hemiazygos vein', tubes = [];
      for (let i = 2; i < 10; i++) {
        const y = 1.352 - (i - 2) * .0235, rib = `${S.w} ${ORD[i]} rib`;
        let o; try { o = axis(trunk, Math.min(y, S.s === 'l' ? 1.245 : y), P(S.sx * .0115, y, body(y) - .01)); } catch { o = axis('Azygos vein', y, P(-.0115, y, body(y) - .01)); }
        const t = U.onSurface(rib, P(S.sx * .052, y, -.058), -.004), mid = U.onSurface(rib, P(S.sx * .030, y + .004, -.045), -.003);
        tubes.push({pts: [o, add(mid, P(0, -.003, 0)), add(t, P(0, -.004, 0))], r: [.0012, .0008], samples: 14});
      }
      out.push({
        name: `${S.w} posterior intercostal veins`, zh: `${S.zh}後肋間靜脈`, system: 'venous', kind: 'vein', parent: trunk,
        tubes,
        card: {origin: [S.s === 'r' ? 'Azygos vein' : 'Hemiazygos or accessory hemiazygos vein', S.s === 'r' ? '奇靜脈' : '半奇靜脈或副半奇靜脈'],
          course: ['Run forwards in the costal groove, above the artery and below the rib, in each intercostal space', '在各肋間隙沿肋溝向前走，位於動脈上方、肋骨下緣'], supply: ['Drain the posterior intercostal spaces, the back muscles and the vertebral venous plexuses', '回收後肋間隙、背肌與椎靜脈叢的血液']}, refs: [GRAYS],
      });
    }
    // ---- Supreme intercostal artery: from the costocervical trunk over the neck of the 1st rib to the first two intercostal spaces.
    {
      const sub = `${S.w} subclavian artery`, o = axis(sub, 1.412, P(S.sx * .05, 1.412, 0), .003), r1 = `${S.w} first rib`, r2 = `${S.w} second rib`;
      const neck = U.onSurface(r1, P(S.sx * .028, 1.420, -.033), .0025), end = U.onSurface(r2, P(S.sx * .035, 1.382, -.045), .0025);
      out.push({
        name: `${S.w} supreme intercostal artery`, zh: `${S.zh}最上肋間動脈`, system: 'arterial', kind: 'artery', parent: sub,
        tubes: [{pts: [o, add(lerp(o, neck, .5), P(0, 0, -.004)), neck, add(lerp(neck, end, .5), P(0, 0, -.001)), end], r: [.0016, .0010], samples: 30}],
        card: {origin: ['Costocervical trunk (from the 2nd part of the subclavian artery)', '肋頸動脈幹（來自鎖骨下動脈第二段）'], course: ['Descends in front of the neck of the 1st and 2nd ribs and gives the 1st and 2nd posterior intercostal arteries', '在第一、二肋頸前方下行，發出第一、二後肋間動脈'], supply: ['The first two intercostal spaces and the neighbouring back muscles', '第一、二肋間隙與鄰近背肌']}, refs: [GRAYS],
      });
    }
    // ---- Superior phrenic artery: small branch of the lowest thoracic aorta to the back of the diaphragm.
    {
      const o = U.axisAt('Descending thoracic aorta', 1.222, null, .004), t = U.onSurface('Diaphragm', P(S.sx * .045, 1.185, -.040), .0008);
      out.push({
        name: `${S.w} superior phrenic artery`, zh: `${S.zh}膈上動脈`, system: 'arterial', kind: 'artery', parent: 'Descending thoracic aorta',
        tubes: [{pts: [o, add(lerp(o, t, .5), P(S.sx * .002, 0, -.003)), t], r: [.0009, .0006], samples: 16}],
        card: {origin: ['Lowest part of the thoracic aorta, just above the diaphragm', '胸主動脈最下段（橫膈上方）'], course: ['Runs to the posterior part of the upper surface of the diaphragm', '走到橫膈上面後部'], supply: ['Posterior part of the diaphragm (anastomoses with the musculophrenic and pericardiophrenic arteries)', '橫膈後部（與肌膈動脈、心包膈動脈吻合）']}, refs: [GRAYS],
      });
    }
  }
  // ---- Atrioventricular nodal artery: from the right coronary system at the crux of the heart to the AV node.
  {
    const piv = 'Posterior interventricular branch of right coronary artery', cs = U.mesh('Coronary sinus');
    const start = U.tipNear(piv, P(.0, 1.262, .025), .01), csEnd = U.tipNear('Coronary sinus', P(-.006, 1.285, .0), .008), end = add(lerp(start, csEnd, .5), P(0, .0065, .002));
    out.push({
      name: 'Atrioventricular nodal artery', zh: '房室結動脈', system: 'arterial', kind: 'artery', parent: piv,
      tubes: [{pts: [start, add(lerp(start, end, .5), P(0, .002, .003)), end], r: [.0006, .0004], samples: 12}],
      card: {origin: ['Right coronary artery (in about 80 % of hearts), at the crux where the posterior interventricular and atrioventricular grooves meet', '右冠狀動脈（約八成），位於後室間溝與房室溝交會的心十字處'],
        course: ['Runs up into the interatrial septum to the atrioventricular node, in front of the opening of the coronary sinus', '向上進入房間隔，到冠狀竇開口前方的房室結'], supply: ['Atrioventricular node and the start of the atrioventricular bundle', '房室結與房室束起始部']}, refs: [GRAYS],
    });
  }
  // ---- Typical dorsal rami of the thoracic spinal nerves (T2–T11): back from the intervertebral foramen between the transverse processes, then a medial branch whose posterior cutaneous branch pierces trapezius to the skin.
  for (const S of SIDES) {
    const rami = [], cutaneous = [];
    for (let i = 1; i < 11; i++) {
      const vname = `${ORD[i][0].toUpperCase()}${ORD[i].slice(1)} thoracic vertebra`, m = U.mesh(vname), yc = (m.lo[1] + m.hi[1]) / 2 - .008;
      const cord = U.axisAt('White matter of spinal cord', yc, null, .002), fo = add(cord, P(S.sx * .0165, -.001, .0)), mid = add(cord, P(S.sx * .029, -.003, -.024)), med = add(cord, P(S.sx * .016, .0, -.044));
      const hit = U.rayHit('Skin', add(cord, P(S.sx * .014, 0, -.06)), P(0, 0, -1)), skin = hit ? add(hit.point, P(0, 0, .0006)) : add(cord, P(S.sx * .014, 0, -.075));
      rami.push({pts: [fo, mid, med], r: [.0011, .0008], samples: 14});
      cutaneous.push({pts: [med, lerp(med, skin, .5), skin], r: [.0006, .0004], samples: 12});
    }
    out.push({
      name: `${S.w} dorsal rami of thoracic spinal nerves`, zh: `${S.zh}胸脊神經後支`, system: 'nervous', kind: 'nerve', tubes: rami,
      card: {origin: ['Spinal nerves T2–T11, just outside the intervertebral foramen', '第二至第十一胸脊神經，在椎間孔外'], course: ['Pass backwards between the transverse processes and divide into medial and lateral branches that supply the deep back muscles', '向後穿過橫突之間，分成內側支與外側支，分布到深背肌'], supply: ['Deep (intrinsic) back muscles and the skin of the back', '深背肌（固有背肌）與背部皮膚']}, refs: [GRAYS],
    });
    out.push({
      name: `${S.w} posterior cutaneous branches of dorsal rami of thoracic spinal nerves`, zh: `${S.zh}胸脊神經後支的後皮支`, system: 'nervous', kind: 'nerve', tubes: cutaneous,
      card: {origin: ['Medial (upper thoracic) or lateral (lower thoracic) branch of the dorsal ramus', '後支的內側支（上胸段）或外側支（下胸段）'], course: ['Pierces trapezius or latissimus dorsi near the midline and runs in the superficial fascia of the back', '在中線附近穿過斜方肌或背闊肌，走在背部淺筋膜內'], supply: ['Skin of the back along the vertebral column', '沿脊柱的背部皮膚']}, refs: [GRAYS],
    });
  }
  return out;
}
