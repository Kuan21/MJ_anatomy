// Thoracic and abdominal-wall nerves the atlas lacks (phrenic, recurrent laryngeal, splanchnic nerves and their ganglia, vagal trunks, oesophageal plexus,
// intercostobrachial): textbook courses on landmarks measured on the atlas meshes.
import {sub, add, mul, unit, len, lerp, cross} from '../lib/paokao-util.mjs';

const GRAYS = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.): ch. 3 Thorax, ch. 4 Abdomen, ch. 7 Upper Limb';
const SIDES = [{w: 'Right', l: 'right', sx: -1, zh: '右', s: 'r'}, {w: 'Left', l: 'left', sx: 1, zh: '左', s: 'l'}];

export default function thoraxNerves(U) {
  const out = [], P = (x, y, z) => [x, y, z];
  const axis = (name, y, near) => U.axisAt(name, y, near, .002);
  for (const S of SIDES) {
    const trunk = `Sympathetic trunk.${S.s}`;
    // ---- Phrenic nerve: C3–C5, down the front of scalenus anterior, between the subclavian artery and vein, then on the pericardium to the diaphragm.
    {
      const scal = `${S.w} scalenus anterior`, peri = 'Fibrous pericardium';
      const a = U.onSurface(scal, P(S.sx * .040, 1.495, .004), .0012), b = U.onSurface(scal, P(S.sx * .030, 1.452, .006), .0012);
      const bcv = axis(`${S.w} brachiocephalic vein`, 1.402, P(S.sx * .02, 1.4, .02)), c = add(bcv, P(S.sx * .0075, 0, -.004));
      const pts = [a, b, c];
      for (const [y, dz] of [[1.372, 0], [1.336, 0], [1.300, 0], [1.268, 0]]) pts.push(U.onSurface(peri, P(S.sx * .085, y, .035 + dz), .0022));
      pts.push(U.onSurface('Diaphragm', P(S.sx * .05, 1.262, .018), .0010));
      out.push({
        name: `${S.w} phrenic nerve`, zh: `${S.zh}膈神經`, system: 'nervous', kind: 'nerve',
        tubes: [{pts, r: [.0013, .0011], samples: 44}],
        card: {origin: ['Ventral rami of C3–C5 (mainly C4), cervical plexus', '第三至第五頸神經前支（以 C4 為主），頸神經叢'],
          course: ['Descends on the front of scalenus anterior, passes between the subclavian artery and vein, then runs on the fibrous pericardium (with the pericardiophrenic vessels) to the diaphragm', '沿前斜角肌前面下行，經鎖骨下動脈與鎖骨下靜脈之間，再與心包膈血管一起沿纖維心包到橫膈'],
          supply: ['Motor to the diaphragm; sensory to the pleura, pericardium and peritoneum over the diaphragm', '支配橫膈運動；感覺分布於橫膈的胸膜、心包與腹膜']},
        refs: [GRAYS],
      });
    }
    // ---- Pericardiophrenic artery and vein: from the internal thoracic vessels down the pericardium beside the phrenic nerve.
    for (const kind of ['artery', 'vein']) {
      const src = U.pick(`${S.w} internal thoracic ${kind}`, `${S.w} brachiocephalic vein`), peri = 'Fibrous pericardium', off = kind === 'artery' ? .0036 : .0046, sh = kind === 'artery' ? 0 : .003;
      const o = axis(src, src.includes('brachio') ? 1.395 : 1.378, P(S.sx * .025, 1.378, .03));
      const pts = [o];
      for (const y of [1.356, 1.322, 1.288, 1.262]) pts.push(U.onSurface(peri, P(S.sx * .085, y, .034 + sh), off));
      pts.push(U.onSurface('Diaphragm', P(S.sx * .052, 1.262, .016 + sh), .0008));
      out.push({
        name: `${S.w} pericardiophrenic ${kind}`, zh: `${S.zh}心包膈${kind === 'artery' ? '動脈' : '靜脈'}`, system: kind === 'artery' ? 'arterial' : 'venous', kind, parent: src,
        tubes: [{pts, r: kind === 'artery' ? [.0009, .0006] : [.0011, .0007], samples: 40}],
        card: {origin: [`Internal thoracic ${kind}`, kind === 'artery' ? '內胸動脈' : '內胸靜脈'],
          course: ['Descends with the phrenic nerve between the fibrous pericardium and the mediastinal pleura to the diaphragm', '與膈神經一起在纖維心包與縱隔胸膜之間下行到橫膈'],
          supply: ['Pericardium, pleura and the upper surface of the diaphragm', '心包、胸膜與橫膈上面']},
        refs: [GRAYS],
      });
    }
    // ---- Recurrent laryngeal nerve: right loops under the subclavian artery, left under the aortic arch beside the ligamentum arteriosum; both climb in the tracheo-oesophageal groove.
    {
      const vag = `Vagus nerve (X).${S.s}`, trach = 'Trachea';
      const o = S.s === 'r' ? axis(vag, 1.418, P(S.sx * .017, 1.418, 0)) : axis(vag, 1.36, P(S.sx * .015, 1.36, -.02));
      const loop = S.s === 'r' ? add(axis('Right subclavian artery', 1.412, P(-.05, 1.412, 0)), P(.0, -.012, -.004)) : add(U.cen('Arch of aorta', P(.02, 1.36, -.01), .006), P(-.004, -.012, -.006));
      const g = y => { const c = axis(trach, y, P(0, y, -.01)); return add(c, P(S.sx * .0135, 0, -.0015)); };
      const pts = [o, loop, g(1.385), g(1.420), g(1.450), add(U.extreme('Cricoid cartilage', P(S.sx * -1, 0, 0)), P(S.sx * .0035, -.002, -.0005))];
      out.push({
        name: `${S.w} recurrent laryngeal nerve`, zh: `${S.zh}喉返神經`, system: 'nervous', kind: 'nerve', parent: vag,
        tubes: [{pts, r: [.0010, .0007], samples: 44}],
        card: {origin: [`Vagus nerve (${S.s === 'r' ? 'at the level of the right subclavian artery' : 'at the aortic arch, beside the ligamentum arteriosum'})`, `迷走神經（${S.s === 'r' ? '在右鎖骨下動脈高度' : '在主動脈弓、動脈韌帶旁'}）`],
          course: [`${S.s === 'r' ? 'Hooks round the right subclavian artery' : 'Hooks round the aortic arch'} and ascends in the groove between the trachea and oesophagus to the larynx`, `${S.s === 'r' ? '繞過右鎖骨下動脈' : '繞過主動脈弓'}，在氣管與食道之間的溝內上行到喉`],
          supply: ['Motor to all intrinsic laryngeal muscles except cricothyroid; sensory below the vocal folds', '支配除環甲肌以外的所有喉內肌；聲帶以下黏膜感覺']},
        refs: [GRAYS],
      });
    }
    // ---- Splanchnic nerves and the ganglia they end in.
    {
      const vert = n => U.extreme(n, P(0, 0, 1), {x: [-.02, .02]});
      const bodyZ = y => (y > 1.2 ? vert('Eleventh thoracic vertebra')[2] : vert('Twelfth thoracic vertebra')[2]) - .003;
      const celiac = axis('Celiac artery', 1.160, P(.006, 1.16, .02)), sma = axis('Superior mesenteric artery', 1.128, P(0, 1.128, .03)), renal = axis(`${S.w} renal artery`, 1.114, P(S.sx * .02, 1.115, .005));
      const gCeliac = add(celiac, P(S.sx * .0115, .001, -.003)), gAort = add(renal, P(S.sx * -.021, .008, .012)), gSma = add(sma, P(S.sx * .0065, .004, -.004)), gRenal = add(renal, P(S.sx * .016, .0, .0));
      const at = (y) => { const t = axis(trunk, y, P(S.sx * .016, y, -.05)); return t; };
      const greater = [at(1.292), add(at(1.250), P(S.sx * -.003, 0, .006)), P(S.sx * .0155, 1.205, bodyZ(1.2)), P(S.sx * .0140, 1.180, bodyZ(1.2) + .003), gCeliac];
      const lesser = [at(1.215), add(at(1.190), P(S.sx * -.003, 0, .006)), P(S.sx * .0150, 1.165, bodyZ(1.16)), P(S.sx * .0150, 1.140, bodyZ(1.16) + .004), gAort];
      const least = [at(1.165), P(S.sx * .0165, 1.150, bodyZ(1.15)), P(S.sx * .0210, 1.133, bodyZ(1.15) + .006), gRenal];
      const base = (nm, zh, en_origin, zh_origin, pts, ganglion) => out.push({
        name: `${S.w} ${nm}`, zh: `${S.zh}${zh}`, system: 'nervous', kind: 'nerve', parent: trunk,
        tubes: [{pts, r: [.0009, .0007], samples: 30}],
        card: {origin: [en_origin, zh_origin], course: [`Runs down the side of the vertebral bodies, pierces the crus of the diaphragm and ends in the ${ganglion[0]}`, `沿椎體側面下行，穿過橫膈腳，終於${ganglion[1]}`],
          supply: ['Preganglionic sympathetic fibres to the abdominal viscera', '腹腔內臟的交感神經節前纖維']}, refs: [GRAYS]});
      base('greater splanchnic nerve', '大內臟神經', 'Thoracic sympathetic trunk, ganglia T5–T9', '胸交感幹第五至第九胸節', greater, ['coeliac ganglion', '腹腔神經節']);
      base('lesser splanchnic nerve', '小內臟神經', 'Thoracic sympathetic trunk, ganglia T10–T11', '胸交感幹第十至第十一胸節', lesser, ['aorticorenal ganglion', '主動脈腎神經節']);
      base('least splanchnic nerve', '最小內臟神經', 'Thoracic sympathetic trunk, ganglion T12', '胸交感幹第十二胸節', least, ['renal plexus (renal ganglion)', '腎神經叢（腎神經節）']);
      const gang = (nm, zh, c, ax) => out.push({
        name: `${S.w} ${nm}`, zh: `${S.zh}${zh}`, system: 'nervous', kind: 'ganglion',
        geometry: [U.ellipsoid(c, ax[0], ax[1], ax[2])],
        card: {origin: ['Prevertebral sympathetic ganglion on the aorta', '主動脈旁的椎前交感神經節'], course: [`Lies at the origin of the ${ax[3]}`, `位於${ax[4]}起始處`], supply: ['Relay for splanchnic nerve fibres to the abdominal viscera', '內臟神經纖維換元後分布到腹腔內臟']}, refs: [GRAYS]});
      gang('celiac ganglion', '腹腔神經節', gCeliac, [.0058, .0042, .0034, 'coeliac trunk', '腹腔動脈']);
      gang('aorticorenal ganglion', '主動脈腎神經節', gAort, [.0045, .0035, .0030, 'renal artery', '腎動脈']);
      gang('superior mesenteric ganglion', '腸繫膜上神經節', gSma, [.0040, .0032, .0028, 'superior mesenteric artery', '腸繫膜上動脈']);
      gang('renal ganglion', '腎神經節', gRenal, [.0035, .0028, .0026, 'renal artery near the renal hilum', '腎動脈靠近腎門處']);
    }
  }
  // ---- Vagal trunks on the oesophagus (the vagus nerves meet in the oesophageal plexus and re-form as an anterior and a posterior trunk) and the plexus itself.
  {
    const ys = [1.300, 1.272, 1.246, 1.226, 1.208, 1.198];
    const c = ys.map(y => axis('Esophagus', y, P(0, y, -.02)));
    const R = .0108, ring = (cc, ang, r = R) => add(cc, P(Math.sin(ang) * r, 0, Math.cos(ang) * r));
    const trunk = ang => c.map((cc, i) => ring(cc, ang + (i > 1 ? 0 : .0)));
    out.push({
      name: 'Anterior vagal trunk', zh: '迷走神經前幹', system: 'nervous', kind: 'nerve',
      tubes: [{pts: trunk(0).slice(1), r: [.0012, .0010], samples: 28}],
      card: {origin: ['Left vagus nerve, mainly, after the oesophageal plexus', '主要來自左側迷走神經，經食道神經叢重組'], course: ['Runs on the front of the oesophagus through the oesophageal hiatus to the stomach', '沿食道前面下行，經食道裂孔到胃'], supply: ['Stomach, liver and biliary tract (anterior gastric and hepatic branches)', '胃、肝與膽道（前胃支與肝支）']}, refs: [GRAYS]});
    out.push({
      name: 'Posterior vagal trunk', zh: '迷走神經後幹', system: 'nervous', kind: 'nerve',
      tubes: [{pts: trunk(Math.PI).slice(1), r: [.0012, .0010], samples: 28}],
      card: {origin: ['Right vagus nerve, mainly, after the oesophageal plexus', '主要來自右側迷走神經，經食道神經叢重組'], course: ['Runs on the back of the oesophagus through the oesophageal hiatus to the abdomen', '沿食道後面下行，經食道裂孔入腹腔'], supply: ['Stomach (posterior gastric branches) and the coeliac plexus (coeliac branches)', '胃（後胃支）與腹腔神經叢（腹腔支）']}, refs: [GRAYS]});
    // plexus: three interlacing strands wound round the lower oesophagus
    const strand = (phase, turns) => c.map((cc, i) => ring(cc, phase + (i / (c.length - 1)) * turns, R * 1.02));
    out.push({
      name: 'Esophageal plexus', zh: '食道神經叢', system: 'nervous', kind: 'plexus',
      tubes: [{pts: strand(.4, 2.2), r: [.0006, .0005], samples: 48}, {pts: strand(2.5, -2.0), r: [.0006, .0005], samples: 48}, {pts: strand(4.5, 1.7), r: [.0006, .0005], samples: 48}],
      card: {origin: ['Vagus nerves (both) and sympathetic fibres from the thoracic trunk', '左右迷走神經與胸交感幹的交感纖維'], course: ['A network wound round the lower oesophagus; it re-forms into the anterior and posterior vagal trunks', '纏繞食道下段的網狀神經叢，再組成迷走神經前幹與後幹'], supply: ['Oesophagus (smooth-muscle motility and secretion)', '食道（平滑肌蠕動與分泌）']}, refs: [GRAYS]});
  }
  return out;
}
