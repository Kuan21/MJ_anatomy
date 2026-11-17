// The ear detail mode has no section (cut) and no peel-layer panel (user decision 2026-11-17, ear only); the shared template and the other organs keep them.
import assert from 'node:assert/strict';
import fs from 'node:fs';

const ear = fs.readFileSync('app/ear-detail.tsx', 'utf8'), viewer = fs.readFileSync('app/mj-ear-viewer.ts', 'utf8');
for (const [name, text] of [['ear-detail.tsx', ear], ['mj-ear-viewer.ts', viewer]]) {
  assert.ok(!/clippingPlane|localClippingEnabled|\bpeel\b|onPeel|EAR_CUT|EAR_SECTION|EarSection|sectionOffsets/.test(text), `${name}: no cut or peel code`);
}
assert.ok(!/\bsection=\{|\blayers=\{/.test(ear), 'ear page passes neither section nor layers to OrganPanel');
// the template still offers both blocks to the organs that use them
const layout = fs.readFileSync('app/organ/organ-detail-layout.tsx', 'utf8');
assert.match(layout, /OrganSectionBlock/); assert.match(layout, /OrganLayersBlock/);
const brainUses = ['app/organ/brain.tsx', 'app/organ/eye.tsx'].filter(f => fs.existsSync(f) && /section=\{/.test(fs.readFileSync(f, 'utf8')));
assert.ok(brainUses.length >= 1, 'the brain or eye page still has the section panel');
console.log('ear no-cuts: ok');
