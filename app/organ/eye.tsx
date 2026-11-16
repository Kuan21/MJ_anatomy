import {useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import {ChevronDown, ChevronRight, Crosshair} from 'lucide-react';
import {OrganAllToggle, OrganDetailLayout, OrganGroupNode, OrganLeftColumn, OrganPanel, OrganPartRow, OrganStage, type OrganSectionAxis} from './organ-detail-layout';
import {createEyeViewer} from './eye-viewer';
import {EYE_MAX_PEEL, EYE_PEEL, peelStepOf, type EyePartInfo, type EyeView, type EyeViewState} from './eye-catalogue';
import {EYE_LAYERS} from '../mj-eye-atlas';
import {EYE_OPENINGS} from '../mj-eye-openings';
import {EYE_MOVEMENTS} from '../mj-eye-movement';
import {chineseMatches} from '../mj-search';
import './eye.css';

const SECTION_AXES = {
  sagittal: {en: 'Sagittal', zh: '矢狀面', cut: '左右'},
  coronal: {en: 'Coronal', zh: '冠狀面', cut: '前後'},
  horizontal: {en: 'Horizontal (axial)', zh: '水平面', cut: '上下'},
};
/** Each cut removes the half that faces the camera looking into it: sagittal from the lateral side, coronal from the front, horizontal from above. */
const CUT: Record<Exclude<OrganSectionAxis, 'none'>, {view: EyeView}> = {sagittal: {view: 'left'}, coronal: {view: 'front'}, horizontal: {view: 'top'}};
const defaults: EyeViewState = {
  hidden: [], peel: 0, isolate: null, selectedId: null, section: {axis: 'none', offset: .5, flip: true}, explode: 0, movementId: null, openingsOpen: false, openingId: null,
  command: {id: 0, view: 'home'},
};

function EyeScene({view, onReady, onError, onProgress, onPick}: {view: EyeViewState; onReady: (parts: EyePartInfo[], sectionAt: {sagittal: number; coronal: number; horizontal: number}) => void; onError: (m: string) => void; onProgress: (p: number) => void; onPick: (id: string | null) => void}) {
  const host = useRef<HTMLDivElement>(null), viewer = useRef<ReturnType<typeof createEyeViewer> | null>(null);
  const callbacks = useRef({onReady, onError, onProgress, onPick}); callbacks.current = {onReady, onError, onProgress, onPick};
  const latest = useRef(view); latest.current = view;
  useEffect(() => {
    try {
      viewer.current = createEyeViewer(host.current!, {
        progress: p => callbacks.current.onProgress(p), ready: (parts, at) => {callbacks.current.onReady(parts, at); viewer.current?.update(latest.current);},
        error: m => callbacks.current.onError(m), pick: id => callbacks.current.onPick(id),
      });
      viewer.current.update(latest.current);
    } catch {callbacks.current.onError('無法啟動 3D 顯示。請改用支援 WebGL 的瀏覽器開啟。');}
    return () => {viewer.current?.dispose(); viewer.current = null;};
  }, []);
  useEffect(() => {viewer.current?.update(view);}, [view]);
  return <div className="organ-canvas" ref={host}/>;
}

/** A collapsible block of the right column (eye movements, orbital openings). */
function EyeBlock({id, en, zh, open, summary, onToggle, children}: {id: string; en: string; zh: string; open: boolean; summary?: ReactNode; onToggle: () => void; children: ReactNode}) {
  return <section className="organ-block eye-block" id={id}>
    <h2><button className="eye-block-toggle" aria-expanded={open} onClick={onToggle}>{open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}<span>{en}</span><small lang="zh-Hant">{zh}</small>{summary && <em lang="zh-Hant">{summary}</em>}</button></h2>
    {open && children}
  </section>;
}

export default function EyeDetail() {
  const [view, setView] = useState<EyeViewState>(defaults);
  const [parts, setParts] = useState<EyePartInfo[]>([]), [ready, setReady] = useState(false), [error, setError] = useState(''), [percent, setPercent] = useState(0);
  const [open, setOpen] = useState<string[]>([]), [allOpen, setAllOpen] = useState(false), [query, setQuery] = useState('');
  const [moveOpen, setMoveOpen] = useState(false), [openingBlock, setOpeningBlock] = useState(false), [looking, setLooking] = useState(false);
  const sectionAt = useRef({sagittal: .5, coronal: .5, horizontal: .5});
  const startHidden = useRef<string[]>([]);
  useEffect(() => {document.title = '眼部詳細模式 · MJ Anatomy';}, []);

  const byId = useMemo(() => new Map(parts.map(p => [p.id, p])), [parts]);
  const selected = view.selectedId ? byId.get(view.selectedId) : undefined;
  const patch = (next: Partial<EyeViewState>) => setView(v => ({...v, ...next}));
  const go = (name: EyeView, extra?: {focus?: string[]; opening?: string}) => setView(v => ({...v, command: {id: v.command.id + 1, view: name, ...extra}}));
  const select = (id: string | null) => setView(v => ({...v, selectedId: id && v.selectedId === id ? null : id}));
  const partVisible = (p: EyePartInfo) => !view.hidden.includes(p.id) && !(peelStepOf(p.layer) > 0 && peelStepOf(p.layer) <= view.peel);
  /** Selecting (model, list, search) never moves the camera or switches layers; the Focus button of the info card does both. */
  const choose = (id: string) => select(id);
  const focusOn = (id: string) => {
    const p = byId.get(id); if (!p) return;
    const step = peelStepOf(p.layer);
    setView(v => ({...v, hidden: v.hidden.filter(x => x !== id), peel: step > 0 && step <= v.peel ? step - 1 : v.peel, command: {id: v.command.id + 1, view: 'fit', focus: [id]}}));
  };
  const setNodeVisible = (list: EyePartInfo[], on: boolean) => {
    const ids = new Set(list.map(p => p.id));
    setView(v => ({...v, isolate: null, hidden: on ? v.hidden.filter(x => !ids.has(x)) : [...new Set([...v.hidden, ...ids])]}));
  };
  const showBone = () => setView(v => ({...v, isolate: null, hidden: v.hidden.filter(id => byId.get(id)?.layer !== 0)}));

  // ---- eye movements and orbital openings (the structures stay where they are; selecting or choosing never moves the camera)
  const movement = EYE_MOVEMENTS.find(m => m.id === view.movementId);
  const opening = view.openingsOpen ? EYE_OPENINGS.find(o => o.id === view.openingId) : undefined;
  const playMovement = (id: string) => {
    const next = view.movementId === id ? undefined : EYE_MOVEMENTS.find(m => m.id === id);
    setView(v => ({...v, explode: 0, isolate: null, movementId: next?.id ?? null,
      // a muscle movement also selects its muscle, so its card is shown
      selectedId: next?.kind === 'muscle' && next.muscles ? next.muscles[0] : next ? null : v.selectedId}));
  };
  const chooseOpening = (id: string) => {
    const next = view.openingId === id ? null : id; setLooking(false);
    setView(v => ({...v, openingId: next, ...(next ? {isolate: null, selectedId: null, hidden: v.hidden.filter(x => byId.get(x)?.layer !== 0)} : {})}));
  };
  const toggleOpenings = (on: boolean) => {setOpeningBlock(on); setLooking(false); setView(v => ({...v, openingsOpen: on, ...(on ? {isolate: null, hidden: v.hidden.filter(x => byId.get(x)?.layer !== 0)} : {})}));};
  const setExplode = (explode: number) => setView(v => ({...v, explode, movementId: explode > 0 ? null : v.movementId}));

  const q = query.trim().toLowerCase();
  const found = q ? parts.filter(p => p.name.toLowerCase().includes(q) || p.zh.toLowerCase().includes(q) || chineseMatches(p.zh, query) || p.group.toLowerCase().includes(q) || p.groupZh.includes(query.trim())) : [];
  const groups = useMemo(() => EYE_LAYERS.map((layer, index) => ({layer, index, parts: parts.filter(p => p.layer === index).sort((a, b) => a.name.localeCompare(b.name))})).filter(g => g.parts.length), [parts]);
  const chooseAxis = (axis: OrganSectionAxis) => {
    if (axis === 'none') {patch({section: {...view.section, axis}}); return;}
    setView(v => ({...v, section: {axis, offset: sectionAt.current[axis], flip: true}, command: {id: v.command.id + 1, view: CUT[axis].view}}));
  };
  const reset = () => {
    setLooking(false); setMoveOpen(false); setOpeningBlock(false); setOpen([]);
    setView(v => ({...defaults, hidden: startHidden.current, command: {id: v.command.id + 1, view: 'home'}}));
  };
  const openBlock = (which: 'move' | 'openings') => {
    if (which === 'move') setMoveOpen(true); else if (!view.openingsOpen) toggleOpenings(true);
    requestAnimationFrame(() => document.getElementById(which === 'move' ? 'eye-movements' : 'eye-openings')?.scrollIntoView({block: 'nearest', behavior: 'smooth'}));
  };

  const outOfView = selected && (!partVisible(selected) || (!!view.isolate && view.isolate !== selected.id));
  const row = (p: EyePartInfo, withEye: boolean) => <OrganPartRow key={p.id} selected={view.selectedId === p.id} en={p.name} zh={p.zh} onSelect={() => choose(p.id)} visible={partVisible(p)} onVisible={withEye ? () => setNodeVisible([p], !partVisible(p)) : undefined}/>;

  return <OrganDetailLayout title="眼部詳細模式" labels={{left: '眼部構造清單', stage: '眼部 3D 模型', panel: '眼部控制與說明'}}
    headerActions={<div className="eye-header-actions">
      <button className="csf-toggle" aria-pressed={moveOpen} disabled={!ready} onClick={() => openBlock('move')}>眼球動作</button>
      <button className="csf-toggle" aria-pressed={view.openingsOpen} disabled={!ready} onClick={() => openBlock('openings')}>眼眶的孔、管與裂</button>
    </div>}
    left={<OrganLeftColumn onAllOn={() => patch({hidden: [], isolate: null})} onAllOff={() => patch({hidden: parts.map(p => p.id), isolate: null})} query={query} onQuery={setQuery} ready={ready}>
      {q ? <div className="organ-results" aria-live="polite">
        <h3>搜尋結果（{found.length}）</h3>
        <ul>{found.slice(0, 80).map(p => <li key={p.id} className="organ-part-row"><button aria-pressed={view.selectedId === p.id} onClick={() => choose(p.id)}><span lang="en">{p.name}</span><small lang="zh-Hant">{p.zh}　{p.groupZh}</small></button></li>)}</ul>
        {found.length > 80 && <p className="organ-info-empty">還有 {found.length - 80} 個，請輸入更多字。</p>}
        {!found.length && <p className="organ-info-empty">找不到符合的構造。</p>}
      </div> : <>
        <OrganAllToggle count={parts.length} open={allOpen} onToggle={() => setAllOpen(v => !v)}/>
        {allOpen ? <div className="organ-all"><ul>{[...parts].sort((a, b) => a.name.localeCompare(b.name)).map(p => <li key={p.id} className="organ-part-row"><button aria-pressed={view.selectedId === p.id} onClick={() => choose(p.id)}><span lang="en">{p.name}</span><small lang="zh-Hant">{p.zh}　{p.groupZh}</small></button></li>)}</ul></div>
          : groups.map(g => {
            const expanded = open.includes(g.layer.name), some = g.parts.some(partVisible);
            return <OrganGroupNode key={g.layer.name} en={g.layer.name} zh={g.layer.zh} count={g.parts.length} depth={0} expanded={expanded} visible={some}
              onExpand={() => setOpen(o => expanded ? o.filter(x => x !== g.layer.name) : [...o, g.layer.name])} onVisible={() => setNodeVisible(g.parts, !some)}>
              <ul>{g.parts.map(p => row(p, true))}</ul>
            </OrganGroupNode>;
          })}
      </>}
    </OrganLeftColumn>}
    stage={<OrganStage ready={ready} error={error} percent={percent} loadingName="眼部模型" onView={id => go(id as EyeView)} onReset={reset}
      canvas={<EyeScene view={view} onReady={(p, at) => {sectionAt.current = at; startHidden.current = p.filter(x => EYE_LAYERS[x.layer].hiddenByDefault).map(x => x.id); setParts(p); setView(v => ({...v, hidden: startHidden.current})); setReady(true);}}
        onError={setError} onProgress={setPercent} onPick={id => {if (id) select(id); else patch({selectedId: null});}}/>}/>}
    panel={<OrganPanel
      info={selected ? <>
        {outOfView && <p className="organ-out-of-view" role="status" lang="zh-Hant">不在目前視野，按 Focus 查看</p>}
        <h2 className="organ-info-title" lang="en">{selected.name}</h2>
        <p className="organ-info-zh" lang="zh-Hant">{selected.zh}</p>
        <p lang="zh-Hant">分層：{selected.groupZh}（{selected.group}）</p>
        <p lang="en">{selected.text}</p>
        <p lang="zh-Hant">{selected.textZh}</p>
        <div className="organ-actions" role="group" aria-label="選取動作">
          <button onClick={() => focusOn(selected.id)}>Focus｜放大</button>
          <button aria-pressed={view.isolate === selected.id} onClick={() => patch({isolate: view.isolate ? null : selected.id})}>Isolate｜單獨顯示</button>
          <button onClick={() => patch({hidden: [...view.hidden, selected.id], selectedId: null})}>Hide｜隱藏</button>
          <button onClick={() => patch({selectedId: null, isolate: null})}>Clear｜清除</button>
        </div>
      </> : <p className="organ-info-empty">點選模型或清單中的構造，會顯示名稱、分層與說明。</p>}
      section={{axes: SECTION_AXES, value: view.section, onAxis: chooseAxis, onChange: next => patch({section: next}),
        note: <small>切面會把模型截開，沿切面看進眼球與眼眶（不補實心截面）；拖動滑桿即時更新，點選切面上的構造可選取。預設切在眼球中央。</small>}}
      layers={{peel: view.peel, max: EYE_MAX_PEEL, onPeel: peel => patch({peel, isolate: null}),
        note: <small lang="zh-Hant">由外而內：{EYE_PEEL.map((s, i) => `${i + 1}. ${s.zh}`).join(' → ')}。目前已剝除 {view.peel} 層；水晶體、視神經與視覺路徑不會被剝除。骨性眼眶預設關閉，可在左側清單開啟，剝第 1 層時會一併隱藏。</small>}}
      extraBlocks={<>
        <section className="organ-block eye-block">
          <h2>Separate<small>分離</small></h2>
          <label className="organ-slider"><span lang="zh-Hant">把各層沿視軸或向外拉開</span> · {view.explode}%
            <input type="range" min={0} max={100} value={view.explode} aria-label="分離程度" onChange={e => setExplode(+e.target.value)}/></label>
        </section>
        <EyeBlock id="eye-movements" en="Eye movements" zh="眼球動作" open={moveOpen} summary={movement?.zh} onToggle={() => setMoveOpen(v => !v)}>
          <div className="eye-buttons">{EYE_MOVEMENTS.filter(m => m.kind === 'muscle').map(m => <button key={m.id} aria-pressed={view.movementId === m.id} aria-label={m.zh + '的動作'} title={m.name + ' ' + m.zh} onClick={() => playMovement(m.id)}><b>{m.label}</b><small lang="zh-Hant">{m.zh}</small></button>)}</div>
          <div className="eye-buttons palsy">{EYE_MOVEMENTS.filter(m => m.kind === 'palsy').map(m => <button key={m.id} aria-pressed={view.movementId === m.id} aria-label={m.zh + '的眼位'} title={m.name + ' ' + m.zh} onClick={() => playMovement(m.id)}><b>{m.label}</b><small lang="zh-Hant">{m.zh.replace('神經麻痺', '麻痺')}</small></button>)}</div>
          {movement && <div className="eye-note" aria-live="polite"><strong>{movement.name}<em lang="zh-Hant">{movement.zh}</em></strong>{movement.kind === 'palsy' && <p lang="en">{movement.text}</p>}<p lang="zh-Hant">{movement.textZh}</p></div>}
          <small className="eye-foot" lang="zh-Hant">按下動作後，眼球轉到該位置；拉開「分離」會結束動作。</small>
        </EyeBlock>
        <EyeBlock id="eye-openings" en="Orbital openings" zh="眼眶的孔、管與裂" open={openingBlock} summary={opening?.zh} onToggle={() => toggleOpenings(!openingBlock)}>
          <div className="eye-buttons openings">{EYE_OPENINGS.map(o => <button key={o.id} aria-pressed={view.openingId === o.id} aria-label={'標示' + o.zh} title={o.name + ' ' + o.zh + (o.aliasZh ? '（又稱' + o.aliasZh + '）' : '')} onClick={() => chooseOpening(o.id)}><b><i style={{background: o.color}}/>{o.label}</b><small lang="zh-Hant">{o.zh}</small></button>)}</div>
          {opening && <div className="eye-note" aria-live="polite"><strong>{opening.name}<em lang="zh-Hant">{opening.zh}{opening.aliasZh && '（又稱' + opening.aliasZh + '）'}</em>
            <button className="eye-look" onClick={() => {go('look', {opening: opening.id}); setLooking(true); showBone();}}><Crosshair size={11}/>對準</button></strong>
            {looking && <small className="eye-look-hint" lang="zh-Hant">{opening.hintZh}</small>}
            <p lang="en">{opening.text}{opening.absent && ' ' + opening.absent}</p><p lang="zh-Hant">{opening.textZh}{opening.absentZh}</p></div>}
          <small className="eye-foot" lang="zh-Hant">開口直接標示在骨面上；選定後，通過的構造變色，其他構造淡化。</small>
        </EyeBlock>
      </>}
      scope={{text: <>
        <p>左眼與左側眼眶：眼瞼與結膜、淚器、六條眼外肌與提上眼瞼肌、眼眶神經、眼動脈、視神經與視覺路徑、眼球各層（纖維層、虹膜與睫狀體、水晶體、房水與玻璃體、脈絡膜、視網膜）與骨性眼眶，共 {parts.length || 71} 個構造，分 15 層。</p>
        <p>只有左眼，沒有右眼；眼球動作與神經麻痺眼位的角度僅供顯示，在正常活動範圍內。</p>
      </>, source: <p className="organ-source">眼球分層與眼眶構造為示意級的參考模型。模型來源與授權見圖譜首頁的 Source & credits。</p>}}/>}/>;
}
