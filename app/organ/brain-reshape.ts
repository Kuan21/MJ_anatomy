import * as T from 'three';

/** The model's fourth ventricle is a fat bell. Anatomically it is a tent-shaped cavity behind the pons and the upper medulla and in front of the cerebellum:
 *  - floor: flat and rhomboid (the rhomboid fossa), widest at the lateral recesses, narrowing to the cerebral aqueduct above and to the obex (central canal) below;
 *  - roof: a tent whose apex (fastigium) points back into the cerebellum; the upper roof is the superior medullary velum between the two superior cerebellar peduncles;
 *  - the lateral recesses end in the lateral apertures (foramina of Luschka); the median aperture (foramen of Magendie) opens in the lower roof.
 * This is a schematic rebuild that keeps the model's position, height and aqueduct end. `fourthVentricleFrame` also tells the CSF page where the apertures are. */
export interface FourthVentricleFrame {
  cx: number; y0: number; y1: number; wMax: number; hMax: number;
  yAt: (t: number) => number; floorAt: (t: number, s?: number) => number; widthAt: (t: number) => number; heightAt: (t: number) => number;
}

export const T_RECESS = .4, T_APEX = .52, T_MEDIAN = .2;
export function fourthVentricleFrame(box: T.Box3): FourthVentricleFrame {
  const cx = (box.min.x + box.max.x) / 2, y0 = box.min.y, y1 = box.max.y, zTop = box.max.z, zBottom = box.min.z;
  const wMax = .8 * (box.max.x - box.min.x) / 2, hMax = Math.min(.5 * (zTop - zBottom), .0095);
  // the floor lies on the back of the brainstem: it follows the midline groove of the dorsal surface of the medulla and pons in this model (further back at the obex, closer to the aqueduct at the top)
  // and rises to the sides, where the dorsal surface bulges backwards (the cerebellar peduncles)
  const dorsal: [number, number][] = [[1.5646, -.0300], [1.568, -.0285], [1.570, -.0265], [1.572, -.0225], [1.574, -.0205], [1.578, -.0188], [1.582, -.0178], [1.586, -.0166], [1.590, -.0151], [1.594, -.0140], [1.598, -.0133], [1.6013, -.0128]];
  const floorAt = (t: number, s = 0) => {
    const y = y0 + t * (y1 - y0); let k = 0; while (k < dorsal.length - 2 && y > dorsal[k + 1][0]) k++;
    const [ya, za] = dorsal[k], [yb, zb] = dorsal[k + 1], u = Math.min(1, Math.max(0, (y - ya) / (yb - ya)));
    return za + (zb - za) * u - .0004 - .0042 * s * s;   // a hair behind the surface so the two do not flicker
  };
  // rhomboid outline plus a pointed lateral recess at its widest level (it ends in the lateral aperture)
  const widthAt = (t: number) => (t < T_RECESS ? wMax * (.06 + .94 * Math.pow(t / T_RECESS, .9)) : wMax * (1 - .88 * (t - T_RECESS) / (1 - T_RECESS))) + wMax * .22 * Math.exp(-Math.pow((t - T_RECESS) / .045, 2));
  const heightAt = (t: number) => t < T_APEX ? hMax * Math.pow(t / T_APEX, 1.05) : hMax * (1 - .86 * Math.pow((t - T_APEX) / (1 - T_APEX), .9));
  return {cx, y0, y1, wMax, hMax, yAt: t => y0 + t * (y1 - y0), floorAt, widthAt, heightAt};
}

/** Builds the closed fourth-ventricle surface from the extent of the model's own mesh. */
export function fourthVentricleGeometry(source: T.BufferGeometry): T.BufferGeometry {
  source.computeBoundingBox();
  const F = fourthVentricleFrame(source.boundingBox!);
  const NT = 56, NS = 18, ring = NS * 2, e = .07;
  const apex = (s: number) => (Math.sqrt(s * s + e * e) - e) / (Math.sqrt(1 + e * e) - e);   // 0 at the midline, 1 at the edge: a tent with a softly rounded ridge
  const pos: number[] = [];
  for (let i = 0; i <= NT; i++) {
    const t = i / NT, y = F.yAt(t), w = F.widthAt(t), h = Math.max(.0006, F.heightAt(t)), zfAt = (s: number) => F.floorAt(t, s);
    for (let k = 0; k < ring; k++) {
      if (k <= NS) {const s = -1 + 2 * k / NS; pos.push(F.cx + s * w, y, zfAt(s));}                       // floor, left to right
      else {const s = 1 - 2 * (k - NS) / NS; pos.push(F.cx + s * w, y, zfAt(s) - h * (1 - apex(s)));}   // roof, right to left back over the top
    }
  }
  const idx: number[] = [];
  for (let i = 0; i < NT; i++) for (let k = 0; k < ring; k++) {
    const a = i * ring + k, b = i * ring + (k + 1) % ring, c = a + ring, d = b + ring;
    idx.push(a, b, c, b, d, c);
  }
  // end caps: fans to the centre of the first and last ring
  for (const [i, flip] of [[0, true], [NT, false]] as const) {
    let cxs = 0, cys = 0, czs = 0;
    for (let k = 0; k < ring; k++) {cxs += pos[(i * ring + k) * 3]; cys += pos[(i * ring + k) * 3 + 1]; czs += pos[(i * ring + k) * 3 + 2];}
    const c = pos.length / 3; pos.push(cxs / ring, cys / ring, czs / ring);
    for (let k = 0; k < ring; k++) {const a = i * ring + k, b = i * ring + (k + 1) % ring; flip ? idx.push(c, b, a) : idx.push(c, a, b);}
  }
  // outward winding: flip all triangles when the signed volume is negative
  let vol = 0;
  for (let i = 0; i < idx.length; i += 3) {
    const [a, b, c] = [idx[i], idx[i + 1], idx[i + 2]].map(j => new T.Vector3(pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]));
    vol += a.dot(b.clone().cross(c)) / 6;
  }
  if (vol < 0) for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  // where the CSF leaves: median aperture in the lower roof, lateral apertures at the tips of the lateral recesses
  const lat = (s: number) => [F.cx + s * F.widthAt(T_RECESS), F.yAt(T_RECESS), F.floorAt(T_RECESS, s) - .0004];
  g.userData.apertures = {median: [F.cx, F.yAt(T_MEDIAN), F.floorAt(T_MEDIAN) - F.heightAt(T_MEDIAN)], left: lat(1), right: lat(-1)};
  return g;
}
