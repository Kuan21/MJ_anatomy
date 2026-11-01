/** Decoding of the compact atlas packages written by scripts/prepare-model-stream.mjs (Bug Audit P2-01). The manifest offsets are byte offsets
 * into the package (4-byte aligned). Three per-part flags describe the encoding; a part without them (older packages, the derived organ streams)
 * is stored as before. Everything is copied out of the package so the downloaded buffer can be freed once a package has been decoded.
 *  - `pq`: positions quantised to Uint16 on the part's own box: value = q * scale + low (6 µm at most for the largest part); otherwise Float32.
 *  - `n2`: normals as octahedral Int16 pairs (decoded here back to the normalised Int16 triples the shaders and motion code use); otherwise Int16 triples.
 *  - `u16`: indices as Uint16 (every part has at most 65 535 vertices); otherwise Uint32. */
export interface PackedPart {positions:number;normals:number;indices:number;vertexCount:number;indexCount:number;pq?:number[];n2?:boolean;u16?:boolean}
export function positionArray(buffer:ArrayBuffer,part:PackedPart,byteOffset=0):Float32Array{
 const n=part.vertexCount*3;
 if(!part.pq)return new Float32Array(buffer,byteOffset+part.positions,n).slice();
 const q=new Uint16Array(buffer,byteOffset+part.positions,n),out=new Float32Array(n),[lx,ly,lz,sx,sy,sz]=part.pq;
 for(let i=0;i<n;i+=3){out[i]=q[i]*sx+lx;out[i+1]=q[i+1]*sy+ly;out[i+2]=q[i+2]*sz+lz;}
 return out;
}
export function normalArray(buffer:ArrayBuffer,part:PackedPart,byteOffset=0):Int16Array{
 const count=part.vertexCount;
 if(!part.n2)return new Int16Array(buffer,byteOffset+part.normals,count*3).slice();
 const o=new Int16Array(buffer,byteOffset+part.normals,count*2),out=new Int16Array(count*3);
 for(let i=0;i<count;i++){
  let x=o[i*2]/32767,y=o[i*2+1]/32767,z=1-Math.abs(x)-Math.abs(y);
  if(z<0){const ox=x,oy=y;x=(1-Math.abs(oy))*(ox>=0?1:-1);y=(1-Math.abs(ox))*(oy>=0?1:-1);}
  const l=Math.hypot(x,y,z)||1;out[i*3]=Math.round(x/l*32767);out[i*3+1]=Math.round(y/l*32767);out[i*3+2]=Math.round(z/l*32767);
 }
 return out;
}
export const indexArray=(buffer:ArrayBuffer,part:PackedPart,byteOffset=0)=>part.u16?new Uint16Array(buffer,byteOffset+part.indices,part.indexCount).slice():new Uint32Array(buffer,byteOffset+part.indices,part.indexCount).slice();
/** Encoders, used by the packaging script (through quizModule) and by the tests. */
export function encodeOctNormals(normals:ArrayLike<number>,count:number):Int16Array{
 const out=new Int16Array(count*2);
 for(let i=0;i<count;i++){
  const nx=normals[i*3],ny=normals[i*3+1],nz=normals[i*3+2],l=Math.abs(nx)+Math.abs(ny)+Math.abs(nz)||1;
  let x=nx/l,y=ny/l;if(nz<0){const ox=x,oy=y;x=(1-Math.abs(oy))*(ox>=0?1:-1);y=(1-Math.abs(ox))*(oy>=0?1:-1);}
  out[i*2]=Math.round(x*32767);out[i*2+1]=Math.round(y*32767);
 }
 return out;
}
export function quantisePositions(positions:ArrayLike<number>,count:number):{q:Uint16Array;pq:number[]}{
 const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<count*3;i+=3)for(let k=0;k<3;k++){const v=positions[i+k];if(v<lo[k])lo[k]=v;if(v>hi[k])hi[k]=v;}
 const scale=[0,1,2].map(k=>(hi[k]-lo[k])/65535||1),q=new Uint16Array(count*3);
 for(let i=0;i<count*3;i+=3)for(let k=0;k<3;k++)q[i+k]=Math.min(65535,Math.max(0,Math.round((positions[i+k]-lo[k])/scale[k])));
 return {q,pq:[lo[0],lo[1],lo[2],scale[0],scale[1],scale[2]]};
}
