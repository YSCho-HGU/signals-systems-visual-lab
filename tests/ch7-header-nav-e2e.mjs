#!/usr/bin/env node
/* Chapter 7 restored working-state regression: load and seven legacy lab controls. */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
const base=process.env.SS_BASE_URL||'http://127.0.0.1:8766/';
const out='qa-ch7';mkdirSync(out,{recursive:true});
const server=process.env.SS_BASE_URL?null:spawn('python3',['-m','http.server','8766','--bind','127.0.0.1'],{stdio:'ignore'});
if(server)await new Promise(r=>setTimeout(r,1200));
const browser=await chromium.launch({headless:true});
const tests=[],errors=[];
function check(condition,label,detail){tests.push({label,pass:Boolean(condition),detail});if(!condition)console.error('FAIL',label,detail||'');else console.log('PASS',label)}
try{
 for(const viewport of [{width:1366,height:768},{width:390,height:844}]){
  const page=await browser.newPage({viewport,reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(String(e)));
  const size=String(viewport.width);
  await page.goto(base+'#chapter=7',{waitUntil:'commit',timeout:45000});
  await page.waitForFunction(()=>document.querySelector('#lab-frame')?.contentWindow?.SSChapter7?.experimentCount===7,null,{timeout:30000});
  const f=page.frameLocator('#lab-frame');
  check(await page.locator('.ss-common-header .ss-common-menu').count()===1,size+'-shared-header');
  check(await page.locator('#els-ss-chapter-title').innerText().then(s=>s.includes('Chapter 7')&&s.includes('Sampling')),size+'-chapter-title');
  check(await page.locator('#ss-language-select').count()===1&&await page.locator('#theme-select').count()===1,size+'-single-language-theme');
  check(await page.locator('.els-ss-chapter-links a').count()===8,size+'-chapter-titles');
  check(await page.locator('#ss-unified-nav').count()===1,size+'-outer-toc');
  check(await f.locator('#nav').count()===0,size+'-internal-nav-deleted');
  check(await f.locator('.ss-vertical-sidebar').count()===0,size+'-no-duplicate-sidebar');
  check(await f.locator('.ss7-stage-predict').count()===1,size+'-four-step-layout');
  const lang=page.locator('#ss-language-select');
  await lang.selectOption('en');
  check(await page.evaluate(()=>window.ELSLanguage?.get()==='en'),size+'-english');
  await lang.selectOption('mixed');
  const theme=page.locator('#theme-select');
  for(const value of ['white-clean','neutral-dark']){
   await theme.selectOption(value);
   check(await page.evaluate(()=>document.documentElement.dataset.elsTheme)===value,size+'-theme-'+value);
  }
  if(size==='390'&&await page.locator('#ss-unified-nav').evaluate(x=>x.classList.contains('collapsed')))
   await page.locator('#ss-unified-nav .ss-unified-toggle').click();
  for(let n=1;n<=7;n++){
   if(size==='390'&&await page.locator('#ss-unified-nav').evaluate(x=>x.classList.contains('collapsed'))) await page.locator('#ss-unified-nav .ss-unified-toggle').click();
   const button=page.locator('#ss-unified-nav .ss-unified-link').nth(n-1);
   await button.click();
   await page.waitForFunction(v=>document.querySelector('#lab-frame')?.contentWindow?.SSChapter7?.currentExperiment===v,n);
   const snapshot=await page.locator('#lab-frame').evaluate(iframe=>{
    const doc=iframe.contentDocument;
    return {plots:doc.querySelectorAll('#plots svg').length,title:doc.querySelector('#title')?.textContent||'',sliders:doc.querySelectorAll('#controls input[type=range]').length};
   });
   check(snapshot.plots>0&&snapshot.title.startsWith('7.'+n),size+'-lesson-'+n+'-plots-and-title',snapshot);
   if(snapshot.sliders){
    const changed=await page.locator('#lab-frame').evaluate(iframe=>{
     const win=iframe.contentWindow,doc=iframe.contentDocument,s=doc.querySelector('#controls input[type=range]');
     const before=doc.querySelector('#insight')?.textContent;
     const current=Number(s.value),step=Number(s.step)||1,max=Number(s.max),min=Number(s.min);
     s.value=String(current+step<=max?current+step:Math.max(min,current-step));
     s.dispatchEvent(new win.Event('input',{bubbles:true}));
     return {before,after:doc.querySelector('#insight')?.textContent};
    });
    check(changed.before!==changed.after,size+'-lesson-'+n+'-slider-recalculates');
   }
  }
  check(await page.locator('#ss-progress-panel').count()===1,size+'-single-progress');
  check(await page.locator('#ss-unified-nav #ss-progress-panel').count()===1,size+'-progress-in-host-sidebar');
  const toggled=await page.locator('#ss-progress-panel button').first().isEnabled();
  check(toggled,size+'-progress-enabled');
  const headerGeom=await page.locator('.els-ss-unified-header').evaluate(h=>({height:h.getBoundingClientRect().height,overflow:document.documentElement.scrollWidth-innerWidth}));
  check(headerGeom.height<=90,size+'-compact-header',headerGeom);
  await page.screenshot({path:out+'/chapter7-'+size+'.png'});
  await page.close();
 }
 // Cross-chapter shared header regression: Chapter 5, Chapter 6, and integrated Chapter 7.
 for(const [chapter,path,selector] of [[5,'chapter5.html','.ss5-site-header'],[6,'chapter6.html','.ss6-site-header']]){
  const p=await browser.newPage({viewport:{width:1366,height:768}});
  p.on('pageerror',e=>errors.push('chapter '+chapter+': '+String(e)));
  await p.goto(new URL(path,base).href,{waitUntil:'domcontentloaded',timeout:45000});
  check(await p.locator(selector).count()===1,'chapter-'+chapter+'-single-header');
  check(await p.locator('.ss-common-header .ss-common-menu').count()===1,'chapter-'+chapter+'-shared-menu');
  check(await p.locator('.ss-common-header .ss-common-actions').count()===1,'chapter-'+chapter+'-shared-actions');
  await p.locator('.ss-common-title').click();
  check(await p.locator('.ss-common-menu').evaluate(el=>el.open),'chapter-'+chapter+'-dropdown-opens');
  check(await p.locator('.ss-common-links a[aria-current="page"]').count()===1,'chapter-'+chapter+'-current-link');
  check(await p.locator('header details summary').count()>=1,'chapter-'+chapter+'-chapter-dropdown');
  check(await p.locator('header select').count()>=2,'chapter-'+chapter+'-language-theme');
  await p.close();
 }
 check(errors.length===0,'no-uncaught-page-errors',errors);
}finally{await browser.close();server?.kill();writeFileSync(out+'/results.json',JSON.stringify({tests,errors},null,2))}
const failed=tests.filter(x=>!x.pass);
console.log('RESULT',tests.length-failed.length,'/',tests.length);
if(failed.length)process.exitCode=1;
