import {Switch} from '@/components/ui/switch';
import type {ReactNode} from 'react';
import {ArrowLeft, ChevronDown, ChevronRight, Eye, EyeOff, RotateCcw} from 'lucide-react';
import './organ.css';

/**
 * Shared page template of every organ "detail mode" (brain first; eye, ear and the viscera plug in later).
 * It owns only the layout and the generic controls; the 3D viewer, the structure groups, the card content, the sections
 * and the peel layers are supplied by each organ. Class names and DOM are the ones of organ.css (`organ-*`).
 * Design notes: docs/organ-detail-template.md
 */

// ---- generic types -------------------------------------------------------------------------------------------------

export type OrganSectionAxis = 'none' | 'sagittal' | 'coronal' | 'horizontal';
export interface OrganSectionState {axis: OrganSectionAxis; offset: number; flip: boolean}
export interface OrganSectionAxisInfo {en: string; zh: string; cut: string}
export interface OrganViewButton {id: string; label: string}
/** The default camera buttons of every detail mode. */
export const ORGAN_VIEWS: readonly OrganViewButton[] = [{id: 'front', label: '前面'}, {id: 'back', label: '後面'}, {id: 'left', label: '左側'}, {id: 'right', label: '右側'}, {id: 'top', label: '上面'}, {id: 'bottom', label: '下面'}];

// ---- the page ------------------------------------------------------------------------------------------------------

export interface OrganDetailLayoutProps {
  /** Shown after "MJ Anatomy" in the header, e.g. "腦部詳細模式". */
  title: string;
  /** Organ-specific feature buttons at the right of the header (e.g. the CSF flow button). */
  headerActions?: ReactNode;
  /** A full-page overlay opened from the header (e.g. the CSF page). While it is set the three columns are inert. */
  overlay?: ReactNode;
  overlayOpen?: boolean;
  /** The columns: build them with the slots below. */
  left: ReactNode;
  stage: ReactNode;
  panel: ReactNode;
  /** aria-labels of the three columns, e.g. "腦部構造清單", "腦部 3D 模型", "腦部控制與說明". */
  labels: {left: string; stage: string; panel: string};
}

export function OrganDetailLayout({title, headerActions, overlay, overlayOpen, left, stage, panel, labels}: OrganDetailLayoutProps) {
  return <main className="organ-app" lang="zh-Hant">
    <header className="organ-header">
      <a className="organ-back" href="#/" aria-label="返回圖譜"><ArrowLeft size={18}/><span>返回圖譜</span></a>
      <div className="organ-brand">MJ Anatomy <span>{title}</span></div>
      {headerActions}
    </header>
    <div className="organ-layout" inert={overlayOpen || undefined} aria-hidden={overlayOpen || undefined}>
      <aside className="organ-left" aria-label={labels.left}><div className="organ-left-body">{left}</div></aside>
      <section className="organ-stage" aria-label={labels.stage}>{stage}</section>
      <aside className="organ-panel" aria-label={labels.panel}>{panel}</aside>
    </div>
    {overlay}
  </main>;
}

// ---- left column ---------------------------------------------------------------------------------------------------

/** Segmented button row (全部開啟／全部關閉, glass cortex, range toggles …). Children are `<button>`s. */
export function OrganSegmented({label, children}: {label: string; children: ReactNode}) {
  return <div className="organ-segmented" role="group" aria-label={label}>{children}</div>;
}

export interface OrganLeftColumnProps {
  /** 全部開啟／全部關閉 */
  onAllOn: () => void;
  onAllOff: () => void;
  /** Organ-specific toggles shown between 全部開關 and the search box (glass cortex, nerve range …). */
  extras?: ReactNode;
  query: string;
  onQuery: (value: string) => void;
  /** Shows 載入中… while the model loads. */
  ready: boolean;
  /** Search results when `query` is not empty, otherwise the structure list (all-structures toggle, group tree, card list …). */
  children: ReactNode;
}

export function OrganLeftColumn({onAllOn, onAllOff, extras, query, onQuery, ready, children}: OrganLeftColumnProps) {
  return <>
    <OrganSegmented label="全部開關"><button onClick={onAllOn}>全部開啟</button><button onClick={onAllOff}>全部關閉</button></OrganSegmented>
    {extras}
    <label className="organ-search"><span className="sr-only">搜尋構造</span><input type="search" value={query} placeholder="Search｜搜尋" onChange={e => onQuery(e.target.value)}/></label>
    {!ready && <p className="organ-info-empty">載入中…</p>}
    {children}
  </>;
}

/** One expandable group (with a count and an on/off switch) of the structure tree. Nest children with the `children` prop. */
export function OrganGroupNode({en, zh, count, depth, expanded, visible, onExpand, onVisible, children}: {
  en: string; zh: string; count: number; depth: number; expanded: boolean; visible: boolean;
  onExpand: () => void; onVisible: () => void; children?: ReactNode;
}) {
  return <div className="organ-group">
    <div className={`system-row organ-group-row ${visible ? 'enabled' : ''}`}>
      <button className="row-arrow" aria-expanded={expanded} aria-label={`${expanded ? '收合' : '展開'}${zh}`} onClick={onExpand}>{expanded ? <ChevronDown size={13}/> : <ChevronRight size={13}/>}</button>
      <button className="system-name" onClick={onExpand} aria-expanded={expanded}><span className="system-dot" style={{background: depth === 0 ? '#8aa0ad' : '#b6c3cb'}}/><span lang="en">{en}<small lang="zh-Hant">{zh}</small></span><span className="system-count">{count}</span></button>
      <Switch checked={visible} onCheckedChange={onVisible} aria-label={`${visible ? '隱藏' : '顯示'}${zh}`}/>
    </div>
    {expanded && <div className="organ-subtree">{children}</div>}
  </div>;
}

/** One selectable structure row. Give `onVisible` to add the eye button of the group tree. */
export function OrganPartRow({selected, en, zh, onSelect, visible, onVisible}: {selected: boolean; en: string; zh: ReactNode; onSelect: () => void; visible?: boolean; onVisible?: () => void}) {
  return <li className="organ-part-row">
    <button aria-pressed={selected} onClick={onSelect}><span lang="en">{en}</span><small lang="zh-Hant">{zh}</small></button>
    {onVisible && <button className="organ-eye" aria-label={`${visible ? '隱藏' : '顯示'}${en}`} onClick={onVisible}>{visible ? <Eye size={14}/> : <EyeOff size={14}/>}</button>}
  </li>;
}

/** The "All structures 全部構造 (n)" button that opens a flat list. */
export function OrganAllToggle({count, open, onToggle}: {count: number; open: boolean; onToggle: () => void}) {
  return <button className="organ-all-toggle" aria-expanded={open} onClick={onToggle}><span lang="en">All structures<small lang="zh-Hant">全部構造</small></span><b>{count}</b>{open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}</button>;
}

// ---- stage ---------------------------------------------------------------------------------------------------------

export interface OrganStageProps {
  /** The organ's own viewer element (`<div className="organ-canvas" ref=…/>`). */
  canvas: ReactNode;
  views?: readonly OrganViewButton[];
  onView: (id: string) => void;
  onReset: () => void;
  ready: boolean;
  error: string;
  percent: number;
  /** Name of the model in the loading box, e.g. "腦部模型" (shown as 載入…). */
  loadingName: string;
  /** Set while a slow operation runs (e.g. computing the smooth cut surface). */
  busy?: {title: string; note: string} | null;
  hint?: string;
  /** Extra overlays (labels, organ-specific buttons) on the stage. */
  children?: ReactNode;
}

export function OrganStage({canvas, views = ORGAN_VIEWS, onView, onReset, ready, error, percent, loadingName, busy, hint = '拖曳旋轉 · 滾輪／雙指縮放 · 點選構造查看名稱', children}: OrganStageProps) {
  return <>
    {canvas}
    <div className="organ-views" aria-label="視角">{views.map(v => <button key={v.id} onClick={() => onView(v.id)}>{v.label}</button>)}
      <button onClick={onReset} aria-label="還原預設" title="還原預設"><RotateCcw size={15}/></button></div>
    {!ready && !error && <div className="organ-progress" role="status"><span className="organ-spinner"/><strong>載入{loadingName}</strong><small>{percent ? `${percent}%` : '…'}</small></div>}
    {busy && <div className="organ-progress" role="status"><span className="organ-spinner"/><strong>{busy.title}</strong><small>{busy.note}</small></div>}
    {error && <div className="organ-error stage" role="alert">{error}</div>}
    {children}
    <p className="organ-hint">{hint}</p>
  </>;
}

// ---- right column --------------------------------------------------------------------------------------------------

export interface OrganPanelProps {
  /** Content of the selected-structure card (empty-state text, title, facts, actions). */
  info: ReactNode;
  /** Omit when the organ has no cutting planes. */
  section?: OrganSectionProps;
  /** Omit when the organ has no peel layers. */
  layers?: OrganLayersProps;
  scope: {text: ReactNode; source?: ReactNode};
  /** Organ-specific collapsible blocks, placed before the model scope block. */
  extraBlocks?: ReactNode;
}

export interface OrganSectionProps {
  axes: Record<Exclude<OrganSectionAxis, 'none'>, OrganSectionAxisInfo>;
  /** axis order of the buttons; default none, sagittal, coronal, horizontal */
  order?: OrganSectionAxis[];
  value: OrganSectionState;
  onAxis: (axis: OrganSectionAxis) => void;
  onChange: (next: OrganSectionState) => void;
  note?: ReactNode;
}

export interface OrganLayersProps {
  peel: number;
  max: number;
  onPeel: (peel: number) => void;
  note: ReactNode;
}

export function OrganPanel({info, section, layers, scope, extraBlocks}: OrganPanelProps) {
  return <>
    <section className="organ-block organ-info" aria-live="polite">{info}</section>
    {section && <OrganSectionBlock {...section}/>}
    {layers && <OrganLayersBlock {...layers}/>}
    {extraBlocks}
    <section className="organ-block organ-note">
      <h2>模型範圍</h2>
      {scope.text}
      {scope.source}
    </section>
  </>;
}

export function OrganSectionBlock({axes, order = ['none', 'sagittal', 'coronal', 'horizontal'], value, onAxis, onChange, note}: OrganSectionProps) {
  return <section className="organ-block">
    <h2>Section<small>切面</small></h2>
    <OrganSegmented label="切面方向">{order.map(axis => <button key={axis} aria-pressed={value.axis === axis} onClick={() => onAxis(axis)}>{axis === 'none' ? '不切' : axes[axis].zh}</button>)}</OrganSegmented>
    {value.axis !== 'none' && <>
      <label className="organ-slider"><span lang="en">{axes[value.axis].en}</span> · {axes[value.axis].cut} · 位置 {Math.round(value.offset * 100)}%
        <input type="range" min={0} max={100} value={Math.round(value.offset * 100)} aria-label="切面位置" onChange={e => onChange({...value, offset: +e.target.value / 100})}/></label>
      <label className="organ-check"><input type="checkbox" checked={value.flip} onChange={e => onChange({...value, flip: e.target.checked})}/>切除另一側</label>
      {note}
    </>}
  </section>;
}

export function OrganLayersBlock({peel, max, onPeel, note}: OrganLayersProps) {
  return <section className="organ-block">
    <h2>Layers<small>逐層剝離</small></h2>
    <OrganSegmented label="逐層剝離">
      <button disabled={peel <= 0} onClick={() => onPeel(Math.max(0, peel - 1))}>Layer back｜回上一層</button>
      <button disabled={peel >= max} onClick={() => onPeel(Math.min(max, peel + 1))}>Peel deeper｜再剝一層</button>
    </OrganSegmented>
    {note}
  </section>;
}
