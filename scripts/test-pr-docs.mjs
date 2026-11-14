// Tests of scripts/pr-docs.mjs on a throwaway folder: parsing, validation, folding rows into the roadmap, and the index. Prints pass/fail only.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {applyUpdates, buildIndex, checkAll, parseUpdate, sync} from './pr-docs.mjs';

const roadmap = ['# R', '', '## 總進度清單（x）', '', '| 項目 | 狀態 | 相關 PR | 最後更新 | 下一步 |', '| --- | --- | --- | --- | --- |', '| 甲 | ⬜ | — | 2026-01-01 | 開始 |', '', '說明', '',
  '| 項目 | 狀態 | 相關 PR | 最後更新 | 下一步 |', '| --- | --- | --- | --- | --- |', '| 乙 | 🟡 | #1 | 2026-01-02 | 繼續 |', '', '## 其他', '', '| 項目 | 狀態 | 相關 PR | 最後更新 | 下一步 |', '| --- | --- | --- | --- | --- |', '| 甲 | ⬜ | — | 2026-01-01 | 不可動 |', ''].join('\n');
const update = (pr, rows) => ['---', `pr: ${pr}`, 'date: 2026-11-14', '---', '', '| 項目 | 狀態 | 相關 PR | 最後更新 | 下一步 |', '| --- | --- | --- | --- | --- |', ...rows, ''].join('\n');

// parsing and validation
assert.deepEqual(parseUpdate(update(5, ['| 甲 | ✅ | #5 | 2026-11-14 | 完成 |'])).errors, []);
assert.ok(parseUpdate(update(5, ['| 甲 | 完成 | #5 | 2026-11-14 | x |'])).errors.length, 'a bad status must be reported');
assert.ok(parseUpdate(update(5, ['| 甲 | ✅ | #5 | 11/14 | x |'])).errors.length, 'a bad date must be reported');
assert.ok(parseUpdate(update(5, ['| 甲 | ✅ | #5 |'])).errors.length, 'a short row must be reported');
assert.ok(parseUpdate('| 項目 |').errors.length, 'front matter is required');

// folding: replace inside the section, add after the last table of the section, never touch other sections
const r = applyUpdates(roadmap, parseUpdate(update(5, ['| 甲 | ✅ | #5 | 2026-11-14 | 完成 |', '| 丙 | 🟡 | #5 | 2026-11-14 | 新項目 |'])).rows);
assert.equal(r.replaced, 1); assert.equal(r.added, 1);
const out = r.text.split('\n');
assert.equal(out[6], '| 甲 | ✅ | #5 | 2026-11-14 | 完成 |');
assert.equal(out[13], '| 丙 | 🟡 | #5 | 2026-11-14 | 新項目 |');
assert.ok(out.includes('| 甲 | ⬜ | — | 2026-01-01 | 不可動 |'), 'rows outside the section stay');
assert.equal(applyUpdates(r.text, parseUpdate(update(5, ['| 甲 | ✅ | #5 | 2026-11-14 | 完成 |'])).rows).text, r.text, 'applying the same row twice changes nothing');

// the whole flow on disk
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pr-docs-'));
fs.mkdirSync(path.join(root, 'docs/review-log'), {recursive: true}); fs.mkdirSync(path.join(root, 'docs/roadmap-updates'), {recursive: true});
fs.writeFileSync(path.join(root, 'ROADMAP.md'), roadmap);
fs.writeFileSync(path.join(root, 'docs/roadmap-updates/pr-5.md'), update(5, ['| 甲 | ✅ | #5 | 2026-11-14 | 完成 |']));
fs.writeFileSync(path.join(root, 'docs/roadmap-updates/pr-12.md'), update(12, ['| 乙 | ✅ | #12 | 2026-11-14 | 完成 |']));
const log = (pr, status) => ['---', `pr: ${pr}`, `title: 測試 ${pr}`, `status: ${status}`, 'date: 2026-11-14', '---', '', '這是一筆測試紀錄的內容。', ''].join('\n');
fs.writeFileSync(path.join(root, 'docs/review-log/pr-5.md'), log(5, '已自動合併'));
fs.writeFileSync(path.join(root, 'docs/review-log/pr-12.md'), log(12, '等我審核'));
assert.deepEqual(checkAll(root).problems, []);
const done = sync(root);
assert.deepEqual(done, {files: 2, replaced: 2, added: 0});
assert.ok(fs.existsSync(path.join(root, 'docs/roadmap-updates/applied/pr-5.md')) && !fs.existsSync(path.join(root, 'docs/roadmap-updates/pr-5.md')), 'applied files move');
const index = fs.readFileSync(path.join(root, 'docs/review-log/README.md'), 'utf8');
assert.ok(index.indexOf('#12') < index.indexOf('#5'), 'waiting entries come first');
assert.equal(index, buildIndex(root), 'index is reproducible');
assert.deepEqual(sync(root), {files: 0, replaced: 0, added: 0}, 'a second sync has nothing to do');
// validation of bad files
fs.writeFileSync(path.join(root, 'docs/review-log/pr-13.md'), log(13, '進行中'));
fs.writeFileSync(path.join(root, 'docs/review-log/notes.md'), log(1, '已合併'));
fs.writeFileSync(path.join(root, 'docs/roadmap-updates/pr-14.md'), update(15, ['| 甲 | ✅ | #14 | 2026-11-14 | 依共筆 |']));
const bad = checkAll(root).problems.join('\n');
for (const expected of ['pr-13.md: status', 'notes.md: file name', 'pr-14.md: pr must be 14', 'pr-14.md: wording']) assert.ok(bad.includes(expected), `missing problem: ${expected}`);
fs.rmSync(root, {recursive: true, force: true});
console.log('Per-PR documents tests OK.');
