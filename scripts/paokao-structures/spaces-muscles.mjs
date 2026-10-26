// Spaces (translucent boxes marking where nerves and vessels pass), a few ligaments of the back and breast, and three thin muscles the atlas lacks
// (palmaris brevis, transversus thoracis, subcostal muscles). Positions are measured on the atlas meshes that bound each space.
import {sub, add, mul, unit, len, lerp} from '../lib/paokao-util.mjs';

const REF = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.); Moore’s Clinically Oriented Anatomy, 8th ed.';
const SIDES = [{w: 'Right', l: 'right', sx: -1, zh: '右', s: 'r'}, {w: 'Left', l: 'left', sx: 1, zh: '左', s: 'l'}];
const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];

export default function spacesMuscles(U) {
  const out = [], P = (x, y, z) => [x, y, z];
  const box = (c, dx, dy, dz) => U.prism([[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].map(([a, b, d]) => add(c, P(a * dx / 2, b * dy / 2, d * dz / 2))));
  const space = (S, name, zh, geometry, where, role, bounds) => out.push({name: S ? `${S.w} ${name}` : name, zh: `${S ? S.zh : ''}${zh}`, system: 'connective', kind: 'space', geometry: [geometry],
    card: {origin: [bounds[0], bounds[1]], course: [where[0], where[1]], supply: [role[0], role[1]]}, refs: [REF]});
  const axis = (n, y, near) => U.axisAt(n, y, near, .002);
  for (const S of SIDES) {
    const sx = S.sx;
    // ---- Shoulder spaces
    {
      // The three posterior shoulder gaps are thin windows placed in the middle of the structures that surround them (found on the atlas meshes, see U.locate), each in the
      // plane that faces the back: quadrangular space (teres minor above, teres major below, long head of triceps medial, humerus lateral), triangular space (teres minor above,
      // teres major below, long head of triceps lateral, scapula medial) and triangular interval (teres major above, long head of triceps medial, humerus lateral).
      const lh = `Long head of ${S.l} triceps brachii`, hum = `${S.w} humerus`, tmin = `${S.w} teres minor`, tmaj = `${S.w} teres major`, scap = `${S.w} scapula`;
      const win = (seed, names, avoid, poly) => { const c = U.locate(names, P(sx * seed[0], seed[1], seed[2]), {r: .008, step: .002, avoid}); return poly(c); };
      const flat = (pts, t = .0024) => { const q = [pts[0], pts[1], pts[2], pts[2]]; return U.prism([...q.map(v => add(v, P(0, 0, -t / 2))), ...q.map(v => add(v, P(0, 0, t / 2)))]); };
      space(S, 'quadrangular space', '四邊孔', win([.161, 1.362, -.037], [tmin, tmaj, lh, hum], [], c => box(c, .014, .014, .0024)), ['Behind the shoulder, below the shoulder joint', '位於肩後、肩關節下方'], ['Transmits the axillary nerve and the posterior circumflex humeral vessels from the axilla to the back of the shoulder', '腋神經與旋肱後血管由腋窩通到肩後方'],
        ['Bounded above by teres minor, below by teres major, medially by the long head of triceps and laterally by the surgical neck of the humerus', '上界為小圓肌，下界為大圓肌，內側為肱三頭肌長頭，外側為肱骨外科頸']);
      space(S, 'triangular space', '三邊孔', win([.136, 1.347, -.056], [tmin, tmaj, lh, scap], [], c => flat([add(c, P(sx * -.005, .007, 0)), add(c, P(sx * -.005, -.007, 0)), add(c, P(sx * .007, 0, 0))])), ['Behind the shoulder, medial to the long head of triceps', '位於肩後、肱三頭肌長頭內側'], ['Transmits the circumflex scapular artery from the axilla to the infraspinous fossa', '旋肩胛動脈由腋窩通到棘下窩'],
        ['Bounded above by teres minor, below by teres major and laterally by the long head of triceps', '上界為小圓肌，下界為大圓肌，外側為肱三頭肌長頭']);
      space(S, 'triangular interval', '三頭肌間隙', win([.172, 1.331, -.065], [tmaj, lh, hum], [tmin], c => flat([add(c, P(sx * -.006, .007, 0)), add(c, P(sx * .006, .007, 0)), add(c, P(0, -.009, 0))])), ['On the back of the arm just below teres major', '位於上臂後面、大圓肌正下方'], ['Transmits the radial nerve and the deep brachial artery from the axilla to the radial groove', '橈神經與肱深動脈由腋窩通到橈神經溝'],
        ['Bounded above by teres major, medially by the long head of triceps and laterally by the humerus (and the lateral head of triceps)', '上界為大圓肌，內側為肱三頭肌長頭，外側為肱骨（與肱三頭肌外側頭）']);
      const cl = `${S.w} clavicle`, a = U.onSurface(cl, P(sx * .070, 1.397, .040), .002), b = U.onSurface(cl, P(sx * .130, 1.392, .025), .002), cc = add(lerp(a, b, .5), P(0, -.034, .020));
      space(S, 'clavipectoral triangle', '鎖骨胸大肌三角', U.conformingSheet([a, b, cc], [cl, ...[`Clavicular part of ${S.l} pectoralis major`, `Clavicular part of ${S.l} deltoid`, `${S.w} coracobrachialis`, `${S.w} pectoralis minor`].filter(n => U.has(n))], .0016, .002, .003), ['A small depression below the lateral clavicle, between the deltoid and pectoralis major (the deltopectoral triangle)', '鎖骨外側下方、三角肌與胸大肌之間的小凹（三角肌胸大肌三角）'], ['The cephalic vein runs through it to pierce the clavipectoral fascia and join the axillary vein', '頭靜脈走過此處，穿過鎖胸筋膜匯入腋靜脈'],
        ['Bounded by the clavicle, the deltoid and the clavicular head of pectoralis major', '界線為鎖骨、三角肌與胸大肌鎖骨部']);
      // Axillary fossa: a pyramid with its apex at the cervico-axillary canal and its base on the skin of the armpit. With the arm at the side the real space is a narrow slit between the
      // serratus anterior and the humerus, so the pyramid is built in the middle of that slit (U.locate) and kept thin.
      const apex = lerp(U.onSurface(cl, P(sx * .075, 1.395, .0), .0), axis(`${S.w} axillary artery`, 1.41, P(sx * .09, 1.41, -.006)), .5);
      const ac = U.locate([`${S.w} serratus anterior`, `${S.w} humerus`, `${S.w} latissimus dorsi`], P(sx * .147, 1.29, -.012), {r: .010, step: .002});
      const baseY = ac[1] - .030, ant = P(ac[0] - sx * .004, baseY, ac[2] + .030), post = P(ac[0] - sx * .004, baseY, ac[2] - .030), med = P(ac[0] - sx * .004, baseY, ac[2]), lat = P(ac[0] + sx * .004, baseY, ac[2]);
      space(S, 'axillary fossa', '腋窩', U.prism([ant, post, add(post, P(sx * .008, 0, 0)), add(ant, P(sx * .008, 0, 0)), apex, apex, apex, apex]), ['A pyramid-shaped space between the upper arm and the chest wall, with its apex at the cervico-axillary canal', '位於上臂與胸壁之間的錐狀空間，頂端為頸腋管'], ['Contains the axillary artery and vein, the cords of the brachial plexus, axillary lymph nodes and fat', '內有腋動脈、腋靜脈、臂神經叢各束、腋淋巴結與脂肪'],
        ['Anterior wall: pectoralis major and minor; posterior wall: subscapularis, teres major, latissimus dorsi; medial wall: serratus anterior and ribs; lateral wall: humerus (intertubercular groove)', '前壁：胸大肌與胸小肌；後壁：肩胛下肌、大圓肌、背闊肌；內側壁：前鋸肌與肋骨；外側壁：肱骨（結節間溝）']);
    }
    // ---- Carpal tunnel and tarsal tunnel
    {
      // Carpal tunnel: an arched channel between the carpal bones and the flexor retinaculum, as long as the retinaculum and a little beyond it at each end.
      {
        const fr = U.mesh(`Flexor retinaculum of ${S.l} wrist`), c = lerp(fr.lo, fr.hi, .5), half = (fr.hi[0] - fr.lo[0]) / 2, y0 = fr.hi[1] + .004, y1 = fr.lo[1] - .002;
        const path = [0, 1, 2, 3, 4, 5].map(i => P(c[0], lerp(P(0, y0, 0), P(0, y1, 0), i / 5)[1], c[2] - .003));
        space(S, 'carpal tunnel', '腕隧道', U.ellipticPrism(path, half * .62, (fr.hi[2] - fr.lo[2]) * .40, 20), ['A passage on the front of the wrist, between the carpal bones and the flexor retinaculum', '位於腕前方，介於腕骨與屈肌支持帶之間'], ['Transmits the median nerve and nine flexor tendons (four of flexor digitorum superficialis, four of profundus and flexor pollicis longus)', '通過正中神經與九條屈肌腱（屈指淺肌四條、屈指深肌四條、屈拇長肌一條）'],
        ['Floor and sides: the arch of carpal bones; roof: the flexor retinaculum', '底與兩側：腕骨弓；頂：屈肌支持帶']);
      
      }
      // Tarsal tunnel: the channel behind and below the medial malleolus, drawn along the tendon of tibialis posterior from 3 cm above the tip of the malleolus to the sole.
      {
        const tib = `${S.w} tibia`, mm = U.extreme(tib, P(-sx, -.8, .1), {y: [.06, .12]}), tp = `${S.w} tibialis posterior`;
        let path = [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const y = mm[1] + .028 - i * .0056; return add(U.axisAt(tp, y, add(mm, P(-sx * .01, 0, -.01)), .003), P(sx * -.002, 0, -.006)); });
        for (let pass = 0; pass < 3; pass++) path = path.map((q, i) => i === 0 || i === path.length - 1 ? q : lerp(q, lerp(path[i - 1], path[i + 1], .5), .7));
        space(S, 'tarsal tunnel', '跗隧道', U.ellipticPrism(path, .0085, .0055, 20), ['A passage behind and below the medial malleolus', '位於內踝後下方的通道'], ['Transmits the tendons of tibialis posterior, flexor digitorum longus and flexor hallucis longus, the posterior tibial vessels and the tibial nerve into the sole', '脛後肌、屈趾長肌、屈拇長肌肌腱與脛後血管、脛神經由此進入足底'],
        ['Floor: the tibia, talus and calcaneus; roof: the flexor retinaculum', '底：脛骨、距骨與跟骨；頂：屈肌支持帶']);

      }
      // Cubital fossa: a thin triangle lying on its floor (brachialis and supinator), base on the line between the epicondyles, apex where brachioradialis meets pronator teres.
      {
        const hum = `${S.w} humerus`, hm = U.mesh(hum), yd = hm.lo[1];
        const me = U.extreme(hum, P(-sx, 0, .15), {y: [yd, yd + .035]}), le = U.extreme(hum, P(sx, 0, .15), {y: [yd, yd + .035]});
        const front = P(0, 0, .010), a = add(me, front), b = add(le, front), mid = lerp(a, b, .5), apex = add(mid, P(sx * .002, -.052, .004));
        const g = U.conformingSheet([a, b, apex], [`${S.w} brachialis`, `${S.w} supinator`, hum, `${S.w} radius`], .0016, .0022, .003);
        space(S, 'cubital fossa', '肘窩', g, ['A triangular hollow on the front of the elbow', '位於肘前方的三角形凹陷'],
          ['Contains, from medial to lateral, the median nerve, the brachial artery (dividing into radial and ulnar arteries), the biceps tendon and the radial nerve (deep branch); the median cubital vein crosses its roof', '由內向外含正中神經、肱動脈（在此分為橈動脈與尺動脈）、肱二頭肌腱與橈神經（深支）；肘正中靜脈橫越其頂'],
          ['Base: an imaginary line between the humeral epicondyles; medial border: pronator teres; lateral border: brachioradialis; floor: brachialis and supinator; roof: deep fascia and the bicipital aponeurosis', '底：兩肱骨上髁連線；內側界：旋前圓肌；外側界：肱橈肌；底面：肱肌與旋後肌；頂：深筋膜與肱二頭肌腱膜']);
      }
      // Anatomical snuffbox: the small triangle on the radial side of the wrist between the tendon of extensor pollicis longus (ulnar side) and those of abductor pollicis longus and
      // extensor pollicis brevis (radial side); base at the styloid process of the radius, apex towards the base of the thumb; floor scaphoid and trapezium.
      {
        const y1 = U.mesh(`${S.w} radius`).lo[1] + .002, y2 = y1 - .020, ax = (n, y) => U.axisAt(n, y, null, .002);
        const epl = `${S.w} extensor pollicis longus`, epb = `${S.w} extensor pollicis brevis`, apl = `${S.w} abductor pollicis longus`;
        const base1 = ax(epl, y1), base2 = lerp(ax(apl, y1), ax(epb, y1), .5), apex = lerp(ax(epl, y2), lerp(ax(apl, y2), ax(epb, y2), .5), .5);
        const g = U.conformingSheet([base1, base2, apex], [`${S.w} scaphoid`, `${S.w} trapezium`, `${S.w} radius`, `${S.w} first metacarpal bone`], .0012, .0016, .0025);
        space(S, 'anatomical snuffbox', '解剖鼻煙盒', g, ['A triangular hollow on the back of the wrist at the base of the thumb', '位於腕背、拇指基部的三角形凹陷'],
          ['Contains the radial artery (crossing its floor) and the superficial branch of the radial nerve, with the cephalic vein over its roof; tenderness here suggests a scaphoid fracture', '橈動脈由其底部橫過，橈神經淺支與頭靜脈行於頂部；此處壓痛要懷疑舟狀骨骨折'],
          ['Ulnar (posterior) border: tendon of extensor pollicis longus; radial (anterior) border: tendons of abductor pollicis longus and extensor pollicis brevis; floor: scaphoid and trapezium', '尺側（後）界：拇長伸肌腱；橈側（前）界：拇長展肌腱與拇短伸肌腱；底：舟狀骨與大多角骨']);
      }
      const fa = `${S.w} femoral artery`, ah = add(axis(fa, .580, P(sx * .06, .58, .01)), P(sx * .0, -.004, -.006));
      space(S, 'adductor hiatus', '內收肌裂孔', box(ah, .014, .026, .008), ['The gap in the lower end of adductor magnus, above the medial femoral condyle', '內收大肌下端、股骨內側髁上方的裂隙'], ['The femoral vessels pass through it from the adductor canal into the popliteal fossa (becoming the popliteal vessels)', '股血管由內收肌管經此進入膕窩（成為膕血管）'],
        ['Between the oblique and vertical parts of the attachment of adductor magnus', '位於內收大肌斜行部與垂直部止點之間']);
      const rcp = U.mesh(`${S.w} rectus capitis posterior major`), ocs = U.mesh(`${S.w} obliquus capitis superior`), oci = U.mesh(`${S.w} obliquus capitis inferior`);
      const A = U.meetPoint(`${S.w} rectus capitis posterior major`, `${S.w} obliquus capitis inferior`), B = U.meetPoint(`${S.w} obliquus capitis superior`, `${S.w} obliquus capitis inferior`), C = U.meetPoint(`${S.w} rectus capitis posterior major`, `${S.w} obliquus capitis superior`);
      space(S, 'suboccipital triangle', '枕下三角', U.conformingSheet([A, B, C], ['Atlas', 'Axis', 'Occipital bone'].filter(n => U.has(n)), .0012, .0018, .0025), ['A small muscular triangle deep in the back of the neck, below the occipital bone', '位於後頸深層、枕骨下方的小肌肉三角'], ['Contains the vertebral artery (third part), the suboccipital nerve and the suboccipital venous plexus', '內有椎動脈（第三段）、枕下神經與枕下靜脈叢'],
        ['Bounded by rectus capitis posterior major (medially), obliquus capitis superior (laterally) and obliquus capitis inferior (inferiorly); roof: semispinalis capitis; floor: posterior atlanto-occipital membrane and the posterior arch of the atlas', '界線：頭後大直肌（內側）、頭上斜肌（外側）、頭下斜肌（下方）；頂：頭半棘肌；底：寰枕後膜與寰椎後弓']);
    }
  }
  // ---- Aortic hiatus: the opening for the aorta between the crura of the diaphragm at T12.
  {
    const c = U.axisAt('Abdominal aorta', 1.178, null, .003);
    out.push({name: 'Aortic hiatus', zh: '主動脈裂孔', system: 'connective', kind: 'space', geometry: [U.ring(c, P(1, 0, 0), P(0, 0, 1), .0125, .0105, .0045, .0016)],
      card: {origin: ['Diaphragm, at the level of T12, behind the median arcuate ligament', '橫膈，T12 高度、正中弓狀韌帶後方'], course: ['The opening between the right and left crura of the diaphragm', '橫膈左右腳之間的開口'], supply: ['Transmits the aorta, the thoracic duct and often the azygos vein', '通過主動脈、胸管，常並有奇靜脈']}, refs: [REF]});
  }
  // ---- Ligaments of the spine and breast
  {
    const cordAt = y => U.axisAt('White matter of spinal cord', Math.max(1.075, Math.min(1.54, y)), null, .002);
    for (const S of SIDES) {
      const pts = []; for (let y = 1.50; y > 1.14; y -= .0165) { const c = cordAt(y); pts.push(add(c, P(S.sx * .0042, 0, 0)), add(c, P(S.sx * .0088, -.0085, 0))); }
      out.push({name: `${S.w} denticulate ligament`, zh: `${S.zh}齒狀韌帶`, system: 'connective', kind: 'ligament', ribbons: [{pts, width: .0016, thick: .0006, hint: P(0, 0, 1), samples: pts.length * 2}],
        card: {origin: ['Pia mater on the side of the spinal cord, between the dorsal and ventral roots', '脊髓側面的軟膜，位於背根與腹根之間'], course: ['A series of about 21 triangular teeth that attach to the dura mater', '約 21 個三角形齒突，附著於硬脊膜'], supply: ['Suspends the spinal cord in the dural sac; it marks the boundary between the dorsal and ventral roots', '把脊髓懸吊在硬膜囊內；是區分背根與腹根的標誌']}, refs: [REF]});
    }
    const levels = [];
    const names = [...ORD.slice(0, 12).map(o => `${o[0].toUpperCase()}${o.slice(1)} thoracic vertebra`), 'First lumbar vertebra', 'Second lumbar vertebra', 'Third lumbar vertebra', 'Fourth lumbar vertebra', 'Fifth lumbar vertebra', 'Seventh cervical vertebra', 'Sixth cervical vertebra', 'Fifth cervical vertebra', 'Fourth cervical vertebra', 'Third cervical vertebra'].filter(U.has);
    const ordered = names.map(n => U.mesh(n)).sort((a, b) => b.hi[1] - a.hi[1]);
    const ribs = [];
    for (let i = 0; i < ordered.length - 1; i++) {
      const gap = (ordered[i].lo[1] + ordered[i + 1].hi[1]) / 2, c = cordAt(gap), z = c[2] - .0105;
      for (const sx of [-1, 1]) ribs.push(U.ribbon([P(sx * .003, gap + .0045, z), P(sx * .0095, gap, z - .0015), P(sx * .0165, gap - .0045, z - .003)], .0046, .0011, 'vertical', 8));
    }
    out.push({name: 'Ligamentum flavum', zh: '黃韌帶', system: 'connective', kind: 'ligament', geometry: [U.merge(ribs)],
      card: {origin: ['Lamina of the vertebra above', '上一節椎骨的椎弓板'], course: ['Yellow elastic bands joining the laminae of adjacent vertebrae on the inside of the vertebral canal, behind the spinal cord', '連接相鄰椎弓板的黃色彈性纖維帶，位於椎管內脊髓後方'], supply: ['Resists excessive flexion and helps the spine return to the upright posture', '限制過度前屈，並協助脊柱回復直立']}, refs: [REF]});
    // Suspensory ligaments of the breast (Cooper): fibrous septa from the deep fascia over pectoralis major out to the skin of the breast.
    for (const S of SIDES) {
      const wall = U.mesh(`${S.w} fifth rib`), tubes = [];
      const c0 = P(S.sx * .085, 1.270, .088);
      for (let i = 0; i < 9; i++) {
        const a = i / 9 * Math.PI * 2, d = P(Math.cos(a) * .020, Math.sin(a) * .020, 0), root = add(c0, mul(d, .35)), tip = add(c0, add(d, P(0, 0, .016)));
        tubes.push(U.tube([add(root, P(0, 0, -.008)), lerp(add(root, P(0, 0, -.008)), tip, .5), tip], .0004, .0003, 6, 5));
      }
      out.push({name: `${S.w} suspensory ligament of breast`, zh: `${S.zh}乳房懸韌帶（庫柏氏韌帶）`, system: 'connective', kind: 'ligament', geometry: [U.merge(tubes)],
        card: {origin: ['Deep fascia over pectoralis major', '胸大肌表面的深筋膜'], course: ['Fibrous septa running through the breast between the lobules to the dermis of the skin', '穿過乳腺小葉之間、連到皮膚真皮的纖維隔'], supply: ['Support the breast; invasion by cancer can pull on them and dimple the skin', '支撐乳房；乳癌侵犯時牽拉而使皮膚凹陷']}, refs: [REF]});
    }
  }
  // ---- Thin muscles
  for (const S of SIDES) {
    const sx = S.sx, hand = n => `${n} of ${S.l} hand`;
    // palmaris brevis: a small subcutaneous sheet from the flexor retinaculum / palmar aponeurosis to the skin of the ulnar border of the palm.
    // The sheet is laid on the surface of abductor digiti minimi (the hypothenar eminence), so it cannot stand away from the hand: a quad over its upper (wrist-side) part, palmar face.
    const adm = hand('Abductor digiti minimi'), am = U.mesh(adm), top = am.hi[1], xm = (am.lo[0] + am.hi[0]) / 2, zf = am.hi[2], hw = (am.hi[0] - am.lo[0]) / 2 * .7;
    const brevis = U.conformingSheet([P(xm - hw, top - .004, zf), P(xm + hw, top - .004, zf), P(xm + hw, top - .026, zf), P(xm - hw, top - .026, zf)], [adm], .0012, .0014, .0025);
    out.push({name: `${S.w} palmaris brevis`, zh: `${S.zh}掌短肌`, system: 'muscular', kind: 'muscle', geometry: [brevis],
      card: {origin: ['Flexor retinaculum and palmar aponeurosis', '屈肌支持帶與掌腱膜'], course: ['A thin subcutaneous sheet over the hypothenar eminence', '位於小魚際隆起皮下的薄肌'], supply: ['Skin of the ulnar border of the palm — wrinkles it and deepens the hollow of the palm (ulnar nerve, superficial branch)', '尺側手掌皮膚——使皮膚皺起並加深掌心凹（尺神經淺支）']}, refs: [REF]});
    // transversus thoracis: slips from the back of the lower sternum and xiphoid to the 2nd–6th costal cartilages.
    const body = U.mesh('Body of sternum'), slips = [];
    for (let i = 1; i <= 5; i++) {
      const cart = `${S.w} ${ORD[i]} costal cartilage`; if (!U.has(cart)) continue;
      const y = (U.mesh(cart).lo[1] + U.mesh(cart).hi[1]) / 2, from = P(sx * .007, Math.max(y - .008, body.lo[1] + .003), body.lo[2] + .0012), to = U.onSurface(cart, P(sx * .035, y + .004, U.mesh(cart).lo[2] - .002), -.0015);
      slips.push(U.ribbon([from, lerp(from, to, .5), add(to, P(0, .002, 0))], .0045, .0010, 'vertical', 8));
    }
    out.push({name: `${S.w} transversus thoracis`, zh: `${S.zh}胸橫肌`, system: 'muscular', kind: 'muscle', geometry: [U.merge(slips)],
      card: {origin: ['Posterior surface of the lower sternum and xiphoid process', '胸骨下部與劍突後面'], course: ['Slips fan out upwards and laterally to the inner surface of the 2nd–6th costal cartilages', '肌束向上外側散開，止於第二至第六肋軟骨內面'], supply: ['Depresses the costal cartilages (weak expiration); intercostal nerves 2–6', '下壓肋軟骨（微弱的呼氣作用）；第二至第六肋間神經']}, refs: [REF]});
    // subcostal muscles: slips on the inner surface of the lower ribs near their angles, crossing one or two ribs.
    const sub = [];
    for (let i = 7; i <= 10; i++) {
      const r1 = `${S.w} ${ORD[i]} rib`, r2 = `${S.w} ${ORD[Math.min(i + 2, 11)]} rib`; if (!U.has(r1) || !U.has(r2)) continue;
      const m1 = U.mesh(r1), p1 = U.onSurface(r1, P(sx * .075, (m1.lo[1] + m1.hi[1]) / 2 - .01, -.075), -.0015), p2 = U.onSurface(r2, add(p1, P(sx * .004, -.036, -.002)), -.0015);
      sub.push(U.ribbon([p1, lerp(p1, p2, .5), p2], .0075, .0010, 'vertical', 8));
    }
    out.push({name: `${S.w} subcostal muscles`, zh: `${S.zh}肋下肌`, system: 'muscular', kind: 'muscle', geometry: [U.merge(sub)],
      card: {origin: ['Inner surface of the lower ribs near their angles', '下位肋骨角附近的內面'], course: ['Run down and medially, crossing one or two intercostal spaces, in the same direction as the innermost intercostals', '向下內方斜行，越過一或兩個肋間隙，方向與最內肋間肌相同'], supply: ['Depress the ribs; lower intercostal nerves', '下拉肋骨；下位肋間神經']}, refs: [REF]});
  }
  return out;
}
