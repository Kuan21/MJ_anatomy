import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {fetchModelBuffer, loadMissingChunks} from '../model-download';
import {PointerTap} from '../pointer-tap';
import {framingDistance} from '../camera-framing';
import {QUIZ_REGIONS, QUIZ_SYSTEMS, regionSections, sceneStructures, type QuizCatalogue, type QuizSection, type QuizSide, type QuizStructure} from './catalogue';

export type QuizView = 'front' | 'back' | 'side' | 'fit' | 'answer' | 'random';
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
  /** Level 2 (看結構寫名稱): the target is painted yellow with a glowing outline, nothing can be picked, and the camera chooses a random view where the target can be seen. */
  mode?: 'find' | 'name';
  /** Level 2: how clear the surrounding structures are (0 faint … 1 solid). */
  clarity?: number;
  /** Level 2: show only the target. */
  only?: boolean;
  /** Level 2: the neighbouring structures the learner clicked in the answer card (several at once, each in its own light blue). */
  highlightIds?: string[];
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
  correct: {fill: '#5DB89A', edge: '#3E8E74'},
  wrong: {fill: '#D6304A', edge: '#A8243A'},
  /** Level 2 target: yellow body with a brighter yellow glow around it. */
  target: {fill: '#FBE27A', edge: '#FFEB9E'},
};
/** Neighbouring structures: a pale sky blue laid over the model's own colour and shading, thin blue outline. Several at once take lighter or deeper shades of the same blue, never darker than the yellow target is bright. */
export const NEIGHBOUR_SHADES = [
  {fill: '#9CC9F0', edge: '#4F94D2'},
  {fill: '#B7DAF6', edge: '#6BA8DC'},
  {fill: '#84BDEB', edge: '#3F86C8'},
  {fill: '#CBE5F9', edge: '#82B6E2'},
];
/** How strongly a neighbour's pale blue replaces the model's colour (the rest stays, so shading and fibre texture show through). */
const NEIGHBOUR_TINT = .6;
export const neighbourShade = (highlightIds: string[] | undefined, id: string) => {
  const i = highlightIds?.indexOf(id) ?? -1;
  return i < 0 ? undefined : NEIGHBOUR_SHADES[i % NEIGHBOUR_SHADES.length];
};
const outlineMaterial = (color: string) => new T.ShaderMaterial({
  uniforms: {color: {value: new T.Color(color)}, width: {value: .0004}}, side: T.BackSide, depthTest: false, depthWrite: false, transparent: true,
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
  let command = -1, request = 0, commandAtQuestion = -1;

  /** A neighbour that stands between the camera and the yellow target turns half transparent so the target stays visible. */
  const targetPoints = (): T.Vector3[] => {
    const points: T.Vector3[] = [];
    for (const m of meshes.values()) {
      if (m.userData.structureId !== state?.target.id || !m.visible) continue;
      const pos = m.geometry.getAttribute('position'), step = Math.max(1, Math.floor(pos.count / 32));
      for (let i = 0; i < pos.count; i += step) points.push(new T.Vector3().fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld));
    }
    return points;
  };
  let cachedPoints: T.Vector3[] | undefined, cachedFor = '';
  const hidesTarget = (mesh: AnatomyMesh) => {
    if (cachedFor !== state?.target.id) {scene.updateMatrixWorld(true); cachedPoints = targetPoints(); cachedFor = state?.target.id ?? '';}
    if (!cachedPoints?.length) return false;
    const eye = camera.position;
    let hidden = 0;
    for (const p of cachedPoints) {
      const to = p.clone().sub(eye), len = to.length();
      raycaster.set(eye, to.normalize()); raycaster.far = len - .0005;
      if (raycaster.intersectObject(mesh, false).length) hidden++;
    }
    raycaster.far = Infinity;
    return hidden / cachedPoints.length > .12;
  };

  const applyAppearance = () => {
    if (!state) return;
    const hidden = new Set(state.hidden), naming = state.mode === 'name', clarity = state.clarity ?? .45;
    for (const mesh of meshes.values()) {
      const structure = byId.get(mesh.userData.structureId)!;
      const isTarget = structure.id === state.target.id;
      const shade = naming && !isTarget ? neighbourShade(state.highlightIds, structure.id) : undefined, isNeighbour = !!shade;
      const isAnswer = !naming && state.answered && isTarget;
      const isWrong = !naming && state.answered && structure.id === state.pickedId && !isAnswer;
      const isContext = structure.system !== state.target.system;
      mesh.visible = allowed.has(structure.id) && (naming ? (!state.only || isTarget || isNeighbour) : (state.answered || !hidden.has(structure.id))) && (!isContext || state.context || isTarget || isNeighbour);
      const base = QUIZ_SYSTEMS.find(s => s.id === structure.system)!.color;
      const material = mesh.material;
      const lit = isAnswer || isWrong || (naming && (isTarget || isNeighbour));
      const fill = isAnswer ? FEEDBACK.correct.fill : isWrong ? FEEDBACK.wrong.fill : naming && isTarget ? FEEDBACK.target.fill : shade ? shade.fill : keyboardId === structure.id ? '#5aa9e6' : base;
      // A neighbour is a pale blue wash over the structure's own colour, so its light, shade and fibre texture stay visible.
      if (shade) material.color.set(base).lerp(new T.Color(shade.fill), NEIGHBOUR_TINT); else material.color.set(fill);
      // The emissive term keeps the light and shade of the surface: the yellow is a tint, not a flat fill.
      material.emissive.set(lit ? fill : '#000000');
      material.emissiveIntensity = naming && isTarget ? .16 : isNeighbour ? .06 : isAnswer || isWrong ? .08 : 0;
      material.opacity = naming ? (isNeighbour ? (hidesTarget(mesh) ? .5 : 1) : isTarget ? 1 : isContext ? .06 + .34 * clarity : .12 + .6 * clarity)
        : isAnswer || isWrong ? .85 : isContext ? .2 : state.answered ? .16 : 1;
      // Outline shell around the answer, the wrong pick, the level-2 target and a clicked neighbour (shares the mesh geometry).
      let shell = mesh.userData.outline as T.Mesh<T.BufferGeometry, T.ShaderMaterial> | undefined;
      if (lit) {
        if (!shell) {shell = new T.Mesh(mesh.geometry, outlineMaterial(FEEDBACK.correct.edge)); shell.renderOrder = 3; mesh.add(shell); mesh.userData.outline = shell;}
        shell.material.uniforms.color.value.set(isAnswer ? FEEDBACK.correct.edge : isWrong ? FEEDBACK.wrong.edge : shade ? shade.edge : FEEDBACK.target.edge);
        shell.material.uniforms.width.value = naming && !isNeighbour ? .0009 : .0004;
        shell.visible = mesh.visible;
      } else if (shell) shell.visible = false;
      // The feedback meshes join the transparent pass (sorted last by renderOrder) so faint context anatomy never washes their colour out.
      const transparent = material.opacity < 1 || isAnswer || isWrong, depthWrite = material.opacity === 1 && !isAnswer && !isWrong;
      // Correct/wrong overlays remain visible even behind an outer muscle; the level-2 target keeps its depth, so a view where it is hidden stays hidden.
      const depthTest = naming || (!isAnswer && !isWrong);
      // Only a change of render state needs the material revalidated; doing it for every mesh on every update made each tap re-check hundreds of programs.
      const stateChanged = material.transparent !== transparent || material.depthWrite !== depthWrite || material.depthTest !== depthTest;
      material.transparent = transparent; material.depthWrite = depthWrite; material.depthTest = depthTest;
      mesh.renderOrder = isAnswer || (naming && isTarget) ? 5 : isWrong || isNeighbour ? 4 : isContext ? 0 : 1;
      if (stateChanged) material.needsUpdate = true;
    }
    canvas.style.cursor = naming ? 'grab' : state.peeling ? 'crosshair' : 'grab';
    dirty = true;
  };

  /** Level 2: a random direction from which at least half of the target can be seen. Points on the target are tested with rays from the camera; only solid structures hide it. */
  const chooseDirection = (box: T.Box3): T.Vector3 => {
    const target = [...meshes.values()].filter(m => m.userData.structureId === state?.target.id && m.visible);
    const points: T.Vector3[] = [];
    for (const mesh of target) {
      const pos = mesh.geometry.getAttribute('position'), step = Math.max(1, Math.floor(pos.count / 48));
      for (let i = 0; i < pos.count; i += step) points.push(new T.Vector3().fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld));
    }
    const centre = box.getCenter(new T.Vector3()), size = box.getSize(new T.Vector3()).length() * .75 + .05;
    const occluders = [...meshes.values()].filter(m => m.visible && m.userData.structureId !== state?.target.id && (m.material as T.MeshStandardMaterial).opacity >= .8);
    scene.updateMatrixWorld(true);
    const directions: T.Vector3[] = [];
    for (const elevation of [0, 25, -20, 50]) for (let k = 0; k < 12; k++) {
      const az = (k / 12) * Math.PI * 2 + Math.random() * .4, el = (elevation + (Math.random() - .5) * 14) * Math.PI / 180;
      directions.push(new T.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)));
    }
    for (let i = directions.length - 1; i > 0; i--) {const j = Math.floor(Math.random() * (i + 1)); [directions[i], directions[j]] = [directions[j], directions[i]];}
    const fraction = (dir: T.Vector3) => {
      if (!points.length) return 1;
      const eye = centre.clone().addScaledVector(dir, size);
      let seen = 0;
      for (const p of points) {
        const to = p.clone().sub(eye), len = to.length();
        raycaster.set(eye, to.normalize()); raycaster.far = len - .0005;
        if (!occluders.length || !raycaster.intersectObjects(occluders, false).length) seen++;
      }
      raycaster.far = Infinity;
      return seen / points.length;
    };
    let best = directions[0], bestScore = -1;
    for (const dir of directions) {
      const score = fraction(dir);
      if (score >= .5) return dir;
      if (score > bestScore) {best = dir; bestScore = score;}
    }
    return best;
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
    if (view === 'random') direction = chooseDirection(box);
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
      ready = false; keyboardId = undefined; commandAtQuestion = next.command.id;
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
        // Level 2 opens each question from a random direction, chosen once the structures are in the scene so the target can be tested for visibility.
        if (state?.mode === 'name' && state.key === next.key && state.command.id === commandAtQuestion) {applyAppearance(); frameModel('random');}
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
    if (!state || state.answered || !ready || state.mode === 'name') return;
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
    if (!state || state.answered || !ready || state.mode === 'name') return;
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
  // A neighbour turns half transparent only while it stands in front of the target, so the check follows the camera once a drag ends.
  controls.addEventListener('end', () => {if (state?.highlightIds?.length) {applyAppearance(); markDirty();}});
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
      // Release the WebGL context right away: phones allow only a handful, and leaving old quiz canvases around makes the next one lose its context.
      renderer.dispose(); renderer.forceContextLoss?.(); canvas.remove();
    },
  };
}
