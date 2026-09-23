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

export const MUSCLE_FACT_SOURCE='CMU course material and Netter terminology where available; cross-checked with standard gross-anatomy references, TA2 terminology, and NCBI Bookshelf/StatPearls for details not covered in the course files.';
