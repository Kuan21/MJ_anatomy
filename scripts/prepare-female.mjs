// Female reproductive anatomy from the Human Reference Atlas (CC BY 4.0), registered onto the BodyParts3D pelvis and packaged like the supplement
// structures. The pieces come from scripts/data/hra-female-pelvis.json.gz (extract-hra-female.mjs). The pelvic bones in the atlas stay the male
// BodyParts3D pelvis; the organs are scaled and placed so the uterus sits above the bladder and in front of the rectum. Educational placement only.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createStream, simplify, weldByPosition} from './lib/stream-writer.mjs';

const root = new URL('../', import.meta.url), out = new URL('public/models/stream/', root), dir = new URL('public/models/female/', root);
fs.mkdirSync(out, {recursive: true}); fs.mkdirSync(dir, {recursive: true});
const source = JSON.parse(gunzipSync(fs.readFileSync(new URL('data/hra-female-pelvis.json.gz', import.meta.url))));
// HRA frame (metres, +y up, +z anterior) → BodyParts3D atlas frame. Scale 0.9 maps the HRA iliac width (0.317 m) to the atlas hip bones (0.29 m); the
// vertical offset puts the iliac crest at the atlas crest (y 1.036), which seats the uterine fundus just above the atlas bladder dome.
const S = .9, toAtlas = (x, y, z) => [S * (x + .008), S * y + .8875, S * z + .018];

const NAMES = [ // [regex on HRA node name, English (without side), Chinese, system, paired]
  [/^VH_F_body_of_uterus$/, 'Body of uterus', '子宮體', 'reproductive', false],
  [/^VH_F_fundus_of_uterus$/, 'Fundus of uterus', '子宮底', 'reproductive', false],
  [/^VH_F_lower_uterine_segment$/, 'Lower uterine segment', '子宮下段', 'reproductive', false],
  [/^VH_F_cervix$/, 'Cervix of uterus', '子宮頸', 'reproductive', false],
  [/^VH_F_vagina$/, 'Vagina', '陰道', 'reproductive', false],
  [/^VH_F_cervicovaginal_junction$/, 'Cervicovaginal junction', '子宮頸陰道交界', 'reproductive', false],
  [/^VH_F_broad_ligament$/, 'Broad ligament of uterus', '子宮闊韌帶', 'reproductive', false],
  [/round_ligament_of_uterus$/, 'Round ligament of uterus', '子宮圓韌帶', 'reproductive', true],
  [/uterosacral_ligament$/, 'Uterosacral ligament', '子宮薦韌帶', 'reproductive', true],
  [/cardinal_ligament_of_uterus$/, 'Cardinal ligament of uterus', '子宮主韌帶', 'reproductive', true],
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
const info = stream.finish({source: source.source, license: source.license, doi: source.doi, authors: source.authors, sourceSha256: source.sourceSha256,
  attribution: `${source.authors}, Human Reference Atlas ${source.source}. ${source.url}. ${source.license}. Scaled 0.9 and registered to the BodyParts3D pelvis; the pelvic bones remain the male BodyParts3D model.`}, new URL('female-stream.json.gz', dir));
console.log(`Female reproductive structures: ${info.parts} pieces in ${info.chunks} packages, ${(info.gzipBytes / 1e6).toFixed(2)} MB compressed.`);
if (process.argv.includes('--verbose')) console.log(report.join('\n'));
