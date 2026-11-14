// The measurement of one parent/child relation for the centreline continuity check of docs/centerline-plan.md (used by report-centreline-attach.mjs).
// Measuring only, pure geometry: meshes {positions, indices} in metres go in, distances in metres come out.
import {centrelinesOf} from './centreline-pieces.mjs';
import {attachGap} from './centreline-continuity.mjs';
import {pieceGap} from './centreline-groups.mjs';
import {surfaceGap} from './centreline-surface.mjs';

const min = values => { const v = values.filter(x => x !== null && x !== undefined); return v.length ? Math.min(...v) : null; };
/** Every centreline (array of rings) of every mesh of one structure; a structure can have several meshes and a mesh several pieces. */
export const linesOfMeshes = meshes => meshes.flatMap(g => centrelinesOf(g).map(l => l.rings));

/**
 * Gaps between a child structure and its parent, each given as its meshes and its centrelines (linesOfMeshes), the smallest over all pairs:
 *   attach  an end of a child centreline to the wall of a parent centreline (the direction topology-spec states);
 *   either  the smaller of that, a parent end to the child's wall, and end to end;
 *   surface the distance between the mesh surfaces themselves (no centreline involved).
 * `noLine` is 'child' or 'parent' when that side gives no centreline; attach and either are then null and surface is still measured.
 */
export function relationGaps(childMeshes, parentMeshes, childLines = linesOfMeshes(childMeshes), parentLines = linesOfMeshes(parentMeshes)) {
  const noLine = !childLines.length ? 'child' : !parentLines.length ? 'parent' : null;
  return {
    attach: noLine ? null : min(childLines.flatMap(c => parentLines.map(p => attachGap(c, p)?.gap))),
    either: noLine ? null : min(childLines.flatMap(c => parentLines.map(p => pieceGap(c, p)))),
    surface: min(childMeshes.flatMap(c => parentMeshes.map(p => surfaceGap(c, p)))),
    childLines: childLines.length, parentLines: parentLines.length, noLine,
  };
}
