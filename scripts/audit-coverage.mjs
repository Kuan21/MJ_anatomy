// Completeness audit: every structure the user's 18 gross-anatomy lectures name (docs/curriculum-terms.json, high recall and noisy)
// against everything the viewer can show. Writes docs/coverage-report.md and docs/coverage-data.json.
//   node scripts/audit-coverage.mjs           regenerate the report
//   node scripts/audit-coverage.mjs --check   fail when coverage regresses (npm run check:coverage)
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {quizModule} from './quiz-modules.mjs';

const root = new URL('../', import.meta.url), models = new URL('public/models/', root);
const {normalizeAtlasSystems} = await quizModule('app/mj-system-classifier.ts');
const {correctedPartName} = await quizModule('app/mj-part-regions.ts');
const {structureProfile} = await quizModule('app/mj-structure-info.ts');
const {mergeAtlasStreams} = await quizModule('app/mj-facial-atlas.ts');
const {conceptMatches} = await quizModule('app/mj-search.ts');
const curriculum = JSON.parse(fs.readFileSync(new URL('docs/curriculum-terms.json', root), 'utf8'));
const atlas = normalizeAtlasSystems(JSON.parse(fs.readFileSync(new URL('atlas.json', models), 'utf8')));
const facial = JSON.parse(fs.readFileSync(new URL('facial/atlas.json', models), 'utf8'));
const supplement = JSON.parse(gunzipSync(fs.readFileSync(new URL('supplement/supplement-stream.json.gz', models))));
const conceptName = new Map(atlas.concepts.map(c => [c.id, c.name]));
const partIds = new Set(atlas.parts.map(p => p.id));

// ---------------------------------------------------------------- vocabulary
const ABBR = {m: 'muscle', mm: 'muscles', a: 'artery', aa: 'arteries', v: 'vein', vv: 'veins', n: 'nerve', nn: 'nerves', lig: 'ligament', ligg: 'ligaments', br: 'branch', brs: 'branches',
  post: 'posterior', ant: 'anterior', sup: 'superior', inf: 'inferior', med: 'medial', lat: 'lateral', int: 'internal', ext: 'external', prox: 'proximal', dist: 'distal', gl: 'gland', ggl: 'ganglion', gg: 'ganglia',
  proc: 'process', tuber: 'tuberosity', ln: 'lymph node', lnn: 'lymph nodes', musculus: 'muscle', arteria: 'artery', vena: 'vein', nervus: 'nerve', ligamentum: 'ligament', fasc: 'fascia', tr: 'tract', sin: 'sinus',
  aortic: 'aorta', zygomaticus: 'zygomatic', scapular: 'scapulae', coli: 'colli', coli: 'colli', hypoglossi: 'hypoglossal', glossopharngeus: 'glossopharyngeal', glossopharyngeus: 'glossopharyngeal', masster: 'masseter', mutifidus: 'multifidus', oricularis: 'orbicularis', sytlopharyngeus: 'stylopharyngeus', stylophaygeus: 'stylopharyngeus', stylopharygeus: 'stylopharyngeus', stylopharyngeus: 'stylopharyngeus', scalene: 'scalenus', palmer: 'palmar', iliac: 'iliac', cn: '', vertebrae: 'vertebra', foramina: 'foramen', sulci: 'sulcus', rami: 'ramus', nuclei: 'nucleus', ganglia: 'ganglion', cornua: 'cornu', fornices: 'fornix', labia: 'labium', alae: 'ala', septa: 'septum', fossae: 'fossa', gyri: 'gyrus'};
const TYPE = new Set(['muscle', 'artery', 'vein', 'nerve', 'ligament', 'branch', 'gland', 'bone', 'tendon', 'duct', 'vessel', 'ganglion', 'membrane', 'plexus', 'sinus', 'nucleus', 'cartilage', 'valve', 'septum', 'tonsil', 'node', 'tract']);
const STOP = new Set(['of', 'the', 'and', 'to', 'part', 'pars', 'region', 'side', 'left', 'right', 'with', 'for', 'in', 'on', 'a', 'an', 'or', 'b', 'c', 'd', 'e', 'f', 'g', 'at', 'from', 'by', 'its', 'is', 'as', 'near', 'between', 'ie', 'eg', 'etc', 'bilateral', 'unilateral']);
const NOT_STRUCTURE = new Set(['caused', 'connected', 'innervated', 'enveloped', 'devoid', 'without', 'between', 'attachment', 'boundaries', 'boundary', 'stability', 'mainly', 'anastomoses', 'drains', 'lies', 'passes', 'which', 'that', 'following', 'statements', 'concerning', 'contains', 'content', 'belongs', 'arise', 'found', 'convey', 'occluded', 'relaxed', 'relaxation', 'innervates', 'dysfunction', 'except', 'above', 'below', 'across', 'during', 'while', 'when', 'because', 'therefore', 'grant', 'dissector', 'all', 'only', 'other', 'what', 'xxx', 'structure', 'structures', 'organs', 'wall', 'movement', 'movements', 'injury', 'palsy', 'syndrome', 'fracture', 'dislocation', 'sign', 'test', 'cause', 'effect', 'function', 'action', 'innervation', 'origin', 'insertion', 'supply', 'drainage',
  'development', 'anomaly', 'clinical', 'lesion', 'disease', 'surgery', 'procedure', 'paralysis', 'weakness', 'pain', 'infection', 'cancer', 'tumor', 'hernia', 'pathway', 'reflex', 'flexion', 'extension', 'abduction', 'adduction',
  'rotation', 'elevation', 'depression', 'protraction', 'retraction', 'circumduction', 'supination', 'pronation', 'inversion', 'eversion', 'dorsiflexion', 'plantarflexion', 'winged', 'deformity', 'normal', 'abnormal', 'inflammation',
  'obstruction', 'stenosis', 'aneurysm', 'thrombosis', 'embolism', 'ischemia', 'infarction', 'compression', 'entrapment', 'neuropathy', 'block', 'anesthesia', 'incision', 'approach', 'landmark', 'level', 'vertebral level', 'figure', 'table', 'page']);
const GENERIC = new Set(['cervical', 'iliac', 'thoracic', 'lumbar', 'sacral', 'pharyngeal', 'facial', 'cranial', 'spinal', 'vertebral', 'arch', 'penis', 'process', 'tendon', 'tuberosity', 'fascia', 'border', 'surface', 'margin', 'aponeurosis', 'head', 'neck', 'body', 'shaft', 'base', 'apex', 'angle', 'line', 'crest', 'groove', 'notch', 'fossa', 'tubercle', 'spine', 'wall', 'floor', 'roof',
  'anterior', 'posterior', 'superior', 'inferior', 'medial', 'lateral', 'upper', 'lower', 'deep', 'superficial', 'middle', 'proximal', 'distal', 'internal', 'external', 'major', 'minor', 'long', 'short', 'common', 'branch', 'branches', 'part', 'group', 'layer', 'lobe', 'surface', 'joint', 'cavity', 'space', 'area', 'zone', 'plane', 'level', 'trunk', 'root', 'cord', 'division', 'ring', 'sheath', 'cutaneous', 'muscular', 'terminal', 'collateral', 'recurrent', 'descending', 'ascending', 'transverse', 'oblique', 'dorsal', 'ventral', 'palmar', 'plantar', 'anterolateral', 'posterior', 'ramus', 'rami', 'foramen', 'canal', 'opening', 'triangle', 'fold', 'pouch', 'recess', 'wing', 'process', 'lamina', 'plate', 'bone', 'bones', 'muscle', 'muscles', 'nerve', 'nerves', 'artery', 'arteries', 'vein', 'veins', 'vessel', 'vessels', 'duct', 'gland', 'node', 'nodes', 'ligament', 'ligaments']);
const MOD = new Set(['anterior', 'posterior', 'superior', 'inferior', 'medial', 'lateral', 'upper', 'lower', 'deep', 'superficial', 'middle', 'proximal', 'distal', 'internal', 'external', 'major', 'minor', 'long', 'short', 'belly', 'head', 'crus', 'portion', 'rt', 'lt', 'bilateral', 'common']);
const LANDMARK = /\b(process|tubercle|tuberosity|fossa|notch|epicondyle|condyle|foramen|canal|groove|sulcus|crest|facet|trochanter|malleolus|eminence|hiatus|fissure|meatus|tuber|hamulus|lingula|incisura|promontory|ramus|angle|margin|border|surface|shaft|spine|line|head|neck|body|base|apex|ala|wing|lamina|pecten|trochlea|capitulum|olecranon|coracoid|acromion|glenoid|styloid|mastoid|pterygoid|zygomatic arch|supraglenoid|infraglenoid)\b/i;

const stem = t => {
  if (ABBR[t]) return stem1(ABBR[t]);
  return stem1(t);
};
function stem1(t) {
  if (t.endsWith('ies') && t.length > 4) return t.slice(0, -3) + 'y';
  if (t.length > 3 && t.endsWith('s') && !/(ss|us|is|ps|as)$/.test(t)) return t.slice(0, -1);
  return t;
}
const tokens = text => text.toLowerCase().replace(/\([^)]*\)/g, ' ').replace(/(?<=[a-z])-(?=[a-z])/g, '').replace(/[^a-z\s']/g, ' ').replace(/'s\b/g, '').split(/\s+/).filter(Boolean)
  .flatMap(t => (t in ABBR ? ABBR[t].split(' ').filter(Boolean) : [t])).map(stem1);
function analyse(text) {
  const all = tokens(text), type = all.find(t => TYPE.has(t));
  const core = all.filter(t => !STOP.has(t) && !TYPE.has(t) && t.length > 1);
  return {all, core: new Set(core), type};
}

// ---------------------------------------------------------------- the model's names
const entities = [];
const add = (source, id, system, names, extra = {}) => entities.push({source, id, system, names: [...new Set(names.filter(Boolean))], ...extra});
for (const p of atlas.parts) {
  const name = correctedPartName(p), profile = structureProfile(name, p.system, {...p, name});
  add('atlas', p.id, p.system, [name, conceptName.get(p.conceptId), profile.english, p.name], {searchable: !!conceptName.get(p.conceptId), concept: p.conceptId});
}
for (const p of facial.parts) add('facial', p.id, 'muscular', [p.name], {searchable: true});
for (const p of supplement.parts) add('supplement', p.id, p.system, [p.name], {searchable: true});
const extraNames = new Set((() => {try {return JSON.parse(gunzipSync(fs.readFileSync(new URL('search-extras.json.gz', models)))).map(e => e.n.replace(/^(Left|Right) /, '').toLowerCase());} catch {return [];}})());
const isIndexed = name => extraNames.has(name.toLowerCase());
const nerves = JSON.parse(fs.readFileSync(new URL('nerve-stream.json', models), 'utf8'));
for (const c of nerves.chunks) for (const m of c.meshes) add('nerve', m.name, 'nervous', [m.name.replace(/\.[lr](?:\.\d+)?$/i, '').replace(/\.001$/, '')], {searchable: true});
const glb = file => {const b = fs.readFileSync(new URL(file, models)); return JSON.parse(b.toString('utf8', 20, 20 + b.readUInt32LE(12)));};
for (const n of glb('joints.glb').nodes) if (n.name) add('joints', n.name, 'connective', [n.name.replace(/\.[lr]$/i, '')], {searchable: true});
for (const n of glb('brain.glb').nodes) if (n.extras?.bx_label) add('brain', String(n.extras.bx_id), 'nervous', [n.extras.bx_label], {searchable: true});
for (const v of JSON.parse(gunzipSync(fs.readFileSync(new URL('neck-vessels.json.gz', models)))).vessels) add('neck', v.name, v.system, [v.name.replace(/\.[lr]$/i, '')], {searchable: true});
for (const e of entities) {if (['nerve', 'joints', 'brain', 'neck'].includes(e.source)) e.searchable = !process.argv.includes('--pre-fix') && (isIndexed(e.names[0]) || extraNames.has(e.names[0].toLowerCase().replace(/\s+/g, ' '))); e.analysed = e.names.map(analyse);}
const candidateArg = process.argv.find(a => a.startsWith('--candidate='));
if (candidateArg) for (const {n, f} of JSON.parse(fs.readFileSync(candidateArg.slice(12), 'utf8'))) add('candidate:' + f, n, 'candidate', [n.replace(/ (muscle|artery|vein|nerve)(?=\.[lr]$|$)/i, ' $1').replace(/\.[lr]$/i, '')], {searchable: true});
// Concepts the source names but has no mesh for.
const meshConcepts = new Set(atlas.parts.map(p => p.conceptId));
for (const c of atlas.concepts) if (!c.elements.some(id => partIds.has(id))) add('concept-only', c.id, 'none', [c.name], {searchable: true});
for (const e of entities) if (!e.analysed) e.analysed = e.names.map(analyse);
const index = new Map();
entities.forEach((e, i) => e.analysed.forEach(a => a.core.forEach(t => {(index.get(t) ?? index.set(t, new Set()).get(t)).add(i);})));

// Spelling slips in lecture notes (one letter off a word the model uses) are read as that word.
const vocabulary = new Set([...index.keys()]);
const edit1 = (a, b) => {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, diff = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {i++; j++; continue;}
    if (++diff > 1) return false;
    if (a.length > b.length) i++; else if (a.length < b.length) j++; else {i++; j++;}
  }
  return diff + (a.length - i) + (b.length - j) <= 1;
};
const typoFix = new Map();
function fixToken(t) {
  if (vocabulary.has(t) || t.length < 7) return t;
  if (!typoFix.has(t)) typoFix.set(t, [...vocabulary].find(v => v.length >= 7 && edit1(t, v)) ?? t);
  return typoFix.get(t);
}
// ---------------------------------------------------------------- matching
function candidates(core) {
  let best = null;
  for (const t of core) {const s = index.get(t); if (s && (!best || s.size < best.size)) best = s;}
  return best ? [...best] : [];
}
function match(term) {
  const a = analyse(term);
  a.core = new Set([...a.core].map(fixToken));
  if (!a.core.size) return null;
  let best = null;
  for (const i of candidates(a.core)) {
    const e = entities[i];
    for (const m of e.analysed) {
      if (!m.core.size) continue;
      if (a.type && m.type && a.type !== m.type && !(a.type === 'branch' || m.type === 'branch')) continue;
      if (!a.type && m.type && !['muscle', 'artery', 'vein', 'nerve'].every(x => x !== m.type)) { /* a bare name may still name this structure */ }
      const inter = [...a.core].filter(t => m.core.has(t)).length;
      let kind = null;
      if (inter === a.core.size && inter === m.core.size) kind = 'exact';
      else if (inter === a.core.size) kind = 'contained';                  // the term is more general than the model's piece
      else if (inter === m.core.size && ((m.core.size >= 2) || (m.core.size === 1 && [...m.core][0].length >= 7 && !GENERIC.has([...m.core][0]))) && [...a.core].filter(t => !m.core.has(t)).every(t => MOD.has(t))) kind = 'specific';
      if (!kind) continue;
      const rank = {exact: 4, contained: 3, specific: 2, fuzzy: 1}[kind] * 100 - Math.abs(m.core.size - a.core.size);
      if (!best || rank > best.rank) best = {rank, kind, entity: e, name: e.names[0]};
    }
  }
  return best;
}
function classifyNoise(term) {
  const t = term.trim();
  if (t.length < 4 || t.length > 70 || /\d/.test(t) || /[=<>→±%]/.test(t)) return 'noise';
  const all = tokens(t);
  if (all.length > 8 || !all.length) return 'noise';
  if (all.some(w => NOT_STRUCTURE.has(w))) return 'noise';
  const core = all.filter(w => !STOP.has(w) && w.length > 1);
  if (!core.length || core.every(w => GENERIC.has(w) || TYPE.has(w))) return 'noise';
  if (/^[a-z]{1,3}\.?$/i.test(t)) return 'noise';
  return null;
}


// Group names the notes use for several muscles/structures: covered when their members are.
const GROUPS = [
  [/^(erector spinae|erector spinae muscles?)$/, ['iliocostalis', 'longissimus', 'spinalis']],
  [/^(iliopsoas)$/, ['psoas major', 'iliacus']],
  [/^(quadriceps( femoris)?)$/, ['rectus femoris', 'vastus lateralis', 'vastus medialis', 'vastus intermedius']],
  [/^(hamstrings?)$/, ['semitendinosus', 'semimembranosus', 'biceps femoris']],
  [/^(rotator cuff|musculotendinous rotator cuff)$/, ['supraspinatus', 'infraspinatus', 'teres minor', 'subscapularis']],
  [/^(infrahyoid( muscles?)?)$/, ['sternohyoid', 'omohyoid', 'sternothyroid', 'thyrohyoid']],
  [/^(suprahyoid( muscles?)?)$/, ['digastric', 'mylohyoid', 'geniohyoid', 'stylohyoid']],
  [/^(muscles? of mastication|mastication m)$/, ['masseter', 'temporalis', 'medial pterygoid', 'lateral pterygoid']],
  [/^(thenar muscles?)$/, ['abductor pollicis brevis', 'flexor pollicis brevis', 'opponens pollicis']],
  [/^(hypothenar muscles?)$/, ['abductor digiti minimi of hand', 'flexor digiti minimi brevis of hand', 'opponens digiti minimi of hand']],
  [/^(extraocular muscles?|extrinsic eye muscles?)$/, ['superior rectus', 'inferior rectus', 'lateral rectus', 'medial rectus', 'superior oblique', 'inferior oblique']],
  [/^(scalene m|scalene muscles?)$/, ['scalenus anterior', 'scalenus medius', 'scalenus posterior']],
  [/^(pelvic floor|levator ani( muscle)?)$/, ['pubococcygeus', 'iliococcygeus', 'puborectalis']],
  [/^(transversospinal muscles?)$/, ['semispinalis', 'multifidus', 'rotator']],
];
// ---------------------------------------------------------------- run
const report = {generated: 'scripts/audit-coverage.mjs', lectures: [], totals: {}, missing: {}, hidden: {}};
const seen = new Map();
for (const lecture of curriculum.lectures) {
  const row = {file: lecture.file, lecture: lecture.lecture, have: [], findability: [], missing: [], landmark: [], noise: 0};
  const local = new Set();
  for (const {en, zh} of lecture.terms) {
    const clean = en.replace(/^[A-Z]\.\s+/, '').replace(/\s+/g, ' ').trim(), key = clean.toLowerCase();
    if (local.has(key)) continue; local.add(key);
    if (classifyNoise(clean)) {row.noise++; continue;}
    const group = GROUPS.find(([re]) => re.test(key.replace(/\s+m\.?$/, ' m').replace(/ muscles?$/, ' muscle')) || re.test(key));
    if (group && !seen.has(key)) {
      const found = group[1].map(member => [member, match(member)]);
      const have = found.filter(([, m]) => m), lacking = found.filter(([, m]) => !m).map(([t]) => t);
      seen.set(key, have.length ? {kind: lacking.length ? 'group-partial' : 'group', entity: have[0][1].entity, name: `${have.length}/${found.length} members` + (lacking.length ? `（缺：${lacking.join('、')}）` : '')} : null);
      for (const t of lacking) if (have.length) row.missing.push({term: `${clean} → ${t}`, zh: null});
    }
    if (!seen.has(key)) seen.set(key, match(clean));
    const m = seen.get(key);
    const item = {term: clean, zh: zh ?? null};
    if (m) {
      Object.assign(item, {kind: m.kind, model: m.name, source: m.entity.source, system: m.entity.system});
      if (m.entity.searchable || m.entity.source === 'atlas') row.have.push(item); else row.findability.push(item);
    } else if (LANDMARK.test(clean) && !/\b(muscle|artery|vein|nerve|ligament|gland|duct)\b/i.test(clean)) row.landmark.push(item);
    else row.missing.push(item);
  }
  report.lectures.push(row);
}
const unique = pick => new Set(report.lectures.flatMap(l => l[pick].map(x => x.term.toLowerCase()))).size;
report.totals = {terms: curriculum.lectures.reduce((n, l) => n + l.terms.length, 0), have: unique('have'), findability: unique('findability'), missing: unique('missing'), landmark: unique('landmark'), noise: report.lectures.reduce((n, l) => n + l.noise, 0)};
// Parts the viewer holds but cannot show or find by any route.
const orphan = {noConcept: atlas.parts.filter(p => !conceptName.get(p.conceptId)).map(p => p.id), systemless: atlas.parts.filter(p => !p.system).map(p => p.id)};
report.orphans = orphan;

const out = {version: 1, totals: report.totals, lectures: report.lectures.map(l => ({file: l.file, lecture: l.lecture, have: l.have.length, findability: l.findability.length, missing: l.missing.map(x => x.term), landmark: l.landmark.length, noise: l.noise})), missing: [...new Set(report.lectures.flatMap(l => l.missing.map(x => x.term.toLowerCase())))].sort(), findability: [...new Set(report.lectures.flatMap(l => l.findability.map(x => x.term.toLowerCase())))].sort()};
if (candidateArg) {const by = {}; for (const l of report.lectures) for (const x of l.have) if (String(x.source).startsWith('candidate')) by[x.source] = (by[x.source] ?? new Set()).add(x.term.toLowerCase()); const base = new Set(JSON.parse(fs.readFileSync(new URL('docs/coverage-baseline.json', root))).missing); const gained = out.missing.length; console.log(JSON.stringify({stillMissing: gained, baselineMissing: base.size, gainedBySource: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, v.size]))})); process.exit(0);}
if (process.argv.includes('--pre-fix')) {const by = {}; for (const l of report.lectures) for (const x of l.findability) by[x.source] = (by[x.source] ?? new Set()).add(x.term.toLowerCase()); console.log(Object.fromEntries(Object.entries(by).map(([k, v]) => [k, v.size])), out.findability.length); process.exit(0);}
if (process.argv.includes('--data-only')) {console.log(JSON.stringify(out.totals)); process.exit(0);}

// The viewer's own Find-a-structure predicate over the atlas it really builds (body + facial + supplement).
const fullAtlas = mergeAtlasStreams(atlas, [JSON.parse(gunzipSync(fs.readFileSync(new URL('facial/facial-stream.json.gz', models)))), supplement]);
const fullParts = new Map(fullAtlas.parts.map(p => [p.id, p]));
const uiSearch = query => fullAtlas.concepts.filter(c => {
  const p = c.elements.map(id => fullParts.get(id)).find(Boolean), profile = p ? structureProfile(c.name, p.system, p) : undefined;
  return conceptMatches(c, profile, query);
});
const isMuscleTerm = t => analyse(t).type === 'muscle' || /\bm\.?$/i.test(t.trim());
// What a student would type: lecture abbreviations spelled out (post. sup. → posterior superior), list letters and the trailing "m." dropped,
// position words left out (the model may order them differently), and only plain muscle names (not "nerve to …", "… artery", "tendon of …").
const searchText = t => t.replace(/^[a-z]\.\s+/i, '').replace(/^(?:part of|musculus)\s+/i, '').toLowerCase().replace(/[^a-z\s.]/g, ' ').split(/\s+/).filter(Boolean)
  .flatMap(w => (ABBR[w.replace(/\.$/, '')] ?? w.replace(/\.$/, '')).split(' ')).filter(w => !MOD.has(w) && !STOP.has(w) && w !== 'muscle' && w !== 'muscles').join(' ').trim();
const plainMuscle = t => !/\b(nerve|artery|arteries|vein|tendon|ligament|branch|fascia|innervat\w*)\b/i.test(t) && !/\ba\.?$/i.test(t.trim());
const typoed = t => tokens(t).some(w => fixToken(w) !== w);
// Lecture terms for muscles the model has, typed the way the lecture wrote them, must be found by search.
const unsearchable = [];
for (const l of report.lectures) for (const x of l.have) {
  if (!isMuscleTerm(x.term) || !plainMuscle(x.term) || !['exact', 'contained'].includes(x.kind) || x.system !== 'muscular' && x.source !== 'supplement') continue;
  const q = searchText(x.term);
  if (q.length >= 4 && !typoed(x.term) && !uiSearch(q).length) unsearchable.push(x.term + ` [${q}]`);
}
const MUST_FIND = ['latissimus dorsi', 'latiss', '背闊肌', '闊背肌', '背阔肌', '闊背', 'rectus abdominis', 'internal oblique', 'transversus abdominis', 'quadratus lumborum', 'multifidus', 'trapezius', '斜方肌'];
const mustMiss = MUST_FIND.filter(q => !uiSearch(q).length);
const unreachable = fullAtlas.parts.filter(p => !fullAtlas.concepts.some(c => c.elements.includes(p.id))).map(p => p.name);
if (process.argv.includes('--check')) {
  const baseline = JSON.parse(fs.readFileSync(new URL('docs/coverage-baseline.json', root), 'utf8'));
  const problems = [];
  if (out.findability.length) problems.push(`${out.findability.length} structures are in the model but cannot be found by search: ${out.findability.slice(0, 12).join(', ')}`);
  if (mustMiss.length) problems.push(`Find a structure returns nothing for: ${mustMiss.join(', ')}`);
  if (unsearchable.length) problems.push(`${unsearchable.length} muscles in the curriculum list are in the model but not found by search: ${[...new Set(unsearchable)].slice(0, 12).join(', ')}`);
  if (unreachable.length) problems.push(`${unreachable.length} drawn structures belong to no searchable concept: ${unreachable.slice(0, 8).join(', ')}`);
  if (orphan.noConcept.length) problems.push(`${orphan.noConcept.length} meshes have no searchable concept`);
  const bySystem = Object.fromEntries([...new Set(atlas.parts.map(p => p.system))].map(x => [x, atlas.parts.filter(p => p.system === x).length]));
  for (const [system, n] of Object.entries(baseline.partsBySystem)) if ((bySystem[system] ?? 0) < n) problems.push(`system '${system}' lost meshes: ${bySystem[system] ?? 0} < ${n}`);
  if (extraNames.size < baseline.searchExtras) problems.push(`search index shrank: ${extraNames.size} < ${baseline.searchExtras}`);
  const known = new Set(baseline.missing);
  const fresh = out.missing.filter(t => !known.has(t));
  if (fresh.length) problems.push(`${fresh.length} curriculum structures newly missing from the model (was covered before): ${fresh.slice(0, 12).join(', ')}`);
  if (out.totals.have < baseline.have) problems.push(`covered structures fell from ${baseline.have} to ${out.totals.have}`);
  for (const l of out.lectures) { const b = baseline.lectures[l.file]; if (b && l.have < b) problems.push(`${l.lecture}: covered ${l.have} < baseline ${b}`); }
  if (problems.length) {console.error('Coverage regression:\n - ' + problems.join('\n - ')); process.exit(1);}
  console.log(`Coverage OK: ${out.totals.have} curriculum structures present and findable, ${out.missing.length} known-missing (tracked in docs/coverage-baseline.json), ${out.totals.landmark} bone landmarks ride on existing bones.`);
  process.exit(0);
}

// ---------------------------------------------------------------- report
const md = ['# 課程清單覆蓋報告', '',
  `來源：\`docs/curriculum-terms.json\`（18 堂課自動抽出，${report.totals.terms.toLocaleString()} 個詞，寧多勿漏、含雜訊）。由 \`node scripts/audit-coverage.mjs\` 產生，\`npm run check:coverage\` 每次 build 前核對。`, '',
  '先篩走明顯唔係解剖結構嘅詞（病況、動作、段落字眼、純方位詞等），其餘同模型所有名稱做模糊配對：同義縮寫（m./a./v./n./lig./br.）、單複數、左右側、拉丁／英文拼法。模型名稱來自圖譜 2,234 件＋面部 47 件＋神經串流 286 件＋關節組織 349 件＋腦 437 件＋頸部血管。', '',
  '| 類別 | 不重複詞數 | 意思 |', '|---|---|---|',
  `| 一、已有 | ${report.totals.have} | 模型有，而且可以用搜尋／圖層揀到 |`,
  `| 二、模型有但 UI 搵唔到 | ${report.totals.findability} | 模型有幾何，但搜尋唔到（見下面清單；已修好者會喺「修復」一節列明） |`,
  `| 三、模型冇 | ${report.totals.missing} | 交俾第 2 部分補模型 |`,
  `| 骨性標誌 | ${report.totals.landmark} | 結節、窩、切跡等，屬已有骨件嘅表面特徵，模型唔另外分件 |`,
  `| 雜訊（已略去） | ${report.totals.noise} | 唔係解剖結構 |`, ''];
const ids = atlas.parts.map(p => +p.id.replace(/\D/g, '')).filter(Boolean).sort((a, b) => a - b), gaps = [];
for (let i = 1; i < ids.length; i++) if (ids[i] - ids[i - 1] > 1) gaps.push([ids[i - 1] + 1, ids[i] - 1]);
const gapCount = gaps.reduce((n, g) => n + g[1] - g[0] + 1, 0);
md.push('## 闊背肌（Latissimus dorsi）點解搵唔到', '',
  '**結論：係 (b)——BodyParts3D 原始資料有，但網站用嘅 4.0 匯出（2,234 件）冇匯出呢件肌肉，所以冇 geometry、冇 concept，搜尋當然搵唔到。** 唔係 (c) 有 geometry 但冇載入，亦唔係 (d) 搜尋索引漏收；之前報告話「來源入面根本冇」係錯嘅，原因係當時連唔到官方部件名單。', '',
  '查證：', '',
  '- BodyParts3D 3.0 官方部件名單（`parts_list_e.txt`，經 Kevin-Mattheus-Moerman/BodyParts3D 鏡像 `f0eeb6e843380cfe6b83797cf8c3e1af74de5e61` 取得）有 `FMA13357 latissimus dorsi`、`FMA13358 right latissimus dorsi`、`FMA13359 left latissimus dorsi`，而且左右兩邊都有 STL（各約 22.8 萬三角面）。',
  '- `public/models/atlas.json`（4.0 匯出）嘅 2,234 件 mesh 同 3,432 個 concept 都冇 latissimus／dorsi／FMA13357–13359；`app/anatomy-source-overrides.json` 只排除咗 2 件（足跟動脈分支），冇涉及闊背肌。',
  `- 3.0 有 925 個 STL；其中 128 個唔喺 4.0 atlas 入面：47 個係已經用緊嘅面部肌（OMFAtlas 套件），其餘主要係闊背肌、腹直肌、腹內斜肌、腹橫肌、錐狀肌、腰方肌、頸棘肌、多裂肌、腹股溝韌帶、伸趾短肌、右頸長肌、顳頂肌、帽狀腱膜、降鼻中隔肌（共 28 件已補入，見 \`scripts/supplement-parts.json\`），餘下係腦／心臟細部、毛髮、結腸等，另計。來源 mesh 編號有 ${gaps.length} 段缺口、共 ${gapCount} 個編號冇匯出，同樣係 4.0 匯出時被略去。`,
  '- `normalizeAtlasSystems` 已經修正 89 件系統分類錯誤（例如腓骨肌被標成骨骼）；冇肌肉被 dissection／region／depth 過濾器濾走：全身視圖永遠顯示所有開咗嘅系統。', '',
  '**修復**：`scripts/prepare-supplement.mjs` 由 3.0 鏡像下載已釘 sha256 嘅 STL，用 OMFAtlas 面部肌肉同一個相似變換（比例 1.0594、Z-up mm → Y-up m）對齊 4.0，再以 meshoptimizer 簡化（每件 ≤ 1.6 萬三角面，誤差 < 0.1%）、分成細包 gzip，載入方式同其餘分包一樣。對齊用六塊面部肌（4.0 已有）驗證，偏差 ≤ 0.02 mm；`scripts/test-all-structures.mjs` 再驗證闊背肌左右兩邊貼住肩胛骨、到達髂嵴。授權同現有資料一樣係 CC BY-SA 2.1 Japan。', '',
  '**2,279 對 2,232 嘅差異**：47 件面部肌（`BP3-FMA…`）以前要由 raw.githubusercontent.com 讀 16 MB 單一檔案，慢線 60 秒逾時就永遠載入唔到，標題就顯示 2,279 但只畫到 2,232（載入條停喺 93 %）。而家改為同源、壓縮、分段載入；`test-all-structures.mjs` 檢查每一件都有對應 package bytes。', '',
  '**同類 bug 嘅影響**：真正「模型有、UI 搵唔到」嘅係另一類——外周神經（286 件）、關節韌帶／關節囊（349 件）、腦結構（437 件）、頸部血管（8 件）喺 3D 入面畫到，但唔屬於 atlas concepts，搜尋搵唔到（課程詞中有 187 個受影響：神經 124、關節 49、腦 11、頸血管 3）。已經喺「Find a structure」加入呢 1,080 項索引，揀到神經會直接高亮，揀到其餘會打開圖層同資料卡。', '',
  '**build 守門**：`npm run check:coverage`（亦係 `npm run build` 前置步驟）用 Find a structure 真正嘅比對函式（`app/mj-search.ts`）檢查：闊背肌（latissimus／背闊肌／闊背肌／背阔肌）等指定肌肉必須搵到；課程清單入面「模型有嘅肌肉」用講義寫法（縮寫展開後）全部必須搵到；每一件畫出嚟嘅 mesh 都屬於某個可搜尋 concept。唔通過就 build 失敗。', '',
  '缺口編號（供補模型時對照）：' + gaps.map(g => g[0] === g[1] ? `FJ${g[0]}` : `FJ${g[0]}–${g[1]}`).join('、'), '');
for (const l of report.lectures) {
  md.push(`## ${l.lecture}　\`${l.file}\``, '', `已有 ${l.have.length}　·　UI 搵唔到 ${l.findability.length}　·　模型冇 ${l.missing.length}　·　骨標誌 ${l.landmark.length}　·　雜訊 ${l.noise}`, '');
  const partial = l.have.filter(x => x.kind === 'specific' || x.kind === 'fuzzy');
  if (partial.length) md.push('**一、已有（部分配對：模型件較概括／較細，請覆核）**', '', ...partial.map(x => `- ${x.term} → ${x.model}［${x.kind}］`), '');
  if (l.findability.length) md.push('**二、模型有但 UI 搵唔到**', '', ...l.findability.map(x => `- ${x.term}${x.zh ? `（${x.zh}）` : ''} → 模型：${x.model}［${x.source}］`), '');
  if (l.missing.length) md.push('**三、模型冇**', '', ...l.missing.map(x => `- ${x.term}${x.zh ? `（${x.zh}）` : ''}`), '');
}
fs.writeFileSync(new URL('docs/coverage-report.md', root), md.join('\n'));
fs.writeFileSync(new URL('docs/coverage-data.json', root), JSON.stringify({totals: report.totals, lectures: report.lectures}, null, 1));
fs.writeFileSync(new URL('docs/coverage-baseline.json', root), JSON.stringify({partsBySystem: Object.fromEntries([...new Set(atlas.parts.map(p => p.system))].map(x => [x, atlas.parts.filter(p => p.system === x).length])), searchExtras: extraNames.size, have: out.totals.have, missing: out.missing, lectures: Object.fromEntries(out.lectures.map(l => [l.file, l.have]))}, null, 1));
console.log(JSON.stringify(report.totals));
