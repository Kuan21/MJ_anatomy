// Builds the ear detail atlas package: one right ear assembled from three sources.
//   inner ear   IE-Map (CC BY 4.0): membranous labyrinth (semicircular ducts, ampullae, utricle, saccule); its cochlea and canals are also the registration reference;
//   middle ear  OpenEar example set, specimen Delta (CC BY 4.0): ossicles, tympanic membrane, bony labyrinth cast (split into vestibule, three canals, scala vestibuli),
//               scala tympani, facial nerve, chorda tympani, cochlear nerve;
//   outer ear   BodyParts3D 4.0 (right auricle, packaged atlas) plus two tubes built from the anatomy: the external acoustic meatus and the pharyngotympanic tube.
// IE-Map and OpenEar are different specimens in different coordinates: the IE-Map labyrinth is registered onto the OpenEar one (rigid, scale 1; see REGISTRATION),
// and both are placed in the body atlas frame (X left, Y up, Z front; metres) beside the BodyParts3D right auricle.
// Output: public/models/ear/ear-atlas.json and ear-atlas.bin.gz (Float32 positions, Int16 normals, Uint32 indices per part).
//   node scripts/build-ear-atlas.mjs --source <dir with iemap/ and openear/> [--atlas public/models] [--register]
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import {readPly, readObj, readVtk, vertexNormals, bounds} from './lib/ear-mesh-io.mjs';
import {icp, distanceStats, makeGrid, transformPoint} from './lib/ear-register.mjs';
import {loopSubdivide, surfaceDistance, slimTube, radiusStats, connectivity} from './lib/ear-tube.mjs';
import {v3, bezier, bezierTangent, principalAxes, wallTube, frames, splitByLabel, signedVolume, smooth} from './lib/ear-geometry.mjs';

const args = process.argv.slice(2), opt = name => { const i = args.indexOf('--' + name); return i < 0 ? undefined : (args[i + 1]?.startsWith('--') ? true : args[i + 1] ?? true); };
const sourceDir = opt('source'); if (!sourceDir || sourceDir === true) throw new Error('Pass --source <directory with iemap/ and openear/> (see scripts/ear-source-files.json)');
const atlasDir = path.resolve(typeof opt('atlas') === 'string' ? opt('atlas') : fileURLToPath(new URL('../public/models/', import.meta.url)));
const out = new URL('../public/models/ear/', import.meta.url);

// ---- sources (checked against the pinned hashes)
const pins = JSON.parse(fs.readFileSync(new URL('./ear-source-files.json', import.meta.url)));
const load = (set, file) => {
  const p = path.join(sourceDir, set, file), data = fs.readFileSync(p), sha = crypto.createHash('sha256').update(data).digest('hex');
  if (sha !== pins[set].files[file]) throw new Error(`${set}/${file} differs from the pinned source (sha256 ${sha})`);
  return file.endsWith('.vtk') ? readVtk(p) : file.endsWith('.obj') ? readObj(p) : readPly(p);
};
const IE = n => load('iemap', n), OE = n => load('openear', n);

// ---- registration IE-Map (RAS, mm) -> OpenEar (mm): p_oe = R p_ie + t. Found by iterative closest point between the IE-Map scalae and canals and the OpenEar perilymphatic spaces
// (run with --register to repeat the search). The IE-Map files are in 3D Slicer RAS (x right, y anterior, z superior), which makes the head frame.
const REGISTRATION = {
  R: [[0.015291692223882429, 0.3106479384707432, 0.9504020320226628], [0.36694532893380594, 0.8824481467158808, -0.2943406087025189], [-0.9301168150950668, 0.35324655225718243, -0.1004966845016422]],
  t: [25.15287398007461, 13.957422732508725, 40.25017936844847], scale: 1,
};
const applyReg = (x, p) => [0, 1, 2].map(r => x.R[r][0] * p[0] + x.R[r][1] * p[1] + x.R[r][2] * p[2] + x.t[r]);
const mapPositions = (pos, fn) => { const o = new Float32Array(pos.length); for (let i = 0; i < pos.length; i += 3) { const q = fn([pos[i], pos[i + 1], pos[i + 2]]); o[i] = q[0]; o[i + 1] = q[1]; o[i + 2] = q[2]; } return o; };
const cat = (...a) => { const r = new Float64Array(a.reduce((s, x) => s + x.length, 0)); let o = 0; for (const x of a) { r.set(x, o); o += x.length; } return r; };

const oe = { scalaVestibuli: OE('ScalaVestibuli.ply'), scalaTympani: OE('ScalaTympani.ply'), malleus: OE('Malleus.ply'), incus: OE('Incus.ply'), stapes: OE('Stapes.ply'), membrane: OE('TympanicMembrane.ply'), facial: OE('FacialisT.obj'), chorda: OE('ChordaTympani.ply'), cochlearNerve: OE('CochlearNerve.ply') };
const ie = { sa: IE('ls_Hsapiens_Sa.vtk'), sl: IE('ls_Hsapiens_Sl.vtk'), sp: IE('ls_Hsapiens_Sp.vtk'), aa: IE('ls_Hsapiens_Aa.vtk'), al: IE('ls_Hsapiens_Al.vtk'), ap: IE('ls_Hsapiens_Ap.vtk'), utricle: IE('ls_Hsapiens_utricle.vtk'), saccule: IE('mesh_david_sacculus.vtk'), st: IE('seg_coch_inner_scala_tympani.vtk'), sv: IE('seg_coch_inner_scala_vestibuli.vtk') };
const sub = (p, k) => { const r = new Float64Array(Math.floor(p.length / 3 / k) * 3); for (let i = 0; i < r.length / 3; i++) for (let a = 0; a < 3; a++) r[i * 3 + a] = p[i * k * 3 + a]; return r; };
const oePerilymph = cat(oe.scalaTympani.positions, oe.scalaVestibuli.positions);
let reg = {...REGISTRATION};
if (opt('register')) {
  const src = cat(...['st', 'sv', 'sa', 'sl', 'sp'].map(k => sub(ie[k].positions, 3)));
  const x = icp(src, oePerilymph, {scale: 1, R: reg.R, t: reg.t}, {iterations: 60, cell: 1, trim: .9, fixedScale: 1});
  console.log('REGISTRATION =', JSON.stringify({R: x.R, t: x.t, scale: 1}));
  reg = {R: x.R, t: x.t, scale: 1};
}
// registration error: distance (mm) of every IE-Map labyrinth surface to the OpenEar perilymphatic spaces it should lie in or on
const registrationError = {};
for (const [k, label] of [['st', 'scala tympani'], ['sv', 'scala vestibuli (IE-Map)'], ['sa', 'anterior canal'], ['sl', 'lateral canal'], ['sp', 'posterior canal'], ['utricle', 'utricle'], ['saccule', 'saccule']]) {
  const s = distanceStats(ie[k].positions, oePerilymph, reg, 1);
  registrationError[label] = {meanMm: +s.mean.toFixed(2), p95Mm: +s.p95.toFixed(2), maxMm: +s.max.toFixed(2)};
}
const ieOE = {}; for (const k of Object.keys(ie)) ieOE[k] = {...ie[k], positions: mapPositions(ie[k].positions, p => applyReg(reg, p))};

// ---- label the OpenEar bony labyrinth cast (its scala vestibuli file holds the cochlear scala vestibuli, the vestibule and the three canals) by the nearest IE-Map structure
const groups = [['cochlea', [ieOE.st, ieOE.sv]], ['anterior', [ieOE.sa, ieOE.aa]], ['lateral', [ieOE.sl, ieOE.al]], ['posterior', [ieOE.sp, ieOE.ap]], ['vestibule', [ieOE.utricle, ieOE.saccule]]];
const cast = oe.scalaVestibuli, nv = cast.positions.length / 3;
const grids = groups.map(([, list]) => makeGrid(cat(...list.map(m => m.positions)), 1));
let labels = new Int8Array(nv);
for (let i = 0; i < nv; i++) { let best = Infinity; grids.forEach((g, k) => { const d = g.nearest(cast.positions[i * 3], cast.positions[i * 3 + 1], cast.positions[i * 3 + 2], 12).dist; if (d < best) { best = d; labels[i] = k; } }); }
// majority filter over the mesh neighbours removes isolated vertices
const neighbours = Array.from({length: nv}, () => new Set());
for (let t = 0; t < cast.indices.length; t += 3) for (let k = 0; k < 3; k++) { neighbours[cast.indices[t + k]].add(cast.indices[t + (k + 1) % 3]); neighbours[cast.indices[t + k]].add(cast.indices[t + (k + 2) % 3]); }
for (let pass = 0; pass < 4; pass++) { const next = labels.slice(); for (let i = 0; i < nv; i++) { const c = new Map([[labels[i], 1.5]]); for (const j of neighbours[i]) c.set(labels[j], (c.get(labels[j]) ?? 0) + 1); next[i] = [...c].sort((a, b) => b[1] - a[1])[0][0]; } labels = next; }
const castNormals = vertexNormals(cast.positions, cast.indices);
const castParts = splitByLabel(cast.positions, cast.indices, labels);
const castNormalsOf = (piece, labelIndex) => { // normals of the whole cast, so the seams between the pieces shade smoothly
  const out = new Int16Array(piece.positions.length), map = new Map(); for (let v = 0; v < nv; v++) if (labels[v] === labelIndex) map.set(v, true);
  const lookup = makeGrid(cast.positions, .3);
  for (let i = 0; i < piece.positions.length; i += 3) { const q = lookup.nearest(piece.positions[i], piece.positions[i + 1], piece.positions[i + 2], 3); for (let k = 0; k < 3; k++) out[i + k] = castNormals[q.index + k]; }
  return out;
};

// ---- landmarks of the specimen used by the marks and the tubes (OpenEar mm)
const centroidOf = pos => { const c = [0, 0, 0], n = pos.length / 3; for (let i = 0; i < pos.length; i++) c[i % 3] += pos[i] / n; return c; };
const castGrid = makeGrid(cast.positions, .7), stapesPts = oe.stapes.positions;
// the footplate is the part of the stapes that touches the vestibule wall
const footplate = []; for (let i = 0; i < stapesPts.length; i += 3) if (castGrid.nearest(stapesPts[i], stapesPts[i + 1], stapesPts[i + 2], 8).dist < .6) footplate.push(stapesPts[i], stapesPts[i + 1], stapesPts[i + 2]);
if (footplate.length < 30) throw new Error('The stapes footplate does not touch the vestibule wall of the registered cast');
const footplateCentre = centroidOf(Float64Array.from(footplate)), footGrid = makeGrid(Float64Array.from(footplate), .5);
const footDistance = (() => { const q = castGrid.nearest(...footplateCentre, 8); return q.dist; })();
// oval window: the cast triangles of the vestibule piece within 0.5 mm of the footplate
const markOn = (piece, near, radius) => { const keep = [], g = near; for (let t = 0; t < piece.indices.length; t += 3) { const c = [0, 1, 2].map(k => (piece.positions[piece.indices[t] * 3 + k] + piece.positions[piece.indices[t + 1] * 3 + k] + piece.positions[piece.indices[t + 2] * 3 + k]) / 3); if (g.nearest(c[0], c[1], c[2], 8).dist < radius) keep.push(piece.indices[t], piece.indices[t + 1], piece.indices[t + 2]); } return keep; };
const compact = (positions, indexList) => { const map = new Map(), pos = [], idx = []; for (const v of indexList) { let n = map.get(v); if (n === undefined) { n = pos.length / 3; map.set(v, n); pos.push(positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]); } idx.push(n); } return {positions: Float32Array.from(pos), indices: Uint32Array.from(idx), map}; };
const labelIndex = Object.fromEntries(groups.map(([n], i) => [n, i]));
const vestibulePiece = castParts[labelIndex.vestibule];
const ovalList = markOn(vestibulePiece, footGrid, .85);
if (ovalList.length < 12) throw new Error('Oval window mark is empty');
const oval = compact(vestibulePiece.positions, ovalList);
// round window: the open base of the scala tympani that faces the tympanic cavity = the scala tympani vertices nearest the tympanic membrane
const tmC = centroidOf(oe.membrane.positions), stPos = oe.scalaTympani.positions;
let rwIdx = 0, rwBest = Infinity; for (let i = 0; i < stPos.length; i += 3) { const d = Math.hypot(stPos[i] - tmC[0], stPos[i + 1] - tmC[1], stPos[i + 2] - tmC[2]); if (d < rwBest) { rwBest = d; rwIdx = i; } }
const rwCentre = [stPos[rwIdx], stPos[rwIdx + 1], stPos[rwIdx + 2]], rwGrid = makeGrid(Float64Array.from(rwCentre), 1);
const rwList = markOn(oe.scalaTympani, rwGrid, 1.1), round = compact(stPos, rwList);

// ---- placement in the body atlas frame (metres)
// OpenEar mm -> IE-Map RAS mm -> body frame (X left = -R, Y up = S, Z front = A).
const toRAS = p => { const q = [p[0] - reg.t[0], p[1] - reg.t[1], p[2] - reg.t[2]]; return [0, 1, 2].map(i => reg.R[0][i] * q[0] + reg.R[1][i] * q[1] + reg.R[2][i] * q[2]); };
const toSite = p => { const r = toRAS(p); return [-r[0], r[2], r[1]]; }; // mm, body-frame axes, origin at the IE-Map origin
// BodyParts3D right auricle (one mesh holds both ears: take the triangles on the right, x < 0) and the opening of its concha
const atlas = JSON.parse(fs.readFileSync(path.join(atlasDir, 'atlas.json')));
const auricleSource = (() => {
  const p = atlas.parts.find(x => x.id === 'FJ2811'); if (!p) throw new Error('Atlas part FJ2811 (External ear) is missing');
  const b = fs.readFileSync(path.join(atlasDir, atlas.chunks[p.chunk].url.split('/').pop()));
  const pos = new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12)), idx = new Uint32Array(b.buffer.slice(b.byteOffset + p.indices, b.byteOffset + p.indices + p.indexCount * 4));
  const keep = []; for (let t = 0; t < idx.length; t += 3) if ((pos[idx[t] * 3] + pos[idx[t + 1] * 3] + pos[idx[t + 2] * 3]) / 3 < 0) keep.push(idx[t], idx[t + 1], idx[t + 2]);
  const c = compact(pos, keep); return {positions: c.positions, indices: c.indices};
})();
// the packaged auricle mesh is coarse (415 vertices): two levels of Loop subdivision smooth it and stay on the original shape (distances to the original surface are written to the package)
const auricleSmooth = (() => {
  const mm = Float32Array.from(auricleSource.positions, v => v * 1000); let m = {positions: mm, indices: auricleSource.indices};
  for (let level = 0; level < 2; level++) m = loopSubdivide(m.positions, m.indices);
  const toOriginal = surfaceDistance(m.positions, mm, auricleSource.indices), fromOriginal = surfaceDistance(mm, m.positions, m.indices);
  return {positions: Float32Array.from(m.positions, v => v / 1000), indices: m.indices, fit: {sourceVertices: auricleSource.positions.length / 3, sourcePieces: connectivity(auricleSource.positions.length / 3, auricleSource.indices).pieces, vertices: m.positions.length / 3, levels: 2, method: 'Loop subdivision',
    toOriginalMm: {max: +toOriginal.max.toFixed(3), mean: +toOriginal.mean.toFixed(3)}, fromOriginalMm: {max: +fromOriginal.max.toFixed(3), mean: +fromOriginal.mean.toFixed(3)}}};
})();
// the concha opening: the most medial point of the right auricle, well inside its outline (this is where the auricle surface is open towards the canal)
const PORUS_MM = [-61.8, 1582.7, -15.4]; // concha opening in the body frame, mm (read from the packaged auricle: the gap of the concha floor)
const porus = v3.mul(PORUS_MM, .001);
const tmSite = toSite(tmC);
const CANAL_AXIS = v3.norm([.92, -.02, .39]); // from the concha opening towards the tympanic membrane (medial = +X for the right ear, slightly forward)
const CANAL_LENGTH = 25; // mm, concha opening to the centre of the membrane (adult mean about 25 mm)
const tmWanted = v3.add(porus, v3.mul(CANAL_AXIS, CANAL_LENGTH * .001));
const T = v3.sub(tmWanted, v3.mul(tmSite, .001)); // translation of the specimen (metres)
const place = p => v3.add(T, v3.mul(toSite(p), .001));
const placeMesh = m => ({...m, positions: mapPositions(m.positions, place)});
// a mirror-free rotation keeps the faces outward
const detSite = (() => { const a = toSite([1, 0, 0]).map((v, i) => v - toSite([0, 0, 0])[i]), b = toSite([0, 1, 0]).map((v, i) => v - toSite([0, 0, 0])[i]), c = toSite([0, 0, 1]).map((v, i) => v - toSite([0, 0, 0])[i]); return v3.dot(a, v3.cross(b, c)); })();
if (detSite < 0) throw new Error('The placement mirrors the specimen');

// ---- tubes built from the anatomy (in specimen mm, placed afterwards)
// inverse of `place` for a body-frame point (metres) -> specimen mm
const fromRAS = r => [0, 1, 2].map(k => reg.R[k][0] * r[0] + reg.R[k][1] * r[1] + reg.R[k][2] * r[2] + reg.t[k]);
const unplace = p => { const s = v3.mul(v3.sub(p, T), 1000); return fromRAS([-s[0], s[2], s[1]]); }; // site(mm) = (-r0, r2, r1)
// external acoustic meatus: lofted from the rim of the tympanic membrane to an ellipse at the concha opening
const tmAxes = principalAxes(oe.membrane.positions), tmNormal = (() => { const n = tmAxes.vecs[0], lateral = v3.sub(unplace(v3.add(porus, [0, 0, 0])), tmC); return v3.dot(n, lateral) > 0 ? n : v3.mul(n, -1); })();
const U0 = v3.norm(tmAxes.vecs[2]), V0 = v3.cross(tmNormal, U0);
const RING = 40, rimRadius = new Float64Array(RING).fill(0), rimPoint = new Array(RING).fill(null);
{ const P = oe.membrane.positions; for (let i = 0; i < P.length; i += 3) { const d = v3.sub([P[i], P[i + 1], P[i + 2]], tmC), a = v3.dot(d, U0), b = v3.dot(d, V0), bin = Math.min(RING - 1, Math.floor((Math.atan2(b, a) + Math.PI) / (2 * Math.PI) * RING)), r = Math.hypot(a, b); if (r > rimRadius[bin]) { rimRadius[bin] = r; rimPoint[bin] = [P[i], P[i + 1], P[i + 2]]; } } }
if (rimPoint.some(p => !p)) throw new Error('The tympanic membrane rim has gaps');
const rimC = [0, 1, 2].map(k => rimPoint.reduce((s, p) => s + p[k], 0) / RING);
const rim = rimPoint.map(p => { const d = v3.sub(p, rimC); return {a: v3.dot(d, U0), b: v3.dot(d, V0), c: v3.dot(d, tmNormal)}; });
const porusSpec = unplace(porus), axisSpec = v3.norm(v3.sub(unplace(v3.add(porus, v3.mul(CANAL_AXIS, .001))), porusSpec)); // canal axis in specimen frame
// ellipse at the opening: radius along the specimen "up" (superior) and along the front-back direction
const upSpec = v3.norm(v3.sub(unplace(v3.add(porus, [0, .001, 0])), porusSpec));
const EAC = (() => {
  const reach = 9, c0 = rimC, c3 = porusSpec, c1 = v3.add(c0, v3.mul(tmNormal, reach)), c2 = v3.sub(c3, v3.mul(axisSpec, reach)), STEPS = 26, rings = [];
  const pts = [], tans = []; for (let s = 0; s <= STEPS; s++) { const t = s / STEPS; pts.push(bezier(c0, c1, c2, c3, t)); tans.push(bezierTangent(c0, c1, c2, c3, t)); }
  const fr = frames(pts, tans, U0); const EA = 4.4, EB = 4.0; // radii at the opening, mm
  // the ring's own frame at the membrane is (U0,V0,N); along the canal it follows the transported frame
  const f0 = fr[0], flip = v3.dot(f0.v, V0) < 0 ? -1 : 1;
  for (let s = 0; s <= STEPS; s++) {
    const t = s / STEPS, w = smooth(Math.min(1, t * 1.15)), f = fr[s], ring = [];
    for (let i = 0; i < RING; i++) {
      const r = rim[i], th = Math.atan2(r.b, r.a);
      const local = v3.add(v3.add(v3.mul(f.u, r.a), v3.mul(f.v, r.b * flip)), v3.mul(f.t, r.c));
      const open = v3.add(v3.mul(f.u, EA * Math.cos(th)), v3.mul(f.v, EB * Math.sin(th) * flip));
      ring.push(v3.add(f.c, v3.add(v3.mul(local, 1 - w), v3.mul(open, w))));
    }
    rings.push(ring);
  }
  // the first ring has to be the membrane rim exactly
  rings[0] = rimPoint.map(p => p.slice());
  return wallTube(rings, .9);
})();
// pharyngotympanic tube: from the front wall of the tympanic cavity (just in front of the membrane, medial to it) forwards, medially and down to the nasopharynx
const TUBE_SPEC = {ISTHMUS: .33, A0: 1.3, B0: 1.0, AI: .6, BI: .45, A_END: 1.9, B_END: .8};
const TUBE = (() => {
  // site-frame direction: medial (+X), forward (+Z), down (-Y)
  const dirSite = v3.norm([.42, -.46, .78]), startSite = v3.add(tmWanted, v3.mul(v3.norm([.45, .05, .89]), .0072));
  const dirSpec = v3.norm(v3.sub(unplace(v3.add(startSite, v3.mul(dirSite, .001))), unplace(startSite))), startSpec = unplace(startSite);
  const length = 37, STEPS = 36, up = v3.norm(v3.sub(unplace(v3.add(startSite, [0, .001, 0])), startSpec)), rings = [];
  const pts = [], tans = []; for (let s = 0; s <= STEPS; s++) { pts.push(v3.add(startSpec, v3.mul(dirSpec, length * s / STEPS))); tans.push(dirSpec); }
  const fr = frames(pts, tans, up);
  // lumen half-height a (vertical) and half-width b (mm): the bony part (first third) is narrow and round, the isthmus (about a third of the way) is the narrowest point,
  // the cartilaginous part widens steadily into a vertical slit towards the opening in the nasopharynx. The wall is 0.4 mm, so the outer radius never exceeds A_END + 0.4.
  const {ISTHMUS, A0, B0, AI, BI, A_END, B_END} = TUBE_SPEC;
  const ease = x => smooth(Math.max(0, Math.min(1, x)));
  for (let s = 0; s <= STEPS; s++) {
    const t = s / STEPS, w0 = ease(t / ISTHMUS), w1 = ease((t - ISTHMUS) / (1 - ISTHMUS));
    const a = t <= ISTHMUS ? A0 + (AI - A0) * w0 : AI + (A_END - AI) * w1, b = t <= ISTHMUS ? B0 + (BI - B0) * w0 : BI + (B_END - BI) * w1, f = fr[s], ring = [];
    for (let i = 0; i < 24; i++) { const th = i / 24 * 2 * Math.PI; ring.push(v3.add(f.c, v3.add(v3.mul(f.u, a * Math.cos(th)), v3.mul(f.v, b * Math.sin(th))))); }
    rings.push(ring);
  }
  return wallTube(rings, .4);
})();

// ---- assemble the parts (body frame)
const segments = [], parts = [];
let offset = 0;
const push = array => { const at = offset, b = Buffer.from(array.buffer, array.byteOffset, array.byteLength); segments.push(b); offset += b.length; const pad = (4 - offset % 4) % 4; if (pad) { segments.push(Buffer.alloc(pad)); offset += pad; } return at; };
// Closed solids are written with their faces pointing outward (the viewer shows the inside of a cut with a flat tint, which needs the front faces to be the outer ones): the sources differ in winding, and the placement may mirror a specimen.
const CLOSED = new Set(['malleus', 'incus', 'stapes', 'scala-tympani', 'utricle', 'saccule', 'anterior-duct', 'lateral-duct', 'posterior-duct', 'anterior-ampulla', 'lateral-ampulla', 'posterior-ampulla', 'facial-nerve', 'chorda-tympani', 'cochlear-nerve', 'external-acoustic-meatus', 'pharyngotympanic-tube']);
// the vestibule, the three canals and the scala vestibuli are open pieces of one closed cast: they turn together, by the orientation of the whole cast
const CAST_PIECES = new Set(['vestibule', 'anterior-canal', 'lateral-canal', 'posterior-canal', 'scala-vestibuli']);
const castFlipped = (() => { const m = placeMesh(oe.scalaVestibuli); return signedVolume(m.positions, Uint32Array.from(m.indices)) < 0; })();
const flipped = [];
const add = (id, mesh, normals, extra = {}) => {
  const positions = mesh.positions instanceof Float32Array ? mesh.positions : Float32Array.from(mesh.positions);
  let indices = Uint32Array.from(mesh.indices);
  if (CAST_PIECES.has(id) ? castFlipped : CLOSED.has(id) && signedVolume(positions, indices) < 0) {
    for (let i = 0; i < indices.length; i += 3) { const t = indices[i + 1]; indices[i + 1] = indices[i + 2]; indices[i + 2] = t; }
    normals = Int16Array.from(normals, v => -v); flipped.push(id);
  }
  parts.push({id, vertexCount: positions.length / 3, indexCount: indices.length, bounds: bounds(positions), positions: push(positions), normals: push(normals), indices: push(indices), ...extra});
};
const addMesh = (id, specimenMesh, extra) => { const m = placeMesh(specimenMesh); add(id, m, vertexNormals(m.positions, m.indices), extra); };
const addPiece = (id, piece, labelIdx, extra) => { const m = placeMesh(piece), n = castNormalsOf(piece, labelIdx); add(id, m, n, extra); };

add('auricle', auricleSmooth, vertexNormals(auricleSmooth.positions, auricleSmooth.indices));
addMesh('external-acoustic-meatus', EAC);
addMesh('tympanic-membrane', oe.membrane);
addMesh('malleus', oe.malleus); addMesh('incus', oe.incus); addMesh('stapes', oe.stapes);
addMesh('pharyngotympanic-tube', TUBE);
addPiece('vestibule', castParts[labelIndex.vestibule], labelIndex.vestibule);
addPiece('anterior-canal', castParts[labelIndex.anterior], labelIndex.anterior);
addPiece('lateral-canal', castParts[labelIndex.lateral], labelIndex.lateral);
addPiece('posterior-canal', castParts[labelIndex.posterior], labelIndex.posterior);
addPiece('scala-vestibuli', castParts[labelIndex.cochlea], labelIndex.cochlea);
addMesh('scala-tympani', oe.scalaTympani);
{ const m = placeMesh(oval); add('oval-window', m, vertexNormals(m.positions, m.indices), {mark: 'vestibule'}); }
{ const m = placeMesh(round); add('round-window', m, vertexNormals(m.positions, m.indices), {mark: 'scala-tympani'}); }
addMesh('utricle', ieOE.utricle); addMesh('saccule', ieOE.saccule);
addMesh('anterior-duct', ieOE.sa); addMesh('lateral-duct', ieOE.sl); addMesh('posterior-duct', ieOE.sp);
addMesh('anterior-ampulla', ieOE.aa); addMesh('lateral-ampulla', ieOE.al); addMesh('posterior-ampulla', ieOE.ap);
// the facial and cochlear nerve meshes are wider than the nerves (the facial one includes its sheath, the cochlear one the bundle in the internal acoustic meatus):
// they are slimmed towards their own centre line (a smooth radial move, topology unchanged, so the tubes stay one continuous piece) to the radius caps below (mm)
const NERVE_CAP = {facial: .5, cochlear: .75};
const slim = (mesh, cap) => ({...mesh, positions: slimTube(mesh.positions, mesh.indices, {target: cap, reach: 6}).positions});
const nerveStats = {};
for (const [key, cap, id] of [['facial', NERVE_CAP.facial, 'facial-nerve'], ['cochlearNerve', NERVE_CAP.cochlear, 'cochlear-nerve']]) {
  const before = radiusStats(oe[key].positions, oe[key].indices, 6); oe[key] = slim(oe[key], cap); const after = radiusStats(oe[key].positions, oe[key].indices, 6);
  nerveStats[id] = {capMm: cap, beforeMm: {median: +before.median.toFixed(2), p95: +before.p95.toFixed(2)}, afterMm: {median: +after.median.toFixed(2), p95: +after.p95.toFixed(2)}, pieces: connectivity(oe[key].positions.length / 3, oe[key].indices).pieces};
}
addMesh('facial-nerve', oe.facial); addMesh('chorda-tympani', oe.chorda); addMesh('cochlear-nerve', oe.cochlearNerve);

// ---- checks of the placement (printed; the test script repeats the ones that matter)
const centre = id => { const b = parts.find(p => p.id === id).bounds; return [0, 1, 2].map(k => (b[0][k] + b[1][k]) / 2); };
const meatusPorus = (() => { const b = parts.find(p => p.id === 'external-acoustic-meatus'); return b; })();
const footSite = place(footplateCentre);
const bin = Buffer.concat(segments), gz = gzipSync(bin, {level: 9});
fs.mkdirSync(out, {recursive: true});
fs.writeFileSync(new URL('ear-atlas.bin.gz', out), gz);
fs.writeFileSync(new URL('ear-atlas.json', out), JSON.stringify({
  side: 'right', bytes: bin.length, gzip: 'models/ear/ear-atlas.bin.gz', gzipBytes: gz.length,
  frame: 'body atlas frame in metres: X left, Y up, Z front; the right ear lies at negative X',
  registration: {method: 'rigid iterative closest point (scale fixed at 1) of the IE-Map scalae and semicircular canals onto the OpenEar perilymphatic spaces; IE-Map files in 3D Slicer RAS', R: reg.R, t: reg.t, errorMm: registrationError},
  placement: {porus: porus.map(v => +v.toFixed(5)), canalLengthMm: CANAL_LENGTH, translation: T.map(v => +v.toFixed(6)), footplateToVestibuleWallMm: +footDistance.toFixed(2), footplateCentre: footSite.map(v => +v.toFixed(6)),
    ovalWindowTriangles: oval.indices.length / 3, roundWindowTriangles: round.indices.length / 3},
  refinement: {auricle: auricleSmooth.fit, nerves: nerveStats, tube: {lumenHalfHeightWidthMm: {tympanicEnd: [TUBE_SPEC.A0, TUBE_SPEC.B0], isthmus: [TUBE_SPEC.AI, TUBE_SPEC.BI], pharyngealEnd: [TUBE_SPEC.A_END, TUBE_SPEC.B_END]}, isthmusAt: TUBE_SPEC.ISTHMUS, wallMm: .4, lengthMm: 37}},
  labelling: Object.fromEntries(groups.map(([n], i) => [n, castParts[i] ? castParts[i].indices.length / 3 : 0])),
  sources: {
    innerEar: {name: 'IE-Map', url: 'https://github.com/pydsgz/IEMap', license: 'CC BY 4.0'},
    middleEar: {name: 'OpenEar example set (specimen Delta)', url: 'https://doi.org/10.5281/zenodo.4362584', license: 'CC BY 4.0'},
    auricle: {name: 'BodyParts3D 4.0 (right External ear, FJ2811)', license: 'CC BY 4.0'},
  },
  parts,
}));
console.log('faces turned outward:', flipped.join(', ') || 'none');
console.log(`ear-atlas: ${parts.length} parts, ${(bin.length / 1e6).toFixed(2)} MB (${(gz.length / 1e6).toFixed(2)} MB gzip)`);
console.log('registration error (mm):', JSON.stringify(registrationError));
console.log('footplate to vestibule wall', footDistance.toFixed(2), 'mm; oval', oval.indices.length / 3, 'round', round.indices.length / 3, 'triangles; labelling', JSON.stringify(Object.fromEntries(groups.map(([n], i) => [n, castParts[i]?.indices.length / 3]))));
console.log('EAC volume', signedVolume(placeMesh(EAC).positions, EAC.indices).toExponential(2), 'tube volume', signedVolume(placeMesh(TUBE).positions, TUBE.indices).toExponential(2));
