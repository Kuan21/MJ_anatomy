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

/** Build every schematic tube, left (+x) and right (-x). */
export function buildSchematics(root) {
  const {vertices} = loadAtlasLandmarks(root);
  const result = [];
  const emit = (key, side, spec) => result.push({base: key, side, ...spec});
  const occ = vertices('Occipital bone');
  /** posterior-most z of the occipital bone around (x, y): where a scalp nerve lies on the skull. */
  const skullBack = (x, y) => {
    const near = occ.filter(v => Math.abs(v[1] - y) < .004 && Math.abs(v[0] - x) < .008);
    return near.length ? Math.min(...near.map(v => v[2])) : null;
  };
  for (const side of ['l', 'r']) {
    const sx = side === 'l' ? 1 : -1, word = side === 'l' ? 'Left' : 'Right';
    const sc = vertices(`${word} sternocleidomastoid`);
    /** SCM slice: the posterior border (most posterior vertex) and the outermost lateral vertex at height y. */
    const slice = y => sc.filter(v => Math.abs(v[1] - y) < .0025);
    const posterior = y => { const s = slice(y); return s.reduce((m, v) => v[2] < m[2] ? v : m, s[0]); };
    const lateral = y => { const s = slice(y); return s.reduce((m, v) => Math.abs(v[0]) > Math.abs(m[0]) ? v : m, s[0]); };

    emit('Suboccipital nerve', side, {r: [.0012, .0009], pts: [[sx * .016, 1.5515, -.040], [sx * .021, 1.5525, -.054], [sx * .027, 1.5505, -.062], [sx * .031, 1.548, -.067]]});

    const gz = y => (skullBack(sx * .030, y) ?? -.115) - .004;
    emit('Greater occipital nerve', side, {r: [.0016, .0011], pts: [[sx * .030, 1.512, -.058], [sx * .035, 1.528, -.074], [sx * .034, 1.556, -.093], [sx * .032, 1.584, gz(1.584)], [sx * .031, 1.610, gz(1.610)], [sx * .030, 1.640, gz(1.640)]]});
    emit('Third occipital nerve', side, {r: [.0011, .0008], pts: [[sx * .026, 1.499, -.050], [sx * .017, 1.506, -.068], [sx * .009, 1.532, -.090], [sx * .006, 1.560, -.106], [sx * .005, 1.585, (skullBack(sx * .005, 1.585) ?? -.116) - .004]]});

    const pa = posterior(1.470), pb = posterior(1.510), pc = posterior(1.550);
    emit('Lesser occipital nerve', side, {r: [.0014, .0009], pts: [[pa[0], pa[1], pa[2] - .003], [pb[0], pb[1], pb[2] - .003], [pc[0], pc[1], pc[2] - .003], [sx * .066, 1.590, -.066], [sx * .068, 1.625, -.078]]});

    const l1 = lateral(1.495), l2 = lateral(1.520), l3 = lateral(1.545);
    emit('Great auricular nerve', side, {r: [.0016, .0010], pts: [[pa[0], pa[1] + .008, pa[2] - .003], [l1[0] + sx * .003, l1[1], l1[2]], [l2[0] + sx * .003, l2[1], l2[2] + .008], [l3[0] + sx * .003, l3[1], l3[2] + .010], [sx * .078, 1.570, -.020]]});

    const venous = [
      [[sx * .040, 1.548, -.050], [sx * .030, 1.553, -.060], [sx * .020, 1.555, -.062], [sx * .011, 1.553, -.060]],
      [[sx * .032, 1.558, -.068], [sx * .024, 1.548, -.071], [sx * .017, 1.538, -.068]],
      [[sx * .030, 1.549, -.060], [sx * .034, 1.562, -.072], [sx * .036, 1.575, -.084]],
    ];
    venous.forEach((pts, i) => emit('Suboccipital venous plexus', side, {r: [.0009, .0007], pts, piece: i + 1}));
  }
  // One selectable mesh per structure and side: the plexus is several tubes merged into a single geometry.
  const merged = new Map();
  for (const item of result) {
    const t = tube(item.pts, item.r[0], item.r[1]), key = `${item.base}.${item.side}`, prev = merged.get(key);
    if (!prev) { merged.set(key, {name: `${key}.001`, positions: t.positions, indices: t.indices, base: item.base, side: item.side}); continue; }
    const offset = prev.positions.length / 3, positions = new Float32Array(prev.positions.length + t.positions.length), indices = new Uint32Array(prev.indices.length + t.indices.length);
    positions.set(prev.positions); positions.set(t.positions, prev.positions.length);
    indices.set(prev.indices); indices.set(t.indices.map(i => i + offset), prev.indices.length);
    prev.positions = positions; prev.indices = indices;
  }
  return [...merged.values()];
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
