// Browser test of the heart detail mode on a production build with the real heart data (slow: software WebGL loads the model in 1-3 minutes).
// usage: node scripts/test-heart-open-browser.mjs <base url, e.g. http://127.0.0.1:5401/> <screenshot prefix> [shot dir]
// Opens each of the four chambers and checks that the fine vessel branches are hidden, the great vessels and the main coronary vessels stay, the main coronary
// vessels are drawn as their trunk only and closing restores everything; then checks that the info card never overlaps the panel below it. Exits 1 on any failure.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const [base, prefix = 'heart', dir = 'shots'] = process.argv.slice(2);
if (!base) {console.error('missing base url'); process.exit(1);}
fs.mkdirSync(dir, {recursive: true});
const FINE = ['Right inferolateral branch of right coronary artery', 'Septal branches of anterior interventricular artery', 'Right marginal branch', 'Posterior interventricular branch', 'Diagonal branches', 'Sinoatrial nodal artery', 'Left marginal branch', 'Middle cardiac vein', 'Inferior vein of left ventricle', 'Posterior vein of left ventricle', 'Small cardiac vein', 'Anterior cardiac veins'];
const KEPT = ['Right coronary artery', 'Left coronary artery', 'Anterior interventricular artery', 'Circumflex artery', 'Coronary sinus', 'Great cardiac vein', 'Ascending aorta', 'Aortic arch', 'Pulmonary trunk', 'Left pulmonary artery', 'Right pulmonary artery', 'Superior vena cava', 'Inferior vena cava', 'Left superior pulmonary vein', 'Left inferior pulmonary vein', 'Right superior pulmonary vein', 'Right inferior pulmonary vein'];
const TRUNK = ['Right coronary artery', 'Anterior interventricular artery', 'Circumflex artery', 'Great cardiac vein'];
const PERICARDIUM = ['Fibrous pericardium', 'Parietal layer of serous pericardium', 'Visceral layer of serous pericardium (epicardium)', 'Transverse pericardial sinus', 'Oblique pericardial sinus'];
const browser = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
try {
  const page = await browser.newPage({viewport: {width: 1500, height: 950}});
  page.setDefaultTimeout(300000);
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}#/organ/heart`);
  await page.waitForSelector('.organ-chambers button');
  // the vessel layer streams in late: wait until every package is in (the closed heart shows all of them)
  await page.waitForFunction(names => {const v = JSON.parse(document.querySelector('.organ-canvas')?.dataset.visibleParts ?? '[]'); return names.every(n => v.includes(n));}, [...FINE, ...KEPT], {timeout: 290000});
  const read = () => page.evaluate(() => {const d = document.querySelector('.organ-canvas').dataset; return {visible: JSON.parse(d.visibleParts), trunk: JSON.parse(d.trunkParts)};});
  const closed = await read();
  for (const n of FINE) assert.ok(closed.visible.includes(n), `closed heart shows ${n}`);
  assert.deepEqual(closed.trunk, [], 'closed heart draws the whole vessel meshes');
  await page.screenshot({path: `${dir}/${prefix}-closed.png`});
  for (const [i, id] of ['ra', 'rv', 'la', 'lv'].entries()) {
    await page.evaluate(n => document.querySelectorAll('.organ-chambers button')[n].click(), i);
    await page.waitForTimeout(8000);
    const s = await read();
    for (const n of FINE) assert.ok(!s.visible.includes(n), `${id}: fine branch ${n} is hidden`);
    for (const n of PERICARDIUM) assert.ok(!s.visible.includes(n), `${id}: ${n} is hidden`);
    for (const n of KEPT) assert.ok(s.visible.includes(n), `${id}: kept vessel ${n} is shown`);
    for (const n of TRUNK) assert.ok(s.trunk.includes(n), `${id}: ${n} is drawn as trunk only`);
    await page.screenshot({path: `${dir}/${prefix}-${id}.png`});
    console.log(`${id}: ok (${s.visible.length} parts drawn, trunk only: ${s.trunk.join(', ')})`);
    if (id === 'lv') {
      await page.evaluate(() => document.querySelectorAll('.organ-chambers button')[3].click());
      await page.waitForTimeout(6000);
      const back = await read();
      for (const n of FINE) assert.ok(back.visible.includes(n), `restored: ${n} is shown again`);
      assert.deepEqual(back.trunk, [], 'restored: whole vessel meshes again');
      await page.screenshot({path: `${dir}/${prefix}-restored.png`});
      console.log('restore: ok');
    }
  }
  // layout: select a structure so the info card is long, then the info card must end above the scrolling controls on every viewport
  for (const [w, h] of [[1500, 950], [390, 844]]) {
    await page.setViewportSize({width: w, height: h});
    await page.evaluate(() => {const b = document.querySelectorAll('.organ-chambers button')[1]; if (b.getAttribute('aria-pressed') !== 'true') b.click();});
    await page.waitForTimeout(3000);
    await page.evaluate(() => {const b = document.querySelector('.organ-chamber-items button'); if (b.getAttribute('aria-pressed') !== 'true') b.click();});
    await page.waitForTimeout(1500);
    await page.evaluate(() => {const s = document.querySelector('.organ-panel-scroll'); if (s) s.scrollTop = 120;});
    const r = await page.evaluate(() => {
      const info = document.querySelector('.organ-info').getBoundingClientRect(), scroll = document.querySelector('.organ-panel-scroll').getBoundingClientRect();
      const first = [...document.querySelectorAll('.organ-panel-scroll .organ-block')].map(b => b.getBoundingClientRect()).filter(b => b.bottom > scroll.top && b.top < scroll.bottom);
      return {infoBottom: info.bottom, scrollTop: scroll.top, visibleBlocks: first.length};
    });
    assert.ok(r.infoBottom > r.scrollTop - 400 && r.visibleBlocks > 0, `${w}px: the info card and the controls below are both on the page`);
    assert.ok(r.infoBottom <= r.scrollTop + 1, `${w}px: info card (bottom ${r.infoBottom}) does not overlap the panel below (top ${r.scrollTop})`);
    await page.screenshot({path: `${dir}/${prefix}-layout-${w}.png`, fullPage: w < 900});
    console.log(`layout ${w}px: ok`);
  }
  assert.deepEqual(errors, [], 'no page errors');
  console.log('heart open browser test passed');
} finally {await browser.close();}
