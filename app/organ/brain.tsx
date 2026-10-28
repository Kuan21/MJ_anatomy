import {Switch} from '@/components/ui/switch';
import {useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import {ArrowLeft, ChevronDown, ChevronRight, Eye, EyeOff, RotateCcw} from 'lucide-react';
import {createBrainViewer} from './brain-viewer';
import {createCsfScene, CSF_STEPS, type CsfSource} from './csf-scene';
import {CSF_SHORT, CSF_STEP_NOTES} from './csf-notes';
import {BRAIN_GROUPS, buildBrainTree, displayEn, relatedLobes, type BrainTreeNode} from './brain-catalogue';
import {cardMatches, cardParts, loadNotes, type NoteCard, type NoteData} from './brain-notes';
import {factOf, markSharedFacts} from './brain-facts';
import {NoteCardView} from './brain-note-card';
import {SECTION_AXES, type BrainPart, type BrainView, type BrainViewState, type SectionAxis} from './brain-types';
import './organ.css';

const MAX_PEEL = 7;
const DEEP = new Set(['basal', 'diencephalon', 'ventricles']);
const defaults: BrainViewState = {
  hiddenGroups: BRAIN_GROUPS.filter(g => !g.on).map(g => g.id), hiddenParts: [], peel: 0, isolate: null, selectedIds: [],
  section: {axis: 'none', offset: .5, flip: false}, command: {id: 0, view: 'front'},
};
const AXES: SectionAxis[] = ['none', 'sagittal', 'coronal', 'horizontal'];
/** Each cut removes the half that faces the camera that looks into it: sagittal from the body's right, coronal from the front, horizontal from above. */
const CUT: Record<Exclude<SectionAxis, 'none'>, {flip: boolean; view: BrainView}> = {sagittal: {flip: false, view: 'right'}, coronal: {flip: true, view: 'front'}, horizontal: {flip: true, view: 'top'}};
const SIDE_ZH = {left: '左', right: '右', mid: '正中'} as const;

function BrainScene({view, exportRef, onReady, onError, onProgress, onPick, onBusy}: {
  view: BrainViewState; exportRef: {current: (() => CsfSource | null) | null}; onReady: (parts: BrainPart[]) => void; onError: (m: string) => void; onProgress: (p: number) => void; onPick: (id: string | null) => void; onBusy: (busy: boolean) => void;
}) {
  const host = useRef<HTMLDivElement>(null), viewer = useRef<ReturnType<typeof createBrainViewer> | null>(null);
  const callbacks = useRef({onReady, onError, onProgress, onPick, onBusy}); callbacks.current = {onReady, onError, onProgress, onPick, onBusy};
  const latest = useRef(view); latest.current = view;
  useEffect(() => {
    try {
      viewer.current = createBrainViewer(host.current!, {
        progress: p => callbacks.current.onProgress(p), ready: parts => {callbacks.current.onReady(parts); viewer.current?.update(latest.current);},
        error: m => callbacks.current.onError(m), pick: id => callbacks.current.onPick(id), busy: b => callbacks.current.onBusy(b),
      });
      exportRef.current = () => viewer.current?.exportForCsf() ?? null;
      viewer.current.update(latest.current);
    } catch {callbacks.current.onError('無法啟動 3D 顯示。請改用支援 WebGL 的瀏覽器開啟。');}
    return () => {viewer.current?.dispose(); viewer.current = null;};
  }, []);
  useEffect(() => {viewer.current?.update(view);}, [view]);
  return <div className="organ-canvas" ref={host}/>;
}

/** CSF flow as a full-page mode: animation on the left (3/4), step-synchronised lecture notes on the right (1/4), stacked on a portrait phone.
 *  The brain viewer stays mounted underneath, so closing returns to exactly the same view, section and selection. */
function CsfPage({exportRef, onClose}: {exportRef: {current: (() => CsfSource | null) | null}; onClose: () => void}) {
  const host = useRef<HTMLDivElement>(null), [step, setStep] = useState(0), [failed, setFailed] = useState(false), [follow, setFollow] = useState(false);
  const csf = useRef<ReturnType<typeof createCsfScene> | null>(null);
  useEffect(() => {
    const source = exportRef.current?.();
    if (!source || !host.current) {setFailed(true); return;}
    try {const scene = createCsfScene(host.current, source, setStep, {particles: 2600, detail: 1.6, pixelRatio: 2}); csf.current = scene; return () => {scene.dispose(); csf.current = null;};} catch {setFailed(true);}
  }, [exportRef]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {if (e.key === 'Escape') onClose();};
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [onClose]);
  const info = CSF_STEPS[step], notes = CSF_STEP_NOTES[step];
  return <div className="csf-page" role="dialog" aria-label="腦脊髓液流向" lang="zh-Hant">
    <header className="csf-page-head"><strong>CSF 流向<small>Cerebrospinal fluid flow</small></strong><button className="csf-close" onClick={onClose} aria-label="關閉 CSF 流向，回到腦部模式">關閉</button></header>
    <div className="csf-page-body">
      <section className="csf-canvas" ref={host} aria-label="CSF 流向動畫">{failed && <p className="organ-error">動畫無法啟動（需要先載入腦部模型與 WebGL）。</p>}
        <div className="csf-tracer-controls" role="group" aria-label="追蹤組"><span className="csf-tracer-dot" aria-hidden="true"/><span>追蹤組｜Tracer</span><button onClick={() => csf.current?.restart()}>Restart｜重新開始</button><label><input type="checkbox" checked={follow} onChange={e => {setFollow(e.target.checked); csf.current?.setFollow(e.target.checked);}}/>鏡頭跟隨</label></div></section>
      <aside className="csf-side" aria-live="polite">
        <ol className="csf-steps" aria-label="流向步驟">{CSF_STEPS.map((s, i) => <li key={s.en} className={i === step ? 'now' : i < step ? 'done' : ''} aria-current={i === step ? 'step' : undefined}><b>{i + 1}</b><span lang="en">{CSF_SHORT[i][0]}</span><small>{CSF_SHORT[i][1]}</small></li>)}</ol>
        <div className="csf-detail">
          <p className="csf-stepno">步驟 {step + 1} / {CSF_STEPS.length}<span className="csf-event">{notes.event}</span></p>
          <h2 lang="en">{info.en}</h2>
          <p className="csf-zh" lang="zh-Hant">{info.zh}</p>
          <dl>
            <dt>所在位置</dt><dd>{notes.where}</dd>
            <dt>CSF 在這裡</dt><dd><ul>{notes.happens.map(n => <li key={n}>{n}</li>)}</ul></dd>
            {notes.clinical.length > 0 && <><dt>臨床相關</dt><dd><ul>{notes.clinical.map(n => <li key={n}>{n}</li>)}</ul></dd></>}
          </dl>
        </div>
        <footer className="csf-foot">孔道、腦池、蛛網膜下腔、脊髓與腰池為示意模型。<b>脊髓段縮短，未依比例。</b></footer>
      </aside>
    </div>
  </div>;
}

export default function BrainDetail() {
  const [view, setView] = useState<BrainViewState>(defaults);
  const [parts, setParts] = useState<BrainPart[]>([]), [ready, setReady] = useState(false), [error, setError] = useState(''), [percent, setPercent] = useState(0);
  const [open, setOpen] = useState<string[]>([]), [csf, setCsf] = useState(false), [allOpen, setAllOpen] = useState(false), [allSort, setAllSort] = useState<'name' | 'region'>('name'), [cutBusy, setCutBusy] = useState(false);
  const [notes, setNotes] = useState<NoteData | null>(null), [noteId, setNoteId] = useState<string | null>(null), [query, setQuery] = useState(''), [openRegions, setOpenRegions] = useState<string[]>([]);
  const exportRef = useRef<(() => CsfSource | null) | null>(null);
  useEffect(() => {document.title = csf ? 'CSF 流向 · MJ Anatomy' : '腦部詳細模式 · MJ Anatomy';}, [csf]);
  useEffect(() => {loadNotes().then(setNotes).catch(() => setNotes(null));}, []);
  const byId = useMemo(() => new Map(parts.map(p => [p.id, p])), [parts]);
  const selected = view.selectedIds.length === 1 ? byId.get(view.selectedIds[0]) : undefined;
  const patch = (next: Partial<BrainViewState>) => setView(v => ({...v, ...next}));
  const go = (name: BrainView, focus?: string[]) => setView(v => ({...v, command: {id: v.command.id + 1, view: name, focus}}));
  const select = (id: string | null) => {
    setNoteId(null);
    if (!id) {patch({selectedIds: []}); return;}
    const p = byId.get(id);
    setView(v => ({...v, selectedIds: v.selectedIds.length === 1 && v.selectedIds[0] === id ? [] : [id], hiddenGroups: p ? v.hiddenGroups.filter(g => g !== p.group) : v.hiddenGroups, hiddenParts: v.hiddenParts.filter(x => x !== id)}));
  };
  const choose = (id: string) => {
    const same = view.selectedIds.length === 1 && view.selectedIds[0] === id;
    select(id);
    if (!same) go('fit', [id]);
  };
  const cardById = useMemo(() => new Map((notes?.cards ?? []).map(c => [c.id, c])), [notes]);
  const noteCard = noteId ? cardById.get(noteId) : undefined;
  const openNote = (card: NoteCard) => {
    const exact = cardParts(card, parts), near = exact.length ? exact : cardParts(card, parts, true);
    setNoteId(card.id);
    setView(v => ({...v, selectedIds: near, isolate: null, hiddenGroups: v.hiddenGroups.filter(g => !near.some(id => byId.get(id)?.group === g)), hiddenParts: v.hiddenParts.filter(x => !near.includes(x)), command: near.length ? {id: v.command.id + 1, view: 'fit', focus: near} : v.command}));
  };
  const plain = (z: string) => z.replace(/^[左右]/, '');
  // the related cards never list the structure itself
  const partNotes = selected && notes ? (notes.partCards[selected.en] ?? []).map(id => cardById.get(id)).filter((c): c is NoteCard => !!c && c.en.toLowerCase() !== selected.en.toLowerCase() && plain(c.zh) !== plain(selected.zh)) : [];
  const q = query.trim().toLowerCase();
  const foundParts = q ? parts.filter(p => p.en.toLowerCase().includes(q) || p.zh.toLowerCase().includes(q)) : [];
  const foundNotes = q && notes ? notes.cards.filter(c => cardMatches(c, q)) : [];
  const regionGroups = useMemo(() => notes ? Object.entries(notes.regions).map(([id, label]) => ({id, label, cards: notes.cards.filter(c => c.region === id)})).filter(r => r.cards.length) : [], [notes]);
  const noteRow = (c: NoteCard) => <li key={c.id} className="organ-part-row"><button className="note-row" aria-pressed={noteId === c.id} onClick={() => openNote(c)}><span lang="en">{c.en}</span><small lang="zh-Hant">{c.zh}{c.mesh?.length || c.approx?.length ? '' : '　〔模型未有〕'}</small></button></li>;
  const toggleGroup = (id: string) => patch({hiddenGroups: view.hiddenGroups.includes(id) ? view.hiddenGroups.filter(g => g !== id) : [...view.hiddenGroups, id]});
  const togglePart = (id: string) => patch({hiddenParts: view.hiddenParts.includes(id) ? view.hiddenParts.filter(x => x !== id) : [...view.hiddenParts, id]});
  const grouped = useMemo(() => BRAIN_GROUPS.map(g => ({...g, parts: parts.filter(p => p.group === g.id).sort((a, b) => a.en.localeCompare(b.en) || a.side.localeCompare(b.side))})).filter(g => g.parts.length), [parts]);
  const tree = useMemo(() => buildBrainTree(parts), [parts]);
  const regionOrder = useMemo(() => {const m = new Map<string, number>(); let i = 0; const walk = (n: BrainTreeNode) => {n.leaf.forEach(p => m.set(p.id, i++)); n.children.forEach(walk);}; tree.forEach(walk); return m;}, [tree]);
  const groupLabel = (p: BrainPart) => {const g = BRAIN_GROUPS.find(x => x.id === p.group); return g ? g.zh : '';};
  const partVisible = (p: BrainPart) => !view.hiddenParts.includes(p.id) && !view.hiddenGroups.includes(p.group);
  /** Switching a node switches everything below it; the other members of a hidden group stay as they were. */
  const setNodeVisible = (list: BrainPart[], on: boolean) => {
    const ids = new Set(list.map(p => p.id));
    if (!on) {patch({hiddenParts: [...new Set([...view.hiddenParts, ...ids])], isolate: null}); return;}
    const groups = new Set(list.filter(p => view.hiddenGroups.includes(p.group)).map(p => p.group));
    const keep = parts.filter(p => groups.has(p.group) && !ids.has(p.id)).map(p => p.id);
    patch({hiddenGroups: view.hiddenGroups.filter(g => !groups.has(g)), hiddenParts: [...new Set([...view.hiddenParts.filter(x => !ids.has(x)), ...keep])], isolate: null});
  };
  const renderNode = (n: BrainTreeNode, depth: number): ReactNode => {
    const expanded = open.includes(n.id), some = n.all.some(partVisible);
    return <div className="organ-group" key={n.id}>
      <div className={`system-row organ-group-row ${some ? 'enabled' : ''}`}>
        <button className="row-arrow" aria-expanded={expanded} aria-label={`${expanded ? '收合' : '展開'}${n.zh}`} onClick={() => setOpen(o => expanded ? o.filter(x => x !== n.id) : [...o, n.id])}>{expanded ? <ChevronDown size={13}/> : <ChevronRight size={13}/>}</button>
        <button className="system-name" onClick={() => setOpen(o => expanded ? o.filter(x => x !== n.id) : [...o, n.id])} aria-expanded={expanded}><span className="system-dot" style={{background: depth === 0 ? '#8aa0ad' : '#b6c3cb'}}/><span lang="en">{n.en}<small lang="zh-Hant">{n.zh}</small></span><span className="system-count">{n.all.length}</span></button>
        <Switch checked={some} onCheckedChange={() => setNodeVisible(n.all, !some)} aria-label={`${some ? '隱藏' : '顯示'}${n.zh}`}/>
      </div>
      {expanded && <div className="organ-subtree">
        {n.children.map(c => renderNode(c, depth + 1))}
        {n.leaf.length > 0 && <ul>{n.leaf.map(p => <li key={p.id} className="organ-part-row">
          <button aria-pressed={view.selectedIds.includes(p.id)} onClick={() => choose(p.id)}><span lang="en">{displayEn(p)}</span><small lang="zh-Hant">{p.zh}{p.schematic ? '　〔示意〕' : ''}</small></button>
          <button className="organ-eye" aria-label={`${partVisible(p) ? '隱藏' : '顯示'}${displayEn(p)}`} onClick={() => setNodeVisible([p], !partVisible(p))}>{partVisible(p) ? <Eye size={14}/> : <EyeOff size={14}/>}</button>
        </li>)}</ul>}
      </div>}
    </div>;
  };
  const section = view.section;
  const chooseAxis = (axis: SectionAxis) => {
    if (axis === 'none') {patch({section: {...section, axis}}); return;}
    setView(v => ({...v, section: {axis, offset: .5, flip: CUT[axis].flip}, command: {id: v.command.id + 1, view: CUT[axis].view}}));
  };
  const reset = () => setView(v => ({...defaults, command: {id: v.command.id + 1, view: 'front'}}));

  return <main className="organ-app" lang="zh-Hant">
    <header className="organ-header">
      <a className="organ-back" href="#/" aria-label="返回圖譜"><ArrowLeft size={18}/><span>返回圖譜</span></a>
      <div className="organ-brand">MJ Anatomy <span>腦部詳細模式</span></div>
      <button className="csf-toggle" aria-pressed={csf} disabled={!ready} onClick={() => setCsf(v => !v)}>CSF 流向</button>
    </header>
    <div className="organ-layout" inert={csf || undefined} aria-hidden={csf || undefined}>
      <aside className="organ-left" aria-label="腦部構造清單">
        <div className="organ-left-body">
          <div className="organ-segmented" role="group" aria-label="全部開關">
            <button onClick={() => patch({hiddenGroups: [], hiddenParts: [], isolate: null})}>全部開啟</button>
            <button onClick={() => patch({hiddenGroups: BRAIN_GROUPS.map(g => g.id), isolate: null})}>全部關閉</button>
          </div>
          {parts.some(p => p.schematic) && <div className="organ-segmented" role="group" aria-label="示意構造">
            <button aria-pressed={!!view.isolate && view.isolate.length > 1 && view.isolate.every(id => byId.get(id)?.schematic || DEEP.has(byId.get(id)?.group ?? ''))} onClick={() => {if (view.isolate) {patch({isolate: null}); return;} const ids = parts.filter(p => p.schematic || DEEP.has(p.group)).map(p => p.id); setView(v => ({...v, isolate: ids, command: {id: v.command.id + 1, view: 'fit', focus: ids}}));}}>只看深部與示意構造（{parts.filter(p => p.schematic).length}）</button>
          </div>}
          <label className="organ-search"><span className="sr-only">搜尋構造</span><input type="search" value={query} placeholder="Search｜搜尋" onChange={e => setQuery(e.target.value)}/></label>
          {!ready && <p className="organ-info-empty">載入中…</p>}
          {q ? <div className="organ-results" aria-live="polite">
            <h3>模型構造（{foundParts.length}）</h3>
            <ul>{foundParts.slice(0, 60).map(p => <li key={p.id} className="organ-part-row"><button aria-pressed={view.selectedIds.includes(p.id)} onClick={() => choose(p.id)}><span lang="en">{displayEn(p)}</span><small lang="zh-Hant">{p.zh}</small></button></li>)}</ul>
            {foundParts.length > 60 && <p className="organ-info-empty">還有 {foundParts.length - 60} 個，請輸入更多字。</p>}
            <h3>其他構造（{foundNotes.length}）</h3>
            <ul>{foundNotes.slice(0, 80).map(noteRow)}</ul>
            {foundNotes.length > 80 && <p className="organ-info-empty">還有 {foundNotes.length - 80} 個，請輸入更多字。</p>}
            {!foundParts.length && !foundNotes.length && <p className="organ-info-empty">找不到符合的構造。</p>}
          </div> : <>
          <button className="organ-all-toggle" aria-expanded={allOpen} onClick={() => setAllOpen(v => !v)}><span lang="en">All structures<small lang="zh-Hant">全部構造</small></span><b>{parts.length}</b>{allOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}</button>
          {allOpen ? <div className="organ-all">
            <div className="organ-segmented" role="group" aria-label="排序"><button aria-pressed={allSort === 'name'} onClick={() => setAllSort('name')}>依名稱</button><button aria-pressed={allSort === 'region'} onClick={() => setAllSort('region')}>依分區</button></div>
            <ul>{[...parts].sort((a, b) => allSort === 'region' ? (regionOrder.get(a.id) ?? 0) - (regionOrder.get(b.id) ?? 0) || displayEn(a).localeCompare(displayEn(b)) : displayEn(a).localeCompare(displayEn(b))).map(p => {
              const fact = factOf(p);
              return <li key={p.id} className="organ-part-row"><button aria-pressed={view.selectedIds.includes(p.id)} onClick={() => choose(p.id)}><span lang="en">{displayEn(p)}</span><small lang="zh-Hant">{p.zh}{allSort === 'region' ? '' : `　${groupLabel(p)}`}{!fact ? '　〔資料待補〕' : fact.shared ? '　〔共用說明〕' : ''}{p.schematic ? '　〔示意〕' : ''}</small></button></li>;
            })}</ul>
          </div> : tree.map(n => renderNode(n, 0))}
          {regionGroups.length > 0 && <div className="organ-notes-list">
            <h3>構造資訊卡<small>「模型未有」者只有資訊卡</small></h3>
            {regionGroups.map(r => {
              const expanded = openRegions.includes(r.id);
              return <div className="organ-group" key={r.id}>
                <div className="organ-group-row"><button className="organ-group-head" onClick={() => setOpenRegions(o => expanded ? o.filter(x => x !== r.id) : [...o, r.id])} aria-expanded={expanded}><span lang="zh-Hant">{r.label}</span><b>{r.cards.length}</b></button>
                  <button className="organ-expand" aria-expanded={expanded} aria-label={`${expanded ? '收合' : '展開'}${r.label}`} onClick={() => setOpenRegions(o => expanded ? o.filter(x => x !== r.id) : [...o, r.id])}>{expanded ? <ChevronDown size={15}/> : <ChevronRight size={15}/>}</button></div>
                {expanded && <ul>{r.cards.map(noteRow)}</ul>}
              </div>;
            })}
          </div>}
          </>}
        </div>
      </aside>
      <section className="organ-stage" aria-label="腦部 3D 模型">
        <BrainScene view={view} exportRef={exportRef} onReady={p => {markSharedFacts(p.map(q => q.en)); setParts(p); setReady(true);}} onError={setError} onProgress={setPercent} onPick={select} onBusy={setCutBusy}/>
        <div className="organ-views" aria-label="視角">{([['front', '前面'], ['back', '後面'], ['left', '左側'], ['right', '右側'], ['top', '上面'], ['bottom', '下面']] as const).map(([id, label]) => <button key={id} onClick={() => go(id)}>{label}</button>)}
          <button onClick={reset} aria-label="還原預設" title="還原預設"><RotateCcw size={15}/></button></div>
        {!ready && !error && <div className="organ-progress" role="status"><span className="organ-spinner"/><strong>載入腦部模型</strong><small>{percent ? `${percent}%` : '…'}</small></div>}
        {cutBusy && <div className="organ-progress" role="status"><span className="organ-spinner"/><strong>正在計算平滑切面</strong><small>第一次切開需要幾秒</small></div>}
        {error && <div className="organ-error stage" role="alert">{error}</div>}
        <p className="organ-hint">拖曳旋轉 · 滾輪／雙指縮放 · 點選構造查看名稱</p>
      </section>
      <aside className="organ-panel" aria-label="腦部控制與說明">
        <section className="organ-block organ-info" aria-live="polite">
          {noteCard && notes ? <NoteCardView card={noteCard} data={notes} hasModel={!!noteCard.mesh?.length} approxModel={!noteCard.mesh?.length && !!noteCard.approx?.length} onFocus={() => openNote(noteCard)} onClose={() => setNoteId(null)}/> : selected ? <>
            <h2 className="organ-info-title" lang="en">{displayEn(selected)}</h2>
            <p className="organ-info-zh" lang="zh-Hant">{selected.zh || '（尚無中文名稱）'}</p>
            <p lang="zh-Hant">分區：{BRAIN_GROUPS.find(g => g.id === selected.group)?.zh}｜{SIDE_ZH[selected.side]}{selected.region && selected.region !== selected.cat ? `｜${selected.region}` : ''}</p>
            {(() => {
              const fact = factOf(selected);
              if (!fact) return <p className="organ-info-empty" lang="zh-Hant">資料待補（此結構尚無位置、功能與血液供應說明）。</p>;
              const rel = fact.rel.map(en => ({en, part: parts.find(q => q.en.toLowerCase() === en.toLowerCase() && (q.side === selected.side || q.side === 'mid' || selected.side === 'mid')) ?? parts.find(q => q.en.toLowerCase() === en.toLowerCase())}));
              return <dl className="organ-facts" lang="zh-Hant">
                <dt>Location｜位置</dt><dd>{fact.loc}</dd>
                <dt>Function｜功能</dt><dd>{fact.fn}</dd>
                <dt>Connections / Relations｜連結／毗鄰</dt><dd className="organ-rel">{rel.map(r => r.part ? <button key={r.en} onClick={() => choose(r.part!.id)}><span lang="en">{displayEn(r.part)}</span></button> : <span key={r.en}>{r.en}</span>)}</dd>
                <dt>Blood supply｜血液供應</dt><dd>{fact.blood}</dd>
                {fact.ba && <><dt>Brodmann area｜Brodmann 分區</dt><dd>{fact.ba}</dd></>}
                {fact.shared && <dd className="organ-shared">此卡是同類結構的共用說明，不是針對這一個結構單獨寫的。</dd>}
              </dl>;
            })()}
            {relatedLobes(selected) && <p lang="zh-Hant">相關腦葉：{relatedLobes(selected)}</p>}
            {selected.schematic ? <p className="organ-info-en" lang="zh-Hant"><b>示意模型</b>：位置與大小依周圍真實構造估算，不是實測形狀。</p> : <p className="organ-info-en" lang="en">Group: {BRAIN_GROUPS.find(g => g.id === selected.group)?.en}</p>}
            <div className="organ-actions" role="group" aria-label="選取動作">
              <button onClick={() => go('fit', [selected.id])}>Focus</button>
              <button aria-pressed={!!view.isolate} onClick={() => patch({isolate: view.isolate ? null : [selected.id]})}>Isolate</button>
              <button onClick={() => patch({hiddenParts: [...view.hiddenParts, selected.id], selectedIds: []})}>Hide</button>
              <button onClick={() => patch({selectedIds: [], isolate: null})}>Clear</button>
            </div>
            {partNotes.length > 0 && <div className="note-links"><h3>相關資訊卡</h3>{partNotes.map(c => <button key={c.id} onClick={() => openNote(c)}><span lang="en">{c.en}</span><small lang="zh-Hant">{c.zh}</small></button>)}</div>}
          </> : view.selectedIds.length > 1 ? <p>已選取 {view.selectedIds.length} 個構造。<button className="organ-clear" onClick={() => patch({selectedIds: []})}>取消選取</button></p>
            : <p className="organ-info-empty">點選模型或清單中的構造，會顯示名稱與分區。</p>}
        </section>
        <section className="organ-block">
          <h2>切面<small>Section</small></h2>
          <div className="organ-segmented" role="group" aria-label="切面方向">{AXES.map(axis => <button key={axis} aria-pressed={section.axis === axis} onClick={() => chooseAxis(axis)}>{axis === 'none' ? '不切' : SECTION_AXES[axis].zh}</button>)}</div>
          {section.axis !== 'none' && <>
            <label className="organ-slider"><span lang="en">{SECTION_AXES[section.axis].en}</span> · {SECTION_AXES[section.axis].cut} · 位置 {Math.round(section.offset * 100)}%
              <input type="range" min={0} max={100} value={Math.round(section.offset * 100)} aria-label="切面位置" onChange={e => patch({section: {...section, offset: +e.target.value / 100}})}/></label>
            <label className="organ-check"><input type="checkbox" checked={section.flip} onChange={e => patch({section: {...section, flip: e.target.checked}})}/>切除另一側</label>
            <small>切面為實心截面：灰質（皮質）在外圈、白質在內；灰質厚度為示意。拖動滑桿即時更新；點選切面上的區域可選取該構造。</small>
          </>}
        </section>
        <section className="organ-block">
          <h2>逐層剝離<small>Layers</small></h2>
          <div className="organ-segmented" role="group" aria-label="逐層剝離">
            <button disabled={view.peel <= 0} onClick={() => patch({peel: Math.max(0, view.peel - 1)})}>Layer back</button>
            <button disabled={view.peel >= MAX_PEEL} onClick={() => patch({peel: Math.min(MAX_PEEL, view.peel + 1)})}>Peel deeper</button>
          </div>
          <small>由外而內：腦膜 → 皮質與小腦 → 腦幹 → 白質 → 基底核 → 間腦 → 腦室。目前已剝除 {view.peel} 層；血管與腦神經不受影響。</small>
        </section>
        <section className="organ-block organ-note">
          <h2>模型範圍</h2>
          <p>皮質各葉、腦溝與腦迴、小腦、腦幹、白質纖維束、基底核、間腦、腦室與脈絡叢、腦神經根部、腦動脈（含 Willis 環）、靜脈竇與硬腦膜反摺。已移除脊髓與脊神經等不屬於腦的構造。</p>
          <p className="organ-source">來源：Brain Project（Z-Anatomy / BodyParts3D），CC BY-SA 4.0。切面灰白質分界為依皮質表面向內約 2.4 mm 產生的示意（體素 0.9 mm，以平滑場取等值面）。</p>
        </section>
      </aside>
    </div>
    {csf && <CsfPage exportRef={exportRef} onClose={() => setCsf(false)}/>}
  </main>;
}
