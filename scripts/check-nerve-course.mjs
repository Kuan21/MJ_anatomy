// Courses of nerves whose route is fixed by landmarks (Gray's Anatomy), checked on the meshes the viewer draws.
// Superior gluteal nerve: leaves the pelvis through the greater sciatic foramen above piriformis, runs between gluteus medius and gluteus minimus, and ends in tensor fasciae latae.
import {loadWorld, closest, sub, len} from './lib/paokao-world.mjs';
import {makeUtil} from './lib/paokao-util.mjs';

const w = loadWorld({paokao: true}), U = makeUtil(w), problems = [], MM = 1000;
for (const [S, s, sx] of [['Left', 'l', 1], ['Right', 'r', -1]]) {
  const nerve = w.mesh(`Superior gluteal nerve.${s}`), pir = w.mesh(`${S} piriformis`), med = w.mesh(`${S} gluteus medius`), min = w.mesh(`${S} gluteus minimus`), tfl = w.mesh(`${S} tensor fasciae latae`);
  const P = nerve.positions, n = P.length / 3, pts = Array.from({length: n}, (_, i) => [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]]);
  const dist = (m, p) => len(sub(p, closest(m, p).point)) * MM;
  // 1. it passes the upper border of piriformis (the greater sciatic foramen): some vertex within 6 mm of the muscle
  const nearest = Math.min(...pts.map(p => dist(pir, p)));
  if (nearest > 6) problems.push(`${S} superior gluteal nerve: it comes no nearer than ${nearest.toFixed(0)} mm to piriformis, so it does not pass the greater sciatic foramen`);
  // 2. the part lateral to the foramen runs between the two muscles: some centre-line points lie within 5 mm of both surfaces
  const between = pts.filter(p => Math.abs(p[0]) > .085 && dist(med, p) < 5 && dist(min, p) < 5).length;
  if (between < 20) problems.push(`${S} superior gluteal nerve: only ${between} vertices lie between gluteus medius and minimus`);
  // 3. the lateral end reaches tensor fasciae latae
  const lateral = pts.reduce((a, p) => Math.abs(p[0]) > Math.abs(a[0]) ? p : a, pts[0]);
  if (dist(tfl, lateral) > 12) problems.push(`${S} superior gluteal nerve: its lateral end is ${dist(tfl, lateral).toFixed(0)} mm from tensor fasciae latae`);
  // 4. it must not end up in front of the hip joint (the old Z-Anatomy position ran 30 mm too far forward at the acetabulum)
  const ahead = pts.filter(p => p[2] > -.030 && Math.abs(p[0]) < .100 && Math.abs(p[0]) > .040).length;
  if (ahead) problems.push(`${S} superior gluteal nerve: ${ahead} vertices lie in front of the hip joint`);
}
void U;
if (problems.length) { console.error('Nerve course check failed:\n - ' + problems.join('\n - ')); process.exit(1); }
console.log('Nerve course OK: the superior gluteal nerves leave through the greater sciatic foramen, run between gluteus medius and minimus and end in tensor fasciae latae.');
