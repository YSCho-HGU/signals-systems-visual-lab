/* Plot label and visual consistency regression for Chapters 1–8.
 * Uses a local HTTP server and Chromium just like ss-navigation-visual-e2e.
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
const base=process.env.SS_BASE_URL||'http://127.0.0.1:8789/';
const own=!process.env.SS_BASE_URL;
const server=own?spawn('python3',['-m','http.server','8789','--bind','127.0.0.1'],{stdio:'ignore'}):null;
const folder='qa-graph-math';mkdirSync(folder,{recursive:true});
if(own)await new Promise(r=>setTimeout(r,1200));
const browser=await chromium.launch({headless:true});
const results=[];
function record(ok,label,extra=''){results.push({ok:!!ok,label,extra});console.log((ok?'PASS ':'FAIL ')+label+(extra?' '+extra:''))}
const themes=['neutral-dark','warm-dark','navy-dark','warm-neutral','white-clean'];
try{
 for(const theme of themes){
  for(let chapter=1;chapter<=8;chapter++){
   const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
   page.on('pageerror',e=>record(false,'ch'+chapter+'-'+theme+'-runtime',e.message));
   await page.addInitScript((value)=>{try{localStorage.setItem('els-theme-v2',value);localStorage.setItem('ss-sidebar-collapsed-v1','0')}catch{}},theme);
   try{
    await page.goto(base+'chapter'+chapter+'.html',{waitUntil:'load',timeout:40000});
    await page.waitForFunction(()=>typeof window.SSGraphMath==='object',{timeout:10000});
    await page.waitForTimeout(300);
    const data=await page.evaluate(()=>{
     const overlays=[...document.querySelectorAll('.ss-graph-axis-math')].filter(el=>el.getBoundingClientRect().width>0);
     const math=overlays.filter(el=>!!el.querySelector('.katex'));
     const graph=[...document.querySelectorAll('.plot-card svg,.figure canvas,.plotbox canvas')].filter(el=>el.getBoundingClientRect().width>150);
     const host=document.querySelector('.plot-card,.figure,.plotbox');
     const css=host?getComputedStyle(host):null;
     return {overlays:overlays.length,typeset:math.length,graphs:graph.length,
      first:math.slice(0,4).map(e=>e.dataset.ssFormula),
      mismatch:math.filter(e=>e.getBoundingClientRect().left<0||e.getBoundingClientRect().right>innerWidth+20).length,
      computedFont:css?.fontSize,background:css?.backgroundColor,
      fallback:typeof window.katex?.render==='function'};
    });
    record(data.graphs>=1,'ch'+chapter+'-'+theme+'-graph-present',JSON.stringify(data));
    record(data.fallback,'ch'+chapter+'-'+theme+'-katex-ready');
    record(data.typeset>=1,'ch'+chapter+'-'+theme+'-axis-math-present',JSON.stringify(data.first));
    record(data.mismatch===0,'ch'+chapter+'-'+theme+'-axis-math-within-screen');
    if(chapter===5){
     const special=await page.evaluate(()=>[...document.querySelectorAll('.ss-graph-axis-math')].map(e=>e.dataset.ssFormula||''));
     record(special.includes('∫₀ᵀ e^(−σt)dt'),'ch5-'+theme+'-integral-axis-typeset',JSON.stringify(special));
     const caption=await page.locator('.figure .sub .katex').count();
     record(caption>=1,'ch5-'+theme+'-integral-caption-typeset',JSON.stringify({caption,subs:await page.locator('.figure .sub').allTextContents()}));
    }
    await page.screenshot({path:folder+'/chapter'+chapter+'-'+theme+'.png',fullPage:false});
   }catch(err){record(false,'ch'+chapter+'-'+theme+'-setup',String(err))}
   await page.close();
  }
 }
}finally{await browser.close();if(server)server.kill()}
writeFileSync(folder+'/results.json',JSON.stringify(results,null,2));
const failed=results.filter(x=>!x.ok);
console.log('Graph math visual QA: '+(results.length-failed.length)+'/'+results.length+' checks passed');
assert.equal(failed.length,0,'Graph math regressions: '+failed.map(x=>x.label).join(', '));
