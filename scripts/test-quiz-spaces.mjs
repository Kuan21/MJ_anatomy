// Limb spaces in the quiz (category 特殊空間與孔). Reads the generated quiz catalogues and the report written by scripts/prepare-quiz.mjs.
//   node scripts/test-quiz-spaces.mjs            check
//   node scripts/test-quiz-spaces.mjs --write    rewrite docs/quiz-spaces-pool.md (the spaces asked per region, their members, and every exclusion with its reason)
//   node scripts/test-quiz-spaces.mjs --check    also fail when docs/quiz-spaces-pool.md is stale
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {QUIZ_REGIONS, QUIZ_CATEGORIES, categoryOf, questionPool, sceneStructures} = await quizModule('app/quiz/catalogue.ts');
const {namingPool, nameCounts, exclusionOf} = await quizModule('app/quiz/level2.ts');
const {buildLessons} = await quizModule('app/quiz/lessons.ts');
const {structureCard} = await quizModule('app/quiz/card.ts');
const {SPACES} = await quizModule('app/mj-spaces.ts');
const {SPACE_EXCLUSION_REASONS, SPACE_REGION, MAX_REACH} = await quizModule('app/quiz/spaces.ts');

const report = JSON.parse(fs.readFileSync('.sites-runtime/quiz-spaces-report.json', 'utf8'));
const limb = ['lower-limb', 'upper-limb'], sides = ['left', 'right'];
assert.ok(QUIZ_CATEGORIES.some(c => c.id === 'space' && c.label === '特殊空間與孔'), 'category space is missing');
const doc = fs.readFileSync('docs/quiz-spaces.md', 'utf8');
for (const [reason, text] of Object.entries(SPACE_EXCLUSION_REASONS)) assert.ok(doc.includes(text), `docs/quiz-spaces.md does not state the reason "${reason}": ${text}`);

const problems = [], counts = {}, catalogues = {};
for (const [region, def] of Object.entries(QUIZ_REGIONS)) {
  const catalogue = JSON.parse(fs.readFileSync(`public/models/${def.file}`, 'utf8')), dup = nameCounts(catalogue), byId = new Map(catalogue.structures.map(s => [s.id, s]));
  catalogues[region] = catalogue;
  const spaces = catalogue.structures.filter(s => s.system === 'space');
  counts[region] = spaces.length;
  if (!limb.includes(region)) {assert.equal(spaces.length, 0, `${region} must not hold space structures`); continue;}
  assert.ok(spaces.length > 0, `${region}: no space structures`);
  const packaged = new Set(catalogue.packages.flatMap(p => p.meshes.map(m => m.structureId)));
  for (const s of spaces) {
    const where = `${region}: ${s.name}`, entry = SPACES.find(d => d.id === s.space?.id);
    if (!entry) {problems.push(`${where} has no entry in app/mj-spaces.ts`); continue;}
    if (s.chinese !== (s.side === 'left' ? '左' : '右') + entry.zh) problems.push(`${where}: Chinese name ${s.chinese} differs from the special-region list (${entry.zh})`);
    if (s.name !== `${s.side === 'left' ? 'Left' : 'Right'} ${entry.en.toLowerCase()}`) problems.push(`${where}: English name differs from the special-region list (${entry.en})`);
    if (exclusionOf(s, dup)) problems.push(`${where} is not askable at level 2/3 (${exclusionOf(s, dup)})`);
    if ((dup.get(`${s.name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim()}|${s.side}`) ?? 0) !== 1) problems.push(`${where}: name is not unique`);
    if (!s.sections.length) problems.push(`${where} has no section`);
    if (categoryOf(s) !== 'space') problems.push(`${where} is not in category space`);
    if (s.meshIds.length) problems.push(`${where}: a space must not carry a mesh of its own (no plane, disc, cylinder or invented shape)`);
    if (SPACE_REGION[entry.group] !== region) problems.push(`${where}: belongs to ${SPACE_REGION[entry.group]}`);
    // a drawable representation: at least two walls and one content, every member a real structure of the catalogue with geometry, on the same side (or midline)
    const members = s.space.members, roles = new Set(members.map(m => m.role));
    if (members.length < 3 || !roles.has('content') || ![...roles].some(r => r !== 'content')) problems.push(`${where}: needs boundary structures and contents, has ${members.map(m => m.role).join(',')}`);
    if (new Set(members.map(m => m.id)).size !== members.length) problems.push(`${where}: a member is listed twice`);
    for (const m of members) {
      const member = byId.get(m.id);
      if (!member) {problems.push(`${where}: member ${m.id} is not in the catalogue`); continue;}
      if (member.system === 'space' || member.system === 'joint') problems.push(`${where}: member ${member.name} is a ${member.system}`);
      if (member.side !== 'midline' && member.side !== s.side) problems.push(`${where}: member ${member.name} is on the other side`);
      if (!member.meshIds.length || !packaged.has(member.id)) problems.push(`${where}: member ${member.name} has no mesh`);
      if (member.bounds[0][0] > s.bounds[1][0] + .35 || member.bounds[1][0] < s.bounds[0][0] - .35) problems.push(`${where}: member ${member.name} lies far from the space`);
    }
    // the scene of the question holds every member
    const scene = new Set(sceneStructures(catalogue, s, s.sections[0], s.side).map(x => x.id));
    for (const m of members) if (!scene.has(m.id)) problems.push(`${where}: member ${m.id} is not in the scene`);
    // the answer card: only existing data; fields without data are listed, never filled
    const card = structureCard(s);
    if (card.fields.length + card.missing.length !== 3) problems.push(`${where}: card lists ${card.fields.length} fields and ${card.missing.length} gaps`);
    if (!card.fields.some(f => f.label === '邊界') || !card.fields.some(f => f.label === '內容物')) problems.push(`${where}: card has no boundary or contents line`);
    // the space box is around the centre of the special-region list (app/space-ranges.json)
    const ranges = JSON.parse(fs.readFileSync('app/space-ranges.json', 'utf8'))[entry.id];
    if (!ranges || ranges[s.side].reach > MAX_REACH) problems.push(`${where}: no clear centre`);
  }
  // no other system holds a space, and every space has its other side
  for (const s of catalogue.structures.filter(x => x.system !== 'space')) if (s.space) problems.push(`${region}: ${s.name} carries a space`);
  for (const s of spaces) if (!spaces.some(o => o.side !== s.side && o.space.id === s.space.id)) problems.push(`${region}: ${s.name} has no ${s.side === 'left' ? 'right' : 'left'} counterpart`);
  // both levels hold the same space questions in every section and on both sides; each space is in exactly one guided lesson of its scope
  for (const section of def.sections) for (const side of [...sides, 'both']) {
    const settings = {section: section.id, side, systems: [], categories: ['space'], count: 9999};
    const one = questionPool(catalogue, settings), two = namingPool(catalogue, settings);
    if (one.length !== two.length) problems.push(`${region} / ${section.label} / ${side}: level 1 and level 3 hold different space questions`);
    const lessonIds = buildLessons(catalogue, settings).flatMap(l => l.ids);
    if (lessonIds.length !== two.length || new Set(lessonIds).size !== lessonIds.length || !two.every(x => lessonIds.includes(x.id))) problems.push(`${region} / ${section.label} / ${side}: the space lessons hold ${lessonIds.length} of ${two.length} questions`);
    for (const lesson of buildLessons(catalogue, settings)) if (lesson.category !== 'space') problems.push(`${region}: a ${lesson.category} lesson was listed for the space category`);
  }
  const whole = buildLessons(catalogue, {section: 'all', side: 'both', systems: [], categories: ['space'], count: 9999}).flatMap(l => l.ids);
  for (const s of spaces) if (whole.filter(id => id === s.id).length !== 1) problems.push(`${region}: ${s.name} is in ${whole.filter(id => id === s.id).length} lessons`);
}
assert.deepEqual(problems, [], 'space quiz problems:\n' + problems.join('\n'));

// the report: every special region of the layer panel is listed for both sides, asked ones are in their catalogue, every other one has a documented reason
const inCatalogue = r => catalogues[r.region]?.structures.some(s => s.system === 'space' && s.space.id === r.id && s.side === r.side);
for (const def of SPACES) for (const side of sides) assert.ok(report.some(r => r.id === def.id && r.side === side), `${def.en} (${side}) is neither asked nor listed with a reason`);
for (const r of report) {
  assert.ok(SPACES.some(d => d.id === r.id), `${r.en}: not a special region of the layer panel`);
  if (r.reason) {
    assert.ok(SPACE_EXCLUSION_REASONS[r.reason], `${r.en}: undocumented reason ${r.reason}`);
    assert.ok(!inCatalogue(r), `${r.en} (${r.side}): excluded (${r.reason}) but present in ${r.region}`);
    if (r.reason === 'not-limb') assert.equal(r.region, null);
  } else assert.ok(inCatalogue(r), `${r.en} (${r.side}): not excluded but missing from ${r.region}`);
}
// the two sides of a special region are asked together or not at all
for (const def of SPACES) assert.equal(new Set(report.filter(r => r.id === def.id).map(r => r.reason ?? 'asked')).size, 1, `${def.en}: the two sides have different reasons`);

// docs/quiz-spaces-pool.md
const regionLabel = {'upper-limb': '上肢', 'lower-limb': '下肢'};
const roleLabel = {boundary: '邊界', roof: '頂', floor: '底', content: '內容物'};
const left = report.filter(r => r.side === 'left');
const lines = ['# Quiz 特殊空間題庫範圍（特殊空間與孔）', '', '此檔由 `node scripts/test-quiz-spaces.mjs --write` 產生，請勿手改。規則與顯示方式見 `docs/quiz-spaces.md`。以「空間」計（左右各算一個構造，題數為兩倍）。', '',
  '## 各部位題數', '', '| 部位 | 可出題的空間 | 不出題的空間 |', '| --- | --- | --- |',
  ...Object.entries(regionLabel).map(([r, l]) => `| ${l} | ${left.filter(x => !x.reason && x.region === r).length} | ${left.filter(x => x.reason && x.region === r).length} |`),
  `| 背部、胸腔（尚未開放） | 0 | ${left.filter(x => x.region === null).length} |`, ''];
lines.push('## 可出題的空間', '');
for (const [r, l] of Object.entries(regionLabel)) {
  const asked = left.filter(x => !x.reason && x.region === r);
  lines.push(`### ${l}（${asked.length} 個空間，${counts[r]} 個構造）`, '');
  for (const x of asked) {
    lines.push(`#### ${x.zh}（${x.en}）`, '', `- 中心交會距離：${x.reach.toFixed(4)} 公尺`);
    for (const role of ['boundary', 'roof', 'floor', 'content']) {
      const names = [...new Set(x.members.filter(m => m.role === role).map(m => m.item))];
      if (names.length) lines.push(`- ${roleLabel[role]}（畫出）：${names.join('、')}`);
    }
    if (x.notDrawn.length) lines.push(`- 題庫沒有、因此不畫出：${x.notDrawn.join('、')}`);
    lines.push('');
  }
}
lines.push('## 不出題的空間', '');
for (const [reason, text] of Object.entries(SPACE_EXCLUSION_REASONS)) {
  const rows = left.filter(x => x.reason === reason);
  if (!rows.length) continue;
  lines.push(`### ${text}（${rows.length} 個空間）`, '');
  for (const x of rows) {
    const extra = reason === 'few-walls' || reason === 'no-contents' ? `；畫得出：${[...new Set(x.members.map(m => m.item))].join('、') || '無'}；題庫沒有：${x.notDrawn.join('、') || '無'}` : reason === 'unclear-centre' ? `；交會距離 ${x.reach?.toFixed(4)} 公尺` : '';
    lines.push(`- ${x.zh}（${x.en}）${x.region ? `，${regionLabel[x.region]}` : ''}${extra}`);
  }
  lines.push('');
}
const text = lines.join('\n');
if (process.argv.includes('--write')) {fs.writeFileSync('docs/quiz-spaces-pool.md', text); console.log('wrote docs/quiz-spaces-pool.md');}
else if (process.argv.includes('--check')) assert.equal(fs.existsSync('docs/quiz-spaces-pool.md') && fs.readFileSync('docs/quiz-spaces-pool.md', 'utf8'), text, 'docs/quiz-spaces-pool.md is stale: run node scripts/test-quiz-spaces.mjs --write');
console.log(`Quiz spaces passed: ${Object.entries(regionLabel).map(([r, l]) => `${l} ${counts[r]}`).join('、')} structures; ${left.filter(x => x.reason).length} special regions not asked, each with a documented reason.`);
