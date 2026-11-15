import {useMemo} from 'react';
import {structureCard} from './card';
import type {QuizStructure} from './catalogue';

/** The line for a structure that has no card text yet: small and neutral (the text itself is added later). */
export function ContentPending() {
  return <p className="quiz-info-pending" data-pending="true" role="note"><span lang="zh-Hant">資料整理中</span><small lang="en">Content being prepared</small></p>;
}

/** Learn step of a guided lesson: the fields the structure has, or 「資料整理中」 when it has no card text at all (empty fields are not listed). */
export function LearnInfo({structure}: {structure: QuizStructure}) {
  const card = useMemo(() => structureCard(structure), [structure]);
  if (card.fields.length === 0) return <ContentPending/>;
  return <dl className="lesson-learn-info" aria-label="資料">
    {card.fields.map(f => <div key={f.label}><dt>{f.label}</dt><dd>{f.zh && <span lang="zh-Hant">{f.zh}</span>}{f.en && <small lang="en">{f.en}</small>}</dd></div>)}
  </dl>;
}

