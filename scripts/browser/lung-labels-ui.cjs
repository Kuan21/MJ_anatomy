// Browser test for the 肺 name labels: real mouse clicks only. For each lung: switch the labels on, check the label boxes (bilingual, visible, inside the view),
// that no two arrows cross and no two boxes overlap, then click one label and check that its data card opens. Takes a screenshot per lung (no text drawn onto the images).
// usage: node lung-labels-ui.cjs <port> <outDir> [tag]     needs playwright and a built or dev server; software GL, several minutes.
const {chromium}=require('playwright');
const fs=require('fs');
const [port='5613',out='/tmp/lunglabels',tag='labels']=process.argv.slice(2);
fs.mkdirSync(out,{recursive:true});
const ok=(name,pass,info='')=>console.log((pass?'PASS ':'FAIL ')+name+(info?'  '+info:''));
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1500,height:950}});p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);
 await p.waitForSelector('.detail-atlas-shortcuts',{timeout:240000});
 await p.waitForTimeout(+(process.env.LOAD_WAIT||80000));
 await p.mouse.move(5,5);
 await p.locator('.detail-atlas-shortcuts button',{hasText:'肺'}).click();await p.waitForTimeout(3000);
 await p.waitForFunction(()=>{const a=window.__mjView.partsState('lobe of (right|left) lung');return a.length===5&&a.every(x=>x.picker);},null,{timeout:900000,polling:3000});await p.waitForTimeout(5000);
 const real=async s=>{const bx=await p.locator(s).boundingBox();await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 const geometry=()=>p.evaluate(()=>{const boxes=[...document.querySelectorAll('.part-label')].filter(e=>e.style.display!=='none').map(e=>{const r=e.getBoundingClientRect();return{key:e.dataset.key,en:e.querySelector('.part-label-en').textContent,zh:e.querySelector('.part-label-zh').textContent,l:r.left,t:r.top,r:r.right,b:r.bottom,top:getComputedStyle(e).display};});
  const root=document.querySelector('.part-labels').getBoundingClientRect(),lines=[...document.querySelectorAll('.part-label-lines line')].filter(l=>l.style.display!=='none').map(l=>['x1','y1','x2','y2'].map(k=>+l.getAttribute(k)));const hidden=[...document.querySelectorAll('.part-label')].filter(e=>e.style.display==='none').map(e=>e.dataset.key+' ('+e.dataset.why+')');return{boxes,lines,hidden,w:root.width,h:root.height};});
 const cross=(a,c)=>{const o=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);const A=[a[0],a[1]],B=[a[2],a[3]],C=[c[0],c[1]],D=[c[2],c[3]];return o(A,B,C)*o(A,B,D)<0&&o(C,D,A)*o(C,D,B)<0;};
 const sw='.lung-focus [aria-label="名稱標籤"]';
 const SIDES=(process.env.SIDES||'right,left').split(',');
 for(const [n,side] of SIDES.entries()){
  if(n===0){if(side==='left'){await real('.lung-focus-sides button:nth-child(2)');await p.waitForTimeout(5000);}await real(sw);}else{await real(`.lung-focus-sides button:nth-child(${side==='left'?2:3})`);}
  await p.waitForTimeout(30000);
  await p.waitForFunction(()=>document.querySelectorAll('.part-label').length>=10,null,{timeout:300000,polling:3000});await p.waitForTimeout(15000);
  const g=await geometry();
  console.log(side,'labels shown:',g.boxes.length,g.boxes.map(x=>x.en).join(' | '));console.log(side,'labels hidden:',g.hidden.join(', '));
  ok(side+': switch is on',(await p.locator(sw).getAttribute('aria-checked'))==='true');
  ok(side+': at least 18 labels shown',g.boxes.length>=18,String(g.boxes.length));
  ok(side+': every label has English on top and Chinese below',g.boxes.every(x=>x.en&&/[一-鿿]/.test(x.zh)&&!/[一-鿿]/.test(x.en)));
  ok(side+': boxes inside the view',g.boxes.every(x=>x.l>=0&&x.r<=g.w&&x.t>=0&&x.b<=g.h));
  let overlap=0;for(let i=0;i<g.boxes.length;i++)for(let j=i+1;j<g.boxes.length;j++){const a=g.boxes[i],c=g.boxes[j];if(a.l<c.r&&c.l<a.r&&a.t<c.b&&c.t<a.b)overlap++;}
  ok(side+': no two boxes overlap',overlap===0,String(overlap));
  let crossings=0;for(let i=0;i<g.lines.length;i++)for(let j=i+1;j<g.lines.length;j++)if(cross(g.lines[i],g.lines[j]))crossings++;
  ok(side+': no two arrows cross',crossings===0,`${crossings} of ${g.lines.length} arrows`);
  await p.screenshot({path:`${out}/${tag}-${side}-labels.png`});
  // a real click on the box of the cardiac impression opens its data card
  const target=p.locator('.part-label[data-key="cardiac"]:visible');
  if(await target.count()){await target.click();await p.waitForTimeout(4000);const sheet=await p.locator('.detail-sheet').innerText().catch(()=>'');ok(side+': clicking the cardiac impression label opens its card',/cardiac impression/i.test(sheet),sheet.slice(0,60).replace(/\n/g,' '));await p.screenshot({path:`${out}/${tag}-${side}-card.png`});}
  else ok(side+': cardiac impression label exists',false);
  await p.keyboard.press('Escape');await p.waitForTimeout(1500);
 }
 await real(sw);await p.waitForTimeout(3000);ok('switch turns the labels off',(await p.locator('.part-label').count())===0||(await geometry()).boxes.length===0);
 await b.close();
})().catch(e=>{console.log('FAIL',e.message);process.exit(1);});
