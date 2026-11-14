import data from './mj-related-search.json';
import type {SearchEntry} from './mj-search';

/**
 * Related search: a few names people look for that the site does not model as a structure of their own. Searching one of them shows the
 * closest structures the site does have, with a one-line explanation. This is only a search aid: it is not an alias, it is never shown on a
 * structure card, and the Quiz and the synonym tables do not read it.
 */
export interface RelatedEntry{en:string;zh:string;more?:string[];targets:{id:string;name:string}[];reasonZh:string;reasonEn:string}
export const RELATED_ENTRIES=(data as {entries:RelatedEntry[]}).entries;
export const RELATED_NOTE_ZH='站上沒有這個結構本身，以下是最接近的結構';
export const RELATED_NOTE_EN='This structure is not modeled on the site; the closest structure is shown below';

const fold=(s:string)=>s.toLowerCase().replace(/[\s\-–]+/g,'');
/** The related entry a query names exactly (case, spaces and hyphens do not matter), or undefined. */
export function relatedFor(query:string):RelatedEntry|undefined{
 const q=fold(query.trim());
 if(!q)return undefined;
 return RELATED_ENTRIES.find(e=>[e.en,e.zh,...(e.more??[])].some(t=>fold(t)===q));
}
/** The closest structures of a related query, taken from the search index in the order the data lists them. */
export function relatedResults(index:SearchEntry[],query:string):{related:RelatedEntry;entries:SearchEntry[]}|undefined{
 const related=relatedFor(query);
 if(!related)return undefined;
 const byId=new Map(index.map(e=>[e.concept.id,e]));
 const entries=related.targets.map(t=>byId.get(t.id)).filter((e):e is SearchEntry=>!!e);
 return entries.length?{related,entries}:undefined;
}

/** Shown only beside the results of a related search, on structures the brain model files under the cerebellum. */
export const CEREBELLAR_TAG_ZH='小腦結構';
export const CEREBELLAR_TAG_EN='Cerebellar structure';
export const isCerebellar=(e:SearchEntry)=>e.group==='cerebellum';
/**
 * The rows of a related search: the closest structures first, then the ordinary matches, and the cerebellar matches last (the name
 * is shared with a cerebellar structure, e.g. the uvula of the vermis, but it is not what the person meant, so it stays reachable below).
 */
export function relatedRows(related:SearchEntry[],items:SearchEntry[],limit:number):SearchEntry[]{
 const ids=new Set(related.map(e=>e.concept.id)),rest=items.filter(e=>!ids.has(e.concept.id));
 return [...related,...rest.filter(e=>!isCerebellar(e)),...rest.filter(isCerebellar)].slice(0,limit);
}
