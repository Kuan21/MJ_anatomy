import {memo,useDeferredValue,useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Combobox,ComboboxInput,ComboboxContent,ComboboxList,ComboboxItem,ComboboxEmpty} from '@/components/ui/combobox';
import type {Concept} from './anatomy';
import {querySearchIndex,type SearchEntry} from './mj-search';

export const SEARCH_LIMIT=50,SEARCH_DEBOUNCE_MS=150;
/** Per-keystroke timings (ms), kept for measurement: echo = key press → typed text on screen, results = key press → results rendered. */
export const searchMetrics={echo:[] as number[],results:[] as number[]};
if(typeof window!=='undefined')(window as unknown as {__mjSearchMetrics:typeof searchMetrics}).__mjSearchMetrics=searchMetrics;
const keep=(list:number[],value:number)=>{list.push(value);if(list.length>400)list.shift();};
const SUGGESTIONS=['heart','brain','liver','stomach','spleen','pancreas','urinary bladder','trachea'];

interface Props{index:SearchEntry[]|null;onChoose:(concept:Concept)=>void;onClose:()=>void}

/**
 * Find-a-structure panel. It owns its own state, so typing re-renders only this panel (never the 3D scene, the layer list or the motion
 * panel). The text field echoes every keystroke at once; the search itself is debounced (150 ms), skipped while an IME is composing
 * (compositionstart → compositionend), runs against a prebuilt index and shows at most 50 results. Nothing in the 3D view changes until
 * a result is chosen.
 */
function SearchPanel({index,onChoose,onClose}:Props){
 const [typed,setTyped]=useState(''),[query,setQuery]=useState(''),composing=useRef(false),timer=useRef<ReturnType<typeof setTimeout>>(undefined),keyAt=useRef(0),resultsAt=useRef(0);
 const deferred=useDeferredValue(query);
 const commit=(value:string)=>{clearTimeout(timer.current);timer.current=setTimeout(()=>{timer.current=undefined;setQuery(value);},SEARCH_DEBOUNCE_MS);};
 const change=(value:string)=>{keyAt.current=performance.now();resultsAt.current=keyAt.current;setTyped(value);if(!composing.current)commit(value);};
 useLayoutEffect(()=>{if(keyAt.current){keep(searchMetrics.echo,performance.now()-keyAt.current);}},[typed]);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 const items=useMemo(()=>{
  if(!index)return[] as SearchEntry[];
  const q=deferred.trim();
  if(!q){const by=new Map(index.map(e=>[e.concept.name.toLowerCase(),e]));return SUGGESTIONS.map(n=>by.get(n)).filter((e):e is SearchEntry=>!!e);}
  return querySearchIndex(index,q,SEARCH_LIMIT);
 },[index,deferred]);
 useEffect(()=>{if(resultsAt.current){keep(searchMetrics.results,performance.now()-resultsAt.current);resultsAt.current=0;}},[items]);
 return <section className="search-panel glass" aria-label="Find anatomy"><div className="panel-heading"><span>Find a structure</span><Button variant="ghost" className="icon-button" onClick={onClose} aria-label="Close search"><X size={18}/></Button></div>
  <Combobox<SearchEntry> items={items} value={null} onValueChange={entry=>{if(entry)onChoose(entry.concept);}} inputValue={typed} onInputValueChange={change} itemToStringLabel={e=>e.english} filter={null} open onOpenChange={open=>{if(!open)onClose();}}>
   <ComboboxInput autoFocus placeholder="Heart, femur, median nerve, 正中神經…" aria-label="Search named anatomical structures" showTrigger={false}
    onCompositionStart={()=>{composing.current=true;clearTimeout(timer.current);}} onCompositionEnd={e=>{composing.current=false;commit((e.target as HTMLInputElement).value);}}/>
   <ComboboxContent className="anatomy-search-results"><ComboboxEmpty>{index?'No structures match your search.':'正在建立搜尋索引…'}</ComboboxEmpty>
    <ComboboxList>{(e:SearchEntry)=><ComboboxItem key={e.concept.id} value={e}><span className="search-result-name">{e.english}{e.chinese&&<small>{e.chinese}</small>}</span><span className="small-number">{e.kind??`${e.concept.elements.length} ${e.concept.elements.length===1?'piece':'pieces'}`}</span></ComboboxItem>}</ComboboxList>
   </ComboboxContent></Combobox>
  <p className="search-note">{query?`Showing up to ${SEARCH_LIMIT} matches. Refine your search to find smaller structures.`:'Start with a major organ, or search every named structure.'}</p></section>;
}
export default memo(SearchPanel);
