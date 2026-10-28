import {useEffect, useMemo, useRef, useState} from 'react';
import {AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, Eye, Layers, Maximize2, Pencil, RotateCcw, Shuffle, Target, Trash2, X, XCircle} from 'lucide-react';
import {fetchModelBuffer} from '../model-download';
import {QUIZ_REGIONS, QUIZ_SYSTEMS, questionPool, type QuizCatalogue, type QuizRegionId, type QuizSettings, type QuizStructure} from './catalogue';
import {createSession, recordAnswer, recordTyped, retryMistakes, sessionOf, type QuizSession} from './engine';
import {acceptedNames, judgeName, preferredName, type AnswerLanguage} from './naming';
import {namingPool, neighbours} from './level2';
import {addMistakes, clearMistakes, loadMistakes, scopeOf} from './mistakes';
import {structureCard} from './card';
import {createQuizViewer, type QuizView, type QuizViewState} from './viewer';
import './quiz.css';

function QuizScene({catalogue, view, onReady, onProgress, onError, onPick, onMessage}: {
  catalogue: QuizCatalogue; view: QuizViewState;
  onReady: (key: string, ready: boolean) => void; onProgress: (loaded: number, total: number) => void;
  onError: (message: string) => void; onPick: (id: string) => void; onMessage: (message: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null), viewer = useRef<ReturnType<typeof createQuizViewer> | null>(null);
  const callbacks = useRef({onReady, onProgress, onError, onPick, onMessage});
  callbacks.current = {onReady, onProgress, onError, onPick, onMessage};
  const latest = useRef(view); latest.current = view;
  useEffect(() => {
    try {
      viewer.current = createQuizViewer(host.current!, catalogue, {
        ready: (key, ready) => callbacks.current.onReady(key, ready),
        progress: (loaded, total) => callbacks.current.onProgress(loaded, total),
        error: message => callbacks.current.onError(message),
        pick: id => callbacks.current.onPick(id),
        miss: () => callbacks.current.onMessage('未點中構造。請放大、旋轉後再點選一次；本次不扣分。'),
        keyboard: message => callbacks.current.onMessage(message),
      });
      viewer.current.update(latest.current);
    } catch {
      callbacks.current.onError('無法啟動 3D 顯示。請重新載入模型，或改用支援 WebGL 的瀏覽器開啟。');
    }
    return () => {viewer.current?.dispose(); viewer.current = null;};
  }, [catalogue]);
  useEffect(() => {viewer.current?.update(view);}, [view]);
  return <div className="quiz-canvas" ref={host}/>;
}

/** English name first (large, dark), Chinese name (Taiwan medical terminology) after it in small grey. Cards with little room set it on one line. */
function Name({structure}: {structure: QuizStructure}) {
  return <><span className="bn-en" lang="en">{structure.name}</span>{structure.chinese && <small className="bn-zh" lang="zh-Hant">{structure.chinese}</small>}</>;
}

/** Shown under the correct answer, right or wrong: English name (large), Chinese name (small), then the fields for that kind of structure. */
function AnswerCard({structure}: {structure: QuizStructure}) {
  const card = useMemo(() => structureCard(structure), [structure]);
  const blank = card.fields.length === 0;
  return <section className="quiz-info-card" aria-label="構造資料卡" data-system={card.system}>
    <h2 lang="en">{card.english}</h2>
    {card.chinese && <p className="quiz-info-zh" lang="zh-Hant">{card.chinese}</p>}
    <dl>
      {[...card.fields.map(f => ({label: f.label, zh: f.zh, en: f.en})), ...card.missing.map(label => ({label, zh: undefined as string | undefined, en: undefined as string | undefined}))]
        .sort((a, b) => order(card.system).indexOf(a.label) - order(card.system).indexOf(b.label))
        .map(f => <div key={f.label} className={f.zh || f.en ? undefined : 'is-empty'}>
          <dt>{f.label}</dt>
          <dd>{f.zh || f.en ? <>{f.zh && <span lang="zh-Hant">{f.zh}</span>}{f.en && <small lang="en">{f.en}</small>}</> : <span className="quiz-info-none">尚無資料</span>}</dd>
        </div>)}
    </dl>
    {blank && <p className="quiz-info-note">此構造尚未建立詳細資料，欄位留空。</p>}
  </section>;
}
const FIELD_ORDER: Record<string, string[]> = {
  muscular: ['起點', '止點', '作用', '神經支配', '血液供應'],
  nervous: ['來源', '走向', '主要分支', '支配範圍'],
  arterial: ['來源', '走向', '主要分支', '供應範圍'],
  venous: ['來源', '走向', '主要分支', '引流範圍'],
  skeletal: ['主要標誌', '相關關節', '附著肌肉'],
  cardiac: ['說明'],
};
const order = (system: string) => FIELD_ORDER[system] ?? [];

const defaults: QuizSettings = {section: 'all', systems: ['skeletal', 'muscular', 'nervous', 'arterial', 'venous'], side: 'right', count: 10};
const LEVEL2_COUNTS = [5, 10, 20];

export default function RegionQuiz({region: regionId = 'lower-limb'}: {region?: QuizRegionId} = {}) {
  const region = QUIZ_REGIONS[regionId];
  const [catalogue, setCatalogue] = useState<QuizCatalogue | null>(null), [catalogueError, setCatalogueError] = useState(''), [catalogueRetry, setCatalogueRetry] = useState(0);
  const [settings, setSettings] = useState<QuizSettings>({...defaults, side: region.defaultSide ?? defaults.side, systems: region.systems ?? defaults.systems}), [phase, setPhase] = useState<'setup' | 'playing' | 'summary' | 'review'>('setup');
  const [session, setSession] = useState<QuizSession>({queue: [], answers: []}), [index, setIndex] = useState(0), [round, setRound] = useState(0);
  const [hidden, setHidden] = useState<string[]>([]), [peeling, setPeeling] = useState(false), [context, setContext] = useState(true);
  const [command, setCommand] = useState<{id: number; view: QuizView}>({id: 0, view: 'front'});
  const [readiness, setReadiness] = useState({key: '', ready: false}), [load, setLoad] = useState({loaded: 0, total: 0});
  const [error, setError] = useState(''), [message, setMessage] = useState(''), [sceneRetry, setSceneRetry] = useState(0);
  // Level 1: given a name, find the structure. Level 2: given a structure, write its name.
  const [level, setLevel] = useState<1 | 2>(1), [language, setLanguage] = useState<AnswerLanguage>('any'), [needSide, setNeedSide] = useState(false);
  const [typed, setTyped] = useState(''), [clarity, setClarity] = useState(.45), [only, setOnly] = useState(false), [highlightId, setHighlightId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]), [sessionLevel, setSessionLevel] = useState<1 | 2>(1);
  const naming = sessionLevel === 2;
  const title = useRef<HTMLHeadingElement>(null), input = useRef<HTMLInputElement>(null);
  const scope = scopeOf(regionId, level);
  useEffect(() => {setSaved(loadMistakes(scope));}, [scope]);

  useEffect(() => {
    const abort = new AbortController();
    setCatalogueError('');
    void fetchModelBuffer(`${import.meta.env.BASE_URL}models/${region.file}`, 0, false, abort.signal)
      .then(bytes => {
        const data = JSON.parse(new TextDecoder().decode(bytes)) as QuizCatalogue;
        if (data.version !== 1 || !data.structures?.length || !data.packages?.length || (data.region ?? 'lower-limb') !== regionId) throw Error('Invalid quiz catalogue');
        if (!abort.signal.aborted) setCatalogue(data);
      })
      .catch(() => {if (!abort.signal.aborted) setCatalogueError('測驗目錄未能載入，請重試。');});
    return () => abort.abort();
  }, [catalogueRetry, region.file, regionId]);
  useEffect(() => {title.current?.focus();}, [phase, index]);

  const pool = useMemo(() => catalogue ? (level === 2 ? namingPool(catalogue, settings) : questionPool(catalogue, settings)) : [], [catalogue, settings, level]);
  const allInScope = useMemo(() => catalogue ? questionPool(catalogue, settings).length : 0, [catalogue, settings]);
  const structures = useMemo(() => new Map(catalogue?.structures.map(s => [s.id, s])), [catalogue]);
  const target = structures.get(session.queue[index]);
  const answer = session.answers[index];
  const picked = answer?.pickedId ? structures.get(answer.pickedId) : undefined;
  const section = region.sections.find(s => s.id === settings.section)!;
  const system = QUIZ_SYSTEMS.find(s => s.id === target?.system);
  const systemChips = QUIZ_SYSTEMS.filter(s => region.systems ? region.systems.includes(s.id) : s.id !== 'cardiac');
  const contextName = regionId === 'heart' ? '其他心臟構造' : '骨骼';
  const questionKey = `${round}:${index}:${target?.id ?? ''}`;
  const ready = readiness.key === questionKey && readiness.ready && !error;
  const correct = session.answers.filter(a => a.correct).length;
  const mistakes = session.answers.filter(a => !a.correct);
  const playing = phase === 'playing' || phase === 'review';

  // Papillary muscles and valve leaflets sit inside the chambers, so the heart quiz opens those questions with the chambers already moved aside.
  const openingHidden = (t?: QuizStructure) => regionId === 'heart' && t && (t.sections.includes('papillary') || t.sections.includes('valves') || t.sections.includes('interior')) ? (catalogue?.structures ?? []).filter(x => x.sections.includes('chambers')).map(x => x.id) : [];
  // The MJ-built interior and the pericardium would crowd every other question: they are drawn only when the question is about them.
  const autoHidden = useMemo(() => regionId === 'heart' && target ? (catalogue?.structures ?? []).filter(x => (x.sections.includes('interior') && !target.sections.includes('interior')) || (x.sections.includes('pericardium') && !target.sections.includes('pericardium'))).map(x => x.id) : [], [regionId, target, catalogue]);
  const clearQuestion = (t?: QuizStructure) => {setHidden(openingHidden(t)); setPeeling(false); setMessage(''); setError(''); setTyped(''); setHighlightId(null); setOnly(false);};
  const begin = (next: QuizSession) => {
    if (!next.queue.length) return;
    setSession(next); setSessionLevel(level); setIndex(0); setRound(n => n + 1); clearQuestion(structures.get(next.queue[0])); setPhase('playing');
  };
  const remember = (id: string, ok: boolean) => setSaved(addMistakes(scope, ok ? [] : [id], ok ? [id] : []));
  /** Level 2: judge the typed name; a close answer is shown with its correct spelling and goes to the mistakes. */
  const submit = () => {
    if (!target || answer || !ready || phase !== 'playing' || !typed.trim()) return;
    const verdict = judgeName(typed, target, {language, needSide});
    setSession(sn => recordTyped(sn, index, typed.trim(), verdict.result)); remember(target.id, verdict.result === 'correct');
  };
  const giveUp = () => {if (!target || answer || !ready) return; setSession(sn => recordTyped(sn, index, null, 'skipped')); remember(target.id, false);};
  const choose = (id: string) => {
    if (!target || answer || !ready || phase !== 'playing') return;
    const structure = structures.get(id);
    if (!structure || structure.system !== target.system) return;
    setMessage('');
    if (peeling) {setHidden(ids => ids.includes(id) ? ids : [...ids, id]); return;}
    setSession(s => recordAnswer(s, index, id)); setHidden([]); setPeeling(false); remember(target.id, id === target.id);
  };
  const reveal = () => {if (!ready || answer || !target) return; setSession(s => recordAnswer(s, index, null)); setHidden([]); setPeeling(false); setMessage(''); remember(target.id, false);};
  const nextQuestion = () => {
    if (!answer) return;
    if (index + 1 >= session.queue.length) setPhase('summary');
    else {setIndex(index + 1); clearQuestion(structures.get(session.queue[index + 1]));}
  };
  const changeView = (view: QuizView) => setCommand(c => ({id: c.id + 1, view}));
  const savedHere = useMemo(() => saved.filter(id => structures.has(id)), [saved, structures]);
  const result = answer ? (answer.result ?? (answer.correct ? 'correct' : 'wrong')) : undefined;
  const near = useMemo(() => catalogue && target ? neighbours(catalogue, target, 3) : [], [catalogue, target]);
  const wrongCount = session.answers.filter(a => (a.result ?? (a.correct ? 'correct' : 'wrong')) === 'wrong' || a.result === 'skipped').length, closeCount = session.answers.filter(a => a.result === 'close').length;
  const reviewItem = (i: number) => {setIndex(i); clearQuestion(structures.get(session.queue[i])); setPhase('review');};

  return <main className={`quiz-app quiz-phase-${phase}`} lang="zh-Hant">
    <header className="quiz-header">
      <a className="quiz-back" href="#/quiz" aria-label="返回部位選擇"><ArrowLeft size={18}/><span>部位選擇</span></a>
      <div className="quiz-brand">MJ Anatomy <span>QUIZ</span></div>
      {phase === 'playing' ? <button data-slot="quiz-button" className="quiz-quiet" onClick={() => setPhase('summary')}>結束測驗 <X size={16}/></button> : phase === 'review' ? <button data-slot="quiz-button" className="quiz-quiet" onClick={() => setPhase('summary')}>返回成績 <ArrowLeft size={16}/></button> : <span className="quiz-header-tag">{region.tag}</span>}
    </header>

    {phase === 'setup' && <div className="quiz-setup-content">
      <section className="quiz-intro">
        <div className="quiz-kicker"><Target size={15}/> FIND THE STRUCTURE</div>
        <h1 ref={title} tabIndex={-1}>{region.headline[0]}<br/>{region.headline[1]}</h1>
        <p>{region.description[0]}<br/>{region.description[1]}</p>
        <div className="quiz-how">
          <span><b>01</b>選擇部位與系統</span>
          <span><b>02</b>旋轉模型，點出答案</span>
          <span><b>03</b>對照顏色，再練錯題</span>
        </div>
        <div className="quiz-color-key"><span><i className="correct-dot"/>正確位置</span><span><i className="wrong-dot"/>你點錯的構造</span></div>
        <p className="quiz-scope">{region.scope}</p>
        <a className="quiz-source" href={`${import.meta.env.BASE_URL}ATTRIBUTION.md`} target="_blank" rel="noreferrer">圖譜來源與使用範圍 ↗</a>
      </section>

      <section className="quiz-setup-card" aria-label={`設定${region.label}測驗`}>
        <div className="quiz-card-heading"><span className="quiz-kicker">YOUR PRACTICE</span><span>{catalogue ? `${catalogue.structures.length} 個構造` : '載入目錄中…'}</span></div>
        <fieldset className="quiz-level"><legend>等級 <small>Level</small></legend>
          <div className="quiz-level-grid">
            <button data-slot="quiz-button" aria-pressed={level === 1} onClick={() => {setLevel(1); setSettings(v => ({...v, count: v.count === 5 ? 10 : v.count}));}}><span><b>第一級</b>給名稱找結構<small>Level 1 · name → structure</small></span>{level === 1 && <Check size={17}/>}</button>
            <button data-slot="quiz-button" aria-pressed={level === 2} onClick={() => {setLevel(2); setSettings(v => ({...v, count: LEVEL2_COUNTS.includes(v.count) ? v.count : 10}));}}><span><b>第二級</b>看結構寫名稱<small>Level 2 · structure → name</small></span>{level === 2 && <Check size={17}/>}</button>
          </div>
        </fieldset>
        <fieldset><legend><b>01</b> {regionId === 'thorax' ? '練習哪一類構造？' : '練習哪個部位？'}</legend>
          <div className="quiz-region-grid">{region.sections.map(r => <button data-slot="quiz-button" key={r.id} aria-pressed={settings.section === r.id} onClick={() => setSettings(s => ({...s, section: r.id}))}><span>{r.label}<small>{r.english}</small></span>{settings.section === r.id ? <Check size={17}/> : <ChevronRight size={15}/>}</button>)}</div>
        </fieldset>
        <fieldset><legend><b>02</b> 選擇系統 <small>可選多個</small></legend>
          <div className="quiz-system-grid">{systemChips.map(s => {
            const count = catalogue ? questionPool(catalogue, {...settings, systems: [s.id]}).length : 0;
            return <button data-slot="quiz-button" key={s.id} disabled={!!catalogue && !count} aria-pressed={settings.systems.includes(s.id)} onClick={() => setSettings(prev => ({...prev, systems: prev.systems.includes(s.id) ? prev.systems.filter(id => id !== s.id) : [...prev.systems, s.id]}))}><i style={{background: s.color}}/><span>{s.label}<small>{s.english}</small></span><span className="quiz-count">{count}</span><span className="quiz-checkbox">{settings.systems.includes(s.id) && <Check size={12}/>}</span></button>;
          })}</div>
        </fieldset>
        <div className="quiz-options-row">
          <fieldset><legend><b>03</b> 左右側</legend><div className="quiz-segmented">{([['right', '右側'], ['left', '左側'], ['both', '雙側']] as const).map(([id, label]) => <button data-slot="quiz-button" key={id} aria-pressed={settings.side === id} onClick={() => setSettings(s => ({...s, side: id}))}>{label}</button>)}</div></fieldset>
          <fieldset><legend>每回題數</legend><div className="quiz-segmented">{(level === 2 ? LEVEL2_COUNTS : [10, 20, 9999]).map(n => <button data-slot="quiz-button" key={n} aria-pressed={settings.count === n} onClick={() => setSettings(s => ({...s, count: n}))}>{n === 9999 ? '全部' : n}</button>)}</div></fieldset>
        </div>
        {level === 2 && <div className="quiz-options-row quiz-naming-options">
          <fieldset><legend>作答語言 <small>Language</small></legend><div className="quiz-segmented">{([['en', '英文'], ['zh', '中文'], ['any', '任一']] as const).map(([id, label]) => <button data-slot="quiz-button" key={id} aria-pressed={language === id} onClick={() => setLanguage(id)}>{label}</button>)}</div></fieldset>
          <fieldset><legend>左右側 <small>Side</small></legend><label className="quiz-context-toggle"><input type="checkbox" checked={needSide} onChange={e => setNeedSide(e.target.checked)}/>需要答出左右</label></fieldset>
        </div>}
        {level === 2 && catalogue && <p className="quiz-pool-note">第二級只出有模型、資料卡完整、名稱不與其他構造重複的構造：本範圍 {allInScope} 個構造中有 {pool.length} 個可出題。</p>}
        {catalogue && savedHere.length > 0 && <div className="quiz-saved-row"><AlertCircle size={15}/><span>錯題本（{level === 1 ? '第一級' : '第二級'}）：{savedHere.length} 題</span><button data-slot="quiz-button" className="quiz-secondary" onClick={() => begin(sessionOf(savedHere))}><RotateCcw size={14}/>只練錯題</button><button data-slot="quiz-button" className="quiz-text-button" onClick={() => {clearMistakes(scope); setSaved([]);}}><Trash2 size={14}/>清除</button></div>}
        {catalogueError && <div className="quiz-error" role="alert">{catalogueError}<button data-slot="quiz-button" onClick={() => setCatalogueRetry(n => n + 1)}>重新載入目錄</button></div>}
        <div className="quiz-start-row"><p>{!catalogue ? '正在準備題庫…' : !pool.length ? '請選擇有題目的系統。' : `本回 ${Math.min(settings.count, pool.length)} 題 · ${pool.length} 個可練習構造`}</p><button data-slot="quiz-button" className="quiz-primary" disabled={!pool.length} onClick={() => begin(createSession(pool, settings.count))}>開始測驗 <ArrowRight size={18}/></button></div>
      </section>
    </div>}

    {playing && catalogue && target && <div className={`quiz-play-layout ${naming ? 'is-naming' : ''}`}>
      <section className="quiz-stage" aria-label="點選模型作答">
        <QuizScene key={sceneRetry} catalogue={catalogue} view={{key: questionKey, target, section: settings.section, side: settings.side, answered: !!answer, pickedId: answer?.pickedId ?? null, hidden: autoHidden.length ? [...hidden, ...autoHidden] : hidden, context, peeling, command, mode: naming ? 'name' : 'find', clarity, only, highlightId}}
          onReady={(key, value) => setReadiness({key, ready: value})} onProgress={(loaded, total) => setLoad({loaded, total})} onError={setError} onPick={choose} onMessage={setMessage}/>
        <div className="quiz-stage-caption"><span>{section.id === 'all' ? region.sections.find(s => s.id === target.sections[0])?.label : section.label}</span><span>{system?.label} · {settings.side === 'both' ? '雙側' : settings.side === 'right' ? '右側' : '左側'}</span></div>
        <div className="quiz-view-buttons" aria-label="模型視角"><button data-slot="quiz-button" onClick={() => changeView('front')}>前面</button><button data-slot="quiz-button" onClick={() => changeView('back')}>後面</button><button data-slot="quiz-button" onClick={() => changeView('side')}>側面</button><button data-slot="quiz-button" onClick={() => changeView('fit')} aria-label="模型置中"><RotateCcw size={16}/></button>{naming && <><button data-slot="quiz-button" onClick={() => changeView('random')} aria-label="隨機角度"><Shuffle size={15}/>隨機</button><button data-slot="quiz-button" onClick={() => changeView('answer')} aria-label="放大至目標"><Maximize2 size={15}/>放大</button></>}</div>
        {!ready && !error && <div className="quiz-loading" role="status"><span className="quiz-spinner"/><strong>載入本題模型</strong><small>{load.loaded} / {load.total || '…'} 個模型套件</small></div>}
        {error && <div className="quiz-model-error" role="alert"><strong>暫時未能作答</strong><p>{error}</p><button data-slot="quiz-button" className="quiz-primary" onClick={() => {setError(''); setReadiness({key: '', ready: false}); setSceneRetry(n => n + 1);}}>重新載入模型</button></div>}
        <div className="quiz-stage-hint">{naming ? (answer ? '可旋轉模型，對照黃色標示的構造' : '黃色標示的是哪個構造？拖曳旋轉 · 滾輪／雙指縮放') : answer ? '可旋轉模型，對照正確位置' : peeling ? '移開遮擋中：點選構造會暫時隱藏，不計分' : '拖曳旋轉 · 滾輪／雙指縮放 · 點選作答'}</div>
      </section>

      <aside className="quiz-question-card" aria-label="測驗題目">
        <div className="quiz-progress-label"><span>{region.label}辨認</span><b>{index + 1} <span>/ {session.queue.length}</span></b></div>
        <progress className="quiz-progress" value={session.answers.length} max={session.queue.length} aria-label="已作答題數"/>
        <div className="quiz-question-heading"><span className="quiz-kicker">{naming ? (answer ? 'ANSWER · 答案' : 'NAME IT · 請寫出名稱') : answer ? 'ANSWER · 答案' : 'FIND IT · 請找出'}</span><span className="quiz-system-label" style={{borderColor: system?.color}}>{system?.label}</span></div>
        {naming ? <>
          {!answer ? <form className="quiz-name-form" onSubmit={e => {e.preventDefault(); submit();}}>
            <h1 className="quiz-target quiz-target-hidden" ref={title} tabIndex={-1}>黃色標示的是什麼構造？</h1>
            <label htmlFor="quiz-typed">請輸入名稱<small>{language === 'en' ? '用英文作答' : language === 'zh' ? '用中文作答' : '英文或中文皆可'}{needSide ? '，並寫出左右側' : ''}</small></label>
            <input id="quiz-typed" ref={input} className="quiz-name-input" value={typed} onChange={e => setTyped(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} lang={language === 'zh' ? 'zh-Hant' : 'en'} placeholder={language === 'zh' ? '例如：僧帽瓣' : 'e.g. Mitral valve'} disabled={!ready}/>
            <div className="quiz-name-actions"><button type="submit" data-slot="quiz-button" className="quiz-primary" disabled={!ready || !typed.trim()}><Pencil size={16}/>送出<small>Enter</small></button><button type="button" data-slot="quiz-button" className="quiz-secondary" disabled={!ready} onClick={giveUp}><Eye size={17}/>我不知道</button></div>
            <div className="quiz-answer-tools quiz-naming-tools">
              <div className="quiz-tool-row"><button type="button" data-slot="quiz-button" className="quiz-tool-button" disabled={!ready} onClick={() => changeView('random')}><Shuffle size={16}/><span>隨機角度<small>換一個看得到目標的視角</small></span></button><button type="button" data-slot="quiz-button" className="quiz-tool-button" disabled={!ready} onClick={() => changeView('answer')}><Maximize2 size={16}/><span>放大至目標</span></button></div>
              <label className="quiz-slider">周圍構造清晰度<input type="range" min={0} max={1} step={.05} value={clarity} onChange={e => setClarity(+e.target.value)} aria-label="周圍構造清晰度"/></label>
              <label className="quiz-context-toggle"><input type="checkbox" checked={only} onChange={e => setOnly(e.target.checked)}/>只看目標</label>
              {target.system !== 'skeletal' && <label className="quiz-context-toggle"><input type="checkbox" checked={context} onChange={e => setContext(e.target.checked)}/>顯示骨骼參照</label>}
            </div>
            <p className="quiz-message" role="status" aria-live="polite">{message}</p>
          </form> : <div className={`quiz-feedback is-${result === 'correct' ? 'correct' : result === 'close' ? 'close' : 'wrong'}`} role="status" aria-live="polite" aria-atomic="true">
            <div className="quiz-feedback-title">{result === 'correct' ? <CheckCircle2 size={21}/> : result === 'close' ? <AlertCircle size={21}/> : result === 'skipped' ? <Eye size={21}/> : <XCircle size={21}/>}<strong>{result === 'correct' ? '正確！' : result === 'close' ? '接近正確，請留意拼法。' : result === 'skipped' ? '已顯示答案，列入錯題。' : '答錯了。'}</strong></div>
            {result !== 'correct' && <div className="quiz-compare"><div><span>你的答案</span><b>{answer.typed || '（未作答）'}</b></div><div><span>正確答案</span><b><Name structure={target}/></b></div></div>}
            {result === 'close' && <p className="quiz-close-note">正確拼法：<b lang={/[\u3400-\u9fff]/.test(answer.typed ?? '') ? 'zh-Hant' : 'en'}>{preferredName(target, answer.typed ?? '', language)}</b>。此題列入錯題。</p>}
            {result === 'correct' && <div className="quiz-answer-name"><span><i className="correct-dot"/>名稱</span><b><Name structure={target}/></b></div>}
            {(() => {const names = acceptedNames(target), primary = new Set([target.name.toLowerCase(), target.chinese ?? '']), extra = [...names.en, ...names.zh].filter(n => !primary.has(n.toLowerCase()) && n !== target.name); return extra.length > 0 ? <p className="quiz-synonyms">也接受：{[...new Set(extra)].join('、')}</p> : null;})()}
            <button data-slot="quiz-button" className="quiz-text-button" onClick={() => changeView('answer')}><Maximize2 size={15}/>放大至目標</button>
          </div>}
        </> : <>
        <h1 className="quiz-target" ref={title} tabIndex={-1}><Name structure={target}/></h1>

        {answer ? <div className={`quiz-feedback ${answer.correct ? 'is-correct' : 'is-wrong'}`} role="status" aria-live="polite" aria-atomic="true">
          <div className="quiz-feedback-title">{answer.correct ? <CheckCircle2 size={21}/> : answer.pickedId ? <XCircle size={21}/> : <Eye size={21}/>}<strong>{answer.correct ? '答對了！就是這個。' : answer.pickedId ? '答錯了，請對照正確位置。' : '本題已查看答案，之後可再練習。'}</strong></div>
          {picked && !answer.correct && <div className="quiz-answer-name"><span><i className="wrong-dot"/>你點選的是</span><b><Name structure={picked}/></b></div>}
          <div className="quiz-answer-name"><span><i className="correct-dot"/>{answer.correct ? '綠色顯示' : '正確位置用綠色顯示'}</span><b><Name structure={target}/></b></div>
          <button data-slot="quiz-button" className="quiz-text-button" onClick={() => changeView('answer')}><Target size={15}/>放大正確位置</button>
        </div> : <div className="quiz-answer-tools">
          <p>請在模型上直接點選你認為正確的{system?.label}。{target.system !== 'skeletal' && `淡色${contextName}僅供定位。`}</p>
          <button data-slot="quiz-button" className="quiz-tool-button" aria-pressed={peeling} disabled={!ready} onClick={() => {setPeeling(v => !v); setMessage('');}}><Layers size={17}/><span>{peeling ? '完成移開，返回作答' : '移開遮擋'}<small>{peeling ? '按下此鍵後，再點選模型作答' : '深層構造可先移開表面組織'}</small></span></button>
          {hidden.length > 0 && <button data-slot="quiz-button" className="quiz-text-button" onClick={() => {setHidden([]); setMessage('');}}><RotateCcw size={14}/>還原已移開的 {hidden.length} 個構造</button>}
          {target.system !== 'skeletal' && <label className="quiz-context-toggle"><input type="checkbox" checked={context} onChange={e => setContext(e.target.checked)}/>顯示淡色{contextName}定位</label>}
          <p className="quiz-message" role="status" aria-live="polite">{message}</p>
        </div>}

        </>}
        {answer && <AnswerCard structure={target}/>}
        {naming && answer && near.length > 0 && <section className="quiz-neighbours" aria-label="鄰近相關構造"><h3>鄰近相關構造 <small>點擊在模型上高亮</small></h3><div>{near.map(n => <button key={n.id} data-slot="quiz-button" aria-pressed={highlightId === n.id} onClick={() => setHighlightId(h => h === n.id ? null : n.id)}><Name structure={n}/></button>)}</div></section>}
        <div className="quiz-question-actions">
          {phase === 'review' ? <button data-slot="quiz-button" className="quiz-primary" onClick={() => setPhase('summary')}><ArrowLeft size={18}/>返回成績</button> : answer ? <button data-slot="quiz-button" className="quiz-primary" onClick={nextQuestion}>{index + 1 === session.queue.length ? '查看成績' : '下一題'}<ArrowRight size={18}/></button> : naming ? null : <button data-slot="quiz-button" className="quiz-secondary" disabled={!ready} onClick={reveal}><Eye size={17}/>不會，顯示答案</button>}
          <span className="quiz-live-score">答對 {correct} / {session.answers.length} 題{!answer && ' · 查看答案會列入錯題'}</span>
        </div>
      </aside>
    </div>}

    {phase === 'summary' && <section className="quiz-summary">
      <span className="quiz-kicker">PRACTICE COMPLETE</span>
      <h1 ref={title} tabIndex={-1}>{session.answers.length === session.queue.length ? '本回練習完成。' : '本回練習到此為止。'}</h1>
      <div className="quiz-result-score"><strong>{correct}</strong><span>/ {session.answers.length}<small>已作答題目中答對的數目</small></span></div>
      <p className="quiz-result-description">{section.label} · 完成 {session.answers.length} / {session.queue.length} 題{mistakes.length > 0 ? `，${mistakes.length} 題可以再練。` : session.answers.length ? '，全部答對。' : '。隨時可以重新開始。'}</p>
      <div className="quiz-summary-actions">{mistakes.length > 0 && <button data-slot="quiz-button" className="quiz-primary" onClick={() => begin(retryMistakes(session))}><RotateCcw size={17}/>只練錯題（{mistakes.length}）</button>}<button data-slot="quiz-button" className="quiz-secondary" onClick={() => begin(createSession(pool, settings.count))}>再練一回</button><button data-slot="quiz-button" className="quiz-text-button" onClick={() => setPhase('setup')}>重新選擇部位／系統</button></div>
      {sessionLevel === 2 && session.answers.length > 0 && <p className="quiz-result-split"><span className="is-correct">答對 {session.answers.filter(a => a.result === 'correct').length}</span><span className="is-close">接近 {session.answers.filter(a => a.result === 'close').length}</span><span className="is-wrong">答錯／不知道 {session.answers.filter(a => a.result === 'wrong' || a.result === 'skipped').length}</span></p>}
      {session.answers.length > 0 && <div className="quiz-review-list"><h2>逐題回顧<small>點選任一題回到該題的構造</small></h2>{session.answers.map((a, i) => {
        const item = structures.get(a.targetId)!;
        const state = a.result ?? (a.correct ? 'correct' : 'wrong');
        const label = {correct: '答對', close: '接近', wrong: '答錯', skipped: '不知道'}[state];
        const detail = sessionLevel === 2 ? (a.typed ? `你的答案：${a.typed}` : '本題已查看答案') : a.correct ? '答對' : a.pickedId ? `你選擇的是：${[structures.get(a.pickedId)?.chinese, structures.get(a.pickedId)?.name].filter(Boolean).join(' · ')}` : '本題已查看答案';
        return <button data-slot="quiz-button" className={`quiz-review-item is-${state}`} key={`${i}-${a.targetId}`} onClick={() => reviewItem(i)}><span className="quiz-review-dot"/><div><b>{i + 1}. <Name structure={item}/> <em>{label}</em></b><p>{detail}</p></div></button>;
      })}</div>}
    </section>}
  </main>;
}
