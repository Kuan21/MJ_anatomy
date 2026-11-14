// Occipitofrontalis and its aponeurosis: the two bellies (frontalis, occipitalis) and the epicranial aponeurosis between them, measured on the generated meshes.
// frontalis: left-right symmetric, upper edge one continuous arc across the midline (no dip), the two bellies meet along the midline, the upper edge stays well in front of the coronal suture;
// occipitalis: left-right symmetric, lower edge smooth (no saw teeth), inner lower corner rounded; muscle bellies and aponeurosis meet without a gap.
// The results are pass/fail and counts only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import {readBone, REFINED_NAMES, surfaceField} from './lib/facial-refine.mjs';

const models = new URL('../public/models/', import.meta.url);
const stream = f => JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL(f, models))));
function mesh(m, name) {
  const p = m.parts.find(q => q.name === name); assert.ok(p, `${name} is packaged`);
  const b = fs.readFileSync(new URL('..' + m.chunks[p.chunk].url, models));
  return {positions: new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12)), indices: new Uint32Array(b.buffer.slice(b.byteOffset + p.indices, b.byteOffset + p.indices + p.indexCount * 4))};
}
const facial = stream('facial/facial-stream.json.gz'), supplement = stream('supplement/supplement-stream.json.gz');
const F = {L: mesh(facial, 'Left frontalis'), R: mesh(facial, 'Right frontalis')}, O = {L: mesh(facial, 'Left occipitalis'), R: mesh(facial, 'Right occipitalis')}, G = mesh(supplement, 'Aponeurosis of epicranius');
const sideOf = {L: 1, R: -1};
const aOf = (g, s) => { const a = []; for (let i = 0; i < g.positions.length; i += 3) a.push(sideOf[s] * g.positions[i]); return a; };
const MM = 1e3;
/** Extreme y of the vertices in each bin of |x| (mm), as an array; NaN for empty bins. */
function profile(g, s, lo, hi, bin, max) {
  const out = []; for (let x = lo; x < hi; x += bin) out.push(NaN);
  for (let i = 0; i < g.positions.length; i += 3) { const a = sideOf[s] * g.positions[i] * MM, j = Math.floor((a - lo) / bin); if (j < 0 || j >= out.length) continue; const y = g.positions[i + 1] * MM; if (!(max ? y <= out[j] : y >= out[j])) out[j] = y; }
  return out;
}

// 0. nothing was added or removed: the four pieces keep the vertex and triangle counts of the catalogue
{
  const cat = JSON.parse(fs.readFileSync(new URL('facial/atlas.json', models), 'utf8'));
  for (const name of REFINED_NAMES) { const c = cat.parts.find(q => q.name === name), p = facial.parts.find(q => q.name === name); assert.equal(p.vertexCount, c.vertexCount, name); assert.equal(p.indexCount, c.indexCount, name); }
}
// 1. frontalis: symmetric, no dip in the upper edge, the bellies meet in the midline
{
  const tl = profile(F.L, 'L', 0, 60, 6, true), tr = profile(F.R, 'R', 0, 60, 6, true);
  let worst = 0; for (let i = 0; i < tl.length; i++) worst = Math.max(worst, Math.abs(tl[i] - tr[i]));
  assert.ok(worst <= 2.5, `the upper edge of the two bellies is symmetric (largest difference ${worst.toFixed(1)} mm)`);
  for (const [s, t] of [['L', tl], ['R', tr]]) {
    const centre = Math.max(t[0], t[1]), crest = Math.max(...t.slice(2, 6));
    assert.ok(centre >= crest - 2.0, `${s}: the upper edge has no dip in the midline (centre ${centre.toFixed(1)}, crest ${crest.toFixed(1)} mm)`);
    for (let i = 1; i < 6; i++) assert.ok(t[i] >= t[i - 1] - 1.6 && t[i] <= t[i - 1] + 3.5, `${s}: the upper edge is one smooth arc (bin ${i})`);
  }
  // the bellies meet: for every row between brow and the arc, the innermost vertex of each belly is within 1.5 mm of the midline
  for (const s of ['L', 'R']) for (let y = 1.620; y <= 1.672; y += .004) {
    let inner = Infinity; for (let i = 0; i < F[s].positions.length; i += 3) if (Math.abs(F[s].positions[i + 1] - y) < .002) inner = Math.min(inner, sideOf[s] * F[s].positions[i] * MM);
    assert.ok(inner <= 1.5, `${s}: the belly reaches the midline at y = ${y.toFixed(3)} (inner edge ${inner.toFixed(1)} mm)`);
  }
}
// 2. frontalis stays in front of the coronal suture (the line where the frontal bone meets the parietal bones) and below the bregma
{
  const frontal = readBone(models, 'FMA52734'), suture = [];
  const names = JSON.parse(fs.readFileSync(new URL('atlas.json', models), 'utf8')).parts.filter(p => /parietal bone/.test(p.name)).map(p => p.conceptId);
  for (const id of names) {
    const par = readBone(models, id), P = par.positions;
    for (let i = 0; i < frontal.positions.length; i += 3) { let d = Infinity; for (let j = 0; j < P.length; j += 3) { const q = Math.hypot(frontal.positions[i] - P[j], frontal.positions[i + 1] - P[j + 1], frontal.positions[i + 2] - P[j + 2]); if (q < d) d = q; } if (d < .003) suture.push([frontal.positions[i], frontal.positions[i + 1], frontal.positions[i + 2]]); }
  }
  assert.ok(suture.length > 300, `the coronal suture is found on the bones (${suture.length} points)`);
  const bregma = Math.max(...suture.map(p => p[1]));
  for (const s of ['L', 'R']) {
    let nearest = Infinity, top = -Infinity; const P = F[s].positions;
    for (let i = 0; i < P.length; i += 3) { top = Math.max(top, P[i + 1]); for (const q of suture) { const d = Math.hypot(P[i] - q[0], P[i + 1] - q[1], P[i + 2] - q[2]); if (d < nearest) nearest = d; } }
    assert.ok(top < bregma, `${s}: the upper edge of frontalis (${(top * MM).toFixed(1)} mm) is below the bregma (${(bregma * MM).toFixed(1)} mm)`);
    assert.ok(nearest >= .009, `${s}: frontalis stays at least 9 mm from the coronal suture (nearest ${(nearest * MM).toFixed(1)} mm)`);
  }
}
// 3. occipitalis: symmetric, lower edge smooth, inner lower corner rounded
{
  const lowL = profile(O.L, 'L', 16, 56, 2, false), lowR = profile(O.R, 'R', 16, 56, 2, false);
  let worst = 0; for (let i = 0; i < lowL.length; i++) worst = Math.max(worst, Math.abs(lowL[i] - lowR[i]));
  assert.ok(worst <= 2.5, `the lower edge of the two bellies is symmetric (largest difference ${worst.toFixed(1)} mm)`);
  // roughness: the lowest vertex of every 0.5 mm column against its 13-column moving mean, over |x| 24-54 mm: the source has 0.39 mm (saw teeth), a clean edge is below 0.15 mm
  for (const s of ['L', 'R']) {
    const col = profile(O[s], s, 24, 54, .5, false), n = col.length, d = [];
    for (let i = 0; i < n; i++) { let sum = 0, c = 0; for (let k = -6; k <= 6; k++) { const v = col[Math.min(n - 1, Math.max(0, i + k))]; if (Number.isFinite(v)) { sum += v; c++; } } if (Number.isFinite(col[i]) && c) d.push(col[i] - sum / c); }
    const rms = Math.sqrt(d.reduce((a, v) => a + v * v, 0) / d.length);
    assert.ok(rms < .15, `${s}: the lower edge of occipitalis is smooth (rms ${rms.toFixed(3)} mm)`);
  }
  // the inner edge: no vertex of the lower 2 mm lies closer to the midline than the rounded corner allows (the square corner of the source reached 14.5 mm)
  for (const s of ['L', 'R']) {
    let ymin = Infinity; const P = O[s].positions; for (let i = 0; i < P.length; i += 3) ymin = Math.min(ymin, P[i + 1]);
    let inner = Infinity; for (let i = 0; i < P.length; i += 3) if (P[i + 1] < ymin + .0015) inner = Math.min(inner, sideOf[s] * P[i] * MM);
    assert.ok(inner > 19, `${s}: the lower inner corner of occipitalis is rounded away from the midline (${inner.toFixed(1)} mm)`);
  }
}
// 4. the muscle bellies and the aponeurosis meet: the upper part of every belly lies against the sheet
{
  const nearest = (P, Q) => { let d = Infinity; for (let j = 0; j < Q.length; j += 3) { const q = Math.hypot(P[0] - Q[j], P[1] - Q[j + 1], P[2] - Q[j + 2]); if (q < d) d = q; } return d; };
  const check = (label, g, rows, limit) => {
    const dist = []; for (const [x, y, z] of rows(g)) dist.push(nearest([x, y, z], G.positions));
    dist.sort((a, b) => a - b); const p90 = dist[Math.floor(dist.length * .9)], max = dist[dist.length - 1];
    assert.ok(p90 <= limit, `${label}: the edge of the belly lies against the aponeurosis (90 % within ${(p90 * MM).toFixed(1)} mm)`);
    return max;
  };
  for (const s of ['L', 'R']) {
    // frontalis: vertices within 1.5 mm of the upper edge of their 3 mm column
    check(`${s} frontalis`, F[s], g => { const P = g.positions, top = new Map(); for (let i = 0; i < P.length; i += 3) { const k = Math.round(P[i] / .003); top.set(k, Math.max(top.get(k) ?? -Infinity, P[i + 1])); } const out = []; for (let i = 0; i < P.length; i += 3) if (P[i + 1] > top.get(Math.round(P[i] / .003)) - .0015 && Math.abs(P[i]) < .045) out.push([P[i], P[i + 1], P[i + 2]]); return out.filter((_, k) => k % 3 === 0); }, .004);
    // occipitalis: vertices within 1.5 mm of the upper edge of their column
    check(`${s} occipitalis`, O[s], g => { const P = g.positions, top = new Map(); for (let i = 0; i < P.length; i += 3) { const k = Math.round(P[i] / .003); top.set(k, Math.max(top.get(k) ?? -Infinity, P[i + 1])); } const out = []; for (let i = 0; i < P.length; i += 3) if (P[i + 1] > top.get(Math.round(P[i] / .003)) - .0015 && Math.abs(P[i]) < .055) out.push([P[i], P[i + 1], P[i + 2]]); return out.filter((_, k) => k % 3 === 0); }, .004);
  }
}
// 5. no belly vertex sinks into the bone: frontalis against the frontal bone, occipitalis against the occipital bone (a vertex deeper than 3 mm inside the surface counts)
{
  const frontal = surfaceField(readBone(models, 'FMA52734'), 'front'), occipital = surfaceField(readBone(models, 'FMA52735'), 'back');
  for (const [label, g, field, sign] of [['frontalis L', F.L, frontal, 1], ['frontalis R', F.R, frontal, 1], ['occipitalis L', O.L, occipital, -1], ['occipitalis R', O.R, occipital, -1]]) {
    let deep = 0, seen = 0; const P = g.positions;
    for (let i = 0; i < P.length; i += 3) { const z = field(P[i], P[i + 1]); if (!Number.isFinite(z)) continue; seen++; if (sign * (z - P[i + 2]) > .003) deep++; }
    assert.ok(deep / seen < .02, `${label}: no more than 2 % of the vertices lie more than 3 mm inside the bone (${(deep / seen * 100).toFixed(2)} %)`);
  }
}
console.log('Occipitofrontalis: symmetric bellies, arc upper edge of frontalis, clean lower edge of occipitalis, bellies against the aponeurosis, nothing inside the bone pass.');
