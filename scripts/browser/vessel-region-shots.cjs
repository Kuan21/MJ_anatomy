// Vessel ends in the abdomen and the pelvis (and the neck root): screenshots of a production build served by vite preview (software GL, light theme), muscles and connective tissue switched off.
// usage: [BASE=/] [VIEWPORT=1500x950] [HIDE=Veins,Nervous,Skeleton   systems switched off as well] node scripts/browser/vessel-region-shots.cjs <port> <outDir> <tag> [keys]   keys = comma list of view names (default: all)
const {chromium}=require('playwright');const fs=require('fs');
const [port='5800',out='/tmp/vessel-region',tag='after',only='']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const BASE=process.env.BASE||'/';
const want=only?new Set(only.split(',')):null;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const VIEWS=[
 // abdomen: aorta, coeliac trunk, mesenteric and renal branches, inferior vena cava
 ['abd-front-wide',[0,1.10,0.02],[0,0,1],0.45],['abd-front',[0,1.05,0.02],[0,0,1],0.26],['abd-left',[0,1.05,0.0],[1,0,0],0.32],['abd-back',[0,1.08,0.0],[0,0,-1],0.40],
 // pelvis: internal iliac branches, gluteal, pudendal, obturator, rectal and vesical vessels
 // testicular vessels (to the groin) and the hepatic and portal veins (liver), front
 ['testis-front-wide',[0,0.95,0.02],[0,0,1],0.45],['testis-front',[0,0.95,0.02],[0,0,1],0.28],['liver-front-wide',[-0.02,1.18,0.02],[0,0,1],0.42],['liver-front',[-0.02,1.18,0.02],[0,0,1],0.26],['liver-top',[-0.02,1.18,0.02],[0,1,0],0.34],
 // close-ups of the ends that used to be joined to an unrelated vessel: inferior mesenteric vein / left testicular vein, right testicular vein in the groin, middle and right hepatic veins / portal vein
 ['vs04-mesenteric',[0.0253,1.0742,0.0168],[0,0,1],0.07],['vs04-groin',[-0.0326,0.7752,0.0342],[0,0,1],0.07],['vs05-middle-hepatic',[-0.0176,1.2278,0.047],[0,0,1],0.08],['vs05-right-hepatic',[-0.0678,1.1995,-0.0186],[0,0,1],0.08],
 // a limb gap that was hidden by a wrong connector: the pectoral branch of the left thoraco-acromial artery stops 19 mm short of its trunk
 ['limb-gap-thoraco-acromial',[0.105,1.395,0.025],[0,0,1],0.10],
 // the lumbar veins (four separate tubes per side, from the body wall to the ascending lumbar vein)
 ['lumbar-back',[0,1.07,-0.03],[0,0,-1],0.22],['lumbar-front',[0,1.07,-0.01],[0,0,1],0.22],
 // the lumbar veins entering the ascending lumbar vein / inferior vena cava (use HIDE=Skeleton,Arteries,Nervous to see the veins alone)
 ['lumbar-veins-front',[0,1.075,0.0],[0,0,1],0.17],['lumbar-veins-back',[0,1.075,-0.02],[0,0,-1],0.19],['lumbar-veins-left',[0.03,1.075,-0.02],[1,0,0],0.19],
 ['pel-front-wide',[0,0.90,0.0],[0,0,1],0.50],['pel-front',[0.03,0.88,0.0],[0,0,1],0.28],['pel-left',[0,0.88,0.0],[1,0,0],0.32],['pel-top',[0,0.92,0.0],[0,1,0],0.36]];
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:(([w,h])=>({width:+w,height:+h}))((process.env.VIEWPORT||'1500x950').split('x')),deviceScaleFactor:1,colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(240000);
 const errors=[];p.on('pageerror',e=>errors.push('pageerror: '+e.message.slice(0,200)));
 await p.goto(`http://127.0.0.1:${port}${BASE}?mjview=1`);
 await p.waitForFunction(()=>document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow')==='100',null,{timeout:3600000,polling:2000});
 await sleep(8000);
 if(!process.env.NOSYSTEMS)for(const name of [/Muscles/,/Connective/,...(process.env.HIDE?process.env.HIDE.split(',').map(x=>new RegExp(x)):[])]){await p.locator('.system-row',{hasText:name}).first().locator('button.system-name').click();await sleep(2500);}
 console.log('systems',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,24)).join(' | ')));
 if(process.env.SELECT){ // select a structure through the search (the vessel and its end piece are selected together, the rest is faded)
  await p.getByRole('button',{name:'搜尋構造'}).click();await sleep(800);
  await p.locator('.search-panel input[role=combobox]').first().fill(process.env.SELECT);await sleep(1200);
  await p.locator('[data-slot=combobox-item]').first().click();await sleep(3500);
  console.log('selected',process.env.SELECT);
 }
 for(const [n,t,d,r] of VIEWS){
  if(want&&!want.has(n))continue;
  await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r]);await sleep(3000);
  await p.screenshot({path:`${out}/${tag}-${n}.png`,timeout:240000});console.log('shot',n);
 }
 fs.writeFileSync(`${out}/${tag}-errors.json`,JSON.stringify(errors));console.log('errors',errors.length);
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});
