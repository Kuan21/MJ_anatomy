// Read-only measurement: the layers that should lie between the larynx / hyoid and the cervical vertebral bodies (pharynx, retropharyngeal space,
// prevertebral muscles), plus independent landmarks (skull base, mandible, manubrium, first rib) to judge which side is displaced.
//   node scripts/measure-retropharyngeal.mjs [--json=<file>] [--md]
// Reads public/models/atlas.json (+ streams); writes nothing unless --json is given. Depends on generated stream files, so it is NOT part of CI.
// Coordinates: metres in the viewer's rest frame (y up, x positive = Left, z positive = anterior); all output is mm (x 1000). Every number is taken from
// mesh vertices or from exact mesh-plane intersections; nothing is estimated.
import fs from 'node:fs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const arg = n => process.argv.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const {atlas, geometry} = loadFullAtlas();
const r1 = x => Number.isFinite(x) ? +x.toFixed(1) : null;
const byId = id => atlas.parts.find(p => p.id === id);
const mm = p => p.bounds.map(b => b.map(x => x * 1e3));
const cache = new Map();
function mesh(p) { if (!cache.has(p.id)) { const g = geometry(p); cache.set(p.id, {P: g.positions, I: g.indices}); } return cache.get(p.id); }
const verts = p => { const {P} = mesh(p), o = []; for (let i = 0; i < P.length; i += 3) o.push([P[i] * 1e3, P[i + 1] * 1e3, P[i + 2] * 1e3]); return o; };
// exact section of a mesh with the plane y = Y (mm): list of segments [[x,z],[x,z]]
function section(p, Y) {
  const {P, I} = mesh(p), y = Y / 1e3, seg = [];
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3, ya = P[a + 1] - y, yb = P[b + 1] - y, yc = P[c + 1] - y;
    if ((ya > 0 && yb > 0 && yc > 0) || (ya < 0 && yb < 0 && yc < 0)) continue;
    const pts = [];
    for (const [i, j, yi, yj] of [[a, b, ya, yb], [b, c, yb, yc], [c, a, yc, ya]]) if ((yi > 0) !== (yj > 0)) { const f = yi / (yi - yj); pts.push([(P[i] + f * (P[j] - P[i])) * 1e3, (P[i + 2] + f * (P[j + 2] - P[i + 2])) * 1e3]); }
    if (pts.length === 2) seg.push(pts);
  }
  return seg;
}
const sideOf = p => { const [lo, hi] = mm(p); return lo[0] > -3 && hi[0] < 3 ? 'M' : lo[0] > -3 ? 'L' : hi[0] < 3 ? 'R' : 'M'; };   // by where the mesh actually is (x > 0 = Left), not by its name
const keyOf = p => p.name.replace(/^(Inferior oblique|Superior oblique|Vertical intermediate) part of (left|right) longus colli$/i, 'Longus colli (three parts)').replace(/^(Left|Right) /i, '').replace(/ of (left|right) /i, ' of ').replace(/\b(left|right) /i, '');
// --top / --bottom: slice heights in mm (default C2 to C7: 1560 down to 1430, every 10 mm); --bottom=1340 reaches the upper thoracic level
const SLICES = []; for (let y = +(arg('top') || 1560); y >= +(arg('bottom') || 1430); y -= 10) SLICES.push(y);

// --- vertebral bodies and discs: the front face at each slice (midline, |x| < 10), and the section used for the inside test ---
const VERT = [['C2', 'FJ3177'], ['C3', 'FJ3161'], ['C4', 'FJ3164'], ['C5', 'FJ3167'], ['C6', 'FJ3170'], ['C7', 'FJ3172'], ['C1', 'FJ3176'], ['T1', 'FJ3158'], ['T2', 'FJ3160'], ['T3', 'FJ3163'], ['T4', 'FJ3166']];
const DISC = [['C2-C3', 'FJ3202'], ['C3-C4', 'FJ3213'], ['C4-C5', 'FJ3218'], ['C5-C6', 'FJ3219'], ['C6-C7', 'FJ3220'], ['C7-T1', 'FJ3221'], ['T1-T2', 'FJ3222'], ['T2-T3', 'FJ3223'], ['T3-T4', 'FJ3224'], ['T4-T5', 'FJ3203']];
const bone = [...VERT, ...DISC].map(([label, id]) => ({label, p: byId(id)}));
const bodySec = {};   // y -> {segs, front, label}
for (const Y of SLICES) {
  let segs = [], front = -Infinity, label = '-';
  for (const b of bone) {
    const [lo, hi] = mm(b.p); if (Y < lo[1] || Y > hi[1]) continue;
    const s = section(b.p, Y); segs = segs.concat(s);
    for (const [u, v] of s) for (const q of [u, v]) if (Math.abs(q[0]) < 10 && q[1] > front) { front = q[1]; label = b.label; }
  }
  bodySec[Y] = {segs, front, label};
}
// is (x,z) inside the union of the bone sections at this height? depth = how far behind the front surface along +z (mm)
function inside(segs, x, z) {
  let n = 0, near = Infinity;
  for (const [a, b] of segs) if ((a[0] > x) !== (b[0] > x)) { const zc = a[1] + (x - a[0]) * (b[1] - a[1]) / (b[0] - a[0]); if (zc > z) { n++; if (zc - z < near) near = zc - z; } }
  return n % 2 === 1 ? near : null;
}

// --- structure groups (names as the site data carries them) ---
const GROUPS = {
  pharynx: /pharyngeal constrictor|stylopharyngeus|salpingopharyngeus|palatopharyngeus|pharyngeal raphe|pterygomandibular raphe/i,
  prevertebral: /longus colli|longus capitis|rectus capitis (anterior|lateralis)/i,
  larynx: /^(hyoid bone|thyroid cartilage|cricoid cartilage|\w+ arytenoid cartilage|epiglottis)$/i,
  tube: /^(trachea|esophagus)$/i,
  vessels: /^(left|right) (common carotid artery|internal jugular vein)$/i,
};
const inBox = p => { const [lo, hi] = mm(p); return hi[1] > 1420 && lo[1] < 1560 && lo[0] > -90 && hi[0] < 90 && lo[2] > -90 && hi[2] < 100; };
function collect(re) {
  const m = new Map();
  for (const p of atlas.parts) if (re.test(p.name) && inBox(p) && !/-END$/.test(p.id)) { const k = keyOf(p) + '|' + sideOf(p); if (!m.has(k)) m.set(k, {name: keyOf(p), side: sideOf(p), parts: [], labelSides: new Set()}); const g = m.get(k); g.parts.push(p); g.labelSides.add(/^Left/i.test(p.name) ? 'L' : /^Right/i.test(p.name) ? 'R' : 'M'); }
  return [...m.values()];
}
// the Right/Left of a name versus where the mesh is
const mislabels = [];
function measureGroup(g) {
  const rows = [];
  for (const Y of SLICES) {
    const F = bodySec[Y].front, pts = [];
    for (const p of g.parts) { const [lo, hi] = mm(p); if (Y < lo[1] || Y > hi[1]) continue; for (const [u, v] of section(p, Y)) pts.push(u, v); }
    if (!pts.length) { rows.push({y: Y, none: true}); continue; }
    const zs = pts.map(q => q[1]), xs = pts.map(q => q[0]);
    // penetration into the bone: share of section points inside a vertebra/disc section and the deepest one
    let nIn = 0, deep = 0; const step = Math.max(1, Math.floor(pts.length / 300)); let n = 0;
    for (let i = 0; i < pts.length; i += step) { n++; const d = inside(bodySec[Y].segs, pts[i][0], pts[i][1]); if (d !== null) { nIn++; deep = Math.max(deep, d); } }
    rows.push({y: Y, back: r1(Math.min(...zs) - F), front: r1(Math.max(...zs) - F), thick: r1(Math.max(...zs) - Math.min(...zs)), xmin: r1(Math.min(...xs)), xmax: r1(Math.max(...xs)), insideShare: r1(100 * nIn / n), deepestInside: r1(deep)});
  }
  return rows;
}
const out = {slices: SLICES, vertebralFront: {}, groups: {}, occupancy: {}, gaps: {}, landmarks: {}, mislabels};
for (const Y of SLICES) out.vertebralFront[Y] = {z: r1(bodySec[Y].front), at: bodySec[Y].label};
for (const [gname, re] of Object.entries(GROUPS)) {
  out.groups[gname] = {};
  for (const g of collect(re)) {
    const lab = [...g.labelSides].join('');
    if (g.side !== 'M' && !(g.labelSides.size === 1 && g.labelSides.has(g.side))) mislabels.push(`${g.name}: mesh is on ${g.side}, name side ${lab}; ids ${g.parts.map(p => p.id).join(',')}`);
    out.groups[gname][`${g.name} [${g.side}]`] = {ids: g.parts.map(p => p.id), rows: measureGroup(g)};
  }
}
// --- what else occupies the zone between the vertebral front line and 30 mm in front of it (|x| < 25)? (retropharyngeal / prevertebral zone) ---
for (const Y of SLICES) {
  const F = bodySec[Y].front, list = [];
  for (const p of atlas.parts) {
    if (/-END$/.test(p.id)) continue; const [lo, hi] = mm(p); if (Y < lo[1] || Y > hi[1] || hi[2] < F - 5 || lo[2] > F + 30 || hi[0] < -25 || lo[0] > 25) continue;
    const s = section(p, Y).flat().filter(q => Math.abs(q[0]) < 25 && q[1] > F - 5 && q[1] < F + 30); if (s.length) list.push({name: `${p.name} (${p.id})`, zmin: r1(Math.min(...s.map(q => q[1])) - F), zmax: r1(Math.max(...s.map(q => q[1])) - F)});
  }
  out.occupancy[Y] = list.sort((a, b) => a.zmin - b.zmin);
}
// --- layer chain in the midline band (|x| < 12): vertebral front = 0; prevertebral muscles, pharyngeal wall, then the larynx / trachea / esophagus. Positive overlap = the two layers occupy the same space ---
const partsMatching = re => atlas.parts.filter(p => re.test(p.name) && inBox(p) && !/-END$/.test(p.id));
function band(parts, Y, xlim) {
  const F = bodySec[Y].front, pts = [];
  for (const p of parts) { const [lo, hi] = mm(p); if (Y < lo[1] || Y > hi[1]) continue; for (const [u, v] of section(p, Y)) for (const q of [u, v]) if (Math.abs(q[0]) < xlim) pts.push(q[1] - F); }
  return pts.length ? {back: Math.min(...pts), front: Math.max(...pts)} : null;
}
const CHAIN = {
  prevertebral: /longus colli|longus capitis/i, rapheAndWall: /pharyngeal raphe|inferior pharyngeal constrictor|palatopharyngeus/i, larynx: /^(hyoid bone|thyroid cartilage|cricoid cartilage|\w+ arytenoid cartilage)$/i,
  trachea: /^trachea$/i, esophagus: /^esophagus$/i, raphe: /^pharyngeal raphe$/i,
};
out.chain = {};
for (const Y of SLICES) {
  const c = {}; for (const [k, re] of Object.entries(CHAIN)) { const b = band(partsMatching(re), Y, 12); c[k] = b ? {back: r1(b.back), front: r1(b.front)} : null; }
  c.prevertebralOverlapsRaphe = c.prevertebral && c.raphe ? r1(c.prevertebral.front - c.raphe.back) : null;   // > 0: the raphe starts behind the front face of the prevertebral muscles
  c.larynxBackMinusRapheFront = c.larynx && c.raphe ? r1(c.larynx.back - c.raphe.front) : null;                // < 0: the larynx starts behind the front face of the raphe (no hypopharyngeal lumen in the midline)
  out.chain[Y] = c;
}
// --- skin (FJ2810) in the midline: front and back surface at each slice ---
out.skinMidline = {}; for (const Y of SLICES) { const sp = section(byId('FJ2810'), Y).flat().filter(q => Math.abs(q[0]) < 8).map(q => q[1]); out.skinMidline[Y] = sp.length ? {front: r1(Math.max(...sp)), back: r1(Math.min(...sp))} : null; }
// --- #320 numbers re-run: the nearest point of the hyoid / thyroid / cricoid to the vertebral body in front of it, over the whole bone ---
const zmin = id => Math.min(...verts(byId(id)).map(v => v[2]));
const midFront = id => { const vs = verts(byId(id)).filter(v => Math.abs(v[0]) < 10), zm = Math.max(...vs.map(v => v[2])); return zm; };
const fz = {C2: midFront('FJ3177'), C3: midFront('FJ3161'), C4: midFront('FJ3164'), C5: midFront('FJ3167'), C6: midFront('FJ3170'), C7: midFront('FJ3172')};
out.gaps = {hyoidToC3: r1(zmin('FJ2772') - fz.C3), thyroidToC4: r1(zmin('FJ2808') - fz.C4), cricoidToC5: r1(zmin('FJ2440') - fz.C5), cricoidToC6: r1(zmin('FJ2440') - fz.C6), vertebralBodyFrontZ: Object.fromEntries(Object.entries(fz).map(([k, v]) => [k, r1(v)]))};

// --- independent landmarks ---
const lm = out.landmarks;
const mand = verts(byId('FJ3289')), hyo = verts(byId('FJ2772')), occ = verts(byId('FJ3309')), man = verts(byId('FJ3290')), thy = verts(byId('FJ2808')), cri = verts(byId('FJ2440'));
const ext = (vs, f) => vs.reduce((a, b) => f(b) > f(a) ? b : a);
lm.hyoid = {frontZ: r1(Math.max(...hyo.map(v => v[2]))), backZ: r1(Math.min(...hyo.map(v => v[2]))), bodyMidY: r1((Math.max(...hyo.filter(v => Math.abs(v[0]) < 8).map(v => v[1])) + Math.min(...hyo.filter(v => Math.abs(v[0]) < 8).map(v => v[1]))) / 2)};
// mandible: chin = most anterior vertex, angle per side, lower border, condyle top
lm.mandible = {chinZ: r1(Math.max(...mand.map(v => v[2]))), lowerBorderY: r1(Math.min(...mand.map(v => v[1]))), backZ: r1(Math.min(...mand.map(v => v[2])))};
for (const [side, s] of [['Left', 1], ['Right', -1]]) { const lat = mand.filter(v => v[0] * s > 25); const a = lat.reduce((q, v) => v[1] + v[2] < q[1] + q[2] ? v : q); const top = lat.reduce((q, v) => v[1] > q[1] ? v : q); lm.mandible[side] = {angle: a.map(r1), condyleTop: top.map(r1)}; }
const menton = mand.filter(v => Math.abs(v[0]) < 10).reduce((a, b) => b[1] < a[1] ? b : a); lm.mandible.menton = menton.map(r1);
for (const side of ['Left', 'Right']) { const g = lm.mandible[side].angle; lm.mandible[side].planeYAtHyoidFrontZ = r1(menton[1] + (g[1] - menton[1]) * (menton[2] - lm.hyoid.frontZ) / (menton[2] - g[2])); }   // mandibular plane (menton to angle) height at the z of the hyoid front
lm.mandible.symphysisInnerBackZ_atHyoidHeight = r1(Math.min(...mand.filter(v => Math.abs(v[0]) < 12 && v[1] > lm.hyoid.bodyMidY - 10 && v[1] < lm.hyoid.bodyMidY + 12 && v[2] > 20).map(v => v[2])));
// skull base: occipital bone near the midline; foramen-magnum front rim (basion region) = the lowest midline vertices
const occMid = occ.filter(v => Math.abs(v[0]) < 10), occLow = occMid.slice().sort((a, b) => a[1] - b[1]).slice(0, 6).map(v => v.map(r1));
lm.occipitalMidlineLowest = occLow; lm.occipitalFrontMostMidline = r1(Math.max(...occMid.map(v => v[2]))); lm.occipitalMinY = r1(Math.min(...occ.map(v => v[1])));
const atlasV = verts(byId('FJ3176')), axis = verts(byId('FJ3177'));
lm.atlas = {anteriorArchFrontZ: r1(Math.max(...atlasV.filter(v => Math.abs(v[0]) < 10).map(v => v[2]))), topY: r1(Math.max(...atlasV.map(v => v[1])))};
const dens = axis.filter(v => Math.abs(v[0]) < 8).reduce((a, b) => b[1] > a[1] ? b : a); lm.axisDensTip = dens.map(r1);
lm.vertebralFrontTable = {C1: lm.atlas.anteriorArchFrontZ, ...Object.fromEntries(Object.entries(fz).map(([k, v]) => [k, r1(v)]))};
// thoracic inlet: manubrium back and top (jugular notch), first rib apex, T1/T2 front
const manMid = man.filter(v => Math.abs(v[0]) < 8), notch = manMid.reduce((a, b) => b[1] > a[1] ? b : a);
lm.manubrium = {topMidline: notch.map(r1), backZ_atNotchHeight: r1(Math.min(...manMid.filter(v => v[1] > notch[1] - 10).map(v => v[2]))), backZ_overall: r1(Math.min(...man.map(v => v[2]))), frontZ: r1(Math.max(...man.map(v => v[2])))};
for (const [side, id] of [['Left', 'FJ3228'], ['Right', 'FJ3334']]) { const rib = verts(byId(id)); const top = rib.reduce((a, b) => b[1] > a[1] ? b : a); lm.manubrium[side + 'FirstRibTop'] = top.map(r1); }
const T1 = byId('FJ3222'), T2 = byId('FJ3223'); lm.discC7T1FrontZ = r1(Math.max(...verts(byId('FJ3221')).filter(v => Math.abs(v[0]) < 10).map(v => v[2]))); lm.discT1T2FrontZ = r1(Math.max(...verts(T1).filter(v => Math.abs(v[0]) < 10).map(v => v[2]))); lm.discT2T3FrontZ = r1(Math.max(...verts(T2).filter(v => Math.abs(v[0]) < 10).map(v => v[2])));
lm.larynx = {thyroidFrontZ: r1(Math.max(...thy.map(v => v[2]))), thyroidBackZ: r1(Math.min(...thy.map(v => v[2]))), thyroidTopY: r1(Math.max(...thy.map(v => v[1]))), cricoidTopY: r1(Math.max(...cri.map(v => v[1]))), cricoidBackZ: r1(Math.min(...cri.map(v => v[2]))), cricoidFrontZ: r1(Math.max(...cri.map(v => v[2])))};
for (const [name, id] of [['trachea', 'FJ2541'], ['esophagus', 'FJ2563']]) { const vs = verts(byId(id)); lm[name] = {topY: r1(Math.max(...vs.map(v => v[1]))), bottomY: r1(Math.min(...vs.map(v => v[1]))), backZ: r1(Math.min(...vs.map(v => v[2]))), frontZ: r1(Math.max(...vs.map(v => v[2])))}; }

lm.dens_basionRegion = {occipitalLowestNearMidline: (() => { const q = occ.filter(v => Math.abs(v[0]) < 5 && v[2] > -40).reduce((a, b) => b[1] < a[1] ? b : a); return q.map(r1); })()};
if (arg('json')) fs.writeFileSync(arg('json'), JSON.stringify(out, null, 1));
if (process.argv.includes('--md')) {
  console.log('椎體前面（中線）z 與所在節：'); for (const Y of SLICES) console.log(`| ${Y} | ${out.vertebralFront[Y].z} | ${out.vertebralFront[Y].at} |`);
  for (const [gname, g] of Object.entries(out.groups)) {
    console.log(`\n## ${gname}（相對椎體前面的前後位置 mm：後緣／前緣／厚度／x 範圍／在骨內的比例%／最深 mm）`);
    for (const [k, v] of Object.entries(g)) { console.log(`\n${k} ${v.ids.join(',')}`); for (const r of v.rows) console.log(r.none ? `| ${r.y} | - |` : `| ${r.y} | ${r.back} | ${r.front} | ${r.thick} | ${r.xmin}~${r.xmax} | ${r.insideShare} | ${r.deepestInside} |`); }
  }
  console.log('\n## 椎體前面 -5 至 +30 mm 之內的結構'); for (const Y of SLICES) { console.log(`\n${Y} (${out.vertebralFront[Y].at}):`); for (const o of out.occupancy[Y]) console.log(`  ${o.zmin}~${o.zmax}  ${o.name}`); }
  console.log('\n## 層次鏈（中線 |x|<12，椎體前面=0）'); for (const Y of SLICES) console.log(Y, out.vertebralFront[Y].at, JSON.stringify(out.chain[Y]), 'skin', JSON.stringify(out.skinMidline[Y]));
  console.log('\n名稱左右與網格位置不一致：', mislabels.length ? '\n' + mislabels.join('\n') : '無');
  console.log('\n間隙（#320 定義）：', JSON.stringify(out.gaps)); console.log('\n標誌：', JSON.stringify(out.landmarks, null, 1));
} else console.log(JSON.stringify(out, null, 1));
