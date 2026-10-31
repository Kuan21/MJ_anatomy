// Screenshots of the lung label view for the edge review (production build + vite preview, software GL, several minutes). Real mouse clicks only.
// usage: NODE_PATH=<playwright modules> node lung-edge-shots.cjs <port> <outDir> <tag>
// Takes: left and right lung medial view with labels and category colours (1500x950), a close-up of the colour patches, and the label layout at 1330x900 and 768x900.
const {chromium}=require('playwright');
const fs=require('fs');
const [port='5713',out='/tmp/lungedge',tag='x']=process.argv.slice(2);
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1500,height:950}});p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);
 await p.waitForSelector('.detail-atlas-shortcuts',{timeout:240000});
 await p.waitForTimeout(60000);
 await p.mouse.move(5,5);
 await p.locator('.detail-atlas-shortcuts button',{hasText:'肺'}).click();await p.waitForTimeout(3000);
 await p.waitForFunction(()=>{const a=window.__mjView.partsState('lobe of (right|left) lung');return a.length===5&&a.every(x=>x.picker);},null,{timeout:900000,polling:3000});await p.waitForTimeout(5000);
 const real=async s=>{const bx=await p.locator(s).boundingBox();await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 const shot=async(n,clip)=>{await p.waitForTimeout(2500);await p.screenshot({path:`${out}/${tag}-${n}.png`,clip});console.log('shot',n);};
 const sw='.lung-focus [aria-label="名稱標籤"]';
 const settle=async()=>{await p.waitForTimeout(25000);await p.waitForFunction(()=>document.querySelectorAll('.part-label').length>=10,null,{timeout:300000,polling:3000});await p.waitForTimeout(12000);};
 const report=async n=>{const r=await p.evaluate(()=>{const panel=document.querySelector('.lung-focus').getBoundingClientRect();const W=innerWidth;const boxes=[...document.querySelectorAll('.part-label')].filter(x=>x.style.display!=='none');const bad=[];const rs=boxes.map(x=>({k:x.dataset.key,r:x.getBoundingClientRect(),clipped:x.scrollWidth>x.clientWidth+1}));for(const a of rs){if(a.r.right>W-4||a.r.left<0)bad.push(a.k+' offscreen');if(a.r.right>panel.left&&a.r.left<panel.right&&a.r.bottom>panel.top&&a.r.top<panel.bottom)bad.push(a.k+' under-panel');if(a.clipped)bad.push(a.k+' text-clipped');}
  for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){const a=rs[i].r,c=rs[j].r;if(a.left<c.right&&c.left<a.right&&a.top<c.bottom&&c.top<a.bottom)bad.push(rs[i].k+'/'+rs[j].k+' overlap');}
  return {n:rs.length,W,panel:[panel.left,panel.right],bad};});console.log('layout',n,JSON.stringify(r));};
 const zoom=async(c,f)=>{await p.evaluate(([c,f])=>{const t=[c[3],c[4],c[5]],d=[c[0]-t[0],c[1]-t[1],c[2]-t[2]],L=Math.hypot(...d);window.__mjView.look(t,d.map(x=>x/L),L/f);},[c,f]);await p.waitForTimeout(3000);};
 for(const side of ['left','right']){
  await real(`.lung-focus-sides button:nth-child(${side==='left'?2:3})`);await p.waitForTimeout(5000);if(side==='left')await real(sw);await settle();
  await shot(`${side}-labels`);await report(`${side}-1500`);
  const cam=await p.evaluate(()=>window.__mjView.camera());
  await zoom(cam,2.6);await shot(`${side}-closeup`);await zoom(cam,1);
  await p.setViewportSize({width:1330,height:900});await p.waitForTimeout(25000);await shot(`${side}-labels-1330`);await report(`${side}-1330`);
  if(side==='left'){await p.setViewportSize({width:768,height:900});await p.waitForTimeout(25000);await shot('left-labels-768');await report('left-768');}
  await p.setViewportSize({width:1500,height:950});await p.waitForTimeout(8000);
 }
 await b.close();
})().catch(e=>{console.log('FAIL',e.message);process.exit(1);});
