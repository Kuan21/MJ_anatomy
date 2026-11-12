// Rules shared by prepare-neuro-notes.mjs (which drops what fails them) and test-neuro-notes.mjs (which fails the build if anything slipped through).
// The notes are internal reference only: an alias must be a name, and no site text may repeat a run of the notes' own wording.
import fs from 'node:fs';
import path from 'node:path';

// Figure references, comparison rows and sentence fragments that the notes' automatic extraction left inside its alias lists.
export const ALIAS_NOISE_ZH = /圖|比較|參與|連接|走在|訊息|又稱|的|^(?:同側|對側|和)/;
export const ALIAS_NOISE_EN = /\bvs\.?\s|^the\s/i;
export const ALIAS_MAX_ZH = 12;
export const isAliasName = a => !(a.zh && (ALIAS_NOISE_ZH.test(a.zh) || a.zh.length > ALIAS_MAX_ZH)) && !(a.en && ALIAS_NOISE_EN.test(a.en));

export const CJK_RUN = /[㐀-鿿]/g;
// Punctuation and spacing are dropped before comparing; → and ／ stay, so a list of structure names joined by arrows is not a sentence.
export const tidy = s => s.replace(/\s+/g, '').replace(/[，。；、：（）()\-—–「」『』【】《》〈〉…·,.;:!?！？"'“”‘’]/g, '');
export const WINDOW = 16, MIN_CJK = 10;

/** Every WINDOW-character run of the notes (with at least MIN_CJK Chinese characters), for O(1) lookup while sliding over site text. */
export function noteWindows(root) {
  const texts = [];
  const neuro = JSON.parse(fs.readFileSync(path.join(root, 'docs/neuro-notes.json'), 'utf8'));
  for (const l of neuro.lectures) for (const p of l.pages) texts.push(p.text);
  for (const s of neuro.structures) for (const x of s.note_excerpts ?? []) texts.push(x.text);
  const paokao = JSON.parse(fs.readFileSync(path.join(root, 'docs/paokao-checklist.json'), 'utf8'));
  for (const item of paokao.items) if (item.context) texts.push(item.context);
  const set = new Set();
  for (const text of texts) {
    const t = tidy(text);
    for (let i = 0; i + WINDOW <= t.length; i++) {const w = t.slice(i, i + WINDOW); if ((w.match(CJK_RUN) ?? []).length >= MIN_CJK) set.add(w);}
  }
  return set;
}

/** Offsets (in the tidied text) where a run of the notes appears in `text`; one hit per run, not per character. */
export function copiedRuns(text, windows) {
  const t = tidy(text), hits = [];
  for (let i = 0; i + WINDOW <= t.length; i++) if (windows.has(t.slice(i, i + WINDOW))) {hits.push(i); i += WINDOW - 1;}
  return hits;
}

/** Source files whose strings reach the site as teaching text (beside docs/neuro-card-text, which the test reads itself). Comment lines are not shipped and are skipped. */
export const SITE_TEXT_FILES = [
  'app/organ/csf-notes.ts', 'app/organ/csf-scene.ts', 'app/organ/brain.tsx', 'app/organ/heart.tsx', 'app/organ/heart-chambers.ts', 'app/organ/heart-vessels.ts',
  'app/organ/brain-facts-cortex1.ts', 'app/organ/brain-facts-cortex2.ts', 'app/organ/brain-facts-deep.ts', 'app/organ/brain-facts-stem.ts', 'app/organ/brain-facts-tracts.ts', 'app/organ/brain-facts-vessels.ts',
  'app/quiz/card-data.ts', 'app/mj-structure-info.ts', 'app/mj-spaces.ts', 'app/mj-muscle-facts-head-neck.ts', 'app/mj-muscle-facts-upper.ts', 'app/mj-muscle-facts-lower.ts', 'app/mj-muscle-facts-trunk.ts', 'app/mj-muscle-facts-parts.ts',
  'app/mj-paokao.json', 'scripts/heart-parts.json', 'public/models/brain/neuro-cards.json',
];
export const stripComments = source => source.split('\n').filter(line => !/^\s*(\/\/|\/\*|\*)/.test(line)).map(line => line.replace(/\s\/\/\s.*$/, '')).join('\n');
