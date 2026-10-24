import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {fetchModelBuffer, loadMissingChunks} from '../model-download';
import {PointerTap} from '../pointer-tap';
import {framingDistance} from '../camera-framing';
import {QUIZ_REGIONS, QUIZ_SYSTEMS, regionSections, sceneStructures, type QuizCatalogue, type QuizSection, type QuizSide, type QuizStructure} from './catalogue';

export type QuizView = 'front' | 'back' | 'side' | 'fit' | 'answer';
export interface QuizViewState {
  key: string;
  target: QuizStructure;
  section: QuizSection;
  side: QuizSide;
  answered: boolean;
  pickedId: string | null;
  hidden: string[];
  context: boolean;
  peeling: boolean;
  command: {id: number; view: QuizView};
}
interface Callbacks {
  ready: (key: string, value: boolean) => void;
  progress: (loaded: number, total: number) => void;
  error: (message: string) => void;
  pick: (id: string) => void;
  miss: () => void;
  keyboard: (message: string) => void;
}
type AnatomyMesh = T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>;
/** Correct / wrong feedback colours: deep, opaque and outlined so they read on the light stage and on red muscle alike. */
export const FEEDBACK = {
  correct: {fill: '#0E9F6E', edge: '#064E3B'},
  wrong: {fill: '#D6304A', edge: '#6F0F22'},
};
const outlineMaterial = (color: string) => new T.ShaderMaterial({
  uniforms: {color: {value: new T.Color(color)}, width: {value: .0018}}, side: T.BackSide, depthTest: false, depthWrite: false,
  vertexShader: 'uniform float width; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normalize(normal) * width, 1.0); }',
  fragmentShader: 'uniform vec3 color; void main(){ gl_FragColor = vec4(color, 1.0); }',
});

/** A static identification viewer. It never imports or applies motion skinning. */
export function createQuizViewer(host: HTMLDivElement, catalogue: QuizCatalogue, callbacks: Callbacks) {
  const controller = new AbortController(), tap = new PointerTap();
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(34, 1, .002, 30);
  const renderer = new T.WebGLRenderer({antialias: true, alpha: false, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor('#cbd2d6');
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-label', `3D ${QUIZ_REGIONS[catalogue.region ?? 'lower-limb'].label}測驗模型。拖曳旋轉，滾輪或雙指縮放；方向鍵巡覽構造，Enter 點選。`);
  canvas.setAttribute('role', 'group');
  canvas.tabIndex = 0;
  canvas.style.touchAction = 'none';
  host.appendChild(canvas);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = .15;
  controls.minDistance = .04;
  controls.maxDistance = 5;
  controls.enablePan = true;
  scene.add(new T.HemisphereLight('#ffffff', '#7b8e9c', 2.2));
  const keyLight = new T.DirectionalLight('#fff6e6', 2.8);
  keyLight.position.set(-2, 4, 4); scene.add(keyLight);
  const backLight = new T.DirectionalLight('#a8d8e3', 1.8);
  backLight.position.set(3, 2, -4); scene.add(backLight);

  const byId = new Map(catalogue.structures.map(s => [s.id, s]));
  const meshes = new Map<string, AnatomyMesh>();
  const loaded = new Set<number>(), inFlight = new Map<number, Promise<void>>();
  const raycaster = new T.Raycaster();
  let state: QuizViewState | undefined, disposed = false, ready = false, dirty = true, frame = 0;
  let allowed = new Set<string>(), keyboardId: string | undefined;
  let command = -1, request = 0;

  const applyAppearance = () => {
    if (!state) return;
    const hidden = new Set(state.hidden);
    for (const mesh of meshes.values()) {
      const structure = byId.get(mesh.userData.structureId)!;
      const isAnswer = state.answered && structure.id === state.target.id;
      const isWrong = state.answered && structure.id === state.pickedId && !isAnswer;
      const isContext = structure.system !== state.target.system;
      mesh.visible = allowed.has(structure.id) && (state.answered || !hidden.has(structure.id)) && (!isContext || state.context);
      const base = QUIZ_SYSTEMS.find(s => s.id === structure.system)!.color;
      const material = mesh.material;
      material.color.set(isAnswer ? FEEDBACK.correct.fill : isWrong ? FEEDBACK.wrong.fill : keyboardId === structure.id ? '#5aa9e6' : base);
      material.emissive.set(isAnswer ? FEEDBACK.correct.fill : isWrong ? FEEDBACK.wrong.fill : '#000000');
      material.emissiveIntensity = isAnswer || isWrong ? .22 : 0;
      material.opacity = isAnswer || isWrong ? 1 : isContext ? .2 : state.answered ? .16 : 1;
      // Outline shell around the answer and the wrong pick (shares the mesh geometry).
      let shell = mesh.userData.outline as T.Mesh<T.BufferGeometry, T.ShaderMaterial> | undefined;
      if (isAnswer || isWrong) {
        if (!shell) {shell = new T.Mesh(mesh.geometry, outlineMaterial(FEEDBACK.correct.edge)); shell.renderOrder = 2; mesh.add(shell); mesh.userData.outline = shell;}
        shell.material.uniforms.color.value.set(isAnswer ? FEEDBACK.correct.edge : FEEDBACK.wrong.edge);
        shell.visible = mesh.visible;
      } else if (shell) shell.visible = false;
      material.transparent = material.opacity < 1;
      material.depthWrite = material.opacity === 1;
      // Correct/wrong overlays remain visible even behind an outer muscle.
      material.depthTest = !isAnswer && !isWrong;
      mesh.renderOrder = isAnswer ? 4 : isWrong ? 3 : isContext ? 0 : 1;
      material.needsUpdate = true;
    }
    canvas.style.cursor = state.peeling ? 'crosshair' : 'grab';
    dirty = true;
  };

  const frameModel = (view: QuizView) => {
    if (!state) return;
    const region = QUIZ_REGIONS[catalogue.region ?? 'lower-limb'];
    const section = state.section === 'all' ? state.target.sections[0] : state.section;
    const range = (regionSections(catalogue.region).find(s => s.id === section) ?? regionSections(catalogue.region)[0]).range;
    const wide = region.frame.x, minX = state.side === 'left' ? -.01 : -wide, maxX = state.side === 'right' ? .01 : wide;
    const box = view === 'answer'
      ? new T.Box3(new T.Vector3().fromArray(state.target.bounds[0]), new T.Vector3().fromArray(state.target.bounds[1])).expandByScalar(.015)
      : new T.Box3(new T.Vector3(minX, range[0], region.frame.z[0]), new T.Vector3(maxX, range[1], section === 'foot' && region.frame.footZ ? region.frame.footZ : region.frame.z[1]));
    // A structure spanning two sections must still be entirely in the frame.
    if (view !== 'answer') box.union(new T.Box3(new T.Vector3().fromArray(state.target.bounds[0]), new T.Vector3().fromArray(state.target.bounds[1])));
    let direction = camera.position.clone().sub(controls.target).normalize();
    if (view === 'front') direction.set(0, .04, 1).normalize();
    if (view === 'back') direction.set(0, .04, -1).normalize();
    if (view === 'side') direction.set(state.target.side === 'right' ? -1 : 1, .03, .02).normalize();
    if (direction.lengthSq() < .5) direction.set(0, 0, 1);
    controls.target.copy(box.getCenter(new T.Vector3()));
    camera.position.copy(controls.target).addScaledVector(direction, framingDistance(box, direction, camera.fov, camera.aspect, .86, .86));
    controls.update(); dirty = true;
  };

  const loadPackage = (index: number): Promise<void> => {
    if (loaded.has(index)) return Promise.resolve();
    if (inFlight.has(index)) return inFlight.get(index)!;
    const task = (async () => {
      const pack = catalogue.packages[index];
      const url = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '');
      let buffer: ArrayBuffer;
      if (typeof DecompressionStream === 'undefined') buffer = await fetchModelBuffer(url(pack.url), pack.bytes, false, controller.signal);
      else {
        try {buffer = await fetchModelBuffer(url(pack.gzip), pack.bytes, true, controller.signal);}
        catch (error) {
          if (controller.signal.aborted) throw error;
          buffer = await fetchModelBuffer(url(pack.url), pack.bytes, false, controller.signal);
        }
      }
      if (disposed) return;
      for (const part of pack.meshes) {
        const geometry = new T.BufferGeometry();
        geometry.setAttribute('position', new T.BufferAttribute(new Float32Array(buffer, part.positions, part.vertexCount * 3), 3));
        geometry.setAttribute('normal', new T.BufferAttribute(new Int16Array(buffer, part.normals, part.vertexCount * 3), 3, true));
        geometry.setIndex(new T.BufferAttribute(new Uint32Array(buffer, part.indices, part.indexCount), 1));
        geometry.computeBoundingBox(); geometry.computeBoundingSphere();
        const material = new T.MeshStandardMaterial({roughness: .63, metalness: 0, side: T.DoubleSide});
        const mesh = new T.Mesh(geometry, material);
        mesh.userData.structureId = part.structureId;
        mesh.name = part.id; mesh.visible = false;
        meshes.set(part.id, mesh); scene.add(mesh);
      }
      loaded.add(index);
      applyAppearance();
    })().finally(() => inFlight.delete(index));
    inFlight.set(index, task);
    return task;
  };

  const update = (next: QuizViewState) => {
    const changedQuestion = state?.key !== next.key;
    state = next;
    const section = next.section === 'all' ? next.target.sections[0] : next.section;
    allowed = new Set(sceneStructures(catalogue, next.target, section, next.side).map(s => s.id));
    if (changedQuestion) {
      ready = false; keyboardId = undefined;
      callbacks.ready(next.key, false);
      callbacks.error('');
      const ticket = ++request;
      const needed = catalogue.packages.flatMap((p, i) => p.meshes.some(m => allowed.has(m.structureId)) ? [i] : []);
      callbacks.progress(needed.filter(i => loaded.has(i)).length, needed.length);
      void loadMissingChunks(needed, async i => {
        await loadPackage(i);
        if (!disposed && ticket === request) callbacks.progress(needed.filter(n => loaded.has(n)).length, needed.length);
      }, controller.signal, () => {}, 2).then(failed => {
        if (disposed || ticket !== request) return;
        if (failed.length) {callbacks.error('部分模型未能載入，題目暫停。請重試，載入完整後先作答。'); return;}
        ready = true; callbacks.ready(next.key, true); dirty = true;
      });
      frameModel(QUIZ_REGIONS[catalogue.region ?? 'lower-limb'].defaultView ?? 'front');
    }
    if (command !== next.command.id) {
      command = next.command.id;
      frameModel(next.command.view);
    }
    applyAppearance();
  };

  const selectable = () => [...meshes.values()].filter(m => m.visible && byId.get(m.userData.structureId)!.system === state?.target.system);
  const pickAt = (clientX: number, clientY: number, touch: boolean) => {
    if (!state || state.answered || !ready) return;
    const rect = canvas.getBoundingClientRect(), candidates = selectable();
    camera.updateMatrixWorld(); scene.updateMatrixWorld(true);
    // Pixel tolerance assists thin nerves on touch screens; every candidate
    // uses the same rays. Never bias a hit towards the correct answer.
    const offsets = [[0, 0], ...[4, 8, ...(touch ? [12] : [])].flatMap(d => [[d, 0], [-d, 0], [0, d], [0, -d]])];
    for (const [dx, dy] of offsets) {
      raycaster.setFromCamera(new T.Vector2(((clientX + dx - rect.left) / rect.width) * 2 - 1, 1 - ((clientY + dy - rect.top) / rect.height) * 2), camera);
      const hit = raycaster.intersectObjects(candidates, false)[0];
      if (hit) {callbacks.pick(hit.object.userData.structureId); return;}
    }
    callbacks.miss();
  };
  const down = (e: PointerEvent) => {if (e.button !== 0) return; tap.down(e.pointerId, e.clientX, e.clientY, e.pointerType === 'touch' ? 10 : 5);};
  const move = (e: PointerEvent) => tap.move(e.pointerId, e.clientX, e.clientY);
  const up = (e: PointerEvent) => {if (tap.up(e.pointerId, e.clientX, e.clientY)) pickAt(e.clientX, e.clientY, e.pointerType === 'touch');};
  const cancel = (e: PointerEvent) => tap.cancel(e.pointerId);
  const keydown = (e: KeyboardEvent) => {
    if (!state || state.answered || !ready) return;
    const ids = [...new Set(selectable().map(m => m.userData.structureId as string))].sort();
    if (!ids.length) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      const step = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
      const current = keyboardId ? ids.indexOf(keyboardId) : -1;
      keyboardId = ids[(current + step + ids.length) % ids.length];
      callbacks.keyboard(`已選取第 ${ids.indexOf(keyboardId) + 1} 個構造，共 ${ids.length} 個。按 Enter ${state.peeling ? '移開遮擋' : '作答'}。`);
      applyAppearance();
    } else if ((e.key === 'Enter' || e.key === ' ') && keyboardId && ids.includes(keyboardId)) {
      e.preventDefault(); callbacks.pick(keyboardId);
    }
  };
  const lostContext = (e: Event) => {e.preventDefault(); ready = false; if (state) callbacks.ready(state.key, false); callbacks.error('3D 顯示已中斷，請按「重新載入模型」。');};
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', cancel);
  canvas.addEventListener('lostpointercapture', cancel);
  canvas.addEventListener('keydown', keydown);
  canvas.addEventListener('webglcontextlost', lostContext);
  const markDirty = () => {dirty = true;};
  controls.addEventListener('change', markDirty);
  const resize = () => {
    const rect = host.getBoundingClientRect();
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
    camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
    camera.updateProjectionMatrix();
    frameModel('fit'); dirty = true;
  };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const render = () => {
    if (disposed) return;
    frame = requestAnimationFrame(render);
    controls.update();
    if (dirty) {renderer.render(scene, camera); dirty = false;}
  };
  render();
  return {
    update,
    dispose() {
      disposed = true; ++request; controller.abort(); cancelAnimationFrame(frame);
      observer.disconnect(); controls.dispose();
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', cancel);
      canvas.removeEventListener('lostpointercapture', cancel);
      canvas.removeEventListener('keydown', keydown); canvas.removeEventListener('webglcontextlost', lostContext);
      for (const mesh of meshes.values()) {mesh.geometry.dispose(); mesh.material.dispose(); (mesh.userData.outline as T.Mesh<T.BufferGeometry, T.ShaderMaterial> | undefined)?.material.dispose();}
      renderer.dispose(); canvas.remove();
    },
  };
}
