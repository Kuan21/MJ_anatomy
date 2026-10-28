// Lists every structure that no motion rule moves: not the skeleton frames, not the soft tissue (arm) bindings, not the head/spine/leg body rules, not the nerve bindings.
// Run: node scripts/audit-motion-followers.mjs [--check]   (--check fails when a structure outside docs/motion-static-allowed.json is left behind)
import fs from 'node:fs';
import zlib from 'node:zlib';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const tmp = file('.sites-runtime/audit-motion.mjs');
await build({entryPoints: [file('scripts/lib/motion-audit-entry.ts')], bundle: true, format: 'esm', platform: 'node', outfile: tmp, loader: {'.json': 'json'}, logLevel: 'error', external: ['three']});
const m = await import(tmp);
import {loadFullAtlas} from './lib/full-atlas.mjs';
const {atlas: full} = loadFullAtlas(), parts = full.parts;
const rigs = Object.fromEntries(['spine', 'head', 'leftLeg', 'rightLeg'].map(r => [r, m.makeBodyRig(full, r)]));
const armBoneIds = new Set(Object.values(m.boneBindings).flatMap(side => Object.values(side).flat().map(b => b.id)));
const rigTransforms = Object.fromEntries(Object.entries(rigs).map(([r, rig]) => [r, m.buildBodyMotion(rig, {...m.BODY_NEUTRAL, flexion: 20, rotation: 10, sideBend: 5, knee: 20, ankle: 5}).transforms]));
const rows = [];
for (const p of parts) {
  const by = [];
  for (const [r, rig] of Object.entries(rigs)) if (m.bodyPartRule(p, rig)) by.push(r);
  if (p.system === 'skeletal') { for (const [r, rig] of Object.entries(rigs)) if (rigTransforms[r][p.id]) by.push(r + '-bone'); if (armBoneIds.has(p.id)) by.push('armbone'); }
  const tb = m.tissueBindings[p.id]; if (tb && tb.name === p.name && !m.isMotionQuarantined(p) && ['upper-limb', 'trunk'].includes(m.anatomicalRegion(p))) by.push('arm');
  if (m.nerveBindings[p.name] || m.bodyNerveBindings?.[p.name]) by.push('nerve');
  if (!by.length) rows.push({id: p.id, name: p.name, system: p.system, stream: p.stream || 'atlas', region: m.anatomicalRegion(p), side: m.anatomicalSide(p), y: +((p.bounds[0][1] + p.bounds[1][1]) / 2).toFixed(3)});
}
const out = file('docs/motion-unfollowed.json'); fs.writeFileSync(out, JSON.stringify(rows, null, 1));
const allowed = JSON.parse(fs.readFileSync(file('docs/motion-static-allowed.json'), 'utf8')).map(a => new RegExp(a.name, 'i'));
const stuck = rows.filter(r => !allowed.some(re => re.test(r.name)) && !(r.system === 'skeletal' && /^(Right|Left) (iliac crest|pubic tubercle|ischial tuberosity|spine of ischium)$/.test(r.name)));
const tally = {}; for (const r of rows) { const k = `${r.stream}/${r.system}/${r.region}`; tally[k] = (tally[k] || 0) + 1; }
console.log(`${rows.length} of ${parts.length} parts are moved by no rule`); console.table(tally);
if (process.argv.includes('--check')) {
  if (stuck.length) { console.log(stuck.slice(0, 40).map(r => `${r.id} ${r.name} (${r.system}, ${r.region})`).join('\n')); console.error(`${stuck.length} structures are moved by no motion rule (docs/motion-unfollowed.json); bind them or list them in docs/motion-static-allowed.json`); process.exit(1); }
  console.log('PASS motion followers audit: every structure is moved by a rule or listed as static on purpose');
}
