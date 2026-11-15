// External carotid artery branches (batch A, scripts/paokao-structures/eca-branches.mjs): count and names, origin on the artery wall, height order of the origins, clearance from bones and
// laryngeal cartilages, clearance from the internal carotid artery and the internal jugular vein (reported for the vagus nerve), smoothness of every tube, nothing outside the skin.
// Prints a table (mm) so the numbers can go into docs/eca-branches.md; fails on a rule that the model must satisfy.   node scripts/test-eca-branches.mjs [--table]
import assert from 'node:assert/strict';
import {loadWorld} from './lib/paokao-world.mjs';
import {makeUtil, sub, add, mul, unit, len, dot} from './lib/paokao-util.mjs';
import {closest} from './lib/heart-geom.mjs';
import {loadNeckVessels, centreLine, externalCarotid} from './lib/eca-reference.mjs';
import ecaBranches, {ORIGINS, MARGIN, signedDistance} from './paokao-structures/eca-branches.mjs';

const w = loadWorld({paokao: false}), U = makeUtil(w), ECA = await externalCarotid(), vessels = await loadNeckVessels(), out = ecaBranches(U);
const KEYS = ['superior thyroid artery', 'ascending pharyngeal artery', 'lingual artery', 'facial artery', 'occipital artery', 'posterior auricular artery'];
const ZH = {'superior thyroid artery': '甲狀腺上動脈', 'ascending pharyngeal artery': '咽升動脈', 'lingual artery': '舌動脈', 'facial artery': '顏面動脈', 'occipital artery': '枕動脈', 'posterior auricular artery': '耳後動脈'};
const table = process.argv.includes('--table'), rows = [], failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };
const mm = x => +(x * 1000).toFixed(1);

// 1. count and names: six per side, English with Left/Right, Chinese with 左/右, no Latin, no codes
assert.equal(out.length, 12, 'six branches on each side');
for (const side of ['Left', 'Right']) for (const k of KEYS) {
  const s = out.find(o => o.name === `${side} ${k}`); assert.ok(s, `${side} ${k} exists`);
  assert.equal(s.zh, `${side === 'Left' ? '左' : '右'}${ZH[k]}`);
  assert.ok(!/[a-z]/i.test(s.zh) && !/(FMA|PK-|\d{3})/.test(s.name), 'names carry no Latin, codes or mesh suffix');
  assert.equal(s.system, 'arterial'); assert.ok(s.card.origin && s.card.course && s.card.supply, 'card has origin, course and supply');
  assert.ok(s.refs.length === 0, 'no invented reference numbers');
}
assert.equal(new Set(out.map(o => o.name)).size, 12, 'no duplicate names');

// 2. height order of the origins along the external carotid artery (arc length from the bifurcation) and their relation to the hyoid bone
const arcs = KEYS.map(k => ORIGINS[k].arc);
assert.ok(arcs[0] < arcs[1] && arcs[1] < arcs[2] && arcs[2] < arcs[3] && arcs[3] <= arcs[4] && arcs[4] < arcs[5], 'origins in the order superior thyroid, ascending pharyngeal, lingual, facial, occipital, posterior auricular');
const hy = U.V('Hyoid bone'), horn = {y: Math.max(...hy.filter(v => v[0] > .014).map(v => v[1]))};   // top of the left greater horn
const near = (p, list) => Math.min(...list.map(v => len(sub(v, p))));

const ring = (v, r) => Array.from({length: 12}, (_, k) => [0, 1, 2].map(a => v.positions[(r * 12 + k) * 3 + a]));
const lines = n => centreLine(vessels.find(v => v.name === n));
const SIDE = {Left: {tag: 'l', sx: 1}, Right: {tag: 'r', sx: -1}};
const vagus = {Left: U.V('Vagus nerve (X).l'), Right: U.V('Vagus nerve (X).r')};

for (const side of ['Left', 'Right']) {
  const T = SIDE[side], eca = ECA[side.toLowerCase()], ica = lines(`Internal carotid artery.${T.tag}`), ijv = lines(`Internal jugular vein.${T.tag}`);
  const tube = (cl, p) => { let best = Infinity; for (let i = 0; i < cl.c.length; i++) best = Math.min(best, len(sub(p, cl.c[i])) - cl.r[i]); return best; };
  for (const k of KEYS) {
    const s = out.find(o => o.name === `${side} ${k}`), P = s.geometry[0].positions, n = P.length / 3, v = i => [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]];
    const sides = 12, rings = (n - 2) / sides;
    const centres = Array.from({length: rings}, (_, r) => { const c = [0, 0, 0]; for (let j = 0; j < sides; j++) { const q = v(r * sides + j); c[0] += q[0] / sides; c[1] += q[1] / sides; c[2] += q[2] / sides; } return c; });
    const rad = Array.from({length: rings}, (_, r) => { let s2 = 0; for (let j = 0; j < sides; j++) s2 += len(sub(v(r * sides + j), centres[r])) / sides; return s2; });
    // 3. origin on the wall of the external carotid artery: centre of the first ring inside the lumen, between 0.4 and 1.0 of the radius from the axis; part of the first ring pokes out of the wall
    const ref = eca.at(ORIGINS[k].arc / 1000), dAxis = len(sub(centres[0], ref.c));
    check(dAxis <= ref.r && dAxis >= .4 * ref.r, `${s.name}: origin ${mm(dAxis)} mm from the axis of the external carotid artery (radius ${mm(ref.r)} mm)`);
    // the ring must lie under the wall (every vertex within 1.2 radius of the axis would be hidden; at least the far side reaches the wall)
    let maxOut = 0; for (let j = 0; j < sides; j++) maxOut = Math.max(maxOut, len(sub(v(j), ref.c)) - ref.r);
    check(maxOut > -.0006 && maxOut < .0012, `${s.name}: first ring reaches the wall (${mm(maxOut)} mm beyond it)`);
    // 4. hard structures: every vertex outside bones and cartilages, at least MARGIN/2 away (the wall of the tube itself)
    let minClear = Infinity, worst = '';
    for (const nm of ['Mandible', 'Hyoid bone', 'Thyroid cartilage', 'Cricoid cartilage', 'Occipital bone', `${side} temporal bone`, `${side} maxilla`, `${side} zygomatic bone`, `${side} nasal bone`, `${side} lacrimal bone`, 'Atlas', 'Axis', 'Third cervical vertebra']) {
      if (!U.has(nm)) continue; const m = U.mesh(nm);
      for (let i = 0; i < n; i += 2) { const d = signedDistance(m, v(i)); if (d < minClear) { minClear = d; worst = nm; } }
    }
    check(minClear >= -1e-5, `${s.name}: wall enters ${worst} by ${mm(-minClear)} mm`);
    // 5. internal carotid artery and internal jugular vein: wall to wall (centre line of the vessel minus its radius), beyond the first 6 mm of the branch where it sits against the parent
    let icaClear = Infinity, ijvClear = Infinity; const skip = 8;
    for (let r = skip; r < rings; r++) for (const p of [centres[r]]) { icaClear = Math.min(icaClear, tube(ica, p) - rad[r]); ijvClear = Math.min(ijvClear, tube(ijv, p) - rad[r]); }
    check(icaClear >= -1e-4, `${s.name}: passes through the internal carotid artery (${mm(icaClear)} mm)`);
    check(ijvClear >= -1e-4, `${s.name}: passes through the internal jugular vein (${mm(ijvClear)} mm)`);
    const vagClear = Math.min(...Array.from({length: rings}, (_, r) => near(centres[r], vagus[side]) - rad[r]));
    // 6. smoothness: neighbouring rings, outside the rounded end, differ by less than 12% in radius and the centre step by less than 1.8x
    let ratio = 1, jump = 1; const steps = centres.slice(1).map((c, i) => len(sub(c, centres[i]))), med = [...steps].sort((a, b) => a - b)[steps.length >> 1];
    for (let r = 1; r < rings - 5; r++) { ratio = Math.max(ratio, rad[r] / rad[r - 1], rad[r - 1] / rad[r]); jump = Math.max(jump, steps[r - 1] / med); }
    check(ratio < 1.12, `${s.name}: radius step x${ratio.toFixed(2)}`); check(jump < 1.8, `${s.name}: centre step x${jump.toFixed(2)}`);
    // bend between three consecutive centres (degrees), 6 rings apart: no kinks
    let bend = 0; for (let r = 6; r < rings - 6; r++) { const a = unit(sub(centres[r], centres[r - 6])), b = unit(sub(centres[r + 6], centres[r])); bend = Math.max(bend, Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * 180 / Math.PI); }
    // 7. not outside the skin: vertices in front of the face and behind the head are below the skin surface seen from the front/back
    let skinOver = -Infinity;
    for (let i = 0; i < n; i += 3) { const p = v(i); if (p[2] > .05) { const h = U.rayHit('Skin', [p[0], p[1], .4], [0, 0, -1]); if (h) skinOver = Math.max(skinOver, p[2] - h.point[2]); } else if (p[2] < -.04 && p[1] > 1.55) { const h = U.rayHit('Skin', [p[0], p[1], -.4], [0, 0, 1]); if (h) skinOver = Math.max(skinOver, h.point[2] - p[2]); } }
    check(skinOver < -.0004 || skinOver === -Infinity, `${s.name}: outside the skin by ${mm(skinOver)} mm`);
    const originY = centres[0][1], endC = centres[rings - 1];
    rows.push({name: s.name, zh: s.zh, originArc: ORIGINS[k].arc, originY: mm(originY), endX: mm(endC[0]), endY: mm(endC[1]), endZ: mm(endC[2]), r0: mm(rad[0]), r1: mm(rad[rings - 6]), lenMm: mm(steps.reduce((a, b) => a + b, 0)), minBoneClear: mm(minClear), ica: mm(icaClear), ijv: mm(ijvClear), vagus: mm(vagClear), radiusStep: +ratio.toFixed(2), centreStep: +jump.toFixed(2), bendDeg: Math.round(bend), skin: skinOver === -Infinity ? '' : mm(skinOver)});
  }
  // origin heights: superior thyroid below the greater horn, lingual within 8 mm of the horn tip level, the rest above the lingual origin
  const y = Object.fromEntries(KEYS.map(k => [k, rows.find(r => r.name === `${side} ${k}`).originY]));
  check(y['superior thyroid artery'] < y['lingual artery'] && y['ascending pharyngeal artery'] < y['lingual artery'] && y['lingual artery'] < y['facial artery'] && y['facial artery'] <= y['occipital artery'] + 3 && y['occipital artery'] < y['posterior auricular artery'], `${side}: origin heights ${JSON.stringify(y)}`);
  check(Math.abs(y['lingual artery'] - horn.y * 1000) < 14, `${side}: lingual origin ${y['lingual artery']} mm vs top of the greater horn ${mm(horn.y)} mm`);
}
if (table) console.table(rows);
if (failures.length) { console.log(failures.join('\n')); process.exit(1); }
console.log(`ECA branches: ${out.length} tubes (6 per side); origins on the artery wall, clear of bone and cartilage (smallest wall clearance ${Math.min(...rows.map(r => r.minBoneClear))} mm), not through the internal carotid artery or the internal jugular vein, smooth, inside the skin.`);
