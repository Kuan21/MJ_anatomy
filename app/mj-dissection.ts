import type {Atlas,Part,SystemId} from './anatomy';
import {regionById,type RegionId} from './mj-regions';

export interface DissectionResult {
 region:RegionId;
 stage:number;
 stageLabel:string;
 stageDescription:string;
 partIds:string[];
 systems:SystemId[];
}

const normalize=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const matches=(name:string,keywords:string[])=>{
 const n=normalize(name);
 return keywords.some(keyword=>n.includes(normalize(keyword)));
};

export function dissectionPartMatches(part:Part,keywords:string[]){
 return matches(part.name,keywords);
}

export function resolveDissection(atlas:Atlas,regionId:RegionId,stageIndex:number):DissectionResult{
 const region=regionById(regionId);
 if(region.id==='whole-body'){
  return {region:region.id,stage:0,stageLabel:'Whole body',stageDescription:'System exploration',partIds:atlas.parts.map(p=>p.id),systems:Array.from(new Set(atlas.parts.map(p=>p.system)))};
 }
 const safe=Math.max(0,Math.min(stageIndex,region.stages.length-1));
 const included=region.stages.slice(safe);
 const keywords=included.flatMap(s=>s.keywords);
 const partIds=atlas.parts.filter(p=>matches(p.name,keywords)).map(p=>p.id);
 const idSet=new Set(partIds);
 const systems=Array.from(new Set(atlas.parts.filter(p=>idSet.has(p.id)).map(p=>p.system)));
 const current=region.stages[safe];
 return {region:region.id,stage:safe,stageLabel:current.label,stageDescription:current.description,partIds,systems};
}
