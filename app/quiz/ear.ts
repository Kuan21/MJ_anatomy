// Ear quiz (Quiz → 器官 → 耳): which structure lies in front of another when the ear is looked at from outside (decides what is drawn as glass in a question, see coversEarTarget).
// The order is the depth order of the ear detail mode (app/mj-ear-atlas.ts EAR_LAYERS): auricle, tympanic membrane, ossicles, bony labyrinth; the nerves lie at the depth of the ossicles and the membranous labyrinth is the innermost.

export type EarLayer = 'auricle' | 'membrane' | 'ossicle' | 'nerve' | 'bony' | 'membranous';
const DEPTH: Record<EarLayer, number> = {auricle: 0, membrane: 1, ossicle: 2, nerve: 2, bony: 3, membranous: 4};
/** The depth layer of a structure of the ear catalogue (by its English name, group and system in the catalogue). */
export function earLayerOf(id: string, group: string): EarLayer {
  if (id === 'auricle') return 'auricle';
  if (id === 'tympanic-membrane') return 'membrane';
  if (id === 'malleus' || id === 'incus' || id === 'stapes') return 'ossicle';
  if (group === 'nerves') return 'nerve';
  if (group === 'membranous') return 'membranous';
  return 'bony';
}
/** `other` is drawn as faint glass (and cannot be picked) while `target` is the question when it lies outside the target: every structure of an outer layer. */
export function coversEarTarget(target: {layer?: string} | undefined, other: {layer?: string}): boolean {
  const a = DEPTH[target?.layer as EarLayer], b = DEPTH[other.layer as EarLayer];
  return a !== undefined && b !== undefined && b < a;
}
