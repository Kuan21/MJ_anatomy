import * as T from 'three';
import {createBrainViewer} from '../organ/brain-viewer';
import type {BrainPart} from '../organ/brain-types';
import {framingDistance} from '../camera-framing';
import {loadEarGeometries} from './ear-geometry';
import {tubeCentreline, type V3} from './geometry-analysis';
import {PULSE_CYCLE_S, PULSE_LEGS, pulseAt, type PulseLegId} from './hearing-data';
import {LabelLayer, type LabelSpec} from './label-layer';

interface Callbacks {progress: (percent: number) => void; ready: () => void; error: (message: string) => void}

/** Where the schematic (示意) stations of the auditory pathway lie, in the brain model's own frame (metres; +x to the body's left, +y up, +z front; the stimulated ear is the right one, so
 *  its side is −x). The brain model has the inferior colliculus, the medial geniculate body, the acoustic radiation and the transverse temporal gyrus as meshes; the cochlear nuclei, the superior
 *  olivary nuclei, the trapezoid body and the lateral lemniscus are drawn as dots and tubes from the public descriptions of where they lie (pontomedullary junction, caudal pons, along the
 *  lateral edge of the pontine tegmentum to the colliculus). Positions are estimates: the user checks them. */
export const AUDITORY_STATIONS = {
  cochlearNucleus: [.0108, 1.5815, -.0128] as V3,
  olive: [.0062, 1.5885, -.0042] as V3,
  lemniscusMid: [[.0092, 1.5955, -.0078], [.0104, 1.6025, -.0125]] as V3[],
  trapezoidMid: [0, 1.5875, -.0036] as V3,
};
const SCHEMATIC = '#d2b25f', LIT = '#f2b705';
/** structures drawn lit: model name (as in the brain catalogue) → both sides */
const LIT_NAMES = ['Inferior colliculus', 'Medial geniculate body', 'Transverse temporal gyri', 'Acoustic radiation'];
const KEEP_FAINT = /^(brainstem|diencephalon)$/, CORTEX = /^(frontal|parietal|temporal|occipital|limbic|insula|interlobar|cortex-other)$/;

const V = (p: V3, side: 1 | -1) => new T.Vector3(p[0] * side, p[1], p[2]);

/** The auditory pathway in the brain (step 6): the loaded brain model as glass, the stations it has lit, schematic dots and tubes for those it lacks, and a pulse that runs along the path. */
export function createHearingBrain(host: HTMLElement, callbacks: Callbacks) {
  const holder = document.createElement('div'); holder.className = 'hear-brain-host'; host.appendChild(holder);
  const labels = new LabelLayer(host);
  let disposed = false, ready = false, clock = 0, drive: (() => void) | null = null, release: (() => void) | null = null, flight: {from: {pos: T.Vector3; tgt: T.Vector3}; to: {pos: T.Vector3; tgt: T.Vector3}; start: number; ms: number} | null = null;
  const viewer = createBrainViewer(holder, {
    progress: p => callbacks.progress(p), busy: () => {}, pick: () => {}, error: m => callbacks.error(m),
    ready: parts => {if (!disposed) void setup(parts);},
  });

  const smooth = (k: number) => k * k * (3 - 2 * k);
  const lights: {mesh: T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>; leg: PulseLegId; base: number}[] = [];
  const legs: {id: PulseLegId; curve: T.CatmullRomCurve3; tube: T.Mesh<T.TubeGeometry, T.MeshStandardMaterial>; ball: T.Mesh; t0: number}[] = [];
  let specs: LabelSpec[] = [], aim: {pos: T.Vector3; tgt: T.Vector3} | null = null;

  async function setup(parts: BrainPart[]) {
    // a quiet picture: no selection, no cut; the cortex is glass (the viewer's own glass mode), everything else is switched on or off by hand below
    viewer.update({hiddenGroups: [], hiddenParts: [], peel: 0, isolate: null, selectedIds: [], glass: true, section: {axis: 'none', offset: .5, flip: false}, command: {id: 1, view: 'right'}});
    const api = viewer.hearing(); if (!api) return;
    const {scene, camera, controls, meshes} = api;
    const byName = (en: string, side?: 'left' | 'right') => parts.filter(p => p.en === en && (!side || p.side === side));
    const litIds = new Set(LIT_NAMES.flatMap(n => byName(n).map(p => p.id)));
    for (const [id, mesh] of meshes) {
      const p = parts.find(x => x.id === id)!, m = mesh.material;
      if (litIds.has(id)) {
        mesh.visible = true; m.transparent = false; m.opacity = 1; m.depthWrite = true; m.color.set(LIT); m.emissive.set(LIT); m.emissiveIntensity = .2; m.roughness = .5; mesh.renderOrder = 4;
      } else if (CORTEX.test(p.group)) {
        mesh.visible = p.group !== 'interlobar'; m.opacity = .09; m.transparent = true; m.depthWrite = false; mesh.renderOrder = 1;
      } else if (KEEP_FAINT.test(p.group)) {
        mesh.visible = true; m.transparent = true; m.opacity = .2; m.depthWrite = false; m.color.set('#cfc2b4'); mesh.renderOrder = 1;
      } else mesh.visible = false;
    }
    // the cochlear nerve is the ear's own mesh (the same coordinates as the brain), so the pathway starts where the ear ends
    const ear = await loadEarGeometries(); if (disposed) return;
    const nerveGeo = ear.get('cochlear-nerve'), scalaPos = ear.get('scala-tympani');
    let nerveEnd: V3 = [-.0146, 1.59, -.015], nerveStart: V3 = [-.032, 1.585, -.008];
    if (nerveGeo && scalaPos) {
      const c = scalaPos.boundingBox!.getCenter(new T.Vector3()), line = tubeCentreline(nerveGeo.getAttribute('position').array, nerveGeo.getIndex()!.array, [c.x, c.y, c.z], 24);
      nerveStart = line.points[0]; nerveEnd = line.points[line.points.length - 1];
      const mat = new T.MeshStandardMaterial({color: LIT, emissive: LIT, emissiveIntensity: .2, roughness: .5, side: T.DoubleSide});
      const nerve = new T.Mesh(nerveGeo, mat); nerve.renderOrder = 4; scene.add(nerve);
      lights.push({mesh: nerve, leg: 'nerve', base: .2});
    }
    const S = AUDITORY_STATIONS, R = -1 as const, L = 1 as const;
    const ic = (s: 1 | -1) => meshes.get(byName('Inferior colliculus', s < 0 ? 'right' : 'left')[0]?.id)?.geometry.boundingBox?.getCenter(new T.Vector3()) ?? V([.0073, 1.6083, -.0162], s);
    const mgb = (s: 1 | -1) => meshes.get(byName('Medial geniculate body', s < 0 ? 'right' : 'left')[0]?.id)?.geometry.boundingBox?.getCenter(new T.Vector3()) ?? V([.0253, 1.6241, -.0211], s);
    const a1 = (s: 1 | -1) => meshes.get(byName('Transverse temporal gyri', s < 0 ? 'right' : 'left')[0]?.id)?.geometry.boundingBox?.getCenter(new T.Vector3()) ?? V([.0463, 1.633, -.0112], s);
    const cn = (s: 1 | -1) => V(S.cochlearNucleus, s), soc = (s: 1 | -1) => V(S.olive, s);
    const lemniscus = (s: 1 | -1) => [soc(s), ...S.lemniscusMid.map(p => V(p, s)), ic(s)];
    const path: Record<PulseLegId, T.Vector3[]> = {
      nerve: [new T.Vector3(...nerveStart), new T.Vector3(...nerveEnd), cn(R)],
      'cn-to-soc-same': [cn(R), cn(R).clone().lerp(soc(R), .5).add(new T.Vector3(0, -.0006, .0014)), soc(R)],
      'cn-to-soc-cross': [cn(R), cn(R).clone().lerp(V(S.trapezoidMid, 1), .5).add(new T.Vector3(0, -.0004, .0018)), V(S.trapezoidMid, 1), V(S.trapezoidMid, 1).clone().lerp(soc(L), .5).add(new T.Vector3(0, -.0004, .0012)), soc(L)],
      'soc-to-ic-same': lemniscus(R), 'soc-to-ic-cross': lemniscus(L),
      'ic-to-mgb-same': [ic(R), ic(R).clone().lerp(mgb(R), .5).add(new T.Vector3(0, .0014, -.0016)), mgb(R)], 'ic-to-mgb-cross': [ic(L), ic(L).clone().lerp(mgb(L), .5).add(new T.Vector3(0, .0014, -.0016)), mgb(L)],
      'mgb-to-a1-same': [mgb(R), mgb(R).clone().lerp(a1(R), .5).add(new T.Vector3(0, -.0015, -.0042)), a1(R)], 'mgb-to-a1-cross': [mgb(L), mgb(L).clone().lerp(a1(L), .5).add(new T.Vector3(0, -.0015, -.0042)), a1(L)],
    };
    // schematic stations: dots (nuclei) and tubes (the tracts between them); the real meshes keep their own look
    const group = new T.Group(); scene.add(group);
    const schematicMat = () => new T.MeshStandardMaterial({color: SCHEMATIC, emissive: SCHEMATIC, emissiveIntensity: .15, roughness: .6, side: T.DoubleSide});
    const dot = (p: T.Vector3, radius: number, leg: PulseLegId) => {
      const m = new T.Mesh(new T.SphereGeometry(radius, 20, 14), schematicMat()); m.position.copy(p); m.renderOrder = 5; group.add(m); lights.push({mesh: m, leg, base: .15});
    };
    const nuclei: [T.Vector3, PulseLegId][] = [[cn(R), 'nerve'], [cn(L), 'cn-to-soc-cross'], [soc(R), 'cn-to-soc-same'], [soc(L), 'cn-to-soc-cross']];
    for (const [p, leg] of nuclei) dot(p, .0013, leg);
    const REAL: PulseLegId[] = ['nerve', 'ic-to-mgb-same', 'ic-to-mgb-cross', 'mgb-to-a1-same', 'mgb-to-a1-cross'];
    for (const leg of PULSE_LEGS) {
      const curve = new T.CatmullRomCurve3(path[leg.id], false, 'centripetal'), ball = new T.Mesh(new T.SphereGeometry(.0013, 16, 12), new T.MeshBasicMaterial({color: '#ff7a00'}));
      ball.renderOrder = 8; ball.visible = false; group.add(ball);
      // the path of every leg is a thin tube: schematic tracts (trapezoid body, lateral lemniscus) are the thicker ochre ones, the legs that follow a real mesh are drawn thin
      const radius = REAL.includes(leg.id) ? .00028 : .0007, tube = new T.Mesh(new T.TubeGeometry(curve, 60, radius, 8, false), schematicMat()); tube.renderOrder = 5; group.add(tube);
      legs.push({id: leg.id, curve, tube, ball, t0: leg.t0});
    }
    for (const lg of legs) lights.push({mesh: lg.tube, leg: lg.id, base: .15});
    for (const id of litIds) {
      const p = parts.find(x => x.id === id)!, leg: PulseLegId = /Inferior/.test(p.en) ? (p.side === 'right' ? 'soc-to-ic-same' : 'soc-to-ic-cross') : /Medial/.test(p.en) ? (p.side === 'right' ? 'ic-to-mgb-same' : 'ic-to-mgb-cross') : /Acoustic/.test(p.en) || /Transverse/.test(p.en) ? (p.side === 'right' ? 'mgb-to-a1-same' : 'mgb-to-a1-cross') : 'nerve';
      lights.push({mesh: meshes.get(id)!, leg, base: .2});
    }
    // labels: the right-hand chain, the midline crossing and the cortex of the left side
    const mid = (a: T.Vector3, b: T.Vector3) => a.clone().lerp(b, .5);
    const lab = (key: string, en: string, zh: string, at: () => T.Vector3 | null, o: Partial<LabelSpec> = {}) => ({key, en, zh, at, ...o});
    specs = [
      lab('cn8', 'Cochlear nerve (CN VIII)', '耳蝸神經', () => mid(path.nerve[0], path.nerve[1]), {dx: 60, dy: 80}),
      lab('cn', 'Cochlear nuclei', '耳蝸核', () => cn(R), {schematic: true, dx: -150, dy: -30}),
      lab('soc', 'Superior olivary nucleus', '上橄欖核', () => soc(R), {schematic: true, dx: 70, dy: 36}),
      lab('trap', 'Trapezoid body', '斜方體（交叉）', () => V(S.trapezoidMid, 1), {schematic: true, dx: 40, dy: 50}),
      lab('ll', 'Lateral lemniscus', '外側丘系', () => V(S.lemniscusMid[0], R), {schematic: true, dx: -150, dy: 24}),
      lab('ic', 'Inferior colliculus', '下丘（中腦）', () => ic(R), {dx: -140, dy: -20}),
      lab('mgb', 'Medial geniculate body', '內側膝狀體（視丘）', () => mgb(R), {dx: -150, dy: -50}),
      lab('ar', 'Acoustic radiation', '聽放射', () => mid(mgb(L), a1(L)), {dx: 30, dy: -40}),
      lab('a1', 'Primary auditory cortex', '初級聽覺皮質（顳橫回，41 區）', () => a1(L), {dx: 20, dy: -60}),
    ];
    // camera: the whole path, seen from the right-hand side above and behind
    const box = new T.Box3(); for (const l of legs) box.expandByPoint(l.curve.getPoint(0)).expandByPoint(l.curve.getPoint(1)); box.expandByPoint(a1(L)).expandByPoint(a1(R));
    const dir = new T.Vector3(-.55, .62, -.55).normalize(), centre = box.getCenter(new T.Vector3()), pad = new T.Box3(box.min.clone().addScalar(-.01), box.max.clone().addScalar(.01));
    aim = {tgt: centre, pos: centre.clone().addScaledVector(dir, framingDistance(pad, dir, camera.fov, camera.aspect, .8, .8, .08))};
    ready = true; callbacks.ready();
    labels.set(visibleNow ? specs : []);

    release = api.onFrame(() => {
      if (!visibleNow) return;
      if (flight) {
        const k = Math.min(1, (performance.now() - flight.start) / flight.ms), e = smooth(k);
        camera.position.lerpVectors(flight.from.pos, flight.to.pos, e); controls.target.lerpVectors(flight.from.tgt, flight.to.tgt, e); if (k >= 1) flight = null;
      }
      drive?.();
      const rect = holder.getBoundingClientRect(), v = new T.Vector3();
      labels.update(p => {v.copy(p).project(camera); return v.z > 1 ? null : {x: (v.x + 1) / 2 * rect.width, y: (1 - v.y) / 2 * rect.height};}, rect.width, rect.height);
      api.invalidate();
    });
    drive = () => {
      for (const lg of legs) {
        const u = pulseAt(clock, lg.t0);
        lg.ball.visible = u !== null;
        if (u !== null) lg.ball.position.copy(lg.curve.getPointAt(u));
      }
      // a station glows for a moment after the pulse has reached it
      for (const l of lights) {
        const leg = PULSE_LEGS.find(x => x.id === l.leg)!, since = (((clock - leg.t0 - .5) % PULSE_CYCLE_S) + PULSE_CYCLE_S) % PULSE_CYCLE_S;
        l.mesh.material.emissiveIntensity = l.base + .85 * Math.exp(-since / .9);
      }
    };
  }
  let visibleNow = false;

  return {
    get ready() {return ready;},
    /** `visible`: the pathway step is the current one. The brain keeps loading in the background before that, so the step opens at once. */
    tick(t: number, visible: boolean) {
      clock = t;
      if (visible !== visibleNow) {
        visibleNow = visible;
        holder.style.opacity = visible ? '1' : '0'; holder.style.pointerEvents = visible ? 'auto' : 'none';
        labels.set(visible && ready ? specs : []);
        const api = viewer.hearing();
        if (visible && api && aim) {
          // the camera starts from the ear's side, a little way in, and glides to the full path
          const from = {pos: aim.pos.clone().add(new T.Vector3(-.08, -.03, .06)), tgt: aim.tgt.clone().add(new T.Vector3(-.02, -.015, .01))};
          api.camera.position.copy(from.pos); api.controls.target.copy(from.tgt);
          flight = {from, to: aim, start: performance.now(), ms: 1800};
        }
      }
    },
    get canvas() {return viewer.canvas;},
    dispose() {disposed = true; release?.(); labels.dispose(); viewer.dispose(); holder.remove();},
  };
}
