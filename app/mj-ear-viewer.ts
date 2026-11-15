import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {PointerTap} from './pointer-tap';
import {framingDistance} from './camera-framing';
import {fetchModelBuffer} from './model-download';
import {EAR_BY_ID, EAR_LAYERS, type EarPart} from './mj-ear-atlas';

export type EarSectionAxis = 'none' | 'sagittal' | 'coronal' | 'horizontal';
export interface EarSection {axis: EarSectionAxis; offset: number; flip: boolean}
export type EarView = 'lateral' | 'medial' | 'front' | 'back' | 'top' | 'bottom' | 'fit';
export interface EarViewState {
  hiddenGroups: string[];
  hiddenParts: string[];
  /** outer layers already peeled away (EAR_LAYERS from the outside in) */
  peel: number;
  /** structures drawn alone when set */
  isolate: string[] | null;
  selectedIds: string[];
  section: EarSection;
  command: {id: number; view: EarView; focus?: string[]};
}
/** The body atlas frame: +x is the body's left, +y up, +z anterior; the model is a right ear, so it lies at negative x. */
export const EAR_SECTION_AXES: Record<Exclude<EarSectionAxis, 'none'>, {index: 0 | 1 | 2; en: string; zh: string; cut: string}> = {
  sagittal: {index: 0, en: 'Sagittal', zh: '矢狀面', cut: '內外'},
  coronal: {index: 2, en: 'Coronal', zh: '冠狀面', cut: '前後'},
  horizontal: {index: 1, en: 'Horizontal (axial)', zh: '水平面', cut: '上下'},
};
/** Each cut removes the half that faces the camera that looks into it: sagittal from the outside (lateral), coronal from the front, horizontal from above. */
export const EAR_CUT: Record<Exclude<EarSectionAxis, 'none'>, {flip: boolean; view: EarView}> = {sagittal: {flip: false, view: 'lateral'}, coronal: {flip: true, view: 'front'}, horizontal: {flip: true, view: 'top'}};

export const EAR_SELECT = {fill: '#5DB89A', edge: '#3E8E74'};
/** A structure without a mesh highlights its neighbours in this colour. */
export const EAR_NEAR = '#7BB2E6';
const COVER_OPACITY = .07, FADE_OPACITY = .08;

interface AtlasPart {id: string; vertexCount: number; indexCount: number; bounds: number[][]; positions: number; normals: number; indices: number; mark?: string}
interface Atlas {bytes: number; gzip: string; parts: AtlasPart[]}

interface Callbacks {
  progress: (percent: number) => void;
  /** ids with a mesh, and the cutting offsets (0-1) that pass through the stapes, so that each cut opens on the middle ear */
  ready: (info: {ids: string[]; sectionOffsets: Record<Exclude<EarSectionAxis, 'none'>, number>}) => void;
  error: (message: string) => void;
  pick: (id: string | null) => void;
}

/** What a cut part looks like from inside: a flat tint of its colour (the back faces of a closed mesh seen through the cutting plane). */
function capped(material: T.MeshStandardMaterial, cap: T.Color) {
  material.onBeforeCompile = shader => {
    shader.uniforms.uCap = {value: cap};
    shader.fragmentShader = 'uniform vec3 uCap;\n' + shader.fragmentShader.replace('#include <opaque_fragment>', 'vec3 shown = gl_FrontFacing ? outgoingLight : uCap; gl_FragColor = vec4(shown, diffuseColor.a);');
  };
  material.customProgramCacheKey = () => 'ear-capped';
  return material;
}

/** Isolated viewer of the ear detail mode (one right ear): sections, peel layers, picking. It never touches the atlas scene. */
export function createEarViewer(host: HTMLDivElement, callbacks: Callbacks) {
  const tap = new PointerTap();
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(30, 1, .002, 5);
  const renderer = new T.WebGLRenderer({antialias: true, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor('#cbd2d6');
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.localClippingEnabled = true;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-label', '3D 耳部詳細模型（右耳）。拖曳旋轉，滾輪或雙指縮放，點選構造查看名稱。');
  canvas.setAttribute('role', 'group');
  canvas.style.touchAction = 'none';
  host.appendChild(canvas);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = .15; controls.minDistance = .006; controls.maxDistance = .6; controls.enablePan = true;
  scene.add(new T.HemisphereLight('#ffffff', '#7b8e9c', 2.2));
  const key = new T.DirectionalLight('#fff6e6', 2.6); key.position.set(-1.5, 3, 4); scene.add(key);
  const fill = new T.DirectionalLight('#a8c8e3', 1.4); fill.position.set(3, 1, -3); scene.add(fill);

  const plane = new T.Plane(new T.Vector3(0, 0, 1), 0);
  const parts = new Map<string, EarPart>(), meshes = new Map<string, T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>>(), caps = new Map<string, T.Color>();
  const core = new T.Box3(), frameBox = new T.Box3(), raycaster = new T.Raycaster();
  let state: EarViewState | undefined, disposed = false, dirty = true, frame = 0, command = -1, loaded = false;
  const faded = new Set<string>();

  const planeActive = () => !!state && state.section.axis !== 'none';
  const placePlane = () => {
    const s = state?.section;
    if (!s || s.axis === 'none') return false;
    const axis = EAR_SECTION_AXES[s.axis].index, lo = core.min.getComponent(axis), hi = core.max.getComponent(axis), at = lo + (hi - lo) * s.offset;
    const normal = new T.Vector3(); normal.setComponent(axis, s.flip ? -1 : 1);
    plane.set(normal, -normal.dot(new T.Vector3().setComponent(axis, at)));
    return true;
  };
  const keeps = (point: T.Vector3) => !planeActive() || plane.distanceToPoint(point) >= 0;

  /** How deep a selected structure lies: the peel layers in front of it (smaller layer index) are drawn as faint glass so that it can be seen and clicked. Nerves lie at the depth of the ossicles, the membranous labyrinth under every layer. */
  const depthOf = (p: EarPart) => p.layer >= 0 ? p.layer : p.group === 'nerves' ? 3 : EAR_LAYERS.length;
  const nearOf = (selected: EarPart[]) => new Set(selected.filter(p => !p.model).flatMap(p => p.near ?? []));

  const visibleIn = (p: EarPart, forced: Set<string>) => {
    if (!state) return false;
    if (state.isolate) return state.isolate.includes(p.id);
    if (forced.has(p.id)) return true;
    if (state.hiddenGroups.includes(p.group) || state.hiddenParts.includes(p.id)) return false;
    return p.layer < 0 || p.layer >= state.peel;
  };
  const apply = () => {
    if (!state) return;
    const cutting = placePlane(), selected = new Set(state.selectedIds), chosen = state.selectedIds.map(id => EAR_BY_ID.get(id)).filter((p): p is EarPart => !!p);
    // a selected card-only structure shows the modelled structures next to it, whatever their switches say
    const near = nearOf(chosen), cardOnly = chosen.some(p => !p.model);
    const covering = chosen.filter(p => meshes.has(p.id) && visibleIn(p, new Set()));
    const depth = covering.length ? Math.max(...covering.map(depthOf)) : -1;
    faded.clear();
    for (const [id, mesh] of meshes) {
      const part = parts.get(id)!, on = selected.has(id), isNear = near.has(id);
      mesh.visible = visibleIn(part, near);
      const m = mesh.material;
      let opacity = part.opacity ?? 1, tint: string = part.color, emissive = '#000000', glow = 0;
      if (on) {tint = EAR_SELECT.fill; emissive = EAR_SELECT.fill; glow = .3; opacity = Math.max(opacity, .9);}
      else if (isNear) {tint = EAR_NEAR; emissive = EAR_NEAR; glow = .35; opacity = Math.max(opacity, .9);}
      else if (cardOnly && !state.isolate) {opacity = FADE_OPACITY; faded.add(id);}
      else if (!on && depth >= 0 && depthOf(part) < depth) {opacity = Math.min(opacity, COVER_OPACITY); faded.add(id);}
      m.color.set(tint); m.emissive.set(emissive); m.emissiveIntensity = glow;
      m.transparent = opacity < 1; m.opacity = opacity; m.depthWrite = !m.transparent || on;
      m.roughness = .55;
      m.polygonOffset = !!part.mark || on; m.polygonOffsetFactor = part.mark ? -4 : -2; m.polygonOffsetUnits = part.mark ? -4 : -2;
      mesh.renderOrder = part.mark ? 3 : opacity < 1 ? 2 : 0;
      caps.get(id)!.set(tint).lerp(new T.Color('#ffffff'), .3);
      const nextPlanes = cutting ? [plane] : []; if ((m.clippingPlanes?.length ?? 0) !== nextPlanes.length) m.needsUpdate = true; m.clippingPlanes = nextPlanes;
    }
    dirty = true;
  };

  const frameModel = (view: EarView, focus?: string[]) => {
    const direction = new T.Vector3(-1, .05, 0);
    if (view === 'medial') direction.set(1, .05, 0);
    if (view === 'front') direction.set(0, .05, 1);
    if (view === 'back') direction.set(0, .05, -1);
    if (view === 'top') direction.set(0, 1, .12);
    if (view === 'bottom') direction.set(0, -1, .12);
    if (view === 'fit') direction.copy(camera.position).sub(controls.target).normalize();
    direction.normalize();
    const area = new T.Box3(), framed = focus?.length ? focus : state?.isolate?.length ? state.isolate : [];
    for (const id of framed) {const mesh = meshes.get(id); if (mesh) area.union(mesh.geometry.boundingBox!);}
    if (area.isEmpty()) area.copy(frameBox);
    const centre = area.getCenter(new T.Vector3()), target = new T.Box3(area.min.clone().addScalar(-.004), area.max.clone().addScalar(.004));
    controls.target.copy(centre);
    camera.position.copy(centre).addScaledVector(direction, framingDistance(target, direction, camera.fov, camera.aspect, .88, .88, .01));
    controls.update(); dirty = true;
  };

  const abort = new AbortController(), base = import.meta.env.BASE_URL;
  void (async () => {
    try {
      const response = await fetch(`${base}models/ear/ear-atlas.json`, {signal: abort.signal});
      if (!response.ok) throw new Error('index');
      const atlas = await response.json() as Atlas;
      callbacks.progress(15);
      const buffer = await fetchModelBuffer(`${base}${atlas.gzip}`, atlas.bytes, true, abort.signal);
      if (disposed) return;
      for (const a of atlas.parts) {
        const part = EAR_BY_ID.get(a.id);
        if (!part) continue;
        const geometry = new T.BufferGeometry();
        geometry.setAttribute('position', new T.BufferAttribute(new Float32Array(buffer, a.positions, a.vertexCount * 3), 3));
        geometry.setAttribute('normal', new T.BufferAttribute(new Int16Array(buffer, a.normals, a.vertexCount * 3), 3, true));
        geometry.setIndex(new T.BufferAttribute(new Uint32Array(buffer, a.indices, a.indexCount), 1));
        geometry.computeBoundingBox(); geometry.computeBoundingSphere();
        const cap = new T.Color(part.color);
        const material = capped(new T.MeshStandardMaterial({color: part.color, roughness: .55, metalness: 0, side: T.DoubleSide}), cap);
        const mesh = new T.Mesh(geometry, material);
        mesh.userData.partId = part.id;
        parts.set(part.id, part); meshes.set(part.id, mesh); caps.set(part.id, cap); scene.add(mesh);
        core.union(geometry.boundingBox!);
        // the pharyngotympanic tube runs far forward: the default framing leaves its far end out of the picture
        if (part.id !== 'pharyngotympanic-tube') frameBox.union(geometry.boundingBox!);
      }
      const stapes = meshes.get('stapes')?.geometry.boundingBox?.getCenter(new T.Vector3()) ?? core.getCenter(new T.Vector3());
      const at = (axis: 0 | 1 | 2) => Math.min(.95, Math.max(.05, (stapes.getComponent(axis) - core.min.getComponent(axis)) / Math.max(1e-6, core.max.getComponent(axis) - core.min.getComponent(axis))));
      callbacks.progress(100);
      loaded = true; frameModel('lateral'); apply();
      callbacks.ready({ids: [...meshes.keys()], sectionOffsets: {sagittal: at(0), coronal: at(2), horizontal: at(1)}});
    } catch (e) {
      if (!disposed && !(e instanceof DOMException && e.name === 'AbortError')) callbacks.error('耳部模型未能載入，請重新載入。');
    }
  })();

  const update = (next: EarViewState) => {
    state = next;
    if (command !== next.command.id) {command = next.command.id; if (loaded) frameModel(next.command.view, next.command.focus);}
    if (loaded) apply();
  };

  const pickAt = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    camera.updateMatrixWorld(); scene.updateMatrixWorld(true);
    raycaster.setFromCamera(new T.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, 1 - ((clientY - rect.top) / rect.height) * 2), camera);
    const visible = [...meshes.values()].filter(m => m.visible);
    const hits = raycaster.intersectObjects(visible, false).filter(h => keeps(h.point));
    // faded structures are picked only when nothing else is under the pointer; a window patch wins over the bone it lies on
    const solid = hits.filter(h => !faded.has(h.object.userData.partId as string)), pool = solid.length ? solid : hits;
    if (!pool.length) return null;
    const first = pool[0], mark = pool.find(h => parts.get(h.object.userData.partId as string)?.mark && h.distance - first.distance < 2e-4);
    return ((mark ?? first).object.userData.partId as string) ?? null;
  };
  const down = (e: PointerEvent) => {if (e.button === 0) tap.down(e.pointerId, e.clientX, e.clientY, e.pointerType === 'touch' ? 10 : 5);};
  const move = (e: PointerEvent) => tap.move(e.pointerId, e.clientX, e.clientY);
  const up = (e: PointerEvent) => {if (tap.up(e.pointerId, e.clientX, e.clientY)) callbacks.pick(pickAt(e.clientX, e.clientY));};
  const cancel = (e: PointerEvent) => tap.cancel(e.pointerId);
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', cancel);
  const lost = (e: Event) => {e.preventDefault(); callbacks.error('3D 顯示已中斷，請重新載入頁面。');};
  canvas.addEventListener('webglcontextlost', lost);
  controls.addEventListener('change', () => {dirty = true;});
  let userMoved = false; controls.addEventListener('start', () => {userMoved = true;});
  const resize = () => {
    const rect = host.getBoundingClientRect();
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
    camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height); camera.updateProjectionMatrix();
    // a resize keeps the view the user set; only an untouched view is framed again
    if (loaded && !userMoved) frameModel('fit'); dirty = true;
  };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const render = () => {if (disposed) return; frame = requestAnimationFrame(render); controls.update(); if (dirty) {renderer.render(scene, camera); dirty = false;}};
  render();
  return {
    update,
    /** Screenshots and tests: the canvas as it is drawn now. */
    get canvas() {return canvas;},
    /** Tests: the screen position of a structure (centre of its box) as a fraction of the canvas, or null while it is not drawn. */
    screenOf(id: string) {
      const mesh = meshes.get(id); if (!mesh?.visible) return null;
      const p = mesh.geometry.boundingBox!.getCenter(new T.Vector3()).project(camera);
      return {x: (p.x + 1) / 2, y: (1 - p.y) / 2};
    },
    dispose() {
      disposed = true; abort.abort(); cancelAnimationFrame(frame); observer.disconnect(); controls.dispose();
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', cancel); canvas.removeEventListener('webglcontextlost', lost);
      for (const mesh of meshes.values()) {mesh.geometry.dispose(); mesh.material.dispose();}
      renderer.dispose(); canvas.remove();
    },
  };
}
