// Runs a list of commands from scripts/checks/<name>.txt, then the files of scripts/checks/<name>.d/*.txt in name order. One command per line; blank lines and lines starting with # are skipped.
// Stops at the first failure and says how to resume. Used by `npm run check`, `npm run check:motion` and `npm run regen`.
//   node scripts/run-checks.mjs <check|motion|regen> [--list] [--from=<number|text>] [--only=<text>]
//   --list           print the numbered commands and exit
//   --from=N|text    start at step N (1-based) or at the first command that contains the text (resume after a fix)
//   --only=text      run only the commands that contain the text
// Output: the command being run and pass/fail; the commands print their own output.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const flag = n => process.argv.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);

export function readSteps(listName, dir = path.join(root, 'scripts', 'checks')) {
  const main = path.join(dir, `${listName}.txt`), extra = path.join(dir, `${listName}.d`);
  if (!fs.existsSync(main)) throw new Error(`missing list ${path.relative(root, main)}`);
  const files = [main, ...(fs.existsSync(extra) ? fs.readdirSync(extra).filter(f => f.endsWith('.txt')).sort().map(f => path.join(extra, f)) : [])];
  return files.flatMap(f => fs.readFileSync(f, 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const name = process.argv[2];
  if (!name || name.startsWith('--')) { console.error('usage: node scripts/run-checks.mjs <check|motion|regen> [--list] [--from=N|text] [--only=text]'); process.exit(2); }
  const steps = readSteps(name), only = flag('only'), from = flag('from');
  if (process.argv.includes('--list')) { steps.forEach((s, i) => console.log(`${String(i + 1).padStart(3)}  ${s}`)); process.exit(0); }
  let start = 0;
  if (from) { start = /^\d+$/.test(from) ? +from - 1 : steps.findIndex(s => s.includes(from)); if (start < 0 || start >= steps.length) { console.error(`--from=${from}: no such step`); process.exit(2); } }
  let done = 0;
  for (let i = start; i < steps.length; i++) {
    if (only && !steps[i].includes(only)) continue;
    console.log(`\n[${name} ${i + 1}/${steps.length}] ${steps[i]}`);
    const r = spawnSync(steps[i], {cwd: root, shell: true, stdio: 'inherit'});
    if (r.status !== 0) { console.error(`\n${name} FAILED at step ${i + 1}/${steps.length}: ${steps[i]}\nResume after the fix with: npm run ${name === 'check' ? 'check' : name === 'motion' ? 'check:motion' : name} -- --from=${i + 1}`); process.exit(r.status ?? 1); }
    done++;
  }
  console.log(`\n${name}: ${done} step(s) passed.`);
}
