import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {decodeModelResponse} from '../model-download';
import {EYE_LAYERS, EYE_PARTS} from '../mj-eye-atlas';
import {EYE_OPENINGS} from '../mj-eye-openings';
import {EYE_MOVEMENTS, EYE_MUSCLE_IDS, followWeight, gazeQuaternion} from '../mj-eye-movement';
import {peelStepOf, type EyePartInfo, type EyeView, type EyeViewState} from './eye-catalogue';

/**
 * Viewer of the eye detail mode (left orbit, packaged by scripts/build-eye-atlas.mjs). Same model and drawing rules as the earlier
 * detail atlas; the page around it is the shared template (organ-detail-layout.tsx). React owns the state (EyeViewState), the viewer only draws it.
 */
interface Callbacks {
  progress: (percent: number) => void;
  ready: (parts: EyePartInfo[], sectionAt: {sagittal: number; coronal: number; horizontal: number}) => void;
  error: (message: string) => void;
  pick: (id: string | null) => void;
}
interface EyeManifest {bytes: number; gzip: string; globe: {center: number[]; axis: number[]; length: number}; openings?: {id: string; center: number[]; bones: Record<string, number[]>}[]; parts: {id: string; vertexCount: number; indexCount: number; positions: number; normals: number; indices: number; bounds: [number[], number[]]}[]}
interface Rec {info: EyePartInfo; mesh: T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>; center: T.Vector3; spread: T.Vector3; color: T.Color; opacity: number}

const MANIFEST = `${import.meta.env.BASE_URL}models/eye/eye-atlas.json`;
const SELECTED = new T.Color('#9dfc8f'), PARALYSED = new T.Color('#a7afb4'), OPENING_CONTENT = new T.Color('#f0b429');
const HOME = new T.Vector3(2.7, 1.35, 3.35).normalize();
const DIRECTIONS: Record<string, T.Vector3> = {
  front: new T.Vector3(0, .08, 1), back: new T.Vector3(0, .08, -1), left: new T.Vector3(1, .08, 0), right: new T.Vector3(-1, .08, 0), top: new T.Vector3(0, 1, .12), bottom: new T.Vector3(0, -1, .12),
};
const AXIS_INDEX = {sagittal: 0, coronal: 2, horizontal: 1} as const;

export function createEyeViewer(host: HTMLDivElement, cb: Callbacks) {
  const abort = new AbortController();
  let disposed = false, frame = 0, dirty = true, loaded = false, state: EyeViewState | undefined, commandId = -1;
  const scene = new T.Scene(); scene.background = new T.Color('#cbd2d6');
  const camera = new T.PerspectiveCamera(32, 1, .001, 100); camera.position.copy(HOME).multiplyScalar(4.5);
  const renderer = new T.WebGLRenderer({antialias: true, powerPreference: 'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7)); renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.localClippingEnabled = true;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-label', '3D 眼部詳細模型。拖曳旋轉，滾輪或雙指縮放，點選構造查看名稱。'); canvas.setAttribute('role', 'group'); canvas.style.touchAction = 'none';
  host.appendChild(canvas);
  const invalidate = () => {dirty = true;};
  const controls = new OrbitControls(camera, canvas); controls.enableDamping = true; controls.dampingFactor = .08; controls.minDistance = .12; controls.maxDistance = 14; controls.addEventListener('change', invalidate);
  scene.add(new T.HemisphereLight(0xffffff, 0x9aa1a8, 2.1));
  const key = new T.DirectionalLight(0xffffff, 2.2); key.position.set(-3, 4, 5); scene.add(key);
  const fill = new T.DirectionalLight(0xdbe8ff, 1.35); fill.position.set(3, 1, -4); scene.add(fill);

  const root = new T.Group(); scene.add(root);
  const recs = new Map<string, Rec>();
  const plane = new T.Plane(new T.Vector3(-1, 0, 0), 0);
  /** world-space box of the whole model: the section slider runs across it */
  const world = new T.Box3();
  let globeCenter = new T.Vector3(), globeAxis = new T.Vector3(0, 0, 1), globeLength = .024;
  const standardMaterial = (color: T.Color, opacity: number) => new T.MeshStandardMaterial({color, roughness: .58, metalness: .02, side: T.DoubleSide, transparent: opacity < 1, opacity, depthWrite: opacity >= 1});

  // ---- eye movements: the globe turns about its centre; the tendons of the six muscles and the front of the optic nerve follow it
  let rig: {center: T.Vector3; pupil?: Rec; globe: Rec[]; followers: {rec: Rec; base: Float32Array; weight: Float32Array}[]} | null = null;
  const gaze = new T.Quaternion(); let pupilSize = 1;
  let poseTween: {start: number; from: T.Quaternion; to: T.Quaternion; fromPupil: number; toPupil: number} | null = null;
  const applyPose = () => {
    const r = rig; if (!r) return;
    const c = r.center, offset = new T.Vector3();
    for (const g of r.globe) {
      g.mesh.quaternion.copy(gaze);
      if (g === r.pupil) {g.mesh.scale.setScalar(pupilSize); offset.copy(g.center).multiplyScalar(1 - pupilSize).sub(c);}
      else offset.copy(c).negate();
      g.mesh.position.copy(offset.applyQuaternion(gaze).add(c));
    }
    const v = new T.Vector3(), turned = new T.Vector3();
    for (const f of r.followers) {
      const position = f.rec.mesh.geometry.getAttribute('position') as T.BufferAttribute, array = position.array as Float32Array;
      for (let i = 0; i < f.weight.length; i++) {
        const w = f.weight[i];
        if (!w) {array[i * 3] = f.base[i * 3]; array[i * 3 + 1] = f.base[i * 3 + 1]; array[i * 3 + 2] = f.base[i * 3 + 2]; continue;}
        v.fromArray(f.base, i * 3); turned.copy(v).sub(c).applyQuaternion(gaze).add(c); v.lerp(turned, w).toArray(array, i * 3);
      }
      position.needsUpdate = true; f.rec.mesh.geometry.computeVertexNormals();
    }
  };

  // ---- openings of the orbit: a per-vertex colour that multiplies the bone colour (white = unchanged)
  const openingMarks: {id: string; rec: Rec; indices: number[]}[] = [];
  const openingCenters = new Map<string, T.Vector3>(), orbitEntrance = new T.Vector3();
  const markOpenings = (shown: string[], chosen: string | null) => {
    const touched = new Set<T.BufferAttribute>(), tint = new T.Color();
    for (const m of openingMarks) {const color = m.rec.mesh.geometry.getAttribute('color') as T.BufferAttribute; if (!touched.has(color)) {(color.array as Float32Array).fill(1); touched.add(color);}}
    for (const m of openingMarks) {
      if (!shown.includes(m.id)) continue;
      const opening = EYE_OPENINGS.find(o => o.id === m.id); if (!opening) continue;
      const base = m.rec.color, strength = chosen === null || chosen === m.id ? 1 : .45; tint.set(opening.color);
      const k = [tint.r / base.r, tint.g / base.g, tint.b / base.b].map(x => 1 + (Math.min(x, 1.6) - 1) * strength);
      const color = m.rec.mesh.geometry.getAttribute('color') as T.BufferAttribute;
      for (const i of m.indices) color.setXYZ(i, k[0], k[1], k[2]);
    }
    touched.forEach(c => {c.needsUpdate = true;});
  };

  // ---- camera
  let tween: {start: number; fromPosition: T.Vector3; fromTarget: T.Vector3; toPosition: T.Vector3; toTarget: T.Vector3} | null = null;
  const sizeCanvas = () => {
    const w = host.clientWidth, h = Math.max(host.clientHeight, 1);
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); invalidate();
  };
  sizeCanvas();
  const observer = new ResizeObserver(sizeCanvas); observer.observe(host);
  /** Fits the given structures (default: what is visible, within the orbit) into the view, looking along `direction`. */
  const frameParts = (smooth: boolean, direction?: T.Vector3, only?: string[]) => {
    const box = new T.Box3(), part = new T.Box3();
    root.updateMatrixWorld(true);
    const near = new T.Box3().setFromCenterAndSize(globeCenter.clone().applyMatrix4(root.matrixWorld), new T.Vector3().setScalar(globeLength * 11 * root.scale.x));
    for (const r of recs.values()) {
      if (only ? !only.includes(r.info.id) : !r.mesh.visible) continue;
      r.mesh.updateMatrixWorld(true);
      part.copy(r.mesh.geometry.boundingBox!).applyMatrix4(r.mesh.matrixWorld);
      if (only) box.union(part);
      else {const inside = part.clone().intersect(near); if (!inside.isEmpty()) box.union(inside);}
    }
    if (box.isEmpty()) return;
    const sphere = box.getBoundingSphere(new T.Sphere());
    const tan = Math.tan(T.MathUtils.degToRad(camera.fov / 2)), half = Math.atan(tan * Math.min(1, camera.aspect));
    const distance = T.MathUtils.clamp(sphere.radius / Math.sin(half) * 1.06, controls.minDistance, controls.maxDistance);
    const toTarget = sphere.center, toPosition = toTarget.clone().addScaledVector((direction ?? camera.position.clone().sub(controls.target)).clone().normalize(), distance);
    if (smooth) tween = {start: performance.now(), fromPosition: camera.position.clone(), fromTarget: controls.target.clone(), toPosition, toTarget};
    else {tween = null; camera.position.copy(toPosition); controls.target.copy(toTarget); controls.update();}
    invalidate();
  };
  const lookAt = (id: string) => {
    const center = openingCenters.get(id); if (!center) return;
    root.updateMatrixWorld(true);
    tween = {start: performance.now(), fromPosition: camera.position.clone(), fromTarget: controls.target.clone(), toPosition: orbitEntrance.clone().applyMatrix4(root.matrixWorld), toTarget: center.clone().applyMatrix4(root.matrixWorld)}; invalidate();
  };

  // ---- drawing rules
  const peeled = (r: Rec) => {const step = peelStepOf(r.info.layer); return step > 0 && step <= (state?.peel ?? 0);};
  const visibleIn = (r: Rec) => {
    if (!state) return false;
    if (state.isolate) return state.isolate === r.info.id;
    return !state.hidden.includes(r.info.id) && !peeled(r);
  };
  const placePlane = () => {
    const s = state?.section; if (!s || s.axis === 'none') return false;
    const axis = AXIS_INDEX[s.axis], lo = world.min.getComponent(axis), hi = world.max.getComponent(axis), at = lo + (hi - lo) * s.offset;
    const normal = new T.Vector3(); normal.setComponent(axis, s.flip ? -1 : 1);
    plane.set(normal, -normal.dot(new T.Vector3().setComponent(axis, at)));
    return true;
  };
  let markKey = '', lastMovement: string | null = null;
  const apply = () => {
    if (!state || !loaded) return;
    const cutting = placePlane(), movement = EYE_MOVEMENTS.find(m => m.id === state!.movementId);
    const opening = state.openingsOpen ? EYE_OPENINGS.find(o => o.id === state!.openingId) : undefined;
    for (const r of recs.values()) {
      const chosen = r.info.id === state.selectedId, m = r.mesh.material;
      r.mesh.visible = visibleIn(r);
      r.mesh.position.copy(r.spread).multiplyScalar(state.explode / 100);
      // An opening is shown the way a special region is: its bone and what passes through it stay, everything else fades.
      const passing = !!opening?.contents.includes(r.info.id), faded = !!opening && !chosen && !passing && r.info.layer !== 0;
      m.color.copy(chosen ? SELECTED : passing ? OPENING_CONTENT : movement?.paralysed?.includes(r.info.id) ? PARALYSED : r.color);
      m.emissive.set(chosen ? '#193b18' : '#000000');
      const opacity = chosen ? Math.max(r.opacity, .9) : faded ? Math.min(r.opacity, .07) : r.opacity, transparent = opacity < 1;
      if (m.transparent !== transparent) {m.transparent = transparent; m.depthWrite = !transparent; m.needsUpdate = true;}
      m.opacity = opacity;
      const planes = cutting && !state.isolate ? [plane] : [];
      if ((m.clippingPlanes?.length ?? 0) !== planes.length) m.needsUpdate = true;
      m.clippingPlanes = planes;
    }
    // the loop above put every part at its separated position; put the globe back at its gaze
    if (state.explode === 0) applyPose();
    const nextKey = (state.openingsOpen ? 'on' : 'off') + '|' + (state.openingsOpen ? state.openingId ?? '' : '');
    if (nextKey !== markKey) {markKey = nextKey; markOpenings(state.openingsOpen ? EYE_OPENINGS.map(o => o.id) : [], state.openingsOpen ? state.openingId : null);}
    if ((movement?.id ?? null) !== lastMovement) {
      lastMovement = movement?.id ?? null;
      const to = new T.Quaternion().fromArray(gazeQuaternion(movement?.rotation ?? {abduct: 0, elevate: 0, intort: 0})), pupil = movement?.pupil ?? 1;
      poseTween = {start: performance.now(), from: gaze.clone(), to, fromPupil: pupilSize, toPupil: pupil};
    }
    invalidate();
  };

  // ---- loading
  const load = async () => {
    let manifest: EyeManifest, buffer: ArrayBuffer;
    try {
      manifest = await (await fetch(MANIFEST, {signal: abort.signal})).json() as EyeManifest;
      cb.progress(15);
      buffer = await decodeModelResponse(await fetch(import.meta.env.BASE_URL + manifest.gzip, {signal: abort.signal}), manifest.bytes, true);
    } catch {if (!disposed) cb.error('眼部模型無法載入，請檢查網路連線後再試一次。'); return;}
    if (disposed) return;
    cb.progress(80);
    globeCenter = new T.Vector3().fromArray(manifest.globe.center); globeAxis = new T.Vector3().fromArray(manifest.globe.axis); globeLength = manifest.globe.length;
    const list: EyePartInfo[] = [];
    for (const p of manifest.parts) {
      const part = EYE_PARTS[p.id]; if (!part) continue;
      const layer = EYE_LAYERS[part.layer], color = new T.Color(part.color ?? layer.color), opacity = part.opacity ?? 1;
      const geometry = new T.BufferGeometry();
      geometry.setAttribute('position', new T.BufferAttribute(new Float32Array(buffer, p.positions, p.vertexCount * 3), 3));
      geometry.setAttribute('normal', new T.BufferAttribute(new Int16Array(buffer, p.normals, p.vertexCount * 3), 3, true));
      geometry.setIndex(new T.BufferAttribute(new Uint32Array(buffer, p.indices, p.indexCount), 1));
      geometry.computeBoundingBox();
      const mesh = new T.Mesh(geometry, standardMaterial(color, opacity));
      mesh.userData.partId = p.id; if (opacity < 1) mesh.renderOrder = 100 - part.layer;
      root.add(mesh);
      const info: EyePartInfo = {id: p.id, name: part.name, zh: part.zh, text: part.text, textZh: part.textZh, layer: part.layer, group: layer.name, groupZh: layer.zh};
      const rec: Rec = {info, mesh, center: geometry.boundingBox!.getCenter(new T.Vector3()), spread: new T.Vector3(), color, opacity};
      // Globe layers separate along the optical axis; everything else moves radially away from the globe.
      if (part.axial !== undefined) rec.spread.copy(globeAxis).multiplyScalar(part.axial * globeLength * .75);
      else {
        const direction = rec.center.clone().sub(globeCenter);
        if (direction.lengthSq() < 1e-10) direction.copy(globeAxis);
        // Structures far behind the globe travel further so the orbital apex opens up too.
        const reach = 1 + Math.min(2, direction.length() / globeLength) * .45;
        rec.spread.copy(direction.normalize().multiplyScalar(globeLength * (part.layer === 0 ? 1.5 : .9) * reach));
      }
      recs.set(p.id, rec); list.push(info);
    }
    if (!recs.size) {cb.error('詳細模式的模型無法載入。'); return;}
    // Openings are painted on the bone: a per-vertex colour that multiplies the bone colour.
    for (const opening of manifest.openings ?? []) for (const [boneId, indices] of Object.entries(opening.bones)) {
      const rec = recs.get(boneId); if (!rec) continue;
      const geometry = rec.mesh.geometry;
      if (!geometry.getAttribute('color')) {geometry.setAttribute('color', new T.BufferAttribute(new Float32Array(geometry.getAttribute('position').count * 3).fill(1), 3)); rec.mesh.material.vertexColors = true; rec.mesh.material.needsUpdate = true;}
      openingMarks.push({id: opening.id, rec, indices});
    }
    for (const opening of manifest.openings ?? []) openingCenters.set(opening.id, new T.Vector3().fromArray(opening.center));
    orbitEntrance.copy(globeCenter).addScaledVector(globeAxis, globeLength * 5.2).add(new T.Vector3(Math.sign(globeCenter.x) || 1, .2, 0).multiplyScalar(globeLength * 2.3));
    // rig for the eye movements
    const REACH = .014, onGlobe = globeLength / 2 + .003;
    const verticesOf = (r: Rec) => {const position = r.mesh.geometry.getAttribute('position') as T.BufferAttribute, out: T.Vector3[] = []; for (let i = 0; i < position.count; i++) out.push(new T.Vector3().fromBufferAttribute(position, i)); return out;};
    const centroid = (points: T.Vector3[]) => points.reduce((sum, v) => sum.add(v), new T.Vector3()).divideScalar(points.length || 1);
    const follower = (rec: Rec, attachment: T.Vector3) => {
      const position = rec.mesh.geometry.getAttribute('position') as T.BufferAttribute, base = Float32Array.from(position.array as Float32Array), weight = new Float32Array(position.count), v = new T.Vector3();
      for (let i = 0; i < position.count; i++) weight[i] = followWeight(v.fromArray(base, i * 3).distanceTo(attachment), REACH);
      // The packaged normals are 16-bit; a part that changes shape needs normals that can be recomputed.
      rec.mesh.geometry.deleteAttribute('normal'); rec.mesh.geometry.computeVertexNormals();
      return {rec, base, weight};
    };
    const trochlea = recs.get('FJ1329');
    rig = {center: globeCenter.clone(), pupil: recs.get('VH_M_pupil_L'), globe: [...recs.values()].filter(r => r.info.id.startsWith('VH_M_') && !r.info.id.includes('palpebral')), followers: []};
    for (const id of [EYE_MUSCLE_IDS.superiorRectus, EYE_MUSCLE_IDS.inferiorRectus, EYE_MUSCLE_IDS.medialRectus, EYE_MUSCLE_IDS.lateralRectus, EYE_MUSCLE_IDS.superiorOblique, EYE_MUSCLE_IDS.inferiorOblique]) {
      const rec = recs.get(id); if (!rec) continue;
      const all = verticesOf(rec), touching = all.filter(v => v.distanceTo(globeCenter) < onGlobe); if (!touching.length) continue;
      // The insertion is the end of the part lying on the globe that is furthest from where the muscle comes from (for the superior oblique, from the trochlea).
      const from = id === EYE_MUSCLE_IDS.superiorOblique && trochlea ? trochlea.center : all.reduce((far, v) => v.distanceTo(globeCenter) > far.distanceTo(globeCenter) ? v : far, all[0]);
      rig.followers.push(follower(rec, centroid([...touching].sort((a, b) => b.distanceTo(from) - a.distanceTo(from)).slice(0, 12))));
    }
    const nerve = recs.get('FJ1313');
    if (nerve) rig.followers.push(follower(nerve, centroid(verticesOf(nerve).sort((a, b) => b.dot(globeAxis) - a.dot(globeAxis)).slice(0, 15))));
    // centre and scale the atlas
    const box = new T.Box3(); for (const r of recs.values()) box.union(r.mesh.geometry.boundingBox!);
    const size = box.getSize(new T.Vector3()), centre = box.getCenter(new T.Vector3()), scale = 2.45 / (Math.max(size.x, size.y, size.z) || 1);
    root.scale.setScalar(scale); root.position.copy(centre).multiplyScalar(-scale); root.updateMatrixWorld(true);
    world.copy(box).applyMatrix4(root.matrixWorld);
    const g = globeCenter.clone().applyMatrix4(root.matrixWorld), at = (axis: number) => (g.getComponent(axis) - world.min.getComponent(axis)) / ((world.max.getComponent(axis) - world.min.getComponent(axis)) || 1);
    loaded = true; cb.progress(100);
    cb.ready(list, {sagittal: at(0), coronal: at(2), horizontal: at(1)});
  };
  void load();

  const update = (next: EyeViewState) => {
    state = next;
    if (loaded) {
      apply();
      if (commandId !== next.command.id) {
        commandId = next.command.id;
        const {view, focus, opening} = next.command;
        if (view === 'look' && opening) lookAt(opening);
        else if (view === 'home') frameParts(false, HOME);
        else if (view === 'fit') frameParts(true, undefined, focus);
        else frameParts(true, DIRECTIONS[view]);
      }
    }
  };

  // ---- picking
  const raycaster = new T.Raycaster(), pointer = new T.Vector2(); let down: {x: number; y: number} | null = null;
  const pointerDown = (e: PointerEvent) => {down = {x: e.clientX, y: e.clientY}; tween = null;};
  const pointerUp = (e: PointerEvent) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 7) {down = null; return;} down = null;
    const rect = canvas.getBoundingClientRect();
    pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const candidates = [...recs.values()].map(r => r.mesh).filter(o => o.visible);
    // ignore surface that the section plane has cut away
    const sectioned = !!(candidates[0]?.material as T.Material | undefined)?.clippingPlanes?.length;
    const hit = raycaster.intersectObjects(candidates, false).find(i => !sectioned || plane.distanceToPoint(i.point) >= 0);
    cb.pick(hit ? String(hit.object.userData.partId) : null);
  };
  const wheel = () => {tween = null;};
  canvas.addEventListener('pointerdown', pointerDown); canvas.addEventListener('pointerup', pointerUp); canvas.addEventListener('wheel', wheel, {passive: true});

  const animate = () => {
    if (disposed) return; frame = requestAnimationFrame(animate);
    if (tween) {
      const k = Math.min(1, (performance.now() - tween.start) / 420), e = 1 - Math.pow(1 - k, 3);
      camera.position.lerpVectors(tween.fromPosition, tween.toPosition, e); controls.target.lerpVectors(tween.fromTarget, tween.toTarget, e);
      if (k >= 1) tween = null; dirty = true;
    }
    if (poseTween) {
      const k = Math.min(1, (performance.now() - poseTween.start) / 650), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      gaze.slerpQuaternions(poseTween.from, poseTween.to, e); pupilSize = poseTween.fromPupil + (poseTween.toPupil - poseTween.fromPupil) * e;
      if (k >= 1) poseTween = null;
      if (!state || state.explode === 0) applyPose();
      dirty = true;
    }
    controls.update();
    if (dirty) {
      dirty = false;
      // the depth range follows the orbit distance, so thin layers lying on one another keep their order when zoomed in
      const distance = camera.position.distanceTo(controls.target), near = Math.max(.0005, distance * .02), far = distance * 40 + 10;
      if (Math.abs(camera.near - near) > near * .05) {camera.near = near; camera.far = far; camera.updateProjectionMatrix();}
      renderer.render(scene, camera);
    }
  };
  animate();

  const dispose = () => {
    disposed = true; abort.abort(); cancelAnimationFrame(frame); observer.disconnect(); controls.dispose();
    canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointerup', pointerUp); canvas.removeEventListener('wheel', wheel);
    scene.traverse(o => {if (o instanceof T.Mesh) {o.geometry.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());}});
    renderer.dispose(); canvas.remove();
  };
  return {update, dispose};
}

export type {EyeView};
