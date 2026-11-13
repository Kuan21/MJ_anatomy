// Runs the `build` job of .github/workflows/deploy-preview.yml on this machine, step for step and in the same order (the `run:` lines are read from the workflow, so this cannot drift from CI):
// npm run check, check:motion, check:vessels, check:vessels:accept, build --base /MJ_anatomy/. Run it, and have it pass, before every push (CLAUDE.md).
//   npm run ci:local [-- --from=<number|text>] [-- --with-install] [-- --list]
//   --list           print the numbered steps and exit
//   --from=N|text    start at step N (1-based) or at the first step that contains the text (resume after a fix)
//   --with-install   also run `npm ci` (skipped by default: it deletes node_modules, which a local checkout usually shares)
// Prints the command and pass/fail; the commands print their own output.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const flag = n => process.argv.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);

export function workflowSteps(file = path.join(root, '.github/workflows/deploy-preview.yml'), job = 'build') {
  const lines = fs.readFileSync(file, 'utf8').split('\n'), steps = [];
  let inJob = false;
  for (const line of lines) {
    if (/^ {2}[\w-]+:\s*$/.test(line)) inJob = line.trim() === `${job}:`;
    if (!inJob) continue;
    const m = line.match(/^\s+- run:\s*(.*)$/);
    if (m) { if (/^[|>]/.test(m[1])) throw new Error('ci-local: multi-line `run:` steps are not supported, put the commands in a script'); steps.push(m[1].trim()); }
  }
  if (!steps.length) throw new Error(`ci-local: no run steps found for job ${job}`);
  return steps;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const all = workflowSteps(), withInstall = process.argv.includes('--with-install');
  const steps = all.filter(s => withInstall || !/^npm ci\b/.test(s)), from = flag('from');
  if (process.argv.includes('--list')) { steps.forEach((s, i) => console.log(`${i + 1}  ${s}`)); process.exit(0); }
  let start = 0;
  if (from) { start = /^\d+$/.test(from) ? +from - 1 : steps.findIndex(s => s.includes(from)); if (start < 0 || start >= steps.length) { console.error(`--from=${from}: no such step`); process.exit(2); } }
  const t0 = Date.now();
  for (let i = start; i < steps.length; i++) {
    console.log(`\n[ci:local ${i + 1}/${steps.length}] ${steps[i]}`);
    const r = spawnSync(steps[i], {cwd: root, shell: true, stdio: 'inherit'});
    if (r.status !== 0) { console.error(`\nci:local FAILED at step ${i + 1}/${steps.length}: ${steps[i]}\nResume after the fix with: npm run ci:local -- --from=${i + 1}`); process.exit(r.status ?? 1); }
  }
  console.log(`\nci:local: all ${steps.length - start} step(s) passed in ${Math.round((Date.now() - t0) / 60000)} min. The same steps as CI, in the same order.`);
}
