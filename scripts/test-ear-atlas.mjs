// Ear detail atlas (public/models/ear/ear-atlas.*, built by scripts/build-ear-atlas.mjs) against the catalogue and cards of app/mj-ear-atlas.ts:
// every packaged mesh is described and every structure with a mesh is packaged, buffers are in range, solids face outward, names and cards are bilingual,
// the placement is anatomical (sizes of the ossicles, order from the meatus inward, footplate in the oval window, windows on their bones), the registration error
// is small, and no note wording reaches the cards. Prints counts only.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';
const {EAR_PARTS, EAR_GROUPS, EAR_LAYERS, EAR_BY_ID, EAR_MAX_PEEL} = await quizModule('app/mj-ear-atlas.ts');
const dir = new URL('../public/models/ear/', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL('ear-atlas.json', dir))), bin = gunzipSync(fs.readFileSync(new URL('ear-atlas.bin.gz', dir)));
const problems = [], fail = m => problems.push(m), CJK = /[㐀-鿿]/;
if (bin.length !== manifest.bytes) fail('binary size differs from the manifest');
if (manifest.side !== 'right') fail('the package is one right ear');

// ---- catalogue and package describe the same structures
const packaged = new Map(manifest.parts.map(p => [p.id, p]));
for (const id of packaged.keys()) if (!EAR_BY_ID.get(id)?.model) fail(`${id}: packaged but not described as a model structure`);
for (const p of EAR_PARTS) {
  if (p.model && !packaged.has(p.id)) fail(`${p.id}: described with a model but not packaged`);
  if (!p.model && packaged.has(p.id)) fail(`${p.id}: card only but packaged`);
  if (!p.model && !(p.near?.length)) fail(`${p.id}: a card-only structure names the real structures it highlights`);
  for (const id of p.near ?? []) if (!EAR_BY_ID.get(id)?.model) fail(`${p.id}: highlights ${id}, which has no mesh`);
  for (const id of p.rel) if (!EAR_BY_ID.has(id) || id === p.id) fail(`${p.id}: related structure ${id}`);
  if (!EAR_GROUPS.some(g => g.id === p.group)) fail(`${p.id}: unknown group`);
  if (p.layer < -1 || p.layer >= EAR_LAYERS.length) fail(`${p.id}: unknown layer`);
  if (!p.en.trim() || /\b(left|right)\b|_|\.\d+$/i.test(p.en)) fail(`${p.id}: English name`);
  if (!CJK.test(p.zh) || /[A-Za-z]/.test(p.zh.replace(/[（）]/g, ''))) fail(`${p.id}: Chinese name`);
  for (const lang of ['en', 'zh']) {
    const c = p.card[lang];
    const [minLoc, minFn] = lang === 'en' ? [40, 25] : [20, 12];
    if (!c.loc || c.loc.length < minLoc || !c.fn || c.fn.length < minFn) fail(`${p.id}: ${lang} card needs location and function`);
    if (lang === 'zh' && ![c.loc, c.fn].every(t => CJK.test(t))) fail(`${p.id}: Chinese card is not Chinese`);
    if (lang === 'en' && CJK.test(c.loc + c.fn + (c.supply ?? '') + (c.note ?? ''))) fail(`${p.id}: English card holds Chinese`);
    if (Boolean(c.supply) !== Boolean(p.card[lang === 'en' ? 'zh' : 'en'].supply) || Boolean(c.note) !== Boolean(p.card[lang === 'en' ? 'zh' : 'en'].note)) fail(`${p.id}: the two languages carry different fields`);
  }
  // no course-note wording or citations on the site (scripts/check-no-notes.mjs checks the shipped strings too)
  const all = JSON.stringify(p);
  if (/[0-9]{4} ?p\.[0-9]|共筆|筆記|跑考|課堂|講義/.test(all)) fail(`${p.id}: note wording`);
}
const names = EAR_PARTS.map(p => p.en.toLowerCase()), zhs = EAR_PARTS.map(p => p.zh);
for (const list of [names, zhs]) for (const n of new Set(list)) if (list.filter(x => x === n).length > 1) fail(`duplicate name: ${n}`);
if (EAR_PARTS.length !== 36 || EAR_PARTS.filter(p => p.model).length !== 26) fail(`expected 36 structures, 26 with a mesh; found ${EAR_PARTS.length} and ${EAR_PARTS.filter(p => p.model).length}`);
if (EAR_MAX_PEEL !== 5) fail('five peel layers');
// the peel order runs from the outside in: the structures of a layer are medial to those of the layers before it (the centre of its box, x is lateral to medial for the right ear)
const mid = id => packaged.get(id).bounds[0].map((v, i) => (v + packaged.get(id).bounds[1][i]) / 2), size = id => packaged.get(id).bounds[0].map((v, i) => packaged.get(id).bounds[1][i] - v);
const layerX = n => { const ids = EAR_PARTS.filter(p => p.model && p.layer === n && !p.mark && p.id !== 'pharyngotympanic-tube').map(p => mid(p.id)[0]); return ids.reduce((a, b) => a + b, 0) / ids.length; };
for (let n = 1; n < EAR_LAYERS.length; n++) if (!(layerX(n) > layerX(n - 1))) fail(`peel layer ${n} is not medial to layer ${n - 1}`);

// ---- buffers
for (const p of manifest.parts) {
  if (p.positions % 4 || p.indices % 4 || p.normals % 2 || p.indexCount % 3) fail(`${p.id}: misaligned buffers`);
  if (p.indices + p.indexCount * 4 > bin.length || p.normals + p.vertexCount * 6 > bin.length || p.positions + p.vertexCount * 12 > bin.length) { fail(`${p.id}: buffers out of range`); continue; }
  const pos = new Float32Array(bin.buffer, bin.byteOffset + p.positions, p.vertexCount * 3), idx = new Uint32Array(bin.buffer, bin.byteOffset + p.indices, p.indexCount), nor = new Int16Array(bin.buffer, bin.byteOffset + p.normals, p.vertexCount * 3);
  if (idx.some(i => i >= p.vertexCount)) fail(`${p.id}: index beyond vertices`);
  if (pos.some((v, i) => !Number.isFinite(v) || !(v >= p.bounds[0][i % 3] - 1e-5 && v <= p.bounds[1][i % 3] + 1e-5))) fail(`${p.id}: vertex outside bounds`);
  let bad = 0; for (let v = 0; v < p.vertexCount; v++) { const l = Math.hypot(nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2]) / 32767; if (l < .5 || l > 1.05) bad++; }
  if (bad > p.vertexCount * .02) fail(`${p.id}: ${bad} normals are not unit length`);
  // a closed solid is written with its faces turned outward (the viewer shows the inside of a cut with a flat tint)
  if (['malleus', 'incus', 'stapes', 'scala-tympani', 'utricle', 'saccule', 'anterior-duct', 'lateral-duct', 'posterior-duct', 'anterior-ampulla', 'lateral-ampulla', 'posterior-ampulla', 'facial-nerve', 'chorda-tympani', 'cochlear-nerve', 'external-acoustic-meatus', 'pharyngotympanic-tube'].includes(p.id)) {
    let v6 = 0; for (let i = 0; i < idx.length; i += 3) { const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3; v6 += pos[a] * (pos[b + 1] * pos[c + 2] - pos[b + 2] * pos[c + 1]) - pos[a + 1] * (pos[b] * pos[c + 2] - pos[b + 2] * pos[c]) + pos[a + 2] * (pos[b] * pos[c + 1] - pos[b + 1] * pos[c]); }
    if (!(v6 > 0)) fail(`${p.id}: faces point inward`);
  }
}

// ---- placement (body frame, metres: X left, Y up, Z front; the right ear lies at negative X)
const mm = v => v * 1000;
const ear = manifest.parts.filter(p => p.id !== 'pharyngotympanic-tube');
for (const p of ear) if (!(p.bounds[1][0] < 0)) fail(`${p.id}: not on the right side of the body`);
for (const [id, lo, hi] of [['malleus', 6, 9.5], ['incus', 4.5, 8], ['stapes', 2.5, 4.5]]) { const longest = Math.max(...size(id).map(mm)); if (!(longest > lo && longest < hi)) fail(`${id}: longest dimension ${longest.toFixed(1)} mm outside ${lo}-${hi} mm`); }
{
  const tm = mid('tympanic-membrane'), meatus = mid('external-acoustic-meatus'), aur = mid('auricle'), stapes = mid('stapes'), vest = mid('vestibule');
  if (!(aur[0] < meatus[0] && meatus[0] < tm[0] && tm[0] < stapes[0] && stapes[0] < vest[0])) fail('order from the outside in: auricle, meatus, tympanic membrane, stapes, vestibule');
  const malleus = mid('malleus'), incus = mid('incus');
  if (!(mm(Math.hypot(malleus[0] - tm[0], malleus[1] - tm[1], malleus[2] - tm[2])) < 6)) fail('the malleus lies against the tympanic membrane');
  if (!(mm(Math.hypot(incus[0] - malleus[0], incus[1] - malleus[1], incus[2] - malleus[2])) < 5)) fail('the incus lies against the malleus');
  const ovalAt = mid('oval-window');
  if (!(mm(Math.hypot(ovalAt[0] - stapes[0], ovalAt[1] - stapes[1], ovalAt[2] - stapes[2])) < 3)) fail('the footplate of the stapes lies in the oval window');
  if (!(manifest.placement.footplateToVestibuleWallMm < .5)) fail('footplate is not on the wall of the vestibule');
  const round = mid('round-window'), tympani = mid('scala-tympani');
  if (!(mm(Math.hypot(round[0] - tympani[0], round[1] - tympani[1], round[2] - tympani[2])) < 8)) fail('round window on the scala tympani');
  // the round window lies below and behind the oval window
  if (!(round[1] < ovalAt[1])) fail('round window below the oval window');
  const uc = mid('utricle'), sc = mid('saccule');
  if (!(mm(Math.hypot(uc[0] - vest[0], uc[1] - vest[1], uc[2] - vest[2])) < 3)) fail('utricle in the vestibule');
  if (!(sc[1] < uc[1] + 1e-3)) fail('saccule not above the utricle');
  // the three semicircular canals lie above and behind the vestibule; the anterior canal is the highest
  const ant = mid('anterior-canal'), lat = mid('lateral-canal'), post = mid('posterior-canal');
  if (!(ant[1] > lat[1] && ant[1] > post[1] && ant[1] > vest[1])) fail('anterior canal is the highest');
  if (!(post[2] < vest[2] && post[2] < ant[2] + 1e-3)) fail('posterior canal lies behind the vestibule');
  // the pharyngotympanic tube leaves the middle ear forward and medially
  const tube = mid('pharyngotympanic-tube');
  if (!(tube[2] > tm[2] && tube[0] > tm[0])) fail('the pharyngotympanic tube runs forward and medially');
  // the chorda tympani crosses the middle ear, the facial nerve lies behind and below the oval window
  const facial = mid('facial-nerve');
  if (!(facial[2] < ovalAt[2] + .004)) fail('facial nerve does not lie behind the oval window');
}
// the membranous parts sit inside the bony ones
for (const [inner, outer] of [['utricle', 'vestibule'], ['anterior-duct', 'anterior-canal'], ['lateral-duct', 'lateral-canal'], ['posterior-duct', 'posterior-canal']]) {
  const a = mid(inner), b = mid(outer); if (!(mm(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])) < 3)) fail(`${inner} does not lie in ${outer}`);
}
// ---- registration of the two specimens
const err = manifest.registration.errorMm;
for (const [k, limit] of [['scala tympani', .4], ['scala vestibuli (IE-Map)', .4], ['anterior canal', .5], ['lateral canal', .5], ['posterior canal', .5], ['saccule', .8], ['utricle', 1]]) if (!(err[k]?.meanMm <= limit)) fail(`registration: ${k} mean ${err[k]?.meanMm} mm over ${limit} mm`);
for (const s of ['innerEar', 'middleEar', 'auricle']) if (!manifest.sources[s]?.license) fail(`source ${s} has no licence`);

if (problems.length) { console.error('Ear atlas test FAILED:\n - ' + problems.join('\n - ')); process.exit(1); }
console.log(`Ear atlas passed: ${EAR_PARTS.length} structures (${EAR_PARTS.filter(p => p.model).length} with a mesh, ${EAR_PARTS.filter(p => !p.model).length} card only), ${(bin.length / 1e6).toFixed(2)} MB, placement and registration inside their limits.`);
