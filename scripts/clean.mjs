// npm run clean: frees disk space by removing only things that can be regenerated.
//   node scripts/clean.mjs [--dry-run] [--if-low[=GB]] [--report] [--verify]
//   --dry-run   print what would be removed, remove nothing
//   --if-low    do nothing unless free disk space is below GB (default 2)
//   --report    list the screenshot folders inside the repo with their sizes; never deletes them
//   --donor     print the worktree that is kept as the source of work/ and generated model data
//   --verify    after cleaning, run a production `vite build` into a temp folder and delete it (needs 1.5 GB free)
// Removed: npm cache, .vite / dist / build output / Playwright reports of this repo, build output and screenshot temp
// files (older than 7 days) in the temp folder, and git worktrees + local branches whose pull request is merged and
// whose work is clean. Never removed: source or generated model data, code, REVIEW_LOG.md, ROADMAP.md, CLAUDE.md,
// anything of an unmerged branch, any folder a running process is using. Anything uncertain is listed, not deleted.
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2), has = f => args.some(a => a === f || a.startsWith(f + '='));
const DRY = has('--dry-run'), TMP = process.env.MJ_TMP || '/tmp/claude-0', DAY = 864e5;
const sh = (cmd, a, o = {}) => { try { return execFileSync(cmd, a, {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], ...o}).trim(); } catch { return null; } };
const freeBytes = () => { const s = fs.statfsSync('/'); return s.bavail * s.bsize; };
const gb = b => (b / 2 ** 30).toFixed(2) + ' GB', mb = b => (b / 2 ** 20).toFixed(0) + ' MB';
const sizeOf = p => { const o = sh('du', ['-sk', p]); return o ? parseInt(o) * 1024 : 0; };

const lowArg = args.find(a => a.startsWith('--if-low')), lowGB = lowArg?.includes('=') ? +lowArg.split('=')[1] : 2;
if (lowArg && freeBytes() >= lowGB * 2 ** 30) { console.log(`clean: ${gb(freeBytes())} free, above ${lowGB} GB, nothing to do`); process.exit(0); }

const top = sh('git', ['rev-parse', '--show-toplevel']) || process.cwd(), mainTop = path.resolve(sh('git', ['rev-parse', '--git-common-dir'], {cwd: top}) || path.join(top, '.git'), '..');
// never touch these, whatever a category selects
const PROTECTED = /(^|\/)(REVIEW_LOG\.md|ROADMAP\.md|CLAUDE\.md|package\.json|\.git)$|\/(app|scripts|docs|public\/models)(\/|$)/;
const inUse = p => { // a running process has its working directory or an argument inside p
  for (const pid of fs.readdirSync('/proc').filter(x => /^\d+$/.test(x))) {
    if (+pid === process.pid) continue;
    try { if ((fs.readlinkSync(`/proc/${pid}/cwd`) + '/').startsWith(p + '/')) return true; } catch {}
    try { if (fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0').some(x => x === p || x.startsWith(p + '/'))) return true; } catch {}
  }
  return false;
};
const log = [], skipped = [], before = freeBytes();
function remove(p, why) {
  const real = path.resolve(p);
  if (PROTECTED.test(real) && !/\/(dist|\.vite|test-results|playwright-report)$/.test(real)) { skipped.push(`${real} (protected)`); return; }
  if (inUse(real)) { skipped.push(`${real} (in use by a running process)`); return; }
  const sz = sizeOf(real);
  log.push(`${DRY ? 'would remove' : 'removed'} ${real} ${mb(sz)} (${why})`);
  if (!DRY) fs.rmSync(real, {recursive: true, force: true});
}

// 1. npm cache
{ const c = path.join(os.homedir(), '.npm', '_cacache'); if (fs.existsSync(c)) { log.push(`${DRY ? 'would clear' : 'cleared'} npm cache ${mb(sizeOf(c))}`); if (!DRY) sh('npm', ['cache', 'clean', '--force']); } }

// 2. build output and reports of every worktree of this repo
const worktrees = (sh('git', ['worktree', 'list', '--porcelain'], {cwd: mainTop}) || '').split('\n\n').map(b => ({
  dir: /^worktree (.*)$/m.exec(b)?.[1], branch: /^branch refs\/heads\/(.*)$/m.exec(b)?.[1], head: /^HEAD (.*)$/m.exec(b)?.[1]})).filter(w => w.dir);
for (const w of worktrees) for (const d of ['dist', '.vite', 'node_modules/.vite', 'test-results', 'playwright-report'])
  if (fs.existsSync(path.join(w.dir, d))) remove(path.join(w.dir, d), 'build output / report');

// 3. temp folder: build output of finished runs, screenshot temp files older than 7 days
if (fs.existsSync(TMP)) {
  for (const e of fs.readdirSync(TMP)) {
    const p = path.join(TMP, e);
    if (/^dist(-|$)/.test(e) && fs.statSync(p).isDirectory()) remove(p, 'build output');
    else if (/^(shots|shsh|screenshots?)/.test(e) && fs.statSync(p).isDirectory()) {
      const walk = d => fs.readdirSync(d, {withFileTypes: true}).flatMap(x => x.isDirectory() ? walk(path.join(d, x.name)) : [path.join(d, x.name)]);
      for (const f of walk(p)) if (/\.(png|jpe?g|webp)$/i.test(f) && Date.now() - (fs.statSync(f, {throwIfNoEntry: false})?.mtimeMs ?? Date.now()) > 7 * DAY && !inUse(path.dirname(f))) { const sz = sizeOrNull(f) ?? 0; log.push(`${DRY ? 'would remove' : 'removed'} ${f} ${mb(sz)} (screenshot older than 7 days)`); if (!DRY) fs.rmSync(f, {force: true}); }
    }
  }
}

// Files that live only in a worktree (gitignored, not regenerable from git): work/ and outputs/. One worktree, the donor,
// always stays: the one holding the most such files plus generated model data. A worktree may only be removed when every
// file of its work/ and outputs/ also exists in the donor with the same size.
const filesUnder = (d) => { try { return fs.readdirSync(d, {withFileTypes: true}).flatMap(x => x.isDirectory() ? filesUnder(path.join(d, x.name)) : [path.join(d, x.name)]); } catch { return []; } };
const sizeOrNull = f => { try { return fs.statSync(f).size; } catch { return null; } }; // a file may vanish while another process works
const localData = w => ['work', 'outputs'].flatMap(k => filesUnder(path.join(w.dir, k)).map(f => [path.relative(w.dir, f), sizeOrNull(f)]).filter(([, sz]) => sz !== null));
const score = w => localData(w).length * 1e6 + filesUnder(path.join(w.dir, 'public/models/stream')).length;
const donor = [...worktrees].sort((a, b) => score(b) - score(a))[0];
if (has('--donor')) { console.log(donor?.dir ?? ''); process.exit(0); }
const donorData = new Map(donor ? localData(donor) : []);

// 4. worktrees and local branches of merged pull requests, only when clean and unused
const repo = (sh('git', ['remote', 'get-url', 'origin'], {cwd: mainTop}) || '').replace(/.*github\.com[:/]/, '').replace(/\.git$/, '');
for (const w of worktrees) {
  if (path.resolve(w.dir) === path.resolve(mainTop) || path.resolve(w.dir) === path.resolve(top)) continue;
  const label = w.branch || `(detached ${String(w.head).slice(0, 7)})`;
  if (sh('git', ['status', '--porcelain'], {cwd: w.dir})) { skipped.push(`${w.dir} ${label} (uncommitted changes)`); continue; }
  let merged = false;
  if (w.branch && repo) { // squash merges are not ancestors: ask GitHub, and require that no commit came after the merged PR head
    const r = sh('gh', ['api', `repos/${repo}/pulls?head=${repo.split('/')[0]}:${w.branch}&state=all`, '--jq', '.[]|select(.merged_at!=null)|.head.sha']);
    merged = !!r && r.split('\n').includes(w.head);
  }
  if (!merged) { skipped.push(`${w.dir} ${label} (no merged PR for this branch, or it has commits after the merged PR)`); continue; }
  if (donor && path.resolve(w.dir) === path.resolve(donor.dir)) { skipped.push(`${w.dir} ${label} (kept: donor of work/ and generated model data)`); continue; }
  const lost = localData(w).filter(([f, sz]) => donorData.get(f) !== sz);
  if (lost.length) { skipped.push(`${w.dir} ${label} (holds ${lost.length} file(s) in work/ or outputs/ that exist nowhere else, e.g. ${lost[0][0]})`); continue; }
  if (inUse(path.resolve(w.dir))) { skipped.push(`${w.dir} ${label} (in use by a running process)`); continue; }
  log.push(`${DRY ? 'would remove' : 'removed'} worktree ${w.dir} ${mb(sizeOf(w.dir))} and branch ${label} (merged)`);
  if (!DRY) { const rm = spawnSync('git', ['worktree', 'remove', w.dir], {cwd: mainTop, encoding: 'utf8'}); if (rm.status !== 0) { log.pop(); skipped.push(`${w.dir} ${label} (git refused: ${rm.stderr.trim().split('\n')[0]})`); } else if (w.branch) sh('git', ['branch', '-D', w.branch], {cwd: mainTop}); }
}

// 5. report only: screenshot folders inside the repo, for the user to decide
if (has('--report')) {
  console.log('Screenshot folders inside the repo (never deleted automatically):');
  const hits = (sh('git', ['ls-files', '*.png', '*.jpg', '*.jpeg', '*.webp'], {cwd: top}) || '').split('\n').filter(Boolean), byDir = new Map();
  for (const f of hits) { const d = path.dirname(f); byDir.set(d, (byDir.get(d) || 0) + fs.statSync(path.join(top, f)).size); }
  for (const [d, s] of [...byDir].sort((a, b) => b[1] - a[1])) console.log(`  ${mb(s).padStart(7)}  ${d}`);
}

for (const l of log) console.log(l);
if (skipped.length) { console.log('Not removed (asking you instead):'); for (const s of skipped) console.log('  ' + s); }
const after = freeBytes(), line = `${new Date().toISOString()} clean${DRY ? ' (dry run)' : ''}: ${log.length} item(s) ${DRY ? 'would be ' : ''}removed, freed ${mb(Math.max(0, after - before))}, ${gb(after)} free`;
console.log(line);
if (!DRY) try { fs.appendFileSync(path.join(os.homedir(), 'mj-clean.log'), line + '\n'); } catch {}

if (has('--verify') && !DRY) {
  if (freeBytes() < 1.5 * 2 ** 30) { console.log('verify: less than 1.5 GB free, production build not run'); process.exit(1); }
  const out = fs.mkdtempSync(path.join(TMP, 'dist-verify-')), r = spawnSync('npx', ['vite', 'build', '--outDir', out], {cwd: top, stdio: 'inherit'});
  fs.rmSync(out, {recursive: true, force: true});
  console.log(r.status === 0 ? 'verify: production build OK' : 'verify: production build FAILED'); process.exit(r.status ?? 1);
}
