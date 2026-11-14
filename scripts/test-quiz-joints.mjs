// Joint soft tissue in the quiz (category 關節). Reads the generated quiz catalogues and the exclusion report written by scripts/prepare-quiz.mjs.
//   node scripts/test-quiz-joints.mjs            check
//   node scripts/test-quiz-joints.mjs --write    rewrite docs/quiz-joints-pool.md (counts per region and every exclusion with its reason)
//   node scripts/test-quiz-joints.mjs --check    also fail when docs/quiz-joints-pool.md is stale
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {QUIZ_REGIONS, QUIZ_CATEGORIES, categoryOf, questionPool} = await quizModule('app/quiz/catalogue.ts');
const {namingPool, nameCounts, exclusionOf} = await quizModule('app/quiz/level2.ts');
const {structureCard} = await quizModule('app/quiz/card.ts');
const {JOINT_EXCLUSION_REASONS, jointKey} = await quizModule('app/quiz/joints.ts');

const report = JSON.parse(fs.readFileSync('.sites-runtime/quiz-joints-report.json', 'utf8'));
const asked = new Set(['lower-limb', 'upper-limb', 'thorax', 'back', 'head-neck']);
assert.ok(QUIZ_CATEGORIES.some(c => c.id === 'joint' && c.label === '關節' && c.english === 'Joints'), 'category joint is missing');
const doc = fs.readFileSync('docs/quiz-joints.md', 'utf8');
for (const [reason, text] of Object.entries(JOINT_EXCLUSION_REASONS)) assert.ok(doc.includes(text), `docs/quiz-joints.md does not state the reason "${reason}": ${text}`);

const counts = {}, problems = [];
for (const [region, def] of Object.entries(QUIZ_REGIONS)) {
  const catalogue = JSON.parse(fs.readFileSync(`public/models/${def.file}`, 'utf8')), dup = nameCounts(catalogue);
  const joints = catalogue.structures.filter(s => s.system === 'joint');
  counts[region] = joints.length;
  if (!asked.has(region)) {assert.equal(joints.length, 0, `${region} must not hold joint structures`); continue;}
  assert.ok(joints.length > 0, `${region}: no joint structures`);
  for (const s of joints) {
    if (!s.chinese) problems.push(`${region}: ${s.name} has no Chinese name`);
    if (exclusionOf(s, dup)) problems.push(`${region}: ${s.name} is not askable at level 2/3 (${exclusionOf(s, dup)})`);
    if (!s.sections.length) problems.push(`${region}: ${s.name} has no section`);
    if (categoryOf(s) !== 'joint') problems.push(`${region}: ${s.name} is not in category joint`);
    if (categoryOf({name: s.name, system: 'skeletal'}) === 'joint' || categoryOf({name: s.name, system: 'muscular'}) === 'joint') problems.push(`${region}: the name rule produced 'joint' for ${s.name}`);
    const card = structureCard(s);
    if (!card.fields.length && card.missing.length !== 3) problems.push(`${region}: ${s.name} has neither card fields nor an explicit gap list`);
    if (!s.meshIds.length) problems.push(`${region}: ${s.name} has no mesh`);
  }
  // no other category may hold a joint tissue, and no joint tissue shares a name with another structure of the region
  for (const s of catalogue.structures.filter(x => x.system !== 'joint')) if (categoryOf(s) === 'joint') problems.push(`${region}: ${s.name} (${s.system}) is in category joint`);
  const names = new Set(catalogue.structures.filter(x => x.system !== 'joint').map(x => jointKey(x.name)));
  for (const s of joints) if (names.has(jointKey(s.name))) problems.push(`${region}: ${s.name} is asked both as a joint tissue and under another system`);
  // both levels hold the same joint questions, on both sides and in every section
  for (const section of def.sections) for (const side of ['left', 'right', 'both']) {
    const settings = {section: section.id, side, systems: [], categories: ['joint'], count: 9999};
    if (questionPool(catalogue, settings).length !== namingPool(catalogue, settings).length) problems.push(`${region} / ${section.label} / ${side}: level 1 and level 2 hold different joint questions`);
  }
  // paired structures: every sided joint tissue has its counterpart on the other side
  const sided = joints.filter(s => s.side !== 'midline'), key = s => jointKey(s.name);
  for (const s of sided) if (!sided.some(o => o.side !== s.side && key(o) === key(s))) problems.push(`${region}: ${s.name} has no ${s.side === 'left' ? 'right' : 'left'} counterpart`);
}
assert.deepEqual(problems, [], 'joint quiz problems:\n' + problems.join('\n'));

// the report: asked tissues are in their region's catalogue, every other tissue carries one documented reason
const inCatalogue = (region, c) => JSON.parse(fs.readFileSync(`public/models/${QUIZ_REGIONS[region].file}`, 'utf8')).structures.some(s => s.system === 'joint' && s.name === c.name);
for (const c of report) {
  if (c.reason) {
    assert.ok(JOINT_EXCLUSION_REASONS[c.reason], `${c.name}: undocumented reason ${c.reason}`);
    if (c.reason === 'region-missing') assert.ok(['pelvis', 'trunk-other'].includes(c.region), `${c.name}: region-missing for ${c.region}`);
    if (asked.has(c.region)) assert.ok(!inCatalogue(c.region, c), `${c.name}: excluded (${c.reason}) but present in ${c.region}`);
  } else assert.ok(asked.has(c.region) && inCatalogue(c.region, c), `${c.name}: not excluded but missing from ${c.region}`);
}
assert.ok(!report.some(c => c.reason === 'region-missing' && asked.has(c.region)));

// docs/quiz-joints-pool.md
const regionLabel = {'lower-limb': '下肢', 'upper-limb': '上肢', thorax: '胸腔', back: '背部'};
const group = rows => {const m = new Map(); for (const r of rows) {const k = r.base; (m.get(k) ?? m.set(k, []).get(k)).push(r);} return [...m.values()];};
const label = rows => `${rows[0].base}${rows[0].chinese ? `（${rows[0].chinese.replace(/^[左右]/, '')}）` : ''} [${[...new Set(rows.map(r => r.side))].join('/')}]`;
const lines = ['# Quiz 關節題庫範圍（關節 Joints）', '', '此檔由 `node scripts/test-quiz-joints.mjs --write` 產生，請勿手改。規則見 `docs/quiz-joints.md`。以「構造」計（左右各算一個）。', '',
  '## 各部位題數', '', '| 部位 | 關節構造（可出題） | 不出題 |', '| --- | --- | --- |',
  ...Object.entries(regionLabel).map(([r, l]) => `| ${l} | ${counts[r]} | ${report.filter(c => c.reason && c.region === r).length} |`),
  `| 骨盆／頭頸／其他（部位尚未開放） | 0 | ${report.filter(c => !asked.has(c.region)).length} |`, ''];
for (const [reason, text] of Object.entries(JOINT_EXCLUSION_REASONS)) {
  const rows = report.filter(c => c.reason === reason), groups = group(rows);
  if (!groups.length) continue;
  lines.push(`## 不出題：${text}（${groups.length} 種，${rows.length} 個構造）`, '');
  for (const g of groups.sort((a, b) => a[0].base.localeCompare(b[0].base))) lines.push(`- ${label(g)}，${g[0].region}`);
  lines.push('');
}
lines.push('## 可出題的關節構造', '');
for (const [r, l] of Object.entries(regionLabel)) {
  const groups = group(report.filter(c => !c.reason && c.region === r));
  lines.push(`### ${l}（${groups.length} 種，${counts[r]} 個構造）`, '', ...groups.sort((a, b) => a[0].base.localeCompare(b[0].base)).map(g => `- ${label(g)}`), '');
}
const text = lines.join('\n');
if (process.argv.includes('--write')) {fs.writeFileSync('docs/quiz-joints-pool.md', text); console.log('wrote docs/quiz-joints-pool.md');}
else if (process.argv.includes('--check')) assert.equal(fs.existsSync('docs/quiz-joints-pool.md') && fs.readFileSync('docs/quiz-joints-pool.md', 'utf8'), text, 'docs/quiz-joints-pool.md is stale: run node scripts/test-quiz-joints.mjs --write');
console.log(`Quiz joints passed: ${Object.entries(regionLabel).map(([r, l]) => `${l} ${counts[r]}`).join('、')}; ${report.filter(c => c.reason).length} tissues not asked, each with a documented reason.`);
