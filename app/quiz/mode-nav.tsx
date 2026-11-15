import {EXAM_HASH, LEARN_HUB_HASH} from './catalogue';

export type StudyMode = 'learn' | 'quiz' | 'exam';
/** The three separate entrances: learn (guided lessons), Quiz (checking yourself) and the mock exam (hardest). The exam entrance is only live once the exam page exists. */
export const STUDY_MODES: {id: StudyMode; label: string; english: string; hash: string; note: string}[] = [
  {id: 'learn', label: '學習', english: 'Learn', hash: LEARN_HUB_HASH, note: '關卡地圖：認識、練習、過關測驗'},
  {id: 'quiz', label: 'Quiz', english: 'Quiz', hash: '#/quiz', note: '自選範圍與題數，檢查自己'},
  {id: 'exam', label: '模擬考試', english: 'Mock exam', hash: EXAM_HASH, note: '最高難度：倒數計時、順序打散'},
];
/** The mode tabs of every study page. */
export function ModeNav({current}: {current: StudyMode}) {
  return <nav className="mode-nav" aria-label="學習模式">
    {STUDY_MODES.map(m => <a key={m.id} className={`mode-nav-link mode-${m.id}`} href={m.hash} aria-current={m.id === current ? 'page' : undefined} title={m.note}>{m.label}</a>)}
  </nav>;
}
