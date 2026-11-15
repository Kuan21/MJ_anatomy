// Joint stretch test (stability check e): the viewer's own solvers pose the body, then every triangle edge is compared with its rest length.
//   stretch   a triangle with an edge more than twice its rest length (and longer than 3 mm once posed)
//   detached  a vessel, nerve, tendon or ligament that touched a moving bone at rest and ends up more than 15 mm further from it than at rest, for at least 30 % of the points that touched it
// Poses: shoulder flexion 150, shoulder abduction 120, elbow flexion 140, forearm rotation to both ends, hip flexion 120 with knee flexion 130, head and neck flexion and extension.
import fs from 'node:fs';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {TriGrid} from './stability-geom.mjs';

const root = new URL('../../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
export const POSES = [
  {name: 'shoulder flexion 150', kind: 'arm', arm: {shoulderFlexion: 150}},
  {name: 'shoulder abduction 120', kind: 'arm', arm: {shoulderAbduction: 120}},
  {name: 'elbow flexion 140', kind: 'arm', arm: {elbowFlexion: 140}},
  {name: 'forearm rotation +80', kind: 'arm', arm: {forearmRotation: 80}},
  {name: 'forearm rotation -80', kind: 'arm', arm: {forearmRotation: -80}},
  {name: 'hip flexion 120 knee flexion 130', kind: 'leg', body: {flexion: 120, knee: 130}},
  {name: 'head flexion 40', kind: 'head', body: {flexion: 40}},
  {name: 'head extension 35', kind: 'head', body: {flexion: -35}},
];
export const STRETCH = 2, MIN_POSED = .003, DETACH = .015;

export async function loadMotion() {
  fs.mkdirSync(file('.sites-runtime'), {recursive: true});
  const out = file('.sites-runtime/stability-motion.mjs');
  await build({entryPoints: [file('scripts/lib/stability-entry.ts')], bundle: true, format: 'esm', platform: 'node', outfile: out, loader: {'.json': 'json'}, logLevel: 'error', external: ['three']});
  return import(out + '?t=' + Date.now());
}

const rigidApply = (t, src) => {
  const [qx, qy, qz, qw] = t.quaternion, [tx, ty, tz] = t.translation, out = new Float32Array(src.length);
  for (let i = 0; i < src.length; i += 3) {
    const x = src[i], y = src[i + 1], z = src[i + 2], ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
    out[i] = ix * qw + iw * -qx + iy * -qz - iz * -qy + tx; out[i + 1] = iy * qw + iw * -qy + iz * -qx - ix * -qz + ty; out[i + 2] = iz * qw + iw * -qz + ix * -qy - iy * -qx + tz;
  }
  return out;
};

/** Poses the whole body for each pose in POSES. `parts` = stability parts (with .part for atlas parts), `rest(p)` = rest geometry. Returns an async iterator of {pose, posed: Map(id -> Float32Array), moved: Set(bone ids)}. */
export function makePoser(m, atlas, geometry, parts, rest) {
  const inputs = atlas.parts.map(part => { const g = geometry(part); return {part, base: g.positions, normals: g.normals, triangles: g.indices}; });
  const softRigs = {left: m.makeSoftRig(atlas, 'left'), right: m.makeSoftRig(atlas, 'right')};
  const bodyRigs = {head: m.makeBodyRig(atlas, 'head'), leftLeg: m.makeBodyRig(atlas, 'leftLeg'), rightLeg: m.makeBodyRig(atlas, 'rightLeg'), spine: m.makeBodyRig(atlas, 'spine')};
  const solveArm = m.createShoulderSolver(atlas), solveBody = m.createBodySolver(atlas);
  const nerves = parts.filter(p => p.stream === 'nerve');
  const nerveRest = new Map();
  for (const n of nerves) nerveRest.set(n.id, rest(n).positions);
  const center = a => { let lo = [9, 9, 9], hi = [-9, -9, -9]; for (let i = 0; i < a.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], a[i + k]); hi[k] = Math.max(hi[k], a[i + k]); } return {x: (lo[0] + hi[0]) / 2, y: (lo[1] + hi[1]) / 2}; };
  const nerveBody = new Map();   // nerve id -> {region, skin}
  const headRe = /cervical|vagus|phrenic|hypoglossal|accessory|glossopharyngeal|ansa cervicalis|sympathetic trunk|superior cervical|middle cervical|inferior cervical/i;
  for (const n of nerves) {
    const base = nerveRest.get(n.id), c = center(base), region = m.bodyNerveBindings[n.raw] ?? (headRe.test(n.raw) ? 'head' : (l => l === 'leftLeg' || l === 'rightLeg' ? l : undefined)(m.inferredLimb(c)));
    if (region) nerveBody.set(n.id, {region, skin: m.bindBodyTissue(bodyRigs[region], base, m.cranialNerveRigid(n.raw))});
  }
  const nerveArm = new Map();
  for (const n of nerves) { const b = m.nerveBindings[n.raw]; if (b && softRigs[b.side]) { const base = nerveRest.get(n.id); nerveArm.set(n.id, {side: b.side, skin: m.bindTissue(softRigs[b.side], m.resolveNeurovascularProfile(n.raw, 'path'), base, undefined, n.raw, rest(n).indices)}); } }

  function* pose(pz) {
    const posed = new Map(), moved = new Set(), preview = new Map();
    const transformsOfBones = tr => { for (const [id, t] of Object.entries(tr)) { if (t.anchorTranslation) continue; posed.set(id, t); } };
    if (pz.kind === 'arm') {
      for (const side of ['left', 'right']) {
        const poseV = {...m.NEUTRAL_POSE, ...pz.arm}, {transforms} = m.buildUpperLimbMotion(atlas, side, poseV), gpu = [];
        const results = solveArm(inputs, transforms, gpu), palette = m.makePalette(softRigs[side], transforms);
        const sidePosed = new Map(); for (const r of results) sidePosed.set(r.id, r.positions);
        // linear bindings are skinned on the GPU in the viewer; the same arithmetic here
        const bound = new Map();
        for (const input of [...inputs.filter(i => !i.part.id.endsWith('-END')), ...inputs.filter(i => i.part.id.endsWith('-END'))]) {   // vessels before their end pieces, as in the worker
          const binding = m.tissueBindings[input.part.id];
          if (!binding || binding.name !== input.part.name || binding.side !== side || m.isMotionQuarantined(input.part) || !['upper-limb', 'trunk'].includes(m.anatomicalRegion(input.part))) continue;
          const profile = ['arterial', 'venous'].includes(input.part.system) ? m.resolveNeurovascularProfile(input.part.name, binding.profile) : binding.profile;
          const skin = m.bindTissue(softRigs[side], profile, input.base, input.part, '', input.triangles), mainId = input.part.id.endsWith('-END') ? input.part.id.slice(0, -4) : null, main = mainId && bound.get(mainId);
          if (main) m.alignEndPiece(skin, input.base, main.skin, main.base, undefined, input.triangles); else bound.set(input.part.id, {skin, base: input.base});
          // a solver-driven vessel and its end piece are solved by the worker; while a pose is dragged the viewer shows their weights only (the coarse preview)
          if (!m.isLinearBinding(skin) && ['arterial', 'venous'].includes(input.part.system)) { const o = new Float32Array(input.base.length); (skin.preview?.lbs ? m.lbsSkin : m.linearSkin)(skin.preview ?? skin, input.base, palette, o); preview.set(input.part.id, o); }
          if (m.isLinearBinding(skin) && !sidePosed.has(input.part.id)) { const o = new Float32Array(input.base.length); m.deformTissue(skin, input.base, palette, o); sidePosed.set(input.part.id, o); }
        }
        for (const [id, a] of sidePosed) posed.set(id, a);
        for (const [id, t] of Object.entries(transforms)) { if (!sidePosed.has(id) && !t.anchorTranslation) { const inp = inputs.find(i => i.part.id === id); if (inp) { posed.set(id, rigidApply(t, inp.base)); moved.add(id); } } }
        for (const [id, a] of nerveArm) if (a.side === side) { const base = nerveRest.get(id), o = new Float32Array(base.length); m.deformTissue(a.skin, base, palette, o); posed.set(id, o); }
      }
    } else {
      const regions = pz.kind === 'head' ? ['head'] : ['leftLeg', 'rightLeg'];
      for (const region of regions) {
        const bodyPose = {...m.BODY_NEUTRAL, ...pz.body}, motion = {region, pose: bodyPose}, body = m.buildBodyMotion(bodyRigs[region], bodyPose);
        for (const r of solveBody(inputs, motion)) posed.set(r.id, r.positions);
        for (const [id, t] of Object.entries(body.transforms)) { if (posed.has(id) || t.anchorTranslation) continue; const inp = inputs.find(i => i.part.id === id); if (inp) { posed.set(id, rigidApply(t, inp.base)); moved.add(id); } }
        for (const [id, nb] of nerveBody) if (nb.region === region) { const base = nerveRest.get(id), o = new Float32Array(base.length); m.deformTissue(nb.skin, base, body.palette, o); posed.set(id, o); }
      }
    }
    yield {pose: pz, posed, moved, preview};
  }
  return {pose: pz => pose(pz).next().value, nerveRest};
}

/** Triangles whose edge grew more than STRETCH times (and is longer than MIN_POSED once posed). */
export function stretched(rest, posed, indices) {
  let n = 0, worst = 1, worstLen = 0;
  const edge = (P, a, b) => Math.hypot(P[a * 3] - P[b * 3], P[a * 3 + 1] - P[b * 3 + 1], P[a * 3 + 2] - P[b * 3 + 2]);
  for (let i = 0; i < indices.length; i += 3) {
    let bad = false;
    for (let k = 0; k < 3; k++) {
      const a = indices[i + k], b = indices[i + (k + 1) % 3], r = edge(rest, a, b), p = edge(posed, a, b);
      if (!Number.isFinite(p)) { bad = true; worst = Infinity; continue; }
      if (p > MIN_POSED && p > STRETCH * Math.max(r, 1e-5)) { bad = true; const q = p / Math.max(r, 1e-5); if (q > worst) { worst = q; worstLen = p; } }
    }
    if (bad) n++;
  }
  return {n, worst, worstLen};
}

/** The viewer registers arm nerves onto the atlas landmarks before it shows them (registerNerveRest): do the same once, so every check sees the shape that is drawn. */
export function registerNerves(m, atlas, parts) {
  const rigs = {left: m.makeSoftRig(atlas, 'left'), right: m.makeSoftRig(atlas, 'right')};
  for (const p of parts) {
    if (p.stream !== 'nerve') continue;
    const b = m.nerveBindings[p.raw], raw = p.load; let cached = null;
    p.load = () => {
      if (cached) return cached;
      const g = raw(), positions = Float32Array.from(g.positions);
      if (b && rigs[b.side]) m.registerNerveRest(rigs[b.side], positions);
      return (cached = {positions, indices: g.indices});
    };
  }
}

/** Soft tubes (vessel, nerve, tendon, ligament) that touched a bone that moves at rest and are more than DETACH away from it in this pose. */
export function detached(parts, posedOf, restBoneGrid, boneRest, movedBones, boneNames) {
  const out = [], posedGrid = new TriGrid(.008);
  for (const [id, g] of boneRest) posedGrid.add(id, posedOf.get(id) || g.positions, g.indices);
  for (const p of parts) {
    if (!(['arterial', 'venous', 'tendon', 'connective'].includes(p.system) || (p.system === 'nervous' && !/brain|cerebr|spinal cord|medulla|pons|thalam/i.test(p.name)))) continue;
    const g = p.load(), pos = posedOf.get(p.id) || g.positions;
    const step = Math.max(3, Math.floor(g.positions.length / 3 / 300) * 3);
    let n = 0, near = 0, worst = 0, bone = null;
    for (let i = 0; i < g.positions.length; i += step) {
      const h = restBoneGrid.nearest(g.positions[i], g.positions[i + 1], g.positions[i + 2], .003); if (!h || !movedBones.has(h.owner)) continue;
      near++;
      const want = h.owner, x = pos[i], y = pos[i + 1], z = pos[i + 2];
      let q = posedGrid.nearest(x, y, z, .012 + h.d, o => o !== want);
      if (!q) { q = posedGrid.nearest(x, y, z, .06, o => o !== want); if (!q) q = {d: .06}; }
      if (q.d > h.d + DETACH) { n++; if (q.d - h.d > worst) { worst = q.d - h.d; bone = want; } }
    }
    if (near >= 3 && n >= 3 && n >= near * .3) out.push({id: p.id, name: p.name, measure: n, fraction: n / near, severity: Math.round(worst * 1000), detail: `${n} of ${near} points that touched ${boneNames.get(bone)} are up to ${(worst * 1000).toFixed(0)} mm away from it`});
  }
  return out;
}
export {TriGrid, rigidApply};
