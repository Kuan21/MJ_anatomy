import type {QuizStructure} from './catalogue';

export type QuizAnswer = {targetId: string; pickedId: string | null; correct: boolean};
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
export function recordAnswer(session: QuizSession, index: number, pickedId: string | null): QuizSession {
  if (index !== session.answers.length || !session.queue[index]) return session;
  const targetId = session.queue[index];
  return {...session, answers: [...session.answers, {targetId, pickedId, correct: pickedId === targetId}]};
}

export function retryMistakes(session: QuizSession): QuizSession {
  return {queue: session.answers.filter(a => !a.correct).map(a => a.targetId), answers: []};
}
