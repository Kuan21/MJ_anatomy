import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {framingDistance} from '../camera-framing';
import {fetchModelBuffer} from '../model-download';
import {indexArray, normalArray, positionArray, type PackedPart} from '../stream-geometry';
import type {LabelSpec} from '../ear-hearing/label-layer';
import {SideLabels} from './side-labels';
import {tubeCentreline, type V3} from '../ear-hearing/geometry-analysis';
import {PATH_MARKS, poseAt, type SwallowPose, type SwallowStep} from './swallow-data';
import {MOVE, pickSwallowParts, type SwallowRole} from './swallow-parts';
import {bottomAt, midline, pharynxPath, softPalateBand, topAt, type P} from './swallow-geometry';

type StepId = SwallowStep['id'];
interface Callbacks {progress: (percent: number) => void; ready: () => void; error: (message: string) => void}
interface StreamPart extends PackedPart {id: string; name: string; chunk: number}
interface StreamManifest {parts: StreamPart[]; chunks: {url: string; gzip: string; bytes: number; gzipBytes?: number}[]}

const COLOUR: Record<SwallowRole, string> = {
  tongue: '#c9706c', 'palate-muscle': '#b5473d', 'constrictor-1': '#b5473d', 'constrictor-2': '#b5473d', 'constrictor-3': '#b5473d', 'pharynx-other': '#b9675d',
  hyoid: '#efe6cf', larynx: '#a9c6d4', epiglottis: '#9cc3d8', suprahyoid: '#b9564a', infrahyoid: '#b9564a', oesophagus: '#d58b80', trachea: '#cfdde3', bone: '#e9e1cf',
};
const ACTIVE = new T.Color('#ff5a2c'), SCHEMATIC = '#d2b25f', BOLUS = '#8a5a2b';
const smooth = (k: number) => {const x = Math.min(1, Math.max(0, k)); return x * x * (3 - 2 * x);};

/** Camera per step: a midsagittal section seen from the left (the right half is drawn, cut at the midline), framing the mouth and pharynx or the whole oesophagus. */
const VIEWS: Record<StepId, {yLow: number; yHigh: number; fill: number}> = {
  oral: {yLow: 1.49, yHigh: 1.58, fill: .9}, pharyngeal: {yLow: 1.44, yHigh: 1.58, fill: .9}, oesophageal: {yLow: 1.18, yHigh: 1.58, fill: .92}, whole: {yLow: 1.36, yHigh: 1.58, fill: .9},
};

/** The swallow in 3D: the atlas meshes of the mouth, pharynx, larynx and oesophagus (the same package files as the main atlas), cut at the midline and moved by the time line of
 *  swallow-data.ts. The soft palate and the bolus are schematic (示意): the atlas has the palatal muscles but no soft palate of its own. */
/** `gutters`: the stage that holds the canvas host and the two label columns beside it (labels are never drawn over the canvas). */
export function createSwallowScene(host: HTMLElement, callbacks: Callbacks, gutters: {stage: HTMLElement; left: HTMLElement; right: HTMLElement}) {
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(30, 1, .005, 5);
  const renderer = new T.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); renderer.setClearColor('#cbd2d6', 0);
  renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  renderer.localClippingEnabled = true;
  const canvas = renderer.domElement; canvas.className = 'hear-canvas'; canvas.style.touchAction = 'none';
  canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', '吞嚥 3D 動畫（正中矢狀切面，從左側看右半）。拖曳旋轉，滾輪或雙指縮放。');
  host.appendChild(canvas);
  // the moving part of the picture (soft palate, bolus, epiglottis, hyoid, constrictors): labels go to the side whose leader crosses less of it
  const movingZone = () => {
    if (!ready) return null;
    const box = new T.Box3(), r = host.getBoundingClientRect(), q = new T.Vector3();
    for (const it of items) if (/^constrictor|^epiglottis$|^hyoid$/.test(it.role) && it.mesh.geometry.boundingBox) box.union(it.mesh.geometry.boundingBox);
    if (palate) box.expandByObject(palate);
    if (bolus) box.expandByPoint(bolus.position);
    if (box.isEmpty()) return null;
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < 8; i++) {q.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(camera); const x = (q.x + 1) / 2 * r.width; lo = Math.min(lo, x); hi = Math.max(hi, x);}
    return {left: lo, right: hi};
  };
  const labels = new SideLabels(gutters.stage, gutters.left, gutters.right, host, movingZone);
  const controls = new OrbitControls(camera, canvas); controls.enableDamping = true; controls.dampingFactor = .15; controls.minDistance = .05; controls.maxDistance = 1.5;
  scene.add(new T.HemisphereLight('#ffffff', '#7b8e9c', 2.1));
  const key = new T.DirectionalLight('#fff6e6', 2.3); key.position.set(3, 2, 2); scene.add(key);
  const fill = new T.DirectionalLight('#a8c8e3', 1.2); fill.position.set(1, -1, -3); scene.add(fill);
  /** keeps x ≤ 0.4 mm: the right half and the midline */
  const cut = new T.Plane(new T.Vector3(-1, 0, 0), .0004);

  interface Item {mesh: T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>; role: SwallowRole; name: string; base: Float32Array; weight?: Float32Array; u?: Float32Array; /** tongue: how far each vertex may rise before the dorsum meets the hard palate */ gap?: Float32Array}
  const items: Item[] = [];
  let disposed = false, ready = false, step: StepId = 'whole', tween: {from: {pos: T.Vector3; tgt: T.Vector3}; to: {pos: T.Vector3; tgt: T.Vector3}; start: number; ms: number} | null = null;
  const abort = new AbortController();
  // landmarks, measured from the loaded meshes
  const L = {hinge: new T.Vector3(), uvulaTip: new T.Vector3(), epiPivot: new T.Vector3(), tongue: new T.Box3(), lumenZ: 0, oesophagus: [] as V3[], nasopharynx: new T.Vector3(), inlet: new T.Vector3(), hyoid: new T.Vector3()};
  let palate: T.Group | null = null, bolus: T.Mesh | null = null, bolusPath: {pharynx: T.CatmullRomCurve3; widths: number[]; oesophagus: T.CatmullRomCurve3} | null = null;
  /** midline outlines measured once: top of the tongue, underside of the hard palate */
  let tongueTop: (z: number) => number = () => 0, palateBottom: (z: number) => number | null = () => null, tongueBackZ = 0, tongueFrontZ = 0;
  const BOLUS_R = .0055;

  void (async () => {
    try {
      const base = import.meta.env.BASE_URL, url = (p: string) => base + p.replace(/^\//, '');
      const manifest = JSON.parse(new TextDecoder().decode(await fetchModelBuffer(`${base}models/atlas-stream.json.gz`, 0, true, abort.signal))) as StreamManifest;
      const chosen = pickSwallowParts(manifest.parts), chunks = [...new Set(chosen.map(p => p.chunk))];
      let done = 0;
      const buffers = new Map<number, ArrayBuffer>();
      await Promise.all(chunks.map(async c => {
        const ch = manifest.chunks[c];
        let buf: ArrayBuffer;
        try {buf = await fetchModelBuffer(url(ch.gzip), ch.bytes, true, abort.signal);} catch (e) {if (abort.signal.aborted) throw e; buf = await fetchModelBuffer(url(ch.url), ch.bytes, false, abort.signal);}
        buffers.set(c, buf); done++; callbacks.progress(Math.round(done / chunks.length * 100));
      }));
      if (disposed) return;
      for (const p of chosen) {
        const buf = buffers.get(p.chunk)!, g = new T.BufferGeometry(), pos = positionArray(buf, p);
        g.setAttribute('position', new T.BufferAttribute(pos, 3));
        g.setAttribute('normal', new T.BufferAttribute(normalArray(buf, p), 3, true));
        g.setIndex(new T.BufferAttribute(indexArray(buf, p), 1)); g.computeBoundingBox();
        const bone = p.role === 'bone';
        const m = new T.Mesh(g, new T.MeshStandardMaterial({color: COLOUR[p.role], roughness: .65, metalness: 0, side: T.DoubleSide, clippingPlanes: [cut], transparent: bone, opacity: bone ? .55 : 1, depthWrite: !bone}));
        m.renderOrder = bone ? 2 : 1; scene.add(m);
        items.push({mesh: m, role: p.role, name: p.name, base: pos.slice()});
      }
      setup(); ready = true; flyTo(step, true); labels.set(labelSpecs()); callbacks.ready();
    } catch {if (!disposed) callbacks.error('吞嚥動畫的模型未能載入，請重新載入。');}
  })();

  const boxOf = (test: (i: Item) => boolean) => {const b = new T.Box3(); for (const i of items) if (test(i)) b.union(i.mesh.geometry.boundingBox!); return b;};
  /** vertices of the matching items, near the midline */
  const midVerts = (test: (i: Item) => boolean, within = .008) => {const out: T.Vector3[] = []; for (const i of items) if (test(i)) for (let k = 0; k < i.base.length; k += 3) if (Math.abs(i.base[k]) < within) out.push(new T.Vector3(i.base[k], i.base[k + 1], i.base[k + 2])); return out;};

  function setup() {
    const tongue = boxOf(i => i.name === 'Tongue'); L.tongue.copy(tongue);
    // posterior edge of the hard palate: the hindmost point of the palatine bones near the midline
    // only the horizontal plate (the lowest few millimetres of the palatine bones near the midline): the perpendicular plate reaches up to the orbit
    const palatine = midVerts(i => /palatine bone/.test(i.name), .012), low = Math.min(...palatine.map(v => v.y)), horizontal = palatine.filter(v => v.y < low + .005);
    const hinge = horizontal.reduce((a, b) => (b.z < a.z ? b : a), horizontal[0] ?? new T.Vector3(0, 1.555, .03)); L.hinge.set(0, hinge.y, hinge.z);
    const uvula = boxOf(i => i.name === 'Uvular muscle');
    L.uvulaTip.set(0, uvula.isEmpty() ? hinge.y - .02 : uvula.min.y, uvula.isEmpty() ? hinge.z - .012 : (uvula.min.z + uvula.max.z) / 2);
    const epi = items.find(i => i.name === 'Epiglottis'); const epiBox = epi?.mesh.geometry.boundingBox ?? new T.Box3();
    L.epiPivot.set(0, epiBox.min.y, (epiBox.min.z + epiBox.max.z) / 2 + .002);
    L.hyoid.copy(boxOf(i => i.role === 'hyoid').getCenter(new T.Vector3()));
    // the pharynx lumen: halfway between the back of the tongue and the posterior wall (midline of the constrictors)
    const wall = midVerts(i => i.role.startsWith('constrictor') || i.name === 'Pharyngeal raphe', .006), wallZ = wall.length ? wall.reduce((s, v) => s + v.z, 0) / wall.length : tongue.min.z - .02;
    L.lumenZ = (tongue.min.z + wallZ) / 2;
    L.nasopharynx.set(0, hinge.y + .008, (hinge.z + wallZ) / 2);
    const aryt = boxOf(i => /arytenoid/.test(i.name)), thyroid = boxOf(i => i.name === 'Thyroid cartilage');
    L.inlet.set(0, aryt.isEmpty() ? epiBox.min.y : aryt.max.y + .003, aryt.isEmpty() ? epiBox.min.z : (aryt.max.z + thyroid.max.z) / 2);
    // weights and shares for the deformations
    for (const it of items) {
      const n = it.base.length / 3, w = new Float32Array(n);
      if (it.role === 'tongue') for (let k = 0; k < n; k++) w[k] = smooth((it.base[k * 3 + 1] - (tongue.min.y + tongue.max.y) / 2) / ((tongue.max.y - tongue.min.y) / 2)); // dorsum
      if (it.role === 'suprahyoid' || it.role === 'pharynx-other' || it.role === 'constrictor-2' || it.role === 'constrictor-3' || it.role === 'trachea' || it.role === 'oesophagus') {
        const b = it.mesh.geometry.boundingBox!, span = Math.max(.01, b.max.y - b.min.y), reach = it.role === 'oesophagus' || it.role === 'trachea' ? .05 : span;
        for (let k = 0; k < n; k++) {
          const p = new T.Vector3(it.base[k * 3], it.base[k * 3 + 1], it.base[k * 3 + 2]);
          // how much of the hyoid–larynx movement a vertex takes: by distance from the hyoid (muscles), or from the top down (tubes below the larynx)
          w[k] = it.role === 'oesophagus' || it.role === 'trachea' ? 1 - smooth((b.max.y - p.y) / reach) : it.role === 'constrictor-3' ? .8 : 1 - smooth(p.distanceTo(L.hyoid) / (span * 1.1));
        }
      }
      it.weight = w;
      if (it.role === 'oesophagus') {
        const line = tubeCentreline(it.base, it.mesh.geometry.getIndex()!.array, [0, it.mesh.geometry.boundingBox!.max.y, 0], 64);
        it.u = line.u; L.oesophagus = line.points;
      }
    }
    // the schematic soft palate: a rounded plate from the back of the hard palate to the uvula (half of it, as it is cut at the midline)
    palate = new T.Group(); palate.position.copy(L.hinge); scene.add(palate);
    // at rest the soft palate slopes down and back from the hard palate at about 40° below the horizontal; its length is the distance to the uvula, kept within 2.5–3.5 cm
    const len = Math.min(.035, Math.max(.025, L.uvulaTip.distanceTo(L.hinge))), angle = Math.PI / 2 - 40 * Math.PI / 180;
    L.uvulaTip.copy(L.hinge).add(new T.Vector3(0, -Math.sin(40 * Math.PI / 180) * len, -Math.cos(40 * Math.PI / 180) * len));
    // a curved band with thickness, arched upward, tapering toward the uvula: its upper face is the floor of the nasopharynx, its lower face the roof of the oropharynx (not a cylinder)
    const band = softPalateBand(len, 40), shape = new T.BufferGeometry();
    shape.setAttribute('position', new T.BufferAttribute(band.positions, 3)); shape.setIndex(new T.BufferAttribute(band.index, 1)); shape.computeVertexNormals();
    const plate = new T.Mesh(shape, new T.MeshStandardMaterial({color: SCHEMATIC, roughness: .6, side: T.DoubleSide, clippingPlanes: [cut]}));
    void angle; palate.add(plate);
    const uv = items.find(i => i.name === 'Uvular muscle'); if (uv) {uv.mesh.removeFromParent(); uv.mesh.position.sub(L.hinge); palate.add(uv.mesh);}
    // the bolus (schematic) and its path: on the dorsum of the tongue in the mouth, then down the middle of the pharyngeal cavity, then the oesophagus
    const mid = (test: (i: Item) => boolean) => midline(items.filter(test).map(i => i.base));
    // the tongue mesh is coarse: its dorsum is read over a wider band; the hard palate only within 2 cm above the tongue (not the floor of the nose or the orbit)
    const tonguePts = midline(items.filter(i => i.name === 'Tongue').map(i => i.base), .012), palatePts = mid(i => /^(Left|Right) (maxilla|palatine bone)$/.test(i.name)).filter(q => q[1] > tongue.max.y - .004 && q[1] < tongue.max.y + .02);
    const frontPts = mid(i => ['Tongue', 'Epiglottis', 'Cricoid cartilage'].includes(i.name) || /arytenoid/.test(i.name));
    const wallPts = mid(i => i.role.startsWith('constrictor') || i.name === 'Pharyngeal raphe');
    tongueTop = z => topAt(tonguePts, z, .004) ?? topAt(tonguePts, z, .008) ?? tongue.max.y;
    palateBottom = z => z > L.hinge.z - .001 ? bottomAt(palatePts, z, .003) : null;
    tongueBackZ = tongue.min.z + .016; tongueFrontZ = tongue.max.z - .022;
    const oe = L.oesophagus.length ? L.oesophagus : [[0, 1.468, -.01], [0, 1.2, -.02]] as V3[], top = new T.Vector3(...oe[0]);
    const startY = tongueTop(tongueBackZ) + BOLUS_R, path = pharynxPath(frontPts, wallPts, startY - .004, top.y + .004, 14);
    const pts = [new T.Vector3(0, startY, tongueBackZ), ...path.points.map((q: P) => new T.Vector3(...q)), top];
    bolusPath = {pharynx: new T.CatmullRomCurve3(pts), widths: [BOLUS_R * 2, ...path.widths, BOLUS_R * 2], oesophagus: new T.CatmullRomCurve3(oe.map(p => new T.Vector3(...p)))};
    // how far each vertex of the tongue may rise before its dorsum touches the hard palate above it
    for (const it of items) if (it.role === 'tongue') {
      const n = it.base.length / 3, g = new Float32Array(n);
      for (let k = 0; k < n; k++) {const z = it.base[k * 3 + 2], pb = palateBottom(z); g[k] = pb === null ? .003 : Math.min(.02, Math.max(0, pb - tongueTop(z) - .0006));}
      it.gap = g;
    }
    bolus = new T.Mesh(new T.SphereGeometry(.0055, 20, 14), new T.MeshStandardMaterial({color: BOLUS, roughness: .5})); bolus.renderOrder = 3; scene.add(bolus);
  }

  // ---- pose
  const v = new T.Vector3(), hyoidMove = new T.Vector3(), larynxMove = new T.Vector3(), rot = new T.Matrix4();
  function applyPose(p: SwallowPose) {
    if (!ready) return;
    hyoidMove.set(0, MOVE.hyoid.up * p.larynx, MOVE.hyoid.forward * p.larynx);
    larynxMove.set(0, MOVE.larynx.up * p.larynx, MOVE.larynx.forward * p.larynx);
    const t = L.tongue, zSpan = t.max.z - t.min.z, waveZ = t.max.z - p.tongueWave * zSpan;
    rot.makeRotationX(-MOVE.epiglottisTilt * p.epiglottis);
    for (const it of items) {
      const pos = it.mesh.geometry.getAttribute('position') as T.BufferAttribute, a = pos.array as Float32Array, b = it.base, n = b.length / 3, w = it.weight!;
      let active = 0;
      switch (it.role) {
        case 'tongue':
          for (let k = 0; k < n; k++) {
            const x = b[k * 3], y = b[k * 3 + 1], z = b[k * 3 + 2], d = w[k];
            // the dorsum rises until it meets the hard palate: first the tip, then front to back as the wave passes (the part in front of the wave stays pressed up)
            const reach = it.gap![k] * d, tip = p.tongueTip * reach * smooth((z - (t.max.z - .022)) / .02);
            const wave = p.tongueWaveAmp * reach * (z > waveZ ? 1 : Math.exp(-Math.pow((z - waveZ) / .012, 2)));
            const backPart = smooth(((t.min.z + .025) - z) / .02), root = smooth(((t.min.y + t.max.y) / 2 - y) / .015);
            a[k * 3] = x; a[k * 3 + 1] = y + Math.max(tip, wave) + hyoidMove.y * root * .6; a[k * 3 + 2] = z - p.tongueBase * MOVE.tongueBaseBack * backPart + hyoidMove.z * root * .6;
          }
          active = Math.max(p.tongueTip, p.tongueWaveAmp) * .7; break;
        case 'hyoid':
          for (let k = 0; k < n; k++) {a[k * 3] = b[k * 3]; a[k * 3 + 1] = b[k * 3 + 1] + hyoidMove.y; a[k * 3 + 2] = b[k * 3 + 2] + hyoidMove.z;} break;
        case 'larynx': case 'infrahyoid':
          for (let k = 0; k < n; k++) {a[k * 3] = b[k * 3]; a[k * 3 + 1] = b[k * 3 + 1] + larynxMove.y; a[k * 3 + 2] = b[k * 3 + 2] + larynxMove.z;}
          if (it.role === 'infrahyoid') active = p.suprahyoid; break;
        case 'epiglottis':
          for (let k = 0; k < n; k++) {v.set(b[k * 3], b[k * 3 + 1], b[k * 3 + 2]).sub(L.epiPivot).applyMatrix4(rot).add(L.epiPivot).add(larynxMove); a[k * 3] = v.x; a[k * 3 + 1] = v.y; a[k * 3 + 2] = v.z;} break;
        case 'suprahyoid': case 'pharynx-other': case 'trachea':
          for (let k = 0; k < n; k++) {a[k * 3] = b[k * 3]; a[k * 3 + 1] = b[k * 3 + 1] + larynxMove.y * w[k]; a[k * 3 + 2] = b[k * 3 + 2] + larynxMove.z * w[k];}
          if (it.role !== 'trachea') active = it.role === 'suprahyoid' ? p.suprahyoid : p.constrictor[1] * .7; break;
        case 'constrictor-1': case 'constrictor-2': case 'constrictor-3': {
          const c = p.constrictor[+it.role.slice(-1) - 1], squeeze = c * MOVE.constrictorSqueeze;
          for (let k = 0; k < n; k++) {
            const lift = it.role === 'constrictor-1' ? 0 : w[k];
            a[k * 3] = b[k * 3] * (1 - squeeze); a[k * 3 + 1] = b[k * 3 + 1] + larynxMove.y * lift; a[k * 3 + 2] = L.lumenZ + (b[k * 3 + 2] - L.lumenZ) * (1 - squeeze * .6) + larynxMove.z * lift;
          }
          active = c; break;
        }
        case 'oesophagus': {
          const u = it.u!, line = L.oesophagus, wave = p.peristalsis;
          for (let k = 0; k < n; k++) {
            const x = b[k * 3], y = b[k * 3 + 1], z = b[k * 3 + 2], i = Math.min(line.length - 1, Math.round(u[k] * (line.length - 1))), c = line[i];
            // closed sphincter at the top unless it opens; a ring squeezed just behind the wave; a bulge where the bolus is
            let f = 1 - .45 * (1 - p.ues) * Math.exp(-Math.pow(u[k] / .025, 2));
            if (wave !== null) f *= 1 - MOVE.oesophagusSqueeze * Math.exp(-Math.pow((u[k] - (wave - .045)) / .025, 2)) + .35 * Math.exp(-Math.pow((u[k] - (wave + .02)) / .02, 2));
            a[k * 3] = c[0] + (x - c[0]) * f; a[k * 3 + 1] = y + larynxMove.y * w[k]; a[k * 3 + 2] = c[2] + (z - c[2]) * f + larynxMove.z * w[k];
          }
          active = wave !== null ? .5 : 0; break;
        }
        case 'palate-muscle': active = p.palate * (it.name === 'Uvular muscle' ? .5 : 1); break;
        default: break;
      }
      // the atlas normals are kept: recomputing them from the winding turns some meshes black (their winding is reversed); the moves are small enough for the stored normals
      if (it.role !== 'bone' && it.role !== 'palate-muscle') {pos.needsUpdate = true; it.mesh.geometry.computeBoundingSphere();}
      it.mesh.material.color.set(COLOUR[it.role]).lerp(ACTIVE, Math.min(1, active) * .75);
      it.mesh.material.emissive.copy(ACTIVE).multiplyScalar(Math.min(1, active) * .25);
    }
    if (palate) palate.rotation.x = MOVE.palateLift * p.palate;
    if (bolus && bolusPath) {
      const s = p.bolus;
      let sy = 1, sz = 1;
      if (s < PATH_MARKS.oropharynx) {
        // in the mouth the bolus lies on the dorsum just behind the wave of the tongue, and is flattened when the space under the palate is smaller than it
        const zb = Math.min(tongueFrontZ, Math.max(tongueBackZ, waveZ - .014)), surf = tongueTop(zb) + (p.tongueWaveAmp * Math.exp(-Math.pow((zb - waveZ) / .012, 2)) * .5) * Math.max(0, (palateBottom(zb) ?? tongueTop(zb)) - tongueTop(zb));
        const roof = palateBottom(zb), ry = roof === null ? BOLUS_R : Math.max(.0015, Math.min(BOLUS_R, (roof - surf - .0004) / 2));
        bolus.position.set(0, surf + ry, zb); sy = ry / BOLUS_R; sz = 1 / Math.sqrt(sy);
      } else if (s < PATH_MARKS.oesophagus) {
        // down the middle of the pharyngeal cavity, squeezed to its depth (front to back) and stretched along the way
        const u = (s - PATH_MARKS.oropharynx) / (PATH_MARKS.oesophagus - PATH_MARKS.oropharynx), w = bolusPath.widths, i = Math.min(w.length - 1, Math.round(u * (w.length - 1)));
        bolus.position.copy(bolusPath.pharynx.getPointAt(u)).add(larynxMove.clone().multiplyScalar(.5));
        sz = Math.max(.25, Math.min(1, (w[i] - .0006) / (2 * BOLUS_R))); sy = Math.min(2.2, 1 / sz);
      } else {
        bolus.position.copy(bolusPath.oesophagus.getPointAt((s - PATH_MARKS.oesophagus) / (1 - PATH_MARKS.oesophagus))); sy = 1.5; sz = 1 / Math.sqrt(1.5);
      }
      bolus.scale.set(sz, sy, sz);
    }
  }

  // ---- camera and labels
  function aimFor(id: StepId) {
    const c = VIEWS[id], box = new T.Box3(new T.Vector3(-.01, c.yLow, L.tongue.isEmpty() ? -.05 : L.tongue.min.z - .035), new T.Vector3(.01, c.yHigh, L.tongue.isEmpty() ? .07 : L.tongue.max.z + .01));
    const dir = new T.Vector3(1, .05, .02).normalize(), centre = box.getCenter(new T.Vector3());
    return {tgt: centre, pos: centre.clone().addScaledVector(dir, framingDistance(box, dir, camera.fov, camera.aspect, c.fill, c.fill, .08))};
  }
  function flyTo(id: StepId, instant = false) {
    const to = aimFor(id);
    if (instant) {camera.position.copy(to.pos); controls.target.copy(to.tgt); controls.update(); tween = null; return;}
    tween = {from: {pos: camera.position.clone(), tgt: controls.target.clone()}, to, start: performance.now(), ms: 1200};
  }
  const meshPoint = (name: string, pick: (b: T.Box3) => T.Vector3) => () => {const it = items.find(i => i.name === name); if (!it) return null; it.mesh.geometry.computeBoundingBox(); return pick(it.mesh.geometry.boundingBox!);};
  const midOf = (b: T.Box3) => new T.Vector3(0, (b.min.y + b.max.y) / 2, (b.min.z + b.max.z) / 2);
  /** the vertex of a mesh (as drawn now) that is furthest along `dir` among those near its vertical middle: a point on the structure itself, not in the space it wraps around */
  const onMesh = (name: string, dir: 1 | -1) => () => {
    const it = items.find(i => i.name === name); if (!it) return null;
    const a = it.mesh.geometry.getAttribute('position'), b = it.mesh.geometry.boundingBox!, midY = (b.min.y + b.max.y) / 2, band = (b.max.y - b.min.y) * .25;
    let best = -Infinity, at = -1;
    for (let k = 0; k < a.count; k++) {if (Math.abs(a.getY(k) - midY) > band) continue; const v = a.getZ(k) * dir; if (v > best) {best = v; at = k;}}
    return at < 0 ? null : new T.Vector3(a.getX(at), a.getY(at), a.getZ(at));
  };
  function labelSpecs(): LabelSpec[] {
    const lab = (key: string, en: string, zh: string, at: () => T.Vector3 | null, o: Partial<LabelSpec> = {}): LabelSpec => ({key, en, zh, at, ...o});
    const oesophagus = step === 'oesophageal';
    const specs: LabelSpec[] = [
      lab('tongue', 'Tongue', '舌', meshPoint('Tongue', b => new T.Vector3(0, b.max.y - .004, b.max.z - .02)), {dx: -40, dy: -70}),
      lab('palate', 'Soft palate', '軟顎', () => palate ? palate.localToWorld(new T.Vector3(0, -.008, -.004)) : null, {schematic: true, dx: 30, dy: -60}),
      lab('naso', 'Nasopharynx', '鼻咽', () => L.nasopharynx.clone(), {dx: -150, dy: -40}),
      lab('epi', 'Epiglottis', '會厭軟骨', meshPoint('Epiglottis', b => new T.Vector3(0, b.max.y, (b.min.z + b.max.z) / 2)), {dx: 40, dy: -30}),
      lab('hyoid', 'Hyoid bone', '舌骨', onMesh('Hyoid bone', 1), {dx: 40, dy: 20}),
      lab('thyroid', 'Thyroid cartilage', '甲狀軟骨', meshPoint('Thyroid cartilage', b => new T.Vector3(0, (b.min.y + b.max.y) / 2, b.max.z)), {dx: 30, dy: 30}),
      lab('c1', 'Superior pharyngeal constrictor', '上咽縮肌', onMesh('Right superior pharyngeal constrictor', -1), {dx: -210, dy: -10}),
      lab('c2', 'Middle pharyngeal constrictor', '中咽縮肌', onMesh('Right middle pharyngeal constrictor', -1), {dx: -210, dy: 10}),
      lab('c3', 'Inferior pharyngeal constrictor', '下咽縮肌', onMesh('Right inferior pharyngeal constrictor', -1), {dx: -210, dy: 20}),
      lab('oes', 'Oesophagus', '食道', () => L.oesophagus.length ? new T.Vector3(...L.oesophagus[oesophagus ? 24 : 6]) : null, {dx: -150, dy: 10}),
      lab('bolus', 'Bolus', '食團', () => bolus?.position.clone() ?? null, {schematic: true, accent: true, dx: 34, dy: 26}),
    ];
    return oesophagus ? specs.filter(s => ['oes', 'bolus', 'thyroid', 'c3', 'epi'].includes(s.key)) : specs;
  }

  const resize = () => {const r = host.getBoundingClientRect(); renderer.setSize(Math.max(1, r.width), Math.max(1, r.height)); camera.aspect = Math.max(1, r.width) / Math.max(1, r.height); camera.updateProjectionMatrix();};
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const project = (p: T.Vector3) => {const q = p.clone().project(camera); if (q.z > 1) return null; const r = host.getBoundingClientRect(); return {x: (q.x + 1) / 2 * r.width, y: (1 - q.y) / 2 * r.height};};

  return {
    get ready() {return ready;},
    setStep(id: StepId) {if (id === step) return; step = id; if (ready) {flyTo(id); labels.set(labelSpecs());}},
    resetView() {if (ready) flyTo(step);},
    tick(t: number) {
      if (!ready || disposed) return;
      if (tween) {const k = Math.min(1, (performance.now() - tween.start) / tween.ms), e = smooth(k); camera.position.lerpVectors(tween.from.pos, tween.to.pos, e); controls.target.lerpVectors(tween.from.tgt, tween.to.tgt, e); if (k >= 1) tween = null;}
      controls.update(); applyPose(poseAt(t)); renderer.render(scene, camera);
      labels.update(project);
    },
    get canvas() {return canvas;},
    dispose() {
      disposed = true; abort.abort(); observer.disconnect(); controls.dispose(); labels.dispose();
      scene.traverse(o => {if (o instanceof T.Mesh) {o.geometry.dispose(); (o.material as T.Material).dispose();}});
      renderer.dispose(); canvas.remove();
    },
  };
}
