import {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowLeft, ChevronDown, ChevronRight, Eye, EyeOff, RotateCcw} from 'lucide-react';
import {fetchModelBuffer} from '../model-download';
import {createHeartViewer} from './heart-viewer';
import {CHAMBERS, chamberView, type ChamberItem} from './heart-chambers';
import {VESSEL_GROUPS, isFineBranch} from './heart-vessels';
import {SECTION_AXES, type HeartCatalogue, type HeartPart, type HeartView, type HeartViewState, type SectionAxis} from './heart-types';
import './organ.css';

const LEAFLET_LABEL: Record<string, string> = {
  'Anterior cusp of tricuspid valve': 'Tricuspid · anterior', 'Posterior cusp of tricuspid valve': 'Tricuspid · posterior', 'Septal cusp of tricuspid valve': 'Tricuspid · septal',
  'Anterior cusp of bicuspid valve': 'Bicuspid · anterior', 'Posterior cusp of bicuspid valve': 'Bicuspid · posterior',
  'Chordae tendineae of tricuspid valve': 'Chordae · tricuspid', 'Chordae tendineae of bicuspid valve': 'Chordae · bicuspid',
  'Left coronary cusp of aortic valve': 'Aortic · left coronary', 'Right coronary cusp of aortic valve': 'Aortic · right coronary', 'Non-coronary cusp of aortic valve': 'Aortic · non-coronary',
  'Anterior semilunar cusp of pulmonary valve': 'Pulmonary · anterior', 'Left semilunar cusp of pulmonary valve': 'Pulmonary · left', 'Right semilunar cusp of pulmonary valve': 'Pulmonary · right',
};
interface LabelSpec {id: string; en: string; zh: string; ids: string[]}
function HeartScene({catalogue, view, labels, onProgress, onReady, onError, onPick}: {
  catalogue: HeartCatalogue; view: HeartViewState; labels: LabelSpec[];
  onProgress: (loaded: number, total: number) => void; onReady: () => void; onError: (message: string) => void;
  onPick: (id: string | null) => void;
}) {
  const host = useRef<HTMLDivElement>(null), viewer = useRef<ReturnType<typeof createHeartViewer> | null>(null);
  const callbacks = useRef({onProgress, onReady, onError, onPick}); callbacks.current = {onProgress, onReady, onError, onPick};
  const latest = useRef(view); latest.current = view;
  useEffect(() => {
    try {
      viewer.current = createHeartViewer(host.current!, catalogue, {
        progress: (a, b) => callbacks.current.onProgress(a, b), ready: () => callbacks.current.onReady(), error: m => callbacks.current.onError(m),
        pick: id => callbacks.current.onPick(id), hover: () => {},
      });
      viewer.current.update(latest.current);
    } catch {callbacks.current.onError('無法啟動 3D 顯示。請改用支援 WebGL 的瀏覽器開啟。');}
    return () => {viewer.current?.dispose(); viewer.current = null;};
  }, [catalogue]);
  useEffect(() => {viewer.current?.update(view);}, [view]);
  useEffect(() => {viewer.current?.setLabels(labels);}, [labels]);
  return <div className="organ-canvas" ref={host}/>;
}

// Closed heart by default: the outside (chambers as the epicardial surface, coronary vessels, great vessels). Valves, chordae and papillary muscles appear when the heart is opened.
const INTERNAL = ['papillary', 'valves', 'interior', 'pericardium'];
const defaults: HeartViewState = {hiddenGroups: INTERNAL, hiddenParts: [], trunkOnly: false, selectedId: null, section: {axis: 'none', offset: .5, flip: true}, ghostChambers: false, openChamber: null, highlight: [], command: {id: 0, view: 'front'}};
const OPENED: Partial<HeartViewState> = {openChamber: null, highlight: [], hiddenGroups: ['pericardium'], section: {axis: 'coronal', offset: .5, flip: true}, ghostChambers: true};
const AXES: SectionAxis[] = ['none', 'coronal', 'sagittal', 'transverse'];
/** Each cut removes the half facing the camera that looks into it: coronal from the front, sagittal from the body's right, transverse from above. */
const CUT: Record<Exclude<SectionAxis, 'none'>, {flip: boolean; view: HeartView}> = {coronal: {flip: true, view: 'front'}, sagittal: {flip: false, view: 'right'}, transverse: {flip: true, view: 'top'}};

export default function HeartDetail() {
  const [catalogue, setCatalogue] = useState<HeartCatalogue | null>(null), [catalogueError, setCatalogueError] = useState(''), [retry, setRetry] = useState(0);
  const [view, setView] = useState<HeartViewState>(defaults);
  const [item, setItem] = useState<ChamberItem | null>(null), [labelOn, setLabelOn] = useState({valves: false, leaflets: false});
  const [load, setLoad] = useState({loaded: 0, total: 0}), [ready, setReady] = useState(false), [error, setError] = useState(''), [openGroups, setOpenGroups] = useState<string[]>([]);
  useEffect(() => {if (!view.openChamber) setItem(null);}, [view.openChamber]);
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
  const patch = (next: Partial<HeartViewState>) => setView(v => ({...v, ...next}));
  const go = (name: HeartView) => setView(v => ({...v, command: {id: v.command.id + 1, view: name}}));
  const toggleGroup = (id: string) => patch({hiddenGroups: view.hiddenGroups.includes(id) ? view.hiddenGroups.filter(g => g !== id) : [...view.hiddenGroups, id]});
  const chamber = CHAMBERS.find(c => c.id === view.openChamber);
  /** Vessel visibility before the heart was opened: closing the chamber (or the heart) puts the vessels back as the user had them. */
  const before = useRef<{hiddenGroups: string[]; hiddenParts: string[]} | null>(null);
  const fineIds = useMemo(() => (catalogue?.parts ?? []).filter(p => isFineBranch(p.name)).map(p => p.id), [catalogue]);
  /** Opening: the fine surface branches and the pericardium are hidden, the great vessels and main coronary vessels stay. */
  const hideFine = (v: HeartViewState): Partial<HeartViewState> => {
    if (!before.current) before.current = {hiddenGroups: v.hiddenGroups, hiddenParts: v.hiddenParts};
    return {hiddenParts: [...new Set([...v.hiddenParts, ...fineIds])], trunkOnly: true};
  };
  /** Closing: vessel groups and fine branches go back to what they were before opening (nothing the user had switched off is switched on). */
  const restoreVessels = (v: HeartViewState, base: string[]): Partial<HeartViewState> => {
    const b = before.current; before.current = null;
    if (!b) return {hiddenGroups: base, hiddenParts: v.hiddenParts.filter(id => !fineIds.includes(id)), trunkOnly: false};
    const keep = base.filter(g => !(VESSEL_GROUPS as readonly string[]).includes(g)), vessels = b.hiddenGroups.filter(g => (VESSEL_GROUPS as readonly string[]).includes(g));
    return {hiddenGroups: [...keep, ...vessels], hiddenParts: b.hiddenParts, trunkOnly: false};
  };
  const idsOf = (names: string[]) => (catalogue?.parts ?? []).filter(p => names.includes(p.name)).map(p => p.id);
  const openChamber = (id: string | null) => {
    setItem(null);
    const c = CHAMBERS.find(x => x.id === id), v = view;
    const base = {...v, ...defaults, command: {id: v.command.id + 1, view: c ? chamberView(c) : 'front', look: c?.look, focus: c?.wall}, openChamber: c ? c.id : null} as HeartViewState;
    if (c) {
      // the vessel groups the user switched off stay off while the chamber is open
      const keepOff = v.hiddenGroups.filter(g => (VESSEL_GROUPS as readonly string[]).includes(g) && g !== 'pericardium');
      setView({...base, hiddenGroups: [...new Set([...defaults.hiddenGroups, ...keepOff])], ...hideFine(v)});
    } else setView({...base, ...restoreVessels(v, defaults.hiddenGroups)});
  };
  /** 打開心臟（內部）／閉合（外表）: same vessel handling as opening a chamber. */
  const openHeart = () => setView({...view, ...OPENED, ...hideFine(view)});
  const closeHeart = () => setView({...view, ...defaults, selectedId: view.selectedId, ...restoreVessels(view, defaults.hiddenGroups)});
  // Opened from the atlas search (#/organ/heart?select=<name>): select that structure once the model is ready (opening the heart when it lies inside), then drop the query so a reload does not reselect it.
  useEffect(() => {
    if (!ready || !catalogue) return;
    const wanted = new URLSearchParams(location.hash.split('?')[1] ?? '').get('select');
    if (!wanted) return;
    const norm = (s: string) => s.toLowerCase().replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
    const hit = catalogue.parts.find(p => norm(p.name) === norm(wanted));
    history.replaceState(null, '', location.pathname + location.search + '#/organ/heart');
    if (!hit) return;
    setItem(null);
    const inside = ['interior', 'papillary', 'valves'].includes(hit.group);
    setView(v => inside && !v.ghostChambers ? {...v, ...OPENED, ...hideFine(v), selectedId: hit.id, command: {id: v.command.id + 1, view: 'fit'}} : {...v, selectedId: hit.id, highlight: [], command: {id: v.command.id + 1, view: 'fit'}});
  }, [ready, catalogue]);
  const chooseItem = (next: ChamberItem) => {
    const same = item?.en === next.en;
    setItem(same ? null : next);
    patch({selectedId: null, highlight: same ? [] : idsOf(next.parts)});
  };
  const labelSpecs = useMemo<LabelSpec[]>(() => {
    if (!catalogue) return [];
    const idsOf2 = (names: string[]) => catalogue.parts.filter(p => names.includes(p.name)).map(p => p.id);
    const list: LabelSpec[] = [];
    if (labelOn.valves) for (const [id, en, zh, names] of [
      ['v-tri', 'Tricuspid valve', '三尖瓣', CHAMBERS[1].inside.filter(n => /tricuspid valve/.test(n) && !/^Chordae/.test(n))],
      ['v-mit', 'Bicuspid valve', '二尖瓣', CHAMBERS[3].inside.filter(n => /bicuspid valve/.test(n) && !/^Chordae/.test(n))],
      ['v-aor', 'Aortic valve', '主動脈瓣', CHAMBERS[3].inside.filter(n => /aortic valve/.test(n))],
      ['v-pul', 'Pulmonary valve', '肺動脈瓣', CHAMBERS[1].inside.filter(n => /pulmonary valve/.test(n))],
    ] as [string, string, string, string[]][]) list.push({id, en, zh, ids: idsOf2(names)});
    if (labelOn.leaflets) for (const p of catalogue.parts) if (p.group === 'valves') list.push({id: p.id, en: LEAFLET_LABEL[p.name] ?? p.name, zh: p.chinese, ids: [p.id]});
    return list;
  }, [catalogue, labelOn]);
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
      <aside className="organ-left organ-left-heart" aria-label="心臟構造清單">
        <section className="organ-block">
          <h2>Open one chamber<small>逐個心腔打開</small></h2>
          <div className="organ-segmented organ-chambers" role="group" aria-label="選擇心腔">
            {CHAMBERS.map(c => <button key={c.id} aria-pressed={view.openChamber === c.id} onClick={() => openChamber(view.openChamber === c.id ? null : c.id)}><span lang="en">{c.en}</span><small lang="zh-Hant">{c.zh}</small></button>)}
          </div>
          {chamber ? <>
            <small>只切開{chamber.zh}面向鏡頭的那一側外壁（其餘外壁保持完整），鏡頭已轉到適合看入內部的角度；轉動模型時，切開的位置會跟著鏡頭移動。腔內構造不透明並有補光；選取構造時，擋在前面的構造會變半透明，被擋住的部分以虛線外框顯示。再按一次同一個心腔可還原。</small>
            <ul className="organ-chamber-items" aria-label={`${chamber.zh}內的構造`}>{chamber.items.map(it => <li key={it.en}>
              <button aria-pressed={item?.en === it.en} onClick={() => chooseItem(it)}><span lang="en">{it.en}</span><small lang="zh-Hant">{it.zh}</small>{it.parts.length === 0 && <i className="organ-nomodel-tag" lang="zh-Hant">無模型</i>}</button></li>)}</ul>
          </> : <small>選擇一個心腔，只打開該心腔的外壁，並列出腔內構造；點選清單可在模型上高亮。</small>}
        </section>
        <section className="organ-block">
          <h2>Structures<small>構造</small></h2>
          <div className="organ-segmented" role="group" aria-label="全部開關">
            <button onClick={() => patch({hiddenGroups: []})}>全部顯示</button>
            <button onClick={() => patch({hiddenGroups: grouped.map(g => g.id)})}>全部隱藏</button>
          </div>
          {grouped.map(g => {
            const hidden = view.hiddenGroups.includes(g.id), expanded = openGroups.includes(g.id);
            return <div className="organ-group" key={g.id}>
              <div className="organ-group-row">
                <button className="organ-group-head" onClick={() => toggleGroup(g.id)} aria-pressed={!hidden} aria-label={`${hidden ? '顯示' : '隱藏'}${g.label}`}>{hidden ? <EyeOff size={15}/> : <Eye size={15}/>}<span lang="en">{g.english}<small lang="zh-Hant">{g.label}</small></span><b>{g.parts.length}</b></button>
                <button className="organ-expand" aria-expanded={expanded} aria-label={`${expanded ? '收合' : '展開'}${g.label}`} onClick={() => setOpenGroups(o => expanded ? o.filter(x => x !== g.id) : [...o, g.id])}>{expanded ? <ChevronDown size={15}/> : <ChevronRight size={15}/>}</button>
              </div>
              {expanded && <ul>{g.parts.map((p: HeartPart) => <li key={p.id} className={view.hiddenParts.includes(p.id) ? 'organ-part-hidden' : undefined}><button className="organ-part-eye" aria-pressed={!view.hiddenParts.includes(p.id)} aria-label={`${view.hiddenParts.includes(p.id) ? '顯示' : '隱藏'}${p.chinese}`} title={view.hiddenParts.includes(p.id) ? '已隱藏（打開心腔時隱藏的細分支）；按一下顯示' : '按一下隱藏'} onClick={() => patch({hiddenParts: view.hiddenParts.includes(p.id) ? view.hiddenParts.filter(x => x !== p.id) : [...view.hiddenParts, p.id]})}>{view.hiddenParts.includes(p.id) ? <EyeOff size={13}/> : <Eye size={13}/>}</button><button aria-pressed={view.selectedId === p.id} onClick={() => patch({selectedId: view.selectedId === p.id ? null : p.id, hiddenGroups: view.hiddenGroups.filter(x => x !== g.id), hiddenParts: view.hiddenParts.filter(x => x !== p.id)})}><span lang="en">{p.name}</span><small lang="zh-Hant">{p.chinese}</small>{p.origin === '示意構造' && <i className="organ-nomodel-tag organ-mj-tag" lang="zh-Hant">示意構造</i>}</button></li>)}</ul>}
            </div>;
          })}
        </section>
      </aside>
      <section className="organ-stage" aria-label="心臟 3D 模型">
        <HeartScene catalogue={catalogue} view={view} labels={labelSpecs} onProgress={(loaded, total) => setLoad({loaded, total})} onReady={() => setReady(true)} onError={setError}
          onPick={id => patch({selectedId: id})}/>
        <div className="organ-views" aria-label="視角">{([['front', '前面'], ['back', '後面'], ['left', '左側'], ['right', '右側'], ['top', '上面']] as const).map(([id, label]) => <button key={id} onClick={() => go(id)}>{label}</button>)}
          <button onClick={() => {before.current = null; setView(v => ({...defaults, command: {id: v.command.id + 1, view: 'front'}}));}} aria-label="還原預設" title="還原預設"><RotateCcw size={15}/></button></div>
        {!ready && !error && <div className="organ-progress" role="status"><span className="organ-spinner"/><strong>載入心臟模型</strong><small>{load.loaded} / {load.total || '…'} 個模型套件</small></div>}
        {error && <div className="organ-error stage" role="alert">{error}</div>}
        <p className="organ-hint">拖曳旋轉 · 滾輪／雙指縮放 · 點選構造查看說明</p>
      </section>
      <aside className="organ-panel organ-panel-split" aria-label="心臟控制與說明">
        <section className="organ-block organ-info" aria-live="polite">
          {item && !selected ? <>
            <h2 className="organ-info-title" lang="en">{item.en}</h2>
            <p className="organ-info-zh" lang="zh-Hant">{item.zh}</p>
            <p lang="zh-Hant">{item.zhDesc}</p>
            <p className="organ-info-en" lang="en">{item.enDesc}</p>
            {item.parts.length === 0 && <p className="organ-nomodel" lang="zh-Hant">此構造在目前的模型中沒有對應的三維網格，因此無法在模型上高亮，只提供文字說明。</p>}
            <button className="organ-clear" onClick={() => {setItem(null); patch({highlight: []});}}>取消選取</button>
          </> : selected ? <>
            <h2 className="organ-info-title" lang="en">{selected.name}</h2>
            <p className="organ-info-zh" lang="zh-Hant">{selected.chinese}</p>
            <p lang="zh-Hant">{selected.description.zh}</p>
            <p className="organ-info-en" lang="en">{selected.description.en}</p>
            <button className="organ-clear" onClick={() => patch({selectedId: null})}>取消選取</button>
          </> : <p className="organ-info-empty">點選模型或清單中的構造，會顯示名稱與說明。</p>}
        </section>
        <div className="organ-panel-scroll">
        <section className="organ-block">
          <h2>Outside / inside<small>心臟外觀與內部</small></h2>
          <div className="organ-segmented" role="group" aria-label="外觀或內部">
            <button aria-pressed={view.hiddenGroups.length > 0 || view.section.axis === 'none'} onClick={closeHeart}>閉合（外表）</button>
            <button aria-pressed={view.hiddenGroups.length === 0 && view.section.axis !== 'none'} onClick={openHeart}>打開心臟（內部）</button>
          </div>
          <small>預設只顯示外表；打開後顯示瓣膜、腱索與乳突肌，也可用下方切面與各組構造開關逐層查看。</small>
        </section>
        <section className="organ-block">
          <h2>Labels<small>名稱標籤</small></h2>
          <div className="organ-segmented" role="group" aria-label="名稱標籤">
            <button aria-pressed={labelOn.valves} onClick={() => setLabelOn(v => ({...v, valves: !v.valves}))}><span lang="en">Valves</span><small lang="zh-Hant">瓣膜</small></button>
            <button aria-pressed={labelOn.leaflets} onClick={() => setLabelOn(v => ({...v, leaflets: !v.leaflets}))}><span lang="en">Cusps</span><small lang="zh-Hant">瓣葉與腱索</small></button>
          </div>
          <small>標籤放在畫面左右兩側，以細線連到構造，隨構造轉動；只標示目前可見的瓣膜、瓣葉與腱索（瓣膜預設在心腔內，需先打開心腔）。</small>
        </section>
        <section className="organ-block">
          <h2>Section<small>切面</small></h2>
          <div className="organ-segmented" role="group" aria-label="切面方向">{AXES.map(axis => <button key={axis} aria-pressed={view.section.axis === axis} onClick={() => axis === 'none' ? setView(v => ({...v, section: {...v.section, axis}, openChamber: null, highlight: [], ...(v.openChamber ? restoreVessels(v, INTERNAL) : {})})) : setView(v => ({...v, openChamber: null, highlight: [], ...(v.openChamber ? restoreVessels(v, INTERNAL) : {}), section: {axis, offset: .5, flip: CUT[axis].flip}, command: {id: v.command.id + 1, view: CUT[axis].view}}))}>{axis === 'none' ? '完整' : SECTION_AXES[axis].label.slice(0, 2)}</button>)}</div>
          {view.section.axis !== 'none' && <>
            <label className="organ-slider"><span>{SECTION_AXES[view.section.axis].label} · 位置 {Math.round(view.section.offset * 100)}%</span>
              <input type="range" min={0} max={100} value={Math.round(view.section.offset * 100)} aria-label="切面位置" onChange={e => patch({section: {...view.section, offset: +e.target.value / 100}})}/></label>
            <label className="organ-check"><input type="checkbox" checked={view.section.flip} onChange={e => patch({section: {...view.section, flip: e.target.checked}})}/>切除另一側</label>
          </>}
          <label className="organ-check"><input type="checkbox" checked={view.ghostChambers} onChange={e => patch({ghostChambers: e.target.checked})}/>心腔半透明（看清內部構造）</label>
        </section>
        <section className="organ-block organ-note">
          <h2>模型範圍</h2>
          <p>心腔、房室瓣（二尖瓣、三尖瓣）與半月瓣、腱索、乳突肌、冠狀動脈與心臟靜脈、上下腔靜脈、肺靜脈與相連大血管，以及心包膜三層。房室瓣的瓣葉、乳突肌與腱索皆為依房室環與來源模型位置生成的示意構造，腱索可單獨選取。右緣支、後室間支、對角支、心小靜脈與心前靜脈取自另一公開圖譜並對齊到同一心臟；心包膜三層由心壁向外偏移生成，為示意模型。</p>
          <p>來源模型沒有、依解剖知識補建的構造（清單中標示「示意構造」，位置與形狀為示意）：二尖瓣與三尖瓣的瓣葉、乳突肌、腱索、界嵴、梳狀肌、卵圓窩、心房中隔、左右心耳、室間隔、肉柱、節制索、室上嵴、動脈圓錐、主動脈前庭、竇房結動脈、左緣支、心包橫竇與心包斜竇。卵圓瓣痕跡仍沒有模型，只提供文字說明；傳導系統（竇房結、房室結、希氏束）本模式未收錄。</p>
          <p className="organ-source">模型來源與授權見圖譜首頁的 Source & credits。</p>
        </section>
        </div>
      </aside>
    </div>}
  </main>;
}
