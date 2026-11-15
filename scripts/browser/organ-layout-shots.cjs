// Screenshots of the brain detail mode for the pixel comparison of the shared organ layout (see docs/organ-detail-template.md).
// usage: node organ-layout-shots.cjs <port> <outDir> <label> [desktop|mobile]
//   BASE_PATH=/MJ_anatomy/ when the build used --base. Needs playwright and `vite preview` of a production build; takes the lock /tmp/claude-0/browser.lock yourself before running it.
// Writes <outDir>/<label>-<size>-<step>.png and <label>-<size>-rects.json (the canvas rectangles, so the compare script can mask them).
const {chromium} = require('playwright'); const fs = require('fs');
const [port = '4173', out = '/tmp/organ-layout', label = 'run', size = 'desktop'] = process.argv.slice(2);
fs.mkdirSync(out, {recursive: true});
const viewport = size === 'mobile' ? {width: 390, height: 844} : {width: 1500, height: 950};
(async () => {
  const b = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  const p = await b.newPage({viewport, deviceScaleFactor: 1}); p.setDefaultTimeout(240000); p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(`http://127.0.0.1:${port}${process.env.BASE_PATH || "/"}#/organ/brain`); await p.waitForSelector('.organ-views');
  await p.waitForFunction(() => !document.querySelector('.organ-progress'), null, {timeout: 240000}); await p.waitForTimeout(6000);
  const rects = {};
  const shot = async step => {
    await p.mouse.move(1, 1); await p.waitForTimeout(2500);
    rects[step] = await p.evaluate(() => [...document.querySelectorAll('.organ-canvas,.csf-canvas')].map(e => {const r = e.getBoundingClientRect(); return [Math.floor(r.x), Math.floor(r.y), Math.ceil(r.right), Math.ceil(r.bottom)];}));
    await p.screenshot({path: `${out}/${label}-${size}-${step}.png`}); console.log('shot', step);
  };
  const click = async loc => {await loc.scrollIntoViewIfNeeded(); await loc.click();};
  const idle = async () => {await p.waitForFunction(() => !document.querySelector('.organ-progress'), null, {timeout: 240000}); await p.waitForTimeout(1500);};
  await shot('1-initial');
  await click(p.locator('.organ-group .system-name').first()); await p.waitForTimeout(800); await shot('2-group-open');
  await p.locator('.organ-search input').fill('sulcus'); await p.waitForTimeout(1200); await shot('3-search');
  await click(p.locator('.organ-results .organ-part-row button').first()); await p.waitForTimeout(2000); await shot('4-selected');
  await p.locator('.organ-search input').fill(''); await p.waitForTimeout(500);
  await click(p.locator('.organ-actions button', {hasText: /Clear/})); await p.waitForTimeout(500);
  await click(p.locator('.organ-panel .organ-segmented button', {hasText: '矢狀面'})); await idle(); await shot('5-section-sagittal');
  await click(p.locator('.organ-panel .organ-segmented button', {hasText: '不切'})); await idle();
  for (let i = 0; i < 2; i++) {await click(p.locator('button', {hasText: /Peel deeper/})); await p.waitForTimeout(800);} await idle(); await shot('6-peel2');
  await click(p.locator('.csf-toggle')); await p.waitForSelector('.csf-page'); await p.waitForTimeout(8000); await shot('7-csf');
  fs.writeFileSync(`${out}/${label}-${size}-rects.json`, JSON.stringify(rects)); await b.close();
})().catch(e => {console.error(e); process.exit(1);});
