import * as T from 'three';
export interface NerveChunk {url:string;bytes:number;meshes:{name:string;ancestry:string;positions:number;vertexCount:number;indices:number;indexCount:number}[]}
export interface NerveCatalogue {meshCount:number;chunks:NerveChunk[]}
export function nerveChunkScene(chunk:NerveChunk,buffer:ArrayBuffer):T.Group{
 if(buffer.byteLength!==chunk.bytes)throw Error('Incomplete nerve package');
 const root=new T.Group();
 for(const part of chunk.meshes){
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,part.positions,part.vertexCount*3).slice(),3));
  geometry.setIndex(new T.BufferAttribute(new Uint32Array(buffer,part.indices,part.indexCount).slice(),1));
  geometry.computeVertexNormals();
  const parent=new T.Group();parent.userData.name=part.ancestry;
  const mesh=new T.Mesh(geometry);mesh.userData.name=part.name;mesh.name=part.name;parent.add(mesh);root.add(parent);
 }
 return root;
}
