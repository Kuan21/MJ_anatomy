// Upper-limb pose audit: poses the whole arm with the viewer's own solvers (the ones check-stability.mjs uses) and reports, per structure, what tears (see scripts/lib/limb-audit.mjs for the four measures).
// usage: node scripts/audit-limb-pose.mjs [--set=reported|sweep|all] [--pose=name] [--top=15] [--json=out.json] [--fail-on-tears]
//   reported: the three poses of the bug report (shoulder flexion 97; flexion 73 + abduction 158; internal rotation 48 + elbow flexion 129 + wrist flexion 80)
//   sweep:    every slider at its minimum and at its maximum, one at a time
// Prints counts and structure names only.
import fs from 'node:fs';
import {createAudit, REPORTED, SEAM_MAX} from './lib/limb-audit.mjs';
const arg = (n, d) => process.argv.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? d;
const set = arg('set', 'reported'), only = arg('pose'), top = +arg('top', 15), jsonOut = arg('json'), failOn = process.argv.includes('--fail-on-tears');
const {audit, limits} = await createAudit();
const sweep = [];
for (const [k, [lo, hi]] of Object.entries(limits)) { if (!/^(shoulder|elbow|forearm|wrist)/.test(k)) continue; if (lo !== 0) sweep.push({name: `${k} ${lo}`, arm: {[k]: lo}}); sweep.push({name: `${k} ${hi}`, arm: {[k]: hi}}); }
const poses = (set === 'reported' ? REPORTED : set === 'sweep' ? sweep : [...REPORTED, ...sweep]).filter(p => !only || p.name === only);
const all = []; let tears = 0;
for (const pz of poses) {
  const res = audit(pz); all.push(res); const by = c => res.rows.filter(r => r.check === c), badSeams = res.seams.filter(s => s.mean > SEAM_MAX);
  tears += by('tear').length + badSeams.length;
  console.log(`\n## ${pz.name}: visible tears ${by('tear').length} (${by('tear').reduce((n, r) => n + r.measure, 0)} edges), stretch>2x ${by('stretch').length}, detached ${by('detached').length}, end pieces off their vessel ${badSeams.length}/${res.seams.length}`);
  for (const c of ['tear', 'stretch', 'detached']) for (const r of by(c).sort((a, b) => (b.fraction - a.fraction) || (b.severity - a.severity)).slice(0, top)) console.log(`  ${c.padEnd(8)} ${r.kind.padEnd(9)} ${String(r.profile).padEnd(13)} ${r.name}  ${c === 'detached' ? `${(r.fraction * 100).toFixed(0)}% of contact points, up to ${r.severity} mm away` : c === 'tear' ? `${r.measure} edges over 3x and 15 mm, longest ${r.severity} mm` : `${r.measure} triangles (${(r.fraction * 100).toFixed(1)}%), worst edge x${r.severity}`}`);
  for (const s of badSeams.slice(0, top)) console.log(`  seam     ${s.name}  end piece ${(s.mean * 1000).toFixed(0)} mm from its vessel on average (up to ${(s.max * 1000).toFixed(0)} mm)`);
}
console.log(`\nTotal visible tears + displaced end pieces: ${tears} over ${poses.length} pose(s).`);
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(all));
if (failOn && tears) process.exit(1);
