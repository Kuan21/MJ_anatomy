// Smoke test for scripts/clean.mjs: --dry-run and --donor must run without crashing and must not delete anything.
// Uses an empty temp folder as MJ_TMP so it does not depend on local state.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mj-clean-test-'));
const home = fs.mkdtempSync(path.join(os.tmpdir(), 'mj-clean-home-'));
let failed = 0;
for (const args of [['--dry-run'], ['--dry-run', '--report'], ['--donor']]) {
  const r = spawnSync(process.execPath, ['scripts/clean.mjs', ...args], {encoding: 'utf8', env: {...process.env, MJ_TMP: tmp, HOME: home}});
  const bad = r.status !== 0 || /ReferenceError|TypeError|before initialization/.test(r.stderr || '');
  if (bad) { failed++; console.error(`clean.mjs ${args.join(' ')} failed (exit ${r.status})`); console.error((r.stderr || '').split('\n').slice(0, 5).join('\n')); }
}
fs.rmSync(tmp, {recursive: true, force: true});
fs.rmSync(home, {recursive: true, force: true});
if (failed) process.exit(1);
console.log('clean.mjs smoke test passed (3 runs)');
