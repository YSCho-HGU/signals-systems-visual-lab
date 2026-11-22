#!/usr/bin/env node
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const PORT=8891,BASE=process.env.SS_BASE_URL||'http://127.0.0.1:'+PORT+'/';
mkdirSync('qa-continuity',{recursive:true});
let server,browser;const results=[];
function check(id,ok,detail={}){results.push({id,passed:!!ok,detail});console.log((ok?'PASS ':'FAIL ')+id+' '+JSON.stringify(detail).slice(0,360))}
const sleep=t=>new Promise(r=>setTimeout(r,t));
try{
 if(!process.env.SS_BASE_URL){server=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{stdio:'ignore'});await sleep(1300)}
 browser=await chromium.launch({headless:true});
 for(let ch=1;ch<=8;ch++){
  const page=await browser.newPage({viewport:{width:1400,height:900}});
  const errors=[];page.on('pageerror',err=>errors.push(String(err)));
  await page.goto(BASE+'chapter'+ch+'.html',{waitUntil:'load',timeout:50000});
  await page.waitForTimeout(650);
  const head=await page.evaluate(()=>({title:document.title,header:!!document.querySelector('.ss-common-header'),links:document.querySelectorAll('.ss-common-links a').length,frame:document.querySelectorAll('iframe').length,theme:document.documentElement.dataset.elsTheme||'',stage:!!document.querySelector('.ss-found-four-step'),canvas:document.querySelectorAll('canvas').length,formula:!!document.querySelector('.ss-found-katex'),math:!!document.querySelector('.ss-found-katex .katex'),main:document.querySelector('main')?.textContent.slice(0,120)}));
  check('chapter'+ch+'-header-and-nav',head.header&&head.links>=8&&head.frame===0,head);
  check('chapter'+ch+'-theme',!!head.theme,head.theme);
  if(ch<=4){
   check('chapter'+ch+'-four-stage-layout',head.stage&&head.canvas>0&&head.formula,head);
   check('chapter'+ch+'-hero-KaTeX',head.math,head);
   const before=await page.locator(ch===1?'#title':'#content .heading h2').textContent();
   const nav=page.locator(ch===1?'#nav [data-exp]':'[data-nav]');
   const count=await nav.count();
   check('chapter'+ch+'-lab-count',count===[9,9,7,8][ch-1],{count});
   if(count>1){await nav.nth(1).click();await page.waitForTimeout(450)}
   const after=await page.locator(ch===1?'#title':'#content .heading h2').textContent();
   check('chapter'+ch+'-navigate',before!==after,{before,after});
   const layout=await page.evaluate(()=>({stage:!!document.querySelector('.ss-found-four-step'),predict:!!document.querySelector('.ss-found-predict'),pair:!!document.querySelector('.ss-found-23'),explain:!!document.querySelector('.ss-found-explain'),canvases:document.querySelectorAll('canvas').length,math:!!document.querySelector('.ss-found-katex .katex')}));
   check('chapter'+ch+'-render-after-switch',layout.stage&&layout.predict&&layout.pair&&layout.explain&&layout.canvases>0&&layout.math,layout);
   const slider=page.locator(ch===1?'#controls input[type=range]':'#content input[type=range]').first();
   if(await slider.count()){await slider.evaluate(el=>{el.value=String((Number(el.min)+Number(el.max))/2);el.dispatchEvent(new Event('input',{bubbles:true}))});await page.waitForTimeout(230)}
   // Full foundational chapter audit: every authored experiment must retain
   // its controls, plots, core equation, prediction and guided explanation.
   const lessonResults=[];
   for(let lesson=0;lesson<count;lesson++){
     await nav.nth(lesson).click();
     await page.waitForTimeout(130);
     const content=await page.evaluate(ch=>({
      title:(document.querySelector('#title')||document.querySelector('#content .heading h2'))?.textContent,
      stage:!!document.querySelector('.ss-found-four-step'),
      predict:!!document.querySelector('.ss-found-predict .ss-found-intro')?.textContent.trim(),
      controls:document.querySelectorAll('#controls input,#controls select,#content .ss-found-controls input,#content .ss-found-controls select').length,
      graphs:document.querySelectorAll('canvas').length,
      keyFormula:!!document.querySelector('.ss-found-katex .katex'),
      guided:!!document.querySelector(ch===1?'#step-text':'#derivationPanel .deriv-step'),
      nextChapter:!!document.querySelector('.ss-found-explain a.ss-bridge-link'),
      hasReferenceError:document.body.textContent.includes('ReferenceError:')
     }),ch);
     lessonResults.push({lesson:lesson+1,...content});
     const c=page.locator(ch===1?'#controls input[type=range]':'#content .ss-found-controls input[type=range]').first();
     if(await c.count())await c.evaluate(el=>{el.value=el.max;el.dispatchEvent(new Event('input',{bubbles:true}))});
     if(ch>1){
      const all=page.locator('#allSteps');
      if(await all.count()){await all.click();await page.waitForTimeout(45);
       const steps=await page.locator('#derivationPanel .deriv-step').count();
       if(steps!==4)lessonResults[lesson].guided=false;
      }
     }
   }
   const bad=lessonResults.filter(x=>!x.title||!x.stage||!x.predict||!x.controls||!x.graphs||!x.keyFormula||!x.guided||!x.nextChapter||x.hasReferenceError);
   check('chapter'+ch+'-every-lab-functional',bad.length===0,{tested:lessonResults.length,failures:bad});
   if(ch===1){
    const toc=await page.locator('#ch1-app>.sidebar').evaluate(el=>({display:getComputedStyle(el.querySelector('nav#nav')).display,position:getComputedStyle(el).position}));
    check('chapter1-left-TOC',toc.display==='flex'&&toc.position==='sticky',toc);
   }
   await page.locator('[data-els-theme-picker]').first().selectOption('warm-neutral');
   const theme=await page.evaluate(()=>document.documentElement.dataset.elsTheme);
   check('chapter'+ch+'-theme-switch',theme==='warm-neutral',{theme});
  }
  check('chapter'+ch+'-no-js-errors',errors.length===0,errors.slice(0,6));
  await page.screenshot({path:'qa-continuity/chapter'+ch+'.png',fullPage:false});
  await page.close();
 }
 const bridgeCases=[
  ['chapter5.html?lab=rc','From analog RC to digital IIR'],
  ['chapter6.html?lab=periodic','Digital periodicity'],
  ['chapter7.html#lab=3','CT ambiguity'],
  ['chapter8.html#lab=6','From phasors']
 ];
 for(const [route,phrase] of bridgeCases){
  const page=await browser.newPage({viewport:{width:1350,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(BASE+route,{waitUntil:'load',timeout:50000});
  await page.waitForTimeout(900);
  const sections=await page.locator('.ss-learning-bridge').allTextContents();
  check('bridge-'+route,sections.some(x=>x.includes(phrase)),{count:sections.length,head:sections[0]?.slice(0,140)});
  check('bridge-'+route+'-errors',errors.length===0,errors.slice(0,4));
  if(route.includes('lab=rc')){
   const input=page.locator('.ss-bridge-rc input[type=range]').first();check('rc-IIR-interactive',await input.count()===1);
   if(await input.count()){await input.evaluate(el=>{el.value='2.0';el.dispatchEvent(new Event('input',{bubbles:true}))});const value=await page.locator('.ss-bridge-rc-readout').textContent();check('rc-IIR-coefficient-recomputed',value.includes('0.9048'),{value})}
  }
  await page.close();
 }
 const page=await browser.newPage();await page.goto(BASE+'index.html#chapter=2',{waitUntil:'domcontentloaded',timeout:50000});await page.waitForTimeout(550);check('index-ch2-standalone-route',page.url().includes('chapter2.html'),{url:page.url()});await page.close();
}catch(e){check('runner',false,String(e.stack||e))}finally{if(browser)await browser.close();if(server)server.kill()}
const failures=results.filter(x=>!x.passed),report={status:failures.length?'FAIL':'PASS',total:results.length,failures,results};
writeFileSync('qa-continuity/results.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({status:report.status,total:report.total,failed:failures.length,examples:failures.slice(0,6)},null,2));
if(failures.length)process.exitCode=1;
