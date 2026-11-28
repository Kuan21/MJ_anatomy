import type * as T from 'three';
import type {LabelSpec} from '../ear-hearing/label-layer';

/** Name labels that never sit on the 3D picture: they live in two gutters left and right of the canvas (outside it), and only a thin leader line crosses the picture to the point
 *  it names. Whatever the camera does (zoom, rotate), a label cannot cover a moving structure, because no label is ever drawn over the canvas. Each label goes to the gutter on the
 *  side of its point; in each gutter the labels keep the order of their points from top to bottom and are pushed apart so they do not overlap. */
interface Item {spec: LabelSpec; box: HTMLDivElement; zh: HTMLElement; line: SVGLineElement; dot: SVGCircleElement}
export class SideLabels {
  private svg: SVGSVGElement;
  private items = new Map<string, Item>();
  /** `overlay` covers the whole stage (gutters and canvas); `left` and `right` are the gutters, `canvas` the element the 3D picture is drawn in. */
  constructor(private overlay: HTMLElement, private left: HTMLElement, private right: HTMLElement, private canvas: HTMLElement) {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); this.svg.setAttribute('class', 'swallow-leaders');
    overlay.appendChild(this.svg);
  }
  set(specs: LabelSpec[]) {
    const keep = new Set(specs.map(s => s.key));
    for (const [key, item] of this.items) if (!keep.has(key)) {item.box.remove(); item.line.remove(); item.dot.remove(); this.items.delete(key);}
    for (const spec of specs) {
      const old = this.items.get(spec.key);
      if (old) {old.spec = spec; continue;}
      const box = document.createElement('div'); box.className = 'swallow-label' + (spec.accent ? ' accent' : '');
      const en = document.createElement('span'); en.lang = 'en'; en.textContent = spec.en;
      const zh = document.createElement('small'); zh.lang = 'zh-Hant'; zh.textContent = spec.zh + (spec.schematic ? '〔示意〕' : '');
      box.appendChild(en); box.appendChild(zh); this.overlay.appendChild(box);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line'), dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '3'); this.svg.appendChild(line); this.svg.appendChild(dot);
      this.items.set(spec.key, {spec, box, zh, line, dot});
    }
  }
  /** `project` turns a world point into canvas pixels (or null behind the camera). */
  update(project: (p: T.Vector3) => {x: number; y: number} | null) {
    const o = this.overlay.getBoundingClientRect(), c = this.canvas.getBoundingClientRect(), l = this.left.getBoundingClientRect(), r = this.right.getBoundingClientRect();
    const cx = c.left - o.left, cy = c.top - o.top;
    const placed: {side: 'l' | 'r'; y: number; h: number; w: number; px: number; py: number; item: Item}[] = [];
    for (const item of this.items.values()) {
      const world = item.spec.at(), p = world && project(world);
      const show = !!p && p.x >= 0 && p.x <= c.width && p.y >= 0 && p.y <= c.height;
      item.box.style.display = item.line.style.display = item.dot.style.display = show ? '' : 'none';
      if (!show || !p) continue;
      const side = p.x < c.width / 2 ? 'l' : 'r', w = side === 'l' ? l.width - 8 : r.width - 8;
      item.box.style.width = `${Math.max(60, w)}px`;
      placed.push({side, y: 0, h: item.box.offsetHeight || 34, w, px: cx + p.x, py: cy + p.y, item});
    }
    for (const side of ['l', 'r'] as const) {
      const col = placed.filter(x => x.side === side).sort((a, b) => a.py - b.py), gap = 6, top = cy + 4, bottom = cy + c.height - 4;
      // wanted: level with the point; then pushed down to clear the one above, then up from the bottom edge
      for (const x of col) x.y = x.py - x.h / 2;
      for (let i = 0; i < col.length; i++) col[i].y = Math.max(col[i].y, i ? col[i - 1].y + col[i - 1].h + gap : top);
      for (let i = col.length - 1; i >= 0; i--) col[i].y = Math.min(col[i].y, i < col.length - 1 ? col[i + 1].y - col[i].h - gap : bottom - col[i].h);
      for (const x of col) x.y = Math.max(top, x.y);
    }
    for (const x of placed) {
      const gutter = x.side === 'l' ? l : r, bx = gutter.left - o.left + 4;
      x.item.box.style.transform = `translate(${bx.toFixed(1)}px,${x.y.toFixed(1)}px)`;
      const ex = x.side === 'l' ? bx + x.w : bx, ey = x.y + x.h / 2;
      x.item.line.setAttribute('x1', x.px.toFixed(1)); x.item.line.setAttribute('y1', x.py.toFixed(1)); x.item.line.setAttribute('x2', ex.toFixed(1)); x.item.line.setAttribute('y2', ey.toFixed(1));
      x.item.dot.setAttribute('cx', x.px.toFixed(1)); x.item.dot.setAttribute('cy', x.py.toFixed(1));
    }
  }
  dispose() {for (const item of this.items.values()) {item.box.remove();} this.svg.remove(); this.items.clear();}
}
