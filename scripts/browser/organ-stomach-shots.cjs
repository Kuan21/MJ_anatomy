// Screenshots of the stomach detail mode: groups shown one by one, overview, selection, section. Takes a production build served by `vite preview`; take /tmp/claude-0/heavy.lock and /tmp/claude-0/browser.lock yourself first.
// usage: node organ-stomach-shots.cjs <port> <outDir> <label> [desktop|mobile]   (BASE_PATH=/MJ_anatomy/ when the build used --base)
const {chromium} = require('playwright'); const fs = require('fs');
const [port = '4173', out = '/tmp/organ-stomach', label = 'run', size = 'desktop'] = process.argv.slice(2);
fs.mkdirSync(out, {recursive: true});
const viewport = size === 'mobile' ? {width: 390, height: 844} : {width: 1500, height: 950};
(async () => {
  const b = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  const p = await b.newPage({viewport, deviceScaleFactor: 1}); p.setDefaultTimeout(240000); p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(`http://127.0.0.1:${port}${process.env.BASE_PATH || '/'}#/organ/stomach`); await p.waitForSelector('.organ-views');
  await p.waitForFunction(() => !document.querySelector('.organ-progress'), null, {timeout: 240000}); await p.waitForTimeout(5000);
  const shot = async step => { await p.mouse.move(1, 1); await p.waitForTimeout(2500); await p.screenshot({path: `${out}/${label}-${size}-${step}.png`}); console.log('shot', step); };
  const click = async loc => { await loc.scrollIntoViewIfNeeded(); await loc.click(); };
  const view = async name => { await click(p.locator('.organ-views button', {hasText: name}).first()); await p.waitForTimeout(1500); };
  const preset = async zh => { await click(p.locator('.organ-segmented[aria-label="顯示分組"] button', {hasText: zh})); await p.waitForTimeout(1500); };
  await shot('1-organ');
  await preset('動脈'); await shot('2-arteries');
  await preset('靜脈'); await shot('3-veins');
  await preset('神經'); await shot('4-nerves');
  await preset('全部'); await shot('5-overview-front');
  await view('後'); await shot('6-overview-back');
  await view('前');
  await p.locator('.organ-search input').fill('left gastric artery'); await p.waitForTimeout(1000);
  await click(p.locator('.organ-results .organ-part-row button').first()); await p.waitForTimeout(2000); await shot('7-selected-artery');
  await click(p.locator('.organ-actions button', {hasText: /Clear/})); await p.locator('.organ-search input').fill('');
  await click(p.locator('.organ-panel .organ-segmented button', {hasText: '矢狀面'})); await p.waitForTimeout(3000); await shot('8-section');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
