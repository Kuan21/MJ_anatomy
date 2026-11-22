// The three superficial muscles of the perineum, for both sexes, built as schematic models on the erectile structures they cover (neither BodyParts3D nor the Z-Anatomy exports have them):
//   ischiocavernosus            from the inner surface of the ischial tuberosity and the ischial ramus to the crus of the penis / clitoris, which it covers on its superficial (lower, medial) face
//   bulbospongiosus             from the perineal body (and, in the male, the median raphe) forward over the bulb of the penis / the bulb of the vestibule and the greater vestibular gland
//   superficial transverse perineal  a thin band from the ischial tuberosity across the back of the urogenital triangle to the perineal body
// Each is a flattened closed tube with its own width and thickness at every point of a smooth path (a fusiform belly), so the ends are thin and the middle is full, and it lies against the
// structure it covers. The paths are measured on the meshes (the crura and bulbs, the hip bone, the vagina or the root of the penis), not typed in: the female structures follow the clitoral
// complex wherever scripts/lib/clitoris-place.mjs puts it. The male ones follow the corpus cavernosum and the corpus spongiosum of the atlas.
import {sub, add, mul, unit, len, lerp, cross, dot} from '../lib/paokao-util.mjs';

const SIDES = [{w: 'Right', l: 'right', sx: -1, zh: '右'}, {w: 'Left', l: 'left', sx: 1, zh: '左'}];
const P = (x, y, z) => [x, y, z];

/** Catmull-Rom spline through the control points, n samples. */
export function spline(pts, n) {
  const out = [], m = pts.length, at = i => pts[Math.max(0, Math.min(m - 1, i))];
  for (let s = 0; s < m - 1; s++) for (let k = 0; k < n / (m - 1); k++) {
    const t = k / (n / (m - 1)), p0 = at(s - 1), p1 = at(s), p2 = at(s + 1), p3 = at(s + 2);
    out.push([0, 1, 2].map(a => .5 * (2 * p1[a] + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t * t + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t ** 3)));
  }
  out.push(pts[m - 1]); return out;
}
const lerpArr = (arr, t) => { const f = t * (arr.length - 1), i = Math.min(arr.length - 2, Math.floor(f)), u = f - i; return arr[i] * (1 - u) + arr[i + 1] * u; };

/**
 * A closed flattened tube along `ctrl` (control points) with half-width rh (across the path, in the horizontal plane) and half-thickness rv (the other way) interpolated from the arrays
 * `wid` and `thk` (metres, evenly spaced along the path); the two ends close to a point. `ref` is the direction the thickness axis leans towards (default up).
 */
export function belly(ctrl, wid, thk, {n = 26, sides = 14, ref = [0, 1, 0]} = {}) {
  const path = spline(ctrl, n), positions = [], indices = [], N = path.length;
  path.forEach((p, i) => {
    const tan = unit(sub(path[Math.min(N - 1, i + 1)], path[Math.max(0, i - 1)]));
    let side = cross(tan, ref); if (len(side) < 1e-6) side = cross(tan, [0, 0, 1]); side = unit(side); const vert = unit(cross(side, tan)), t = i / (N - 1), rh = lerpArr(wid, t), rv = lerpArr(thk, t);
    for (let j = 0; j < sides; j++) { const a = j / sides * Math.PI * 2; positions.push(...add(p, add(mul(side, Math.cos(a) * rh), mul(vert, Math.sin(a) * rv)))); }
  });
  for (let i = 0; i < N - 1; i++) for (let j = 0; j < sides; j++) { const a = i * sides + j, b = i * sides + (j + 1) % sides, c = (i + 1) * sides + j, d = (i + 1) * sides + (j + 1) % sides; indices.push(a, c, b, b, c, d); }
  for (const [r, flip] of [[0, true], [N - 1, false]]) { const c0 = positions.length / 3; positions.push(...path[r]); for (let j = 0; j < sides; j++) { const a = r * sides + j, b = r * sides + (j + 1) % sides; indices.push(...(flip ? [c0, b, a] : [c0, a, b])); } }
  return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
}

export const catPos = list => { const o = []; for (const g of list) for (const v of g.positions) o.push(v); return o; };
/** Centroids of `count` equal slices of a vertex cloud along coordinate `axis` (0 = x, 2 = z), ordered from `from` to `to` (m), with the vertical extent of each slice. */
export function slices(P3, axis, from, to, count) {
  const out = [], step = (to - from) / count;
  for (let s = 0; s < count; s++) {
    const a = Math.min(from + step * s, from + step * (s + 1)), b = Math.max(from + step * s, from + step * (s + 1)); let c = [0, 0, 0], k = 0, lo = 1e9, hi = -1e9;
    for (let i = 0; i < P3.length; i += 3) { const v = P3[i + axis]; if (v < a || v >= b) continue; c[0] += P3[i]; c[1] += P3[i + 1]; c[2] += P3[i + 2]; k++; lo = Math.min(lo, P3[i + 1]); hi = Math.max(hi, P3[i + 1]); }
    if (k) out.push({c: c.map(v => v / k), ry: (hi - lo) / 2});
  }
  return out;
}
export const extent = (P3, k) => { let lo = 1e9, hi = -1e9; for (let i = k; i < P3.length; i += 3) { lo = Math.min(lo, P3[i]); hi = Math.max(hi, P3[i]); } return [lo, hi]; };
/** Merged positions and triangles of several meshes. */
export const catMesh = list => { const positions = [], indices = []; let off = 0; for (const g of list) { for (const v of g.positions) positions.push(v); for (const t of g.indices) indices.push(t + off); off += g.positions.length / 3; } return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)}; };
/** Parity test: is the point inside the closed mesh (a ray towards +x crosses an odd number of triangles). */
export function insideMesh(P, I, x, y, z) {
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
/**
 * Moves every vertex of `geo` that lies inside one of the `covers` (the erectile structures the muscle lies on) out of it, in steps of 0.6 mm away from the local middle of that structure
 * (the centre of its vertices within 15 mm), and then eases the result so that the surface stays smooth. The muscle then rests on the structure instead of sinking into it.
 */
export function clearOf(geo, covers) {
  const P = geo.positions, n = P.length / 3, moved = new Uint8Array(n);
  for (const cv of covers) {
    const CP = cv.positions, CI = cv.indices;
    for (let v = 0; v < n; v++) for (let it = 0; it < 10; it++) {
      const x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
      if (!insideMesh(CP, CI, x, y, z)) break;
      let cx = 0, cy = 0, cz = 0, k = 0;
      for (let i = 0; i < CP.length; i += 3) if (Math.hypot(CP[i] - x, CP[i + 1] - y, CP[i + 2] - z) < .015) { cx += CP[i]; cy += CP[i + 1]; cz += CP[i + 2]; k++; }
      if (!k) break;
      let dx = x - cx / k, dy = y - cy / k, dz = z - cz / k; const l = Math.hypot(dx, dy, dz) || 1;
      P[v * 3] += dx / l * .0006; P[v * 3 + 1] += dy / l * .0006; P[v * 3 + 2] += dz / l * .0006; moved[v] = 1;
    }
  }
  return moved.reduce((a, b) => a + b, 0);
}

const CARD = {
  ischiocavernosus: {
    origin: ['Inner surface of the ischial tuberosity and the ischial ramus', '坐骨結節與坐骨支內面'],
    insertion: ['Sides and lower surface of the crus of the penis or clitoris', '陰莖腳或陰蒂腳的側面與下面'],
    nerve: ['Perineal branch of the pudendal nerve', '陰部神經會陰支'],
    action: ['Presses the crus against the pubic arch and helps maintain erection by compressing the venous outflow of the erectile tissue', '把海綿體腳壓向恥骨弓，壓迫勃起組織的靜脈回流，協助維持勃起'],
  },
  bulbospongiosus: {
    origin: ['Perineal body (and the median raphe of the bulb in the male)', '會陰體（男性另有陰莖球的正中縫）'],
    insertion: ['Male: around the bulb and corpus spongiosum, ending on the corpora cavernosa; female: over the bulb of the vestibule and its gland, ending on the body of the clitoris', '男性：包繞陰莖球與尿道海綿體，止於陰莖海綿體；女性：覆蓋前庭球與前庭大腺，止於陰蒂體'],
    nerve: ['Perineal branch of the pudendal nerve', '陰部神經會陰支'],
    action: ['Male: empties the urethra after urination and ejaculation and helps erection; female: narrows the vaginal opening and presses the vestibular gland to release its secretion', '男性：排尿或射精後排空尿道並協助勃起；女性：縮窄陰道口並擠壓前庭大腺使其分泌'],
  },
  transverse: {
    origin: ['Inner surface of the ischial ramus near the ischial tuberosity', '坐骨結節附近的坐骨支內面'],
    insertion: ['Perineal body (central tendon of the perineum)', '會陰體（會陰中心腱）'],
    nerve: ['Perineal branch of the pudendal nerve', '陰部神經會陰支'],
    action: ['Fixes the perineal body, which the other perineal muscles and the pelvic floor attach to', '固定會陰體，使其他會陰肌與盆底肌有穩固的附著點'],
  },
};

export default function perinealMuscles(U, prior) {
  const out = [];
  const hip = (name, female) => { const es = U.find(name).filter(e => female ? /^HRAF-/.test(e.id ?? '') : !/^HRAF-/.test(e.id ?? '') && !/^PK/.test(e.id ?? '')); if (!es.length) throw new Error(`perineal muscles: no ${female ? 'female' : 'male'} ${name}`); return catPos(es.map(e => e.load())); };
  // the female structures: the clitoral complex is built earlier in the same run (neck-breast-vulva.mjs), so it is read from those specs; the vagina is a female atlas mesh
  const femalePart = name => { const sp = prior.find(q => q.name === name && q.sex === 'female'); if (sp) return catPos(sp.geometry); const es = U.find(name).filter(e => /^HRAF-/.test(e.id ?? '')); if (!es.length) throw new Error(`perineal muscles: no female ${name}`); return catPos(es.map(e => e.load())); };
  const femaleMesh = name => { const sp = prior.find(q => q.name === name && q.sex === 'female'); if (sp) return catMesh(sp.geometry); const es = U.find(name).filter(e => /^HRAF-/.test(e.id ?? '')); if (!es.length) throw new Error(`perineal muscles: no female ${name}`); return catMesh(es.map(e => e.load())); };
  const add3 = (...v) => v.reduce((a, b) => add(a, b), [0, 0, 0]);
  /** Lowest vertex of a hip bone behind the pubis (the ischial tuberosity). */
  const tuberosity = H => { let b = null; for (let i = 0; i < H.length; i += 3) if (H[i + 2] < -.03 && (!b || H[i + 1] < b[1])) b = [H[i], H[i + 1], H[i + 2]]; return b; };

  for (const female of [true, false]) {
    const sex = female ? 'female' : undefined, tag = female ? {sex: 'female'} : {sex: 'male'};
    // ---- the perineal body: a midline point behind the vaginal opening (female) or behind the bulb of the penis (male), in front of the anus
    const anus = U.find('External anal sphincter').flatMap(e => Array.from(e.load().positions));
    let anusFront = -1e9; for (let i = 0; i < anus.length; i += 3) anusFront = Math.max(anusFront, anus[i + 2]);
    let bulbBack, vag = null;
    if (female) vag = femalePart('Vagina'); else { const sp = Array.from(U.mesh('Corpus spongiosum of penis').positions); bulbBack = extent(sp, 2)[0]; }
    for (const S of SIDES) {
      const sx = S.sx, H = hip(`${S.w} hip bone`, female), T = tuberosity(H), name = (n, zh) => ({name: `${S.w} ${n}`, zh: `${S.zh}${zh}`});
      // the erectile structures this side
      let crusPts, crusSl, bulbSl;
      if (female) {
        crusPts = femalePart(`${S.w} crus of clitoris`); const bulbPts = femalePart(`${S.w} bulb of vestibule`);
        const [x0, x1] = extent(crusPts, 0); crusSl = slices(crusPts, 0, sx > 0 ? x0 : x1, sx > 0 ? x1 : x0, 8);   // medial end first
        const [b0, b1] = extent(bulbPts, 0); bulbSl = slices(bulbPts, 0, sx > 0 ? b0 : b1, sx > 0 ? b1 : b0, 6);
      } else {
        const cav = Array.from(U.mesh('Corpus cavernosum of penis').positions), mine = []; for (let i = 0; i < cav.length; i += 3) if (cav[i + 2] < -.012 && cav[i] * sx > .006) mine.push(cav[i], cav[i + 1], cav[i + 2]);
        crusPts = mine; const [x0, x1] = extent(mine, 0); crusSl = slices(mine, 0, sx > 0 ? x0 : x1, sx > 0 ? x1 : x0, 6);
        const sp = Array.from(U.mesh('Corpus spongiosum of penis').positions), bulb = []; for (let i = 0; i < sp.length; i += 3) if (sp[i + 2] < -.004) bulb.push(sp[i], sp[i + 1], sp[i + 2]);
        const [z0, z1] = extent(bulb, 2); bulbSl = slices(bulb, 2, z1, z0, 6);   // front first (the bulb lies behind the shaft)
      }
      // perineal body for this side: just in front of the anus, at the height of the lower end of the vagina / the bulb of the penis, 4 mm to this side of the midline
      const pbY = female ? (extentY(vag)[0] + .006) : (bulbSl.reduce((m, s) => Math.min(m, s.c[1]), 1) + .002), pbZ = female ? Math.max(anusFront + .012, -.052) : bulbBack - .006;
      const PB = P(sx * .004, pbY, pbZ);
      // ---- ischiocavernosus: from the tuberosity along the ramus onto the lower and medial face of the crus, ending a little before the body of the clitoris / the union of the crura
      const run = crusSl.slice(1, crusSl.length - 1);
      const origin = add3(T, P(-sx * .007, .006, .004)), last = crusSl[crusSl.length - 1], lastC = add3(last.c, P(-sx * .001, -last.ry - .002, 0));
      const ic = [origin, lerp(origin, lastC, .55), ...[...run].reverse().map(s => add3(s.c, P(-sx * .001, -s.ry - .0022, 0)))];
      out.push({...name('ischiocavernosus', '坐骨海綿體肌'), system: 'muscular', kind: 'muscle', ...tag, geometry: [belly(ic, [.0012, .0034, .0040, .0034, .0022, .0010], [.0008, .0016, .0022, .0020, .0014, .0007], {ref: [sx * .3, 1, 0]})], card: CARD.ischiocavernosus, refs: []});
      // ---- bulbospongiosus: from the perineal body round the lower and lateral side of the bulb to the front of it
      let bs;
      if (female) {
        const b = bulbSl, lat = s => add3(s.c, P(sx * (.0035), -s.ry * .85 - .0015, 0));
        bs = [PB, add3(lerp(PB, lat(b[b.length - 1]), .5), P(sx * .004, .003, 0)), ...[...b].reverse().map(lat)];
      } else {
        const b = bulbSl, around = s => add3(s.c, P(sx * .0046, -s.ry - .0026, 0));   // a broad strip under the bulb, this side's half of it; the two halves meet at the median raphe
        bs = [PB, ...[...b].reverse().map(s => around(s))];
      }
      out.push({...name('bulbospongiosus', '球海綿體肌'), system: 'muscular', kind: 'muscle', ...tag, geometry: [belly(bs, female ? [.0010, .0030, .0038, .0038, .0030, .0020, .0008] : [.0016, .0042, .0050, .0050, .0048, .0038, .0012], female ? [.0008, .0018, .0022, .0022, .0018, .0012, .0006] : [.0008, .0017, .0022, .0022, .0020, .0016, .0007], {ref: female ? [sx * .6, 1, .2] : [0, 1, 0]})], card: CARD.bulbospongiosus, refs: []});
      // ---- superficial transverse perineal: a thin band from the tuberosity to the perineal body
      const from = add3(T, P(-sx * .006, .004, .006)), to = PB, mid = lerp(from, to, .5);
      out.push({...name('superficial transverse perineal muscle', '會陰淺橫肌'), system: 'muscular', kind: 'muscle', ...tag, geometry: [belly([from, lerp(from, mid, .5), mid, lerp(mid, to, .5), to], [.0012, .0030, .0034, .0030, .0010], [.0005, .0010, .0012, .0010, .0005], {ref: [0, 1, 0]})], card: CARD.transverse, refs: []});
      // the muscles rest on the erectile structures they cover and do not sink into them
      const covers = female ? [femaleMesh(`${S.w} crus of clitoris`), femaleMesh(`${S.w} bulb of vestibule`), femaleMesh('Body of clitoris')] : [U.mesh('Corpus cavernosum of penis'), U.mesh('Corpus spongiosum of penis')];
      for (const e of out.slice(-3)) for (const g of e.geometry) clearOf(g, covers);
      // the two sides meet at the midline (the raphe, the perineal body) and never cross it
      for (const e of out.slice(-3)) for (const g of e.geometry) { const Q = g.positions; for (let i = 0; i < Q.length; i += 3) if (Q[i] * sx < -.0009) Q[i] = -sx * .0009; }
    }
  }
  return out;
}
function extentY(P3) { return extent(P3, 1); }
