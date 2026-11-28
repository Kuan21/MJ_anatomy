// The body surface follows the sex switch: in female mode the male skin (its penis and scrotum are part of the mesh) must not be drawn, and the female skin that replaces it must have no
// protrusion in the groin. Checks, on the same runtime catalogue the viewer builds:
//   1. the display rule: of the two skins and the two pubic-hair patches, exactly the male ones are drawn in male mode and exactly the female ones in female mode (also with every system on);
//   2. the female skin has the male skin's vertices (and only triangles of it), is identical to it outside the groin box, and is skinned with the same weights (so it moves with the body);
//   3. the front of the female skin on the midline between the thighs follows the female profile, while the male skin (control) stands well in front of it there;
//   4. the female pubic hair stays on the female surface (it does not stand out in front of it);
//   4b. no crease where the pressed-back area meets the skin around it (neighbouring-face angles along its sides and top stay within the range of the surrounding skin);
//   5. negative runs: the same protrusion test must fail for the male skin, and the display rule must tell the skins apart only by the sex flag.
// Prints only pass / fail and counts.
//   node scripts/test-female-skin.mjs
import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {quizModule} from './quiz-modules.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {displaySystem} from './lib/runtime-systems.mjs';
import {femaleSkin, GROIN_BOX, groinWeight, profileZ} from './lib/female-skin.mjs';

const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const V = await quizModule('app/mj-part-visibility.ts'), O = await quizModule('app/mj-owners.ts');
const {atlas, geometry} = loadFullAtlas();
const parts = atlas.parts.map(p => p.stream ? p : {...p, system: displaySystem(p)});
const ALL = ['skeletal', 'muscular', 'tendon', 'connective', 'arterial', 'venous', 'nervous', 'cardiac', 'respiratory', 'urinary', 'digestive', 'serous', 'lymphatic', 'reproductive', 'integumentary', 'endocrine', 'immune', 'special'];
const state = o => ({visible: ALL, selected: [], hiddenParts: [], focusParts: undefined, isolate: false, depthFilter: 'all', muscleRegion: undefined, muscleLayer: 'all', faceMuscleLayer: 'all', heartOpen: undefined, sex: undefined, hiddenSerous: [], ...o});
const fails = []; let checks = 0;
const ok = (cond, m) => { checks++; if (!cond) fails.push(m); };

// ---- 1. display rule
const named = (name, female) => parts.filter(p => p.system === 'integumentary' && p.name === name && (female ? p.sex === 'female' : p.sex !== 'female'));
const maleSkin = named('Skin', false), femaleSkinParts = named('Skin', true), maleHair = named('Pubic hair', false), femaleHair = named('Pubic hair', true);
ok(maleSkin.length === 1 && femaleSkinParts.length === 1, `expected one male and one female skin, found ${maleSkin.length} and ${femaleSkinParts.length}`);
ok(maleHair.length === 1 && femaleHair.length === 1, `expected one male and one female pubic-hair patch, found ${maleHair.length} and ${femaleHair.length}`);
const owners = O.buildOwners(parts);
for (const [sex, shown, hidden] of [['male', [...maleSkin, ...maleHair], [...femaleSkinParts, ...femaleHair]], ['female', [...femaleSkinParts, ...femaleHair], [...maleSkin, ...maleHair]], [undefined, [], [...maleSkin, ...maleHair, ...femaleSkinParts, ...femaleHair]]]) {
  for (const vis of [ALL, ['integumentary']]) {
    const v = V.partVisibility(owners, state({visible: vis, sex}));
    for (const p of shown) ok(v.base(p), `${sex ?? 'default'} mode: ${p.name} (${p.id}) is not drawn`);
    for (const p of hidden) ok(!v.base(p), `${sex ?? 'default'} mode: ${p.name} (${p.id}) is drawn but belongs to the other sex`);
  }
}
if (fails.length || !maleSkin[0] || !femaleSkinParts[0] || !maleHair[0] || !femaleHair[0]) { console.error(`FAIL female skin: ${fails.length} of ${checks} checks failed\n - ${fails.join('\n - ')}`); process.exit(1); }

// ---- 2. same mesh, identical outside the groin, same skinning
const mg = geometry(maleSkin[0]), fg = geometry(femaleSkinParts[0]);
ok(mg.positions.length === fg.positions.length, 'the female skin has another vertex count than the male skin');
const maleTris = new Set(); for (let t = 0; t < mg.indices.length; t += 3) maleTris.add(`${mg.indices[t]},${mg.indices[t + 1]},${mg.indices[t + 2]}`);
let foreign = 0; for (let t = 0; t < fg.indices.length; t += 3) if (!maleTris.has(`${fg.indices[t]},${fg.indices[t + 1]},${fg.indices[t + 2]}`)) foreign++;
ok(foreign === 0, `${foreign} triangles of the female skin are not triangles of the male skin`);
const dropped = (mg.indices.length - fg.indices.length) / 3;
ok(dropped >= 0 && dropped < .15 * mg.indices.length / 3, `the female skin drops ${dropped} triangles of the male skin (only a few hidden ones may go)`);
const BOX = GROIN_BOX;   // the groin box of scripts/lib/female-skin.mjs
let outsideMoved = 0, inside = 0, insideMoved = 0, maxMove = 0;
for (let i = 0; i < mg.positions.length; i += 3) {
  const d = Math.hypot(...[0, 1, 2].map(k => fg.positions[i + k] - mg.positions[i + k])), y = mg.positions[i + 1], z = mg.positions[i + 2], inBox = y >= BOX.y0 && y <= BOX.y1 && z >= BOX.zBack && Math.abs(mg.positions[i]) < .14;
  if (!inBox) { if (d > 1e-7) outsideMoved++; } else { inside++; if (d > 1e-6) insideMoved++; maxMove = Math.max(maxMove, d); }
}
ok(outsideMoved === 0, `${outsideMoved} skin vertices outside the groin box differ from the male skin`);
ok(insideMoved > 200, `only ${insideMoved} vertices of ${inside} in the groin box were moved (the protrusion is still there)`);
ok(maxMove < .12, `a skin vertex moved ${(maxMove * 1000).toFixed(0)} mm, more than the penis and scrotum protrude`);
const weights = JSON.parse(zlib.gunzipSync(fs.readFileSync(file('public/models/skin-weights.json.gz')))).parts;
ok(!!weights[femaleSkinParts[0].id] && JSON.stringify({...weights[maleSkin[0].id], name: 'Skin'}) === JSON.stringify(weights[femaleSkinParts[0].id] ?? null), 'the female skin is not skinned with the male skin weights');

// ---- 3. the groin front: highest z on the midline strip (|x| < 2 cm: the cleft between the thighs, where the penis and scrotum hang) by height band, 2 cm bands from 75 to 87 cm
const bands = []; for (let y = .75; y < .87; y += .02) bands.push([y, y + .02]);
const frontOf = (positions, [y0, y1]) => { let m = -Infinity; for (let i = 0; i < positions.length; i += 3) if (positions[i + 1] >= y0 && positions[i + 1] < y1 && Math.abs(positions[i]) < .02 && positions[i + 2] > -.005) m = Math.max(m, positions[i + 2]); return m; };
// the female profile of scripts/lib/female-skin.mjs (z of the front by height; the profile rises with height, so a band is held to its upper edge) plus 1.5 cm; the mound above 87.5 cm keeps the abdomen
const protrusion = positions => bands.map(b => ({band: b, front: frontOf(positions, b), limit: profileZ(b[1]) + .015})).filter(r => r.front > r.limit);
const femaleOver = protrusion(fg.positions), maleOver = protrusion(mg.positions);
ok(femaleOver.length === 0, `female skin protrudes in front of the female profile at ${femaleOver.map(r => `${(r.band[0] * 100).toFixed(0)} cm (+${((r.front - r.limit) * 1000).toFixed(0)} mm)`).join(', ')}`);
ok(maleOver.length >= 2, `control: the male skin should stand in front of the female profile in at least two height bands, found ${maleOver.length}`);

// ---- 4. the pubic hair follows the female surface
const hg = geometry(femaleHair[0]), hm = geometry(maleHair[0]);
const hairFront = (positions, [y0, y1]) => frontOf(positions, [y0, y1]);
let hairOver = 0; for (const b of bands) if (hairFront(hg.positions, b) > profileZ(b[1]) + .03) hairOver++;
ok(hairOver === 0, `the female pubic hair stands out in front of the female surface in ${hairOver} height bands`);
ok(hg.positions.length === hm.positions.length, 'the female pubic hair has another vertex count than the male one');

// ---- 5b. no crease where the reshaped area meets the surrounding skin: the angle between neighbouring faces along the sides and the top of the area (the transition ring) may not exceed
// the range of the untouched skin around it. (The lower end, where the surface turns into the gap between the thighs, is a real fold and is not part of this measure.)
function ringAngles(positions, indices) {
  const nt = indices.length / 3, N = new Float32Array(nt * 3), Cn = new Float32Array(nt * 3);
  for (let t = 0; t < nt; t++) {
    const a = indices[t * 3], b = indices[t * 3 + 1], c = indices[t * 3 + 2], P = positions;
    const ux = P[b * 3] - P[a * 3], uy = P[b * 3 + 1] - P[a * 3 + 1], uz = P[b * 3 + 2] - P[a * 3 + 2], vx = P[c * 3] - P[a * 3], vy = P[c * 3 + 1] - P[a * 3 + 1], vz = P[c * 3 + 2] - P[a * 3 + 2];
    const x = uy * vz - uz * vy, y = uz * vx - ux * vz, z = ux * vy - uy * vx, l = Math.hypot(x, y, z) || 1; N.set([x / l, y / l, z / l], t * 3);
    Cn.set([(P[a * 3] + P[b * 3] + P[c * 3]) / 3, (P[a * 3 + 1] + P[b * 3 + 1] + P[c * 3 + 1]) / 3, (P[a * 3 + 2] + P[b * 3 + 2] + P[c * 3 + 2]) / 3], t * 3);
  }
  const edges = new Map();
  for (let t = 0; t < nt; t++) for (let k = 0; k < 3; k++) { const a = indices[t * 3 + k], b = indices[t * 3 + (k + 1) % 3], key = a < b ? a * 1e6 + b : b * 1e6 + a; (edges.get(key) ?? edges.set(key, []).get(key)).push(t); }
  const ring = [], around = [];
  for (const ts of edges.values()) {
    if (ts.length !== 2) continue;
    const [s, t] = ts, c = [s, t].map(f => ({x: Cn[f * 3], y: Cn[f * 3 + 1], z: Cn[f * 3 + 2]}));
    if (c.some(q => q.z < GROIN_BOX.zBack || q.y < .79 || q.y > GROIN_BOX.y1 || Math.abs(q.x) > .14)) continue;
    const angle = Math.acos(Math.max(-1, Math.min(1, N[s * 3] * N[t * 3] + N[s * 3 + 1] * N[t * 3 + 1] + N[s * 3 + 2] * N[t * 3 + 2]))) * 180 / Math.PI, w = c.map(q => groinWeight(q.x, q.y));
    if (Math.min(...w) > .05 && Math.max(...w) < .95) ring.push(angle); else if (Math.max(...w) === 0) around.push(angle);
  }
  return {ring, around};
}
const limit = a => Math.max(...a);
const fa = ringAngles(fg.positions, fg.indices), ma = ringAngles(mg.positions, mg.indices);
ok(fa.ring.length > 50 && fa.around.length > 200, `too few edges measured (${fa.ring.length} in the transition ring, ${fa.around.length} around it)`);
const normalRange = limit(fa.around);
ok(Math.max(...fa.ring) <= normalRange, `the faces along the edge of the reshaped area meet at up to ${Math.max(...fa.ring).toFixed(0)}°, more than the ${normalRange.toFixed(0)}° of the skin around it`);
// negative runs: the male skin and an area pressed back without any relaxation both have creases along that ring
const crude = femaleSkin(mg.positions, mg.indices, {passes: 0, rings: 0}), ca = ringAngles(crude, mg.indices);
ok(Math.max(...ma.ring) > normalRange, `negative run: the male skin's ring is not beyond the normal range (${Math.max(...ma.ring).toFixed(0)}° against ${normalRange.toFixed(0)}°)`);
ok(Math.max(...ca.ring) > normalRange, `negative run: an area pressed back without relaxation is not beyond the normal range (${Math.max(...ca.ring).toFixed(0)}° against ${normalRange.toFixed(0)}°)`);

// ---- 5. negative runs: the test has to be able to fail
ok(protrusion(mg.positions).length > 0, 'negative run: the protrusion test passes for the male skin');
// the display rule tells the two skins apart by the sex flag: without it the female skin is a male surface again and is hidden in female mode
ok(!V.partVisibility(owners, state({sex: 'female'})).base({...femaleSkinParts[0], sex: undefined}), 'negative run: a skin without the female flag is still drawn in female mode');
ok(V.partVisibility(owners, state({sex: 'male'})).base({...femaleSkinParts[0], sex: undefined}), 'negative run: a skin without the female flag is not drawn in male mode');
assert.ok(checks > 20);

if (fails.length) { console.error(`FAIL female skin: ${fails.length} of ${checks} checks failed\n - ${fails.join('\n - ')}`); process.exit(1); }
console.log(`PASS female skin: ${checks} checks (display rule by sex for skin and pubic hair, same vertices and weights, ${insideMoved} of ${inside} groin vertices reshaped, no protrusion on the midline, no crease along the edge, hair on the surface, negative runs fail as expected).`);
