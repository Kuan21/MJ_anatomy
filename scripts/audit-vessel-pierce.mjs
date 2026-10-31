// Which arteries and veins come out through the surface of a muscle? For every vessel part (atlas, supplement, schematic) and every muscle whose box overlaps it, the vessel's vertices are
// classified as inside the muscle (odd number of surface crossings along +z) or outside, and the inside ones by depth under the surface. A vessel is listed when it has vertices inside the
// muscle within 2 mm of its surface AND vertices outside the muscle (it crosses the surface rather than running wholly in it or wholly past it).
// Many fine branches really do end in the muscle they supply, so the list is a list to look at, not a list of errors. node scripts/audit-vessel-pierce.mjs [--write]  -> docs/vessel-muscle-pierce.md
import fs from 'node:fs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {meshOf, closest} from './lib/heart-geom.mjs';

const root = new URL('../', import.meta.url), {atlas, geometry} = loadFullAtlas();
const stream = JSON.parse(fs.readFileSync(new URL('public/models/atlas-stream.json', root))), chunks = new Map();
const shown = p => { if (!chunks.has(p.chunk)) chunks.set(p.chunk, fs.readFileSync(new URL('public' + stream.chunks[p.chunk].url, root))); const b = chunks.get(p.chunk); return {positions: new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12)), indices: new Uint32Array(b.buffer.slice(b.byteOffset + p.indices, b.byteOffset + p.indices + p.indexCount * 4))}; };
const streamPart = new Map(stream.parts.map(p => [p.id, p]));

const muscles = [];
for (const p of atlas.parts) {
  if (p.system !== 'muscular' || /^HRAF|^PK|-END$/.test(p.id)) continue;
  const g = streamPart.has(p.id) && streamPart.get(p.id).reshaped ? shown(streamPart.get(p.id)) : geometry(p);
  const mesh = meshOf(g.positions, g.indices), cell = .006, grid = new Map(), key = (i, j) => i * 100003 + j;
  mesh.tris.forEach((t, k) => { const x0 = Math.min(t.a[0], t.b[0], t.c[0]), x1 = Math.max(t.a[0], t.b[0], t.c[0]), y0 = Math.min(t.a[1], t.b[1], t.c[1]), y1 = Math.max(t.a[1], t.b[1], t.c[1]);
    for (let i = Math.floor(x0 / cell); i <= Math.floor(x1 / cell); i++) for (let j = Math.floor(y0 / cell); j <= Math.floor(y1 / cell); j++) (grid.get(key(i, j)) ?? grid.set(key(i, j), []).get(key(i, j))).push(k); });
  muscles.push({name: p.name, mesh, grid, cell, key});
}
const inside = (m, p) => {
  let c = 0; const l = m.grid.get(m.key(Math.floor(p[0] / m.cell), Math.floor(p[1] / m.cell))); if (!l) return false;
  for (const k of l) { const t = m.mesh.tris[k], a = t.a, b = t.b, cc = t.c, x = p[0], y = p[1];
    const d1 = (x - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (y - b[1]), d2 = (x - cc[0]) * (b[1] - cc[1]) - (b[0] - cc[0]) * (y - cc[1]), d3 = (x - a[0]) * (cc[1] - a[1]) - (cc[0] - a[0]) * (y - a[1]);
    if (((d1 < 0) || (d2 < 0) || (d3 < 0)) && ((d1 > 0) || (d2 > 0) || (d3 > 0))) continue;
    if (Math.abs(t.n[2]) < 1e-9) continue;
    if (a[2] - ((x - a[0]) * t.n[0] + (y - a[1]) * t.n[1]) / t.n[2] > p[2]) c++; }
  return c % 2 === 1;
};
const rows = [];
for (const v of atlas.parts) {
  if (!['arterial', 'venous'].includes(v.system) || /^HRAF|-END$|^PKC/.test(v.id)) continue;
  const g = geometry(v), P = g.positions, n = P.length / 3, lo = v.bounds[0], hi = v.bounds[1];
  for (const m of muscles) {
    const b0 = m.mesh.lo, b1 = m.mesh.hi; if (lo[0] > b1[0] || hi[0] < b0[0] || lo[1] > b1[1] || hi[1] < b0[1] || lo[2] > b1[2] || hi[2] < b0[2]) continue;
    let inn = 0, shallow = 0, out = 0;
    for (let i = 0; i < n; i++) { const p = [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]]; if (p[0] < b0[0] || p[0] > b1[0] || p[1] < b0[1] || p[1] > b1[1] || p[2] < b0[2] || p[2] > b1[2]) { continue; }
      if (inside(m, p)) { inn++; if (closest(m.mesh, p).d < .002) shallow++; } else out++; }
    if (shallow >= 6 && out >= 6) rows.push({vessel: v.name, id: v.id, muscle: m.name, inside: inn, shallow, outside: out});
  }
}
// Subcutaneous vessels run in the fat above the muscle fascia: they must never lie inside a muscle, so every muscle they enter is a mistake of position (or of the muscle's size). Deep vessels
// run between muscles and into the muscles they supply; the BodyParts3D muscles also overlap the vessels along most intermuscular planes, so for those the list only shows the pairs
// with the most vertices near the surface on both sides, as a list to look at.
const SUBCUTANEOUS = /cephalic|basilic|saphenous|median (cubital|antebrachial)|superficial (epigastric|circumflex iliac|external pudendal|temporal|dorsal)|dorsal venous|dorsal digital vein|external jugular|anterior jugular/i;
const A = rows.filter(r => SUBCUTANEOUS.test(r.vessel) && r.inside >= 10).sort((a, b) => b.inside - a.inside);
const B = rows.filter(r => !SUBCUTANEOUS.test(r.vessel) && !/intercostal|phrenic/i.test(r.vessel) && r.shallow >= 15 && r.outside >= 15 && r.inside / (r.inside + r.outside) <= .5).sort((a, b) => b.shallow - a.shallow).slice(0, 40);
const table = list => ['| 血管 | 肌肉 | 肌內頂點 | 貼表面（<2 mm） | 肌外頂點 |', '| --- | --- | ---: | ---: | ---: |', ...list.map(r => `| ${r.vessel} (${r.id}) | ${r.muscle} | ${r.inside} | ${r.shallow} | ${r.outside} |`)];
const md = ['# 血管穿出肌肉表面稽核', '', `共檢查每一條動脈與靜脈（圖譜與示意）和每一塊肌肉。血管頂點用「沿 +z 穿過肌肉表面的次數為奇數」判定在肌肉內，再看離表面的深度。`, '',
  '## A. 皮下血管在肌肉內（一定是位置或肌肉大小的誤差）', '', '頭靜脈、貴要靜脈、隱靜脈、肘正中靜脈、淺腹壁動脈等走在皮下脂肪內，不該有頂點在任何肌肉內：', '', ...table(A), '',
  '## B. 深層血管貼著肌肉表面來回穿出（取貼表面頂點最多的 40 組）', '', '深層血管本來就走在肌間隙並進入所支配的肌肉；BodyParts3D 的肌肉在多數肌間平面也與血管重疊，所以下表是「要看一眼」的清單，不是錯誤清單（肋間血管與肋間肌、橫膈血管與橫膈不列）：', '', ...table(B), ''].join('\n');
if (process.argv.includes('--write')) fs.writeFileSync(new URL('docs/vessel-muscle-pierce.md', root), md);
console.log(`${rows.length} vessel x muscle pairs cross a muscle surface; ${A.length} subcutaneous vessels inside a muscle, ${B.length} deep pairs listed`);
for (const r of A.slice(0, 25)) console.log(`SUBCUTANEOUS ${r.vessel} (${r.id}) x ${r.muscle}: inside ${r.inside}, shallow ${r.shallow}, outside ${r.outside}`);
