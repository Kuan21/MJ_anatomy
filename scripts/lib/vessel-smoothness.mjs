// Vessel smoothness metric (the faceted / segmented-vessel check). For one mesh {positions, indices, normals} (as scripts/lib/viewer-atlas.mjs returns it) it reports, welded by position:
//   share25  share of interior edges whose two faces differ by more than 25 degrees (dihedral): faceting of the surface
//   max, med largest and median dihedral (a closed n-sided prism has 360/n on its ring edges)
//   sides    cross-section polygon estimate = 360 / median of the dihedral angles between 10 and 100 degrees: 5-8 = visibly faceted prism, 12 or more reads as round
//   seam25   share of triangle corners whose stored vertex normal differs by more than 25 degrees from the face normal (flat-shaded look)
//   kink25   share of centreline steps (>= 1.5 mm of arc) that turn by more than 25 degrees (noisy: reported, never gated), kinkMax their largest turn
//   tpcm     triangles per centimetre of bounding-box diagonal (very low = coarse, segmented tube)
export function axisKink({positions:P,indices:I}){
 const nv=P.length/3,map=new Map(),rep=new Uint32Array(nv);
 for(let i=0;i<nv;i++){const k=Math.round(P[i*3]*1e5)+','+Math.round(P[i*3+1]*1e5)+','+Math.round(P[i*3+2]*1e5);let r=map.get(k);if(r===undefined){r=i;map.set(k,r);}rep[i]=r;}
 const adj=new Map();const link=(a,b)=>{if(a===b)return;(adj.get(a)||adj.set(a,new Set()).get(a)).add(b);(adj.get(b)||adj.set(b,new Set()).get(b)).add(a);};
 for(let t=0;t<I.length;t+=3){const a=rep[I[t]],b=rep[I[t+1]],c=rep[I[t+2]];link(a,b);link(b,c);link(c,a);}
 const bfs=s=>{const d=new Map([[s,0]]),q=[s];let last=s;for(let h=0;h<q.length;h++){const v=q[h];last=v;for(const w of adj.get(v)||[])if(!d.has(w)){d.set(w,d.get(v)+1);q.push(w);}}return {d,last};};
 const first=adj.keys().next().value;if(first===undefined)return {kink25:0,kinkMax:0,layers:0};
 const a=bfs(first).last,{d}=bfs(a),layers=[];
 for(const [v,h] of d){(layers[h]||(layers[h]=[])).push(v);}
 const cs=[];for(const L of layers){if(!L||L.length<2)continue;let x=0,y=0,z=0;for(const v of L){x+=P[v*3];y+=P[v*3+1];z+=P[v*3+2];}cs.push([x/L.length,y/L.length,z/L.length]);}
 // merge centres closer than 1.5 mm along the axis so that ring noise does not read as a kink
 const ax=[];for(const c of cs){const l=ax[ax.length-1];if(!l||Math.hypot(c[0]-l[0],c[1]-l[1],c[2]-l[2])>=.0015)ax.push(c);}
 let n=0,bad=0,max=0;
 for(let i=1;i<ax.length-1;i++){const u=[ax[i][0]-ax[i-1][0],ax[i][1]-ax[i-1][1],ax[i][2]-ax[i-1][2]],w=[ax[i+1][0]-ax[i][0],ax[i+1][1]-ax[i][1],ax[i+1][2]-ax[i][2]];const lu=Math.hypot(...u),lw=Math.hypot(...w);const g=Math.acos(Math.max(-1,Math.min(1,(u[0]*w[0]+u[1]*w[1]+u[2]*w[2])/(lu*lw))))*180/Math.PI;n++;if(g>25)bad++;max=Math.max(max,g);}
 return {kink25:n?bad/n:0,kinkMax:max,layers:ax.length};
}
export function smoothness({positions:P,indices:I,normals:N}){
 const nv=P.length/3,map=new Map(),rep=new Uint32Array(nv);
 for(let i=0;i<nv;i++){const k=Math.round(P[i*3]*1e5)+','+Math.round(P[i*3+1]*1e5)+','+Math.round(P[i*3+2]*1e5);let r=map.get(k);if(r===undefined){r=i;map.set(k,r);}rep[i]=r;}
 const nt=I.length/3,fn=new Float32Array(nt*3),ok=new Uint8Array(nt),edges=new Map();
 for(let t=0;t<nt;t++){const a=I[t*3],b=I[t*3+1],c=I[t*3+2];
  const ux=P[b*3]-P[a*3],uy=P[b*3+1]-P[a*3+1],uz=P[b*3+2]-P[a*3+2],vx=P[c*3]-P[a*3],vy=P[c*3+1]-P[a*3+1],vz=P[c*3+2]-P[a*3+2];
  let x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;const l=Math.hypot(x,y,z);if(l<1e-14)continue;fn[t*3]=x/l;fn[t*3+1]=y/l;fn[t*3+2]=z/l;ok[t]=1;
  const r=[rep[a],rep[b],rep[c]];for(let e=0;e<3;e++){const p=r[e],q=r[(e+1)%3];if(p===q)continue;const k=p<q?p*nv+q:q*nv+p;const o=edges.get(k);if(o===undefined)edges.set(k,t);else if(typeof o==='number')edges.set(k,[o,t]);else o.push(t);}}
 const ang=[];
 for(const v of edges.values()){if(!Array.isArray(v)||v.length!==2)continue;const [s,t]=v;if(!ok[s]||!ok[t])continue;const d=fn[s*3]*fn[t*3]+fn[s*3+1]*fn[t*3+1]+fn[s*3+2]*fn[t*3+2];ang.push(Math.acos(Math.max(-1,Math.min(1,d)))*180/Math.PI);}
 let seam=0,corners=0;
 for(let t=0;t<nt;t++){if(!ok[t])continue;for(let e=0;e<3;e++){const v=I[t*3+e],nx=N[v*3]/32767,ny=N[v*3+1]/32767,nz=N[v*3+2]/32767,l=Math.hypot(nx,ny,nz)||1;const d=(nx*fn[t*3]+ny*fn[t*3+1]+nz*fn[t*3+2])/l;corners++;if(Math.acos(Math.max(-1,Math.min(1,d)))*180/Math.PI>25)seam++;}}
 ang.sort((a,b)=>a-b);const lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];for(let i=0;i<nv;i++)for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],P[i*3+k]);hi[k]=Math.max(hi[k],P[i*3+k]);}
 const ring=ang.filter(a=>a>10&&a<100),sides=ring.length?360/ring[ring.length>>1]:0;const diag=Math.hypot(hi[0]-lo[0],hi[1]-lo[1],hi[2]-lo[2])*100;
 return {...axisKink({positions:P,indices:I}),sides,tris:nt,edges:ang.length,share25:ang.length?ang.filter(a=>a>25).length/ang.length:0,max:ang[ang.length-1]??0,med:ang[ang.length>>1]??0,seam25:corners?seam/corners:0,tpcm:nt/(diag||1)};
}
