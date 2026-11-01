// Region views (the region bar and its side buttons) must be framed whole: the camera is never closer than the distance that fits the camera set inside the free area
// (focusFrame, the same maths as the Focus button). A scale below 1 cut the top of the region off behind the region bar and made the model look pushed to the top.
// The browser version (every region, both sides, phone width) is scripts/browser/region-frame.cjs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';
const {regionZoom, REGION_BAR} = await quizModule('app/mj-region-bar.ts');
const keys = ['head', 'upper', 'chest', 'back', 'abdomen', 'pelvis', 'gluteal', 'lower'];
for (const key of keys) for (const sub of [undefined, 'wall', 'mediastinum', 'lung', 'organs', 'retro', 'perineum']) assert.ok(regionZoom(key, sub) >= 1, `regionZoom(${key}, ${sub}) must not be closer than the fit`);
assert.ok(Array.isArray(REGION_BAR) && REGION_BAR.length > 0);
const page = fs.readFileSync('app/page.tsx', 'utf8');
// region and side buttons of the region bar: scale 1 (motion lab and the lung name-label view keep their own deliberate scales)
const applyRegion = page.slice(page.indexOf('const applyRegion='), page.indexOf('const applyRegion=') + 3000);
assert.match(applyRegion, /cameraFocusScale:regionZoom\(key,sub\)/);
const side = page.slice(page.indexOf('const {keep}=sideSplit(topRegion,side);'), page.indexOf('const {keep}=sideSplit(topRegion,side);') + 400);
assert.match(side, /cameraFocusScale:1,/, 'head, upper-limb and lower-limb side buttons frame the region whole');
console.log('Region views are framed whole: regionZoom is never below 1 and the side buttons use scale 1.');
