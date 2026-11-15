import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ArrowLeft, ArrowRight, Check, Clock, RotateCcw, Shuffle, X} from 'lucide-react';
import {fetchModelBuffer} from '../model-download';
import {QUIZ_REGIONS, type QuizCatalogue, type QuizRegionId, type QuizStructure} from './catalogue';
import {addMistakes, scopeOf} from './mistakes';
import {QuizScene, Name} from './parts';
import type {QuizView} from './viewer';
import {
  COUNT_RANGE, EXAM_REGION_IDS, MOCK_EXAM_ENGLISH, MOCK_EXAM_LABEL, SECONDS_RANGE, buildExam, clockText, examPool, gradeTyped, isCorrect, isExpired, loadSettings, saveSettings, scoreOf, secondsLeft, secondsUsed,
  type ExamAnswer, type ExamPaper, type ExamSettings, type Tier,
} from './mock-exam';
import {ModeNav} from './mode-nav';
import {autoHidden, openingHidden} from './find-round';
import './quiz.css';

const TIER_LABEL: Record<Tier, string> = {easy: '簡單', medium: '中等', hard: '困難'};
const VERDICT: Record<ExamAnswer['result'], string> = {correct: '答對', close: '接近（不計分）', wrong: '答錯', skipped: '未作答'};

export default function MockExamView() {
  const [settings, setSettings] = useState<ExamSettings>(() => loadSettings());
  const [catalogues, setCatalogues] = useState<Partial<Record<QuizRegionId, QuizCatalogue>>>({}), [failed, setFailed] = useState<QuizRegionId[]>([]), [retry, setRetry] = useState(0);
  const [phase, setPhase] = useState<'setup' | 'playing' | 'result'>('setup');
  const [paper, setPaper] = useState<ExamPaper | null>(null), [limit, setLimit] = useState(30), [run, setRun] = useState(0);
  const [index, setIndex] = useState(0), [answers, setAnswers] = useState<ExamAnswer[]>([]), [typed, setTyped] = useState('');
  const [left, setLeft] = useState(0), [readyKey, setReadyKey] = useState(''), [error, setError] = useState(''), [sceneRetry, setSceneRetry] = useState(0);
  const [command, setCommand] = useState<{id: number; view: QuizView}>({id: 0, view: 'front'}), [load, setLoad] = useState({loaded: 0, total: 0});
  const startedAt = useRef<number | null>(null), typedRef = useRef(''), input = useRef<HTMLInputElement>(null), title = useRef<HTMLHeadingElement>(null);
  typedRef.current = typed;

  useEffect(() => {document.title = `${MOCK_EXAM_LABEL} · MJ Anatomy`;}, []);
  useEffect(() => {title.current?.focus();}, [phase]);

  // Every chosen region's catalogue is fetched before the exam starts, so no question waits for one.
  const wanted = settings.regions.map(r => r.region).join(',');
  useEffect(() => {
    const abort = new AbortController();
    for (const region of wanted.split(',').filter(Boolean) as QuizRegionId[]) {
      if (catalogues[region]) continue;
      void fetchModelBuffer(`${import.meta.env.BASE_URL}models/${QUIZ_REGIONS[region].file}`, 0, false, abort.signal)
        .then(bytes => {
          const data = JSON.parse(new TextDecoder().decode(bytes)) as QuizCatalogue;
          if (data.version !== 1 || !data.structures?.length || !data.packages?.length) throw Error('invalid');
          if (!abort.signal.aborted) {setCatalogues(c => ({...c, [region]: data})); setFailed(f => f.filter(x => x !== region));}
        })
        .catch(() => {if (!abort.signal.aborted) setFailed(f => f.includes(region) ? f : [...f, region]);});
    }
    return () => abort.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanted, retry]);

  const chosen = settings.regions.filter(r => catalogues[r.region]);
  const allLoaded = chosen.length === settings.regions.length;
  const pool = useMemo(() => examPool(chosen.map(r => ({region: r.region, catalogue: catalogues[r.region]!, section: r.section}))), [chosen.map(r => `${r.region}:${r.section}`).join(','), catalogues]);
  const byId = useMemo(() => new Map(pool.map(i => [`${i.region}:${i.id}`, i])), [pool]);

  const update = (next: ExamSettings) => {setSettings(next); saveSettings(next);};
  const toggleRegion = (region: QuizRegionId) => {
    const on = settings.regions.some(r => r.region === region);
    if (on && settings.regions.length === 1) return;
    update({...settings, regions: on ? settings.regions.filter(r => r.region !== region) : EXAM_REGION_IDS.filter(id => id === region || settings.regions.some(r => r.region === id)).map(id => settings.regions.find(r => r.region === id) ?? {region: id, section: 'all'})});
  };
  const setSection = (region: QuizRegionId, section: string) => update({...settings, regions: settings.regions.map(r => r.region === region ? {...r, section} : r)});
  const setNumber = (key: 'count' | 'seconds', value: string) => {const n = Math.round(Number(value)); if (Number.isFinite(n)) setSettings(s => ({...s, [key]: n}));};
  const commitNumber = () => update({...settings, count: Math.min(COUNT_RANGE[1], Math.max(COUNT_RANGE[0], settings.count || 50)), seconds: Math.min(SECONDS_RANGE[1], Math.max(SECONDS_RANGE[0], settings.seconds || 30))});

  const start = () => {
    const seed = `${Date.now()}-${Math.random()}`;
    const next = buildExam(pool, settings.count, seed);
    if (!next.questions.length) return;
    saveSettings(settings);
    startedAt.current = null; setPaper(next); setLimit(settings.seconds); setIndex(0); setAnswers([]); setTyped(''); setError(''); setReadyKey(''); setRun(n => n + 1); setPhase('playing');
  };

  const question = paper?.questions[index];
  const item = question ? byId.get(`${question.region}:${question.id}`) : undefined;
  const catalogue = question ? catalogues[question.region] : undefined;
  const target = item?.structure;
  const questionKey = `${run}:${index}:${question?.id ?? ''}`;
  const ready = readyKey === questionKey && !error;
  const hidden = useMemo(() => catalogue && target && question ? [...new Set([...openingHidden(question.region, catalogue, target), ...autoHidden(question.region, catalogue, target)])] : [], [catalogue, target, question]);

  /** Records the answer of the current question (a blank answer is 未作答) and moves on; the last question ends the exam. */
  const submit = useCallback(() => {
    if (!paper || !target || !catalogue) return;
    const elapsed = startedAt.current === null ? 0 : performance.now() - startedAt.current;
    const text = typedRef.current.trim();
    const answer: ExamAnswer = {typed: text, result: gradeTyped(text, target, catalogue), seconds: secondsUsed(elapsed, limit)};
    startedAt.current = null; setTyped(''); setError('');
    setAnswers(a => a.length > index ? a : [...a, answer]);
    if (index + 1 >= paper.questions.length) setPhase('result'); else setIndex(index + 1);
  }, [paper, target, catalogue, limit, index]);

  // The countdown of a question starts when its model is on screen, so loading never costs the student time.
  useEffect(() => {
    if (phase !== 'playing' || !ready) return;
    if (startedAt.current === null) startedAt.current = performance.now();
    setLeft(secondsLeft(0, limit));
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - (startedAt.current ?? performance.now());
      setLeft(secondsLeft(elapsed, limit));
      if (isExpired(elapsed, limit)) {window.clearInterval(timer); submit();}
    }, 200);
    return () => window.clearInterval(timer);
  }, [phase, ready, questionKey, limit, submit]);
  useEffect(() => {if (phase === 'playing' && ready) input.current?.focus();}, [phase, ready, questionKey]);

  const finishEarly = () => {
    if (!paper) return;
    const rest = paper.questions.slice(answers.length).map((): ExamAnswer => ({typed: '', result: 'skipped', seconds: 0}));
    setAnswers(a => [...a, ...rest]); setPhase('result');
  };

  // At the end, wrong answers go to the mistakes list of level 3 of their region (the same list the region quiz practises from); right ones are cleared from it.
  const recorded = useRef(-1);
  useEffect(() => {
    if (phase !== 'result' || !paper || recorded.current === run) return;
    recorded.current = run;
    const per = new Map<QuizRegionId, {wrong: string[]; right: string[]}>();
    paper.questions.forEach((q, i) => {
      const entry = per.get(q.region) ?? {wrong: [], right: []};
      (isCorrect(answers[i]) ? entry.right : entry.wrong).push(q.id); per.set(q.region, entry);
    });
    for (const [region, {wrong, right}] of per) addMistakes(scopeOf(region, 3), wrong, right);
  }, [phase, paper, answers, run]);

  const total = paper?.questions.length ?? 0, score = scoreOf(answers);
  const wrongByRegion = useMemo(() => {
    const map = new Map<QuizRegionId, number>();
    paper?.questions.forEach((q, i) => {if (!isCorrect(answers[i])) map.set(q.region, (map.get(q.region) ?? 0) + 1);});
    return [...map];
  }, [paper, answers]);
  const totalSeconds = Math.round(answers.reduce((s, a) => s + a.seconds, 0));
  const poolLabel = !allLoaded && !failed.length ? '正在準備題庫…' : failed.length ? '' : pool.length ? `可出題的構造共 ${pool.length} 個；本場 ${Math.min(settings.count, pool.length)} 題，每題 ${settings.seconds} 秒` : '此範圍暫無可出的題目';

  return <main className={`quiz-app quiz-exam quiz-phase-${phase === 'playing' ? 'playing' : phase}`} lang="zh-Hant">
    <header className="quiz-header">
      <a className="quiz-back" href="#/" aria-label="返回圖譜"><ArrowLeft size={18}/><span>返回圖譜</span></a>
      <ModeNav current="exam"/>
      {phase === 'playing' ? <button data-slot="quiz-button" className="quiz-quiet" onClick={finishEarly}>提早結束 <X size={16}/></button> : <span className="quiz-header-tag">{phase === 'setup' ? '最高難度' : '成績'}</span>}
    </header>

    {phase === 'setup' && <div className="quiz-setup-content">
      <section className="quiz-intro">
        <div className="quiz-kicker"><Clock size={15}/> {MOCK_EXAM_ENGLISH.toUpperCase()} · HARDEST LEVEL</div>
        <h1 ref={title} tabIndex={-1}>{MOCK_EXAM_LABEL}，<br/>限時寫出名稱。</h1>
        <p>每一題在 3D 模型上以黃色標出一個構造，限時寫出它的英文或中文名稱，左右要答對。<br/>考試途中沒有提示，也不顯示對錯；全部作答完才一次公布成績。</p>
        <div className="quiz-how">
          <span><b>01</b>題目跨部位完全打散</span>
          <span><b>02</b>倒數時間到自動換下一題</span>
          <span><b>03</b>考完看逐題答案並練錯題</span>
        </div>
        <p className="quiz-scope">難度每場隨機混合：困難約 40%、中等 40 至 50%、簡單約 10 至 20%。</p>
      </section>
      <section className="quiz-setup-card" aria-label={`設定${MOCK_EXAM_LABEL}`}>
        <div className="quiz-card-heading"><span className="quiz-kicker">EXAM SETUP</span><span>{poolLabel}</span></div>
        <fieldset><legend><b>01</b> 考哪些部位？ <small>可多選；選了就包含該部位全部的骨、肌肉、神經、血管、韌帶與肌腱</small></legend>
          <div className="quiz-region-grid">{EXAM_REGION_IDS.map(id => {
            const def = QUIZ_REGIONS[id], entry = settings.regions.find(r => r.region === id);
            return <div key={id} className="quiz-exam-region">
              <button data-slot="quiz-button" data-region={id} aria-pressed={!!entry} onClick={() => toggleRegion(id)}><span>{def.label}<small>{def.english}</small></span>{entry && <Check size={17}/>}</button>
              {entry && def.sections.length > 1 && <select aria-label={`${def.label}的範圍`} value={entry.section} onChange={e => setSection(id, e.target.value)}>{def.sections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select>}
            </div>;
          })}</div>
        </fieldset>
        <div className="quiz-options-row">
          <fieldset><legend><b>02</b> 題數</legend><input className="quiz-exam-number" type="number" inputMode="numeric" min={COUNT_RANGE[0]} max={COUNT_RANGE[1]} value={settings.count} aria-label="題數" onChange={e => setNumber('count', e.target.value)} onBlur={commitNumber}/></fieldset>
          <fieldset><legend><b>03</b> 每題秒數</legend><input className="quiz-exam-number" type="number" inputMode="numeric" min={SECONDS_RANGE[0]} max={SECONDS_RANGE[1]} value={settings.seconds} aria-label="每題秒數" onChange={e => setNumber('seconds', e.target.value)} onBlur={commitNumber}/></fieldset>
        </div>
        {failed.length > 0 && <div className="quiz-error" role="alert">部分題庫未能載入。<button data-slot="quiz-button" onClick={() => {setFailed([]); setRetry(n => n + 1);}}>重新載入</button></div>}
        <div className="quiz-start-row"><p>{allLoaded ? '開始後不能回上一題，時間到會自動換題。' : '正在載入所選部位的題庫…'}</p>
          <button data-slot="quiz-button" className="quiz-primary" disabled={!allLoaded || !pool.length} onClick={start}>開始{MOCK_EXAM_LABEL} <ArrowRight size={18}/></button></div>
      </section>
    </div>}

    {phase === 'playing' && catalogue && target && <div className="quiz-play-layout is-naming">
      <section className="quiz-stage" aria-label="3D 模型">
        <QuizScene key={`${question!.region}:${sceneRetry}`} catalogue={catalogue} view={{key: questionKey, target, section: 'all', side: 'both', answered: false, pickedId: null, hidden, context: true, peeling: false, command, mode: 'name', clarity: .45, only: false, highlightIds: []}}
          onReady={(key, value) => setReadyKey(value ? key : '')} onProgress={(loaded, totalPackages) => setLoad({loaded, total: totalPackages})} onError={setError} onPick={() => undefined} onMessage={() => undefined}/>
        <div className="quiz-view-buttons" aria-label="模型視角"><button data-slot="quiz-button" onClick={() => setCommand(c => ({id: c.id + 1, view: 'front'}))}>前面</button><button data-slot="quiz-button" onClick={() => setCommand(c => ({id: c.id + 1, view: 'back'}))}>後面</button><button data-slot="quiz-button" onClick={() => setCommand(c => ({id: c.id + 1, view: 'side'}))}>側面</button><button data-slot="quiz-button" onClick={() => setCommand(c => ({id: c.id + 1, view: 'random'}))}><Shuffle size={13}/> 換角度</button></div>
        {!ready && !error && <div className="quiz-loading" role="status"><span className="quiz-spinner"/><strong>載入本題模型</strong><small>{load.loaded} / {load.total || '…'} 個模型套件（載入時不計時）</small></div>}
        {error && <div className="quiz-model-error" role="alert"><strong>暫時未能作答</strong><p>{error}</p><button data-slot="quiz-button" className="quiz-primary" onClick={() => {setError(''); setReadyKey(''); setSceneRetry(n => n + 1);}}>重新載入模型</button></div>}
        <div className="quiz-stage-hint">黃色標示的是哪個構造？拖曳旋轉 · 滾輪／雙指縮放</div>
      </section>
      <aside className="quiz-question-card" aria-label="考題">
        <div className="quiz-progress-label"><span>{MOCK_EXAM_LABEL}</span><b>{index + 1} <span>/ {total}</span></b></div>
        <progress className="quiz-progress" value={index} max={total} aria-label="已作答題數"/>
        <div className={`quiz-exam-timer ${ready && left <= 5 ? 'is-low' : ''}`} role="timer" aria-label="本題剩餘時間" data-left={left}><Clock size={18}/><strong>{ready ? clockText(left) : clockText(limit)}</strong><small>{ready ? '時間到自動換題' : '等待模型載入'}</small></div>
        <form className="quiz-name-form" onSubmit={e => {e.preventDefault(); if (ready) submit();}}>
          <h1 className="quiz-target quiz-target-hidden" ref={title} tabIndex={-1}>黃色標示的是什麼構造？</h1>
          <label htmlFor="exam-typed">請輸入名稱<small>英文或中文皆可，要寫出左右側</small></label>
          <input id="exam-typed" ref={input} className="quiz-name-input" value={typed} onChange={e => setTyped(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="例如：Right deltoid" disabled={!ready}/>
          <div className="quiz-name-actions"><button type="submit" data-slot="quiz-button" className="quiz-primary" disabled={!ready}>{index + 1 === total ? '交卷' : '下一題'}<ArrowRight size={16}/><small>Enter</small></button></div>
          <p className="quiz-message">送出後不能回上一題，也不會顯示對錯。</p>
        </form>
      </aside>
    </div>}

    {phase === 'result' && paper && <section className="quiz-summary quiz-exam-result">
      <span className="quiz-kicker">{MOCK_EXAM_ENGLISH.toUpperCase()} COMPLETE</span>
      <h1 ref={title} tabIndex={-1}>考完了，這是你的成績。</h1>
      <div className="quiz-result-score"><strong>{score}</strong><span>/ {total}<small>答對題數（{total ? Math.round(score / total * 100) : 0}%）· 總用時 {clockText(totalSeconds)}</small></span></div>
      <p className="quiz-result-split"><span className="is-correct">答對 {answers.filter(a => a.result === 'correct').length}</span><span className="is-close">接近 {answers.filter(a => a.result === 'close').length}</span><span className="is-wrong">答錯 {answers.filter(a => a.result === 'wrong').length}</span><span className="is-wrong">未作答 {answers.filter(a => a.result === 'skipped').length}</span></p>
      <p className="quiz-result-description">本場難度：困難 {paper.mix.hard}、中等 {paper.mix.medium}、簡單 {paper.mix.easy}。答錯與未作答的構造已加入各部位「第三級」的錯題本。</p>
      <div className="quiz-summary-actions">
        {wrongByRegion.map(([region, n]) => <a key={region} className="quiz-primary quiz-link-button" href={QUIZ_REGIONS[region].hash}><RotateCcw size={17}/>練習{QUIZ_REGIONS[region].label}錯題（{n}）</a>)}
        <button data-slot="quiz-button" className="quiz-secondary" onClick={() => setPhase('setup')}>再考一次</button>
        <a className="quiz-text-button" href="#/quiz">前往 Quiz</a>
      </div>
      {wrongByRegion.length > 0 && <p className="quiz-message">在該部位的設定頁選「第三級」，即可只練錯題本。</p>}
      <div className="quiz-review-list"><h2>逐題答案<small>你的答案與正確名稱</small></h2>{paper.questions.map((q, i) => {
        const s = byId.get(`${q.region}:${q.id}`)!.structure, a = answers[i] ?? {typed: '', result: 'skipped' as const, seconds: 0};
        return <div className={`quiz-review-item is-${a.result}`} key={`${i}-${q.id}`}><span className="quiz-review-dot"/><div>
          <b>{i + 1}. <Name structure={s}/> <em>{VERDICT[a.result]}</em></b>
          <p>你的答案：{a.typed || '（未作答）'} · 用時 {a.seconds} 秒 · {QUIZ_REGIONS[q.region].label} · {TIER_LABEL[q.tier]}</p>
        </div></div>;
      })}</div>
    </section>}
  </main>;
}
