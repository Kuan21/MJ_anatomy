// Shared matcher for the coverage audits (scripts/audit-coverage.mjs, scripts/audit-paokao.mjs): everything the viewer can show as a list of named entities,
// and a fuzzy matcher from a lecture/summary term (abbreviations a./v./n./m./lig./br., plurals, left/right) to those entities.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {quizModule} from '../quiz-modules.mjs';

const root = new URL('../../', import.meta.url), models = new URL('public/models/', root);
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
const readGz = file => JSON.parse(gunzipSync(fs.readFileSync(new URL(file, models))));
const female = readGz('female/female-stream.json.gz'), serous = readGz('serous/serous-stream.json.gz'), heart = readGz('heart/heart-detail.json.gz');
for (const p of female.parts) add('female', p.id, p.system, [p.name], {searchable: true});
for (const p of serous.parts) add('serous', p.id, p.system, [p.name], {searchable: true});
const paokaoFile = new URL('paokao/paokao-stream.json.gz', models), paokao = fs.existsSync(paokaoFile) ? readGz('paokao/paokao-stream.json.gz') : {parts: [], chunks: []};
for (const p of paokao.parts) add('paokao', p.id, p.system, [p.name], {searchable: true});
for (const p of heart.parts) add('heart', p.id, p.system ?? 'cardiac', [p.name, p.chinese ? null : null], {searchable: true});
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
function matchAll(term) {
  const a = analyse(term);
  a.core = new Set([...a.core].map(fixToken));
  if (!a.core.size) return [];
  const found = [];
  for (const i of candidates(a.core)) {
    const e = entities[i];
    let best = null;
    for (const m of e.analysed) {
      if (!m.core.size) continue;
      if (a.type && m.type && a.type !== m.type && !(a.type === 'branch' || m.type === 'branch')) continue;
      const inter = [...a.core].filter(t => m.core.has(t)).length;
      let kind = null;
      if (inter === a.core.size && inter === m.core.size) kind = 'exact';
      else if (inter === a.core.size) kind = 'contained';                  // the term is more general than the model's piece
      else if (inter === m.core.size && ((m.core.size >= 2) || (m.core.size === 1 && [...m.core][0].length >= 7 && !GENERIC.has([...m.core][0]))) && [...a.core].filter(t => !m.core.has(t)).every(t => MOD.has(t))) kind = 'specific';
      if (!kind) continue;
      const rank = {exact: 4, contained: 3, specific: 2, fuzzy: 1}[kind] * 100 - Math.abs(m.core.size - a.core.size);
      if (!best || rank > best.rank) best = {rank, kind, entity: e, name: e.names[0]};
    }
    if (best) found.push(best);
  }
  return found.sort((x, y) => y.rank - x.rank);
}
function match(term) { return matchAll(term)[0] ?? null; }
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
export {matchAll, paokao, candidateArg, GROUPS, female, serous, heart, root, models, atlas, facial, supplement, conceptName, partIds, curriculum, entities, extraNames, ABBR, TYPE, STOP, MOD, GENERIC, NOT_STRUCTURE, LANDMARK, tokens, analyse, stem1, fixToken, match, candidates, classifyNoise, structureProfile, mergeAtlasStreams, conceptMatches, correctedPartName, isIndexed};
