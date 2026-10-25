import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {mergeGeometries, mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {PointerTap} from '../pointer-tap';
import {framingDistance} from '../camera-framing';
import {describeBrainNode} from './brain-catalogue';
import type {CsfSource} from './csf-scene';
import {LABEL, voxelize, type VoxelGrid, type VoxelInput} from './brain-voxels';
import {SECTION_AXES, type BrainPart, type BrainView, type BrainViewState} from './brain-types';

interface Callbacks {
  progress: (percent: number) => void;
  ready: (parts: BrainPart[]) => void;
  error: (message: string) => void;
  pick: (id: string | null) => void;
}
export const BRAIN_SELECT = {fill: '#5DB89A', edge: '#3E8E74'};
const GROUP_COLOR: Record<string, string> = {
  meninges: '#d9c9a3', frontal: '#cdb0a8', parietal: '#c9b4ad', temporal: '#c5aaa3', occipital: '#c1a7a6', limbic: '#c9a9ad', insula: '#c8a8a0', 'cortex-other': '#cbb2ab',
  cerebellum: '#c39b8f', brainstem: '#d6b79d', white: '#efe6d3', basal: '#b79d9d', diencephalon: '#c9a3ae', ventricles: '#7fb2d6', cranial: '#e4c85a', arteries: '#c4414f', veins: '#4f7fbf',
};
/** Groups drawn as translucent shells so what lies inside them can be seen. */
const TRANSLUCENT: Record<string, number> = {meninges: .32, ventricles: .55};
const BODY_GROUPS = /^(frontal|parietal|temporal|occipital|limbic|insula|cortex-other|cerebellum)$/, CORTEX_GROUPS = /^(frontal|parietal|temporal|occipital|limbic|insula|cortex-other)$/;
const DRACO_PATH = `${import.meta.env.BASE_URL}draco/`;

/** Isolated viewer for the brain detail mode: sections with solid cut surfaces, layers, picking. It never touches the atlas scene. */
export function createBrainViewer(host: HTMLDivElement, callbacks: Callbacks) {
  const tap = new PointerTap();
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(32, 1, .002, 20);
  const renderer = new T.WebGLRenderer({antialias: true, alpha: false, stencil: true, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor('#cbd2d6');
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.localClippingEnabled = true;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-label', '3D 腦部詳細模型。拖曳旋轉，滾輪或雙指縮放，點選構造查看名稱。');
  canvas.setAttribute('role', 'group');
  canvas.style.touchAction = 'none';
  host.appendChild(canvas);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = .15; controls.minDistance = .03; controls.maxDistance = 2; controls.enablePan = true;
  scene.add(new T.HemisphereLight('#ffffff', '#7b8e9c', 2.2));
  const key = new T.DirectionalLight('#fff6e6', 2.6); key.position.set(-1.5, 3, 4); scene.add(key);
  const fill = new T.DirectionalLight('#a8c8e3', 1.4); fill.position.set(3, 1, -3); scene.add(fill);

  const plane = new T.Plane(new T.Vector3(0, 0, 1), 0);
  const parts = new Map<string, BrainPart>(), meshes = new Map<string, T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>>();
  const capQuad = new T.PlaneGeometry(.4, .4);
  const core = new T.Box3(), whole = new T.Box3();
  const raycaster = new T.Raycaster();
  let state: BrainViewState | undefined, disposed = false, dirty = true, frame = 0, command = -1, loaded = false;

  const planeActive = () => !!state && state.section.axis !== 'none';
  const placePlane = () => {
    const s = state?.section;
    if (!s || s.axis === 'none') return false;
    const axis = SECTION_AXES[s.axis].index, lo = core.min.getComponent(axis), hi = core.max.getComponent(axis), at = lo + (hi - lo) * s.offset;
    const normal = new T.Vector3(); normal.setComponent(axis, s.flip ? -1 : 1);
    plane.set(normal, -normal.dot(new T.Vector3().setComponent(axis, at)));
    return true;
  };
  const keeps = (point: T.Vector3) => !planeActive() || plane.distanceToPoint(point) >= 0;

  // ---- solid cut surface: one quad on the cutting plane that looks up the voxel grid (see brain-voxels.ts)
  let grid: VoxelGrid | undefined, capMesh: T.Mesh | undefined, maskTexture: T.DataTexture | undefined, maskData: Uint8Array | undefined, building = false;
  const PALETTE: Record<number, string> = {
    [LABEL.cortexGrey]: '#a99390', [LABEL.cortexWhite]: '#f1eadc', [LABEL.cerebellumGrey]: '#b49187', [LABEL.cerebellumWhite]: '#efe3d2', [LABEL.brainstem]: '#d4c0ac',
    [LABEL.basal]: '#9d8685', [LABEL.diencephalon]: '#b59ba3', [LABEL.tract]: '#faf6ee', [LABEL.csf]: '#5f8fb4',
  };
  const buildCap = () => {
    if (grid || building) return;
    building = true;
    const inputs: VoxelInput[] = [];
    for (const [id, mesh] of meshes) {
      const part = parts.get(id)!, index = Number(id.slice(1));
      inputs.push({index, group: part.group, hemisphere: mesh.geometry.boundingBox!.getCenter(new T.Vector3()).x >= 0 ? 1 : -1, positions: mesh.geometry.getAttribute('position').array, indices: mesh.geometry.getIndex()?.array ?? null});
    }
    const t0 = performance.now(); grid = voxelize(inputs);
    { const c = new Array(10).fill(0); for (const v of grid.label) c[v]++; void t0; void c; }
    const label = new T.Data3DTexture(grid.label as unknown as Uint8Array<ArrayBuffer>, grid.nx, grid.ny, grid.nz); label.format = T.RedFormat; label.type = T.UnsignedByteType; label.minFilter = label.magFilter = T.NearestFilter; label.unpackAlignment = 1; label.needsUpdate = true;
    const partTexture = new T.Data3DTexture(Float32Array.from(grid.part), grid.nx, grid.ny, grid.nz); partTexture.format = T.RedFormat; partTexture.type = T.FloatType; partTexture.minFilter = partTexture.magFilter = T.NearestFilter; partTexture.unpackAlignment = 1; partTexture.needsUpdate = true;
    maskData = new Uint8Array(new ArrayBuffer((parts.size + 1) * 4)); maskTexture = new T.DataTexture(maskData as Uint8Array<ArrayBuffer>, parts.size + 1, 1, T.RGBAFormat); maskTexture.needsUpdate = true;
    const palette = Array.from({length: 10}, (_, i) => new T.Vector3(...(PALETTE[i] ? new T.Color(PALETTE[i]).toArray() : [0, 0, 0])));
    const selectedColor = new T.Color(BRAIN_SELECT.fill);
    const material = new T.ShaderMaterial({
      side: T.DoubleSide,
      uniforms: {uLabel: {value: label}, uPart: {value: partTexture}, uMask: {value: maskTexture}, uOrigin: {value: new T.Vector3(...grid.origin)}, uInvSize: {value: new T.Vector3(1 / (grid.nx * grid.size), 1 / (grid.ny * grid.size), 1 / (grid.nz * grid.size))}, uPalette: {value: palette}, uSelected: {value: new T.Vector3(...selectedColor.toArray())}},
      vertexShader: 'varying vec3 vWorld; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `precision highp float; precision highp sampler3D;
        uniform sampler3D uLabel; uniform sampler3D uPart; uniform sampler2D uMask; uniform vec3 uOrigin; uniform vec3 uInvSize; uniform vec3 uPalette[10]; uniform vec3 uSelected; varying vec3 vWorld;
        void main(){
          vec3 uvw = (vWorld - uOrigin) * uInvSize;
          if (any(lessThan(uvw, vec3(0.0))) || any(greaterThan(uvw, vec3(1.0)))) discard;
          float lab = texture(uLabel, uvw).r * 255.0;
          if (lab < 0.5) discard;
          float part = texture(uPart, uvw).r;
          vec4 m = texelFetch(uMask, ivec2(int(part + 0.5), 0), 0);
          if (m.g < 0.5) discard;
          vec3 col = m.r > 0.5 ? uSelected : uPalette[int(lab + 0.5)];
          float edge = fwidth(part) + fwidth(lab);
          if (edge > 0.01) col *= 0.8;
          gl_FragColor = vec4(col, 1.0);
          gl_FragColor = linearToOutputTexel(gl_FragColor);
        }`,
    });
    capMesh = new T.Mesh(capQuad, material); capMesh.frustumCulled = false; capMesh.renderOrder = 5; capMesh.visible = false; scene.add(capMesh);
    building = false;
  };
  const INTERNAL = new Set(['white', 'basal', 'diencephalon', 'ventricles']);

  const visibleIn = (p: BrainPart) => {
    if (!state) return false;
    if (state.isolate) return state.isolate.includes(p.id);
    if (state.hiddenGroups.includes(p.group) || state.hiddenParts.includes(p.id)) return false;
    return p.layer < 0 || p.layer >= state.peel;
  };
  const apply = () => {
    if (!state) return;
    const cutting = placePlane(), selected = new Set(state.selectedIds);
    if (cutting) buildCap();
    for (const [id, mesh] of meshes) {
      const part = parts.get(id)!, on = selected.has(id);
      mesh.visible = visibleIn(part);
      const m = mesh.material, translucent = TRANSLUCENT[part.group];
      m.color.set(on ? BRAIN_SELECT.fill : GROUP_COLOR[part.group] ?? '#cfae9a');
      m.emissive.set(on ? BRAIN_SELECT.fill : '#000000'); m.emissiveIntensity = on ? .12 : 0;
      m.transparent = translucent !== undefined && !on; m.opacity = translucent !== undefined && !on ? translucent : 1; m.depthWrite = !m.transparent;
      m.polygonOffset = on; m.polygonOffsetFactor = -3; m.polygonOffsetUnits = -3;
      m.clippingPlanes = cutting ? [plane] : []; m.needsUpdate = true;
      if (maskData) {
        // the cut shows every tissue class; structures of the deep groups appear on it even while their surfaces are switched off
        const i = (Number(id.slice(1)) + 1) * 4, shown = state.isolate ? state.isolate.includes(id) : !state.hiddenParts.includes(id) && (INTERNAL.has(part.group) || visibleIn(part));
        maskData[i] = on ? 255 : 0; maskData[i + 1] = shown ? 255 : 0;
      }
    }
    if (maskTexture) maskTexture.needsUpdate = true;
    if (capMesh) {
      capMesh.visible = cutting;
      if (cutting) {capMesh.position.copy(core.getCenter(new T.Vector3())).addScaledVector(plane.normal, -plane.normal.dot(core.getCenter(new T.Vector3())) - plane.constant); capMesh.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), plane.normal);}
    }
    dirty = true;
  };

  const frameModel = (view: BrainView, focus?: string[]) => {
    const direction = new T.Vector3(0, .05, 1);
    if (view === 'back') direction.set(0, .05, -1);
    if (view === 'left') direction.set(1, .05, 0);
    if (view === 'right') direction.set(-1, .05, 0);
    if (view === 'top') direction.set(0, 1, .12);
    if (view === 'bottom') direction.set(0, -1, .12);
    if (view === 'fit') direction.copy(camera.position).sub(controls.target).normalize();
    direction.normalize();
    const area = new T.Box3();
    if (focus?.length) for (const id of focus) {const mesh = meshes.get(id); if (mesh) area.union(mesh.geometry.boundingBox!);}
    if (area.isEmpty()) area.copy(core);
    const centre = area.getCenter(new T.Vector3()), target = new T.Box3(area.min.clone().addScalar(-.008), area.max.clone().addScalar(.008));
    controls.target.copy(centre);
    camera.position.copy(centre).addScaledVector(direction, framingDistance(target, direction, camera.fov, camera.aspect, .88, .88));
    controls.update(); dirty = true;
  };

  const draco = new DRACOLoader(); draco.setDecoderPath(DRACO_PATH);
  const loader = new GLTFLoader(); loader.setDRACOLoader(draco);
  loader.load(`${import.meta.env.BASE_URL}models/brain.glb`, gltf => {
    if (disposed) return;
    gltf.scene.updateMatrixWorld(true);
    const list: BrainPart[] = [];
    // A node with several materials loads as a group of meshes: its pieces are merged into one geometry so a structure stays one selectable thing.
    const take = (node: T.Object3D) => {
      const x = node.userData ?? {};
      if (!x.bx_cat) return false;
      const pieces: T.BufferGeometry[] = [];
      node.traverse(o => {
        if (!(o instanceof T.Mesh)) return;
        const flat = o.geometry.getIndex() ? o.geometry.toNonIndexed() : o.geometry.clone(), ng = new T.BufferGeometry();
        ng.setAttribute('position', flat.getAttribute('position'));
        ng.applyMatrix4(o.matrixWorld); pieces.push(ng);
      });
      if (!pieces.length) return true;
      const part = describeBrainNode({name: node.name, cat: String(x.bx_cat), region: String(x.bx_region ?? ''), label: String(x.bx_label ?? ''), side: String(x.bx_side ?? '')}, list.length);
      if (!part) return true;
      const merged = mergeGeometries(pieces, false)!;
      const geometry = mergeVertices(merged, 1e-6); geometry.computeVertexNormals();
      geometry.computeBoundingBox(); geometry.computeBoundingSphere();
      const mesh = new T.Mesh(geometry, new T.MeshStandardMaterial({color: GROUP_COLOR[part.group] ?? '#cfae9a', roughness: .6, metalness: 0, side: T.DoubleSide}));
      mesh.userData.partId = part.id; list.push(part); parts.set(part.id, part); meshes.set(part.id, mesh); scene.add(mesh);
      whole.union(geometry.boundingBox!);
      if (/^(frontal|parietal|temporal|occipital|limbic|insula|cortex-other|cerebellum|brainstem)$/.test(part.group)) core.union(geometry.boundingBox!);
      return true;
    };
    const walk = (node: T.Object3D) => {if (!take(node)) for (const child of [...node.children]) walk(child);};
    walk(gltf.scene);
    draco.dispose();
    if (core.isEmpty()) core.copy(whole);
    loaded = true; frameModel('front'); apply(); callbacks.ready(list);
  }, e => {if (e.total) callbacks.progress(Math.min(100, Math.round(e.loaded / e.total * 100)));}, () => callbacks.error('腦部模型未能載入，請重新載入。'));

  /** What the CSF animation needs from the loaded model: the ventricular system, the superior sagittal sinus and a point cloud of the brain surface. */
  const exportForCsf = (): CsfSource | null => {
    if (!loaded) return null;
    const pick = (test: (p: BrainPart) => boolean) => [...meshes].filter(([id]) => test(parts.get(id)!)).map(([, m]) => m.geometry);
    const cloud: number[] = [], stem: number[] = [];
    for (const [id, m] of meshes) {
      const g = parts.get(id)!.group;
      if (!BODY_GROUPS.test(g) && g !== 'brainstem') continue;
      const a = m.geometry.getAttribute('position'), out = g === 'brainstem' ? stem : cloud;
      for (let i = 0; i < a.count; i += 9) out.push(a.getX(i), a.getY(i), a.getZ(i));
    }
    const box = (test: (p: BrainPart) => boolean) => {const b = new T.Box3(); for (const g of pick(test)) b.union(g.boundingBox!); return b;};
    return {
      lateral: pick(p => /^lateral ventricle$/i.test(p.en)), choroid: pick(p => /^choroid plexus$/i.test(p.en)), third: pick(p => /^third ventricle$/i.test(p.en)),
      aqueduct: pick(p => /^aqueduct of midbrain$/i.test(p.en)), fourth: pick(p => /^fourth ventricle$/i.test(p.en)), sinus: pick(p => /^superior sagittal sinus$/i.test(p.en)),
      cloud: new Float32Array(cloud), stem: new Float32Array(stem), brainstem: box(p => p.group === 'brainstem'), cerebellum: box(p => p.group === 'cerebellum'), cerebrum: box(p => CORTEX_GROUPS.test(p.group)),
    };
  };

  const update = (next: BrainViewState) => {
    state = next;
    if (command !== next.command.id) {command = next.command.id; if (loaded) frameModel(next.command.view, next.command.focus);}
    if (loaded) apply();
  };

  const pickAt = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    camera.updateMatrixWorld(); scene.updateMatrixWorld(true);
    raycaster.setFromCamera(new T.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, 1 - ((clientY - rect.top) / rect.height) * 2), camera);
    const visible = [...meshes.values()].filter(m => m.visible);
    let hitId: string | null = null, hitDistance = Infinity;
    for (const hit of raycaster.intersectObjects(visible, false)) if (keeps(hit.point)) {hitId = hit.object.userData.partId as string; hitDistance = hit.distance; break;}
    if (planeActive() && grid) {
      const point = raycaster.ray.intersectPlane(plane, new T.Vector3());
      if (point && raycaster.ray.origin.distanceTo(point) <= hitDistance + 1e-4) {
        const x = Math.floor((point.x - grid.origin[0]) / grid.size), y = Math.floor((point.y - grid.origin[1]) / grid.size), z = Math.floor((point.z - grid.origin[2]) / grid.size);
        if (x >= 0 && y >= 0 && z >= 0 && x < grid.nx && y < grid.ny && z < grid.nz) {
          const i = x + grid.nx * (y + grid.ny * z), owner = grid.part[i];
          if (grid.label[i] && owner && maskData && maskData[owner * 4 + 1]) return `b${owner - 1}`;
        }
      }
    }
    return hitId;
  };
  const down = (e: PointerEvent) => {if (e.button === 0) tap.down(e.pointerId, e.clientX, e.clientY, e.pointerType === 'touch' ? 10 : 5);};
  const move = (e: PointerEvent) => tap.move(e.pointerId, e.clientX, e.clientY);
  const up = (e: PointerEvent) => {if (tap.up(e.pointerId, e.clientX, e.clientY)) callbacks.pick(pickAt(e.clientX, e.clientY));};
  const cancel = (e: PointerEvent) => tap.cancel(e.pointerId);
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', cancel);
  const lost = (e: Event) => {e.preventDefault(); callbacks.error('3D 顯示已中斷，請重新載入頁面。');};
  canvas.addEventListener('webglcontextlost', lost);
  controls.addEventListener('change', () => {dirty = true;});
  const resize = () => {
    const rect = host.getBoundingClientRect();
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
    camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height); camera.updateProjectionMatrix();
    if (loaded) frameModel('fit'); dirty = true;
  };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const render = () => {if (disposed) return; frame = requestAnimationFrame(render); controls.update(); if (dirty) {renderer.render(scene, camera); dirty = false;}};
  render();
  return {
    update, exportForCsf,
    /** Screenshots and tests: the canvas as it is drawn now. */
    get canvas() {return canvas;},
    dispose() {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); controls.dispose(); draco.dispose();
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', cancel); canvas.removeEventListener('webglcontextlost', lost);
      for (const mesh of meshes.values()) {mesh.geometry.dispose(); mesh.material.dispose();}
      capMesh?.material instanceof T.Material && capMesh.material.dispose();
      capQuad.dispose(); renderer.dispose(); canvas.remove();
    },
  };
}
