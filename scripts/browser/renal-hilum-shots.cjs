// Renal hilum order (AB-01): screenshots of a production build served by vite preview (software GL, light theme). No annotations are drawn.
// usage: node scripts/browser/renal-hilum-shots.cjs <port> <outDir> <tag> [base=/MJ_anatomy/]
// Shown: urinary organs (kidneys, ureters), arteries and veins only. Views: front, from above (front-to-back order reads top to bottom), and close obliques of each hilum;
// then the same page at phone width (front and from above). Loading takes 20–25 minutes with software WebGL.
const {chromium}=require('playwright');const fs=require('fs');
const [port='5800',out='/tmp/renal-hilum',tag='after',base='/MJ_anatomy/']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// [name, target (m), direction from target to camera, distance (m)]
const VIEWS=[
 ['front',[0,1.108,0],[0,0,1],0.26],
 ['above',[0,1.11,-0.005],[0,1,0.02],0.24],
 ['left-hilum-above',[0.036,1.118,-0.008],[0.15,1,0.25],0.085],
 ['left-hilum-oblique',[0.036,1.118,-0.008],[0.55,0.35,0.75],0.09],
 ['right-hilum-above',[-0.034,1.108,-0.006],[-0.15,1,0.25],0.085],
 ['right-hilum-oblique',[-0.034,1.108,-0.006],[-0.55,0.35,0.75],0.09],
];
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:1500,height:950},deviceScaleFactor:1,colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
 await p.goto(`http://127.0.0.1:${port}${base}?mjview=1`);
 {const t0=Date.now();await p.waitForFunction(()=>document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow')==='100',null,{timeout:3600000,polling:2000});console.log('loaded',Math.round((Date.now()-t0)/1000)+'s');}
 await sleep(8000);
 // Organs ▸ Urinary: "show only urinary"; then switch on arteries and veins
 const organs=p.locator('.organ-parent .organ-expand').first();if(await organs.getAttribute('aria-expanded')!=='true'){await organs.click();await sleep(1200);}
 await p.locator('.organ-children .system-row',{hasText:/Urinary/}).locator('button.system-name').first().click();await sleep(2500);
 for(const name of [/^\s*Arteries/,/^\s*Veins/]){const row=p.locator('.system-row:not(.enabled)',{hasText:name}).first();if(await row.count()){await row.locator('button.system-name').click();await sleep(2500);}}
 console.log('systems on',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,20)).join(' | ')));
 await p.mouse.click(5,300);await sleep(1000);
 const shot=async n=>{await sleep(3500);await p.screenshot({path:`${out}/${tag}-desktop-${n}.png`,timeout:240000});console.log('shot',n);};
 for(const [n,t,d,r] of VIEWS){await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r]);await shot(n);}
 await p.setViewportSize({width:390,height:844});await sleep(6000);
 for(const [n,t,d,r] of [VIEWS[0],VIEWS[2]]){await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r*1.6),[t,d,r]);await sleep(4000);await p.screenshot({path:`${out}/${tag}-mobile-${n}.png`,timeout:240000});console.log('shot mobile',n);}
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});
