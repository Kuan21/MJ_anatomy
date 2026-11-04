// Scope (範圍: 摘要 / 延伸): every summary term has a summary structure, aliases and the quiz agree with it, the lung structures keep their scope, the default quiz scope is every question.
// Output is pass/fail and counts only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';

const text = f => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const {scopeOf, scopeName, SCOPE_LABEL} = await quizModule('app/mj-scope.ts');
const audit = JSON.parse(text('docs/paokao-audit.json')), aliases = JSON.parse(text('docs/paokao-aliases.json')), scope = JSON.parse(text('app/mj-scope.json'));
const {questionPool} = await quizModule('app/quiz/catalogue.ts');

// 1. every summary term that is a structure of its own maps to a summary structure
const bad = audit.rows.filter(r => (r.status === 'have' || r.status === 'new') && !r.model.split('；').some(m => scopeOf(m) === 'summary'));
assert.deepEqual(bad.map(r => `${r.name} -> ${r.model}`), [], 'summary terms whose structure is not marked summary');
// 2. every alias (the model's own spelling of a summary term) that a summary term uses leads to a structure marked summary: the audit row of that term is checked through the structure it resolved to
const rowOf = k => audit.rows.filter(r => r.name && r.name.toLowerCase() === k);
const badAlias = Object.keys(aliases).filter(k => rowOf(k).length && !rowOf(k).every(r => r.model.split('；').some(m => scopeOf(m) === 'summary')));
assert.deepEqual(badAlias, [], 'aliases whose structure is not marked summary');
// 3. a paired structure counts for both sides; the scope never depends on left/right
assert.equal(scopeName('Left groove for subclavian artery'), scopeName('Right groove for subclavian artery'));
assert.equal(scopeName('Biceps brachii.l.001'), 'biceps brachii');
for (const [a, b] of [['Ascending part of right trapezius', 'Ascending part of left trapezius'], ['Left subclavian artery', 'Right subclavian artery']]) assert.equal(scopeOf(a), scopeOf(b), `${a}/${b}`);
assert.equal(scopeOf('Descending part of left trapezius'), 'summary', 'every part of a summary muscle is summary');
// 4. lung structures: the grooves in the summary are summary, the ones the atlas adds are extended; the right tracheal contact area stays, the left one does not exist
const lung = JSON.parse(text('app/mj-paokao.json')), lungNames = new Set(Object.values(lung).filter(c => c.lung).map(c => c.name));
for (const n of ['Groove for aortic arch', 'Left groove for subclavian artery', 'Groove for azygos vein', 'Groove for descending aorta', 'Cardiac impression of left lung']) assert.equal(scopeOf(n), 'summary', n);
for (const n of ['Contact area for trachea of right lung', 'Contact area for thymus of left lung', 'Groove for first rib of right lung', 'Groove for esophagus', 'Groove for superior vena cava', 'Groove for inferior vena cava', 'Apex of left lung', 'Diaphragmatic surface of right lung', 'Anterior border of left lung', 'Inferior border of right lung']) { assert.ok(lungNames.has(n), `${n} is kept`); assert.equal(scopeOf(n), 'extended', n); }
assert.ok(!lungNames.has('Contact area for trachea of left lung'), 'the left tracheal contact area stays removed');
// 5. the generated list is not empty and holds no note wording
assert.ok(scope.ids.length > 500 && scope.names.length > 300);
assert.ok(!/筆記|共筆|跑考|課堂/.test(JSON.stringify(scope)));
assert.deepEqual(Object.values(SCOPE_LABEL).map(l => l[1]), ['摘要', '延伸']);
// 6. the quiz: the default (包括延伸) is every question as before; 只考摘要範圍 is a part of it and not empty for the big regions
let total = 0, summary = 0;
for (const f of ['quiz-lower.json', 'quiz-upper.json', 'quiz-thorax.json', 'quiz-back.json', 'quiz-heart.json', 'quiz-lung.json']) {
  const cat = JSON.parse(fs.readFileSync(new URL(`../public/models/${f}`, import.meta.url), 'utf8')), base = {section: 'all', side: 'both', systems: ['skeletal', 'muscular', 'tendon', 'nervous', 'arterial', 'venous', 'cardiac', 'respiratory'], count: 9999};
  const all = questionPool(cat, base), none = questionPool(cat, {...base, scope: 'all'}), only = questionPool(cat, {...base, scope: 'summary'});
  assert.equal(none.length, all.length, `${f}: default scope is every question`);
  assert.ok(only.length <= all.length && only.every(s => all.some(a => a.id === s.id)), `${f}: summary pool is part of the full pool`);
  total += all.length; summary += only.length;
}
assert.ok(summary > 100 && summary < total, 'summary pool is a real subset');
const page = text('app/quiz/page.tsx'), card = text('app/page.tsx');
assert.match(page, /scope: 'all'/); assert.match(page, /只考摘要範圍/); assert.match(page, /包括延伸/);
assert.match(card, /className="scope-row"/); assert.match(text('app/search-panel.tsx'), /scope-tag/);
console.log(`Scope OK: ${audit.rows.filter(r => r.status === 'have' || r.status === 'new').length} summary terms, ${Object.keys(aliases).length} aliases, quiz ${summary} of ${total} questions in the summary scope.`);
