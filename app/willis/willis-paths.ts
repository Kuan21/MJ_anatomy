/** Where each segment of the flow network runs: built from the artery meshes of the brain model (labels as in public/models/brain.glb), so the dots follow the real vessels.
 *  Model frame: metres, +x the body's left, +y up, +z front. Every segment gets one or more polylines in the normal direction of flow (from → to). */
import type {SegmentId} from './willis-data';
import {arteryPath, extreme, farthestFrom, nearestPoint, polylineLength, type V3} from './willis-geometry';

export interface MeshArrays {positions: ArrayLike<number>; index: ArrayLike<number>}
/** Finds an artery mesh by its model label (a regular expression) and side ('left', 'right' or 'median'). */
export type ArteryLookup = (label: RegExp, side: 'left' | 'right' | 'median') => MeshArrays | null;

export interface WillisPaths {
  curves: Record<SegmentId, V3[][]>;
  /** junctions of the network, for labels and the camera */
  points: {icaTop: Record<'l' | 'r', V3>; baLow: V3; baMid: V3; baTop: V3; acomEnd: Record<'l' | 'r', V3>; pcomBack: Record<'l' | 'r', V3>};
  /** pieces the model lacks, drawn straight between the nearest points (示意); empty when everything was found */
  missing: string[];
}

const SIDES = [['l', 'left'], ['r', 'right']] as const;

export function buildWillisPaths(get: ArteryLookup): WillisPaths {
  const missing: string[] = [];
  const need = (label: RegExp, side: 'left' | 'right' | 'median', name: string) => {const m = get(label, side); if (!m) missing.push(name); return m;};
  const line = (a: V3, b: V3, steps = 8): V3[] => Array.from({length: steps}, (_, k) => [0, 1, 2].map(c => a[c] + (b[c] - a[c]) * k / (steps - 1)) as V3);
  const along = (m: MeshArrays | null, from: V3, to: V3, radius: number, steps = 32) => m ? arteryPath(m.positions, m.index, nearestPoint(m.positions, from), nearestPoint(m.positions, to), radius, steps) : line(from, to);
  const join = (...parts: (V3 | V3[])[]): V3[] => parts.flatMap(p => (Array.isArray(p[0]) ? p as V3[] : [p as V3]));
  const last = (p: V3[]) => p[p.length - 1];

  const basilar = need(/^Basilar artery$/, 'median', 'Basilar artery');
  const baLow0: V3 = basilar ? extreme(basilar.positions, 1, -1) : [0, 1.578, .003], baTop0: V3 = basilar ? extreme(basilar.positions, 1, 1) : [0, 1.602, .006];
  const baPath = along(basilar, baLow0, baTop0, .0016, 40), baLow = baPath[0], baMid = baPath[Math.floor(baPath.length / 2)], baTop = last(baPath);
  const acom = need(/^Anterior communicating artery$/, 'median', 'Anterior communicating artery');
  const acomA: V3 = acom ? extreme(acom.positions, 0, 1) : [.0034, 1.61, .023], acomB: V3 = acom ? extreme(acom.positions, 0, -1) : [-.0034, 1.61, .023];
  const acomPath = along(acom, acomA, acomB, .0009, 10);

  const curves = {} as Record<SegmentId, V3[][]>;
  const icaTop = {} as Record<'l' | 'r', V3>, acomEnd = {l: acomPath[0], r: last(acomPath)}, pcomBack = {} as Record<'l' | 'r', V3>;
  const pf: V3[][] = [];
  for (const [s, side] of SIDES) {
    const ica = need(/^Internal carotid artery$/, side, `${side} internal carotid artery`);
    const icaPath = ica ? along(ica, extreme(ica.positions, 1, -1), extreme(ica.positions, 1, 1), .0022, 64) : line([s === 'l' ? .02 : -.02, 1.49, 0], [s === 'l' ? .012 : -.012, 1.604, .02]);
    const T = last(icaPath); icaTop[s] = T; curves[`ica-${s}`] = [icaPath];
    const va = need(/^Vertebral artery$/, side, `${side} vertebral artery`);
    const vaPath = va ? along(va, extreme(va.positions, 1, -1), extreme(va.positions, 1, 1), .0018, 64) : line([s === 'l' ? .02 : -.02, 1.43, -.02], baLow);
    curves[`va-${s}`] = [join(vaPath, baLow)];
    const aca = need(/^Anterior cerebral artery$/, side, `${side} anterior cerebral artery`);
    curves[`a1-${s}`] = [join(T, along(aca, T, acomEnd[s], .0012, 16), acomEnd[s])];
    curves[`a2-${s}`] = [join(acomEnd[s], aca ? along(aca, acomEnd[s], farthestFrom(aca.positions, T), .0012, 32) : line(acomEnd[s], [acomEnd[s][0], acomEnd[s][1] + .01, acomEnd[s][2] + .012]))];
    const pcom = need(/^Posterior communicating artery$/, side, `${side} posterior communicating artery`);
    const back: V3 = pcom ? farthestFrom(pcom.positions, T) : [s === 'l' ? .008 : -.008, 1.604, .009];
    const pcomPath = join(T, along(pcom, T, back, .0009, 16)); pcomBack[s] = last(pcomPath); curves[`pcom-${s}`] = [pcomPath];
    const pca = need(/^Posterior cerebral artery$/, side, `${side} posterior cerebral artery`);
    curves[`p1-${s}`] = [join(baTop, along(pca, baTop, pcomBack[s], .0012, 16), pcomBack[s])];
    curves[`p2-${s}`] = [join(pcomBack[s], pca ? along(pca, pcomBack[s], extreme(pca.positions, 2, -1), .0012, 48) : line(pcomBack[s], [pcomBack[s][0] * 3, pcomBack[s][1] + .01, -.06]))];
    const m1 = need(/^Middle cerebral artery \(M1/, side, `${side} middle cerebral artery`);
    const m1End: V3 = m1 ? farthestFrom(m1.positions, T) : [s === 'l' ? .037 : -.037, 1.61, .02];
    const m1Path = along(m1, T, m1End, .0014, 20), m2 = get(/^Insular branches of middle cerebral artery/, side);
    curves[`mca-${s}`] = [join(T, m1Path, m2 ? along(m2, last(m1Path), farthestFrom(m2.positions, last(m1Path)), .0012, 32) : [])];
    for (const [label, name] of [[/^Superior cerebellar artery$/, 'superior cerebellar artery'], [/^Anterior inferior cerebellar artery$/, 'anterior inferior cerebellar artery']] as const) {
      const m = get(label, side); if (!m) {missing.push(`${side} ${name}`); continue;}
      const start = nearestPoint(m.positions, baMid);
      pf.push(join(baMid, along(m, start, farthestFrom(m.positions, start), .0011, 32)));
    }
  }
  curves.acom = [acomPath];
  curves['ba-1'] = [baPath.slice(0, Math.floor(baPath.length / 2) + 1)];
  curves['ba-2'] = [baPath.slice(Math.floor(baPath.length / 2))];
  curves['pf-branches'] = pf.length ? pf : [line(baMid, [baMid[0], baMid[1] - .01, baMid[2] - .03])];
  return {curves, points: {icaTop, baLow, baMid, baTop, acomEnd, pcomBack}, missing};
}

export const curveLength = (c: V3[]) => polylineLength(c);
