import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {seededRandom} from './seeded';
import {fetchModelBuffer, loadMissingChunks} from '../model-download';
import {PointerTap} from '../pointer-tap';
import {framingDistance} from '../camera-framing';
import {coversBrainTarget} from './brain';
import {SPACES} from '../mj-spaces';
import {QUIZ_REGIONS, QUIZ_SYSTEMS, ownerMuscleNames, regionSections, sceneStructures, type QuizCatalogue, type QuizSection, type QuizSide, type QuizStructure} from './catalogue';

export type QuizView = 'front' | 'back' | 'side' | 'medial' | 'top' | 'bottom' | 'fit' | 'answer' | 'random';
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
  /** Levels 2 and 3 (學習關卡, 看結構寫名稱): the target is painted yellow with a glowing outline, nothing can be picked, and the camera chooses a random view where the target can be seen. */
  mode?: 'find' | 'name';
  /** Level 2: how clear the surrounding structures are (0 faint … 1 solid). */
  clarity?: number;
  /** Level 2: show only the target. */
  only?: boolean;
  /** Level 2: the neighbouring structures the learner clicked in the answer card (several at once, each in its own light blue). */
  highlightIds?: string[];
  /** Level 2 (學習關卡): the opening view is deterministic (the same seed always gives the same direction); `apart` makes it a clearly different direction from the one the seed gives without it (round 3). */
  lesson?: {seed: string; apart: boolean};
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

/**
 * A space is a place, not a whole structure: its boundary muscles run on far beyond it. The members of a space question are always drawn whole, in the highlight colour, but the colour is
 * strongest at the space (the range sphere of the layer panel, app/space-ranges.json) and softens towards the far ends of each member, as the layer panel's highlight does.
 * It is a position-based colour mix in the member's own material; no geometry is added or removed.
 */
interface SpaceFade {centre: T.Vector3; inner: number; outer: number; far: T.Color}
const FADE_OFF = 1e9;
function setSpaceFade(material: T.MeshStandardMaterial, fade: SpaceFade | null) {
  let uniforms = material.userData.spaceFade as {uSC: {value: T.Vector3}; uIn: {value: number}; uOut: {value: number}; uFar: {value: T.Color}} | undefined;
  if (!uniforms) {
    if (!fade) return;
    uniforms = {uSC: {value: new T.Vector3()}, uIn: {value: FADE_OFF}, uOut: {value: FADE_OFF * 2}, uFar: {value: new T.Color()}};
    material.userData.spaceFade = uniforms;
    const u = uniforms;
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, u);
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vFadeWP;').replace('#include <project_vertex>', '#include <project_vertex>\nvFadeWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vFadeWP; uniform vec3 uSC; uniform float uIn; uniform float uOut; uniform vec3 uFar; float fadeK;')
        .replace('#include <color_fragment>', '#include <color_fragment>\nfadeK = 1.0 - smoothstep(uIn, uOut, distance(vFadeWP, uSC)); diffuseColor.rgb = mix(uFar, diffuseColor.rgb, fadeK);')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance *= fadeK;');
    };
    material.customProgramCacheKey = () => 'quiz-space-fade';
    material.needsUpdate = true;
  }
  uniforms.uIn.value = fade ? fade.inner : FADE_OFF; uniforms.uOut.value = fade ? fade.outer : FADE_OFF * 2;
  if (fade) {uniforms.uSC.value.copy(fade.centre); uniforms.uFar.value.copy(fade.far);}
}

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
  /** The structures drawn as the target: the structure itself, or for a limb space the structures that bound it and pass through it (it has no mesh of its own). */
  let targetIds = new Set<string>();
  const isSpace = () => !!state?.target.space;
  let command = -1, request = 0, commandAtQuestion = -1;

  /** Sample points of the target. A space is judged where it is, not along the whole length of its boundary muscles: only vertices within the space box are taken. */
  const spaceBox = () => {const b = state!.target.bounds; return new T.Box3(new T.Vector3().fromArray(b[0]), new T.Vector3().fromArray(b[1]));};
  const samplePoints = (perMesh: number): T.Vector3[] => {
    const points: T.Vector3[] = [], near = isSpace() ? spaceBox() : undefined, v = new T.Vector3();
    for (const m of meshes.values()) {
      if (!targetIds.has(m.userData.structureId) || !m.visible) continue;
      const pos = m.geometry.getAttribute('position');
      if (near) {
        const inside: T.Vector3[] = [];
        for (let i = 0; i < pos.count; i++) {v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); if (near.containsPoint(v)) inside.push(v.clone());}
        const step = Math.max(1, Math.floor(inside.length / perMesh));
        for (let i = 0; i < inside.length; i += step) points.push(inside[i]);
      } else {
        const step = Math.max(1, Math.floor(pos.count / perMesh));
        for (let i = 0; i < pos.count; i += step) points.push(new T.Vector3().fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld));
      }
    }
    return points;
  };
  /** A neighbour that stands between the camera and the yellow target turns half transparent so the target stays visible. */
  const targetPoints = () => samplePoints(32);
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

  /** Brain quiz: a structure that lies in front of a deep target is drawn as faint glass and cannot be picked, so the target is in view (rules: app/quiz/brain.ts). */
  const isCover = (structure: QuizStructure) => catalogue.region === 'brain' && !!state && structure.id !== state.target.id && coversBrainTarget(state.target, structure);
  const BRAIN_GLASS = .09;

  const applyAppearance = () => {
    if (!state) return;
    const hidden = new Set(state.hidden), naming = state.mode === 'name', clarity = state.clarity ?? .45;
    for (const mesh of meshes.values()) {
      const structure = byId.get(mesh.userData.structureId)!;
      const isTarget = targetIds.has(structure.id), space = isSpace();
      const shade = naming && !isTarget ? neighbourShade(state.highlightIds, structure.id) : undefined, isNeighbour = !!shade;
      const isAnswer = !naming && state.answered && isTarget;
      const isWrong = !naming && state.answered && structure.id === state.pickedId && !isAnswer;
      // A space question draws its members and their neighbours alike until the question is answered (a faded neighbour would give the answer away); levels 2 and 3 fade every non-member.
      const isContext = space ? naming && !isTarget : structure.system !== state.target.system;
      // the muscle a tendon was cut from is always drawn with it (faint, like the other context), so the tendon is never a loose fragment
      const isOwner = state.target.system === 'tendon' && structure.system === 'muscular' && ownerMuscleNames(state.target.name).includes(structure.name);
      mesh.visible = allowed.has(structure.id) && (naming ? (!state.only || isTarget || isNeighbour || isOwner) : (state.answered || !hidden.has(structure.id) || isOwner)) && (!isContext || state.context || isTarget || isNeighbour || isOwner);
      const base = QUIZ_SYSTEMS.find(s => s.id === structure.system)!.color;
      const material = mesh.material;
      const lit = isAnswer || isWrong || (naming && (isTarget || isNeighbour));
      const fill = isAnswer ? FEEDBACK.correct.fill : isWrong ? FEEDBACK.wrong.fill : naming && isTarget ? FEEDBACK.target.fill : shade ? shade.fill : keyboardId === structure.id ? '#5aa9e6' : base;
      // A neighbour is a pale blue wash over the structure's own colour, so its light, shade and fibre texture stay visible.
      if (shade) material.color.set(base).lerp(new T.Color(shade.fill), NEIGHBOUR_TINT); else material.color.set(fill);
      // The emissive term keeps the light and shade of the surface: the yellow is a tint, not a flat fill.
      material.emissive.set(lit ? fill : '#000000');
      material.emissiveIntensity = naming && isTarget ? .16 : isNeighbour ? .06 : isAnswer || isWrong ? .08 : 0;
      const glass = isCover(structure) && !isNeighbour;
      material.opacity = glass ? BRAIN_GLASS : naming ? (isNeighbour ? (hidesTarget(mesh) ? .5 : 1) : isTarget ? 1 : isContext ? .06 + .34 * clarity : .12 + .6 * clarity)
        : isAnswer && space ? 1 : isAnswer || isWrong ? .85 : isContext ? .2 : state.answered ? .16 : 1;
      // The highlight of a space member is strongest near the space (see setSpaceFade); the question itself (nothing answered yet in level 1) shows the members like any other structure.
      const fades = space && isTarget && (naming || state.answered);
      if (fades) {
        const b = state.target.bounds, half = (b[1][0] - b[0][0]) / 2;
        setSpaceFade(material, {centre: new T.Vector3((b[0][0] + b[1][0]) / 2, (b[0][1] + b[1][1]) / 2, (b[0][2] + b[1][2]) / 2), inner: half * .4, outer: half, far: new T.Color(fill).lerp(new T.Color('#ffffff'), .38)});
      } else setSpaceFade(material, null);
      // Outline shell around the answer, the wrong pick, the level-2 target and a clicked neighbour (shares the mesh geometry).
      let shell = mesh.userData.outline as T.Mesh<T.BufferGeometry, T.ShaderMaterial> | undefined;
      if (lit) {
        if (!shell) {shell = new T.Mesh(mesh.geometry, outlineMaterial(FEEDBACK.correct.edge)); shell.renderOrder = 3; mesh.add(shell); mesh.userData.outline = shell;}
        shell.material.uniforms.color.value.set(isAnswer ? FEEDBACK.correct.edge : isWrong ? FEEDBACK.wrong.edge : shade ? shade.edge : FEEDBACK.target.edge);
        shell.material.uniforms.width.value = naming && !isNeighbour ? .0009 : .0004;
        // A neighbour's thin blue line is depth tested, so it only edges the structure and never paints over its pale surface.
        shell.material.depthTest = !isNeighbour;
        shell.visible = mesh.visible;
      } else if (shell) shell.visible = false;
      // The feedback meshes join the transparent pass (sorted last by renderOrder) so faint context anatomy never washes their colour out.
      // The members of a space are solid in the answer (the faded neighbours already let them show), so the boundaries and contents keep their depth order instead of blending into one patch.
      const solidSpace = isAnswer && space;
      const transparent = material.opacity < 1 || ((isAnswer && !solidSpace) || isWrong), depthWrite = material.opacity === 1 && (!isAnswer || solidSpace) && !isWrong;
      // Correct/wrong overlays remain visible even behind an outer muscle; the level-2 target keeps its depth, so a view where it is hidden stays hidden.
      const depthTest = naming || solidSpace || (!isAnswer && !isWrong);
      // Only a change of render state needs the material revalidated; doing it for every mesh on every update made each tap re-check hundreds of programs.
      const stateChanged = material.transparent !== transparent || material.depthWrite !== depthWrite || material.depthTest !== depthTest;
      material.transparent = transparent; material.depthWrite = depthWrite; material.depthTest = depthTest;
      mesh.renderOrder = isAnswer || (naming && isTarget) ? 5 : isWrong || isNeighbour ? 4 : isContext || glass ? 0 : 1;
      if (stateChanged) material.needsUpdate = true;
    }
    canvas.style.cursor = naming ? 'grab' : state.peeling ? 'crosshair' : 'grab';
    dirty = true;
  };

  /** Level 2: a random direction from which at least half of the target can be seen. Points on the target are tested with rays from the camera; only solid structures hide it. */
  const chooseDirection = (box: T.Box3, random: () => number = Math.random, avoid?: T.Vector3): T.Vector3 => {
    scene.updateMatrixWorld(true);
    const points = samplePoints(48);
    const centre = box.getCenter(new T.Vector3()), size = box.getSize(new T.Vector3()).length() * .75 + .05;
    const occluders = [...meshes.values()].filter(m => m.visible && !targetIds.has(m.userData.structureId) && (m.material as T.MeshStandardMaterial).opacity >= .8);
    scene.updateMatrixWorld(true);
    const directions: T.Vector3[] = [];
    for (const elevation of [0, 25, -20, 50]) for (let k = 0; k < 12; k++) {
      const az = (k / 12) * Math.PI * 2 + random() * .4, el = (elevation + (random() - .5) * 14) * Math.PI / 180;
      directions.push(new T.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)));
    }
    for (let i = directions.length - 1; i > 0; i--) {const j = Math.floor(random() * (i + 1)); [directions[i], directions[j]] = [directions[j], directions[i]];}
    // a direction too close to the one to avoid is not offered (round 3 of a lesson looks from somewhere else)
    if (avoid) for (let i = directions.length - 1; i >= 0; i--) if (directions[i].dot(avoid) > .5) directions.splice(i, 1);
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

  /** Lesson rounds 1 and 2 use the direction of the seed; round 3 uses another seed and refuses directions near the first one, so the same structure is seen from a different side. */
  const lessonDirection = (box: T.Box3, lesson: {seed: string; apart: boolean}): T.Vector3 => {
    const first = chooseDirection(box, seededRandom(lesson.seed));
    return lesson.apart ? chooseDirection(box, seededRandom(`${lesson.seed}#apart`), first) : first;
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
    if (view === 'random') direction = state.lesson ? lessonDirection(box, state.lesson) : chooseDirection(box);
    if (view === 'front') direction.set(0, .04, 1).normalize();
    if (view === 'back') direction.set(0, .04, -1).normalize();
    // lung quiz: the inner (mediastinal) face of the lung the question is about; a structure on both sides follows the side chosen on the setup page
    if (view === 'medial') direction.set((state.target.side === 'midline' ? state.side === 'left' : state.target.side === 'left') ? -1 : 1, .03, .02).normalize();
    if (view === 'top') direction.set(0, 1, .02).normalize();
    if (view === 'bottom') direction.set(0, -1, .02).normalize();
    // a space opens its answer from the direction the layer panel looks at it from (SpaceDef.look: outward, up, front), mirrored for the left side
    if (view === 'answer' && state.target.space) {
      const look = SPACES.find(d => d.id === state!.target.space!.id)?.look;
      if (look) direction.set(look[0] * (state.target.side === 'left' ? 1 : -1), look[1], look[2]).normalize();
    }
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
      try {buffer = await fetchModelBuffer(url(pack.gzip), pack.bytes, true, controller.signal);}
      catch (error) {
        if (controller.signal.aborted) throw error;
        buffer = await fetchModelBuffer(url(pack.url), pack.bytes, false, controller.signal);
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
    targetIds = new Set([next.target.id, ...(next.target.space?.members.map(m => m.id) ?? [])]);
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

  // A space question can be answered by tapping any structure of the scene: the members of the space are right, every other structure is wrong.
  const selectable = () => [...meshes.values()].filter(m => m.visible && (isSpace() || byId.get(m.userData.structureId)!.system === state?.target.system) && !isCover(byId.get(m.userData.structureId)!));
  const pickAt = (clientX: number, clientY: number, touch: boolean) => {
    if (!state || state.answered || !ready || state.mode === 'name') return;
    const rect = canvas.getBoundingClientRect(), candidates = selectable();
    camera.updateMatrixWorld(); scene.updateMatrixWorld(true);
    // Pixel tolerance assists thin nerves on touch screens; every candidate
    // uses the same rays. Never bias a hit towards the correct answer.
    const offsets = [[0, 0], ...[4, 8, ...(touch ? [12] : [])].flatMap(d => [[d, 0], [-d, 0], [0, d], [0, -d]])];
    for (const [dx, dy] of offsets) {
      raycaster.setFromCamera(new T.Vector2(((clientX + dx - rect.left) / rect.width) * 2 - 1, 1 - ((clientY + dy - rect.top) / rect.height) * 2), camera);
      const hits = raycaster.intersectObjects(candidates, false);
      if (hits.length) {
        // Where structures overlap on the ray the smallest one within 1.2 cm of the nearest surface wins, so a leaflet or a papillary muscle can be picked inside the chamber or valve that surrounds it.
        const near = hits.filter(h => h.distance <= hits[0].distance + .012);
        const volume = (id: string) => {const b = byId.get(id)!.bounds; return Math.max((b[1][0] - b[0][0]) * (b[1][1] - b[0][1]) * (b[1][2] - b[0][2]), 1e-12);};
        const best = near.reduce((a, h) => volume(h.object.userData.structureId) < volume(a.object.userData.structureId) ? h : a, near[0]);
        callbacks.pick(best.object.userData.structureId); return;
      }
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
