// Centreline continuity check of docs/centerline-plan.md: for every parent/child relation of scripts/topology-spec.mjs the surfaces of the child and of its parent must be
// within LIMIT_MM of each other, connector pieces of the paokao package included, and the separate pieces of each of those structures must hang together within LIMIT_MM
// (a child counts as attached when any of its pieces is, so a piece that came loose would otherwise pass). Known gaps are in docs/centreline-continuity-baseline.json; the list may only shrink.
// Measuring only: no model is changed. Not part of npm run check until a baseline exists (it needs every generated package).
//   node scripts/check-centreline-continuity.mjs [--list] [--write] [--init] [--available]
//     (no flag)    compares with the baseline; prints counts and pass/fail only
//     --list       also prints the names of the relations concerned
//     --write      saves the baseline after a passing run (smaller or closed gaps only)
//     --init       makes the first baseline; refused when one exists or when a package is missing
//     --available  trial on the packages that exist in this checkout: counts only, the baseline is neither read nor written
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {loadWorld} from './lib/paokao-world.mjs';
import {relationGaps, linesOfMeshes} from './lib/centreline-attach.mjs';
import {compareContinuity, firstBaseline, findingsOf, linkFindingsOf} from './lib/centreline-baseline.mjs';
import {splitPieces} from './lib/centreline-pieces.mjs';
import {surfaceLinkGap} from './lib/centreline-surface.mjs';
import {expand} from './lib/topology.mjs';
import {ARTERIES, VEINS, NERVES} from './topology-spec.mjs';

const LIMIT_MM = 3, REASON = '建立基準時已存在，未逐一人工核對';
const has = flag => process.argv.includes(flag), trial = has('--available');
const file = fileURLToPath(new URL('../docs/centreline-continuity-baseline.json', import.meta.url));
if (trial && (has('--init') || has('--write'))) { console.error('centreline continuity: --available is a trial and cannot make or change the baseline.'); process.exit(1); }

// The paokao package (connector pieces) is an index plus binary chunks; a trial leaves it out when either is not in this checkout, the real check needs it.
const models = new URL('../public/models/', import.meta.url), index = new URL('paokao/paokao-stream.json.gz', models);
const paokao = !trial || (fs.existsSync(index) && JSON.parse(gunzipSync(fs.readFileSync(index))).chunks.every(c => fs.existsSync(new URL(c.url.replace(/^\/models\//, ''), models))));
const w = loadWorld({paokao, allowMissing: trial}), cache = new Map(), t0 = Date.now();
if (!paokao) w.missing.push('paokao/paokao-stream (connector pieces)');
const partsOf = name => {
  if (!cache.has(name)) { const meshes = w.find(name).map(e => e.load()); cache.set(name, meshes.length ? {meshes, lines: linesOfMeshes(meshes)} : null); }
  return cache.get(name);
};
const toMm = v => v === null ? null : +(v * 1000).toFixed(1), rows = [], absent = [];
for (const rel of [...expand(ARTERIES, 'artery'), ...expand(VEINS, 'vein'), ...expand(NERVES, 'nerve')]) {
  const child = partsOf(rel.child), parent = partsOf(rel.parent);
  if (!child || !parent) { absent.push({child: rel.child, parent: rel.parent}); continue; }
  const g = relationGaps(child.meshes, parent.meshes, child.lines, parent.lines);
  // The surface distance decides; the centreline distance is kept only to tell where on the parent the child ends (null when a side gives no centreline).
  rows.push({child: rel.child, parent: rel.parent, surfaceMm: toMm(g.surface), attachMm: toMm(g.attach)});
}
// Every structure of the spec that has a mesh: the largest surface gap between its pieces, all its meshes taken together (null: one piece).
const links = [...cache].filter(([, parts]) => parts).map(([name, parts]) => ({name, linkMm: toMm(surfaceLinkGap(parts.meshes.flatMap(splitPieces)))}));
const apart = linkFindingsOf(links, LIMIT_MM);
const over = findingsOf(rows, LIMIT_MM), head = `centreline continuity: ${rows.length} relations measured, ${absent.length} without a mesh, ${over.length} over ${LIMIT_MM} mm; ${links.length} structures, ${apart.length} with pieces over ${LIMIT_MM} mm apart; in ${((Date.now() - t0) / 1000).toFixed(1)} s`;
const names = (title, keys) => { if (has('--list') && keys.length) { console.log(`  ${title}:`); for (const k of keys) console.log('    ' + k.split('|').slice(1).join(' -> ')); } };
const save = b => fs.writeFileSync(file, JSON.stringify(b, null, 1) + '\n');

if (trial) {
  console.log(`${head} (trial${w.missing.length ? ', left out: ' + w.missing.join(', ') : ''}; baseline not used)`);
  if (has('--list')) for (const f of over.sort((a, b) => b.measure - a.measure)) console.log(`    ${f.id} -> ${f.sub} | surface ${f.measure} mm, centreline ${f.attachMm ?? '—'} mm`);
  if (has('--list')) for (const f of apart.sort((a, b) => b.measure - a.measure)) console.log(`    ${f.id} | pieces ${f.measure} mm apart`);
} else if (has('--init')) {
  if (fs.existsSync(file)) { console.error('centreline continuity: a baseline exists; --init is refused (use --write to shrink it).'); process.exit(1); }
  save(firstBaseline(rows, absent, LIMIT_MM, REASON, links));
  console.log(`${head}; first baseline written.`);
} else {
  // A missing baseline is a failure, not a fresh start.
  if (!fs.existsSync(file)) { console.error(`${head}; no baseline (docs/centreline-continuity-baseline.json). FAILED`); process.exit(1); }
  const r = compareContinuity(JSON.parse(fs.readFileSync(file, 'utf8')), rows, absent, links);
  console.log(`${head}; new or worse ${r.bad.length}, mesh lost ${r.lost.length}, invalid ${r.invalid.length}, closed ${r.gone.length}, mesh now present ${r.back.length}`);
  names('new or worse', r.bad.map(f => f.key)); names('mesh lost', r.lost); names('invalid', r.invalid); names('closed', r.gone); names('mesh now present', r.back);
  if (!r.next) { console.error('centreline continuity: FAILED' + (has('--write') ? ' (baseline not changed)' : '')); process.exit(1); }
  if (has('--write')) { save(r.next); console.log('centreline continuity: baseline saved.'); }
  else if (r.gone.length || r.back.length) console.log('centreline continuity: passed; run with --write to record the improvements.');
  else console.log('centreline continuity: passed.');
}
