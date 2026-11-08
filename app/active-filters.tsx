import {X} from 'lucide-react';

export interface FilterChip{id:string;label:string;onClear:()=>void}

/** 目前讓結構「看不到」的篩選，一眼看清楚，並可個別或一次清除。沒有任何篩選時不顯示。 */
export default function ActiveFilters({chips}:{chips:FilterChip[]}){
 if(!chips.length)return null;
 return <div className="active-filters" role="group" aria-label="目前篩選">
  <span className="active-filters-title">目前篩選</span>
  {chips.map(c=><button type="button" key={c.id} className="active-filter-chip" onClick={c.onClear} aria-label={`清除：${c.label}`} title="按一下清除"><span>{c.label}</span><X size={13} aria-hidden="true"/></button>)}
  {chips.length>1&&<button type="button" className="active-filter-clear" onClick={()=>chips.forEach(c=>c.onClear())}>全部清除</button>}
 </div>;
}
