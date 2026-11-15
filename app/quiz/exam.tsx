import {useEffect} from 'react';
import {ArrowLeft} from 'lucide-react';
import {ModeNav} from './mode-nav';
import './quiz.css';

/** 模擬考試: the entrance exists so that the three modes are side by side; the exam itself follows in the next change. */
export default function ExamPage() {
  useEffect(() => {document.title = '模擬考試 · MJ Anatomy';}, []);
  return <main className="quiz-app quiz-hub" lang="zh-Hant">
    <header className="quiz-header">
      <a className="quiz-back" href="#/" aria-label="返回圖譜"><ArrowLeft size={18}/><span>返回圖譜</span></a>
      <ModeNav current="exam"/>
      <span className="quiz-header-tag">最高難度</span>
    </header>
    <div className="quiz-hub-content">
      <section className="quiz-intro quiz-hub-intro">
        <h1 tabIndex={-1}>模擬考試</h1>
        <p>最高難度的限時考試，即將推出。目前請先用「學習」與「Quiz」準備。</p>
        <p><a className="quiz-text-button" href="#/learn">前往學習</a> <a className="quiz-text-button" href="#/quiz">前往 Quiz</a></p>
      </section>
    </div>
  </main>;
}
