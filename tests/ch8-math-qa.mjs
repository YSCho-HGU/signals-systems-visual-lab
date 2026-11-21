#!/usr/bin/env node
/* Chapter 8 math QA — browser, not source-string checks.
 * Test each lab in both step modes, plus both 8.2 signal directions.
 * Screenshots and a JSON report are retained for investigation.
 */
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const PORT=8889;
const BASE=process.env.SS_BASE_URL||'http://127.0.0.1:'+PORT+'/';
const OUT=process.env.SS_QA_DIR||'qa-ch8-math';
mkdirSync(OUT,{recursive:true});
const findings=[],pageErrors=[];
let browser,server;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function check(id,passed,detail){
 findings.push({id,passed:!!passed,detail});
 console.log((passed?'PASS ':'FAIL ')+id+(passed?'':' '+JSON.stringify(detail).slice(0,500)));
}
async function snapshot(page){
 return page.evaluate(()=>{
  const report=window.__ss8MathAudit?.visible?.();
  const key=document.querySelector('#ss8-key-equation');
  const steps=[...document.querySelectorAll('#step-content .step .math')];
  const math=[...document.querySelectorAll('[data-ss-math],[data-latex]')];
  return {
   ready:!!window.SSMathCore&&!!window.__ss8MathAudit,
   report,
   key:{rendered:!!key?.querySelector('.katex'),source:key?.getAttribute('data-ss-math')||''},
   steps:steps.map(el=>({rendered:!!el.querySelector('.katex'),
     source:el.getAttribute('data-ss-math')||'',html:el.innerHTML.slice(0,45)})),
   expected:math.length,
   katexCount:math.filter(el=>!!el.querySelector('.katex')).length,
   blanks:math.filter(el=>!(el.textContent||'').trim()).length,
   errors:math.filter(el=>el.dataset.ssMathState==='error'||el.querySelector('.katex-error')).length,
   untypeset:math.filter(el=>el.dataset.ssMathState!=='rendered').map(el=>({
     text:el.textContent.slice(0,60),source:(el.getAttribute('data-latex')||el.getAttribute('data-ss-math')||'').slice(0,60)
   }))
  };
 });
}
try{
 if(!process.env.SS_BASE_URL){
  server=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{stdio:'ignore'});
  await wait(1300);
 }
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 page.on('pageerror',e=>pageErrors.push(String(e)));
 await page.goto(BASE+'chapter8.html#lab=1',{waitUntil:'load',timeout:45000});
 await page.waitForFunction(()=>window.SSMathCore&&window.__ss8MathAudit&&window.katex?.render,{timeout:20000});
 const catalogue=await page.evaluate(()=>window.__ss8MathAudit.catalogue());
 check('formula-catalogue',catalogue.passed,catalogue);
 for(let n=1;n<=8;n++){
  await page.evaluate(n=>window.SSChapter8.openExperiment(n),n);
  await page.waitForFunction(n=>window.__ss8MathAudit?.status?.lesson===n,n);
  await page.evaluate(()=>window.SSMathCore.renderNow());
  await page.evaluate(()=>window.__ss8ProseMath?.scan?.());
  await page.evaluate(()=>window.SSMathCore.renderNow());
  const prose=await page.evaluate(()=>window.__ss8ProseMath?.audit?.()||null);
  check('8.'+n+'-prose-inline-math',!!prose&&prose.visible>0&&prose.failures.length===0&&prose.conversionErrors.length===0,prose);
  const one=await snapshot(page);
  check('8.'+n+'-default',one.report?.passed&&one.key.rendered&&
    one.steps.length===1&&one.steps[0].rendered&&one.blanks===0&&one.errors===0,one);
  await page.locator('#all').click();
  await page.evaluate(()=>window.SSMathCore.renderNow());
  const all=await snapshot(page);
  check('8.'+n+'-four-guided-equations',all.report?.passed&&all.steps.length===4&&
   all.steps.every(st=>st.rendered)&&all.blanks===0&&all.errors===0,all);
  if(n===4){
   const background=await page.evaluate(()=>({math:document.querySelectorAll('#ss8-predict-question .katex').length,
    factor:document.getElementById('ss8-predict-question')?.textContent.includes('A')||false}));
   check('8.4-background-typeset',background.math>0,background);

   check('8.4-input-factored-equation',all.key.source.includes('(1-az^{-1})(1-bz^{-1})')&&
    all.key.source.includes('\\frac{A}{1-az^{-1}}')&&all.katexCount>=6,all);
  }
  if(n===2){
   for(const direction of ['right','left']){
    await page.locator('#ctl-direction').selectOption(direction);
    await page.evaluate(()=>window.SSMathCore.renderNow());
    const changed=await snapshot(page);
    check('8.2-'+direction+'-math-change',changed.report?.passed&&
       changed.key.source.includes(direction==='right'?'|z|>0.8':'|z|<0.8')&&
       changed.steps.length===4&&changed.steps.every(x=>x.rendered)&&
       changed.blanks===0&&changed.errors===0,changed);
    await page.screenshot({path:join(OUT,'8-2-'+direction+'.png'),fullPage:false});
   }
  }
  await page.screenshot({path:join(OUT,'8-'+n+'.png'),fullPage:false});
  await page.locator('#all').click();
 }
 // Verify transitions do not leave blank or stale equations in the DOM.
 await page.evaluate(()=>window.SSChapter8.openExperiment(2));
 await page.locator('#ctl-direction').selectOption('left');
 await page.evaluate(()=>window.SSMathCore.renderNow());
 await page.evaluate(()=>window.SSChapter8.openExperiment(4));
 await page.evaluate(()=>window.SSMathCore.renderNow());
 const after=await snapshot(page);
 check('switch-8.2-to-8.4-no-stale-source',after.report?.passed&&
     after.key.source.includes('(1-az^{-1})(1-bz^{-1})'),after);
 check('no-browser-pageerrors',pageErrors.length===0,pageErrors);
 await page.close();
}catch(e){
 findings.push({id:'runner',passed:false,detail:String(e.stack||e)});
 console.error('FAIL runner',e);
}finally{
 if(browser)await browser.close();
 if(server)server.kill();
}
const failures=findings.filter(x=>!x.passed);
const report={status:failures.length?'FAIL':'PASS',total:findings.length,
 failures,findings,pageErrors};
writeFileSync(join(OUT,'results.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({status:report.status,total:report.total,failures:failures.slice(0,12)},null,2));
if(failures.length)process.exitCode=1;
