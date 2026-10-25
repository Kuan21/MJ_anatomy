import type {Part} from './anatomy';

/** Reproductive anatomy depends on the sex shown: the Human Reference Atlas female organs, or the BodyParts3D male organs. Everything else is shared. */
export const matchesSex=(part:Part,sex:'male'|'female'|undefined)=>{
 const shown=sex??'male';
 if(part.sex==='female')return shown==='female';
 if(part.system==='reproductive')return shown==='male';
 return true;
};
