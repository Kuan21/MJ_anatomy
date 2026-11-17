import {useEffect, useMemo, useRef, useState} from 'react';
import {AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, Layers, Lock, Maximize2, Play, RotateCcw, Target, XCircle} from 'lucide-react';
import {QUIZ_CATEGORIES, QUIZ_REGIONS, categoryOf, type QuizCatalogue, type QuizRegionId, type QuizSettings, type QuizStructure} from './catalogue';
import {AnswerCard, Name, QuizScene} from './parts';
import {structureCard} from './card';
import {buildLessons, hintFor, scopeKeyOf, seededShuffle, type Lesson} from './lessons';
import {applyReview, dayKey, dueIds, loadReview, resultKey, saveReview} from './lesson-progress';
import {addMistakes, loadMistakes, scopeOf} from './mistakes';
import {autoHidden, judgePick, openingHidden} from './find-round';
import {PASS_RATE, loadProgress, loadUnlockAll, mapOf, markStarted, needReview, percentOf, passes, recordTest, saveProgress, saveUnlockAll, type LessonStep} from './learn-progress';
import {neighbours} from './level2';
import {ModeNav} from './mode-nav';
import {useCatalogue} from './use-catalogue';
import type {QuizView} from './viewer';
import './quiz.css';

const STEPS: {id: LessonStep; zh: string; en: string; kicker: string}[] = [
  {id: 'know', zh: '認識', en: 'Get to know', kicker: 'GET TO KNOW · 認識'},
  {id: 'practice', zh: '練習', en: 'Practice', kicker: 'PRACTICE · 在模型上找出'},
  {id: 'test', zh: '過關測驗', en: 'Pass test', kicker: 'PASS TEST · 沒有提示'},
];
interface Run {
  id: number;
  kind: 'lesson' | 'review';
  lesson?: Lesson;
  title: {en: string; zh: string};
  step: LessonStep;
  queue: string[];
  pos: number;
  /** First attempt of each structure in the current step. */
  firsts: {id: string; ok: boolean}[];
  requeued: boolean;
  done?: {correct: number; total: number; passed: boolean; wrongIds: string[]};
}
interface Answer {pickedId: string | null; ok: boolean; relation?: 'typed-part' | 'typed-whole'}

/** The structure ids the learner got wrong in the Quiz (levels 1 and 3), the pass tests and the mock exam, and has not answered correctly since: shown as 需重溫 on the map. */
const flaggedOf = (regionId: QuizRegionId) => new Set([...loadMistakes(scopeOf(regionId, 1)), ...loadMistakes(scopeOf(regionId, 2)), ...loadMistakes(scopeOf(regionId, 3))]);

/** 學習: the level map of one region and the three-step lesson (認識 → 練習 → 過關測驗, 80% unlocks the next lesson). */
export default function LearnRegion({region: regionId}: {region: QuizRegionId}) {
  const region = QUIZ_REGIONS[regionId];
  const {catalogue, error: catalogueError, reload} = useCatalogue(regionId);
  const settings = useMemo<QuizSettings>(() => ({section: 'all', side: region.defaultSide ?? 'right', systems: [], categories: QUIZ_CATEGORIES.map(c => c.id), scope: 'all', count: 9999}), [region]);
  useEffect(() => {document.title = `${region.label}學習 · MJ Anatomy`;}, [region]);
  return <main className="quiz-app learn-app" lang="zh-Hant" data-region={regionId}>
    {catalogue ? <LearnBody catalogue={catalogue} regionId={regionId} settings={settings}/> : <>
      <LearnHeader regionId={regionId}/>
      <div className="lesson-hub" role="status">{catalogueError ? <div className="quiz-error" role="alert">{catalogueError}<button data-slot="quiz-button" onClick={reload}>重新載入題庫</button></div> : <p className="quiz-pool-note">正在準備關卡…</p>}</div>
    </>}
  </main>;
}
function LearnHeader({regionId, right}: {regionId: QuizRegionId; right?: React.ReactNode}) {
  return <header className="quiz-header">
    <a className="quiz-back" href="#/learn" aria-label="返回區域選擇"><ArrowLeft size={18}/><span>區域選擇</span></a>
    <ModeNav current="learn"/>
    {right ?? <span className="quiz-header-tag">{QUIZ_REGIONS[regionId].tag}</span>}
  </header>;
}

function LearnBody({catalogue, regionId, settings}: {catalogue: QuizCatalogue; regionId: QuizRegionId; settings: QuizSettings}) {
  const region = QUIZ_REGIONS[regionId], scopeKey = scopeKeyOf(settings), mistakeScope = scopeOf(regionId, 2);
  const lessons = useMemo(() => buildLessons(catalogue, settings), [catalogue, settings]);
  const structures = useMemo(() => new Map(catalogue.structures.map(s => [s.id, s])), [catalogue]);
  const keyOf = (l: {key: string}) => resultKey(scopeKey, l.key);
  const today = useMemo(() => dayKey(), []);
  const [progress, setProgress] = useState(() => loadProgress(regionId)), [unlockAll, setUnlockAll] = useState(() => loadUnlockAll());
  const [review, setReview] = useState(() => loadReview(regionId)), [flagged, setFlagged] = useState(() => flaggedOf(regionId));
  const [run, setRun] = useState<Run | null>(null), runs = useRef(0);
  const [answer, setAnswer] = useState<Answer | null>(null), [hidden, setHidden] = useState<string[]>([]), [peeling, setPeeling] = useState(false), [context, setContext] = useState(true);
  const [message, setMessage] = useState(''), [command, setCommand] = useState<{id: number; view: QuizView}>({id: 0, view: 'front'});
  const [readiness, setReadiness] = useState({key: '', ready: false}), [seen, setSeen] = useState({key: '', shown: false}), [load, setLoad] = useState({loaded: 0, total: 0}), [error, setError] = useState(''), [sceneRetry, setSceneRetry] = useState(0);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {title.current?.focus();}, [run?.id, run?.step, run?.done, run?.pos]);

  const target = run && !run.done ? structures.get(run.queue[run.pos]) : undefined;
  const questionKey = run && target ? `${run.id}:${run.step}:${run.pos}:${target.id}` : '';
  const ready = readiness.key === questionKey && readiness.ready && !error;
  const shown = seen.key === questionKey && seen.shown;
  const nextTarget = run && !run.done ? structures.get(run.queue[run.pos + 1]) : undefined;
  const dueHere = useMemo(() => dueIds(review, today).filter(id => structures.has(id)), [review, today, structures]);
  const map = useMemo(() => mapOf(lessons, keyOf, progress, unlockAll), [lessons, progress, unlockAll]); // eslint-disable-line react-hooks/exhaustive-deps
  const passedCount = lessons.filter(l => progress[keyOf(l)]?.passed).length;
  const hint = useMemo(() => target && run?.step === 'practice' ? hintFor(target, structureCard(target).fields) : null, [target, run?.step]);
  const near = useMemo(() => target && run?.step === 'practice' ? neighbours(catalogue, target, 3) : [], [catalogue, target, run?.step]);
  const changeView = (view: QuizView) => setCommand(c => ({id: c.id + 1, view}));

  const prepare = (t?: QuizStructure) => {setAnswer(null); setHidden(openingHidden(regionId, catalogue, t)); setPeeling(false); setMessage(''); setError('');};
  const begin = (next: Omit<Run, 'id'>) => {
    runs.current += 1; setReadiness({key: '', ready: false});
    prepare(structures.get(next.queue[0])); setRun({...next, id: runs.current});
  };
  const startLesson = (lesson: Lesson) => {
    setProgress(p => {const next = markStarted(p, keyOf(lesson), today); saveProgress(regionId, next); return next;});
    begin({kind: 'lesson', lesson, title: {en: lesson.en, zh: lesson.zh}, step: 'know', queue: lesson.ids, pos: 0, firsts: [], requeued: false});
  };
  const startReview = () => begin({kind: 'review', title: {en: 'Review due today', zh: '今日複習'}, step: 'test', queue: seededShuffle(dueHere, `${regionId}:${today}:review`), pos: 0, firsts: [], requeued: false});
  const leave = () => {setRun(null); setAnswer(null); setFlagged(flaggedOf(regionId));};

  /** A first attempt of the pass test or of a review: it feeds the spaced review and the list of structures that need another look. */
  const remember = (id: string, ok: boolean) => {
    setReview(rv => {const next = applyReview(rv, id, ok, today); saveReview(regionId, next); return next;});
    addMistakes(mistakeScope, ok ? [] : [id], ok ? [id] : []);
  };
  const settle = (picked: QuizStructure | null, ok: boolean, relation?: Answer['relation']) => {
    if (!run || !target) return;
    const first = !run.firsts.some(f => f.id === target.id);
    if (run.step === 'test' && first) remember(target.id, ok);
    setRun({...run, firsts: first ? [...run.firsts, {id: target.id, ok}] : run.firsts});
    setAnswer({pickedId: picked?.id ?? null, ok, relation}); setHidden([]); setPeeling(false); setMessage('');
  };
  const choose = (id: string) => {
    if (!run || !target || answer || !ready || run.step === 'know') return;
    const picked = structures.get(id);
    if (peeling) {if (picked) setHidden(ids => ids.includes(id) ? ids : [...ids, id]); return;}
    const verdict = judgePick(target, picked);
    if (verdict.ignore) return;
    setMessage(''); settle(picked!, verdict.right, verdict.relation);
  };
  const giveUp = () => {if (ready && !answer) settle(null, false);};

  const finish = (r: Run) => {
    const correct = r.firsts.filter(f => f.ok).length, total = r.firsts.length, wrongIds = r.firsts.filter(f => !f.ok).map(f => f.id);
    if (r.kind === 'lesson' && r.lesson) {
      const next = recordTest(progress, keyOf(r.lesson), correct, total, today); setProgress(next); saveProgress(regionId, next);
      setRun({...r, done: {correct, total, passed: passes(correct, total), wrongIds}});
    } else setRun({...r, done: {correct, total, passed: wrongIds.length === 0, wrongIds}});
    setFlagged(flaggedOf(regionId));
  };
  const go = (r: Run, patch: Partial<Run>, first: string) => {prepare(structures.get(first)); setRun({...r, ...patch});};
  const next = () => {
    if (!run) return;
    if (run.step === 'know') {
      if (run.pos + 1 < run.queue.length) return go(run, {pos: run.pos + 1}, run.queue[run.pos + 1]);
      const queue = seededShuffle(run.lesson!.ids, `${regionId}:${run.lesson!.key}:practice`);
      return go(run, {step: 'practice', queue, pos: 0, firsts: [], requeued: false}, queue[0]);
    }
    if (!answer) return;
    if (run.pos + 1 < run.queue.length) return go(run, {pos: run.pos + 1}, run.queue[run.pos + 1]);
    if (run.step === 'practice') {
      const wrong = run.firsts.filter(f => !f.ok).map(f => f.id);
      // the ones answered wrongly come back once at the end of the practice
      if (wrong.length && !run.requeued) return go(run, {queue: [...run.queue, ...wrong], pos: run.pos + 1, requeued: true}, wrong[0]);
      const queue = seededShuffle(run.lesson!.ids, `${regionId}:${run.lesson!.key}:test`);
      return go(run, {step: 'test', queue, pos: 0, firsts: [], requeued: false}, queue[0]);
    }
    finish(run);
  };
  // Enter moves on
  useEffect(() => {
    if (!run || run.done || (run.step !== 'know' && !answer)) return;
    const onKey = (e: KeyboardEvent) => {if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement) && !(e.target instanceof HTMLAnchorElement)) {e.preventDefault(); next();}};
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const lessonIndex = run?.lesson ? lessons.findIndex(l => l.key === run.lesson!.key) : -1;
  /** Look at the structures answered wrongly once more (step 1 with just those). */
  const reviseWrong = (ids: string[]) => {if (!run?.lesson) return; runs.current += 1; setReadiness({key: '', ready: false}); prepare(structures.get(ids[0])); setRun({...run, id: runs.current, done: undefined, step: 'know', queue: ids, pos: 0, firsts: [], requeued: false});};

  // ---- result ----
  if (run?.done) {
    const d = run.done, wrong = d.wrongIds.map(id => structures.get(id)).filter((s): s is QuizStructure => !!s);
    const nextLesson = run.kind === 'lesson' && d.passed ? lessons.slice(lessonIndex + 1).find(l => l.category === run.lesson!.category) : undefined;
    return <>
      <LearnHeader regionId={regionId}/>
      <section className="quiz-summary lesson-result" aria-label="測驗成績" data-passed={d.passed}>
        <span className="quiz-kicker">{run.kind === 'lesson' ? 'PASS TEST' : 'REVIEW'}</span>
        <h1 ref={title} tabIndex={-1}>{run.kind === 'lesson' ? (d.passed ? '過關了！' : '還差一點，再重溫一下。') : '複習完成。'}</h1>
        <p className="lesson-result-name"><b lang="en">{run.title.en}</b><small lang="zh-Hant">{run.title.zh}</small></p>
        <div className="quiz-result-score"><strong>{d.correct}</strong><span>/ {d.total}<small>答對題數（{percentOf(d.correct, d.total)}%）{run.kind === 'lesson' ? `，需達 ${Math.round(PASS_RATE * 100)}% 才過關` : ''}</small></span></div>
        {run.kind === 'lesson' && <p className="learn-unlock" role="status">{d.passed ? (nextLesson ? '已解鎖下一關。' : '這個類別的關卡已全部過關。') : '未達 80%：先重溫答錯的構造，再測一次。'}</p>}
        {wrong.length > 0 && <p className="quiz-result-description">需要再看的構造：{wrong.map(s => s.name).join('、')}。已列入錯題與明日複習。</p>}
        <div className="quiz-summary-actions">
          {run.kind === 'lesson' && wrong.length > 0 && <button data-slot="quiz-button" className="quiz-primary" onClick={() => reviseWrong(d.wrongIds)}><RotateCcw size={16}/>重溫答錯的 {wrong.length} 個</button>}
          {nextLesson && <button data-slot="quiz-button" className="quiz-primary" onClick={() => startLesson(nextLesson)}>下一關 <ArrowRight size={17}/></button>}
          {run.kind === 'lesson' && <button data-slot="quiz-button" className="quiz-secondary" onClick={() => startLesson(run.lesson!)}>從頭再學這一關</button>}
          <button data-slot="quiz-button" className="quiz-text-button" onClick={leave}>返回關卡地圖</button>
        </div>
      </section>
    </>;
  }

  // ---- lesson play ----
  if (run && target) {
    const step = STEPS.find(s => s.id === run.step)!, category = QUIZ_CATEGORIES.find(c => c.id === categoryOf(target));
    const know = run.step === 'know', stepNo = STEPS.indexOf(step);
    const hide = autoHidden(regionId, catalogue, target);
    const last = run.pos + 1 >= run.queue.length, goesOn = !(last && (run.step === 'test' || run.requeued || !run.firsts.some(f => !f.ok)));
    return <>
      <LearnHeader regionId={regionId} right={<button data-slot="quiz-button" className="quiz-quiet" onClick={leave}>離開關卡 <ArrowLeft size={16}/></button>}/>
      <div className={`quiz-play-layout is-lesson ${know ? 'is-naming' : ''}`} data-step={run.step}>
        <section className="quiz-stage" aria-label="3D 模型">
          <QuizScene key={sceneRetry} catalogue={catalogue} view={{key: questionKey, target, section: 'all', side: settings.side, answered: !!answer, pickedId: answer?.pickedId ?? null, hidden: hide.length ? [...hidden, ...hide] : hidden, context, peeling, command, mode: know ? 'name' : 'find', clarity: .45, only: false, highlightIds: [], progressive: true, next: nextTarget ? {catalogue, target: nextTarget} : undefined, lesson: know ? {seed: `${regionId}:${target.id}`, apart: false} : undefined}}
            onReady={(key, value) => setReadiness({key, ready: value})} onShown={(key, value) => setSeen({key, shown: value})} onProgress={(loaded, total) => setLoad({loaded, total})} onError={setError} onPick={choose} onMessage={setMessage}/>
          <div className="quiz-stage-caption"><span>{region.label}</span><span>{category?.label} · {target.side === 'midline' ? '中線' : target.side === 'right' ? '右側' : '左側'}</span></div>
          <div className="quiz-view-buttons" aria-label="模型視角"><button data-slot="quiz-button" onClick={() => changeView('front')}>前面</button><button data-slot="quiz-button" onClick={() => changeView('back')}>後面</button><button data-slot="quiz-button" onClick={() => changeView('side')}>側面</button>
            {regionId === 'lung' || regionId === 'brain' ? <button data-slot="quiz-button" onClick={() => changeView('medial')}>內側面</button> : null}
            {regionId === 'brain' ? <><button data-slot="quiz-button" onClick={() => changeView('top')}>上面</button><button data-slot="quiz-button" onClick={() => changeView('bottom')}>下面</button></> : null}
            <button data-slot="quiz-button" onClick={() => changeView('fit')} aria-label="模型置中"><RotateCcw size={16}/></button>{(know || answer) && <button data-slot="quiz-button" onClick={() => changeView('answer')} aria-label="放大至目標"><Maximize2 size={15}/>放大</button>}</div>
          {!shown && !error && <div className="quiz-loading" role="status"><span className="quiz-spinner"/><strong>載入本題模型</strong><small>{load.loaded} / {load.total || '…'} 個模型套件</small></div>}
          {shown && !ready && !error && <div className="quiz-loading-chip" role="status"><span className="quiz-spinner"/>其餘構造載入中 {load.loaded} / {load.total}</div>}
          {error && <div className="quiz-model-error" role="alert"><strong>暫時未能作答</strong><p>{error}</p><button data-slot="quiz-button" className="quiz-primary" onClick={() => {setError(''); setReadiness({key: '', ready: false}); setSceneRetry(n => n + 1);}}>重新載入模型</button></div>}
          <div className="quiz-stage-hint">{know ? '紫色標示的是這個構造 · 拖曳旋轉 · 滾輪／雙指縮放' : answer ? '可旋轉模型，對照正確位置' : peeling ? '移開遮擋中：點選構造會暫時隱藏，不計分' : '拖曳旋轉 · 滾輪／雙指縮放 · 點選作答'}</div>
        </section>

        <aside className="quiz-question-card" aria-label="學習關卡" data-target={target.id} data-step={run.step}>
          <div className="quiz-progress-label"><span>{run.title.zh}</span><b>{Math.min(run.pos + 1, run.queue.length)} <span>/ {run.queue.length}</span></b></div>
          <progress className="quiz-progress" value={know ? run.pos + 1 : run.pos + (answer ? 1 : 0)} max={run.queue.length} aria-label="本步驟進度"/>
          {run.kind === 'lesson' && <ol className="lesson-rounds" aria-label="三個步驟">{STEPS.map((s, n) => <li key={s.id} className={n === stepNo ? 'is-now' : n < stepNo ? 'is-done' : ''} aria-current={n === stepNo ? 'step' : undefined}>{n < stepNo ? <Check size={12}/> : <b>{n + 1}</b>}{s.zh}</li>)}</ol>}
          {run.step === 'practice' && run.requeued && run.pos >= run.queue.length - run.firsts.filter(f => !f.ok).length && <p className="lesson-again" role="status"><RotateCcw size={13}/> 剛才答錯的構造再出現一次</p>}
          <div className="quiz-question-heading"><span className="quiz-kicker">{answer ? 'ANSWER · 答案' : step.kicker}</span><span className="quiz-system-label" style={{borderColor: category?.color}}>{category?.label}</span></div>
          {know ? <>
            <h1 className="quiz-target" ref={title} tabIndex={-1}><Name structure={target}/></h1>
            <p className="lesson-copy-note">紫色標示的就是這個構造。看完名稱與重點，再按「下一個」。</p>
            <AnswerCard structure={target} lesson/>
          </> : <>
            <h1 className="quiz-target" ref={title} tabIndex={-1}><Name structure={target}/></h1>
            {!answer ? <div className="quiz-answer-tools">
              <p>{target.space ? '空間本身沒有實體：請點選圍成這個空間的邊界構造，或從中通過的構造。' : <>請在模型上直接點選你認為正確的{category?.label}。</>}</p>
              {run.step === 'practice' && (hint?.location || near.length > 0) && <div className="lesson-hint" aria-label="提示"><span className="lesson-hint-title">提示</span>
                {hint?.location && <p className="lesson-hint-location"><b>{hint.location.label}</b>{hint.location.text}</p>}
                {near.length > 0 && <p className="lesson-hint-location"><b>鄰近</b>{near.map(n => n.chinese ?? n.name).join('、')}</p>}
              </div>}
              <button data-slot="quiz-button" className="quiz-tool-button" aria-pressed={peeling} disabled={!ready} onClick={() => {setPeeling(v => !v); setMessage('');}}><Layers size={17}/><span>{peeling ? '完成移開，返回作答' : '移開遮擋'}<small>{peeling ? '按下此鍵後，再點選模型作答' : '深層構造可先移開表面組織'}</small></span></button>
              {hidden.length > 0 && <button data-slot="quiz-button" className="quiz-text-button" onClick={() => {setHidden([]); setMessage('');}}><RotateCcw size={14}/>還原已移開的 {hidden.length} 個構造</button>}
              {target.system !== 'skeletal' && !target.space && <label className="quiz-context-toggle"><input type="checkbox" checked={context} onChange={e => setContext(e.target.checked)}/>顯示淡色參照物</label>}
              <p className="quiz-message" role="status" aria-live="polite">{message}</p>
            </div> : <div className={`quiz-feedback ${answer.ok ? 'is-correct' : answer.relation ? 'is-close' : 'is-wrong'}`} role="status" aria-live="polite" aria-atomic="true">
              <div className="quiz-feedback-title">{answer.ok ? <CheckCircle2 size={21}/> : answer.relation ? <AlertCircle size={21}/> : answer.pickedId ? <XCircle size={21}/> : <Eye size={21}/>}<strong>{answer.ok ? '答對了！就是這個。' : answer.relation ? (answer.relation === 'typed-part' ? '接近了：你點選的是題目的其中一部分。' : '接近了：你點選的是題目所屬的整體。') : answer.pickedId ? '答錯了，請對照綠色的正確位置。' : '已顯示正確位置。'}</strong></div>
              {answer.pickedId && !answer.ok && structures.get(answer.pickedId) && <div className="quiz-answer-name"><span><i className="wrong-dot"/>你點選的是</span><b><Name structure={structures.get(answer.pickedId)!}/></b></div>}
              <button data-slot="quiz-button" className="quiz-text-button" onClick={() => changeView('answer')}><Target size={15}/>放大正確位置</button>
            </div>}
            {answer && (run.step === 'practice' || !answer.ok) && <AnswerCard structure={target} lesson/>}
          </>}
          <div className="quiz-question-actions">
            {know ? <>
              <button data-slot="quiz-button" className="quiz-secondary" disabled={run.pos === 0} onClick={() => go(run, {pos: run.pos - 1}, run.queue[run.pos - 1])}><ArrowLeft size={16}/>上一個</button>
              <button data-slot="quiz-button" className="quiz-primary" onClick={next}>{last ? (run.kind === 'lesson' ? '開始練習' : '完成') : '下一個'}<ArrowRight size={18}/></button>
            </> : answer ? <button data-slot="quiz-button" className="quiz-primary" onClick={next}>{!last ? '下一題' : goesOn ? '進入過關測驗' : '查看成績'}<ArrowRight size={18}/></button>
              : <button data-slot="quiz-button" className="quiz-secondary" disabled={!ready} onClick={giveUp}><Eye size={17}/>不會，顯示答案</button>}
            <span className="quiz-live-score">{run.step === 'test' ? `答對 ${run.firsts.filter(f => f.ok).length} / ${run.firsts.length} 題` : run.step === 'practice' ? '練習不計入過關' : `${run.pos + 1} / ${run.queue.length}`}</span>
          </div>
        </aside>
      </div>
    </>;
  }

  // ---- level map ----
  return <>
    <LearnHeader regionId={regionId}/>
    <section className="lesson-hub learn-map" aria-label="關卡地圖" data-passed={passedCount} data-total={lessons.length}>
      <div className="lesson-hub-head">
        <span className="quiz-kicker"><Target size={15}/> LEVEL MAP</span>
        <h1 ref={title} tabIndex={-1}>{region.label}學習<small lang="en">Learn · {region.english}</small></h1>
        <p>每關三步：<b>認識</b>（逐個看位置與重點）→ <b>練習</b>（在模型上找，有提示）→ <b>過關測驗</b>（沒有提示，答對 80% 以上解鎖下一關）。</p>
        <p className="lesson-hub-total"><b>{lessons.length} 關 · 已過關 {passedCount}</b></p>
      </div>
      <div className="lesson-hub-extra">
        <div className="lesson-card lesson-review" data-due={dueHere.length}>
          <span><b lang="zh-Hant">今日複習</b><small lang="en">Review due today</small><em>{dueHere.length ? `${dueHere.length} 個構造到了複習日` : '今天沒有需要複習的構造；過關測驗答對的構造會在 1、3、7、14、30 天後回來'}</em></span>
          <button data-slot="quiz-button" className="quiz-primary" disabled={!dueHere.length} onClick={startReview}>開始複習 <ArrowRight size={16}/></button>
        </div>
      </div>
      {!lessons.length && <p className="quiz-pool-note is-empty" role="status">這個區域暫時沒有關卡。</p>}
      {map.map(({category, items}) => {
        const def = QUIZ_CATEGORIES.find(c => c.id === category)!, done = items.filter(i => i.state === 'passed').length;
        return <section key={category} className="lesson-group" data-category={category} aria-label={def.label}>
          <h2><i style={{background: def.color}}/>{def.label}<small lang="en">{def.english}</small><span className="lesson-group-sum">{done} / {items.length} 關</span></h2>
          <ol className="lesson-grid learn-path">{items.map(({lesson, state}) => {
            const p = progress[keyOf(lesson)], weak = needReview(lesson.ids, flagged), started = state === 'current' && !!p?.started;
            return <li key={lesson.key}><button data-slot="quiz-button" className={`lesson-card lesson-item is-${state} ${started ? 'is-started' : ''}`} data-lesson={lesson.key} data-state={state} disabled={state === 'locked'} aria-label={`${lesson.zh}，${state === 'passed' ? '已過關' : state === 'locked' ? '未解鎖' : started ? '進行中' : '可開始'}`} onClick={() => startLesson(lesson)}>
              <span className="lesson-item-text"><b lang="en">{lesson.en}</b><small lang="zh-Hant">{lesson.zh}</small><em>{lesson.ids.length} 個構造{p?.best ? ` · 最佳 ${p.best}%` : ''}</em>
                {weak.length > 0 && <span className="learn-weak" title={weak.map(id => structures.get(id)?.name).filter(Boolean).join('、')}><AlertCircle size={12}/>需重溫 {weak.length} 個</span>}</span>
              <span className="lesson-item-side learn-state">{state === 'passed' ? <><Check size={18}/><small>已過關</small></> : state === 'locked' ? <><Lock size={16}/><small>未解鎖</small></> : <><Play size={16}/><small>{started ? '進行中' : '開始'}</small></>}</span>
            </button></li>;
          })}</ol>
        </section>;
      })}
      <label className="learn-unlock-all"><input type="checkbox" checked={unlockAll} onChange={e => {setUnlockAll(e.target.checked); saveUnlockAll(e.target.checked);}}/>解鎖全部關卡（自行安排進度）</label>
      <p className="lesson-hub-foot"><a className="quiz-text-button learn-quiz-link" href={region.hash}>到 Quiz 檢測這個區域</a></p>
      <p className="lesson-hub-note"><AlertCircle size={13}/> 進度只存在這個瀏覽器，不會上傳。</p>
    </section>
  </>;
}
