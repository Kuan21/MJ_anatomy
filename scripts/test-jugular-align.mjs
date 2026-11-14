// The internal jugular vein (IJV) is moved next to the carotid artery by app/biomechanics-v2/jugular-align.ts. Checks on the actual neck vessel meshes:
// both ends of the vein stay put, the radius is unchanged, the vein touches the artery without entering it, it clears the carotid branches, and the centre line stays smooth.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';
const root = new URL('../', import.meta.url);
const {joinCarotids} = await quizModule('app/biomechanics-v2/carotid-junction.ts');
const {alignJugulars} = await quizModule('app/biomechanics-v2/jugular-align.ts');
const load = () => JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('public/models/neck-vessels.json.gz', root)))).vessels.map(v => ({...v, positions: v.positions.slice()}));
const before = load(), after = load(); joinCarotids(before); joinCarotids(after); alignJugulars(after);
const get = (vs, n) => vs.find(v => v.name === n).positions;
const band = (pos, y, h) => { const o = []; for (let i = 0; i < pos.length; i += 3) if (Math.abs(pos[i + 1] - y) <= h) o.push([pos[i], pos[i + 1], pos[i + 2]]); return o; };
const ctr = p => [p.reduce((a, b) => a + b[0], 0) / p.length, p.reduce((a, b) => a + b[2], 0) / p.length];
const rad = (p, c) => p.reduce((a, b) => a + Math.hypot(b[0] - c[0], b[2] - c[1]), 0) / p.length;
const centre = (pos, y) => { const b = band(pos, y, .002); if (b.length < 6) return null; const c = ctr(b); return {c, r: rad(b, c)}; };
let worst = {gap: 0, minGap: 1e9, branch: 1e9, kink: 0}, rows = 0;
for (const [side, sg] of [['l', 1], ['r', -1]]) {
  const name = `Internal jugular vein.${side}`, a = get(after, name), b = get(before, name), n = a.length / 3;
  assert.equal(n, b.length / 3);
  // ends: the confluence (bottom) and the jugular foramen (top) are not moved; no vertex moves vertically
  let moved = 0, vertical = 0, ymin = 1e9, ymax = -1e9;
  for (let i = 0; i < n; i++) { ymin = Math.min(ymin, b[i * 3 + 1]); ymax = Math.max(ymax, b[i * 3 + 1]); }
  for (let i = 0; i < n; i++) {
    const d = Math.hypot(a[i * 3] - b[i * 3], a[i * 3 + 2] - b[i * 3 + 2]); vertical = Math.max(vertical, Math.abs(a[i * 3 + 1] - b[i * 3 + 1]));
    if (b[i * 3 + 1] < ymin + .004 || b[i * 3 + 1] > ymax - .008) moved = Math.max(moved, d);
    else moved = Math.max(moved, 0);
  }
  assert.equal(vertical, 0, 'the vein is moved horizontally only');
  let endMove = 0; for (let i = 0; i < n; i++) if (b[i * 3 + 1] < ymin + .0005 || b[i * 3 + 1] > ymax - .0005) endMove = Math.max(endMove, Math.hypot(a[i * 3] - b[i * 3], a[i * 3 + 2] - b[i * 3 + 2]));
  assert.ok(endMove < 1e-9, `${name}: the end caps move ${endMove}`);
  // the shape of every ring is kept (translation only), so the radius is unchanged
  for (let y = 1.43; y <= 1.57; y += .02) { const p = centre(b, y), q = centre(a, y); if (p && q) assert.ok(Math.abs(p.r - q.r) < 2e-4, `${name}: radius changed at ${y}`); }
  const cca = get(after, side === 'l' ? 'Left common carotid artery' : 'Right common carotid artery'), ica = get(after, `Internal carotid artery.${side}`), eca = get(after, `External carotid artery.${side}`);
  let last = null;
  for (let y = 1.43; y <= 1.57001; y += .005) {
    const j = centre(a, y); if (!j) continue;
    const art = y < 1.485 ? centre(cca, y) : centre(ica, y);
    if (art) {
      const gap = Math.hypot(j.c[0] - art.c[0], j.c[1] - art.c[1]) - j.r - art.r;
      if (y >= 1.435 && y <= 1.5) { worst.gap = Math.max(worst.gap, gap); worst.minGap = Math.min(worst.minGap, gap); assert.ok(gap < .0035, `${name}: wall gap to the artery ${(gap * 1e3).toFixed(1)} mm at ${y.toFixed(3)}`); }
      assert.ok(gap > 0, `${name}: the vein is inside the artery by ${(-gap * 1e3).toFixed(1)} mm at ${y.toFixed(3)}`);
    }
    if (y >= 1.49) for (const br of [ica, eca]) { const o = centre(br, y); if (o) { const gap = Math.hypot(j.c[0] - o.c[0], j.c[1] - o.c[1]) - j.r - o.r; worst.branch = Math.min(worst.branch, gap); assert.ok(gap > 0, `${name}: inside a carotid branch by ${(-gap * 1e3).toFixed(1)} mm at ${y.toFixed(3)}`); } }
    if (last) { const dx = (j.c[0] - last.c[0]) * sg, dz = j.c[1] - last.c[1]; worst.kink = Math.max(worst.kink, Math.hypot(dx, dz) / .005); } last = j; rows++;
  }
  assert.ok(worst.kink < 1.2, `${name}: the centre line leans ${worst.kink.toFixed(2)} per unit height`);
}
console.log(`Jugular alignment: ends fixed, radius unchanged; wall gap to the artery ${(worst.minGap * 1e3).toFixed(1)}-${(worst.gap * 1e3).toFixed(1)} mm (1.435-1.50 m); clearance to the carotid branches >= ${(worst.branch * 1e3).toFixed(1)} mm; steepest centre line ${worst.kink.toFixed(2)} (${rows} rings).`);
