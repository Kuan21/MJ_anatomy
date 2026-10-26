import * as T from 'three';
import {ConvexGeometry} from 'three/examples/jsm/geometries/ConvexGeometry.js';

/** Geometry taken from the loaded brain model (see createBrainViewer.exportForCsf). Everything else in the animation is a schematic drawn from landmarks measured on these. */
export interface CsfSource {
  lateral: T.BufferGeometry[]; choroid: T.BufferGeometry[]; third: T.BufferGeometry[]; aqueduct: T.BufferGeometry[]; fourth: T.BufferGeometry[]; sinus: T.BufferGeometry[];
  cloud: Float32Array; stem: Float32Array; brainstem: T.Box3; cerebellum: T.Box3; cerebrum: T.Box3;
}
export const CSF_CYCLE = 36;
export const CSF_STEPS = [
  {en: 'Choroid plexus secretes CSF', zh: '脈絡叢分泌腦脊髓液', note: '側腦室脈絡叢最多；第三、第四腦室亦有脈絡叢。'},
  {en: 'Lateral ventricle → Interventricular foramen (of Monro)', zh: '側腦室 → 室間孔（Monro 孔）', note: '兩側側腦室各經一個室間孔通往第三腦室。'},
  {en: 'Third ventricle', zh: '第三腦室', note: '位於兩側視丘之間。'},
  {en: 'Cerebral aqueduct (of Sylvius)', zh: '大腦導水管', note: '穿過中腦，連接第三與第四腦室。'},
  {en: 'Fourth ventricle', zh: '第四腦室', note: '菱形窩，位於橋腦與延腦後方。'},
  {en: 'Median aperture (Magendie) ×1 and lateral apertures (Luschka) ×2 → cisterna magna → subarachnoid space', zh: '正中孔（Magendie）×1、外側孔（Luschka）×2 → 小腦延髓池 → 蛛網膜下腔', note: '少量 CSF 進入脊髓中央管（青春期後常閉鎖，為盲端）。'},
  {en: 'Subarachnoid space: over the hemispheres, and down the spinal cord to the lumbar cistern and back', zh: '蛛網膜下腔：一路流過大腦半球表面；另一路沿脊髓向下至腰池再回流', note: '腰池（圓錐至 S2）內有馬尾與終絲；腰椎穿刺是在腰池抽取 CSF，並非由中央管抽。'},
  {en: 'Arachnoid granulations / villi → superior sagittal sinus → venous system → right atrium', zh: '蛛網膜顆粒／絨毛 → 上矢狀竇 → 靜脈系統 → 右心房', note: '右心房只以文字表示。'},
] as const;

type V = [number, number, number];
const P = (x: number, y: number, z: number): V => [x, y, z];

interface Route {steps: V[][]; weight: number; fade?: boolean}
interface Structure {steps: number[]; materials: T.MeshStandardMaterial[]; base: number; lit: number; baseOpacity: number}

/** Looped, self-playing CSF flow in its own scene. It never touches the main viewer; `onStep` reports the highlighted step (0–7) when it changes. */
export interface CsfQuality {particles?: number; detail?: number; pixelRatio?: number}
export function createCsfScene(host: HTMLElement, source: CsfSource, onStep: (step: number) => void, quality: CsfQuality = {}) {
  const detail = quality.detail ?? 1;
  const renderer = new T.WebGLRenderer({antialias: true, alpha: false, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.pixelRatio ?? 1.5));
  renderer.setClearColor('#dfe5e8');
  renderer.outputColorSpace = T.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-label', '腦脊髓液流向動畫');
  canvas.setAttribute('role', 'img');
  host.appendChild(canvas);
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(28, 1, .01, 20);
  scene.add(new T.HemisphereLight('#ffffff', '#8a9aa6', 2.4));
  const key = new T.DirectionalLight('#ffffff', 2); key.position.set(2, 2, 2); scene.add(key);

  const structures: Structure[] = [];
  const material = (color: string, opacity = 1, emissive = '#000000') => new T.MeshStandardMaterial({color, roughness: .55, metalness: 0, transparent: opacity < 1, opacity, depthWrite: opacity >= .95, emissive, side: T.DoubleSide});
  const add = (geometry: T.BufferGeometry, mat: T.MeshStandardMaterial, steps: number[] = [], lit = .6) => {
    const mesh = new T.Mesh(geometry, mat); scene.add(mesh);
    if (steps.length) structures.push({steps, materials: [mat], base: 0, lit, baseOpacity: mat.opacity});
    return mesh;
  };
  const tube = (points: V[], radius: number | ((t: number) => number), mat: T.MeshStandardMaterial, steps: number[] = [], samples = 48, sides = 10, lit = .6) => {
    const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)), false, 'centripetal');
    samples = Math.round(samples * detail); sides = Math.max(sides, Math.round(sides * detail));
    const frames = curve.computeFrenetFrames(samples, false), pos: number[] = [], idx: number[] = [];
    const r = typeof radius === 'number' ? () => radius : radius;
    for (let i = 0; i <= samples; i++) {
      const t = i / samples, c = curve.getPointAt(t), n = frames.normals[i], b = frames.binormals[i];
      for (let j = 0; j < sides; j++) {const a = j / sides * Math.PI * 2; pos.push(c.x + (n.x * Math.cos(a) + b.x * Math.sin(a)) * r(t), c.y + (n.y * Math.cos(a) + b.y * Math.sin(a)) * r(t), c.z + (n.z * Math.cos(a) + b.z * Math.sin(a)) * r(t));}
    }
    for (let i = 0; i < samples; i++) for (let j = 0; j < sides; j++) {const a = i * sides + j, b = i * sides + (j + 1) % sides, c = (i + 1) * sides + j, d = (i + 1) * sides + (j + 1) % sides; idx.push(a, b, c, b, d, c);}
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    return add(g, mat, steps, lit);
  };
  const ball = (c: V, r: number, mat: T.MeshStandardMaterial, steps: number[] = [], sx = 1, sy = 1, sz = 1) => {
    const g = new T.SphereGeometry(r, 20, 14); g.scale(sx, sy, sz); g.translate(...c); return add(g, mat, steps);
  };

  // ---- landmarks from the model
  const bs = source.brainstem, cb = source.cerebellum, cr = source.cerebrum;
  const y0 = bs.min.y + .004, zf = (() => {
    // z of the lowest part of the brainstem (the medulla): where the cord continues
    let sum = 0, n = 0;
    for (let i = 0; i < source.stem.length; i += 3) if (source.stem[i + 1] < bs.min.y + .008) {sum += source.stem[i + 2]; n++;}
    return n ? sum / n : (bs.min.z + bs.max.z) / 2;
  })();           // foramen magnum level and the cord's z behind the clivus
  const cisternaY = Math.max(bs.min.y + .02, cb.min.y + .004), cisternaZ = cb.min.z + .016;
  // centre line of the superior sagittal sinus: mean of the vertices in each z bin
  const sinusPts: V[] = [];
  {
    const bins = new Map<number, [number, number, number]>();
    for (const g of source.sinus) {
      const a = g.getAttribute('position');
      for (let i = 0; i < a.count; i++) {const k = Math.round(a.getZ(i) / .006), e = bins.get(k) ?? [0, 0, 0]; e[0] += a.getY(i); e[1] += a.getZ(i); e[2]++; bins.set(k, e);}
    }
    for (const k of [...bins.keys()].sort((p, q) => p - q)) {const e = bins.get(k)!; if (e[2] > 3) sinusPts.push(P(0, e[0] / e[2], e[1] / e[2]));}
  }
  const sinusAt = (z: number): V => sinusPts.reduce((best, p) => Math.abs(p[2] - z) < Math.abs(best[2] - z) ? p : best, sinusPts[0] ?? P(0, cr.max.y - .01, z));
  const vertex = sinusAt(cr.getCenter(new T.Vector3()).z - .01);
  const granZ = vertex[2];

  // ---- schematic spinal canal (not to scale: the cord is drawn about a third of its real length)
  const L = .22, cordEnd = .62;
  const spine = (t: number): V => P(0, y0 - L * t, zf - .004 + .028 * Math.sin(t * Math.PI * 1.15) - .012 * t);
  const spineSample = (a: number, b: number, n: number, dz = 0): V[] => Array.from({length: n}, (_, i) => {const p = spine(a + (b - a) * i / (n - 1)); return P(p[0], p[1], p[2] + dz);});

  // ---- translucent brain envelope, subarachnoid space and cord
  const envelope = (() => {
    const pts: T.Vector3[] = [];
    for (let i = 0; i < source.cloud.length; i += 3) pts.push(new T.Vector3(source.cloud[i], source.cloud[i + 1], source.cloud[i + 2]));
    const centre = new T.Vector3(); for (const p of pts) centre.add(p); centre.divideScalar(pts.length || 1);
    const g = new ConvexGeometry(pts.map(p => p.clone().sub(centre).multiplyScalar(1.03).add(centre)));
    return g;
  })();
  add(envelope, material('#d8c4c0', .16), [], 0);
  {
    const pts: T.Vector3[] = []; for (let i = 0; i < source.stem.length; i += 3) pts.push(new T.Vector3(source.stem[i], source.stem[i + 1], source.stem[i + 2]));
    if (pts.length > 4) add(new ConvexGeometry(pts), material('#d6b9a4', .55), [], 0);
  }
  const sasMat = material('#9cc4de', .22, '#2a5a7a');
  add(envelope.clone().scale(1.05, 1.04, 1.04), sasMat, [7], .25).position.set(-cr.getCenter(new T.Vector3()).x * .05, -cr.getCenter(new T.Vector3()).y * .04, -cr.getCenter(new T.Vector3()).z * .04);
  for (const g of source.lateral) add(g.clone(), material('#6aa0c8', .5, '#1c4a70'), [1, 2], .9);
  for (const g of source.choroid) add(g.clone(), material('#c75a5a', .9, '#7a1e1e'), [1], .8);
  for (const g of source.third) add(g.clone(), material('#6aa0c8', .55, '#1c4a70'), [3], .9);
  for (const g of source.aqueduct) add(g.clone(), material('#6aa0c8', .75, '#1c4a70'), [4], 1);
  for (const g of source.fourth) add(g.clone(), material('#6aa0c8', .55, '#1c4a70'), [5], .9);
  // foramina and apertures: short schematic tubes
  const holeMat = () => material('#6aa0c8', .85, '#1c4a70');
  for (const s of [-1, 1]) tube([P(s * .014, 1.640, .004), P(s * .008, 1.637, .012), P(s * .003, 1.632, .015), P(0, 1.629, .013)], .0014, holeMat(), [2], 20, 8, 1);
  tube([P(0, 1.572, -.032), P(0, 1.566, -.040), P(0, cisternaY + .004, cisternaZ + .006)], .0016, holeMat(), [6], 20, 8, 1);
  for (const s of [-1, 1]) tube([P(s * .014, 1.575, -.025), P(s * .030, 1.568, -.024), P(s * .038, 1.560, -.036)], .0015, holeMat(), [6], 20, 8, 1);
  // cisterna magna and the basal cisterns
  ball(P(0, cisternaY, cisternaZ), .012, sasMat.clone(), [6, 7], 1.1, 1, 1.2);
  // spinal cord, central canal, subarachnoid sac, cauda equina
  const cordMat = material('#d9c9b9', 1);
  tube(spineSample(0, cordEnd, 40), t => .0044 * (1 - .6 * t ** 3), cordMat, [], 60, 12, 0);
  tube(spineSample(0, cordEnd, 40), .0006, material('#4f8cb8', .95, '#12385a'), [6], 60, 6, 1);
  const sac = (t: number) => t < cordEnd ? .0088 : .0088 + .0024 * Math.sin((t - cordEnd) / (1 - cordEnd) * Math.PI * .9) - .005 * Math.max(0, (t - .93) / .07);
  tube(spineSample(0, 1, 50), sac, sasMat.clone(), [7], 80, 14, .3);
  for (let k = 0; k < 14; k++) {
    const a = k / 14 * Math.PI * 2, off = (t: number) => P(Math.cos(a) * .0042 * (1 - .5 * t), 0, Math.sin(a) * .0042);
    const pts = [cordEnd - .02, cordEnd + .1, cordEnd + .24, cordEnd + .33 + (k % 4) * .01].map((t, i) => {const p = spine(Math.min(t, .98)), o = off(i / 3); return P(p[0] + o[0] * (1 + i * .25), p[1], p[2] + o[2] * (1 + i * .25));});
    tube(pts, .00035, material('#e8dfa8', 1), [7], 24, 5, .5);
  }
  tube(spineSample(cordEnd - .02, .985, 14), .0004, material('#f1ecd0', 1), [7], 24, 5, .5);
  // arachnoid granulations along the sinus and the sinus itself
  for (const g of source.sinus) add(g.clone(), material('#5b7fb5', .9, '#17305a'), [8], .8);
  const gran = [-.03, -.018, -.006, .006, .018].map(dz => sinusAt(granZ + dz));
  for (const p of gran) for (const s of [-1, 1]) ball(P(s * .007, p[1] - .0035, p[2]), .0032, material('#e8c9b0', 1, '#6a3d20'), [8], 1, 1.2, 1);

  // ---- routes: eight steps each, sampled once; a particle's u in [0,1) maps to step floor(u*8) and the position inside it
  const sinusDown = sinusPts.filter(p => p[2] < granZ).reverse().map(p => P(0, p[1] + .001, p[2]));
  const sinusRoute: V[] = sinusDown.length > 2 ? [P(0, vertex[1] - .001, granZ), ...sinusDown.slice(1)] : [P(0, vertex[1], granZ), P(0, vertex[1] - .01, granZ - .05)];
  const convexity = (z0: number, s: number): V[] => sinusPts.filter(p => p[2] >= z0 && p[2] <= granZ).map(p => P(s * .012, p[1] - .006, p[2]));
  const lateralStep = (s: number): V[][] => [
    [P(s * .020, 1.622, -.022), P(s * .018, 1.632, -.008), P(s * .014, 1.640, .004)],
    [P(s * .014, 1.640, .004), P(s * .008, 1.637, .012), P(s * .003, 1.632, .015), P(0, 1.629, .013)],
  ];
  const middle: V[][] = [
    [P(0, 1.629, .013), P(0, 1.623, .004), P(0, 1.617, -.006), P(0, 1.614, -.012)],
    [P(0, 1.616, -.012), P(0, 1.610, -.0125), P(0, 1.603, -.0135)],
    [P(0, 1.603, -.0135), P(0, 1.592, -.018), P(0, 1.581, -.026), P(0, 1.572, -.032)],
  ];
  const cisterna = P(0, cisternaY, cisternaZ);
  const medianStep: V[] = [P(0, 1.572, -.032), P(0, 1.566, -.040), cisterna];
  const lateralApStep = (s: number): V[] => [P(0, 1.578, -.026), P(s * .014, 1.575, -.025), P(s * .030, 1.568, -.024), P(s * .038, 1.560, -.036), cisterna];
  const posterior = (s: number): V[] => [cisterna, P(s * .004, cisternaY + .01, cb.min.z - .004), P(s * .006, cb.max.y - .02, cb.min.z - .006), P(s * .01, cr.min.y + .02, cr.min.z - .004), P(s * .012, vertex[1] - .02, cr.min.z + .004), ...convexity(cr.min.z + .01, s)];
  const anterior = (s: number): V[] => [cisterna, P(s * .03, cisternaY + .002, cisternaZ + .04), P(s * .032, cisternaY + .008, (cr.max.z + cr.min.z) / 2 + .02), P(s * .02, cr.min.y + .012, cr.max.z - .02), P(s * .014, (cr.min.y + cr.max.y) / 2, cr.max.z + .004), P(s * .013, vertex[1] - .01, cr.max.z - .02), P(s * .012, vertex[1] - .006, granZ + .03), P(s * .012, vertex[1] - .006, granZ)];
  const toGran: V[] = [P(.012, vertex[1] - .006, granZ), P(.007, vertex[1] - .004, granZ), P(.001, vertex[1] - .001, granZ)];
  const spinalLoop = (): V[] => [cisterna, ...spineSample(.03, 1, 14, -.0055), ...spineSample(.97, .03, 14, .0055), P(0, y0 + .004, zf + .006), cisterna];
  const canal: V[] = [P(0, 1.572, -.032), P(0, 1.558, -.034), ...spineSample(.02, cordEnd, 16)];
  const sinusOut = sinusRoute;
  const routes: Route[] = [];
  const cranial = (s: number, t: number, ap: V[]): Route => ({weight: 1, steps: [lateralStep(s)[0], lateralStep(s)[1], middle[0], middle[1], middle[2], ap, t ? anterior(s) : posterior(s), [...toGran, ...sinusOut]]});
  for (const s of [-1, 1]) for (const t of [0, 1]) for (const ap of [0, 1]) routes.push({...cranial(s, t, ap ? medianStep : lateralApStep(s)), weight: 1});
  for (const s of [-1, 1]) routes.push({weight: 1.2, steps: [lateralStep(s)[0], lateralStep(s)[1], middle[0], middle[1], middle[2], medianStep, spinalLoop(), [cisterna, ...posterior(s).slice(1), ...toGran, ...sinusOut]]});
  routes.push({weight: .5, fade: true, steps: [lateralStep(1)[0], lateralStep(1)[1], middle[0], middle[1], middle[2], canal.slice(0, 3), canal.slice(2, 12), canal.slice(11)]});

  // sample each step to a polyline
  const sampled = routes.map(r => r.steps.map(step => {
    const c = new T.CatmullRomCurve3(step.map(p => new T.Vector3(...p)), false, 'centripetal');
    return c.getSpacedPoints(40);
  }));
  const N = quality.particles ?? 900, count = N;
  const phase = new Float32Array(count), route = new Uint8Array(count), jitter = new Float32Array(count * 3);
  const totalWeight = routes.reduce((a, r) => a + r.weight, 0);
  for (let i = 0; i < count; i++) {
    phase[i] = Math.random();
    let w = Math.random() * totalWeight, k = 0; while (k < routes.length - 1 && w > routes[k].weight) {w -= routes[k].weight; k++;}
    route[i] = k; jitter[i * 3] = (Math.random() - .5) * .0016; jitter[i * 3 + 1] = (Math.random() - .5) * .0016; jitter[i * 3 + 2] = (Math.random() - .5) * .0016;
  }
  const pg = new T.BufferGeometry(), positions = new Float32Array(count * 3), alphas = new Float32Array(count);
  pg.setAttribute('position', new T.BufferAttribute(positions, 3)); pg.setAttribute('alpha', new T.BufferAttribute(alphas, 1));
  const pm = new T.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false,
    uniforms: {uScale: {value: 400}},
    vertexShader: 'attribute float alpha; varying float vA; uniform float uScale; void main(){ vA = alpha; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = uScale * 0.0042 / -mv.z + 2.5; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d); if (r > 0.5) discard; float a = smoothstep(0.5, 0.15, r) * vA; gl_FragColor = vec4(0.0, 0.42, 0.85, min(1.0, a * 1.3)); }',
  });
  const points = new T.Points(pg, pm); points.frustumCulled = false; points.renderOrder = 10; scene.add(points);

  // ---- camera: fixed, mid-sagittal and slightly turned, framing the head and the whole schematic spine
  const frame = () => {
    const w = host.clientWidth || 300, h = host.clientHeight || 600;
    renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    const top = cr.max.y + .02, bottom = y0 - L - .02, centreY = (top + bottom) / 2, span = top - bottom;
    const dist = Math.max(span / 2 / Math.tan(camera.fov * Math.PI / 360), (cr.max.z - cr.min.z) * .8 / (Math.tan(camera.fov * Math.PI / 360) * camera.aspect)) * 1.08;
    const az = 22 * Math.PI / 180;
    camera.position.set(Math.cos(az) * dist, centreY + dist * .04, Math.sin(az) * dist * .6 + zf);
    camera.lookAt(0, centreY, zf);
    pm.uniforms.uScale.value = h * 1.1;
  };
  const observer = new ResizeObserver(frame); observer.observe(host); frame();

  let raf = 0, last = performance.now(), clock = 0, lastStep = -1, disposed = false;
  const tick = (now: number) => {
    if (disposed) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now; clock += dt;
    const cycle = (clock % CSF_CYCLE) / CSF_CYCLE, step = Math.min(7, Math.floor(cycle * 8));
    if (step !== lastStep) {lastStep = step; onStep(step);}
    for (let i = 0; i < count; i++) {
      const u = (clock / CSF_CYCLE + phase[i]) % 1, s = Math.min(7, Math.floor(u * 8)), f = u * 8 - s;
      const poly = sampled[route[i]][s];
      const e = f * (poly.length - 1), a = Math.min(poly.length - 2, Math.floor(e)), q = e - a;
      const p0 = poly[a], p1 = poly[a + 1];
      positions[i * 3] = p0.x + (p1.x - p0.x) * q + jitter[i * 3]; positions[i * 3 + 1] = p0.y + (p1.y - p0.y) * q + jitter[i * 3 + 1]; positions[i * 3 + 2] = p0.z + (p1.z - p0.z) * q + jitter[i * 3 + 2];
      const ease = Math.sin(Math.min(f, 1 - f) * Math.PI * 2 > 1 ? Math.PI / 2 : Math.min(f, 1 - f) * Math.PI);
      let a1 = s === step ? .95 : .22;
      if (routes[route[i]].fade && s >= 5) a1 *= Math.max(0, 1 - ((s - 5) + f) / 3);
      alphas[i] = a1 * (.35 + .65 * ease);
    }
    pg.attributes.position.needsUpdate = true; pg.attributes.alpha.needsUpdate = true;
    for (const st of structures) {
      const on = st.steps.includes(step + 1);
      for (const m of st.materials) {m.emissiveIntensity = on ? st.lit : .08; m.opacity = on ? Math.min(1, st.baseOpacity + .25) : st.baseOpacity * .8;}
    }
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(tick);
  return {
    dispose() {
      disposed = true; cancelAnimationFrame(raf); observer.disconnect();
      scene.traverse(o => {if (o instanceof T.Mesh) {o.geometry.dispose(); (o.material as T.Material).dispose();}});
      pg.dispose(); pm.dispose(); renderer.dispose(); canvas.remove();
    },
  };
}
