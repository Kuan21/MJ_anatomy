// How the vessels / nerves / connective sheets of the shoulder girdle deform at a limit pose: longest edge stretch (a vessel torn into shards has edges many times longer than at rest).
// Usage: node scripts/audit-vessel-motion.mjs [flexion|abduction] [angle] [--check]
import {build} from 'esbuild';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
fs.mkdirSync(file('.sites-runtime'), {recursive: true});
const out = file('.sites-runtime/vessel-motion.mjs');
await build({entryPoints: [file('scripts/lib/vessel-motion-entry.ts')], bundle: true, format: 'esm', platform: 'node', outfile: out, loader: {'.json': 'json'}, logLevel: 'error', external: ['three']});
const m = await import(out);
const {atlas, geometry} = loadFullAtlas();
const kind = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'flexion', angle = +(process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : 180);
const pose = {...m.NEUTRAL_POSE, [kind === 'flexion' ? 'shoulderFlexion' : 'shoulderAbduction']: angle};
const side = 'left', {transforms} = m.buildUpperLimbMotion(atlas, side, pose);
const rig = m.makeSoftRig(atlas, side), palette = m.makePalette(rig, transforms);
const rows = [];
for (const p of atlas.parts) {
  if (!['arterial', 'venous', 'nervous', 'lymphatic', 'connective', 'muscular'].includes(p.system)) continue;
  const b = m.tissueBindings[p.id]; if (!b || b.name !== p.name) continue;
  const rg = m.anatomicalRegion(p), sd = m.anatomicalSide(p); if (!['upper-limb', 'trunk'].includes(rg) || m.isMotionQuarantined(p)) continue;
  const bs = sd === 'midline' ? b.side : sd; if (bs !== side) continue;
  const g = geometry(p), base = g.positions;
  const profile = (p.system === 'arterial' || p.system === 'venous') ? m.resolveNeurovascularProfile(p.name, b.profile) : b.profile;
  let skin; try { skin = m.bindTissue(rig, profile, base, p, '', g.indices); } catch (e) { rows.push({name: p.name, system: p.system, profile, error: e.message}); continue; }
  const posed = new Float32Array(base.length); m.deformTissue(skin, base, palette, posed);
  let worst = 1, bad = 0, moved = 0; const T = g.indices;
  for (let k = 0; k < base.length; k++) moved = Math.max(moved, Math.abs(posed[k] - base[k]));
  for (let t = 0; t < T.length; t += 3) for (let e = 0; e < 3; e++) {
    const a = T[t + e], c = T[t + (e + 1) % 3];
    const l0 = Math.hypot(base[a*3]-base[c*3], base[a*3+1]-base[c*3+1], base[a*3+2]-base[c*3+2]), l1 = Math.hypot(posed[a*3]-posed[c*3], posed[a*3+1]-posed[c*3+1], posed[a*3+2]-posed[c*3+2]);
    if (l0 > 1e-5) { const q = l1 / l0; if (q > worst) worst = q; if (q > 2.5 && l1 > .01) bad++; }
  }
  rows.push({name: p.name, system: p.system, profile, movedMm: +(moved * 1000).toFixed(0), maxStretch: +worst.toFixed(2), badEdges: bad});
}
rows.sort((a, b) => (b.maxStretch || 0) - (a.maxStretch || 0));
console.log(`${kind} ${angle}: ${rows.length} structures, ${rows.filter(r => r.badEdges > 0).length} with edges stretched >2.5x`);
for (const r of rows.slice(0, 45)) console.log(`${r.system}\t${r.profile}\tx${r.maxStretch}\t${r.badEdges} edges\tmoved ${r.movedMm}mm\t${r.name}${r.error ? ' ERROR ' + r.error : ''}`);
