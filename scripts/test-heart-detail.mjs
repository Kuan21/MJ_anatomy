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
assert.equal(heart.parts.length, spec.parts.length + spec.bodyparts3d.length);
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
for (const required of ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle', 'Anterior papillary muscle of right ventricle', 'Inferior papillary muscle of left ventricle', 'Posterior leaflet of left atrioventricular valve', 'Septal leaflet of right atrioventricular valve', 'Right coronary artery', 'Great cardiac vein', 'Coronary sinus']) assert.ok(names.has(required), required);
assert.ok(heart.parts.filter(p => p.group === 'valves').length === 11 && heart.parts.filter(p => p.group === 'papillary').length === 5);

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
  const items = id => CHAMBERS.find(c => c.id === id).items.map(i => i.zh).join('|');
  for (const need of ['梳狀肌', '界嵴', '卵圓窩', '上腔靜脈開口', '下腔靜脈開口', '冠狀竇開口', '右心耳']) assert.ok(items('ra').includes(need), `right atrium lists ${need}`);
  for (const need of ['三尖瓣前尖', '三尖瓣隔側尖', '前乳頭肌', '後乳頭肌', '中隔乳頭肌', '腱索', '肉柱', '節制索', '室上嵴', '動脈圓錐', '肺動脈瓣']) assert.ok(items('rv').includes(need), `right ventricle lists ${need}`);
  for (const need of ['左上肺靜脈開口', '左下肺靜脈開口', '右上肺靜脈開口', '右下肺靜脈開口', '左心耳', '卵圓瓣痕跡']) assert.ok(items('la').includes(need), `left atrium lists ${need}`);
  for (const need of ['二尖瓣前瓣', '二尖瓣後瓣', '前乳頭肌', '後乳頭肌', '腱索', '肉柱', '主動脈前庭', '主動脈瓣']) assert.ok(items('lv').includes(need), `left ventricle lists ${need}`);
  // the opened chamber's own valves and papillary muscles are the only internal pieces drawn: none of them belongs to another chamber's list
  const owner = new Map(); for (const c of CHAMBERS) for (const n of c.inside) { assert.ok(!owner.has(n), `${n} belongs to one chamber`); owner.set(n, c.id); }
  for (const p of heart.parts.filter(p => p.group === 'valves' || p.group === 'papillary')) assert.ok(owner.has(p.name), `${p.name} is shown when its chamber opens`);
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
assert.match(main, /#\/organ\/heart/); assert.match(page, /href="#\/organ\/heart"/);
console.log(`PASS heart detail: ${heart.parts.length} structures (${heart.parts.reduce((n, p) => n + p.indexCount / 3, 0).toLocaleString()} triangles) from the pinned Z-Anatomy export, ${(heart.chunks.reduce((n, c) => n + c.gzipBytes, 0) / 1e6).toFixed(2)} MB compressed, centred ${(offset * 1000).toFixed(1)} mm from the atlas heart; Heart layer = ${cardiac.length} heart pieces.`);
