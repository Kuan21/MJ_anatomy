export type CourseNoteKind='attachment'|'course'|'joint'|'location'|'supply'|'note';

export interface CourseNoteEntry{
 source?:string;
 kind:CourseNoteKind;
 text:string;
}
type CourseNoteRecord={names:string[];systems:string[];entries:CourseNoteEntry[]};
export type CourseNoteIndex=Record<string,CourseNoteRecord>;

let index:CourseNoteIndex={};

const norm=(s:string)=>s.toLowerCase()
 .replace(/\.(?:l|r)\.\d+\b/g,' ')
 .replace(/\b(left|right)\b/g,' ')
 .replace(/\b(superficial|deep|proximal|distal)\s+part of\b/g,' ')
 .replace(/[–—-]/g,' ')
 .replace(/[()]/g,' ')
 .replace(/\bmuscle\b/g,' ')
 .replace(/\s+/g,' ')
 .trim();

export function setCourseNoteIndex(next:CourseNoteIndex){index=next??{};}

export function courseNotesFor(name:string):CourseNoteEntry[]{
 const key=norm(name);
 const exact=index[key]?.entries;
 if(exact?.length)return exact;

 // Model labels often add side/segment qualifiers (for example ".r.001",
 // "branch of", or a regional portion) while the course note names the parent
 // structure. Prefer the longest specific course-note key contained in the
 // model name, and only then allow the inverse relation. This widens coverage
 // without letting short generic words such as "head" over-match.
 const candidates=Object.keys(index)
  .filter(k=>k.length>=6&&(key.includes(k)||k.includes(key)))
  .sort((a,b)=>b.length-a.length);
 return candidates[0]?index[candidates[0]].entries:[];
}

