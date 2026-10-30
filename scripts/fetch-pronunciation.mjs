// English pronunciation data for the structure names of the exam scope (upper limb, lower limb, back, thorax).
// Per word (names are read word by word): the IPA given on the Wiktionary entry (CC BY-SA) and the human recordings that entry links on Wikimedia Commons, with author and
// licence read from Commons (only CC0 / CC BY / CC BY-SA / public domain are kept). Nothing is guessed: a word without an entry, IPA or free recording is left empty and the
// name then counts as 發音待校對. Never fetches Oxford, Cambridge or Merriam-Webster.
// Run: node scripts/fetch-pronunciation.mjs   (needs network; polite: batches of 50 titles, honours Retry-After)  → public/pronunciation.json, docs/pronunciation-review.md
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const UA = 'MJ-anatomy-atlas/1.0 (https://github.com/Kuan21/MJ_anatomy; teaching atlas pronunciation data)';
const REGIONS = ['upper', 'lower', 'back', 'thorax'];
const OK_LICENCE = /^(cc0|cc[ -]by(?:[ -]sa)?\b|public domain|pd\b)/i;

const wordsOf = name => [...name.matchAll(/[A-Za-z][A-Za-z'\-]*/g)].map(m => m[0].toLowerCase());
export const words = new Set();
for (const r of REGIONS) {
  const f = file(`public/models/quiz-${r}.json`);
  if (!fs.existsSync(f)) { console.error(`${f} is missing: run the prebuild first (node scripts/prepare-quiz.mjs)`); process.exit(1); }
  for (const s of JSON.parse(fs.readFileSync(f, 'utf8')).structures) wordsOf(s.name).forEach(w => words.add(w));
}
// Names added after the quiz scope was fixed (the lung name labels, scripts/pronunciation-extra-names.json). PRON_MERGE=1 fetches only the words that public/pronunciation.json
// does not have yet and keeps every existing entry unchanged.
const EXTRA = file('scripts/pronunciation-extra-names.json'), MERGE = !!process.env.PRON_MERGE, existing = fs.existsSync(file('public/pronunciation.json')) ? JSON.parse(fs.readFileSync(file('public/pronunciation.json'), 'utf8')) : {words: {}};
if (fs.existsSync(EXTRA)) for (const n of JSON.parse(fs.readFileSync(EXTRA, 'utf8'))) wordsOf(n).forEach(w => words.add(w));
if (MERGE) for (const w of [...words]) if (w in existing.words) words.delete(w);
const sleep = ms => new Promise(r => setTimeout(r, ms));
// curl is used (not fetch) so that the HTTPS proxy of the environment and its CA bundle apply
async function api(host, params) {
  const url = `https://${host}/w/api.php?` + new URLSearchParams({format: 'json', formatversion: '2', ...params});
  for (let attempt = 0; attempt < 12; attempt++) {
    const r = spawnSync('curl', ['-sS', '-m', '60', '-A', UA, '-D', '-', '--compressed', url], {encoding: 'utf8', maxBuffer: 64e6});
    const raw = r.stdout ?? '', blocks = raw.split(/\r?\n\r?\n/), headers = blocks.filter(b => /^HTTP\//.test(b)).at(-1) ?? '', body = raw.slice(raw.indexOf(headers) + headers.length).trim();
    const status = +(headers.match(/^HTTP\/[\d.]+ (\d+)/m)?.[1] ?? 0);
    if (status === 429 || status >= 500 || status === 0) { const wait = (+headers.match(/retry-after:\s*(\d+)/i)?.[1] || 30) + 2; console.error(`${host}: HTTP ${status}, waiting ${wait}s`); await sleep(wait * 1000); continue; }
    if (status !== 200) throw new Error(`${host}: HTTP ${status}`);
    return JSON.parse(body);
  }
  throw new Error(`${host}: gave up after repeated rate limiting`);
}
const chunks = (a, n) => Array.from({length: Math.ceil(a.length / n)}, (_, i) => a.slice(i * n, i * n + n));

// 1. Wiktionary wikitext of every word (the English section only)
const CACHE = process.env.PRON_CACHE, entry = CACHE && fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
for (const part of Object.keys(entry).length ? [] : chunks([...words].sort(), 40)) {
  const j = await api('en.wiktionary.org', {action: 'query', prop: 'revisions', rvprop: 'content', rvslots: 'main', titles: part.join('|'), redirects: '1'});
  for (const p of j.query.pages) {
    if (p.missing) continue;
    const text = p.revisions?.[0]?.slots?.main?.content ?? '', m = text.match(/==\s*English\s*==([\s\S]*?)(?=\n==[^=]|$)/);
    if (m) entry[p.title.toLowerCase()] = m[1];
  }
  for (const r of j.query.redirects ?? []) if (entry[r.to.toLowerCase()]) entry[r.from.toLowerCase()] = entry[r.to.toLowerCase()];
}
if (CACHE && Object.keys(entry).length) fs.writeFileSync(CACHE, JSON.stringify(entry));
// 2. IPA and audio file names, as the entry writes them: {{a|UK}} {{IPA|en|/…/}} and {{audio|en|En-uk-word.ogg|Audio (UK)}}
const accentOf = (s) => /\b(UK|British|RP|Received Pronunciation)\b/i.test(s) ? 'uk' : /\b(US|General American|American|GenAm|GA)\b/i.test(s) ? 'us' : null;
const found = {}, audioFiles = new Set();
for (const [w, text] of Object.entries(entry)) {
  const rec = found[w] = {ipa: {}, audio: {}};
  const pron = text.match(/===\s*Pronunciation\s*===([\s\S]*?)(?=\n===[^=]|$)/)?.[1] ?? '';
  for (const line of pron.split('\n')) {
    const accent = accentOf(line.split('{{IPA')[0] ?? '') ?? accentOf(line);
    const ipa = line.match(/\{\{IPA\|en\|([^}|]+)/)?.[1]?.trim();
    // an IPA line without an accent label (the usual case for words pronounced alike) counts for both accents
    if (ipa && /^\/.*\/$|^\[.*\]$/.test(ipa)) for (const a of accent ? [accent] : ['uk', 'us']) if (!rec.ipa[a]) rec.ipa[a] = ipa;
    const au = line.match(/\{\{audio\|en\|([^|}]+\.(?:ogg|oga|mp3|wav|flac))/i)?.[1]?.trim();
    if (au) { const a = accentOf(line) ?? accentOf(au.replace(/[-_]/g, ' ').replace(/\buk\b/i, 'UK').replace(/\bus\b/i, 'US')); if (a && !rec.audio[a]) { rec.audio[a] = au; audioFiles.add(au); } }
  }
}
// 3. Commons: URL, author and licence of each recording
const meta = {};
for (const part of chunks([...audioFiles], 40)) {
  const j = await api('commons.wikimedia.org', {action: 'query', prop: 'imageinfo', iiprop: 'url|extmetadata', titles: part.map(f => 'File:' + f).join('|'), redirects: '1'});
  const back = new Map((j.query.redirects ?? []).map(r => [r.to, r.from]));
  for (const p of j.query.pages) {
    const ii = p.imageinfo?.[0]; if (!ii) continue;
    const em = ii.extmetadata ?? {}, strip = s => (s ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const licence = strip(em.LicenseShortName?.value);
    if (!OK_LICENCE.test(licence)) { console.error(`skip ${p.title}: licence "${licence}"`); continue; }
    const name = (back.get(p.title) ?? p.title).replace(/^File:/, '');
    meta[name] = {url: ii.url.replace(/\?.*$/, ''), author: strip(em.Artist?.value) || 'unknown', licence, licenceUrl: strip(em.LicenseUrl?.value) || undefined, page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_')).replace(/%3A/g, ':')}`};
    meta[p.title.replace(/^File:/, '')] = meta[name];
  }
}
// 4. write: only what was actually found
const out = MERGE ? {...existing.words} : {}, review = [];
for (const w of [...words].sort()) {
  const rec = found[w]; if (!rec) continue;
  const item = {};
  if (Object.keys(rec.ipa).length) item.ipa = rec.ipa;
  const audio = {}; for (const [a, f] of Object.entries(rec.audio)) if (meta[f]) audio[a] = {file: f, ...meta[f]};
  if (Object.keys(audio).length) item.audio = audio;
  if (Object.keys(item).length) out[w] = item;
}
const data = {source: 'IPA from English Wiktionary (CC BY-SA 4.0); audio recordings from Wikimedia Commons under the licence and author given with each file', fetched: new Date().toISOString().slice(0, 10), words: out};
fs.writeFileSync(file('public/pronunciation.json'), JSON.stringify(data) + '\n');
const missing = [...words].sort().filter(w => !out[w]?.ipa), noAudio = [...words].sort().filter(w => !out[w]?.audio);
console.log(`${words.size} words: ${Object.keys(out).length} with data, ${words.size - missing.length} with IPA, ${words.size - noAudio.length} with a free recording`);
if (!MERGE) fs.writeFileSync(file('docs/pronunciation-words.md'), ['# Pronunciation data: words without IPA or recording', '', `Generated by \`node scripts/fetch-pronunciation.mjs\` (${data.fetched}).`, '', `## Without IPA (${missing.length})`, '', missing.join(', '), '', `## Without a free recording (${noAudio.length})`, '', noAudio.join(', '), ''].join('\n'));
