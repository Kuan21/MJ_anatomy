// Screenshots of the eye detail mode (shared organ layout, #/organ/eye): every feature one step at a time.
// usage: node eye-layout-shots.cjs <port> <outDir> <label> [desktop|mobile]
//   BASE_PATH=/MJ_anatomy/ when the build used --base. Needs playwright and `vite preview` of a production build; take /tmp/claude-0/browser.lock yourself before running it.
const {chromium} = require('playwright'); const fs = require('fs');
const [port = '4173', out = '/tmp/eye-layout', label = 'run', size = 'desktop'] = process.argv.slice(2);
fs.mkdirSync(out, {recursive: true});
const viewport = size === 'mobile' ? {width: 390, height: 844} : {width: 1500, height: 950};
(async () => {
  const b = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  const p = await b.newPage({viewport, deviceScaleFactor: 1}); p.setDefaultTimeout(240000); p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(`http://127.0.0.1:${port}${process.env.BASE_PATH || '/'}#/organ/eye`); await p.waitForSelector('.organ-views');
  await p.waitForFunction(() => !document.querySelector('.organ-progress'), null, {timeout: 240000}); await p.waitForTimeout(5000);
  const n = {i: 0};
  const shot = async step => {await p.mouse.move(1, 1); await p.waitForTimeout(1800); await p.screenshot({path: `${out}/${label}-${size}-${String(++n.i).padStart(2, '0')}-${step}.png`}); console.log('shot', step);};
  const click = async loc => {await loc.scrollIntoViewIfNeeded(); await loc.click();};
  const idle = async () => {await p.waitForFunction(() => !document.querySelector('.organ-progress'), null, {timeout: 240000}); await p.waitForTimeout(1200);};
  await shot('initial');
  await click(p.locator('.organ-group .system-name').nth(1)); await p.waitForTimeout(600); await shot('group-open');
  await p.locator('.organ-search input').fill('rectus'); await p.waitForTimeout(900); await shot('search');
  await click(p.locator('.organ-results .organ-part-row button').first()); await p.waitForTimeout(1500); await shot('selected');
  await p.locator('.organ-search input').fill(''); await p.waitForTimeout(400);
  await click(p.locator('.organ-actions button', {hasText: /Isolate/})); await p.waitForTimeout(1200); await shot('isolate');
  await click(p.locator('.organ-actions button', {hasText: /Clear/})); await p.waitForTimeout(400);
  for (const [name, text] of [['sagittal', '矢狀面'], ['coronal', '冠狀面'], ['horizontal', '水平面']]) {
    await click(p.locator('.organ-panel .organ-segmented button', {hasText: text})); await idle(); await shot('section-' + name);
  }
  await click(p.locator('.organ-panel .organ-segmented button', {hasText: '不切'})); await idle();
  for (let i = 1; i <= 6; i++) {await click(p.locator('button', {hasText: /Peel deeper/})); await p.waitForTimeout(700); if (i === 2 || i === 4 || i === 6) {await idle(); await shot('peel-' + i);}}
  for (let i = 0; i < 6; i++) await click(p.locator('button', {hasText: /Layer back/})); await p.waitForTimeout(500);
  await click(p.locator('.organ-header .csf-toggle', {hasText: '眼球動作'})); await p.waitForTimeout(800);
  await click(p.locator('.eye-buttons button[aria-label="上直肌的動作"]')); await p.waitForTimeout(1500); await shot('movement-sr');
  await click(p.locator('.eye-buttons button[aria-label="動眼神經麻痺的眼位"]')); await p.waitForTimeout(1500); await shot('palsy-cn3');
  await click(p.locator('.eye-buttons button[aria-label="動眼神經麻痺的眼位"]')); await p.waitForTimeout(800);
  await click(p.locator('.organ-header .csf-toggle', {hasText: '眼眶的孔'})); await p.waitForTimeout(800);
  await click(p.locator('.eye-buttons.openings button').nth(1)); await p.waitForTimeout(1000);
  await click(p.locator('.eye-look')); await p.waitForTimeout(2200); await shot('opening-sof');
  await click(p.locator('.organ-views button', {hasText: '前面'})); await p.waitForTimeout(1500); await shot('view-front');
  await b.close();
})().catch(e => {console.error(e); process.exit(1);});
