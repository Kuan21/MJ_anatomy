// Centreline continuity of arteries, veins and nerves (stabilisation supplement, section 4a).
//   node scripts/check-centerlines.mjs [--list] [--write] [--init]
// A centreline is taken from the mesh itself (scripts/lib/leg-centreline.mjs: the axis of the main trunk, a ring every 3 mm with its radius). Two things are checked against it:
//   link   a branch leaves its parent: one end of the branch's centreline lies within its parent's wall plus LINK_TOLERANCE of the parent's centreline (the parents are the table
//          of app/mj-vessel-parents.json, which the viewer's path highlight uses; the surface-based version of this check is scripts/check-topology.mjs);
//   parts  a structure made of several meshes (a connector piece, a group cut in two) is one connected line: every part's end lies within PART_TOLERANCE of another part.
// A structure whose mesh is not a tube (a ganglion, a plexus sheet) has no centreline; it is listed with the reason and is not counted as a failure.
// Known violations are registered in docs/centerline-known.json and may only shrink (the same rule as scripts/check-stability.mjs): a new or worse one fails the build, one that is
// gone must be removed (--write removes it). CI prints counts only.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadWorld} from './lib/paokao-world.mjs';
import {centrelineOf} from './lib/leg-centreline.mjs';
import {compareBaseline} from './lib/stability-baseline.mjs';

const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const LINK_TOLERANCE = .006, PART_TOLERANCE = .006, list = process.argv.includes('--list'), write = process.argv.includes('--write');
const plain = n => n.replace(/\.\d{3}$/, '');
// brain and spinal cord pieces are not tubes (gyri, nuclei, tracts), and a named group ("Set of dorsal digital arteries") is made of separate vessels by design: neither has one centreline
const CENTRAL = /brain|cerebr|cerebell|gyrus|lobule|\blobe\b|hemisphere|white matter|gray matter|grey matter|cortex|insula|midbrain|pons\b|medulla|thalam|hypothalam|fornix|ventricle|choroid|corpus callosum|hippocamp|amygdal|caudate|putamen|pallidus|capsule|colliculus|geniculate|habenula|mammillary|stria|septum|peduncle|spinal cord|tract\b|nucleus|ganglion/i, GROUP = /^(Set of|Roots? of|Branches of|Tributaries of)\b|(arteries|veins)$/i;
const world = loadWorld({paokao: true});
const parents = JSON.parse(fs.readFileSync(file('app/mj-vessel-parents.json'), 'utf8')).parents;
const dseg = (p, a, b) => { const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]], L = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2 || 1e-12; const t = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / L)); return Math.hypot(p[0] - a[0] - ab[0] * t, p[1] - a[1] - ab[1] * t, p[2] - a[2] - ab[2] * t); };
/** Distance from p to the line of `rings`, and the wall radius there. */
const toLine = (p, rings) => { let m = Infinity, rad = 0; for (let i = 1; i < rings.length; i++) { const d = dseg(p, rings[i - 1].c, rings[i].c); if (d < m) { m = d; rad = Math.max(rings[i - 1].r || 0, rings[i].r || 0); } } return {d: m, r: rad}; };

// structures: name -> {system, parts: [{id, rings}]}
const structures = new Map(), noLine = [];
for (const e of world.entries) {
  if (!['arterial', 'venous', 'nervous'].includes(e.system) || /^extra:/.test(e.id) || CENTRAL.test(e.name)) continue;
  const name = plain(e.name), s = structures.get(name) ?? structures.set(name, {name, system: e.system, parts: []}).get(name);
  const g = e.load(); if (!g.indices.length) continue;
  let rings = null; try { rings = centrelineOf(g); } catch { rings = null; }
  if (rings && rings.length >= 2) s.parts.push({id: e.id, rings}); else noLine.push({id: e.id, name, tris: g.indices.length / 3});
}

const findings = [];
const push = (check, id, name, measure, detail) => findings.push({check, id, name, measure: Math.round(measure * 10) / 10, detail});
// link: branch -> parent
for (const [child, list_] of Object.entries(parents)) {
  const c = structures.get(child); if (!c?.parts.length) continue;
  let best = null;
  for (const parent of list_) {
    const p = structures.get(parent); if (!p?.parts.length) continue;
    let gap = Infinity;
    for (const cp of c.parts) for (const end of [cp.rings[0].c, cp.rings.at(-1).c]) for (const pp of p.parts) { const {d, r} = toLine(end, pp.rings); gap = Math.min(gap, Math.max(0, d - r)); }
    if (!best || gap < best.gap) best = {gap, parent};   // a structure with two parents (median cubital vein) needs to reach one of them, the nearer
  }
  if (best && best.gap > LINK_TOLERANCE) push('link', child, child, best.gap * 1000, `centreline end is ${(best.gap * 1000).toFixed(1)} mm from the wall of ${best.parent}`);
}
// parts: one connected line per structure
for (const s of structures.values()) {
  if (s.parts.length < 2 || GROUP.test(s.name)) continue;
  const comp = s.parts.map((_, i) => i), find = i => comp[i] === i ? i : (comp[i] = find(comp[i]));
  let worst = 0;
  for (let i = 0; i < s.parts.length; i++) for (let j = i + 1; j < s.parts.length; j++) {
    let d = Infinity; for (const end of [s.parts[i].rings[0].c, s.parts[i].rings.at(-1).c]) d = Math.min(d, toLine(end, s.parts[j].rings).d);
    for (const end of [s.parts[j].rings[0].c, s.parts[j].rings.at(-1).c]) d = Math.min(d, toLine(end, s.parts[i].rings).d);
    if (d <= PART_TOLERANCE) comp[find(i)] = find(j);
  }
  const roots = new Set(s.parts.map((_, i) => find(i)));
  if (roots.size > 1) {
    // how far apart the nearest two pieces of different components are
    let gap = Infinity; for (let i = 0; i < s.parts.length; i++) for (let j = i + 1; j < s.parts.length; j++) if (find(i) !== find(j)) for (const end of [s.parts[i].rings[0].c, s.parts[i].rings.at(-1).c]) gap = Math.min(gap, toLine(end, s.parts[j].rings).d);
    worst = gap * 1000; push('parts', s.name, s.name, worst, `${s.parts.length} parts form ${roots.size} separate lines, the nearest two ${worst.toFixed(1)} mm apart`);
  }
}
const keyOf = f => `${f.check}|${f.id}`; for (const f of findings) f.key = keyOf(f); findings.sort((a, b) => a.key < b.key ? -1 : 1);

const knownFile = file('docs/centerline-known.json'), checks = ['link', 'parts'];
const previous = fs.existsSync(knownFile) ? JSON.parse(fs.readFileSync(knownFile, 'utf8')) : {note: '', known: {}};
const result = compareBaseline(previous.known, findings, checks);
const tally = Object.fromEntries(checks.map(c => [c, findings.filter(f => f.check === c).length]));
if (process.argv.includes('--init')) {   // one-time: register every current finding (only when there is no baseline yet)
  if (fs.existsSync(knownFile)) { console.error('docs/centerline-known.json exists already: --init only creates it'); process.exit(1); }
  const reasons = {link: 'the centreline of the branch does not reach the wall of its parent (measured on the meshes as they are): the branch is joined by a connector piece or has a gap in the source mesh; to be closed in the vessel rebuilds', parts: 'the parts of this structure do not form one line: the pieces have a gap between them in the source mesh; to be joined in the vessel rebuilds'};
  const known = Object.fromEntries(findings.map(f => [f.key, {name: f.name, measure: f.measure, reason: reasons[f.check]}]));
  fs.writeFileSync(knownFile, JSON.stringify({note: 'Known violations of scripts/check-centerlines.mjs (check|name -> name, mm, reason). The list may only shrink: a new or worse violation, or a line whose violation is gone, fails the check.', known}, null, 1) + '\n');
  console.log(`Centreline baseline created: ${findings.length} known (${checks.map(c => `${c} ${tally[c]}`).join(', ')}).`); process.exit(0);
}
if (write) {
  if (!result.next) { console.error(`Centreline update refused: ${result.bad.length} new or worse, ${result.invalid.length} invalid. No file changed.`); process.exit(1); }
  fs.writeFileSync(knownFile, JSON.stringify({...previous, known: result.next}, null, 1) + '\n');
  console.log(`Centreline baseline written: ${Object.keys(result.next).length} known (shrink only).`); process.exit(0);
}
if (list) for (const f of findings) console.log(`${f.check}: ${f.name} [${f.measure} mm] ${f.detail}`);
const structuresWithLine = [...structures.values()].filter(s => s.parts.length).length;
if (result.bad.length || result.gone.length || result.invalid.length) {
  console.error(`Centreline FAIL: ${result.bad.length} new or worse, ${result.invalid.length} invalid, ${result.gone.length} known already fixed (remove them from docs/centerline-known.json with --write). Counts: ${JSON.stringify(tally)}`);
  if (list) { for (const f of result.bad) console.error(' new/worse: ' + f.key + ' ' + f.detail); for (const k of result.gone) console.error(' fixed: ' + k); } else console.error('Run with --list for the names.');
  process.exit(1);
}
console.log(`Centreline OK: ${structuresWithLine} structures with a centreline (${noLine.length} meshes are not tubes), ${findings.length} known violations, none new (${checks.map(c => `${c} ${tally[c]}`).join(', ')}).`);
