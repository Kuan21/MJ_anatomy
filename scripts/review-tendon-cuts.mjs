// Renders each cut tendon (white) with its muscle part (red) and the bones around it, from front and back, for the review of the cut positions.
//   node scripts/review-tendon-cuts.mjs <outDir> [side=right] [key ...]
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadWorld} from './lib/paokao-world.mjs';
import {cutMuscle, mirrorName} from './lib/tendon-build.mjs';
import {UPPER_LIMB_TENDONS} from './tendon/upper-limb-cuts.mjs';

const [outDir, side = 'right', ...keys] = process.argv.slice(2);
if (!outDir) { console.error('usage: node scripts/review-tendon-cuts.mjs <outDir> [right|left] [key ...]'); process.exit(1); }
fs.mkdirSync(outDir, {recursive: true});
const w = loadWorld(), tmp = path.join(outDir, 'meshes'); fs.mkdirSync(tmp, {recursive: true});
for (const s of UPPER_LIMB_TENDONS) {
  if (keys.length && !keys.includes(s.key)) continue;
  const extra = []; let n = 0, all = {positions: [], indices: []};
  for (const name of s.parts.map(p => side === 'left' ? mirrorName(p) : p)) for (const e of w.find(name)) {
    const g = e.load(), r = cutMuscle(g.positions, g.indices, s); if (!r) { console.log('no cut', s.key, e.id); continue; }
    const b = path.join(tmp, `${s.key}-${n}-belly.json`), t = path.join(tmp, `${s.key}-${n}-tendon.json`);
    fs.writeFileSync(b, JSON.stringify({positions: Array.from(r.belly.positions), indices: Array.from(r.belly.indices)}));
    fs.writeFileSync(t, JSON.stringify({positions: Array.from(r.tendon.positions), indices: Array.from(r.tendon.indices)}));
    extra.push({file: b, name: `BELLY ${s.key}`, color: '#b5423a', opacity: 1}, {file: t, name: `TENDON ${s.key}`, color: '#ffffff', opacity: 1}); n++;
  }
  const bone = side === 'left' ? 'left' : 'right';
  const spec = {title: s.key, size: [620, 860], background: '#dfe5ea',
    context: [{match: `^${bone[0].toUpperCase() + bone.slice(1)} (radius|ulna|humerus|scapula|clavicle|scaphoid|lunate|triquetral|pisiform|trapezium|trapezoid|capitate|hamate|(first|second|third|fourth|fifth) metacarpal bone)$`, system: 'skeletal', color: '#c9c2a8', opacity: .55}],
    extra, views: [{name: 'a-front', around: `TENDON ${s.key}`, dir: [0, 0, 1], dist: .42, fov: 30}, {name: 'b-back', around: `TENDON ${s.key}`, dir: [0, 0, -1], dist: .42, fov: 30}]};
  const specFile = path.join(outDir, `${s.key}.spec.json`); fs.writeFileSync(specFile, JSON.stringify(spec));
  const dir = path.join(outDir, s.key);
  const r = spawnSync('node', ['scripts/render-preview.mjs', specFile, dir], {stdio: 'inherit'});
  if (r.status) process.exit(r.status);
}
