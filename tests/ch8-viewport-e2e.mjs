#!/usr/bin/env node
/* Chapter 8 no-iframe UI regression: mathematical plots, 8 experiments,
 * 32 KaTeX derivations, shared theme/sidebar/navigation, desktop/mobile. */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const BASE=process.env.SS_BASE_URL||'http://127.0.0.1:8878/';
const errors=[],results=[],failures=[];let server,browser;
function check(name,ok,info){const value={name,pass:!!ok,info};results.push(value);if(!ok)failures.push(value)}
function read(page){return page.evaluate(()=>{
 const root=document.documentElement;
 const rect=q=>document.querySelector(q)?.getBoundingClientRect().toJSON();
 return {
  chapter:window.SSChapter8?.currentExperiment||0,
  labs:document.querySelectorAll('#nav [data-exp]').length,
  iframe:document.querySelectorAll('iframe').length,
  stages:document.querySelectorAll('.ss8-stage-head').length,
  svg:document.querySelectorAll('#plots .plot-card svg').length,
  traces:document.querySelectorAll('#plots svg polyline,#plots svg path').length,
  header:rect('.ss8-site-header'),sidebar:rect('.ss8-sidebar'),
  change:rect('.ss8-stage-change'),observe:rect('.ss8-stage-observe'),
  pair:rect('.ss8-stage-pair'),explain:rect('.ss8-stage-explain'),
  key:document.querySelectorAll('#ss8-key-equation .katex').length,
  steps:document.querySelectorAll('#step-content .step .math .katex').length,
  active:document.querySelectorAll('#nav button.active').length,
  width:document.documentElement.scrollWidth,viewport:innerWidth,
  theme:root.dataset.elsTheme,mathAudited:window.__ss8MathAudit?.formulas
 }});
}
try{
 if(!process.env.SS_BASE_URL){
  server=spawn('python3',['-m','http.server','8878','--bind','127.0.0.1'],{stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1100));
 }
 browser=await chromium.launch({headless:true});
 for(const width of [390,900,1280,1440]){
  const page=await browser.newPage({viewport:{width,height:840},deviceScaleFactor:1,reducedMotion:'reduce'});
  const runtime=[];page.on('pageerror',e=>runtime.push(e.message));
  await page.goto(BASE+'chapter8.html',{waitUntil:'load',timeout:45000});
  await page.waitForFunction(()=>window.__ss8Native?.ready&&window.SSChapter8?.experimentCount===8,{timeout:20000});
  await page.waitForFunction(()=>document.querySelectorAll('#ss8-key-equation .katex').length===1&&document.querySelectorAll('#step-content .step .math .katex').length===1,{timeout:18000});
  const initial=await read(page);
  check(width+' native Chapter 8 startup',initial.labs===8&&initial.stages===4&&initial.iframe===0&&initial.svg>0&&initial.traces>0&&initial.key===1&&initial.mathAudited===32,initial);
  check(width+' initial page width',initial.width<=width+6,initial);
  check(width+' shared chapter menu',await page.locator('.ss-common-links a').count()===8);
  for(const theme of ['white-clean','neutral-dark']){
   await page.locator('#ss8-theme-picker').selectOption(theme);
   check(width+' selected theme '+theme,await page.evaluate(()=>document.documentElement.dataset.elsTheme)===theme);
   for(let lesson=1;lesson<=8;lesson++){
    await page.locator('#nav button[data-exp]').nth(lesson-1).click();
    await page.waitForFunction(n=>window.SSChapter8?.currentExperiment===n,lesson,{timeout:9000});
    await page.waitForFunction(()=>document.querySelectorAll('#ss8-key-equation .katex').length===1&&document.querySelectorAll('#step-content .step .math .katex').length===1,{timeout:9000});
    const snap=await read(page);
    check(width+'/'+theme+'/8.'+lesson+' 4 stages and graphs',
       snap.chapter===lesson&&snap.labs===8&&snap.stages===4&&snap.svg>0&&snap.traces>0&&snap.key===1&&snap.steps===1&&snap.active===1,snap);
    check(width+'/'+theme+'/8.'+lesson+' page fits viewport',snap.width<=width+6,snap.width);
    if(width>780)check(width+'/'+theme+'/8.'+lesson+' paired stage alignment',
      !!(snap.change&&snap.observe)&&Math.abs(snap.change.y-snap.observe.y)<10&&snap.change.x<snap.observe.x,snap);
    else check(width+'/'+theme+'/8.'+lesson+' mobile stacked stages',
      !!(snap.change&&snap.observe)&&snap.observe.y>=snap.change.y+snap.change.height-8,snap);
    check(width+'/'+theme+'/8.'+lesson+' explanation below pair',
      snap.explain?.y>=snap.pair?.y+snap.pair?.height-10,snap);
    for(let step=2;step<=4;step++){
      await page.locator('#next').click();
      await page.waitForFunction(n=>document.querySelector('#step-num')?.textContent?.includes('Step '+n+' /')&&document.querySelectorAll('#step-content .step .math .katex').length===1,step,{timeout:8000});
      check(width+'/'+theme+'/8.'+lesson+' math derivation '+step,await page.locator('#step-content .step .math .katex').count()===1);
    }
    await page.locator('#all').click();
    await page.waitForFunction(()=>document.querySelectorAll('#step-content .step .math .katex').length===4,{timeout:8000});
    check(width+'/'+theme+'/8.'+lesson+' all 4 equations',await page.locator('#step-content .step .math .katex').count()===4);
    const slider=page.locator('#controls input[type="range"]').first();
    if(await slider.count()){
      const before=await page.locator('#insight').innerText();
      await slider.evaluate(el=>{el.value=el.value===el.max?el.min:el.max;el.dispatchEvent(new Event('input',{bubbles:true}))});
      await page.waitForFunction(text=>document.querySelector('#insight')?.innerText!==text,before,{timeout:8000});
      const after=await read(page);
      check(width+'/'+theme+'/8.'+lesson+' responsive numerical graphs',after.svg>0&&after.traces>0&&after.key===1&&after.steps===4,after);
    }
    if(width===1280&&theme==='neutral-dark'){
      mkdirSync('qa-ch8/screens',{recursive:true});
      await page.screenshot({path:'qa-ch8/screens/lab-8-'+lesson+'.png',fullPage:false});
    }
   }
  }
  check(width+' no unhandled browser errors',runtime.length===0,runtime);
  if(width===1280){
   await page.locator('#nav button[data-exp]').first().click();
   await page.locator('#ss8-mark-reviewed').click();
   check('8:1 progress saved',await page.evaluate(()=>JSON.parse(localStorage.getItem('els-ss-lab-progress-v1')||'[]').includes('8:1')));
   await page.reload();await page.waitForFunction(()=>window.__ss8Native?.ready);
   check('progress survived page reload',await page.locator('#ss8-mark-reviewed').getAttribute('aria-pressed')==='true');
   await page.locator('#ss8-mark-reviewed').click();
   const toggle=page.locator('.ss8-sidebar .ss-side-toggle');
   if(await toggle.count()){
    await toggle.click();
    check('shared sidebar collapse control',await page.evaluate(()=>document.documentElement.dataset.ssSidebar)==='collapsed');
    await toggle.click();
   }else check('shared sidebar collapse control',false,'No collapse button');
  }
  errors.push(...runtime.map(error=>({width,error})));
  await page.close();
 }
}finally{
 if(browser)await browser.close();
 if(server)server.kill();
 mkdirSync('qa-ch8',{recursive:true});
 writeFileSync('qa-ch8/report.json',JSON.stringify({total:results.length,passed:results.length-failures.length,failures,errors},null,2));
 console.log(JSON.stringify({total:results.length,passed:results.length-failures.length,failures,errors},null,2));
 if(failures.length||errors.length)process.exitCode=1;
}