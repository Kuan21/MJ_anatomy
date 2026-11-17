import {lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import {OrganAllToggle, OrganDetailLayout, OrganGroupNode, OrganLeftColumn, OrganPanel, OrganPartRow, OrganStage, type OrganViewButton} from './organ/organ-detail-layout';
import {createEarViewer, type EarView, type EarViewState} from './mj-ear-viewer';
import {EAR_BY_ID, EAR_GROUPS, EAR_PARTS, EAR_SCOPE, earGroupOf, type EarFacts, type EarPart} from './mj-ear-atlas';
import {chineseMatches} from './mj-search';

import './ear-hearing/hearing-button.css';

// the hearing animation (3D, own scenes) is loaded only when it is opened
const HearingAnimation = lazy(() => import('./ear-hearing/hearing-animation'));

const EAR_VIEWS: readonly OrganViewButton[] = [{id: 'lateral', label: '外側'}, {id: 'medial', label: '內側'}, {id: 'front', label: '前面'}, {id: 'back', label: '後面'}, {id: 'top', label: '上面'}, {id: 'bottom', label: '下面'}];
const defaults: EarViewState = {hiddenGroups: [], hiddenParts: [], isolate: null, selectedIds: [], command: {id: 0, view: 'lateral'}};

function EarScene({view, onReady, onError, onProgress, onPick}: {
  view: EarViewState; onReady: (ids: string[]) => void; onError: (m: string) => void; onProgress: (p: number) => void; onPick: (id: string | null) => void;
}) {
  const host = useRef<HTMLDivElement>(null), viewer = useRef<ReturnType<typeof createEarViewer> | null>(null);
  const callbacks = useRef({onReady, onError, onProgress, onPick}); callbacks.current = {onReady, onError, onProgress, onPick};
  const latest = useRef(view); latest.current = view;
  useEffect(() => {
    try {
      viewer.current = createEarViewer(host.current!, {
        progress: p => callbacks.current.onProgress(p), ready: info => {callbacks.current.onReady(info.ids); viewer.current?.update(latest.current);},
        error: m => callbacks.current.onError(m), pick: id => callbacks.current.onPick(id),
      });
      viewer.current.update(latest.current);
    } catch {callbacks.current.onError('無法啟動 3D 顯示。請改用支援 WebGL 的瀏覽器開啟。');}
    return () => {viewer.current?.dispose(); viewer.current = null;};
  }, []);
  useEffect(() => {viewer.current?.update(view);}, [view]);
  return <div className="organ-canvas" ref={host}/>;
}

const FIELDS: {key: keyof EarFacts; en: string; zh: string}[] = [
  {key: 'loc', en: 'Location and shape', zh: '位置與形態'},
  {key: 'fn', en: 'Function', zh: '功能'},
  {key: 'supply', en: 'Blood and nerve supply', zh: '血液與神經供應'},
  {key: 'note', en: 'Note', zh: '補充'},
];

export default function EarDetail() {
  const [view, setView] = useState<EarViewState>(defaults);
  const [ready, setReady] = useState(false), [error, setError] = useState(''), [percent, setPercent] = useState(0);
  const [open, setOpen] = useState<string[]>([]), [allOpen, setAllOpen] = useState(false), [query, setQuery] = useState('');
  const [hearing, setHearing] = useState(false);
  const [modelIds, setModelIds] = useState<Set<string>>(new Set());
  useEffect(() => {document.title = hearing ? '聽覺傳導動畫 · MJ Anatomy' : '耳部詳細模式 · MJ Anatomy';}, [hearing]);
  const patch = (next: Partial<EarViewState>) => setView(v => ({...v, ...next}));
  const go = (name: EarView, focus?: string[]) => setView(v => ({...v, command: {id: v.command.id + 1, view: name, focus}}));
  const selected = view.selectedIds.length === 1 ? EAR_BY_ID.get(view.selectedIds[0]) : undefined;
  const select = (id: string | null) => setView(v => !id ? {...v, selectedIds: []} : {...v, selectedIds: v.selectedIds.length === 1 && v.selectedIds[0] === id ? [] : [id]});
  // Selecting (model, list, search, related-structure link) never moves the camera; the Focus button of the card moves it.
  const choose = (id: string) => select(id);
  const hasMesh = (p: EarPart) => p.model && modelIds.has(p.id);
  const partVisible = (p: EarPart) => !view.hiddenParts.includes(p.id) && !view.hiddenGroups.includes(p.group);
  // the far end of the pharyngotympanic tube would pull the camera back: it is left out of the framing unless it is the structure itself
  const focusIds = (p: EarPart) => p.model ? [p.id] : (p.near ?? []).filter(id => modelIds.has(id) && id !== 'pharyngotympanic-tube');
  const focusOn = (p: EarPart) => {
    const ids = focusIds(p), parts = ids.map(id => EAR_BY_ID.get(id)!);
    setView(v => ({
      ...v, isolate: null,
      hiddenGroups: v.hiddenGroups.filter(g => !parts.some(x => x.group === g)), hiddenParts: v.hiddenParts.filter(x => !ids.includes(x)),
      command: {id: v.command.id + 1, view: 'fit', focus: ids},
    }));
  };
  // Opened from a link (#/organ/ear?select=<name>): select that structure once the model is ready, then drop the query so a reload does not reselect it.
  useEffect(() => {
    if (!ready) return;
    const wanted = new URLSearchParams(location.hash.split('?')[1] ?? '').get('select');
    if (!wanted) return;
    const norm = (s: string) => s.toLowerCase().replace(/^(left|right) /, '').replace(/\s+/g, ' ').trim();
    const hit = EAR_PARTS.find(p => norm(p.en) === norm(wanted) || p.id === wanted || (p.aliases ?? []).some(a => norm(a) === norm(wanted)));
    history.replaceState(null, '', location.pathname + location.search + '#/organ/ear');
    if (hit) choose(hit.id);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const groupParts = (id: string) => EAR_PARTS.filter(p => p.group === id);
  const toggleGroup = (ids: string[]) => {
    const on = ids.some(g => !view.hiddenGroups.includes(g));
    patch({hiddenGroups: on ? [...new Set([...view.hiddenGroups, ...ids])] : view.hiddenGroups.filter(g => !ids.includes(g)), isolate: null});
  };
  const togglePart = (p: EarPart) => {
    if (view.hiddenGroups.includes(p.group)) patch({hiddenGroups: view.hiddenGroups.filter(g => g !== p.group), hiddenParts: [...groupParts(p.group).filter(x => x.id !== p.id).map(x => x.id), ...view.hiddenParts.filter(x => x !== p.id)], isolate: null});
    else patch({hiddenParts: view.hiddenParts.includes(p.id) ? view.hiddenParts.filter(x => x !== p.id) : [...view.hiddenParts, p.id], isolate: null});
  };
  const row = (p: EarPart, withEye: boolean) => <OrganPartRow key={p.id} selected={view.selectedIds.includes(p.id)} en={p.en} zh={`${p.zh}${p.schematic ? '　〔示意〕' : ''}${!p.model ? '　〔只有資訊卡〕' : p.mark ? '　〔骨面標示〕' : ''}`}
    onSelect={() => choose(p.id)} visible={hasMesh(p) ? partVisible(p) : undefined} onVisible={withEye && hasMesh(p) ? () => togglePart(p) : undefined}/>;
  const groupNode = (id: string, en: string, zh: string, groupIds: string[], depth: number, children?: ReactNode) => {
    const list = EAR_PARTS.filter(p => groupIds.includes(p.group)), expanded = open.includes(id), some = groupIds.some(g => !view.hiddenGroups.includes(g)) && list.some(p => hasMesh(p) ? partVisible(p) : false);
    return <OrganGroupNode key={id} en={en} zh={zh} count={list.length} depth={depth} expanded={expanded} visible={some}
      onExpand={() => setOpen(o => expanded ? o.filter(x => x !== id) : [...o, id])} onVisible={() => toggleGroup(groupIds)}>
      {children}
    </OrganGroupNode>;
  };
  const tree = <>
    {groupNode('outer', 'Outer ear', '外耳', ['outer'], 0, <ul>{groupParts('outer').map(p => row(p, true))}</ul>)}
    {groupNode('middle', 'Middle ear', '中耳', ['middle'], 0, <ul>{groupParts('middle').map(p => row(p, true))}</ul>)}
    {groupNode('inner', 'Inner ear', '內耳', ['bony', 'membranous'], 0, <>
      {groupNode('bony', 'Bony labyrinth', '骨性迷路', ['bony'], 1, <ul>{groupParts('bony').map(p => row(p, true))}</ul>)}
      {groupNode('membranous', 'Membranous labyrinth', '膜性迷路', ['membranous'], 1, <ul>{groupParts('membranous').map(p => row(p, true))}</ul>)}
    </>)}
    {groupNode('nerves', 'Nerves and ganglia', '神經與神經節', ['nerves'], 0, <ul>{groupParts('nerves').map(p => row(p, true))}</ul>)}
  </>;
  const q = query.trim().toLowerCase();
  const found = q ? EAR_PARTS.filter(p => p.en.toLowerCase().includes(q) || p.zh.toLowerCase().includes(q) || (p.aliases ?? []).some(a => a.toLowerCase().includes(q)) || chineseMatches(p.zh, query)) : [];
  const reset = () => setView(v => ({...defaults, command: {id: v.command.id + 1, view: 'lateral'}}));
  const out = selected && hasMesh(selected) && !partVisible(selected) || (!!selected && !hasMesh(selected) && !!view.isolate);
  const group = selected ? earGroupOf(selected.group) : undefined;

  const factsOf = (p: EarPart) => <dl className="organ-facts ear-facts">
    {FIELDS.filter(f => p.card.en[f.key]).map(f => <div key={f.key} className="ear-fact">
      <dt>{f.en}｜{f.zh}</dt>
      <dd lang="en">{p.card.en[f.key]}</dd>
      <dd className="ear-fact-zh" lang="zh-Hant">{p.card.zh[f.key]}</dd>
    </div>)}
    <dt>Related structures｜相關構造</dt>
    <dd className="organ-rel">{p.rel.map(id => {const r = EAR_BY_ID.get(id); return r ? <button key={id} onClick={() => choose(id)}><span lang="en">{r.en}</span></button> : null;})}</dd>
  </dl>;

  return <OrganDetailLayout title="耳部詳細模式" overlayOpen={hearing} overlay={hearing && <Suspense fallback={null}><HearingAnimation onClose={() => setHearing(false)}/></Suspense>} labels={{left: '耳部構造清單', stage: '耳部 3D 模型', panel: '耳部控制與說明'}}
    left={<OrganLeftColumn onAllOn={() => patch({hiddenGroups: [], hiddenParts: [], isolate: null})} onAllOff={() => patch({hiddenGroups: EAR_GROUPS.map(g => g.id), isolate: null})} query={query} onQuery={setQuery} ready={ready}>
      {q ? <div className="organ-results organ-all" aria-live="polite">
        <h3>構造（{found.length}）</h3>
        <ul>{found.map(p => row(p, false))}</ul>
        {!found.length && <p className="organ-info-empty">找不到符合的構造。</p>}
      </div> : <>
        <OrganAllToggle count={EAR_PARTS.length} open={allOpen} onToggle={() => setAllOpen(v => !v)}/>
        {allOpen ? <div className="organ-all"><ul>{[...EAR_PARTS].sort((a, b) => a.en.localeCompare(b.en)).map(p => row(p, false))}</ul></div> : tree}
      </>}
    </OrganLeftColumn>}
    stage={<OrganStage ready={ready} error={error} percent={percent} loadingName="耳部模型" views={EAR_VIEWS} onView={id => go(id as EarView)} onReset={reset}
      canvas={<EarScene view={view} onReady={ids => {setModelIds(new Set(ids)); setReady(true);}} onError={setError} onProgress={setPercent} onPick={select}/>}/>}
    panel={<OrganPanel
      info={selected ? <>
        {out && <p className="organ-out-of-view" role="status" lang="zh-Hant">不在目前視野，按 Focus 查看</p>}
        <h2 className="organ-info-title" lang="en">{selected.en}</h2>
        <p className="organ-info-zh" lang="zh-Hant">{selected.zh}</p>
        <p lang="zh-Hant">分區：{group?.parent ? `${group.parent.zh}　${group.zh}` : group?.zh}｜右耳{selected.schematic ? '｜示意模型' : ''}{!selected.model ? '｜只有資訊卡' : selected.mark ? '｜骨面標示' : ''}</p>
        {!selected.model && <p className="organ-info-en" lang="zh-Hant"><b>此構造沒有 3D 網格</b>：選取時只標示{selected.near?.length ? '相鄰或圍成它的真實構造（藍色），其餘淡化' : '位置'}。</p>}
        {selected.schematic && <p className="organ-info-en" lang="zh-Hant"><b>示意模型</b>：依解剖描述建立的管道，位置與大小為估算，不是實測形狀。</p>}
        {factsOf(selected)}
        <div className="organ-actions" role="group" aria-label="選取動作">
          <button onClick={() => focusOn(selected)} disabled={!focusIds(selected).length}>Focus｜放大</button>
          {selected.model && <button aria-pressed={!!view.isolate} onClick={() => patch({isolate: view.isolate ? null : [selected.id]})}>Isolate｜單獨顯示</button>}
          {selected.model && <button onClick={() => patch({hiddenParts: [...view.hiddenParts, selected.id], selectedIds: []})}>Hide｜隱藏</button>}
          <button onClick={() => patch({selectedIds: [], isolate: null})}>Clear｜清除</button>
        </div>
      </> : <p className="organ-info-empty">點選模型或清單中的構造，會顯示名稱、位置與功能。</p>}
      extraBlocks={<section className="organ-block ear-animation-block">
        <h2>Animation<small>動畫</small></h2>
        <button className="ear-animation-open" onClick={() => setHearing(true)}>聽覺傳導動畫｜Hearing</button>
        <small lang="zh-Hant">分六步：外耳、中耳、耳蝸行波、柯蒂氏器、突觸、聽覺路徑。使用目前載入的耳部與腦部模型，不會下載新的模型檔。</small>
      </section>}
      scope={{text: <p>{EAR_SCOPE.zh}</p>, source: <p className="organ-source">{EAR_SCOPE.source}</p>}}/>}/>;
}
