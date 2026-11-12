import * as T from 'three';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Schematic (示意) structures that the Brain Project model does not have but the neuroanatomy notes name.
 * Each one is a closed ellipsoid or an elliptical tube placed from the real structures around it (positions are in millimetres in the model's own frame:
 * x to the body's left, y up from 1600 mm, z anterior), so they can be cut, hidden, isolated and picked like the real meshes, and are always labelled 示意.
 * Left-hand specs are mirrored for the right.
 */
export interface SchematicSpec {en: string; zh: string; group: string; side: 'left' | 'right' | 'mid'; build: () => T.BufferGeometry}
type V3 = [number, number, number];

const world = (p: V3, mirror: boolean) => new T.Vector3((mirror ? -p[0] : p[0]) / 1000, (1600 + p[1]) / 1000, p[2] / 1000);

/** A closed ellipsoid with radii (mm) about `c`, turned about the vertical axis by `yaw` and about the front-back axis by `roll` (degrees). */
function ellipsoid(c: V3, r: V3, mirror: boolean, yaw = 0, roll = 0): T.BufferGeometry {
  // welded so the surface is one closed shell (the sphere's seam and poles are duplicated vertices)
  const sphere = new T.SphereGeometry(1, 28, 18); sphere.deleteAttribute('normal'); sphere.deleteAttribute('uv');
  const g = mergeVertices(sphere, 1e-6);
  g.scale(r[0] / 1000, r[1] / 1000, r[2] / 1000);
  const m = new T.Matrix4().makeRotationY((mirror ? -yaw : yaw) * Math.PI / 180).multiply(new T.Matrix4().makeRotationZ((mirror ? -roll : roll) * Math.PI / 180));
  g.applyMatrix4(m); g.translate(...world(c, mirror).toArray());
  g.computeVertexNormals(); g.computeBoundingBox(); g.computeBoundingSphere();
  return g;
}

/** A closed tube with an elliptical section (radii in mm: `rh` horizontal across the path, `rv` vertical) along a smooth path, capped with rounded ends. */
function tube(path: V3[], rh: number | number[], rv: number | number[], mirror: boolean, samples = 40, sides = 16): T.BufferGeometry {
  const curve = new T.CatmullRomCurve3(path.map(p => world(p, mirror)), false, 'centripetal');
  const at = (t: number, from: number | number[]) => {
    if (typeof from === 'number') return from / 1000;
    const f = t * (from.length - 1), i = Math.min(from.length - 2, Math.floor(f)), k = f - i;
    return (from[i] * (1 - k) + from[i + 1] * k) / 1000;
  };
  const pos: number[] = [], idx: number[] = [], up = new T.Vector3(0, 1, 0);
  for (let i = 0; i <= samples; i++) {
    const t = i / samples, c = curve.getPointAt(t), tan = curve.getTangentAt(t).normalize();
    const side = new T.Vector3().crossVectors(tan, up).normalize(), vert = new T.Vector3().crossVectors(side, tan).normalize();
    // taper to a point at both ends so the tube is closed
    const end = Math.min(1, Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(t - .5) * 2, 8))) + .02), rH = at(t, rh) * end, rV = at(t, rv) * end;
    for (let j = 0; j < sides; j++) {const a = j / sides * Math.PI * 2; pos.push(c.x + side.x * Math.cos(a) * rH + vert.x * Math.sin(a) * rV, c.y + side.y * Math.cos(a) * rH + vert.y * Math.sin(a) * rV, c.z + side.z * Math.cos(a) * rH + vert.z * Math.sin(a) * rV);}
  }
  for (let i = 0; i < samples; i++) for (let j = 0; j < sides; j++) {
    const a = i * sides + j, b = i * sides + (j + 1) % sides, c = (i + 1) * sides + j, d = (i + 1) * sides + (j + 1) % sides;
    idx.push(a, b, c, b, d, c);
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  g.computeVertexNormals(); g.computeBoundingBox(); g.computeBoundingSphere();
  return g;
}

const SPECS: SchematicSpec[] = [];
/** A left/right pair from one left-hand description. */
const pair = (en: string, zh: string, group: string, build: (mirror: boolean) => T.BufferGeometry) => {
  SPECS.push({en, zh, group, side: 'left', build: () => build(false)}, {en, zh, group, side: 'right', build: () => build(true)});
};

// ---- batch 1: internal / external capsule, claustrum, thalamic relay nuclei, hypothalamic nuclei
pair('Anterior limb of internal capsule', '內囊前腳', 'white', m => tube([[22, 29, 31], [20.5, 28, 20], [17.5, 26, 10]], 3.2, [7, 9, 9], m));
pair('Genu of internal capsule', '內囊膝部', 'white', m => ellipsoid([16, 26, 6], [3.6, 9, 3.6], m, -15));
pair('Posterior limb of internal capsule', '內囊後腳', 'white', m => tube([[17.5, 26, 3], [20, 26, -6], [24, 25, -16], [27, 24, -24]], 3.4, [10, 10, 9, 7], m));
pair('External capsule', '外囊', 'white', m => ellipsoid([35, 31, 8], [1.1, 11, 18], m));
pair('Claustrum', '帶狀核', 'basal', m => ellipsoid([36.8, 31, 8], [1.2, 10.5, 16], m));
pair('Ventral posterolateral nucleus (VPL)', '視丘腹後外側核', 'diencephalon', m => ellipsoid([19, 20.5, -12], [4.6, 3.6, 4.2], m, 15));
pair('Ventral posteromedial nucleus (VPM)', '視丘腹後內側核', 'diencephalon', m => ellipsoid([12.8, 20.5, -11.5], [3.1, 3.2, 3.6], m));
pair('Supraoptic nucleus', '視上核', 'diencephalon', m => ellipsoid([5, 16.8, 14], [2.4, 1.2, 1.8], m));
pair('Suprachiasmatic nucleus', '視交叉上核', 'diencephalon', m => ellipsoid([1.5, 16.8, 17], [1.2, 1, 1.4], m));
pair('Paraventricular nucleus of hypothalamus', '下視丘室旁核', 'diencephalon', m => ellipsoid([1.8, 21, 11], [1.1, 2, 1.1], m));
pair('Ventromedial nucleus of hypothalamus', '下視丘腹內側核', 'diencephalon', m => ellipsoid([4.2, 14, 10], [2.2, 1.8, 2], m));
pair('Dorsomedial nucleus of hypothalamus', '下視丘背內側核', 'diencephalon', m => ellipsoid([3, 17.5, 7], [1.8, 1.6, 1.8], m));
pair('Medial preoptic nucleus', '內側視前核', 'diencephalon', m => ellipsoid([2, 19.5, 14.5], [1.8, 1.8, 1.6], m));

export const SCHEMATIC: SchematicSpec[] = SPECS;
export const SCHEMATIC_NAMES = [...new Set(SPECS.map(s => s.en))];
