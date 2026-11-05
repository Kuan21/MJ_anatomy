import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {joinCarotids} = await quizModule('app/biomechanics-v2/carotid-junction.ts');
const {includeJoint} = await quizModule('app/biomechanics-v2/joint-filter.ts');
const tube = (name, cx, cz, radius, ys) => ({name, positions: ys.flatMap(y => [[1,0],[0,1],[-1,0],[0,-1]].flatMap(([x,z]) => [cx + radius*x,y,cz + radius*z]))});
for (const [side, suffix, sign] of [['Left','l',1],['Right','r',-1]]) {
  const vessels = [tube(`${side} common carotid artery`, sign*.03, 0, .004, [1.35,1.4]), tube(`Internal carotid artery.${suffix}`, sign*.033, .001, .003, [1.4,1.41,1.43,1.45]), tube(`External carotid artery.${suffix}`, sign*.031, .002, .0025, [1.4,1.41,1.43,1.45])];
  const before = structuredClone(vessels);
  joinCarotids(vessels);
  assert.deepEqual(vessels[0], before[0], 'parent geometry stays intact');
  for (let k=1;k<3;k++) {
    const p=vessels[k].positions, old=before[k].positions;
    for (let i=0;i<p.length;i+=12) {
      assert.ok(Math.abs((p[i]-p[i+6])-(old[i]-old[i+6])) < 1e-12, 'diameter must not shrink to conceal overlaps');
      assert.ok(Math.abs((p[i+5]-p[i+11])-(old[i+5]-old[i+11])) < 1e-12, 'depth diameter is preserved');
      for (let j=1;j<12;j+=3) assert.equal(p[i+j],old[i+j], 'no vertical distortion');
    }
    assert.ok(Math.abs((p[0]+p[6])/2-sign*.03)<1e-12, 'branch origin aligns to parent centre');
    assert.deepEqual(p.slice(-12),old.slice(-12),'distal geometry stays unchanged');
  }
}
assert.equal(includeJoint('cricopharyngeal ligament'), true, 'the sole source representation must not disappear');
console.log('Carotid origins: both sides retain diameters and distal geometry; ligament retained.');
