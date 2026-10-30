// Bronchopulmonary segments as SCHEMATIC territories (示意分區) on the surface of the lung lobes.
// What the atlas really has: one mesh group per segmental bronchus (its name, e.g. "Right apical segmental bronchial tree", includes the branches inside the segment); it has NO model of
// the segments themselves (a segment is a volume of lung with no wall of its own). The territory drawn here is therefore a geometric rule, not an anatomical measurement:
//   every triangle of a lobe surface goes to the segment (of the same lobe) whose segmental bronchus is nearest to the triangle centre. Only the part of a bronchial tree beyond
//   STEM_MM from the main bronchus counts, so that the short common stem near the hilum does not claim surface. The labelling is then smoothed (majority of the three edge
//   neighbours, six passes) and islands under ISLAND triangles are given to the neighbouring segment they touch most.
// The left lung uses the merged scheme (apicoposterior S1+2, anteromedial basal S7+8) = 8 segments; the right lung has the usual 10.
import fs from 'node:fs';
import {sub, len, cross} from '../lib/paokao-util.mjs';

const data = JSON.parse(fs.readFileSync(new URL('../../app/mj-lung-segments.json', import.meta.url), 'utf8'));
export const SEGMENTS = data.segments;
const STEM_MM = 14, ISLAND = 80;
const LOBE = {
  right: {upper: 'Upper lobe of right lung', middle: 'Middle lobe of right lung', lower: 'Lower lobe of right lung'},
  left: {upper: 'Upper lobe of left lung', lower: 'Lower lobe of left lung'},
};
const MAIN = {right: 'Right main bronchus proper', left: 'Left main bronchus'};
const LOBE_EN = {upper: ['upper lobe', '上葉'], middle: ['middle lobe', '中葉'], lower: ['lower lobe', '下葉']};
/** Filled by buildSegments(): per segment the share of its lobe surface and its triangle count, for docs/lung-segments.json. */
export const segmentReport = [];

function labelLobe(U, side, lobe, segs) {
  const mesh = U.mesh(LOBE[side][lobe]), main = U.V(MAIN[side]);
  // points of each segmental bronchus (vertices and triangle centres of all its meshes), without the part within STEM_MM of the main bronchus
  const near = p => { let b = Infinity; for (const q of main) { const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2; if (d < b) b = d; } return Math.sqrt(b); };
  const pts = segs.map(s => {
    const all = []; for (const t of s.trees) for (const tr of U.mesh(t).tris) all.push(tr.a, tr.mid);
    const far = all.filter(p => near(p) > STEM_MM / 1000);
    return far.length >= 40 ? far : all;
  });
  const label = new Int16Array(mesh.tris.length);
  mesh.tris.forEach((t, i) => {
    let best = Infinity, k = 0;
    pts.forEach((list, si) => { for (const p of list) { const d = (p[0] - t.mid[0]) ** 2 + (p[1] - t.mid[1]) ** 2 + (p[2] - t.mid[2]) ** 2; if (d < best) { best = d; k = si; } } });
    label[i] = k;
  });
  // triangle neighbours through shared edges (vertices welded on position)
  const key = p => Math.round(p[0] * 1e6) + ',' + Math.round(p[1] * 1e6) + ',' + Math.round(p[2] * 1e6), ids = new Map(), vid = p => { const k = key(p); if (!ids.has(k)) ids.set(k, ids.size); return ids.get(k); };
  const edges = new Map(), nb = mesh.tris.map(() => []);
  mesh.tris.forEach((t, i) => {
    const v = [vid(t.a), vid(t.b), vid(t.c)];
    for (let k = 0; k < 3; k++) { const a = v[k], b = v[(k + 1) % 3], e = a < b ? a + '_' + b : b + '_' + a; const o = edges.get(e); if (o === undefined) edges.set(e, i); else { nb[i].push(o); nb[o].push(i); } }
  });
  for (let pass = 0; pass < 6; pass++) {
    const next = label.slice();
    for (let i = 0; i < label.length; i++) {
      const c = new Map(); for (const j of nb[i]) c.set(label[j], (c.get(label[j]) ?? 0) + 1);
      for (const [l, n] of c) if (l !== label[i] && n >= 2 && n > (c.get(label[i]) ?? 0)) next[i] = l;
    }
    label.set(next);
  }
  // islands: connected pieces of one label that are small, and not the largest piece of that label, go to the neighbouring label they touch most
  const comp = new Int32Array(label.length).fill(-1), pieces = [];
  for (let i = 0; i < label.length; i++) {
    if (comp[i] >= 0) continue;
    const id = pieces.length, list = [i]; comp[i] = id;
    for (let h = 0; h < list.length; h++) for (const j of nb[list[h]]) if (comp[j] < 0 && label[j] === label[i]) { comp[j] = id; list.push(j); }
    pieces.push({label: label[i], list});
  }
  const biggest = new Map(); for (const p of pieces) if (!biggest.has(p.label) || p.list.length > biggest.get(p.label).list.length) biggest.set(p.label, p);
  for (const p of pieces) {
    if (p.list.length >= ISLAND || biggest.get(p.label) === p) continue;
    const c = new Map(); for (const i of p.list) for (const j of nb[i]) if (label[j] !== p.label) c.set(label[j], (c.get(label[j]) ?? 0) + 1);
    const to = [...c.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]; if (to !== undefined) for (const i of p.list) label[i] = to;
  }
  return {mesh, label};
}

export default function lungSegments(U) {
  const out = [];
  segmentReport.length = 0;
  for (const side of ['right', 'left']) for (const lobe of Object.keys(LOBE[side])) {
    const segs = SEGMENTS.filter(s => s.side === side && s.lobe === lobe), {mesh, label} = labelLobe(U, side, lobe, segs);
    const areaOf = t => len(cross(sub(t.b, t.a), sub(t.c, t.a))) / 2;
    const total = mesh.tris.reduce((n, t) => n + areaOf(t), 0), lobeName = LOBE[side][lobe];
    segs.forEach((s, k) => {
      const mine = new Set(); let area = 0; mesh.tris.forEach((t, i) => { if (label[i] === k) { mine.add(t); area += areaOf(t); } });
      if (!mine.size) throw new Error(`lung segment ${s.en}: no surface`);
      segmentReport.push({key: s.key, name: s.en, lobe: lobeName, triangles: mine.size, surfaceShareOfLobe: +(area / total).toFixed(3)});
      const [lobeEn, lobeZh] = LOBE_EN[lobe], sideEn = side, sideZh = side === 'left' ? '左' : '右';
      out.push({
        name: s.en, zh: s.zh, system: 'respiratory', kind: 'segment', parent: lobeName, cap: 2600,
        geometry: [U.patchWhere(lobeName, t => mine.has(t), .0005)],
        card: {
          origin: [`${lobeEn[0].toUpperCase()}${lobeEn.slice(1)} of the ${sideEn} lung`, `${sideZh}肺${lobeZh}`],
          course: s.bronchus, supply: s.relations,
          extra: [
            {labelEn: 'Lobe', labelZh: '肺葉', en: `${lobeEn[0].toUpperCase()}${lobeEn.slice(1)} of the ${sideEn} lung`, zh: `${sideZh}肺${lobeZh}`},
            {labelEn: 'Segment', labelZh: '肺段', en: `${s.number}, ${s.en.replace(/ of (?:left|right) lung$/, '')}`, zh: `${s.number}，${s.zh.replace(/^[左右]肺[上中下]葉/, '')}`},
            {labelEn: 'Segmental bronchus', labelZh: '段支氣管', en: s.bronchus[0], zh: s.bronchus[1]},
            {labelEn: 'Main relations', labelZh: '主要毗鄰', en: s.relations[0], zh: s.relations[1]},
            ...(s.clinical ? [{labelEn: 'Clinical note', labelZh: '臨床備註', en: s.clinical[0], zh: s.clinical[1]}] : []),
          ],
        },
        refs: [],
      });
    });
  }
  return out;
}
