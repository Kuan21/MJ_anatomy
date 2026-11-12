import {useEffect,useState} from 'react';
import {Volume2} from 'lucide-react';
import {ipaOf,loadPronunciation,recordingsOf,statusOf,type Accent,type PronunciationData} from './data';
import {speakName,speechSupported,stopSpeaking} from './speak';
import {nameKey} from './words';

const ACCENT_KEY='mj-pronunciation-accent',MINE_KEY='mj-pronunciation-reviewed';
const read=(key:string)=>{try{return localStorage.getItem(key);}catch{return null;}};
const write=(key:string,value:string)=>{try{localStorage.setItem(key,value);}catch{/* private window: the choice just is not remembered */}};
const mineSet=()=>{try{return new Set(JSON.parse(read(MINE_KEY)??'[]') as string[]);}catch{return new Set<string>();}};

/** Oxford Learner's and Cambridge: links only, opened in a new tab (nothing is fetched from them). */
const dictionaryLinks=(name:string)=>{const q=encodeURIComponent(name.toLowerCase());return[{label:'Oxford Learner’s',href:`https://www.oxfordlearnersdictionaries.com/search/english/?q=${q}`},{label:'Cambridge',href:`https://dictionary.cambridge.org/search/english/direct/?q=${q}`}];};

/** 聽發音 button for an English structure name: plays Wikimedia Commons recordings word by word, else the browser voice; shows IPA, the proofreading status and dictionary links. */
export function PronounceButton({name}:{name:string}){
 const [data,setData]=useState<PronunciationData|null>(null),[accent,setAccent]=useState<Accent>(()=>read(ACCENT_KEY)==='us'?'us':'uk'),[playing,setPlaying]=useState(false),[note,setNote]=useState(''),[mine,setMine]=useState(()=>mineSet().has(nameKey(name))),[open,setOpen]=useState(false);
 useEffect(()=>{let alive=true;void loadPronunciation().then(d=>{if(alive)setData(d);});return()=>{alive=false;stopSpeaking();};},[]);
 useEffect(()=>{setMine(mineSet().has(nameKey(name)));setNote('');setPlaying(false);stopSpeaking();},[name]);
 const status=statusOf(name,data,accent,mine),ipa=ipaOf(name,data,accent),recordings=recordingsOf(name,data,accent);
 const play=async()=>{
  if(playing){stopSpeaking();setPlaying(false);return;}
  if(!recordings&&!speechSupported()){setNote('這個瀏覽器不支援語音朗讀。');return;}
  setPlaying(true);setNote('');const used=await speakName(name,accent,recordings);setPlaying(false);
  if(used==='none')setNote('這個瀏覽器不支援語音朗讀。');
 };
 const chooseAccent=(a:Accent)=>{setAccent(a);write(ACCENT_KEY,a);stopSpeaking();setPlaying(false);};
 const toggleMine=()=>{const set=mineSet(),key=nameKey(name);if(set.has(key))set.delete(key);else set.add(key);write(MINE_KEY,JSON.stringify([...set]));setMine(set.has(key));};
 const credits=recordings?[...new Map(recordings.map(r=>[r.file,r])).values()]:[];
 return <div className="pronounce" data-status={status.status}>
  <div className="pronounce-row">
   <button type="button" className="pronounce-play" aria-pressed={playing} onClick={()=>void play()} title={recordings?'播放真人錄音（Wikimedia Commons）':'用瀏覽器語音朗讀'}><Volume2 size={14}/><span>{playing?'停止':'聽發音'}</span></button>
   <span className="pronounce-accent" role="group" aria-label="口音">
    {(['uk','us'] as const).map(a=><button type="button" key={a} aria-pressed={accent===a} onClick={()=>chooseAccent(a)}>{a==='uk'?'英式':'美式'}</button>)}
   </span>
   <span className={`pronounce-status is-${status.status}`} title={status.status==='reviewed'?'發音已有人校對，或每個字都有 Wiktionary 音標與真人錄音':status.reason==='no-ipa'?'有字缺少音標，尚待校對':'由瀏覽器語音朗讀，尚待校對'}>{status.status==='reviewed'?'已校對':'發音待校對'}</span>
   <button type="button" className="pronounce-more" aria-expanded={open} onClick={()=>setOpen(o=>!o)}>{open?'收起':'音標／查字典'}</button>
  </div>
  {open&&<div className="pronounce-detail">
   {ipa?<p className="pronounce-ipa" lang="en-fonipa">/{ipa}/<small>音標：Wiktionary（CC BY-SA）</small></p>:<p className="pronounce-none">這個名稱還沒有音標資料。</p>}
   {credits.length>0&&<p className="pronounce-credit">錄音：{credits.map((r,i)=><span key={r.file}>{i>0&&'；'}<a href={r.page} target="_blank" rel="noreferrer">{r.file}</a>（{r.author}，<a href={r.licenceUrl??r.page} target="_blank" rel="noreferrer">{r.licence}</a>）</span>)}</p>}
   <p className="pronounce-links">查字典：{dictionaryLinks(name).map((l,i)=><span key={l.label}>{i>0&&'、'}<a href={l.href} target="_blank" rel="noreferrer noopener">{l.label}</a></span>)}</p>
   <label className="pronounce-mine"><input type="checkbox" checked={mine} onChange={toggleMine}/>我已核對這個發音（只記在這個瀏覽器）</label>
  </div>}
  {note&&<p className="pronounce-note" role="status">{note}</p>}
 </div>;
}
