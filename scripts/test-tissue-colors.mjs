// The white connective tissues share one set of colours, and none of them leans towards blue (blue means veins in this viewer).
// Aponeuroses (the epicranial aponeurosis, the tendinous origin of trapezius, the palmar and plantar aponeuroses, the pes anserinus) use one colour; tendons use a lighter colour of the same hue family.
// Output is pass/fail and counts only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {quizModule} from './quiz-modules.mjs';

const {APONEUROSIS_COLOR, TENDON_COLOR} = await quizModule('app/mj-tissue-colors.ts');
const {GALEA_COLOR} = await quizModule('app/mj-galea-shader.ts');
const scene = fs.readFileSync(new URL('../app/scene.tsx', import.meta.url), 'utf8');

/** hue (degrees), saturation and value of a #rrggbb colour (HSV) */
function hsv(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255), max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0; if (d) h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return {h: h * 60, s: max ? d / max : 0, v: max, r, g, b};
}
// 1. one colour for every aponeurosis (the sheets of the skull take it from the same constant), a lighter tendon colour of the same family
assert.equal(GALEA_COLOR, APONEUROSIS_COLOR, 'the epicranial aponeurosis and the nuchal origin use the aponeurosis colour');
for (const [name, hex] of [['aponeurosis', APONEUROSIS_COLOR], ['tendon', TENDON_COLOR]]) {
  assert.match(hex, /^#[0-9a-f]{6}$/i, `${name} colour is #rrggbb`);
  const c = hsv(hex);
  assert.ok(c.h >= 35 && c.h <= 65, `${name}: warm hue, nowhere near blue (hue ${c.h.toFixed(0)} deg)`);
  assert.ok(c.b <= c.r && c.b <= c.g, `${name}: the blue channel is the weakest`);
  assert.ok(c.s <= .15 && c.v >= .88, `${name}: light and nearly neutral (saturation ${c.s.toFixed(2)}, value ${c.v.toFixed(2)})`);
}
assert.ok(hsv(TENDON_COLOR).v >= hsv(APONEUROSIS_COLOR).v, 'tendons are at least as light as aponeuroses');
assert.ok(Math.abs(hsv(TENDON_COLOR).h - hsv(APONEUROSIS_COLOR).h) <= 10, 'tendons and aponeuroses are in the same hue family');
// 2. the scene takes the colours from the shared constants; no other colour is written for these tissues
assert.match(scene, /tm\.color\.set\(TENDON_COLOR\)/, 'the tendon material uses the shared colour');
assert.match(scene, /am\.color\.set\(APONEUROSIS_COLOR\);mats\.set\('connective:aponeurosis',am\)/, 'the aponeurosis material uses the shared colour');
assert.match(scene, /gm\.color\.set\(GALEA_COLOR\)/, 'the galea material uses the galea colour (the aponeurosis colour)');
assert.match(scene, /p\.kind==='aponeurosis'\?'connective:aponeurosis'/, 'parts of kind aponeurosis use the aponeurosis material');
assert.match(scene, /\/\^\(aponeurosis of epicranius\|nuchal origin of trapezius\)\$\/i\.test\(p\.name\)\?'connective:galea'/, 'both skull sheets use the galea material');
assert.ok(!/color\.set\('#[0-9a-f]{6}'\);gm\.roughness/i.test(scene), 'the galea colour is not a literal');
console.log('Tissue colours: aponeuroses share one light warm colour, tendons the same hue family, none towards blue.');
