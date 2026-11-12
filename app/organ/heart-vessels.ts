/**
 * Vessels of the heart detail model, sorted for the chamber view: opening a chamber keeps the great vessels and the main coronary vessels (they show where the heart sits)
 * and hides the fine surface branches and the pericardium, which would only cover the chamber being looked into.
 * Names are the catalogue part names (heart-detail.json); the list is reproduced in REVIEW_LOG.md for checking.
 */
/** Main coronary vessels kept when a chamber is open (the rest of the coronary and cardiac-vein groups are fine branches). */
export const MAIN_CORONARY = ['Right coronary artery', 'Left coronary artery', 'Anterior interventricular artery', 'Circumflex artery', 'Coronary sinus', 'Great cardiac vein'] as const;
/** Fine surface branches hidden while a chamber is open. */
export const FINE_BRANCHES = [
  'Right inferolateral branch of right coronary artery', 'Septal branches of anterior interventricular artery', 'Right marginal branch', 'Posterior interventricular branch', 'Diagonal branches', 'Sinoatrial nodal artery', 'Left marginal branch',
  'Middle cardiac vein', 'Inferior vein of left ventricle', 'Posterior vein of left ventricle', 'Small cardiac vein', 'Anterior cardiac veins',
] as const;
/** Groups whose visibility is restored when the chamber is closed again. */
export const VESSEL_GROUPS = ['coronary', 'veins', 'vessels', 'pericardium'] as const;
/** Opacity of a kept vessel that stands in front of the chamber being opened. */
export const BLOCKER_OPACITY = .4;
export const isFineBranch = (name: string) => (FINE_BRANCHES as readonly string[]).includes(name);
/** A kept vessel: any great vessel, or one of the main coronary vessels. */
export const isKeptVessel = (group: string, name: string) => group === 'vessels' || (MAIN_CORONARY as readonly string[]).includes(name);

/** Kept vessels that are drawn as several separate tubes: the source meshes hold the trunk plus its side branches as disconnected pieces of one part. */
export const isTrunkPart = (group: string, name: string) => group !== 'vessels' && isKeptVessel(group, name);
/**
 * Triangles of the trunk of a vessel mesh: the longest connected piece (by bounding-box diagonal). The shorter pieces are the fine side branches
 * the source file stores inside the same part (right coronary artery, anterior interventricular artery, circumflex artery, great cardiac vein);
 * hiding them as a whole part is not possible because they share the part with the trunk. Nothing is changed in the model data, only which triangles are drawn.
 */
export function trunkTriangles(position: ArrayLike<number>, index: ArrayLike<number>): Uint32Array {
  const count = position.length / 3, parent = new Int32Array(count).map((_, i) => i);
  const find = (x: number) => {while (parent[x] !== x) {parent[x] = parent[parent[x]]; x = parent[x];} return x;};
  for (let i = 0; i < index.length; i += 3) {const a = find(index[i]); parent[find(index[i + 1])] = a; parent[find(index[i + 2])] = a;}
  const lo = new Map<number, number[]>(), hi = new Map<number, number[]>();
  for (let v = 0; v < count; v++) {
    const r = find(v), l = lo.get(r) ?? [Infinity, Infinity, Infinity], h = hi.get(r) ?? [-Infinity, -Infinity, -Infinity];
    for (let k = 0; k < 3; k++) {l[k] = Math.min(l[k], position[v * 3 + k]); h[k] = Math.max(h[k], position[v * 3 + k]);}
    lo.set(r, l); hi.set(r, h);
  }
  let best = -1, longest = -1;
  for (const [r, l] of lo) {const h = hi.get(r)!, d = Math.hypot(h[0] - l[0], h[1] - l[1], h[2] - l[2]); if (d > longest) {longest = d; best = r;}}
  const out: number[] = [];
  for (let i = 0; i < index.length; i += 3) if (find(index[i]) === best) out.push(index[i], index[i + 1], index[i + 2]);
  return Uint32Array.from(out);
}
