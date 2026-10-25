import {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowLeft, Eye, EyeOff, RotateCcw} from 'lucide-react';
import {fetchModelBuffer} from '../model-download';
import {createHeartViewer} from './heart-viewer';
import {SECTION_AXES, type HeartCatalogue, type HeartPart, type HeartView, type HeartViewState, type SectionAxis} from './heart-types';
import './organ.css';

function HeartScene({catalogue, view, onProgress, onReady, onError, onPick, onHover}: {
  catalogue: HeartCatalogue; view: HeartViewState;
  onProgress: (loaded: number, total: number) => void; onReady: () => void; onError: (message: string) => void;
  onPick: (id: string | null) => void; onHover: (id: string | null) => void;
}) {
  const host = useRef<HTMLDivElement>(null), viewer = useRef<ReturnType<typeof createHeartViewer> | null>(null);
  const callbacks = useRef({onProgress, onReady, onError, onPick, onHover}); callbacks.current = {onProgress, onReady, onError, onPick, onHover};
  const latest = useRef(view); latest.current = view;
  useEffect(() => {
    try {
      viewer.current = createHeartViewer(host.current!, catalogue, {
        progress: (a, b) => callbacks.current.onProgress(a, b), ready: () => callbacks.current.onReady(), error: m => callbacks.current.onError(m),
        pick: id => callbacks.current.onPick(id), hover: id => callbacks.current.onHover(id),
      });
      viewer.current.update(latest.current);
    } catch {callbacks.current.onError('無法啟動 3D 顯示。請改用支援 WebGL 的瀏覽器開啟。');}
    return () => {viewer.current?.dispose(); viewer.current = null;};
  }, [catalogue]);
  useEffect(() => {viewer.current?.update(view);}, [view]);
  return <div className="organ-canvas" ref={host}/>;
}

// Closed heart by default: the outside (chambers as the epicardial surface, coronary vessels, great vessels). Valves, chordae and papillary muscles appear when the heart is opened.
const INTERNAL = ['papillary', 'valves'];
const defaults: HeartViewState = {hiddenGroups: INTERNAL, selectedId: null, section: {axis: 'none', offset: .5, flip: true}, ghostChambers: false, command: {id: 0, view: 'front'}};
const OPENED: Partial<HeartViewState> = {hiddenGroups: [], section: {axis: 'coronal', offset: .5, flip: true}, ghostChambers: true};
const AXES: SectionAxis[] = ['none', 'coronal', 'sagittal', 'transverse'];
/** Each cut removes the half facing the camera that looks into it: coronal from the front, sagittal from the body's right, transverse from above. */
const CUT: Record<Exclude<SectionAxis, 'none'>, {flip: boolean; view: HeartView}> = {coronal: {flip: true, view: 'front'}, sagittal: {flip: false, view: 'right'}, transverse: {flip: true, view: 'top'}};

export default function HeartDetail() {
  const [catalogue, setCatalogue] = useState<HeartCatalogue | null>(null), [catalogueError, setCatalogueError] = useState(''), [retry, setRetry] = useState(0);
  const [view, setView] = useState<HeartViewState>(defaults);
  const [load, setLoad] = useState({loaded: 0, total: 0}), [ready, setReady] = useState(false), [error, setError] = useState(''), [hover, setHover] = useState<string | null>(null);
  useEffect(() => {document.title = '心臟詳細模式 · MJ Anatomy';}, []);
  useEffect(() => {
    const abort = new AbortController(); setCatalogueError('');
    void fetchModelBuffer(`${import.meta.env.BASE_URL}models/heart/heart-detail.json.gz`, 0, true, abort.signal)
      .then(bytes => {
        const data = JSON.parse(new TextDecoder().decode(bytes)) as HeartCatalogue;
        if (data.version !== 1 || !data.parts?.length) throw Error('Invalid heart catalogue');
        if (!abort.signal.aborted) setCatalogue(data);
      }).catch(() => {if (!abort.signal.aborted) setCatalogueError('心臟模型目錄未能載入，請重試。');});
    return () => abort.abort();
  }, [retry]);

  const parts = useMemo(() => new Map(catalogue?.parts.map(p => [p.id, p])), [catalogue]);
  const selected = view.selectedId ? parts.get(view.selectedId) : undefined;
  const shown = hover && hover !== view.selectedId ? parts.get(hover) : undefined;
  const patch = (next: Partial<HeartViewState>) => setView(v => ({...v, ...next}));
  const go = (name: HeartView) => setView(v => ({...v, command: {id: v.command.id + 1, view: name}}));
  const toggleGroup = (id: string) => patch({hiddenGroups: view.hiddenGroups.includes(id) ? view.hiddenGroups.filter(g => g !== id) : [...view.hiddenGroups, id]});
  const grouped = useMemo(() => catalogue?.groups.map(g => ({...g, parts: catalogue.parts.filter(p => p.group === g.id)})) ?? [], [catalogue]);

  return <main className="organ-app" lang="zh-Hant">
    <header className="organ-header">
      <a className="organ-back" href="#/" aria-label="返回圖譜"><ArrowLeft size={18}/><span>返回圖譜</span></a>
      <div className="organ-brand">MJ Anatomy <span>心臟詳細模式</span></div>
      <span className="organ-tag">HEART</span>
    </header>
    {catalogueError && <div className="organ-error" role="alert">{catalogueError}<button onClick={() => setRetry(n => n + 1)}>重新載入</button></div>}
    {!catalogue && !catalogueError && <div className="organ-loading" role="status">正在準備心臟模型…</div>}
    {catalogue && <div className="organ-layout">
      <section className="organ-stage" aria-label="心臟 3D 模型">
        <HeartScene catalogue={catalogue} view={view} onProgress={(loaded, total) => setLoad({loaded, total})} onReady={() => setReady(true)} onError={setError}
          onPick={id => patch({selectedId: id})} onHover={setHover}/>
        <div className="organ-views" aria-label="視角">{([['front', '前面'], ['back', '後面'], ['left', '左側'], ['right', '右側'], ['top', '上面']] as const).map(([id, label]) => <button key={id} onClick={() => go(id)}>{label}</button>)}
          <button onClick={() => {setView(v => ({...defaults, command: {id: v.command.id + 1, view: 'front'}}));}} aria-label="還原預設" title="還原預設"><RotateCcw size={15}/></button></div>
        {shown && <div className="organ-hover" aria-hidden="true">{shown.name}<small>{shown.chinese}</small></div>}
        {!ready && !error && <div className="organ-progress" role="status"><span className="organ-spinner"/><strong>載入心臟模型</strong><small>{load.loaded} / {load.total || '…'} 個模型套件</small></div>}
        {error && <div className="organ-error stage" role="alert">{error}</div>}
        <p className="organ-hint">拖曳旋轉 · 滾輪／雙指縮放 · 點選構造查看說明</p>
      </section>
      <aside className="organ-panel" aria-label="心臟控制與說明">
        <section className="organ-block organ-info" aria-live="polite">
          {selected ? <>
            <h2 className="organ-info-title" lang="en">{selected.name}</h2>
            <p className="organ-info-zh" lang="zh-Hant">{selected.chinese}</p>
            <p lang="zh-Hant">{selected.description.zh}</p>
            <p className="organ-info-en" lang="en">{selected.description.en}</p>
            <button className="organ-clear" onClick={() => patch({selectedId: null})}>取消選取</button>
          </> : <p className="organ-info-empty">點選模型或清單中的構造，會顯示名稱與說明。</p>}
        </section>
        <section className="organ-block">
          <h2>心臟外觀與內部<small>Outside / inside</small></h2>
          <div className="organ-segmented" role="group" aria-label="外觀或內部">
            <button aria-pressed={view.hiddenGroups.length > 0 || view.section.axis === 'none'} onClick={() => patch({...defaults, selectedId: view.selectedId})}>閉合（外表）</button>
            <button aria-pressed={view.hiddenGroups.length === 0 && view.section.axis !== 'none'} onClick={() => patch(OPENED)}>打開心臟（內部）</button>
          </div>
          <small>預設只顯示外表；打開後顯示瓣膜、腱索與乳頭肌，也可用下方切面與各組構造開關逐層查看。</small>
        </section>
        <section className="organ-block">
          <h2>切面<small>Section</small></h2>
          <div className="organ-segmented" role="group" aria-label="切面方向">{AXES.map(axis => <button key={axis} aria-pressed={view.section.axis === axis} onClick={() => axis === 'none' ? patch({section: {...view.section, axis}}) : setView(v => ({...v, section: {axis, offset: .5, flip: CUT[axis].flip}, command: {id: v.command.id + 1, view: CUT[axis].view}}))}>{axis === 'none' ? '完整' : SECTION_AXES[axis].label.slice(0, 2)}</button>)}</div>
          {view.section.axis !== 'none' && <>
            <label className="organ-slider"><span>{SECTION_AXES[view.section.axis].label} · 位置 {Math.round(view.section.offset * 100)}%</span>
              <input type="range" min={0} max={100} value={Math.round(view.section.offset * 100)} aria-label="切面位置" onChange={e => patch({section: {...view.section, offset: +e.target.value / 100}})}/></label>
            <label className="organ-check"><input type="checkbox" checked={view.section.flip} onChange={e => patch({section: {...view.section, flip: e.target.checked}})}/>切除另一側</label>
          </>}
          <label className="organ-check"><input type="checkbox" checked={view.ghostChambers} onChange={e => patch({ghostChambers: e.target.checked})}/>心腔半透明（看清內部構造）</label>
        </section>
        <section className="organ-block">
          <h2>構造<small>Structures</small></h2>
          {grouped.map(g => {
            const hidden = view.hiddenGroups.includes(g.id);
            return <div className="organ-group" key={g.id}>
              <button className="organ-group-head" onClick={() => toggleGroup(g.id)} aria-pressed={!hidden} aria-label={`${hidden ? '顯示' : '隱藏'}${g.label}`}>{hidden ? <EyeOff size={15}/> : <Eye size={15}/>}<span>{g.label}<small>{g.english}</small></span><b>{g.parts.length}</b></button>
              {!hidden && <ul>{g.parts.map((p: HeartPart) => <li key={p.id}><button aria-pressed={view.selectedId === p.id} onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)} onClick={() => patch({selectedId: view.selectedId === p.id ? null : p.id})}><span lang="zh-Hant">{p.chinese}</span><small lang="en">{p.name}</small></button></li>)}</ul>}
            </div>;
          })}
        </section>
        <section className="organ-block organ-note">
          <h2>模型範圍</h2>
          <p>心腔、房室瓣與半月瓣（房室瓣連同腱索）、乳頭肌、冠狀動脈、心臟靜脈與相連大血管。腱索包含在瓣膜模型中，不能單獨選取。</p>
          <p>模型尚未收錄：界嵴、梳狀肌、卵圓窩、節制索、傳導系統（竇房結、房室結、希氏束），以及二尖瓣前尖、三尖瓣前尖與左心室前乳頭肌。</p>
          <p className="organ-source">來源：{catalogue.source}。{catalogue.attribution}。授權 {catalogue.license}。</p>
        </section>
      </aside>
    </div>}
  </main>;
}
