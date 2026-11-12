// Female reproductive anatomy from the Human Reference Atlas (CC BY 4.0), registered onto the BodyParts3D pelvis and packaged like the supplement
// structures. The pieces come from scripts/data/hra-female-pelvis.json.gz (extract-hra-female.mjs). The pelvic bones in the atlas stay the male
// BodyParts3D pelvis; the organs are scaled and placed so the uterus sits above the bladder and in front of the rectum. Educational placement only.
// The female pelvic bones (scripts/data/hra-female-pelvis-bones.json.gz, extract-hra-pelvis-bones.mjs) replace the male hip bones and sacrum when the sex is female.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createStream, simplify, weldByPosition} from './lib/stream-writer.mjs';
import {atlasPositions} from './lib/atlas-read.mjs';

const root = new URL('../', import.meta.url), out = new URL('public/models/stream/', root), dir = new URL('public/models/female/', root);
fs.mkdirSync(out, {recursive: true}); fs.mkdirSync(dir, {recursive: true});
const source = JSON.parse(gunzipSync(fs.readFileSync(new URL('data/hra-female-pelvis.json.gz', import.meta.url))));
// HRA frame (metres, +y up, +z anterior) → BodyParts3D atlas frame. The similarity transform comes from scripts/fit-female-pelvis.mjs, which registers the HRA
// pelvic bones onto the atlas pelvis with the two femoral head centres as landmarks; the organs use the same transform so they stay inside their own pelvis.
const reg = JSON.parse(fs.readFileSync(new URL('data/female-pelvis-registration.json', import.meta.url)));
const toAtlas = (x, y, z) => reg.rotation.map((r, k) => reg.scale * (r[0] * x + r[1] * y + r[2] * z) + reg.translation[k]);

const NAMES = [ // [regex on HRA node name, English (without side), Chinese, system, paired]
  [/^VH_F_body_of_uterus$/, 'Body of uterus', '子宮體', 'reproductive', false],
  [/^VH_F_fundus_of_uterus$/, 'Fundus of uterus', '子宮底', 'reproductive', false],
  [/^VH_F_lower_uterine_segment$/, 'Lower uterine segment', '子宮下段', 'reproductive', false],
  [/^VH_F_cervix$/, 'Cervix of uterus', '子宮頸', 'reproductive', false],
  [/^VH_F_vagina$/, 'Vagina', '陰道', 'reproductive', false],
  [/^VH_F_cervicovaginal_junction$/, 'Cervicovaginal junction', '子宮頸陰道交界', 'reproductive', false],
  [/^VH_F_broad_ligament$/, 'Broad ligament of uterus', '子宮闊韌帶', 'reproductive', false],
  [/round_ligament_of_uterus$/, 'Round ligament of uterus', '子宮圓韌帶', 'reproductive', true],
  [/uterosacral_ligament$/, 'Uterosacral ligament', '子宮骶韌帶', 'reproductive', true],
  [/cardinal_ligament_of_uterus$/, 'Cardinal ligament of uterus', '子宮主韌帶（子宮頸橫韌帶）', 'reproductive', true],
  [/^VH_F_suspensory_ligament_of_ovary_[LR]$/, 'Suspensory ligament of ovary', '卵巢懸韌帶', 'reproductive', true],
  [/^VH_F_ovarian_ligament_[LR]$/, 'Ovarian ligament', '卵巢固有韌帶', 'reproductive', true],
  [/^VH_F_mesovarium_[LR]$/, 'Mesovarium', '卵巢繫膜', 'reproductive', true],
  [/_ovary$/, 'Ovary', '卵巢', 'reproductive', true],
  [/^VH_F_ampulla_of_uterine_tube_[LR]$/, 'Ampulla of uterine tube', '輸卵管壺腹', 'reproductive', true],
  [/^VH_F_isthmus_of_fallopian_tube_[LR]$/, 'Isthmus of uterine tube', '輸卵管峽部', 'reproductive', true],
  [/^VH_F_fibria_of_uterine_tube_[LR]$/, 'Fimbriae of uterine tube', '輸卵管繖', 'reproductive', true],
  [/^VH_F_uterine_tube_infundibulum_[LR]$/, 'Infundibulum of uterine tube', '輸卵管漏斗', 'reproductive', true],
  [/uterine_artery$/, 'Uterine artery', '子宮動脈', 'arterial', true],
  [/uterine_vein$/, 'Uterine vein', '子宮靜脈', 'venous', true],
];
// The HRA file labels two round ligaments with the wrong side; laterality here always comes from where the piece lies (+x = the body's left).
const decode = (text, Type) => {const b = Buffer.from(text, 'base64'); return new Type(b.buffer.slice(b.byteOffset, b.byteOffset + b.length));};
const stream = createStream(out, 'female'), report = [];
for (const piece of source.pieces) {
  const rule = NAMES.find(r => r[0].test(piece.name));
  if (!rule) throw new Error('unmapped HRA piece ' + piece.name);
  const raw = decode(piece.positions, Float32Array), positions = new Float32Array(raw.length);
  for (let i = 0; i < raw.length; i += 3) positions.set(toAtlas(raw[i], raw[i + 1], raw[i + 2]), i);
  const welded = weldByPosition(positions, decode(piece.indices, Uint32Array));
  const {positions: p, indices: ix} = await simplify(welded.positions, welded.indices, 7000, .004);
  let cx = 0; for (let i = 0; i < p.length; i += 3) cx += p[i]; cx /= p.length / 3;
  const side = rule[4] ? (cx > 0 ? 'Left' : 'Right') : '';
  const name = rule[4] ? `${side} ${rule[1][0].toLowerCase()}${rule[1].slice(1)}` : rule[1];
  stream.add({id: `HRAF-${piece.node}`, conceptId: `HRAF-${piece.node}`, name, system: rule[3], sex: 'female', chineseName: (rule[4] ? (side === 'Left' ? '左' : '右') : '') + rule[2], sourceNode: piece.name}, p, ix);
  report.push(`${name}: ${welded.indices.length / 3} → ${ix.length / 3} tris`);
}
// Pelvic bones: one hip bone per side (ilium + ischium + pubis compact bone), sacrum, coccyx.
const bonesSource = JSON.parse(gunzipSync(fs.readFileSync(new URL('data/hra-female-pelvis-bones.json.gz', import.meta.url))));
const boneGroups = [['hip', /_(ilium|ischium|pubis)_compact_bone_L$/, 'Left hip bone', '左髖骨'], ['hip', /_(ilium|ischium|pubis)_compact_bone_R$/, 'Right hip bone', '右髖骨'],
  ['sacrum', /^VH_F_sacrum$/, 'Sacrum', '薦骨'], ['coccyx', /^VH_F_coccyx$/, 'Coccyx', '尾骨']];
for (const [key, re, name, zh] of boneGroups) {
  const pieces = bonesSource.pieces.filter(p => re.test(p.name)); if (!pieces.length) throw new Error('missing HRA bone ' + re);
  const pos = [], idx = []; let base = 0;
  for (const piece of pieces) {
    const raw = decode(piece.positions, Float32Array), ix = decode(piece.indices, Uint32Array);
    for (let i = 0; i < raw.length; i += 3) pos.push(...toAtlas(raw[i], raw[i + 1], raw[i + 2]));
    for (const i of ix) idx.push(i + base); base += raw.length / 3;
  }
  const welded = weldByPosition(Float32Array.from(pos), Uint32Array.from(idx));
  const {positions: p, indices: ix} = await simplify(welded.positions, welded.indices, key === 'hip' ? 16000 : key === 'sacrum' ? 9000 : 2500, .002);
  stream.add({id: `HRAF-bone-${name.replace(/ /g, '-')}`, conceptId: `HRAF-bone-${name.replace(/ /g, '-')}`, name, system: 'skeletal', sex: 'female', chineseName: zh, sourceNode: pieces.map(q => q.name).join(' + ')}, p, ix);
  report.push(`${name}: ${welded.indices.length / 3} → ${ix.length / 3} tris`);
}
// Pelvic viscera from the same HRA set (scripts/data/hra-female-pelvis-viscera.json.gz): urinary bladder, ureters, vesicouterine pouch, mesosalpinx, uterine
// cornua. In female mode they replace the male bladder, ureters and urethra of the atlas (app/mj-sex.ts), because the male bladder fills the space the uterus occupies.
// The female urethra and the rectouterine pouch are not in the HRA set; they are built here from the neighbouring meshes and marked as schematic.
const viscera = JSON.parse(gunzipSync(fs.readFileSync(new URL('data/hra-female-pelvis-viscera.json.gz', import.meta.url))));
const mapped = piece => { const raw = decode(piece.positions, Float32Array), p = new Float32Array(raw.length); for (let i = 0; i < raw.length; i += 3) p.set(toAtlas(raw[i], raw[i + 1], raw[i + 2]), i); return {positions: p, indices: decode(piece.indices, Uint32Array)}; };
const merged = list => { const pos = [], idx = []; let base = 0; for (const g of list) { pos.push(...g.positions); for (const i of g.indices) idx.push(i + base); base += g.positions.length / 3; } return {positions: Float32Array.from(pos), indices: Uint32Array.from(idx)}; };
const vis = re => viscera.pieces.filter(p => re.test(p.name)).map(mapped);
const centroid = P => { const c = [0, 0, 0]; for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) c[k] += P[i + k] / (P.length / 3); return c; };
async function addMesh(meta, geom, maxTriangles, error = .004) {
  const welded = weldByPosition(geom.positions, geom.indices), {positions: p, indices: ix} = await simplify(welded.positions, welded.indices, maxTriangles, error);
  stream.add({id: `HRAF-${meta.name.replace(/ /g, '-')}`, conceptId: `HRAF-${meta.name.replace(/ /g, '-')}`, sex: 'female', ...meta}, p, ix);
  report.push(`${meta.name}: ${welded.indices.length / 3} → ${ix.length / 3} tris`);
}
const sideOf = P => centroid(P)[0] > 0 ? 'Left' : 'Right', zhSide = side => side === 'Left' ? '左' : '右';

await addMesh({name: 'Urinary bladder', system: 'urinary', chineseName: '膀胱'}, merged(vis(/bladder_(dome|base|neck)|bladder_dome|urinary_bladder_neck/)), 9000);
await addMesh({name: 'Trigone of urinary bladder', system: 'urinary', chineseName: '膀胱三角'}, merged(vis(/trigone/)), 1500);
await addMesh({name: 'Vesicouterine pouch', system: 'serous', chineseName: '膀胱子宮陷凹'}, merged(vis(/uterovesical_pouch/)), 6000);
await addMesh({name: 'Uterine cornua', system: 'reproductive', chineseName: '子宮角'}, merged(vis(/cornua/)), 1500);
for (const g of vis(/mesosalpinx/)) { const side = sideOf(g.positions); await addMesh({name: `${side} mesosalpinx`, system: 'reproductive', chineseName: `${zhSide(side)}輸卵管繫膜`}, g, 3000); }
// Ureters: the HRA ureter is shorter than the atlas one (the HRA kidney sits lower relative to the pelvis), so it is stretched along its length and shifted
// sideways in proportion, which keeps the bladder end where it is and puts the top end at the atlas renal pelvis.
for (const g of vis(/_ureter$/)) {
  const side = sideOf(g.positions), P = g.positions, atlasP = atlasPositions(`${side} ureter`);
  const top = A => { let y = -Infinity; for (let i = 1; i < A.length; i += 3) y = Math.max(y, A[i]); const sel = []; for (let i = 0; i < A.length; i += 3) if (A[i + 1] > y - .005) sel.push(A[i], A[i + 1], A[i + 2]); return centroid(Float32Array.from(sel)); };
  const hTop = top(P), aTop = top(atlasP); let yb = Infinity; for (let i = 1; i < P.length; i += 3) yb = Math.min(yb, P[i]);
  const out = new Float32Array(P.length);
  for (let i = 0; i < P.length; i += 3) {
    const t = Math.max(0, Math.min(1, (P[i + 1] - yb) / (hTop[1] - yb)));
    out[i] = P[i] + (aTop[0] - hTop[0]) * t; out[i + 1] = yb + (P[i + 1] - yb) * ((aTop[1] - yb) / (hTop[1] - yb)); out[i + 2] = P[i + 2] + (aTop[2] - hTop[2]) * t;
  }
  await addMesh({name: `${side} ureter`, system: 'urinary', chineseName: `${zhSide(side)}輸尿管`}, {positions: out, indices: g.indices}, 6000);
}

// Female urethra: a short tube from the bladder neck down the front wall of the vagina, 4 cm long, 6 mm across.
const tube = (pts, radius, sides = 14) => {
  const pos = [], idx = [];
  pts.forEach((c, k) => { const next = pts[Math.min(k + 1, pts.length - 1)], prev = pts[Math.max(k - 1, 0)], d = next.map((v, i) => v - prev[i]), l = Math.hypot(...d) || 1, a = d.map(v => v / l);
    const ref = Math.abs(a[0]) < .9 ? [1, 0, 0] : [0, 1, 0], u0 = [a[1] * ref[2] - a[2] * ref[1], a[2] * ref[0] - a[0] * ref[2], a[0] * ref[1] - a[1] * ref[0]], ul = Math.hypot(...u0), u = u0.map(v => v / ul), v = [a[1] * u[2] - a[2] * u[1], a[2] * u[0] - a[0] * u[2], a[0] * u[1] - a[1] * u[0]];
    for (let j = 0; j < sides; j++) { const th = 2 * Math.PI * j / sides; pos.push(...c.map((x, i) => x + radius * (Math.cos(th) * u[i] + Math.sin(th) * v[i]))); } });
  for (let k = 0; k < pts.length - 1; k++) for (let j = 0; j < sides; j++) { const a = k * sides + j, b = k * sides + (j + 1) % sides; idx.push(a, b, a + sides, b, b + sides, a + sides); }
  const n = pos.length / 3; pos.push(...pts[0], ...pts[pts.length - 1]);
  for (let j = 0; j < sides; j++) { idx.push(n, (j + 1) % sides, j); const e = (pts.length - 1) * sides; idx.push(n + 1, e + j, e + (j + 1) % sides); }
  return {positions: Float32Array.from(pos), indices: Uint32Array.from(idx)};
};
{
  const vagina = mapped(source.pieces.find(q => q.name === 'VH_F_vagina')).positions, neck = centroid(merged(vis(/urinary_bladder_neck/)).positions);
  const frontAt = y => { let z = -Infinity; for (let i = 0; i < vagina.length; i += 3) if (Math.abs(vagina[i + 1] - y) < .003 && Math.abs(vagina[i] - neck[0]) < .012) z = Math.max(z, vagina[i + 2]); return z; };
  let yEnd = Infinity; for (let i = 1; i < vagina.length; i += 3) yEnd = Math.min(yEnd, vagina[i]); yEnd += .004;
  const pts = []; for (let k = 0; k <= 8; k++) { const y = neck[1] + (yEnd - neck[1]) * k / 8, z = k === 0 ? neck[2] : Math.max(frontAt(y), -Infinity) + .0045; pts.push([neck[0], y, Number.isFinite(z) ? z : neck[2]]); }
  await addMesh({name: 'Female urethra', system: 'urinary', chineseName: '女性尿道', schematic: true}, tube(pts, .003), 1200);
}
// Rectouterine pouch: the peritoneal recess between the back of the cervix and uterus and the front of the rectum (a flattened ellipsoid in the gap, schematic).
{
  const uterus = merged(source.pieces.filter(q => /^VH_F_(cervix|lower_uterine_segment|body_of_uterus)$/.test(q.name)).map(mapped)).positions, rectum = atlasPositions('Rectum');
  const slab = (P, y, xw, pick) => { let r = pick === 'min' ? Infinity : -Infinity, any = false; for (let i = 0; i < P.length; i += 3) if (Math.abs(P[i + 1] - y) < .004 && Math.abs(P[i]) < xw) { r = pick === 'min' ? Math.min(r, P[i + 2]) : Math.max(r, P[i + 2]); any = true; } return any ? r : null; };
  const y0 = .875, ys = [.86, .87, .88, .89], gaps = ys.map(y => (slab(uterus, y, .02, 'min') ?? 0) - (slab(rectum, y, .025, 'max') ?? 0)), c0 = (slab(uterus, y0, .02, 'min') + slab(rectum, y0, .025, 'max')) / 2;
  const half = Math.max(.0015, Math.min(.006, Math.min(...gaps) / 2 - .001)), cx = centroid(uterus)[0], pos = [], idx = [], nu = 24, nv = 14;
  for (let a = 0; a <= nv; a++) for (let b = 0; b < nu; b++) { const th = Math.PI * a / nv, ph = 2 * Math.PI * b / nu; pos.push(cx + .022 * Math.sin(th) * Math.cos(ph), y0 + .02 * Math.cos(th), c0 + half * Math.sin(th) * Math.sin(ph)); }
  for (let a = 0; a < nv; a++) for (let b = 0; b < nu; b++) { const i = a * nu + b, j = a * nu + (b + 1) % nu; idx.push(i, j, i + nu, j, j + nu, i + nu); }
  await addMesh({name: 'Rectouterine pouch', system: 'serous', chineseName: '直腸子宮陷凹', schematic: true}, {positions: Float32Array.from(pos), indices: Uint32Array.from(idx)}, 1500);
}

const info = stream.finish({source: source.source, license: source.license, doi: source.doi, authors: source.authors, sourceSha256: source.sourceSha256,
  attribution: `${source.authors}, Human Reference Atlas ${source.source}. ${source.url}. ${source.license}. Registered to the BodyParts3D body by an iterative-closest-point fit of the pelvis with the femoral head centres as landmarks (scripts/fit-female-pelvis.mjs).`}, new URL('female-stream.json.gz', dir));
console.log(`Female reproductive structures: ${info.parts} pieces in ${info.chunks} packages, ${(info.gzipBytes / 1e6).toFixed(2)} MB compressed.`);
if (process.argv.includes('--verbose')) console.log(report.join('\n'));
