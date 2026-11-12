// Measurements that compare the lower-limb nerves with bony and arterial landmarks (fibular neck, malleoli, tibial tuberosity, patella, tarsal tunnel, piriformis, accompanying arteries),
// read from the same meshes the viewer draws. Used by scripts/check-nerve-course.mjs (the `required` rows must pass) and scripts/audit-lower-nerves.mjs (writes docs/lower-limb-nerves.md).
import {inside, loadObstacles} from './nerve-bone-clearance.mjs';

const MM = 1000, d3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const mean = (pts, k) => pts.reduce((s, p) => s + p[k], 0) / (pts.length || 1);

export function measure(w) {
  const rows = [], clouds = new Map(), verts = new Map();
  const V = n => { if (!verts.has(n)) { const m = w.mesh(n), P = m.positions, o = []; for (let i = 0; i < P.length; i += 3) o.push([P[i] * MM, P[i + 1] * MM, P[i + 2] * MM]); verts.set(n, o); } return verts.get(n); };
  const C = (n, sp = 2.5) => {
    if (!clouds.has(n)) {
      const m = w.mesh(n), P = m.positions, I = m.indices, pts = [];
      for (let t = 0; t < I.length; t += 3) {
        const a = [0, 1, 2].map(j => P[I[t] * 3 + j] * MM), b = [0, 1, 2].map(j => P[I[t + 1] * 3 + j] * MM), c = [0, 1, 2].map(j => P[I[t + 2] * 3 + j] * MM);
        const k = Math.max(1, Math.ceil(Math.max(d3(a, b), d3(b, c), d3(a, c)) / sp));
        for (let i = 0; i <= k; i++) for (let j = 0; j <= k - i; j++) { const u = i / k, v = j / k, s = 1 - u - v; pts.push([0, 1, 2].map(q => a[q] * s + b[q] * u + c[q] * v)); }
      }
      clouds.set(n, pts);
    }
    return clouds.get(n);
  };
  const near = (cloud, p) => { let b = 1e9; for (const q of cloud) { const d = d3(p, q); if (d < b) b = d; } return b; };
  const minDist = (pts, cloud, stride = 1) => { let b = 1e9; for (let i = 0; i < pts.length; i += stride) { const d = near(cloud, pts[i]); if (d < b) b = d; } return b; };
  const slice = (pts, y, h = 3) => pts.filter(p => Math.abs(p[1] - y) < h);
  const cen = pts => [mean(pts, 0), mean(pts, 1), mean(pts, 2)];
  const add = (req, nerve, side, rule, value, unit, ok, note = '') => rows.push({required: req, nerve, side, rule, value: Math.round(value * 10) / 10, unit, ok, note});

  for (const [S, s, sx] of [['Right', 'r', -1], ['Left', 'l', 1]]) {
    const X = p => p[0] * sx;                                               // lateral = positive on both sides
    const fib = C(`${S} fibula`, 2), tib = C(`${S} tibia`, 2), ata = C(`${S} anterior tibial artery`), pta = C(`${S} posterior tibial artery`), tun = C(`${S} tarsal tunnel`, 2);
    const dfn = V(`Deep fibular nerve.${s}`), ipb = V(`Infrapatellar branch of saphenous nerve.${s}`), sap = V(`Saphenous nerve.${s}`), tn = V(`Tibial nerve.${s}`);
    const ext = (cloud, y, h = 4) => { const q = slice(cloud, y, h); return q.length ? {xmin: Math.min(...q.map(X)), xmax: Math.max(...q.map(X)), zmin: Math.min(...q.map(p => p[2])), zmax: Math.max(...q.map(p => p[2]))} : null; };

    // ---- Deep fibular nerve
    const neck = dfn.filter(p => p[1] > 368 && p[1] < 400);
    add(true, 'Deep fibular nerve', S, 'winds round the neck of the fibula (nearest approach to the fibula between 368 and 400 mm)', minDist(neck, fib), 'mm', minDist(neck, fib) <= 7);
    let worstLat = 1e9, worstAnt = 1e9, worstAta = 0, tibClear = 1e9;
    for (const y of [320, 280, 240, 200, 160]) {
      const c = cen(slice(dfn, y)), f = ext(fib, y), t = ext(tib, y);
      worstLat = Math.min(worstLat, f.xmax - X(c));                         // must lie medial to the lateral surface of the fibula
      worstAnt = Math.min(worstAnt, c[2] - f.zmax);                         // and in front of the fibula (on the anterior face of the interosseous membrane)
      worstAta = Math.max(worstAta, near(ata, c));
      tibClear = Math.min(tibClear, X(c) - t.xmax);
    }
    add(true, 'Deep fibular nerve', S, 'runs medial to the lateral surface of the fibula between 160 and 320 mm (anterior compartment, not along the lateral side)', worstLat, 'mm', worstLat > 6);
    add(true, 'Deep fibular nerve', S, 'runs in front of the fibula (interosseous membrane) between 160 and 320 mm', worstAnt, 'mm', worstAnt > 8);
    add(true, 'Deep fibular nerve', S, 'accompanies the anterior tibial artery (largest distance to the artery between 160 and 320 mm)', worstAta, 'mm', worstAta <= 14);
    const mm = ext(tib, 72, 6), lm = ext(fib, 55, 6), ank = cen(slice(dfn, 78, 5)), tal = C(`${S} talus`, 2);
    add(true, 'Deep fibular nerve', S, 'crosses the front of the ankle between the medial and lateral malleoli', Math.min(X(ank) - mm.xmin, lm.xmax - X(ank)), 'mm', X(ank) > mm.xmin && X(ank) < lm.xmax);
    add(true, 'Deep fibular nerve', S, 'in front of the lower end of the tibia at the ankle', ank[2] - ext(tib, 82, 4).zmax, 'mm', ank[2] > ext(tib, 82, 4).zmax);
    void tal;

    // ---- Infrapatellar branch
    const pat = C(`${S} patella`, 2), patMinY = Math.min(...pat.map(p => p[1])), tub = C(`${S} tibial tuberosity`, 1.5), tubC = cen(tub);
    const across = ipb.filter(p => Math.abs(X(p) - X(tubC)) < 12), meanY = mean(across, 1);
    add(true, 'Infrapatellar branch of saphenous nerve', S, 'crosses the front of the knee just below the patella (patellar apex minus the nerve height where it passes the tibial tuberosity)', patMinY - meanY, 'mm', patMinY - meanY > 1 && patMinY - meanY < 25);
    add(true, 'Infrapatellar branch of saphenous nerve', S, 'passes the tibial tuberosity (nearest approach to the tuberosity)', minDist(ipb, tub), 'mm', minDist(ipb, tub) <= 8);
    add(true, 'Infrapatellar branch of saphenous nerve', S, 'passes in front of the tuberosity (nerve z minus tuberosity z)', mean(across, 2) - tubC[2], 'mm', mean(across, 2) > tubC[2]);
    const xs = ipb.map(X);
    add(true, 'Infrapatellar branch of saphenous nerve', S, 'extends from the medial side to beyond the lateral side of the tuberosity (lateral and medial reach)', Math.min(Math.max(...xs) - X(tubC), X(tubC) - Math.min(...xs)), 'mm', Math.max(...xs) > X(tubC) + 3 && Math.min(...xs) < X(tubC) - 25);

    // ---- Saphenous nerve trunk
    const trunk = sap.filter(p => p[1] < 330 && p[1] > 100), tibBorder = y => ext(tib, y, 4).xmin;
    let sapClear = 1e9; for (const y of [300, 250, 200, 150]) { const c = cen(slice(trunk, y, 6)); sapClear = Math.min(sapClear, tibBorder(y) - X(c)); }
    add(true, 'Saphenous nerve', S, 'runs along the medial border of the tibia, outside the bone (distance medial to the tibial border at 150-300 mm)', sapClear, 'mm', sapClear > 1 && sapClear < 12);

    // ---- Tibial nerve
    const dTun = minDist(tn, tun), c120 = cen(slice(tn, 120, 5));
    add(true, 'Tibial nerve', S, 'passes through the tarsal tunnel (nearest approach to the tunnel)', dTun, 'mm', dTun <= 3);
    add(true, 'Tibial nerve', S, 'accompanies the posterior tibial artery in the lower leg (distance at 120 mm)', near(pta, c120), 'mm', near(pta, c120) <= 10);
    const c300 = cen(slice(tn, 300, 5));
    add(false, 'Tibial nerve', S, 'accompanies the posterior tibial artery in the middle leg (distance at 300 mm)', near(pta, c300), 'mm', near(pta, c300) <= 12, 'the artery itself lies 20 mm medial of the usual position here');

    // ---- Common fibular nerve
    const cfn = V(`Common fibular nerve.${s}`), lowEnd = cfn.slice().sort((a, b) => a[1] - b[1]).slice(0, 30);
    add(true, 'Common fibular nerve', S, 'ends at the neck of the fibula (distance of its lower end to the fibula)', minDist(lowEnd, fib), 'mm', minDist(lowEnd, fib) <= 15);
    add(false, 'Common fibular nerve', S, 'runs along the biceps femoris tendon (nearest approach)', minDist(cfn, C(`${S} tendon of biceps femoris`)), 'mm', minDist(cfn, C(`${S} tendon of biceps femoris`)) <= 12);

    // ---- Superficial fibular nerve
    const sfn = V(`Superficial fibular nerve.${s}`), cs = cen(slice(sfn, 250, 5)), fx = ext(fib, 250);
    add(false, 'Superficial fibular nerve', S, 'lies lateral to the fibula in the lateral compartment at 250 mm (distance beyond the lateral surface)', X(cs) - fx.xmax, 'mm', X(cs) > fx.xmax - 2);

    // ---- Sural nerve behind the lateral malleolus
    const sural = V(`Sural nerve.${s}`), sc = cen(slice(sural, 60, 8)), lf = ext(fib, 58, 6);
    add(false, 'Sural nerve', S, 'passes behind the lateral malleolus (nerve z minus the posterior edge of the fibula at 60 mm)', sc[2] - lf.zmin, 'mm', sc[2] < lf.zmin + 2 && minDist(sural.filter(p => Math.abs(p[1] - 60) < 8), fib) < 20);

    // ---- Pelvis: relation to piriformis
    const pir = C(`${S} piriformis`);
    const side = (n, above) => { const pts = V(n).filter(p => near(pir, p) < 12); if (!pts.length) return null; const dy = pts.map(p => { let b = null; for (const q of pir) if (!b || d3(q, p) < d3(b, p)) b = q; return p[1] - b[1]; }); const m = dy.reduce((a, b) => a + b, 0) / dy.length; add(true, n.replace(/\.[lr]$/, ''), S, above ? 'passes above piriformis (suprapiriform foramen)' : 'passes below piriformis (infrapiriform foramen)', m, 'mm', above ? m > 0 : m < 0); return m; };
    side(`Superior gluteal nerve.${s}`, true); side(`${S} inferior gluteal nerve`, false); side(`${S} nerve to obturator internus`, false);
    const sci = V(`Sciatic nerve.${s}`), hip = C(`${S} hip bone`, 3), pirLow = Math.min(...pir.map(p => p[1]));
    const exit = sci.filter(p => p[1] < pirLow + 25 && p[1] > pirLow - 30);
    add(false, 'Sciatic nerve', S, 'leaves the pelvis below the lower border of piriformis (nerve height at the notch minus the lower border of the muscle)', mean(exit, 1) - pirLow, 'mm', mean(exit, 1) < pirLow + 10 && minDist(exit, hip, 3) < 12);
  }

  // ---- Bone penetration of every lower-limb nerve: share of mesh vertices inside a leg or foot bone
  const bones = loadObstacles(), seen = new Set(), inside_ = [];
  for (const e of w.entries) {
    if (e.system !== 'nervous' || seen.has(e.id)) continue; seen.add(e.id);
    const g = e.load(), P = g.positions; let miny = 1e9; for (let i = 1; i < P.length; i += 3) miny = Math.min(miny, P[i]);
    if (miny > 1.0) continue;
    const near_ = bones.filter(b => { for (let k = 0; k < 3; k++) { let lo = 1e9, hi = -1e9; for (let i = k; i < P.length; i += 3) { lo = Math.min(lo, P[i]); hi = Math.max(hi, P[i]); } if (b.hi[k] < lo - .005 || b.lo[k] > hi + .005) return false; } return true; });
    if (!near_.length) continue;
    let n = 0, tot = 0; for (let i = 0; i < P.length; i += 3) { tot++; const p = [P[i], P[i + 1], P[i + 2]]; if (near_.some(b => inside(b, p))) n++; }
    inside_.push({name: e.name, inside: n, total: tot});
  }
  return {rows, inside: inside_};
}
