// The learning target highlight must stay clearly different from the default colour of every structure
// category (and from the answer feedback and neighbour colours), so the target can always be told apart.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = f => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const lab = hex => {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  const [x, y, z] = [(c[0] * .4124 + c[1] * .3576 + c[2] * .1805) / .95047, c[0] * .2126 + c[1] * .7152 + c[2] * .0722, (c[0] * .0193 + c[1] * .1192 + c[2] * .9505) / 1.08883].map(t => t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};
const delta = (a, b) => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]));
const viewer = read('app/quiz/viewer.ts');
const target = /target: \{fill: '(#[0-9A-Fa-f]{6})'/.exec(viewer)?.[1];
assert.ok(target, 'target highlight colour found');
const others = [...read('app/quiz/catalogue.ts').matchAll(/id: '(\w+)', label: '[^']*', english: '[^']*', color: '(#[0-9a-fA-F]{6})'/g)].map(m => [`system ${m[1]}`, m[2]]);
assert.ok(others.length >= 10, 'category colours found');
for (const m of viewer.matchAll(/(correct|wrong): \{fill: '(#[0-9A-Fa-f]{6})'/g)) others.push([`feedback ${m[1]}`, m[2]]);
for (const m of viewer.matchAll(/\{fill: '(#[0-9A-Fa-f]{6})', edge/g)) if (m[1].toLowerCase() !== target.toLowerCase()) others.push(['neighbour or feedback', m[1]]);
const MIN = 45;
for (const [name, colour] of others) assert.ok(delta(target, colour) >= MIN, `target ${target} too close to ${name} ${colour} (Lab distance ${delta(target, colour).toFixed(1)} < ${MIN})`);
console.log(`target highlight colour ${target} is at least ${MIN} Lab units from ${others.length} other colours`);
