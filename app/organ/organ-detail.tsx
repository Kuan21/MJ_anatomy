import {useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import {OrganAllToggle, OrganDetailLayout, OrganGroupNode, OrganLeftColumn, OrganPanel, OrganPartRow, OrganSegmented, OrganStage} from './organ-detail-layout';
import {createOrganViewer, ORGAN_CUT} from './organ-viewer';
import {chineseMatches} from '../mj-search';
import type {OrganDef, OrganPartDef, OrganView, OrganViewState} from './organ-types';
import type {OrganSectionAxis} from './organ-detail-layout';
import {loadOrganDef, type OrganId} from './organ-defs';

const AXES = {sagittal: {en: 'Sagittal', zh: '矢狀面', cut: '由右向左'}, coronal: {en: 'Coronal', zh: '冠狀面', cut: '由前向後'}, horizontal: {en: 'Horizontal', zh: '水平面', cut: '由上向下'}} as const;

function OrganScene({def, view, exportRef, onReady, onError, onProgress, onPick}: {def: OrganDef; view: OrganViewState; exportRef: React.MutableRefObject<{canvas: HTMLCanvasElement} | null>;
  onReady: () => void; onError: (m: string) => void; onProgress: (p: number) => void; onPick: (key: string | null) => void}) {
  const host = useRef<HTMLDivElement>(null), viewer = useRef<ReturnType<typeof createOrganViewer> | null>(null), latest = useRef(view);
  latest.current = view;
  const cb = useRef({onReady, onError, onProgress, onPick}); cb.current = {onReady, onError, onProgress, onPick};
  useEffect(() => {
    if (!host.current) return;
    const v = createOrganViewer(host.current, def, {progress: p => cb.current.onProgress(p), ready: () => { v.update(latest.current); cb.current.onReady(); }, error: m => cb.current.onError(m), pick: k => cb.current.onPick(k)});
    viewer.current = v; exportRef.current = v; v.update(latest.current);
    return () => { v.dispose(); viewer.current = null; exportRef.current = null; };
  }, [def, exportRef]);
  useEffect(() => { viewer.current?.update(view); }, [view]);
  return <div className="organ-canvas" ref={host}/>;
}

export default function OrganDetail({id}: {id: OrganId}) {
  const [def, setDef] = useState<OrganDef | null>(null);
  useEffect(() => { let on = true; loadOrganDef(id).then(d => { if (on) setDef(d); }); return () => { on = false; }; }, [id]);
  if (!def) return <main className="organ-app" lang="zh-Hant"><p className="organ-loading">載入中…</p></main>;
  return <OrganDetailView def={def}/>;
}

function OrganDetailView({def}: {def: OrganDef}) {
  // the detail mode opens on the Overview arrangement (organ, arteries, veins and nerves together) when the organ has one (user 2026-11-22), and Reset returns to it
  const defaults: OrganViewState = useMemo(() => {
    const base: OrganViewState = {hiddenGroups: def.groups.filter(g => !g.on).map(g => g.id), hiddenParts: [], peel: 0, isolate: null, selectedIds: [], section: {axis: 'none', offset: .5, flip: false}, zones: def.zonesDefault ?? false, ghost: [], glass: false, command: {id: 0, view: 'front'}};
    const ov = def.presets?.find(p => p.id === 'overview');
    return ov ? {...base, hiddenGroups: def.groups.map(g => g.id).filter(id => !ov.show.includes(id) && !(ov.ghost ?? []).includes(id)), ghost: ov.ghost ?? [], glass: !!ov.glass, zones: ov.zones ?? base.zones} : base;
  }, [def]);
  const [view, setView] = useState<OrganViewState>(defaults);
  const [ready, setReady] = useState(false), [error, setError] = useState(''), [percent, setPercent] = useState(0), [query, setQuery] = useState('');
  const [open, setOpen] = useState<string[]>(() => def.groups.filter(g => g.layer !== 0).map(g => g.id)), [allOpen, setAllOpen] = useState(false);
  const exportRef = useRef<{canvas: HTMLCanvasElement} | null>(null);
  const byKey = useMemo(() => new Map(def.parts.map(p => [p.key, p])), [def]);
  const maxPeel = Math.max(0, ...def.groups.filter(g => g.layer >= 0).map(g => g.layer)), groupOf = (id: string) => def.groups.find(g => g.id === id)!;
  const selected = view.selectedIds.length === 1 ? byKey.get(view.selectedIds[0]) : undefined;
  const patch = (p: Partial<OrganViewState>) => setView(v => ({...v, ...p}));
  const go = (name: OrganView, focus?: string[]) => setView(v => ({...v, command: {id: v.command.id + 1, view: name, focus}}));
  /** Selecting only selects: it never moves the camera, changes the layers or isolates anything. */
  const choose = (key: string | null) => {
    if (!key) { patch({selectedIds: []}); return; }
    setView(v => ({...v, selectedIds: v.selectedIds.length === 1 && v.selectedIds[0] === key ? [] : [key]}));
  };
  const focusOn = (key: string) => {
    const p = byKey.get(key); if (!p || p.cardOnly) return;
    setView(v => ({...v, hiddenGroups: v.hiddenGroups.filter(g => g !== p.group), hiddenParts: v.hiddenParts.filter(x => x !== key), peel: Math.min(v.peel, groupOf(p.group).layer < 0 ? v.peel : groupOf(p.group).layer), command: {id: v.command.id + 1, view: 'fit', focus: [key]}}));
  };
  useEffect(() => {
    if (!ready) return;
    const wanted = new URLSearchParams(location.hash.split('?')[1] ?? '').get('select');
    if (!wanted) return;
    const w = wanted.toLowerCase(), hit = def.parts.find(p => p.en.toLowerCase() === w || p.zh === wanted);
    history.replaceState(null, '', location.pathname + location.search + `#/organ/${def.id}`);
    if (hit) choose(hit.key);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const partVisible = (p: OrganPartDef) => !view.hiddenParts.includes(p.key) && !view.hiddenGroups.includes(p.group) && !view.ghost.includes(p.group);
  const togglePart = (p: OrganPartDef) => patch({hiddenParts: view.hiddenParts.includes(p.key) ? view.hiddenParts.filter(x => x !== p.key) : [...view.hiddenParts, p.key]});
  const toggleGroup = (id: string, list: OrganPartDef[]) => {
    // switching a group by hand shows it as a normal group: it is no longer a faint shell
    if (view.ghost.includes(id)) { patch({ghost: view.ghost.filter(g => g !== id), hiddenGroups: view.hiddenGroups.filter(g => g !== id)}); return; }
    const on = view.hiddenGroups.includes(id) || list.every(p => view.hiddenParts.includes(p.key));
    patch({hiddenGroups: on ? view.hiddenGroups.filter(g => g !== id) : [...view.hiddenGroups, id], hiddenParts: on ? view.hiddenParts.filter(k => !list.some(p => p.key === k)) : view.hiddenParts});
  };
  const q = query.trim().toLowerCase();
  const found = q ? def.parts.filter(p => p.en.toLowerCase().includes(q) || p.zh.includes(query.trim()) || chineseMatches(p.zh, query)) : [];
  const row = (p: OrganPartDef) => <OrganPartRow key={p.key} selected={view.selectedIds.includes(p.key)} en={p.en} zh={<>{p.zh}{p.cardOnly ? '　〔只有資訊卡〕' : ''}</>} onSelect={() => choose(p.key)}
    visible={partVisible(p)} onVisible={p.cardOnly ? undefined : () => togglePart(p)}/>;
  const section = view.section;
  const chooseAxis = (axis: OrganSectionAxis) => {
    if (axis === 'none') { patch({section: {...section, axis}}); return; }
    setView(v => ({...v, section: {axis, offset: .5, flip: ORGAN_CUT[axis].flip}, command: {id: v.command.id + 1, view: ORGAN_CUT[axis].view}}));
  };
  const outOfView = !!selected && !selected.cardOnly && ((view.hiddenGroups.includes(selected.group) && !view.ghost.includes(selected.group)) || view.hiddenParts.includes(selected.key) || (groupOf(selected.group).layer >= 0 && groupOf(selected.group).layer < view.peel) || (!!view.isolate && !view.isolate.includes(selected.key)));
  const field = (label: string, bi?: {en: string; zh: string}): ReactNode => bi ? <><dt>{label}</dt><dd lang="en">{bi.en}</dd><dd lang="zh-Hant">{bi.zh}</dd></> : null;
  const info = selected ? <>
    {outOfView && <p className="organ-out-of-view" role="status" lang="zh-Hant">不在目前視野，按 Focus 查看</p>}
    <h2 className="organ-info-title" lang="en">{selected.en}</h2>
    <p className="organ-info-zh" lang="zh-Hant">{selected.zh}</p>
    <p lang="zh-Hant">分區：{groupOf(selected.group).zh}{selected.mark ? '｜表面標示' : ''}{selected.cardOnly ? '｜只有資訊卡，沒有模型' : ''}</p>
    {selected.card ? <dl className="organ-facts">
      {field('Location｜位置', selected.card.loc)}{field('Course｜走向', selected.card.course)}{field('Contents｜內容', selected.card.contents)}{field('Relations｜毗鄰', selected.card.rel)}
      {field('Blood supply｜血液供應', selected.card.blood)}{field('Nerve supply｜神經支配', selected.card.nerve)}{field('Function｜作用', selected.card.fn)}{field('Note｜說明', selected.card.note)}
      {selected.card.links && <><dt>Related｜相關構造</dt><dd className="organ-rel">{selected.card.links.map(k => byKey.get(k)).filter((p): p is OrganPartDef => !!p).map(p => <button key={p.key} onClick={() => choose(p.key)}><span lang="en">{p.en}</span></button>)}</dd></>}
    </dl> : <p className="organ-info-empty" lang="zh-Hant">尚未撰寫資訊卡。</p>}
    {selected.mark && <p className="organ-info-en" lang="zh-Hant"><b>示意標示</b>：位置標在同一個{def.zh}模型的表面上，邊界為示意。</p>}
    {selected.schematic && <p className="organ-info-en" lang="zh-Hant"><b>示意模型</b>：位置與大小依周圍真實構造估算，不是實測形狀。</p>}
    <div className="organ-actions" role="group" aria-label="選取動作">
      <button disabled={selected.cardOnly} onClick={() => focusOn(selected.key)}>Focus｜放大</button>
      <button disabled={selected.cardOnly} aria-pressed={!!view.isolate} onClick={() => patch({isolate: view.isolate ? null : [selected.key]})}>Isolate｜單獨顯示</button>
      <button disabled={selected.cardOnly} onClick={() => patch({hiddenParts: [...view.hiddenParts, selected.key], selectedIds: []})}>Hide｜隱藏</button>
      <button onClick={() => patch({selectedIds: [], isolate: null})}>Clear｜清除</button>
    </div>
  </> : <p className="organ-info-empty">點選模型或清單中的構造，會顯示名稱與資訊卡。</p>;
  const hasZones = def.parts.some(p => p.mark?.channel === 'zone');
  const presetState = (pr: NonNullable<OrganDef['presets']>[number]) => ({hiddenGroups: def.groups.map(g => g.id).filter(id => !pr.show.includes(id) && !(pr.ghost ?? []).includes(id)), hiddenParts: [] as string[], ghost: pr.ghost ?? [], glass: !!pr.glass, zones: pr.zones ?? view.zones, isolate: null});
  const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every(x => b.includes(x));
  const presetOn = (pr: NonNullable<OrganDef['presets']>[number]) => { const t = presetState(pr); return sameSet(view.hiddenGroups, t.hiddenGroups) && sameSet(view.ghost, t.ghost) && view.glass === t.glass && view.hiddenParts.length === 0; };
  const extrasNodes = <>
    {def.presets && <OrganSegmented label="顯示分組">{def.presets.map(pr => <button key={pr.id} aria-pressed={presetOn(pr)} onClick={() => patch(presetState(pr))} title={`${pr.en}｜${pr.zh}`}><span lang="en">{pr.en}</span><small lang="zh-Hant">{pr.zh}</small></button>)}</OrganSegmented>}
    {def.presets && <OrganSegmented label="胃壁透明"><button aria-pressed={view.glass} onClick={() => patch({glass: !view.glass})} title="Glass wall｜胃壁透明"><span lang="en">Glass wall</span><small lang="zh-Hant">　{def.zh}壁透明</small></button></OrganSegmented>}
    {hasZones && <OrganSegmented label="分區顏色"><button aria-pressed={view.zones} onClick={() => patch({zones: !view.zones})} title="Region colours｜分區顏色"><span lang="en">Region colours</span><small lang="zh-Hant">　分區顏色</small></button></OrganSegmented>}
  </>;
  return <OrganDetailLayout title={`${def.zh}詳細模式`} labels={{left: `${def.zh}構造清單`, stage: `${def.zh} 3D 模型`, panel: `${def.zh}控制與說明`}}
    left={<OrganLeftColumn onAllOn={() => patch({hiddenGroups: [], hiddenParts: [], ghost: [], isolate: null})} onAllOff={() => patch({hiddenGroups: def.groups.map(g => g.id), ghost: [], isolate: null})}
      query={query} onQuery={setQuery} ready={ready}
      extras={extrasNodes}>
      {q ? <div className="organ-results" aria-live="polite"><h3>符合的構造（{found.length}）</h3><ul>{found.map(p => <li key={p.key} className="organ-part-row"><button aria-pressed={view.selectedIds.includes(p.key)} onClick={() => choose(p.key)}><span lang="en">{p.en}</span><small lang="zh-Hant">{p.zh}</small></button></li>)}</ul>
        {!found.length && <p className="organ-info-empty">找不到符合的構造。</p>}</div> : <>
        <OrganAllToggle count={def.parts.length} open={allOpen} onToggle={() => setAllOpen(v => !v)}/>
        {allOpen ? <div className="organ-all"><ul>{[...def.parts].sort((a, b) => a.en.localeCompare(b.en)).map(row)}</ul></div> : def.groups.map(g => {
          const list = def.parts.filter(p => p.group === g.id), expanded = open.includes(g.id), some = list.some(partVisible);
          return <OrganGroupNode key={g.id} en={g.en} zh={g.zh} count={list.length} depth={0} expanded={expanded} visible={some && !view.hiddenGroups.includes(g.id)}
            onExpand={() => setOpen(o => expanded ? o.filter(x => x !== g.id) : [...o, g.id])} onVisible={() => toggleGroup(g.id, list)}>
            <ul>{list.map(row)}</ul></OrganGroupNode>;
        })}</>}
    </OrganLeftColumn>}
    stage={<OrganStage ready={ready} error={error} percent={percent} loadingName={`${def.zh}模型`} onView={id => go(id as OrganView)} onReset={() => setView(v => ({...defaults, command: {id: v.command.id + 1, view: 'front'}}))}
      canvas={<OrganScene def={def} view={view} exportRef={exportRef} onReady={() => setReady(true)} onError={m => setError(m)} onProgress={setPercent} onPick={choose}/>}/>}
    panel={<OrganPanel info={info}
      section={{axes: AXES, value: section, onAxis: chooseAxis, onChange: next => patch({section: next}), note: <small>切面為模型的剖開示意，剖面以單色表示；拖動滑桿即時更新。</small>}}
      layers={{peel: view.peel, max: maxPeel, onPeel: peel => patch({peel}), note: <small>{def.peelNote}目前已剝除 {view.peel} 層。</small>}}
      scope={{text: <>{def.scope.map((t, i) => <p key={i}>{t}</p>)}</>, source: <p className="organ-source">模型來源與授權見圖譜首頁的 Source & credits。</p>}}/>}/>;
}
