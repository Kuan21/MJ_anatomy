import type {QuizStructure} from './catalogue';

/** Level 1 records the structure that was picked; level 2 records the typed name and how it was judged (a close answer is not scored as correct but is shown with its correct spelling). */
export type QuizAnswer = {targetId: string; pickedId: string | null; correct: boolean; typed?: string; result?: 'correct' | 'close' | 'wrong' | 'skipped'; relation?: 'typed-part' | 'typed-whole'; relatedName?: string};
export interface QuizSession {queue: string[]; answers: QuizAnswer[]}

function shuffled<T>(values: readonly T[], random: () => number) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Round-robin systems before trimming: mixed practice includes every chosen
 * system when the requested question count permits, without repeated answers. */
export function createSession(pool: QuizStructure[], count: number, random = Math.random): QuizSession {
  const unique = [...new Map(pool.map(s => [s.id, s])).values()];
  const systems = shuffled([...new Set(unique.map(s => s.system))], random);
  const groups = systems.map(system => shuffled(unique.filter(s => s.system === system).map(s => s.id), random));
  const queue: string[] = [];
  while (groups.some(g => g.length) && queue.length < count) {
    for (const group of groups) {
      const id = group.pop();
      if (id && queue.length < count) queue.push(id);
    }
  }
  return {queue, answers: []};
}

/** A double tap, delayed click, or repeated reveal cannot alter a scored answer. */
export function recordAnswer(session: QuizSession, index: number, pickedId: string | null, relation?: 'typed-part' | 'typed-whole'): QuizSession {
  if (index !== session.answers.length || !session.queue[index]) return session;
  const targetId = session.queue[index];
  // picking a part of the target (or the whole it belongs to) is close, not correct
  return {...session, answers: [...session.answers, relation ? {targetId, pickedId, correct: false, result: 'close', relation} : {targetId, pickedId, correct: pickedId === targetId}]};
}

/** A typed answer of level 2. */
export function recordTyped(session: QuizSession, index: number, typed: string | null, result: 'correct' | 'close' | 'wrong' | 'skipped', relation?: 'typed-part' | 'typed-whole', relatedName?: string): QuizSession {
  if (index !== session.answers.length || !session.queue[index]) return session;
  return {...session, answers: [...session.answers, {targetId: session.queue[index], pickedId: null, correct: result === 'correct', typed: typed ?? undefined, result, relation, relatedName}]};
}

/** A session made of chosen structures (the saved mistakes), in random order. */
export function sessionOf(ids: string[], random = Math.random): QuizSession {return {queue: shuffled(ids, random), answers: []};}

export function retryMistakes(session: QuizSession): QuizSession {
  return {queue: session.answers.filter(a => !a.correct).map(a => a.targetId), answers: []};
}
