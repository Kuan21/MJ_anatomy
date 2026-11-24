import {Check, ChevronDown, ChevronRight} from 'lucide-react';
import type {ReactNode} from 'react';
import {QUIZ_CATEGORIES, QUIZ_REGIONS, regionGroups, type QuizCategory, type QuizRegionDef, type QuizRegionId} from './catalogue';

/** The region/section picker and the kind-of-structure picker, shared by the Quiz setup and the mock exam setup. The lists come from the question data. */
/** The grouped, two-column layout of every region chooser (Quiz setup, mock exam, learn): 區域 then 器官, one tile per region, drawn by `tile`. The groups come from the question data. */
export function RegionGroups({tile}: {tile: (r: QuizRegionDef) => ReactNode}) {
  return <div className="quiz-region-groups">{regionGroups().map(g => <section key={g.id} className="quiz-region-group" data-group={g.id} aria-label={g.label}>
    <h3 className="quiz-region-group-title">{g.label}<small lang="en">{g.english}</small></h3>
    <div className="quiz-setup-regions">{g.regions.map(tile)}</div>
  </section>)}</div>;
}
export function RegionPicker({regions: picked, open, setOpen, onRegion, onSection}: {regions: Record<string, string[]>; open: string[]; setOpen: (f: (o: string[]) => string[]) => void; onRegion: (id: QuizRegionId) => void; onSection: (id: QuizRegionId, section: string) => void}) {
  return <RegionGroups tile={r => {
    const chosen = picked[r.id], expanded = open.includes(r.id), sections = chosen ?? [];
    return <div key={r.id} className={`setup-region ${chosen ? 'is-on' : ''} ${expanded ? 'is-open' : ''}`} data-region={r.id}>
      <div className="setup-region-row">
        <button type="button" data-slot="quiz-button" className="setup-region-main" aria-pressed={!!chosen} onClick={() => onRegion(r.id)}><span className="quiz-checkbox">{chosen && <Check size={12}/>}</span><span>{r.label}<small>{r.english}</small></span>
          {chosen && <em>{sections.includes('all') ? '整區' : `${sections.length} 個區段`}</em>}</button>
        <button type="button" data-slot="quiz-button" className="setup-expand" aria-expanded={expanded} aria-label={`${r.label}的區段`} onClick={() => setOpen(o => o.includes(r.id) ? o.filter(x => x !== r.id) : [...o, r.id])}>{expanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}</button>
      </div>
      {expanded && <div className="setup-sections" role="group" aria-label={`${r.label}的區段`}>{r.sections.map(sec => <button type="button" data-slot="quiz-button" key={sec.id} aria-pressed={sections.includes(sec.id)} onClick={() => onSection(r.id, sec.id)}><span className="quiz-checkbox">{sections.includes(sec.id) && <Check size={12}/>}</span>{sec.id === 'all' ? `整個${r.label}` : sec.label}</button>)}</div>}
    </div>;
  }}/>;
}
/** Toggles a section in a region choice: 'all' is the whole region, ticking every real section is the whole region too, and a region with nothing ticked is dropped. */
export function toggleSectionIn(regions: Record<string, string[]>, id: QuizRegionId, section: string): Record<string, string[]> {
  const out = {...regions}, now = out[id] ?? [];
  let next = section === 'all' ? (now.includes('all') ? [] : ['all']) : now.includes(section) ? now.filter(x => x !== section) : [...now.filter(x => x !== 'all'), section];
  const real = QUIZ_REGIONS[id].sections.filter(x => x.id !== 'all').length;
  if (next.length >= real && !next.includes('all')) next = ['all'];
  if (next.length) out[id] = next; else delete out[id];
  return out;
}
export function toggleRegionIn(regions: Record<string, string[]>, id: QuizRegionId): Record<string, string[]> {
  const out = {...regions}; if (out[id]) delete out[id]; else out[id] = ['all']; return out;
}
export function CategoryPicker({value, onChange, count}: {value: QuizCategory[]; onChange: (next: QuizCategory[]) => void; count: (c: QuizCategory) => number | null}) {
  return <div className="quiz-system-grid quiz-category-grid">{QUIZ_CATEGORIES.map(c => {
    const on = value.includes(c.id), n = count(c.id);
    return <button type="button" data-slot="quiz-button" key={c.id} data-category={c.id} aria-pressed={on} disabled={n === 0} onClick={() => onChange(on ? value.filter(x => x !== c.id) : [...value, c.id])}><i style={{background: c.color}}/><span>{c.label}<small>{c.english}</small></span>{n !== null && <span className="quiz-count">{n}</span>}<span className="quiz-checkbox">{on && <Check size={12}/>}</span></button>;
  })}</div>;
}
