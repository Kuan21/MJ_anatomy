// For the continuity check of docs/centerline-plan.md: which meshes made of several pieces are expected to be one connected structure, and how far their pieces are apart.
// Measuring only; nothing here changes a model. The kind comes from the name and from scripts/topology-spec.mjs, not from a judgement about the anatomy:
//   'spec'    the name is a child or parent in topology-spec, which treats it as one structure that branches leave or join: its pieces must connect;
//   'group'   the name itself says it holds several structures ("Set of …", a plural such as "arteries", "branches", "roots", "ganglia", or a plexus): its pieces are separate by design;
//   'unknown' a singular name that topology-spec does not list: the name does not settle it (a "Lumbar artery" mesh can hold four arteries), so a person has to look.
import {ARTERIES, VEINS, NERVES} from '../topology-spec.mjs';
import {expand} from './topology.mjs';
import {joinGap, attachGap} from './centreline-continuity.mjs';

const bare = name => name.toLowerCase().replace(/\.[lr]$/, '');
const GROUP = /^set of |\b(arteries|veins|nerves|branches|roots|ganglia|tributaries|rami|plexus|plexuses)\b/;

/** Lower-case names of every child and parent of topology-spec, one per side. */
export function specNames(lists = [ARTERIES, VEINS, NERVES]) {
  const out = new Set();
  for (const list of lists) for (const r of expand(list, '')) { out.add(r.child.toLowerCase()); out.add(r.parent.toLowerCase()); }
  return out;
}

/** 'spec' | 'group' | 'unknown' for a mesh name (see the top of this file). A name in topology-spec wins over a plural in it ("… of brachial plexus"). */
export function structureKind(name, spec = specNames()) {
  if (spec.has(name.toLowerCase())) return 'spec';
  // "of <plural>" names the owner, not the structure: "Lateral cord of brachial plexus" and "Anterior root of spinal nerve" are singular.
  const head = bare(name).split(/ of /)[0], whole = bare(name);
  return GROUP.test(/^set of /.test(whole) ? whole : head) ? 'group' : 'unknown';
}

/** Distance between two centrelines as parts of one structure: end to end (joinGap) or an end of one to the wall of the other (attachGap, a branch leaving the side), whichever is smaller. */
export function pieceGap(a, b) {
  const g = [joinGap(a, b), attachGap(a, b)?.gap, attachGap(b, a)?.gap].filter(v => v !== null && v !== undefined);
  return g.length ? Math.min(...g) : null;
}

/**
 * The gap that has to be bridged to make one connected structure out of the lines (arrays of rings): the longest edge of the minimum spanning tree over pieceGap.
 * 0 when every piece touches another and all hang together; null for fewer than two lines. Unlike "each piece's nearest neighbour", two tight clusters far apart give a large value.
 */
export function linkGap(lines) {
  const n = lines.length; if (n < 2) return null;
  const best = new Array(n).fill(Infinity), done = new Array(n).fill(false); best[0] = 0;
  let worst = 0;
  for (let k = 0; k < n; k++) {
    let v = -1; for (let i = 0; i < n; i++) if (!done[i] && (v < 0 || best[i] < best[v])) v = i;
    done[v] = true; worst = Math.max(worst, best[v]);
    for (let i = 0; i < n; i++) if (!done[i]) { const d = pieceGap(lines[v], lines[i]); if (d !== null && d < best[i]) best[i] = d; }
  }
  return worst;
}
