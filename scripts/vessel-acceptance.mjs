// Vessel acceptance numbers for a vessel PR (ROADMAP section 4). Prints one table and, on GitHub Actions, writes it to the job summary.
//   gaps       end gap larger than half the vessel's diameter           (new vessel tree: scripts/check-leg-vessel-tree.mjs 'start on parent' / 'end on joined vessel' / 'pieces')
//   bones      centreline inside a bone more than 2 mm                  (new tree: 'inside bone' / 'bone wall')
//   diameter   adjacent segments wider than 1.5 x                       (new tree: 'wider than parent' / 'wider than joined vessel' / 'taper')
//   tangent    end-to-end tangent error larger than 45 degrees         (site meshes only; the new tree is built from smooth centrelines)
// Two blocks: "new tree" = docs/leg-vessel-tree-baseline.json known exceptions (must stay empty), "site meshes" = the vessels the viewer still shows (lower limb).
// Reasons for every anatomical exception go in docs/vessel-acceptance-exclusions.json ({"gaps":[{"key":"id|neighbourId|kind","reason":"..."}], ...}); an entry without a reason fails.
//   node scripts/vessel-acceptance.mjs [--strict]    --strict exits 1 when any number is not 0 after exclusions (use it on PRs that replace vessels)
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {measure} from './lib/vessel-segment-report.mjs';

const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const strict = process.argv.includes('--strict');
const readJson = (f, d) => fs.existsSync(file(f)) ? JSON.parse(fs.readFileSync(file(f), 'utf8')) : d;

const excl = readJson('docs/vessel-acceptance-exclusions.json', {});
const badReason = Object.values(excl).flat().filter(e => !e?.reason || String(e.reason).trim().length < 8);
const skip = kind => new Set((excl[kind] ?? []).map(e => e.key));
const pairKey = r => `${r.id}|${r.neighbourId}|${r.kind}`;

// new tree: every known exception is a failed check, grouped by check name (key is "vessel|check")
const known = Object.keys(readJson('docs/leg-vessel-tree-baseline.json', {known: {}}).known ?? {});
const treeCount = names => known.filter(k => names.includes(k.split('|')[1])).length;
const tree = {
  gaps: treeCount(['start on parent', 'end on joined vessel', 'pieces']),
  bones: treeCount(['inside bone', 'bone wall']),
  diameter: treeCount(['wider than parent', 'wider than joined vessel', 'taper']),
  tangent: 0,
};

// site meshes, lower limb
const m = (await measure(['lower'])).lower;
const left = (rows, kind) => rows.filter(r => !skip(kind).has(pairKey(r))).length;
const site = {gaps: left(m.gaps, 'gaps'), bones: null, diameter: left(m.diameter, 'diameter'), tangent: left(m.tangent, 'tangent')};

const cell = v => v == null ? 'n/a (see check-leg-vessel-tree)' : String(v);
const rows = [
  ['End gap > half diameter', 'gaps'], ['Centreline in bone > 2 mm', 'bones'], ['Adjacent diameter ratio > 1.5', 'diameter'], ['Tangent error > 45 deg', 'tangent'],
].map(([label, k]) => `| ${label} | ${cell(tree[k])} | ${cell(site[k])} |`);
const table = ['| Check | New vessel tree | Site meshes (lower limb) |', '| --- | ---: | ---: |', ...rows].join('\n');
console.log(table);
const nExcl = Object.values(excl).flat().length;
console.log(`Exclusions listed: ${nExcl}${badReason.length ? `, ${badReason.length} without a reason` : ''}.`);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Vessel acceptance numbers\n\n${table}\n\nExclusions listed: ${nExcl}.\n`);

const bad = Object.values(tree).some(v => v) || Object.values(site).some(v => v) || badReason.length > 0;
if (strict && bad) { console.error('Vessel acceptance: not 0 (see table).'); process.exit(1); }
console.log(strict ? 'PASS vessel acceptance.' : 'Vessel acceptance measured (not strict).');
