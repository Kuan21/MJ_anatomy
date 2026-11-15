import {useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import {ChevronDown, ChevronRight} from 'lucide-react';
import {OrganAllToggle, OrganDetailLayout, OrganGroupNode, OrganLeftColumn, OrganPanel, OrganPartRow, OrganSegmented, OrganStage} from './organ-detail-layout';
import {createBrainViewer, drawnWhenSelected} from './brain-viewer';
import {createCsfScene, CSF_STEPS, type CsfSource} from './csf-scene';
import {CSF_SHORT, CSF_STEP_NOTES} from './csf-notes';
import {BRAIN_GROUPS, buildBrainTree, displayEn, relatedLobes, type BrainTreeNode} from './brain-catalogue';
import {cardMatches, cardParts, loadNotes, type NoteCard, type NoteData} from './brain-notes';
import {cranialQuery, matchesCranial, singularQuery} from '../mj-cranial-search';
import {factOf, markSharedFacts} from './brain-facts';
import {NoteCardView} from './brain-note-card';
import {SECTION_AXES, type BrainPart, type BrainView, type BrainViewState, type SectionAxis} from './brain-types';

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
  // cranial nerve branches outside the skull or on the dura (face, jaw): drawn in full, but off when the view opens or is reset
  const peripheral = useRef<string[]>([]);
  // the groups that were switched off before the glass cortex turned them on (restored when it is turned off)
  const glassHidden = useRef<string[]>([]);
  const toggleGlass = () => {
    const inside = ['white', 'basal', 'diencephalon', 'ventricles'];
    if (view.glass) {
      const back = glassHidden.current; glassHidden.current = [];
      patch({glass: false, hiddenGroups: [...new Set([...view.hiddenGroups, ...back])]});
    } else {
      glassHidden.current = inside.filter(g => view.hiddenGroups.includes(g));
      patch({glass: true, hiddenGroups: view.hiddenGroups.filter(g => !inside.includes(g))});
    }
  };
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
    setView(v => ({...v, selectedIds: v.selectedIds.length === 1 && v.selectedIds[0] === id ? [] : [id]}));
  };
  const choose = (id: string) => {
    // Selecting (model, list, search, related-structure link) never moves the camera or switches layers; the Focus button of the info card does both.
    select(id);
  };
  const focusOn = (id: string) => {
    const p = byId.get(id);
    setView(v => ({...v, hiddenGroups: p ? v.hiddenGroups.filter(g => g !== p.group) : v.hiddenGroups, hiddenParts: v.hiddenParts.filter(x => x !== id), command: {id: v.command.id + 1, view: 'fit', focus: [id]}}));
  };
  // Opened from the atlas search (#/organ/brain?select=<name>): select that structure once the model is ready, then drop the query so a reload does not reselect it.
  useEffect(() => {
    if (!ready) return;
    const wanted = new URLSearchParams(location.hash.split('?')[1] ?? '').get('select');
    if (!wanted) return;
    const norm = (s: string) => s.toLowerCase().replace(/\*/g, '').replace(/^(left|right) /, '').replace(/\s+/g, ' ').trim();
    const side = /^left /i.test(wanted) ? 'left' : /^right /i.test(wanted) ? 'right' : '', target = norm(wanted);
    const hit = parts.find(p => (!side || p.side === side) && [p.en, displayEn(p)].some(n => norm(n) === target));
    history.replaceState(null, '', location.pathname + location.search + '#/organ/brain');
    if (hit) choose(hit.id);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
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
  const cranial = cranialQuery(q);
  const foundParts = q ? parts.filter(p => cranial ? matchesCranial(p.en, cranial) : p.en.toLowerCase().includes(q) || p.zh.toLowerCase().includes(q) || (singularQuery(q) !== q && (p.en.toLowerCase().includes(singularQuery(q)) || p.zh.toLowerCase().includes(singularQuery(q))))) : [];
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
    return <OrganGroupNode key={n.id} en={n.en} zh={n.zh} count={n.all.length} depth={depth} expanded={expanded} visible={some}
      onExpand={() => setOpen(o => expanded ? o.filter(x => x !== n.id) : [...o, n.id])} onVisible={() => setNodeVisible(n.all, !some)}>
      {n.children.map(c => renderNode(c, depth + 1))}
      {n.leaf.length > 0 && <ul>{n.leaf.map(p => <OrganPartRow key={p.id} selected={view.selectedIds.includes(p.id)} en={displayEn(p)} zh={`${p.zh}${p.schematic ? '　〔示意〕' : ''}`} onSelect={() => choose(p.id)} visible={partVisible(p)} onVisible={() => setNodeVisible([p], !partVisible(p))}/>)}</ul>}
    </OrganGroupNode>;
  };
  const section = view.section;
  const chooseAxis = (axis: SectionAxis) => {
    if (axis === 'none') {patch({section: {...section, axis}}); return;}
    setView(v => ({...v, section: {axis, offset: .5, flip: CUT[axis].flip}, command: {id: v.command.id + 1, view: CUT[axis].view}}));
  };
  const reset = () => setView(v => ({...defaults, hiddenParts: peripheral.current, command: {id: v.command.id + 1, view: 'front'}}));

  return <OrganDetailLayout title="腦部詳細模式" labels={{left: '腦部構造清單', stage: '腦部 3D 模型', panel: '腦部控制與說明'}}
    headerActions={<button className="csf-toggle" aria-pressed={csf} disabled={!ready} onClick={() => setCsf(v => !v)}>CSF 流向</button>}
    overlayOpen={csf} overlay={csf && <CsfPage exportRef={exportRef} onClose={() => setCsf(false)}/>}
    left={<OrganLeftColumn onAllOn={() => patch({hiddenGroups: [], hiddenParts: [], isolate: null, fullNerves: true})} onAllOff={() => patch({hiddenGroups: BRAIN_GROUPS.map(g => g.id), isolate: null})}
      query={query} onQuery={setQuery} ready={ready}
      extras={<>
          <OrganSegmented label="皮質顯示">
            <button aria-pressed={!!view.glass} onClick={toggleGlass} title="Glass cortex｜玻璃皮質：皮質半透明，深部核團、腦室、白質束一直可見"><span lang="en">Glass cortex</span><small lang="zh-Hant">玻璃皮質</small></button>
          </OrganSegmented>
          <OrganSegmented label="腦神經顯示範圍">
            <button aria-pressed={!view.fullNerves} onClick={() => patch({fullNerves: false})}><span lang="en">Near brain</span><small lang="zh-Hant">腦旁段</small></button>
            <button aria-pressed={!!view.fullNerves} onClick={() => patch({fullNerves: true})}><span lang="en">Full nerves</span><small lang="zh-Hant">完整神經</small></button>
          </OrganSegmented>
          {parts.some(p => p.schematic) && <OrganSegmented label="示意構造">
            <button aria-pressed={!!view.isolate && view.isolate.length > 1 && view.isolate.every(id => byId.get(id)?.schematic || DEEP.has(byId.get(id)?.group ?? ''))} onClick={() => {if (view.isolate) {patch({isolate: null}); return;} const ids = parts.filter(p => p.schematic || DEEP.has(p.group)).map(p => p.id); setView(v => ({...v, isolate: ids, command: {id: v.command.id + 1, view: 'fit', focus: ids}}));}}>只看深部與示意構造（{parts.filter(p => p.schematic).length}）</button>
          </OrganSegmented>}
      </>}>
          {q ? <div className="organ-results" aria-live="polite">
            <h3>模型構造（{foundParts.length}）</h3>
            <ul>{foundParts.slice(0, 60).map(p => <li key={p.id} className="organ-part-row"><button aria-pressed={view.selectedIds.includes(p.id)} onClick={() => choose(p.id)}><span lang="en">{displayEn(p)}</span><small lang="zh-Hant">{p.zh}</small></button></li>)}</ul>
            {foundParts.length > 60 && <p className="organ-info-empty">還有 {foundParts.length - 60} 個，請輸入更多字。</p>}
            <h3>其他構造（{foundNotes.length}）</h3>
            <ul>{foundNotes.slice(0, 80).map(noteRow)}</ul>
            {foundNotes.length > 80 && <p className="organ-info-empty">還有 {foundNotes.length - 80} 個，請輸入更多字。</p>}
            {!foundParts.length && !foundNotes.length && <p className="organ-info-empty">找不到符合的構造。</p>}
          </div> : <>
          <OrganAllToggle count={parts.length} open={allOpen} onToggle={() => setAllOpen(v => !v)}/>
          {allOpen ? <div className="organ-all">
            <OrganSegmented label="排序"><button aria-pressed={allSort === 'name'} onClick={() => setAllSort('name')}>依名稱</button><button aria-pressed={allSort === 'region'} onClick={() => setAllSort('region')}>依分區</button></OrganSegmented>
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
    </OrganLeftColumn>}
    stage={<OrganStage ready={ready} error={error} percent={percent} loadingName="腦部模型" busy={cutBusy ? {title: '正在計算平滑切面', note: '第一次切開需要幾秒'} : null}
      onView={id => go(id as BrainView)} onReset={reset}
      canvas={<BrainScene view={view} exportRef={exportRef} onReady={p => {markSharedFacts(p.map(q => q.en)); peripheral.current = p.filter(q => q.peripheral).map(q => q.id); setView(v => ({...v, hiddenParts: [...new Set([...v.hiddenParts, ...peripheral.current])]})); setParts(p); setReady(true);}} onError={setError} onProgress={setPercent} onPick={select} onBusy={setCutBusy}/>}/>}
    panel={<OrganPanel
      info={<>
          {noteCard && notes ? <NoteCardView card={noteCard} data={notes} hasModel={!!noteCard.mesh?.length} approxModel={!noteCard.mesh?.length && !!noteCard.approx?.length} onFocus={() => openNote(noteCard)} onClose={() => setNoteId(null)}/> : selected ? <>
            {((view.hiddenGroups.includes(selected.group) && !drawnWhenSelected(selected.group)) || view.hiddenParts.includes(selected.id) || (!!view.isolate && !view.isolate.includes(selected.id))) && <p className="organ-out-of-view" role="status" lang="zh-Hant">不在目前視野，按 Focus 查看</p>}
            <h2 className="organ-info-title" lang="en">{displayEn(selected)}</h2>
            <p className="organ-info-zh" lang="zh-Hant">{selected.zh || '（尚無中文名稱）'}</p>
            <p lang="zh-Hant">分區：{BRAIN_GROUPS.find(g => g.id === selected.group)?.zh}｜{SIDE_ZH[selected.side]}{selected.region && selected.region !== selected.cat ? `｜${selected.region}` : ''}</p>
            {(() => {
              const fact = factOf(selected);
              if (!fact) return <p className="organ-info-empty" lang="en">Card text not written yet for this structure.</p>;
              const rel = fact.rel.map(en => ({en, part: parts.find(q => q.en.toLowerCase() === en.toLowerCase() && (q.side === selected.side || q.side === 'mid' || selected.side === 'mid')) ?? parts.find(q => q.en.toLowerCase() === en.toLowerCase())}));
              return <dl className="organ-facts" lang="en">
                <dt>Location｜位置</dt><dd>{fact.loc}</dd>
                {fact.borders && <><dt>Borders｜分界</dt><dd>{fact.borders}</dd></>}
                <dt>Function｜功能</dt><dd>{fact.fn}</dd>
                {fact.nuclei && <><dt>Main nuclei｜主要核團</dt><dd><ul className="organ-nuclei">{fact.nuclei.map(n => <li key={n.name}><b>{n.name}</b>: {n.text}</li>)}</ul></dd></>}
                <dt>Connections / Relations｜連結／毗鄰</dt><dd className="organ-rel">{rel.map(r => r.part ? <button key={r.en} onClick={() => choose(r.part!.id)}><span lang="en">{displayEn(r.part)}</span></button> : <span key={r.en}>{r.en}</span>)}</dd>
                <dt>Blood supply｜血液供應</dt><dd>{fact.blood}</dd>
                {fact.ba && <><dt>Brodmann area｜Brodmann 分區</dt><dd>{fact.ba}</dd></>}
                {fact.note && <><dt>Note｜說明</dt><dd>{fact.note.en}<br/><span lang="zh-Hant">{fact.note.zh}</span></dd></>}
                {fact.shared && <dd className="organ-shared">Shared card: it describes a group of similar structures{fact.group ? ` (${fact.group})` : ''}, not this structure alone.</dd>}
              </dl>;
            })()}
            {relatedLobes(selected) && <p lang="en"><b>Related lobes｜相關腦葉:</b> {relatedLobes(selected)}</p>}
            {selected.schematic ? <p className="organ-info-en" lang="zh-Hant"><b>示意模型</b>：位置與大小依周圍真實構造估算，不是實測形狀。</p> : <p className="organ-info-en" lang="en">Group: {BRAIN_GROUPS.find(g => g.id === selected.group)?.en}</p>}
            <div className="organ-actions" role="group" aria-label="選取動作">
              <button onClick={() => focusOn(selected.id)}>Focus｜放大</button>
              <button aria-pressed={!!view.isolate} onClick={() => patch({isolate: view.isolate ? null : [selected.id]})}>Isolate｜單獨顯示</button>
              <button onClick={() => patch({hiddenParts: [...view.hiddenParts, selected.id], selectedIds: []})}>Hide｜隱藏</button>
              <button onClick={() => patch({selectedIds: [], isolate: null})}>Clear｜清除</button>
            </div>
            {partNotes.length > 0 && <div className="note-links"><h3>相關資訊卡</h3>{partNotes.map(c => <button key={c.id} onClick={() => openNote(c)}><span lang="en">{c.en}</span><small lang="zh-Hant">{c.zh}</small></button>)}</div>}
          </> : view.selectedIds.length > 1 ? <p>已選取 {view.selectedIds.length} 個構造。<button className="organ-clear" onClick={() => patch({selectedIds: []})}>取消選取</button></p>
            : <p className="organ-info-empty">點選模型或清單中的構造，會顯示名稱與分區。</p>}
      </>}
      section={{axes: SECTION_AXES, value: section, onAxis: chooseAxis, onChange: next => patch({section: next}), note: <small>切面為實心截面：灰質（皮質）在外圈、白質在內；灰質厚度為示意。拖動滑桿即時更新；點選切面上的區域可選取該構造。</small>}}
      layers={{peel: view.peel, max: MAX_PEEL, onPeel: peel => patch({peel}), note: <small>由外而內：腦膜 → 皮質與小腦 → 腦幹 → 白質 → 基底核 → 間腦 → 腦室。目前已剝除 {view.peel} 層；血管與腦神經不受影響。</small>}}
      scope={{text: <>
          <p>皮質各葉、腦溝與腦迴、小腦、腦幹、白質纖維束、基底核、間腦、腦室與脈絡叢、腦神經根部、腦動脈（含 Willis 環）、靜脈竇與硬腦膜反摺。已移除脊髓與脊神經等不屬於腦的構造。</p>
      </>, source: <p className="organ-source">切面灰白質分界為依皮質表面向內約 2.4 mm 產生的示意（體素 0.9 mm，以平滑場取等值面）。模型來源與授權見圖譜首頁的 Source & credits。</p>}}/>}/>;
}
