// Lung surface features marked on the lung lobes of the atlas: the fissures (where two lobes touch), the lingula and cardiac notch of the left lung, the cardiac impressions
// and the grooves left by the aortic arch, descending aorta, subclavian artery, brachiocephalic veins, azygos vein, superior vena cava and oesophagus.
// A groove is the part of the lobe surface that lies within a few millimetres of the neighbouring structure and faces it.
import {sub, add, mul, unit, len, lerp, dot} from '../lib/paokao-util.mjs';

const REF = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.), ch. 3 Thorax; Moore’s Clinically Oriented Anatomy, 8th ed.';

/** `part` 'late' returns only the surface areas added for the name labels: they are listed last in the build so that the ids (PK-n) of every earlier structure stay as they were. */
export default function lungs(U, part = 'base') {
  const out = [], late = [], P = (x, y, z) => [x, y, z];
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
  lobes('left', 'Esophageal impression of left lung', '左肺食道壓跡', [[LL, 'Esophagus', .010], [LU, 'Esophagus', .010]], ['A shallow impression on the mediastinal surface behind the hilum, below the groove for the aortic arch', '縱隔面肺門後方、主動脈弓溝下方的淺壓跡'], ['Left by the oesophagus', '由食道壓出']);
  lobes('right', 'Groove for inferior vena cava', '下腔靜脈溝', [[RL, 'Inferior vena cava', .008], [RM, 'Inferior vena cava', .008]], ['A groove at the lower part of the mediastinal surface of the right lung, in front of the pulmonary ligament', '右肺縱隔面下部、肺韌帶前方的溝'], ['Left by the inferior vena cava', '由下腔靜脈壓出']);
  lobes('right', 'Groove for esophagus', '食道溝', [[RL, 'Esophagus', .0045], [RU, 'Esophagus', .0045]], ['A groove on the mediastinal surface behind the hilum of the right lung', '右肺縱隔面、肺門後方的溝'], ['Left by the oesophagus', '由食道壓出']);
  // Surface areas added for the labelled mediastinal view: apex, contact areas (1st rib, thymus, trachea, diaphragm) and the anterior and inferior borders.
  // Each is the part of the lobe surface within reach of the neighbour (same rule as the grooves above) or a band along the lobe edge; nothing is drawn off the lung.
  {
    const SIDES = [['right', 'Right', '右', [RU, RM], [RL, RM], RU], ['left', 'Left', '左', [LU], [LL, LU], LU]];
    const band = (lobe, keep) => U.patchWhere(lobe, keep, .0005);
    for (const [side, w, z, upper, lower, top] of SIDES) {
      const m = U.mesh(top), apexY = m.hi[1] - .024;
      late.push({name: `Apex of ${side} lung`, zh: `${z}肺尖`, system: 'respiratory', kind: 'surface', parent: top, geometry: [band(top, tr => tr.mid[1] > apexY)],
        card: {origin: [`Top of the ${side} upper lobe`, `${z}肺上葉最上端`], course: ['The rounded top of the lung, which rises above the first rib into the root of the neck', '圓鈍的肺頂，越過第 1 肋上升到頸根'], supply: ['Covered by the cervical pleura (cupula); the subclavian artery grooves it from in front', '外覆胸膜頂；鎖骨下動脈由前方壓出溝']}, refs: [REF]});
      late.push({name: `Groove for first rib of ${side} lung`, zh: `${z}肺第 1 肋溝`, system: 'respiratory', kind: 'surface', parent: top, geometry: [facing(top, `${w} first rib`, .0045)],
        card: {origin: [`Surface of the ${side} lung`, `${z}肺表面`], course: ['A faint shallow mark near the apex where the first rib lies against the lung', '肺尖附近、第 1 肋貼靠肺的淺痕'], supply: [`Left by the ${side} first rib`, `由${z}側第 1 肋壓出`]}, refs: [REF]});
      late.push({name: `Contact area for thymus of ${side} lung`, zh: `${z}肺胸腺接觸區`, system: 'respiratory', kind: 'surface', parent: top, geometry: [facing(top, `${w} lobe of thymus`, side === 'right' ? .008 : .007)],
        card: {origin: [`Anterior part of the mediastinal surface of the ${side} lung`, `${z}肺縱隔面前部`], course: ['The part of the mediastinal surface that lies against the thymus (or its fatty remnant) in front of the great vessels', '縱隔面上貼靠胸腺（或其脂肪殘餘）的部分，位於大血管前方'], supply: [`Lies beside the ${side} lobe of the thymus`, `鄰接${z}側胸腺葉`]}, refs: [REF]});
      late.push({name: `Contact area for trachea of ${side} lung`, zh: `${z}肺氣管接觸區`, system: 'respiratory', kind: 'surface', parent: top, geometry: [facing(top, 'Trachea', side === 'right' ? .009 : .013)],
        card: {origin: [`Mediastinal surface of the ${side} upper lobe`, `${z}肺上葉縱隔面`], course: ['The part of the mediastinal surface above the hilum that lies beside the trachea', '肺門上方、貼靠氣管的縱隔面部分'], supply: ['The pleura separates it from the trachea', '以胸膜與氣管相隔']}, refs: [REF]});
      const zmax = Math.max(...upper.map(l => U.mesh(l).hi[2]));
      late.push({name: `Anterior border of ${side} lung`, zh: `${z}肺前緣`, system: 'respiratory', kind: 'surface', parent: top, geometry: upper.map(l => band(l, tr => tr.mid[2] > zmax - .016 && tr.mid[0] * (side === 'right' ? -1 : 1) > .004)),
        card: {origin: [`Front edge of the ${side} lung`, `${z}肺前方的邊緣`], course: [side === 'left' ? 'A thin sharp edge between the costal and mediastinal surfaces; the lower part bends away to form the cardiac notch' : 'A thin sharp edge between the costal and mediastinal surfaces, running down in front of the root of the lung', '肋面與縱隔面之間的薄銳邊緣' + (side === 'left' ? '，下部彎開形成心切跡' : '，在肺根前方向下延伸')], supply: ['Reaches the front of the pleural sac behind the sternum', '位於胸骨後方的胸膜囊前緣']}, refs: [REF]});
      late.push({name: `Diaphragmatic surface of ${side} lung`, zh: `${z}肺膈面`, system: 'respiratory', kind: 'surface', parent: lower[0], geometry: lower.map(l => facing(l, 'Diaphragm', .0045)).filter(g => g.indices.length),
        card: {origin: [`Base of the ${side} lung`, `${z}肺底`], course: ['The concave lower surface of the lung, which rests on the dome of the diaphragm', '肺的凹形下面，貼在橫膈穹窿上'], supply: [side === 'right' ? 'Separated by the diaphragm from the liver; the right dome is higher than the left' : 'Separated by the diaphragm from the stomach and spleen', side === 'right' ? '以橫膈與肝相隔；右側膈穹窿較高' : '以橫膈與胃及脾相隔']}, refs: [REF]});
      const ylo = Math.min(...lower.map(l => U.mesh(l).lo[1]));
      late.push({name: `Inferior border of ${side} lung`, zh: `${z}肺下緣`, system: 'respiratory', kind: 'surface', parent: lower[0], geometry: lower.map(l => band(l, tr => tr.mid[1] < ylo + .011 && tr.n[1] > -.55)).filter(g => g.indices.length),
        card: {origin: [`Lower edge of the ${side} lung`, `${z}肺下方的邊緣`], course: ['The sharp edge that separates the diaphragmatic surface from the costal and mediastinal surfaces', '分隔膈面與肋面、縱隔面的銳緣'], supply: ['Reaches the 6th rib at the midclavicular line and the 8th rib at the midaxillary line', '在鎖骨中線處達第 6 肋，在腋中線處達第 8 肋']}, refs: [REF]});
    }
  }
  // Hilum of each lung: where the main bronchus, pulmonary artery and pulmonary veins enter the mediastinal surface.
  lobes('left', 'Hilum of left lung', '左肺門', [[LL, 'Left main bronchus', .014], [LU, 'Left main bronchus', .014], [LL, 'Left pulmonary artery', .014], [LU, 'Left pulmonary artery', .014], [LL, 'Left inferior pulmonary vein', .012], [LU, 'Left superior pulmonary vein', .012]],
    ['A triangular depression on the mediastinal surface where the bronchus, pulmonary artery and two pulmonary veins enter and leave', '縱隔面上的三角形凹陷，支氣管、肺動脈與兩條肺靜脈由此出入'], ['The pulmonary artery lies above and in front, the veins below and in front, the bronchus behind (left lung); the pleura reflects onto these at the root', '左肺：肺動脈在上方，肺靜脈在前下方，支氣管在後；胸膜在肺根處反折']);
  lobes('right', 'Hilum of right lung', '右肺門', [[RL, 'Right main bronchus proper', .014], [RU, 'Right main bronchus proper', .014], [RL, 'Right pulmonary artery', .014], [RU, 'Right pulmonary artery', .014], [RL, 'Right inferior pulmonary vein', .012], [RM, 'Right superior pulmonary vein', .012]],
    ['A depression on the mediastinal surface where the bronchus, pulmonary artery and two pulmonary veins enter and leave', '縱隔面上的凹陷，支氣管、肺動脈與兩條肺靜脈由此出入'], ['From above down the order is bronchus, artery, veins on the right (the eparterial bronchus runs above the artery); the pleura reflects onto these at the root', '右肺由上到下為支氣管、肺動脈、肺靜脈（上葉支氣管在動脈上方）；胸膜在肺根處反折']);
  // Pulmonary ligament: the double fold of pleura hanging below the root from the mediastinal surface of the lower lobe towards the diaphragm.
  for (const [side, w, LOBE, sx] of [['left', 'Left', LL, 1], ['right', 'Right', RL, -1]]) {
    const m = U.mesh(LOBE), h = m.hi[1] - m.lo[1];
    const top = U.extreme(LOBE, P(-sx * .8, -.2, 0), {y: [m.lo[1] + h * .45, m.lo[1] + h * .7]}), bot = U.extreme(LOBE, P(-sx * .5, -1, 0), {y: [m.lo[1], m.lo[1] + h * .25]});
    const a = add(top, P(-sx * .0015, 0, 0)), b = add(bot, P(-sx * .0015, .003, 0));
    out.push({name: `${w} pulmonary ligament`, zh: `${side === 'left' ? '左' : '右'}肺韌帶`, system: 'connective', kind: 'ligament', ribbons: [{pts: [a, lerp(a, b, .5), b], width: .012, thick: .0008, hint: P(1, 0, 0)}],
      card: {origin: ['Mediastinal surface of the lower lobe, below the root of the lung', '下葉縱隔面、肺根下方'], course: ['A fold of pleura running down from the root of the lung to the diaphragm and mediastinum', '由肺根向下延伸到橫膈與縱隔的胸膜皺褶'], supply: ['Lets the lung root move with breathing; the inferior pulmonary vein lies at its upper end and the ligament is cut in lung surgery', '讓肺根隨呼吸移動；下肺靜脈在其上端，肺葉手術時需切開']}, refs: [REF]});
  }
  return part === 'late' ? late : out;
}
