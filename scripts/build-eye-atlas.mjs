// Builds the eye detail atlas package: one left orbit assembled from two CC BY 4.0 sources.
//   orbit   extraocular muscles, eyelid plates, lacrimal apparatus, nerves, ophthalmic artery, visual pathway and orbital bones,
//           from the packaged BodyParts3D atlas (public/models/atlas.json); unchanged except where they meet the globe (see "fit" below);
//   globe   the 23 layered structures of the Human Reference Atlas left eye (Visible Human male), simplified and registered onto
//           the BodyParts3D eyeball: same optical axis, same axial length, optic disc on the nasal side.
// Output: public/models/eye/eye-atlas.json and eye-atlas.bin.gz (Float32 positions, Int16 normals, Uint32 indices per part).
// The globe source is not kept in the repository (27 MB). Pass its path, or let the script download the pinned release:
//   node scripts/build-eye-atlas.mjs [path/to/3d-vh-m-eye-l.glb]
import fs from 'node:fs';
import crypto from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {MeshoptSimplifier} from 'meshoptimizer';
await MeshoptSimplifier.ready;

const GLOBE_URL='https://cdn.humanatlas.io/digital-objects/ref-organ/eye-male-left/v1.3/assets/3d-vh-m-eye-l.glb';
const GLOBE_SHA256='a918173575ed1b6dbf3d90344a144940b7f055590f40e119de0ad43abee50c64';
const models=new URL('../public/models/',import.meta.url),out=new URL('eye/',models);
const atlas=JSON.parse(fs.readFileSync(new URL('atlas.json',models)));

const ORBIT_IDS=[
 // extraocular muscles and their fascia
 'FJ1323','FJ1295','FJ1308','FJ1304','FJ1322','FJ1294','FJ1306','FJ1329','FJ1291','FJ1284','FJ1292',
 // eyelids and lacrimal apparatus
 'FJ1324','FJ1328','FJ1299','FJ1301','FJ1298','FJ1309','FJ1302',
 // orbital nerves
 'FJ1321','FJ1293','FJ1330','FJ1312','FJ1290','FJ1325','FJ1326','FJ1300','FJ1310','FJ1311','FJ1288','FJ1318','FJ1319','FJ1296','FJ1283','FJ1315',
 // ophthalmic artery
 'FJ1695M',
 // visual pathway
 'FJ1313','FJ1771','FJ1773','FJ1766','FJ1735','FJ1779',
 // bony orbit
 'FJ3200','FJ3287','FJ3269','FJ3265','FJ3199','FJ3394','FJ3273',
];
// Pieces of one structure that the source splits: packaged as a single selectable part under the first id.
const MERGE={FJ1771:['FJ1818']};// optic chiasm, left and right halves
// BodyParts3D eyeball: only used to place the detailed globe.
const BODY_SCLERA='FJ1317',BODY_CORNEA='FJ1289';

const chunks=new Map();
const chunk=i=>{if(!chunks.has(i))chunks.set(i,fs.readFileSync(new URL(atlas.chunks[i].url.split('/').pop(),models)));return chunks.get(i);};
const bodyPart=id=>{const p=atlas.parts.find(x=>x.id===id);if(!p)throw new Error('Missing atlas part '+id);return p;};
const segments=[],parts=[];let offset=0;
const push=array=>{const at=offset,b=Buffer.from(array.buffer,array.byteOffset,array.byteLength);segments.push(b);offset+=b.length;const pad=(4-offset%4)%4;if(pad){segments.push(Buffer.alloc(pad));offset+=pad;}return at;};
const boundsOf=pos=>{const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(let i=0;i<pos.length;i++){const a=i%3;if(pos[i]<lo[a])lo[a]=pos[i];if(pos[i]>hi[a])hi[a]=pos[i];}return [lo,hi];};
const add=(id,positions,normals,indices)=>parts.push({id,vertexCount:positions.length/3,indexCount:indices.length,bounds:boundsOf(positions),positions:push(positions),normals:push(normals),indices:push(indices)});

const read=id=>{
 const p=bodyPart(id),b=chunk(p.chunk);
 return {positions:new Float32Array(b.buffer.slice(b.byteOffset+p.positions,b.byteOffset+p.positions+p.vertexCount*12)),
  normals:new Int16Array(b.buffer.slice(b.byteOffset+p.normals,b.byteOffset+p.normals+p.vertexCount*6)),
  indices:new Uint32Array(b.buffer.slice(b.byteOffset+p.indices,b.byteOffset+p.indices+p.indexCount*4))};
};
const orbit=[];
for(const id of ORBIT_IDS){
 const pieces=[id,...(MERGE[id]??[])].map(read);
 if(pieces.length===1){orbit.push({id,...pieces[0]});continue;}
 const count=pieces.reduce((n,p)=>n+p.positions.length,0),positions=new Float32Array(count),normals=new Int16Array(count),indices=new Uint32Array(pieces.reduce((n,p)=>n+p.indices.length,0));
 let v=0,i=0;
 for(const p of pieces){positions.set(p.positions,v);normals.set(p.normals,v);for(const x of p.indices)indices[i++]=x+v/3;v+=p.positions.length;}
 orbit.push({id,positions,normals,indices});
}

// ---- detailed globe
let glb;
if(process.argv[2])glb=fs.readFileSync(process.argv[2]);
else{const response=await fetch(GLOBE_URL);if(!response.ok)throw new Error('Globe download failed: '+response.status);glb=Buffer.from(await response.arrayBuffer());}
const sha=crypto.createHash('sha256').update(glb).digest('hex');
if(sha!==GLOBE_SHA256)throw new Error('Globe source differs from the pinned release (sha256 '+sha+')');
const jsonLength=glb.readUInt32LE(12),gltf=JSON.parse(glb.subarray(20,20+jsonLength).toString()),binary=glb.subarray(20+jsonLength+8);
if(gltf.extensionsRequired?.length)throw new Error('Unsupported glTF extensions: '+gltf.extensionsRequired);
const COMPONENT={5121:Uint8Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};
const accessor=i=>{
 const a=gltf.accessors[i],view=gltf.bufferViews[a.bufferView],size={SCALAR:1,VEC3:3}[a.type],Type=COMPONENT[a.componentType];
 const stride=view.byteStride??size*Type.BYTES_PER_ELEMENT,start=(view.byteOffset??0)+(a.byteOffset??0),result=new Type(a.count*size);
 const data=new DataView(binary.buffer,binary.byteOffset+start,stride*(a.count-1)+size*Type.BYTES_PER_ELEMENT);
 const read={5121:(o)=>data.getUint8(o),5123:(o)=>data.getUint16(o,true),5125:(o)=>data.getUint32(o,true),5126:(o)=>data.getFloat32(o,true)}[a.componentType];
 for(let i=0;i<a.count;i++)for(let c=0;c<size;c++)result[i*size+c]=read(i*stride+c*Type.BYTES_PER_ELEMENT);
 return result;
};
const globe=[];
for(const node of gltf.nodes){
 if(node.mesh===undefined)continue;
 if(node.matrix||node.translation||node.rotation||node.scale)throw new Error('Unexpected node transform on '+node.name);
 const primitives=gltf.meshes[node.mesh].primitives;if(primitives.length!==1)throw new Error('Unexpected primitives on '+node.name);
 globe.push({name:node.name,positions:accessor(primitives[0].attributes.POSITION),indices:Uint32Array.from(accessor(primitives[0].indices))});
}
const boxCenter=([lo,hi])=>lo.map((v,i)=>(v+hi[i])/2);
const source=name=>{const g=globe.find(x=>x.name===name);if(!g)throw new Error('Globe source has no '+name);return boundsOf(g.positions);};
const sSclera=source('VH_M_sclera_L'),sCornea=source('VH_M_cornea_L'),sDisc=source('VH_M_optic_disc_L');
const bSclera=bodyPart(BODY_SCLERA).bounds,bCornea=bodyPart(BODY_CORNEA).bounds;
// Both models face +Z with +Y up, so registration is a uniform scale, an optional left-right mirror and a translation.
const sAxis=boxCenter(sCornea).map((v,i)=>v-boxCenter(sSclera)[i]),bAxis=boxCenter(bCornea).map((v,i)=>v-boxCenter(bSclera)[i]);
for(const axis of [sAxis,bAxis])if(axis[2]/Math.hypot(...axis)<.99)throw new Error('An eyeball does not face +Z; registration needs a rotation');
const sLength=sCornea[1][2]-sSclera[0][2],bLength=bCornea[1][2]-bSclera[0][2],scale=bLength/sLength;
const sCenter=[boxCenter(sSclera)[0],boxCenter(sSclera)[1],(sCornea[1][2]+sSclera[0][2])/2];
const bCenter=[boxCenter(bSclera)[0],boxCenter(bSclera)[1],(bCornea[1][2]+bSclera[0][2])/2];
// The optic disc lies on the nasal side: toward the midline (x = 0) in the body atlas.
const discSide=Math.sign(boxCenter(sDisc)[0]-sCenter[0]),nasal=-Math.sign(bCenter[0]),mirror=discSide===nasal?1:-1;
const vertexNormals=(positions,indices)=>{
 // Area-weighted vertex normals.
 const sum=new Float64Array(positions.length);
 for(let i=0;i<indices.length;i+=3){
  const [a,b,c]=[indices[i]*3,indices[i+1]*3,indices[i+2]*3];
  const ux=positions[b]-positions[a],uy=positions[b+1]-positions[a+1],uz=positions[b+2]-positions[a+2],vx=positions[c]-positions[a],vy=positions[c+1]-positions[a+1],vz=positions[c+2]-positions[a+2];
  const n=[uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx];
  for(const v of [a,b,c])for(let k=0;k<3;k++)sum[v+k]+=n[k];
 }
 const normals=new Int16Array(positions.length);
 for(let i=0;i<sum.length;i+=3){const length=Math.hypot(sum[i],sum[i+1],sum[i+2])||1;for(let k=0;k<3;k++)normals[i+k]=Math.round(sum[i+k]/length*32767);}
 return normals;
};
const registered=new Map(),globeParts=[];
let globeTriangles=0,sourceTriangles=0;
for(const g of globe){
 // Weld coincident vertices, then simplify. Thin shells keep more of their triangles.
 const map=new Map(),remap=new Uint32Array(g.positions.length/3),welded=[];
 for(let i=0;i<remap.length;i++){const k=`${g.positions[i*3]},${g.positions[i*3+1]},${g.positions[i*3+2]}`;let n=map.get(k);if(n===undefined){n=welded.length/3;map.set(k,n);welded.push(g.positions[i*3],g.positions[i*3+1],g.positions[i*3+2]);}remap[i]=n;}
 const pos=new Float32Array(welded),indices=Uint32Array.from(g.indices,i=>remap[i]);
 const target=Math.max(600,Math.floor(Math.min(indices.length*.3,36000)/3)*3);
 const [simplified]=MeshoptSimplifier.simplify(indices,pos,3,Math.min(indices.length,target),.004);
 const [compact,count]=MeshoptSimplifier.compactMesh(simplified);
 const positions=new Float32Array(count*3);
 for(let old=0;old<compact.length;old++){const n=compact[old];if(n===0xffffffff)continue;
  positions[n*3]=(pos[old*3]-sCenter[0])*scale*mirror+bCenter[0];positions[n*3+1]=(pos[old*3+1]-sCenter[1])*scale+bCenter[1];positions[n*3+2]=(pos[old*3+2]-sCenter[2])*scale+bCenter[2];}
 if(mirror<0)for(let i=0;i<simplified.length;i+=3){const t=simplified[i+1];simplified[i+1]=simplified[i+2];simplified[i+2]=t;}
 const normals=vertexNormals(positions,simplified);
 registered.set(g.name,positions);
 globeParts.push({id:g.name,positions,normals,indices:simplified});globeTriangles+=simplified.length/3;sourceTriangles+=g.indices.length/3;
}

const round=v=>+v.toFixed(6);

// ---- fit the orbit onto the registered globe
// The body muscles and optic nerve were modelled around the simpler body eyeball. Three corrections, all near the globe only:
//   1. vertices that dip below the scleral surface are lifted back onto it;
//   2. the tendons of the four rectus muscles are drawn back so that they end at their distances behind the corneal margin
//      (medial 5.5 mm, inferior 6.5 mm, lateral 6.9 mm, superior 7.7 mm);
//   3. the front end of the optic nerve is bent, over its last 14 mm, to meet the optic disc.
const MM=.001,center=bCenter;
const surface=[registered.get('VH_M_sclera_L'),registered.get('VH_M_cornea_L')];
// Radius of the outer surface of the globe by direction (2 degree bins, empty bins take the nearest filled one).
const BINS=[90,180],radius=new Float32Array(BINS[0]*BINS[1]);
const bin2=(x,y,z)=>{const r=Math.hypot(x,y,z)||1,lat=Math.min(BINS[0]-1,Math.floor(Math.acos(Math.max(-1,Math.min(1,z/r)))/Math.PI*BINS[0])),lon=Math.min(BINS[1]-1,Math.floor((Math.atan2(y,x)+Math.PI)/(2*Math.PI)*BINS[1]));return lat*BINS[1]+lon;};
for(const pos of surface)for(let i=0;i<pos.length;i+=3){const x=pos[i]-center[0],y=pos[i+1]-center[1],z=pos[i+2]-center[2],b=bin2(x,y,z),r=Math.hypot(x,y,z);if(r>radius[b])radius[b]=r;}
for(let pass=0;pass<12&&radius.some(r=>!r);pass++){const next=radius.slice();for(let lat=0;lat<BINS[0];lat++)for(let lon=0;lon<BINS[1];lon++){const b=lat*BINS[1]+lon;if(radius[b])continue;let sum=0,n=0;for(const [dl,dn] of [[-1,0],[1,0],[0,-1],[0,1]]){const l=lat+dl;if(l<0||l>=BINS[0])continue;const r=radius[l*BINS[1]+(lon+dn+BINS[1])%BINS[1]];if(r){sum+=r;n++;}}if(n)next[b]=sum/n;}radius.set(next);}
const surfaceRadius=(x,y,z)=>radius[bin2(x,y,z)];
const limbus=registered.get('VH_M_corneo_scleral_junction_L');let limbusAngle=0;
for(let i=0;i<limbus.length;i+=3)limbusAngle+=Math.atan2(Math.hypot(limbus[i]-center[0],limbus[i+1]-center[1]),limbus[i+2]-center[2]);limbusAngle/=limbus.length/3;
const RECTUS={FJ1308:5.5,FJ1295:6.5,FJ1304:6.9,FJ1323:7.7};// medial, inferior, lateral, superior: distance behind the corneal margin, mm
const ON_GLOBE=['FJ1323','FJ1295','FJ1308','FJ1304','FJ1322','FJ1294','FJ1306'],CLEARANCE=.3*MM,TENDON=4*MM,SPREAD=4*MM;
const fitted={};
for(const part of orbit){
 const pos=part.positions;let changed=0;
 if(RECTUS[part.id]){
  // Arc distance behind the corneal margin of every vertex that lies on the globe.
  const arc=new Float32Array(pos.length/3).fill(Infinity);let first=Infinity;
  for(let i=0;i<pos.length;i+=3){const x=pos[i]-center[0],y=pos[i+1]-center[1],z=pos[i+2]-center[2],r=Math.hypot(x,y,z),rs=surfaceRadius(x,y,z);if(r-rs>TENDON)continue;const s=(Math.atan2(Math.hypot(x,y),z)-limbusAngle)*rs;arc[i/3]=s;if(s<first)first=s;}
  const target=RECTUS[part.id]*MM;
  if(first<target){
   const end=target+SPREAD;
   for(let i=0;i<pos.length;i+=3){const s=arc[i/3];if(s>=end)continue;
    const moved=target+(s-first)/(end-first)*SPREAD,x=pos[i]-center[0],y=pos[i+1]-center[1],z=pos[i+2]-center[2],r=Math.hypot(x,y,z),rho=Math.hypot(x,y)||1e-9;
    // the arc is measured with the local radius, so settle the angle in a few steps
    let theta=Math.atan2(rho,z)+(moved-s)/surfaceRadius(x,y,z);
    for(let k=0;k<4;k++)theta=limbusAngle+moved/surfaceRadius(x/rho*Math.sin(theta),y/rho*Math.sin(theta),Math.cos(theta));
    const nx=x/rho*Math.sin(theta),ny=y/rho*Math.sin(theta),nz=Math.cos(theta);
    // keep the height above the surface it had
    const height=r-surfaceRadius(x,y,z),rr=surfaceRadius(nx,ny,nz)+height;
    pos[i]=center[0]+nx*rr;pos[i+1]=center[1]+ny*rr;pos[i+2]=center[2]+nz*rr;changed++;}
  }
  fitted[part.id]={insertionMm:RECTUS[part.id],was:+(first/MM).toFixed(1)};
 }
 if(ON_GLOBE.includes(part.id)){
  // Lift by direction, not by vertex: every vertex in a 4 degree patch rises by what its lowest vertex needs, so a thin tendon keeps its thickness.
  const LB=[45,90],need=new Float32Array(LB[0]*LB[1]);
  const lb=(x,y,z)=>{const r=Math.hypot(x,y,z)||1;return [Math.min(LB[0]-1,Math.floor(Math.acos(Math.max(-1,Math.min(1,z/r)))/Math.PI*LB[0])),Math.min(LB[1]-1,Math.floor((Math.atan2(y,x)+Math.PI)/(2*Math.PI)*LB[1]))];};
  for(let i=0;i<pos.length;i+=3){const x=pos[i]-center[0],y=pos[i+1]-center[1],z=pos[i+2]-center[2],gap=surfaceRadius(x,y,z)+CLEARANCE-Math.hypot(x,y,z);if(gap<=0)continue;const [la,lo]=lb(x,y,z);if(gap>need[la*LB[1]+lo])need[la*LB[1]+lo]=gap;}
  // Spread each patch's rise over its neighbours, then read it smoothly between patch centres so the surface gets no steps.
  const wide=new Float32Array(need.length);
  for(let la=0;la<LB[0];la++)for(let lo=0;lo<LB[1];lo++){let m=0;for(let a=-1;a<=1;a++)for(let o=-1;o<=1;o++){const l=la+a;if(l<0||l>=LB[0])continue;m=Math.max(m,need[l*LB[1]+(lo+o+LB[1])%LB[1]]);}wide[la*LB[1]+lo]=m;}
  const riseAt=(x,y,z)=>{const r=Math.hypot(x,y,z)||1,fa=Math.acos(Math.max(-1,Math.min(1,z/r)))/Math.PI*LB[0]-.5,fo=(Math.atan2(y,x)+Math.PI)/(2*Math.PI)*LB[1]-.5,a0=Math.floor(fa),o0=Math.floor(fo),ta=fa-a0,to=fo-o0;
   const at=(a,o)=>wide[Math.max(0,Math.min(LB[0]-1,a))*LB[1]+(o+LB[1])%LB[1]];
   return (at(a0,o0)*(1-to)+at(a0,o0+1)*to)*(1-ta)+(at(a0+1,o0)*(1-to)+at(a0+1,o0+1)*to)*ta;};
  let lifted=0;
  for(let i=0;i<pos.length;i+=3){
   const x=pos[i]-center[0],y=pos[i+1]-center[1],z=pos[i+2]-center[2],r=Math.hypot(x,y,z);if(r<1e-9||r-surfaceRadius(x,y,z)>TENDON)continue;
   const rise=riseAt(x,y,z);
   if(rise<1e-6)continue;const k=(r+rise)/r;pos[i]=center[0]+x*k;pos[i+1]=center[1]+y*k;pos[i+2]=center[2]+z*k;lifted++;
  }
  if(lifted){changed+=lifted;(fitted[part.id]??={}).lifted=lifted;}
 }
 if(part.id==='FJ1313'){
  const disc=boxCenter(boundsOf(registered.get('VH_M_optic_disc_L')));
  const order=[...Array(pos.length/3).keys()].sort((a,b)=>pos[b*3+2]-pos[a*3+2]).slice(0,15),head=[0,1,2].map(k=>order.reduce((n,v)=>n+pos[v*3+k],0)/order.length);
  const shift=disc.map((v,k)=>v-head[k]),REACH=14*MM;
  for(let i=0;i<pos.length;i+=3){const d=Math.hypot(pos[i]-head[0],pos[i+1]-head[1],pos[i+2]-head[2]);if(d>=REACH)continue;const t=1-d/REACH,w=t*t*(3-2*t);for(let k=0;k<3;k++)pos[i+k]+=shift[k]*w;changed++;}
  fitted[part.id]={headShiftMm:+(Math.hypot(...shift)/MM).toFixed(1)};
 }
 if(changed)part.normals=vertexNormals(pos,part.indices);
}

// ---- infraorbital nerve: the source has no model of it, so it is built here as a tube along the course given by the bones (schematic).
//   It enters the orbit through the inferior orbital fissure, runs forward on the floor of the orbit (infraorbital groove), sinks into
//   the maxilla (infraorbital canal) and comes out on the face at the infraorbital foramen, about 1 cm below the infraorbital margin
//   on the vertical line of the supraorbital notch, where it spreads into inferior palpebral, nasal and superior labial branches.
const INFRAORBITAL='infraorbital-nerve';
let infraorbitalExit;
{
 const bone=id=>orbit.find(p=>p.id===id),tris=[];
 for(const id of ['FJ3269','FJ3287']){const b=bone(id),pos=b.positions,ix=b.indices,v=i=>[pos[i*3],pos[i*3+1],pos[i*3+2]];for(let i=0;i<ix.length;i+=3)tris.push([v(ix[i]),v(ix[i+1]),v(ix[i+2])]);}
 const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
 // distance along the ray to the first triangle of the maxilla or zygomatic bone, or null
 const hit=(o,d)=>{let best=null;for(const [p,q,r] of tris){const e1=sub(q,p),e2=sub(r,p),h=cross(d,e2),det=dot(e1,h);if(Math.abs(det)<1e-15)continue;const t0=sub(o,p),u=dot(t0,h)/det;if(u<0||u>1)continue;const w=cross(t0,e1),v=dot(d,w)/det;if(v<0||u+v>1)continue;const t=dot(e2,w)/det;if(t>0&&(best===null||t<best))best=t;}return best;};
 const C=center,nasalX=-Math.sign(C[0])||-1,at=(x,y,z)=>[C[0]+nasalX*x*MM,C[1]+y*MM,C[2]+z*MM];// x: mm toward the nose, y: up, z: forward, from the centre of the globe
 const floorY=(x,z)=>{const o=at(x,-4,z),t=hit(o,[0,-1,0]);if(t===null)throw new Error('Infraorbital nerve: no orbital floor under the course');return (o[1]-t-C[1])/MM;};
 const frontZ=(x,y)=>{const o=at(x,y,60),t=hit(o,[0,0,-1]);if(t===null)throw new Error('Infraorbital nerve: no front of the maxilla on the course');return (o[2]-t-C[2])/MM;};
 // the supraorbital notch gives the vertical line; the infraorbital margin is the highest point of the front of the maxilla on it
 const supra=orbit.find(p=>p.id==='FJ1325').positions;let sx=0,n=0,zMax=-Infinity;for(let i=2;i<supra.length;i+=3)zMax=Math.max(zMax,supra[i]);
 for(let i=0;i<supra.length;i+=3)if(supra[i+2]>zMax-6*MM){sx+=supra[i];n++;}
 const lineX=(sx/n-C[0])/MM*nasalX;
 let marginY=null;for(let y=-8;y>-30;y-=.5){const o=at(lineX,y,60),t=hit(o,[0,0,-1]);if(t!==null&&(o[2]-t-C[2])/MM>4){marginY=y;break;}}
 if(marginY===null)throw new Error('Infraorbital nerve: infraorbital margin not found');
 const exitY=marginY-10,exitZ=frontZ(lineX,exitY),exit=[lineX,exitY,exitZ+.6];
 // start: the inferior orbital fissure behind the floor; then the groove on the floor, the canal under it, and the foramen
 const groove=[[-18,2.4],[-13,1.4],[-8,.8]].map(([z,dx])=>[lineX+dx,floorY(lineX+dx,z)+.7,z]);
 const last=groove[groove.length-1],canal=[.3,.62].map(t=>[last[0]+(exit[0]-last[0])*t,last[1]+(exit[1]-last[1])*t*t-1.2*Math.sin(Math.PI*t),last[2]+(exit[2]-last[2])*t]);
 infraorbitalExit=at(...exit);
 const tube=(points,r0,r1)=>{
  // Catmull-Rom through the points, about 1 mm apart, then rings of 8 vertices on parallel-transported frames
  const P=[points[0],...points,points[points.length-1]],path=[];
  for(let i=1;i<P.length-2;i++){const len=Math.hypot(...sub(P[i+1],P[i])),steps=Math.max(2,Math.round(len));for(let s=0;s<steps;s++){const t=s/steps,t2=t*t,t3=t2*t;path.push([0,1,2].map(k=>.5*(2*P[i][k]+(-P[i-1][k]+P[i+1][k])*t+(2*P[i-1][k]-5*P[i][k]+4*P[i+1][k]-P[i+2][k])*t2+(-P[i-1][k]+3*P[i][k]-3*P[i+1][k]+P[i+2][k])*t3)));}}
  path.push(points[points.length-1]);
  const SIDES=8,pos=[],idx=[],unit=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l);};
  let normal=null;
  path.forEach((p,i)=>{
   const tangent=unit(sub(path[Math.min(i+1,path.length-1)],path[Math.max(i-1,0)]));
   if(!normal){normal=unit(cross(tangent,Math.abs(tangent[1])<.9?[0,1,0]:[1,0,0]));}
   else{const d=dot(normal,tangent);normal=unit(normal.map((v,k)=>v-tangent[k]*d));}
   const binormal=cross(tangent,normal),r=r0+(r1-r0)*i/(path.length-1);
   for(let k=0;k<SIDES;k++){const a=k/SIDES*Math.PI*2,c=Math.cos(a)*r,sn=Math.sin(a)*r;pos.push(p[0]+normal[0]*c+binormal[0]*sn,p[1]+normal[1]*c+binormal[1]*sn,p[2]+normal[2]*c+binormal[2]*sn);}
   if(i)for(let k=0;k<SIDES;k++){const a=(i-1)*SIDES+k,b=(i-1)*SIDES+(k+1)%SIDES,c2=i*SIDES+k,d2=i*SIDES+(k+1)%SIDES;idx.push(a,b,c2,b,d2,c2);}
  });
  // closed ends
  for(const [ring,p,flip] of [[0,path[0],true],[(path.length-1)*SIDES,path[path.length-1],false]]){const centre=pos.length/3;pos.push(...p);for(let k=0;k<SIDES;k++){const a=ring+k,b=ring+(k+1)%SIDES;idx.push(...(flip?[centre,b,a]:[centre,a,b]));}}
  return {pos,idx};
 };
 // the fissure end: behind, below and a little to the nasal side of the back of the groove, in the gap between the sphenoid and the maxilla
 const first=groove[0],start=[first[0]+3.5,first[1]-4.5,first[2]-8.5];
 const pieces=[tube([start,...groove,...canal,exit],1.15,1.05)];
 // branches on the face, 1 mm in front of the bone: inferior palpebral (up), external and internal nasal (toward the nose), superior labial (down)
 const onFace=(x,y)=>[x,y,frontZ(x,y)+1];
 for(const [targets,r] of [[[[lineX-.5,exitY+4],[lineX-1.5,exitY+8.5]],.55],[[[lineX+1.5,exitY+3.5],[lineX+3,exitY+8]],.5],[[[lineX+4,exitY+1],[lineX+8.5,exitY+2.5]],.55],[[[lineX+4,exitY-2],[lineX+8,exitY-5]],.5],[[[lineX+.5,exitY-5],[lineX+1.5,exitY-10.5]],.6],[[[lineX-2,exitY-4.5],[lineX-3.5,exitY-10]],.55]])
  pieces.push(tube([exit,...targets.map(t=>onFace(...t))],r+.2,r*.7));
 const count=pieces.reduce((m,q)=>m+q.pos.length,0),positions=new Float32Array(count),indices=new Uint32Array(pieces.reduce((m,q)=>m+q.idx.length,0));
 let v=0,i=0;for(const q of pieces){for(let k=0;k<q.pos.length;k+=3){const w=at(q.pos[k],q.pos[k+1],q.pos[k+2]);positions.set(w,v+k);}for(const x of q.idx)indices[i++]=x+v/3;v+=q.pos.length;}
 orbit.push({id:INFRAORBITAL,positions,normals:vertexNormals(positions,indices),indices});
 fitted[INFRAORBITAL]={built:'tube along the orbital floor and through the maxilla',marginToForamenMm:10,lineOfSupraorbitalNotchMm:+lineX.toFixed(1)};
}
for(const part of [...orbit,...globeParts])add(part.id,part.positions,part.normals,part.indices);

// ---- openings of the orbit, marked on the bone surface (no extra geometry): for each opening, the vertices of the bones around it.
//   optic canal               where the optic nerve is enclosed by the sphenoid;
//   superior orbital fissure  where the nerves that use it pass through the sphenoid (oculomotor branches, trochlear, frontal, lacrimal, nasociliary);
//   inferior orbital fissure  the gap between the sphenoid and the maxilla behind and below the globe.
const partOf=id=>orbit.find(p=>p.id===id),pointsOf=id=>{const pos=partOf(id).positions,list=[];for(let i=0;i<pos.length;i+=3)list.push([pos[i],pos[i+1],pos[i+2]]);return list;};
const SPHENOID='FJ3394',MAXILLA='FJ3269',sphenoid=pointsOf(SPHENOID),maxilla=pointsOf(MAXILLA),gap=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
// A point is "enclosed" when bone lies within 5 mm on opposite sides of it: the unit directions to the nearby bone vertices nearly cancel.
const enclosed=q=>{const mean=[0,0,0];let n=0;for(const p of sphenoid){const d=gap(p,q);if(d>=5*MM||d===0)continue;n++;for(let k=0;k<3;k++)mean[k]+=(p[k]-q[k])/d;}return n>=5&&Math.hypot(...mean)/n<.55;};
const through=ids=>ids.flatMap(id=>pointsOf(id).filter(enclosed));
const around=(bone,points,radius)=>{const picked=[];bone.forEach((p,i)=>{if(points.some(q=>gap(p,q)<radius))picked.push(i);});return picked;};
const canalPoints=through(['FJ1313']),fissurePoints=through(['FJ1321','FJ1293','FJ1330','FJ1290','FJ1300','FJ1310']);
const canal=around(sphenoid,canalPoints,4.5*MM),canalSet=new Set(canal);
// A vertex between the two openings goes to the one whose contents are nearer.
const nearest=(p,points)=>Math.min(...points.map(q=>gap(p,q)));
const fissure=around(sphenoid,fissurePoints,3.5*MM).filter(i=>!canalSet.has(i)||nearest(sphenoid[i],fissurePoints)<nearest(sphenoid[i],canalPoints));
const fissureSet=new Set(fissure),canalOnly=canal.filter(i=>!fissureSet.has(i));
const lowerSphenoid=[],lowerMaxilla=new Set();
sphenoid.forEach((p,i)=>{
 if(gap(p,center)>45*MM||p[2]>center[2])return;
 let best=Infinity,at=-1;maxilla.forEach((q,j)=>{const d=gap(p,q);if(d<best){best=d;at=j;}});
 if(best>1.5*MM&&best<9*MM){lowerSphenoid.push(i);lowerMaxilla.add(at);}
});
const centerOf=(bone,indices)=>[0,1,2].map(k=>round(indices.reduce((n,i)=>n+bone[i][k],0)/(indices.length||1)));
const openings=[
 {id:'optic-canal',center:centerOf(sphenoid,canalOnly),bones:{[SPHENOID]:canalOnly}},
 {id:'superior-orbital-fissure',center:centerOf(sphenoid,fissure),bones:{[SPHENOID]:fissure}},
 {id:'inferior-orbital-fissure',center:centerOf(sphenoid,lowerSphenoid),bones:{[SPHENOID]:lowerSphenoid,[MAXILLA]:[...lowerMaxilla].sort((a,b)=>a-b)}},
];
// Foramina located by the nerve that uses them (the model has no nerve through the infraorbital foramen, so it is not marked):
//   supraorbital foramen (notch)       where the supraorbital nerve leaves the orbit under the supraorbital margin of the frontal bone;
//   anterior / posterior ethmoidal foramen   where the nerve of the same name reaches the medial wall, between the frontal and ethmoid bones.
const FRONTAL='FJ3200',ETHMOID='FJ3199',frontal=pointsOf(FRONTAL),ethmoid=pointsOf(ETHMOID);
const marked=(id,points,radius)=>{
 const bones={};
 for(const [bone,list] of [[FRONTAL,frontal],[ETHMOID,ethmoid]]){const picked=around(list,points,radius);if(picked.length)bones[bone]=picked;}
 const all=Object.entries(bones).flatMap(([bone,list])=>list.map(i=>(bone===FRONTAL?frontal:ethmoid)[i]));
 return {id,center:[0,1,2].map(k=>round(all.reduce((n,q)=>n+q[k],0)/(all.length||1))),bones};
};
// the supraorbital nerve runs forward under the orbital roof and turns up over the margin: its exit is the lowest part of its most anterior 6 mm
const supra=pointsOf('FJ1325'),front=Math.max(...supra.map(q=>q[2])),leaving=supra.filter(q=>q[2]>front-6*MM),low=Math.min(...leaving.map(q=>q[1]));
openings.push(marked('supraorbital-foramen',leaving.filter(q=>q[1]<low+3*MM),4*MM));
// the ethmoidal nerves run medially from the nasociliary nerve: the foramen is at their medial end
const medialEnd=id=>{const list=pointsOf(id),side=Math.sign(center[0])||1,edge=side>0?Math.min(...list.map(q=>q[0])):Math.max(...list.map(q=>q[0]));return list.filter(q=>Math.abs(q[0]-edge)<2*MM);};
// the infraorbital foramen: the maxilla around the point where the built nerve comes out
{const picked=around(maxilla,[infraorbitalExit],5*MM);openings.push({id:'infraorbital-foramen',center:infraorbitalExit.map(round),bones:{[MAXILLA]:picked}});}
openings.push(marked('anterior-ethmoidal-foramen',medialEnd('FJ1283'),4.5*MM),marked('posterior-ethmoidal-foramen',medialEnd('FJ1315'),4.5*MM));
for(const o of openings)if(!Object.keys(o.bones).length||Object.values(o.bones).reduce((n,list)=>n+list.length,0)<8)throw new Error(`Opening ${o.id} was not found on the bone`);

const bin=Buffer.concat(segments),gz=gzipSync(bin,{level:9});
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(new URL('eye-atlas.bin.gz',out),gz);
fs.writeFileSync(new URL('eye-atlas.json',out),JSON.stringify({
 side:'left',bytes:bin.length,gzip:'models/eye/eye-atlas.bin.gz',gzipBytes:gz.length,
 // Globe frame in package coordinates: centre, anterior direction of the optical axis and axial length.
 globe:{center:bCenter.map(round),axis:[0,0,1],length:round(bLength)},
 fitted,
 openings,
 sources:{orbit:'BodyParts3D 4.0',globe:{name:'Human Reference Atlas, 3D Reference Object Library, eye-male-left v1.3',url:GLOBE_URL,sha256:GLOBE_SHA256,sourceTriangles,triangles:globeTriangles,scale:round(scale),mirrored:mirror<0}},
 parts,
}));
console.log(`eye-atlas: ${parts.length} parts (${ORBIT_IDS.length} orbit, ${globe.length} globe), globe ${sourceTriangles} -> ${globeTriangles} triangles, scale ${scale.toFixed(4)}, mirrored ${mirror<0}, ${(bin.length/1e6).toFixed(2)} MB (${(gz.length/1e6).toFixed(2)} MB gzip)`);
