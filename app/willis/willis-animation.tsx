import {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import '../ear-hearing/hearing.css';
import './willis.css';
import {
  advance, BLOCK_CHOICES, goTo, initialPlay, LEVEL_ZH, perfusionLevel, solveFlow, SPEED_SLIDER, stepBy, STEP_COUNT, TERRITORIES, WILLIS_NOTE, WILLIS_STEPS,
  type PlayState, type SegmentId,
} from './willis-data';
import {createWillisScene, TERRITORY_COLOUR} from './willis-scene';

type Scene = ReturnType<typeof createWillisScene>;
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const BLOCK_STEP = WILLIS_STEPS.findIndex(s => s.id === 'block');

/** The circle of Willis animation of the brain detail mode: a full-page layer (the brain detail mode underneath stays mounted) with the 3D arteries and moving dots, the four steps,
 *  and a choice of one artery to block. Text, the flow network and the solver are in willis-data.ts; the layout and controls are the hearing animation's (hearing.css). */
export default function WillisAnimation({onClose}: {onClose: () => void}) {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const play = useRef<PlayState>(initialPlay(reduced()));
  const [speed, setSpeed] = useState<number>(SPEED_SLIDER.initial), [blocked, setBlocked] = useState<SegmentId | null>(null), [thinPcom, setThinPcom] = useState(false);
  const [ready, setReady] = useState(false), [percent, setPercent] = useState(0), [error, setError] = useState('');
  const speedRef = useRef(speed); speedRef.current = speed;
  const host = useRef<HTMLDivElement>(null), scene = useRef<Scene | null>(null);
  const step = play.current.step, info = WILLIS_STEPS[step];
  const flow = useMemo(() => solveFlow({blocked, thinPcom}), [blocked, thinPcom]);
  const choice = BLOCK_CHOICES.find(c => c.id === blocked) ?? null;

  const apply = useCallback((next: PlayState) => {const changed = next.step !== play.current.step; play.current = next; if (changed) rerender();}, []);
  const go = useCallback((i: number) => apply(goTo(play.current, i)), [apply]);

  useEffect(() => {
    try {
      scene.current = createWillisScene(host.current!, {progress: setPercent, ready: () => setReady(true), error: setError});
    } catch {setError('無法啟動 3D 顯示。請改用支援 WebGL 的瀏覽器開啟。');}
    return () => {scene.current?.dispose(); scene.current = null;};
  }, []);
  useEffect(() => {scene.current?.setStep(info.id);}, [info.id, ready]);
  useEffect(() => {scene.current?.setFlow(flow, blocked);}, [flow, blocked, ready]);

  useEffect(() => {
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const before = play.current, next = advance(before, dt, speedRef.current);
      if (next !== before) apply(next);
      scene.current?.tick(play.current.t);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [apply]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight') apply(stepBy(play.current, 1));
      if (e.key === 'ArrowLeft') apply(stepBy(play.current, -1));
      if (e.key === ' ') {e.preventDefault(); apply({...play.current, playing: !play.current.playing}); rerender();}
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [onClose, apply]);

  const chooseBlock = (id: SegmentId | null) => {setBlocked(id); if (id && play.current.step !== BLOCK_STEP) go(BLOCK_STEP);};
  const p = play.current, showFlow = info.id === 'block' || info.id === 'branches';
  return <div className="hear-page willis-page" role="dialog" aria-label="Willis 環血流動畫" lang="zh-Hant">
    <header className="hear-head">
      <strong lang="en">Circle of Willis: blood flow and collaterals<small lang="zh-Hant">大腦動脈環（Willis 環）：血流、分支與側支循環</small></strong>
      <button className="hear-close" onClick={onClose} aria-label="關閉 Willis 環動畫，回到腦部模式">關閉</button>
    </header>
    <nav className="hear-steps" aria-label="動畫步驟">
      {WILLIS_STEPS.map((s, i) => <button key={s.id} aria-current={i === step ? 'step' : undefined} onClick={() => go(i)}><b>{i + 1}</b><span>{s.short}</span></button>)}
    </nav>
    <div className="hear-body">
      <section className="hear-stage" aria-label="Willis 環 3D 動畫">
        <div className="hear-layer" ref={host}/>
        {!ready && !error && <div className="hear-loading" role="status"><span className="organ-spinner"/><strong>載入腦部模型</strong><small>{percent ? `${percent}%` : '…'}</small></div>}
        {error && <div className="organ-error stage" role="alert">{error}</div>}
        {info.id === 'branches' && <div className="willis-legend" aria-label="供血區顏色">
          {([['aca', 'ACA', '前大腦動脈'], ['mca', 'MCA', '中大腦動脈'], ['pca', 'PCA', '後大腦動脈'], ['pf', 'Vertebrobasilar', '腦幹與小腦']] as const).map(([k, en, zh]) => <span key={k}><i style={{background: TERRITORY_COLOUR[k]}}/><b lang="en">{en}</b><small>{zh}</small></span>)}
        </div>}
        {info.id === 'block' && <div className="willis-legend" aria-label="血流狀態顏色">
          <span><i className="dot"/><b lang="en">Flow</b><small>正常方向血流</small></span>
          <span><i className="dot rev"/><b lang="en">Collateral</b><small>方向倒轉（側支）</small></span>
          <span><i style={{background: '#f2c94c'}}/><b lang="en">Reduced</b><small>血流下降</small></span>
          <span><i style={{background: '#e4572e'}}/><b lang="en">Ischaemia</b><small>缺血</small></span>
        </div>}
        <div className="hear-controls">
          <div className="hear-btns">
            <button aria-label="上一步" onClick={() => apply(stepBy(play.current, -1))}>◀ 上一步</button>
            <button className="primary" aria-pressed={p.playing} onClick={() => {apply({...play.current, playing: !play.current.playing}); rerender();}}>{p.playing ? '暫停' : '播放'}</button>
            <button aria-label="下一步" onClick={() => apply(stepBy(play.current, 1))}>下一步 ▶</button>
          </div>
          <label className="willis-block"><span>Block 阻塞</span>
            <select value={blocked ?? ''} aria-label="選擇阻塞的動脈" onChange={e => chooseBlock((e.target.value || null) as SegmentId | null)}>
              <option value="">無（正常血流）</option>
              {BLOCK_CHOICES.map(c => <option key={c.id} value={c.id}>{c.zh}</option>)}
            </select>
          </label>
          <label className="hear-auto"><input type="checkbox" checked={thinPcom} onChange={e => setThinPcom(e.target.checked)}/>後交通支細小（不完整的環）</label>
          <label className="hear-slider"><span>Speed 速度 <b>{speed.toFixed(1)}×</b></span><input type="range" min={SPEED_SLIDER.min} max={SPEED_SLIDER.max} step={SPEED_SLIDER.step} value={speed} aria-label="速度" onChange={e => setSpeed(+e.target.value)}/></label>
          <button className="willis-reset" onClick={() => scene.current?.resetView()}>重設視角</button>
          <label className="hear-auto"><input type="checkbox" checked={p.auto} onChange={e => {apply({...play.current, auto: e.target.checked}); rerender();}}/>自動切換下一步</label>
        </div>
      </section>
      <aside className="hear-side" aria-live="polite">
        <p className="hear-kicker">STEP {step + 1} / {STEP_COUNT}</p>
        <h2 lang="en">{info.en}<small lang="zh-Hant">{info.zh}</small></h2>
        <ul>{info.points.map(t => <li key={t}>{t}</li>)}</ul>
        {showFlow && <div className="willis-perfusion">
          <p className="willis-result">{choice ? <><b>✕ {choice.zh}</b>　{choice.result}{thinPcom ? '（目前勾選後交通支細小：經後交通支的代償變差，結果以下表為準。）' : ''}</> : thinPcom ? '後交通支細小：正常情況下各供血區仍足夠；選一條動脈阻塞，比較與完整的環有何不同。' : '未選阻塞：各供血區血流足夠。'}</p>
          <table aria-label="各供血區血流">
            <thead><tr><th>供血區</th><th>血流（以正常為 100%）</th><th>狀態</th></tr></thead>
            <tbody>{TERRITORIES.map(t => {const v = flow.perfusion[t.id], level = perfusionLevel(v); return <tr key={t.id} className={level}>
              <td><span lang="en">{t.en}</span><small>{t.zh}</small></td>
              <td><span className="willis-bar"><i style={{width: `${Math.min(100, v * 100)}%`}}/></span>{Math.round(Math.min(1, v) * 100)}%</td>
              <td>{LEVEL_ZH[level]}</td></tr>;})}</tbody>
          </table>
        </div>}
        <p className="hear-tip"><b>{info.tip.label}</b>　{info.tip.text}</p>
        <p className="hear-note">{WILLIS_NOTE}</p>
      </aside>
    </div>
  </div>;
}
