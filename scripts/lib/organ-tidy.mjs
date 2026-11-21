// Shared clean-up pass of the organ detail packages (scripts/organ-atlas/*.mjs): every piece of a vessel or nerve must end on something.
// A piece is a connected part of a mesh; its two ends are the vertices farthest apart. An end is attached when it lies within ATTACH of a structure it can end on: a vessel on a
// vessel of its kind, the wall of a core organ or a neighbouring organ; a nerve on a nerve, ganglion, artery or organ. An end may also be a cut end where the package stops.
// A piece with one end on the network and the other one near an organ wall (or, for a vessel, near a vessel of its kind) gets a short connecting tube; a piece that still has a
// free end is dropped (fragments of the source meshes). The stomach package keeps its own copy of this pass (scripts/organ-atlas/stomach-supply.mjs) until it is moved here.
import {add, sub, mul, lerp, len, verticesOf, merge, tubeThrough, insideMesh} from './organ-supply.mjs';

export const TIDY = {ATTACH: .0025, REACH_WALL: .010, REACH_VESSEL: .015, REACH_DRAIN: .02, NERVE_GAP: .003, KEEP_NERVE: .04, MIN_PIECE: .004};
/** Kind of a structure from its key: vein, artery, nerve or organ (anything else, including ducts and ligaments, counts as an organ the others may end on). */
export const kindOf = key => /vein/i.test(key) ? 'vein' : /arter(y|ies)|trunk$|aorta/i.test(key) && !/vagal|duct/i.test(key) ? 'artery' : /nerve|plexus|ganglion|vagal|branches/i.test(key) ? 'nerve' : 'organ';

/**
 * meshes: Map key -> mesh (changed in place: each vessel and nerve is replaced by its kept pieces and connectors).
 * opts.walls: Map key -> mesh of the core organs (ends may attach to their surface; the nearest wall point is the default target of a free end).
 * opts.organs: keys (in meshes or walls) of the neighbouring organs an end may attach to.
 * opts.drain: key -> key of the structure the free end of that vessel must reach (a vein into the vessel it drains to, an artery into its organ or out of its parent).
 * opts.origin: key -> key of the parent vessel; the end of each piece nearer to the parent must join it (a connector across a gap up to REACH_DRAIN).
 * opts.cutEnd: point -> true where the package is cut on purpose (ends there count as attached).
 * opts.keepInside: keep a piece whose two ends both lie inside the walls (a branch of a vessel tree inside the organ, cut off from the trunk in the source mesh).
 * opts.skip: key -> true for meshes that are not tubes with two ends (ganglia, a short stretch of the aorta cut at both ends).
 */
export function tidy(meshes, {walls = new Map(), organs = [], drain = {}, origin = {}, keepInside = false, cutEnd = () => false, skip = () => false} = {}) {
  const {ATTACH, REACH_WALL, REACH_VESSEL, REACH_DRAIN, NERVE_GAP, KEEP_NERVE, MIN_PIECE} = TIDY;
  const ORG = new Set(organs);
  const sample = m => { const out = [], n = m.positions.length / 3, step = Math.max(1, Math.floor(n / 1500)); for (let i = 0; i < n; i += step) out.push([m.positions[i * 3], m.positions[i * 3 + 1], m.positions[i * 3 + 2]]); return out; };
  const meshOf = k => meshes.get(k) ?? walls.get(k);
  const S = new Map([...[...meshes].map(([k, m]) => [k, ORG.has(k) ? verticesOf(m) : sample(m)]), ...[...walls].map(([k, m]) => [k, verticesOf(m)])]);
  const wallPts = [...walls.values()].flatMap(verticesOf);
  const near = (p, pts) => { let b = Infinity, q = null; for (const x of pts) { const d = len(sub(p, x)); if (d < b) { b = d; q = x; } } return [b, q]; };
  const can = (kind, other) => { const o = kindOf(other); return o === 'organ' || (kind === 'nerve' ? o !== 'vein' : o === kind); };
  const report = [];
  for (const [key, m] of [...meshes]) {
    const kind = kindOf(key); if (kind === 'organ' || skip(key)) continue;
    const pcs = splitPieces(m), keep = [];
    for (const pc of pcs) {
      const pts = verticesOf(pc); let a = pts[0], b = pts[0];
      for (let r = 0; r < 2; r++) { let far = a, fd = -1; for (const p of pts) { const d = len(sub(p, a)); if (d > fd) { fd = d; far = p; } } if (r === 0) a = far; else b = far; }
      const others = [...S].filter(([k]) => k !== key && can(kind, k)), siblings = pcs.filter(x => x !== pc).flatMap(verticesOf);
      const netTargets = others.filter(([k]) => kindOf(k) !== 'organ' && !walls.has(k) && !ORG.has(k));
      // status of an end: ok (attached), net (attached to the network: a vessel of its kind, a nerve, ganglion, plexus or artery for a nerve, a sibling piece, or a cut end), to (a point to connect to)
      const status = e => {
        if (cutEnd(e)) return {ok: true, net: true};
        for (const [, pts2] of netTargets) if (near(e, pts2)[0] <= ATTACH) return {ok: true, net: true};
        if (siblings.length && near(e, siblings)[0] <= ATTACH) return {ok: true, net: true};
        for (const [k, m2] of meshes) if (k !== key && can(kind, k) && /aorta|vein$|vena cava|ganglion/i.test(k) && insideMesh(m2, e)) return {ok: true, net: true};
        if (drain[key]) {
          const tm = meshOf(drain[key]), target = S.get(drain[key]);
          if (near(e, target)[0] <= ATTACH || (tm && insideMesh(tm, e))) return {ok: true};
          const r = near(e, target); if (r[0] <= REACH_DRAIN) return {ok: false, to: r[1]};
          return {ok: false};
        }
        if (wallPts.length && near(e, wallPts)[0] <= ATTACH) return {ok: true};
        for (const k of [...walls.keys(), ...ORG]) { const m2 = meshOf(k); if (m2 && (near(e, S.get(k))[0] <= ATTACH || insideMesh(m2, e))) return {ok: true, inside: walls.has(k) && insideMesh(m2, e)}; }
        // otherwise, in this order: an organ wall, a vessel of the same kind, a neighbouring organ
        if (wallPts.length) { const [dw, qw] = near(e, wallPts); if (dw <= REACH_WALL) return {ok: false, to: qw}; }
        if (kind !== 'nerve') { let best = [Infinity, null]; for (const [k, pts2] of others) if (kindOf(k) === kind) { const r = near(e, pts2); if (r[0] < best[0]) best = r; } if (best[0] <= REACH_VESSEL) return {ok: false, to: best[1], net: true}; }
        let bo = [Infinity, null]; for (const [k, pts2] of S) if (ORG.has(k)) { const r = near(e, pts2); if (r[0] < bo[0]) bo = r; }
        if (bo[0] <= REACH_WALL) return {ok: false, to: bo[1]};
        return {ok: false};
      };
      // a branch with a named parent: its end nearer to the parent joins the parent
      const fromParent = e => { const r = near(e, S.get(origin[key])); return r[0] <= ATTACH || insideMesh(meshOf(origin[key]), e) ? {ok: true, net: true} : r[0] <= REACH_DRAIN ? {ok: false, to: r[1], net: true} : {ok: false}; };
      const parentEnd = origin[key] ? (near(a, S.get(origin[key]))[0] <= near(b, S.get(origin[key]))[0] ? a : b) : null;
      const sa = parentEnd === a ? fromParent(a) : status(a), sb = parentEnd === b ? fromParent(b) : status(b);
      const radius = Math.max(.0004, ...[a, b].map(e => { const ring = pts.filter(p => len(sub(p, e)) < .002); const c = ring.reduce((s, p) => add(s, mul(p, 1 / ring.length)), [0, 0, 0]); return ring.reduce((s, p) => s + len(sub(p, c)), 0) / ring.length; }).filter(Number.isFinite).map(r => Math.min(r, .0016)));
      // a piece must reach the network at one end at least; a piece shorter than MIN_PIECE is a crumb of the source mesh;
      // a nerve gets a connecting tube only across a gap of NERVE_GAP at most (a longer straight tube reads as a stick standing in the air)
      const shortGap = (st, e) => st.ok || !st.to || kind !== 'nerve' || len(sub(e, st.to)) <= NERVE_GAP;
      // a piece that touches the network somewhere along its length (a branch whose end is not where it joins its trunk) is joined as well
      const touches = (() => { const step = Math.max(1, Math.floor(pts.length / 200)), targets = [...netTargets.map(([, q]) => q), siblings]; for (let i = 0; i < pts.length; i += step) for (const q of targets) if (q.length && near(pts[i], q)[0] <= ATTACH) return true; return false; })();
      const pieceLen = len(sub(a, b)), reachable = (sa.ok || sa.to) && (sb.ok || sb.to) && (sa.net || sb.net || touches) && pieceLen >= MIN_PIECE && shortGap(sa, a) && shortGap(sb, b);
      if (reachable && sa.ok && sb.ok) { keep.push(pc); continue; }
      if (keepInside && sa.inside && sb.inside && pieceLen >= MIN_PIECE) { keep.push(pc); report.push(`${key}: kept a ${(pieceLen * 1e3).toFixed(0)} mm piece inside the organ`); continue; }
      if (reachable) {
        keep.push(pc);
        for (const [e, st] of [[a, sa], [b, sb]]) if (!st.ok) { keep.push(tubeThrough([e, lerp(e, st.to, .5), st.to], radius, radius * .85, 4, 8)); report.push(`${key}: connector ${(len(sub(e, st.to)) * 1e3).toFixed(1)} mm`); }
        continue;
      }
      // a long nerve (a trunk or a main branch of the source mesh) is kept as it is: its free end is a branch that ends next to the organ, not a fragment
      if (kind === 'nerve' && pieceLen >= KEEP_NERVE && (sa.net || sb.net)) { if (process.env.TIDY_DEBUG) console.log('KEEP', key, a.map(x => (x * 1e3).toFixed(0)), JSON.stringify(sa), b.map(x => (x * 1e3).toFixed(0)), JSON.stringify(sb)); keep.push(pc); report.push(`${key}: kept a ${(pieceLen * 1e3).toFixed(0)} mm branch with a free end`); continue; }
      report.push(`${key}: dropped a piece of ${(pieceLen * 1e3).toFixed(1)} mm`);
      if (process.env.TIDY_DEBUG) console.log('DROP', key, a.map(x => (x * 1e3).toFixed(0)), JSON.stringify(sa), b.map(x => (x * 1e3).toFixed(0)), JSON.stringify(sb));
    }
    if (!keep.length) throw new Error(`tidy: nothing left of ${key}`);
    meshes.set(key, merge(keep));
  }
  if (process.env.TIDY_DEBUG) console.log(report.join('\n'));
  return report;
}

/** Connected pieces of a mesh (vertices at the same place welded). */
export function splitPieces(m) {
  const n = m.positions.length / 3, key = i => `${Math.round(m.positions[i * 3] * 1e6)},${Math.round(m.positions[i * 3 + 1] * 1e6)},${Math.round(m.positions[i * 3 + 2] * 1e6)}`, ids = new Map(), w = new Int32Array(n);
  for (let i = 0; i < n; i++) { const k = key(i); if (!ids.has(k)) ids.set(k, ids.size); w[i] = ids.get(k); }
  const par = Int32Array.from({length: ids.size}, (_, i) => i), f = x => { while (par[x] !== x) x = par[x] = par[par[x]]; return x; };
  for (let t = 0; t < m.indices.length; t += 3) { const a = f(w[m.indices[t]]), b = f(w[m.indices[t + 1]]), c = f(w[m.indices[t + 2]]); par[b] = a; par[f(c)] = a; }
  const tris = new Map(); for (let t = 0; t < m.indices.length; t += 3) { const r = f(w[m.indices[t]]); if (!tris.has(r)) tris.set(r, []); tris.get(r).push(t); }
  return [...tris.values()].map(ts => {
    const map = new Map(), pos = [], idx = [];
    for (const t of ts) for (let k = 0; k < 3; k++) { const v = m.indices[t + k]; if (!map.has(v)) { map.set(v, map.size); pos.push(m.positions[v * 3], m.positions[v * 3 + 1], m.positions[v * 3 + 2]); } idx.push(map.get(v)); }
    return {positions: Float32Array.from(pos), indices: Uint32Array.from(idx)};
  });
}
