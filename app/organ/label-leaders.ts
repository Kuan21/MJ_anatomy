import {layoutLabelColumn} from './label-column';

/** Screen-space geometry of the heart name labels: one visible surface point per structure, labels in two columns, leader lines that never cross. */
export interface Pt {x: number; y: number}
export interface LeaderCandidate {
  id: string;
  /** screen points on the visible surface of the structure, best first (nearest the middle of its visible area) */
  points: Pt[];
  width: number; height: number; priority?: number;
}
export interface Leader {
  id: string; side: 'l' | 'r';
  anchor: Pt; edge: Pt;
  top: number; width: number; height: number;
}
export interface LeaderLayout {leaders: Leader[]; hidden: string[]}

const cross = (o: Pt, a: Pt, b: Pt) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
/** True when the open segments p1-p2 and p3-p4 cross (touching at an end point counts as crossing too). */
export function segmentsCross(p1: Pt, p2: Pt, p3: Pt, p4: Pt) {
  const d1 = cross(p3, p4, p1), d2 = cross(p3, p4, p2), d3 = cross(p1, p2, p3), d4 = cross(p1, p2, p4);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  const on = (a: Pt, b: Pt, c: Pt) => Math.min(a.x, b.x) - 1e-9 <= c.x && c.x <= Math.max(a.x, b.x) + 1e-9 && Math.min(a.y, b.y) - 1e-9 <= c.y && c.y <= Math.max(a.y, b.y) + 1e-9;
  return (Math.abs(d1) < 1e-9 && on(p3, p4, p1)) || (Math.abs(d2) < 1e-9 && on(p3, p4, p2)) || (Math.abs(d3) < 1e-9 && on(p1, p2, p3)) || (Math.abs(d4) < 1e-9 && on(p1, p2, p4));
}

/**
 * Picks one anchor per structure so that no two anchors are closer than `gap` pixels. The structure with the fewest visible points chooses first, and every structure
 * takes its best-placed point that is still free; a structure with no free point is left out (hidden), never forced onto another structure's anchor.
 */
export function chooseAnchors(candidates: LeaderCandidate[], gap = 28) {
  const order = [...candidates].filter(c => c.points.length).sort((a, b) => a.points.length - b.points.length || (b.priority ?? 0) - (a.priority ?? 0));
  const chosen = new Map<string, Pt>(), taken: Pt[] = [];
  for (const c of order) {
    const free = c.points.find(p => taken.every(q => Math.hypot(p.x - q.x, p.y - q.y) >= gap));
    if (free) {chosen.set(c.id, free); taken.push(free);}
  }
  return chosen;
}

/** Fixed left-to-right order of the labels in a column: top to bottom, each label as near its anchor as the labels above allow. */
function stack(order: LeaderCandidate[], anchors: Map<string, Pt>, viewportHeight: number, margin: number, gap: number) {
  const top = new Map<string, number>();
  let bottom = margin - gap;
  for (const c of order) {const t = Math.max(anchors.get(c.id)!.y - c.height / 2, bottom + gap); top.set(c.id, t); bottom = t + c.height;}
  let limit = viewportHeight - margin;
  for (const c of [...order].reverse()) {const t = Math.min(top.get(c.id)!, limit - c.height); top.set(c.id, t); limit = t - gap;}
  return top;
}

/**
 * Two columns of labels (structures left of the heart's centre go left, the others right). Labels are ordered by the height of their anchor; where two leader lines
 * would still cross, the two labels swap places until none cross. A leader that cannot be uncrossed is dropped rather than drawn across another.
 */
export function layoutLeaders(candidates: LeaderCandidate[], anchors: Map<string, Pt>, viewport: {width: number; height: number; centreX: number}, margin = 10, gap = 4): LeaderLayout {
  const leaders: Leader[] = [], hidden = new Set(candidates.filter(c => !anchors.has(c.id)).map(c => c.id));
  for (const side of ['l', 'r'] as const) {
    const mine = candidates.filter(c => anchors.has(c.id) && ((anchors.get(c.id)!.x < viewport.centreX) === (side === 'l')));
    // labels that fit the column (selected ones first), as the plain column layout decides
    const kept = layoutLabelColumn(mine.map(c => ({id: c.id, anchor: anchors.get(c.id)!.y, height: c.height, priority: c.priority})), viewport.height, margin, gap);
    let order = mine.filter(c => kept.has(c.id)).sort((a, b) => anchors.get(a.id)!.y - anchors.get(b.id)!.y || a.id.localeCompare(b.id));
    for (const c of mine) if (!kept.has(c.id)) hidden.add(c.id);
    const edgeOf = (c: LeaderCandidate) => side === 'l' ? margin + c.width : viewport.width - margin - c.width;
    const segments = (tops: Map<string, number>) => order.map(c => ({c, a: {x: edgeOf(c), y: tops.get(c.id)! + c.height / 2}, b: anchors.get(c.id)!}));
    let tops = stack(order, anchors, viewport.height, margin, gap);
    for (let pass = 0; pass < 400; pass++) {
      const s = segments(tops);
      let swapped = false;
      outer: for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) if (segmentsCross(s[i].a, s[i].b, s[j].a, s[j].b)) {
        [order[i], order[j]] = [order[j], order[i]]; tops = stack(order, anchors, viewport.height, margin, gap); swapped = true; break outer;
      }
      if (!swapped) break;
    }
    // whatever still crosses after the swaps: drop the lower-priority (then longer) leader of the pair
    for (let guard = 0; guard < order.length; guard++) {
      const s = segments(tops);
      let drop: LeaderCandidate | null = null;
      outer2: for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) if (segmentsCross(s[i].a, s[i].b, s[j].a, s[j].b)) {
        const len = (k: typeof s[number]) => Math.hypot(k.a.x - k.b.x, k.a.y - k.b.y);
        const pi = s[i].c.priority ?? 0, pj = s[j].c.priority ?? 0;
        drop = pi !== pj ? (pi < pj ? s[i].c : s[j].c) : (len(s[i]) >= len(s[j]) ? s[i].c : s[j].c); break outer2;
      }
      if (!drop) break;
      hidden.add(drop.id); order = order.filter(c => c !== drop); tops = stack(order, anchors, viewport.height, margin, gap);
    }
    for (const c of order) {
      const top = tops.get(c.id)!;
      leaders.push({id: c.id, side, anchor: anchors.get(c.id)!, edge: {x: edgeOf(c), y: top + c.height / 2}, top, width: c.width, height: c.height});
    }
  }
  return {leaders, hidden: [...hidden]};
}

/** Problems found in a finished layout (used by the tests and by the browser check): crossing leaders, anchors closer than `gap`, overlapping label boxes. */
export function leaderProblems(layout: Leader[], gap = 28) {
  const problems: string[] = [];
  for (let i = 0; i < layout.length; i++) for (let j = i + 1; j < layout.length; j++) {
    const a = layout[i], b = layout[j];
    if (segmentsCross(a.edge, a.anchor, b.edge, b.anchor)) problems.push(`leaders cross: ${a.id} / ${b.id}`);
    if (Math.hypot(a.anchor.x - b.anchor.x, a.anchor.y - b.anchor.y) < gap) problems.push(`anchors too close: ${a.id} / ${b.id}`);
    if (a.side === b.side && a.top < b.top + b.height && b.top < a.top + a.height) problems.push(`labels overlap: ${a.id} / ${b.id}`);
  }
  return problems;
}
