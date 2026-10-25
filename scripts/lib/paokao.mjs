// The user's course-summary checklist (docs/paokao-checklist.json, 574 terms cut out of the notes) turned into full structure names, and matched to the viewer.
// docs/paokao-names.json holds what the automatic reading gets wrong: names cut off by a line break in the notes, joined alternatives (a./v.), and the terms that are not structures.
import fs from 'node:fs';
const root = new URL('../../', import.meta.url);
export const checklist = JSON.parse(fs.readFileSync(new URL('docs/paokao-checklist.json', root), 'utf8'));
export const overrides = JSON.parse(fs.readFileSync(new URL('docs/paokao-names.json', root), 'utf8'));
const SUFFIX = {m: 'muscle', n: 'nerve', a: 'artery', v: 'vein', br: 'branch', lig: 'ligament', aa: 'arteries'};
const PREFIX = {post: 'posterior', ant: 'anterior', sup: 'superior', inf: 'inferior', med: 'medial', lat: 'lateral'};
/** Spell out the lecture abbreviations (a./v./n./m./lig./br., Post./Sup./…) and drop list letters. */
export function spellOut(text) {
  const t = text.replace(/^\s*(?:[A-Za-z]|[ivx]+)\.\s+/, '').replace(/\.$/, '');
  return t.split(/\s*\/\s*/).map(x => x.trim().split(/\s+/).map((w, i, all) => {
    const k = w.replace(/\.$/, '').toLowerCase();
    if (i === all.length - 1 && SUFFIX[k]) return SUFFIX[k];
    if (k === 'br' || (w.endsWith('.') && SUFFIX[k])) return SUFFIX[k] ?? 'branch';
    if (k === 'lig') return 'ligament';
    if (PREFIX[k]) return PREFIX[k];
    return w.replace(/\.$/, '');
  }).join(' '));
}
/** Each checklist item as {index, term, section, context, names[], skip?, partOf?, note?}. */
export function resolvedItems() {
  return checklist.items.map((item, index) => {
    const o = overrides[index] ?? {};
    return {index, term: item.en, section: item.section, context: item.context, names: o.names ?? (o.skip ? [] : spellOut(item.en)), skip: o.skip, partOf: o.partOf, note: o.note, curated: !!overrides[index]};
  });
}
