// Interface text must be written Taiwan Traditional Chinese (書面語), never Cantonese colloquial.
// Scans every file the viewer ships text from: source, html, and the generated JSON the pages read.
// Fails the build when a Cantonese-only character or word appears. Characters that are also ordinary written Chinese are allowed in
// their written senses (關係, 係數, 邊緣, 邊界, 周邊, 左邊 …); only the colloquial uses are flagged.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {scanLine} from './lib/zh-rules.mjs';

const root = process.env.ZH_ROOT ?? fileURLToPath(new URL('../', import.meta.url));   // .pathname gives "/C:/…" on Windows
const SCAN = [
  {dir: 'app', ext: /\.(?:tsx?|json|css)$/},
  {dir: 'web', ext: /\.(?:tsx?|css)$/},
  {dir: 'components', ext: /\.(?:tsx?|json|css)$/},
  {dir: 'lib', ext: /\.(?:tsx?|json|css)$/},
  {dir: '.', ext: /^index\.html$/, shallow: true},
  // names and cards the pages read at run time: the generated JSON (plain or gzip) anywhere under public/models
  {dir: 'public/models', ext: /\.json(?:\.gz)?$/},
  {dir: 'docs/neuro-card-text', ext: /\.json$/, shallow: true},
  {dir: 'scripts', ext: /^heart-parts\.json$/, shallow: true},
];
const files = [];
const walk = (dir, def, depth = 0) => {
  for (const entry of fs.readdirSync(path.join(root, dir), {withFileTypes: true})) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {if (!def.shallow) walk(rel, def, depth + 1);}
    else if (def.ext.test(entry.name)) files.push(rel);
  }
};
for (const def of SCAN) walk(def.dir, def);

const read = file => {
  const buf = fs.readFileSync(path.join(root, file));
  return (file.endsWith('.gz') ? zlib.gunzipSync(buf) : buf).toString('utf8');
};
const hits = [];
for (const file of files) {
  const lines = read(file).split('\n');
  lines.forEach((line, i) => {
    for (const {why, at} of scanLine(line)) {
      hits.push(`${file}:${i + 1}  ${why}  …${line.slice(Math.max(0, at - 14), at + 16).replace(/\s+/g, ' ')}…`);
    }
  });
}
if (hits.length) {
  console.error(`check:zh failed: ${hits.length} place(s) use Cantonese colloquial wording. Interface text must be Taiwan Traditional Chinese written language (書面語).\n` + hits.slice(0, 80).map(h => ' - ' + h).join('\n') + (hits.length > 80 ? `\n … and ${hits.length - 80} more` : ''));
  process.exit(1);
}
console.log(`check:zh passed: ${files.length} files scanned, no Cantonese colloquial wording.`);
