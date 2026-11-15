// Reverse tests for scripts/check-zh.mjs: text that must fail (Cantonese colloquial wording in every scanned place, including the
// generated gzip JSON the pages read) and written Chinese that must pass.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {scanLine} from './lib/zh-rules.mjs';

let failed = 0;
const ok = (cond, msg) => {if (!cond) {failed++; console.error('FAIL: ' + msg);}};
const flagged = text => scanLine(text).length > 0;

// 1. the rules themselves
for (const bad of ['返去學', '答錯的「返去學」', '返嚟', '返學', '返轉頭', '撳掣', '搵結構', '攞答案', '一嚿', '畀你', '郁動', '噉樣', '嘥時間'])
  ok(flagged(bad), `should be flagged: ${bad}`);
for (const good of ['返回', '返回上一頁', '返還', '回去學習', '回來', '關係', '係數', '邊緣', '左邊', '搜尋', '尋找', '給你', '移動'])
  ok(!flagged(good), `should pass: ${good}`);

// 2. the scanner: every scanned place must fail on a bad string, and a clean tree must pass
const script = new URL('./check-zh.mjs', import.meta.url).pathname;
const run = root => spawnSync(process.execPath, [script], {env: {...process.env, ZH_ROOT: root + '/'}, encoding: 'utf8'});
const make = files => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-zh-'));
  for (const d of ['app', 'web', 'components', 'lib', 'public/models', 'docs/neuro-card-text', 'scripts']) fs.mkdirSync(path.join(root, d), {recursive: true});
  fs.writeFileSync(path.join(root, 'index.html'), '<html></html>');
  for (const [rel, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), {recursive: true});
    fs.writeFileSync(path.join(root, rel), typeof body === 'string' ? body : zlib.gzipSync(Buffer.from(JSON.stringify(body))));
  }
  return root;
};
const clean = make({'app/quiz/a.tsx': 'const a = "回去學習 返回";'});
ok(run(clean).status === 0, 'a clean tree must pass');
for (const [rel, body] of Object.entries({
  'app/quiz/a.tsx': 'const a = "返去學：到肺";',
  'components/b.tsx': 'const b = "撳呢度";',
  'lib/c.ts': 'export const c = "搵結構";',
  'public/models/names.json.gz': {names: ['返去學']},
  'public/models/sub/dir/cards.json': '{"zh": "畀你睇"}',
})) {
  const root = make({[rel]: body});
  const r = run(root);
  ok(r.status === 1, `${rel} with colloquial text must fail (status ${r.status})`);
  ok(/Cantonese|廣東話|返|撳|搵|畀/.test(r.stderr), `${rel}: the failure must say why`);
  fs.rmSync(root, {recursive: true, force: true});
}
fs.rmSync(clean, {recursive: true, force: true});

if (failed) {console.error(`test-check-zh: ${failed} problem(s)`); process.exit(1);}
console.log('test-check-zh: rules flag 返去／返嚟／返學／返轉 and 撳搵攞嚿畀郁噉嘥, 返回 passes, and app, web, components, lib and generated gzip JSON are all scanned.');
