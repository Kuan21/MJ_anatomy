import {useEffect, useMemo, useRef, useState} from 'react';
import {AlertCircle, ArrowLeft, ArrowRight, Check, Target, X} from 'lucide-react';
import {QUIZ_CATEGORIES, QUIZ_REGIONS, categoryOf, learnHashOf, type QuizCatalogue, type QuizRegionId, type QuizStructure} from './catalogue';
import {ModeNav} from './mode-nav';
import {CategoryPicker, RegionPicker, toggleRegionIn, toggleSectionIn} from './setup-parts';
import {EXAM_DEFAULTS, EXAM_LIMITS, clock, loadExamSetup, saveExamSetup, remainingSeconds, withSide, type ExamSetup} from './exam-setup';
import {composeExam, difficultyMap, examEligible, needsSide, type Difficulty, type ExamQuestion} from './exam-difficulty';
import {settingsFor} from './setup';
import {namingPool} from './level2';
import {judgeName, relationOf} from './naming';
import {addMistakes, scopeOf} from './mistakes';
import {QuizScene} from './parts';
import {fetchCatalogue} from './use-catalogue';
import type {QuizView} from './viewer';
import './quiz.css';

interface Station {question: ExamQuestion; typed: string; side: 'left' | 'right' | null; result: 'correct' | 'close' | 'wrong' | 'blank'; seconds: number}
const TIER: Record<Difficulty, string> = {easy: '簡單', medium: '中等', hard: '困難'};
type Phase = 'setup' | 'loading' | 'running' | 'result';

/** 模擬考試: the hardest mode. Needle on a structure, name it (and the side) before the clock runs out; stations are shuffled over every chosen region, there is no hint, no feedback and no way back; the result comes at the end. */
export default function ExamPage() {
  const [phase, setPhase] = useState<Phase>('setup'), [setup, setSetup] = useState<ExamSetup>(() => loadExamSetup()), [open, setOpen] = useState<string[]>([]);
  const [catalogues, setCatalogues] = useState<Partial<Record<QuizRegionId, QuizCatalogue>>>({}), [questions, setQuestions] = useState<ExamQuestion[]>([]), [stations, setStations] = useState<Station[]>([]);
  const [problem, setProblem] = useState(''), [seconds, setSeconds] = useState(EXAM_DEFAULTS.seconds), [elapsed, setElapsed] = useState(0);
  useEffect(() => {document.title = '模擬考試 · MJ Anatomy';}, []);
  useEffect(() => {saveExamSetup(setup);}, [setup]);
  const chosen = Object.keys(setup.regions) as QuizRegionId[];
  const update = (patch: Partial<ExamSetup>) => setSetup(s => ({...s, ...patch}));

  const begin = async () => {
    setProblem(''); setPhase('loading');
    try {
      const loaded: Partial<Record<QuizRegionId, QuizCatalogue>> = {};
      await Promise.all(chosen.map(async id => {loaded[id] = await fetchCatalogue(id);}));
      const pool: ExamQuestion[] = [];
      for (const id of chosen) {
        const cat = loaded[id]!, levels = difficultyMap(cat, id), mine = {...setup, level: 3 as const, side: 'both' as const, scope: 'all' as const, language: 'any' as const, needSide: true};
        for (const s of namingPool(cat, settingsFor(mine as never, id)).filter(examEligible)) pool.push({region: id, structure: s, difficulty: levels.get(s.id) ?? 'medium'});
      }
      if (!pool.length) {setProblem('選定的範圍沒有可出的題目，請調整區域或內容類型。'); setPhase('setup'); return;}
      const drawn = composeExam(pool, setup.count);
      setCatalogues(loaded); setQuestions(drawn); setStations([]); setSeconds(setup.seconds); setElapsed(0); setPhase('running');
    } catch { setProblem('題庫未能載入，請重試。'); setPhase('setup'); }
  };
  const finish = (all: Station[], spent: number) => {
    for (const st of all) {
      const scope = scopeOf(st.question.region, 3), ok = st.result === 'correct';
      addMistakes(scope, ok ? [] : [st.question.structure.id], ok ? [st.question.structure.id] : []);
    }
    setStations(all); setElapsed(spent); setPhase('result');
  };

  if (phase === 'running') return <ExamRun catalogues={catalogues} questions={questions} seconds={seconds} onFinish={finish} onQuit={() => setPhase('setup')}/>;
  if (phase === 'result') return <ExamResult stations={stations} planned={questions.length} elapsed={elapsed} seconds={seconds} onAgain={() => void begin()} onSetup={() => setPhase('setup')}/>;
  return <main className="quiz-app quiz-setup-page exam-setup-page" lang="zh-Hant">
    <header className="quiz-header">
      <a className="quiz-back" href="#/" aria-label="返回圖譜"><ArrowLeft size={18}/><span>返回圖譜</span></a>
      <ModeNav current="exam"/>
      <span className="quiz-header-tag">最高難度</span>
    </header>
    <div className="quiz-setup-content">
      <section className="quiz-intro">
        <div className="quiz-kicker"><Target size={15}/> MOCK EXAM</div>
        <h1 tabIndex={-1}>模擬考試</h1>
        <p>每一站在 3D 模型上插著一根針，指住一個構造，要在時間內寫出它的名稱（中文或英文都可以），左右成對的構造要連左右一起答對。</p>
        <ul className="exam-rules">
          <li>題目順序完全打散，不依區域分段，也不能回上一站。</li>
          <li>簡單的與偏僻的構造隨機混合；要分清神經、血管與肌腱。</li>
          <li>沒有提示、沒有即時對錯，考完才一次出結果。</li>
          <li>每站倒數從模型載入完成後才開始計時；時間到會自動交出目前寫的答案，進入下一站。</li>
        </ul>
        <p className="quiz-scope">想先準備？到<a href="#/learn">學習</a>走關卡，或用 <a href="#/quiz">Quiz</a> 自選範圍檢測。</p>
      </section>
      <section className="quiz-setup-card" aria-label="設定模擬考試">
        <fieldset><legend><b>01</b> 範圍 <small>可多選區域與區段；選了整區，區內所有構造都在題庫裡</small></legend>
          <RegionPicker regions={setup.regions} open={open} setOpen={setOpen} onRegion={id => update({regions: toggleRegionIn(setup.regions, id)})} onSection={(id, sec) => update({regions: toggleSectionIn(setup.regions, id, sec)})}/>
        </fieldset>
        <fieldset><legend><b>02</b> 內容類型 <small>預設全部</small></legend>
          <CategoryPicker value={setup.categories} onChange={categories => update({categories})} count={() => null}/>
        </fieldset>
        <div className="quiz-options-row">
          <fieldset><legend><b>03</b> 題數（站數）</legend><input className="exam-number" type="number" inputMode="numeric" min={EXAM_LIMITS.count[0]} max={EXAM_LIMITS.count[1]} value={setup.count} aria-label="題數" onChange={e => update({count: Math.round(Number(e.target.value)) || 0})} onBlur={() => update({count: Math.min(EXAM_LIMITS.count[1], Math.max(EXAM_LIMITS.count[0], setup.count || EXAM_DEFAULTS.count))})}/><small className="exam-hint">預設 {EXAM_DEFAULTS.count} 題</small></fieldset>
          <fieldset><legend><b>04</b> 每題秒數</legend><input className="exam-number" type="number" inputMode="numeric" min={EXAM_LIMITS.seconds[0]} max={EXAM_LIMITS.seconds[1]} value={setup.seconds} aria-label="每題秒數" onChange={e => update({seconds: Math.round(Number(e.target.value)) || 0})} onBlur={() => update({seconds: Math.min(EXAM_LIMITS.seconds[1], Math.max(EXAM_LIMITS.seconds[0], setup.seconds || EXAM_DEFAULTS.seconds))})}/><small className="exam-hint">預設 {EXAM_DEFAULTS.seconds} 秒</small></fieldset>
        </div>
        <label className="quiz-context-toggle setup-remember"><input type="checkbox" checked={setup.remember} onChange={e => update({remember: e.target.checked})}/>記住這次的設定</label>
        {problem && <div className="quiz-error" role="alert">{problem}</div>}
        <p className="quiz-pool-note" role="status">{chosen.length ? `已選 ${chosen.length} 個區域，共 ${setup.count} 題，每題 ${setup.seconds} 秒（約 ${clock(setup.count * setup.seconds)}）` : '請先選擇至少一個區域。'}</p>
        <div className="quiz-start-row"><button data-slot="quiz-button" className="quiz-primary" disabled={!chosen.length || !setup.categories.length || phase === 'loading'} onClick={() => void begin()}>{phase === 'loading' ? '正在準備題庫…' : '開始考試'} <ArrowRight size={18}/></button></div>
      </section>
    </div>
  </main>;
}

function ExamRun({catalogues, questions, seconds, onFinish, onQuit}: {catalogues: Partial<Record<QuizRegionId, QuizCatalogue>>; questions: ExamQuestion[]; seconds: number; onFinish: (s: Station[], spent: number) => void; onQuit: () => void}) {
  const [index, setIndex] = useState(0), [typed, setTyped] = useState(''), [side, setSide] = useState<'left' | 'right' | null>(null), [left, setLeft] = useState(seconds);
  const [readiness, setReadiness] = useState({key: '', ready: false}), [load, setLoad] = useState({loaded: 0, total: 0}), [error, setError] = useState(''), [sceneRetry, setSceneRetry] = useState(0);
  const [command, setCommand] = useState<{id: number; view: QuizView}>({id: 0, view: 'front'}), [message, setMessage] = useState('');
  const done = useRef<Station[]>([]), startedAt = useRef(0), runStart = useRef(performance.now()), submitted = useRef(false), input = useRef<HTMLInputElement>(null);
  const question = questions[index], target = question.structure, catalogue = catalogues[question.region]!;
  const questionKey = `${index}:${target.id}`, ready = readiness.key === questionKey && readiness.ready && !error;
  const paired = needsSide(target), category = QUIZ_CATEGORIES.find(c => c.id === categoryOf(target));
  const related = useMemo(() => catalogue.structures.filter(s => s.id !== target.id && s.system === target.system && relationOf(s, target)), [catalogue, target]);
  const latest = useRef({typed, side}); latest.current = {typed, side};

  const submit = () => {
    if (submitted.current) return;
    submitted.current = true;
    const {typed: text, side: chosenSide} = latest.current, answer = withSide(text, paired ? chosenSide : null);
    const spent = startedAt.current ? (performance.now() - startedAt.current) / 1000 : 0;
    const verdict = answer ? judgeName(answer, target, {language: 'any', needSide: paired}, related) : {result: 'wrong' as const};
    const station: Station = {question, typed: text.trim(), side: paired ? chosenSide : null, result: !text.trim() ? 'blank' : verdict.result, seconds: Math.min(seconds, Math.round(spent))};
    done.current = [...done.current, station];
    if (index + 1 >= questions.length) onFinish(done.current, (performance.now() - runStart.current) / 1000);
    else {setIndex(index + 1); setTyped(''); setSide(null); setLeft(seconds); setMessage(''); setError(''); startedAt.current = 0;}
  };
  const submitRef = useRef(submit); submitRef.current = submit;
  useEffect(() => {submitted.current = false;}, [index]);
  // the clock starts when the model of this station is in place, so loading never costs time
  useEffect(() => {
    if (!ready) return;
    startedAt.current = performance.now(); setLeft(seconds); input.current?.focus();
    const timer = window.setInterval(() => {
      const remaining = remainingSeconds(startedAt.current, performance.now(), seconds);
      setLeft(remaining);
      if (remaining <= 0) {window.clearInterval(timer); submitRef.current();}
    }, 200);
    return () => window.clearInterval(timer);
  }, [ready, questionKey, seconds]);
  const quit = () => {if (window.confirm('離開考試？目前的作答不會計分。')) onQuit();};
  const urgent = left <= 5;

  return <main className="quiz-app exam-app" lang="zh-Hant" data-index={index}>
    <header className="quiz-header">
      <span className="quiz-brand exam-brand">模擬考試</span>
      <span className="exam-station" aria-live="polite">第 {index + 1} / {questions.length} 站</span>
      <button data-slot="quiz-button" className="quiz-quiet" onClick={quit}>離開 <X size={16}/></button>
    </header>
    <div className="quiz-play-layout is-naming is-exam">
      <section className="quiz-stage" aria-label="3D 模型，針指住的構造是題目">
        <QuizScene key={`${question.region}:${sceneRetry}`} catalogue={catalogue} view={{key: questionKey, target, section: 'all', side: 'both', answered: false, pickedId: null, hidden: [], context: true, peeling: false, command, mode: 'name', clarity: .7, only: false, highlightIds: [], pin: true}}
          onReady={(key, value) => setReadiness({key, ready: value})} onProgress={(loaded, total) => setLoad({loaded, total})} onError={setError} onPick={() => {}} onMessage={setMessage}/>
        <div className="quiz-stage-caption"><span>紅色的針指住的構造是哪一個？</span></div>
        <div className="quiz-view-buttons" aria-label="模型視角"><button data-slot="quiz-button" onClick={() => setCommand(c => ({id: c.id + 1, view: 'random'}))}>換角度</button></div>
        {!ready && !error && <div className="quiz-loading" role="status"><span className="quiz-spinner"/><strong>載入這一站的模型</strong><small>倒數尚未開始 · {load.loaded} / {load.total || '…'}</small></div>}
        {error && <div className="quiz-model-error" role="alert"><strong>這一站的模型沒有載入</strong><p>{error}</p><button data-slot="quiz-button" className="quiz-primary" onClick={() => {setError(''); setReadiness({key: '', ready: false}); setSceneRetry(n => n + 1);}}>重新載入模型</button></div>}
        <div className="quiz-stage-hint">拖曳旋轉 · 滾輪／雙指縮放 · {message || '看針的位置作答'}</div>
      </section>
      <aside className="quiz-question-card" aria-label="考試作答">
        <div className={`exam-clock ${urgent && ready ? 'is-urgent' : ''}`} role="timer" aria-live="off"><b>{ready ? clock(left) : '--:--'}</b><span>{ready ? '剩餘時間' : '等待載入'}</span></div>
        <progress className="quiz-progress" value={ready ? Math.max(0, left) : seconds} max={seconds} aria-label="本站剩餘時間"/>
        <div className="quiz-question-heading"><span className="quiz-kicker">NAME IT · 寫出名稱</span><span className="quiz-system-label" style={{borderColor: category?.color}}>{category?.label}</span></div>
        <form className="quiz-name-form" onSubmit={e => {e.preventDefault(); if (ready) submit();}}>
          <h1 className="quiz-target quiz-target-hidden" tabIndex={-1}>針指住的是什麼構造？</h1>
          <label htmlFor="exam-typed">名稱<small>中文或英文皆可{paired ? '，並選擇左右' : ''}</small></label>
          <input id="exam-typed" ref={input} className="quiz-name-input" value={typed} onChange={e => setTyped(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="輸入名稱" disabled={!ready}/>
          {paired && <div className="exam-side" role="group" aria-label="左右"><button type="button" data-slot="quiz-button" aria-pressed={side === 'left'} disabled={!ready} onClick={() => setSide('left')}>左 Left</button><button type="button" data-slot="quiz-button" aria-pressed={side === 'right'} disabled={!ready} onClick={() => setSide('right')}>右 Right</button></div>}
          <div className="quiz-name-actions"><button type="submit" data-slot="quiz-button" className="quiz-primary" disabled={!ready}>{index + 1 >= questions.length ? '交卷' : '送出，下一站'}<ArrowRight size={16}/></button></div>
          <p className="exam-note">交出後不能回上一站，也不會顯示對錯。</p>
        </form>
      </aside>
    </div>
  </main>;
}

function ExamResult({stations, planned, elapsed, seconds, onAgain, onSetup}: {stations: Station[]; planned: number; elapsed: number; seconds: number; onAgain: () => void; onSetup: () => void}) {
  const correct = stations.filter(s => s.result === 'correct').length, byRegion = new Map<QuizRegionId, Station[]>();
  for (const st of stations) byRegion.set(st.question.region, [...(byRegion.get(st.question.region) ?? []), st]);
  const wrong = (st: Station) => st.result !== 'correct';
  return <main className="quiz-app exam-result" lang="zh-Hant">
    <header className="quiz-header"><a className="quiz-back" href="#/"><ArrowLeft size={18}/><span>返回圖譜</span></a><ModeNav current="exam"/><span className="quiz-header-tag">成績</span></header>
    <section className="quiz-summary exam-summary" aria-label="考試成績">
      <span className="quiz-kicker">EXAM RESULT</span><h1 tabIndex={-1}>考試結束</h1>
      <div className="quiz-result-score"><strong>{correct}</strong><span>/ {planned}<small>答對題數（{planned ? Math.round(correct / planned * 100) : 0}%）· 用時 {clock(elapsed)}（每題限時 {seconds} 秒）</small></span></div>
      <div className="run-regions">{[...byRegion.entries()].map(([id, list]) => {
        const bad = list.filter(wrong);
        return <div key={id} className="run-region" data-region={id}><div className="run-region-head"><b>{QUIZ_REGIONS[id].label}</b><span>答對 {list.length - bad.length} / {list.length}</span></div>
          {bad.length > 0 && <a className="quiz-secondary quiz-link-button" href={learnHashOf(id)}>回去學習：{QUIZ_REGIONS[id].label}學習地圖</a>}</div>;
      })}</div>
      <div className="quiz-summary-actions"><button data-slot="quiz-button" className="quiz-primary" onClick={onAgain}>再考一次（重新抽題）</button><button data-slot="quiz-button" className="quiz-secondary" onClick={onSetup}>重新設定</button></div>
      <div className="quiz-review-list"><h2>每一站<small>你的答案與正確答案</small></h2>
        {stations.map((st, i) => {
          const s: QuizStructure = st.question.structure, label = {correct: '答對', close: '接近', wrong: '答錯', blank: '未作答'}[st.result];
          const mine = [st.side ? (st.side === 'left' ? '左' : '右') : '', st.typed].filter(Boolean).join(' ') || '（空白）';
          return <div key={i} className={`quiz-review-item exam-station-row is-${st.result === 'correct' ? 'correct' : st.result === 'close' ? 'close' : 'wrong'}`}>
            <span className="quiz-review-dot"/>
            <div><b>{i + 1}. <span className="bn-en" lang="en">{s.name}</span> {s.chinese && <small className="bn-zh" lang="zh-Hant">{s.chinese}</small>} <em>{label}</em></b>
              <p>你的答案：{mine} · {QUIZ_REGIONS[st.question.region].label} · {TIER[st.question.difficulty]} · {st.seconds} 秒</p></div>
            {st.result === 'correct' ? <Check size={16}/> : <AlertCircle size={16}/>}
          </div>;
        })}
      </div>
    </section>
  </main>;
}
