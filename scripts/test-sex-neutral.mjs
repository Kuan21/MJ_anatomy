// The neutral view (no sex chosen, the page opens in it): nothing that belongs to one sex only is drawn (app/mj-sex.ts). Checks, on the runtime catalogue:
//   1. no reproductive organ, no structure built for one sex (the breast and the female pelvis copies), no vessel or nerve named for the penis or scrotum, no penile urethra, no skin (the atlas skin carries a penis);
//   2. the shared anatomy stays: bones (the male pelvis), muscles, vessels, nerves, the bladder and the ureters, so the neutral view is the male view without the sex-specific structures: every part drawn in the neutral view is also drawn in male mode;
//   3. the male and the female modes are what they were: the male organs and nothing female in male mode, the female organs and the female copies in female mode;
//   4. the breast structures exist and are hidden in the neutral and the male mode.
// Prints only pass / fail and counts.
//   node scripts/test-sex-neutral.mjs
import {quizModule} from './quiz-modules.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {displaySystem} from './lib/runtime-systems.mjs';

const S = await quizModule('app/mj-sex.ts');
const {atlas} = loadFullAtlas();
const parts = atlas.parts.map(p => p.stream ? p : {...p, system: displaySystem(p)});
const fails = []; let checks = 0; const ok = (c, m) => { checks++; if (!c) fails.push(m); };
const shown = sex => parts.filter(p => S.matchesSex(p, sex));
const neutral = shown(undefined), male = shown('male'), female = shown('female'), maleIds = new Set(male.map(p => p.id));
// 1
for (const p of neutral) {
  ok(p.system !== 'reproductive', `neutral view draws the reproductive part ${p.name}`);
  ok(!p.sex || (p.sex === 'male' && p.system === 'skeletal'), `neutral view draws ${p.name}, built for one sex (${p.sex})`);
  ok(!/\b(penis|penile|scrot|testic|spermatic|prostat|seminal|uter|ovari|vagin|clitor|vulva|labi)/i.test(p.name), `neutral view draws ${p.name}`);
  ok(!(p.system === 'integumentary' && (p.name === 'Skin' || p.name === 'Pubic hair')), `neutral view draws ${p.name}`);
  ok(!(p.system === 'urinary' && p.name === 'Urethra'), 'neutral view draws the penile urethra');
}
// 2
ok(neutral.every(p => maleIds.has(p.id)), `neutral view draws ${neutral.filter(p => !maleIds.has(p.id)).slice(0, 4).map(p => p.name).join(', ')} that male mode does not`);
for (const n of ['Left hip bone', 'Sacrum', 'Urinary bladder', 'Left ureter']) ok(neutral.some(p => p.name === n && !p.sex), `neutral view lacks ${n}`);
for (const sys of ['skeletal', 'muscular', 'arterial', 'venous', 'nervous']) ok(neutral.filter(p => p.system === sys).length > 50, `neutral view has too few ${sys} parts`);
ok(neutral.length > male.length * .9, `neutral view draws ${neutral.length} parts, male mode ${male.length}`);
// 3
ok(male.some(p => p.name === 'Prostate') && !male.some(p => /uterus|ovary|vagina/i.test(p.name)), 'male mode: the male organs and nothing female');
ok(female.some(p => /^Body of uterus$/i.test(p.name)) && !female.some(p => /^Prostate$|^Corpus cavernosum of penis$/.test(p.name)), 'female mode: the female organs and no male ones');
// 4
const breast = parts.filter(p => /^(?:Left|Right) (?:mammary gland|adipose tissue of breast|lactiferous ducts|lactiferous sinuses|areola|nipple|suspensory ligament of breast)$/.test(p.name));
ok(breast.length === 14, `${breast.length} breast structures (expected 14)`);
ok(breast.every(p => !S.matchesSex(p, undefined) && !S.matchesSex(p, 'male') && S.matchesSex(p, 'female')), 'the breast must be drawn in female mode only');
if (fails.length) { console.error(`FAIL sex neutral: ${fails.length} of ${checks} checks`); for (const f of [...new Set(fails)].slice(0, 12)) console.error('  ' + f); process.exit(1); }
console.log(`PASS sex neutral: ${checks} checks (neutral ${neutral.length}, male ${male.length}, female ${female.length} parts drawn; 14 breast structures in female mode only).`);
