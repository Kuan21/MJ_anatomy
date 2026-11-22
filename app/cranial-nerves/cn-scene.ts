import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {framingDistance} from '../camera-framing';
import {LabelLayer, type LabelSpec} from '../ear-hearing/label-layer';
import {bandAt, CRANIAL_NERVES, flowDirection, LEVELS, type CranialNerve} from './cn-data';
import {loadSiteMeshes, sideless, sideOf, type LoadedMesh} from './cn-load';

interface Callbacks {progress: (percent: number) => void; ready: () => void; error: (message: string) => void}
type Side = 'left' | 'right';

/** Skull and upper neck bones drawn as glass for orientation. */
const BONES = /^(frontal bone|occipital bone|sphenoid bone|ethmoid|mandible|(left|right) (maxilla|temporal bone|parietal bone|zygomatic bone|palatine bone|nasal bone)|atlas|axis|third cervical vertebra)$/i;
const BRAINSTEM = /^(pons|midbrain|medulla oblongata|cerebellum)$/i;
const NERVE_SUFFIX = /\.(?:l|r)(?:\.\d+)?$|\.\d+$/;
export const cleanNerveName = (n: string) => n.replace(NERVE_SUFFIX, '').replace(NERVE_SUFFIX, '').trim();
const sideOfNerve = (n: string): Side => /\.l(\.\d+)?$/i.test(n) ? 'left' : 'right';

const YELLOW = new T.Color('#e9c84a'), GLOW = new T.Color('#fff2a8'), HOT = new T.Color('#ff9d00'), TARGET = '#3f9c6d', OPENING = '#d23f9c', OPENING_DIM = '#b9a7d6', BONE = '#e6ddc9', STEM = '#d7c2b4';
const LEVEL_COLOUR = ['#7aa6d8', '#9b7fd1', '#e0a43c', '#5fae8a'];
/** where the brainstem is in the atlas frame (the centre of the pons), used as the start of every nerve's light */
const STEM_CENTRE = new T.Vector3(0, 1.585, -.012);
const smooth = (k: number) => k * k * (3 - 2 * k);

/** The twelve cranial nerves in 3D: the nerves of the site's nerve stream, the brainstem, the skull as glass with the openings marked on it (#433), and the muscles each nerve supplies.
 *  The current nerve is lit, a band of light runs along it (outward for motor, inward for sensory), its openings pulse and its targets turn green. */
export function createCranialScene(host: HTMLElement, callbacks: Callbacks) {
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(30, 1, .005, 5);
  const renderer = new T.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); renderer.setClearColor('#cbd2d6', 0);
  renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  const canvas = renderer.domElement; canvas.className = 'hear-canvas'; canvas.style.touchAction = 'none';
  canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', '十二對腦神經 3D 動畫。拖曳旋轉，滾輪或雙指縮放。');
  host.appendChild(canvas);
  const labels = new LabelLayer(host);
  const controls = new OrbitControls(camera, canvas); controls.enableDamping = true; controls.dampingFactor = .15; controls.minDistance = .04; controls.maxDistance = 1.5;
  scene.add(new T.HemisphereLight('#ffffff', '#7b8e9c', 2.1));
  const key = new T.DirectionalLight('#fff6e6', 2.3); key.position.set(2, -1, 3); scene.add(key);
  const fill = new T.DirectionalLight('#a8c8e3', 1.2); fill.position.set(-2, 2, -2); scene.add(fill);

  interface NerveMesh {mesh: T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>; nerve: CranialNerve; side: Side; dist: Float32Array; colours: Float32Array}
  const nerves: NerveMesh[] = [], targets = new Map<string, T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>[]>(), openings = new Map<string, T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>[]>();
  const schematicPoints = new Map<string, T.Vector3>();
  let disposed = false, ready = false, step = 0, tween: {from: {pos: T.Vector3; tgt: T.Vector3}; to: {pos: T.Vector3; tgt: T.Vector3}; start: number; ms: number} | null = null;
  const abort = new AbortController();

  const targetNames = new Set(CRANIAL_NERVES.flatMap(n => n.targets.flatMap(t => t.meshes)));
  const openingNames = new Set(CRANIAL_NERVES.flatMap(n => n.openings.map(o => o.mark?.toLowerCase()).filter(Boolean) as string[]));
  const isNerve = (raw: string) => CRANIAL_NERVES.some(n => n.meshes.test(cleanNerveName(raw)));

  void (async () => {
    try {
      const loaded = await loadSiteMeshes({
        atlas: n => BONES.test(n) || BRAINSTEM.test(n) || targetNames.has(sideless(n)),
        facial: n => targetNames.has(sideless(n)),
        paokao: n => openingNames.has(sideless(n)),
        nerve: isNerve,
      }, abort.signal, callbacks.progress);
      if (disposed) return;
      setup(loaded); ready = true; applyStep(true); callbacks.ready();
    } catch (e) {if (!disposed) {console.error('cranial nerves animation', e); callbacks.error('腦神經動畫的模型未能載入，請重新載入。');}}
  })();

  const mat = (colour: string, opacity = 1) => new T.MeshStandardMaterial({color: colour, roughness: .6, metalness: 0, side: T.DoubleSide, transparent: opacity < 1, opacity, depthWrite: opacity >= 1});
  function setup(loaded: LoadedMesh[]) {
    for (const m of loaded) {
      if (m.source === 'nerve') {
        const name = cleanNerveName(m.name), nerve = CRANIAL_NERVES.find(n => n.meshes.test(name))!;
        const g = m.geometry, a = g.getAttribute('position'), dist = new Float32Array(a.count), colours = new Float32Array(a.count * 3);
        g.setAttribute('color', new T.BufferAttribute(colours, 3));
        const material = mat('#ffffff'); material.vertexColors = true;
        const mesh = new T.Mesh(g, material); mesh.renderOrder = 3; scene.add(mesh);
        nerves.push({mesh, nerve, side: sideOfNerve(m.name), dist, colours});
        continue;
      }
      const name = sideless(m.name);
      if (m.source === 'paokao') {
        const mesh = new T.Mesh(m.geometry, mat(OPENING_DIM, .5)); mesh.renderOrder = 4; scene.add(mesh);
        (openings.get(name) ?? openings.set(name, []).get(name)!).push(mesh);
        // the site marks only one jugular foramen (no side in its name): the other side is its mirror image, drawn as schematic
        if (name === 'jugular foramen') {const g = m.geometry.clone(); g.scale(-1, 1, 1); g.computeBoundingBox(); const mirror = new T.Mesh(g, mat(OPENING_DIM, .5)); mirror.renderOrder = 4; mirror.userData.schematic = true; scene.add(mirror); openings.get(name)!.push(mirror);}
        continue;
      }
      if (BONES.test(m.name)) {const mesh = new T.Mesh(m.geometry, mat(BONE, .16)); mesh.renderOrder = 1; scene.add(mesh); continue;}
      if (BRAINSTEM.test(m.name)) {const mesh = new T.Mesh(m.geometry, mat(STEM, .5)); mesh.renderOrder = 2; scene.add(mesh); continue;}
      const mesh = new T.Mesh(m.geometry, mat(TARGET)); mesh.renderOrder = 2; mesh.visible = false; scene.add(mesh);
      (targets.get(name) ?? targets.set(name, []).get(name)!).push(mesh);
    }
    // distance of every nerve vertex from where that nerve leaves the brainstem (its vertex nearest the brainstem, per nerve and side): the light band runs along this
    for (const nerve of CRANIAL_NERVES) for (const side of ['left', 'right'] as Side[]) {
      const list = nerves.filter(n => n.nerve === nerve && n.side === side); if (!list.length) continue;
      let best = Infinity; const origin = new T.Vector3(), v = new T.Vector3();
      for (const n of list) {const a = n.mesh.geometry.getAttribute('position'); for (let k = 0; k < a.count; k++) {v.fromBufferAttribute(a, k); const d = v.distanceToSquared(STEM_CENTRE); if (d < best) {best = d; origin.copy(v);}}}
      for (const n of list) {const a = n.mesh.geometry.getAttribute('position'); for (let k = 0; k < a.count; k++) n.dist[k] = v.fromBufferAttribute(a, k).distanceTo(origin);}
      if (nerve.id === 'olfactory') {
        // no mark on the skull for the cribriform plate: a schematic point just below the front end of the olfactory nerve
        let front = new T.Vector3(0, 0, -Infinity);
        for (const n of list) {const a = n.mesh.geometry.getAttribute('position'); for (let k = 0; k < a.count; k++) {v.fromBufferAttribute(a, k); if (v.z > front.z) front = v.clone();}}
        schematicPoints.set(`olfactory-${side}`, front.add(new T.Vector3(0, -.004, -.004)));
      }
    }
    for (const [key, p] of schematicPoints) {const s = new T.Mesh(new T.SphereGeometry(.0028, 16, 12), mat(OPENING, 1)); s.position.copy(p); s.userData.key = key; s.renderOrder = 5; scene.add(s); (openings.get('cribriform') ?? openings.set('cribriform', []).get('cribriform')!).push(s);}
  }

  // ---- step
  const current = () => step === 0 ? null : CRANIAL_NERVES[step - 1];
  const boxOf = (meshes: T.Mesh[]) => {const b = new T.Box3(); for (const m of meshes) {m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox!);} return b;};
  const nerveMeshes = (n: CranialNerve, side?: Side) => nerves.filter(x => x.nerve === n && (!side || x.side === side)).map(x => x.mesh);
  const targetMeshes = (n: CranialNerve, side?: Side) => n.targets.flatMap(t => t.meshes.flatMap(name => (targets.get(name) ?? []).filter(m => !side || m.geometry.boundingBox!.getCenter(new T.Vector3()).x * (side === 'left' ? 1 : -1) > 0)));
  const openingMeshes = (n: CranialNerve) => n.openings.flatMap(o => o.mark ? openings.get(o.mark.toLowerCase()) ?? [] : n.id === 'olfactory' ? openings.get('cribriform') ?? [] : []);
  function aimFor(): {pos: T.Vector3; tgt: T.Vector3} | null {
    const n = current();
    // overview: the base of the brain from below and in front, like the classic figure; a nerve: its left side from in front, below and to the left, with its targets
    const box = n ? boxOf([...nerveMeshes(n, 'left'), ...targetMeshes(n, 'left')]) : boxOf(nerves.map(x => x.mesh));
    if (box.isEmpty()) return null;
    if (!n) {box.min.y = Math.max(box.min.y, 1.53); box.min.z = Math.max(box.min.z, -.06);}
    const dir = (n ? new T.Vector3(.75, -.25, .6) : new T.Vector3(0, -.8, .6)).normalize(), centre = box.getCenter(new T.Vector3());
    const pad = new T.Box3(box.min.clone().addScalar(-.006), box.max.clone().addScalar(.006)), distance = framingDistance(pad, dir, camera.fov, camera.aspect, .78, .78, .06);
    const screenUp = new T.Vector3(0, 1, 0).addScaledVector(dir, -dir.y).normalize(), shift = screenUp.multiplyScalar(-distance * Math.tan(camera.fov * Math.PI / 360) * .14);
    return {tgt: centre.clone().add(shift), pos: centre.clone().addScaledVector(dir, distance).add(shift)};
  }
  function applyStep(instant = false) {
    if (!ready) return;
    const n = current();
    for (const list of targets.values()) for (const m of list) m.visible = false;
    if (n) for (const m of targetMeshes(n)) m.visible = true;
    for (const list of openings.values()) for (const m of list) {m.material.color.set(OPENING_DIM); m.material.opacity = .4; m.material.transparent = true; m.visible = !m.userData.key || n?.id === 'olfactory';}
    const to = aimFor();
    if (to) {if (instant) {camera.position.copy(to.pos); controls.target.copy(to.tgt); controls.update(); tween = null;} else tween = {from: {pos: camera.position.clone(), tgt: controls.target.clone()}, to, start: performance.now(), ms: 1200};}
    labels.set(labelSpecs());
  }

  // ---- labels
  const levelOf = (n: CranialNerve) => LEVELS.findIndex(l => l.nerves.includes(n.n));
  function labelSpecs(): LabelSpec[] {
    const n = current(), out: LabelSpec[] = [];
    const point = (meshes: T.Mesh[], pick: 'origin' | 'far' | 'centre') => () => {
      if (!meshes.length) return null;
      if (pick === 'centre') return boxOf(meshes).getCenter(new T.Vector3());
      // a vertex on the mesh: nearest to the brainstem (origin) or farthest from it
      let best = pick === 'origin' ? Infinity : -Infinity, at: T.Vector3 | null = null; const v = new T.Vector3();
      for (const m of meshes) {const a = m.geometry.getAttribute('position'); for (let k = 0; k < a.count; k += 3) {v.fromBufferAttribute(a, k); const d = v.distanceToSquared(STEM_CENTRE); if (pick === 'origin' ? d < best : d > best) {best = d; at = v.clone();}}}
      return at;
    };
    if (!n) {
      // overview: the roman numeral of each nerve, at the point where its left side leaves the brain
      for (const c of CRANIAL_NERVES) {
        const meshes = nerveMeshes(c, 'left'); if (!meshes.length) continue;
        out.push({key: `o-${c.id}`, en: `${c.roman} ${c.en.replace(/ nerve$/, '')}`, zh: c.zh, at: point(meshes, 'origin'), dx: 40, dy: c.n % 2 ? -24 : 10});
      }
      return out;
    }
    const left = nerveMeshes(n, 'left');
    out.push({key: `n-${n.id}`, en: `${n.roman} · ${n.en}`, zh: n.zh, at: point(left, 'origin'), accent: true, dx: 40, dy: -46});
    n.openings.forEach((o, i) => {
      const meshes = o.mark ? (openings.get(o.mark.toLowerCase()) ?? []).filter(m => m.geometry.boundingBox!.getCenter(new T.Vector3()).x > 0 || /magnum/i.test(o.mark!)) : (openings.get('cribriform') ?? []).filter(m => m.position.x >= 0);
      out.push({key: `p-${i}`, en: o.en, zh: o.zh, at: point(meshes, 'centre'), schematic: !o.mark || (/jugular/i.test(o.mark) && meshes.every(m => m.userData.schematic)), dx: -190, dy: 20 + i * 36});
    });
    n.targets.forEach((t, i) => {
      const meshes = t.meshes.flatMap(name => (targets.get(name) ?? []).filter(m => m.geometry.boundingBox!.getCenter(new T.Vector3()).x > 0));
      if (meshes.length) out.push({key: `t-${i}`, en: t.en, zh: t.zh, at: point(meshes, 'centre'), dx: 46, dy: 30 + i * 34});
    });
    return out;
  }

  // ---- per frame: the light band along the current nerve (both sides), the openings pulse
  function paint(t: number, now: number) {
    const n = current(), pulse = .5 + .5 * Math.sin(now / 1000 * Math.PI * 1.6);
    for (const x of nerves) {
      const on = !n || x.nerve === n, c = x.colours, a = x.mesh.geometry.getAttribute('color') as T.BufferAttribute;
      x.mesh.material.transparent = !on; x.mesh.material.opacity = on ? 1 : .22; x.mesh.material.depthWrite = on;
      if (!n) {
        const col = new T.Color(LEVEL_COLOUR[levelOf(x.nerve)]);
        for (let k = 0; k < x.dist.length; k++) {c[k * 3] = col.r; c[k * 3 + 1] = col.g; c[k * 3 + 2] = col.b;}
      } else if (on) {
        const dirs = flowDirection(x.nerve.kind);
        for (let k = 0; k < x.dist.length; k++) {
          const glow = Math.max(...dirs.map(d => bandAt(x.dist[k], t, d)));
          c[k * 3] = YELLOW.r + (HOT.r - YELLOW.r) * glow; c[k * 3 + 1] = YELLOW.g + (HOT.g - YELLOW.g) * glow; c[k * 3 + 2] = YELLOW.b + (HOT.b - YELLOW.b) * glow;
        }
      } else for (let k = 0; k < x.dist.length; k++) {c[k * 3] = GLOW.r; c[k * 3 + 1] = GLOW.g; c[k * 3 + 2] = GLOW.b;}
      a.needsUpdate = true;
    }
    if (n) for (const m of openingMeshes(n)) {m.material.color.set(OPENING); m.material.opacity = .55 + .45 * pulse; m.visible = true;}
  }

  const resize = () => {const r = host.getBoundingClientRect(); renderer.setSize(Math.max(1, r.width), Math.max(1, r.height)); camera.aspect = Math.max(1, r.width) / Math.max(1, r.height); camera.updateProjectionMatrix();};
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const project = (p: T.Vector3) => {const q = p.clone().project(camera); if (q.z > 1) return null; const r = host.getBoundingClientRect(); return {x: (q.x + 1) / 2 * r.width, y: (1 - q.y) / 2 * r.height};};
  let painted = -1;

  return {
    get ready() {return ready;},
    /** 0 = overview, 1–12 = the nerves */
    setStep(i: number) {if (i === step) return; step = i; painted = -1; applyStep();},
    resetView() {if (ready) applyStep();},
    tick(t: number) {
      if (!ready || disposed) return;
      const now = performance.now();
      if (tween) {const k = Math.min(1, (now - tween.start) / tween.ms), e = smooth(k); camera.position.lerpVectors(tween.from.pos, tween.to.pos, e); controls.target.lerpVectors(tween.from.tgt, tween.to.tgt, e); if (k >= 1) tween = null;}
      controls.update();
      // the overview colours do not change: paint them once; a nerve is repainted every frame (the band moves)
      if (step !== 0 || painted !== 0) {paint(t, now); painted = step;}
      renderer.render(scene, camera);
      const r = host.getBoundingClientRect(); labels.update(project, r.width, r.height);
    },
    get canvas() {return canvas;},
    dispose() {
      disposed = true; abort.abort(); observer.disconnect(); controls.dispose(); labels.dispose();
      scene.traverse(o => {if (o instanceof T.Mesh) {o.geometry.dispose(); (o.material as T.Material).dispose();}});
      renderer.dispose(); canvas.remove();
    },
  };
}

export {sideOf};
