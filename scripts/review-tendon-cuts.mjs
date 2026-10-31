// Renders each cut tendon (white) with its muscle part (red) and the bones around it, from front and back, for the review of the cut positions.
//   node scripts/review-tendon-cuts.mjs <outDir> [right|left] [limb=upper|lower] [key ...]
// Uses the same cuts as the build (scripts/lib/tendon-set.mjs planCuts), so the images show what is packaged, including the split pieces and tendon ends moved onto their bones.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {planCuts, atlasParts, TENDON_SPECS} from './lib/tendon-set.mjs';

const [outDir, side = 'right', limb = 'upper', ...keys] = process.argv.slice(2);
if (!outDir) { console.error('usage: node scripts/review-tendon-cuts.mjs <outDir> [right|left] [upper|lower] [key ...]'); process.exit(1); }
fs.mkdirSync(outDir, {recursive: true});
const {parts, read} = atlasParts(), {results} = planCuts(parts, read), tmp = path.join(outDir, 'meshes'); fs.mkdirSync(tmp, {recursive: true});
const W = side === 'left' ? 'Left' : 'Right';
for (const spec of TENDON_SPECS) {
  if (!!spec.lower !== (limb === 'lower') || (keys.length && !keys.includes(spec.key))) continue;
  const r = results.find(x => x.spec === spec.key && x.side === W), extra = []; let n = 0;
  for (const p of r.pieces) {
    const bellyFile = path.join(tmp, `${spec.key}-${n}-belly.json`), tendonFile = path.join(tmp, `${spec.key}-${n}-tendon.json`);
    fs.writeFileSync(bellyFile, JSON.stringify({positions: Array.from(p.belly.positions), indices: Array.from(p.belly.indices)}));
    fs.writeFileSync(tendonFile, JSON.stringify({positions: Array.from(p.tendon.positions), indices: Array.from(p.tendon.indices)}));
    extra.push({file: bellyFile, name: `BELLY ${spec.key}`, color: '#b5423a', opacity: 1}, {file: tendonFile, name: `TENDON ${spec.key}`, color: '#ffffff', opacity: 1});
    if (p.apo) { const f = path.join(tmp, `${spec.key}-${n}-apo.json`); fs.writeFileSync(f, JSON.stringify({positions: Array.from(p.apo.positions), indices: Array.from(p.apo.indices)})); extra.push({file: f, name: `TENDON ${spec.key} split`, color: '#f2e6a8', opacity: 1}); }
    n++;
  }
  const bones = limb === 'lower' ? `(femur|tibia|fibula|patella|talus|calcaneus|navicular bone of ${side} foot|cuboid bone|(medial|intermediate|lateral) cuneiform bone|(first|second|third|fourth|fifth) metatarsal bone|(proximal|middle|distal) phalanx of ${side} .*toe|hip bone)` : '(radius|ulna|humerus|scapula|clavicle|scaphoid|lunate|triquetral|pisiform|trapezium|trapezoid|capitate|hamate|(first|second|third|fourth|fifth) metacarpal bone)';
  const spc = {title: spec.key, size: [620, 860], background: '#dfe5ea',
    context: [{match: limb === 'lower' ? `^(${W} ${bones}|${bones.replace(/^\(/, '(.*')})$` : `^${W} ${bones}$`, system: 'skeletal', color: '#c9c2a8', opacity: .55}],
    extra, views: [{name: 'a-front', around: `TENDON ${spec.key}`, dir: [0, 0, 1], dist: limb === 'lower' ? .5 : .42, fov: 30}, {name: 'b-back', around: `TENDON ${spec.key}`, dir: [0, 0, -1], dist: limb === 'lower' ? .5 : .42, fov: 30}, {name: 'c-side', around: `TENDON ${spec.key}`, dir: [side === 'left' ? -1 : 1, 0, 0], dist: limb === 'lower' ? .5 : .42, fov: 30}]};
  const specFile = path.join(outDir, `${spec.key}.spec.json`); fs.writeFileSync(specFile, JSON.stringify(spc));
  const rr = spawnSync('node', ['scripts/render-preview.mjs', specFile, path.join(outDir, spec.key)], {stdio: 'inherit'});
  if (rr.status) process.exit(rr.status);
}
