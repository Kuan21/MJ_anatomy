// Heart structures that neither Z-Anatomy nor BodyParts3D models, built on the Z-Anatomy chambers from textbook anatomy ("MJ 補建").
// Everything here is derived from the chamber, valve and vessel meshes at build time: ridges follow the inside of the wall, patches are
// pieces of the chamber surface, and the pericardial sinuses are schematic spaces. They are marked as MJ-made in the UI.
import {meshOf, ray, closest, wallPoint, patch, tubeThrough, merge, sub, add, mul, unit, len, lerp, dot, cross} from './heart-geom.mjs';

const seeded = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const ellipsoid = (c, r, seg = 18) => {
  const positions = [], indices = [];
  for (let i = 0; i <= seg; i++) for (let j = 0; j < seg * 2; j++) {
    const th = i / seg * Math.PI, ph = j / (seg * 2) * Math.PI * 2;
    positions.push(c[0] + r[0] * Math.sin(th) * Math.cos(ph), c[1] + r[1] * Math.cos(th), c[2] + r[2] * Math.sin(th) * Math.sin(ph));
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < seg * 2; j++) { const a = i * seg * 2 + j, b = i * seg * 2 + (j + 1) % (seg * 2), c2 = (i + 1) * seg * 2 + j, d = (i + 1) * seg * 2 + (j + 1) % (seg * 2); indices.push(a, c2, b, b, c2, d); }
  return {positions: new Float32Array(positions), indices: new Uint32Array(indices)};
};

/** `mesh(name)` returns {positions, indices} of a catalogue piece in the Z-Anatomy frame; the result maps each MJ structure's English name to geometry. */
export function buildMjHeart(mesh) {
  const M = {}; for (const n of ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle', 'Superior vena cava', 'Inferior vena cava', 'Coronary sinus', 'Ascending aorta', 'Pulmonary trunk', 'Right coronary artery', 'Circumflex artery', 'Anterior papillary muscle of right ventricle']) { const g = mesh(n); M[n] = meshOf(g.positions, g.indices); }
  const RA = M['Right atrium'], RV = M['Right ventricle'], LA = M['Left atrium'], LV = M['Left ventricle'];
  const out = {};
  const centreOf = m => m.centre;
  const SVCb = [centreOf(M['Superior vena cava'])[0], M['Superior vena cava'].lo[1], centreOf(M['Superior vena cava'])[2]];
  const IVCt = [centreOf(M['Inferior vena cava'])[0], M['Inferior vena cava'].hi[1], centreOf(M['Inferior vena cava'])[2]];
  const axis = t => lerp(SVCb, IVCt, t);                       // t 0 at the SVC opening, 1 at the IVC opening
  const lateralAnterior = th => [-Math.cos(th), 0, Math.sin(th)];  // th 0: right lateral, 90 deg: anterior (patient's right is -x)

  // Crista terminalis: a vertical ridge on the right-anterolateral wall between the front of the SVC opening and the front of the IVC opening.
  const crista = [];
  for (let k = 0; k <= 8; k++) { const t = .06 + .88 * k / 8, p = wallPoint(RA, axis(t), lateralAnterior(.95), .0016); if (p) crista.push(p); }
  out['Crista terminalis'] = tubeThrough(crista, .0019, .0017, 48);
  // Pectinate muscles: parallel ridges leaving the crista and running forward over the anterior wall towards the tricuspid orifice and the auricle.
  const pectinate = [];
  for (let k = 0; k < 9; k++) {
    const t = .1 + .78 * k / 8, pts = [];
    for (let j = 0; j <= 6; j++) { const th = .95 + j * .13, p = wallPoint(RA, axis(Math.min(1, t + j * .018)), lateralAnterior(th), .0012); if (p) pts.push(p); }
    if (pts.length > 3) pectinate.push(tubeThrough(pts, .0009, .0006, 24, 6));
  }
  out['Pectinate muscles'] = merge(pectinate);
  // Interatrial septum: the part of the right atrial wall that lies against the left atrium.
  const nearLA = tr => closest(LA, tr.mid).d < .0035;
  const septumRA = patch(RA, tr => nearLA(tr), -.0004);
  out['Interatrial septum'] = septumRA;
  // Fossa ovalis: an oval depression in the septum above the opening of the inferior vena cava, with a raised rim (limbus).
  const sc = (() => { let s = [0, 0, 0], n = 0; for (const tr of RA.tris) if (nearLA(tr)) { s = add(s, tr.mid); n++; } return n ? mul(s, 1 / n) : RA.centre; })();
  const fc = (() => { const c = lerp(sc, [sc[0], IVCt[1] + .02, sc[2]], .35); const h = closest(RA, c); return h ? h.point : c; })();
  const toward = unit(sub(LA.centre, fc)), up = [0, 1, 0], sideways = unit(cross(up, toward));
  const inOval = (p, a = .0075, b = .0105) => { const d = sub(p, fc), u = dot(d, sideways) / a, v = dot(d, up) / b; return u * u + v * v < 1; };
  out['Fossa ovalis'] = patch(RA, tr => nearLA(tr) && inOval(tr.mid), -.0014);
  const rim = []; for (let k = 0; k <= 28; k++) { const a = k / 28 * Math.PI * 2, p = add(fc, add(mul(sideways, Math.cos(a) * .0085), mul(up, Math.sin(a) * .0115))), h = closest(RA, p); rim.push(h ? sub(h.point, mul(h.normal, .0012)) : p); }
  out['Fossa ovalis rim'] = tubeThrough(rim, .0011, .0011, 60, 6);
  // Auricles: the pouch of the atrium that points forward beside the root of the great arteries.
  const aorticRoot = M['Ascending aorta'].centre, trunk = M['Pulmonary trunk'].centre;
  out['Right auricle'] = patch(RA, tr => tr.mid[2] > RA.hi[2] - .019 && tr.mid[1] > RA.centre[1] + .012 && tr.mid[0] < RA.centre[0] + .008, -.0004);
  out['Left auricle'] = patch(LA, tr => tr.mid[0] > LA.hi[0] - .02 && tr.mid[2] > LA.centre[2] + .004 && tr.mid[1] > LA.centre[1] - .002, -.0004);
  // Interventricular septum: the part of the left ventricular wall that lies against the right ventricle.
  out['Interventricular septum'] = patch(LV, tr => closest(RV, tr.mid).d < .0045 && dot(tr.n, sub(RV.centre, tr.mid)) > 0, -.0004);
  // Conus arteriosus: the smooth funnel of the right ventricle below the pulmonary valve.
  const pv = M['Pulmonary trunk'].lo, pvc = [trunk[0], pv[1] - .012, trunk[2]];
  out['Conus arteriosus'] = patch(RV, tr => len(sub(tr.mid, pvc)) < .0185 && tr.mid[1] > RV.centre[1] + .006, -.0004);
  // Supraventricular crest: an arched ridge on the roof of the right ventricle between the tricuspid and pulmonary orifices.
  const tvc = [(RV.lo[0] + RV.centre[0]) / 2, RV.hi[1] - .028, RV.centre[2] - .008];
  const crestPts = []; for (let k = 0; k <= 6; k++) { const t = k / 6, base = lerp(tvc, [pvc[0] - .004, pvc[1] - .004, pvc[2] - .012], t), p = wallPoint(RV, [base[0], base[1] - .02, base[2]], [0, 1, 0], .0022); if (p) crestPts.push([p[0], p[1], p[2]]); }
  out['Supraventricular crest'] = tubeThrough(crestPts, .0024, .0020, 40);
  // Septomarginal trabecula (moderator band): from the lower septum across the cavity to the base of the anterior papillary muscle.
  const apm = M['Anterior papillary muscle of right ventricle'];
  const sept = (() => { const o = [RV.centre[0], RV.lo[1] + .02, RV.centre[2] - .006]; const h = ray(RV, o, [1, 0, 0]); return h ? sub(h.point, [.0015, 0, 0]) : o; })();
  const apmBase = [apm.centre[0], apm.lo[1] + .004, apm.centre[2]];
  const mid = lerp(sept, apmBase, .5); mid[1] -= .003;
  out['Septomarginal trabecula'] = tubeThrough([sept, lerp(sept, mid, .5), mid, lerp(mid, apmBase, .5), apmBase], .0017, .0013, 32);
  // Trabeculae carneae: ridges and bridges on the lower and anterior inner walls; coarse in the right ventricle, fine and dense in the left.
  const trabeculae = (chamber, count, r, seed, region, reach) => {
    // each ridge starts on the wall in the given region and creeps along it: small random turns of the viewing direction from the chamber centre
    const rnd = seeded(seed), list = [];
    for (let i = 0; i < count; i++) {
      let dir = region(rnd);
      const pts = [];
      const steps = 6 + Math.floor(rnd() * 4), turn = reach / steps;
      const wobble = [(rnd() - .5), (rnd() - .5), (rnd() - .5)];
      for (let j = 0; j < steps; j++) {
        const p = wallPoint(chamber, chamber.centre, dir, r * 1.1); if (!p) break;
        pts.push(p);
        dir = unit([dir[0] + (wobble[0] + (rnd() - .5) * .5) * turn, dir[1] + (wobble[1] + (rnd() - .5) * .5) * turn, dir[2] + (wobble[2] + (rnd() - .5) * .5) * turn]);
      }
      if (pts.length >= 4) list.push(tubeThrough(pts, r, r * .55, 24, 5));
    }
    return merge(list);
  };
  const lowerAnterior = rnd => unit([(rnd() - .5) * .9, -.35 - rnd() * .65, .15 + rnd() * .85]);
  const lowerLateral = rnd => unit([.3 + rnd() * .7, -.3 - rnd() * .7, (rnd() - .5) * .9]);
  out['Trabeculae carneae of right ventricle'] = trabeculae(RV, 34, .0010, 5, lowerAnterior, 1.1);
  out['Trabeculae carneae of left ventricle'] = trabeculae(LV, 80, .0006, 9, lowerLateral, .9);
  // Aortic vestibule: the smooth, non-muscular outflow part of the left ventricle just below the aortic valve.
  const av = [aorticRoot[0], M['Ascending aorta'].lo[1] - .014, aorticRoot[2] - .004];
  out['Aortic vestibule'] = patch(LV, tr => len(sub(tr.mid, av)) < .0185 && tr.mid[1] > LV.centre[1] + .008, -.0004);

  // Sinoatrial nodal artery: from the right coronary artery up the front of the right atrium to the root of the superior vena cava, then round it.
  const rca = M['Right coronary artery'], nearRoot = (() => { let best = null; for (let i = 0; i < rca.positions.length; i += 3) { const p = [rca.positions[i], rca.positions[i + 1], rca.positions[i + 2]]; if (p[1] > rca.hi[1] - .012 && (!best || p[0] < best[0])) best = p; } return best ?? rca.centre; })();
  const sa = [nearRoot];
  for (const t of [.05, .0]) { const p = wallPoint(RA, axis(t), lateralAnterior(1.15), -.0008); if (p) sa.push(p); }
  const base = SVCb, around = [];
  for (let k = 0; k <= 5; k++) { const a = 1.3 + k * .9, p = [base[0] + Math.cos(a) * .0105, base[1] + .004, base[2] + Math.sin(a) * .0105]; around.push(p); }
  out['Sinoatrial nodal artery'] = tubeThrough([...sa, ...around], .0009, .0006, 40);
  // Left marginal branch: from the circumflex artery down the obtuse (left) margin of the left ventricle.
  const cx = M['Circumflex artery'], start = (() => { let best = null; for (let i = 0; i < cx.positions.length; i += 3) { const p = [cx.positions[i], cx.positions[i + 1], cx.positions[i + 2]]; if (!best || p[0] > best[0]) best = p; } return best ?? cx.centre; })();
  const lm = [start];
  for (let k = 1; k <= 7; k++) { const t = k / 7, y = start[1] - t * (start[1] - LV.lo[1] - .006), c = [LV.centre[0], y, LV.centre[2]], th = .35 - t * .25, p = wallPoint(LV, c, [Math.cos(th), 0, -Math.sin(th) * .6], -.0009) ?? (() => { const h = ray(LV, c, unit([Math.cos(th), 0, -Math.sin(th) * .6])); return h ? add(h.point, mul(unit([Math.cos(th), 0, -Math.sin(th) * .6]), .0009)) : null; })(); if (p) lm.push(p); }
  out['Left marginal branch'] = tubeThrough(lm, .0011, .0006, 40);
  // Pericardial sinuses (schematic spaces). Transverse: behind the aorta and pulmonary trunk, in front of the superior vena cava and the roof of the left atrium.
  const ao = M['Ascending aorta'], tz = ao.lo[2] - .002;
  out['Transverse pericardial sinus'] = tubeThrough([[SVCb[0] - .002, ao.hi[1] - .016, tz + .012], [ao.centre[0] - .004, ao.hi[1] - .016, tz], [ao.centre[0] + .012, ao.hi[1] - .018, tz - .002], [trunk[0] + .014, ao.hi[1] - .02, tz + .006], [LA.hi[0] - .014, LA.hi[1] + .001, LA.centre[2] + .018]], .0034, .0028, 40, 10);
  // Oblique: a blind pouch behind the left atrium, between the pulmonary veins.
  const back = wallPoint(LA, LA.centre, [0, 0, -1], -.0045) ?? [LA.centre[0], LA.centre[1], LA.lo[2] - .004];
  out['Oblique pericardial sinus'] = ellipsoid([back[0] + .0035, back[1] - .001, back[2]], [.0155, .0125, .0036]);
  return out;
}
