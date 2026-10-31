// Ligaments, retinacula and fibrous arches of the leg and ankle that the atlas lacks or draws crudely, built as bands and cords between landmarks measured on the bone meshes of this atlas
// (procedural; no third-party geometry). They are schematic: the attachment points are measured on the bones, width and thickness are typical values. Each binding anchors the two ends to their
// bone frames (1 thigh, 2 shank, 3 foot, 4 patella; see app/biomechanics-v2/body-motion.ts), so both ends stay on their bone and the part between stretches with the joint.
import {add, mul, lerp, sub, unit, len} from '../lib/paokao-util.mjs';

const REF = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.); Moore’s Clinically Oriented Anatomy, 8th ed.';
const SIDES = [{w: 'Right', l: 'right', sx: -1, zh: '右'}, {w: 'Left', l: 'left', sx: 1, zh: '左'}];
const MODEL = ['Schematic band or cord between measured bony attachment points; width and thickness are typical values.', '示意帶或索：兩端落在實測的骨性附著點，寬度與厚度為典型值。'];
const P = (x, y, z) => [x, y, z];

export default function ligamentsLowerLimb(U) {
  const out = [];
  for (const S of SIDES) {
    const sx = S.sx, lat = P(sx, 0, 0), med = P(-sx, 0, 0), rig = S.l === 'left' ? 'leftLeg' : 'rightLeg';
    const fib = `${S.w} fibula`, tib = `${S.w} tibia`, tal = `${S.w} talus`, cal = `${S.w} calcaneus`, nav = `Navicular bone of ${S.l} foot`, fem = `${S.w} femur`;
    const X = (a, b) => sx < 0 ? [-b, -a] : [a, b];
    const on = (bone, p, off = -.0006) => U.onSurface(bone, p, off);
    const push = (name, zh, kind, geometry, card, ends, a, b) => out.push({name: `${S.w} ${name}`, zh: `${S.zh}${zh}`, system: 'connective', kind, model: 'procedural', cap: 1e9, geometry: [geometry], card: {...card, supply: card.action}, note: MODEL, refs: [REF],
      binding: {name: `${S.w} ${name}`, rig, frame: null, ends, a, b}});
    const band = (pts, width, thick, hint) => U.ribbon(pts, width, thick, hint, 24);
    const cord = (pts, r) => U.tube(pts, r, r, 24, 10);
    const bow = (a, b, dir, amount) => add(lerp(a, b, .5), mul(unit(dir), amount));
    // ---- Anterior talofibular ligament: from the front of the lateral malleolus forwards and a little medially to the lateral surface of the talar neck, in front of the fibular facet.
    {
      const a = on(fib, U.extreme(fib, P(0, 0, 1), {y: [.058, .072]})), b = on(tal, U.extreme(tal, lat, {z: [-.026, -.012]}));
      push('anterior talofibular ligament', '前距腓韌帶', 'ligament', band([a, bow(a, b, lat, .0015), b], .008, .0022, P(1, 0, 0)),
        {origin: ['Anterior margin of the lateral malleolus', '外踝前緣'], course: ['A flat band that runs forwards and slightly medially, almost horizontally, across the front of the ankle joint capsule', '扁平的帶，向前並稍向內側幾乎水平走行，橫過踝關節囊的前方'], insertion: ['Lateral surface of the neck of the talus, in front of the fibular facet', '距骨頸的外側面，位於腓骨關節面的前方'],
          action: ['Resists forward displacement of the talus and inversion of the plantar-flexed foot; it is the ligament torn most often in an ankle sprain', '抵抗距骨向前移位與蹠屈足的內翻；是踝關節扭傷最常撕裂的韌帶']}, [2, 3], a, b);
    }
    // ---- Posterior talofibular ligament: from the malleolar fossa on the inner side of the lateral malleolus, backwards and medially to the posterior process of the talus.
    {
      const a = on(fib, U.extreme(fib, med, {y: [.056, .072], z: [-.052, -.040]})), b = on(tal, U.extreme(tal, P(0, 0, -1)));
      push('posterior talofibular ligament', '後距腓韌帶', 'ligament', band([a, bow(a, b, P(0, 0, -1), .0015), b], .008, .0022, P(0, 0, 1)),
        {origin: ['Malleolar fossa on the medial side of the lateral malleolus', '外踝內側的外踝窩'], course: ['A strong band that runs medially and slightly backwards, almost horizontally, behind the ankle joint', '強韌的帶，向內側並稍向後、近乎水平地走在踝關節後方'], insertion: ['Lateral tubercle of the posterior process of the talus', '距骨後突的外側結節'],
          action: ['Resists backward displacement of the talus and extreme dorsiflexion; the strongest of the three lateral ligaments and rarely torn on its own', '抵抗距骨向後移位與過度背屈；是三條外側韌帶中最強的，很少單獨撕裂']}, [2, 3], a, b);
    }
    // ---- Calcaneofibular ligament: a round cord from the tip of the lateral malleolus down and back to the lateral surface of the calcaneus, under the tendons of fibularis longus and brevis.
    {
      const a = on(fib, add(U.extreme(fib, P(0, -1, 0)), P(0, .001, .003))), b = on(cal, U.extreme(cal, lat, {y: [.028, .05], z: [-.05, -.034]}));
      push('calcaneofibular ligament', '跟腓韌帶', 'ligament', cord([a, bow(a, b, lat, .002), b], .0027),
        {origin: ['Tip (anterior part) of the lateral malleolus', '外踝尖（前部）'], course: ['A round cord that runs downwards and backwards, deep to the tendons of fibularis longus and brevis, across both the ankle and the subtalar joint', '圓索，向後下走，在腓長肌腱與腓短肌腱的深面，橫跨踝關節與距下關節'], insertion: ['Lateral surface of the calcaneus, behind the fibular trochlea', '跟骨外側面，位於腓骨滑車後方'],
          action: ['Resists inversion of the dorsiflexed foot and stabilises the subtalar joint', '抵抗背屈足的內翻，並穩定距下關節']}, [2, 3], a, b);
    }
    // ---- Anterior tibiotalar ligament (the deep anterior part of the deltoid ligament): from the front of the medial malleolus to the medial surface of the talus.
    {
      const a = on(tib, add(U.extreme(tib, P(0, -1, 0), {x: X(0, .07)}), P(0, .002, .004))), b = on(tal, U.extreme(tal, med, {z: [-.03, -.012]}));
      push('anterior tibiotalar ligament', '脛距前韌帶', 'ligament', band([a, bow(a, b, med, .0015), b], .009, .0024, P(1, 0, 0)),
        {origin: ['Anterior colliculus of the medial malleolus', '內踝前丘'], course: ['A short flat band that runs forwards and downwards on the medial side of the ankle, deep to the other parts of the deltoid ligament', '短而扁的帶，在踝內側向前下走行，位於三角韌帶其他部分的深面'], insertion: ['Medial surface of the talus, near its neck', '距骨內側面，靠近頸部'],
          action: ['The anterior deep part of the deltoid ligament: resists eversion and forward displacement of the talus', '三角韌帶的前深部：抵抗足外翻與距骨向前移位']}, [2, 3], a, b);
    }
    // ---- Plantar calcaneonavicular (spring) ligament: a broad band from the front of the sustentaculum tali to the plantar surface of the navicular, forming part of the socket for the head of the talus.
    {
      const a = on(cal, U.extreme(cal, P(-sx * .5, .3, 1), {y: [.03, .055], z: [-.04, -.01]})), b = on(nav, U.extreme(nav, P(-sx * .5, -1, .3)));
      push('plantar calcaneonavicular ligament', '跟舟足底韌帶（彈簧韌帶）', 'ligament', band([a, bow(a, b, P(0, -1, 0), .0015), b], .014, .0032, P(0, 1, 0)),
        {origin: ['Anterior margin of the sustentaculum tali of the calcaneus', '跟骨載距突的前緣'], course: ['A broad, thick band that runs forwards under the head of the talus, which rests on it; the tendon of tibialis posterior runs beneath it', '寬而厚的帶，向前走在距骨頭下方，距骨頭坐在其上；脛後肌腱在它下方通過'], insertion: ['Plantar surface and tuberosity of the navicular', '舟狀骨的蹠面與粗隆'],
          action: ['Supports the head of the talus and the medial longitudinal arch of the foot; when it gives way the arch flattens', '支撐距骨頭與足內側縱弓；它鬆弛時縱弓塌平']}, [3, 3], a, b);
    }
    // ---- Fibular (lateral) collateral ligament of the knee: a round cord from the lateral epicondyle of the femur down and a little back to the head of the fibula.
    {
      const a = on(fem, U.extreme(fem, lat, {y: [.455, .495]})), b = on(fib, U.extreme(fib, lat, {y: [.405, .435]}));
      push('fibular collateral ligament', '腓側副韌帶', 'ligament', cord([a, bow(a, b, P(sx, 0, 0), .0012), b], .0028),
        {origin: ['Lateral epicondyle of the femur, just above the groove for the popliteus tendon', '股骨外上髁，位於膕肌腱溝的上方'], course: ['A round cord that runs down and slightly backwards, outside the joint capsule; the tendon of biceps femoris splits round its lower end and the tendon of popliteus passes deep to it', '圓索，向下並稍向後走在關節囊外；股二頭肌腱在其下端分成兩股包住它，膕肌腱從它深面通過'], insertion: ['Lateral surface of the head of the fibula, in front of its apex', '腓骨頭外側面，位於尖端的前方'],
          action: ['Resists varus (adduction) force on the knee; taut when the knee is extended and slack in flexion', '抵抗膝的內翻（內收）外力；膝伸直時繃緊，屈曲時鬆弛']}, [1, 2], a, b);
    }
    // ---- Retinacula of the ankle that hold tendons: each is a sheet laid on the bones and on the tendons that it holds down (the sheet is pulled onto the nearest surface of the bones and of
    // the muscle meshes, whose last centimetres are the tendons), so it roofs them instead of cutting through them. Both ends rest on their bones.
    {
      const medM = U.extreme(tib, P(-sx, -.8, .1), {y: [.06, .12]}), latM = U.extreme(fib, P(sx, -.8, 0)), mm = add(medM, P(-sx * .004, -.002, -.004));
      const calM = U.extreme(cal, P(-sx, 0, -.3), {y: [.02, .06]}), latCal = U.extreme(cal, P(sx, 0, -.2), {y: [.02, .06]}), lm = add(latM, P(sx * .004, 0, -.004));
      const m = n => `${S.w} ${n}`, tarsal = [tib, tal, cal, m('tibialis posterior'), m('flexor digitorum longus'), m('flexor hallucis longus')].filter(U.has), fibular = [fib, cal, tal, m('fibularis longus'), m('fibularis brevis')].filter(U.has);
      push('flexor retinaculum of ankle', '踝屈肌支持帶', 'retinaculum', U.conformingSheet([add(mm, P(0, .016, 0)), add(calM, P(0, .022, 0)), add(calM, P(0, -.008, 0)), add(mm, P(0, -.014, 0))], tarsal, .0012, .0014, .0025, P(-sx * .014, 0, -.004)),
        {origin: ['Medial malleolus', '內踝'], course: ['A band that runs from the medial malleolus down and back to the medial surface of the calcaneus and roofs the tarsal tunnel; under it, from front to back, pass the tendons of tibialis posterior and flexor digitorum longus, the posterior tibial artery and vein and the tibial nerve, and the tendon of flexor hallucis longus', '由內踝向後下連到跟骨內側面、構成跗隧道頂的帶；從前到後依序有脛後肌腱、屈趾長肌腱、脛後動脈與靜脈、脛神經，以及屈拇趾長肌腱從它深面通過'], insertion: ['Medial surface of the calcaneus', '跟骨內側面'],
          action: ['Holds the flexor tendons and the neurovascular bundle against the medial side of the ankle and forms the roof of the tarsal tunnel', '把屈肌腱與神經血管束固定在踝內側，並構成跗隧道的頂']}, [2, 3], medM, calM);
      push('superior fibular retinaculum', '腓骨肌上支持帶', 'retinaculum', U.conformingSheet([add(lm, P(0, .008, 0)), add(latCal, P(0, .019, 0)), add(latCal, P(0, .005, 0)), add(lm, P(0, -.008, 0))], fibular, .0012, .0014, .0025, P(sx * .012, 0, -.004)),
        {origin: ['Posterior margin of the lateral malleolus', '外踝後緣'], course: ['A band that arches back from the lateral malleolus over the tendons of fibularis longus and brevis to the calcaneus, and holds them in the groove behind the malleolus', '從外踝向後弓起，越過腓長肌腱與腓短肌腱連到跟骨，把它們固定在外踝後方的溝內'], insertion: ['Lateral surface of the calcaneus', '跟骨外側面'],
          action: ['Keeps the tendons of fibularis longus and brevis behind the lateral malleolus; when it tears they slip forwards over the malleolus (peroneal tendon subluxation)', '使腓長肌腱與腓短肌腱留在外踝後方；撕裂時肌腱會向前滑過外踝（腓骨肌腱脫位）']}, [2, 3], latM, latCal);
      push('inferior fibular retinaculum', '腓骨肌下支持帶', 'retinaculum', U.conformingSheet([add(latCal, P(0, .016, .004)), add(latCal, P(0, .016, .030)), add(latCal, P(0, .004, .030)), add(latCal, P(0, .004, .004))], [cal, m('fibularis longus'), m('fibularis brevis')].filter(U.has), .0012, .0014, .0025),
        {origin: ['Lateral surface of the calcaneus, behind the fibular trochlea', '跟骨外側面，位於腓骨滑車後方'], course: ['A band over the tendons of fibularis longus and brevis on the lateral surface of the calcaneus; it is continuous above with the inferior extensor retinaculum and sends a septum to the fibular trochlea', '位於跟骨外側面、覆在腓長肌腱與腓短肌腱上的帶；向上與伸肌下支持帶相連，並發出一片纖維隔連到腓骨滑車'], insertion: ['Lateral surface of the calcaneus, in front of the fibular trochlea', '跟骨外側面，位於腓骨滑車前方'],
          action: ['Holds the tendons of fibularis longus and brevis against the calcaneus', '把腓長肌腱與腓短肌腱固定在跟骨上']}, [3, 3], latCal, add(latCal, P(0, 0, .03)));
    }
    // ---- Tendinous arch of soleus: the fibrous edge from the back of the fibular head to the soleal line of the tibia; popliteal vessels and tibial nerve pass under it.
    {
      const a = on(fib, U.extreme(fib, P(0, 0, -1), {y: [.405, .435]})), b = on(tib, U.extreme(tib, P(0, 0, -1), {y: [.33, .38], x: X(0, .07)})), m = add(lerp(a, b, .5), P(0, .0105, -.004));
      push('tendinous arch of soleus', '比目魚肌腱弓', 'ligament', band([a, lerp(a, m, .5), m, lerp(m, b, .5), b], .008, .0025, P(0, 0, 1)),
        {origin: ['Posterior surface of the head of the fibula (and the upper part of its shaft)', '腓骨頭後面（與腓骨體上部）'], course: ['A fibrous arch that bridges from the fibula to the soleal line of the tibia; the popliteal artery and vein and the tibial nerve pass deep to it, from the popliteal fossa into the posterior compartment of the leg', '由腓骨橫跨到脛骨比目魚肌線的纖維弓；膕動脈、膕靜脈與脛神經從它深面由膕窩進入小腿後區'], insertion: ['Soleal line on the back of the tibia', '脛骨後面的比目魚肌線'],
          action: ['Gives origin to soleus; its edge can compress the vessels and nerve passing under it (soleal sling syndrome)', '是比目魚肌的起點；其邊緣可壓迫通過其下的血管與神經（比目魚肌腱弓壓迫症）']}, [2, 2], a, b);
    }
    // ---- Pes anserinus: the conjoined insertion of the tendons of sartorius, gracilis and semitendinosus on the upper part of the medial surface of the tibia, drawn as the thin fibrous expansion that joins them.
    {
      const top = U.extreme(tib, med, {y: [.382, .392]}), bot = U.extreme(tib, med, {y: [.334, .344]}), d = P(0, 0, .014);
      const g = U.conformingSheet([sub(top, d), add(top, d), add(bot, mul(d, .6)), sub(bot, mul(d, .6))], [tib], .0008, .0014, .003);
      push('pes anserinus', '鵝足', 'aponeurosis', g,
        {origin: ['Tendons of sartorius, gracilis and semitendinosus, which join over the medial surface of the tibia', '縫匠肌腱、股薄肌腱與半腱肌腱，在脛骨內側面上方匯合'], course: ['A thin fibrous expansion (the “goose foot”) in which the three tendons end side by side, from front to back sartorius, gracilis and semitendinosus; the pes anserine bursa lies between it and the tibial collateral ligament', '薄的纖維擴張部（「鵝掌」），三條肌腱並排止於其中，由前向後為縫匠肌、股薄肌、半腱肌；它與脛側副韌帶之間有鵝足滑液囊'], insertion: ['Upper part of the medial surface of the tibia, below the tibial tuberosity level of the medial condyle', '脛骨內側面上部，位於內側髁下方'],
          action: ['Flexes the knee, rotates the flexed leg medially and resists valgus (abduction) stress on the knee', '屈膝、使屈曲的小腿內旋，並抵抗膝的外翻外力']}, [2, 2], top, bot);
    }
  }
  return out;
}
