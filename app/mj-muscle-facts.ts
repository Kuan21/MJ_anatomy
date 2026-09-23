import type {MuscleFacts} from './mj-muscle-facts-types';
import {UPPER_MUSCLE_FACTS} from './mj-muscle-facts-upper';
import {LOWER_MUSCLE_FACTS} from './mj-muscle-facts-lower';
import {HEAD_NECK_MUSCLE_FACTS} from './mj-muscle-facts-head-neck';
import {TRUNK_MUSCLE_FACTS} from './mj-muscle-facts-trunk';

export const MUSCLE_FACTS:Record<string,MuscleFacts>={
 ...UPPER_MUSCLE_FACTS,
 ...LOWER_MUSCLE_FACTS,
 ...HEAD_NECK_MUSCLE_FACTS,
 ...TRUNK_MUSCLE_FACTS
};

const aliases:Record<string,string>={
 'infraspinatus muscle':'infraspinatus',
 'oblique part of cricothyroid':'cricothyroid',
 'straight part of cricothyroid':'cricothyroid',
 'anterior papillary muscle of ventricle':'papillary muscle of ventricle',
 'posterior papillary muscle of ventricle':'papillary muscle of ventricle',
 'septal papillary muscle of ventricle':'papillary muscle of ventricle',
 'lateral papillary muscle of ventricle':'papillary muscle of ventricle'
};

const norm=(s:string)=>s.toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
const stripSide=(s:string)=>s.replace(/\b(left|right)\b/gi,'').replace(/(?:^|\.)[lr](?=\.|$)/gi,' ').replace(/[._]+/g,' ').replace(/\s+/g,' ').trim();
const keys=Object.keys(MUSCLE_FACTS).sort((a,b)=>b.length-a.length);

export function muscleFactsFor(name:string):MuscleFacts|undefined{
 const n=norm(stripSide(name));
 const alias=aliases[n];if(alias)return MUSCLE_FACTS[alias];
 const key=keys.find(k=>n===k||n.includes(k));
 return key?MUSCLE_FACTS[key]:undefined;
}

export const MUSCLE_FACT_SOURCE='CMU anatomy course files in the linked Google Drive folder are the primary course source; Netter/standard gross-anatomy references are used only to fill details not explicitly present in the course files.';

const COURSE_SOURCES={
 upper:'CMU: 上肢(全).pdf; 20250228_解剖(上肢)_W2.pdf; 20250516_解剖(上肢I(張))_W13.pdf; 20250523_解剖(上肢II(張))_W14.pdf',
 lower:'CMU: 下肢(全).pdf; 20250304_解剖(上+下肢)_W3-1 2.pdf; 20250307_解剖(下肢+關節)_W3-2 2.pdf',
 headNeck:'CMU: 20250221_解剖(頭顱)_W1-2.pdf; 解剖_1124-1(頭V).pdf; 解剖_1124-2(頸III).pdf; 20250411_解剖(生殖系統(曾)+喉部(陳))_W8.pdf',
 trunk:'CMU: 20250509_解剖(背部I(魏))_W12.pdf; 20250513_解剖(背部II(魏))_W13.pdf; 20250527_解剖(腹部I(謝))_W15.pdf; 20250530_解剖(腹部II(謝))_W15.pdf; 20250606_解剖(腹部III(謝))_W16.pdf'
} as const;

export function muscleFactSourceFor(name:string):string{
 const n=norm(stripSide(name)),alias=aliases[n],key=alias??keys.find(k=>n===k||n.includes(k));
 if(!key)return MUSCLE_FACT_SOURCE;
 if(UPPER_MUSCLE_FACTS[key])return COURSE_SOURCES.upper+'; '+MUSCLE_FACT_SOURCE;
 if(LOWER_MUSCLE_FACTS[key])return COURSE_SOURCES.lower+'; '+MUSCLE_FACT_SOURCE;
 if(HEAD_NECK_MUSCLE_FACTS[key])return COURSE_SOURCES.headNeck+'; '+MUSCLE_FACT_SOURCE;
 if(TRUNK_MUSCLE_FACTS[key])return COURSE_SOURCES.trunk+'; '+MUSCLE_FACT_SOURCE;
 return MUSCLE_FACT_SOURCE;
}
