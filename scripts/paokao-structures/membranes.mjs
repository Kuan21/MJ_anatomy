// Fasciae, sheaths, retinacula, ligaments, aponeuroses and the other membranous structures named in the notes that the atlas lacks. Bands and ligaments are ribbons between
// landmarks on the bones; fasciae and aponeuroses are thin shells lifted off the muscle surfaces they cover; sheaths are translucent tubes round the vessels they enclose.
import {sub, add, mul, unit, len, lerp, cross} from '../lib/paokao-util.mjs';

const REF = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.); Moore’s Clinically Oriented Anatomy, 8th ed.';
const SIDES = [{w: 'Right', l: 'right', sx: -1, zh: '右', s: 'r'}, {w: 'Left', l: 'left', sx: 1, zh: '左', s: 'l'}];

export default function membranes(U) {
  const out = [], P = (x, y, z) => [x, y, z];
  const push = (S, name, zh, kind, system, spec, where, role, origin = ['', '']) => out.push({name: S ? `${S.w} ${name}` : name, zh: `${S ? S.zh : ''}${zh}`, system, kind, ...spec, card: {origin, course: where, supply: role}, refs: [REF]});
  const lowest = n => U.extreme(n, P(0, -1, 0)), axis = (n, y, near) => U.axisAt(n, y, near, .002);
  for (const S of SIDES) {
    const sx = S.sx;
    // ---- Superior transverse scapular ligament: roofs the suprascapular notch.
    {
      const sc = `${S.w} scapula`, cor = U.extreme(sc, P(sx * .45, .25, 1), {y: [1.375, 1.43]}), notch = U.extreme(sc, P(-sx * .2, 1, .15), {x: sx < 0 ? [-.115, -.075] : [.075, .115], y: [1.395, 1.44]});
      const a = add(notch, P(0, .0015, 0)), b = add(lerp(notch, cor, .9), P(0, .0015, .001));
      push(S, 'superior transverse scapular ligament', '肩胛上橫韌帶', 'ligament', 'connective', {ribbons: [{pts: [a, lerp(a, b, .5), b], width: .004, thick: .0012, hint: P(0, 0, 1)}]},
        ['A thin band across the suprascapular notch, from its medial edge to the base of the coracoid process', '橫跨肩胛上切跡的薄帶，由切跡內緣連到喙突基部'], ['Converts the notch into a foramen: the suprascapular nerve passes below it and the suprascapular artery above it', '把切跡變成孔：肩胛上神經走在其下方，肩胛上動脈走在其上方']);
    }
    // ---- Axillary sheath: fascial tube round the axillary artery, vein and the cords of the brachial plexus.
    {
      const ax = `${S.w} axillary artery`, ys = [1.412, 1.395, 1.375, 1.355, 1.340], pts = ys.map(y => add(axis(ax, y, P(sx * .12, y, -.007)), P(sx * -.001, 0, .001)));
      push(S, 'axillary sheath', '腋鞘', 'sheath', 'connective', {tubes: [{pts, r: [.0125, .0120], samples: 24, sides: 14}]},
        ['A tube of fascia that continues the prevertebral fascia of the neck into the axilla', '頸部椎前筋膜延伸到腋窩所形成的筋膜管'], ['Encloses the axillary artery and vein and the brachial plexus; a local anaesthetic injected into it spreads along the plexus', '包裹腋動脈、腋靜脈與臂神經叢；注入局部麻醉劑可沿神經叢擴散']);
    }
    // ---- Femoral sheath: the 3–4 cm fascial funnel round the femoral vessels below the inguinal ligament.
    {
      const fa = `${S.w} femoral artery`, ys = [.918, .900, .882, .864, .848], c = ys.map(y => axis(fa, y, P(sx * .05, y, .035))), pts = c.map(p => add(p, P(-sx * .008, 0, -.001)));
      push(S, 'femoral sheath', '股鞘', 'sheath', 'connective', {tubes: [{pts, r: [.0160, .0120], samples: 20, sides: 14}]},
        ['A funnel of fascia continuous with the transversalis and iliopsoas fasciae, about 3–4 cm long below the inguinal ligament', '與腹橫筋膜、髂腰筋膜相連的漏斗狀筋膜，在腹股溝韌帶下方約 3–4 公分'], ['Encloses the femoral artery, femoral vein and femoral canal (not the femoral nerve, which lies lateral to it)', '包裹股動脈、股靜脈與股管（股神經位於其外側，不在鞘內）']);
    }
    // ---- Quadriceps tendon and patellar ligament.
    {
      const pat = `${S.w} patella`, rf = `${S.w} rectus femoris`, tib = `${S.w} tibia`, ptop = U.extreme(pat, P(0, 1, .2)), pbot = U.extreme(pat, P(0, -1, .2));
      const rfLow = U.alongMesh(rf, 1, P(0, -1, .5), sx < 0 ? 'x-min' : 'x-min'), top = lowest(rf);
      const tub = U.extreme(tib, P(0, .3, 1), {y: [.375, .445]});
      push(S, 'quadriceps tendon', '股四頭肌腱', 'ligament', 'connective', {ribbons: [{pts: [add(top, P(0, .008, .002)), add(lerp(top, ptop, .5), P(0, 0, .004)), add(ptop, P(0, -.002, .0035))], width: .032, thick: .004, hint: P(0, 0, 1)}]},
        ['The common tendon of the four quadriceps muscles, inserting into the base of the patella', '四條股四頭肌的共同肌腱，止於髕骨底'], ['Extends the knee; a source of tendon grafts and the site of quadriceps tendon rupture', '伸直膝關節；可取作肌腱移植材料，也是股四頭肌腱斷裂的部位']);
      push(S, 'patellar ligament', '髕韌帶', 'ligament', 'connective', {ribbons: [{pts: [add(pbot, P(0, .004, .0035)), add(lerp(pbot, tub, .5), P(0, 0, .0045)), add(tub, P(0, .001, .0035))], width: .026, thick: .004, hint: P(0, 0, 1)}]},
        ['From the apex of the patella to the tibial tuberosity; the continuation of the quadriceps tendon', '從髕骨尖到脛骨粗隆，是股四頭肌腱的延續'], ['Transmits quadriceps force to the tibia (the patellar tendon reflex is tested by tapping it)', '把股四頭肌的力量傳到脛骨（敲擊它可引出髕腱反射）']);
    }
    // ---- Retinacula at the ankle.
    {
      const tib = `${S.w} tibia`, fib = `${S.w} fibula`, calc = `${S.w} calcaneus`, tal = `${S.w} talus`;
      const medM = add(U.extreme(tib, P(-sx, -.8, .1), {y: [.06, .12]}), P(0, 0, 0)), latM = U.extreme(fib, P(sx, -.8, 0)), cal = U.mesh(calc);
      const mx = medM[0], lx = latM[0], legNames = [tib, fib, `${S.w} tibialis anterior`, `${S.w} extensor hallucis longus`, `${S.w} extensor digitorum longus`, `${S.w} fibularis tertius`].filter(U.has);
      // Front surface of everything under the band at (x, y): the band lies 1.2 mm in front of it and turns back to the bone at both ends.
      const frontZ = (x, y) => { let z = -1; for (const n of legNames) { const h = U.rayHit(n, P(x, y, .12), P(0, 0, -1)); if (h) z = Math.max(z, h.point[2]); } return z; };
      const bandFront = (y0, tilt) => {
        const pts = [], N = 8, slab = {y: [y0 - .006, y0 + .006]}, mx = U.extreme(tib, P(-sx, 0, 0), slab)[0] - -sx * -.0015, x1 = U.extreme(fib, P(sx, 0, 0), slab)[0];
        for (let i = 0; i <= N; i++) {
          const t = i / N, x = mx + (x1 - mx) * t, xin = mx + (x1 - mx) * (.04 + .92 * t), z = frontZ(xin, y0 + tilt * t);
          pts.push(P(x, y0 + tilt * t, (z < 0 ? frontZ(mx + (x1 - mx) * .5, y0) : z) + .0012));
        }
        const first = pts[0], last = pts[pts.length - 1];
        return [add(first, P(-sx * .0, 0, -.010)), ...pts, add(last, P(0, 0, -.010))];
      };
      push(S, 'superior extensor retinaculum of foot', '伸肌上支持帶', 'retinaculum', 'connective', {ribbons: [{pts: bandFront(.125, 0), width: .028, thick: .0014, hint: 'vertical'}]},
        ['A transverse band across the lower ends of the tibia and fibula, just above the ankle', '橫跨脛骨與腓骨下端、位於踝關節上方的橫帶'], ['Binds down the tendons of tibialis anterior, extensor hallucis longus, extensor digitorum longus and fibularis tertius', '把脛前肌、伸拇長肌、伸趾長肌與第三腓骨肌的肌腱固定在原位']);
      push(S, 'inferior extensor retinaculum of foot', '伸肌下支持帶', 'retinaculum', 'connective', {ribbons: [{pts: bandFront(.082, -.004), width: .020, thick: .0014, hint: 'vertical'}]},
        ['A Y-shaped band over the front of the ankle and dorsum of the foot, attached laterally to the calcaneus', '位於踝前與足背、外側附著於跟骨的 Y 形帶'], ['Holds the extensor tendons close to the ankle and foot', '把伸肌腱固定在踝與足背']);
      const mm = add(medM, P(-sx * .004, -.002, -.004)), calM = U.extreme(calc, P(-sx, 0, -.3), {y: [.02, .06]});
      push(S, 'flexor retinaculum of ankle', '踝屈肌支持帶', 'retinaculum', 'connective', {ribbons: [{pts: [mm, add(lerp(mm, calM, .5), P(-sx * .005, .002, -.006)), add(calM, P(-sx * .003, .006, 0))], width: .026, thick: .0014, hint: 'vertical'}]},
        ['A band from the medial malleolus to the medial surface of the calcaneus, roofing the tarsal tunnel', '由內踝連到跟骨內側面、構成跗隧道頂部的帶'], ['Holds the tendons of tibialis posterior, flexor digitorum longus and flexor hallucis longus and the tibial nerve and posterior tibial vessels against the ankle', '把脛後肌、屈趾長肌、屈拇長肌肌腱及脛神經、脛後血管固定在踝後內側']);
      const latCal = U.extreme(calc, P(sx, 0, -.2), {y: [.02, .06]}), lm = add(latM, P(sx * .004, .0, -.004));
      push(S, 'superior fibular retinaculum', '腓骨肌上支持帶', 'retinaculum', 'connective', {ribbons: [{pts: [lm, add(lerp(lm, latCal, .5), P(sx * .004, 0, -.006)), add(latCal, P(sx * .002, .012, .0))], width: .014, thick: .0012, hint: 'vertical'}]},
        ['A band from the back of the lateral malleolus to the lateral surface of the calcaneus', '由外踝後方連到跟骨外側面的帶'], ['Holds the tendons of fibularis longus and brevis behind the lateral malleolus', '把腓骨長肌與短肌腱固定在外踝後方']);
      push(S, 'inferior fibular retinaculum', '腓骨肌下支持帶', 'retinaculum', 'connective', {ribbons: [{pts: [add(latCal, P(sx * .002, .012, .006)), add(latCal, P(sx * .004, .004, .016)), add(latCal, P(sx * .002, -.004, .030))], width: .012, thick: .0012, hint: 'vertical'}]},
        ['A band on the lateral surface of the calcaneus, continuous above with the inferior extensor retinaculum', '位於跟骨外側面，上方與伸肌下支持帶相連'], ['Binds the fibularis tendons to the calcaneus below the lateral malleolus', '把腓骨肌腱固定在外踝下方的跟骨上']);
    }
  }
  // ---- Fascial shells lifted off the muscles they cover.
  {
    const gridShell = (names, keep, off, maxEdge = .003) => names.map(n => U.patchWhere(n, keep, off, p => true, maxEdge));
    const rect = [], back = [], sole = {Right: [], Left: []};
    for (const S of SIDES) {
      const ra = `${S.w} rectus abdominis`;
      if (U.has(ra)) rect.push(U.patchWhere(ra, tr => tr.n[2] > .45, .0016, p => true, .004));
      for (const n of [`${S.w} longissimus thoracis`, `${S.w} iliocostalis lumborum`, `${S.w} spinalis thoracis`].filter(U.has)) back.push(U.patchWhere(n, tr => tr.n[2] < -.4 && tr.mid[1] < 1.20 && tr.mid[1] > .98, .0014, p => p[1] < 1.21 && p[1] > .97, .004));
      for (const n of [`Flexor digitorum brevis of ${S.l} foot`, `Abductor hallucis of ${S.l} foot`, `Abductor digiti minimi of ${S.l} foot`].filter(U.has)) sole[S.w].push(U.patchWhere(n, tr => tr.n[1] < -.45, .0012, p => true, .004));
    }
    const geo = list => { const g = U.merge(list); if (!g.indices.length) throw new Error('empty fascial shell'); return g; };
    push(null, 'rectus sheath', '腹直肌鞘', 'sheath', 'connective', {geometry: [geo(rect)]},
      ['The aponeuroses of the three flat abdominal muscles enclose rectus abdominis; the anterior wall is drawn here', '三層腹壁扁肌的腱膜包住腹直肌；此處畫出前壁'], ['Encloses rectus abdominis and the superior and inferior epigastric vessels; fused in the midline as the linea alba', '包裹腹直肌與腹壁上、下動脈；在中線融合成白線'], ['Aponeuroses of external oblique, internal oblique and transversus abdominis', '腹外斜肌、腹內斜肌與腹橫肌的腱膜']);
    push(null, 'thoracolumbar fascia', '胸腰筋膜', 'fascia', 'connective', {geometry: [geo(back)]},
      ['The deep fascia of the back over the erector spinae, thickest in the lumbar region', '覆蓋豎脊肌的背部深筋膜，腰部最厚'], ['Encloses the erector spinae; gives origin to latissimus dorsi and transversus abdominis (shown here as its posterior layer)', '包裹豎脊肌；是背闊肌與腹橫肌的起點（此處畫出後層）']);
    for (const S of SIDES) push(S, 'plantar aponeurosis', '足底腱膜', 'aponeurosis', 'connective', {geometry: [geo(sole[S.w])]},
      ['A thick fibrous sheet covering the central and medial parts of the sole, from the calcaneal tuberosity to the toes', '覆蓋足底中央與內側的厚纖維膜，由跟骨粗隆到趾'], ['Supports the longitudinal arch and protects the plantar muscles, vessels and nerves', '支撐縱弓，保護足底肌肉、血管與神經']);
  }
  return out;
}
