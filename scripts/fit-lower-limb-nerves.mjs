// Fits the courses of the lower-limb nerves whose Z-Anatomy route does not match the BodyParts3D bones, and writes them to scripts/lib/lower-limb-nerve-paths.json.
// Every path is a short list of waypoints (millimetres, model frame, LEFT side; the right side is mirrored when the nerve stream is built) placed on landmarks measured
// on the atlas meshes: fibular neck, tibial medial border, tibial tuberosity and patellar ligament, the anterior tibial and dorsalis pedis arteries, the front of the
// ankle bones. The nerve tubes keep their own thickness and are moved onto these paths by scripts/lib/nerve-corrections.mjs.
//   node scripts/fit-lower-limb-nerves.mjs          (rewrites the JSON; needs the generated atlas, run `npm run predev` first)
import fs from 'node:fs';
import {loadWorld} from './lib/paokao-world.mjs';
import {smooth} from './lib/nerve-corrections.mjs';

const MM = 1000, w = loadWorld({paokao: true}), out = {};
const V = name => { const m = w.mesh(name), P = m.positions, o = []; for (let i = 0; i < P.length; i += 3) o.push([P[i] * MM, P[i + 1] * MM, P[i + 2] * MM]); return o; };
const d3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const add = (p, d) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
const mean = (pts, k) => pts.reduce((s, p) => s + p[k], 0) / pts.length;
const round = p => p.map(v => Math.round(v * 10) / 10);
const clouds = new Map();
/** Dense points on the surface of a mesh (a point every `sp` mm along every triangle). */
function cloud(name, sp = 2) {
  if (clouds.has(name)) return clouds.get(name);
  const m = w.mesh(name), P = m.positions, I = m.indices, pts = [];
  for (let t = 0; t < I.length; t += 3) {
    const a = [0, 1, 2].map(j => P[I[t] * 3 + j] * MM), b = [0, 1, 2].map(j => P[I[t + 1] * 3 + j] * MM), c = [0, 1, 2].map(j => P[I[t + 2] * 3 + j] * MM);
    const n = Math.max(1, Math.ceil(Math.max(d3(a, b), d3(b, c), d3(a, c)) / sp));
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) { const u = i / n, v = j / n, s = 1 - u - v; pts.push([0, 1, 2].map(k => a[k] * s + b[k] * u + c[k] * v)); }
  }
  clouds.set(name, pts); return pts;
}
/** Centre line of a vessel in 20 mm steps down the leg: at each height the vertices nearest to the previous centre. */
function centreline(name, y0, y1, step = 20) {
  const verts = V(name), res = []; let prev = null;
  for (let y = y1; y >= y0; y -= step) {
    const s = verts.filter(p => Math.abs(p[1] - y) < step / 2); if (!s.length) continue;
    const ref = prev ? s.reduce((a, p) => d3(p, prev) < d3(a, prev) ? p : a) : s[0], cl = s.filter(p => d3(p, ref) < 8);
    prev = [mean(cl, 0), y, mean(cl, 2)]; res.push(prev);
  }
  return res;
}
/** Highest (most anterior) z of the listed bones around (x, y) in a 7 mm × 6 mm window. */
function frontZ(x, y, names) {
  let best = -1e9; for (const n of names) for (const p of cloud(n)) if (Math.abs(p[0] - x) < 3.5 && Math.abs(p[1] - y) < 3 && p[2] > best) best = p[2];
  return best;
}
const L = n => `Left ${n}`;

// ------------------------------------------------------------------ Deep fibular nerve
// Gray's course: leaves the common fibular nerve at the neck of the fibula, winds round the neck (lateral then anterior), enters the anterior compartment, runs down on the front of the
// interosseous membrane beside the anterior tibial artery (lateral to it in the upper and lower thirds, in front of it in the middle third), and crosses the front of the ankle between the malleoli.
{
  const ata = centreline(L('anterior tibial artery'), 100, 380), at = y => ata.find(p => p[1] === y);
  const fib = cloud(L('fibula'), 1.5), neck = y => fib.filter(p => Math.abs(p[1] - y) < 2);
  const cfn = V('Common fibular nerve.l'); cfn.sort((a, b) => a[1] - b[1]); const top = cfn.slice(0, 40), a0 = [mean(top, 0), mean(top, 1), mean(top, 2)];   // lower end of the common fibular nerve
  const n380 = neck(380), n374 = neck(374);
  const lateral = [Math.max(...n380.map(p => p[0])) + 4.5, 380, mean(n380, 2) - 1];                                   // lateral surface of the neck, 4.5 mm out
  const anterior = [mean(n374, 0) + 2.5, 374, Math.max(...n374.map(p => p[2])) + 4.5];                                   // anterior surface of the neck, 4.5 mm out
  const off = y => y > 293 ? [4, 0, -4] : y > 187 ? [4.5, 0, -4] : [7.5, 0, -3];
  const legY = [340, 320, 300, 280, 260, 240, 220, 200, 180, 160, 140, 120];
  const bones = [L('tibia'), L('fibula'), L('talus'), 'Navicular bone of left foot', L('medial cuneiform bone'), L('intermediate cuneiform bone'), L('first metatarsal bone'), L('second metatarsal bone')];
  const front = (x, y) => [x, y, frontZ(x, y, bones) + 4];                                                          // 4 mm in front of the ankle and foot bones
  const wp = [a0, lateral, anterior, add(at(360), [4, 0, 2]), ...legY.map(y => add(at(y), off(y))), front(80, 100), front(79, 90), front(77, 82), front(77, 72), front(76, 62), front(76, 52), front(76, 45.2)];
  out['Deep fibular nerve.l.001'] = {rotate: true, pieces: [{path: wp.map(round)}]};
  // the muscular (lateral) branch leaves the trunk at the front of the lower tibia: it follows the displacement of the trunk at its root (old root measured on the unmodified mesh: 84, 80, -14.5)
  const pathPts = smooth(wp, 200), at80 = pathPts.reduce((b, p) => Math.abs(p[1] - 80) < Math.abs(b[1] - 80) ? p : b), oldRoot = [84, 80, -14.5];
  out['Muscular branches of deep fibular nerve.l.001'] = {taper: {from: oldRoot, shift: round([at80[0] - 84, 0, at80[2] + 14.5]), length: 30}};
}

// ------------------------------------------------------------------ Infrapatellar branch of the saphenous nerve
// Leaves the saphenous nerve behind the medial femoral condyle, curves round the medial tibial condyle and crosses the front of the knee just below the patella, over the upper end of
// the patellar ligament beside the tibial tuberosity (the tuberosity lies 413-434 mm, the patellar apex at about 440 mm).
{
  const tib = cloud(L('tibia'), 1.5), lig = L('patellar ligament'), pat = L('patella'), fr = [L('tibia'), lig, pat];
  const sap = V('Saphenous nerve.l').filter(p => p[1] > 386 && Math.abs(p[1] - 446) < 4), s0 = [mean(sap, 0), 446, mean(sap, 2)];
  const medial = y => { const s = tib.filter(p => Math.abs(p[1] - y) < 3), x0 = Math.min(...s.map(p => p[0])), e = s.filter(p => p[0] < x0 + 3); return [x0, mean(e, 2)]; };
  const [mx, mz] = medial(438);
  const wp = [s0, [mx - 3.5, 441, mz - 4], [mx - 2, 437, mz + 12], [mx + 12, 434, frontZ(mx + 14, 434, fr) + 3.5], [mx + 34, 432, frontZ(mx + 36, 432, fr) + 3.5], [78, 430, frontZ(78, 430, fr) + 3.5], [88, 429, frontZ(88, 429, fr) + 3]];
  out['Infrapatellar branch of saphenous nerve.l.001'] = {rotate: true, pieces: [{path: wp.map(round)}]};
}

// ------------------------------------------------------------------ Saphenous nerve (trunk below the knee)
// Runs down the medial border of the tibia with the great saphenous vein and passes in front of the medial malleolus. The Z-Anatomy trunk lies inside the tibia from mid-leg to the ankle,
// so below 330 mm it is moved to the medial border of the tibia (4.5 mm medial to the bone). The two side branches follow the trunk's displacement at their roots.
{
  const tib = cloud(L('tibia'), 1.5), border = [];
  for (let y = 330; y >= 100; y -= 15) { const s = tib.filter(p => Math.abs(p[1] - y) < 4), x0 = Math.min(...s.map(p => p[0])), e = s.filter(p => p[0] < x0 + 3); border.push([x0 - 4.5, y, mean(e, 2) - 1]); }
  const sm = border.map((p, i) => { const a = border[Math.max(0, i - 1)], b = border[Math.min(border.length - 1, i + 1)]; return [(a[0] + p[0] + b[0]) / 3, p[1], (a[2] + p[2] + b[2]) / 3]; });
  const wp = [[50.1, 384, -35.2], [53, 360, -23], [58, 340, -18.5], ...sm];
  out['Saphenous nerve.l.001'] = {rotate: true, pieces: [{at: [66, 240, -19], path: wp.map(round)}, {at: [62, 264, -31], follow: true}, {at: [52, 300, -85], follow: true}]};
}

// ------------------------------------------------------------------ Tibial nerve and the plantar nerves (tarsal tunnel)
// The tibial nerve runs beside the posterior tibial artery (just behind and lateral to it) and passes behind the medial malleolus through the tarsal tunnel, where it divides into the
// medial and lateral plantar nerves. In the Z-Anatomy mesh the nerve stays ~25 mm from the artery in the lower leg and misses the tunnel by 9 mm (it runs 19 mm too far back at the ankle).
// From 300 mm down it is blended onto the artery (3 mm lateral, 5 mm behind), and below 100 mm onto the middle of the tarsal tunnel; the plantar nerves follow the displacement of the
// division point and fade out over 35 mm.
{
  const old = {540: [77.3, -40.6], 520: [79.4, -41], 500: [84.3, -43.5], 480: [83.3, -51.8], 460: [80.5, -61.2], 440: [81.6, -65], 420: [84.4, -63.8], 400: [87.5, -61.2], 380: [90.1, -58.3], 360: [92.7, -54.4], 340: [95.2, -49.5],
    320: [95.2, -47.6], 300: [94.1, -47.3], 280: [91.1, -48.4], 260: [87.4, -50.3], 240: [84.3, -52.2], 220: [82.4, -53.8], 200: [81.8, -55.2], 180: [81.1, -56.6], 160: [79.5, -57.7], 140: [76.9, -58.3], 120: [74, -58.4]};   // measured on the unmodified Z-Anatomy mesh
  const pta = centreline(L('posterior tibial artery'), 100, 400), at = y => pta.find(p => p[1] === y);
  const wp = [];
  for (const y of Object.keys(old).map(Number).sort((a, b) => b - a)) {
    let x = old[y][0], z = old[y][1];
    if (y < 300) { const s = Math.min(1, (300 - y) / 150), k = s * s * (3 - 2 * s), t = at(y) ?? at(Math.round(y / 20) * 20); if (t) { x += (t[0] + 3 - x) * k; z += (t[2] - 5 - z) * k; } }
    wp.push([x, y, z]);
  }
  const tun = cloud(L('tarsal tunnel'), 1.5);
  for (const y of [100, 90, 80, 70, 65]) { const s = tun.filter(p => Math.abs(p[1] - y) < 3); wp.push([mean(s, 0) - 1, y, mean(s, 2) - 5]); }
  wp.push(add(wp[wp.length - 1], [-0.5, -5, -1]));   // the division point, 5 mm below the lower edge of the tunnel
  out['Tibial nerve.l.001'] = {rotate: true, pieces: [{path: wp.map(round)}]};
  const j = wp[wp.length - 1], j0 = [57.8, 59.2, -55.6], shift = round([j[0] - j0[0], j[1] - j0[1], j[2] - j0[2]]);
  for (const n of ['Medial plantar nerve.l.001', 'Lateral plantar nerve.l.001']) out[n] = {taper: {from: j0, shift, length: 35}};
}

fs.writeFileSync(new URL('./lib/lower-limb-nerve-paths.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
console.log('Lower-limb nerve paths written:', Object.keys(out).join(', '));
