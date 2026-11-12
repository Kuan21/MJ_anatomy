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
export function tube(points, r0, r1 = r0, samples = 28, sides = 12) {
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


/** Centreline of the V3 segment of a vertebral artery (from C1 transverse process, round the lateral mass, over the arch and up to the foramen magnum), from mesh slices. */
export function vertebralPath(va, sx) {
  const bins = new Map();
  for (const v of va) { if (v[1] < 1.543) continue; const k = Math.round(v[1] / .0024), b = bins.get(k) ?? {n: 0, x: 0, y: 0, z: 0}; b.n++; b.x += v[0]; b.y += v[1]; b.z += v[2]; bins.set(k, b); }
  return [...bins].sort((a, b) => a[0] - b[0]).map(([, b]) => [b.x / b.n, b.y / b.n, b.z / b.n]);
}

/** Alternating sideways offsets on the interior waypoints, so a nerve meanders slightly instead of running as a ruled line. */
export function meander(pts, amp, sx) { return pts.map((p, i) => i === 0 || i === pts.length - 1 ? p : [p[0] + sx * amp * (i % 2 ? 1 : -1), p[1], p[2]]); }

/** Small deterministic generator, so the plexus is the same on every build. */
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/** Venous web round a vertebral artery path: winding strands on the posterior half, cross links, and short ends into the triangle. Returns waypoint lists. */
export function plexus(path, sx, side, atlasZ) {
  const rand = rng(side === 'l' ? 11 : 29), out = [];
  const interp = t => { const f = t * (path.length - 1), i = Math.min(path.length - 2, Math.floor(f)), u = f - i; return path[i].map((v, a) => v + (path[i + 1][a] - v) * u); };
  const tangent = t => { const a = interp(Math.max(0, t - .04)), b = interp(Math.min(1, t + .04)); const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(...d) || 1; return d.map(v => v / l); };
  const around = (t, angle, radius) => {
    // frame perpendicular to the artery: "back" points posteriorly (-z), "side" along the rest
    const c = interp(t), tg = tangent(t), back = [0, 0, -1], dot = back[0] * tg[0] + back[1] * tg[1] + back[2] * tg[2];
    let u = [back[0] - dot * tg[0], back[1] - dot * tg[1], back[2] - dot * tg[2]]; const ul = Math.hypot(...u) || 1; u = u.map(v => v / ul);
    const w = [tg[1] * u[2] - tg[2] * u[1], tg[2] * u[0] - tg[0] * u[2], tg[0] * u[1] - tg[1] * u[0]];
    return [0, 1, 2].map(a => c[a] + (u[a] * Math.cos(angle) + w[a] * Math.sin(angle)) * radius);
  };
  const strands = [];
  for (let i = 0; i < 5; i++) {
    const phase = rand() * 6.28, turns = 1.1 + rand() * 1.1, a0 = (rand() - .5) * 2.6, r0 = .0030 + rand() * .0016, t0 = rand() * .12, t1 = .78 + rand() * .22, n = 15;
    const pts = [];
    for (let k = 0; k < n; k++) {
      const t = t0 + (t1 - t0) * k / (n - 1), angle = a0 + 1.0 * Math.sin(phase + turns * 6.28 * (t - t0)), radius = r0 + .0011 * Math.sin(phase * 1.7 + 9 * t);
      const p = around(t, angle, radius);
      // never inside the atlas: keep at least 1.5 mm above its upper surface where the arch is
      const az = atlasZ(p[0], p[1]); if (p[1] < 1.5595 && p[2] > az - .0008 && p[2] < az + .02) p[2] = az - .0008;
      pts.push(p);
    }
    strands.push(pts);
  }
  strands.forEach(p => out.push(p));
  // cross links between neighbouring strands, bowed outwards so they are not straight
  for (let i = 0; i < strands.length - 1; i++) for (const k of [2, 4, 6, 8, 10, 12]) {
    const a = strands[i][k], b = strands[i + 1][Math.min(strands[i + 1].length - 1, k + (i % 2 ? -1 : 1))], mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + .0012 * (rand() - .5), (a[2] + b[2]) / 2 - .0020 - .0012 * rand()];
    out.push([a, mid, b]);
  }
  // short ends running off into the muscles of the triangle (lateral and posterior-superior)
  for (const k of [4, 9]) { const a = strands[2][k], d = [sx * (.004 + rand() * .004), .004 + rand() * .004, -.004 - rand() * .005]; out.push([a, a.map((v, j) => v + d[j] * .45 + (rand() - .5) * .0012), a.map((v, j) => v + d[j])]); }
  return out;
}

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

    const yInferior = (names, x) => { let m = Infinity; for (const n of names) for (const v of verts(n)) if (Math.abs(v[0] - x) < .004) m = Math.min(m, v[1]); return m; };
    const skull = y => (skullBack(sx * .026, y) ?? -.115);
    // Waypoints are (x, y) plus the layer the nerve lies in; z is read from the atlas meshes so the tube follows the real surfaces.
    // Nothing may run through bone: behind a vertebra the nerve sits at least 1 mm outside its back surface.
    const boneBack = (x, y) => { const r = zRange(['Atlas', 'Axis', 'Third cervical vertebra'], x, y, .005, .003); return r ? r.lo - .0010 : Infinity; };
    const at = (x, y, names, pick, fallback, shift = 0) => [sx * x, y, Math.min(z(names, sx * x, y, pick, fallback, shift), boneBack(sx * x, y))];

    // Suboccipital nerve (C1 dorsal ramus): leaves the vertebral canal above the posterior arch of the atlas, passes between the vertebral artery
    // (above, in the groove) and the arch (below), turns back round the lateral edge of the arch into the suboccipital triangle and splits there
    // into twigs for rectus capitis posterior major and minor, obliquus capitis superior and inferior (and semispinalis).
    const triFloor = (x, y) => z([...RCP, ...OCS, ...OCI, 'Atlas'], sx * x, y, 'lo', -.056, .0012);
    emit('Suboccipital nerve', side, {r: [.0005, .0004], pts: [
      [sx * .0335, 1.5535, -.0295], [sx * .0318, 1.5560, -.0335], [sx * .0300, 1.5565, -.0385],
      [sx * .0302, 1.5555, -.0445], [sx * .0310, 1.5545, triFloor(.031, 1.5545)]]});
    const hub = [sx * .0310, 1.5545, triFloor(.031, 1.5545)];
    emit('Suboccipital nerve', side, {r: [.00035, .00028], piece: 2, pts: [hub, at(.0285, 1.5575, RCP, 'hi', -.062, -.0012), at(.0235, 1.5600, RCP, 'hi', -.064, -.0012), at(.0185, 1.5610, RCP, 'hi', -.066, -.0012)]});
    emit('Suboccipital nerve', side, {r: [.00035, .00028], piece: 3, pts: [hub, at(.0335, 1.5580, OCS, 'hi', -.066, -.0012), at(.0370, 1.5620, OCS, 'mid', -.060), at(.0395, 1.5655, OCS, 'mid', -.058)]});
    emit('Suboccipital nerve', side, {r: [.00035, .00028], piece: 4, pts: [hub, at(.0330, 1.5505, OCI, 'hi', -.058, -.0012), at(.0355, 1.5450, OCI, 'mid', -.052), at(.0385, 1.5410, OCI, 'mid', -.045)]});
    emit('Suboccipital nerve', side, {r: [.0003, .00025], piece: 5, pts: [hub, at(.0275, 1.5530, RCP, 'hi', -.062, -.0012), at(.0210, 1.5520, RCP, 'hi', -.066, -.0012), at(.0130, 1.5560, RCP, 'hi', -.070, -.0012)]});

    // Greater occipital nerve (C2 dorsal ramus, medial branch): emerges below the lower border of obliquus capitis inferior, winds round that border and climbs
    // obliquely over the muscle and the triangle (deep to semispinalis), pierces semispinalis capitis, then the trapezius aponeurosis about 2-3 cm lateral to the
    // external occipital protuberance, and runs up in the scalp. It leans medially in the neck and back out laterally towards the scalp: an S, not a line.
    const yo = yInferior(OCI, sx * .02);
    emit('Greater occipital nerve', side, {cover: [...SPL, ...TRAP], r: [.0006, .0004], pts: meander([
      at(.0225, yo - .0045, ['Axis'], 'lo', -.058, -.0013),
      at(.0205, yo - .0010, OCI, 'lo', -.060, -.0012),
      at(.0190, yo + .0050, OCI, 'lo', -.060, -.0012),
      at(.0178, yo + .0150, OCI, 'lo', -.060, -.0012),
      at(.0172, yo + .0245, [...OCI, ...RCP], 'lo', -.066, -.0012),
      at(.0180, yo + .0360, RCP, 'lo', -.072, -.0012),
      at(.0198, yo + .0480, SEMI, 'mid', -.078),
      at(.0225, yo + .0600, SEMI, 'mid', -.088),
      [sx * .0250, 1.5835, skull(1.5835) - .0030],
      [sx * .0262, 1.5950, skull(1.595) - .0045],
      [sx * .0270, 1.6100, skull(1.610) - .0055],
      [sx * .0268, 1.6270, skull(1.627) - .0055],
      [sx * .0255, 1.6450, skull(1.645) - .0055]], .0007, sx)});

    // Third occipital nerve (C3 dorsal ramus, medial branch): over the C2-C3 facet joint, medially under semispinalis, then up close to the midline,
    // medial to the greater occipital nerve, through trapezius to the scalp just below the external occipital protuberance.
    emit('Third occipital nerve', side, {cover: [...SPL, ...TRAP], r: [.0005, .0004], pts: meander([
      at(.0268, 1.5000, ['Axis', 'Third cervical vertebra'], 'lo', -.045, -.0010),
      at(.0225, 1.5085, SEMI, 'hi', -.058, -.0010),
      at(.0180, 1.5185, SEMI, 'hi', -.066, -.0010),
      at(.0140, 1.5300, SEMI, 'mid', -.080),
      at(.0118, 1.5430, SEMI, 'mid', -.086),
      at(.0108, 1.5560, [...SEMI, ...SPL], 'lo', -.096, .0005),
      at(.0105, 1.5690, [...SEMI, ...SPL], 'lo', -.104, .0008),
      [sx * .0100, 1.5810, (skullBack(sx * .010, 1.581) ?? -.112) - .0030],
      [sx * .0096, 1.5920, (skullBack(sx * .0096, 1.592) ?? -.116) - .0050]], .0006, sx)});

    // Lesser occipital nerve (C2-C3 ventral rami): hooks round the posterior border of sternocleidomastoid at Erb point and climbs along it to the scalp behind the ear.
    const ys = [1.462, 1.480, 1.498, 1.516, 1.534, 1.552, 1.570], ps = ys.map(y => posterior(y));
    emit('Lesser occipital nerve', side, {r: [.0005, .0004], pts: [
      [ps[0][0] - sx * .004, ps[0][1], ps[0][2] - .0035], ...ps.slice(1).map((p, i) => [p[0] + sx * .0008 * Math.sin(i * 1.7), p[1], p[2] - .0017]),
      [sx * .0655, 1.595, -.068], [sx * .0675, 1.615, -.077], [sx * .0690, 1.635, -.083]]});

    // Great auricular nerve (C2-C3 ventral rami): from Erb point obliquely across the outer surface of sternocleidomastoid toward the angle of the mandible, the parotid and the ear lobe.
    const lx = [1.480, 1.497, 1.514, 1.531, 1.548, 1.565].map(y => lateral(y));
    emit('Great auricular nerve', side, {r: [.0006, .0004], pts: [
      [ps[0][0] - sx * .002, ps[0][1] - .004, ps[0][2] - .0030],
      ...lx.map((l, i) => [l[0] + sx * .0018, l[1], l[2] + (i < 2 ? 0 : .003 + .0025 * (i - 1))]),
      [sx * .0795, 1.577, -.016]]});

    // Suboccipital venous plexus: a web of small veins wound round the V3 segment of the vertebral artery, draped over the posterior arch of the atlas
    // and into the floor of the triangle. Strands wind round the artery on its posterior half, join one another and end in the deep muscles.
    const vaPath = vertebralPath(vertices(`${word} vertebral artery`), sx);
    plexus(vaPath, sx, side, atlasZ).forEach((pts, i) => emit('Suboccipital venous plexus', side, {r: [.00032, .00026], pts, piece: i + 1}));
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

/** Number of sampled points of a tube centreline that lie inside the given closed bone meshes (ray parity along z). Zero means no nerve or vein passes through bone. */
export function pointsInsideBone(root, pts, boneNames) {
  const atlas = JSON.parse(fs.readFileSync(root + 'public/models/atlas.json', 'utf8')), buffers = new Map(), tris = [];
  for (const name of boneNames) {
    const p = atlas.parts.find(x => x.name.toLowerCase() === name.toLowerCase()); if (!p) throw Error('bone missing: ' + name);
    if (!buffers.has(p.chunk)) buffers.set(p.chunk, fs.readFileSync(root + 'public' + atlas.chunks[p.chunk].url));
    const b = buffers.get(p.chunk), pos = new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12)), idx = new Uint32Array(b.buffer.slice(b.byteOffset + p.indices, b.byteOffset + p.indices + p.indexCount * 4));
    for (let i = 0; i < idx.length; i += 3) tris.push([0, 1, 2].map(k => [pos[idx[i + k] * 3], pos[idx[i + k] * 3 + 1], pos[idx[i + k] * 3 + 2]]));
  }
  const dense = [];
  for (let k = 0; k < pts.length - 1; k++) for (let t = 0; t < 8; t++) dense.push(pts[k].map((v, a) => v + (pts[k + 1][a] - v) * t / 8));
  let inside = 0;
  for (const [x, y, z] of dense) {
    let hits = 0;
    for (const [a, b, c] of tris) {
      // ray from (x, y, z) towards +z; test against triangle projected on the xy plane
      const d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]); if (Math.abs(d) < 1e-14) continue;
      const l1 = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / d, l2 = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / d, l3 = 1 - l1 - l2;
      if (l1 < 0 || l2 < 0 || l3 < 0) continue;
      if (l1 * a[2] + l2 * b[2] + l3 * c[2] > z) hits++;
    }
    if (hits % 2 === 1) inside++;
  }
  return {inside, total: dense.length};
}
