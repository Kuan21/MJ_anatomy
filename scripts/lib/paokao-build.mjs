// Turns the structure specs (scripts/paokao-structures/*.mjs) into geometry. A spec gives tubes (arteries, veins, nerves), ribbons, sheets or ready-made geometry.
import {makeUtil, merge} from './paokao-util.mjs';
import {loadWorld} from './paokao-world.mjs';
import thorax from '../paokao-structures/thorax-vessels.mjs';
import thoraxNerves from '../paokao-structures/thorax-nerves.mjs';
import upperLimb from '../paokao-structures/upper-limb.mjs';
import limbVeins from '../paokao-structures/limb-veins.mjs';
import lowerLimb from '../paokao-structures/lower-limb.mjs';
import thoraxExtra from '../paokao-structures/thorax-extra.mjs';
import landmarks from '../paokao-structures/landmarks.mjs';
import membranes from '../paokao-structures/membranes.mjs';
import knee from '../paokao-structures/knee.mjs';
import spacesMuscles from '../paokao-structures/spaces-muscles.mjs';
import lungs from '../paokao-structures/lungs.mjs';
import neckBreastVulva from '../paokao-structures/neck-breast-vulva.mjs';
import tendonsUpperLimb from '../paokao-structures/tendons-upper-limb.mjs';
import zanatomyUpperLimb from '../paokao-structures/zanatomy-upper-limb.mjs';
import ligamentsUpperLimb from '../paokao-structures/ligaments-upper-limb.mjs';
import tendonsLowerLimb from '../paokao-structures/tendons-lower-limb.mjs';
import zanatomyLowerLimb from '../paokao-structures/zanatomy-lower-limb.mjs';
import ligamentsLowerLimb from '../paokao-structures/ligaments-lower-limb.mjs';

import perinealMuscles from '../paokao-structures/perineal-muscles.mjs';
import occipitalAponeurosis from '../paokao-structures/occipital-aponeurosis.mjs';
import {clearBones} from './nerve-bone-clearance.mjs';

export function buildAll() {
  const w = loadWorld(), U = makeUtil(w), specs = [...thorax(U), ...thoraxNerves(U), ...upperLimb(U), ...limbVeins(U), ...lowerLimb(U), ...thoraxExtra(U), ...landmarks(U), ...membranes(U), ...knee(U), ...spacesMuscles(U), ...lungs(U), ...neckBreastVulva(U)], built = [];
  specs.push(...perinealMuscles(U, specs));   // after the clitoral complex: the muscles lie on it
  const lateSpecs = [...lungs(U, 'late'), ...tendonsUpperLimb(U, w), ...zanatomyUpperLimb(), ...ligamentsUpperLimb(U), ...tendonsLowerLimb(), ...zanatomyLowerLimb(U), ...ligamentsLowerLimb(U), ...occipitalAponeurosis(U, w)], late = [];
  for (const s of [...specs, ...lateSpecs]) {
    const pieces = [];
    for (const t of s.tubes ?? []) pieces.push(U.tube(t.pts, t.r[0], t.r[1] ?? t.r[0], t.samples ?? 24, t.sides ?? 12));
    for (const r of s.ribbons ?? []) pieces.push(U.ribbon(r.pts, r.width, r.thick, r.hint));
    for (const g of s.geometry ?? []) pieces.push(g);
    if (!pieces.length) throw new Error(`paokao: ${s.name} has no geometry`);
    const geometry = merge(pieces);
    // the two ends of every vessel tube (position, outward direction, radius, length of the path): scripts/lib/paokao-vessel-tips.mjs rounds the free ones
    const vesselEnds = [];
    if ((s.system === 'arterial' || s.system === 'venous') && !s.connector) for (const t of s.tubes ?? []) {
      const P = t.pts, n = P.length, d = (a, b) => { const v = [a[0] - b[0], a[1] - b[1], a[2] - b[2]], l = Math.hypot(...v) || 1; return v.map(x => x / l); };
      let len = 0; for (let i = 1; i < n; i++) len += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1], P[i][2] - P[i - 1][2]);
      vesselEnds.push({center: P[0], dir: d(P[0], P[1]), radius: t.r[0], pathLength: len}, {center: P[n - 1], dir: d(P[n - 1], P[n - 2]), radius: t.r[1] ?? t.r[0], pathLength: len});
    }
    // nerve tubes that cross a leg or foot bone (the straight branches on the dorsum of the foot) are moved out through the bone surface, like the nerves of the nerve stream
    if (s.system === 'nervous' && s.kind === 'nerve' && geometry.indices.length) clearBones(geometry.positions, geometry.indices);
    (lateSpecs.includes(s) ? late : built).push({...s, geometry, ...(vesselEnds.length ? {vesselEnds} : {})});
    // further parts of the same structure (a tendon cut from several muscle meshes): same name, card and concept, their own geometry and motion binding
    for (const sib of s.siblings ?? []) late.push({...s, siblings: undefined, bellies: undefined, geometry: merge(sib.geometry), binding: sib.binding, kind: sib.kind ?? s.kind, sibling: true});
  }
  // `late` (the lung surface areas of the name labels, then the tendons) is appended to `built` after the connectors, so no earlier structure changes its id
  return {built, late, w, U};
}
