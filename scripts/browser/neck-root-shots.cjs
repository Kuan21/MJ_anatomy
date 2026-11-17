// Neck root (subclavian artery and vein, internal jugular vein, brachial plexus): screenshots of a production build served by vite preview (software GL, light theme), muscles and connective tissue switched off.
// usage: [BASE=/] node scripts/browser/neck-root-shots.cjs <port> <outDir> <tag> [keys]   keys = comma list of view names (default: all)
const {chromium}=require('playwright');const fs=require('fs');
const [port='5800',out='/tmp/neck-root',tag='after',only='']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const BASE=process.env.BASE||'/';
const want=only?new Set(only.split(',')):null;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// neck root: first rib and clavicle level, either side of the trachea
const L=[0.05,1.42,0.0],R=[-0.05,1.42,0.0];
const VIEWS=[
 ['front',[0,1.42,0.0],[0,0,1],0.30],['L-front',L,[0,0,1],0.14],['R-front',R,[0,0,1],0.14],
 ['L-side',L,[1,0,0],0.16],['R-side',R,[-1,0,0],0.16],['L-close',[0.07,1.415,0.0],[0,0,1],0.07],['R-close',[-0.07,1.415,0.0],[0,0,1],0.07],
 ['L-top',[0.06,1.43,0.0],[0,1,0],0.16],['back',[0,1.42,0.0],[0,0,-1],0.30]];
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:1500,height:950},deviceScaleFactor:1,colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(240000);
 const errors=[];p.on('pageerror',e=>errors.push('pageerror: '+e.message.slice(0,200)));
 await p.goto(`http://127.0.0.1:${port}${BASE}?mjview=1`);
 await p.waitForFunction(()=>document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow')==='100',null,{timeout:3600000,polling:2000});
 await sleep(8000);
 for(const name of [/Muscles/,/Connective/]){await p.locator('.system-row',{hasText:name}).first().locator('button.system-name').click();await sleep(2500);}
 console.log('systems',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,24)).join(' | ')));
 for(const [n,t,d,r] of VIEWS){
  if(want&&!want.has(n))continue;
  await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r]);await sleep(3000);
  await p.screenshot({path:`${out}/${tag}-${n}.png`,timeout:240000});console.log('shot',n);
 }
 fs.writeFileSync(`${out}/${tag}-errors.json`,JSON.stringify(errors));console.log('errors',errors.length);
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});
