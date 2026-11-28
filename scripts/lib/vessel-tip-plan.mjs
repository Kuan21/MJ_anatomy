// Which vessel ends get a smooth shape of their own mesh (scripts/lib/vessel-tip-shape.mjs). Shared by scripts/prepare-model-stream.mjs (which shapes the meshes the viewer loads) and scripts/prepare-vessel-ends.mjs
// (which then adds no cone beyond an end that was shaped), so both see exactly the same plan.
//   taper  a small vessel (radius <= 1.8 mm) whose end lies in tissue or hangs free and has no vessel of the same kind within 12 mm (those get a connector instead);
//   flare  a small branch whose end touches the wall of a larger vessel of the same kind from the side (no other vessel ends there, and the trunk is at least twice as wide).
// Left out: vessels whose geometry the motion data is fitted to (positionHash), the vessels of the arm and everything the arm rig moves (the shoulder's chest-wall cables): their ends stay as they are until the shoulder
// skinning is settled.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {auditEnds, atlas, geom, triDist} from '../audit-vessel-ends.mjs';
import {weldSurface, endFrame, sub, add, unit} from './vessel-frames.mjs';
import {regionTools} from './vessel-segments.mjs';
import {taperLength, continuesAhead, FLARE_MIN_TRUNK} from './vessel-tip-shape.mjs';

const root = new URL('../../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
/** Identity of a vessel end across the two build steps: the vessel and the cut position to 0.01 mm. */
export const tipKey = row => `${row.id}@${row.at.map(x => Math.round(x * 1e5)).join(',')}`;
/** The vessels of the pelvis and perineum, by name (the region label puts most of them in the abdomen or the hip; owner's decision 2026-11-17: the name decides, 41 vessels in the atlas). app/biomechanics-v2/body-motion.ts keeps the same list for the hip skinning. */
export const PELVIC_VESSELS = /iliac|gluteal|pudendal|obturator|sacral|vesical|rectal|uterine|vaginal|ovarian|testicular|prostat|penile|clitoral|perineal|iliolumbar|labial|scrotal|bulb|crural/i;
export const STUB_RADIUS = .0032, LOST_GAP_RADIUS = .005;   // head and neck, neck root: an end of up to 3.2 mm radius is rounded too, down to half a radius long
export const FADE_RADIUS = .0018, FLARE_MAX_RADIUS = .0018, FLARE_END_CLEAR = .003, GAP_MM = 12;

/** Two veins whose ends are held exactly as on main (owner's decision): the right lateral circumflex femoral vein (FJ2201) and the right deep femoral vein (FJ2135). A far branch end of the first lies 37 mm from the second
 *  and is listed as an open pair at the hip poses; rounding the ends changed that distance by 1.2 mm, and the pair may not be registered again. Their missing-connection question is a separate follow-up (issue and pull request). */
const HOLD_OLD_ENDS = ['FJ2201', 'FJ2135'];
/** The subclavian arteries and veins and the brachiocephalic veins (soft arm binding, profile `path`, no positionHash): a second-exam structure at the neck root, shaped from the head and neck pass on. The lateral thoracic and thoracodorsal vessels of the chest wall stay as they are. */
export const NECK_ROOT_ARM_RIG = ['FJ3479', 'FJ3482', 'FJ3486', 'FJ3579', 'FJ3583', 'FJ3587', 'FJ2250', 'FJ2251', 'FJ2302', 'FJ2303'];   // + the suprascapular arteries and veins (FJ2250/2251 left, FJ2302/2303 right): they run behind the clavicle beside the brachial plexus

/** Vessels (ids) whose ends keep the old form: motion data fitted to the source mesh, the arm, and what the arm rig moves. */
export async function keepOldEnds() {
  const {anatomicalRegion} = await regionTools(), keep = new Set(), bindings = file('app/biomechanics-v2/');
  const hashBound = new Set(), armSkinned = new Set();
  for (const f of fs.readdirSync(bindings).filter(f => f.endsWith('.json'))) {
    const data = JSON.parse(fs.readFileSync(bindings + f, 'utf8'));
    for (const [key, entry] of Object.entries(data.parts ?? {})) if (entry && typeof entry === 'object' && 'positionHash' in entry) { hashBound.add(key); if (entry.name) hashBound.add(entry.name); }
  }
  for (const f of ['tissue-bindings.json', 'paokao-bindings.json']) { const data = JSON.parse(fs.readFileSync(bindings + f, 'utf8')); for (const id of Object.keys(f.startsWith('paokao') ? data.tissue ?? {} : data)) armSkinned.add(id); }
  for (const p of atlas.parts) if (hashBound.has(p.id) || hashBound.has(p.name) || anatomicalRegion(p) === 'upper-limb' || armSkinned.has(p.id)) keep.add(p.id);
  for (const id of HOLD_OLD_ENDS) keep.add(id);
  for (const id of NECK_ROOT_ARM_RIG) if (!hashBound.has(id)) keep.delete(id);   // the neck-root vessels follow the arm only softly: their ends are shaped like any other vessel's
  return keep;
}

/** Radius of the vessel `id` where the point q lies on its wall: the distance from q through the wall to the opposite side, halved (null when no opposite wall is hit). `toward` is the way a branch travels into the wall. */
function trunkRadius(parts, id, q, toward) {
  const part = parts.get(id); if (!part) return null;
  const g = geom(part), P = g.pos, I = g.idx, v = i => [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]];
  let best = Infinity, bn = null;
  for (let t = 0; t < I.length; t += 3) {
    const a = v(I[t]), b = v(I[t + 1]), c = v(I[t + 2]), d = triDist(q, a, b, c);
    if (d < best) { best = d; const u = sub(b, a), w = sub(c, a); bn = unit([u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]); }
  }
  if (!bn) return null;
  const into = bn[0] * toward[0] + bn[1] * toward[1] + bn[2] * toward[2] > 0 ? bn : bn.map(x => -x), o = add(q, into, 1e-5);
  let hit = Infinity;
  for (let t = 0; t < I.length; t += 3) {   // Moller-Trumbore
    const a = v(I[t]), e1 = sub(v(I[t + 1]), a), e2 = sub(v(I[t + 2]), a);
    const h = [into[1] * e2[2] - into[2] * e2[1], into[2] * e2[0] - into[0] * e2[2], into[0] * e2[1] - into[1] * e2[0]], det = e1[0] * h[0] + e1[1] * h[1] + e1[2] * h[2];
    if (Math.abs(det) < 1e-12) continue;
    const s = sub(o, a), u = (s[0] * h[0] + s[1] * h[1] + s[2] * h[2]) / det; if (u < 0 || u > 1) continue;
    const qv = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]], w = (into[0] * qv[0] + into[1] * qv[1] + into[2] * qv[2]) / det; if (w < 0 || u + w > 1) continue;
    const tt = (e2[0] * qv[0] + e2[1] * qv[1] + e2[2] * qv[2]) / det; if (tt > 1e-4 && tt < hit) hit = tt;
  }
  return Number.isFinite(hit) ? hit / 2 : null;
}

/** The vessel `id` carries on past the end (see continuesAhead). */
const vesselContinues = (parts, id, frame, ahead) => continuesAhead(geom(parts.get(id)).pos, frame.center, frame.dir, frame.radius, ahead);

/**
 * @param rows rows of auditEnds() (computed here when omitted)
 * @returns {buried: [{id, row, center, radius}] (ends inside the vessel's own trunk: left alone), tapers: [{id, row, center, dir, radius, length}], flares: [{id, row, center, dir, radius, reach}], keep}
 */
export async function planTips(rows = auditEnds()) {
  const keep = await keepOldEnds(), {anatomicalRegion} = await regionTools(), parts = new Map(atlas.parts.map(p => [p.id, p])), surfaces = new Map();
  const stubScope = new Map(); const inStubScope = id => { if (!stubScope.has(id)) stubScope.set(id, anatomicalRegion(parts.get(id)) === 'head-neck' || NECK_ROOT_ARM_RIG.includes(id)); return stubScope.get(id); };
  const surface = id => { if (!surfaces.has(id)) { const g = geom(parts.get(id)); surfaces.set(id, weldSurface(g.pos, g.idx)); } return surfaces.get(id); };
  const tapers = [], flares = [], buried = [];
  for (const row of rows) {
    if (keep.has(row.id)) continue;
    if (row.kind === 'joined') {
      if (rows.some(o => o !== row && o.id !== row.id && Math.hypot(o.at[0] - row.at[0], o.at[1] - row.at[1], o.at[2] - row.at[2]) < FLARE_END_CLEAR)) continue;   // another vessel ends here: a continuation
      const frame = endFrame(surface(row.id), row.at); if (!frame || frame.radius > FLARE_MAX_RADIUS || frame.radius < .0002) continue;
      const reach = row.toSameMm / 1000, chord = row.closest && reach > .0004 ? unit(sub(row.closest, row.at)) : frame.dir;
      const toward = chord[0] * frame.dir[0] + chord[1] * frame.dir[1] + chord[2] * frame.dir[2] > .5 ? chord : frame.dir;
      const trunk = row.closest && trunkRadius(parts, row.nearestSame, row.closest, toward); if (!trunk || trunk < FLARE_MIN_TRUNK * frame.radius) continue;
      flares.push({id: row.id, row, center: frame.center, dir: toward, radius: frame.radius, reach});
    } else {
      const frame = endFrame(surface(row.id), row.at); if (!frame) continue;
      if (row.kind === 'dangling' && row.toSameMm <= GAP_MM && row.closest) continue;   // a connector is built there
      const stub = inStubScope(row.id) || row.lostGap;   // head and neck, neck root: any end of up to 3.2 mm radius is rounded, whatever the length of its branch (the suprascapular vein ends flat 28 mm out)
      // an end that used to be joined to an unrelated vessel (scripts/lib/vessel-relation.mjs) is rounded off instead, up to 5 mm radius, wherever it is
      if (frame.radius > (row.lostGap ? LOST_GAP_RADIUS : stub ? STUB_RADIUS : FADE_RADIUS)) continue;
      // a ring in the middle of the vessel, or the open cap of a branch root inside its own trunk: the vessel carries on past it. Not an end at all, so neither narrowed nor given a cone.
      if (vesselContinues(parts, row.id, frame, Math.min(taperLength(frame.radius), row.branchMm == null ? Infinity : .85 * row.branchMm / 1000))) { buried.push({id: row.id, row, center: frame.center, radius: frame.radius}); continue; }
      const length = Math.min(taperLength(frame.radius), row.branchMm == null ? Infinity : .85 * row.branchMm / 1000);
      if (length < (stub ? Math.max(.0008, .5 * frame.radius) : Math.max(.001, 1.2 * frame.radius))) continue;   // a stub too short to narrow
      tapers.push({id: row.id, row, center: frame.center, dir: frame.dir, radius: frame.radius, length});
    }
  }
  return {tapers, flares, buried, keep};
}
