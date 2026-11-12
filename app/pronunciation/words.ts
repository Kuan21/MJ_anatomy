/** The words of an English structure name, lower case ("Abdominal part of right pectoralis major" → abdominal, part, of, right, pectoralis, major). Names are read word by word. */
export const wordsOf=(name:string)=>[...name.matchAll(/[A-Za-z][A-Za-z'-]*/g)].map(m=>m[0].toLowerCase());
/** Key of a whole name in the reviewed list. */
export const nameKey=(name:string)=>wordsOf(name).join(' ');
