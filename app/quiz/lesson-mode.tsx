import {useEffect, useMemo, useRef, useState} from 'react';
import {AlertCircle, ArrowLeft, ArrowRight, Check, ChevronRight, Eye, Maximize2, Pencil, RotateCcw, Target} from 'lucide-react';
import {QUIZ_CATEGORIES, QUIZ_REGIONS, categoryOf, type QuizCatalogue, type QuizRegionId, type QuizSettings} from './catalogue';
import {judgeName, relationOf, type AnswerLanguage} from './naming';
import {addMistakes, clearMistakes, loadMistakes, scopeOf} from './mistakes';
import {structureCard} from './card';
import {AnswerCard, Name, NameFeedback, QuizScene} from './parts';
import {buildLessons, hintFor, scopeKeyOf, seededShuffle, type Lesson} from './lessons';
import {accuracyOf, applyReview, dayKey, dueIds, loadResults, loadReview, recordResult, resultKey, saveResults, saveReview, starsFor, summarise, typingSpeed, type TypedEntry} from './lesson-progress';
import type {QuizView} from './viewer';

type Result = 'correct' | 'close' | 'wrong' | 'skipped';
interface Attempt {id: string; round: 1 | 2 | 3; first: boolean; result: Result}
interface Run {
  id: number;
  kind: 'lesson' | 'mixed';
  lesson?: Lesson;
  title: {en: string; zh: string};
  round: 1 | 2 | 3;
  queue: string[];
  pos: number;
  /** The wrong answers of a round come back once at its end: the index where those repeats begin. */
  requeueAt?: number;
  attempts: Attempt[];
  typing: TypedEntry[];
  done?: {stars?: 0 | 1 | 2 | 3; round3?: [number, number]; accuracy: number; wpm: number | null; wrongIds: string[]; saved: boolean};
}
const ROUNDS = {
  1: {zh: '學習', en: 'Learn', kicker: 'COPY IT · 照著輸入'},
  2: {zh: '提示', en: 'Hint', kicker: 'HINT · 看提示作答'},
  3: {zh: '憑記憶', en: 'Recall', kicker: 'RECALL · 憑記憶作答'},
} as const;
/** Structures answered wrongly at the first attempt of this round come back once at its end (not in the learn round, and not again after a repeat). */
const repeats = (r: Run): string[] => r.round > 1 && r.requeueAt === undefined ? [...new Set(r.attempts.filter(a => a.first && a.round === r.round && a.result !== 'correct').map(a => a.id))] : [];
const endsRun = (r: Run) => r.pos + 1 >= r.queue.length && repeats(r).length === 0 && (r.round === 3 || r.kind === 'mixed');
const Stars = ({n, label}: {n: number; label?: string}) => <span className="lesson-stars" role="img" aria-label={label ?? `${n} 顆星`}>{[1, 2, 3].map(i => <span key={i} className={i <= n ? 'is-on' : ''} aria-hidden="true">★</span>)}</span>;

/** Level 2 (學習關卡): lessons of a few structures, each in three rounds (learn, hint, recall), stars, and a spaced-review round of what is due today. */
export function LessonMode({catalogue, regionId, settings, language, needSide, context, onExit}: {
  catalogue: QuizCatalogue; regionId: QuizRegionId; settings: QuizSettings; language: AnswerLanguage; needSide: boolean; context: boolean; onExit: () => void;
}) {
  const region = QUIZ_REGIONS[regionId], scopeKey = scopeKeyOf(settings), mistakeScope = scopeOf(regionId, 2);
  const lessons = useMemo(() => buildLessons(catalogue, settings), [catalogue, settings]);
  const structures = useMemo(() => new Map(catalogue.structures.map(s => [s.id, s])), [catalogue]);
  const [results, setResults] = useState(() => loadResults(regionId)), [review, setReview] = useState(() => loadReview(regionId)), [mistakes, setMistakes] = useState(() => loadMistakes(mistakeScope));
  const today = useMemo(() => dayKey(), []);
  const [run, setRun] = useState<Run | null>(null), [typed, setTyped] = useState(''), [answer, setAnswer] = useState<{typed: string; result: Result; relation?: 'typed-part' | 'typed-whole'} | null>(null);
  const [message, setMessage] = useState(''), [command, setCommand] = useState<{id: number; view: QuizView}>({id: 0, view: 'front'});
  const [readiness, setReadiness] = useState({key: '', ready: false}), [load, setLoad] = useState({loaded: 0, total: 0}), [error, setError] = useState(''), [sceneRetry, setSceneRetry] = useState(0);
  const title = useRef<HTMLHeadingElement>(null), input = useRef<HTMLInputElement>(null), firstKey = useRef<number | null>(null), runs = useRef(0);
  useEffect(() => {title.current?.focus();}, [run?.id, run?.round, run?.done]);

  const keyOf = (l: Lesson) => resultKey(scopeKey, l.key);
  const total = summarise(lessons.map(keyOf), results);
  const dueHere = useMemo(() => dueIds(review, today).filter(id => structures.has(id)), [review, today, structures]);
  const mistakesHere = useMemo(() => mistakes.filter(id => structures.has(id)), [mistakes, structures]);
  const target = run && !run.done ? structures.get(run.queue[run.pos]) : undefined;
  const questionKey = run && target ? `L${run.id}:${run.round}:${run.pos}:${target.id}` : '';
  const ready = readiness.key === questionKey && readiness.ready && !error;
  const card = useMemo(() => target ? structureCard(target) : null, [target]);
  const hint = useMemo(() => target && card ? hintFor(target, card.fields, language) : null, [target, card, language]);
  const changeView = (view: QuizView) => setCommand(c => ({id: c.id + 1, view}));

  const clear = () => {setTyped(''); setAnswer(null); setMessage(''); setError(''); firstKey.current = null;};
  const start = (spec: {kind: 'lesson'; lesson: Lesson} | {kind: 'mixed'; ids: string[]; title: {en: string; zh: string}}) => {
    runs.current += 1;
    const ids = spec.kind === 'lesson' ? spec.lesson.ids : spec.ids;
    if (!ids.length) return;
    clear(); setReadiness({key: '', ready: false});
    setRun({id: runs.current, kind: spec.kind, lesson: spec.kind === 'lesson' ? spec.lesson : undefined, title: spec.kind === 'lesson' ? {en: spec.lesson.en, zh: spec.lesson.zh} : spec.title,
      round: spec.kind === 'lesson' ? 1 : 3, queue: spec.kind === 'lesson' ? ids : seededShuffle(ids, `${regionId}:${today}:${spec.title.en}`), pos: 0, attempts: [], typing: []});
  };

  /** Rounds 2 and 3 and the mixed round: the first attempt of a structure is scored; a repeat after a wrong answer is not. */
  const record = (r: Run, id: string, result: Result, text: string): Run => {
    const first = !r.attempts.some(a => a.id === id && a.round === r.round);
    const attempt: Attempt = {id, round: r.round, first, result};
    const typing = first && text && firstKey.current ? [...r.typing, {text, ms: Date.now() - firstKey.current}] : r.typing;
    if (r.round > 1) {
      if (first) {
        if (result !== 'correct') setMistakes(addMistakes(mistakeScope, [id]));
        else if (r.round === 3) setMistakes(addMistakes(mistakeScope, [], [id]));
        if (r.round === 3) setReview(rv => {const next = applyReview(rv, id, result === 'correct', today); saveReview(regionId, next); return next;});
      }
    }
    return {...r, attempts: [...r.attempts, attempt], typing};
  };

  const submit = () => {
    if (!run || !target || answer || !ready || !typed.trim()) return;
    const related = [...structures.values()].filter(s => s.id !== target.id && s.system === target.system && relationOf(s, target));
    // in the learn round either name may be copied; later rounds follow the answer language chosen on the setup page
    const verdict = judgeName(typed, target, {language: run.round === 1 ? 'any' : language, needSide: run.round === 1 ? false : needSide}, related);
    if (run.round === 1) {
      if (verdict.result !== 'correct') {setMessage('請照著上方的名稱輸入，再按送出。'); return;}
      setRun(record(run, target.id, 'correct', typed.trim())); setAnswer({typed: typed.trim(), result: 'correct'}); return;
    }
    setRun(record(run, target.id, verdict.result, typed.trim())); setAnswer({typed: typed.trim(), result: verdict.result, relation: verdict.relation});
  };
  const giveUp = () => {
    if (!run || !target || answer || !ready) return;
    if (run.round === 1) {setRun(record(run, target.id, 'correct', '')); setAnswer({typed: '', result: 'correct'}); return;}
    setRun(record(run, target.id, 'skipped', '')); setAnswer({typed: '', result: 'skipped'});
  };

  const finish = (r: Run) => {
    const scored = r.attempts.filter(a => a.first && a.round > 1), r3 = r.attempts.filter(a => a.first && a.round === 3);
    const wrongIds = [...new Set(scored.filter(a => a.result !== 'correct').map(a => a.id))];
    const accuracy = accuracyOf(scored.filter(a => a.result === 'correct').length, scored.length), wpm = typingSpeed(r.typing);
    if (r.kind === 'lesson' && r.lesson) {
      const stars = starsFor({round3Total: r3.length, round3Correct: r3.filter(a => a.result === 'correct').length, wrongs: wrongIds.length});
      setResults(old => {const next = recordResult(old, keyOf(r.lesson!), {stars, accuracy, wpm, at: today}); saveResults(regionId, next); return next;});
      setRun({...r, done: {stars, round3: [r3.filter(a => a.result === 'correct').length, r3.length], accuracy, wpm, wrongIds, saved: true}});
    } else setRun({...r, done: {accuracy, wpm, wrongIds, saved: true, round3: [r3.filter(a => a.result === 'correct').length, r3.length]}});
  };
  const next = () => {
    if (!run || !answer) return;
    const nextPos = run.pos + 1;
    if (nextPos < run.queue.length) {clear(); setRun({...run, pos: nextPos}); return;}
    const again = repeats(run);
    if (again.length) {clear(); setRun({...run, queue: [...run.queue, ...again], pos: nextPos, requeueAt: run.queue.length}); return;}
    if (run.kind === 'lesson' && run.lesson && run.round < 3) {
      const round = (run.round + 1) as 2 | 3;
      clear(); setRun({...run, round, queue: seededShuffle(run.lesson.ids, `${regionId}:${run.lesson.key}:${round}`), pos: 0, requeueAt: undefined}); return;
    }
    finish(run);
  };
  // Enter moves on once an answer is shown
  useEffect(() => {
    if (!answer) return;
    const onKey = (e: KeyboardEvent) => {if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) {e.preventDefault(); next();}};
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  useEffect(() => {if (ready && !answer) input.current?.focus();}, [ready, answer, questionKey]);

  const leave = () => {setRun(null); clear();};
  const lessonIndex = run?.lesson ? lessons.findIndex(l => l.key === run.lesson!.key) : -1, nextLesson = lessonIndex >= 0 ? lessons[lessonIndex + 1] : undefined;

  // ---- result ----
  if (run?.done) {
    const d = run.done, names = d.wrongIds.map(id => structures.get(id)).filter((s): s is NonNullable<typeof s> => !!s);
    return <section className="quiz-summary lesson-result" aria-label="關卡成績">
      <span className="quiz-kicker">{run.kind === 'lesson' ? 'LESSON COMPLETE' : 'REVIEW COMPLETE'}</span>
      <h1 ref={title} tabIndex={-1}>{run.kind === 'lesson' ? (d.stars ? '關卡完成。' : '關卡完成，再練一次會更穩。') : '複習完成。'}</h1>
      <p className="lesson-result-name"><b lang="en">{run.title.en}</b><small lang="zh-Hant">{run.title.zh}</small></p>
      {run.kind === 'lesson' && <div className="lesson-result-stars"><Stars n={d.stars ?? 0}/><span>{d.stars ?? 0} / 3 顆星</span></div>}
      <div className="quiz-result-score"><strong>{d.round3?.[0] ?? 0}</strong><span>/ {d.round3?.[1] ?? 0}<small>{run.kind === 'lesson' ? '第三輪憑記憶，一次答對的題數' : '一次答對的題數'}</small></span></div>
      <p className="lesson-stat" data-wpm={d.wpm ?? ''}>{d.wpm !== null ? <>打字速度 <b>{d.wpm}</b> WPM · </> : null}不看答案的正確率 <b>{d.accuracy}%</b></p>
      {names.length > 0 && <p className="quiz-result-description">需要再練的構造：{names.map(s => s.name).join('、')}。已列入錯題與明日複習。</p>}
      <div className="quiz-summary-actions">
        {nextLesson && run.kind === 'lesson' && <button data-slot="quiz-button" className="quiz-primary" onClick={() => start({kind: 'lesson', lesson: nextLesson})}>下一關 <ArrowRight size={17}/></button>}
        {run.kind === 'lesson' && run.lesson && <button data-slot="quiz-button" className="quiz-secondary" onClick={() => start({kind: 'lesson', lesson: run.lesson!})}><RotateCcw size={16}/>再練這一關</button>}
        <button data-slot="quiz-button" className={nextLesson && run.kind === 'lesson' ? 'quiz-text-button' : 'quiz-primary'} onClick={leave}>返回關卡列表</button>
      </div>
    </section>;
  }

  // ---- play ----
  if (run && target) {
    const round = run.round, side = target.side === 'midline' ? settings.side : target.side;
    const category = QUIZ_CATEGORIES.find(c => c.id === categoryOf(target));
    return <div className="quiz-play-layout is-naming is-lesson" data-round={round}>
      <section className="quiz-stage" aria-label="3D 模型">
        <QuizScene key={sceneRetry} catalogue={catalogue} view={{key: questionKey, target, section: 'all', side, answered: !!answer, pickedId: null, hidden: [], context, peeling: false, command, mode: 'name', clarity: .45, only: false, highlightIds: [], lesson: {seed: `${regionId}:${target.id}`, apart: round === 3}}}
          onReady={(key, value) => setReadiness({key, ready: value})} onProgress={(loaded, total2) => setLoad({loaded, total: total2})} onError={setError} onPick={() => {}} onMessage={setMessage}/>
        <div className="quiz-stage-caption"><span>{region.label}</span><span>{category?.label} · {target.side === 'midline' ? '中線' : target.side === 'right' ? '右側' : '左側'}</span></div>
        <div className="quiz-view-buttons" aria-label="模型視角"><button data-slot="quiz-button" onClick={() => changeView('front')}>前面</button><button data-slot="quiz-button" onClick={() => changeView('back')}>後面</button><button data-slot="quiz-button" onClick={() => changeView('side')}>側面</button>
          <button data-slot="quiz-button" onClick={() => changeView('fit')} aria-label="模型置中"><RotateCcw size={16}/></button><button data-slot="quiz-button" onClick={() => changeView('random')}>題目視角</button><button data-slot="quiz-button" onClick={() => changeView('answer')} aria-label="放大至目標"><Maximize2 size={15}/>放大</button></div>
        {!ready && !error && <div className="quiz-loading" role="status"><span className="quiz-spinner"/><strong>載入本題模型</strong><small>{load.loaded} / {load.total || '…'} 個模型套件</small></div>}
        {error && <div className="quiz-model-error" role="alert"><strong>暫時未能作答</strong><p>{error}</p><button data-slot="quiz-button" className="quiz-primary" onClick={() => {setError(''); setReadiness({key: '', ready: false}); setSceneRetry(n => n + 1);}}>重新載入模型</button></div>}
        <div className="quiz-stage-hint">{answer ? '可旋轉模型，對照黃色標示的構造' : '黃色標示的構造 · 拖曳旋轉 · 滾輪／雙指縮放'}</div>
      </section>

      <aside className="quiz-question-card" aria-label="學習關卡題目" data-target={target.id} data-round={round}>
        <div className="quiz-progress-label"><span>{run.title.zh}</span><b>{Math.min(run.pos + 1, run.queue.length)} <span>/ {run.queue.length}</span></b></div>
        <progress className="quiz-progress" value={run.pos + (answer ? 1 : 0)} max={run.queue.length} aria-label="本輪進度"/>
        <ol className="lesson-rounds" aria-label="三輪練習">{([1, 2, 3] as const).map(n => <li key={n} className={n === round ? 'is-now' : n < round ? 'is-done' : ''} aria-current={n === round ? 'step' : undefined}>{n < round ? <Check size={12}/> : <b>{n}</b>}{ROUNDS[n].zh}<small>{ROUNDS[n].en}</small></li>)}</ol>
        {run.requeueAt !== undefined && run.pos >= run.requeueAt && <p className="lesson-again" role="status"><RotateCcw size={13}/> 剛才答錯的構造再出現一次</p>}
        <div className="quiz-question-heading"><span className="quiz-kicker">{answer ? 'ANSWER · 答案' : ROUNDS[round].kicker}</span><span className="quiz-system-label" style={{borderColor: category?.color}}>{category?.label}</span></div>
        {!answer ? <form className="quiz-name-form" onSubmit={e => {e.preventDefault(); submit();}}>
          {round === 1 ? <h1 className="quiz-target" ref={title} tabIndex={-1}><Name structure={target}/></h1> : <h1 className="quiz-target quiz-target-hidden" ref={title} tabIndex={-1}>黃色標示的是什麼構造？</h1>}
          {round === 1 && <p className="lesson-copy-note">黃色標示的就是這個構造。請把名稱輸入一次，幫助記憶。</p>}
          {round === 2 && hint && <div className="lesson-hint" aria-label="提示"><span className="lesson-hint-title">提示</span>
            <p lang="en" className="lesson-hint-letters">{hint.letters}</p>
            {hint.chinese && <p lang="zh-Hant" className="lesson-hint-zh">{hint.chinese}</p>}
            {hint.location && <p className="lesson-hint-location"><b>{hint.location.label}</b>{hint.location.text}</p>}
          </div>}
          <label htmlFor="lesson-typed">請輸入名稱<small>{round === 1 ? '英文或中文皆可' : language === 'en' ? '用英文作答' : language === 'zh' ? '用中文作答' : '英文或中文皆可'}{round > 1 && needSide ? '，並寫出左右側' : ''}</small></label>
          <input id="lesson-typed" ref={input} className="quiz-name-input" value={typed} onChange={e => {if (!typed && e.target.value && firstKey.current === null) firstKey.current = Date.now(); setTyped(e.target.value);}} autoComplete="off" autoCapitalize="off" spellCheck={false} lang={language === 'zh' ? 'zh-Hant' : 'en'} placeholder={round === 1 ? '照著上方的名稱輸入' : '輸入名稱'} disabled={!ready}/>
          <div className="quiz-name-actions"><button type="submit" data-slot="quiz-button" className="quiz-primary" disabled={!ready || !typed.trim()}><Pencil size={16}/>送出<small>Enter</small></button>
            <button type="button" data-slot="quiz-button" className="quiz-secondary" disabled={!ready} onClick={giveUp}>{round === 1 ? <><ChevronRight size={17}/>略過</> : <><Eye size={17}/>我不知道</>}</button></div>
          <p className="quiz-message" role="status" aria-live="polite">{message}</p>
        </form> : <>
          {round === 1 ? <div className="quiz-feedback is-correct" role="status" aria-live="polite"><div className="quiz-feedback-title"><Check size={21}/><strong>{answer.typed ? '很好，記住它。' : '已略過。'}</strong></div><div className="quiz-answer-name"><span><i className="correct-dot"/>名稱</span><b><Name structure={target}/></b></div></div>
            : <NameFeedback result={answer.result} typed={answer.typed} relation={answer.relation} target={target} language={language} onZoom={() => changeView('answer')}/>}
          {round > 1 && answer.result !== 'correct' && <AnswerCard structure={target}/>}
        </>}
        <div className="quiz-question-actions">
          {answer ? <button data-slot="quiz-button" className="quiz-primary" onClick={next}>{endsRun(run) ? '查看成績' : run.pos + 1 >= run.queue.length && repeats(run).length === 0 ? '下一輪' : '下一題'}<ArrowRight size={18}/></button> : null}
          <button data-slot="quiz-button" className="quiz-text-button" onClick={leave}>離開關卡</button>
        </div>
      </aside>
    </div>;
  }

  // ---- hub ----
  const groups = QUIZ_CATEGORIES.map(c => ({category: c, items: lessons.filter(l => l.category === c.id)})).filter(g => g.items.length);
  return <section className="lesson-hub" aria-label="學習關卡">
    <div className="lesson-hub-head">
      <span className="quiz-kicker"><Target size={15}/> GUIDED LESSONS</span>
      <h1 ref={title} tabIndex={-1}>學習關卡<small lang="en">Guided lessons · {region.english}</small></h1>
      <p>每一關約 6 至 10 個構造，由上而下依位置排列。每關三輪：先看名稱照著輸入，再看提示，最後憑記憶作答。</p>
      <p className="lesson-hub-total" data-total={total.text}><b>{total.text}</b></p>
    </div>
    <div className="lesson-hub-extra">
      <div className="lesson-card lesson-review" data-due={dueHere.length}>
        <span><b lang="zh-Hant">今日複習</b><small lang="en">Review due today</small><em>{dueHere.length ? `${dueHere.length} 個構造到了複習日` : '今天沒有需要複習的構造；答對的構造會在 1、3、7、14、30 天後回來'}</em></span>
        <button data-slot="quiz-button" className="quiz-primary" disabled={!dueHere.length} onClick={() => start({kind: 'mixed', ids: dueHere, title: {en: 'Review due today', zh: '今日複習'}})}>開始複習 <ArrowRight size={16}/></button>
      </div>
      {mistakesHere.length > 0 && <div className="lesson-card lesson-mistakes">
        <span><b lang="zh-Hant">錯題本（第二級）</b><small lang="en">Mistakes of the lessons</small><em>{mistakesHere.length} 個構造</em></span>
        <span className="lesson-card-actions"><button data-slot="quiz-button" className="quiz-secondary" onClick={() => start({kind: 'mixed', ids: mistakesHere, title: {en: 'Lesson mistakes', zh: '錯題練習'}})}><RotateCcw size={14}/>只練錯題</button><button data-slot="quiz-button" className="quiz-text-button" onClick={() => {clearMistakes(mistakeScope); setMistakes([]);}}>清除</button></span>
      </div>}
    </div>
    {!groups.length && <p className="quiz-pool-note is-empty" role="status">這個範圍暫時沒有關卡。請回到設定調整部位、類別或左右側。</p>}
    {groups.map(({category, items}) => {
      const sum = summarise(items.map(keyOf), results);
      return <section key={category.id} className="lesson-group" data-category={category.id} aria-label={category.label}>
        <h2><i style={{background: category.color}}/>{category.label}<small lang="en">{category.english}</small><span className="lesson-group-sum">{sum.text}</span></h2>
        <div className="lesson-grid">{items.map(l => {
          const r = results[keyOf(l)];
          return <button key={l.key} data-slot="quiz-button" className={`lesson-card lesson-item ${r && r.stars >= 1 ? 'is-cleared' : ''}`} data-lesson={l.key} onClick={() => start({kind: 'lesson', lesson: l})}>
            <span className="lesson-item-text"><b lang="en">{l.en}</b><small lang="zh-Hant">{l.zh}</small><em>{l.ids.length} 個構造{r ? ` · 正確率 ${r.accuracy}%${r.wpm ? ` · ${r.wpm} WPM` : ''}` : ''}</em></span>
            <span className="lesson-item-side"><Stars n={r?.stars ?? 0}/>{r && r.stars >= 1 && <small>已通過</small>}</span>
          </button>;
        })}</div>
      </section>;
    })}
    <p className="lesson-hub-foot"><button data-slot="quiz-button" className="quiz-text-button" onClick={onExit}><ArrowLeft size={14}/>回到設定</button></p>
    <p className="lesson-hub-note"><AlertCircle size={13}/> 進度只存在這個瀏覽器，不會上傳。</p>
  </section>;
}
