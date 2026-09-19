import type {Atlas,Part,SystemId} from './anatomy';
import {regionById,type RegionId} from './mj-regions';

const normalize=(s:string)=>s.toLowerCase().replace(/[‐‑–—]/g,'-').replace(/\s+/g,' ').trim();
const matches=(name:string,keywords:string[])=>{const n=normalize(name);return keywords.some(k=>n.includes(normalize(k)));};

export interface DissectionResult {
 region:RegionId;
 stage:number;
 stageLabel:string;
 stageDescription:string;
 partIds:string[];
 systems:SystemId[];
}

/**
 * Resolves curriculum stages against the actual BodyParts3D catalogue.
 * It never invents a structure: a stage can only reveal parts that exist
 * in atlas.json and match the region's explicit vocabulary.
 */
export function resolveDissection(atlas:Atlas,regionId:RegionId,stageIndex:number):DissectionResult{
 const region=regionById(regionId);
 if(region.id==='whole-body'||region.stages.length===0){
  return {region:region.id,stage:0,stageLabel:'Whole body',stageDescription:'System exploration',partIds:atlas.parts.map(p=>p.id),systems:Array.from(new Set(atlas.parts.map(p=>p.system)))};
 }
 const safe=Math.max(0,Math.min(stageIndex,region.stages.length-1));
 const included=region.stages.slice(safe); // peel superficial stages; retain the current and deeper anatomy
 const keywords=included.flatMap(s=>s.keywords);
 const partIds=atlas.parts.filter(p=>matches(p.name,keywords)).map(p=>p.id);
 const idSet=new Set(partIds);\n const systems=Array.from(new Set(atlas.parts.filter(p=>idSet.has(p.id)).map(p=>p.system)));
 const current=region.stages[safe];
 return {region:region.id,stage:safe,stageLabel:current.label,stageDescription:current.description,partIds,systems};
}

export function dissectionPartMatches(part:Part,regionId:RegionId,stageIndex:number){
 const region=regionById(regionId);
 if(region.id==='whole-body')return true;
 const safe=Math.max(0,Math.min(stageIndex,region.stages.length-1));
 return matches(part.name,region.stages.slice(safe).flatMap(s=>s.keywords));
}
