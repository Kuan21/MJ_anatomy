// Browser check of the heart name labels on a production build (software WebGL, slow): every view (front, back, left, right) of the closed heart and of each opened chamber.
// Checks that no two leader lines cross, no two anchors are closer than 28 px and no two label boxes overlap, and writes one screenshot per case.
// usage: node scripts/test-heart-labels-browser.mjs <base url, e.g. http://127.0.0.1:5401/> <screenshot prefix> [shot dir] [width x height] [check|shots]
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {quizModule} from './quiz-modules.mjs';
const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const {leaderProblems} = await quizModule('app/organ/label-leaders.ts');
const [base, prefix = 'labels', dir = 'shots', size = '1500x950', mode = 'check'] = process.argv.slice(2);
const shotsOnly = mode === 'shots'; // a build without the leader data (the build before this change): screenshots only
if (!base) {console.error('missing base url'); process.exit(1);}
const [W, H] = size.split('x').map(Number);
fs.mkdirSync(dir, {recursive: true});
const VIEWS = [['front', '前面'], ['back', '後面'], ['left', '左側'], ['right', '右側']];
const browser = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
let failures = 0;
try {
  const page = await browser.newPage({viewport: {width: W, height: H}, deviceScaleFactor: 1});
  page.setDefaultTimeout(300000);
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}#/organ/heart`);
  await page.waitForSelector('.organ-chambers button');
  await page.waitForSelector('.organ-progress', {state: 'detached', timeout: 290000});
  await page.waitForTimeout(3000);
  const settled = async () => {
    if (shotsOnly) {await page.waitForTimeout(6000); return {ready: true, leaders: [], hidden: []};}
    let last = '', stable = 0;
    for (let i = 0; i < 60 && stable < 3; i++) {
      await page.waitForTimeout(500);
      const now = await page.evaluate(() => document.querySelector('.organ-canvas').dataset.leaders ?? '');
      stable = now === last && now !== '' ? stable + 1 : 0; last = now;
    }
    return last ? JSON.parse(last) : {ready: false, leaders: [], hidden: []};
  };
  const cases = [['closed', null], ['ra', 0], ['rv', 1], ['la', 2], ['lv', 3]];
  for (const [name, index] of cases) {
    await page.evaluate(n => {
      const buttons = [...document.querySelectorAll('.organ-chambers button')];
      if (n !== null) buttons[n].click();
    }, index);
    if (name === 'closed') await page.evaluate(() => {for (const b of document.querySelectorAll('.organ-segmented button')) if (/Valves/.test(b.textContent) && b.getAttribute('aria-pressed') !== 'true') b.click();});
    for (const [view, label] of VIEWS) {
      await page.evaluate(l => {for (const b of document.querySelectorAll('.organ-views button')) if (b.textContent === l) b.click();}, label);
      const data = await settled();
      const problems = leaderProblems(data.leaders.map(l => ({id: l.id, side: l.side, anchor: {x: l.ax, y: l.ay}, edge: {x: l.ex, y: l.ey}, top: l.top, width: l.w, height: l.h})));
      const hint = await page.evaluate(() => [...document.querySelectorAll('.organ-canvas ~ div div')].map(d => d.style.display !== 'none' && d.textContent.startsWith('此視角') || d.textContent.startsWith('腔內構造') ? d.textContent : '').filter(Boolean)[0] ?? '');
      await page.screenshot({path: `${dir}/${prefix}-${name}-${view}.png`});
      const ok = problems.length === 0 && (name === 'closed' || data.ready);
      if (!ok) failures++;
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}/${view}: ${data.leaders.length} leaders, hidden: ${data.hidden.length ? data.hidden.join(' | ') : '-'}${problems.length ? ' PROBLEMS ' + problems.join('; ') : ''}${hint ? ' HINT ' + hint : ''}`);
    }
  }
  assert.deepEqual(errors, [], 'no page errors');
} finally {await browser.close();}
if (failures) {console.error(`${failures} case(s) failed`); process.exit(1);}
console.log('heart labels browser check: all cases passed');
