// Retinacula and fasciae of the lower limb taken from the Z-Anatomy muscular model (CC BY-SA 4.0), vendored in scripts/data/zanatomy-lower-limb.json.gz by scripts/extract-zanatomy-leg.mjs and
// already registered to the atlas frame (bone surfaces matched to about 4 mm). Their motion is anchored by attachment points measured on the bones of this atlas: the line a→b and the two frames
// (1 thigh, 2 shank, 3 foot, 4 patella) of app/biomechanics-v2/body-motion.ts, so that both ends stay on their bone and the part between stretches with the joint.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';

const data = JSON.parse(gunzipSync(fs.readFileSync(new URL('../data/zanatomy-lower-limb.json.gz', import.meta.url))));
const MODEL = ['The shape follows an open anatomical model of this structure, placed on the bones of this atlas; its attachments are anchored to the bones.', '形狀依開放解剖模型的對應構造，並對位到本圖譜的骨骼；附著處固定在骨上。'];
const REF = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.); Moore’s Clinically Oriented Anatomy, 8th ed.';
const P = (...a) => a;
// [zh, kind, card, how it is anchored: (U, S, side) => {frame} | {ends, a, b}]
const ITEMS = {
  'superior extensor retinaculum of foot': ['伸肌上支持帶', 'retinaculum', {
    origin: ['Anterior borders of the distal tibia and fibula', '脛骨與腓骨遠端的前緣'],
    course: ['A transverse band across the front of the lower leg, just above the ankle; the tendons of tibialis anterior, extensor hallucis longus and extensor digitorum longus, the anterior tibial vessels and the deep fibular nerve pass under it', '橫跨小腿下部前方、踝上方的橫帶；脛前肌腱、伸拇趾長肌腱、伸趾長肌腱，以及脛前血管與腓深神經從它深面通過'],
    action: ['Holds the extensor tendons against the front of the leg so that they do not bowstring when the ankle dorsiflexes', '把伸肌腱壓在小腿前方，使踝背屈時肌腱不會拱起']},
    (U, S) => ({ends: [2, 2], a: U.extreme(`${S.w} tibia`, P(0, 1, 0), {y: [.1, .14]}), b: U.extreme(`${S.w} fibula`, P(0, 1, 0), {y: [.1, .14]})})],
  'inferior extensor retinaculum of foot': ['伸肌下支持帶', 'retinaculum', {
    origin: ['Lateral side: upper surface of the calcaneus, in front of the sulcus calcanei (sinus tarsi)', '外側：跟骨上面，跗骨竇（跟骨溝）的前方'],
    course: ['A Y-shaped band over the front of the ankle and the dorsum of the foot: the single lateral root splits into an upper limb that ends on the medial malleolus and a lower limb that runs to the medial side of the foot; the extensor tendons run through its loops, the dorsalis pedis artery and the deep fibular nerve pass under it', 'Y 形的帶，位於踝前與足背：外側單一根部分成兩支，上支止於內踝，下支走向足內側；伸肌腱穿過它形成的環，足背動脈與腓深神經從它深面通過'],
    insertion: ['Medial malleolus (upper limb) and the plantar aponeurosis on the medial side of the foot (lower limb)', '內踝（上支）與足內側的足底腱膜（下支）'],
    action: ['Keeps the extensor tendons of the foot in place on the dorsum of the ankle during dorsiflexion', '在踝背屈時把足背的伸肌腱固定在原位']},
    (U, S) => ({ends: [3, 2], a: U.extreme(`${S.w} calcaneus`, P(S.sx, 0, 0), {y: [.03, .06], z: [-.02, .0]}), b: U.extreme(`${S.w} tibia`, P(0, -1, 0), {x: S.sx < 0 ? [-.07, 0] : [0, .07]})})],
  'plantar aponeurosis': ['足底腱膜', 'aponeurosis', {
    origin: ['Medial process of the calcaneal tuberosity', '跟骨粗隆的內側突'],
    course: ['A thick fibrous sheet over the muscles of the sole that fans out towards the toes into five bands, one to each toe, and is continuous with the fibrous sheaths of the flexor tendons', '覆在足底肌肉上的厚纖維膜，向趾端散開成五條帶，各到一趾，並與屈肌腱的纖維鞘相連'],
    insertion: ['Fibrous sheaths of the flexor tendons and the bases of the proximal phalanges of the toes', '屈肌腱的纖維鞘與各趾近節趾骨底'],
    action: ['Supports the longitudinal arch of the foot like a tie-beam and tightens when the toes are extended (windlass mechanism)', '像拉桿般支撐足縱弓，趾伸直時繃緊（絞盤機制）']},
    (U, S) => ({ends: [3, 3], a: U.extreme(`${S.w} calcaneus`, P(0, -1, 0)), b: U.extreme(`${S.w} first metatarsal bone`, P(0, -1, 1))})],
  'medial patellar retinaculum': ['髕內側支持帶', 'retinaculum', {
    origin: ['Medial border of the patella and the edge of the quadriceps tendon (from vastus medialis)', '髕骨內側緣與股四頭肌腱邊緣（自股內側肌）'],
    course: ['A thin layer that passes beside the patella to the medial tibial condyle and the medial epicondyle of the femur', '薄層，走在髕骨內側，連到脛骨內側髁與股骨內上髁'],
    insertion: ['Medial condyle of the tibia', '脛骨內側髁'],
    action: ['Holds the patella in the trochlear groove and resists lateral displacement of the patella', '把髕骨固定在滑車溝內，抵抗髕骨向外側脫位']},
    (U, S) => ({ends: [1, 2], a: U.extreme(`${S.w} femur`, P(-S.sx, 0, 0), {y: [.455, .5]}), b: U.extreme(`${S.w} tibia`, P(-S.sx, 0, 0), {y: [.40, .46]})})],
  'lateral patellar retinaculum': ['髕外側支持帶', 'retinaculum', {
    origin: ['Lateral border of the patella and the edge of the quadriceps tendon (from vastus lateralis); reinforced by the iliotibial tract', '髕骨外側緣與股四頭肌腱邊緣（自股外側肌）；由髂脛束加強'],
    course: ['A thin layer that passes beside the patella to the lateral tibial condyle and the lateral epicondyle of the femur', '薄層，走在髕骨外側，連到脛骨外側髁與股骨外上髁'],
    insertion: ['Lateral condyle of the tibia', '脛骨外側髁'],
    action: ['Holds the patella in the trochlear groove and resists medial displacement of the patella', '把髕骨固定在滑車溝內，抵抗髕骨向內側脫位']},
    (U, S) => ({ends: [1, 2], a: U.extreme(`${S.w} femur`, P(S.sx, 0, 0), {y: [.455, .5]}), b: U.extreme(`${S.w} tibia`, P(S.sx, 0, 0), {y: [.40, .46]})})],
};

export default function zanatomyLowerLimb(U) {
  const out = [];
  for (const m of data.meshes) {
    const bare = m.name.replace(/^(Right|Left) /, ''), side = m.side, W = side === 'left' ? 'Left' : 'Right', item = ITEMS[bare]; if (!item) continue;
    const [zh, kind, card, anchor] = item, S = {w: W, sx: side === 'left' ? 1 : -1}, name = m.name, a = anchor(U, S);
    const f32 = (s, T) => { const buf = Buffer.from(s, 'base64'); return new T(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length)); };
    out.push({
      name, zh: `${side === 'left' ? '左' : '右'}${zh}`, system: 'connective', kind, model: 'zanatomy', cap: 1e9,
      geometry: [{positions: f32(m.positions, Float32Array), indices: f32(m.indices, Uint32Array)}],
      binding: {name, rig: side === 'left' ? 'leftLeg' : 'rightLeg', frame: a.frame ?? null, ...(a.ends ? {ends: a.ends, a: a.a, b: a.b} : {})},
      card: {...card, supply: card.action}, note: MODEL, refs: [REF],
    });
  }
  return out;
}
