// The skin of the hand as the viewer poses it (build-time skin weights, the same linear blend of the palette as the GPU shader), for the finger collision tests:
//  - tissue overlap of neighbouring fingers: how far a skin vertex of one finger lies inside the soft-tissue envelope of the next one;
//  - pad gap of the thumb and the index finger in a pinch: the distance between the two finger pads, i.e. the bone gap minus the skin thickness over each bone tip.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
const root = new URL('../../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
export const DIGITS = ['thumb', 'index', 'middle', 'ring', 'little'];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const applyTransform = (t, p) => { const [x, y, z, w] = t.quaternion, c = [y * p[2] - z * p[1], z * p[0] - x * p[2], x * p[1] - y * p[0]].map(v => v * 2), cc = [y * c[2] - z * c[1], z * c[0] - x * c[2], x * c[1] - y * c[0]]; return [0, 1, 2].map(a => p[a] + c[a] * w + cc[a] + t.translation[a]); };
const lineDistance = (pts, p) => { let best = Infinity; for (let k = 0; k + 1 < pts.length; k++) { const a = pts[k], ab = sub(pts[k + 1], a), t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / dot(ab, ab))); best = Math.min(best, Math.hypot(...[0, 1, 2].map(i => p[i] - a[i] - ab[i] * t))); } return best; };
function rayTriangle(o, d, A, B, C) { // Möller–Trumbore, distance along the ray or null
  const e1 = sub(B, A), e2 = sub(C, A), h = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]], a = dot(e1, h);
  if (Math.abs(a) < 1e-14) return null;
  const f = 1 / a, s = sub(o, A), u = f * dot(s, h); if (u < 0 || u > 1) return null;
  const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]], v = f * dot(d, q); if (v < 0 || u + v > 1) return null;
  const t = f * dot(e2, q); return t > 1e-7 ? t : null;
}
/** `m` is the bundled motion module (scripts/lib/digits-entry.ts), `joints` digit-joints.json. */
export function makeDigitSkin({m, atlas, geometry, joints, side}) {
  const skin = atlas.parts.find(p => p.id === 'FJ2810'), g = geometry(skin), base = g.positions, tris = g.indices, n = skin.vertexCount;
  const entry = JSON.parse(gunzipSync(fs.readFileSync(file('public/models/skin-weights.json.gz')))).parts[skin.id];
  const slots = Uint8Array.from(Buffer.from(entry.slots, 'base64')), raw = Buffer.from(entry.weights, 'base64'), weights = Float32Array.from(new Uint16Array(raw.buffer, raw.byteOffset, raw.length / 2), v => v / 65535);
  const J = joints.sides[side], sign = side === 'left' ? 1 : -1, rig = m.makeSoftRig(atlas, side);
  const lines = DIGITS.map(d => { const j = J[d]; return d === 'thumb' ? [j.joints.cmc, j.joints.mcp, j.joints.ip, j.tip] : [j.joints.mcp, j.joints.pip, j.joints.dip, j.tip]; });
  // which digit each skin vertex of the hand belongs to (nearest bone line at rest, beyond the first joint) and the typical soft-tissue radius of each digit
  const assign = new Int8Array(n).fill(-1), restDistance = new Float32Array(n), reach = new Float32Array(n);
  for (let v = 0; v < n; v++) {
    const p = [base[v * 3], base[v * 3 + 1], base[v * 3 + 2]]; if (p[0] * sign < .15 || p[0] * sign > .35 || p[1] < .70 || p[1] > .90) continue;
    let best = -1, bd = Infinity; lines.forEach((l, i) => { const d = lineDistance(l, p); if (d < bd) { bd = d; best = i; } });
    const l = lines[best], axis = sub(l[3], l[0]), along = dot(sub(p, l[0]), axis) / Math.hypot(...axis);
    if (bd < .02 && along > .005) { assign[v] = best; restDistance[v] = bd; reach[v] = along; }
  }
  const radius = DIGITS.map((_, i) => { const a = []; for (let v = 0; v < n; v++) if (assign[v] === i) a.push(restDistance[v]); a.sort((x, y) => x - y); return a[a.length >> 1]; });
  function pose(input) {
    const t = m.buildUpperLimbMotion(atlas, side, {...m.NEUTRAL_POSE, ...input}).transforms, palette = m.makePalette(rig, t);
    const packed = m.writePalette(new Float32Array(m.PALETTE_WIDTH * 4), side === 'left' ? {left: palette, right: null} : {left: null, right: palette});
    const posed = m.slotSkin({indices: slots, weights, lbs: true}, base, packed, new Float32Array(base.length));
    const owner = [0, 0, 1, 2], posedLines = DIGITS.map((d, i) => { const ids = d === 'thumb' ? [J[d].ids.mc, J[d].ids.pp, J[d].ids.dp] : [J[d].ids.pp, J[d].ids.mp, J[d].ids.dp]; return lines[i].map((p, k) => t[ids[owner[k]]] ? applyTransform(t[ids[owner[k]]], p) : p); });
    return {posed, posedLines, t};
  }
  /** Skin within this distance of the knuckle (along the finger) is left out of the overlap: the palmar crease of the MCP joint folds when the finger curls, which is skin folding, not fingers meeting. */
const KNUCKLE = .014;
/** Deepest skin vertex of one finger inside the soft-tissue envelope (0.9 × typical skin radius around the bone line) of its neighbour, per pair of fingers (metres). */
  function overlap(state, where) {
    const out = {};
    for (let a = 1; a < 4; a++) {
      let deep = 0;
      for (const [x, y] of [[a, a + 1], [a + 1, a]]) for (let v = 0; v < n; v++) if (assign[v] === x && reach[v] > KNUCKLE) { const d = radius[y] * .9 - lineDistance(state.posedLines[y], [state.posed[v * 3], state.posed[v * 3 + 1], state.posed[v * 3 + 2]]); if (d > deep) { deep = d; if (where) where[`${DIGITS[a]}-${DIGITS[a + 1]}`] = v; } }
      out[`${DIGITS[a]}-${DIGITS[a + 1]}`] = deep;
    }
    return out;
  }
  /** Pad gap between the distal phalanges of two digits: the closest bone points are joined by a line, the skin thickness over each bone is measured along that line (ray against the skin of that digit), and the gap is what remains. Negative: the pads overlap. */
  function padGap(state, da = 'thumb', db = 'index') {
    const ia = DIGITS.indexOf(da), ib = DIGITS.indexOf(db);
    const cloud = d => { const id = J[d].ids.dp, part = atlas.parts.find(p => p.id === id), gg = geometry(part), step = Math.max(1, Math.floor(gg.positions.length / 3 / 400)), out = []; for (let i = 0; i < gg.positions.length / 3; i += step) out.push(applyTransform(state.t[id], [gg.positions[i * 3], gg.positions[i * 3 + 1], gg.positions[i * 3 + 2]])); return out; };
    const A = cloud(da), B = cloud(db); let best = Infinity, pa, pb;
    for (const a of A) for (const b of B) { const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); if (d < best) { best = d; pa = a; pb = b; } }
    const dir = [0, 1, 2].map(k => (pb[k] - pa[k]) / best), P = i => [state.posed[i * 3], state.posed[i * 3 + 1], state.posed[i * 3 + 2]];
    const thickness = (origin, d, digit) => { let tm = Infinity; for (let t3 = 0; t3 < tris.length; t3 += 3) { const i0 = tris[t3], i1 = tris[t3 + 1], i2 = tris[t3 + 2]; if ((assign[i0] === digit) + (assign[i1] === digit) + (assign[i2] === digit) < 2) continue; const t = rayTriangle(origin, d, P(i0), P(i1), P(i2)); if (t !== null && t < tm) tm = t; } return tm; };
    const ta = thickness(pa, dir, ia), tb = thickness(pb, dir.map(v => -v), ib);
    return {boneGap: best, padA: ta, padB: tb, gap: best - ta - tb};
  }
  return {pose, overlap, padGap, radius, assign, base, assigned: DIGITS.map((_, i) => assign.reduce((c, a) => c + (a === i), 0))};
}
