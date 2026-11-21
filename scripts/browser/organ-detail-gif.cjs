// Short screen recording of an organ detail mode for the PR description (about 10 s): the display presets organ → arteries → veins → nerves → overview, then one structure is selected.
// Takes a production build served on <port>; take /tmp/claude-0/heavy.lock and /tmp/claude-0/browser.lock yourself first. The recording starts after the model has loaded.
// usage: node organ-detail-gif.cjs <organ> <port> <outDir> [search term]   (BASE_PATH=/MJ_anatomy/ when the build used --base); then convert the .webm with ffmpeg (see the PR notes)
const {chromium} = require('playwright'); const fs = require('fs');
const [organ = 'stomach', port = '4173', out = '/tmp/organ-gif', term = 'Diaphragm'] = process.argv.slice(2);
fs.mkdirSync(out, {recursive: true});
const viewport = {width: 1200, height: 760};
(async () => {
  const b = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  // load once without recording (the model takes a while with software rendering), then record a second page that reuses the browser cache
  const warm = await b.newPage({viewport}); await warm.goto(`http://127.0.0.1:${port}${process.env.BASE_PATH || '/'}#/organ/${organ}`); await warm.waitForSelector('.organ-views');
  await warm.waitForFunction(() => !document.querySelector('.organ-progress'), null, {timeout: 600000}); await warm.close();
  const ctx = await b.newContext({viewport, deviceScaleFactor: 1, recordVideo: {dir: out, size: viewport}}); const p = await ctx.newPage(); p.setDefaultTimeout(600000);
  const t0 = Date.now(); await p.goto(`http://127.0.0.1:${port}${process.env.BASE_PATH || '/'}#/organ/${organ}`); await p.waitForSelector('.organ-views');
  await p.waitForFunction(() => !document.querySelector('.organ-progress'), null, {timeout: 600000}); await p.waitForTimeout(1500);
  const start = (Date.now() - t0) / 1000; console.log('recording from', start.toFixed(1), 's');
  const preset = async zh => { const l = p.locator('.organ-segmented[aria-label="顯示分組"] button', {hasText: zh}); await l.scrollIntoViewIfNeeded(); await l.click(); await p.waitForTimeout(1800); };
  await p.waitForTimeout(1200);
  for (const zh of ['動脈', '靜脈', '神經', '全部']) await preset(zh);
  await p.locator('.organ-search input').fill(term); await p.waitForTimeout(600);
  await p.locator('.organ-results .organ-part-row button').first().click(); await p.waitForTimeout(2200);
  const end = (Date.now() - t0) / 1000; const v = p.video(); await ctx.close(); const file = await v.path();
  fs.writeFileSync(`${out}/cut.json`, JSON.stringify({file, start, end})); console.log('video', file, 'cut', start.toFixed(1), '-', end.toFixed(1));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
