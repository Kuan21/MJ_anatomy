import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {fetchModelBuffer, loadMissingChunks} from '../model-download';
import {PointerTap} from '../pointer-tap';
import {framingDistance} from '../camera-framing';
import {CHAMBERS} from './heart-chambers';
import {BLOCKER_OPACITY, isKeptVessel} from './heart-vessels';
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
  chambers: '#d98a85', papillary: '#c97a5a', valves: '#f0dfa3', coronary: '#b0313f', veins: '#4f86bf', vessels: '#c9a8a0', interior: '#c9785f', pericardium: '#d9c9a3',
};
/** schematic surface patches and spaces are drawn as tinted, translucent regions so they read as areas, not as ridges. */
const PATCH_COLOR: Record<string, string> = {
  'Interatrial septum': '#8fb8e6', 'Fossa ovalis': '#f0e3a8', 'Right auricle': '#e8a15a', 'Left auricle': '#e8a15a', 'Interventricular septum': '#86c08a', 'Conus arteriosus': '#b98ad6', 'Aortic vestibule': '#5fb0dc',
  'Transverse pericardial sinus': '#69b96a', 'Oblique pericardial sinus': '#69b96a',
  'Fibrous pericardium': '#d9c9a3', 'Parietal layer of serous pericardium': '#e3d6b4', 'Visceral layer of serous pericardium (epicardium)': '#e8b9ae',
};
const isPatch = (name: string) => name in PATCH_COLOR;
const COLOR_BY_PART = (id: string, group: string, system: string, name: string) => {
  if (PATCH_COLOR[name]) return PATCH_COLOR[name];
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
  // Name labels (valves, leaflets) are plain DOM in the margins of the view, tied to their structure by a thin leader line, so they follow the
  // structure when the heart is turned or zoomed and never sit on top of the model.
  const labelLayer = document.createElement('div');
  labelLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  const leaders = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  leaders.setAttribute('style', 'position:absolute;inset:0;width:100%;height:100%');
  labelLayer.appendChild(leaders); host.appendChild(labelLayer);
  let labelSpecs: {id: string; en: string; zh: string; ids: string[]}[] = [];
  const labelNodes = new Map<string, HTMLDivElement>();
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = .15; controls.minDistance = .03; controls.maxDistance = 2; controls.enablePan = true;
  scene.add(new T.HemisphereLight('#ffffff', '#a9b8c5', 2.6));
  const key = new T.DirectionalLight('#fff6e6', 2.6); key.position.set(-1.5, 3, 4); scene.add(key);
  const fill = new T.DirectionalLight('#a8c8e3', 1.4); fill.position.set(3, 1, -3); scene.add(fill);
  // the back and underside of the heart get their own soft light so they stay readable instead of going black
  const back = new T.DirectionalLight('#f4f1ec', 1.9); back.position.set(-1.5, -1, -4); scene.add(back);
  const under = new T.DirectionalLight('#e4ecf2', 1.1); under.position.set(0, -4, 1); scene.add(under);

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
  let state: HeartViewState | undefined, blockers = new Set<string>(), disposed = false, dirty = true, frame = 0, command = -1, hoverId: string | null = null, loadedAll = false, lastHoverAt = 0;

  const clipping = () => {
    const s = state?.section;
    if (!s || s.axis === 'none') return [] as T.Plane[];
    const axis = SECTION_AXES[s.axis].index, lo = core.min.getComponent(axis), hi = core.max.getComponent(axis), at = lo + (hi - lo) * s.offset;
    const normal = new T.Vector3(); normal.setComponent(axis, s.flip ? -1 : 1);
    plane.set(normal, -normal.dot(new T.Vector3().setComponent(axis, at)));
    return [plane];
  };
  const keeps = (point: T.Vector3) => {const planes = clipping(); return !planes.length || planes[0].distanceToPoint(point) >= 0;};

  /** Kept vessels (great vessels, main coronary vessels) that stand between the camera and the wall of the open chamber: they hide the chamber, so they are drawn at 40 %. */
  const findBlockers = () => {
    const open = state?.openChamber ? chamberOf(state.openChamber) : undefined, next = new Set<string>();
    const wall = open ? catalogue.parts.find(p => p.name === open.wall) : undefined;
    if (open && wall) {
      camera.updateMatrixWorld();
      const wallBox = new T.Box3(new T.Vector3().fromArray(wall.bounds[0]), new T.Vector3().fromArray(wall.bounds[1])), wallCentre = wallBox.getCenter(new T.Vector3());
      const screen = (b: T.Box3) => {
        const r = {x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity};
        for (let i = 0; i < 8; i++) {const v = new T.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).project(camera); r.x0 = Math.min(r.x0, v.x); r.x1 = Math.max(r.x1, v.x); r.y0 = Math.min(r.y0, v.y); r.y1 = Math.max(r.y1, v.y);}
        return r;
      };
      const w = screen(wallBox), toWall = camera.position.distanceTo(wallCentre);
      for (const [id, mesh] of meshes) {
        const part = parts.get(id)!;
        if (!mesh.visible || !isKeptVessel(part.group, part.name)) continue;
        const b = new T.Box3(new T.Vector3().fromArray(part.bounds[0]), new T.Vector3().fromArray(part.bounds[1])), s = screen(b);
        const overlap = s.x0 < w.x1 && s.x1 > w.x0 && s.y0 < w.y1 && s.y1 > w.y0, nearer = camera.position.distanceTo(b.getCenter(new T.Vector3())) < toWall;
        if (overlap && nearer) next.add(id);
      }
    }
    const same = next.size === blockers.size && [...next].every(id => blockers.has(id));
    blockers = next; return !same;
  };

  const apply = () => {
    if (!state) return;
    findBlockers();
    const hidden = new Set(state.hiddenGroups), hiddenParts = new Set(state.hiddenParts), planes = clipping(), lit = new Set(state.highlight), open = state.openChamber ? chamberOf(state.openChamber) : undefined;
    const insideNames = new Set(open?.inside ?? []), wallName = open?.wall;
    for (const [id, mesh] of meshes) {
      const part = parts.get(id)!, selected = id === state.selectedId || lit.has(id), hovered = id === hoverId && !selected;
      mesh.visible = (!hidden.has(part.group) || insideNames.has(part.name)) && !(hiddenParts.has(id) && !selected);
      const m = mesh.material;
      m.color.set(selected ? HEART_SELECT.fill : hovered ? HEART_SELECT.hover : COLOR_BY_PART(id, part.group, part.system, part.name));
      m.emissive.set(selected ? HEART_SELECT.fill : '#000000'); m.emissiveIntensity = selected ? .1 : 0;
      const wall = part.name === wallName, patch = isPatch(part.name) && !selected, blocker = !!open && !selected && blockers.has(id), ghost = (state.ghostChambers && part.group === 'chambers' && !selected) || wall || patch || blocker;
      m.opacity = blocker ? BLOCKER_OPACITY : wall ? .12 : patch ? (part.group === 'pericardium' ? .22 : .6) : ghost ? .3 : selected ? .85 : 1; m.transparent = ghost || selected; m.depthWrite = !ghost && !selected;
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

  const layoutLabels = () => {
    const width = host.clientWidth, height = host.clientHeight;
    const active: {spec: typeof labelSpecs[number]; x: number; y: number; side: 'l' | 'r'}[] = [];
    const centreX = (() => {const v = coreCentre.clone().project(camera); return (v.x * .5 + .5) * width;})();
    const clipped = (p: T.Vector3) => { const planes = clipping(); return planes.length > 0 && planes[0].distanceToPoint(p) < 0; };
    for (const spec of labelSpecs) {
      const box = new T.Box3();
      for (const id of spec.ids) {const mesh = meshes.get(id); if (mesh?.visible) box.union(new T.Box3().setFromObject(mesh));}
      if (box.isEmpty()) continue;
      const c = box.getCenter(new T.Vector3());
      if (clipped(c)) continue;
      const v = c.clone().project(camera);
      if (v.z > 1 || Math.abs(v.x) > 1 || Math.abs(v.y) > 1) continue;
      const x = (v.x * .5 + .5) * width, y = (-v.y * .5 + .5) * height;
      active.push({spec, x, y, side: x < centreX ? 'l' : 'r'});
    }
    const placed = new Map<string, number>();
    for (const side of ['l', 'r'] as const) {
      const column = active.filter(a => a.side === side).sort((a, b) => a.y - b.y);
      let last = -Infinity;
      for (const a of column) {const y = Math.max(a.y, last + 34); placed.set(a.spec.id, y); last = y;}
      const overflow = last - (height - 24);
      if (overflow > 0) for (const a of column) placed.set(a.spec.id, Math.max(14, placed.get(a.spec.id)! - overflow));
    }
    const live = new Set<string>();
    let lines = '';
    for (const a of active) {
      live.add(a.spec.id);
      let node = labelNodes.get(a.spec.id);
      if (!node) {
        node = document.createElement('div');
        node.style.cssText = 'position:absolute;max-width:24%;padding:3px 7px;border-radius:6px;background:#ffffffe6;box-shadow:0 1px 4px #1825361f;font:11.5px/1.25 system-ui,sans-serif;color:#1f2a35;white-space:normal';
        const en = document.createElement('div'); en.textContent = a.spec.en; en.style.fontWeight = '600';
        const zh = document.createElement('div'); zh.textContent = a.spec.zh; zh.style.cssText = 'font-size:10.5px;color:#7b8793';
        node.appendChild(en); node.appendChild(zh); labelLayer.appendChild(node); labelNodes.set(a.spec.id, node);
      }
      const y = placed.get(a.spec.id)!;
      node.style.display = 'block'; node.style.top = `${y - 15}px`;
      if (a.side === 'l') {node.style.left = '10px'; node.style.right = ''; node.style.textAlign = 'left';} else {node.style.right = '10px'; node.style.left = ''; node.style.textAlign = 'right';}
      const edge = a.side === 'l' ? 10 + Math.min(node.offsetWidth, width * .24) : width - 10 - Math.min(node.offsetWidth, width * .24);
      lines += `<line x1="${edge}" y1="${y}" x2="${a.x}" y2="${a.y}" stroke="#5a6b78" stroke-width="1"/><circle cx="${a.x}" cy="${a.y}" r="2.6" fill="#fff" stroke="#3e5463" stroke-width="1.2"/>`;
    }
    for (const [id, node] of labelNodes) if (!live.has(id)) node.style.display = 'none';
    leaders.innerHTML = lines;
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
    // The pericardial shells wrap the whole heart: they are picked only when nothing inside them is hit.
    let shellHit: string | null = null;
    for (const hit of raycaster.intersectObjects(candidates, false)) if (keeps(hit.point)) {
      const id = hit.object.userData.partId as string;
      if (parts.get(id)?.group !== 'pericardium') return id;
      shellHit ??= id;
    }
    if (shellHit) return shellHit;
    // Ghosted chambers are still selectable when nothing else is hit.
    for (const hit of raycaster.intersectObjects([...meshes.values()].filter(m => m.visible), false)) if (keeps(hit.point)) return hit.object.userData.partId as string;
    return null;
  };
  const down = (e: PointerEvent) => {if (e.button === 0) tap.down(e.pointerId, e.clientX, e.clientY, e.pointerType === 'touch' ? 10 : 5);};
  const move = (e: PointerEvent) => tap.move(e.pointerId, e.clientX, e.clientY);
  const up = (e: PointerEvent) => {if (tap.up(e.pointerId, e.clientX, e.clientY)) callbacks.pick(pickAt(e.clientX, e.clientY));};
  const cancel = (e: PointerEvent) => tap.cancel(e.pointerId);
  const leave = () => {};
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', cancel); canvas.addEventListener('pointerleave', leave);
  const lost = (e: Event) => {e.preventDefault(); callbacks.error('3D 顯示已中斷，請重新載入頁面。');};
  canvas.addEventListener('webglcontextlost', lost);
  controls.addEventListener('change', () => {dirty = true; if (state?.openChamber && findBlockers()) apply();});
  const resize = () => {
    const rect = host.getBoundingClientRect();
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
    camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height); camera.updateProjectionMatrix();
    frameModel(loadedAll ? 'fit' : 'front'); dirty = true;
  };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const render = () => {if (disposed) return; frame = requestAnimationFrame(render); controls.update(); if (dirty) {renderer.render(scene, camera); if (labelSpecs.length) layoutLabels(); dirty = false;}};
  render();
  void centre; void size;
  const setLabels = (specs: typeof labelSpecs) => {
    labelSpecs = specs; for (const [id, node] of labelNodes) if (!specs.some(x => x.id === id)) {node.remove(); labelNodes.delete(id);}
    if (!specs.length) leaders.innerHTML = ''; dirty = true;
  };
  return {
    update, setLabels,
    dispose() {
      disposed = true; controller.abort(); cancelAnimationFrame(frame); observer.disconnect(); controls.dispose();
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', cancel); canvas.removeEventListener('pointerleave', leave); canvas.removeEventListener('webglcontextlost', lost);
      for (const mesh of meshes.values()) {mesh.geometry.dispose(); mesh.material.dispose();}
      for (const shell of shells.values()) (shell.material as T.Material).dispose();
      labelLayer.remove(); renderer.dispose(); canvas.remove();
    },
  };
}
