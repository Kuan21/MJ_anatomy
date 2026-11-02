// The posterior layer of the thoracolumbar fascia as two halves (left and right), each a diamond seen from behind, laid on the back surface of the erector spinae.
// Position: rays from behind onto the erector spinae group, the vertebrae, sacrum, hip bone and ribs give the surface the fascia lies on; the sheet is lifted 1.2 mm off it and
// smoothed, so it follows the muscle and never sinks into it or into a bone. Outline (per side, from the spinous processes): an upper angle that narrows and thins over the
// lower thoracic back (medial to the rib angles, medial to and deep to the scapula), the widest and thickest part at L2–L4 where the lateral edge is the lateral raphe,
// and a lower angle that narrows onto the back of the sacrum and the posterior iliac crest. The two halves stop 5 mm from the midline, so the spinous processes stand out
// between them. The lumbar part (below T12) is a separate, thicker and denser piece; the thoracic part is thin.
// Position checked against the Gray's Anatomy 1918 plates and OpenStax Anatomy and Physiology descriptions (posterior layer: spinous processes to the lateral raphe; sacrum and
// iliac crest below); the final anatomical check is the user's.
import {sub, add, mul, unit, cross} from '../lib/paokao-util.mjs';

const SIDES = [{w: 'Right', sx: -1}, {w: 'Left', sx: 1}];
/** y (mm) -> lateral extent of each half from the midline (mm): the diamond outline. */
const OUTLINE = [[1290, 8], [1250, 30], [1210, 48], [1170, 56], [1140, 62], [1100, 78], [1080, 86], [1050, 88], [1020, 84], [1000, 70], [985, 52], [965, 34], [945, 18], [930, 8]];
/** y (mm) -> thickness (mm): thin over the thorax, thickest over the lumbar region. */
const THICK = [[1290, .5], [1140, .8], [1080, 1.6], [1020, 1.6], [930, 1.0]];
const X_MED = .005, DY = .004, COLS = 40, LIFT = .0012, CLEAR = .0006, SPLIT_Y = 1.14;
const VERTEBRAE = ['Fifth thoracic vertebra', 'Sixth thoracic vertebra', 'Seventh thoracic vertebra', 'Eighth thoracic vertebra', 'Ninth thoracic vertebra', 'Tenth thoracic vertebra', 'Eleventh thoracic vertebra', 'Twelfth thoracic vertebra', 'First lumbar vertebra', 'Second lumbar vertebra', 'Third lumbar vertebra', 'Fourth lumbar vertebra', 'Fifth lumbar vertebra', 'Sacrum', 'Coccyx'];
const RIBS = ['fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];

const at = (table, y) => { const ym = y * 1000; if (ym >= table[0][0]) return table[0][1]; if (ym <= table[table.length - 1][0]) return table[table.length - 1][1]; let k = 0; while (table[k + 1][0] > ym) k++; const [y0, v0] = table[k], [y1, v1] = table[k + 1]; return v0 + (v1 - v0) * (y0 - ym) / (y0 - y1); };

/** A closed thin sheet through a grid of points (rows × cols) with a thickness per row. */
function thickSheet(grid, thick) {
  const rows = grid.length, cols = grid[0].length, positions = [], indices = [];
  const nrm = (i, j) => { const a = grid[Math.min(rows - 1, i + 1)][j], b = grid[Math.max(0, i - 1)][j], c = grid[i][Math.min(cols - 1, j + 1)], d = grid[i][Math.max(0, j - 1)]; return unit(cross(sub(a, b), sub(c, d))); };
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { const n = nrm(i, j), t = thick[i] / 2; positions.push(...add(grid[i][j], mul(n, t)), ...sub(grid[i][j], mul(n, t))); }
  const id = (i, j, s) => (i * cols + j) * 2 + s;
  for (let i = 0; i < rows - 1; i++) for (let j = 0; j < cols - 1; j++) {
    indices.push(id(i, j, 0), id(i + 1, j, 0), id(i, j + 1, 0), id(i, j + 1, 0), id(i + 1, j, 0), id(i + 1, j + 1, 0));
    indices.push(id(i, j, 1), id(i, j + 1, 1), id(i + 1, j, 1), id(i, j + 1, 1), id(i + 1, j + 1, 1), id(i + 1, j, 1));
  }
  // close the border so each half is one solid piece and the thick lumbar edge is visible
  const wall = (a, b) => indices.push(id(...a, 0), id(...b, 0), id(...a, 1), id(...b, 0), id(...b, 1), id(...a, 1));
  for (let j = 0; j < cols - 1; j++) { wall([0, j + 1], [0, j]); wall([rows - 1, j], [rows - 1, j + 1]); }
  for (let i = 0; i < rows - 1; i++) { wall([i, 0], [i + 1, 0]); wall([i + 1, cols - 1], [i, cols - 1]); }
  return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
}

export function thoracolumbarFascia(U) {
  const out = [];
  for (const S of SIDES) {
    const muscles = ['longissimus thoracis', 'iliocostalis lumborum', 'iliocostalis thoracis', 'spinalis thoracis', 'semispinalis thoracis'].map(n => `${S.w} ${n}`);
    const midline = ['set of interspinales lumborum', 'Set of interspinales lumborum', `${S.w} interspinalis thoracis`];
    const bones = [...VERTEBRAE, `${S.w} hip bone`, ...RIBS.map(r => `${S.w} ${r} rib`)];
    const names = [...muscles, ...midline, ...bones].filter(U.has);
    if (names.filter(n => muscles.includes(n)).length < 3) throw new Error(`thoracolumbar fascia: erector spinae of the ${S.w.toLowerCase()} side not found`);
    const hit = (x, y) => { let z = null; for (const n of names) { const h = U.rayHit(n, [x, y, -.4], [0, 0, 1]); if (h && (z === null || h.point[2] < z)) z = h.point[2]; } return z; };
    const rows = [];
    const yTop = OUTLINE[0][0] / 1000, yBot = OUTLINE[OUTLINE.length - 1][0] / 1000;
    for (let y = yBot; y <= yTop + 1e-9; y += DY) {
      const w = at(OUTLINE, y) / 1000, xs = [], hits = [];
      for (let j = 0; j <= COLS; j++) { const x = S.sx * (X_MED + (w - X_MED) * j / COLS); xs.push(x); hits.push(hit(x, y)); }
      // the sheet never dips more than 1 cm in front of the most posterior surface of its row: a ray beside a spinous process or lateral to the erector spinae would otherwise reach
      // the lamina, the iliac fossa or the shaft of a rib, far in front of the plane the fascia lies in
      const ref = Math.min(...hits.filter(v => v !== null)), zs = hits.map(v => v === null ? null : Math.min(v, ref + .010)); let last = null;
      for (let j = 0; j < zs.length; j++) { if (zs[j] !== null) last = j; else if (last !== null) zs[j] = zs[last] + .3 * Math.abs(xs[j] - xs[last]); }
      for (let j = zs.length - 1; j >= 0; j--) { if (zs[j] === null) { const k = zs.findIndex(v => v !== null); zs[j] = k >= 0 ? zs[k] : -.1; } }
      rows.push({y, xs, zs, hits, thick: at(THICK, y) / 1000});
    }
    // smooth the surface (box filter, three passes) and keep it behind whatever it lies on
    let z = rows.map(r => r.zs);
    for (let pass = 0; pass < 3; pass++) z = z.map((r, i) => r.map((v, j) => { let s = 0, c = 0; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const q = z[i + a]?.[j + b]; if (q !== undefined) { s += q; c++; } } return s / c; }));
    const grid = rows.map((r, i) => r.xs.map((x, j) => [x, r.y, (r.hits[j] === null ? z[i][j] : Math.min(z[i][j], r.hits[j] - CLEAR)) - LIFT]));
    // the two pieces share two rows at the split so they meet without a gap
    const thoracic = rows.map((r, i) => i).filter(i => rows[i].y >= SPLIT_Y - DY * 1.5), lumbar = rows.map((r, i) => i).filter(i => rows[i].y <= SPLIT_Y + DY * 1.5);
    const piece = idx => thickSheet(idx.map(i => grid[i]), idx.map(i => rows[i].thick));
    out.push({side: S.w, segment: 'lumbar', kind: 'fascia-dense', geometry: piece(lumbar)});
    out.push({side: S.w, segment: 'thoracic', kind: 'fascia', geometry: piece(thoracic)});
  }
  return out;
}
