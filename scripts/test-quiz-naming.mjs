// Typed-answer judging of the level-2 quiz (看結構寫名稱): case, spacing, hyphens, synonyms, left/right, close answers, languages.
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {judgeName, acceptedNames, normalize, distance, relationOf} = await quizModule('app/quiz/naming.ts');
const mitral = {name: 'Mitral valve', chinese: '二尖瓣', side: 'midline'}, leaflet = {name: 'Anterior leaflet of mitral valve', chinese: '二尖瓣前瓣', side: 'midline'}, tricuspid = {name: 'Tricuspid valve', chinese: '三尖瓣', side: 'midline'}, trap = {name: 'Septomarginal trabecula (moderator band)', chinese: '節制索', side: 'midline'};
const pec = {name: 'Abdominal part of right pectoralis major', chinese: '右胸大肌腹部', side: 'right'}, ratio = {name: 'Posterior interventricular branch', chinese: '後室間支', side: 'midline'}, atrium = {name: 'Left atrium', chinese: '左心房', side: 'midline'};
const any = {language: 'any', needSide: false}, en = {language: 'en', needSide: false}, zh = {language: 'zh', needSide: false};
const r = (t, s, o) => judgeName(t, s, o).result;
// the checklist example: Mitral valve = Bicuspid valve
assert.equal(r('Mitral valve', mitral, en), 'correct'); assert.equal(r('  bicuspid   VALVE ', mitral, en), 'correct'); assert.equal(r('mitral-valve', mitral, en), 'correct');
assert.equal(r('二尖瓣', mitral, zh), 'correct'); assert.equal(r('僧帽瓣', mitral, any), 'correct'); assert.equal(r('Mitral valve', mitral, zh), 'wrong', 'English is not accepted when the language is Chinese');
assert.equal(r('Left atrioventricular valve', mitral, en), 'correct');
assert.equal(r('僧帽瓣前瓣', leaflet, zh), 'correct'); assert.equal(r('二尖瓣前瓣', leaflet, zh), 'correct'); assert.equal(r('Anterior leaflet of left atrioventricular valve', leaflet, en), 'correct'); assert.equal(r('anterior leaflet of bicuspid valve', leaflet, en), 'correct');
assert.equal(r('Right atrioventricular valve', tricuspid, en), 'correct'); assert.equal(r('三尖瓣', tricuspid, zh), 'correct'); assert.equal(r('右房室瓣', tricuspid, zh), 'correct');
// brackets give two more accepted names
assert.equal(r('moderator band', trap, en), 'correct'); assert.equal(r('septomarginal trabecula', trap, en), 'correct');
// left/right: ignored unless the setting asks for it; a muscle part keeps its side word where the name has it
assert.equal(r('abdominal part of pectoralis major', pec, en), 'correct'); assert.equal(r('Abdominal part of left pectoralis major', pec, en), 'correct');
assert.equal(r('abdominal part of pectoralis major', pec, {...en, needSide: true}), 'wrong'); assert.equal(r('abdominal part of right pectoralis major', pec, {...en, needSide: true}), 'correct');
assert.equal(r('胸大肌腹部', pec, zh), 'correct'); assert.equal(r('胸大肌腹部', pec, {...zh, needSide: true}), 'wrong'); assert.equal(r('右胸大肌腹部', pec, {...zh, needSide: true}), 'correct');
// close: one slip in a short name, two in a long one; Chinese: one character in a name of four or more
assert.equal(r('mitral valv', mitral, en), 'close');
assert.equal(r('mitrel valve', mitral, en), 'close'); assert.equal(r('posterior interventricular brnch', ratio, en), 'close'); assert.equal(r('posterior interventricuar brnch', ratio, en), 'close');
assert.equal(r('posterior interventricular', ratio, en), 'wrong'); assert.equal(r('節制素', trap, zh), 'wrong', 'a three character name has no room for a slip');
assert.equal(r('後室間枝', ratio, zh), 'close');
assert.equal(r('atrium', atrium, en), 'wrong', 'left atrium is not just atrium'); assert.equal(r('left atrium', atrium, en), 'correct'); assert.equal(r('右心房', atrium, zh), 'wrong');
assert.equal(r('', mitral, any), 'wrong'); assert.equal(r('???', mitral, any), 'wrong');
const names = acceptedNames(pec); assert.ok(names.en.includes('Abdominal part of right pectoralis major') && names.zh.includes('右胸大肌腹部'));
assert.equal(distance('kitten', 'sitting'), 3); assert.equal(normalize('Left  Atrio-ventricular, valve', false), 'atrioventricularvalve');
// part and whole: naming the whole for a part (or a part for the whole) is close, never correct
{
  const valve = {name: 'Pulmonary valve', chinese: '肺動脈瓣'}, cusp = {name: 'Anterior semilunar cusp of pulmonary valve', chinese: '肺動脈瓣前瓣'};
  assert.equal(relationOf(cusp, valve), 'part'); assert.equal(relationOf(valve, cusp), 'whole'); assert.equal(relationOf(valve, valve), null);
  assert.equal(judgeName('pulmonary valve', cusp, en, [valve]).result, 'close'); assert.equal(judgeName('pulmonary valve', cusp, en, [valve]).relation, 'typed-whole');
  assert.equal(judgeName('anterior semilunar cusp of pulmonary valve', valve, en, [cusp]).relation, 'typed-part');
  assert.equal(judgeName('pulmonary valve', cusp, en, []).result, 'wrong', 'without the related structure it stays wrong');
  assert.equal(judgeName('anterior semilunar cusp of pulmonary valve', cusp, en, [valve]).result, 'correct');
}
console.log('Quiz naming passed: case, spacing, hyphens, synonyms, brackets, left/right, close answers, part and whole, and answer languages.');
