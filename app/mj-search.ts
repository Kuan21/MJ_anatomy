import type {Concept} from './anatomy';

// Chinese search accepts the Taiwan form the viewer shows plus the Hong Kong and mainland spellings people also type
// (闊背肌 / 背阔肌 for 背闊肌, simplified characters in general).
const SIMPLIFIED:Record<string,string>={闊:'阔',橫:'横',內:'内',豎:'竖',頭:'头',臟:'脏',腸:'肠',韌:'韧',節:'节',動:'动',靜:'静',脈:'脉',經:'经',頸:'颈',腦:'脑',膽:'胆',腎:'肾',頰:'颊',顳:'颞',顱:'颅',臍:'脐',臀:'臀',膈:'膈',關:'关',體:'体',龍:'龙',側:'侧',縫:'缝',線:'线',環:'环',間:'间',骨:'骨',膜:'膜',腱:'腱',髖:'髋',踝:'踝',趾:'趾'};
const ALIASES:Record<string,string[]>={背闊肌:['闊背肌','背阔肌']};
const simplify=(s:string)=>[...s].map(c=>SIMPLIFIED[c]??c).join('');

/** Does a Chinese structure name match what the user typed? */
export function chineseMatches(chinese:string|undefined,query:string){
 const q=query.trim();
 if(!chinese||!q)return false;
 if(chinese.includes(q))return true;
 const names=[chinese];
 for(const [canonical,others] of Object.entries(ALIASES))if(chinese.includes(canonical))for(const o of others)names.push(chinese.replace(canonical,o));
 const simple=simplify(q);
 return names.some(n=>n.includes(q)||simplify(n).includes(simple));
}

/** The Find-a-structure predicate for one atlas concept. */
export const conceptMatches=(concept:Pick<Concept,'id'|'name'>,profile:{english:string;chinese?:string}|undefined,query:string)=>{
 const term=query.toLowerCase().trim();
 return concept.name.toLowerCase().includes(term)||concept.id.toLowerCase().includes(term)||!!profile?.english.toLowerCase().includes(term)||chineseMatches(profile?.chinese,query);
};
