import {Suspense, lazy, useMemo, useState} from 'react';
import {ArrowLeft, RotateCcw} from 'lucide-react';
import {QUIZ_REGIONS, learnHashOf} from './catalogue';
import {loadPlan} from './setup';
import {ModeNav} from './mode-nav';
import type {BlockResult} from './page';
import './quiz.css';
const RegionQuiz = lazy(() => import('./page'));

/** Plays the plan made by the Quiz setup screen: one block per chosen region (the model is one region at a time), then the combined result with 「返去學」 for every region with mistakes. */
export default function QuizRun() {
  const plan = useMemo(() => loadPlan(), []);
  const [index, setIndex] = useState(0), [results, setResults] = useState<BlockResult[]>([]), [done, setDone] = useState(false);
  if (!plan) return <main className="quiz-app quiz-hub" lang="zh-Hant"><header className="quiz-header"><a className="quiz-back" href="#/quiz"><ArrowLeft size={18}/><span>Quiz 設定</span></a><ModeNav current="quiz"/><span/></header>
    <div className="quiz-hub-content"><section className="quiz-intro quiz-hub-intro"><h1>找不到這次的設定</h1><p>請回到設定畫面重新開始。</p><a className="quiz-primary quiz-link-button" href="#/quiz">回到 Quiz 設定</a></section></div></main>;
  const onBlockDone = (result: BlockResult, finishAll: boolean) => {
    const all = [...results, result];
    setResults(all);
    if (finishAll || index + 1 >= plan.blocks.length) setDone(true); else setIndex(index + 1);
  };
  if (done) {
    const answered = results.reduce((n, r) => n + r.answered, 0), correct = results.reduce((n, r) => n + r.correct, 0), planned = plan.blocks.reduce((n, b) => n + b.count, 0);
    return <main className="quiz-app quiz-run-result" lang="zh-Hant">
      <header className="quiz-header"><a className="quiz-back" href="#/quiz"><ArrowLeft size={18}/><span>Quiz 設定</span></a><ModeNav current="quiz"/><span className="quiz-header-tag">成績</span></header>
      <section className="quiz-summary" aria-label="總成績">
        <span className="quiz-kicker">RESULT</span><h1 tabIndex={-1}>{answered >= planned ? '本回測驗完成。' : '本回測驗到此為止。'}</h1>
        <div className="quiz-result-score"><strong>{correct}</strong><span>/ {answered}<small>已作答題目中答對的數目（原定 {planned} 題）</small></span></div>
        <div className="run-regions">{results.filter(r => r.answered > 0 || r.total > 0).map(r => <div key={r.region} className="run-region" data-region={r.region}>
          <div className="run-region-head"><b>{QUIZ_REGIONS[r.region].label}</b><span>答對 {r.correct} / {r.answered}</span></div>
          {r.wrongIds.length > 0 && <>
            <p className="run-wrong">答錯：{r.wrongIds.map(id => r.names[id]?.chinese ?? r.names[id]?.name ?? '').filter(Boolean).join('、')}</p>
            <a className="quiz-secondary quiz-link-button" href={learnHashOf(r.region)}>返去學：{QUIZ_REGIONS[r.region].label}學習地圖</a>
          </>}
        </div>)}</div>
        <div className="quiz-summary-actions"><a className="quiz-primary quiz-link-button" href="#/quiz"><RotateCcw size={16}/>重新設定</a><a className="quiz-text-button" href="#/learn">到學習</a></div>
      </section>
    </main>;
  }
  const block = plan.blocks[index], next = plan.blocks[index + 1];
  return <Suspense fallback={<div role="status" style={{padding: 32}}>正在載入題目…</div>}>
    <RegionQuiz key={`${index}:${block.region}`} region={block.region} block={{plan, count: block.count, index, blocks: plan.blocks.length, nextLabel: next ? QUIZ_REGIONS[next.region].label : undefined, onBlockDone}}/>
  </Suspense>;
}
