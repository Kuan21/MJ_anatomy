import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {PointerTap} from '../pointer-tap';
import {framingDistance} from '../camera-framing';
import {decodeModelResponse} from '../model-download';
import type {OrganDef, OrganPartDef, OrganView, OrganViewState} from './organ-types';

interface ManifestPart {id: string; vertexCount: number; indexCount: number; bounds: [number[], number[]]; positions: number; normals: number; indices: number; triZone?: number; triLine?: number}
interface Manifest {bytes: number; gzip: string; parts: ManifestPart[]}
interface Callbacks {progress: (percent: number) => void; ready: () => void; error: (message: string) => void; pick: (key: string | null) => void}

export const ORGAN_SELECT = {fill: '#5DB89A', emissive: '#1f6b52'};
/** Thin line of an edge term (greater or lesser curvature, notch, lower border): one light lavender for every organ, whether or not it is selected (user 2026-11-22). */
export const ORGAN_EDGE_LINE = {fill: '#b39ddb', emissive: '#2a2140'};
const CUT_COLOR = '#d9928a';
/** Each cut removes the half that faces the camera that looks into it: sagittal from the body's right, coronal from the front, horizontal from above. */
export const ORGAN_CUT: Record<'sagittal' | 'coronal' | 'horizontal', {flip: boolean; view: OrganView}> = {sagittal: {flip: false, view: 'right'}, coronal: {flip: true, view: 'front'}, horizontal: {flip: true, view: 'top'}};
const AXIS = {sagittal: new T.Vector3(1, 0, 0), coronal: new T.Vector3(0, 0, 1), horizontal: new T.Vector3(0, 1, 0)};

/** Isolated viewer of one organ detail mode (any organ package built by scripts/build-organ-atlas.mjs). It never touches the atlas scene. */
export function createOrganViewer(host: HTMLDivElement, def: OrganDef, callbacks: Callbacks) {
  const tap = new PointerTap(), abort = new AbortController();
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(32, 1, .002, 20);
  const renderer = new T.WebGLRenderer({antialias: true, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor('#cbd2d6'); renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1; renderer.localClippingEnabled = true;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-label', `3D ${def.zh}詳細模型。拖曳旋轉，滾輪或雙指縮放，點選構造查看名稱。`); canvas.setAttribute('role', 'group'); canvas.style.touchAction = 'none';
  host.appendChild(canvas);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = .15; controls.minDistance = .02; controls.maxDistance = 2; controls.enablePan = true;
  scene.add(new T.HemisphereLight('#ffffff', '#7b8e9c', 2.1));
  const key = new T.DirectionalLight('#fff6e6', 2.5); key.position.set(-1.5, 3, 4); scene.add(key);
  const fill = new T.DirectionalLight('#a8c8e3', 1.3); fill.position.set(3, 1, -3); scene.add(fill);
  const raycaster = new T.Raycaster(), plane = new T.Plane(new T.Vector3(1, 0, 0), 0);
  type Item = {def: OrganPartDef; mesh: T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>; cap?: T.Mesh; box: T.Box3; host?: Item; faint?: boolean};
  const items = new Map<string, Item>(), hostLabels = new Map<string, {zone?: Uint8Array; line?: Uint8Array}>(), markFor = new Map<string, string>();
  const core = new T.Box3();
  const groups = new Map(def.groups.map(g => [g.id, g]));
  let state: OrganViewState | undefined, disposed = false, dirty = true, frame = 0, command = -1, loaded = false, userMoved = false;

  const isHidden = (it: Item) => {
    if (!state) return false;
    const d = it.def, g = groups.get(d.group);
    if (g && g.layer >= 0 && g.layer < state.peel) return true;
    return state.hiddenGroups.includes(d.group) || state.hiddenParts.includes(d.key) || (!!it.host && state.hiddenParts.includes(it.host.def.key));
  };
  const apply = () => {
    if (!state) return;
    const sel = new Set(state.selectedIds), iso = state.isolate, ghosts = new Set(state.ghost), glassGroups = def.glassGroups ?? ['wall'];
    const clip = state.section.axis !== 'none';
    if (clip) {
      const axis = state.section.axis as 'sagittal' | 'coronal' | 'horizontal', a = AXIS[axis], lo = core.min.getComponent(a.x ? 0 : a.y ? 1 : 2), hi = core.max.getComponent(a.x ? 0 : a.y ? 1 : 2);
      const at = lo + (hi - lo) * state.section.offset, sign = state.section.flip ? -1 : 1;
      plane.normal.copy(a).multiplyScalar(sign); plane.constant = -sign * at;
    }
    for (const it of items.values()) {
      const d = it.def, ghost = ghosts.has(d.group) && !d.mark, hidden = isHidden(it) && !ghost, selected = sel.has(d.key), glass = state.glass && glassGroups.includes(d.group) && !d.mark;
      let visible = !hidden;
      if (visible && it.def.mark?.channel === 'zone') visible = state.zones || selected;
      // a position term (curvature, notch, surface) is only a name for part of the outline: its thin line is drawn only while it is selected
      if (visible && d.term) visible = selected;
      // isolate: only the chosen structures; a chosen marking keeps its host as a faint shell
      let opacity = d.opacity ?? 1;
      if (ghost) opacity = selected ? .4 : .16; else if (glass) opacity = Math.min(opacity, selected ? .5 : .3);
      it.faint = ghost || glass;
      if (iso?.length && visible) {
        const chosen = iso.includes(d.key), hostOfChosen = iso.some(k => items.get(k)?.host === it);
        if (!chosen) { if (hostOfChosen) opacity = .22; else visible = false; }
      }
      it.mesh.visible = visible;
      const m = it.mesh.material;
      m.clippingPlanes = clip ? [plane] : []; const edge = !!d.term && d.mark?.channel === 'line', look = edge ? ORGAN_EDGE_LINE : selected ? ORGAN_SELECT : null;
      m.color.set(look ? look.fill : d.color); m.emissive.set(look ? look.emissive : '#000000');
      m.opacity = opacity; m.transparent = opacity < 1; m.depthWrite = opacity >= .6;
      if (it.cap) { it.cap.visible = visible && clip && opacity >= 1 && !d.mark; (it.cap.material as T.MeshStandardMaterial).clippingPlanes = clip ? [plane] : []; }
    }
    dirty = true;
  };

  const frameModel = (view: OrganView, focus?: string[]) => {
    const dir = new T.Vector3(0, .05, 1);
    if (view === 'back') dir.set(0, .05, -1); if (view === 'left') dir.set(1, .05, 0); if (view === 'right') dir.set(-1, .05, 0);
    if (view === 'top') dir.set(0, 1, .12); if (view === 'bottom') dir.set(0, -1, .12);
    if (view === 'fit') dir.copy(camera.position).sub(controls.target).normalize();
    dir.normalize();
    const area = new T.Box3(), framed = focus?.length ? focus : state?.isolate?.length ? state.isolate : [];
    for (const k of framed) { const it = items.get(k); if (it) area.union(it.box); }
    if (area.isEmpty()) area.copy(core);
    const centre = area.getCenter(new T.Vector3()), target = new T.Box3(area.min.clone().addScalar(-.004), area.max.clone().addScalar(.004));
    controls.target.copy(centre);
    camera.position.copy(centre).addScaledVector(dir, framingDistance(target, dir, camera.fov, camera.aspect, .86, .86));
    controls.update(); dirty = true;
  };

  (async () => {
    try {
      const base = import.meta.env.BASE_URL, manifest = await (await fetch(base + def.manifest, {signal: abort.signal})).json() as Manifest;
      callbacks.progress(5);
      const bin = await decodeModelResponse(await fetch(base + manifest.gzip, {signal: abort.signal}), manifest.bytes, true, () => callbacks.progress(40));
      if (disposed) return;
      const byId = new Map(manifest.parts.map(p => [p.id, p]));
      const geoms = new Map<string, T.BufferGeometry>();
      for (const p of manifest.parts) {
        const g = new T.BufferGeometry();
        g.setAttribute('position', new T.BufferAttribute(new Float32Array(bin, p.positions, p.vertexCount * 3), 3));
        g.setAttribute('normal', new T.BufferAttribute(new Int16Array(bin, p.normals, p.vertexCount * 3), 3, true));
        g.setIndex(new T.BufferAttribute(new Uint32Array(bin, p.indices, p.indexCount), 1));
        g.computeBoundingBox(); geoms.set(p.id, g);
        if (p.triZone !== undefined || p.triLine !== undefined) hostLabels.set(p.id, {zone: p.triZone !== undefined ? new Uint8Array(bin, p.triZone, p.indexCount / 3) : undefined, line: p.triLine !== undefined ? new Uint8Array(bin, p.triLine, p.indexCount / 3) : undefined});
      }
      // a position term is drawn over the other markings of the same triangles (a surface of the liver over its lobes)
      const makeMat = (d: OrganPartDef) => new T.MeshStandardMaterial({color: d.color, roughness: .55, metalness: 0, side: T.DoubleSide, polygonOffset: !!d.mark, polygonOffsetFactor: d.mark ? (d.term ? -4 : -2) : 0, polygonOffsetUnits: d.mark ? (d.term ? -4 : -2) : 0});
      for (const d of def.parts) {
        if (d.cardOnly) continue;
        if (d.mark) continue;
        const g = geoms.get(d.key); if (!g || !byId.has(d.key)) throw new Error(`organ package lacks ${d.key}`);
        const mesh = new T.Mesh(g, makeMat(d)); mesh.userData.key = d.key; scene.add(mesh);
        const cap = new T.Mesh(g, new T.MeshStandardMaterial({color: CUT_COLOR, roughness: .8, side: T.BackSide})); cap.visible = false; scene.add(cap);
        items.set(d.key, {def: d, mesh, cap, box: g.boundingBox!.clone()});
        if (def.coreGroups.includes(d.group)) core.union(g.boundingBox!);
      }
      for (const d of def.parts) {
        if (!d.mark) continue;
        const host = items.get(d.mark.host); if (!host) throw new Error(`mark host ${d.mark.host} missing`);
        const lab = hostLabels.get(d.mark.host)?.[d.mark.channel]; if (!lab) throw new Error(`no ${d.mark.channel} labels on ${d.mark.host}`);
        const src = host.mesh.geometry.getIndex()!.array as Uint32Array, idx: number[] = [], box = new T.Box3(), pos = host.mesh.geometry.getAttribute('position');
        for (let t = 0; t < lab.length; t++) if (d.mark.values.includes(lab[t])) for (let k = 0; k < 3; k++) { const v = src[t * 3 + k]; idx.push(v); box.expandByPoint(new T.Vector3().fromBufferAttribute(pos, v)); }
        if (!idx.length) throw new Error(`mark ${d.key} has no triangles`);
        const g = new T.BufferGeometry(); g.setAttribute('position', pos); g.setAttribute('normal', host.mesh.geometry.getAttribute('normal')); g.setIndex(idx);
        const mesh = new T.Mesh(g, makeMat(d)); mesh.userData.key = d.key; mesh.renderOrder = 1; scene.add(mesh);
        items.set(d.key, {def: d, mesh, box, host});
        // a click on the surface picks the part (a lobe), not a position term that shares its triangles
        for (const v of d.mark.values) { const k = `${d.mark.host}|${d.mark.channel}|${v}`; if (!d.term || !markFor.has(k)) markFor.set(k, d.key); }
      }
      if (core.isEmpty()) for (const it of items.values()) core.union(it.box);
      loaded = true; frameModel('front'); apply(); callbacks.ready();
    } catch (e) { if (!disposed) callbacks.error(`${def.zh}模型未能載入，請重新載入。`); }
  })();

  const update = (next: OrganViewState) => {
    state = next;
    if (command !== next.command.id) { command = next.command.id; if (loaded) frameModel(next.command.view, next.command.focus); }
    if (loaded) apply();
  };

  const pickAt = (clientX: number, clientY: number): string | null => {
    const rect = canvas.getBoundingClientRect();
    camera.updateMatrixWorld(); scene.updateMatrixWorld(true);
    raycaster.setFromCamera(new T.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, 1 - ((clientY - rect.top) / rect.height) * 2), camera);
    const clip = state?.section.axis !== 'none';
    const targets = [...items.values()].filter(it => it.mesh.visible && !it.host).map(it => it.mesh);
    // a cut hides the half that is clipped: ignore hits on it
    // a see-through shell (glass wall or faint context) never blocks what lies behind it: the first solid structure on the ray wins, and the shell is chosen only when nothing solid is there
    const hits = raycaster.intersectObjects(targets, false).filter(h => !clip || plane.distanceToPoint(h.point) >= 0);
    const hit = hits.find(h => !items.get(h.object.userData.key as string)?.faint) ?? hits.find(h => !(state?.ghost ?? []).includes(items.get(h.object.userData.key as string)?.def.group ?? ''));
    if (!hit) return null;
    const hostKey = hit.object.userData.key as string, lab = hostLabels.get(hostKey);
    if (lab && hit.faceIndex != null) {
      const visibleKey = (channel: 'zone' | 'line', v: number) => { const k = markFor.get(`${hostKey}|${channel}|${v}`); return k && items.get(k)?.mesh.visible ? k : null; };
      const l = lab.line?.[hit.faceIndex] ?? 0, z = lab.zone?.[hit.faceIndex] ?? 0;
      const byLine = l ? visibleKey('line', l) : null; if (byLine) return byLine;
      // zones are clickable even while their colours are off, unless the zone marking itself is peeled or hidden
      const zoneKey = z ? markFor.get(`${hostKey}|zone|${z}`) : null;
      if (zoneKey && state && !isHidden(items.get(zoneKey)!)) return zoneKey;
    }
    return hostKey;
  };
  const down = (e: PointerEvent) => { if (e.button === 0) tap.down(e.pointerId, e.clientX, e.clientY, e.pointerType === 'touch' ? 10 : 5); };
  const move = (e: PointerEvent) => tap.move(e.pointerId, e.clientX, e.clientY);
  const up = (e: PointerEvent) => { if (tap.up(e.pointerId, e.clientX, e.clientY)) callbacks.pick(pickAt(e.clientX, e.clientY)); };
  const cancel = (e: PointerEvent) => tap.cancel(e.pointerId);
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', cancel);
  const lost = (e: Event) => { e.preventDefault(); callbacks.error('3D 顯示已中斷，請重新載入頁面。'); };
  canvas.addEventListener('webglcontextlost', lost);
  controls.addEventListener('change', () => { dirty = true; }); controls.addEventListener('start', () => { userMoved = true; });
  const resize = () => {
    const rect = host.getBoundingClientRect();
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height)); camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height); camera.updateProjectionMatrix();
    if (loaded && !userMoved) frameModel('fit'); dirty = true;
  };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const render = () => { if (disposed) return; frame = requestAnimationFrame(render); controls.update(); if (dirty) { renderer.render(scene, camera); dirty = false; } };
  render();
  return {
    update, get canvas() { return canvas; },
    dispose() {
      disposed = true; abort.abort(); cancelAnimationFrame(frame); observer.disconnect(); controls.dispose();
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', cancel); canvas.removeEventListener('webglcontextlost', lost);
      const geometries = new Set<T.BufferGeometry>();
      for (const it of items.values()) { geometries.add(it.mesh.geometry); it.mesh.material.dispose(); (it.cap?.material as T.Material | undefined)?.dispose(); }
      for (const g of geometries) g.dispose();
      renderer.dispose(); canvas.remove();
    },
  };
}
