// Heart detail model: pinned source, allow-listed pieces only, intact geometry, place in the atlas, and the Heart layer holding only the heart.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';

const root = new URL('../', import.meta.url), models = new URL('public/models/', root);
const spec = JSON.parse(fs.readFileSync(new URL('scripts/heart-parts.json', root), 'utf8'));
const heart = JSON.parse(gunzipSync(fs.readFileSync(new URL('heart/heart-detail.json.gz', models))));

// provenance and licence
assert.match(spec.sha256, /^[0-9a-f]{64}$/); assert.match(spec.revision, /^[0-9a-f]{40}$/);
const source = fs.readFileSync(new URL('work/heart-source.glb', root));
assert.equal(createHash('sha256').update(source).digest('hex'), spec.sha256, 'the cached export is the pinned file');
assert.match(heart.license, /CC-BY-SA/); assert.match(heart.attribution, /BodyParts3D/); assert.match(heart.attribution, /Z-Anatomy/);
for (const part of spec.parts) assert.ok(!/kidney|inner ear|cochlea|brainder|white matter/i.test(part.node + part.name), `non-commercial or unclear-licence piece excluded: ${part.node}`);
assert.ok(fs.existsSync(new URL('public/models/heart/ATTRIBUTION.md', root)), 'attribution file ships with the package');

// catalogue
assert.equal(heart.parts.length, spec.parts.length + spec.bodyparts3d.length + spec.serous.length + spec.mj.length);
const groups = new Set(heart.groups.map(g => g.id));
assert.equal(new Set(heart.parts.map(p => p.id)).size, heart.parts.length, 'unique ids');
const raws = heart.chunks.map(c => {
  const raw = fs.readFileSync(new URL('public' + c.url, root)), zipped = gunzipSync(fs.readFileSync(new URL('public' + c.gzip, root)));
  assert.equal(raw.length, c.bytes); assert.ok(raw.equals(zipped), 'gzip package is identical to the raw package');
  assert.ok(c.url.includes(createHash('sha256').update(raw).digest('hex').slice(0, 20)), 'content-addressed');
  return raw;
});
assert.ok(heart.chunks.reduce((n, c) => n + c.gzipBytes, 0) < 5e6, 'heart package stays under 5 MB compressed');
for (const p of heart.parts) {
  assert.ok(groups.has(p.group), `${p.name}: known group`);
  assert.ok(/[一-鿿]/.test(p.chinese) && !/[A-Za-z]/.test(p.chinese), `${p.name}: Chinese name ${p.chinese}`);
  assert.ok(p.description.zh.length > 8 && p.description.en.length > 8, `${p.name}: description`);
  assert.ok(!/[嘅咗喺唔嚟啲睇揀嗰咁冇俾佢啱]/.test(p.chinese + p.description.zh), `${p.name}: written Chinese`);
  const raw = raws[p.chunk];
  assert.ok(p.positions % 4 === 0 && p.indices % 4 === 0 && p.positions + p.vertexCount * 12 <= raw.length && p.normals + p.vertexCount * 6 <= raw.length && p.indices + p.indexCount * 4 <= raw.length, `${p.name}: bytes inside package`);
  const pos = new Float32Array(raw.buffer.slice(raw.byteOffset + p.positions, raw.byteOffset + p.positions + p.vertexCount * 12));
  const idx = new Uint32Array(raw.buffer.slice(raw.byteOffset + p.indices, raw.byteOffset + p.indices + p.indexCount * 4));
  assert.ok(pos.every(Number.isFinite) && idx.every(i => i < p.vertexCount), `${p.name}: finite geometry, valid triangles`);
  const nor = new Int16Array(raw.buffer.slice(raw.byteOffset + p.normals, raw.byteOffset + p.normals + p.vertexCount * 6));
  for (let i = 0; i < nor.length; i += 3) assert.ok(Math.abs(Math.hypot(nor[i], nor[i + 1], nor[i + 2]) / 32767 - 1) < .01, `${p.name}: unit normals`);
  assert.ok(p.bounds[0][1] > 1.0 && p.bounds[1][1] < 1.45, `${p.name}: inside the thorax`);
}
const names = new Set(heart.parts.map(p => p.name));
for (const required of ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle', 'Anterior papillary muscle of right ventricle', 'Posterior papillary muscle of left ventricle', 'Posterior cusp of bicuspid valve', 'Septal cusp of tricuspid valve', 'Chordae tendineae of bicuspid valve', 'Chordae tendineae of tricuspid valve', 'Right coronary artery', 'Great cardiac vein', 'Coronary sinus']) assert.ok(names.has(required), required);
assert.ok(heart.parts.filter(p => p.group === 'valves').length === 13 && heart.parts.filter(p => p.group === 'papillary').length === 5);

// the great veins join their atrium: venae cavae to the right atrium, the four pulmonary veins to the left atrium (surfaces within 1 mm)
{
  const positions = name => {const p = heart.parts.find(q => q.name === name); assert.ok(p, `${name} present`); const r = raws[p.chunk]; return new Float32Array(r.buffer.slice(r.byteOffset + p.positions, r.byteOffset + p.positions + p.vertexCount * 12));};
  const gap = (a, b) => {let m = Infinity; const sa = Math.max(1, Math.floor(a.length / 12000)) * 3, sb = Math.max(1, Math.floor(b.length / 12000)) * 3; for (let i = 0; i < a.length; i += sa) for (let j = 0; j < b.length; j += sb) m = Math.min(m, Math.hypot(a[i] - b[j], a[i + 1] - b[j + 1], a[i + 2] - b[j + 2])); return m;};
  for (const v of ['Superior vena cava', 'Inferior vena cava']) assert.ok(gap(positions(v), positions('Right atrium')) < .001, `${v} opens into the right atrium`);
  for (const v of ['Left superior pulmonary vein', 'Left inferior pulmonary vein', 'Right superior pulmonary vein', 'Right inferior pulmonary vein']) assert.ok(gap(positions(v), positions('Left atrium')) < .001, `${v} opens into the left atrium`);
  assert.equal(heart.parts.find(q => q.name === 'Superior vena cava').system, 'venous');
}

// chamber chooser: every listed piece exists in the catalogue, every chamber lists its structures, names are Taiwan-style written Chinese
{
  const {CHAMBERS} = await quizModule('app/organ/heart-chambers.ts');
  assert.deepEqual(CHAMBERS.map(c => c.id), ['ra', 'rv', 'la', 'lv']);
  const known = new Set(heart.parts.map(p => p.name));
  for (const c of CHAMBERS) {
    assert.ok(known.has(c.wall), `${c.id}: wall piece exists`);
    for (const name of c.inside) assert.ok(known.has(name), `${c.id}: inside piece ${name}`);
    for (const it of c.items) {
      for (const name of it.parts) assert.ok(known.has(name), `${c.id}/${it.en}: piece ${name}`);
      assert.ok(/[一-鿿]/.test(it.zh) && !/[嘅咗喺唔嚟啲睇揀嗰咁冇俾佢啱]/.test(it.zh + it.zhDesc) && it.enDesc.length > 10, `${c.id}/${it.en}: names and descriptions`);
    }
  }
  for (const c of CHAMBERS) assert.ok(c.items.length >= 7, `${c.id}: lists its structures`);
  // the opened chamber's own valves and papillary muscles are the only internal pieces drawn: none of them belongs to another chamber's list
  const owner = new Map(); const groupOf = new Map(heart.parts.map(p => [p.name, p.group]));
  for (const c of CHAMBERS) for (const n of c.inside) { if (!['valves', 'papillary'].includes(groupOf.get(n))) continue; assert.ok(!owner.has(n), `${n} belongs to one chamber`); owner.set(n, c.id); }
  for (const p of heart.parts.filter(p => p.group === 'valves' || p.group === 'papillary')) assert.ok(owner.has(p.name), `${p.name} is shown when its chamber opens`);
}

// auricles: separate, closed, outward-facing bodies drawn with the chambers (visible on the closed heart); every schematic surface is smooth (no stair-stepped
// rows of whole triangles: only a small share of the interior edges may fold by more than 60 degrees)
{
  const geometry = p => {const r = raws[p.chunk]; return {pos: new Float32Array(r.buffer.slice(r.byteOffset + p.positions, r.byteOffset + p.positions + p.vertexCount * 12)), idx: new Uint32Array(r.buffer.slice(r.byteOffset + p.indices, r.byteOffset + p.indices + p.indexCount * 4))};};
  const edges = ({pos, idx}) => {
    const faces = new Map(), normal = [];
    for (let t = 0; t < idx.length; t += 3) {
      const [a, b, c] = [idx[t], idx[t + 1], idx[t + 2]], u = [0, 1, 2].map(k => pos[b * 3 + k] - pos[a * 3 + k]), v = [0, 1, 2].map(k => pos[c * 3 + k] - pos[a * 3 + k]);
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], l = Math.hypot(...n) || 1; normal.push(n.map(x => x / l));
      for (const [i, j] of [[a, b], [b, c], [c, a]]) {const key = i < j ? `${i}_${j}` : `${j}_${i}`; (faces.get(key) ?? faces.set(key, []).get(key)).push(t / 3);}
    }
    return {faces, normal};
  };
  const sharp = g => {const {faces, normal} = edges(g); let n = 0, total = 0; for (const f of faces.values()) if (f.length === 2) {total++; const d = normal[f[0]][0] * normal[f[1]][0] + normal[f[0]][1] * normal[f[1]][1] + normal[f[0]][2] * normal[f[1]][2]; if (d < .5) n++;} return total ? n / total : 0;};
  for (const name of ['Right auricle', 'Left auricle']) {
    const p = heart.parts.find(q => q.name === name), g = geometry(p), {faces} = edges(g);
    assert.equal(p.group, 'chambers', `${name}: drawn with the chambers, visible on the closed heart`);
    assert.ok([...faces.values()].every(f => f.length === 2), `${name}: closed body (every edge shared by two triangles)`);
    let volume = 0; for (let t = 0; t < g.idx.length; t += 3) {const [a, b, c] = [0, 1, 2].map(k => [0, 1, 2].map(x => g.pos[g.idx[t + k] * 3 + x])); volume += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;}
    assert.ok(volume > 0, `${name}: triangles face outwards`);
  }
  for (const p of heart.parts.filter(q => q.origin === '示意構造' && q.group !== 'pericardium' && !/Transverse|Oblique/.test(q.name))) {
    const share = sharp(geometry(p));
    assert.ok(share < (/Trabecul|Pectinate|Septomarginal|Crista|crest/.test(p.name) ? .08 : .06), `${p.name}: smooth surface (${(share * 100).toFixed(1)} % of edges fold by more than 60 degrees)`);
  }
}

// place in the atlas: the chambers sit on the atlas heart (centre within 25 mm)
const {normalizeAtlasSystems} = await quizModule('app/mj-system-classifier.ts');
const atlas = normalizeAtlasSystems(JSON.parse(fs.readFileSync(new URL('atlas.json', models), 'utf8')));
const box = (items) => items.reduce((b, p) => [[0, 1, 2].map(k => Math.min(b[0][k], p.bounds[0][k])), [0, 1, 2].map(k => Math.max(b[1][k], p.bounds[1][k]))], [[9, 9, 9], [-9, -9, -9]]);
const centre = b => b[0].map((v, k) => (v + b[1][k]) / 2);
const chambers = heart.parts.filter(p => p.group === 'chambers'), atlasHeart = atlas.parts.filter(p => /^(wall of ventricle|wall of (left|right) atrium|cavity of (left|right) (ventricle|atrium))$/i.test(p.name));
assert.ok(atlasHeart.length >= 6);
const offset = Math.hypot(...centre(box(chambers)).map((v, k) => v - centre(box(atlasHeart))[k]));
assert.ok(offset < .025, `heart detail centre is ${(offset * 1000).toFixed(1)} mm from the atlas heart`);

// the Heart layer holds only the heart (the brain's ventricles used to be filed under it)
const cardiac = atlas.parts.filter(p => p.system === 'cardiac');
assert.ok(cardiac.length >= 12 && cardiac.every(p => !/(third|fourth|lateral) ventricle|interventricular foramen/i.test(p.name)), `heart layer: ${cardiac.length} pieces, none from the brain`);
assert.ok(atlas.parts.filter(p => /(third|fourth|lateral) ventricle/i.test(p.name)).every(p => p.system === 'nervous'));

// wiring: route, atlas entry, quiz
const main = fs.readFileSync(new URL('web/main.tsx', root), 'utf8'), page = fs.readFileSync(new URL('app/page.tsx', root), 'utf8');
assert.match(main, /#\/organ\/heart/); assert.match(page, /window\.location\.hash='#\/organ\/heart'/);
console.log(`PASS heart detail: ${heart.parts.length} structures (${heart.parts.reduce((n, p) => n + p.indexCount / 3, 0).toLocaleString()} triangles) from the pinned Z-Anatomy export, ${(heart.chunks.reduce((n, c) => n + c.gzipBytes, 0) / 1e6).toFixed(2)} MB compressed, centred ${(offset * 1000).toFixed(1)} mm from the atlas heart; Heart layer = ${cardiac.length} heart pieces.`);
