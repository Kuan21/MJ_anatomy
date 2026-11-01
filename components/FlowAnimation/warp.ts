import type {Pt} from './types';

/**
 * 三維薄板樣條（核函數 r）變形：用「原型座標 → 網站模型座標」的對應點，把原型裡的路徑、鏡頭目標與標籤錨點平滑地搬到真實人體模型上。
 * 對應點越多、越準，路徑就越貼合真實骨骼；沒有對應點的地方依附近對應點平滑內插／外推。
 */
export function makeWarp(from:Pt[],to:Pt[]):(p:Pt)=>Pt{
 const n=from.length,m=n+4,A:number[][]=Array.from({length:m},()=>new Array(m).fill(0));
 const d=(a:Pt,b:Pt)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
 for(let i=0;i<n;i++){
  for(let j=0;j<n;j++)A[i][j]=d(from[i],from[j]);
  A[i][i]+=1e-6;
  A[i][n]=1;A[i][n+1]=from[i][0];A[i][n+2]=from[i][1];A[i][n+3]=from[i][2];
  A[n][i]=1;A[n+1][i]=from[i][0];A[n+2][i]=from[i][1];A[n+3][i]=from[i][2];
 }
 const sol:number[][]=[];
 for(let k=0;k<3;k++){
  const M=A.map((r,i)=>[...r,i<n?to[i][k]:0]);
  for(let c=0;c<m;c++){
   let piv=c;for(let r=c+1;r<m;r++)if(Math.abs(M[r][c])>Math.abs(M[piv][c]))piv=r;
   [M[c],M[piv]]=[M[piv],M[c]];
   const pv=M[c][c]||1e-12;
   for(let r=c+1;r<m;r++){const f=M[r][c]/pv;if(f===0)continue;for(let q=c;q<=m;q++)M[r][q]-=f*M[c][q];}
  }
  const x=new Array(m).fill(0);
  for(let r=m-1;r>=0;r--){let s=M[r][m];for(let q=r+1;q<m;q++)s-=M[r][q]*x[q];x[r]=s/(M[r][r]||1e-12);}
  sol.push(x);
 }
 return (p:Pt)=>{
  const out:Pt=[0,0,0];
  for(let k=0;k<3;k++){
   const w=sol[k];let v=w[n]+w[n+1]*p[0]+w[n+2]*p[1]+w[n+3]*p[2];
   for(let i=0;i<n;i++)v+=w[i]*d(p,from[i]);
   out[k]=v;
  }
  return out;
 };
}
