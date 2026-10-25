// Lung surface features marked on the lung lobes of the atlas: the fissures (where two lobes touch), the lingula and cardiac notch of the left lung, the cardiac impressions
// and the grooves left by the aortic arch, descending aorta, subclavian artery, brachiocephalic veins, azygos vein, superior vena cava and oesophagus.
// A groove is the part of the lobe surface that lies within a few millimetres of the neighbouring structure and faces it.
import {sub, add, mul, unit, len, lerp, dot} from '../lib/paokao-util.mjs';

const REF = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.), ch. 3 Thorax; Moore’s Clinically Oriented Anatomy, 8th ed.';

export default function lungs(U) {
  const out = [], P = (x, y, z) => [x, y, z];
  const RU = 'Upper lobe of right lung', RM = 'Middle lobe of right lung', RL = 'Lower lobe of right lung', LU = 'Upper lobe of left lung', LL = 'Lower lobe of left lung';
  /** Contact of lobe `a` with structure `b`: triangles within d of it whose normal faces it. */
  const facing = (a, b, d) => {
    const ma = U.mesh(a), mb = U.mesh(b), cb = mb.centre, dist = U.nearDist(a, b), idx = new Map(ma.tris.map((t, i) => [t, i]));
    return U.patchWhere(a, tr => dist[idx.get(tr)] <= d && dot(tr.n, unit(sub(cb, tr.mid))) > -.2, .0005);
  };
  const lobes = (side, label, zh, list, where, role) => {
    const parts = list.filter(([lobe]) => lobe).map(([lobe, other, d]) => facing(lobe, other, d)).filter(g => g.indices.length);
    if (!parts.length) throw new Error(`lung feature ${label}: nothing within reach`);
    out.push({name: label, zh, system: 'respiratory', kind: 'surface', parent: list[0][0], geometry: [U.merge(parts)], card: {origin: [`Surface of the ${side} lung`, `${side === 'left' ? '左' : '右'}肺表面`], course: where, supply: role}, refs: [REF]});
  };
  const contact = (a, b, d) => { const dist = U.nearDist(a, b), ma = U.mesh(a), idx = new Map(ma.tris.map((t, i) => [t, i])); return U.patchWhere(a, tr => dist[idx.get(tr)] <= d, .0005); };
  const fissure = (label, zh, side, pairs, where, role) => out.push({name: label, zh, system: 'respiratory', kind: 'surface', parent: pairs[0][0], geometry: [U.merge(pairs.map(([a, b, d]) => contact(a, b, d)))], card: {origin: [`Surface of the ${side} lung`, `${side === 'left' ? '左' : '右'}肺表面`], course: where, supply: role}, refs: [REF]});
  fissure('Oblique fissure of right lung', '右肺斜裂', 'right', [[RU, RL, .0025], [RM, RL, .0025], [RL, RU, .0025], [RL, RM, .0025]], ['A deep cleft running obliquely down and forwards, separating the lower lobe from the upper and middle lobes', '由後上斜向前下的深裂，把下葉與上葉、中葉分開'], ['Lets the lobes slide on each other during breathing; marks the surface of the lobes for surgery', '讓各肺葉在呼吸時互相滑動；是肺葉手術的界標']);
  fissure('Horizontal fissure of right lung', '右肺水平裂', 'right', [[RU, RM, .0025], [RM, RU, .0025]], ['A shorter cleft running horizontally at the level of the 4th costal cartilage, separating the upper from the middle lobe', '約在第四肋軟骨高度水平走行的較短裂隙，把上葉與中葉分開'], ['Only the right lung has a horizontal fissure (three lobes)', '只有右肺有水平裂（三葉）']);
  fissure('Oblique fissure of left lung', '左肺斜裂', 'left', [[LU, LL, .0025], [LL, LU, .0025]], ['A deep cleft running obliquely down and forwards, separating the upper from the lower lobe (the left lung has two lobes)', '由後上斜向前下的深裂，把上葉與下葉分開（左肺只有兩葉）'], ['Marks the boundary of the lobes', '肺葉的界線']);
  // Lingula and cardiac notch of the left lung
  {
    const m = U.mesh(LU), cut = m.lo[1] + (m.hi[1] - m.lo[1]) * .40, zc = (m.lo[2] + m.hi[2]) / 2;
    out.push({name: 'Lingula of left lung', zh: '左肺舌葉', system: 'respiratory', kind: 'surface', parent: LU, geometry: [U.patchWhere(LU, tr => tr.mid[1] < cut && tr.mid[2] > zc - .004, .0005)],
      card: {origin: ['Lower front part of the left upper lobe', '左肺上葉的前下部'], course: ['A tongue-shaped projection below the cardiac notch, the left counterpart of the right middle lobe', '位於心切跡下方的舌狀突出，相當於右肺中葉'], supply: ['Has its own superior and inferior lingular segments', '有自己的上舌段與下舌段']}, refs: [REF]});
    const dist = U.nearDist(LU, 'Fibrous pericardium'), idx = new Map(m.tris.map((t, i) => [t, i]));
    out.push({name: 'Cardiac notch of left lung', zh: '左肺心切跡', system: 'respiratory', kind: 'surface', parent: LU, geometry: [U.patchWhere(LU, tr => dist[idx.get(tr)] <= .010 && tr.mid[2] > .035 && tr.mid[1] < 1.31 && tr.n[2] > .2, .0005)],
      card: {origin: ['Anterior border of the left upper lobe', '左肺上葉前緣'], course: ['A deep notch where the apex of the heart lies against the chest wall, with the lingula below it', '心尖貼近胸壁處的深切跡，下方是舌葉'], supply: ['Leaves part of the pericardium uncovered by lung (the area of cardiac dullness)', '使部分心包不被肺覆蓋（心濁音區）']}, refs: [REF]});
  }
  // Cardiac impressions
  lobes('left', 'Cardiac impression of left lung', '左肺心壓跡', [[LU, 'Fibrous pericardium', .0045], [LL, 'Fibrous pericardium', .0045]], ['The large concavity on the mediastinal surface in front of and below the hilum', '縱隔面肺門前下方的大凹陷'], ['Moulded by the heart (left ventricle) inside its pericardium', '由心包內的心臟（左心室）壓出']);
  lobes('right', 'Cardiac impression of right lung', '右肺心壓跡', [[RU, 'Fibrous pericardium', .0045], [RM, 'Fibrous pericardium', .0045], [RL, 'Fibrous pericardium', .0045]], ['A shallower concavity on the mediastinal surface in front of the hilum', '縱隔面肺門前方較淺的凹陷'], ['Moulded by the right atrium inside its pericardium', '由心包內的右心房壓出']);
  // Grooves
  lobes('left', 'Groove for aortic arch', '主動脈弓溝', [[LU, 'Arch of aorta', .0045]], ['An arching groove above and behind the hilum of the left lung', '左肺肺門上後方的弓形溝'], ['Left by the aortic arch', '由主動脈弓壓出']);
  lobes('left', 'Groove for descending aorta', '降主動脈溝', [[LL, 'Descending thoracic aorta', .0045], [LU, 'Descending thoracic aorta', .0045]], ['A vertical groove behind the hilum of the left lung', '左肺肺門後方的垂直溝'], ['Left by the descending thoracic aorta', '由胸主動脈壓出']);
  for (const [side, w] of [['left', 'Left'], ['right', 'Right']]) {
    lobes(side, `${w} groove for subclavian artery`, `${side === 'left' ? '左' : '右'}鎖骨下動脈溝`, [[side === 'left' ? LU : RU, `${w} subclavian artery`, .0045]],
      ['A groove on the upper part of the mediastinal surface, curving up over the apex', '縱隔面上部、向上繞過肺尖的溝'], [`Left by the ${side} subclavian artery`, `由${side === 'left' ? '左' : '右'}鎖骨下動脈壓出`]);
  }
  lobes('left', 'Groove for left brachiocephalic vein', '左頭臂靜脈溝', [[LU, 'Left brachiocephalic vein', .010]], ['A groove in front of the groove for the subclavian artery, at the top of the left lung', '左肺上部、鎖骨下動脈溝前方的溝'], ['Left by the left brachiocephalic vein', '由左頭臂靜脈壓出']);
  lobes('right', 'Groove for brachiocephalic vein', '頭臂靜脈溝', [[RU, 'Right brachiocephalic vein', .0045]], ['A groove at the top of the mediastinal surface of the right lung, in front of the groove for the subclavian artery', '右肺縱隔面上部、鎖骨下動脈溝前方的溝'], ['Left by the right brachiocephalic vein', '由右頭臂靜脈壓出']);
  lobes('right', 'Groove for superior vena cava', '上腔靜脈溝', [[RU, 'Superior vena cava', .0045]], ['A vertical groove in front of the hilum of the right lung', '右肺肺門前方的垂直溝'], ['Left by the superior vena cava', '由上腔靜脈壓出']);
  lobes('right', 'Groove for azygos vein', '奇靜脈溝', [[RU, 'Azygos vein', .0045]], ['An arching groove above the hilum of the right lung, where the arch of the azygos vein enters the superior vena cava', '右肺肺門上方的弓形溝，奇靜脈弓在此注入上腔靜脈'], ['Left by the arch of the azygos vein', '由奇靜脈弓壓出']);
  lobes('right', 'Groove for esophagus', '食道溝', [[RL, 'Esophagus', .0045], [RU, 'Esophagus', .0045]], ['A groove on the mediastinal surface behind the hilum of the right lung', '右肺縱隔面、肺門後方的溝'], ['Left by the oesophagus', '由食道壓出']);
  return out;
}
