// The extensor mechanism of the knee, built to follow the bones and muscles under it: the quadriceps tendon (a thick band that narrows from the four heads of quadriceps to the base of
// the patella), the patellar ligament (a thick band from the patella apex to the tibial tuberosity) and the medial and lateral patellar retinacula (thin sheets beside the patella).
import {sub, add, mul, unit, len, lerp} from '../lib/paokao-util.mjs';

const REF = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.); Moore’s Clinically Oriented Anatomy, 8th ed.';
const SIDES = [{w: 'Right', sx: -1, zh: '右'}, {w: 'Left', sx: 1, zh: '左'}];

export default function knee(U) {
  const out = [], P = (x, y, z) => [x, y, z];
  for (const S of SIDES) {
    const sx = S.sx, pat = `${S.w} patella`, tib = `${S.w} tibia`, fem = `${S.w} femur`;
    const heads = ['rectus femoris', 'vastus medialis', 'vastus lateralis', 'vastus intermedius'].map(n => `${S.w} ${n}`).filter(U.has);
    const ptop = U.extreme(pat, P(0, 1, .2)), pbot = U.extreme(pat, P(0, -1, .2)), pcx = (ptop[0] + pbot[0]) / 2;
    const tub = U.extreme(tib, P(0, .3, 1), {y: [.375, .445]});
    // z of the front surface of what lies under (x, y): the muscles and the patella
    const front = (names, x, y, fallback) => { let z = -1; for (const n of names) { const h = U.rayHit(n, P(x, y, .2), P(0, 0, -1)); if (h) z = Math.max(z, h.point[2]); } return z > -1 ? z : fallback; };
    const frontOrNull = (names, x, y) => { const z = front(names, x, y, null); return z; };
    // fill missing z (no surface under the point, e.g. across the joint line) from the nearest valid neighbours in the row, then smooth three times so the sheet does not follow every facet
    const settle = rows => { const R = rows.length, C = rows[0].length; const z = rows.map(r => r.map(p => p[2])), floor = rows.map(r => r.map(p => p[2]));
      for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) if (z[i][j] == null) { let a = j - 1; while (a >= 0 && z[i][a] == null) a--; let b = j + 1; while (b < C && z[i][b] == null) b++; z[i][j] = a >= 0 && b < C ? (z[i][a] + z[i][b]) / 2 : a >= 0 ? z[i][a] : b < C ? z[i][b] : (i ? z[i - 1][j] : 0); }
      for (let pass = 0; pass < 3; pass++) { const n = z.map(r => r.slice()); for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) { let t = 0, c = 0; for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) { const a = i + di, b = j + dj; if (a >= 0 && a < R && b >= 0 && b < C) { t += z[a][b]; c++; } } n[i][j] = Math.max((z[i][j] * 2 + t / c) / 3, floor[i][j] ?? -1); } for (let i = 0; i < R; i++) z[i] = n[i]; }
      return rows.map((r, i) => r.map((p, j) => P(p[0], p[1], z[i][j]))); };
    const grid = (yTop, yBot, wTop, wBot, zOf, rows, cols, taper = () => 1) => Array.from({length: rows}, (_, i) => { const s = i / (rows - 1), y = yTop + (yBot - yTop) * s, w = (wTop + (wBot - wTop) * s) * taper(s); return Array.from({length: cols}, (_, j) => { const u = j / (cols - 1) - .5, x = pcx + u * w; return P(x, y, zOf(x, y, s) + .0018 * (1 - 4 * u * u)); }); });

    // ---- Quadriceps tendon: from about 7 cm above the patella (where the heads join), 44 mm wide narrowing to 34 mm, 6 mm thick, onto the front of the patella base.
    {
      const under = [...heads, pat], yTop = ptop[1] + .07, yBot = ptop[1] - .004;
      const g = settle(grid(yTop, yBot, .046, .030, (x, y) => front(under, x, y, ptop[2]) + .0030, 16, 9, s => 1 - .35 * s ** 1.5));
      out.push({
        name: `${S.w} quadriceps tendon`, zh: `${S.zh}股四頭肌腱`, system: 'tendon', kind: 'tendon', geometry: [U.sheet(g, .006)],
        card: {origin: ['The four parts of quadriceps femoris: rectus femoris, vastus medialis, vastus lateralis and vastus intermedius, joined about 7 cm above the patella', '股四頭肌的四個部分：股直肌、股內側肌、股外側肌與股中間肌，在髕骨上方約 7 公分處匯合'],
          insertion: ['Base (upper border) of the patella; fibres continue over the front of the patella into the patellar ligament', '髕骨底（上緣）；部分纖維越過髕骨前面延續為髕韌帶'],
          action: ['Transmits the pull of quadriceps to extend the knee; the commonest site of tendon rupture after the patellar ligament', '把股四頭肌的拉力傳到髕骨以伸直膝關節；斷裂時膝無法主動伸直']},
        refs: [REF],
      });
    }
    // ---- Patellar ligament: from the apex of the patella to the tibial tuberosity, 30 mm wide, 5 mm thick, running straight in front of the joint line.
    {
      const zTop = front([pat], pbot[0], pbot[1] + .006, pbot[2]), zBot = front([tib], tub[0], tub[1], tub[2]);
      const g = grid(pbot[1] + .003, tub[1] + .001, .034, .022, (x, y, s) => lerp([0, 0, zTop], [0, 0, zBot], s)[2] + .0035 + .004 * Math.sin(Math.PI * s), 9, 7, s => .82 + .18 * Math.sin(Math.PI * Math.min(1, s * 1.15 + .05)));
      out.push({
        name: `${S.w} patellar ligament`, zh: `${S.zh}髕韌帶`, system: 'connective', kind: 'ligament', geometry: [U.sheet(g, .007)],
        card: {origin: ['Apex and adjoining lower border of the patella', '髕骨尖與其鄰近的下緣'], course: ['Passes straight down in front of the joint line to the tibial tuberosity; the infrapatellar fat pad lies behind it', '垂直向下，走在關節線前方，止於脛骨粗隆；後面是髕下脂肪墊'], supply: ['Carries the force of quadriceps from the patella to the tibia (the patellar tendon reflex is tested by tapping it)', '把股四頭肌的力量從髕骨傳到脛骨（敲擊可引出髕腱反射）']},
        refs: [REF],
      });
    }
    // ---- Patellar retinacula: thin fibrous sheets from the sides of the patella and quadriceps tendon to the tibial condyles and the epicondyles of the femur. Each is laid on the front
    // of the femoral condyle and the tibial condyle beside the patella (2 mm off the bone, 1.6 mm thick) and spans the joint line without a gap.
    for (const [side, dx, zh, en] of [['medial', -sx, '內側', 'Medial'], ['lateral', sx, '外側', 'Lateral']]) {
      const edge = U.extreme(pat, P(dx, 0, 0)), yTop = ptop[1] - .004, yBot = tub[1] + .012, under = [pat, fem, tib];
      const xOut = U.extreme(fem, P(dx, 0, 0), {y: [(ptop[1] + pbot[1]) / 2 - .02, (ptop[1] + pbot[1]) / 2 + .02]})[0], rows = 10, cols = 7;
      const mid = (ptop[1] + pbot[1]) / 2;
      const g = [];
      let zPrev = edge[2];
      for (let i = 0; i < rows; i++) {
        const s = i / (rows - 1), y = yTop + (yBot - yTop) * s, row = [];
        for (let j = 0; j < cols; j++) {
          const t = j / (cols - 1), x = edge[0] + (xOut - edge[0]) * t * (1 - .35 * Math.abs(s - .35));
          const z0 = frontOrNull(under, x, y); row.push(P(x, y, z0 == null ? null : z0 + .0025));
        }
        g.push(row);
      }
      const gs = settle(g);
      out.push({
        name: `${S.w} ${side} patellar retinaculum`, zh: `${S.zh}髕${zh}支持帶`, system: 'connective', kind: 'retinaculum', geometry: [U.sheet(gs, .0016)],
        card: {origin: [`${en} border of the patella and the edge of the quadriceps tendon (from vastus ${side === 'medial' ? 'medialis' : 'lateralis'})`, `髕骨${zh}緣與股四頭肌腱邊緣（自股${zh}肌）`],
          course: [`A thin layer that passes beside the patella to the ${side} tibial condyle and the ${side} epicondyle of the femur`, `薄層，走在髕骨${zh}方，連到脛骨${zh}髁與股骨${zh}上髁`], supply: ['Holds the patella in the trochlear groove; the lateral one is released surgically when the patella is pulled laterally', '把髕骨固定在股骨滑車溝內；髕骨向外側脫位時，外側支持帶過緊可手術鬆解']},
        refs: [REF],
      });
    }
  }
  return out;
}
