// Browser check of the lung Quiz (#/quiz/lung), real mouse: setup page, level 1 question (name shown, model with the lungs), reveal with the data card, level 2 question (highlighted structure,
// typed name judged). Screenshots only, nothing drawn on them. usage: node lung-quiz-ui.cjs <port> <outDir> [tag]   (production build, software GL)
const {chromium}=require('playwright');
const fs=require('fs');
const [port='5613',out='/tmp/lungquiz',tag='quiz']=process.argv.slice(2);
fs.mkdirSync(out,{recursive:true});
const ok=(name,pass,info='')=>console.log((pass?'PASS ':'FAIL ')+name+(info?'  '+info:''));
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1400,height:900}});p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/#/quiz`);
 await p.waitForSelector('[data-part="lung"]');
 await p.screenshot({path:`${out}/${tag}-0-hub.png`});
 await p.locator('[data-part="lung"]').click();
 await p.waitForSelector('text=肺篇');await p.waitForTimeout(3000);
 ok('setup page lists the three sections',await p.locator('text=壓跡與溝').count()>0&&await p.locator('text=肺門').count()>0);
 await p.screenshot({path:`${out}/${tag}-1-setup.png`});
 await p.locator('button',{hasText:'壓跡與溝'}).click();
 await p.locator('button',{hasText:'開始測驗'}).click();
 await p.waitForSelector('h1.quiz-target');
 const name=await p.locator('h1.quiz-target').innerText();
 console.log('level 1 target:',name.replace(/\n/g,' / '));
 ok('level 1 shows English and Chinese',/[A-Za-z]/.test(name)&&/[一-鿿]/.test(name));
 await p.waitForTimeout(60000);
 await p.screenshot({path:`${out}/${tag}-2-level1.png`});
 await p.locator('button',{hasText:'顯示答案'}).first().click().catch(()=>p.locator('button',{hasText:'我不知道'}).first().click());
 await p.waitForTimeout(15000);
 const card=await p.locator('.quiz-answer-card, [class*=answer]').first().innerText().catch(()=>'');
 ok('the answer shows a data card',card.length>20,card.slice(0,80).replace(/\n/g,' '));
 await p.screenshot({path:`${out}/${tag}-3-answer.png`});
 // level 2
 await p.goto(`http://127.0.0.1:${port}/#/quiz`);await p.reload();
 await p.waitForSelector('[data-part="lung"]');await p.locator('[data-part="lung"]').click();await p.waitForSelector('text=肺篇');
 await p.locator('button',{hasText:'第二級'}).click();await p.locator('button',{hasText:'壓跡與溝'}).click();
 await p.locator('button',{hasText:'開始測驗'}).click();
 await p.waitForSelector('input[type=text], input:not([type])');
 await p.waitForTimeout(60000);
 await p.screenshot({path:`${out}/${tag}-4-level2.png`});
 await p.locator('input').first().fill('zzzz');
 await p.keyboard.press('Enter');await p.waitForTimeout(15000);
 await p.screenshot({path:`${out}/${tag}-5-level2-wrong.png`});
 ok('level 2 judged a wrong typed name',await p.locator('text=/不正確|答錯|錯/').count()>0);
 await b.close();
})().catch(e=>{console.log('FAIL',e.message);process.exit(1);});
