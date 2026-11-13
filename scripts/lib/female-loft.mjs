// Continuous uterus and uterine tubes, lofted from the registered Human Reference Atlas pieces (CC BY 4.0) instead of using the separate source meshes, which read as stacked discs.
// Position, size and axis are measured on the source pieces; only the form is rebuilt: the uterus as one smooth pear (elliptical cross-sections along its axis), each tube as one bent
// tube whose radius follows the source. The result is cut back into the original named segments so that every name can still be picked. These are schematic shapes (see docs/female-uterus-spec.md).
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = a => Math.hypot(a[0], a[1], a[2]), unit = a => { const l = len(a) || 1; return mul(a, 1 / l); };
const verts = pos => { const o = []; for (let i = 0; i < pos.length; i += 3) o.push([pos[i], pos[i + 1], pos[i + 2]]); return o; };
const mean = v => v.reduce((s, p) => add(s, mul(p, 1 / v.length)), [0, 0, 0]);
const smooth = (arr, passes, keepEnds = true) => { let a = arr.map(x => (Array.isArray(x) ? x.slice() : x)); for (let p = 0; p < passes; p++) { const b = a.map(x => (Array.isArray(x) ? x.slice() : x)); for (let i = keepEnds ? 1 : 0; i < a.length - (keepEnds ? 1 : 0); i++) { const l = a[Math.max(0, i - 1)], r = a[Math.min(a.length - 1, i + 1)], c = a[i]; b[i] = Array.isArray(c) ? c.map((_, k) => (l[k] + 2 * c[k] + r[k]) / 4) : (l + 2 * c + r) / 4; } a = b; } return a; };

/** Principal axis (unit) of a point cloud by power iteration. */
function principalAxis(v) {
  const c = mean(v); let a = [0, 1, 0];
  for (let it = 0; it < 30; it++) { const n = [0, 0, 0]; for (const p of v) { const d = sub(p, c), s = dot(d, a); n[0] += d[0] * s; n[1] += d[1] * s; n[2] += d[2] * s; } a = unit(n); }
  return a;
}

/** A closed mesh from rings (each a list of points, same count M) plus end caps; winding outward for a ring order that turns from `n` to `b` while moving along `t = n × b`. */
function meshFromRings(rings, capStart = true, capEnd = true) {
  const M = rings[0].length, positions = [], indices = [];
  for (const r of rings) for (const p of r) positions.push(...p);
  for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < M; j++) { const a = i * M + j, b = i * M + (j + 1) % M, c = (i + 1) * M + j, d = (i + 1) * M + (j + 1) % M; indices.push(a, b, c, b, d, c); }
  const addCap = (ring, base, flip) => { const c = mean(ring), ci = positions.length / 3; positions.push(...c); for (let j = 0; j < M; j++) { const a = base + j, b = base + (j + 1) % M; indices.push(...(flip ? [ci, a, b] : [ci, b, a])); } };
  if (capStart) addCap(rings[0], 0, false);
  if (capEnd) addCap(rings[rings.length - 1], (rings.length - 1) * M, true);
  return {positions: Float32Array.from(positions), indices: Uint32Array.from(indices)};
}

/** The part of a ring mesh between ring indices [a, b] (inclusive), with its own caps where it is cut. */
function slabOf(rings, a, b, capStart, capEnd) { return meshFromRings(rings.slice(a, b + 1), capStart, capEnd); }

/**
 * Uterus: `pieces` = [{positions, name}] of the four source pieces (fundus, body, lower segment, cervix). Returns {fundus, body, lower, cervix} meshes (same names as keys) and a report.
 */
export function loftUterus(pieces, {slices = 56, sides = 28, exponent = 2.4} = {}) {
  const all = verts(pieces.flatMap(p => Array.from(p.positions))), c0 = mean(all);
  const byName = n => pieces.find(p => p.name === n);
  let a = principalAxis(all);
  const cf = mean(verts(byName('fundus').positions)), cc = mean(verts(byName('cervix').positions));
  if (dot(a, sub(cf, cc)) < 0) a = mul(a, -1);   // from the cervix towards the fundus
  let l = [1, 0, 0]; l = unit(sub(l, mul(a, dot(l, a))));   // sideways (body's left)
  const d = cross(a, l);                                    // front-to-back; (l, d, a) is right-handed like (n, b, t)
  const T = all.map(p => dot(sub(p, c0), a)), tmin = Math.min(...T) - .006, tmax = Math.max(...T), dt = (tmax - tmin) / (slices - 1);   // the cervix is carried 6 mm further down: it projects into the vagina, and the source pieces were cut across the tilted axis
  const cen = [], hw = [], hd = [];
  for (let k = 0; k < slices; k++) {
    const t = tmin + k * dt; let lo = [1e9, 1e9], hi = [-1e9, -1e9];
    all.forEach((p, i) => { if (Math.abs(T[i] - t) > 1.6 * dt) return; const q = sub(p, c0), x = dot(q, l), y = dot(q, d); lo = [Math.min(lo[0], x), Math.min(lo[1], y)]; hi = [Math.max(hi[0], x), Math.max(hi[1], y)]; });
    if (lo[0] > hi[0]) { const prev = k ? [cen[k - 1], hw[k - 1], hd[k - 1]] : [[0, 0], 1e-3, 1e-3]; cen.push(prev[0]); hw.push(prev[1]); hd.push(prev[2]); continue; }
    cen.push([(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2]); hw.push((hi[0] - lo[0]) / 2); hd.push((hi[1] - lo[1]) / 2);
  }
  const cenS = smooth(cen, 6, false), hwS = smooth(hw, 6, false), hdS = smooth(hd, 6, false), L = tmax - tmin, domeTop = .16 * L, domeBottom = 1e-9;   // the cervix end stays full width: it projects into the vagina
  const rings = [];
  for (let k = 0; k < slices; k++) {
    const t = tmin + k * dt; let s = 1;
    const up = (tmax - t) / domeTop, dn = (t - tmin) / domeBottom;   // distance from each end in units of the dome length
    if (up < 1) s = Math.min(s, Math.sqrt(Math.max(0, 1 - (1 - up) ** 2)));
    s = Math.max(s, .04); void dn;
    const ring = [], base = add(c0, mul(a, t));
    for (let j = 0; j < sides; j++) {
      const th = 2 * Math.PI * j / sides, cs = Math.cos(th), sn = Math.sin(th), x = Math.sign(cs) * Math.abs(cs) ** (2 / exponent), y = Math.sign(sn) * Math.abs(sn) ** (2 / exponent);
      ring.push(add(add(base, mul(l, cenS[k][0] + s * hwS[k] * x)), mul(d, cenS[k][1] + s * hdS[k] * y)));
    }
    rings.push(ring);
  }
  // cut into the four named segments at the midpoints between the source pieces (ordered from the cervix up)
  const order = ['cervix', 'lower', 'body', 'fundus'].map(n => ({n, t: dot(sub(mean(verts(byName(n === 'lower' ? 'lower' : n).positions)), c0), a)}));
  const cut = [0]; for (let i = 0; i < 3; i++) { const tm = (order[i].t + order[i + 1].t) / 2; cut.push(Math.max(cut[cut.length - 1] + 1, Math.round((tm - tmin) / dt))); } cut.push(slices - 1);
  const out = {};
  order.forEach((o, i) => { out[o.n] = slabOf(rings, cut[i], cut[i + 1], i === 0, i === 3); });
  return {meshes: out, report: {axis: a.map(x => +x.toFixed(3)), length: L, cut, widthMax: Math.max(...hwS) * 2, depthMax: Math.max(...hdS) * 2}};
}

/** Centre line and radius of one tube-like piece, ordered along its principal axis. */
function centreLine(positions, step = .0022) {
  const v = verts(positions), c = mean(v), a = principalAxis(v), T = v.map(p => dot(sub(p, c), a)), tmin = Math.min(...T), tmax = Math.max(...T), K = Math.max(5, Math.round((tmax - tmin) / step));
  const pts = [], rad = [];
  for (let k = 0; k < K; k++) {
    const lo = tmin + (tmax - tmin) * k / K, hi = tmin + (tmax - tmin) * (k + 1) / K, sel = [];
    v.forEach((p, i) => { if (T[i] >= lo && T[i] <= hi) sel.push(p); });
    if (!sel.length) continue;
    const m = mean(sel); let r = 0; for (const p of sel) { const q = sub(p, m), s = dot(q, a); r += Math.sqrt(Math.max(0, dot(q, q) - s * s)); }
    pts.push(m); rad.push(r / sel.length * 1.35);   // mean distance of surface points ≈ 0.74 of an elliptical radius; widen to the surface
  }
  return {pts, rad};
}

/**
 * One uterine tube: `pieces` = [{positions, name}] with names 'isthmus', 'ampulla', 'infundibulum' (medial to lateral); `uterus` = a point inside the uterus.
 * Returns meshes keyed by those names and a report.
 */
export function loftTube(pieces, uterus, uterusPts, {sides = 16, samples = 70, minRadius = .0011} = {}) {
  const lines = pieces.map(p => ({name: p.name, ...centreLine(p.positions)})), chain = [];
  const first = lines.find(x => x.name === 'isthmus');
  const ordered = ['isthmus', 'ampulla', 'infundibulum'].map(n => lines.find(x => x.name === n));
  ordered.forEach((ln, i) => {
    const ref = i === 0 ? uterus : chain[chain.length - 1].pts[chain[chain.length - 1].pts.length - 1];
    if (len(sub(ln.pts[ln.pts.length - 1], ref)) < len(sub(ln.pts[0], ref))) { ln.pts.reverse(); ln.rad.reverse(); }
    chain.push(ln);
  });
  void first;
  const path = [], rad = [], cutLen = [];
  chain.forEach(ln => { ln.pts.forEach((p, i) => { if (!path.length || len(sub(p, path[path.length - 1])) > 1e-5) { path.push(p); rad.push(ln.rad[i]); } }); cutLen.push(path.length); });
  const cum = [0]; for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + len(sub(path[i], path[i - 1])));
  const total = cum[cum.length - 1], at = s => { let i = 1; while (i < cum.length - 1 && cum[i] < s) i++; const f = (s - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1); return [add(mul(path[i - 1], 1 - f), mul(path[i], f)), rad[i - 1] * (1 - f) + rad[i] * f]; };
  let P = [], R = []; for (let k = 0; k < samples; k++) { const [p, r] = at(total * k / (samples - 1)); P.push(p); R.push(r); }
  P = smooth(P, 8); R = smooth(R, 8).map(r => Math.max(minRadius, r));
  // the tube leaves the uterus at its upper side corner: start it on the nearest point of the (lofted) uterus, 1.5 mm inside the surface
  { let best = uterusPts[0], bd = Infinity; for (const q of uterusPts) { const dd = len(sub(q, P[0])); if (dd < bd) { bd = dd; best = q; } }
    P[0] = add(best, mul(unit(sub(uterus, best)), .0015)); P = smooth(P, 3); P[0] = add(best, mul(unit(sub(uterus, best)), .0015)); }
  const fr = cutLen.slice(0, 2).map(n => cum[Math.min(n, cum.length) - 1] / total), cutIdx = [0, ...fr.map(f => Math.round(f * (samples - 1))), samples - 1];
  // frames along the path (parallel transport)
  const rings = []; let n = null;
  for (let k = 0; k < samples; k++) {
    const t = unit(sub(P[Math.min(samples - 1, k + 1)], P[Math.max(0, k - 1)]));
    if (!n) { n = Math.abs(t[1]) < .9 ? unit(cross([0, 1, 0], t)) : unit(cross([1, 0, 0], t)); } else { n = unit(sub(n, mul(t, dot(n, t)))); }
    const b = cross(t, n), ring = [];
    for (let j = 0; j < sides; j++) { const th = 2 * Math.PI * j / sides; ring.push(add(P[k], add(mul(n, R[k] * Math.cos(th)), mul(b, R[k] * Math.sin(th))))); }
    rings.push(ring);
  }
  const out = {}; ['isthmus', 'ampulla', 'infundibulum'].forEach((nme, i) => { out[nme] = slabOf(rings, cutIdx[i], cutIdx[i + 1], i === 0, i === 2); });
  return {meshes: out, report: {length: total, cutIdx, rMin: Math.min(...R), rMax: Math.max(...R), start: P[0], end: P[samples - 1]}};
}
