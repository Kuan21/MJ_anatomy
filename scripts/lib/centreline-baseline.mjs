// Baseline logic of the centreline continuity check (check-centreline-continuity.mjs): pure data in, data out, no file access.
// One entry per parent/child relation whose surfaces are further apart than the limit; the list may only shrink and a recorded distance may only go down.
// A relation that has no mesh is listed too, so a structure that disappears later cannot pass unnoticed.
// A second kind of entry, 'link', is for one structure of the spec on its own: the gap that has to be bridged to make one whole out of its separate pieces. The distance
// between a child and its parent is the smallest over all their pieces, so a piece that has come loose from its own structure would otherwise go unseen.
import {compareBaseline} from './stability-baseline.mjs';

export const CHECK = 'attach', LINK = 'link';
export const keyOf = r => `${CHECK}|${r.child}|${r.parent}`;
/** Distances are recorded in steps of 0.5 mm, rounded up, so that a re-run with the last digit different does not count as worse. */
export const roundUp = mm => Math.ceil(mm * 2 - 1e-6) / 2 + 0;

/** rows: {child, parent, surfaceMm, attachMm|null} for measured relations. The ones over the limit, in the shape compareBaseline takes. */
export const findingsOf = (rows, limitMm) => rows.filter(r => !(r.surfaceMm <= limitMm))
  .map(r => ({check: CHECK, id: r.child, sub: r.parent, key: keyOf(r), measure: roundUp(r.surfaceMm), attachMm: r.attachMm ?? null}));

/** links: {name, linkMm|null} for every structure that has a mesh (null: a single piece). The ones whose pieces are further apart than the limit. */
export const linkFindingsOf = (links, limitMm) => links.filter(l => l.linkMm !== null && !(l.linkMm <= limitMm))
  .map(l => ({check: LINK, id: l.name, key: `${LINK}|${l.name}`, measure: roundUp(l.linkMm)}));

const valid = b => b && typeof b === 'object' && Number.isFinite(b.limitMm) && b.limitMm >= 0 && b.known && typeof b.known === 'object' && !Array.isArray(b.known) && Array.isArray(b.absent);

/**
 * baseline: {limitMm, known: {key: {measure, attachMm, reason}}, absent: [key]}; rows: the measured relations; absent: {child, parent} of relations without a mesh now.
 * Result: bad (new or worse gaps), lost (relations that had a mesh and have none now), invalid, gone (recorded gaps now within the limit), back (recorded as absent, now
 * measured) and next: the baseline to save, or null when anything is bad, lost or invalid, so a failing run can never be saved.
 * A relation that comes back from absent is held to the limit like any other: its gap is not accepted into the baseline here.
 * links (see linkFindingsOf) are compared the same way under 'link' keys. Every caller has to pass them once the baseline holds such keys: left out, they would read as closed.
 * A recorded link whose structure has no mesh now is not reported as closed; its relations are then in `lost`.
 */
export function compareContinuity(baseline, rows, absent, links = []) {
  if (!valid(baseline)) return {invalid: ['baseline'], bad: [], lost: [], gone: [], back: [], next: null};
  const seen = new Set(), twice = [];
  for (const r of [...rows, ...absent]) { const k = keyOf(r); if (seen.has(k)) twice.push(k); seen.add(k); }
  const was = new Set(baseline.absent), now = new Set(absent.map(keyOf));
  const result = compareBaseline(baseline.known, [...findingsOf(rows, baseline.limitMm), ...linkFindingsOf(links, baseline.limitMm)], [CHECK, LINK]);
  const meshed = new Set(links.map(l => `${LINK}|${l.name}`));
  // A recorded gap whose relation has no mesh any more is lost, not fixed.
  const lost = [...now].filter(k => !was.has(k)), back = [...was].filter(k => !now.has(k)), gone = result.gone.filter(k => k.startsWith(LINK + '|') ? meshed.has(k) : !now.has(k));
  const invalid = [...result.invalid, ...twice];
  if (invalid.length || result.bad.length || lost.length) return {invalid, bad: result.bad, lost, gone, back, next: null};
  const attach = new Map(rows.map(r => [keyOf(r), r.attachMm ?? null]));
  const known = Object.fromEntries(Object.entries(result.next).sort(([a], [b]) => a < b ? -1 : 1).map(([k, v]) => [k, k.startsWith(CHECK + '|') ? {...v, attachMm: attach.get(k)} : v]));
  return {invalid, bad: [], lost, gone, back, next: {limitMm: baseline.limitMm, known, absent: baseline.absent.filter(k => now.has(k)).sort()}};
}

/** The first baseline: every gap over the limit as it is now, each with the same reason (they are not reviewed one by one), and the relations without a mesh. */
export function firstBaseline(rows, absent, limitMm, reason, links = []) {
  if (!reason?.trim()) throw new Error('A baseline needs a reason.');
  const known = {};
  for (const f of findingsOf(rows, limitMm).sort((a, b) => a.key < b.key ? -1 : 1)) {
    if (!Number.isFinite(f.measure) || Object.hasOwn(known, f.key)) throw new Error('Invalid or repeated relation: ' + f.key);
    known[f.key] = {measure: f.measure, attachMm: f.attachMm, reason};
  }
  // With links: the structures whose own pieces are apart, after the relations.
  for (const f of linkFindingsOf(links, limitMm).sort((a, b) => a.key < b.key ? -1 : 1)) {
    if (!Number.isFinite(f.measure) || Object.hasOwn(known, f.key)) throw new Error('Invalid or repeated structure: ' + f.key);
    known[f.key] = {measure: f.measure, reason};
  }
  return {limitMm, known, absent: absent.map(keyOf).sort()};
}
