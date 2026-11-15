import {useEffect, useMemo, useRef} from 'react';
import {AlertCircle, CheckCircle2, Eye, Maximize2, XCircle} from 'lucide-react';
import {PronounceButton} from '../pronunciation/PronounceButton';
import {createQuizViewer, type QuizViewState} from './viewer';
import {structureCard} from './card';
import {acceptedNames, preferredName, type AnswerLanguage} from './naming';
import type {QuizCatalogue, QuizStructure} from './catalogue';

export function QuizScene({catalogue, view, onReady, onProgress, onError, onPick, onMessage}: {
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
export function Name({structure}: {structure: QuizStructure}) {
  return <><span className="bn-en" lang="en">{structure.name}</span>{structure.chinese && <small className="bn-zh" lang="zh-Hant">{structure.chinese}</small>}</>;
}

/** Shown under the correct answer, right or wrong: English name (large), Chinese name (small), then the fields for that kind of structure. */
export function AnswerCard({structure}: {structure: QuizStructure}) {
  const card = useMemo(() => structureCard(structure), [structure]);
  const blank = card.fields.length === 0;
  return <section className="quiz-info-card" aria-label="構造資料卡" data-system={card.system}>
    <h2 lang="en">{card.english}</h2>
    <PronounceButton name={card.english}/>
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
  space: ['位置', '邊界', '內容物'],
};
const order = (system: string) => FIELD_ORDER[system] ?? [];


/** Feedback of a typed answer (level 3 and the lessons): verdict, your answer against the correct name, close-answer notes and the other accepted names. */
export function NameFeedback({result, typed, relation, target, language, onZoom}: {
  result: 'correct' | 'close' | 'wrong' | 'skipped'; typed?: string; relation?: 'typed-part' | 'typed-whole'; target: QuizStructure; language: AnswerLanguage; onZoom: () => void;
}) {
  const names = acceptedNames(target), primary = new Set([target.name.toLowerCase(), target.chinese ?? '']);
  const extra = [...names.en, ...names.zh].filter(n => !primary.has(n.toLowerCase()) && n !== target.name);
  return <div className={`quiz-feedback is-${result === 'correct' ? 'correct' : result === 'close' ? 'close' : 'wrong'}`} role="status" aria-live="polite" aria-atomic="true">
    <div className="quiz-feedback-title">{result === 'correct' ? <CheckCircle2 size={21}/> : result === 'close' ? <AlertCircle size={21}/> : result === 'skipped' ? <Eye size={21}/> : <XCircle size={21}/>}<strong>{result === 'correct' ? '正確！' : result === 'close' ? '接近正確，請留意拼法。' : result === 'skipped' ? '已顯示答案，列入錯題。' : '答錯了。'}</strong></div>
    {result !== 'correct' && <div className="quiz-compare"><div><span>你的答案</span><b>{typed || '（未作答）'}</b></div><div><span>正確答案</span><b><Name structure={target}/></b></div></div>}
    {result === 'close' && relation && <p className="quiz-close-note">{relation === 'typed-part' ? '你寫的是題目的其中一部分，題目要的是整體。' : '你寫的是整體，題目要的是其中一部分。'}此題列入錯題。</p>}
    {result === 'close' && !relation && <p className="quiz-close-note">正確拼法：<b lang={/[\u3400-\u9fff]/.test(typed ?? '') ? 'zh-Hant' : 'en'}>{preferredName(target, typed ?? '', language)}</b>。此題列入錯題。</p>}
    {result === 'correct' && <div className="quiz-answer-name"><span><i className="correct-dot"/>名稱</span><b><Name structure={target}/></b></div>}
    {extra.length > 0 && <p className="quiz-synonyms">也接受：{[...new Set(extra)].join('、')}</p>}
    <button data-slot="quiz-button" className="quiz-text-button" onClick={onZoom}><Maximize2 size={15}/>放大至目標</button>
  </div>;
}
