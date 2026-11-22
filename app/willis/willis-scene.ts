import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {mergeGeometries, mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {framingDistance} from '../camera-framing';
import {groupOf} from '../organ/brain-catalogue';
import {LabelLayer, type LabelSpec} from '../ear-hearing/label-layer';
import {
  dotCount, dotPosition, NORMAL_MAX_FLOW, perfusionLevel, reversedSegments, SEGMENTS, SEGMENT_BY_ID, STEP_SEGMENTS, territoryOf,
  type FlowResult, type SegmentId, type TerritoryId, type WillisStep,
} from './willis-data';
import {buildWillisPaths, type MeshArrays, type WillisPaths} from './willis-paths';
import {polylineLength, type V3} from './willis-geometry';

type StepId = WillisStep['id'];
interface Callbacks {progress: (percent: number) => void; ready: () => void; error: (message: string) => void}

/** Territory colours (step 3) and the colours of the perfusion levels (step 4). */
export const TERRITORY_COLOUR: Record<'aca' | 'mca' | 'pca' | 'pf', string> = {aca: '#3f7cc4', mca: '#3c9a6e', pca: '#8a64c2', pf: '#b0814f'};
const LOW = new T.Color('#f2c94c'), ISCH = new T.Color('#e4572e'), GLASS = new T.Color('#d9d2ca');
const ARTERY = '#c2412f', CHANNEL = new T.Color('#ffe9b8'), REVERSED = new T.Color('#ff8a1f'), DOT = new T.Color('#fff7e0'), DOT_REV = new T.Color('#ff8a1f');
const BRAIN_GROUPS = /^(frontal|parietal|temporal|occipital|limbic|insula|interlobar|cortex-other|cerebellum|brainstem)$/;
const DRACO_PATH = `${import.meta.env.BASE_URL}draco/`;
const smooth = (k: number) => k * k * (3 - 2 * k);
const V = (p: V3) => new T.Vector3(p[0], p[1], p[2]);

/** Camera per step: which segments to frame and the direction to look from (model frame: +x left, +y up, +z front). */
const CAMERAS: Record<StepId, {segments: SegmentId[]; dir: V3; fill: number}> = {
  inflow: {segments: ['ica-l', 'ica-r', 'va-l', 'va-r', 'ba-1', 'ba-2'], dir: [-.45, .12, .88], fill: .86},
  circle: {segments: ['a1-l', 'a1-r', 'acom', 'pcom-l', 'pcom-r', 'p1-l', 'p1-r', 'ba-2'], dir: [0, -.86, .5], fill: .42},
  branches: {segments: ['a1-l', 'a1-r', 'a2-l', 'a2-r', 'pcom-l', 'pcom-r', 'mca-l', 'mca-r', 'p2-l', 'p2-r', 'ba-1', 'ba-2', 'pf-branches'], dir: [0, -.86, .5], fill: .66},
  block: {segments: ['a1-l', 'a1-r', 'a2-l', 'a2-r', 'pcom-l', 'pcom-r', 'mca-l', 'mca-r', 'p2-l', 'p2-r', 'ba-1', 'ba-2', 'pf-branches'], dir: [0, -.86, .5], fill: .66},
};

/** The circle of Willis in 3D: the arteries of the brain model (red, see-through), a channel and moving dots along each segment of the flow network, and the brain as glass whose
 *  surfaces take the colour of their territory (step 3) or of their perfusion (step 4). The model is the brain of the brain detail mode (same file); this scene keeps its own renderer. */
export function createWillisScene(host: HTMLElement, callbacks: Callbacks) {
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(30, 1, .002, 5);
  const renderer = new T.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor('#cbd2d6', 0);
  renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  const canvas = renderer.domElement; canvas.className = 'hear-canvas'; canvas.style.touchAction = 'none';
  canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', 'Willis 環 3D 動畫。拖曳旋轉，滾輪或雙指縮放。');
  host.appendChild(canvas);
  const labels = new LabelLayer(host);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = .15; controls.minDistance = .02; controls.maxDistance = 1.2;
  scene.add(new T.HemisphereLight('#ffffff', '#7b8e9c', 2.1));
  const key = new T.DirectionalLight('#fff6e6', 2.4); key.position.set(-1.5, -2, 3); scene.add(key);
  const fill = new T.DirectionalLight('#a8c8e3', 1.3); fill.position.set(2, 3, -3); scene.add(fill);

  let disposed = false, ready = false, step: StepId = 'inflow', flow: FlowResult | null = null, blocked: SegmentId | null = null, reversed = new Set<SegmentId>();
  let tween: {from: {pos: T.Vector3; tgt: T.Vector3}; to: {pos: T.Vector3; tgt: T.Vector3}; start: number; ms: number} | null = null;
  let paths: WillisPaths | null = null;
  const brain: {mesh: T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>; territory: TerritoryId | null; region: 'aca' | 'mca' | 'pca' | 'pf' | null}[] = [];
  const channels = new Map<SegmentId, T.Mesh<T.TubeGeometry, T.MeshBasicMaterial>[]>();
  const curves = new Map<SegmentId, {curve: T.CatmullRomCurve3; length: number}[]>();
  let chiasm: T.Vector3 | null = null;

  const MAX_DOTS = 1400;
  const dots = new T.InstancedMesh(new T.SphereGeometry(.00062, 10, 8), new T.MeshBasicMaterial({color: '#ffffff'}), MAX_DOTS);
  dots.instanceMatrix.setUsage(T.DynamicDrawUsage); dots.count = 0; dots.renderOrder = 2; dots.frustumCulled = false; scene.add(dots);
  dots.setColorAt(0, DOT);

  // ---- load
  const draco = new DRACOLoader(); draco.setDecoderPath(DRACO_PATH);
  const loader = new GLTFLoader(); loader.setDRACOLoader(draco);
  loader.load(`${import.meta.env.BASE_URL}models/brain.glb`, gltf => {
    if (disposed) return;
    try {setup(gltf.scene);} catch {callbacks.error('Willis 環動畫無法啟動，請重新載入。');}
    draco.dispose();
  }, e => {if (e.total) callbacks.progress(Math.min(100, Math.round(e.loaded / e.total * 100)));}, () => callbacks.error('腦部模型未能載入，請重新載入。'));

  function setup(root: T.Object3D) {
    root.updateMatrixWorld(true);
    const arteries: {label: string; side: string; geometry: T.BufferGeometry}[] = [];
    const take = (node: T.Object3D): boolean => {
      const x = node.userData ?? {};
      if (!x.bx_cat) return false;
      const pieces: T.BufferGeometry[] = [];
      node.traverse(o => {
        if (!(o instanceof T.Mesh)) return;
        const flat = o.geometry.getIndex() ? o.geometry.toNonIndexed() : o.geometry.clone(), g = new T.BufferGeometry();
        g.setAttribute('position', flat.getAttribute('position')); g.applyMatrix4(o.matrixWorld); pieces.push(g);
      });
      if (!pieces.length) return true;
      const label = String(x.bx_label ?? ''), side = String(x.bx_side ?? ''), cat = String(x.bx_cat), group = groupOf(cat, String(x.bx_region ?? ''));
      if (cat === 'arteries') {
        const geometry = mergeVertices(mergeGeometries(pieces, false)!, 1e-6); geometry.computeVertexNormals(); geometry.computeBoundingBox();
        arteries.push({label, side, geometry});
        return true;
      }
      if (/^optic chiasm$/i.test(label)) {const g = mergeGeometries(pieces, false)!; g.computeBoundingBox(); chiasm = g.boundingBox!.getCenter(new T.Vector3());}
      if (!BRAIN_GROUPS.test(group)) return true;
      const geometry = mergeVertices(mergeGeometries(pieces, false)!, 1e-6); geometry.computeVertexNormals();
      const territory = territoryOf(label, group, side), region = territory ? (territory === 'pf' ? 'pf' : territory.slice(0, 3) as 'aca' | 'mca' | 'pca') : null;
      const mesh = new T.Mesh(geometry, new T.MeshStandardMaterial({color: GLASS.clone(), roughness: .7, metalness: 0, transparent: true, opacity: .07, depthWrite: false, side: T.DoubleSide}));
      mesh.renderOrder = 1; scene.add(mesh); brain.push({mesh, territory, region});
      return true;
    };
    const walk = (node: T.Object3D) => {if (!take(node)) for (const child of [...node.children]) walk(child);};
    walk(root);

    // the arteries themselves: see-through red, so the dots inside show
    for (const a of arteries) {
      const main = /internal carotid|vertebral|basilar|communicating|^anterior cerebral|^posterior cerebral|M1|superior cerebellar|anterior inferior cerebellar/i.test(a.label);
      const mesh = new T.Mesh(a.geometry, new T.MeshStandardMaterial({color: ARTERY, roughness: .45, metalness: 0, transparent: true, opacity: main ? .5 : .3, depthWrite: false, side: T.DoubleSide}));
      mesh.renderOrder = 3; scene.add(mesh);
    }
    const lookup = (re: RegExp, side: 'left' | 'right' | 'median'): MeshArrays | null => {
      const a = arteries.find(x => re.test(x.label) && x.side === side); if (!a) return null;
      return {positions: a.geometry.getAttribute('position').array, index: a.geometry.getIndex()!.array};
    };
    paths = buildWillisPaths(lookup);
    for (const s of SEGMENTS) {
      const list = paths.curves[s.id].filter(c => c.length >= 2).map(c => ({curve: new T.CatmullRomCurve3(c.map(V), false, 'centripetal'), length: polylineLength(c)}));
      curves.set(s.id, list);
      channels.set(s.id, list.map(({curve, length}) => {
        const m = new T.Mesh(new T.TubeGeometry(curve, Math.max(8, Math.round(length / .0015)), s.id.startsWith('ica') || s.id.startsWith('va') || s.id.startsWith('ba') ? .00055 : .0004, 6, false), new T.MeshBasicMaterial({color: CHANNEL.clone(), transparent: true, opacity: .55, depthWrite: false}));
        m.renderOrder = 2; scene.add(m); return m;
      }));
    }
    ready = true; applyStep(true); callbacks.ready();
  }

  // ---- step and flow
  const segmentBox = (ids: SegmentId[]) => {const b = new T.Box3(); for (const id of ids) for (const {curve} of curves.get(id) ?? []) for (const p of curve.getSpacedPoints(16)) b.expandByPoint(p); return b;};
  function aimFor(id: StepId) {
    const c = CAMERAS[id], box = segmentBox(c.segments); if (box.isEmpty()) return null;
    const dir = V(c.dir).normalize(), centre = box.getCenter(new T.Vector3()), pad = new T.Box3(box.min.clone().addScalar(-.004), box.max.clone().addScalar(.004));
    const distance = framingDistance(pad, dir, camera.fov, camera.aspect, c.fill, c.fill, .05);
    // the controls bar covers the bottom of the canvas: move the picture up by a share of the view height
    const screenUp = new T.Vector3(0, 1, 0).addScaledVector(dir, -dir.y).normalize(), shift = screenUp.multiplyScalar(-distance * Math.tan(camera.fov * Math.PI / 360) * .16);
    return {tgt: centre.clone().add(shift), pos: centre.clone().addScaledVector(dir, distance).add(shift)};
  }
  function flyTo(id: StepId, instant = false) {
    const to = aimFor(id); if (!to) return;
    if (instant) {camera.position.copy(to.pos); controls.target.copy(to.tgt); controls.update(); tween = null; return;}
    tween = {from: {pos: camera.position.clone(), tgt: controls.target.clone()}, to, start: performance.now(), ms: 1300};
  }
  const lit = () => new Set<SegmentId>(STEP_SEGMENTS[step]);
  function applyColours() {
    const on = lit();
    for (const [id, list] of channels) for (const m of list) {
      const show = on.has(id), isBlocked = blocked === id, rev = reversed.has(id);
      m.visible = show || step === 'block';
      m.material.color.copy(isBlocked ? new T.Color('#5b5f66') : rev ? REVERSED : CHANNEL);
      m.material.opacity = isBlocked ? .9 : rev ? .95 : show ? .55 : .18;
    }
  }
  function applyStep(instant = false) {
    if (!ready) return;
    applyColours(); flyTo(step, instant); labels.set(labelSpecs());
  }
  function territoryPaint(now: number) {
    const pulse = .5 + .5 * Math.sin(now / 1000 * Math.PI * 1.6);
    for (const b of brain) {
      const m = b.mesh.material;
      if (step === 'branches' && b.region) {m.color.set(TERRITORY_COLOUR[b.region]); m.opacity = b.region === 'pf' ? .22 : .3; continue;}
      if (step === 'block' && b.territory && flow) {
        const level = perfusionLevel(flow.perfusion[b.territory]);
        if (level === 'ischaemia') {m.color.copy(ISCH); m.opacity = .32 + .3 * pulse; continue;}
        if (level === 'low') {m.color.copy(LOW); m.opacity = .36; continue;}
        m.color.set(TERRITORY_COLOUR[b.region!]); m.opacity = .1; continue;
      }
      m.color.copy(GLASS); m.opacity = b.region === 'pf' ? .1 : .07;
    }
  }

  // ---- labels
  function labelSpecs(): LabelSpec[] {
    if (!paths) return [];
    const P = paths.points, mid = (id: SegmentId, k = .5) => {const c = curves.get(id)?.[0]; return c ? c.curve.getPointAt(k) : null;};
    const lab = (key: string, en: string, zh: string, at: () => T.Vector3 | null, o: Partial<LabelSpec> = {}): LabelSpec => ({key, en, zh, at, ...o});
    const specs: LabelSpec[] = [];
    if (step === 'inflow') specs.push(
      lab('ica-r', 'Internal carotid artery', '內頸動脈', () => mid('ica-r', .45), {dx: -150, dy: -10}),
      lab('ica-l', 'Internal carotid artery', '內頸動脈', () => mid('ica-l', .45), {dx: 40, dy: -10}),
      lab('va-r', 'Vertebral artery', '椎動脈', () => mid('va-r', .55), {dx: -140, dy: 20}),
      lab('va-l', 'Vertebral artery', '椎動脈', () => mid('va-l', .55), {dx: 40, dy: 20}),
      lab('ba', 'Basilar artery', '基底動脈', () => V(P.baMid), {dx: 50, dy: 30}),
    );
    if (step === 'circle') specs.push(
      lab('acom', 'Anterior communicating artery', '前交通支', () => mid('acom'), {dx: 30, dy: -60}),
      lab('a1', 'Anterior cerebral artery (A1)', '前大腦動脈 A1 段', () => mid('a1-r'), {dx: -190, dy: -30}),
      lab('ica', 'Internal carotid artery', '內頸動脈', () => V(P.icaTop.r), {dx: -170, dy: 10}),
      lab('pcom', 'Posterior communicating artery', '後交通支', () => mid('pcom-r'), {dx: -200, dy: 30}),
      lab('p1', 'Posterior cerebral artery (P1)', '後大腦動脈 P1 段', () => mid('p1-l'), {dx: 60, dy: 30}),
      lab('ba', 'Basilar artery', '基底動脈', () => V(P.baTop), {dx: 40, dy: 70}),
      lab('chiasm', 'Optic chiasm', '視交叉', () => chiasm, {dx: 40, dy: -20}),
    );
    if (step === 'branches') specs.push(
      lab('aca', 'Anterior cerebral artery', '前大腦動脈', () => mid('a2-l', .7), {dx: 40, dy: -40}),
      lab('mca', 'Middle cerebral artery', '中大腦動脈', () => mid('mca-r', .4), {dx: -170, dy: -30}),
      lab('pca', 'Posterior cerebral artery', '後大腦動脈', () => mid('p2-l', .3), {dx: 50, dy: 20}),
      lab('sca', 'Superior cerebellar artery', '上小腦動脈', () => curves.get('pf-branches')?.[2]?.curve.getPointAt(.2) ?? null, {dx: -180, dy: 30}),
      lab('aica', 'Anterior inferior cerebellar artery', '前下小腦動脈', () => curves.get('pf-branches')?.[1]?.curve.getPointAt(.4) ?? null, {dx: 50, dy: 40}),
    );
    if (step === 'block') {
      if (blocked) {const s = SEGMENT_BY_ID.get(blocked)!; specs.push(lab(`blocked-${blocked}`, `Blocked: ${s.en}`, `✕ 阻塞：${s.zh}`, () => mid(blocked!, /^(ica|va)-/.test(blocked!) ? .9 : .5), {accent: true, dx: 40, dy: -50}));}
      for (const id of reversed) {const s = SEGMENT_BY_ID.get(id)!; specs.push(lab(`rev-${id}`, `${s.en}: reversed`, `${s.zh}：側支（方向倒轉）`, () => mid(id, .5), {dx: -200, dy: 30}));}
    }
    return specs;
  }

  // ---- dots
  const tmp = new T.Matrix4(), pos = new T.Vector3();
  function drawDots(t: number) {
    let n = 0;
    const on = lit();
    for (const s of SEGMENTS) {
      if (!on.has(s.id) || !flow || blocked === s.id) continue;
      const f = flow.flow[s.id], rev = reversed.has(s.id);
      for (const {curve, length} of curves.get(s.id) ?? []) {
        const count = Math.min(MAX_DOTS - n, dotCount(f / Math.max(1, (curves.get(s.id)?.length ?? 1) * .6), length));
        for (let k = 0; k < count; k++) {
          curve.getPointAt(dotPosition(k, count, t, f, length), pos);
          tmp.makeTranslation(pos.x, pos.y, pos.z); dots.setMatrixAt(n, tmp); dots.setColorAt(n, rev ? DOT_REV : DOT); n++;
        }
      }
    }
    dots.count = n; dots.instanceMatrix.needsUpdate = true; if (dots.instanceColor) dots.instanceColor.needsUpdate = true;
  }

  // ---- frame
  const resize = () => {
    const rect = host.getBoundingClientRect();
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
    camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height); camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const project = (p: T.Vector3) => {const v = p.clone().project(camera); if (v.z > 1) return null; const r = host.getBoundingClientRect(); return {x: (v.x + 1) / 2 * r.width, y: (1 - v.y) / 2 * r.height};};

  return {
    get ready() {return ready;},
    get missing() {return paths?.missing ?? [];},
    setStep(id: StepId) {if (id === step) return; step = id; applyStep();},
    /** New flow (after a block was chosen or cleared, or the variant changed). */
    setFlow(result: FlowResult, block: SegmentId | null) {
      flow = result; blocked = block; reversed = new Set(block ? reversedSegments(result) : []);
      if (ready) {applyColours(); labels.set(labelSpecs());}
    },
    resetView() {flyTo(step);},
    tick(t: number) {
      if (!ready || disposed) return;
      if (tween) {
        const k = Math.min(1, (performance.now() - tween.start) / tween.ms), e = smooth(k);
        camera.position.lerpVectors(tween.from.pos, tween.to.pos, e); controls.target.lerpVectors(tween.from.tgt, tween.to.tgt, e); if (k >= 1) tween = null;
      }
      controls.update();
      territoryPaint(performance.now()); drawDots(t);
      renderer.render(scene, camera);
      const r = host.getBoundingClientRect(); labels.update(project, r.width, r.height);
    },
    /** Screenshots and tests: the canvas as it is drawn now. */
    get canvas() {return canvas;},
    /** Tests: largest flow, for scaling checks. */
    maxFlow: NORMAL_MAX_FLOW,
    dispose() {
      disposed = true; observer.disconnect(); controls.dispose(); labels.dispose();
      scene.traverse(o => {if (o instanceof T.Mesh) {o.geometry.dispose(); (o.material as T.Material).dispose();}});
      renderer.dispose(); canvas.remove();
    },
  };
}
