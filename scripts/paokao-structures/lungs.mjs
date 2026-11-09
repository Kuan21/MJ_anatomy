// Lung surface features marked on the lung lobes of the atlas: the fissures (where two lobes touch), the lingula and cardiac notch of the left lung, the cardiac impressions
// and the grooves left by the aortic arch, descending aorta, subclavian artery, brachiocephalic veins, azygos vein, superior vena cava and oesophagus.
// A groove is the part of the lobe surface that lies within a few millimetres of the neighbouring structure and faces it.
import {sub, add, mul, unit, len, lerp, dot, merge} from '../lib/paokao-util.mjs';
import {closestOnTri, meshOf, vertexNormalsOf} from '../lib/heart-geom.mjs';
import {lungCard} from './lung-cards.mjs';

const REF = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.), ch. 3 Thorax; Moore’s Clinically Oriented Anatomy, 8th ed.';

/** `part` 'late' returns only the surface areas added for the name labels: they are listed last in the build so that the ids (PK-n) of every earlier structure stay as they were. */
let lungMarkLayers = {};
export const lungLayers = () => lungMarkLayers;
export default function lungs(U, part = 'base') {
  const out = [], late = [], P = (x, y, z) => [x, y, z];
  const RU = 'Upper lobe of right lung', RM = 'Middle lobe of right lung', RL = 'Lower lobe of right lung', LU = 'Upper lobe of left lung', LL = 'Lower lobe of left lung';
  // Every patch is the zero level of a smooth field on the lobe surface (U.fieldPatch): the lobe triangles are split near the border, the field is taken at the vertices, and the
  // triangles are cut along it, so a border is a smooth curve and not a row of whole triangles. Distances are exact (to the neighbour's triangles), not to its vertices.
  // Terms of different units are combined by `min` after scaling an angle (cosine) term to metres: .01 per unit of cosine.
  const ANG = .01;
  // Where two patches overlap (a groove inside a contact area, a fissure across the lingula) they would be drawn at the same depth and flicker into each other. Every patch gets its own
  // height above the lobe (0.03 mm apart), from the broad areas at the bottom to the grooves, the hilum and the fissures on top, so an overlap shows one colour with a clean edge.
  const STACK = ['Diaphragmatic surface of right lung', 'Diaphragmatic surface of left lung', 'Lingula of left lung', 'Cardiac notch of left lung', 'Anterior border of right lung', 'Anterior border of left lung',
    'Inferior border of right lung', 'Inferior border of left lung', 'Apex of right lung', 'Apex of left lung', 'Contact area for thymus of right lung', 'Contact area for thymus of left lung', 'Contact area for trachea of right lung',
    'Cardiac impression of right lung', 'Cardiac impression of left lung', 'Groove for inferior vena cava', 'Groove for esophagus', 'Esophageal impression of left lung', 'Groove for descending aorta', 'Groove for aortic arch',
    'Groove for azygos vein', 'Groove for superior vena cava', 'Groove for brachiocephalic vein', 'Groove for left brachiocephalic vein', 'Right groove for subclavian artery', 'Left groove for subclavian artery',
    'Groove for first rib of right lung', 'Groove for first rib of left lung', 'Hilum of right lung', 'Hilum of left lung', 'Oblique fissure of right lung', 'Horizontal fissure of right lung', 'Oblique fissure of left lung'];
  const lift = name => { const k = STACK.indexOf(name); if (k < 0) throw new Error(`lung patch ${name} has no place in the stacking order`); return .0004 + k * .00003; };
  /** Contact of lobe `a` with structure `b`: the surface within d of it whose normal faces it. With `sx` (+1 left lung, -1 right lung) the mark also stays on the mediastinal side: the surface must face towards the midline, so a groove never runs round onto the front or the back of the lung. */
  const facing = (a, b, d, name, sx = 0) => {
    const D = U.distTo(b), cb = U.mesh(b).centre;
    return U.fieldPatch(a, (p, n) => { const s = d - D(p); return n ? Math.min(s, (dot(n, unit(sub(cb, p))) + .2) * ANG, sx ? (-n[0] * sx - .1) * ANG : 1) : s; }, {off: lift(name), maxEdge: Math.max(.0008, d / 3.2)});
  };
  const lobes = (side, label, zh, list, where, role, medial = true) => {
    const parts = list.filter(([lobe]) => lobe).map(([lobe, other, d]) => facing(lobe, other, d, label, medial ? (side === 'left' ? 1 : -1) : 0)).filter(g => g.indices.length);
    if (!parts.length) throw new Error(`lung feature ${label}: nothing within reach`);
    out.push({name: label, zh, system: 'respiratory', kind: 'surface', parent: list[0][0], geometry: [U.merge(parts)], card: {origin: [`Surface of the ${side} lung`, `${side === 'left' ? '左' : '右'}肺表面`], course: where, supply: role}, refs: [REF]});
  };
  const contact = (a, b, d, name) => { const D = U.distTo(b); return U.fieldPatch(a, p => d - D(p), {off: lift(name), maxEdge: Math.max(.0008, d / 3.2), smooth: 1}); };
  const fissure = (label, zh, side, pairs, where, role) => out.push({name: label, zh, system: 'respiratory', kind: 'surface', parent: pairs[0][0], geometry: [U.merge(pairs.map(([a, b, d]) => contact(a, b, d, label)))], card: {origin: [`Surface of the ${side} lung`, `${side === 'left' ? '左' : '右'}肺表面`], course: where, supply: role}, refs: [REF]});
  fissure('Oblique fissure of right lung', '右肺斜裂', 'right', [[RU, RL, .0012], [RM, RL, .0012], [RL, RU, .0012], [RL, RM, .0012]], ['A deep cleft running obliquely down and forwards, separating the lower lobe from the upper and middle lobes', '由後上斜向前下的深裂，把下葉與上葉、中葉分開'], ['Lets the lobes slide on each other during breathing; marks the surface of the lobes for surgery', '讓各肺葉在呼吸時互相滑動；是肺葉手術的界標']);
  fissure('Horizontal fissure of right lung', '右肺水平裂', 'right', [[RU, RM, .0012], [RM, RU, .0012]], ['A shorter cleft running horizontally at the level of the 4th costal cartilage, separating the upper from the middle lobe', '約在第四肋軟骨高度水平走行的較短裂隙，把上葉與中葉分開'], ['Only the right lung has a horizontal fissure (three lobes)', '只有右肺有水平裂（三葉）']);
  fissure('Oblique fissure of left lung', '左肺斜裂', 'left', [[LU, LL, .0012], [LL, LU, .0012]], ['A deep cleft running obliquely down and forwards, separating the upper from the lower lobe (the left lung has two lobes)', '由後上斜向前下的深裂，把上葉與下葉分開（左肺只有兩葉）'], ['Marks the boundary of the lobes', '肺葉的界線']);
  // Lingula and cardiac notch of the left lung
  {
    const m = U.mesh(LU), cut = m.lo[1] + (m.hi[1] - m.lo[1]) * .40, zc = (m.lo[2] + m.hi[2]) / 2;
    out.push({name: 'Lingula of left lung', zh: '左肺舌葉', system: 'respiratory', kind: 'surface', parent: LU, geometry: [U.fieldPatch(LU, p => Math.min(cut - p[1], p[2] - (zc - .004)), {off: lift('Lingula of left lung')})],
      card: {origin: ['Lower front part of the left upper lobe', '左肺上葉的前下部'], course: ['A tongue-shaped projection below the cardiac notch, the left counterpart of the right middle lobe', '位於心切跡下方的舌狀突出，相當於右肺中葉'], supply: ['Has its own superior and inferior lingular segments', '有自己的上舌段與下舌段']}, refs: [REF]});
    const Dp = U.distTo('Fibrous pericardium');
    out.push({name: 'Cardiac notch of left lung', zh: '左肺心切跡', system: 'respiratory', kind: 'surface', parent: LU, geometry: [U.fieldPatch(LU, (p, n) => { const s = Math.min(.010 - Dp(p), p[2] - .035, 1.31 - p[1]); return n ? Math.min(s, (n[2] - .2) * ANG) : s; }, {off: lift('Cardiac notch of left lung')})],
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
      ['A groove on the upper part of the mediastinal surface, curving up over the apex', '縱隔面上部、向上繞過肺尖的溝'], [`Left by the ${side} subclavian artery`, `由${side === 'left' ? '左' : '右'}鎖骨下動脈壓出`], false);
  }
  lobes('left', 'Groove for left brachiocephalic vein', '左頭臂靜脈溝', [[LU, 'Left brachiocephalic vein', .010]], ['A groove in front of the groove for the subclavian artery, at the top of the left lung', '左肺上部、鎖骨下動脈溝前方的溝'], ['Left by the left brachiocephalic vein', '由左頭臂靜脈壓出'], false);
  lobes('right', 'Groove for brachiocephalic vein', '頭臂靜脈溝', [[RU, 'Right brachiocephalic vein', .0045]], ['A groove at the top of the mediastinal surface of the right lung, in front of the groove for the subclavian artery', '右肺縱隔面上部、鎖骨下動脈溝前方的溝'], ['Left by the right brachiocephalic vein', '由右頭臂靜脈壓出'], false);
  lobes('right', 'Groove for superior vena cava', '上腔靜脈溝', [[RU, 'Superior vena cava', .0045]], ['A vertical groove in front of the hilum of the right lung', '右肺肺門前方的垂直溝'], ['Left by the superior vena cava', '由上腔靜脈壓出']);
  lobes('right', 'Groove for azygos vein', '奇靜脈溝', [[RU, 'Azygos vein', .0045]], ['An arching groove above the hilum of the right lung, where the arch of the azygos vein enters the superior vena cava', '右肺肺門上方的弓形溝，奇靜脈弓在此注入上腔靜脈'], ['Left by the arch of the azygos vein', '由奇靜脈弓壓出']);
  lobes('left', 'Esophageal impression of left lung', '左肺食道壓跡', [[LL, 'Esophagus', .010], [LU, 'Esophagus', .010]], ['A shallow impression on the mediastinal surface behind the hilum, below the groove for the aortic arch', '縱隔面肺門後方、主動脈弓溝下方的淺壓跡'], ['Left by the oesophagus', '由食道壓出']);
  lobes('right', 'Groove for inferior vena cava', '下腔靜脈溝', [[RL, 'Inferior vena cava', .008], [RM, 'Inferior vena cava', .008]], ['A groove at the lower part of the mediastinal surface of the right lung, in front of the pulmonary ligament', '右肺縱隔面下部、肺韌帶前方的溝'], ['Left by the inferior vena cava', '由下腔靜脈壓出']);
  lobes('right', 'Groove for esophagus', '食道溝', [[RL, 'Esophagus', .0045], [RU, 'Esophagus', .0045]], ['A groove on the mediastinal surface behind the hilum of the right lung', '右肺縱隔面、肺門後方的溝'], ['Left by the oesophagus', '由食道壓出']);
  // Surface areas added for the labelled mediastinal view: apex, contact areas (1st rib, thymus, trachea, diaphragm) and the anterior and inferior borders.
  // Each is the part of the lobe surface within reach of the neighbour (same rule as the grooves above) or a band along the lobe edge; nothing is drawn off the lung.
  {
    const SIDES = [['right', 'Right', '右', [RU, RM], [RL, RM], RU], ['left', 'Left', '左', [LU], [LL, LU], LU]];
    const band = (lobe, field, name) => U.fieldPatch(lobe, field, {off: lift(name)});
    for (const [side, w, z, upper, lower, top] of SIDES) {
      const m = U.mesh(top), apexY = m.hi[1] - .024;
      late.push({name: `Apex of ${side} lung`, zh: `${z}肺尖`, system: 'respiratory', kind: 'surface', parent: top, geometry: [band(top, p => p[1] - apexY, `Apex of ${side} lung`)],
        card: {origin: [`Top of the ${side} upper lobe`, `${z}肺上葉最上端`], course: ['The rounded top of the lung, which rises above the first rib into the root of the neck', '圓鈍的肺頂，越過第 1 肋上升到頸根'], supply: ['Covered by the cervical pleura (cupula); the subclavian artery grooves it from in front', '外覆胸膜頂；鎖骨下動脈由前方壓出溝']}, refs: [REF]});
      late.push({name: `Groove for first rib of ${side} lung`, zh: `${z}肺第 1 肋溝`, system: 'respiratory', kind: 'surface', parent: top, geometry: [facing(top, `${w} first rib`, .0045, `Groove for first rib of ${side} lung`)],
        card: {origin: [`Surface of the ${side} lung`, `${z}肺表面`], course: ['A faint shallow mark near the apex where the first rib lies against the lung', '肺尖附近、第 1 肋貼靠肺的淺痕'], supply: [`Left by the ${side} first rib`, `由${z}側第 1 肋壓出`]}, refs: [REF]});
      late.push({name: `Contact area for thymus of ${side} lung`, zh: `${z}肺胸腺接觸區`, system: 'respiratory', kind: 'surface', parent: top, geometry: [facing(top, `${w} lobe of thymus`, side === 'right' ? .008 : .007, `Contact area for thymus of ${side} lung`)],
        card: {origin: [`Anterior part of the mediastinal surface of the ${side} lung`, `${z}肺縱隔面前部`], course: ['The part of the mediastinal surface that lies against the thymus (or its fatty remnant) in front of the great vessels', '縱隔面上貼靠胸腺（或其脂肪殘餘）的部分，位於大血管前方'], supply: [`Lies beside the ${side} lobe of the thymus`, `鄰接${z}側胸腺葉`]}, refs: [REF]});
      // The left lung has no tracheal contact area (the aortic arch lies between the trachea and the left lung); only the right lung has one.
      if (side === 'right') late.push({name: `Contact area for trachea of ${side} lung`, zh: `${z}肺氣管接觸區`, system: 'respiratory', kind: 'surface', parent: top, geometry: [facing(top, 'Trachea', side === 'right' ? .009 : .013, `Contact area for trachea of ${side} lung`)],
        card: {origin: [`Mediastinal surface of the ${side} upper lobe`, `${z}肺上葉縱隔面`], course: ['The part of the mediastinal surface above the hilum that lies beside the trachea', '肺門上方、貼靠氣管的縱隔面部分'], supply: ['The pleura separates it from the trachea', '以胸膜與氣管相隔']}, refs: [REF]});
      const zmax = Math.max(...upper.map(l => U.mesh(l).hi[2]));
      late.push({name: `Anterior border of ${side} lung`, zh: `${z}肺前緣`, system: 'respiratory', kind: 'surface', parent: top, geometry: upper.map(l => band(l, (p, n) => { const s0 = p[0] * (side === 'right' ? -1 : 1) - .004; return n ? Math.min(s0, (n[2] - .3) * ANG, (.07 - Math.abs(n[0])) * ANG) : s0; }, `Anterior border of ${side} lung`)),
        card: {origin: [`Front edge of the ${side} lung`, `${z}肺前方的邊緣`], course: [side === 'left' ? 'A thin sharp edge between the costal and mediastinal surfaces; the lower part bends away to form the cardiac notch' : 'A thin sharp edge between the costal and mediastinal surfaces, running down in front of the root of the lung', '肋面與縱隔面之間的薄銳邊緣' + (side === 'left' ? '，下部彎開形成心切跡' : '，在肺根前方向下延伸')], supply: ['Reaches the front of the pleural sac behind the sternum', '位於胸骨後方的胸膜囊前緣']}, refs: [REF]});
      late.push({name: `Diaphragmatic surface of ${side} lung`, zh: `${z}肺膈面`, system: 'respiratory', kind: 'surface', parent: lower[0], geometry: lower.map(l => facing(l, 'Diaphragm', .0045, `Diaphragmatic surface of ${side} lung`)).filter(g => g.indices.length),
        card: {origin: [`Base of the ${side} lung`, `${z}肺底`], course: ['The concave lower surface of the lung, which rests on the dome of the diaphragm', '肺的凹形下面，貼在橫膈穹窿上'], supply: [side === 'right' ? 'Separated by the diaphragm from the liver; the right dome is higher than the left' : 'Separated by the diaphragm from the stomach and spleen', side === 'right' ? '以橫膈與肝相隔；右側膈穹窿較高' : '以橫膈與胃及脾相隔']}, refs: [REF]});
      const ylo = Math.min(...lower.map(l => U.mesh(l).lo[1]));
      late.push({name: `Inferior border of ${side} lung`, zh: `${z}肺下緣`, system: 'respiratory', kind: 'surface', parent: lower[0], geometry: lower.map(l => band(l, (p, n) => { const s = ylo + .003 - p[1]; return n ? Math.min(s, (n[1] + .55) * ANG) : s; }, `Inferior border of ${side} lung`)).filter(g => g.indices.length),
        card: {origin: [`Lower edge of the ${side} lung`, `${z}肺下方的邊緣`], course: ['The sharp edge that separates the diaphragmatic surface from the costal and mediastinal surfaces', '分隔膈面與肋面、縱隔面的銳緣'], supply: ['Reaches the 6th rib at the midclavicular line and the 8th rib at the midaxillary line', '在鎖骨中線處達第 6 肋，在腋中線處達第 8 肋']}, refs: [REF]});
    }
  }
  // Hilum of each lung: ONE region at the centre of the mediastinal surface where the root of the lung enters.
  // Its centre is the mean of the points where the main bronchus, the pulmonary artery and the two pulmonary veins touch the lobes (for each of them the lobe triangle nearest to it);
  // the region is the part of the lobe surface within a radius that just covers those four points and faces the mediastinum. The root structures themselves are the real atlas meshes.
  for (const [side, w, lobes_, sx, root] of [['left', 'Left', [LU, LL], 1, ['Left main bronchus', 'Left pulmonary artery', 'Left superior pulmonary vein', 'Left inferior pulmonary vein']], ['right', 'Right', [RU, RM, RL], -1, ['Right main bronchus proper', 'Right pulmonary artery', 'Right superior pulmonary vein', 'Right inferior pulmonary vein']]]) {
    const hits = root.map(r => { let best = null; for (const l of lobes_) { const d = U.nearDist(l, r), m = U.mesh(l); m.tris.forEach((t, i) => { if ((!best || d[i] < best.d) && t.n[0] * sx < -.3) best = {d: d[i], p: t.mid}; }); } return best.p; });
    const c = hits.reduce((a, p) => add(a, mul(p, 1 / hits.length)), P(0, 0, 0)), R = Math.min(.034, Math.max(.02, Math.max(...hits.map(p => len(sub(p, c)))) + .008));
    const pieces = lobes_.map(l => U.fieldPatch(l, (p, n) => { const s = R - len(sub(p, c)); return n ? Math.min(s, -(n[0] * sx + .3) * ANG) : s; }, {off: lift(`Hilum of ${side} lung`), maxEdge: .0016})).filter(g => g.indices.length);
    if (!pieces.length) throw new Error(`hilum of ${side} lung: nothing within reach`);
    out.push({name: `Hilum of ${side} lung`, zh: `${side === 'left' ? '左' : '右'}肺門`, system: 'respiratory', kind: 'surface', parent: lobes_[0], geometry: [U.merge(pieces)], refs: [REF]});
  }

  // Pulmonary ligament: the double fold of pleura hanging below the root from the mediastinal surface of the lower lobe towards the diaphragm.
  for (const [side, w, LOBE, sx] of [['left', 'Left', LL, 1], ['right', 'Right', RL, -1]]) {
    const m = U.mesh(LOBE), h = m.hi[1] - m.lo[1];
    const top = U.extreme(LOBE, P(-sx * .8, -.2, 0), {y: [m.lo[1] + h * .45, m.lo[1] + h * .7]}), bot = U.extreme(LOBE, P(-sx * .5, -1, 0), {y: [m.lo[1], m.lo[1] + h * .25]});
    const a = add(top, P(-sx * .0015, 0, 0)), b = add(bot, P(-sx * .0015, .003, 0));
    out.push({name: `${w} pulmonary ligament`, zh: `${side === 'left' ? '左' : '右'}肺韌帶`, system: 'connective', kind: 'ligament', ribbons: [{pts: [a, lerp(a, b, .5), b], width: .012, thick: .0008, hint: P(1, 0, 0)}],
      card: {origin: ['Mediastinal surface of the lower lobe, below the root of the lung', '下葉縱隔面、肺根下方'], course: ['A fold of pleura running down from the root of the lung to the diaphragm and mediastinum', '由肺根向下延伸到橫膈與縱隔的胸膜皺褶'], supply: ['Lets the lung root move with breathing; the inferior pulmonary vein lies at its upper end and the ligament is cut in lung surgery', '讓肺根隨呼吸移動；下肺靜脈在其上端，肺葉手術時需切開']}, refs: [REF]});
  }
  // A surface mark is one connected piece. The side and thickness limits above (medial face, thin strips) can leave small islands of surface far from the main piece (a few triangles on the
  // other side of a fold, a bit of a strip across a gap): they are drawn as floating specks and are not part of the structure, so every piece that is both small (under a quarter of the
  // area of the largest piece) and more than 3 mm from every kept piece is dropped.
  const dropIslands = geoms => {
    const g = merge(geoms), P = g.positions, I = g.indices, key = i => `${Math.round(P[i * 3] * 1e6)},${Math.round(P[i * 3 + 1] * 1e6)},${Math.round(P[i * 3 + 2] * 1e6)}`;
    const id = new Map(), canon = new Uint32Array(P.length / 3); for (let i = 0; i < canon.length; i++) { const k = key(i); if (!id.has(k)) id.set(k, id.size); canon[i] = id.get(k); }
    const up = Array.from({length: id.size}, (_, i) => i), find = x => { while (up[x] !== x) { up[x] = up[up[x]]; x = up[x]; } return x; };
    for (let t = 0; t < I.length; t += 3) { const a = find(canon[I[t]]), b = find(canon[I[t + 1]]), c = find(canon[I[t + 2]]); up[b] = a; up[find(c)] = a; }
    const comp = new Map();
    for (let t = 0; t < I.length; t += 3) {
      const r = find(canon[I[t]]), a = [0, 1, 2].map(k => I[t + k] * 3), u = [0, 1, 2].map(k => P[a[1] + k] - P[a[0] + k]), v = [0, 1, 2].map(k => P[a[2] + k] - P[a[0] + k]);
      const area = Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]) / 2;
      const c = comp.get(r) ?? comp.set(r, {tris: [], area: 0, lo: [1e9, 1e9, 1e9], hi: [-1e9, -1e9, -1e9]}).get(r);
      c.tris.push(t); c.area += area; for (const o of a) for (let k = 0; k < 3; k++) { c.lo[k] = Math.min(c.lo[k], P[o + k]); c.hi[k] = Math.max(c.hi[k], P[o + k]); }
    }
    const list = [...comp.values()].sort((x, y) => y.area - x.area);
    if (list.length < 2) return g;
    // distance between pieces is measured between their vertices (a bounding box of a long strip says nothing about where its triangles are)
    const CELL3 = .003, vkey = (x, y, z) => `${Math.floor(x / CELL3)},${Math.floor(y / CELL3)},${Math.floor(z / CELL3)}`, grid = new Map(), addGrid = c => { for (const t of c.tris) for (let k = 0; k < 3; k++) { const o = I[t + k] * 3, key2 = vkey(P[o], P[o + 1], P[o + 2]); (grid.get(key2) ?? grid.set(key2, []).get(key2)).push(o); } };
    const close = c => c.tris.some(t => [0, 1, 2].some(k => { const o = I[t + k] * 3, x = Math.floor(P[o] / CELL3), y = Math.floor(P[o + 1] / CELL3), z = Math.floor(P[o + 2] / CELL3);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) for (const q of grid.get(`${x + dx},${y + dy},${z + dz}`) ?? []) if (Math.hypot(P[o] - P[q], P[o + 1] - P[q + 1], P[o + 2] - P[q + 2]) <= .003) return true;
      return false; }));
    const kept = [list[0]]; addGrid(list[0]);
    for (const c of list.slice(1)) if (c.area >= .25 * list[0].area || close(c)) { kept.push(c); addGrid(c); }
    if (kept.length === list.length) return g;
    const remap = new Map(), pos = [], idx = [];
    for (const c of kept) for (const t of c.tris) for (let k = 0; k < 3; k++) { const vtx = I[t + k]; if (!remap.has(vtx)) { remap.set(vtx, pos.length / 3); pos.push(P[vtx * 3], P[vtx * 3 + 1], P[vtx * 3 + 2]); } idx.push(remap.get(vtx)); }
    return {positions: Float32Array.from(pos), indices: Uint32Array.from(idx)};
  };
  for (const s of [...out, ...late]) if (s.kind === 'surface') s.geometry = [dropIslands(s.geometry)];
  // Where two marks overlap (a groove inside a contact area, the aortic arch groove on the cardiac impression) the one drawn later covers the earlier one, but the two sheets lay on top of
  // each other only 0.03 mm apart: at a distance they are one surface to the depth buffer (z-fighting) and the stability check calls them coincident (within 0.15 mm). Each mark is lifted
  // from the surface by its own layer: 0.2 mm more than the highest mark it overlaps that is drawn before it, so overlapping marks are always at least 0.2 mm apart and marks that do not
  // overlap stay at the same low height. Nothing is cut away, so no mark loses a piece of itself.
  {
    const marks = [...out, ...late].filter(m => m.kind === 'surface').sort((x, y) => STACK.indexOf(x.name) - STACK.indexOf(y.name)), CELL = .004, R = .0015, STEP = .0002;
    const trisOf = g => { const t2 = []; for (let t = 0; t < g.indices.length; t += 3) t2.push([0, 1, 2].map(k => [g.positions[g.indices[t + k] * 3], g.positions[g.indices[t + k] * 3 + 1], g.positions[g.indices[t + k] * 3 + 2]])); return t2; };
    const key = (x, y, z) => `${Math.floor(x / CELL)},${Math.floor(y / CELL)},${Math.floor(z / CELL)}`;
    const grids = marks.map(m => { const cells = new Map(); for (const tr of trisOf(m.geometry[0])) { const lo = [0, 1, 2].map(k => Math.min(tr[0][k], tr[1][k], tr[2][k]) - R), hi = [0, 1, 2].map(k => Math.max(tr[0][k], tr[1][k], tr[2][k]) + R);
      for (let x = Math.floor(lo[0] / CELL); x <= Math.floor(hi[0] / CELL); x++) for (let y = Math.floor(lo[1] / CELL); y <= Math.floor(hi[1] / CELL); y++) for (let z = Math.floor(lo[2] / CELL); z <= Math.floor(hi[2] / CELL); z++) { const k = `${x},${y},${z}`; (cells.get(k) ?? cells.set(k, []).get(k)).push(tr); } } return cells; });
    const layer = marks.map(() => 0);
    for (let i = 1; i < marks.length; i++) {
      const mine = trisOf(marks[i].geometry[0]);
      for (let e = 0; e < i; e++) {
        let n = 0;
        for (const tr of mine) { const c = mul(add(add(tr[0], tr[1]), tr[2]), 1 / 3), near = grids[e].get(key(...c)) ?? []; if (near.some(h => len(sub(c, closestOnTri(c, h[0], h[1], h[2]))) < R)) if (++n >= 60) break; }
        if (n >= 60) layer[i] = Math.max(layer[i], layer[e] + 1);
      }
    }
    marks.forEach((m, i) => {
      if (!layer[i]) return;
      const g = m.geometry[0], mesh = meshOf(g.positions, g.indices), vn = vertexNormalsOf(mesh), positions = Float32Array.from(g.positions);
      // the border stays where it is (the shape of the mark is not changed, only its interior rises): border vertices are those on an edge used by one triangle
      const use = new Map(), onBorder = new Uint8Array(positions.length / 3), nv = positions.length / 3;
      for (let t = 0; t < g.indices.length; t += 3) for (let k = 0; k < 3; k++) { const x = g.indices[t + k], y = g.indices[t + (k + 1) % 3], ek = x < y ? x * nv + y : y * nv + x; use.set(ek, (use.get(ek) ?? 0) + 1); }
      for (const [ek, c] of use) if (c === 1) { onBorder[Math.floor(ek / nv)] = 1; onBorder[ek % nv] = 1; }
      for (let v = 0; v < nv; v++) if (!onBorder[v]) for (let k = 0; k < 3; k++) positions[v * 3 + k] += vn[v * 3 + k] * layer[i] * STEP;
      m.geometry = [{positions, indices: g.indices}];
    });
    lungMarkLayers = Object.fromEntries(marks.map((m, i) => [m.name, layer[i]]));
  }
  // Data cards by type of structure (see lung-cards.mjs): the fields of the impressions, hilum, lobe parts and other structures differ.
  for (const s of [...out, ...late]) { const c = lungCard(s.name); if (c) s.card = c; }
  // A surface patch lies 0.4 to 1.3 mm above the lobe: the build may remove flat interior triangles but must not move the patch down into the lobe (that would show the lobe through the colour), so a small error and a high triangle cap.
  for (const s of [...out, ...late]) if (s.kind === 'surface') { s.cap = 2500; s.error = .0008; }
  return part === 'late' ? late : out;
}
