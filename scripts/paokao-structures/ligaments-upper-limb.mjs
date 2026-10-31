// Ligaments of the shoulder girdle that the atlas lacks or drew crudely, built as flat bands with thickness between landmarks measured on the bone meshes of this atlas
// (procedural; no third-party geometry). They are schematic: the attachment points are measured, the width and thickness are typical values.
import {add, mul, lerp, sub, unit, len} from '../lib/paokao-util.mjs';

const REF = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.); Moore’s Clinically Oriented Anatomy, 8th ed.';
const SIDES = [{w: 'Right', l: 'right', sx: -1, zh: '右'}, {w: 'Left', l: 'left', sx: 1, zh: '左'}];
const MODEL = ['Schematic band between measured bony attachment points; width and thickness are typical values.', '示意帶：兩端落在實測的骨性附著點，寬度與厚度為典型值。'];

export default function ligamentsUpperLimb(U) {
  const out = [], P = (x, y, z) => [x, y, z];
  for (const S of SIDES) {
    const sx = S.sx, X = (a, b) => sx < 0 ? [-b, -a] : [a, b], D = (x, y, z) => P(sx, y, z);
    const sc = `${S.w} scapula`, cl = `${S.w} clavicle`, rib = `${S.w} first rib`;
    const push = (name, zh, geometry, card) => out.push({name: `${S.w} ${name}`, zh: `${S.zh}${zh}`, system: 'connective', kind: 'ligament', model: 'procedural', cap: 1e9, geometry: [geometry], card: {...card, supply: card.action}, note: MODEL, refs: [REF], binding: {name: `${S.w} ${name}`, side: S.l, profile: 'shoulderJoint'}});
    const band = (pts, width, thick, hint) => U.ribbon(pts, width, thick, hint ?? P(0, 1, 0), 24);
    // Coraco-acromial ligament: from the lateral border of the coracoid process to the tip of the acromion; with them it forms the arch over the head of the humerus.
    {
      const a = add(U.extreme(sc, P(0, 0, 1), {x: X(.12, .14), y: [1.395, 1.415]}), P(0, .0015, 0)), b = add(U.extreme(sc, P(0, 0, 1), {x: X(.14, .17), y: [1.39, 1.44]}), P(0, .0015, 0));
      const m = add(lerp(a, b, .5), P(0, .004, .001));
      push('coraco-acromial ligament', '喙肩韌帶', band([a, lerp(a, m, .5), m, lerp(m, b, .5), b], .011, .0016),
        {origin: ['Lateral border of the coracoid process', '喙突外側緣'], course: ['A triangular band that runs up and back to the tip of the acromion; with the two processes it forms the coraco-acromial arch over the head of the humerus and the supraspinatus tendon', '三角形的帶，向上、向後連到肩峰尖端；與兩個突起一起形成覆在肱骨頭與棘上肌腱上方的喙肩弓'], insertion: ['Tip of the acromion', '肩峰尖端'], action: ['Roofs the subacromial space and stops the head of the humerus from moving upwards', '構成肩峰下間隙的頂，防止肱骨頭向上移位']});
    }
    // Costoclavicular ligament: from the first rib and its cartilage up to the costal tuberosity on the underside of the medial end of the clavicle.
    {
      const a = U.onSurface(rib, U.extreme(rib, P(0, 0, 1), {x: X(.02, .045)}), .0008), b = U.onSurface(cl, U.extreme(cl, P(0, -1, 0), {x: X(.022, .04)}), .0008), m = add(lerp(a, b, .5), P(0, 0, -.001));
      push('costoclavicular ligament', '肋鎖韌帶', band([a, m, b], .012, .003, P(0, 0, 1)),
        {origin: ['Upper surface of the first rib and its costal cartilage', '第一肋與其肋軟骨的上面'], course: ['A short strong band that runs up and slightly back to the underside of the clavicle', '短而強的帶，向上並稍向後連到鎖骨下面'], insertion: ['Costal tuberosity on the underside of the medial end of the clavicle', '鎖骨內側端下面的肋鎖韌帶壓跡（肋骨粗隆）'], action: ['Limits elevation of the clavicle at the sternoclavicular joint and anchors it to the first rib', '限制鎖骨在胸鎖關節的上提，並把鎖骨固定在第一肋']});
    }
    // Superior transverse scapular ligament: roofs the suprascapular notch (the nerve passes under it, the artery over it).
    {
      const rim = (x0, x1) => U.extreme(sc, P(0, 1, 0), {x: X(x0, x1), y: [1.395, 1.44]});
      const a = add(rim(.086, .093), P(0, .0012, 0)), b = add(rim(.106, .112), P(0, .0012, 0)), m = add(lerp(a, b, .5), P(0, .0015, .0005));
      push('superior transverse scapular ligament', '肩胛上橫韌帶', band([a, lerp(a, m, .5), m, lerp(m, b, .5), b], .0045, .0013, P(0, 0, 1)),
        {origin: ['Medial edge of the suprascapular notch', '肩胛上切跡的內緣'], course: ['A thin flat band across the notch; the suprascapular artery runs over it and the suprascapular nerve under it', '橫跨切跡的薄扁帶；肩胛上動脈從它上方通過，肩胛上神經從它下方通過'], insertion: ['Base of the coracoid process', '喙突基部'], action: ['Converts the notch into a foramen for the suprascapular nerve', '把切跡封成孔，讓肩胛上神經通過']});
    }
    // Inferior transverse scapular (spinoglenoid) ligament: from the lateral border of the spine of the scapula to the posterior rim of the glenoid cavity.
    {
      const a = U.onSurface(sc, U.extreme(sc, D(-1, 0, -1), {y: [1.385, 1.41], z: [-.07, -.02]}), .0008), b = U.onSurface(sc, U.extreme(sc, P(0, 0, -1), {x: X(.135, .16), y: [1.33, 1.385]}), .0008), m = add(lerp(a, b, .5), P(sx * -.002, 0, -.003));
      push('inferior transverse scapular ligament', '肩胛下橫韌帶', band([a, m, b], .006, .0012, P(0, 1, 0)),
        {origin: ['Lateral border of the spine of the scapula', '肩胛棘外側緣'], course: ['A thin band across the spinoglenoid notch, under the infraspinatus muscle; the suprascapular nerve and vessels pass under it', '橫跨棘盂切跡的薄帶，位於棘下肌深面；肩胛上神經與血管從它下方通過'], insertion: ['Posterior margin of the glenoid cavity', '關節盂後緣'], action: ['Roofs the spinoglenoid notch', '構成棘盂切跡的頂']});
    }
  }
  return out;
}
