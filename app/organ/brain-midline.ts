import * as T from 'three';

/**
 * Midline structures of the brain detail model. The Brain Project file stores several single, unpaired structures as a left and a right half
 * ("Pons.l" + "Pons.r", each ending at x = 0), and the medulla only as its left half. A student must not see "left pons" or "right optic chiasm", so
 * the viewer and the brain quiz both read the nodes through this table: the halves are welded into ONE structure with no side, and the medulla is completed by
 * its mirror image about the midline plane (the model is mirror-symmetric about x = 0 for every one of these pairs, measured in docs/qa-report.md).
 * The body of the fornix is not a separate mesh in the model: it is the part of the two fornix meshes that the halves share on the midline, cut out as its own structure.
 * Nothing is moved; the pieces are the model's own triangles.
 *
 * Pieces are position-only, non-indexed geometries (three vertices per triangle), x to the body's left, y up, z anterior, in metres.
 */
export const MIDLINE_JOIN = new Set(['Optic chiasm', 'Pons', 'Midbrain', 'Tentorium cerebelli', 'Anterior spinal artery']);
/** Only the left half exists in the model: the right half is its mirror image (marked schematic in the credits). */
export const MIDLINE_MIRROR = new Set(['Medulla oblongata']);
export const FORNIX_LABEL = 'Fornix', FORNIX_BODY = 'Body of fornix';

export type MidlineKind = 'join' | 'mirror' | 'fornix' | null;
export const midlineKind = (label: string): MidlineKind => MIDLINE_JOIN.has(label) ? 'join' : MIDLINE_MIRROR.has(label) ? 'mirror' : label === FORNIX_LABEL ? 'fornix' : null;

/** The mirror image of the pieces about x = 0, with the triangle winding reversed so the faces keep pointing outwards. */
export function mirrorX(pieces: T.BufferGeometry[]): T.BufferGeometry[] {
  return pieces.map(g => {
    const p = g.getAttribute('position'), out = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i += 3) for (let k = 0; k < 3; k++) {
      const src = k === 1 ? 2 : k === 2 ? 1 : 0, j = i + src;
      out[(i + k) * 3] = -p.getX(j); out[(i + k) * 3 + 1] = p.getY(j); out[(i + k) * 3 + 2] = p.getZ(j);
    }
    const ng = new T.BufferGeometry(); ng.setAttribute('position', new T.BufferAttribute(out, 3)); return ng;
  });
}

/**
 * Body of the fornix (the unpaired part where the two crura have joined under the corpus callosum, before the columns turn downwards): the triangles of the two fornix meshes
 * whose centre lies within 7 mm of the midline, at least 30 mm above the model's 1600 mm origin, and between 14 mm behind and 9.5 mm in front of the origin.
 * Behind that the two crura diverge (each runs back and laterally to the hippocampus), in front the columns descend. Limits read from the mesh (docs/brain-midline.md).
 */
export const FORNIX_BODY_LIMITS = {x: 0.007, yMin: 1.630, zMin: -0.014, zMax: 0.0095};
export function splitFornixBody(pieces: T.BufferGeometry[]): {body: T.BufferGeometry[]; rest: T.BufferGeometry[]} {
  const body: T.BufferGeometry[] = [], rest: T.BufferGeometry[] = [], L = FORNIX_BODY_LIMITS;
  for (const g of pieces) {
    const p = g.getAttribute('position'), inBody: number[] = [], inRest: number[] = [];
    for (let i = 0; i < p.count; i += 3) {
      const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, cy = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
      (Math.abs(cx) <= L.x && cy >= L.yMin && cz >= L.zMin && cz <= L.zMax ? inBody : inRest).push(i);
    }
    const take = (starts: number[]) => {
      const out = new Float32Array(starts.length * 9);
      starts.forEach((s, n) => { for (let k = 0; k < 3; k++) { out[n * 9 + k * 3] = p.getX(s + k); out[n * 9 + k * 3 + 1] = p.getY(s + k); out[n * 9 + k * 3 + 2] = p.getZ(s + k); } });
      const ng = new T.BufferGeometry(); ng.setAttribute('position', new T.BufferAttribute(out, 3)); return ng;
    };
    if (inBody.length) body.push(take(inBody));
    if (inRest.length) rest.push(take(inRest));
  }
  return {body, rest};
}
