// Builds the lower-limb arteries of a vessel-tree file (app/data/vessel-tree/*.json) as new tubes on the rest pose, next to (not instead of) the vessels the site draws.
// Each vessel follows the course of the mesh the site draws for it today (the guide: atlas or schematic mesh, taken as a centreline), which is kept where it is right and corrected where it is not:
//   - the start is moved onto the parent's centreline, so a child always begins on its parent (no gap, no floating piece);
//   - the centreline is pushed out of every bone it enters (wall clearance 0.8 mm) and smoothed;
//   - the radius runs linearly from the start to the end diameter of the tree file; only a vessel marked `terminal` ends thin.
// A few vessels have no usable guide (perforating, deep circumflex iliac, obturator): their courses are written here from landmarks measured on the bone and muscle meshes.
import fs from 'node:fs';
import {loadWorld} from './paokao-world.mjs';
import {makeUtil, sub, add, mul, unit, len, lerp} from './paokao-util.mjs';
import {centrelineOf, resample, atHeight, clearBones} from './leg-centreline.mjs';
import {meshOf} from './heart-geom.mjs';
import {tube} from './nerve-schematics.mjs';

const root = new URL('../../', import.meta.url);
export const SIDES = [{w: 'Left', s: 'left', sx: 1}, {w: 'Right', s: 'right', sx: -1}];
const STEP = .003;
const ang = (a, b) => Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / ((len(a) * len(b)) || 1)))) * 180 / Math.PI;
/** Guide meshes end in a cap whose centre can sit off the axis: drop end points that turn back (a hook), then smooth lightly with both ends fixed. */
function tidy(line) {
  const L = line.slice();
  for (let k = 0; k < 6 && L.length > 6; k++) {
    const n = L.length;
    if (ang(sub(L[n - 1], L[n - 2]), sub(L[n - 2], L[n - 3])) > 45) L.pop(); else if (ang(sub(L[0], L[1]), sub(L[1], L[2])) > 45) L.shift(); else break;
  }
  for (let pass = 0; pass < 4; pass++) { const Q = L.map(p => p.slice()); for (let i = 1; i < L.length - 1; i++) for (let a = 0; a < 3; a++) Q[i][a] = L[i][a] * .5 + (L[i - 1][a] + L[i + 1][a]) * .25; L.splice(0, L.length, ...Q); }
  return L;
}

/** All vessel-tree files (one per batch, in the order of their `batch` number) as one tree. */
export function loadTree(files) {
  const dir = new URL('app/data/vessel-tree/', root), names = files ?? fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  const parts = names.map(f => JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8'))).sort((a, b) => a.batch - b.batch);
  return {batches: parts.map(t => t.batch), vessels: parts.flatMap(t => t.vessels.map(v => ({...v, batch: t.batch})))};
}

/** Parents before children. */
function ordered(vessels) {
  const done = new Set(), out = [];
  const visit = v => { if (done.has(v.id)) return; if (v.parent) visit(vessels.find(x => x.id === v.parent)); if (v.joinsTo) visit(vessels.find(x => x.id === v.joinsTo)); done.add(v.id); out.push(v); };
  vessels.forEach(visit); return out;
}

const bonesFor = (w, S) => ['hip bone', 'femur', 'tibia', 'fibula', 'patella'].map(n => `${S.w} ${n}`).concat(['Sacrum', 'Fifth lumbar vertebra', 'Fourth lumbar vertebra']).filter(n => w.has(n)).map(n => { const m = w.mesh(n); return {name: n, positions: m.positions, indices: m.indices, lo: m.lo, hi: m.hi, mesh: m}; });

function guideOf(w, U, v, S) {
  const name = v.guide.replace('{S}', S.w).replace('{s}', S.s);
  const list = w.find(name).filter(e => !/-END$|^PKC-/.test(e.id)); if (!list.length) throw new Error(`no guide mesh "${name}"`);
  const e = list.reduce((a, b) => b.load().positions.length > a.load().positions.length ? b : a);
  const g = e.load(); return centrelineOf({positions: g.positions, indices: g.indices});
}

/** Own courses (landmarks) for the vessels that have no guide mesh. */
function ownCourse(w, U, v, S, built) {
  const sx = S.sx, P = (x, y, z) => [x, y, z], parentPath = built.get(v.parent)?.path;
  const near = (path, p) => path.reduce((a, q) => len(sub(q, p)) < len(sub(a, p)) ? q : a, path[0]);
  const femur = `${S.w} femur`, hip = `${S.w} hip bone`;
  const r = v.calibreMm[0] / 2000;
  if (/^perforating-artery-[123]$/.test(v.id)) {
    const k = +/(\d)$/.exec(v.id)[1], y = [.79, .735, .68][k - 1], o = atHeight(parentPath, y);
    const t = U.onSurface(femur, P(sx * .085, y - .012, -.045), .012);
    return [o, lerp(o, t, .5), t];
  }
  if (v.id === 'perforating-artery-4') {
    const o = parentPath[parentPath.length - 1], t = U.onSurface(femur, P(sx * .075, o[1] - .02, -.04), .012);
    return [o, lerp(o, t, .5), t];
  }
  const along = (id, f) => { const q = built.get(id)?.path; if (!q) throw new Error(`${v.id}: ${id} is not built`); return q[Math.min(q.length - 1, Math.round((q.length - 1) * f))]; };
  const patella = `${S.w} patella`, onPat = (dir, off) => add(U.extreme(patella, dir), off);
  if (v.id === 'genicular-anastomosis-superior') return [along('medial-superior-genicular-artery', .85), onPat(P(0, 1, 0), P(0, .008, .008)), along('lateral-superior-genicular-artery', .85)];
  if (v.id === 'genicular-anastomosis-inferior') return [along('medial-inferior-genicular-artery', .85), onPat(P(0, -1, 0), P(0, -.012, .006)), along('lateral-inferior-genicular-artery', .85)];
  if (v.id === 'genicular-anastomosis-medial') { const a = along('medial-superior-genicular-artery', .85), b = along('medial-inferior-genicular-artery', .85); return [a, add(lerp(a, b, .5), P(0, 0, .004)), b]; }
  if (v.id === 'genicular-anastomosis-lateral') { const a = along('lateral-superior-genicular-artery', .85), b = along('lateral-inferior-genicular-artery', .85); return [a, add(lerp(a, b, .5), P(0, 0, .004)), b]; }
  if (v.id === 'anterior-tibial-recurrent-artery') {
    // leaves the anterior tibial artery just below the popliteus, climbs through tibialis anterior to the front of the lateral tibial condyle
    const ata = w.find(`${S.w} anterior tibial artery`).filter(e => !/-END$|^PKC-/.test(e.id)).reduce((a, b) => b.load().positions.length > a.load().positions.length ? b : a), g = ata.load();
    const line = centrelineOf({positions: g.positions, indices: g.indices}).map(q => q.c), o = line.reduce((a, q) => Math.abs(q[1] - .372) < Math.abs(a[1] - .372) ? q : a, line[0]);
    const t = U.onSurface(`${S.w} tibia`, P(sx * .042, .425, .030), r + .004);
    return [o, add(lerp(o, t, .5), P(sx * .004, 0, .004)), t];
  }
  if (v.id === 'medial-circumflex-femoral-artery') {
    // behind and below the femoral neck, between pectineus/iliopsoas and the capsule, to the trochanteric fossa (kept clear of the joint gap)
    const o = parentPath[Math.min(parentPath.length - 1, 3)], a = U.onSurface(femur, P(sx * .058, .868, -.012), r + .004), b = U.onSurface(femur, P(sx * .078, .860, -.040), r + .004), c = U.onSurface(femur, P(sx * .100, .864, -.044), r + .004);
    return [o, a, b, c];
  }
  if (v.id === 'ascending-branch-of-lateral-circumflex-femoral-artery') {
    const o = parentPath[Math.min(parentPath.length - 1, 4)], asis = U.extreme(hip, P(0, 0, 1), {y: [.95, 1.05]}), t = add(asis, P(sx * .008, -.014, -.016));
    return [o, add(lerp(o, t, .5), P(sx * .006, 0, -.004)), t];
  }
  if (v.id === 'transverse-branch-of-lateral-circumflex-femoral-artery') {
    const o = parentPath[Math.min(parentPath.length - 1, 4)], t = U.onSurface(`${S.w} vastus lateralis`, P(sx * .125, .835, 0), -.003);
    return [o, add(lerp(o, t, .5), P(0, -.004, -.004)), t];
  }
  if (v.id === 'deep-circumflex-iliac-artery') {
    const o = atHeight(parentPath, .975), asis = U.extreme(hip, P(0, 0, 1), {y: [.95, 1.05]});
    const a = add(asis, P(-sx * .014, .004, -.012)), b = add(asis, P(sx * .012, .016, -.034)), c = add(asis, P(sx * .036, .026, -.062));
    return [o, lerp(o, a, .5), a, b, c];
  }
  if (v.id === 'obturator-artery') {
    const vein = w.find(`${S.w} obturator vein`).filter(e => !/-END$/.test(e.id)).reduce((a, b) => b.load().positions.length > a.load().positions.length ? b : a);
    const g = vein.load(), line = centrelineOf({positions: g.positions, indices: g.indices}).map(q => add(q.c, P(0, .004, 0)));
    const start = parentPath[parentPath.length - 1];
    if (len(sub(line[0], start)) > len(sub(line[line.length - 1], start))) line.reverse();
    return line;
  }
  throw new Error('no own course for ' + v.id);
}

export function buildTree(tree = loadTree(), {world, quiet = true, only = null, sides = SIDES} = {}) {
  const w = world ?? loadWorld({paokao: true}), U = makeUtil(w), out = [];
  // nerves of the pelvis and leg: vessels keep clear of them
  const nerveMeshes = [];
  for (const e of w.entries) if (e.system === 'nervous') { const g = e.load(); let lo = 9, hi = -9; for (let i = 1; i < g.positions.length; i += 3) { lo = Math.min(lo, g.positions[i]); hi = Math.max(hi, g.positions[i]); } if (hi < 1.1 && lo > -.01 && g.indices.length) nerveMeshes.push({e, g}); }
  const nerveOf = n => n.m ??= meshOf(n.g.positions, n.g.indices);
  const byId = new Map(tree.vessels.map(v => [v.id, v]));
  const want = only && new Set(only.flatMap(id => { const o = [id]; let v = byId.get(id); while (v?.parent) { o.push(v.parent); v = byId.get(v.parent); } return o; }));
  for (const S of sides) {
    const bones = bonesFor(w, S), built = new Map();
    for (const v of ordered(tree.vessels)) {
      if (want && !want.has(v.id)) continue;
      const parent = v.parent ? built.get(v.parent) : null, joined = v.joinsTo ? built.get(v.joinsTo) : null;
      let line, radii0;
      if (v.guide) {
        const rings = guideOf(w, U, v, S); line = rings.map(q => q.c);
        // direction: trunks run top to bottom; a branch starts at the end nearest its parent
        if (parent) { const s = parent.path[parent.path.length - 1], first = len(sub(line[0], s)), last = len(sub(line[line.length - 1], s)); const nearest = parent.path.reduce((a, q) => Math.min(a, len(sub(q, line[0]))), 9), nearestL = parent.path.reduce((a, q) => Math.min(a, len(sub(q, line[line.length - 1]))), 9); if (nearestL < nearest) line.reverse(); }
        line = tidy(resample(line, STEP));
      } else { line = resample(ownCourse(w, U, v, S, built), STEP); }
      // trims
      if (v.id === 'external-iliac-artery') line = line.filter(p => p[1] >= .895);
      if (v.id === 'femoral-artery') line = line.filter(p => p[1] <= .895);
      if (v.keep) { const a = Math.floor(line.length * v.keep[0]), b = Math.ceil(line.length * v.keep[1]); line = line.slice(a, b); }
      // start on the parent's centreline
      if (parent) {
        const atEnd = v.joinAt === 'end';
        const q = atEnd ? parent.path[parent.path.length - 1] : parent.path.reduce((a, p) => len(sub(p, line[0])) < len(sub(a, line[0])) ? p : a, parent.path[0]);
        const off = sub(q, line[0]); let run = 0;
        line = line.map((p, i) => { if (i) run += len(sub(p, line[i - 1])); const wgt = Math.max(0, Math.cos(Math.min(1, run / .015) * Math.PI / 2)); return add(p, mul(off, wgt)); });
        line = [q, ...line.slice(1)];
      }
      // an anastomosis ends on a second vessel
      if (joined) {
        const e = line[line.length - 1], q = joined.path.reduce((a, p) => len(sub(p, e)) < len(sub(a, e)) ? p : a, joined.path[0]), off = sub(q, e); let run = 0;
        for (let i = line.length - 1; i >= 0; i--) { if (i < line.length - 1) run += len(sub(line[i], line[i + 1])); line[i] = add(line[i], mul(off, Math.max(0, Math.cos(Math.min(1, run / .015) * Math.PI / 2)))); }
        line[line.length - 1] = q;
      }
      // a vessel whose parent is built in a later batch starts at its lower end
      if (v.parentPending && line[0][1] > line[line.length - 1][1]) line.reverse();
      // radii: linear start -> end
      const n = line.length, r0 = v.calibreMm[0] / 2000, r1 = v.calibreMm[1] / 2000, radii = line.map((_, i) => r0 + (r1 - r0) * (n > 1 ? i / (n - 1) : 0));
      const lo = [0, 1, 2].map(a => Math.min(...line.map(p => p[a])) - .03), hi = [0, 1, 2].map(a => Math.max(...line.map(p => p[a])) + .03);
      const soft = nerveMeshes.filter(n => { const m = nerveOf(n); return m.lo[0] < hi[0] && m.hi[0] > lo[0] && m.lo[1] < hi[1] && m.hi[1] > lo[1] && m.lo[2] < hi[2] && m.hi[2] > lo[2]; }).map(nerveOf);
      const cleared = clearBones(line, radii, bones, {pin: joined ? [0, line.length - 1] : [0], soft});
      const path = cleared.line;
      built.set(v.id, {path, radii});
      const pts = path.filter((_, i) => i % 2 === 0 || i === path.length - 1);
      const geo = tube(pts, r0, r1, Math.max(8, Math.round(path.length * 1.0)), 12);
      out.push({id: v.id, side: S.w, name: `${S.w} ${v.en[0].toLowerCase()}${v.en.slice(1)}`.replace(/^(Left|Right) Fourth perforating artery \(end of the deep femoral artery\)$/, '$1 fourth perforating artery'), path, radii, r0, r1, geometry: geo, terminal: v.terminal, parent: v.parent, joinsTo: v.joinsTo, batch: v.batch, rounds: cleared.rounds});
      if (!quiet) console.log(`${S.w} ${v.id}: ${path.length} points, ${(path.length * STEP * 1000).toFixed(0)} mm, clearance rounds ${cleared.rounds}`);
    }
  }
  return {world: w, U, vessels: out, byId};
}
