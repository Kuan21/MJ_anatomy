import type {Accent,Recording} from './data';

const LANG:Record<Accent,string>={uk:'en-GB',us:'en-US'};
export const speechSupported=()=>typeof window!=='undefined'&&'speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined';

let audio:HTMLAudioElement|null=null,token=0;
export function stopSpeaking(){token++;audio?.pause();audio=null;if(speechSupported())speechSynthesis.cancel();}

const voiceFor=(accent:Accent)=>{const voices=speechSynthesis.getVoices(),lang=LANG[accent].toLowerCase();return voices.find(v=>v.lang.toLowerCase().replace('_','-')===lang)??voices.find(v=>v.lang.toLowerCase().startsWith('en'));};

/** Plays a whole name: the recordings of its words in turn (Wikimedia Commons), or the browser voice when a word has no free recording. Resolves when it has finished or was stopped. */
export function speakName(name:string,accent:Accent,recordings:Recording[]|null):Promise<'recording'|'browser'|'none'>{
 stopSpeaking();const mine=token;
 if(recordings?.length){
  return recordings.reduce<Promise<void>>((p,r)=>p.then(()=>new Promise<void>(resolve=>{
   if(mine!==token)return resolve();
   const a=new Audio(r.url);audio=a;a.onended=()=>resolve();a.onerror=()=>resolve();void a.play().catch(()=>resolve());
  })),Promise.resolve()).then(()=>'recording' as const);
 }
 if(!speechSupported())return Promise.resolve('none');
 return new Promise(resolve=>{
  const u=new SpeechSynthesisUtterance(name);u.lang=LANG[accent];const v=voiceFor(accent);if(v)u.voice=v;u.rate=.85;
  u.onend=()=>resolve('browser');u.onerror=()=>resolve('browser');speechSynthesis.speak(u);
 });
}
