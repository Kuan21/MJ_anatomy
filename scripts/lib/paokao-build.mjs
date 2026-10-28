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

export function buildAll() {
  const w = loadWorld(), U = makeUtil(w), specs = [...thorax(U), ...thoraxNerves(U), ...upperLimb(U), ...limbVeins(U), ...lowerLimb(U), ...thoraxExtra(U), ...landmarks(U), ...membranes(U), ...knee(U), ...spacesMuscles(U), ...lungs(U), ...neckBreastVulva(U)], built = [];
  for (const s of specs) {
    const pieces = [];
    for (const t of s.tubes ?? []) pieces.push(U.tube(t.pts, t.r[0], t.r[1] ?? t.r[0], t.samples ?? 24, t.sides ?? 12));
    for (const r of s.ribbons ?? []) pieces.push(U.ribbon(r.pts, r.width, r.thick, r.hint));
    for (const g of s.geometry ?? []) pieces.push(g);
    if (!pieces.length) throw new Error(`paokao: ${s.name} has no geometry`);
    built.push({...s, geometry: merge(pieces)});
  }
  return {built, w, U};
}
