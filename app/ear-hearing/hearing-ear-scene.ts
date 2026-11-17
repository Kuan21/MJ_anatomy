import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {framingDistance} from '../camera-framing';
import {EAR_BY_ID} from '../mj-ear-atlas';
import {loadEarGeometries} from './ear-geometry';
import {longAxis, pointAlong, principalAxes, tubeCentreline, type Centreline, type V3} from './geometry-analysis';
import {basePosition, sliderToHz, waveValue, WAVE_HZ, type HearingStep} from './hearing-data';
import {LabelLayer, type LabelSpec} from './label-layer';

type StepId = HearingStep['id'];
export interface HearingParams {freqSlider: number; loud: number}
interface Callbacks {progress: (percent: number) => void; ready: () => void; error: (message: string) => void}

/** How opaque each structure is in each step (everything not listed is faint glass). 1 = solid. */
const GLASS = .05;
const ROLES: Record<StepId, Record<string, number>> = {
  outer: {auricle: .5, 'external-acoustic-meatus': .32, 'tympanic-membrane': 1, malleus: .55, incus: .4, stapes: .4},
  middle: {'tympanic-membrane': .55, malleus: 1, incus: 1, stapes: 1, 'oval-window': 1, 'round-window': 1, vestibule: .16, 'scala-vestibuli': .16, 'scala-tympani': .16, 'pharyngotympanic-tube': .14, 'facial-nerve': .22, 'chorda-tympani': .5, 'cochlear-nerve': .12},
  wave: {'scala-vestibuli': .78, 'scala-tympani': .78, vestibule: .2, 'oval-window': 1, 'round-window': 1, stapes: 1, incus: .3, malleus: .22, 'tympanic-membrane': .16, 'cochlear-nerve': .3},
  corti: {'scala-vestibuli': .45, 'scala-tympani': .45, 'oval-window': .6, 'round-window': .6, stapes: .25, 'cochlear-nerve': .35, vestibule: .12},
  synapse: {'scala-vestibuli': .32, 'scala-tympani': .32, 'cochlear-nerve': 1, 'oval-window': .4, 'round-window': .4, vestibule: .12},
  pathway: {},
};
/** Camera for each step: the structures to frame and the direction to look from (body frame: +x left, +y up, +z front; this is a right ear, so lateral is −x). */
const CAMERAS: Record<StepId, {ids: string[]; dir: V3; pad: number; fill: number; /** share of the canvas width the subject moves to the left, to leave room for a zoom window */ shift?: number}> = {
  outer: {ids: ['auricle', 'external-acoustic-meatus', 'tympanic-membrane'], dir: [-.28, .9, .45], pad: .004, fill: .82},
  middle: {ids: ['tympanic-membrane', 'malleus', 'incus', 'stapes', 'oval-window', 'round-window'], dir: [-.55, .45, .72], pad: .0015, fill: .95},
  wave: {ids: ['scala-vestibuli', 'scala-tympani', 'vestibule', 'round-window'], dir: [0, 0, 0], pad: .002, fill: .72},
  corti: {ids: ['scala-vestibuli', 'scala-tympani'], dir: [0, 0, 0], pad: .001, fill: .78, shift: .23},
  synapse: {ids: ['scala-vestibuli', 'scala-tympani', 'cochlear-nerve'], dir: [0, 0, 0], pad: .001, fill: .74, shift: .23},
  pathway: {ids: ['cochlear-nerve'], dir: [-1, .3, .4], pad: .004, fill: .8},
};
const AMBER = new T.Color('#f2a20c'), VIOLET = new T.Color('#6a3fd1'), SCALA_BASE = new T.Color('#b8c8d6');
const WAVE_COLOUR_PARTS = ['scala-vestibuli', 'scala-tympani'];

const smooth = (k: number) => k * k * (3 - 2 * k);

/** The ear in 3D for steps 1–5 of the hearing animation: sound waves in the meatus, the vibrating drum, the swinging ossicles, the traveling wave along the cochlea.
 *  It draws the same meshes as the detail viewer (one shared package file) in its own renderer and never touches the detail viewer's scene. */
export function createHearingEarScene(host: HTMLElement, callbacks: Callbacks) {
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(30, 1, .0008, 5);
  const renderer = new T.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor('#cbd2d6', 0);
  renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  const canvas = renderer.domElement; canvas.className = 'hear-canvas'; canvas.style.touchAction = 'none';
  canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', '耳部 3D 動畫（右耳）。拖曳旋轉，滾輪或雙指縮放。');
  host.appendChild(canvas);
  const labels = new LabelLayer(host);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = .15; controls.minDistance = .004; controls.maxDistance = .5;
  scene.add(new T.HemisphereLight('#ffffff', '#7b8e9c', 2.2));
  const key = new T.DirectionalLight('#fff6e6', 2.6); key.position.set(-1.5, 3, 4); scene.add(key);
  const fill = new T.DirectionalLight('#a8c8e3', 1.4); fill.position.set(3, 1, -3); scene.add(fill);

  const meshes = new Map<string, T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>>(), target = new Map<string, number>(), geo = new Map<string, T.BufferGeometry>();
  let disposed = false, ready = false, step: StepId = 'outer', last = performance.now();
  let tween: {from: {pos: T.Vector3; tgt: T.Vector3}; to: {pos: T.Vector3; tgt: T.Vector3}; start: number; ms: number} | null = null;

  // ---- derived shapes, filled when the meshes are loaded
  const rig = {
    tmAxis: new T.Vector3(1, 0, 0), tmCentre: new T.Vector3(), tmRadius: .004, tmBase: new Float32Array(0), tmWeight: new Float32Array(0),
    meatusDir: new T.Vector3(1, 0, 0), meatusOuter: new T.Vector3(), meatusLength: .025,
    swingAxis: new T.Vector3(0, 0, 1), swingPivot: new T.Vector3(), swingSign: 1, lever: .005, stapesDir: new T.Vector3(1, 0, 0), stapesCentre: new T.Vector3(), incusCentre: new T.Vector3(),
    rwDir: new T.Vector3(-1, 0, 0), rwBase: new Float32Array(0), rwWeight: new Float32Array(0), rwCentre: new T.Vector3(),
    duct: [] as V3[], ductCurve: null as T.CatmullRomCurve3 | null, scala: new Map<string, {u: Float32Array; base: Float32Array}>(), modiolus: new T.Vector3(), spiralAxis: new T.Vector3(0, 0, 1),
  };
  const centreOf = (id: string) => meshes.get(id)?.geometry.boundingBox?.getCenter(new T.Vector3()) ?? new T.Vector3();
  const boxOf = (ids: string[]) => {const b = new T.Box3(); for (const id of ids) {const g = geo.get(id); if (g?.boundingBox) b.union(g.boundingBox);} return b;};

  // ---- effects
  const effects = new T.Group(); scene.add(effects);
  const ringMat = new T.MeshBasicMaterial({color: '#3f7fb5', transparent: true, depthWrite: false, opacity: .8});
  const ringGeo = new T.TorusGeometry(1, .035, 6, 40);
  const WAVES = 8, waveRings: {group: T.Group; rings: T.Mesh[]}[] = [];
  for (let i = 0; i < WAVES; i++) {
    const group = new T.Group(), rings: T.Mesh[] = [];
    for (let k = 0; k < 3; k++) {const m = new T.Mesh(ringGeo, ringMat.clone()); group.add(m); rings.push(m);}
    effects.add(group); waveRings.push({group, rings});
  }
  const markMat = new T.MeshBasicMaterial({color: '#ff7a00', transparent: true, opacity: .95, depthTest: false});
  const marker = new T.Mesh(new T.SphereGeometry(1, 16, 12), markMat); marker.renderOrder = 10; effects.add(marker);
  const halo = new T.Mesh(new T.RingGeometry(1.5, 2.1, 32), new T.MeshBasicMaterial({color: '#ff7a00', transparent: true, opacity: .7, side: T.DoubleSide, depthTest: false})); halo.renderOrder = 10; effects.add(halo);
  let ductTube: T.Mesh<T.TubeGeometry, T.MeshBasicMaterial> | null = null, ductColour: Float32Array | null = null;
  const peakAt = new T.Vector3(), ganglion = new T.Vector3();

  // ---- labels per step
  const at = (id: string, f = .5, extra?: V3) => () => {
    const m = meshes.get(id); if (!m || !m.visible) return null;
    const b = m.geometry.boundingBox!, p = b.getCenter(new T.Vector3()).lerp(b.max, f - .5);
    return extra ? p.add(new T.Vector3(...extra)) : p;
  };
  const P = (id: string): {en: string; zh: string} => {const p = EAR_BY_ID.get(id)!; return {en: p.en.replace(/ \(.*\)$/, ''), zh: p.zh};};
  const lab = (key: string, id: string, o: Partial<LabelSpec> = {}): LabelSpec => ({key, ...P(id), at: at(id), ...o});
  const labelsFor = (s: StepId): LabelSpec[] => {
    switch (s) {
      case 'outer': return [
        lab('auricle', 'auricle', {dx: -120, dy: -30}), lab('meatus', 'external-acoustic-meatus', {en: 'External acoustic meatus', zh: '外耳道', dx: 10, dy: 50}),
        lab('tm', 'tympanic-membrane', {dx: 40, dy: -50, accent: true}), {key: 'sound', en: 'Sound waves', zh: '聲波：空氣壓力起伏', at: () => waveAnchor(), dx: -150, dy: -10},
      ];
      case 'middle': return [
        lab('tm', 'tympanic-membrane', {dx: -140, dy: 20}), lab('malleus', 'malleus', {dx: -80, dy: -60}), lab('incus', 'incus', {dx: -10, dy: -70}), lab('stapes', 'stapes', {dx: 60, dy: 30}),
        lab('oval', 'oval-window', {en: 'Oval window', zh: '卵圓窗（前庭窗）', dx: 80, dy: -20}), lab('round', 'round-window', {en: 'Round window', zh: '圓窗（蝸窗）', dx: 70, dy: 40}),
        lab('tube', 'pharyngotympanic-tube', {en: 'Pharyngotympanic tube', zh: '咽鼓管 → 鼻咽', dx: -60, dy: 70}),
      ];
      case 'wave': return [
        lab('sv', 'scala-vestibuli', {dx: -130, dy: -40}), lab('st', 'scala-tympani', {dx: 60, dy: 60}), lab('oval', 'oval-window', {en: 'Oval window', zh: '卵圓窗', dx: -110, dy: 20}), lab('round', 'round-window', {en: 'Round window', zh: '圓窗', dx: -100, dy: 70}),
        {key: 'base', en: 'Base: narrow, stiff', zh: '蝸底：窄而硬 → 高頻', at: () => ductPoint(.02), dx: -150, dy: 30}, {key: 'apex', en: 'Apex: wide, floppy', zh: '蝸頂：寬而軟 → 低頻', at: () => ductPoint(.98), dx: 40, dy: -40},
        {key: 'peak', en: 'Peak', zh: '', at: () => peakAt, dx: 36, dy: -44, accent: true},
      ];
      case 'corti': return [{key: 'corti', en: 'Organ of Corti', zh: '柯蒂氏器（沿蝸管全長，此處對應所選頻率）', at: () => peakAt, dx: -190, dy: -50, accent: true, schematic: true}, lab('sv', 'scala-vestibuli', {dx: -120, dy: 50}), lab('st', 'scala-tympani', {dx: 50, dy: 70})];
      case 'synapse': return [{key: 'sg', en: 'Spiral ganglion', zh: '螺旋神經節（蝸軸內）', at: () => ganglion, dx: -190, dy: 30, accent: true, schematic: true}, lab('cn', 'cochlear-nerve', {en: 'Cochlear nerve (CN VIII)', zh: '耳蝸神經', dx: 50, dy: 50})];
      default: return [];
    }
  };
  const ductPoint = (u: number) => rig.duct.length ? new T.Vector3(...pointAlong(rig.duct, u)) : null;
  const waveAnchor = () => {const w = waveRings[2]; return w ? w.group.position.clone() : null;};

  // ---- camera
  const pose = (s: StepId) => {
    const c = CAMERAS[s], box = boxOf(c.ids);
    if (box.isEmpty()) return null;
    const centre = box.getCenter(new T.Vector3());
    const dir = new T.Vector3(...c.dir);
    if (dir.lengthSq() === 0) dir.copy(rig.spiralAxis).multiplyScalar(rig.spiralAxis.x > 0 ? -1 : 1).add(new T.Vector3(0, .25, .1));
    dir.normalize();
    const padded = new T.Box3(box.min.clone().addScalar(-c.pad), box.max.clone().addScalar(c.pad));
    const distance = framingDistance(padded, dir, camera.fov, camera.aspect, c.fill, c.fill, .012), tgt = centre.clone(), pos = centre.clone().addScaledVector(dir, distance);
    if (c.shift && host.clientWidth > 820) {
      const right = new T.Vector3().crossVectors(dir.clone().negate(), new T.Vector3(0, 1, 0)).normalize(), move = right.multiplyScalar(c.shift * 2 * distance * Math.tan(camera.fov * Math.PI / 360) * camera.aspect);
      tgt.add(move); pos.add(move);
    }
    return {tgt, pos};
  };
  const flyTo = (s: StepId, ms: number) => {
    const to = pose(s); if (!to) return;
    if (!ms) {camera.position.copy(to.pos); controls.target.copy(to.tgt); controls.update(); tween = null; return;}
    tween = {from: {pos: camera.position.clone(), tgt: controls.target.clone()}, to, start: performance.now(), ms};
  };

  // ---- loading
  loadEarGeometries(p => callbacks.progress(p)).then(all => {
    if (disposed) return;
    for (const [id, source] of all) {
      const part = EAR_BY_ID.get(id); if (!part) continue;
      // the vibrating parts and the wave-coloured scalae are copied, so the detail viewer's shared buffers stay as they were
      const geometry = ['tympanic-membrane', 'round-window', ...WAVE_COLOUR_PARTS].includes(id) ? source.clone() : source;
      geo.set(id, geometry);
      const material = new T.MeshStandardMaterial({color: part.color, roughness: .55, side: T.DoubleSide, transparent: true, opacity: GLASS, depthWrite: false});
      const mesh = new T.Mesh(geometry, material); mesh.userData.partId = id; meshes.set(id, mesh); scene.add(mesh); target.set(id, GLASS);
    }
    build(); ready = true; callbacks.ready(); setStep(step, true);
  }).catch(() => {if (!disposed) callbacks.error('耳部模型未能載入，請重新載入。');});

  const arr = (g: T.BufferGeometry) => g.getAttribute('position').array as Float32Array;
  function build() {
    // eardrum: the meatus runs toward it; the drum moves along that line
    const tm = geo.get('tympanic-membrane')!, meatus = geo.get('external-acoustic-meatus')!;
    rig.tmCentre.copy(tm.boundingBox!.getCenter(new T.Vector3()));
    const axis = longAxis(arr(meatus), [rig.tmCentre.x, rig.tmCentre.y, rig.tmCentre.z]);
    rig.meatusDir.set(...axis).normalize(); rig.tmAxis.copy(rig.meatusDir);
    const mp = arr(meatus); let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < mp.length; i += 3) {const d = mp[i] * axis[0] + mp[i + 1] * axis[1] + mp[i + 2] * axis[2]; lo = Math.min(lo, d); hi = Math.max(hi, d);}
    const tmProj = rig.tmCentre.dot(rig.meatusDir);
    rig.meatusLength = Math.max(.01, tmProj - lo); rig.meatusOuter.copy(rig.tmCentre).addScaledVector(rig.meatusDir, lo - tmProj);
    const tp = arr(tm); rig.tmBase = Float32Array.from(tp); rig.tmWeight = new Float32Array(tp.length / 3);
    for (let i = 0; i < tp.length; i += 3) rig.tmRadius = Math.max(rig.tmRadius, Math.hypot(tp[i] - rig.tmCentre.x, tp[i + 1] - rig.tmCentre.y, tp[i + 2] - rig.tmCentre.z));
    for (let i = 0; i < tp.length / 3; i++) {const r = Math.hypot(tp[i * 3] - rig.tmCentre.x, tp[i * 3 + 1] - rig.tmCentre.y, tp[i * 3 + 2] - rig.tmCentre.z) / rig.tmRadius; rig.tmWeight[i] = Math.max(0, 1 - r * r);}

    // ossicles swing about the line from the anterior ligament of the malleus to the short crus of the incus
    const mal = arr(geo.get('malleus')!), inc = arr(geo.get('incus')!);
    let front = 0, behind = 0, tip = 0;
    for (let i = 0; i < mal.length / 3; i++) {if (mal[i * 3 + 2] > mal[front * 3 + 2]) front = i; if (mal[i * 3 + 1] < mal[tip * 3 + 1]) tip = i;}
    for (let i = 0; i < inc.length / 3; i++) if (inc[i * 3 + 2] < inc[behind * 3 + 2]) behind = i;
    const a = new T.Vector3(mal[front * 3], mal[front * 3 + 1], mal[front * 3 + 2]), b = new T.Vector3(inc[behind * 3], inc[behind * 3 + 1], inc[behind * 3 + 2]);
    rig.swingAxis.copy(b).sub(a).normalize(); rig.swingPivot.copy(a);
    const handle = new T.Vector3(mal[tip * 3], mal[tip * 3 + 1], mal[tip * 3 + 2]), arm = handle.clone().sub(a);
    rig.lever = Math.max(.002, arm.clone().sub(rig.swingAxis.clone().multiplyScalar(arm.dot(rig.swingAxis))).length());
    // the sense of the swing: the handle (and with it the drum's centre) moves inward
    rig.swingSign = new T.Vector3().crossVectors(rig.swingAxis, arm).dot(rig.tmAxis) >= 0 ? 1 : -1;
    rig.stapesCentre.copy(centreOf('stapes')); rig.incusCentre.copy(centreOf('incus'));
    const vest = centreOf('vestibule'); rig.stapesDir.copy(vest).sub(rig.stapesCentre).normalize();

    // round window: bulges out when the stapes pushes in
    const rw = geo.get('round-window')!, rp = arr(rw);
    rig.rwCentre.copy(rw.boundingBox!.getCenter(new T.Vector3()));
    const cochlea = boxOf(['scala-tympani', 'scala-vestibuli']).getCenter(new T.Vector3());
    rig.rwDir.copy(rig.rwCentre).sub(cochlea).normalize();
    rig.rwBase = Float32Array.from(rp); rig.rwWeight = new Float32Array(rp.length / 3);
    let rr = 1e-6; for (let i = 0; i < rp.length / 3; i++) rr = Math.max(rr, Math.hypot(rp[i * 3] - rig.rwCentre.x, rp[i * 3 + 1] - rig.rwCentre.y, rp[i * 3 + 2] - rig.rwCentre.z));
    for (let i = 0; i < rp.length / 3; i++) {const r = Math.hypot(rp[i * 3] - rig.rwCentre.x, rp[i * 3 + 1] - rig.rwCentre.y, rp[i * 3 + 2] - rig.rwCentre.z) / rr; rig.rwWeight[i] = Math.max(0, 1 - r * r);}

    // cochlea: centre line of each scala from the windows to the apex, and the share along it of every vertex
    const lines: Centreline[] = [];
    for (const [id, window] of [['scala-vestibuli', 'oval-window'], ['scala-tympani', 'round-window']] as const) {
      const g = geo.get(id)!, w = centreOf(window), line = tubeCentreline(arr(g), g.getIndex()!.array, [w.x, w.y, w.z], 64);
      lines.push(line);
      const n = g.getAttribute('position').count, base = new Float32Array(n * 3), c = SCALA_BASE;
      for (let i = 0; i < n; i++) {base[i * 3] = c.r; base[i * 3 + 1] = c.g; base[i * 3 + 2] = c.b;}
      g.setAttribute('color', new T.BufferAttribute(Float32Array.from(base), 3));
      rig.scala.set(id, {u: line.u, base});
      meshes.get(id)!.material.vertexColors = true; meshes.get(id)!.material.color.set('#ffffff'); meshes.get(id)!.material.needsUpdate = true;
    }
    rig.duct = lines[0].points.map((p, i) => [0, 1, 2].map(c => (p[c] + lines[1].points[i][c]) / 2) as V3);
    rig.ductCurve = new T.CatmullRomCurve3(rig.duct.map(p => new T.Vector3(...p)), false, 'centripetal');
    const mid = new T.Vector3(); rig.duct.forEach(p => mid.add(new T.Vector3(...p))); rig.modiolus.copy(mid.divideScalar(rig.duct.length));
    const all = new Float32Array(rig.duct.flat()), axes = principalAxes(all);
    rig.spiralAxis.set(...axes.axes[2]).normalize();
    ganglion.copy(rig.modiolus);
    // the basilar membrane line: a thin tube along the cochlear duct, coloured with the wave
    const segments = 200, tube = new T.TubeGeometry(rig.ductCurve, segments, .00024, 6, false);
    ductColour = new Float32Array(tube.getAttribute('position').count * 3); tube.setAttribute('color', new T.BufferAttribute(ductColour, 3));
    ductTube = new T.Mesh(tube, new T.MeshBasicMaterial({vertexColors: true, transparent: true, opacity: 0})); ductTube.renderOrder = 6; effects.add(ductTube);
    const scale = .0005; marker.scale.setScalar(scale * .6); halo.scale.setScalar(scale * .6);
  }

  // ---- steps
  function setStep(next: StepId, instant = false) {
    step = next;
    for (const id of meshes.keys()) target.set(id, ROLES[next][id] ?? GLASS);
    labels.set(ready ? labelsFor(next) : []);
    if (ready) flyTo(next, instant ? 0 : 1100);
  }
  const resize = () => {
    const rect = host.getBoundingClientRect();
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
    camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height); camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();

  // ---- per frame
  const tmp = new T.Vector3(), quat = new T.Quaternion(), zUp = new T.Vector3(0, 0, 1);
  const project = (p: T.Vector3) => {tmp.copy(p).project(camera); if (tmp.z > 1) return null; const r = host.getBoundingClientRect(); return {x: (tmp.x + 1) / 2 * r.width, y: (1 - tmp.y) / 2 * r.height};};

  function tick(t: number, p: HearingParams, visible: boolean) {
    const now = performance.now(), dt = Math.min(.1, (now - last) / 1000); last = now;
    if (!ready || !visible) return;
    const loud = p.loud, hz = sliderToHz(p.freqSlider), peak = basePosition(hz), phase = Math.sin(2 * Math.PI * WAVE_HZ * t);
    // camera glide, then the user's own orbit
    if (tween) {
      const k = Math.min(1, (now - tween.start) / tween.ms), e = smooth(k);
      camera.position.lerpVectors(tween.from.pos, tween.to.pos, e); controls.target.lerpVectors(tween.from.tgt, tween.to.tgt, e);
      if (k >= 1) tween = null;
    }
    controls.update();
    // fade each structure toward its role in this step
    const rate = 1 - Math.exp(-dt * 5);
    for (const [id, mesh] of meshes) {
      const m = mesh.material, goal = target.get(id) ?? GLASS;
      m.opacity += (goal - m.opacity) * rate;
      m.transparent = m.opacity < .985; m.depthWrite = m.opacity > .6; mesh.visible = m.opacity > .012;
      mesh.renderOrder = m.opacity < .6 ? 2 : 0;
    }
    const outer = step === 'outer', middle = step === 'middle', inner = step === 'wave' || step === 'corti' || step === 'synapse';

    // sound waves travel down the meatus toward the drum (step 1) and the drum follows them
    const loudGain = .25 + loud * .75;
    waveRings.forEach((w, i) => {
      const length = rig.meatusLength + .05, s = (((t * .028 + i * length / WAVES) % length) + length) % length;   // distance from the far end
      const fromTm = length - s - 0.0004;
      const canal = rig.meatusLength, r = .0042 + .0078 * smooth(Math.min(1, Math.max(0, (fromTm - canal) / .03)));
      w.group.position.copy(rig.tmCentre).addScaledVector(rig.meatusDir, -fromTm);
      quat.setFromUnitVectors(zUp, rig.meatusDir); w.group.quaternion.copy(quat);
      w.rings.forEach((m, k) => {m.scale.setScalar(r * (1 - k * .32)); m.position.z = r * (k * .09);});
      const fade = Math.min(1, s / .01) * Math.min(1, fromTm / .004);
      const show = outer ? 1 : 0;
      w.rings.forEach(m => {(m.material as T.MeshBasicMaterial).opacity = .85 * loudGain * fade * show; m.visible = show > 0 && fade > .01;});
    });
    // the drum: the whole membrane moves along the canal's axis, most at its centre
    const pos = geo.get('tympanic-membrane')!.getAttribute('position') as T.BufferAttribute, amp = .00045 * loudGain * phase * (outer || middle ? 1 : .35);
    for (let i = 0; i < rig.tmWeight.length; i++) {
      const d = amp * rig.tmWeight[i];
      pos.setXYZ(i, rig.tmBase[i * 3] + rig.tmAxis.x * d, rig.tmBase[i * 3 + 1] + rig.tmAxis.y * d, rig.tmBase[i * 3 + 2] + rig.tmAxis.z * d);
    }
    pos.needsUpdate = true;
    // the chain of ossicles swings about the line through the anterior ligament and the short crus; the stapes moves like a piston into the oval window
    const angle = rig.swingSign * (.00045 * loudGain * phase * (outer || middle || step === 'wave' ? 1 : .3)) / rig.lever * 1.6;
    const swing = (id: string) => {
      const mesh = meshes.get(id); if (!mesh) return;
      quat.setFromAxisAngle(rig.swingAxis, angle);
      mesh.quaternion.copy(quat); mesh.position.copy(rig.swingPivot).sub(tmp.copy(rig.swingPivot).applyQuaternion(quat));
    };
    swing('malleus'); swing('incus');
    const stapes = meshes.get('stapes');
    if (stapes) {
      const moved = rig.stapesCentre.clone().sub(rig.swingPivot).applyQuaternion(quat.setFromAxisAngle(rig.swingAxis, angle)).sub(rig.stapesCentre.clone().sub(rig.swingPivot));
      const depth = moved.length() * Math.sign(moved.dot(rig.stapesDir) || 1);
      stapes.quaternion.identity(); stapes.position.copy(rig.stapesDir).multiplyScalar(depth);
    }
    // the round window bulges the opposite way
    const rwGeo = geo.get('round-window'), rwPos = rwGeo?.getAttribute('position') as T.BufferAttribute | undefined;
    if (rwPos) {
      const bulge = -.00035 * loudGain * phase * (middle || inner ? 1 : .2);
      for (let i = 0; i < rig.rwWeight.length; i++) {const d = bulge * rig.rwWeight[i]; rwPos.setXYZ(i, rig.rwBase[i * 3] + rig.rwDir.x * d, rig.rwBase[i * 3 + 1] + rig.rwDir.y * d, rig.rwBase[i * 3 + 2] + rig.rwDir.z * d);}
      rwPos.needsUpdate = true;
    }

    // traveling wave along the cochlea: colour by displacement along the centre line, and the same on the scalae
    if (inner && rig.duct.length) {
      for (const id of WAVE_COLOUR_PARTS) {
        const data = rig.scala.get(id)!, color = geo.get(id)!.getAttribute('color') as T.BufferAttribute, out = color.array as Float32Array;
        for (let i = 0; i < data.u.length; i++) {
          const v = waveValue(data.u[i], peak, t, loud), a = Math.min(1, Math.abs(v) * 1.5), to = v >= 0 ? AMBER : VIOLET;
          out[i * 3] = data.base[i * 3] * (1 - a) + to.r * a; out[i * 3 + 1] = data.base[i * 3 + 1] * (1 - a) + to.g * a; out[i * 3 + 2] = data.base[i * 3 + 2] * (1 - a) + to.b * a;
        }
        color.needsUpdate = true;
      }
      if (ductTube && ductColour) {
        const tubePos = ductTube.geometry.getAttribute('position'), perRing = tubePos.count / 201;
        for (let i = 0; i < tubePos.count; i++) {
          const u = Math.floor(i / perRing) / 200, v = waveValue(u, peak, t, loud), a = Math.min(1, Math.abs(v) * 1.5 + .1), to = v >= 0 ? AMBER : VIOLET, g = .28;
          ductColour[i * 3] = g * (1 - a) + to.r * a; ductColour[i * 3 + 1] = g * (1 - a) + to.g * a; ductColour[i * 3 + 2] = g * (1 - a) + to.b * a;
        }
        (ductTube.geometry.getAttribute('color') as T.BufferAttribute).needsUpdate = true;
        ductTube.material.opacity += ((inner ? 1 : 0) - ductTube.material.opacity) * rate; ductTube.visible = ductTube.material.opacity > .02;
      }
      const hit = pointAlong(rig.duct, peak); peakAt.set(...hit);
      marker.position.copy(peakAt); halo.position.copy(peakAt); halo.quaternion.copy(camera.quaternion);
      const pulse = 1 + .25 * Math.sin(t * 6); marker.scale.setScalar(.00032 * pulse); halo.scale.setScalar(.00032 * pulse);
      marker.visible = halo.visible = step === 'wave' || step === 'corti';
    } else {
      if (ductTube) ductTube.visible = false;
      marker.visible = halo.visible = false;
    }
    if (step === 'synapse') {marker.visible = halo.visible = true; marker.position.copy(ganglion); halo.position.copy(ganglion); halo.quaternion.copy(camera.quaternion); marker.scale.setScalar(.00055); halo.scale.setScalar(.00055);}
    renderer.render(scene, camera);
    labels.update(project, host.clientWidth, host.clientHeight);
  }

  return {
    setStep: (s: StepId) => setStep(s), tick,
    get ready() {return ready;},
    /** Screen position (pixels in the canvas) of the peak of the wave, of the spiral ganglion, … for the leaders of the zoom windows */
    screenPoint(which: 'peak' | 'ganglion') {const p = project(which === 'peak' ? peakAt : ganglion); return p;},
    setPeakLabel(text: string) {labels.set(labelsFor(step).map(l => l.key === 'peak' ? {...l, zh: text} : l));},
    get canvas() {return canvas;},
    dispose() {
      disposed = true; observer.disconnect(); controls.dispose(); labels.dispose();
      for (const m of meshes.values()) m.material.dispose();
      // geometries that were copied belong to this scene; the shared ones stay with the cache
      for (const id of ['tympanic-membrane', 'round-window', ...WAVE_COLOUR_PARTS]) geo.get(id)?.dispose();
      ductTube?.geometry.dispose(); ductTube?.material.dispose(); ringGeo.dispose(); renderer.dispose(); canvas.remove();
    },
  };
}
