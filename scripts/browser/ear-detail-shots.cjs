// Screenshots of the ear detail mode (and the ear quiz) for review: views, layers, sections, selection and the card-only highlight.
// usage: node ear-detail-shots.cjs <port> <outDir> [desktop|mobile] [frames]
//   BASE_PATH=/MJ_anatomy/ when the build used --base. Needs playwright and `vite preview` of a production build; take the lock /tmp/claude-0/browser.lock yourself before running it.
//   With `frames` as the fourth argument it also writes the frames of the layer-peel and section animation (<outDir>/frames/*.png) for a GIF.
// Writes <outDir>/<size>-<step>.png and prints the structure that every step selected, so a wrong selection is visible in the log.
const {chromium} = require('playwright'); const fs = require('fs');
const [port = '4173', out = '/tmp/ear-shots', size = 'desktop', frames = ''] = process.argv.slice(2);
fs.mkdirSync(out, {recursive: true}); if (frames) fs.mkdirSync(`${out}/frames`, {recursive: true});
const viewport = size === 'mobile' ? {width: 390, height: 844} : {width: 1500, height: 950};
const base = `http://127.0.0.1:${port}${process.env.BASE_PATH || '/'}`;
(async () => {
  const b = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  const p = await b.newPage({viewport, deviceScaleFactor: 1}); p.setDefaultTimeout(180000);
  p.on('pageerror', e => console.log('PAGEERR', e.message)); p.on('console', m => {if (m.type() === 'error') console.log('CONSOLE', m.text());});
  await p.goto(`${base}#/organ/ear`); await p.waitForSelector('.organ-views');
  await p.waitForFunction(() => !document.querySelector('.organ-progress'), null, {timeout: 180000}); await p.waitForTimeout(2500);
  let n = 0;
  const shot = async name => {await p.mouse.move(1, 1); await p.waitForTimeout(1000); await p.screenshot({path: `${out}/${size}-${name}.png`}); console.log('shot', name);};
  const frame = async () => {if (!frames) return; await p.mouse.move(1, 1); await p.waitForTimeout(500); await p.screenshot({path: `${out}/frames/${String(n++).padStart(3, '0')}.png`, clip: size === 'mobile' ? undefined : {x: 300, y: 64, width: 820, height: 886}});};
  const view = async label => {await p.locator('.organ-views button', {hasText: label}).click(); await p.waitForTimeout(900);};
  const reset = async () => {await p.locator('button[aria-label="還原預設"]').click(); await p.waitForTimeout(900);};
  const action = async re => {const l = p.locator('.organ-actions button', {hasText: re}); if (await l.count()) {await l.first().click(); await p.waitForTimeout(900);}};
  const pick = async name => {await p.locator('.organ-search input').fill(name); await p.waitForTimeout(400); await p.locator('.organ-results .organ-part-row button').first().click(); await p.waitForTimeout(700); console.log('selected:', await p.locator('.organ-info-title').innerText()); await p.locator('.organ-search input').fill(''); await p.waitForTimeout(300);};
  const section = async label => {await p.locator('.organ-panel .organ-segmented button', {hasText: label}).click(); await p.waitForTimeout(900);};
  const peel = async k => {for (let i = 0; i < k; i++) {await p.locator('button', {hasText: /Peel deeper/}).click(); await p.waitForTimeout(300);} await p.waitForTimeout(600);};
  const unpeel = async () => {while (await p.locator('button:not([disabled])', {hasText: /Layer back/}).count()) {await p.locator('button', {hasText: /Layer back/}).click(); await p.waitForTimeout(200);} await p.waitForTimeout(500);};

  await shot('01-lateral');
  for (const [label, name] of [['內側', '02-medial'], ['前面', '03-front'], ['後面', '04-back'], ['上面', '05-top'], ['下面', '06-bottom']]) {await view(label); await shot(name);}
  await view('外側');
  // layers, outside in (the camera is not moved by peeling): Focus on the facial nerve first, so that the middle and inner ear fill the picture
  await pick('Facial nerve'); await action(/Focus/); await action(/Clear/); await shot('06b-focus-middle-and-inner-ear');
  for (let k = 1; k <= 5; k++) {await peel(1); await shot(`07-peel-${k}`); await frame();}
  await unpeel(); await frame();
  // selection: a structure of the middle ear, a deep structure of the inner ear, a structure with an information card only
  await pick('Malleus'); await shot('08-select-malleus'); await action(/Focus/); await shot('09-focus-malleus');
  await action(/Clear/); await reset(); await peel(0); await pick('Utricle'); await action(/Focus/); await shot('10-focus-utricle');
  await action(/Clear/); await reset(); await pick('tympanic cavity'); await shot('11-card-only-tympanic-cavity'); await action(/Focus/); await shot('12-focus-tympanic-cavity');
  await action(/Clear/); await reset(); await pick('stapedius'); await action(/Focus/); await shot('13-card-only-stapedius');
  await action(/Clear/); await reset();
  // sections (the cut opens on the middle ear)
  for (const [label, name] of [['矢狀面', '14-section-sagittal'], ['冠狀面', '15-section-coronal'], ['水平面', '16-section-horizontal']]) {await section(label); await shot(name); await frame();}
  await section('不切'); await reset();
  // the list, the search and the card
  await p.locator('.organ-search input').fill('canal'); await p.waitForTimeout(500); await shot('17-search-canal'); await p.locator('.organ-search input').fill('');
  if (size !== 'mobile') {await pick('Round window'); await shot('18-round-window-card');}
  // quiz
  await p.goto(`${base}#/quiz/ear`); await p.waitForTimeout(2500); await shot('19-quiz-setup');
  await p.locator('button', {hasText: '膜性迷路'}).first().click(); await p.waitForTimeout(400); await p.locator('button', {hasText: '開始測驗'}).click(); await p.waitForTimeout(9000); await shot('20-quiz-question');
  await b.close();
})().catch(e => {console.error(e); process.exit(1);});
