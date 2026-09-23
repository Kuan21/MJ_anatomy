import type {Atlas,Concept,Part} from './anatomy';

type FacialSourcePart={
 id:string;conceptId:string;name:string;system:'muscular';vertexCount:number;indexCount:number;
 bounds:[number[],number[]];positions:number;normals:number;indices:number;
};

type FacialSourceAtlas={parts:FacialSourcePart[]};

export const FACIAL_BINARY_URL='https://raw.githubusercontent.com/choxos/OMFAtlas/c835665a9ade09ee0b993cee6eee1b25b7f7311b/public/models/facial/facial.bin';

export async function augmentAtlasWithFacial(base:Atlas,signal?:AbortSignal):Promise<Atlas>{
 const response=await fetch(`${import.meta.env.BASE_URL}models/facial/atlas.json`,{signal});
 if(!response.ok)throw new Error('The facial muscle catalogue could not be loaded.');
 const facial=await response.json() as FacialSourceAtlas;
 const chunk=base.chunks.length;
 const facialParts:Part[]=facial.parts.map(p=>({
  id:p.id,name:p.name,conceptId:p.conceptId,system:'muscular',chunk,
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
  chunks:[...base.chunks,{url:FACIAL_BINARY_URL,bytes:16390216,deferUntil:'head'}]
 };
}
