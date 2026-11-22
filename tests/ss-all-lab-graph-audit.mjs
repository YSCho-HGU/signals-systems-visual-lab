/* Exhaustive Signals & Systems lesson graph presentation audit, Ch 1–8.
 * Walk each native lab, verify plots and legends without changing physics.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {writeFileSync,mkdirSync} from 'node:fs';
const base=process.env.SS_BASE_URL||'http://127.0.0.1:8790/';
const server=process.env.SS_BASE_URL?null:spawn('python3',['-m','http.server','8790','--bind','127.0.0.1'],{stdio:'ignore'});
const browser=await chromium.launch({headless:true});
const logs=[];const folder='qa-graph-content';mkdirSync(folder,{recursive:true});
const selectors={1:'#ch1-app #nav button',2:'#app .sidebar .nav button',3:'#app .sidebar .nav button',
 4:'#app .sidebar .nav button',5:'#tabs button',6:'#app .sidebar .nav button',
 7:'#ss7-lesson-nav button',8:'#nav button'};
function check(ok,item,details=''){logs.push({pass:!!ok,item,details});console.log((ok?'PASS ':'FAIL ')+item+(details?' '+details:''))}
try{
 if(server)await new Promise(r=>setTimeout(r,1200));
 for(let ch=1;ch<=8;ch++){
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  page.on('pageerror',err=>check(false,'ch'+ch+'-runtime',err.message));
  await page.addInitScript(()=>{
   try{localStorage.setItem('els-theme-v2','neutral-dark');localStorage.setItem('ss-sidebar-collapsed-v1','0')}catch{}
  });
  try{
   await page.goto(base+'chapter'+ch+'.html',{waitUntil:'load',timeout:40000});
   await page.waitForFunction(()=>!!window.SSGraphMath,{timeout:10000});
   const buttons=page.locator(selectors[ch]);const count=await buttons.count();
   check(count>=5,'ch'+ch+'-lab-navigation-count',String(count));
   for(let index=0;index<count;index++){
    try{
     await buttons.nth(index).click({timeout:8000});
     await page.waitForTimeout(95);
     const a=await page.evaluate(()=>{
      const plots=[...document.querySelectorAll('.plot-card svg,.figure canvas,.plotbox canvas')]
        .filter(e=>e.getBoundingClientRect().width>120&&e.getBoundingClientRect().height>90);
      const labels=[...document.querySelectorAll('.ss-graph-axis-math')].filter(e=>e.isConnected);
      const legend=[...document.querySelectorAll('.plot-card .legend,.figure .legend,.plotbox .legend')]
        .filter(e=>e.getBoundingClientRect().width>0);
      const axis=[...document.querySelectorAll('.axis-key')].filter(e=>e.textContent.trim().length>0);
      const allText=[...document.querySelectorAll('.plot-card .plot-title,.figure h3,.plotbox h3')]
        .map(e=>e.textContent.trim());
      return{plots:plots.length,labels:labels.length,legend:legend.length,axis:axis.length,
        missingTitle:allText.some(t=>!t),titles:allText.slice(0,3),
        rawMath:labels.filter(e=>!e.querySelector('.katex')).length,
        badAxes:axis.some(e=>/\b(?:undefined|NaN)\b/.test(e.textContent)),
        legendFont:legend.map(e=>parseFloat(getComputedStyle(e).fontSize)).filter(Number.isFinite).slice(0,3)};
     });
     check(a.plots>=1,'ch'+ch+'-lab'+(index+1)+'-plots-render',JSON.stringify(a));
     check(!a.missingTitle&&!a.badAxes,'ch'+ch+'-lab'+(index+1)+'-axis-and-titles');
     check(a.rawMath===0,'ch'+ch+'-lab'+(index+1)+'-math-labels-typeset',String(a.labels));
     if(ch===5&&index===0){
      check(a.labels>=2,'ch5-integration-formula-on-axis',String(a.labels));
     }
    }catch(err){check(false,'ch'+ch+'-lab'+(index+1)+'-interaction',String(err))}
   }
   await page.screenshot({path:folder+'/chapter'+ch+'-last-lab.png'});
  }finally{await page.close()}
 }
}finally{await browser.close();if(server)server.kill()}
writeFileSync(folder+'/results.json',JSON.stringify(logs,null,2));
const fails=logs.filter(l=>!l.pass);
console.log('All-lab graph content QA: '+(logs.length-fails.length)+'/'+logs.length+' passed');
assert.equal(fails.length,0,fails.map(x=>x.item).join(', '));
