// Owner muscle of every tendon, derived from the cut specs (scripts/tendon/*.mjs): a tendon structure is cut off the muscle parts its spec lists, so those parts are its owners.
// Nothing is set by hand per tendon: a new spec (any limb) gets its owners the moment it is added to TENDON_SPECS (scripts/lib/tendon-set.mjs).
// The result maps the tendon structure name (`${side word} ${spec.title}`, the name of its parts) to the atlas names of the muscle parts it was cut from.
import {TENDON_SPECS, SIDES, mirrorName} from './tendon-set.mjs';

/** @param {Set<string>} atlasNames names of the atlas parts (a spec whose muscle is missing is a bug: the cut would have failed too) */
export function tendonOwners(atlasNames) {
  const out = {};
  for (const spec of TENDON_SPECS) for (const side of SIDES) {
    const muscles = spec.parts.map(n => side.mirror ? mirrorName(n) : n);
    const missing = muscles.filter(n => !atlasNames.has(n));
    if (missing.length) throw new Error(`tendon ${spec.key}: owner muscle part not in the atlas: ${missing.join(', ')}`);
    const name = `${side.w} ${spec.title}`;
    out[name] = [...new Set([...(out[name] ?? []), ...muscles])];
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a < b ? -1 : 1));
}
