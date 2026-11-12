import type {Atlas,Concept,Part} from './anatomy';
import {fetchModelBuffer} from './model-download';

type FacialSourcePart={
 id:string;conceptId:string;name:string;system:Part['system'];vertexCount:number;indexCount:number;
 bounds:[number[],number[]];positions:number;normals:number;indices:number;pq?:number[];n2?:boolean;u16?:boolean;chunk:number;sex?:'female';schematic?:boolean;kind?:string;
};

export type FacialStream={parts:FacialSourcePart[];chunks:Atlas['chunks']};

const streamOf=async(file:string,signal:AbortSignal)=>JSON.parse(new TextDecoder().decode(await fetchModelBuffer(`${import.meta.env.BASE_URL}models/${file}`,0,true,signal))) as FacialStream;

/** Append the facial and supplement streams to the base atlas: parts, concepts (so search finds them) and packages. */
export function mergeAtlasStreams(base:Atlas,streams:FacialStream[]):Atlas{
 let offset=base.chunks.length;
 const added:Part[]=[],addedChunks:Atlas['chunks']=[];
 for(const stream of streams){
  for(const p of stream.parts)added.push({
   id:p.id,name:p.name,conceptId:p.conceptId,system:p.system,chunk:offset+p.chunk,
   positions:p.positions,normals:p.normals,indices:p.indices,...(p.u16?{u16:true}:{}),...(p.n2?{n2:true}:{}),...(p.pq?{pq:p.pq}:{}),
   vertexCount:p.vertexCount,indexCount:p.indexCount,bounds:p.bounds,
   ...(p.sex?{sex:p.sex}:{}),...(p.schematic?{schematic:true}:{}),...(p.kind?{kind:p.kind}:{})
  });
  addedChunks.push(...stream.chunks);offset+=stream.chunks.length;
 }
 const byConcept=new Map<string,Concept>(base.concepts.map(c=>[c.id,{...c,elements:[...c.elements]}]));
 for(const p of added){
  const existing=byConcept.get(p.conceptId);
  if(existing){if(!existing.elements.includes(p.id))existing.elements.push(p.id);}
  else byConcept.set(p.conceptId,{id:p.conceptId,name:p.name,elements:[p.id]});
 }
 return{
  ...base,
  source:`${base.source??'BodyParts3D'} + registered BodyParts3D 3.0 facial muscles and abdominal/back muscles`,
  parts:[...base.parts,...added],
  concepts:[...byConcept.values()],
  chunks:[...base.chunks,...addedChunks]
 };
}

export async function augmentAtlasWithFacial(base:Atlas,signal?:AbortSignal):Promise<Atlas>{
 // scripts/prepare-facial.mjs and scripts/prepare-supplement.mjs repackage pinned BodyParts3D 3.0 structures (the facial muscles, and
 // the muscles/ligaments the 4.0 export left out, such as latissimus dorsi) into small, gzip-compressed, immutable same-origin
 // packages, so these pieces load in stages beside the body.
 const abort=signal??new AbortController().signal;
 // One package that fails to download must not take the whole atlas down: the others are merged and the missing ones are reported (Atlas.unavailable).
 const packages:[string,string][]=[['facial/facial-stream.json.gz','臉部肌肉'],['supplement/supplement-stream.json.gz','補充肌肉與韌帶'],['female/female-stream.json.gz','女性器官'],['serous/serous-stream.json.gz','漿膜'],['vessel-ends/vessel-ends-stream.json.gz','血管末端'],['paokao/paokao-stream.json.gz','示意結構']];
 const results=await Promise.allSettled(packages.map(([file])=>streamOf(file,abort)));
 if(abort.aborted)throw abort.reason??new DOMException('Aborted','AbortError');
 const streams:FacialStream[]=[],unavailable:string[]=[];
 results.forEach((result,i)=>{if(result.status==='fulfilled')streams.push(result.value);else{unavailable.push(packages[i][1]);console.error(`補充資料包未載入：${packages[i][1]}（${packages[i][0]}）`,result.reason);}});
 const merged=mergeAtlasStreams(base,streams);
 return unavailable.length?{...merged,unavailable}:merged;
}
