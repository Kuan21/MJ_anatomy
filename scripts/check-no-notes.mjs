// The course notes (跑考摘要, 神經解剖學共筆, cmu-course-notes …) are internal reference only: nothing from them may reach the site.
// Fails when a page number such as "0218 p.11", a note source line, or the words 共筆 / 筆記 / 跑考 / 課堂 appear in what is served (public/, and dist/ after a build)
// or in the strings of the app source, and when a notes file sits under public/. Code comments are not shipped and are not checked.
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('../', import.meta.url).pathname, problems = [];
const FORBIDDEN = /[0-9]{4} ?p\.[0-9]|共筆|筆記|跑考|課堂|講義|Course notes|cmu-course|neuro-notes|M65×CM57|出處：神經解剖/;
const TEXT = /\.(json|md|txt|html|js|css|ts|tsx|mjs|svg)$/;
function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') yield* walk(p); } else yield p;
  }
}
// 1. no notes file is served
for (const dir of ['public', 'dist']) for (const f of walk(path.join(root, dir))) if (/notes?[-_.]|course-notes|neuro-notes/i.test(path.basename(f)) && !/neuro-cards/.test(f)) problems.push(`${path.relative(root, f)}: a notes file must not be served`);
// 2. served text carries no note citations or wording
for (const dir of ['public', 'dist']) for (const f of walk(path.join(root, dir))) {
  if (!TEXT.test(f) || fs.statSync(f).size > 30e6) continue;
  const m = FORBIDDEN.exec(fs.readFileSync(f, 'utf8'));
  if (m) problems.push(`${path.relative(root, f)}: contains "${m[0]}"`);
}
// 3. app source strings (comment lines and trailing // comments are dropped)
for (const dir of ['app', 'components', 'lib', 'hooks']) for (const f of walk(path.join(root, dir))) {
  if (!/\.(ts|tsx|json)$/.test(f)) continue;
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const t = line.trim();
    if (/^(\/\/|\/\*|\*)/.test(t)) return;
    const code = f.endsWith('.json') ? line : line.replace(/\s\/\/\s.*$/, '');
    const m = FORBIDDEN.exec(code);
    if (m) problems.push(`${path.relative(root, f)}:${i + 1}: contains "${m[0]}"`);
  });
}
if (problems.length) { console.error(`Course notes reach the site (${problems.length}):\n - ` + problems.slice(0, 40).join('\n - ')); process.exit(1); }
console.log('No course notes on the site: no notes file served, no page citations or note wording in public/, dist/ or the app strings.');
