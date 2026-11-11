// Every mesh the viewer draws (atlas with the overrides applied, facial, supplement, female, serous, vessel-end and paokao streams, and the peripheral nerve stream),
// listed as {id, name, system, stream, load()} with load() returning {positions, indices}. Used by the stability checks.
import {loadFullAtlas} from './full-atlas.mjs';
import {loadWorld} from './paokao-world.mjs';

export function loadStabilityParts() {
  const {atlas, geometry} = loadFullAtlas(), parts = atlas.parts.map(p => ({id: p.id, name: p.name, system: p.system, stream: p.stream || 'atlas', part: p, load: () => geometry(p)}));
  const world = loadWorld();
  for (const e of world.entries) if (e.system === 'nervous' && e.raw) parts.push({id: 'nerve:' + e.raw, name: e.name, raw: e.raw, system: 'nervous', stream: 'nerve', load: e.load});
  return {atlas, geometry, parts};
}
export const isCentral = p => p.system === 'nervous' && /brain|cerebr|cerebell|spinal cord|medulla|pons|thalam|ventricle|cauda equina|corpus callosum|cortex|gyrus|pituitary|pineal/i.test(p.name);
export const SOFT_TUBES = p => ['arterial', 'venous', 'tendon'].includes(p.system) || (p.system === 'nervous' && !isCentral(p));
