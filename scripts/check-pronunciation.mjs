// Pronunciation data sanity: only free licences, recordings only from upload.wikimedia.org, IPA written between / / or [ ], reviewed list of strings.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const data = JSON.parse(fs.readFileSync(file('public/pronunciation.json'), 'utf8')), reviewed = JSON.parse(fs.readFileSync(file('app/pronunciation/reviewed.json'), 'utf8'));
const FREE = /^(cc0|cc[ -]by(?:[ -]sa)?\b|public domain|pd\b)/i, errors = [];
let ipa = 0, audio = 0;
for (const [w, e] of Object.entries(data.words ?? {})) {
  if (!/^[a-z][a-z'-]*$/.test(w)) errors.push(`bad word key ${w}`);
  for (const [a, v] of Object.entries(e.ipa ?? {})) { ipa++; if (!['uk', 'us'].includes(a) || !/^(\/.+\/|\[.+\])$/.test(v)) errors.push(`${w}: bad IPA ${a} ${v}`); }
  for (const [a, r] of Object.entries(e.audio ?? {})) {
    audio++;
    if (!['uk', 'us'].includes(a)) errors.push(`${w}: bad accent ${a}`);
    if (!/^https:\/\/upload\.wikimedia\.org\//.test(r.url)) errors.push(`${w}: recording is not on upload.wikimedia.org (${r.url})`);
    if (!FREE.test(r.licence ?? '')) errors.push(`${w}: licence "${r.licence}" is not free`);
    if (!r.author || !r.page?.startsWith('https://commons.wikimedia.org/')) errors.push(`${w}: author or Commons page missing`);
  }
}
if (!Array.isArray(reviewed.reviewed) || reviewed.reviewed.some(x => typeof x !== 'string')) errors.push('reviewed.json: "reviewed" must be a list of names');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Pronunciation data OK: ${Object.keys(data.words ?? {}).length} words, ${ipa} IPA, ${audio} recordings, ${reviewed.reviewed.length} names proofread.`);
