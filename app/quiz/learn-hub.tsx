import {useEffect, useMemo} from 'react';
import {ArrowLeft, ChevronRight, GraduationCap} from 'lucide-react';
import {learnHashOf, orderedRegions} from './catalogue';
import {loadProgress} from './learn-progress';
import {ModeNav} from './mode-nav';
import {RegionGroups} from './setup-parts';
import './quiz.css';

/** 學習 entrance: the regions come from the question data (QUIZ_REGIONS), so a new region shows up here without any change to this page. */
export default function LearnHub() {
  useEffect(() => {document.title = '學習 · MJ Anatomy';}, []);
  const regions = orderedRegions();
  const cleared = useMemo(() => Object.fromEntries(regions.map(r => [r.id, Object.values(loadProgress(r.id)).filter(p => p.passed).length])), []); // eslint-disable-line react-hooks/exhaustive-deps
  const card = (r: typeof regions[number]) => <a key={r.id} className="quiz-hub-card" href={learnHashOf(r.id)} data-part={r.id}>
    <span className="quiz-hub-text"><b>{r.label}</b><small>{r.english}</small><em>{cleared[r.id] ? `已過關 ${cleared[r.id]} 關` : '尚未開始'}</em></span><ChevronRight size={18}/>
  </a>;
  return <main className="quiz-app quiz-hub learn-hub-page" lang="zh-Hant">
    <header className="quiz-header">
      <a className="quiz-back" href="#/" aria-label="返回圖譜"><ArrowLeft size={18}/><span>返回圖譜</span></a>
      <ModeNav current="learn"/>
      <span className="quiz-header-tag">選擇區域</span>
    </header>
    <div className="quiz-hub-content">
      <section className="quiz-intro quiz-hub-intro">
        <div className="quiz-kicker"><GraduationCap size={15}/> LEARN</div>
        <h1 tabIndex={-1}>從哪個區域開始學？</h1>
        <p>每個區域分成多個小關卡，每關 4 至 12 個構造。每關三步：先「認識」，再「練習」，最後「過關測驗」，答對 80% 以上才解鎖下一關。在 Quiz 常答錯的構造會在地圖上標示，提醒你重溫。</p>
      </section>
      <div className="quiz-hub-regions"><RegionGroups tile={card}/></div>
    </div>
  </main>;
}
