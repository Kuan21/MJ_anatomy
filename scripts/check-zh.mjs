// Interface text must be written Taiwan Traditional Chinese (書面語), never Cantonese colloquial.
// Scans every file the viewer ships text from: source, html, and the generated JSON the pages read.
// Fails the build when a Cantonese-only character or word appears. Characters that are also ordinary written Chinese are allowed in
// their written senses (關係, 係數, 邊緣, 邊界, 周邊, 左邊 …); only the colloquial uses are flagged.
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const SCAN = [
  {dir: 'app', ext: /\.(?:tsx?|json|css)$/},
  {dir: 'web', ext: /\.(?:tsx?|css)$/},
  {dir: '.', ext: /^index\.html$/, shallow: true},
  {dir: 'public/models', ext: /\.json$/, shallow: true},
  {dir: 'public/models/brain', ext: /\.json$/, shallow: true},
  {dir: 'docs/neuro-card-text', ext: /\.json$/, shallow: true},
  {dir: 'scripts', ext: /^heart-parts\.json$/, shallow: true},
];
// Cantonese-only characters (no written-Chinese use).
const CHARS = '嘅咗喺唔嚟啲睇揀嗰咁冇俾佢啱嘢哋乜咩嘥啩噉嗮咪';
const RULES = [
  [new RegExp(`[${CHARS}]`, 'u'), '廣東話口語字'],
  [/(?<![關聯])係(?!數|指)/u, '「係」（書面語用「是」；「關係」「係數」除外）'],
  [/邊[個類度啲種條隻幾樣]/u, '「邊＋量詞」（書面語用「哪」）'],
  [/呢(?![喃絨])/u, '「呢」（書面語用「這」）'],
  [/點解|點樣|點會|點做|即刻|而家|依家|同埋|唔該|邊度/u, '「點解／點樣」（書面語用「為什麼／如何／立即／現在」）'],
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

const hits = [];
for (const file of files) {
  const lines = fs.readFileSync(path.join(root, file), 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const [re, why] of RULES) {
      const g = new RegExp(re.source, 'gu');
      for (const m of line.matchAll(g)) {
        const at = m.index ?? 0;
        hits.push(`${file}:${i + 1}  ${why}  …${line.slice(Math.max(0, at - 14), at + 16).replace(/\s+/g, ' ')}…`);
        break;
      }
    }
  });
}
if (hits.length) {
  console.error(`check:zh failed: ${hits.length} place(s) use Cantonese colloquial wording. Interface text must be Taiwan Traditional Chinese written language (書面語).\n` + hits.slice(0, 80).map(h => ' - ' + h).join('\n') + (hits.length > 80 ? `\n … and ${hits.length - 80} more` : ''));
  process.exit(1);
}
console.log(`check:zh passed: ${files.length} files scanned, no Cantonese colloquial wording.`);
