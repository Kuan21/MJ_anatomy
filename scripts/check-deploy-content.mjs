// What reaches the deployed site: (1) no book title or edition string anywhere that is shipped (public/, dist/, the strings of the app source, the card data app/mj-paokao.json
// and the scripts that write it); only the allowed public sources (Gray's Anatomy 1918, OpenStax) may be named; (2) the files made from the course notes or the course summary
// are never copied or imported into the site: only a short allowlist of docs files is bundled, vite copies public/ only, and the Pages workflow uploads dist/ only.
// check-no-notes.mjs (note wording, page citations) stays as it is; this one adds the book-name and deploy-path rules. Prints counts only.
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('../', import.meta.url).pathname, problems = [];
const rel = f => path.relative(root, f);
const BOOKS = /Netter|Moore[’']?s|Clinically Oriented|Gray[’']?s Anatomy for Students|Drake et al|Grant[’']?s|Sobotta|Rohen|Gilroy|Standring|Prometheus|Elsevier|Atlas of Human Anatomy|GROSS_SOURCE|NETTER_/i;
const TEXT = /\.(json|md|txt|html|js|css|ts|tsx|mjs|svg)$/;
function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!['node_modules', '.git'].includes(e.name)) yield* walk(p); } else yield p;
  }
}
// 1a. served files (public/, and dist/ after a build)
let served = 0;
for (const dir of ['public', 'dist']) for (const f of walk(path.join(root, dir))) {
  if (!TEXT.test(f) || fs.statSync(f).size > 30e6) continue;
  served++;
  const m = BOOKS.exec(fs.readFileSync(f, 'utf8'));
  if (m) problems.push(`${rel(f)}: names a book ("${m[0]}")`);
}
// 1b. strings of the app source (comment lines and trailing // comments are not shipped) and the generated card data
for (const dir of ['app', 'components', 'lib', 'hooks']) for (const f of walk(path.join(root, dir))) {
  if (!/\.(ts|tsx|json)$/.test(f)) continue;
  fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    const t = line.trim();
    if (/^(\/\/|\/\*|\*)/.test(t)) return;
    const code = f.endsWith('.json') ? line : line.replace(/\s\/\/\s.*$/, '');
    const m = BOOKS.exec(code);
    if (m) problems.push(`${rel(f)}:${i + 1}: names a book ("${m[0]}")`);
  });
}
// 1c. the scripts that write card data and source lines (not shipped themselves, but their output is)
for (const f of [...walk(path.join(root, 'scripts/paokao-structures')), path.join(root, 'scripts/prepare-paokao.mjs')]) {
  const m = BOOKS.exec(fs.readFileSync(f, 'utf8'));
  if (m) problems.push(`${rel(f)}: names a book ("${m[0]}") in the card or source data it writes`);
}
// 2a. docs files the app bundles: an allowlist (structure-name tables written for the site); anything else under docs/ must not be imported
const ALLOWED_DOCS = new Set(['docs/muscle-layers.json', 'docs/paokao-aliases.json']);
const imported = new Set();
for (const dir of ['app', 'components', 'lib', 'hooks', 'web']) for (const f of walk(path.join(root, dir))) {
  if (!/\.(ts|tsx|js|jsx|mjs)$/.test(f)) continue;
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/(?:from|import\()\s*['"]([^'"]*docs\/[^'"]+)['"]/g)) imported.add(path.relative(root, path.resolve(path.dirname(f), m[1])));
}
for (const f of imported) if (!ALLOWED_DOCS.has(f)) problems.push(`${f}: imported by the app, so it would be bundled into the site, but it is not on the allowlist`);
// 2b. files made from the notes or the course summary never sit in public/ or dist/
const NOTE_FILES = ['neuro-notes.json', 'neuro-notes-curation.json', 'neuro-notes-vs-model.md', 'curriculum-terms.json', 'glossary.json', 'paokao-checklist.json', 'paokao-names.json', 'paokao-audit.json', 'paokao-audit.md', 'heart-checklist.json', 'course-notes-source.md', 'naming-report.md'];
for (const dir of ['public', 'dist']) for (const f of walk(path.join(root, dir))) if (NOTE_FILES.includes(path.basename(f))) problems.push(`${rel(f)}: a notes/summary file is served`);
// 2c. build and deploy paths: vite copies public/ only, the Pages artifact is dist/ only
const vite = fs.readFileSync(path.join(root, 'vite.config.ts'), 'utf8');
if (!/publicDir:\s*path\('\.\/public'\)/.test(vite)) problems.push('vite.config.ts: publicDir is not ./public');
if (/docs/.test(vite)) problems.push('vite.config.ts: mentions docs/ (nothing from docs/ may be copied into the build)');
for (const f of walk(path.join(root, '.github/workflows'))) {
  const y = fs.readFileSync(f, 'utf8');
  for (const m of y.matchAll(/upload-pages-artifact[\s\S]{0,200}?path:\s*(\S+)/g)) if (m[1] !== 'dist') problems.push(`${rel(f)}: the Pages artifact uploads "${m[1]}", not dist`);
}
if (problems.length) { console.error(`Deployed content rules broken (${problems.length}):\n - ` + problems.slice(0, 40).join('\n - ')); process.exit(1); }
console.log(`Deployed content: no book title in ${served} served files, the app strings or the card data; ${imported.size} docs files bundled (allowlisted); no notes/summary file served; deploy uploads dist only.`);
