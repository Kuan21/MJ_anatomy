// Per-PR documents, so that pull requests stop conflicting in REVIEW_LOG.md and ROADMAP.md.
//   docs/review-log/pr-<number>.md        one review-log entry per PR (front matter: pr, title, status, date; then the text)
//   docs/roadmap-updates/pr-<number>.md   the rows of ROADMAP.md's 總進度清單 as they should read once the PR is merged
// Ordinary PRs only add or edit their own two files. ROADMAP.md and the review-log index are written by this script, in a
// documents-only "sync" PR (daily, or when asked):
//   node scripts/pr-docs.mjs check    validate every per-PR file (runs in `npm run check`); prints counts only
//   node scripts/pr-docs.mjs sync     fold docs/roadmap-updates/pr-*.md into ROADMAP.md, move them to applied/, rebuild the index
//   node scripts/pr-docs.mjs index    rebuild docs/review-log/README.md only
// An update file reaches main only when its PR is merged, so everything `sync` finds on main is safe to apply.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const STATUSES = ['等我審核', '延後審核', '已合併', '已自動合併', '已關閉'];
export const SYMBOLS = ['✅', '🟡', '⬜', '❌', '❓'];
// ROADMAP.md is not published, but it must not name the course material either (CLAUDE.md).
const FORBIDDEN = /共筆|筆記|考古|講義|[0-9]{4} ?p\.[0-9]/;
const HEADER = ['項目', '狀態', '相關 PR', '最後更新', '下一步'];
const SECTION = /^## 總進度清單/;

const cells = line => line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
const isRow = line => /^\|.*\|\s*$/.test(line.trim());
const isRule = line => /^\|\s*:?-{3,}/.test(line.trim());

export function parseFrontMatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text.replace(/\r\n/g, '\n'));
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split('\n')) { const k = /^([a-z]+):\s*(.*)$/.exec(line.trim()); if (k) meta[k[1]] = k[2].trim(); }
  return {meta, body: m[2].trim()};
}

/** The rows of a roadmap update file: [{item, cells}] in file order. */
export function parseUpdate(text) {
  const parsed = parseFrontMatter(text), errors = [];
  if (!parsed) return {errors: ['no front matter'], rows: [], meta: {}};
  const lines = parsed.body.split('\n').filter(l => l.trim()), rows = [];
  const head = lines.findIndex(isRow);
  if (head < 0) errors.push('no table');
  else {
    if (cells(lines[head]).join('|') !== HEADER.join('|')) errors.push(`table header must be: ${HEADER.join(' | ')}`);
    if (!lines[head + 1] || !isRule(lines[head + 1])) errors.push('missing table rule line');
    for (const line of lines.slice(head + 2)) {
      if (!isRow(line)) { errors.push('text after the table'); break; }
      const c = cells(line);
      if (c.length !== HEADER.length) { errors.push(`row needs ${HEADER.length} cells: ${c[0]}`); continue; }
      if (!SYMBOLS.includes(c[1])) errors.push(`status of "${c[0]}" must be one of ${SYMBOLS.join(' ')}`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(c[3])) errors.push(`date of "${c[0]}" must be YYYY-MM-DD`);
      rows.push({item: c[0], cells: c});
    }
    if (!rows.length) errors.push('no rows');
  }
  return {errors, rows, meta: parsed.meta};
}

/** Folds update rows into the 總進度清單 section: a row whose 項目 matches is replaced, any other is added to the last table of the section. */
export function applyUpdates(roadmap, rows) {
  const lines = roadmap.split('\n'), start = lines.findIndex(l => SECTION.test(l));
  if (start < 0) throw new Error('ROADMAP.md has no 總進度清單 section');
  let end = lines.findIndex((l, i) => i > start && /^## /.test(l)); if (end < 0) end = lines.length;
  let replaced = 0, added = 0;
  for (const row of rows) {
    const line = `| ${row.cells.join(' | ')} |`;
    let at = -1, lastRow = -1;
    for (let i = start; i < end; i++) { if (!isRow(lines[i]) || isRule(lines[i])) continue; lastRow = i; if (cells(lines[i])[0] === row.item) at = i; }
    if (at >= 0) { lines[at] = line; replaced++; }
    else { if (lastRow < 0) throw new Error('總進度清單 has no table'); lines.splice(lastRow + 1, 0, line); end++; added++; }
  }
  return {text: lines.join('\n'), replaced, added};
}

const prNumber = file => { const m = /^pr-(\d+)\.md$/.exec(file); return m ? +m[1] : null; };
const list = dir => fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'README.md').sort((a, b) => (prNumber(a) ?? 0) - (prNumber(b) ?? 0)) : [];

export function checkAll(root) {
  const problems = [], logDir = path.join(root, 'docs/review-log'), upDir = path.join(root, 'docs/roadmap-updates');
  const logs = list(logDir), updates = list(upDir), applied = list(path.join(upDir, 'applied'));
  for (const f of logs) {
    const where = `docs/review-log/${f}`, n = prNumber(f), parsed = parseFrontMatter(fs.readFileSync(path.join(logDir, f), 'utf8'));
    if (n === null) { problems.push(`${where}: file name must be pr-<number>.md`); continue; }
    if (!parsed) { problems.push(`${where}: no front matter`); continue; }
    const {meta, body} = parsed;
    if (+meta.pr !== n) problems.push(`${where}: pr must be ${n}`);
    if (!meta.title) problems.push(`${where}: title missing`);
    if (!STATUSES.includes(meta.status)) problems.push(`${where}: status must be one of ${STATUSES.join('、')}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date ?? '')) problems.push(`${where}: date must be YYYY-MM-DD`);
    if (body.length < 10) problems.push(`${where}: entry text missing`);
  }
  for (const [dir, files] of [['docs/roadmap-updates', updates], ['docs/roadmap-updates/applied', applied]]) for (const f of files) {
    const where = `${dir}/${f}`, n = prNumber(f), text = fs.readFileSync(path.join(root, dir, f), 'utf8');
    if (n === null) { problems.push(`${where}: file name must be pr-<number>.md`); continue; }
    const {errors, meta} = parseUpdate(text);
    for (const e of errors) problems.push(`${where}: ${e}`);
    if (+meta.pr !== n) problems.push(`${where}: pr must be ${n}`);
    if (FORBIDDEN.test(text)) problems.push(`${where}: wording that may not appear in the roadmap`);
  }
  return {problems, logs: logs.length, updates: updates.length, applied: applied.length};
}

export function buildIndex(root) {
  const dir = path.join(root, 'docs/review-log');
  const entries = list(dir).map(f => ({file: f, ...parseFrontMatter(fs.readFileSync(path.join(dir, f), 'utf8'))})).filter(e => e.meta).sort((a, b) => +b.meta.pr - +a.meta.pr);
  const table = rows => rows.length ? ['| PR | 標題 | 狀態 | 日期 | 紀錄 |', '| --- | --- | --- | --- | --- |', ...rows.map(e => `| #${e.meta.pr} | ${e.meta.title} | ${e.meta.status} | ${e.meta.date} | [${e.file}](${e.file}) |`)].join('\n') : '（沒有）';
  return ['# REVIEW_LOG 總表', '',
    '由 `node scripts/pr-docs.mjs sync` 生成，不要手改。每個 PR 的紀錄在本資料夾的 `pr-<編號>.md`；2026-11-14 以前的紀錄在根目錄的 `REVIEW_LOG.md`（已凍結，不再新增）。', '',
    '## 等我審核', '', table(entries.filter(e => e.meta.status === '等我審核')), '',
    '## 延後審核（已考完範圍，不計入待審上限）', '', table(entries.filter(e => e.meta.status === '延後審核')), '',
    '## 已合併（含自動合併）', '', table(entries.filter(e => e.meta.status === '已合併' || e.meta.status === '已自動合併')), '',
    '## 已關閉', '', table(entries.filter(e => e.meta.status === '已關閉')), ''].join('\n');
}

export function sync(root) {
  const upDir = path.join(root, 'docs/roadmap-updates'), files = list(upDir), roadmapFile = path.join(root, 'ROADMAP.md');
  let roadmap = fs.readFileSync(roadmapFile, 'utf8'), replaced = 0, added = 0;
  for (const f of files) {
    const {errors, rows} = parseUpdate(fs.readFileSync(path.join(upDir, f), 'utf8'));
    if (errors.length) throw new Error(`docs/roadmap-updates/${f}: ${errors[0]}`);
    const r = applyUpdates(roadmap, rows); roadmap = r.text; replaced += r.replaced; added += r.added;
  }
  fs.writeFileSync(roadmapFile, roadmap);
  fs.mkdirSync(path.join(upDir, 'applied'), {recursive: true});
  for (const f of files) fs.renameSync(path.join(upDir, f), path.join(upDir, 'applied', f));
  fs.writeFileSync(path.join(root, 'docs/review-log/README.md'), buildIndex(root));
  return {files: files.length, replaced, added};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), command = process.argv[2];
  if (command === 'check') {
    const r = checkAll(root);
    if (r.problems.length) { console.error(`Per-PR documents: ${r.problems.length} problem(s)`); for (const p of r.problems.slice(0, 20)) console.error(' - ' + p); process.exit(1); }
    console.log(`Per-PR documents OK: ${r.logs} review-log entries, ${r.updates} roadmap updates waiting, ${r.applied} applied.`);
  } else if (command === 'sync') {
    const before = checkAll(root); if (before.problems.length) { console.error('Fix the per-PR documents first: node scripts/pr-docs.mjs check'); process.exit(1); }
    const r = sync(root); console.log(`Roadmap: ${r.files} update file(s) applied (${r.replaced} rows replaced, ${r.added} added). Review-log index rebuilt.`);
  } else if (command === 'index') {
    fs.writeFileSync(path.join(root, 'docs/review-log/README.md'), buildIndex(root)); console.log('Review-log index rebuilt.');
  } else { console.error('usage: node scripts/pr-docs.mjs <check|sync|index>'); process.exit(2); }
}
