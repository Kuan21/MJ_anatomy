import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {layoutLabelColumn} = await quizModule('app/organ/label-column.ts');
function check(labels, height) {
  const result = layoutLabelColumn(labels, height), byId = new Map(labels.map(a => [a.id, a]));
  let bottom = 6;
  for (const [id, pos] of result) {
    const h = byId.get(id).height;
    assert.ok(pos.top >= bottom + 4 - 1e-9, 'actual label boxes do not overlap');
    assert.ok(pos.top + h <= height - 10 + 1e-9, 'text stays inside the viewport');
    assert.equal(pos.centre, pos.top + h / 2, 'leader touches the actual centre of the measured box');
    bottom = pos.top + h;
  }
  return result;
}
assert.equal(check([{id:'a', anchor:80, height:70}, {id:'b', anchor:100, height:30}], 240).size, 2, 'wrapped bilingual names fit');
assert.equal(check([{id:'a', anchor:0, height:70}, {id:'b', anchor:200, height:30}], 200).size, 2, 'both viewport edges');
assert.deepEqual([...check([{id:'a', anchor:40, height:70}, {id:'selected', anchor:60, height:70, priority:1}], 100).keys()], ['selected']);
assert.equal(check([{id:'tall', anchor:20, height:100}], 50).size, 0, 'impossible fit is omitted, never clipped');
assert.equal(check([], 0).size, 0);
for (const height of [240, 480, 768, 1024]) for (let n = 1; n <= 24; n++) {
  check(Array.from({length:n}, (_, i) => ({id:String(i), anchor:(i * 89) % height, height:30 + (i * 13) % 55, priority:i === 7 ? 1 : 0})), height);
}
console.log('Heart label layout: OK (101 viewport and wrapping cases).');
