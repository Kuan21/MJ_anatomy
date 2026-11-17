import type * as T from 'three';

export interface LabelSpec {
  key: string;
  en: string;
  zh: string;
  /** where the label points to in world space; null hides the label (e.g. the structure is not drawn) */
  at: () => T.Vector3 | null;
  /** label position relative to the point, in pixels (default: up and to the right) */
  dx?: number;
  dy?: number;
  /** drawn in the accent colour */
  accent?: boolean;
  /** a schematic (示意) structure */
  schematic?: boolean;
}

/** Name labels with leader lines over a 3D canvas: English above, Chinese below. They follow the camera each frame and are plain DOM, so they stay sharp and readable. */
export class LabelLayer {
  private root: HTMLDivElement;
  private svg: SVGSVGElement;
  private items = new Map<string, {spec: LabelSpec; box: HTMLDivElement; zh: HTMLElement; line: SVGLineElement; dot: SVGCircleElement}>();
  constructor(host: HTMLElement) {
    this.root = document.createElement('div'); this.root.className = 'hear-labels'; this.root.setAttribute('aria-hidden', 'true');
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); this.svg.setAttribute('class', 'hear-leaders');
    this.root.appendChild(this.svg); host.appendChild(this.root);
  }
  set(specs: LabelSpec[]) {
    const keep = new Set(specs.map(s => s.key));
    for (const [key, item] of this.items) if (!keep.has(key)) {item.box.remove(); item.line.remove(); item.dot.remove(); this.items.delete(key);}
    for (const spec of specs) {
      const old = this.items.get(spec.key);
      if (old) {old.spec = spec; const text = spec.zh + (spec.schematic ? '〔示意〕' : ''); if (old.zh.textContent !== text) old.zh.textContent = text; continue;}
      const box = document.createElement('div'); box.className = 'hear-label' + (spec.accent ? ' accent' : '');
      const en = document.createElement('span'); en.lang = 'en'; en.textContent = spec.en;
      const zh = document.createElement('small'); zh.lang = 'zh-Hant'; zh.textContent = spec.zh + (spec.schematic ? '〔示意〕' : '');
      box.appendChild(en); box.appendChild(zh); this.root.appendChild(box);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line'), dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '3'); this.svg.appendChild(line); this.svg.appendChild(dot);
      this.items.set(spec.key, {spec, box, zh, line, dot});
    }
  }
  /** Moves every label to the screen position of its point. `project` turns a world point into canvas pixels (or null when behind the camera). */
  update(project: (p: T.Vector3) => {x: number; y: number} | null, width: number, height: number) {
    const placed: {x: number; y: number; w: number; h: number}[] = [];
    for (const {spec, box, line, dot} of this.items.values()) {
      const world = spec.at(), p = world && project(world);
      const show = !!p && p.x > 0 && p.x < width && p.y > 0 && p.y < height;
      box.style.display = line.style.display = dot.style.display = show ? '' : 'none';
      if (!show || !p) continue;
      const w = box.offsetWidth || 90, h = box.offsetHeight || 32;
      let x = p.x + (spec.dx ?? 28), y = p.y + (spec.dy ?? -26);
      if (x + w > width - 6) x = Math.max(6, p.x - (spec.dx ?? 28) - w);
      y = Math.min(height - h - 6, Math.max(6, y));
      // push a label down when it would sit on another one
      for (let tries = 0; tries < 8; tries++) {
        const hit = placed.find(o => x < o.x + o.w + 4 && x + w + 4 > o.x && y < o.y + o.h + 2 && y + h + 2 > o.y);
        if (!hit) break;
        y = hit.y + hit.h + 4; if (y + h > height - 6) y = Math.max(6, hit.y - h - 4);
      }
      placed.push({x, y, w, h});
      box.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      const ex = x < p.x ? x + w : x, ey = y + h / 2;
      line.setAttribute('x1', p.x.toFixed(1)); line.setAttribute('y1', p.y.toFixed(1)); line.setAttribute('x2', ex.toFixed(1)); line.setAttribute('y2', ey.toFixed(1));
      dot.setAttribute('cx', p.x.toFixed(1)); dot.setAttribute('cy', p.y.toFixed(1));
    }
  }
  dispose() {this.root.remove(); this.items.clear();}
}
