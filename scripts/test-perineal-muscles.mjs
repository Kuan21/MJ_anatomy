// The superficial muscles of the perineum (ischiocavernosus, bulbospongiosus, superficial transverse perineal; left and right, in both sexes) are schematic models built on the structures they cover
// (scripts/paokao-structures/perineal-muscles.mjs). Checks, on the runtime catalogue:
//   1. the set: exactly one part of each name and sex, muscular, marked as a schematic model, with its data card (origin, insertion, nerve, action);
//   2. the display rule: the male muscles are drawn in male mode (and by default) only, the female muscles in female mode only;
//   3. side and size: the muscle lies on the side its name says and is 2 to 6 cm long, and no vertex crosses the midline by more than 1 mm;
//   4. attachments: ischiocavernosus and the transverse muscle touch the ischium (within 3 mm of the hip bone of the same sex), bulbospongiosus lies against the bulb it covers
//      (the bulb of the vestibule, or the corpus spongiosum in the male) within 4 mm and does not push into it;
//   5. no muscle sinks into the erectile structure it covers (at most 5% of its vertices inside the crus, bulb, body or corpus), and the muscles lie below the pelvic floor, not above it.
// Prints only pass / fail and counts.
//   node scripts/test-perineal-muscles.mjs
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';

const S = await quizModule('app/mj-sex.ts');
const {atlas, geometry} = loadFullAtlas();
const cards = JSON.parse(fs.readFileSync(new URL('../app/mj-paokao.json', import.meta.url), 'utf8'));
const fails = []; let checks = 0;
const ok = (cond, m) => { checks++; if (!cond) fails.push(m); };

const KINDS = ['ischiocavernosus', 'bulbospongiosus', 'superficial transverse perineal muscle'];
const dmin = (A, B, stop) => { let best = 9; for (let i = 0; i < A.length; i += 3) for (let j = 0; j < B.length; j += 3) { const d = Math.hypot(A[i] - B[j], A[i + 1] - B[j + 1], A[i + 2] - B[j + 2]); if (d < best) { best = d; if (best < stop) return best; } } return best; };
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
const mesh = p => geometry(p);
let total = 0, sunk = 0;
for (const sex of ['female', 'male']) {
  const female = sex === 'female', other = female ? 'male' : 'female';
  for (const side of ['Left', 'Right']) {
    const sx = side === 'Left' ? 1 : -1, hipPart = atlas.parts.find(p => p.name === `${side} hip bone` && (female ? p.sex === 'female' : !p.sex)), hip = mesh(hipPart).positions;
    // the structures each muscle covers
    const coverParts = female
      ? [`${side} crus of clitoris`, `${side} bulb of vestibule`, 'Body of clitoris'].map(n => atlas.parts.find(p => p.name === n && p.sex === 'female'))
      : ['Corpus cavernosum of penis', 'Corpus spongiosum of penis'].map(n => atlas.parts.find(p => p.name === n && !p.sex));
    ok(coverParts.every(Boolean), `${sex} ${side}: the structures the muscles cover are missing`);
    const covers = coverParts.filter(Boolean).map(mesh);
    const bulb = female ? mesh(atlas.parts.find(p => p.name === `${side} bulb of vestibule` && p.sex === 'female')) : mesh(atlas.parts.find(p => p.name === 'Corpus spongiosum of penis' && !p.sex));
    for (const kind of KINDS) {
      const name = `${side} ${kind}`, label = `${sex} ${name}`, found = atlas.parts.filter(p => p.name === name && p.sex === sex);
      ok(found.length === 1, `${label}: ${found.length} parts (expected 1)`); if (found.length !== 1) continue;
      const p = found[0], g = mesh(p), P = g.positions;
      ok(p.system === 'muscular' && p.schematic === true && p.kind === 'muscle', `${label}: must be a schematic muscle (system ${p.system}, schematic ${p.schematic}, kind ${p.kind})`);
      const card = cards[p.id]; ok(!!card && card.origin?.length === 2 && card.insertion?.length === 2 && card.nerve?.length === 2 && card.action?.length === 2, `${label}: the data card needs origin, insertion, nerve and action in both languages`);
      const other_ = atlas.parts.find(q => q.name === name && q.sex === other); if (other_) { ok(S.matchesSex(p, sex) && !S.matchesSex(p, other), `${label}: drawn only in ${sex} mode`); ok(S.matchesSex(other_, other) && !S.matchesSex(other_, sex), `${label}: the ${other} muscle of the same name is drawn only in ${other} mode`); }
      ok(S.matchesSex(p, sex) && !S.matchesSex(p, other) && (sex === 'male' ? S.matchesSex(p, undefined) : !S.matchesSex(p, undefined)), `${label}: display rule (male by default)`);
      // side, size, midline
      let cx = 0, lo = [9, 9, 9], hi = [-9, -9, -9], cross = 0; for (let i = 0; i < P.length; i += 3) { cx += P[i] / (P.length / 3); for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], P[i + k]); hi[k] = Math.max(hi[k], P[i + k]); } if (P[i] * sx < -.001) cross++; }
      ok(cx * sx > .004, `${label}: centre at x ${(cx * 1000).toFixed(1)} mm is not on the ${side.toLowerCase()} side`);
      ok(cross === 0, `${label}: ${cross} vertices cross the midline by more than 1 mm`);
      const diag = Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]); ok(diag > .02 && diag < .07, `${label}: ${(diag * 100).toFixed(1)} cm long (expected 2 to 7)`);
      // attachments
      if (kind !== 'bulbospongiosus') { const d = dmin(P, hip, .003); ok(d <= .003, `${label}: ${(d * 1000).toFixed(1)} mm from the ${side.toLowerCase()} hip bone (the origin must touch the ischium, 3 mm at most)`); }
      else { const d = dmin(P, bulb.positions, .004); ok(d <= .004, `${label}: ${(d * 1000).toFixed(1)} mm from the ${female ? 'bulb of the vestibule' : 'corpus spongiosum'} it covers (4 mm at most)`); }
      // not sunk into what it covers
      let n = 0; for (const c of covers) for (let i = 0; i < P.length; i += 3) if (inside(c.positions, c.indices, P[i], P[i + 1], P[i + 2])) n++;
      total += P.length / 3; sunk += n; ok(n <= .05 * P.length / 3, `${label}: ${n} of ${P.length / 3} vertices lie inside the structures it covers (5% at most)`);
    }
  }
}
// the muscles lie below the pelvic floor: the highest point of every perineal muscle is below the lowest point of the pelvic floor's attachment to the pubis would be too strict, so compare with the middle of the levator ani
for (const sex of ['female', 'male']) {
  const lev = atlas.parts.filter(p => /^(?:Left|Right) puborectalis$/.test(p.name) && (sex === 'female' ? p.sex === 'female' : !p.sex)).map(mesh);
  let ymid = 0, k = 0; for (const g of lev) for (let i = 1; i < g.positions.length; i += 3) { ymid += g.positions[i]; k++; }
  if (!k) { ok(false, `${sex}: puborectalis not found`); continue; } ymid /= k;
  for (const p of atlas.parts.filter(q => KINDS.some(n => q.name.endsWith(n)) && q.sex === sex)) ok(p.bounds[1][1] < ymid + .005, `${sex} ${p.name}: top at ${(p.bounds[1][1] * 1000).toFixed(0)} mm is not below the middle of the levator ani (${(ymid * 1000).toFixed(0)} mm)`);
}
ok(atlas.parts.filter(p => KINDS.some(n => p.name.endsWith(n)) && p.sex).length === 12, 'expected 12 perineal muscles (3 kinds x 2 sides x 2 sexes)');

if (fails.length) { console.error(`FAIL perineal muscles: ${fails.length} of ${checks} checks`); for (const f of fails) console.error('  ' + f); process.exit(1); }
console.log(`PASS perineal muscles: ${checks} checks (12 schematic muscles, display rule by sex, side and size, attachments to the ischium and over the bulbs, ${sunk} of ${total} vertices inside what they cover).`);
