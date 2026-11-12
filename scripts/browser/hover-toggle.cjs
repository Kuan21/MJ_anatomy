// Browser test (production build, software GL, ~8 minutes): the Hover labels switch with a real mouse; localStorage blocked; the Quiz page draws no name tip; phone width.
// usage: node hover-toggle.cjs <port> <outDir> [LOAD_WAIT ms]   needs playwright and `vite preview` of a production build.
const {chromium}=require('playwright');const fs=require('fs');
const [port='5831',out='/tmp/hovershots']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
let failed=0;const ok=(name,pass,info='')=>{if(!pass)failed++;console.log((pass?'PASS ':'FAIL ')+name+(info?'  '+info:''));};
const LOAD=+(process.env.LOAD_WAIT||100000);
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const open=async(ctxOpts,init)=>{const ctx=await b.newContext(ctxOpts);if(init)await ctx.addInitScript(init);const p=await ctx.newPage();p.setDefaultTimeout(240000);p.on('pageerror',e=>console.log('PAGEERR',e.message));await p.goto(`http://127.0.0.1:${port}/`);await p.waitForSelector('.top-actions .hover-toggle',{timeout:240000});await p.waitForTimeout(LOAD);return {ctx,p};};
 const pressed=p=>p.locator('.hover-toggle').getAttribute('aria-pressed');
 const tipVisible=p=>p.evaluate(()=>{const t=document.querySelector('.part-hover');return !!t&&!t.hidden&&t.textContent.trim().length>0;});
 const tipText=p=>p.evaluate(()=>document.querySelector('.part-hover')?.textContent??'');
 // ---- desktop, real mouse
 const {ctx,p}=await open({viewport:{width:1500,height:950}});
 ok('switch is shown and off by default',await pressed(p)==='false'&&await p.evaluate(()=>localStorage.getItem('mj-hover-labels'))===null);
 const bx=await p.locator('.hover-toggle').boundingBox();const clickToggle=async()=>{const q=await p.locator('.hover-toggle').boundingBox();await p.mouse.click(q.x+q.width/2,q.y+q.height/2);await p.waitForTimeout(500);};
 await clickToggle();ok('switch on: pressed, stored',await pressed(p)==='true'&&await p.evaluate(()=>localStorage.getItem('mj-hover-labels'))==='1');
 // find a point over a structure (a name tip shows there)
 let P=null;for(let y=250;y<=800&&!P;y+=45)for(let x=520;x<=980&&!P;x+=40){await p.mouse.move(x-3,y);await p.waitForTimeout(90);await p.mouse.move(x,y);await p.waitForTimeout(160);if(await tipVisible(p))P=[x,y];}
 ok('switch on: a name tip follows the mouse over a structure',!!P,P?JSON.stringify(P)+' '+(await tipText(p)).replace(/\n/g,' / '):'');
 if(P){await p.screenshot({path:`${out}/desktop-on.png`});
  await p.mouse.move(1000,880);await p.waitForTimeout(300);await clickToggle();ok('switch off: not pressed, stored 0',await pressed(p)==='false'&&await p.evaluate(()=>localStorage.getItem('mj-hover-labels'))==='0');
  await p.mouse.move(P[0]-3,P[1]);await p.waitForTimeout(120);await p.mouse.move(P[0],P[1]);await p.waitForTimeout(500);
  ok('switch off: no name tip on the same structure',!(await tipVisible(p)));await p.screenshot({path:`${out}/desktop-off.png`});
  // clicking still selects and shows the name in the card
  await p.mouse.click(P[0],P[1]);await p.waitForTimeout(2000);ok('switch off: a click still opens the info card',await p.locator('.detail-sheet .structure-title').count()===1,(await p.locator('.detail-sheet .structure-title').first().innerText().catch(()=>'')).replace(/\s+/g,' '));
  await p.screenshot({path:`${out}/desktop-off-click.png`});
  // remembered after a reload (on)
  await p.mouse.click(1,1);
 }
 await p.evaluate(()=>localStorage.setItem('mj-hover-labels','1'));await p.reload();await p.waitForSelector('.hover-toggle');ok('choice is remembered after a reload',await pressed(p)==='true');
 await ctx.close();
 // ---- localStorage blocked: reads and writes throw
 const blocked=await open({viewport:{width:1500,height:950}},()=>{const bad={get(){throw new DOMException('blocked','SecurityError');}};Object.defineProperty(window,'localStorage',bad);});
 ok('storage blocked: page loads, switch off',await pressed(blocked.p)==='false');
 { const q=await blocked.p.locator('.hover-toggle').boundingBox();await blocked.p.mouse.click(q.x+q.width/2,q.y+q.height/2);await blocked.p.waitForTimeout(500);}
 ok('storage blocked: switch still toggles',await pressed(blocked.p)==='true');
 await blocked.ctx.close();
 // ---- Quiz page: no name tip whatever the switch says
 const qz=await open({viewport:{width:1500,height:950}},()=>{try{localStorage.setItem('mj-hover-labels','1');}catch{}});
 const href=await qz.p.locator('.quiz-link').getAttribute('href');await qz.p.goto(new URL(href,`http://127.0.0.1:${port}/`).href);await qz.p.waitForTimeout(25000);
 for(let y=200;y<=800;y+=100)for(let x=300;x<=1200;x+=150){await qz.p.mouse.move(x,y);await qz.p.waitForTimeout(40);}
 ok('quiz page: no name tip element or tooltip',await qz.p.evaluate(()=>!document.querySelector('.part-hover')&&!document.querySelector('[role=tooltip]:not([hidden])')));
 await qz.p.screenshot({path:`${out}/quiz-switch-on.png`});await qz.ctx.close();
 // ---- phone width: switch shown (icon), toggles by tap
 const ph=await open({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const vis=await ph.p.locator('.hover-toggle').isVisible();ok('phone: switch is shown',vis&&await pressed(ph.p)==='false');await ph.p.screenshot({path:`${out}/phone-off.png`});
 await ph.p.locator('.hover-toggle').tap();await ph.p.waitForTimeout(500);ok('phone: tap turns it on',await pressed(ph.p)==='true');await ph.p.screenshot({path:`${out}/phone-on.png`});
 await ph.ctx.close();await b.close();console.log(failed?`${failed} check(s) failed`:'all browser checks passed');process.exit(failed?1:0);
})();
