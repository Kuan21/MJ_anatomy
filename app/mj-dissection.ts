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

const REGION_BOXES:Record<Exclude<RegionId,'whole-body'>,{y:[number,number];absX:[number,number]}>={
 shoulder:{y:[1.18,1.54],absX:[.045,.32]},
 arm:{y:[1.02,1.41],absX:[.12,.31]},
 forearm:{y:[.82,1.18],absX:[.16,.33]},
 hand:{y:[.70,.96],absX:[.19,.36]},
};
const shoulderMidlineAnchor=/shoulder|scapul|clavic|acrom|corac|glen|humer|subacrom|subdeltoid|sternoclav|costoclav|interclav/i;

const inRegion=(part:Part,regionId:RegionId)=>{
 if(regionId==='whole-body')return true;
 const spec=REGION_BOXES[regionId],cx=(part.bounds[0][0]+part.bounds[1][0])/2,cy=(part.bounds[0][1]+part.bounds[1][1])/2,ax=Math.abs(cx);
 if(cy<spec.y[0]||cy>spec.y[1]||ax>spec.absX[1])return false;
 if(regionId==='shoulder')return ax>=spec.absX[0]||shoulderMidlineAnchor.test(part.name);
 return ax>=spec.absX[0];
};

export function dissectionPartMatches(part:Part,keywords:string[],regionId:RegionId='whole-body'){
 return inRegion(part,regionId)&&matches(part.name,keywords);
}

export function resolveDissection(atlas:Atlas,regionId:RegionId,stageIndex:number):DissectionResult{
 const region=regionById(regionId);
 if(region.id==='whole-body'){
  return {region:region.id,stage:0,stageLabel:'Whole body',stageDescription:'System exploration',partIds:atlas.parts.map(p=>p.id),systems:Array.from(new Set(atlas.parts.map(p=>p.system)))};
 }
 const safe=Math.max(0,Math.min(stageIndex,region.stages.length-1));
 // A dissection stage removes the layers above it while keeping the current
 // layer and all deeper anatomy visible.
 const included=region.stages.slice(safe);
 const keywords=included.flatMap(s=>s.keywords);
 const partIds=atlas.parts.filter(p=>inRegion(p,region.id)&&matches(p.name,keywords)).map(p=>p.id);
 const idSet=new Set(partIds);
 const systems=Array.from(new Set(atlas.parts.filter(p=>idSet.has(p.id)).map(p=>p.system)));
 const current=region.stages[safe];
 return {region:region.id,stage:safe,stageLabel:current.label,stageDescription:current.description,partIds,systems};
}
