// Browser test (production build, software GL): the redesigned special region (suboccipital triangle) - roof lifted off by default with a dashed outline, roof on, a picked structure
// (camera unchanged), 顯示周圍結構, and the right panel wraps its text instead of cutting it. Screenshots go to <outDir>.
// usage: node special-solid.cjs <port> <outDir> [width] [height]    needs a static server of the production build and playwright; every click is a real mouse click.
const {chromium}=require('playwright');const fs=require('fs');
const [port='5851',out='/tmp/solidshots',W='1500',H='950']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
let failed=0;const ok=(name,pass,info='')=>{if(!pass)failed++;console.log((pass?'PASS ':'FAIL ')+name+(info?'  '+info:''));};
const same=(a,b,eps=1e-6)=>a&&b&&a.length===b.length&&a.every((v,i)=>Math.abs(v-b[i])<eps);
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:+W,height:+H}});p.setDefaultTimeout(240000);p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);await p.waitForSelector('.region-bar',{timeout:240000});await p.waitForTimeout(+(process.env.LOAD_WAIT||150000));
 await p.mouse.move(5,5);
 const real=async loc=>{const bx=await loc.boundingBox();if(!bx)throw new Error('no box');await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 const btn=(text,scope='.region-bar')=>p.locator(`${scope} button`,{hasText:new RegExp('^'+text+'$')}).first();
 const cam=()=>p.evaluate(()=>({c:window.__mjView.camera(),o:window.__mjView.viewOffset()}));
 const shot=async n=>{await p.waitForTimeout(2500);await p.screenshot({path:`${out}/${n}.png`});};
 await real(btn('背部'));await p.waitForTimeout(4000);
 await real(p.locator('.right-tool-rail button',{hasText:/^分層解剖$/}).first());await p.waitForTimeout(1500);
 await real(p.locator('.space-pick',{hasText:/Suboccipital triangle/}).first());await p.waitForTimeout(9000);
 // the nerve model streams in last: wait for it (software GL is slow) so the labels of the nerves and the venous plexus exist
 for(let k=0;k<80&&!(await p.evaluate(()=>window.__mjView.nerveRows().some(r=>/Suboccipital nerve/.test(r[0]))));k++)await p.waitForTimeout(5000);
 await p.waitForTimeout(12000);await shot('sub-1-roof-lifted');
 console.log('nerve meshes',JSON.stringify((await p.evaluate(()=>window.__mjView.nerveRows())).filter(r=>/ccipital/.test(r[0]))));
 console.log('neck rows',JSON.stringify(await p.evaluate(()=>window.__mjView.neckRows())));
 const start=await cam();
 ok('roof starts lifted off (button offers 蓋上頂部)',(await p.locator('.space-roof-toggle').innerText()).includes('蓋上頂部'));
 ok('the five groups are listed',(await p.locator('.space-role b').allInnerTexts()).join('|').replace(/\s/g,'')==='Boundaries｜邊界|Roof｜頂|Floor｜底|Contents｜內容物|Relatedstructures｜相關結構'.replace(/\s/g,''),(await p.locator('.space-role b').allInnerTexts()).join('|'));
 await real(p.locator('.space-roof-toggle'));await p.waitForTimeout(3000);await shot('sub-2-roof-on');
 ok('roof on: camera unchanged',same((await cam()).c,start.c));
 ok('roof on: button offers 揭開頂部',(await p.locator('.space-roof-toggle').innerText()).includes('揭開頂部'));
 await real(p.locator('.space-roof-toggle'));await p.waitForTimeout(2500);
 await real(p.locator('.space-row',{hasText:/Obliquus capitis inferior/}).first());await p.waitForTimeout(3000);await shot('sub-3-select-oci');
 ok('picking a structure does not move the camera',same((await cam()).c,start.c)&&JSON.stringify((await cam()).o)===JSON.stringify(start.o));
 await p.locator('.space-row',{hasText:/Vertebral artery/}).first().scrollIntoViewIfNeeded();await real(p.locator('.space-row',{hasText:/Vertebral artery/}).first());await p.waitForTimeout(3000);await shot('sub-4-select-va');
 ok('picking the artery does not move the camera',same((await cam()).c,start.c));
 await real(p.locator('.space-surround input'));await p.waitForTimeout(3000);await shot('sub-5-surround');
 ok('surroundings: camera unchanged',same((await cam()).c,start.c));
 const over=await p.evaluate(()=>[...document.querySelectorAll('.space-filter *')].filter(e=>e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflowX!=='visible'&&e.clientWidth>0).map(e=>e.className+':'+e.scrollWidth+'>'+e.clientWidth).slice(0,5));
 ok('right panel text does not overflow horizontally',over.length===0,JSON.stringify(over));
 const dots=await p.evaluate(()=>[...document.querySelectorAll('.space-row')].map(r=>r.querySelector('.bn-en').textContent+'='+getComputedStyle(r.querySelector('.edge-dot')).backgroundColor));
 console.log('dots',JSON.stringify(dots));
 await b.close();console.log(failed?`${failed} check(s) failed`:'all browser checks passed');process.exit(failed?1:0);
})();
