import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {fetchModelBuffer, loadMissingChunks} from '../model-download';
import {PointerTap} from '../pointer-tap';
import {framingDistance} from '../camera-framing';
import {CHAMBERS} from './heart-chambers';
import {SECTION_AXES, type HeartCatalogue, type HeartView, type HeartViewState} from './heart-types';

interface Callbacks {
  progress: (loaded: number, total: number) => void;
  ready: () => void;
  error: (message: string) => void;
  pick: (id: string | null) => void;
  hover: (id: string | null) => void;
}
/** Selection colours shared with the atlas: deep green, outlined; hover is a lighter mint of the same hue. */
export const HEART_SELECT = {fill: '#5DB89A', edge: '#3E8E74', hover: '#A7DCCB'};
const GROUP_COLOR: Record<string, string> = {
  chambers: '#d98a85', papillary: '#c97a5a', valves: '#f0dfa3', coronary: '#b0313f', veins: '#4f86bf', vessels: '#c9a8a0',
};
const COLOR_BY_PART = (id: string, group: string, system: string, name: string) => {
  if (group === 'chambers') return /atrium/i.test(name) ? '#86a8dc' : '#dc8f8a';
  if (group === 'vessels') return system === 'venous' ? '#86a8dc' : /pulmonary/i.test(name) ? '#a9b8e0' : '#d3817c';
  void id;
  return GROUP_COLOR[group] ?? '#cfae9a';
};

const chamberOf = (id: string) => CHAMBERS.find(c => c.id === id);

/** Isolated, static viewer for the heart detail model: sections, per-group visibility, hover and selection. It never touches the atlas scene. */
export function createHeartViewer(host: HTMLDivElement, catalogue: HeartCatalogue, callbacks: Callbacks) {
  const controller = new AbortController(), tap = new PointerTap();
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(32, 1, .002, 20);
  const renderer = new T.WebGLRenderer({antialias: true, alpha: false, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor('#cbd2d6');
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.localClippingEnabled = true;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-label', '3D 心臟詳細模型。拖曳旋轉，滾輪或雙指縮放，點選構造查看名稱與說明。');
  canvas.setAttribute('role', 'group');
  canvas.style.touchAction = 'none';
  host.appendChild(canvas);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = .15; controls.minDistance = .03; controls.maxDistance = 2; controls.enablePan = true;
  scene.add(new T.HemisphereLight('#ffffff', '#7b8e9c', 2.2));
  const key = new T.DirectionalLight('#fff6e6', 2.6); key.position.set(-1.5, 3, 4); scene.add(key);
  const fill = new T.DirectionalLight('#a8c8e3', 1.4); fill.position.set(3, 1, -3); scene.add(fill);

  const plane = new T.Plane(new T.Vector3(0, 0, 1), 0);
  const parts = new Map(catalogue.parts.map(p => [p.id, p]));
  const meshes = new Map<string, T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>>();
  const shells = new Map<string, T.Mesh>();
  const box = new T.Box3();
  for (const p of catalogue.parts) box.union(new T.Box3(new T.Vector3().fromArray(p.bounds[0]), new T.Vector3().fromArray(p.bounds[1])));
  const centre = box.getCenter(new T.Vector3()), size = box.getSize(new T.Vector3());
  // The heart proper (chambers and valves) sets the framing and the section range, not the long vessel stumps.
  const core = new T.Box3();
  for (const p of catalogue.parts) if (p.group === 'chambers') core.union(new T.Box3(new T.Vector3().fromArray(p.bounds[0]), new T.Vector3().fromArray(p.bounds[1])));
  const coreCentre = core.getCenter(new T.Vector3());

  const raycaster = new T.Raycaster();
  let state: HeartViewState | undefined, disposed = false, dirty = true, frame = 0, command = -1, hoverId: string | null = null, loadedAll = false, lastHoverAt = 0;

  const clipping = () => {
    const s = state?.section;
    if (!s || s.axis === 'none') return [] as T.Plane[];
    const axis = SECTION_AXES[s.axis].index, lo = core.min.getComponent(axis), hi = core.max.getComponent(axis), at = lo + (hi - lo) * s.offset;
    const normal = new T.Vector3(); normal.setComponent(axis, s.flip ? -1 : 1);
    plane.set(normal, -normal.dot(new T.Vector3().setComponent(axis, at)));
    return [plane];
  };
  const keeps = (point: T.Vector3) => {const planes = clipping(); return !planes.length || planes[0].distanceToPoint(point) >= 0;};

  const apply = () => {
    if (!state) return;
    const hidden = new Set(state.hiddenGroups), planes = clipping(), lit = new Set(state.highlight), open = state.openChamber ? chamberOf(state.openChamber) : undefined;
    const insideNames = new Set(open?.inside ?? []), wallName = open?.wall;
    for (const [id, mesh] of meshes) {
      const part = parts.get(id)!, selected = id === state.selectedId || lit.has(id), hovered = id === hoverId && !selected;
      mesh.visible = !hidden.has(part.group) || insideNames.has(part.name);
      const m = mesh.material;
      m.color.set(selected ? HEART_SELECT.fill : hovered ? HEART_SELECT.hover : COLOR_BY_PART(id, part.group, part.system, part.name));
      m.emissive.set(selected ? HEART_SELECT.fill : '#000000'); m.emissiveIntensity = selected ? .1 : 0;
      const wall = part.name === wallName, ghost = (state.ghostChambers && part.group === 'chambers' && !selected) || wall;
      m.opacity = wall ? .12 : ghost ? .3 : selected ? .85 : 1; m.transparent = ghost || selected; m.depthWrite = !ghost && !selected;
      // Selected piece is drawn whole over the pieces it overlaps (polygonOffset), like the main atlas.
      m.polygonOffset = selected; m.polygonOffsetFactor = -4; m.polygonOffsetUnits = -4;
      m.clippingPlanes = planes; m.needsUpdate = true;
      mesh.renderOrder = ghost ? 2 : selected ? 3 : 1;
      const shell = shells.get(id);
      if (selected) {
        let s2 = shell;
        if (!s2) {
          const material = new T.MeshBasicMaterial({color: HEART_SELECT.edge, side: T.BackSide, depthWrite: false});
          material.onBeforeCompile = shader => {shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * 0.0003;');};
          s2 = new T.Mesh(mesh.geometry, material); s2.renderOrder = 0; mesh.add(s2); shells.set(id, s2);
        }
        (s2.material as T.MeshBasicMaterial).clippingPlanes = planes; s2.visible = mesh.visible;
      } else if (shell) shell.visible = false;
    }
    dirty = true;
  };

  let lastFocus: string | undefined;
  const frameModel = (view: HeartView, look?: [number, number, number], focusName?: string) => {
    if (view !== 'fit') lastFocus = focusName;
    const focus = view === 'fit' ? lastFocus : focusName;
    const direction = new T.Vector3(0, .05, 1);
    if (view === 'back') direction.set(0, .05, -1);
    if (view === 'left') direction.set(1, .05, 0);
    if (view === 'right') direction.set(-1, .05, 0);
    if (view === 'top') direction.set(0, 1, .12);
    if (view === 'fit') direction.copy(camera.position).sub(controls.target).normalize();
    if (look) direction.set(...look);
    if (direction.lengthSq() < .5) direction.set(0, .05, 1);
    direction.normalize();
    const focusPart = focus ? [...parts.values()].find(p => p.name === focus) : undefined;
    const area = focusPart ? new T.Box3(new T.Vector3().fromArray(focusPart.bounds[0]), new T.Vector3().fromArray(focusPart.bounds[1])) : core;
    const areaCentre = area.getCenter(new T.Vector3());
    const target = new T.Box3(area.min.clone().addScalar(-.012), area.max.clone().addScalar(.012));
    controls.target.copy(areaCentre);
    camera.position.copy(areaCentre).addScaledVector(direction, framingDistance(target, direction, camera.fov, camera.aspect, .9, .9));
    controls.update(); dirty = true;
  };

  const loadPackage = async (index: number) => {
    const chunk = catalogue.chunks[index];
    const url = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '');
    let buffer: ArrayBuffer;
    if (typeof DecompressionStream === 'undefined') buffer = await fetchModelBuffer(url(chunk.url), chunk.bytes, false, controller.signal);
    else {
      try {buffer = await fetchModelBuffer(url(chunk.gzip), chunk.bytes, true, controller.signal);}
      catch (error) {if (controller.signal.aborted) throw error; buffer = await fetchModelBuffer(url(chunk.url), chunk.bytes, false, controller.signal);}
    }
    if (disposed) return;
    for (const p of catalogue.parts.filter(part => part.chunk === index)) {
      const geometry = new T.BufferGeometry();
      geometry.setAttribute('position', new T.BufferAttribute(new Float32Array(buffer, p.positions, p.vertexCount * 3), 3));
      geometry.setAttribute('normal', new T.BufferAttribute(new Int16Array(buffer, p.normals, p.vertexCount * 3), 3, true));
      geometry.setIndex(new T.BufferAttribute(new Uint32Array(buffer, p.indices, p.indexCount), 1));
      geometry.computeBoundingBox(); geometry.computeBoundingSphere();
      const material = new T.MeshStandardMaterial({color: COLOR_BY_PART(p.id, p.group, p.system, p.name), roughness: .6, metalness: 0, side: T.DoubleSide});
      const mesh = new T.Mesh(geometry, material);
      mesh.name = p.id; mesh.userData.partId = p.id; meshes.set(p.id, mesh); scene.add(mesh);
    }
    apply();
  };
  void (async () => {
    callbacks.progress(0, catalogue.chunks.length);
    const failed = await loadMissingChunks(catalogue.chunks.map((_, i) => i), async i => {await loadPackage(i); if (!disposed) callbacks.progress(meshes.size ? catalogue.chunks.filter((_, k) => catalogue.parts.filter(p => p.chunk === k).every(p => meshes.has(p.id))).length : 0, catalogue.chunks.length);}, controller.signal, () => {}, 2);
    if (disposed) return;
    if (failed.length) {callbacks.error('部分心臟模型未能載入，請重新載入。'); return;}
    loadedAll = true; frameModel('front'); apply(); callbacks.ready();
  })();

  const update = (next: HeartViewState) => {
    state = next;
    if (command !== next.command.id) {command = next.command.id; if (loadedAll || command >= 0) frameModel(next.command.view, next.command.look, next.command.focus);}
    apply();
  };

  const pickAt = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    camera.updateMatrixWorld(); scene.updateMatrixWorld(true);
    raycaster.setFromCamera(new T.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, 1 - ((clientY - rect.top) / rect.height) * 2), camera);
    const wallName = state?.openChamber ? chamberOf(state.openChamber)?.wall : undefined;
    const candidates = [...meshes.values()].filter(m => m.visible && parts.get(m.userData.partId)?.name !== wallName && !(state?.ghostChambers && parts.get(m.userData.partId)?.group === 'chambers' && m.userData.partId !== state.selectedId));
    for (const hit of raycaster.intersectObjects(candidates, false)) if (keeps(hit.point)) return hit.object.userData.partId as string;
    // Ghosted chambers are still selectable when nothing else is hit.
    for (const hit of raycaster.intersectObjects([...meshes.values()].filter(m => m.visible), false)) if (keeps(hit.point)) return hit.object.userData.partId as string;
    return null;
  };
  const down = (e: PointerEvent) => {if (e.button === 0) tap.down(e.pointerId, e.clientX, e.clientY, e.pointerType === 'touch' ? 10 : 5);};
  const move = (e: PointerEvent) => {
    tap.move(e.pointerId, e.clientX, e.clientY);
    if (e.buttons || e.pointerType === 'touch') return;
    const now = performance.now(); if (now - lastHoverAt < 50) return; lastHoverAt = now;
    const id = pickAt(e.clientX, e.clientY);
    if (id !== hoverId) {hoverId = id; callbacks.hover(id); apply(); canvas.style.cursor = id ? 'pointer' : 'grab';}
  };
  const up = (e: PointerEvent) => {if (tap.up(e.pointerId, e.clientX, e.clientY)) callbacks.pick(pickAt(e.clientX, e.clientY));};
  const cancel = (e: PointerEvent) => tap.cancel(e.pointerId);
  const leave = () => {if (hoverId) {hoverId = null; callbacks.hover(null); apply();}};
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', cancel); canvas.addEventListener('pointerleave', leave);
  const lost = (e: Event) => {e.preventDefault(); callbacks.error('3D 顯示已中斷，請重新載入頁面。');};
  canvas.addEventListener('webglcontextlost', lost);
  controls.addEventListener('change', () => {dirty = true;});
  const resize = () => {
    const rect = host.getBoundingClientRect();
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
    camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height); camera.updateProjectionMatrix();
    frameModel(loadedAll ? 'fit' : 'front'); dirty = true;
  };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const render = () => {if (disposed) return; frame = requestAnimationFrame(render); controls.update(); if (dirty) {renderer.render(scene, camera); dirty = false;}};
  render();
  void centre; void size;
  return {
    update,
    dispose() {
      disposed = true; controller.abort(); cancelAnimationFrame(frame); observer.disconnect(); controls.dispose();
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', cancel); canvas.removeEventListener('pointerleave', leave); canvas.removeEventListener('webglcontextlost', lost);
      for (const mesh of meshes.values()) {mesh.geometry.dispose(); mesh.material.dispose();}
      for (const shell of shells.values()) (shell.material as T.Material).dispose();
      renderer.dispose(); canvas.remove();
    },
  };
}
