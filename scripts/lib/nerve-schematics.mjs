// Schematic tube models for the peripheral nerves and veins of the suboccipital / posterior cervical region that neither BodyParts3D nor
// the Z-Anatomy export (nervous.glb, CardioVascular41.fbx, checked against LluisV/Z-Anatomy@6c7f901) contains. Each tube follows the
// textbook course, placed on landmarks measured from the atlas meshes at build time, and is labelled 示意模型 in the UI.
import fs from 'node:fs';

export const SCHEMATIC_NAMES = {
  'Suboccipital nerve': {zh: '枕下神經', en: 'Suboccipital nerve', system: 'nervous', note: 'C1 dorsal ramus'},
  'Greater occipital nerve': {zh: '枕大神經', en: 'Greater occipital nerve', system: 'nervous', note: 'C2 dorsal ramus, medial branch'},
  'Third occipital nerve': {zh: '第三枕神經', en: 'Third occipital nerve', system: 'nervous', note: 'C3 dorsal ramus, medial branch'},
  'Lesser occipital nerve': {zh: '枕小神經', en: 'Lesser occipital nerve', system: 'nervous', note: 'C2-C3 ventral rami (cervical plexus)'},
  'Great auricular nerve': {zh: '耳大神經', en: 'Great auricular nerve', system: 'nervous', note: 'C2-C3 ventral rami (cervical plexus)'},
  'Suboccipital venous plexus': {zh: '枕下靜脈叢', en: 'Suboccipital venous plexus', system: 'venous', note: 'around the vertebral artery in the suboccipital triangle'},
};

/** Catmull-Rom through the waypoints, then a tapered tube with `sides` facets. */
export function tube(points, r0, r1 = r0, samples = 28, sides = 8) {
  const P = points, n = P.length, path = [];
  const at = i => P[Math.max(0, Math.min(n - 1, i))];
  for (let s = 0; s < n - 1; s++) for (let k = 0; k < samples / (n - 1); k++) {
    const t = k / (samples / (n - 1)), p0 = at(s - 1), p1 = at(s), p2 = at(s + 1), p3 = at(s + 2);
    path.push([0, 1, 2].map(a => .5 * ((2 * p1[a]) + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t * t + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t ** 3)));
  }
  path.push(P[n - 1]);
  const positions = [], indices = [];
  let prevNormal = null;
  const norm = v => { const l = Math.hypot(...v) || 1; return v.map(x => x / l); };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  path.forEach((p, i) => {
    const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)], tan = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
    let up = prevNormal ?? (Math.abs(tan[1]) < .9 ? [0, 1, 0] : [1, 0, 0]);
    let side = norm(cross(tan, up)); up = norm(cross(side, tan)); prevNormal = up;
    const r = r0 + (r1 - r0) * i / (path.length - 1);
    for (let j = 0; j < sides; j++) {
      const ang = j / sides * Math.PI * 2, c = Math.cos(ang) * r, s = Math.sin(ang) * r;
      positions.push(p[0] + side[0] * c + up[0] * s, p[1] + side[1] * c + up[1] * s, p[2] + side[2] * c + up[2] * s);
    }
  });
  for (let i = 0; i < path.length - 1; i++) for (let j = 0; j < sides; j++) {
    const a = i * sides + j, b = i * sides + (j + 1) % sides, c = (i + 1) * sides + j, d = (i + 1) * sides + (j + 1) % sides;
    indices.push(a, c, b, b, c, d);
  }
  for (const [ring, flip] of [[0, false], [path.length - 1, true]]) {
    const centre = positions.length / 3, p = path[ring];
    positions.push(...p);
    for (let j = 0; j < sides; j++) { const a = ring * sides + j, b = ring * sides + (j + 1) % sides; indices.push(...(flip ? [centre, a, b] : [centre, b, a])); }
  }
  return {positions: new Float32Array(positions), indices: new Uint32Array(indices)};
}

/** Vertex helpers on atlas meshes. */
export function loadAtlasLandmarks(root) {
  const atlas = JSON.parse(fs.readFileSync(root + 'public/models/atlas.json', 'utf8'));
  const buffers = new Map();
  const vertices = name => {
    const p = atlas.parts.find(x => x.name.toLowerCase() === name.toLowerCase());
    if (!p) throw Error('Landmark part missing: ' + name);
    if (!buffers.has(p.chunk)) buffers.set(p.chunk, fs.readFileSync(root + 'public' + atlas.chunks[p.chunk].url));
    const b = buffers.get(p.chunk), out = new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12));
    const list = []; for (let i = 0; i < out.length; i += 3) list.push([out[i], out[i + 1], out[i + 2]]);
    return list;
  };
  return {vertices};
}

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Build every schematic tube, left (+x) and right (-x). Heights are measured on the atlas meshes so each nerve sits in its real layer. */
export function buildSchematics(root) {
  const {vertices} = loadAtlasLandmarks(root);
  const result = [];
  // `cover`: below the superior nuchal line the nerve must lie at least 3 mm deeper than the outer surface of these muscles.
  const emit = (key, side, spec) => {
    if (spec.cover) spec.pts = spec.pts.map(p => { if (p[1] > 1.586) return p; const r = zRange(spec.cover, p[0], p[1], .012, .005); return r ? [p[0], p[1], Math.max(p[2], r.lo + .003)] : p; });
    result.push({base: key, side, ...spec});
  };
  const occ = vertices('Occipital bone');
  const cache = new Map(), verts = name => (cache.has(name) ? cache.get(name) : (cache.set(name, vertices(name)), cache.get(name)));
  /** z range (min = most posterior surface, max = deepest surface) of the given meshes in a window around (x, y). */
  const zRange = (names, x, y, rx = .008, ry = .004) => {
    let lo = Infinity, hi = -Infinity;
    for (const name of names) for (const v of verts(name)) if (Math.abs(v[0] - x) < rx && Math.abs(v[1] - y) < ry) { lo = Math.min(lo, v[2]); hi = Math.max(hi, v[2]); }
    return lo === Infinity ? null : {lo, hi, mid: (lo + hi) / 2};
  };
  const skullBack = (x, y) => {
    const near = occ.filter(v => Math.abs(v[1] - y) < .004 && Math.abs(v[0] - x) < .008);
    return near.length ? Math.min(...near.map(v => v[2])) : null;
  };
  for (const side of ['l', 'r']) {
    const sx = side === 'l' ? 1 : -1, word = side === 'l' ? 'Left' : 'Right', lc = word.toLowerCase();
    const OCI = [`${word} obliquus capitis inferior`], OCS = [`${word} obliquus capitis superior`], RCP = [`${word} rectus capitis posterior major`, `${word} rectus capitis posterior minor`];
    const SEMI = [`${word} semispinalis capitis`], SPL = [`${word} splenius capitis`];
    const TRAP = [`Descending part of ${lc} trapezius`, `Transverse part of ${lc} trapezius`];
    const deepSuboccipital = [...OCI, ...OCS, ...RCP];
    const z = (names, x, y, pick, fallback, shift = 0) => { const r = zRange(names, x, y); return (r ? r[pick] : fallback) + shift; };
    const sc = vertices(`${word} sternocleidomastoid`);
    const slice = y => sc.filter(v => Math.abs(v[1] - y) < .0025);
    const posterior = y => { const s = slice(y); return s.reduce((m, v) => v[2] < m[2] ? v : m, s[0]); };
    const lateral = y => { const s = slice(y); return s.reduce((m, v) => Math.abs(v[0]) > Math.abs(m[0]) ? v : m, s[0]); };
    const atlasZ = (x, y) => { const r = zRange(['Atlas'], x, y, .01, .006); return r ? r.lo : -.055; };

    // Suboccipital nerve (C1 dorsal ramus): over the posterior arch of the atlas, above and medial to the vertebral artery, into the triangle.
    emit('Suboccipital nerve', side, {r: [.0006, .0004], pts: [
      [sx * .020, 1.5585, atlasZ(sx * .020, 1.556) + .003],
      [sx * .025, 1.5565, atlasZ(sx * .025, 1.554) - .001],
      [sx * .029, 1.5535, z(RCP, sx * .029, 1.553, 'hi', -.058, -.004)],
      [sx * .032, 1.5495, z(deepSuboccipital, sx * .032, 1.55, 'mid', -.062)]]});

    // Greater occipital nerve (C2 dorsal ramus, medial branch): out below obliquus capitis inferior, up and medially across it (deep to semispinalis),
    // through semispinalis, splenius and trapezius near the superior nuchal line, then in the scalp. Mostly under splenius and trapezius.
    const skull = y => (skullBack(sx * .026, y) ?? -.115);
    emit('Greater occipital nerve', side, {cover: [...SPL, ...TRAP], r: [.0007, .0005], pts: [
      [sx * .032, 1.5125, z(OCI, sx * .032, 1.52, 'lo', -.060, -.0012)],
      [sx * .033, 1.5300, z(deepSuboccipital, sx * .033, 1.53, 'lo', -.070, -.0012)],
      [sx * .031, 1.5500, z(SEMI, sx * .031, 1.55, 'hi', -.075, -.0012)],
      [sx * .029, 1.5680, z(SEMI, sx * .029, 1.568, 'mid', -.088)],
      [sx * .027, 1.5830, skull(1.583) - .0025],
      [sx * .025, 1.6050, skull(1.605) - .0050],
      [sx * .025, 1.6250, skull(1.625) - .0055]]});

    // Third occipital nerve (C3 dorsal ramus, medial branch): across the C2–C3 facet joint, medially under semispinalis, through splenius and trapezius near the midline.
    emit('Third occipital nerve', side, {cover: [...SPL, ...TRAP], r: [.0005, .0004], pts: [
      [sx * .026, 1.5000, z(['Axis', 'Third cervical vertebra'], sx * .026, 1.5, 'lo', -.045, -.001)],
      [sx * .018, 1.5100, z(SEMI, sx * .018, 1.512, 'hi', -.062, -.001)],
      [sx * .011, 1.5300, z(SEMI, sx * .011, 1.53, 'mid', -.082)],
      [sx * .007, 1.5550, z([...SEMI, ...SPL], sx * .007, 1.555, 'lo', -.100, .0005)],
      [sx * .005, 1.5800, skullBack(sx * .005, 1.58) === null ? -.112 : skullBack(sx * .005, 1.58) - .003]]});

    // Lesser occipital nerve (C2–C3 ventral rami): hooks round the posterior border of sternocleidomastoid at Erb point and climbs along it to the scalp behind the ear.
    const pa = posterior(1.470), pb = posterior(1.510), pc = posterior(1.550);
    emit('Lesser occipital nerve', side, {r: [.0006, .0004], pts: [[pa[0], pa[1], pa[2] - .0015], [pb[0], pb[1], pb[2] - .0015], [pc[0], pc[1], pc[2] - .0015], [sx * .066, 1.590, -.066], [sx * .068, 1.625, -.078]]});

    // Great auricular nerve (C2–C3 ventral rami): from Erb point obliquely across the outer surface of sternocleidomastoid toward the angle of the mandible, the parotid and the ear.
    const l1 = lateral(1.495), l2 = lateral(1.520), l3 = lateral(1.545);
    emit('Great auricular nerve', side, {r: [.0007, .0005], pts: [[pa[0], pa[1] + .008, pa[2] - .0015], [l1[0] + sx * .0015, l1[1], l1[2]], [l2[0] + sx * .0015, l2[1], l2[2] + .008], [l3[0] + sx * .0015, l3[1], l3[2] + .010], [sx * .078, 1.570, -.020]]});

    // Suboccipital venous plexus: a small network round the vertebral artery in the triangle, on the atlas arch and the deep muscles.
    const venous = [
      [[sx * .040, 1.5480, atlasZ(sx * .04, 1.548) + .004], [sx * .030, 1.5535, atlasZ(sx * .03, 1.553) + .003], [sx * .020, 1.5555, atlasZ(sx * .02, 1.555) + .004], [sx * .011, 1.5530, atlasZ(sx * .011, 1.553) + .004]],
      [[sx * .032, 1.5580, z(RCP, sx * .032, 1.558, 'hi', -.062, -.002)], [sx * .024, 1.5480, z(RCP, sx * .024, 1.548, 'hi', -.065, -.002)], [sx * .017, 1.5380, z(RCP, sx * .017, 1.538, 'hi', -.062, -.002)]],
      [[sx * .030, 1.5490, atlasZ(sx * .03, 1.549) + .004], [sx * .034, 1.5620, z(deepSuboccipital, sx * .034, 1.562, 'hi', -.066, -.002)], [sx * .036, 1.5750, z(deepSuboccipital, sx * .036, 1.575, 'lo', -.075, .001)]],
    ];
    venous.forEach((pts, i) => emit('Suboccipital venous plexus', side, {r: [.0004, .0003], pts, piece: i + 1}));
  }
  const merged = new Map();
  for (const item of result) {
    const t = tube(item.pts, item.r[0], item.r[1], 36, 6), key = `${item.base}.${item.side}`, prev = merged.get(key);
    if (!prev) { merged.set(key, {name: `${key}.001`, positions: t.positions, indices: t.indices, base: item.base, side: item.side, r: item.r, pts: [...item.pts]}); continue; }
    const offset = prev.positions.length / 3, positions = new Float32Array(prev.positions.length + t.positions.length), indices = new Uint32Array(prev.indices.length + t.indices.length);
    positions.set(prev.positions); positions.set(t.positions, prev.positions.length);
    indices.set(prev.indices); indices.set(t.indices.map(i => i + offset), prev.indices.length);
    prev.positions = positions; prev.indices = indices; prev.pts.push(...item.pts);
  }
  return [...merged.values()];
}

/** Fraction of a nerve's centreline lying deeper than the outer surface of the given muscles (covered by them). */
export function coverage(root, item, muscleNames) {
  const {vertices} = loadAtlasLandmarks(root);
  const verts = muscleNames.map(n => vertices(n));
  let covered = 0, total = 0;
  const dense = [];
  for (let k = 0; k < item.pts.length - 1; k++) for (let t = 0; t < 10; t++) dense.push(item.pts[k].map((v, a) => v + (item.pts[k + 1][a] - v) * t / 10));
  for (const p of dense) {
    total++;
    let outer = Infinity;
    for (const list of verts) for (const v of list) if (Math.abs(v[0] - p[0]) < .008 && Math.abs(v[1] - p[1]) < .004) outer = Math.min(outer, v[2]);
    if (outer !== Infinity && p[2] > outer + .0005) covered++;
  }
  return covered / total;
}

/** Distance from each vertebral artery to the posterior arch of the atlas (confirms the artery sits beside C1). */
export function vertebralArteryReport(root) {
  const {vertices} = loadAtlasLandmarks(root), atlasV = vertices('Atlas').filter(v => v[2] < -.040);
  return ['Left', 'Right'].map(w => {
    const va = vertices(`${w} vertebral artery`).filter(v => v[1] > 1.538 && v[1] < 1.562);
    let best = Infinity; for (const a of va) for (const b of atlasV) best = Math.min(best, dist(a, b));
    return {side: w, artery_vertices_at_C1: va.length, min_distance_mm: +(best * 1000).toFixed(1)};
  });
}
