// Which structures the body-region tabs (app/mj-region-bar.ts) show. Checks, on the same runtime catalogue the viewer builds:
//   1. no tab of the trunk holds a structure of the limbs or one that lies outside the height range of that tab (a calf tendon arch floated under the pelvis, a vein of the abdominal wall sat in the chest);
//   2. 骨盆與會陰: the perineum tab shows the vulva and the perineal structures and not the pelvic organs (female: no cervix, uterus, tubes, ovaries, ligaments; male: penis, testis and scrotum stay),
//      the vagina and the female urethra stay in the perineum tab because they pass through the perineal membrane and open into the vestibule (the user keeps them there),
//      the pelvic organs tab shows the ovaries and the pelvic-floor muscles, and both tabs switch the muscle layer on by default (the layer switch in the left panel still hides it);
//   3. the external pudendal arteries are short vessels from the femoral artery to the skin of the genitals (not stretched down to the ischial tuberosity);
//   4. negative runs: the checks have to fail for a calf structure listed in the pelvic wall, for a uterus listed in the perineum and for a vessel of the old length.
// Prints only pass / fail and counts.
//   node scripts/test-region-membership.mjs
import {quizModule} from './quiz-modules.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {displaySystem} from './lib/runtime-systems.mjs';

const B = await quizModule('app/mj-region-bar.ts'), R = await quizModule('app/mj-part-regions.ts'), S = await quizModule('app/mj-sex.ts');
const {atlas} = loadFullAtlas(); const parts = atlas.parts.map(p => p.stream ? p : {...p, system: displaySystem(p)});
const index = B.buildRegionIndex(parts), byId = new Map(parts.map(p => [p.id, p]));
const fails = []; let checks = 0; const ok = (c, m) => { checks++; if (!c) fails.push(m); };
const cy = p => (p.bounds[0][1] + p.bounds[1][1]) / 2;

// ---- 1. height band (metres, centre of the mesh) of each trunk tab; the margin lets long structures (a vessel that runs from one tab into the next) lie a little over
const BAND = {'pelvis/organs': [.72, 1.08], 'pelvis/wall': [.72, 1.10], 'pelvis/perineum': [.72, 1.00], 'abdomen/organs': [.88, 1.40], 'abdomen/wall': [.85, 1.40], 'abdomen/retro': [.85, 1.40], 'chest/mediastinum': [1.05, 1.62], 'chest/wall': [1.05, 1.62], 'chest/lung': [1.05, 1.62], gluteal: [.70, 1.10], back: [.70, 1.62]};
const MARGIN = .04, LIMB = new Set(['arm', 'forearm', 'hand', 'thigh', 'leg', 'foot']);
const stray = (tag, key, sub, list) => { const out = []; for (const p of list) { if (!p || p.system === 'integumentary') continue; const band = BAND[tag], y = cy(p), sr = R.anatomicalSubregion(p);
  if (y < band[0] - MARGIN || y > band[1] + MARGIN || (LIMB.has(sr) && !(key === 'gluteal' && sr === 'thigh'))) out.push(`${p.name} (${p.id}, y ${(y * 100).toFixed(0)} cm, ${sr})`); } return out; };
const membersOf = (key, sub) => { const m = B.regionMembers(index, parts, key, sub, 'both'); return [...new Set([...m.focus, ...m.other, ...m.faded])].map(id => byId.get(id)); };
for (const [key, subs] of [['pelvis', ['organs', 'wall', 'perineum']], ['abdomen', ['organs', 'wall', 'retro']], ['chest', ['mediastinum', 'wall', 'lung']], ['gluteal', [undefined]], ['back', [undefined]]]) for (const sub of subs) {
  const tag = sub ? `${key}/${sub}` : key, bad = stray(tag, key, sub, membersOf(key, sub));
  ok(bad.length === 0, `${tag}: ${bad.length} structure(s) do not belong to this tab: ${bad.slice(0, 6).join('; ')}`);
}

// ---- 2. the pelvis and perineum tabs
const named = (key, sub, sex) => { const m = B.regionMembers(index, parts, key, sub, 'both'); return m.focus.map(id => byId.get(id)).filter(p => p && S.matchesSex(p, sex)); };
const has = (list, re) => list.some(p => re.test(p.name));
const PELVIC = /uter|ovar|fallopian|salping|cardinal|round ligament|broad ligament|mesosalpinx|mesovarium|cervic/i;
for (const sex of ['female', 'male']) {
  const per = named('pelvis', 'perineum', sex), org = named('pelvis', 'organs', sex);
  ok(has(per, /superficial perineal muscle/i) && has(per, /external anal sphincter/i), `${sex}: the perineum tab lacks the perineal muscles that exist (superficial perineal muscle, external anal sphincter)`);
  ok(has(org, /levator ani|puborectalis|pubococcygeus|iliococcygeus/i) && has(org, /coccygeus/i), `${sex}: the pelvic organs tab lacks the pelvic-floor muscles`);
  for (const sub of ['organs', 'perineum']) ok(B.regionVisible('pelvis', sub).includes('muscular'), `${sex}: the ${sub} tab does not switch the muscle layer on`);
}
const perF = named('pelvis', 'perineum', 'female'), orgF = named('pelvis', 'organs', 'female'), perM = named('pelvis', 'perineum', 'male');
for (const nm of ['Glans of clitoris', 'Body of clitoris', 'Left crus of clitoris', 'Right crus of clitoris', 'Left bulb of vestibule', 'Right bulb of vestibule', 'Left greater vestibular gland', 'Right greater vestibular gland']) ok(perF.some(p => p.name === nm), `female perineum: ${nm} is missing`);
ok(perF.every(p => !PELVIC.test(p.name)), `female perineum holds pelvic organs: ${perF.filter(p => PELVIC.test(p.name)).map(p => p.name).join(', ')}`);
for (const nm of ['Left ovary', 'Right ovary']) { const p = orgF.find(q => q.name === nm); ok(!!p, `female pelvic organs: ${nm} is missing`); if (p) ok(p.vertexCount > 0 && p.indexCount > 0 && B.regionMembers(index, parts, 'pelvis', 'organs', 'both').camera.length > 0, `female pelvic organs: ${nm} has no drawable mesh`); }
ok(perF.every(p => !/ovar/i.test(p.name)), 'female perineum shows an ovary');
for (const nm of ['Vagina', 'Female urethra']) ok(perF.some(p => p.name === nm), `female perineum: ${nm} is missing (it passes through the perineal membrane and opens into the vestibule)`);
ok(orgF.some(p => p.name === 'Vagina') && orgF.some(p => p.name === 'Cervicovaginal junction'), 'female pelvic organs: vagina or cervicovaginal junction is missing');
ok(has(perM, /penis|corpus (?:cavernosum|spongiosum)|glans/i) && has(perM, /testis/i) && has(perM, /scrotum|epididymis/i), 'male perineum lost the penis, testis or scrotum');

// ---- 3. the external pudendal arteries
const diag = p => Math.hypot(...[0, 1, 2].map(k => p.bounds[1][k] - p.bounds[0][k]));
const LIMIT = .075;   // metres: from the femoral artery just below the inguinal ligament medially to the skin below the pubic tubercle (the old ones, down to the ischial tuberosity, were 11 cm)
let n = 0; for (const side of ['Left', 'Right']) for (const nm of ['superficial external pudendal artery', 'deep external pudendal artery']) { const p = parts.find(q => q.name === `${side} ${nm}` && q.system === 'arterial' && !/-END$/.test(q.id)); ok(!!p, `${side} ${nm} is missing`); if (p) { n++; const x0 = p.bounds[0][0], x1 = p.bounds[1][0], medial = side === 'Left' ? x0 : -x1; ok(medial > .004, `${side} ${nm} reaches ${(medial * 100).toFixed(1)} cm from the midline on the wrong side (it must end on its own side, at the pubic tubercle)`); ok(diag(p) < LIMIT, `${side} ${nm} is ${(diag(p) * 100).toFixed(1)} cm long, over the ${LIMIT * 100} cm limit`); } }

// ---- 4. negative runs
const soleus = {id: 'x', name: 'Right tendinous arch of soleus', system: 'connective', bounds: [[-.1, .38, -.1], [-.05, .42, -.05]]};
ok(stray('pelvis/wall', 'pelvis', 'wall', [soleus]).length === 1, 'negative run: a calf structure in the pelvic wall is not caught');
ok(PELVIC.test('Body of uterus') && PELVIC.test('Cervicovaginal junction') && PELVIC.test('Right ovary'), 'negative run: the pelvic organs pattern does not match a uterus, vagina or ovary');
ok(.11 >= LIMIT, 'negative run: the old 11 cm length would pass the limit');
if (fails.length) { console.error(`FAIL region membership: ${fails.length} of ${checks} checks failed\n - ${fails.join('\n - ')}`); process.exit(1); }
console.log(`PASS region membership: ${checks} checks (11 trunk tabs hold nothing from the limbs or outside their height range, perineum tab = vulva and perineal structures, pelvic organs tab = organs, ovaries and pelvic floor, muscles on by default, ${n} external pudendal arteries short, negative runs fail as expected).`);
