// Vessel-end selection screenshots of a production build served by vite preview (software GL): a real mouse click on a vessel's end piece (connectors, tapers).
// usage: [BASE=/MJ_anatomy/] node scripts/browser/vessel-end-shots.cjs <port> <outDir> <tag> <desktop|ipad> <points.json>
// tag "before": searches each end piece's screen box for a point where the click picks the end piece itself (its old card says "generated from the surface of the
// neighbouring structure"), stores the points in <points.json> and shoots. Any other tag clicks the stored points with the same camera, so both builds are
// clicked on the same end piece. Only Arteries and Veins are switched on.
const {chromium, devices} = require('playwright'); const fs = require('fs');
const [port = '5840', out = '/tmp/vessel-end-shots', tag = 'after', vp = 'desktop', pointsFile = out + '/points.json', only = ''] = process.argv.slice(2); fs.mkdirSync(out, {recursive: true});
const TARGETS = [
  {key: 'neck-left-common-carotid-artery', id: 'FJ3483-END', name: 'Left common carotid artery', c: [0.013, 1.386, 0.002], dir: [0.3, 0.1, 1], dist: 0.14, hit: 'any'},
  {key: 'abdomen-left-inferior-epigastric-artery', id: 'FJ3511-END', name: 'Left inferior epigastric artery', c: [0.031, 0.998, 0.049], dir: [0.2, 0.05, 1], dist: 0.2, hit: 'any'},
  {key: 'pelvis-left-internal-pudendal-vein', id: 'FJ3525-END', name: 'Left internal pudendal vein', c: [0.014, 0.884, -0.054], dir: [0.4, -0.2, -1], dist: 0.42, hit: 'any'},
  {key: 'upper-left-median-antebrachial-vein', id: 'FJ2234-END', name: 'Left median antebrachial vein', c: [0.21, 1.016, 0.001], dir: [0.1, 0.05, 1], dist: 0.22, hit: 'end'},
];
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  const ctx = vp === 'ipad' ? await b.newContext({...devices['iPad Pro 11 landscape'], deviceScaleFactor: 1}) : await b.newContext({viewport: {width: 1440, height: 900}});
  const p = await ctx.newPage(); p.setDefaultTimeout(240000);
  const errors = []; p.on('pageerror', e => errors.push(e.message.slice(0, 200)));
  await p.goto(`http://127.0.0.1:${port}${process.env.BASE || '/'}?mjview=1`); await p.waitForSelector('.region-bar', {timeout: 240000});
  await p.waitForFunction(() => document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow') === '100' || !document.querySelector('[data-testid=load-bar]'), null, {timeout: 3600000, polling: 2000});
  await sleep(8000); await p.mouse.move(5, 5);
  const openPanel = async () => { const panel = p.locator('.system-list').first(); if (!(await panel.isVisible().catch(() => false))) { const btn = p.locator('button[aria-label="開啟系統面板"]'); if (await btn.count()) { await btn.click(); await sleep(1500); } } };
  const closePanel = async () => { const c = p.locator('.close-systems').first(); if (await c.isVisible().catch(() => false)) { await c.click(); await sleep(1200); } };
  await openPanel();
  for (const row of await p.locator('.system-row').all()) {
    const sw = row.locator('[data-slot=switch]').first(); if (!(await sw.count())) continue;
    const want = /Arteries|Veins/.test(await row.innerText()), on = (await sw.getAttribute('aria-checked')) === 'true';
    if (want !== on) { await sw.click(); await sleep(600); }
  }
  await closePanel();
  const card = async () => (await p.locator('.detail-sheet').first().innerText().catch(() => '')).replace(/\s+/g, ' ');
  const clear = async () => { const c = p.locator('.detail-sheet button', {hasText: /Clear/}).first(); if (await c.isVisible().catch(() => false)) { await c.click(); await sleep(1000); } };
  const look = async t => { await p.evaluate(([c, d, r]) => window.__mjView.look(c, d, r), [t.c, t.dir, t.dist]); await sleep(3000); };
  const points = fs.existsSync(pointsFile) ? JSON.parse(fs.readFileSync(pointsFile, 'utf8')) : {};
  for (const t of TARGETS.filter(t => !only || t.key === only)) try {
    console.log('target', t.key);
    await clear(); await look(t);
    let pt = points[t.key];
    if (tag === 'before') {
      const r = await p.evaluate(ids => window.__mjView.screenBox(ids), t.hit === 'end' ? [t.id] : [t.id.slice(0, -4)]);
      if (!r) { console.log('no screen box', t.key); continue; }
      outer: for (let fy = .2; fy <= .81; fy += .15) for (let fx = .2; fx <= .81; fx += .15) {
        const x = r.left + r.l + (r.r - r.l) * fx, y = r.top + r.t + (r.b - r.t) * fy;
        if (!(await p.evaluate(([x, y]) => document.elementFromPoint(x, y)?.tagName === 'CANVAS', [x, y]))) continue;   // only clicks on the 3D view
        await p.mouse.click(x, y); await sleep(1500);
        const text = await card();
        if (text.includes(t.name) && (t.hit !== 'end' || text.includes('由相鄰構造的表面生成'))) { pt = [x, y]; break outer; }
      }
      if (!pt) { console.log('end piece not hit', t.key); continue; }
      points[t.key] = pt;
    } else {
      if (!pt) { console.log('no stored point', t.key); continue; }
      await p.mouse.click(pt[0], pt[1]); await sleep(1500);
    }
    await p.mouse.move(5, 5); await sleep(2500);
    const text = await card();
    const pieces = /Selected pieces[^0-9]*(\d+)/.exec(text)?.[1];
    console.log(t.key, 'card:', text.includes('由相鄰構造的表面生成') ? 'surface-generated (end piece alone)' : 'vessel card', '| tapered-end note:', text.includes('模型末端'), '| selected pieces:', pieces);
    await p.screenshot({path: `${out}/${tag}-${vp}-${t.key}.png`});
  } catch (e) { console.log('target failed', t.key, e.message.slice(0, 200)); if (p.isClosed()) break; }
  if (tag === 'before') fs.writeFileSync(pointsFile, JSON.stringify(points, null, 1));
  console.log('page errors:', errors.length); errors.slice(0, 5).forEach(e => console.log(' ', e));
  await b.close(); console.log('done');
})().catch(e => { console.log('FAIL', e.message.slice(0, 400)); process.exit(1); });
