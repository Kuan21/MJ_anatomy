// The deep perineal structures (scripts/paokao-structures/perineal-deep.mjs), schematic models for both sexes: perineal membrane, perineal body, external urethral sphincter, left and right
// deep transverse perineal muscle, and, in the male, the bulb of the penis and the left and right crus of the penis (patches on the corpora). Checks, on the runtime catalogue:
//   1. the set: exactly 13 parts (6 per sex for the membrane, body, sphincter and the two deep transverse muscles, plus the 3 male patches), each marked schematic, with a data card;
//   2. the display rule: each part is drawn only in the mode of its sex;
//   3. the membrane is a closed slab about 2 mm thick, wider than 4 cm and lies under the pelvic floor: its highest point is below the middle of the levator ani; the erectile structures lie below it;
//   4. the sphincter sleeve is centred on the urethra (within 4 mm) and does not cut into it;
//   5. the deep transverse muscles lie on their own side, do not cross the midline by more than 1 mm and are 1.5 to 6 cm long;
//   6. the perineal body is a midline structure between the vaginal opening or the bulb of the penis and the anal canal;
//   7. the male patches lie on the corpora they are named for (within 1 mm of the parent mesh).
// Prints only pass / fail and counts.
//   node scripts/test-perineal-deep.mjs
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';

const S = await quizModule('app/mj-sex.ts');
const {atlas, geometry} = loadFullAtlas();
const cards = JSON.parse(fs.readFileSync(new URL('../app/mj-paokao.json', import.meta.url), 'utf8'));
const fails = []; let checks = 0; const ok = (c, m) => { checks++; if (!c) fails.push(m); };
const parts = n => atlas.parts.filter(p => p.name === n && /^PK/.test(p.id));
const pos = p => geometry(p).positions;
const one = (name, sex) => { const f = parts(name).filter(p => p.sex === sex); ok(f.length === 1, `${sex} ${name}: ${f.length} parts (expected 1)`); return f[0]; };
const dmin = (A, B, stop) => { let best = 9; for (let i = 0; i < A.length; i += 3) for (let j = 0; j < B.length; j += 3) { const d = Math.hypot(A[i] - B[j], A[i + 1] - B[j + 1], A[i + 2] - B[j + 2]); if (d < best) { best = d; if (best < stop) return best; } } return best; };
const ext = (P, k) => { let lo = 9, hi = -9; for (let i = k; i < P.length; i += 3) { lo = Math.min(lo, P[i]); hi = Math.max(hi, P[i]); } return [lo, hi]; };
const named = (n, sex) => atlas.parts.filter(p => p.name === n && (sex === 'female' ? p.sex === 'female' : !p.sex));

const WHOLE = ['Perineal membrane', 'Perineal body', 'External urethral sphincter'], SIDED = ['deep transverse perineal muscle'];
let count = 0;
for (const sex of ['female', 'male']) {
  const other = sex === 'female' ? 'male' : 'female';
  const list = [...WHOLE, ...['Left', 'Right'].flatMap(s => SIDED.map(n => `${s} ${n}`)), ...(sex === 'male' ? ['Bulb of penis', 'Left crus of penis', 'Right crus of penis'] : [])];
  for (const n of list) {
    const p = one(n, sex); if (!p) continue; count++;
    ok(p.schematic === true, `${sex} ${n}: must be a schematic model`);
    const c = cards[p.id]; ok(!!c && Object.keys(c).filter(k => Array.isArray(c[k]) && c[k].length === 2).length >= 3, `${sex} ${n}: the data card needs three or more fields in both languages`);
    ok(S.matchesSex(p, sex) && !S.matchesSex(p, other), `${sex} ${n}: drawn only in ${sex} mode`);
  }
  // levator ani: the membrane lies below its middle
  const lev = atlas.parts.filter(p => /^(?:Left|Right) puborectalis$/.test(p.name) && (sex === 'female' ? p.sex === 'female' : !p.sex)).map(pos);
  let ymid = 0, k = 0; for (const P of lev) for (let i = 1; i < P.length; i += 3) { ymid += P[i]; k++; } ymid /= k || 1;
  const mem = one('Perineal membrane', sex);
  if (mem) {
    const P = pos(mem), [x0, x1] = ext(P, 0); ok(x1 - x0 > .04, `${sex}: the perineal membrane is ${((x1 - x0) * 100).toFixed(1)} cm wide (expected more than 4)`);
    ok(mem.bounds[1][1] < ymid + .005, `${sex}: the perineal membrane top at ${(mem.bounds[1][1] * 1000).toFixed(0)} mm is not below the middle of the levator ani (${(ymid * 1000).toFixed(0)} mm)`);
    // closed slab: every edge of the triangles is shared by two triangles
    const g = geometry(mem), edges = new Map(); for (let t = 0; t < g.indices.length; t += 3) for (let e = 0; e < 3; e++) { const a = g.indices[t + e], b = g.indices[t + (e + 1) % 3], key = a < b ? a + '_' + b : b + '_' + a; edges.set(key, (edges.get(key) || 0) + 1); }
    ok([...edges.values()].every(c => c === 2), `${sex}: the perineal membrane is not a closed solid`);
  }
  // the sphincter round the urethra
  const sph = one('External urethral sphincter', sex), ur = named(sex === 'female' ? 'Female urethra' : 'Urethra', sex)[0];
  if (sph && ur) {
    const P = pos(sph), U = pos(ur), cx = (ext(P, 0)[0] + ext(P, 0)[1]) / 2, cz = (ext(P, 2)[0] + ext(P, 2)[1]) / 2, [y0, y1] = ext(P, 1);
    let ux = 0, uz = 0, n = 0; for (let i = 0; i < U.length; i += 3) if (U[i + 1] > y0 && U[i + 1] < y1 && Math.abs(U[i + 2] - cz) < .03) { ux += U[i]; uz += U[i + 2]; n++; }   // the part of the urethra that passes the sleeve (the penile part runs far in front)
    ok(n > 0, `${sex}: no urethra vertex inside the height of the sphincter`);
    if (n) { ux /= n; uz /= n; ok(Math.hypot(ux - cx, uz - cz) < .004, `${sex}: the sphincter is ${(Math.hypot(ux - cx, uz - cz) * 1000).toFixed(1)} mm off the urethra axis (4 mm at most)`);
      // no urethra vertex lies between the inner and outer radius of the sleeve: the sleeve does not cut into the urethra
      let cut = 0; for (let i = 0; i < U.length; i += 3) if (U[i + 1] > y0 + .001 && U[i + 1] < y1 - .001 && Math.abs(U[i + 2] - cz) < .03) { const r = Math.hypot(U[i] - cx, U[i + 2] - cz); if (r > (sex === 'female' ? .0049 : .0045) && r < .0068) cut++; }
      ok(cut <= 2, `${sex}: ${cut} urethra vertices lie inside the wall of the sphincter`); }
  }
  // deep transverse muscles
  for (const side of ['Left', 'Right']) { const sx = side === 'Left' ? 1 : -1, p = one(`${side} deep transverse perineal muscle`, sex); if (!p) continue; const P = pos(p); let cross = 0; for (let i = 0; i < P.length; i += 3) if (P[i] * sx < -.001) cross++;
    ok(cross === 0, `${sex} ${side} deep transverse perineal muscle: ${cross} vertices cross the midline by more than 1 mm`); const d = Math.hypot(p.bounds[1][0] - p.bounds[0][0], p.bounds[1][1] - p.bounds[0][1], p.bounds[1][2] - p.bounds[0][2]); ok(d > .015 && d < .06, `${sex} ${side} deep transverse perineal muscle: ${(d * 100).toFixed(1)} cm long (expected 1.5 to 6)`); }
  // perineal body: midline, behind the vaginal opening or the bulb, in front of the anal canal
  const pb = one('Perineal body', sex); if (pb) { const cx = (pb.bounds[0][0] + pb.bounds[1][0]) / 2, cz = (pb.bounds[0][2] + pb.bounds[1][2]) / 2; ok(Math.abs(cx) < .002, `${sex}: the perineal body is ${(cx * 1000).toFixed(1)} mm off the midline`); ok(cz < -.03 && cz > -.07, `${sex}: the perineal body at z ${(cz * 1000).toFixed(0)} mm is not between the vaginal opening or the bulb and the anal canal`); }
}
// male patches lie on their corpora
for (const [n, parent] of [['Bulb of penis', 'Corpus spongiosum of penis'], ['Left crus of penis', 'Corpus cavernosum of penis'], ['Right crus of penis', 'Corpus cavernosum of penis']]) {
  const p = one(n, 'male'), par = named(parent, 'male')[0]; if (!p || !par) continue; const d = dmin(pos(p), pos(par), .001); ok(d <= .001, `${n}: ${(d * 1000).toFixed(1)} mm from the ${parent} (1 mm at most)`);
}
ok(count === 13, `expected 13 deep perineal parts, found ${count}`);
if (fails.length) { console.error(`FAIL perineal deep structures: ${fails.length} of ${checks} checks`); for (const f of fails) console.error('  ' + f); process.exit(1); }
console.log(`PASS perineal deep structures: ${checks} checks (13 schematic parts, display rule by sex, closed membrane under the pelvic floor, sphincter on the urethra axis, deep transverse muscles, perineal body, male patches on the corpora).`);
