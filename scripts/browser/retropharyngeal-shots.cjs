// Retropharyngeal space layer: screenshots of a production build served by vite preview (software GL, light theme), desktop 1500x950 or phone 390x844.
// usage: [VIEWPORT=390x844] node scripts/browser/retropharyngeal-shots.cjs <port> <outDir> <tag>
// Skeleton and connective tissue on, everything else off (the pharynx is a respiratory organ: off in the first set so the layer is seen in front of the vertebrae, on in the second set).
// The layer is selected through the search box. Then head and neck flexion and extension at the slider limits (side views).
const {chromium}=require('playwright');const fs=require('fs');
const [port='5812',out='/tmp/retropharyngeal',tag='after']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const [VW,VH]=(process.env.VIEWPORT||'1500x950').split('x').map(Number),PHONE=VW<500;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const T=[0,1.50,-0.005];
const SET_A=[['front-close',T,[0,0,1],0.14],['left-side',T,[1,0,0],0.16],['left-oblique',T,[0.7,0.15,0.7],0.14],['front-top',[0,1.54,-0.005],[0,0.5,0.85],0.12]];
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:1,colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);
 await p.waitForFunction(()=>document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow')==='100',null,{timeout:3600000,polling:2000});await sleep(8000);
 const panel=p.locator('.system-row').first();
 const openPanel=async()=>{if(PHONE&&!(await panel.isVisible().catch(()=>false))){await p.locator('button[aria-label="開啟系統面板"]').click();await sleep(1500);}};
 const closePanel=async()=>{if(PHONE){const c=p.locator('.close-systems').first();if(await c.isVisible().catch(()=>false))await c.click();await sleep(1500);}};
 const toggle=async n=>{await openPanel();await p.locator('.system-row',{hasText:n}).first().locator('button.system-name').evaluate(e=>e.click());await sleep(2500);};
 const organ=async n=>{await openPanel();await p.evaluate(n=>{const rows=[...document.querySelectorAll('div,li,label')].filter(e=>e.children.length<8&&e.textContent.trim().startsWith(n)&&e.querySelector('input,button[role=switch],button'));const r=rows.sort((a,b)=>a.textContent.length-b.textContent.length)[0];if(!r)return;(r.querySelector('input[type=checkbox],button[role=switch]')||r.querySelector('input,button')).click();},n);await sleep(2500);};
 const select=async find=>{await p.getByRole('button',{name:'搜尋構造'}).click();await sleep(800);await p.locator('.search-panel input[role=combobox]').first().fill(find);await sleep(1500);await p.locator('[data-slot=combobox-item]').first().click();await sleep(3500);};
 const shot=async n=>{await sleep(3000);await p.screenshot({path:`${out}/${tag}-${PHONE?'phone':'desktop'}-${n}.png`,...(PHONE?{}:{clip:{x:330,y:60,width:840,height:830}}),timeout:240000});console.log('shot',n);};
 const look=async(t,d,r)=>{if(PHONE){t=[t[0],t[1]-0.03,t[2]];r*=1.3;}await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r]);};
 for(const n of [/Muscles/,/Arteries/,/Veins/,/Nervous/])await toggle(n);
 console.log('systems',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,24)).join(' | ')));
 // the front of the skull and the cartilages of the larynx stand in front of the layer: hide them one by one (search, select, Hide)
 await openPanel();
 for(const f of ['Mandible','Left maxilla','Right maxilla','Hyoid bone','Thyroid cartilage','Cricoid cartilage']){await select(f);const h=p.locator('button',{hasText:/^Hide/}).first();if(await h.isVisible().catch(()=>false)){await h.click();await sleep(1500);}await p.keyboard.press('Escape').catch(()=>{});await sleep(500);}
 await select('Retropharyngeal space');await closePanel();
 for(const [n,t,d,r] of SET_A){await look(t,d,r);await shot('A-'+n);}
 // second set: the pharynx (respiratory group, off by default) switched on: the layer behind its wall
 await organ('Respiratory');await closePanel();
 for(const [n,t,d,r] of [['left-oblique',T,[0.7,0.15,0.7],0.18],['left-side',T,[1,0,0],0.2]]){await look(t,d,r);await shot('B-'+n);}
 await openPanel();await organ('Respiratory');await closePanel();
 // motion: flexion and extension at the slider limits (pharynx off again)
 await look(T,[1,0,0],0.2);
 if(PHONE){await p.locator('summary:has-text("關節系統與動作")').first().click().catch(()=>{});await sleep(1500);}
 else{const ws=p.locator('.joint-workspace');if((await ws.getAttribute('open'))===null)await ws.locator('summary span').first().click();}
 await p.locator('.motion-enable-toggle input').check({timeout:20000});await sleep(1500);
 await p.locator('.motion-region-picker button',{hasText:'頭頸'}).first().click();await sleep(2500);
 const FLEX='頭頸屈曲（＋）／伸展（－）',lim=await p.evaluate(l=>{const e=document.querySelector(`input[aria-label="${l} angle"]`);return [+e.min,+e.max];},FLEX);console.log('flexion limits',lim);
 const setSlider=async v=>{await p.evaluate(([l,v])=>{const el=document.querySelector(`input[aria-label="${l} angle"]`);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(v));el.dispatchEvent(new Event('input',{bubbles:true}));},[FLEX,v]);};
 for(const [pn,v] of [['flexion',lim[1]],['extension',lim[0]]]){await setSlider(v);await sleep(6000);
  if(PHONE){const o=await p.locator('.joint-workspace').getAttribute('open');if(o!==null)await p.locator('summary:has-text("關節系統與動作")').first().click().catch(()=>{});await sleep(1000);}
  await look(T,[1,0,0],0.2);await shot(`${pn}-left-side`);
  if(PHONE)await p.locator('summary:has-text("關節系統與動作")').first().click().catch(()=>{});await sleep(1000);}
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});
