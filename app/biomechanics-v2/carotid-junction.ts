// Align existing branch origins to their parent ring without changing vessel radii.
// This is endpoint registration, not a reconstructed bifurcation surface.
const smooth=(t:number)=>{const x=Math.max(0,Math.min(1,t));return x*x*(3-2*x);};
export function joinCarotids(vessels:{name:string;positions:number[]}[]){
 const by=new Map(vessels.map(v=>[v.name,v]));
 for(const [common,internal,external] of [['Left common carotid artery','Internal carotid artery.l','External carotid artery.l'],['Right common carotid artery','Internal carotid artery.r','External carotid artery.r']]){
  const c=by.get(common),branches=[by.get(internal),by.get(external)];if(!c||!branches[0]||!branches[1])continue;
  let top=-Infinity;for(let i=1;i<c.positions.length;i+=3)top=Math.max(top,c.positions[i]);
  const ring=(pos:number[],test:(y:number)=>boolean)=>{let x=0,z=0,n=0;for(let i=0;i<pos.length;i+=3)if(test(pos[i+1])){x+=pos[i];z+=pos[i+2];n++;}return n?[x/n,z/n]:null;};
  const end=ring(c.positions,y=>y>top-.0015);if(!end)continue;
  branches.forEach(b=>{
   if(!b)return;let low=Infinity;for(let i=1;i<b.positions.length;i+=3)low=Math.min(low,b.positions[i]);
   const start=ring(b.positions,y=>y<low+.003);if(!start)return;
   const dx=end[0]-start[0],dz=end[1]-start[1];if(Math.hypot(dx,dz)>.008)return;
   const pos=b.positions.slice();
   for(let i=0;i<pos.length;i+=3){
    const h=pos[i+1]-low,w=1-smooth((h-.003)/.037);pos[i]+=dx*w;pos[i+2]+=dz*w;
   }
   b.positions=pos;
  });
 }
}
