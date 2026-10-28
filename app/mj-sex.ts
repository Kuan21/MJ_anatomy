import type {Part} from './anatomy';

/** Reproductive anatomy depends on the sex shown: the Human Reference Atlas female organs, or the BodyParts3D male organs. Everything else is shared. */
/** Male-only anatomy that sits outside the reproductive system (the vessels and nerves of the penis and scrotum, the spermatic cord's vessels) is hidden with it. */
const MALE_ONLY=/\b(penis|penile|scrot|testic|spermatic|prostat|vas deferens|ductus deferens|seminal|bulbourethral|cavernos|bulb of (the )?penis|glans|epididym)/i;
const FEMALE_ONLY=/\b(uterus|uterine|ovari|vagin|clitor|vulva|labi(a|um)|vestibul[a-z]* bulb|broad ligament)/i;

/** The BodyParts3D pelvis is male; in female mode the Human Reference Atlas female hip bones and sacrum are drawn instead. */
const MALE_PELVIC_BONE=/^(?:(?:Left|Right) hip bone|Sacrum)$/;

export const matchesSex=(part:Part,sex:'male'|'female'|undefined)=>{
 const shown=sex??'male';
 if(part.sex==='female')return shown==='female';
 if(part.sex!=='female'){ if(shown==='female'&&(MALE_ONLY.test(part.name)||(part.system==='skeletal'&&MALE_PELVIC_BONE.test(part.name))))return false; if(shown==='male'&&FEMALE_ONLY.test(part.name))return false; }
 if(part.system==='reproductive')return shown==='male';
 return true;
};
