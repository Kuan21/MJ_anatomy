// Atrioventricular valve apparatus of the heart detail model, rebuilt on the Z-Anatomy chambers ("示意構造"):
//   - the cusps hang from the real annulus (the boundary loop where the atrial and the ventricular shell meet), one sheet per cusp;
//   - the papillary muscles are conical muscular columns rising from the ventricular wall at the place the source muscles sit;
//   - the chordae tendineae are tapering, branching cords from the papillary tips to the free margin, the rough zone and the ventricular surface of the cusps
//     (and short basal cords from the wall).
// The source cusps (Z-Anatomy / BodyParts3D) are used only as references: where along the annulus each cusp lies (arc), and where each papillary muscle sits.
// Nothing here is placed by hand: annulus, arcs, papillary base and tip all come from the source meshes.
import {meshOf, closest, add, sub, mul, unit, len, dot, cross, merge, weldMesh, orient} from './heart-geom.mjs';
import {tube} from './nerve-schematics.mjs';

const seeded = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const P3 = (positions, i) => [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]];

/** Boundary loops of a welded mesh as ordered vertex lists. */
export function boundaryLoops({positions, indices}) {
  const nv = positions.length / 3, edges = new Map();
  for (let i = 0; i < indices.length; i += 3) for (let k = 0; k < 3; k++) {
    const a = indices[i + k], b = indices[i + (k + 1) % 3], key = a < b ? a * nv + b : b * nv + a, e = edges.get(key);
    if (e) e.n++; else edges.set(key, {a, b, n: 1});
  }
  const adj = new Map();
  for (const {a, b, n} of edges.values()) if (n === 1) { (adj.get(a) ?? adj.set(a, []).get(a)).push(b); (adj.get(b) ?? adj.set(b, []).get(b)).push(a); }
  const seen = new Set(), loops = [];
  for (const s of adj.keys()) {
    if (seen.has(s)) continue;
    const loop = [s]; seen.add(s); let prev = -1, cur = s;
    for (;;) { const next = adj.get(cur).find(w => w !== prev && !seen.has(w)); if (next === undefined) break; loop.push(next); seen.add(next); prev = cur; cur = next; }
    loops.push(loop.map(v => P3(positions, v)));
  }
  return loops;
}
const centroidOf = pts => [0, 1, 2].map(k => pts.reduce((s, p) => s + p[k], 0) / pts.length);

/** Annulus frame: ring points, centre, unit normal pointing into the ventricle, and an angle function around the ring. */
export function annulusFrame(ring, ventricleCentre) {
  const c = centroidOf(ring); let n = [0, 0, 0];
  for (let i = 0; i < ring.length; i++) { const w = cross(sub(ring[i], c), sub(ring[(i + 1) % ring.length], c)); n = add(n, w); }
  n = unit(n); if (dot(sub(ventricleCentre, c), n) < 0) n = mul(n, -1);
  const flat = p => { const q = sub(p, c); return sub(q, mul(n, dot(q, n))); };
  const e1 = unit(flat(ring[0])), e2 = cross(n, e1);
  const phi = p => { const q = sub(p, c); return Math.atan2(dot(q, e2), dot(q, e1)); };
  // ring sorted by angle, for interpolation at any angle
  const sorted = ring.map(p => ({p, a: phi(p)})).sort((x, y) => x.a - y.a);
  const at = a => {
    const T = Math.PI * 2; let x = a; while (x < sorted[0].a) x += T; while (x >= sorted[0].a + T) x -= T;
    let i = 0; while (i < sorted.length && sorted[i].a <= x) i++;
    const lo = sorted[(i - 1 + sorted.length) % sorted.length], hi = sorted[i % sorted.length];
    let la = lo.a, ha = hi.a; if (ha <= la) ha += T; if (x < la) x += T;
    const t = (x - la) / (ha - la || 1); return [0, 1, 2].map(k => lo.p[k] + (hi.p[k] - lo.p[k]) * t);
  };
  return {ring, c, n, e1, e2, phi, at, flat};
}

/** Arc (start, end angle, end > start) of each reference cusp along the annulus: every ring vertex belongs to the cusp whose base (rim) lies nearest. */
function arcsFromCusps(frame, cusps, rimDepth = .010) {
  const rims = cusps.map(m => { const out = []; for (let i = 0; i < m.positions.length; i += 3) { const p = P3(m.positions, i / 3); if (dot(sub(p, frame.c), frame.n) < rimDepth) out.push(p); } return out; });
  const sorted = frame.ring.map(p => ({p, a: frame.phi(p)})).sort((x, y) => x.a - y.a);
  const owner = sorted.map(({p}) => { let best = 0, bd = Infinity; rims.forEach((r, j) => { for (const q of r) { const d = len(sub(q, p)); if (d < bd) { bd = d; best = j; } } }); return best; });
  const T = Math.PI * 2, n = sorted.length, bounds = []; // angle between neighbours whose owners differ
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; if (owner[i] !== owner[j]) { let b = (sorted[i].a + sorted[j].a + (j === 0 ? T : 0)) / 2; bounds.push({b, from: owner[i], to: owner[j]}); } }
  // cusp k spans from the boundary that turns into k to the next boundary that leaves k
  return cusps.map((_, k) => {
    const start = bounds.find(x => x.to === k), end = bounds.find(x => x.from === k);
    if (!start || !end) throw new Error('valve arc not found for cusp ' + k);
    let s = start.b, e = end.b; while (e <= s) e += T; return {start: s, end: e};
  });
}

/**
 * One cusp: a thin curved sheet hanging from the annulus arc [start, end] to its free margin `depth(x)` below the ring (x = 0..1 along the arc), drawn inwards like the
 * open (diastolic) funnel of the valve. Returns the closed solid and the grid of surface points for the chordae.
 */
function cuspSheet(frame, arc, depth, {pull = .3, bulge = .0012, thick = .0005, nPhi = 56, nT = 16} = {}) {
  const grid = [], normals = [];
  const span = arc.end - arc.start;
  const at = (x, t) => {
    const q = frame.at(arc.start + x * span), radial = unit(frame.flat(q)), lam = pull * t ** 1.3;
    return add(add(add(q, mul(sub(frame.c, q), lam)), mul(frame.n, depth(x) * t)), mul(radial, bulge * Math.sin(Math.PI * t)));
  };
  for (let i = 0; i <= nPhi; i++) { grid.push([]); normals.push([]); for (let j = 0; j <= nT; j++) grid[i].push(at(i / nPhi, j / nT)); }
  for (let i = 0; i <= nPhi; i++) for (let j = 0; j <= nT; j++) {
    const a = grid[Math.max(0, i - 1)][j], b = grid[Math.min(nPhi, i + 1)][j], c = grid[i][Math.max(0, j - 1)], d = grid[i][Math.min(nT, j + 1)];
    let nrm = unit(cross(sub(b, a), sub(d, c)));
    const radial = unit(frame.flat(grid[i][j])); if (dot(nrm, radial) < 0) nrm = mul(nrm, -1);
    normals[i].push(nrm);
  }
  const pos = [], idx = [], id = (side, i, j) => side * (nPhi + 1) * (nT + 1) + i * (nT + 1) + j;
  for (const side of [1, -1]) for (let i = 0; i <= nPhi; i++) for (let j = 0; j <= nT; j++) pos.push(...add(grid[i][j], mul(normals[i][j], side * thick / 2)));
  for (const side of [0, 1]) for (let i = 0; i < nPhi; i++) for (let j = 0; j < nT; j++) {
    const a = id(side, i, j), b = id(side, i + 1, j), c = id(side, i, j + 1), d = id(side, i + 1, j + 1);
    if (side === 0) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d);
  }
  const edge = (pairs) => { for (const [[i0, j0], [i1, j1]] of pairs) { const a = id(0, i0, j0), b = id(0, i1, j1), c = id(1, i0, j0), d = id(1, i1, j1); idx.push(a, c, b, b, c, d); } };
  const rim = []; for (let i = 0; i < nPhi; i++) { rim.push([[i, nT], [i + 1, nT]], [[i, 0], [i + 1, 0]]); } edge(rim);
  const sides = []; for (let j = 0; j < nT; j++) { sides.push([[0, j], [0, j + 1]], [[nPhi, j], [nPhi, j + 1]]); } edge(sides);
  const solid = orient(weldMesh({positions: Float32Array.from(pos), indices: Uint32Array.from(idx)}));
  const surface = (x, t) => { const i = Math.round(x * nPhi), j = Math.round(t * nT); return add(grid[i][j], mul(normals[i][j], thick / 2 + .0001)); };
  return {solid, surface, nPhi, grid, normals};
}

/** Muscular column: a conical papillary muscle from `base` (on the wall) towards `tip`, round in section with soft longitudinal ridges and a rounded apex. */
function papillaryColumn(base, tip, intoWall, {rBase, rTip, ridge = .09, seed = 1, sides = 28, rings = 22} = {}) {
  const axis = unit(sub(tip, base)), L = len(sub(tip, base)), rnd = seeded(seed), phase = rnd() * 6.28;
  // a gentle S-bend so it does not read as a drawn cone
  const side0 = unit(cross(axis, Math.abs(axis[1]) < .9 ? [0, 1, 0] : [1, 0, 0])), side1 = cross(axis, side0), bend = (rnd() - .5) * .12 * L, bend2 = (rnd() - .5) * .08 * L;
  const centre = t => add(add(add(base, mul(axis, t * L)), mul(side0, Math.sin(t * Math.PI) * bend)), mul(side1, Math.sin(t * Math.PI * 2) * bend2));
  const positions = [], indices = [], lo = -.16; // start inside the wall; the buried end is rounded so it never shows as a flat disc
  const profile = t => t < 0 ? rBase * 1.15 : rBase + (rTip - rBase) * Math.min(1, t ** .85);
  const total = rings + 1;
  for (let k = 0; k <= rings; k++) {
    const t = lo + (1 - lo) * k / rings, cut = t > .88 ? Math.sqrt(Math.max(0, 1 - ((t - .88) / .12) ** 2)) : t < -.05 ? Math.sqrt(Math.max(0, 1 - ((-.05 - t) / .11) ** 2)) : 1;
    // the base flares into the wall (r grows 25 % over the first 12 % of the length)
    const flare = t < .12 ? 1 + .25 * (1 - Math.max(0, t) / .12) ** 2 : 1;
    const c = add(centre(Math.max(0, t)), t < 0 ? mul(intoWall, -t * L * 1.0) : [0, 0, 0]);
    const f0 = unit(cross(axis, Math.abs(axis[1]) < .9 ? [0, 1, 0] : [1, 0, 0])), f1 = cross(axis, f0);
    for (let j = 0; j < sides; j++) {
      const a = j / sides * Math.PI * 2, r = profile(t) * flare * cut * (1 + ridge * Math.cos(3 * a + phase) + ridge * .5 * Math.cos(5 * a + 2 * phase)) * (1 + .06 * Math.sin(t * 9 + phase));
      positions.push(...add(c, add(mul(f0, Math.cos(a) * r * 1.12), mul(f1, Math.sin(a) * r * .9))));
    }
  }
  for (let k = 0; k < rings; k++) for (let j = 0; j < sides; j++) {
    const a = k * sides + j, b = k * sides + (j + 1) % sides, c = (k + 1) * sides + j, d = (k + 1) * sides + (j + 1) % sides;
    indices.push(a, c, b, b, c, d);
  }
  const cap = (k, flip) => { const centreIdx = positions.length / 3, p = [0, 1, 2].map(a => { let s = 0; for (let j = 0; j < sides; j++) s += positions[(k * sides + j) * 3 + a]; return s / sides; }); positions.push(...p); for (let j = 0; j < sides; j++) { const a = k * sides + j, b = k * sides + (j + 1) % sides; indices.push(...(flip ? [centreIdx, a, b] : [centreIdx, b, a])); } };
  cap(0, false); cap(rings, true); void total;
  return orient(weldMesh({positions: Float32Array.from(positions), indices: Uint32Array.from(indices)}));
}

/** Base (where the muscle meets the wall) and tip of a source papillary muscle: wall-touching vertices give the base, the vertex farthest from it the tip (length capped). */
function columnEnds(pm, wall, cap) {
  const near = [];
  for (let i = 0; i < pm.positions.length; i += 3) { const p = P3(pm.positions, i / 3), h = closest(wall, p); if (h.d < .0025) near.push(p); }
  const base = near.length ? centroidOf(near) : pm.centre;
  let tip = base, far = 0;
  for (let i = 0; i < pm.positions.length; i += 3) { const p = P3(pm.positions, i / 3), d = len(sub(p, base)); if (d > far) { far = d; tip = p; } }
  const dir = unit(sub(tip, base)), L = Math.min(far, cap);
  return {base, tip: add(base, mul(dir, L)), length: L};
}

/** A cord through a few points, tapering from r0 to r1; points get a small random slack so cords are not ruler-straight. */
function cord(points, r0, r1, rnd, slack = .05) {
  const a = points[0], b = points[points.length - 1], d = len(sub(b, a)) || 1e-6, ax = unit(sub(b, a));
  const s0 = unit(cross(ax, Math.abs(ax[1]) < .9 ? [0, 1, 0] : [1, 0, 0])), s1 = cross(ax, s0);
  const mid = points.length > 2 ? points.slice(1, -1) : [lerp3(a, b, .5)];
  const bent = mid.map((p, i) => add(p, add(mul(s0, (rnd() - .5) * 2 * slack * d), mul(s1, (rnd() - .5) * 2 * slack * d * .6 * (i + 1)))));
  return tube([a, ...bent, b], r0, r1, 18, 8);
}
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/**
 * Chordae tendineae of one valve. Each papillary tip sends cords to the cusps nearest to it: stems from the tip split once into 2-3 branches that end on the free
 * margin, a few more end on the rough zone (ventricular surface, a third of the way up), and every posterior/septal cusp also gets short basal cords from the wall.
 */
function chordae({tips, cusps, wall, seed, perGroup = 3}) {
  const rnd = seeded(seed), list = [];
  const points = [];
  for (const cusp of cusps) {
    for (let k = 0; k <= cusp.marginCount; k++) points.push({cusp: cusp.name, x: k / cusp.marginCount, t: 1, p: cusp.surface(k / cusp.marginCount, 1), zone: 'margin', phi: cusp.angleAt(k / cusp.marginCount)});
    for (let k = 0; k < cusp.roughCount; k++) { const x = (k + .5) / cusp.roughCount; points.push({cusp: cusp.name, x, t: .72, p: cusp.surface(x, .72), zone: 'rough', phi: cusp.angleAt(x)}); }
  }
  // each end point goes to the allowed papillary muscle whose tip is nearest
  const allowed = new Map(cusps.map(c => [c.name, c.muscles]));
  const owned = new Map(tips.map(t => [t.name, []]));
  for (const pt of points) {
    let best = null, bd = Infinity;
    for (const m of allowed.get(pt.cusp)) { const tip = tips.find(t => t.name === m); const d = len(sub(pt.p, tip.p)); if (d < bd) { bd = d; best = tip; } }
    owned.get(best.name).push(pt);
  }
  for (const tip of tips) {
    const mine = owned.get(tip.name).sort((a, b) => a.phi - b.phi), margin = mine.filter(p => p.zone === 'margin'), rough = mine.filter(p => p.zone === 'rough');
    const groups = []; for (let i = 0; i < margin.length; i += perGroup) groups.push(margin.slice(i, i + perGroup));
    const nodes = [];
    groups.forEach((g, gi) => {
      const G = centroidOf(g.map(q => q.p)), reach = len(sub(G, tip.p)), dir = unit(sub(G, tip.p));
      const node = add(add(tip.p, mul(dir, reach * (.5 + rnd() * .2))), mul(unit(cross(dir, [0, 1, 0])), (rnd() - .5) * .002));
      list.push(cord([tip.p, node], .0009 + rnd() * .00015, .0006, rnd, .03)); nodes.push(node);
      for (const q of g) {
        list.push(cord([node, q.p], .00052 + rnd() * .0001, .00030, rnd, .06));
        // about a third of the margin cords fork near the cusp (a Y: two fine cords on neighbouring points)
        if (rnd() < .35) { const side = unit(cross(unit(sub(q.p, node)), [0, 1, 0])), p2 = add(q.p, mul(side, (rnd() < .5 ? -1 : 1) * .0016)), fork = lerp3(node, q.p, .72); list.push(cord([fork, p2], .0003, .0002, rnd, .05)); }
      }
      // a rough-zone cord from the same branch point to the nearest rough-zone point
      const near = rough.slice().sort((a, b) => len(sub(a.p, G)) - len(sub(b.p, G)))[0];
      if (near && gi % 1 === 0) { list.push(cord([node, near.p], .00042, .00026, rnd, .06)); rough.splice(rough.indexOf(near), 1); }
    });
    // rough-zone points left over hang from the nearest branch point (or straight from the tip when the muscle has no branch)
    for (const q of rough) { const from = nodes.length ? nodes.slice().sort((a, b) => len(sub(a, q.p)) - len(sub(b, q.p)))[0] : tip.p; list.push(cord([from, q.p], .00036, .00022, rnd, .06)); }
  }
  // basal cords: from the wall straight below the cusp base to the ventricular surface of the cusp (posterior and septal cusps only)
  for (const cusp of cusps) {
    if (!cusp.basal) continue;
    for (let k = 0; k < cusp.basal; k++) {
      const x = (k + .5) / cusp.basal, e = cusp.surface(x, .42), out = unit(sub(e, add(cusp.centre, mul(cusp.axis, dot(sub(e, cusp.centre), cusp.axis))))), h = closest(wall, add(e, mul(out, .008)));
      if (h && h.d < .014) list.push(cord([h.point, lerp3(h.point, e, .5), e], .00046, .00028, rnd, .05));
    }
  }
  return merge(list);
}

/**
 * Builds the apparatus of both atrioventricular valves. `mesh(name)` returns a welded source mesh {positions, indices} (Z-Anatomy frame) for a chamber or reference piece.
 * Returns an object {name: {positions, indices}} with the cusps, the papillary muscles and the chordae of each valve.
 */
export function buildValveApparatus(mesh) {
  const out = {};
  const M = name => meshOf(mesh(name).positions, mesh(name).indices);
  const specs = [
    {side: 'left', chamber: 'Left ventricle', atrium: 'Left atrium', ringHint: null, valve: 'bicuspid',
      cusps: [{name: 'Anterior cusp of bicuspid valve', ref: 'Anterior leaflet of mitral valve', D0: .022, Dc: .010, scallops: 0, basal: 0, muscles: ['Anterolateral papillary muscle of left ventricle', 'Posteromedial papillary muscle of left ventricle'], margin: 7, rough: 4},
              {name: 'Posterior cusp of bicuspid valve', ref: 'Posterior leaflet of mitral valve', D0: .014, Dc: .010, scallops: 3, basal: 4, muscles: ['Anterolateral papillary muscle of left ventricle', 'Posteromedial papillary muscle of left ventricle'], margin: 9, rough: 5}],
      muscles: [{name: 'Anterolateral papillary muscle of left ventricle', ref: 'Anterolateral papillary muscle of left ventricle', cap: .028, rBase: .0052, rTip: .0026, seed: 3},
                {name: 'Posteromedial papillary muscle of left ventricle', ref: 'Inferior papillary muscle of left ventricle', cap: .030, rBase: .0052, rTip: .0026, seed: 4}],
      chordae: 'Chordae tendineae of bicuspid valve', seed: 11},
    {side: 'right', chamber: 'Right ventricle', atrium: 'Right atrium', valve: 'tricuspid',
      cusps: [{name: 'Anterior cusp of tricuspid valve', ref: 'Anterior leaflet of tricuspid valve', D0: .021, Dc: .010, scallops: 0, basal: 0, muscles: ['Anterior papillary muscle of right ventricle', 'Septal papillary muscle of right ventricle'], margin: 7, rough: 4},
              {name: 'Posterior cusp of tricuspid valve', ref: 'Inferior leaflet of tricuspid valve', D0: .014, Dc: .010, scallops: 2, basal: 3, muscles: ['Anterior papillary muscle of right ventricle', 'Posterior papillary muscle of right ventricle'], margin: 6, rough: 3},
              {name: 'Septal cusp of tricuspid valve', ref: 'Septal leaflet of tricuspid valve', D0: .015, Dc: .010, scallops: 0, basal: 3, muscles: ['Posterior papillary muscle of right ventricle', 'Septal papillary muscle of right ventricle'], margin: 6, rough: 3}],
      muscles: [{name: 'Anterior papillary muscle of right ventricle', ref: 'Anterior papillary muscle of right ventricle', cap: .024, rBase: .0048, rTip: .0024, seed: 5},
                {name: 'Posterior papillary muscle of right ventricle', ref: 'Inferior papillary muscle of right ventricle', cap: .018, rBase: .0036, rTip: .0019, seed: 6},
                {name: 'Septal papillary muscle of right ventricle', ref: 'Septal papillary muscle of right ventricle', cap: .016, rBase: .0026, rTip: .0015, seed: 7}],
      chordae: 'Chordae tendineae of tricuspid valve', seed: 12},
  ];
  const report = [];
  for (const spec of specs) {
    const wall = M(spec.chamber), refs = spec.cusps.map(c => mesh(c.ref));
    // annulus: the boundary loop of the ventricular shell that the atrial shell shares (equal loop in both), nearest to the centroid of the source cusps' rims
    const atrium = mesh(spec.atrium), ventricle = mesh(spec.chamber);
    const aLoops = boundaryLoops(atrium).map(centroidOf), vLoops = boundaryLoops(ventricle);
    let ring = null, bd = Infinity;
    for (const loop of vLoops) { const c = centroidOf(loop); for (const a of aLoops) { const d = len(sub(c, a)); if (d < bd && loop.length > 30 && loop.length < 120) { bd = d; ring = loop; } } }
    if (!ring || bd > .004) throw new Error(`annulus of the ${spec.valve} valve not found (${bd})`);
    const frame = annulusFrame(ring, wall.centre);
    const arcs = arcsFromCusps(frame, refs.map(r => ({positions: r.positions})));
    const tips = [], muscleGeom = [];
    for (const m of spec.muscles) {
      const ends = columnEnds(M(m.ref), wall, m.cap), into = unit(sub(wall.centre, ends.base));
      // the column leaves the wall and heads for the valve: the tip is pulled a little towards the annulus so it ends below the cusps, not beside the wall
      const toward = unit(sub(frame.c, ends.base)), tipPoint = add(ends.base, mul(unit(add(mul(unit(sub(ends.tip, ends.base)), .8), mul(toward, .2))), ends.length));
      const wallOut = mul(into, -1);
      out[m.name] = papillaryColumn(ends.base, tipPoint, wallOut, {rBase: m.rBase, rTip: m.rTip, seed: m.seed});
      tips.push({name: m.name, p: add(tipPoint, mul(unit(sub(tipPoint, ends.base)), -.0008))});
      report.push({kind: 'papillary', name: m.name, length: ends.length, base: ends.base, tip: tipPoint});
    }
    const cusps = spec.cusps.map((c, k) => {
      const arc = arcs[k], depth = x => {
        const env = Math.sin(Math.PI * x) ** .7, scal = c.scallops ? .78 - .22 * Math.cos(c.scallops * 2 * Math.PI * x) : 1;
        return c.Dc + (c.D0 - c.Dc) * env * scal;
      };
      const sheet = cuspSheet(frame, arc, depth);
      out[c.name] = sheet.solid;
      report.push({kind: 'cusp', name: c.name, arc: [arc.start, arc.end].map(a => Math.round(a * 180 / Math.PI)), depth: c.D0});
      return {name: c.name, surface: sheet.surface, muscles: c.muscles, marginCount: c.margin, roughCount: c.rough, basal: c.basal, centre: frame.c, axis: frame.n, angleAt: x => arc.start + x * (arc.end - arc.start)};
    });
    out[spec.chordae] = chordae({tips, cusps, wall, seed: spec.seed});
    report.push({kind: 'annulus', valve: spec.valve, centre: frame.c, normal: frame.n, ringPoints: ring.length});
  }
  out.__report = report;
  return out;
}

/**
 * In-plane shift that centres a group of semilunar cusps on the aortic orifice: the boundary loop of `chamber` nearest to `near`; the shift is the in-plane offset between
 * the centroid of all cusp vertices and the ring centre (the offset along the ring normal is kept, the cusps already span the plane).
 */
export function semilunarShift(chamberMesh, near, cuspMeshes) {
  let ring = null, bd = Infinity;
  for (const loop of boundaryLoops(chamberMesh)) { const c = centroidOf(loop), d = len(sub(c, near)); if (d < bd && loop.length > 30 && loop.length < 120) { bd = d; ring = loop; } }
  if (!ring || bd > .01) throw new Error('semilunar ring not found');
  const pts = []; for (const m of cuspMeshes) for (let i = 0; i < m.positions.length / 3; i++) pts.push(P3(m.positions, i));
  const frame = annulusFrame(ring, centroidOf(pts)), cc = centroidOf(pts), off = sub(cc, frame.c);
  return mul(sub(off, mul(frame.n, dot(off, frame.n))), -1);
}
