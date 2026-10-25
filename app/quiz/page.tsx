import {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, Eye, Layers, RotateCcw, Target, X, XCircle} from 'lucide-react';
import {fetchModelBuffer} from '../model-download';
import {QUIZ_REGIONS, QUIZ_SYSTEMS, questionPool, type QuizCatalogue, type QuizRegionId, type QuizSettings, type QuizStructure} from './catalogue';
import {createSession, recordAnswer, retryMistakes, type QuizSession} from './engine';
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

/** Chinese name (Taiwan medical terminology) first, English name beneath it. */
function Name({structure}: {structure: QuizStructure}) {
  return structure.chinese
    ? <><span lang="zh-Hant">{structure.chinese}</span><small lang="en">{structure.name}</small></>
    : <span lang="en">{structure.name}</span>;
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
};
const order = (system: string) => FIELD_ORDER[system] ?? [];

const defaults: QuizSettings = {section: 'all', systems: ['skeletal', 'muscular', 'nervous', 'arterial', 'venous'], side: 'right', count: 10};

export default function RegionQuiz({region: regionId = 'lower-limb'}: {region?: QuizRegionId} = {}) {
  const region = QUIZ_REGIONS[regionId];
  const [catalogue, setCatalogue] = useState<QuizCatalogue | null>(null), [catalogueError, setCatalogueError] = useState(''), [catalogueRetry, setCatalogueRetry] = useState(0);
  const [settings, setSettings] = useState<QuizSettings>({...defaults, side: region.defaultSide ?? defaults.side}), [phase, setPhase] = useState<'setup' | 'playing' | 'summary'>('setup');
  const [session, setSession] = useState<QuizSession>({queue: [], answers: []}), [index, setIndex] = useState(0), [round, setRound] = useState(0);
  const [hidden, setHidden] = useState<string[]>([]), [peeling, setPeeling] = useState(false), [context, setContext] = useState(true);
  const [command, setCommand] = useState<{id: number; view: QuizView}>({id: 0, view: 'front'});
  const [readiness, setReadiness] = useState({key: '', ready: false}), [load, setLoad] = useState({loaded: 0, total: 0});
  const [error, setError] = useState(''), [message, setMessage] = useState(''), [sceneRetry, setSceneRetry] = useState(0);
  const title = useRef<HTMLHeadingElement>(null);

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

  const pool = useMemo(() => catalogue ? questionPool(catalogue, settings) : [], [catalogue, settings]);
  const structures = useMemo(() => new Map(catalogue?.structures.map(s => [s.id, s])), [catalogue]);
  const target = structures.get(session.queue[index]);
  const answer = session.answers[index];
  const picked = answer?.pickedId ? structures.get(answer.pickedId) : undefined;
  const section = region.sections.find(s => s.id === settings.section)!;
  const system = QUIZ_SYSTEMS.find(s => s.id === target?.system);
  const questionKey = `${round}:${index}:${target?.id ?? ''}`;
  const ready = readiness.key === questionKey && readiness.ready && !error;
  const correct = session.answers.filter(a => a.correct).length;
  const mistakes = session.answers.filter(a => !a.correct);

  const clearQuestion = () => {setHidden([]); setPeeling(false); setMessage(''); setError('');};
  const begin = (next: QuizSession) => {
    if (!next.queue.length) return;
    setSession(next); setIndex(0); setRound(n => n + 1); clearQuestion(); setPhase('playing');
  };
  const choose = (id: string) => {
    if (!target || answer || !ready || phase !== 'playing') return;
    const structure = structures.get(id);
    if (!structure || structure.system !== target.system) return;
    setMessage('');
    if (peeling) {setHidden(ids => ids.includes(id) ? ids : [...ids, id]); return;}
    setSession(s => recordAnswer(s, index, id)); setHidden([]); setPeeling(false);
  };
  const reveal = () => {if (!ready || answer) return; setSession(s => recordAnswer(s, index, null)); setHidden([]); setPeeling(false); setMessage('');};
  const nextQuestion = () => {
    if (!answer) return;
    if (index + 1 >= session.queue.length) setPhase('summary');
    else {setIndex(index + 1); clearQuestion();}
  };
  const changeView = (view: QuizView) => setCommand(c => ({id: c.id + 1, view}));

  return <main className={`quiz-app quiz-phase-${phase}`} lang="zh-Hant">
    <header className="quiz-header">
      <a className="quiz-back" href="#/quiz" aria-label="返回部位選擇"><ArrowLeft size={18}/><span>部位選擇</span></a>
      <div className="quiz-brand">MJ Anatomy <span>QUIZ</span></div>
      {phase === 'playing' ? <button data-slot="quiz-button" className="quiz-quiet" onClick={() => setPhase('summary')}>結束測驗 <X size={16}/></button> : <span className="quiz-header-tag">{region.tag}</span>}
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
        <fieldset><legend><b>01</b> {regionId === 'thorax' ? '練習哪一類構造？' : '練習哪個部位？'}</legend>
          <div className="quiz-region-grid">{region.sections.map(r => <button data-slot="quiz-button" key={r.id} aria-pressed={settings.section === r.id} onClick={() => setSettings(s => ({...s, section: r.id}))}><span>{r.label}<small>{r.english}</small></span>{settings.section === r.id ? <Check size={17}/> : <ChevronRight size={15}/>}</button>)}</div>
        </fieldset>
        <fieldset><legend><b>02</b> 選擇系統 <small>可選多個</small></legend>
          <div className="quiz-system-grid">{QUIZ_SYSTEMS.map(s => {
            const count = catalogue ? questionPool(catalogue, {...settings, systems: [s.id]}).length : 0;
            return <button data-slot="quiz-button" key={s.id} disabled={!!catalogue && !count} aria-pressed={settings.systems.includes(s.id)} onClick={() => setSettings(prev => ({...prev, systems: prev.systems.includes(s.id) ? prev.systems.filter(id => id !== s.id) : [...prev.systems, s.id]}))}><i style={{background: s.color}}/><span>{s.label}<small>{s.english}</small></span><span className="quiz-count">{count}</span><span className="quiz-checkbox">{settings.systems.includes(s.id) && <Check size={12}/>}</span></button>;
          })}</div>
        </fieldset>
        <div className="quiz-options-row">
          <fieldset><legend><b>03</b> 左右側</legend><div className="quiz-segmented">{([['right', '右側'], ['left', '左側'], ['both', '雙側']] as const).map(([id, label]) => <button data-slot="quiz-button" key={id} aria-pressed={settings.side === id} onClick={() => setSettings(s => ({...s, side: id}))}>{label}</button>)}</div></fieldset>
          <fieldset><legend>每回題數</legend><div className="quiz-segmented">{[10, 20, 9999].map(n => <button data-slot="quiz-button" key={n} aria-pressed={settings.count === n} onClick={() => setSettings(s => ({...s, count: n}))}>{n === 9999 ? '全部' : n}</button>)}</div></fieldset>
        </div>
        {catalogueError && <div className="quiz-error" role="alert">{catalogueError}<button data-slot="quiz-button" onClick={() => setCatalogueRetry(n => n + 1)}>重新載入目錄</button></div>}
        <div className="quiz-start-row"><p>{!catalogue ? '正在準備題庫…' : !pool.length ? '請選擇有題目的系統。' : `本回 ${Math.min(settings.count, pool.length)} 題 · ${pool.length} 個可練習構造`}</p><button data-slot="quiz-button" className="quiz-primary" disabled={!pool.length} onClick={() => begin(createSession(pool, settings.count))}>開始測驗 <ArrowRight size={18}/></button></div>
      </section>
    </div>}

    {phase === 'playing' && catalogue && target && <div className="quiz-play-layout">
      <section className="quiz-stage" aria-label="點選模型作答">
        <QuizScene key={sceneRetry} catalogue={catalogue} view={{key: questionKey, target, section: settings.section, side: settings.side, answered: !!answer, pickedId: answer?.pickedId ?? null, hidden, context, peeling, command}}
          onReady={(key, value) => setReadiness({key, ready: value})} onProgress={(loaded, total) => setLoad({loaded, total})} onError={setError} onPick={choose} onMessage={setMessage}/>
        <div className="quiz-stage-caption"><span>{section.id === 'all' ? region.sections.find(s => s.id === target.sections[0])?.label : section.label}</span><span>{system?.label} · {settings.side === 'both' ? '雙側' : settings.side === 'right' ? '右側' : '左側'}</span></div>
        <div className="quiz-view-buttons" aria-label="模型視角"><button data-slot="quiz-button" onClick={() => changeView('front')}>前面</button><button data-slot="quiz-button" onClick={() => changeView('back')}>後面</button><button data-slot="quiz-button" onClick={() => changeView('side')}>側面</button><button data-slot="quiz-button" onClick={() => changeView('fit')} aria-label="模型置中"><RotateCcw size={16}/></button></div>
        {!ready && !error && <div className="quiz-loading" role="status"><span className="quiz-spinner"/><strong>載入本題模型</strong><small>{load.loaded} / {load.total || '…'} 個模型套件</small></div>}
        {error && <div className="quiz-model-error" role="alert"><strong>暫時未能作答</strong><p>{error}</p><button data-slot="quiz-button" className="quiz-primary" onClick={() => {setError(''); setReadiness({key: '', ready: false}); setSceneRetry(n => n + 1);}}>重新載入模型</button></div>}
        <div className="quiz-stage-hint">{answer ? '可旋轉模型，對照正確位置' : peeling ? '移開遮擋中：點選構造會暫時隱藏，不計分' : '拖曳旋轉 · 滾輪／雙指縮放 · 點選作答'}</div>
      </section>

      <aside className="quiz-question-card" aria-label="測驗題目">
        <div className="quiz-progress-label"><span>{region.label}辨認</span><b>{index + 1} <span>/ {session.queue.length}</span></b></div>
        <progress className="quiz-progress" value={session.answers.length} max={session.queue.length} aria-label="已作答題數"/>
        <div className="quiz-question-heading"><span className="quiz-kicker">{answer ? 'ANSWER · 答案' : 'FIND IT · 請找出'}</span><span className="quiz-system-label" style={{borderColor: system?.color}}>{system?.label}</span></div>
        <h1 className="quiz-target" ref={title} tabIndex={-1}><Name structure={target}/></h1>

        {answer ? <div className={`quiz-feedback ${answer.correct ? 'is-correct' : 'is-wrong'}`} role="status" aria-live="polite" aria-atomic="true">
          <div className="quiz-feedback-title">{answer.correct ? <CheckCircle2 size={21}/> : answer.pickedId ? <XCircle size={21}/> : <Eye size={21}/>}<strong>{answer.correct ? '答對了！就是這個。' : answer.pickedId ? '答錯了，請對照正確位置。' : '本題已查看答案，之後可再練習。'}</strong></div>
          {picked && !answer.correct && <div className="quiz-answer-name"><span><i className="wrong-dot"/>你點選的是</span><b><Name structure={picked}/></b></div>}
          <div className="quiz-answer-name"><span><i className="correct-dot"/>{answer.correct ? '綠色顯示' : '正確位置用綠色顯示'}</span><b><Name structure={target}/></b></div>
          <button data-slot="quiz-button" className="quiz-text-button" onClick={() => changeView('answer')}><Target size={15}/>放大正確位置</button>
        </div> : <div className="quiz-answer-tools">
          <p>請在模型上直接點選你認為正確的{system?.label}。{target.system !== 'skeletal' && '淡色骨骼僅供定位。'}</p>
          <button data-slot="quiz-button" className="quiz-tool-button" aria-pressed={peeling} disabled={!ready} onClick={() => {setPeeling(v => !v); setMessage('');}}><Layers size={17}/><span>{peeling ? '完成移開，返回作答' : '移開遮擋'}<small>{peeling ? '按下此鍵後，再點選模型作答' : '深層構造可先移開表面組織'}</small></span></button>
          {hidden.length > 0 && <button data-slot="quiz-button" className="quiz-text-button" onClick={() => {setHidden([]); setMessage('');}}><RotateCcw size={14}/>還原已移開的 {hidden.length} 個構造</button>}
          {target.system !== 'skeletal' && <label className="quiz-context-toggle"><input type="checkbox" checked={context} onChange={e => setContext(e.target.checked)}/>顯示淡色骨骼定位</label>}
          <p className="quiz-message" role="status" aria-live="polite">{message}</p>
        </div>}

        {answer && <AnswerCard structure={target}/>}
        <div className="quiz-question-actions">
          {answer ? <button data-slot="quiz-button" className="quiz-primary" onClick={nextQuestion}>{index + 1 === session.queue.length ? '查看成績' : '下一題'}<ArrowRight size={18}/></button> : <button data-slot="quiz-button" className="quiz-secondary" disabled={!ready} onClick={reveal}><Eye size={17}/>不會，顯示答案</button>}
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
      {mistakes.length > 0 && <div className="quiz-review-list"><h2>本回需要重溫</h2>{mistakes.map(a => {
        const item = structures.get(a.targetId)!;
        return <div className="quiz-review-item" key={a.targetId}><span className="quiz-review-dot"/><div><b><Name structure={item}/></b><p>{a.pickedId ? `你選擇的是：${[structures.get(a.pickedId)?.chinese, structures.get(a.pickedId)?.name].filter(Boolean).join(' · ')}` : '本題已查看答案'}</p></div></div>;
      })}</div>}
    </section>}
  </main>;
}
