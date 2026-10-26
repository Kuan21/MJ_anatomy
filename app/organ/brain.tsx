import {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowLeft, ChevronDown, ChevronRight, Eye, EyeOff, RotateCcw} from 'lucide-react';
import {createBrainViewer} from './brain-viewer';
import {createCsfScene, CSF_STEPS, type CsfSource} from './csf-scene';
import {BRAIN_GROUPS, displayEn} from './brain-catalogue';
import {SECTION_AXES, type BrainPart, type BrainView, type BrainViewState, type SectionAxis} from './brain-types';
import './organ.css';

const MAX_PEEL = 7;
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

/** CSF flow animation in its own canvas: it starts when mounted and stops when the panel is closed. */
function CsfPanel({exportRef, onClose}: {exportRef: {current: (() => CsfSource | null) | null}; onClose: () => void}) {
  const host = useRef<HTMLDivElement>(null), [step, setStep] = useState(0), [failed, setFailed] = useState(false);
  useEffect(() => {
    const source = exportRef.current?.();
    if (!source || !host.current) {setFailed(true); return;}
    try {const scene = createCsfScene(host.current, source, setStep); return () => scene.dispose();} catch {setFailed(true);}
  }, [exportRef]);
  const info = CSF_STEPS[step];
  return <aside className="csf-panel" aria-label="腦脊髓液流向動畫">
    <div className="csf-head"><strong>CSF 流向<small>Cerebrospinal fluid flow</small></strong><button className="csf-close" onClick={onClose} aria-label="關閉 CSF 流向動畫">關閉</button></div>
    <div className="csf-canvas" ref={host}>{failed && <p className="organ-error">動畫無法啟動（需要先載入腦部模型與 WebGL）。</p>}</div>
    <div className="csf-caption" aria-live="polite">
      <b>{step + 1} / {CSF_STEPS.length}</b>
      <span lang="en">{info.en}</span>
      <span lang="zh-Hant" className="csf-zh">{info.zh}</span>
      <small lang="zh-Hant">{info.note}</small>
    </div>
    <small className="csf-note">腦室、脈絡叢與上矢狀竇取自腦部模型；孔道、腦池、蛛網膜下腔、脊髓與腰池為示意模型（脊髓段縮短，未依比例）。</small>
  </aside>;
}

export default function BrainDetail() {
  const [view, setView] = useState<BrainViewState>(defaults);
  const [parts, setParts] = useState<BrainPart[]>([]), [ready, setReady] = useState(false), [error, setError] = useState(''), [percent, setPercent] = useState(0);
  const [open, setOpen] = useState<string[]>([]), [csf, setCsf] = useState(false), [cutBusy, setCutBusy] = useState(false);
  const exportRef = useRef<(() => CsfSource | null) | null>(null);
  useEffect(() => {document.title = '腦部詳細模式 · MJ Anatomy';}, []);
  const byId = useMemo(() => new Map(parts.map(p => [p.id, p])), [parts]);
  const selected = view.selectedIds.length === 1 ? byId.get(view.selectedIds[0]) : undefined;
  const patch = (next: Partial<BrainViewState>) => setView(v => ({...v, ...next}));
  const go = (name: BrainView, focus?: string[]) => setView(v => ({...v, command: {id: v.command.id + 1, view: name, focus}}));
  const select = (id: string | null) => {
    if (!id) {patch({selectedIds: []}); return;}
    const p = byId.get(id);
    setView(v => ({...v, selectedIds: v.selectedIds.length === 1 && v.selectedIds[0] === id ? [] : [id], hiddenGroups: p ? v.hiddenGroups.filter(g => g !== p.group) : v.hiddenGroups, hiddenParts: v.hiddenParts.filter(x => x !== id)}));
  };
  const choose = (id: string) => {
    const same = view.selectedIds.length === 1 && view.selectedIds[0] === id;
    select(id);
    if (!same) go('fit', [id]);
  };
  const toggleGroup = (id: string) => patch({hiddenGroups: view.hiddenGroups.includes(id) ? view.hiddenGroups.filter(g => g !== id) : [...view.hiddenGroups, id]});
  const togglePart = (id: string) => patch({hiddenParts: view.hiddenParts.includes(id) ? view.hiddenParts.filter(x => x !== id) : [...view.hiddenParts, id]});
  const grouped = useMemo(() => BRAIN_GROUPS.map(g => ({...g, parts: parts.filter(p => p.group === g.id).sort((a, b) => a.en.localeCompare(b.en) || a.side.localeCompare(b.side))})).filter(g => g.parts.length), [parts]);
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
    <div className={`organ-layout${csf ? ' with-csf' : ''}`}>
      <section className="organ-stage" aria-label="腦部 3D 模型">
        <BrainScene view={view} exportRef={exportRef} onReady={p => {setParts(p); setReady(true);}} onError={setError} onProgress={setPercent} onPick={select} onBusy={setCutBusy}/>
        <div className="organ-views" aria-label="視角">{([['front', '前面'], ['back', '後面'], ['left', '左側'], ['right', '右側'], ['top', '上面'], ['bottom', '下面']] as const).map(([id, label]) => <button key={id} onClick={() => go(id)}>{label}</button>)}
          <button onClick={reset} aria-label="還原預設" title="還原預設"><RotateCcw size={15}/></button></div>
        {!ready && !error && <div className="organ-progress" role="status"><span className="organ-spinner"/><strong>載入腦部模型</strong><small>{percent ? `${percent}%` : '…'}</small></div>}
        {cutBusy && <div className="organ-progress" role="status"><span className="organ-spinner"/><strong>正在計算平滑切面</strong><small>第一次切開需要幾秒</small></div>}
        {error && <div className="organ-error stage" role="alert">{error}</div>}
        <p className="organ-hint">拖曳旋轉 · 滾輪／雙指縮放 · 點選構造查看名稱</p>
      </section>
      <aside className="organ-panel" aria-label="腦部控制與說明">
        <section className="organ-block organ-info" aria-live="polite">
          {selected ? <>
            <h2 className="organ-info-title" lang="en">{displayEn(selected)}</h2>
            <p className="organ-info-zh" lang="zh-Hant">{selected.zh || '（尚無中文名稱）'}</p>
            <p lang="zh-Hant">分區：{BRAIN_GROUPS.find(g => g.id === selected.group)?.zh}｜{SIDE_ZH[selected.side]}{selected.region && selected.region !== selected.cat ? `｜${selected.region}` : ''}</p>
            <p className="organ-info-en" lang="en">Group: {BRAIN_GROUPS.find(g => g.id === selected.group)?.en}. Source: Brain Project (Z-Anatomy / BodyParts3D).</p>
            <div className="organ-actions" role="group" aria-label="選取動作">
              <button onClick={() => go('fit', [selected.id])}>Focus</button>
              <button aria-pressed={!!view.isolate} onClick={() => patch({isolate: view.isolate ? null : [selected.id]})}>Isolate</button>
              <button onClick={() => patch({hiddenParts: [...view.hiddenParts, selected.id], selectedIds: []})}>Hide</button>
              <button onClick={() => patch({selectedIds: [], isolate: null})}>Clear</button>
            </div>
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
        <section className="organ-block">
          <h2>構造<small>Structures</small></h2>
          <div className="organ-segmented" role="group" aria-label="全部開關">
            <button onClick={() => patch({hiddenGroups: [], hiddenParts: [], isolate: null})}>全部開啟</button>
            <button onClick={() => patch({hiddenGroups: BRAIN_GROUPS.map(g => g.id), isolate: null})}>全部關閉</button>
          </div>
          {!ready && <p className="organ-info-empty">載入中…</p>}
          {grouped.map(g => {
            const hidden = view.hiddenGroups.includes(g.id), expanded = open.includes(g.id);
            return <div className="organ-group" key={g.id}>
              <div className="organ-group-row">
                <button className="organ-group-head" onClick={() => toggleGroup(g.id)} aria-pressed={!hidden} aria-label={`${hidden ? '顯示' : '隱藏'}${g.zh}`}>{hidden ? <EyeOff size={15}/> : <Eye size={15}/>}<span lang="en">{g.en}<small lang="zh-Hant">{g.zh}</small></span><b>{g.parts.length}</b></button>
                <button className="organ-expand" aria-expanded={expanded} aria-label={`${expanded ? '收合' : '展開'}${g.zh}`} onClick={() => setOpen(o => expanded ? o.filter(x => x !== g.id) : [...o, g.id])}>{expanded ? <ChevronDown size={15}/> : <ChevronRight size={15}/>}</button>
              </div>
              {expanded && <ul>{g.parts.map(p => <li key={p.id} className="organ-part-row">
                <button aria-pressed={view.selectedIds.includes(p.id)} onClick={() => choose(p.id)}><span lang="en">{displayEn(p)}</span><small lang="zh-Hant">{p.zh}</small></button>
                <button className="organ-eye" aria-label={`${view.hiddenParts.includes(p.id) ? '顯示' : '隱藏'}${displayEn(p)}`} onClick={() => togglePart(p.id)}>{view.hiddenParts.includes(p.id) ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
              </li>)}</ul>}
            </div>;
          })}
        </section>
        <section className="organ-block organ-note">
          <h2>模型範圍</h2>
          <p>皮質各葉、腦溝與腦迴、小腦、腦幹、白質纖維束、基底核、間腦、腦室與脈絡叢、腦神經根部、腦動脈（含 Willis 環）、靜脈竇與硬腦膜反摺。已移除脊髓與脊神經等不屬於腦的構造。</p>
          <p className="organ-source">來源：Brain Project（Z-Anatomy / BodyParts3D），CC BY-SA 4.0。切面灰白質分界為依皮質表面向內約 2.4 mm 產生的示意（體素 0.9 mm，以平滑場取等值面）。</p>
        </section>
      </aside>
      {csf && <CsfPanel exportRef={exportRef} onClose={() => setCsf(false)}/>}
    </div>
  </main>;
}
