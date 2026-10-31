import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {fetchModelBuffer, loadMissingChunks} from '../model-download';
import {PointerTap} from '../pointer-tap';
import {framingDistance} from '../camera-framing';
import {CHAMBERS} from './heart-chambers';
import {BLOCKER_OPACITY, isKeptVessel, isTrunkPart, trunkTriangles} from './heart-vessels';
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
  'Interatrial septum': '#8fb8e6', 'Fossa ovalis': '#f0e3a8', 'Interventricular septum': '#86c08a', 'Conus arteriosus': '#b98ad6', 'Aortic vestibule': '#5fb0dc',
  'Transverse pericardial sinus': '#69b96a', 'Oblique pericardial sinus': '#69b96a',
  'Fibrous pericardium': '#d9c9a3', 'Parietal layer of serous pericardium': '#e3d6b4', 'Visceral layer of serous pericardium (epicardium)': '#e8b9ae',
};
const isPatch = (name: string) => name in PATCH_COLOR;
/** The auricles are drawn lighter than the atria they belong to, so atrium and auricle read as two bodies. */
const AURICLE_COLOR: Record<string, string> = {'Right auricle': '#c4d6f1', 'Left auricle': '#c4d6f1'};
const COLOR_BY_PART = (id: string, group: string, system: string, name: string) => {
  if (AURICLE_COLOR[name]) return AURICLE_COLOR[name];
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
  for (const p of catalogue.parts) if (p.group === 'chambers' && /^(Right|Left) (atrium|ventricle)$/.test(p.name)) core.union(new T.Box3(new T.Vector3().fromArray(p.bounds[0]), new T.Vector3().fromArray(p.bounds[1])));
  const coreCentre = core.getCenter(new T.Vector3());

  const raycaster = new T.Raycaster();
  let state: HeartViewState | undefined, blockers = new Set<string>(), disposed = false, dirty = true, frame = 0, command = -1, hoverId: string | null = null, loadedAll = false, lastHoverAt = 0;
  /** Parts that stand between the camera and the selected structure (drawn see-through, see refreshSelBlockers), the focus last turned to, and the running camera turn. */
  let selBlockers = new Set<string>(), focusKey = '', blockTimer = 0;
  let tween: {t0: number; fromPos: T.Vector3; fromTarget: T.Vector3; toPos: T.Vector3; toTarget: T.Vector3} | null = null;
  /** Cuts open only the wall of the open chamber that faces the camera: the half-space on the camera side of the chamber centre is removed from that wall. */
  const cutPlane = new T.Plane(new T.Vector3(0, 0, -1), 0);
  const headlight = new T.DirectionalLight('#fff3df', 0); scene.add(headlight, headlight.target);
  /** Parts cut by the plane: the wall (and auricle) of the open chamber, and its schematic wall structures (ridges, septal patches) unless one of them is selected. */
  const cutApplies = (id: string) => {
    const open = state?.openChamber ? chamberOf(state.openChamber) : undefined, part = parts.get(id);
    if (!open || !part) return false;
    if (part.name === open.wall || part.name === open.auricle) return true;
    return part.group === 'interior' && open.inside.includes(part.name) && !selectedIds().has(id);
  };
  const updateCut = () => {
    const open = state?.openChamber ? chamberOf(state.openChamber) : undefined, wall = open ? catalogue.parts.find(p => p.name === open.wall) : undefined;
    headlight.intensity = open ? 2.4 : 0;
    if (!wall) return;
    // The plane sits `cutDepth` (default 50 %) of the chamber's depth (along the line of sight) behind its nearest surface: it removes the wall that faces the camera, not half of the chamber.
    const mesh = meshes.get(wall.id); if (!mesh) return;
    const c = new T.Box3(new T.Vector3().fromArray(wall.bounds[0]), new T.Vector3().fromArray(wall.bounds[1])).getCenter(new T.Vector3());
    const toCamera = camera.position.clone().sub(c).normalize(), position = mesh.geometry.getAttribute('position');
    let near = -Infinity, far = Infinity;
    for (let i = 0; i < position.count; i++) {const d = position.getX(i) * toCamera.x + position.getY(i) * toCamera.y + position.getZ(i) * toCamera.z; if (d > near) near = d; if (d < far) far = d;}
    cutPlane.set(toCamera.clone().negate(), near - (open?.cutDepth ?? .5) * (near - far));
  };

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
        if (!mesh.visible || !isKeptVessel(part.group, part.name) || open.openings?.includes(part.name)) continue;
        const b = new T.Box3(new T.Vector3().fromArray(part.bounds[0]), new T.Vector3().fromArray(part.bounds[1])), s = screen(b);
        const overlap = s.x0 < w.x1 && s.x1 > w.x0 && s.y0 < w.y1 && s.y1 > w.y0, nearer = camera.position.distanceTo(b.getCenter(new T.Vector3())) < toWall;
        if (overlap && nearer) next.add(id);
      }
    }
    const same = next.size === blockers.size && [...next].every(id => blockers.has(id));
    blockers = next; return !same;
  };

  /** The structures drawn as selected: the picked one plus the pieces of a list entry. */
  const selectedIds = () => new Set([...(state?.highlight ?? []), ...(state?.selectedId ? [state.selectedId] : [])]);
  /** Hidden-part outline: the selected surface where something nearer covers it is drawn as a dashed contour (depth test inverted, screen-space dashes) with a faint tint. */
  const dashedMaterial = () => new T.ShaderMaterial({
    clipping: true, transparent: true, depthWrite: false, depthFunc: T.GreaterDepth, side: T.FrontSide,
    vertexShader: `#include <clipping_planes_pars_vertex>
varying vec3 vN; varying vec3 vV;
void main(){ vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mvPosition.xyz; gl_Position = projectionMatrix * mvPosition; gl_Position.z -= 0.0004 * gl_Position.w;
#include <clipping_planes_vertex>
}`,
    fragmentShader: `#include <clipping_planes_pars_fragment>
varying vec3 vN; varying vec3 vV;
void main(){
#include <clipping_planes_fragment>
float rim = abs(dot(normalize(vN), normalize(vV)));
float dash = step(mod(gl_FragCoord.x + gl_FragCoord.y, 14.0), 8.0);
float edge = (1.0 - smoothstep(0.30, 0.46, rim)) * dash;
gl_FragColor = vec4(mix(vec3(0.30, 0.78, 0.62), vec3(0.03, 0.36, 0.27), edge), max(0.16, edge * 0.9));
}`,
  });
  const outlineOf = (id: string, mesh: T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>) => {
    let o = shells.get(id) as T.Group | undefined;
    if (o) return o;
    o = new T.Group();
    const grow = (material: T.Material, amount: number) => {material.onBeforeCompile = shader => {shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\ntransformed += normalize(normal) * ${amount.toFixed(4)};`);};};
    // Thin outline: a deep-mint hull 0.4 mm wide and a soft mint halo 1.2 mm wide. Both are plain alpha blends (an additive halo turned white on the pale epicardium) and sit behind the surfaces (positive polygon offset), so where the hull meets a neighbouring surface it never shows jagged light fragments.
    const edge = new T.MeshBasicMaterial({color: HEART_SELECT.edge, side: T.BackSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1}); grow(edge, 0.0004);
    const glow = new T.MeshBasicMaterial({color: HEART_SELECT.fill, side: T.BackSide, transparent: true, opacity: .32, depthWrite: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1}); grow(glow, 0.0012);
    const edgeMesh = new T.Mesh(mesh.geometry, edge), glowMesh = new T.Mesh(mesh.geometry, glow), hidden = new T.Mesh(mesh.geometry, dashedMaterial());
    edgeMesh.renderOrder = 1; glowMesh.renderOrder = 4; hidden.renderOrder = 5;
    o.add(edgeMesh, glowMesh, hidden); mesh.add(o); shells.set(id, o as unknown as T.Mesh);
    return o;
  };
  /** Depth-only copy of a see-through blocker: it hides the selected surface behind it (so the dashed outline takes over there) without being drawn itself. */
  const depthPrepass = (mesh: T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>) => {
    let pre = mesh.userData.pre as T.Mesh | undefined;
    if (!pre) {pre = new T.Mesh(mesh.geometry, new T.MeshBasicMaterial({colorWrite: false, side: T.DoubleSide})); pre.renderOrder = -1; mesh.add(pre); mesh.userData.pre = pre;}
    return pre;
  };

  const apply = () => {
    if (!state) return;
    findBlockers(); updateCut();
    const hidden = new Set(state.hiddenGroups), hiddenParts = new Set(state.hiddenParts), planes = clipping(), lit = selectedIds(), open = state.openChamber ? chamberOf(state.openChamber) : undefined;
    const insideNames = new Set(open?.inside ?? []), wallName = open?.wall;
    for (const [id, mesh] of meshes) {
      const part = parts.get(id)!, selected = lit.has(id), hovered = id === hoverId && !selected;
      mesh.visible = (!hidden.has(part.group) || insideNames.has(part.name)) && !(hiddenParts.has(id) && !selected);
      if (isTrunkPart(part.group, part.name)) {
        // opened heart: only the trunk piece of the main coronary vessels is drawn (index buffer swap; the geometry itself is untouched)
        const trunk = state.trunkOnly && !selected;
        if (mesh.userData.trunkDrawn !== trunk) {
          mesh.userData.full ??= mesh.geometry.index;
          mesh.userData.trunk ??= new T.BufferAttribute(trunkTriangles(mesh.geometry.getAttribute('position').array, mesh.userData.full.array), 1);
          mesh.geometry.setIndex(trunk ? mesh.userData.trunk : mesh.userData.full); mesh.userData.trunkDrawn = trunk;
        }
      }
      const m = mesh.material;
      const wall = cutApplies(id), inside = !!open && insideNames.has(part.name);
      const patch = isPatch(part.name) && !selected && !inside, blocker = !!open && !selected && blockers.has(id), seeThrough = !selected && selBlockers.has(id);
      const ghost = (state.ghostChambers && part.group === 'chambers' && !selected && !wall) || patch || blocker || seeThrough;
      const base = new T.Color(COLOR_BY_PART(id, part.group, part.system, part.name));
      m.color.set(selected ? HEART_SELECT.fill : hovered ? HEART_SELECT.hover : base);
      // The selected structure glows; the structures inside an opened chamber are opaque and lit (a little self-light so no face goes dark).
      if (selected) {m.emissive.set(HEART_SELECT.fill); m.emissiveIntensity = .28;}
      else if (inside) {m.emissive.copy(base); m.emissiveIntensity = .22;}
      else {m.emissive.set('#000000'); m.emissiveIntensity = 0;}
      m.opacity = seeThrough ? .2 : blocker ? BLOCKER_OPACITY : patch ? (part.group === 'pericardium' ? .22 : .6) : ghost ? .3 : 1; m.transparent = ghost; m.depthWrite = !ghost;
      m.polygonOffset = false;
      m.clippingPlanes = wall ? [...planes, cutPlane] : planes; m.needsUpdate = true;
      mesh.renderOrder = ghost ? 2 : selected ? 3 : 1;
      const pre = seeThrough && mesh.visible ? depthPrepass(mesh) : (mesh.userData.pre as T.Mesh | undefined);
      if (pre) {pre.visible = seeThrough && mesh.visible; (pre.material as T.Material).clippingPlanes = planes;}
      const outline = shells.get(id) as unknown as T.Group | undefined;
      if (selected) {
        const o = outlineOf(id, mesh); o.visible = mesh.visible;
        for (const child of o.children) (child as T.Mesh<T.BufferGeometry, T.Material>).material.clippingPlanes = wall ? [...planes, cutPlane] : planes;
      } else if (outline) outline.visible = false;
    }
    // read by the browser test: names of the drawn parts and of those drawn as trunk only
    host.dataset.visibleParts = JSON.stringify([...meshes].filter(([, m]) => m.visible).map(([id]) => parts.get(id)!.name));
    host.dataset.trunkParts = JSON.stringify([...meshes].filter(([, m]) => m.userData.trunkDrawn).map(([id]) => parts.get(id)!.name));
    host.dataset.seeThrough = JSON.stringify([...selBlockers].map(id => parts.get(id)?.name));
    dirty = true;
  };

  /**
   * Parts between the camera and the selected structure. Rays go from the camera to sample points of the selected surface; every other drawn part that a ray meets
   * clearly before the sample (and covers at least a quarter of the samples) is a blocker and is drawn see-through, so the selection is never hidden.
   */
  const refreshSelBlockers = () => {
    const lit = selectedIds(), next = new Set<string>();
    if (lit.size && state) {
      camera.updateMatrixWorld(); scene.updateMatrixWorld(true);
      // sample points: vertices of the selected surface that face the camera (the far side of a closed body is hidden by the body itself, not by a blocker)
      const samples: T.Vector3[] = [], v = new T.Vector3(), nrm = new T.Vector3();
      for (const id of lit) {
        const mesh = meshes.get(id); if (!mesh?.visible) continue;
        const position = mesh.geometry.getAttribute('position'), normal = mesh.geometry.getAttribute('normal'), step = Math.max(1, Math.floor(position.count / 40)), facing: T.Vector3[] = [], all: T.Vector3[] = [];
        for (let i = 0; i < position.count; i += step) {
          v.fromBufferAttribute(position, i); nrm.fromBufferAttribute(normal, i);
          all.push(v.clone()); if (Math.abs(nrm.dot(camera.position.clone().sub(v).normalize())) > .15 && nrm.dot(camera.position.clone().sub(v).normalize()) > 0) facing.push(v.clone());
        }
        // thin patches seen edge-on have no camera-facing vertices: use all of them
        samples.push(...(facing.length >= 4 ? facing : all));
      }
      const open = state.openChamber ? chamberOf(state.openChamber) : undefined;
      const candidates = [...meshes].filter(([id, m]) => m.visible && !lit.has(id)).map(([, m]) => m);
      const counts = new Map<string, number>(), origin = camera.position;
      for (const p of samples) {
        const dir = p.clone().sub(origin), distance = dir.length(); dir.normalize();
        raycaster.set(origin, dir); raycaster.far = distance - .0035;
        const seen = new Set<string>();
        for (const hit of raycaster.intersectObjects(candidates, false)) {
          const id = hit.object.userData.partId as string, part = parts.get(id)!;
          if (!keeps(hit.point) || (cutApplies(id) && cutPlane.distanceToPoint(hit.point) < 0)) continue;
          seen.add(id);
        }
        for (const id of seen) counts.set(id, (counts.get(id) ?? 0) + 1);
      }
      raycaster.far = Infinity;
      for (const [id, n] of counts) if (n >= Math.max(2, samples.length * .3)) next.add(id);
    }
    const same = next.size === selBlockers.size && [...next].every(id => selBlockers.has(id));
    selBlockers = next; if (!same) apply();
    return !same;
  };
  const scheduleBlockers = () => {window.clearTimeout(blockTimer); blockTimer = window.setTimeout(() => {if (!disposed) refreshSelBlockers();}, 120);};

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
      // faces seen from inside (the cut wall of an opened chamber) are a little darker, so the cavity reads as a hollow against the structures on its far wall
      material.onBeforeCompile = shader => {shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= gl_FrontFacing ? 1.0 : 0.66;');};
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

  /** Turns the camera to look at the selection from outside the heart (the camera stays when it already looks into the opened chamber that holds the selection). */
  const turnToSelection = () => {
    const ids = [...selectedIds()].filter(id => meshes.has(id));
    if (!ids.length) return;
    const area = new T.Box3();
    for (const id of ids) {const p = parts.get(id)!; area.union(new T.Box3(new T.Vector3().fromArray(p.bounds[0]), new T.Vector3().fromArray(p.bounds[1])));}
    const c = area.getCenter(new T.Vector3()), open = state?.openChamber ? chamberOf(state.openChamber) : undefined;
    const wall = open ? parts.get(catalogue.parts.find(p => p.name === open.wall)?.id ?? '') : undefined;
    let direction: T.Vector3;
    if (wall) {
      const wallBox = new T.Box3(new T.Vector3().fromArray(wall.bounds[0]), new T.Vector3().fromArray(wall.bounds[1])), wc = wallBox.getCenter(new T.Vector3());
      if (wallBox.clone().expandByScalar(.004).containsPoint(c)) {
        // inside the opened chamber: keep looking in; when the structure lies on the wall the camera faces (it would hang in the cut), look at it from the opposite side
        const towardCamera = camera.position.clone().sub(wc).normalize(), side = c.clone().sub(wc).dot(towardCamera);
        if (side <= .0035) return;
        direction = wc.clone().sub(c).normalize(); direction.y = Math.max(direction.y, .08); direction.normalize();
        const distance = Math.max(.07, framingDistance(new T.Box3(area.min.clone().addScalar(-.016), area.max.clone().addScalar(.016)), direction, camera.fov, camera.aspect, .9, .9)) * 1.15;
        tween = {t0: performance.now(), fromPos: camera.position.clone(), fromTarget: controls.target.clone(), toPos: wc.clone().addScaledVector(direction, distance * 1.1), toTarget: wc.clone().lerp(c, .35)};
        dirty = true; return;
      }
    }
    // from outside the heart: the way from the heart's centre to the structure, tilted at most ~17 degrees up or down (a view from straight above hides most structures)
    const outward = c.clone().sub(coreCentre), flat = Math.hypot(outward.x, outward.z), current = camera.position.clone().sub(controls.target).normalize();
    if (flat > .006) {outward.y = Math.max(-.3 * flat, Math.min(.3 * flat, outward.y)); direction = outward.normalize();}
    else direction = new T.Vector3(current.x, .15, current.z).normalize();
    const distance = Math.max(.07, framingDistance(new T.Box3(area.min.clone().addScalar(-.014), area.max.clone().addScalar(.014)), direction, camera.fov, camera.aspect, .9, .9));
    tween = {t0: performance.now(), fromPos: camera.position.clone(), fromTarget: controls.target.clone(), toPos: c.clone().addScaledVector(direction, distance), toTarget: c};
    dirty = true;
  };
  const update = (next: HeartViewState) => {
    state = next;
    if (command !== next.command.id) {command = next.command.id; tween = null; if (loadedAll || command >= 0) frameModel(next.command.view, next.command.look, next.command.focus);}
    const key = [...selectedIds()].sort().join('|'), moved = key !== focusKey;
    focusKey = key;
    if (moved && key && loadedAll) turnToSelection();
    apply();
    if (key || selBlockers.size) scheduleBlockers();
  };

  const pickAt = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    camera.updateMatrixWorld(); scene.updateMatrixWorld(true);
    raycaster.setFromCamera(new T.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, 1 - ((clientY - rect.top) / rect.height) * 2), camera);
    const candidates = [...meshes.values()].filter(m => m.visible && !(state?.ghostChambers && parts.get(m.userData.partId)?.group === 'chambers' && m.userData.partId !== state.selectedId));
    // The pericardial shells wrap the whole heart: they are picked only when nothing inside them is hit.
    let shellHit: string | null = null;
    for (const hit of raycaster.intersectObjects(candidates, false)) if (keeps(hit.point) && !(cutApplies(hit.object.userData.partId as string) && cutPlane.distanceToPoint(hit.point) < 0)) {
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
  controls.addEventListener('change', () => {dirty = true; updateCut(); if (state?.openChamber && findBlockers()) apply(); if (selectedIds().size) scheduleBlockers();});
  const resize = () => {
    const rect = host.getBoundingClientRect();
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
    camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height); camera.updateProjectionMatrix();
    frameModel(loadedAll ? 'fit' : 'front'); dirty = true;
  };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const render = () => {
    if (disposed) return; frame = requestAnimationFrame(render);
    if (tween) {
      const k = Math.min(1, (performance.now() - tween.t0) / 650), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      controls.target.lerpVectors(tween.fromTarget, tween.toTarget, e); camera.position.lerpVectors(tween.fromPos, tween.toPos, e);
      if (k >= 1) tween = null; dirty = true;
    }
    controls.update();
    if (dirty) {headlight.position.copy(camera.position); headlight.target.position.copy(controls.target); headlight.target.updateMatrixWorld(); renderer.render(scene, camera); if (labelSpecs.length) layoutLabels(); dirty = false;}};
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
      for (const shell of shells.values()) for (const child of (shell as unknown as T.Group).children) ((child as T.Mesh).material as T.Material).dispose();
      window.clearTimeout(blockTimer);
      labelLayer.remove(); renderer.dispose(); canvas.remove();
    },
  };
}
