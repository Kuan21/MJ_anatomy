/** Info cards for brain structures (public/models/brain/neuro-cards.json, written by scripts/prepare-neuro-notes.mjs from the structure list and the texts in docs/neuro-card-text/). */
import type {BrainPart} from './brain-types';

export interface NoteField {label: string; items: string[]}
export interface NoteCard {
  id: string; en: string; zh: string; type: string; region: string;
  mesh?: string[]; approx?: string[]; aka?: {en?: string; zh?: string}[]; fields: NoteField[];
}
export interface NoteData {regions: Record<string, string>; typeLabels: Record<string, string>; cards: NoteCard[]; partCards: Record<string, string[]>}

const CORTEX = ['frontal', 'parietal', 'temporal', 'occipital', 'limbic', 'insula', 'cortex-other'];

export async function loadNotes(): Promise<NoteData> {
  const response = await fetch(`${import.meta.env.BASE_URL}models/brain/neuro-cards.json`);
  if (!response.ok) throw new Error('notes');
  return response.json();
}

/** Parts of the brain model a card points at: exact mesh names, "@group:x" for a whole group, "@cortex" for all cortical groups. */
export function cardParts(card: NoteCard, parts: BrainPart[], approx = false): string[] {
  const names = approx ? card.approx ?? [] : card.mesh ?? [], ids = new Set<string>();
  for (const name of names) {
    if (name === '@cortex') parts.filter(p => CORTEX.includes(p.group)).forEach(p => ids.add(p.id));
    else if (name.startsWith('@group:')) parts.filter(p => p.group === name.slice(7)).forEach(p => ids.add(p.id));
    else parts.filter(p => p.en === name).forEach(p => ids.add(p.id));
  }
  return [...ids];
}

/** Case-insensitive match over the English name, Chinese name and every alias. */
export function cardMatches(card: NoteCard, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [card.en, card.zh, ...(card.aka ?? []).flatMap(a => [a.en ?? '', a.zh ?? ''])].some(s => s.toLowerCase().includes(q));
}
