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

// ---- leader lines: no crossings, distinct anchors, hidden structures get no line (label-leaders.ts, heart-label-anchors.ts) ----
const T = await import('three');
const {chooseAnchors, layoutLeaders, leaderProblems, segmentsCross} = await quizModule('app/organ/label-leaders.ts');
const {visibleSurfacePoints} = await quizModule('app/organ/heart-label-anchors.ts');
assert.ok(segmentsCross({x:0,y:0}, {x:10,y:10}, {x:0,y:10}, {x:10,y:0}), 'X shape crosses');
assert.ok(!segmentsCross({x:0,y:0}, {x:10,y:0}, {x:0,y:5}, {x:10,y:5}), 'parallel lines do not cross');
// the case that a plain sort by anchor height gets wrong: both anchors are lower than the labels, one far to the side
const viewport = {width: 1000, height: 600, centreX: 500};
{
  const c = [
    {id: 'near', points: [{x: 380, y: 200}], width: 90, height: 34},
    {id: 'far', points: [{x: 120, y: 150}], width: 90, height: 34},
  ];
  const anchors = new Map(c.map(x => [x.id, x.points[0]]));
  const {leaders, hidden} = layoutLeaders(c, anchors, viewport);
  assert.equal(hidden.length, 0); assert.deepEqual(leaderProblems(leaders), [], 'two leaders from one column do not cross');
}
// several structures lying on the same spot of the wall: each keeps its own anchor at least 28 px from the others, or is dropped
{
  const spot = [{x: 400, y: 300}, {x: 404, y: 302}, {x: 410, y: 298}, {x: 430, y: 330}, {x: 470, y: 340}, {x: 380, y: 260}, {x: 500, y: 300}];
  const c = ['fossa', 'septum', 'pectinate'].map(id => ({id, points: spot, width: 90, height: 34}));
  const anchors = chooseAnchors(c);
  const list = [...anchors.values()];
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) assert.ok(Math.hypot(list[i].x - list[j].x, list[i].y - list[j].y) >= 28, 'anchors are apart');
  assert.equal(anchors.size, 3, 'three free points exist, so all three are labelled');
  const {leaders} = layoutLeaders(c, anchors, viewport);
  assert.deepEqual(leaderProblems(leaders), []);
  // only one usable point for three structures: one is labelled, the others are left out instead of sharing the point
  const few = chooseAnchors(c.map(x => ({...x, points: spot.slice(0, 2)})));
  assert.equal(few.size, 1, 'a point is never shared');
}
// random scenes: crossings, shared anchors and overlapping boxes never occur
{
  let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  let total = 0;
  for (let round = 0; round < 300; round++) {
    const n = 2 + Math.floor(rnd() * 14);
    const c = Array.from({length: n}, (_, i) => ({id: 'l' + i, points: Array.from({length: 1 + Math.floor(rnd() * 6)}, () => ({x: 250 + rnd() * 500, y: 60 + rnd() * 480})), width: 70 + rnd() * 60, height: 30 + rnd() * 30, priority: rnd() < .1 ? 1 : 0}));
    const anchors = chooseAnchors(c), {leaders, hidden} = layoutLeaders(c, anchors, viewport);
    assert.deepEqual(leaderProblems(leaders), [], `round ${round}`);
    assert.equal(leaders.length + hidden.length, n, 'every label is either drawn or named as hidden');
    total += leaders.length;
  }
  assert.ok(total > 300, 'scenes still get labels');
}
// a label in a column is nearest-height first: with no crossing possible, the order follows the anchors' heights
{
  const c = [30, 140, 250, 360].map((y, i) => ({id: 'a' + i, points: [{x: 300 + i * 5, y}], width: 90, height: 34}));
  const {leaders} = layoutLeaders(c, new Map(c.map(x => [x.id, x.points[0]])), viewport);
  const tops = leaders.filter(l => l.side === 'l').sort((a, b) => a.top - b.top).map(l => l.id);
  assert.deepEqual(tops, ['a0', 'a1', 'a2', 'a3'], 'labels are stacked in the order of their heights');
}
// visibility: a structure behind an opaque wall gets no point, so no leader; once the wall is cut away it does
{
  const camera = new T.PerspectiveCamera(32, 1, .002, 20); camera.position.set(0, 0, 1); camera.lookAt(0, 0, 0); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
  const mk = (z, size) => {const m = new T.Mesh(new T.BoxGeometry(size, size, .01, 3, 3, 1), new T.MeshBasicMaterial({side: T.DoubleSide})); m.position.z = z; m.updateMatrixWorld(); return m;};
  const wall = mk(.2, .2), inner = mk(0, .05), side = mk(0, .05); side.position.x = .2; side.updateMatrixWorld();
  const base = {camera, width: 800, height: 800, occluders: [wall, inner, side], cutAway: () => false};
  assert.equal(visibleSurfacePoints([inner], base).length, 0, 'behind the wall: no point, no leader');
  assert.ok(visibleSurfacePoints([wall], base).length > 0, 'the wall itself is visible');
  assert.ok(visibleSurfacePoints([side], base).length > 0, 'beside the wall: visible');
  const cut = {...base, cutAway: (mesh) => mesh === wall};
  const seen = visibleSurfacePoints([inner], cut);
  assert.ok(seen.length > 0, 'wall cut away: the inner structure is seen');
  for (const p of seen) assert.ok(p.screen.x > 0 && p.screen.x < 800, 'screen point is inside the view');
}
console.log('Heart label leaders: OK (no crossings, distinct anchors, hidden structures get no line).');
