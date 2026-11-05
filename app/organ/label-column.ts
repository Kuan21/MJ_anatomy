export interface ColumnLabel { id: string; anchor: number; height: number; priority?: number }

/** Fit measured labels inside a viewport. Crowded views keep selected labels first;
 * omitted labels remain available in the structure list. Never overlap or clip text. */
export function layoutLabelColumn(labels: ColumnLabel[], viewportHeight: number, margin = 10, gap = 4) {
  const available = Math.max(0, viewportHeight - margin * 2);
  const candidates = labels.filter(a => Number.isFinite(a.anchor) && Number.isFinite(a.height) && a.height > 0 && a.height <= available);
  const kept: ColumnLabel[] = [];
  let used = 0;
  for (const a of [...candidates].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))) {
    const size = a.height + (kept.length ? gap : 0);
    if (used + size <= available) {kept.push(a); used += size;}
  }
  kept.sort((a, b) => a.anchor - b.anchor);
  const positions = new Map<string, {top: number; centre: number}>();
  let bottom = margin - gap;
  for (const a of kept) {
    const top = Math.max(a.anchor - a.height / 2, bottom + gap);
    positions.set(a.id, {top, centre: top + a.height / 2});
    bottom = top + a.height;
  }
  let limit = viewportHeight - margin;
  for (const a of [...kept].reverse()) {
    const top = Math.min(positions.get(a.id)!.top, limit - a.height);
    positions.set(a.id, {top, centre: top + a.height / 2});
    limit = top - gap;
  }
  return positions;
}
