// Left recurrent laryngeal nerve in the neck (HN-24): close-up screenshots of a production build served by vite preview (software GL, light theme, desktop 1500x950). No annotations are drawn.
// usage: node scripts/browser/rln-groove-shots.cjs <port> <outDir> <tag> [basePath]
// Muscles and connective tissue are switched off so the trachea, oesophagus and the nerves beside them can be seen. Loading the neck vessels and nerves takes 20 to 25 minutes on software GL.
const {chromium}=require('playwright');const fs=require('fs');
const [port='5801',out='/tmp/rln-groove',tag='after',base='/']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const L=[0.008,1.422,-0.010];
const VIEWS_NERVES=[['n-front-close',L,[0,0,1],0.09],['n-left-close',L,[1,0,0],0.09],['n-left-front',L,[0.8,0.1,0.6],0.09],['n-left-back',L,[0.8,0.1,-0.6],0.09],['n-front-wide',[0,1.42,-0.01],[0,0,1],0.2]];
const VIEWS=[['front-close',L,[0,0,1],0.1],['left-close',L,[1,0,0],0.1],['front-wide',[0,1.42,-0.01],[0,0,1],0.2],['left-wide',[0.01,1.42,-0.01],[1,0,0],0.2],['back-left-close',L,[0.7,0,-0.7],0.1]];
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:1500,height:950},deviceScaleFactor:1,colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
 await p.goto(`http://127.0.0.1:${port}${base}?mjview=1`);
 {const t0=Date.now();await p.waitForFunction(()=>document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow')==='100',null,{timeout:3600000,polling:2000});console.log('loaded',Math.round((Date.now()-t0)/1000)+'s');}
 await sleep(8000);
 for(const name of [/Muscles/,/Connective/]){await p.locator('.system-row',{hasText:name}).first().locator('button.system-name').click();await sleep(2500);}
 // the trachea and the oesophagus are organs: switch the respiratory and digestive groups on
 for(const name of ['Respiratory','Digestive']){const ok=await p.evaluate(n=>{const rows=[...document.querySelectorAll('div,li,label')].filter(e=>e.children.length<8&&e.textContent.trim().startsWith(n)&&e.querySelector('input,button[role=switch],button'));const r=rows.sort((a,b)=>a.textContent.length-b.textContent.length)[0];if(!r)return 'none';const t=r.querySelector('input[type=checkbox],button[role=switch]')||r.querySelector('input,button');t.click();return r.textContent.trim().slice(0,30);},name);console.log('organ toggle',name,ok);await sleep(2500);}
 console.log('systems',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,24)).join(' | ')));
 for(const [n,t,d,r] of VIEWS){await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r]);await sleep(3000);await p.screenshot({path:`${out}/${tag}-${n}.png`,timeout:240000});console.log('shot',n);}
 // second set: only the nerves, the trachea and the oesophagus (skeleton, arteries and veins off) so nothing hides the nerve
 for(const name of [/Skeleton/,/Arteries/,/Veins/]){await p.locator('.system-row',{hasText:name}).first().locator('button.system-name').click();await sleep(2500);}
 console.log('systems',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,24)).join(' | ')));
 for(const [n,t,d,r] of VIEWS_NERVES){await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r]);await sleep(3000);await p.screenshot({path:`${out}/${tag}-${n}.png`,timeout:240000});console.log('shot',n);}
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});
