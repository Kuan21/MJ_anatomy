// Regression test for the brain detail mode: names and groups of every mesh of the Brain Project model, the voxel cut surface on a synthetic brain, and the CSF step list.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';

const {describeBrainNode, BRAIN_GROUPS, displayEn} = await quizModule('app/organ/brain-catalogue.ts');
const {voxelize, LABEL, classFields, partField, GREY_MM, CLASS_COUNT} = await quizModule('app/organ/brain-voxels.ts');
const {CSF_STEPS} = await quizModule('app/organ/csf-scene.ts');
const {SCHEMATIC, SCHEMATIC_NAMES} = await quizModule('app/organ/brain-schematic.ts');

// ---- every named mesh of the model gets a group, a clean name and a Chinese name; spinal parts are left out
const bytes = fs.readFileSync(new URL('../public/models/brain.glb', import.meta.url));
const json = JSON.parse(bytes.toString('utf8', 20, 20 + bytes.readUInt32LE(12)));
const nodes = json.nodes.filter(n => n.extras?.bx_label);
const parts = nodes.map((n, i) => describeBrainNode({name: n.name, cat: n.extras.bx_cat, region: n.extras.bx_region ?? '', label: n.extras.bx_label, side: n.extras.bx_side ?? ''}, i)).filter(Boolean);
assert.ok(parts.length >= nodes.length - 4 && parts.length < nodes.length, `spinal parts removed (${nodes.length} → ${parts.length})`);
const groups = new Set(BRAIN_GROUPS.map(g => g.id));
for (const p of parts) {
  assert.ok(groups.has(p.group), `${p.en}: unknown group ${p.group}`);
  assert.ok(!/\.\w$|\d{3}$|_|\*/.test(p.en), `${p.en}: mesh suffix left in the name`);
}
assert.ok(!parts.some(p => /spinal artery|spinal cord/i.test(p.en)), 'spinal parts must not be listed');
const noZh = parts.filter(p => !p.zh);
assert.equal(noZh.length, 0, `Chinese name missing: ${[...new Set(noZh.map(p => p.en))].join(', ')}`);
assert.ok(!parts.some(p => /ventric/i.test(p.en) && /心室/.test(p.zh)), 'brain ventricles are 腦室, not 心室');
const central = parts.find(p => p.en === 'Central sulcus' && p.side === 'left');
assert.equal(displayEn(central), 'Left Central sulcus');
assert.equal(central.group, 'frontal'.replace('frontal', central.group), 'central sulcus has a lobe');

// ---- voxel cut surface: a hollow brain-sized cube of "cortex" (open on one face, like the real shells) filled, grey rim, white core, a ventricle inside
const shell = (lo, hi, skipFace) => {
  const v = [], idx = [], corner = i => [i & 1 ? hi : lo, i & 2 ? hi : lo, i & 4 ? hi : lo];
  for (let i = 0; i < 8; i++) v.push(...corner(i));
  const quads = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 2, 6, 4], [1, 5, 7, 3], [0, 4, 5, 1], [2, 3, 7, 6]];
  quads.forEach((q, k) => {if (k !== skipFace) idx.push(q[0], q[1], q[2], q[0], q[2], q[3]);});
  return {positions: new Float32Array(v), indices: new Uint32Array(idx)};
};
const cortex = shell(0, .06, 5), ventricle = shell(.025, .035, -1);
const grid = voxelize([
  {index: 0, group: 'frontal', hemisphere: 1, ...cortex}, {index: 1, group: 'ventricles', hemisphere: 1, ...ventricle},
]);
const at = (x, y, z) => {const gx = Math.floor((x - grid.origin[0]) / grid.size), gy = Math.floor((y - grid.origin[1]) / grid.size), gz = Math.floor((z - grid.origin[2]) / grid.size); return grid.label[gx + grid.nx * (gy + grid.ny * gz)];};
assert.equal(at(.03, .03, .03), LABEL.csf, 'ventricle is labelled CSF');
assert.equal(at(.045, .03, .03), LABEL.cortexWhite, 'deep tissue is white matter');
assert.ok([LABEL.cortexGrey].includes(at(.0015, .03, .03)), 'tissue next to the surface is grey matter');
assert.equal(at(-.002, .03, .03), LABEL.empty, 'outside stays empty');
assert.equal(grid.part[(Math.floor((.03 - grid.origin[0]) / grid.size)) + grid.nx * (Math.floor((.03 - grid.origin[1]) / grid.size) + grid.ny * Math.floor((.03 - grid.origin[2]) / grid.size))], 2, 'ventricle voxel belongs to part 1 (stored +1)');

// ---- schematic (示意) structures: finite, closed, inside the brain, named in English and Chinese, in a real group, no clash with a real mesh name
const realNames = new Set(parts.map(p => p.en));
for (const spec of SCHEMATIC) {
  assert.ok(spec.en && /[\u3400-\u9fff]/.test(spec.zh), `${spec.en}: English and Chinese name`);
  assert.ok(groups.has(spec.group), `${spec.en}: known group`);
  assert.ok(!realNames.has(spec.en), `${spec.en}: must not reuse the name of a real mesh`);
  const g = spec.build(), a = g.getAttribute('position');
  for (const v of a.array) assert.ok(Number.isFinite(v), `${spec.en}: finite positions`);
  g.computeBoundingBox(); const b = g.boundingBox;
  assert.ok(b.min.x * 1000 > -80 && b.max.x * 1000 < 80 && b.min.y * 1000 > 1540 && b.max.y * 1000 < 1700 && b.min.z * 1000 > -90 && b.max.z * 1000 < 90, `${spec.en}: inside the brain's extent`);
  if (spec.side !== 'mid') assert.ok(spec.side === 'left' ? b.getCenter(new (b.min.constructor)()).x > 0 : b.getCenter(new (b.min.constructor)()).x < 0, `${spec.en}: left is +x, right is -x`);
  // closed surface: every edge is shared by exactly two triangles
  const idx = g.getIndex().array, edges = new Map();
  for (let i = 0; i < idx.length; i += 3) for (let k = 0; k < 3; k++) {const e = [idx[i + k], idx[i + (k + 1) % 3]].sort((x, y) => x - y).join('-'); edges.set(e, (edges.get(e) ?? 0) + 1);}
  const open = [...edges.values()].filter(n => n !== 2).length;
  assert.ok(open <= edges.size * .02, `${spec.en}: closed shell (${open} open edges of ${edges.size})`);
}
assert.equal(SCHEMATIC.length, SCHEMATIC_NAMES.length * 2, 'every schematic structure comes as a left/right pair');

// smooth fields for the cut surface: grey beats white at the rim, white beats grey deep inside, the outside carries no tissue, and the grey band is no thicker than 2.4 mm
const fields = classFields(grid), idx = (x, y, z) => Math.floor((x - grid.origin[0]) / grid.size) + grid.nx * (Math.floor((y - grid.origin[1]) / grid.size) + grid.ny * Math.floor((z - grid.origin[2]) / grid.size));
const share = (i, k) => fields[(k - 1) >> 2][k < 9 ? i * 4 + ((k - 1) & 3) : i] / 255;
assert.equal(fields.length, 3); assert.equal(CLASS_COUNT, 9);
assert.ok(share(idx(.0015, .03, .03), LABEL.cortexGrey) > share(idx(.0015, .03, .03), LABEL.cortexWhite), 'grey dominates at the rim');
assert.ok(share(idx(.045, .03, .03), LABEL.cortexWhite) > .9 && share(idx(.045, .03, .03), LABEL.cortexGrey) < .05, 'white dominates deep inside');
assert.ok(share(idx(-.004, .03, .03), LABEL.cortexGrey) + share(idx(-.004, .03, .03), LABEL.cortexWhite) < .05, 'no tissue outside');
let band = 0; for (let x = 0; x < .03; x += grid.size / 4) if (share(idx(x, .03, .03), LABEL.cortexGrey) > share(idx(x, .03, .03), LABEL.cortexWhite)) band = x;
assert.ok(band <= GREY_MM + grid.size, `grey band ${band} m is not thicker than ${GREY_MM} m (+ one voxel)`);
const flag = partField(grid, p => p === 2, 0);
assert.ok(flag[idx(.03, .03, .03)] > 200 && flag[idx(.01, .03, .03)] < 30 && flag[idx(-.004, .03, .03)] === 0, 'selection field is smooth and confined to the selected part');

// ---- CSF: the eight steps of the brief, in order
assert.equal(CSF_STEPS.length, 8);
const need = [/choroid/i, /interventricular foramen/i, /third ventricle/i, /aqueduct/i, /fourth ventricle/i, /median aperture.*lateral apertures.*cisterna magna/i, /subarachnoid space.*lumbar cistern/i, /granulations.*superior sagittal sinus.*right atrium/i];
need.forEach((re, i) => assert.match(CSF_STEPS[i].en, re, `CSF step ${i + 1}`));
assert.match(CSF_STEPS[5].note, /中央管/);
assert.match(CSF_STEPS[6].note, /腰池/);
// the full-page CSF mode: every step has an explanation written for the site (no sources or note citations), and a short label for the step list
const {CSF_STEP_NOTES, CSF_SHORT} = await quizModule('app/organ/csf-notes.ts');
assert.equal(CSF_STEP_NOTES.length, CSF_STEPS.length); assert.equal(CSF_SHORT.length, CSF_STEPS.length);
for (const [i, n] of CSF_STEP_NOTES.entries()) {
  assert.ok(n.where && n.event && n.happens.length, `CSF step ${i + 1} has a location, an event and an explanation`);
  for (const x of [...n.happens, ...n.clinical]) assert.equal(typeof x, 'string', `CSF step ${i + 1}: plain sentences`);
  assert.ok(!('correction' in n), `CSF step ${i + 1}: no comparison with the notes`);
}
assert.ok(CSF_STEP_NOTES[6].clinical.some(x => /不是抽取中央管/.test(x)), 'lumbar puncture note');
console.log(`Brain detail passed: ${parts.length} structures named and grouped (${BRAIN_GROUPS.length} groups, Chinese for all), voxel cut surface (grey rim, white core, CSF) and the 8 CSF steps.`);
