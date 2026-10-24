import type {Atlas,Concept,Part} from './anatomy';
import {fetchModelBuffer} from './model-download';

type FacialSourcePart={
 id:string;conceptId:string;name:string;system:'muscular';vertexCount:number;indexCount:number;
 bounds:[number[],number[]];positions:number;normals:number;indices:number;chunk:number;
};

type FacialStream={parts:FacialSourcePart[];chunks:Atlas['chunks']};

export async function augmentAtlasWithFacial(base:Atlas,signal?:AbortSignal):Promise<Atlas>{
 // scripts/prepare-facial.mjs repackages the pinned BodyParts3D 3.0 facial binary into small,
 // gzip-compressed, immutable same-origin packages, so these pieces load in stages beside the body.
 const facial=JSON.parse(new TextDecoder().decode(await fetchModelBuffer(`${import.meta.env.BASE_URL}models/facial/facial-stream.json.gz`,0,true,signal??new AbortController().signal))) as FacialStream;
 const offset=base.chunks.length;
 const facialParts:Part[]=facial.parts.map(p=>({
  id:p.id,name:p.name,conceptId:p.conceptId,system:'muscular',chunk:offset+p.chunk,
  positions:p.positions,normals:p.normals,indices:p.indices,
  vertexCount:p.vertexCount,indexCount:p.indexCount,bounds:p.bounds
 }));
 const byConcept=new Map<string,Concept>(base.concepts.map(c=>[c.id,{...c,elements:[...c.elements]}]));
 for(const p of facialParts){
  const existing=byConcept.get(p.conceptId);
  if(existing){if(!existing.elements.includes(p.id))existing.elements.push(p.id);}
  else byConcept.set(p.conceptId,{id:p.conceptId,name:p.name,elements:[p.id]});
 }
 return{
  ...base,
  source:`${base.source??'BodyParts3D'} + registered BodyParts3D 3.0 facial muscles`,
  parts:[...base.parts,...facialParts],
  concepts:[...byConcept.values()],
  chunks:[...base.chunks,...facial.chunks]
 };
}
