// Bone-landmark screenshots of a production build served by vite preview (software GL): the landmark picked from the search, only the skeleton shown.
// usage: [BASE=/MJ_anatomy/] node scripts/browser/landmark-shots.cjs <port> <outDir> <tag> <desktop|ipad>
// Shots: superior nuchal line (head and neck); left spine of ischium and left ischial tuberosity, male and female mode (pelvis); left intertubercular groove
// and left greater tubercle of humerus at rest and with the left elbow flexed 90 degrees (upper limb).
const {chromium, devices} = require('playwright'); const fs = require('fs');
const [port = '5820', out = '/tmp/landmark-shots', tag = 'after', vp = 'desktop'] = process.argv.slice(2); fs.mkdirSync(out, {recursive: true});
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  const ctx = vp === 'ipad' ? await b.newContext({...devices['iPad Pro 11 landscape'], deviceScaleFactor: 1}) : await b.newContext({viewport: {width: 1440, height: 900}});
  const p = await ctx.newPage(); p.setDefaultTimeout(240000);
  const errors = []; p.on('pageerror', e => errors.push(e.message.slice(0, 200)));
  await p.goto(`http://127.0.0.1:${port}${process.env.BASE || '/'}?mjview=1`); await p.waitForSelector('.region-bar', {timeout: 240000});
  await p.waitForFunction(() => document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow') === '100' || !document.querySelector('[data-testid=load-bar]'), null, {timeout: 3600000, polling: 2000});
  await sleep(8000);
  const shot = async n => { await sleep(3000); await p.screenshot({path: `${out}/${tag}-${vp}-${n}.png`}); console.log('shot', n); };
  const look = async (t, d, r) => { await p.evaluate(([t, d, r]) => window.__mjView.look(t, d, r), [t, d, r]); await sleep(2500); };
  const title = async () => (await p.locator('.detail-sheet .structure-title').first().innerText().catch(() => '')).replace(/\s+/g, ' ');
  const openPanel = async () => { const panel = p.locator('.system-list').first(); if (!(await panel.isVisible().catch(() => false))) { const btn = p.locator('button[aria-label="開啟系統面板"]'); if (await btn.count()) { await btn.click(); await sleep(1500); } } };
  const closePanel = async () => { const c = p.locator('.close-systems').first(); if (await c.isVisible().catch(() => false)) { await c.click(); await sleep(1200); } };
  const onlySkeleton = async () => {
    await openPanel();
    for (const row of await p.locator('.system-row').all()) {
      const sw = row.locator('[data-slot=switch]').first(); if (!(await sw.count())) continue;
      const want = /Skeleton|骨骼/.test(await row.innerText()), on = (await sw.getAttribute('aria-checked')) === 'true';
      if (want !== on) { await sw.click(); await sleep(600); }
    }
    await closePanel();
  };
  const pickSex = async sex => { await openPanel(); const organs = p.locator('.organ-expand'); if ((await organs.getAttribute('aria-expanded')) !== 'true') await organs.click(); await sleep(600);
    const arrow = p.locator('button.row-arrow[aria-label*="eproductive"]').first(); if ((await arrow.getAttribute('aria-expanded')) !== 'true') await arrow.click(); await sleep(600);
    await p.locator('.organ-sub[aria-label="生殖系統性別"] button', {hasText: new RegExp('^' + (sex === 'male' ? '男' : '女') + '$')}).click(); await sleep(3000); await closePanel(); };
  const search = async name => {
    if (!await p.locator('.search-panel input').count()) await p.locator('.top-actions button', {hasText: /Find a structure/}).first().click();
    await p.waitForSelector('.search-panel input'); await p.fill('.search-panel input', name); await p.waitForSelector('.anatomy-search-results [role=option]'); await sleep(1200);
    await p.locator('.anatomy-search-results [role=option]').first().click(); await sleep(2500);
    console.log('picked', name, '->', await title());
  };
  // head and neck, pelvis (male, then female)
  await onlySkeleton();
  await search('Superior nuchal line'); await look([0, 1.597, -0.103], [0.25, 0.15, -1], 0.42); await shot('head-superior-nuchal-line');
  await search('Left spine of ischium'); await look([0.045, 0.93, -0.07], [0.35, 0.1, -1], 0.5); await shot('pelvis-male-spine-of-ischium');
  await search('Left ischial tuberosity'); await look([0.045, 0.9, -0.06], [0.35, -0.35, -1], 0.5); await shot('pelvis-male-ischial-tuberosity');
  await pickSex('female'); await onlySkeleton();
  await search('Left spine of ischium'); await look([0.045, 0.93, -0.07], [0.35, 0.1, -1], 0.5); await shot('pelvis-female-spine-of-ischium');
  await search('Left ischial tuberosity'); await look([0.045, 0.9, -0.06], [0.35, -0.35, -1], 0.5); await shot('pelvis-female-ischial-tuberosity');
  await pickSex('male');
  // upper limb: rest, then left elbow flexed 90 degrees
  await p.locator('.region-bar button', {hasText: /^上肢$/}).first().click(); await sleep(4000);
  const ARM = [0.2, 1.3, 0], FRONT = [0.6, 0.1, 1];
  // the joint panel is hidden while a card is open: enable motion (left arm) before anything is picked, then set the elbow through its slider
  const ws = p.locator('.joint-workspace'); if ((await ws.getAttribute('open')) === null) await ws.locator('summary span').first().click();
  await p.locator('.motion-enable-toggle input').check({timeout: 20000}); await sleep(1500);
  await p.locator('.mj-motion-sides button', {hasText: /Left/}).first().click(); await sleep(2500);
  const elbow = async v => { await p.evaluate(v => { const el = [...document.querySelectorAll('input[aria-label$=" angle"]')].find(e => /肘屈曲/.test(e.getAttribute('aria-label'))); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(el, String(v)); el.dispatchEvent(new Event('input', {bubbles: true})); el.dispatchEvent(new Event('change', {bubbles: true})); }, v); await sleep(8000); };
  await onlySkeleton();
  await search('Left intertubercular groove'); await look(ARM, FRONT, 0.9); await shot('arm-rest-intertubercular-groove');
  await search('Left greater tubercle of humerus'); await look(ARM, FRONT, 0.9); await shot('arm-rest-greater-tubercle');
  await elbow(90);
  await search('Left intertubercular groove'); await look(ARM, FRONT, 0.9); await shot('arm-elbow90-intertubercular-groove');
  await search('Left greater tubercle of humerus'); await look(ARM, FRONT, 0.9); await shot('arm-elbow90-greater-tubercle');
  console.log('page errors:', errors.length); errors.slice(0, 5).forEach(e => console.log(' ', e));
  await b.close(); console.log('done');
})().catch(e => { console.log('FAIL', e.message.slice(0, 400)); process.exit(1); });
