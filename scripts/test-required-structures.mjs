// Tests for the required-structure list and its check: file shape, stable ids, names only (no sentences, no source wording), known gaps and aliases that point at real ids,
// and the pure matching functions on small fixtures. Prints only pass/fail and counts.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {addToIndex, canonKey, classify, createIndex, parentNames, requiredKey, requiredKeys, splitNames, zhKey} from './lib/required-match.mjs';

const root = new URL('../', import.meta.url);
const read = rel => fs.readFileSync(new URL(rel, root), 'utf8');
const list = JSON.parse(read('docs/required-structures/head-neck.json'));
const aliases = JSON.parse(read('docs/required-structures/aliases.json'));
const known = JSON.parse(read('docs/required-structures/known-gaps.json'));
const rows = list.structures;

// ---- the list file
assert.equal(list.kind, 'names-only');
assert.ok(rows.length > 800, 'the list is not empty');
const ids = rows.map(r => r.id);
assert.ok(ids.every(id => /^RS-\d{4}$/.test(id)), 'ids look like RS-0001');
assert.equal(new Set(ids).size, ids.length, 'ids are unique');
assert.deepEqual([...ids].sort(), ids, 'ids are in order');
const keys = rows.map(r => requiredKey(r.en));
assert.equal(new Set(keys).size, keys.length, 'no structure is listed twice');
const FIELDS = ['id', 'en', 'zh', 'type', 'topics', 'expect3d', 'reason', 'seed'];
for (const r of rows) {
  assert.ok(Object.keys(r).every(k => FIELDS.includes(k)), `unexpected field in ${r.id}`);
  assert.ok(typeof r.en === 'string' && r.en.length > 1 && r.en.length <= 80, `en of ${r.id}`);
  assert.ok(typeof r.zh === 'string' && r.zh.length <= 40, `zh of ${r.id}`);
  assert.ok(typeof r.type === 'string' && r.type, `type of ${r.id}`);
  assert.ok(Array.isArray(r.topics) && r.topics.length > 0, `topics of ${r.id}`);
  assert.equal(typeof r.expect3d, 'boolean');
  if (!r.expect3d) assert.ok(r.reason, `a structure that is not expected in 3D needs a reason (${r.id})`);
  for (const v of [r.en, r.zh, r.reason ?? '', ...r.topics]) assert.ok(v.length <= 80 && !/[。！？]$/.test(v) && !/[。！？]/.test(v), `name only, no sentence (${r.id})`);
  assert.ok(!/\.\s+[A-Z]/.test(r.en) && r.en.split(/\s+/).length <= 12, `en looks like a name (${r.id})`);
}
assert.ok(rows.some(r => !r.expect3d) && rows.some(r => r.expect3d));

// ---- nothing from the source material leaks into the list, the data files or the scripts
const WORDS = new RegExp(['共', '筆'].join('') + '|' + ['筆', '記'].join('') + '|' + ['跑', '考'].join('') + '|' + ['課', '堂'].join('') + '|' + ['講', '義'].join('') + '|' + ['考', '古'].join('') + '|\\bp\\.\\s?\\d|[0-9]{4} ?p\\.[0-9]|neuro-notes|course notes', 'i');
for (const rel of ['docs/required-structures/head-neck.json', 'docs/required-structures/aliases.json', 'docs/required-structures/known-gaps.json', 'docs/required-structures/README.md',
  'scripts/build-required-structures.mjs', 'scripts/check-required-structures.mjs', 'scripts/lib/required-match.mjs']) {
  assert.ok(!WORDS.test(read(rel)), `${rel} carries source wording`);
}

// ---- known gaps and aliases point at real, drawable structures
const byId = new Map(rows.map(r => [r.id, r]));
assert.ok(known.ids.length > 0 && new Set(known.ids).size === known.ids.length, 'known gaps are unique');
assert.deepEqual([...known.ids].sort(), known.ids, 'known gaps are sorted');
for (const id of known.ids) assert.ok(byId.get(id)?.expect3d, `known gap ${id} is a listed structure expected in 3D`);
const KINDS = new Set(['synonym', 'member']);
for (const a of aliases.aliases) {
  assert.ok(byId.get(a.id)?.expect3d, `alias ${a.id} points at a listed structure`);
  assert.ok(KINDS.has(a.kind) && typeof a.site === 'string' && a.site.length > 1 && a.site.length <= 80, `alias row ${a.id}`);
}

// ---- normalisation
assert.equal(canonKey('Frontalis muscle'), canonKey('Right frontalis'));
assert.equal(canonKey('Superior sagittal sinuses'), canonKey('superior sagittal sinus'));
assert.equal(canonKey('Infra-orbital foramen'), canonKey('Infraorbital foramen'));
assert.equal(canonKey("Schlemm's canal"), canonKey('Schlemms canal'));
assert.equal(canonKey('Facial nerve.l.001'), canonKey('Left facial nerve'));
assert.equal(canonKey('Aqueous humour'), canonKey('aqueous humor'));
assert.notEqual(canonKey('Facial artery'), canonKey('Facial nerve'), 'artery and nerve stay apart');
assert.notEqual(canonKey('Facial vein'), canonKey('Facial artery'));
assert.equal(canonKey('  '), '');
assert.deepEqual(splitNames('Optic disc (blind spot)'), ['Optic disc', 'blind spot']);
assert.deepEqual(splitNames('Trigeminal nerve (CN V)'), ['Trigeminal nerve']);
assert.deepEqual(requiredKeys('Optic disc (blind spot)'), [canonKey('Optic disc'), canonKey('blind spot')]);
assert.equal(requiredKey('Facial nerve (CN VII)'), canonKey('Facial nerve'));
assert.deepEqual(parentNames('Superficial part of right masseter'), ['right masseter']);
assert.deepEqual(parentNames('Facial nerve'), []);
assert.equal(zhKey('左額肌', true), '額肌');
assert.equal(zhKey('左心室'), '左心室', 'a side word is kept unless the English name was sided');
assert.equal(zhKey('視神經（第二對）'), '視神經');

// ---- matching
const index = createIndex();
addToIndex(index, {names: ['Superficial part of right masseter'], zh: ['右咬肌淺部']});
addToIndex(index, {names: ['Left frontalis'], zh: ['左額肌']});
addToIndex(index, {names: ['Median cricothyroid ligament'], zh: ['環甲正中韌帶']});
addToIndex(index, {names: ['Circle of Willis'], zh: ['大腦動脈環'], status: 'CARD-ONLY'});
addToIndex(index, {names: ['Facial nerve'], zh: ['面神經']});
assert.equal(classify({en: 'Frontalis', zh: ''}, index).status, 'PRESENT');
assert.equal(classify({en: 'Masseter', zh: ''}, index).status, 'PRESENT', 'a muscle drawn in parts is present');
assert.equal(classify({en: 'Facial artery', zh: ''}, index).status, 'MISSING');
assert.equal(classify({en: 'Facial nerve', zh: ''}, index).status, 'PRESENT');
assert.equal(classify({en: 'Cricothyroid ligament', zh: ''}, index, ['Median cricothyroid ligament']).status, 'ALIAS');
assert.equal(classify({en: 'Cricothyroid ligament', zh: ''}, index).status, 'MISSING');
assert.equal(classify({en: 'Circle of Willis', zh: ''}, index).status, 'CARD-ONLY');
assert.equal(classify({en: 'Cerebral arterial circle', zh: '大腦動脈環'}, index).status, 'CARD-ONLY');
assert.equal(classify({en: 'Frontal belly', zh: '額肌'}, index).status, 'ALIAS', 'found by its Chinese name');
assert.equal(classify({en: 'Facial artery', zh: '面動脈'}, index).status, 'MISSING');

console.log(`Required structures tests OK: ${rows.length} listed, ${known.ids.length} known gaps, ${aliases.aliases.length} alias rows.`);
