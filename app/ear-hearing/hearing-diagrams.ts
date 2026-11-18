import {basePosition, formatHz, hzAt, sliderToHz, waveValue, WAVE_HZ} from './hearing-data';

/** Two-dimensional drawings for the parts of the hearing animation that the 3D model does not have: the unrolled cochlea (step 3 "unrolled view"), the organ of Corti (step 4) and the
 *  synapse of the inner hair cell (step 5). Each factory fills an <svg viewBox="0 0 960 540"> and returns `draw(t, loud, freqSlider)`. */
export interface Diagram {draw: (t: number, loud: number, freqSlider: number) => void}

const NS = 'http://www.w3.org/2000/svg';
function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent?: Element) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  parent?.appendChild(e);
  return e;
}
function label(g: Element, x: number, y: number, en: string, zh: string, anchor = 'start', lx?: number, ly?: number) {
  if (lx !== undefined && ly !== undefined) el('line', {x1: lx, y1: ly, x2: x + (anchor === 'end' ? 6 : anchor === 'start' ? -6 : 0), y2: y - 6, class: 'lead'}, g);
  if (en) {const t = el('text', {x, y, class: 'en', 'text-anchor': anchor}, g); t.textContent = en;}
  if (zh) {const t = el('text', {x, y: y + (en ? 19 : 0), class: 'zh', 'text-anchor': anchor}, g); t.textContent = zh;}
}
const defs = (svg: SVGSVGElement) => {
  const d = el('defs', {}, svg), m = el('marker', {id: 'hear-arr', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse'}, d);
  el('path', {d: 'M0,0 L10,5 L0,10 z', fill: '#5d6c76'}, m);
};

// ---- the unrolled cochlea --------------------------------------------------------------------------------------------

export function createUnrolled(svg: SVGSVGElement): Diagram {
  svg.replaceChildren(); defs(svg);
  const X0 = 150, X1 = 845, xOf = (u: number) => X0 + u * (X1 - X0);
  el('path', {d: 'M150,170 L845,170 C885,170 900,200 900,268 C900,335 885,365 845,365 L150,365 Z', fill: '#d6e8f4', stroke: '#9fbfd6', 'stroke-width': 2}, svg);
  el('rect', {x: 150, y: 250, width: 695, height: 36, fill: '#d9efe6'}, svg);
  el('line', {x1: 150, y1: 250, x2: 845, y2: 250, stroke: '#6f9f8f', 'stroke-width': 2}, svg);
  const bm = el('path', {fill: 'none', stroke: '#42525d', 'stroke-width': 4, 'stroke-linecap': 'round'}, svg);
  el('rect', {x: 128, y: 186, width: 22, height: 50, fill: '#ece6d6', stroke: '#b9ad92'}, svg);
  const piston = el('rect', {x: 138, y: 190, width: 10, height: 42, rx: 2, fill: '#d9d0bb', stroke: '#9c9077'}, svg);
  const round = el('path', {d: 'M150,312 Q150,330 150,348', fill: 'none', stroke: '#5f7f99', 'stroke-width': 3}, svg);
  const peakLine = el('line', {y1: 160, y2: 375, stroke: '#2f7d6d', 'stroke-width': 2, 'stroke-dasharray': '6 5'}, svg);
  const peakText = el('text', {y: 150, class: 'en', 'text-anchor': 'middle', fill: '#2f7d6d'}, svg);
  el('path', {d: 'M150,420 L845,402 L845,446 L150,428 Z', fill: '#bfc9cf', opacity: .7}, svg);
  const g = el('g', {}, svg);
  label(g, 300, 206, 'Scala vestibuli', '前庭階（外淋巴）');
  label(g, 300, 244, 'Cochlear duct', '蝸管（內淋巴）');
  label(g, 700, 330, 'Basilar membrane', '基底膜', 'middle', 700, 292);
  label(g, 300, 330, 'Scala tympani', '鼓階（外淋巴）');
  label(g, 890, 140, 'Helicotrema', '蝸孔', 'end', 880, 200);
  label(g, 36, 180, 'Oval window', '卵圓窗');
  label(g, 36, 330, 'Round window', '圓窗');
  label(g, 150, 396, 'Base: narrow, stiff', '蝸底：窄而硬 → 高頻');
  label(g, 845, 396, 'Apex: wide, floppy', '蝸頂：寬而軟 → 低頻', 'end');
  label(g, 520, 420, '', '基底膜寬度（示意）', 'middle');
  for (const f of [20000, 8000, 2000, 500, 125, 20]) {
    const x = xOf(basePosition(f));
    el('line', {x1: x, y1: 448, x2: x, y2: 458, stroke: '#5d6c76'}, g);
    const t = el('text', {x, y: 482, class: 'zh', 'text-anchor': 'middle'}, g); t.textContent = formatHz(f);
  }
  return {
    draw(t, loud, freqSlider) {
      const peak = basePosition(sliderToHz(freqSlider)), amp = 24 * loud;
      let d = '';
      for (let x = X0; x <= X1; x += 4) {const u = (x - X0) / (X1 - X0); d += (x === X0 ? 'M' : 'L') + x + ',' + (286 - amp * waveValue(u, peak, t, 1)).toFixed(1);}
      bm.setAttribute('d', d);
      const s = Math.sin(2 * Math.PI * WAVE_HZ * t);
      piston.setAttribute('transform', `translate(${(s * loud * 4).toFixed(2)},0)`);
      round.setAttribute('d', `M150,312 Q${(150 - s * loud * 10).toFixed(1)},330 150,348`);
      const x = xOf(peak);
      peakLine.setAttribute('x1', String(x)); peakLine.setAttribute('x2', String(x));
      peakText.setAttribute('x', String(Math.min(Math.max(x, 260), 780)));
      peakText.textContent = '最大振動 Peak · ' + formatHz(hzAt(peak));
    },
  };
}

// ---- organ of Corti -------------------------------------------------------------------------------------------------

export function createCorti(svg: SVGSVGElement): Diagram {
  svg.replaceChildren(); defs(svg);
  el('rect', {x: 0, y: 40, width: 960, height: 360, fill: '#d9efe6'}, svg);
  el('rect', {x: 0, y: 408, width: 960, height: 132, fill: '#d6e8f4'}, svg);
  el('path', {d: 'M20,380 L232,380 L232,410 L20,410 Z', fill: '#ece6d6', stroke: '#b9ad92'}, svg);
  el('path', {d: 'M40,330 L40,250 C90,225 150,214 215,238 C235,248 240,270 232,300 L232,330 Z', fill: '#e8d6b8', stroke: '#bca57d'}, svg);
  const organ = el('g', {}, svg);
  el('rect', {x: 232, y: 400, width: 560, height: 8, fill: '#42525d'}, organ);
  el('path', {d: 'M232,400 C250,360 280,340 312,332 L312,400 Z', fill: '#efe3d3', stroke: '#c9b8a6'}, organ);
  el('path', {d: 'M392,400 L440,262 M498,400 L452,262', stroke: '#c9b8a6', 'stroke-width': 7, 'stroke-linecap': 'round'}, organ);
  const deiters = el('g', {fill: '#efe3d3', stroke: '#c9b8a6'}, organ);
  el('path', {d: 'M640,258 C700,250 765,300 790,400 L640,400 Z', fill: '#efe3d3', stroke: '#c9b8a6'}, organ);
  const ihc = el('path', {d: 'M315,255 C298,282 304,322 330,334 C356,322 362,282 345,255 Z', fill: '#f2d2c2', stroke: '#b88c79', 'stroke-width': 2}, organ);
  el('circle', {cx: 330, cy: 300, r: 8, fill: '#d8a996'}, organ);
  const ohcLayer = el('g', {}, organ), OHC = [525, 568, 611];
  const ohcs = OHC.map(cx => {el('path', {d: `M${cx - 12},318 L${cx + 12},318 L${cx + 8},400 L${cx - 8},400 Z`}, deiters); return el('rect', {x: cx - 11, y: 258, width: 22, height: 60, rx: 10, fill: '#f2d2c2', stroke: '#b88c79', 'stroke-width': 2}, ohcLayer);});
  el('line', {x1: 316, y1: 256, x2: 640, y2: 256, stroke: '#8d7a6b', 'stroke-width': 2}, organ);
  const bundleLayer = el('g', {}, organ);
  const bundle = (cx: number, top: number, hs: number[]) => {const g = el('g', {}, bundleLayer); hs.forEach((h, k) => el('line', {x1: cx - 6 + k * 6, y1: top, x2: cx - 6 + k * 6, y2: top - h, stroke: '#6b4f45', 'stroke-width': 3, 'stroke-linecap': 'round'}, g)); return {g, cx, top};};
  const bundles = [bundle(330, 255, [10, 14, 18]), ...OHC.map(cx => bundle(cx, 258, [12, 18, 24]))];
  el('path', {d: 'M330,334 C320,360 270,372 232,392', fill: 'none', stroke: '#e0b21c', 'stroke-width': 4}, organ);
  const ionLayer = el('g', {}, organ);
  const kions = Array.from({length: 8}, () => {const g = el('g', {}, ionLayer); el('circle', {r: 8, fill: '#8a5cc7'}, g); const t = el('text', {'text-anchor': 'middle', y: 4, 'font-size': 10, fill: '#fff', 'font-weight': 700}, g); t.textContent = 'K⁺'; return g;});
  const tect = el('path', {d: 'M120,215 C250,205 450,212 670,222 L670,240 C600,238 450,232 300,232 C220,232 160,236 120,236 Z', fill: '#e7cfe4', 'fill-opacity': .85, stroke: '#b892b4', 'stroke-width': 2}, svg);
  const g = el('g', {}, svg);
  label(g, 40, 66, 'Endolymph', '內淋巴（蝸管）：K⁺ 濃度高，電位約 +80 mV');
  label(g, 40, 448, 'Perilymph', '外淋巴（鼓階）：Na⁺ 高、K⁺ 低');
  label(g, 330, 130, 'Inner hair cell', '內毛細胞（一排）', 'middle', 330, 240);
  label(g, 590, 130, 'Outer hair cells', '外毛細胞（三排）', 'middle', 565, 232);
  label(g, 790, 190, 'Tectorial membrane', '蓋膜', 'middle', 660, 224);
  label(g, 446, 452, 'Tunnel', '柯蒂氏隧道', 'middle', 446, 372);
  label(g, 700, 440, 'Basilar membrane', '基底膜', 'middle', 700, 408);
  label(g, 130, 350, 'Spiral ganglion ←', '往螺旋神經節', 'middle');
  label(g, 130, 196, 'Spiral limbus', '螺旋緣', 'middle');
  return {
    draw(t, loud) {
      const th = -Math.sin(2 * Math.PI * 1.1 * t) * 2.6 * loud;   // negative: the basilar membrane moves up
      organ.setAttribute('transform', `rotate(${th.toFixed(3)} 232 404)`);
      tect.setAttribute('transform', `rotate(${(th * .55).toFixed(3)} 120 225)`);
      const tilt = -th * 6, dep = Math.max(0, Math.min(1, -th / 2.6 / Math.max(loud, .15))) * Math.min(1, loud * 1.4);
      bundles.forEach(b => b.g.setAttribute('transform', `rotate(${tilt.toFixed(2)} ${b.cx} ${b.top})`));
      const mix = (a: number[], b: number[], f: number) => a.map((v, k) => Math.round(v + (b[k] - v) * f)), fill = `rgb(${mix([242, 210, 194], [246, 150, 120], dep)})`;
      ihc.setAttribute('fill', fill);
      ohcs.forEach(r => {r.setAttribute('fill', fill); r.setAttribute('transform', `translate(0,258) scale(1,${(1 - .09 * dep + .04 * Math.max(0, th / 2.6)).toFixed(3)}) translate(0,-258)`);});
      const xs = [330, 330, 525, 525, 568, 568, 611, 611];
      kions.forEach((k, i) => {
        const ph = (t * .9 + i * .37) % 1;
        k.setAttribute('transform', `translate(${xs[i] + (i % 2 ? 5 : -5)},${(196 + ph * 58).toFixed(1)})`);
        k.setAttribute('opacity', (dep > .15 ? dep * (1 - ph * .6) : 0).toFixed(2));
      });
    },
  };
}

// ---- synapse --------------------------------------------------------------------------------------------------------

export function createSynapse(svg: SVGSVGElement): Diagram {
  svg.replaceChildren(); defs(svg);
  el('path', {d: 'M260,30 L260,250 C260,300 300,320 480,320 C660,320 700,300 700,250 L700,30', fill: '#f2d2c2', stroke: '#b88c79', 'stroke-width': 3}, svg);
  el('ellipse', {cx: 480, cy: 120, rx: 62, ry: 40, fill: '#e3b7a3'}, svg);
  el('ellipse', {cx: 480, cy: 268, rx: 8, ry: 26, fill: '#6a5677'}, svg);
  const vesLayer = el('g', {fill: '#7bc79a', stroke: '#3aa36d'}, svg);
  [[468, 250], [492, 250], [466, 272], [494, 272], [470, 292], [490, 292]].forEach(p => el('circle', {cx: p[0], cy: p[1], r: 6}, vesLayer));
  const released = el('circle', {r: 6}, vesLayer);
  el('rect', {x: 425, y: 312, width: 12, height: 14, rx: 2, fill: '#e07b2b'}, svg); el('rect', {x: 523, y: 312, width: 12, height: 14, rx: 2, fill: '#e07b2b'}, svg);
  const bouton = el('path', {d: 'M400,340 C400,331 560,331 560,340 C560,372 520,392 492,402 L468,402 C440,392 400,372 400,340 Z', fill: '#f6dc7c', stroke: '#c9a21f', 'stroke-width': 2}, svg);
  const fiber = el('path', {d: 'M480,402 C480,440 420,470 282,470', fill: 'none', stroke: '#e0b21c', 'stroke-width': 7, 'stroke-linecap': 'round'}, svg);
  el('circle', {cx: 260, cy: 470, r: 22, fill: '#f6dc7c', stroke: '#c9a21f', 'stroke-width': 2}, svg);
  el('path', {d: 'M238,470 L60,470', stroke: '#e0b21c', 'stroke-width': 7, 'stroke-linecap': 'round', 'marker-end': 'url(#hear-arr)'}, svg);
  const ca = Array.from({length: 6}, () => el('circle', {r: 4, fill: '#e07b2b'}, svg));
  const glu = Array.from({length: 8}, () => el('circle', {r: 3.5, fill: '#3aa36d'}, svg));
  const spikes = Array.from({length: 5}, () => el('circle', {r: 8, fill: '#ff7a00'}, svg));
  const total = (fiber as SVGPathElement).getTotalLength();
  const g = el('g', {}, svg);
  label(g, 20, 70, 'Inner hair cell', '內毛細胞底部');
  label(g, 590, 250, 'Ribbon synapse', '帶狀突觸＋囊泡', 'start', 492, 262);
  label(g, 590, 306, 'Ca²⁺ channel', '電位門控鈣通道', 'start', 537, 318);
  label(g, 590, 362, 'Glutamate', '麩胺酸', 'start', 562, 346);
  label(g, 580, 424, 'Afferent fiber (type I)', '第一型傳入纖維', 'start', 500, 412);
  label(g, 260, 516, 'Spiral ganglion', '螺旋神經節（蝸軸內）', 'middle');
  label(g, 40, 450, '→ Cochlear nerve (CN VIII)', '耳蝸神經');
  return {
    draw(t, loud) {
      const period = 1.8 / (.6 + loud * .6), ph = (t % period) / period;
      ca.forEach((c, k) => {const x = (k < 3 ? 431 : 529) + (k % 3 - 1) * 4, s = Math.min(1, Math.max(0, (ph - (k % 3) * .05) / .28)); c.setAttribute('cx', String(x)); c.setAttribute('cy', (370 - s * 80).toFixed(1)); c.setAttribute('opacity', ph < .4 ? (1 - s * .6).toFixed(2) : '0');});
      let vy = 292, vr = 6;
      if (ph > .28 && ph < .45) vy = 292 + (ph - .28) / .17 * 22; else if (ph >= .45 && ph < .52) {vy = 314; vr = 6 * (1 - (ph - .45) / .07);} else if (ph >= .52) vr = 0;
      released.setAttribute('cx', '480'); released.setAttribute('cy', vy.toFixed(1)); released.setAttribute('r', Math.max(0, vr).toFixed(2));
      glu.forEach((g2, k) => {const s = Math.min(1, Math.max(0, (ph - .47) / .18)); g2.setAttribute('cx', (480 + (k - 3.5) * 14 * s).toFixed(1)); g2.setAttribute('cy', (318 + s * 24).toFixed(1)); g2.setAttribute('opacity', ph > .47 && ph < .75 ? '1' : '0');});
      bouton.setAttribute('fill', ph > .6 && ph < .75 ? '#ffd04a' : '#f6dc7c');
      const n = 1 + Math.round(loud * 3);
      spikes.forEach((s, k) => {
        const u = (ph - .62 - k * .07) / .36;
        if (k < n && u >= 0 && u <= 1) {const p = (fiber as SVGPathElement).getPointAtLength(u * total); s.setAttribute('cx', String(p.x)); s.setAttribute('cy', String(p.y)); s.setAttribute('opacity', '1');} else s.setAttribute('opacity', '0');
      });
    },
  };
}
