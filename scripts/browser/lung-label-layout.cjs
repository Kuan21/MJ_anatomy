// Label layout check of the lung view with longer text (production build + vite preview): letter-spacing is widened by `stress` px to stand in for wider system fonts.
// usage: NODE_PATH=<playwright modules> node lung-label-layout.cjs <port> <outDir> <tag> [stress px]
const {chromium}=require('playwright');
const fs=require('fs');
const [port='5713',out='/tmp/lungedge',tag='x',stress='0.6']=process.argv.slice(2);
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1330,height:900}});p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);
 await p.waitForSelector('.detail-atlas-shortcuts',{timeout:240000});
 await p.waitForTimeout(60000);
 await p.mouse.move(5,5);
 await p.locator('.detail-atlas-shortcuts button',{hasText:'肺'}).click();await p.waitForTimeout(3000);
 await p.waitForFunction(()=>{const a=window.__mjView.partsState('lobe of (right|left) lung');return a.length===5&&a.every(x=>x.picker);},null,{timeout:900000,polling:3000});await p.waitForTimeout(5000);
 const real=async s=>{const bx=await p.locator(s).boundingBox();await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 await p.addStyleTag({content:`.part-label .part-label-en,.part-label .part-label-zh{letter-spacing:${stress}px!important}`});
 const settle=async()=>{await p.waitForTimeout(25000);await p.waitForFunction(()=>document.querySelectorAll('.part-label').length>=10,null,{timeout:300000,polling:3000});await p.waitForTimeout(12000);};
 const report=async n=>{const r=await p.evaluate(()=>{const panel=document.querySelector('.lung-focus').getBoundingClientRect();const W=innerWidth;const boxes=[...document.querySelectorAll('.part-label')].filter(x=>x.style.display!=='none');const bad=[];
  const rs=boxes.map(x=>{const r=x.getBoundingClientRect();let tr=r.right;for(const c of x.children){const q=c.getBoundingClientRect();if(!c.classList.contains('part-label-letter')){const range=document.createRange();range.selectNodeContents(c);for(const rc of range.getClientRects())tr=Math.max(tr,rc.right);}}return {k:x.dataset.key,r,textRight:tr};});
  for(const a of rs){if(a.r.right>W-4||a.r.left<0)bad.push(a.k+' offscreen');if(a.r.right>panel.left&&a.r.left<panel.right&&a.r.bottom>panel.top&&a.r.top<panel.bottom)bad.push(a.k+' under-panel');if(a.textRight>a.r.right+0.5)bad.push(a.k+' text-overflows-box '+Math.round(a.textRight-a.r.right)+'px');if(a.textRight>panel.left&&a.r.left<panel.left&&a.r.top<panel.bottom&&a.r.bottom>panel.top)bad.push(a.k+' text-under-panel');}
  for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){const a=rs[i].r,c=rs[j].r;if(a.left<c.right&&c.left<a.right&&a.top<c.bottom&&c.top<a.bottom)bad.push(rs[i].k+'/'+rs[j].k+' overlap');}
  const L=[...document.querySelectorAll('.part-label-lines line')].filter(l=>l.style.display!=='none').map(l=>['x1','y1','x2','y2'].map(a=>+l.getAttribute(a)));
  const o=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);let cross=0;for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],c=L[j];const d1=o(a.slice(0,2),a.slice(2),c.slice(0,2)),d2=o(a.slice(0,2),a.slice(2),c.slice(2)),d3=o(c.slice(0,2),c.slice(2),a.slice(0,2)),d4=o(c.slice(0,2),c.slice(2),a.slice(2));if(d1*d2<0&&d3*d4<0)cross++;}
  return {n:rs.length,W,panel:[panel.left,panel.right],crossings:cross,bad};});console.log('layout',n,JSON.stringify(r));};
 const shot=async n=>{await p.waitForTimeout(2500);await p.screenshot({path:`${out}/${tag}-${n}.png`});console.log('shot',n);};
 await real('.lung-focus-sides button:nth-child(2)');await p.waitForTimeout(5000);await real('.lung-focus [aria-label="名稱標籤"]');await settle();
 await shot('left-1330');await report('left-1330');
 await p.setViewportSize({width:768,height:900});await p.waitForTimeout(25000);await shot('left-768');await report('left-768');
 await p.setViewportSize({width:1330,height:900});await p.waitForTimeout(8000);
 await real('.lung-focus-sides button:nth-child(3)');await settle();await shot('right-1330');await report('right-1330');
 await b.close();
})().catch(e=>{console.log('FAIL',e.message);process.exit(1);});
