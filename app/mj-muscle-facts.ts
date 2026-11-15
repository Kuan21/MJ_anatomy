import type {MuscleFacts} from './mj-muscle-facts-types';
import {UPPER_MUSCLE_FACTS} from './mj-muscle-facts-upper';
import {LOWER_MUSCLE_FACTS} from './mj-muscle-facts-lower';
import {HEAD_NECK_MUSCLE_FACTS} from './mj-muscle-facts-head-neck';
import {TRUNK_MUSCLE_FACTS} from './mj-muscle-facts-trunk';
import {MUSCLE_PART_FACTS} from './mj-muscle-facts-parts';

export const MUSCLE_FACTS:Record<string,MuscleFacts>={
 ...UPPER_MUSCLE_FACTS,
 ...LOWER_MUSCLE_FACTS,
 ...HEAD_NECK_MUSCLE_FACTS,
 ...TRUNK_MUSCLE_FACTS,
 ...MUSCLE_PART_FACTS
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
// Keys are matched in the same normalised form as the names (hyphens and underscores read as spaces): 'thyro-arytenoid' used to miss "Left thyro-arytenoid" and the laryngeal muscles got the generic card.
const keys=Object.keys(MUSCLE_FACTS).map(k=>({raw:k,norm:norm(k)})).sort((a,b)=>b.norm.length-a.norm.length);

export function muscleFactsFor(name:string):MuscleFacts|undefined{
 const n=norm(stripSide(name));
 const alias=aliases[n];if(alias)return MUSCLE_FACTS[alias];
 const key=keys.find(k=>n===k.norm||n.includes(k.norm));
 return key?MUSCLE_FACTS[key.raw]:undefined;
}

export const MUSCLE_FACT_SOURCE='Standard gross-anatomy references (origin, insertion, innervation, action and blood supply).';

export function muscleFactSourceFor(_name:string):string{
 return MUSCLE_FACT_SOURCE;
}
