// The example in the typing box of the Quiz (app/quiz/name-example.ts) must be a structure the region really has. Reads the generated question data; prints counts only.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url).pathname;
const src = fs.readFileSync(root + 'app/quiz/name-example.ts', 'utf8');
const files = {'lower-limb': 'quiz-lower', 'upper-limb': 'quiz-upper', thorax: 'quiz-thorax', back: 'quiz-back', heart: 'quiz-heart', lung: 'quiz-lung', brain: 'quiz-brain', 'head-neck': 'quiz-head-neck', ear: 'quiz-ear', stomach: 'quiz-stomach'};
let n = 0;
for (const m of src.matchAll(/^\s*'?([a-z-]+)'?:\s*\['([^']+)',\s*'([^']+)'\]/gm)) {
  const [, region, en, zh] = m, file = root + `public/models/${files[region] ?? 'quiz-' + region}.json`;
  assert.ok(fs.existsSync(file), `${region}: question data exists`);
  const names = JSON.parse(fs.readFileSync(file, 'utf8')).structures.map(s => [s.name.toLowerCase(), s.chinese ?? '']);
  assert.ok(names.some(([e]) => e.includes(en.toLowerCase())), `${region}: "${en}" is a structure of the region`);
  assert.ok(names.some(([, c]) => c.includes(zh)), `${region}: "${zh}" is a structure of the region`);
  n++;
}
assert.ok(n >= 10, 'at least the ten regions have an example');
console.log(`quiz example names: ${n} regions`);
