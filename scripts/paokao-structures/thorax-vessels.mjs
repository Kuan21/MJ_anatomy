// Thoracic-wall and axillary vessels the atlas lacks (checked against BodyParts3D 4.0 and the Z-Anatomy cardiovascular export): each tube leaves its parent
// vessel at the textbook place and follows the textbook course. Landmarks are measured on the atlas meshes; refs name the textbooks used.
import {sub, add, mul, unit, len, lerp} from '../lib/paokao-util.mjs';

const GRAYS = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.), ch. 3 Thorax and ch. 7 Upper Limb';
const SIDES = [{w: 'Right', l: 'right', sx: -1, zh: '右'}, {w: 'Left', l: 'left', sx: 1, zh: '左'}];

export default function thoraxVessels(U) {
  const out = [];
  /** Outer (anterior) surface of the ribs and costal cartilages of one side near (x, y): the chest wall the vessels lie on. */
  const wallNames = S => ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'].flatMap(o => [`${S.w} ${o} rib`, `${S.w} ${o} costal cartilage`]).filter(n => U.has(n));
  const wall = (S, p, off = 0) => {
    let best = null, bd = Infinity;
    for (const n of wallNames(S)) { const q = U.onSurface(n, p, off), d = len(sub(q, p)); if (d < bd) { bd = d; best = q; } }
    return best;
  };
  for (const S of SIDES) {
    const ax = `${S.w} axillary artery`, ita = `${S.w} internal thoracic artery`, itv = `${S.w} internal thoracic vein`;
    const trunk = `Trunk of ${S.l} thoraco-acromial artery`, lat = `${S.w} lateral thoracic artery`;

    // 1st part of the axillary artery → superior thoracic artery: down the 1st–2nd intercostal spaces on the chest wall.
    {
      const o = U.axisAt(ax, 1.405, [S.sx * .1, 1.405, -.006]), t = wall(S, [S.sx * .066, 1.372, .03], .0015), m = lerp(o, t, .5);
      out.push({
        name: `${S.w} superior thoracic artery`, zh: `${S.zh}胸上動脈`, system: 'arterial', kind: 'artery', parent: ax,
        tubes: [{pts: [o, add(m, [0, 0, .004]), t], r: [.0009, .0005]}],
        card: {origin: ['1st part of the axillary artery, above the upper border of pectoralis minor', '腋動脈第一段（胸小肌上緣以上）'],
          course: ['Runs medially and downwards on the chest wall through the 1st and 2nd intercostal spaces', '沿胸壁向內下行，經第一、二肋間隙'],
          supply: ['Intercostal muscles of the 1st–2nd spaces, pectoral muscles and the upper part of the serratus anterior', '第一、二肋間肌、胸肌及前鋸肌上部']},
        refs: [GRAYS],
      });
    }
    // Thoraco-acromial trunk → clavicular branch: up and medially to subclavius and the clavicle.
    {
      const o = U.axisAt(trunk, 1.403, [S.sx * .095, 1.403, 0]), t = U.onSurface(`${S.w} subclavius`, [S.sx * .075, 1.412, .008], .0008), m = lerp(o, t, .5);
      out.push({
        name: `Clavicular branch of ${S.l} thoraco-acromial artery`, zh: `${S.zh}胸肩峰動脈鎖骨支`, system: 'arterial', kind: 'artery', parent: trunk,
        tubes: [{pts: [o, add(m, [0, .004, .004]), t], r: [.0007, .0004]}],
        card: {origin: ['Thoraco-acromial trunk, at the upper border of pectoralis minor', '胸肩峰動脈幹（胸小肌上緣）'],
          course: ['Passes up and medially, deep to pectoralis major, towards the clavicle', '向內上走，在胸大肌深面往鎖骨'],
          supply: ['Subclavius, the sternoclavicular joint and the clavicle', '鎖骨下肌、胸鎖關節與鎖骨']},
        refs: [GRAYS],
      });
    }
    // Lateral thoracic artery → lateral mammary branches round the lateral border of pectoralis major.
    {
      const o = U.cen(lat, [S.sx * .115, 1.34, .02], .005), mid = wall(S, [S.sx * .108, 1.31, .05], .006), t = wall(S, [S.sx * .08, 1.27, .075], .012);
      out.push({
        name: `${S.w} lateral mammary artery`, zh: `${S.zh}外側乳房動脈`, system: 'arterial', kind: 'artery', parent: lat,
        tubes: [{pts: [o, mid, t], r: [.0007, .0004]}],
        card: {origin: ['Lateral thoracic artery (sometimes the thoraco-acromial artery)', '胸外側動脈（有時來自胸肩峰動脈）'],
          course: ['Curves round the lateral border of pectoralis major to the breast', '繞過胸大肌外側緣到乳房'],
          supply: ['Lateral part of the mammary gland', '乳腺外側部']},
        refs: [GRAYS],
      });
    }
    // Perforating branches of the internal thoracic artery through the 2nd–4th spaces → medial mammary branches.
    {
      const tubes = [1.352, 1.323, 1.295].map((y, i) => {
        const o = U.axisAt(ita, y, [S.sx * .026, y, .06]) ?? U.cen(ita, [S.sx * .026, y, .06]);
        const t = add(wall(S, [o[0] + S.sx * .012, y, o[2]], .012), [S.sx * .006, 0, 0]);
        return {pts: [o, lerp(o, t, .5), t], r: [.0006, .0003]};
      });
      out.push({
        name: `${S.w} medial mammary branches of internal thoracic artery`, zh: `${S.zh}內胸動脈內側乳房支`, system: 'arterial', kind: 'artery', parent: ita, tubes,
        card: {origin: ['Perforating branches of the internal thoracic artery, 2nd–4th intercostal spaces', '內胸動脈穿通支（第二至四肋間隙）'],
          course: ['Pierce the intercostal space and pectoralis major beside the sternum', '在胸骨旁穿過肋間隙與胸大肌'],
          supply: ['Medial part of the mammary gland', '乳腺內側部']},
        refs: [GRAYS],
      });
    }
    // Anterior intercostal arteries: from the internal thoracic artery laterally along the 2nd–6th spaces (they meet the posterior intercostal arteries).
    {
      const tubes = [1.350, 1.323, 1.296, 1.270, 1.246].map(y => {
        const o = U.axisAt(ita, y, [S.sx * .026, y, .06]) ?? U.cen(ita, [S.sx * .026, y, .06]);
        const a = wall(S, [o[0] + S.sx * .018, y - .003, o[2]], .0015), b = wall(S, [o[0] + S.sx * .036, y - .008, o[2] - .004], .0015);
        return {pts: [o, a, b], r: [.0005, .0003]};
      });
      out.push({
        name: `${S.w} anterior intercostal arteries`, zh: `${S.zh}前肋間動脈`, system: 'arterial', kind: 'artery', parent: ita, tubes,
        card: {origin: ['Internal thoracic artery (spaces 1–6) and musculophrenic artery (spaces 7–9)', '內胸動脈（第一至六間隙）與肌膈動脈（第七至九間隙）'],
          course: ['Run laterally in the intercostal spaces and anastomose with the posterior intercostal arteries', '在肋間隙向外側走，與後肋間動脈吻合'],
          supply: ['Intercostal muscles and the overlying skin and pectoral muscles', '肋間肌及其表面的皮膚與胸肌']},
        refs: [GRAYS],
      });
    }
  }
  return out;
}
