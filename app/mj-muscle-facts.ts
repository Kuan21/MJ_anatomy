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

export const MUSCLE_FACT_SOURCE='CMU anatomy course material is used as the primary teaching source; standard gross-anatomy references are used only to fill details not explicit in the course material.';

export function muscleFactSourceFor(_name:string):string{
 return MUSCLE_FACT_SOURCE;
}
