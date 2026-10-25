// Parent/child check for vessels and nerves: every branch must touch the structure it leaves, at the place the anatomy says. A branch is attached when one of its tips
// lies within TOLERANCE of its parent's surface; a rule may also demand where along the parent that happens.
import {closest, sub, add, mul, unit, len, lerp, dot} from './heart-geom.mjs';
import {tubeTips} from './tube-tips.mjs';
export const TOLERANCE = .0025;

const sideName = (template, S) => template.replace(/%/g, (m, i) => (i === 0 ? S.w : S.l)).replace(/\.s$/, '.' + S.s);
export const SIDES = [{w: 'Right', l: 'right', s: 'r', sx: -1}, {w: 'Left', l: 'left', s: 'l', sx: 1}];

/** Expand ['child template', 'parent template', rule?] into one relation per side (or one when the template has no side). */
export function expand(list, kind) {
  const out = [];
  for (const [child, parent, rule] of list) {
    const sided = /%|\.s$/.test(child) || /%|\.s$/.test(parent);
    for (const S of sided ? SIDES : [null]) out.push({kind, side: S, child: S ? sideName(child, S) : child, parent: S ? sideName(parent, S) : parent, rule});
  }
  return out;
}

/** Tips of `name` (including `extra` geometry already added for it) and the one nearest the parent. */
export function attachment(U, w, relation, extraTips = []) {
  if (!w.has(relation.child) || !w.has(relation.parent)) return {missing: !w.has(relation.child) ? relation.child : relation.parent};
  const parent = w.mesh(relation.parent), all = [...extraTips];
  // each part of the branch on its own: a connector piece is a separate component of the same-named structure
  for (const e of w.find(relation.child)) { const g = e.load(), {pts, tips} = tubeTips({pos: g.positions, idx: g.indices}, .008); for (const i of tips) all.push(pts[i]); }
  let best = null;
  for (const t of all) { const c = closest(parent, t); if (!best || c.d < best.d) best = {d: c.d, tip: t, point: c.point}; }
  // The tip vertex of a thick tube lies on its end ring, up to one radius away from where the tube's axis meets the parent.
  const r = U.tipFrame(relation.child, best.tip).radius;
  return {gap: Math.max(0, best.d - .8 * r), rawGap: best.d, tip: best.tip, point: best.point, tips: all};
}

/** Where along the parent a rule wants the origin (a y level), from the rule's reference mesh. */
export function originLevel(U, w, relation) {
  const r = relation.rule?.originBelow; if (!r) return null;
  const name = sideName(r.mesh, relation.side), sx = relation.side.sx, box = r.box === 'humeral' ? {x: sx < 0 ? [-.2, -.14] : [.14, .2]} : undefined;
  return U.extreme(name, r.near, box)[1];
}

/** A thin tube from the parent to the branch's own proximal tip, bowed a little so it does not run through the parent. Returns {pts, r0, r1} or null when nothing is needed. */
export function bridge(U, w, relation, att) {
  const {tip, point: onParent} = att, frame = U.tipFrame(relation.child, tip), r = frame.radius, level = originLevel(U, w, relation);
  const parentR = .5 * Math.min(.006, Math.max(.001, r * 2.5));
  let q = onParent;
  if (level != null && tip[1] < level - (relation.rule.originBelow.tolMm ?? 12) / 1000) {
    // the branch starts too low: begin the tube on the parent at the required level, hugging the parent down to the branch
    const c = U.axisAt(relation.parent, level + .002, tip, .003), aTip = U.axisAt(relation.parent, tip[1], tip, .004), out = sub(tip, aTip), dirH = unit([out[0] || .0001, 0, out[2] || .0001]);
    const pr = U.dist(relation.parent, c), standoff = pr * .92 + r * .4;   // parent radius, so the branch runs along the parent's surface instead of inside it
    const pts = [add(c, mul(dirH, pr * .55)), ...[.12, .35, .6, .8].map(t => {
      const y = level + .002 + (tip[1] - level - .002) * t, a = U.axisAt(relation.parent, y, tip, .004), k = t * t * (3 - 2 * t);
      return lerp(add(a, mul(dirH, standoff)), tip, k * .8);
    }), add(tip, mul(frame.dir, -r * 1.8))];
    // keep the branch outside its parent (a tube running inside the parent would be invisible) while it travels along it
    const pm = w.mesh(relation.parent);
    for (let pass = 0; pass < 4; pass++) {
      for (let i = 1; i < pts.length - 1; i++) { const c = closest(pm, pts[i]), signed = dot(sub(pts[i], c.point), c.normal); if (signed < r * 1.05) pts[i] = add(c.point, mul(c.normal, r * 1.05)); }
      if (pass < 3) for (let i = 1; i < pts.length - 1; i++) pts[i] = lerp(pts[i], lerp(pts[i - 1], pts[i + 1], .5), .6);
    }
    return {pts, r0: r * .95, r1: r};
  }
  const chord = sub(tip, q), dist = len(chord);
  if (dist < .0006) return null;
  const up = Math.abs(chord[1]) > .9 * dist ? [1, 0, 0] : [0, 1, 0], n = unit([chord[1] * up[2] - chord[2] * up[1], chord[2] * up[0] - chord[0] * up[2], chord[0] * up[1] - chord[1] * up[0]]), bow = dist > .006 ? dist * .12 : 0;
  const dirIn = unit(sub(q, tip));
  return {pts: [add(q, mul(dirIn, -.0006)), add(lerp(q, tip, .35), mul(n, bow)), add(lerp(q, tip, .7), mul(n, bow * .6)), add(tip, mul(frame.dir, -Math.max(.0012, r * 1.8)))], r0: r * .9, r1: r};
}
