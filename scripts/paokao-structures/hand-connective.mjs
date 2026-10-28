// Connective tissue of the forearm and hand that the atlas lacks or draws as a sliver: the interosseous membrane of the forearm (a sheet between the interosseous borders of the
// radius and ulna, with the hole the anterior interosseous artery passes through), the annular and cruciform pulleys of the four fingers, and the palmar aponeurosis.
// Everything is measured on the atlas bones (U.pca, U.axisAt, U.onSurface), so it sits on them at rest and moves with them.
import {sub, add, mul, unit, len, lerp, dot, cross} from '../lib/paokao-util.mjs';

const GRAYS = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.), ch. 7 Upper Limb';
const SIDES = [{w: 'Right', l: 'right', sx: -1, zh: '右', s: 'r'}, {w: 'Left', l: 'left', sx: 1, zh: '左', s: 'l'}];
const FINGERS = [{en: 'index finger', zh: '食指', ord: 'second'}, {en: 'middle finger', zh: '中指', ord: 'third'}, {en: 'ring finger', zh: '無名指', ord: 'fourth'}, {en: 'little finger', zh: '小指', ord: 'fifth'}];

export default function handConnective(U) {
  const out = [], P = (x, y, z) => [x, y, z];

  for (const S of SIDES) {
    // ---- Interosseous membrane of the forearm
    {
      const radius = `${S.w} radius`, ulna = `${S.w} ulna`, N = 44, rows = [];
      // the interosseous borders face each other: at each height the point of each bone surface nearest the other bone's axis
      const y0 = 1.065, y1 = .905;
      for (let i = 0; i <= N; i++) {
        const y = y0 + (y1 - y0) * i / N, ra = U.axisAt(radius, y, P(S.sx * .24, y, -.005), .002), ua = U.axisAt(ulna, y, P(S.sx * .235, y, -.005), .002);
        rows.push({y, r: U.onSurface(radius, ua, -.0004), u: U.onSurface(ulna, ra, -.0004)});
      }
      // the borders found this way are ragged where the bone surface is coarse: smooth each border along the forearm
      for (const key of ['r', 'u']) for (let pass = 0; pass < 4; pass++) { const copy = rows.map(r => r[key]); rows.forEach((row, i) => { if (i === 0 || i === N) return; row[key] = lerp(copy[i], lerp(copy[i - 1], copy[i + 1], .5), .6); }); }
      // hole for the anterior interosseous artery, which pierces the membrane near its lower end, and the gap for the posterior interosseous artery at the top edge
      const aia = `${S.w} anterior interosseous artery`, tips = U.tips(aia, .008), low = tips.reduce((a, v) => v[1] < a[1] ? v : a), hole = {y: low[1] + .004, r: .0045};
      const cols = 7, positions = [], indices = [], vid = new Map();
      const point = (i, j, side) => { const row = rows[i], t = j / cols, sag = Math.sin(t * Math.PI) * .0012; const p = lerp(row.r, row.u, t); return add(p, P(0, 0, (side ? .0004 : -.0004) + sag * .5)); };
      const key = (i, j, side) => `${i},${j},${side}`, vert = (i, j, side) => { const k = key(i, j, side); if (!vid.has(k)) { vid.set(k, positions.length / 3); positions.push(...point(i, j, side)); } return vid.get(k); };
      const inHole = (i, j) => { const m = lerp(lerp(rows[i].r, rows[i].u, (j + .5) / cols), lerp(rows[i + 1].r, rows[i + 1].u, (j + .5) / cols), .5); return Math.abs(m[1] - hole.y) < hole.r && Math.hypot(m[0] - (rows[i].r[0] + rows[i].u[0]) / 2, 0) < .02 && Math.abs(j + .5 - cols / 2) < cols * .35; };
      for (let i = 0; i < N; i++) for (let j = 0; j < cols; j++) {
        if (inHole(i, j)) continue;
        for (const side of [0, 1]) {
          const a = vert(i, j, side), b = vert(i, j + 1, side), c = vert(i + 1, j, side), d = vert(i + 1, j + 1, side);
          indices.push(...(side ? [a, b, c, b, d, c] : [a, c, b, b, c, d]));
        }
      }
      out.push({
        name: `${S.w} interosseous membrane of forearm`, zh: `${S.zh}前臂骨間膜`, system: 'connective', kind: 'ligament',
        geometry: [{positions: Float32Array.from(positions), indices: Uint32Array.from(indices)}],
        card: {origin: ['Interosseous border of the radius and the interosseous border of the ulna', '橈骨與尺骨的骨間緣'],
          course: ['A fibrous sheet stretched between the two bones, its fibres running down and towards the ulna; the anterior interosseous artery pierces it near its lower end and the posterior interosseous artery passes above its upper border', '纖維膜張於兩骨之間，纖維斜向下、朝尺側；前骨間動脈在其下端附近穿過，後骨間動脈經其上緣'],
          supply: ['Binds the radius and ulna, transmits force from the hand to the ulna, and gives origin to the deep flexor and extensor muscles', '連結橈、尺骨，把手部的力傳到尺骨，並供深層屈肌與伸肌附著']},
        refs: [GRAYS],
      });
    }
    // ---- Palmar aponeurosis: the triangular fascia of the palm, from the distal border of the flexor retinaculum (where palmaris longus ends in it) to the heads of the metacarpals,
    // where it splits into four slips for the fingers. A thin sheet over the middle of the palm, in the plane through the apex and the two outer metacarpal heads and arched a little
    // across the palm, lifted off the metacarpals by the thickness of the palm's tendons and muscles.
    {
      const retin = `Flexor retinaculum of ${S.l} wrist`, mcs = ['second', 'third', 'fourth', 'fifth'].map(o => `${S.w} ${o} metacarpal bone`);
      const apex = U.has(retin) ? U.extreme(retin, [0, -1, 0]) : U.extreme(mcs[1], [0, 1, 0]);
      const head = n => U.extreme(n, [0, -1, 0]), idx = head(mcs[0]), lit = head(mcs[3]);
      const across = unit(sub(lit, idx)), along = unit(sub(lerp(idx, lit, .5), apex)), palm = unit(cross(across, along)), up = palm[2] > 0 ? palm : mul(palm, -1);
      const rows = 40, cols = 24, lift = .0085, hw0 = .0075, hw1 = len(sub(lit, idx)) / 2 + .002, length = len(sub(lerp(idx, lit, .5), apex)), slipAt = [-.75, -.25, .25, .75];
      const at = (i, j) => { const t = i / rows, u = j / cols * 2 - 1, hw = hw0 + (hw1 - hw0) * t; return add(add(add(apex, mul(along, length * t)), mul(across, hw * u)), mul(up, lift + .0035 * Math.cos(u * Math.PI / 2) ** 2 - .002 * t)); };
      const keep = (i, j) => { const t = (i + .5) / rows, u = (j + .5) / cols * 2 - 1; return t < .8 || slipAt.some(c => Math.abs(u - c) < .17); };
      const positions = [], indices = [], id = new Map(), thick = .0014;
      const vert = (i, j, side) => { const k = `${i},${j},${side}`; if (!id.has(k)) { id.set(k, positions.length / 3); positions.push(...add(at(i, j), mul(up, side ? thick / 2 : -thick / 2))); } return id.get(k); };
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
        if (!keep(i, j)) continue;
        const a = vert(i, j, 1), b = vert(i, j + 1, 1), c = vert(i + 1, j, 1), d = vert(i + 1, j + 1, 1), a2 = vert(i, j, 0), b2 = vert(i, j + 1, 0), c2 = vert(i + 1, j, 0), d2 = vert(i + 1, j + 1, 0);
        indices.push(a, c, b, b, c, d, a2, b2, c2, b2, d2, c2);
        if (j === 0 || !keep(i, j - 1)) indices.push(a, a2, c, c, a2, c2);
        if (j === cols - 1 || !keep(i, j + 1)) indices.push(b, d, b2, b2, d, d2);
        if (i === rows - 1 || !keep(i + 1, j)) indices.push(c, c2, d, d, c2, d2);
        if (i === 0) indices.push(a, b, a2, a2, b, b2);
      }
      out.push({
        name: `${S.w} palmar aponeurosis`, zh: `${S.zh}掌腱膜`, system: 'connective', kind: 'ligament',
        geometry: [{positions: Float32Array.from(positions), indices: Uint32Array.from(indices)}],
        card: {origin: ['Distal border of the flexor retinaculum and the tendon of palmaris longus', '屈肌支持帶遠側緣與掌長肌腱'],
          course: ['A thick triangular fascia over the central palm; it splits into four longitudinal slips that blend with the fibrous sheaths of the fingers', '覆蓋掌心的厚三角形筋膜，向遠側分為四條縱束，與指纖維鞘相連'],
          supply: ['Holds the skin of the palm firmly, protects the tendons, vessels and nerves beneath it, and resists slipping of grasped objects; shortening of it causes Dupuytren contracture', '固定掌部皮膚、保護深面肌腱、血管與神經，並防止握持物滑動；其攣縮造成杜普宜特朗攣縮']},
        refs: [GRAYS],
      });
    }
    // ---- Pulleys of the four fingers
    const bone = n => `${n}`;
    for (const F of FINGERS) {
      const pp = `Proximal phalanx of ${S.l} ${F.en}`, mp = `Middle phalanx of ${S.l} ${F.en}`;
      const frame = name => {
        const q = U.pca(name); let a = q.axis, lo = q.lo, hi = q.hi;
        if (dot(a, [0, -1, 0]) < 0) { a = mul(a, -1); [lo, hi] = [-hi, -lo]; }          // axis points to the fingertip; lo is the base of the bone, hi its head
        const nn = unit(sub([0, 0, 1], mul(a, a[2])));                                      // palmar direction: the palm faces forward in the anatomical position
        return {c: q.c, a, lo, hi, n: nn, l: unit(cross(a, nn)), name};
      };
      const section = (f, s, half) => {
        const vs = U.V(f.name).filter(v => Math.abs(dot(sub(v, f.c), f.a) - s) < half);
        if (vs.length < 6) return null;
        let pe = -Infinity, hw = 0, cn = 0, cl = 0; for (const v of vs) { const d = sub(v, f.c); pe = Math.max(pe, dot(d, f.n)); hw = Math.max(hw, Math.abs(dot(d, f.l))); cn += dot(d, f.n) / vs.length; cl += dot(d, f.l) / vs.length; }
        return {pe, hw, centre: add(add(f.c, mul(f.a, s)), add(mul(f.n, cn), mul(f.l, cl)))};
      };
      const arch = (f, s, axial, thick, clearance) => {
        const sec = section(f, s, Math.max(.0015, axial / 2)); if (!sec) return null;
        const A = sec.pe - dot(sub(sec.centre, add(f.c, mul(f.a, s))), f.n) + clearance, B = sec.hw + .0012, pts = [];
        for (let k = 0; k <= 8; k++) { const th = Math.PI * k / 8; pts.push(add(add(sec.centre, mul(f.l, B * Math.cos(th))), mul(f.n, A * Math.sin(th) - .0006 * Math.cos(th) ** 2))); }
        return U.ribbon(pts, thick, axial, f.a, 20);       // width across the radial direction is the thickness; the band is `axial` long along the finger
      };
      const fp = frame(pp), fm = frame(mp), annular = [], cruciform = [];
      const lenP = fp.hi - fp.lo, lenM = fm.hi - fm.lo;
      const push = (list, f, frac, axial, thick, clear) => { const g = arch(f, f.lo + (f.hi - f.lo) * frac, axial, thick, clear); if (g) list.push(g); };
      push(annular, fp, -.04, .0065, .0007, .0032);                        // A1 over the metacarpophalangeal joint
      push(annular, fp, .30, Math.min(.0115, lenP * .38), .0007, .0034);   // A2 on the proximal phalanx
      push(annular, fp, 1.0, .0038, .0007, .0032);                         // A3 over the proximal interphalangeal joint
      push(annular, fm, .48, Math.min(.0075, lenM * .3), .0007, .0030);    // A4 on the middle phalanx
      push(annular, fm, 1.0, .0036, .0007, .0028);                         // A5 over the distal interphalangeal joint
      push(cruciform, fp, .66, .0024, .0004, .0030);                       // C1
      push(cruciform, fm, .12, .0024, .0004, .0030);                       // C2
      push(cruciform, fm, .80, .0024, .0004, .0028);                       // C3
      const card = (what, whatZh, extra, extraZh) => ({
        origin: [`Palmar margins of the phalanges and the palmar plates of the finger joints (${extra})`, `指骨掌側緣與指關節掌板（${extraZh}）`],
        course: [`Arch over the flexor tendons and hold them against the bones; with the flexor tendon sheath they form the fibrous digital sheath`, `橫跨屈肌腱，把肌腱固定在指骨上；與屈肌腱滑液鞘共同構成指纖維鞘`],
        supply: [`${what}: stops the flexor tendons from bowing away from the bones in flexion (bowstringing), so that the pull of the muscle bends the finger`, `${whatZh}：避免屈指時屈肌腱離開指骨呈弓弦狀，讓肌肉的拉力轉為屈指動作`],
      });
      if (annular.length) out.push({name: `${S.w} ${F.en} annular pulleys`, zh: `${S.zh}${F.zh}環狀滑車`, system: 'connective', kind: 'ligament', geometry: annular, card: card('Annular pulleys A1–A5', '環狀滑車（A1–A5）', 'A1 and A3 on the joints, A2 and A4 on the shafts, A5 on the distal joint', 'A1、A3、A5 在關節，A2、A4 在骨幹'), refs: [GRAYS]});
      if (cruciform.length) out.push({name: `${S.w} ${F.en} cruciform pulleys`, zh: `${S.zh}${F.zh}十字滑車`, system: 'connective', kind: 'ligament', geometry: cruciform, card: card('Cruciform pulleys C1–C3 (drawn as narrow bands)', '十字滑車（C1–C3；以窄帶表示）', 'C1 to C3 between the annular pulleys', 'C1–C3 位於環狀滑車之間'), refs: [GRAYS]});
    }
  }
  return out;
}
