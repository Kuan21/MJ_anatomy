// Source-surface landmarks, replacing whole-shaft bounding-box endpoints.
// Educational joint centres, not patient-specific measured kinematics.
import fs from 'node:fs';
const atlas=JSON.parse(fs.readFileSync('public/models/atlas.json')),sides={};
function source(name){const p=atlas.parts.find(p=>p.name===name),b=fs.readFileSync('public'+atlas.chunks[p.chunk].url);return {part:p,points:Array.from({length:p.vertexCount},(_,i)=>[...new Float32Array(b.buffer,b.byteOffset+p.positions+i*12,3)])};}
function mean(points){return points.reduce((sum,p)=>sum.map((v,k)=>v+p[k]/points.length),[0,0,0]);}
for(const side of ['left','right']){
 const cap=side[0].toUpperCase()+side.slice(1),radius=source(cap+' radius'),ulna=source(cap+' ulna'),lunate=source(cap+' lunate'),scaphoid=source(cap+' scaphoid');
 const radialHead=mean(radius.points.filter(p=>p[1]>radius.part.bounds[1][1]-.005));
 // Distal ulnar head patch just proximal to the styloid extremity.
 const ulnarHead=mean(ulna.points.filter(p=>p[1]>ulna.part.bounds[0][1]+.004&&p[1]<ulna.part.bounds[0][1]+.014));
 const patches=[];
 for(const carpal of [lunate,scaphoid]){
  const candidates=carpal.points.map(p=>{let nearest=null,d=Infinity;for(const q of radius.points){const d2=p.reduce((sum,v,k)=>sum+(v-q[k])**2,0);if(d2<d){d=d2;nearest=q;}}return {d:Math.sqrt(d),mid:p.map((v,k)=>(v+nearest[k])/2)};});
  const min=Math.min(...candidates.map(p=>p.d));patches.push(mean(candidates.filter(p=>p.d<=min+.0015).map(p=>p.mid)));
 }
 const wrist=mean(patches);
 sides[side]={radiusId:radius.part.id,ulnaId:ulna.part.id,radialHead,ulnarHead,wrist};
 console.log(side,sides[side]);
}
fs.writeFileSync('app/biomechanics-v2/forearm-landmarks.json',JSON.stringify({method:'Radial head superior 5 mm surface; distal ulnar head patch 4–14 mm proximal to styloid; equal-weight scaphoid/lunate closest radial contact patch centres. Approximate rigid-joint model.',sides},null,2)+'\n');
