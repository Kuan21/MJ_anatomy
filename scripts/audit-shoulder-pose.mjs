// Right/left arm at the limit poses of the review: which soft structures near the shoulder are left behind, which are stretched into spikes.
// Usage: node scripts/audit-shoulder-pose.mjs [--check]   (writes docs/shoulder-motion/pose-audit.json)
import fs from 'node:fs';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
fs.mkdirSync(file('.sites-runtime'), {recursive: true});
const out = file('.sites-runtime/motion-followers.mjs');
await build({entryPoints: [file('scripts/lib/motion-audit-entry.ts')], bundle: true, format: 'esm', platform: 'node', outfile: out, loader: {'.json': 'json'}, logLevel: 'error', external: ['three']});
const m = await import(out);
const {atlas, geometry} = loadFullAtlas();
const inputs = atlas.parts.map(part => {const g = geometry(part); return {part, base: g.positions, normals: g.normals, triangles: g.indices};});
const solveArm = m.createShoulderSolver(atlas), U = m.MOTION_LIMITS;
const POSES = {
  'abduction-168': {shoulderAbduction: 168},
  'rotation48-elbow140': {shoulderRotation: 48, elbowFlexion: 140},
};
const humerusTop = sd => {const h = atlas.parts.find(p => new RegExp(`^${sd} humerus$`, 'i').test(p.name)); return [(h.bounds[0][0] + h.bounds[1][0]) / 2, h.bounds[1][1], (h.bounds[0][2] + h.bounds[1][2]) / 2];};
const rigShoulder = sd => humerusTop(sd[0].toUpperCase() + sd.slice(1));
const report = {};
for (const side of ['right', 'left']) for (const [name, p] of Object.entries(POSES)) {
  const pose = {...m.NEUTRAL_POSE, ...p}, {transforms} = m.buildUpperLimbMotion(atlas, side, pose), gpu = [];
  const results = solveArm(inputs, transforms, gpu), byId = new Map(results.map(r => [r.id, r]));
  const mine = inputs.filter(i => m.anatomicalRegion(i.part) === 'upper-limb' && m.anatomicalSide(i.part) === side && !m.isMotionQuarantined(i.part));
  const rows = [];
  for (const i of inputs) {
    const sys = i.part.system, r = byId.get(i.part.id), tf = transforms[i.part.id];
    const region = m.anatomicalRegion(i.part), sd = m.anatomicalSide(i.part);
    const near = (() => {const c = i.part.bounds[0].map((v, k) => (v + i.part.bounds[1][k]) / 2), s = rigShoulder(side); return Math.hypot(c[0] - s[0], c[1] - s[1], c[2] - s[2]) < .26;})();
    if (!near || sys === 'skeletal' || sys === 'integumentary') continue;
    let moved = 0, stretch = 1, spikes = 0;
    if (r) {
      for (let k = 0; k < i.base.length; k++) moved = Math.max(moved, Math.abs(r.positions[k] - i.base[k]));
      // edge stretch: how much longer than at rest does any edge become
      const T = i.triangles; let worst = 1, bad = 0;
      for (let t = 0; t < T.length; t += 3) for (let e = 0; e < 3; e++) {
        const a = T[t + e], b = T[t + (e + 1) % 3];
        const l0 = Math.hypot(i.base[a * 3] - i.base[b * 3], i.base[a * 3 + 1] - i.base[b * 3 + 1], i.base[a * 3 + 2] - i.base[b * 3 + 2]);
        const l1 = Math.hypot(r.positions[a * 3] - r.positions[b * 3], r.positions[a * 3 + 1] - r.positions[b * 3 + 1], r.positions[a * 3 + 2] - r.positions[b * 3 + 2]);
        if (l0 > 1e-5) {const q = l1 / l0; if (q > worst) worst = q; if (q > 3 && l1 > .02) bad++;}
      }
      stretch = worst; spikes = bad;
    }
    rows.push({id: i.part.id, name: i.part.name, system: sys, region, side: sd, solvedOnCpu: !!r, inGpuList: gpu.some(g => g.id === i.part.id), hasTransform: !!tf, movedMm: +(moved * 1000).toFixed(1), maxEdgeStretch: +stretch.toFixed(2), longStretchedEdges: spikes});
  }
  
  report[`${side}:${name}`] = {
    leftBehind: rows.filter(r => !r.solvedOnCpu && !r.inGpuList && !r.hasTransform).map(r => `${r.name} [${r.system}, ${r.region}/${r.side}]`),
    stretched: rows.filter(r => r.longStretchedEdges > 0).sort((a, b) => b.maxEdgeStretch - a.maxEdgeStretch).map(r => `${r.name} [${r.system}] x${r.maxEdgeStretch} (${r.longStretchedEdges} edges)`),
  };
}
fs.mkdirSync(file('docs/shoulder-motion'), {recursive: true});
fs.writeFileSync(file('docs/shoulder-motion/pose-audit.json'), JSON.stringify(report, null, 1));
for (const [k, v] of Object.entries(report)) {console.log(`== ${k}: ${v.leftBehind.length} left behind, ${v.stretched.length} stretched`); console.log(' left behind:', v.leftBehind.slice(0, 40).join(' | ')); console.log(' stretched:', v.stretched.slice(0, 30).join(' | '));}
