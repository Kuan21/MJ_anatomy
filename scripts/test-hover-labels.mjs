// The "Hover labels" switch: off by default, remembered in localStorage (a blocked storage never breaks it), mouse and pen only, and no code path outside the main atlas
// draws a name tip, so Quiz, pin practice and the mock exam can never show a name on hover. The real-mouse version is scripts/browser/hover-toggle.cjs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {quizModule} from './quiz-modules.mjs';
const {HOVER_LABELS_KEY, readHoverLabels, writeHoverLabels, hoverNameShown} = await quizModule('app/hover-labels.ts');
const store = () => {const m = new Map(); return {getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), m};};
const s = store();
assert.equal(readHoverLabels(s), false, 'default is off');
writeHoverLabels(true, s); assert.equal(s.m.get(HOVER_LABELS_KEY), '1'); assert.equal(readHoverLabels(s), true, 'the choice is remembered');
writeHoverLabels(false, s); assert.equal(readHoverLabels(s), false);
s.m.set(HOVER_LABELS_KEY, 'garbage'); assert.equal(readHoverLabels(s), false, 'an unknown stored value means off');
const blocked = {getItem() {throw new Error('SecurityError');}, setItem() {throw new Error('QuotaExceededError');}};
assert.equal(readHoverLabels(blocked), false, 'a blocked read falls back to off');
assert.doesNotThrow(() => writeHoverLabels(true, blocked), 'a blocked write is skipped');
assert.equal(readHoverLabels(null), false); assert.doesNotThrow(() => writeHoverLabels(true, null));
assert.equal(hoverNameShown(true, 'mouse'), true); assert.equal(hoverNameShown(true, 'pen'), true);
assert.equal(hoverNameShown(true, 'touch'), false, 'touch has no hover');
for (const t of ['mouse', 'pen', 'touch']) assert.equal(hoverNameShown(false, t), false, `switch off: no name tip for ${t}`);

// every name-tip code path: only the main atlas scene draws one, and it asks the switch
const walk = d => fs.readdirSync(d, {withFileTypes: true}).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const tipFiles = walk('app').filter(f => /\.(ts|tsx)$/.test(f) && /part-hover|setAttribute\('role', ?'tooltip'\)|hoverText/.test(fs.readFileSync(f, 'utf8')));
assert.deepEqual(tipFiles, ['app/scene.tsx'], 'only the atlas scene draws a hover name tip (not the Quiz, heart, brain or lung viewers)');
const scene = fs.readFileSync('app/scene.tsx', 'utf8');
assert.match(scene, /if\(!hoverNameShown\(hoverNamesRef\.current,e\.pointerType\)\)hoverText=''/, 'the scene asks the switch and the pointer type');
const page = fs.readFileSync('app/page.tsx', 'utf8');
assert.match(page, /useState\(readHoverLabels\)/); assert.match(page, /writeHoverLabels\(!v\)/);
assert.match(page, /className="hover-toggle" aria-pressed=\{hoverLabels\}/); assert.match(page, /主動跟隨 Hover labels/);
assert.match(page, /hoverNames=\{hoverLabels\}/);
for (const f of walk('app/quiz').filter(f => /\.(ts|tsx)$/.test(f))) assert.ok(!/hover-labels|hoverNames/.test(fs.readFileSync(f, 'utf8')), `${f}: the Quiz does not know the switch, it has no name tip`);
console.log('Hover labels: default off, remembered safely, mouse and pen only, one name-tip code path (the atlas scene), none in Quiz.');
