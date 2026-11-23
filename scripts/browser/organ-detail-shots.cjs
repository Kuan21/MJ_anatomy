// Screenshots of an organ detail mode (#/organ/<organ>): organ (region colours on and off), arteries, veins, nerves, overview from the front and back, one structure selected, a section. Takes a production build
// served by `vite preview`; take /tmp/claude-0/heavy.lock and /tmp/claude-0/browser.lock yourself first.
// usage: node organ-detail-shots.cjs <organ> <port> <outDir> <label> [desktop|mobile|tablet] [search term] [more terms to select, comma-separated]   (BASE_PATH=/MJ_anatomy/ when the build used --base)
// Each extra term is searched, chosen and shot on its own (9-<n>-<term>.png), from the front, with the organ preset.
const {chromium} = require('playwright'); const fs = require('fs');
const [organ = 'stomach', port = '4173', out = '/tmp/organ-shots', label = 'run', size = 'desktop', term = 'splenic artery', more = ''] = process.argv.slice(2);
fs.mkdirSync(out, {recursive: true});
const viewport = size === 'mobile' ? {width: 390, height: 844} : size === 'tablet' ? {width: 820, height: 1180} : {width: 1500, height: 950};
(async () => {
  const b = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  const p = await b.newPage({viewport, deviceScaleFactor: 1}); p.setDefaultTimeout(240000); p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(`http://127.0.0.1:${port}${process.env.BASE_PATH || '/'}#/organ/${organ}`); await p.waitForSelector('.organ-views');
  await p.waitForFunction(() => !document.querySelector('.organ-progress'), null, {timeout: 240000}); await p.waitForTimeout(5000);
  const shot = async step => { await p.mouse.move(1, 1); await p.waitForTimeout(2500); await p.screenshot({path: `${out}/${label}-${size}-${step}.png`}); console.log('shot', step); };
  const click = async loc => { await loc.scrollIntoViewIfNeeded(); await loc.click(); };
  const view = async name => { await click(p.locator('.organ-views button', {hasText: name}).first()); await p.waitForTimeout(1500); };
  const preset = async zh => { await click(p.locator('.organ-segmented[aria-label="顯示分組"] button', {hasText: zh})); await p.waitForTimeout(1500); };
  await shot('0-entry');
  await preset('器官'); await shot('1-organ');
  // the region colours switched the other way (on in the organ view: off), then back
  const zonesBtn = p.locator('button[title="Region colours｜分區顏色"]');
  if (await zonesBtn.count()) { await click(zonesBtn.first()); await p.waitForTimeout(1200); await shot('1b-zones-toggled'); await click(zonesBtn.first()); await p.waitForTimeout(1200); }
  await preset('動脈'); await shot('2-arteries');
  await preset('靜脈'); await shot('3-veins');
  await preset('神經'); await shot('4-nerves');
  await preset('全部'); await shot('5-overview-front');
  await view('後'); await shot('6-overview-back');
  await view('前');
  await p.locator('.organ-search input').fill(term); await p.waitForTimeout(1000);
  await click(p.locator('.organ-results .organ-part-row button').first()); await p.waitForTimeout(2000); await shot('7-selected-artery');
  await click(p.locator('.organ-actions button', {hasText: /Clear/})); await p.locator('.organ-search input').fill('');
  await click(p.locator('.organ-panel .organ-segmented button', {hasText: '矢狀面'})); await p.waitForTimeout(3000); await shot('8-section');
  await click(p.locator('.organ-panel .organ-segmented button', {hasText: '不切'}).first()).catch(() => {});
  let k = 0;
  for (const t of more.split(',').filter(Boolean)) {
    k++; await preset('器官'); await view('前');
    await p.locator('.organ-search input').fill(t); await p.waitForTimeout(1000);
    await click(p.locator('.organ-results .organ-part-row button').first()); await p.waitForTimeout(2000); await shot(`9-${k}-${t.replace(/\W+/g, '-').toLowerCase()}`);
    await click(p.locator('.organ-actions button', {hasText: /Clear/})); await p.locator('.organ-search input').fill('');
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
