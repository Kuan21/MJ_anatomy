import {nameKey,wordsOf} from './words';
import REVIEWED from './reviewed.json';

/** One recording on Wikimedia Commons: the file URL, who made it, and under which licence. */
export interface Recording{file:string;url:string;author:string;licence:string;licenceUrl?:string;page:string}
export type Accent='uk'|'us';
export interface WordPronunciation{ipa?:Partial<Record<Accent,string>>;audio?:Partial<Record<Accent,Recording>>}
export interface PronunciationData{source:string;fetched:string;words:Record<string,WordPronunciation>}

let loading:Promise<PronunciationData|null>|null=null;
/** public/pronunciation.json (made by scripts/fetch-pronunciation.mjs); null when it cannot be loaded, the buttons then use the browser voice only. */
export function loadPronunciation():Promise<PronunciationData|null>{
 loading??=fetch(`${import.meta.env.BASE_URL}pronunciation.json`).then(r=>r.ok?r.json() as Promise<PronunciationData>:null).catch(()=>null);
 return loading;
}

/** Names whose pronunciation a person has proofread (app/pronunciation/reviewed.json, one normalised name per entry). */
const reviewedSet=new Set((REVIEWED.reviewed as string[]).map(nameKey));
export type Status='reviewed'|'pending';
export interface NameStatus{status:Status;/** why the name still waits for proofreading */reason?:'browser-voice'|'no-ipa'}
/**
 * 已校對: a person marked the name as proofread (reviewed.json, or this browser's own mark), or every word has an IPA from Wiktionary and a free human recording.
 * 發音待校對: anything that would be read by the browser voice, or any word without IPA.
 */
export function statusOf(name:string,data:PronunciationData|null,accent:Accent,mine:boolean):NameStatus{
 if(reviewedSet.has(nameKey(name))||mine)return{status:'reviewed'};
 const words=wordsOf(name);if(!words.length)return{status:'pending',reason:'no-ipa'};
 const entries=words.map(w=>data?.words[w]);
 if(entries.some(e=>!e?.ipa?.[accent]&&!e?.ipa?.[accent==='uk'?'us':'uk']))return{status:'pending',reason:'no-ipa'};
 if(entries.some(e=>!(e?.audio?.[accent]??e?.audio?.[accent==='uk'?'us':'uk'])))return{status:'pending',reason:'browser-voice'};
 return{status:'reviewed'};
}
/** IPA of the whole name, words joined by spaces, when every word has one. */
export function ipaOf(name:string,data:PronunciationData|null,accent:Accent):string|null{
 const parts=wordsOf(name).map(w=>data?.words[w]?.ipa?.[accent]??data?.words[w]?.ipa?.[accent==='uk'?'us':'uk']);
 return parts.length&&parts.every(Boolean)?parts.map(p=>(p as string).replace(/^[/[]|[/\]]$/g,'')).join(' '):null;
}
/** The recordings that make up a name, one per word, or null when any word has none (the browser voice reads the name then). */
export function recordingsOf(name:string,data:PronunciationData|null,accent:Accent):Recording[]|null{
 const rec=wordsOf(name).map(w=>data?.words[w]?.audio?.[accent]??data?.words[w]?.audio?.[accent==='uk'?'us':'uk']);
 return rec.length&&rec.every(Boolean)?rec as Recording[]:null;
}
