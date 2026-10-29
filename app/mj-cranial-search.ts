/**
 * Cranial nerve search: the category ("cranial nerve", "cranial nerves", 腦神經, 顱神經), a number (CN III, CN 3, cranial nerve 3 / III, 第三對腦神經, 第3對腦神經)
 * and plural/singular endings ("nerves"). The nerve names themselves (oculomotor, 動眼神經 …) are matched by the ordinary name search.
 * Shared by the main atlas search (mj-search.ts) and the brain detail mode's search (organ/brain.tsx).
 */
export interface CranialNerve{n:number;roman:string;en:string;zh:string;/** trunk names (lower case, side and "(III)" removed) */trunk:RegExp;/** branches and divisions, found by number only */branches?:RegExp}
export const CRANIAL_NERVES:CranialNerve[]=[
 {n:1,roman:'I',en:'Olfactory nerve',zh:'嗅神經',trunk:/^olfactory (?:nerve|bulb|tract)$/},
 {n:2,roman:'II',en:'Optic nerve',zh:'視神經',trunk:/^optic (?:nerve|chiasm|tract)$/},
 {n:3,roman:'III',en:'Oculomotor nerve',zh:'動眼神經',trunk:/^oculomotor nerve$/,branches:/^(?:superior|inferior) branch of oculomotor nerve$/},
 {n:4,roman:'IV',en:'Trochlear nerve',zh:'滑車神經',trunk:/^trochlear nerve$/},
 {n:5,roman:'V',en:'Trigeminal nerve',zh:'三叉神經',trunk:/^(?:trigeminal nerve|(?:sensory|motor) root of trigeminal nerve)$/,branches:/^(?:ophthalmic|maxillary|mandibular) nerve$|^trigeminal ganglion$/},
 {n:6,roman:'VI',en:'Abducens nerve',zh:'外展神經',trunk:/^(?:abducens|abducent) nerve$/},
 {n:7,roman:'VII',en:'Facial nerve',zh:'面神經',trunk:/^facial nerve$/},
 {n:8,roman:'VIII',en:'Vestibulocochlear nerve',zh:'前庭耳蝸神經',trunk:/^(?:vestibulocochlear|vestibular|cochlear) nerve$/},
 {n:9,roman:'IX',en:'Glossopharyngeal nerve',zh:'舌咽神經',trunk:/^glossopharyngeal nerve$/},
 {n:10,roman:'X',en:'Vagus nerve',zh:'迷走神經',trunk:/^vagus nerve$/},
 {n:11,roman:'XI',en:'Accessory nerve',zh:'副神經',trunk:/^(?:spinal )?accessory nerve$/},
 {n:12,roman:'XII',en:'Hypoglossal nerve',zh:'舌下神經',trunk:/^hypoglossal nerve$/},
];
const ROMAN=new Map(CRANIAL_NERVES.map(c=>[c.roman.toLowerCase(),c.n]));
const ZH_DIGITS:Record<string,number>={一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10,十一:11,十二:12};
export type CranialQuery={all:true}|{numbers:number[]};
const toNumber=(token:string):number|undefined=>{
 const t=token.trim().toLowerCase();
 const n=/^\d{1,2}$/.test(t)?Number(t):ROMAN.get(t)??ZH_DIGITS[token.trim()];
 return n&&n>=1&&n<=12?n:undefined;
};
/** What a query asks for, or null when it is an ordinary name search. */
export function cranialQuery(query:string):CranialQuery|null{
 const q=query.trim().toLowerCase().replace(/\s+/g,' ');
 if(!q)return null;
 const zh=/^第\s*([一二三四五六七八九十]+|\d{1,2})\s*對?\s*(?:腦|顱)神經$/.exec(q);
 if(zh){const n=toNumber(zh[1]!);return n?{numbers:[n]}:null;}
 const zh2=/^(?:腦|顱)神經\s*([一二三四五六七八九十]+|\d{1,2})$/.exec(q);
 if(zh2){const n=toNumber(zh2[1]!);return n?{numbers:[n]}:null;}
 if(/^(?:十二|12)\s*對?\s*(?:腦|顱)神經$/.test(q)||/^(?:腦|顱)神經$/.test(q)||/^(?:腦|顱)神$/.test(q))return{all:true};
 const num=/^(?:cn|c\.n\.|cranial nerves?|cranial)\s*[-.#]?\s*(\d{1,2}|[ivx]{1,4})$/.exec(q);
 if(num){const n=toNumber(num[1]!);return n?{numbers:[n]}:null;}
 // the category, also while it is still being typed ("cranial", "cranial n", "cranial nerv")
 if(q.length>=4&&'cranial nerves'.startsWith(q))return{all:true};
 if(/^cranial nerves?$/.test(q)||/^cns?$/.test(q)&&false)return{all:true};
 return null;
}
/** "Left oculomotor nerve", "Oculomotor nerve (III).l.001" … → "oculomotor nerve". */
export const cranialBase=(name:string)=>name.toLowerCase().replace(/\.[lr](\.\d+)?$/,'').replace(/\b(left|right)\b/g,' ').replace(/\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\)/g,' ').replace(/\s+/g,' ').trim();
/** Which cranial nerve (1–12) a structure name belongs to as trunk, or as branch when branches are wanted; 0 when none. */
export function cranialNumberOf(english:string,withBranches:boolean):number{
 const base=cranialBase(english);
 for(const c of CRANIAL_NERVES)if(c.trunk.test(base)||(withBranches&&c.branches?.test(base)))return c.n;
 return 0;
}
/** Does a structure name answer a cranial nerve query? */
export function matchesCranial(english:string,cq:CranialQuery):boolean{
 if('all' in cq)return cranialNumberOf(english,false)>0;
 const n=cranialNumberOf(english,true);return n>0&&cq.numbers.includes(n);
}
/** Singular forms for a plural ending, tried when the typed text finds nothing ("cranial nerves" → "cranial nerve"). */
export const singularQuery=(query:string)=>query.trim().replace(/(\w{3,})ies\b/gi,'$1y').replace(/(\w{3,}[^s])s\b/gi,'$1');
