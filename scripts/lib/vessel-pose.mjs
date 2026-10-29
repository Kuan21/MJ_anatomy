// Poses vessel meshes (and bones) like the viewer: arm structures through the soft-tissue bindings and the shoulder/elbow/wrist transforms, leg structures through the body rig.
// Shared by scripts/test-vessel-motion.mjs and scripts/render-vessel-views.mjs.
import esbuild from 'esbuild';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

const root = new URL('../../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
export async function loadPoseModule() {
  fs.mkdirSync(file('.sites-runtime'), {recursive: true});
  const out = file('.sites-runtime/vessel-pose.mjs');
  await esbuild.build({entryPoints: [file('scripts/lib/vessel-pose-entry.ts')], bundle: true, format: 'esm', platform: 'node', outfile: out, loader: {'.json': 'json'}, logLevel: 'error', external: ['three']});
  return import(out + '?t=' + Date.now());
}

/** {skinOf, posed, geo, armRig, legRig, context}: `V` from loadVessels, `m` from loadPoseModule. */
export function createPoser(V, m) {
  const {atlas} = V;
const geo = id => V.g(V.byId.get(id));
const skins = new Map();
const rigs = {};
const armRig = side => rigs['arm' + side] ??= m.makeSoftRig(atlas, side);
const legRig = region => rigs[region] ??= m.makeBodyRig(atlas, region);
function skinOf(part, kind, key) {
  const k = part.id + key; if (skins.has(k)) return skins.get(k);
  const g = geo(part.id); let s = null;
  if (kind === 'arm') { const b = m.tissueBindings[part.id]; if (b && b.name === part.name) { try { s = {skin: m.bindTissue(armRig(key), m.resolveNeurovascularProfile(part.name, b.profile), g.pos, part, '', g.idx)}; } catch { s = null; } } }
  else { const b = m.bodyBindings[part.id]; if (b && b.name === part.name && b.rig === key) s = b.frame === null ? {skin: m.bindBodyTissue(legRig(key), g.pos, false, part)} : {frame: b.frame}; }
  skins.set(k, s); return s;
}
const posedCache = new Map();
function posed(partId, kind, key, poseKey, ctx) {
  const ck = partId + '|' + key + '|' + poseKey; if (posedCache.has(ck)) return posedCache.get(ck);
  const part = V.byId.get(partId), g = geo(partId), s = skinOf(part, kind, key); let out = g.pos;
  if (s) {
    out = new Float32Array(g.pos.length);
    if (s.skin) m.deformTissue(s.skin, g.pos, ctx.palette, out);
    else for (let i = 0; i < g.pos.length; i += 3) { const v = {x: g.pos[i], y: g.pos[i + 1], z: g.pos[i + 2]}, e = ctx.matrices[s.frame].elements; out[i] = e[0] * v.x + e[4] * v.y + e[8] * v.z + e[12]; out[i + 1] = e[1] * v.x + e[5] * v.y + e[9] * v.z + e[13]; out[i + 2] = e[2] * v.x + e[6] * v.y + e[10] * v.z + e[14]; }
  }
  posedCache.set(ck, out); return out;
}

  /** palette and matrices for a pose of one side: kind 'arm' ('left'/'right') or 'leg' ('leftLeg'/'rightLeg') */
  const context = (kind, key, pose) => {
    if (kind === 'arm') { const {transforms} = m.buildUpperLimbMotion(atlas, key, {...m.NEUTRAL_POSE, ...pose}); return {palette: m.makePalette(armRig(key), transforms), transforms}; }
    const built = m.buildBodyMotion(legRig(key), {...m.BODY_NEUTRAL, ...pose}); return {palette: built.palette, matrices: built.matrices};
  };
  return {skinOf, posed, geo, armRig, legRig, context};
}
