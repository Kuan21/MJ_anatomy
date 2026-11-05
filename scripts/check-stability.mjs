// Stability checks (CI and npm run check): fragments, penetration of bones, z-fighting, cut-open meshes, and joint stretch / detachment in the limit poses.
// Existing violations of main are registered one by one in docs/stability-known.json (with the reason). A new violation, a worse one, or a known one that is gone fails;
// the list may only shrink. CI and logs print counts and pass/fail only; --list prints the structure names, --write (alias --shrink) only lowers/removes reviewed exceptions and regenerates docs/stability-baseline.md.
//   node scripts/check-stability.mjs [--only=fragments,penetration,zfight,cuts,motion] [--list] [--write]
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadStabilityParts} from './lib/stability-world.mjs';
import {fragments, penetration, zfight, cuts} from './lib/stability-static.mjs';
import {loadMotion, registerNerves, makePoser, stretched, detached, POSES} from './lib/stability-motion.mjs';
import {TriGrid} from './lib/stability-geom.mjs';
import {compareBaseline} from './lib/stability-baseline.mjs';

const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const arg = n => process.argv.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3), flag = n => process.argv.includes(`--${n}`);
const ALL = ['fragments', 'penetration', 'zfight', 'cuts', 'stretch', 'detached'];
const only = [...new Set((arg('only') ?? ALL.join(',')).split(',').flatMap(c => c === 'motion' ? ['stretch', 'detached'] : [c]))];
if (only.some(c => !ALL.includes(c))) throw new Error('Unknown stability check.');
const write = flag('write') || flag('shrink'), list = flag('list'), t0 = Date.now(), log = s => { if (list || write) console.log(s); };
const knownFile = file('docs/stability-known.json'), baselineFile = file('docs/stability-baseline.md');

// A missing baseline must not silently bootstrap new exceptions.
const previous = JSON.parse(fs.readFileSync(knownFile, 'utf8'));
if (!previous.known || typeof previous.known !== 'object' || Array.isArray(previous.known)) throw new Error('Invalid stability baseline.');

const {atlas, geometry, parts} = loadStabilityParts();
const needMotion = only.includes('stretch') || only.includes('detached');
const m = await loadMotion();
registerNerves(m, atlas, parts);
const findings = [];

if (only.includes('fragments')) findings.push(...fragments(parts, log));
if (only.includes('penetration')) findings.push(...penetration(parts, log));
if (only.includes('zfight')) findings.push(...zfight(parts, log));
if (only.includes('cuts')) findings.push(...cuts(parts, log));

if (needMotion) {
  const byId = new Map(parts.map(p => [p.id, p]));
  const bones = parts.filter(p => p.system === 'skeletal'), boneRest = new Map(bones.map(b => [b.id, b.load()])), boneNames = new Map(bones.map(b => [b.id, b.name]));
  const restBoneGrid = new TriGrid(.008); for (const [id, g] of boneRest) restBoneGrid.add(id, g.positions, g.indices);
  const poser = makePoser(m, atlas, geometry, parts, p => p.load());
  for (const pz of POSES) {
    const {posed, moved} = poser.pose(pz);
    if (only.includes('stretch')) {
      for (const [id, pos] of posed) {
        const p = byId.get(id); if (!p || p.system === 'skeletal') continue;
        const g = p.load(); if (pos.length !== g.positions.length) continue;
        let d = 0; for (let i = 0; i < pos.length; i += 7) d = Math.max(d, Math.abs(pos[i] - g.positions[i])); if (d < 1e-4) continue;
        const r = stretched(g.positions, pos, g.indices);
        if (r.n) findings.push({check: 'stretch', id, name: p.name, sub: pz.name, measure: r.n, detail: `${r.n} triangles with an edge over 2x its rest length (worst x${Number.isFinite(r.worst) ? r.worst.toFixed(1) : 'non-finite'}) at ${pz.name}`});
      }
    }
    if (only.includes('detached')) {
      const movedBones = new Set([...moved].filter(id => boneRest.has(id)));
      for (const id of movedBones) { /* rigid bones only */ }
      for (const f of detached(parts, posed, restBoneGrid, boneRest, movedBones, boneNames)) findings.push({check: 'detached', sub: pz.name, ...f, detail: f.detail + ` at ${pz.name}`});
    }
    log(`pose ${pz.name}: done (${findings.length} findings so far)`);
  }
}

if (arg('dump')) fs.writeFileSync(arg('dump'), JSON.stringify(findings));
const keyOf = f => `${f.check}|${f.id}${f.sub ? '|' + f.sub : ''}`;
for (const f of findings) f.key = keyOf(f);
findings.sort((a, b) => a.key < b.key ? -1 : 1);

const result = compareBaseline(previous.known, findings, only);
if (write && !result.next) {
  console.error(`Stability update refused: ${result.bad.length} new or worse, ${result.invalid.length} invalid finding(s). No baseline files changed.`);
  process.exit(1);
}
if (write) {
  const known = result.next;
  fs.writeFileSync(knownFile, JSON.stringify({...previous, known}, null, 1));
  const by = {}; for (const [key, entry] of Object.entries(known)) (by[key.split('|')[0]] ??= []).push({...entry, detail: entry.reason});
  const titles = {fragments: 'Fragments', penetration: 'Vessel, nerve and tendon walls inside bone', zfight: 'Coincident faces (z-fighting)', cuts: 'Straight cuts in meshes', stretch: 'Triangle stretch over 2x in the limit poses', detached: 'Structures that leave their bone in the limit poses'};
  let md = `# Stability baseline\n\nGenerated by \`node scripts/check-stability.mjs --write\`. Only structure names and numbers. Each line is a known violation registered in \`docs/stability-known.json\` (with its reason); the list may only shrink.\n\nChecks and thresholds (rest pose unless stated; lengths in millimetres): fragments = a piece of a mesh at least 8 from every other piece and under half of its size, or a whole structure with no other mesh within 20 to 40; bone penetration = a vertex of a vessel or nerve wall at least 2 deep inside a bone (tendon 3), three or more vertices; z-fighting = faces of two meshes that face the same way, lie within 0.15 of one plane and within 6 of each other, at least 40 faces and 25 % of the smaller mesh; cuts = an open boundary with a straight run of 15 or more, plus the places in the app that set a renderer clipping plane; stretch = a triangle edge that is more than 2 times its rest length (and over 3 once posed) in a limit pose; leaving the bone = at least 30 % of the points of a vessel, nerve, tendon or ligament that touched a moving bone are 15 or more further from it than at rest.\n\nPoses: shoulder flexion 150, shoulder abduction 120, elbow flexion 140, forearm rotation to both ends (80), hip flexion 120 with knee flexion 130, head flexion 40 and extension 35.\n\n| check | violations |\n|---|---|\n` + ALL.map(c => `| ${titles[c]} | ${(by[c] ?? []).length} |`).join('\n') + '\n';
  for (const c of ALL) { if (!by[c]) continue; md += `\n## ${titles[c]} (${by[c].length})\n\n| structure | size | detail |\n|---|---|---|\n` + by[c].map(f => `| ${f.name} | ${f.measure} | ${f.detail.replace(/\|/g, '/')} |`).join('\n') + '\n'; }
  fs.writeFileSync(baselineFile, md);
  console.log(`Stability: ${Object.keys(known).length} known violations written (shrink only).`);
  process.exit(0);
}

const {bad, gone, invalid} = result;
if (list) { for (const f of findings) console.log(`${f.key.startsWith('') ? f.check : ''}: ${f.name} [${f.measure}] ${f.detail}`); }
const tally = Object.fromEntries(only.map(c => [c, findings.filter(f => f.check === c).length]));
const secs = Math.round((Date.now() - t0) / 1000);
if (bad.length || gone.length || invalid.length) {
  console.error(`Stability FAIL: ${bad.length} new or worse violation(s), ${invalid.length} invalid finding(s), ${gone.length} known violation(s) already fixed (remove them from docs/stability-known.json). Counts: ${JSON.stringify(tally)}`);
  if (list) { for (const f of bad) console.error(' new/worse: ' + f.key + ' ' + f.detail); for (const k of gone) console.error(' fixed: ' + k); }
  else console.error('Run with --list for the structure names.');
  process.exit(1);
}
console.log(`Stability OK: ${findings.length} known violations, none new (${only.map(c => `${c} ${tally[c]}`).join(', ')}; ${secs}s).`);
