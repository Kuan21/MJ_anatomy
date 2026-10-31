// Counts how much of each cut tendon lies inside a bone of the same limb (a tendon must run over a bone, never through it) and how far its ends are from the bone they attach to.
//   node scripts/audit-tendon-collisions.mjs [--check] [limb=lower|upper] [key ...]
// A vertex is "inside" when it is more than 0.5 mm behind the surface of the nearest bone (negative side of the outward normal). Prints one line per tendon; with --check, exits 1 above the limit.
import {planCuts, atlasParts, TENDON_SPECS} from './lib/tendon-set.mjs';
import {meshOf, closest} from './lib/heart-geom.mjs';

const args = process.argv.slice(2), check = args.includes('--check'), rest = args.filter(a => a !== '--check'), limb = rest[0] === 'upper' ? 'upper' : 'lower', keys = rest.slice(rest[0] === 'upper' || rest[0] === 'lower' ? 1 : 0);
const {parts, read} = atlasParts(), {results} = planCuts(parts, read);
const boneRe = limb === 'lower' ? /^(Left|Right) (femur|tibia|fibula|patella|talus|calcaneus|cuboid bone|navicular bone|(medial|intermediate|lateral) cuneiform bone|(first|second|third|fourth|fifth) metatarsal bone)$|phalanx of (left|right) .*toe|navicular bone of (left|right) foot|^(Left|Right) hip bone$/ : /^(Left|Right) (radius|ulna|humerus|scapula|clavicle)$/;
const bones = parts.filter(p => p.system === 'skeletal' && boneRe.test(p.name)).map(p => { const g = read(p); return {name: p.name, mesh: meshOf(g.positions, g.indices)}; });
let worst = 0;
for (const r of results) {
  const spec = TENDON_SPECS.find(s => s.key === r.spec); if (!!spec.lower !== (limb === 'lower') || (keys.length && !keys.includes(spec.key)) || r.side !== 'Right') continue;
  for (const [label, pick] of [['tendon', p => p.tendon], ['split', p => p.apo]]) for (const p of r.pieces) {
    const t = pick(p); if (!t) continue;
    let inside = 0, deepest = 0, n = t.positions.length / 3;
    for (let v = 0; v < n; v++) {
      const q = [t.positions[v * 3], t.positions[v * 3 + 1], t.positions[v * 3 + 2]]; let best = null;
      for (const b of bones) { if (q[0] < b.mesh.lo[0] - .01 || q[0] > b.mesh.hi[0] + .01 || q[1] < b.mesh.lo[1] - .01 || q[1] > b.mesh.hi[1] + .01 || q[2] < b.mesh.lo[2] - .01 || q[2] > b.mesh.hi[2] + .01) continue; const c = closest(b.mesh, q); if (!best || c.d < best.d) best = {...c, bone: b.name}; }
      if (!best) continue;
      const signed = (q[0] - best.point[0]) * best.normal[0] + (q[1] - best.point[1]) * best.normal[1] + (q[2] - best.point[2]) * best.normal[2];
      if (signed < -.0005) { inside++; deepest = Math.max(deepest, -signed * 1000); }
    }
    const pct = inside / n * 100; worst = Math.max(worst, pct);
    console.log(`${spec.key.padEnd(20)} ${label.padEnd(7)} ${p.name.slice(0, 30).padEnd(31)} vertices ${String(n).padStart(5)}  inside bone ${pct.toFixed(1).padStart(5)} %  deepest ${deepest.toFixed(1)} mm`);
  }
}
if (check && worst > 5) { console.error(`tendon audit: up to ${worst.toFixed(1)} % of a tendon lies inside a bone`); process.exit(1); }
