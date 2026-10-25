// Bone landmarks named in the notes, marked as thin patches lifted 0.3 mm off the bone they belong to (so they can be searched, picked and quizzed), and the lung surface
// features (fissures, lingula, cardiac notch, impressions and grooves left by neighbouring structures), marked on the lung lobes the same way.
import {sub, add, mul, unit, len, lerp} from '../lib/paokao-util.mjs';

const MOORE = 'Moore’s Clinically Oriented Anatomy, 8th ed.; Gray’s Anatomy for Students, 4th ed. (Drake et al.)';
const SIDES = [{w: 'Right', l: 'right', sx: -1, zh: '右', s: 'r'}, {w: 'Left', l: 'left', sx: 1, zh: '左', s: 'l'}];

export default function landmarks(U) {
  const out = [], P = (x, y, z) => [x, y, z];
  const mark = (S, name, zh, bone, geometry, where, role, extra = {}) => {
    if (!geometry.indices.length) throw new Error(`landmark ${name}: empty patch on ${bone}`);
    out.push({name: S ? `${S.w} ${name}` : name, zh: `${S ? S.zh : ''}${zh}`, system: 'skeletal', kind: 'landmark', parent: bone, geometry: [geometry],
      card: {origin: [`On the ${bone.replace(/^(Right|Left) /, '').toLowerCase()}`, extra.zhBone ?? ''], course: [where[0], where[1]], supply: [role[0], role[1]]}, refs: [MOORE], ...extra.spec});
  };
  const disc = (bone, c, r) => U.surfacePatch(bone, c, r, .0004);
  for (const S of SIDES) {
    const hum = `${S.w} humerus`, sc = `${S.w} scapula`, rad = `${S.w} radius`, hip = `${S.w} hip bone`, tib = `${S.w} tibia`, side = S.sx;
    // ---- Humerus
    const gt = U.extreme(hum, P(side, .5, -.15), {y: [1.375, 1.42]}), lt = U.extreme(hum, P(-side * .35, .1, 1), {y: [1.375, 1.415]});
    mark(S, 'greater tubercle of humerus', '肱骨大結節', hum, disc(hum, gt, .0085), ['Lateral, at the upper end of the humerus below the head; carries the supraspinatus, infraspinatus and teres minor attachments', '位於肱骨上端、肱骨頭外下方；供棘上肌、棘下肌與小圓肌附著'], ['Insertion of three rotator cuff muscles', '三條旋轉肌袖肌肉的止點'], {zhBone: '肱骨'});
    mark(S, 'lesser tubercle of humerus', '肱骨小結節', hum, disc(hum, lt, .0065), ['Anterior, medial to the greater tubercle; carries the subscapularis tendon', '位於前方、大結節內側；供肩胛下肌腱附著'], ['Insertion of subscapularis', '肩胛下肌的止點'], {zhBone: '肱骨'});
    const groove = [lerp(gt, lt, .5), add(lerp(gt, lt, .5), P(0, -.014, .001)), add(lerp(gt, lt, .5), P(0, -.030, .002))].map(p => U.onSurface(hum, p, 0));
    mark(S, 'intertubercular groove', '結節間溝', hum, U.patchWhere(hum, U.nearPolyline(groove, .0045), .0004, U.nearPolyline(groove, .010), .0012), ['Between the greater and lesser tubercles on the front of the humerus; also called the bicipital groove', '位於肱骨前面大、小結節之間；又稱二頭肌溝'], ['Holds the tendon of the long head of biceps brachii', '容納肱二頭肌長頭肌腱'], {zhBone: '肱骨'});
    mark(S, 'surgical neck of humerus', '肱骨外科頸', hum, U.patchWhere(hum, tr => tr.mid[1] > 1.340 && tr.mid[1] < 1.356, .0004, p => p[1] > 1.335 && p[1] < 1.361, .0015), ['Narrowing just below the tubercles, where fractures are common', '結節下方的縮窄處，是常見骨折部位'], ['Axillary nerve and the posterior circumflex humeral vessels wind round it', '腋神經與旋肱後血管繞過此處'], {zhBone: '肱骨'});
    const rn = `Radial nerve.${S.s}`, groovePts = [1.335, 1.300, 1.265, 1.230, 1.200].map(y => U.axisAt(rn, y, null, .003));
    mark(S, 'radial groove', '橈神經溝', hum, U.patchWhere(hum, U.nearPolyline(groovePts, .0050), .0004, U.nearPolyline(groovePts, .011), .0013), ['A spiral groove running obliquely on the back of the humeral shaft, from medial above to lateral below', '在肱骨幹後面斜行的螺旋溝，由上內側走向下外側'], ['Carries the radial nerve and the deep brachial artery', '容納橈神經與肱深動脈'], {zhBone: '肱骨'});
    const me = U.extreme(hum, P(-side, -.25, 0), {y: [1.105, 1.150]});
    mark(S, 'medial epicondyle of humerus', '肱骨內上髁', hum, disc(hum, me, .0085), ['Prominent bump on the medial side of the lower end of the humerus', '肱骨下端內側的明顯隆起'], ['Common flexor origin; the ulnar nerve passes behind it', '屈肌總起點；尺神經經其後方'], {zhBone: '肱骨'});
    // ---- Scapula
    const cor = U.extreme(sc, P(side * .45, .25, 1), {y: [1.375, 1.43]}), notchC = U.extreme(sc, P(-side * .2, 1, .15), {x: side < 0 ? [-.115, -.075] : [.075, .115], y: [1.395, 1.44]});
    mark(S, 'coracoid process', '喙突', sc, disc(sc, cor, .0090), ['Hook-shaped projection from the upper border of the scapula, pointing forwards and laterally', '肩胛骨上緣向前外方的鉤狀突起'], ['Origin of coracobrachialis and the short head of biceps; insertion of pectoralis minor', '喙肱肌與肱二頭肌短頭的起點；胸小肌的止點'], {zhBone: '肩胛骨'});
    mark(S, 'suprascapular notch', '肩胛上切跡', sc, disc(sc, notchC, .0055), ['A notch in the upper border of the scapula, medial to the base of the coracoid process, bridged by the superior transverse scapular ligament', '肩胛骨上緣、喙突基部內側的切跡，上方由肩胛上橫韌帶橫跨'], ['The suprascapular nerve passes through it; the suprascapular artery runs above the ligament', '肩胛上神經由此通過；肩胛上動脈走在韌帶上方'], {zhBone: '肩胛骨'});
    const igt = U.extreme(sc, P(side * .55, -1, .35), {y: [1.30, 1.37]});
    mark(S, 'infraglenoid tubercle', '盂下結節', sc, disc(sc, igt, .0055), ['Rough area just below the glenoid cavity', '關節盂正下方的粗糙面'], ['Origin of the long head of triceps brachii', '肱三頭肌長頭的起點'], {zhBone: '肩胛骨'});
    const spineY = 1.392;
    mark(S, 'infraspinous fossa', '棘下窩', sc, U.patchWhere(sc, tr => tr.n[2] < -.45 && tr.mid[1] < spineY - .006 && tr.mid[1] > 1.285 && Math.abs(tr.mid[0]) > .074 && Math.abs(tr.mid[0]) < .150, .0003, p => p[1] < spineY && p[1] > 1.28, .003), ['The large hollow below the spine of the scapula on its back surface', '肩胛骨後面、肩胛棘下方的大凹窩'], ['Origin of infraspinatus; the suprascapular vessels and nerve supply it', '棘下肌的起點；由肩胛上血管與神經供應'], {zhBone: '肩胛骨'});
    // ---- Radius, ilium, pubis, ischium, tibia
    mark(S, 'styloid process of radius', '橈骨莖突', rad, disc(rad, U.extreme(rad, P(side, -.8, .1), {y: [.88, .93]}), .0070), ['Pointed lateral projection at the lower end of the radius', '橈骨下端外側的尖突'], ['Insertion of brachioradialis; the radial collateral ligament of the wrist attaches here', '肱橈肌的止點；腕橈側副韌帶附著於此'], {zhBone: '橈骨'});
    const top = U.mesh(hip).hi[1];
    mark(S, 'iliac crest', '髂嵴', hip, U.patchWhere(hip, tr => tr.mid[1] > top - .0105 && tr.n[1] > -.2, .0003, p => p[1] > top - .016, .002), ['The curved upper border of the ilium, from the anterior to the posterior superior iliac spine', '髂骨彎曲的上緣，由髂前上棘延伸到髂後上棘'], ['Attachment of the abdominal wall muscles, latissimus dorsi and the fascia lata', '腹壁肌肉、背闊肌與闊筋膜的附著處'], {zhBone: '髖骨'});
    mark(S, 'pubic tubercle', '恥骨結節', hip, disc(hip, U.extreme(hip, P(-side * .55, .35, 1), {y: [.84, .92]}), .0055), ['A small rounded projection on the upper border of the pubis, about 2 cm from the symphysis', '恥骨上緣、距恥骨聯合約 2 公分的小圓突'], ['Medial attachment of the inguinal ligament', '腹股溝韌帶的內側附著點'], {zhBone: '髖骨'});
    mark(S, 'ischial tuberosity', '坐骨結節', hip, disc(hip, U.extreme(hip, P(0, -1, -.35), {y: [.82, .90]}), .0120), ['Thick roughened lower part of the ischium that bears the weight in sitting', '坐骨下方粗糙肥厚、坐姿時承重的部分'], ['Origin of the hamstrings; sacrotuberous ligament attaches here', '膕繩肌的起點；薦結節韌帶附著於此'], {zhBone: '髖骨'});
    mark(S, 'spine of ischium', '坐骨棘', hip, disc(hip, U.extreme(hip, P(-side * .25, -.1, -1), {y: [.90, .97], x: side < 0 ? [-.1, -.03] : [.03, .1]}), .0055), ['Pointed projection from the back of the ischium between the greater and lesser sciatic notches', '坐骨後緣、坐骨大切跡與小切跡之間的尖突'], ['Attachment of the sacrospinous ligament; the pudendal nerve and internal pudendal vessels wind round it', '薦棘韌帶的附著處；陰部神經與陰部內血管繞過此處'], {zhBone: '髖骨'});
    mark(S, 'tibial tuberosity', '脛骨粗隆', tib, disc(tib, U.extreme(tib, P(0, .3, 1), {y: [.375, .445]}), .0100), ['Rough elevation on the front of the upper tibia', '脛骨上端前面的粗糙隆起'], ['Insertion of the patellar ligament', '髕韌帶的止點'], {zhBone: '脛骨'});
  }
  // ---- Skull and cervical vertebrae (single bones)
  const occ = 'Occipital bone', atlas = 'Atlas', axis = 'Axis';
  {
    const temporal = 'Right temporal bone', mast = U.extreme(temporal, P(.2, -1, -.35), {z: [-.12, -.03]});
    out.push({name: 'Mastoid process', zh: '乳突', system: 'skeletal', kind: 'landmark', parent: temporal, geometry: [disc(temporal, mast, .0100)],
      card: {origin: ['On the temporal bone, behind the ear', '顳骨上，耳後方'], course: ['A conical projection behind the external acoustic meatus', '外耳道後方的圓錐形突起'], supply: ['Attachment of sternocleidomastoid, splenius capitis and longissimus capitis', '胸鎖乳突肌、頭夾肌與頭最長肌的附著處']}, refs: [MOORE]});
    const jv = U.tipNear('Right internal jugular vein', P(-.03, 1.54, -.03), .006), jf = U.onSurface(occ, jv, 0);
    out.push({name: 'Jugular foramen', zh: '頸靜脈孔', system: 'skeletal', kind: 'landmark', parent: occ, geometry: [disc(occ, jf, .0070)],
      card: {origin: ['Skull base, between the petrous part of the temporal bone and the occipital bone', '顱底，顳骨岩部與枕骨之間'], course: ['Large opening behind the carotid canal', '頸動脈管後方的大孔'], supply: ['Transmits the internal jugular vein and cranial nerves IX, X and XI', '通過內頸靜脈與第九、十、十一對腦神經']}, refs: [MOORE]});
    const nuchal = [-.062, -.040, -.020, 0, .020, .040, .062].map(x => { const y = 1.592 - Math.abs(x) * .22 + (Math.abs(x) < .02 ? .008 : 0); return U.onSurface(occ, P(x, y, -.118), 0); });
    out.push({name: 'Superior nuchal line', zh: '上項線', system: 'skeletal', kind: 'landmark', parent: occ, geometry: [U.patchWhere(occ, U.nearPolyline(nuchal, .0040), .0004, U.nearPolyline(nuchal, .010), .0012)],
      card: {origin: ['Back of the occipital bone', '枕骨後面'], course: ['A curved ridge running laterally from the external occipital protuberance', '由枕外隆凸向兩側延伸的弧形骨嵴'], supply: ['Attachment of trapezius, sternocleidomastoid, splenius capitis and semispinalis capitis', '斜方肌、胸鎖乳突肌、頭夾肌與頭半棘肌的附著處']}, refs: [MOORE]});
    const am = U.mesh(atlas), acz = (am.lo[2] + am.hi[2]) / 2;
    out.push({name: 'Posterior arch of atlas', zh: '寰椎後弓', system: 'skeletal', kind: 'landmark', parent: atlas, geometry: [U.patchWhere(atlas, tr => tr.mid[2] < acz - .0125 && Math.abs(tr.mid[0]) < .028, .0004, p => p[2] < acz - .008, .0015)],
      card: {origin: ['Atlas (C1)', '寰椎（C1）'], course: ['The curved bar of bone closing the vertebral foramen of the atlas at the back', '在後方封閉寰椎椎孔的弧形骨條'], supply: ['The vertebral artery lies in a groove on its upper surface; rectus capitis posterior minor attaches to its posterior tubercle', '椎動脈位於其上面的溝內；頭後小直肌附著於後結節']}, refs: [MOORE]});
    out.push({name: 'Spinous process of axis', zh: '樞椎棘突', system: 'skeletal', kind: 'landmark', parent: axis, geometry: [disc(axis, U.extreme(axis, P(0, 0, -1)), .0090)],
      card: {origin: ['Axis (C2)', '樞椎（C2）'], course: ['Large bifid spinous process, the first palpable spinous process below the skull', '粗大的分叉棘突，是顱骨下方第一個可摸到的棘突'], supply: ['Attachment of obliquus capitis inferior, rectus capitis posterior major and semispinalis cervicis', '頭下斜肌、頭後大直肌與頸半棘肌的附著處']}, refs: [MOORE]});
  }
  return out;
}
