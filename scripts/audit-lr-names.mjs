// Read-only: for every head-and-neck structure whose name says Left/Right, compare the named side with where the mesh actually is.
//   node scripts/audit-lr-names.mjs [--md] [--all] [--check]
// Coordinates (rest frame, metres): y up, x positive = Left, z positive = anterior. Head and neck = mesh centroid at y >= 1.42 m (above the clavicles / first rib).
// Side by mesh: centroid x (vertex mean). |x| < MID_MM (2 mm) counts as midline-crossing and is NOT judged (avoids false alarms for structures that straddle the midline).
// Judgement: named Left and centroid x >= +2 mm, or named Right and x <= -2 mm = consistent; the opposite sign beyond 2 mm = "reversed".
// Reads the generated streams (not available in a clean CI checkout of generated files? the check.d test runs after the generators, same as the other mesh tests).
// --check exits 1 when a reversed name is not in KNOWN_REVERSED (that list may only shrink).
import {loadFullAtlas} from './lib/full-atlas.mjs';
export const HEAD_NECK_MIN_Y = 1.42, MID_MM = 2;
// Known reversed names that are not fixed in this data (reason in docs). Empty on purpose: it may only shrink.
export const KNOWN_REVERSED = [];
export function scanLeftRight() {
  const {atlas, geometry} = loadFullAtlas(), rows = [];
  for (const p of atlas.parts) {
    const m = /^(Left|Right)\b/i.exec(p.name) || /\b(left|right)\b/i.exec(p.name);
    if (!m || /-END$/.test(p.id)) continue;
    const named = m[1].toLowerCase() === 'left' ? 'L' : 'R';
    const g = geometry(p), P = g.positions; let sx = 0, sy = 0; const n = P.length / 3;
    for (let i = 0; i < P.length; i += 3) { sx += P[i]; sy += P[i + 1]; }
    const cx = sx / n * 1e3, cy = sy / n;
    if (cy < HEAD_NECK_MIN_Y) continue;
    const actual = Math.abs(cx) < MID_MM ? 'M' : cx > 0 ? 'L' : 'R';
    rows.push({id: p.id, name: p.name, named, cx: +cx.toFixed(1), cy: +cy.toFixed(3), verdict: actual === 'M' ? 'midline (not judged)' : actual === named ? 'ok' : 'REVERSED'});
  }
  return rows;
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const rows = scanLeftRight(), bad = rows.filter(r => r.verdict === 'REVERSED'), mid = rows.filter(r => r.verdict.startsWith('midline'));
  const show = process.argv.includes('--all') ? rows : [...bad, ...mid];
  if (process.argv.includes('--md')) { console.log('| id | name | named | centroid x (mm) | verdict |\n|---|---|---|---|---|'); for (const r of show) console.log(`| ${r.id} | ${r.name} | ${r.named === 'L' ? 'Left' : 'Right'} | ${r.cx} | ${r.verdict} |`); }
  else for (const r of show) console.log(`${r.id}\t${r.name}\t${r.named}\t${r.cx}\t${r.verdict}`);
  console.log(`Head-neck left/right names: ${rows.length} checked, ${rows.length - bad.length - mid.length} consistent, ${mid.length} midline, ${bad.length} reversed.`);
  if (process.argv.includes('--check')) { const unknown = bad.filter(r => !KNOWN_REVERSED.includes(r.id)); if (unknown.length) { console.error('reversed names not in the known list: ' + unknown.map(r => r.id).join(', ')); process.exit(1); } }
}
