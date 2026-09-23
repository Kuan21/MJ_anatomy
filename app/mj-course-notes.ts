export type CourseNoteKind='attachment'|'course'|'joint'|'location'|'supply'|'note';

export interface CourseNoteEntry{
 source:string;
 kind:CourseNoteKind;
 text:string;
}
type CourseNoteRecord={names:string[];systems:string[];entries:CourseNoteEntry[]};
export type CourseNoteIndex=Record<string,CourseNoteRecord>;

let index:CourseNoteIndex={};

const norm=(s:string)=>s.toLowerCase()
 .replace(/\b(left|right)\b/g,' ')
 .replace(/[–—-]/g,' ')
 .replace(/[()]/g,' ')
 .replace(/\bmuscle\b/g,' ')
 .replace(/\s+/g,' ')
 .trim();

export function setCourseNoteIndex(next:CourseNoteIndex){index=next??{};}

export function courseNotesFor(name:string):CourseNoteEntry[]{
 return index[norm(name)]?.entries??[];
}

export function courseNoteSourceCount(name:string){
 return new Set(courseNotesFor(name).map(x=>x.source)).size;
}
