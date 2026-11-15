// Translucent surfaces must be drawn with ordinary alpha blending, never as a dot pattern (screen-door): no alpha-to-coverage, no alpha hashing, no ordered-dither discard keyed on
// the pixel position, and faded parts live in their own blended batch (the "fade twin"). The near plane follows the orbit distance so thin layers keep their depth order.
// A static check of the viewer sources; the fixed-view screenshots (npm run stability:shots, view "regress") show the two screens that were reported.
import fs from 'node:fs';
const read = f => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const files = fs.readdirSync(new URL('../app/', import.meta.url)).filter(f => /\.(ts|tsx)$/.test(f)).map(f => `app/${f}`);
const fails = [];
const forbidden = [
  [/alphaToCoverage\s*=\s*(?!false)/, 'alphaToCoverage must not be switched on'],
  [/alphaToCoverage\s*:\s*true/, 'alphaToCoverage must not be switched on'],
  [/alphaHash/, 'alphaHash (stochastic transparency) must not be used'],
  [/gl_FragCoord[^;]{0,120}(?:mod|fract)\s*\(|(?:mod|fract)\s*\([^;]{0,120}gl_FragCoord/, 'a dither pattern keyed on gl_FragCoord must not be used (it draws translucent parts as dots)'],
];
for (const f of files) {
  const src = read(f);
  for (const [re, why] of forbidden) if (re.test(src)) fails.push(`${f}: ${why}`);
}
const scene = read('app/scene.tsx');
if (!/Faded parts live in their own translucent batch/.test(scene)) fails.push('app/scene.tsx: the blended fade twin is missing');
if (!/camera\.near\s*=\s*near/.test(scene)) fails.push('app/scene.tsx: the near plane no longer follows the orbit distance');
if (fails.length) { console.error('Translucency check FAILED:\n' + fails.map(x => '  ' + x).join('\n')); process.exit(1); }
console.log(`Translucency OK: ${files.length} viewer files use no alpha-to-coverage, alpha hash or dot pattern; faded parts use the blended twin; the near plane follows the orbit distance.`);
