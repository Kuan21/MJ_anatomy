// The female pelvic floor. In female mode the levator ani (iliococcygeus, pubococcygeus and puborectalis, left and right) is a lifted copy of the male muscle (scripts/lib/pelvic-floor-female.mjs):
// the male muscle hangs below the erectile structures of the vulva, so the clitoral complex (glans, body, two crura, two bulbs of the vestibule) lay inside it. Checks, on the runtime catalogue:
//   1. the display rule: exactly the male muscles are drawn in male mode (and by default) and exactly the six female copies in female mode, with the same names and sides;
//   2. the copies keep the topology and the shape of the male muscles: same vertex and triangle counts, x and z unchanged, only ever raised, by at most 2 cm; the part behind the anorectal
//      junction and the lateral attachments stay where they are; no triangle is folded over (a smooth shear) and no edge is stretched more than 1.8 times;
//   3. no vertex of a female copy lies inside the clitoral complex or the bulbs, and every vertex within 2 mm (horizontally) of the complex is above the complex vertex beside it;
//   4. the copies do not push into the vagina or the female urethra any more than the male muscles do (the copies are lifted away from them);
//   5. negative runs: the same tests fail for the male muscles (they lie in the complex), so the tests do tell the two apart.
// Prints only pass / fail and counts.
//   node scripts/test-pelvic-floor-female.mjs
import {quizModule} from './quiz-modules.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {PELVIC_FLOOR_IDS, femaleCopyId} from './lib/pelvic-floor-female.mjs';

const S = await quizModule('app/mj-sex.ts');
const {atlas, geometry} = loadFullAtlas();
const fails = []; let checks = 0;
const ok = (cond, m) => { checks++; if (!cond) fails.push(m); };
const byId = id => atlas.parts.find(p => p.id === id);
const female = name => atlas.parts.filter(p => p.sex === 'female' && p.name === name);

// ---- 1. display rule
const males = PELVIC_FLOOR_IDS.map(id => byId(id)), copies = PELVIC_FLOOR_IDS.map(id => byId(femaleCopyId(id)));
ok(males.every(Boolean) && copies.every(Boolean), 'the six male muscles and their six female copies must all exist');
const NAMES = ['Left iliococcygeus', 'Left pubococcygeus', 'Left puborectalis', 'Right iliococcygeus', 'Right pubococcygeus', 'Right puborectalis'];
for (let k = 0; k < 6; k++) {
  const m = males[k], c = copies[k]; if (!m || !c) continue;
  ok(m.name === NAMES[k] && c.name === NAMES[k], `${PELVIC_FLOOR_IDS[k]}: names are ${m.name} / ${c.name}, expected ${NAMES[k]}`);
  ok(c.sex === 'female' && !m.sex && c.system === 'muscular' && m.system === 'muscular', `${NAMES[k]}: the copy is female and muscular, the original has no sex`);
  for (const [sex, maleShown] of [['male', true], [undefined, true], ['female', false]]) {
    ok(S.matchesSex(m, sex) === maleShown, `${NAMES[k]}: the male muscle ${maleShown ? 'must be drawn' : 'must be hidden'} in ${sex ?? 'default'} mode`);
    ok(S.matchesSex(c, sex) === !maleShown, `${NAMES[k]}: the female copy ${maleShown ? 'must be hidden' : 'must be drawn'} in ${sex ?? 'default'} mode`);
  }
}
for (const n of NAMES) { ok(atlas.parts.filter(p => p.name === n && S.matchesSex(p, 'female')).length === 1, `${n}: exactly one muscle drawn in female mode`); ok(atlas.parts.filter(p => p.name === n && S.matchesSex(p, 'male')).length >= 1 && atlas.parts.filter(p => p.name === n && S.matchesSex(p, 'male')).every(p => !p.sex), `${n}: only male muscles (the atlas has a mirrored duplicate on the left) are drawn in male mode`); }
// the coccygeus, the external anal sphincter and the tendinous arch are shared by both sexes
for (const n of ['Left coccygeus', 'Right coccygeus', 'External anal sphincter', 'Tendinous arch of levator ani']) for (const p of atlas.parts.filter(q => q.name === n)) ok(S.matchesSex(p, 'female') && S.matchesSex(p, 'male'), `${n} stays in both modes`);

// ---- the clitoral complex and what it must stay clear of
const complexParts = ['Glans of clitoris', 'Body of clitoris', 'Left crus of clitoris', 'Right crus of clitoris', 'Left bulb of vestibule', 'Right bulb of vestibule'].map(n => { const p = female(n); ok(p.length === 1, `${n}: expected one female part`); return p[0]; });
const complexGeo = complexParts.filter(Boolean).map(p => geometry(p));
const vagina = geometry(female('Vagina')[0]), urethra = geometry(female('Female urethra')[0]);

/** Ray-parity inside test along +x against a closed triangle mesh. */
function inside(P, I, x, y, z) {
  let c = 0;
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, d = I[t + 2] * 3, y0 = P[a + 1] - y, z0 = P[a + 2] - z, y1 = P[b + 1] - y, z1 = P[b + 2] - z, y2 = P[d + 1] - y, z2 = P[d + 2] - z;
    const s0 = y0 * z1 - y1 * z0, s1 = y1 * z2 - y2 * z1, s2 = y2 * z0 - y0 * z2;
    if (!((s0 >= 0 && s1 >= 0 && s2 >= 0) || (s0 <= 0 && s1 <= 0 && s2 <= 0))) continue;
    const area = s0 + s1 + s2; if (!area) continue;
    if ((s1 * P[a] + s2 * P[b] + s0 * P[d]) / area > x) c++;
  }
  return c & 1;
}
const boxOf = P => { const b = [[1e9, 1e9, 1e9], [-1e9, -1e9, -1e9]]; for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { b[0][k] = Math.min(b[0][k], P[i + k]); b[1][k] = Math.max(b[1][k], P[i + k]); } return b; };
const countInside = (P, mesh) => { const bx = boxOf(mesh.positions); let n = 0, deep = 0; for (let i = 0; i < P.length; i += 3) { if (P[i] < bx[0][0] || P[i] > bx[1][0] || P[i + 1] < bx[0][1] || P[i + 1] > bx[1][1] || P[i + 2] < bx[0][2] || P[i + 2] > bx[1][2]) continue; if (inside(mesh.positions, mesh.indices, P[i], P[i + 1], P[i + 2])) n++; } return n; };
// complex vertices on a 2 mm horizontal grid: the highest one in each cell
const CELL = .002, key = (a, b) => `${a},${b}`, topOf = new Map();
for (const g of complexGeo) for (let i = 0; i < g.positions.length; i += 3) { const k = key(Math.floor(g.positions[i] / CELL), Math.floor(g.positions[i + 2] / CELL)); topOf.set(k, Math.max(topOf.get(k) ?? -1e9, g.positions[i + 1])); }
/** Vertices of P that are within 2 mm (horizontally) of a complex vertex but not above it (0.5 mm margin). */
function below(P) {
  let n = 0, worst = 0;
  for (let i = 0; i < P.length; i += 3) {
    const a = Math.floor(P[i] / CELL), b = Math.floor(P[i + 2] / CELL); let t = -1e9;
    for (let da = -1; da <= 1; da++) for (let db = -1; db <= 1; db++) t = Math.max(t, topOf.get(key(a + da, b + db)) ?? -1e9);
    if (t > -1e8 && P[i + 1] < t + .0005) { n++; worst = Math.max(worst, t - P[i + 1]); }
  }
  return {n, worst};
}
const inComplex = P => complexGeo.reduce((n, g) => n + countInside(P, g), 0);

let maleInComplex = 0, maleBelow = 0, maleVagina = 0, copyInComplex = 0, copyBelow = 0, copyVagina = 0, copyUrethra = 0, vertices = 0;
for (let k = 0; k < 6; k++) {
  const m = males[k], c = copies[k]; if (!m || !c) continue;
  const gm = geometry(m), gc = geometry(c), Pm = gm.positions, Pc = gc.positions;
  // ---- 2. shape
  ok(Pm.length === Pc.length && gm.indices.length === gc.indices.length, `${NAMES[k]}: the copy has ${Pc.length / 3} vertices and ${gc.indices.length / 3} triangles, the original ${Pm.length / 3} and ${gm.indices.length / 3}`);
  if (Pm.length !== Pc.length) continue;
  let maxUp = 0, lowered = 0, shifted = 0, posteriorMoved = 0, lateralMoved = 0;
  for (let i = 0; i < Pm.length; i += 3) {
    if (Math.abs(Pm[i] - Pc[i]) > 2e-6 || Math.abs(Pm[i + 2] - Pc[i + 2]) > 2e-6) shifted++;
    const d = Pc[i + 1] - Pm[i + 1]; maxUp = Math.max(maxUp, d); if (d < -2e-6) lowered++;
    if (Pm[i + 2] < -.075 && d > .0005) posteriorMoved++;
    if (Math.abs(Pm[i]) > .047 && d > .001) lateralMoved++;
  }
  ok(shifted === 0, `${NAMES[k]}: ${shifted} vertices moved sideways or in depth (the lift must be vertical)`);
  ok(lowered === 0, `${NAMES[k]}: ${lowered} vertices were lowered`);
  ok(maxUp <= .02 && maxUp > .004, `${NAMES[k]}: the muscle is raised by up to ${(maxUp * 1000).toFixed(1)} mm (expected 4 to 20)`);
  ok(posteriorMoved === 0, `${NAMES[k]}: ${posteriorMoved} vertices more than 7.5 cm behind the pubis moved by over 0.5 mm (the part around the anorectal junction stays)`);
  ok(lateralMoved === 0, `${NAMES[k]}: ${lateralMoved} vertices lateral to 4.7 cm from the midline moved by over 1 mm (the lateral attachments stay)`);
  let flipped = 0, edgeMax = 0;
  for (let t = 0; t < gm.indices.length; t += 3) {
    const a = gm.indices[t] * 3, b = gm.indices[t + 1] * 3, d = gm.indices[t + 2] * 3;
    const nrm = P => { const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[d] - P[a], vy = P[d + 1] - P[a + 1], vz = P[d + 2] - P[a + 2]; return [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx]; };
    const n0 = nrm(Pm), n1 = nrm(Pc), l0 = Math.hypot(...n0), l1 = Math.hypot(...n1);
    if (l0 > 4e-8 && l1 > 0 && (n0[0] * n1[0] + n0[1] * n1[1] + n0[2] * n1[2]) / (l0 * l1) < 0) flipped++;
    for (const [p, q] of [[a, b], [b, d], [d, a]]) { const l = Math.hypot(Pm[p] - Pm[q], Pm[p + 1] - Pm[q + 1], Pm[p + 2] - Pm[q + 2]); if (l > 1e-3) edgeMax = Math.max(edgeMax, Math.hypot(Pc[p] - Pc[q], Pc[p + 1] - Pc[q + 1], Pc[p + 2] - Pc[q + 2]) / l); }
  }
  ok(flipped <= gm.indices.length / 3 * .01, `${NAMES[k]}: ${flipped} of ${gm.indices.length / 3} triangles are folded over (over 1%)`);
  ok(edgeMax <= 1.8, `${NAMES[k]}: an edge is stretched ${edgeMax.toFixed(2)} times (over 1.8)`);
  // ---- 3, 4. clear of the complex; not further into the vagina and urethra
  const ic = inComplex(Pc), bl = below(Pc); copyInComplex += ic; copyBelow += bl.n; vertices += Pc.length / 3;
  ok(ic === 0, `${NAMES[k]}: ${ic} vertices of the female copy lie inside the clitoral complex or the bulbs`);
  ok(bl.n === 0, `${NAMES[k]}: ${bl.n} vertices of the female copy are less than 0.5 mm above the complex beside them (up to ${(bl.worst * 1000).toFixed(1)} mm below)`);
  const mv = countInside(Pm, vagina), cv = countInside(Pc, vagina), cu = countInside(Pc, urethra);
  maleInComplex += inComplex(Pm); maleBelow += below(Pm).n; maleVagina += mv; copyVagina += cv; copyUrethra += cu;
  ok(cv <= mv + 6, `${NAMES[k]}: ${cv} vertices of the copy lie inside the vagina (the male muscle: ${mv})`);
  ok(cu === 0, `${NAMES[k]}: ${cu} vertices of the copy lie inside the female urethra`);
}
// ---- 5. negative runs: the male muscles are in the complex
ok(maleInComplex >= 300, `negative run: only ${maleInComplex} vertices of the male muscles lie inside the complex (expected hundreds), so test 3 would not catch the old state`);
ok(maleBelow >= 600, `negative run: only ${maleBelow} vertices of the male muscles lie beside and below the complex (expected hundreds)`);
ok(vertices >= 11000, `only ${vertices} vertices checked`);

if (fails.length) { console.error(`FAIL pelvic floor (female): ${fails.length} of ${checks} checks`); for (const f of fails) console.error('  ' + f); process.exit(1); }
console.log(`PASS pelvic floor (female): ${checks} checks (display rule, shape kept and only raised, ${vertices} vertices clear of the clitoral complex [male muscles: ${maleInComplex} inside, ${maleBelow} beside and below], vagina and urethra not pushed into more, negative runs fail as expected).`);
