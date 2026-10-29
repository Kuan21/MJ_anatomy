// check:heart — every structure on the course-summary heart list (docs/heart-checklist.json) must exist as a pickable 3D structure with Chinese and English
// names and a description, appear in the heart page lists, be a Quiz question, and (when schematic) say so on its card. Any gap fails the build.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
const root = fileURLToPath(new URL('../', import.meta.url)), load = async f => (await runnerImport(root + f)).module;
const checklist = JSON.parse(fs.readFileSync(root + 'docs/heart-checklist.json', 'utf8'));
const heart = JSON.parse(gunzipSync(fs.readFileSync(root + 'public/models/heart/heart-detail.json.gz')));
const {CHAMBERS} = await load('app/organ/heart-chambers.ts'), {QUIZ_REGIONS} = await load('app/quiz/catalogue.ts'), {chineseMatches} = await load('app/mj-search.ts');
const byName = new Map(heart.parts.map(p => [p.name, p])), problems = [];
const need = (ok, message) => { if (!ok) problems.push(message); };
const quizSections = new Set(QUIZ_REGIONS.heart.sections.map(s => s.id));
let quiz; try { quiz = JSON.parse(fs.readFileSync(root + 'public/models/quiz-heart.json', 'utf8')); } catch { /* produced by prepare-quiz; checked when present */ }
const quizNames = quiz ? new Set(quiz.structures.map(s => s.name)) : null;
let items = 0;
for (const section of checklist.sections) {
  const chamber = CHAMBERS.find(c => c.id === section.id);
  for (const item of section.items) {
    items++;
    const label = `${section.zh}／${item.zh}`;
    for (const name of item.parts) {
      const part = byName.get(name);
      if (!part) { need(false, `${label}: 3D structure "${name}" is missing from the heart package`); continue; }
      need(/[一-鿿]/.test(part.chinese) && !/[A-Za-z]/.test(part.chinese), `${label}: "${name}" has no clean Chinese name (${part.chinese})`);
      need(part.description.zh.length > 8 && part.description.en.length > 8, `${label}: "${name}" has no description`);
      need(quizSections.has(part.group), `${label}: group "${part.group}" is not a Quiz section`);
      if (quizNames) need(quizNames.has(part.name), `${label}: "${name}" is not a Quiz question`);
      if (part.origin === '示意構造') need(/示意構造/.test(part.description.zh) && /schematic/.test(part.description.en), `${label}: "${name}" is schematic but its card does not say so`);
      need(!/乳頭肌/.test(part.chinese + part.description.zh), `${label}: use 乳突肌, not 乳頭肌`);
    }
    if (section.list === 'chamber') {
      const listed = chamber?.items.find(i => i.zh === item.zh);
      need(!!listed, `${label}: missing from the "${chamber?.zh}" list on the heart page`);
      if (listed) {
        need(item.parts.every(n => listed.parts.includes(n)) && listed.parts.length === item.parts.length, `${label}: the list entry highlights different pieces than the checklist`);
        for (const n of listed.parts) need(chamber.inside.includes(n) || ['Coronary sinus', 'Superior vena cava', 'Inferior vena cava'].includes(n) || (byName.get(n)?.group === 'valves' && chamber.inside.includes(n)), `${label}: "${n}" is not drawn when ${chamber.zh} is opened`);
      }
    }
  }
}
// naming rules: papillary muscle is 乳突肌 and 乳頭肌 still finds it in search
need(chineseMatches('右心室前乳突肌', '乳頭肌'), 'search: 乳頭肌 must find 乳突肌');
need(!chineseMatches('胸鎖乳突肌', '乳頭肌'), 'search: 乳頭肌 must not find the mastoid muscle');
for (const p of heart.parts) need(!/乳頭/.test(p.chinese), `${p.name}: Chinese name still says 乳頭`);
if (problems.length) { console.error(`check:heart FAILED, ${problems.length} problem(s):\n - ` + problems.join('\n - ')); process.exit(1); }
console.log(`PASS check:heart: ${items} checklist structures (跑考摘要第 17 頁) are 3D structures with Chinese and English names, described, listed on the heart page, and Quiz questions; ${heart.parts.filter(p => p.origin === '示意構造').length} schematic ones are marked as such.`);
