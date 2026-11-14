// The geniculate bodies are shown as 外側膝狀體 / 內側膝狀體 everywhere; the short forms 外膝狀體 / 內膝狀體 stay searchable as aliases
// (brain cards: aka; main atlas search: the alias table of app/mj-search.ts). Prints pass/fail only.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const cards = Object.values(JSON.parse(fs.readFileSync(new URL('../public/models/brain/neuro-cards.json', import.meta.url), 'utf8')).cards);
for (const [en, zh, alias] of [['Lateral geniculate body', '外側膝狀體', '外膝狀體'], ['Medial geniculate body', '內側膝狀體', '內膝狀體']]) {
  const card = cards.find(c => c.en === en);
  assert.ok(card, `${en}: brain card missing`);
  assert.equal(card.zh, zh, `${en}: card name`);
  assert.ok((card.aka ?? []).some(a => a.zh === alias), `${en}: alias missing on the card`);
}
const shown = cards.filter(c => /^[外內]膝狀體$/.test(c.zh));
assert.equal(shown.length, 0, 'a card is still titled with the short form');
const {chineseMatches} = await quizModule('app/mj-search.ts');
const {zhExtra} = await quizModule('app/mj-zh-extra.ts');
for (const [en, zh, alias] of [['lateral geniculate body', '外側膝狀體', '外膝狀體'], ['medial geniculate body', '內側膝狀體', '內膝狀體']]) {
  assert.equal(zhExtra(en)?.zh, zh, `${en}: atlas name`);
  assert.ok(chineseMatches('左' + zh, alias), `${alias} does not find ${zh}`);
  assert.ok(chineseMatches('左' + zh, zh), `${zh} does not find itself`);
}
console.log('Geniculate names OK: 外側／內側膝狀體 shown, short forms searchable.');
