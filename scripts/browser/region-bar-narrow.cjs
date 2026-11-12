// The region bar on a phone-width screen: one row, scrolls sideways, not covered. Needs only the page shell (no scene load wait).
// usage: node region-bar-narrow.cjs <port> <outDir> [width] [height]
const {chromium}=require('playwright');
const fs=require('fs');
const [port='5611',out='/tmp/regionshots',W='390',H='800']=process.argv.slice(2);
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:+W,height:+H},hasTouch:true});
 await p.goto(`http://127.0.0.1:${port}/`);
 await p.waitForSelector('.region-bar',{timeout:240000});await p.waitForTimeout(4000);
 const info=()=>p.evaluate(()=>{const e=document.querySelector('.region-bar'),r=e.getBoundingClientRect(),btns=[...e.querySelectorAll(':scope > button')].filter(x=>x.offsetWidth>4);const t=document.elementFromPoint(r.x+10,r.y+r.height/2);return{scrollW:e.scrollWidth,clientW:e.clientWidth,scrollLeft:Math.round(e.scrollLeft),oneRow:new Set(btns.map(x=>Math.round(x.getBoundingClientRect().top))).size===1,covered:!(e===t||e.contains(t)),left:Math.round(r.left),right:Math.round(r.right),viewport:innerWidth,pageScrollsSideways:document.documentElement.scrollWidth>innerWidth};});
 const a=await info();console.log('start',JSON.stringify(a));
 await p.screenshot({path:`${out}/narrow-0-start.png`});
 await p.evaluate(()=>{const e=document.querySelector('.region-bar');e.scrollLeft=e.scrollWidth;});await p.waitForTimeout(500);
 const z=await info();console.log('scrolled',JSON.stringify(z));await p.screenshot({path:`${out}/narrow-1-scrolled.png`});
 // open the chest: second level also stays one row
 await p.evaluate(()=>{document.querySelector('.region-bar').scrollLeft=0;});
 const chest=p.locator('.region-bar > button',{hasText:/^胸腔$/}).first();await chest.scrollIntoViewIfNeeded();const bx=await chest.boundingBox();await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);await p.waitForTimeout(1500);
 const c=await info();console.log('chest',JSON.stringify(c));await p.screenshot({path:`${out}/narrow-2-chest.png`});
 const pass=a.scrollW>a.clientW&&a.oneRow&&!a.covered&&!a.pageScrollsSideways&&z.scrollLeft>0&&c.oneRow&&!c.covered&&c.scrollW>c.clientW;
 console.log(pass?'narrow: pass':'narrow: FAIL');await b.close();process.exit(pass?0:1);
})().catch(e=>{console.error(e);process.exit(1);});
