// Redesigned special regions (the suboccipital triangle so far): the five roles are defined, every item resolves to a real mesh on both sides (or is listed as missing on purpose),
// the colours come from the system of each structure, and the dashed roof outline hull is correct.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';

const S = await quizModule('app/mj-spaces.ts'), R = await quizModule('app/space-roof-outline.ts'), T = await import('three');
const {atlas} = loadFullAtlas();
const nerveNames = new Set(); { const walk = o => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) k === 'name' && typeof v === 'string' ? nerveNames.add(v) : walk(v); };
  walk(JSON.parse(fs.readFileSync(new URL('../public/models/nerve-stream.json', import.meta.url), 'utf8'))); }
let checks = 0;
const solid = S.SPACES.filter(d => d.solid);
assert.ok(solid.some(d => d.id === 'suboccipital'), 'the suboccipital triangle is a redesigned region');
for (const def of solid) {
  const items = S.spaceRoleItems(def);
  for (const role of ['boundary', 'content']) { checks++; assert.ok(items[role].length > 0, `${def.id}: ${role} is defined`); }
  // a region with a roof or a floor says so; a foramen open at both ends (through) has neither; every region has at least one of roof, floor or `through`
  checks++; assert.ok(def.through ? items.roof.length === 0 && items.floor.length === 0 : items.roof.length + items.floor.length > 0, `${def.id}: roof/floor or through`);
  for (const side of ['left', 'right']) {
    const hit = S.resolveSpace(atlas.parts, def, side);
    for (const [role, list] of Object.entries(hit.roles)) for (const h of list) {
      checks++; const found = h.ids.length > 0 || h.nerves.some(n => nerveNames.has(n));
      assert.ok(found, `${def.id} ${side}: ${role} item "${h.item.en}" resolves to no mesh`);
    }
  }
}
// suboccipital: the composition of the course summary
{
  const d = S.SPACES.find(x => x.id === 'suboccipital'), roles = S.spaceRoleItems(d), names = r => roles[r].map(i => i.en);
  assert.deepEqual(names('boundary'), ['Rectus capitis posterior major', 'Obliquus capitis superior', 'Obliquus capitis inferior']);
  assert.deepEqual(roles.boundary.map(i => i.role), ['內上界', '外上界', '下界']);
  assert.deepEqual(names('roof'), ['Semispinalis capitis']); assert.deepEqual(names('floor'), ['Posterior arch of atlas']);
  assert.deepEqual(names('content'), ['Vertebral artery', 'Suboccipital nerve', 'Suboccipital venous plexus']); assert.deepEqual(names('related'), ['Greater occipital nerve']);
  assert.ok(d.missing.some(t => /寰枕後膜/.test(t)), 'the posterior atlanto-occipital membrane is reported as missing, not invented');
  assert.equal(S.spaceRoleText(roles.content[0], 'content'), '內容物（第三段）'); assert.equal(S.spaceRoleText(roles.roof[0], 'roof'), '頂');
  checks += 6;
}
// convex hull of the roof outline
{
  const hull = R.convexHull([{x: 0, y: 0}, {x: 2, y: 0}, {x: 2, y: 2}, {x: 0, y: 2}, {x: 1, y: 1}, {x: 1, y: .2}]);
  assert.equal(hull.length, 4); assert.ok(!hull.includes(4) && !hull.includes(5)); checks += 2;
  // points on a plane facing +z: only the vertices inside the sphere count
  const pts = [-.02, -.02, 0, .02, -.02, 0, .02, .02, 0, -.02, .02, 0, 0, 0, 0, .5, .5, 0];
  const corners = R.roofCorners(pts, new T.Vector3(0, 0, 0), .05, new T.Vector3(0, 0, 1));
  assert.equal(corners.length, 4, 'the far vertex is outside the sphere and the centre is inside the hull'); checks++;
}
console.log(`special regions (solid): ${checks} checks passed for ${solid.length} redesigned region(s)`);
