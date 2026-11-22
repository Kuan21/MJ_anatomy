// The deep structures of the perineum, for both sexes, built as schematic models (neither BodyParts3D nor Z-Anatomy has them):
//   perineal membrane            the thin fibrous sheet that closes the pubic arch (the lower layer of the urogenital diaphragm), a slab 2 mm thick between the ischiopubic rami, with openings for the urethra (and the vagina)
//   deep transverse perineal     a thin band above the membrane from the ischiopubic ramus across behind the urethra to the perineal body (left and right halves)
//   external urethral sphincter  a muscular sleeve round the urethra just above the membrane
//   perineal body                the fibromuscular knot in the midline between the vaginal opening / the bulb of the penis and the anal canal
//   bulb of penis, crus of penis the posterior parts of the corpus spongiosum and the corpora cavernosa, marked as surface patches on the atlas meshes (male only; the female bulbs and crura are #333's)
// Everything is measured on the atlas meshes (the hip bone of the same sex, the urethra, the vagina, the external anal sphincter), not typed in.
import {ShapeUtils, Vector2} from 'three';
import {sub, add, mul, unit, len, lerp, dot, cross} from '../lib/paokao-util.mjs';
import {belly, catMesh, clearOf} from './perineal-muscles.mjs';

const SIDES = [{w: 'Right', sx: -1, zh: '右'}, {w: 'Left', sx: 1, zh: '左'}];
const P = (x, y, z) => [x, y, z];
const ring = (n, r, f) => Array.from({length: n}, (_, i) => { const a = i / n * Math.PI * 2; return [Math.cos(a) * r[0], Math.sin(a) * r[1]]; });

/** A slab of thickness `t` over a polygon with holes, in the plane through `O` spanned by `eu` and `ev` (unit, perpendicular); `n` is the plane normal. Triangles are wound outward. */
function slab(O, eu, ev, n, contour, holes, t) {
  const loops = [contour, ...holes], flat = loops.flat(), faces = ShapeUtils.triangulateShape(contour.map(p => new Vector2(p[0], p[1])), holes.map(h => h.map(p => new Vector2(p[0], p[1]))));
  const at = ([u, v], s) => add(add(O, add(mul(eu, u), mul(ev, v))), mul(n, s * t / 2)), N = flat.length, positions = [], indices = [];
  for (const p of flat) positions.push(...at(p, 1));
  for (const p of flat) positions.push(...at(p, -1));
  const tri = (a, b, c, want) => { const A = positions.slice(a * 3, a * 3 + 3), B = positions.slice(b * 3, b * 3 + 3), C = positions.slice(c * 3, c * 3 + 3), g = cross(sub(B, A), sub(C, A)); indices.push(...(dot(g, want) >= 0 ? [a, b, c] : [a, c, b])); };
  for (const [a, b, c] of faces) { tri(a, b, c, n); tri(a + N, b + N, c + N, mul(n, -1)); }
  // side walls: along every loop; outward = away from the polygon centre for the contour, towards the hole centre for a hole
  let off = 0; loops.forEach((lp, li) => {
    const cen = lp.reduce((s, p) => [s[0] + p[0] / lp.length, s[1] + p[1] / lp.length], [0, 0]), C3 = add(O, add(mul(eu, cen[0]), mul(ev, cen[1])));
    for (let i = 0; i < lp.length; i++) {
      const a = off + i, b = off + (i + 1) % lp.length, mid = mul(add(add(positions.slice(a * 3, a * 3 + 3), positions.slice(b * 3, b * 3 + 3)), [0, 0, 0]), .5), out = sub(mid, C3), want = li === 0 ? out : mul(out, -1);
      tri(a, b, b + N, want); tri(a, b + N, a + N, want);
    }
    off += lp.length;
  });
  return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
}
/** A closed ellipsoid. */
function ellipsoid(c, rx, ry, rz, rings = 14, seg = 20) {
  const positions = [], indices = [];
  for (let i = 0; i <= rings; i++) { const th = i / rings * Math.PI; for (let j = 0; j < seg; j++) { const ph = j / seg * Math.PI * 2; positions.push(c[0] + rx * Math.sin(th) * Math.cos(ph), c[1] + ry * Math.cos(th), c[2] + rz * Math.sin(th) * Math.sin(ph)); } }
  for (let i = 0; i < rings; i++) for (let j = 0; j < seg; j++) { const a = i * seg + j, b = i * seg + (j + 1) % seg, c2 = (i + 1) * seg + j, d = (i + 1) * seg + (j + 1) % seg; indices.push(a, c2, b, b, c2, d); }
  return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
}
/** A sleeve round a vertical axis through `c` (x, z), from y0 up to y1: inner radius ri, outer radius ro swelling in the middle. */
function sleeve(c, y0, y1, ri, ro, rings = 10, seg = 28) {
  const positions = [], indices = [], at = (r, y, j) => [c[0] + r * Math.cos(j / seg * Math.PI * 2), y, c[1] + r * Math.sin(j / seg * Math.PI * 2)];
  const prof = Array.from({length: rings + 1}, (_, i) => { const t = i / rings; return {y: y0 + (y1 - y0) * t, ro: ri + (ro - ri) * (.55 + .45 * Math.sin(Math.PI * t)) * (i === 0 || i === rings ? .8 : 1)}; });
  for (const p of prof) for (let j = 0; j < seg; j++) positions.push(...at(p.ro, p.y, j));
  for (const p of prof) for (let j = 0; j < seg; j++) positions.push(...at(ri, p.y, j));
  const N = (rings + 1) * seg;
  for (let i = 0; i < rings; i++) for (let j = 0; j < seg; j++) { const a = i * seg + j, b = i * seg + (j + 1) % seg, c2 = (i + 1) * seg + j, d = (i + 1) * seg + (j + 1) % seg; indices.push(a, b, c2, b, d, c2); indices.push(a + N, c2 + N, b + N, b + N, c2 + N, d + N); }
  for (const [i, flip] of [[0, true], [rings, false]]) for (let j = 0; j < seg; j++) { const a = i * seg + j, b = i * seg + (j + 1) % seg; indices.push(...(flip ? [a, a + N, b, b, a + N, b + N] : [a, b, a + N, b, b + N, a + N])); }
  return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
}

const CARD = {
  membrane: {origin: ['Inner surfaces of the ischiopubic rami', '坐骨恥骨支內面'], course: ['A thin triangular fibrous sheet that closes the pubic arch below the pelvic floor; the urethra (and the vagina) pass through it, and it separates the deep from the superficial perineal pouch', '封住恥骨弓的薄三角形纖維膜，位在盆底下方；尿道（女性另有陰道）穿過它，並隔開會陰深袋與淺袋'], supply: ['Gives the erectile tissues and the superficial perineal muscles a firm base to act against', '為勃起組織與會陰淺層肌肉提供穩固的附著面']},
  deepTransverse: {origin: ['Inner surface of the ischiopubic ramus', '坐骨恥骨支內面'], insertion: ['Perineal body (central tendon of the perineum), meeting its fellow of the other side', '會陰體（會陰中心腱），與對側會合'], nerve: ['Perineal branch of the pudendal nerve', '陰部神經會陰支'], action: ['Fixes the perineal body and supports the urethra within the deep perineal pouch', '固定會陰體，並在會陰深袋內支撐尿道']},
  sphincter: {origin: ['Inferior pubic ramus (and the perineal membrane)', '恥骨下支（與會陰膜）'], insertion: ['Encircles the membranous urethra (the female urethra) and blends with the perineal body behind it', '環繞膜部尿道（女性為尿道），向後與會陰體融合'], nerve: ['Perineal branch of the pudendal nerve', '陰部神經會陰支'], action: ['Voluntary sphincter of the urethra: closes it and stops the flow of urine', '尿道的隨意括約肌：關閉尿道、中止排尿']},
  body: {origin: ['Midline between the vaginal opening or the bulb of the penis and the anal canal', '位於陰道口或陰莖球與肛管之間的中線'], course: ['A fibromuscular knot, the central tendon of the perineum, where the bulbospongiosus, the transverse perineal muscles, the external anal sphincter and the levator ani meet', '纖維肌性的結節（會陰中心腱），球海綿體肌、會陰橫肌、外肛門括約肌與提肛肌在此會合'], supply: ['Anchors the perineal muscles; it is stretched in childbirth', '固定會陰肌肉；分娩時被拉長']},
  bulbPenis: {origin: ['Posterior end of the corpus spongiosum, below the perineal membrane', '尿道海綿體的後端，位於會陰膜下方'], course: ['The expanded root of the corpus spongiosum, covered by the bulbospongiosus; the urethra enters it from above', '尿道海綿體膨大的根部，被球海綿體肌覆蓋；尿道由上方進入'], supply: ['Marked on the corpus spongiosum of the atlas', '標示在圖譜的尿道海綿體表面']},
  crusPenis: {origin: ['Ischiopubic ramus', '坐骨恥骨支'], course: ['The posterior end of each corpus cavernosum, covered by the ischiocavernosus; the two crura unite in front of the pubic arch to form the shaft', '各側陰莖海綿體的後端，被坐骨海綿體肌覆蓋；兩側陰莖腳在恥骨弓前方會合成陰莖體'], supply: ['Marked on the corpora cavernosa of the atlas', '標示在圖譜的陰莖海綿體表面']},
};

export default function perinealDeep(U, prior) {
  const out = [];
  const hip = (name, female) => { const es = U.find(name).filter(e => female ? /^HRAF-/.test(e.id ?? '') : !/^HRAF-/.test(e.id ?? '') && !/^PK/.test(e.id ?? '')); if (!es.length) throw new Error(`perineal deep: no ${female ? 'female' : 'male'} ${name}`); return Array.from(es[0].load().positions); };
  const tuberosity = H => { let b = null; for (let i = 0; i < H.length; i += 3) if (H[i + 2] < -.03 && (!b || H[i + 1] < b[1])) b = [H[i], H[i + 1], H[i + 2]]; return b; };
  /** The lower border of the pubic symphysis on this side: the lowest vertex near the midline in front. */
  const symphysis = (H, sx) => { let b = null; for (let i = 0; i < H.length; i += 3) if (H[i] * sx > 0 && H[i] * sx < .012 && H[i + 2] > -.03 && (!b || H[i + 1] < b[1])) b = [H[i], H[i + 1], H[i + 2]]; return b; };
  const femalePart = name => { const sp = prior.find(q => q.name === name && q.sex === 'female'); if (sp) return catMesh(sp.geometry); const es = U.find(name).filter(e => /^HRAF-/.test(e.id ?? '')); if (!es.length) throw new Error(`perineal deep: no female ${name}`); return catMesh(es.map(e => e.load())); };
  const anus = U.find('External anal sphincter').flatMap(e => Array.from(e.load().positions));
  let anusFront = -1e9; for (let i = 0; i < anus.length; i += 3) anusFront = Math.max(anusFront, anus[i + 2]);

  for (const female of [true, false]) {
    const tag = {sex: female ? 'female' : 'male'};
    const HL = hip('Left hip bone', female), HR = hip('Right hip bone', female), TL = tuberosity(HL), TR = tuberosity(HR), SL = symphysis(HL, 1), SR = symphysis(HR, -1);
    // the plane of the membrane: through the lower border of the symphysis and the two tuberosities
    const O0 = [0, (SL[1] + SR[1]) / 2, (SL[2] + SR[2]) / 2], mid = [0, (TL[1] + TR[1]) / 2, (TL[2] + TR[2]) / 2], ev = unit(sub(mid, O0)), eu = [1, 0, 0];
    let n = unit(cross(eu, ev)); if (n[1] < 0) n = mul(n, -1);   // n points up
    // the superficial pouch lies BELOW the membrane (the bulbs and crura, the superficial muscles) and the pelvic floor above it: lift the plane from the lower border of the symphysis until
    // every erectile structure of this sex lies under it (1.5 mm clear); in the male the prostate apex caps the lift (the atlas bulb of the penis touches the prostate)
    const uret0 = female ? U.axisAt('Female urethra', .852) : U.axisAt('Urethra', .857, null, .002);
    const erectile = [];
    if (female) for (const nm of ['Left crus of clitoris', 'Right crus of clitoris', 'Left bulb of vestibule', 'Right bulb of vestibule']) { const q = femalePart(nm).positions, keep = []; for (let i = 0; i < q.length; i += 3) if (q[i + 2] < -.002) keep.push(q[i], q[i + 1], q[i + 2]); erectile.push(keep); }   // behind the body of the clitoris, which lies in front of the arch
    else for (const nm of ['Corpus cavernosum of penis', 'Corpus spongiosum of penis']) { const q = Array.from(U.mesh(nm).positions), keep = []; for (let i = 0; i < q.length; i += 3) if (q[i + 2] < -.004) keep.push(q[i], q[i + 1], q[i + 2]); erectile.push(keep); }
    const heights = []; for (const A of erectile) for (let i = 0; i < A.length; i += 3) heights.push(dot(sub([A[i], A[i + 1], A[i + 2]], O0), n));
    heights.sort((p, q) => p - q);
    let lift = heights[Math.floor(heights.length * .9)] + .0015;   // the structures lie under the membrane except for their highest 10 % (the atlas bulbs reach high beside the vagina)
    // the male prostate apex caps the lift; the urethra top is needed for the female sphincter below
    const urethraMesh = Array.from(U.mesh(female ? 'Female urethra' : 'Urethra').positions); let urTop = -1e9; for (let i = 0; i < urethraMesh.length; i += 3) if (Math.abs(urethraMesh[i + 2] - uret0[2]) < .02) urTop = Math.max(urTop, urethraMesh[i + 1]);
    const yO0 = O0[1] - (n[0] * (uret0[0] - O0[0]) + n[2] * (uret0[2] - O0[2])) / n[1];
    if (!female) { const pr = Array.from(U.mesh('Prostate').positions); let cap = 1e9; for (let i = 0; i < pr.length; i += 3) cap = Math.min(cap, dot(sub([pr[i], pr[i + 1], pr[i + 2]], O0), n)); lift = Math.min(lift, cap - .0015); }
    const O = add(O0, mul(n, lift));
    const onPlane = (x, z) => P(x, O[1] - (n[0] * (x - O[0]) + n[2] * (z - O[2])) / n[1], z), uv = p => [dot(sub(p, O), eu), dot(sub(p, O), ev)];
    // the openings: urethra (and vagina in the female). The urethra axis is vertical there; its x and z are measured on the atlas meshes
    const uret = female ? U.axisAt('Female urethra', .852) : U.axisAt('Urethra', .857, null, .002);
    const vag = female ? U.axisAt('Vagina', .84, null, .002) : null;
    const hole = (c, rx, rz) => ring(24, [rx, rz]).map(([a, b]) => { const p = uv(onPlane(c[0], c[2])); return [p[0] + a, p[1] + b]; });
    const holes = [hole(uret, female ? .0045 : .0050, female ? .0045 : .0050)]; if (female) holes.push(hole([vag[0], vag[1], vag[2] - .003], .0105, .0070));
    // the membrane: a trapezoid between the rami (top edge at the symphysis, base along the line of the tuberosities), inset 3 mm from the bone
    const tl = uv(TL), tr = uv(TR), sl = uv(SL), sr = uv(SR);
    const contour = [[sr[0] + .003, sr[1]], [sl[0] - .003, sl[1]], [tl[0] - .004, tl[1] - .003], [tr[0] + .004, tr[1] - .003]];
    // winding for ShapeUtils: any, it is reordered inside; the slab fixes the triangle winding itself
    out.push({name: 'Perineal membrane', zh: '會陰膜', system: 'connective', kind: 'fascia-dense', ...tag, geometry: [slab(O, eu, ev, n, contour, holes, .002)], card: CARD.membrane, refs: []});

    // the perineal body: where the superficial muscles meet (the same point as scripts/paokao-structures/perineal-muscles.mjs)
    let pbY, pbZ;
    if (female) { const V = Array.from(femalePart('Vagina').positions); let lo = 1e9; for (let i = 1; i < V.length; i += 3) lo = Math.min(lo, V[i]); pbY = lo + .006; pbZ = Math.max(anusFront + .012, -.052); }
    else { const sp = Array.from(U.mesh('Corpus spongiosum of penis').positions); let lo = 1e9, back = 1e9; for (let i = 0; i < sp.length; i += 3) { back = Math.min(back, sp[i + 2]); if (sp[i + 2] < -.004) lo = Math.min(lo, sp[i + 1]); } pbY = lo + .002; pbZ = back - .006; }   // the bulb only (z behind the shaft), as in the muscles
    const PBc = P(0, pbY - .004, pbZ);
    out.push({name: 'Perineal body', zh: '會陰體', system: 'connective', kind: 'fascia-dense', ...tag, geometry: [ellipsoid(PBc, .0062, .0052, .0052)], card: CARD.body, refs: []});

    // the external urethral sphincter: a sleeve round the urethra just above the membrane
    const base = onPlane(uret[0], uret[2]);
    out.push({name: 'External urethral sphincter', zh: '尿道外括約肌', system: 'muscular', kind: 'muscle', ...tag, geometry: [sleeve([uret[0], uret[2]], female ? base[1] - .005 : base[1] + .0015, female ? Math.max(base[1] + .003, Math.min(urTop - .001, base[1] + .012)) : base[1] + .012, female ? .0048 : .0044, female ? .0080 : .0078)], card: CARD.sphincter, refs: []});

    for (const S of SIDES) {
      const sx = S.sx, T = sx > 0 ? TL : TR, Sy = sx > 0 ? SL : SR, name = (n, zh) => ({name: `${S.w} ${n}`, zh: `${S.zh}${zh}`});
      // the deep transverse perineal muscle: from the middle of the ramus, 4 mm above the membrane, across behind the urethra to the midline
      const ramus = lerp(Sy, T, .5), start = add(onPlane(ramus[0] - sx * .004, ramus[2]), mul(n, .0045)), behind = female ? vag : uret, pz = behind[2] - (female ? .016 : .012);
      const end = add(onPlane(sx * .0012, pz), mul(n, .0045)), midp = add(onPlane(sx * .012, (start[2] + pz) / 2 - .002), mul(n, .0045));
      out.push({...name('deep transverse perineal muscle', '會陰深橫肌'), system: 'muscular', kind: 'muscle', ...tag, geometry: [belly([start, lerp(start, midp, .5), midp, lerp(midp, end, .5), end], [.0010, .0028, .0034, .0028, .0010], [.0005, .0009, .0011, .0009, .0005], {ref: [0, 1, 0]})], card: CARD.deepTransverse, refs: []});
      if (!female) {
        // the crus of the penis: the part of the corpus cavernosum behind the point where the two corpora unite (a smooth-edged patch on the atlas mesh)
        out.push({...name('crus of penis', '陰莖腳'), system: 'reproductive', kind: 'surface', parent: 'Corpus cavernosum of penis', ...tag,
          geometry: [U.patchWhere('Corpus cavernosum of penis', tr => tr.mid[0] * sx > .004 && tr.mid[2] < -.012, .0004, p => p[2] < -.006 && p[0] * sx > .0, .0015)], card: CARD.crusPenis, refs: []});
      }
    }
    if (!female) out.push({name: 'Bulb of penis', zh: '陰莖球', system: 'reproductive', kind: 'surface', parent: 'Corpus spongiosum of penis', ...tag,
      geometry: [U.patchWhere('Corpus spongiosum of penis', tr => tr.mid[2] < -.002 && tr.mid[1] > .8, .0004, p => p[2] < .004, .0015)], card: CARD.bulbPenis, refs: []});
  }
  return out;
}
