// Retinacula and tendon sheaths of the upper limb taken from the Z-Anatomy muscular model (CC BY-SA 4.0), vendored in scripts/data/zanatomy-upper-limb.json.gz by
// scripts/extract-zanatomy-limb.mjs and already registered to the atlas frame. Each part is skinned like the muscle whose tendon it encloses (same profile and box), so the
// tendons keep their place inside the sheaths and under the retinacula when the wrist or the shoulder moves.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {atlasParts} from '../lib/tendon-set.mjs';

const data = JSON.parse(gunzipSync(fs.readFileSync(new URL('../data/zanatomy-upper-limb.json.gz', import.meta.url))));
const tissue = JSON.parse(fs.readFileSync(new URL('../../app/biomechanics-v2/tissue-bindings.json', import.meta.url), 'utf8'));
const MODEL = ['The shape follows an open anatomical model of this structure, placed on the bones of this atlas.', '形狀依開放解剖模型的對應構造，並對位到本圖譜的骨骼。'];
// [name, zh, kind, host muscle (right-side atlas name) whose binding it takes, card]
const ITEMS = {
  'extensor retinaculum of wrist': ['腕伸肌支持帶', 'retinaculum', 'Right extensor digitorum', {
    origin: ['Lateral margin of the distal radius; ulnar side: styloid process of the ulna, triquetrum and pisiform', '橈側：橈骨遠端外側緣；尺側：尺骨莖突、三角骨與豌豆骨'],
    course: ['A broad band across the back of the wrist that lies over the six dorsal compartments and sends septa down to the radius and ulna to form them', '橫跨腕背的寬帶，蓋在六個伸肌間隔上，並向深處發出纖維隔連到橈骨與尺骨而形成各間隔'],
    action: ['Holds the extensor tendons against the bones so that they do not bowstring when the wrist extends', '把伸肌腱壓在骨面上，使腕伸直時肌腱不會離骨拱起']}],
  'flexor retinaculum of wrist': ['腕屈肌支持帶', 'retinaculum', 'Right flexor digitorum superficialis', {
    origin: ['Ulnar side: pisiform and hook of the hamate; radial side: tubercle of the scaphoid and the trapezium', '尺側：豌豆骨與鉤骨鉤；橈側：舟狀骨結節與大多角骨'],
    course: ['A strong band that roofs the carpal arch and turns it into the carpal tunnel; the tendons of flexor digitorum superficialis and profundus, flexor pollicis longus and the median nerve pass under it, the tendon of palmaris longus, the ulnar nerve and artery pass over it', '蓋在腕骨弓上、把它封成腕隧道的強韌帶；屈指淺肌與深肌腱、屈拇長肌腱和正中神經在它深面通過，掌長肌腱、尺神經與尺動脈在它淺面通過'],
    action: ['Keeps the long flexor tendons in the carpal tunnel and gives origin to the thenar and hypothenar muscles', '把屈肌腱固定在腕隧道內，並是魚際肌與小魚際肌的起點之一']}],
  'first dorsal compartment of wrist': ['腕背第一伸肌間隔', 'sheath', 'Right abductor pollicis longus', {
    origin: ['Lateral side of the distal radius, over the styloid process', '橈骨遠端外側，莖突上方'],
    course: ['Holds the tendons of abductor pollicis longus and extensor pollicis brevis; their tendons form the radial border of the anatomical snuffbox', '容納外展拇長肌腱與伸拇短肌腱；兩條肌腱構成解剖鼻煙盒的橈側緣'],
    action: ['A synovial tunnel in which the two tendons glide', '兩條肌腱在其中滑動的滑膜通道']}],
  'second dorsal compartment of wrist': ['腕背第二伸肌間隔', 'sheath', 'Right extensor carpi radialis longus', {
    origin: ['Dorsal surface of the distal radius, lateral to the dorsal tubercle', '橈骨遠端背面，背側結節的外側'],
    course: ['Holds the tendons of extensor carpi radialis longus and brevis, which cross under the tendons of the first compartment', '容納橈側伸腕長肌腱與短肌腱；它們從第一間隔的肌腱深面越過'],
    action: ['A synovial tunnel in which the two tendons glide', '兩條肌腱在其中滑動的滑膜通道']}],
  'third dorsal compartment of wrist': ['腕背第三伸肌間隔', 'sheath', 'Right extensor pollicis longus', {
    origin: ['Dorsal surface of the distal radius, round the dorsal tubercle', '橈骨遠端背面，繞過背側結節'],
    course: ['Holds the tendon of extensor pollicis longus, which turns round the dorsal tubercle and forms the ulnar border of the anatomical snuffbox', '容納伸拇長肌腱；肌腱繞過背側結節，構成解剖鼻煙盒的尺側緣'],
    action: ['A synovial tunnel in which the tendon glides', '肌腱在其中滑動的滑膜通道']}],
  'fourth dorsal compartment of wrist': ['腕背第四伸肌間隔', 'sheath', 'Right extensor digitorum', {
    origin: ['Dorsal surface of the distal radius, medial to the dorsal tubercle', '橈骨遠端背面，背側結節的內側'],
    course: ['Holds the four tendons of extensor digitorum and the tendon of extensor indicis; the posterior interosseous nerve lies on its floor', '容納伸指肌的四條肌腱與伸食指肌腱；骨間後神經位於其底面'],
    action: ['A synovial tunnel in which the tendons glide', '肌腱在其中滑動的滑膜通道']}],
  'fifth dorsal compartment of wrist': ['腕背第五伸肌間隔', 'sheath', 'Right extensor digiti minimi', {
    origin: ['Over the distal radio-ulnar joint', '位於遠端橈尺關節上方'],
    course: ['Holds the tendon of extensor digiti minimi', '容納伸小指肌腱'],
    action: ['A synovial tunnel in which the tendon glides', '肌腱在其中滑動的滑膜通道']}],
  'sixth dorsal compartment of wrist': ['腕背第六伸肌間隔', 'sheath', 'Right extensor carpi ulnaris', {
    origin: ['Groove beside the head of the ulna', '尺骨頭旁的溝'],
    course: ['Holds the tendon of extensor carpi ulnaris', '容納尺側伸腕肌腱'],
    action: ['A synovial tunnel in which the tendon glides', '肌腱在其中滑動的滑膜通道']}],
  'common flexor tendon sheath': ['屈肌總腱鞘', 'sheath', 'Right flexor digitorum superficialis', {
    origin: ['Carpal tunnel (the ulnar bursa)', '腕隧道（尺側滑液囊）'],
    course: ['One synovial sheath that wraps the tendons of flexor digitorum superficialis and profundus as they pass under the flexor retinaculum; it continues along the little finger', '把屈指淺肌與深肌腱在屈肌支持帶下一起包住的滑膜鞘，並延續到小指'],
    action: ['Lets the finger flexor tendons glide against one another and against the carpal tunnel', '讓屈指肌腱彼此間與對腕隧道壁滑動']}],
  'flexor pollicis longus tendon sheath': ['屈拇長肌腱鞘', 'sheath', 'Right flexor pollicis longus', {
    origin: ['Carpal tunnel (the radial bursa)', '腕隧道（橈側滑液囊）'],
    course: ['A synovial sheath round the tendon of flexor pollicis longus from the carpal tunnel to the thumb', '包住屈拇長肌腱，由腕隧道延伸到拇指的滑膜鞘'],
    action: ['Lets the tendon glide', '讓肌腱滑動']}],
  'flexor carpi radialis tendon sheath': ['橈側屈腕肌腱鞘', 'sheath', 'Right flexor carpi radialis', {
    origin: ['Groove of the trapezium, in the lateral part of the flexor retinaculum', '大多角骨的溝，位於屈肌支持帶外側部'],
    course: ['A synovial sheath round the tendon of flexor carpi radialis in its own tunnel', '包住橈側屈腕肌腱、位於專屬通道內的滑膜鞘'],
    action: ['Lets the tendon glide', '讓肌腱滑動']}],
  'intertubercular tendon sheath': ['結節間腱鞘', 'sheath', 'Long head of right biceps brachii', {
    origin: ['Intertubercular groove of the humerus', '肱骨結節間溝'],
    course: ['An extension of the synovial membrane of the shoulder joint that wraps the tendon of the long head of biceps brachii in the groove, under the transverse humeral ligament', '肩關節滑膜的延伸，在結節間溝內包住肱二頭肌長頭腱，上方有橫肱韌帶蓋住'],
    action: ['Lets the tendon glide in the groove', '讓肌腱在溝內滑動']}],
};

export default function zanatomyUpperLimb() {
  const {parts} = atlasParts(), out = [];
  for (const m of data.meshes) {
    const bare = m.name.replace(/^(Right|Left) /, ''), side = m.side, W = side === 'left' ? 'Left' : 'Right';
    const item = ITEMS[bare]; if (!item) continue;
    // the flexor retinaculum keeps the atlas spelling of the mesh it replaces, which the carpal-tunnel boundary list matches
    const name = bare === 'flexor retinaculum of wrist' ? `Flexor retinaculum of ${side} wrist` : m.name;
    const [zh, kind, host, card] = item, hostName = side === 'left' ? host.replace(/Right/g, 'Left').replace(/right/g, 'left') : host;
    const hostPart = parts.find(p => p.name === hostName); if (!hostPart) throw new Error('no host ' + hostName);
    const b = tissue[hostPart.id], f32 = (s, T) => { const buf = Buffer.from(s, 'base64'); return new T(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length)); };
    out.push({
      name, zh: `${side === 'left' ? '左' : '右'}${zh}`, system: 'connective', kind, model: 'zanatomy', cap: 1e9,
      geometry: [{positions: f32(m.positions, Float32Array), indices: f32(m.indices, Uint32Array)}],
      binding: {name, side, profile: b.profile, box: hostPart.bounds},
      card: {...card, supply: card.action}, note: MODEL,
    });
  }
  return out;
}
