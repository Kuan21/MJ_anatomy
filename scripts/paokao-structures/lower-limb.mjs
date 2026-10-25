// Lower-limb and pelvic arteries, veins and nerves the atlas lacks (deep femoral artery and its branches, the gluteal and internal pudendal arteries, the superficial
// branches of the femoral artery, the ankle and fibular arteries, a few cutaneous and muscular nerves). Textbook courses on landmarks measured on the atlas meshes.
import {sub, add, mul, unit, len, lerp} from '../lib/paokao-util.mjs';

const GRAYS = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.), ch. 5 Pelvis and Perineum and ch. 6 Lower Limb';
const SIDES = [{w: 'Right', l: 'right', sx: -1, zh: '右', s: 'r'}, {w: 'Left', l: 'left', sx: 1, zh: '左', s: 'l'}];

export default function lowerLimb(U) {
  const out = [], P = (x, y, z) => [x, y, z];
  const axis = (name, y, near, half = .002) => U.axisAt(name, y, near, half);
  const art = (S, parent, n, zh, origin, course, supply, tubes, extra = {}) => out.push({name: `${S.w} ${n}`, zh: `${S.zh}${zh}`, system: 'arterial', kind: 'artery', parent, tubes, card: {origin, course, supply}, refs: [GRAYS], ...extra});
  for (const S of SIDES) {
    const fem = `${S.w} femoral artery`, dfv = `${S.w} deep femoral vein`, femur = `${S.w} femur`;
    const f = (y, dz = 0) => axis(fem, y, P(S.sx * .05, y, .035 + dz));
    const v = y => axis(dfv, y, P(S.sx * .065, y, .026));
    // ---- Deep femoral artery: from the femoral artery 3–5 cm below the inguinal ligament, back and lateral behind the femoral vessels, beside its vein.
    const ys = [.850, .812, .775, .738, .700, .662, .625];
    const dfaPts = [f(.855), ...ys.slice(1).map(y => add(v(y), P(S.sx * -.005, 0, -.005)))];
    art(S, fem, 'deep femoral artery', '股深動脈',
      ['Femoral artery, 3–5 cm below the inguinal ligament', '股動脈（腹股溝韌帶下方 3–5 公分）'],
      ['Passes backwards and laterally behind the femoral vessels, deep to adductor longus, and ends as the 4th perforating artery', '向後外側行經股血管後方、內收長肌深面，終止為第四穿通動脈'],
      ['Main blood supply of the thigh muscles and the femur', '大腿肌肉與股骨的主要血液供應'], [{pts: dfaPts, r: [.0032, .0016], samples: 40}]);
    // Perforating branches: back through adductor magnus to the hamstrings.
    {
      const tubes = [.790, .735, .680].map(y => {
        const o = add(v(y), P(S.sx * -.005, 0, -.005)), t = U.onSurface(femur, P(S.sx * .085, y, -.045), .010);
        return {pts: [o, lerp(o, t, .55), t], r: [.0011, .0006], samples: 16};
      });
      art(S, `${S.w} deep femoral artery`, 'perforating branch of deep femoral artery', '股深動脈穿通支',
        ['Deep femoral artery (three perforating branches, one for each of the upper three adductor attachments)', '股深動脈（三條穿通支）'],
        ['Pierce adductor brevis/magnus close to the linea aspera and reach the posterior compartment', '貼近股骨粗線穿過內收短肌與內收大肌，到達大腿後區'],
        ['Hamstrings, adductor magnus and the femoral shaft (they anastomose with each other and with the gluteal and popliteal arteries)', '膕繩肌、內收大肌與股骨幹（彼此及與臀動脈、膕動脈吻合）'], tubes);
    }
    // Medial circumflex femoral artery: from the deep femoral artery, backwards between pectineus and iliopsoas to the trochanteric fossa.
    {
      const o = lerp(dfaPts[0], dfaPts[1], .22), neck = U.onSurface(femur, P(S.sx * .060, .895, -.010), .006), end = U.onSurface(femur, P(S.sx * .105, .885, -.040), .006);
      art(S, `${S.w} deep femoral artery`, 'medial circumflex femoral artery', '旋股內側動脈',
        ['Deep femoral artery (sometimes the femoral artery)', '股深動脈（有時來自股動脈）'],
        ['Winds backwards round the medial side of the femoral neck between pectineus and iliopsoas, then passes above quadratus femoris to the trochanteric fossa', '繞股骨頸內側向後，經恥骨肌與髂腰肌之間，再越過方形股肌上緣到轉子窩'],
        ['Femoral head and neck (retinacular arteries) and the adjacent muscles', '股骨頭、頸（支持帶動脈）與鄰近肌肉'], [{pts: [o, add(lerp(o, neck, .5), P(0, 0, -.006)), neck, end], r: [.0022, .0012], samples: 30}]);
    }
    // Lateral circumflex femoral artery → ascending and transverse branches.
    {
      const lc = `${S.w} lateral circumflex femoral artery`, tipHi = U.tips(lc, .008).reduce((a, t) => t[0] * S.sx < a[0] * S.sx ? t : a);
      const o = U.cen(lc, add(tipHi, P(S.sx * -.008, .0, .0)), .004), asis = U.extreme(`${S.w} hip bone`, P(0, 0, 1), {y: [.95, 1.05]});
      art(S, lc, 'ascending branch of lateral circumflex femoral artery', '旋股外側動脈升支',
        ['Lateral circumflex femoral artery', '旋股外側動脈'], ['Ascends laterally beneath sartorius and rectus femoris, towards the anterior superior iliac spine', '在縫匠肌與股直肌深面向外上走，朝髂前上棘'],
        ['Tensor fasciae latae and the muscles round the hip (anastomoses with the superior gluteal artery)', '闊筋膜張肌與髖周肌肉（與臀上動脈吻合）'],
        [{pts: [o, add(lerp(o, asis, .45), P(S.sx * .006, 0, -.006)), add(asis, P(S.sx * .008, -.012, -.014))], r: [.0014, .0008], samples: 20}]);
      const t = U.onSurface(`${S.w} vastus lateralis`, P(S.sx * .125, .835, .0), -.003);
      art(S, lc, 'transverse branch of lateral circumflex femoral artery', '旋股外側動脈橫支',
        ['Lateral circumflex femoral artery', '旋股外側動脈'], ['Runs laterally through vastus lateralis and winds round the femur below the greater trochanter', '向外側穿過股外側肌，繞過大轉子下方的股骨'],
        ['Vastus lateralis and the cruciate anastomosis of the thigh', '股外側肌與大腿的十字吻合'],
        [{pts: [o, add(lerp(o, t, .5), P(0, -.004, -.006)), t], r: [.0012, .0007], samples: 16}]);
    }
    // Superficial branches of the femoral artery just below the inguinal ligament.
    {
      const o = f(.885), asis = U.extreme(`${S.w} hip bone`, P(0, 0, 1), {y: [.95, 1.05]}), pub = U.extreme(`${S.w} hip bone`, P(0, -1, 0), {y: [.8, .95]});
      const skinZ = z => z + .010;
      art(S, fem, 'superficial circumflex iliac artery', '旋髂淺動脈', ['Femoral artery, 1–2 cm below the inguinal ligament', '股動脈（腹股溝韌帶下方 1–2 公分）'],
        ['Runs laterally in the superficial fascia, parallel to and below the inguinal ligament, towards the anterior superior iliac spine', '在淺筋膜內向外、與腹股溝韌帶平行並位於其下方，朝髂前上棘'], ['Skin and superficial fascia of the groin and lower abdominal wall', '腹股溝與下腹壁的皮膚與淺筋膜'],
        [{pts: [o, add(o, P(S.sx * .020, .020, .012)), add(asis, P(S.sx * -.010, -.012, .005))], r: [.0010, .0005], samples: 18}]);
      art(S, fem, 'superficial external pudendal artery', '陰部外淺動脈', ['Femoral artery, below the inguinal ligament', '股動脈（腹股溝韌帶下方）'],
        ['Passes medially across the spermatic cord (or round ligament) to the skin of the scrotum or labium majus', '向內側越過精索（或子宮圓韌帶），到陰囊或大陰唇皮膚'], ['Skin of the lower abdomen, penis and scrotum (labium majus)', '下腹、陰莖與陰囊（大陰唇）皮膚'],
        [{pts: [o, add(o, P(-S.sx * .016, -.002, .012)), add(pub, P(-S.sx * .010, .000, .020))], r: [.0010, .0005], samples: 18}]);
      art(S, fem, 'deep external pudendal artery', '陰部外深動脈', ['Femoral artery, below the inguinal ligament', '股動脈（腹股溝韌帶下方）'],
        ['Passes medially deep to the great saphenous vein and across adductor longus to the skin of the perineum', '向內側行經大隱靜脈深面、越過內收長肌，到會陰皮膚'], ['Skin of the scrotum (labium majus) and perineum', '陰囊（大陰唇）與會陰皮膚'],
        [{pts: [add(f(.872), P(0, 0, -.002)), add(f(.872), P(-S.sx * .018, -.012, -.006)), add(pub, P(-S.sx * .014, -.020, .006))], r: [.0010, .0005], samples: 18}]);
    }
    // Descending genicular artery → articular and saphenous branches.
    {
      const dg = `${S.w} descending genicular artery`, o = U.tipNear(dg, P(S.sx * .045, .560, .004)), adductor = P(S.sx * .045, .548, -.004);
      art(S, dg, 'articular branch of descending genicular artery', '膝降動脈關節支', ['Descending genicular artery, in the adductor canal', '膝降動脈（內收肌管內）'],
        ['Passes down in front of the medial side of the knee towards the patella', '沿膝內側前方下行，朝髕骨'], ['Knee joint (anterior part) and the patellar anastomosis', '膝關節前部與髕網'],
        [{pts: [o, add(o, P(S.sx * .006, -.025, .016)), add(o, P(S.sx * .014, -.050, .026))], r: [.0009, .0005], samples: 18}]);
      art(S, dg, 'saphenous branch of descending genicular artery', '膝降動脈隱支', ['Descending genicular artery, in the adductor canal', '膝降動脈（內收肌管內）'],
        ['Pierces the fascia and runs with the saphenous nerve down the medial side of the leg', '穿出筋膜，與隱神經一起沿小腿內側下行'], ['Skin of the medial knee and upper leg', '膝內側與小腿上部皮膚'],
        [{pts: [o, add(o, P(-S.sx * .004, -.030, -.008)), add(o, P(-S.sx * .008, -.060, -.012)), add(o, P(-S.sx * .012, -.100, -.014))], r: [.0009, .0004], samples: 24}]);
    }
    // Anterior lateral / medial malleolar arteries: from the anterior tibial artery just above the ankle.
    {
      const at = `${S.w} anterior tibial artery`, o = axis(at, .115, P(S.sx * .075, .115, -.008)), lat = U.extreme(`${S.w} fibula`, P(0, -1, 0)), med = U.extreme(`${S.w} tibia`, P(0, -1, 0), {x: [S.sx > 0 ? .02 : -.12, S.sx > 0 ? .12 : -.02]});
      art(S, at, 'anterior lateral malleolar artery', '前外踝動脈', ['Anterior tibial artery, just above the ankle', '脛前動脈（踝關節上方）'], ['Passes laterally deep to the tendons of extensor digitorum longus and fibularis tertius to the lateral malleolus', '行經伸趾長肌與第三腓骨肌腱深面，向外到外踝'], ['Ankle joint and the lateral malleolar network', '踝關節與外踝網'],
        [{pts: [o, add(lerp(o, lat, .5), P(0, 0, .006)), add(lat, P(S.sx * .002, .008, .0045))], r: [.0010, .0006], samples: 16}]);
      art(S, at, 'anterior medial malleolar artery', '前內踝動脈', ['Anterior tibial artery, just above the ankle', '脛前動脈（踝關節上方）'], ['Passes medially deep to the tendons of tibialis anterior and extensor hallucis longus to the medial malleolus', '行經脛前肌與伸拇長肌腱深面，向內到內踝'], ['Ankle joint and the medial malleolar network', '踝關節與內踝網'],
        [{pts: [o, add(lerp(o, med, .5), P(0, 0, .006)), add(med, P(-S.sx * .001, .008, .0045))], r: [.0010, .0006], samples: 16}]);
    }
    // Fibular artery and its circumflex fibular branch (from the posterior tibial artery).
    {
      const pt = `${S.w} posterior tibial artery`, fib = `${S.w} fibula`, calc = `${S.w} calcaneus`;
      const o = axis(pt, .335, P(S.sx * .055, .335, -.020));
      const along = y => { const c = axis(fib, y, P(S.sx * .102, y, -.035)); return add(c, P(-S.sx * .0075, 0, -.003)); };
      const end = U.onSurface(calc, P(S.sx * .095, .030, -.050), .0015);
      art(S, pt, 'fibular artery', '腓動脈', ['Posterior tibial artery, 2–3 cm below the lower border of popliteus', '脛後動脈（膕肌下緣下方 2–3 公分）'], ['Descends along the medial side of the fibula (under flexor hallucis longus) to the lateral side of the calcaneus', '沿腓骨內側（屈拇長肌深面）下行，到跟骨外側'],
        ['Lateral and posterior compartments of the leg, the fibula and the lateral side of the heel', '小腿外側與後區、腓骨與足跟外側'], [{pts: [o, along(.300), along(.250), along(.200), along(.150), along(.100), add(lerp(along(.100), end, .6), P(0, 0, -.004)), end], r: [.0024, .0010], samples: 44}]);
      const neck = U.onSurface(fib, P(S.sx * .110, .385, -.030), .003), o2 = axis(pt, .360, P(S.sx * .060, .360, -.030));
      art(S, pt, 'circumflex fibular artery', '腓旋動脈', ['Posterior tibial artery, near its origin (sometimes the anterior tibial artery)', '脛後動脈起始處附近（有時來自脛前動脈）'], ['Winds round the neck of the fibula under soleus and joins the genicular anastomosis', '在比目魚肌深面繞過腓骨頸，與膝關節網吻合'],
        ['Head and neck of the fibula and the proximal tibiofibular joint', '腓骨頭、頸與脛腓近側關節'], [{pts: [o2, add(lerp(o2, neck, .5), P(0, 0, -.006)), neck], r: [.0010, .0006], samples: 16}]);
    }
    // Lateral plantar vein: venae comitantes of the lateral plantar artery into the posterior tibial veins.
    {
      const lp = `${S.w} lateral plantar artery`, tips = U.tips(lp, .004), a = tips.reduce((p, t) => t[1] > p[1] ? t : p), b = tips.reduce((p, t) => t[1] < p[1] ? t : p);
      out.push({name: `${S.w} lateral plantar vein`, zh: `${S.zh}足底外側靜脈`, system: 'venous', kind: 'vein', parent: lp,
        tubes: [{pts: [add(a, P(S.sx * .003, .004, -.002)), add(lerp(a, b, .5), P(S.sx * .003, 0, -.003)), add(b, P(S.sx * .003, -.001, -.002))], r: [.0016, .0011], samples: 20}],
        card: {origin: ['Plantar venous arch', '足底靜脈弓'], course: ['Accompanies the lateral plantar artery and nerve and joins the medial plantar vein behind the medial malleolus to form the posterior tibial vein', '伴隨足底外側動脈與神經，在內踝後方與足底內側靜脈合成脛後靜脈'], supply: ['Drains the lateral plantar region and the plantar muscles', '回收足底外側與足底肌肉的血液']}, refs: [GRAYS]});
    }
    // ---- Gluteal and internal pudendal arteries (branches of the internal iliac artery that leave the pelvis through the greater sciatic foramen).
    {
      const iia = `${S.w} internal iliac artery`, pir = `${S.w} piriformis`, gmax = `${S.w} gluteus maximus`, hip = `${S.w} hip bone`;
      const from = S.sx < 0 ? 'x-max' : 'x-min', pirHi = t => U.alongMesh(pir, t, P(0, 1, 0), from), pirLoA = t => U.alongMesh(pir, t, P(0, -1, 0), from);
      const o = U.tipNear(iia, P(S.sx * .032, .930, -.060)), pirLo = pirLoA(.38);
      const spine = add(pirLoA(.55), P(S.sx * .0, -.012, .010));
      const sup = add(pirHi(.38), P(0, .003, -.004)), deepTo = U.onSurface(`${S.w} gluteus medius`, P(S.sx * .105, 1.000, -.085), -.004), supTo = U.onSurface(gmax, P(S.sx * .060, .985, -.095), -.004);
      art(S, iia, 'superior gluteal artery', '臀上動脈', ['Posterior division of the internal iliac artery', '髂內動脈後幹'], ['Leaves the pelvis through the greater sciatic foramen above piriformis and divides into superficial and deep branches', '經坐骨大孔、梨狀肌上緣出骨盆，分為淺支與深支'],
        ['Gluteus maximus, medius and minimus and tensor fasciae latae', '臀大肌、臀中肌、臀小肌與闊筋膜張肌'], [{pts: [o, add(lerp(o, sup, .5), P(0, .006, -.006)), sup], r: [.0030, .0024], samples: 24}]);
      art(S, `${S.w} superior gluteal artery`, 'superficial branch of superior gluteal artery', '臀上動脈淺支', ['Superior gluteal artery', '臀上動脈'], ['Enters the deep surface of gluteus maximus', '進入臀大肌深面'], ['Gluteus maximus', '臀大肌'],
        [{pts: [sup, add(lerp(sup, supTo, .5), P(0, .002, -.003)), supTo], r: [.0020, .0012], samples: 18}]);
      art(S, `${S.w} superior gluteal artery`, 'deep branch of superior gluteal artery', '臀上動脈深支', ['Superior gluteal artery', '臀上動脈'], ['Runs between gluteus medius and minimus (with the superior gluteal nerve) towards the greater trochanter', '在臀中肌與臀小肌之間（與臀上神經一起）朝大轉子'], ['Gluteus medius, gluteus minimus and the hip joint', '臀中肌、臀小肌與髖關節'],
        [{pts: [sup, add(lerp(sup, deepTo, .5), P(0, .012, 0)), deepTo], r: [.0022, .0012], samples: 18}]);
      const ig = add(pirLo, P(0, -.005, -.006)), igTo = U.onSurface(gmax, P(S.sx * .060, .900, -.100), -.004);
      art(S, iia, 'inferior gluteal artery', '臀下動脈', ['Anterior division of the internal iliac artery', '髂內動脈前幹'], ['Leaves the pelvis through the greater sciatic foramen below piriformis and descends into gluteus maximus with the sciatic nerve', '經坐骨大孔、梨狀肌下緣出骨盆，與坐骨神經一起下行進入臀大肌'],
        ['Gluteus maximus, the upper hamstrings and the sciatic nerve (companion artery)', '臀大肌、膕繩肌上部與坐骨神經（伴行動脈）'], [{pts: [o, add(lerp(o, ig, .5), P(0, -.004, -.004)), ig, add(lerp(ig, igTo, .5), P(0, -.006, -.004)), igTo], r: [.0028, .0014], samples: 30}]);
      const ipa = [o, add(lerp(o, ig, .5), P(0, -.004, -.003)), add(ig, P(S.sx * .0, -.004, -.002)), add(spine, P(0, .003, -.003)), add(spine, P(S.sx * -.010, -.010, .002)), add(spine, P(S.sx * -.018, -.026, .012))];
      art(S, iia, 'internal pudendal artery', '陰部內動脈', ['Anterior division of the internal iliac artery', '髂內動脈前幹'], ['Leaves through the greater sciatic foramen below piriformis, curls round the ischial spine and re-enters the pelvis through the lesser sciatic foramen to the pudendal canal', '經坐骨大孔、梨狀肌下緣出骨盆，繞坐骨棘後經坐骨小孔回到會陰，走入陰部管'],
        ['Perineum and external genitalia (with the pudendal nerve)', '會陰與外生殖器（與陰部神經伴行）'], [{pts: ipa, r: [.0022, .0012], samples: 30}]);
    }
    // ---- Nerves
    {
      const sci = `Sciatic nerve.${S.s}`, hi = U.tips(sci, .01).reduce((a, t) => t[1] > a[1] ? t : a), pirLo = U.alongMesh(`${S.w} piriformis`, .38, P(0, -1, 0), S.sx < 0 ? 'x-max' : 'x-min');
      const igT = U.onSurface(`${S.w} gluteus maximus`, P(S.sx * .050, .915, -.100), -.004);
      out.push({name: `${S.w} inferior gluteal nerve`, zh: `${S.zh}臀下神經`, system: 'nervous', kind: 'nerve',
        tubes: [{pts: [hi, add(lerp(hi, igT, .5), P(0, -.004, -.008)), igT], r: [.0016, .0010], samples: 20}],
        card: {origin: ['Sacral plexus (L5–S2)', '薦神經叢（L5–S2）'], course: ['Leaves the pelvis through the greater sciatic foramen below piriformis and enters the deep surface of gluteus maximus', '經坐骨大孔、梨狀肌下緣出骨盆，進入臀大肌深面'], supply: ['Gluteus maximus', '臀大肌']}, refs: [GRAYS]});
      const oi = `${S.w} obturator internus`, oiT = U.onSurface(oi, P(S.sx * .045, .905, -.040), .0012), spineP = add(U.alongMesh(`${S.w} piriformis`, .55, P(0, -1, 0), S.sx < 0 ? 'x-max' : 'x-min'), P(0, -.012, .010));
      out.push({name: `${S.w} nerve to obturator internus`, zh: `${S.zh}閉孔內肌神經`, system: 'nervous', kind: 'nerve',
        tubes: [{pts: [hi, add(pirLo, P(S.sx * -.005, -.004, -.010)), spineP, oiT], r: [.0012, .0008], samples: 28}],
        card: {origin: ['Sacral plexus (L5–S1)', '薦神經叢（L5–S1）'], course: ['Leaves through the greater sciatic foramen, crosses the ischial spine and re-enters the pelvis through the lesser sciatic foramen to obturator internus; gives a branch to gemellus superior', '經坐骨大孔出骨盆，越過坐骨棘，再經坐骨小孔回到閉孔內肌；並分支至上孖肌'], supply: ['Obturator internus and gemellus superior', '閉孔內肌與上孖肌']}, refs: [GRAYS]});
      const fem = `Femoral nerve.${S.s}`, vm = `${S.w} vastus medialis`, o = U.cen(`Femoral nerve.${S.s}`, P(S.sx * .060, .72, .04), .006), t = U.onSurface(vm, P(S.sx * .052, .610, .020), -.003);
      out.push({name: `${S.w} nerve to vastus medialis`, zh: `${S.zh}股內側肌神經`, system: 'nervous', kind: 'nerve',
        tubes: [{pts: [U.cen(fem, P(S.sx * .060, .80, .04), .006), add(lerp(o, t, .4), P(0, 0, .002)), t], r: [.0010, .0007], samples: 20}],
        card: {origin: ['Femoral nerve (posterior division)', '股神經（後股）'], course: ['Runs with the saphenous nerve in the adductor canal and enters vastus medialis (it gives off the articular branch to the knee)', '與隱神經一起走在內收肌管內，進入股內側肌（並發出膝關節支）'], supply: ['Vastus medialis and the knee joint', '股內側肌與膝關節']}, refs: [GRAYS]});
      const sural = `Sural nerve.${S.s}`, cf = `Common fibular nerve.${S.s}`;
      const cfo = U.cen(cf, P(S.sx * .110, .430, -.050), .005), skin = y => U.onSurface(`Lateral head of ${S.l} gastrocnemius`, P(S.sx * .110, y, -.085), .003);
      const l1 = skin(.360), l2 = skin(.290), l3 = skin(.230);
      out.push({name: `${S.w} lateral sural cutaneous nerve`, zh: `${S.zh}腓腸外側皮神經`, system: 'nervous', kind: 'nerve',
        tubes: [{pts: [cfo, l1, l2, l3], r: [.0009, .0006], samples: 24}],
        card: {origin: ['Common fibular nerve, in the popliteal fossa', '總腓神經（膕窩內）'], course: ['Pierces the deep fascia and descends over the lateral head of gastrocnemius; often gives the sural communicating branch', '穿出深筋膜，沿腓腸肌外側頭表面下行；常發出腓腸交通支'], supply: ['Skin of the lateral side of the leg', '小腿外側皮膚']}, refs: [GRAYS]});
      const sT = U.tips(sural, .006), sLow = sT.reduce((a, t) => t[1] < a[1] ? t : a), fifth = U.onSurface(`${S.w} fifth metatarsal bone`, P(S.sx * .120, .040, .020), .004);
      out.push({name: `${S.w} lateral dorsal cutaneous nerve`, zh: `${S.zh}足背外側皮神經`, system: 'nervous', kind: 'nerve', parent: sural,
        tubes: [{pts: [sLow, add(lerp(sLow, fifth, .55), P(0, 0, .004)), fifth], r: [.0007, .0005], samples: 18}],
        card: {origin: ['Sural nerve (terminal part)', '腓腸神經（末段）'], course: ['Passes behind and below the lateral malleolus and runs along the lateral border of the foot', '繞過外踝後下方，沿足外側緣前行'], supply: ['Skin of the lateral foot and the little toe', '足外側與小趾皮膚']}, refs: [GRAYS]});
      const dfn = `Deep fibular nerve.${S.s}`, dT = U.tips(dfn, .006), dLow = dT.reduce((a, t) => t[1] < a[1] ? t : a);
      const first = U.onSurface(`${S.w} first metatarsal bone`, P(S.sx * .060, .050, .050), .004), toe2 = U.onSurface(`${S.w} second metatarsal bone`, P(S.sx * .075, .050, .052), .004), lat = U.onSurface(`${S.w} extensor digitorum brevis`, P(S.sx * .110, .045, .035), -.001);
      out.push({name: `${S.w} medial branch of deep fibular nerve`, zh: `${S.zh}腓深神經內側支`, system: 'nervous', kind: 'nerve', parent: dfn,
        tubes: [{pts: [dLow, lerp(dLow, toe2, .5), toe2], r: [.0009, .0006], samples: 18}],
        card: {origin: ['Deep fibular nerve, at the ankle', '腓深神經（踝部）'], course: ['Runs on the dorsum of the foot lateral to the dorsalis pedis artery to the cleft between the 1st and 2nd toes', '沿足背走在足背動脈外側，到第一、二趾之間'], supply: ['Skin of the adjacent sides of the great and second toes', '拇趾與第二趾相對面的皮膚']}, refs: [GRAYS]});
      out.push({name: `${S.w} lateral branch of deep fibular nerve`, zh: `${S.zh}腓深神經外側支`, system: 'nervous', kind: 'nerve', parent: dfn,
        tubes: [{pts: [dLow, add(lerp(dLow, lat, .5), P(0, 0, .002)), lat], r: [.0009, .0006], samples: 18}],
        card: {origin: ['Deep fibular nerve, at the ankle', '腓深神經（踝部）'], course: ['Passes laterally under extensor digitorum longus and brevis tendons', '向外側走，經伸趾長肌與伸趾短肌腱深面'], supply: ['Extensor digitorum brevis and extensor hallucis brevis, and the tarsal and metatarsophalangeal joints', '伸趾短肌與伸拇短肌，及跗骨、蹠趾關節']}, refs: [GRAYS]});
    }
  }
  return out;
}
