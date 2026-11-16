// The rectouterine pouch lies behind the cervix and the posterior vaginal fornix and in front of the rectum, and its lowest point is at the posterior fornix.
// It used to lie about 2 cm too far forward, inside the cervix and the vagina (the gap was measured at one height where the cervix does not reach and a missing value was read as 0).
import {loadFullAtlas} from './lib/full-atlas.mjs';
const {atlas, geometry} = loadFullAtlas();
let checks = 0; const ok = (c, m) => { checks++; if (!c) { console.error('FAIL ' + m); process.exitCode = 1; } };
const P = n => { const p = atlas.parts.find(q => q.name === n); if (!p) throw new Error('missing ' + n); return geometry(p).positions; };
const pouch = P('Rectouterine pouch'), front = ['Vagina', 'Cervix of uterus', 'Cervicovaginal junction', 'Body of uterus'].map(P), rectum = P('Rectum');
const ext = (A, y, pick, xw = .02, win = .0025) => { let r = pick === 'min' ? Infinity : -Infinity, any = false; for (let i = 0; i < A.length; i += 3) if (Math.abs(A[i + 1] - y) < win && Math.abs(A[i]) < xw) { r = pick === 'min' ? Math.min(r, A[i + 2]) : Math.max(r, A[i + 2]); any = true; } return any ? r : null; };
const back = (y, win) => Math.min(...front.map(A => ext(A, y, 'min', .02, win)).filter(v => v !== null));   // the back of the uterus, cervix and vagina
let yLo = Infinity, yHi = -Infinity; for (let i = 1; i < pouch.length; i += 3) { yLo = Math.min(yLo, pouch[i]); yHi = Math.max(yHi, pouch[i]); }
let n = 0, inFront = 0, inRectum = 0, worstF = 0, worstR = 0;
for (let i = 0; i < pouch.length; i += 3) {   // every vertex of the sac against the surfaces at its own height (a 1 mm window)
  const y = pouch[i + 1], z = pouch[i + 2], bk = back(y, .0008), rf = ext(rectum, y, 'max', .025, .0008); n++;
  if (Number.isFinite(bk) && z > bk + .0015) { inFront++; worstF = Math.max(worstF, z - bk); }
  if (rf !== null && rf < (Number.isFinite(bk) ? bk : 1) && z < rf - .0015) { inRectum++; worstR = Math.max(worstR, rf - z); }
}
ok(inFront === 0, `${inFront} vertices of the pouch lie in front of the back of the cervix/vagina/uterus, up to ${(worstF * 1000).toFixed(1)} mm inside them`);
ok(inRectum === 0, `${inRectum} vertices of the pouch lie behind the front of the rectum, up to ${(worstR * 1000).toFixed(1)} mm inside it`);
ok(n >= 300, `only ${n} vertices measured`);
const fornix = (() => { const j = P('Cervicovaginal junction'); let lo = Infinity; for (let i = 1; i < j.length; i += 3) lo = Math.min(lo, j[i]); return lo; })();   // the lower edge of the cervicovaginal junction marks the fornix
ok(Math.abs(yLo - fornix) < .015, `the lowest point of the pouch (${(yLo * 100).toFixed(1)} cm) is ${(Math.abs(yLo - fornix) * 100).toFixed(1)} cm from the posterior fornix (${(fornix * 100).toFixed(1)} cm)`);
// negative run: the old pouch (centre z about -2.2 cm, from y 85.5 to 89.5) would fail the same check
ok(!(-.018 <= back(.88, .0008) + .0015), 'negative run: a pouch reaching z -1.8 cm at 88 cm height is not caught');
if (!process.exitCode) console.log(`PASS rectouterine pouch: ${checks} checks (behind the cervix and vagina, in front of the rectum, lowest point at the posterior fornix, negative run fails as expected).`);
