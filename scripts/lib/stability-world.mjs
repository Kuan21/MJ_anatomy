// Every mesh the viewer draws (atlas with the overrides applied, facial, supplement, female, serous, vessel-end and paokao streams, and the peripheral nerve stream),
// listed as {id, name, system, stream, load()} with load() returning {positions, indices}. Used by the stability checks.
import {loadFullAtlas} from './full-atlas.mjs';
import {loadWorld} from './paokao-world.mjs';

export function loadStabilityParts() {
  const {atlas, geometry} = loadFullAtlas(), parts = atlas.parts.map(p => ({id: p.id, name: p.name, system: p.system, kind: p.kind, stream: p.stream || 'atlas', part: p, load: () => geometry(p)}));
  const world = loadWorld();
  for (const e of world.entries) if (e.system === 'nervous' && e.raw) parts.push({id: 'nerve:' + e.raw, name: e.name, raw: e.raw, system: 'nervous', stream: 'nerve', load: e.load});
  return {atlas, geometry, parts};
}
/** A bone landmark of the skull or cervical bones (kind 'landmark', above y 1.45 m): a mark lifted 0.4 mm off its host bone, not a bone. The host bone is checked, so the mark does not take over as owner of a wall that lies in that bone. (Landmarks of the limb bones keep counting as bones: their baseline was set that way.) */
export const isHeadBoneMark = p => p.kind === 'landmark' && (p.part?.bounds?.[0]?.[1] ?? 0) > 1.45;
export const isCentral = p => p.system === 'nervous' && /brain|cerebr|cerebell|spinal cord|medulla|pons|thalam|ventricle|cauda equina|corpus callosum|cortex|gyrus|pituitary|pineal/i.test(p.name);
export const SOFT_TUBES = p => ['arterial', 'venous', 'tendon'].includes(p.system) || (p.system === 'nervous' && !isCentral(p));
